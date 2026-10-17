# Design brief — the reviews branch (`/<lang>/reviews`, `/<lang>/reviews/<slug>`)

Node step 518-3, 2026-10-17. Skill: impeccable, «Launcher unavailable» path (the launcher downloads a program; the owner did not ask to run
it). No PRODUCT.md and no DESIGN.md exist in this element; the visual authority is the element's established world: the Design tokens and the
shared content-page frame (`components/content-page/standard-content-page.tsx`). This file is development-only: nothing from it is copied into
code or into anything the browser receives.

## Scope and mode

A section inside an established surface — it inherits the world (impeccable new-work §1, §3 «Extend an existing surface»); the owner fixed the
blocks and their order, so no concept round. **Mode: Read** — the visitor (a person or another project's agent) wants to understand one
closed deal: what was done, how it went, what the author thinks of the partner. Comprehension and wayfinding first.

The owner's words, 2026-10-17 (in full in the node's step 518 plan): images in a grid, below them a vertical line with dots and time, newest
on top, inside a container about 1000 px high with its own scroll, then the summary — the main text block, then the author's own rating from
0 to 10, then whether the author would recommend working together, with free text, then share and print as PDF. The owner did not ask for a
polished new design — so: no new world, a clean record inside the existing one.

## Direction contract

THESIS: a review page is the signed record of one closed deal — facts, evidence, chronology, then the author's judgment — read top to bottom
like a waybill. It refuses the category default: avatar, five stars and a quote in a card carousel.

OWN-WORLD: the element's Design tokens only (`--primary` for the one accent: timeline dots, the filled rating tick; `--destructive` only for
a dislike; neutrals for everything else); the frame's typography scale (`H2`, `P`, `Small`); one 1 px rule language for the timeline and
the rating scale; tabular numerals for dates, the score and the order number; mono only for identifiers. No cards as structure, no eyebrow
above headings, no gradient, no glass.

STORY: the reader sees at once who worked with whom and how it ended (the verdict strip), looks at the evidence (photos), follows how it went
(timeline), reads the summary, sees the measured judgment (0–10 on a visible scale) and the recommendation, and can share or print it.

FIRST VIEWPORT: the frame's breadcrumbs and H1 (the review title); the cover — the page's snippet; under it the verdict strip — like or dislike with its icon, the score
«9 / 10», «recommends: yes / no» — then a facts grid (partner, order, role, published, the link to the original photos) in label-over-value pairs.

FORM: extension of the established surface (no seed: the launcher did not run and the request is precisely specified).

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster
carrying its provenance. (Here: an ordinary extension — DESIGN.md is not written; no raster is produced; the finish review runs from
`.claude/skills/impeccable/reference/degraded/finish-reviewer.md` in this thread, disclosed.)

## Blocks, rules and states

| Block | Rule |
|---|---|
| verdict strip | like (primary) / dislike (destructive) with a thumbs icon, score and recommendation in one row; wraps on a phone |
| facts | a grid of label-over-value pairs; values in tabular numerals; the order number in mono and breakable |
| cover | the page's own standard snippet (`snippet.png`, 1200×630) under the title — the owner's correction of 518-3: no photo grid |
| photos | not drawn on the page; one fact «Photos: N — open the originals», a native disclosure listing a link to every original file (new tab); drawn only when there are photos |
| timeline | one 1 px vertical rule, a dot per event, the date in a fixed-width left column (one width for all rows, so the text column starts at one x), newest on top; `max-height: 1000px`, own scroll with a themed scrollbar and a fade at the bottom edge when it overflows; drawn only when there are events |
| summary | the reading measure (≤ 70ch), paragraphs split on blank lines |
| rating | the number large in tabular numerals, «out of 10», and an 11-step scale 0…10 with the score's step filled — a measurement, not a progress ring |
| recommendation | «Yes, I recommend it» / «No, I do not recommend it» with a check or a cross, then the free text |
| actions | Share (system sheet or copy link) and Print as PDF; hidden in print |
| print | the site header, footer, breadcrumbs and actions hidden; black on white; the page's address printed at the end |
| empty list | `/reviews` without pages: one sentence that teaches what will appear here (owner approves the public wording) |

Contrast ≥ 4.5:1 for body text on the background in the light and dark theme; focus rings visible on the two buttons and the links.
