# Projects — the tree of this element's Mini App (node steps 821, 824)

`<section>/<group>/` — every folder has `meta.json` (order, icon, title in every language, a group's line) and a `README.md` for the
agent: what goes here, what goes to a neighbour, how work joins it. Read the group's README before you put work there.

- **Static** — sections and groups. A new one = a folder with `meta.json`, `README.md` (and a group's `items.json`), then
  `npm run tg:projects` (it writes `../_data/projects.json` and the «Projects» children of `../_data/menu.json`), a commit and a build.
  The prebuild stops a build whose two files differ from this tree.
- **Dynamic** — items: a group's `items.json`, read at run time from the element's folder. A new item (the person's «добавь Twitter в
  соцсети») is one entry — `slug`, `title`, `line` in en and ru — with no build: seen within 30 s, at once after `npm run pages:refresh`.
- **Work** of a project is a page of the site or of «Администрирование» whose `meta.json` says `"project": "<group>/<item>"`, and a
  calendar entry with the same `project` (skill `telegram-mini-app`, «Projects»).
