# Design pass — the laws of this session

This file comes with the design pass of the build session (node step 590-5; rewritten by node step 706-4): the look of pages, designed
natively from the brief. The laws of building (`.claude/modes/build.md`) hold here too.

## The design pass

The owner of the node, 2026-11-09, verbatim: «Отлично давай зафиксируем факт того что мы приняли решение отказаться от элементов дизайн
и от элементов Blok»; «стартовый шаблон не имеющий никакого Патерно проще развернуть в любую сторону». The shared Blocks catalogue and
the shared Design are gone: you design this element's pages yourself, from its brief, as a designer would — not by assembling ready
sections.

- **What this pass does:** the brief read and, where it is empty, asked; `DESIGN.md`; the element's own sections with their words in
  page data; their look on this element's tokens (`DESIGN-CONFIG`); the highlight address on every container; the page seen with
  `npm run eyes` before anyone else sees it.
- **What it never does:** doors, data, the logic of a scenario, the final words people read — the main pass and the texts pass. A request
  for them: write `current-step.md`, then `npm run pass -- main "<the request>"` (or `texts`).
- **The skills of this pass:** the one named by the brief (`frontend-design` by default, `impeccable`, `design-taste-frontend`), the
  slop checklist of `frontend-design-deslop` (`references/slop-checklist.md`) before «done», `shadcn` (through `use-shadcn`),
  `ai-elements` (through `use-messenger`) — the line `Pass:` of each one's `SOURCE.md` says where it lives.
- **End of the pass:** commit, write `current-step.md` (what is done, «next: the main pass»), tell the person in one line with the
  screenshot; switch with `npm run pass -- main "<the next substep>"` when the step goes on, or stop when the person wants to look first.

<!-- RULE: our-architecture -->
🔒 Our architecture, never theirs — non-cancellable (owner of the node, 2026-10-23:
«категорически запрещено в процессе проектирования переносить не оптимизированную механику в наш проект … элементы интерфейса и бизнес логики мы пере используем а техническую архитектуру сохраняем собственную»).
From a product studied by reverse engineering, screenshots or knowledge we take its interface
elements and its business logic — never its technical architecture. Pages stay static and readable without JavaScript, with the least
load on the server and the database; an endless feed becomes pages with server search. Whatever the studied product does without
search optimization, without static pages or with heavy load, we solve our own native way. Everything a study holds about a studied
product — REA's records in `study/`, screenshots, notes — describes another product: a source to learn from, never our own code, pages, routes or data.

## The design of a page — the order

1. **The brief** — the passport's `design` block (`OWN-SERVICE-PROPS/OWN-SERVICE-PROPS.json`), written by the person on this element's
   «Design» page (`/<lang>/admin/design`, the first section): who the site is for, its character in up to five words, references (a link
   and/or an uploaded screenshot — `media`, shown at `/api/media/<id>/file`), what to avoid, the design skill. `inheritedFrom` — the look
   came from a sibling element at birth: keep it unless the person changes it. **Empty or thin — ask the person once**, by the questions
   of the brief, and write the answers there through the same page or door (`/<lang>/admin/api/settings/brief`); never invent the audience.
2. **`DESIGN.md`** at the element's root, in the open DESIGN.md format (machine-readable tokens in the YAML header, prose after): the
   direction derived from the subject of the product and the brief, a small token system — and the tokens written into `DESIGN-CONFIG`
   (the «Design» page's fonts, colours, type, shapes, or the design door) so the header, the footer and every page follow them.
3. **The sections** — your own components in this element, as the product needs them; there is no catalogue to search. The section
   contract stays: words come from the language cells of page data (never hard-coded in JSX), every container carries `data-block`
   (`npm run widgets:ids`), the section is static, colours are tokens, and the machine copy of the page (`/<lang>/index.md`) carries its
   text. Pages of documents keep the four document sections (section-head, faq, toc, warning-card).
4. **Seen before shown** — `npm run eyes` on the page at 1440 and 500 px; read it against the slop checklist and the brief's «avoid»;
   what reads as a template default is redone before the person sees it.
5. **Then stop:** commit, `current-step.md`, the screenshot to the person; their grade is the proof, not your opinion.

## Design skill

The design skill lives in the passport twice and in step: `design.skill` of the brief and `designSkill` (the indicator and
`npm run design-skill` read the latter); the brief's door keeps them equal. Default `frontend-design`. Read the skill before any design
work and work in its method; the person changes it on the «Design» page. `npm run describe:publish` carries the brief to the core
(«Take into core») — so a sibling element can be born with this look (`create --look-like <this id>`).
