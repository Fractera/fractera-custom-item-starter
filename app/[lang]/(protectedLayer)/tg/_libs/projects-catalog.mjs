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

/** Every page of the site (the public layer of the element at `root`) that names a project in its meta.json: the root of each
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
