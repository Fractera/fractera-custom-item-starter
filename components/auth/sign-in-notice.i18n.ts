// Слова плашки, которая встречает человека на сайте после входа (260-3).
// Два языка — основа и перевод; остальные читают английский (закон линии WEB4, шаг 255).
// {who} — почта вошедшего, {role} — одна роль, выбранная правилом `pickRole` островка.

export type SignInNoticeStrings = {
  signedIn: string
  failed: string
  /** 778: вошедший без роли пришёл со страниц управления элементом. */
  noAccess: string
  /** 778: как назвать роль админа этого элемента в плашке «вы вошли». */
  elementAdmin: string
}

const STRINGS: Record<string, SignInNoticeStrings> = {
  en: {
    signedIn: "You're signed in as {who}. Role: {role}.",
    failed: "Sign-in was not confirmed. Please try again.",
    noAccess: "That page is open only to the administrator and the project's architect.",
    elementAdmin: "administrator",
  },
  ru: {
    signedIn: "Вы вошли как {who}. Роль: {role}.",
    failed: "Вход не подтвердился. Попробуйте ещё раз.",
    noAccess: "Эта страница открыта только администратору и архитектору проекта.",
    elementAdmin: "администратор",
  },
}

export function signInNoticeStrings(lang: string): SignInNoticeStrings {
  return STRINGS[lang] ?? STRINGS.en
}
