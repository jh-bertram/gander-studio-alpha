## [STAGE 1] RECEIVED
- **From:** PM (sprint gander-studio-p1-materia-canvas)
- **At:** 2026-03-16T00:00:00Z
- **Task ID:** p1-mc-FE-canvas-a
- **Message received:**
  > Create two files:
  > 1. `packages/client/src/constants/canvas.ts` — all canvas magic values
  > 2. `packages/client/src/components/compose/MateriaNode.tsx` — the materia orb node component (standalone, no React Flow integration yet)
  > Files to Read First: constants/compose.ts (getMateriaColor), canvas-store.ts (CanvasNode type), globals.css (CSS custom properties)
  > …[truncated]

## [STAGE 2] PLAN
- **At:** 2026-03-16T00:01:00Z
- **Components to build:**
  - `packages/client/src/constants/canvas.ts` — pure constant exports, no functions
  - `packages/client/src/components/compose/MateriaNode.tsx` — presentational orb component
- **State design:** No local state; pure presentational component driven by props. No Zustand usage.
- **tRPC wiring:** None — standalone presentational component.
- **A11Y plan:**
  - Remove button: `aria-label="Remove {name}"` for screen reader identification
  - Root div: `data-testid` for test targeting
  - Label text: semantic `<span>` with overflow handling
  - No keyboard trap introduced; button is natively focusable

### Checkpoint — 00:02:00
- Wrote `packages/client/src/constants/canvas.ts` (28 lines). Constant audit: 0 matches. Next: write MateriaNode.tsx.

### Checkpoint — 00:03:00
- Wrote `packages/client/src/components/compose/MateriaNode.tsx` (113 lines). Constant audit: 0 matches (two approved inline rgba shadow values). Next: tsc check.

## [STAGE 3] COMPLETE
- **At:** 2026-03-16T00:35:00Z
- **Deliverables:**

| File | Lines | Notes |
|------|-------|-------|
| `packages/client/src/constants/canvas.ts` | 28 | Pure exports; no functions |
| `packages/client/src/components/compose/MateriaNode.tsx` | 113 | Presentational; no React Flow |

- **Lint:** `tsc --noEmit` exit code 0 (no output)
- **Constant audit:** 0 raw hex matches; 0 conversion factor matches; 2 inline rgba shadow values — both explicitly approved by task spec; 0 duplicated function bodies
