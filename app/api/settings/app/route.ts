// @api the core reads and patches this element site settings
import { NextRequest } from "next/server"
import { z } from "zod"

import { getAppConfig } from "@/config/app-config"
import { appConfigSchema } from "@/config/app-config.schema"
import { linkOn } from "@/lib/own-site"
import { writeAppPatch } from "@/lib/architect/site-config-writer"
import { bodyOf, keyDenied, repaint, reply } from "@/lib/architect/node-settings-door"

// СВОИ НАСТРОЙКИ САЙТА ЭЛЕМЕНТА ДЛЯ ЯДРА (шаг узла 712-1). Владелец 2026-11-09: «для CONFIG и для дизайна мы должны избавиться от
// внешних страниц которые уводят нас из вкладки работы с элементом». Вкладка ядра «Настройки сайта» правит этот файл, как правит его
// своя страница элемента (`admin/api/settings/app` — та же запись `lib/architect/site-config-writer.ts`).
// 🔒 Чтение — действующие значения (`getAppConfig()`), объявление полей (JSON Schema из `config/app-config.schema.ts`) и языки, с
// которыми элемент собран. 🔒 Запись — только при выключенной связи с CONFIG (закон 324-8): пока связь включена, настройки приходят
// копией CONFIG и легли бы поверх правки — 409 `config-connected`.
export const dynamic = "force-dynamic"

function built() {
  const list = (v: string | undefined) => (v ?? "").split(",").map((s) => s.trim()).filter(Boolean)
  const langs = list(process.env.NEXT_PUBLIC_SUPPORTED_LANGUAGES ?? "en")
  return { langs: langs.length ? langs : ["en"], def: process.env.NEXT_PUBLIC_DEFAULT_LOCALE?.trim() || langs[0] || "en", unlocked: list(process.env.NEXT_PUBLIC_INDEXED_LANGUAGES) }
}

export async function GET(req: NextRequest) {
  const denied = keyDenied(req)
  if (denied) return denied
  return reply({ ok: true, linked: linkOn("config"), config: getAppConfig(), schema: z.toJSONSchema(appConfigSchema, { io: "input" }), built: built() })
}

export async function PATCH(req: NextRequest) {
  const denied = keyDenied(req)
  if (denied) return denied
  if (linkOn("config")) return reply({ ok: false, reason: "config-connected" }, 409)
  const r = writeAppPatch(await bodyOf(req))
  if (!r.ok) return reply(r, r.reason === "write-failed" ? 500 : 400)
  repaint()
  return reply({ ok: true, config: getAppConfig() })
}
