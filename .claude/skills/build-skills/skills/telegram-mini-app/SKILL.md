---
name: telegram-mini-app
description: >
  Builder skill. This element's Telegram Mini App — the branch `/<lang>/tg` for its administrator: home, Projects (4 sections, 46
  directions), Cron, Element, Settings. Load it when the person asks for «мини-приложение», «экран в боте», «дашборд на телефоне»,
  names a project or a direction («мой Instagram», «финансы»), asks where a project's work goes, and before you add anything under
  `app/[lang]/(protectedLayer)/tg/`.
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

🔒 Data about people or money (accounts, orders, payments) comes only through such a door. Never put data into the page's static
words (`en.json`, `ru.json`), never trust what the browser sends about who it is (Telegram's `initDataUnsafe` included).
821: the facts of this element's own folder — the projects' numbers, the calendar, the settings' summaries — are drawn by the screen's
widget on the server (cached 5 minutes): on the own domain the edge lock keeps the page's HTML from anyone without the role; on a
temporary address the panel is read-only to anyone with the link — the owner's conscious trade-off (`lib/auth/temporary-address.ts`).
Nothing in them is another person's data. What the core knows (the agent) comes through the branch's own doors (below).

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

## 3a. The menu — one file, two windows (node steps 789, 790, 821)

- The drawer of the Mini App (☰, beside the large title of every screen — `tg/_components/tg-head.client.tsx`) and the core's «Working
  process» of this element draw ONE menu: `tg/_data/menu.json`. The core reads it through the door `GET /api/tg-menu`; Telegram through
  `tg/_libs/tg-menu.ts`. Never a second menu, never a screen built for the core apart.
- One mode (the owner, Telegram 412, 2026-11-21): «Главная» · «Проекты» (opens into its four sections, `add` «Все направления») ·
  «Cron» (one calendar for every project) · «Элемент» (site, people, agent, building) · «Настройки» (instruction, owner, project, skills,
  subscriptions, MCP). `common` stays empty in the shape the core reads. The A2A screens return when the network lives.
- Proofs of a menu change: `npm run test:tg-menu` and eyes of the drawer open at 390 px in both themes.

## 3b. Projects — where the person's work lives (node steps 821, 824)

- **The tree of folders is the source** (the owner, Telegram 494): `tg/_projects/<section>/<group>/`. Every section and group folder has
  `meta.json` (order, icon, title, a group's line) and a **README.md — read it before you put anything there**: what the group holds,
  «not here → the neighbour», how work joins it. All 4 sections and 46 groups are visible from the first day, empty but ready (the
  owner: «сама архитектура вдохновит его»). Addresses: `/tg/projects/<section>`, `/tg/projects/<group>`, `/tg/projects/<group>/<item>`.
- **Sections and groups are static**: `npm run tg:projects` compiles them into `tg/_data/projects.json` and the «Projects» children of
  `menu.json` (both generated — never edit by hand); the prebuild stops a build whose files differ from the tree. A new section or
  group = a folder with `meta.json`, `README.md`, `items.json` → `npm run tg:projects` → commit → the element's build; then the Mini App
  and the core's «Рабочий процесс» show it.
- **Items are dynamic**: `items.json` of the group, read at run time. The person's own item («добавь Twitter в соцсети») = one entry —
  `slug`, `title` and `line` in every language — and **no build**: it shows within 30 s, at once after `npm run pages:refresh`.
- **A project's work is a page of the element's SITE or of «Администрирование»** — which one is yours and the person's choice (the owner,
  Telegram 434, 490). The page names its project in its `meta.json`: `"project": "<group>/<item>"` (or `"<group>"`) — the Mini App
  counts it under «страниц на сайте» and «Открыть сайт» opens it.
- **A calendar entry for a project** names it the same way in `data/cron.json`: `"project": "social/instagram"` — it counts as «активных
  в Cron», today's as «задач сегодня», and «Cron» shows its direction. An entry without `project` belongs to the element as a whole.
- **The person names a project** («мой Instagram», «тренировки») → find its group by the READMEs and work there; tell the person the
  address.
- A direction that needs its own dashboard → a folder `tg/_pages/projects/<group>/` with a widget: a real folder wins over the
  catalog's screen.
- Proofs: `npm run test:tg-projects` (the tree whole, items read at run time, counts from the site, «Администрирование» and the
  calendar — with negatives) and eyes of the screen.

## 3c. The core's facts and the chat (node step 821)

- **The agent card** (home) and **the subscription and the bot** («Элемент») — the island `tg/_components/tg-agent.client.tsx` asks
  the branch's door `GET /<lang>/tg/api/agent` (the admin category); the door asks the core `GET /api/node/my-agent` with this element's
  own key — the core answers only about this element, never the node's composition or the architect's e-mail.
- **«Перейти в чат»** posts the section the person leaves from to `POST /<lang>/tg/api/context` (`SERVICE_DATA_DIR/tg-context.json`),
  then closes the Mini App; the core's hook `came-from` adds «⟦node · came-from …⟧» before the person's next words for 30 minutes.
  Read that line: the person's words are about that section unless they name another.

## 4. Telegram's side

- The bridge (`tg-bridge.client.tsx`) tells Telegram the app is ready, expands it and paints its header; 821 — Telegram's theme
  becomes this element's tokens inside Telegram (`data-tg-theme`, `styles/globals.css`) and Telegram's own Back button walks back
  through the screens. «Перейти в чат» (`tg-to-chat.client.tsx`) closes the Mini App back to the chat. More of Telegram's controls
  (the main button, haptics) — events of core.telegram.org/api/web-events, read there before the code; posted with `tgPost`, no extra
  script.
- The purpose of this element's Mini App lives in `tg/README.md`, section «Назначение этого элемента» — written by your person or by
  you from their words. Keep it true when the screens change.
