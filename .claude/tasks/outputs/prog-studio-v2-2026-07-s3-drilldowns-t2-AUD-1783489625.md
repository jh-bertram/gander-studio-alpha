# Audit Verdict — prog-studio-v2-2026-07-s3-drilldowns-t2 (RelationshipPanel, Graph absorption lane)

Auditor working notes precede the typed block. Envelope: task_id first SPAWN = seq 96 @ 2026-07-08 (UTC) → POST-cutover → v2.0 typed wrapper. Playwright SKIPPED is legitimate (t5 owns the Tier-2 runtime absorption proof); flagged as a known visual blindspot for the t5 audit.

## Load-bearing check — RF v12 Handle convention (the memorized invisible-edges gotcha)
PASS. `RelationshipNode` (RelationshipPanel.tsx:143-190) renders BOTH handles on every node instance (center + every leaf):
- `<Handle type="target" position={Position.Left} style={HANDLE_STYLE} />` (L149)
- `<Handle type="source" position={Position.Right} style={HANDLE_STYLE} />` (L187)
Diffed against GraphNode.tsx:34/102 — identical convention (target=Left, source=Right). `HANDLE_STYLE` (L46-51) is byte-equivalent to GraphNode's `handleStyle` (bg `var(--mt)`, 8×8, `1px solid var(--bd)`). Star topology renders: center emits N source edges, each leaf receives one target edge. `RELATIONSHIP_NODE_TYPES` is a module-level constant (L194), mirroring GraphPage's NODE_TYPES_MAP (no identity churn). Edge count is a 1:1 `.map()` over relationships[] (L118), never hardcoded — unit-verified.

## target-id formatting claim — VERIFIED against gander corpus + parser
- `docs/connectivity-graph.json` node ids are raw file paths (e.g. `.claude/agents/archivist.md`).
- `agent-detail.ts` `relationshipsFromGraph` L120 sets `target: isSource ? edge.target : edge.source` — a raw connectivity node id / file path.
- `RelationshipEdgeSchema` (schemas.ts:443-448) = `{ target: z.string(), edgeType: z.string(), confidence: z.enum(['DETECTED','INFERRED']) }`.
FE's rationale for `formatTargetLabel` (derive readable basename client-side, string-ops only, no fetch) is accurate. Unit tests cover the `.md/.ts/.tsx/.json` strip + raw-string fallback + empty string.

## Adjudications
- **Line-count overage (298 vs ~95 estimate): SCOPE-FAITHFUL, not creep.** 2-file budget honored exactly (component + colocated test). Overage = Handle-compliant custom RF node markup + pure testable helpers (formatTargetLabel/computeStarLayout/buildRelationshipGraph) + DETECTED/INFERRED legend + honest empty state — each SC-mandated. No other task_id's scope consolidated here (grep confirms no page assembly / nav / inventory-panel code). Accept.
- **DRY (star-fan layout vs importing GraphPage's applyDagreLayout): DEFENSIBLE REBUILD.** The PM packet explicitly authorized "reuse the dagre-layout pattern ... OR a minimal radial/LR layout." applyDagreLayout is unexported/private to GraphPage; importing would force an export + cross-module coupling for a fixed 1-center/N-leaf star that needs no general DAG pass. The actual RF v12 gotcha (the Handle convention) IS mirrored. Not a DRY violation.

<audit_verdict schema_version="2.0">
  <task_id>prog-studio-v2-2026-07-s3-drilldowns-t2</task_id>
  <provenance_marker>audit-pipeline@2.0.0</provenance_marker>
  <auditor_spawn>
    <agent_id>AUD#2</agent_id>
    <parent>ORC#0</parent>
    <independent_from>FE#2</independent_from>
  </auditor_spawn>
  <inputs>
    <input path="packages/client/src/components/detail/RelationshipPanel.tsx" sha256="bf62a43b3b523929773201e3f3d8b27b952a68465481103d361bf1e407f21312"/>
    <input path="packages/client/src/components/detail/__tests__/RelationshipPanel.test.ts" sha256="b0ab99acd9e112e4ba557d47b08296a4ec87db0fc896fc17240e84a1aa50ac55"/>
    <input path=".claude/tasks/outputs/prog-studio-v2-2026-07-s3-drilldowns-t2-FE-1783488861.md" sha256="dc51f215e681cf9c5ab7e8b5ec93d579bae1728aacc4bca200697eb4dca6e841"/>
    <input path=".claude/tasks/outputs/prog-studio-v2-2026-07-s3-drilldowns-rev2-PM-1783488067.md" sha256="cfe9cf28f0bcf7795735357e12789c3f6192cb8c39ff61d20b5828af5823656c"/>
  </inputs>

  <sa status="PASS">
    <audit_review>
      <target_file>packages/client/src/components/detail/RelationshipPanel.tsx</target_file>
      <status>PASS</status>
      <violations/>
      <notes>
        TS strict clean: no `any` (RelationshipNodeData's `[key:string]:unknown` is RF's required Node-data index-signature constraint, not an escape hatch); all params/returns annotated; RelationshipEdge type imported from @gander-studio/shared (z.infer). Naming conventions honored (PascalCase component, camelCase helpers, SCREAMING_SNAKE constants, kebab-case file). FF7 tokens only — 0 raw hex (grep-verified); every color is var(--token). DETECTED/INFERRED distinction is triple-encoded (node accent bar --mg/--wm, edge solid/dashed --mt/--wm, and a role="note" legend with real DOM text "Detected"/"Inferred") — survives color-perception removal. Handle convention mirrors GraphNode.tsx exactly (load-bearing check PASS). DRY rebuild of the star layout is packet-authorized and defensible (see adjudication).
      </notes>
    </audit_review>
  </sa>

  <qa status="PASS">
    <test_report>
      <task_id>prog-studio-v2-2026-07-s3-drilldowns-t2</task_id>
      <status>PASS</status>
      <test_coverage>unit 54 passed, 0 failed (9 new RelationshipPanel helper tests RAN and passed)</test_coverage>
      <lint>npm run lint → exit 0 (tsc ×3: shared, server, client all clean)</lint>
      <playwright>
        <tier>SKIPPED — legitimate; t5 owns the Tier-2 runtime absorption proof (prog-studio-v2-2026-07-s3-drilldowns.spec.ts). This is a pure presentational component with no page assembly/nav; RF-canvas rendering is exercised by t5, not mountable in this repo's node-env vitest.</tier>
      </playwright>
      <target_id_claim>VERIFIED — RelationshipEdge.target is a raw connectivity node id / file path (agent-detail.ts:120 + docs/connectivity-graph.json corpus); formatTargetLabel correctly derives a client-side basename.</target_id_claim>
      <line_count_adjudication>298 vs ~95 estimate — SCOPE-FAITHFUL. 2-file budget honored exactly; overage is SC-mandated content, no cross-task consolidation.</line_count_adjudication>
      <defects/>
    </test_report>
  </qa>

  <sx status="SECURE">
    <security_audit>
      <status>SECURE</status>
      <threat_level>LOW</threat_level>
      <findings/>
      <notes>Pure presentational component. No network (0 useQuery/getGraph/fetch — the two grep hits are comments disclaiming those calls). No dangerouslySetInnerHTML/innerHTML/eval/JSON.parse. No user-input boundary — inputs are typed props (code:string, RelationshipEdge[]). formatTargetLabel is string-ops only. No secrets. No new dependency surface.</notes>
    </security_audit>
  </sx>

  <pipeline_integrity>
    <flag code="VISUAL_BLINDSPOT_KNOWN">
      Static review cannot prove RENDERED RF edge visibility (the exact failure mode of the historical invisible-edges regression). The Handle markup, node-type registration, and 1:1 edge map all match the react-flow convention, so the diff is structurally sound — but visible-edge proof is deferred to t5. RECOMMENDATION for the t5 audit: t5's Graph-absorption PROOF 2 MUST assert a visible `.react-flow__edge` element is present (count > 0 when the chosen agent has relationships), not merely that `.react-flow` mounts.
    </flag>
    <note>Parallel t4a work observed in tree — out of scope for this audit. CI N/A (no CI in this repo).</note>
  </pipeline_integrity>

  <overall_status>PASS</overall_status>
</audit_verdict>
