## [STAGE 3] COMPLETE
- **At:** 2026-04-27T23:10:00Z
- **Deliverables:**

| File | Lines | Notes |
|------|-------|-------|
| `packages/client/src/components/compose/MateriaNode.tsx` | +35 | Added `Handle, Position` import; `HANDLE_STYLE` constant; 2 Handle elements in JSX |
| `packages/client/src/components/compose/CardNode.tsx` | +35 | Added `Handle, Position` import; `CARD_HANDLE_STYLE` constant; 2 Handle elements in JSX |
| `packages/client/src/tests/compose/materia-canvas.spec.ts` | +175 | 3 new proximity edge tests + `gotoCompose` + `dragNodeOntoTarget` helpers; fixed pre-existing broken navigation in beforeEach |
| `packages/client/playwright.config.ts` | +7 | Updated testDir→testMatch to include `src/tests/compose/*.spec.ts` |

- **Lint:** Exit code 0 — clean
- **Constant audit:** 0 matches — no raw hex, no rgba(15,15,15, no conversion literals in modified files
- **Style conflict check:** NONE — no inline style/Tailwind overlaps introduced
- **Test result:** 7/7 pass in `materia-canvas.spec.ts`; 27 pass / 13 fail across full suite (all 13 failures are pre-existing)

### Checkpoint — 23:10:00
- Wrote `MateriaNode.tsx` (234 lines). Constant audit: 0 matches. Next: CardNode.tsx.
- Wrote `CardNode.tsx` (182 lines). Constant audit: 0 matches. Next: materia-canvas.spec.ts.
- Wrote `materia-canvas.spec.ts` (211 lines). Constant audit: 0 matches. Next: playwright.config.ts.
- Wrote `playwright.config.ts` (22 lines). Constant audit: 0 matches. Next: run lint + tests.
- Lint: exit 0. Tests: 7/7 pass. Stage 3 written.

---

## [STAGE 2] PLAN
- **At:** 2026-04-27T22:36:15Z
- **Components to build:** (modifying existing)
  - `packages/client/src/components/compose/MateriaNode.tsx` — add invisible `<Handle type="source">` and `<Handle type="target">` from `@xyflow/react`, anchored center of orb
  - `packages/client/src/components/compose/CardNode.tsx` — same Handle treatment for card node
  - `packages/client/src/tests/compose/materia-canvas.spec.ts` — extend with 3 new proximity edge tests
- **State design:** No state changes. Handles are purely presentational, no new local state.
- **tRPC wiring:** No new tRPC procedures. Edge creation already wired in `addEdgeWithEffects` → `storeAddEdge`.
- **A11Y plan:**
  - Handles will have `tabIndex={-1}` (not focusable) and `aria-hidden="true"` — they are invisible positioning anchors, not interactive controls.
  - `isConnectable={false}` — user cannot manually draw connections; proximity-drop is the only connection mechanism.
- **Diagnosis confirmed:** Both `MateriaNode.tsx` and `CardNode.tsx` have zero `Handle` imports. `MateriaCanvas.tsx:900` match for "Handle" is a comment about "Handle panel row click". RF edge sync at lines 740-743 does call `setRFEdges`, so the store edge exists, but RF's layout pass cannot produce SVG endpoint coordinates without registered Handle components. Fix: add 2 handles per node (source + target) at `Position.Right` / `Position.Left` (clean any-to-any geometry), fully hidden, non-interactive.

---

## [STAGE 1] RECEIVED
- **From:** ORC#0 (main session, single-domain quick-route)
- **At:** 2026-04-27T22:35:12Z
- **Task ID:** gander-studio-p3-proximity-edge-fix-FE-001
- **Message received:**
  > **Task ID:** `gander-studio-p3-proximity-edge-fix-FE-001`
  > **Sprint:** `gander-studio-p3-proximity-edge-fix`
  > **Parent:** ORC#0 (main session, single-domain quick-route)
  > **Output Path:** `.claude/agents/tasks/outputs/gander-studio-p3-proximity-edge-fix-FE-001-20260427T223512Z.md`
  >
  > ## Problem
  >
  > Proximity-link edge regression carried over from the prior sprint. After a user drags a Materia node within `CANVAS_PROXIMITY_THRESHOLD_PX` of another and drops, the link sound plays and the canvas-store edge is appended, but **no edge renders in the React Flow DOM**. Reproduces 100% in HCG-2 human visual check.
  >
  > ## Root cause (already diagnosed by main session — verify, then fix)
  >
  > Neither `packages/client/src/components/compose/CardNode.tsx` nor `packages/client/src/components/compose/MateriaNode.tsx` renders any `<Handle>` components from `@xyflow/react`. React Flow **silently drops edges**…[truncated]
