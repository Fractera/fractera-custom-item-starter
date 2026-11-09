// ПРОТОТИПЫ ДИЗАЙНА (узел, шаг 711-4, 711-6). Владелец 2026-11-09: «для каждого кандидата с референс сделать кнопку сгенерировать
// тестовую страницу … тестовой страницы сохраняются в проекте с ссылкой … выбрать текущий навык который будет использоваться в
// архитектуре записать его в own-service-props.json». Кнопку жмёт человек во вкладке ядра «Строительство → Дизайн»; работу делает
// агент этого элемента в проходе дизайна, этими командами:
//   npm run prototype -- new <id> --skill <mark> [--from home|<slug>] [--title "<name>"] [--ref <url> [--ref-caption "<words>"]]…
//        папка прототипа: слова исходной страницы, копия токенов (`DESIGN-CONFIG`), запись прототипа — статус «draft»
//   npm run prototype -- done <id>     проверка (токены, DESIGN.md, слова без цвета) и статус «ready»
//   npm run prototype -- list          прототипы элемента
//   npm run design:pin -- <id>         победитель: его токены → DESIGN-CONFIG, DESIGN.md → элемент, его слова → исходная страница,
//                                      паспорт: designSkill и design.pinned; все прототипы уходят в архив (снимки и записи остаются)
// Токены первыми, страница второй: всё, что видно на прототипе, — из его `tokens.json`; закрепляется ровно оно.
import { copyFileSync, cpSync, existsSync, mkdirSync, readdirSync, renameSync, rmSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { ID, LANG, ROOT, SKILL_MARK, archiveDir, colourLeaks, designFile, exists, pagesDir, passportFile, prototypeDir, readJson, recordProblems, sourceDir, tokenProblems } from './prototype-lib.mjs'

const [cmd, id, ...rest] = process.argv.slice(2)
const flag = (name) => { const i = rest.indexOf(name); return i >= 0 ? rest[i + 1] ?? '' : null }
const flags = (name) => rest.flatMap((v, i) => (v === name ? [rest[i + 1] ?? ''] : []))
const fail = (why) => { console.log(`===PROTOTYPE_FAIL=== ${why}`); process.exit(1) }
const write = (file, value) => { mkdirSync(join(file, '..'), { recursive: true }); writeFileSync(file, JSON.stringify(value, null, 2) + '\n', 'utf8') }

if (cmd === 'list') {
  const root = pagesDir()
  const ids = existsSync(root) ? readdirSync(root).filter((n) => ID.test(n)) : []
  if (!ids.length) { console.log('===PROTOTYPE_LIST=== none'); process.exit(0) }
  for (const n of ids) { const p = readJson(join(root, n, 'prototype.json')); console.log(`${n} · ${p?.status ?? '?'} · ${p?.skill ?? '?'} · from ${p?.from ?? '?'} · /<lang>/prototypes/${n}`) }
  process.exit(0)
}

if (!id || !ID.test(id)) fail('give the prototype id: lowercase letters, digits and dashes')
const dir = prototypeDir(id)

if (cmd === 'new') {
  if (exists(dir)) fail(`${id} exists — pick another id or regenerate inside it`)
  const skill = flag('--skill')
  if (!skill || !SKILL_MARK.test(skill)) fail('--skill <mark> is required (the skill the core handed to this element)')
  const from = flag('--from') || 'home'
  const src = sourceDir(from)
  if (!exists(src)) fail(`no source page «${from}» (home, or a folder of (publicLayer)/_pages)`)
  mkdirSync(dir, { recursive: true })
  for (const f of readdirSync(src)) if (LANG.test(f)) copyFileSync(join(src, f), join(dir, f))
  if (!existsSync(join(dir, 'en.json'))) write(join(dir, 'en.json'), { title: id, description: '', keywords: '', blocks: [] })
  write(join(dir, 'meta.json'), { order: Date.now() % 1_000_000 })
  write(join(dir, 'tokens.json'), readJson(designFile()) ?? {})
  const refs = flags('--ref').filter((u) => /^(https?:\/\/|\/)/.test(u)).map((url, i) => ({ url, ...(flags('--ref-caption')[i] ? { caption: flags('--ref-caption')[i] } : {}) }))
  const title = flag('--title')
  write(join(dir, 'prototype.json'), { id, skill, from, references: refs, status: 'draft', createdAt: new Date().toISOString(), ...(title ? { title } : {}) })
  console.log(`===PROTOTYPE_NEW=== ${id}: app/[lang]/(protectedLayer)/prototypes/_pages/${id}/ — the words of «${from}», a copy of the tokens, ${refs.length} reference(s).
Next: write tokens.json FIRST (the whole look: colours of both themes, fonts from lib/design/local-fonts.json, type, shape, motion),
then DESIGN.md (the rules tokens cannot hold), then the page's words and sections — no colour in the words, only tokens.
Then: npm run prototype -- done ${id}`)
  process.exit(0)
}

if (cmd === 'done') {
  if (!exists(dir)) fail(`no prototype ${id}`)
  const record = readJson(join(dir, 'prototype.json'))
  const problems = [
    ...recordProblems(record, id),
    ...tokenProblems(readJson(join(dir, 'tokens.json'))),
    ...(existsSync(join(dir, 'DESIGN.md')) ? [] : ['DESIGN.md is missing — the rules of the look that tokens cannot hold']),
    ...readdirSync(dir).filter((f) => LANG.test(f)).flatMap((f) => colourLeaks(readJson(join(dir, f)), f).map((l) => `a colour in the words, not in the tokens — ${l}`)),
  ]
  const en = readJson(join(dir, 'en.json'))
  if (!Array.isArray(en?.blocks) || en.blocks.length === 0) problems.push('en.json has no blocks — the page is not built yet')
  if (problems.length) fail(`${id} is not ready:\n  ${problems.join('\n  ')}`)
  write(join(dir, 'prototype.json'), { ...record, status: 'ready', readyAt: new Date().toISOString() })
  console.log(`===PROTOTYPE_READY=== ${id}: /<lang>/prototypes/${id} — take the screenshots into its shots/ (desktop.png, mobile.png) and report to the core.`)
  process.exit(0)
}

if (cmd === 'pin') {
  if (!exists(dir)) fail(`no prototype ${id}`)
  const record = readJson(join(dir, 'prototype.json'))
  if (!record || !['ready', 'pinned'].includes(record.status)) fail(`${id} is «${record?.status ?? 'unknown'}» — only a ready prototype is pinned (npm run prototype -- done ${id})`)
  const tokens = readJson(join(dir, 'tokens.json'))
  const bad = tokenProblems(tokens)
  if (bad.length) fail(`${id}: ${bad.join('; ')}`)
  // Токены победителя — документ дизайна элемента; ветки, которых форма прототипа не знает (если появятся у другого писателя), остаются.
  const before = readJson(designFile()) ?? {}
  const next = { ...before }
  for (const k of ['colors', 'fonts', 'type', 'shape', 'motion']) { if (tokens[k] !== undefined) next[k] = tokens[k]; else delete next[k] }
  write(designFile(), next)
  if (existsSync(join(dir, 'DESIGN.md'))) copyFileSync(join(dir, 'DESIGN.md'), join(ROOT, 'DESIGN.md'))
  // Слова победителя — исходной странице: она и есть то, что сравнивали; её «ожидает дизайна» снимается.
  const src = sourceDir(record.from)
  if (exists(src)) {
    for (const f of readdirSync(dir)) {
      if (!LANG.test(f)) continue
      const words = readJson(join(dir, f))
      const target = readJson(join(src, f)) ?? {}
      write(join(src, f), { ...target, blocks: words?.blocks ?? target.blocks ?? [] })
    }
    const meta = readJson(join(src, 'meta.json'))
    if (meta && meta.awaitingDesign) { delete meta.awaitingDesign; write(join(src, 'meta.json'), meta) }
  }
  const passport = readJson(passportFile()) ?? {}
  const at = new Date().toISOString()
  passport.designSkill = record.skill
  passport.design = { ...(passport.design ?? {}), skill: record.skill, pinned: { prototype: id, skill: record.skill, at, ...(record.references?.length ? { references: record.references } : {}) } }
  write(passportFile(), passport)
  // Все прототипы — в архив: победитель стал страницей, проигравшие — историей (запись, токены, DESIGN.md, снимки).
  mkdirSync(archiveDir(), { recursive: true })
  for (const n of readdirSync(pagesDir()).filter((x) => ID.test(x))) {
    const from = join(pagesDir(), n)
    const rec = readJson(join(from, 'prototype.json')) ?? {}
    write(join(from, 'prototype.json'), { ...rec, status: n === id ? 'pinned' : 'archived', closedAt: at })
    const to = join(archiveDir(), n)
    if (existsSync(to)) rmSync(to, { recursive: true, force: true })
    try { renameSync(from, to) } catch { cpSync(from, to, { recursive: true }); rmSync(from, { recursive: true, force: true }) }
  }
  console.log(`===DESIGN_PINNED=== ${id} (${record.skill}): its tokens are DESIGN-CONFIG/design-config.json, DESIGN.md is at the element's root,
its words are the page «${record.from}», the passport names the skill and the pin; the prototypes are archived.
Next: npm run describe:publish, commit, then «Preview & Deploy» — and remove any section code written only for a prototype that lost.`)
  process.exit(0)
}

fail('commands: new <id> --skill <mark> [--from home|<slug>] · done <id> · list · pin <id> (npm run design:pin -- <id>)')
