// The work of the door GET /api/pages (node step 848-7; the aifa.dev server's letter 2026-11-23, 1.3в: «Страниц, закрытых ролью, одной
// командой не получить»): this element's pages — every address a person can open — and who may open each one, plus its Telegram Mini App
// with its items counted by kind. The core's `npm run pages` asks here: the element knows its own branches and roles, the core never reads
// its code. Pages are data folders (`lib/page-tree.ts`): a branch's own page (`_data/` + `page.tsx`) and its children in `_pages/<slug>/`
// — nested under a `[...slug]` route, one level under a `[slug]` route. Access: a public branch — guest; a protected branch — the roles
// of its gate (`route.ts` passes them from `lib/roles.ts`); a page's own lock — its role folder (`_pages/<role>/…`, protected layer
// only) and `meta.roles`, each with its heirs, the architect and a managed branch's people — is `lib/page-lock.mjs`, the page's own rule.
// Pure over a folder: `ctx.root` is the element's folder, `ctx.branchRoles` the gates — route.ts gives both, the test gives a sample.

import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { pageLock } from '../../../lib/page-lock.mjs'

const LANG = /^[a-z]{2}$/
const SLUG = /^[a-z0-9][a-z0-9-]*$/
const KINDS = ['nav', 'chat', 'stats', 'schedule', 'search', 'control', 'help']

const readJson = (file) => { try { return JSON.parse(readFileSync(file, 'utf8')) } catch { return null } }
const isDir = (p) => { try { return statSync(p).isDirectory() } catch { return false } }
const isFile = (p) => { try { return statSync(p).isFile() } catch { return false } }
const dirs = (p) => { try { return readdirSync(p).filter((n) => isDir(join(p, n))) } catch { return [] } }

/** The page's title in `lang`, its English base otherwise. */
function titleOf(dir, lang) {
  const tr = lang && lang !== 'en' ? readJson(join(dir, `${lang}.json`)) : null
  const base = readJson(join(dir, 'en.json'))
  const t = (tr && typeof tr.title === 'string' && tr.title) || (base && typeof base.title === 'string' && base.title) || null
  return t
}

/** A data page folder: its meta or its English words. */
const isPage = (dir) => isFile(join(dir, 'meta.json')) || isFile(join(dir, 'en.json'))

/** The page's role folder — the first folder of its path under the branch named after a role (`vip-user` → `vip_user`); protected only. */
function folderRole(rel, branch, ctx) {
  if (branch === 'public' || !rel) return null
  const first = rel.split('/')[0].replace(/-/g, '_')
  return (ctx.allRoles ?? []).includes(first) ? first : null
}

function pageOf(dir, path, rel, branch, branchAccess, lang, ctx) {
  const meta = readJson(join(dir, 'meta.json')) ?? {}
  const metaRoles = Array.isArray(meta.roles) ? meta.roles.filter((r) => typeof r === 'string') : []
  const lock = pageLock({
    own: folderRole(rel, branch, ctx),
    metaRoles,
    branch: branch === 'public' ? '' : branch,
    rolesThatSee: ctx.rolesThatSee ?? ((r) => [r]),
    groups: ctx.groups ?? {},
  })
  return {
    path,
    branch,
    title: titleOf(dir, lang),
    access: lock ?? branchAccess,
    ...(meta.awaitingDesign === true ? { awaitingDesign: true } : {}),
  }
}

/** Children of `_pages`: nested (a `[...slug]` route) or one level (a `[slug]` route). */
function children(pagesDir, prefix, rel, nested, branch, access, lang, ctx, out) {
  for (const name of dirs(pagesDir).sort()) {
    if (!SLUG.test(name)) continue
    const dir = join(pagesDir, name)
    const path = `${prefix}/${name}`
    const r = rel ? `${rel}/${name}` : name
    if (isPage(dir)) out.push(pageOf(dir, path, r, branch, access, lang, ctx))
    if (nested) children(dir, path, r, true, branch, access, lang, ctx, out)
  }
}

/** One branch: its own page (when it has a route) and its children. */
function branch(dir, prefix, name, access, lang, ctx, out) {
  if (isFile(join(dir, 'page.tsx'))) {
    const root = join(dir, '_data')
    out.push(pageOf(isPage(root) ? root : dir, prefix || '/', '', name, access, lang, ctx))
  }
  const nested = isDir(join(dir, '[...slug]'))
  if (nested || isDir(join(dir, '[slug]'))) children(join(dir, '_pages'), prefix, '', nested, name, access, lang, ctx, out)
}

/** The Mini App: its address, who opens it, its items by kind (848-4; an item without a kind is counted as «none»). */
function miniApp(tgDir, access) {
  const menu = readJson(join(tgDir, '_data', 'menu.json'))
  if (!menu) return null
  const kinds = {}
  const items = [...(menu.modes ?? []).flatMap((m) => (m.groups ?? []).flatMap((g) => g.items ?? [])), ...(menu.common ?? [])]
  for (const it of items) {
    const k = KINDS.includes(it?.kind) ? it.kind : 'none'
    kinds[k] = (kinds[k] ?? 0) + 1
  }
  return { path: '/tg', access, items: items.length, kinds }
}

export async function handle(input, caller, ctx) {
  // The list names every closed page of this element — the core and the native elements only, never a neighbour.
  if (!caller || caller.kind !== 'node') return { status: 403, body: { error: 'node_only', reason: 'the list of pages is for the node' } }
  const lang = typeof input?.lang === 'string' && LANG.test(input.lang) ? input.lang : 'en'
  const app = join(ctx.root, 'app', '[lang]')
  if (!isDir(app)) return { status: 422, body: { error: 'no_app', reason: 'app/[lang] is missing in this element' } }
  const pages = []
  const pub = join(app, '(publicLayer)')
  if (isDir(pub)) branch(pub, '', 'public', 'guest', lang, ctx, pages)
  const prot = join(app, '(protectedLayer)')
  let tg = null
  for (const name of dirs(prot).sort()) {
    if (!SLUG.test(name)) continue
    // A branch whose gate the route does not know — its pages are listed, their access is said honestly: unknown.
    const access = Array.isArray(ctx.branchRoles?.[name]) ? [...ctx.branchRoles[name]] : null
    if (name === 'tg') { tg = miniApp(join(prot, name), access); continue }
    branch(join(prot, name), `/${name}`, name, access, lang, ctx, pages)
  }
  return { status: 200, body: { ok: true, lang, pages, miniApp: tg } }
}
