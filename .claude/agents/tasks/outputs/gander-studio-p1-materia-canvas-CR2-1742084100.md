<plan_critique>
  <plan_id>gander-studio-p1-materia-canvas-rev1</plan_id>
  <status>PASS</status>

  <prior_blockers_verification>
    <blocker id="1" status="RESOLVED">
      @xyflow/react React 19 compat — RA pre-flight task (p1-mc-RA-compat) added as hard gate
      before all canvas tasks. If RA returns incompatibility, escalation path is documented.
      CSS import isolation now an explicit success criterion in p1-mc-FE-canvas-b.
    </blocker>
    <blocker id="2" status="RESOLVED">
      canvas task overscoped — split into canvas-a (~40 lines), canvas-b (~50 lines),
      canvas-c (~60 lines), strictly sequential. Each has bounded, verifiable scope.
    </blocker>
    <blocker id="3" status="RESOLVED">
      Hook type undefined — human confirmed hooks off canvas (Q2). CanvasNode.type is
      'agent' | 'skill' only. selectLoadoutPayload.hooks always []. loadFromLoadout ignores
      hooks param. All confirmed in store task spec.
    </blocker>
    <blocker id="4" status="RESOLVED">
      handleSave/ValidationWarnings underspecified — p1-mc-FE-wire now contains explicit
      data source spec: name from compose-store, agents/skills from canvas-store, hooks from
      compose-store. handleLoad two-call sequence documented. useValidationWarnings feeds
      from canvas-store node counts.
    </blocker>
  </prior_blockers_verification>

  <challenges>

    <challenge>
      <type>ASSUMPTION</type>
      <severity>WARNING</severity>
      <task_ref>p1-mc-FE-canvas-a</task_ref>
      <description>
        p1-mc-FE-canvas-a creates packages/client/src/constants/canvas.ts containing a new
        getMateriaColor(type: 'agent' | 'skill', name: string): string function. The existing
        packages/client/src/constants/compose.ts already exports getMateriaColor(name: string,
        type: 'agent' | 'skill' | 'hook'): string (compose.ts line 48). These are two
        implementations of the same logical operation with different parameter order and
        different type union. ComposePage.tsx imports from compose.ts. MateriaNode.tsx will
        import from canvas.ts (per context_files). The plan creates a DRY violation from the
        start. The auditor's SA gate checks for DRY violations — two getMateriaColor
        implementations with diverging signatures will be flagged.

        Additionally, the parameter order is reversed between the two: compose.ts takes
        (name, type), canvas.ts spec takes (type, name). Any agent who reads one and writes
        code against the other will produce a silent runtime color bug with no type error
        (both params are string).
      </description>
      <required_revision>
        Option A (preferred): In canvas.ts, do NOT re-implement getMateriaColor. Instead
        import and re-export getMateriaColor from compose.ts. Add a wrapper if the type union
        needs narrowing: getMateriaColorCanvas(type: 'agent' | 'skill', name: string) calls
        getMateriaColor(name, type) from compose.ts. This eliminates the DRY violation and
        the parameter-order trap.

        Option B: Remove getMateriaColor from canvas.ts entirely. Have MateriaNode.tsx import
        getMateriaColor directly from constants/compose.ts. The 'hook' type arm is simply
        never called from canvas context.

        The PM must specify one of these options in p1-mc-FE-canvas-a's out_of_scope or
        success criteria. Left open, the implementing agent will write a second implementation.
      </required_revision>
    </challenge>

    <challenge>
      <type>AUDIT_RISK</type>
      <severity>WARNING</severity>
      <task_ref>p1-mc-FE-canvas-c</task_ref>
      <description>
        p1-mc-FE-canvas-c introduces the two primary interactive flows: drag-from-palette
        (addNode) and drop-on-top proximity detection (addEdge). Success criteria items 1-13
        contain no Playwright test requirement. The only Playwright spec in the plan is in
        p1-mc-FE-canvas-b (orchestrator visible + no console errors). The new interactive
        surfaces in canvas-c — drag-to-canvas and drop-on-top linking — are unspecified in
        any test plan. The auditor's QA gate will check for coverage of new UI interactions.

        Post-mortem §5 documents this pattern: "PM wrote plans without reading referenced
        source files before assigning tasks." The same principle applies here in reverse —
        the plan added Playwright for canvas-b (catching the first CR1 WARNING) but did not
        extend that coverage to canvas-c's interactions.
      </description>
      <required_revision>
        Add to p1-mc-FE-canvas-c success criteria (new item 14):
        "Playwright spec at packages/client/src/tests/compose/materia-canvas.spec.ts
        extended with: (a) dragging a palette agent item creates a node on the canvas;
        (b) two nodes positioned within 60px of each other after drag results in an edge
        rendered between them."

        These can be added to the existing spec file from canvas-b — no new file needed.
        The agent should append to the existing spec, not create a new one.
      </required_revision>
    </challenge>

  </challenges>

  <audit_risk_forecast>
    1. getMateriaColor DRY violation: if the FE agent for canvas-a writes a second
    getMateriaColor in canvas.ts (which the task spec currently invites by listing it as a
    deliverable), the SA gate will catch duplicate logic implementing the same color mapping.
    This is the highest-probability single audit finding in the current plan. Resolve before
    dispatch by directing the agent to import from compose.ts instead.

    2. Missing canvas-c interaction test coverage: the auditor will verify Playwright spec
    coverage for each interactive surface. canvas-b gets two tests. canvas-c adds drag-to-canvas
    and proximity-link — neither has a test. This will be flagged at QA gate. Easy to fix now;
    requires a remediation loop if caught at audit.
  </audit_risk_forecast>

  <post_mortem_patterns_checked>
    Read: docs/post-mortems/gander-studio-p2-p3.md (single file covering both P2 and P3).

    Patterns consulted:
    - §5 recurring failure: PM wrote plans without reading source files before assigning tasks.
      Applied: read compose.ts getMateriaColor signature before flagging the DRY gap. The PM
      did not note the existing function when specifying getMateriaColor in canvas.ts.
    - §6 protocol gap: Auditor QA does not call live API after BE fixes. Not applicable to
      this all-FE sprint.
    - §6 protocol gap: Bash permission denied in background agents. Noted — FE agents running
      tsc --noEmit in background may be denied. Orchestrator should be aware.
    - docs/agent-changelog.md: not present — no recently corrected issues to exclude.
  </post_mortem_patterns_checked>

</plan_critique>
