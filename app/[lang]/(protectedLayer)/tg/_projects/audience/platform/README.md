# Platform (Платформа) — `projects/platform`

The places where your texts and site live.

- **Put here:** work of this direction — `medium` (Medium), `site` (Own site / landing). A page of the site or of «Администрирование» joins it with `"project": "platform/<item>"` (or `"platform"`) in its meta.json; a calendar entry with the same `project`.
- **Not here:** social networks → `social`; domains and hosting access → `tools`.
- **A new item** (the person's «добавить», e.g. a new network): one entry in `items.json` — `slug`, `title` and `line` in en and ru. No build: the Mini App shows it within 30 s.
