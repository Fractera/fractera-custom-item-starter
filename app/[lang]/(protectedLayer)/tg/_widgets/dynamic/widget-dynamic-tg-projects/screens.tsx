// @local — the catalog's own screens of the Mini App's projects (node step 821): a section, a direction (group) and its item, drawn at
// addresses that have no folder (`childRoute({ virtual })` in lib/branch-page.tsx). The item's screen is the owner's 434: three numbers,
// «Открыть сайт» (its pages live on the site) and «Перейти в чат». 826: a direction's screen ends its card with «＋ Добавить» (a new item
// with no build) and the page with «Справка» (what goes elsewhere, how the screen works) — the owner, Telegram 503, 505, 506.

import Link from "next/link"
import { appDialogUi } from "@/components/dialog/app-dialog.i18n"
import { Button } from "@/components/ui/button"
import { Eyebrow, Small } from "@/components/ui/typography"
import type { VirtualScreen } from "@/lib/branch-page"
import { TgAddItem } from "../../../_components/tg-add-item.client"
import { TgHelp } from "../../../_components/tg-help.client"
import { TgHead } from "../../../_components/tg-head.client"
import { TgGroup, TgNote, TgRows } from "../../../_components/tg-list"
import { TgToChat } from "../../../_components/tg-to-chat.client"
import { type Counts, type ProjectGroup, type ProjectItem, type ProjectSection, projectPlace } from "../../../_libs/projects"
import { fill, plural } from "../../../_libs/words"
import { groupRow } from "./rows"
import { type ProjectsUi, projectsUi } from "./ui.i18n"

/** The screen of a catalog address, or null — then the address is not the branch's (404). */
export function projectScreen(slug: string, lang: string): VirtualScreen | null {
  const place = projectPlace(slug, lang)
  if (!place) return null
  const ui = projectsUi(lang)
  if (place.kind === "section") return { title: place.section.title, draw: () => <SectionScreen lang={lang} section={place.section} ui={ui} /> }
  if (place.kind === "group") return { title: place.group.title, draw: () => <GroupScreen group={place.group} lang={lang} section={place.section} ui={ui} /> }
  return { title: place.item.title, draw: () => <ItemScreen group={place.group} item={place.item} lang={lang} section={place.section} ui={ui} /> }
}

function SectionScreen({ section, ui, lang }: { section: ProjectSection; ui: ProjectsUi; lang: string }) {
  const started = section.groups.filter((g) => g.pages + g.active > 0).length
  return (
    <div className="flex flex-col gap-5 pb-10" data-block="tg-section-screen" data-app-column="">
      <TgHead back={{ href: `/${lang}/tg/projects`, label: ui.title }} line={`${plural(ui.directions, section.groups.length, lang)} · ${fill(ui.started, { n: started, of: section.groups.length })}`} title={section.title} />
      <div className="px-3" data-block="tg-section-list">
        <TgGroup><TgRows rows={section.groups.map((g) => groupRow(g, ui, lang))} /></TgGroup>
      </div>
    </div>
  )
}

function GroupScreen({ section, group, ui, lang }: { section: ProjectSection; group: ProjectGroup; ui: ProjectsUi; lang: string }) {
  return (
    <div className="flex flex-col gap-5 pb-10" data-block="tg-group-screen" data-app-column="">
      <TgHead back={{ href: section.href, label: section.title }} line={group.line} title={group.title} />
      <div className="flex flex-col gap-5 px-3" data-block="tg-group-body">
        <Stats counts={group} lang={lang} ui={ui} />
        <TgGroup>
          <TgRows rows={group.items.map((it) => ({ title: it.title, hint: it.line, href: it.href, aside: it.pages ? String(it.pages) : null }))} />
          <TgAddItem dialogUi={appDialogUi(lang)} divided={group.items.length > 0} group={group.slug} groupTitle={group.title} lang={lang} ui={ui.add} />
        </TgGroup>
        <TgHelp dialogUi={appDialogUi(lang)} label={ui.help.button} title={fill(ui.help.title, { group: group.title })}>
          <GroupHelp group={group} ui={ui} />
        </TgHelp>
      </div>
    </div>
  )
}

/** 826: the window of «Справка» — what lives here, what goes to a neighbour (each a link to it), how the screen works. */
function GroupHelp({ group, ui }: { group: ProjectGroup; ui: ProjectsUi }) {
  return (
    <div className="flex flex-col gap-5" data-block="tg-help-body">
      {group.line ? <Small data-block="dg03b" className="text-foreground">{group.line}</Small> : null}
      {group.neighbours.length ? (
        <div className="flex flex-col gap-2" data-block="tg-help-not-here">
          <Eyebrow data-block="lsg7b" className="text-muted-foreground tracking-wider">{ui.help.notHere}</Eyebrow>
          <ul className="flex flex-col gap-2" data-block="tg-help-not-here-list">
            {group.neighbours.map((n) => (
              <li className="flex flex-wrap items-baseline gap-x-1.5 text-[length:var(--fs-small)] leading-snug" data-block="tg-help-neighbour" key={`${n.href}-${n.what}`}>
                <span>{n.what}</span>
                <span aria-hidden className="text-muted-foreground">→</span>
                <Link className="text-primary underline-offset-2 hover:underline" href={n.href}>{n.title ?? ui.help.cron}</Link>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      <div className="flex flex-col gap-2" data-block="tg-help-how">
        <Eyebrow data-block="w94it" className="text-muted-foreground tracking-wider">{ui.help.how}</Eyebrow>
        <ul className="flex list-disc flex-col gap-1.5 pl-5 text-[length:var(--fs-small)] leading-snug text-muted-foreground" data-block="tg-help-points">
          {ui.help.points.map((p) => <li data-block="tg-help-point" key={p}>{p}</li>)}
        </ul>
      </div>
    </div>
  )
}

function ItemScreen({ section, group, item, ui, lang }: { section: ProjectSection; group: ProjectGroup; item: ProjectItem; ui: ProjectsUi; lang: string }) {
  const empty = item.pages + item.active + item.today === 0
  return (
    <div className="flex flex-col gap-5 pb-10" data-block="tg-item-screen" data-app-column="">
      <TgHead back={{ href: group.href, label: group.title }} line={item.line ?? `${section.title} › ${group.title}`} title={item.title} />
      <div className="flex flex-col gap-5 px-3" data-block="tg-item-body">
        <Stats counts={item} lang={lang} ui={ui} />
        {empty ? <TgNote>{ui.emptyItem}</TgNote> : null}
        <div className="flex flex-col gap-3" data-block="tg-item-actions">
          <Button className="h-12 w-full rounded-xl text-[length:var(--fs-body)]" nativeButton={false} render={<a href={item.site ?? `/${lang}`} />} variant="secondary">
            {ui.openSite}
          </Button>
          <TgToChat hint={ui.toChatHint} label={ui.toChat} lang={lang} section={{ path: [ui.title, section.title, group.title, item.title], href: item.href }} />
        </div>
      </div>
    </div>
  )
}

/** Three numbers of a direction or an item: its pages on the site, its entries on in Cron, the ones that run today. */
function Stats({ counts, ui }: { counts: Counts; ui: ProjectsUi; lang: string }) {
  const cells: [number, string][] = [[counts.pages, ui.statPages], [counts.active, ui.statActive], [counts.today, ui.statToday]]
  return (
    <div className="grid grid-cols-3 divide-x divide-border rounded-xl bg-[var(--tg-card)]" data-block="tg-stats">
      {cells.map(([n, label]) => (
        <div className="flex flex-col gap-1 px-3.5 py-3" data-block="tg-stat" key={label}>
          <span className="font-sans font-semibold text-[length:var(--fs-h2)] leading-none tabular-nums">{n}</span>
          <span className="text-[length:var(--fs-small)] text-muted-foreground leading-tight">{label}</span>
        </div>
      ))}
    </div>
  )
}
