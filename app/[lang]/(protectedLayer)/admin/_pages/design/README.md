# `admin/_pages/design` — this element's own design workshop (node step 579-1)

`/<lang>/admin/design` (fonts) and its sections `colors`, `type`, `shape` — one page per section, each a route. The editors are
the shared Design element's, moved into this element: they read and write this element's `DESIGN-CONFIG` through
`/<lang>/admin/api/settings/design`, and the pages redraw at once, with no build. They edit only while the link to the shared
Design is off (an app factory, or an element the person set apart); with the link on the page says where the design is changed.
In the core this workshop opens from «Build → Design» of the element, in a new tab. Skill `use-design`.
