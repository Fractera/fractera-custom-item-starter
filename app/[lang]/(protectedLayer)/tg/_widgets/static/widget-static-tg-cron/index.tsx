// @local — «Cron» of this element's Telegram Mini App (node step 821; the owner, Telegram 412: «общий крон всех проектов»): the
// element's own calendar (data/cron.json) — today first, then every task with its rhythm and its project. One source, two views: a
// project's screen counts the same entries by their `project`.

import { TgHead } from "../../../_components/tg-head.client"
import { TgGroup, TgNote, TgRows, type TgRowProps } from "../../../_components/tg-list"
import { type CalendarEntry, calendarFacts } from "../../../_libs/element-facts"
import { projectPlace } from "../../../_libs/projects"
import { fill } from "../../../_libs/words"
import { cronUi } from "./ui.i18n"

const ICON: Record<string, string> = { "telegram-message": "send", "agent-task": "bot", "node-notice": "bell" }

export function Widget({ lang }: { lang: string }) {
  const ui = cronUi(lang)
  const { entries } = calendarFacts()
  const projectTitle = (p?: string) => {
    const place = p ? projectPlace(`projects/${p}`, lang) : null
    if (!place || place.kind === "section") return null
    return place.kind === "item" ? `${place.group.title} › ${place.item.title}` : place.group.title
  }
  const row = (e: CalendarEntry): TgRowProps => ({
    icon: ICON[e.event] ?? "calendar-clock",
    title: e.name ?? e.message ?? e.id,
    hint: [fill(ui.repeat[e.repeat] ?? e.repeat, { date: e.start }), projectTitle(e.project)].filter(Boolean).join(" · "),
    aside: e.time,
    soon: e.on ? null : ui.off,
  })
  const today = entries.filter((e) => e.today)
  return (
    <div className="flex flex-col gap-5 pb-10" data-block="tg-cron" data-app-column="">
      <TgHead line={ui.line} title={ui.title} />
      <div className="flex flex-col gap-6 px-3" data-block="tg-cron-body">
        <TgGroup title={ui.today}>{today.length ? <TgRows rows={today.map(row)} /> : <TgNote>{ui.noneToday}</TgNote>}</TgGroup>
        <TgGroup title={ui.all}>{entries.length ? <TgRows rows={entries.map(row)} /> : <TgNote>{ui.none}</TgNote>}</TgGroup>
        <TgNote>{ui.how}</TgNote>
      </div>
    </div>
  )
}
