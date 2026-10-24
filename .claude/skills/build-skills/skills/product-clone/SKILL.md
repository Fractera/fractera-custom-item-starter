---
name: product-clone
description: >
  Builder skill. The person wants a product like an existing one — «like Product Hunt», «a clone of X», «make it work as X does».
  Load it before the product quiz plans such a product. You check each site's rules first, then learn how the product works
  from what is allowed, map its areas and scenarios, and plan stages 0…N of the person's own product with its coverage and parity.
  The thing you cannot guess: a site whose robots.txt or terms forbid automated study is never analysed — the person gives a series
  of screenshots instead, or names similar sites whose rules allow it; and only functions are taken, never code, texts, images,
  design, data or names.
---

<!-- PROOF · NOT PROVEN yet: written 2026-10-22 (node step 556-3); the first live run is step 556-5 -->

# product-clone

> A hint, not a law: if you know a better way for the case in front of you, do it your way and say so. Two things are not
> optional: the site's rules are checked before any automated study, and nothing but functions crosses over.

**Process: build** — what you learn goes into the product quiz (`development-docs/product/`, in git): a change is a commit, with the
three confirming lines of `.claude/modes/build.md`.

The owner of the node, 2026-10-22: «если человеку нужно создать клон какого-то запрещенного сайта то ты говоришь ему о том что он
должен предоставить серии скриншотов последовательно … можешь попросить пользователя предоставить копии сайтов которые выполняют те же
самые задачи» — a site that forbids it: a series of screenshots, one after another; or ask for similar sites that do the same job.

This skill feeds `product-quiz`: it adds the block `references` and the scenarios they show; the quiz keeps its own rules (one
question at a time, numbered text choices, only the person confirms, the element's default language, `humanizer` for every text).

## 1. Inputs — ask before anything else

One question at a time, leading with your own assumption: which product («Product Hunt»), its address; who the person's product is
for and what counts as success; which roles matter (a maker, a visitor, a moderator…); languages and region; money, if any. A
product like X is never called X: ask for the person's own name.

## 2. The rules of each site — before any automated study

For every site: `npm run site-rules -- <its address>` (the core reads robots.txt and finds the link to the terms). Then read the terms
it links and look for a ban on scraping, crawling, automated access, copying the content or reverse engineering.

| What you found | What you do |
|---|---|
| `DISALLOWED` or `UNKNOWN`, or the terms ban it | scenario 1 — screenshots (§3); offer scenario 2 at once |
| `ALLOWED` and the terms do not ban it | scenario 2 — the node may analyse it (§4) |
| no terms found | ask the person to read them and tell you; until then — scenario 1 |
| internal pages are needed and the terms allow automating an account | scenario 3 — a test account the person confirms (§4a) |
| a package or an open-source project | its license instead of robots.txt |

Write each site into `references.products` with its `rules` (`allowed` · `forbidden` · `unknown`) at once. Never sign in anywhere, never
pass a captcha or a paywall — not for this skill, not for the person's sake.

## 3. Scenario 1 — a series of screenshots from the person

Tell the person in two lines why the site cannot be studied automatically (the rule or the clause), then ask for a series:

- **taken by hand**, as an ordinary user — never a program that scrolls and saves pages;
- **one scenario after another**, in the order a user goes through it: one or two screens per step («the list of the day → a product
  page → the vote → the comment»), not the whole site;
- **their own screens are fine** — the form to submit a product, their notifications: the person signs in, you never do;
- **where:** a folder `screenshots/<site>/` in this element's data (`SERVICE_DATA_DIR`, outside git), or pasted into this terminal.

Read them in portions — one scenario at a time — and write words into the quiz right away, so the images do not pile up in the
conversation: one 1920×1080 screenshot costs about 2,700 tokens on Opus 5.5 (Anthropic, «Vision»). People on the screenshots (names,
avatars, comments) never go into the quiz. When the person has confirmed the items, delete the folder and say so.

## 4. Scenario 2 — similar sites whose rules allow it

Ask the person for three to five sites or open projects that do the same job (small, experimental, open-source). Check §2 for each.
For every allowed one: `npm run ask-core -- "Reverse engineer <address> for my product quiz: <what to learn — the scenarios, the
entities, the rules>"`, one at a time — the next only after the report of the previous one (`npm run reverse -- get <task>`). The
node checks the rules again before it turns its analysis element on. The copy opens with its origin mark (`external-study`); a question
the report leaves open goes to the node's graph first (`npm run graph -- query …`, skill `product-quiz` §3) — another study costs far
more than one query.

- A file a site publishes for agents (`openapi.json`, `llms.txt`, `/.well-known/agents.json`) is a map of its entities and flows: read
  it, never use its API to sign up or post.
- An open-source project: read its license; still take only functions.
- Terms that ban extracting a site's data, though not looking at it: scenario 1 for that site.

## 4a. Scenario 3 — internal pages, in a test account the person confirms

What is behind the sign-in (a dashboard, the submit flow, settings) the node's agent studies itself — the owner of the node,
2026-10-22: «в отличие от пользователя он может хотя бы примерно знать как работает продукт … на какие кнопки надо нажать», in an
account that «не должен быть реальным пользователем … не страшно потерять это пользователь должен подтвердить лично».

- Only on a site whose rules allow it (§2) and whose terms do not forbid automating an account, several accounts or bots.
- Ask the person to create a test account there: not their main one and not someone else's, with no personal or payment data, one
  they are not afraid to lose. Then the core's main agent opens the login window on the node's computer (`npm run ask-core -- "Open
  the login window for the test account of <site>"`): the person ticks three statements, types the site name and signs in himself.
  You never ask for a password and never create an account.
- Then ask for the analysis of the internal pages (`ask-core`), naming the areas you need. The node's analysis chooses for each area:
  a walk of its own (reads only — a guard blocks every action), a walk the person drives while it records, or screenshots — and
  returns a map of screens and transitions with the points of no return (what happens after «send» or «pay» is seen only when the
  person does it himself, in his test account).
- In `references.products` the site gets `"account": { "kind": "test", "consentAt": "<the date from npm run ask-core / the node>" }`.

## 5. The map — what the references show

Into `quiz.json` → `references`:

```json
{
  "products": [
    { "id": "REF-1", "name": "…", "url": "https://…", "rules": "allowed", "source": "analysis", "report": "<task id>",
      "account": { "kind": "test", "consentAt": "<date>" } },
    { "id": "REF-2", "name": "…", "url": "https://…", "rules": "forbidden", "source": "screenshots" }
  ],
  "areas": [{ "id": "AR-01", "name": "Daily list" }],
  "scenarios": [{ "id": "O-01", "area": "AR-01", "name": "See the launches of the day", "seenIn": ["REF-1", "REF-2"], "stage": 0 }],
  "unknowns": [{ "id": "U-01", "text": "How the daily order is computed", "question": "Q-04" }]
}
```

`source`: `analysis` (a report of the node) · `screenshots` · `knowledge` (what you know of a famous product) · `owner` (the person
told you). Each scenario of the references names where it was seen; one seen in three of five references is almost surely needed.
What cannot be seen from outside — the order of a list, protection from fake votes, moderation — is never guessed: an `unknowns` entry
that becomes an open question (`Q-NN`) or the person's decision.

The product's own items — `S-NN` scenarios, `R-NN` rules, `E-NN` entities in `modules/` — are written in product words as
`product-quiz` says; a scenario of a reference becomes an item only when the person wants it.

## 6. Stages 0…N — five to eight

Stage 0 — static pages with the person's own primary data from JSON (enough for search engines to know the project); stage 1 —
sign-in; each next stage adds one capability and works on its own. Every scenario of the references goes to a stage (`stage`) or to
«not now» (`notNow`, an `N-NN` of the quiz). Confirm the stages one at a time, like items.

## 7. Metrics — when the quiz is done

`npm run check:product` prints them after its OK line: the references by source · the areas covered · the parity (scenarios with a
stage / all, «not now» apart) · how many each stage brings. Done when every area is covered, every scenario has a stage or «not now»,
no unknown is left without a question or a decision, and the person confirmed the stages. After a stage is built, its cost —
`npm run qa:agent` in the core — goes into the step's summary.

## 8. The line you do not cross (node step 538)

Only functions cross over: never their code, texts, images, design, data, names or logos. The look comes from the node's design
skills (`custom-design`), the texts are written anew (`humanizer`), the data is the person's own. No mass runs on small sites: a
few representative pages each, one analysis at a time.

## Do not

- Ask the node to analyse a site before §2, or a site whose rules forbid it.
- Store screenshots in git, or carry a person's name or face from them into the quiz.
- Plan a stage nobody can see working on its own, or guess what the original computes behind the screen.
