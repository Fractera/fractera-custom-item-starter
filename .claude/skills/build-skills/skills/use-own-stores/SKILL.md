---
name: use-own-stores
description: >
  Builder skill. What this element's own key opens in the node's stores — its own database file, its own files (public or private),
  its own vector collections and graph spaces, its own space of the deep memory — and what it never sees. Load it before writing code
  that keeps tables, files, vectors or graph facts; whenever the person asks where this element's data lives, who can see it, or
  whether another element can read it; and before you say anything about your stores. The thing you cannot guess: the key is not
  DATA_SECRET any more — the installer writes ELEMENT_KEY, the helpers send it, and every store answers with this element's space only.
---

# Your own stores

**Process: build** — code that keeps data is built here; what lies in the stores is data, and the person sees it in your pages.

Node step 654 (the owner of the node, 2026-11-05: «объектное хранилище должно быть обновлено не только для использования глубинной
памятью но и для использования просто внутри элемента»): each store of the node keeps every element apart by its own key, in both node
types.

## The key

- `ELEMENT_KEY` (`<element id>.<mac>`) is written to `.env.local` by the node installer; the stores check it themselves, header
  `X-Element-Key`. You never make it, print it or put it into git.
- The helpers already send it — use them, never a key by hand: `lib/fractera/data-service.ts` (`dataFetch`, `dataJson`,
  `storeHeaders()`), `lib/db/index.ts` / `remote-client.ts` (tables), `lib/fractera/vectors.ts`, `lib/fractera/knowledge.ts` (graph),
  `lib/media/by-name.ts` and the routes `app/api/media/*` (files). One resolver: `lib/fractera/store-key.mjs`.
- Without `ELEMENT_KEY` (a laptop with an environment downloaded before 654, an element born from an older template) the helpers fall back
  to `DATA_SECRET` / `DATA_API_KEY`, which open the whole node — never build on that.

## What it opens

| Store | Yours | Never yours |
|---|---|---|
| data (`REMOTE_DATA_URL`, `/db/*`) | your own database file `data/elements/<id>.db`; your tables, any SQL inside it | the node's database and every neighbour's; `ATTACH`, `VACUUM INTO`, `load_extension` are refused |
| storage (`/media/*`) | your files (an upload is yours, public unless `visibility=private`) and the node's public ones (seeds, CONFIG images) | a neighbour's files; a private file through a public route — it leaves only on `?private=1` |
| vectors (`/vectors/*`) | your collections by your own names (`faq` is yours, not the node's `faq`); a search with no collection reads only yours | another element's records, the node's collections |
| graph (`GRAPH_URL`, `/api/graph-*`) | your spaces: `el-<id>` with no `space`, `el-<id>.<name>` with one; a ready graph in, your keywords out | the shared graph, the memory's spaces, a neighbour's spaces |
| deep memory (`/v1/*`) | your own space — your key is your `from` | another element's space (`from` naming it → 403) |

The node's main agent and the core hold the node's key and see everything, each finding named by its element — say so to your person
when they ask who can see their data.

## Your passport says it too

`npm run passport -- me` — the first command of every wake — reads your links from `OWN-SERVICE-PROPS/A2A-CARD.json` (`consumes`): the
template's link to the data element names `X-Element-Key (ELEMENT_KEY)` and your own tables, files and vectors. When your code starts to
use another store directly — the graph (`lib/fractera/knowledge.ts`) or the deep memory — add its id to `calls` in
`OWN-SERVICE-PROPS/OWN-SERVICE-PROPS.json` and one `consumes` entry with its doors, its base (`GRAPH_URL`, …) and the key `X-Element-Key
(ELEMENT_KEY)`; then `npm run describe:publish` tells the core. A link your passport does not name is a link nobody else knows of.

## Before you speak about it

`npm run stores` — one line per store: whose space the key opens (`element <id>`) and how much of yours lies there. `npm run stores --
--probe` writes a marker into each store, reads it back and removes it (the graph keeps its marker: an entity cannot be deleted yet).
Never answer «where is my data» from memory.

## What it does not do

- Data your element wrote under the node's names before 654 stays the node's: the architect moves tables into your database with
  `POST /db/claim`; vectors and graph facts you store again by your own paths.
- The stores keep the doors apart, not the disk: all elements run as one user of the computer; your agent is held off a neighbour's
  folder by the node's boundary hook, not by the operating system.
