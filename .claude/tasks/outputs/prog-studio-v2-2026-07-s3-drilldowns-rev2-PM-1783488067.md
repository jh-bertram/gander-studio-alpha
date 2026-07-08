# PM Task Decomposition — prog-studio-v2-2026-07-s3-drilldowns (REVISION rev2)

Output path: `.claude/tasks/outputs/prog-studio-v2-2026-07-s3-drilldowns-rev2-PM-1783488067.md`
Supersedes: `.claude/tasks/outputs/prog-studio-v2-2026-07-s3-drilldowns-rev-PM-1783487343.md` (rev1)
Generated: 2026-07-07
Revision: round 2 — applying CR#2 (`prog-studio-v2-2026-07-s3-drilldowns-rev-CR-1783487808.md`). CR#2 verified all three rev1 fixes RESOLVED (the CR#1 blocker does not survive); this rev2 applies the ONE NEW blocker + 2 items CR#2 surfaced as a consequence of the ratified Roster→'party' re-point.
Reads used this revision: 2/3 (rev1 plan, CR#2 critique). 3rd read withheld (budget) — all facts needed are in CR#2's disk-verified block.
Structure unchanged: 6 packets, dependency order `{t1∥t2∥t3}→t4a→t4b→t5`. No packet renumber; no SC-label renumber (only SC(c) *wording* on t5 and context_files on t4a change).

**change-log (round-2, one line):** rev2 — FIX 1 (NEW BLOCKER): authorized t5's s2-spec touch list from TWO to THREE named changes (added the L313-325 aria-current invariant update — Roster now legitimately carries `aria-current="page"` on party home; rationale comment rewritten), tightened t5 SC(c)/must_not_contain to "exactly these three named changes, forbid a FOURTH"; FIX 2 (WARNING): corrected t4a's stale `party-roster.ts` context path → `packages/client/src/components/party/StatBar.tsx`, citing the CR#2-verified on-disk facts (`reason?: string` optional at :29, N/A branch defaults to `'reason not provided'` when omitted at :51); FIX 3 (bookkeeping): added the aria-current semantic-change note under the nav-decision risk flag.

---

## Nav-Contract Decision (load-bearing — declared per constraint 7) [rev2]

s3 owns nav-contract *consumption*. The party surface has **THREE** interim `'browse'` targets shipped
by s2 (disk-verified in `PartyPage.tsx` and `navigation.ts` — the earlier "both" was a two-of-three
miscount inherited from the s2 post-mortem §7 handoff; corrected in rev1 by reading the file, and
re-confirmed by CR#2 against `navigation.ts` L29-36):

1. **PartyMemberCard activation** — `PartyPage.tsx` `handleSelect` (L201-202): `setSelectedAgentCode(code)`
   + `setActiveMode('browse')` → **RE-POINT** to `setActiveMode('agent-detail')` (NEW mode). [t4b]
2. **"View Full Roster" empty-state CTA** — `PartyPage.tsx` `handleViewRoster` (L205-207):
   `setActiveMode('browse')` → **DELIBERATELY RETAINS `'browse'` this sprint** (see rationale). [t4b — comment only]
3. **Rail "Roster" item** — `RAIL_ITEMS` in `packages/client/src/constants/navigation.ts` (~L32):
   currently `mode:'browse'` (INTERIM) → **RE-POINT** to `'party'` (home/roster grid). [t4b]

Plus **back-navigation:** the new agent-detail page carries a "Back to party" affordance →
`setActiveMode('party')`. [t4a]

**[rev2 — nav side-effect, declared per CR#2 required_revision (3)]:** re-pointing the Roster rail item
to `mode:'party'` has an **intended UX side-effect**: `SubmenuRail` computes
`isActive = activeMode === item.mode` and sets `aria-current="page"` on the active item (SubmenuRail.tsx
:33/:40, CR#2-verified). SubmenuRail renders ONLY while `activeMode === 'party'` (inside PartyPage). So
after the re-point, the Roster rail item now **legitimately** carries `aria-current="page"` on the party
home — which is semantically CORRECT (you ARE on the roster/party home). This falsifies the s2 spec's
old aria-current invariant (party-shell.spec.ts L313-325, which asserted count 0 on the reasoning that
"no RAIL_ITEMS mode ever matches 'party'"), so that ONE test is authorized for update as t5's THIRD s2
touch (see t5). No source-behavior change is required — the aria-current is emitted by existing s2
SubmenuRail logic the moment Roster.mode becomes `'party'`.

**handleViewRoster resolution (explicit — ORC-recommended, ADOPTED with rationale):**
The "View Full Roster" CTA's semantic target is the **full 13-role roster catalog** — which is exactly
the surface this sprint DEFERS (see NAV SCOPE risk_flag). BrowsePage still exists until s4, so routing
the CTA to `'browse'` keeps it **functional** this sprint rather than dangling. Re-pointing it now to
`'party'` would be semantically wrong (party ≠ full catalog) and re-pointing it to a catalog mode that
does not exist yet is out of scope. Therefore handleViewRoster **retains `'browse'`** this sprint and
carries an explicit **s4 TODO marker** (code comment + deferred-work pointer) so s4's Browse-deletion
("cut") packet inherits the obligation to re-point it (to the roster catalog, or `'party'`) when
`'browse'` leaves the AppMode union. This keeps the s2 e2e CTA regression (spec L364-398, asserts
`browse-page`) **VALID and UNTOUCHED** — no t5 edit to that assertion. (Rationale for adopting ORC's
resolution rather than a stronger alternative: the only stronger option — build the catalog surface now
— exceeds the 6-packet cap and the sprint's absorption-seam scope; a functional-but-flagged retain is
the minimal correct move and the deferral is already a declared ratification item.)

**Scope boundary declared (risk_flag):** the design-spec's "full 13-role catalog" Roster surface
(reaching the 7 non-party/inactive roles' detail) is **NOT built this sprint**. Agent-detail is reachable
via the 6 party cards + the deliberately-retained "View Full Roster" Browse CTA. This satisfies all 5
sprint SCs and the absorption-proof seam; the fuller catalog is a future surface. Surfaced for
ORC/human ratification at REQVAL / Step 4.5.

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
  (detail header reuses them; qualityStats render via `StatBar` — see the QualityStat-reason note).

**QualityStat `reason` field — NO BE packet (declared) [rev2 path corrected].** `QualityStatSchema`
(schemas.ts ~L450-457) has NO `reason` field (DEFERRED-V2S1-2). s2's `StatBar` was authored for the party
roster, and its N/A variant accepts an OPTIONAL `reason`. **CR#2-verified on disk:**
`packages/client/src/components/party/StatBar.tsx` declares `reason?: string` (OPTIONAL, :29) and its N/A
branch **defaults to the literal `'reason not provided'` when `reason` is omitted** (:51). Therefore FIX 3
is **fully satisfiable with NO StatBar edit and NO invented per-stat field**: the t4a header renders
QualityStat N/A quality bars by passing NO `reason` (StatBar supplies its own default), and the N/A
*rationale* is surfaced from the `dataQualityNotes` section — never from a fabricated inline field. (The
earlier rev1 pointer to `party-roster.ts naStatBar` was a wrong-file citation — `party-roster.ts` is a
SERVER parser at `packages/server/src/parsers/party-roster.ts` and holds no StatBar prop contract;
corrected to `StatBar.tsx` here per FIX 2.) No `packages/shared`/parser touch this sprint → s3 stays
`packages/client`-only + e2e specs. If design review later requires per-stat inline N/A reasons distinct
from the generic default, a follow-up BE packet is needed (flagged).

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

    SCOPE NOTE (boundary): this packet renders NO quality-stats and does NOT touch `StatBar` —
    the qualityStats header + its N/A handling live in t4a. Introduce no dependency on a StatBar
    `reason` prop here.
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
    changes. Do NOT hide any panel when empty. No raw hex. Do NOT reuse BrowsePage's card grid.
    Do NOT render qualityStats or edit/consume StatBar (t4a's header owns quality-stat display). No
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
      <item>a StatBar `reason`-prop dependency / any qualityStats rendering (t4a's header scope)</item>
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
       shape against the router; CR#2 confirmed `getAgentDetail` exists at router.ts:794). Renders:
       a header (reuse `PortraitFrame` + RoleTag pattern + `materiaTint`; qualityStats via reused
       `StatBar`, with N/A bars driven by normalized:null — see the QUALITY-STAT REASON handling
       below); the three inventory panels (t1); the relationship panel (t2); the Revise-this-spec
       action (t3); a `dataQualityNotes` section that surfaces every note (silent-empty forbidden);
       and a "Back to party" affordance (data-testid `detail-back`, accessible name "Back to party")
       calling `setActiveMode('party')`. Distinguish the DI/empty case (specFile null → empty lists +
       dataQualityNote) from a load error — render the honest empty state, never a crash/blank.

       QUALITY-STAT REASON handling (binding — the StatBar reuse-fit) [rev2 verified]:
       `QualityStatSchema` has NO `reason` field, but s2's `StatBar` N/A variant accepts an OPTIONAL
       `reason`. **CR#2-verified on disk in `packages/client/src/components/party/StatBar.tsx`:**
       `reason?: string` is OPTIONAL (:29) and the N/A branch **defaults to the literal
       `'reason not provided'` when `reason` is omitted** (:51). Therefore render quality N/A bars by
       passing NO `reason` — StatBar supplies its own default; do NOT edit StatBar and do NOT invent a
       per-stat `reason` field. N/A rationale is surfaced via the `dataQualityNotes` section, never a
       fabricated inline reason. (If the generic default `'reason not provided'` reads as noise in the
       Step-4.5 browser check, the minimal fix is a neutral valueLabel/reason supplied AT THE CALL
       SITE — still no StatBar edit; noted as an audit-forecast item, not a blocker.)
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
    setActiveMode('party').
    (b) The qualityStats display handles `QualityStatSchema`'s missing `reason` field: the reused
    StatBar renders N/A bars WITHOUT depending on a per-stat `reason` (StatBar's `reason?` is optional
    and defaults to `'reason not provided'` — CR#2-verified StatBar.tsx :29/:51). No StatBar edit, no
    invented per-stat reason field. N/A rationale is surfaced via dataQualityNotes.
    (c) getAgentDetail returns valid, renderable data for ANY valid ROSTER code — not only the
    6 party-displayed roles — when `selectedAgentCode` is set directly. Verify by rendering
    AgentDetailPage for a non-party role code (e.g. a role outside the 6-card cap, such as DI): the page
    renders its detail (or honest empty state) without crashing. This confirms the 6-of-13 reachability
    limit is a UI-entry deferral only, not a capability gap. (Do NOT add a UI entry point for the 7
    non-party roles — that stays deferred; this SC asserts capability, not navigation.)
    (d) `'agent-detail'` is a member of AppMode; ui-store tests pass.
    (e) ModeContent PAGE_MAP routes `'agent-detail'` to a `React.lazy`-loaded AgentDetailPage on the
    shared Suspense boundary.
    (f) DI/empty-spec agent renders honest empty states + notes, not a crash.
    (g) `npm run build` succeeds and main bundle < 1000 kB (report the measured size).
    (h) `npm run lint` clean ×3.
  </success_criteria>
  <context_files>
    packages/client/src/pages/AgentDetailPage.tsx (NEW)
    packages/client/src/store/ui-store.ts (AppMode union; selectedAgentCode; setActiveMode)
    packages/client/src/store/__tests__/ui-store.test.ts (update if union change requires)
    packages/client/src/constants/navigation.ts (verify AppMode/mode metadata location)
    packages/client/src/components/ModeContent.tsx (PAGE_MAP; React.lazy pattern of existing heavy pages)
    packages/client/src/components/party/PortraitFrame.tsx, materia-tint.ts (reuse)
    packages/client/src/components/party/StatBar.tsx (StatBar N/A prop contract — CR#2 VERIFIED on disk: `reason?: string` OPTIONAL at :29; N/A branch defaults to the literal 'reason not provided' when omitted at :51 — FIX 3 is satisfiable with NO StatBar edit and NO `reason` passed)
    packages/server/src/router.ts (verify roster.getAgentDetail procedure + input at :794; confirm it resolves any valid ROSTER code — FIX 2 capability)
    packages/shared/src/schemas.ts (AgentDetailSchema — lines 460-471; QualityStatSchema ~450-457, no `reason` field)
    DESIGN.md (repo root)
  </context_files>
  <dependencies>prog-studio-v2-2026-07-s3-drilldowns-t1, prog-studio-v2-2026-07-s3-drilldowns-t2, prog-studio-v2-2026-07-s3-drilldowns-t3</dependencies>
  <out_of_scope>
    Do NOT re-point PartyPage onSelect/handleViewRoster or the Roster rail item (t4b owns those). Do NOT
    add a UI entry point for the 7 non-party roles (catalog deferred). Do NOT add the new page to the
    eager bundle (must be React.lazy). Do NOT edit StatBar to accept/omit `reason` — StatBar already
    makes `reason` optional; render N/A bars by simply not passing it. No BE/schema changes (consume
    getAgentDetail as-is). No git commit.
  </out_of_scope>
  <estimated_new_lines>~135 — JUSTIFIED whole: 1 new assembly/composition page + 2 mandatory
    registration edits (AppMode union member + one PAGE_MAP lazy entry, ~1-3 lines each). The page and
    its route cannot be separated (a page with no route or a route with no page fails the build). The
    two registration files are trivial-line-count wiring, not independent deliverables.</estimated_new_lines>
  <output_expected>
    <tag>ui_packet</tag>
    <must_contain>
      <item>AgentDetailPage.tsx composing header + t1 panels + t2 relationship + t3 revise + dataQualityNotes + Back-to-party</item>
      <item>qualityStats N/A rendering that does NOT pass/depend on a per-stat reason field (StatBar's optional `reason` default is used)</item>
      <item>evidence getAgentDetail resolves a non-party ROSTER code (capability, not UI entry)</item>
      <item>'agent-detail' added to AppMode union</item>
      <item>ModeContent PAGE_MAP React.lazy entry for 'agent-detail' on the shared Suspense boundary</item>
      <item>measured post-build main-bundle size (&lt; 1000 kB)</item>
    </must_contain>
    <must_not_contain>
      <item>eager (non-lazy) import of AgentDetailPage</item>
      <item>PartyPage onSelect/handleViewRoster edit or Roster rail re-point (t4b's scope)</item>
      <item>a UI entry point added for the 7 non-party roles (catalog deferred)</item>
      <item>invented per-stat reason field, or a StatBar edit to accommodate the missing reason</item>
      <item>server/schema modification</item>
    </must_not_contain>
    <success_signal>build passing, bundle &lt; 1000 kB reported; lint ×3 clean; 'agent-detail' routes to a lazy page rendering real getAgentDetail data; non-party code renders without crash</success_signal>
  </output_expected>
</task_packet>

<task_packet>
  <task_id>prog-studio-v2-2026-07-s3-drilldowns-t4b</task_id>
  <assigned_to>frontend</assigned_to>
  <priority>HIGH</priority>
  <description>
    Close the s2→s3 nav contract by resolving the THREE interim `'browse'` targets (disk-verified —
    handleSelect L202, handleViewRoster L206, Roster rail navigation.ts ~L32). Additive edits only; do
    not alter s2-committed structure beyond what is named here.

    1. `packages/client/src/pages/PartyPage.tsx` — the `handleSelect` handler (~L197-203) passed as
       `onSelect` to PartyMemberCard: change `setActiveMode('browse')` → `setActiveMode('agent-detail')`
       (KEEP `setSelectedAgentCode(code)`). Also update/remove the stale INTERIM comment (L198-200) so it
       no longer describes routing to Browse.
    2. `packages/client/src/pages/PartyPage.tsx` — the `handleViewRoster` handler (~L205-207) backing the
       EmptyPartyState "View Full Roster" CTA: **DELIBERATELY RETAIN `setActiveMode('browse')` this
       sprint** (do NOT change the destination). Its semantic target is the full 13-role roster catalog,
       which is deferred; BrowsePage still exists until s4, so the CTA stays functional. ADD an s4 TODO
       marker directly above/at the handler — a code comment plus a deferred-work pointer, e.g.:
         `// TODO(s4-cut): re-point "View Full Roster" when BrowsePage is deleted — 'browse' leaves the`
         `// AppMode union, so this must retarget the 13-role roster catalog (or 'party'). Deferred-work`
         `// pointer: prog-studio-v2 s4 Browse-cut packet. (nav-contract retain decision, s3.)`
    3. The Roster rail item — locate RAIL_ITEMS (verify: `packages/client/src/constants/navigation.ts`
       ~L32 OR `packages/client/src/components/party/SubmenuRail.tsx`) and re-point the "Roster" item's
       target mode from `'browse'` to `'party'`. NOTE (rev2, informational — no extra work here): this
       makes the Roster rail item match `activeMode==='party'` on the party home, so `SubmenuRail`'s
       existing `isActive→aria-current="page"` logic (SubmenuRail.tsx :33/:40) will now correctly mark
       Roster as current on party home. This is intended; the corresponding s2 aria-current invariant
       test is updated by t5 (do NOT touch any e2e spec here).
  </description>
  <success_criteria>
    (a) PartyPage `handleSelect` sets `setActiveMode('agent-detail')` (not 'browse'), retaining
    `setSelectedAgentCode`; its stale INTERIM comment is updated/removed.
    (b) The Roster rail item targets `'party'` (not 'browse').
    (c) `handleViewRoster` DELIBERATELY retains `setActiveMode('browse')` (destination
    UNCHANGED) AND carries an s4 TODO marker (code comment + deferred-work pointer to re-point when
    Browse is cut).
    (d) The ONLY remaining `'browse'` target in the party/rail nav path is the
    deliberately-retained `handleViewRoster` CTA of (c); `handleSelect` and the Roster rail no longer
    target `'browse'`.
    (e) `npm run lint` clean ×3.
  </success_criteria>
  <context_files>
    packages/client/src/pages/PartyPage.tsx (handleSelect ~L197-203; handleViewRoster ~L205-207)
    packages/client/src/components/party/SubmenuRail.tsx (RAIL_ITEMS — or; also the isActive→aria-current mechanism at :33/:40, read-only context for the intended nav side-effect)
    packages/client/src/constants/navigation.ts (RAIL_ITEMS location ~L32 — verify which holds it)
    packages/client/src/store/ui-store.ts (read-only — confirm 'agent-detail' member from t4a + setActiveMode signature)
  </context_files>
  <dependencies>prog-studio-v2-2026-07-s3-drilldowns-t4a</dependencies>
  <out_of_scope>
    Do NOT modify AppMode union or PAGE_MAP (t4a owns those). Do NOT re-point handleViewRoster's
    DESTINATION (it retains 'browse' this sprint — comment only). Do NOT touch any e2e spec (t5 owns
    the THREE authorized s2-spec changes: card Enter→agent-detail marker, Roster rail→party marker, and
    the L313-325 aria-current invariant update; the L364-398 "View Full Roster" CTA test stays
    UNTOUCHED). Do NOT modify SubmenuRail's aria-current logic — it already emits the correct value once
    Roster.mode is 'party'. No new components. No git commit. No BE/schema changes.
  </out_of_scope>
  <estimated_new_lines>~14 (handleSelect re-point + comment; handleViewRoster TODO comment (destination
    retained); Roster rail re-point; ≤2 files: PartyPage.tsx + navigation.ts).</estimated_new_lines>
  <output_expected>
    <tag>ui_packet</tag>
    <must_contain>
      <item>handleSelect → setActiveMode('agent-detail') (setSelectedAgentCode retained)</item>
      <item>Roster rail item → 'party'</item>
      <item>handleViewRoster retains 'browse' + carries an s4 TODO marker (comment + deferred-work pointer)</item>
    </must_contain>
    <must_not_contain>
      <item>a change to handleViewRoster's destination (must stay 'browse' this sprint)</item>
      <item>any 'browse' target OTHER than the deliberately-retained handleViewRoster CTA</item>
      <item>AppMode union or PAGE_MAP edits</item>
      <item>any edit to an e2e spec (t5 owns the three authorized s2-spec changes)</item>
      <item>a change to SubmenuRail's isActive/aria-current logic</item>
    </must_not_contain>
    <success_signal>lint ×3 clean; clicking a card routes to agent-detail; Roster rail routes to party (and reads as current on party home); View-Full-Roster CTA still reaches Browse and carries an s4 TODO</success_signal>
  </output_expected>
</task_packet>

<task_packet>
  <task_id>prog-studio-v2-2026-07-s3-drilldowns-t5</task_id>
  <assigned_to>frontend</assigned_to>
  <priority>HIGH</priority>
  <description>
    Author the Tier-2 Playwright e2e that IS the s3→s4 absorption-proof seam artifact, at
    `packages/client/tests/e2e/prog-studio-v2-2026-07-s3-drilldowns.spec.ts`, plus the AUTHORIZED
    cross-sprint update of exactly THREE named s2-spec changes.

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

    AUTHORIZED s2-spec update (`packages/client/tests/e2e/prog-studio-v2-2026-07-s2-party-shell.spec.ts`
    — same authorized-cross-sprint class as s2's t3-rem): make EXACTLY these THREE named changes and
    NOTHING ELSE:
      (i) Destination marker — the whole-card Tab+Enter test (~L241) asserting `browse-page` →
          assert `agent-detail-page`. Update its accompanying "routes to Browse" comment.
      (ii) Destination marker — the "rail: Roster (interim) click lands on the Browse destination
          marker" test (~L305-311) → Roster now lands on `party-page`, so update its title + assertion
          to the party marker, and its "routes to Browse" comment.
      (iii) [FIX 1 — NEW] aria-current invariant (~L313-325): the s2 test
          ("rail: aria-current is absent on the party surface") asserts
          `getRailNav(page).locator('[aria-current="page"]').toHaveCount(0)` with a rationale comment
          (~L319-320) stating "activeMode === 'party' never matches a RAIL_ITEMS mode
          (Roster/Sessions/Progression/Programs)". That invariant is now FALSE: after t4b re-points
          Roster.mode → 'party', the Roster rail item matches `activeMode==='party'` on the party home,
          so SubmenuRail sets `aria-current="page"` on it (SubmenuRail.tsx :33/:40). REWRITE this test
          so it asserts the Roster rail item specifically CARRIES `aria-current="page"` on the party
          surface (e.g. the Roster item has `aria-current="page"`; count of `aria-current="page"` in the
          rail is 1, on Roster), and REWRITE the stale L319-320 rationale comment to the new truth
          (Roster.mode === 'party' now matches the party home, so Roster reads as current there — the
          intended nav side-effect of the s3 rail re-point).

    [CRITICAL boundary] Do NOT touch the s2 spec's "View Full Roster" CTA regression test
    (~L364-398, which clicks the CTA and asserts `browse-page`). handleViewRoster DELIBERATELY retains
    `'browse'` this sprint (t4b), so that test stays VALID and UNCHANGED. Make ONLY the three named
    changes above (card Enter L241, rail Roster L305-311, aria-current invariant L313-325) — do not
    restructure the s2 suite and make NO FOURTH s2-spec change.
  </description>
  <success_criteria>
    (a) New s3 spec exists with the three absorption proofs (Browse/Graph/Edit) + a11y keyboard pass,
    all using destination-DOM markers and structural (non-count) assertions. (b) The Edit proof
    includes the buffer-contamination regression (open A, type, switch to B, assert B's editor lacks
    A's text) and the explicit-focus assertion (editor focused on open; focus returns to trigger on
    close). (c) EXACTLY THESE THREE named s2-spec changes are made — (i) card Enter → agent-detail-page,
    (ii) Roster rail → party-page, (iii) the L313-325 aria-current invariant rewritten to expect Roster
    carrying `aria-current="page"` on party home with its rationale comment updated — each with matching
    titles/comments; the s2 "View Full Roster" CTA test (L364-398) and ALL OTHER s2 assertions are
    UNCHANGED (no FOURTH s2-spec change). (d) The full e2e suite passes headless against the dev server
    (:3001). (e) `npm run lint` clean ×3.
  </success_criteria>
  <context_files>
    packages/client/tests/e2e/prog-studio-v2-2026-07-s2-party-shell.spec.ts (the THREE authorized changes: card Enter ~L241 → agent-detail-page; rail Roster ~L305-311 → party-page; aria-current invariant ~L313-325 → Roster carries aria-current on party home + rationale comment ~L319-320 rewritten. The L364-398 CTA test stays UNTOUCHED; reuse gotoParty/getCards/getRailNav helpers)
    packages/client/tests/e2e/ (conventions — DESKTOP_VIEWPORT, render-loop guard, W3 marker pattern)
    packages/client/src/pages/AgentDetailPage.tsx (t4a — testids: agent-detail-page, detail-back)
    packages/client/src/components/detail/InventoryPanels.tsx (t1 — panel testids + empty-state copy)
    packages/client/src/components/detail/RelationshipPanel.tsx (t2 — detail-relationship-panel)
    packages/client/src/components/detail/ReviseSpecAction.tsx (t3 — revise-spec-trigger; focus behavior)
  </context_files>
  <dependencies>prog-studio-v2-2026-07-s3-drilldowns-t4a, prog-studio-v2-2026-07-s3-drilldowns-t4b</dependencies>
  <out_of_scope>
    Do NOT alter any s2 assertion beyond the THREE named changes (card Enter marker, Roster rail marker,
    L313-325 aria-current invariant) + their titles/comments. Do NOT touch the s2 L364-398 "View Full
    Roster" CTA test (handleViewRoster retains 'browse'). Do NOT make a FOURTH s2-spec change. Do NOT
    assert measured data counts (skills/edges) as locked values. Do NOT modify source components (report
    defects back, do not fix inline). No git commit.
  </out_of_scope>
  <estimated_new_lines>~200 — JUSTIFIED: e2e test code; a comprehensive Tier-2 three-proof suite +
    a11y pass is inherently line-heavy and is the seam deliverable, not codebase logic. The s2 edit is
    a ~10-line three-change (two destination markers + one aria-current invariant/comment) re-point.</estimated_new_lines>
  <output_expected>
    <tag>ui_packet</tag>
    <must_contain>
      <item>new s3 e2e spec with Browse/Graph/Edit absorption proofs + a11y keyboard pass</item>
      <item>buffer-contamination regression assertion (switch A→B, no carryover)</item>
      <item>explicit-focus assertion on the revise Dialog</item>
      <item>s2-spec update of EXACTLY the three named changes: card Enter → agent-detail-page; Roster rail → party-page; L313-325 aria-current invariant → Roster carries aria-current on party home (with titles/comments)</item>
    </must_contain>
    <must_not_contain>
      <item>data-derived locked counts (expect N skills/edges)</item>
      <item>any edit to the s2 L364-398 View-Full-Roster CTA assertion</item>
      <item>a FOURTH s2-spec change (only the three named changes are authorized)</item>
      <item>inline fixes to source components</item>
    </must_not_contain>
    <success_signal>e2e suite green headless; three absorption proofs + a11y pass; exactly three named s2-spec changes made; L364-398 CTA test unchanged; lint ×3 clean</success_signal>
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
  <phrase text="SC1: party click → detail view with real data (skills/hooks materia, tools equipment, workflows abilities), each with provenance"><addressed task="t1 (panels+provenance), t4a (page+getAgentDetail), t4b (handleSelect re-point), t5 (proof)"/></phrase>
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
  <phrase text="three interim 'browse' targets resolved (handleSelect / handleViewRoster / Roster rail)"><addressed task="t4b (handleSelect→agent-detail, Roster rail→party, handleViewRoster deliberate-retain+s4 TODO)"/></phrase>
  <phrase text="Roster rail re-point aria-current side-effect (rev2)"><addressed task="t5 (third authorized s2-spec change — L313-325 aria-current invariant updated), t4b (informational nav side-effect note)"/></phrase>
  <phrase text="optional small BE packet for QualityStatSchema reason field"><out_of_scope reason="declined per constraint 1 'consume dataQualityNotes as-is'; no UI need justifies a cross-package packet; s3 stays client-only. StatBar reuse-fit satisfied at t4a call site — CR#2-verified StatBar's `reason?` is optional and defaults to 'reason not provided' (StatBar.tsx :29/:51), so N/A bars render with no reason and no StatBar edit. Follow-up flagged only if design review requires inline per-stat N/A reasons distinct from the default."/></phrase>
  <phrase text="full 13-role catalog Roster surface (design-spec submenu_structure)"><deferred reason="not required by any of the 5 sprint SCs; agent-detail reachable via the 6 party cards + the deliberately-retained 'View Full Roster' Browse CTA satisfies the absorption seam. Roster rail re-points to party home; the CTA retains 'browse' with an s4 TODO; the fuller catalog is a future surface. t4a SC(c) proves getAgentDetail resolves any ROSTER code (UI-only deferral). Declared in nav-contract + risk_flags for ORC/human ratification at REQVAL/4.5."/></phrase>
</verbatim_deliverable_audit>

---

## dependency_order

```
t1 (inventory panels)  ┐
t2 (relationship)      ├─ parallel (independent new files, no shared writers)
t3 (revise-spec)       ┘
                        → t4a (assemble page + register mode + bundle gate)   [depends t1,t2,t3]
                        → t4b (handleSelect + handleViewRoster comment + Roster rail)  [depends t4a]
                        → t5  (Tier-2 e2e proofs + THREE-change s2-spec update)  [depends t4a,t4b]
```

---

## routing_notes

**REVISION STATUS:** revision round 2 — applying CR#2 (NEW BLOCKER FIX 1 + WARNING FIX 2 + bookkeeping
FIX 3). CR#2 verified all three rev1 fixes RESOLVED and the CR#1 blocker does NOT survive. Structure,
agent count (6), and dependency order preserved per the bounded-revision instruction. No packet
renumbered; no SC-label renumber (only t5 SC(c) wording + must_not_contain, t4a context_files, t4b
out_of_scope/context_files, and risk_flags changed).

<recurring_pattern source="prog-studio-v2-2026-07-s2-party-shell.md §6 G1">latent-bundle-weight / lazy-from-birth: NEW pages must be React.lazy from birth; gate measured at plan time (756.80 kB baseline, 243 kB headroom).
  → AVOIDED: t4a wires AgentDetailPage via React.lazy on the shared Suspense boundary and measures the post-build bundle < 1000 kB at the wiring packet; must_not_contain forbids an eager import.</recurring_pattern>
<recurring_pattern source="prog-studio-v2-2026-07-s2-party-shell.md §6 G2">primitive behavioral defaults: any popover/dialog/floating primitive must set focus/role EXPLICITLY (the s2 HIGH defect class).
  → AVOIDED: t3's Revise Dialog sets initialFocus + role explicitly (must_not_contain forbids base-ui default reliance); t5 asserts editor-focused-on-open + focus-returns-to-trigger. Panels (t1/t2) carry no focus-stealing floating primitives.</recurring_pattern>
<recurring_pattern source="prog-studio-v2-2026-07-s2-party-shell.md §6 G3">git stash forbidden.
  → AVOIDED: no packet uses git stash; agents do not commit (ORC commits post-audit).</recurring_pattern>
<recurring_pattern source="prog-studio-v2-2026-07-s2-party-shell.md §6 G6">commit-before-verdict ordering — ORC-side close-time class.
  → ACCEPTED as ORC-handled: no PM action; flagged for ORC ordering discipline.</recurring_pattern>
<recurring_pattern source="prog-studio-v2-2026-07-s1-data-layer.md §6 G1">corpus/codebase-fact citations: facts in packet text must carry measured citations or verify-then-implement phrasing.
  → AVOIDED + REINFORCED THIS REVISION: rev1 corrected the rev0 "both" browse-target miscount by disk-reading PartyPage.tsx; rev2 replaces the last wrong-file citation (`party-roster.ts`, a server parser) with the CR#2-disk-verified `StatBar.tsx :29/:51` facts, and cites `router.ts:794` for getAgentDetail and `SubmenuRail.tsx :33/:40` for the aria-current mechanism — all from CR#2's disk-verified block. Remaining unverified claims stay "verify-then-implement".</recurring_pattern>
<recurring_pattern source="pm_preflight OVERSCOPED">≤2 independent files/packet.
  → HONORED with ONE justified exception: t4a = 3 files (1 new page + 2 mandatory 1-3 line registration edits that cannot be separated from the page — build fails if split). t4b = 2 files (PartyPage.tsx + navigation.ts). t5 = 2 files (new s3 spec + s2 spec three-change update). All other packets ≤2 files. Justification embedded in t4a estimated_new_lines.</recurring_pattern>
<recurring_pattern source="pm_preflight DRY">name what each new piece reuses.
  → HONORED: reuse-vs-rebuild rationale stated per absorb target (Browse/Graph/Edit) + s2 primitive reuse (PortraitFrame/StatBar/materiaTint/RoleTag) — see the Reuse-vs-Rebuild block.</recurring_pattern>

**acknowledgements:** recurring patterns from all 3 named post-mortems enumerated above; OVERSCOPED, DRY, lazy-from-birth, explicit-focus, git-stash, corpus-fact-citation all addressed. The new BLOCKER CR#2 surfaced is an adjacent consequence of the ratified rail-to-'party' resolution (aria-current side-effect), not a recurrence of the CR#1 nav-enumeration miss — it is resolved by authorizing t5's third s2-spec change.

**append_serialization:** N/A — NO two s3 packets write the same file. Writer map:
  ui-store.ts → t4a only; ModeContent.tsx → t4a only; PartyPage.tsx → t4b only (both handlers); navigation.ts (RAIL_ITEMS) → t4b only; s2 e2e spec → t5 only (THREE named changes, L364-398 untouched); new s3 spec → t5 only; each new detail-component file single-owner. No shared-file race exists this sprint.

**prior_approved_tasks (auditor guard):** ui-store.ts, ModeContent.tsx, PartyPage.tsx, SubmenuRail.tsx/navigation.ts, and the s2 e2e spec all carry committed s2 (party-shell) content. s3 edits are ADDITIVE (new AppMode member; new PAGE_MAP lazy entry; handleSelect re-point; handleViewRoster comment-only; Roster rail re-point; the THREE authorized s2-spec test changes). The pre-existing s2 code — including the s2 `handleViewRoster→'browse'` handler which s3 DELIBERATELY retains, the s2 e2e L364-398 CTA test, and SubmenuRail's existing isActive→aria-current logic (which s3 does NOT modify — it merely begins matching once Roster.mode is 'party') — is authorized/committed and must NOT be flagged by the auditor as an out-of-scope modification or a dead-end defect. Specifically, the auditor should EXPECT (not flag) that the s2 aria-current test at L313-325 is updated by t5: it is a declared, CR#2-authorized cross-sprint change caused by the ratified Roster→'party' re-point.

**foreground-gate (DISPATCH BLOCK):** Per human_request — implementation dispatch is GATED on the human's s2 browser confirmation. ORC must NOT dispatch t1-t5 until the human confirms s2 in-browser ("execute on OK"). This decomposition is "plan now"; ORC holds all packets until the gate opens. Additionally, SC5's Step-4.5 human browser check is an ORC-side close gate after audit PASS — see the REQVAL/4.5 ratification items in risk_flags.

**DESIGN.md status:** PRESENT at repo root (`/home/jhber/projects/gander-studio-alpha/DESIGN.md`). All UI packets (t1-t4a) must set `design_system_source: DESIGN_MD` and trace tokens to named DESIGN.md / v2-design-spec contrast_pairs entries.

**sc-precheck (ORC re-runs before CR#3):** ORC RE-RUNS sc-precheck on THIS rev2 file before CR#3 (per revision bookkeeping). PM note: rev2 authored NO new diff-gated SCs vs HEAD and NO new data-derived locked values. The only SC changes vs rev1 are t5 SC(c) *wording* (two markers → three named changes, forbid a FOURTH) and t4a context_files/SC(b) *citation* correction — both structural/verify-then-implement, not brittle locked greps. CR#2's own sc-precheck run reported 0 findings; rev2 introduces no new locked-value/diff-gated form. Step 7.5 self-lint re-run: t4b SC(d) ("only remaining 'browse' target is the retained handleViewRoster CTA") remains SATISFIABLE (handleSelect + rail no longer say 'browse'); t5 SC(c) ("exactly these three named changes; L364-398 unchanged") is SATISFIABLE — the three changes are named and disjoint, and the CTA test is explicitly excluded. No unsatisfiable locked-value SC exists.

**SC changes (this revision) — for the changelog:**
  - t5: SC(c) reworded from "EXACTLY TWO s2 destination markers re-pointed; L364-398 unchanged" → "EXACTLY THESE THREE named s2-spec changes (card Enter → agent-detail-page; Roster rail → party-page; L313-325 aria-current invariant rewritten to expect Roster carrying aria-current on party home); L364-398 + all other s2 assertions unchanged (no FOURTH change)". must_contain and must_not_contain updated correspondingly (must_not_contain now forbids "a FOURTH s2-spec change"). context_files, description AUTHORIZED-update block, and out_of_scope updated to the three-change list. SC-label set (a)-(e) UNCHANGED.
  - t4a: context_files corrected — dropped `components/party/party-roster.ts` (a non-existent client path; it is a server parser) and added `packages/client/src/components/party/StatBar.tsx` with the CR#2-verified on-disk facts (`reason?` optional :29; N/A default 'reason not provided' :51). SC(b) wording updated to cite those verified facts; router.ts:794 getAgentDetail citation added. SC-label set (a)-(h) UNCHANGED.
  - t4b: added the informational aria-current side-effect note (no extra work); out_of_scope + must_not_contain updated to name the THREE authorized t5 s2-spec changes and forbid touching SubmenuRail's aria-current logic. SC-label set (a)-(e) UNCHANGED.
  - t1/t2/t3: unchanged.
  - risk_flags: added the aria-current semantic-change one-liner under the nav-decision flag (FIX 3).

**Critic relevance:** highest-value probes for CR#3 → (1) [PRIMARY — the CR#2 NEW BLOCKER] t5's THREE-change s2-spec discipline: the L313-325 aria-current invariant is rewritten to expect Roster carrying `aria-current="page"` on party home + rationale comment updated, and NO FOURTH s2-spec change is made (L364-398 CTA test still untouched); (2) t4a context path now points at the real StatBar.tsx contract (FIX 2) and SC(b) renders N/A bars with no reason / no StatBar edit; (3) t4a SC(c) any-ROSTER-code capability proof; (4) bundle-gate measurement at t4a; (5) RF v12 <Handle> on the relationship node (t2); (6) buffer-contamination regression coverage (t3+t5); (7) t4b's Roster→'party' re-point and its correctly-anticipated aria-current side-effect (no SubmenuRail logic edit). SA (tokens/DRY/contrast), QA (e2e absorption + aria-current coverage) primary; SX minimal (no new server surface).

## risk_flags

- **[REQVAL / Step-4.5 human ratification — retained-target decision + nav side-effect]:** Detail screens
  are reachable this sprint via the **6 party cards + the deliberately-retained "View Full Roster"
  Browse CTA**; the **full 13-role catalog entry point is DEFERRED**. `handleViewRoster` keeps routing to
  `'browse'` (functional until s4) and carries an s4 TODO to re-point when Browse is cut. **Ratify this
  scope or extend the sprint** to add a catalog entry point. (Directly coupled: the "View Full Roster"
  CTA is the deferred catalog's front door — its destination is the same decision being ratified.)
  **[FIX 3 — aria-current semantic change, added rev2]:** the ratified Roster-rail → `'party'` re-point
  makes the Roster rail item the party-home affordance, so it now legitimately reads as `aria-current="page"`
  (current) on the party home — the human will SEE Roster highlighted as current on party home in the
  Step-4.5 walkthrough. This is intended and semantically correct (Roster/party home is the current
  surface); the s2 aria-current invariant test is updated to match (t5 third change). If the human does
  NOT want Roster highlighted on party home, the alternative is to keep Roster.mode at a non-'party'
  value — but 'party' is the correct destination, so the ratified choice + test update stands unless the
  human objects at 4.5.
- **NAV SCOPE (three targets, corrected):** the party surface had THREE interim 'browse' targets
  (handleSelect L202, handleViewRoster L206, Roster rail navigation.ts L32) — the rev0 "both" was a
  two-of-three miscount, corrected by disk read (rev1) and re-confirmed by CR#2 against navigation.ts
  L29-36. Resolution: handleSelect→'agent-detail', Roster rail→'party', handleViewRoster→RETAIN 'browse'
  (s4 TODO). If the human intends Roster/CTA to reach a distinct catalog surface NOW, a new catalog
  packet is needed (would exceed the 6-packet cap → re-plan).
- **6-of-13 reachability (UI-only deferral):** PartyPage renders only 6 of 13 roster members
  (PARTY_GRID_DISPLAY_CAP=6); the 7 inactive roles (incl. DI) have no dedicated UI entry to their
  detail this sprint. t4a SC(c) proves getAgentDetail RESOLVES any valid ROSTER code (capability
  exists; the deferral is a navigation gap only). REQVAL must adjudicate "clicking any roster agent" =
  "any of the 6 shown cards + the Browse CTA" against the human — do not read as silent SC1
  under-delivery.
- **StatBar reuse-fit (QualityStat has no `reason`) — RESOLVED path [rev2]:** t4a reuses s2's StatBar.
  CR#2-verified on disk: StatBar's `reason?: string` is OPTIONAL (:29) and its N/A branch defaults to
  the literal `'reason not provided'` (:51). So N/A quality bars render with NO `reason` passed and NO
  StatBar edit; the N/A rationale comes from `dataQualityNotes`. Residual (audit-forecast, non-blocker):
  every QualityStat N/A bar will show the generic `'reason not provided'` string; if that reads as noise
  at 4.5, a neutral valueLabel at the call site (still no StatBar edit) is the minimal fix. If design
  review later demands distinct inline per-stat N/A reasons, a follow-up `packages/shared` + parser
  packet is required.
- **base-ui default focus (s2 HIGH class recurrence risk):** t3's Revise Dialog MUST set
  initialFocus/role explicitly — if missed, reproduces the s2 focus-oscillation/tab-stop defect class.
  Probed by t5's explicit-focus assertion.
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
  <generated>2026-07-07 (rev2)</generated>
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
        <item>no StatBar/qualityStats rendering (t4a boundary)</item>
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
        <item>qualityStats N/A renders with StatBar's optional `reason` default (no reason passed, no StatBar edit) [FIX 2/3]</item>
        <item>evidence getAgentDetail (router.ts:794) resolves a non-party ROSTER code without crash</item>
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
        <item>handleSelect → setActiveMode('agent-detail'); stale INTERIM comment updated</item>
        <item>Roster rail → 'party'</item>
        <item>handleViewRoster RETAINS 'browse' + carries an s4 TODO marker (comment + deferred-work pointer)</item>
        <item>only remaining 'browse' target is the retained handleViewRoster CTA</item>
        <item>no e2e-spec edit and no SubmenuRail aria-current logic edit</item>
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
        <item>EXACTLY THREE named s2-spec changes: card Enter → agent-detail-page; Roster → party-page; L313-325 aria-current invariant → Roster carries aria-current on party home (+ rationale comment); L364-398 CTA test UNCHANGED; no FOURTH change [FIX 1]</item>
        <item>e2e suite green headless; no data-derived locked counts; lint ×3 clean</item>
      </receipt_check>
    </assignment>
  </assignments>
</expectation_manifest>

<task_decomposition task_id="prog-studio-v2-2026-07-s3-drilldowns" agent_count="6">
  (packets, dependency_order, routing_notes, risk_flags, verbatim_deliverable_audit, expectation_manifest all inline above — rev2)
</task_decomposition>
