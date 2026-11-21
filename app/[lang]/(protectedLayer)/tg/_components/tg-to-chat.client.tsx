"use client"
// @local — «Go to the chat» of this element's Telegram Mini App (node step 821; the owner, Telegram 434): inside Telegram the Mini App
// closes and the person is back in the chat with the element's agent. Outside Telegram (the core's preview, a browser) it is not drawn.
// The section the person came from reaches the agent with the core's next build (a door and a hook — plan 821, «the chat context»).

import { MessageCircle } from "lucide-react"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { tgPost } from "./tg-bridge.client"

type TelegramWindow = Window & { TelegramWebviewProxy?: unknown }

export function TgToChat({ label, hint }: { label: string; hint: string }) {
  const [inside, setInside] = useState(false)
  useEffect(() => {
    const w = window as TelegramWindow
    setInside(Boolean(w.TelegramWebviewProxy) || (w.parent !== w && /tgWebApp/.test(sessionStorage.getItem("tg-launch") ?? "")))
  }, [])
  if (!inside) return null
  return (
    <div className="flex flex-col gap-1.5" data-block="tg-to-chat">
      <Button className="h-12 w-full rounded-xl text-[length:var(--fs-body)]" onClick={() => tgPost("web_app_close")}>
        <MessageCircle aria-hidden className="size-5" />{label}
      </Button>
      <p data-block="qzrt4" className="px-4 text-center text-[length:var(--fs-small)] text-muted-foreground">{hint}</p>
    </div>
  )
}
