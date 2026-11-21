// Words of the Mini App's «Элемент» — what the element lives on as a server (node step 821; the owner's mock v2 D). `en` base, `ru`.
export type ElementUi = {
  title: string; line: string; soon: string
  site: string; openSite: string; openSiteHint: string; design: string; designHint: string; siteSettings: string; siteSettingsHint: string
  people: string; users: string; usersHint: string
  agent: string
  building: string; step: string; noStep: string; deploy: string; deployHint: string
}

const en: ElementUi = {
  title: "Element", line: "everything the element lives on as a server", soon: "soon",
  site: "Site", openSite: "Open the site", openSiteHint: "the element's public pages", design: "Design", designHint: "colours, fonts, the design skill",
  siteSettings: "Site settings", siteSettingsHint: "name, menu, languages, sign-in",
  people: "People", users: "Users", usersHint: "accounts and roles",
  agent: "Agent",
  building: "Building", step: "Current step", noStep: "no steps yet", deploy: "Preview and deploy", deployHint: "accept or roll back",
}

const ru: ElementUi = {
  title: "Элемент", line: "всё, чем элемент живёт как сервер", soon: "скоро",
  site: "Сайт", openSite: "Открыть сайт", openSiteHint: "публичные страницы элемента", design: "Дизайн", designHint: "цвета, шрифты, навык дизайна",
  siteSettings: "Настройки сайта", siteSettingsHint: "название, меню, языки, вход",
  people: "Люди", users: "Пользователи", usersHint: "учётные записи и роли",
  agent: "Агент",
  building: "Строительство", step: "Текущий шаг", noStep: "шагов пока нет", deploy: "Предпросмотр и развёртывание", deployHint: "принять или откатить",
}

const ALL: Record<string, ElementUi> = { en, ru }
export const elementUi = (lang: string): ElementUi => ALL[lang] ?? en
