# landing-agent — the home page landing redrawn by the element agent on the reference maquette

Page: the root of the public branch — `(publicLayer)/_data/` (`meta.json` → `"bare": true`; the sequence holds
`widget-static-landing-agent`), listed in `(publicLayer)/_widgets/index.tsx`, named in the exceptions of
`scripts/check-typography.mjs`.

- **Words** come from the home page data through `landingWords(lang)` (`words.ts` in this folder), the three
  destinations included (`x.outcomes`). This widget holds no text.
- **World and composition are the maquette's:** station sign → departure board (origin, destinations, platforms, departure
  time) → ticker with «?» → the signal action and the outline action → timetable poster → ticket → closing band.
- **The board is fixed to the wall** (owner, 2026-09-28): no tilt, no parallax, no cursor-following shadow or glare.
- **Motion = a real split-flap (Solari) mechanism**, island `split-flap.client.tsx`, character set `drum.ts`:
  - every board word (origin «your idea», the three row names, the main display) is a row of drums; a cell has four
    layers — static upper half of the next flap, static lower half of the current, the falling leaf (face = upper half of
    the current, back = lower half of the next, `backface-visibility: hidden`) and the axle line. Letters are drawn by CSS
    from `data-c`, so the layers add no text to the markup; the real word sits beside in a visually hidden span;
  - one step = the leaf turns `rotateX` 0 → −180° around the middle line, 65 ms, eased like a falling flap;
  - the drum turns one way: steps = `(index(target) − index(current) + length) mod length` over `DRUM` (blank, А–Я with Ё,
    A–Z, 0–9, a few signs); flaps are capitals; a character missing from `DRUM` stands as a blank — add it to `DRUM`;
  - all cells of a word start together, each stops on its own flap — the word settles as a ripple; shorter words are
    padded with blanks; one `requestAnimationFrame` loop per word, steps derived from the start time, no React state;
  - starts when the word comes into view (IntersectionObserver, 40 %); leaving resets it to blanks; coming back rattles
    again. The main display then holds 3.2 s and rattles from the current letters to the next destination
    (agent → application → automation) and writes `data-shown` on the board — the matching row's platform lights up;
  - without JavaScript the first word stands; under `prefers-reduced-motion` the island puts the letters on the target at
    once, no rattle, and the display stays on the first destination.
- **The first screen is two columns** (owner, 333-16): ≥ 1024 px the station sign is `100dvh` minus the site header
  (`components/shell/project-header.tsx`: `h-14` + `border-b` = 3.5rem + 1px — measured from the shell, change both
  together); left — the «Open source» plate in the top-left corner, the title and the subtitle; right — the agents chat.
  Below 1024 px the sign is as before and there is no chat. The departure board below takes the full width.
- **Agents chat** (`agent-chat.client.tsx`, owner's word 333-12/333-16): no container of its own — no frame, background or
  shadow; it lies on the sign (board role) and only the message list scrolls, its scrollbar hidden. Message cards are the
  dark flaps role, so they stand out on the sign. No black text: AI Elements paint themselves with theme tokens, so inside
  `.chat` the tokens (`--foreground`, `--muted-foreground`, `--card`, `--secondary`, `--muted`, `--border`, and the
  `--color-*` pair Shimmer reads) are re-pointed at the poster and chalk roles; `components/ai-elements/` is not edited.
  Monospace like code in Telegram (`--font-mono-user`, else JetBrains Mono), a2a / m2m / h2a on every line (Badge), a
  person with an avatar icon. Words: `landingWords(lang).x.chat`.
- **«Open source» plate** in the station sign: an enamel station plate (chalk enamel, double board-coloured rim, a platform
  square with the code sign); words `landing.openSource` of the home page data. On a narrow screen it stands above the title.
- **Timetable rows are one grid:** `.timetable` owns the two columns (`max-content` of the longest title, then the text),
  each row is a `subgrid` of it, so the text column starts at the same x in every row.

## Highlight addresses

Every container here carries `data-block` stamped by `npm run widgets:ids` (node step 335). After any edit of this widget run
it again; `prebuild` fails on a container without an address.

## Colours: relations to `--primary` (impeccable-on-design.md, measured on the maquette)

| Role | Maquette | Relation | Fallback |
|---|---|---|---|
| board: sign, board, closing band, outline action | board blue | `oklch(from var(--primary) 0.286 0.094 h)` | `--primary` |
| flaps: letter tiles | flap navy | `oklch(from var(--primary) 0.197 0.06 h)` | `--foreground` |
| poster: timetable, ticker, departure time, lit platform | yellow | `oklch(from var(--primary) 0.881 0.181 calc(h + 182))` | `--accent` |
| signal: the one action | red | `oklch(from var(--primary) 0.546 0.224 calc(h + 117.5))` | `--destructive` |
| floor | concrete | `oklch(from var(--primary) 0.928 0.004 h)` | `--muted` |
| chalk: text on board and signal, the ticket | chalk | `oklch(from var(--primary) 0.97 0.01 h)` | `--background` |
| ink: text on poster and floor | ink | `oklch(from var(--primary) 0.2 0.03 h)`, soft `0.38 0.02` | `--foreground` |

The board's darker edge and the shadow are derived from the board itself (`oklch(from var(--board) calc(l - …) …)`).
With a primary of hue ≈ 272 the relations give back the maquette. Contrast by lightness: chalk (L 0.97) on board (0.286)
and on flaps is far above 7:1; ink (0.2) on poster (0.881) and on floor (0.928) is above 10:1; chalk on signal (0.546) is
≈ 5:1 and carries only bold text ≥ 20 px. Not measured in a browser for every preset yet.

Faces: `--font-heading` / `--font-body`; Barlow Condensed / Barlow (the maquette's faces, local `@fontsource`) only as the
fallback after the tokens. Corners: `--radius` (tiles and buttons `calc(var(--radius) * 0.25)`).
- **«Fractera vs LLM»** (owner, 2026-09-30; brief from Google, built with the impeccable skill — launcher not run, owner's
  pick «transit map»): the second-to-last section, before the closing band. Words — `x.compare` in the home page data
  (`landing.compare`). On the light floor: the glowing title plate, then two dark screens with scan lines — left «on foot»
  (`lost-route.tsx`, server SVG, still: a lone station and rails ending at a red buffer stop), right «day-zero main line»
  (island `transit-map.client.tsx`: hub + four branches to subdomain stations, the fourth dashed «being built»). Without
  JavaScript the map stands fully drawn; the island draws the branches once when the map comes into view (30 %), then
  stations pop and train lights (SVG `animateMotion`) run — paused off-screen, absent under `prefers-reduced-motion`.
  Colours: `--signal` left, `--go` right (a new relation to `--primary`, hue −127 ≈ green); monospace (`--mono`) only for
  board data — domains, statuses, labels. Station labels: the four strings of `stations`, geometry fixed in `LINES`/`TAGS`.
  Revision (owner, 2026-09-30): both screens are always the same height — one grid stretches both, the card fills it, any
  difference goes into free space above the status list (`margin-top: auto`); both pictures are squares (viewBox 600×600,
  `aspect-ratio: 1`); badges have one width = the longest tag of both cards (`--tagn`, set by the markup, monospace `ch`);
  left texts have exactly as many words as the matching right ones (paragraph and each status). The left scheme now shows two
  chat stations whose tracks run parallel, merge into one and hit a red buffer stop («dead end»): streams of separate chats
  cannot be joined without your own server.
- **Information desk** (node steps 348–349, owner 2026-09-30; impeccable, the page's world): section `#help-desk`, third from the
  bottom, above the pipeline. Island `help-desk.client.tsx`: a station kiosk (enamel plate, «Open 24 hours» lamp, chat window,
  counter with mic, GitHub button and the Send action); on ≥ 1024 px six question signboards hang at the sides plus the two main
  ones at the bottom — «Departure» (signal red, left) and «Transfers en route» (`--ring` orange, right); on phones a row of quick
  buttons. **Signs and quick buttons answer with ready text on the page** (`landing.helpDesk.answers`, `departure.answer`,
  `transfer.answer`) — instant, unlimited, even offline; **only typed messages go to the model**: `useChat` → public door
  `(publicLayer)/api/help-desk/route.ts` (`gpt-6-luna`, facts only from `(publicLayer)/_libs/help-desk.ts`, 40 messages an hour per address, short
  answers). The door passes only plain text of the history (✗ useChat's OpenAI metadata made the second turn fail). Every landing
  button (red CTAs, the portal «Жми», the chat's end button) leads to `#help-desk`; the procedure ends at the fork of
  `github.com/Fractera/web4-node-starter-kit`. Words — `landing.helpDesk` of the home page data.
