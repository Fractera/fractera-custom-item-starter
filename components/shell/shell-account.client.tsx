"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { ChevronDown, LogIn, LogOut, User } from "lucide-react"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Button, buttonVariants } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Small } from "@/components/ui/typography"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { cn } from "@/lib/utils"
import type { ShellLink, ShellSide } from "./shell-types"
import { useShellMe } from "./shell-me.client"
import { isTemporaryHostname } from "./temporary-host"
import { ArchitectAttention, AttentionDot, hasAttention, useAttention, type AttentionWords } from "./shell-attention.client"

// ВХОД И КАБИНЕТ ОБОЛОЧКИ. Перенесено из сайта (`components/menu/account/*`) без изменения вида. Двери входа
// (`meUrl`, `loginHref`, `logoutHref`) — свои у каждой поверхности: у сайта и ядра `/api/me`, `/login`,
// `/logout` (их прокси ведёт на службу входа), у самой службы входа — её собственные адреса.
//
// 🔒 `prefetch={false}` на всех адресах входа: Next заранее тянет страницы по видимым ссылкам, а `/login` и
// `/logout` уводят на другой домен — ошибка CORS в консоли на каждой странице (найдено владельцем 2026-08-13).

type Labels = { signIn: string; account: string; signOut: string }

function AccountDrawer({ side, labels, email, roles = [], links, logoutHref, attentionUrl, attentionWords }: {
  side: ShellSide
  labels: Labels
  email?: string
  roles?: string[]
  links: ShellLink[]
  logoutHref: string
  attentionUrl?: string
  attentionWords?: AttentionWords
}) {
  const [open, setOpen] = useState(false)
  // Пункт со списком ролей виден только тому, у кого есть хоть одна из них; замок — на самой странице.
  const items = links.filter((l) => !l.roles || l.roles.some((r) => roles.includes(r)))
  // 356-1 (только ядро передаёт адрес): что ждёт архитектора — терминалы и готовые предпросмотры; точка на кнопке и путь внутри.
  const isArchitect = roles.includes("architect") || roles.includes("admin")
  const { attention, refresh } = useAttention(isArchitect ? attentionUrl : undefined)
  const waiting = hasAttention(attention) && !!attentionWords
  // 862-12 (шаг ядра; владелец узла 2026-11-27, Telegram 1670): общие пункты ящика от ядра — три страницы клиента «Маркетплейс» —
  // спрашиваются при открытии (`/api/account-links`), только для людей проекта: архитектора, администратора и администратора элемента.
  const [shared, setShared] = useState<{ key: string; label: string; href: string }[]>([])
  const forProject = roles.some((r) => r === "architect" || r === "admin" || /^elementAdmin\d+$/.test(r))
  const askShared = () => {
    if (!forProject) return
    const lang = (typeof document !== "undefined" && document.documentElement.lang) || "en"
    fetch(`/api/account-links?lang=${encodeURIComponent(lang)}`, { cache: "no-store" })
      .then((r) => r.json())
      .then((b: { links?: { key: string; label: string; href: string }[] }) => setShared(Array.isArray(b.links) ? b.links : []))
      .catch(() => setShared([]))
  }
  const openDrawer = () => { setOpen(true); refresh(); askShared() }

  return (
    <>
      {/* md и уже — только значок (278); подпись остаётся доступным именем на любой ширине. */}
      <Button variant="ghost" size="sm" onClick={openDrawer} aria-label={labels.account} className="relative">
        <User /><span className="hidden lg:inline">{labels.account}</span>
        {waiting && <AttentionDot className="absolute right-0.5 top-0.5" />}
      </Button>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side={side} className="w-80 sm:max-w-sm p-0 gap-0 flex flex-col">
          <SheetHeader className="border-b border-border">
            <SheetTitle>{labels.account}</SheetTitle>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto px-4 py-4">
            {items.length > 0 && (
              <nav className="flex flex-col gap-0.5">
                {items.map((l) => l.children?.length ? (
                  // 834-6: «Проекты» — the pages built for the person's projects, opened in place
                  <Collapsible key={l.href} data-block="shell-account-group">
                    <CollapsibleTrigger className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "group w-full justify-between")}>
                      {l.label}<ChevronDown className="transition-transform group-data-[state=open]:rotate-180" />
                    </CollapsibleTrigger>
                    <CollapsibleContent className="flex flex-col gap-0.5 border-l border-border ml-3 pl-2">
                      {/* 834-11: a child with no address is a line of words — «Проекты» with nothing built yet says so instead of hiding */}
                      {l.children.map((c) => c.href ? (
                        <Link key={c.href} href={c.href} onClick={() => setOpen(false)} className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "w-full justify-start")}>
                          {c.label}
                        </Link>
                      ) : (
                        <Small key={c.label} className="px-3 py-1.5" data-block="shell-account-empty">{c.label}</Small>
                      ))}
                    </CollapsibleContent>
                  </Collapsible>
                ) : waiting && attention && attentionWords && /\/architect\/?$/.test(l.href) ? (
                  <ArchitectAttention key={l.href} href={l.href} label={l.label} attention={attention} words={attentionWords} onGo={() => setOpen(false)} />
                ) : (
                  <Link
                    key={l.href}
                    href={l.href}
                    onClick={() => setOpen(false)}
                    className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "w-full justify-start")}
                  >
                    {l.label}
                  </Link>
                ))}
              </nav>
            )}
            {shared.length > 0 && (
              <nav className="mt-2 flex flex-col gap-0.5 border-t border-border pt-2" data-block="shell-account-shared">
                {shared.map((l) => (
                  // a link through the core's door leaves for another address — a plain full navigation
                  <a key={l.key} href={l.href} onClick={() => setOpen(false)} className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "w-full justify-start")}>
                    {l.label}
                  </a>
                ))}
              </nav>
            )}
          </div>

          <div className="mt-auto border-t border-border p-3 flex flex-col gap-3">
            {roles.length > 0 && (
              <div className="hide-scrollbar flex gap-1.5 overflow-x-auto">
                {roles.map((r) => (
                  <Badge key={r} variant="secondary" className="shrink-0">{r}</Badge>
                ))}
              </div>
            )}
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-sm text-foreground truncate">{email}</span>
            </div>
            <Separator />
            <Link href={logoutHref} prefetch={false} className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "w-full justify-start")}>
              <LogOut />{labels.signOut}
            </Link>
          </div>
        </SheetContent>
      </Sheet>
    </>
  )
}

export function AccountButton({ side, labels, links, meUrl, loginHref, logoutHref, attentionUrl, attentionWords }: {
  side: ShellSide
  labels: Labels
  links: ShellLink[]
  meUrl: string
  loginHref: string
  logoutHref: string
  attentionUrl?: string
  attentionWords?: AttentionWords
}) {
  const me = useShellMe(meUrl)

  // На временном публичном адресе кнопки входа нет: `/login` там отвечает честным 404 (257-8).
  const [temporaryHost, setTemporaryHost] = useState(false)
  useEffect(() => {
    setTemporaryHost(isTemporaryHostname(window.location.hostname))
  }, [])

  if (temporaryHost && !(me && me.userId)) return null
  if (me && me.userId) {
    return <AccountDrawer side={side} labels={labels} email={me.email} roles={me.roles} links={links} logoutHref={logoutHref} attentionUrl={attentionUrl} attentionWords={attentionWords} />
  }
  return (
    // 293: как у «Личного кабинета» (278) — на md и уже только значок, подпись с lg; остаётся доступным именем.
    // Слово владельца 2026-09-24: «ты кнопку мой аккаунт сделал для этой логики а кнопку войти не сделал».
    <Link href={loginHref} prefetch={false} aria-label={labels.signIn} title={labels.signIn} className={buttonVariants({ variant: "ghost", size: "sm" })}>
      <LogIn /><span className="hidden lg:inline">{labels.signIn}</span>
    </Link>
  )
}
