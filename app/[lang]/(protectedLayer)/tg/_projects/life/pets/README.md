# Pets (Питомцы) — `projects/pets`

Health, care and shopping for your pets.

- **Put here:** work of this direction — `health` (Health, vaccines and tests), `care` (Food, care and routine), `vets` (Vets and grooming), `training` (Training and shopping). A page of the site or of «Администрирование» joins it with `"project": "pets/<item>"` (or `"pets"`) in its meta.json; a calendar entry with the same `project`.
- **Not here:** family dates → `family`; household shopping → `home`.
- **A new item** (the person's «добавить», e.g. a new network): one entry in `items.json` — `slug`, `title` and `line` in en and ru. No build: the Mini App shows it within 30 s.
