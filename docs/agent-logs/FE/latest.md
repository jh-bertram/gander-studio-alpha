## [STAGE 1] RECEIVED
- **From:** ORC
- **At:** 2026-04-04T00:00:00Z
- **Task ID:** gander-studio-p2-agent-cards-FE-003
- **Message received:**
  > You are implementing task **gander-studio-p2-agent-cards-FE-003** for Gander Studio.
  > Working directory: `/home/jhber/projects/gander-studio-alpha`
  > Part A: Rewrite LoadoutListPanel inside MateriaCanvas.tsx with tree structure (card header, agent roots, skill children, orphan skills)
  > Part B: Update loadout-list-panel.spec.ts — update 3 tests, add 3 new tests
  > …[truncated]

### Checkpoint — 00:02:00
- Read `MateriaCanvas.tsx` (923 lines, in parts). Constant audit pre-flight: 0 raw hex matches in LoadoutListPanel region. Next: rewrite LoadoutListPanel.

### Checkpoint — 00:03:00
- Wrote rewritten `LoadoutListPanel` in `MateriaCanvas.tsx`. Constant audit: 0 matches. Next: write spec.

### Checkpoint — 00:04:00
- Wrote `loadout-list-panel.spec.ts` (114 lines, 6 tests). grep check: PASS (no "Select orchestrator on canvas"). Next: lint.

## [STAGE 3] COMPLETE
- **At:** 2026-04-04T00:05:00Z
- **Deliverables:**
  | File | Lines | Notes |
  |------|-------|-------|
  | `packages/client/src/components/compose/MateriaCanvas.tsx` | 990 | LoadoutListPanel rewritten in-place |
  | `packages/client/tests/e2e/loadout-list-panel.spec.ts` | 114 | 3 updated + 3 new tests |
- **Lint:** exit code 0 (zero errors)
- **Constant audit:** 0 raw hex values in modified files; all numerics reference named constants from canvas.ts

## [STAGE 2] PLAN
- **At:** 2026-04-04T00:01:00Z
- **Components to build:**
  - `packages/client/src/components/compose/MateriaCanvas.tsx` — rewrite LoadoutListPanel function only (lines ~293–478)
  - `packages/client/tests/e2e/loadout-list-panel.spec.ts` — rewrite spec with 6 tests
- **State design:**
  - LoadoutListPanel reads `cardTitle` from `useCanvasStore` directly
  - Local `hoveredId` state for hover highlight
  - `agentRoots` and `orphanSkills` derived via `useMemo`
- **tRPC wiring:** none — panel reads from canvas-store only
- **A11Y plan:**
  - Card header: `aria-label="Card: {cardTitle}"`, NO role="button", NO tabIndex
  - Agent/skill interactive rows: `role="button"`, `tabIndex={0}`, `aria-label="Select {name} on canvas"`, `onKeyDown` Enter/Space
  - Orphan skills section: same interactive row pattern
  - Panel heading: "Loadout" (uppercase via CSS)
  - Empty state text preserved
