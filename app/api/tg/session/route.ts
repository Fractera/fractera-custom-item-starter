// @api trade Telegram's signed Mini App launch for this element's ticket
import { NextRequest, NextResponse } from "next/server"
import { allowed, token } from "@/lib/cron/telegram"
import { checkInit, mintTicket, TG_COOKIE, TG_TICKET_TTL_S } from "@/lib/auth/telegram-ticket.mjs"

// THE MINI APP'S DOOR IN (node step 832-6; the owner of the node, Telegram 628: «Telegram сам защищает. Убрать это всё»). POST
// `{ initData }` — Telegram's launch data of this element's Mini App. Checked with this element's own bot token and its bot's list of
// admitted people (`lib/cron/telegram.ts`, the same folder the bot lives in); passed — the HttpOnly ticket `fractera-telegram` for 24 h,
// read by `getSession` as this element's own admin. Public at the edge (`proxy.ts` → PUBLIC_API_PREFIXES «/api/tg»): the visitor has
// no session yet — the signature is the guard. The answer never carries the token, the ticket or the list.
export const dynamic = "force-dynamic"
const HEADERS = { "Cache-Control": "no-store" }

export async function POST(req: NextRequest) {
  if (!(req.headers.get("content-type") ?? "").toLowerCase().startsWith("application/json")) {
    return NextResponse.json({ ok: false, reason: "json-only" }, { status: 415, headers: HEADERS })
  }
  const body = (await req.json().catch(() => null)) as { initData?: unknown } | null
  const bot = token()
  if (!bot) return NextResponse.json({ ok: false, reason: "no-bot" }, { status: 409, headers: HEADERS })
  const checked = checkInit(typeof body?.initData === "string" ? body.initData : "", bot, { allow: allowed() })
  if (!checked.ok) {
    console.log(`[tg/session] refused — ${checked.reason}`)
    return NextResponse.json({ ok: false, reason: checked.reason }, { status: 401, headers: HEADERS })
  }
  const ticket = mintTicket(checked.user, process.env.SETTINGS_SECRET?.trim() ?? "")
  if (!ticket) return NextResponse.json({ ok: false, reason: "no-key" }, { status: 500, headers: HEADERS })
  const res = NextResponse.json({ ok: true }, { headers: HEADERS })
  // SameSite=None: Telegram Web opens a Mini App in a frame of web.telegram.org — a Lax cookie would not ride there. Secure is required
  // with None; on plain http (this computer) the ticket is not needed — the owner at the keyboard is let in without it.
  const secure = req.nextUrl.protocol === "https:" || req.headers.get("x-forwarded-proto") === "https"
  res.cookies.set(TG_COOKIE, ticket, { httpOnly: true, path: "/", maxAge: TG_TICKET_TTL_S, secure, sameSite: secure ? "none" : "lax" })
  return res
}
