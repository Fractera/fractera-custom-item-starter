# Doors — the rules of this folder

- A door for a neighbour is made by `npm run door:add -- <name> --says "<6 to 12 words>"`: it writes the route, the node-key check,
  the test, the closed list of routes and the A2A card entry; you fill in only `handle(input)` in `<name>/<name>.mjs` (skill `add-door`).
- Every route file starts with its `// @api` name line (`check:api`); a new route outside the closed list of `scripts/check-routes.mjs`
  fails the build.
- A door for neighbours checks `X-Node-Key`; a door for visitors checks the role (skill `use-auth`) — the page's gate is a sign, the
  door is the lock.
- A door that only serves one widget lives inside that widget's route, not here (skill `build-widget`).
- Never call another element's code or files: you call its door, the address the core's main agent gave you.
