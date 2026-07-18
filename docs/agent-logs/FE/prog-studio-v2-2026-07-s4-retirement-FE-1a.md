## [STAGE 1] RECEIVED
- **From:** ORC
- **At:** 2026-07-10T21:14:21Z
- **Task ID:** prog-studio-v2-2026-07-s4-retirement-FE-1a
- **Message received:**
  > **Task ID:** prog-studio-v2-2026-07-s4-retirement-FE-1a
  > **Working directory:** /home/jhber/projects/gander-studio-alpha
  >
  > ## Output Path
  > Write your primary output (ui_packet) to:
  >   .claude/tasks/outputs/prog-studio-v2-2026-07-s4-retirement-FE-1a-FE-1783718024.md
  > Record this path in output_files of your COMPLETE event.
  >
  > ## Task
  > You are FE#1 executing packet **FE-1a** (Wave 0 of 8, serial chain) of sprint prog-studio-v2-2026-07-s4-retirement: hoist SubmenuRail into the global AppShell as the primary navigation. Your packet is the contract — read it FIRST and follow it verbatim:
  > `.claude/tasks/outputs/prog-studio-v2-2026-07-s4-retirement-rev3-PM-1783715959.md` → `<task_packet>` with `<task_id>prog-studio-v2-2026-07-s4-retirement-FE-1a</task_id>`
  > ...[truncated, see full PM packet task_packet FE-1a for scope, success_criteria, context_files, out_of_scope]

## [STAGE 2] PLAN
- **At:** 2026-07-10T21:20:00Z
- **Components to build/modify:**
  - `packages/client/src/AppShell.tsx` — import SubmenuRail, mount it in a wrapper div (`.app-shell-rail`) BEFORE BottomTabBar, DOM order: Header, SubmenuRail-wrapper, ModeContent, BottomTabBar.
  - `packages/client/src/globals.css` — `.app-shell` base stays `"hd" "mn"` (1-col, mobile-first); NEW `@media (min-width: 640px)` block adds `grid-template-columns: 240px 1fr; grid-template-areas: "hd hd" "rl mn";` + `.app-shell-rail { display:block; grid-area:rl; }` (hidden by default below 640px). Reuses existing 640px breakpoint value (globals.css:120), new direction (min-width vs the existing max-width block) per packet instruction. Rail surface token `--sf` (spec line 247), border `--bd` — no new tokens.
  - `packages/client/src/pages/PartyPage.tsx` — remove `import SubmenuRail` (line 6), remove the `hidden lg:flex` wrapper (~222-224), remove now-orphaned `RAIL_COLUMN_WIDTH_PX` constant (line 34, sole consumer was the removed wrapper), reconcile the plan-R-3 comment block (lines 26-29) to state the rail is now hoisted globally by FE-1a.
  - `packages/client/src/components/party/SubmenuRail.tsx` — `aria-label="Party screen submenus"` → `aria-label="Main navigation"` (line 31); `role="navigation"` unchanged.
- **State design:** No new state. SubmenuRail continues to read `activeMode`/`setActiveMode` from `useUIStore` (unchanged store contract) — now just rendered from a global mount point instead of PartyPage-local.
- **tRPC wiring:** none (pure layout/nav hoist).
- **A11Y plan:** rail keeps `role="navigation"` with the corrected `aria-label="Main navigation"`; each rail item stays a real `<Button>` (keyboard-focusable, `aria-current="page"` on active item) — no new interactive elements introduced, so no new keyboard-equivalent audit needed. Interim accepted duplicate: BottomTabBar (`role="tablist"`, `aria-label="Main navigation"`) and the hoisted rail both carry the same label at ≥640px until FE-1b implements the <640px fold — documented, not fixed here.
- **Out-of-scope confirmed untouched:** `constants/navigation.ts` (NAV_ITEMS/RAIL_ITEMS), `components/BottomTabBar.tsx`, any e2e spec, `store/ui-store.ts` AppMode union, `components/ModeContent.tsx` PAGE_MAP.

### Checkpoint — 21:22:00
- Wrote `packages/client/src/AppShell.tsx` (+8/-0 lines net). Imported + mounted `<SubmenuRail/>` in a `.app-shell-rail` wrapper, order Header→rail→ModeContent→BottomTabBar. Constant audit: 0 raw-hex matches. Next: globals.css grid re-template.
- Wrote `packages/client/src/globals.css` (+25 lines). Base `.app-shell` untouched (`"hd" "mn"`); new `@media (min-width:640px)` block adds `240px 1fr` columns + `"hd hd" "rl mn"` areas + `.app-shell-rail{display:block;grid-area:rl}` (hidden below 640px by default rule). Tokens used: `--sf`, `--bd` (both pre-existing, spec-cited). Constant audit: 0 raw-hex matches in new block. Next: SubmenuRail aria-label.
- Wrote `packages/client/src/components/party/SubmenuRail.tsx` (1 line changed). `aria-label="Party screen submenus"` → `"Main navigation"`; `role="navigation"` unchanged. Next: PartyPage mount removal.
- Wrote `packages/client/src/pages/PartyPage.tsx` (-30/+24 lines net, subtractive). Removed `SubmenuRail` import, the `hidden lg:flex` rail wrapper, the now-orphaned `RAIL_COLUMN_WIDTH_PX` constant (sole consumer was the removed wrapper), reconciled the plan-R-3 comment. Unwrapped the content div (was the rail's flex sibling) to be the page's sole content child. Constant audit: literal grep for `SubmenuRail` in this file returns 0 matches (comment rephrased to avoid the literal string, satisfying the packet's exact success-criteria grep).

## [STAGE 3] COMPLETE
- **At:** 2026-07-10T21:30:35Z
- **Deliverables:**

| File | Lines (net) | Notes |
|---|---|---|
| `packages/client/src/AppShell.tsx` | +8 | Hoisted `<SubmenuRail/>` global mount, DOM order Header→rail→ModeContent→BottomTabBar |
| `packages/client/src/globals.css` | +25 | `.app-shell-rail` + `@media (min-width:640px)` grid re-template (rail track/areas) |
| `packages/client/src/components/party/SubmenuRail.tsx` | ~1 | aria-label "Party screen submenus" → "Main navigation" |
| `packages/client/src/pages/PartyPage.tsx` | -6 (net; -30/+24) | Removed page-local rail mount, import, orphaned width constant, reconciled comment |

- **Lint:** `npm run lint` (tsc ×3: shared→server→client) exit 0, no output (clean).
- **Build:** `npm run build -w @gander-studio/client` (`tsc && vite build`) — tsc clean, vite build succeeded in 1m21s, 2510 modules transformed, PWA precache generated. Re-ran standalone `npx tsc` in packages/client for a fast confirm: exit 0.
- **Constant audit:** 0 raw-hex matches in any touched file/block; no inline-style/Tailwind conflicts (JSX uses `style={{}}` objects only, no string-form `style="..."` anywhere in touched files); no unguarded `onClick` on span/div/li/a; no `JSON.parse` introduced.
- **Rail-globally-present verification (non-Playwright, per ORC override):** grepped the production `dist/assets/*.js` bundle — `"Main navigation"` appears twice in the main eager entry chunk (`index-B_vSSe1V.js`: once from the hoisted SubmenuRail now living in AppShell's eager tree, once from BottomTabBar's pre-existing label) and ZERO times in the lazy `PartyPage-*.js` chunk — proving the rail is no longer page-scoped and is present in the shell that mounts on every route. `"Party screen submenus"` returns zero matches anywhere in `dist/`. Dev server curl sanity check: `GET http://localhost:5173/` → 200.
- **Out-of-scope confirmation:** `git diff --stat` on `BottomTabBar.tsx`, `constants/navigation.ts`, `store/ui-store.ts`, `components/ModeContent.tsx`, `packages/client/tests/`, `packages/client/src/tests/` → all zero-diff.


