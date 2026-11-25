// Words of the widget «Квиз» of this element's Telegram Mini App (core step 852-7). `en` is the base, `ru` the translation; the
// dictionary is the server's — the screens pick one language and pass the dials island only the words it shows.
import type { Plural } from "../../../_libs/words"

export type QuizUi = {
  title: string
  draft: string
  /** `{n}`, `{date}` */
  version: string
  empty: string
  emptyHint: string
  treeNone: string
  statBranches: string
  statDepth: string
  statQuestions: string
  statAnswers: string
  statOpen: string
  /** `{p}` — percent */
  done: string
  /** `{l}` — the level */
  level: string
  /** `{a}` by the person, `{g}` by the agent */
  split: string
  dials: { depth: string; depthHint: string; freedom: string; freedomHint: string; saved: string; failed: string; shallow: string }
  openTitle: string
  openNone: string
  more: Plural
  treeTitle: string
  versionsTitle: string
  versionsNone: string
  marks: { answered: string; agent: string; open: string }
  question: string
  answer: string
  noAnswer: string
  children: string
  versionNote: string
  /** `{n}` — the line the bot writes when the person goes to the chat from a version */
  versionAsk: string
  openSite: string
  openSiteHint: string
  toChat: string
  toChatHint: string
  notFound: string
}

const en: QuizUi = {
  title: "Quiz",
  draft: "A draft — no version approved yet",
  version: "Version {n} · {date}",
  empty: "The product quiz has not started yet.",
  emptyHint: "Say in the chat: «start the product quiz» — the agent asks the level-1 modules first, then goes deeper level by level.",
  treeNone: "There is a draft of the quiz, but its tree has not started: no level-1 module yet. Say in the chat «continue the quiz as a tree» — the agent agrees the modules with you first.",
  statBranches: "branches",
  statDepth: "depth",
  statQuestions: "questions",
  statAnswers: "answers",
  statOpen: "open",
  done: "{p}% complete",
  level: "Level {l}",
  split: "{a} by you · {g} by the agent",
  dials: {
    depth: "Depth",
    depthHint: "How many levels the tree goes down. The agent says the volume and the price before going deeper.",
    freedom: "Automation",
    freedomHint: "The share of questions below level 1 the agent answers itself. Money, ownership, publication and secrets are always asked.",
    saved: "Saved — the agent reads it on its next turn",
    failed: "Not saved",
    shallow: "The tree already goes deeper than that",
  },
  openTitle: "Open questions",
  openNone: "Every question has an answer. Deeper is your word in the chat.",
  more: { one: "{n} more", other: "{n} more" },
  treeTitle: "The tree",
  versionsTitle: "Versions",
  versionsNone: "An approved version appears here — say «approve the quiz» in the chat.",
  marks: { answered: "answered by you", agent: "filled by the agent", open: "open" },
  question: "Question",
  answer: "Answer",
  noAnswer: "No answer yet — answer it in the chat.",
  children: "Inside",
  versionNote: "An approved version, read-only. Going back to it makes a new version equal to it — say so in the chat.",
  versionAsk: "Go back to quiz version {n}?",
  openSite: "Open in the browser",
  openSiteHint: "The same quiz on the element's site, on a big screen",
  toChat: "Go to the chat",
  toChatHint: "The agent gets the question and answers about it",
  notFound: "No such node in the quiz",
}

const ru: QuizUi = {
  title: "Квиз",
  draft: "Черновик — версия ещё не утверждена",
  version: "Версия {n} · {date}",
  empty: "Продуктовый квиз ещё не начат.",
  emptyHint: "Скажите в чате: «начни продуктовый квиз» — агент сначала спросит модули первого уровня, потом пойдёт вглубь уровень за уровнем.",
  treeNone: "Черновик квиза есть, но дерево ещё не начато: модулей первого уровня пока нет. Скажите в чате «продолжи квиз деревом» — агент сначала согласует с вами модули.",
  statBranches: "ветки",
  statDepth: "глубина",
  statQuestions: "вопросы",
  statAnswers: "ответы",
  statOpen: "открыто",
  done: "готово на {p}%",
  level: "Уровень {l}",
  split: "{a} — вы · {g} — агент",
  dials: {
    depth: "Глубина",
    depthHint: "Сколько уровней вниз идёт дерево. Прежде чем углубиться, агент называет объём и цену.",
    freedom: "Автоматизация",
    freedomHint: "Доля вопросов ниже первого уровня, на которые агент отвечает сам. Деньги, владение, публикация и секреты спрашиваются всегда.",
    saved: "Сохранено — агент прочтёт на следующем ходу",
    failed: "Не сохранилось",
    shallow: "Дерево уже глубже этого",
  },
  openTitle: "Открытые вопросы",
  openNone: "На все вопросы есть ответ. Глубже — ваше слово в чате.",
  more: { one: "ещё {n}", few: "ещё {n}", many: "ещё {n}", other: "ещё {n}" },
  treeTitle: "Дерево",
  versionsTitle: "Версии",
  versionsNone: "Утверждённая версия появится здесь — скажите в чате «утверди квиз».",
  marks: { answered: "ответили вы", agent: "заполнил агент", open: "открыт" },
  question: "Вопрос",
  answer: "Ответ",
  noAnswer: "Ответа пока нет — ответьте в чате.",
  children: "Внутри",
  versionNote: "Утверждённая версия, только чтение. Возврат к ней создаёт новую версию, равную этой, — скажите об этом в чате.",
  versionAsk: "Вернуть квиз к версии {n}?",
  openSite: "Открыть в браузере",
  openSiteHint: "Тот же квиз на сайте элемента, на большом экране",
  toChat: "Перейти в чат",
  toChatHint: "Агент получит вопрос и ответит про него",
  notFound: "В квизе нет такого узла",
}

const ALL: Record<string, QuizUi> = { en, ru }

export const quizUi = (lang: string): QuizUi => ALL[lang] ?? en
