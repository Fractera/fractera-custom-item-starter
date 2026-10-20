// ASK THE CORE (node step 548-18) AND ANSWER IT (548-20).
//   npm run ask-core -- "<one question in English>"
//   npm run reply-core -- "<the result of a task the core's main agent gave you, a few lines>"
//
// The owner of the node, 2026-10-20: «одним из аналогов должен быть навык спросить ядро … i2i должен всегда оставаться резервным
// источником данных в случае крайней необходимости именно ядро может рассказать о архитектуре глубже». The question wakes the
// core's main agent (service `build`) through the core's door POST /api/agents/wake with the node key; it answers from the core's
// instruction with `npm run task -- <this element> "Answer from the core to «<question>»: …"`, and the answer comes into this
// agent's input. The way back (548-20, the owner: the core's agent asks an element to check something and gives the answer itself):
// `--reply` wakes the main agent with the result, and it tells the architect.
// If the main agent has a Telegram bot, the node first asks the person whether to turn it on — a question costs their subscription.
// 🔒 The core is reached on the machine's loopback, its port asked from the node (NODE_DOMAIN_FILE → logs/runtime.json), never
// remembered: the public address of the core asks for a sign-in.
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'

const root = process.cwd()
const fail = (msg) => { console.error(`===ASK_CORE_FAILED=== ${msg}`); process.exit(1) }

function envFile() {
  const out = {}
  try {
    for (const line of readFileSync(join(root, '.env.local'), 'utf8').split(/\r?\n/)) {
      const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/)
      if (m) out[m[1]] = m[2].trim()
    }
  } catch { /* no file — the process environment only */ }
  return out
}
const env = { ...envFile(), ...process.env }

function ownId() {
  try {
    const id = JSON.parse(readFileSync(join(root, 'OWN-SERVICE-PROPS', 'OWN-SERVICE-PROPS.json'), 'utf8')).id
    if (typeof id === 'string' && id) return id
  } catch { /* no passport */ }
  return env.ITEM_ID?.trim() || null
}

function coreUrl() {
  const domainFile = env.NODE_DOMAIN_FILE?.trim()
  if (domainFile) {
    try {
      // The host the core listens on (runtime.json → hostname): `localhost` of the core can be IPv6, where 127.0.0.1 gets no answer.
      const rt = JSON.parse(readFileSync(join(dirname(dirname(domainFile)), 'logs', 'runtime.json'), 'utf8'))
      if (Number.isInteger(rt.port)) return `http://${typeof rt.hostname === 'string' && rt.hostname ? rt.hostname : 'localhost'}:${rt.port}`
    } catch { /* the node did not say its port */ }
  }
  const a = env.ARCHITECT_URL?.trim()
  return a && /^http:\/\/(127\.0\.0\.1|localhost)(:\d+)?\/?$/.test(a) ? a.replace(/\/+$/, '') : null
}

const reply = process.argv.includes('--reply')
const words = process.argv.slice(2).filter((a) => a !== '--reply').join(' ').replace(/\s+/g, ' ').trim()
const limit = reply ? 1500 : 600
if (words.length < 10) fail(reply ? 'reply-core -- "<the result of the task, a few lines>"' : 'ask-core -- "<one question in English, with the words of the area>"')
if (words.length > limit) fail(`at most ${limit} characters (now ${words.length})`)
const id = ownId()
const core = coreUrl()
const key = env.SETTINGS_SECRET?.trim()
if (!id) fail('this element has no id (OWN-SERVICE-PROPS/OWN-SERVICE-PROPS.json → id)')
if (!core) fail('the address of the core is unknown here (NODE_DOMAIN_FILE → logs/runtime.json)')
if (!key) fail('no node key here (SETTINGS_SECRET in .env.local)')

// The answer carries its question (548-20): it may come into a fresh session that never asked.
const text = reply
  ? `Element ${id} reports on your task: «${words}». Pass it to the architect in their language in a few lines — Telegram if you have a bot (npm run person), otherwise this terminal (skill ask-element). Do not build anything.`
  : `Element ${id} asks about the node's architecture: «${words}». Answer from the core's instruction (skill answer-element) in at most 10 lines with: npm run task -- ${id} "Answer from the core to «${words}»: …". Do not build anything; if the core's instruction does not say, answer that the core does not know it and that the architect decides.`
try {
  const r = await fetch(`${core}/api/agents/wake`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-node-key': key },
    body: JSON.stringify({ service: 'build', from: id, about: words.slice(0, 300), reason: reply ? 'element-report' : 'element-question', text }),
    signal: AbortSignal.timeout(30000),
  })
  const b = await r.json().catch(() => ({}))
  if (!b.ok) fail(`the core answered ${r.status}: ${b.reason ?? 'no reason'}`)
  const how = b.pending ? 'the person is asked in Telegram to turn the main agent on' : b.already ? 'pasted into the main agent\'s live session' : 'the main agent woke'
  if (reply) {
    console.log(`===REPLY_CORE_OK=== ${how}; it tells the architect your result`)
  } else {
    console.log(`===ASK_CORE_OK=== ${how} with your question`)
    console.log('The answer comes into your input as «Answer from the core to «…»: …». Do not guess meanwhile and do not read the core\'s files.')
  }
} catch (e) {
  fail(`the core did not answer at ${core} — ${e instanceof Error ? e.message : e}`)
}
