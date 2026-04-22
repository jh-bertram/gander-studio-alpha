# FE Output — p1-mc-FE-canvas-b

## Task
Build `MateriaCanvas.tsx` skeleton: static node rendering via @xyflow/react, orchestrator centered via `fitView`, drag sync back to canvas-store, CSS isolation.

## Files Written

| File | Lines | Notes |
|------|-------|-------|
| `packages/client/src/components/compose/MateriaCanvas.tsx` | 131 | Full skeleton implementation |
| `packages/client/src/tests/compose/materia-canvas.spec.ts` | 20 | Playwright Tier 2 smoke test |

## CSS Isolation Check
```
grep -n "xyflow" packages/client/src/globals.css  → (no output, exit 1 — clean)
grep -n "xyflow" packages/client/src/main.tsx     → (no output, exit 1 — clean)
```
`import '@xyflow/react/dist/style.css'` exists only in `MateriaCanvas.tsx`.

## Orchestrator Center Mechanism
The orchestrator `CanvasNode` is initialized at `position: { x: 0, y: 0 }` in canvas-store.
`<ReactFlow fitView>` runs on mount and computes a viewport transform so all initial nodes fit within the visible area. With only one node (the orchestrator at origin), `fitView` centers it precisely. As additional nodes are added in later tasks, `fitView` will not re-run (it's a mount-only prop), preserving user viewport position.

## Node Drag Sync
`handleNodesChange` wraps React Flow's `onNodesChange`. For every change in the batch where `change.type === 'position'` AND `change.dragging === false` (i.e., the drag ended), it calls `updateNodePosition(change.id, change.position)` on the canvas-store. This persists the final drop position so it survives store re-renders and loadout saves.

## tsc Output
(empty — clean compile, zero errors)

## Constant Audit
- No `rgba(15,15,15` matches
- No `3.28` conversion factor matches
- No raw hex values in `.tsx` file
- Edge stroke values use `EDGE_STROKE_COLOR` and `EDGE_STROKE_WIDTH` constants from `canvas.ts`
- Background color uses `var(--void)` CSS token

## Integration Status
MOCKED — `availableAgents`, `availableSkills`, and `isSaving` props are accepted but unused in this skeleton phase. They will be wired in canvas-c.
