import { rootPage } from '@/lib/branch-page'

// Корень ветки «tg» — /<lang>/tg, Mini App элемента в Telegram (шаг 778 узла). Слова — ./_data; дети — ./_pages/<slug>/, их рисует ./[slug].
const page = rootPage({ segments: ['(protectedLayer)', 'tg'], subPath: '/tg' })

export const revalidate = 300
export const generateMetadata = page.generateMetadata
export default page.Page
