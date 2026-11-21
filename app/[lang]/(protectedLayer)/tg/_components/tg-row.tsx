// @local — one row of the Mini App's grouped lists (node step 821): a tile, the title and its quiet line, a value, a chevron, the hairline
// above it. Presentational only — no icon map, so a browser island (the agent card) draws the same row without shipping lucide's map.

import Link from "next/link"
import type { ReactNode } from "react"
import { ChevronRight } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Item, ItemActions, ItemContent, ItemDescription, ItemMedia, ItemTitle } from "@/components/ui/item"
import { cn } from "@/lib/utils"

export type TgRowViewProps = {
  /** the icon, already drawn; none — a text row (the items of a direction) */
  media?: ReactNode
  title: string
  hint?: string | null
  /** a short value on the right: a count, a date */
  aside?: string | null
  /** an inner address of the Mini App, or the site (`external`) */
  href?: string | null
  external?: boolean
  /** a row the element cannot open yet (the core builds it later) — named, never hidden */
  soon?: string | null
  /** the hairline above the row, under the text and never under the icon (Telegram's lists); the first row has none */
  divided?: boolean
  /** under the title and its line — a bar, a note */
  children?: ReactNode
}

export function TgRowView({ media, title, hint, aside, href, external, soon, divided, children }: TgRowViewProps) {
  const body = (
    <>
      {media ? <ItemMedia className="size-9 rounded-[10px] bg-muted text-foreground">{media}</ItemMedia> : null}
      <ItemContent className="min-w-0 gap-0.5">
        <ItemTitle className="text-[length:var(--fs-body)] leading-snug">{title}</ItemTitle>
        {hint ? <ItemDescription className="line-clamp-1 text-[length:var(--fs-small)]">{hint}</ItemDescription> : null}
        {children}
      </ItemContent>
      <ItemActions className="gap-1.5 text-muted-foreground">
        {soon ? <Badge data-block="qbjpk" variant="secondary">{soon}</Badge> : null}
        {aside ? <span className="text-[length:var(--fs-small)] tabular-nums">{aside}</span> : null}
        {href ? <ChevronRight aria-hidden className="size-4 opacity-60" /> : null}
      </ItemActions>
    </>
  )
  const row = cn(
    "relative min-h-14 flex-nowrap gap-3 rounded-none px-4 py-2.5",
    divided && "before:pointer-events-none before:absolute before:top-0 before:right-0 before:h-px before:bg-border",
    divided && (media ? "before:left-16" : "before:left-4"),
  )
  if (!href) return <Item className={cn(row, soon && "opacity-70")} size="sm">{body}</Item>
  return (
    <Item asChild className={cn(row, "hover:bg-muted/60 active:bg-muted")} size="sm">
      {external ? <a href={href}>{body}</a> : <Link href={href}>{body}</Link>}
    </Item>
  )
}
