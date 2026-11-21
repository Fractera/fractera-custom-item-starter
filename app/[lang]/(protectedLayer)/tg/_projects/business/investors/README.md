# Investors (Инвесторы) — `projects/investors`

Everything to show those who will invest.

- **Put here:** work of this direction — `metrics` (Metrics), `analytics` (Analytics), `pitch` (Pitch deck and terms). A page of the site or of «Администрирование» joins it with `"project": "investors/<item>"` (or `"investors"`) in its meta.json; a calendar entry with the same `project`.
- **Not here:** raw numbers and dashboards → `analytics`; the budget → `economy`.
- **A new item** (the person's «добавить», e.g. a new network): one entry in `items.json` — `slug`, `title` and `line` in en and ru. No build: the Mini App shows it within 30 s.
