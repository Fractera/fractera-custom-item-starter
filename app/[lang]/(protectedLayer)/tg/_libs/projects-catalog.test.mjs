// Samples of the Mini App's projects catalog (node step 821; `npm run test:tg-projects`): exit code 1 on any miss.
// T1 — the owner's catalog is whole (4 sections, 46 directions, ru and en); T4 — a project's numbers come from the site's pages and
// the calendar, each with a negative control.
import { cpSync, mkdirSync, mkdtempSync, readFileSync, rmSync, unlinkSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { addItem, catalogProblems, compileTree, countsOf, inside, ITEM_LIMIT, neighbourProblems, readItems, sitePages, slugFrom, treeProblems, writeItems } from './projects-catalog.mjs'

let failures = 0
const check = (label, ok, got) => { if (!ok) failures++; console.log(`${ok ? 'ok  ' : 'FAIL'} ${label}${ok ? '' : `\n     got  ${JSON.stringify(got).slice(0, 300)}`}`) }

// 824: the tree of folders is the source; the static file is compiled from it, items are read at run time.
const tree = fileURLToPath(new URL('../_projects', import.meta.url))
const compiled = JSON.parse(readFileSync(new URL('../_data/projects.json', import.meta.url), 'utf8'))
const catalog = compileTree(tree, true)
const groups = catalog.sections.flatMap((s) => s.groups)
check('T1 four sections, 46 directions (Telegram 416–417, 425)', catalog.sections.length === 4 && groups.length === 46, [catalog.sections.length, groups.length])
check('T1 the tree has no problems: meta.json, README.md, items.json everywhere', treeProblems(tree).length === 0, treeProblems(tree))
check('T1 the static file equals the tree (sections and groups, no items)', JSON.stringify(compiled) === JSON.stringify(compileTree(tree)) && !compiled.sections[0].groups[0].items, null)
const twice = structuredClone(catalog); twice.sections[1].groups[0].slug = twice.sections[0].groups[0].slug
check('T1 negative: a slug used twice is named', catalogProblems(twice).some((p) => p.includes('taken')), catalogProblems(twice))
const mute = structuredClone(catalog); delete mute.sections[0].groups[0].title.ru
check('T1 negative: a title without «ru» is named', catalogProblems(mute).some((p) => p.includes('no «ru»')), catalogProblems(mute))

const copy = mkdtempSync(join(tmpdir(), 'tg-tree-'))
try {
  cpSync(tree, copy, { recursive: true })
  unlinkSync(join(copy, 'audience', 'social', 'README.md'))
  check('T1 negative: a group without README.md is named', treeProblems(copy).some((p) => p.includes('social') && p.includes('README')), treeProblems(copy))
  writeFileSync(join(copy, 'audience', 'social', 'README.md'), '# social')
  mkdirSync(join(copy, 'life', 'garden'))
  writeFileSync(join(copy, 'life', 'garden', 'meta.json'), JSON.stringify({ order: 99, title: { en: 'Garden', ru: 'Сад' }, line: { en: 'Beds.', ru: 'Грядки.' } }))
  writeFileSync(join(copy, 'life', 'garden', 'README.md'), '# Garden')
  writeFileSync(join(copy, 'life', 'garden', 'items.json'), JSON.stringify([{ slug: 'beds', title: { en: 'Beds', ru: 'Грядки' } }]))
  check('T1 negative: a new group without `npm run tg:projects` makes the static file stale (the prebuild stops)', JSON.stringify(compileTree(copy)) !== JSON.stringify(compiled))
  check('T1 a new group with its folder is in the compiled tree, last of «life»', compileTree(copy).sections[3].groups.at(-1).slug === 'garden')

  const social = join(copy, 'audience', 'social', 'items.json')
  const before = readItems(copy, 'audience', 'social').map((i) => i.slug)
  check('T2 negative: before the line there is no «twitter»', !before.includes('twitter'), before)
  writeFileSync(social, JSON.stringify([...JSON.parse(readFileSync(social, 'utf8')), { slug: 'twitter', title: { en: 'X (Twitter)', ru: 'X (Twitter)' } }]))
  check('T2 one line in items.json — «twitter» is read now, no compile', readItems(copy, 'audience', 'social').some((i) => i.slug === 'twitter') && JSON.stringify(compileTree(copy).sections[1]) === JSON.stringify(compileTree(tree).sections[1]))
  writeFileSync(social, JSON.stringify([{ slug: 'Bad Slug', title: { en: 'x' } }, { slug: 'ok', title: { ru: 'нет en' } }, { slug: 'a', title: { en: 'A' } }, { slug: 'a', title: { en: 'A2' } }]))
  check('T2 negative: a bad slug, no English title and a second «a» are dropped', JSON.stringify(readItems(copy, 'audience', 'social').map((i) => i.title.en)) === '["A"]', readItems(copy, 'audience', 'social'))
  writeFileSync(social, '{ broken')
  check('T2 negative: a broken items.json gives no items, not a crash', readItems(copy, 'audience', 'social').length === 0)
} finally {
  rmSync(copy, { recursive: true, force: true })
}

const root = mkdtempSync(join(tmpdir(), 'tg-projects-'))
const put = (path, body) => { const f = join(root, 'app', '[lang]', '(publicLayer)', path); mkdirSync(dirname(f), { recursive: true }); writeFileSync(f, JSON.stringify(body)) }
try {
  put('_pages/post-a/meta.json', { project: 'social/instagram' })
  put('_pages/post-b/meta.json', { project: 'social' })
  put('_pages/post-c/meta.json', {})
  put('blog/_data/meta.json', { project: 'content' })
  put('[slug]/_pages/x/meta.json', { project: 'social' })
  const admin = join(root, 'app', '[lang]', '(protectedLayer)', 'admin', '_pages', 'plan', 'meta.json'); mkdirSync(dirname(admin), { recursive: true }); writeFileSync(admin, JSON.stringify({ project: 'social/youtube' }))
  const site = sitePages(root, 'ru')
  check('T4 the site pages that name a project, with their addresses', JSON.stringify(site.map((p) => p.href).sort()) === JSON.stringify(['/ru/admin/plan', '/ru/blog', '/ru/post-a', '/ru/post-b']), site)
  const cal = [{ project: 'social/instagram', on: true, today: true }, { project: 'social', on: false, today: false }]
  const social = countsOf('social', site, cal)
  check('T4 a direction counts its items: 3 pages (one in «Администрирование»), 1 entry on, 1 today', social.pages === 3 && social.active === 1 && social.today === 1, social)
  const insta = countsOf('social/instagram', site, cal)
  check('T4 an item counts its own: 1 page, 1 on, 1 today', insta.pages === 1 && insta.active === 1 && insta.today === 1, insta)
  check('T4 negative: an entry switched off is not active', countsOf('social', [], [{ project: 'social', on: false, today: false }]).active === 0)
  check('T4 negative: a page without a project counts for nobody', countsOf('product', site, cal).pages === 0)
  check('T4 negative: «socialx» is not inside «social»', !inside('socialx', 'social') && inside('social/youtube', 'social'))
} finally {
  rmSync(root, { recursive: true, force: true })
}

// 826: «＋ Добавить» — the person's item, and the «Справка» neighbours (the owner, Telegram 503, 505, 506)
const n0 = neighbourProblems(compileTree(tree))
check('T5 every direction has its neighbours for «Справка», each in en and ru and leading somewhere', n0.length === 0, n0)
const lost = structuredClone(compileTree(tree)); lost.sections[1].groups[0].neighbours[0].to = 'nowhere'; delete lost.sections[0].groups[0].neighbours[0].what.ru
const nBad = neighbourProblems(lost)
check('T5 negative: a neighbour leading nowhere and one without «ru» are named', nBad.some((p) => p.includes('leads nowhere')) && nBad.some((p) => p.includes('no «ru»')), nBad)
check('T6 a name becomes an address: Cyrillic in Latin, accents dropped, nothing left — «item»',
  slugFrom('Мой Инстаграм!') === 'moy-instagram' && slugFrom('Ёжик') === 'ezhik' && slugFrom('Café') === 'cafe' && slugFrom('日本') === 'item' && slugFrom('X (Twitter)') === 'x-twitter')
const at = new Date('2026-11-21T16:00:00Z')
const have = [{ slug: 'instagram', title: { en: 'Instagram', ru: 'Instagram' } }, { slug: 'x-twitter', title: { en: 'Old' } }, 'a line the screen skips']
const ok1 = addItem(have, { title: '  X   (Twitter)\n', line: 'Посты и треды' }, ['ru', 'de'], at)
check('T6 a new item: one-line words in every language, a free address, «added by person», the old lines kept as they lay',
  ok1.item?.slug === 'x-twitter-2' && ok1.item.title.en === 'X (Twitter)' && ok1.item.title.de === 'X (Twitter)' && ok1.item.line.ru === 'Посты и треды'
  && ok1.item.added.by === 'person' && ok1.items.length === 4 && ok1.items[2] === 'a line the screen skips', ok1)
check('T6 negative: an empty name, 61 characters, a 121-character line', addItem(have, { title: ' ' }).error === 'no-title'
  && addItem(have, { title: 'x'.repeat(61) }).error === 'title-long' && addItem(have, { title: 'ok', line: 'y'.repeat(121) }).error === 'line-long')
check('T6 negative: the same name in any case is «taken»; a full direction is «full»', addItem(have, { title: 'INSTAGRAM' }).error === 'taken'
  && addItem(Array.from({ length: ITEM_LIMIT }, (_, i) => ({ slug: `i${i}`, title: { en: `I${i}` } })), { title: 'one more' }).error === 'full')
const wt = mkdtempSync(join(tmpdir(), 'tg-items-'))
try {
  mkdirSync(join(wt, 'audience', 'social'), { recursive: true })
  writeItems(wt, 'audience', 'social', ok1.items)
  const back = readItems(wt, 'audience', 'social').map((i) => i.slug)
  check('T6 written whole and read back at once (no build): the new item is there, the skipped line stays in the file', back.includes('x-twitter-2')
    && JSON.parse(readFileSync(join(wt, 'audience', 'social', 'items.json'), 'utf8')).length === 4, back)
} finally {
  rmSync(wt, { recursive: true, force: true })
}

if (failures) { console.error(`===TEST_TG_PROJECTS_FAILED=== ${failures}`); process.exit(1) }
console.log('===TEST_TG_PROJECTS_OK===')
