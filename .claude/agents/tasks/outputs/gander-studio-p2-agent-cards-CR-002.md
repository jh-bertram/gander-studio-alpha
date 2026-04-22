```xml
<plan_critique>
  <plan_id>gander-studio-p2-agent-cards</plan_id>
  <status>BLOCK</status>

  <!-- ═══════════════════════════════════════════════════════════════════════ -->
  <!-- CR-001 RESOLUTION STATUS                                               -->
  <!-- ═══════════════════════════════════════════════════════════════════════ -->

  <resolution_status id="CR-001-BLOCKER-1-SCOPE_DRIFT-appearance-config">
    RESOLVED. PM-002 documents HCG-1 explicitly: "Human confirmed: DEFERRED." DEFERRED-001 task
    packet includes full scope definition of what the feature will do when scheduled, tracked in
    docs/deferred-work.md. This is not a silent omission — the deferral is documented and attributed
    to an explicit human decision. Blocker 1 is closed.
  </resolution_status>

  <resolution_status id="CR-001-BLOCKER-2-ASSUMPTION-color-collapse">
    PARTIALLY RESOLVED — the 5-role system is correctly defined and the HCG-2 table is accurate.
    However, DS-001's aliasing strategy for the compose.ts bridge introduces NEW color regressions
    that were not present in CR-001. See new BLOCKER below (DS-001 aliasing).
    The conceptual resolution is sound; the implementation spec is broken.
  </resolution_status>

  <resolution_status id="CR-001-BLOCKER-3-AUDIT_RISK-playwright-spec">
    RESOLVED. FE-001b includes card-node-title-edit.spec.ts with all 3 required test names:
    (1) 'card node is visible on canvas', (2) 'inline title edit: click → type → blur → title
    persisted', (3) 'no JS errors during title edit'. data-testid values are named. Spec is
    required in success criteria and must_contain. Blocker 3 is closed.
  </resolution_status>

  <resolution_status id="CR-001-BLOCKER-4-OVERSCOPED-FE-001">
    RESOLVED. FE-001 is split into FE-001a (~22 lines: 4 constants + getMateriaColor role param +
    MateriaNode role prop) and FE-001b (~55 lines: CardNode.tsx + Playwright spec). FE-001a is
    clearly within the 50-line gate. FE-001b is slightly over at ~55 lines but includes a mandatory
    pre-submission lint step as a verification gate — see WARNING below on whether this satisfies
    standards.md. The split itself is correct. Blocker 4 is closed with a residual WARNING.
  </resolution_status>

  <resolution_status id="CR-001-WARNING-1-DRY-deriveRole">
    RESOLVED. agent-roles.ts is established as single source of truth. Both canvas-store.ts
    (deriveRole) and compose.ts (getMateriaColor) import from it. The import aliases in DS-001
    ensure the function body references still resolve. DRY violation is eliminated. Warning 1 is
    closed (but see new BLOCKER below about the aliasing being semantically incorrect).
  </resolution_status>

  <resolution_status id="CR-001-WARNING-2-FE-003-coverage">
    RESOLVED. FE-003 success criteria require: spec line count >= 73, no reference to
    aria-label="Select orchestrator on canvas", 3 new tests added (Test 4: card header not
    interactive, Test 5: agent roots + skill children, Test 6: unconnected skills section). The
    3 updated existing tests are preserved (not deleted). Warning 2 is closed.
  </resolution_status>

  <resolution_status id="CR-001-WARNING-3-FE-002-position-math">
    RESOLVED. FE-002 success criteria now include: "On initial load, all non-card orbs (at ring
    radii 220px agents, 380px skills) are visually contained within the card boundaries (card spans
    ±450px in X, ±350px in Y from center). Verify via Playwright screenshot assertion or human E2E
    check at Step 4.5." Warning 3 is closed.
  </resolution_status>

  <!-- ═══════════════════════════════════════════════════════════════════════ -->
  <!-- NEW CHALLENGES                                                          -->
  <!-- ═══════════════════════════════════════════════════════════════════════ -->

  <challenges>

    <challenge>
      <type>ASSUMPTION</type>
      <severity>BLOCKER</severity>
      <task_ref>gander-studio-p2-agent-cards-DS-001</task_ref>
      <description>
        The DS-001 compose.ts aliasing strategy produces incorrect colors for at least three agents
        after DS-001 runs, breaking getMateriaColor before FE-001a can fix it. The plan claims the
        bridge "preserves existing color output" — this is false.

        Trace through the aliasing (task packet lines 161–197):

        Import: `META_AGENTS as COMMAND_AGENTS` — agent-roles.ts META_AGENTS = {orchestrator,
        project-manager, dispatcher}. Old compose.ts COMMAND_AGENTS = {orchestrator,
        project-manager}. After DS-001, COMMAND_AGENTS includes dispatcher. The getMateriaColor
        function checks COMMAND_AGENTS first (line 53 of compose.ts). Dispatcher now hits
        COMMAND_AGENTS → returns var(--my) (yellow). Old behavior: dispatcher matched META_AGENTS
        → var(--mp) (purple). **Dispatcher color broken: purple → yellow after DS-001.**

        Import: `GATE_AGENTS` directly — agent-roles.ts GATE_AGENTS = {auditor, critic,
        code-auditor, system-health-monitor}. Old compose.ts GATE_AGENTS = {auditor, critic,
        code-auditor}. After DS-001, system-health-monitor hits GATE_AGENTS → returns var(--mr)
        (red). Old behavior: system-health-monitor matched META_AGENTS → var(--mp) (purple).
        **system-health-monitor color broken: purple → red after DS-001.**

        Import: `EXTERNAL_AGENTS as INTEL_AGENTS` — agent-roles.ts EXTERNAL_AGENTS = {researcher,
        statistician, archivist, ui-designer}. Old INTEL_AGENTS → var(--mb) (blue). After DS-001,
        ui-designer now matches INTEL_AGENTS (checked at line 56 of compose.ts, BEFORE the
        META_AGENTS_LEGACY check). ui-designer → var(--mb) (blue). Old behavior: ui-designer
        matched META_AGENTS → var(--mp) (purple). **ui-designer color broken: purple → blue
        after DS-001.**

        The META_AGENTS_LEGACY bridge (the local set = {dispatcher, ui-designer, system-health-
        monitor} replacing the function body reference from META_AGENTS to META_AGENTS_LEGACY) is
        supposed to preserve purple for these three agents. But dispatcher and ui-designer are
        intercepted by earlier set checks (COMMAND_AGENTS and INTEL_AGENTS respectively) before
        META_AGENTS_LEGACY is ever reached. META_AGENTS_LEGACY only catches system-health-monitor
        if GATE_AGENTS didn't catch it first — but GATE_AGENTS now includes system-health-monitor,
        so it too is intercepted.

        The bridge is structurally unable to preserve the existing colors because the new imported
        sets have expanded membership that overlaps with agents previously in META_AGENTS.

        Additionally, the task packet contains a direct contradiction:
        - Line 150: "The getMateriaColor function itself is NOT changed by DS-001"
        - Line 195: "Then the getMateriaColor function references META_AGENTS_LEGACY instead of
          META_AGENTS"
        The second statement requires changing the function body (replacing one identifier with
        another). DS-001 cannot both "not change the function" and "change the function reference."
        A DS agent reading this spec will be uncertain which instruction to follow.
      </description>
      <required_revision>
        DS-001 must use a different bridging strategy. The correct approach is the simplest:
        do NOT change the membership of COMMAND_AGENTS, GATE_AGENTS, or INTEL_AGENTS imports to
        include agents that were not in their compose.ts predecessors. Instead:

        Option A (recommended): Remove only INTEL_AGENTS and COMMAND_AGENTS from compose.ts local
        declarations (these map cleanly to the new sets). Keep GATE_AGENTS and META_AGENTS as
        local constants in compose.ts until FE-001a rewrites getMateriaColor. Import only
        SPECIALIST_AGENTS as IMPL_AGENTS. This is a smaller change with no color regressions.

        Option B: Import all sets with exact-member aliases that preserve the old function body
        behavior. This requires exporting additional sets from agent-roles.ts:
        - COMMAND_AGENTS_LEGACY = new Set(['orchestrator', 'project-manager'])  [not dispatcher]
        - GATE_AGENTS_LEGACY = new Set(['auditor', 'critic', 'code-auditor'])  [not system-health-monitor]
        - INTEL_AGENTS_LEGACY = new Set(['researcher', 'statistician', 'archivist'])  [not ui-designer]

        Either way, PM must resolve the contradiction in the task text (lines 150 vs 195) and
        ensure success criteria include: "getMateriaColor('dispatcher', 'agent') still returns
        var(--mp) after DS-001 changes" and "getMateriaColor('ui-designer', 'agent') still returns
        var(--mp) after DS-001 changes."
      </required_revision>
    </challenge>

    <challenge>
      <type>ASSUMPTION</type>
      <severity>WARNING</severity>
      <task_ref>gander-studio-p2-agent-cards-DS-001</task_ref>
      <description>
        agent-roles.ts places archivist in EXTERNAL_AGENTS (purple, --mp). In the existing
        compose.ts, archivist is in INTEL_AGENTS (blue, --mb). The human's HCG-2 role table
        describes external as "researcher, statistician, ui-designer — agents that reach outside
        codebase." Archivist is not listed. Archivist logs task completions to internal files —
        it does not reach outside the codebase. Silently moving archivist from blue to purple is
        an interpretation the PM made without the human confirming it.

        This is relevant even before DS-001 runs, because the deriveRole function in canvas-store.ts
        will assign archivist → 'external', and FE-001a's getMateriaColor role fast-path will
        return --mp for external. The human may not expect archivist to display purple.
      </description>
      <required_revision>
        PM must either: (a) raise an HCG to confirm archivist belongs in external (purple), or
        (b) move archivist to the specialist set (green), or (c) document an explicit rationale
        for the purple classification and add it to the HCG-2 table. Do not silently change
        archivist's display color from blue to purple without human confirmation.
      </required_revision>
    </challenge>

    <challenge>
      <type>DEPENDENCY</type>
      <severity>WARNING</severity>
      <task_ref>gander-studio-p2-agent-cards-FE-003</task_ref>
      <description>
        FE-003's dependency list includes FE-001b (wave 3), adding a full wave of latency. FE-003
        rewrites LoadoutListPanel — it does not render CardNode.tsx, does not import it, and does
        not depend on any artifact created by FE-001b. FE-003's actual dependencies are:
        - DS-001: CanvasNode.role, cardTitle/setCardTitle in store
        - FE-001a: getMateriaColor with role parameter
        - FE-002: MateriaCanvas.tsx must exist with the card node registered (for the list panel
          to correctly find the orchestrator by id === 'orchestrator')

        FE-001b is not a logical dependency of FE-003. Listing it as one forces FE-003 to wait
        an extra wave for CardNode.tsx to be created, when it could run in the same wave as
        FE-002 (or immediately after FE-002). This delays final sprint close by one wave.
      </description>
      <required_revision>
        Remove FE-001b from FE-003's dependency list. FE-003 depends on DS-001, FE-001a, and
        FE-002 only. Update the dependency order line accordingly:
        DS-001 → FE-001a → FE-001b → FE-002 → FE-003 becomes
        DS-001 → FE-001a → [FE-001b, FE-002 in parallel] → FE-003.
        If parallelism is not desired, FE-002 alone is the correct gate for FE-003.
      </required_revision>
    </challenge>

    <challenge>
      <type>AUDIT_RISK</type>
      <severity>WARNING</severity>
      <task_ref>gander-studio-p2-agent-cards-FE-001b</task_ref>
      <description>
        FE-001b produces ~95 total lines in one commit (CardNode.tsx ~55 + spec ~40). Standards
        require no commit exceeding 50 lines of new code without a prior verification gate pass.
        The task packet describes the pre-submission self-grep as a verification gate, but the
        self-grep only checks for raw numeric literals — it is a style audit, not a verification
        gate. A verification gate in the context of standards.md means tsc + lint (which the task
        does require via npm run lint in success criteria).

        The task packet states: "Estimated: ~55 lines in CardNode.tsx + ~40 lines in spec. Both
        fit within gate when treated as two distinct files in one commit." This framing is
        incorrect — the 50-line gate is per-commit, not per-file. Two files in one commit still
        count together.

        However, the task does explicitly require npm run lint (tsc --noEmit) before submission,
        which IS a valid verification gate. The question is whether the auditor will count ~95
        total new lines as a gate violation and fail the task despite the lint being present.
        Per standards.md as written in CLAUDE.md: "No commit exceeding 50 lines of new code
        without a verification gate first" — the lint IS "first" relative to the commit. This
        is borderline; the auditor may FAIL or may PASS depending on interpretation.

        To be safe: clarify in the task that the npm run lint step IS the required verification
        gate, and make it explicitly precede the output packet submission.
      </description>
      <required_revision>
        Add to FE-001b success criteria: "npm run lint (tsc --noEmit) constitutes the required
        verification gate for this commit. Run lint before emitting ui_packet; include lint output
        in must_contain." Remove the claim that "both fit within gate when treated as two distinct
        files" — the justification should instead be "lint pass before commit satisfies the
        verification gate requirement per standards."
      </required_revision>
    </challenge>

  </challenges>

  <audit_risk_forecast>
    1. DS-001 color regression (BLOCKER above): if DS-001 is dispatched as written, getMateriaColor
    will return wrong colors for dispatcher, ui-designer, and system-health-monitor between Wave 1
    and Wave 2. FE-001a's role fast-path will then overwrite these during Wave 2 — so the regression
    is transient (only matters during the wave gap). However, if audit runs on DS-001 before FE-001a
    is applied, the auditor's behavioral checks will catch the color changes. Dispatcher returning
    --my instead of --mp is a verifiable regression; the auditor's SA pass will call it out.

    2. FE-002 MateriaCanvas.tsx overscoped risk: FE-002 modifies MateriaCanvas.tsx with 6
    distinct changes (NODE_TYPES update, CardNodeRenderer function, toRFNode orchestrator branch,
    zIndex logic, role in MateriaNodeData, imports). Count carefully — total new/changed lines
    may approach the 50-line gate. The task does not include an explicit line-count estimate.
    PM should add one, and if it exceeds 50, add a lint verification gate note.
  </audit_risk_forecast>

  <post_mortem_patterns_checked>
    - gander-studio-p2-canvas-link.md (2026-03-30, most recent): §5 recurring failure = PM
      overscoping; §6 protocol gaps = CSS numeric literals in template strings, FE agent
      self-grep requirement. Applied: verified FE-001b has the mandatory self-grep step (✓);
      checked FE-002 scope; confirmed Playwright Tier 2 coverage.
    - gander-studio-p2-p3.md (2026-03-16, second most recent): §5 recurring failure = PM writing
      plans without reading referenced source files; §6 protocol gaps = Bash permission in
      background agents. Applied: verified PM-002 documents reading all source files before
      revision; verified the DS-001 aliasing logic against actual compose.ts source (which is
      what caught the color regression blocker).
  </post_mortem_patterns_checked>

</plan_critique>
```
