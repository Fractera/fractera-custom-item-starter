// THE KEY OF A DOOR (node step 548-16; who calls — 818-7, the red team's H6). One check for every door that the core and the other
// elements of the node call: the header `X-Node-Key`, compared in constant time. A custom element holds no key of the whole node since
// 818-7c — its `SETTINGS_SECRET` is its own key `<id>.<mac>`, and its doors open to two keys:
// - its own key — the core and the native elements present it (the node holds the data secret it is made from) → `{ kind: "node" }`;
// - a pair key `<caller>.<HMAC(this element's own key, …)>` — a neighbour's code got it from the core for THIS element's doors
//   (`lib/neighbour.mjs`), checked offline with the own key (`lib/element-key.mjs`) → `{ kind: "element", id }`: it opens nothing else.
// A door made by `npm run door:add` imports it and hands `nodeCaller` to its work: a neighbour's call is answered with that neighbour's
// own data only — the id comes from the key, never from the body. `nodeOnly` — a door that changes this element itself (its settings,
// its agent's tasks) answers the node alone.
//
// 🔒 The gate of `proxy.ts` lets a call on the machine's loopback through (`lib/auth/owner-at-machine.ts`) — a neighbour calls
// http://127.0.0.1:<port>/api/<door>. From the internet the gate asks for a session first, so a node door stays inside the node.
import { NextResponse } from "next/server"
import { pairCallerOf, sameKey } from "@/lib/element-key.mjs"

export const NO_STORE = { "Cache-Control": "no-store" }

export type NodeCaller = { kind: "node" } | { kind: "element"; id: string }

/** Who calls: the core or a native (this element's own key), a neighbour (its pair key), or nobody (null). */
export function nodeCaller(given: string | null): NodeCaller | null {
  const own = process.env.SETTINGS_SECRET ?? ""
  if (!given || !own) return null
  if (sameKey(given, own)) return { kind: "node" }
  const id = pairCallerOf(given, own)
  return id ? { kind: "element", id } : null
}

/** A caller of this node — the own key or a neighbour's pair key. */
export function nodeKeyOk(given: string | null): boolean {
  return nodeCaller(given) !== null
}

/** Only this element's own key — the core and the native elements. */
export function nodeOnly(given: string | null): boolean {
  return nodeCaller(given)?.kind === "node"
}

/** The answer to a call without a key of this node: the reason and the header the caller needs. */
export function needNodeKey() {
  return NextResponse.json(
    { error: "bad_key", reason: "send this element's key or your pair key from the core in the X-Node-Key header" },
    { status: 401, headers: { ...NO_STORE, "WWW-Authenticate": 'ApiKey header="X-Node-Key"' } },
  )
}
