// The project's role vocabulary — the full set of roles the application
// recognises for role-based access. Mirrors ai-workspace's
// `app/config/ui/initial-app-config.ts` ALL_ROLES so the starter ships the
// same role model the platform documents.
//
// Two layers:
//   • Access tiers ENFORCED by the auth substrate + the route's own gate (the
//     subgroup `layout.tsx`, requireRole): `guest` → `user` → `architect`
//     (owner / top tier).
//   • The remaining entries are the business RBAC vocabulary the app can assign
//     and gate on (customer-facing, staff/operations, admin).
export const ALL_ROLES = [
  // Access tiers (enforced)
  'guest',
  'user',
  'architect',
  // Customer-facing
  'buyer',
  'vip_user',
  'subscriber_lite',
  'subscriber_standard',
  'subscriber_max',
  // Staff / operations
  'manager',
  'senior_manager',
  'support_manager',
  'delivery_manager',
  'finance',
  'content_editor',
  // Admin
  'admin',
] as const

export type AppRole = typeof ALL_ROLES[number]

// The three tiers the auth substrate actually enforces at the page/API gate.
export const ACCESS_TIERS = ['guest', 'user', 'architect'] as const
export type AccessTier = typeof ACCESS_TIERS[number]

// ── Админ элемента (шаг 778 узла, владелец 2026-11-17) ──────────────────────
//
// Одно семейство на все проекты Fractera: `elementAdmin001…elementAdmin980` («во всех проектах могут быть одинаковыми изначально создать
// и жёстко пришить использовать только эти названия»). Номер ЭТОГО элемента узел берёт из своего реестра при рождении и кладёт в
// окружение (`NEXT_PUBLIC_ELEMENT_ADMIN_ROLE`, род derived в .env.example) — он вшивается в сборку, поэтому и замок страницы в браузере,
// и прокси, и двери знают одно и то же имя. Нет номера (элемент вне узла, чужая сборка) — роли нет: войдёт только архитектор.
// 🔒 Семейство НЕ в `ALL_ROLES`: этот список читают выборы ролей, и 980 имён похоронили бы настоящие.
export const ELEMENT_ADMIN_COUNT = 980
const ELEMENT_ADMIN_RE = /^elementAdmin(\d{3})$/

/** Одна из 980 ролей админов элементов? */
export function isElementAdminRole(role: string): boolean {
  const m = ELEMENT_ADMIN_RE.exec(role)
  if (!m) return false
  const n = Number(m[1])
  return n >= 1 && n <= ELEMENT_ADMIN_COUNT
}

/** Роль админа ЭТОГО элемента (`elementAdmin007`) или пусто. */
export const OWN_ADMIN_ROLE: string = (() => {
  const r = (process.env.NEXT_PUBLIC_ELEMENT_ADMIN_ROLE ?? "").trim()
  return isElementAdminRole(r) ? r : ""
})()

// ── Role groups of the protected layer ──────────────────────────────────────
//
// One subgroup of `app/[lang]/(protectedLayer)/` = one entry here, and this is
// the ONLY place the membership is written. The subgroup's `layout.tsx` reads
// it and the access dialog lists it to the visitor. Two copies of a role list
// drift, and the copy that drifts is always the one guarding something.
//
// The dividing question is WHOSE data the page shows — not how the screen
// looks. `(account)` shows the visitor their own; `(staff)` shows them other
// people's, on duty; `(finance)` moves money; `(admin)` administers the project
// itself. Full reasoning: each subgroup's README.md.
//
// `architect` is in every group on purpose: the owner of the deployment is
// never locked out of their own application.
// 🔒 `admin` СТОИТ ТОЛЬКО В СВОЁМ СЛОЕ (решение владельца 2026-08-11). Раньше он
// был во всех четырёх, «на всякий случай», — и это делало невозможным то, ради
// чего роли вообще существуют: РАЗЛИЧАТЬСЯ. Требование владельца звучало так:
// администратор умеет удалить товар и не умеет его править, персонал наоборот.
// Пока `admin` числился в группе персонала, он получал права персонала объединением
// и правил всё; «ограничение» жило бы только в том, что кнопку ему не нарисовали.
//
// `architect` остаётся везде — по-прежнему намеренно: владелец развёртывания
// никогда не заперт снаружи собственного приложения. Он один такой.
//
// 🔒 778 (владелец 2026-11-17): «если мы говорим о том что у каждого элемента может быть свой владелец то это значит только он и
// архитектор всего проекта могут видеть приватные маршруты». Свой админ элемента (`OWN_ADMIN_ROLE`) входит в разделы управления
// своего элемента — staff, finance, admin — и в его Mini App (`/tg`); `admin` проекта из раздела admin ЭЛЕМЕНТА ушёл: там теперь
// только админ этого элемента и архитектор. Кабинет посетителя (`account`) — по-прежнему каждого посетителя.
const OWN: readonly string[] = OWN_ADMIN_ROLE ? [OWN_ADMIN_ROLE] : []

export const PROTECTED_GROUP_ROLES: Readonly<Record<"account" | "staff" | "finance" | "admin", readonly string[]>> = {
  account: ['user', 'buyer', 'vip_user', 'subscriber_lite', 'subscriber_standard', 'subscriber_max', 'architect'],
  staff: ['manager', 'senior_manager', 'support_manager', 'delivery_manager', 'content_editor', 'architect', ...OWN],
  finance: ['finance', 'architect', ...OWN],
  admin: ['architect', ...OWN],
}

export type ProtectedGroup = keyof typeof PROTECTED_GROUP_ROLES

// ── Inheritance of roles (node step 402, owner 2026-10-05: «роли наследуются», hierarchy — «Подтвердить») ──────────────
//
// A child role sees everything its parent sees: a page in the folder `_pages/buyer/` is open to `buyer` and to `vip_user`.
// One table, one parent per role, inheritance only inside one branch. Without it a page shared by two roles had to be
// copied, and the copies drift. A role missing here has no parent and sees only its own pages.
export const ROLE_PARENTS: Partial<Record<AppRole, AppRole>> = {
  buyer: 'user',
  vip_user: 'buyer',
  subscriber_lite: 'user',
  subscriber_standard: 'subscriber_lite',
  subscriber_max: 'subscriber_standard',
  senior_manager: 'manager',
}

/** The role and all its ancestors. 🛑 A cycle in `ROLE_PARENTS` throws — at the first page render, so the build fails. */
function lineage(role: AppRole): AppRole[] {
  const out: AppRole[] = [role]
  for (let p = ROLE_PARENTS[role]; p; p = ROLE_PARENTS[p]) {
    if (out.includes(p)) throw new Error(`lib/roles.ts ROLE_PARENTS: cycle through «${p}» (${out.join(' → ')})`)
    out.push(p)
  }
  return out
}
for (const r of ALL_ROLES) lineage(r)

/** Every role that sees the pages of `role`: the role itself and all roles that inherit it. Unknown name — just itself. */
export function rolesThatSee(role: string): string[] {
  if (!(ALL_ROLES as readonly string[]).includes(role)) return [role]
  return ALL_ROLES.filter((r) => lineage(r).includes(role as AppRole))
}

// ── Слой архитектора (шаг 31-1, 2026-08-28) ─────────────────────────────────
//
// Пятая группа маршрутов, и она НЕ подгруппа защищённого слоя. Разделяющий
// вопрос тот же, что у четырёх соседей: ЧЬИ данные показывает страница.
// `(account)` показывает посетителю его собственные, `(staff)` — чужие по долгу
// службы, `(finance)` двигает деньги, `(admin)` администрирует проект. Слой
// архитектора не показывает данные вовсе — он правит САМ ПРОЕКТ: его имя,
// адреса, мету, вид. Это работа владельца развёртывания, а не роль внутри
// приложения.
//
// 🔒 РОВНО ОДНА РОЛЬ, И РАСШИРЯТЬ СПИСОК НЕЛЬЗЯ БЕЗ СЛОВА ВЛАДЕЛЬЦА. Решение
// владельца 2026-08-28, дословно: «роль доступа – архитектор». Добавить сюда
// `admin` «на всякий случай» значило бы отдать настройки проекта тому, кто
// администрирует его содержимое, — это разные работы, и различать их и есть
// смысл ролей.
export const ARCHITECT_LAYER_ROLES = ['architect'] as const satisfies readonly AppRole[]
