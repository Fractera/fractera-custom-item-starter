# Food and recipes (Питание и рецепты) — `projects/food`

Menus, recipes, shopping and diet.

- **Put here:** work of this direction — `menu` (Weekly menu), `recipes` (Recipe book), `shopping` (Shopping list), `nutrition` (Calories and nutrition). A page of the site or of «Администрирование» joins it with `"project": "food/<item>"` (or `"food"`) in its meta.json; a calendar entry with the same `project`.
- **Not here:** health and training → `self`; household goods → `home`.
- **A new item** (the person's «добавить», e.g. a new network): one entry in `items.json` — `slug`, `title` and `line` in en and ru. No build: the Mini App shows it within 30 s.
