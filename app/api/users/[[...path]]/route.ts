// @api list and change the accounts of this application
import { NextRequest, NextResponse } from "next/server"
import { requireRoles } from "@/lib/auth/require-roles"
import { ticketFrom } from "@/lib/auth/ticket"
import { authUrl } from "@/lib/microservices/urls"
import { ownId } from "@/lib/own-id"

// ЛЮДИ ЭТОГО ПРИЛОЖЕНИЯ (узел, шаг 580). Строки принадлежат службе входа, а не элементу: здесь нет ни таблицы `users`, ни её копии.
//   GET  /api/users?q=&role=&sort=&page=&perPage=          → служба входа GET  /api/app-users
//   GET  /api/users/<id>/history/<kind>?page=&perPage=      → служба входа GET  /api/app-users/<id>/history/<kind>
//   POST /api/users/batch { action, ids[], value? }         → служба входа POST /api/app-users/batch
//
// 🔒 ПОЧЕМУ ДВЕРЬ, А НЕ ЗАПРОС ИЗ БРАУЗЕРА: оболочка страницы предрендерена, а чтение чужой сессии делает динамическим всё поддерево;
// поэтому данные забирает островок, а сессия читается здесь.
// 🔒 КТО СПРАШИВАЕТ — ЧЕЛОВЕК, И СЛУЖБЕ ЕДЕТ ВСЁ, ЧЕМ ОН ИЗВЕСТЕН. ✗ До 580 дверь пересылала только куку: на собственном домене элемента
// (lagrix.dev) куки службы входа нет, есть билет единого входа (328-3), и архитектор видел «Не удалось загрузить записи» (401). Теперь —
// кука, билет (`x-fractera-ticket`) и имя этого элемента (`x-fractera-element`); служба входа принимает билет только с петли машины,
// поэтому адрес службы — внутренний адрес узла (`authUrl`), а не публичный.
// 🔒 ПРАВО РЕШАЕТ СЛУЖБА ВХОДА по приложению записи человека: архитектор узла — любое приложение, администратор — только своё (закон 580,
// владелец 2026-10-24). Здешний замок (`requireRoles`) — первый слой: без роли admin или architect дальше не идёт никто.
export const runtime = "nodejs"
export const dynamic = "force-dynamic"

type Ctx = { params: Promise<{ path?: string[] }> }

const SAFE = /^[A-Za-z0-9_-]{1,64}$/

function target(path: string[], method: "GET" | "POST"): string | null {
  if (method === "GET" && path.length === 0) return ""
  if (method === "GET" && path.length === 3 && SAFE.test(path[0]) && path[1] === "history" && SAFE.test(path[2])) return `/${encodeURIComponent(path[0])}/history/${path[2]}`
  if (method === "POST" && path.length === 1 && path[0] === "batch") return "/batch"
  return null
}

async function forward(req: NextRequest, ctx: Ctx, method: "GET" | "POST") {
  const denied = await requireRoles(req, ["admin", "architect"])
  if (denied) return denied
  const tail = target((await ctx.params).path ?? [], method)
  if (tail === null) return NextResponse.json({ ok: false, error: "unknown-path" }, { status: 404 })
  const base = authUrl()
  if (!base) return NextResponse.json({ ok: false, error: "auth service unreachable" }, { status: 502 })

  const cookie = req.headers.get("cookie") ?? ""
  const headers: Record<string, string> = { cookie, "x-fractera-element": ownId() ?? "" }
  const ticket = ticketFrom(cookie)
  if (ticket) headers["x-fractera-ticket"] = ticket
  let body: string | undefined
  if (method === "POST") {
    headers["content-type"] = "application/json"
    body = await req.text()
  }
  const search = method === "GET" ? req.nextUrl.search : ""
  try {
    const res = await fetch(`${base}/api/app-users${tail}${search}`, { method, headers, body, cache: "no-store", signal: AbortSignal.timeout(10_000) })
    const data = await res.json().catch(() => ({}))
    return NextResponse.json(data, { status: res.status, headers: { "Cache-Control": "no-store" } })
  } catch {
    // Служба недоступна — 502, а не 500: отказал не мы, а тот, к кому мы обратились, и интерфейсу есть что сказать человеку.
    return NextResponse.json({ ok: false, error: "auth service unreachable" }, { status: 502 })
  }
}

export async function GET(req: NextRequest, ctx: Ctx) {
  return forward(req, ctx, "GET")
}

export async function POST(req: NextRequest, ctx: Ctx) {
  return forward(req, ctx, "POST")
}
