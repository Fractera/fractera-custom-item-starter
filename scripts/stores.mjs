// npm run stores [-- --probe [--keep] | --clean]
//
// WHAT THIS ELEMENT'S KEY OPENS IN THE NODE'S STORES (node step 654-6): one line per store — the database, the files, the vectors, the
// graph — with whose space the key opens there (`element <id>` or `node`) and how much of its own lies in it. The element's agent reads
// it before it speaks about its stores (CLAUDE.md §5 «Who you are»).
//   --probe   write one marker into each store, read it back, remove it (the graph keeps its marker: an entity cannot be deleted yet)
//   --keep    with --probe: leave the markers — another element (or the main agent) can check it does not see them
//   --clean   remove the markers --keep left
// No key and no value is ever printed. The store addresses come from the element's .env.local, as the installer wrote them.
import { readFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { storeHeaders, storeScope } from '../lib/fractera/store-key.mjs'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const env = { ...readEnv(join(ROOT, '.env.local')), ...process.env }
const H = storeHeaders(env)
const SCOPE = storeScope(H)
const ME = SCOPE.startsWith('element ') ? SCOPE.slice('element '.length) : null
const DATA = String(env.REMOTE_DATA_URL ?? '').replace(/\/+$/, '')
const GRAPH = String(env.GRAPH_URL ?? '').replace(/\/+$/, '')
const args = process.argv.slice(2)
const PROBE = args.includes('--probe')
const KEEP = args.includes('--keep')
const CLEAN = args.includes('--clean')
const MARK = `stores-probe-${ME ?? 'node'}`

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

async function call(base, method, path, body) {
  if (!base) return { status: 0, json: null }
  const init = { method, headers: { ...H }, signal: AbortSignal.timeout(120_000) }
  if (body instanceof FormData) init.body = body
  else if (body !== undefined) { init.body = JSON.stringify(body); init.headers['content-type'] = 'application/json' }
  try {
    const r = await fetch(base + path, init)
    return { status: r.status, json: await r.json().catch(() => null) }
  } catch (e) {
    return { status: 0, json: { error: String(e?.message ?? e) } }
  }
}
const sql = (text) => call(DATA, 'POST', '/db/migrate', { sql: text, params: [] })
const lines = []
let failed = 0
const line = (store, ok, text) => { lines.push(`${ok ? '✓' : '✗'} ${store.padEnd(8)} ${text}`); if (!ok) failed += 1 }

if (Object.keys(H).length === 0) {
  console.log('===STORES_FAIL=== no store key: ELEMENT_KEY is written by the node installer (npm run services:install in the core)')
  process.exit(1)
}

// ── the database ──
const who = await call(DATA, 'GET', '/db/whoami')
const tables = await call(DATA, 'GET', '/db/tables')
const tableNames = (tables.json?.tables ?? []).map((t) => (typeof t === 'string' ? t : t?.name)).filter(Boolean)
line('data', who.status === 200, `${who.json?.scope === 'element' ? `element ${who.json.id}` : who.json?.scope ?? `no answer (${who.status})`}` +
  `${who.json?.database ? ` · ${who.json.database}` : ''} · ${tableNames.length} table(s) of its own`)
// ── the files ──
const media = await call(DATA, 'GET', '/media')
const items = media.json?.items ?? []
const mine = ME ? items.filter((i) => i.owner === ME) : items
line('storage', media.status === 200, `${SCOPE} · ${mine.length} file(s) of its own${ME ? ` · ${items.length - mine.length} public file(s) of the node it sees` : ''}`)
// ── the vectors ──
const vs = await call(DATA, 'GET', '/vectors/status')
line('vectors', vs.status === 200, `${SCOPE} · ${vs.json?.count ?? '?'} record(s) of its own · model ${vs.json?.model ?? '?'}`)
// ── the graph ──
const gs = await call(GRAPH, 'GET', '/api/graph-status')
const spaces = gs.json?.spaces
line('graph', gs.status === 200, GRAPH ? `${SCOPE} · ${gs.json?.entities ?? '?'} entit(ies) of its own${Array.isArray(spaces) ? ` in ${spaces.length} space(s)` : ''}` : 'GRAPH_URL is empty')

if (PROBE || CLEAN) {
  const forget = async () => {
    await sql('DROP TABLE IF EXISTS stores_probe')
    const list = await call(DATA, 'GET', '/media')
    for (const it of (list.json?.items ?? []).filter((i) => i.name === `${MARK}.txt` && (!ME || i.owner === ME))) await call(DATA, 'DELETE', `/media/${it.id}`)
    await call(DATA, 'DELETE', `/vectors/${MARK}`)
  }
  if (CLEAN) {
    await forget()
    lines.push(`  the markers of ${MARK} removed (the graph keeps its entity: it cannot be deleted yet)`)
  } else {
    const t = await sql("CREATE TABLE IF NOT EXISTS stores_probe (v TEXT)")
    const ins = await sql(`INSERT INTO stores_probe (v) VALUES ('${MARK}')`)
    const back = await sql('SELECT v FROM stores_probe')
    line('probe', t.status === 200 && ins.status === 200 && (back.json?.rows ?? []).some((r) => r.v === MARK), `data — a table stores_probe written and read back by ${SCOPE}`)
    const form = new FormData()
    form.append('file', new Blob([`${MARK}\n`], { type: 'text/plain' }), `${MARK}.txt`)
    form.append('visibility', 'private')
    const up = await call(DATA, 'POST', '/media/upload', form)
    line('probe', up.status === 200 && (!ME || up.json?.item?.owner === ME), `storage — ${MARK}.txt uploaded private, owner ${up.json?.item?.owner ?? '?'}`)
    const vp = await call(DATA, 'POST', '/vectors', { id: MARK, collection: 'stores-probe', text: `the stores probe of ${MARK}` })
    const vf = await call(DATA, 'POST', '/vectors/search', { collection: 'stores-probe', query: `the stores probe of ${MARK}`, k: 1 })
    line('probe', vp.status === 200 && vf.json?.results?.[0]?.id === MARK, `vectors — a record in the collection stores-probe, found back as ${vf.json?.results?.[0]?.id ?? '?'}`)
    const gi = await call(GRAPH, 'POST', '/api/graph-insert', { space: 'stores-probe', chunks: [{ content: `The marker ${MARK}.`, source_id: MARK }],
      entities: [{ entity_name: MARK, entity_type: 'marker', description: `The marker ${MARK}.`, source_id: MARK }], relationships: [] })
    const gq = await call(GRAPH, 'POST', '/api/graph-query', { space: 'stores-probe', query: MARK, mode: 'local', ll_keywords: [MARK] })
    line('probe', gi.status === 200 && gq.json?.found === true, `graph — an entity in the space stores-probe, found back: ${gq.json?.found}`)
    if (!KEEP) { await forget(); lines.push(`  the markers removed (the graph keeps its entity in stores-probe: it cannot be deleted yet)`) }
    else lines.push(`  the markers kept (--keep): ${MARK} — remove them with npm run stores -- --clean`)
  }
}

console.log(lines.join('\n'))
console.log(failed ? `===STORES_FAIL=== ${failed}` : `===STORES_OK=== ${SCOPE}`)
process.exit(failed ? 1 : 0)
