import type { ReactNode } from 'react'
import { UsersTable } from './dynamic/widget-dynamic-users-table/index.client'
import { usersTableUi } from './dynamic/widget-dynamic-users-table/ui.i18n'
import { SiteSettings } from './dynamic/widget-dynamic-site-settings'
import { ElementBlocks } from './static/widget-static-element-blocks'
import { Widget as DesignOverview } from './dynamic/widget-dynamic-design-overview'
import { Widget as DesignColors } from './dynamic/widget-dynamic-design-colors'
import { Widget as DesignType } from './dynamic/widget-dynamic-design-type'
import { Widget as DesignShape } from './dynamic/widget-dynamic-design-shape'
import { Widget as SiteFeatures } from './dynamic/widget-dynamic-site-features'
import { Widget as SiteHeader } from './dynamic/widget-dynamic-site-header'
import { Widget as SiteFooter } from './dynamic/widget-dynamic-site-footer'
import { Widget as SiteCookieBanner } from './dynamic/widget-dynamic-site-cookie-banner'

// ВИДЖЕТЫ ЭТОЙ ВЕТКИ (владелец 2026-10-07: «удалили маршрут — проект чистый»). Страница ветки называет виджет в `meta.json` →
// `"widget"`; ищется он только здесь. Удалили ветку — список ушёл вместе с ней.
export const WIDGETS: Record<string, (lang: string) => ReactNode> = {
  'widget-dynamic-users-table': (lang) => <UsersTable lang={lang} ui={usersTableUi(lang)} />,
  // Свои настройки элемента — копия редактора CONFIG (`_pages/site-settings`).
  'widget-dynamic-site-settings': (lang) => <SiteSettings lang={lang} />,
  // 577-11 / 578: блоки этого элемента (`_pages/blocks`) — таблица и Preview.
  'widget-static-element-blocks': (lang) => <ElementBlocks lang={lang} />,
  // 579-1: своя мастерская оформления (`_pages/design`) — редакторы «Дизайна» над DESIGN-CONFIG этого элемента.
  'widget-dynamic-design-overview': (lang) => <DesignOverview lang={lang} />,
  'widget-dynamic-design-colors': (lang) => <DesignColors lang={lang} />,
  'widget-dynamic-design-type': (lang) => <DesignType lang={lang} />,
  'widget-dynamic-design-shape': (lang) => <DesignShape lang={lang} />,
  // 579-2: разделы своих настроек сайта (`_pages/site-settings/<раздел>`) — редакторы CONFIG над файлами этого элемента.
  'widget-dynamic-site-features': (lang) => <SiteFeatures lang={lang} />,
  'widget-dynamic-site-header': (lang) => <SiteHeader lang={lang} />,
  'widget-dynamic-site-footer': (lang) => <SiteFooter lang={lang} />,
  'widget-dynamic-site-cookie-banner': (lang) => <SiteCookieBanner lang={lang} />,
}
