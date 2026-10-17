// @api write, remove or search the review pages of this element
import { NextRequest, NextResponse } from "next/server"
import { revalidatePath } from "next/cache"
import { getSession } from "@/lib/auth/get-session"
import { SUPPORTED_LANGUAGES } from "@/config/translations/translations.config"
import { SLUG, deleteReview, parseReview, saveReview, searchReviews } from "@/lib/reviews/store"
import { DEFAULT_LANGUAGE } from "@/config/translations/translations.config"

// THE REVIEW-PAGES DOOR (node step 518-1). The element's agent writes a review page here after the person agreed on it (skill
// `review-order`); the page is a row in the node's data layer, and this door redraws `/<lang>/reviews/<slug>` and the list at once — no
// rebuild, no redeploy, the pages stay static (owner 2026-10-17: «каждый новый отзыв должен создаваться без нового развёртывания»).
//
// 🔒 WHO MAY CALL — the same two ways as `/api/revalidate`: the element's own key `REVALIDATE_SECRET` in `Authorization: Bearer …` (the
// agent reads it from `.env.local`, as for `npm run pages:refresh`), or a signed-in architect or admin. Visitors never write: the public
// page has no button that writes (owner: «Агент элемента»). The key never travels in the address.
//
// POST — the whole page as JSON (`lib/reviews/store.ts` `parseReview`): it replaces the row, its events and its images.
// DELETE ?slug=<slug> — removes a page (the design sample of 518-3 is removed this way).
// GET ?q=&page=&perPage=&lang= — 518-7, the server search of the list `/<lang>/reviews`: public, it returns only what the list already
// shows (title, partner, verdict, score, date, the summary's first sentence) and only published pages; `proxy.ts` names the prefix.

export const dynamic = "force-dynamic"

const SECRET = process.env.REVALIDATE_SECRET ?? ""
const ROLES = new Set(["architect", "admin"])

async function allowed(req: NextRequest): Promise<200 | 401 | 403> {
  const auth = req.headers.get("authorization") ?? ""
  if (SECRET && auth === `Bearer ${SECRET}`) return 200
  const session = await getSession(req)
  if (!session) return 401
  return session.roles?.some((r) => ROLES.has(r)) ? 200 : 403
}

function redraw(slug: string) {
  for (const lang of SUPPORTED_LANGUAGES) {
    revalidatePath(`/${lang}/reviews/${slug}`)
    revalidatePath(`/${lang}/reviews`)
  }
  revalidatePath("/sitemap.xml")
}

function firstSentence(text: string): string {
  const first = text.split(/(?<=[.!?])\s/)[0] ?? text
  return first.length > 160 ? `${first.slice(0, 157).trimEnd()}…` : first
}

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams
  const lang = sp.get("lang") ?? DEFAULT_LANGUAGE
  try {
    const r = await searchReviews({ q: sp.get("q") ?? "", page: Number(sp.get("page") ?? 1), perPage: Number(sp.get("perPage") ?? 10) })
    const rows = r.rows.map((p) => {
      const t = p.texts[lang] ?? p.texts[DEFAULT_LANGUAGE] ?? Object.values(p.texts)[0]
      return { slug: p.slug, title: t.title, description: firstSentence(t.summary), counterpart: p.counterpart, verdict: p.verdict, score: p.score, createdAt: p.createdAt }
    })
    return NextResponse.json({ ok: true, rows, total: r.total, page: r.page, perPage: r.perPage }, { headers: { "Cache-Control": "no-store" } })
  } catch (e) {
    return NextResponse.json({ ok: false, error: `data layer: ${String(e instanceof Error ? e.message : e).slice(0, 200)}` }, { status: 502 })
  }
}

export async function POST(req: NextRequest) {
  const status = await allowed(req)
  if (status !== 200) return NextResponse.json({ ok: false, error: status === 401 ? "Unauthorized" : "Forbidden" }, { status })
  let body: unknown
  try { body = await req.json() } catch { return NextResponse.json({ ok: false, error: "invalid JSON" }, { status: 400 }) }
  const parsed = parseReview(body)
  if (!parsed.ok) return NextResponse.json({ ok: false, error: parsed.error }, { status: 422 })
  try {
    await saveReview(parsed.page)
  } catch (e) {
    return NextResponse.json({ ok: false, error: `data layer: ${String(e instanceof Error ? e.message : e).slice(0, 200)}` }, { status: 502 })
  }
  redraw(parsed.page.slug)
  return NextResponse.json({ ok: true, slug: parsed.page.slug, path: `/reviews/${parsed.page.slug}`, languages: Object.keys(parsed.page.texts) })
}

export async function DELETE(req: NextRequest) {
  const status = await allowed(req)
  if (status !== 200) return NextResponse.json({ ok: false, error: status === 401 ? "Unauthorized" : "Forbidden" }, { status })
  const slug = req.nextUrl.searchParams.get("slug") ?? ""
  if (!SLUG.test(slug)) return NextResponse.json({ ok: false, error: "slug" }, { status: 422 })
  try {
    const had = await deleteReview(slug)
    redraw(slug)
    return NextResponse.json({ ok: true, removed: had })
  } catch (e) {
    return NextResponse.json({ ok: false, error: `data layer: ${String(e instanceof Error ? e.message : e).slice(0, 200)}` }, { status: 502 })
  }
}
