// THE KEY THIS ELEMENT OPENS THE NODE'S STORES WITH (node step 654-6) — one place for the server code (`data-service.ts`) and for the
// scripts Next does not start (`scripts/seed-media*.mjs`, `scripts/stores.mjs`).
//
// The owner of the node, 2026-11-05: «объектное хранилище должно быть обновлено не только для использования глубинной памятью но и для
// использования просто внутри элемента»; «DATA_SECRET сейчас, другой — 655».
//
// 🔒 THE ELEMENT'S OWN KEY FIRST. The node installer writes `ELEMENT_KEY` (`<element id>.<mac>`): the data element, the storage, the
// vectors and the graph open with it this element's own space — its own database file, its own files, collections and graph spaces —
// and nothing of its neighbours'. A custom element no longer receives the node's data key. `DATA_API_KEY` / `DATA_SECRET` are read only
// where `ELEMENT_KEY` is absent — a laptop with an environment downloaded before 654-6, or an element born from an older template — and
// then open the whole node as before.
// 🔒 No `node:fs` here: the module stays importable by any server file; a script reads its own `.env.local` and passes the values in.

/**
 * The headers that open the stores: `{ 'X-Element-Key' }`, `{ 'X-Data-Secret' }` or none. `env` — the process environment by default.
 * @param {Record<string, string | undefined>} [env]
 * @returns {Record<string, string>}
 */
export function storeHeaders(env = process.env) {
  const own = String(env.ELEMENT_KEY ?? '').trim()
  if (own) return { 'X-Element-Key': own }
  const node = String(env.DATA_API_KEY || env.DATA_SECRET || '').trim()
  return node ? { 'X-Data-Secret': node } : {}
}

/**
 * Which key the headers carry — for words to a person: `element <id>`, `node` or `none`.
 * @param {Record<string, string>} headers
 * @returns {string}
 */
export function storeScope(headers) {
  if (headers['X-Element-Key']) return `element ${String(headers['X-Element-Key']).split('.')[0]}`
  return headers['X-Data-Secret'] ? 'node' : 'none'
}
