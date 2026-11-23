// Samples of the door pages (`npm run test:pages`): exit code 1 on any miss. Node step 848-7: a sample folder with every kind of branch,
// then this template's own tree — its public pages are the ones its sitemap lists.
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { handle } from './pages.mjs'

let failures = 0
const check = (label, ok, got) => {
  if (!ok) failures++
  console.log(`${ok ? 'ok  ' : 'FAIL'} ${label}${ok ? '' : `\n     got ${JSON.stringify(got)}`}`)
}

const tmp = mkdtempSync(join(tmpdir(), 'pages-door-'))
const put = (p, v) => { mkdirSync(dirname(join(tmp, p)), { recursive: true }); writeFileSync(join(tmp, p), typeof v === 'string' ? v : JSON.stringify(v)) }
const A = 'app/[lang]'
put(`${A}/(publicLayer)/page.tsx`, '')
put(`${A}/(publicLayer)/_data/en.json`, { title: 'Home' })
put(`${A}/(publicLayer)/[slug]/page.tsx`, '')
put(`${A}/(publicLayer)/_pages/privacy/meta.json`, {})
put(`${A}/(publicLayer)/_pages/privacy/en.json`, { title: 'Privacy' })
put(`${A}/(publicLayer)/_pages/privacy/ru.json`, { title: 'Конфиденциальность' })
put(`${A}/(publicLayer)/_pages/privacy/deep/en.json`, { title: 'Not reachable: [slug] is one level' })
put(`${A}/(publicLayer)/_pages/vip/meta.json`, { roles: ['vip_user'] })
put(`${A}/(publicLayer)/_pages/vip/en.json`, { title: 'VIP' })
put(`${A}/(protectedLayer)/admin/page.tsx`, '')
put(`${A}/(protectedLayer)/admin/_data/en.json`, { title: 'Administration' })
put(`${A}/(protectedLayer)/admin/[...slug]/page.tsx`, '')
put(`${A}/(protectedLayer)/admin/_pages/agent/meta.json`, {})
put(`${A}/(protectedLayer)/admin/_pages/agent/en.json`, { title: 'Agent' })
put(`${A}/(protectedLayer)/admin/_pages/agent/telegram/en.json`, { title: 'Telegram bot' })
put(`${A}/(protectedLayer)/admin/_pages/draft/meta.json`, { awaitingDesign: true })
put(`${A}/(protectedLayer)/mystery/page.tsx`, '')
put(`${A}/(protectedLayer)/account/page.tsx`, '')
put(`${A}/(protectedLayer)/account/[...slug]/page.tsx`, '')
put(`${A}/(protectedLayer)/account/_pages/vip-user/lounge/en.json`, { title: 'Lounge' })
put(`${A}/(protectedLayer)/tg/page.tsx`, '')
put(`${A}/(protectedLayer)/tg/_data/menu.json`, { modes: [{ id: 'work', groups: [{ items: [{ slug: '', kind: 'stats' }, { slug: 'projects', kind: 'chat' }, { slug: 'x' }] }] }], common: [] })

const roles = { admin: ['architect', 'elementAdmin001'], tg: ['architect', 'elementAdmin001'], account: ['user', 'vip_user', 'architect'] }
// the rule of the template's lib/roles.ts in small: vip_user inherits user
const heirs = { user: ['user', 'vip_user'], vip_user: ['vip_user'] }
const ctxOf = () => ({ root: tmp, branchRoles: roles, allRoles: ['user', 'vip_user', 'architect'], rolesThatSee: (r) => heirs[r] ?? [r], groups: { admin: ['architect', 'elementAdmin001'] } })
const node = { kind: 'node' }

const r = await handle({}, node, ctxOf())
const paths = (r.body.pages ?? []).map((p) => p.path)
check('200 for the node', r.status === 200 && r.body.ok === true, r)
check('the public home and its one-level children; nothing under a [slug] child', JSON.stringify(r.body.pages.filter((p) => p.branch === 'public').map((p) => p.path)) === JSON.stringify(['/', '/privacy', '/vip']), paths)
check('a protected branch with [...slug]: its page and nested children', ['/admin', '/admin/agent', '/admin/agent/telegram', '/admin/draft'].every((p) => paths.includes(p)), paths)
const at = (p) => r.body.pages.find((x) => x.path === p)
check('public pages are open to guests', at('/privacy').access === 'guest' && at('/').access === 'guest', at('/privacy'))
check('meta.roles is the page\'s own lock — with the architect', JSON.stringify(at('/vip').access) === '["vip_user","architect"]', at('/vip'))
check('a role folder locks a protected page to that role and its heirs (402)', JSON.stringify(at('/account/vip-user/lounge')?.access) === '["vip_user","architect"]', at('/account/vip-user/lounge'))
check('a protected page takes its branch gate', JSON.stringify(at('/admin/agent/telegram').access) === JSON.stringify(roles.admin), at('/admin/agent/telegram'))
check('a branch whose gate is unknown — access null, never guessed', at('/mystery') && at('/mystery').access === null, at('/mystery'))
check('a page awaiting its design is flagged', at('/admin/draft').awaitingDesign === true, at('/admin/draft'))
check('the Mini App is not a page: listed apart, items counted by kind', !paths.some((p) => p.startsWith('/tg')) && r.body.miniApp?.path === '/tg' && r.body.miniApp.items === 3 && r.body.miniApp.kinds.stats === 1 && r.body.miniApp.kinds.chat === 1 && r.body.miniApp.kinds.none === 1, r.body.miniApp)
const ru = await handle({ lang: 'ru' }, node, ctxOf())
check('titles in the asked language, English otherwise', ru.body.pages.find((x) => x.path === '/privacy').title === 'Конфиденциальность' && ru.body.pages.find((x) => x.path === '/vip').title === 'VIP', ru.body.pages)
const n = await handle({}, { kind: 'element', id: 'shop' }, ctxOf())
check('negative: a neighbour does not get the list of closed pages', n.status === 403, n)
const none = await handle({}, null, ctxOf())
check('negative: no caller — refused', none.status === 403, none)
rmSync(tmp, { recursive: true, force: true })

// This template's own tree: every public data page is listed for guests.
const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..', '..')
const own = await handle({}, node, { root: ROOT, branchRoles: { admin: ['architect'], account: ['user'], staff: ['manager'], finance: ['finance'], tg: ['architect'], 'messenger-h2a': ['architect'], 'messenger-h2h': ['architect'], prototypes: ['architect'] } })
const ownPaths = (own.body.pages ?? []).map((p) => p.path)
check('the template itself: home, privacy, terms, cookies, accessibility for guests', ['/', '/privacy', '/terms', '/cookies', '/accessibility'].every((p) => own.body.pages.find((x) => x.path === p)?.access === 'guest'), ownPaths)
check('the template itself: the agent pages of its administration', ['/admin/agent/telegram', '/admin/agent/terminal', '/admin/agent/subscription'].every((p) => ownPaths.includes(p)), ownPaths)
check('the template itself: every branch gate is known', !own.body.pages.some((p) => p.access === null), own.body.pages.filter((p) => p.access === null))
check('the template itself: its Mini App', own.body.miniApp?.path === '/tg' && own.body.miniApp.items > 0, own.body.miniApp)

if (failures) { console.error(`===TEST_PAGES_FAILED=== ${failures}`); process.exit(1) }
console.log('===TEST_PAGES_OK===')
