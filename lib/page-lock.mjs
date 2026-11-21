// THE LOCK OF A DATA-FOLDER PAGE — which roles open it (`lib/branch-page.tsx`, its `AccessGate` and the `{roles}` of its text).
// The page's own role folder and `meta.roles`, each with every role that inherits it (402), plus the architect — and, inside a branch
// the element manages, the roles of that branch's own lock: the branch's layout lets its people in, and a child page must never lock
// them out again.
// ✗ 805 (the owner on his server, 2026-11-19): the element's own admin (`OWN_ADMIN_ROLE`, 778) was shut out of the child pages of
// `admin`, `staff`, `finance`. ✗ 2026-11-21 (the owner in Telegram, the element j58fl): the same hole in the Mini App — the branch `tg`
// opens to the admin group (its layout: `PROTECTED_GROUP_ROLES.admin`), its screens (Cron, Element, Projects, Settings) carry
// `meta.roles: ["admin"]`, and their lock asked for «admin, architect» while the element's admin held `elementAdmin002`.

/** Which group's lock a branch of the protected layer stands behind — the branch's own layout decides, this table repeats it. */
export const BRANCH_GROUP = Object.freeze({ admin: 'admin', staff: 'staff', finance: 'finance', tg: 'admin' })

/**
 * @param {{ own: string|null, metaRoles?: readonly string[], branch: string, rolesThatSee: (role: string) => string[],
 *   groups: Readonly<Record<string, readonly string[]>> }} x
 * @returns {string[]|null} `null` — the page has no lock of its own
 */
export function pageLock({ own, metaRoles = [], branch, rolesThatSee, groups }) {
  const base = [...(own ? [own] : []), ...metaRoles]
  if (base.length === 0) return null
  const set = new Set(base.flatMap(rolesThatSee))
  set.add('architect')
  const group = Object.hasOwn(BRANCH_GROUP, branch) ? BRANCH_GROUP[branch] : null
  if (group) for (const r of groups[group] ?? []) set.add(r)
  return [...set]
}
