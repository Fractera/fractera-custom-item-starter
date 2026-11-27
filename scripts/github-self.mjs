// THIS ELEMENT SENDS ITS OWN FOLDER TO ITS GITHUB REPOSITORY (core step 861-6; lidt5 via Roma 2026-11-27: the push after a Telegram task
// waited for the main agent at the boundary and timed out). The core's door `/api/node/github-push` with this element's OWN key
// (SETTINGS_SECRET, sent as X-Node-Key): its own repository only. The node commits what is left uncommitted, as the «Push» button does.
//
//   npm run github:self      prints ===GITHUB_PUSH_OK=== or ===GITHUB_PUSH_FAILED=== <reason>
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { ROOT, env, coreUrl } from './core-door.mjs'

const fail = (msg) => { console.log(`===GITHUB_PUSH_FAILED=== ${msg}`); process.exit(1) }
const WORDS = {
  'not-connected': 'no GitHub repository or key yet — put a window (npm run ask-person) for the person to connect it on the node\'s GitHub page',
  'no-write': 'the key cannot write to the repository',
  'needs-workflow': 'the key lacks the workflow right (this element carries .github/workflows)',
  rejected: 'the repository has other history — ask the person',
  'auth-failed': 'GitHub refused the key',
  'commit-failed': 'the commit failed',
}
let id = null
try { id = JSON.parse(readFileSync(join(ROOT, 'OWN-SERVICE-PROPS', 'OWN-SERVICE-PROPS.json'), 'utf8')).id } catch { /* no passport */ }
if (!id) fail('this element has no id (OWN-SERVICE-PROPS/OWN-SERVICE-PROPS.json → id)')
const core = coreUrl()
const key = env.SETTINGS_SECRET?.trim()
if (!core) fail('the address of the core is unknown here (NODE_DOMAIN_FILE → logs/runtime.json)')
if (!key) fail('no key here (SETTINGS_SECRET in .env.local)')
try {
  const r = await fetch(`${core}/api/node/github-push`, {
    method: 'POST', headers: { 'content-type': 'application/json', 'x-node-key': key }, body: JSON.stringify({ id }), signal: AbortSignal.timeout(120000),
  })
  const j = await r.json().catch(() => null)
  if (!j?.ok) fail(WORDS[j?.error] ?? j?.reason ?? j?.error ?? `the core answered ${r.status}`)
  console.log(`===GITHUB_PUSH_OK=== ${id}${j.lastPush?.commit ? ` · ${String(j.lastPush.commit).slice(0, 7)}` : ''}`)
} catch (e) {
  fail(`the core did not answer: ${e instanceof Error ? e.message : e}`)
}
