// Samples of the Mini App guard (node step 848-5, `npm run test:check-tg-menu`): a good menu passes; an item without a kind, a nav link to
// no page, an href on a non-nav item and a screen outside the menu are named — a warning by default, a failure with --strict.
import { spawnSync } from 'node:child_process'
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const GUARD = join(dirname(fileURLToPath(import.meta.url)), 'check-tg-menu.mjs')
let failures = 0
const check = (label, ok, got) => { if (!ok) failures++; console.log(`${ok ? 'ok  ' : 'FAIL'} ${label}${ok ? '' : `\n     ${got}`}`) }

function sample(items, screens = []) {
  const root = mkdtempSync(join(tmpdir(), 'tg-menu-'))
  const put = (p, v) => { mkdirSync(dirname(join(root, p)), { recursive: true }); writeFileSync(join(root, p), typeof v === 'string' ? v : JSON.stringify(v)) }
  const A = 'app/[lang]'
  put(`${A}/(publicLayer)/page.tsx`, '')
  put(`${A}/(protectedLayer)/admin/page.tsx`, '')
  put(`${A}/(protectedLayer)/admin/[...slug]/page.tsx`, '')
  put(`${A}/(protectedLayer)/admin/_pages/orders/en.json`, { title: 'Orders' })
  put(`${A}/(protectedLayer)/tg/_data/menu.json`, { modes: [{ id: 'work', title: { en: 'Work' }, groups: [{ items }] }], common: [] })
  for (const s of screens) put(`${A}/(protectedLayer)/tg/_pages/${s}/en.json`, { title: s })
  return root
}
const run = (root, strict) => spawnSync(process.execPath, [GUARD, '--root', root, ...(strict ? ['--strict'] : [])], { encoding: 'utf8' })
const T = (en) => ({ en })

const good = sample([{ slug: '', kind: 'stats', title: T('Home') }, { slug: 'go-orders', kind: 'nav', href: '/admin/orders', roles: ['architect'], title: T('Orders') }, { slug: 'cron', kind: 'schedule', title: T('Cron') }], ['cron'])
const g = run(good, true)
check('a good menu passes even with --strict', g.status === 0 && g.stdout.includes('===TG_MENU_OK==='), g.stdout)

const bad = sample([
  { slug: '', title: T('No kind') },
  { slug: 'odd', kind: 'dashboard', title: T('Odd kind') },
  { slug: 'dead', kind: 'nav', href: '/admin/missing', title: T('Dead link') },
  { slug: 'stats-link', kind: 'stats', href: '/admin/orders', title: T('Href on stats') },
], ['shop-copy'])
const w = run(bad, false)
check('negative: problems warn and pass without --strict (live elements built before the law)', w.status === 0 && w.stdout.includes('===TG_MENU_WARN=== 5'), w.stdout)
const f = run(bad, true)
check('negative: --strict fails the build', f.status === 1 && f.stdout.includes('===TG_MENU_FAILED==='), f.stdout)
for (const [label, needle] of [['no kind', '«No kind»: no kind'], ['an unknown kind', 'unknown kind «dashboard»'], ['a nav link to no page', 'href «/admin/missing» is not a page'], ['an href on a non-nav item', '«Href on stats»: only a nav item'], ['a screen outside the menu', 'tg/_pages/shop-copy: a screen outside the menu']]) {
  check(`negative: named — ${label}`, f.stdout.includes(needle), f.stdout)
}
for (const r of [good, bad]) rmSync(r, { recursive: true, force: true })

if (failures) { console.error(`===TEST_CHECK_TG_MENU_FAILED=== ${failures}`); process.exit(1) }
console.log('===TEST_CHECK_TG_MENU_OK===')
