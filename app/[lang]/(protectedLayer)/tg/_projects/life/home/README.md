# Home and smart home (Дом и умный дом) — `projects/home`

Your home, its devices, repairs and daily life.

- **Put here:** work of this direction — `scenarios` (Automation scenarios), `devices` (Devices and sensors), `renovation` (Renovation and interior), `upkeep` (Upkeep), `shopping` (Home shopping). A page of the site or of «Администрирование» joins it with `"project": "home/<item>"` (or `"home"`) in its meta.json; a calendar entry with the same `project`.
- **Not here:** property as an asset → `business/assets`; groceries and recipes → `food`.
- **A new item** (the person's «добавить», e.g. a new network): one entry in `items.json` — `slug`, `title` and `line` in en and ru. No build: the Mini App shows it within 30 s.
