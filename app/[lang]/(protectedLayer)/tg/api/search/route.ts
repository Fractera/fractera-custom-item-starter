// @api the Mini App's search: the person's question goes to this element's own agent
import { existsSync } from "node:fs"
import { join } from "node:path"
import { NextRequest, NextResponse } from "next/server"
import { coreUrl } from "@/lib/a2a/log"
import { getSession } from "@/lib/auth/get-session"
import { elementDir } from "@/lib/cron/due"
import { sendTo } from "@/lib/cron/telegram"
import { elementId } from "@/lib/cron/wake"
import { adminOfMiniApp } from "../../_libs/admin-only"
import { searchAsk, searchLine } from "../../_libs/search-words"

// ПОИСК ИЗ MINI APP (шаг узла 841; владелец, Telegram 963: «нажатие на поиск закроют приложение откроет чат которому будет подставлен
// вопрос: пользователь хотел бы найти элемент который делает:…»). Telegram не даёт вписать текст в поле чата (core.telegram.org/bots/
// webapps), поэтому вопрос набирается в мини-приложении: POST `{ text }` → дверь ядра `/api/agents/wake` своим ключом будит СВОЕГО агента
// с вопросом (`reason: "mini-app-search"` — нажатие человека и есть согласие), а свой бот пишет в чат «🔎 Ищу: …». Агент отвечает в чате:
// в своей области — путь в «Проектах» и как; вне её — `npm run need`, и главный агент идёт по лестнице узла (братья, нативные, маркетплейс
// Fractera, Lagrix, навыки и память). Код говорит только со своим агентом (закон «только агенты говорят с агентами»).
export const dynamic = "force-dynamic"

const NO_STORE = { "Cache-Control": "no-store" }

export async function POST(req: NextRequest, { params }: { params: Promise<{ lang: string }> }) {
  const who = await adminOfMiniApp(req)
  if (who !== 200) return NextResponse.json({ ok: false }, { status: who, headers: NO_STORE })
  const body = (await req.json().catch(() => null)) as { text?: unknown } | null
  const q = typeof body?.text === "string" ? body.text.replace(/\s+/g, " ").trim() : ""
  if (q.length < 3 || q.length > 300) return NextResponse.json({ ok: false, reason: "text-3-300" }, { status: 400, headers: NO_STORE })
  const me = elementId()
  const core = coreUrl()
  const key = process.env.SETTINGS_SECRET?.trim()
  if (!me || !core || !key) return NextResponse.json({ ok: false, reason: "no-core" }, { status: 503, headers: NO_STORE })
  const { lang } = await params
  const word = existsSync(join(elementDir(), ".claude", "modes", "work.md")) ? "Working process:" : "Build process:"
  try {
    const r = await fetch(`${core}/api/agents/wake`, {
      method: "POST",
      headers: { "content-type": "application/json", "x-node-key": key },
      body: JSON.stringify({ service: me, from: me, reason: "mini-app-search", about: `search: ${q}`.slice(0, 300), text: searchAsk(word, q, lang) }),
      signal: AbortSignal.timeout(30_000),
    })
    const b = (await r.json().catch(() => ({}))) as { ok?: boolean; reason?: string }
    if (!b.ok) return NextResponse.json({ ok: false, reason: b.reason ?? `core-${r.status}` }, { status: 502, headers: NO_STORE })
  } catch {
    return NextResponse.json({ ok: false, reason: "core-silent" }, { status: 502, headers: NO_STORE })
  }
  const session = await getSession(req)
  const tg = session?.userId?.startsWith("telegram-") ? session.userId.slice("telegram-".length) : null
  const sent = tg ? await sendTo(tg, searchLine(lang, q)) : { ok: false, detail: "not from Telegram" }
  if (!sent.ok) console.log(`[tg/search] the chat line not sent — ${sent.detail}`)
  return NextResponse.json({ ok: true, line: sent.ok }, { headers: NO_STORE })
}
