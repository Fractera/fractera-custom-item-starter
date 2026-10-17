import { getReview } from "@/lib/reviews/store"
import { brand } from "@/lib/brand"
import { fillSite, snippetResponse } from "@/lib/snippet/page-snippet"
import { descriptionOf, textsIn } from "../../_libs/reviews-view"

// Snippet of one review page (node step 518-2): drawn on the first request, kept static — the picture a shared link shows.
export const revalidate = 300
export const dynamicParams = true
export function generateStaticParams() {
  return []
}
export async function GET(_req: Request, ctx: { params: Promise<{ lang: string; slug: string }> }) {
  const { lang, slug } = await ctx.params
  let review = null
  try { review = await getReview(slug) } catch { review = null }
  if (!review) return new Response("Not found", { status: 404 })
  const t = textsIn(review, lang)
  const site = brand().name
  return snippetResponse(fillSite(t.title, site), fillSite(descriptionOf(t), site))
}
