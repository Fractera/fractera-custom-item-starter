# fractera-custom-item-starter

The reference starter template of a Fractera custom element (WEB4 ITEM). The node's button «Create WEB4 ITEM» births every new
custom element from it by a pinned tag. Native elements — the root ones of every node — have their own template, `fractera-native-item-starter`. This one is a mirror of the
standard custom element without anyone's data: the home page shows
one line, «Reference starter template», and the yellow starter sign says what to do next.

An element is a **replaceable element**, like the node's auth and data elements: its own repository, its own port, a pinned tag
in the node's `WEB4-ITEMS-REGISTRY/web4-items.json`.

## In the Fractera project

Every new custom element of a node is born from this repository. The core reads its address and tag from
`WEB4-ITEMS-REGISTRY/item-template.json`, copies the tagged tree into a new folder and gives it its own history. An element that is
already born keeps its copy: a newer template version changes only elements born after the core points to it.

You can change the template in your own fork. To make your node use it, set `repo` and `version` in `item-template.json` of your core
to your fork and its tag. An element born from this template starts with this README; its owner rewrites it to describe the element.

## Your stores (node step 654-6)

The node installer writes this element's own key `ELEMENT_KEY` into `.env.local`; the template's helpers send it (header
`X-Element-Key`, one resolver — `lib/fractera/store-key.mjs`), and every store of the node answers with this element's space only:
its own database file (data), its own files and the node's public ones (storage; a private file never leaves through a page), its own
vector collections by its own names (vectors), its own graph spaces `el-<id>` and `el-<id>.<name>` (graph, `GRAPH_URL`), its own space
of the deep memory. A neighbour's data is never reached; the node's main agent sees everything. A custom element no longer receives the
node's data key `DATA_SECRET`. `npm run stores` names what the key opens in each store and how much of its own lies there (`--probe`
writes a marker into each and removes it). The agent's skill — `use-own-stores`.

## The contract a replacement must keep

- `OWN-SERVICE-PROPS/` — the passport, the element's main door (`GET /api/own-service-props`); `NODE-CONTRACT.json` — what the node needs to install it.
- The port comes from the `PORT` environment variable.
- `GET /api/health` answers 200 without a session.
- Sign-in only through the node's auth element; stored data only through the node's data element.
- Public pages stay static.

A repository that does not keep this contract is refused; the node does not bend to it.

## Run on its own

```
npm install
npm run build
PORT=24683 node .next/standalone/server.js
```

License: MIT.
