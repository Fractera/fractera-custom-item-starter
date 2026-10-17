import { CheckIcon, ChevronDownIcon, ExternalLinkIcon, ImagesIcon, ThumbsDownIcon, ThumbsUpIcon, XIcon } from "lucide-react"
import type { ReviewPage } from "@/lib/reviews/store"
import { H2, P, Small } from "@/components/ui/typography"
import { eventIn, textsIn, type ReviewsWords } from "../_libs/reviews-view"
import { ReviewActions } from "./review-actions.client"
import styles from "./review-body.module.css"

// THE BODY OF ONE REVIEW PAGE (node step 518-2, look 518-3 — impeccable, brief `development-docs/design-brief-reviews.md`, mode Read).
// The owner's order of blocks, 2026-10-17: the timeline, newest on top, at most 1000 px high with its own scroll · the
// summary — the main text · my rating 0–10 · would I recommend working with them · share · print as PDF. Above them the verdict strip and the
// facts, so the reader knows at once who worked with whom and how it ended. A block with nothing to show is not drawn. Colours are the Design
// tokens only (primary — the one accent, destructive — a dislike); server markup, the only island is the two buttons.

const SCALE = Array.from({ length: 11 }, (_, i) => i)

export function ReviewBody({ review, lang, words, url }: { review: ReviewPage; lang: string; words: ReviewsWords; url: string }) {
  const t = textsIn(review, lang)
  const date = (iso: string) => new Date(iso).toLocaleDateString(lang, { day: "numeric", month: "long", year: "numeric" })
  const like = review.verdict === "like"
  return (
    <div className={`${styles.body} flex flex-col gap-12`} data-review-body>
      <div className="flex flex-col gap-6">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-3 border-y border-border py-4" data-review-strip>
          <span className={`inline-flex items-center gap-2 font-semibold ${like ? "text-primary" : "text-destructive"}`} data-review-verdict={review.verdict}>
            {like ? <ThumbsUpIcon aria-hidden className="size-5" /> : <ThumbsDownIcon aria-hidden className="size-5" />}
            {words.verdict[review.verdict]}
          </span>
          <span className="inline-flex items-baseline gap-1 tabular-nums">
            <span className="text-2xl font-bold text-foreground">{review.score}</span>
            <span className="text-muted-foreground">/ 10</span>
          </span>
          <span className="inline-flex items-center gap-2 text-foreground">
            {review.recommend ? <CheckIcon aria-hidden className="size-5 text-primary" /> : <XIcon aria-hidden className="size-5 text-destructive" />}
            {review.recommend ? words.recommendYes : words.recommendNo}
          </span>
        </div>
        <dl className="grid grid-cols-2 gap-x-8 gap-y-4 sm:grid-cols-4" data-review-facts>
          <div className="min-w-0"><dt><Small>{words.with}</Small></dt><dd className="font-mono text-sm break-all text-foreground">{review.counterpart}</dd></div>
          <div className="min-w-0"><dt><Small>{words.order}</Small></dt><dd className="font-mono text-sm break-all text-foreground">{review.order}</dd></div>
          <div className="min-w-0"><dt><Small>{words.roleLabel}</Small></dt><dd className="text-sm text-foreground">{words.role[review.role]}</dd></div>
          <div className="min-w-0"><dt><Small>{words.published}</Small></dt><dd className="text-sm tabular-nums text-foreground"><time dateTime={review.createdAt}>{date(review.createdAt)}</time></dd></div>
          {review.images.length > 0 && (
            // 518-3, the owner: «убери картинки из отзыва … придумай красиво куда разместить ссылку чтобы пользователь сам посмотреть оригинал» —
            // no grid on the page; one more fact, «Photos: N — open the originals», a native disclosure with a link to every original file.
            <div className="col-span-2 min-w-0 sm:col-span-4" data-review-originals>
              <details className="group">
                <summary className="inline-flex cursor-pointer list-none items-center gap-2 text-sm text-foreground underline-offset-4 hover:underline focus-visible:underline [&::-webkit-details-marker]:hidden">
                  <ImagesIcon aria-hidden className="size-4 text-primary" />
                  {words.photosCount.replace("{n}", String(review.images.length))}
                  <ChevronDownIcon aria-hidden className="size-4 text-muted-foreground transition-transform group-open:rotate-180" />
                </summary>
                <ul className="mt-3 flex flex-wrap gap-x-6 gap-y-2">
                  {review.images.map((m, i) => (
                    <li key={m.mediaId}>
                      <a href={m.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm text-primary underline-offset-4 hover:underline focus-visible:underline">
                        {words.photoLink.replace("{n}", String(i + 1))}
                        <ExternalLinkIcon aria-hidden className="size-3.5" />
                      </a>
                    </li>
                  ))}
                </ul>
              </details>
            </div>
          )}
        </dl>
      </div>

      {review.events.length > 0 && (
        <section aria-labelledby="review-timeline" data-review-timeline>
          <H2 id="review-timeline">{words.timeline}</H2>
          <div className={styles.timelineFrame}>
            <ol className={styles.timeline} data-review-timeline-list>
              {review.events.map((e, i) => (
                <li key={`${e.at}-${i}`} className={styles.event}>
                  <time dateTime={e.at} className="text-sm tabular-nums text-muted-foreground">{date(e.at)}</time>
                  <span aria-hidden className={styles.dot} />
                  <P className="m-0">{eventIn(e.texts, lang)}</P>
                </li>
              ))}
            </ol>
          </div>
        </section>
      )}

      <section aria-labelledby="review-summary" className="max-w-[70ch]" data-review-summary>
        <H2 id="review-summary">{words.summary}</H2>
        {t.summary.split(/\n{2,}/).map((p, i) => <P key={i}>{p}</P>)}
      </section>

      <section aria-labelledby="review-score" data-review-score={review.score}>
        <H2 id="review-score">{words.score}</H2>
        <p className="flex items-baseline gap-2 tabular-nums">
          <span className="text-5xl font-bold leading-none text-foreground">{review.score}</span>
          <span className="text-muted-foreground">{words.outOf}</span>
        </p>
        <ol className={styles.scale} aria-hidden>
          {SCALE.map((n) => (
            <li key={n} className={n <= review.score ? styles.on : undefined} data-current={n === review.score ? "" : undefined}>
              <span>{n}</span>
            </li>
          ))}
        </ol>
      </section>

      <section aria-labelledby="review-recommend" className="max-w-[70ch]" data-review-recommend={review.recommend ? "yes" : "no"}>
        <H2 id="review-recommend">{words.recommend}</H2>
        <p className={`mb-3 inline-flex items-center gap-2 font-semibold ${review.recommend ? "text-primary" : "text-destructive"}`}>
          {review.recommend ? <CheckIcon aria-hidden className="size-5" /> : <XIcon aria-hidden className="size-5" />}
          {review.recommend ? words.recommendYes : words.recommendNo}
        </p>
        <P>{t.recommendation}</P>
      </section>

      <ReviewActions url={url} title={t.title} words={{ share: words.share, copyLink: words.copyLink, copied: words.copied, copyFailed: words.copyFailed, print: words.print }} />
      {/* 518-3, the owner: «you lost link to preview … right from pdf» — the printed page keeps its links: the page's own address and every
          original photo, written out in full and clickable in the PDF (the «Photos» disclosure stays closed in print, so its links would
          be lost there). */}
      <div className={`${styles.printOnly} text-sm`} data-review-print-links>
        <p>{words.address}: <a href={url}>{url}</a></p>
        {review.images.length > 0 && (
          <ol className="mt-2 list-decimal pl-5">
            {review.images.map((m, i) => {
              const abs = new URL(m.url, url).toString()
              return <li key={m.mediaId}>{words.photoLink.replace("{n}", String(i + 1))}: <a href={abs}>{abs}</a></li>
            })}
          </ol>
        )}
      </div>
    </div>
  )
}
