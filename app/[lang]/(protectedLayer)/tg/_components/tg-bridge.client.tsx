"use client"
// @local — the Telegram side of this element's Mini App (node step 778): tells Telegram the app is loaded, expands it and paints
// Telegram's own header and background with this element's background. Bound to the /tg branch; renders nothing.

import { useEffect } from "react"

type TelegramWindow = Window & {
  TelegramWebviewProxy?: { postEvent: (type: string, data: string) => void }
  external?: { notify?: (data: string) => void }
}

/** One event to the Telegram client (core.telegram.org/api/web-events): the mobile apps through `TelegramWebviewProxy`, Windows Phone
 *  through `external.notify`, the web and desktop clients through a message to the parent frame. Outside Telegram — nothing. */
function post(type: string, data: Record<string, unknown> = {}) {
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

export function TgBridge() {
  useEffect(() => {
    post("web_app_ready")
    post("web_app_expand")
    const paint = () => {
      const app = document.querySelector<HTMLElement>("[data-tg-app]")
      const color = app ? hexOf(getComputedStyle(app).backgroundColor) : null
      if (!color) return
      post("web_app_set_header_color", { color })
      post("web_app_set_background_color", { color })
    }
    paint()
    // The element's theme switch (light ⇄ dark) changes the class of <html>: Telegram's header follows the element's look.
    const watch = new MutationObserver(paint)
    watch.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] })
    return () => watch.disconnect()
  }, [])
  return null
}
