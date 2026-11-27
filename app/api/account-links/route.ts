// @api the shared entries of the account drawer, asked from the node core
import { NextRequest, NextResponse } from "next/server"
import { coreUrl } from "@/lib/a2a/log"
import { nodeCoreOrigin } from "@/lib/own-site"

// ОБЩИЕ ПУНКТЫ ЯЩИКА «ЛИЧНЫЙ КАБИНЕТ» (шаг ядра 862-12; владелец узла 2026-11-27, Telegram 1670: «Разве наше меню не универсальное? …
// распространяться на все элементы»). Ящик спрашивает здесь, когда его открывают; эта дверь спрашивает ядро своим ключом
// (`GET /api/node/account-links`) и ставит перед каждым путём адрес ядра в интернете: дверь ядра `market-link` сама ведёт на страницу
// клиента «Маркетплейс». Ни адреса, ни списка в сборке нет — новый пункт или новый домен не требуют пересборки элемента.
// Нет ядра, ключа или своего домена у узла — пустой список: ящик просто показывает свои пункты.
export const dynamic = "force-dynamic"

const NO_STORE = { "Cache-Control": "no-store" }

export async function GET(req: NextRequest) {
  const core = coreUrl()
  const key = process.env.SETTINGS_SECRET?.trim()
  const origin = nodeCoreOrigin()
  if (!core || !key || !origin) return NextResponse.json({ ok: true, links: [] }, { headers: NO_STORE })
  const lang = (req.nextUrl.searchParams.get("lang") ?? "en").replace(/[^a-zA-Z-]/g, "").slice(0, 12) || "en"
  try {
    const r = await fetch(`${core}/api/node/account-links?lang=${encodeURIComponent(lang)}`, { headers: { "x-node-key": key }, cache: "no-store", signal: AbortSignal.timeout(5_000) })
    const b = (await r.json().catch(() => null)) as { ok?: boolean; links?: { key?: unknown; label?: unknown; path?: unknown }[] } | null
    if (!r.ok || !b?.ok || !Array.isArray(b.links)) return NextResponse.json({ ok: true, links: [] }, { headers: NO_STORE })
    const links = b.links.flatMap((l) =>
      typeof l.key === "string" && typeof l.label === "string" && typeof l.path === "string" && l.path.startsWith("/api/")
        ? [{ key: l.key, label: l.label, href: `${origin}${l.path}` }]
        : [],
    )
    return NextResponse.json({ ok: true, links }, { headers: NO_STORE })
  } catch {
    return NextResponse.json({ ok: true, links: [] }, { headers: NO_STORE })
  }
}
