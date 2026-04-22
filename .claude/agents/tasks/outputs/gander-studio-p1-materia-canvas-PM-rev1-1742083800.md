# Task Decomposition (Revision 1) — gander-studio-p1-materia-canvas

**PM:** PM#0
**Generated:** 2026-03-16T10:30:00Z
**Revision trigger:** CR#1 CRITIQUE_BLOCK (4 blockers) + human authoritative answers on Q1/Q2
**Parent brief:** ORC#0 → gander-studio-p1-materia-canvas

---

## Revision Summary

### Human Authoritative Answers

**Q1 — Linking mechanic (drag-on-top):**
When a node is dragged and released within ~60px of another node's center, a directed edge is created automatically. Source = dragged node, target = drop target. Multiple edges from one node are fine. No React Flow handles used for linking. Three-unit chains (AgentA → SkillX → AgentB) semantically mean "Agent X uses Skill Y to communicate with Agent Z" — this is detected client-side and will be written to agent frontmatter in a future sprint (see risk flags).

**Q2 — Hooks off canvas:**
Hooks are NOT represented as canvas nodes. `CanvasNode.type` is `'agent' | 'skill'` only. `selectLoadoutPayload` returns `{ agents: string[], skills: string[], hooks: string[] }` where `hooks` is always `[]` (sourced from compose-store on save, not from canvas). Existing `addHook`/`removeHook` in compose-store are preserved unchanged.

### Blocker Resolutions

| Blocker | Resolution |
|---|---|
| BLOCKER 1 — React 19 compat unverified | Added p1-mc-RA-compat pre-flight task; gates all canvas work |
| BLOCKER 2 — p1-mc-FE-canvas overscoped | Split into three sub-tasks (a/b/c), each ≤50 lines new code |
| BLOCKER 3 — Hook node type undefined | Removed 'hook' from CanvasNode type union; selectLoadoutPayload hooks always [] |
| BLOCKER 4 — handleSave underspecified | Explicit data-source spec for name/agents/skills/hooks in p1-mc-FE-wire |

### agent.save interactions field — Architecture Decision

The human specified three-unit chain interactions should be written to agent frontmatter. Analysis of `packages/server/src/router.ts`:
- `agent.save` takes `AgentSchema` as input (see line 76)
- `AgentSchema` (packages/shared/src/schemas.ts line 4-13) has no `interactions` field
- Writing interactions frontmatter requires: (1) `InteractionSchema` in shared schemas.ts, (2) updated `agent.save` frontmatter template in router.ts, (3) a new call per participating agent after loadout save

This is a cross-domain change (shared + server + client). **Decision: OUT OF SCOPE for this sprint.** Canvas save writes `{ name, agents, skills, hooks }` only, unchanged from current behavior. Three-unit chain detection and frontmatter writing is flagged as `p1-mc-follow-up-interactions` for a future sprint.

---

## Architectural Decisions (carried forward from v1)

### Library: @xyflow/react (React Flow v12)
Subject to p1-mc-RA-compat PASS. If RA returns React 19 incompatibility, all canvas tasks switch to a plain SVG + pointer-event approach (Orchestrator will re-brief with alternative spec). The RA task must identify the correct CSS import path for component-scoped use.

### canvasState persistence: EPHEMERAL CLIENT ONLY
Node positions (x, y) and edge graph are NOT persisted to disk. `LoadoutSchema` and `packages/shared/src/schemas.ts` are NOT modified. The existing `loadout.save` tRPC call is unchanged.

### Drop-on-top edge creation (replaces handle-to-handle)
Use React Flow `onNodeDrag` + `onNodeDragStop` events. On drag stop, check if dragged node's position overlaps any other node within 60px center-to-center threshold. If overlap detected: snap dragged node back to its pre-drag position, call `addEdge()`. This is the ONLY supported edge-creation mechanic — no React Flow Handles, no handle-to-handle dragging.

---

## Task Packets

---

### p1-mc-RA-compat — React 19 Compatibility Pre-flight

```xml
<task_packet>
  <task_id>p1-mc-RA-compat</task_id>
  <assigned_to>Researcher</assigned_to>
  <priority>BLOCKER</priority>
  <description>
    Verify whether @xyflow/react supports React 19 as a peer dependency.
    If React 19 is NOT supported, identify the best-available alternative
    (reactflow v11 with legacy-peer-deps, a compat shim, or a plain SVG+pointer-events approach).
    Also confirm the correct CSS import path for @xyflow/react in a Vite/React project
    for component-scoped use (not global).
  </description>
  <success_criteria>
    1. Definitive answer: does @xyflow/react (latest stable) declare React 19 as a supported peer?
    2. If yes: provide the correct npm install command and CSS import path.
    3. If no: provide the recommended workaround (legacy-peer-deps, pinned version, alternative library)
       with the install command and CSS import path for the alternative.
    4. Output written to .claude/agents/tasks/outputs/p1-mc-RA-compat-RA-{unix_ts}.md
  </success_criteria>
  <context_files>
    packages/client/package.json
  </context_files>
  <dependencies>NONE</dependencies>
  <out_of_scope>
    - Do NOT implement any code changes
    - Do NOT modify any project files
    - Return findings only
  </out_of_scope>
  <output_expected>
    <tag>research_dossier</tag>
    <must_contain>
      <item>@xyflow/react peer dependency declaration for React (exact version range)</item>
      <item>React 19 supported: YES or NO</item>
      <item>If NO: recommended workaround with rationale</item>
      <item>Correct CSS import path for component-scoped use in Vite</item>
      <item>Recommended npm install command</item>
    </must_contain>
    <success_signal>research_dossier present with clear YES/NO on React 19 support and actionable install + CSS import instructions.</success_signal>
  </output_expected>
</task_packet>
```

---

### p1-mc-FE-store — Canvas Zustand Store (revised)

```xml
<task_packet>
  <task_id>p1-mc-FE-store</task_id>
  <assigned_to>Frontend Engineer</assigned_to>
  <priority>BLOCKER</priority>
  <description>
    Create the Zustand store slice that holds all canvas state for the materia canvas.
    This is the data contract that MateriaCanvas.tsx sub-tasks will consume.
    The existing compose-store.ts must NOT be modified — this is an additive new file.

    IMPORTANT CHANGE FROM DRAFT: CanvasNode.type is 'agent' | 'skill' ONLY.
    'hook' is removed from the union entirely. Hooks are not canvas nodes.
  </description>
  <success_criteria>
    1. File packages/client/src/store/canvas-store.ts exists and compiles (tsc --noEmit passes).
    2. Exports CanvasNode type: { id: string; name: string; type: 'agent' | 'skill'; position: { x: number; y: number } }
       Note: 'hook' is NOT in the type union.
    3. Exports CanvasEdge type: { id: string; source: string; target: string }
    4. Exports useCanvasStore hook (Zustand create) with state:
       - nodes: CanvasNode[]
       - edges: CanvasEdge[]
    5. Store actions exported:
       - addNode(node: CanvasNode): void — dedupes by id
       - removeNode(id: string): void — also removes any edges referencing that id
       - updateNodePosition(id: string, position: { x: number; y: number }): void
       - addEdge(edge: CanvasEdge): void — dedupes by source+target pair
       - removeEdge(id: string): void
       - loadFromLoadout(loadout: { agents: string[]; skills: string[]; hooks: string[] }): void
         — replaces current nodes with auto-layout positions; keeps orchestrator at center
         — auto-layout: place orchestrator at {x:300, y:260} (viewport center equivalent),
           others in a circle around it with radius ~200px
         — hooks param is accepted but ignored (hooks are not canvas nodes)
         — orchestrator node is NOT duplicated if agents list already includes 'orchestrator'
       - resetCanvas(): void — clears all nodes and edges; re-adds orchestrator node at center
    6. Selector: selectLoadoutPayload(state: CanvasState) → { agents: string[], skills: string[], hooks: string[] }
       — agents: state.nodes.filter(n => n.type === 'agent').map(n => n.name)
       — skills: state.nodes.filter(n => n.type === 'skill').map(n => n.name)
       — hooks: [] always (hooks are sourced from compose-store by the wiring task, not from canvas)
    7. Orchestrator node is initialized on store creation (initial state includes it, centered).
       The orchestrator node has id='orchestrator', name='orchestrator', type='agent'.
    8. No tRPC calls, no server imports, no raw hex color values.
    9. TypeScript strict mode — no implicit any. All types explicitly annotated.
    10. File is under ~40 lines of new code (excluding blank lines and comments).
  </success_criteria>
  <context_files>
    packages/client/src/store/compose-store.ts
    packages/shared/src/schemas.ts
  </context_files>
  <dependencies>p1-mc-RA-compat</dependencies>
  <out_of_scope>
    - Do NOT modify compose-store.ts
    - Do NOT add UI components
    - Do NOT import @xyflow/react
    - Do NOT add canvasState to LoadoutSchema
    - Do NOT add any server-side files
    - Do NOT include 'hook' in CanvasNode.type union
  </out_of_scope>
  <output_expected>
    <tag>ui_packet</tag>
    <must_contain>
      <item>Path of written file: packages/client/src/store/canvas-store.ts</item>
      <item>Full exported type signatures for CanvasNode (showing 'agent' | 'skill' only) and CanvasEdge</item>
      <item>Confirmation that tsc --noEmit passes for packages/client</item>
      <item>Description of selectLoadoutPayload selector logic (including hooks: [] always)</item>
      <item>Description of loadFromLoadout auto-layout algorithm</item>
    </must_contain>
    <must_not_contain>
      <item>Raw hex color values</item>
      <item>Modifications to compose-store.ts</item>
      <item>Any import from @xyflow/react</item>
      <item>'hook' in CanvasNode.type union</item>
    </must_not_contain>
    <success_signal>File exists, tsc noEmit passes, CanvasNode type is 'agent' | 'skill' with no 'hook', selectLoadoutPayload confirmed to return hooks: [].</success_signal>
  </output_expected>
</task_packet>
```

---

### p1-mc-FE-canvas-a — MateriaNode Component + Constants

```xml
<task_packet>
  <task_id>p1-mc-FE-canvas-a</task_id>
  <assigned_to>Frontend Engineer</assigned_to>
  <priority>P1 CORE</priority>
  <description>
    Create the MateriaNode custom React node component and the canvas constants file.
    This task does NOT include the React Flow canvas wrapper — that is p1-mc-FE-canvas-b.
    MateriaNode is a standalone React component that renders an orb sphere with a glow
    and a label. It accepts data via React Flow's NodeProps generic.

    Before starting, ensure @xyflow/react is installed per the RA dossier instructions.
    Run the install command from p1-mc-RA-compat output before beginning.

    Drop-on-top linking (not handle-to-handle) is the sole linking mechanic.
    MateriaNode must NOT render any React Flow Handle elements.
  </description>
  <success_criteria>
    1. packages/client/src/constants/canvas.ts exists with ALL of these constants:
       - MATERIA_ORB_SIZE_PX: number (e.g. 56)
       - ORCHESTRATOR_ORB_SCALE: number (e.g. 1.2)
       - EDGE_STROKE_WIDTH: number (e.g. 2)
       - CANVAS_PROXIMITY_THRESHOLD_PX: number (60)
       - CANVAS_LAYOUT_RADIUS_PX: number (e.g. 200)
       - CANVAS_ORCHESTRATOR_X: number (e.g. 300)
       - CANVAS_ORCHESTRATOR_Y: number (e.g. 260)
       - getMateriaColor(type: 'agent' | 'skill', name: string): string
         — returns a CSS custom property string (e.g. 'var(--my)' for orchestrator, 'var(--mg)' for impl agents, 'var(--mb)' for skills)
    2. packages/client/src/components/compose/MateriaNode.tsx exists and compiles.
    3. MateriaNode is typed with React Flow's NodeProps generic (NodeProps<MateriaNodeData>).
       MateriaNodeData = { name: string; nodeType: 'agent' | 'skill'; isOrchestrator?: boolean }
    4. MateriaNode renders:
       - A circular orb div sized MATERIA_ORB_SIZE_PX (orchestrator scaled by ORCHESTRATOR_ORB_SCALE)
       - Background and box-shadow glow using getMateriaColor() return value
       - Node label below the orb: name in var(--fb) font, 10px, var(--wm) color
       - A "×" remove button hidden unless the node is hovered AND isOrchestrator is false
         (orchestrator cannot be removed)
    5. No React Flow Handle elements rendered.
    6. No raw hex values in any file — all colors via CSS custom properties.
    7. TypeScript strict — no implicit any.
    8. Both files combined add ≤50 lines of new code (excluding blank lines, imports, comments).
  </success_criteria>
  <context_files>
    packages/client/src/store/canvas-store.ts (output of p1-mc-FE-store)
    packages/client/src/globals.css (for CSS var reference — read-only)
  </context_files>
  <dependencies>p1-mc-FE-store</dependencies>
  <out_of_scope>
    - Do NOT create MateriaCanvas.tsx (that is p1-mc-FE-canvas-b)
    - Do NOT add the palette sidebar (that is p1-mc-FE-canvas-c)
    - Do NOT implement drag-to-canvas or edge creation (that is p1-mc-FE-canvas-c)
    - Do NOT render React Flow Handle elements
    - Do NOT modify compose-store.ts, schemas.ts, or ComposePage.tsx
    - Do NOT use raw hex values
  </out_of_scope>
  <output_expected>
    <tag>ui_packet</tag>
    <must_contain>
      <item>Path: packages/client/src/constants/canvas.ts</item>
      <item>Path: packages/client/src/components/compose/MateriaNode.tsx</item>
      <item>Complete list of constants in canvas.ts with their values/types</item>
      <item>MateriaNodeData type definition shown</item>
      <item>Confirmation no Handle elements in MateriaNode</item>
      <item>Confirmation tsc --noEmit passes for packages/client</item>
    </must_contain>
    <must_not_contain>
      <item>React Flow Handle elements in MateriaNode</item>
      <item>Raw hex color values</item>
      <item>MateriaCanvas.tsx (not this task)</item>
    </must_not_contain>
    <success_signal>Both files exist and tsc passes; MateriaNode renders orb without handles; getMateriaColor returns CSS var strings only.</success_signal>
  </output_expected>
</task_packet>
```

---

### p1-mc-FE-canvas-b — MateriaCanvas Skeleton (static rendering)

```xml
<task_packet>
  <task_id>p1-mc-FE-canvas-b</task_id>
  <assigned_to>Frontend Engineer</assigned_to>
  <priority>P1 CORE</priority>
  <description>
    Create MateriaCanvas.tsx — the React Flow provider wrapper that renders nodes from canvas-store.
    This task covers static node rendering only: React Flow setup, CSS isolation, custom node type
    registration, orchestrator node visible on mount, zoom controls. No palette sidebar, no
    drag-to-canvas, no edge creation — those are p1-mc-FE-canvas-c.

    Also write a Playwright smoke test to verify the canvas mounts correctly.

    CSS import: use the CSS import path confirmed by the RA dossier. Scope it within this
    component's file or in a component-level CSS import so it does not bleed into global styles.
  </description>
  <success_criteria>
    1. packages/client/src/components/compose/MateriaCanvas.tsx exists and compiles.
    2. Component props interface:
       - availableAgents: Array<{ name: string; filePath: string }>
       - availableSkills: Array<{ name: string; filePath: string }>
       - isSaving: boolean
    3. React Flow CSS imported correctly (path from RA dossier). Import is scoped to this
       component only — does NOT import into globals.css or main.tsx.
    4. ReactFlowProvider (or ReactFlow itself as a standalone root) wraps the canvas area.
    5. useCanvasStore() nodes and edges are passed to React Flow as nodes/edges props.
    6. MateriaNode is registered as a custom node type under key 'materiaNode'.
    7. All canvas-store nodes of type 'agent' and 'skill' are rendered using MateriaNode.
    8. Orchestrator node is visible on mount (sourced from canvas-store initial state).
    9. React Flow Controls (zoom in/out/fit) rendered in bottom-right corner.
    10. Canvas background: background color var(--void); React Flow Background component
        with very subtle teal dot pattern (variant='dots', gap, size, color all from canvas.ts constants).
    11. Node drag calls updateNodePosition() in canvas-store via onNodeDragStop.
    12. Component does NOT yet implement: palette sidebar, drag-from-palette, edge creation.
    13. tsc --noEmit passes for packages/client.
    14. Playwright smoke test at packages/client/src/tests/compose/materia-canvas.spec.ts covering:
        (a) orchestrator node visible on canvas mount (selector: '[data-testid="materia-node-orchestrator"]');
        (b) page loads without console errors.
    15. New code in MateriaCanvas.tsx ≤ 50 lines (excluding blank lines, imports, comments).
  </success_criteria>
  <context_files>
    packages/client/src/store/canvas-store.ts (output of p1-mc-FE-store)
    packages/client/src/components/compose/MateriaNode.tsx (output of p1-mc-FE-canvas-a)
    packages/client/src/constants/canvas.ts (output of p1-mc-FE-canvas-a)
    .claude/agents/tasks/outputs/p1-mc-RA-compat-RA-*.md (CSS import path from RA dossier)
  </context_files>
  <dependencies>p1-mc-FE-canvas-a</dependencies>
  <out_of_scope>
    - Do NOT implement the palette sidebar (that is p1-mc-FE-canvas-c)
    - Do NOT implement drag-from-palette (that is p1-mc-FE-canvas-c)
    - Do NOT implement edge creation / drop-on-top (that is p1-mc-FE-canvas-c)
    - Do NOT modify ComposePage.tsx (that is p1-mc-FE-wire)
    - Do NOT modify compose-store.ts, schemas.ts, or server files
    - Do NOT use React Flow Handle elements
    - Do NOT import the React Flow CSS into globals.css or main.tsx
  </out_of_scope>
  <output_expected>
    <tag>ui_packet</tag>
    <must_contain>
      <item>Path: packages/client/src/components/compose/MateriaCanvas.tsx</item>
      <item>Path: packages/client/src/tests/compose/materia-canvas.spec.ts</item>
      <item>CSS import statement used (exact path from RA dossier)</item>
      <item>Confirmation orchestrator node visible on mount</item>
      <item>Confirmation tsc --noEmit passes</item>
      <item>Playwright test selectors listed</item>
    </must_contain>
    <must_not_contain>
      <item>Palette sidebar implementation</item>
      <item>Drag-from-palette logic</item>
      <item>Edge creation logic</item>
      <item>React Flow CSS imported globally</item>
      <item>Raw hex color values</item>
    </must_not_contain>
    <success_signal>MateriaCanvas.tsx compiles; orchestrator node visible; Playwright spec file exists with two test cases; tsc passes.</success_signal>
  </output_expected>
</task_packet>
```

---

### p1-mc-FE-canvas-c — Palette + Drag-to-Canvas + Drop-on-Top Edges

```xml
<task_packet>
  <task_id>p1-mc-FE-canvas-c</task_id>
  <assigned_to>Frontend Engineer</assigned_to>
  <priority>P1 CORE</priority>
  <description>
    Extend MateriaCanvas.tsx with three interactive features:
    (1) Palette sidebar — lists available agents/skills, drag-to-canvas adds a node.
    (2) Drop-on-top edge creation — drag-on-top proximity detection, NOT React Flow handles.
    (3) Zoom controls are already present from canvas-b; ensure they are not broken.

    Drop-on-top mechanic (authoritative — human confirmed):
    - Track pre-drag position in onNodeDragStart (save to a ref).
    - In onNodeDragStop, iterate over all other nodes.
    - If any node's center is within CANVAS_PROXIMITY_THRESHOLD_PX (60px) of the dragged node's center:
        - Snap the dragged node back to its pre-drag position (call updateNodePosition with saved coords).
        - Call addEdge({ id: uuid, source: draggedNodeId, target: overlappedNodeId }).
        - Do not create a visual edge if a source+target pair already exists (canvas-store dedupes).
    - If no overlap: update position normally (updateNodePosition with final coords).

    Edges styled with:
    - stroke: var(--mt) (teal)
    - strokeWidth: EDGE_STROKE_WIDTH from canvas.ts
    - filter: drop-shadow with teal glow
    - No arrowhead (undirected rendering per human Q1; semantic direction is tracked by edge creation order)

    Palette sidebar:
    - Left panel, ~180-200px wide, inside the MateriaCanvas component div (not a separate page section)
    - Lists availableAgents and availableSkills passed as props
    - Each item is draggable (HTML5 drag or pointer events — agent's choice; prefer pointer events for touch compat)
    - Dropping onto the React Flow canvas area calls addNode() with position at the drop point
      (use React Flow's screenToFlowPosition() or project() utility for coordinate transform)
    - Items already present on canvas (by name) are shown dimmed with a checkmark indicator
    - Filter/search input at top of palette
    - Palette items must NOT have drag handles that look like React Flow connection handles
  </description>
  <success_criteria>
    1. MateriaCanvas.tsx updated — palette sidebar visible alongside React Flow canvas area.
    2. Dragging a palette item onto the canvas viewport adds it as a node at the correct position.
    3. Drop-on-top proximity detection implemented exactly as described above.
    4. Edges rendered with teal stroke (var(--mt)), width EDGE_STROKE_WIDTH, glow filter — no arrowhead.
    5. Pre-drag position saved in onNodeDragStart ref; restored on proximity-triggered snap.
    6. Duplicate edges are NOT created (canvas-store addEdge deduplication is relied on).
    7. Nodes already on canvas show as dimmed+checked in palette.
    8. Search/filter input in palette narrows the displayed list.
    9. Node "×" remove button (from MateriaNode) calls removeNode() in canvas-store when clicked.
       The removeNode action also removes all edges that reference the removed node's id.
    10. No React Flow Handle elements used anywhere.
    11. tsc --noEmit passes for packages/client.
    12. New code added to MateriaCanvas.tsx in this task ≤ 60 lines (excluding blank lines, imports, comments).
    13. No raw hex values added.
  </success_criteria>
  <context_files>
    packages/client/src/components/compose/MateriaCanvas.tsx (output of p1-mc-FE-canvas-b — MUST READ before editing)
    packages/client/src/store/canvas-store.ts (output of p1-mc-FE-store)
    packages/client/src/constants/canvas.ts (output of p1-mc-FE-canvas-a)
    packages/client/src/components/compose/MateriaNode.tsx (output of p1-mc-FE-canvas-a)
  </context_files>
  <dependencies>p1-mc-FE-canvas-b</dependencies>
  <out_of_scope>
    - Do NOT use React Flow Handle elements for edge creation
    - Do NOT modify ComposePage.tsx (that is p1-mc-FE-wire)
    - Do NOT modify compose-store.ts, schemas.ts, or server files
    - Do NOT implement three-unit chain interaction frontmatter writing (future sprint)
    - Do NOT use raw hex values
  </out_of_scope>
  <output_expected>
    <tag>ui_packet</tag>
    <must_contain>
      <item>Confirmation MateriaCanvas.tsx updated (diff summary of changes in this sub-task)</item>
      <item>Description of drop-on-top detection implementation (ref usage, proximity check, snap logic)</item>
      <item>Description of palette drag-to-canvas coordinate transform (which React Flow util used)</item>
      <item>Edge style spec (stroke, width, glow, no arrowhead)</item>
      <item>Confirmation no Handle elements used</item>
      <item>Confirmation tsc --noEmit passes</item>
    </must_contain>
    <must_not_contain>
      <item>React Flow Handle elements</item>
      <item>Raw hex color values</item>
      <item>Modifications to ComposePage.tsx or server files</item>
      <item>Three-unit chain interaction frontmatter writing</item>
    </must_not_contain>
    <success_signal>Palette sidebar renders; drag-to-canvas adds node; drop-on-top creates edge; no handles; tsc passes.</success_signal>
  </output_expected>
</task_packet>
```

---

### p1-mc-FE-wire — ComposePage Integration (revised)

```xml
<task_packet>
  <task_id>p1-mc-FE-wire</task_id>
  <assigned_to>Frontend Engineer</assigned_to>
  <priority>P1 CORE</priority>
  <description>
    Wire MateriaCanvas into ComposePage, replacing the SlotGroup list in the right panel.
    The existing left panel (ItemBrowserBody + search) is REMOVED — palette functionality
    moves inside MateriaCanvas itself. The loadout name input, ValidationWarnings,
    LoadoutControls (Save/Load/New), and SaveErrorCard all remain.

    EXPLICIT DATA SOURCE SPEC — follow exactly:

    handleSave:
    - name: from useComposeStore().currentLoadout.name (unchanged source)
    - agents: from selectLoadoutPayload(useCanvasStore.getState()).agents
    - skills: from selectLoadoutPayload(useCanvasStore.getState()).skills
    - hooks: from useComposeStore().currentLoadout.hooks (unchanged — hooks not on canvas)
    - Final payload: { name, agents, skills, hooks, createdAt: new Date().toISOString() }
      — this is a valid LoadoutSchema shape. No server changes.

    handleLoad:
    - Call composeStore.loadLoadout({ name: lo.name, agents: [], skills: [], hooks: lo.hooks })
      — preserves loadout name and hooks in compose-store; agents/skills come from canvas.
    - Then call canvasStore.loadFromLoadout({ agents: lo.agents, skills: lo.skills, hooks: lo.hooks })
      — positions nodes on canvas from the loaded loadout.

    handleNew:
    - Call canvasStore.resetCanvas() — returns to orchestrator-only state.
    - Call composeStore.resetLoadout() or composeStore.setLoadoutName('') — clears name + hooks.

    useValidationWarnings:
    - Receives agents count and skills count from canvas-store nodes (via useCanvasStore selector).
    - Receives name from useComposeStore().currentLoadout.name.
    - Hook signature may be unchanged or updated — agent's discretion — but warnings must reflect
      what is actually on the canvas, not compose-store agents/skills arrays.
  </description>
  <success_criteria>
    1. ComposePage.tsx modified — SlotGroup block and the desktop ItemBrowser + mobile accordion
       are replaced by &lt;MateriaCanvas availableAgents={agents} availableSkills={skills} isSaving={isSaving} /&gt;
    2. Loadout name input (id="loadout-name-input") is preserved and still functional.
    3. LoadoutControls (Save/Load/New buttons, Popover) are preserved and still functional.
    4. ValidationWarnings is preserved — derives agent/skill counts from canvas-store nodes.
    5. handleSave builds payload EXACTLY as specified above: name from compose-store, agents/skills from canvas-store, hooks from compose-store.
    6. handleLoad calls composeStore.loadLoadout with agents:[] + skills:[] + correct hooks, then canvasStore.loadFromLoadout with full lo data.
    7. handleNew calls both canvasStore.resetCanvas() and clears compose-store name/hooks.
    8. Orchestrator node is NOT duplicated on handleLoad (loadFromLoadout handles this).
    9. No changes to packages/server/ or packages/shared/.
    10. No new tRPC procedures.
    11. tsc --noEmit passes for all three packages (shared, server, client).
    12. npm run lint passes.
    13. Right-panel layout: name input → MateriaCanvas (flex: 1, min-height e.g. 400px) → ValidationWarnings → LoadoutControls → SaveErrorCard.
    14. data-testid="compose-page" attribute on root div is preserved.
    15. Responsive CSS for ".compose-panels" at mobile breakpoints updated or removed cleanly.
  </success_criteria>
  <context_files>
    packages/client/src/pages/ComposePage.tsx (MUST READ before editing)
    packages/client/src/store/canvas-store.ts (output of p1-mc-FE-store)
    packages/client/src/components/compose/MateriaCanvas.tsx (output of p1-mc-FE-canvas-c)
    packages/client/src/store/compose-store.ts
    packages/client/src/constants/compose.ts
    packages/shared/src/schemas.ts
  </context_files>
  <dependencies>p1-mc-FE-canvas-c</dependencies>
  <out_of_scope>
    - Do NOT modify packages/server/ or packages/shared/
    - Do NOT add new tRPC procedures
    - Do NOT change the loadout.save payload shape — { name, agents, skills, hooks, createdAt }
    - Do NOT rebuild MateriaCanvas internals — treat it as a black box import
    - Do NOT remove the loadout name input, Save/Load/New controls, or ValidationWarnings
    - Do NOT add canvasState to LoadoutSchema
    - Do NOT implement three-unit chain interaction frontmatter writing (future sprint)
  </out_of_scope>
  <output_expected>
    <tag>ui_packet</tag>
    <must_contain>
      <item>Confirmation ComposePage.tsx modified (diff summary)</item>
      <item>Confirmation SlotGroup + ItemBrowserBody blocks removed from right panel</item>
      <item>Exact handleSave data sources listed (name: compose-store, agents/skills: canvas-store, hooks: compose-store)</item>
      <item>Confirmation handleLoad calls composeStore.loadLoadout with agents:[] then canvasStore.loadFromLoadout</item>
      <item>Confirmation handleNew calls canvasStore.resetCanvas() and clears compose-store name/hooks</item>
      <item>Confirmation ValidationWarnings derives counts from canvas-store nodes</item>
      <item>Confirmation tsc --noEmit passes for all three packages</item>
      <item>Confirmation no files in packages/server/ or packages/shared/ were modified</item>
    </must_contain>
    <must_not_contain>
      <item>Modifications to packages/server/ files</item>
      <item>Modifications to packages/shared/src/schemas.ts</item>
      <item>Removal of loadout name input or Save/Load controls</item>
      <item>New tRPC procedure definitions</item>
      <item>Raw hex color values added to ComposePage</item>
      <item>handleSave sourcing agents/skills from compose-store (must come from canvas-store)</item>
    </must_not_contain>
    <success_signal>tsc --noEmit passes all three packages; handleSave uses correct sources; handleLoad preserves hooks in compose-store; Playwright test from canvas-b still passes.</success_signal>
  </output_expected>
</task_packet>
```

---

## Dependency Order

```
p1-mc-RA-compat
    ↓
p1-mc-FE-store
    ↓
p1-mc-FE-canvas-a
    ↓
p1-mc-FE-canvas-b
    ↓
p1-mc-FE-canvas-c
    ↓
p1-mc-FE-wire
```

All tasks are strictly sequential. p1-mc-RA-compat is the gate: if it returns React 19 incompatibility, Orchestrator must re-brief canvas tasks with the alternative library before dispatching p1-mc-FE-store.

---

## Routing Notes

- p1-mc-RA-compat → Researcher agent. Return is a `research_dossier`. PM (or Orchestrator) extracts the install command and CSS import path before dispatching p1-mc-FE-store and p1-mc-FE-canvas-a.
- If RA returns NO for React 19 support: STOP. Orchestrator escalates to human for library decision before continuing. Do not proceed with canvas tasks under an incompatible library assumption.
- All FE tasks require audit after the full chain completes (single audit over the entire changeset after p1-mc-FE-wire).
- The Playwright test from p1-mc-FE-canvas-b is a regression gate for p1-mc-FE-wire — the wiring agent must confirm it still passes.

---

## Risk Flags

1. **React 19 / @xyflow/react compatibility (p1-mc-RA-compat):** If RA returns incompatibility, all canvas sub-tasks need re-briefing with the alternative library. This could cascade into a sprint restart.

2. **Three-unit chain interaction frontmatter writing (out of scope, follow-up sprint):** Human specified that AgentA → SkillX → AgentB chains should be written to agent `.md` frontmatter. This requires extending `AgentSchema` in `packages/shared/src/schemas.ts` (add `interactions` field), updating `agent.save` frontmatter template in `packages/server/src/router.ts`, and a new client-side call after loadout save. This is a BE+shared+FE change that would violate the "no server changes this sprint" constraint. Flag as `p1-mc-follow-up-interactions` for the next sprint after the canvas is stable.

3. **Coordinate transform accuracy:** React Flow's `screenToFlowPosition()` / `project()` utility requires the React Flow instance ref. If the FE agent uses an incorrect method, palette-dragged nodes may appear at wrong positions. The canvas-c task spec names this utility explicitly but the FE agent must verify it against the installed version.

4. **CSS isolation:** React Flow ships its own CSS. Importing it globally would overwrite Shadcn/Tailwind base styles. The RA dossier must confirm the component-scoped import path; p1-mc-FE-canvas-b spec explicitly prohibits global import.

5. **50-line commit limit (ongoing):** Each canvas sub-task is bounded. If a sub-task returns a packet with significantly more new lines than the spec allows, Orchestrator should send back for splitting before audit.

---

## Files Expected to Change

| file | task | action |
|---|---|---|
| packages/client/src/store/canvas-store.ts | p1-mc-FE-store | CREATE |
| packages/client/src/constants/canvas.ts | p1-mc-FE-canvas-a | CREATE |
| packages/client/src/components/compose/MateriaNode.tsx | p1-mc-FE-canvas-a | CREATE |
| packages/client/src/components/compose/MateriaCanvas.tsx | p1-mc-FE-canvas-b | CREATE |
| packages/client/src/tests/compose/materia-canvas.spec.ts | p1-mc-FE-canvas-b | CREATE |
| packages/client/src/components/compose/MateriaCanvas.tsx | p1-mc-FE-canvas-c | MODIFY |
| packages/client/package.json | p1-mc-FE-canvas-a (pre-flight) | MODIFY (add @xyflow/react or alt) |
| packages/client/src/pages/ComposePage.tsx | p1-mc-FE-wire | MODIFY |

**Files that must NOT change:**
- packages/shared/src/schemas.ts
- packages/server/src/router.ts
- packages/server/src/server.ts
- packages/client/src/store/compose-store.ts
- packages/client/src/pages/ExportPage.tsx
- packages/client/src/globals.css (React Flow CSS not imported here)

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
        <item>CSS import path present</item>
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
        <item>MateriaNodeData uses 'agent' | 'skill' for nodeType, not 'hook'</item>
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
        <item>CSS import path from RA dossier used (not global)</item>
        <item>No palette sidebar, no drag-to-canvas, no edge creation in this file</item>
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
        <item>Edge style: stroke var(--mt), no arrowhead</item>
        <item>Palette drag coordinate transform utility identified (screenToFlowPosition or equiv)</item>
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
