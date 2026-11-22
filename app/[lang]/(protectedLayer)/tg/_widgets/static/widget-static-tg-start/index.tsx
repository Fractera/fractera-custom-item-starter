// @local — the screen «Как начать» of this element's Mini App (node step 840-4): the same first text as the home card, always reachable from
// the drawer after «Прочитано» hid the card.

import { TgIntroText } from "../../../_components/tg-intro.client"
import { tgIntroUi } from "../../../_components/tg-intro.i18n"
import { TgHead } from "../../../_components/tg-head.client"

export function Widget({ lang }: { lang: string }) {
  const ui = tgIntroUi(lang)
  return (
    <div className="flex flex-col gap-5 pb-10" data-block="tg-start" data-app-column="">
      <TgHead title={ui.title} />
      <section className="mx-3 rounded-xl bg-[var(--tg-card)] px-4 py-4" data-block="tg-start-card">
        <TgIntroText ui={ui} />
      </section>
    </div>
  )
}
