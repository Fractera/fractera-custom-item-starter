import type { ReactNode } from 'react'
import { Widget as Projects } from './dynamic/widget-dynamic-tg-projects'
import { projectScreen } from './dynamic/widget-dynamic-tg-projects/screens'
import { Widget as Cron } from './static/widget-static-tg-cron'
import { Widget as Element } from './static/widget-static-tg-element'
import { Widget as Home } from './static/widget-static-tg-home'
import { Widget as Settings } from './static/widget-static-tg-settings'
import { Widget as Start } from './static/widget-static-tg-start'

// ВИДЖЕТЫ ВЕТКИ «tg» — Mini App элемента в Telegram (шаг узла 821). Страница ветки называет виджет в своей последовательности `body`;
// ищется он только здесь. Удалили ветку — список ушёл вместе с ней.
export const WIDGETS: Record<string, (lang: string) => ReactNode> = {
  // 821: главная — сегодня из календаря, агент (ядро — после его сборки), четыре раздела.
  'widget-static-tg-home': (lang) => <Home lang={lang} />,
  // 821: «Проекты» — четыре раздела, 46 направлений (_data/projects.json), сортировка по страницам сайта и задачам Cron.
  'widget-dynamic-tg-projects': (lang) => <Projects lang={lang} />,
  // 821: «Cron» — общий календарь всех проектов (data/cron.json).
  'widget-static-tg-cron': (lang) => <Cron lang={lang} />,
  // 821: «Элемент» — сайт, люди, агент, строительство.
  'widget-static-tg-element': (lang) => <Element lang={lang} />,
  // 821: «Настройки» — инструкция, владелец, проект, навыки, подписки, MCP.
  'widget-static-tg-settings': (lang) => <Settings lang={lang} />,
  // 840-4: «Как начать» — the first text of the Mini App, always reachable from the drawer.
  'widget-static-tg-start': (lang) => <Start lang={lang} />,
}

/** 821: экраны каталога без своей папки — раздел, направление, пункт (`/tg/projects/<…>`); настоящая папка сильнее. */
export const VIRTUAL = (slug: string, lang: string) => projectScreen(slug, lang)
