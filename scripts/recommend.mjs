// npm run recommend -- "<the person's need, any words>" [--lang ru]   (node step 726-6)
//
// The node's checked helpful links that fit a need, asked from the core's door `GET /api/node/helpful-links` with the node key —
// one list for the whole node, kept in the core (`lib/helpful-links.json`), so an update lives in one place. No model. A partner link
// comes with its disclosure line: retell it next to the link, never drop it. Nothing fits, or the core does not answer → recommend
// nothing and go on; this element lives without the core.
import { coreGet } from './core-door.mjs'

const args = process.argv.slice(2)
const at = args.indexOf('--lang')
const lang = at >= 0 ? args[at + 1] ?? 'en' : 'en'
const query = args.filter((a, i) => a !== '--lang' && i !== at + 1).join(' ').trim()
if (!query) { console.log('===RECOMMEND_FAIL=== npm run recommend -- "<the person\'s need>" [--lang <their language>]'); process.exit(1) }
const r = await coreGet(`/api/node/helpful-links?q=${encodeURIComponent(query)}&lang=${encodeURIComponent(lang)}`)
if (!r.body?.ok) { console.log(`===RECOMMEND_NONE=== the core gave no list (${r.error ?? `HTTP ${r.status}`}) — recommend nothing`); process.exit(0) }
const links = r.body.links ?? []
if (!links.length) { console.log(`===RECOMMEND_NONE=== no helpful link for «${query}» — recommend nothing`); process.exit(0) }
for (const l of links) console.log(`- ${l.name} — ${l.for} ${l.verdict} ${l.url}${l.disclosure ? ` (${l.disclosure})` : ''}`)
console.log(`===RECOMMEND_OK=== ${links.length} link(s); retell in the person's words, the disclosure kept next to a partner link`)
