// Words of the widget «Projects» of this element's Telegram Mini App (node step 821). `en` is the base, `ru` the translation; the
// dictionary is the server's — the screens pick one language and pass the sort island only the words it shows.
import type { Plural } from "../../../_libs/words"

export type ProjectsUi = {
  title: string
  /** `{n}` — how many directions */
  line: Plural
  all: string
  popular: string
  actual: string
  sortLabel: string
  /** `{n}` of `{of}` */
  started: string
  more: Plural
  directions: Plural
  pages: Plural
  tasks: Plural
  today: Plural
  emptyPopular: string
  emptyActual: string
  statPages: string
  statActive: string
  statToday: string
  emptyItem: string
  openSite: string
  toChat: string
  toChatHint: string
}

const en: ProjectsUi = {
  title: "Projects",
  line: { one: "{n} direction — pick any", other: "{n} directions — pick any" },
  all: "All",
  popular: "Popular",
  actual: "Current",
  sortLabel: "Order",
  started: "{n} of {of} started",
  more: { one: "{n} more direction", other: "{n} more directions" },
  directions: { one: "{n} direction", other: "{n} directions" },
  pages: { one: "{n} page", other: "{n} pages" },
  tasks: { one: "{n} task in Cron", other: "{n} tasks in Cron" },
  today: { one: "{n} task today", other: "{n} tasks today" },
  emptyPopular: "No direction has pages on the site yet. Start with any — the agent puts the work in its place.",
  emptyActual: "No Cron task is tied to a direction yet. Ask the agent to schedule one — it will appear here.",
  statPages: "pages on the site",
  statActive: "active in Cron",
  statToday: "tasks today",
  emptyItem: "Nothing here yet. Tell the agent in the chat what you want here — it builds the pages on the site and the tasks in Cron.",
  openSite: "Open the site",
  toChat: "Go to the chat",
  toChatHint: "The Mini App closes and you are back in the chat with the agent.",
}

const ru: ProjectsUi = {
  title: "Проекты",
  line: { one: "{n} направление — выберите любое", few: "{n} направления — выберите любое", many: "{n} направлений — выберите любое", other: "{n} направления — выберите любое" },
  all: "Все",
  popular: "Популярные",
  actual: "Актуальные",
  sortLabel: "Порядок",
  started: "начато {n} из {of}",
  more: { one: "ещё {n} направление", few: "ещё {n} направления", many: "ещё {n} направлений", other: "ещё {n} направления" },
  directions: { one: "{n} направление", few: "{n} направления", many: "{n} направлений", other: "{n} направления" },
  pages: { one: "{n} страница", few: "{n} страницы", many: "{n} страниц", other: "{n} страницы" },
  tasks: { one: "{n} задача в Cron", few: "{n} задачи в Cron", many: "{n} задач в Cron", other: "{n} задачи в Cron" },
  today: { one: "{n} задача сегодня", few: "{n} задачи сегодня", many: "{n} задач сегодня", other: "{n} задачи сегодня" },
  emptyPopular: "Пока ни в одном направлении нет страниц сайта. Начните с любого — агент разложит работу по местам.",
  emptyActual: "Пока ни одна задача Cron не привязана к направлению. Попросите агента запланировать — она появится здесь.",
  statPages: "страниц на сайте",
  statActive: "активных в Cron",
  statToday: "задач сегодня",
  emptyItem: "Здесь пока пусто. Расскажите агенту в чате, что вы хотите здесь сделать, — он соберёт страницы на сайте и задачи в Cron.",
  openSite: "Открыть сайт",
  toChat: "Перейти в чат",
  toChatHint: "Мини-приложение закроется, и вы вернётесь в чат с агентом.",
}

const ALL: Record<string, ProjectsUi> = { en, ru }

export const projectsUi = (lang: string): ProjectsUi => ALL[lang] ?? en
