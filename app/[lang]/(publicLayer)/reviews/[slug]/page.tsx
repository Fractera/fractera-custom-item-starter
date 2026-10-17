import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { createContentPage } from "@/lib/content/create-content-page"
import { getReview, type ReviewPage } from "@/lib/reviews/store"
import { urlFor } from "@/lib/seo/alternates"
import { descriptionOf, reviewsWords, textsIn, translatedPage } from "../_libs/reviews-view"
import { ReviewBody } from "../_components/review-body"

// ONE REVIEW PAGE — the child of the reviews branch (node step 518-2). The page is a row of the node data layer (`lib/reviews/store.ts`),
// not a folder of data: the owner, 2026-10-17, «каждый новый отзыв должен создаваться без нового развёртывания … и конечно же быть
// статическим». Nothing is drawn at build time; a page is drawn on its first visit and kept static, and the door `/api/reviews` redraws it
// when the agent writes it. Metadata, hreflang, robots (a language without its own text is noindex; a sample page is noindex everywhere) and
// the frame come from the same factory as every page of the element.

export const revalidate = 300
export const dynamicParams = true
export function generateStaticParams() {
  return []
}

type Params = { params: Promise<{ lang: string; slug: string }> }

function factory(review: ReviewPage) {
  return createContentPage({
    data: translatedPage(review),
    noindex: review.noindex,
    meta: { subPath: `/reviews/${review.slug}`, ogImage: `/{lang}/reviews/${review.slug}/snippet.png` },
    resolve: (lang) => {
      const t = textsIn(review, lang)
      return { title: t.title, description: descriptionOf(t), keywords: "", blocks: [] }
    },
    chrome: (lang, c) => {
      const w = reviewsWords(lang)
      return { breadcrumbs: [{ label: w.title, href: `/${lang}/reviews` }, { label: c.title }], backHref: `/${lang}/reviews`, backLabel: w.title }
    },
    // 518-3, the owner: «используй генерацию стандартного сниппета … в качестве изображения» — the cover is this page's own snippet,
    // the same picture a shared link shows (`snippet.png` next to the page), not a photo of the deal.
    hero: (lang) => (
      <figure className="my-8" data-review-cover>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={`/${lang}/reviews/${review.slug}/snippet.png`} alt={textsIn(review, lang).title} width={1200} height={630} className="h-auto w-full rounded-2xl border border-border" />
      </figure>
    ),
    afterHeader: (lang) => <ReviewBody review={review} lang={lang} words={reviewsWords(lang)} url={urlFor(lang, `/reviews/${review.slug}`)} />,
  })
}

async function load(slug: string): Promise<ReviewPage | null> {
  try { return await getReview(slug) } catch { return null }
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { lang, slug } = await params
  const review = await load(slug)
  return review ? factory(review).generateMetadata({ params: Promise.resolve({ lang }) }) : {}
}

export default async function Page({ params }: Params) {
  const { lang, slug } = await params
  const review = await load(slug)
  if (!review) notFound()
  const F = factory(review).Page
  return <F params={Promise.resolve({ lang })} />
}
