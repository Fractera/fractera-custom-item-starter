---
name: use-design
description: >
  Builder skill. Where the look of this element is decided and changed: fonts, the colours of the light and dark theme, the type
  scale, corners, borders, spacing and the app width are design tokens in `DESIGN-CONFIG`, not code. Load it when the person asks
  to change colours, a theme, a font, «make it darker», «rounder corners», «bigger text», «our brand colours», «where do I change
  the design», when they ask what the page /admin/design shows, and before you write any colour, font or radius into a widget or a
  block. What you cannot guess: who owns the tokens depends on the element's link to the node's shared Design element — on, the
  shared Design sets them and a change here is overwritten; off (an app factory, or an element set apart), this element's own
  workshop `/<lang>/admin/design` sets them — and a saved token redraws every page at once, with no build.
---

<!-- PROOF · NOT PROVEN yet: written, never checked by a live run (rules: development-docs/README.md, «Proof marks») -->

# use-design

> Informational, not binding: know a better way for the case in front of you — do it your way and say so. Two things are not optional:
> a colour, a font or a radius never goes into a widget or a block as a value (only as a token), and you never edit `DESIGN-CONFIG`
> by hand — the person changes the look on the page, the door writes the file.

**Process: build** — a new token or a new setting of the workshop is code: commit and a build of the element; confirm with the three
lines of `.claude/modes/build.md` («Confirm the request first»). Changing the value of an existing token is the person's action on the
page and needs no build — see «What needs a build».

## Why tokens

Every page of this element is drawn on the same tokens — `--primary`, `--accent`, `--destructive`, the neutrals, `--radius`, the
font roles and the type scale (`lib/design-css.ts` turns `DESIGN-CONFIG` into them when a page is drawn; pages stay static and are redrawn when the design changes). Change a token once and every
page, block and widget follows; a colour written into one widget is paid again on the next one and drifts from the rest. That is
why the workshop exists: the look is decided in one place, as data.

## Who owns the tokens — the link decides

The element has a link to the node's shared Design element; the node keeps it in `SERVICE_DATA_DIR/links.json` (`design`), the
person switches it in the core: the element's «Settings → Danger zone», card of links. No file or no key — the link is on.

| Link | Who sets the tokens | What `/<lang>/admin/design` does |
|---|---|---|
| **on** (one owner, `project`) | the shared Design element of the node; it signals, this element takes its patch into `DESIGN-CONFIG` (`lib/design-follow.ts`) and redraws | says so and links to the shared Design and to the switch; it does not edit — a change here would be overwritten by the next signal (the door answers 409) |
| **off** (app factory, or set apart) | this element alone | edits: fonts, colours of both themes, type, shapes; saved — every page of this element redraws at once |

In an app factory (`npm run passport -- me` → `node.type` is `factory`) new elements are born with the link off: each app keeps the
look of its own owner, and the shared Design would carry one owner's look into another's app.

## Where it lives

| What | Where |
|---|---|
| the tokens | `DESIGN-CONFIG/design-config.json` — only what the person decided; the rest falls back to the defaults in `config/design-config.defaults.ts` |
| the workshop pages | `app/[lang]/(protectedLayer)/admin/_pages/design/` — `/<lang>/admin/design` (fonts), `…/design/colors`, `…/design/type`, `…/design/shape`; one page per section, each a route |
| the editors | `app/[lang]/(protectedLayer)/admin/_components/design-editors/` — copies of the shared Design element's editors |
| the door | `GET/PATCH /<lang>/admin/api/settings/design` — the architect's session; JSON merge patch, `null` returns a key to its default; 409 while the link is on |
| the only writer of the file | `lib/architect/design-config-writer.ts` (the core's key door `app/api/settings/design` uses it too) |
| the core's button | «Build → Design» of this element, opens the workshop in a new tab |

## What to do with a request

- **«Change the colours / font / corners»** — check the link (`links.json`, or open `/<lang>/admin/design`: it tells you). Off — give
  the person the link to the right page of the workshop (`/<lang>/admin/design/colors` and so on) and say what to pick there; on —
  give the link to the shared Design in the core and say the change applies to every element that follows it. Do not change the
  value yourself: the person sees the preview next to the controls and decides.
- **A look the tokens cannot express** (a gradient, a pattern, a second accent) — that is a new token or a new setting: the build
  process. Add the token to `config/design-config.schema.ts`, its default, `lib/design-css.ts`, and an editor field; then the widget
  uses the token. Never a value in the widget.
- **A custom design of a whole page** — skill `custom-design` (it asks taste or impeccable); its colours and fonts still map to
  these tokens.
- **Text, not look** — skill `use-typography`; **settings of the site** (name, menu, footer, switches, languages) — skill `use-site-settings`.

## What needs a build, and what does not

- **A saved token** — no build: the door writes `DESIGN-CONFIG` and redraws the pages. With the link off the file is this
  element's own design: commit it with your next build commit, so the repository keeps it; with the link on it is a copy the node
  writes — leave it out of your commits.
- **A new token, a new editor field, a changed editor** — code: commit, build beside the running version, switch.
- **Fonts** are served by this element (`lib/design/local-fonts.json` → `scripts/local-fonts.mjs` → `public/fonts/`): a font family
  outside that table has no file — adding one is code.

## Rules

- Colours, fonts and radius in a widget or a block — only tokens (`bg-primary`, `text-muted-foreground`, `rounded-[var(--radius)]`).
- The workshop edits this element only; it sends nothing to the other elements of the node.
- Every container of the editors carries `data-block` (`npm run widgets:ids`).
