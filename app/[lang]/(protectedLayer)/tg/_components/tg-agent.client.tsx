"use client"
// @local — the element's own agent in its Mini App (node step 821; the owner's mock v2 A and D, «идеально» 438): after hydration it asks
// the branch's door `/<lang>/tg/api/agent` (the core answers only about this element) and draws, on the home screen, the agent's card
// and its context window, on «Элемент» the subscription and the bot. Every state in words: loading, no answer, asleep.

import { Bot, Gauge, Send, Sparkles } from "lucide-react"
import { useEffect, useState } from "react"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import type { TgAgentUi } from "./tg-agent.i18n"
import { TgRowView } from "./tg-row"

type Agent = { mode: "coding" | "waiting" | "sleeping"; model: string | null; effort: string | null; ultracode: boolean; account: "node" | "own" | null; bot: string | null }
type Answer = { agent: Agent; live: boolean; context: { percent: number; size: number | null } | null }

const word = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)
const fill = (s: string, v: Record<string, string | number>) => s.replace(/\{(\w+)\}/g, (h, k: string) => (k in v ? String(v[k]) : h))

export function TgAgent({ lang, variant, ui }: { lang: string; variant: "home" | "element"; ui: TgAgentUi }) {
  const [got, setGot] = useState<Answer | "loading" | "error">("loading")
  useEffect(() => {
    let live = true
    fetch(`/${lang}/tg/api/agent`, { cache: "no-store" })
      .then((r) => r.json())
      .then((b: { ok?: boolean } & Partial<Answer>) => { if (live) setGot(b?.ok && b.agent ? (b as Answer) : "error") })
      .catch(() => { if (live) setGot("error") })
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
  const model = a.ultracode ? "Ultracode" : a.model ? word(a.model) : ui.defaultModel
  const c = got.context
  return (
    <>
      <TgRowView hint={[model, a.effort ? `${ui.effort} ${a.effort}` : null].filter(Boolean).join(" · ")} media={<Bot aria-hidden className="size-[18px]" />} title={ui[a.mode]} />
      <TgRowView divided hint={c ? [fill(ui.used, { n: c.percent }), c.size ? fill(ui.ofTokens, { size: c.size.toLocaleString(lang) }) : null].filter(Boolean).join(" ") : ui.noWindow} media={<Gauge aria-hidden className="size-[18px]" />} title={ui.window}>
        {c ? <Progress aria-label={ui.window} className="mt-1.5 h-1.5" data-block="tg-agent-fuel" value={Math.min(100, Math.max(0, c.percent))} /> : null}
      </TgRowView>
    </>
  )
}
