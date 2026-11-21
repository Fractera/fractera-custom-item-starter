# My services (Мои услуги) — `projects/my-services`

The services you give people, from the request to the result.

- **Put here:** work of this direction — `formats` (Kinds and formats), `briefs` (Briefs and requests), `stages` (Stages of the work), `booking` (Schedule and booking), `quality` (Quality standards and checklists). A page of the site or of «Администрирование» joins it with `"project": "my-services/<item>"` (or `"my-services"`) in its meta.json; a calendar entry with the same `project`.
- **Not here:** a product you sell as a thing → `product`; bookings of your own life → `life/*`; contractors who help you → `team`.
- **A new item** (the person's «добавить», e.g. a new network): one entry in `items.json` — `slug`, `title` and `line` in en and ru. No build: the Mini App shows it within 30 s.
