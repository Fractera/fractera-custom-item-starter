// Words of the Mini App's «Настройки» — what the element knows about itself (node step 821; the owner, Telegram 412). `en` base, `ru`.
import type { Plural } from "../../../_libs/words"

export type SettingsUi = {
  title: string; line: string; soon: string; how: string
  instruction: string; instructionEmpty: string; owner: string; ownerHint: string; project: string; empty: string
  skills: string; skillsN: Plural; subscriptions: string; noSubscriptions: string; example: string; until: string; mcp: string; noMcp: string
}

const en: SettingsUi = {
  title: "Settings", line: "{n} of 6 filled", soon: "soon", how: "Any part changes by your words to the agent in the chat.",
  instruction: "The element's instruction", instructionEmpty: "empty — the agent writes what only this element does",
  owner: "About the owner", ownerHint: "whose app this is", project: "About the project", empty: "empty",
  skills: "Skills", skillsN: { one: "{n} skill", other: "{n} skills" }, subscriptions: "Subscriptions", noSubscriptions: "none yet",
  example: "none yet — an example: {names}", until: "until {date}", mcp: "MCP connectors", noMcp: "none",
}

const ru: SettingsUi = {
  title: "Настройки", line: "заполнено {n} из 6", soon: "скоро", how: "Любую часть можно изменить словами агенту в чате.",
  instruction: "Инструкция элемента", instructionEmpty: "пусто — агент запишет, что делает только этот элемент",
  owner: "О владельце", ownerHint: "чьё это приложение", project: "О проекте", empty: "пусто",
  skills: "Навыки", skillsN: { one: "{n} навык", few: "{n} навыка", many: "{n} навыков", other: "{n} навыка" },
  subscriptions: "Подписки", noSubscriptions: "пока нет", example: "пока нет — пример: {names}", until: "до {date}",
  mcp: "MCP-коннекторы", noMcp: "нет",
}

const ALL: Record<string, SettingsUi> = { en, ru }
export const settingsUi = (lang: string): SettingsUi => ALL[lang] ?? en
