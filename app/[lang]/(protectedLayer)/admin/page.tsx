import { rootPage } from '@/lib/branch-page'
import { WIDGETS } from './_widgets'

// Корень ветки «admin» — /<lang>/admin. Слова — ./_data; дети — ./_pages/<slug>/, их рисует ./[slug].
const page = rootPage({ segments: ['(protectedLayer)', 'admin'], subPath: '/admin', widgets: WIDGETS })

export const revalidate = 30 // 824: one person reads it — 30 s (the owner, Telegram 492); the public layer keeps 300
export const generateMetadata = page.generateMetadata
export default page.Page
