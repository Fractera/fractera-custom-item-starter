"use client"

import { useEffect } from "react"
import { useDrawer } from "@/providers/drawer-provider.client"

// МОСТ МЕЖДУ КНОПКАМИ ЯЩИКОВ В ШАПКЕ ЯДРА И ЯЩИКАМИ ЭЛЕМЕНТА (узел, шаг 727-2). Шапку оживляет React ядра, ящики — React элемента;
// общего контекста нет, они говорят двумя событиями окна. Имена — договор с ядром (`_tools/shell-kit/types/drawer-events.ts` ядра):
// меняются только вместе.
const TOGGLE = "shell-kit:drawer-toggle"
const STATE = "shell-kit:drawer-state"

export function DrawerBridge() {
  const { leftOpen, rightOpen, toggle } = useDrawer()
  useEffect(() => {
    const on = (e: Event) => {
      const side = (e as CustomEvent<{ side?: string }>).detail?.side
      if (side === "left" || side === "right") toggle(side)
    }
    window.addEventListener(TOGGLE, on)
    return () => window.removeEventListener(TOGGLE, on)
  }, [toggle])
  useEffect(() => {
    window.dispatchEvent(new CustomEvent(STATE, { detail: { left: leftOpen, right: rightOpen } }))
  }, [leftOpen, rightOpen])
  return null
}
