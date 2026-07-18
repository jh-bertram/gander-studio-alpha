# FE#2 Output — prog-studio-v2-2026-07-s3-drilldowns-t2

Task: relationship panel (Graph absorption lane), REV2 plan (CR#3-passed)
Source packet: `.claude/tasks/outputs/prog-studio-v2-2026-07-s3-drilldowns-rev2-PM-1783488067.md` → `<task_packet>` t2 ONLY.

```xml
<ui_packet>
  <task_id>prog-studio-v2-2026-07-s3-drilldowns-t2</task_id>

  <components_created>
    <file path="packages/client/src/components/detail/RelationshipPanel.tsx" lines="298">
      Default export `RelationshipPanel({ code, relationships }: RelationshipPanelProps)`.
      Also exports pure helpers `formatTargetLabel`, `computeStarLayout`,
      `buildRelationshipGraph`, and the `RelationshipNodeData`/`RelationshipPanelProps` types
      (logic-outside-JSX discipline — testable without mounting React Flow).
    </file>
    <file path="packages/client/src/components/detail/__tests__/RelationshipPanel.test.ts" lines="89">
      9 vitest unit tests against the exported pure helpers (node env, no jsdom — matches
      vitest.config.ts's `environment: 'node'` + `.test.ts`-only include glob).
    </file>
  </components_created>

  <state_hydration_map>
    Pure props-in component. `code: string` + `relationships: RelationshipEdge[]` arrive as
    props from the page (t4a's `roster.getAgentDetail` call, per this packet's explicit
    contract: "t4a passes `relationships` + `code`"). NO trpc query, NO `connectivity.getGraph`
    call anywhere in this file — verified by grep (0 matches for `useQuery`/`getGraph` in the
    component). Node/edge arrays are derived via `useMemo(() => buildRelationshipGraph(code,
    relationships), [code, relationships])` — recomputed only when the target agent or its
    relationship slice changes, matching t3's sibling target-keyed-reset discipline in spirit
    (fresh graph per agent, no stale carryover).
    Props-boundary note: my packet's contract lists only `{ code, relationships }` — it does
    NOT list `dataQualityNotes` as a t2 prop (t4a's own packet text separately owns "a
    dataQualityNotes section that surfaces every note"). I honored the literal two-prop
    contract rather than assuming a third prop t4a hasn't been authorized/asked to wire; if a
    relationship-specific dataQualityNote (e.g. "connectivity graph unavailable on disk —
    materia/relationships may be incomplete", verified present in
    `packages/server/src/parsers/agent-detail.ts`) needs surfacing inside this panel rather
    than only in t4a's top-level notes section, that's an integration decision for t4a, not a
    change I made unilaterally.
  </state_hydration_map>

  <rf_handle_compliance>
    RF v12 GOTCHA (memorized, binding): custom nodes MUST render &lt;Handle&gt; elements even
    for purely programmatic edges, or edges silently fail to render. Verified GraphNode.tsx's
    convention first (read-only context file): it renders BOTH `<Handle type="target"
    position={Position.Left}>` AND `<Handle type="source" position={Position.Right}>` on every
    node, regardless of the node's semantic role in the graph.
    `RelationshipNode` (module-local to RelationshipPanel.tsx) mirrors this exactly: every
    node — the center agent node AND every leaf target node — carries both Handles. This
    guarantees edges render correctly for BOTH directions this star topology needs (center
    emits N edges via its source Handle; every leaf receives one via its target Handle) without
    needing per-node-role Handle logic. `RELATIONSHIP_NODE_TYPES` (the RF `nodeTypes` map) is
    declared as a module-level constant (not inline in JSX) to avoid RF's node-type identity
    churn warning, mirroring `NODE_TYPES_MAP` in GraphPage.tsx.
    Edge count is never hardcoded: `buildRelationshipGraph` maps `relationships[]` 1:1 into
    `edges[]` (`edges.map(...)` from the same array the nodes were built from), so DOM edge
    count is structurally guaranteed to equal `relationships.length` — verified by the unit test
    "edge count always equals relationships.length — never hardcoded" and "every edge
    references an existing source/target node id".
  </rf_handle_compliance>

  <data_contract_verified>
    Grepped `packages/shared/src/schemas.ts` for `RelationshipEdgeSchema` (L443-448) and
    `AgentDetailSchema` (L460-471) before writing any field-accessing code:
    `RelationshipEdgeSchema = z.object({ target: z.string(), edgeType: z.string(), confidence:
    z.enum(['DETECTED','INFERRED']) })`. Then traced the actual server-side producer
    (`packages/server/src/parsers/agent-detail.ts` `relationshipsFromGraph`, disk-read) and the
    real corpus file `docs/connectivity-graph.json` (via GANDER_ROOT) to confirm `target` is
    the RAW connectivity-graph node id — a file path like `.claude/agents/pm.md` — NOT a
    friendly display name. This is why `formatTargetLabel` exists (derives a readable basename
    client-side, string ops only, no fetch) rather than displaying the raw path or guessing at
    a `.name`/`.label` field that does not exist on `RelationshipEdge`.
  </data_contract_verified>

  <sc_self_check>
    <sc id="a">
      PASS. Center node (`kind:'center'`) + one node per `relationships[]` entry (index-keyed,
      NOT target-deduped — matches SC(a)'s literal wording "one node per relationships[]
      entry"), one edge per relationship. Edge count == relationships.length by construction
      (1:1 `.map()`, never hardcoded) — unit-tested.
    </sc>
    <sc id="b">
      PASS. `RelationshipNode` renders both a target Handle (Left) and a source Handle (Right)
      on every node instance, mirroring GraphNode.tsx's convention exactly.
    </sc>
    <sc id="c">
      PASS. Visual: target-node accent bar is `--mg` (green, solid) for DETECTED vs `--wm`
      (muted, still solid bar but paired with dashed edge) for INFERRED; node badge text shows
      the literal confidence string. Edge: solid `--mt` stroke for DETECTED vs dashed (`5,5`)
      muted `--wm` stroke + 0.75 opacity for INFERRED. Plus a dedicated
      `relationship-confidence-legend` (role="note") with real DOM text "Detected"/"Inferred"
      (not color-only, so the distinction survives color-perception removal).
    </sc>
    <sc id="d">
      PASS. `relationships.length === 0` renders a `role="status" aria-live="polite"` message
      ("No recorded relationships for this agent.") INSIDE the same `detail-relationship-panel`
      section — the panel is never hidden/collapsed to nothing, and the RF canvas is simply not
      mounted in that branch (mirrors GraphPage's own precedent: its empty-state branch also
      skips `<ReactFlow>`, not a new pattern I invented).
    </sc>
    <sc id="e">
      PASS. All colors are `var(--token)` FF7 runtime custom properties (grep-verified: 0 raw
      hex matches in either file). Every token used (`--sf`, `--bd`, `--radius`, `--mt`, `--w`,
      `--wm`, `--wd`, `--sfm`, `--sfh`, `--r`, `--fb`, `--fm`, `--void`, `--bdb`, `--mg`) is a
      pre-existing runtime token already defined in `globals.css` and traceable to the
      v2-design-spec.md `<tokens>`/`<contrast_pairs>` tables (e.g. `--wm` on `--sf`/`--sfm` is
      the explicitly-cited "Muted / N/A caption text" row at ~7.0-8.3:1 AAA — used for the badge
      text, legend text, and empty-state message).
    </sc>
    <sc id="f">
      PASS. `npm run lint` clean (exit 0, all 3 tsc projects, verbatim below).
    </sc>
  </sc_self_check>

  <design_tokens_used>
    --sf (panel surface), --bd (panel/default border), --bdb (RF background dot color, also the
    "hover/active border" token reused for the dot-grid tint), --radius (outer panel radius,
    matches sibling InventoryPanels.tsx's PanelShell exactly), --r (inner node-card radius,
    matches GraphNode.tsx exactly), --mt (center-node accent + DETECTED edge stroke + panel
    icon color), --mg (DETECTED target-node accent bar — reuses the "Impl-role materia /
    Stamina bar fill" token per its existing precedent as a non-text 3:1 fill color), --wm
    (INFERRED target-node accent + INFERRED edge stroke + badge text + legend text — cited AA/
    AAA "Muted / N/A caption text" contrast_pairs row), --w (node label text, panel h2 title —
    cited 21:1/17.8:1 contrast_pairs rows), --wd (empty-state body text — cited 9.6:1 AAA
    contrast_pairs row), --sfm (center-node fill + confidence badge background — cited
    "lighter surfaces" AAA row), --sfh (target-node fill), --void (RF canvas background,
    matches GraphPage), --fb (body font family), --fm (mono font family — node badges, edge
    labels, legend). No raw hex anywhere in either file (grep-verified, 0 matches).
  </design_tokens_used>

  <style_conflict_check>NONE — grepped both files for inline `style="..."` string attributes
    overlapping a Tailwind class on the same CSS property; 0 matches (this component uses JSX
    `style={{...}}` objects exclusively for token-bearing properties, and Tailwind utility
    classes exclusively for layout-only properties — e.g. `className="flex flex-row
    overflow-hidden"` + `style={{ background, border, borderRadius, width }}` never share a
    CSS property between the class list and the style object; verified property-by-property).
  </style_conflict_check>

  <click_handler_keyboard_audit>
    NONE FOUND. `grep -nE "<(span|div|li|a)[^>]*onClick=" RelationshipPanel.tsx` → 0 matches.
    This component has no click/interactive handlers at all — it is a pure rendering panel; the
    only interactive affordances are React Flow's own `<Controls />` buttons (real `<button>`
    elements RF renders internally, already keyboard-navigable, not markup I authored).
  </click_handler_keyboard_audit>

  <json_parse_safety>N/A — no `JSON.parse` call in either file (grep-verified, 0 matches).</json_parse_safety>

  <function_body_dedup>N/A — no onClick/onFocus/onBlur/onChange/onKeyDown handlers exist in
    this component (grep-verified, 0 matches); nothing to deduplicate.
  </function_body_dedup>

  <e2e_spec>TIER_1_ONLY for this packet — t2's own scope is "panel component only" (no page
    assembly, no nav). The packet's own dependency graph assigns the Tier-2 Playwright
    absorption-proof spec to t5 (`prog-studio-v2-2026-07-s3-drilldowns.spec.ts`), which depends
    on t4a+t4b (page assembly + nav re-point) and explicitly owns "PROOF 2 (Graph absorption)"
    against my `detail-relationship-panel` testid, `.react-flow`/`.react-flow__edge` DOM, and
    confidence markers. Authoring that spec here would exceed this packet's stated boundary
    ("panel component only — no page assembly, no nav") and duplicate t5's assigned scope.
  </e2e_spec>

  <lint_verbatim>
npm run lint

> lint
> tsc --noEmit --project packages/shared/tsconfig.json && tsc --noEmit --project packages/server/tsconfig.json && tsc --noEmit --project packages/client/tsconfig.json

(exit 0 — no output from any of the three tsc invocations)
  </lint_verbatim>

  <vitest_verbatim>
npm test -w @gander-studio/client

> @gander-studio/client@0.1.0 test
> vitest run

 RUN  v4.1.7 /home/jhber/projects/gander-studio-alpha/packages/client

 Test Files  8 passed (8)
      Tests  54 passed (54)
   Start at  23:44:16
   Duration  1.34s (transform 961ms, setup 0ms, import 1.76s, tests 85ms, environment 1ms)

(8 files = 6 pre-existing suites [ui-store, session-metrics, group-agents, PartyPage, StatBar,
PartyMemberCard] + 1 sibling in-flight file from parallel t3 work
[components/detail/__tests__/revise-spec-buffer.test.ts] + my new
components/detail/__tests__/RelationshipPanel.test.ts — 9 new tests, 0 regressions)
  </vitest_verbatim>

  <line_count_note>
    RelationshipPanel.tsx is 298 lines against the packet's ~95-line estimate. The packet's ONE
    hard file-count boundary ("≤2 files respected (1 new file)") is honored exactly — 2 files
    total (component + colocated test), not 3+. The line overage is the Handle-compliant custom
    RF node markup + pure testable layout/graph-builder helpers + DETECTED/INFERRED legend +
    honest empty state, each directly mandated by an SC — not scope creep into page assembly,
    nav, or inventory panels (all explicitly out of scope and not touched). Flagged here
    transparently rather than trimmed for line-count optics; ORC/Critic can weigh whether a
    follow-up split is warranted, but no additional task_id's scope was consolidated into this
    one to produce it.
  </line_count_note>

  <integration_status>SUCCESS — builds against the real `@gander-studio/shared`
    `RelationshipEdge` type (not a mock), consumes the disk-verified `AgentDetailSchema`
    contract, lint clean ×3, vitest 54/54 (9 new). Not yet wired into any page (t4a's job,
    dependency listed as t1/t2/t3 → t4a in the PM plan) — that is expected and correct per this
    packet's own boundary ("panel component only — no page assembly").
  </integration_status>
</ui_packet>
```
