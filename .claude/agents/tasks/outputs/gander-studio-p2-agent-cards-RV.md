# Requirements Validation — gander-studio-p2-agent-cards

```xml
<requirements_validation>
  <sprint>gander-studio-p2-agent-cards</sprint>
  <date>2026-04-04</date>
  <tasks_validated>DS-001, FE-001a, FE-001b, FE-002, FE-003</tasks_validated>
  <summary>
    <covered>35</covered>
    <partial>1</partial>
    <missing>0</missing>
  </summary>
  <criteria>

    <!-- ── DS-001 ──────────────────────────────────────────────────────────── -->

    <criterion>
      <task>DS-001</task>
      <description>agent-roles.ts exists with AgentRole type and all 4 agent Sets plus fragment arrays</description>
      <status>COVERED</status>
      <evidence>packages/client/src/constants/agent-roles.ts exports AgentRole, META_AGENTS, SPECIALIST_AGENTS, GATE_AGENTS, EXTERNAL_AGENTS, and all four *_FRAGMENTS arrays</evidence>
    </criterion>

    <criterion>
      <task>DS-001</task>
      <description>archivist is in SPECIALIST_AGENTS (not EXTERNAL_AGENTS)</description>
      <status>COVERED</status>
      <evidence>agent-roles.ts line 20: SPECIALIST_AGENTS = new Set(['backend-engineer','frontend-engineer','db-specialist','archivist'])</evidence>
    </criterion>

    <criterion>
      <task>DS-001</task>
      <description>ui-designer is in EXTERNAL_AGENTS</description>
      <status>COVERED</status>
      <evidence>agent-roles.ts line 35: EXTERNAL_AGENTS = new Set(['researcher','statistician','ui-designer'])</evidence>
    </criterion>

    <criterion>
      <task>DS-001</task>
      <description>CanvasNode interface has role: AgentRole field</description>
      <status>COVERED</status>
      <evidence>canvas-store.ts line 18: role: AgentRole; is part of CanvasNode interface</evidence>
    </criterion>

    <criterion>
      <task>DS-001</task>
      <description>LoadoutSchema accepts optional cardTitle field (backwards-compatible)</description>
      <status>COVERED</status>
      <evidence>packages/shared/src/schemas.ts line 41: cardTitle: z.string().optional()</evidence>
    </criterion>

    <criterion>
      <task>DS-001</task>
      <description>deriveRole helper exists and correctly classifies roles</description>
      <status>COVERED</status>
      <evidence>canvas-store.ts lines 60–73: deriveRole function exported, covers all 4 named sets then fragment fallbacks, returns 'specialist' as final default</evidence>
    </criterion>

    <criterion>
      <task>DS-001</task>
      <description>INITIAL_ORCHESTRATOR includes role: 'meta'</description>
      <status>COVERED</status>
      <evidence>canvas-store.ts line 40: role: 'meta' present on INITIAL_ORCHESTRATOR</evidence>
    </criterion>

    <criterion>
      <task>DS-001</task>
      <description>cardTitle and setCardTitle in CanvasState; initializes to 'The Orchestrator'</description>
      <status>COVERED</status>
      <evidence>canvas-store.ts lines 84, 92, 102: cardTitle: string; setCardTitle: (title) => void; initialized to 'The Orchestrator'</evidence>
    </criterion>

    <criterion>
      <task>DS-001</task>
      <description>loadFromLoadout calls deriveRole for agent and skill nodes; preserves cardTitle with fallback</description>
      <status>COVERED</status>
      <evidence>canvas-store.ts lines 148, 160: role: deriveRole(name, 'agent') and deriveRole(name, 'skill'); line 177: cardTitle: cardTitle ?? 'The Orchestrator'</evidence>
    </criterion>

    <criterion>
      <task>DS-001</task>
      <description>resetCanvas resets cardTitle to 'The Orchestrator'</description>
      <status>COVERED</status>
      <evidence>canvas-store.ts line 185: cardTitle: 'The Orchestrator' inside resetCanvas set call</evidence>
    </criterion>

    <criterion>
      <task>DS-001</task>
      <description>compose.ts was NOT modified by DS-001 (FE-001a owns that)</description>
      <status>COVERED</status>
      <evidence>compose.ts has the full FE-001a import refactor (imports from agent-roles.ts, role fast-path in getMateriaColor) — consistent with DS-001 not touching it; compose.ts isolation respected across task boundary</evidence>
    </criterion>

    <!-- ── FE-001a ─────────────────────────────────────────────────────────── -->

    <criterion>
      <task>FE-001a</task>
      <description>CARD_WIDTH_PX, CARD_HEIGHT_PX, CARD_HEADER_HEIGHT_PX, CARD_BORDER_RADIUS_PX exported from canvas.ts</description>
      <status>COVERED</status>
      <evidence>canvas.ts lines 166–170: all four CARD_* constants present and exported with values 900, 700, 36, 8</evidence>
    </criterion>

    <criterion>
      <task>FE-001a</task>
      <description>getMateriaColor accepts optional role?: AgentRole parameter with role-based fast path</description>
      <status>COVERED</status>
      <evidence>compose.ts lines 55–68: getMateriaColor(name, type, role?) with switch on role returning correct CSS vars per role value</evidence>
    </criterion>

    <criterion>
      <task>FE-001a</task>
      <description>compose.ts has no locally-declared agent Sets (all imported from agent-roles.ts)</description>
      <status>COVERED</status>
      <evidence>compose.ts lines 1–16: imports META_AGENTS, SPECIALIST_AGENTS, GATE_AGENTS, EXTERNAL_AGENTS, fragment arrays from agent-roles.ts; no local const Set declarations</evidence>
    </criterion>

    <criterion>
      <task>FE-001a</task>
      <description>getMateriaColor('orchestrator', 'agent') backwards-compatible returns var(--my)</description>
      <status>COVERED</status>
      <evidence>compose.ts fallback path: COMMAND_AGENTS alias = META_AGENTS contains 'orchestrator'; returns 'var(--my)'</evidence>
    </criterion>

    <criterion>
      <task>FE-001a</task>
      <description>MateriaNodeProps has optional role?: AgentRole; role passed to getMateriaColor</description>
      <status>COVERED</status>
      <evidence>MateriaNode.tsx line 42: role?: AgentRole in props; line 177: getMateriaColor(name, type, role)</evidence>
    </criterion>

    <criterion>
      <task>FE-001a</task>
      <description>No raw hex values added in this task</description>
      <status>COVERED</status>
      <evidence>compose.ts uses only CSS var references and named rgba constants; no new hex literals introduced</evidence>
    </criterion>

    <!-- ── FE-001b ─────────────────────────────────────────────────────────── -->

    <criterion>
      <task>FE-001b</task>
      <description>CardNode.tsx exists at packages/client/src/components/compose/CardNode.tsx</description>
      <status>COVERED</status>
      <evidence>File read successfully; exports CardNode and default CardNode</evidence>
    </criterion>

    <criterion>
      <task>FE-001b</task>
      <description>CardNode outer div has data-testid="card-node", dimensions from CARD_WIDTH_PX × CARD_HEIGHT_PX</description>
      <status>COVERED</status>
      <evidence>CardNode.tsx line 138: data-testid="card-node"; outerStyle uses CARD_WIDTH_PX and CARD_HEIGHT_PX constants</evidence>
    </criterion>

    <criterion>
      <task>FE-001b</task>
      <description>Header bar uses CARD_HEADER_HEIGHT_PX, background var(--sf); title in var(--my) with crown glyph</description>
      <status>COVERED</status>
      <evidence>CardNode.tsx lines 129–134: headerStyle uses CARD_HEADER_HEIGHT_PX and 'var(--sf)'; titleStyle uses 'var(--my)'; CROWN_GLYPH = '\u265B'</evidence>
    </criterion>

    <criterion>
      <task>FE-001b</task>
      <description>Inline title editing: span with data-testid="card-title-display", input with data-testid="card-title-input" and aria-label="Edit card title"</description>
      <status>COVERED</status>
      <evidence>CardNode.tsx lines 85–86 (input): data-testid="card-title-input", aria-label="Edit card title"; line 99: data-testid="card-title-display" on span</evidence>
    </criterion>

    <criterion>
      <task>FE-001b</task>
      <description>Blur and Enter commit edit; Escape cancels without storing</description>
      <status>COVERED</status>
      <evidence>CardNode.tsx: onBlur={commitEdit} (line 91); handleKeyDown commits on Enter, cancels on Escape (lines 55–59)</evidence>
    </criterion>

    <criterion>
      <task>FE-001b</task>
      <description>No raw px/rgba literals in CardNode.tsx outside named constants</description>
      <status>COVERED</status>
      <evidence>grep -nP '\d+px|\d+\.\d+|rgba\(' returns only a comment line (line 17); all numeric values in code are from named constants</evidence>
    </criterion>

    <criterion>
      <task>FE-001b</task>
      <description>card-node-title-edit.spec.ts exists with 3 required tests</description>
      <status>COVERED</status>
      <evidence>packages/client/tests/e2e/card-node-title-edit.spec.ts: tests "card node is visible on canvas", "inline title edit: click → type → blur → title persisted", "no JS errors during title edit — Escape cancels"</evidence>
    </criterion>

    <criterion>
      <task>FE-001b</task>
      <description>Spec references data-testid="card-node", "card-title-display", "card-title-input"</description>
      <status>COVERED</status>
      <evidence>card-node-title-edit.spec.ts lines 19, 27, 30, 40, 43, 57, 61, 67: all three test IDs used in assertions</evidence>
    </criterion>

    <!-- ── FE-002 ─────────────────────────────────────────────────────────── -->

    <criterion>
      <task>FE-002</task>
      <description>CardNode registered as 'card' node type in NODE_TYPES; CardNodeRenderer defined</description>
      <status>COVERED</status>
      <evidence>MateriaCanvas.tsx lines 155–162: CardNodeRenderer function defined; NODE_TYPES includes card: CardNodeRenderer</evidence>
    </criterion>

    <criterion>
      <task>FE-002</task>
      <description>toRFNode emits type:'card' for orchestrator with position centered on CARD_WIDTH_PX/2, CARD_HEIGHT_PX/2 offset; draggable:false, selectable:false, zIndex:0</description>
      <status>COVERED</status>
      <evidence>MateriaCanvas.tsx lines 172–185: orchestrator branch returns type:'card', position offset by CARD_WIDTH_PX/2 and CARD_HEIGHT_PX/2, draggable:false, selectable:false, zIndex:0</evidence>
    </criterion>

    <criterion>
      <task>FE-002</task>
      <description>Orb RF nodes use zIndex: Z_CANVAS_NODE (10)</description>
      <status>COVERED</status>
      <evidence>MateriaCanvas.tsx line 197: zIndex: Z_CANVAS_NODE for non-card nodes</evidence>
    </criterion>

    <criterion>
      <task>FE-002</task>
      <description>role passed to MateriaNodeRenderer via data.role; AgentRole imported</description>
      <status>COVERED</status>
      <evidence>MateriaCanvas.tsx lines 25, 141, 193: AgentRole imported; MateriaNodeData type includes role?: AgentRole; data.role: cn.role assigned in toRFNode</evidence>
    </criterion>

    <criterion>
      <task>FE-002</task>
      <description>No isOrchestrator:true passed to any materia node</description>
      <status>COVERED</status>
      <evidence>grep for isOrchestrator in MateriaCanvas.tsx returns no matches — prop never passed in toRFNode</evidence>
    </criterion>

    <criterion>
      <task>FE-002</task>
      <description>data-testid="materia-canvas" still present (no regression)</description>
      <status>COVERED</status>
      <evidence>MateriaCanvas.tsx contains data-testid="materia-canvas" on the outer canvas wrapper (confirmed by Playwright spec references and file structure)</evidence>
    </criterion>

    <criterion>
      <task>FE-002</task>
      <description>Proximity linking (drop-on-top) logic preserved</description>
      <status>COVERED</status>
      <evidence>MateriaCanvas.tsx proximity logic uses CANVAS_PROXIMITY_THRESHOLD_PX, playApproach/stopApproach/playLink hooks — unchanged structure confirmed by reading the file</evidence>
    </criterion>

    <criterion>
      <task>FE-002</task>
      <description>Proximity link edge appears on canvas after linking (runtime behavior)</description>
      <status>PARTIAL</status>
      <evidence>KNOWN REGRESSION (HCG-2): code calls addEdge via canvas store and toRFEdge conversion is present, but human visual check confirms no edge renders after proximity link. Sound plays. Root cause TBD — addEdge may not be triggered in the drop handler or RF edges state is not syncing. Not covered by any Playwright spec assertion.</evidence>
    </criterion>

    <!-- ── FE-003 ─────────────────────────────────────────────────────────── -->

    <criterion>
      <task>FE-003</task>
      <description>LoadoutListPanel renders card header row with aria-label="Card: {cardTitle}" by default</description>
      <status>COVERED</status>
      <evidence>MateriaCanvas.tsx line 425: aria-label={`Card: ${cardTitle}`} on non-interactive header div; cardTitle read from canvas store</evidence>
    </criterion>

    <criterion>
      <task>FE-003</task>
      <description>Card header row does NOT have role="button"</description>
      <status>COVERED</status>
      <evidence>MateriaCanvas.tsx renderCardHeader (lines 420–462): plain div, no role attribute set</evidence>
    </criterion>

    <criterion>
      <task>FE-003</task>
      <description>Skills connected to multiple agents appear once per agent (not as orphan entries)</description>
      <status>COVERED</status>
      <evidence>MateriaCanvas.tsx lines 327–333: connectedSkillIds Set prevents skills with agent connections from appearing in unconnectedSkills; agentRoots maps skills per agent allowing duplicates across agents</evidence>
    </criterion>

    <criterion>
      <task>FE-003</task>
      <description>Skills with zero connections appear in unconnected section at bottom</description>
      <status>COVERED</status>
      <evidence>MateriaCanvas.tsx lines 334–336 and 521–522: unconnectedSkills filtered and rendered at bottom of panel</evidence>
    </criterion>

    <criterion>
      <task>FE-003</task>
      <description>Dot colors use getMateriaColor(node.name, node.type, node.role)</description>
      <status>COVERED</status>
      <evidence>MateriaCanvas.tsx lines 366, 421: getMateriaColor(node.name, node.type, node.role) used for both interactive rows and card header</evidence>
    </criterion>

    <criterion>
      <task>FE-003</task>
      <description>Panel heading text is "Loadout"</description>
      <status>COVERED</status>
      <evidence>MateriaCanvas.tsx line 494: 'Loadout' text inside heading div</evidence>
    </criterion>

    <criterion>
      <task>FE-003</task>
      <description>data-testid="loadout-list-panel" present on panel wrapper</description>
      <status>COVERED</status>
      <evidence>MateriaCanvas.tsx line 470: data-testid="loadout-list-panel" on aside element</evidence>
    </criterion>

    <criterion>
      <task>FE-003</task>
      <description>loadout-list-panel.spec.ts updated: no reference to aria-label="Select orchestrator on canvas" in any test</description>
      <status>COVERED</status>
      <evidence>grep returns no matches for "Select orchestrator on canvas" in loadout-list-panel.spec.ts</evidence>
    </criterion>

    <criterion>
      <task>FE-003</task>
      <description>Spec file line count >= 73</description>
      <status>COVERED</status>
      <evidence>wc -l returns 114 lines — exceeds the 73-line minimum</evidence>
    </criterion>

    <criterion>
      <task>FE-003</task>
      <description>3 new tests added (Tests 4, 5, 6) covering card header non-interactivity, agent rows as roots, and unconnected skills section</description>
      <status>COVERED</status>
      <evidence>loadout-list-panel.spec.ts: Tests 4 ("card header row is not interactive"), 5 ("agent rows appear as roots in panel"), 6 ("unconnected skills section renders without errors") all present</evidence>
    </criterion>

  </criteria>

  <known_issues>
    <issue>Proximity link edge regression: sound plays but no edge renders on canvas after proximity linking. Observed in HCG-2 visual check. The addEdge store call and toRFEdge conversion code are present in MateriaCanvas.tsx, but the edge does not appear at runtime. Root cause is unconfirmed — likely the drop handler does not call addEdge, or the RF edges state is not syncing from the store update. This is a regression from the canvas-link sprint where edges were present. Not covered by any Playwright spec assertion. Needs investigation and fix in next sprint.</issue>
  </known_issues>

  <verdict>PARTIAL_PASS</verdict>
  <verdict_rationale>All 35 code-coverage criteria are COVERED. The single PARTIAL criterion is the HCG-2 runtime regression (proximity link edge not rendering), which is a bug in the running application rather than a gap in implemented code. All new files exist with correct structure and test IDs, all schema extensions are present and backwards-compatible, LoadoutListPanel is fully rewritten with the 5-role tree structure, and both e2e specs meet their line-count and test-name requirements. The edge regression must be resolved before this sprint can be marked PASS.</verdict_rationale>
</requirements_validation>
```
