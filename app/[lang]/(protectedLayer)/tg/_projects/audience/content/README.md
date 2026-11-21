# Content (Контент) — `projects/content`

Everything your publications are made of.

- **Put here:** work of this direction — `author` (Author portrait), `images` (Images), `video` (Video), `editing` (Editing), `music` (Music), `clip` (Clip), `texts` (Texts and scripts), `covers` (Covers and design), `shorts` (Short formats (Reels / Shorts)). A page of the site or of «Администрирование» joins it with `"project": "content/<item>"` (or `"content"`) in its meta.json; a calendar entry with the same `project`.
- **Not here:** where it is published → `social` or `platform`; the brand's voice rules → `brand`.
- **A new item** (the person's «добавить», e.g. a new network): one entry in `items.json` — `slug`, `title` and `line` in en and ru. No build: the Mini App shows it within 30 s.
