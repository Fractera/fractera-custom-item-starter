// @api the element's own agent card, limits and model switch for its Mini App
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
    const b = (await r.json().catch(() => null)) as { ok?: boolean; reason?: string; agent?: unknown; live?: boolean; context?: unknown; limits?: unknown } | null
    if (!r.ok || !b?.ok) return NextResponse.json({ ok: false, reason: b?.reason ?? `core-${r.status}` }, { status: 502, headers: NO_STORE })
    return NextResponse.json({ ok: true, agent: b.agent, live: b.live === true, context: b.context ?? null, limits: b.limits ?? null }, { headers: NO_STORE })
  } catch {
    return NextResponse.json({ ok: false, reason: "core-silent" }, { status: 502, headers: NO_STORE })
  }
}

// 840-4 (the owner, Telegram 954: «выбор модели … тоже появится»): the Mini App switches this element's OWN agent — Opus with its effort,
// Sonnet or Haiku; the core checks the choice and switches when the current turn ends (`POST /api/node/my-agent`, this element's key only).
export async function POST(req: NextRequest) {
  const who = await adminOfMiniApp(req)
  if (who !== 200) return NextResponse.json({ ok: false }, { status: who, headers: NO_STORE })
  const core = coreUrl()
  const key = process.env.SETTINGS_SECRET?.trim()
  if (!core || !key) return NextResponse.json({ ok: false, reason: "no-core" }, { status: 503, headers: NO_STORE })
  const body = (await req.json().catch(() => null)) as { model?: unknown; effort?: unknown } | null
  try {
    const r = await fetch(`${core}/api/node/my-agent`, {
      method: "POST",
      headers: { "x-node-key": key, "content-type": "application/json" },
      body: JSON.stringify({ model: body?.model, effort: body?.effort }),
      cache: "no-store",
      signal: AbortSignal.timeout(8_000),
    })
    const b = (await r.json().catch(() => null)) as { ok?: boolean; reason?: string; model?: string; effort?: string } | null
    return NextResponse.json(b?.ok ? { ok: true, model: b.model, effort: b.effort } : { ok: false, reason: b?.reason ?? `core-${r.status}` }, { status: b?.ok ? 200 : r.status === 409 ? 409 : 502, headers: NO_STORE })
  } catch {
    return NextResponse.json({ ok: false, reason: "core-silent" }, { status: 502, headers: NO_STORE })
  }
}
