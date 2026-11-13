// THE NODE'S TOOLS FOR THIS ELEMENT'S TERMINAL (node step 736, defect D14). ✗ 2026-11-13 01:06, live: the newborn «Хранилище картинок»
// asked `npm run parts -- image crop` and heard «Nothing ready» — this command searched only the element's own map while the core held
// the crop tool, and the agent built its own. The terminal now gives the same answer as `parts_find` of a build session: the element's
// own map first, then the core's «any» tools and the neighbours' — read by the core's own index (metadata only, never code).
import { existsSync, readFileSync } from "node:fs"
import { dirname, join } from "node:path"
import { pathToFileURL } from "node:url"

/** The node's core folder, found the way `tool:take` finds the core (NODE_DOMAIN_FILE → its logs → the core); none outside a node. */
export function coreRoot(root) {
  let file = process.env.NODE_DOMAIN_FILE?.trim()
  if (!file) try { file = (readFileSync(join(root, ".env.local"), "utf8").match(/^NODE_DOMAIN_FILE=(.*)$/m)?.[1] ?? "").trim() } catch { /* no file */ }
  const core = file ? dirname(dirname(file)) : null
  return core && existsSync(join(core, "lib", "parts", "node-index.mjs")) ? core : null
}

/** `{ core, node }` — the tools this element may take besides its own; `node` is empty outside a node. */
export async function nodeTools(root) {
  const core = coreRoot(root)
  if (!core) return { core: null, node: [] }
  try { return { core, node: (await import(pathToFileURL(join(core, "lib", "parts", "node-index.mjs")).href)).nodeTools(core, root) } } catch { return { core, node: [] } }
}
