// FIND A READY PART BEFORE BUILDING ONE (node step 725-2). The owner, 2026-11-11: «вместо того чтобы взять готовые инструмент ты по
// какой-то причине полез создавать новый и создал говно … в любой компонент создав инструмент который можно пере использовать сохранил его
// в базе связи и всегда вызывал». The cure has the shape that already works for skills: a TOOL in hand in every build session
// (`parts_find` of the node-skills MCP server, `npm run parts`), over the generated map `lib/parts/PARTS.json` (725-1).
// 🔒 TWO WAYS AT ONCE, one answer. WORDS over the cards (the search words and the what-texts in Russian and English, stems cut so «голосом»
// meets «голос»; works offline, always) and MEANING over the node's own vectors (collection `node-parts`, the element `embeddings`,
// on this computer, no key; only a changed card is embedded again — `logs/parts-index.json`). Vectors silent → words alone, said aloud.
// 🔒 A threshold, not a top-5 at any price: «nothing ready» is an answer (the negative control «бронирование столика»), and it says what to
// do then — build it and give it a card at its birth (725-7).
import { createHash } from "node:crypto"
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs"
import { createRequire } from "node:module"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"

const require = createRequire(import.meta.url)
export const COLLECTION = "node-parts"
const STOP = new Set(["с", "и", "в", "на", "для", "по", "из", "к", "от", "a", "an", "the", "with", "for", "of", "to", "in", "on", "and", "or", "что", "как", "это"])

export function loadMap(root) {
  const file = join(root, "lib", "parts", "PARTS.json")
  return existsSync(file) ? JSON.parse(readFileSync(file, "utf8")).parts ?? [] : []
}

const tokens = (s) => String(s ?? "").toLowerCase().replace(/ё/g, "е").split(/[^a-zа-я0-9]+/).filter((t) => t.length > 1 && !STOP.has(t))
// A cheap stem per script. Russian bends the ending: the first five letters of a longer word («модель», «моделью», «модели» → «модел»;
// «голосом» → «голос»). English bends little: only a plural «s» goes — a shorter cut made «model» meet «mode» (measured).
const stem = (t) => (/[а-я]/.test(t) ? (t.length >= 6 ? t.slice(0, 5) : t) : t.length > 4 && t.endsWith("s") && !t.endsWith("ss") ? t.slice(0, -1) : t)

function cardText(p) {
  return [p.words?.en?.join(", "), p.words?.ru?.join(", "), p.what?.en, p.what?.ru].filter(Boolean).join(". ")
}

/** Words: the share of the query's stems found in the part's search words (weight 3), id/export (2), what-texts (1). 0…1. */
export function wordScore(part, query) {
  const q = [...new Set(tokens(query).map(stem))]
  if (!q.length) return 0
  const pool = (list) => new Set(tokens(list.filter(Boolean).join(" ")).map(stem))
  const words = pool([...(part.words?.en ?? []), ...(part.words?.ru ?? [])])
  const names = pool([part.id.replace(/-/g, " "), part.title, String(part.export ?? "").replace(/([a-z])([A-Z])/g, "$1 $2")])
  const what = pool([part.what?.en, part.what?.ru])
  let sum = 0
  for (const t of q) sum += words.has(t) ? 3 : names.has(t) ? 2 : what.has(t) ? 1 : 0
  return sum / (3 * q.length)
}

/** Meaning over the node's vectors; null when the vector element is not there (the caller says so). */
async function meaning(root, parts, query, { ms = 15000 } = {}) {
  let embed
  try { embed = require(join(root, "lib", "agent-kit", "memory", "embed.cjs")) } catch { return null }
  const e = embed.env()
  const base = embed.dataUrl()
  if (!base || !e.DATA_SECRET) return null
  const ledgerFile = join(root, "logs", "parts-index.json")
  try {
    const kind = await embed.kind(e, base, ms)
    const headers = { "X-Data-Secret": e.DATA_SECRET, "Content-Type": "application/json" }
    let ledger = { items: {} }
    try { ledger = { items: {}, ...JSON.parse(readFileSync(ledgerFile, "utf8")) } } catch { /* first run */ }
    if (ledger.model !== kind.model || ledger.dims !== kind.dims) ledger.items = {}
    const vid = (id) => `part-${id}`
    for (const p of parts) {
      const text = cardText(p)
      const sha = createHash("sha1").update(text).digest("hex")
      if (ledger.items[p.id] === sha) continue
      await embed.call(`${base}/vectors`, { method: "POST", headers, body: JSON.stringify({ id: vid(p.id), collection: COLLECTION, text, refTable: "part", refId: p.id }) }, ms)
      ledger.items[p.id] = sha
    }
    const alive = new Set(parts.map((p) => p.id))
    for (const id of Object.keys(ledger.items)) {
      if (alive.has(id)) continue
      await embed.call(`${base}/vectors/${vid(id)}`, { method: "DELETE", headers }, ms).catch(() => null)
      delete ledger.items[id]
    }
    mkdirSync(dirname(ledgerFile), { recursive: true })
    writeFileSync(ledgerFile, JSON.stringify({ model: kind.model, dims: kind.dims, items: ledger.items }, null, 2) + "\n")
    const r = await embed.call(`${base}/vectors/search`, { method: "POST", headers, body: JSON.stringify({ collection: COLLECTION, query, k: 30 }) }, ms)
    const out = new Map()
    for (const x of r?.results ?? []) out.set(x.refId || String(x.id).replace(/^part-/, ""), x.score)
    return out
  } catch {
    return null
  }
}

// Measured on the map of 725-1 (the test `scripts/parts-find.test.mjs`): a right part scores ≥ 0.34 by words or ≥ 0.5 by meaning,
// a foreign query («бронирование столика») stays under both.
const WORDS_MIN = 0.34
const MEANING_MIN = 0.5

/** Up to `k` parts for a query, best first, each with why; `{ parts: [], meaning }` when nothing ready is close enough. */
export async function findParts(root, { query, terms = [], k = 5, kinds } = {}) {
  const all = loadMap(root).filter((p) => !kinds?.length || kinds.includes(p.kind))
  const q = [query, ...(Array.isArray(terms) ? terms : [])].filter(Boolean).join(" ")
  const m = await meaning(root, all, q)
  let scored = all.map((p) => {
    const w = wordScore(p, q)
    const v = m?.get(p.id) ?? 0
    const score = m ? 0.5 * w + 0.5 * v : w
    const ok = w >= WORDS_MIN || (m && v >= MEANING_MIN)
    return { p, w, v, score, ok }
  }).filter((x) => x.ok)
  // A part another found part REPLACES (its `replaces` names this part's import) steps back — the bare microphone under the voice
  // textarea; an `internal` part (used inside another, not taken directly) steps back too. Measured: «поле с голосом» put the bare
  // voice-input tool and the section's island above VoiceField and VoiceTextarea at an equal score.
  const replaced = new Set(scored.flatMap((x) => x.p.replaces ?? []))
  for (const x of scored) {
    const imp = x.p.path.replace(/\.(tsx?|jsx?)$/, "").replace(/^/, "@/")
    if (replaced.has(imp)) x.score *= 0.6
    if (x.p.internal) x.score *= 0.5
  }
  scored.sort((a, b) => b.score - a.score || (b.p.usedBy?.length ?? 0) - (a.p.usedBy?.length ?? 0))
  scored.splice(k)
  return { parts: scored.map(({ p, w, v, score }) => ({ ...p, score: +score.toFixed(3), words: p.words, why: { words: +w.toFixed(2), meaning: m ? +v.toFixed(2) : null } })), meaning: !!m }
}

export function partsText(r, query) {
  const head = r.meaning ? "" : "(the node's vectors did not answer — words only)\n"
  if (!r.parts.length)
    return `${head}Nothing ready in the parts map is close to «${query}». Build it — and if anyone else could need it, declare it a part at its birth: ` +
      "`// @part <id> — <what>` on its first lines and its card in the folder's parts.json (725-7); otherwise `// @local — <why>`."
  return head + r.parts.map((p, i) => [
    `${i + 1}. ${p.title ?? p.export} — ${p.kind} \`${p.path}\` (score ${p.score})`,
    `   ${p.what?.en ?? ""}`,
    `   How: ${p.how.length > 320 ? `${p.how.slice(0, 320)}…` : p.how}`,
    p.replaces?.length ? `   Use it instead of: ${p.replaces.join(", ")}` : "",
    p.usedBy?.length ? `   Used by ${p.usedBy.length}: ${p.usedBy.slice(0, 3).join(", ")}${p.usedBy.length > 3 ? " …" : ""}` : "   Used by nobody in the core yet.",
  ].filter(Boolean).join("\n")).join("\n") + "\n\nTake the part as it is; a part that almost fits is extended in its own file, never copied."
}
