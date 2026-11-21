// Words of the widget «Projects» of this element's Telegram Mini App (node step 821). `en` is the base, `ru` the translation; the
// dictionary is the server's — the screens pick one language and pass the sort island only the words it shows.
import type { Plural } from "../../../_libs/words"
import type { AddItemUi } from "../../../_components/tg-add-item.client"
import type { GroupHelpUi } from "../../../_components/tg-help.client"

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
  /** 826: «＋ Добавить» of a group's screen and its window */
  add: AddItemUi
  /** 826: «Справка» at the bottom of a group's screen */
  help: GroupHelpUi
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
  add: {
    button: "Add",
    title: "A new item in «{group}»",
    text: "It appears at once, with no build. Deleting or renaming it is done only through the agent in the chat.",
    name: "Name",
    namePlaceholder: "How you will call it",
    line: "What will live here — one line",
    linePlaceholder: "Optional",
    cancel: "Cancel",
    create: "Add",
    creating: "Adding…",
    done: "Added: {name}",
    errors: {
      "no-title": "Write a name.",
      "title-long": "The name is at most 60 characters.",
      "line-long": "The line is at most 120 characters.",
      full: "This direction already has 60 items — more would not fit a phone screen.",
      taken: "An item with this name is already here.",
      forbidden: "Only the element's administrator can add items.",
      "broken-file": "The agent is editing this list right now. Try again in a minute, or tell the agent in the chat.",
      failed: "Could not add it. Try again.",
    },
  },
  help: {
    button: "Help",
    title: "Help · {group}",
    notHere: "Not here",
    how: "How it works",
    cron: "Cron",
    points: [
      "«Add» — a new item appears at once, with no build.",
      "Deleting or renaming an item — only through the agent: tell it in the chat.",
      "An item's work is pages of the site or of «Administration» and Cron tasks with its tag — the agent puts them there itself.",
      "«Go to the chat» from an item — the agent knows which project you mean.",
    ],
  },
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
  add: {
    button: "Добавить",
    title: "Новый пункт в «{group}»",
    text: "Пункт появится сразу, без сборки. Удалить или переименовать его можно только через агента в чате.",
    name: "Название",
    namePlaceholder: "Как назовёте пункт",
    line: "Что здесь будет — одна строка",
    linePlaceholder: "Необязательно",
    cancel: "Отмена",
    create: "Добавить",
    creating: "Добавляю…",
    done: "Добавлено: {name}",
    errors: {
      "no-title": "Напишите название.",
      "title-long": "Название — не длиннее 60 знаков.",
      "line-long": "Строка — не длиннее 120 знаков.",
      full: "В этом направлении уже 60 пунктов — больше не поместится на экране телефона.",
      taken: "Пункт с таким названием уже есть.",
      forbidden: "Добавлять пункты может только администратор элемента.",
      "broken-file": "Этот список сейчас правит агент. Попробуйте через минуту или скажите агенту в чате.",
      failed: "Не получилось добавить. Попробуйте ещё раз.",
    },
  },
  help: {
    button: "Справка",
    title: "Справка · {group}",
    notHere: "Не сюда",
    how: "Как здесь работать",
    cron: "Cron",
    points: [
      "«Добавить» — новый пункт появится сразу, без сборки.",
      "Удалить или переименовать пункт можно только через агента: скажите ему в чате.",
      "Работа пункта — это страницы сайта или «Администрирования» и задачи Cron с его меткой. Агент ставит их сам.",
      "«Перейти в чат» из пункта — агент поймёт, о каком проекте речь.",
    ],
  },
}

const ALL: Record<string, ProjectsUi> = { en, ru }

export const projectsUi = (lang: string): ProjectsUi => ALL[lang] ?? en
