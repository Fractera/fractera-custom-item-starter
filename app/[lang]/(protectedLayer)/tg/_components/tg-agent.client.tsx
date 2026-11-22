"use client"
// @local — the element's own agent on the Mini App's screen «Элемент» (node step 821; the owner's mock v2 D, «идеально» 438): after
// hydration it asks the branch's door `/<lang>/tg/api/agent` (the core answers only about this element) and draws the subscription and the
// bot on coloured tiles. The home screen's top — the agent's card, the fuel, «Ждёт вас» — is `tg-home-agent.client.tsx` (840-4).

import { Bot, Send, Sparkles } from "lucide-react"
import { useEffect, useState } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import type { TgAgentUi } from "./tg-agent.i18n"
import { TgRowView } from "./tg-row"

export type Agent = { mode: "coding" | "waiting" | "sleeping"; model: string | null; effort: string | null; ultracode: boolean; account: "node" | "own" | null; bot: string | null }

export function TgAgent({ lang, ui }: { lang: string; variant?: "element"; ui: TgAgentUi }) {
  const [got, setGot] = useState<Agent | "loading" | "error">("loading")
  useEffect(() => {
    let live = true
    fetch(`/${lang}/tg/api/agent`, { cache: "no-store" })
      .then((r) => r.json())
      .then((b: { ok?: boolean; agent?: Agent }) => { if (live) setGot(b?.ok && b.agent ? b.agent : "error") })
      .catch(() => { if (live) setGot("error") })
    return () => { live = false }
  }, [lang])

  if (got === "loading") return <Skeleton className="h-14 w-full rounded-none" data-block="tg-agent-wait" />
  if (got === "error") return <TgRowView hint={ui.noAnswer} media={<Bot aria-hidden className="size-[18px]" />} title={ui.agent} tone="blue" />
  return (
    <>
      <TgRowView hint={got.account === "own" ? ui.own : got.account === "node" ? ui.node : ui.notSigned} media={<Sparkles aria-hidden className="size-[18px]" />} title={ui.subscription} tone="orange" />
      <TgRowView divided external hint={got.bot ? `@${got.bot}` : ui.noBot} href={got.bot ? `https://t.me/${got.bot}` : null} media={<Send aria-hidden className="size-[18px]" />} title={ui.bot} tone="blue" />
    </>
  )
}
