# The header and footer come from the core — and how to draw your own

**What it is.** This element's header (menu, account, theme, width and language switches) and footer are drawn by the core's tool
«Project shell» (node step 727). The DATA is yours — `siteShellData(lang)` from your own settings, your menus, your side drawers; the
CODE is the core's. A change of the menu or the footer is made once in the core and reaches this element at its next render
(`revalidate` of `app/[lang]/layout.tsx`), with no rebuild of yours.

**How it works.** `core-shell.ts` asks the core's door `/api/shell-kit/<lang>` over loopback with the node key while the static page
renders; `core-shell-parts.tsx` prints the core's HTML and one script; the browser takes the core's files through your own door
`/shell-kit/<file>` (`app/shell-kit/[file]/route.ts`); `drawer-bridge.client.tsx` connects the header's drawer buttons to your
`DrawerProvider`. The core is silent — your own `TopMenu` and `FooterMenu` (`components/menu/`, `components/shell/`) are drawn instead.

**Your own header or footer instead of the core's (the owner's word, 2026-11-12: «в каждом элементе нужно коротко рассказать о том как
он может избавляться от этих заглушек чтобы нарисовать свой собственный инструмент»).**

1. In `app/[lang]/layout.tsx` put back `<TopMenu lang={lang} />` in place of `<CoreShellHeader lang={lang} />` (or
   `<FooterMenu lang={lang} />` for `<CoreShellFooter lang={lang} />`) — the part you keep from the core stays as it is.
2. Draw yours in `components/menu/top/top-menu.server.tsx` or `components/menu/footer/footer-menu.server.tsx`: shadcn parts and the
   tokens, as everywhere (`use-primitives`, `use-shadcn`). The data is still `siteShellData(lang)`.
3. Both parts dropped — delete this folder and the line of `app/shell-kit/[file]/route.ts` in `scripts/check-routes.mjs` with the route.

**What you lose then:** the core's changes of that part no longer reach you; you keep it yourself. Tell the architect in your report.
