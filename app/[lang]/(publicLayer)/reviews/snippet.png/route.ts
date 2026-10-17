import { brand } from "@/lib/brand"
import { fillSite, snippetResponse } from "@/lib/snippet/page-snippet"
import { reviewsWords } from "../_libs/reviews-view"

// Snippet of the reviews list (node step 518-2).
export const revalidate = 300
export async function GET(_req: Request, ctx: { params: Promise<{ lang: string }> }) {
  const { lang } = await ctx.params
  const w = reviewsWords(lang)
  const site = brand().name
  return snippetResponse(fillSite(w.title, site), fillSite(w.description, site))
}
