import type { NextRequest } from "next/server"
import { getSession } from "@/lib/auth/get-session"
import { PROTECTED_GROUP_ROLES } from "@/lib/roles"

/** The lock of the Mini App's doors (node step 821): the admin category — the architect and this element's own admin
 *  (`lib/roles.ts` → PROTECTED_GROUP_ROLES.admin), the same as the branch's pages; a guest 401, another role 403. */
export async function adminOfMiniApp(req: NextRequest): Promise<200 | 401 | 403> {
  const s = await getSession(req)
  if (!s) return 401
  return (s.roles ?? []).some((r) => (PROTECTED_GROUP_ROLES.admin as readonly string[]).includes(r)) ? 200 : 403
}
