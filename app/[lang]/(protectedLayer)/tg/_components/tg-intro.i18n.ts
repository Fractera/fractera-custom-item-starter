// Words of «Как начать» — the first text of this element's Mini App (node step 840-4; the owner's words, Telegram 954, polished and agreed,
// 955/956; `kinds` — the owner, Telegram 973: «два типа строительства … нативные … маркетплейс Fractera», in the present tense). `en` base, `ru` translation; the screen picks one language and passes it as a prop — the island imports only the type.
export type TgIntroUi = { title: string; start: string; build: string; kinds: string; wish: string; read: string }

const en: TgIntroUi = {
  title: "How to start",
  start: "To start, open «Projects» and choose a fitting topic, or create a new one. Press «Go to the chat» and tell the agent what you want to build.",
  build: "In Fractera you first build a technical solution together with the agent — that is building. Then you use it — that is the working process.",
  kinds: "Fractera builds two kinds of things. Your own element — you are here. And a shared solution, a native element: other elements use it, and you can sell it to other people through the Fractera marketplace.",
  wish: "Now create something delightful ✨",
  read: "Read",
}

const ru: TgIntroUi = {
  title: "Как начать",
  start: "Чтобы начать, откройте «Проекты» и выберите подходящую тему или создайте новую. Нажмите «Перейти в чат» и расскажите агенту, что хотите построить.",
  build: "В Fractera вы сначала вместе с агентом строите техническое решение — это строительство. Потом пользуетесь им — это рабочий процесс.",
  kinds: "В Fractera строят двумя способами. Свой элемент — вы сейчас здесь. И общее решение — нативный элемент: им пользуются другие элементы, и его можно продать другим людям через маркетплейс Fractera.",
  wish: "А теперь создайте что-нибудь восхитительное ✨",
  read: "Прочитано",
}

const ALL: Record<string, TgIntroUi> = { en, ru }
export const tgIntroUi = (lang: string): TgIntroUi => ALL[lang] ?? en
