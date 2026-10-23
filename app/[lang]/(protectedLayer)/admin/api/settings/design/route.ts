// @api read and change this element own design when the shared Design is off
import { NextRequest, NextResponse } from "next/server"
import { revalidatePath } from "next/cache"
import { getSession } from "@/lib/auth/get-session"
import { linkOn } from "@/lib/own-site"
import { readRawDesignConfig, writeDesignPatch } from "@/lib/architect/design-config-writer"

// СВОЁ ОФОРМЛЕНИЕ ЭЛЕМЕНТА (шаг 579-1). Слово владельца 2026-10-23: «когда пользователь отключает дизайн нужно иметь внутри
// приложения такую конструкцию которая позволяет внутри одного элемента делать все то же самое». Редакторы — копия элемента
// «Дизайн» (`admin/_components/design-editors/`); они ходят сюда: `GET/PATCH /<lang>/admin/api/settings/design`.
//
// 🔒 ПИШЕТ ТОЛЬКО АРХИТЕКТОР И ТОЛЬКО ПРИ ВЫКЛЮЧЕННОЙ СВЯЗИ С «ДИЗАЙНОМ». Пока связь включена, оформление приходит из общего
// элемента и при первом его сигнале ляжет поверх правки здесь — принять её значило бы пообещать несбыточное: 409
// `design-connected` (тот же закон, что у двери настроек сайта, 324-8).
// 🔒 ЗАПЛАТА — JSON MERGE PATCH, глубокая (две темы цветов правятся порознь), `null` возвращает ключ к умолчанию; пишет
// `lib/architect/design-config-writer.ts` — единственный писатель `DESIGN-CONFIG` в этом слое. Файл — `DESIGN_CONFIG_PATH`.
// 🔒 ПОСЛЕ ЗАПИСИ СТРАНИЦЫ ПЕРЕРИСОВЫВАЮТСЯ — без сборки: оформление читается при отрисовке (`config/design-config.ts`), как
// после сигнала общего «Дизайна» (`app/api/settings/changed`). Соседям ничего не рассылается: это оформление одного элемента.
// Дверь ядра по ключу `app/api/settings/design` (280-6) не тронута — её зовёт ядро.
export const dynamic = "force-dynamic"

async function architect(req: NextRequest): Promise<200 | 401 | 403> {
  const s = await getSession(req)
  if (!s) return 401
  return s.roles?.includes("architect") ? 200 : 403
}

export async function GET(req: NextRequest) {
  const a = await architect(req)
  if (a !== 200) return NextResponse.json({ ok: false }, { status: a })
  return NextResponse.json({ ok: true, linked: linkOn("design"), config: readRawDesignConfig() }, { headers: { "Cache-Control": "no-store" } })
}

export async function PATCH(req: NextRequest) {
  const a = await architect(req)
  if (a !== 200) return NextResponse.json({ ok: false }, { status: a })
  if (linkOn("design")) return NextResponse.json({ ok: false, reason: "design-connected" }, { status: 409 })
  let patch: unknown
  try { patch = await req.json() } catch { return NextResponse.json({ ok: false, reason: "bad-body" }, { status: 400 }) }
  const result = writeDesignPatch(patch)
  if (!result.ok) return NextResponse.json(result, { status: result.reason === "bad-body" ? 400 : 500 })
  revalidatePath("/", "layout")
  revalidatePath("/[lang]", "layout")
  revalidatePath("/api/shell/[lang]", "page")
  return NextResponse.json({ ok: true, config: result.config }, { headers: { "Cache-Control": "no-store" } })
}
