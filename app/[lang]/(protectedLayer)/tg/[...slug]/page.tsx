import { childRoute } from '@/lib/branch-page'
import { VIRTUAL, WIDGETS } from '../_widgets'

// Ребёнок ветки «tg» — Mini App элемента в Telegram (шаг 778 узла): одна страница на все папки ../_pages/<slug>/; замок — роли из его
// meta.json. 821: адрес каталога проектов без папки рисует свой экран (`virtual`), папка сильнее.
const route = childRoute({ segments: ['(protectedLayer)', 'tg'], subPath: '/tg', widgets: WIDGETS, virtual: VIRTUAL })

export const revalidate = 300
export const dynamicParams = true
export const generateStaticParams = route.generateStaticParams
export const generateMetadata = route.generateMetadata
export default route.Page
