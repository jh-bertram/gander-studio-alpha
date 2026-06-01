## [STAGE 3] COMPLETE
- **At:** 2026-05-28T00:05:00Z
- **Deliverables:**

| File | Lines | Notes |
|------|-------|-------|
| `packages/client/src/AppShell.tsx` | 12 | Sidebar import + JSX removed |
| `packages/client/src/globals.css` | ~168 | Single-column .app-shell, top-level #mode-content padding-bottom:56px, 640px media query cleaned |
| `packages/client/src/e2e/layout-sidebar-removal.spec.ts` | 47 | Tier-2 e2e spec with 3 tests covering sidebar absence, single-column grid + tablist at 1200px, tablist at 390px + padding-bottom |

- **Lint:** exit 0 (all 3 packages pass tsc --noEmit)
- **Constant audit:** 0 matches — no raw hex in modified .tsx/.ts files; no rgba(15,15,15 matches; no FT_PER_M matches
- **Style conflict check:** NONE — AppShell.tsx has no inline styles; globals.css is pure CSS (no Tailwind classes)

### Checkpoint — 00:02:00
- Wrote `packages/client/src/AppShell.tsx` (12 lines). Constant audit: 0 matches. Next: update globals.css.

### Checkpoint — 00:03:00
- Wrote `packages/client/src/globals.css` (168 lines). SC2 grep returns 0 (no 250px). SC3 grep returns match. SC6 grep returns 0. Next: create e2e spec.

### Checkpoint — 00:04:00
- Wrote `packages/client/src/e2e/layout-sidebar-removal.spec.ts` (47 lines). Constant audit: 0 matches. Next: run lint + write output.

## [STAGE 2] PLAN
- **At:** 2026-05-28T00:01:00Z
- **Components to build:**
  - `packages/client/src/AppShell.tsx` — remove Sidebar import + JSX element
  - `packages/client/src/globals.css` — rewrite .app-shell to single-column, add top-level #mode-content padding-bottom:56px, remove redundant 640px media-query .app-shell block and .sidebar{display:none}
  - `packages/client/src/e2e/layout-sidebar-removal.spec.ts` — new Tier-2 Playwright spec (4 assertions + "MUST be executed" comment)
- **State design:** No state changes. BottomTabBar already uses useUIStore; AppShell is pure layout.
- **tRPC wiring:** None.
- **A11Y plan:** BottomTabBar already has role="tablist" + aria-label="Main navigation" with each tab as role="tab" aria-selected. Keyboard nav already implemented via native `<button>` elements. No changes needed. Spec asserts div[role="tablist"] present at 1200px and 390px.

## [STAGE 1] RECEIVED
- **From:** ORC
- **At:** 2026-05-28T00:00:00Z
- **Task ID:** p5-t1-sidebar-removal
- **Message received:**
  > Implement task packet **p5-t1-sidebar-removal** for sprint `gander-studio-p5-overview-ux`: remove the left navigation sidebar and make the bottom tab bar the always-on primary nav, reclaiming horizontal space. Single source of truth: `.claude/agents/tasks/outputs/gander-studio-p5-overview-ux-PM-rev1-1780000200.md`. Context: AppShell.tsx, globals.css, BottomTabBar.tsx (read-only), Sidebar.tsx (read-only). Out of scope: NAV_ITEMS, BottomTabBar.tsx, any page components or stores, t3/t4 work. Tier-2 e2e spec required at `packages/client/src/e2e/layout-sidebar-removal.spec.ts`. Run `npm run lint`. Output path: `.claude/agents/tasks/outputs/p5-t1-sidebar-removal-FE-1780000784.md`…[truncated]
