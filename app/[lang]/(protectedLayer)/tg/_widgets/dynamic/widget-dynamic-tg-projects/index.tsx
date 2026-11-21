// @local — the widget «Projects» of this element's Telegram Mini App (node step 821; the owner, Telegram 412, 416–417, 424): four
// sections, 46 directions, all visible from the first day; «Все» by section (three first, «ещё N» opens the section), «Популярные» by
// pages on the site, «Актуальные» by tasks in Cron. The lists are drawn here on the server; the switch between them is an island.

import Link from "next/link"
import { TgHead } from "../../../_components/tg-head.client"
import { TgGroup, TgNote, TgRows } from "../../../_components/tg-list"
import { type ProjectGroup, projects } from "../../../_libs/projects"
import { fill, plural } from "../../../_libs/words"
import { groupRow } from "./rows"
import { SortTabs } from "./sort-tabs.client"
import { projectsUi } from "./ui.i18n"

/** Directions shown under a section in «Все» before the line «ещё N». */
const SHOWN = 3
const started = (g: ProjectGroup) => g.pages + g.active > 0

export function Widget({ lang }: { lang: string }) {
  const ui = projectsUi(lang)
  const sections = projects(lang)
  const groups = sections.flatMap((s) => s.groups)
  // the started directions first, then the catalog's order
  const lead = (list: ProjectGroup[]) => [...list.filter(started), ...list.filter((g) => !started(g))]
  const all = sections.map((s) => (
    <TgGroup
      aside={fill(ui.started, { n: s.groups.filter(started).length, of: s.groups.length })}
      foot={s.groups.length > SHOWN ? (
        <Link className="flex h-10 items-center justify-center text-[length:var(--fs-small)] text-primary" href={s.href}>
          {plural(ui.more, s.groups.length - SHOWN, lang)}
        </Link>
      ) : null}
      key={s.slug}
      title={s.title}
    >
      <TgRows rows={lead(s.groups).slice(0, SHOWN).map((g) => groupRow(g, ui, lang))} />
    </TgGroup>
  ))
  const ranked = (by: (g: ProjectGroup) => number, empty: string) => {
    const list = groups.filter((g) => by(g) > 0).sort((a, b) => by(b) - by(a) || b.today - a.today)
    return list.length ? <TgGroup><TgRows rows={list.map((g) => groupRow(g, ui, lang, true))} /></TgGroup> : <TgNote>{empty}</TgNote>
  }
  return (
    <div className="flex flex-col gap-4 pb-10" data-block="tg-projects" data-app-column="">
      <TgHead line={plural(ui.line, groups.length, lang)} title={ui.title} />
      <div className="px-3" data-block="tg-projects-lists">
        <SortTabs
          actual={ranked((g) => g.active, ui.emptyActual)}
          all={all}
          label={ui.sortLabel}
          popular={ranked((g) => g.pages, ui.emptyPopular)}
          words={{ all: ui.all, popular: ui.popular, actual: ui.actual }}
        />
      </div>
    </div>
  )
}
