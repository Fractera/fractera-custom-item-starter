// npm run graph -- query "<question>" --ll "<entity words>" [--hl "<link words>"] [--task <study id>] — what the node's knowledge graph
// holds beyond a report (node step 590-2).
//
// The owner of the node, 2026-10-23: «отчёт это что-то вроде sammarry и под капотом могут оставаться дополнительные информационные
// сущности для которых может и должен дотянуться продуктовый квиз а при необходимости и агент разработки». The graph element keeps the
// entities, their fields and the links of every study; this command asks it on the machine's loopback with the node key.
// Everything a study brought is marked `origin: external-study` by the graph itself (graph element, node step 590-1): another product, a
// source to learn from — never this element's code, pages, routes or data. The graph's notice is printed first, every time.
// No language model runs: the graph needs your keywords — English words, like its entities. --ll finds entities, --hl finds links.
// The search is by meaning, so it always returns the closest items, even when nothing really fits (measured 2026-10-25: «zzzz» found
// «TinyLaunch Comment») — read what came back before you rely on it. --task keeps only what that study brought (a filter of the
// answer, not a protection); an empty answer means nothing of that study is close.
import { coreGet, env } from './core-door.mjs'

const args = process.argv.slice(2)
const [command, question] = args
const flag = (name) => {
  const i = args.indexOf(`--${name}`)
  return i >= 0 ? (args[i + 1] ?? '') : null
}
const words = (s) => (s ?? '').split(',').map((w) => w.trim()).filter(Boolean)
const EXTERNAL = /external-study:([A-Za-z0-9._-]+)/
const short = (s, n) => {
  const t = String(s ?? '').replace(/\s+/g, ' ').trim()
  return t.length > n ? `${t.slice(0, n - 1)}…` : t
}

if (command !== 'query' || !question || question.startsWith('--')) {
  console.log('usage: npm run graph -- query "<question>" --ll "<entity words, comma>" [--hl "<link words>"] [--task <study id>]')
  process.exit(2)
}
const ll = words(flag('ll'))
const hl = words(flag('hl'))
const task = flag('task')
if (!ll.length && !hl.length) {
  console.log('===GRAPH_FAILED=== give --ll and/or --hl: the graph runs no language model and needs your keywords, in English')
  process.exit(2)
}

// The graph's address: the node's registry, never a number in code (README of the graph element).
const reg = await coreGet('/api/node/a2a?address=graph')
const base = reg.status === 200 && typeof reg.body?.entry?.url === 'string' ? reg.body.entry.url.replace(/\/+$/, '') : null
if (!base) {
  console.log(`===GRAPH_FAILED=== the graph element is not in the node's registry here (${reg.error ?? `the core answered ${reg.status}`})`)
  process.exit(1)
}
let res
try {
  res = await fetch(`${base}/api/graph-query`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'X-Node-Key': env.SETTINGS_SECRET?.trim() ?? '' },
    body: JSON.stringify({ query: question, mode: ll.length && hl.length ? 'hybrid' : ll.length ? 'local' : 'global', ll_keywords: ll, hl_keywords: hl }),
    signal: AbortSignal.timeout(180000),
  })
} catch (e) {
  console.log(`===GRAPH_FAILED=== the graph did not answer: ${e instanceof Error ? e.message : e}`)
  process.exit(1)
}
const body = await res.json().catch(() => ({}))
if (res.status !== 200) {
  console.log(`===GRAPH_FAILED=== the graph answered ${res.status}: ${body.reason ?? body.error ?? ''}`)
  process.exit(1)
}

const mine = (item) => !task || (EXTERNAL.exec(String(item.file_path ?? ''))?.[1] === task)
const entities = (body.entities ?? []).filter(mine)
const links = (body.relationships ?? []).filter(mine)
if (!body.found || (!entities.length && !links.length)) {
  console.log(`===GRAPH=== nothing in the graph for «${short(question, 80)}»${task ? ` from the study ${task}` : ''}`)
  process.exit(0)
}
const label = (item) => {
  const study = EXTERNAL.exec(String(item.file_path ?? ''))?.[1]
  return item.origin === 'external-study' || study ? `[external-study ${study ?? '?'}]` : '[node]'
}
const studies = [...new Set([...entities, ...links].map((i) => EXTERNAL.exec(String(i.file_path ?? ''))?.[1]).filter(Boolean))]
console.log(`===GRAPH=== ${entities.length} entities, ${links.length} links${studies.length ? ` (external-study: ${studies.join(', ')})` : ''}`)
if (body.notice) console.log(`⚠ ${body.notice}`)
for (const e of entities.slice(0, 8)) console.log(`${label(e)} ${e.entity_name} (${e.entity_type ?? '?'}): ${short(e.description, 220)}`)
if (entities.length > 8) console.log(`… ${entities.length - 8} more entities — narrow --ll`)
for (const r of links.slice(0, 5)) console.log(`${label(r)} ${r.src_id} — ${r.tgt_id}: ${short(r.description, 160)}`)
if (links.length > 5) console.log(`… ${links.length - 5} more links — narrow --hl`)
