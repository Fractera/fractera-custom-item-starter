# Car and transport (Авто и транспорт) — `projects/car`

Service, costs and everything about your car.

- **Put here:** work of this direction — `service` (Service, repairs and mileage), `insurance` (Insurance, taxes and fines), `fuel` (Fuel and washing), `parts` (Tuning and parts). A page of the site or of «Администрирование» joins it with `"project": "car/<item>"` (or `"car"`) in its meta.json; a calendar entry with the same `project`.
- **Not here:** trips and routes → `travel`; insurance of other property → `business/assets`.
- **A new item** (the person's «добавить», e.g. a new network): one entry in `items.json` — `slug`, `title` and `line` in en and ru. No build: the Mini App shows it within 30 s.
