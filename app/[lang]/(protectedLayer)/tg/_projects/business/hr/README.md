# Staff and HR (Персонал и HR) — `projects/hr`

Staff, schedules, pay and growth of people.

- **Put here:** work of this direction — `structure` (Team structure and staffing), `onboarding` (Onboarding and a knowledge base), `pay` (Pay, bonuses and KPI), `shifts` (Shifts, holidays and sick leave), `growth` (Reviews, training and motivation), `vacancies` (Talent pool and vacancies). A page of the site or of «Администрирование» joins it with `"project": "hr/<item>"` (or `"hr"`) in its meta.json; a calendar entry with the same `project`.
- **Not here:** freelancers and partners → `team`; AI workers → `digital-staff`; job offers you seek yourself → `job-search`.
- **A new item** (the person's «добавить», e.g. a new network): one entry in `items.json` — `slug`, `title` and `line` in en and ru. No build: the Mini App shows it within 30 s.
