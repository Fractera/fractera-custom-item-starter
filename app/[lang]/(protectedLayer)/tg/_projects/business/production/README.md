# Production (Производство) — `projects/production`

How your product is made: equipment, materials, quality.

- **Put here:** work of this direction — `equipment` (Equipment), `materials` (Materials), `technology` (Technology and quality control). A page of the site or of «Администрирование» joins it with `"project": "production/<item>"` (or `"production"`) in its meta.json; a calendar entry with the same `project`.
- **Not here:** equipment as property you own → `assets`; suppliers of materials → `suppliers`.
- **A new item** (the person's «добавить», e.g. a new network): one entry in `items.json` — `slug`, `title` and `line` in en and ru. No build: the Mini App shows it within 30 s.
