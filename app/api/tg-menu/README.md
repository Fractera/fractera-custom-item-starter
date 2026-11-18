# `GET /api/tg-menu` — the Mini App's menu for the core

Made by `npm run door:add` (node step 548-16), filled in node step 789. The core's «Working process» of this element asks it on the
machine's loopback with `X-Node-Key` and draws the same tree in its left menu (node step 790): one menu, two windows — Telegram and the
computer. The menu itself lives in `app/[lang]/(protectedLayer)/tg/_data/menu.json`; this door only checks it and hands it over.

- `?lang=ru` — the caller's language (the menu keeps every language; the core picks).
- 200 `{ base: "/tg", lang, modes, common }` (`common` — the items outside the modes, on their level) · 422 `{ error, reason }` for a broken menu (`no_menu`, `bad_mode`, `bad_item`, `bad_child`) — a
  slug that climbs out (`../admin`) is refused, never half-sent.
- Samples: `npm run test:tg-menu`.
