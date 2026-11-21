# Social networks (Соцсети) — `projects/social`

Your channels and what you publish there.

- **Put here:** work of this direction — `instagram` (Instagram), `youtube` (YouTube), `telegram` (Telegram). A page of the site or of «Администрирование» joins it with `"project": "social/<item>"` (or `"social"`) in its meta.json; a calendar entry with the same `project`.
- **Not here:** the raw material of posts (images, video, texts) → `content`; mailings → `mailings`; ads → `marketing`.
- **A new item** (the person's «добавить», e.g. a new network): one entry in `items.json` — `slug`, `title` and `line` in en and ru. No build: the Mini App shows it within 30 s.
