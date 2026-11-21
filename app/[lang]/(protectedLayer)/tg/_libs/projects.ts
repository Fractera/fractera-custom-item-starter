import "server-only"
import { isOff, occursOn, readPlan } from "@/lib/cron/due"
import { elementRoot } from "@/lib/page-tree"
import raw from "../_data/projects.json"
import { countsOf, readItems, sitePages, treeDir } from "./projects-catalog.mjs"

// The projects of this element's Mini App (node steps 821, 824; the owner, Telegram 416–417, 424, 434, 494): four sections, 46 groups
// and their items — all visible from the first day, empty but ready («сама архитектура вдохновит его»). Sections and groups are STATIC:
// the folders of ../_projects compiled into ../_data/projects.json by `npm run tg:projects`, imported at build. Items are DYNAMIC: each
// group's items.json is read at render from the element's folder — a new network needs no build. A project's work lives on the
// element's SITE or in «Администрирование» (434, 490): a page names its project in meta.json — `"project": "<group>/<item>"` or
// `"<group>"` — and a calendar entry of `data/cron.json` names it the same way. Everything is counted by code at render (the page is
// cached for 30 seconds); there is no state of its own and no timer.

type Words = { en: string; [lang: string]: string | undefined }
type RawItem = { slug: string; title: Words; line?: Words }
type RawNeighbour = { what: Words; to: string }
type RawGroup = { slug: string; icon?: string; title: Words; line?: Words; neighbours?: RawNeighbour[] }
type RawSection = { slug: string; icon?: string; title: Words; groups: RawGroup[] }

/** pages — pages of the site that name the project; active — its calendar entries that are on; today — the ones that run today. */
export type Counts = { pages: number; active: number; today: number }
export type ProjectItem = Counts & { slug: string; title: string; line: string | null; href: string; site: string | null }
/** 826: «not here → the neighbour» of a group's «Справка»: the words, and where they lead — a section, a group, or the Mini App's Cron
 *  (`title` null: the screen names it). */
export type ProjectNeighbour = { what: string; title: string | null; href: string }
export type ProjectGroup = Counts & { slug: string; icon: string; title: string; line: string | null; href: string; section: string; items: ProjectItem[]; neighbours: ProjectNeighbour[] }
export type ProjectSection = Counts & { slug: string; icon: string; title: string; href: string; groups: ProjectGroup[] }
export type ProjectPlace =
  | { kind: "section"; section: ProjectSection }
  | { kind: "group"; section: ProjectSection; group: ProjectGroup }
  | { kind: "item"; section: ProjectSection; group: ProjectGroup; item: ProjectItem }

const SECTIONS = (raw as unknown as { sections: RawSection[] }).sections
const pick = (w: Words | undefined, lang: string) => (w ? w[lang] || w.en : null)
/** The calendar entries that name a project: on (not switched off) and whether they run today. */
function calendar(): { project: string; on: boolean; today: boolean }[] {
  const plan = readPlan()
  if (!plan) return []
  const now = new Date()
  return plan.schedules
    .filter((s) => typeof s.project === "string" && s.project)
    .map((s) => ({ project: s.project as string, on: !isOff(plan, s), today: !isOff(plan, s) && occursOn(s, now) }))
}

/** The whole catalog in one language with its counts. */
export function projects(lang: string): ProjectSection[] {
  const site: { project: string; href: string }[] = sitePages(elementRoot(), lang)
  const cal = calendar()
  const count = (key: string): Counts => countsOf(key, site, cal)
  const base = `/${lang}/tg/projects`
  const tree = treeDir(elementRoot())
  const named = new Map<string, { title: string; href: string }>([
    ...SECTIONS.map((x) => [x.slug, { title: pick(x.title, lang) ?? x.slug, href: `${base}/${x.slug}` }] as const),
    ...SECTIONS.flatMap((x) => x.groups.map((g) => [g.slug, { title: pick(g.title, lang) ?? g.slug, href: `${base}/${g.slug}` }] as const)),
  ])
  const neighbour = (n: RawNeighbour): ProjectNeighbour => {
    const to = named.get(n.to)
    return { what: pick(n.what, lang) ?? "", title: to?.title ?? null, href: to?.href ?? `/${lang}/tg/cron` }
  }
  return SECTIONS.map((s) => {
    const groups = s.groups.map((g) => ({
      ...count(g.slug),
      slug: g.slug,
      icon: g.icon ?? "folder",
      title: pick(g.title, lang) ?? g.slug,
      line: pick(g.line, lang),
      href: `${base}/${g.slug}`,
      section: s.slug,
      neighbours: (g.neighbours ?? []).map(neighbour),
      items: (readItems(tree, s.slug, g.slug) as RawItem[]).map((it) => ({
        ...count(`${g.slug}/${it.slug}`),
        slug: it.slug,
        title: pick(it.title, lang) ?? it.slug,
        line: pick(it.line, lang),
        href: `${base}/${g.slug}/${it.slug}`,
        site: site.find((p) => p.project === `${g.slug}/${it.slug}`)?.href ?? null,
      })),
    }))
    const sum = (k: keyof Counts) => groups.reduce((n, g) => n + g[k], 0)
    return { slug: s.slug, icon: s.icon ?? "folder", title: pick(s.title, lang) ?? s.slug, href: `${base}/${s.slug}`, groups, pages: sum("pages"), active: sum("active"), today: sum("today") }
  })
}

/** A catalog address under /tg: `projects/<section>`, `projects/<group>`, `projects/<group>/<item>`; anything else — null. */
export function projectPlace(slug: string, lang: string): ProjectPlace | null {
  const [root, a, b, extra] = slug.split("/")
  if (root !== "projects" || !a || extra) return null
  for (const section of projects(lang)) {
    if (!b && section.slug === a) return { kind: "section", section }
    const group = section.groups.find((g) => g.slug === a)
    if (!group) continue
    if (!b) return { kind: "group", section, group }
    const item = group.items.find((it) => it.slug === b)
    return item ? { kind: "item", section, group, item } : null
  }
  return null
}

/** For the home screen: how many groups exist and how many are started (a page or a calendar entry). */
export function projectsSummary(lang: string): { groups: number; started: number; active: number } {
  const groups = projects(lang).flatMap((s) => s.groups)
  return { groups: groups.length, started: groups.filter((g) => g.pages + g.active > 0).length, active: groups.reduce((n, g) => n + g.active, 0) }
}
