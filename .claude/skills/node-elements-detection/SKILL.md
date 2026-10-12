---
name: node-elements-detection
description: Both natures (every element). Learn the architecture of the node you live in — every other element (the native ones like sign-in, data, project settings, design, the root site, blocks, and the custom ones), what each does, its address and whether it runs — and how to work with them: always through A2A, never by reading their code. Use this at the start of every session after own-service-props-detection, and whenever a task touches something outside this element — users and sign-in, storing data or files, settings, design, or any ability another element might already have — even if the person does not name the other element.
---

<!-- PROOF · PROVEN 2026-10-06: npm run passport -- project run first on wake; no core files · report: development-docs/proofs/2026-10-06-wake-and-a2a-skills.md -->

# The node around me — from my passport

**Process: both** — a task that changes the element is building (code, commit, rebuild, the three confirming lines); a job is working (data only, a short answer). `CLAUDE.md`, «Confirm the request first».

A hint, not a law: models of late 2026 work worse under rigid step-by-step instructions.

## Why ask, and not assume

The node is a living set of elements: one is added, another is renamed or stopped, a custom one is born next week. A list of
neighbours written into your instruction would describe the node on the day it was written. The passport's `project` part is the
node as its core sees it now.

```
npm run passport -- project
```

One line per element: `id · address · native|custom · status — what it does`. Read it whole; never cut it with `head`, and do
not go to the core's files around it. Native elements (auth, data, config, design, root, blocks) belong to the node; custom ones
were born by the person. You do not need a neighbour's port: `npm run a2a` finds its address by itself.

| Field of `project` | What it tells you |
|---|---|
| `domain`, `core` | the node's domain and its core on this machine |
| `elements` | every element: `id`, `name`, `kind` (native / custom), `description`, `url`, `status` |
| `cooperation` | how elements work together — A2A |
| `a2aRegistry` | where to look up who can do a job |

## How you work with another element

Through A2A, always — the skill `a2a-conversation`. The reason is the same reason the elements are separate: each one owns its
code, and that code changes. If you read the data element's files and wrote to its database yourself, the next change on its side
would silently break you, and it would never know you depended on it. Instead:

1. Pick candidates from `elements` (short descriptions), then read a candidate's full passport to decide — the two looks are in `a2a-conversation`.
2. Ask its agent what it already offers. If it fits, use it.
3. If nothing fits, agree on the API you need; the other side builds it, then you use it.
4. Once the cooperation started, record the partner in `calls` (skill `a2a-conversation`).

An element that is in `elements` but not in the registry has no A2A card yet: it cannot be talked to today. Tell the person
instead of going around it.

## When the core does not answer

`project.elements` empty while `project.core` is set usually means the core is restarting — ask again in a minute. Do not conclude
the node is empty.
