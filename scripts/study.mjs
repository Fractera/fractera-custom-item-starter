// npm run study -- rules <url> | accounts | login <site> [--lang ru] | browser start <url> [--site <site> [--visible] [--budget N]]
// | browser stop | browser status — the node's side of a study (node step 594-3).
//
// What REA does not do, the node does, once for all its elements: the site's rules (robots.txt and the terms to read), the test
// account the person confirms in the node's login window, and the study browser with its write guard (one browser for the node at a
// time). This command only calls those scripts of the core and tells the browser which element started it — so turning this element
// off stops it too. The laws of the study pass: .claude/modes/build-study.md.
import { spawnSync } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const NODE = resolve(ROOT, '..', '..', '..') // an element lives at <node>/WEB4-ITEMS/<kind>/<id>
const [command, ...rest] = process.argv.slice(2)
const usage = 'usage: npm run study -- rules <url> | accounts | login <site> [--lang ru] | browser start <url> [--site <site> [--visible] [--budget N]] | browser stop | browser status'

function run(script, args) {
  const file = join(NODE, 'scripts', script)
  if (!existsSync(file)) { console.log(`===STUDY_FAILED=== the core of this node has no ${script} (an older core: update the node)`); process.exit(3) }
  const env = {}
  for (const [k, v] of Object.entries(process.env)) if (v !== undefined && !/^(__NEXT|NEXT_|AGI_)/.test(k)) env[k] = v
  const r = spawnSync(process.execPath, [file, ...args], { cwd: NODE, env, stdio: 'inherit', windowsHide: true })
  process.exit(r.status ?? 1)
}

if (command === 'rules') run('site-rules.mjs', rest)
else if (command === 'accounts') run('study.mjs', ['list'])
else if (command === 'login') run('study.mjs', ['login', ...rest])
else if (command === 'browser') {
  const [action, ...more] = rest
  if (action === 'start') {
    let id = null
    try { id = JSON.parse(readFileSync(join(ROOT, 'OWN-SERVICE-PROPS', 'OWN-SERVICE-PROPS.json'), 'utf8')).id } catch { /* no passport */ }
    run('study-browser.mjs', ['start', ...more, ...(id ? ['--element', id] : [])])
  } else if (action === 'stop' || action === 'status') run('study-browser.mjs', [action])
  else { console.log(usage); process.exit(2) }
} else { console.log(usage); process.exit(2) }
