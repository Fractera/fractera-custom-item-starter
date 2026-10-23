---
name: use-site-settings
description: >
  Builder skill. Where the settings of this element's site are decided and changed — the name, description and address, search
  settings, images, languages, the header menu, the footer, the cookie banner and the twelve feature switches (sign-in, breadcrumbs,
  questions, theme, width, language switch, social links, offline copy …). They are settings in `APP-CONFIG` and `PLATFORM-CONFIG`,
  not code. Load it when the person asks to change the title or description, «hide the sign-in button», «turn off breadcrumbs»,
  «add a link to the menu», «show the footer», «turn on the cookie banner», «where are the settings of this site», when they ask what
  /admin/site-settings shows, and before you write any of these into code. What you cannot guess: who owns them depends on the
  element's link to the node's CONFIG element — on, CONFIG sets them and a change here is overwritten; off (an app factory, or an
  element set apart), this element's pages `/<lang>/admin/site-settings/*` set them, and a saved setting redraws the pages with no
  build — except languages, which are baked into the build.
---

<!-- PROOF · NOT PROVEN yet: written, never checked by a live run (rules: development-docs/README.md, «Proof marks») -->

# use-site-settings

> Informational, not binding: know a better way for the case in front of you — do it your way and say so. Two things are not optional:
> a setting the person can change on a page never goes into code as a constant, and you never edit `APP-CONFIG` or `PLATFORM-CONFIG`
> behind the person's back — they decide on the page, the door writes the file.

**Process: build** — a new setting or a new page of settings is code: commit and a build of the element; confirm with the three lines
of `.claude/modes/build.md` («Confirm the request first»). Changing the value of an existing setting is the person's action on the
page — see «What needs a build».

This skill is the map. The details of two areas live in their own skills: the header and the footer — `use-site-menu`; languages —
`use-languages`. The look (colours, fonts, shapes) is not a site setting — `use-design`.

## Who owns the settings — the link decides

The element has a link to the node's CONFIG element; the node keeps it in `SERVICE_DATA_DIR/links.json` (`config`), the person
switches it in the core: the element's «Settings → Danger zone», card of links. No file or no key — the link is on.

| Link | Who sets them | What `/<lang>/admin/site-settings/*` does |
|---|---|---|
| **on** (one owner, `project`) | the node's CONFIG, for every element that follows it; its copy is laid over this element's files (`lib/project-settings.ts`) | says so and links to CONFIG and to the switch; it does not edit (the doors answer 409) |
| **off** (app factory, or set apart) | this element alone, in its own files | edits; saved — the pages of this element redraw at once |

In an app factory (`npm run passport -- me` → `node.type` is `factory`) new elements are born with the link off: each app is set up
by its own owner. The node's mode and the «All projects» catalog are decisions of the node, not of one site — they stay in CONFIG.

## The pages — one per section, each a route

| Page | What it sets | File |
|---|---|---|
| `/<lang>/admin/site-settings` | basics (name, description, contacts), SEO, meta and media, languages and the languages open to search | `APP-CONFIG` |
| `…/site-settings/features` | the twelve switches: top menu, footer pages, cookie banner, offline copy, sign-in, breadcrumbs, questions and answers, theme, width, language switch, social links, screen width badge | `PLATFORM-CONFIG` `features` |
| `…/site-settings/header` | the top menu switch and its items | `PLATFORM-CONFIG` `topMenu` + `APP-CONFIG` `nav.top` |
| `…/site-settings/footer` | the footer pages switch and its links | `PLATFORM-CONFIG` `footerPages` + `APP-CONFIG` `nav.footer` |
| `…/site-settings/cookie-banner` | the consent banner and the link to `/<lang>/cookies` | `PLATFORM-CONFIG` `cookieBanner` |

A row of links above each page leads between the sections; it is built from the folders `admin/_pages/site-settings/<section>/`, so a
new section folder shows there by itself. Doors: `GET/PATCH /<lang>/admin/api/settings/app` and `/<lang>/admin/api/settings/platform`
— the architect's session; the editors are copies of CONFIG's (`admin/_components/site-settings-editors/`, the main page's in its
widget folder). In the core these pages open from «Build → Site settings» of the element, in a new tab.

## What to do with a request

- **«Change the title / hide sign-in / add a menu link»** — check the link (`links.json`, or open the page: it tells you). Off — give
  the person the link to the right section and say what to change there; on — the link to CONFIG in the core, and say the change
  applies to every element that follows it. Do not change the value yourself.
- **A setting that does not exist yet** — the build process: a key in the schema (`config/app-config.schema.ts` or
  `config/platform-config.schema.ts`), its default, the code that reads it, and a field on the right page.

## What needs a build, and what does not

- **A saved name, description, switch, menu item or banner** — no build: the doors write the file and redraw the pages.
- **Languages** — the set the site serves and the ones open to search are baked into the build (`NEXT_PUBLIC_*`): saved on the page,
  they apply after «Deploy» on the element's «Preview & Deploy» page (`use-languages`).
- **A new setting or section** — code: commit, build beside the running version, switch.
- With the link off, the two files are this element's own settings: commit them with your next build commit so the repository keeps
  them; with the link on they are seeds overridden by CONFIG's copy.
