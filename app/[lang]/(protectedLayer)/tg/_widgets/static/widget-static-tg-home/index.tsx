// @local — the home screen of this element's Telegram Mini App (node step 821; the owner's mock v2 A, «идеально» 438; 840-4 — its top is the
// Pult's top, Telegram 971): «Как начать» until «Прочитано», the agent's card, «Топливо подписки» and «Ждёт вас» (an island asking the core
// through the branch's door), and the four sections on coloured tiles with what each holds now (today's calendar lives in Cron's line).

import { metaForLang } from "@/config/app-config"
import { TgHomeAgent } from "../../../_components/tg-home-agent.client"
import { tgAgentUi } from "../../../_components/tg-agent.i18n"
import { TgHead } from "../../../_components/tg-head.client"
import { TgIntro } from "../../../_components/tg-intro.client"
import { TgSearch } from "../../../_components/tg-search.client"
import { tgIntroUi } from "../../../_components/tg-intro.i18n"
import { TgGroup, TgRows } from "../../../_components/tg-list"
import { calendarFacts, elementFacts, settingsFilled } from "../../../_libs/element-facts"
import { projectsSummary } from "../../../_libs/projects"
import { fill, plural } from "../../../_libs/words"
import { homeUi } from "./ui.i18n"

export function Widget({ lang }: { lang: string }) {
  const ui = homeUi(lang)
  const base = `/${lang}/tg`
  const cal = calendarFacts()
  const on = cal.entries.filter((e) => e.on)
  const p = projectsSummary(lang)
  const facts = elementFacts()
  return (
    <div className="flex flex-col gap-5 pb-10" data-block="tg-home" data-app-column="">
      <TgHead line={ui.line} refresh={ui.refresh} title={metaForLang(lang).siteName} />
      <div className="flex flex-col gap-6 px-3" data-block="tg-home-body">
        <TgSearch lang={lang} ui={ui.search} />
        <TgHomeAgent lang={lang} ui={tgAgentUi(lang)} />
        <TgIntro ui={tgIntroUi(lang)} />
        <TgGroup title={ui.sections}>
          <TgRows
            rows={[
              { icon: "layout-grid", title: ui.projects, hint: fill(ui.projectsHint, { directions: plural(ui.directions, p.groups, lang), n: p.started }), href: `${base}/projects` },
              { icon: "calendar-days", title: ui.cron, hint: [plural(ui.cronTasks, on.length, lang), cal.next ? fill(ui.cronNext, { time: cal.next.time }) : null].filter(Boolean).join(" · "), href: `${base}/cron` },
              { icon: "boxes", title: ui.element, hint: ui.elementHint, href: `${base}/element` },
              { icon: "settings", title: ui.settings, hint: fill(ui.settingsHint, { n: settingsFilled(facts) }), href: `${base}/settings` },
            ]}
          />
        </TgGroup>
      </div>
    </div>
  )
}
