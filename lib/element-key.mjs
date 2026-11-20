// THE KEYS OF THE NODE'S ELEMENTS, checked offline (node step 818-7, the red team's H6) — the same derivation as the core's
// `lib/element-key.cjs` and the stores' `element-key.mjs`, word for word; one file in the custom and the native template.
// - An element's own key `<id>.<HMAC-SHA256(DATA_SECRET, "fractera-element-key:v1:" + id)>`: the installer writes it into every custom
//   element (ELEMENT_KEY, and its SETTINGS_SECRET since 818-7c). A native element holds DATA_SECRET and reads the id from it (`elementOf`).
// - A pair key `<caller>.<HMAC-SHA256(the callee's own key, "fractera-pair-key:v1:" + caller)>`: only the core mints it (the door
//   `/api/node/pair-key`); a custom element checks it with its own key and learns which neighbour calls (`pairCallerOf`).
// 🔒 The labels are versioned (`v1`): a new derivation is a new label, never an old key read under new rules. The test vectors —
// `scripts/check-element-key.mjs`, part of the prebuild: a copy that drifts would refuse every element of the node or let a wrong key in.
import { createHmac, timingSafeEqual } from 'node:crypto'

const ELEMENT_LABEL = 'fractera-element-key:v1:'
const PAIR_LABEL = 'fractera-pair-key:v1:'
// The registry's element id (a DNS label): no dot, so `<id>.<mac>` splits at its first dot.
const ELEMENT_ID = /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/

export const isElementId = (id) => typeof id === 'string' && ELEMENT_ID.test(id)
const mac = (secret, label, id) => createHmac('sha256', secret).update(label + id).digest('base64url')

/** Two keys are the same — compared in constant time; an empty one is never the same as anything. */
export function sameKey(given, expected) {
  if (typeof given !== 'string' || typeof expected !== 'string' || !given || !expected) return false
  const a = Buffer.from(given)
  const b = Buffer.from(expected)
  return a.length === b.length && timingSafeEqual(a, b)
}

/** `<id>.<mac>` → the id when the mac is right for this secret and label, else null. */
function idOf(presented, secret, label) {
  if (!secret || typeof presented !== 'string') return null
  const dot = presented.indexOf('.')
  if (dot <= 0) return null
  const id = presented.slice(0, dot)
  if (!isElementId(id)) return null
  return sameKey(presented.slice(dot + 1), mac(secret, label, id)) ? id : null
}

/** An element's own key, or null for a bad id or an empty secret. */
export function elementKeyOf(id, dataSecret) {
  return dataSecret && isElementId(id) ? `${id}.${mac(dataSecret, ELEMENT_LABEL, id)}` : null
}

/** The element a presented own key belongs to (checked with the node's DATA_SECRET), or null. */
export function elementOf(presented, dataSecret) {
  return idOf(presented, dataSecret, ELEMENT_LABEL)
}

/** The pair key for `caller` at the doors of the element whose own key is `calleeKey`, or null. */
export function pairKeyOf(caller, calleeKey) {
  return calleeKey && isElementId(caller) ? `${caller}.${mac(calleeKey, PAIR_LABEL, caller)}` : null
}

/** The neighbour a presented pair key names (checked with this element's own key), or null. */
export function pairCallerOf(presented, ownKey) {
  return idOf(presented, ownKey, PAIR_LABEL)
}
