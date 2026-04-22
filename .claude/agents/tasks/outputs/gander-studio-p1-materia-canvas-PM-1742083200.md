# Task Decomposition — gander-studio-p1-materia-canvas

**PM:** PM#0
**Generated:** 2026-03-16T09:05:00Z
**Parent brief:** ORC#0 → gander-studio-p1-materia-canvas

---

## Architectural Decision Record

### Library: @xyflow/react (React Flow v12)
Chosen over plain SVG + HTML5 drag-and-drop.

Rationale:
- React Flow provides built-in node drag, edge rendering, zoom/pan, and minimap out of the box.
- Plain drag-and-drop equivalent would require ~500 lines of bespoke geometry code (hit detection, SVG coordinate transforms, pointer event multiplexing) with high surface area for bugs.
- @xyflow/react v12 is MIT-licensed, ~50KB gzip, React 19 compatible.
- The monorepo does not currently use it; it must be added to `packages/client/package.json`.

**Install command (run before starting p1-mc-FE-canvas):**
```
cd /home/jhber/projects/gander-studio-alpha
npm install @xyflow/react -w @gander-studio/client
```

### canvasState persistence: EPHEMERAL CLIENT ONLY
Node positions (x, y) and edge graph are NOT persisted to disk. Adding them to `LoadoutSchema` would require server-side changes, JSON file format changes, and a migration path — all for session-local UX data that has zero server-side value.

Decision: a new `canvas-store.ts` Zustand slice holds all canvas state. When the user saves a loadout, the save payload is derived from canvas nodes (agent names + skill names present on canvas) — identical to the existing `currentLoadout.agents` / `currentLoadout.skills` arrays. The existing `loadout.save` tRPC call is unchanged.

`packages/shared/src/schemas.ts` is NOT modified. `packages/server/` is NOT modified.

---

## Task Packets

### p1-mc-FE-store — Canvas Zustand Store

```xml
<task_packet>
  <task_id>p1-mc-FE-store</task_id>
  <assigned_to>Frontend Engineer</assigned_to>
  <priority>BLOCKER</priority>
  <description>
    Create the Zustand store slice that holds all canvas state for the materia canvas.
    This is the data contract that MateriaCanvas.tsx (next task) will consume.
    The existing compose-store.ts must NOT be modified — this is an additive new file.
  </description>
  <success_criteria>
    1. File packages/client/src/store/canvas-store.ts exists and compiles (tsc --noEmit passes).
    2. Exports CanvasNode type: { id: string; name: string; type: 'agent' | 'skill' | 'hook'; position: { x: number; y: number } }
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
       - loadFromLoadout(agents: string[], skills: string[], hooks: string[]): void
         — replaces current nodes with auto-layout positions; keeps orchestrator at center
         — auto-layout: place orchestrator at {x:0, y:0}, others in a circle around it
       - resetCanvas(): void — clears all nodes and edges; re-adds orchestrator node at center
    6. Selector: selectLoadoutPayload(state) → { agents: string[], skills: string[], hooks: string[] }
       — derives the three name arrays from current canvas nodes (for use in handleSave)
    7. Orchestrator node is initialized on store creation (initial state includes it, centered at {x:0, y:0}).
    8. No tRPC calls, no server imports, no raw hex color values.
    9. TypeScript strict mode — no implicit any.
  </success_criteria>
  <context_files>
    packages/client/src/store/compose-store.ts
    packages/shared/src/schemas.ts
  </context_files>
  <dependencies>NONE</dependencies>
  <out_of_scope>
    - Do NOT modify compose-store.ts
    - Do NOT add UI components
    - Do NOT import @xyflow/react (that is the canvas component's concern)
    - Do NOT add canvasState to LoadoutSchema
    - Do NOT add any server-side files
  </out_of_scope>
  <output_expected>
    <tag>ui_packet</tag>
    <must_contain>
      <item>Path of written file: packages/client/src/store/canvas-store.ts</item>
      <item>Full exported type signatures for CanvasNode and CanvasEdge</item>
      <item>Confirmation that tsc --noEmit passes for packages/client</item>
      <item>Description of selectLoadoutPayload selector logic</item>
      <item>Description of loadFromLoadout auto-layout algorithm</item>
    </must_contain>
    <must_not_contain>
      <item>Raw hex color values</item>
      <item>Modifications to compose-store.ts</item>
      <item>Any import from @xyflow/react</item>
      <item>Any import from packages/server or packages/shared schemas (types only from shared are OK via z.infer if needed, but store should define its own types)</item>
    </must_not_contain>
    <success_signal>File exists, tsc noEmit passes, CanvasNode + CanvasEdge + useCanvasStore all exported.</success_signal>
  </output_expected>
</task_packet>
```

---

### p1-mc-FE-canvas — MateriaCanvas Component

```xml
<task_packet>
  <task_id>p1-mc-FE-canvas</task_id>
  <assigned_to>Frontend Engineer</assigned_to>
  <priority>P1 CORE</priority>
  <description>
    Build the MateriaCanvas React component and its custom MateriaNode using @xyflow/react.
    This is the visual heart of the feature: a dark void canvas where agent and skill orbs float
    as glowing FF7-style materia spheres, connected by teal directional beams.

    The component receives available agents/skills from its parent (passed as props — no tRPC
    calls inside the canvas). It reads/writes canvas state via useCanvasStore.

    @xyflow/react must be added to packages/client/package.json before this task starts.
    Run: npm install @xyflow/react -w @gander-studio/client
  </description>
  <success_criteria>
    1. packages/client/src/components/compose/MateriaCanvas.tsx exists and compiles.
    2. packages/client/src/components/compose/MateriaNode.tsx exists — custom React Flow node.
    3. packages/client/src/constants/canvas.ts exists — all magic values (orb sizes, glow radii, edge stroke widths, z-index layers, auto-layout radius) live here, never inline.
    4. MateriaCanvas props interface:
       - availableAgents: Array<{ name: string; filePath: string }>
       - availableSkills: Array<{ name: string; filePath: string }>
       - isSaving: boolean
    5. Orchestrator node is always present on mount (sourced from canvas store initial state).
       It renders centered in the React Flow viewport on first paint.
    6. MateriaNode renders:
       - A circular orb div sized ~56px (MATERIA_ORB_SIZE_PX constant) at the data.type === 'agent' (orchestrator → yellow --my, impl → green --mg, etc.) color from getMateriaColor()
       - Box shadow glow using the same color: `0 0 18px {color}, 0 0 40px {color}40`
       - Node label below the orb: agent/skill name in var(--fb) font, 10px, var(--wm) color
       - The orchestrator node renders 20% larger than peers (ORCHESTRATOR_ORB_SCALE constant)
       - A visible edge-connection handle on the bottom or right of each node (React Flow Handle)
    7. Palette sidebar inside MateriaCanvas:
       - A vertical panel (left edge, ~200px wide) listing availableAgents and availableSkills
       - Each palette item has a draggable indicator; dragging it onto the canvas viewport calls addNode() on the canvas store with a position near the drop point
       - Items already on canvas are shown with a checkmark (dimmed, not re-draggable)
       - Search/filter input at the top of the palette
    8. Drag-to-link: dragging from a node's Handle to another node creates an edge via addEdge()
    9. SVG edges rendered by React Flow styled with:
       - stroke: var(--mt) (teal)
       - strokeWidth: 2
       - filter: drop-shadow with var(--gt) glow
       - animated dash (markerEnd arrow in teal)
    10. Node repositioning: dragging a node calls updateNodePosition() in the canvas store.
    11. Right-click or "×" button on a node removes it (removeNode()). Orchestrator node cannot be removed — its remove button is hidden/disabled.
    12. Canvas background: var(--void) (#070d0c) fill; React Flow background dots or grid pattern in a very subtle teal tint.
    13. React Flow controls (zoom in/out/fit) rendered in bottom-right corner.
    14. TypeScript strict — no implicit any. All React Flow node/edge data typed via NodeData and EdgeData generics.
    15. No raw hex values anywhere in the component files — all colors via CSS custom properties or getMateriaColor() return values.
    16. tsc --noEmit passes for packages/client.
  </success_criteria>
  <context_files>
    packages/client/src/store/canvas-store.ts (output of p1-mc-FE-store)
    packages/client/src/constants/compose.ts
    packages/client/src/globals.css (for CSS var reference)
    packages/client/src/components/ui/button.tsx
  </context_files>
  <dependencies>p1-mc-FE-store</dependencies>
  <out_of_scope>
    - Do NOT call any tRPC procedures inside MateriaCanvas — data comes via props
    - Do NOT modify compose-store.ts
    - Do NOT modify packages/shared/src/schemas.ts
    - Do NOT modify ComposePage.tsx (that is p1-mc-FE-wire's job)
    - Do NOT implement the Save/Load/Name controls (those remain in ComposePage)
    - Do NOT add server files
    - Do NOT use raw hex color values — CSS custom properties only
    - Do NOT use @xyflow/react internals below the public API (no reaching into node_modules)
  </out_of_scope>
  <output_expected>
    <tag>ui_packet</tag>
    <must_contain>
      <item>Paths of all written files (MateriaCanvas.tsx, MateriaNode.tsx, constants/canvas.ts)</item>
      <item>MateriaCanvas props interface listed</item>
      <item>Description of palette drag-to-canvas mechanic (how drop position is calculated)</item>
      <item>Description of Handle-to-Handle edge linking mechanic</item>
      <item>Confirmation @xyflow/react added to packages/client/package.json</item>
      <item>Confirmation tsc --noEmit passes</item>
      <item>List of all constants defined in canvas.ts</item>
    </must_contain>
    <must_not_contain>
      <item>Raw hex color values in any component or constants file</item>
      <item>tRPC calls inside MateriaCanvas</item>
      <item>Modifications to compose-store.ts or schemas.ts</item>
      <item>Modifications to ComposePage.tsx</item>
    </must_not_contain>
    <success_signal>MateriaCanvas.tsx renders without TS errors, @xyflow/react in package.json, orchestrator node visible on mount per tsc check.</success_signal>
  </output_expected>
</task_packet>
```

---

### p1-mc-FE-wire — ComposePage Integration

```xml
<task_packet>
  <task_id>p1-mc-FE-wire</task_id>
  <assigned_to>Frontend Engineer</assigned_to>
  <priority>P1 CORE</priority>
  <description>
    Wire MateriaCanvas into ComposePage, replacing the SlotGroup list in the right panel.
    The existing left panel (ItemBrowserBody + search) is REMOVED — palette functionality
    moves inside MateriaCanvas itself (its own internal palette sidebar). The loadout name
    input, ValidationWarnings, LoadoutControls (Save/Load/New), and SaveErrorCard all remain.

    The save flow changes in one place only: handleSave must derive agents/skills/hooks from
    the canvas store (selectLoadoutPayload) instead of from compose-store.currentLoadout.
    The tRPC call signature is identical — no server changes.

    When handleLoad fires, call canvasStore.loadFromLoadout(lo.agents, lo.skills, lo.hooks)
    instead of (or in addition to) compose-store.loadLoadout. The compose-store may be kept
    for name/save state only, or removed if canvas-store subsumes it fully — agent's
    discretion, but the existing loadout.save payload shape must be preserved.

    ValidationWarnings logic: derive agents/skills counts from canvas store nodes, not from
    compose-store, so warnings remain accurate.
  </description>
  <success_criteria>
    1. ComposePage.tsx modified — SlotGroup block and the desktop ItemBrowser + mobile accordion
       are replaced by &lt;MateriaCanvas availableAgents={agents} availableSkills={skills} isSaving={isSaving} /&gt;
    2. Loadout name input (id="loadout-name-input") is preserved and still functional.
    3. LoadoutControls (Save/Load/New buttons, Popover) are preserved and still functional.
    4. ValidationWarnings is preserved — updated to derive counts from canvas store nodes.
    5. handleSave uses selectLoadoutPayload from canvas store to build the tRPC payload.
       The saveMutation.mutate call is structurally identical: { name, agents, skills, hooks, createdAt }.
    6. handleLoad calls canvasStore.loadFromLoadout(lo.agents, lo.skills, lo.hooks); the orchestrator
       node is not duplicated (loadFromLoadout must handle this).
    7. handleNew calls canvasStore.resetCanvas() to return to orchestrator-only state.
    8. No changes to packages/server/ or packages/shared/.
    9. No new tRPC procedures.
    10. tsc --noEmit passes for all three packages (shared, server, client).
    11. npm run lint passes (same command: tsc --noEmit × 3).
    12. The right-panel layout ("loadout-builder" div) now contains: name input → MateriaCanvas (flex:1) → ValidationWarnings → LoadoutControls → SaveErrorCard.
    13. Responsive CSS for ".compose-panels" at mobile breakpoints is updated or removed
        (canvas does not need the old accordion pattern; canvas can scroll/zoom on mobile via React Flow's own touch handling).
    14. data-testid="compose-page" attribute on the root div is preserved.
  </success_criteria>
  <context_files>
    packages/client/src/pages/ComposePage.tsx (full file — agent must read before editing)
    packages/client/src/store/canvas-store.ts (output of p1-mc-FE-store)
    packages/client/src/components/compose/MateriaCanvas.tsx (output of p1-mc-FE-canvas)
    packages/client/src/store/compose-store.ts
    packages/client/src/constants/compose.ts
    packages/shared/src/schemas.ts
  </context_files>
  <dependencies>p1-mc-FE-canvas</dependencies>
  <out_of_scope>
    - Do NOT modify packages/server/ or packages/shared/
    - Do NOT add new tRPC procedures
    - Do NOT change the loadout.save payload shape — agents/skills/hooks as string[]
    - Do NOT rebuild MateriaCanvas internals — treat it as a black box import
    - Do NOT remove the loadout name input, Save/Load/New controls, or ValidationWarnings
    - Do NOT add canvasState to LoadoutSchema
  </out_of_scope>
  <output_expected>
    <tag>ui_packet</tag>
    <must_contain>
      <item>Confirmation ComposePage.tsx modified (diff summary)</item>
      <item>Confirmation SlotGroup + ItemBrowserBody blocks removed from right panel</item>
      <item>Confirmation handleSave uses selectLoadoutPayload from canvas store</item>
      <item>Confirmation handleLoad calls canvasStore.loadFromLoadout</item>
      <item>Confirmation handleNew calls canvasStore.resetCanvas</item>
      <item>Confirmation ValidationWarnings derives counts from canvas store nodes</item>
      <item>Confirmation tsc --noEmit passes for all three packages</item>
      <item>Confirmation no files in packages/server/ or packages/shared/ were modified</item>
    </must_contain>
    <must_not_contain>
      <item>Modifications to packages/server/ files</item>
      <item>Modifications to packages/shared/src/schemas.ts</item>
      <item>Removal of loadout name input or Save/Load controls</item>
      <item>New tRPC procedure definitions</item>
      <item>Raw hex color values added to ComposePage</item>
    </must_not_contain>
    <success_signal>tsc --noEmit passes all three packages; ComposePage renders MateriaCanvas with orchestrator node; save flow produces valid LoadoutSchema payload.</success_signal>
  </output_expected>
</task_packet>
```

---

## Dependency Order

```
p1-mc-FE-store  →  p1-mc-FE-canvas  →  p1-mc-FE-wire
```

p1-mc-FE-store has no dependencies and can start immediately.
p1-mc-FE-canvas cannot start until p1-mc-FE-store is complete (needs exported types).
p1-mc-FE-wire cannot start until p1-mc-FE-canvas is complete (needs the component to import).

All three require a single audit pass at the end (one AUD task over the full changeset, not per-task), unless the Orchestrator opts for rolling audits.

---

## Pre-flight Check for Orchestrator

Before dispatching p1-mc-FE-canvas, confirm @xyflow/react is installed:
```bash
cd /home/jhber/projects/gander-studio-alpha
npm install @xyflow/react -w @gander-studio/client
```
This should be done before the FE canvas agent starts so it has the package available for import resolution during tsc.

---

## Files Expected to Change

| file | task | action |
|---|---|---|
| packages/client/src/store/canvas-store.ts | p1-mc-FE-store | CREATE |
| packages/client/src/components/compose/MateriaCanvas.tsx | p1-mc-FE-canvas | CREATE |
| packages/client/src/components/compose/MateriaNode.tsx | p1-mc-FE-canvas | CREATE |
| packages/client/src/constants/canvas.ts | p1-mc-FE-canvas | CREATE |
| packages/client/package.json | p1-mc-FE-canvas | MODIFY (add @xyflow/react) |
| packages/client/src/pages/ComposePage.tsx | p1-mc-FE-wire | MODIFY |

**Files that must NOT change:**
- packages/shared/src/schemas.ts
- packages/server/src/router.ts
- packages/server/src/server.ts
- packages/client/src/pages/ExportPage.tsx
- packages/client/src/pages/BrowsePage.tsx (if exists)
- packages/client/src/pages/EditPage.tsx (if exists)
- packages/client/src/store/compose-store.ts (leave in place; canvas-store is additive)
