# Task Registry — Gander Studio

Last updated: 2026-03-30T00:05:00Z

---

## Sprint: gander-studio-p2-agent-cards

**Goal:** Materia Canvas redesign — orchestrator orb becomes rectangular CardNode, orbs positioned freely on card surface, role-based color coding, LoadoutListPanel rewrite (no duplicates), cardTitle persistence.

### Rollback Point
commit: db20a9e93719e054921f2c7a7e39d2652402f6ef
recorded: 2026-03-30T00:05:00Z
task_id: gander-studio-p2-agent-cards
To recover: git -C /home/jhber/projects/gander-studio-alpha reset --hard db20a9e93719e054921f2c7a7e39d2652402f6ef

### Expectation Manifest

| Task | Agent | Wave | Priority | Status | Blocks |
|---|---|---|---|---|---|
| gander-studio-p2-agent-cards-DS-001 | DS#1 | 1 | BLOCKER | PENDING | FE-001, FE-002, FE-003 |
| gander-studio-p2-agent-cards-FE-001 | FE#1 | 2 | HIGH | PENDING | FE-002, FE-003 |
| gander-studio-p2-agent-cards-FE-002 | FE#2 | 3 | HIGH | PENDING | FE-003 |
| gander-studio-p2-agent-cards-FE-003 | FE#3 | 4 | HIGH | PENDING | NONE |
| gander-studio-p2-agent-cards-DEFERRED-001 | — | deferred | NORMAL | DEFERRED | — |

### Receipt checks (PM manifest)

**DS-001 receipt check:**
- `CanvasNode` interface has `role: 'meta' | 'specialist' | 'skill'` field
- `LoadoutSchema` has `cardTitle: z.string().optional()`
- `deriveRole` helper function is present in canvas-store.ts
- `cardTitle` and `setCardTitle` are in CanvasState
- `npm run lint` PASS confirmed in packet

**FE-001 receipt check:**
- `CardNode.tsx` exists at `packages/client/src/components/compose/CardNode.tsx`
- `CARD_WIDTH_PX`, `CARD_HEIGHT_PX`, `CARD_HEADER_HEIGHT_PX`, `CARD_BORDER_RADIUS_PX` added to canvas.ts
- `getMateriaColor` has optional `role` param and returns correct color per role
- `MateriaNode` has optional `role` prop
- No modifications to MateriaCanvas.tsx
- `npm run lint` PASS confirmed

**FE-002 receipt check:**
- `card` node type registered in `NODE_TYPES`
- Orchestrator CanvasNode rendered as `type: 'card'` RF node, not `type: 'materia'`
- Card RF node has `draggable: false`, `zIndex: 0`
- Orb nodes pass `role` through to MateriaNode
- `data-testid="materia-canvas"` still present
- Proximity linking still functional (no regression)
- `npm run lint` PASS confirmed

**FE-003 receipt check:**
- Card header row rendered with `aria-label="Card: The Orchestrator"` (or matching pattern)
- `aria-label="Select orchestrator on canvas"` NOT present in spec or component
- Skill connected to 2 agents appears under both agents (not as orphan)
- Skill with zero connections in unconnected section
- Panel heading updated from "Canvas Nodes"
- `data-testid="loadout-list-panel"` still present
- `packages/client/tests/e2e/loadout-list-panel.spec.ts` updated
- `npm run lint` PASS confirmed

### Key design decisions
- Orchestrator node stays in canvas-store as `id: 'orchestrator'`, `type: 'agent'` — only the React Flow render type changes to `'card'`
- Ring initialization (220px agents, 380px skills) retained in canvas-store — positions fall within card bounds (card 900×700)
- CardNode is non-draggable in this sprint (single card fills canvas)
- getMateriaColor role param is optional — all existing callers continue working without change
- Appearance config file (item 5) deferred to standalone sprint

---

## Sprint: gander-studio-p2-canvas-link

### Rollback Point
commit: db20a9e
recorded: 2026-03-28T00:20:00Z
task_id: gander-studio-p2-canvas-link
To recover: git -C /home/jhber/projects/gander-studio-alpha reset --hard db20a9e

### Expectation Manifest

| Task | Agent | Wave | Status | Blocks |
|---|---|---|---|---|
| gander-studio-p2-canvas-link-001a | BE#1 | 1 | DISPATCHED | 001b |
| gander-studio-p2-canvas-link-002 | UI#1 | 1 | DISPATCHED | 003a |
| gander-studio-p2-canvas-link-003-RA | RA#1 | 1 | DISPATCHED | 003b |
| gander-studio-p2-canvas-link-001b | FE#1 | 2 | PENDING | 003c |
| gander-studio-p2-canvas-link-003a | FE#2 | 2 | PENDING | 003b |
| gander-studio-p2-canvas-link-003b | FE#3 | 3 | PENDING | 003c |
| gander-studio-p2-canvas-link-003c | FE#4 | 4 | PENDING | NONE |

### Human Confirmation Gate HCG-1
- **Status:** RESOLVED 2026-03-28
- **Answer:** TREE — agents as root items, connected peers as indented children
- **003c brief must specify:** LoadoutListPanel renders agents as expandable/visible root rows; their connected peers appear as indented child rows beneath them (16px additional left-padding per spec Surface 4 tree_indent)

---

## Sprint: gander-studio-p1-materia-canvas (Revision 1)

**Goal:** Materia canvas drag-and-drop compose area with React Flow (@xyflow/react) — drop-on-top linking mechanic, agent+skill nodes only, hooks off canvas.
**Status:** REVISED — awaiting RA pre-flight then FE dispatch.
**Revision trigger:** CR#1 CRITIQUE_BLOCK (4 blockers) + human Q1/Q2 answers.

| task_id | agent | priority | status | depends_on |
|---|---|---|---|---|
| p1-mc-RA-compat | RA#1 | BLOCKER | PENDING | — |
| p1-mc-FE-store | FE#1 | BLOCKER | PENDING | p1-mc-RA-compat |
| p1-mc-FE-canvas-a | FE#2 | P1 CORE | PENDING | p1-mc-FE-store |
| p1-mc-FE-canvas-b | FE#3 | P1 CORE | PENDING | p1-mc-FE-canvas-a |
| p1-mc-FE-canvas-c | FE#4 | P1 CORE | PENDING | p1-mc-FE-canvas-b |
| p1-mc-FE-wire | FE#5 | P1 CORE | PENDING | p1-mc-FE-canvas-c |

### Key design decisions (rev1)
- Linking mechanic: drag-on-top proximity detection (60px threshold). No React Flow handles.
- CanvasNode.type: `'agent' | 'skill'` only. No hook nodes.
- handleSave data sources: name + hooks from compose-store; agents + skills from canvas-store.
- handleLoad: composeStore.loadLoadout({agents:[], skills:[], hooks: lo.hooks}) then canvasStore.loadFromLoadout(lo).
- Three-unit chain interaction frontmatter writing: OUT OF SCOPE. Follow-up sprint: p1-mc-follow-up-interactions.

---

## Expectation Manifest

```xml
<expectation_manifest>
  <sprint_id>gander-studio-p1-materia-canvas-rev1</sprint_id>
  <generated>2026-03-16T10:30:00Z</generated>
  <assignments>
    <assignment>
      <task_id>p1-mc-RA-compat</task_id>
      <agent>RA#1</agent>
      <expected_tag>research_dossier</expected_tag>
      <expected_file>.claude/agents/tasks/outputs/p1-mc-RA-compat-RA-*.md</expected_file>
      <blocks>p1-mc-FE-store, p1-mc-FE-canvas-a, p1-mc-FE-canvas-b, p1-mc-FE-canvas-c, p1-mc-FE-wire</blocks>
      <receipt_check>
        <item>@xyflow/react React 19 support: clear YES or NO answer</item>
        <item>Install command present</item>
        <item>CSS import path present (component-scoped, not global)</item>
        <item>If NO: alternative library identified with rationale</item>
      </receipt_check>
    </assignment>
    <assignment>
      <task_id>p1-mc-FE-store</task_id>
      <agent>FE#1</agent>
      <expected_tag>ui_packet</expected_tag>
      <expected_file>.claude/agents/tasks/outputs/p1-mc-FE-store-FE-*.md</expected_file>
      <blocks>p1-mc-FE-canvas-a</blocks>
      <receipt_check>
        <item>CanvasNode type is 'agent' | 'skill' — NO 'hook' in union</item>
        <item>selectLoadoutPayload confirmed to return hooks: [] always</item>
        <item>loadFromLoadout accepts hooks param but ignores it for node creation</item>
        <item>tsc --noEmit confirmed passing</item>
        <item>No import from @xyflow/react</item>
      </receipt_check>
    </assignment>
    <assignment>
      <task_id>p1-mc-FE-canvas-a</task_id>
      <agent>FE#2</agent>
      <expected_tag>ui_packet</expected_tag>
      <expected_file>.claude/agents/tasks/outputs/p1-mc-FE-canvas-a-FE-*.md</expected_file>
      <blocks>p1-mc-FE-canvas-b</blocks>
      <receipt_check>
        <item>canvas.ts constants list includes CANVAS_PROXIMITY_THRESHOLD_PX = 60</item>
        <item>getMateriaColor() returns CSS var strings, not hex</item>
        <item>MateriaNode has NO React Flow Handle elements</item>
        <item>MateriaNodeData uses 'agent' | 'skill' for nodeType — no 'hook'</item>
        <item>tsc --noEmit confirmed passing</item>
      </receipt_check>
    </assignment>
    <assignment>
      <task_id>p1-mc-FE-canvas-b</task_id>
      <agent>FE#3</agent>
      <expected_tag>ui_packet</expected_tag>
      <expected_file>.claude/agents/tasks/outputs/p1-mc-FE-canvas-b-FE-*.md</expected_file>
      <blocks>p1-mc-FE-canvas-c</blocks>
      <receipt_check>
        <item>MateriaCanvas.tsx created</item>
        <item>Playwright spec at packages/client/src/tests/compose/materia-canvas.spec.ts</item>
        <item>CSS import path from RA dossier used — NOT in globals.css or main.tsx</item>
        <item>No palette sidebar, no drag-to-canvas, no edge creation in this deliverable</item>
        <item>tsc --noEmit confirmed passing</item>
        <item>Orchestrator node visible on mount confirmed</item>
      </receipt_check>
    </assignment>
    <assignment>
      <task_id>p1-mc-FE-canvas-c</task_id>
      <agent>FE#4</agent>
      <expected_tag>ui_packet</expected_tag>
      <expected_file>.claude/agents/tasks/outputs/p1-mc-FE-canvas-c-FE-*.md</expected_file>
      <blocks>p1-mc-FE-wire</blocks>
      <receipt_check>
        <item>Drop-on-top proximity detection described (ref saves pre-drag pos, snap on overlap)</item>
        <item>No React Flow Handle elements</item>
        <item>Edge style: stroke var(--mt), no arrowhead confirmed</item>
        <item>Palette drag coordinate transform utility named</item>
        <item>tsc --noEmit confirmed passing</item>
      </receipt_check>
    </assignment>
    <assignment>
      <task_id>p1-mc-FE-wire</task_id>
      <agent>FE#5</agent>
      <expected_tag>ui_packet</expected_tag>
      <expected_file>.claude/agents/tasks/outputs/p1-mc-FE-wire-FE-*.md</expected_file>
      <blocks>NONE</blocks>
      <receipt_check>
        <item>handleSave: name from compose-store, agents/skills from canvas-store, hooks from compose-store — explicitly confirmed</item>
        <item>handleLoad: composeStore.loadLoadout with agents:[] skills:[] first, then canvasStore.loadFromLoadout</item>
        <item>ValidationWarnings uses canvas-store node counts, not compose-store arrays</item>
        <item>No packages/server/ or packages/shared/ files modified</item>
        <item>tsc --noEmit all three packages confirmed passing</item>
      </receipt_check>
    </assignment>
  </assignments>
</expectation_manifest>
```

---

## Previous Sprints

| sprint | status |
|---|---|
| gander-studio-p2 | AUDIT PASS (2026-03-16T00:30:13Z) |
| gander-studio-p3 | AUDIT PASS (2026-03-16T00:30:13Z) |
