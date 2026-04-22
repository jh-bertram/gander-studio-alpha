## [STAGE 1] RECEIVED
- **From:** ORC#0
- **At:** 2026-03-28T00:00:00Z
- **Task ID:** gander-studio-p2-canvas-link-003a
- **Message received:**
  > Replace the flat CSS circle in MateriaNode with a glassy 3D sphere per the UI design spec. Update toRFEdge in MateriaCanvas with animated edge glow. Extract all new numeric CSS values as named constants in canvas.ts.

## [STAGE 2] PLAN
- **At:** 2026-03-28T00:01:00Z
- **Components to build:**
  - Modify `packages/client/src/constants/canvas.ts` — add glassy orb + edge constants
  - Modify `packages/client/src/components/compose/MateriaNode.tsx` — replace flat orb with glassy sphere
  - Modify `packages/client/src/components/compose/MateriaCanvas.tsx` — update toRFEdge only
  - Create `packages/client/src/tests/compose/materia-node-glass.spec.ts` — Tier 2 Playwright spec
- **State design:** No state changes. Purely presentational CSS updates.
- **tRPC wiring:** None. No data layer changes.
- **A11Y plan:**
  - Preserve all existing `data-testid` attributes
  - Preserve all existing `aria-label` attributes on remove buttons
  - Highlight div gets `aria-hidden="true"` and `pointerEvents: 'none'` (decorative)
  - Hover transition uses CSS transitions only, no JS — screen readers unaffected

### Checkpoint — 22:02:00
- Wrote `packages/client/src/constants/canvas.ts` (86 lines). Constant audit: 0 matches (no hex in code, no magic numbers inline). Next: update MateriaNode.tsx.

### Checkpoint — 22:03:00
- Wrote `packages/client/src/components/compose/MateriaNode.tsx` (197 lines). Constant audit: 0 hex matches, rgba opacity values use named constants. Next: update MateriaCanvas.tsx toRFEdge.

### Checkpoint — 22:04:00
- Modified `packages/client/src/components/compose/MateriaCanvas.tsx` (toRFEdge only, ~6 lines changed). Constant audit: 0 matches. Next: write Playwright spec.

### Checkpoint — 22:04:30
- Wrote `packages/client/src/tests/e2e/gander-studio-p2-canvas-link-003a.spec.ts` (57 lines). Next: run constant audit, write output file.

## [STAGE 3] COMPLETE
- **At:** 2026-03-28T22:05:00Z
- **Deliverables:**

| File | Lines | Notes |
|------|-------|-------|
| `packages/client/src/constants/canvas.ts` | 86 | 18 new named exports; EDGE_FILTER + all glassy orb values |
| `packages/client/src/components/compose/MateriaNode.tsx` | 197 | Glassy orb gradient + highlight div + hover state |
| `packages/client/src/components/compose/MateriaCanvas.tsx` | 428 | toRFEdge only: animated:true + EDGE_FILTER |
| `packages/client/src/tests/e2e/gander-studio-p2-canvas-link-003a.spec.ts` | 57 | 3 Playwright smoke tests |
| `.claude/agents/tasks/outputs/gander-studio-p2-canvas-link-003a-FE-1774734061.md` | — | Primary output packet |

- **Lint:** UNABLE TO VERIFY — Bash denied by user permission mode. All TypeScript strict-compliant by inspection; all imports resolve; no `any`.
- **Constant audit:** 0 raw hex values in modified code files; 0 magic numbers not extracted; rgba opacity values in MateriaNode use `ORB_SHADOW_INSET_BLOOM_OPACITY` / `ORB_SHADOW_INSET_DEPTH_OPACITY` constants (approved exception per spec).
