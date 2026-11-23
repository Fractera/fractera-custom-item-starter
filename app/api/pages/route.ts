// @api list this element's pages and who may open each one
import { NextRequest, NextResponse } from "next/server"
import { needNodeKey, nodeCaller, NO_STORE } from "@/lib/node-key"
import { handle } from "./pages.mjs"
import { ALL_ROLES, ARCHITECT_LAYER_ROLES, PROTECTED_GROUP_ROLES, rolesThatSee } from "@/lib/roles"
import { elementRoot } from "@/lib/page-tree"

// DOOR pages — made by `npm run door:add` (node step 548-16). The other elements of the node call it on the machine's loopback
// (http://127.0.0.1:<port>/api/pages) with the header X-Node-Key — their code through `neighbourFetch` (lib/neighbour.mjs); the gate
// of proxy.ts lets the loopback through, the key decides here and names the caller (818-7). The work is `handle()` in ./pages.mjs —
// this file only checks the key and turns JSON in and out.
export const dynamic = "force-dynamic"

// 848-7: the gate of every protected branch — the same roles its layout gives `AccessGate`; a branch missing here is listed with access
// «unknown» (null), never guessed. `tg` is the Mini App itself (its layout opens it to the admin branch's roles).
const BRANCH_ROLES: Record<string, readonly string[]> = {
  ...PROTECTED_GROUP_ROLES,
  tg: PROTECTED_GROUP_ROLES.admin,
  "messenger-h2a": ARCHITECT_LAYER_ROLES,
  "messenger-h2h": ARCHITECT_LAYER_ROLES,
  prototypes: ["architect"],
}

export async function GET(req: NextRequest) {
  const caller = nodeCaller(req.headers.get("x-node-key"))
  if (!caller) return needNodeKey()
  const input = Object.fromEntries(req.nextUrl.searchParams)
  const { status, body } = await handle(input, caller, { root: elementRoot(), branchRoles: BRANCH_ROLES, allRoles: [...ALL_ROLES], rolesThatSee, groups: PROTECTED_GROUP_ROLES })
  return NextResponse.json(body, { status, headers: NO_STORE })
}
