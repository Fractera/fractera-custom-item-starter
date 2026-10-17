# `_libs/` of the reviews branch

The branch's own logic without markup.

| File | Role |
|---|---|
| `reviews-view.ts` | the branch's words by language, a review's text in a language with the default-language fallback, the shape the SEO rules read |
| `reviews-markdown.ts` | the list and a review page as markdown for agents |

The rows themselves are read and written by `lib/reviews/store.ts` — shared with the door `app/api/reviews`.
