# Assets (Организация активов) — `projects/assets`

What you own: property, shares, brands, digital assets.

- **Put here:** work of this direction — `property` (Property and land), `shares` (Business shares and securities), `ip` (Intellectual property, patents and brands), `equipment` (Equipment and tangible assets), `digital` (Digital assets, domains and accounts), `registry` (Ownership registry, valuation and insurance). A page of the site or of «Администрирование» joins it with `"project": "assets/<item>"` (or `"assets"`) in its meta.json; a calendar entry with the same `project`.
- **Not here:** contracts and licences → `legal`; crypto → `web3`; personal savings → `life/finance`.
- **A new item** (the person's «добавить», e.g. a new network): one entry in `items.json` — `slug`, `title` and `line` in en and ru. No build: the Mini App shows it within 30 s.
