import { getReview } from "@/lib/reviews/store"
import { reviewMarkdown } from "../../_libs/reviews-markdown"

// Markdown twin of one review page for agents (node step 518-2): drawn on the first request, kept static, redrawn with its page.
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
  return new Response(reviewMarkdown(review, lang), { headers: { "Content-Type": "text/markdown; charset=utf-8" } })
}
