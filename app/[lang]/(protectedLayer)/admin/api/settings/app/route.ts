// @api read and change this element own site settings when CONFIG is off
import { NextRequest, NextResponse } from "next/server"
import { revalidatePath } from "next/cache"
import { getSession } from "@/lib/auth/get-session"
import { getAppConfig } from "@/config/app-config"
import { linkOn } from "@/lib/own-site"
import { writeAppPatch } from "@/lib/architect/site-config-writer"

// СВОИ НАСТРОЙКИ ЭЛЕМЕНТА (шаг 324-8). Решение владельца 2026-09-28: отключившись от CONFIG, элемент должен иметь свои
// записи и тот же интерфейс настроек — «повторить интерфейс настроек app CONFIG … всё скопировать и адаптировать»;
// вариант «б» — редактор живёт в самом элементе. Островки редактора — копия CONFIG (`components/site-settings/`), и они
// ходят сюда тем же путём, что в CONFIG: `GET/PATCH /<lang>/admin/api/settings/app`.
//
// 🔒 ПИШЕТ ТОЛЬКО АРХИТЕКТОР И ТОЛЬКО ПРИ ОТКЛЮЧЁННОМ CONFIG. Пока связь включена, настройки приходят из CONFIG и лягут
// поверх любой правки здесь — принять её значило бы пообещать несбыточное: ответ 409 `config-connected`.
// 🔒 ЗАПЛАТА — JSON MERGE PATCH (как у CONFIG): `null` удаляет ключ. Файл — `APP_CONFIG_PATH` (абсолютный путь от
// установщика: собранный сервер работает из папки сборки). `url` не правится здесь: адрес элемента задаёт узел
// («Главный адрес»). После записи страницы перерисовываются. 712-1: запись — общая с дверью ядра (`lib/architect/site-config-writer.ts`).
export const dynamic = "force-dynamic"

// 580-4: архитектор и администратор этого приложения (владелец 2026-10-24: «расширяем право доступа для администрирования
// администратору этой организации»); чужого администратора служба входа на сайт приложения не пускает.
async function architect(req: NextRequest): Promise<200 | 401 | 403> {
  const s = await getSession(req)
  if (!s) return 401
  return (s.roles ?? []).some((r) => r === "architect" || r === "admin") ? 200 : 403
}

export async function GET(req: NextRequest) {
  const a = await architect(req)
  if (a !== 200) return NextResponse.json({ ok: false }, { status: a })
  return NextResponse.json({ ok: true, linked: linkOn("config"), config: getAppConfig() }, { headers: { "Cache-Control": "no-store" } })
}

export async function PATCH(req: NextRequest) {
  const a = await architect(req)
  if (a !== 200) return NextResponse.json({ ok: false }, { status: a })
  if (linkOn("config")) return NextResponse.json({ ok: false, reason: "config-connected" }, { status: 409 })
  let patch: unknown
  try { patch = await req.json() } catch { return NextResponse.json({ ok: false, reason: "bad-body" }, { status: 400 }) }
  const r = writeAppPatch(patch)
  if (!r.ok) return NextResponse.json(r, { status: r.reason === "write-failed" ? 500 : 400 })
  revalidatePath("/", "layout")
  revalidatePath("/[lang]", "layout")
  return NextResponse.json({ ok: true, config: getAppConfig() }, { headers: { "Cache-Control": "no-store" } })
}
