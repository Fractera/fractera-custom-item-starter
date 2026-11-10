# Inner pages — the rules of this layer

- Every branch here (`account`, `admin`, `staff`, `finance`, the messengers, the prototypes) is locked by role; its pages are data
  folders `<branch>/_pages/<slug>/` (a role's pages one level deeper, `_pages/<role>/<page>/`), read by the branch's one `[...slug]/`
  route — never a new `page.tsx` (skills `use-page-tree`, `use-auth`).
- The page's gate is a sign, the door is the lock: data a role may see is served by a door that checks the role itself (skill `use-auth`).
- Working screens — tables, forms, wizards — are widgets in the branch's `_widgets/` with their own door inside the branch (skill
  `build-widget`); a widget built only from `components/ui` (skill `use-shadcn`).
- A page here is a prerendered shell with dynamic islands: `auth()`, `cookies()` or `headers()` in a layout make the whole layer dynamic
  (`check:protected` refuses it); an island asks its door after hydration.
- On this computer you pass every lock: check a page as the role sees it, not as the owner.
