// The rules of the Mini App's projects catalog (node step 821), plain JavaScript so its test runs in node without the app:
// what a valid catalog is, which pages of the site name a project, and how a project's numbers are counted. `projects.ts` draws
// with these; `projects-catalog.test.mjs` proves them (npm run test:tg-projects).
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

const SLUG = /^[a-z0-9][a-z0-9-]{0,60}$/

/** Problems of a catalog: four sections expected by the owner's template, slugs unique across sections and groups (they share
 *  the address `/tg/projects/<slug>`), items unique inside a group, a title in every language and a line for every group. */
export function catalogProblems(catalog, langs = ['en', 'ru']) {
  const out = []
  const sections = Array.isArray(catalog?.sections) ? catalog.sections : []
  const top = new Set()
  const words = (w, where) => { for (const l of langs) if (!w || typeof w[l] !== 'string' || !w[l].trim()) out.push(`${where}: no «${l}»`) }
  for (const s of sections) {
    if (!SLUG.test(s.slug ?? '')) out.push(`section «${s.slug}»: bad slug`)
    if (top.has(s.slug)) out.push(`«${s.slug}»: the slug is taken`)
    top.add(s.slug)
    words(s.title, `section ${s.slug} title`)
    for (const g of s.groups ?? []) {
      if (!SLUG.test(g.slug ?? '')) out.push(`group «${g.slug}»: bad slug`)
      if (top.has(g.slug)) out.push(`«${g.slug}»: the slug is taken`)
      top.add(g.slug)
      words(g.title, `group ${g.slug} title`)
      words(g.line, `group ${g.slug} line`)
      const items = new Set()
      for (const it of g.items ?? []) {
        if (!SLUG.test(it.slug ?? '')) out.push(`item «${g.slug}/${it.slug}»: bad slug`)
        if (items.has(it.slug)) out.push(`«${g.slug}/${it.slug}»: the item is twice`)
        items.add(it.slug)
        words(it.title, `item ${g.slug}/${it.slug} title`)
      }
    }
  }
  return out
}

const json = (file) => { try { return JSON.parse(readFileSync(file, 'utf8')) } catch { return null } }
const dirs = (dir) => { try { return readdirSync(dir, { withFileTypes: true }).filter((e) => e.isDirectory()).map((e) => e.name) } catch { return [] } }

/** Every page of the site (the public layer of the element at `root`, and its «Администрирование» — 824) that names a project in its meta.json: the root of each
 *  branch (`_data/meta.json`) and its children (`_pages/<slug>/meta.json`, two levels). Route groups `(…)` add nothing to the
 *  address; `[…]`, `_…`, `api` and `node_modules` are not pages. */
export function sitePages(root, lang) {
  const out = []
  const read = (file, url) => {
    const p = json(file)?.project
    if (typeof p === 'string' && p) out.push({ project: p, href: `/${lang}${url.length ? `/${url.join('/')}` : ''}` })
  }
  const pages = (dir, url, depth) => {
    for (const name of dirs(dir)) {
      read(join(dir, name, 'meta.json'), [...url, name])
      if (depth < 1) pages(join(dir, name), [...url, name], depth + 1)
    }
  }
  const branch = (dir, url, depth) => {
    read(join(dir, '_data', 'meta.json'), url)
    if (existsSync(join(dir, '_pages'))) pages(join(dir, '_pages'), url, 0)
    if (depth > 4) return
    for (const name of dirs(dir)) {
      if (name.startsWith('_') || name.startsWith('[') || name === 'api' || name === 'node_modules') continue
      branch(join(dir, name), name.startsWith('(') ? url : [...url, name], depth + 1)
    }
  }
  branch(join(root, 'app', '[lang]', '(publicLayer)'), [], 0)
  // 824: «Администрирование» holds a project's pages too — public or private is the agent's and the person's choice (Telegram 490).
  branch(join(root, 'app', '[lang]', '(protectedLayer)', 'admin'), ['admin'], 0)
  return out
}

/** A project's key is `<group>` or `<group>/<item>`; a group holds its items' pages and tasks too. */
export const inside = (project, key) => project === key || project.startsWith(`${key}/`)

/** The numbers of one project: its pages on the site, its calendar entries that are on, the ones that run today.
 *  `cal` — `{ project, on, today }` of every calendar entry that names a project. */
export function countsOf(key, site, cal) {
  return {
    pages: site.filter((p) => inside(p.project, key)).length,
    active: cal.filter((c) => c.on && inside(c.project, key)).length,
    today: cal.filter((c) => c.today && inside(c.project, key)).length,
  }
}

// ── 824: THE TREE OF FOLDERS IS THE SOURCE (the owner, Telegram 494: «только последние элементы каждого маршрута оставались
// динамическими … а группы и подгруппы были статическими потому что в каждом из них мы должны разместить … readme.md») ──────────
// `tg/_projects/<section>/{meta.json,README.md}` and `tg/_projects/<section>/<group>/{meta.json,README.md,items.json}`.
// STATIC — sections and groups: `scripts/tg-projects.mjs` compiles them into `_data/projects.json`, imported at build; a new one needs
// `npm run tg:projects` and a build (the prebuild's `--check` stops a build whose file differs from the tree).
// DYNAMIC — items: `items.json` is read at run time from the element's folder; a new network is one entry, no build.

/** The tree's folder inside an element (or a workshop) at `root`. */
export const treeDir = (root) => join(root, 'app', '[lang]', '(protectedLayer)', 'tg', '_projects')

const byOrder = (dir) => dirs(dir)
  .filter((n) => !n.startsWith('_') && !n.startsWith('.'))
  .map((n) => ({ n, m: json(join(dir, n, 'meta.json')) }))
  .sort((a, b) => (a.m?.order ?? 999) - (b.m?.order ?? 999) || a.n.localeCompare(b.n))

/** Problems of the tree: every section and group is a folder with meta.json (a title) and README.md; every group has items.json
 *  (a list); then the same rules as a compiled catalog (slugs, languages). */
export function treeProblems(tree, langs = ['en', 'ru']) {
  const out = []
  const sections = byOrder(tree)
  if (!sections.length) out.push(`${tree}: no sections`)
  for (const { n: s, m } of sections) {
    if (!m) out.push(`section «${s}»: no meta.json`)
    if (!existsSync(join(tree, s, 'README.md'))) out.push(`section «${s}»: no README.md`)
    for (const { n: g, m: gm } of byOrder(join(tree, s))) {
      if (!gm) out.push(`group «${s}/${g}»: no meta.json`)
      if (!existsSync(join(tree, s, g, 'README.md'))) out.push(`group «${s}/${g}»: no README.md`)
      if (!Array.isArray(json(join(tree, s, g, 'items.json')))) out.push(`group «${s}/${g}»: items.json is not a list`)
    }
  }
  const compiled = compileTree(tree, true)
  return [...out, ...catalogProblems(compiled, langs)]
}

/** The static catalog — sections and groups in their order, without items (`withItems` — the items too, for the checks). */
export function compileTree(tree, withItems = false) {
  return {
    _: 'GENERATED from ../_projects by `npm run tg:projects` (node step 824) — never edit by hand. Sections and groups are static (a new one needs a build); items are read at run time from each group\'s items.json.',
    sections: byOrder(tree).map(({ n: s, m }) => ({
      slug: s,
      icon: m?.icon ?? 'folder',
      title: m?.title,
      groups: byOrder(join(tree, s)).map(({ n: g, m: gm }) => ({
        slug: g,
        icon: gm?.icon ?? 'folder',
        title: gm?.title,
        line: gm?.line,
        ...(withItems ? { items: readItems(tree, s, g) } : {}),
      })),
    })),
  }
}

/** The items of one group, read now: entries with a good slug and an English title, each slug once; a broken file — none. */
export function readItems(tree, section, group) {
  const raw = json(join(tree, section, group, 'items.json'))
  if (!Array.isArray(raw)) return []
  const seen = new Set()
  return raw.filter((it) => {
    const ok = it && SLUG.test(it.slug ?? '') && typeof it.title?.en === 'string' && !seen.has(it.slug)
    if (ok) seen.add(it.slug)
    return ok
  })
}
