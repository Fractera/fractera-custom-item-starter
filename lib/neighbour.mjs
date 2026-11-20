// A NEIGHBOUR'S DOOR, called by this element's code (node step 818-7d, the red team's H6). Two agents of the node agree an API over i2i;
// then the code calls the neighbour's door directly on the machine's loopback, with no model. Since 818-7 no element holds a key that
// opens every door, so this element first asks the core, with its own key, what to present at ONE neighbour's doors:
// `GET <core>/api/node/pair-key?to=<id>` → `{ port, key }` — a pair key that names this element to that neighbour only (an element
// calling a custom element), that element's own key (a native calling a custom element), or `null`: present your own key (anyone calling
// a native). The answer is kept for the life of the process — the same pair always gets the same key. One file in the custom and the
// native template; the scripts pass the values of `.env.local` as `env`.
//
//   import { neighbourFetch } from "@/lib/neighbour.mjs"
//   const r = await neighbourFetch("<neighbour id>", "/api/<door>", { method: "POST", body: JSON.stringify(input) })
//
// 🔒 Never another key when a neighbour refuses: a hostile neighbour answers 401 to be given a better one. The key is never printed.
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'

const doors = new Map()

/** The core on this machine's loopback — from the node (NODE_DOMAIN_FILE → logs/runtime.json), never remembered; null when unknown. */
export function coreUrlOf(env = process.env) {
  const domainFile = String(env.NODE_DOMAIN_FILE ?? '').trim()
  if (domainFile) {
    try {
      const rt = JSON.parse(readFileSync(join(/*turbopackIgnore: true*/ dirname(dirname(domainFile)), 'logs', 'runtime.json'), 'utf8'))
      if (Number.isInteger(rt.port)) return `http://${typeof rt.hostname === 'string' && rt.hostname ? rt.hostname : 'localhost'}:${rt.port}`
    } catch { /* the node did not say its port */ }
  }
  const a = String(env.ARCHITECT_URL ?? '').trim()
  return a && /^http:\/\/(127\.0\.0\.1|localhost)(:\d+)?\/?$/.test(a) ? a.replace(/\/+$/, '') : null
}

/** Where and with which key to call neighbour `id`: `{ id, url, key }`. Throws with the core's reason. */
export async function neighbourDoor(id, { env = process.env } = {}) {
  const known = doors.get(id)
  if (known) return known
  const own = String(env.SETTINGS_SECRET ?? '').trim()
  const core = coreUrlOf(env)
  if (!own) throw new Error('no key of this element (SETTINGS_SECRET) — it is not installed on this node')
  if (!core) throw new Error('the address of the core is unknown here (NODE_DOMAIN_FILE → logs/runtime.json)')
  const r = await fetch(`${core}/api/node/pair-key?to=${encodeURIComponent(id)}`, {
    headers: { 'X-Node-Key': own },
    signal: AbortSignal.timeout(8000),
  })
  const b = await r.json().catch(() => null)
  if (!r.ok || !b?.ok || !Number.isInteger(b.port)) throw new Error(`the core gave no key for «${id}»: ${b?.reason ?? `HTTP ${r.status}`}`)
  const door = { id, url: `http://127.0.0.1:${b.port}`, key: typeof b.key === 'string' && b.key ? b.key : own }
  doors.set(id, door)
  return door
}

/** fetch() of a neighbour's door — `path` like `/api/<door>`; its key goes in `X-Node-Key`. */
export async function neighbourFetch(id, path, init = {}, opts = {}) {
  const { url, key } = await neighbourDoor(id, opts)
  const headers = new Headers(init.headers ?? {})
  headers.set('X-Node-Key', key)
  if (init.body && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json')
  return fetch(`${url}${path.startsWith('/') ? path : `/${path}`}`, { ...init, headers })
}
