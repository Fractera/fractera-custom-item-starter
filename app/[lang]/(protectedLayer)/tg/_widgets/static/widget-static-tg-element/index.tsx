// @local — «Элемент» of this element's Telegram Mini App (node step 821; the owner, Telegram 431: «куда добавить органично те экраны
// которые у нас существуют в узла … без них также элемент не может быть полноценным»): the site, the people, the agent and the
// building. The element's own pages open here; the rows the core holds (the subscription, the bot, deploy) say «скоро» until its door.

import { TgHead } from "../../../_components/tg-head.client"
import { TgGroup, TgRows } from "../../../_components/tg-list"
import { elementFacts } from "../../../_libs/element-facts"
import { elementUi } from "./ui.i18n"

export function Widget({ lang }: { lang: string }) {
  const ui = elementUi(lang)
  const admin = `/${lang}/admin`
  const { step } = elementFacts()
  return (
    <div className="flex flex-col gap-5 pb-10" data-block="tg-element" data-app-column="">
      <TgHead line={ui.line} title={ui.title} />
      <div className="flex flex-col gap-6 px-3" data-block="tg-element-body">
        <TgGroup title={ui.site}>
          <TgRows
            rows={[
              { icon: "globe", title: ui.openSite, hint: ui.openSiteHint, href: `/${lang}`, external: true },
              { icon: "palette", title: ui.design, hint: ui.designHint, href: `${admin}/design` },
              { icon: "sliders-horizontal", title: ui.siteSettings, hint: ui.siteSettingsHint, href: `${admin}/site-settings` },
            ]}
          />
        </TgGroup>
        <TgGroup title={ui.people}>
          <TgRows rows={[{ icon: "users", title: ui.users, hint: ui.usersHint, href: `${admin}/users` }]} />
        </TgGroup>
        <TgGroup title={ui.agent}>
          <TgRows rows={[{ icon: "sparkles", title: ui.claude, hint: ui.claudeHint, soon: ui.soon }, { icon: "send", title: ui.bot, hint: ui.botHint, soon: ui.soon }]} />
        </TgGroup>
        <TgGroup title={ui.building}>
          <TgRows rows={[{ icon: "hammer", title: ui.step, hint: step ?? ui.noStep }, { icon: "rocket", title: ui.deploy, hint: ui.deployHint, soon: ui.soon }]} />
        </TgGroup>
      </div>
    </div>
  )
}
