# Task Decomposition — gander-studio-p2-canvas-link
Generated: 2026-03-28T00:10:00Z
PM: PM#0

---

## Source File Findings (pre-decomposition reads)

| File | Key finding |
|---|---|
| `packages/shared/src/schemas.ts` | `LoadoutSchema` has no `connections` field. `AgentSchema` has no `communicates_with`. |
| `packages/client/src/store/canvas-store.ts` | `loadFromLoadout` drops edges on load. `selectLoadoutPayload` returns `hooks: []` and no `connections`. No `loadEdgesFromLoadout` action exists. |
| `packages/client/src/components/compose/MateriaNode.tsx` | Flat CSS circle — `backgroundColor` + `boxShadow` only. No glassmorphism layers. |
| `packages/client/src/components/compose/MateriaCanvas.tsx` | Proximity auto-link fires at drag-end (threshold = 60px). Plain teal edge stroke. No animation. No sound. No hierarchical list panel. |
| `packages/client/src/constants/canvas.ts` | `EDGE_GLOW` token exists (`'0 0 6px rgba(84,153,181,0.5)'`) but is not applied to edges. `CANVAS_PROXIMITY_THRESHOLD_PX = 60`. |
| `packages/client/src/pages/ComposePage.tsx` | `handleSave` builds payload without connections. `handleLoad` calls `canvasLoadFromLoadout(lo)` — edges will be restored once store supports it. No `LoadoutListPanel`. |
| `packages/server/src/router.ts` | `loadout.save` serializes the full input schema — adding `connections` to the schema automatically includes it in save/load. `loadout.list` re-parses via `LoadoutSchema.safeParse` — `.default([])` on `connections` makes old files backward compatible. |
| `packages/server/src/parsers/agent-parser.ts` | Does not read `communicates_with`. `agent.save` in router does not write it. |

---

```xml
<task_decomposition task_id="gander-studio-p2-canvas-link" agent_count="3">

  <task_packets>

    <!-- ═══════════════════════════════════════════════════════════════════════
         WAVE 1 — Task A: Backend / Data Model
         ═══════════════════════════════════════════════════════════════════════ -->
    <task_packet>
      <task_id>gander-studio-p2-canvas-link-001</task_id>
      <assigned_to>Backend Engineer (BE)</assigned_to>
      <wave>1</wave>
      <priority>HIGH</priority>
      <description>
        Extend the shared data model and canvas store to support connection persistence:

        1. **packages/shared/src/schemas.ts** — Add two fields:
           - `LoadoutSchema`: add `connections: z.array(z.object({ source: z.string(), target: z.string() })).default([])`. This is additive and backward-compatible — existing loadout JSON files without the field will parse successfully via `.default([])`.
           - `AgentSchema`: add `communicates_with: z.array(z.string()).optional()`. This is optional — existing agent `.md` files without the frontmatter field are unaffected.

        2. **packages/server/src/parsers/agent-parser.ts** — In `parseAgentFile`, read `communicates_with` from frontmatter. If present, parse it as a comma-separated string (same pattern as `tools`). Pass it through to `AgentSchema.parse`.

        3. **packages/server/src/router.ts** — In `agentRouter.save`, add `communicates_with` to the serialized frontmatter block if it is non-empty (same conditional pattern as `versionLine`/`tierLine`):
           ```
           const communicatesLine = input.communicates_with?.length
             ? `communicates_with: ${input.communicates_with.join(', ')}\n`
             : '';
           ```
           No change needed to `loadout.save` or `loadout.list` — they already serialize/deserialize the full `LoadoutSchema`, so adding `connections` to the schema is sufficient.

        4. **packages/client/src/store/canvas-store.ts** — Four changes:
           a. Update `loadFromLoadout` signature to accept `connections?: Array<{source: string; target: string}>` in addition to the current `{ agents, skills, hooks }` shape.
           b. After populating nodes, if `connections` is provided, call `addEdge(c.source, c.target)` for each entry (guard against missing node IDs — skip edges whose source or target node is not in the populated node set).
           c. Update `selectLoadoutPayload` to include `connections`: map `state.edges` to `{ source: e.source, target: e.target }`.
           d. Update the `CanvasState` interface to reflect the new `loadFromLoadout` signature.

        5. **packages/client/src/pages/ComposePage.tsx** — Update `handleSave` to include `connections` from `selectLoadoutPayload`. Update `handleLoad` so it passes `lo.connections` through to the updated `canvasLoadFromLoadout` call.
           - Current `handleSave` line: builds object with `agents, skills, hooks, name, createdAt` — add `connections: canvasEdges.map(e => ({ source: e.source, target: e.target }))` where `canvasEdges = useCanvasStore(s => s.edges)`.
           - Current `handleLoad` line: `canvasLoadFromLoadout(lo)` — the updated store accepts the full loadout shape; just ensure `lo.connections` is passed through (it will be on the Loadout type once schema is updated).
      </description>

      <success_criteria>
        1. `tsc --noEmit` passes on all three packages with no type errors.
        2. `LoadoutSchema.parse({ name: 'x', agents: [], skills: [], hooks: [], createdAt: '' })` succeeds and returns `connections: []` (default).
        3. `LoadoutSchema.parse({ name: 'x', agents: [], skills: [], hooks: [], createdAt: '', connections: [{ source: 'a', target: 'b' }] })` succeeds.
        4. `AgentSchema.parse({ name: 'n', description: 'd', tools: [], model: 'm', body: '', filePath: '' })` succeeds without `communicates_with`.
        5. `selectLoadoutPayload` returns a `connections` array reflecting current canvas edges.
        6. `loadFromLoadout` called with `connections: [{ source: 'orchestrator', target: 'pm' }]` on a canvas containing both nodes results in one edge in `state.edges`.
        7. `loadFromLoadout` called with a connection referencing a missing node silently skips that edge (no throw).
        8. `ComposePage.handleSave` includes connections in the mutation payload.
        9. `ComposePage.handleLoad` restores edges on canvas from a saved loadout.
      </success_criteria>

      <context_files>
        packages/shared/src/schemas.ts
        packages/client/src/store/canvas-store.ts
        packages/server/src/router.ts
        packages/server/src/parsers/agent-parser.ts
        packages/client/src/pages/ComposePage.tsx
        packages/client/src/constants/canvas.ts
      </context_files>

      <dependencies>none</dependencies>

      <out_of_scope>
        - No CSS changes. No React component changes outside ComposePage wiring.
        - Do NOT modify MateriaNode.tsx or MateriaCanvas.tsx — that is FE-001 scope.
        - Do NOT add a LoadoutListPanel — that is FE-001 scope.
        - Do NOT modify ExportPage.tsx or export router — connections are a canvas concern, not export concern in this sprint.
        - Do NOT remove the `hooks: []` default in selectLoadoutPayload — hooks remain compose-store managed.
        - Do NOT alter the `removeNode` guard on ORCHESTRATOR_ID — that is existing behavior.
      </out_of_scope>

      <output_expected>
        <tag>completion_packet</tag>
        <must_contain>
          <item>Updated packages/shared/src/schemas.ts with LoadoutSchema.connections and AgentSchema.communicates_with</item>
          <item>Updated packages/client/src/store/canvas-store.ts with loadFromLoadout accepting connections + selectLoadoutPayload emitting connections</item>
          <item>Updated packages/client/src/pages/ComposePage.tsx wiring connections in save and load</item>
          <item>Updated packages/server/src/parsers/agent-parser.ts reading communicates_with</item>
          <item>Updated packages/server/src/router.ts writing communicates_with in agent.save</item>
          <item>Confirmation that tsc --noEmit passes on all three packages</item>
          <item>Confirmation that old loadout JSON without connections field still parses (backward-compat)</item>
        </must_contain>
        <must_not_contain>
          <item>Any CSS or style changes</item>
          <item>Any changes to MateriaNode.tsx or MateriaCanvas.tsx</item>
          <item>Any new React components</item>
          <item>Breaking changes to loadout.save or loadout.list router behavior</item>
        </must_not_contain>
        <success_signal>tsc --noEmit passes on all three packages; completion_packet confirms all 9 success criteria met; no new TS errors in any changed file.</success_signal>
      </output_expected>
    </task_packet>

    <!-- ═══════════════════════════════════════════════════════════════════════
         WAVE 1 — Task B: UI Designer
         ═══════════════════════════════════════════════════════════════════════ -->
    <task_packet>
      <task_id>gander-studio-p2-canvas-link-002</task_id>
      <assigned_to>UI Designer (UI)</assigned_to>
      <wave>1</wave>
      <priority>HIGH</priority>
      <description>
        Produce a design_spec for the following five surfaces. The FE agent will implement from this spec — be precise with CSS values, numeric parameters, and layout measurements. Do not write React/TypeScript code.

        **Design context:**
        - Design language: FF7 Remake Intergrade — Mako Teal palette
        - CSS custom properties available: `--mt` (Mako Teal), `--gt` (glow teal), `--void` (deep background), `--sf`, `--sfm`, `--sfh` (surface levels), `--bd`, `--bdb` (borders), `--wd`, `--wm`, `--w` (text whites), `--my` (Mako Yellow), `--redb`, `--red`
        - Orb sizes: standard = 56px diameter, orchestrator = 68px diameter
        - Constraint: CSS only — no SVG, no `<canvas>`, no images. Background gradients + pseudo-elements allowed.

        **Surface 1: Glassy 3D CSS Orb**
        Specify a CSS treatment for the orb `div` (56px circle) that gives it a glassy, almost 3D appearance. Must use only `background` (radial/linear gradients), `box-shadow`, and optionally `::before`/`::after` pseudo-elements (also pure CSS). Required elements:
        - Specular highlight: a small bright oval at top-left of the sphere suggesting a light source.
        - Depth gradient: darker at bottom/edges, lighter/semi-transparent at highlight zone.
        - Rim glow: a subtle outer glow using the orb's base color.
        - The base color is supplied at runtime via the `getMateriaColor(name, type)` function — CSS spec must accommodate a variable base color (use CSS custom property `--orb-color` as the injection point, set inline via React style).

        **Surface 2: Magnetic Snap Animation**
        During drag, when an orb enters proximity of another orb (within 60px center-to-center), both orbs should exhibit a "magnetic pull" visual. Specify:
        - CSS keyframe `@keyframes orb-attract` — slight scale-up + toward-target translation (translate should be directional but can use a fixed axis as an approximation since exact direction requires JS; specify the keyframe, note that the translate values will be applied via JS inline style override at runtime based on drag vector).
        - Transition duration and easing values.
        - Visual state: when in "attracted" state, orb glows brighter (box-shadow intensifies). Provide exact CSS values.

        **Surface 3: Link Flash Effect**
        At the moment two orbs link (edge created), specify:
        - A CSS keyframe `@keyframes orb-link-flash` on each orb — a brief (200–400ms) bright pulse, then settle to a "linked" persistent glow state.
        - The edge that appears: animated stroke (React Flow `animated: true`) + a glowing filter. Provide exact edge style object values (stroke color, stroke width, filter).
        - "Linked" persistent orb state: a subtle always-on ring that distinguishes linked orbs from unlinked ones.

        **Surface 4: LoadoutListPanel Layout**
        A right-side panel (240px wide) adjacent to the canvas that shows a hierarchical, readable list of everything on the canvas, grouped by type:
        - Section: AGENTS — list of agent orb names, each with a small colored dot (uses getMateriaColor), with connection indicators (e.g. "↔ pm, auditor" when that agent has edges).
        - Section: SKILLS — same pattern, no connection indicator needed.
        - Section: CONNECTIONS — list of edge pairs as "source → target".
        - Bidirectional: clicking a list item selects/highlights the corresponding canvas node. Adding/removing from canvas updates the list in real time (this is automatic via Zustand subscription — just note the data binding requirement).
        - Provide: panel width, background color (use design tokens), section heading styles (font-size, letter-spacing, color), row styles, dot size, connection indicator format.

        **Surface 5: Web Audio API Sound Parameters**
        Provide numeric parameters only (no code). The FE agent will implement the Web Audio API hooks.

        For the "approach tone" (plays continuously when orb is within proximity during drag, stops on drop):
        - Oscillator type (sine/square/sawtooth/triangle)
        - Base frequency (Hz)
        - Gain envelope (attack ms, sustain level 0–1, release ms)
        - Any filter type + frequency if desired

        For the "ker-chink link tone" (plays once on edge creation):
        - Primary oscillator type + frequency (Hz)
        - Optional secondary oscillator type + frequency for harmonic richness
        - Gain envelope (attack ms, peak level 0–1, decay ms to sustain, sustain level, release ms)
        - Duration until AudioContext node cleanup (ms)
        - Character goal: satisfying, glassy, slightly metallic — like two glass spheres touching
      </description>

      <success_criteria>
        1. design_spec covers all 5 surfaces — no surface omitted.
        2. Glassy orb CSS spec uses `--orb-color` as the injection variable and specifies all gradient stops with explicit alpha/lightness values.
        3. Magnetic snap keyframe is named `orb-attract` and includes both scale and translate components with numeric values.
        4. Link flash keyframe is named `orb-link-flash` with explicit timing (ms), and the edge style object contains stroke, strokeWidth, and filter values.
        5. LoadoutListPanel layout specifies all measurements in px or design tokens (no vague "small" or "compact" — exact values).
        6. Sound parameters are purely numeric — no TypeScript/JavaScript code in the spec.
        7. All color values reference existing CSS custom properties — no raw hex values.
      </success_criteria>

      <context_files>
        packages/client/src/components/compose/MateriaNode.tsx
        packages/client/src/components/compose/MateriaCanvas.tsx
        packages/client/src/constants/canvas.ts
        packages/client/src/globals.css
      </context_files>

      <dependencies>none</dependencies>

      <out_of_scope>
        - Do NOT write React components, hooks, or TypeScript code.
        - Do NOT specify changes to globals.css — FE will apply keyframes inline or in a scoped style block.
        - Do NOT specify changes to existing palette or design token definitions.
        - Do NOT design the Export page or Browse page — canvas/compose only.
        - Do NOT specify a new tRPC procedure — connections use existing loadout.save.
      </out_of_scope>

      <output_expected>
        <tag>design_spec</tag>
        <must_contain>
          <item>Surface 1: Glassy orb CSS — gradient stops, box-shadow layers, pseudo-element specs, --orb-color variable usage</item>
          <item>Surface 2: orb-attract keyframe with numeric scale + translate values, transition duration + easing, attracted box-shadow values</item>
          <item>Surface 3: orb-link-flash keyframe with ms timing, linked persistent ring CSS, edge style object (stroke, strokeWidth, filter)</item>
          <item>Surface 4: LoadoutListPanel — width (px), background token, all section/row style values, connection indicator format</item>
          <item>Surface 5: approach tone parameters (oscillator type, frequency, gain envelope), ker-chink parameters (oscillator(s), gain envelope, cleanup duration)</item>
        </must_contain>
        <must_not_contain>
          <item>Raw hex color values — use CSS custom property tokens only</item>
          <item>TypeScript or JavaScript code</item>
          <item>SVG, canvas element, or image references for orb rendering</item>
        </must_not_contain>
        <success_signal>design_spec file written to output path; all 5 surfaces present; numeric values present for all animation and sound parameters; no raw hex values; no code.</success_signal>
      </output_expected>
    </task_packet>

    <!-- ═══════════════════════════════════════════════════════════════════════
         WAVE 2 — Task C: Frontend Implementation
         ═══════════════════════════════════════════════════════════════════════ -->
    <task_packet>
      <task_id>gander-studio-p2-canvas-link-003</task_id>
      <assigned_to>Frontend Engineer (FE)</assigned_to>
      <wave>2</wave>
      <priority>HIGH</priority>
      <description>
        Implement the full canvas visual and UX upgrade. This task depends on:
        - BE-001 output (updated schemas, store, and ComposePage wiring)
        - UI Designer spec (gander-studio-p2-canvas-link-002 design_spec)

        Read both outputs before writing a single line of code. Implement each sub-deliverable as described below.

        **Sub-deliverable A: Glassy 3D CSS Orb (MateriaNode.tsx)**
        Replace the flat CSS circle with a glassy sphere using the UI Designer's spec.
        - Set `--orb-color` as an inline CSS custom property on the orb div, populated from `getMateriaColor(name, type)`.
        - Apply background radial gradient(s) and box-shadow layers from the spec.
        - If the spec calls for `::before`/`::after` pseudo-elements, implement them as absolutely-positioned child divs (React cannot style pseudo-elements inline — use `<style>` scoped tags or a CSS module if the project uses them; otherwise use child divs).
        - Orchestrator orb uses the same treatment at its larger size.
        - Preserve existing `data-testid`, aria labels, and remove-button behavior.

        **Sub-deliverable B: Magnetic Snap Animation (MateriaCanvas.tsx)**
        During drag, apply the "attracted" visual state when the dragged node is within `CANVAS_PROXIMITY_THRESHOLD_PX` (60px) of another node:
        - In `handleNodesChange`, during active drag (`change.dragging === true`), compute distances from the dragging node to all others.
        - If any distance < threshold: add CSS class `orb-attracted` to the dragging node's React Flow node via `setRFNodes` (or via the `className` field on the RF node). Also add `orb-attracted` to the nearest target node.
        - Remove `orb-attracted` class when drag ends or node leaves proximity.
        - Inject the `@keyframes orb-attract` and `.orb-attracted` CSS rules into a `<style>` block at the top of `MateriaCanvasInner` (same pattern as the existing `gs-pulse` in ComposePage). Use exact values from UI Designer spec.
        - The actual link creation remains at drag-end (existing behavior) — do not move it to drag-during.

        **Sub-deliverable C: Link Sound (useLinkSound.ts hook)**
        Create `packages/client/src/hooks/useLinkSound.ts`.
        - Export `function useLinkSound(): { playApproach: () => void; stopApproach: () => void; playLink: () => void }`.
        - All sound generation uses the Web Audio API (`AudioContext`, `OscillatorNode`, `GainNode`) — no audio files, no external libraries.
        - Use parameter values from UI Designer spec for oscillator types, frequencies, and gain envelopes.
        - `playApproach`: creates oscillator + gain, starts continuous tone. `stopApproach`: gracefully stops with release envelope (no click artifact). `playLink`: one-shot ker-chink tone with full ADSR, self-cleans after spec's cleanup duration.
        - Guard for environments where `AudioContext` is not available (SSR safety — check `typeof window !== 'undefined'`).
        - Wire into MateriaCanvas: import `useLinkSound`, call `playApproach`/`stopApproach` during proximity drag, call `playLink` in `handleNodesChange` at the moment `addEdge` fires (wrap the addEdge call with `playLink()`).

        **Sub-deliverable D: Edge Glow on Link (MateriaCanvas.tsx)**
        Update `toRFEdge` to apply edge style values from the UI Designer spec (animated: true, glowing filter/stroke) to edges. The `EDGE_GLOW` constant in `canvas.ts` already exists — use it if it matches the spec; update it if the spec differs.

        **Sub-deliverable E: LoadoutListPanel (new component)**
        Create `packages/client/src/components/compose/LoadoutListPanel.tsx`.
        - Props: `{ nodes: CanvasNode[]; edges: CanvasEdge[]; onSelectNode?: (id: string) => void }`.
        - Renders a 240px-wide right panel per the UI Designer's layout spec with three sections: AGENTS, SKILLS, CONNECTIONS.
        - AGENTS section: each agent row shows a 6px colored dot (getMateriaColor), agent name, and if the agent has edges, a compact "↔ x, y" connection label.
        - SKILLS section: same, no connection indicator.
        - CONNECTIONS section: each edge as "source → target".
        - When `onSelectNode` is provided, clicking an agent/skill row calls it with the node id.
        - All interactive rows: keyboard-accessible (role="button", tabIndex=0, onKeyDown Enter/Space triggers same as click), aria-label="Select {name} on canvas".
        - Uses only design token CSS custom properties — no raw hex values.

        **Sub-deliverable F: Wire LoadoutListPanel into ComposePage (or MateriaCanvas)**
        Add `LoadoutListPanel` to the compose layout. Best placement: inside `MateriaCanvasInner` as a sibling to the palette and the ReactFlow div, or as a right-panel sibling inside ComposePage's canvas container div. Use canvas-store subscriptions (`useCanvasStore`) for nodes/edges — do not pass them as props through MateriaCanvas (avoid prop drilling through MateriaCanvas when the store already holds the data).

        Preferred layout: `[Palette | Canvas | LoadoutListPanel]` — three-column row within the existing canvas container, similar to how `MateriaPalette` is currently a flex sibling to the ReactFlow div. Reduce the canvas flex area to accommodate the new 240px right panel.

        When a node is clicked/selected via the panel, use `rfInstance.fitView({ nodes: [{ id }], padding: 0.5 })` (or `setCenter`) to focus the canvas on that node.

        **Sub-deliverable G: Accessibility and TypeScript**
        - All new interactive elements: keyboard nav, aria labels, no raw hex values.
        - TypeScript strict mode — no `any` without justification comment.
        - `tsc --noEmit` must pass on all three packages.
      </description>

      <success_criteria>
        1. `tsc --noEmit` passes on all three packages.
        2. MateriaNode orbs render with visible glass/3D effect (gradient + specular highlight visible in browser).
        3. Dragging an orb near another triggers `orb-attracted` CSS class on both orbs within 60px proximity; class removed on drag-end.
        4. On edge creation, `playLink` fires (Web Audio API) — verified by no console errors and AudioContext active.
        5. Approach tone plays during proximity drag, stops cleanly on drag-end.
        6. Edges have glow filter applied (visible in browser and in `toRFEdge` output).
        7. `LoadoutListPanel` renders in the compose layout showing agents, skills, and connections sections.
        8. Adding/removing nodes from canvas updates LoadoutListPanel in real time.
        9. Clicking a panel row focuses the corresponding node on the canvas.
        10. All new interactive elements are keyboard-navigable (Tab, Enter/Space).
        11. No raw hex values in any new or modified component file.
        12. Existing Playwright tests continue to pass (no regressions to existing `data-testid` attributes or aria labels).
        13. `useLinkSound` hook is SSR-safe (AudioContext guard present).
      </success_criteria>

      <context_files>
        packages/client/src/components/compose/MateriaNode.tsx
        packages/client/src/components/compose/MateriaCanvas.tsx
        packages/client/src/constants/canvas.ts
        packages/client/src/store/canvas-store.ts
        packages/client/src/pages/ComposePage.tsx
        packages/client/src/constants/compose.ts
        .claude/agents/tasks/outputs/gander-studio-p2-canvas-link-001-BE-*.md  (BE-001 output)
        .claude/agents/tasks/outputs/gander-studio-p2-canvas-link-002-UI-*.md  (UI Designer spec)
      </context_files>

      <dependencies>
        gander-studio-p2-canvas-link-001
        gander-studio-p2-canvas-link-002
      </dependencies>

      <out_of_scope>
        - Do NOT modify packages/shared/src/schemas.ts — already done by BE-001.
        - Do NOT modify packages/server/src/router.ts or agent-parser.ts — already done by BE-001.
        - Do NOT modify ExportPage.tsx or export logic.
        - Do NOT add audio files to the project — Web Audio API only.
        - Do NOT use SVG, <canvas>, or images for orb rendering — CSS only.
        - Do NOT modify globals.css for keyframe injection — use scoped <style> blocks in components.
        - Do NOT use third-party animation libraries (framer-motion, anime.js, etc.).
        - Do NOT re-implement loadout save/load logic — it is wired in ComposePage; just ensure LoadoutListPanel reads from canvas-store subscriptions.
        - Do NOT break existing proximity link behavior — orbs still auto-link at drag-end within 60px; magnetic snap is a visual addition on top.
      </out_of_scope>

      <output_expected>
        <tag>ui_packet</tag>
        <must_contain>
          <item>components_created: ["LoadoutListPanel.tsx", "hooks/useLinkSound.ts"]</item>
          <item>components_modified: ["MateriaNode.tsx", "MateriaCanvas.tsx"]</item>
          <item>build: passing (tsc --noEmit result)</item>
          <item>a11y_notes: keyboard nav confirmed for LoadoutListPanel rows</item>
          <item>sound_implementation: description of AudioContext nodes used for approach + link tones</item>
          <item>glass_orb_technique: description of CSS layers applied (gradients, pseudo-elements, box-shadows)</item>
          <item>magnetic_snap_impl: description of how orb-attracted class is applied/removed during drag</item>
        </must_contain>
        <must_not_contain>
          <item>Raw hex color values in any component file</item>
          <item>any TypeScript `any` type without justification comment</item>
          <item>Audio file imports (only Web Audio API)</item>
          <item>SVG or canvas element for orb rendering</item>
          <item>Changes to ExportPage.tsx, browse-store.ts, or export router</item>
        </must_not_contain>
        <success_signal>tsc --noEmit passes; ui_packet includes all required fields; LoadoutListPanel renders; MateriaNode has glass CSS; useLinkSound hook file exists with AudioContext guard.</success_signal>
      </output_expected>
    </task_packet>

  </task_packets>

  <dependency_order>
    gander-studio-p2-canvas-link-001 (BE, Wave 1, parallel)
    gander-studio-p2-canvas-link-002 (UI Designer, Wave 1, parallel)
    → both must complete before →
    gander-studio-p2-canvas-link-003 (FE, Wave 2)
  </dependency_order>

  <routing_notes>
    1. Wave 1 tasks (BE-001 and UI-001) are independent — dispatch in parallel.
    2. FE-001 must receive BOTH the BE-001 completion_packet AND the UI-001 design_spec before starting. The Orchestrator should include both output file paths in the FE-001 context_files block when dispatching.
    3. BE-001 and FE-001 both touch MateriaCanvas.tsx in different ways — BE-001 explicitly does NOT touch it (out_of_scope). If the Critic flags any overlap, the resolution is clear: BE owns data model + store + ComposePage wiring; FE owns all visual/component files.
    4. FE-001 is lint-critical (multiple TypeScript files modified, AudioContext type usage, ReactFlow generics). Dispatch as foreground agent or run `npm run lint` manually in the main session after FE returns. The lint command is `tsc --noEmit` on all three packages.
    5. The constants/compose.ts file is needed by FE-001 (getMateriaColor) — include it in context. It was not listed in context_files above because FE agent should read it themselves; flag to Orchestrator to include the path.
    6. Human verification (Step 4.5) is required for this sprint — it has significant FE visual work. Before declaring done, confirm in browser: glassy orbs visible, snap animation fires, link sound plays, LoadoutListPanel renders with live data.
  </routing_notes>

  <risk_flags>
    1. **ReactFlow v12 node className API**: The magnetic snap implementation adds/removes CSS class `orb-attracted` to ReactFlow nodes. In @xyflow/react v12, nodes support a `className` field on the Node object. Setting this via `setRFNodes` during drag changes should work, but if it triggers excessive re-renders (React 19 strict mode), the FE agent should use a CSS variable approach instead (set `--orb-attracted: 1` on the node's DOM element directly via a ref).
    2. **Web Audio API autoplay policy**: Browsers require a user gesture before AudioContext can start. The approach tone (triggered by drag) satisfies this (drag = user gesture). The ker-chink tone fires on drop (also user gesture). No autoplay risk. FE agent should handle `AudioContext.state === 'suspended'` by calling `.resume()` before playing.
    3. **LoadoutListPanel width budget**: Adding a 240px right panel means the canvas area shrinks. Current canvas container has `height: 520` fixed in ComposePage. Confirm the layout still looks acceptable at common viewport widths (1024px+). FE agent should use a collapsible panel or min-width guard if the canvas becomes too narrow.
    4. **CSS pseudo-elements in React**: MateriaNode uses inline styles exclusively. CSS pseudo-elements (::before/::after) cannot be set via inline styles. FE agent must use either: (a) absolutely-positioned child divs, (b) a scoped `<style>` block injected into the component, or (c) a CSS class + stylesheet. Option (b) is consistent with the existing pattern in ComposePage (the `gs-pulse` keyframe).
    5. **`communicates_with` in AgentSchema**: Adding this optional field means `AgentSchema.parse` may now receive it from agent files. The agent.save router serializes it to frontmatter. If an existing agent file has a `communicates_with:` frontmatter line for an unrelated reason, the parser will now read it. Risk is minimal (no existing agent files have this field) but BE agent should verify by grepping agent files.
  </risk_flags>

</task_decomposition>
```

---

## Expectation Manifest

```xml
<expectation_manifest>
  <sprint_id>gander-studio-p2-canvas-link</sprint_id>
  <generated>2026-03-28T00:10:00Z</generated>
  <assignments>

    <assignment>
      <task_id>gander-studio-p2-canvas-link-001</task_id>
      <agent>BE#1</agent>
      <expected_tag>completion_packet</expected_tag>
      <expected_file>.claude/agents/tasks/outputs/gander-studio-p2-canvas-link-001-BE-*.md</expected_file>
      <blocks>gander-studio-p2-canvas-link-003</blocks>
      <receipt_check>
        <item>LoadoutSchema.connections field present with .default([])</item>
        <item>AgentSchema.communicates_with field present as optional</item>
        <item>selectLoadoutPayload returns connections array</item>
        <item>loadFromLoadout accepts connections param</item>
        <item>ComposePage.handleSave includes connections in payload</item>
        <item>ComposePage.handleLoad passes connections to canvasLoadFromLoadout</item>
        <item>tsc --noEmit passing confirmed in packet</item>
        <item>No CSS/component changes — completion_packet must not list MateriaNode.tsx or MateriaCanvas.tsx</item>
      </receipt_check>
    </assignment>

    <assignment>
      <task_id>gander-studio-p2-canvas-link-002</task_id>
      <agent>UI#1</agent>
      <expected_tag>design_spec</expected_tag>
      <expected_file>.claude/agents/tasks/outputs/gander-studio-p2-canvas-link-002-UI-*.md</expected_file>
      <blocks>gander-studio-p2-canvas-link-003</blocks>
      <receipt_check>
        <item>All 5 surfaces present in spec (glassy orb, magnetic snap, link flash, list panel, sound params)</item>
        <item>--orb-color CSS variable named as injection point for base color</item>
        <item>orb-attract keyframe named exactly "orb-attract" with numeric scale + translate values</item>
        <item>orb-link-flash keyframe named exactly "orb-link-flash" with ms timing</item>
        <item>Edge style object present with stroke, strokeWidth, filter values</item>
        <item>LoadoutListPanel width stated in px (expected: 240px)</item>
        <item>Sound params are numeric only — no TypeScript/JS code present</item>
        <item>No raw hex values — all colors use CSS custom property tokens</item>
      </receipt_check>
    </assignment>

    <assignment>
      <task_id>gander-studio-p2-canvas-link-003</task_id>
      <agent>FE#1</agent>
      <expected_tag>ui_packet</expected_tag>
      <expected_file>.claude/agents/tasks/outputs/gander-studio-p2-canvas-link-003-FE-*.md</expected_file>
      <blocks>NONE</blocks>
      <receipt_check>
        <item>components_created includes LoadoutListPanel.tsx and hooks/useLinkSound.ts</item>
        <item>components_modified includes MateriaNode.tsx and MateriaCanvas.tsx</item>
        <item>build: passing — tsc --noEmit result confirmed</item>
        <item>useLinkSound.ts has AudioContext availability guard</item>
        <item>No raw hex values in any modified file</item>
        <item>No audio file imports — Web Audio API only</item>
        <item>a11y_notes confirms keyboard nav on LoadoutListPanel rows</item>
        <item>No changes to ExportPage.tsx, schemas.ts, router.ts, or agent-parser.ts</item>
      </receipt_check>
    </assignment>

  </assignments>
</expectation_manifest>
```
