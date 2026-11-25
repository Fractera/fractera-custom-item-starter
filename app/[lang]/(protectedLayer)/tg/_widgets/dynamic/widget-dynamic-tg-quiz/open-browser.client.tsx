"use client"
// @local — «Открыть в браузере» of the Mini App's quiz (core step 852-7; Roma, Telegram 1299: «вкладка сайт»): inside Telegram it asks
// Telegram to open the same quiz address in the person's browser (core.telegram.org/api/web-events: `web_app_open_link`); outside
// Telegram the person is already in the browser, and it is not drawn.

import { Globe } from "lucide-react"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Small } from "@/components/ui/typography"
import { tgPost } from "../../../_components/tg-bridge.client"

type TelegramWindow = Window & { TelegramWebviewProxy?: unknown }

export function OpenInBrowser({ href, label, hint }: { href: string; label: string; hint: string }) {
  const [inside, setInside] = useState(false)
  useEffect(() => {
    const w = window as TelegramWindow
    setInside(Boolean(w.TelegramWebviewProxy) || (w.parent !== w && /tgWebApp/.test(sessionStorage.getItem("tg-launch") ?? "")))
  }, [])
  if (!inside) return null
  return (
    <div className="flex flex-col gap-1.5" data-block="tg-quiz-browser">
      <Button className="h-12 w-full rounded-xl text-[length:var(--fs-body)]" onClick={() => tgPost("web_app_open_link", { url: new URL(href, window.location.origin).toString() })} variant="secondary">
        <Globe aria-hidden className="size-5" />{label}
      </Button>
      <Small data-block="tg-quiz-browser-hint" className="px-4 text-center text-muted-foreground">{hint}</Small>
    </div>
  )
}
