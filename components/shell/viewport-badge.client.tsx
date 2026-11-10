'use client'
import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { isLoopbackHostname } from '@/lib/auth/owner-at-machine'
import { isTemporaryHostname } from '@/lib/auth/temporary-address'
import { isShowcaseHostname } from '@/lib/showcase'
import { quickNavVisible } from './quick-nav-visibility'

// ИНДИКАТОР ШИРИНЫ И НАВЫКА ДИЗАЙНА — круг в ЛЕВОМ нижнем углу (узел, шаг 715; владелец 2026-11-10: «по дефолту он должен существовать
// также как существует подвал и шапка … если он не помещается пусть он заканчивается тремя точками с необходимым отступом слева и справа
// при наведении мышкой показывает полный название»). Шаг 706-3 унёс его в полосу быстрой навигации — круг вернулся в угол макета.
//
// 🔒 КОМУ: тем же правилом, что полоса (`quickNavVisible`) — эта машина всегда, свой домен только вошедшему архитектору, временный адрес и
// витрина никогда. Посетитель и поисковик круга не получают: до проверки здесь ничего не рисуется, страница остаётся статичной.
// 🔒 КАКОЙ НАВЫК: на странице прототипа — навык этого прототипа (`data-prototype-skill` на его обёртке), иначе — навык паспорта.
// 🔒 ИМЯ НЕ ЛОМАЕТ КРУГ: строка обрезается CSS-многоточием (`truncate`) с отступами по бокам; полное имя — в подсказке при наведении.
// 🔒 КЛИКИ СКВОЗЬ КРУГ: `pointer-events-none` на круге, `auto` только на имени навыка — ради подсказки. Угол левый: справа живут кнопки.
// Выключатель прежний — `viewportBadge` в PLATFORM-CONFIG.
const STEPS: [number, string][] = [[1536, '2xl'], [1280, 'xl'], [1024, 'lg'], [768, 'md'], [640, 'sm']]
const stepName = (w: number) => STEPS.find(([min]) => w >= min)?.[1] ?? 'xs'

export function ViewportBadge({ skill, skillLabel }: { skill: string | null; skillLabel: string }) {
  const pathname = usePathname()
  const [shown, setShown] = useState(false)
  const [width, setWidth] = useState<number | null>(null)
  const [pageSkill, setPageSkill] = useState<string | null>(null)

  useEffect(() => {
    const host = window.location.hostname
    const place = { loopback: isLoopbackHostname(host), temporary: isTemporaryHostname(host), showcase: isShowcaseHostname(host) }
    if (quickNavVisible(place, null)) { setShown(true); return }
    if (place.temporary || place.showcase) return
    let alive = true
    fetch('/api/me', { cache: 'no-store', credentials: 'include' })
      .then((r) => (r.ok ? r.json() : null))
      .then((me: { roles?: string[] } | null) => { if (alive && quickNavVisible(place, me?.roles ?? null)) setShown(true) })
      .catch(() => {})
    return () => { alive = false }
  }, [])

  useEffect(() => {
    if (!shown) return
    const read = () => setWidth(window.innerWidth)
    read()
    window.addEventListener('resize', read)
    return () => window.removeEventListener('resize', read)
  }, [shown])

  // Навык прототипа читается после каждой смены адреса: обёртка прототипа приходит вместе со страницей.
  useEffect(() => {
    if (!shown) return
    const el = document.querySelector<HTMLElement>('[data-prototype-skill]')
    setPageSkill(el?.dataset.prototypeSkill?.trim() || null)
  }, [shown, pathname])

  if (!shown || width === null) return null
  const name = pageSkill ?? skill
  return (
    <div data-block="viewport-badge" data-viewport-badge className="pointer-events-none fixed bottom-4 left-4 z-50 select-none">
      <div className="flex size-20 flex-col overflow-hidden rounded-full border border-white/30 bg-white/30 text-black shadow-lg backdrop-blur-sm">
        <div data-block="viewport-badge-width" className="flex flex-1 flex-col items-center justify-end pb-1">
          <span className="font-mono text-sm font-bold leading-none tabular-nums">{width}</span>
          <span className="mt-0.5 font-mono text-[10px] uppercase leading-none tracking-widest opacity-70">{stepName(width)}</span>
        </div>
        <div className="h-px w-full bg-black/30" />
        <div data-block="viewport-badge-skill" className="flex min-w-0 flex-1 flex-col items-center justify-start pt-1">
          {name ? (
            <span title={name} data-viewport-badge-skill
              className="pointer-events-auto block w-full truncate px-3 text-center font-mono text-[10px] font-bold leading-none">
              {name}
            </span>
          ) : null}
          <span className="mt-0.5 max-w-full truncate px-3 font-mono text-[7px] uppercase leading-none tracking-wider opacity-60">{skillLabel}</span>
        </div>
      </div>
    </div>
  )
}
