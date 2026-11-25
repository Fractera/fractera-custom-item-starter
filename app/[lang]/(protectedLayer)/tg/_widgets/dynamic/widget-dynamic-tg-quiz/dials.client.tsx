"use client"
// @local — the two dials of the Mini App's quiz (core step 852-7; Roma, Telegram 1299: «там же мы регулируем глубину … уровень
// автоматизации»): the depth 1–5 and the automation F in steps of 25 %. A press saves at once through the door `tg/api/quiz`; the
// tree is never touched here.

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ButtonGroup } from "@/components/ui/button-group"
import { Eyebrow, Small } from "@/components/ui/typography"

export type DialsUi = { depth: string; depthHint: string; freedom: string; freedomHint: string; saved: string; failed: string; shallow: string }
type Props = { lang: string; depth: number; freedom: number; ui: DialsUi }

const DEPTHS = [1, 2, 3, 4, 5]
const FREEDOMS = [0, 25, 50, 75, 100]

export function QuizDials({ lang, depth, freedom, ui }: Props) {
  const [value, setValue] = useState({ depth, freedom })
  const [note, setNote] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  async function save(patch: { depth?: number; freedom?: number }) {
    setBusy(true)
    const r = await fetch(`/${lang}/tg/api/quiz`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(patch) }).catch(() => null)
    const j = r ? await r.json().catch(() => null) : null
    setBusy(false)
    if (r?.ok && j?.ok) { setValue({ depth: j.depth, freedom: j.freedom }); setNote(ui.saved); return }
    setNote(j?.reason === "shallow" ? ui.shallow : ui.failed)
  }
  const dial = (title: string, hint: string, list: number[], current: number, unit: string, key: "depth" | "freedom") => (
    <div className="flex flex-col gap-2 px-4 py-3.5" data-block="tg-quiz-dial">
      <Eyebrow data-block="tg-quiz-dial-title" className="text-muted-foreground tracking-wider">{title}</Eyebrow>
      <ButtonGroup aria-label={title} className="w-full" data-block="tg-quiz-dial-group">
        {list.map((n) => (
          <Button aria-pressed={n === current} className="h-10 flex-1 tabular-nums" disabled={busy} key={n} onClick={() => n !== current && save({ [key]: n })} variant={n === current ? "default" : "secondary"}>
            {n}{unit}
          </Button>
        ))}
      </ButtonGroup>
      <Small data-block="tg-quiz-dial-hint" className="text-muted-foreground text-pretty">{hint}</Small>
    </div>
  )
  return (
    <div className="flex flex-col divide-y divide-border rounded-xl bg-[var(--tg-card)]" data-block="tg-quiz-dials">
      {dial(ui.depth, ui.depthHint, DEPTHS, value.depth, "", "depth")}
      {dial(ui.freedom, ui.freedomHint, FREEDOMS, value.freedom, "%", "freedom")}
      {note ? <Small data-block="tg-quiz-dial-note" aria-live="polite" className="px-4 py-2.5 text-foreground">{note}</Small> : null}
    </div>
  )
}
