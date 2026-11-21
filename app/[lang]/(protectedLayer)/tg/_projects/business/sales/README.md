# Sales (Продажи) — `projects/sales`

The catalog and the client's way from interest to payment.

- **Put here:** work of this direction — `catalog` (Catalog), `funnel` (Funnel and requests). A page of the site or of «Администрирование» joins it with `"project": "sales/<item>"` (or `"sales"`) in its meta.json; a calendar entry with the same `project`.
- **Not here:** what the product is and costs → `product`; people who already bought → `customers`; paid traffic → `marketing`.
- **A new item** (the person's «добавить», e.g. a new network): one entry in `items.json` — `slug`, `title` and `line` in en and ru. No build: the Mini App shows it within 30 s.
