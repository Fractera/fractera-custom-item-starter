#!/usr/bin/env node
// check:shadcn-parts — ЭЛЕМЕНТ ДИЗАЙНА, КОТОРЫЙ ЕСТЬ В shadcn, БЕРЁТСЯ ИЗ shadcn (узел, шаг 730-1).
//
// Слова владельца 2026-11-11: «Речь не только об кнопке решат любом элементе дизайна которые существуют в библиотеке shadcn каждый раз
// когда ты пытаешься делать что-то свое это получается натуральное уродство»; «навыку разрешено создавать то что он хочет только работа
// интерфейса где навыков нет требует использования того что мы обсуждаем»; «сторож укажет на ошибку и одновременно элемент будет
// исправлен … Это был бы идеальный вариант».
// ✗ Красный тест 730: файл с голыми <button>, <input> и самодельной всплывающей панелью прошёл ВСЕ 13 сторожей интерфейса.
//
// 🔒 ЧТО ЛОВИТ. Голые <button> <input> <select> <textarea> <table> <progress> <details>; role вида tab/menu/switch/slider/dialog…;
// самодельную всплывающую панель (`bg-popover` или `absolute … top-full`); `title=` у кнопки вместо Tooltip. Каждой находке — её хозяин
// в shadcn и, если его ещё нет в `components/ui/`, команда `npx shadcn@latest add <имя>`.
// 🔒 СВОБОДА НАВЫКА ДИЗАЙНА. Файл с меткой `@design <метка навыка>` в первых строках не проверяется — но метка законна ТОЛЬКО на
// территории дизайна (секции элемента, страницы-прототипы, виджеты) и ТОЛЬКО с навыком, который назван у элемента: `designSkill`
// паспорта или `skill` прототипа (у файла прототипа — навык именно этого прототипа). Метка, чтобы уйти от закона, не ставится.
// 🔒 БЕЗ JAVASCRIPT. Строка с `@no-js <причина>` законна только в серверном файле (без "use client"): меню и формы, которые работают с
// выключенным JavaScript, держат родные <details> и <input type="checkbox">. Островку с JavaScript причина не нужна — у него есть shadcn.
// 🔒 ДОЛГ И ЗАКОН ТРОНУТОГО ФАЙЛА. Старый код не чинится отдельным проходом (владелец: токены не тратим). `shadcn-parts-debt.json` —
// находки на день заморозки с отпечатком каждого файла. Файл не тронут — долг молчит. Тронут (отпечаток другой) — он обязан выйти из
// правки чистым: правку делает агент, он же и чинит. Новый файл — чистым сразу. `--freeze` пишет долг только если его ещё нет;
// `--shrink` только вычёркивает (чистые и исчезнувшие файлы) — добавить себе долг нельзя.

import fs from "node:fs"
import path from "node:path"
import crypto from "node:crypto"

const args = process.argv.slice(2)
const ROOT = path.resolve(args.includes("--root") ? args[args.indexOf("--root") + 1] : process.cwd())
const DEBT = path.join(ROOT, "scripts", "shadcn-parts-debt.json")
const AREAS = ["components", "sections", "app", "_tools", "_widgets"]
const SKIP = [/^components\/ui\//, /^components\/ai-elements\//, /(^|\/)node_modules\//, /(^|\/)\.next\//, /\.test\.tsx$/]
const TERRITORY = [/^components\/sections\//, /\/_widgets\//, /^_widgets\//, /^app\/\[lang\]\/\(protectedLayer\)\/prototypes\/_pages\//]
const INSTALLED = new Set(fs.existsSync(path.join(ROOT, "components/ui")) ? fs.readdirSync(path.join(ROOT, "components/ui")).map((f) => f.replace(/\.tsx?$/, "")) : [])

const TAGS = {
  button: ["Button", "button"], select: ["Select / NativeSelect", "select"], textarea: ["Textarea", "textarea"], table: ["Table", "table"],
  progress: ["Progress", "progress"], details: ["Accordion / Collapsible", "accordion"],
}
const INPUT = { checkbox: ["Checkbox / Switch", "checkbox"], radio: ["RadioGroup", "radio-group"], range: ["Slider", "slider"] }
const ROLES = { tab: "Tabs", tablist: "Tabs", tooltip: "Tooltip", menu: "DropdownMenu", menuitem: "DropdownMenu", menubar: "Menubar", switch: "Switch",
  checkbox: "Checkbox", radio: "RadioGroup", radiogroup: "RadioGroup", slider: "Slider", dialog: "AppDialog / Sheet", alertdialog: "AppDialog",
  listbox: "Select / Command", option: "Select / Command", combobox: "Popover + Command", progressbar: "Progress" }

const rel = (p) => path.relative(ROOT, p).split(path.sep).join("/")
const hash = (s) => crypto.createHash("sha256").update(s).digest("hex").slice(0, 16)
const readJson = (f) => { try { return JSON.parse(fs.readFileSync(f, "utf8")) } catch { return null } }
const hint = (owner, ui) => `${owner}${ui && !INSTALLED.has(ui) ? ` (нет в components/ui — npx shadcn@latest add ${ui})` : ""}`

// Комментарии вырезаются с сохранением строк: «голый <button>» в пояснении — не кнопка.
const code = (src) => src.replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, " ")).replace(/(^|[^:"'`])\/\/[^\n]*/g, (m, p) => p + " ".repeat(m.length - p.length))
const lineAt = (src, i) => src.slice(0, i).split("\n").length
function tagText(src, i) {
  let depth = 0
  for (let j = i; j < Math.min(src.length, i + 2000); j++) {
    const c = src[j]
    if (c === "{") depth++
    else if (c === "}") depth--
    else if (c === ">" && depth === 0) return src.slice(i, j + 1)
  }
  return src.slice(i, i + 200)
}

function legalSkills() {
  const own = readJson(path.join(ROOT, "OWN-SERVICE-PROPS", "OWN-SERVICE-PROPS.json")) ?? {}
  const set = new Set([own.designSkill, own.design?.skill, own.design?.pinned?.skill].filter((s) => typeof s === "string"))
  const pages = path.join(ROOT, "app/[lang]/(protectedLayer)/prototypes/_pages")
  const byPrototype = new Map()
  if (fs.existsSync(pages)) for (const id of fs.readdirSync(pages)) {
    const s = readJson(path.join(pages, id, "prototype.json"))?.skill
    if (typeof s === "string") { set.add(s); byPrototype.set(id, s) }
  }
  return { set, byPrototype }
}

function findingsOf(file, raw, skills) {
  const r = rel(file)
  const mark = raw.split("\n").slice(0, 8).join("\n").match(/@design\s+([a-zA-Z0-9][a-zA-Z0-9._:/@-]{0,119})/)
  if (mark) {
    const proto = r.match(/prototypes\/_pages\/([^/]+)\//)?.[1]
    const ok = TERRITORY.some((t) => t.test(r)) && (proto ? skills.byPrototype.get(proto) === mark[1] : skills.set.has(mark[1]))
    if (ok) return []
    return [{ line: 1, rule: "illegal-design-mark", owner: `метка «@design ${mark[1]}» законна только в секциях, прототипах и виджетах и только с навыком из паспорта или prototype.json` }]
  }
  const client = /^\s*["']use client["']/m.test(raw)
  const src = code(raw)
  const lines = raw.split("\n")
  const out = []
  const push = (i, rule, owner) => {
    const n = lineAt(src, i)
    if (!client && /@no-js\s+\S/.test(lines[n - 1] ?? "")) return
    out.push({ line: n, rule, owner })
  }
  for (const m of src.matchAll(/<(button|input|select|textarea|table|progress|details)\b/g)) {
    if (m[1] !== "input") { push(m.index, `raw-${m[1]}`, hint(...TAGS[m[1]])); continue }
    const type = tagText(src, m.index).match(/\btype=["{]?["']?([a-z]+)/)?.[1] ?? "text"
    if (type === "hidden") continue
    push(m.index, "raw-input", INPUT[type] ? hint(...INPUT[type]) : hint("Input / InputGroup", "input"))
  }
  for (const m of src.matchAll(/\brole=["']([a-z]+)["']/g)) if (ROLES[m[1]]) push(m.index, `role-${m[1]}`, ROLES[m[1]])
  for (const m of src.matchAll(/className=(?:"[^"]*"|\{`[^`]*`\})/g)) {
    if (/\bbg-popover\b/.test(m[0]) || (/\babsolute\b/.test(m[0]) && /\btop-full\b/.test(m[0]))) push(m.index, "hand-floating-panel", "Popover / DropdownMenu / HoverCard / Popover + Command")
  }
  for (const m of src.matchAll(/<(Button|InputGroupButton)\b/g)) if (/\btitle=/.test(tagText(src, m.index))) push(m.index, "title-not-tooltip", "Tooltip")
  return out
}

const files = []
for (const area of AREAS) {
  const dir = path.join(ROOT, area)
  if (!fs.existsSync(dir)) continue
  ;(function walk(d) {
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      const p = path.join(d, e.name)
      if (SKIP.some((s) => s.test(rel(p) + (e.isDirectory() ? "/" : "")))) continue
      if (e.isDirectory()) walk(p)
      else if (e.name.endsWith(".tsx")) files.push(p)
    }
  })(dir)
}

const skills = legalSkills()
const now = new Map()
for (const f of files.sort()) {
  const raw = fs.readFileSync(f, "utf8")
  const found = findingsOf(f, raw, skills)
  if (found.length) now.set(rel(f), { hash: hash(raw), found })
}

const debt = readJson(DEBT)
if (args.includes("--freeze")) {
  if (debt) { console.error("===SHADCN_PARTS_REFUSED=== долг уже заморожен — его можно только сократить (--shrink), не переписать"); process.exit(1) }
  const out = { _: "730-1: находки на день заморозки; файл тронут — выходит из правки чистым. Только --shrink.", files: {} }
  for (const [f, v] of now) out.files[f] = { hash: v.hash, count: v.found.length }
  fs.mkdirSync(path.dirname(DEBT), { recursive: true })
  fs.writeFileSync(DEBT, JSON.stringify(out, null, 2) + "\n")
  console.log(`===SHADCN_PARTS_FROZEN=== ${now.size} файлов, ${[...now.values()].reduce((s, v) => s + v.found.length, 0)} находок`)
  process.exit(0)
}
if (args.includes("--shrink")) {
  if (!debt) process.exit(0)
  let gone = 0
  for (const f of Object.keys(debt.files)) if (!now.has(f)) { delete debt.files[f]; gone++ }
  fs.writeFileSync(DEBT, JSON.stringify(debt, null, 2) + "\n")
  console.log(`===SHADCN_PARTS_SHRUNK=== вычеркнуто ${gone}, осталось ${Object.keys(debt.files).length}`)
  process.exit(0)
}

const bad = []
let quiet = 0
for (const [f, v] of now) {
  const d = debt?.files?.[f]
  if (d && d.hash === v.hash) { quiet += v.found.length; continue }
  for (const x of v.found) bad.push({ file: f, ...x, why: d ? "файл тронут — выходит из правки чистым" : "новый код" })
}
console.log(`\n  просмотрено файлов: ${files.length}; долг нетронутых файлов: ${quiet} находок в ${[...now.keys()].filter((f) => debt?.files?.[f]?.hash === now.get(f).hash).length} файлах`)
if (bad.length) {
  console.error("\n===SHADCN_PARTS_FAILED===")
  for (const b of bad) console.error(`  ✗ ${b.file}:${b.line} ${b.rule} → ${b.owner} (${b.why})`)
  console.error(`\n  ${bad.length} находок. Элемент дизайна, который есть в shadcn, берётся из shadcn (use-primitives, use-shadcn); свой вид — только у навыка дизайна с меткой @design.\n`)
  process.exit(1)
}
console.log("\n===SHADCN_PARTS_OK===\n")
