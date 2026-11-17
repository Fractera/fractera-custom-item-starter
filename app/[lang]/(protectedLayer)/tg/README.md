# `/<lang>/tg` — the element's Telegram Mini App

A branch of the element's frame (node step 778). The owner, 2026-11-17: «В файловую архитектуру root и основного шаблона нужно внести
маршрут в котором будет храниться Telegram мини app для этого элемента в его папке маршру readme.md я пишу назначение».

## Назначение этого элемента

<!-- What this element's Mini App is for — written by the owner or by the element's agent, in the person's own words. Until then the
     Mini App shows its start screen. -->

## What this branch is

- **The element's face inside Telegram.** Its bot's menu button opens `https://<the element's address>/tg` (the core sets the button per
  allowed chat once the element has a bot and an address on the node's own domain). The person never types it.
- **Closed by the element's admin role.** Only the architect and this element's own admin (`lib/roles.ts` → `OWN_ADMIN_ROLE`, one of
  `elementAdmin001…elementAdmin980`, its number in the node's registry) get in. The lock stands at the edge (`proxy.ts`, «ворота страниц
  управления элементом»): a guest who types the address gets the sign-in form and comes back here, a signed-in person without the role
  goes to the home page with a notice — the page's HTML never leaves for either. Inside Telegram the person signs in once, the same way.
- **No site chrome.** `data-tg-app` on the layout's wrapper hides the site's header, footer, menus, banners and badges
  (`styles/globals.css`, the rule with `[data-site-chrome]`); the element's own design tokens stay — its look is its own.
- **Telegram's own header wears the element's background.** `_components/tg-bridge.client.tsx` tells Telegram the app is ready, expands
  it and paints its header and background with the element's background colour (core.telegram.org/api/web-events:
  `web_app_ready`, `web_app_expand`, `web_app_set_header_color`, `web_app_set_background_color`).

## What is here

| Path | Role |
|---|---|
| `page.tsx` | the ROOT of the branch — `/<lang>/tg`, words in `_data/{meta,en,ru}.json` (the start screen) |
| `layout.tsx` | the sign of the lock (`AccessGate`, the admin category's roles), the chrome-less wrapper, the Telegram bridge |
| `[...slug]/page.tsx` | the ONE child route — draws every folder of `_pages/` |
| `_data/` | the words of the root: `meta.json`, `en.json` (required), `ru.json` |
| `_components/` | the branch's own components; `tg-bridge.client.tsx` lives here |
| `_libs/` | the branch's own logic without markup |
| `_widgets/` | the branch's widgets, `static/<name>` · `dynamic/<name>` — a Mini App's cards and lists usually live here |
| `_pages/<slug>/` | the Mini App's screens — data only, one folder per screen |

## How the element's agent builds it

- Screens are pages of this branch (`_pages/<slug>/`) built from the element's own sections and widgets — the same frame as every
  branch; data comes only through the element's own doors under `/api/*`, each asking `requireRoles(req, PROTECTED_GROUP_ROLES.admin)`.
- Design for a phone: 390 px first, both themes, one hand; short «do / show» stays a bot command, cards and dashboards come here.
- The node's skill `telegram-mini-app` (in the element's skills) says when a job wants a Mini App and when a command.

## The rule of the frame

This element is built on Next 16.2 and grows only inside its frame (`CLAUDE.md`, section «The frame»). A branch has its root page, its
child route and the five folders above; a new screen is a data folder, never a new `page.tsx`.
