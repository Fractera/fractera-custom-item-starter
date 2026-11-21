// Words of the Mini App's home screen (node step 821). `en` is the base, `ru` the translation; the server picks one language.
import type { Plural } from "../../../_libs/words"

export type HomeUi = {
  line: string; today: string; todayTasks: Plural; todayNone: string; next: string; calm: string
  agent: string
  sections: string; projects: string; projectsHint: string; directions: Plural; cron: string; cronTasks: Plural; cronNext: string
  element: string; elementHint: string; settings: string; settingsHint: string
}

const en: HomeUi = {
  line: "Element administration", today: "Today", todayTasks: { one: "{n} task today", other: "{n} tasks today" },
  todayNone: "No tasks today", next: "next at {time} — {name}", calm: "all is calm",
  agent: "Agent",
  sections: "Sections", projects: "Projects", projectsHint: "{directions} · {n} started", directions: { one: "{n} direction", other: "{n} directions" },
  cron: "Cron", cronTasks: { one: "{n} task", other: "{n} tasks" }, cronNext: "next today at {time}",
  element: "Element", elementHint: "site, people, agent, building", settings: "Settings", settingsHint: "{n} of 6 filled",
}

const ru: HomeUi = {
  line: "Администрирование элемента", today: "Сегодня",
  todayTasks: { one: "{n} задача сегодня", few: "{n} задачи сегодня", many: "{n} задач сегодня", other: "{n} задачи сегодня" },
  todayNone: "Задач на сегодня нет", next: "ближайшая в {time} — {name}", calm: "всё спокойно",
  agent: "Агент",
  sections: "Разделы", projects: "Проекты", projectsHint: "{directions} · начато {n}",
  directions: { one: "{n} направление", few: "{n} направления", many: "{n} направлений", other: "{n} направления" },
  cron: "Cron", cronTasks: { one: "{n} задача", few: "{n} задачи", many: "{n} задач", other: "{n} задачи" }, cronNext: "ближайшая сегодня в {time}",
  element: "Элемент", elementHint: "сайт, люди, агент, строительство", settings: "Настройки", settingsHint: "заполнено {n} из 6",
}

const ALL: Record<string, HomeUi> = { en, ru }
export const homeUi = (lang: string): HomeUi => ALL[lang] ?? en
