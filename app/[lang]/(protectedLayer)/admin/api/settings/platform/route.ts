// @api read and change this element own site switches when CONFIG is off
import { NextRequest, NextResponse } from "next/server"
import { revalidatePath } from "next/cache"
import { getSession } from "@/lib/auth/get-session"
import { getPlatformConfig } from "@/config/platform-config"
import { linkOn } from "@/lib/own-site"
import { writeFeaturesPatch } from "@/lib/architect/site-config-writer"

// СВОИ ВЫКЛЮЧАТЕЛИ САЙТА ЭЛЕМЕНТА (шаг 579-2). Слово владельца 2026-10-23: «когда пользователь выбирает режим завод приложений
// ему нужно место в котором он точно также настраивает все эти вещи»; переключатели функций — «Перенести (Рекомендую)».
// Островки — копии редакторов CONFIG (`admin/_components/site-settings-editors/`): шапка, подвал, функции, баннер cookie.
//
// 🔒 ФОРМА ТЕЛА — КАК У CONFIG: выключатели плоско (`{ "topMenu": true }`), а файл элемента держит их в ветке `features`
// (`config/platform-config.ts`, `asPlatformFile`). Перевод — здесь, в одном месте; ответ — тоже плоско, действующие значения.
// 🔒 ПИШУТ АРХИТЕКТОР И АДМИНИСТРАТОР ЭТОГО ПРИЛОЖЕНИЯ (580-4, владелец 2026-10-24) И ТОЛЬКО ПРИ ВЫКЛЮЧЕННОЙ СВЯЗИ С CONFIG (как
// `settings/app`, 324-8): пока связь включена, выключатели
// приходят копией CONFIG — 409 `config-connected`. Незнакомый ключ — 400: закрытый список ключей — `FEATURE_DEFAULTS`.
// Дверь уровня элемента `app/api/settings/platform` (индикатор ширины, 333-4) не тронута. 712-1: запись — общая с дверью ядра
// `app/api/settings/features` (`lib/architect/site-config-writer.ts`).
export const dynamic = "force-dynamic"

async function architect(req: NextRequest): Promise<200 | 401 | 403> {
  const s = await getSession(req)
  if (!s) return 401
  return (s.roles ?? []).some((r) => r === "architect" || r === "admin") ? 200 : 403
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
  const r = writeFeaturesPatch(patch)
  if (!r.ok) return NextResponse.json(r, { status: r.reason === "write-failed" ? 500 : 400 })
  revalidatePath("/", "layout")
  revalidatePath("/[lang]", "layout")
  revalidatePath("/api/shell/[lang]", "page")
  revalidatePath("/api/menu/[lang]", "page")
  return NextResponse.json({ ok: true, config: flat() }, { headers: { "Cache-Control": "no-store" } })
}
