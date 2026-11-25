// THE PRODUCT QUIZ AS A TREE, WALKED IN BREADTH (core step 852; Roma 2026-11-24, the quiz of the marketplace «went deep into one branch
// and asked about everything»: pre-steps/2026-11-24-product-quiz.md of the core).
//
// `quiz.json` → `tree`: [{ n: "1", title: "<2–4 words>", q?: "<the question>", a?: "<the answer>", mark: "answered" | "agent" | "open",
// children?: [...] }], `depth` 1–5 (default 3), `freedom` 0–100 (% of the nodes below level 1 the agent fills itself, default 75),
// `version` { n, date }. Level 1 = the modules of the product, agreed with the person first.
//
// Pure functions, no fs: `check-product.mjs` validates with them, `npm run quiz:tree` prints the turn's checklist with them.
//
//   npm run quiz:tree            the numbered tree with marks, depth, freedom, version and the counts per level — the end of every turn
//   npm run quiz:tree -- next    the next node to ask by the breadth rule (or «the level is done» with the counts)

export const MARKS = ['answered', 'agent', 'open']
export const DEPTH = { min: 1, max: 5, default: 3 }
export const FREEDOM = { min: 0, max: 100, default: 75 }
// Asked of the person at ANY freedom, with the agent's recommendation (Roma: «деньги, владение, публикация и секреты»).
export const ALWAYS_ASKED = /\b(money|price|pay|payment|cost|owner|ownership|publish|publication|post|secret|key|token|password|деньг|цен|оплат|плат|владе|публик|секрет|ключ|парол)/i

/** Every node with its level, in reading order. */
export function flatten(tree, level = 1, out = []) {
  for (const node of Array.isArray(tree) ? tree : []) {
    out.push({ node, level })
    flatten(node?.children, level + 1, out)
  }
  return out
}

/** The problems of a quiz's tree, in words — empty when it is right. */
export function treeProblems(quiz) {
  const problems = []
  const depth = quiz?.depth ?? DEPTH.default
  const freedom = quiz?.freedom ?? FREEDOM.default
  if (!Number.isInteger(depth) || depth < DEPTH.min || depth > DEPTH.max) problems.push(`depth is a whole number ${DEPTH.min}–${DEPTH.max}, here «${depth}»`)
  if (!Number.isInteger(freedom) || freedom < FREEDOM.min || freedom > FREEDOM.max) problems.push(`freedom is a whole percent ${FREEDOM.min}–${FREEDOM.max}, here «${freedom}»`)
  if (quiz?.tree === undefined) return problems
  if (!Array.isArray(quiz.tree)) return [...problems, 'tree is a list of level-1 branches']
  const walk = (nodes, prefix, level) => {
    nodes.forEach((node, i) => {
      const want = prefix ? `${prefix}.${i + 1}` : String(i + 1)
      const where = `tree ${want}`
      if (node?.n !== want) problems.push(`${where} — numbered «${node?.n}», its place says «${want}» (numbers follow the order)`)
      const words = String(node?.title ?? '').trim().split(/\s+/).filter(Boolean).length
      if (words < 1 || words > 4) problems.push(`${where} — its title is 1–4 words, here ${words}`)
      if (!MARKS.includes(node?.mark)) problems.push(`${where} — mark is one of ${MARKS.join(' · ')}, here «${node?.mark}»`)
      if (node?.mark !== 'open' && !String(node?.a ?? '').trim()) problems.push(`${where} — marked «${node?.mark}» without an answer`)
      if (level > depth) problems.push(`${where} — level ${level} is deeper than the quiz's depth ${depth}`)
      if (level === 1 && node?.mark === 'agent') problems.push(`${where} — a level-1 branch is the person's: never filled by the agent`)
      if (node?.mark === 'agent' && ALWAYS_ASKED.test(`${node?.title} ${node?.q ?? ''}`)) problems.push(`${where} — money, ownership, publication and secrets are asked of the person at any freedom`)
      if (node?.children !== undefined && !Array.isArray(node.children)) problems.push(`${where} — children is a list`)
      else if (Array.isArray(node?.children)) walk(node.children, want, level + 1)
    })
  }
  walk(quiz.tree, '', 1)
  // THE BREADTH RULE: a node of level L+1 is answered only when no node of level L is open anywhere — never down one branch first.
  const all = flatten(quiz.tree)
  const openAt = (level) => all.some((x) => x.level === level && x.node?.mark === 'open')
  for (const { node, level } of all) {
    if (level > 1 && node?.mark === 'answered' && openAt(level - 1)) {
      problems.push(`tree ${node.n} — answered at level ${level} while level ${level - 1} still has open nodes: the quiz goes in breadth, level by level`)
    }
  }
  return problems
}

/** The next node to ask: the first open node of the shallowest level that has one. Null when every node is filled. */
export function nextToAsk(quiz) {
  const all = flatten(quiz?.tree)
  const open = all.filter((x) => x.node?.mark === 'open')
  if (!open.length) return null
  const level = Math.min(...open.map((x) => x.level))
  return open.find((x) => x.level === level)
}

/** Counts per level: nodes, answered by the person, filled by the agent, open. */
export function counts(quiz) {
  const by = {}
  for (const { node, level } of flatten(quiz?.tree)) {
    const c = (by[level] ??= { nodes: 0, answered: 0, agent: 0, open: 0 })
    c.nodes += 1
    if (MARKS.includes(node?.mark)) c[node.mark] += 1
  }
  return by
}

const SIGN = { answered: '✓', agent: '◇', open: '○' }

/** The turn's checklist: the whole tree numbered, each node 2–4 words with its mark, then depth, freedom, version and the counts. */
export function checklist(quiz, lang = 'en') {
  const ru = lang === 'ru'
  const lines = flatten(quiz?.tree).map(({ node, level }) => `${'  '.repeat(level - 1)}${SIGN[node?.mark] ?? '?'} ${node?.n} ${node?.title ?? ''}`)
  const c = counts(quiz)
  const per = Object.keys(c).sort().map((l) => `${ru ? 'ур.' : 'L'}${l}: ${c[l].nodes} (${c[l].answered}✓ ${c[l].agent}◇ ${c[l].open}○)`).join(' · ')
  const v = quiz?.version ? ` · ${ru ? 'версия' : 'version'} ${quiz.version.n}${quiz.version.date ? ` (${quiz.version.date})` : ''}` : ''
  return [
    ...lines,
    `${ru ? 'глубина' : 'depth'} ${quiz?.depth ?? DEPTH.default} · F ${quiz?.freedom ?? FREEDOM.default}%${v}`,
    per,
    ru ? '✓ ответил человек · ◇ заполнил агент · ○ открыто' : '✓ answered by the person · ◇ filled by the agent · ○ open',
  ].join('\n')
}

// The command: read development-docs/product/quiz.json of this element.
if (import.meta.url === `file://${process.argv[1]}`) {
  const { readFileSync } = await import('node:fs')
  const { join, dirname } = await import('node:path')
  const { fileURLToPath } = await import('node:url')
  const root = join(dirname(fileURLToPath(import.meta.url)), '..')
  let quiz = null
  try { quiz = JSON.parse(readFileSync(join(root, 'development-docs', 'product', 'quiz.json'), 'utf8')) } catch { /* none */ }
  if (!quiz) { console.log('===QUIZ_TREE=== no development-docs/product/quiz.json yet'); process.exit(0) }
  const lang = process.argv.includes('--en') ? 'en' : process.argv.includes('--ru') ? 'ru' : (process.env.QUIZ_LANG ?? 'en')
  if (process.argv[2] === 'next') {
    const x = nextToAsk(quiz)
    console.log(x ? `===QUIZ_NEXT=== ${x.node.n} «${x.node.title}» (level ${x.level})${x.node.q ? ` — ${x.node.q}` : ''}` : '===QUIZ_NEXT=== every node is filled — report the counts per level and ask: deeper everywhere, or in one branch')
    process.exit(0)
  }
  const p = treeProblems(quiz)
  console.log(checklist(quiz, lang))
  if (p.length) { console.log(`===QUIZ_TREE_PROBLEMS=== ${p.length}\n${p.map((x) => `  ✗ ${x}`).join('\n')}`); process.exit(1) }
}
