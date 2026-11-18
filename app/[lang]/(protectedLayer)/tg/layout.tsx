import { AccessGate } from "@/components/auth/access-gate.client"
import { PROTECTED_GROUP_ROLES } from "@/lib/roles"
import { accessGateUi } from "@/components/auth/access-gate.i18n"
import { appDialogUi } from "@/components/dialog/app-dialog.i18n"
import { metaForLang } from "@/config/app-config"
import { TgBridge } from "./_components/tg-bridge.client"
import { TgShell } from "./_components/tg-shell.client"
import { tgMenu } from "./_libs/tg-menu"

// Замок ветки «tg» — Mini App этого элемента в Telegram (шаг 778 узла): роли раздела управления (lib/roles.ts →
// PROTECTED_GROUP_ROLES.admin) — архитектор и свой админ элемента. Здесь вывеска; замок — ворота страниц в proxy.ts (страница не уходит
// без роли) и двери /api, которые спрашивают роль сами. `data-tg-app` прячет шапку, подвал и меню сайта (styles/globals.css).
// 789: рамка — верхняя полоса с ☰ и левый ящик с меню из `_data/menu.json` (одно меню и для «Рабочего процесса» ядра, шаг 790).
export default async function Layout(
  { children, params }: { children: React.ReactNode; params: Promise<{ lang: string }> },
) {
  const { lang } = await params
  const { modes, common, ui } = tgMenu(lang)
  return (
    <AccessGate roles={PROTECTED_GROUP_ROLES.admin} lang={lang} ui={accessGateUi(lang)} dialogUi={appDialogUi(lang)}>
      <div data-block="tg-app" data-tg-app="" className="min-h-dvh bg-background text-foreground">
        <TgBridge />
        <TgShell common={common} lang={lang} modes={modes} site={`/${lang}`} siteName={metaForLang(lang).siteName} ui={ui}>{children}</TgShell>
      </div>
    </AccessGate>
  )
}
