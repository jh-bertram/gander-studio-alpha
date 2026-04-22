# ui_packet — gander-studio-p2-agent-cards-FE-002

## Files Modified

- `packages/client/src/components/compose/MateriaCanvas.tsx` (922 lines total; ~30 lines net new/changed)

## Checklist

- [x] CardNodeRenderer function exists in MateriaCanvas.tsx
- [x] NODE_TYPES has `card: CardNodeRenderer`
- [x] MateriaNodeData has `role?: AgentRole`
- [x] MateriaNodeRenderer passes `data.role` to MateriaNode (removed `isOrchestrator={data.name === 'orchestrator'}`)
- [x] toRFNode: orchestrator id → type: 'card', centered position (`x: cn.position.x - CARD_WIDTH_PX / 2`, `y: cn.position.y - CARD_HEIGHT_PX / 2`), draggable: false, selectable: false, zIndex: 0
- [x] toRFNode: all other nodes → type: 'materia', zIndex: Z_CANVAS_NODE, data.role populated, no isOrchestrator: true
- [x] No CardNode.tsx changes
- [x] No canvas-store.ts changes
- [x] npm run lint PASS (output below)

## npm run lint output

```
> lint
> tsc --noEmit --project packages/shared/tsconfig.json && tsc --noEmit --project packages/server/tsconfig.json && tsc --noEmit --project packages/client/tsconfig.json

(exit code 0 — zero errors)
```

## Position Formula Confirmed

Card node position formula:
```typescript
position: {
  x: cn.position.x - CARD_WIDTH_PX / 2,   // 0 - 900/2 = -450
  y: cn.position.y - CARD_HEIGHT_PX / 2,  // 0 - 700/2 = -350
}
```
The orchestrator's store position is `{ x: 0, y: 0 }` (canvas origin). Subtracting half the card dimensions centers the 900×700 card rectangle on the canvas origin, so materia orbs placed at positive and negative radii around the origin appear centered within the card.

## Changes Made

### 1. Imports added (lines 24-32)
```typescript
import { CardNode } from './CardNode';
import type { AgentRole } from '../../constants/agent-roles';
// In canvas.ts import block, added:
Z_CANVAS_NODE,
CARD_WIDTH_PX,
CARD_HEIGHT_PX,
```

### 2. MateriaNodeData updated
Added `role?: AgentRole` field.

### 3. MateriaNodeRenderer updated
Replaced `isOrchestrator={data.name === 'orchestrator'}` with `role={data.role}`.

### 4. CardNodeRenderer added
```typescript
function CardNodeRenderer(): React.ReactElement {
  return <CardNode />;
}
```

### 5. NODE_TYPES updated
```typescript
const NODE_TYPES: NodeTypes = {
  materia: MateriaNodeRenderer as React.ComponentType<NodeProps<Node>>,
  card: CardNodeRenderer as React.ComponentType<NodeProps<Node>>,
};
```

### 6. toRFNode refactored
- Added `const ORCHESTRATOR_ID = 'orchestrator'` constant (ORCHESTRATOR_ID is not exported from canvas-store.ts)
- Return type changed from `MateriaRFNode` to `Node` (union of card + materia)
- Orchestrator branch: type: 'card', centered position, draggable: false, selectable: false, zIndex: 0
- Other nodes: type: 'materia', zIndex: Z_CANVAS_NODE, data.role from cn.role
- useNodesState and OnNodesChange generics updated from `MateriaRFNode` to `Node`

## Constant Audit

- No raw hex values in modified file
- No rgba(15,15,15 matches
- No ft/m conversion matches
- JSON.parse at line 827: pre-existing, inside try/catch with shape validation — not introduced by this task
- No duplicate inline function bodies introduced

## e2e_spec

TIER_1_ONLY — this task registers a new node type and modifies an existing converter function; it does not create a new page or interactive surface. The card node visibility is covered by the existing `materia-canvas-proximity.spec.ts` load test, and the CardNode component itself was covered by FE-001b's spec.

## integration_status

SUCCESS — all changes are self-contained within MateriaCanvas.tsx. CardNode reads from canvas-store directly (no props). MateriaNode already accepted `role?: AgentRole` — no downstream changes needed. The `isOrchestrator` prop on MateriaNodeProps remains for backward safety but is never passed as `true` now.
