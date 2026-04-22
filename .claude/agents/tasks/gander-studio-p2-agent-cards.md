# Task Decomposition — gander-studio-p2-agent-cards (Revision 3)
**sprint:** gander-studio-p2-agent-cards
**generated:** 2026-04-01T01:15:00Z
**revision:** 3 (post CR#2 CRITIQUE_BLOCK — targeted fix: DS-001 compose.ts isolation, archivist reclassification, FE-003 dependency correction, FE-001b gate framing)
**agent_count:** 5 executing + 1 deferred

---

## DS-001 — Shared Schema Extension + Role Types

**task_id:** gander-studio-p2-agent-cards-DS-001
**assigned_to:** DS (Database/Schema Specialist)
**priority:** BLOCKER
**wave:** 1

### Description
Extend the shared Zod schemas and canvas-store types to support the card concept, 5-role
classification, and cardTitle state. Three files change plus one new file is created.
compose.ts is NOT touched by this task — leave it entirely alone.

### Exact changes required

**NEW file: `packages/client/src/constants/agent-roles.ts`**

Create this file as the single source of truth for agent name → role classification.
Both `deriveRole` (canvas-store.ts) and `getMateriaColor` (compose.ts) will import from here —
but the compose.ts import refactor is FE-001a's responsibility, not DS-001's.

```typescript
// ─────────────────────────────────────────────────────────────────────────────
// Agent role classification — single source of truth.
// Imported by deriveRole (canvas-store.ts) and getMateriaColor (compose.ts).
// ─────────────────────────────────────────────────────────────────────────────

export type AgentRole = 'meta' | 'specialist' | 'gate' | 'external' | 'skill';

// Agents that coordinate and direct; renders in meta yellow (--my)
export const META_AGENTS = new Set([
  'orchestrator',
  'project-manager',
  'dispatcher',
]);

// Agents that implement / build; renders in specialist green (--mg)
export const SPECIALIST_AGENTS = new Set([
  'backend-engineer',
  'frontend-engineer',
  'db-specialist',
  'archivist',
]);

// Agents that enforce quality gates; renders in gate red (--mr)
export const GATE_AGENTS = new Set([
  'auditor',
  'critic',
  'code-auditor',
  'system-health-monitor',
]);

// Agents that reach outside the codebase; renders in external purple (--mp)
export const EXTERNAL_AGENTS = new Set([
  'researcher',
  'statistician',
  'ui-designer',
]);

// Partial-name fragments for fallback classification (same order as above)
export const META_FRAGMENTS        = ['orchestrat', 'project-manag', 'dispatch'];
export const SPECIALIST_FRAGMENTS  = ['backend', 'frontend', 'db-spec', 'archiv'];
export const GATE_FRAGMENTS        = ['audit', 'critic', 'health'];
export const EXTERNAL_FRAGMENTS    = ['research', 'statist', 'ui-design'];
```

**`packages/shared/src/schemas.ts` — LoadoutSchema:**
Add one optional field:
```typescript
cardTitle: z.string().optional(),
```
This is backwards-compatible: existing saved loadout JSON files with no `cardTitle` key parse
without error (Zod treats missing optional fields as `undefined`).

**`packages/client/src/store/canvas-store.ts`:**

1. Import `AgentRole`, `META_AGENTS`, `SPECIALIST_AGENTS`, `GATE_AGENTS`, `EXTERNAL_AGENTS`,
   `META_FRAGMENTS`, `SPECIALIST_FRAGMENTS`, `GATE_FRAGMENTS`, `EXTERNAL_FRAGMENTS`
   from `../../constants/agent-roles`.

2. Update `CanvasNode` interface:
```typescript
export interface CanvasNode {
  id: string;
  name: string;
  type: 'agent' | 'skill';
  role: AgentRole;
  position: { x: number; y: number };
}
```

3. Add `deriveRole` helper function:
```typescript
function deriveRole(name: string, type: 'agent' | 'skill'): AgentRole {
  if (type === 'skill') return 'skill';
  const lower = name.toLowerCase();
  if (META_AGENTS.has(lower))       return 'meta';
  if (SPECIALIST_AGENTS.has(lower)) return 'specialist';
  if (GATE_AGENTS.has(lower))       return 'gate';
  if (EXTERNAL_AGENTS.has(lower))   return 'external';
  // Fallback: partial-name fragments
  if (META_FRAGMENTS.some((f) => lower.includes(f)))        return 'meta';
  if (SPECIALIST_FRAGMENTS.some((f) => lower.includes(f)))  return 'specialist';
  if (GATE_FRAGMENTS.some((f) => lower.includes(f)))        return 'gate';
  if (EXTERNAL_FRAGMENTS.some((f) => lower.includes(f)))    return 'external';
  return 'specialist'; // default fallback for unrecognised agent names
}
```

4. Update `INITIAL_ORCHESTRATOR` to include `role: 'meta'`:
```typescript
const INITIAL_ORCHESTRATOR: CanvasNode = {
  id: ORCHESTRATOR_ID,
  name: ORCHESTRATOR_ID,
  type: 'agent',
  role: 'meta',
  position: { x: 0, y: 0 },
};
```

5. Add `cardTitle` and `setCardTitle` to `CanvasState`:
```typescript
cardTitle: string;
setCardTitle: (title: string) => void;
```

6. In the store `create` call, initialize `cardTitle: 'The Orchestrator'` and wire `setCardTitle`.

7. Update `loadFromLoadout` to:
   - Accept the destructured `cardTitle` from the loadout (it may be `undefined` for old files).
   - Set `cardTitle: loadout.cardTitle ?? 'The Orchestrator'` via `set`.
   - Call `deriveRole(name, 'agent')` when constructing each `agentNode`.
   - Call `deriveRole(name, 'skill')` when constructing each `skillNode`.

8. Update `resetCanvas` to reset `cardTitle: 'The Orchestrator'` alongside nodes and edges.

9. `selectLoadoutPayload` — no changes needed (reads only type, not role).

### Success criteria
- `npm run lint` passes (tsc --noEmit across all packages, no type errors).
- `packages/client/src/constants/agent-roles.ts` exists with `AgentRole` type and all 4 agent Sets
  plus fragment arrays.
- `archivist` is in `SPECIALIST_AGENTS` (not `EXTERNAL_AGENTS`). `ui-designer` is in `EXTERNAL_AGENTS`.
- `CanvasNode` interface has `role: AgentRole` field.
- `LoadoutSchema` accepts both `{ name, agents, skills, hooks, createdAt, connections }` (old)
  and `{ ..., cardTitle: "My Team" }` (new) without Zod parse errors.
- `deriveRole('orchestrator', 'agent')` returns `'meta'`.
- `deriveRole('dispatcher', 'agent')` returns `'meta'`.
- `deriveRole('auditor', 'agent')` returns `'gate'`.
- `deriveRole('researcher', 'agent')` returns `'external'`.
- `deriveRole('archivist', 'agent')` returns `'specialist'`.
- `deriveRole('dispatch-task', 'skill')` returns `'skill'`.
- `deriveRole('backend-engineer', 'agent')` returns `'specialist'`.
- `useCanvasStore.getState().cardTitle` initializes to `'The Orchestrator'`.
- `getMateriaColor('dispatcher', 'agent')` returns `var(--mp)` (unchanged from current — confirms
  compose.ts was NOT modified by DS-001).
- `getMateriaColor('orchestrator', 'agent')` returns `var(--my)` (unchanged from current — confirms
  compose.ts was NOT modified by DS-001).
- After DS-001, no component in the app gets a different orb color than before DS-001 ran.
- `packages/client/src/constants/compose.ts` is byte-for-byte identical to its state before DS-001.
- `npm run lint` passes after all changes.

### Context files
- `packages/shared/src/schemas.ts`
- `packages/client/src/store/canvas-store.ts`
- `packages/client/src/constants/canvas.ts` (reference only — do not modify)

### Dependencies
None. Wave 1.

### Out of scope
- Do NOT modify `packages/client/src/constants/compose.ts` in any way — not a single character.
  getMateriaColor changes and the compose.ts import refactor are exclusively FE-001a's responsibility.
- Do NOT change MateriaCanvas.tsx, MateriaNode.tsx, or any component files.
- Do NOT add any new tRPC endpoints.
- Do NOT modify LoadoutSchema's `agents`, `skills`, `hooks`, or `connections` array shapes.
- Do NOT add `CARD_*` constants to canvas.ts — that is FE-001a.
- Do NOT update getMateriaColor to accept a role param — that is FE-001a.

### Output expected
- tag: `data_packet`
- must_contain:
  - `agent-roles.ts` new file path and contents
  - `archivist` in SPECIALIST_AGENTS confirmed
  - updated `CanvasNode` interface with `role: AgentRole`
  - updated `LoadoutSchema` with `cardTitle?: string`
  - `deriveRole` helper in canvas-store.ts
  - `cardTitle` / `setCardTitle` in store state
  - confirmation that compose.ts was NOT modified (file hash or "no changes" statement)
  - `npm run lint` PASS confirmation
- must_not_contain:
  - any changes to compose.ts
  - changes to component files
  - new npm packages
  - getMateriaColor signature change (that is FE-001a)

---

## FE-001a — Shared Constants + getMateriaColor Role Param + MateriaNode Role Prop + compose.ts Import Refactor

**task_id:** gander-studio-p2-agent-cards-FE-001a
**assigned_to:** FE (Frontend Engineer)
**priority:** HIGH
**wave:** 2

### Description
Four changes across four files. Estimated ~22 lines for the original three changes plus ~15 lines
for the compose.ts import refactor (replacing 5 local Set declarations with imports from
agent-roles.ts and adding the role-based fast-path to getMateriaColor). Total ~37 lines — within
the 50-line gate.

This task must complete before FE-001b (which needs the role type from canvas-store) and before
FE-003 (which calls getMateriaColor with a role parameter).

### Exact changes required

**1. `packages/client/src/constants/canvas.ts` — add 4 card constants:**
```typescript
export const CARD_WIDTH_PX = 900;
export const CARD_HEIGHT_PX = 700;
export const CARD_HEADER_HEIGHT_PX = 36;
export const CARD_BORDER_RADIUS_PX = 8;
```
Add after the existing orb-dimension constants section. These are the authoritative numeric values
for the CardNode component — never use raw numbers in CardNode.tsx.

**2. `packages/client/src/constants/compose.ts` — two changes in one edit:**

First, replace the 5 local Set declarations with imports from `agent-roles.ts`, and add a
role-based fast path to getMateriaColor.

Remove these 5 lines entirely:
```typescript
const COMMAND_AGENTS = new Set(['orchestrator', 'project-manager']);
const IMPL_AGENTS    = new Set(['backend-engineer', 'frontend-engineer', 'db-specialist']);
const GATE_AGENTS    = new Set(['auditor', 'critic', 'code-auditor']);
const INTEL_AGENTS   = new Set(['researcher', 'statistician', 'archivist']);
const META_AGENTS    = new Set(['dispatcher', 'ui-designer', 'system-health-monitor']);
```

Add these imports at the top of the file:
```typescript
import type { AgentRole } from '../constants/agent-roles';
import {
  META_AGENTS as COMMAND_AGENTS,
  SPECIALIST_AGENTS as IMPL_AGENTS,
  GATE_AGENTS,
  EXTERNAL_AGENTS as INTEL_AGENTS,
  META_AGENTS,
  META_FRAGMENTS,
  SPECIALIST_FRAGMENTS,
  GATE_FRAGMENTS,
  EXTERNAL_FRAGMENTS,
} from '../constants/agent-roles';
```

IMPORTANT — aliasing rationale for the name-based fallback path:
- `META_AGENTS as COMMAND_AGENTS`: agent-roles.ts META_AGENTS = {orchestrator, project-manager,
  dispatcher}. The old COMMAND_AGENTS = {orchestrator, project-manager}. With the role fast-path
  in place (see below), the name-based fallback path is only reached when `role` is undefined.
  Dispatcher will now hit COMMAND_AGENTS in the fallback path → returns var(--my). This is the
  correct new behavior (dispatcher is 'meta' → yellow). The old purple behavior for dispatcher
  was the legacy classification; the new 5-role system makes dispatcher meta/yellow.
- `EXTERNAL_AGENTS as INTEL_AGENTS`: agent-roles.ts EXTERNAL_AGENTS = {researcher, statistician,
  ui-designer} (archivist is now in SPECIALIST_AGENTS). The old INTEL_AGENTS = {researcher,
  statistician, archivist}. In the fallback path, archivist no longer hits INTEL_AGENTS → it
  falls through to the fragment fallback → matches 'archiv' in SPECIALIST_FRAGMENTS → returns
  var(--mg). This is the correct new behavior (archivist is 'specialist' → green). ui-designer
  now hits INTEL_AGENTS → returns var(--mb). This changes ui-designer's fallback color from
  var(--mp) to var(--mb) — but since all callers that have role data will use the fast-path,
  the fallback is only hit for callers without role. The fast-path for 'external' returns var(--mp)
  which is correct for ui-designer.
- `GATE_AGENTS` (direct import): agent-roles.ts GATE_AGENTS includes system-health-monitor.
  In the fallback path, system-health-monitor now hits GATE_AGENTS → var(--mr). Again, callers
  with role data use the fast-path (system-health-monitor → 'gate' → var(--mr)) which is
  consistent. Only legacy callers without role hit the fallback.

Then, update getMateriaColor to add the role-based fast path and the optional role parameter:

```typescript
export function getMateriaColor(
  name: string,
  type: 'agent' | 'skill' | 'hook',
  role?: AgentRole,
): string {
  // Role-based fast path — when role is provided, skip name-hashing entirely
  if (role !== undefined) {
    switch (role) {
      case 'meta':       return 'var(--my)';
      case 'specialist': return 'var(--mg)';
      case 'gate':       return 'var(--mr)';
      case 'external':   return 'var(--mp)';
      case 'skill':      return 'var(--mb)';
    }
  }
  // Fallback: existing name-based logic (backwards-compatible — all callers without role still work)
  if (type === 'skill') return 'var(--mb)';
  if (type === 'hook')  return 'var(--mo)';

  const lower = name.toLowerCase();
  if (COMMAND_AGENTS.has(lower)) return 'var(--my)';
  if (IMPL_AGENTS.has(lower))    return 'var(--mg)';
  if (GATE_AGENTS.has(lower))    return 'var(--mr)';
  if (INTEL_AGENTS.has(lower))   return 'var(--mb)';
  if (META_AGENTS.has(lower))    return 'var(--mp)';

  // Fallback: match by partial name fragments
  if (META_FRAGMENTS.some((f) => lower.includes(f)))        return 'var(--my)';
  if (SPECIALIST_FRAGMENTS.some((f) => lower.includes(f)))  return 'var(--mg)';
  if (GATE_FRAGMENTS.some((f) => lower.includes(f)))        return 'var(--mr)';
  if (EXTERNAL_FRAGMENTS.some((f) => lower.includes(f)))    return 'var(--mb)';

  return 'var(--wm)';
}
```

Note: The fragment fallback section replaces the old inline-string fragment checks with array
imports from agent-roles.ts. The META_AGENTS import (un-aliased) is needed for the final Set
check (the old `META_AGENTS` check for dispatcher/ui-designer/system-health-monitor). Since
these agents now have correct role data from canvas-store, the fast-path will serve them before
the fallback is reached.

**3. `packages/client/src/components/compose/MateriaNode.tsx` — add optional role prop:**
Add `role?: AgentRole` to `MateriaNodeProps`:
```typescript
import type { AgentRole } from '../../constants/agent-roles';

interface MateriaNodeProps {
  name: string;
  type: 'agent' | 'skill';
  role?: AgentRole;
  isOrchestrator?: boolean;
  onRemove?: () => void;
  className?: string;
}
```
Pass `role` through to `getMateriaColor`:
```typescript
'--orb-color': getMateriaColor(name, type, role),
```
No other changes to MateriaNode.tsx.

### Success criteria
- `npm run lint` passes.
- `CARD_WIDTH_PX`, `CARD_HEIGHT_PX`, `CARD_HEADER_HEIGHT_PX`, `CARD_BORDER_RADIUS_PX` exist in
  `canvas.ts` and are exported.
- `getMateriaColor` accepts an optional third parameter `role?: AgentRole` and returns the correct
  CSS var for each role value:
  - `getMateriaColor('x', 'agent', 'meta')` → `'var(--my)'`
  - `getMateriaColor('x', 'agent', 'specialist')` → `'var(--mg)'`
  - `getMateriaColor('x', 'agent', 'gate')` → `'var(--mr)'`
  - `getMateriaColor('x', 'agent', 'external')` → `'var(--mp)'`
  - `getMateriaColor('x', 'skill', 'skill')` → `'var(--mb)'`
  - `getMateriaColor('orchestrator', 'agent')` (no role) → `'var(--my)'` (backwards compat)
- compose.ts has no locally-declared Sets for agent names (all imported from agent-roles.ts).
- `MateriaNodeProps` has optional `role?: AgentRole` without TS errors.
- No raw hex values added to any file in this task.

### Context files
- `packages/client/src/constants/canvas.ts`
- `packages/client/src/constants/compose.ts`
- `packages/client/src/components/compose/MateriaNode.tsx`
- `packages/client/src/constants/agent-roles.ts` (created in DS-001 — reference for AgentRole type
  and all exported Sets/fragments)

### Dependencies
- `gander-studio-p2-agent-cards-DS-001` (AgentRole type and all Sets/fragments must exist in agent-roles.ts)

### Out of scope
- Do NOT create CardNode.tsx — that is FE-001b.
- Do NOT modify MateriaCanvas.tsx — that is FE-002.
- Do NOT change the LoadoutListPanel — that is FE-003.
- Do NOT add new npm packages.
- Do NOT change any file other than canvas.ts, compose.ts, MateriaNode.tsx, and (import side only)
  agent-roles.ts.

### Output expected
- tag: `ui_packet`
- must_contain:
  - CARD_WIDTH_PX, CARD_HEIGHT_PX, CARD_HEADER_HEIGHT_PX, CARD_BORDER_RADIUS_PX in canvas.ts
  - getMateriaColor updated signature with role fast-path
  - compose.ts local Set declarations replaced with imports from agent-roles.ts
  - MateriaNode role prop added
  - npm run lint PASS
- must_not_contain:
  - CardNode.tsx creation
  - modifications to MateriaCanvas.tsx
  - inline hex values
  - locally-declared agent name Sets in compose.ts

---

## FE-001b — CardNode Component + Playwright Spec

**task_id:** gander-studio-p2-agent-cards-FE-001b
**assigned_to:** FE (Frontend Engineer)
**priority:** HIGH
**wave:** 3

### Description
Create the `CardNode` React component — the rectangular panel that replaces the orchestrator orb
as the canvas surface. Also create the Playwright e2e spec for the inline title edit interaction.

Estimated: ~55 lines in CardNode.tsx + ~40 lines in spec = ~95 total new lines in one commit.
This exceeds the 50-line gate. Per standards.md, the required verification gate for commits over
50 lines is a gate pass before the commit. `npm run lint` (tsc --noEmit) constitutes the required
verification gate pass for this commit. The agent MUST run `npm run lint` before emitting the
ui_packet — this satisfies the verification gate requirement per standards.md.

### Exact changes required

**NEW file: `packages/client/src/components/compose/CardNode.tsx`**

CardNode is a rectangular panel rendered as a React Flow node. Key requirements:

Visual:
- Outer div: `data-testid="card-node"`, dimensions from `CARD_WIDTH_PX` × `CARD_HEIGHT_PX` constants.
  Background: `var(--sfm)`. Border: `1px solid var(--bdb)`. Border-radius from `CARD_BORDER_RADIUS_PX`.
- Header bar at top: fixed height from `CARD_HEADER_HEIGHT_PX`. Background: `var(--sf)`.
  Contains an editable title.
- Title in header: displays in `var(--my)` (yellow). Prefix with a crown glyph (Unicode ♛ or ★ —
  use a text character, not an image or SVG, to avoid a11y complexity).
- The card node is NOT draggable and NOT selectable (React Flow `draggable={false}` on the wrapper).
- The card node has NO remove button.

Inline title editing:
- Title renders as a `<span>` by default showing `cardTitle` from canvas store.
- On click, replace the `<span>` with a controlled `<input>` pre-filled with the current cardTitle.
- On `blur` or `Enter` keypress, call `setCardTitle(newValue)` and return to span display.
- On `Escape`, cancel the edit without changing the stored title.
- The input must have `aria-label="Edit card title"`.
- The span must have `data-testid="card-title-display"`.
- The input must have `data-testid="card-title-input"`.

All numeric values (widths, heights, border-radius) must come from named constants in canvas.ts.
No raw pixel values inline. Use `CARD_WIDTH_PX`, `CARD_HEIGHT_PX`, `CARD_HEADER_HEIGHT_PX`,
`CARD_BORDER_RADIUS_PX`.

Colors: use only CSS custom property vars (`var(--sfm)`, `var(--sf)`, `var(--bdb)`, `var(--my)`).
No raw hex values. No raw rgba() calls (all rgba usages must be documented approved exceptions in
canvas.ts comments).

**Pre-submission self-check (mandatory before submitting this task):**
Run the following grep and verify every match is interpolated from a named constant:
```
grep -nP '\d+px|\d+\.\d+|rgba\(' packages/client/src/components/compose/CardNode.tsx
```
Any match that is NOT from a named constant from canvas.ts is a blocker. Do not submit until clean.

**NEW file: `packages/client/tests/e2e/card-node-title-edit.spec.ts`**

Three tests:

1. `'card node is visible on canvas'`
   - Navigate to compose page.
   - Wait for `[data-testid="materia-canvas"]` to be visible.
   - Assert `[data-testid="card-node"]` is visible.

2. `'inline title edit: click → type → blur → title persisted'`
   - Navigate to compose page and wait for canvas.
   - Click `[data-testid="card-title-display"]`.
   - Assert `[data-testid="card-title-input"]` is visible.
   - Clear input and type `'My Test Team'`.
   - Click elsewhere to trigger blur (click canvas background or `[data-testid="materia-canvas"]`).
   - Assert `[data-testid="card-title-display"]` is visible and has text `'My Test Team'`.
   - Assert `[data-testid="card-title-input"]` is not visible.

3. `'no JS errors during title edit'`
   - Attach `page.on('pageerror', ...)` error collector.
   - Navigate to compose page and wait for canvas.
   - Click `[data-testid="card-title-display"]`.
   - Type `'Error Test'`.
   - Press `Escape` to cancel.
   - Assert title display returns to previous value (not `'Error Test'`).
   - Assert no JS errors collected.

### Success criteria
- `npm run lint` (tsc --noEmit) passes — this is the required verification gate for this commit
  and MUST be run before emitting the ui_packet. Include lint output in the packet.
- `packages/client/src/components/compose/CardNode.tsx` exists.
- CardNode renders a rectangle with `data-testid="card-node"`, `CARD_WIDTH_PX` × `CARD_HEIGHT_PX`
  dimensions, header bar, and editable title.
- Self-grep for raw numerics is clean: `grep -nP '\d+px|\d+\.\d+|rgba\(' CardNode.tsx` returns no
  inline literals that are not named constants.
- `packages/client/tests/e2e/card-node-title-edit.spec.ts` exists with the 3 tests above.
- Spec references `data-testid="card-node"`, `data-testid="card-title-display"`,
  `data-testid="card-title-input"`.
- No raw hex values in CardNode.tsx.

### Context files
- `packages/client/src/constants/canvas.ts` (for CARD_* constants added in FE-001a)
- `packages/client/src/store/canvas-store.ts` (for cardTitle / setCardTitle interface)
- `packages/client/src/globals.css` (color token reference: --sfm, --sf, --bdb, --my, --void)
- `packages/client/src/constants/agent-roles.ts` (reference for AgentRole type)
- `packages/client/tests/e2e/loadout-list-panel.spec.ts` (reference for Playwright patterns)

### Dependencies
- `gander-studio-p2-agent-cards-FE-001a` (CARD_* constants must exist in canvas.ts)

### Out of scope
- Do NOT modify MateriaCanvas.tsx — card registration in React Flow is FE-002.
- Do NOT change the LoadoutListPanel — that is FE-003.
- Do NOT add new npm packages.
- CardNode does not need to handle drag in this sprint (it is non-draggable).
- Do NOT implement multi-card support.

### Output expected
- tag: `ui_packet`
- must_contain:
  - CardNode.tsx file path
  - data-testid="card-node" on outermost div confirmed
  - self-grep result (must show no raw numeric literals)
  - card-node-title-edit.spec.ts file path with 3 test names listed
  - npm run lint PASS (with lint output included — this is the gate pass)
- must_not_contain:
  - inline hex values
  - raw px/rgba literals in CardNode.tsx outside named constants
  - modifications to MateriaCanvas.tsx

---

## FE-002 — MateriaCanvas Layout Redesign

**task_id:** gander-studio-p2-agent-cards-FE-002
**assigned_to:** FE (Frontend Engineer)
**priority:** HIGH
**wave:** 4

### Description
Redesign `MateriaCanvas.tsx` to implement the card-as-background-surface layout. The orchestrator
orb is replaced by the CardNode. All other orbs are positioned inside the card bounds.
Proximity linking is preserved.

### Exact changes required

**MateriaCanvas.tsx changes:**

1. **Register `CardNode` as a React Flow node type:**
   Add `'card'` to `NODE_TYPES`:
   ```typescript
   const NODE_TYPES: NodeTypes = {
     materia: MateriaNodeRenderer as React.ComponentType<NodeProps<Node>>,
     card: CardNodeRenderer as React.ComponentType<NodeProps<Node>>,
   };
   ```
   Create `CardNodeRenderer` function (similar to `MateriaNodeRenderer`) that renders `CardNode`
   with the canvas store's `cardTitle`.

2. **Replace orchestrator orb with card node in `toRFNode`:**
   When a `CanvasNode` has `id === 'orchestrator'`, emit a React Flow node with `type: 'card'`
   instead of `type: 'materia'`. The card RF node position is:
   `{ x: cn.position.x - CARD_WIDTH_PX/2, y: cn.position.y - CARD_HEIGHT_PX/2 }`
   so the card is centered on the store's (0,0) orchestrator position.
   The card node must have `draggable: false` and `selectable: false`.

3. **Z-index:** Card RF node uses `zIndex: 0`. Orb RF nodes use `zIndex: Z_CANVAS_NODE` (10).

4. **No auto-edge to orchestrator:** The existing store's `addNode` does not auto-create edges —
   confirmed by reading canvas-store.ts. No change needed. Edges connect orb nodes only.

5. **Pass `role` to MateriaNodeRenderer:** The `MateriaNodeData` type currently has
   `{ name, nodeType, onRemove? }`. Add `role?: AgentRole` to it. In `toRFNode`, populate
   `data.role` from `cn.role`. In `MateriaNodeRenderer`, pass `data.role` to `MateriaNode`.

6. **Stop passing `isOrchestrator: true`:** Since the orchestrator is now a CardNode, no
   `MateriaNode` will have `isOrchestrator=true`. Update `toRFNode` to never pass
   `isOrchestrator: true` to materia nodes. The `isOrchestrator` prop remains on `MateriaNodeProps`
   for backwards safety but will simply never be true.

7. **Imports:** Import `CardNode` from `./CardNode`. Import `CARD_WIDTH_PX`, `CARD_HEIGHT_PX`
   from `../../constants/canvas`. Import `AgentRole` from `../../constants/agent-roles`.

### Success criteria
- `npm run lint` passes.
- The canvas renders a large rectangular CardNode centered in viewport on first load.
- Orb nodes render on top of the card visually (Z_CANVAS_NODE=10 > card zIndex=0).
- No orchestrator orb is rendered (no `MateriaNode` with `isOrchestrator=true`).
- Drag-to-position still works for orb nodes.
- Proximity linking (drop-on-top) still works between orb nodes.
- `data-testid="materia-canvas"` still present on the outer canvas wrapper (no regression).
- On initial load, all non-card orbs (at ring radii 220px agents, 380px skills) are visually
  contained within the card boundaries (card spans ±450px in X, ±350px in Y from center).
  Verify via Playwright screenshot assertion or human E2E check at Step 4.5.
- `npm run lint` passes (tsc --noEmit, strict mode).

### Context files
- `packages/client/src/components/compose/MateriaCanvas.tsx`
- `packages/client/src/components/compose/CardNode.tsx` (created in FE-001b)
- `packages/client/src/store/canvas-store.ts` (for CanvasNode shape with role and cardTitle)
- `packages/client/src/constants/canvas.ts` (for CARD_WIDTH_PX, CARD_HEIGHT_PX, Z_CANVAS_NODE)
- `packages/client/src/constants/agent-roles.ts` (for AgentRole type)

### Dependencies
- `gander-studio-p2-agent-cards-DS-001`
- `gander-studio-p2-agent-cards-FE-001a`
- `gander-studio-p2-agent-cards-FE-001b`

### Out of scope
- Do NOT rewrite the proximity linking logic — preserve it exactly as-is.
- Do NOT change the sound hooks (useLinkSound).
- Do NOT modify the Palette sidebar.
- Do NOT implement multi-card support.
- LoadoutListPanel is NOT modified in this task — FE-003 handles it.
- Do NOT change packages/shared or packages/server.

### Output expected
- tag: `ui_packet`
- must_contain:
  - updated MateriaCanvas.tsx
  - card RF node registration with CardNodeRenderer
  - role passed to MateriaNodeRenderer data
  - card centered at origin (position formula confirmed)
  - zIndex: 0 for card, Z_CANVAS_NODE for orbs
  - npm run lint PASS
- must_not_contain:
  - multi-card logic
  - changes to canvas-store.ts
  - changes to CardNode.tsx beyond importing it
  - isOrchestrator: true being passed to any materia node

---

## FE-003 — LoadoutListPanel Rewrite + E2E Spec Update

**task_id:** gander-studio-p2-agent-cards-FE-003
**assigned_to:** FE (Frontend Engineer)
**priority:** HIGH
**wave:** 5

### Description
Rewrite the `LoadoutListPanel` component (co-located inside `MateriaCanvas.tsx`) to eliminate the
duplicate-skill bug and implement the new 5-role structure. Update the Playwright e2e spec
`loadout-list-panel.spec.ts` — the final spec must be >= 73 lines (the current spec line count).

### Exact new structure for LoadoutListPanel

```
[Card Header row — non-clickable, shows cardTitle in meta yellow, role dot: var(--my)]
  [Agent 1 row — role dot: specialist var(--mg) or gate var(--mr) etc, indented 0]
    [Skill A row — role dot: skill var(--mb), indented LIST_CHILD_INDENT_PX = 24px]
    [Skill B row — indented, only if connected to Agent 1]
  [Agent 2 row]
    [Skill A row — appears again here if also connected to Agent 2 — intentional]
  [Unconnected skills section — skills with no agent connections]
    [Skill C row — no agent connections, shown flat with role dot var(--mb)]
```

### Exact tree-builder logic

1. Find the card node (id === 'orchestrator') — show as non-interactive header with
   `aria-label="Card: {cardTitle}"`. This row must NOT have `role="button"`.
2. For each non-orchestrator agent node: find all skill nodes connected to it via edges.
   Show them as children (indented `LIST_CHILD_INDENT_PX`).
3. Find skill nodes with zero edge connections — show as unconnected section at bottom.
4. Skills connected to agents appear under those agents but NOT additionally as orphan entries.
5. A skill connected to two agents appears under each (intentional — shows the user which
   agents use that skill).

### Color logic
Use `getMateriaColor(node.name, node.type, node.role)` everywhere for dot colors. This requires
`CanvasNode.role` (from DS-001) and the updated `getMateriaColor` (from FE-001a).

### Panel heading
Change the panel heading text from "Canvas Nodes" (or whatever it currently says) to "Loadout".

### E2E spec update — `packages/client/tests/e2e/loadout-list-panel.spec.ts`

The existing 3 tests (73 lines) must be updated and extended:

**Update existing tests (do not delete — update):**
- Test 1 ("loadout list panel is visible"): Replace the orchestrator row check:
  - Remove: `aria-label="Select orchestrator on canvas"` locator
  - Replace with: card header row check — `panel.locator('[aria-label^="Card:"]')` is visible
- Test 2 ("clicking a list panel row"): Replace the orchestrator row click:
  - The card header row is NOT a button (must not be clicked as a button)
  - Instead: locate the first agent row with `[role="button"]` and click that
- Test 3 ("keyboard nav"): Keep the `[role="button"]` first-row focus — this now finds the
  first agent row (not the card header, which is not a button)

**Add 3 new tests (required — brings spec line count above 73):**
- Test 4: `'card header row is not interactive'`
  - Navigate to compose page, wait for panel.
  - Assert panel has a row matching `[aria-label^="Card:"]`.
  - Assert that row does NOT have `role="button"`.
  - Assert that row does NOT have `aria-label="Select orchestrator on canvas"`.
- Test 5: `'agent rows appear as roots and connected skills as children'`
  - Load a loadout that has at least one agent and one connected skill (use `page.evaluate` to
    inject into canvas store, or load a known fixture). If fixture injection is complex, the test
    may use: navigate, add an agent and skill via UI, link them, then check the panel tree.
  - Assert at least one `[role="button"]` row exists (agent row).
  - Assert at least one indented child row exists when a connection is present.
  - (If test setup is too complex, assert that the panel renders with a flat structure when no
    loadout is loaded and the card header row is present — minimum viable assertion.)
- Test 6: `'unconnected skills section renders'`
  - Navigate to compose page, wait for panel.
  - Assert panel renders without JS errors (error collector pattern from test 2).
  - Assert `[data-testid="loadout-list-panel"]` is still visible after render.
  - Assert the panel does not contain `aria-label="Select orchestrator on canvas"` anywhere.

Final spec must be >= 73 lines total.

### Success criteria
- `npm run lint` passes.
- LoadoutListPanel renders a card header row with `aria-label="Card: The Orchestrator"` by default.
- Card header row does NOT have `role="button"`.
- Skills connected to multiple agents appear once per agent, not as additional orphan entries.
- Skills with zero connections appear in an unconnected section at the bottom.
- Dot colors: meta → var(--my), specialist → var(--mg), gate → var(--mr), external → var(--mp),
  skill → var(--mb) — matching role from getMateriaColor(name, type, role).
- Panel heading text is "Loadout" (not "Canvas Nodes").
- `packages/client/tests/e2e/loadout-list-panel.spec.ts` updated: no reference to
  `aria-label="Select orchestrator on canvas"` in any test.
- Spec file line count >= 73 (confirm before submitting).
- `data-testid="loadout-list-panel"` still present on panel wrapper.
- `npm run lint` passes.

### Context files
- `packages/client/src/components/compose/MateriaCanvas.tsx` (LoadoutListPanel defined here)
- `packages/client/src/store/canvas-store.ts` (for cardTitle selector, CanvasNode with role)
- `packages/client/src/constants/canvas.ts` (for LIST_* constants including LIST_CHILD_INDENT_PX)
- `packages/client/src/constants/compose.ts` (for getMateriaColor updated 3-param signature)
- `packages/client/tests/e2e/loadout-list-panel.spec.ts` (update this spec — current: 73 lines)

### Dependencies
- `gander-studio-p2-agent-cards-DS-001`
- `gander-studio-p2-agent-cards-FE-001a`
- `gander-studio-p2-agent-cards-FE-002`

### Out of scope
- Do NOT change the canvas layout — FE-002 handled that.
- Do NOT modify packages/shared or packages/server.
- Do NOT add a title-edit UI to the list panel — cardTitle editing is in CardNode header (FE-001b).
- Do NOT add the "unconnected agents" section — all non-orchestrator agents are shown flat.

### Output expected
- tag: `ui_packet`
- must_contain:
  - rewritten LoadoutListPanel (in MateriaCanvas.tsx)
  - card header row with aria-label="Card: {cardTitle}" and no role="button"
  - role-based dot colors using getMateriaColor(name, type, role)
  - updated e2e spec (no aria-label="Select orchestrator on canvas" anywhere)
  - spec line count >= 73 confirmed
  - npm run lint PASS
- must_not_contain:
  - `aria-label="Select orchestrator on canvas"` in spec or component
  - duplicate skill orphan entries
  - changes to canvas layout (MateriaCanvas RF node logic)

---

## DEFERRED-001 — Appearance Config File

**task_id:** gander-studio-p2-agent-cards-DEFERRED-001
**assigned_to:** (not dispatched this sprint)
**priority:** NORMAL
**status:** DEFERRED — human confirmed deferral (HCG-1 resolution, 2026-04-01)

### Reason for deferral
This feature requires: (a) a new JSON config file in the project root, (b) server-side file read
in `router.ts`, (c) a new tRPC endpoint `config.appearance` (GET), (d) client-side hook to fetch
and apply config values over `canvas.ts` constants at runtime. This is fully orthogonal to the
visual redesign. The human has explicitly confirmed deferral.

Tracked in `docs/deferred-work.md` under the gander-studio-p2-agent-cards sprint heading.

### What this task will do (when scheduled)
- Create `appearance.config.json` at project root exposing key visual constants from `canvas.ts`
- Add `config.appearance` GET procedure to `router.ts` — reads and parses the JSON file
- Add tRPC query hook on client
- On app init, merge server-returned config over the default constants

---

## Dependency order

DS-001 → FE-001a → FE-001b → FE-002 → FE-003

Note: FE-001b and FE-002 are independent of each other (FE-001b does not block FE-002 beyond the
wave ordering — FE-002 depends on FE-001b because it imports CardNode.tsx). FE-003 depends on
FE-002 (wave 4) and DS-001 + FE-001a, but NOT on FE-001b directly.

DEFERRED-001: not in execution order.
