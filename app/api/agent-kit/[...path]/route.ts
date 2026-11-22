// @api this element's agent pages reach the core's agent machinery
import { NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth/get-session"
import { requireRoles } from "@/lib/auth/require-roles"
import { coreUrlOf } from "@/lib/neighbour.mjs"
import { nodeCoreOrigin } from "@/lib/own-site"
import { ownId } from "@/lib/own-id"
import { PROTECTED_GROUP_ROLES } from "@/lib/roles"

// THE ONE DOOR OF THE AGENT PAGES (node step 836-2). The owner of the node, 2026-11-22 (Telegram 711, 719): this element's agent pages
// — Claude subscription, terminal, Telegram bot — live here, behind THIS element's sign-in, not on the core's address. The pages are
// the core's own (`components/agent-kit`, copied as they are); the machinery stays in the core: this door checks the person here and
// then calls the core on loopback with this element's own key (`X-Node-Key: SETTINGS_SECRET`) — the core opens only this element's
// doors for it, with its own admin's rights (core `lib/agent-kit/kit-access.ts`).
// 🔒 Who: this element's administrator or the architect (`PROTECTED_GROUP_ROLES.admin`, the same lock as the admin branch).
// 🔒 What: only the four kit doors and the voice door — nothing else of the core is reachable through here. The core's build state is
//   the node's own affair: its doors answer «nothing» here (the build watch then shows nothing).
// 🔒 The socket: the browser cannot reach the core's loopback, so the ticket comes back with the core's PUBLIC address of the socket —
//   the node's domain (`nodeCoreOrigin`) or the core's address the installer wrote (`ARCHITECT_URL`), read at request time.

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

const KIT_DOORS = new Set(["ticket", "session", "channel", "claude-auth"])
const noStore = { "Cache-Control": "no-store" }
type Ctx = { params: Promise<{ path?: string[] }> }

function publicCore(): string | null {
  const a = nodeCoreOrigin() ?? (process.env.ARCHITECT_URL ?? "").trim().replace(/\/+$/, "")
  return a || null
}

async function forward(req: NextRequest, target: string, person: string | null): Promise<Response> {
  const key = (process.env.SETTINGS_SECRET ?? "").trim()
  const headers = new Headers({ "X-Node-Key": key })
  if (person) headers.set("X-Element-Person", person)
  const type = req.headers.get("content-type")
  if (type) headers.set("Content-Type", type)
  const body = req.method === "GET" || req.method === "HEAD" ? undefined : await req.arrayBuffer()
  return fetch(target, { method: req.method, headers, body, cache: "no-store", signal: AbortSignal.timeout(60_000) })
}

async function handle(req: NextRequest, ctx: Ctx): Promise<Response> {
  const denied = await requireRoles(req, PROTECTED_GROUP_ROLES.admin)
  if (denied) return denied
  const id = ownId()
  const core = coreUrlOf()
  if (!id || !core || !(process.env.SETTINGS_SECRET ?? "").trim()) {
    return NextResponse.json({ ok: false, reason: "not-on-a-node" }, { status: 503, headers: noStore })
  }
  const path = (await ctx.params).path ?? []
  const person = (await getSession(req))?.email ?? null

  // the four kit doors of THIS element in the core
  if (path[0] === "agent-api" && path.length === 2 && KIT_DOORS.has(path[1])) {
    const r = await forward(req, `${core}/en/architect/${id}/agent-api/${path[1]}${req.nextUrl.search}`, person)
    const text = await r.text()
    let body: Record<string, unknown> | null = null
    try { body = JSON.parse(text) as Record<string, unknown> } catch { /* not JSON — passed as it is */ }
    if (body && r.ok && path[1] === "ticket") {
      const origin = publicCore()
      if (origin) body.socket = `${origin.replace(/^http/, "ws")}/pty/${id}`
    }
    // the bot's system message links to THIS element's agent pages (the kit fills them with this host)
    if (body && r.ok && path[1] === "channel" && req.method === "GET") {
      body.links = { terminal: "/admin/agent/terminal", subscription: "/admin/agent/subscription" }
    }
    return body
      ? NextResponse.json(body, { status: r.status, headers: noStore })
      : new NextResponse(text, { status: r.status, headers: noStore })
  }

  // the voice field of the terminal's paste window — on this element's account of the node's key, for itself only
  if (path.join("/") === "core/api/transcribe" && req.method === "POST") {
    const r = await forward(req, `${core}/api/transcribe?item=${encodeURIComponent(id)}`, person)
    return new NextResponse(await r.text(), { status: r.status, headers: { ...noStore, "Content-Type": r.headers.get("content-type") ?? "application/json" } })
  }

  return NextResponse.json({ ok: false, reason: "not-here" }, { status: 404, headers: noStore })
}

export const GET = handle
export const POST = handle
