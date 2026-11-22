---
name: before-a-build
description: >
  Builder skill. Weigh a rebuild or a deploy of this element before it starts: which cases the change touches and how each is
  proven, what else in your plan should ride in the same build, and whether to build now, later, or ask your person first. Load it
  before every `npm run build`, rebuild, Preview or deploy of a step, and when your person says «ты опять побежал вперёд»,
  «ты не протестировал», «сколько можно пересобирать».
---

# before-a-build

**Process: build** — this skill changes the element as a thing: code, commit, rebuild; confirm with the three lines of `.claude/modes/build.md` («Confirm the request first»).

The owner of the node, 2026-11-22: «для пользователя критически важно решить задачу с минимальным расходом токенов и времени … перед
запуском сборки обязательно нужно проанализировать а при необходимости и провести дополнительную консультацию с администратором или
архитектором: важно понять будет ли оптимально сборку провести прямо сейчас или выгоднее её отложить чтобы добавить к задаче несколько
дополнительных под шагов или Тестов». Paid for in the core: six server updates in one day, each «fixed» on one computer and broken on the
server.

A build is never a proof, and it is the most expensive moment of a step: your person waits, a deploy changes what visitors see. So the
thinking happens before it.

## 1. The case matrix — which cells your change touches

Put it into the step's plan (`development-docs/current-step.md`) before the build; every touched cell gets a proof, an untouched one a
word why.

- **Plane:** this computer (the owner at the machine passes what a server refuses) · a dedicated server (nginx in front; a custom
  element runs there as its own Linux user and reaches the core only on loopback with its own key — a POST over a redirect loses its
  body).
- **Your address:** as born (`<id>.<zone>`) · renamed (`<name>.<zone>` — every saved link, the sign-in return address and the menu must
  follow) · your own domain (another site: sign-in through the centre, its own certificate and cookies).
- **Caller:** a visitor's browser · your admin in your panel · a neighbour's keyed call · the internet.

## 2. Prove before the build what can be proven before it

Tests with a negative control for each touched cell (skill `use-tests-before-dev-finish`); what only the live address can show is named
in the plan as «after the deploy», with the exact check.

## 3. Batch — what else rides in this build

The open substeps of your step and the defects found on the way that touch the same files or the same surface go into this build, each
with its own test. Small edits wait for one build at the end of the queue.

## 4. Now, later, or ask

- **Now** — your person waits on a live fix, every touched cell is proven or named, nothing ready waits to ride along.
- **Later** — more substeps or tests are due in the same surface: finish them first, then one build.
- **Ask your person** (the architect, or your administrator) — only when the choice is theirs: the wait costs them, their hands are
  needed, money or a publication rides on it. One message: the cases in words, what is proven, what only the live address shows, and
  your pick with why.

## 5. After the build

The same cells on the live surface (`npm run eyes`, skill `use-eyes`), then one report: each cell with what it showed, what was not
checked and why (skill `deploy-element` for the deploy itself).
