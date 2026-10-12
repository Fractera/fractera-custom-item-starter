// СНИМОК СТАРТОВОГО ДЕРЕВА ЭЛЕМЕНТА (шаг узла 462). Запускается В ШАБЛОНЕ (fractera-item-starter) перед тегом:
// `node scripts/tree-manifest.mjs` → `.claude/skills/use-element-tree/tree-manifest.json`. Элемент получает снимок вместе с навыком
// при рождении или «Обновить»; сторож `scripts/check-tree.mjs` сверяет с ним элемент при каждой сборке.
//
// Владелец 2026-10-12: «я не уверен в том что однажды какой-нибудь агент не повредит наше дерево например, он решит просто удалить
// лишние страницы, и тогда задача навыка была предоставить решение чтобы вернуть проект к нужной стабильной стартовой архитектуры».
//
// Что входит: каждый файл под app/ (маршруты, данные страниц, README) — их удаление и есть «удалили страницу»; папки components/,
// lib/, config/, _tools/, папки навыков, папки настроек и паспорта, обязательные корневые файлы. Сгенерированные файлы — нет.
import { execSync } from 'node:child_process'
import { writeFileSync } from 'node:fs'
import { join, dirname, posix } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const tracked = execSync('git ls-files', { cwd: ROOT, encoding: 'utf8' }).split('\n').filter(Boolean)
const generated = (p) => /(^|\/)_list\.generated\.ts$|\.generated\.(json|ts)$/.test(p)
const files = tracked.filter((p) => p.startsWith('app/') && !generated(p)).sort()
const dirsOf = (prefix, depth) => [...new Set(tracked.filter((p) => p.startsWith(prefix)).map((p) => {
  const parts = p.split('/').slice(0, -1)
  return parts.slice(0, depth ? Math.min(parts.length, depth) : parts.length).join('/')
}).filter((d) => d.startsWith(prefix.replace(/\/$/, ''))))].sort()
const dirs = [
  ...dirsOf('components/'), ...dirsOf('lib/'), ...dirsOf('config/'), ...dirsOf('_tools/'),
  ...dirsOf('.claude/skills/', 3), ...['APP-CONFIG', 'DESIGN-CONFIG', 'PLATFORM-CONFIG', 'OWN-SERVICE-PROPS', 'development-docs'],
]
const rootFiles = ['CLAUDE.md', 'README.md', 'NODE-CONTRACT.json', 'package.json', 'next.config.ts', 'proxy.ts'].filter((f) => tracked.includes(f))
// Версия — тег, В КОТОРОМ снимок поедет (передаётся аргументом: node scripts/tree-manifest.mjs v0.3.89); без аргумента — «после» последнего тега.
const version = process.argv[2] || (() => { try { return 'after ' + execSync('git describe --tags --abbrev=0', { cwd: ROOT, encoding: 'utf8' }).trim() } catch { return 'untagged' } })()
const out = { _: 'Starting tree of a Fractera element (node step 462). Written by scripts/tree-manifest.mjs in fractera-item-starter; checked by scripts/check-tree.mjs. Never edit by hand.', template: 'fractera-item-starter', after: version, files, dirs: [...new Set(dirs)], rootFiles }
writeFileSync(join(ROOT, '.claude', 'skills', 'use-element-tree', 'tree-manifest.json'), JSON.stringify(out, null, 1) + '\n')
console.log(`===TREE_MANIFEST_OK=== files ${files.length}, dirs ${out.dirs.length}, root files ${rootFiles.length} (after ${version})`)
