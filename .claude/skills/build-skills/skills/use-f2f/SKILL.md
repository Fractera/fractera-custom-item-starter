---
name: use-f2f
description: Builder skill. f2f — whole elements move between Fractera projects through Lagrix, so a builder takes a ready element instead of building it again; it is installed once and needs no API. Load it when the person wants a ready element from another Fractera project, wants to offer this element to others, asks how an element is exchanged, sold or installed from outside, when nobody in the node covers a new capability (the order «Before you build» in CLAUDE.md), and when the core sends you here before creating a new element.
---

# f2f — whole elements between Fractera projects

**Process: build** — taking or offering an element changes the node: three confirming lines first, the person decides.

A hint, not a law. The meaning of f2f is the owner's (2026-10-11, 2026-10-19).

## What it is

f2f is how Fractera projects exchange whole elements — a site, an app, an agent or a service with its code and design — through
Lagrix. Discovery is the same as for agents; what f2f adds is a technical card: what the element is made of, so another project
can install it — the starter and version it was born from, the framework, the services it needs, its doors, the names (never the
values) of its environment variables, its licence and where its code is (Lagrix document 20). Keys, passwords and personal data
never travel.

## No API

An element arrives once and is installed — there is nothing to call between the projects afterwards, so no API is agreed for
the exchange. Once installed, the newcomer meets its neighbours over i2i (`use-i2i`).

## Where it sits

- The core's menu of this element: «Build» → «f2f: exchange with Fractera» → «Find», «Publish».
- The core's main agent looks here first, before it creates a new element for a need nobody in the node covers.
- Native elements never take part: they are never sold and never exchanged.

## Find — today a simulation

`npm run f2f -- find <plain words of the element you need>` builds the request a node sends to Lagrix (one price $0.01 per result
list, paid by a voucher to the super-node — Lagrix document 17, §17.8; the technical card — document 20) and prints the network's
answer; every search is a line in `SERVICE_DATA_DIR/f2f/searches.jsonl`. The network is not live yet: the answer is simulated and
always empty. Tell your person exactly that — «в сети Lagrix подходящих элементов не найдено (поиск в сети пока имитируется)» —
never pretend an element was found, and go on: the product quiz (`product-quiz`). «Publish» is not built yet.
