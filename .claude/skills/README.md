✅ 2026-10-07 (report 2026-10-07-node-skills.md) |✅ 2026-10-07 (report 2026-10-07-node-skills.md) |✅ 2026-10-07 (report 2026-10-07-node-skills.md) |✅ 2026-10-07 (report 2026-10-07-node-skills.md) |✅ 2026-10-12 |✅ 2026-10-12 |✅ 2026-10-12 |✅ 2026-10-12 |✅ 2026-10-12 |✅ 2026-10-07 |🟨 2026-10-07: law kept, skill not loaded |✅ 2026-10-07 |✅ 2026-10-07 |✅ 2026-10-07 |✅ 2026-10-07 |✅ 2026-10-07 |# Skills of this element's agent

Claude Code reads the skills of the agent that works in this folder from here: one folder per skill, `SKILL.md` inside.

Proof: ✅ — proven by a live run, the report is in `development-docs/proofs/`; «✅ 2026-10-07» — written, never checked live (in the
skill itself: a `<!-- PROOF … -->` mark under its header). Vendored skills are marked only here: their files change only by update.

| Skill | Whose | What | Proof |
|---|---|---|---|
| `use-page-tree` | ours | pages as data folders; a page is one sequence of block-* · text-* · widget-*; blocks from the registry | ✅ 2026-10-07 |
| `use-typography` | ours | plain text on a page as `text-*`, drawn by the element typography | ✅ 2026-10-07 |
| `build-widget` | ours | a widget inside its route: static or dynamic, the branch list, its door in the branch, its skeleton | ✅ 2026-10-07 |
| `use-tools` | ours | tools: find, use only inside widgets, add with a card; the generated list | ✅ 2026-10-07 |
| `describe-element` | ours | the A2A card of this element: research, write, check, publish | ✅ 2026-10-07 |
| `passport-description` | ours | the passport texts in OWN-SERVICE-PROPS/ — name, descriptions, accepts, returns, Nostr tags — written for search by meaning | ✅ 2026-10-07 |
| `own-service-props-detection` | ours | who this element is in the node — from its passport (npm run passport): id, addresses, port, role, partners | ✅ 2026-10-06 |
| `node-elements-detection` | ours | the node around it — every element, what it does, where; working with any of them only through A2A | ✅ 2026-10-06 |
| `telegram-channel` | ours | the person writes from Telegram into this terminal: how a message looks, answer with `reply`, text only, language, no secrets | ✅ 2026-10-07 |
| `a2a-conversation` | ours | talking to neighbours over A2A: find, call, continue in one `contextId`, carry the human's comment | ✅ 2026-10-06 |
| `custom-design` | ours | the gatekeeper: when the person wants an own design instead of the Blocks — ask taste or impeccable, then which rules win | ✅ 2026-10-07 |
| `use-highlight` | ours | addresses for the Preview highlight in both directions: who puts `bid` / `data-block`, the link `#block=` in the answer | ✅ 2026-10-07 |
| `deploy-element` | ours | how a change reaches visitors: build or not, Preview in the core vs Preview before deploy, what to advise, never Accept/Deploy yourself | 🟨 2026-10-07: loaded, right; «Update» line changed after |
| `github-element` | ours | saving the work to the element's own repository: Telegram — at once, terminal — on request; the core's push command and its answers | 🟨 2026-10-07: loaded first, step kept; no plan in steps-new |
| `use-tests-before-dev-finish` | ours | proving a change before «done»: planned checks, machine + behaviour, spoil-and-restore, measurements that lie here | 🟨 2026-10-07: law kept, skill not loaded |
| `use-development-docs` | ours | carrying building in development-docs/: current-step.md first and on every event, steps small and larger, substep = commit, mid-step tasks, closing; when glossary, backlog, cancelled, reports, anti-patterns are read and written; notes vs empty records | 🟨 2026-10-07: law kept, skill not loaded |
| `product-quiz` | ours | the product quiz in `development-docs/product/`: when to load it, the interview one question at a time, the impact form before code, only the person confirms, `npm run check:product` | — not proven |
| `use-auth` | ours | sign-in by the node's auth element, roles and inheritance, locks of a branch, a page and a door, bypasses, guests, a new role | ✅ 2026-10-07 (report 2026-10-07-node-skills.md) |
| `use-element-tree` | ours | the exact file tree of the element and the folders every branch must have; the guards that keep it | ✅ 2026-10-12 |
| `cloudflare-connection` | ours | the tunnel, the temporary address, the own domain with subdomains, the copy in Workers — gains and limits | — not proven |
| `connect-google-analytics` | ours | the person gives a Google tag or a Search Console code: only the ID into «Site settings», banner + footer + policy pages turn on by themselves, check the page and GA Realtime of the property with THAT stream | 🟨 the steps were done live on lagrix 2026-10-11 by the node agent; not run by an element agent |
| `connect-external-service` | ours | an outside paid service: its entry in OWN-SERVICE-PROPS/SUBSCRIPTIONS.json (keys by name only), server code in lib/integrations/<id>/, the check door; the core draws the Subscriptions tab | ✅ 2026-10-12 |
| `connect-own-domain` | ours | the person asks «connect my domain»: buy it, the node adds the zone and gives two name servers, the registrar step (browser or words), measure ≤5 min, old domain → come back in 3–4 h, attach to this element | — not proven |
| `own-domain-sign-in` | ours | sign-in on this element's own domain goes through the node's sign-in center — why, what to tell the person, the cost of direct sign-in, how to check it is alive and the env marker that breaks it | — not proven |
| `computer-off` | ours | what still works with the computer off (the Cloudflare copy) and what waits for it | ✅ 2026-10-07 (report 2026-10-07-node-skills.md) |
| `project-origin` | ours | a project only from the person's own fork of fractera/web4; updates; moving to a new computer | — not proven |
| `github-repositories` | ours | one private repository per element: created by a button, renamed with the element, tokens, import, restore | — not proven |
| `temporary-domain` | ours | the free trycloudflare address: not permanent, read-only panel, when it dies, switch to an own domain early | — not proven |
| `local-node` | ours | a private node at home: agents, data, automations, Telegram as the remote, a buyer node over A2A | ✅ 2026-10-07 (report 2026-10-07-node-skills.md) |
| `use-languages` | ours | 82-language catalogue, enabled set, switcher, translations as files, search-open set and its guards, one language while building, the translation debt | ✅ 2026-10-07 (report 2026-10-07-node-skills.md) |
| `use-machine-copy` | ours | what a public page gives machines: Markdown copy, llms.txt, llms-full.txt; a widget's own markdown.ts; first-source facts about head markup | — not proven |
| `use-site-menu` | ours | header and footer menus as settings: nav.top/footer, labels, topMenu/footerPages switches, CONFIG copy, links and language, no build, live check | — not proven |
| `soft-navigation` | ours | internal links through next/link, header in the shared layout, no navigation by hand; prove a soft navigation by the window marker and an RSC request on every address; the Cloudflare copy answering HTML is the core's defect | ✅ 2026-10-12 |
| `use-messenger` | ours | the gatekeeper of ai-elements: messenger branches messenger-h2h / messenger-h2a and the drawer buttons; 🔒 messenger UI only from ai-elements; what is not built | ✅ 2026-10-12 |
| `ai-elements` | vendored (Vercel) | how to install and use ai-elements components; `SOURCE.md` — origin and update | — vendored |
| `page-snippet` | ours | every public page has its own 1200×630 snippet at `<page>/snippet.png`, drawn on the first request (no rebuild) from title, description and the project background, tinted with the design primary; the background script asks the customer, names the price, or makes a free pattern | ✅ 2026-10-12 (after a fix) |
| `use-shadcn` | ours | the gatekeeper: widgets, tools and blocks only from shadcn; where our law beats the shadcn skill | 🟨 2026-10-07: law kept, skill not loaded |
| `shadcn` | vendored, shadcn/ui, MIT | components, CLI, registries, composition rules — `SOURCE.md` | — not proven |
| `design-taste-frontend` | vendored, Leon Lin, MIT | anti-generic landing design — `SOURCE.md` | — not proven |
| `impeccable` | vendored, Paul Bakaus, Apache-2.0 | design direction from the audience's world — `SOURCE.md` (without hooks and agents) | — not proven |
| `copywriting` | vendored, Corey Haines, MIT | writes page copy: headlines, value, calls to action — `SOURCE.md` | — not proven |
| `copy-editing` | vendored, Corey Haines, MIT | edits existing copy line by line — `SOURCE.md` | — not proven |
| `humanizer` | vendored, blader, MIT | removes the signs of AI writing from any text a person reads, the product quiz too — `SOURCE.md`, `CLAUDE.md` «Texts» | — not proven |
| `order-summary` | ours | a short summary of an order done for another agent over A2A, outside git, no personal data | ✅ 2026-10-06 |
| `review-order` | ours | recall a closed order with the person, agree on the review, publish the review page at `/<lang>/reviews/<slug>` through `/api/reviews` (no commit, no rebuild) | 🟨 2026-10-17: the door proven (node step 518), the conversation not |
| `self-review` | ours | on the person's «review» (in their language): at most three proposals to improve the skills, nothing changed without «yes» | — not proven |

Vendored skills are copies, never symbolic links, and are never edited by hand: `SOURCE.md` next to each says where it came
from and how to update it.
