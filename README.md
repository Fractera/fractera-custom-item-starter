# fractera-custom-item-starter

The reference starter template of a Fractera custom element (WEB4 ITEM). The node's button «Create WEB4 ITEM» births every new
custom element from it by a pinned tag. Native elements — the root ones of every node — have their own template, `fractera-native-item-starter`. This one is a mirror of the
standard custom element without anyone's data: the home page shows
one line, «Reference starter template», and the yellow starter sign says what to do next.

An element is a **replaceable element**, like the node's auth and data elements: its own repository, its own port, a pinned tag
in the node's `WEB4-ITEMS-REGISTRY/web4-items.json`.

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
