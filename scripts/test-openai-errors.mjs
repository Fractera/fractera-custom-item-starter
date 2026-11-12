// test-openai-errors — the node's one reader of OpenAI's errors and this element's ledger, against a FAKE OpenAI over real HTTP
// (node step 726-2, the custom template's pilot; the same cases as the core's own test).
//
//   npm run test:openai-errors
//
// Plane: the module on the wire. A loopback server answers each refusal OpenAI's error-codes guide names
// (https://developers.openai.com/api/docs/guides/error-codes, read 2026-11-12) with its status and body; `readOpenAiResponse` must
// name the reason and OpenAI's page to act on. The ledger: a 200 with usage writes one line with its tokens, a refusal keeps OpenAI's
// own code, a prompt or a key handed to it is dropped.
//
// Negative controls, all must stay red:
//   • the OLD reading of this template's translate door (before 726-2, verbatim below) reads `credit_balance_exhausted` as a rate
//     limit — the very defect the owner saw on 2026-11-11;
//   • the guard `check:openai-calls` on a tree with a direct call that bypasses the reader or the ledger.

import { createServer } from 'node:http'
import { createRequire } from 'node:module'
import { execFileSync } from 'node:child_process'
import { cpSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const require = createRequire(import.meta.url)
const { readOpenAiResponse, readOpenAiException } = require('../lib/openai-error.cjs')
const { recordOk, recordRefusal, record, readDay, days } = require('../lib/usage-ledger.cjs')

const err = (code, type, message) => ({ error: { message, type, param: null, code } })
// [title in the guide, status, body, the reason it must read as, a fragment of the link]
const CASES = [
  ['401 Incorrect API key provided', 401, err('invalid_api_key', 'invalid_request_error', 'Incorrect API key provided: sk-proj-abcd****wxyz.'), 'bad-key', 'api-keys'],
  ['401 Invalid Authentication', 401, err(null, 'invalid_request_error', 'Invalid authentication'), 'bad-key', 'api-keys'],
  ['401 IP not authorized', 401, err(null, 'invalid_request_error', 'IP not authorized for this project'), 'ip-blocked', 'ip-allowlist'],
  ['403 Country, region, or territory not supported', 403, err('unsupported_country_region_territory', 'request_forbidden', 'Country, region, or territory not supported'), 'region', 'supported-countries'],
  ['403 other permission', 403, err(null, 'invalid_request_error', 'You have insufficient permissions for this operation.'), 'forbidden', 'api-keys'],
  ['429 Credit balance exhausted', 429, err('credit_balance_exhausted', 'insufficient_quota', 'You have no credits remaining. org-AbC123xyz'), 'no-funds', 'billing'],
  ['429 insufficient_quota (older code)', 429, err('insufficient_quota', 'insufficient_quota', 'You exceeded your current quota'), 'no-funds', 'billing'],
  ['429 Rate limit reached for requests', 429, err('rate_limit_exceeded', 'requests', 'Rate limit reached for gpt-5-mini in organization org-Zz9 on requests per min'), 'rate-limit', 'rate-limits'],
  ['429 Slow down', 429, err('slow_down', 'rate_limit_error', 'Your request rate increased too quickly'), 'rate-limit', 'rate-limits'],
  ['429 Organization spend limit reached', 429, err('organization_spend_limit_exceeded', 'insufficient_quota', 'spend limit'), 'spend-limit', 'organization/limits'],
  ['429 Project spend limit reached', 429, err('project_spend_limit_exceeded', 'insufficient_quota', 'project spend limit'), 'spend-limit', 'platform.openai.com/settings/'],
  ['429 Organization usage limit reached', 429, err('organization_usage_limit_exceeded', 'insufficient_quota', 'usage limit'), 'usage-limit', 'organization/limits'],
  ['500 The server had an error', 500, err(null, 'server_error', 'The server had an error while processing your request'), 'server', 'status.openai.com'],
  ['503 Model temporarily overloaded', 503, err('server_is_overloaded', 'service_unavailable_error', 'overloaded'), 'overloaded', 'status.openai.com'],
  ['404 NotFoundError (by status)', 404, err('model_not_found', 'invalid_request_error', 'The model `gpt-9` does not exist'), 'not-found', null],
  ['400 BadRequestError (by status)', 400, err(null, 'invalid_request_error', "Invalid 'messages'"), 'bad-request', null],
  ['502 with a body that is not JSON', 502, '<html>bad gateway</html>', 'server', 'status.openai.com'],
]

// The OLD reading, verbatim from app/api/i18n/translate/route.ts of this template before 726-2 — the negative control.
function oldReading(status, code) {
  if (status === 401) return 'bad-key'
  if (code === 'insufficient_quota') return 'no-funds'
  if (status === 429) return 'rate-limit'
  return 'upstream'
}

let failed = 0
const say = (ok, line) => { if (!ok) failed++; console.log(`${ok ? '  ✓' : '  ✗'} ${line}`) }

let current = null
const server = createServer((req, res) => {
  if (req.url === '/hang') return // never answers: the timeout case
  if (req.url === '/ok') { res.writeHead(200, { 'content-type': 'application/json' }); return res.end(JSON.stringify({ choices: [{ message: { content: '{}' } }], usage: { prompt_tokens: 12, completion_tokens: 5, total_tokens: 17 } })) }
  const [, status, body] = current
  res.writeHead(status, { 'content-type': typeof body === 'string' ? 'text/html' : 'application/json' })
  res.end(typeof body === 'string' ? body : JSON.stringify(body))
})
// A port of the node's own range, never 3000 or 49152+; the first free one from the top of the range.
let port = 0
for (const p of [25679, 25678, 25677, 25676, 25675]) {
  try { await new Promise((ok, no) => { server.once('error', no); server.listen(p, '127.0.0.1', ok) }); port = p; break } catch { /* busy */ }
}
if (!port) { console.error('no free port in 25675–25679'); process.exit(1) }
const base = `http://127.0.0.1:${port}`

console.log(`fake OpenAI on ${base} — every refusal of the guide:`)
for (const c of CASES) {
  current = c
  const res = await fetch(`${base}/v1/chat/completions`, { method: 'POST' })
  const info = await readOpenAiResponse(res)
  const linkOk = c[4] === null ? info.link === null : String(info.link).includes(c[4])
  say(info.reason === c[3] && linkOk, `${c[0]} → ${info.reason} · ${info.link ?? 'no link'}`)
}
{
  const c = CASES.find((x) => x[2]?.error?.code === 'credit_balance_exhausted')
  const old = oldReading(c[1], c[2].error.code)
  say(old === 'rate-limit', `negative control: the old reading of this door takes credit_balance_exhausted for «${old}» — the defect the reader cures`)
}

console.log('the ledger:')
const ledgerRoot = mkdtempSync(join(tmpdir(), 'usage-ledger-'))
{
  const call = { who: 'i18n/translate', endpoint: 'chat/completions', model: 'gpt-5-mini', started: Date.now() }
  const ok = await fetch(`${base}/ok`, { method: 'POST' })
  recordOk({ ...call, status: ok.status, usage: (await ok.json()).usage }, ledgerRoot)
  current = CASES.find((c) => c[2]?.error?.code === 'credit_balance_exhausted')
  const no = await fetch(`${base}/v1/chat/completions`, { method: 'POST' })
  recordRefusal({ ...call, info: await readOpenAiResponse(no) }, ledgerRoot)
  record({ who: 'test/leak', provider: 'openai', prompt: 'the person said something private', key: 'sk-live-123', ok: true }, ledgerRoot)
  const lines = readDay(undefined, ledgerRoot)
  say(lines.length === 3, `three calls → three lines in data/node/usage/${days(ledgerRoot)[0]}.jsonl`)
  say(lines[0].ok === true && lines[0].tokensIn === 12 && lines[0].tokensOut === 5, `a 200 with usage → ok, 12 in / 5 out tokens: ${JSON.stringify(lines[0])}`)
  say(lines[1].ok === false && lines[1].reason === 'no-funds' && lines[1].code === 'credit_balance_exhausted' && lines[1].status === 429, `a refusal → OpenAI's own code kept: ${JSON.stringify(lines[1])}`)
  say(!('prompt' in lines[2]) && !('key' in lines[2]) && !JSON.stringify(lines).includes('private'), 'a prompt and a key handed to the ledger are dropped')
}
rmSync(ledgerRoot, { recursive: true, force: true })

try { await fetch(`${base}/hang`, { signal: AbortSignal.timeout(300) }); say(false, 'the hanging call did not time out') } catch (e) {
  const info = readOpenAiException(e); say(info.reason === 'timeout', `a call OpenAI never answers → ${info.reason}`)
}
server.close()

console.log('the guard, by breaking:')
const tree = mkdtempSync(join(tmpdir(), 'openai-guard-'))
try {
  mkdirSync(join(tree, 'lib'), { recursive: true })
  mkdirSync(join(tree, 'app/api/x'), { recursive: true })
  cpSync('lib/openai-error.cjs', join(tree, 'lib/openai-error.cjs'))
  cpSync('lib/usage-ledger.cjs', join(tree, 'lib/usage-ledger.cjs'))
  execFileSync('git', ['init', '-q'], { cwd: tree })
  const guard = (label, src, wantRed) => {
    writeFileSync(join(tree, 'app/api/x/route.ts'), src)
    let red = false
    try { execFileSync('node', [join(process.cwd(), 'scripts/check-openai-calls.mjs'), '--root', tree], { stdio: 'pipe' }) } catch { red = true }
    say(red === wantRed, `${label} → ${red ? 'red' : 'green'}`)
  }
  guard('a direct call with neither the reader nor the ledger', 'await fetch("https://api.openai.com/v1/chat/completions")\n', true)
  guard('a direct call with the reader but no ledger', 'import { readOpenAiResponse } from "@/lib/openai-error.cjs"\nawait fetch("https://api.openai.com/v1/x")\n', true)
  guard('an AI SDK call with neither', 'import { createOpenAI } from "@ai-sdk/openai"\n', true)
  guard('a call through both', 'import { readOpenAiResponse } from "@/lib/openai-error.cjs"\nimport { recordOk } from "@/lib/usage-ledger.cjs"\nawait fetch("https://api.openai.com/v1/x")\n', false)
} finally {
  rmSync(tree, { recursive: true, force: true })
}

if (failed) { console.error(`===OPENAI_ERRORS_FAILED=== ${failed}`); process.exit(1) }
console.log('===OPENAI_ERRORS_OK===')
