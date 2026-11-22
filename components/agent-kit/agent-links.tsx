import { ArrowRight, ExternalLink } from "lucide-react"
import Link from "next/link"
import { buttonVariants } from "@/components/ui/button"
import type { AgentLinksWords } from "./words/agent-links.i18n"

// БЫСТРЫЕ ПЕРЕХОДЫ СО СТРАНИЦЫ ПОДПИСКИ И ТРЕБОВАНИЕ TELEGRAM (624-4).
//
// ✗ Оплачено 2026-11-02 (владелец, первый запуск): после подписки человек не видел, куда идти дальше, а о том, что нужно приложение
// Telegram, нигде не было сказано — без него «непонятные ошибки и работать не получается».
// 🔒 Без состояния и без запросов: ссылки и текст, поэтому серверный компонент рядом с островками, а не внутри них (те уже за 250 строк).
// Адреса страниц даёт `widgets.tsx`: у служб ядра — их группа, у рождённого элемента — его дерево.

/** Официальная страница приложений Telegram (первоисточник). */
const TELEGRAM_APPS = "https://telegram.org/apps"

export type AgentLinks = { terminal: string; telegram: string }

/** Под подпиской: «Открыть терминал» и «Настроить Telegram». */
export function AgentNextLinks({ links, words }: { links: AgentLinks; words: AgentLinksWords }) {
  return (
    <div className="my-6 flex flex-col gap-3 rounded-lg border p-4" data-block="agent-next-links">
      <p data-block="qripj" className="font-medium text-sm">{words.nextTitle}</p>
      <p data-block="bf9c5" className="text-muted-foreground text-sm">{words.nextText}</p>
      <div data-block="sl711" className="flex flex-wrap gap-2">
        <Link href={links.terminal} className={buttonVariants({ variant: "default" })}>
          {words.openTerminal}
          <ArrowRight className="ml-2 size-4" aria-hidden />
        </Link>
        <Link href={links.telegram} className={buttonVariants({ variant: "outline" })}>
          {words.openTelegram}
          <ArrowRight className="ml-2 size-4" aria-hidden />
        </Link>
      </div>
    </div>
  )
}

/** Над шагами Telegram: приложение нужно до начала. */
export function TelegramAppNeeded({ words }: { words: AgentLinksWords }) {
  return (
    <div className="my-6 flex flex-col gap-3 rounded-lg border p-4" data-block="telegram-app-needed">
      <p data-block="zuvsk" className="font-medium text-sm">{words.appTitle}</p>
      <p data-block="zd5lr" className="text-muted-foreground text-sm">{words.appText}</p>
      <div data-block="s20xi">
        <a href={TELEGRAM_APPS} target="_blank" rel="noreferrer noopener" className={buttonVariants({ variant: "outline" })}>
          {words.getApp}
          <ExternalLink className="ml-2 size-4" aria-hidden />
        </a>
      </div>
    </div>
  )
}
