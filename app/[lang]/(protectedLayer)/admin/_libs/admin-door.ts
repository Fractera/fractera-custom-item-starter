import type { NextRequest } from "next/server"
import { getSession } from "@/lib/auth/get-session"
import { PROTECTED_GROUP_ROLES } from "@/lib/roles"

/** The lock of the administration's doors (node step 840-5; the owner, Telegram 978: «дизайн … CONFIG вообще закрыты для администратора.
 *  Доступны только для архитектора это неправильно»): the same admin category as the branch's pages — the architect and this element's
 *  own admin (`PROTECTED_GROUP_ROLES.admin`, a Telegram ticket included) — and the node's `admin` role as before; a guest 401, another 403. */
export async function adminOfElement(req: NextRequest): Promise<200 | 401 | 403> {
  const s = await getSession(req)
  if (!s) return 401
  const allowed: readonly string[] = [...PROTECTED_GROUP_ROLES.admin, "admin"]
  return (s.roles ?? []).some((r) => allowed.includes(r)) ? 200 : 403
}
