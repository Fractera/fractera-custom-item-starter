"use client"
// @local — the head of a screen of this element's Telegram Mini App (node step 821): ☰ that opens the drawer beside the large title,
// one quiet line under it and, deeper in, the way back. The owner's mock v2 (Telegram 432–433, «идеально» 438). Bound to the /tg branch:
// the drawer lives in `tg-shell.client.tsx`; a screen with this head hides the shell's fallback bar.

import Link from "next/link"
import { ChevronLeft, Menu, RotateCw } from "lucide-react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { H1, Small } from "@/components/ui/typography"
import { useTgMenu } from "./tg-shell.client"

/** 840-4: `refresh` — the label of ↻ on the right (the Pult's head): the page asks the server again and its islands ask their doors. */
type Props = { title: string; line?: string | null; back?: { href: string; label: string } | null; refresh?: string | null }

export function TgHead({ title, line, back, refresh }: Props) {
  const menu = useTgMenu()
  const router = useRouter()
  return (
    <div className="flex flex-col gap-1 px-4 pt-3 pb-1" data-block="tg-head" data-tg-head="">
      {back ? (
        <Link className="-ml-1.5 flex h-9 w-fit max-w-full min-w-0 items-center gap-0.5 text-[length:var(--fs-body)] text-primary" href={back.href}>
          <ChevronLeft aria-hidden className="size-5" />
          <span className="truncate">{back.label}</span>
        </Link>
      ) : null}
      <div className="flex items-center gap-3" data-block="tg-head-row">
        <Button aria-label={menu.label} className="size-10 shrink-0 rounded-xl bg-[var(--tg-card)]" onClick={menu.open} size="icon" variant="ghost">
          <Menu aria-hidden className="size-5" />
        </Button>
        <H1 data-block="k2z11" className="min-w-0 flex-1 truncate py-0.5">{title}</H1>
        {refresh ? (
          <Button aria-label={refresh} className="size-10 shrink-0 rounded-full bg-[var(--tg-card)] text-primary" onClick={() => { router.refresh(); window.dispatchEvent(new Event("tg-refresh")) }} size="icon" variant="ghost">
            <RotateCw aria-hidden className="size-5" />
          </Button>
        ) : null}
      </div>
      {line ? <Small data-block="fcinc" className="min-w-0 pl-[52px] break-words text-pretty">{line}</Small> : null}
    </div>
  )
}
