import { openAiKey } from "@/lib/openai-key"
import type { DraftField, DraftResult } from "../types/fact-draft"
import { readOpenAiResponse, readOpenAiException, logOpenAiError } from "@/lib/openai-error.cjs"
import { openAiErrorWords } from "@/lib/i18n/openai-error.i18n"
import { recordOk, recordRefusal } from "@/lib/usage-ledger.cjs"

// СВОБОДНОЕ ОПИСАНИЕ → ТИПИЗИРОВАННЫЙ ЧЕРНОВИК (81-5).
//
// 🔒 ПЕРЕНОС ПРИЁМА ИЗ `socials-ai`, А НЕ ИЗОБРЕТЕНИЕ. Там человек говорит фразой
// про соцсеть и получает разобранную запись, которую подтверждает сам. Здесь то
// же самое, но схема полей приходит ПАРАМЕТРОМ — поэтому инструмент годится не
// одному потребителю, а любому.
//
// 🔒 СХЕМА ЕДЕТ В ПРОМПТ ИЗ ПАРАМЕТРА, А НЕ ЗАШИТА. Зашей я поля реестра —
// инструмент стал бы частью реестра, и второй потребитель начал бы копировать
// его целиком. Это ровно та ошибка, ради устранения которой в шаге 80 чат стал
// инструментом.
//
// 🛑 ЧЕГО ЗДЕСЬ НЕТ И НЕ БУДЕТ: исполнения кода. Модель возвращает ЗНАЧЕНИЯ
// полей, и ничего кроме. Текст от модели, попадающий в `eval`, — открытая дверь
// на сервер с ключами; запрет назван в 81-8 и действует уже здесь.

const MODEL = process.env.OPENAI_TEXT_MODEL ?? "gpt-4o-mini"
const MIN_WORDS = 3

/** Название языка для модели: она пишет ответ на языке владельца. */
function languageName(lang: string): string {
  try {
    return new Intl.DisplayNames(["en"], { type: "language" }).of(lang) ?? lang
  } catch {
    return lang
  }
}

function schemaLines(fields: readonly DraftField[]): string {
  return fields
    .map(f => {
      const allowed = f.oneOf?.length ? ` — one of: ${f.oneOf.join(", ")}` : ""
      const must = f.required ? " (REQUIRED)" : ""
      return `  "${f.name}": ${f.about}${allowed}${must}`
    })
    .join("\n")
}

/**
 * Разобрать описание по схеме.
 *
 * 🔒 ПРОВЕРЯЕМ ОТВЕТ МОДЕЛИ САМИ, ПО КАЖДОМУ ПОЛЮ. Она охотно вернёт значение
 * вне закрытого списка, пропустит обязательное поле или добавит своё — и всё это
 * будет выглядеть правдоподобно. Черновик, не прошедший проверку, отбрасывается
 * целиком: наполовину разобранная запись хуже отказа, потому что её сохранят.
 */
export async function draftFromWords(
  words: string,
  fields: readonly DraftField[],
  lang: string,
): Promise<DraftResult> {
  const key = openAiKey()
  // 🔒 НЕТ КЛЮЧА — ФАКТ, А НЕ ПОЛОМКА: форма продолжает работать руками.
  if (!key) return { ok: false, reason: "no-key" }

  const text = words.trim()
  if (text.split(/\s+/).filter(Boolean).length < MIN_WORDS) {
    return { ok: false, reason: "too-short" }
  }

  const system = [
    "You turn a person's free-form description into a machine record.",
    "",
    "Return STRICT JSON only, no prose. Exactly these keys and nothing else:",
    schemaLines(fields),
    '  "notes": one short sentence, in the person\'s language, saying what you assumed',
    "",
    "Rules that matter:",
    "- Never invent a field that is not listed above.",
    "- A field with a closed list takes ONLY a value from that list.",
    "- Machine names are latin lowercase, digits allowed, no spaces, no punctuation.",
    "- Human-facing values are written in " + languageName(lang) + ", the person's language.",
    '- If the description is not enough to fill the required fields, return {"understood": false}',
    "  and nothing else. Guessing is worse than refusing: a guessed record gets saved.",
  ].join("\n")

  // Node step 726-2: every call writes one line of this element's ledger (`lib/usage-ledger.cjs`) — no prompt, no key.
  const call = { who: "fact-draft", endpoint: "chat/completions", model: MODEL, started: Date.now() }
  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
      body: JSON.stringify({
        model: MODEL,
        temperature: 0,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: system },
          { role: "user", content: text.slice(0, 1200) },
        ],
      }),
      signal: AbortSignal.timeout(30_000),
    })
    if (!res.ok) {
      // Node step 726-2: why OpenAI refused, by the node's one reader — the form names it instead of «the model is silent».
      const info = await readOpenAiResponse(res)
      logOpenAiError("fact-draft", info)
      recordRefusal({ ...call, info })
      return { ok: false, reason: "model-silent", openai: info.reason, openaiWords: openAiErrorWords(lang, info.reason) }
    }

    const data = (await res.json()) as { choices?: { message?: { content?: string } }[]; usage?: unknown }
    recordOk({ ...call, status: res.status, usage: data.usage })
    const parsed = JSON.parse(data.choices?.[0]?.message?.content ?? "{}") as Record<string, unknown>
    if (parsed.understood === false) return { ok: false, reason: "not-understood" }

    const draft: Record<string, string> = {}
    for (const f of fields) {
      const raw = String(parsed[f.name] ?? "").trim()
      if (!raw) {
        if (f.required) return { ok: false, reason: "not-understood" }
        continue
      }
      // Закрытый список проверяем мы, а не модель.
      if (f.oneOf?.length && !f.oneOf.includes(raw)) {
        if (f.required) return { ok: false, reason: "not-understood" }
        continue
      }
      draft[f.name] = raw
    }

    return { ok: true, draft, notes: String(parsed.notes ?? "").trim() }
  } catch (e) {
    // A malformed answer of the model (JSON.parse) stays «silent»; a timeout or the network is named.
    if (e instanceof SyntaxError) return { ok: false, reason: "model-silent" }
    const info = readOpenAiException(e)
    logOpenAiError("fact-draft", info)
    recordRefusal({ ...call, info })
    return { ok: false, reason: "model-silent", openai: info.reason, openaiWords: openAiErrorWords(lang, info.reason) }
  }
}
