---
name: use-element-tree
description: >
  Builder skill. The exact file tree of this Fractera element — where every kind of file lives (instruction, passport, node
  contract, development documents, skills, tools, branches with their pages, widgets, components, logic and doors) and which
  folders every branch must have. Load it before creating, moving, renaming or deleting any file or folder of this element,
  before adding a page, a widget, a tool, a door or a branch, and when you are not sure where something belongs. The thing you
  cannot guess: the structure is not a habit but a contract — guards refuse the build when a branch lacks a required folder, a
  route file appears outside the closed list, or a widget sits outside its branch, and deleting a branch must leave nothing behind.
---

<!-- PROOF · PARTIAL 2026-10-07: the tree kept, the skill never loaded; pre-steps/ in the tree (added 2026-10-07) NOT proven · report: development-docs/proofs/2026-10-07-node-skills.md -->

# use-element-tree

> Not a hint: the element's tree matches this file exactly (CLAUDE.md). Changing the tree itself is the person's decision.

## The tree

```
<element>/
├── CLAUDE.md                 ← this file
├── OWN-SERVICE-PROPS/        ← the passport, the main door: its JSON, README, server; A2A-CARD.json (the A2A card)
├── NODE-CONTRACT.json        ← what the node needs to install and manage this element (never served outside)
├── development-docs/         ← how this element is being built (git, English only)
│   ├── README.md
│   ├── current-step.md
│   ├── steps-new/ · steps-done/
│   ├── pre-steps/ (README.md, handled/)
│   ├── glossary.md · anti-patterns.md     ← useful notes, carried to every element born from this one
│   ├── backlog.md · cancelled.md · reports/ (README.md)
│   ├── proofs/
│   ├── owner-decisions-on-skill-changes.md
│   └── translation-debt.md
├── _tools/                   ← the element’s tools: tool-<name>/ with tool.json; TOOLS.json generated; README (skill use-tools)
├── .claude/
│   ├── skills/*
│   └── hooks/*
├── lib/
│   ├── page-tree.ts
│   └── branch-page.tsx
├── scripts/
│   ├── check-routes.mjs
│   └── check-dev-docs.mjs
└── app/[lang]/
    ├── layout.tsx
    │
    ├── (publicLayer)/
    │   ├── README.md
    │   ├── api/<name>/route.ts    ← a door of this branch → /<lang>/api/<name> (guards itself)
    │   ├── page.tsx
    │   ├── _data/ {meta,en,ru}.json
    │   ├── _components/README.md  ← required: the branch's own components
    │   ├── _libs/README.md        ← required: the branch's own logic
    │   ├── _widgets/README.md     ← required: the branch's widgets (static/ · dynamic/)
    │   ├── [slug]/
    │   │   ├── page.tsx
    │   │   ├── index.md/route.ts
    │   │   └── README.md
    │   └── _pages/
    │       ├── README.md
    │       ├── privacy/       {meta,en,ru}.json
    │       ├── terms/         {meta,en,ru}.json
    │       ├── cookies/       {meta,en,ru}.json
    │       └── accessibility/ {meta,en,ru}.json
    │
    ├── (protectedLayer)/
    │   ├── layout.tsx
    │   ├── README.md
    │   ├── account/
    │   │   ├── layout.tsx
    │   │   ├── page.tsx
    │   │   ├── _data/ {meta,en,ru}.json
    │   │   ├── _components/README.md  ← required: the branch's own components
    │   │   ├── _libs/README.md        ← required: the branch's own logic
    │   │   ├── _widgets/README.md     ← required: the branch's widgets (static/ · dynamic/)
    │   │   ├── [...slug]/page.tsx
    │   │   ├── README.md
    │   │   └── _pages/
    │   │       ├── README.md
    │   │       ├── user/ · vip-user/ · subscriber-lite/ · subscriber-standard/ · subscriber-max/
    │   │       └── buyer/            ← role folder: the role's page and its pages
    │   │           └── orders/       ← /<lang>/account/buyer/orders
    │   ├── staff/
    │   │   ├── layout.tsx · page.tsx · _data/ · [...slug]/page.tsx · README.md
    │   │   ├── _components/README.md · _libs/README.md · _widgets/README.md
    │   │   └── _pages/ manager/ · senior-manager/ · support-manager/ · delivery-manager/ · content-editor/
    │   ├── finance/
    │   │   ├── layout.tsx · page.tsx · _data/ · [...slug]/page.tsx · README.md
    │   │   ├── _components/README.md · _libs/README.md · _widgets/README.md
    │   │   └── _pages/ finance/
    │   └── admin/
    │       ├── layout.tsx · page.tsx · _data/ · [...slug]/page.tsx · README.md
    │       ├── _components/README.md · _libs/README.md · _widgets/README.md
    │       └── _pages/ admin/ · users/ · site-settings/
    │
    └── (guestLayer)/
        └── guest/
            ├── layout.tsx
            ├── page.tsx
            ├── _data/ {meta,en,ru}.json
            ├── _components/README.md · _libs/README.md · _widgets/README.md
            ├── [slug]/page.tsx
            ├── README.md
            └── _pages/README.md
```

A branch = `layout.tsx` + `page.tsx` + one child route. Everything below the branch root is data in `_pages/`.
🔒 Every branch root has three required folders, each with a README that says what goes in it (owner 2026-10-07):
`_components/` — the branch's own components (server by default, islands `*.client.tsx`; shared ones go to `components/`);
`_libs/` — the branch's own logic without markup (shared logic goes to `lib/`); `_widgets/` — the branch's widgets,
`static/widget-static-<name>` or `dynamic/widget-dynamic-<name>`, listed in the branch's `_widgets/index.tsx` (the only own blocks a page may show — `scripts/check-page-composition.mjs`). Code of a
branch lives only there. `scripts/check-routes.mjs` refuses the build when a branch lacks one of them or its README.
Every route folder and every `_pages/` has a `README.md` with a full example of a page folder — enough to add a page.

## Rules the guards keep

- `scripts/check-routes.mjs` — every route file is in its closed list (a new page is a data folder, never a `page.tsx`); every
  branch root has `_components/`, `_libs/`, `_widgets/` with a README.
- `scripts/check-page-sequence.mjs` — a page names only `block-*`, `text-*` and its own branch's `widget-*`.
- `scripts/check-protected.mjs` — under `_widgets/` only `static/`, `dynamic/` and `index.tsx`.
- A new branch, a new top-level folder or a moved one — ask the person first (CLAUDE.md, «Page»: a route owns its own).
