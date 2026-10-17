import { listReviews } from "@/lib/reviews/store"
import { listMarkdown } from "../_libs/reviews-markdown"

// Markdown twin of the reviews list for agents (node step 518-2); sample pages (`noindex`) are left out, as on the page.
export const revalidate = 300
export async function GET(_req: Request, ctx: { params: Promise<{ lang: string }> }) {
  const { lang } = await ctx.params
  let pages: Awaited<ReturnType<typeof listReviews>> = []
  try { pages = (await listReviews()).filter((p) => !p.noindex) } catch { pages = [] }
  return new Response(listMarkdown(pages, lang), { headers: { "Content-Type": "text/markdown; charset=utf-8" } })
}
