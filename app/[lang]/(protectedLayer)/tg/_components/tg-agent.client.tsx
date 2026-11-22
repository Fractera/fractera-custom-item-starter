"use client"
// @local — the element's own agent in its Mini App (node step 821; the owner's mock v2 A and D, «идеально» 438): after hydration it asks
// the branch's door `/<lang>/tg/api/agent` (the core answers only about this element) and draws, on the home screen, the agent's card
// (840-4: a tap opens the model choice) and «Топливо подписки» — the context window, 5 hours and 7 days of the account it runs on; on
// «Элемент» the subscription and the bot. Every state in words: loading, no answer, asleep. Both home groups share one answer.

import { Bot, CalendarRange, Gauge, Hourglass, Send, Sparkles } from "lucide-react"
import { useEffect, useState } from "react"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import type { TgAgentUi } from "./tg-agent.i18n"
import { TgModelPick } from "./tg-model-pick.client"
import { TgRowView } from "./tg-row"

export type Agent = { mode: "coding" | "waiting" | "sleeping"; model: string | null; effort: string | null; ultracode: boolean; account: "node" | "own" | null; bot: string | null }
type Window = { used: number; resetsAt: string | null } | null
type Answer = { agent: Agent; live: boolean; context: { percent: number; size: number | null } | null; limits: { fiveHour: Window; sevenDay: Window } | null }

const word = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)
const fill = (s: string, v: Record<string, string | number>) => s.replace(/\{(\w+)\}/g, (h, k: string) => (k in v ? String(v[k]) : h))

/** One question to the door for every group of the screen; a switch asks again. */
let asked: { lang: string; at: number; p: Promise<Answer | null> } | null = null
function ask(lang: string, fresh = false): Promise<Answer | null> {
  if (!fresh && asked && asked.lang === lang && Date.now() - asked.at < 5_000) return asked.p
  const p = fetch(`/${lang}/tg/api/agent`, { cache: "no-store" })
    .then((r) => r.json())
    .then((b: { ok?: boolean } & Partial<Answer>) => (b?.ok && b.agent ? ({ ...b, limits: b.limits ?? null } as Answer) : null))
    .catch(() => null)
  asked = { lang, at: Date.now(), p }
  return p
}

export function TgAgent({ lang, variant, ui }: { lang: string; variant: "home" | "fuel" | "element"; ui: TgAgentUi }) {
  const [got, setGot] = useState<Answer | "loading" | "error">("loading")
  const [open, setOpen] = useState(false)
  const load = (fresh = false) => ask(lang, fresh).then((a) => setGot(a ?? "error"))
  useEffect(() => {
    let live = true
    ask(lang).then((a) => { if (live) setGot(a ?? "error") })
    return () => { live = false }
  }, [lang])

  if (got === "loading") return <Skeleton className="h-14 w-full rounded-none" data-block="tg-agent-wait" />
  if (got === "error") return <TgRowView hint={ui.noAnswer} media={<Bot aria-hidden className="size-[18px]" />} title={ui.agent} />
  const a = got.agent
  if (variant === "element") {
    return (
      <>
        <TgRowView hint={a.account === "own" ? ui.own : a.account === "node" ? ui.node : ui.notSigned} media={<Sparkles aria-hidden className="size-[18px]" />} title={ui.subscription} />
        <TgRowView divided external hint={a.bot ? `@${a.bot}` : ui.noBot} href={a.bot ? `https://t.me/${a.bot}` : null} media={<Send aria-hidden className="size-[18px]" />} title={ui.bot} />
      </>
    )
  }
  if (variant === "fuel") {
    const c = got.context
    const time = (iso: string | null) => (iso ? new Date(iso).toLocaleString(lang, { weekday: "short", hour: "2-digit", minute: "2-digit" }) : null)
    const limit = (w: Window, title: string, icon: React.ReactNode, id: string) => (
      <TgRowView divided hint={w ? [fill(ui.used, { n: w.used }), w.resetsAt ? fill(ui.resets, { time: time(w.resetsAt) ?? "" }) : null].filter(Boolean).join(" · ") : ui.notMeasured} media={icon} title={title}>
        {w ? <Progress aria-label={title} className="mt-1.5 h-1.5" data-block={`tg-agent-${id}`} value={Math.min(100, Math.max(0, w.used))} /> : null}
      </TgRowView>
    )
    return (
      <>
        <TgRowView hint={c ? [fill(ui.used, { n: c.percent }), c.size ? fill(ui.ofTokens, { size: c.size.toLocaleString(lang) }) : null].filter(Boolean).join(" ") : ui.noWindow} media={<Gauge aria-hidden className="size-[18px]" />} title={ui.window}>
          {c ? <Progress aria-label={ui.window} className="mt-1.5 h-1.5" data-block="tg-agent-fuel" value={Math.min(100, Math.max(0, c.percent))} /> : null}
        </TgRowView>
        {limit(got.limits?.fiveHour ?? null, ui.fiveHour, <Hourglass aria-hidden className="size-[18px]" />, "five")}
        {limit(got.limits?.sevenDay ?? null, ui.sevenDay, <CalendarRange aria-hidden className="size-[18px]" />, "week")}
      </>
    )
  }
  const model = a.ultracode ? "Ultracode" : a.model ? word(a.model) : ui.defaultModel
  return (
    <Collapsible data-block="tg-agent-card" onOpenChange={setOpen} open={open}>
      <CollapsibleTrigger className="w-full text-left hover:bg-muted/60 active:bg-muted">
        <TgRowView aside={open ? null : ui.change} hint={[model, a.effort ? `${ui.effort} ${a.effort}` : null].filter(Boolean).join(" · ")} media={<Bot aria-hidden className="size-[18px]" />} title={ui[a.mode]} />
      </CollapsibleTrigger>
      <CollapsibleContent data-block="tvlkp">{open ? <TgModelPick agent={a} lang={lang} onDone={() => load(true)} ui={ui} /> : null}</CollapsibleContent>
    </Collapsible>
  )
}
