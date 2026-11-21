// @local — the home screen of this element's Telegram Mini App (node step 821; the owner's mock v2 A, «идеально» 438): today from the
// element's calendar, the agent's card and its context window (an island asking the core through the branch's door), and the four
// sections with what each holds now.

import { metaForLang } from "@/config/app-config"
import { TgAgent } from "../../../_components/tg-agent.client"
import { tgAgentUi } from "../../../_components/tg-agent.i18n"
import { TgHead } from "../../../_components/tg-head.client"
import { TgGroup, TgRows } from "../../../_components/tg-list"
import { calendarFacts, elementFacts, settingsFilled } from "../../../_libs/element-facts"
import { projectsSummary } from "../../../_libs/projects"
import { fill, plural } from "../../../_libs/words"
import { homeUi } from "./ui.i18n"

export function Widget({ lang }: { lang: string }) {
  const ui = homeUi(lang)
  const base = `/${lang}/tg`
  const cal = calendarFacts()
  const today = cal.entries.filter((e) => e.today)
  const on = cal.entries.filter((e) => e.on)
  const p = projectsSummary(lang)
  const facts = elementFacts()
  const nextLine = cal.next ? fill(ui.next, { time: cal.next.time, name: cal.next.name ?? cal.next.message ?? cal.next.id }) : ui.calm
  return (
    <div className="flex flex-col gap-5 pb-10" data-block="tg-home" data-app-column="">
      <TgHead line={ui.line} title={metaForLang(lang).siteName} />
      <div className="flex flex-col gap-6 px-3" data-block="tg-home-body">
        <TgGroup title={ui.today}>
          <TgRows rows={[{ icon: "calendar-clock", title: today.length ? plural(ui.todayTasks, today.length, lang) : ui.todayNone, hint: nextLine, href: `${base}/cron` }]} />
        </TgGroup>
        <TgGroup title={ui.agent}>
          <TgAgent lang={lang} ui={tgAgentUi(lang)} variant="home" />
        </TgGroup>
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
