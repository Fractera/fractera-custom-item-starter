import { notFound } from "next/navigation"
import { AccessGate } from "@/components/auth/access-gate.client"
import { ARCHITECT_LAYER_ROLES } from "@/lib/roles"
import { accessGateUi } from "@/components/auth/access-gate.i18n"
import { appDialogUi } from "@/components/dialog/app-dialog.i18n"

// Замок ветки «messenger-h2a» (шаг узла 459): только архитектор. Владелец 2026-10-12: «Эти вкладки доступны только при входе архитектора».
export default async function Layout(
  { children, params }: { children: React.ReactNode; params: Promise<{ lang: string }> },
) {
  // 🪦 HIDDEN, NOT DELETED (core step 802; the owner of the node, 2026-11-19: «На стартовом кастомном шаблоне убери раздел Messenger до
  // появления lagrix»): the branch answers 404 until Lagrix launches — the drawer already hides its link (645-3). Remove this line to bring it back.
  notFound()
  const { lang } = await params
  return (
    <AccessGate roles={[...ARCHITECT_LAYER_ROLES]} lang={lang} ui={accessGateUi(lang)} dialogUi={appDialogUi(lang)}>
      {children}
    </AccessGate>
  )
}
