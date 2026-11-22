"use client"
// @local — the search at the top of this element's Mini App home (node step 841; the owner, Telegram 963: «вкладку поиск … с одной стороны
// напоминал Инпут а с другой стороны нажатие на поиск закроют приложение откроет чат»): the question is typed here — Telegram cannot fill
// the chat's field — and «Найти» gives it to this element's own agent (the door `../api/search`); its bot writes «🔎 Ищу: …» into the
// chat and the Mini App closes, so the person is in the chat where the answer comes. Outside Telegram it says where the answer comes.

import { Search } from "lucide-react"
import { useState } from "react"
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from "@/components/ui/input-group"
import { Small } from "@/components/ui/typography"
import { tgPost } from "./tg-bridge.client"

export type TgSearchUi = { placeholder: string; find: string; sending: string; sent: string; short: string; failed: string }

type TelegramWindow = Window & { TelegramWebviewProxy?: unknown }

export function TgSearch({ lang, ui }: { lang: string; ui: TgSearchUi }) {
  const [q, setQ] = useState("")
  const [busy, setBusy] = useState(false)
  const [note, setNote] = useState<{ ok: boolean; text: string } | null>(null)
  const go = async () => {
    const text = q.trim()
    if (text.length < 3) return setNote({ ok: false, text: ui.short })
    setBusy(true)
    setNote(null)
    const r = await fetch(`/${lang}/tg/api/search`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ text }) }).catch(() => null)
    const b = (await r?.json().catch(() => null)) as { ok?: boolean } | null
    setBusy(false)
    if (!b?.ok) return setNote({ ok: false, text: ui.failed })
    setQ("")
    setNote({ ok: true, text: ui.sent })
    const w = window as TelegramWindow
    if (w.TelegramWebviewProxy || w.parent !== w) setTimeout(() => tgPost("web_app_close"), 900)
  }
  return (
    <div className="flex flex-col gap-1.5" data-block="tg-search">
      <InputGroup className="h-11 rounded-xl border-0 bg-[var(--tg-card)]">
        <InputGroupAddon><Search aria-hidden /></InputGroupAddon>
        <InputGroupInput
          aria-label={ui.placeholder}
          className="text-base"
          disabled={busy}
          enterKeyHint="search"
          maxLength={300}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") go() }}
          placeholder={ui.placeholder}
          value={q}
        />
        <InputGroupAddon align="inline-end">
          <InputGroupButton disabled={busy || !q.trim()} onClick={go} size="sm" variant="default">{busy ? ui.sending : ui.find}</InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
      {note ? <Small data-block="tg-search-note" className={note.ok ? "px-4" : "px-4 text-destructive"} role="status">{note.text}</Small> : null}
    </div>
  )
}
