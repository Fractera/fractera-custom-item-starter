# widget-dynamic-users-table

The accounts of THIS application on `/<lang>/admin/users` — the same window as the core tab «Users» of the sign-in element (node step
559), limited to the people of this element's application and without organizations (node step 580-3; owner 2026-10-24: «здесь нельзя
будет переключить пользователя в организации а в остальном этой таблице пользователей будет редактироваться также как и таблица
пользователей нативном элементе авторизации»).

- **Where it stands:** the last item of the sequence in `admin/_pages/users/<lang>.json`; listed in `admin/_widgets/index.tsx`.
- **What it does:** closed until «Show accounts» (the skeleton shows the frame); then search, role filter, sort by registration,
  pages 10 · 25 · 50 · 100, row selection with batch actions (block, unblock, add or remove a role, refuse marketing or tracking,
  anonymize), the pencil opens the person's card (edit → confirm, property histories, anonymize).
- **Who may:** decided by the sign-in element (`/api/app-users`): the node architect — any application; an administrator — only the
  application of their own record. Anonymizing and the architect role — only the node architect; the window hides those controls from
  an administrator, the service refuses them anyway.
- **Words:** `ui.i18n.ts` (en, ru), chosen by the server (`usersTableUi(lang)`) and passed as a prop; the dialog words — `appDialogUi`.
- **Doors:** `/api/users`, `/api/users/<id>/history/<kind>`, `/api/users/batch` of this element (`app/api/users/[[...path]]`) → the
  sign-in element `/api/app-users/*` with the visitor's cookie, the single sign-on ticket and this element's id.
- **Files:** `index.client.tsx` (the island) · `user-dialog.client.tsx` · `batch-bar.client.tsx` · `server-table-tools.client.tsx`
  (search on top, pages below) · `clamped-chips.client.tsx` · `skeleton.tsx` · `ui.i18n.ts`.
