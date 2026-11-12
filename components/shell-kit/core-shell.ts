import "server-only"
import { cache } from "react"
import { coreUrl } from "@/lib/a2a/log"
import { slotHasGroups } from "@/lib/menu/group-menus"
import { siteShellData } from "@/lib/shell/site-shell-data"
import { topMenuUi } from "@/components/menu/top/top-menu.i18n"

// ЗАГЛУШКА ИНСТРУМЕНТА ЯДРА «ОБОЛОЧКА ПРОЕКТА» (узел, шаг 727-2). Слово владельца 2026-11-11: «мы только в одном месте должны делать
// обновления а все остальные элементы должны получить его нативно». Шапку и подвал этого элемента рисует КОД ЯДРА, а ДАННЫЕ — свои:
// `siteShellData(язык)` из настроек элемента и подписи его боковых ящиков. Ядро отвечает готовым HTML, пропсами для оживления и
// именами двух файлов (JS и CSS); браузер берёт их через свою же дверь `/shell-kit/<файл>` (`app/shell-kit/[file]/route.ts`).
//
// 🔒 ЭЛЕМЕНТ ЖИВЁТ БЕЗ ЯДРА: ядро молчит, ключа нет, ответ не тот — `null`, и макет рисует свою шапку и подвал (`components/shell/`).
// 🔒 СТАТИЧЕСКАЯ СТРАНИЦА: вопрос задаётся при отрисовке макета (сборка и ISR раз в `revalidate`), не в браузере и не на каждый запрос.
// 🔒 ОТВЕТ ЯДРА ЖИВЁТ В КЭШЕ ЗАПРОСОВ NEXT `SHELL_TTL` секунд (✗ измерено 2026-11-12: без явного срока Next всё равно кэшировал его
// на 300 с): ядро ненадолго молчит — страница остаётся с последней шапкой ядра, а не прыгает на свою. Ядро хранит файлы прежних версий
// инструмента (`scripts/build-shell-kit.mjs` ядра), поэтому закэшированная страница не теряет свой JS и CSS после пересборки ядра.
// Как отказаться от заглушки и нарисовать своё — `components/shell-kit/README.md`.
export type CoreShell = {
  version: string
  html: { header: string; footer: string }
  props: unknown
  assets: { js: string; css: string }
}

const SHELL_TTL = 300
const ASSET = /^shell-kit\.[0-9a-f]{10}\.(js|css)$/

export function shellDrawers(lang: string) {
  const ui = topMenuUi(lang)
  return {
    left: slotHasGroups("left", lang) ? { open: ui.openLeft, close: ui.closeLeft } : undefined,
    right: slotHasGroups("right", lang) ? { open: ui.openRight, close: ui.closeRight } : undefined,
  }
}

// Один вопрос к ядру на отрисовку языка: шапка и подвал берут один и тот же ответ (`cache` React — на время одной отрисовки).
export const loadCoreShell = cache(async (lang: string): Promise<CoreShell | null> => {
  const core = coreUrl()
  const key = process.env.SETTINGS_SECRET?.trim()
  // ✗ 727-3: молча возвращённый `null` выглядел как «ядро ответило, но фрагмента нет» — агент элемента искал причину не там. Без адреса
  // ядра или ключа заглушка говорит, чего не хватает (обычно это сервер разработки без окружения узла).
  if (!core || !key) {
    const missing = [!core && "the core's address (NODE_DOMAIN_FILE → logs/runtime.json)", !key && "the node key (SETTINGS_SECRET)"].filter(Boolean).join(" and ")
    console.warn(`[shell-kit] ${lang}: no ${missing} — the core is not asked, own header and footer`)
    return null
  }
  try {
    const r = await fetch(`${core}/api/shell-kit/${encodeURIComponent(lang)}`, {
      method: "POST",
      headers: { "content-type": "application/json", "x-node-key": key },
      body: JSON.stringify({ data: siteShellData(lang), surface: {}, path: `/${lang}`, drawers: shellDrawers(lang) }),
      signal: AbortSignal.timeout(4000),
      next: { revalidate: SHELL_TTL },
    })
    if (!r.ok) {
      console.warn(`[shell-kit] ${lang}: the core answered ${r.status} — own header and footer`)
      return null
    }
    const b = (await r.json()) as Partial<CoreShell> & { ok?: boolean }
    const okHtml = typeof b.html?.header === "string" && typeof b.html?.footer === "string"
    const okAssets = !!b.assets && ASSET.test(b.assets.js) && ASSET.test(b.assets.css)
    if (!b.ok || !okHtml || !okAssets || typeof b.version !== "string") {
      console.warn(`[shell-kit] ${lang}: the core's answer is not a shell kit — own header and footer`)
      return null
    }
    return { version: b.version, html: b.html!, props: b.props, assets: b.assets! }
  } catch (e) {
    console.warn(`[shell-kit] ${lang}: the core did not answer (${(e as Error).message}) — own header and footer`)
    return null
  }
})

/** Пропсы в `<script type="application/json">`: `<` экранирован, чтобы строка данных не закрыла тег. */
export function propsJson(props: unknown): string {
  return JSON.stringify(props).replace(/</g, "\\u003c")
}
