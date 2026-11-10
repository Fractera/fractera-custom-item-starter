# components/sections — the sections of this element

A section is a designed part of a page (`section-<name>`). Each lives in its own folder, named by its kind:

| In the folder | What |
|---|---|
| `index.tsx` | the component the page's factory draws (`Section`) and `Shape` — its fields in page data |
| `markdown.ts` | its words in the page's Markdown twin |
| `README.md` | what it is for |

`index.ts` here is the set — one line per section; a page may name only the kinds listed there, and a folder without `markdown.ts`
does not compile. `page-body.tsx` draws a page's `body` in its order — sections, `text-*` (`lib/content/text-set.tsx`, skill
`use-typography`) and the branch's `widget-*`; an unknown kind fails loudly at build.

| Section | What |
|---|---|
| `section-head/` | heading of a section with an anchor and a badge |
| `section-warning-card/` | a warning card |
| `section-faq/` | questions and answers (from the page's `faq`), with `FAQPage` structured data |

Add one (the design pass writes them from the element's brief, `.claude/modes/build-design.md`): its folder — the component (words from
page data, every container carries `data-block`, colours only as tokens, static), `Shape`, `markdown.ts`, a README — and its line in
`index.ts`. A first screen named `section-hero-<name>` stands full width, outside the text column
(`components/content-page/standard-content-page.tsx`). A design prototype's own section lives in the prototype until the pin
(`app/[lang]/(protectedLayer)/prototypes/_pages/<id>/sections/`, the same shape); `npm run design:pin` moves the winner's here with
their lines. `npm run check:sections` holds every set both ways — a folder without its line, a line without its folder, a folder
without its three files, a prototype's kind repeating one of here. After writing page data run `npm run check:page-sequence`: the live site renders
data newer than its build, and an unknown section would be dropped there. The table of contents of a document page is drawn by its
template, not named in the body: `components/content-page/toc.tsx`.
