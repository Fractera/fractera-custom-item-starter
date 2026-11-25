// @local — the pieces every quiz screen of the Mini App shares (core step 852-7): the analytics panel — the percent as the focal number,
// five counts under it and the breadth of each level as a bar (the quiz walks the tree level by level, so the bars fill top-down) —
// the rows of a tree's nodes with their marks, and the two ways out: the browser («Сайт») and the chat («Telegram бот»).

import { Progress } from "@/components/ui/progress"
import { Small } from "@/components/ui/typography"
import { TgToChat } from "../../../_components/tg-to-chat.client"
import { childrenFilled, nodeHref, type QuizNode, type QuizStats } from "../../../_libs/quiz"
import { fill } from "../../../_libs/words"
import { OpenInBrowser } from "./open-browser.client"
import type { QuizUi } from "./ui.i18n"

const SIGN = { answered: "✓", agent: "◇", open: "○" } as const

export function Analytics({ stats, ui }: { stats: QuizStats; ui: QuizUi }) {
  const cells: [string, string][] = [
    [String(stats.branches), ui.statBranches],
    [`${stats.reached}/${stats.depth}`, ui.statDepth],
    [String(stats.questions), ui.statQuestions],
    [String(stats.answered + stats.agent), ui.statAnswers],
    [String(stats.open), ui.statOpen],
  ]
  return (
    <section className="flex flex-col gap-4 rounded-xl bg-[var(--tg-card)] px-4 py-4" data-block="tg-quiz-analytics">
      <div className="flex flex-col gap-2" data-block="tg-quiz-percent">
        <span className="font-sans font-semibold text-[length:var(--fs-h1)] leading-none tabular-nums">{fill(ui.done, { p: stats.percent })}</span>
        <Progress aria-label={fill(ui.done, { p: stats.percent })} value={stats.percent} />
        <Small data-block="tg-quiz-split" className="text-muted-foreground">{fill(ui.split, { a: stats.answered, g: stats.agent })} · F {stats.freedom}%</Small>
      </div>
      <div className="grid grid-cols-5 gap-1" data-block="tg-quiz-counts">
        {cells.map(([n, label]) => (
          <div className="flex flex-col gap-1" data-block="tg-quiz-count" key={label}>
            <span className="font-sans font-semibold text-[length:var(--fs-h3)] leading-none tabular-nums">{n}</span>
            <span className="text-[length:var(--fs-eyebrow)] text-muted-foreground leading-tight">{label}</span>
          </div>
        ))}
      </div>
      {stats.levels.length ? (
        <ul className="flex flex-col gap-2.5" data-block="tg-quiz-levels">
          {stats.levels.map((l) => (
            <li className="flex flex-col gap-1" data-block="tg-quiz-level" key={l.level}>
              <div className="flex items-baseline justify-between text-[length:var(--fs-small)]" data-block="tg-quiz-level-head">
                <span>{fill(ui.level, { l: l.level })}</span>
                <span className="text-muted-foreground tabular-nums">{l.filled}/{l.nodes}</span>
              </div>
              <Progress aria-label={fill(ui.level, { l: l.level })} className="h-1.5" value={l.nodes ? Math.round((l.filled / l.nodes) * 100) : 0} />
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  )
}

/** A node as a row: its mark, number and 2–4 words, its question as the quiet line, «2/4» of its children filled. */
export function nodeRow(node: QuizNode, lang: string, link = true) {
  const kids = childrenFilled(node)
  return {
    title: `${SIGN[node.mark] ?? "○"} ${node.n} ${node.title}`,
    hint: node.mark === "open" ? (node.q ?? null) : (node.a ?? node.q ?? null),
    aside: kids.of ? `${kids.filled}/${kids.of}` : null,
    href: link ? nodeHref(lang, node.n) : null,
  }
}

/** «Сайт» and «Telegram бот»: the same address in the browser, and the chat with the path and the preset question. */
export function WaysOut({ lang, href, path, ask, ui }: { lang: string; href: string; path: string[]; ask?: string | null; ui: QuizUi }) {
  return (
    <div className="flex flex-col gap-3" data-block="tg-quiz-ways">
      <OpenInBrowser hint={ui.openSiteHint} href={href} label={ui.openSite} />
      <TgToChat hint={ui.toChatHint} label={ui.toChat} lang={lang} section={{ path, href, ask }} />
    </div>
  )
}
