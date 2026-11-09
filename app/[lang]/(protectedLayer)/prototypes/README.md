# `/<lang>/prototypes` — design prototypes (node step 711-4)

The owner 2026-11-09: «тестовой страницы сохраняются в проекте с ссылкой но где-то не в публичном пространстве а защищенном пространстве
и архитектора может быть там нужно создать прямо в шаблоне изначально раздел прототипы дизайна». A branch of the protected layer, open to
the architect only (`layout.tsx`), never indexed. The root lists the prototypes (`widget-dynamic-prototypes-list`); one child route
`[slug]/page.tsx` draws every prototype with its own copy of the tokens (`lib/prototypes.ts`, `lib/design-css.ts` `prototypeScope`).
New prototypes are data folders in `_pages/` (see its README) — no route file is ever added. Build cost: two route files; caching:
`revalidate = 60` (a regenerated prototype shows within a minute).
