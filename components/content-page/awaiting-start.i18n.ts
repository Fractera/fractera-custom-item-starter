// СЛОВА ПОДПИСИ ПОД НАЗВАНИЕМ ПРОЕКТА (узел, шаг 715). Владелец 2026-11-10: «добавь подпись внизу это стартовый макет чтобы построить эту
// страницу войдите в свою подписку (ссылка открывает) перейдите в терминал и активная кнопка которая открывает терминал (здесь мы
// открываем терминал элемента не ядра)».
export type AwaitingStartWords = { before: string; subscription: string; after: string; terminal: string }

const EN: AwaitingStartWords = {
  before: "This is the starter layout. To build this page, sign in to your",
  subscription: "Claude Code subscription",
  after: "and go to the element's terminal.",
  terminal: "Open the element's terminal",
}

const RU: AwaitingStartWords = {
  before: "Это стартовый макет. Чтобы построить эту страницу, войдите в свою",
  subscription: "подписку Claude Code",
  after: "и перейдите в терминал элемента.",
  terminal: "Открыть терминал элемента",
}

export function awaitingStartWords(lang: string): AwaitingStartWords {
  return lang === "ru" ? RU : EN
}
