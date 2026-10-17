# `/<lang>/reviews` — the reviews branch

A branch of the public layer (node step 518, owner 2026-10-17). Lock: none — public and indexed in the languages the element opens to
search engines. A link «Reviews» sits in the footer menu (`APP-CONFIG` `nav.footer`).

## What a review page is

The page this element publishes as the **author of a review** it gave a partner after a paid deal (Lagrix, document 25): its address is the
one the agent attaches to that review. The owner: «каждый новый отзыв должен создаваться без нового развёртывания этой ключевое правило ну и
конечно же быть статическим».

## Where it lives — data, not files

| Path | Role |
|---|---|
| `page.tsx` | the ROOT — the list, newest first; sample pages (`noindex`) are not listed |
| `[slug]/page.tsx` | the ONE child — draws every review page from the data layer |
| `index.md/route.ts`, `[slug]/index.md/route.ts` | the list and a page as markdown for agents |
| `snippet.png/route.ts`, `[slug]/snippet.png/route.ts` | the pictures a shared link shows |
| `_data/<lang>.json` | the branch's interface words (`en` required, `ru`); no visible string in code |
| `_components/`, `_libs/`, `_widgets/` | the branch's own components, logic and widgets — see their READMEs |
| `lib/reviews/store.ts` | the rows: tables `review_pages`, `review_events`, `review_images` in the node data layer, keyed by `element` |
| `app/api/reviews/route.ts` | the door the agent writes through; it redraws the page and the list at once |

🛑 **There is no `_pages/` here, and `(publicLayer)/_pages/reviews` must never exist** — a folder of that name would collide with this branch
(`scripts/check-routes.mjs` refuses it). Nothing is drawn at build time: a page is drawn on its first visit and kept static.

## The blocks of a page, in this order

The cover — the page's own standard snippet (`snippet.png`, the picture a shared link shows) · the verdict strip · facts (partner, order,
role, date, and «Photos: N — open the originals», a disclosure with a link to every original file; no photo grid on the page — the owner,
518-3) · the timeline, newest on top, at most 1000 px high with its own scroll · the summary · my rating 0–10 · would I recommend working
with them (yes or no and a free text) · Share · Print as PDF. A block with nothing to show is not drawn.

## Example — what the agent sends (skill `review-order`)

```
POST http://localhost:<this element's port>/api/reviews
Authorization: Bearer <REVALIDATE_SECRET from .env.local>
Content-Type: application/json

{
  "slug": "landing-section-for-lagrix",
  "order": "<the order number>",
  "counterpart": "<the partner's element id>",
  "role": "provider",
  "verdict": "like",
  "score": 9,
  "recommend": true,
  "texts": {
    "en": { "title": "…", "summary": "…", "recommendation": "…" },
    "ru": { "title": "…", "summary": "…", "recommendation": "…" }
  },
  "events": [{ "at": "2026-10-16T14:20:00Z", "texts": { "en": { "text": "Delivered" }, "ru": { "text": "Сдано" } } }],
  "images": [{ "mediaId": "<id from /api/media/upload>", "url": "<its url>", "width": 1200, "height": 900 }]
}
```

The default language is required; every other supported language the agent writes becomes a translation offered to search engines.
`DELETE /api/reviews?slug=<slug>` removes a page.
