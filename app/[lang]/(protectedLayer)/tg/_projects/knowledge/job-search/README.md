# Job search (Поиск работы и трудоустройство) — `projects/job-search`

Applications, interviews and offers in one place.

- **Put here:** work of this direction — `boards` (Job boards (LinkedIn, HeadHunter, niche boards)), `letters` (CV, cover letters and portfolio), `pipeline` (Applications pipeline and statuses), `interviews` (Interview prep and test tasks), `offers` (Comparing offers), `recruiters` (Recruiters and referrals). A page of the site or of «Администрирование» joins it with `"project": "job-search/<item>"` (or `"job-search"`) in its meta.json; a calendar entry with the same `project`.
- **Not here:** your CV and study → `career`; hiring people for you → `hr`.
- **A new item** (the person's «добавить», e.g. a new network): one entry in `items.json` — `slug`, `title` and `line` in en and ru. No build: the Mini App shows it within 30 s.
