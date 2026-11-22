"use client"
// @local — the model choice of the element's own agent in its Mini App (node step 840-4; the owner, Telegram 954: «выбор модели … как в основном»):
// the same choice as the main agent's card in the node's Pult — Opus with its effort, Sonnet and Haiku on medium; Ultracode stays the bot's,
// behind its Telegram confirmation. The switch waits for the agent's current turn; an agent asleep has nothing to switch — said in words.

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ButtonGroup } from "@/components/ui/button-group"
import type { Agent } from "./tg-agent.client"
import type { TgAgentUi } from "./tg-agent.i18n"

const MODELS = [["opus", "Opus"], ["sonnet", "Sonnet"], ["haiku", "Haiku"]] as const
const EFFORTS = ["low", "medium", "high", "xhigh", "max"] as const

export function TgModelPick({ agent, lang, ui, onDone }: { agent: Agent; lang: string; ui: TgAgentUi; onDone: () => void }) {
  const [model, setModel] = useState(agent.model && MODELS.some(([m]) => m === agent.model) ? agent.model : "opus")
  const [effort, setEffort] = useState(agent.model === "opus" && agent.effort ? agent.effort : "high")
  const [busy, setBusy] = useState(false)
  const [note, setNote] = useState<{ ok: boolean; text: string } | null>(null)
  const fixed = model !== "opus"
  const differs = model !== agent.model || (!fixed && effort !== agent.effort)
  const go = async () => {
    setBusy(true)
    setNote(null)
    const r = await fetch(`/${lang}/tg/api/agent`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ model, effort: fixed ? "medium" : effort }) }).catch(() => null)
    const b = (await r?.json().catch(() => null)) as { ok?: boolean; model?: string; effort?: string } | null
    setBusy(false)
    if (b?.ok) {
      setNote({ ok: true, text: ui.willSwitch.replace("{m}", `${model.charAt(0).toUpperCase()}${model.slice(1)} · ${ui.effort} ${b.effort ?? effort}`) })
      onDone()
    } else setNote({ ok: false, text: r?.status === 409 ? ui.asleepNoSwitch : ui.switchFailed })
  }
  return (
    <div className="flex flex-col gap-3 px-4 pt-1 pb-4" data-block="tg-model-pick">
      <div className="flex flex-col gap-1.5" data-block="tg-model-pick-model">
        <span className="text-[length:var(--fs-small)] text-muted-foreground">{ui.modelPick}</span>
        <ButtonGroup data-block="ti23u" className="w-full">
          {MODELS.map(([id, name]) => (
            <Button aria-pressed={model === id} className="flex-1" data-model={id} key={id} onClick={() => setModel(id)} size="sm" type="button" variant={model === id ? "default" : "outline"}>{name}</Button>
          ))}
        </ButtonGroup>
      </div>
      <div className="flex flex-col gap-1.5" data-block="tg-model-pick-effort">
        <span className="text-[length:var(--fs-small)] text-muted-foreground">{fixed ? ui.effortFixed : ui.effortPick}</span>
        {fixed ? null : (
          <ButtonGroup data-block="yq1iu" className="w-full">
            {EFFORTS.map((e) => (
              <Button aria-pressed={effort === e} className="flex-1 px-1" data-effort={e} key={e} onClick={() => setEffort(e)} size="sm" type="button" variant={effort === e ? "default" : "outline"}>{e}</Button>
            ))}
          </ButtonGroup>
        )}
      </div>
      {differs ? <Button disabled={busy} onClick={go} type="button">{busy ? ui.switching : ui.switchTo}</Button> : null}
      {note ? <p className={note.ok ? "text-[length:var(--fs-small)] text-muted-foreground" : "text-[length:var(--fs-small)] text-destructive"} data-block="tg-model-pick-note" role="status">{note.text}</p> : null}
    </div>
  )
}
