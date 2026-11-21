import { branchChild, wordsIn } from "@/lib/page-tree"
import type { ShellLink as DrawerLink } from "@/components/shell/shell-types"
// The architect pages live in the node's core (280); /<lang>/architect redirects there.
const ARCHITECT_HOME = "/architect"
const ARCHITECT_TITLE: Record<string, string> = {
  en: "The architect group of pages",
  ru: "Группа страниц архитектора",
}
import { ARCHITECT_LAYER_ROLES, PROTECTED_GROUP_ROLES } from "@/lib/roles"
import { ownId } from "@/lib/own-id"
import { projects } from "@/app/[lang]/(protectedLayer)/tg/_libs/projects"

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
const ADMIN_PAGES = ["users", "body", "design", "site-settings"] as const

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

// 564 (владелец 2026-10-21: «Кнопка находится в правом выдвижном ящике … должна посылать прямо на субдомен типа: architect.domain»):
// у элемента со своей веткой /<язык>/architect (config, design) путь без адреса ядра оставался на субдомене элемента. 660: и у всех
// остальных — относительная ссылка уходила 307 в ядро на другой порт, и предзагрузка Next.js в открытом ящике давала ошибки CORS
// (замер на узле владельца: 10 в консоли). Адрес ядра —
// ARCHITECT_URL от установщика узла; нет его — прежний путь (у сайта и прочих он перенаправляет в ядро).
const ARCHITECT_URL = (process.env.ARCHITECT_URL ?? "").replace(/[/]+$/, "")
const architectHref = (lang: string, path = "") => `${ARCHITECT_URL}/${lang}${ARCHITECT_HOME}${path ? `/${path}` : ""}`

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

// 834-5/6 (the owner of the node, Telegram 641, 644, 646, 648): the element's own admin manages its agent from this drawer and watches its
// projects on a wide screen — «управляет она через Telegram а просматривает она на широком компьютере». For the architect and this
// element's own admin: «Дашборд» (the element's home), «Проекты» (only the pages already built for a project — the Mini App's map, with
// nothing empty), then its agent's four pages in the core's bare frame `/<lang>/element-agent/<id>/<page>` (core step 834-4): only this
// element, nothing else of the node.
const AGENT_PAGES: { page: string; label: Record<string, string> }[] = [
  { page: "subscription", label: { en: "Claude Code subscription", ru: "Подписка Claude Code" } },
  { page: "terminal", label: { en: "Terminal", ru: "Терминал" } },
  { page: "telegram", label: { en: "Telegram bot", ru: "Telegram-бот" } },
  { page: "openai", label: { en: "OpenAI key", ru: "Ключ OpenAI" } },
]
const MAIN_AGENT: Record<string, string> = { en: "Main agent", ru: "Главный агент" }
const OWN_WORDS: Record<string, { dashboard: string; projects: string; none: string }> = {
  en: { dashboard: "Dashboard", projects: "Projects", none: "No project pages built yet" },
  ru: { dashboard: "Дашборд", projects: "Проекты", none: "Пока нет построенных страниц" },
}

/** The pages built for the person's projects, one link each: «<item>» (a second page of it — «<item> · 2»). */
function projectPages(lang: string): DrawerLink[] {
  const out: DrawerLink[] = []
  try {
    for (const s of projects(lang)) for (const g of s.groups) for (const it of g.items) {
      if (it.site) out.push({ href: it.site, label: `${g.title} · ${it.title}` })
    }
  } catch { /* the Mini App's catalog is missing — no projects in the drawer */ }
  return out
}

function ownAgentLinks(lang: string): DrawerLink[] {
  const w = OWN_WORDS[lang] ?? OWN_WORDS.en
  const roles = PROTECTED_GROUP_ROLES.admin
  const id = ownId()
  const built = projectPages(lang)
  return [
    { href: `/${lang}`, label: w.dashboard, roles },
    // 834-11 (the owner, Telegram 664: «ты не представил ниже дашборд вкладку проекта»): always there — nothing built yet says so
    { href: `/${lang}#projects`, label: w.projects, roles, children: built.length ? built : [{ href: "", label: w.none }] },
    ...(id && ARCHITECT_URL ? AGENT_PAGES.map((p) => ({ href: `${ARCHITECT_URL}/${lang}/element-agent/${id}/${p.page}`, label: p.label[lang] ?? p.label.en, roles })) : []),
  ]
}

export function accountLinks(lang: string): DrawerLink[] {
  return [
    ...ownAgentLinks(lang),
    // 834-8 (✗ seen 2026-11-21 21:15 on j58fl: «Подписка Claude Code» and «Терминал» twice in the architect's drawer — the element's
    // and the main agent's): the main agent's pages fold into one list «Главный агент ▸», the architect's only.
    {
      href: architectHref(lang, "build"),
      label: MAIN_AGENT[lang] ?? MAIN_AGENT.en,
      roles: ARCHITECT_LAYER_ROLES,
      children: OWNER_PAGES.map((p) => ({ href: architectHref(lang, p.path), label: p.label[lang] ?? p.label.en })),
    },
    // 🔒 СЛОЙ АРХИТЕКТОРА — ТОЛЬКО ЕГО РОЛЯМ (268, слово владельца 2026-09-22: «в правом
    // выпадающем ящике Account сделать кнопку страницы архитектора чтобы я мог быстро на неё переходить»).
    // Адрес, роли и подпись взяты у самого слоя — `ARCHITECT_HOME`, `ARCHITECT_LAYER_ROLES` и его словарь, —
    // а не переписаны сюда: копия разошлась бы с дверью, которую открывает пункт.
    {
      href: architectHref(lang),
      label: ARCHITECT_TITLE[lang] ?? ARCHITECT_TITLE.en,
      roles: ARCHITECT_LAYER_ROLES,
    },
    // 805 (the owner of the node, 2026-11-19: «отсутствует выпадающем списке возможностью видеть страницы администратора … Если такая
    // страница есть то достаточно добавить просто ссылку»): the admin pages of this element — accounts, design, site settings — for the
    // architect and this element's own admin only (the drawer shows a link only to its roles; the page locks itself too).
    ...adminLinks(lang),
  ]
}

// 🪦 СКРЫТО, НЕ УДАЛЕНО (645-3): мессенджеры H2H и H2A (459) — до Lagrix. Страницы администрирования вернулись в ящик по слову
// владельца (805); вернуть мессенджеры — `...hiddenAccountLinks(lang)` в список выше, по его слову.
export function hiddenAccountLinks(lang: string): DrawerLink[] {
  return MESSENGERS.map((m) => ({ href: `/${lang}${m.href}`, label: m.label, roles: ARCHITECT_LAYER_ROLES }))
}
