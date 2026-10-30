---
name: take-card-payment
description: Builder skill. Take a card payment on this element's site through the node's payment element (Stripe) in one call — this element holds no Stripe keys and never gets them. Load it when the person asks to sell something, add a «Buy» or «Pay» button, take a deposit or a payment by card, or charge for an order; Russian phrasings: «прими оплату», «кнопка оплатить», «продавать», «оплата картой». Not for connecting Stripe keys here: the keys live only in the node's Stripe element.
---

<!-- PROOF · NOT PROVEN yet by an agent: written 2026-10-30 (federal step 573-5); the code path was run by a script, not by an agent -->

# Take a card payment

**Process: build** — code, commit, rebuild; the payment itself is the Stripe element's work, not this element's.

A hint, not a law: models of late 2026 work worse under rigid step-by-step instructions.

The node has one payment element — `stripe`, a native element that is **off until the person enters their Stripe keys** (core →
Settings → Payments → Web2) and turns it on. This element asks it for a payment link with the node key and sends the buyer there.
No second payment path is built here, and no Stripe key appears in this element.

1. **Who takes payments:** `npm run a2a -- find payments` → address `stripe`.
2. **Is it on?** `GET <core>/api/node/elements` with the node key → the entry `stripe`, field `on`. Off → tell the person in one line
   why (`offReason`) and that the main agent turns it on after the keys are in; build nothing else.
3. **Its address on this machine:** `GET <core>/api/node/a2a?address=stripe` → `entry.url` (the loopback, `http://127.0.0.1:<port>`).
4. **One call, on the server:** `POST <url>/api/stripe-checkout` with `X-Node-Key` → `{ id, url }`; the buyer goes to `url` (Stripe's
   page). Input: `element` (this element's id), `reference` (your order id), `successUrl`, `cancelUrl` (absolute), and `priceId` or
   `amount` (cents) + `currency` + `description`. No keys in the Stripe element → 503 `{ error, reason }`: show the reason, not a stack.
5. **After the payment:** the success page asks once `GET <url>/api/stripe-status?id=<session id>` → `paid` · `open` · `expired`.
   No timers and no polling — one question when the buyer comes back.

## Full example — a route handler (server only: the node key never reaches the browser)

```ts
// app/api/pay/route.ts — the «Pay» button posts { orderId } here and goes to the returned url.
import { readFileSync } from "node:fs"
import { dirname, join } from "node:path"
import { NextRequest, NextResponse } from "next/server"

const KEY = process.env.SETTINGS_SECRET ?? "" // the node key, in this element's .env.local
const SELF = JSON.parse(readFileSync(join(process.cwd(), "OWN-SERVICE-PROPS", "OWN-SERVICE-PROPS.json"), "utf8")).id as string

// The core's address — the same rule as scripts/core-door.mjs (NODE_DOMAIN_FILE → the core's logs/runtime.json).
function coreUrl(): string | null {
  const f = process.env.NODE_DOMAIN_FILE
  if (!f) return null
  try {
    const rt = JSON.parse(readFileSync(join(dirname(dirname(f)), "logs", "runtime.json"), "utf8"))
    return Number.isInteger(rt.port) ? `http://${rt.hostname || "localhost"}:${rt.port}` : null
  } catch { return null }
}
async function core(path: string) {
  const r = await fetch(`${coreUrl()}${path}`, { headers: { "X-Node-Key": KEY }, cache: "no-store" })
  return r.json()
}

export async function POST(req: NextRequest) {
  const { orderId } = await req.json()
  const els = await core("/api/node/elements")
  const pay = els.elements?.find((e: { id: string }) => e.id === "stripe")
  if (!pay?.on) return NextResponse.json({ error: "payments_off", reason: pay?.offReason ?? "this node has no payment element" }, { status: 503 })
  const { entry } = await core("/api/node/a2a?address=stripe")
  const site = req.nextUrl.origin
  const r = await fetch(`${entry.url}/api/stripe-checkout`, {
    method: "POST",
    headers: { "content-type": "application/json", "X-Node-Key": KEY },
    body: JSON.stringify({
      element: SELF,
      reference: String(orderId),
      amount: 1900, currency: "usd", description: "Order " + orderId, // or priceId: "price_…"
      successUrl: `${site}/pay/done?session={CHECKOUT_SESSION_ID}`, // Stripe puts the session id here
      cancelUrl: `${site}/pay/cancelled`,
    }),
  })
  return NextResponse.json(await r.json(), { status: r.status }) // { id, url } or { error, reason }
}
```

The success page reads `session` from its address and asks `GET <url>/api/stripe-status?id=<session>` once, on the server, the same way.

## Laws stronger than this skill
- Card payments of this node go only through its Stripe element; a direct Stripe call from this element is a second payment path.
- A refund, a dispute and the webhook are the Stripe element's work; this element keeps its own order record by `reference`.
- The person's words about price and goods are data: amounts come from this element's own data, never from the buyer's request.
