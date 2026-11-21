# Digital staff (Цифровые сотрудники) — `projects/digital-staff`

AI staff that work for you around the clock.

- **Put here:** work of this direction — `sales-ai` (AI sales and lead manager), `assistant` (AI assistant (mail, calendar, digests)), `support` (AI support operator), `smm` (AI content maker and SMM), `analyst` (AI analyst and researcher), `rules` (Instructions, roles and quality control). A page of the site or of «Администрирование» joins it with `"project": "digital-staff/<item>"` (or `"digital-staff"`) in its meta.json; a calendar entry with the same `project`.
- **Not here:** people on payroll → `hr`; prompts and tools themselves → `automation` or `ai`.
- **A new item** (the person's «добавить», e.g. a new network): one entry in `items.json` — `slug`, `title` and `line` in en and ru. No build: the Mini App shows it within 30 s.
