// THE VERSIONS OF THE PRODUCT QUIZ (core step 852-5; Roma 2026-11-24: «каждая утверждённая версия — тег git quiz-v<N>, откат — новая
// версия»). A version is a commit of `development-docs/product/quiz.json` tagged `quiz-v<N>`; nothing is ever moved or deleted, so going
// back to N is a NEW version whose tree equals N's. The Mini App («Квиз → Версии») and the core's quiz page read these tags.
//
//   npm run quiz:version                     the versions: N, date, the current one
//   npm run quiz:version -- approve          the person approved the quiz as it stands: version N+1 = commit + tag (push when a remote is)
//   npm run quiz:version -- restore <N>      the person asked to go back to N: a new version N' with N's tree, depth and freedom
//
// Pure helpers are exported for the test (scripts/quiz-version.test.mjs); the command runs git in this element's folder only.

import { execFileSync } from 'node:child_process'
import { readFileSync, realpathSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

export const QUIZ_FILE = 'development-docs/product/quiz.json'
const TAG = /^quiz-v(\d{1,4})$/

/** The version numbers among git tags, ascending. */
export function versionsOf(tags) {
  return tags.map((t) => TAG.exec(t.trim())?.[1]).filter(Boolean).map(Number).sort((a, b) => a - b)
}

/** The next number: one more than the highest tag (never reused, even after a restore). */
export const nextVersion = (tags) => (versionsOf(tags).at(-1) ?? 0) + 1

/** The quiz stamped as version n of date: the tree untouched, `restoredFrom` only when it came back from an older version. */
export function stamp(quiz, n, date, restoredFrom = null) {
  return { ...quiz, version: { n, date, ...(restoredFrom ? { restoredFrom } : {}) } }
}

/** What a restore keeps of the old version: its tree, depth, freedom and title — the version stamp is new. */
export function restored(old, n, date, from) {
  const { version: _v, ...rest } = old
  return stamp(rest, n, date, from)
}

// realpath on both sides: a folder reached through a link (macOS /var → /private/var) is still this script.
const isMain = (() => { try { return realpathSync(fileURLToPath(import.meta.url)) === realpathSync(process.argv[1] ?? '') } catch { return false } })()
if (isMain) {
  const root = join(dirname(fileURLToPath(import.meta.url)), '..')
  const git = (...args) => execFileSync('git', ['-c', `safe.directory=${root}`, '-C', root, ...args], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim()
  const tags = () => git('tag', '--list', 'quiz-v*').split('\n').filter(Boolean)
  const file = join(root, QUIZ_FILE)
  const read = () => { try { return JSON.parse(readFileSync(file, 'utf8')) } catch { return null } }
  const today = new Date().toISOString().slice(0, 10)
  const [cmd, arg] = process.argv.slice(2)
  const commitAndTag = (quiz, n, message) => {
    writeFileSync(file, JSON.stringify(quiz, null, 2) + '\n')
    git('add', QUIZ_FILE)
    git('commit', '-m', message, '--', QUIZ_FILE)
    git('tag', '-a', `quiz-v${n}`, '-m', message)
    let pushed = 'no remote — kept on the node'
    try { if (git('remote')) { git('push', 'origin', 'HEAD', `quiz-v${n}`); pushed = 'pushed' } } catch (e) { pushed = `push failed: ${String(e.stderr ?? e.message).split('\n')[0]}` }
    console.log(`===QUIZ_VERSION_OK=== quiz-v${n} · ${git('rev-parse', '--short', 'HEAD')} · ${pushed}`)
  }
  if (!cmd || cmd === 'list') {
    const cur = read()?.version?.n ?? null
    const list = versionsOf(tags())
    console.log(list.length ? list.map((n) => `quiz-v${n}${n === cur ? '  ← current' : ''}`).join('\n') : '===QUIZ_VERSION=== no approved version yet')
    process.exit(0)
  }
  const quiz = read()
  if (!quiz) { console.log(`===QUIZ_VERSION_FAILED=== no ${QUIZ_FILE}`); process.exit(1) }
  if (cmd === 'approve') {
    const { treeProblems } = await import('./quiz-tree.mjs')
    const p = treeProblems(quiz)
    if (p.length) { console.log(`===QUIZ_VERSION_FAILED=== the tree has ${p.length} problem(s) — npm run quiz:tree shows them; fix before approving`); process.exit(1) }
    const n = nextVersion(tags())
    commitAndTag(stamp(quiz, n, today), n, `Product quiz: version ${n} approved by the person`)
    process.exit(0)
  }
  if (cmd === 'restore') {
    const from = Number(arg)
    if (!Number.isInteger(from) || !versionsOf(tags()).includes(from)) { console.log(`===QUIZ_VERSION_FAILED=== no version «${arg ?? ''}» — npm run quiz:version lists them`); process.exit(1) }
    const old = JSON.parse(git('show', `quiz-v${from}:${QUIZ_FILE}`))
    const n = nextVersion(tags())
    commitAndTag(restored(old, n, today, from), n, `Product quiz: version ${n} = version ${from}, restored at the person's word`)
    process.exit(0)
  }
  console.log('===QUIZ_VERSION_FAILED=== unknown command — list · approve · restore <N>')
  process.exit(1)
}
