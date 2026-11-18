---
name: telegram-mini-app
description: >
  Builder skill. This element's Telegram Mini App — the branch `/<lang>/tg`, opened by the menu button of the element's own bot and
  closed by the element's admin role. Load it when the person asks for «приложение в Telegram», «мини-приложение», «экран в боте»,
  «дашборд на телефоне», «кнопку меню бота», when a job wants cards, lists or a dashboard on the phone, and before you add anything
  under `app/[lang]/(protectedLayer)/tg/`.
---

# telegram-mini-app

**Process: build** — this skill changes the element as a thing: code, commit, rebuild; confirm with the three lines of `.claude/modes/build.md` («Confirm the request first»).

Node step 778. The owner of the node, 2026-11-17:
- «нужно внести маршрут в котором будет храниться Telegram мини app для этого элемента»;
- «этот маршрут точно должен быть защищен … той самой ролью»;
- «только он и архитектор всего проекта могут видеть приватные маршруты».

## 1. What it is, and what it is not

- **The element's face inside Telegram, for its administrator.** The bot's menu button opens `https://<this element's address>/tg`;
  the node sets that button when the bot admits a person and the element has an address on the node's own domain
  (`npm run tg-app -- menu <id>` in the core sets it again).
- **Not a mobile version of the site and not a bot command.** A short «do / show» stays a command of the bot; cards, lists, a
  dashboard, a form of several fields — here.
- **Not for visitors.** The branch is locked by the admin category (`lib/roles.ts` → `PROTECTED_GROUP_ROLES.admin`): the architect and
  this element's own admin (`OWN_ADMIN_ROLE`, one of `elementAdmin001…elementAdmin980`, given by the node from its registry). A Mini App
  for the element's customers is another decision — ask your person, never widen this branch.

## 2. The lock — three layers, already built

| Layer | Where | What it does |
|---|---|---|
| the edge | `proxy.ts`, «ворота страниц управления элементом» | a guest → the sign-in form and back; signed in without the role → the home page with a notice; the page's HTML never leaves |
| the sign | `tg/layout.tsx` (`AccessGate`) | tells a person why they were not let in |
| the door | every `/api/*` the Mini App calls | `requireRoles(req, PROTECTED_GROUP_ROLES.admin)` on its first line — the only lock that decides |

🔒 A screen's data comes only through such a door. Never put data into the page's static words, never trust what the browser sends
about who it is (Telegram's `initDataUnsafe` included).

Inside Telegram the person signs in once with the node's sign-in form, the same as on the computer.

## 3. Building a screen

- A screen is a page of the branch: a data folder `tg/_pages/<slug>/` (`meta.json`, `en.json`, `ru.json`) read by `tg/[...slug]`
  — never a new `page.tsx` (skill `use-page-tree`). The branch root (`tg/_data/`) is the start screen.
- Working parts — cards, lists, a form — are widgets in `tg/_widgets/{static|dynamic}/<name>/` with their door inside the branch
  (skill `build-widget`), built from `components/ui` (skill `use-shadcn`); `parts_find` first.
- The look is this element's own: its design tokens, light and dark. The site's header, footer and menus are hidden on this branch by
  `data-tg-app` (the layout); Telegram's own header takes the element's background (`tg/_components/tg-bridge.client.tsx`).
- A phone first: 390 px, one column, one hand, a 44 px hit area, every state in words (loading, empty, error).
- A screen is seen before it is shown: `npm run eyes -- <the address>/tg/<slug>` at 390 px in both themes (skill `use-eyes`); on this
  computer you pass every lock — check it as the admin role sees it.

## 3a. The menu — one file, two windows (node steps 789, 790)

- The drawer of the Mini App (☰) and the core's «Working process» of this element draw ONE menu: `tg/_data/menu.json`. The core reads
  it through the door `GET /api/tg-menu`; Telegram through `tg/_libs/tg-menu.ts`. Never a second menu, never a screen built for the
  core apart.
- Two modes: `work` «My projects» (the person's own work — posts for their Instagram, their sites) and `a2a` «A2A · Web4» (this
  element's services sold outward through Lagrix — said honestly while the network is not live). Drop a mode the element does not need.
- A category opens downward: its `children` are this element's own things — projects, author portraits, services — each with its
  screen folder; `add` names the line that adds one. Add a child, its folder `tg/_pages/<slug>/` and its line in one commit.
- `common` holds the items OUTSIDE the modes, on their level (the owner, Telegram 757): «Subscriptions», «Cron automation», «Element
  settings», «Help» — never put them inside a mode. Subscriptions and cron stay in every element.
- Proofs of a menu change: `npm run test:tg-menu` (the door accepts the file, a bad slug is refused) and eyes of the drawer open at
  390 px in both themes.

## 4. Telegram's side

- The bridge (`tg-bridge.client.tsx`) already tells Telegram the app is ready, expands it and paints its header. More of Telegram's
  controls (the main button, the back button, haptics) — events of core.telegram.org/api/web-events, read there before the code;
  posted the same way as in the bridge, no extra script.
- The purpose of this element's Mini App lives in `tg/README.md`, section «Назначение этого элемента» — written by your person or by
  you from their words. Keep it true when the screens change.
