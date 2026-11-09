# `prototypes/_pages/` — one folder per design prototype

Made by `npm run prototype -- new <id> --skill <mark> [--from home|<slug>]` (step 711-4), filled by the element's design pass, closed by
`npm run prototype -- done <id>`, pinned by `npm run design:pin -- <id>`. A folder holds `meta.json`, `en.json`, `ru.json` (the page's
words, the same format as any page of a branch), `tokens.json` (its own copy of the design document — the shape of `DESIGN-CONFIG`),
`DESIGN.md` (the rules of the look that tokens cannot hold), `prototype.json` (skill, source page, references, status) and `shots/`
(screenshots for the core's Design tab). The page takes colours, fonts and spacing only from `tokens.json` — `check:prototypes` guards it.
