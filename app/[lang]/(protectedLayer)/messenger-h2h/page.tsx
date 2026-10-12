import { rootPage } from '@/lib/branch-page'
import { WIDGETS } from './_widgets'

// Корень ветки «messenger-h2h» — /<lang>/messenger-h2h: список бесед (H2H Messenger). Слова — ./_data, окно — виджет ветки (ai-elements).
const page = rootPage({ segments: ['(protectedLayer)', 'messenger-h2h'], subPath: '/messenger-h2h', widgets: WIDGETS })

export const revalidate = 300
export const generateMetadata = page.generateMetadata
export default page.Page
