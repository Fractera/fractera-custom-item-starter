// @local — the widget «Квиз» of this element's Telegram Mini App (core step 852-7; Roma, Telegram 1299): the analytics panel on top
// (branches, depth, questions, answers, open, % complete, each level's breadth), the depth and automation dials, the open questions to
// read, the tree's level 1, the approved versions, and the ways out — the browser and the chat. Drawn on the server from
// `development-docs/product/quiz.json` at render; the dials are the one island.

import { TgHead } from "../../../_components/tg-head.client"
import { TgGroup, TgNote, TgRows } from "../../../_components/tg-list"
import { openNodes, quizStats, quizVersions, readQuiz } from "../../../_libs/quiz"
import { fill, plural } from "../../../_libs/words"
import { QuizDials } from "./dials.client"
import { Analytics, nodeRow, WaysOut } from "./parts"
import { quizUi } from "./ui.i18n"

/** Open questions shown before the line «ещё N». */
const SHOWN = 8

export function Widget({ lang }: { lang: string }) {
  const ui = quizUi(lang)
  const quiz = readQuiz()
  const href = `/${lang}/tg/quiz`
  if (!quiz) {
    return (
      <div className="flex flex-col gap-5 pb-10" data-block="tg-quiz" data-app-column="">
        <TgHead line={ui.empty} title={ui.title} />
        <div className="flex flex-col gap-5 px-3" data-block="tg-quiz-empty">
          <TgNote>{ui.emptyHint}</TgNote>
          <WaysOut href={href} lang={lang} path={[ui.title]} ui={ui} />
        </div>
      </div>
    )
  }
  const stats = quizStats(quiz)
  // 852-7 (✗ fc4vk 2026-11-25: a draft of the older form — vision and stages, no tree — read «every question has an answer» over an empty
  // tree): a quiz with no level-1 branch yet says so, keeps the dials (depth and F are asked before the first question) and hides the zeros.
  const started = stats.questions > 0
  const open = openNodes(quiz)
  const versions = quizVersions()
  const line = quiz.version ? fill(ui.version, { n: quiz.version.n, date: quiz.version.date ?? "" }) : ui.draft
  return (
    <div className="flex flex-col gap-5 pb-10" data-block="tg-quiz" data-app-column="">
      <TgHead line={quiz.title ? `${quiz.title} · ${line}` : line} title={ui.title} />
      <div className="flex flex-col gap-6 px-3" data-block="tg-quiz-body">
        {started ? <Analytics stats={stats} ui={ui} /> : <TgNote>{ui.treeNone}</TgNote>}
        <QuizDials depth={stats.depth} freedom={stats.freedom} lang={lang} ui={ui.dials} />
        {started ? (<>
        <TgGroup
          aside={open.length ? String(open.length) : null}
          foot={open.length > SHOWN ? (
            <span className="flex h-10 items-center justify-center text-[length:var(--fs-small)] text-muted-foreground">
              {plural(ui.more, open.length - SHOWN, lang)}
            </span>
          ) : null}
          title={ui.openTitle}
        >
          {open.length ? <TgRows rows={open.slice(0, SHOWN).map((n) => nodeRow(n, lang))} /> : <TgNote>{ui.openNone}</TgNote>}
        </TgGroup>
        <TgGroup aside={String(stats.branches)} title={ui.treeTitle}>
          <TgRows rows={(quiz.tree ?? []).map((n) => nodeRow(n, lang))} />
        </TgGroup>
        </>) : null}
        <TgGroup title={ui.versionsTitle}>
          {versions.length
            ? <TgRows rows={versions.map((v) => ({ title: `v${v.n}`, hint: v.date, href: `${href}/v${v.n}`, aside: quiz.version?.n === v.n ? "●" : null }))} />
            : <TgNote>{ui.versionsNone}</TgNote>}
        </TgGroup>
        <WaysOut ask={open[0]?.q ?? null} href={href} lang={lang} path={[ui.title]} ui={ui} />
      </div>
    </div>
  )
}
