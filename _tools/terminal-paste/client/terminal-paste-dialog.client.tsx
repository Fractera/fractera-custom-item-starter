"use client"

import { Button } from "@/components/ui/button"
import { AppDialog } from "@/components/dialog/app-dialog.client"
import type { AppDialogUi } from "@/components/dialog/app-dialog.i18n"
import { VoiceControl } from "@/components/form/voice-control.client"
import type { TerminalPasteWords } from "../types/terminal-paste"

// ОКНО ВСТАВКИ В ТЕРМИНАЛ (инструмент, 336-5; до этого — часть терминала комплекта агента, 316). Слово владельца 2026-09-29:
// «в этом же терминале для вставки текста нужно повторить размещение голосового ввода, чтобы если придёт к человеку в голову
// идея продолжить написание все это можно было сделать».
//
// 🔒 ТЕКСТ УХОДИТ В ТЕРМИНАЛ ТОЛЬКО КНОПКОЙ ЧЕЛОВЕКА (316): окно не знает сокета — `onInsert(send)` вызывает владелец окна.
// 🔒 ГОЛОС ДОПИСЫВАЕТ, А НЕ ЗАМЕНЯЕТ: расшифровка встаёт туда, где стоял курсор (`VoiceControl`), готовый текст задачи остаётся.

export function TerminalPasteDialog({
  open,
  onOpenChange,
  text,
  onTextChange,
  live,
  lang,
  words,
  dialogUi,
  voiceApiUrl,
  keyHref,
  onInsert,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  text: string
  onTextChange: (next: string) => void
  /** Сессия агента запущена — без неё вставлять некуда, текст ждёт в окне. */
  live: boolean
  lang: string
  words: TerminalPasteWords
  dialogUi: AppDialogUi
  voiceApiUrl?: string
  keyHref?: string
  onInsert: (send: boolean) => void
}) {
  return (
    <AppDialog
      open={open}
      onOpenChange={onOpenChange}
      title={words.pasteTitle}
      description={words.pasteText}
      ui={dialogUi}
      size="lg"
      footer={
        <>
          <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>{words.pasteCancel}</Button>
          <Button type="button" variant="outline" disabled={!live || !text.trim()} onClick={() => onInsert(false)} data-agent-paste-insert>
            {words.pasteInsert}
          </Button>
          <Button type="button" disabled={!live || !text.trim()} onClick={() => onInsert(true)} data-agent-paste-send>
            {words.pasteInsertSend}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-2" data-agent-paste-text>
        <VoiceControl
          id="terminal-paste-text"
          variant="textarea"
          rows={8}
          value={text}
          onChange={onTextChange}
          lang={lang}
          placeholder={words.pastePlaceholder}
          apiUrl={voiceApiUrl}
          keyHint={keyHref ? { href: keyHref, label: words.pasteKeyLink } : undefined}
        />
        {!live && <p className="text-muted-foreground text-sm">{words.pasteNeedsRun}</p>}
      </div>
    </AppDialog>
  )
}
