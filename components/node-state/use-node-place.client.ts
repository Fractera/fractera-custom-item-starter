"use client"
// @part node-place-reader — where the node lives (computer or server) for the browser: one /api/node/place request per page, shared

import { useEffect, useState } from "react"

// ГДЕ ЖИВЁТ УЗЕЛ — ДЛЯ БРАУЗЕРА, ИЗ ОДНОГО ВОПРОСА К УЗЛУ (741-6; владелец утвердил 2026-11-14: «да, утверждаю 741 и D31–D37 -> go»).
//
// ✗ Прежде каждый виджет решал «компьютер или сервер» по адресной строке (`window.location.hostname`): страница хостинга, открытая на
// компьютере через быстрый туннель, рисовала вид СЕРВЕРА (измерено 2026-11-14), а окно на сервер (`npm run server -- window`) говорило
// `localhost` — то есть «этот компьютер» — на сервере. Адрес называет, как вы пришли; где живёт узел, знает только узел — его запись
// (`lib/hosting/place.mjs`, 741-2), которую отдаёт дверь `/api/node/place`.
// 🔒 ОДИН ЗАПРОС НА СТРАНИЦУ: обещание живёт в модуле, и все виджеты страницы получают один и тот же ответ. Страницы остаются
// статическими — браузер спрашивает дверь, как и прежде (`server-place.client.tsx`).
// 🔒 НЕТ ОТВЕТА — `null`, и виджет ведёт себя как прежде (по адресу): отказ двери не должен прятать тревогу на компьютере.

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? ""

export type NodePlaceAnswer = {
  kind: "home" | "server"
  source: string
  detail?: string
  mismatch?: string
  foreign?: boolean
  /** живые серверы, которые запустил этот компьютер (D36) — домен и время */
  launched: Array<{ domain: string; readyAt: string | null }>
  /** 776: how this page was reached — this computer's loopback (`local`) or the web (`web`); the node sees it in the request */
  via: "local" | "web"
  /** 776: the panel on the node's own domain (`https://architect.<zone>`), `null` — no main domain yet */
  web: string | null
  /** 775: every element answered on the domain at the fourth rung's last check — «Перейти в web» shows only then */
  webReady: boolean
  /** 775: this computer's panel (`http://localhost:<port>`) — the blue band of the web leads there */
  local: string | null
  /** 777: the bases of the one «sign in as the architect» link (`lib/auth/sign-in-link.cjs` architectSignIn) */
  signIn: { web: string | null; webAuth: string | null; localAuth: string | null } | null
}

let asked: Promise<NodePlaceAnswer | null> | null = null
const str = (v: unknown): string | null => (typeof v === "string" && /^https?:\/\//.test(v) ? v : null)

/** Один вопрос на страницу; ответ `null` — узел не ответил (или не на чтение для этого посетителя). */
export function askNodePlace(): Promise<NodePlaceAnswer | null> {
  if (asked) return asked
  type Raw = { place?: { kind?: string; source?: string; detail?: string; mismatch?: string; foreign?: boolean }; launched?: NodePlaceAnswer["launched"]; via?: unknown; web?: unknown; webReady?: unknown; local?: unknown; signIn?: { web?: unknown; webAuth?: unknown; localAuth?: unknown } }
  const p: Promise<NodePlaceAnswer | null> = fetch(`${BASE}/api/node/place`, { cache: "no-store" })
    .then((r) => (r.ok ? (r.json() as Promise<Raw>) : null))
    .then((a): NodePlaceAnswer | null => {
      const kind = a?.place?.kind === "server" ? "server" : a?.place?.kind === "home" ? "home" : null
      if (!kind) return null
      return { kind, source: a?.place?.source ?? "unknown", detail: a?.place?.detail, mismatch: a?.place?.mismatch, foreign: a?.place?.foreign,
        launched: Array.isArray(a?.launched) ? a.launched : [],
        via: a?.via === "local" ? "local" : "web",
        web: typeof a?.web === "string" && a.web.startsWith("https://") ? a.web : null,
        webReady: a?.webReady === true,
        local: typeof a?.local === "string" && /^http:\/\/localhost:\d+$/.test(a.local) ? a.local : null,
        signIn: a?.signIn ? { web: str(a.signIn.web), webAuth: str(a.signIn.webAuth), localAuth: str(a.signIn.localAuth) } : null }
    })
    .catch(() => null)
  asked = p
  return p
}

/** `undefined` — ещё спрашиваем; `null` — узел не ответил; иначе — где живёт узел. */
export function useNodePlace(): NodePlaceAnswer | null | undefined {
  const [place, setPlace] = useState<NodePlaceAnswer | null | undefined>(undefined)
  useEffect(() => {
    let alive = true
    void askNodePlace().then((p) => { if (alive) setPlace(p) })
    return () => { alive = false }
  }, [])
  return place
}
