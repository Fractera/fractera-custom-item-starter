# Public pages — the rules of this folder

- A page is a FOLDER OF DATA `<slug>/` (`meta.json` and one `<lang>.json` per language), read by the one route template — never a new `page.tsx` (skill `use-page-tree`).
- Its content is one sequence of `section-*` · `text-*` · `widget-static-*` / `widget-dynamic-*`, the same in every language; a
  translation is one more language file next to the base (skill `use-languages`).
- Plain text is `text-*` items (skill `use-typography`); what sections and text cannot do is a widget (skill `build-widget`).
- Every public page is static and readable without JavaScript; it gets its Markdown copy and its snippet by itself — a widget brings its
  own `markdown.ts` (skills `use-machine-copy`, `page-snippet`).
- Finish with the page's link and `#block=<bid>` of what you changed (skill `use-highlight`).
