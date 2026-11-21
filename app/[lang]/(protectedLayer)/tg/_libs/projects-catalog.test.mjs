// Samples of the Mini App's projects catalog (node step 821; `npm run test:tg-projects`): exit code 1 on any miss.
// T1 — the owner's catalog is whole (4 sections, 46 directions, ru and en); T4 — a project's numbers come from the site's pages and
// the calendar, each with a negative control.
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { catalogProblems, countsOf, inside, sitePages } from './projects-catalog.mjs'

let failures = 0
const check = (label, ok, got) => { if (!ok) failures++; console.log(`${ok ? 'ok  ' : 'FAIL'} ${label}${ok ? '' : `\n     got  ${JSON.stringify(got).slice(0, 300)}`}`) }

const catalog = JSON.parse(readFileSync(new URL('../_data/projects.json', import.meta.url), 'utf8'))
const groups = catalog.sections.flatMap((s) => s.groups)
check('T1 four sections, 46 directions (Telegram 416–417, 425)', catalog.sections.length === 4 && groups.length === 46, [catalog.sections.length, groups.length])
check('T1 the catalog has no problems', catalogProblems(catalog).length === 0, catalogProblems(catalog))
const twice = structuredClone(catalog); twice.sections[1].groups[0].slug = twice.sections[0].groups[0].slug
check('T1 negative: a slug used twice is named', catalogProblems(twice).some((p) => p.includes('taken')), catalogProblems(twice))
const mute = structuredClone(catalog); delete mute.sections[0].groups[0].title.ru
check('T1 negative: a title without «ru» is named', catalogProblems(mute).some((p) => p.includes('no «ru»')), catalogProblems(mute))

const root = mkdtempSync(join(tmpdir(), 'tg-projects-'))
const put = (path, body) => { const f = join(root, 'app', '[lang]', '(publicLayer)', path); mkdirSync(dirname(f), { recursive: true }); writeFileSync(f, JSON.stringify(body)) }
try {
  put('_pages/post-a/meta.json', { project: 'social/instagram' })
  put('_pages/post-b/meta.json', { project: 'social' })
  put('_pages/post-c/meta.json', {})
  put('blog/_data/meta.json', { project: 'content' })
  put('[slug]/_pages/x/meta.json', { project: 'social' })
  const site = sitePages(root, 'ru')
  check('T4 the site pages that name a project, with their addresses', JSON.stringify(site.map((p) => p.href).sort()) === JSON.stringify(['/ru/blog', '/ru/post-a', '/ru/post-b']), site)
  const cal = [{ project: 'social/instagram', on: true, today: true }, { project: 'social', on: false, today: false }]
  const social = countsOf('social', site, cal)
  check('T4 a direction counts its items: 2 pages, 1 entry on, 1 today', social.pages === 2 && social.active === 1 && social.today === 1, social)
  const insta = countsOf('social/instagram', site, cal)
  check('T4 an item counts its own: 1 page, 1 on, 1 today', insta.pages === 1 && insta.active === 1 && insta.today === 1, insta)
  check('T4 negative: an entry switched off is not active', countsOf('social', [], [{ project: 'social', on: false, today: false }]).active === 0)
  check('T4 negative: a page without a project counts for nobody', countsOf('product', site, cal).pages === 0)
  check('T4 negative: «socialx» is not inside «social»', !inside('socialx', 'social') && inside('social/youtube', 'social'))
} finally {
  rmSync(root, { recursive: true, force: true })
}

if (failures) { console.error(`===TEST_TG_PROJECTS_FAILED=== ${failures}`); process.exit(1) }
console.log('===TEST_TG_PROJECTS_OK===')
