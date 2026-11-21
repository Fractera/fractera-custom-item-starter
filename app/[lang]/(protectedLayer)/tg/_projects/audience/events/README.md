# Events (Мероприятия и события) — `projects/events`

Broadcasts, meetings and reasons to be heard.

- **Put here:** work of this direction — `webinars` (Webinars and broadcasts), `conferences` (Conferences and meetings), `launch` (Launch checklists), `newsjacking` (News hooks calendar). A page of the site or of «Администрирование» joins it with `"project": "events/<item>"` (or `"events"`) in its meta.json; a calendar entry with the same `project`.
- **Not here:** the material of a broadcast → `content`; trends to react to → `watch`.
- **A new item** (the person's «добавить», e.g. a new network): one entry in `items.json` — `slug`, `title` and `line` in en and ru. No build: the Mini App shows it within 30 s.
