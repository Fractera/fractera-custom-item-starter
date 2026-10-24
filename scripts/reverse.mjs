// npm run reverse -- list | get <task> — the reports of the node's reverse engineering element, for the product quiz (node step 563-4).
//
// The element `reverse` is off almost always: the node turns it on for one task and off right after (owner of the node, 2026-10-22).
// Its reports stay in the node, and the core gives them through its door GET /api/node/reverse-report with the node key.
// get <task> copies the report's form (report.json — the one form the quiz reads) to development-docs/product/reverse/<task>/report.json.
// The person's copy (report.md) stays in the node: the development documents are English-only, and the report may be in the task's
// language — the core's door gives it to the person.
// 590-2: the copy says what it is. The owner of the node, 2026-10-23: «я беспокоюсь о том что однажды агент программиста залезет в Риверс
// инжиниринг Report и будет его использовать как реальные существующие элементы проекта». The first field of every copy is `origin`: a
// product studied by reverse engineering — a source to learn from, never this element's code, pages, routes or data — with the rule
// «our architecture, never theirs» (scripts/our-architecture.mjs). `npm run check:product` refuses a copy without it.
import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { coreGet, ROOT } from './core-door.mjs'
import { OUR_ARCHITECTURE } from './our-architecture.mjs'

const [command, task] = process.argv.slice(2)
if (command === 'list') {
  const { status, body, error } = await coreGet('/api/node/reverse-report')
  if (status !== 200) { console.log(`===REVERSE_FAILED=== ${error ?? `the core answered ${status}`}`); process.exit(1) }
  for (const j of body.jobs ?? []) console.log(j)
  console.log(`===REVERSE_JOBS=== ${(body.jobs ?? []).length}`)
} else if (command === 'get' && /^[0-9a-z][0-9a-z-]{2,80}$/.test(task ?? '')) {
  const { status, body, error } = await coreGet(`/api/node/reverse-report?job=${task}`)
  if (status !== 200 || !body?.report) { console.log(`===REVERSE_FAILED=== ${error ?? `the core answered ${status}${body?.error ? ` (${body.error})` : ''}`}`); process.exit(1) }
  const dir = join(ROOT, 'development-docs', 'product', 'reverse', task)
  mkdirSync(dir, { recursive: true })
  const { origin: _theirs, ...report } = body.report
  const origin = {
    kind: 'external-study',
    task,
    product: body.report.target?.name || null,
    copiedAt: new Date().toISOString().slice(0, 10),
    note: 'A product studied by reverse engineering: a source to learn how it works. Nothing in this file exists in this element — its pages, routes, entities and fields are the other product\'s.',
    rule: OUR_ARCHITECTURE,
  }
  writeFileSync(join(dir, 'report.json'), JSON.stringify({ origin, ...report }, null, 2) + '\n')
  console.log(`===REVERSE_REPORT=== development-docs/product/reverse/${task}/report.json (origin: external-study) — ${body.report.summary ?? ''}`)
} else {
  console.log('usage: npm run reverse -- list | get <task>')
  process.exit(2)
}
