// The versions of the product quiz (core step 852-5): approve makes quiz-v1, quiz-v2; restore 1 makes quiz-v3 whose tree equals v1's;
// negatives — a missing version and a broken tree are refused, no tag is made. Runs in a throwaway git repository, never in this folder.
import { execFileSync } from 'node:child_process'
import { copyFileSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { nextVersion, restored, versionsOf } from './quiz-version.mjs'

const here = dirname(fileURLToPath(import.meta.url))
let failed = 0
const ok = (cond, name) => { console.log(`${cond ? 'ok  ' : 'FAIL'} ${name}`); if (!cond) failed += 1 }

ok(versionsOf(['quiz-v2', 'v0.3.1', 'quiz-v10', 'quiz-vx']).join() === '2,10', 'only quiz-v<N> tags count, in order')
ok(nextVersion([]) === 1 && nextVersion(['quiz-v1', 'quiz-v3']) === 4, 'the next number is one past the highest')
ok(restored({ tree: [1], version: { n: 1 } }, 3, 'd', 1).version.restoredFrom === 1, 'a restore names where it came from')

const dir = mkdtempSync(join(tmpdir(), 'quiz-version-'))
try {
  mkdirSync(join(dir, 'scripts')); mkdirSync(join(dir, 'development-docs', 'product'), { recursive: true })
  for (const f of ['quiz-version.mjs', 'quiz-tree.mjs']) copyFileSync(join(here, f), join(dir, 'scripts', f))
  const g = (...a) => execFileSync('git', ['-C', dir, ...a], { encoding: 'utf8' }).trim()
  g('init', '-q'); g('config', 'user.email', 'test@example.invalid'); g('config', 'user.name', 'test')
  const file = join(dir, 'development-docs', 'product', 'quiz.json')
  const write = (q) => writeFileSync(file, JSON.stringify(q, null, 2) + '\n')
  const run = (...a) => { try { return execFileSync('node', [join(dir, 'scripts', 'quiz-version.mjs'), ...a], { encoding: 'utf8' }) } catch (e) { return String(e.stdout) } }
  const v1tree = [{ n: '1', title: 'Catalog', q: 'What is sold?', a: 'Ceramics', mark: 'answered' }]
  write({ depth: 3, freedom: 75, tree: v1tree }); g('add', '-A'); g('commit', '-qm', 'start')
  ok(/QUIZ_VERSION_OK=== quiz-v1/.test(run('approve')), 'approve → quiz-v1')
  write({ ...JSON.parse(readFileSync(file, 'utf8')), freedom: 50, tree: [...v1tree, { n: '2', title: 'Payments', q: 'How do they pay?', a: 'Card', mark: 'answered' }] })
  ok(/QUIZ_VERSION_OK=== quiz-v2/.test(run('approve')), 'approve again → quiz-v2')
  ok(/QUIZ_VERSION_OK=== quiz-v3/.test(run('restore', '1')), 'restore 1 → quiz-v3')
  const v3 = JSON.parse(g('show', `quiz-v3:development-docs/product/quiz.json`))
  ok(JSON.stringify(v3.tree) === JSON.stringify(v1tree) && v3.freedom === 75 && v3.version.n === 3 && v3.version.restoredFrom === 1, 'v3 equals v1 (tree, freedom), stamped 3, from 1')
  ok(/QUIZ_VERSION_FAILED=== no version «9»/.test(run('restore', '9')), 'negative: a version that does not exist is refused')
  write({ depth: 1, tree: [{ n: '1', title: 'A', mark: 'answered', a: 'x', children: [{ n: '1.1', title: 'B', mark: 'open' }] }] })
  ok(/QUIZ_VERSION_FAILED=== the tree has/.test(run('approve')), 'negative: a broken tree is not approved')
  ok(versionsOf(g('tag').split('\n')).join() === '1,2,3', 'no tag was made by the refusals')
} finally { rmSync(dir, { recursive: true, force: true }) }

if (failed) { console.log(`===TEST_QUIZ_VERSION_FAILED=== ${failed}`); process.exit(1) }
console.log('===TEST_QUIZ_VERSION_OK===')
