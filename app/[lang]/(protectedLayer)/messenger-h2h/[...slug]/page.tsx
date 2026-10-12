import { conversation } from '../_components'

// Беседа ветки «messenger-h2h» — /<lang>/messenger-h2h/<беседа> (шаг узла 459): динамический маршрут, рисуется при первом заходе
// (адресов бесед сборка не знает). Вход — ../_components (components/messenger/conversation-route.tsx).
export const dynamicParams = true
export function generateStaticParams() {
  return []
}
export const generateMetadata = conversation.generateMetadata
export default conversation.Page
