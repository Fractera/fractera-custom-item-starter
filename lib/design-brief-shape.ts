// ФОРМА БРИФА ДИЗАЙНА (шаг 706-4) — чистая функция без импортов: её зовёт запись паспорта (`lib/design-brief.ts`) и проверяет
// `npm run test:design-brief`. Правила те же, что у ядра (`lib/web4-items/element-look.cjs` ядра): элемент живёт и без ядра.
export type BriefReference = { url?: string; media?: string; note?: string }
export type DesignBrief = { skill?: string; audience?: string; character?: string[]; avoid?: string; references?: BriefReference[]; inheritedFrom?: string }

export const DESIGN_SKILLS = ["frontend-design", "impeccable", "design-taste-frontend"] as const
const SKILL = /^[a-z0-9][a-z0-9-]{0,39}$/
const ID = /^[a-z][a-z0-9]{3,23}$/
const isObj = (v: unknown): v is Record<string, unknown> => typeof v === "object" && v !== null && !Array.isArray(v)
const text = (v: unknown, max: number) => (typeof v === "string" ? v.replace(/\s+/g, " ").trim().slice(0, max) : "")
/** Проверить и очистить бриф; `null` в `brief` — бриф пуст. */
export function normalizeBrief(raw: unknown): { ok: true; brief: DesignBrief | null } | { ok: false; reason: string } {
  if (raw === undefined || raw === null) return { ok: true, brief: null }
  if (!isObj(raw)) return { ok: false, reason: "bad-shape" }
  const b: DesignBrief = {}
  if (raw.skill !== undefined && raw.skill !== "") {
    if (typeof raw.skill !== "string" || !SKILL.test(raw.skill.trim())) return { ok: false, reason: "bad-skill" }
    b.skill = raw.skill.trim()
  }
  const audience = text(raw.audience, 600)
  if (audience) b.audience = audience
  if (raw.character !== undefined) {
    if (!Array.isArray(raw.character) || raw.character.length > 5) return { ok: false, reason: "too-many-words" }
    const words = raw.character.map((w) => text(w, 40)).filter(Boolean)
    if (words.length) b.character = words
  }
  const avoid = text(raw.avoid, 600)
  if (avoid) b.avoid = avoid
  if (raw.references !== undefined) {
    if (!Array.isArray(raw.references) || raw.references.length > 12) return { ok: false, reason: "too-many-references" }
    const refs: BriefReference[] = []
    for (const r of raw.references) {
      if (!isObj(r)) return { ok: false, reason: "bad-shape" }
      const ref: BriefReference = {}
      const url = text(r.url, 500)
      if (url) {
        if (!/^https?:\/\//.test(url)) return { ok: false, reason: "bad-link" }
        ref.url = url
      }
      const media = text(r.media, 80)
      if (media) ref.media = media
      const note = text(r.note, 300)
      if (note) ref.note = note
      if (ref.url || ref.media || ref.note) refs.push(ref)
    }
    if (refs.length) b.references = refs
  }
  if (typeof raw.inheritedFrom === "string" && ID.test(raw.inheritedFrom)) b.inheritedFrom = raw.inheritedFrom
  return { ok: true, brief: Object.keys(b).length ? b : null }
}

