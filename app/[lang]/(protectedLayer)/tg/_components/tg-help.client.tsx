"use client"
// @local — «Справка» at the bottom of a group's screen in this element's Telegram Mini App (node step 826; the owner, Telegram 506: «где-нибудь
// такая небольшая подсказка должна быть на этой странице может быть внизу какая-то кнопочка справка?»). A quiet button; its window holds
// what the server drew for this direction — what goes elsewhere and how the screen works. A help window is closed, never confirmed: no
// footer, only the cross (AppDialog's own rule).

import { CircleHelp } from "lucide-react"
import { type ReactNode, useState } from "react"
import { AppDialog } from "@/components/dialog/app-dialog.client"
import type { AppDialogUi } from "@/components/dialog/app-dialog.i18n"
import { Button } from "@/components/ui/button"

export type GroupHelpUi = {
  button: string
  /** `{group}` — the direction's name */
  title: string
  notHere: string
  how: string
  /** the name of the Mini App's Cron screen, where a neighbour leads there */
  cron: string
  points: string[]
}

export function TgHelp({ label, title, dialogUi, children }: { label: string; title: string; dialogUi: AppDialogUi; children: ReactNode }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="flex justify-center" data-block="tg-help">
      <Button className="gap-1.5 text-muted-foreground" data-tg-help="" onClick={() => setOpen(true)} size="sm" variant="ghost">
        <CircleHelp aria-hidden className="size-4" />
        {label}
      </Button>
      <AppDialog onOpenChange={setOpen} open={open} size="sm" title={title} ui={dialogUi}>
        {children}
      </AppDialog>
    </div>
  )
}
