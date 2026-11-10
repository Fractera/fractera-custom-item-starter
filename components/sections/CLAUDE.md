# Sections — the rules of this folder

- A section is ONE folder `section-<kind>/`: `index.tsx` (the Section and its Shape), `markdown.ts` (its line in the page's Markdown
  copy), `README.md`. Its import and its line stand in `index.ts`; `npm run check:sections` holds it both ways.
- A page lists sections in its data (`body`), never imports them by hand; how a page is made — skill `use-page-tree`.
- A section is drawn into a static page: no `cookies()`, `headers()`, `force-dynamic` or `noStore()`; a live part is an island
  (a widget), never the section itself.
- The look comes only from the design tokens: no `#hex`, `rgb()`, `hsl()` literals and no Tailwind palette classes (`bg-red-500`) —
  a token class or `var(--…)`. Components only from `components/ui` (skill `use-shadcn`). Guards: `check:sections`,
  `check:shadcn-rules`.
- Every container carries `data-block` (`npm run widgets:ids`); never strip an address that stands.
- A design prototype's own sections live in `app/[lang]/(protectedLayer)/prototypes/_pages/<id>/sections/` until the pin
  (`npm run design:pin`) — never write them here directly.
