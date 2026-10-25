# The study pass — someone else's product, studied with REA

These laws come with the study pass only, after the laws of building (`.claude/modes/build.md`). The first line of every answer here is
«Build process — study» («Строительный процесс — разбор»); a request from the node opens with «Build process, study:».

The owner of the node, 2026-10-25:
«Инженеры создатели REA сделали все оптимально и идеально. Вы не должны вести в их проект, мы не должны трогать ничего в их проекте … а вместо этого мы должны научиться использовать те файлы которые он сохраняет … работать он будет как ядро, но разборы он должен хранить внутри каждого элемента».

## Study — what this pass is for

You study how a finished product works — a website, an app, a package or an SDK — for the product of this element: its quiz, its
stages, its parity with the products it resembles. The method and the records are REA's: load the skill `reverse-engineer-anything`
and follow it. This file is the gate around it: when to study, what you may take, where it lives, how it returns to the quiz.

**The line between REA and us.** REA says what is true about the original and whether it is true about ours — its records, unknowns,
application graph and obligations. Fractera decides how and where ours is built — static pages, the node's doors, blocks, our own
texts and look. The test for every finding: would it stay true if the original's authors rewrote it in another language and framework?
Yes — it is behaviour (screens, flows, states, errors, rules): take it. No — it is mechanics: out of scope.

## Study — before you start

1. **The person asked for it.** A study costs tokens of the person's subscription and memory of this computer: name both before you
   start — REA and the node's study browser hold up to about 1 GB while they run.
2. **The site's rules:** `npm run study -- rules <url>`. `DISALLOWED` or `UNKNOWN` → no automated study of that site: a series of
   screenshots from the person (skill `product-clone`, §3) or similar sites whose rules allow it. Then read its terms of use: a ban on
   scraping, crawling, automated access or reverse engineering — the same answer, quoting the clause.
3. **Internal pages only in a test account the person confirmed.** `npm run study -- login <site>` opens the node's login window on
   this computer: the person ticks three statements, types the site name and signs in. You never ask for a password and never create
   an account. `npm run study -- accounts` shows which sites are signed in.
4. **The machine.** When this computer lacks the power a task needs, and the task is critical to the person's business, offer a
   consultation on moving to a stronger rented computer with Fractera installed there — never «we cannot» (owner of the node, 2026-10-25).

## Study — how

- **REA's MCP tools in this pass, its command line everywhere.** In this pass only, the node starts REA's MCP server for the session
  (one copy in the node's core). The owner of the node, 2026-10-25: «Командная строка, MCP по замеру»; the measurement: a ledger of
  obligations needs ONE canonical bundle of all the study's records, and only an MCP session makes it — the command line writes one
  record per call and refuses a bundle glued by hand («Evidence bundle manifests are not canonical»). Claude Code defers MCP tools: at the
  start only their names are in your context; a tool's description comes when you search for it. So: observe with REA's MCP tools —
  every record stays in the session with its id — and before the session ends run `export_evidence_bundle` with the absolute path of
  `study/<folder>/bundle.json` (a new name for each export; it never overwrites). Read saved records with REA's own views — MCP
  `inspect_analysis_view`, or `npm run rea -- inspect-analysis-view <request.json>` with
  `{"source":{"kind":"evidence-file","path":"study/<folder>/bundle.json","evidence_id":"ev_…"},"view":{"kind":"summary"}}` — then a page
  or one item. Never open a large record whole and never dig it with scripts of your own (✗ node step 556-5: about twenty such calls).
- **The browser is the node's:** `npm run study -- browser start <url>` prints its debugging address `http://127.0.0.1:<port>` (REA
  takes only the loopback, never `localhost`). The passive tools attach to it: `list-browser-targets`, `inspect-web-page`,
  `observe-web-session` (the person acts, REA records — the only evidence of which script sent a request), `analyze-web-bundle`,
  `capture-web-screenshot`. A test account: `npm run study -- browser start <url> --site <site>` — the node's guard blocks every write.
- **A scenario on someone else's site** (`capture-browser-scenario`) runs only in `connect` mode against that browser. REA's own
  `launch` mode is for the person's own application; REA «is not a browser sandbox or network containment mechanism», and on someone
  else's site no step writes — no `request` step that is not a read, no form that sends. A page with a service worker is refused under
  REA's default (`target_unavailable`): for observation set `"environment": {"service_workers": "allow"}` — never with a `request` step.
- **Take only what the question needs.** REA keeps structure, not values, by default. Script sources (`--include-script-sources`),
  accessibility text and response bodies — only for a question that needs them; never read a site's `llms.txt` or a captured script
  whole into the conversation (✗ 556-5: three reads of one `llms.txt`, about 42 KB).
- **One thing at a time.** REA suggests parallel workers «when parallel workers are available … Otherwise, work sequentially»: this
  node has no subagents — work sequentially.
- **Comparison is for our own versions.** `compare-web-captures` aligns only captures of a compatible origin: it shows what changed
  between two versions of this element, never «the same» between the original and ours.
- At the end: `npm run study -- browser stop`.

## Study — where it lives

A study is a folder of this element: `study/<YYYY-MM-DD>-<site>/` at the root, out of git (`.gitignore`) — REA's records, the scenario
inputs you wrote, and your investigation notes `notes.md`: each finding with the Evidence id that supports it, each open question as
an unknown (REA's method). Someone else's code and pages live there, so a study never goes into a commit, a page, the code or the data.
Deleting this element deletes its studies.

**The ledger of obligations lives there too** (owner of the node, 2026-10-25, about REA's ledger: «here is super important part»).
`study/<folder>/obligations.json` — the behaviour our product must show, REA's reviewed obligations as REA defines them (skill
`product-quiz`, «Obligations»), each citing the records of `bundle.json` it rests on; `study/<folder>/manifest.json` — who in our code
owns an obligation, once it is built. `npm run ledger -- <folder>` asks REA for the ledger and writes `study/<folder>/ledger.json`.

## Study — the way back

Write `development-docs/current-step.md` — what the study answered, the unknowns, the folder — stop the browser, then return to the
quiz: `npm run pass -- main "Product quiz: continue from the study study/<folder>"`.

<!-- RULE: our-architecture -->
🔒 Our architecture, never theirs — non-cancellable (owner of the node, 2026-10-23:
«категорически запрещено в процессе проектирования переносить не оптимизированную механику в наш проект … элементы интерфейса и бизнес логики мы пере используем а техническую архитектуру сохраняем собственную»).
From a product studied by reverse engineering, screenshots or knowledge we take its interface
elements and its business logic — never its technical architecture. Pages stay static and readable without JavaScript, with the least
load on the server and the database; an endless feed becomes pages with server search. Whatever the studied product does without
search optimization, without static pages or with heavy load, we solve our own native way. Everything a study holds about a studied
product — REA's records in `study/`, screenshots, notes — describes another product: a source to learn from, never our own code, pages, routes or data.
