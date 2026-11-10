import { readFileSync } from "node:fs"
import { join } from "node:path"

// ИМЯ ЭТОГО ЭЛЕМЕНТА — ИЗ ЕГО ПАСПОРТА, ПРИ ЗАПУСКЕ (шаг 314-2).
//
// 🔒 НЕ ЗАШИВАТЬ И НЕ ЗАПЕКАТЬ СБОРКОЙ. Шаблон собирается один раз, а готовая сборка копируется в каждый новый элемент;
// имя, запечённое в сборку, у всех рождённых элементов было бы одним и тем же. ✗ Найдено при чистке шаблона: подписка на
// сигналы CONFIG и «Дизайна» стояла на имени "root", а у источника ОДНА запись на подписчика — рождённый элемент
// перехватил бы подписку сайта, и сайт перестал бы получать смену темы.
// Порядок: паспорт `OWN-SERVICE-PROPS/OWN-SERVICE-PROPS.json` в папке запуска → переменная `ITEM_ID` → `null` (имени нет — не подписываться).

let cached: string | null | undefined

export function ownId(): string | null {
  if (cached !== undefined) return cached
  try {
    const p = JSON.parse(readFileSync(join(process.cwd(), "OWN-SERVICE-PROPS", "OWN-SERVICE-PROPS.json"), "utf8")) as { id?: unknown }
    if (typeof p.id === "string" && p.id.trim()) return (cached = p.id.trim())
  } catch { /* паспорта нет рядом — смотрим окружение */ }
  const env = process.env.ITEM_ID?.trim()
  return (cached = env || null)
}

// ИМЯ ПРОЕКТА ДЛЯ ЛЮДЕЙ — ПОЛЕ `name` ТОГО ЖЕ ПАСПОРТА (шаг 714-3). Читается при отрисовке страницы, не при сборке шаблона: у
// рождённого элемента своё имя («Глина и огонь»), у шаблона — своё. Нет имени — `null`, вызывающий берёт имя сайта.
export function ownName(): string | null {
  try {
    const p = JSON.parse(readFileSync(join(process.cwd(), "OWN-SERVICE-PROPS", "OWN-SERVICE-PROPS.json"), "utf8")) as { name?: unknown }
    return typeof p.name === "string" && p.name.trim() ? p.name.trim() : null
  } catch {
    return null
  }
}
