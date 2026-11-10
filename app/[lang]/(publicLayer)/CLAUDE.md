# Public pages — the rules of this branch

- The home page's data is `_data/` (`meta.json` and one `<lang>.json` per language); every other page is a FOLDER OF DATA
  `_pages/<slug>/` of the same shape, read by the one route template `[slug]/` — never a new `page.tsx` (skill `use-page-tree`).
- A page's content is one sequence `body` of `section-*` · `text-*` · `widget-static-*` / `widget-dynamic-*`, the same in every
  language; a translation is one more language file next to the base (skill `use-languages`). Placing an existing section on a page is
  data (this pass); a NEW kind of section is code, made by the design pass (`components/sections/CLAUDE.md`).
- Plain text is `text-*` items (skill `use-typography`); what sections and text cannot do is a widget in this branch's `_widgets/` and its
  line in `_widgets/index.tsx` and `_widgets/markdown.ts` (skill `build-widget`).
- Every public page is static and readable without JavaScript; it gets its Markdown copy and its snippet by itself (skills
  `use-machine-copy`, `page-snippet`). After writing page data: `npm run check:page-sequence`, then `npm run blocks:ids`.
- Finish with the page's link and `#block=<bid>` of what you changed (skill `use-highlight`).
