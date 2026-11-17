import { AccessGate } from "@/components/auth/access-gate.client"
import { PROTECTED_GROUP_ROLES } from "@/lib/roles"
import { accessGateUi } from "@/components/auth/access-gate.i18n"
import { appDialogUi } from "@/components/dialog/app-dialog.i18n"
import { TgBridge } from "./_components/tg-bridge.client"

// Замок ветки «tg» — Mini App этого элемента в Telegram (шаг 778 узла): роли раздела управления (lib/roles.ts →
// PROTECTED_GROUP_ROLES.admin) — архитектор и свой админ элемента. Здесь вывеска; замок — ворота страниц в proxy.ts (страница не уходит
// без роли) и двери /api, которые спрашивают роль сами. `data-tg-app` прячет шапку, подвал и меню сайта (styles/globals.css).
export default async function Layout(
  { children, params }: { children: React.ReactNode; params: Promise<{ lang: string }> },
) {
  const { lang } = await params
  return (
    <AccessGate roles={PROTECTED_GROUP_ROLES.admin} lang={lang} ui={accessGateUi(lang)} dialogUi={appDialogUi(lang)}>
      <div data-block="tg-app" data-tg-app="" className="min-h-dvh bg-background text-foreground">
        <TgBridge />
        {children}
      </div>
    </AccessGate>
  )
}
