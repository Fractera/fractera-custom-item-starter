"use client"
// @local — the frame of this element's Telegram Mini App (node step 789): the top bar with ☰ and the left drawer — the menu's two
// modes and its categories opening downward. Bound to the /tg branch; the menu comes from `_data/menu.json` through `_libs/tg-menu.ts`.

import Link from "next/link"
import { usePathname } from "next/navigation"
import { type ReactNode, useState } from "react"
import { CalendarDays, ChevronDown, ChevronRight, Circle, CircleHelp, CreditCard, Folder, Globe, House, Inbox, type LucideIcon, Menu, PenLine, Plus, Settings, Star, Store, Wallet } from "lucide-react"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import type { TgItem, TgMode, TgUi } from "../_libs/tg-menu"

// The owner, 2026-11-18 (Telegram 741–743): «мне нужен интерфейс в котором … шаги могут открываться вниз … папка проекты … папка
// авторы» · «верхнее меню … рабочее пространство для собственных проектов … А2А web4 взаимодействия» · «подписки с выпадающим
// списком. И крон автоматизация». Design (interface-design): one hand on a phone, Telegram's own settings lists as the native feel; the
// current page is the focal point (muted fill + a primary bar); rows 56 px, children 44 px; depth by borders only; tokens only.
const ICONS: Record<string, LucideIcon> = { home: House, card: CreditCard, calendar: CalendarDays, settings: Settings, help: CircleHelp, store: Store, inbox: Inbox, star: Star, wallet: Wallet, folder: Folder, pen: PenLine }
const ROW = "relative flex min-h-14 items-center gap-3 rounded-xl px-3 py-2 text-foreground transition-colors hover:bg-muted/60"
const CURRENT = "bg-muted before:absolute before:inset-y-3.5 before:left-0 before:w-[3px] before:rounded-full before:bg-primary"

type Props = { lang: string; siteName: string; site: string; modes: TgMode[]; common: TgItem[]; ui: TgUi; children: ReactNode }

export function TgShell({ lang, siteName, site, modes, common, ui, children }: Props) {
  const path = usePathname() ?? ""
  const base = `/${lang}/tg`
  const slug = path.startsWith(base) ? path.slice(base.length).replace(/^\/+|\/+$/g, "") : ""
  // 757: the common items are outside every mode — opening one keeps the mode the person chose
  const owner = (m: TgMode) => m.groups.some((g) => g.items.some((it) => it.slug === slug || it.children?.some((c) => c.slug === slug)))
  const [mode, setMode] = useState(() => (modes.find(owner) ?? modes[0])?.id ?? "")
  const [open, setOpen] = useState(false)
  const all = [...modes.flatMap((m) => m.groups.flatMap((g) => g.items)), ...common]
  const current = all.flatMap((it) => [it, ...(it.children ?? [])]).find((it) => it.slug === slug)
  const active = modes.find((m) => m.id === mode) ?? modes[0]
  const href = (s: string) => (s ? `${base}/${s}` : base)
  const row = (it: TgItem) => it.children ? <Category href={href} item={it} key={it.slug} onGo={() => setOpen(false)} slug={slug} /> : (
    <Link className={cn(ROW, it.slug === slug && CURRENT)} href={href(it.slug)} key={it.slug} onClick={() => setOpen(false)}>
      <Tile icon={it.icon} on={it.slug === slug} />
      <span className="flex min-w-0 flex-col">
        <span className="font-medium text-[15px] leading-tight">{it.title}</span>
        {it.hint ? <span className="truncate text-[13px] text-muted-foreground leading-snug">{it.hint}</span> : null}
      </span>
    </Link>
  )

  return (
    <div className="flex min-h-dvh flex-col" data-block="tg-shell">
      <Sheet onOpenChange={setOpen} open={open}>
        <div className="sticky top-0 z-10 flex h-14 items-center gap-1 border-b border-border bg-background px-2" data-block="tg-bar">
          <SheetTrigger aria-label={ui.open} className="grid size-11 place-items-center rounded-xl text-foreground hover:bg-muted">
            <Menu className="size-5" />
          </SheetTrigger>
          <span className="truncate font-semibold text-[17px] tracking-tight">{current?.title ?? siteName}</span>
        </div>
        <SheetContent className="flex w-[316px] max-w-[85vw] flex-col gap-0 p-0" side="left">
          <SheetHeader className="flex-row items-center gap-3 border-b border-border px-4 py-3 text-left" data-block="tg-drawer-head">
            <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary font-semibold text-primary-foreground">{siteName.slice(0, 1).toUpperCase()}</span>
            <span className="flex min-w-0 flex-col">
              <SheetTitle className="truncate text-base">{siteName}</SheetTitle>
              <SheetDescription className="text-[13px]">{ui.role}</SheetDescription>
            </span>
          </SheetHeader>
          {modes.length > 1 ? (
            <Tabs className="px-3 pt-3" onValueChange={setMode} value={active?.id}>
              <TabsList aria-label={ui.modes} className="h-11 w-full">
                {modes.map((m) => <TabsTrigger className="h-9 whitespace-nowrap" key={m.id} value={m.id}>{m.title}</TabsTrigger>)}
              </TabsList>
            </Tabs>
          ) : null}
          <nav className="flex-1 overflow-y-auto px-2 pb-2" data-block="tg-drawer-nav">
            {active?.groups.map((g, gi) => (
              <div className="pt-2" data-block="tg-drawer-group" key={`${active.id}-${gi}`}>
                {g.title ? <p className="px-3 pt-2 pb-1.5 font-semibold text-[11px] text-muted-foreground uppercase tracking-wider">{g.title}</p> : null}
                {g.items.map(row)}
              </div>
            ))}
            {/* 757 (the owner: «Подписки, крон автоматизации, настройки элемента должны существовать снаружи вкладки мои проекты и
                находиться на одном уровне с мои проекты и a2a web4»): the common items, under a line, in every mode */}
            {common.length ? <div className="mt-2 border-t border-border pt-2" data-block="tg-drawer-common">{common.map(row)}</div> : null}
          </nav>
          {site ? (
            <div className="border-t border-border px-4 pt-3 pb-7" data-block="tg-drawer-foot">
              <a className="flex h-11 items-center justify-center gap-2 rounded-xl border border-border font-medium text-[15px] hover:bg-muted" href={site}>
                <Globe className="size-5" />{ui.site}
              </a>
            </div>
          ) : null}
        </SheetContent>
      </Sheet>
      <div className="flex-1" data-block="tg-screen">{children}</div>
    </div>
  )
}

function Tile({ icon, on }: { icon: string; on: boolean }) {
  const I = ICONS[icon] ?? Circle
  return <span className={cn("grid size-9 shrink-0 place-items-center rounded-[10px] bg-muted text-foreground", on && "bg-background shadow-[inset_0_0_0_1px_var(--border)]")}><I className="size-5" /></span>
}

/** A category opens downward: its own things (projects, authors, services) and the line that adds one. */
function Category({ item, slug, href, onGo }: { item: TgItem; slug: string; href: (s: string) => string; onGo: () => void }) {
  const kids = item.children ?? []
  const inside = item.slug === slug || kids.some((c) => c.slug === slug)
  const [open, setOpen] = useState(inside)
  return (
    <Collapsible data-block="tg-drawer-category" onOpenChange={setOpen} open={open}>
      <CollapsibleTrigger className={cn(ROW, "w-full text-left", item.slug === slug && CURRENT)}>
        <Tile icon={item.icon} on={open} />
        <span className="min-w-0 flex-1 font-medium text-[15px] leading-tight">{item.title}</span>
        {kids.length ? <span className="grid h-[22px] min-w-[22px] place-items-center rounded-full bg-muted px-1.5 font-medium text-muted-foreground text-xs tabular-nums">{kids.length}</span> : null}
        {open ? <ChevronDown className="size-[18px] text-muted-foreground" /> : <ChevronRight className="size-[18px] text-muted-foreground" />}
      </CollapsibleTrigger>
      <CollapsibleContent className="mb-1.5 ml-[29px] flex flex-col border-l border-border pl-[19px]">
        {kids.map((c) => (
          <Link className={cn("flex min-h-11 items-center gap-2.5 rounded-[10px] px-2.5 text-[15px] text-foreground hover:bg-muted/60", c.slug === slug && "bg-muted font-medium")} href={href(c.slug)} key={c.slug} onClick={onGo}>
            <span className={cn("size-1.5 shrink-0 rounded-full bg-muted-foreground", c.slug === slug && "bg-primary")} />
            <span className="min-w-0 flex-1 truncate">{c.title}</span>
            {c.note ? <span className="text-[13px] text-muted-foreground">{c.note}</span> : null}
          </Link>
        ))}
        <Link className="flex min-h-11 items-center gap-2.5 rounded-[10px] px-2.5 text-[15px] text-muted-foreground hover:bg-muted/60" href={href(item.slug)} onClick={onGo}>
          <Plus className="size-4" />
          <span className="truncate">{item.add ?? item.title}</span>
        </Link>
      </CollapsibleContent>
    </Collapsible>
  )
}
