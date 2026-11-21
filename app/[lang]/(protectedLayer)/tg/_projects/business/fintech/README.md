# Fintech and payments (Финтех и платёжные сервисы) — `projects/fintech`

Accounts, taking payments, transfers and their safety.

- **Put here:** work of this direction — `accounts` (Bank accounts, cards and neobanks), `acquiring` (Payment gateways and acquiring), `transfers` (International transfers and exchange), `billing` (Billing, instalments and recurring payments), `loyalty` (Finance trackers, cashback and loyalty), `kyc` (Account safety, limits and KYC). A page of the site or of «Администрирование» joins it with `"project": "fintech/<item>"` (or `"fintech"`) in its meta.json; a calendar entry with the same `project`.
- **Not here:** the business's income and budget → `economy`; personal payments → `life/finance`; crypto wallets → `web3`.
- **A new item** (the person's «добавить», e.g. a new network): one entry in `items.json` — `slug`, `title` and `line` in en and ru. No build: the Mini App shows it within 30 s.
