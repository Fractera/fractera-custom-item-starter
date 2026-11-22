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
- `tg-add-item.client.tsx` — «＋ Добавить», the last row of a direction's card (node step 826): the window (name, one line) → the door
  `../api/items` appends the person's item to the direction's `items.json`; no build, no delete, no rename (those are the agent's).
- `tg-help.client.tsx` — «Справка» at the bottom of a direction's screen (826): a quiet button; its window holds what the server drew —
  what goes to a neighbour (`neighbours` of the direction's `meta.json`, each a link) and how the screen works.
- `tg-agent.client.tsx` — the element's own agent (840-4): its card opens the model choice (`tg-model-pick.client.tsx`: Opus with its effort,
  Sonnet, Haiku; the switch waits for the agent's turn) and «Топливо подписки» — the context window, 5 hours and 7 days of the account it
  runs on; one answer of `../api/agent` feeds both home groups.
- `tg-intro.client.tsx` — «Как начать» (840-4): the first text on the home screen until «Прочитано» (kept in this browser); the drawer's
  screen `start` shows the same text.
- `tg-to-chat.client.tsx` — «Перейти в чат»: the door `../api/context` keeps the section for the agent's hook and makes this element's own
  bot write «📍 Вы пришли из раздела: …» into the chat (840-4: Telegram cannot prefill the chat's field).
- Telegram's Back (840-4, `tg-bridge.client.tsx`): heard through all three receivers Telegram's clients call, it opens the screen above.
- `tg-search.client.tsx` — the search at the top of home (841): the question goes to this element's own agent through `../api/search`
  (the core wakes it with `reason: "mini-app-search"`), its bot writes «🔎 Ищу: …», the Mini App closes; the answer comes in the chat —
  the path in Projects, or the core's ladder (the node's elements, native elements, the Fractera marketplace — search v1, Lagrix).
- `tg-home-agent.client.tsx` — the home top, the Pult's top (840-4), and «Встроенные элементы» (841): two cards and «Ещё · N».
