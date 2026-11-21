"use client"
// @local — «Go to the chat» of this element's Telegram Mini App (node step 821; the owner, Telegram 434): inside Telegram the Mini App
// closes and the person is back in the chat with the element's agent. Outside Telegram (the core's preview, a browser) it is not drawn.
// 821: before closing, the section reaches the element's agent (the door `tg/api/context`, the core's hook `came-from`).

import { MessageCircle } from "lucide-react"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { tgPost } from "./tg-bridge.client"

type TelegramWindow = Window & { TelegramWebviewProxy?: unknown }

/** Tell the element's door which section the person comes from (its agent hears it with their next words), then close the Mini App.
 *  A door that does not answer in two seconds never keeps the person: the chat opens anyway. */
async function go(lang: string, section?: Section | null) {
  if (section) {
    await fetch(`/${lang}/tg/api/context`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(section), signal: AbortSignal.timeout(2_000) }).catch(() => null)
  }
  tgPost("web_app_close")
}

/** The section the person leaves for the chat: its titles and its address in the Mini App (node step 821, the owner's 434). */
type Section = { path: string[]; href: string }

export function TgToChat({ label, hint, lang, section }: { label: string; hint: string; lang: string; section?: Section | null }) {
  const [inside, setInside] = useState(false)
  useEffect(() => {
    const w = window as TelegramWindow
    setInside(Boolean(w.TelegramWebviewProxy) || (w.parent !== w && /tgWebApp/.test(sessionStorage.getItem("tg-launch") ?? "")))
  }, [])
  if (!inside) return null
  return (
    <div className="flex flex-col gap-1.5" data-block="tg-to-chat">
      <Button className="h-12 w-full rounded-xl text-[length:var(--fs-body)]" onClick={() => go(lang, section)}>
        <MessageCircle aria-hidden className="size-5" />{label}
      </Button>
      <p data-block="qzrt4" className="px-4 text-center text-[length:var(--fs-small)] text-muted-foreground">{hint}</p>
    </div>
  )
}
