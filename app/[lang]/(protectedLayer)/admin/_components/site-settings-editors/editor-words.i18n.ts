// СЛОВА СВОИХ НАСТРОЕК САЙТА ЭЛЕМЕНТА (шаг 579-2). Подписи и пояснения выключателей — дословно со страницы «Функции» CONFIG
// (`widget-dynamic-config-features`); слова состояний и окна — про этот элемент. Словарь серверный: островки получают строки пропсами.
// Порождён scratchpad-скриптом шага 579-2 один раз; дальше правится как обычный файл.
import type { AccessWords } from './settings-access'

type Guard = { title: string; text: string }
type Words = {
  note: string
  features: { key: string; label: string; hint?: string; guard?: Guard }[]
  access: AccessWords
  features_words: Record<'saved' | 'saveFailed' | 'guardLinks' | 'guardCopy' | 'guardCopied' | 'guardConfirm' | 'guardProceed' | 'guardCancel' | 'linkSite' | 'linkAdmin' | 'linkCore', string>
}

const WORDS: Record<'en' | 'ru', Words> = {
  "en": {
    "note": "A change is saved at once.",
    "features": [
      {
        "key": "topMenu",
        "label": "Top menu",
        "hint": "The menu at the top of every page.",
        "guard": {
          "title": "Switching off the top menu",
          "text": "Without the top menu the parts of the project are reachable only by direct links. Remember or copy them before you continue."
        }
      },
      {
        "key": "footerPages",
        "label": "Footer pages",
        "hint": "Legal and information pages linked from the footer."
      },
      {
        "key": "cookieBanner",
        "label": "Cookie banner",
        "hint": "The consent message for visitors."
      },
      {
        "key": "offlineCache",
        "label": "Offline copy",
        "hint": "Pages a visitor has seen open without a connection."
      },
      {
        "key": "auth",
        "label": "Sign-in",
        "hint": "The sign-in button and the visitor cabinet.",
        "guard": {
          "title": "Switching off sign-in",
          "text": "Without the sign-in button there is no drawer and no way to the architect pages from the site. The parts of the project are reachable only by direct links. Remember or copy them before you continue."
        }
      },
      {
        "key": "breadcrumbs",
        "label": "Breadcrumbs",
        "hint": "The path to the page above its title."
      },
      {
        "key": "faq",
        "label": "Questions and answers",
        "hint": "The FAQ section on the pages that have it."
      },
      {
        "key": "themeToggle",
        "label": "Theme switch",
        "hint": "Light and dark theme for the visitor."
      },
      {
        "key": "widthToggle",
        "label": "Width switch",
        "hint": "Narrow or wide page for the visitor."
      },
      {
        "key": "languageSwitcher",
        "label": "Language switch",
        "hint": "The choice of language in the header."
      },
      {
        "key": "socials",
        "label": "Social links",
        "hint": "Links to the project in social networks."
      },
      {
        "key": "viewportBadge",
        "label": "Screen width badge",
        "hint": "A small badge with the screen width, for checking layouts."
      }
    ],
    "access": {
      "loading": "Loading the settings…",
      "signin": "Sign in as the architect to see and change the settings of this element.",
      "signinLink": "Sign in",
      "forbidden": "You are signed in, but only the architect can see and change the settings of this element.",
      "unavailable": "The sign-in service is not answering right now. Try again in a minute.",
      "error": "The settings could not be read. Nothing was changed.",
      "linked": "This element takes its site settings from the shared CONFIG element of the node, so they are changed there. To keep settings of its own, turn off the link to CONFIG in the element’s settings in the core; then this page edits them.",
      "linkedConfig": "Open the shared CONFIG",
      "linkedSettings": "Links of this element"
    },
    "features_words": {
      "saved": "Saved. The pages of this element show it after a reload.",
      "saveFailed": "Not saved — try again.",
      "guardLinks": "Direct links to this element:",
      "guardCopy": "Copy the links",
      "guardCopied": "Copied",
      "guardConfirm": "I have saved these links",
      "guardProceed": "Switch off",
      "guardCancel": "Cancel",
      "linkSite": "The site of this element",
      "linkAdmin": "The architect pages of this element",
      "linkCore": "The core of the node"
    }
  },
  "ru": {
    "note": "Изменение сохраняется сразу.",
    "features": [
      {
        "key": "topMenu",
        "label": "Верхнее меню",
        "hint": "Меню вверху каждой страницы.",
        "guard": {
          "title": "Выключение верхнего меню",
          "text": "Без верхнего меню части проекта будут доступны только по прямым ссылкам. Запомните или скопируйте их, прежде чем продолжить."
        }
      },
      {
        "key": "footerPages",
        "label": "Страницы подвала",
        "hint": "Юридические и справочные страницы по ссылкам из подвала."
      },
      {
        "key": "cookieBanner",
        "label": "Куки-баннер",
        "hint": "Сообщение о согласии для посетителей."
      },
      {
        "key": "offlineCache",
        "label": "Офлайн-копия",
        "hint": "Уже открытые посетителем страницы работают без сети."
      },
      {
        "key": "auth",
        "label": "Вход",
        "hint": "Кнопка входа и кабинет посетителя.",
        "guard": {
          "title": "Выключение входа",
          "text": "Без кнопки входа не будет выдвижного ящика и перехода на страницы архитектора с сайта. Части проекта будут доступны только по прямым ссылкам. Запомните или скопируйте их, прежде чем продолжить."
        }
      },
      {
        "key": "breadcrumbs",
        "label": "Хлебные крошки",
        "hint": "Путь к странице над её заголовком."
      },
      {
        "key": "faq",
        "label": "Вопросы и ответы",
        "hint": "Раздел вопросов на страницах, где он есть."
      },
      {
        "key": "themeToggle",
        "label": "Переключатель темы",
        "hint": "Светлая и тёмная тема для посетителя."
      },
      {
        "key": "widthToggle",
        "label": "Переключатель ширины",
        "hint": "Узкая или широкая страница для посетителя."
      },
      {
        "key": "languageSwitcher",
        "label": "Переключатель языка",
        "hint": "Выбор языка в шапке."
      },
      {
        "key": "socials",
        "label": "Соцсети",
        "hint": "Ссылки на проект в социальных сетях."
      },
      {
        "key": "viewportBadge",
        "label": "Значок ширины экрана",
        "hint": "Маленький значок с шириной экрана — для проверки раскладки."
      }
    ],
    "access": {
      "loading": "Загружаю настройки…",
      "signin": "Войдите как архитектор, чтобы видеть и менять настройки этого элемента.",
      "signinLink": "Войти",
      "forbidden": "Вы вошли, но видеть и менять настройки этого элемента может только архитектор.",
      "unavailable": "Служба входа сейчас не отвечает. Попробуйте через минуту.",
      "error": "Настройки не удалось прочитать. Ничего не изменено.",
      "linked": "Этот элемент берёт настройки сайта из общего элемента CONFIG узла, поэтому меняют их там. Чтобы вести свои настройки, выключите связь с CONFIG в настройках элемента в ядре; тогда их меняют на этой странице.",
      "linkedConfig": "Открыть общий CONFIG",
      "linkedSettings": "Связи этого элемента"
    },
    "features_words": {
      "saved": "Сохранено. Страницы этого элемента покажут это после обновления.",
      "saveFailed": "Не сохранилось — попробуйте ещё раз.",
      "guardLinks": "Прямые ссылки этого элемента:",
      "guardCopy": "Скопировать ссылки",
      "guardCopied": "Скопировано",
      "guardConfirm": "Я сохранил эти ссылки",
      "guardProceed": "Выключить",
      "guardCancel": "Отмена",
      "linkSite": "Сайт этого элемента",
      "linkAdmin": "Страницы архитектора этого элемента",
      "linkCore": "Ядро узла"
    }
  }
}

export const siteSettingsEditorWords = (lang: string): Words => (lang === 'ru' ? WORDS.ru : WORDS.en)
