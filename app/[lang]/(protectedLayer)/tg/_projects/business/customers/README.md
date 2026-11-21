# Customers (Покупатели) — `projects/customers`

Who buys from you and how to keep each of them.

- **Put here:** work of this direction — `new` (New), `regular` (Regular), `fading` (Fading), `vip` (VIP and ambassadors), `feedback` (Reviews and feedback). A page of the site or of «Администрирование» joins it with `"project": "customers/<item>"` (or `"customers"`) in its meta.json; a calendar entry with the same `project`.
- **Not here:** leads not yet paying → `sales`; mailings to them → `mailings`; your own contacts and partners → `community`.
- **A new item** (the person's «добавить», e.g. a new network): one entry in `items.json` — `slug`, `title` and `line` in en and ru. No build: the Mini App shows it within 30 s.
