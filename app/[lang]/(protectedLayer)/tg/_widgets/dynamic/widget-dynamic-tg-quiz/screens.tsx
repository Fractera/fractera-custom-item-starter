// @local — the quiz's own screens of the Mini App (core step 852-6): the tree makes the addresses — `/tg/quiz/1/2` is node 1.2 with
// its question, its answer and its children; `/tg/quiz/v3` is approved version 3, read from the git tag `quiz-v3`. Drawn at addresses
// that have no folder (`childRoute({ virtual })` in lib/branch-page.tsx), the way the projects' catalog draws its own.

import { Eyebrow, P } from "@/components/ui/typography"
import type { VirtualScreen } from "@/lib/branch-page"
import { TgHead } from "../../../_components/tg-head.client"
import { TgGroup, TgNote, TgRows } from "../../../_components/tg-list"
import { nodeAt, nodeHref, type Quiz, type QuizNode, quizStats, readQuiz, readQuizVersion } from "../../../_libs/quiz"
import { fill } from "../../../_libs/words"
import { Analytics, nodeRow, WaysOut } from "./parts"
import { type QuizUi, quizUi } from "./ui.i18n"

const VERSION = /^quiz\/v(\d{1,4})$/
const NODE = /^quiz(\/\d{1,2}){1,5}$/

/** The screen of a quiz address, or null — then the address is not the quiz's. */
export function quizScreen(slug: string, lang: string): VirtualScreen | null {
  const ui = quizUi(lang)
  const v = VERSION.exec(slug)
  if (v) {
    const n = Number(v[1])
    const quiz = readQuizVersion(n)
    return quiz ? { title: `${ui.title} v${n}`, draw: () => <VersionScreen lang={lang} n={n} quiz={quiz} ui={ui} /> } : null
  }
  if (!NODE.test(slug)) return null
  const quiz = readQuiz()
  const at = quiz ? nodeAt(quiz, slug.split("/").slice(1)) : null
  return at ? { title: `${at.node.n} ${at.node.title}`, draw: () => <NodeScreen lang={lang} node={at.node} ui={ui} way={at.way} /> } : null
}

function NodeScreen({ node, way, ui, lang }: { node: QuizNode; way: QuizNode[]; ui: QuizUi; lang: string }) {
  const parent = way.length > 1 ? way[way.length - 2] : null
  const back = parent ? { href: nodeHref(lang, parent.n), label: `${parent.n} ${parent.title}` } : { href: `/${lang}/tg/quiz`, label: ui.title }
  const href = nodeHref(lang, node.n)
  return (
    <div className="flex flex-col gap-5 pb-10" data-block="tg-quiz-node" data-app-column="">
      <TgHead back={back} line={ui.marks[node.mark]} title={`${node.n} ${node.title}`} />
      <div className="flex flex-col gap-6 px-3" data-block="tg-quiz-node-body">
        {node.q ? <Card data-block="qwz04" label={ui.question} text={node.q} /> : null}
        {node.a ? <Card data-block="bxwwc" label={ui.answer} text={node.a} /> : <TgNote>{ui.noAnswer}</TgNote>}
        {node.children?.length ? (
          <TgGroup title={ui.children}><TgRows rows={node.children.map((c) => nodeRow(c, lang))} /></TgGroup>
        ) : null}
        <WaysOut ask={node.mark === "open" ? (node.q ?? null) : null} href={href} lang={lang} path={[ui.title, ...way.map((w) => `${w.n} ${w.title}`)]} ui={ui} />
      </div>
    </div>
  )
}

function VersionScreen({ quiz, n, ui, lang }: { quiz: Quiz; n: number; ui: QuizUi; lang: string }) {
  const flat: QuizNode[] = []
  const walk = (list: QuizNode[] = []) => list.forEach((x) => { flat.push(x); walk(x.children) })
  walk(quiz.tree)
  return (
    <div className="flex flex-col gap-5 pb-10" data-block="tg-quiz-version" data-app-column="">
      <TgHead back={{ href: `/${lang}/tg/quiz`, label: ui.title }} line={fill(ui.version, { n, date: quiz.version?.date ?? "" })} title={`${ui.title} v${n}`} />
      <div className="flex flex-col gap-6 px-3" data-block="tg-quiz-version-body">
        <TgNote>{ui.versionNote}</TgNote>
        <Analytics stats={quizStats(quiz)} ui={ui} />
        <TgGroup title={ui.treeTitle}>
          <TgRows rows={flat.map((x) => ({ ...nodeRow(x, lang, false), title: `${"· ".repeat(x.n.split(".").length - 1)}${nodeRow(x, lang, false).title}` }))} />
        </TgGroup>
        <WaysOut ask={fill(ui.versionAsk, { n })} href={`/${lang}/tg/quiz/v${n}`} lang={lang} path={[ui.title, `v${n}`]} ui={ui} />
      </div>
    </div>
  )
}

function Card({ label, text }: { label: string; text: string }) {
  return (
    <section className="flex flex-col gap-1.5 rounded-xl bg-[var(--tg-card)] px-4 py-3.5" data-block="tg-quiz-card">
      <Eyebrow data-block="tg-quiz-card-label" className="text-muted-foreground tracking-wider">{label}</Eyebrow>
      <P data-block="tg-quiz-card-text" className="whitespace-pre-line text-pretty">{text}</P>
    </section>
  )
}
