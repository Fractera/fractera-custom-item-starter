// @api the core reads and patches this element site switches
import { NextRequest } from "next/server"
import { z } from "zod"

import { getPlatformConfig } from "@/config/platform-config"
import { platformConfigSchema } from "@/config/platform-config.schema"
import { linkOn } from "@/lib/own-site"
import { writeFeaturesPatch } from "@/lib/architect/site-config-writer"
import { bodyOf, keyDenied, repaint, reply } from "@/lib/architect/node-settings-door"

// СВОИ ВЫКЛЮЧАТЕЛИ САЙТА ЭЛЕМЕНТА ДЛЯ ЯДРА (шаг узла 712-1) — шапка и подвал, баннер cookie, вход, крошки и остальные. Тело плоское
// (`{ "breadcrumbs": false }`), как у CONFIG и своей страницы элемента (`admin/api/settings/platform` — та же запись).
// 🔒 Объявление — ветка `features` JSON Schema из `config/platform-config.schema.ts`: выключатель, которого нет в схеме элемента,
// ядро не показывает. 🔒 Запись — только при выключенной связи с CONFIG (закон 324-8), иначе 409 `config-connected`.
export const dynamic = "force-dynamic"

function declaration(): unknown {
  const s = z.toJSONSchema(platformConfigSchema, { io: "input" }) as { properties?: { features?: unknown } }
  return s.properties?.features ?? { type: "object", properties: {} }
}

export async function GET(req: NextRequest) {
  const denied = keyDenied(req)
  if (denied) return denied
  return reply({ ok: true, linked: linkOn("config"), config: { ...getPlatformConfig().features }, schema: declaration() })
}

export async function PATCH(req: NextRequest) {
  const denied = keyDenied(req)
  if (denied) return denied
  if (linkOn("config")) return reply({ ok: false, reason: "config-connected" }, 409)
  const r = writeFeaturesPatch(await bodyOf(req))
  if (!r.ok) return reply(r, r.reason === "write-failed" ? 500 : 400)
  repaint()
  return reply({ ok: true, config: { ...getPlatformConfig().features } })
}
