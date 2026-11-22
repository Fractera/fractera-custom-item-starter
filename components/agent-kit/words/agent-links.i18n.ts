// СЛОВА БЫСТРЫХ ПЕРЕХОДОВ И ТРЕБОВАНИЯ TELEGRAM (624-4).
//
// 🎯 Владелец 2026-11-02: «внутри вкладки активации подписки должны быть быстрые кнопки для перехода в терминал и для перехода в
// Telegram. Как раз таки вкладки Telegram тоже должно быть информация то что приложении должно быть установлено».

export type AgentLinksWords = {
  nextTitle: string
  nextText: string
  openTerminal: string
  openTelegram: string
  appTitle: string
  appText: string
  getApp: string
}

const DICT: Record<string, AgentLinksWords> = {
  en: {
    nextTitle: "Then talk to your agent",
    nextText: "Once the subscription is connected, turn the agent on in the terminal or set up its Telegram bot and write from your phone.",
    openTerminal: "Open the terminal",
    openTelegram: "Set up Telegram",
    appTitle: "You need the Telegram app",
    appText: "Install Telegram on your phone or computer and sign in before you start: the bot is created and the agent answers inside the app. Without it the steps below cannot be done.",
    getApp: "Download Telegram",
  },
  ru: {
    nextTitle: "Дальше — разговор с агентом",
    nextText: "Когда подписка подключена, включите агента в терминале или настройте его Telegram-бота и пишите с телефона.",
    openTerminal: "Открыть терминал",
    openTelegram: "Настроить Telegram",
    appTitle: "Нужно приложение Telegram",
    appText: "Перед началом установите Telegram на телефон или компьютер и войдите в него: бот создаётся и агент отвечает внутри приложения. Без него шаги ниже не выполнить.",
    getApp: "Скачать Telegram",
  },
}

/** Слова на выбранном языке; незнакомый язык честно деградирует до английского. */
export function agentLinksWords(lang: string): AgentLinksWords {
  return DICT[lang] ?? DICT.en
}
