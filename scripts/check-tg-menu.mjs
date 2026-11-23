// THE MINI APP STAYS ONE PERSON'S REMOTE (node step 848-5; the owner of the node, 2026-11-23, through the aifa.dev server's letter): «Нельзя
// строить внутри Mini App альтернативу странице сайта, его мобильной версии или функции приложения. Действие человек совершает на
// настоящей странице проекта, по своей роли». Model-free, read from this folder:
//   - every item of `tg/_data/menu.json` has a kind — nav · chat · stats · schedule · search · control · help;
//   - a `nav` item leads by `href` to a real page of this element (the list of the door GET /api/pages — the same walk, `pages.mjs`),
//     and only a `nav` item has an `href`; its `roles`, when given, are role names;
//   - every screen folder `tg/_pages/<slug>/` stands in the menu (an item or a child) — a screen outside the menu is the first sign of a
//     page built inside the Mini App.
// This tag warns (`===TG_MENU_WARN===`, exit 0): live elements built screens before the law. `--strict` fails the build — the next tag
// of the template turns it on in `prebuild`.
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { handle } from '../app/api/pages/pages.mjs'

const at = process.argv.indexOf('--root')
const ROOT = at > 0 ? process.argv[at + 1] : join(dirname(fileURLToPath(import.meta.url)), '..')
const TG = join(ROOT, 'app', '[lang]', '(protectedLayer)', 'tg')
const KINDS = ['nav', 'chat', 'stats', 'schedule', 'search', 'control', 'help']
const strict = process.argv.includes('--strict')

const menuFile = join(TG, '_data', 'menu.json')
if (!existsSync(menuFile)) { console.log('===TG_MENU_OK=== no Mini App in this element'); process.exit(0) }
const menu = JSON.parse(readFileSync(menuFile, 'utf8'))
const items = [...(menu.modes ?? []).flatMap((m) => (m.groups ?? []).flatMap((g) => g.items ?? [])), ...(menu.common ?? [])]

// The pages of this element, as the door lists them (no roles needed: only the addresses are compared here).
const { body } = await handle({}, { kind: 'node' }, { root: ROOT, branchRoles: {} })
const pages = new Set((body.pages ?? []).map((p) => p.path))
const ROLE = /^[a-z][a-zA-Z0-9_]*$/

const problems = []
for (const it of items) {
  const name = `«${it?.title?.en ?? it?.slug}»`
  if (!KINDS.includes(it?.kind)) problems.push(`${name}: ${it?.kind ? `unknown kind «${it.kind}»` : 'no kind'} — one of ${KINDS.join(', ')}`)
  if (it?.href !== undefined) {
    if (it.kind !== 'nav') problems.push(`${name}: only a nav item leads to a page (href)`)
    if (typeof it.href !== 'string' || !pages.has(it.href.replace(/\/+$/, '') || '/')) problems.push(`${name}: href «${it.href}» is not a page of this element (npm run test:pages lists them)`)
  } else if (it?.kind === 'nav' && it.slug !== undefined && !existsSync(join(TG, '_pages', it.slug))) {
    problems.push(`${name}: a nav item without href must name a screen folder tg/_pages/${it.slug}`)
  }
  if (it?.roles !== undefined && !(Array.isArray(it.roles) && it.roles.every((r) => typeof r === 'string' && ROLE.test(r)))) problems.push(`${name}: roles must be a list of role names`)
}

// Every screen folder stands in the menu.
const inMenu = new Set(items.flatMap((it) => [it?.slug, ...(it?.children ?? []).map((c) => c?.slug)]).filter((s) => typeof s === 'string'))
const pagesDir = join(TG, '_pages')
const isDir = (p) => { try { return statSync(p).isDirectory() } catch { return false } }
for (const name of existsSync(pagesDir) ? readdirSync(pagesDir) : []) {
  if (!isDir(join(pagesDir, name))) continue
  if (!inMenu.has(name) && ![...inMenu].some((s) => s.startsWith(`${name}/`))) problems.push(`tg/_pages/${name}: a screen outside the menu — give it a menu item with its kind, or turn it into a nav link to the real page`)
}

if (!problems.length) { console.log(`===TG_MENU_OK=== ${items.length} items, every one with its kind`); process.exit(0) }
for (const p of problems) console.log(`  ${strict ? '✗' : '⚠'} ${p}`)
console.log(`${strict ? '===TG_MENU_FAILED===' : '===TG_MENU_WARN==='} ${problems.length} — the Mini App is one person's remote: skill telegram-mini-app, «The purpose»`)
process.exit(strict ? 1 : 0)
