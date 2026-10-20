---
name: use-protocols
description: Both natures. The index of Fractera's five protocols (H2A, i2i, a2a, f2f, H2H) — a few lines each and the skill that holds the details. Load it whenever you deal with another element, the core, an agent of another node or a person; whenever someone asks which protocol you use or how you work with auth, data, config, design or a neighbour; whenever a file (voice, photo, video) must travel. Then load the skill of that one protocol.
---

# Protocols — the index

**Process: both** — see the protocol's own skill.

The five protocols are the owner's (2026-10-11, 2026-10-19). Read the line, then load only the skill you need.

| Protocol | What it is | Process | An API | Skill |
|---|---|---|---|---|
| **H2A** | your person and you — Telegram, the core's native chat, your terminal | both | no | `use-h2a` |
| **i2i** | the elements of this node and the core agree an API once, then work without a model | building, then working | yes — its purpose | `use-i2i` |
| **a2a** | work with agents of other nodes through Lagrix, in USDC or free — never development | working | optional | `use-a2a` |
| **f2f** | whole elements move between Fractera projects through Lagrix and are installed once | building | no | `use-f2f` |
| **H2H** | people talk through their agents; the other side's agent checks the request first | working | no | `use-h2h` |

One question tells them apart: **is it my neighbour in this node, or an agent of another node?** A neighbour — i2i. Work for or
from another node — a2a. A whole element moving between projects — f2f.

Two rules hold for all five:
- **Asked how you work with others**, answer from `npm run passport -- me` (`links`), our protocol first, then the technology —
  never from your code.
- **A file travels as a link**, never as the file: save it, pass the link (`use-h2a`, «Media»).

## Before you build a new capability — the order

The owner's (2026-10-19). Each step is cheaper than the next; stop at the first that answers.

1. **Yourself.** `npm run passport -- me` — maybe you already do it.
2. **A neighbour in the node (i2i).** `npm run a2a -- find <English words>` — it reads every element's role and card and prints at most five. A
   neighbour whose role covers it — call its door if it has one (a plain call, no model). No door — wake its agent once to agree
   an API (`use-i2i`): the only reason to wake a neighbour, never for daily work.
3. **A whole element from the network (f2f).** `npm run f2f -- find <plain words>` (`use-f2f`). Today the search is simulated and
   finds nothing — say «в сети Lagrix подходящих элементов не найдено (поиск в сети пока имитируется)».
4. **Build it.** The need is part of your role: a clear request (input and output named) → the short way of `CLAUDE.md`
   (Steps 2a; a door — `add-door`); a new product or «and also I need…» → skill `product-quiz` (the product in product words, then the steps); to copy how
   an existing site works — reverse engineering, under development in the core («Product design → Reverse engineering»): say so
   and use the quiz. Then the step and the build after your person's «yes». The need is another job → do not grow sideways: tell
   your person to ask the core's main agent for a new element (its terminal — `node.mainAgent` of `npm run passport -- me`).
