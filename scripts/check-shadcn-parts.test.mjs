#!/usr/bin/env node
// npm run test:shadcn-parts — тест сторожа check:shadcn-parts (узел, шаг 730-1). Временный корень, без модели, без сети.
// Красный тест шага 730 стал его первым случаем: файл с голыми <button>, <input> и самодельной всплывающей панелью прошёл все 13
// сторожей интерфейса — теперь он обязан упасть, а его чистый близнец — пройти. Плюс свобода навыка дизайна (метка законна только на
// территории дизайна и только с навыком элемента), `@no-js` только в серверном файле, закон тронутого файла и запрет переписать долг.

import fs from "node:fs"
import os from "node:os"
import path from "node:path"
import { spawnSync } from "node:child_process"

const GUARD = path.join(path.dirname(new URL(import.meta.url).pathname), "check-shadcn-parts.mjs")
const root = fs.mkdtempSync(path.join(os.tmpdir(), "shadcn-parts-"))
const put = (f, s) => { fs.mkdirSync(path.join(root, path.dirname(f)), { recursive: true }); fs.writeFileSync(path.join(root, f), s) }
const del = (f) => fs.rmSync(path.join(root, f), { force: true })
const run = (...a) => spawnSync(process.execPath, [GUARD, "--root", root, ...a], { encoding: "utf8" })
let failed = 0
function expect(name, r, code, text) {
  const out = (r.stdout ?? "") + (r.stderr ?? "")
  const ok = r.status === code && (!text || out.includes(text))
  console.log(`${ok ? "✓" : "✗"} ${name}${ok ? "" : ` — exit ${r.status}, wanted ${code}${text ? ` with «${text}»` : ""}\n${out}`}`)
  if (!ok) failed++
}

put("components/ui/button.tsx", "export function Button() { return <button /> }\n")
put("components/ui/popover.tsx", "export const x = 1\n")
put("OWN-SERVICE-PROPS/OWN-SERVICE-PROPS.json", JSON.stringify({ designSkill: "frontend-design" }))
put("app/[lang]/(protectedLayer)/prototypes/_pages/p1/prototype.json", JSON.stringify({ skill: "brutal-ui" }))

const RED = `"use client"
// голый <button> в комментарии — не кнопка
export function Red() {
  return (
    <div className="relative">
      <input className="h-8" />
      <button type="button" onClick={() => {}}>go</button>
      <div className="absolute top-full mt-2 rounded-lg border bg-popover shadow-md">x</div>
      <Button title="Найти">?</Button>
    </div>
  )
}
`
const CLEAN = `"use client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
export function Clean() {
  return <div className="flex gap-1"><Input /><Button>go</Button></div>
}
`

// 1. Красный тест 730 и его чистый близнец.
put("components/x/red.client.tsx", RED)
let r = run()
expect("the red test fails", r, 1, "===SHADCN_PARTS_FAILED===")
for (const rule of ["raw-input", "raw-button", "hand-floating-panel", "title-not-tooltip"]) expect(`  names ${rule}`, r, 1, rule)
expect("  a word in a comment is not a button (one raw-button)", { status: (r.stderr.match(/raw-button/g) ?? []).length === 1 ? 1 : 0, stdout: r.stdout, stderr: r.stderr }, 1)
expect("  names the owner part", r, 1, "→ Button")
expect("  says how to add a missing part", r, 1, "npx shadcn@latest add input")
del("components/x/red.client.tsx")
put("components/x/clean.client.tsx", CLEAN)
expect("the clean twin passes", run(), 0, "===SHADCN_PARTS_OK===")

// 2. Свобода навыка дизайна — и только она.
const MARKED = (mark) => `// @design ${mark}\n"use client"\nexport function S() { return <button className="ghost-pill">x</button> }\n`
put("components/sections/section-hero/hero.client.tsx", MARKED("frontend-design"))
expect("a design-skill file in a section with the passport's skill passes", run(), 0)
put("components/sections/section-hero/hero.client.tsx", MARKED("some-other-skill"))
expect("a mark with a skill the element does not have fails", run(), 1, "illegal-design-mark")
del("components/sections/section-hero/hero.client.tsx")
put("components/x/escape.client.tsx", MARKED("frontend-design"))
expect("a mark outside the design territory fails", run(), 1, "illegal-design-mark")
del("components/x/escape.client.tsx")
put("app/[lang]/(protectedLayer)/prototypes/_pages/p1/sections/a.client.tsx", MARKED("brutal-ui"))
expect("a prototype file with its own prototype's skill passes", run(), 0)
put("app/[lang]/(protectedLayer)/prototypes/_pages/p1/sections/a.client.tsx", MARKED("frontend-design"))
expect("a prototype file with another skill fails", run(), 1, "illegal-design-mark")
del("app/[lang]/(protectedLayer)/prototypes/_pages/p1/sections/a.client.tsx")

// 3. Без JavaScript — только на сервере.
const NOJS = (client) => `${client ? '"use client"\n' : ""}export function M() { return <details>{/* @no-js the menu works with JavaScript off */}<summary>x</summary></details> }\n`
put("components/menu/m.tsx", NOJS(false))
expect("@no-js in a server file passes", run(), 0)
put("components/menu/m.tsx", NOJS(true))
expect("@no-js in a client island fails", run(), 1, "raw-details")
del("components/menu/m.tsx")

// 4. Долг и закон тронутого файла.
put("components/old/legacy.client.tsx", RED)
expect("frozen once", run("--freeze"), 0, "===SHADCN_PARTS_FROZEN===")
expect("an untouched debt file is quiet", run(), 0, "===SHADCN_PARTS_OK===")
expect("the debt cannot be rewritten", run("--freeze"), 1, "===SHADCN_PARTS_REFUSED===")
put("components/old/legacy.client.tsx", RED + "// a small unrelated edit\n")
expect("a touched debt file must leave clean", run(), 1, "файл тронут")
put("components/old/legacy.client.tsx", CLEAN)
expect("cleaned in the same pass — passes", run(), 0)
expect("shrink strikes it from the debt", run("--shrink"), 0, "вычеркнуто 1")
put("components/x/new.client.tsx", RED)
expect("a new file with the same markup fails although it is in no debt", run(), 1, "новый код")
del("components/x/new.client.tsx")

// 5. Узел, шаг 735 (D11): взятая копия инструмента, не тронутая после взятия, — долг её источника, не новый код элемента; правленая — код
// элемента. Отпечаток тела — тот же, что пишет взятие (`lib/parts/parts-map.mjs`).
{
  const HERE = path.dirname(new URL(import.meta.url).pathname)
  const { bodyHash } = await import(new URL("../lib/parts/parts-map.mjs", import.meta.url).href)
  fs.mkdirSync(path.join(root, "lib/parts"), { recursive: true })
  fs.copyFileSync(path.join(HERE, "..", "lib/parts/parts-map.mjs"), path.join(root, "lib/parts/parts-map.mjs"))
  const body = ["_tools/voice-input/client/v.client.tsx"]
  put(body[0], RED)
  put("lib/parts/PARTS.json", JSON.stringify({ parts: [{ id: "tool-voice-input", kind: "tool", body, source: { from: "core", tool: "tool-voice-input", version: "1.0.0", bodyHash: bodyHash(root, body) } }] }))
  expect("a taken copy, unedited: its source judges it, not this element", run(), 0, "взятые копии")
  put(body[0], RED + "// edited after the take\n")
  expect("the same copy edited after the take is the element's code", run(), 1, "новый код")
  del(body[0])
  del("lib/parts/PARTS.json")
}

fs.rmSync(root, { recursive: true, force: true })
console.log(failed ? `\n===TEST_FAILED=== ${failed}` : "\n===TEST_OK===")
process.exit(failed ? 1 : 0)
