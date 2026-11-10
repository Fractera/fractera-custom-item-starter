import { ownId } from "@/lib/own-id"

// ВКЛАДКА «СТРОИТЕЛЬСТВА» ЭТОГО ЭЛЕМЕНТА В ЯДРЕ УЗЛА (714-2, 715): `<ядро>/<язык>/<id>/build/<вкладка>`, или null — узла нет. Одна
// функция для полосы владельца (`app/[lang]/layout.tsx`) и подписи под названием проекта (`components/content-page/awaiting-title.tsx`).
// Терминал — терминал самого элемента в ядре (`<id>/build/terminal`), не главного агента ядра.
export type CoreTab = "design" | "site-settings" | "subscription" | "terminal"

export function coreTab(lang: string, tab: CoreTab): string | null {
  const core = process.env.ARCHITECT_URL?.trim().replace(/\/+$/, "")
  const id = ownId()
  return core && id ? `${core}/${lang}/${id}/build/${tab}` : null
}
