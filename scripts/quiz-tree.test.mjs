// Samples of the product quiz tree (core step 852, scripts/quiz-tree.mjs): exit code 1 on any miss. In the prebuild.
import assert from 'node:assert/strict'
import { checklist, counts, nextToAsk, treeProblems } from './quiz-tree.mjs'

let passed = 0
const t = (name, fn) => { try { fn(); passed += 1; console.log(`  ✓ ${name}`) } catch (e) { console.error(`  ✗ ${name}\n    ${e.message}`); process.exitCode = 1 } }
const node = (n, title, mark, children, a = mark === 'open' ? undefined : 'yes') => ({ n, title, mark, ...(a ? { a } : {}), ...(children ? { children } : {}) })

// Level 1 agreed (three modules), level 2 half done in breadth.
const good = { depth: 3, freedom: 75, version: { n: 1, date: '2026-11-25' }, tree: [
  node('1', 'Catalogue of elements', 'answered', [node('1.1', 'Who lists them', 'answered'), node('1.2', 'Search by meaning', 'agent')]),
  node('2', 'Buying an element', 'answered', [node('2.1', 'Price and currency', 'answered'), node('2.2', 'Refunds', 'open')]),
  node('3', 'Seller pages', 'answered', [node('3.1', 'Page layout', 'open')]),
] }

t('a tree walked in breadth is right; the next question is the first open node of the shallowest level', () => {
  assert.deepEqual(treeProblems(good), [])
  assert.equal(nextToAsk(good).node.n, '2.2')
  assert.deepEqual(counts(good)[2], { nodes: 5, answered: 2, agent: 1, open: 2 })
})

t('the checklist numbers every node with its mark and says depth, F, version and the counts', () => {
  const c = checklist(good, 'ru')
  assert.match(c, /^✓ 1 Catalogue of elements$/m)
  assert.match(c, /^  ◇ 1\.2 Search by meaning$/m)
  assert.match(c, /^  ○ 2\.2 Refunds$/m)
  assert.match(c, /глубина 3 · F 75% · версия 1 \(2026-11-25\)/)
})

t('NEGATIVE CONTROL — down one branch first: 1.1 answered while level 1 still has an open branch is refused', () => {
  const deep = { tree: [node('1', 'Catalogue', 'answered', [node('1.1', 'Who lists them', 'answered')]), node('2', 'Buying', 'open')] }
  assert.ok(treeProblems(deep).some((p) => /goes in breadth/.test(p)))
})

t('money, ownership, publication and secrets are never filled by the agent, at any freedom', () => {
  const q = { freedom: 100, tree: [node('1', 'Buying', 'answered', [node('1.1', 'Price per element', 'agent')])] }
  assert.ok(treeProblems(q).some((p) => /asked of the person at any freedom/.test(p)))
})

t('refused: wrong numbers, a level-1 branch filled by the agent, too deep, a bad depth or freedom, a mark without an answer', () => {
  const bad = { depth: 1, freedom: 120, tree: [node('2', 'Catalogue', 'agent', [node('1.1', 'Deep', 'answered')]), { n: '2', title: 'Buying', mark: 'answered' }] }
  const p = treeProblems(bad).join('\n')
  for (const re of [/numbered «2», its place says «1»/, /level-1 branch is the person's/, /deeper than the quiz's depth 1/, /freedom is a whole percent/, /without an answer/]) assert.match(p, re)
  assert.match(treeProblems({ depth: 6 }).join(), /depth is a whole number 1–5/)
})

t('a quiz without a tree (older quizzes) passes untouched', () => assert.deepEqual(treeProblems({ vision: { text: 'x' } }), []))

console.log(process.exitCode ? `===QUIZ_TREE_TEST_FAILED=== ${passed} passed` : `===QUIZ_TREE_TEST_OK=== ${passed} passed`)
