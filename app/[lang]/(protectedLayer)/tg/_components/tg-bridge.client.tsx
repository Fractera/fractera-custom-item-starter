"use client"
// @local — the Telegram side of this element's Mini App (node step 778): tells Telegram the app is loaded, expands it and paints
// Telegram's own header and background with the Mini App's page. 821: Telegram's theme becomes the element's tokens (`data-tg-theme`,
// styles/globals.css), and Telegram's own Back button walks back inside the Mini App. Bound to the /tg branch; renders nothing.

import { usePathname, useRouter } from "next/navigation"
import { useEffect } from "react"

type TelegramWindow = Window & {
  TelegramWebviewProxy?: { postEvent: (type: string, data: string) => void }
  external?: { notify?: (data: string) => void }
  Telegram?: { WebView?: { receiveEvent?: (type: string, data: unknown) => void } }
  TelegramGameProxy?: { receiveEvent?: (type: string, data: unknown) => void }
  TelegramGameProxy_receiveEvent?: (type: string, data: unknown) => void
  __tgEvents?: boolean
  __tgBack?: () => void
}

/** One event to the Telegram client (core.telegram.org/api/web-events): the mobile apps through `TelegramWebviewProxy`, Windows Phone
 *  through `external.notify`, the web and desktop clients through a message to the parent frame. Outside Telegram — nothing. */
export function tgPost(type: string, data: Record<string, unknown> = {}) {
  const w = window as TelegramWindow
  try {
    if (w.TelegramWebviewProxy) return w.TelegramWebviewProxy.postEvent(type, JSON.stringify(data))
    if (w.external && typeof w.external.notify === "function") return w.external.notify(JSON.stringify({ eventType: type, eventData: data }))
    if (w.parent !== w) w.parent.postMessage(JSON.stringify({ eventType: type, eventData: data }), "*")
  } catch { /* not inside Telegram */ }
}

/** Any CSS colour (oklch tokens included) → `#rrggbb` through a 1×1 canvas; transparent → null. Telegram takes only hex RGB. */
function hexOf(css: string): string | null {
  const canvas = document.createElement("canvas")
  canvas.width = canvas.height = 1
  const ctx = canvas.getContext("2d", { willReadFrequently: true })
  if (!ctx) return null
  ctx.fillStyle = "#000"
  ctx.fillStyle = css
  ctx.fillRect(0, 0, 1, 1)
  const [r, g, b, a] = ctx.getImageData(0, 0, 1, 1).data
  if (a === 0) return null
  return `#${[r, g, b].map((x) => x.toString(16).padStart(2, "0")).join("")}`
}

/** Telegram's theme → `--tg-theme-<name>` on <html> and the mark `data-tg-theme`; the element's tokens follow it (globals.css). */
function applyTheme(theme: unknown) {
  if (!theme || typeof theme !== "object") return
  const root = document.documentElement
  for (const [k, v] of Object.entries(theme)) if (typeof v === "string" && /^#[0-9a-f]{3,8}$/i.test(v)) root.style.setProperty(`--tg-theme-${k.replace(/_/g, "-")}`, v)
  root.setAttribute("data-tg-theme", "")
}

/** Telegram's launch parameters (the hash of the first address: tgWebAppThemeParams …) outlive the Mini App's own navigation. */
function launchTheme(): unknown {
  const hash = window.location.hash.slice(1)
  if (hash.includes("tgWebApp")) sessionStorage.setItem("tg-launch", hash)
  const theme = new URLSearchParams(sessionStorage.getItem("tg-launch") ?? "").get("tgWebAppThemeParams")
  try { return theme ? JSON.parse(theme) : null } catch { return null }
}

/** Events from Telegram, listened to once per Mini App: the mobile apps call `Telegram.WebView.receiveEvent`, the web clients post. */
function listenOnce() {
  const w = window as TelegramWindow
  if (w.__tgEvents) return
  w.__tgEvents = true
  const on = (type: string, data: unknown) => {
    if (type === "back_button_pressed") w.__tgBack?.()
    if (type === "theme_changed") applyTheme((data as { theme_params?: unknown } | null)?.theme_params)
  }
  // 840-4 (the owner, Telegram 942: «кнопка назад она не кликабельно»): Telegram's clients deliver an event through any of three names —
  // `Telegram.WebView.receiveEvent`, `TelegramGameProxy.receiveEvent`, `TelegramGameProxy_receiveEvent` (the official telegram-web-app.js
  // answers all three); listening on one left the Back button dead on the clients that call another.
  w.Telegram = w.Telegram ?? {}
  w.Telegram.WebView = w.Telegram.WebView ?? {}
  const prev = w.Telegram.WebView.receiveEvent
  const receive = (type: string, data: unknown) => { on(type, data); prev?.(type, data) }
  w.Telegram.WebView.receiveEvent = receive
  w.TelegramGameProxy = { ...(w.TelegramGameProxy ?? {}), receiveEvent: receive }
  w.TelegramGameProxy_receiveEvent = receive
  window.addEventListener("message", (e) => {
    try { const m = JSON.parse(String(e.data)); if (m && typeof m.eventType === "string") on(m.eventType, m.eventData) } catch { /* not Telegram's */ }
  })
}

/** 840-4: Back goes to the screen above this one — never `history.back()`, which does nothing when the screen was the first one opened. */
export function parentOf(path: string, home: string): string {
  if (path === home || !path.startsWith(`${home}/`)) return home
  return path.slice(0, path.lastIndexOf("/")) || home
}

export function TgBridge({ home }: { home: string }) {
  const path = usePathname()
  const router = useRouter()
  useEffect(() => {
    ;(window as TelegramWindow).__tgBack = () => router.push(parentOf(window.location.pathname, home))
  }, [router, home])
  useEffect(() => {
    tgPost("web_app_ready")
    tgPost("web_app_expand")
    applyTheme(launchTheme())
    listenOnce()
    const paint = () => {
      const app = document.querySelector<HTMLElement>("[data-tg-app]")
      const color = app ? hexOf(getComputedStyle(app).backgroundColor) : null
      if (!color) return
      tgPost("web_app_set_header_color", { color })
      tgPost("web_app_set_background_color", { color })
    }
    paint()
    // The element's theme switch (light ⇄ dark) and Telegram's theme both change <html>: Telegram's header follows the page.
    const watch = new MutationObserver(paint)
    watch.observe(document.documentElement, { attributes: true, attributeFilter: ["class", "style", "data-tg-theme"] })
    return () => watch.disconnect()
  }, [])
  // 821: Telegram's own Back button — on every screen but the Mini App's home.
  useEffect(() => { tgPost("web_app_setup_back_button", { is_visible: path !== home }) }, [path, home])
  return null
}
