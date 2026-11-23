import "server-only"
import { readFileSync } from "node:fs"
import { join } from "node:path"
import { getAppConfig, metaForLang } from "@/config/app-config"
import { resolveBrandName } from "@/config/app-config.defaults"
import { elementRoot } from "@/lib/page-tree"

// THE NAME AT THE TOP OF THE MINI APP (node step 848-3; the aifa.dev server's letter 2026-11-23, 1.3б: the element «Diana» opened in
// Telegram under the default site name «Fractera»). The Mini App is this element's remote, so its head names the element:
//   1. the site name the person gave in «Настройки сайта» (`resolveBrandName`: the shipped default counts as unset) — their brand;
//   2. the name the core gave the element at its birth or a rename — `name.json` in this element's own data folder (`SERVICE_DATA_DIR`,
//      the core writes it there: `lib/web4-items/name-file.cjs` of the core), the name its bot and the panel's menu say;
//   3. the passport's `name`, when it is not the element's id;
//   4. the site name as it stands.
// Read at render, nothing kept: a rename shows at the next open without a build.

const readJson = (file: string): Record<string, unknown> | null => {
  try { return JSON.parse(readFileSync(file, "utf8")) as Record<string, unknown> } catch { return null }
}
const clean = (v: unknown): string => (typeof v === "string" ? v.replace(/\s+/g, " ").trim().slice(0, 60) : "")

export function elementName(lang: string): string {
  const site = metaForLang(lang).siteName
  if (resolveBrandName(getAppConfig())) return site
  const data = process.env.SERVICE_DATA_DIR?.trim()
  const fromCore = data ? clean(readJson(join(data, "name.json"))?.name) : ""
  if (fromCore) return fromCore
  const passport = readJson(join(elementRoot(), "OWN-SERVICE-PROPS", "OWN-SERVICE-PROPS.json"))
  const name = clean(passport?.name)
  if (name && name.toLowerCase() !== clean(passport?.id).toLowerCase()) return name
  return site
}
