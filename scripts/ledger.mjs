// npm run ledger -- <study folder> [--bundle <file in that folder>] — REA's ledger of obligations for one study (node step 594-4).
//
// The owner of the node, 2026-10-25, about REA's reconstruction obligation ledger: «here is super important part»; and «Оставить пункты
// квиза» — the quiz keeps its items, the ledger stands beside them as the check (scripts/check-product.mjs reconciles the two).
// This command only feeds REA what it asks for and saves what it answers — the ledger is REA's judgment, never ours:
//   study/<folder>/bundle*.json   — the canonical bundle the study pass exported (`export_evidence_bundle`; the newest one by default);
//   study/<folder>/obligations.json — the reviewed obligations, REA's own shape (skill product-quiz, «Obligations»);
//   study/<folder>/manifest.json  — optional: who in our code owns an obligation (bindings) and known contradictions.
// → study/<folder>/ledger.json, REA's output as it is, and a few lines here: the status, the counts, each obligation and why it is open.
import { spawnSync } from 'node:child_process'
import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const NODE = resolve(ROOT, '..', '..', '..') // an element lives at <node>/WEB4-ITEMS/<kind>/<id>
const REA = process.env.REA_ENTRY || join(NODE, 'data', 'tools', 'rea', 'node_modules', 'rea-agents', 'scripts', 'rea.mjs')
const args = process.argv.slice(2)
const named = args.includes('--bundle') ? args[args.indexOf('--bundle') + 1] : null
const folder = args.find((a) => !a.startsWith('--') && a !== named)
const say = (m) => console.log(m)
const fail = (code, m) => { say(`===LEDGER_FAILED=== ${m}`); process.exit(code) }

if (!folder || !/^[0-9A-Za-z][0-9A-Za-z._-]*$/.test(folder)) fail(2, 'usage: npm run ledger -- <study folder> [--bundle <file>]')
const DIR = join(ROOT, 'study', folder)
if (!existsSync(DIR)) fail(2, `no study folder study/${folder}`)
if (!existsSync(REA)) fail(3, 'REA is not installed in the core of this node (data/tools/rea)')
const read = (file) => { try { return JSON.parse(readFileSync(join(DIR, file), 'utf8')) } catch (e) { fail(2, `study/${folder}/${file}: ${e instanceof Error ? e.message : e}`) } }

const bundles = readdirSync(DIR).filter((f) => /^bundle.*\.json$/.test(f)).sort((a, b) => statSync(join(DIR, b)).mtimeMs - statSync(join(DIR, a)).mtimeMs)
const bundleFile = named ?? bundles[0]
if (!bundleFile || !existsSync(join(DIR, bundleFile))) fail(2, `no bundle in study/${folder}: export it in the study pass (export_evidence_bundle → study/${folder}/bundle.json)`)
if (!existsSync(join(DIR, 'obligations.json'))) fail(2, `no study/${folder}/obligations.json — the reviewed obligations (skill product-quiz, «Obligations»)`)
const obligations = read('obligations.json')
const reviewed = Array.isArray(obligations) ? obligations : obligations?.reviewed_obligations
if (!Array.isArray(reviewed)) fail(2, `study/${folder}/obligations.json is a list of REA's reviewed obligations`)
const manifest = existsSync(join(DIR, 'manifest.json')) ? read('manifest.json') : { bindings: [], contradictions: [] }

const request = join(DIR, '.ledger-request.json')
writeFileSync(request, JSON.stringify({ evidence_bundle: read(bundleFile), reviewed_obligations: reviewed, manifest }))
const env = {}
for (const [k, v] of Object.entries(process.env)) if (v !== undefined && !/^(__NEXT|NEXT_|AGI_)/.test(k)) env[k] = v
const r = spawnSync(process.execPath, [REA, 'build-reconstruction-obligation-ledger', request, '--json'], { cwd: ROOT, env, encoding: 'utf8', maxBuffer: 512 * 1024 * 1024, windowsHide: true })
writeFileSync(join(DIR, 'ledger.json'), r.stdout ?? '')
let out = null
try { out = JSON.parse(r.stdout) } catch { /* below */ }
if (r.status !== 0 || !out || out.error) fail(1, `REA refused (${r.status}): ${out?.code ?? ''} ${out?.message ?? (r.stderr || r.stdout || '').slice(0, 400)}`)
const n = out.normalized_result ?? out
say(`ledger ${n.ledger_id} · status ${n.status} · obligations ${n.summary?.total} · required open ${n.summary?.required_open} · bundle ${bundleFile}`)
for (const o of n.obligations ?? []) say(`  ${o.obligation_id} v${o.obligation_version} — ${o.status}${(o.diagnostics ?? []).length ? `: ${(o.diagnostics ?? []).map((d) => d.code).join(', ')}` : ''}`)
say(`===LEDGER_OK=== study/${folder}/ledger.json`)
