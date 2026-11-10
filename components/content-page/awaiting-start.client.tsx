'use client'
import { useEffect, useState } from 'react'
import { SquareTerminal } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { P } from '@/components/ui/typography'
import { isLoopbackHostname } from '@/lib/auth/owner-at-machine'
import { isTemporaryHostname } from '@/lib/auth/temporary-address'
import { isShowcaseHostname } from '@/lib/showcase'
import { quickNavVisible } from '@/components/shell/quick-nav-visibility'
import type { AwaitingStartWords } from './awaiting-start.i18n'

// ПОДПИСЬ ПОД НАЗВАНИЕМ ПРОЕКТА НА СТАРТОВОМ МАКЕТЕ (узел, шаг 715). Владелец 2026-11-10: «это стартовый макет чтобы построить эту
// страницу войдите в свою подписку … перейдите в терминал и активная кнопка которая открывает терминал (здесь мы открываем терминал
// элемента не ядра)». Видит её только тот, кто видит полосу владельца (`quickNavVisible`: эта машина или вошедший архитектор на своём
// домене): посетителю сайта подписка и терминал ни к чему. Решает браузер — страница остаётся статичной. Узла нет — подписи нет.
export function AwaitingStart({ subscriptionHref, terminalHref, words }: { subscriptionHref: string | null; terminalHref: string | null; words: AwaitingStartWords }) {
  const [shown, setShown] = useState(false)
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
  if (!shown || !terminalHref) return null
  return (
    <div data-block="awaiting-start" data-awaiting-start className="flex max-w-prose flex-col items-start gap-4 pt-4">
      <P data-block="awaiting-start-text">
        {words.before}{' '}
        {subscriptionHref ? <a href={subscriptionHref} target="_blank" rel="noopener noreferrer" className="font-medium text-primary underline-offset-4 hover:underline">{words.subscription}</a> : words.subscription}{' '}
        {words.after}
      </P>
      <a href={terminalHref} target="_blank" rel="noopener noreferrer" className={buttonVariants({ size: 'lg' })} data-awaiting-terminal>
        <SquareTerminal data-icon="inline-start" aria-hidden />
        {words.terminal}
      </a>
    </div>
  )
}
