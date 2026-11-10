import { H1 } from "@/components/ui/typography"
import { coreTab } from "@/lib/core-tab"
import { AwaitingStart } from "./awaiting-start.client"
import { awaitingStartWords } from "./awaiting-start.i18n"

// НАЗВАНИЕ ПРОЕКТА НА СТРАНИЦЕ, ЖДУЩЕЙ ДИЗАЙНА (шаг 714-3). Владелец 2026-11-10, дословно: «С небольшим отступом сверху большим
// шрифтом ты должен написать название проекта … противном случае все страницы не имеют никакого отличительного принципа».
// Пустое тело осталось пустым (706-5): имя, крупно, — его заменит дизайн, который нарисует агент элемента. 715: под именем — подпись
// владельцу «это стартовый макет …» со ссылкой на подписку и кнопкой терминала элемента (`awaiting-start.client.tsx`).
export function AwaitingTitle({ name, lang }: { name: string; lang: string }) {
  return (
    <div data-block="awaiting-title" className="pt-6 md:pt-10">
      <H1 scale="hero">{name}</H1>
      <AwaitingStart subscriptionHref={coreTab(lang, "subscription")} terminalHref={coreTab(lang, "terminal")} words={awaitingStartWords(lang)} />
    </div>
  )
}
