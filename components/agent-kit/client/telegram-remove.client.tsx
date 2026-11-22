"use client"
// @local — the danger zone of one page of the agent kit (the agent's «Telegram-бот»): the bot taken off the node behind AppDialog

import { Trash2 } from "lucide-react"
import { useState } from "react"
import { AppDialog } from "@/components/dialog/app-dialog.client"
import type { AppDialogUi } from "@/components/dialog/app-dialog.i18n"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { H3, Small } from "@/components/ui/typography"
import type { TelegramChannelWords } from "../words/telegram-channel.i18n"

// УДАЛИТЬ БОТА С УЗЛА. Владелец 2026-11-19: «очевидно мы должны иметь кнопку удалить бота чтобы повторить полный процесс установки а у
// нас есть только тот процесс который позволяет создать мод один раз … если что-то случилось то исправить эту ситуацию нельзя … на
// вкладке главного агента ядра добавим внизу Danger zone удаление Telegram bot». The risk is said first, the button stays locked until
// «I understand»; the door erases the bot's files (`removeBot`), and the page reads its state again — step 1 opens.

type Props = { bot: string; words: TelegramChannelWords["remove"]; dialogUi: AppDialogUi; onRemove: () => Promise<boolean> }

export function TelegramRemove({ bot, words, dialogUi, onRemove }: Props) {
  const [open, setOpen] = useState(false)
  const [agree, setAgree] = useState(false)
  const [busy, setBusy] = useState(false)
  const [done, setDone] = useState(false)
  const fill = (t: string) => t.replace("{bot}", bot)

  async function go() {
    setBusy(true)
    const ok = await onRemove()
    setBusy(false)
    setOpen(false)
    setAgree(false)
    setDone(ok)
  }

  return (
    <div className="mt-6 flex flex-col gap-2" data-block="telegram-remove">
      <H3 data-block="iaa89" variant="ui">{words.zone}</H3>
      <div data-block="d9lja" className="flex flex-col gap-2 rounded-lg border border-destructive/40 bg-destructive/5 p-3">
        <p data-block="mtpq8" className="font-medium text-foreground text-sm">{words.title}</p>
        <Small data-block="pds5i" className="text-muted-foreground">{words.text}</Small>
        <div data-block="vcqh1">
          <Button disabled={busy} onClick={() => setOpen(true)} size="sm" type="button" variant="destructive" data-telegram-remove>
            <Trash2 aria-hidden data-icon />
            {words.button}
          </Button>
        </div>
        {done ? <Small data-block="gb8oj" className="text-foreground" role="status">{words.done}</Small> : null}
      </div>
      <AppDialog
        footer={
          <>
            <Button onClick={() => setOpen(false)} type="button" variant="outline">{words.cancel}</Button>
            <Button disabled={!agree || busy} onClick={() => void go()} type="button" variant="destructive">{words.confirm}</Button>
          </>
        }
        onOpenChange={(o) => { if (!o) { setOpen(false); setAgree(false) } }}
        open={open}
        title={fill(words.dialogTitle)}
        ui={dialogUi}
      >
        <ul data-block="mtero" className="flex list-disc flex-col gap-2 pl-5 text-foreground text-sm">
          {words.risks.map((r) => <li data-block="c9v4m" key={r}>{r}</li>)}
        </ul>
        <div data-block="vh13p" className="mt-4 flex items-center gap-2">
          <Checkbox checked={agree} id="telegram-remove-agree" onCheckedChange={(v) => setAgree(v === true)} />
          <Label htmlFor="telegram-remove-agree">{fill(words.agree)}</Label>
        </div>
      </AppDialog>
    </div>
  )
}
