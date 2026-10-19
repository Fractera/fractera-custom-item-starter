# fractera-root-starter

The site of a Fractera node — what a visitor sees at the root of the domain.

It is a **replaceable element**, like the node's auth and data elements: its own repository, its
own port, a pinned tag in the node's `WEB4-ITEMS-REGISTRY/web4-items.json`. To put a different site in
its place (for example a barbershop site from the marketplace), change `repo` and `version` of the
`root` line there and run `npm run services:install` in the node. The node's core is not touched.

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
