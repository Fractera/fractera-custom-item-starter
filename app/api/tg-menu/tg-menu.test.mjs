// Samples of the door tg-menu (`npm run test:tg-menu`): exit code 1 on any miss.
import { readFileSync } from 'node:fs'
import { handle } from './tg-menu.mjs'

let failures = 0
const check = (label, ok, got) => { if (!ok) failures++; console.log(`${ok ? 'ok  ' : 'FAIL'} ${label}${ok ? '' : `\n     got  ${JSON.stringify(got).slice(0, 300)}`}`) }

const menu = JSON.parse(readFileSync(new URL('../../[lang]/(protectedLayer)/tg/_data/menu.json', import.meta.url), 'utf8'))
const real = await handle({ lang: 'ru' }, menu)
check('the real menu: two modes, «work» and «a2a», the base /tg', real.status === 200 && real.body.base === '/tg' && real.body.modes.map((m) => m.id).join() === 'work,a2a', real)
const items = real.body.modes.flatMap((m) => m.groups.flatMap((g) => g.items.map((i) => i.slug)))
check('subscriptions and cron are in every element', items.includes('subscriptions') && items.includes('cron'), items)
const withKid = structuredClone(menu); withKid.modes[0].groups[1].items[0].children.push({ slug: 'subscriptions/claude', title: { en: 'Claude', ru: 'Claude' } })
check('a child the agent adds passes', (await handle({}, withKid)).status === 200)
const bad = structuredClone(menu); bad.modes[0].groups[0].items[0].slug = '../admin'
check('refused: a slug that climbs out', (await handle({}, bad)).body.error === 'bad_item')
check('refused: no menu at all', (await handle({}, null)).body.error === 'no_menu')

if (failures) { console.error(`===TEST_TG_MENU_FAILED=== ${failures}`); process.exit(1) }
console.log('===TEST_TG_MENU_OK===')
