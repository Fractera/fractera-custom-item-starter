// Samples of the door tg-menu (`npm run test:tg-menu`): exit code 1 on any miss.
import { readFileSync } from 'node:fs'
import { handle } from './tg-menu.mjs'

let failures = 0
const check = (label, ok, got) => { if (!ok) failures++; console.log(`${ok ? 'ok  ' : 'FAIL'} ${label}${ok ? '' : `\n     got  ${JSON.stringify(got).slice(0, 300)}`}`) }

const menu = JSON.parse(readFileSync(new URL('../../[lang]/(protectedLayer)/tg/_data/menu.json', import.meta.url), 'utf8'))
const real = await handle({ lang: 'ru' }, menu)
check('the real menu: one mode «work», the base /tg (821: the A2A screens wait for the network)', real.status === 200 && real.body.base === '/tg' && real.body.modes.map((m) => m.id).join() === 'work', real)
const items = real.body.modes[0].groups.flatMap((g) => g.items)
check('821: Главная, Проекты, Cron, Элемент, Настройки, Как начать — in this order', items.map((i) => i.slug).join() === ',projects,cron,element,settings,start', items.map((i) => i.slug))
check('848: every item says what it is for — stats, chat, schedule, nav, control, help', items.map((i) => i.kind).join() === 'stats,chat,schedule,nav,control,help', items.map((i) => i.kind))
const projects = items.find((i) => i.slug === 'projects')
check('821: «Проекты» opens into its four sections (Telegram 425)', projects?.children?.map((c) => c.slug).join() === 'projects/business,projects/audience,projects/knowledge,projects/life', projects)
check('821: `common` stays in the shape the core reads — empty', Array.isArray(real.body.common) && real.body.common.length === 0, real.body.common)
const withKid = structuredClone(menu); withKid.modes[0].groups[0].items[1].children.push({ slug: 'projects/my-own', title: { en: 'My own', ru: 'Своё' } })
check('a child the agent adds passes', (await handle({}, withKid)).status === 200)
const bad = structuredClone(menu); bad.modes[0].groups[0].items[0].slug = '../admin'
check('refused: a slug that climbs out', (await handle({}, bad)).body.error === 'bad_item')
check('refused: no menu at all', (await handle({}, null)).body.error === 'no_menu')

if (failures) { console.error(`===TEST_TG_MENU_FAILED=== ${failures}`); process.exit(1) }
console.log('===TEST_TG_MENU_OK===')
