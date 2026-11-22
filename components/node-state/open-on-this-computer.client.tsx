"use client"

import { useEffect, useState } from "react"
import { ExternalLink, Monitor } from "lucide-react"
import { buttonVariants } from "@/components/ui/button"
import { isLoopbackHostname } from "@/lib/auth/owner-at-machine"
import { askNodePlace } from "./use-node-place.client"

// ВЫХОД ИЗ ОТКАЗА НА ВРЕМЕННОМ АДРЕСЕ: «ОТКРЫТЬ НА ЭТОМ КОМПЬЮТЕРЕ» (шаг 372-2).
//
// 🔒 СЛОВО ВЛАДЕЛЬЦА 2026-10-02: «управлять подпиской может только архитектор с этого компьютера или своего домена … но ничего
// на этой странице больше нет? … Нужна кнопка переключиться на адрес этого компьютера … нажатие приведёт открытие этой панели
// в новой вкладке?». Отказ без следующего шага — тупик. Здесь: причина отказа + кнопка на ту же страницу пульта по адресу
// компьютера, в новой вкладке. Работает у человека за этой машиной — так и сказано в тексте.
//
// 🔒 АДРЕС ПУЛЬТА СПРАШИВАЕТСЯ, А НЕ ПОМНИТСЯ: поле `nodeUrl` двери `/api/domain/state` (порт из `logs/runtime.json`). Один
// запрос при показе, кнопка — только на временном адресе; не на нём отказ показывается как раньше. Слова приходят пропсами из
// словаря комплекта (сервер выбирает язык — закон доставки словарей).

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? ""

/** Адрес той же страницы пульта на этом компьютере — на любом адресе, кроме самой петли (373-2: Preview на своём домене узла
 *  тоже ведёт сюда; было — только временный адрес), иначе null. */
function useLocalHref(): string | null {
  const [href, setHref] = useState<string | null>(null)
  useEffect(() => {
    if (isLoopbackHostname(window.location.hostname)) return
    let alive = true
    // 741-6: a server has no «this computer» to open — the visitor's own computer is not the node's.
    void askNodePlace().then((place) => {
      if (!alive || place?.kind === "server") return
      return fetch(`${BASE}/api/domain/state`, { cache: "no-store" })
        .then((r) => (r.ok ? r.json() : null))
        .then((d: { nodeUrl?: string | null } | null) => {
          if (alive && d?.nodeUrl) setHref(`${d.nodeUrl.replace(/\/+$/, "")}${window.location.pathname}${window.location.search}`)
        })
        .catch(() => setHref(null))
    })
    return () => { alive = false }
  }, [])
  return href
}

function ExitButton({ href, open }: { href: string; open: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      data-open-on-this-computer={href}
      className={buttonVariants({ size: "sm", className: "gap-1.5 self-start" })}
    >
      <Monitor className="size-4" aria-hidden />
      {open}
      <ExternalLink className="size-4" aria-hidden />
    </a>
  )
}

export function ForbiddenWithExit({ reason, why, open }: { reason: string; why: string; open: string }) {
  const href = useLocalHref()
  if (!href) return <p data-block="y9w8s" className="my-6 text-muted-foreground text-sm">{reason}</p>
  return (
    <div data-block="tg3wz" className="my-6 flex flex-col gap-3">
      <p data-block="d0mx2" className="text-muted-foreground text-sm">{why}</p>
      <ExitButton href={href} open={open} />
    </div>
  )
}

/** Только кнопка — для экранов, у которых своя причина (372-4: Preview на временном адресе). */
export function OpenOnThisComputerButton({ open }: { open: string }) {
  const href = useLocalHref()
  return href ? <ExitButton href={href} open={open} /> : null
}
