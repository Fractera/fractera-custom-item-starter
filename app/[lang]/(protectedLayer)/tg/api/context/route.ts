// @api the Mini App section the person goes to the chat from
import { mkdirSync, writeFileSync } from "node:fs"
import { join } from "node:path"
import { NextRequest, NextResponse } from "next/server"
import { adminOfMiniApp } from "../../_libs/admin-only"

// «ПЕРЕЙТИ В ЧАТ» ИЗ РАЗДЕЛА (шаг узла 821; владелец, Telegram 434: «пробросить сообщения–подсказку для агента … пользователь перешёл в
// чат из раздела: мои проект/дело/соцсети/инстаграм»). POST `{ path: [заголовки], href }` — запись `SERVICE_DATA_DIR/tg-context.json` с
// временем; хук ядра (`lib/agent-kit/came-from.cjs`) 30 минут добавляет агенту строку «⟦node · came-from …⟧» перед словами человека.
export const dynamic = "force-dynamic"

const NO_STORE = { "Cache-Control": "no-store" }
const HREF = /^\/[a-z]{2}\/tg(\/[a-z0-9-]{1,60}){0,4}$/

export async function POST(req: NextRequest) {
  const who = await adminOfMiniApp(req)
  if (who !== 200) return NextResponse.json({ ok: false }, { status: who, headers: NO_STORE })
  const dir = process.env.SERVICE_DATA_DIR?.trim()
  if (!dir) return NextResponse.json({ ok: false, reason: "no-data-dir" }, { status: 503, headers: NO_STORE })
  let body: { path?: unknown; href?: unknown }
  try { body = await req.json() } catch { return NextResponse.json({ ok: false, reason: "bad-body" }, { status: 400, headers: NO_STORE }) }
  const path = Array.isArray(body.path) ? body.path.filter((p): p is string => typeof p === "string").map((p) => p.slice(0, 60)).slice(0, 6) : []
  const href = typeof body.href === "string" && HREF.test(body.href) ? body.href : null
  if (!path.length || !href) return NextResponse.json({ ok: false, reason: "bad-section" }, { status: 400, headers: NO_STORE })
  mkdirSync(dir, { recursive: true })
  writeFileSync(join(dir, "tg-context.json"), JSON.stringify({ path, href, at: new Date().toISOString() }) + "\n")
  return NextResponse.json({ ok: true }, { headers: NO_STORE })
}
