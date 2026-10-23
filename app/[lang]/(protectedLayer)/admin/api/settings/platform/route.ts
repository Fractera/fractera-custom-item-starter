// @api read and change this element own site switches when CONFIG is off
import { NextRequest, NextResponse } from "next/server"
import { revalidatePath } from "next/cache"
import { mkdirSync, readFileSync, renameSync, writeFileSync } from "fs"
import { dirname, join } from "path"
import { getSession } from "@/lib/auth/get-session"
import { getPlatformConfig } from "@/config/platform-config"
import { FEATURE_DEFAULTS } from "@/config/platform-config.defaults"
import { linkOn } from "@/lib/own-site"

// СВОИ ВЫКЛЮЧАТЕЛИ САЙТА ЭЛЕМЕНТА (шаг 579-2). Слово владельца 2026-10-23: «когда пользователь выбирает режим завод приложений
// ему нужно место в котором он точно также настраивает все эти вещи»; переключатели функций — «Перенести (Рекомендую)».
// Островки — копии редакторов CONFIG (`admin/_components/site-settings-editors/`): шапка, подвал, функции, баннер cookie.
//
// 🔒 ФОРМА ТЕЛА — КАК У CONFIG: выключатели плоско (`{ "topMenu": true }`), а файл элемента держит их в ветке `features`
// (`config/platform-config.ts`, `asPlatformFile`). Перевод — здесь, в одном месте; ответ — тоже плоско, действующие значения.
// 🔒 ПИШЕТ ТОЛЬКО АРХИТЕКТОР И ТОЛЬКО ПРИ ВЫКЛЮЧЕННОЙ СВЯЗИ С CONFIG (как `settings/app`, 324-8): пока связь включена, выключатели
// приходят копией CONFIG — 409 `config-connected`. Незнакомый ключ — 400: закрытый список ключей — `FEATURE_DEFAULTS`.
// Дверь уровня элемента `app/api/settings/platform` (индикатор ширины, 333-4) не тронута.
export const dynamic = "force-dynamic"

const FILE = process.env.PLATFORM_CONFIG_PATH ?? join(process.cwd(), "PLATFORM-CONFIG", "platform-config.json")
const isObj = (v: unknown): v is Record<string, unknown> => typeof v === "object" && v !== null && !Array.isArray(v)

async function architect(req: NextRequest): Promise<200 | 401 | 403> {
  const s = await getSession(req)
  if (!s) return 401
  return s.roles?.includes("architect") ? 200 : 403
}

const flat = () => ({ ...getPlatformConfig().features })

export async function GET(req: NextRequest) {
  const a = await architect(req)
  if (a !== 200) return NextResponse.json({ ok: false }, { status: a })
  return NextResponse.json({ ok: true, linked: linkOn("config"), config: flat() }, { headers: { "Cache-Control": "no-store" } })
}

export async function PATCH(req: NextRequest) {
  const a = await architect(req)
  if (a !== 200) return NextResponse.json({ ok: false }, { status: a })
  if (linkOn("config")) return NextResponse.json({ ok: false, reason: "config-connected" }, { status: 409 })
  let patch: unknown
  try { patch = await req.json() } catch { return NextResponse.json({ ok: false, reason: "bad-body" }, { status: 400 }) }
  if (!isObj(patch)) return NextResponse.json({ ok: false, reason: "bad-body" }, { status: 400 })
  for (const [k, v] of Object.entries(patch)) {
    if (!(k in FEATURE_DEFAULTS) || (v !== null && typeof v !== "boolean")) {
      return NextResponse.json({ ok: false, reason: "bad-key", key: k }, { status: 400 })
    }
  }
  let current: Record<string, unknown> = {}
  // Концы строк файла сохраняются: PLATFORM-CONFIG живёт в git элемента, смена CRLF на LF была бы правкой без содержания.
  let eol = "\n"
  try {
    const text = readFileSync(FILE, "utf8")
    const parsed = JSON.parse(text)
    if (isObj(parsed)) current = parsed
    if (text.includes("\r\n")) eol = "\r\n"
  } catch { /* нет файла — начинаем с пустого */ }
  const features: Record<string, unknown> = isObj(current.features) ? { ...current.features } : {}
  // `null` возвращает выключатель к умолчанию шаблона — «владелец не решал», а не «выключено».
  for (const [k, v] of Object.entries(patch)) {
    if (v === null) delete features[k]
    else features[k] = v
  }
  const next = { ...current, features }
  const tmp = `${FILE}.${process.pid}.${Date.now()}.tmp`
  try {
    mkdirSync(dirname(FILE), { recursive: true })
    writeFileSync(tmp, (JSON.stringify(next, null, 2) + "\n").replace(/\n/g, eol), "utf8")
    renameSync(tmp, FILE)
  } catch {
    return NextResponse.json({ ok: false, reason: "write-failed" }, { status: 500 })
  }
  revalidatePath("/", "layout")
  revalidatePath("/[lang]", "layout")
  revalidatePath("/api/shell/[lang]", "page")
  revalidatePath("/api/menu/[lang]", "page")
  return NextResponse.json({ ok: true, config: flat() }, { headers: { "Cache-Control": "no-store" } })
}
