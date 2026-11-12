// @api translate one record's fields without exposing the model key
import { NextRequest, NextResponse } from "next/server"
import { requireRoles } from "@/lib/auth/require-roles"
import { PROTECTED_GROUP_ROLES } from "@/lib/roles"
import { openAiKey } from "@/lib/openai-key"
import { readOpenAiResponse, readOpenAiException, logOpenAiError } from "@/lib/openai-error.cjs"
import { openAiRefusal } from "@/lib/i18n/openai-error.i18n"
import { recordOk, recordRefusal } from "@/lib/usage-ledger.cjs"

// Перевод полей записи — дверь для диалога добавления переводов.
//
// 🔒 ОТДЕЛЬНАЯ ДВЕРЬ, А НЕ ВЫЗОВ ИЗ КОМПОНЕНТА. Ключ OpenAI не попадает в
// браузер ни при каких обстоятельствах: всё, что уходит клиенту, читается любым
// посетителем через вкладку разработчика.
//
// 🔒 МОДЕЛЬ ЗАШИТА ЗДЕСЬ, и это решение владельца: выбирать модель ради перевода
// одного слова — работа вместо ценности. Меняется она в одном месте — этой
// строке.
//
// БЫСТРАЯ, А НЕ РАССУЖДАЮЩАЯ. Перевод — преобразование, а не размышление:
// рассуждающая модель обдумывает каждую строку и платит за это временем и
// токенами владельца. Замер 2026-08-11: прогон двух словарей на 81 язык через
// gpt-5 занял больше двадцати минут там, где хватало минут.
//
// Имя модели сверено с живым списком ключа (2026-08-11): у него есть gpt-5,
// gpt-5-mini, gpt-5-nano, gpt-5-pro. Версии 5.1 в списке НЕТ — зашитое имя
// несуществующей модели даёт отказ на первом же переводе, и отказ этот
// достаётся владельцу, а не тому, кто её вписал. Меняя модель, сверяйтесь со
// списком: /api/openai-models отдаёт его живым.
//
// Роль проверяется: перевод стоит денег ровно как расшифровка речи.

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const MODEL = "gpt-5-mini"
const API = "https://api.openai.com/v1/chat/completions"

type Body = {
  /** Поля как есть: { name: "Apple", description: "…" }. */
  texts?: Record<string, string>
  /** Язык исходных значений. */
  from?: string
  /** Языки, на которые переводим. */
  to?: string[]
  /** Node step 726-2: the language of the page that asks — the refusal's words are chosen here, on the server. */
  uiLang?: string
}

export async function POST(req: NextRequest) {
  const denied = await requireRoles(req, PROTECTED_GROUP_ROLES.staff)
  if (denied) return denied

  const key = openAiKey()
  // Причина отказа называется КОДОМ, а не прозой: интерфейс по нему показывает
  // нужную подсказку со ссылкой, а не общее «не удалось», после которого
  // человеку некуда идти.
  if (!key) return NextResponse.json({ error: "no-key" }, { status: 503 })

  const body = (await req.json().catch(() => null)) as Body | null
  const texts = body?.texts ?? {}
  const from = body?.from ?? "en"
  const to = (body?.to ?? []).filter(l => l && l !== from)
  const uiLang = typeof body?.uiLang === "string" ? body.uiLang : from
  if (!Object.keys(texts).length || !to.length) {
    return NextResponse.json({ error: "texts and to are required" }, { status: 400 })
  }

  // Один запрос на ВСЕ языки и ВСЕ поля. Запрос на каждую пару «поле × язык» —
  // это десятки вызовов на одну запись: дороже, дольше и разваливается частично,
  // оставляя половину переводов.
  const prompt = [
    `Translate the values of this JSON object from ${from} into each of these languages: ${to.join(", ")}.`,
    `Return ONLY a JSON object shaped { "<lang>": { "<field>": "<translation>" } } with no commentary.`,
    `Keep the meaning and the register of the original. Do not translate proper names, product codes or URLs.`,
    `Source: ${JSON.stringify(texts)}`,
  ].join("\n")

  // Node step 726-2: every call writes one line of this element's ledger (`lib/usage-ledger.cjs`) — no prompt, no key.
  const call = { who: "i18n/translate", endpoint: "chat/completions", model: MODEL, started: Date.now() }
  try {
    const res = await fetch(API, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
      body: JSON.stringify({
        model: MODEL,
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
      }),
      signal: AbortSignal.timeout(120_000),
    })
    if (!res.ok) {
      // Разбираем ответ OpenAI: «кончились деньги» и «ключ не тот» — разные беды
      // с разными действиями, и человек обязан видеть, какая из них случилась.
      // Node step 726-2: read by the node's ONE reader of OpenAI's errors (`lib/openai-error.cjs`, the list from OpenAI's own guide —
      // the old reading here took `credit_balance_exhausted` for a rate limit). `error` keeps the reason (the dialog's contract),
      // `words`/`link` add the sentence and OpenAI's page to act on; OpenAI's own words go to the element's log.
      const info = await readOpenAiResponse(res)
      logOpenAiError("i18n/translate", info)
      recordRefusal({ ...call, info })
      const status = info.reason === "bad-key" ? 401 : info.reason === "no-funds" ? 402 : info.reason === "rate-limit" ? 429 : 502
      return NextResponse.json({ error: info.reason, ...openAiRefusal(uiLang, info.reason, info.link), upstreamStatus: res.status }, { status })
    }
    const data = await res.json()
    recordOk({ ...call, status: res.status, usage: data?.usage })
    const raw = data?.choices?.[0]?.message?.content ?? "{}"
    const parsed = JSON.parse(raw) as Record<string, Record<string, string>>

    // Отдаём только запрошенные языки и только запрошенные поля: модель иногда
    // добавляет от себя, и лишний ключ уехал бы в базу как настоящий перевод.
    const out: Record<string, Record<string, string>> = {}
    for (const lang of to) {
      const got = parsed[lang]
      if (!got) continue
      out[lang] = {}
      for (const field of Object.keys(texts)) {
        if (typeof got[field] === "string") out[lang][field] = got[field]
      }
    }
    return NextResponse.json({ translations: out })
  } catch (e) {
    // A thrown fetch is a timeout or the network; a thrown JSON.parse is the model's malformed answer — both named, never silent.
    const info = e instanceof SyntaxError ? null : readOpenAiException(e)
    if (info) { logOpenAiError("i18n/translate", info); recordRefusal({ ...call, info }) }
    const reason = info?.reason ?? "upstream"
    return NextResponse.json({ error: reason, ...openAiRefusal(uiLang, reason, info?.link) }, { status: 502 })
  }
}
