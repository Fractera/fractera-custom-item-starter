"use client"
// @local — «＋ Добавить» of a group's screen in this element's Telegram Mini App and its window (node step 826; the owner, Telegram 503:
// «кнопки добавить который будет вызывать модальное окно для добавления новый соцсети … эта кнопка должна обновить … файл в маршруте»;
// 505: «Кнопку удалить не делаем кнопку редактировать не делаем если сделали опечатку то исправляем при помощи Claude Code Agent»).
// The last row of the group's card; the window sends the name and one line to the branch's door `tg/api/items`, which appends the item to
// the group's items.json — no build: the list is drawn again at once. No delete and no rename here — the window says so.

import { Plus } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { AppDialog } from "@/components/dialog/app-dialog.client"
import type { AppDialogUi } from "@/components/dialog/app-dialog.i18n"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

type Why = "no-title" | "title-long" | "line-long" | "full" | "taken" | "forbidden" | "broken-file" | "failed"

export type AddItemUi = {
  button: string
  /** `{group}` — the direction's name */
  title: string
  text: string
  name: string
  namePlaceholder: string
  line: string
  linePlaceholder: string
  cancel: string
  create: string
  creating: string
  /** `{name}` — the added item */
  done: string
  errors: Record<Why, string>
}

const KNOWN: Why[] = ["no-title", "title-long", "line-long", "full", "taken", "broken-file"]

export function TgAddItem({ lang, group, groupTitle, divided, ui, dialogUi }: { lang: string; group: string; groupTitle: string; divided: boolean; ui: AddItemUi; dialogUi: AppDialogUi }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [name, setName] = useState("")
  const [line, setLine] = useState("")
  const [sending, setSending] = useState(false)
  const [why, setWhy] = useState<Why | null>(null)
  const [done, setDone] = useState<string | null>(null)
  const fits = name.trim().length > 0 && [...name.trim()].length <= 60 && [...line.trim()].length <= 120

  const start = () => { setName(""); setLine(""); setWhy(null); setSending(false); setDone(null); setOpen(true) }

  async function add() {
    setSending(true)
    setWhy(null)
    try {
      const r = await fetch(`/${lang}/tg/api/items`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ group, title: name.trim(), line: line.trim() }) })
      const j = (await r.json().catch(() => ({}))) as { ok?: boolean; error?: string }
      if (r.ok && j.ok) {
        setDone(name.trim())
        setOpen(false)
        setSending(false)
        router.refresh()
        return
      }
      setWhy(r.status === 401 || r.status === 403 ? "forbidden" : KNOWN.includes(j.error as Why) ? (j.error as Why) : "failed")
    } catch {
      setWhy("failed")
    }
    setSending(false)
  }

  return (
    <>
      <Button
        className={cn(
          "relative h-14 w-full justify-start gap-3 rounded-none px-4 text-[length:var(--fs-body)] font-normal text-primary hover:bg-muted/60 active:bg-muted",
          divided && "before:pointer-events-none before:absolute before:top-0 before:right-0 before:left-16 before:h-px before:bg-border",
        )}
        data-block="tg-add-item"
        data-tg-add-item=""
        onClick={start}
        variant="ghost"
      >
        <span className="flex size-9 items-center justify-center rounded-[10px] bg-primary/10" data-block="tg-add-item-tile">
          <Plus aria-hidden className="size-[18px]" />
        </span>
        {ui.button}
      </Button>
      {done ? <p className="px-4 pb-3 text-[length:var(--fs-small)] text-muted-foreground" data-block="tg-add-item-done" role="status">{ui.done.replace("{name}", done)}</p> : null}
      <AppDialog
        description={ui.text}
        footer={
          <>
            <Button disabled={sending} onClick={() => setOpen(false)} variant="outline">{ui.cancel}</Button>
            <Button data-tg-add-item-create="" disabled={!fits || sending} onClick={() => void add()}>{sending ? ui.creating : ui.create}</Button>
          </>
        }
        onOpenChange={(o) => { if (!sending) setOpen(o) }}
        open={open}
        size="sm"
        title={ui.title.replace("{group}", groupTitle)}
        ui={dialogUi}
      >
        <div className="flex flex-col gap-4" data-block="tg-add-item-form">
          <div className="flex flex-col gap-1.5" data-block="tg-add-item-name">
            <Label htmlFor="tg-add-item-name">{ui.name}</Label>
            <Input autoComplete="off" data-tg-add-item-name="" disabled={sending} id="tg-add-item-name" maxLength={60} onChange={(e) => { setName(e.target.value); setWhy(null) }} placeholder={ui.namePlaceholder} value={name} />
          </div>
          <div className="flex flex-col gap-1.5" data-block="tg-add-item-line">
            <Label htmlFor="tg-add-item-line">{ui.line}</Label>
            <Input autoComplete="off" disabled={sending} id="tg-add-item-line" maxLength={120} onChange={(e) => { setLine(e.target.value); setWhy(null) }} placeholder={ui.linePlaceholder} value={line} />
          </div>
          {why ? <p className="rounded-md border border-destructive/40 bg-destructive/5 px-3 py-2 text-[length:var(--fs-small)] text-foreground" data-block="tg-add-item-error" data-tg-add-item-error={why} role="alert">{ui.errors[why]}</p> : null}
        </div>
      </AppDialog>
    </>
  )
}
