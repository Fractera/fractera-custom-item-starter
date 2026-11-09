import type { ReactNode } from 'react'
import { PolicyAnalytics } from './static/widget-static-policy-analytics'
import { ReferenceTitle } from './static/widget-static-reference-title'

// ВИДЖЕТЫ ЭТОЙ ВЕТКИ (владелец 2026-10-07: «удалили маршрут — проект чистый»). Страница ветки называет виджет в `meta.json` →
// `"widget"`; ищется он только здесь. Удалили ветку — список ушёл вместе с ней.
// 706-5: обе прежние главные (лендинг агента и лендинг «по образцу Stripe») сняты — главная нового элемента рождается пустой и
// рисуется по брифу (владелец 2026-11-09).
export const WIDGETS: Record<string, (lang: string) => ReactNode> = {
  // Policy pages — the Google Analytics section, only while it is on (node step 449-2).
  'widget-static-policy-analytics': (lang) => <PolicyAnalytics lang={lang} />,
  'widget-static-reference-title': (lang) => <ReferenceTitle lang={lang} />,
}
