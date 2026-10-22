// npm run node -- elements — the whole node in one list, for the product quiz (node step 563-4).
//
// The quiz reads the node before it plans: what is already built here and by whom, so it never plans again what a neighbour does. One
// line per element: address · native/custom · on, or off and why · its role in the node · what it does. Turned-off elements are listed
// too (a built-in tool that the node turns on for a task — reverse engineering — is still the node's capability).
// 🔒 This list is for the quiz, which is rare and asked for by the person. On wake you never list the node: the list grows with every
// element and every wake would pay for it (owner of the node, 2026-10-20) — there `npm run a2a -- find` finds one neighbour.
import { coreGet } from './core-door.mjs'

const [command, ...rest] = process.argv.slice(2)
if (command !== 'elements') {
  console.log('usage: npm run node -- elements [--lang ru]')
  process.exit(2)
}
const lang = rest.includes('--lang') ? rest[rest.indexOf('--lang') + 1] : 'en'
const { status, body, error } = await coreGet(`/api/node/elements?lang=${lang === 'ru' ? 'ru' : 'en'}`)
if (status !== 200 || !Array.isArray(body?.elements)) {
  console.log(`===NODE_FAILED=== ${error ?? `the core answered ${status}`}`)
  process.exit(1)
}
for (const e of body.elements) {
  const power = e.on ? 'on' : `off: ${e.offReason ?? 'no reason given'}`
  console.log(`${e.address} · ${e.kind} · ${power} — ${e.role ?? 'no role yet'}${e.does ? ` | ${e.does}` : ''}`)
}
console.log(`===NODE_ELEMENTS=== ${body.elements.length}`)
