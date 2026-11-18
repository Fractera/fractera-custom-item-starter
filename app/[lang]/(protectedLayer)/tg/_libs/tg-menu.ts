// The menu of this element's Telegram Mini App in ONE language (node step 789): `_data/menu.json` keeps every language; the layout
// (server) picks the person's here, so the drawer island never ships the other languages (check:lang-delivery). The same file is read
// by the door GET /api/tg-menu for the core's «Working process» (node step 790) — one menu, two windows.
import menu from "../_data/menu.json"

type Words = { en: string; [lang: string]: string }
type RawChild = { slug: string; title: Words; note?: Words }
type RawItem = { slug: string; icon?: string; title: Words; hint?: Words; children?: RawChild[]; add?: Words }
type RawMenu = { ui: Record<string, Words>; modes: Array<{ id: string; title: Words; groups: Array<{ title?: Words; items: RawItem[] }> }> }

export type TgChild = { slug: string; title: string; note: string | null }
export type TgItem = { slug: string; icon: string; title: string; hint: string | null; children: TgChild[] | null; add: string | null }
export type TgGroup = { title: string | null; items: TgItem[] }
export type TgMode = { id: string; title: string; groups: TgGroup[] }
export type TgUi = { open: string; close: string; role: string; site: string; modes: string }

const pick = (w: Words | undefined, lang: string): string | null => (w ? w[lang] || w.en : null)

/** The menu and the shell's words for one language; a missing translation falls back to English. */
export function tgMenu(lang: string): { modes: TgMode[]; ui: TgUi } {
  const raw = menu as unknown as RawMenu
  const ui = Object.fromEntries(Object.entries(raw.ui).map(([k, w]) => [k, pick(w, lang) ?? ""])) as TgUi
  const modes = raw.modes.map((m) => ({
    id: m.id,
    title: pick(m.title, lang) ?? m.id,
    groups: m.groups.map((g) => ({
      title: pick(g.title, lang),
      items: g.items.map((it) => ({
        slug: it.slug,
        icon: it.icon ?? "circle",
        title: pick(it.title, lang) ?? it.slug,
        hint: pick(it.hint, lang),
        children: it.children ? it.children.map((c) => ({ slug: c.slug, title: pick(c.title, lang) ?? c.slug, note: pick(c.note, lang) })) : null,
        add: pick(it.add, lang),
      })),
    })),
  }))
  return { modes, ui }
}
