import "server-only"
import { mkdirSync, readFileSync, renameSync, writeFileSync } from "fs"
import { dirname, join } from "path"
import { FEATURE_DEFAULTS } from "@/config/platform-config.defaults"

// ЗАПИСЬ СВОИХ НАСТРОЕК САЙТА ЭЛЕМЕНТА — ОДНА ДЛЯ ДВУХ ДВЕРЕЙ (шаг узла 712-1). Прежде её держали сессионные двери
// `admin/api/settings/{app,platform}` (324-8, 579-2); теперь те же правила зовёт и дверь ядра по ключу `app/api/settings/{app,features}`.
// Владелец 2026-11-09: «ядро всего лишь навсего представляет доступ к … настройкам которые сейчас существуют в элементе. То есть это
// удалённый пульт управления». Две копии записи разошлись бы при первой правке — поэтому писатель один.
//
// 🔒 ЗАПЛАТА — JSON MERGE PATCH: `null` удаляет ключ, незнакомые ключи файла не трогаются; концы строк файла сохраняются (файлы живут в
// git элемента — смена CRLF на LF была бы правкой без содержания); запись атомарна через временный файл. `url` здесь не правится:
// адрес элемента задаёт узел («Главный адрес»).

const APP_FILE = () => process.env.APP_CONFIG_PATH ?? join(process.cwd(), "APP-CONFIG", "app-config.json")
const PLATFORM_FILE = () => process.env.PLATFORM_CONFIG_PATH ?? join(process.cwd(), "PLATFORM-CONFIG", "platform-config.json")

export type SiteWrite = { ok: true } | { ok: false; reason: "bad-body" | "bad-key" | "write-failed"; key?: string }

const isObj = (v: unknown): v is Record<string, unknown> => typeof v === "object" && v !== null && !Array.isArray(v)

function mergePatch(target: unknown, patch: unknown): unknown {
  if (!isObj(patch)) return patch
  const out: Record<string, unknown> = isObj(target) ? { ...target } : {}
  for (const [k, v] of Object.entries(patch)) {
    if (v === null) delete out[k]
    else out[k] = mergePatch(out[k], v)
  }
  return out
}

function readFile(file: string): { value: Record<string, unknown>; eol: string } {
  try {
    const text = readFileSync(file, "utf8")
    const parsed: unknown = JSON.parse(text)
    return { value: isObj(parsed) ? parsed : {}, eol: text.includes("\r\n") ? "\r\n" : "\n" }
  } catch {
    // Нет файла — начинаем с пустого: «владелец ещё ничего не решал».
    return { value: {}, eol: "\n" }
  }
}

function writeFile(file: string, next: unknown, eol: string): boolean {
  const tmp = `${file}.${process.pid}.${Date.now()}.tmp`
  try {
    mkdirSync(dirname(file), { recursive: true })
    writeFileSync(tmp, (JSON.stringify(next, null, 2) + "\n").replace(/\n/g, eol), "utf8")
    renameSync(tmp, file)
    return true
  } catch {
    return false
  }
}

/** Заплата `APP-CONFIG` элемента. */
export function writeAppPatch(patch: unknown): SiteWrite {
  if (!isObj(patch)) return { ok: false, reason: "bad-body" }
  const body = { ...patch }
  delete body.url
  const file = APP_FILE()
  const { value, eol } = readFile(file)
  return writeFile(file, mergePatch(value, body), eol) ? { ok: true } : { ok: false, reason: "write-failed" }
}

/**
 * Заплата выключателей: тело плоское (`{ "topMenu": true }`, как у CONFIG), а файл держит их в ветке `features`. Закрытый список ключей —
 * `FEATURE_DEFAULTS`; `null` возвращает выключатель к умолчанию шаблона — «владелец не решал», а не «выключено».
 */
export function writeFeaturesPatch(patch: unknown): SiteWrite {
  if (!isObj(patch)) return { ok: false, reason: "bad-body" }
  for (const [k, v] of Object.entries(patch)) {
    if (!(k in FEATURE_DEFAULTS) || (v !== null && typeof v !== "boolean")) return { ok: false, reason: "bad-key", key: k }
  }
  const file = PLATFORM_FILE()
  const { value, eol } = readFile(file)
  const features: Record<string, unknown> = isObj(value.features) ? { ...value.features } : {}
  for (const [k, v] of Object.entries(patch)) {
    if (v === null) delete features[k]
    else features[k] = v
  }
  return writeFile(file, { ...value, features }, eol) ? { ok: true } : { ok: false, reason: "write-failed" }
}
