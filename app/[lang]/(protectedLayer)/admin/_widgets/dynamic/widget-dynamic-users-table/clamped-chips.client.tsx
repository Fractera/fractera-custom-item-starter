"use client"

import { useLayoutEffect, useRef, useState } from "react"
import { Badge } from "@/components/ui/badge"

// ПЛАШКИ В ДВЕ СТРОКИ — перенос из вкладки «Пользователи» ядра (`components/node-users/clamped-chips.client.tsx`, шаги 554-5, 580-3).
// Владелец 2026-10-22: роли — «максимальной ширина … 200 пикселей максимальное количество рядов два все что не поместилось обрезать и
// рисуй …». Плашка длиннее своего предела обрезается с «…»; что не легло в `rows` строк — заменяется последней плашкой «…». Строки
// меряются после отрисовки (ширину ячейки и шрифт знает только браузер); полный список — в подсказке ячейки.

export function ClampedChips({ items, maxWidth, chipMaxWidth, rows = 2 }: { items: string[]; maxWidth: number; chipMaxWidth?: number; rows?: number }) {
  const box = useRef<HTMLDivElement>(null)
  const [shown, setShown] = useState(items.length)

  useLayoutEffect(() => {
    setShown(items.length)
  }, [items])

  useLayoutEffect(() => {
    const el = box.current
    if (!el || shown !== items.length) return
    const chips = Array.from(el.children) as HTMLElement[]
    const tops = [...new Set(chips.map((c) => c.offsetTop))].sort((a, b) => a - b)
    if (tops.length <= rows) return
    const limit = tops[rows - 1]
    const fit = chips.filter((c) => c.offsetTop <= limit).length
    // Место под «…» — вместо последней влезшей плашки.
    setShown(Math.max(0, fit - 1))
  }, [shown, items, rows])

  const cut = shown < items.length
  return (
    <div data-block="cceck" ref={box} className="flex flex-wrap gap-1" style={{ maxWidth }} title={items.join(", ")} data-chips={items.length} data-chips-shown={cut ? shown : items.length}>
      {items.slice(0, shown).map((t, i) => (
        <Badge data-block="saiqw" key={`${t}-${i}`} variant="outline" className="block truncate" style={chipMaxWidth ? { maxWidth: chipMaxWidth } : undefined}>{t}</Badge>
      ))}
      {cut && <Badge data-block="av9pl" variant="outline" aria-label={items.join(", ")}>…</Badge>}
    </div>
  )
}
