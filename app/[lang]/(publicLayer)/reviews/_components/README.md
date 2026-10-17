# `_components/` of the reviews branch

The branch's own components (server by default, islands `*.client.tsx`).

| File | Role |
|---|---|
| `review-body.tsx` | the body of one review page in the owner's order of blocks; a block with nothing to show is not drawn; photos are a link to the originals, not a grid |
| `review-actions.client.tsx` | the island with «Share» (system share sheet or copy link) and «Print as PDF» (`window.print()`) |
