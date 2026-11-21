import { rootPage } from '@/lib/branch-page'
import { WIDGETS } from './_widgets'

// Корень ветки «tg» — /<lang>/tg, Mini App элемента в Telegram (шаг 778 узла; 821 — главная, проекты, Cron, элемент, настройки).
// Слова — ./_data; дети — ./_pages/<slug>/, их рисует ./[...slug]; виджеты — ./_widgets.
const page = rootPage({ segments: ['(protectedLayer)', 'tg'], subPath: '/tg', widgets: WIDGETS })

export const revalidate = 30 // 824: one person reads it — 30 s (the owner, Telegram 492); the public layer keeps 300
export const generateMetadata = page.generateMetadata
export default page.Page
