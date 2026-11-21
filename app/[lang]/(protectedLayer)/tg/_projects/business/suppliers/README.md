# Suppliers (Поставщики) — `projects/suppliers`

Where the goods come from and on what terms.

- **Put here:** work of this direction — `wholesale` (Wholesale), `retail` (Retail), `logistics` (Logistics and terms). A page of the site or of «Администрирование» joins it with `"project": "suppliers/<item>"` (or `"suppliers"`) in its meta.json; a calendar entry with the same `project`.
- **Not here:** your own equipment → `production`; logistics of your trips → `travel`; contractors of work → `team`.
- **A new item** (the person's «добавить», e.g. a new network): one entry in `items.json` — `slug`, `title` and `line` in en and ru. No build: the Mini App shows it within 30 s.
