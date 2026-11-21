// @local — the grouped list of this element's Telegram Mini App (node step 821): a quiet head over a card of rows, the look of
// Telegram's own settings the owner chose for the Pult's family (Telegram 429, 431, 438). Bound to the /tg branch; rows are shadcn
// Item, icons are lucide by name, colours are tokens (the page and card surfaces come from `[data-tg-app]` in styles/globals.css).

import type { ReactNode } from "react"
import { icons, type LucideIcon } from "lucide-react"
import { ItemGroup } from "@/components/ui/item"
import { Eyebrow } from "@/components/ui/typography"
import { cn } from "@/lib/utils"
import { TgRowView, type TgRowViewProps } from "./tg-row"

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

type RowProps = Omit<TgRowViewProps, "media" | "children"> & {
  /** a lucide icon by its kebab name; no icon — a text row (the items of a direction) */
  icon?: string | null
}

/** One row by an icon's name (a server screen); a browser island draws `TgRowView` with its own icon. */
export function TgRow({ icon, ...rest }: RowProps) {
  return <TgRowView {...rest} media={icon ? <TgIcon name={icon} /> : null} />
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
