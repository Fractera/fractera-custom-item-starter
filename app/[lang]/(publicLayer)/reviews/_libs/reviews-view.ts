import "server-only"
import en from "../_data/en.json"
import ru from "../_data/ru.json"
import { DEFAULT_LANGUAGE } from "@/config/translations/translations.config"
import type { TranslatedPage } from "@/lib/seo/translation-state"
import type { ReviewPage, ReviewTexts } from "@/lib/reviews/store"

// THE REVIEWS BRANCH WITHOUT MARKUP (node step 518-2): the branch's words and what a review page reads in a language.
//
// The words of the branch live in `../_data/<lang>.json` (no visible string in code); a language without its file reads English — the
// page itself is still drawn, only its interface words are English. The review's own text comes from the data layer per language
// (`lib/reviews/store.ts`); a language the agent did not write falls back to the default language and is NOT offered to search engines
// (`isIndexable` reads `overrides`, the same rule as every page of the element).

export type ReviewsWords = typeof en

const WORDS: Record<string, ReviewsWords> = { en, ru }

export function reviewsWords(lang: string): ReviewsWords {
  return WORDS[lang] ?? WORDS.en
}

/** The review's text in a language, or in the default language when the agent did not write that one. */
export function textsIn(review: ReviewPage, lang: string): ReviewTexts {
  return review.texts[lang] ?? review.texts[DEFAULT_LANGUAGE] ?? Object.values(review.texts)[0]
}

/** The event's text in a language, with the same fallback. */
export function eventIn(texts: Record<string, { text: string }>, lang: string): string {
  return (texts[lang] ?? texts[DEFAULT_LANGUAGE] ?? Object.values(texts)[0])?.text ?? ""
}

/** The shape the SEO rules read: a translation exists only where the agent wrote one. */
export function translatedPage(review: ReviewPage): TranslatedPage {
  const overrides: Record<string, unknown> = {}
  for (const [lang, t] of Object.entries(review.texts)) if (lang !== DEFAULT_LANGUAGE) overrides[lang] = t
  return { overrides }
}

/** The description for search engines and the snippet: the first sentence of the summary, at most 160 signs. */
export function descriptionOf(t: ReviewTexts): string {
  const first = t.summary.split(/(?<=[.!?])\s/)[0] ?? t.summary
  return first.length > 160 ? `${first.slice(0, 157).trimEnd()}…` : first
}
