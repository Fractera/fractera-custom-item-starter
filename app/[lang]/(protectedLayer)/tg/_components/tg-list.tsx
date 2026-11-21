// @local — the grouped list of this element's Telegram Mini App (node step 821): a quiet head over a card of rows, the look of
// Telegram's own settings the owner chose for the Pult's family (Telegram 429, 431, 438). Bound to the /tg branch; rows are shadcn
// Item, icons are lucide by name, colours are tokens (the page and card surfaces come from `[data-tg-app]` in styles/globals.css).

import Link from "next/link"
import type { ReactNode } from "react"
import { ChevronRight, icons, type LucideIcon } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Item, ItemActions, ItemContent, ItemDescription, ItemGroup, ItemMedia, ItemTitle } from "@/components/ui/item"
import { Eyebrow } from "@/components/ui/typography"
import { cn } from "@/lib/utils"

const pascal = (name: string) => name.split("-").map((p) => p.charAt(0).toUpperCase() + p.slice(1)).join("")

/** A lucide icon by its kebab name (`folder-kanban`); an unknown name draws a circle. */
export function TgIcon({ name, className }: { name: string; className?: string }) {
  const I = (icons as Record<string, LucideIcon>)[pascal(name)] ?? icons.Circle
  return <I aria-hidden className={cn("size-[18px]", className)} />
}

/** A group: its head on the left, a quiet note on the right, the card of rows, and an optional line under the card. */
export function TgGroup({ title, aside, foot, children }: { title?: string | null; aside?: string | null; foot?: ReactNode; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-1.5" data-block="tg-group">
      {title ? (
        <div className="flex items-baseline justify-between gap-3 px-4" data-block="tg-group-head">
          <Eyebrow data-block="zk9y8" className="text-muted-foreground tracking-wider">{title}</Eyebrow>
          {aside ? <span className="text-[length:var(--fs-eyebrow)] text-muted-foreground uppercase tracking-wider tabular-nums">{aside}</span> : null}
        </div>
      ) : null}
      <ItemGroup className="overflow-hidden rounded-xl bg-[var(--tg-card)]" data-block="tg-group-card">{children}</ItemGroup>
      {foot}
    </section>
  )
}

type RowProps = {
  /** no icon — a text row (the items of a direction) */
  icon?: string | null
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
}

/** One row: a tile with the icon, the title and its quiet line, the value and a chevron; without `href` it is a still row. */
export function TgRow({ icon, title, hint, aside, href, external, soon, divided }: RowProps) {
  const body = (
    <>
      {icon ? <ItemMedia className="size-9 rounded-[10px] bg-muted text-foreground"><TgIcon name={icon} /></ItemMedia> : null}
      <ItemContent className="min-w-0 gap-0.5">
        <ItemTitle className="text-[length:var(--fs-body)] leading-snug">{title}</ItemTitle>
        {hint ? <ItemDescription className="line-clamp-1 text-[length:var(--fs-small)]">{hint}</ItemDescription> : null}
      </ItemContent>
      <ItemActions className="gap-1.5 text-muted-foreground">
        {soon ? <Badge data-block="zt4zc" variant="secondary">{soon}</Badge> : null}
        {aside ? <span className="text-[length:var(--fs-small)] tabular-nums">{aside}</span> : null}
        {href ? <ChevronRight aria-hidden className="size-4 opacity-60" /> : null}
      </ItemActions>
    </>
  )
  const row = cn(
    "relative min-h-14 flex-nowrap gap-3 rounded-none px-4 py-2.5",
    divided && "before:pointer-events-none before:absolute before:top-0 before:right-0 before:h-px before:bg-border",
    divided && (icon ? "before:left-16" : "before:left-4"),
  )
  if (!href) return <Item className={cn(row, soon && "opacity-70")} size="sm">{body}</Item>
  return (
    <Item asChild className={cn(row, "hover:bg-muted/60 active:bg-muted")} size="sm">
      {external ? <a href={href}>{body}</a> : <Link href={href}>{body}</Link>}
    </Item>
  )
}

/** Rows with hairlines between them (each row draws the line above itself). */
export function TgRows({ rows }: { rows: RowProps[] }) {
  return rows.map((r, i) => <TgRow {...r} divided={i > 0} key={`${r.title}-${i}`} />)
}

/** A quiet note in a card — an empty list says what will appear and how. */
export function TgNote({ children }: { children: ReactNode }) {
  return <p className="rounded-xl bg-[var(--tg-card)] px-4 py-3.5 text-[length:var(--fs-small)] text-muted-foreground leading-normal" data-block="tg-note">{children}</p>
}

export type { RowProps as TgRowProps }
