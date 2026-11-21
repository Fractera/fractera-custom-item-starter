# Travel and relocation (Путешествия и релокация) — `projects/travel`

Routes, stays, documents and trip budgets.

- **Put here:** work of this direction — `routes` (Routes and tickets), `stays` (Stays and hotels), `wishlist` (Places wishlist), `packing` (Packing lists and documents), `budget` (Trip budget). A page of the site or of «Администрирование» joins it with `"project": "travel/<item>"` (or `"travel"`) in its meta.json; a calendar entry with the same `project`.
- **Not here:** relocation of a business → `business/*`; personal budget → `finance`.
- **A new item** (the person's «добавить», e.g. a new network): one entry in `items.json` — `slug`, `title` and `line` in en and ru. No build: the Mini App shows it within 30 s.
