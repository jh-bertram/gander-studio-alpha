```xml
<plan_critique>
  <plan_id>gander-studio-p2-agent-cards</plan_id>
  <status>BLOCK</status>

  <challenges>

    <challenge>
      <type>SCOPE_DRIFT</type>
      <severity>BLOCKER</severity>
      <task_ref>SPRINT</task_ref>
      <description>The human explicitly requested "Add a plain-text appearance config file." This is absent from all four tasks (DS-001, FE-001, FE-002, FE-003). No task touches an appearance config file, creates one, or references one. This is not a decomposition interpretation — it is a verbatim deliverable in the original request that the PM silently dropped.</description>
      <required_revision>Add a task (DS-002 or FE-004, whichever wave is appropriate) scoped to: create a plain-text appearance config file (format TBD — likely TOML or JSON), define what values it controls (card dimensions? color overrides?), and wire it into the relevant component. If the PM is unsure what "appearance config" means, that is an HCG before decomposition, not a silent omission.</required_revision>
    </challenge>

    <challenge>
      <type>ASSUMPTION</type>
      <severity>BLOCKER</severity>
      <task_ref>FE-001</task_ref>
      <description>The plan says "Update getMateriaColor in compose.ts to accept optional role param: meta→var(--my), skill→var(--mb), specialist→var(--mg)." The current getMateriaColor (compose.ts lines 48–67) has a 5-category agent color scheme: command→--my, impl→--mg, gate→--mr, intel→--mb, meta/dispatcher→--mp. The plan's three-role override collapses this to three: meta→--my, skill→--mb, specialist→--mg. This silently removes --mr (red, used for auditor/critic/code-auditor) and --mp (purple, used for dispatcher/ui-designer/system-health-monitor) from every canvas orb. Gate agents go from red to green; dispatcher goes from purple to green. This is a logic regression, not a redesign. Additionally, the human's color-coding spec ("green=specialists, blue=skills, yellow=meta-agents") does not mention red or purple at all, which means either (a) the human expects the existing per-agent colors to be replaced by the 3-role system — in which case the PM must confirm this intent explicitly — or (b) the role system applies only to agents not in a named set, and named agents keep their existing colors. The plan assumes (a) without stating it. The role-based color contract cannot be shipped until this ambiguity is resolved with the human.</description>
      <required_revision>PM must raise an HCG to the human: "The existing canvas has 5 agent color groups (command yellow, impl green, gate red, intel blue, meta purple). Your color-coding spec defines 3 (specialists green, skills blue, meta-agents yellow). Should the 3-role system replace the existing per-agent colors entirely, or should named agents keep their current colors and the role system apply only to unrecognized agents? Confirm before FE-001 is dispatched." Then rewrite the getMateriaColor task spec to match the human's confirmed intent.</required_revision>
    </challenge>

    <challenge>
      <type>AUDIT_RISK</type>
      <severity>BLOCKER</severity>
      <task_ref>FE-001</task_ref>
      <description>FE-001 creates CardNode.tsx with an "inline-editable title" — this is a new interactive flow (user clicks header, edits title, blurs to commit). No Playwright Tier 2 spec coverage is specified for this interaction. Per post-mortem gander-studio-p2-canvas-link.md §2 (C4): "No Playwright Tier 2 in FE success criteria → named spec file required in every FE task." Per agent-changelog 2026-03-17-1: "AUDIT_RISK challenge expanded to flag new interactive flows on existing surfaces missing Playwright coverage." The inline-edit title is a new interactive flow. The auditor spec (auditor.md v1.0.3) will FAIL this task at the QA gate. FE-001 has no e2e_spec field at all in its task description — this is a guaranteed audit fail.</description>
      <required_revision>Add to FE-001 success criteria: a named Playwright Tier 2 spec (e.g., packages/client/tests/e2e/card-node-title-edit.spec.ts) covering: (1) card node is visible on canvas, (2) inline title edit flow — click header, type new title, blur, verify title persisted to canvas store, (3) no JS errors during edit. Add e2e_spec reference to FE-001 task packet.</required_revision>
    </challenge>

    <challenge>
      <type>OVERSCOPED</type>
      <severity>BLOCKER</severity>
      <task_ref>FE-001</task_ref>
      <description>FE-001 touches four distinct files with multiple independent success criteria: (1) create packages/client/src/components/compose/CardNode.tsx — new component with layout, inline editing, store wiring; (2) add 4 constants to canvas.ts; (3) modify getMateriaColor signature in compose.ts; (4) add optional role prop to MateriaNode.tsx. Estimated new lines: CardNode.tsx ~50–70 lines, getMateriaColor update ~10 lines, MateriaNode prop ~8 lines, canvas.ts additions ~4 lines = 72–92 lines total. This exceeds the 50-line commit limit. The four concerns are independent — CardNode creation does not require getMateriaColor changes in the same turn; role prop on MateriaNode is independent of CardNode layout. Standards.md: "No commits exceeding 50 lines of new code without a verification gate first."</description>
      <required_revision>Split FE-001 into two tasks: FE-001a: add the 4 canvas constants + getMateriaColor role param update + MateriaNode optional role prop (all small, cross-file constants/type changes, ~22 lines). FE-001b (depends FE-001a): create CardNode.tsx with inline-editable title, reads/writes cardTitle from canvas store (~50–60 lines, fits within gate). Add the Playwright Tier 2 spec to FE-001b's success criteria (see AUDIT_RISK challenge above).</required_revision>
    </challenge>

    <challenge>
      <type>ASSUMPTION</type>
      <severity>WARNING</severity>
      <task_ref>DS-001</task_ref>
      <description>DS-001 adds deriveRole(name, type) to canvas-store.ts, classifying agents as 'meta' | 'specialist' by name matching ("command-agent names→'meta'"). The exact same name-classification logic already exists in getMateriaColor in compose.ts (COMMAND_AGENTS, IMPL_AGENTS, GATE_AGENTS, INTEL_AGENTS, META_AGENTS sets at lines 42–46). Two independent classification tables for the same domain is a DRY violation — the agent name sets will diverge over time. Standards.md: "No duplicated logic. Extract shared logic to utils before the second use."</description>
      <required_revision>PM must specify that deriveRole either (a) imports and reuses the agent name sets from compose.ts, or (b) the classification sets are extracted to a shared constants file (e.g., packages/client/src/constants/agent-roles.ts) before either deriveRole or getMateriaColor reference them. DS-001 success criteria must explicitly state which approach and name the shared source.</required_revision>
    </challenge>

    <challenge>
      <type>AUDIT_RISK</type>
      <severity>WARNING</severity>
      <task_ref>FE-003</task_ref>
      <description>FE-003 says "Update loadout-list-panel.spec.ts to remove orchestrator aria-label references." Both existing Playwright tests (lines 21, 39 of loadout-list-panel.spec.ts) depend on aria-label="Select orchestrator on canvas". Removing these without replacement drops the only coverage for list panel row interaction. The plan says FE-003 adds a "card header row (non-interactive)" — but there is no spec coverage for the new tree structure (agent roots, connected skills as children, orphan skills section). The plan nets to fewer test assertions after FE-003 than before it. Auditor will note reduced coverage. Per post-mortem p2-canvas-link §2 (C4): Tier 2 spec coverage required for every FE task.</description>
      <required_revision>FE-003 success criteria must include: (1) replace deleted orchestrator row tests with equivalent tests for the new card header row (verify non-interactive / no aria-label="Select..." on the card row), (2) add a test asserting that agent rows appear as roots and at least one connected skill appears as a child when a connection exists, (3) add a test for the orphan skills section. Spec line count after FE-003 must be >= spec line count before it.</required_revision>
    </challenge>

    <challenge>
      <type>ASSUMPTION</type>
      <severity>WARNING</severity>
      <task_ref>FE-002</task_ref>
      <description>FE-002 positions the card at (cn.position.x - CARD_WIDTH_PX/2, cn.position.y - CARD_HEIGHT_PX/2). The orchestrator's stored position is INITIAL_ORCHESTRATOR = {x:0, y:0} (canvas-store.ts line 32). With CARD_WIDTH_PX=900 and CARD_HEIGHT_PX=700, the card RF position computes to (-450, -350). React Flow's default viewport is centered at (0,0) in flow coordinates, but the node's position in RF is its top-left corner. So the card's top-left will be at RF coordinate (-450,-350) and its center at (0,0). Other orbs (AGENT_RING_RADIUS=220, SKILL_RING_RADIUS=380) are positioned relative to (0,0) in the store, so they will land inside the card boundaries. This math is correct IF the RF viewport is centered on (0,0) at load time, which it is by default. This is a sound assumption, but the success criteria should include a visual check that orbs appear inside the card on initial render.</description>
      <required_revision>Add to FE-002 success criteria: "On initial load, all non-card orbs (at ring radii 220px, 380px) are visually contained within the card boundaries (card spans ±450px, ±350px from center). Verify via Playwright screenshot assertion or human E2E check at Step 4.5."</required_revision>
    </challenge>

  </challenges>

  <audit_risk_forecast>
    1. CardNode inline title edit has no Playwright Tier 2 spec (flagged as BLOCKER above). Even if the PM addresses this, FE-001 is the highest audit-fail risk in the sprint because it introduces a new interactive surface with no spec. The auditor runs Tier 2 validation per task; a missing spec file = QA FAIL regardless of code quality.

    2. CSS template string numerics in CardNode.tsx: the P2-canvas-link post-mortem §3 documents a repeat pattern where FE agents add CSS template strings and use raw numeric literals instead of interpolating named constants from canvas.ts. CARD_WIDTH_PX, CARD_HEIGHT_PX, and CARD_HEADER_HEIGHT_PX are going into canvas.ts (FE-001), but any inline pixel values in CardNode.tsx's style objects or CSS strings that are NOT those four named constants will be caught by the auditor's SA grep. FE agent must run the self-grep (`grep -nP '\d+px|\d+\.\d+|rgba\('`) before submitting — this is now in frontend.md v1.1.4 per agent-changelog 2026-03-30. Flag this in the FE-001/FE-001b brief.
  </audit_risk_forecast>

  <post_mortem_patterns_checked>
    - gander-studio-p2-canvas-link.md (most recent, 2026-03-30): Section 5 recurring failure pattern = PM overscoping (FE-001 caught here). Section 6 protocol gap = CSS numeric literals in template strings (forecast above). C4 from planning block = missing Playwright Tier 2 on FE tasks (FE-001 and FE-003 both flagged).
    - gander-studio-p2-p3.md (second most recent, 2026-03-16): Section 5 recurring failure = PM not reading source files before writing investigation steps. Section 6 protocol gaps = Bash permission in background agents (noted for lint-critical tasks); auditor not calling live API (BE-only relevance, no BE tasks in this sprint).
  </post_mortem_patterns_checked>

</plan_critique>
```
