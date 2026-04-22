# PM Revised Decomposition — gander-studio-p2-canvas-link
# Revision 1 — addressing CRITIQUE_BLOCK (5 BLOCKERs, 2 WARNINGs)

## Blocker Resolution Summary

| Blocker | Resolution |
|---|---|
| C1: FE task 003 overscoped (6 units, one turn) | Split into 003a (wave 2, visual CSS), 003b (wave 3, interaction + sound), 003c (wave 4, list panel + wiring) |
| C2: BE task 001 overscoped (5 files, 3 packages + file conflict) | Split into 001a (BE, wave 1, server/shared only) and 001b (FE, wave 2, client wiring only) |
| C3: AudioContext autoplay policy unverified | Added 003-RA (Researcher, wave 1); 003b blocked on RA dossier |
| C4: No Playwright Tier 2 in FE success criteria | Named Tier 2 spec file in every FE sub-task |
| C5: communicates_with round-trip broken | 001a requires comma-delimited serialization, comma-split normalization, and round-trip test criterion |
| C6 (WARNING) | human_confirmation_gate before 003c: flat vs. tree hierarchy |
| C7 (WARNING) | Each FE sub-task requires all animation/sound numerics as named constants in canvas.ts |

## Wave Structure

```
Wave 1 (parallel): 001a (BE), 002 (UI Designer), 003-RA (Researcher)
Wave 2 (after 001a audit): 001b (FE — canvas-store + ComposePage)
Wave 2 also (after 002 audit, parallel with 001b): 003a (FE — glassy orb CSS + edge glow)
Wave 3 (after 003a + 003-RA audit): 003b (FE — proximity animation + sound)
[Human confirmation gate: flat vs. tree]
Wave 4 (after 001b + 003b + human confirmation): 003c (FE — LoadoutListPanel + wiring)
```

```xml
<task_decomposition task_id="gander-studio-p2-canvas-link" agent_count="7" revision="1">

  <task_packets>

    <!-- WAVE 1 — 001a: BE schema + parser + router (server/shared only) -->
    <task_packet>
      <task_id>gander-studio-p2-canvas-link-001a</task_id>
      <assigned_to>Backend Engineer (BE)</assigned_to>
      <wave>1</wave>
      <priority>HIGH</priority>
      <description>
        Extend shared schema and server-side parser/router only.

        1. packages/shared/src/schemas.ts:
           - LoadoutSchema: add `connections: z.array(z.object({ source: z.string(), target: z.string() })).default([])`
           - AgentSchema: add `communicates_with: z.array(z.string()).optional()`

        2. packages/server/src/parsers/agent-parser.ts:
           - Read `communicates_with` from frontmatter.
           - Apply same comma-split normalization as the tools field (lines 44-49): split on ", " or "," and trim each value.
           - Works correctly through BOTH gray-matter path AND parseFrontmatterFallback path.

        3. packages/server/src/router.ts (agentRouter.save):
           - Serialize communicates_with as comma-delimited string: "communicates_with: backend, frontend" (same wire format as tools).
           - Only write the line if communicates_with is non-empty (same conditional pattern as versionLine/tierLine).
      </description>

      <success_criteria>
        - tsc --noEmit passes on packages/shared and packages/server.
        - LoadoutSchema.parse({ name: "x", agents: [], skills: [], hooks: [], createdAt: "" }) succeeds (backward compat, connections defaults to []).
        - LoadoutSchema.parse({ ..., connections: [{ source: "a", target: "b" }] }) succeeds.
        - AgentSchema.parse({ ..., communicates_with: ["backend", "frontend"] }) succeeds.
        - AgentSchema.parse({ ..., communicates_with: undefined }) succeeds.
        - communicates_with serialized as "communicates_with: backend, frontend" (comma-delimited, NOT YAML array).
        - Round-trip test: agent file written via agent.save with communicates_with: ["backend","frontend"] → re-parsed by parseAgentFile → returns ["backend","frontend"], verified through BOTH gray-matter and parseFrontmatterFallback paths.
        - Grep existing GANDER_ROOT/.claude/agents/*.md files: confirm no existing unrelated use of communicates_with frontmatter key.
      </success_criteria>

      <dependencies>none</dependencies>

      <out_of_scope>
        No packages/client/ files whatsoever. No canvas-store.ts. No ComposePage.tsx. No MateriaNode/MateriaCanvas.
      </out_of_scope>
    </task_packet>

    <!-- WAVE 1 — 002: UI Designer design spec -->
    <task_packet>
      <task_id>gander-studio-p2-canvas-link-002</task_id>
      <assigned_to>UI Designer (UI)</assigned_to>
      <wave>1</wave>
      <priority>HIGH</priority>
      <description>
        Produce a design_spec for five surfaces. FE implements from this spec. No React/TypeScript code.

        Design context: FF7 Remake Intergrade — Mako Teal palette. CSS tokens available: --mt, --gt, --void, --sf/sfm/sfh, --bd/bdb, --wd/wm/w, --my, --redb/red. Orb sizes: 56px standard, 68px orchestrator. Constraint: CSS only — no SVG, no canvas element, no images.

        Surface 1 — Glassy 3D CSS Orb: Specify background radial/linear gradients + box-shadow layers for a glassy sphere. Include specular highlight (top-left oval), depth gradient, rim glow. Use --orb-color as injection variable for base color. Optionally use child divs for pseudo-element shine layers. Name the CSS keyframe exactly: `orb-attract`.

        Surface 2 — Magnetic Snap: CSS keyframe `@keyframes orb-attract` with numeric scale (e.g., scale(1.08)) and translate. Transition duration + easing. Attracted box-shadow intensification values. Note that JS applies translate direction; keyframe covers scale and representative translate axis.

        Surface 3 — Link Flash: CSS keyframe `@keyframes orb-link-flash` (200-400ms bright pulse → linked glow). Linked persistent orb ring CSS (always-on when node has edges). Edge style object: stroke color, strokeWidth, filter for glow.

        Surface 4 — LoadoutListPanel Layout: 240px right panel. Background color token, section heading styles (font-size, letter-spacing, color token, text-transform), row styles (padding, gap), colored dot size, connection indicator format.

        Surface 5 — Web Audio API Sound Parameters (numbers only, no code):
        - Approach tone: oscillator type, base frequency (Hz), gain envelope (attack ms, sustain 0-1, release ms).
        - Ker-chink link tone: primary oscillator type + frequency (Hz), optional secondary + frequency for harmonic, gain ADSR (attack ms, peak 0-1, decay ms, sustain 0-1, release ms), cleanup duration ms.
      </description>

      <success_criteria>
        - All 5 surfaces covered.
        - --orb-color named as injection variable.
        - orb-attract keyframe has numeric scale + translate values.
        - orb-link-flash has ms timing.
        - Edge style object has stroke/strokeWidth/filter.
        - LoadoutListPanel measurements in px or tokens (no vague values).
        - Sound params are numeric only.
        - No raw hex values — CSS custom property tokens only.
        - No TypeScript/JS code.
      </success_criteria>

      <dependencies>none</dependencies>

      <out_of_scope>
        No React/TS code. No globals.css changes. No export/browse pages. No new tRPC procedures.
      </out_of_scope>
    </task_packet>

    <!-- WAVE 1 — 003-RA: Researcher — Web Audio autoplay policy -->
    <task_packet>
      <task_id>gander-studio-p2-canvas-link-003-RA</task_id>
      <assigned_to>Researcher (RA)</assigned_to>
      <wave>1</wave>
      <priority>HIGH</priority>
      <description>
        Research Web Audio API autoplay policy in Chromium. Answer three specific questions:

        Q1: In Chromium latest stable, does calling AudioContext.resume() inside a React onMouseDown or onDragStart handler (user activation event) permit AudioContext.state to reach 'running', and does audio produced by OscillatorNode.start() during subsequent onMouseMove events in the same drag gesture play audibly?

        Q2: If mousemove is NOT a valid activation context, what is the correct event and pattern for initializing audio that plays during drag? (e.g., resume() in mousedown, start() deferred? resume() on first user click anywhere?)

        Q3: AudioContext lifecycle: should a single AudioContext instance be reused across all interactions (created once, lazily), or created per-interaction? What is the correct cleanup pattern for OscillatorNode after playback ends?

        Sources to consult: MDN Web Audio API autoplay guide, W3C Web Audio spec, Chrome autoplay policy documentation, any relevant Chromium bug tracker entries.
      </description>

      <success_criteria>
        - Q1 answered definitively (yes/no + explanation).
        - Q2 answered with exact recommended pattern if Q1 is no.
        - Q3 answered with lifecycle recommendation.
        - All claims sourced (URL or spec section).
        - No code — factual findings only.
      </success_criteria>

      <dependencies>none</dependencies>

      <out_of_scope>
        No code. No implementation. No other audio libraries (Tone.js, Howler.js, etc.).
      </out_of_scope>
    </task_packet>

    <!-- WAVE 2 — 001b: FE canvas-store + ComposePage client wiring -->
    <task_packet>
      <task_id>gander-studio-p2-canvas-link-001b</task_id>
      <assigned_to>Frontend Engineer (FE)</assigned_to>
      <wave>2</wave>
      <priority>HIGH</priority>
      <description>
        Wire the connections data model into the client. Depends on 001a (schemas updated).

        1. packages/client/src/store/canvas-store.ts:
           - Update loadFromLoadout to accept optional connections?: Array&lt;{source:string;target:string}&gt;. After populating nodes, call addEdge(c.source, c.target) for each connection whose source and target both exist in the node set. Skip edges with missing nodes silently.
           - Update selectLoadoutPayload to include connections: state.edges.map(e => ({ source: e.source, target: e.target })).
           - Update CanvasState interface to reflect both changes.

        2. packages/client/src/pages/ComposePage.tsx:
           - handleSave: add connections from useCanvasStore(s => s.edges).map(e => ({ source: e.source, target: e.target })) to mutation payload.
           - handleLoad: pass lo.connections through to canvasLoadFromLoadout(lo) (updated store accepts full loadout shape including connections).

        3. Create packages/client/src/tests/compose/compose-connections-persist.spec.ts:
           - Playwright Tier 2: test that saving a loadout with edges and loading it restores those edges on canvas.
      </description>

      <success_criteria>
        - tsc --noEmit passes on packages/client.
        - loadFromLoadout with connections restores edges to canvas.
        - loadFromLoadout with a missing-node connection silently skips.
        - selectLoadoutPayload emits connections array.
        - ComposePage handleSave includes connections in payload.
        - ComposePage handleLoad passes connections to canvasLoadFromLoadout.
        - compose-connections-persist.spec.ts created with Tier 2 coverage.
        - All animation/sound numerics (none in this task) follow C7 rule.
      </success_criteria>

      <dependencies>gander-studio-p2-canvas-link-001a</dependencies>

      <out_of_scope>
        No server files. No MateriaNode/MateriaCanvas. No LoadoutListPanel. No glassy CSS. No sound.
      </out_of_scope>
    </task_packet>

    <!-- WAVE 2 — 003a: FE visual CSS (orb + edge glow) -->
    <task_packet>
      <task_id>gander-studio-p2-canvas-link-003a</task_id>
      <assigned_to>Frontend Engineer (FE)</assigned_to>
      <wave>2</wave>
      <priority>HIGH</priority>
      <description>
        Visual-only changes. Depends on 002 (UI spec). No interaction changes.

        A. MateriaNode.tsx: Replace flat CSS circle with glassy sphere per UI spec. Set --orb-color inline from getMateriaColor(name, type). Use child divs for specular highlight and shine layers (React cannot set ::before/::after inline). Preserve all data-testid, aria labels, remove-button behavior unchanged.

        D. MateriaCanvas.tsx (toRFEdge only): Update edge style to animated:true + glow filter per UI spec. Update EDGE_GLOW constant in canvas.ts if spec provides new values.

        Add ALL numeric values as named exports in packages/client/src/constants/canvas.ts — this includes gradient % stops, specular highlight position/size, box-shadow blur/spread radii, and child-div positional offsets. Only CSS variable references (var(--...)) are exempt from this rule.
      </description>

      <success_criteria>
        - tsc --noEmit passes on packages/client.
        - Glassy orb CSS visible: radial-gradient background, specular highlight child div, box-shadow glow layers.
        - --orb-color set inline, not hardcoded.
        - All existing data-testid and aria-label attributes preserved.
        - Remove button still renders and fires onRemove correctly.
        - Edges render with animated:true and glow filter.
        - ALL numeric values in CSS strings exported from canvas.ts — gradient % stops, specular highlight position/size, box-shadow blur/spread radii, child-div positional offsets. Only var(--...) tokens exempt.
        - No raw hex values in component files.
        - Playwright spec materia-node-glass.spec.ts created: verifies orb has gradient background (snapshot or computed style check).
      </success_criteria>

      <dependencies>gander-studio-p2-canvas-link-002</dependencies>

      <out_of_scope>
        No proximity animation. No sound. No LoadoutListPanel. No canvas-store changes. No server files.
      </out_of_scope>
    </task_packet>

    <!-- WAVE 3 — 003b: FE proximity animation + sound -->
    <task_packet>
      <task_id>gander-studio-p2-canvas-link-003b</task_id>
      <assigned_to>Frontend Engineer (FE)</assigned_to>
      <wave>3</wave>
      <priority>HIGH</priority>
      <description>
        Interaction and sound layer. Depends on 003a (stable orb surface) and 003-RA (audio activation pattern).

        B. MateriaCanvas.tsx — Magnetic Snap: During drag (change.dragging === true in handleNodesChange), compute distance from dragging node to all others. If any distance &lt; CANVAS_PROXIMITY_THRESHOLD_PX, add className 'orb-attracted' to both the dragging node and nearest target via setRFNodes (or direct DOM ref if re-render churn is observed). Remove class on drag-end or when distance exceeds threshold. Inject @keyframes orb-attract via scoped style block inside MateriaCanvasInner.

        C. packages/client/src/hooks/useLinkSound.ts — Web Audio API hook:
           - Exports: { playApproach, stopApproach, playLink }.
           - AudioContext: single instance, lazily created, reused per RA lifecycle recommendation.
           - Activation: implement per RA dossier Q1/Q2 finding exactly. Deviation documented.
           - playApproach(): starts approach tone (UI spec params).
           - stopApproach(): graceful release, no click artifact.
           - playLink(): one-shot ker-chink ADSR, self-cleans per RA Q3 pattern.
           - SSR guard: typeof window !== 'undefined'.
           - Wire: playApproach/stopApproach on proximity enter/exit during drag; playLink at the moment addEdge fires.

        All Hz, gain, ADSR ms, animation timing values as named exports in canvas.ts.
      </description>

      <success_criteria>
        - tsc --noEmit passes on packages/client.
        - orb-attracted class applied to dragging node and nearest target when within CANVAS_PROXIMITY_THRESHOLD_PX during drag.
        - orb-attracted class removed on drag-end.
        - useLinkSound.ts exports playApproach, stopApproach, playLink.
        - AudioContext created lazily (not at module load).
        - SSR guard present.
        - playLink fires at addEdge (verify via console.log or Playwright spy — document in packet).
        - stopApproach uses gainNode.linearRampToValueAtTime for click-free release.
        - All Hz, gain, ADSR, timing values exported from canvas.ts (no magic numbers inline).
        - Audio activation pattern matches RA dossier recommendation verbatim.
        - orb-attracted class must persist without flickering for the full duration of a drag gesture. If setRFNodes causes class-stripping mid-gesture, agent must switch to direct DOM ref (querySelector('[data-id=...]').classList) and document the choice in the completion packet.
        - Playwright Tier 2 spec materia-canvas-proximity.spec.ts: verifies (a) orb-attracted class present during simulated drag within threshold, absent after drag-end; (b) useLinkSound playLink called at edge creation without throwing (mock Web Audio API in spec, assert no console error).
      </success_criteria>

      <dependencies>
        gander-studio-p2-canvas-link-003a
        gander-studio-p2-canvas-link-003-RA
      </dependencies>

      <out_of_scope>
        No MateriaNode changes. No LoadoutListPanel. No ComposePage. No server files.
      </out_of_scope>
    </task_packet>

    <!-- HUMAN CONFIRMATION GATE — before 003c -->
    <human_confirmation_gate id="HCG-1">
      <timing>After 003b passes audit, before 003c is dispatched</timing>
      <question>
        The LoadoutListPanel can be structured two ways. Which do you want?

        Option A (flat): Three sections — AGENTS, SKILLS, CONNECTIONS — each as a simple list. Agents show inline '↔ peer1, peer2' labels when they have edges.

        Option B (tree): Agents are the root items; their connected peers appear as indented children beneath them, showing the hierarchy visually.

        Answer 'flat' or 'tree' — or describe any variation.
      </question>
      <blocks>gander-studio-p2-canvas-link-003c</blocks>
    </human_confirmation_gate>

    <!-- WAVE 4 — 003c: FE LoadoutListPanel + wiring -->
    <task_packet>
      <task_id>gander-studio-p2-canvas-link-003c</task_id>
      <assigned_to>Frontend Engineer (FE)</assigned_to>
      <wave>4</wave>
      <priority>HIGH</priority>
      <description>
        List panel and final wiring. Depends on 001b (connections data), 003b (stable canvas + sound). Structure (flat or tree) per human confirmation gate HCG-1.

        E. packages/client/src/components/compose/LoadoutListPanel.tsx:
           - Props: { nodes: CanvasNode[]; edges: CanvasEdge[]; onSelectNode?: (id: string) => void }
           - Structure per human confirmation (flat three-section OR tree with children).
           - All rows keyboard-accessible: role="button", tabIndex=0, onKeyDown (Enter/Space triggers onClick), aria-label="Select {name} on canvas".
           - Colored dot per type using getMateriaColor.
           - Design tokens only from UI spec — no hex values.
           - All style measurements as named exports in canvas.ts.

        F. Wire in MateriaCanvasInner:
           - Three-column layout: [Palette | Canvas | List] using flex row.
           - LoadoutListPanel width: 240px (flex-shrink: 0).
           - onSelectNode: calls rfInstance.fitView([{ id }]) or rfInstance.setCenter to focus node.
           - Confirm layout acceptable at 1024px minimum viewport.
      </description>

      <success_criteria>
        - tsc --noEmit passes on packages/client.
        - LoadoutListPanel renders with live data (add node to canvas → appears in panel within one render cycle).
        - Remove node from canvas → panel updates immediately.
        - Panel row click → canvas pans/zooms to that node.
        - All rows keyboard-navigable (Tab focus, Enter/Space activate).
        - aria-label="Select {name} on canvas" on every row.
        - No hex values in component.
        - Three-column layout renders at 1024px minimum without horizontal scroll.
        - All style measurements exported from canvas.ts.
        - Playwright Tier 2 spec loadout-list-panel.spec.ts: (a) add node → list row appears; (b) click row → node focused on canvas; (c) keyboard nav (Tab + Enter) activates row.
      </success_criteria>

      <dependencies>
        gander-studio-p2-canvas-link-001b
        gander-studio-p2-canvas-link-003b
        HCG-1 (human confirmation)
      </dependencies>

      <out_of_scope>
        No server files. No schema changes. No sound changes. No MateriaNode changes.
      </out_of_scope>
    </task_packet>

  </task_packets>

  <dependency_order>
    Wave 1 (parallel): 001a, 002, 003-RA
    Wave 2 (after 001a audit): 001b
    Wave 2 also (after 002 audit, parallel with 001b): 003a
    Wave 3 (after 003a + 003-RA audit): 003b
    [HCG-1: human confirmation gate]
    Wave 4 (after 001b + 003b + HCG-1): 003c
  </dependency_order>

  <routing_notes>
    1. 001a, 002, and 003-RA all dispatch in parallel — no shared files, no conflicts.
    2. 001b and 003a can run in parallel in wave 2 — 001b touches canvas-store + ComposePage; 003a touches MateriaNode + MateriaCanvas + canvas.ts. No file overlap.
    3. 003b is lint-critical (MateriaCanvas.tsx changes + new hook). Dispatch as foreground agent or run tsc --noEmit manually in main session after return.
    4. HCG-1 must be answered before 003c is dispatched. Do not default to either option.
    5. Human visual verification required after 003c before sprint close: glassy orbs, snap animation, link sound, LoadoutListPanel.
    6. If 003-RA returns uncertainty on Q1/Q2, escalate to human before dispatching 003b — do not guess activation pattern.
  </routing_notes>

  <risk_flags>
    1. AudioContext activation: 003b dispatched only after RA dossier. If RA uncertain → escalate to human.
    2. ReactFlow v12 className during drag may cause re-render churn: FE 003b agent should use direct DOM ref fallback if profiling shows jank.
    3. ComposePage.tsx touched by 001b (wave 2) and 003c (wave 4) — sequential, no merge risk.
    4. LoadoutListPanel 240px shrinks canvas area: 003c must verify at 1024px minimum.
    5. communicates_with in existing agent files: 001a BE agent must grep before writing.
    6. RA network access: if RA cannot reach MDN/Chrome docs, surface to human before 003b dispatch.
  </risk_flags>

</task_decomposition>
```
