'use client'
import { useEffect, useState } from 'react'
import { Compass, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { isLoopbackHostname } from '@/lib/auth/owner-at-machine'
import { isTemporaryHostname } from '@/lib/auth/temporary-address'
import { isShowcaseHostname } from '@/lib/showcase'
import { quickNavVisible } from './quick-nav-visibility'
import type { QuickNavWords } from './quick-nav.i18n'

// ПОЛОСА БЫСТРОЙ НАВИГАЦИИ (шаг 706-3; владелец 2026-11-09: «Можно было бы его назвать баннер быстрой навигации»). Заменила жёлтую
// вывеску стартера, которая стояла у КАЖДОГО посетителя на любом адресе и висела `fixed` поверх страницы (закрыла бейдж героя lqvop).
//
// 🔒 ОСТРОВОК: кто смотрит и где, решает браузер (`quickNavVisible`), — страница остаётся статичной и ничего не спрашивает. Посетитель и
// поисковик полосу не получают вовсе: до проверки и при «нет» здесь ничего не рисуется.
// 🔒 В ПОТОКЕ, А НЕ ПОВЕРХ: полоса стоит под шапкой и сдвигает страницу, а не закрывает её.
// 🔒 ИНДИКАТОР ШИРИНЫ И НАВЫКА ДИЗАЙНА — ЗДЕСЬ, а не кругом в углу у каждого посетителя; его выключатель прежний (`viewportBadge`).
// Скрыть — до конца захода (sessionStorage): полоса нужна каждый раз, когда владелец приходит работать.
const HIDDEN_KEY = 'fractera:quick-nav-hidden'
const STEPS: [number, string][] = [[1536, '2xl'], [1280, 'xl'], [1024, 'lg'], [768, 'md'], [640, 'sm']]
const stepName = (w: number) => STEPS.find(([min]) => w >= min)?.[1] ?? 'xs'

export function QuickNav({ lang, words, designHref, settingsHref, subscriptionHref, showWidth, skill }: {
  lang: string
  words: QuickNavWords
  designHref: string
  settingsHref: string | null
  subscriptionHref: string | null
  showWidth: boolean
  skill: string | null
}) {
  const [shown, setShown] = useState(false)
  const [width, setWidth] = useState<number | null>(null)
  useEffect(() => {
    if (sessionStorage.getItem(HIDDEN_KEY) === '1') return
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
    if (!shown || !showWidth) return
    const read = () => setWidth(window.innerWidth)
    read()
    window.addEventListener('resize', read)
    return () => window.removeEventListener('resize', read)
  }, [shown, showWidth])
  if (!shown) return null
  const link = 'rounded-md border border-tone-access/40 bg-background/60 px-2.5 py-1 text-sm font-medium text-foreground hover:bg-background'
  return (
    <nav aria-label={words.label} lang={lang} data-quick-nav data-block="quick-nav" className="border-b border-tone-access/40 bg-tone-access/15">
      <div data-block="quick-nav-row" className="flex w-full flex-wrap items-center gap-x-3 gap-y-2 px-6 py-2 md:px-8">
        <Compass aria-hidden className="size-4 shrink-0 text-tone-access" />
        <span className="text-sm text-foreground">{words.lead}</span>
        <a href={designHref} className={link} data-quick-nav-link="design">{words.design}</a>
        {settingsHref ? <a href={settingsHref} className={link} data-quick-nav-link="settings">{words.settings}</a> : null}
        {subscriptionHref ? <a href={subscriptionHref} className={link} data-quick-nav-link="subscription">{words.subscription}</a> : null}
        <span className="ms-auto flex items-center gap-3">
          {showWidth && width !== null ? (
            <span className="font-mono text-xs text-muted-foreground tabular-nums" data-quick-nav-width>
              {width} · {stepName(width)}{skill ? ` · ${words.skill}: ${skill}` : ''}
            </span>
          ) : null}
          <Button variant="ghost" size="icon-sm" type="button" aria-label={words.hide} title={words.hide}
            onClick={() => { sessionStorage.setItem(HIDDEN_KEY, '1'); setShown(false) }}>
            <X aria-hidden className="size-4" />
          </Button>
        </span>
      </div>
    </nav>
  )
}
