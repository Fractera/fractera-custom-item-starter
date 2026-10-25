---
name: product-quiz
description: >
  Builder skill. The product quiz of this element: what the product is, in product words, before code — `development-docs/product/`.
  Load it when the person wants a new product («I want to make…», «let's plan it»); when a task comes from the core's quiz page
  («Product quiz, item S-03 …», «Product quiz: let's continue…», «…start deep planning…»); when the person asks for something that
  adds or changes what the product does («and also I need…»: a new role, a new kind of thing, a new money flow, an outside
  service); after the node (i2i) and the network (f2f) found nothing ready for a new capability; and when a larger building step closes. Not for page texts, design, a bug inside a confirmed scenario, a clear request whose input and output are named (it is built the short way), or a worker job. The
  thing you cannot guess: only the person confirms an item, in words — you never mark one confirmed yourself, and changing a
  confirmed item turns it back into a draft.
model: opus
effort: max
---

<!-- PROOF · NOT PROVEN yet: written 2026-10-19 (node step 536-4); no live run by an element agent — the person starts it from the quiz page -->

# product-quiz

> A hint, not a law: if you know a better way for the case in front of you, do it your way and say so. The freedom is in HOW you
> plan; whether a wish goes through the quiz before code is not optional.

**Process: build** — the quiz lives in git (`development-docs/product/`): a change is a commit, with the three confirming lines of
`.claude/modes/build.md` («Confirm the request first»).

The owner of the node, 2026-10-18: «я считаю что проект должен быть описан на продуктовом языке» (the project must be described in
product language) and «по мере того как пользователь говорит: – а ещё мне нужно … это должно вызывать процедуру … чтобы понять какие
существуют зависимости и на что повлияет это новая Fitch» (every «and also I need…» must show the dependencies and what the new
feature affects).

## 1. What the quiz is

Two kinds of file, both JSON, so the core's page and `npm run check:product` read them the same way:

- `quiz.json` — `vision` {text, status}, `actors` [{id `A-NN`, name, text}], `modules` (the order of the module files),
  `openQuestions` [{id `Q-NN`, text, about: item ids}], `notNow` [{id `N-NN`, text}], `stages` [{`n` 0, 1, 2… in order, `name`,
  `works` (what works on its own after this stage), `items` (the items it serves), `ready` (an observable sign that it is done),
  `status`, `confirmed`, `done` {date, said} — the person's words that the stage works, node step 590-4}], `decisions` [{date, said
  (the person's words verbatim, in «…»), gist (English)}]. Older quizzes have
  `slices` [{id `L-NN`, name, items}] — they are read as stages. A product like an existing one also has `references` — the
  similar products, their areas, the scenarios they show and what cannot be seen from outside; its form and rules are in the skill
  `product-clone`.
- `modules/<slug>.json` — {slug, title, text, items}. An item: `id` (`S-NN` scenario · `R-NN` rule · `E-NN` entity), `kind`,
  `title`, `text`, `actor` (scenarios), `acceptance` (an observable fact: «the list narrows when a word is typed»), `dependsOn`
  (item ids), `status` (`draft` · `confirmed`), `confirmed` {date, said} when confirmed, `builtBefore` only for work done before
  the quiz existed.

Rules of the form:

- **Product words, not code words.** «The visitor sees the driver on the map», not «a websocket writes to `trips`». Pages, tables
  and doors belong in the step plans that serve the item, never in the quiz.
- **One language — the element's default** (`npm run passport -- me` → `languages.default`). The owner, 2026-10-18: «only default lang». No
  translations in the quiz; the person's own words stay verbatim in `said`.
- **The words are polished in the texts pass** (owner of the node, 2026-10-25: «Полировка в проходе текстов (Рекомендую)»): the
  interview drafts items here in plain product words, without `humanizer` (it lives only in the texts pass, node step 590-5); before
  the person confirms a batch of drafts, they are polished there — write `current-step.md`, then `npm run pass -- texts "polish the
  quiz drafts S-NN…"` (`.claude/modes/build-texts.md`). No fact, number or promise appears while polishing.
- **Numbers are forever.** A removed item leaves its number unused; a new item takes the next free one of its kind.
- **The quiz keeps no list of steps.** Steps name the items they serve in one line `Serves: S-03, R-02` (skill
  `use-development-docs`); the core draws the dots from those lines.
- **No personal data** — names, phones, addresses of real people never go into the quiz: it is in git.

**Where, and how without reading code.** The quiz lives in `development-docs/product/` (listed in `development-docs/README.md`, so
the guard of the development documents allows it). This section is the whole format: never open a guard (`scripts/check-*.mjs`),
a script, the code or another skill to learn it — `npm run check:product` names what is wrong in its own words. A new quiz starts
as `quiz.json`; module files come with the first scenarios:

```json
{ "vision": { "text": "…", "status": "draft" }, "actors": [], "modules": [], "openQuestions": [], "notNow": [], "stages": [], "decisions": [] }
```

✗ 2026-10-20 (node step 548-14): the first session of a new element took 11 model requests and 850 thousand tokens — it read its
code, the media doors, the A2A card and two guards to learn where the quiz goes, before it asked the person anything.

<!-- RULE: our-architecture -->
🔒 Our architecture, never theirs — non-cancellable (owner of the node, 2026-10-23:
«категорически запрещено в процессе проектирования переносить не оптимизированную механику в наш проект … элементы интерфейса и бизнес логики мы пере используем а техническую архитектуру сохраняем собственную»).
From a product studied by reverse engineering, screenshots or knowledge we take its interface
elements and its business logic — never its technical architecture. Pages stay static and readable without JavaScript, with the least
load on the server and the database; an endless feed becomes pages with server search. Whatever the studied product does without
search optimization, without static pages or with heavy load, we solve our own native way. Everything a study holds about a studied
product — REA's records in `study/`, screenshots, notes — describes another product: a source to learn from, never our own code, pages, routes or data.

## 2. When to load it, and when not

| Situation | What you do |
|---|---|
| a new element or product, «I want to make…» | deep planning (§3) |
| «and also I need…» that adds or changes what the product does: a new role, a new kind of thing, a new money flow, an outside service | impact analysis (§4), then the quiz edit, then the step plan |
| a task from the core's quiz page | §5 |
| a building step closes | §6 |
| page copy, design, a bug inside a confirmed scenario, a reminder or another job | do not load it |

The test is one question: **does it change what the product does for someone?** No → it is an ordinary step without the quiz.

## 3. Deep planning — the interview

1. **The strongest model and the deepest thinking.** The build session runs on the strongest model of the subscription (node step
   570) and this skill asks for maximum effort in its header (owner of the node, 2026-10-22: the quiz and the reverse engineering are
   the hardest steps). Never ask the person to switch the model.
2. **Read the node first:** `npm run node -- elements` — every element of the node: address, native or custom, on or off and why,
   its role, what it does. Plan nothing a neighbour already does: name it and plan the link to it (i2i) instead. A turned-off element
   is still the node's capability (the node turns it on for a task).
3. **Like a finished product?** When the person names one («like Product Hunt») or the vision plainly matches one, load the skill
   `product-clone` first: it checks each site's rules — a site that forbids automated study is never analysed (a series of
   screenshots from the person instead, or similar sites whose rules allow it) — and keeps the references. For an allowed site, offer
   a study in one question with its price: «I can study <product> in a study session of my own: REA and the node's study browser hold
   about 1 GB of memory while it runs, and the session spends your subscription. Shall I?» On «yes»: write `current-step.md`, then
   `npm run pass -- study "Study <a URL, or package@version> for my product quiz: <what to learn>"`. Back in the quiz, build the
   actors, scenarios, entities and rules from the study's folder `study/<date>-<site>/` — its notes first, then REA's records through
   REA's own views (`npm run rea -- inspect-analysis-view …`: a summary, a page, one item), never a large file opened whole. It tells
   how that product works; copy none of its content (node step 538). A package or an SDK is studied the same way. **Everything a study
   brings is another product's**: a source to learn from, never this element's code, pages, routes or data, and never an item of the
   quiz until the person wants it.
4. **One question at a time.** Never a list of twenty. Lead with your own assumption from the request and the passport
   (`npm run passport -- me`) — never from the code — and ask the person to confirm or correct it: «Here is what I assume: …
   Right?» A question you cannot derive is asked plainly.
5. **Choices as numbered text** («1 — …, 2 — …, 3 — your own»): the Telegram plugin drops buttons, and text arrives everywhere.
6. **Order:** the vision (who, what pain, what counts as success) → the actors → the scenarios → the rules they need → the open
   questions → the stages.
7. **Stages 0 … N, each working on its own — planned on two levels** (owner of the node, 2026-10-22 and 2026-10-23: «планирование
   каждого следующего этапа на предварительном уровне в общих характеристиках может быть создано сразу же … Но при этом детальное
   проектирование каждого этапа запускается только после завершения предыдущего этапа»). **First level, at once** — right after the
   study or the interview, every stage as a draft (`name`, `works`, `ready`, `items`), five to eight of them, confirmed one at a time.
   The order to propose, then fit to the product: **0** — static pages filled with primary data loaded from JSON (for example the pages
   of a catalogue): enough for search engines to know the project exists; **1** — sign-in and a protected route: the node already has
   sign-in and the database (its elements auth and data), so this stage connects them and never builds them; **2** — a small interface
   in which the person changes what the home page shows; then one capability per stage (a form to submit, payments…), each working by
   itself even when the main goal is not reached yet. Where the primary data comes from is a question to the person: their own data,
   an open dataset, an API they may use — never another site's texts, images or data (node step 538). **Second level, one stage at a
   time** — only the current stage (the lowest `n` without `done`) is planned in detail: its steps, each one business feature of this
   stage with the lines `Stage: N` and `Serves: …` (skill `use-development-docs`). `npm run check:product` refuses a step planned for a
   later stage.
8. **Write as you go,** each item as a `draft`; show the person what you wrote, item by item, with its number.
9. **The first session of a new element** (a task from the core's main agent in your intake): there is no quiz yet. Put the
   task's words into your plan (`current-step.md`) as the vision draft, ask the first question — the vision: who it is for, what
   pain, what counts as success — and stop: report done. The quiz files are written with the first answer.

## 4. «And also I need…» — impact before code

Answer with this form first, in the person's language, before any plan:

```
Request: «…» (verbatim)
Where it goes: a new S-14 «…» / changes S-03
Depends on: S-01 (sign-in), R-05 (price)
Touches what is built: S-03 is built (step 12, commit a1b2c3) — the order screen changes
Conflict: R-07 «…» (quoted) — your decision is needed
New questions: 1) … 2) …
Quiz edit: add S-14, change R-05
```

- A conflict with a confirmed item is quoted verbatim and decided by the person; never work around it silently.
- A request that fits no item is a fork, not a refusal: offer to add it as a new item, or to do it as it stands and record that it
  serves no item (`Serves: none`).
- Only after the person's «yes» to the edit: change the quiz, run `npm run check:product`, commit; then plan the step, whose
  `Serves:` line names the items.

## 5. A task from the core's quiz page

The page puts a ready line into the terminal: «Product quiz, item S-03 «…»» (or the vision, an open question, «let's continue…»,
«…start deep planning…») and the person's words under it.

- **An item:** restate in one sentence what you think they mean, ask one clarifying question, then the §4 form; edit only after
  «yes».
- **An open question:** take their answer, show which items it changes, edit after «yes», and remove the question.
- **«Continue»:** show the open questions first, one at a time.
- **«Start deep planning»:** §3.

## 6. Confirming, and closing a step

- **Only the person confirms**, in words. Record it: `status: "confirmed"`, `confirmed: { date, said }` with their words verbatim.
  «Yes, all of them» confirms the items you listed in that message, no others.
- **Editing a confirmed item turns it back into a `draft`** — green must mean «they approved this text», not «they approved
  something that used to be here».
- **Closing a step** that served items: ask not «does it work» but «what promised in S-NN is now true», name the item and quote its
  acceptance; the summary in `steps-done/` keeps its `Serves:` line.
- **A stage is done** when its `ready` sign is true on the person's screen and every scenario it serves is done — proved by listing
  them, never by «broadly ready». Only the person confirms a stage, in words, like an item: record `done: { date, said }` with their
  words verbatim.
- **Then back to the quiz before any new step** (owner of the node, 2026-10-23: «вновь вернуться в продуктовый Quiz для того чтобы
  продолжить с планированием следующего глобального этапа»): what the finished stage taught may change the next one — show its draft
  again, take the person's corrections, confirm it, and only then plan its steps. The core's quiz page shows which stage is current
  and the steps of each stage.

## 7. Offering deep planning

When the person asks for something large without a quiz, say once what it will touch and offer fifteen minutes of planning: «Without
a plan this will need rebuilding later; shall we describe it first?» Do not repeat the offer in the same session.

## 7a. Obligations — the quiz and REA's ledger side by side (node step 594)

The owner of the node, 2026-10-25: «Оставить пункты квиза» — the quiz keeps its items and scenarios; REA's ledger of obligations stands
beside them as the check (about it: «here is super important part»). One knowledge in two halves, so `npm run check:product` reconciles
them wherever the study is on the machine.

- **An obligation is one behaviour our product must show**, written in REA's own shape (`reverse-engineer-anything`, its references)
  into `study/<folder>/obligations.json` when the person has decided to take a scenario of the references: `obligation_id` (stable,
  English, `area.behaviour`), `obligation_version` (raise it when the requirement changes), `title`, `application_layer` (`application`
  for what a person sees), `required_case_kinds` (`positive`, and `negative` · `malformed` · `cancellation` · `teardown` where the person
  can meet them — wrong input, an empty list, a refused payment), `required_original_authority` (`runtime` for what the study saw in a
  browser), `required_fixture_authority` and `required_verifier_authority` (`renderer` for our own pages), `disposition`, and
  `review_evidence_ids` — the records of the study's `bundle.json` it rests on. Then `npm run ledger -- <folder>`.
- **Behaviour, never mechanics.** The test: would it stay true if the original's authors rewrote it in another language and framework?
  No — `disposition: "out-of-scope"` (REA: «records the disposition but does not silently count it as verified»).
- **The scenario names its obligations** — `"obligations": ["…"]` on the scenario of the references (`O-NN`). A required obligation
  no scenario names, or a scenario naming an obligation no ledger has, is a red line.
- **A stage is done when its obligations are verified and the person says it works.** The ledger closes an obligation only with our
  implementation bound to it and a proof as strong as the observation of the original. **Today a web element's obligation stays open**
  (node step 594-5): REA reads a proof record and makes none («this operation label does not expose a proof executor»), and we never
  forge REA's records. So when the person says the stage works, show each open obligation by its title, and only on their «yes» write
  them into `done.openObligations` beside their words — the ledger stays honest, the stage closes. **Another
  platform** (an iOS app rebuilt as a web element, a desktop tool rebuilt as a door): REA's levels of proof cannot compare — the stage
  says `"nature": "different"`, the person's words close it, and the open obligations stay a known limit, named to the person.
- **The machine is too small for the product** (heavy video work on a graphics card, professional tools, machine control) and the task is
  critical to the person's business: name what it needs and offer a consultation on moving to a stronger rented computer with Fractera
  installed there — never «we cannot» (owner of the node, 2026-10-25).

## 8. Before you commit a quiz change

`npm run check:product` — unique numbers, dependencies that exist and do not run in a circle, confirmed items with a date and words,
`Serves:` lines of the steps that point at real items. It is not part of `prebuild`: a broken quiz must not stop the site from being
deployed. A red line is fixed before the commit.

## Do not

- Mark an item confirmed yourself, or treat silence as a «yes».
- Add behaviour of the system nobody asked for (timers, polling, automatic links between elements) because the quiz «implies» it —
  ask first, in the words of what the person will see.
- Copy the list of steps into the quiz, translate the quiz, or put people's personal data in it.
- Plan steps ahead: the quiz holds every stage (what works, by which sign); only the current stage gets its steps, and the next one
  is planned in detail after the person says the current one works.
