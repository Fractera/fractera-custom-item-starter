# Product and services (Продукт и услуги) — `projects/product`

What you sell, what it costs and where it grows.

- **Put here:** work of this direction — `value` (Description and value), `pricing` (Plans and prices), `roadmap` (Roadmap), `cases` (Cases and reviews). A page of the site or of «Администрирование» joins it with `"project": "product/<item>"` (or `"product"`) in its meta.json; a calendar entry with the same `project`.
- **Not here:** prices of subscriptions you sell → `subscriptions`; the client's way to payment → `sales`; a service you perform by hand → `my-services`.
- **A new item** (the person's «добавить», e.g. a new network): one entry in `items.json` — `slug`, `title` and `line` in en and ru. No build: the Mini App shows it within 30 s.
