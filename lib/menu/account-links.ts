import { branchChild, wordsIn } from "@/lib/page-tree"
import type { ShellLink as DrawerLink } from "@/components/shell/shell-types"
// The architect pages live in the node's core (280); /<lang>/architect redirects there.
const ARCHITECT_HOME = "/architect"
const ARCHITECT_TITLE: Record<string, string> = {
  en: "The architect group of pages",
  ru: "Группа страниц архитектора",
}
import { ARCHITECT_LAYER_ROLES, PROTECTED_GROUP_ROLES } from "@/lib/roles"

// РАБОЧИЕ РАЗДЕЛЫ, которые ящик аккаунта показывает вошедшему.
//
// Здесь, а не в самом ящике: ящик — переиспользуемая часть продукта на 82 языках,
// а этот список — страницы КОНКРЕТНОГО проекта. Клиент, которому товары не нужны,
// удаляет строку отсюда и не трогает общий компонент.
//
// 🔒 ЗАЧЕМ ЭТО ВООБЩЕ ПОЯВИЛОСЬ. Страница менеджера существовала с самого начала и
// не была связана НИ ОДНОЙ ссылкой: попасть в неё можно было, только набрав адрес
// руками. Менеджер, вошедший под своей ролью, свою же таблицу не находил. Дефект
// обнаружился, когда публичная витрина заняла адрес `/[lang]/products` и страница
// переехала в `/[lang]/manage/products`: старый адрес молча стал открывать витрину.
//
// 🔒 ПУНКТ НАЗЫВАЕТ СВОЙ СЛОЙ, А НЕ СПИСОК РОЛЕЙ. Роли слоя знает `lib/roles.ts`,
// и ящик спрашивает их там же — поэтому пункт физически не может разойтись с
// дверью, которую открывает. Перечисли роли здесь копией, и однажды пункт начнёт
// либо дразнить отказом, либо прятать доступное.
//
// Видимость — вежливость, а не защита: замок стоит на самой странице
// (`layout.tsx` подгруппы) и в маршрутах данных.
//
// 🔒 ЭТОТ ФАЙЛ — ЕДИНСТВЕННОЕ МЕСТО, КОТОРОМУ ПОЗВОЛЕНО ЗНАТЬ ПРО СТРАНИЦЫ РАЗНЫХ
// ГРУПП. Он и существует ради этого: собрать меню из того, что построено. Сами
// группы друг о друге по-прежнему не знают ничего.
//
// Слова каждого пункта живут при своей странице (её `_data/ui.i18n.ts`), а не в
// словаре ящика: это строка одной страницы, и языков у неё столько же, сколько у
// страницы, — не 82 впрок.
// 580-4 (владелец 2026-10-24: «на этой вкладке кроме учётной записи нужно добавить вкладку блоки, дизайн, конфигуратор, для роли
// администратор и для роли архитектор … именно администратору этой организации а не любому администратору»). Пункт — ребёнок ветки
// admin, подпись — из данных страницы, роли — слоя администрирования (`PROTECTED_GROUP_ROLES.admin`). Что администратор именно ЭТОЙ
// организации, решает служба входа: на сайт приложения чужой администратор не входит вовсе («Конфигуратор» владельца — страница
// «Настройки сайта», `admin/_pages/site-settings`).
const ADMIN_PAGES = ["users", "blocks", "design", "site-settings"] as const

function adminLinks(lang: string): DrawerLink[] {
  return ADMIN_PAGES.flatMap((slug) => {
    const page = branchChild(["(protectedLayer)", "admin"], slug)
    return page ? [{ href: `/${lang}/admin/${slug}`, label: wordsIn(page, lang).title, roles: PROTECTED_GROUP_ROLES.admin }] : []
  })
}

// 459 (владелец 2026-10-12): «H2H Messenger – H2A Messenger … установи их выше чем кнопки группа страниц … доступны только при
// входе архитектора». Названия одинаковы на всех языках; ведут на защищённые ветки messenger-h2h и messenger-h2a.
const MESSENGERS = [
  { href: "/messenger-h2h", label: "H2H Messenger" },
  { href: "/messenger-h2a", label: "H2A Messenger" },
]

// 645-3 (владелец 2026-11-04, после первой установки глазами нового человека): «в нём сейчас огромное количество мусора который мы
// ещё не используем: нужно скрыть все вкладки, а вместо них создать: – как это работает – подписка Cloud Code – терминал – активация
// Telegram»; «Группа страниц архитектора» — пятой («Оставить пятым»). Четыре страницы живут в ядре: `/<lang>/architect/...` этого
// сайта уводит туда (280). Тот же набор — в ящике ядра (`lib/menu/account-links.ts` ядра, 645-2).
// Подписи — слова владельца; страница ядра «Telegram-бот» в ящике зовётся «Активация Telegram».
const OWNER_PAGES: { path: string; label: Record<string, string> }[] = [
  { path: "passport/how-it-works", label: { en: "How it works", ru: "Как это работает" } },
  { path: "build/subscription", label: { en: "Claude Code subscription", ru: "Подписка Claude Code" } },
  { path: "build/terminal", label: { en: "Terminal", ru: "Терминал" } },
  { path: "build/telegram", label: { en: "Telegram activation", ru: "Активация Telegram" } },
]

export function accountLinks(lang: string): DrawerLink[] {
  return [
    ...OWNER_PAGES.map((p) => ({
      href: `/${lang}${ARCHITECT_HOME}/${p.path}`,
      label: p.label[lang] ?? p.label.en,
      roles: ARCHITECT_LAYER_ROLES,
    })),
    // 🔒 СЛОЙ АРХИТЕКТОРА — ТОЛЬКО ЕГО РОЛЯМ (268, слово владельца 2026-09-22: «в правом
    // выпадающем ящике Account сделать кнопку страницы архитектора чтобы я мог быстро на неё переходить»).
    // Адрес, роли и подпись взяты у самого слоя — `ARCHITECT_HOME`, `ARCHITECT_LAYER_ROLES` и его словарь, —
    // а не переписаны сюда: копия разошлась бы с дверью, которую открывает пункт.
    {
      href: `/${lang}${ARCHITECT_HOME}`,
      label: ARCHITECT_TITLE[lang] ?? ARCHITECT_TITLE.en,
      roles: ARCHITECT_LAYER_ROLES,
    },
  ]
}

// 🪦 СКРЫТО, НЕ УДАЛЕНО (645-3): мессенджеры H2H и H2A (459) и страницы администрирования — учётные записи, блоки, дизайн,
// настройки сайта (314-2, 580-4). Страницы живы по своим адресам; вернуть в ящик — `...hiddenAccountLinks(lang)` в список выше,
// по слову владельца.
export function hiddenAccountLinks(lang: string): DrawerLink[] {
  return [
    ...MESSENGERS.map((m) => ({ href: `/${lang}${m.href}`, label: m.label, roles: ARCHITECT_LAYER_ROLES })),
    ...adminLinks(lang),
  ]
}
