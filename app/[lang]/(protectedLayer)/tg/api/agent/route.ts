// @api the element's own agent card for its Mini App
import { NextRequest, NextResponse } from "next/server"
import { coreUrl } from "@/lib/a2a/log"
import { adminOfMiniApp } from "../../_libs/admin-only"

// СВОЙ АГЕНТ В MINI APP (шаг узла 821; макет v2 владельца — «идеально», Telegram 438): карточка агента этого элемента — работает,
// ждёт или спит, модель и усилие, своя подписка или узла, бот — и заполнение его окна контекста. Островок главной и экрана «Элемент»
// спрашивает здесь; дверь спрашивает ядро своим ключом (`GET /api/node/my-agent`) — ядро отвечает только о самом элементе.
export const dynamic = "force-dynamic"

const NO_STORE = { "Cache-Control": "no-store" }

export async function GET(req: NextRequest) {
  const who = await adminOfMiniApp(req)
  if (who !== 200) return NextResponse.json({ ok: false }, { status: who, headers: NO_STORE })
  const core = coreUrl()
  const key = process.env.SETTINGS_SECRET?.trim()
  if (!core || !key) return NextResponse.json({ ok: false, reason: "no-core" }, { status: 503, headers: NO_STORE })
  try {
    const r = await fetch(`${core}/api/node/my-agent`, { headers: { "x-node-key": key }, cache: "no-store", signal: AbortSignal.timeout(8_000) })
    const b = (await r.json().catch(() => null)) as { ok?: boolean; reason?: string; agent?: unknown; live?: boolean; context?: unknown } | null
    if (!r.ok || !b?.ok) return NextResponse.json({ ok: false, reason: b?.reason ?? `core-${r.status}` }, { status: 502, headers: NO_STORE })
    return NextResponse.json({ ok: true, agent: b.agent, live: b.live === true, context: b.context ?? null }, { headers: NO_STORE })
  } catch {
    return NextResponse.json({ ok: false, reason: "core-silent" }, { status: 502, headers: NO_STORE })
  }
}
