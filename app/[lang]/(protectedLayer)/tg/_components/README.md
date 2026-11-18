# `/<lang>/tg` — `_components/`: the branch's own components

Required folder of every route branch (owner 2026-10-07). The underscore keeps it out of routing: Next never turns it into a URL.

## What lives here

React components that belong to the **tg** branch only — the pieces its `page.tsx`, `layout.tsx` and
`[...slug]/page.tsx` are made of: the branch's page body, its shell parts,
the lock screen of the branch. `page.tsx` stays thin and re-exports from here.

- **Server by default.** A file is a server component unless it needs the browser; a browser piece is named `*.client.tsx`
  and stays an island inside a server component, so the page is still prerendered and readable without JavaScript.
- **Not here:** something two branches use — it goes to `components/` at the root (shadcn primitives in `components/ui/`);
  a piece shown on a page — that is a widget (`../_widgets/`) or a section of this element (`components/sections/`); logic without markup — `../_libs/`.

## Rule of thumb

Delete the branch folder and nothing else in the element breaks: then the component was in the right place.

## In this branch

- `tg-bridge.client.tsx` — tells Telegram the app is ready, expands it, paints its header with the element's background.
- `tg-shell.client.tsx` — the frame: the top bar (☰ and the current screen's title), the left drawer (the element, the two modes,
  groups, categories opening downward, «Open the element's site»). It draws `../_data/menu.json`; it never holds a menu of its own —
  the same file feeds the core's «Working process» (`../README.md`, «One menu — two windows»).
