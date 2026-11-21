// THE ELEMENT'S OWN MEMORY, PER PROJECT (node step 825-3; the owner, 2026-11-21, Telegram 532: «пользователь переходит с кнопки X Twitter
// и говорит продолжим … заодно посмотри то что делали несколько недель назад … ты должен уметь выискивать данные связанные с прошлыми
// публикациями. Для этого у тебя есть память … есть страницы»). Pure functions, no fetch: what goes to the node's deep memory and how a
// project is named in it. The memory keeps this element's words in this element's own space (its key is its `from`); a project travels
// inside the words, so a question about it finds them by meaning. `scripts/memory.mjs` sends; `project-memory.test.mjs` proves.

const PROJECT = /^[a-z0-9][a-z0-9-]{0,60}(\/[a-z0-9][a-z0-9-]{0,60})?$/

/** `<group>` or `<group>/<item>` of the Mini App's Projects, or null for anything else. */
export const projectOf = (raw) => (typeof raw === 'string' && PROJECT.test(raw.trim()) ? raw.trim() : null)

/** The arguments of `npm run memory -- <remember|recall> "<words>" [--project <group>/<item>] [--lang <code>]`, or an error. */
export function parseArgs(argv) {
  const [verb, ...rest] = argv
  if (verb !== 'remember' && verb !== 'recall') return { error: 'the first word is remember or recall' }
  const words = []
  let project = null
  let lang = null
  for (let i = 0; i < rest.length; i++) {
    if (rest[i] === '--project') { project = projectOf(rest[++i]); if (!project) return { error: 'the project is <group> or <group>/<item> of the Mini App, e.g. social/instagram' } }
    else if (rest[i] === '--lang') lang = String(rest[++i] ?? '').trim() || null
    else words.push(rest[i])
  }
  const text = words.join(' ').trim()
  if (!text) return { error: 'no words to keep or to ask' }
  return { verb, text, project, lang }
}

/** The body for the memory's `/v1/remember` or `/v1/recall`: the project named in the words, this element as the only `from`. */
export function memoryBody({ verb, text, project, lang }, me) {
  const words = project ? (verb === 'remember' ? `[project ${project}] ${text}` : `${text} (project ${project})`) : text
  return { text: words, from: [me], ...(lang ? { lang } : {}) }
}
