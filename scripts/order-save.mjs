// SAVE AN ORDER SUMMARY (node step 412-4). Run: npm run order:save -- <summary.json>
//
// An order is work this element did for someone else over A2A — a section, a picture, a cleaning. It is not development, and
// its summary does not live in git: «писать настолько сжатый Самаре, чтобы никаких персональных данных в нём не было а только
// данный достаточные для каталогизации и рубрикаторов» (the person, 2026-10-06) — a summary with no personal data, only what
// cataloguing needs. The raw conversation stays in the node's log under the order number.
//
// The agent writes a JSON file (form in `.claude/skills/workspace-skills/skills/order-summary/SKILL.md`); this script checks it and writes Markdown to
// `SERVICE_DATA_DIR/orders/<order>.md`. A refused summary writes nothing and says why.
// What it refuses: missing or malformed fields · any Cyrillic (summaries are English) · an e-mail · a phone or card number
// (9+ digits in one run; ISO dates are not numbers of people).
// 🛑 What it cannot see: a person's name. «Misha» is a word to a script — leaving names out is the agent's rule.

import fs from "node:fs"
import path from "node:path"

const ROOT = path.resolve(import.meta.dirname, "..")
const STATUS = ["done", "refused", "cancelled", "failed"]

function fail(msg) {
  console.error(`order:save — refused: ${msg}`)
  process.exit(1)
}

function envValue(name) {
  if (process.env[name]?.trim()) return process.env[name].trim()
  for (const f of [".env.local", ".env"]) {
    const p = path.join(ROOT, f)
    if (!fs.existsSync(p)) continue
    const m = fs.readFileSync(p, "utf8").match(new RegExp(`^${name}=(.+)$`, "m"))
    if (m && m[1].trim()) return m[1].trim()
  }
  return null
}
const dataDir = () => envValue("SERVICE_DATA_DIR")

// The element's permanent id — from its passport, as everywhere else.
function ownId() {
  try {
    return JSON.parse(fs.readFileSync(path.join(ROOT, "OWN-SERVICE-PROPS", "OWN-SERVICE-PROPS.json"), "utf8")).id ?? null
  } catch {
    return null
  }
}

// The core's address — the host and port the core listens on (`<node>/logs/runtime.json`), never a remembered number.
function coreUrl() {
  const file = envValue("NODE_DOMAIN_FILE")
  if (!file) return null
  try {
    const rt = JSON.parse(fs.readFileSync(path.join(path.dirname(path.dirname(file)), "logs", "runtime.json"), "utf8"))
    return Number.isInteger(rt.port) ? `http://${rt.hostname || "localhost"}:${rt.port}` : null
  } catch {
    return null
  }
}

// 412-5: pin the conversation so the node's log keeps it (the person chose «б»: conversations with a summary are not pushed out).
// The summary is already saved when this runs; a failed pin is reported, not fatal.
async function pin(order) {
  const core = coreUrl()
  const key = envValue("SETTINGS_SECRET")
  if (!core || !key) return "not pinned: the core address or the node key is unknown"
  try {
    const r = await fetch(`${core}/api/node/a2a-log/pin`, {
      method: "POST",
      headers: { "content-type": "application/json", "X-Node-Key": key },
      body: JSON.stringify({ contextId: order, by: ownId() }),
    })
    const b = await r.json().catch(() => ({}))
    return r.ok && b.ok ? `conversation pinned in the node's log (${b.rows ?? 0} rows)` : `not pinned: ${b.error ?? r.status}`
  } catch (e) {
    return `not pinned: ${e.message}`
  }
}

const file = process.argv[2]
if (!file) fail("give the summary file: npm run order:save -- <summary.json>")
let s
try {
  s = JSON.parse(fs.readFileSync(path.resolve(file), "utf8"))
} catch (e) {
  fail(`cannot read ${file} as JSON (${e.message})`)
}

const str = (k, { empty = false } = {}) => {
  if (typeof s[k] !== "string" || (!empty && !s[k].trim())) fail(`"${k}" must be a${empty ? "" : " non-empty"} string`)
}
const list = (k, { min = 0 } = {}) => {
  if (!Array.isArray(s[k]) || s[k].length < min || s[k].some((x) => typeof x !== "string" || !x.trim())) {
    fail(`"${k}" must be a list of strings${min ? ` (at least ${min})` : ""}`)
  }
}
str("order")
if (!/^[A-Za-z0-9-]{1,64}$/.test(s.order)) fail(`"order" is the conversation number (contextId): letters, digits, dashes`)
list("tasks")
str("from")
str("kind")
list("tags", { min: 1 })
str("terms", { empty: true })
if (!Number.isInteger(s.iterations) || s.iterations < 1) fail(`"iterations" must be a whole number ≥ 1`)
if (!Array.isArray(s.rejected) || s.rejected.some((r) => !r || typeof r.what !== "string" || typeof r.why !== "string")) {
  fail(`"rejected" must be a list of {"what", "why"}`)
}
str("result")
if (!STATUS.includes(s.status)) fail(`"status" must be one of ${STATUS.join(", ")}`)
str("learned", { empty: true })

// Personal data and language — over every string in the summary.
// `order` and `tasks` are A2A numbers (`<id>-<uuidv7>`): a hex number can hold a long run of digits, so they skip the number check.
const strings = []
const walk = (v, isId) => (typeof v === "string" ? strings.push([v, isId]) : v && typeof v === "object" ? Object.values(v).forEach((x) => walk(x, isId)) : null)
for (const [k, v] of Object.entries(s)) walk(v, k === "order" || k === "tasks")
for (const [t, isId] of strings) {
  if (/[Ѐ-ӿ]/.test(t)) fail(`Cyrillic in «${t.slice(0, 60)}» — summaries are written in English`)
  if (/[^\s@]+@[^\s@]+\.[a-z]{2,}/i.test(t)) fail(`an e-mail address in «${t.slice(0, 60)}» — personal data stays out of summaries`)
  if (isId) continue
  for (const m of t.match(/\+?\d[\d\s().-]{6,}\d/g) ?? []) {
    if (/^\d{4}-\d{2}-\d{2}/.test(m.trim())) continue
    if ((m.match(/\d/g) ?? []).length >= 9) fail(`a phone or card number in «${t.slice(0, 60)}» — personal data stays out of summaries`)
  }
}

const dir = dataDir()
if (!dir) fail("SERVICE_DATA_DIR is not set (env or .env.local) — nowhere to keep orders")
const out = path.join(dir, "orders", `${s.order}.md`)
fs.mkdirSync(path.dirname(out), { recursive: true })

const closedAt = new Date().toISOString()
const md = [
  `# Order ${s.order}`,
  "",
  `| Field | Value |`,
  `|---|---|`,
  `| closed | ${closedAt} |`,
  `| status | ${s.status} |`,
  `| from | ${s.from} |`,
  `| kind | ${s.kind} |`,
  `| tags | ${s.tags.join(", ")} |`,
  `| iterations | ${s.iterations} |`,
  `| tasks | ${s.tasks.join(", ") || "—"} |`,
  "",
  "## Terms",
  "",
  s.terms.trim() || "—",
  "",
  "## Rejected along the way",
  "",
  ...(s.rejected.length ? s.rejected.map((r) => `- ${r.what} — ${r.why}`) : ["—"]),
  "",
  "## Result",
  "",
  s.result.trim(),
  "",
  "## Learned",
  "",
  s.learned.trim() || "—",
  "",
].join("\n")
fs.writeFileSync(out, md)
console.log(`order:save — saved ${out}`)
console.log(`order:save — ${process.env.ORDER_SAVE_NO_PIN ? "not pinned: ORDER_SAVE_NO_PIN (probe)" : await pin(s.order)}`)
