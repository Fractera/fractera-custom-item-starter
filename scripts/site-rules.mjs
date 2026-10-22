// npm run site-rules -- <https://site/path> — may this site be studied automatically? (node step 556-1)
//
// Before you ask the node for an analysis of someone else's site, ask its rules: the node reads the site's robots.txt and finds the
// link to its terms (the core door /api/node/site-rules, one logic with the main agent's command). The machine judges robots.txt only;
// the terms you read yourself. A site that forbids it is never analysed — the person gives a series of screenshots, or names similar
// sites whose rules allow it (owner of the node, 2026-10-22; skill product-clone).
// Exit code: 0 — robots.txt does not forbid · 2 — forbids · 3 — unknown (treat as forbidden) · 1 — no answer.
import { coreGet } from './core-door.mjs'

const target = process.argv[2]
if (!target) {
  console.log('usage: npm run site-rules -- <https://site/path>')
  process.exit(1)
}
const { status, body, error } = await coreGet(`/api/node/site-rules?url=${encodeURIComponent(target)}`)
if (!Array.isArray(body?.text)) {
  console.log(`===SITE_RULES_FAILED=== ${error ?? `the core answered ${status}`}`)
  process.exit(1)
}
for (const line of body.text) console.log(line)
const verdict = body.robots?.verdict
process.exit(!body.ok ? 1 : verdict === 'allowed' ? 0 : verdict === 'disallowed' ? 2 : 3)
