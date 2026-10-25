// npm run rea -- <command> [args…] — REA from the node's single copy, as it is (node steps 539-2, 594-3).
//
// The node keeps ONE copy of REA (npm `rea-agents`, version pinned by the core: lib/web4-items/rea-tool.cjs) in <node>/data/tools/rea;
// this element only calls it. Nothing is added to REA's answer and nothing is taken away: save what you need with REA's own options
// (`--detail summary --evidence_output study/<folder>/<name>.json`, or the complete JSON redirected into a file) and read it with
// `npm run rea -- inspect-analysis-view …` (the laws of the study pass: .claude/modes/build-study.md). No MCP server is registered.
// `REA_ENTRY` names another copy of REA's scripts/rea.mjs for a check of a newer version before the node installs it.
// Every child process: windowsHide and an environment without the labels of a Next server or the core (node law 280-6).
import { spawn } from 'node:child_process'
import { existsSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const NODE = resolve(ROOT, '..', '..', '..') // an element lives at <node>/WEB4-ITEMS/<kind>/<id>
const REA = process.env.REA_ENTRY || join(NODE, 'data', 'tools', 'rea', 'node_modules', 'rea-agents', 'scripts', 'rea.mjs')
const args = process.argv.slice(2)

if (!existsSync(REA)) {
  console.log('===REA_MISSING=== REA is not installed in the core of this node (data/tools/rea). The node installs it on the core\'s REA page (door POST /api/node/rea); then this command works.')
  process.exit(3)
}
if (!args.length) {
  console.log('usage: npm run rea -- <command> [args…]   (npm run rea -- --help lists the commands; the skill reverse-engineer-anything explains them)')
  process.exit(2)
}

const env = {}
for (const [k, v] of Object.entries(process.env)) if (v !== undefined && !/^(__NEXT|NEXT_|AGI_)/.test(k)) env[k] = v
const child = spawn(process.execPath, [REA, ...args], { cwd: process.cwd(), env, windowsHide: true, stdio: 'inherit' })
child.on('close', (code) => process.exit(code ?? 1))
