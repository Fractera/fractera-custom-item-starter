// @api the Mini App section the person goes to the chat from
import { mkdirSync, writeFileSync } from "node:fs"
import { join } from "node:path"
import { NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth/get-session"
import { sendTo } from "@/lib/cron/telegram"
import { adminOfMiniApp } from "../../_libs/admin-only"
import { chatLine } from "../../_libs/chat-line"

// «ПЕРЕЙТИ В ЧАТ» ИЗ РАЗДЕЛА (шаг узла 821; владелец, Telegram 434: «пробросить сообщения–подсказку для агента … пользователь перешёл в
// чат из раздела: мои проект/дело/соцсети/инстаграм»). POST `{ path: [заголовки], href }` — запись `SERVICE_DATA_DIR/tg-context.json` с
// временем; хук ядра (`lib/agent-kit/came-from.cjs`) 30 минут добавляет агенту строку «⟦node · came-from …⟧» перед словами человека.
// 840-4 (владелец, Telegram 947: «сообщения чата не содержит предустановленного сообщения а должно»): Telegram не даёт мини-приложению
// вписать текст в поле ввода (core.telegram.org/bots/webapps: только «@бот запрос» и sendData у кнопок клавиатуры) — поэтому свой бот
// элемента сам пишет строку «📍 Вы пришли из раздела: …» тому, кто нажал (его Telegram id — из билета мини-приложения, и только
// допущенному ботом). Агент своих сообщений бота не видит, поэтому строка-подсказка агенту остаётся.
export const dynamic = "force-dynamic"

const NO_STORE = { "Cache-Control": "no-store" }
// 852-7: a quiz node lives up to six segments down (`quiz/1/2/3/4/5`, depth 5).
const HREF = /^\/[a-z]{2}\/tg(\/[a-z0-9-]{1,60}){0,6}$/
export async function POST(req: NextRequest, { params }: { params: Promise<{ lang: string }> }) {
  const who = await adminOfMiniApp(req)
  if (who !== 200) return NextResponse.json({ ok: false }, { status: who, headers: NO_STORE })
  const dir = process.env.SERVICE_DATA_DIR?.trim()
  if (!dir) return NextResponse.json({ ok: false, reason: "no-data-dir" }, { status: 503, headers: NO_STORE })
  let body: { path?: unknown; href?: unknown; ask?: unknown }
  try { body = await req.json() } catch { return NextResponse.json({ ok: false, reason: "bad-body" }, { status: 400, headers: NO_STORE }) }
  const path = Array.isArray(body.path) ? body.path.filter((p): p is string => typeof p === "string").map((p) => p.slice(0, 60)).slice(0, 6) : []
  const href = typeof body.href === "string" && HREF.test(body.href) ? body.href : null
  const ask = typeof body.ask === "string" && body.ask.trim() ? body.ask.trim().slice(0, 400) : null
  if (!path.length || !href) return NextResponse.json({ ok: false, reason: "bad-section" }, { status: 400, headers: NO_STORE })
  mkdirSync(dir, { recursive: true })
  writeFileSync(join(dir, "tg-context.json"), JSON.stringify({ path, href, ...(ask ? { ask } : {}), at: new Date().toISOString() }) + "\n")
  const session = await getSession(req)
  const tg = session?.userId?.startsWith("telegram-") ? session.userId.slice("telegram-".length) : null
  const { lang } = await params
  const sent = tg ? await sendTo(tg, chatLine(lang, path, ask)) : { ok: false, detail: "not from Telegram" }
  if (!sent.ok) console.log(`[tg/context] the chat line not sent — ${sent.detail}`)
  return NextResponse.json({ ok: true, line: sent.ok }, { headers: NO_STORE })
}
