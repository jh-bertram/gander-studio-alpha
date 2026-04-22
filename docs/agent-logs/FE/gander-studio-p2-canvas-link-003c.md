## [STAGE 2] PLAN
- **At:** 2026-03-30T00:01:00Z
- **Components to build:**
  - `LoadoutListPanel` — defined inside `packages/client/src/components/compose/MateriaCanvas.tsx`
  - Constants appended to `packages/client/src/constants/canvas.ts`
  - Playwright spec at `packages/client/tests/e2e/loadout-list-panel.spec.ts`
- **State design:** Read `nodes` and `edges` from `useCanvasStore` inside `MateriaCanvasInner`; pass as props to `LoadoutListPanel`. No new local state needed beyond hover tracking in the panel.
- **tRPC wiring:** None — panel reads from Zustand store only.
- **A11Y plan:** `role="button"`, `tabIndex={0}`, `onKeyDown` with Enter/Space, `aria-label="Select {name} on canvas"`. Keyboard focus ring via CSS focus-visible.

## [STAGE 3] COMPLETE
- **At:** 2026-03-30T00:05:00Z
- **Deliverables:**

| File | Lines | Notes |
|------|-------|-------|
| `packages/client/src/constants/canvas.ts` | +22 | 22 new LIST_* constants appended |
| `packages/client/src/components/compose/MateriaCanvas.tsx` | +195 | LoadoutListPanel + wiring |
| `packages/client/tests/e2e/loadout-list-panel.spec.ts` | 62 | Playwright Tier 2, 3 tests |
| `.claude/agents/tasks/outputs/gander-studio-p2-canvas-link-003c-FE-1743292800.md` | 59 | Output packet |

- **Lint:** tsc --noEmit exit code 0 (clean)
- **Constant audit:** 0 hex matches in modified .tsx/.ts files; all measurements use named exports from canvas.ts

### Checkpoint — 00:02:00
- Wrote `packages/client/src/constants/canvas.ts` (appended 22 lines). Constant audit: 0 duplicates. Next: implement LoadoutListPanel in MateriaCanvas.tsx.

## [STAGE 1] RECEIVED
- **From:** ORC#0
- **At:** 2026-03-30T00:00:00Z
- **Task ID:** gander-studio-p2-canvas-link-003c
- **Message received:**
  > Implement `LoadoutListPanel` and wire it into `MateriaCanvasInner` as a third column.
  >
  > Working directory: `/home/jhber/projects/gander-studio-alpha`
  >
  > Build `LoadoutListPanel` inside `MateriaCanvas.tsx`, add constants to `canvas.ts`, wire into the three-column flex layout, keyboard nav, ARIA labels, Playwright spec. Full receipt checklist of 13 items must pass. …[truncated]
