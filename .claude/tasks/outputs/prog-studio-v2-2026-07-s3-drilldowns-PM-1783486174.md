# PM Task Decomposition — prog-studio-v2-2026-07-s3-drilldowns

Output path: `.claude/tasks/outputs/prog-studio-v2-2026-07-s3-drilldowns-PM-1783486174.md`
Generated: 2026-07-07
Reads used: 6/8 (brief, schemas AgentDetailSchema block, PartyMemberCard, s2 e2e spec, EditPage skim, GraphPage skim) + Glob/Grep (not read-budget).

---

## Nav-Contract Decision (load-bearing — declared per constraint 7)

s3 owns nav-contract *consumption*. Both interim `'browse'` targets shipped by s2 are re-pointed
this sprint so s4 can delete Browse without leaving dead ends:

1. **PartyMemberCard activation** (via PartyPage's `onSelect`): currently `setSelectedAgentCode(code)`
   + `setActiveMode('browse')` → re-point to `setActiveMode('agent-detail')` (NEW mode).
2. **Rail "Roster" item** (RAIL_ITEMS): currently targets `'browse'` (INTERIM) → re-point to `'party'`
   (home/roster grid). The party grid **is** the roster entry point.
3. **Back-navigation:** the new agent-detail page carries a "Back to party" affordance →
   `setActiveMode('party')`.

**Scope boundary declared (risk_flag):** the design-spec's "full 13-role catalog" Roster surface
(reaching the 7 non-party/inactive roles' detail) is **NOT built this sprint**. Agent-detail is
reachable only via the 6 party cards. This satisfies all 5 sprint SCs (which require "clicking any
roster agent" = a party card) and the absorption-proof seam; the fuller catalog is a future surface.
Surfaced for ORC/human ratification.

**Reuse-vs-rebuild (one-line rationale per absorb target — pm_preflight DRY):**
- **Browse → REBUILD** as new inventory panels. Browse's absorbed value = browsing an agent's
  *equipped* assets; served by NEW Materia/Equipment/Abilities panels (+provenance), not by reusing
  BrowsePage's global card grid.
- **Graph → REBUILD compact, reuse the PATTERN.** Reuse `@xyflow/react` + the dagre-layout pattern +
  the `GraphNode` `<Handle>` convention (RF v12 gotcha) as reference; build a small relationship
  subgraph fed by `AgentDetail.relationships[]`, not reuse GraphPage (bound to
  `connectivity.getGraph` + its full FilterSidebar).
- **Edit → REUSE the save PROCEDURES, REBUILD the shell.** Reuse `agent.save`/`skill.save` (SC3
  mandate) + `ui/dialog`+`ui/textarea` primitives; REBUILD a minimal target-scoped editor rather than
  reuse EditPage's FilePicker + `useEditStore` buffer — that buffer is the contamination source SC3
  regression-guards against.
- **s2 party primitives → REUSE:** `PortraitFrame`, `StatBar`, `materiaTint`, the RoleTag pattern
  (detail header reuses them; qualityStats render via `StatBar`).

**QualityStat `reason` field — NO BE packet (declared).** `QualityStatSchema` has no `reason` field
(DEFERRED-V2S1-2). We consume `dataQualityNotes` as-is for the honest-N/A story (constraint 1's
"otherwise consume as-is"). No `packages/shared`/parser touch this sprint → s3 stays
`packages/client`-only + e2e specs. If design review later requires per-stat inline N/A reasons, a
follow-up BE packet is needed (flagged).

---

## Task Packets

<task_packet>
  <task_id>prog-studio-v2-2026-07-s3-drilldowns-t1</task_id>
  <assigned_to>frontend</assigned_to>
  <priority>HIGH</priority>
  <description>
    Build the Browse-absorption inventory panels for the agent-detail drill-down: Materia (skills +
    hooks), Equipment (tools), Abilities (workflows). Author as ONE cohesive file
    `packages/client/src/components/detail/InventoryPanels.tsx` exporting three named components
    (`MateriaPanel`, `EquipmentPanel`, `AbilitiesPanel`) plus a shared internal `ProvenanceChip`
    row primitive (DRY — the provenancePath display is identical across Materia/Abilities).
    Data source: props sliced from `AgentDetail` (`materia:{skills,hooks}`, `equipment`,
    `abilities`) — DO NOT fetch; the page (t4a) passes data down.
    Each materia/ability row shows name + its `provenancePath` (the provenance requirement, SC1).
    Equipment rows show `tool` (tools have no file provenance — EquipmentSchema, do not fabricate a path).

    HONEST EMPTY STATE (program.md §5 note 2, CONTRACTED — binding): when a panel's list is empty,
    render a visible "no recorded {skills|hooks|tools|abilities}" state INSIDE the panel and surface
    the matching `dataQualityNote` if present — NEVER hide the panel, never collapse it to nothing.
    Note: `abilities` is contracted-empty for all agents this sprint, so AbilitiesPanel's honest
    empty state is the DEFAULT render path — build and style it as a first-class state, not an
    afterthought.

    Reuse `materiaTint` for chip tints; use FF7 runtime tokens only (no raw hex). Panels carry
    stable data-testids: `detail-materia-panel`, `detail-equipment-panel`, `detail-abilities-panel`.
  </description>
  <success_criteria>
    (a) `InventoryPanels.tsx` exports MateriaPanel, EquipmentPanel, AbilitiesPanel + a single shared
    ProvenanceChip; no duplicated provenance-row markup. (b) Each panel renders a visible honest
    empty state (not `null`, not `display:none`) when its slice is empty, surfacing the relevant
    dataQualityNote when provided. (c) Materia/Abilities rows display `provenancePath`; Equipment rows
    display `tool` with no invented path. (d) All colors via FF7 runtime tokens / `materiaTint`
    (no raw hex); every text/token pairing traces to a `docs/v2-vision/v2-design-spec.md`
    contrast_pairs row at AA. (e) `npm run lint` clean across the three packages.
  </success_criteria>
  <context_files>
    packages/shared/src/schemas.ts (MateriaSchema, EquipmentSchema, AbilitySchema, AgentDetailSchema — lines ~427-471)
    packages/client/src/components/party/materia-tint.ts (reuse tint helper)
    docs/v2-vision/v2-design-spec.md (panel naming: Materia/Equipment/Abilities; contrast_pairs canonical; tokens table lines ~247-263)
    DESIGN.md (repo root — token names; design_system_source=DESIGN_MD)
    packages/client/src/pages/BrowsePage.tsx (read-only reference for card/chip patterns ONLY — do NOT reuse the grid)
  </context_files>
  <dependencies>NONE</dependencies>
  <out_of_scope>
    No data fetching (page passes props). No new AppMode / routing / PAGE_MAP edits. No BE/schema
    changes. Do NOT hide any panel when empty. No raw hex. Do NOT reuse BrowsePage's card grid. No
    git commit.
  </out_of_scope>
  <estimated_new_lines>~140 — JUSTIFIED whole: 3 tightly-coupled panels sharing one ProvenanceChip
    primitive form a single Browse-absorption deliverable; splitting across files would duplicate the
    chip (DRY violation) and add a packet (over the 6-packet cap). ≤2 files respected (1 new file).</estimated_new_lines>
  <output_expected>
    <tag>ui_packet</tag>
    <must_contain>
      <item>InventoryPanels.tsx with 3 exported panels + shared ProvenanceChip</item>
      <item>honest-empty-state render path for each panel, surfacing dataQualityNote</item>
      <item>provenancePath shown on materia/ability rows</item>
      <item>design_system_source: DESIGN_MD</item>
    </must_contain>
    <must_not_contain>
      <item>raw hex color values</item>
      <item>a panel that returns null / hides itself when its list is empty</item>
      <item>any trpc query / useQuery call</item>
      <item>fabricated provenance path on Equipment rows</item>
    </must_not_contain>
    <success_signal>lint clean ×3; InventoryPanels.tsx exists with 3 panels; empty-state visible for empty slices</success_signal>
  </output_expected>
</task_packet>

<task_packet>
  <task_id>prog-studio-v2-2026-07-s3-drilldowns-t2</task_id>
  <assigned_to>frontend</assigned_to>
  <priority>HIGH</priority>
  <description>
    Build the Graph-absorption relationship layer: `packages/client/src/components/detail/RelationshipPanel.tsx`.
    Renders the agent's connectivity subset from `AgentDetail.relationships[]`
    (`{target, edgeType, confidence: DETECTED|INFERRED}`) as a compact React Flow subgraph — a center
    node for the current agent, one node per relationship target, one edge per relationship.
    Data source: props from the page (t4a passes `relationships` + `code`); DO NOT call
    `connectivity.getGraph`.

    RF v12 GOTCHA (memorized, binding): custom nodes MUST render `<Handle>` elements even for
    purely programmatic edges, or edges will not render. Reuse the existing `GraphNode` `<Handle>`
    convention as the reference (verify GraphNode's props fit; if they do not, author a minimal
    custom node that INCLUDES source+target `<Handle>`). Reuse the dagre-layout pattern from
    GraphPage (`applyDagreLayout`) or a minimal radial/LR layout — verify-then-implement against the
    actual GraphPage helper.

    Confidence surfaced visibly (DETECTED vs INFERRED — e.g. edge style or a legend). Honest empty
    state: when `relationships` is empty, render a visible "no recorded relationships" state, never a
    blank panel. Panel root data-testid: `detail-relationship-panel`; the RF canvas must be
    queryable (RF renders `.react-flow` / `.react-flow__edge` DOM). FF7 tokens only.
  </description>
  <success_criteria>
    (a) RelationshipPanel renders a React Flow graph with a center node + one node per
    `relationships[]` entry + one edge each; edge count in the DOM equals `relationships.length`
    (verify-then-implement — do NOT hardcode a count). (b) Custom node(s) include `<Handle>` (RF v12
    requirement) so programmatic edges render. (c) DETECTED vs INFERRED confidence is visually
    distinguishable. (d) Empty `relationships` → visible honest empty state, not a blank panel.
    (e) FF7 tokens only; pairings trace to contrast_pairs at AA. (f) `npm run lint` clean ×3.
  </success_criteria>
  <context_files>
    packages/client/src/pages/GraphPage.tsx (read-only reference — RF setup, applyDagreLayout, NODE_TYPES_MAP)
    packages/client/src/components/graph/GraphNode.tsx (read-only — the <Handle> convention to reuse)
    packages/shared/src/schemas.ts (RelationshipEdgeSchema, AgentDetailSchema — lines ~443-471)
    docs/v2-vision/v2-design-spec.md (Graph→relationship-layer absorption verdict; contrast_pairs)
    DESIGN.md (repo root)
  </context_files>
  <dependencies>NONE</dependencies>
  <out_of_scope>
    Do NOT call connectivity.getGraph or reuse GraphPage's FilterSidebar. No new AppMode/routing. No
    BE/schema changes. Do NOT hardcode node/edge counts. No git commit. Do NOT reuse GraphPage's
    animation/highlight CSS (globals.css is s4-p1 sole owner per the file's own note).
  </out_of_scope>
  <estimated_new_lines>~95 (1 new file; ≤2 files respected).</estimated_new_lines>
  <output_expected>
    <tag>ui_packet</tag>
    <must_contain>
      <item>RelationshipPanel.tsx consuming AgentDetail.relationships[]</item>
      <item>custom node with &lt;Handle&gt; (RF v12 gotcha honored)</item>
      <item>DETECTED/INFERRED confidence distinction</item>
      <item>honest empty state for zero relationships</item>
    </must_contain>
    <must_not_contain>
      <item>connectivity.getGraph call</item>
      <item>hardcoded node/edge count</item>
      <item>raw hex values</item>
      <item>custom node missing &lt;Handle&gt; (edges would not render)</item>
    </must_not_contain>
    <success_signal>lint clean ×3; RF canvas renders with edges == relationships.length; empty state visible when none</success_signal>
  </output_expected>
</task_packet>

<task_packet>
  <task_id>prog-studio-v2-2026-07-s3-drilldowns-t3</task_id>
  <assigned_to>frontend</assigned_to>
  <priority>HIGH</priority>
  <description>
    Build the Edit-absorption "Revise this spec" action:
    `packages/client/src/components/detail/ReviseSpecAction.tsx`. A trigger button
    (accessible name "Revise this spec", data-testid `revise-spec-trigger`) that opens a Dialog
    containing a markdown editor scoped to the CURRENTLY-SELECTED agent's spec, saving via the
    EXISTING `agent.save` (and `skill.save` where a skill is edited) tRPC mutations. Reuse the
    `ui/dialog` + `ui/textarea` + `ui/button` primitives. Verify-then-implement how EditPage loads
    the current spec content (agent.get / raw-content procedure) and re-use that same load path —
    do NOT invent a new server procedure.

    BUFFER-LIFECYCLE (SC3, binding — the contamination bug class): the editor buffer MUST be scoped
    to the target so switching the selected agent NEVER carries the prior agent's buffer forward.
    Implement via a target-keyed remount (`key={selectedAgentCode}` on the editor) or an effect that
    resets buffer state whenever the target changes. Do NOT reuse EditPage's `useEditStore` buffer
    (its cross-target buffer is the contamination source). The buffer-reset behavior is proven by the
    t5 e2e regression (open A, type, cancel, open B → B shows B's content, not A's typed text) — build
    to make that pass.

    EXPLICIT FOCUS (s2 AA §6 G2, BINDING HIGH class): the Dialog MUST set focus behavior EXPLICITLY
    (initialFocus target = the editor textarea or a named element; explicit role) — NEVER rely on
    base-ui defaults. Escape closes and returns focus to the trigger. FF7 tokens only.
  </description>
  <success_criteria>
    (a) "Revise this spec" trigger opens a Dialog with a markdown editor pre-loaded with the selected
    agent's current spec via the existing load path (no new server procedure). (b) Save calls the
    existing `agent.save` / `skill.save` mutation (verify names/signature against EditPage). (c) The
    editor buffer is target-keyed — switching selected agent resets the buffer (no carryover). (d) The
    Dialog sets focus/role EXPLICITLY (initialFocus + role), never base-ui defaults; Escape returns
    focus to the trigger. (e) FF7 tokens; contrast_pairs AA. (f) `npm run lint` clean ×3.
  </success_criteria>
  <context_files>
    packages/client/src/pages/EditPage.tsx (read-only reference — the exact load procedure + agent.save/skill.save wiring + Dialog usage)
    packages/client/src/components/ui/dialog.tsx (primitive)
    packages/client/src/components/ui/textarea.tsx (primitive)
    packages/client/src/components/party/PartyMemberCard.tsx (read-only — the t3-rem explicit-focus precedent: initialFocus={false}/role pattern for base-ui primitives)
    DESIGN.md (repo root)
    docs/v2-vision/v2-design-spec.md (line ~359 — Dialog reserved for the Revise-this-spec action)
  </context_files>
  <dependencies>NONE</dependencies>
  <out_of_scope>
    Do NOT add/modify server procedures or schemas. Do NOT reuse useEditStore's cross-target buffer.
    Do NOT rely on base-ui default focus. No new AppMode/routing. No git commit. Do NOT reuse
    EditPage's FilePicker (the agent is already selected).
  </out_of_scope>
  <estimated_new_lines>~110 — JUSTIFIED whole: a single Edit-absorption action (trigger + Dialog +
    target-keyed editor + save wiring) is one cohesive deliverable; the target-keyed buffer reset is
    inseparable from the editor it guards. ≤2 files (1 new file; may add 0-1 tiny local constant file
    if a magic number needs single-sourcing).</estimated_new_lines>
  <output_expected>
    <tag>ui_packet</tag>
    <must_contain>
      <item>ReviseSpecAction.tsx with trigger + Dialog + markdown editor</item>
      <item>save wired to existing agent.save/skill.save (reused, not reinvented)</item>
      <item>target-keyed buffer (key or reset effect) preventing cross-target carryover</item>
      <item>explicit Dialog focus (initialFocus) + role — no base-ui default reliance</item>
    </must_contain>
    <must_not_contain>
      <item>new/modified server procedure or Zod schema</item>
      <item>useEditStore cross-target buffer reuse</item>
      <item>base-ui default focus reliance (no explicit initialFocus/role)</item>
      <item>raw hex values</item>
    </must_not_contain>
    <success_signal>lint clean ×3; Dialog opens with selected agent's spec; save hits existing mutation; buffer resets on target change</success_signal>
  </output_expected>
</task_packet>

<task_packet>
  <task_id>prog-studio-v2-2026-07-s3-drilldowns-t4a</task_id>
  <assigned_to>frontend</assigned_to>
  <priority>HIGH</priority>
  <description>
    Assemble the agent-detail page and register its route (mode). Three parts, atomic:
    1. NEW `packages/client/src/pages/AgentDetailPage.tsx` — root data-testid `agent-detail-page`.
       Fetches `roster.getAgentDetail(selectedAgentCode)` (verify the exact tRPC procedure + input
       shape against the router). Renders: a header (reuse `PortraitFrame` + RoleTag pattern +
       `materiaTint`; qualityStats via reused `StatBar`, with N/A bars driven by
       normalized:null — no per-stat reason field exists, so N/A rationale comes from the
       dataQualityNotes section, NOT an invented field); the three inventory panels (t1); the
       relationship panel (t2); the Revise-this-spec action (t3); a `dataQualityNotes` section that
       surfaces every note (silent-empty forbidden); and a "Back to party" affordance
       (data-testid `detail-back`, accessible name "Back to party") calling `setActiveMode('party')`.
       Distinguish the DI/empty case (specFile null → empty lists + dataQualityNote) from a load
       error — render the honest empty state, never a crash/blank.
    2. `packages/client/src/store/ui-store.ts` — add `'agent-detail'` to the `AppMode` union.
       If `packages/client/src/constants/navigation.ts` centralizes AppMode/mode metadata, update
       there per that file's pattern (verify-then-implement). Update `ui-store` unit tests if the
       union change breaks `store/__tests__/ui-store.test.ts`.
    3. `packages/client/src/components/ModeContent.tsx` — add the `PAGE_MAP` entry for
       `'agent-detail'` using `React.lazy` on the SHARED Suspense boundary. LAZY FROM BIRTH
       (s2 AA §6 G1) — the new page must never enter the eager bundle.

    BUNDLE GATE (measured at this wiring packet): after wiring, `npm run build` and confirm the main
    bundle stays < 1000 kB (s2 baseline 756.80 kB, 243 kB headroom — verify the current baseline from
    the build output; do NOT hardcode an unmeasured delta). Report the measured post-build size in the
    packet.
  </description>
  <success_criteria>
    (a) AgentDetailPage renders getAgentDetail data for `selectedAgentCode`: header + qualityStats
    (via reused StatBar) + inventory panels (t1) + relationship panel (t2) + revise action (t3) +
    a dataQualityNotes section surfacing all notes + a "Back to party" affordance calling
    setActiveMode('party'). (b) `'agent-detail'` is a member of AppMode; ui-store tests pass.
    (c) ModeContent PAGE_MAP routes `'agent-detail'` to a `React.lazy`-loaded AgentDetailPage on the
    shared Suspense boundary. (d) DI/empty-spec agent renders honest empty states + notes, not a crash.
    (e) `npm run build` succeeds and main bundle < 1000 kB (report the measured size). (f) `npm run
    lint` clean ×3.
  </success_criteria>
  <context_files>
    packages/client/src/pages/AgentDetailPage.tsx (NEW)
    packages/client/src/store/ui-store.ts (AppMode union; selectedAgentCode; setActiveMode)
    packages/client/src/store/__tests__/ui-store.test.ts (update if union change requires)
    packages/client/src/constants/navigation.ts (verify AppMode/mode metadata location)
    packages/client/src/components/ModeContent.tsx (PAGE_MAP; React.lazy pattern of existing heavy pages)
    packages/client/src/components/party/PortraitFrame.tsx, StatBar.tsx, materia-tint.ts (reuse)
    packages/server/src/router.ts (verify roster.getAgentDetail procedure + input)
    packages/shared/src/schemas.ts (AgentDetailSchema — lines 460-471)
    DESIGN.md (repo root)
  </context_files>
  <dependencies>prog-studio-v2-2026-07-s3-drilldowns-t1, prog-studio-v2-2026-07-s3-drilldowns-t2, prog-studio-v2-2026-07-s3-drilldowns-t3</dependencies>
  <out_of_scope>
    Do NOT re-point PartyPage onSelect or the Roster rail item (t4b owns those). Do NOT add the new
    page to the eager bundle (must be React.lazy). No BE/schema changes (consume getAgentDetail as-is).
    No git commit.
  </out_of_scope>
  <estimated_new_lines>~130 — JUSTIFIED whole: 1 new assembly/composition page + 2 mandatory
    registration edits (AppMode union member + one PAGE_MAP lazy entry, ~1-3 lines each). The page and
    its route cannot be separated (a page with no route or a route with no page fails the build). The
    two registration files are trivial-line-count wiring, not independent deliverables.</estimated_new_lines>
  <output_expected>
    <tag>ui_packet</tag>
    <must_contain>
      <item>AgentDetailPage.tsx composing header + t1 panels + t2 relationship + t3 revise + dataQualityNotes + Back-to-party</item>
      <item>'agent-detail' added to AppMode union</item>
      <item>ModeContent PAGE_MAP React.lazy entry for 'agent-detail' on the shared Suspense boundary</item>
      <item>measured post-build main-bundle size (&lt; 1000 kB)</item>
    </must_contain>
    <must_not_contain>
      <item>eager (non-lazy) import of AgentDetailPage</item>
      <item>PartyPage onSelect edit or Roster rail re-point (t4b's scope)</item>
      <item>invented per-stat reason field (N/A rationale comes from dataQualityNotes)</item>
      <item>server/schema modification</item>
    </must_not_contain>
    <success_signal>build passing, bundle &lt; 1000 kB reported; lint ×3 clean; 'agent-detail' routes to a lazy page rendering real getAgentDetail data</success_signal>
  </output_expected>
</task_packet>

<task_packet>
  <task_id>prog-studio-v2-2026-07-s3-drilldowns-t4b</task_id>
  <assigned_to>frontend</assigned_to>
  <priority>HIGH</priority>
  <description>
    Re-point the two interim `'browse'` nav targets to close the s2→s3 nav contract (both would
    otherwise become dead ends when s4 deletes Browse):
    1. `packages/client/src/pages/PartyPage.tsx` — the `onSelect` handler passed to PartyMemberCard:
       change `setActiveMode('browse')` → `setActiveMode('agent-detail')` (keep
       `setSelectedAgentCode(code)`). Verify the exact handler location + store method names against
       the file (the s2 seam: onSelect → setSelectedAgentCode + setActiveMode).
    2. The Roster rail item — locate RAIL_ITEMS (verify: `packages/client/src/constants/navigation.ts`
       OR `packages/client/src/components/party/SubmenuRail.tsx`) and re-point the "Roster" item's
       target mode from `'browse'` to `'party'`.
    Additive edits only; do not alter s2-committed structure beyond these two re-points.
  </description>
  <success_criteria>
    (a) PartyPage onSelect sets `setActiveMode('agent-detail')` (not 'browse'), retaining
    setSelectedAgentCode. (b) The Roster rail item targets `'party'` (not 'browse'). (c) No remaining
    `'browse'` target in the party/rail nav path (search the two files). (d) `npm run lint` clean ×3.
  </success_criteria>
  <context_files>
    packages/client/src/pages/PartyPage.tsx (onSelect handler)
    packages/client/src/components/party/SubmenuRail.tsx (RAIL_ITEMS — or)
    packages/client/src/constants/navigation.ts (RAIL_ITEMS location — verify which holds it)
    packages/client/src/store/ui-store.ts (read-only — confirm 'agent-detail' member from t4a + setActiveMode signature)
  </context_files>
  <dependencies>prog-studio-v2-2026-07-s3-drilldowns-t4a</dependencies>
  <out_of_scope>
    Do NOT modify AppMode union or PAGE_MAP (t4a owns those). Do NOT touch the s2 e2e spec (t5 owns
    the authorized assertion re-point). No new components. No git commit. No BE/schema changes.
  </out_of_scope>
  <estimated_new_lines>~10 (two 1-line re-points; ≤2 files).</estimated_new_lines>
  <output_expected>
    <tag>ui_packet</tag>
    <must_contain>
      <item>PartyPage onSelect → setActiveMode('agent-detail')</item>
      <item>Roster rail item → 'party'</item>
    </must_contain>
    <must_not_contain>
      <item>any remaining 'browse' target in the party card / Roster rail path</item>
      <item>AppMode union or PAGE_MAP edits</item>
      <item>edits to the s2 e2e spec</item>
    </must_not_contain>
    <success_signal>lint ×3 clean; clicking a card routes to agent-detail; Roster rail routes to party</success_signal>
  </output_expected>
</task_packet>

<task_packet>
  <task_id>prog-studio-v2-2026-07-s3-drilldowns-t5</task_id>
  <assigned_to>frontend</assigned_to>
  <priority>HIGH</priority>
  <description>
    Author the Tier-2 Playwright e2e that IS the s3→s4 absorption-proof seam artifact, at
    `packages/client/tests/e2e/prog-studio-v2-2026-07-s3-drilldowns.spec.ts`, plus the AUTHORIZED
    cross-sprint re-point of the s2 spec's destination markers.

    NEW spec — all assertions use destination-DOM markers (W3 doctrine); NO measured/data-derived
    locked counts (constraint 6 — use structural presence, not "expect N skills"):
    - PROOF 1 (Browse absorption): from the party screen, click the first party card → assert
      `agent-detail-page` visible; assert `detail-materia-panel`, `detail-equipment-panel`,
      `detail-abilities-panel` all present; assert the Abilities panel shows its honest
      "no recorded abilities" state (abilities contracted-empty — verify-then-implement the exact
      copy against t1); assert at least one materia/equipment row shows a provenance path OR the honest
      empty state (structural, not a count).
    - PROOF 2 (Graph absorption): assert `detail-relationship-panel` present with a React Flow canvas
      (`.react-flow`); if the chosen agent has relationships, assert `.react-flow__edge` count > 0
      (do not hardcode the number); confidence markers visible.
    - PROOF 3 (Edit absorption + BUFFER regression): click `revise-spec-trigger` → Dialog opens with
      the editor focused (explicit focus proof — assert the editor/textarea is focused, not the
      body). Type text, cancel/Escape (assert focus returns to trigger). Navigate back to party,
      open a DIFFERENT agent's detail, open revise → assert the editor does NOT contain the previously
      typed text (buffer-contamination regression guard, SC3). Optionally exercise a save round-trip
      via the existing mutation if feasible headless.
    - A11Y keyboard pass: Tab reaches the panels + revise trigger + back affordance; the detail page
      is keyboard-operable; "Back to party" returns to `party-page`.
    - Contrast: rely on the auditor SA static contrast check against contrast_pairs; the e2e need not
      compute ratios (Playwright cannot reliably assert WCAG ratios) — note this delegation in the
      spec header comment.

    AUTHORIZED s2-spec re-point (`packages/client/tests/e2e/prog-studio-v2-2026-07-s2-party-shell.spec.ts`
    — same authorized-cross-sprint class as s2's t3-rem): update the two destination markers that s3
    changes: (i) the whole-card Tab+Enter test (~line 241) asserting `browse-page` → assert
    `agent-detail-page`; (ii) the "rail: Roster (interim) click lands on the Browse destination
    marker" test (~line 305-311) → Roster now lands on `party-page`, so update its title + assertion
    to the party marker. Update the accompanying code-comments that reference "routes to Browse" so
    they no longer describe stale behavior. Touch ONLY these destination-marker assertions/titles/
    comments — do not restructure the s2 suite.
  </description>
  <success_criteria>
    (a) New s3 spec exists with the three absorption proofs (Browse/Graph/Edit) + a11y keyboard pass,
    all using destination-DOM markers and structural (non-count) assertions. (b) The Edit proof
    includes the buffer-contamination regression (open A, type, switch to B, assert B's editor lacks
    A's text) and the explicit-focus assertion (editor focused on open; focus returns to trigger on
    close). (c) The s2 spec's two changed destination markers are re-pointed (card Enter →
    agent-detail-page; Roster → party-page) with matching titles/comments; no other s2 assertion
    altered. (d) The full e2e suite passes headless against the dev server (:3001). (e) `npm run lint`
    clean ×3.
  </success_criteria>
  <context_files>
    packages/client/tests/e2e/prog-studio-v2-2026-07-s2-party-shell.spec.ts (the two destination markers to re-point: ~L241, ~L305-311; reuse gotoParty/getCards/getRailNav helpers)
    packages/client/tests/e2e/ (conventions — DESKTOP_VIEWPORT, render-loop guard, W3 marker pattern)
    packages/client/src/pages/AgentDetailPage.tsx (t4a — testids: agent-detail-page, detail-back)
    packages/client/src/components/detail/InventoryPanels.tsx (t1 — panel testids + empty-state copy)
    packages/client/src/components/detail/RelationshipPanel.tsx (t2 — detail-relationship-panel)
    packages/client/src/components/detail/ReviseSpecAction.tsx (t3 — revise-spec-trigger; focus behavior)
  </context_files>
  <dependencies>prog-studio-v2-2026-07-s3-drilldowns-t4a, prog-studio-v2-2026-07-s3-drilldowns-t4b</dependencies>
  <out_of_scope>
    Do NOT alter any s2 assertion beyond the two named destination-marker re-points + their
    titles/comments. Do NOT assert measured data counts (skills/edges) as locked values. Do NOT modify
    source components (report defects back, do not fix inline). No git commit.
  </out_of_scope>
  <estimated_new_lines>~200 — JUSTIFIED: e2e test code; a comprehensive Tier-2 three-proof suite +
    a11y pass is inherently line-heavy and is the seam deliverable, not codebase logic. The s2 edit is
    a ~6-line marker/title/comment re-point.</estimated_new_lines>
  <output_expected>
    <tag>ui_packet</tag>
    <must_contain>
      <item>new s3 e2e spec with Browse/Graph/Edit absorption proofs + a11y keyboard pass</item>
      <item>buffer-contamination regression assertion (switch A→B, no carryover)</item>
      <item>explicit-focus assertion on the revise Dialog</item>
      <item>s2-spec re-point: card Enter → agent-detail-page; Roster → party-page (with titles/comments)</item>
    </must_contain>
    <must_not_contain>
      <item>data-derived locked counts (expect N skills/edges)</item>
      <item>s2 assertion changes beyond the two named destination markers</item>
      <item>inline fixes to source components</item>
    </must_not_contain>
    <success_signal>e2e suite green headless; three absorption proofs + a11y pass; s2 markers re-pointed; lint ×3 clean</success_signal>
  </output_expected>
</task_packet>

---

## verbatim_deliverable_audit

<verbatim_deliverable_audit source="orchestrator_brief human_request + sprint SCs 1-5">
  <!-- human_request phrases -->
  <phrase text="tier 2: the per-agent drill-downs"><addressed task="t1,t2,t3,t4a"/></phrase>
  <phrase text="absorbing Browse"><addressed task="t1"/> (inventory panels = asset browsing of the agent's equipped assets; proof in t5)</phrase>
  <phrase text="Graph"><addressed task="t2"/> (relationship layer; proof in t5)</phrase>
  <phrase text="Edit"><addressed task="t3"/> (revise-spec action; proof in t5)</phrase>
  <phrase text="implementation dispatch is gated on the human's s2 browser confirmation"><addressed task="routing_notes:foreground-gate"/> (dispatch gate — not a build deliverable)</phrase>
  <phrase text="plan now, execute on OK"><addressed task="this decomposition = plan now; ORC holds dispatch"/></phrase>
  <phrase text="keep it moving / ratified v2 program is executing"><out_of_scope reason="program-level context, not an s3 deliverable"/></phrase>

  <!-- sprint SC 1 -->
  <phrase text="SC1: party click → detail view with real data (skills/hooks materia, tools equipment, workflows abilities), each with provenance"><addressed task="t1 (panels+provenance), t4a (page+getAgentDetail), t4b (onSelect re-point), t5 (proof)"/></phrase>
  <!-- sprint SC 2 -->
  <phrase text="SC2: relationship layer renders connectivity subset (RF v12 Handle honored) — Graph ABSORB live"><addressed task="t2, t5"/></phrase>
  <!-- sprint SC 3 -->
  <phrase text="SC3: spec-revision opens/edits/saves via existing save procedures, editor-buffer contamination regression-tested"><addressed task="t3 (target-keyed buffer + reused save), t5 (buffer regression + save round-trip)"/></phrase>
  <!-- sprint SC 4 -->
  <phrase text="SC4: e2e all three absorption proofs green headless; a11y keyboard pass; contrast SC"><addressed task="t5 (proofs + a11y), t1/t2/t3 (contrast_pairs authoring), auditor-SA (static contrast check)"/></phrase>
  <!-- sprint SC 5 -->
  <phrase text="SC5: npm run lint ×3 clean; build passing"><addressed task="all packets (lint), t4a (build + bundle gate)"/></phrase>
  <phrase text="SC5: human browser check at Step 4.5"><addressed task="routing_notes:foreground-gate (ORC-side gate, not a packet)"/></phrase>

  <!-- constraint-level deliverables -->
  <phrase text="back-navigation detail → party must exist"><addressed task="t4a (Back-to-party affordance), t4b (Roster→party)"/></phrase>
  <phrase text="abilities:[] + dataQualityNote honest 'no recorded abilities' state, never hide panel"><addressed task="t1 (AbilitiesPanel honest empty state)"/></phrase>
  <phrase text="optional small BE packet for QualityStatSchema reason field"><out_of_scope reason="declined per constraint 1 'consume dataQualityNotes as-is'; no UI need justifies a cross-package packet; s3 stays client-only. Follow-up flagged if design review requires inline per-stat N/A reasons."/></phrase>
  <phrase text="full 13-role catalog Roster surface (design-spec submenu_structure)"><deferred reason="not required by any of the 5 sprint SCs; agent-detail reachable via the 6 party cards satisfies the absorption seam. Roster rail re-points to party home this sprint; the fuller catalog is a future surface. Declared in nav-contract + risk_flags for ORC/human ratification."/></phrase>
</verbatim_deliverable_audit>

---

## dependency_order

```
t1 (inventory panels)  ┐
t2 (relationship)      ├─ parallel (independent new files, no shared writers)
t3 (revise-spec)       ┘
                        → t4a (assemble page + register mode + bundle gate)   [depends t1,t2,t3]
                        → t4b (re-point onSelect + Roster rail)               [depends t4a]
                        → t5  (Tier-2 e2e proofs + s2-spec re-point)          [depends t4a,t4b]
```

---

## routing_notes

<recurring_pattern source="prog-studio-v2-2026-07-s2-party-shell.md §6 G1">latent-bundle-weight / lazy-from-birth: NEW pages must be React.lazy from birth; gate measured at plan time (756.80 kB baseline, 243 kB headroom).
  → AVOIDED: t4a wires AgentDetailPage via React.lazy on the shared Suspense boundary and measures the post-build bundle < 1000 kB at the wiring packet; must_not_contain forbids an eager import.</recurring_pattern>
<recurring_pattern source="prog-studio-v2-2026-07-s2-party-shell.md §6 G2">primitive behavioral defaults: any popover/dialog/floating primitive must set focus/role EXPLICITLY (the s2 HIGH defect class).
  → AVOIDED: t3's Revise Dialog sets initialFocus + role explicitly (must_not_contain forbids base-ui default reliance); t5 asserts editor-focused-on-open + focus-returns-to-trigger. Panels (t1/t2) carry no focus-stealing floating primitives.</recurring_pattern>
<recurring_pattern source="prog-studio-v2-2026-07-s2-party-shell.md §6 G3">git stash forbidden.
  → AVOIDED: no packet uses git stash; agents do not commit (ORC commits post-audit).</recurring_pattern>
<recurring_pattern source="prog-studio-v2-2026-07-s2-party-shell.md §6 G6">commit-before-verdict ordering — ORC-side close-time class.
  → ACCEPTED as ORC-handled: no PM action; flagged for ORC ordering discipline.</recurring_pattern>
<recurring_pattern source="prog-studio-v2-2026-07-s1-data-layer.md §6 G1">corpus/codebase-fact citations: facts in packet text must carry measured citations or verify-then-implement phrasing.
  → AVOIDED: every codebase claim I did not personally read (RAIL_ITEMS location, onSelect handler, getAgentDetail input, EditPage load path, GraphNode props) is phrased "verify-then-implement"; measured facts (schema lines, bundle baseline, s2 assertion lines) carry citations.</recurring_pattern>
<recurring_pattern source="pm_preflight OVERSCOPED">≤2 independent files/packet.
  → HONORED with ONE justified exception: t4a = 3 files (1 new page + 2 mandatory 1-3 line registration edits that cannot be separated from the page — build fails if split). All other packets ≤2 files. Justification embedded in t4a estimated_new_lines.</recurring_pattern>
<recurring_pattern source="pm_preflight DRY">name what each new piece reuses.
  → HONORED: reuse-vs-rebuild rationale stated per absorb target (Browse/Graph/Edit) + s2 primitive reuse (PortraitFrame/StatBar/materiaTint/RoleTag) — see the Reuse-vs-Rebuild block.</recurring_pattern>

**acknowledgements:** recurring patterns from all 3 named post-mortems enumerated above; OVERSCOPED, DRY, lazy-from-birth, explicit-focus, git-stash, corpus-fact-citation all addressed. subagentstop-complete-miss + archivist-paraphrase-drift are close-time classes → ORC-handled (no PM action).

**append_serialization:** N/A — NO two s3 packets write the same file. Writer map:
  ui-store.ts → t4a only; ModeContent.tsx → t4a only; PartyPage.tsx → t4b only; SubmenuRail.tsx/constants/navigation.ts → t4b only; s2 e2e spec → t5 only; each new file single-owner. No shared-file race exists this sprint.

**prior_approved_tasks (auditor guard):** ui-store.ts, ModeContent.tsx, PartyPage.tsx, SubmenuRail.tsx/navigation.ts all carry committed s2 (party-shell) content. s3 edits are ADDITIVE (new AppMode member; new PAGE_MAP lazy entry; two 1-line onSelect/Roster re-points). The pre-existing s2 code is authorized/committed and must NOT be flagged as out-of-scope modification by the auditor.

**foreground-gate (DISPATCH BLOCK):** Per human_request — implementation dispatch is GATED on the human's s2 browser confirmation. ORC must NOT dispatch t1-t5 until the human confirms s2 in-browser ("execute on OK"). This decomposition is "plan now"; ORC holds all packets until the gate opens. Additionally, SC5's Step-4.5 human browser check is an ORC-side close gate after audit PASS.

**DESIGN.md status:** PRESENT at repo root (`/home/jhber/projects/gander-studio-alpha/DESIGN.md`). All UI packets (t1-t4a) must set `design_system_source: DESIGN_MD` and trace tokens to named DESIGN.md / v2-design-spec contrast_pairs entries.

**sc-precheck:** DELEGATED to ORC per brief. PM note: NO diff-gated SCs vs HEAD and NO data-derived locked values were authored (constraint 6) — the locked-value precheck surface is minimal/empty. Step 7.5 self-lint passes vacuously (no locked-line grep/awk SCs exist in this plan).

**Critic relevance:** highest-value probes → (1) the nav-contract scope decision (Roster→party; full-catalog deferred); (2) base-ui explicit-focus on the Revise Dialog (t3); (3) bundle-gate measurement at t4a; (4) RF v12 <Handle> on the relationship node (t2); (5) buffer-contamination regression coverage (t3+t5). SA (tokens/DRY/contrast), QA (e2e absorption coverage) primary; SX minimal (no new server surface).
</routing_notes>

## risk_flags

- **NAV SCOPE (declared decision — needs ORC/human ratification):** Roster rail re-points to `'party'`
  (home), NOT a full 13-role catalog. Agent-detail is reachable only via the 6 party cards this
  sprint; the 7 inactive roles (e.g. DI) have no UI entry to their detail yet. Satisfies all 5 sprint
  SCs and the absorption seam; the fuller catalog is future scope. If the human intends Roster to be a
  distinct catalog surface NOW, t4b + a new catalog packet would be needed (would exceed the 6-packet
  cap → re-plan).
- **QualityStat reason field NOT extended:** consuming `dataQualityNotes` as-is (no BE packet). If
  design review requires inline per-stat N/A rationale (vs. a notes section), a follow-up
  `packages/shared` + parser packet is required.
- **base-ui default focus (s2 HIGH class recurrence risk):** t3's Revise Dialog MUST set
  initialFocus/role explicitly — if missed, this reproduces the s2 focus-oscillation/tab-stop defect
  class. Probed by t5's explicit-focus assertion.
- **Bundle-gate proximity:** 243 kB headroom at 756.80 kB baseline. A non-lazy new page or a heavy RF
  import path could breach 1000 kB. Measured at t4a; RF is already a dep (GraphPage) so t2 adds no new
  large dependency.
- **RF v12 <Handle> gotcha:** t2's relationship edges will silently fail to render if the custom node
  omits `<Handle>`. Explicit must_contain + must_not_contain guard it.
- **Editor-buffer contamination:** the historical cross-target buffer bug — mitigated by target-keyed
  remount (t3) + the A→B switch regression (t5). Risk if an implementer reuses `useEditStore`.
- **e2e determinism:** party sort is activity-recency-based, so "first card" is position-deterministic
  but not code-deterministic. t5 uses structural/marker assertions (not measured data counts) to stay
  robust — no data-derived locked values.
- **Dispatch gate:** execution blocked on the human's s2 browser confirmation (foreground flag above).

---

## expectation_manifest

<expectation_manifest>
  <sprint_id>prog-studio-v2-2026-07-s3-drilldowns</sprint_id>
  <generated>2026-07-07</generated>
  <assignments>
    <assignment>
      <task_id>prog-studio-v2-2026-07-s3-drilldowns-t1</task_id>
      <agent>FE#1</agent>
      <expected_tag>ui_packet</expected_tag>
      <expected_file>.claude/tasks/outputs/prog-studio-v2-2026-07-s3-drilldowns-t1-FE-*.md</expected_file>
      <blocks>t4a</blocks>
      <receipt_check>
        <item>InventoryPanels.tsx with 3 panels + shared ProvenanceChip present</item>
        <item>honest empty state per panel (no null/hidden), surfacing dataQualityNote</item>
        <item>no raw hex; design_system_source: DESIGN_MD</item>
        <item>lint ×3 clean</item>
      </receipt_check>
    </assignment>
    <assignment>
      <task_id>prog-studio-v2-2026-07-s3-drilldowns-t2</task_id>
      <agent>FE#2</agent>
      <expected_tag>ui_packet</expected_tag>
      <expected_file>.claude/tasks/outputs/prog-studio-v2-2026-07-s3-drilldowns-t2-FE-*.md</expected_file>
      <blocks>t4a</blocks>
      <receipt_check>
        <item>RelationshipPanel consumes relationships[] (no connectivity.getGraph)</item>
        <item>custom node includes &lt;Handle&gt; (RF v12)</item>
        <item>no hardcoded node/edge count; honest empty state present</item>
        <item>lint ×3 clean</item>
      </receipt_check>
    </assignment>
    <assignment>
      <task_id>prog-studio-v2-2026-07-s3-drilldowns-t3</task_id>
      <agent>FE#3</agent>
      <expected_tag>ui_packet</expected_tag>
      <expected_file>.claude/tasks/outputs/prog-studio-v2-2026-07-s3-drilldowns-t3-FE-*.md</expected_file>
      <blocks>t4a</blocks>
      <receipt_check>
        <item>save wired to existing agent.save/skill.save (not reinvented)</item>
        <item>target-keyed buffer (no cross-target carryover)</item>
        <item>explicit Dialog initialFocus + role (no base-ui default)</item>
        <item>lint ×3 clean</item>
      </receipt_check>
    </assignment>
    <assignment>
      <task_id>prog-studio-v2-2026-07-s3-drilldowns-t4a</task_id>
      <agent>FE#4</agent>
      <expected_tag>ui_packet</expected_tag>
      <expected_file>.claude/tasks/outputs/prog-studio-v2-2026-07-s3-drilldowns-t4a-FE-*.md</expected_file>
      <blocks>t4b, t5</blocks>
      <receipt_check>
        <item>AgentDetailPage composes header + t1 + t2 + t3 + dataQualityNotes + Back-to-party</item>
        <item>'agent-detail' in AppMode; ui-store tests pass</item>
        <item>PAGE_MAP React.lazy entry (not eager)</item>
        <item>measured bundle size reported &lt; 1000 kB; build passing</item>
      </receipt_check>
    </assignment>
    <assignment>
      <task_id>prog-studio-v2-2026-07-s3-drilldowns-t4b</task_id>
      <agent>FE#5</agent>
      <expected_tag>ui_packet</expected_tag>
      <expected_file>.claude/tasks/outputs/prog-studio-v2-2026-07-s3-drilldowns-t4b-FE-*.md</expected_file>
      <blocks>t5</blocks>
      <receipt_check>
        <item>onSelect → setActiveMode('agent-detail')</item>
        <item>Roster rail → 'party'; no residual 'browse' in party/rail path</item>
        <item>lint ×3 clean</item>
      </receipt_check>
    </assignment>
    <assignment>
      <task_id>prog-studio-v2-2026-07-s3-drilldowns-t5</task_id>
      <agent>FE#6</agent>
      <expected_tag>ui_packet</expected_tag>
      <expected_file>.claude/tasks/outputs/prog-studio-v2-2026-07-s3-drilldowns-t5-FE-*.md</expected_file>
      <blocks>NONE (seam artifact — final)</blocks>
      <receipt_check>
        <item>three absorption proofs (Browse/Graph/Edit) + a11y keyboard pass present</item>
        <item>buffer-contamination regression (A→B) + explicit-focus assertion present</item>
        <item>s2 spec re-pointed: card Enter → agent-detail-page; Roster → party-page (titles/comments too)</item>
        <item>e2e suite green headless; no data-derived locked counts; lint ×3 clean</item>
      </receipt_check>
    </assignment>
  </assignments>
</expectation_manifest>

<task_decomposition task_id="prog-studio-v2-2026-07-s3-drilldowns" agent_count="6">
  (packets, dependency_order, routing_notes, risk_flags, verbatim_deliverable_audit, expectation_manifest all inline above)
</task_decomposition>
