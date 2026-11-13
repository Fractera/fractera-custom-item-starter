// npm run parts -- <words> [--kind tool|composite|primitive|section] — the ready parts of this project and of the node (the core's and the
// neighbours' tools) for a person or a script — the same answer as the tool parts_find of a build session (node steps 725-2, 736).
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"
import { findParts, partsText } from "../lib/parts/parts-find.mjs"
import { nodeTools } from "../lib/parts/node-tools.mjs"

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..")
const args = process.argv.slice(2)
if (args.includes("--audit")) {
  const { audit, report } = await import("./parts-audit.mjs")
  console.log(report(audit()))
  process.exit(0)
}
const ki = args.indexOf("--kind")
const kinds = ki >= 0 ? [args[ki + 1]] : undefined
const query = args.filter((a, i) => a !== "--kind" && i !== ki + 1).join(" ").trim()
if (!query) {
  console.log("npm run parts -- <what you are about to build> [--kind tool|composite|primitive|section]")
  process.exit(1)
}
// 736 (D14): the same answer as `parts_find` — this element's map, then the core's and the neighbours' tools with their take command.
const { core, node } = await nodeTools(ROOT)
if (!core) console.log("(the node's core is not known here — only this element's own map was asked)")
console.log(partsText(await findParts(ROOT, { query, kinds, node }), query))
