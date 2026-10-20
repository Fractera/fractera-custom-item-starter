---
name: connect-external-service
description: >
  Builder skill. How this Fractera element connects an OUTSIDE PAID SERVICE (a search API, a model provider, a payment, a mail or
  an SMS service — anything with keys and a bill): where its description lives, where the keys go, where the server code and the
  check door live, what the core draws and what the element never draws. Load it whenever a task needs a third-party API or key,
  whenever the person names a service to «connect», «subscribe to» or «pay for», and whenever you touch
  `OWN-SERVICE-PROPS/SUBSCRIPTIONS.json`. The thing you cannot guess: the element draws NO settings screen for the service — it
  describes the service in one file, and the core's «Working process → Process → Subscriptions» tab draws the description, the key fields, the
  «Check» button and the payment history from it; the element's job is the server side only.
  Russian phrasings of the person: «подключи сервис», «API-ключ», «подписка», «оплата сервиса», «баланс», «история платежей».
---

<!-- PROOF · PROVEN 2026-10-12 · report: development-docs/proofs/2026-10-12-six-skills.md (in roman) -->

# connect-external-service

> A hint, not a law. If you know a better way for the case in front of you, do it and say so.

**Process: build** — this skill changes the element as a thing: code, commit, rebuild; confirm with the three lines of `CLAUDE.md` («Confirm the request first»).

Owner, 2026-10-12: «…мы единственное что делаем это создаем навык который обучит агента в случае если он будет использовать какой-то
внешний ресурс в правильное место его разместить и правильным образом с программировать интерфейс и серверный функции».

## Where each part lives

| Part | Place | Rule |
|---|---|---|
| description of the service | `OWN-SERVICE-PROPS/SUBSCRIPTIONS.json` → `services[]` | `id` (kebab, never changes), `name`, `description` (what it does FOR THIS element, one or two sentences), `docs` (the provider's API docs, first source) |
| the keys it needs | same entry → `keys[]` — `{ env, label, secret }` | only the **names** of environment variables (`AI_SEARCH_MACHINE_API_KEY`); values live in the element's `.env.local`, never in a file in git |
| server code | `lib/integrations/<id>/` — `client.ts` (calls the provider), `check.ts` (status, balance, payments) | `import "server-only"`; reads the key from `process.env`; no key → a clear «not connected» result, never a throw on import |
| the check door | `app/api/integrations/<id>/check/route.ts` (a line in `scripts/check-routes.mjs`) — path in `check` of the entry | `GET` → `{ ok, connected, balance?: {amount, currency}, payments: [{date, description, amount, currency, status}] }`; node key only (`X-Settings-Key`), the core calls it, never a visitor |
| the screen | **the core**: «Working process → Process → Subscriptions» opens in the left menu into **one item per service**, each its OWN PAGE `/<lang>/<element>/workflow/process/subscriptions/<id>` (`agi-code/app/[lang]/(architectLayer)/_components/subscriptions-view.client.tsx`) | the element draws no settings page for a service; a new field on the screen = a new field in `SUBSCRIPTIONS.json`, and the core renders it |
| where the service is used | the element's own code calls `lib/integrations/<id>/client.ts` | one place calls the provider; widgets and doors call that place |

## 🔒 One service — one page (owner, 2026-10-12)

«…создал выпадающий список и положил первый … и в навыки указал что нужно создавать отдельные страницы а не валить в одну кучу».
Every service is a separate entry in `services[]` with its own `id`; the core gives it its own menu item and its own page. Never
put two services into one entry, never build one screen that lists every service's keys and payments together — a person
looks at one bill at a time, and a link to one service must open that service.

## Order of work

1. Read the provider's API docs (first source, not a summary) — auth, the endpoint for balance/usage, the price unit.
2. Add the entry to `SUBSCRIPTIONS.json` (`example: false` once real) and the key names to `.env.example` with `# kind: secret`.
3. Write `lib/integrations/<id>/client.ts` and `check.ts`, then the check door, then its line in the route guard.
4. Name the price to the person BEFORE the first paid call — amount per unit, from the provider's pricing page.
5. Prove it: the core tab lists the service; «Check» with no key → «not connected»; with the key → the real balance and payments.

## What is the person's decision, never yours

Buying a subscription, entering a key, spending money, choosing between two providers. You describe and prepare; the person pays.

## Today

`SUBSCRIPTIONS.json` carries one EXAMPLE — «Exa», the AI search engine (`example: true`): the menu shows «Subscriptions → Exa», its page
has the description, the key field `EXA_API_KEY` (does not save) and «Check» shows the example payments. Nothing is called. No `lib/integrations/` and no door exist yet — the first real service builds them.
