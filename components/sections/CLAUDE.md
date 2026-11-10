# Sections — the rules of this folder

- A section is ONE folder named by its kind — `section-faq/`, the kind is the whole name: `index.tsx` (the Section and its Shape), `markdown.ts` (its line in the page's Markdown
  copy), `README.md`. Its import and its line stand in `index.ts`; `npm run check:sections` holds it both ways. A new kind is code — the
  design pass builds it; placing an existing kind on a page is data (the page's `body`).
- A first screen named `section-hero-<name>` stands full width, outside the text column; every other kind stays in the column.
- A page lists sections in its data (`body`), never imports them by hand; how a page is made — skill `use-page-tree`.
- A section is drawn into a static page: no `cookies()`, `headers()`, `force-dynamic` or `noStore()`; a live part is an island
  (a widget), never the section itself.
- The look comes only from the design tokens: no `#hex`, `rgb()`, `hsl()` literals and no Tailwind palette classes (`bg-red-500`) —
  a token class or `var(--…)`. Components only from `components/ui` (skill `use-shadcn`). Guards: `check:sections`,
  `check:shadcn-rules`.
- Every container in a section's code carries `data-block` — stamped by `npm run widgets:ids` (the name is historical: it stamps all
  component code); a page item's `bid` is stamped by `npm run blocks:ids`. Never strip an address that stands.
- A section made for a design prototype lives in `app/[lang]/(protectedLayer)/prototypes/_pages/<id>/sections/` until the pin
  (`npm run design:pin`) moves the winner here — a prototype's section is never written into this folder directly.
