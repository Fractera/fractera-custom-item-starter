// The work of the door GET /api/tg-menu (node steps 789, 790): the ONE menu of this element's Telegram Mini App, for the core's
// «Working process» — the core draws the same tree in its left menu and opens the same screens (/<lang>/tg/<slug>), so what the agent
// adds to `app/[lang]/(protectedLayer)/tg/_data/menu.json` appears in Telegram and in the core at once. Pure: route.ts gives the file.

const SLUG = /^$|^[a-z0-9][a-z0-9-]*(\/[a-z0-9][a-z0-9-]*)*$/
const words = (w) => w && typeof w === 'object' && typeof w.en === 'string'

/** The menu as the core may draw it — every item with a valid slug and English words; a broken file is said, never half-sent. */
export async function handle(input, menu) {
  const modes = Array.isArray(menu?.modes) ? menu.modes : null
  if (!modes || !modes.length) return { status: 422, body: { error: 'no_menu', reason: 'tg/_data/menu.json has no modes' } }
  for (const m of modes) {
    if (typeof m?.id !== 'string' || !words(m.title) || !Array.isArray(m.groups)) return { status: 422, body: { error: 'bad_mode', reason: `a mode without id, title or groups` } }
    for (const g of m.groups) for (const it of g?.items ?? []) {
      if (typeof it?.slug !== 'string' || !SLUG.test(it.slug) || !words(it.title)) return { status: 422, body: { error: 'bad_item', reason: `mode ${m.id}: an item without a valid slug or title` } }
      for (const c of it.children ?? []) if (typeof c?.slug !== 'string' || !SLUG.test(c.slug) || !words(c.title)) return { status: 422, body: { error: 'bad_child', reason: `mode ${m.id}: a child of «${it.title.en}» without a valid slug or title` } }
    }
  }
  const lang = typeof input?.lang === 'string' && /^[a-z]{2}$/.test(input.lang) ? input.lang : null
  return { status: 200, body: { base: '/tg', lang, modes } }
}
