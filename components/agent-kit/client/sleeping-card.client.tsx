"use client"

import { History, Moon, Play } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { AgentTerminalWords } from "../words/agent-terminal.i18n"

// КАРТОЧКА СПЯЩЕГО ТЕРМИНАЛА (267-1; вынесена из `agent-terminal.client.tsx` шагом 708-2).
// 🔒 708-2 (владелец 2026-11-09, «b»): есть записанный разговор прошлой сессии — две кнопки, «Продолжить разговор» и «Новый разговор».
// Главная — по тому, как кончилась прошлая сессия: случайно (Стоп, выход, потеря с ядром) и окно не полно — продолжить; выключена
// намеренно или окно от 80 % — новый. Решает дверь состояния (`lib/agent-kit/resume.cjs` `offer`), здесь — только слова и кнопки.

export type ResumeOffer = { end: string | null; unclean: boolean; used: number | null; full: boolean; primary: "continue" | "new" }

export function SleepingCard({ words, checking, disabled, note, offer, onStart }: { words: AgentTerminalWords; checking: boolean; disabled: boolean; note: string; offer: ResumeOffer | null; onStart: (resume: boolean) => void }) {
  const why = offer ? (offer.unclean && offer.end && offer.end in words.resumeWhy ? words.resumeWhy[offer.end as keyof AgentTerminalWords["resumeWhy"]] : words.resumeWhy.closed) : null
  const fill = offer?.used != null ? (offer.full ? words.resumeFull : words.resumeFill).replace("{used}", String(offer.used)) : null
  const continueFirst = offer?.primary === "continue"
  const resumeButton = offer && (
    <Button key="continue" disabled={disabled} onClick={() => onStart(true)} type="button" variant={continueFirst ? "default" : "outline"} data-agent-resume>
      <History className="size-4" aria-hidden />
      {words.resumeContinue}
    </Button>
  )
  const startButton = (
    <Button key="start" disabled={disabled} onClick={() => onStart(false)} type="button" variant={offer && continueFirst ? "outline" : "default"} data-agent-start>
      <Play className="size-4" aria-hidden />
      {offer ? words.resumeNew : words.start}
    </Button>
  )
  return (
    <div className="flex flex-col gap-3 rounded-lg border border-border border-dashed bg-muted/40 p-5 text-muted-foreground" data-block="agent-sleeping-card" data-resume={offer ? offer.primary : "none"}>
      <div data-block="mfvu7" className="flex items-center gap-2 font-medium text-foreground">
        <Moon className="size-4" aria-hidden />
        {checking ? "…" : words.sleepingTitle}
      </div>
      <p data-block="zcybv" className="text-sm">{words.sleepingBody}</p>
      {note && <p data-block="ha7ad" className="text-sm">{note}</p>}
      {why && <p data-block="usbwu" className="text-sm" data-agent-resume-why>{why}{fill ? ` ${fill}` : ""}</p>}
      <div data-block="m2v35" className="flex flex-wrap gap-2">{continueFirst ? [resumeButton, startButton] : [startButton, resumeButton]}</div>
    </div>
  )
}
