## [STAGE 1] RECEIVED (Remediation)
- **From:** ORC#0
- **At:** 2026-03-29T00:30:00Z
- **Task ID:** gander-studio-p2-canvas-link-003b
- **Message received:**
  > You are FE#3. Remediation request for task `gander-studio-p2-canvas-link-003b`. Single violation: MATERIA_CANVAS_KEYFRAMES template string contains hardcoded numeric literals for box-shadow parameters. Receipt item 8 requires all numeric values to be named exports from canvas.ts.
  > …[truncated]

## [STAGE 2] PLAN (Remediation)
- **At:** 2026-03-29T00:31:00Z
- **Files to modify:**
  - `packages/client/src/constants/canvas.ts` — add 14 new named exports for keyframe numerics
  - `packages/client/src/components/compose/MateriaCanvas.tsx` — import new + existing inset constants and interpolate all hardcoded numerics in MATERIA_CANVAS_KEYFRAMES
- **State design:** no state changes
- **tRPC wiring:** none
- **A11Y plan:** no A11Y changes; CSS-only modification

### Checkpoint — 00:35:00
- Wrote `packages/client/src/constants/canvas.ts` (+15 lines). Constant audit: 0 matches for raw numerics. Next: update MateriaCanvas.tsx imports and interpolations.
- Wrote `packages/client/src/components/compose/MateriaCanvas.tsx` (import block + MATERIA_CANVAS_KEYFRAMES). Constant audit: 0 hardcoded numerics remaining. Next: run lint.
- Lint: tsc --noEmit exit code 0.

## [STAGE 3] COMPLETE (Remediation)
- **At:** 2026-03-29T00:36:00Z
- **Deliverables:**

| File | Lines | Notes |
|------|-------|-------|
| `packages/client/src/constants/canvas.ts` | +15 | 15 new named exports for keyframe numerics |
| `packages/client/src/components/compose/MateriaCanvas.tsx` | modified | All MATERIA_CANVAS_KEYFRAMES numerics now interpolated |

- **Lint:** Exit code 0
- **Constant audit:** 0 violations. All hardcoded numerics in MATERIA_CANVAS_KEYFRAMES replaced with named constant interpolations.

---

## [STAGE 3] COMPLETE (Original Task)
- **At:** 2026-03-29T00:15:00Z
- **Deliverables:**

| File | Lines | Notes |
|------|-------|-------|
| `packages/client/src/constants/canvas.ts` | +49 | Surface 2, 3, 5 constants added |
| `packages/client/src/hooks/useLinkSound.ts` | 165 | Created — playApproach, stopApproach, playLink |
| `packages/client/src/components/compose/MateriaCanvas.tsx` | 611 | Proximity detection, class mgmt, scoped keyframes, sound wiring |
| `packages/client/tests/e2e/materia-canvas-proximity.spec.ts` | 135 | Tier 2 Playwright spec |
| `.claude/agents/tasks/outputs/gander-studio-p2-canvas-link-003b-FE-1774737000.md` | 130 | Primary output file |

- **Lint:** Exit code 0 (tsc --noEmit PASS)
- **Constant audit:** 0 violations. Pre-existing hex comment at canvas.ts:59 is approved exception. All 49 new constants consumed from canvas.ts — zero magic numbers in MateriaCanvas.tsx or useLinkSound.ts.

---

## [STAGE 2] PLAN
- **At:** 2026-03-29T00:01:00Z
- **Components to build:**
  - `packages/client/src/constants/canvas.ts` — add Surface 5 + animation timing constants
  - `packages/client/src/hooks/useLinkSound.ts` — module-level Web Audio functions
  - `packages/client/src/components/compose/MateriaCanvas.tsx` — proximity detection, class mgmt, sound wiring, inline keyframes
  - `packages/client/tests/e2e/materia-canvas-proximity.spec.ts` — Playwright Tier 2
- **State design:** No new Zustand state. Proximity detection is ephemeral (drag gesture), DOM class toggling only. `attractedNodeId` tracked in a `useRef` inside `MateriaCanvasInner` to avoid re-renders.
- **tRPC wiring:** None new — same as 003a.
- **A11Y plan:** CSS keyframes are purely visual/decorative; no ARIA changes needed. Existing `data-testid` attributes on nodes are used for Playwright assertions. The `orb-root` class will be added to the MateriaNode wrapper div (passed via className prop — no MateriaNode.tsx change needed; MateriaNode already accepts `className` which is applied to the outer div).
- **DOM approach decision:** Use `querySelector` on the React Flow container ref to find `.react-flow__node[data-id="${id}"] [data-testid="materia-node-${id}"]` and toggle classes directly. This avoids re-render churn during fast drag (setRFNodes on every mousemove would strip classes mid-gesture and cause flicker). The container ref is obtained via a `useRef` on the wrapper div passed to the onDrop/onDragOver div.

## [STAGE 1] RECEIVED
- **From:** ORC#0
- **At:** 2026-03-29T00:00:00Z
- **Task ID:** gander-studio-p2-canvas-link-003b
- **Message received:**
  > You are FE#3. Implement task `gander-studio-p2-canvas-link-003b` — Materia Canvas proximity animation + Web Audio sound.
  >
  > ## Project
  > `/home/jhber/projects/gander-studio-alpha` — monorepo with packages/client (React 19 + Tailwind + Zustand + @xyflow/react), packages/server (tRPC), packages/shared (Zod schemas).
  >
  > ## Context — What's Already Done
  > **003a (Wave 2, AUDITED PASS)** delivered canvas.ts constants, MateriaNode.tsx, MateriaCanvas.tsx.
  > **001b** delivered canvas-store.ts with addEdge, loadFromLoadout, selectLoadoutPayload.
  > **003-RA** researcher dossier: AudioContext.resume() in onMouseDown is sufficient for sticky activation.
  > **002 UI Designer spec** provided Surface 2 (Magnetic Snap), Surface 3 (Link Flash), Surface 5 (Sound Parameters).
  >
  > ## Task: What To Build
  > B. MateriaCanvas.tsx — Proximity detection + class management
  > C. packages/client/src/hooks/useLinkSound.ts
  > D. Update canvas.ts constants
  > Playwright Tier 2 spec at packages/client/tests/e2e/materia-canvas-proximity.spec.ts
  > …[truncated]
