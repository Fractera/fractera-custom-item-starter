import type { Metadata } from "next"
import { createContentPage } from "@/lib/content/create-content-page"
import { PAGE_SIZES, searchReviews } from "@/lib/reviews/store"
import { descriptionOf, reviewsWords, textsIn } from "./_libs/reviews-view"
import { ReviewsList, type ListRow } from "./_components/reviews-list.client"

// THE ROOT OF THE REVIEWS BRANCH — `/<lang>/reviews` (node step 518-2): every review page this element published, newest first. The words
// are the branch's own (`_data/<lang>.json`). 518-7: the first page (10 rows) is read from the data layer on the first visit and kept static —
// search engines read it; the island searches and turns pages through the door `GET /api/reviews` (server search, owner 2026-10-17). The door
// `/api/reviews` redraws this page whenever the agent writes or removes a page. Sample pages (`noindex`) are not listed.
// 518-7, the owner: the H1 is «Отзывы об агентах с которыми взаимодействовал этот элемент» (`heading`); the breadcrumb and the footer keep
// the short «Отзывы» (`title`).

export const revalidate = 300

const route = createContentPage({
  data: { overrides: { ru: { title: reviewsWords("ru").title } } },
  meta: { subPath: "/reviews", ogImage: "/{lang}/reviews/snippet.png" },
  resolve: (lang) => {
    const w = reviewsWords(lang)
    return { title: w.heading, description: w.description, keywords: "", blocks: [] }
  },
  chrome: (lang) => ({ breadcrumbs: [{ label: reviewsWords(lang).title }], backHref: `/${lang}`, backLabel: reviewsWords(lang).home }),
  afterHeader: (lang) => <FirstPage lang={lang} />,
})

async function FirstPage({ lang }: { lang: string }) {
  const w = reviewsWords(lang)
  let initial: { rows: ListRow[]; total: number; perPage: number } = { rows: [], total: 0, perPage: PAGE_SIZES[0] }
  try {
    const r = await searchReviews({ page: 1, perPage: PAGE_SIZES[0] })
    initial = {
      total: r.total,
      perPage: r.perPage,
      rows: r.rows.map((p) => {
        const t = textsIn(p, lang)
        return { slug: p.slug, title: t.title, description: descriptionOf(t), counterpart: p.counterpart, verdict: p.verdict, score: p.score, createdAt: p.createdAt }
      }),
    }
  } catch { /* the data layer did not answer: the list shows its empty state */ }
  return (
    <ReviewsList
      lang={lang}
      initial={initial}
      words={{
        with: w.with, verdict: w.verdict, empty: w.empty, searchPlaceholder: w.searchPlaceholder, search: w.search, nothingFound: w.nothingFound,
        count: w.count, perPage: w.perPage, pageOf: w.pageOf, found: w.found, showAll: w.showAll, first: w.first, prev: w.prev, next: w.next, last: w.last, failed: w.failed,
      }}
    />
  )
}

export async function generateMetadata(props: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  return route.generateMetadata(props)
}

export default route.Page
