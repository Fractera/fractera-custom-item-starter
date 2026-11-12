// check-openai-calls — every call of this element to OpenAI reads a refusal through the node's ONE reader and writes one line of the
// element's ledger (node step 726-2, the custom template's pilot).
//
// Why: on 2026-11-11 the owner's node had twenty files calling api.openai.com directly, each reading OpenAI's error its own way; an
// empty prepaid balance (`credit_balance_exhausted`, HTTP 429) reached the person as «rate limit, wait», and nobody could say which
// element spent the key. The owner, verbatim: «я понятия не имею какие элементы или для каких целей используют апи. Блин согласись
// это прям офигенно узкое место?» The cure is the core's two files, carried here byte-identical: `lib/openai-error.cjs` (the reader,
// its list from OpenAI's own error-codes guide) and `lib/usage-ledger.cjs` (one line per paid call into `data/node/usage/`, which
// the core's «Все подписки» reads without this element's agent). This guard keeps a NEW direct call from bypassing them — the defect
// returns silently otherwise, because a direct call works perfectly until the day OpenAI refuses.
//
// Two rules (the guard is proven by breaking, `npm run test:openai-errors` does it):
//   1. a file that calls OpenAI — names `api.openai.com` or imports `@ai-sdk/openai` — loads the reader (`openai-error`) AND the
//      ledger (`usage-ledger`);
//   2. the reader names every code of OpenAI's guide — a code dropped from the list is a refusal read wrong again.
// The two files are the core's: edit them in the core, never here (the core's guard holds its own copies; a template release
// copies them again).
//
// `--root <dir>` checks another tree (the test runs it on a broken copy).

import { execFileSync } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { createRequire } from 'node:module'

const args = process.argv.slice(2)
const rootAt = args.indexOf('--root')
const ROOT = rootAt >= 0 ? args[rootAt + 1] : process.cwd()
const DIRS = ['lib', 'app', '_tools', 'scripts', 'components', 'services']
const READER = 'lib/openai-error.cjs'
const LEDGER = 'lib/usage-ledger.cjs'
// The codes OpenAI's guide names (https://developers.openai.com/api/docs/guides/error-codes, read 2026-11-12) and the reason each
// must read as — the same table as the core's guard.
const GUIDE = {
  credit_balance_exhausted: 'no-funds',
  insufficient_quota: 'no-funds',
  organization_spend_limit_exceeded: 'spend-limit',
  project_spend_limit_exceeded: 'spend-limit',
  organization_usage_limit_exceeded: 'usage-limit',
  slow_down: 'rate-limit',
  server_is_overloaded: 'overloaded',
}

const problems = []

// 1. Files that call OpenAI directly — tracked and new (an untracked file is exactly the one a fresh change adds).
let files = []
try {
  files = execFileSync('git', ['ls-files', '--cached', '--others', '--exclude-standard', '--', ...DIRS], { cwd: ROOT, encoding: 'utf8' })
    .split('\n').filter((f) => /\.(c|m)?(j|t)sx?$/.test(f))
} catch {
  problems.push('git ls-files failed — the guard cannot see the tree')
}
let callers = 0
for (const f of new Set(files)) {
  const full = join(ROOT, f)
  if (!existsSync(full) || f === READER || f === LEDGER || f === 'scripts/check-openai-calls.mjs' || f.startsWith('scripts/test-openai-errors')) continue
  const src = readFileSync(full, 'utf8')
  if (!src.includes('api.openai.com') && !/from ["']@ai-sdk\/openai["']/.test(src)) continue
  callers++
  if (!/openai-error(\.cjs)?['"]/.test(src)) problems.push(`${f}: calls OpenAI without the reader — import { readOpenAiResponse, readOpenAiException, logOpenAiError } from "@/lib/openai-error.cjs" (the AI SDK: readOpenAiSdkError)`)
  if (!/usage-ledger(\.cjs)?['"]/.test(src)) problems.push(`${f}: calls OpenAI without the ledger — import { recordOk, recordRefusal } from "@/lib/usage-ledger.cjs"; every paid call writes one line`)
}
for (const own of [READER, LEDGER]) if (!existsSync(join(ROOT, own))) problems.push(`${own} is missing — copy it from the core (lib/${own.split('/').pop()})`)

// 2. The guide's codes.
const reader = join(ROOT, READER)
if (existsSync(reader)) {
  const { readOpenAiError } = createRequire(import.meta.url)(reader)
  for (const [code, want] of Object.entries(GUIDE)) {
    const status = code === 'server_is_overloaded' ? 503 : 429
    const got = readOpenAiError(status, { error: { code, type: code === 'insufficient_quota' ? 'insufficient_quota' : 'x', message: 'm' } }).reason
    if (got !== want) problems.push(`the reader reads ${code} (HTTP ${status}) as «${got}», OpenAI's guide means «${want}»`)
  }
}

if (problems.length) {
  for (const p of problems) console.error(`  ✗ ${p}`)
  console.error(`===OPENAI_CALLS_FAILED=== ${problems.length}`)
  process.exit(1)
}
console.log(`===OPENAI_CALLS_OK=== ${callers} callers of OpenAI, every one through the reader and the ledger; ${Object.keys(GUIDE).length} codes of OpenAI's guide read right`)
