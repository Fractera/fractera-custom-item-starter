# Design pass — the laws of this session

This file comes with the design pass of the build session (node step 590-5): blocks, widgets and the look of pages. The laws of
building (`.claude/modes/build.md`) hold here too.

## The design pass

The owner of the node, 2026-10-23:
«сначала создаем дизайн для работы с блоками,. Затем сбрасываем контекст строим проект с этими блоками. Затем сбрасываем контекст работаем с текстом».

- **What this pass does:** the blocks and widgets a page needs, their look on the «Design» tokens through the design skill of the
  project, the highlight address on every container, the registration of each block, and page skeletons made of blocks with
  placeholder words.
- **What it never does:** doors, data, the logic of a scenario, the words people read — the main pass and the texts pass. A request
  for them: write `current-step.md`, then `npm run pass -- main "<the request>"` (or `texts`).
- **The skills of this pass:** `impeccable`, `design-taste-frontend` (through the gate `custom-design`), `shadcn` (through
  `use-shadcn`), `ai-elements` (through `use-messenger`) — the line `Pass:` of each one's `SOURCE.md` says where it lives.
- **End of the pass:** commit, write `current-step.md` (what is done, «next: the main pass»), tell the person in one line; switch with
  `npm run pass -- main "<the next substep>"` when the step goes on, or stop when the person wants to look first.

<!-- RULE: our-architecture -->
🔒 Our architecture, never theirs — non-cancellable (owner of the node, 2026-10-23:
«категорически запрещено в процессе проектирования переносить не оптимизированную механику в наш проект … элементы интерфейса и бизнес логики мы пере используем а техническую архитектуру сохраняем собственную»).
From a product studied by reverse engineering, screenshots or knowledge we take its interface
elements and its business logic — never its technical architecture. Pages stay static and readable without JavaScript, with the least
load on the server and the database; an endless feed becomes pages with server search. Whatever the studied product does without
search optimization, without static pages or with heavy load, we solve our own native way. A report of a studied product and
everything the graph marks external-study describe another product: a source to learn from, never our own code, pages, routes or data.

## Design skill

The design skill this element is built with lives in the passport `OWN-SERVICE-PROPS/OWN-SERVICE-PROPS.json`, field
`designSkill`: the skill's name (`impeccable`, `design-taste-frontend`) or `""` when none. The field is always there; it is never
written in `NODE-CONTRACT.json` (owner 2026-10-07). Read it before any design work and work in that skill's style; when the person
picks another skill (`custom-design` asks which), write its name there and run `npm run describe:publish` — the core takes it
into its registry («Take into core»).
