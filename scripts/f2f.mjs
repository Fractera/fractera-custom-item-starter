// npm run f2f -- find <plain words of the element you need> — f2f: look for a whole ready element in the Lagrix network
// (node step 548-9; skill use-f2f). Owner 2026-10-19: «агент поймёт что у него есть f2f и выполнит запрос в сеть lagrix (мы
// должны имитировать это действие максимально реалистично и максимально реалистично вернуть ответ в данный момент ничего не
// обнаружено)».
//
// The request is built the way a node will send it when the network is live (the Lagrix protocol documents): one price — $0.01
// USDC per result list, paid by a voucher to the super-node (document 17, §17.8); the request carries a country and an «adult»
// flag and nothing else personal (§17.8); the kind of service is a capability tag held by the super-nodes of that kind (§17.12);
// a whole element is described by its F2F technical card (document 20). The answer is what the network gives when no
// announcement matches: an empty list.
// 🛑 Honesty: the answer says `mode: "simulation"` — tell your person «в сети Lagrix подходящих элементов не найдено (поиск в
// сети пока имитируется)». No money moves, no voucher is signed. Every search is a line in SERVICE_DATA_DIR/f2f/searches.jsonl.
// The node's main agent has the same search (`npm run lagrix` in data/main-agent); this element does not import the core's code.
import { appendFileSync, existsSync, mkdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

const env = existsSync(join(process.cwd(), '.env.local'))
  ? Object.fromEntries(readFileSync(join(process.cwd(), '.env.local'), 'utf8').split(/\r?\n/).filter((l) => /^[A-Z0-9_]+=/.test(l)).map((l) => [l.slice(0, l.indexOf('=')), l.slice(l.indexOf('=') + 1).trim()]))
  : {}
const passport = (() => { try { return JSON.parse(readFileSync(join(process.cwd(), 'OWN-SERVICE-PROPS', 'OWN-SERVICE-PROPS.json'), 'utf8')) } catch { return {} } })()

const [cmd, ...rest] = process.argv.slice(2)
if (cmd !== 'find' || !rest.join(' ').trim()) {
  console.log('usage: npm run f2f -- find <plain words of the element you need>')
  process.exit(1)
}
if (passport.elementType === 'native') {
  console.log(JSON.stringify({ protocol: 'f2f', found: 0, say: 'f2f is not for a native element: it takes nothing from outside and gives nothing away.' }, null, 2))
  process.exit(0)
}

const query = rest.join(' ').replace(/\s+/g, ' ').trim().slice(0, 300)
const capability = query.toLowerCase().replace(/[^a-z0-9а-яё\s-]/gi, ' ').split(/\s+/).filter((w) => w.length > 2).slice(0, 6).join('-') || 'element'
const searchedAt = new Date().toISOString()
const answer = {
  network: 'lagrix',
  protocol: 'f2f',
  mode: 'simulation',
  note: 'The Lagrix network is not live yet: the request below is built the way a node will send it, and the answer is the one the network gives when no announcement matches.',
  request: {
    kind: 'element',
    capability,
    query,
    filters: { framework: passport.framework || 'next', template: 'fractera-custom-item-starter' },
    country: env.NODE_COUNTRY || 'not declared',
    adult: false,
    route: 'the super-nodes holding this kind of service (Lagrix document 17, section 17.12)',
    card: 'F2F technical card: template, framework, consumes, provides, env names, licence, source (Lagrix document 20)',
  },
  searchedAt,
  superNode: null,
  fee: { usdc: 0.01, per: 'result list', charged: false, why: 'simulation: no voucher was signed (Lagrix document 17, section 17.8)' },
  results: [],
  found: 0,
  say: 'Lagrix: no ready element matches (the network search is simulated for now).',
  next: 'build it: skill product-quiz (reverse engineering is under development), or — when the job is not your role — ask the core\'s main agent for a new element',
}
const dataDir = env.SERVICE_DATA_DIR
if (dataDir) {
  try {
    mkdirSync(join(dataDir, 'f2f'), { recursive: true })
    appendFileSync(join(dataDir, 'f2f', 'searches.jsonl'), JSON.stringify({ at: searchedAt, query, capability, found: 0, mode: 'simulation' }) + '\n', 'utf8')
  } catch { /* the log is not needed for the answer */ }
}
console.log(JSON.stringify(answer, null, 2))
