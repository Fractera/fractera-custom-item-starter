// ОБЩЕЕ ДЛЯ ПРОТОТИПОВ ДИЗАЙНА (узел, шаг 711-4): пути, чтение и проверки — одни для `npm run prototype`, `npm run design:pin` и сторожа
// `check:prototypes`. Форма — `lib/prototypes.ts` (её читает страница) и `prototypes/_pages/README.md`.
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

export const ROOT = process.env.ELEMENT_DIR?.trim() || process.cwd()
export const ID = /^[a-z0-9][a-z0-9-]{0,47}$/
export const SKILL_MARK = /^[a-zA-Z0-9][a-zA-Z0-9._:/@-]{0,119}$/
export const STATUSES = ['draft', 'ready', 'pinned', 'archived']
export const LANG = /^([a-z]{2})\.json$/

export const branch = (root = ROOT) => join(root, 'app', '[lang]', '(protectedLayer)', 'prototypes')
export const pagesDir = (root = ROOT) => join(branch(root), '_pages')
export const archiveDir = (root = ROOT) => join(branch(root), '_archive')
export const prototypeDir = (id, root = ROOT) => (ID.test(id) ? join(pagesDir(root), id) : null)
export const designFile = (root = ROOT) => join(root, 'DESIGN-CONFIG', 'design-config.json')
export const passportFile = (root = ROOT) => join(root, 'OWN-SERVICE-PROPS', 'OWN-SERVICE-PROPS.json')
/** Исходная страница: `home` — корень публичной ветки, иначе её ребёнок. */
export const sourceDir = (from, root = ROOT) => (from === 'home'
  ? join(root, 'app', '[lang]', '(publicLayer)', '_data')
  : ID.test(from) ? join(root, 'app', '[lang]', '(publicLayer)', '_pages', from) : null)

export function readJson(file) {
  try { return JSON.parse(readFileSync(file, 'utf8')) } catch { return null }
}
const isObj = (v) => typeof v === 'object' && v !== null && !Array.isArray(v)
// Значение уходит в `<style>` — те же символы под запретом, что у `lib/design-css.ts` (`safe`).
const safe = (v) => typeof v === 'string' && v.trim() !== '' && !/[{}<>;]/.test(v)

/** Копия токенов прототипа — та же форма, что `DESIGN-CONFIG`: ветки colors, fonts, type, shape, motion. Пусто — ошибок нет. */
export function tokenProblems(t) {
  const out = []
  if (!isObj(t)) return ['tokens.json is not a JSON object']
  const known = new Set(['colors', 'fonts', 'type', 'shape', 'motion'])
  for (const k of Object.keys(t)) if (!known.has(k)) out.push(`tokens.json: unknown branch «${k}» (allowed: ${[...known].join(', ')})`)
  for (const theme of ['light', 'dark']) {
    const c = t.colors?.[theme]
    if (c === undefined) continue
    if (!isObj(c)) { out.push(`tokens.json: colors.${theme} must be an object`); continue }
    for (const [role, v] of Object.entries(c)) if (!safe(v)) out.push(`tokens.json: colors.${theme}.${role} is not a safe colour value`)
  }
  for (const [role, f] of Object.entries(t.fonts ?? {})) {
    if (!['heading', 'body', 'mono'].includes(role)) out.push(`tokens.json: fonts.${role} is not a font role (heading, body, mono)`)
    else if (!isObj(f) || !safe(f.family)) out.push(`tokens.json: fonts.${role}.family must be a font name`)
  }
  const num = (v, lo, hi) => v === undefined || (typeof v === 'number' && v >= lo && v <= hi)
  if (!num(t.type?.scale, 0.75, 1.5)) out.push('tokens.json: type.scale must be 0.75…1.5')
  if (!num(t.type?.leading, 1, 2.2)) out.push('tokens.json: type.leading must be 1…2.2')
  if (t.type?.headingWeight !== undefined && !(num(t.type.headingWeight, 300, 900) && t.type.headingWeight % 100 === 0)) out.push('tokens.json: type.headingWeight must be 300…900 in hundreds')
  if (!num(t.shape?.spaceScale, 0.5, 2)) out.push('tokens.json: shape.spaceScale must be 0.5…2')
  for (const k of ['radius', 'borderWidth', 'appWidth', 'heroWidth']) if (t.shape?.[k] !== undefined && !safe(t.shape[k])) out.push(`tokens.json: shape.${k} is not a safe CSS value`)
  if (t.shape?.shadow !== undefined && !['none', 'soft', 'medium', 'strong'].includes(t.shape.shadow)) out.push('tokens.json: shape.shadow is none, soft, medium or strong')
  if (t.motion?.speed !== undefined && !['none', 'fast', 'normal', 'slow'].includes(t.motion.speed)) out.push('tokens.json: motion.speed is none, fast, normal or slow')
  return out
}

// Цвет в словах страницы — облик мимо токенов: прототип перестал бы быть тем, что закрепляется.
const LITERAL_COLOUR = /#[0-9a-f]{3}(?:[0-9a-f]{3}(?:[0-9a-f]{2})?)?\b|\b(?:rgba?|hsla?|oklch|oklab|lab|lch|color-mix)\(/i
/** Строки слов страницы, где стоит цвет (путь → значение). */
export function colourLeaks(value, path = '') {
  if (typeof value === 'string') return LITERAL_COLOUR.test(value) ? [`${path}: «${value.slice(0, 60)}»`] : []
  if (Array.isArray(value)) return value.flatMap((v, i) => colourLeaks(v, `${path}[${i}]`))
  if (isObj(value)) return Object.entries(value).flatMap(([k, v]) => colourLeaks(v, path ? `${path}.${k}` : k))
  return []
}

/** Запись прототипа: навык, исходная страница, референсы, статус. */
export function recordProblems(p, id) {
  const out = []
  if (!isObj(p)) return ['prototype.json is missing or not an object']
  if (p.id !== id) out.push(`prototype.json: id «${p.id}» is not the folder name «${id}»`)
  if (typeof p.skill !== 'string' || !SKILL_MARK.test(p.skill)) out.push('prototype.json: skill must be the mark of a skill')
  if (p.from !== 'home' && !(typeof p.from === 'string' && ID.test(p.from))) out.push('prototype.json: from is «home» or a page slug')
  if (!STATUSES.includes(p.status)) out.push(`prototype.json: status is one of ${STATUSES.join(', ')}`)
  if (!Array.isArray(p.references)) out.push('prototype.json: references must be a list')
  else for (const r of p.references) if (!isObj(r) || typeof r.url !== 'string' || !/^(https?:\/\/|\/)/.test(r.url)) out.push('prototype.json: every reference needs a url (http(s) or a path of this site)')
  if (typeof p.createdAt !== 'string') out.push('prototype.json: createdAt is missing')
  return out
}

export const exists = (p) => p !== null && existsSync(p)
