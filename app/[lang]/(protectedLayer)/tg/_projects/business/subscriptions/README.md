# Subscriptions (Подписки) — `projects/subscriptions`

The subscriptions you sell to your clients.

- **Put here:** work of this direction — `monthly` (Monthly), `yearly` (Yearly / trial). A page of the site or of «Администрирование» joins it with `"project": "subscriptions/<item>"` (or `"subscriptions"`) in its meta.json; a calendar entry with the same `project`.
- **Not here:** subscriptions you PAY for (services, software) → `tools`; one-off prices → `product`.
- **A new item** (the person's «добавить», e.g. a new network): one entry in `items.json` — `slug`, `title` and `line` in en and ru. No build: the Mini App shows it within 30 s.
