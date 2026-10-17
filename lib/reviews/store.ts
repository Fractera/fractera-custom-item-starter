import "server-only"
import { db } from "@/lib/db"
import { ownId } from "@/lib/own-id"
import { DEFAULT_LANGUAGE, SUPPORTED_LANGUAGES } from "@/config/translations/translations.config"

// REVIEW PAGES OF THIS ELEMENT (node step 518-1). The owner, 2026-10-17: «каждый новый отзыв должен создаваться без нового развёртывания
// этой ключевое правило ну и конечно же быть статическим»; storage — «db, ass allpages in project , for this we have data layer».
//
// A review page is the page this element publishes as the AUTHOR of a review it gave a partner (Lagrix document 25): its address is the one
// the agent attaches to that review. The rows live in the node's data layer (`lib/db`), not in git: a new page is a new row, and the branch
// `app/[lang]/(publicLayer)/reviews/` draws it on its first visit and keeps it static (ISR); the door `app/api/reviews` redraws it on write.
//
// 🔒 The data layer is ONE for the whole node, so every row carries `element` = this element's id (`ownId()`), and every query filters by it:
// roman and lagrix must never see each other's pages. Columns are always named — no `SELECT *` and no `INSERT` without a list (the schema
// grows by a ladder of ALTERs, ANTI-PATTERNS «Данные и схема»).
//
// Texts are per language: `{ "<lang>": { title, summary, recommendation } }`; the default language is required, the others are the
// translations the agent writes (owner: «all supported langs»). A language without its own text is not offered to search engines.

export type ReviewTexts = { title: string; summary: string; recommendation: string }
export type ReviewEvent = { at: string; texts: Record<string, { text: string }> }
export type ReviewImage = { mediaId: string; url: string; width: number | null; height: number | null }

export type ReviewPage = {
  slug: string
  order: string
  counterpart: string
  role: "provider" | "customer"
  verdict: "like" | "dislike"
  score: number
  recommend: boolean
  texts: Record<string, ReviewTexts>
  events: ReviewEvent[]
  images: ReviewImage[]
  noindex: boolean
  createdAt: string
  updatedAt: string
}

export type ReviewInput = Omit<ReviewPage, "createdAt" | "updatedAt">

export const SLUG = /^[a-z0-9][a-z0-9-]{0,79}$/
/** 518-7: the closed set of page sizes of the list — the same steps as the element's other tables. */
export const PAGE_SIZES = [10, 20, 50] as const
const ORDER = /^[A-Za-z0-9-]{1,100}$/

function element(): string {
  const id = ownId()
  if (!id) throw new Error("reviews: this element has no id (OWN-SERVICE-PROPS.json or ITEM_ID)")
  return id
}

function str(v: unknown, max: number): string | null {
  return typeof v === "string" && v.trim() && v.length <= max ? v.trim() : null
}

/** Check a page sent to the door. Returns the page or the reason it is refused. */
export function parseReview(raw: unknown): { ok: true; page: ReviewInput } | { ok: false; error: string } {
  const r = (raw ?? {}) as Record<string, unknown>
  const slug = typeof r.slug === "string" ? r.slug : ""
  if (!SLUG.test(slug)) return { ok: false, error: "slug: lowercase latin letters, digits and dashes, up to 80" }
  const order = typeof r.order === "string" ? r.order : ""
  if (!ORDER.test(order)) return { ok: false, error: "order: the order number, latin letters, digits and dashes" }
  const counterpart = str(r.counterpart, 100)
  if (!counterpart) return { ok: false, error: "counterpart: the other side's element id" }
  if (r.role !== "provider" && r.role !== "customer") return { ok: false, error: "role: provider | customer" }
  if (r.verdict !== "like" && r.verdict !== "dislike") return { ok: false, error: "verdict: like | dislike" }
  const score = Number(r.score)
  if (!Number.isInteger(score) || score < 0 || score > 10) return { ok: false, error: "score: an integer from 0 to 10" }
  if (typeof r.recommend !== "boolean") return { ok: false, error: "recommend: true | false" }

  const textsRaw = (r.texts ?? {}) as Record<string, unknown>
  const texts: Record<string, ReviewTexts> = {}
  for (const [lang, v] of Object.entries(textsRaw)) {
    if (!SUPPORTED_LANGUAGES.includes(lang)) return { ok: false, error: `texts.${lang}: not a supported language of this element` }
    const t = (v ?? {}) as Record<string, unknown>
    const title = str(t.title, 200), summary = str(t.summary, 20000), recommendation = str(t.recommendation, 5000)
    if (!title || !summary || !recommendation) return { ok: false, error: `texts.${lang}: title, summary and recommendation are required` }
    texts[lang] = { title, summary, recommendation }
  }
  if (!texts[DEFAULT_LANGUAGE]) return { ok: false, error: `texts.${DEFAULT_LANGUAGE}: the default language is required` }

  const events: ReviewEvent[] = []
  for (const [i, e] of ((Array.isArray(r.events) ? r.events : []) as Record<string, unknown>[]).entries()) {
    const at = typeof e?.at === "string" && !Number.isNaN(Date.parse(e.at)) ? new Date(e.at).toISOString() : null
    if (!at) return { ok: false, error: `events[${i}].at: a date` }
    const et: Record<string, { text: string }> = {}
    for (const [lang, v] of Object.entries((e.texts ?? {}) as Record<string, unknown>)) {
      const text = str((v as Record<string, unknown>)?.text, 2000)
      if (!SUPPORTED_LANGUAGES.includes(lang) || !text) return { ok: false, error: `events[${i}].texts.${lang}: a supported language and a text` }
      et[lang] = { text }
    }
    if (!et[DEFAULT_LANGUAGE]) return { ok: false, error: `events[${i}].texts.${DEFAULT_LANGUAGE}: required` }
    events.push({ at, texts: et })
  }

  const images: ReviewImage[] = []
  for (const [i, m] of ((Array.isArray(r.images) ? r.images : []) as Record<string, unknown>[]).entries()) {
    const mediaId = str(m?.mediaId, 100), url = str(m?.url, 500)
    if (!mediaId || !url || !(url.startsWith("/") || url.startsWith("https://"))) return { ok: false, error: `images[${i}]: mediaId and url from the media store` }
    const w = Number(m.width), h = Number(m.height)
    images.push({ mediaId, url, width: Number.isFinite(w) && w > 0 ? Math.round(w) : null, height: Number.isFinite(h) && h > 0 ? Math.round(h) : null })
  }

  return { ok: true, page: { slug, order, counterpart, role: r.role, verdict: r.verdict, score, recommend: r.recommend, texts, events, images, noindex: r.noindex === true } }
}

type PageRow = { slug: string; order_no: string; counterpart: string; role: string; verdict: string; score: number; recommend: number; texts: string; noindex: number; created_at: string; updated_at: string }

function fromRow(row: PageRow, events: ReviewEvent[], images: ReviewImage[]): ReviewPage {
  return {
    slug: row.slug, order: row.order_no, counterpart: row.counterpart, role: row.role === "customer" ? "customer" : "provider",
    verdict: row.verdict === "dislike" ? "dislike" : "like", score: Number(row.score), recommend: Number(row.recommend) === 1,
    texts: JSON.parse(row.texts) as Record<string, ReviewTexts>, events, images, noindex: Number(row.noindex) === 1,
    createdAt: row.created_at, updatedAt: row.updated_at,
  }
}

const PAGE_COLUMNS = "slug, order_no, counterpart, role, verdict, score, recommend, texts, noindex, created_at, updated_at"

/** Write a whole page: the row, its events and its images are replaced together (a snapshot, not a patch). */
export async function saveReview(p: ReviewInput): Promise<void> {
  const el = element()
  const now = new Date().toISOString()
  const existing = (await db.prepare("SELECT created_at FROM review_pages WHERE element = ? AND slug = ?").get(el, p.slug)) as { created_at?: string } | null
  await db.prepare("DELETE FROM review_pages WHERE element = ? AND slug = ?").run(el, p.slug)
  const searchText = [p.counterpart, p.order, ...Object.values(p.texts).flatMap((t) => [t.title, t.summary, t.recommendation])].join("\n").toLowerCase()
  await db.prepare(
    "INSERT INTO review_pages (element, slug, order_no, counterpart, role, verdict, score, recommend, texts, noindex, search_text, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
  ).run(el, p.slug, p.order, p.counterpart, p.role, p.verdict, p.score, p.recommend ? 1 : 0, JSON.stringify(p.texts), p.noindex ? 1 : 0, searchText, existing?.created_at ?? now, now)
  await db.prepare("DELETE FROM review_events WHERE element = ? AND slug = ?").run(el, p.slug)
  for (const e of p.events) {
    await db.prepare("INSERT INTO review_events (element, slug, happened_at, texts) VALUES (?, ?, ?, ?)").run(el, p.slug, e.at, JSON.stringify(e.texts))
  }
  await db.prepare("DELETE FROM review_images WHERE element = ? AND slug = ?").run(el, p.slug)
  for (const [i, m] of p.images.entries()) {
    await db.prepare("INSERT INTO review_images (element, slug, position, media_id, media_url, width, height) VALUES (?, ?, ?, ?, ?, ?, ?)").run(el, p.slug, i, m.mediaId, m.url, m.width, m.height)
  }
}

/** Remove a page with its events and images. Returns whether there was one. */
export async function deleteReview(slug: string): Promise<boolean> {
  const el = element()
  const had = await db.prepare("SELECT slug FROM review_pages WHERE element = ? AND slug = ?").get(el, slug)
  await db.prepare("DELETE FROM review_events WHERE element = ? AND slug = ?").run(el, slug)
  await db.prepare("DELETE FROM review_images WHERE element = ? AND slug = ?").run(el, slug)
  await db.prepare("DELETE FROM review_pages WHERE element = ? AND slug = ?").run(el, slug)
  return !!had
}

/** One page, or null. Events newest first (the owner: «самая верхняя дата это самая последняя»). */
export async function getReview(slug: string): Promise<ReviewPage | null> {
  if (!SLUG.test(slug)) return null
  const el = element()
  const row = (await db.prepare(`SELECT ${PAGE_COLUMNS} FROM review_pages WHERE element = ? AND slug = ?`).get(el, slug)) as PageRow | null
  if (!row) return null
  const ev = (await db.prepare("SELECT happened_at, texts FROM review_events WHERE element = ? AND slug = ? ORDER BY happened_at DESC, id DESC").all(el, slug)) as { happened_at: string; texts: string }[]
  const im = (await db.prepare("SELECT media_id, media_url, width, height FROM review_images WHERE element = ? AND slug = ? ORDER BY position").all(el, slug)) as { media_id: string; media_url: string; width: number | null; height: number | null }[]
  return fromRow(
    row,
    ev.map((e) => ({ at: e.happened_at, texts: JSON.parse(e.texts) as Record<string, { text: string }> })),
    im.map((m) => ({ mediaId: m.media_id, url: m.media_url, width: m.width, height: m.height })),
  )
}

/**
 * 518-7 — the server search of the list (owner: «если человек по 10 по 15 по 50 работ делает в день. Это должно быть серверный поиск»).
 * Published pages only (samples with `noindex` are left out), newest first, one page of a closed size; `q` is matched as a substring of
 * the lowercased texts in every language, the partner and the order number. `%` and `_` in the query are taken literally.
 */
export async function searchReviews(opts: { q?: string; page?: number; perPage?: number }): Promise<{ rows: ReviewPage[]; total: number; page: number; perPage: number }> {
  const el = element()
  const perPage = (PAGE_SIZES as readonly number[]).includes(Number(opts.perPage)) ? Number(opts.perPage) : PAGE_SIZES[0]
  const q = (opts.q ?? "").trim().toLowerCase().slice(0, 100)
  const like = `%${q.replace(/[\\%_]/g, (c) => `\\${c}`)}%`
  const where = q ? "element = ? AND noindex = 0 AND search_text LIKE ? ESCAPE '\\'" : "element = ? AND noindex = 0"
  const args = q ? [el, like] : [el]
  const count = (await db.prepare(`SELECT COUNT(*) AS n FROM review_pages WHERE ${where}`).get(...args)) as { n?: number } | null
  const total = Number(count?.n ?? 0)
  const pages = Math.max(1, Math.ceil(total / perPage))
  const page = Math.min(Math.max(1, Math.floor(Number(opts.page) || 1)), pages)
  const rows = (await db.prepare(`SELECT ${PAGE_COLUMNS} FROM review_pages WHERE ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`).all(...args, perPage, (page - 1) * perPage)) as PageRow[]
  return { rows: rows.map((r) => fromRow(r, [], [])), total, page, perPage }
}

/** All pages of this element, newest first, without events and images (the list needs neither). */
export async function listReviews(): Promise<ReviewPage[]> {
  const el = element()
  const rows = (await db.prepare(`SELECT ${PAGE_COLUMNS} FROM review_pages WHERE element = ? ORDER BY created_at DESC`).all(el)) as PageRow[]
  return rows.map((r) => fromRow(r, [], []))
}
