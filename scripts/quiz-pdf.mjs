// THIS ELEMENT READS ITS OWN PRODUCT QUIZ PDF (core step 861-3; fractera.ai 2026-11-27, need-20261127-3d1637: «to check what the person
// downloads … without asking the person to send the file»). The core's door `/api/node/product-quiz/pdf` with this element's OWN key
// (SETTINGS_SECRET, sent as X-Node-Key): its own quiz only — a neighbour's is refused there (403), a wrong key 401.
//
//   npm run quiz:pdf [-- <file>] [-- --lang ru]   saves the PDF (default: development-docs/product/quiz.pdf, outside git) and prints its size
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { ROOT, env, coreUrl } from './core-door.mjs'

const fail = (msg) => { console.log(`===QUIZ_PDF_FAIL=== ${msg}`); process.exit(1) }
const args = process.argv.slice(2)
const li = args.indexOf('--lang')
const lang = li >= 0 ? args[li + 1] ?? '' : ''
const file = resolve(ROOT, args.find((a, i) => !a.startsWith('--') && i !== li + 1) ?? join('development-docs', 'product', 'quiz.pdf'))
let id = null
try { id = JSON.parse(readFileSync(join(ROOT, 'OWN-SERVICE-PROPS', 'OWN-SERVICE-PROPS.json'), 'utf8')).id } catch { /* no passport */ }
if (!id) fail('this element has no id (OWN-SERVICE-PROPS/OWN-SERVICE-PROPS.json → id)')
const core = coreUrl()
const key = env.SETTINGS_SECRET?.trim()
if (!core) fail('the address of the core is unknown here (NODE_DOMAIN_FILE → logs/runtime.json)')
if (!key) fail('no key here (SETTINGS_SECRET in .env.local)')
try {
  const r = await fetch(`${core}/api/node/product-quiz/pdf?item=${encodeURIComponent(id)}${lang ? `&lang=${encodeURIComponent(lang)}` : ''}`, {
    headers: { 'x-node-key': key }, signal: AbortSignal.timeout(120000),
  })
  const type = r.headers.get('content-type') ?? ''
  if (!r.ok || !type.includes('application/pdf')) {
    const j = await r.json().catch(() => null)
    fail(`the core answered ${r.status}: ${j?.reason ?? j?.error ?? type}`)
  }
  const bytes = Buffer.from(await r.arrayBuffer())
  mkdirSync(dirname(file), { recursive: true })
  writeFileSync(file, bytes)
  console.log(`===QUIZ_PDF_OK=== ${file.slice(ROOT.length + 1)} · ${Math.round(bytes.length / 1024)} KB — read it before you tell the person it is ready`)
} catch (e) {
  fail(`the core did not answer: ${e instanceof Error ? e.message : e}`)
}
