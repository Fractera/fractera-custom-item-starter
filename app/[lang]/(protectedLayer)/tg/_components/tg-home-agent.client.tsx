"use client"
// @local — the top of this element's Mini App home, the same as the top of the node's Pult (node step 840-4; the owner's mock A, Telegram 969,
// 971: «небо и земля от того как выглядит верхняя часть твоего пульта»): «● элемент в сети · обновлено», the card «Агент элемента» (model ·
// effort, its own account, the badge; a tap opens the model choice), «Топливо подписки» — the context window big with its bar and the
// 5-hour and 7-day use in two columns — and «Ждёт вас». One answer of the branch's door `../api/agent`; ↻ in the head asks again.

import { ChevronRight } from "lucide-react"
import { useCallback, useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { Eyebrow, Metric, Small } from "@/components/ui/typography"
import { cn } from "@/lib/utils"
import type { Agent } from "./tg-agent.client"
import type { TgAgentUi } from "./tg-agent.i18n"
import { TgModelPick } from "./tg-model-pick.client"

type Window = { used: number; resetsAt: string | null } | null
type Answer = { agent: Agent & { email?: string | null }; live: boolean; context: { percent: number; size: number | null; used?: number | null } | null; limits: { fiveHour: Window; sevenDay: Window } | null; asks?: { text: string; at: string }[] }

const fill = (s: string, v: Record<string, string | number>) => s.replace(/\{(\w+)\}/g, (h, k: string) => (k in v ? String(v[k]) : h))
/** The Pult's rule of the context colour: calm to half, warm to three quarters, hot after. */
const heat = (p: number) => (p < 50 ? "green" : p < 75 ? "orange" : "red") as "green" | "orange" | "red"
const TEXT = { green: "text-(--tg-tile-green)", orange: "text-(--tg-tile-orange)", red: "text-(--tg-tile-red)" }
const BAR = { green: "[&>[data-slot=progress-indicator]]:bg-(--tg-tile-green)", orange: "[&>[data-slot=progress-indicator]]:bg-(--tg-tile-orange)", red: "[&>[data-slot=progress-indicator]]:bg-(--tg-tile-red)" }

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-1.5" data-block="tg-home-group">
      <Eyebrow data-block="tgh01" className="px-4 text-muted-foreground tracking-wider">{title}</Eyebrow>
      {children}
    </section>
  )
}

export function TgHomeAgent({ lang, ui }: { lang: string; ui: TgAgentUi }) {
  const [got, setGot] = useState<Answer | "loading" | "error">("loading")
  const [at, setAt] = useState<Date | null>(null)
  const [open, setOpen] = useState(false)
  const load = useCallback(() => {
    fetch(`/${lang}/tg/api/agent`, { cache: "no-store" })
      .then((r) => r.json())
      .then((b: { ok?: boolean } & Partial<Answer>) => { setGot(b?.ok && b.agent ? (b as Answer) : "error"); setAt(new Date()) })
      .catch(() => setGot("error"))
  }, [lang])
  useEffect(() => {
    load()
    window.addEventListener("tg-refresh", load)
    return () => window.removeEventListener("tg-refresh", load)
  }, [load])

  if (got === "loading") return <Skeleton className="h-40 w-full rounded-xl" data-block="tg-home-agent-wait" />
  const time = at ? at.toLocaleTimeString(lang, { hour: "2-digit", minute: "2-digit" }) : ""
  if (got === "error") return <Small data-block="tg-home-agent-error" className="px-4">{ui.noAnswer}</Small>
  const a = got.agent
  const c = got.context
  const model = a.ultracode ? "Ultracode" : a.model ? `${a.model.charAt(0).toUpperCase()}${a.model.slice(1)}` : ui.defaultModel
  const w = (x: Window, title: string) => (
    <div className="flex min-w-0 flex-col gap-1" data-block="tg-home-limit">
      <Small data-block="tgh02">{title}</Small>
      <Metric data-block="tgh03" className="text-[length:var(--fs-h3)] tabular-nums">{x ? `${x.used} %` : "—"}</Metric>
      {x ? <Progress aria-label={title} className={cn("h-1.5", x.used >= 85 && BAR.red)} value={Math.min(100, x.used)} /> : null}
      <Small data-block="tgh04">{x?.resetsAt ? fill(ui.resets, { time: new Date(x.resetsAt).toLocaleString(lang, { weekday: "short", hour: "2-digit", minute: "2-digit" }) }) : ui.notMeasured}</Small>
    </div>
  )
  const asks = got.asks ?? []
  return (
    <div className="flex flex-col gap-6" data-block="tg-home-agent">
      <Small data-block="tg-home-online" className="-mt-4 flex items-center gap-1.5 px-4">
        <span aria-hidden className="size-1.5 rounded-full bg-(--tg-tile-green)" />
        {fill(ui.online, { time })}
      </Small>
      <Collapsible className="overflow-hidden rounded-xl bg-[var(--tg-card)]" data-block="tg-home-agent-card" onOpenChange={setOpen} open={open}>
        <CollapsibleTrigger className="flex w-full items-center gap-3 px-4 py-3 text-left active:bg-muted">
          <span className="flex min-w-0 flex-1 flex-col gap-0.5">
            <Small data-block="tgh05">{ui.agent}</Small>
            <span className="truncate font-semibold text-[length:var(--fs-body)]">{model}{a.effort && !a.ultracode ? ` · ${ui.effort} ${a.effort}` : ""}</span>
            <Small data-block="tgh06" className="truncate">{a.email ?? (a.account === "own" ? ui.own : a.account === "node" ? ui.node : ui.notSigned)}</Small>
          </span>
          <Badge data-block="kghpv" data-agent-mode={a.mode} variant={a.mode === "coding" ? "default" : "secondary"}>{ui.badge[a.mode]}</Badge>
          <ChevronRight aria-hidden className={cn("size-4 text-muted-foreground transition-transform", open && "rotate-90")} />
        </CollapsibleTrigger>
        <CollapsibleContent data-block="t8zgb">{open ? <TgModelPick agent={a} lang={lang} onDone={load} ui={ui} /> : null}</CollapsibleContent>
      </Collapsible>
      <Group title={ui.fuel}>
        <div className="flex flex-col gap-1 rounded-xl bg-[var(--tg-card)] px-4 py-3" data-block="tg-home-context">
          <Small data-block="tgh07">{c?.size ? fill(ui.windowOf, { size: c.size.toLocaleString(lang) }) : ui.window}</Small>
          {c ? (
            <>
              <Metric data-block="tgh08" className={cn("text-[length:var(--fs-h1)] tabular-nums", TEXT[heat(c.percent)])}>{c.percent} %</Metric>
              <Progress aria-label={ui.window} className={cn("h-2", BAR[heat(c.percent)])} value={Math.min(100, c.percent)} />
              {c.used != null && c.size ? <Small data-block="tgh09" className="tabular-nums">{fill(ui.usedOf, { used: c.used.toLocaleString(lang), size: c.size.toLocaleString(lang) })}</Small> : null}
            </>
          ) : <Small data-block="tgh10">{ui.noWindow}</Small>}
        </div>
        <div className="grid grid-cols-2 gap-4 rounded-xl bg-[var(--tg-card)] px-4 py-3" data-block="tg-home-limits">
          {w(got.limits?.fiveHour ?? null, ui.fiveHour)}
          {w(got.limits?.sevenDay ?? null, ui.sevenDay)}
        </div>
      </Group>
      <Group title={ui.asks}>
        <div className="flex flex-col rounded-xl bg-[var(--tg-card)]" data-block="tg-home-asks">
          {asks.length ? asks.map((x, i) => (
            <p data-block="tgh11" className={cn("px-4 py-3 text-[length:var(--fs-body)]", i > 0 && "border-border border-t")} key={`${x.at}-${i}`}>{x.text}</p>
          )) : <Small data-block="tgh12" className="px-4 py-3">{ui.asksNone}</Small>}
        </div>
      </Group>
    </div>
  )
}
