import "server-only"
import { execFileSync } from "node:child_process"
import { readFileSync } from "node:fs"
import { join } from "node:path"
import { elementRoot } from "@/lib/page-tree"
import { DEPTH, FREEDOM, flatten } from "@/scripts/quiz-tree.mjs"

// THE ELEMENT'S PRODUCT QUIZ AS ITS OWN ROUTE (core step 852-6/7; Roma, Telegram 1299: «квизы у нас должны жить отдельно маршрутом …
// дерево которое динамически создаёт маршруты … версии хранятся в репозитории GitHub»). The tree of `development-docs/product/quiz.json`
// makes the addresses itself — `/tg/quiz` the quiz, `/tg/quiz/1/2` its node 1.2, `/tg/quiz/v3` its approved version 3 (the git tag
// `quiz-v3`, made by `npm run quiz:version`). Read at render (the page keeps 30 s), nothing kept, no timer.

export type QuizMark = "answered" | "agent" | "open"
export type QuizNode = { n: string; title: string; q?: string; a?: string; mark: QuizMark; children?: QuizNode[] }
export type Quiz = { tree?: QuizNode[]; depth?: number; freedom?: number; version?: { n: number; date?: string }; title?: string }
export type QuizVersion = { n: number; date: string | null }
export type LevelCount = { level: number; nodes: number; filled: number }
export type QuizStats = {
  branches: number
  /** the deepest level the tree reached, and the depth set for it */
  reached: number
  depth: number
  freedom: number
  questions: number
  answered: number
  agent: number
  open: number
  /** filled (by the person or the agent) of all, whole percent */
  percent: number
  levels: LevelCount[]
}

export const QUIZ_FILE = join("development-docs", "product", "quiz.json")
const TAG = /^quiz-v(\d{1,4})$/

/** The quiz as it stands now, or null — no quiz.json yet, or not JSON. */
export function readQuiz(): Quiz | null {
  try { return JSON.parse(readFileSync(join(elementRoot(), QUIZ_FILE), "utf8")) as Quiz } catch { return null }
}

const git = (args: string[]) => execFileSync("git", ["-c", `safe.directory=${elementRoot()}`, "-C", elementRoot(), ...args], { encoding: "utf8", timeout: 3_000, stdio: ["ignore", "pipe", "ignore"] })

/** The approved versions — the element's git tags `quiz-v<N>`, newest first; no git or no tag — an empty list. */
export function quizVersions(): QuizVersion[] {
  let out = ""
  try { out = git(["for-each-ref", "refs/tags/quiz-v*", "--format=%(refname:short)|%(creatordate:short)"]) } catch { return [] }
  return out.split("\n").map((l) => l.split("|")).flatMap(([tag, date]) => {
    const m = TAG.exec(tag ?? "")
    return m ? [{ n: Number(m[1]), date: date || null }] : []
  }).sort((a, b) => b.n - a.n)
}

/** The quiz as approved in version N (the file at its tag), or null. */
export function readQuizVersion(n: number): Quiz | null {
  try { return JSON.parse(git(["show", `quiz-v${n}:${QUIZ_FILE}`])) as Quiz } catch { return null }
}

/** The numbers of the analytics panel: branches, depth, questions, answers, open, % complete, and each level's breadth. */
export function quizStats(quiz: Quiz): QuizStats {
  const all = flatten(quiz.tree ?? []) as { node: QuizNode; level: number }[]
  const by = new Map<number, LevelCount>()
  let answered = 0, agent = 0, open = 0
  for (const { node, level } of all) {
    const c = by.get(level) ?? { level, nodes: 0, filled: 0 }
    c.nodes += 1
    if (node.mark === "answered") { answered += 1; c.filled += 1 }
    else if (node.mark === "agent") { agent += 1; c.filled += 1 }
    else open += 1
    by.set(level, c)
  }
  const questions = all.length
  return {
    branches: quiz.tree?.length ?? 0,
    reached: by.size,
    depth: quiz.depth ?? DEPTH.default,
    freedom: quiz.freedom ?? FREEDOM.default,
    questions, answered, agent, open,
    percent: questions ? Math.round(((answered + agent) / questions) * 100) : 0,
    levels: [...by.values()].sort((a, b) => a.level - b.level),
  }
}

/** The open nodes in the order the quiz asks them — the shallowest level first (the breadth rule of `quiz-tree.mjs`). */
export function openNodes(quiz: Quiz): QuizNode[] {
  const all = flatten(quiz.tree ?? []) as { node: QuizNode; level: number }[]
  return all.filter((x) => x.node.mark === "open").sort((a, b) => a.level - b.level).map((x) => x.node)
}

/** The node at an address `1/2/3` with its way from level 1, or null. */
export function nodeAt(quiz: Quiz, parts: string[]): { node: QuizNode; way: QuizNode[] } | null {
  let list = quiz.tree ?? []
  const way: QuizNode[] = []
  for (const p of parts) {
    const i = Number(p) - 1
    const node = /^\d{1,2}$/.test(p) ? list[i] : undefined
    if (!node) return null
    way.push(node)
    list = node.children ?? []
  }
  return way.length ? { node: way[way.length - 1], way } : null
}

/** The address of a node in the Mini App: `1.2.3` → `/<lang>/tg/quiz/1/2/3`. */
export const nodeHref = (lang: string, n: string) => `/${lang}/tg/quiz/${n.split(".").join("/")}`

/** Filled nodes among a node's children — «2/4» beside a branch. */
export function childrenFilled(node: QuizNode): { filled: number; of: number } {
  const kids = node.children ?? []
  return { filled: kids.filter((k) => k.mark !== "open").length, of: kids.length }
}
