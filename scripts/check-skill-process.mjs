// СТОРОЖ ПРОЦЕССА НАВЫКОВ (шаг узла 465-4). У каждого навыка в `.claude/skills/` назван процесс — строительный или рабочий.
//
// Владелец 2026-10-12: «перепроверить все созданные навыки и вписать к какому типу процесса они относятся принудительно чтобы
// подобных пропусков не было»; «если агент создает навык он обязан определить относится этот навык к рабочему процессу или к
// строительным процессу». ✗ Оплачено: напоминание (рабочий процесс, данные) было построено как код — коммит, push, пересборка.
//
// Свой навык: `description` начинается с `Builder skill` · `Work skill` · `Both natures`, а в теле — строка `**Process: build**` ·
// `**Process: working**` · `**Process: both**`, и они согласны. Чужой навык (рядом `SOURCE.md`) свой текст не меняет: его процесс —
// строка `Process: build|working|both` в `SOURCE.md`. Правило для агента — `CLAUDE.md`, раздел «Skills by nature».
// Нарушение роняет сборку (код 1): пропуск здесь всплывает потом поведением, а не ошибкой.
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const DIR = join(ROOT, '.claude', 'skills')
const KIND = { 'Builder skill': 'build', 'Work skill': 'working', 'Both natures': 'both' }

const problems = []
let count = 0
// Таблица «Skills by nature» в CLAUDE.md — второй половине знания нужен сторож: навык без строки в таблице агент не найдёт по природе.
const claude = existsSync(join(ROOT, 'CLAUDE.md')) ? readFileSync(join(ROOT, 'CLAUDE.md'), 'utf8').replace(/\r\n/g, '\n') : ''
const tableAt = claude.indexOf('| Nature | Skills |')
const table = tableAt < 0 ? '' : claude.slice(tableAt, claude.indexOf('\n\n', tableAt))
const ROW = { build: /^\| builder/, working: /^\| worker/, both: /^\| both/ }
const rowOf = (name) => table.split('\n').find((l) => l.includes('`' + name + '`')) ?? null
for (const name of existsSync(DIR) ? readdirSync(DIR) : []) {
  const dir = join(DIR, name)
  if (!statSync(dir).isDirectory()) continue
  count++
  const source = join(dir, 'SOURCE.md')
  if (existsSync(source)) {
    if (!/^Process: (build|working|both)\b/m.test(readFileSync(source, 'utf8'))) problems.push(`${name}: чужой навык без строки «Process: build|working|both» в SOURCE.md`)
    if (!rowOf(name)) problems.push(`${name}: нет в таблице «Skills by nature» CLAUDE.md`)
    continue
  }
  const file = join(dir, 'SKILL.md')
  if (!existsSync(file)) { problems.push(`${name}: нет SKILL.md`); continue }
  const text = readFileSync(file, 'utf8').replace(/\r\n/g, '\n')
  const desc = text.match(/^description:\s*>?-?\s*\n?\s*(.*)$/m)?.[1] ?? ''
  const lead = Object.keys(KIND).find((k) => desc.startsWith(k))
  const body = text.match(/^\*\*Process: (build|working|both)\*\*/m)?.[1]
  if (!lead) problems.push(`${name}: description не начинается с «Builder skill» / «Work skill» / «Both natures»`)
  if (!body) problems.push(`${name}: в теле нет строки «**Process: build|working|both**»`)
  if (lead && body && KIND[lead] !== body) problems.push(`${name}: description говорит «${lead}», а тело — «Process: ${body}»`)
  const row = rowOf(name)
  if (!row) problems.push(`${name}: нет в таблице «Skills by nature» CLAUDE.md`)
  else if (body && !ROW[body].test(row)) problems.push(`${name}: в таблице «Skills by nature» стоит не в строке своего процесса (${body})`)
}

if (problems.length) {
  console.error(`===SKILL_PROCESS_FAIL=== у навыка не назван процесс (CLAUDE.md, «Skills by nature»):`)
  for (const p of problems) console.error(`  ${p}`)
  process.exit(1)
}
console.log(`===SKILL_PROCESS_OK=== процесс назван у всех навыков: ${count}`)
