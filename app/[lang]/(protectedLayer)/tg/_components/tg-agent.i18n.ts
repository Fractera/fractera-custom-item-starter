// Words of the agent card of the Mini App (node step 821). `en` base, `ru` translation; the screen picks one language and passes it to
// the island as a prop — the island imports only the type.
export type TgAgentUi = {
  agent: string; coding: string; waiting: string; sleeping: string; defaultModel: string; effort: string
  window: string; used: string; ofTokens: string; noWindow: string; noAnswer: string
  subscription: string; own: string; node: string; notSigned: string; bot: string; noBot: string
  /** 840-4 (the owner, Telegram 954): the fuel under the agent's card and its model choice */
  fuel: string; fiveHour: string; sevenDay: string; resets: string; notMeasured: string; change: string
  modelPick: string; effortPick: string; effortFixed: string; switchTo: string; switching: string; willSwitch: string; asleepNoSwitch: string; switchFailed: string
}

const en: TgAgentUi = {
  agent: "The element's agent", coding: "Working on your task", waiting: "Waiting for you", sleeping: "Asleep — wakes on your message",
  defaultModel: "the default model", effort: "effort", window: "Context window", used: "{n} % used", ofTokens: "of {size} tokens",
  noWindow: "no conversation yet", noAnswer: "the core does not answer now — try again later",
  subscription: "Claude Code subscription", own: "its own account", node: "the node's subscription", notSigned: "not signed in yet",
  bot: "Telegram bot", noBot: "not connected yet",
  fuel: "Subscription fuel", fiveHour: "5 hours", sevenDay: "7 days", resets: "resets {time}", notMeasured: "not measured yet", change: "Change",
  modelPick: "Model", effortPick: "Effort", effortFixed: "This model runs on effort medium.", switchTo: "Switch", switching: "Switching…",
  willSwitch: "I switch to {m} when the current turn ends", asleepNoSwitch: "The agent is asleep — write to it, and the model can be changed.",
  switchFailed: "It did not go through — try again.",
}

const ru: TgAgentUi = {
  agent: "Агент элемента", coding: "Работает над задачей", waiting: "Ждёт вас", sleeping: "Спит — проснётся от вашего сообщения",
  defaultModel: "модель по умолчанию", effort: "усилие", window: "Окно контекста", used: "занято {n} %", ofTokens: "из {size} токенов",
  noWindow: "разговора ещё не было", noAnswer: "ядро сейчас не отвечает — попробуйте позже",
  subscription: "Подписка Claude Code", own: "свой аккаунт", node: "подписка узла", notSigned: "вход ещё не выполнен",
  bot: "Telegram-бот", noBot: "ещё не подключён",
  fuel: "Топливо подписки", fiveHour: "5 часов", sevenDay: "7 дней", resets: "сброс {time}", notMeasured: "ещё не замерен", change: "Сменить",
  modelPick: "Модель", effortPick: "Усилие", effortFixed: "У этой модели усилие medium.", switchTo: "Переключить", switching: "Переключаю…",
  willSwitch: "Переключусь на {m}, когда закончу текущий ход", asleepNoSwitch: "Агент спит — напишите ему, и модель можно будет сменить.",
  switchFailed: "Не вышло — попробуйте ещё раз.",
}

const ALL: Record<string, TgAgentUi> = { en, ru }
export const tgAgentUi = (lang: string): TgAgentUi => ALL[lang] ?? en
