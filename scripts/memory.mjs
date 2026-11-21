// npm run memory -- remember "<words>" [--project <group>/<item>] [--lang <code>]
// npm run memory -- recall "<question>" [--project <group>/<item>] [--lang <code>]
//
// THE ELEMENT'S OWN DEEP MEMORY, PER PROJECT (node step 825-3; the owner, Telegram 532). The node's memory element keeps this element's
// words in this element's own space — its key is its `from`, a neighbour never finds them — through the door `/v1/remember` or
// `/v1/recall`, reached with `neighbourFetch` (the core gives the key for that one neighbour). A project of the Mini App travels inside
// the words; a recall with a project also lists the site's and «Администрирование»'s pages tagged with it — the second memory of work.
// The memory sleeps by default: asleep → the line says how to ask the core's main agent. No key and no value is ever printed.
import { readFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { neighbourFetch } from '../lib/neighbour.mjs'
import { storeHeaders, storeScope } from '../lib/fractera/store-key.mjs'
import { memoryBody, parseArgs } from '../lib/memory/project-memory.mjs'
import { inside, sitePages } from '../app/[lang]/(protectedLayer)/tg/_libs/projects-catalog.mjs'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const env = { ...readEnv(join(ROOT, '.env.local')), ...process.env }

function readEnv(file) {
  const out = {}
  try {
    for (const line of readFileSync(file, 'utf8').split(/\r?\n/)) {
      const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/)
      if (m) out[m[1]] = m[2].trim().replace(/^["']|["']$/g, '')
    }
  } catch { /* no file — the process environment only */ }
  return out
}

const args = parseArgs(process.argv.slice(2))
if (args.error) { console.error(`===MEMORY_USAGE=== ${args.error}\n  npm run memory -- remember|recall "<words>" [--project <group>/<item>]`); process.exit(2) }
const scope = storeScope(storeHeaders(env))
const me = scope.startsWith('element ') ? scope.slice('element '.length) : null
if (!me) { console.error('===MEMORY_FAIL=== no ELEMENT_KEY: the node installer writes it (npm run services:install in the core)'); process.exit(1) }

const body = memoryBody(args, me)
let res = null
try {
  const r = await neighbourFetch('memory', `/v1/${args.verb}`, { method: 'POST', body: JSON.stringify(body), signal: AbortSignal.timeout(600_000) }, { env })
  res = { status: r.status, json: await r.json().catch(() => null) }
} catch (e) {
  res = { status: 0, json: { error: String(e?.message ?? e) } }
}
if (!res.status) {
  console.log(`===MEMORY_ASLEEP=== the node's memory does not answer now (it sleeps by default). Ask the core's main agent: npm run tell-core -- "turn on the deep memory for my task: ${args.verb} about ${args.project ?? 'my work'}"`)
  process.exit(1)
}
if (res.status >= 400 || res.json?.ok === false) {
  console.log(`===MEMORY_REFUSED=== ${res.status}: ${String(res.json?.reason ?? res.json?.error ?? 'no reason').slice(0, 300)}`)
  process.exit(1)
}
const j = res.json ?? {}
console.log(`===MEMORY_${args.verb.toUpperCase()}_OK=== element ${me}${args.project ? ` · project ${args.project}` : ''}`)
if (j.text) console.log(j.text)
if (j.certainty || j.depth) console.log(`(${[j.certainty, j.depth].filter(Boolean).join(' · ')})`)
if (args.verb === 'recall' && args.project) {
  const pages = sitePages(ROOT, args.lang ?? 'ru').filter((p) => inside(p.project, args.project))
  console.log(pages.length ? `pages of ${args.project}: ${pages.map((p) => `${p.href} (${p.project})`).join(', ')}` : `pages of ${args.project}: none tagged yet`)
}
