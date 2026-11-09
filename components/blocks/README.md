# components/blocks — the sections of this element

The element's own sections (`block-<name>`): a page names them in its sequence; `page-body.tsx` draws the sequence (skill
`use-page-tree`). Since node step 706 there is no shared catalogue: the design pass writes the sections this element needs, from its
brief (`.claude/modes/build-design.md`).

| File | Kind |
|---|---|
| `block-section-head.tsx` | heading of a section with an anchor and a badge |
| `block-warning-card.tsx` | a warning card |
| `block-faq.tsx` | questions and answers (from the page's `faq`), with `FAQPage` structured data |
| `block-toc.tsx` | the table of contents of a document page |
| `page-body.tsx` | the factory: draws a sequence by its set; an unknown kind fails loudly |

Add one: the component here (words come from page data, every container carries `data-block`, colours are tokens, static), a line
in `lib/content/blocks/registry.tsx`, its type in `lib/content/blocks/types.ts`, its Markdown line in `lib/aio/blocks-to-markdown.ts`
(the check there is exhaustive — the build fails without it). A first screen named `block-hero-<name>` stands full width, outside the
text column (`components/content-page/standard-content-page.tsx`). After writing page data run `npm run check:page-sequence`: the live
site renders data newer than its build, and an unknown section would be dropped there. Plain text is `text-*`
(`lib/content/text-set.tsx`, skill `use-typography`).
