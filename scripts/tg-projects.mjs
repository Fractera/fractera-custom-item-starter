// tg:projects — the Mini App's projects from their tree of folders (node step 824; the owner, Telegram 494).
//   npm run tg:projects          — compile tg/_projects/** into tg/_data/projects.json (sections and groups) and the four «Projects»
//                                  children of tg/_data/menu.json, after a new section or group; then a build.
//   node scripts/tg-projects.mjs --check — the prebuild: stops a build whose tree has a problem or whose two files differ from it.
// Items are not compiled: each group's items.json is read at run time (no build for a new network).
import { readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { compileTree, treeDir, treeProblems } from '../app/[lang]/(protectedLayer)/tg/_libs/projects-catalog.mjs'

const root = process.cwd()
const tree = treeDir(root)
const data = join(root, 'app', '[lang]', '(protectedLayer)', 'tg', '_data')
const check = process.argv.includes('--check')

const problems = treeProblems(tree)
if (problems.length) {
  console.error(`===TG_PROJECTS_TREE=== ${problems.length} problem(s) in tg/_projects:\n  ${problems.join('\n  ')}`)
  process.exit(1)
}

const catalog = compileTree(tree)
const catalogText = `${JSON.stringify(catalog, null, 1)}\n`
const menuFile = join(data, 'menu.json')
const menu = JSON.parse(readFileSync(menuFile, 'utf8'))
const projects = menu.modes?.flatMap((m) => m.groups ?? []).flatMap((g) => g.items ?? []).find((it) => it.slug === 'projects')
if (!projects) { console.error('===TG_PROJECTS_TREE=== menu.json has no «projects» item'); process.exit(1) }
projects.children = catalog.sections.map((s) => ({ slug: `projects/${s.slug}`, title: s.title }))
const menuText = `${JSON.stringify(menu, null, 2)}\n`

// Windows checks out text with CRLF (the CI's windows-latest, 2026-11-22: ===TG_PROJECTS_STALE=== on unchanged files): compare by content.
const read = (f) => { try { return readFileSync(f, 'utf8').replace(/\r\n/g, '\n') } catch { return '' } }
const stale = [[join(data, 'projects.json'), catalogText], [menuFile, menuText]].filter(([f, t]) => read(f) !== t)
if (check) {
  if (stale.length) {
    console.error(`===TG_PROJECTS_STALE=== ${stale.map(([f]) => f.slice(root.length + 1)).join(', ')} differ from tg/_projects — run npm run tg:projects and commit`)
    process.exit(1)
  }
  console.log(`tg:projects — the tree and its files agree (${catalog.sections.length} sections, ${catalog.sections.flatMap((s) => s.groups).length} groups)`)
} else {
  for (const [f, t] of stale) writeFileSync(f, t)
  console.log(`tg:projects — ${stale.length ? `written: ${stale.map(([f]) => f.slice(root.length + 1)).join(', ')}` : 'nothing to change'}`)
}
