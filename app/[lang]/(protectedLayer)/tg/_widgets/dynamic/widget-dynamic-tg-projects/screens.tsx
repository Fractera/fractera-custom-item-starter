// @local — the catalog's own screens of the Mini App's projects (node step 821): a section, a direction (group) and its item, drawn at
// addresses that have no folder (`childRoute({ virtual })` in lib/branch-page.tsx). The item's screen is the owner's 434: three numbers,
// «Открыть сайт» (its pages live on the site) and «Перейти в чат».

import { Button } from "@/components/ui/button"
import type { VirtualScreen } from "@/lib/branch-page"
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
        </TgGroup>
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
