<plan_critique>
  <plan_id>gander-studio-p1-materia-canvas</plan_id>
  <status>BLOCK</status>

  <challenges>

    <challenge>
      <type>MISSING_RESEARCH</type>
      <severity>BLOCKER</severity>
      <task_ref>p1-mc-FE-canvas</task_ref>
      <description>
        @xyflow/react is absent from packages/client/package.json. The plan instructs the
        implementing agent to "install @xyflow/react" without any prior verification of
        compatibility with React 19 (the project uses react@^19.0.0 per client/package.json
        line 23). @xyflow/react v12+ targets React 18. As of August 2025, the React 19
        compatibility story for @xyflow/react has not been confirmed in the codebase or in any
        research dossier. Training data for library compatibility is stale by definition.

        Additionally, the plan flags that @xyflow/react "requires CSS import; must not leak into
        other pages" (PM risk flag 2) but does not mandate a mechanism. The only safe isolation
        pattern is a lazy/dynamic import of the CSS inside the component file itself (not in
        globals.css). The task description does not require this — it says "must not leak" as a
        risk flag, not as an explicit implementation constraint with a verifiable criterion.
        Without the mechanism being required, the implementing agent is likely to import the CSS
        in globals.css (the pattern already used for tw-animate-css and fontsource), which will
        apply React Flow's default styles globally and override existing canvas-adjacent styles.
      </description>
      <required_revision>
        Add a RA (Researcher) task before p1-mc-FE-canvas with the specific query: "Confirm
        @xyflow/react current version's peer dependency requirement for React. Confirm whether
        React 19 is listed as a supported peer. If it requires React 18, identify whether a
        React 19 compat fork or legacy peer install flag is needed. Document the required CSS
        import path and confirm it can be safely scoped to a single component via a local
        dynamic import rather than a global stylesheet entry."

        Additionally, change p1-mc-FE-canvas success criteria to include: "@xyflow/react CSS
        imported only inside MateriaCanvas.tsx (not globals.css, not main.tsx) — verified by
        grep."
      </required_revision>
    </challenge>

    <challenge>
      <type>OVERSCOPED</type>
      <severity>BLOCKER</severity>
      <task_ref>p1-mc-FE-canvas</task_ref>
      <description>
        p1-mc-FE-canvas creates three new files (MateriaCanvas.tsx, MateriaNode.tsx, canvas.ts),
        installs a new npm dependency, and requires implementing: drag-from-palette via
        onDrop+screenToFlowPosition, Handle-to-Handle edge creation, custom SVG edge styling,
        circular orb node rendering with glow, orchestrator size override, search, canvas
        background customization with teal dot grid, and zoom/fit controls. This is at minimum
        7 distinct implementation units. The 50-line-per-commit standard (CLAUDE.md, Code
        Conventions) will be breached in a single task turn.

        The existing ComposePage.tsx is 1300+ lines; the canvas component will be at least
        comparable in scope. A single agent turn producing MateriaCanvas.tsx + MateriaNode.tsx
        + canvas.ts at acceptable quality will require 200-400 lines of new code — 4-8x the
        limit.
      </description>
      <required_revision>
        Split p1-mc-FE-canvas into three sequential sub-tasks:

        p1-mc-FE-canvas-a: canvas.ts constants + MateriaNode.tsx only. No React Flow. Just the
        node visual (circular orb, color, glow, label) as a standalone component that accepts
        props. ~40 lines. Success: tsc passes, node renders in isolation.

        p1-mc-FE-canvas-b: MateriaCanvas.tsx skeleton — React Flow provider, static node
        rendering of MateriaNode using canvas-store, no drag-from-palette yet, no edge creation.
        Orchestrator visible centered. CSS isolation verified. ~50 lines. Success: orchestrator
        node visible on mount, tsc passes.

        p1-mc-FE-canvas-c: Palette sidebar + drag-to-canvas (onDrop/screenToFlowPosition) +
        Handle-to-Handle edge creation + zoom controls. ~50 lines. Success: agent dragged from
        palette appears as node; two nodes can be connected; zoom controls present.

        Each sub-task depends on the previous. p1-mc-FE-wire depends on p1-mc-FE-canvas-c.
      </required_revision>
    </challenge>

    <challenge>
      <type>ASSUMPTION</type>
      <severity>BLOCKER</severity>
      <task_ref>p1-mc-FE-store</task_ref>
      <description>
        The plan assumes hooks can be represented as CanvasNodes with type 'hook'. But
        HookSchema (packages/shared/src/schemas.ts lines 24-31) identifies hooks by `matcher`
        (a string), not `name`. The existing compose-store.ts stores hooks as `hooks: string[]`
        using matchers (line 11). The existing handleSave in ComposePage.tsx passes
        `hooks: currentLoadout.hooks` which are matchers.

        The canvas-store CanvasNode type uses `name: string` as the identifier. If the node's
        `name` field holds a hook matcher, then selectLoadoutPayload can emit `hooks` as an
        array of matchers — consistent with LoadoutSchema. But this is nowhere stated. If the
        implementing agent treats hook nodes' `name` as a display name (which is natural given
        the type definition mirrors agent/skill naming), they will store the hook matcher in
        `name` without comment, making the field semantics ambiguous.

        More critically: loadFromLoadout receives a Loadout object (LoadoutSchema) containing
        `hooks: string[]` (matchers). The store task specifies it creates agent and skill nodes.
        It says nothing about whether hook matchers also become CanvasNodes. The plan says
        "Types: CanvasNode { id, name, type: 'agent'|'skill'|'hook' }" — implying hooks do
        become nodes — but how a hook is displayed as a materia orb on the canvas (with what
        label, position, connection model) is completely unspecified. This will produce either
        an implementation guess or a missing feature.
      </description>
      <required_revision>
        The PM must explicitly answer: do hooks appear as canvas nodes or not?

        If yes: add to the store task spec: "Hook nodes use `matcher` as the node `name`.
        loadFromLoadout maps loadout.hooks (matchers) to CanvasNodes of type 'hook'.
        selectLoadoutPayload maps 'hook'-typed nodes' name fields back to the hooks array."
        Add a MateriaNode rendering spec for hooks (distinct visual or same orb in --mo color).

        If no: remove 'hook' from the CanvasNode type union. Clarify that hooks are preserved
        from the existing compose-store and selectLoadoutPayload reads hooks from compose-store,
        not canvas-store. Update p1-mc-FE-wire to describe how hook state is managed during
        loadFromLoadout (does it call composeStore.loadLoadout for hooks separately?).
      </required_revision>
    </challenge>

    <challenge>
      <type>ASSUMPTION</type>
      <severity>BLOCKER</severity>
      <task_ref>p1-mc-FE-wire</task_ref>
      <description>
        The p1-mc-FE-wire task says "handleSave uses selectLoadoutPayload from canvas store"
        and "ValidationWarnings counts from canvas store." The current ComposePage.tsx handleSave
        (line 1061-1070) calls saveMutation.mutate with an object shaped exactly as LoadoutSchema:
        { name, agents, skills, hooks, createdAt }. The `name` field comes from
        currentLoadout.name in compose-store.ts — which the plan says to preserve (risk flag 5:
        "compose-store.ts: keep for name/save-state; canvas-store for node/edge graph").

        The plan does not specify how name flows into handleSave. selectLoadoutPayload returns
        { agents, skills, hooks } — no name. The name must still come from compose-store. But
        the task says "handleSave uses selectLoadoutPayload from canvas store" without clarifying
        that name is still read from compose-store. An implementing agent reading only the task
        packet will likely drop the name field or duplicate the store access incorrectly.

        ValidationWarnings currently receives a `warnings: string[]` prop computed by
        useValidationWarnings(agents, skills, hooks, name, nameDirty) — a hook that takes arrays
        and returns messages (ComposePage.tsx lines 941-971). "ValidationWarnings counts from
        canvas store" is ambiguous — does this mean the arrays fed into useValidationWarnings
        come from canvas store? Or does the ValidationWarnings component API change to accept
        counts? The task gives no specification. The implementing agent will guess.
      </description>
      <required_revision>
        Rewrite the p1-mc-FE-wire scope to explicitly state:

        "handleSave reads: name from useComposeStore().currentLoadout.name (unchanged);
        agents/skills/hooks from useCanvasStore().selectLoadoutPayload(). Calls
        saveMutation.mutate({ name, ...selectLoadoutPayload(), createdAt: new Date().toISOString() })."

        "useValidationWarnings receives agents and skills arrays from selectLoadoutPayload()
        and name from compose-store. The hook signature is not changed. The ValidationWarnings
        component API is not changed."

        "handleLoad calls: composeStore.loadLoadout({ name, agents: [], skills: [], hooks: lo.hooks })
        to preserve name and hooks in compose-store; then canvasStore.loadFromLoadout(lo) for
        canvas node layout."

        This must be in scope, not in risk_flags, because implementing agents only act on scope.
      </required_revision>
    </challenge>

    <challenge>
      <type>AUDIT_RISK</type>
      <severity>WARNING</severity>
      <task_ref>p1-mc-FE-canvas</task_ref>
      <description>
        Post-mortem (gander-studio-p2-p3.md §5, §6 recurring pattern): PM wrote plans without
        reading source files. The PM's risk flag 4 says "Orchestrator name must match
        getMateriaColor() substring check ('orchestrator')." getMateriaColor() in
        packages/client/src/constants/compose.ts line 60 uses `lower.includes('orchestrat')` —
        so the check is a substring match on the partial string 'orchestrat', not the word
        'orchestrator'. The PM's description of the contract is close but imprecise.

        More critically: no Playwright test coverage is specified for any of the three tasks.
        The standards (CLAUDE.md Code Conventions) and the auditor's QA gate require UI surface
        coverage. The MateriaCanvas is a new UI surface. The auditor will look for a Tier 2
        Playwright spec and will not find one.
      </description>
      <required_revision>
        Add to p1-mc-FE-canvas success criteria: "A Playwright spec exists at
        packages/client/src/tests/compose/materia-canvas.spec.ts covering: (a) orchestrator
        node visible on canvas mount; (b) dragging an agent from palette creates a node;
        (c) a new edge can be created between two nodes." This is a WARNING not a BLOCKER — but
        the PM should add it before execution to avoid a CRITIQUE_BLOCK at audit.
      </required_revision>
    </challenge>

    <challenge>
      <type>SCOPE_DRIFT</type>
      <severity>WARNING</severity>
      <task_ref>p1-mc-FE-canvas</task_ref>
      <description>
        The human's request: "linked in some way, by dragging one on top of another." This
        describes collision/proximity-based linking — drop agent A onto agent B to create a
        connection. The plan implements Handle-to-Handle drag (React Flow source/target handle
        connectors), which requires the user to find a specific small handle on the node edge
        and drag from it to another handle. This is a fundamentally different UX interaction.
        Handle-to-Handle is a power-user graph editor pattern. Drag-onto is a casual spatial
        arrangement pattern. The human's description ("dragging one on top of another") is
        unambiguous.
      </description>
      <required_revision>
        PM must confirm with human which interaction model is intended before p1-mc-FE-canvas
        is dispatched. If collision/proximity linking is confirmed, the implementation approach
        changes significantly (onNodeDrop + proximity detection, not React Flow handles). If
        handle-to-handle is acceptable, get explicit human confirmation and update the task spec
        to note this is a reinterpretation with rationale.
      </required_revision>
    </challenge>

  </challenges>

  <audit_risk_forecast>
    1. CSS leak from @xyflow/react: if the implementing agent imports the React Flow stylesheet
    in globals.css or main.tsx rather than scoping it to MateriaCanvas.tsx, it will override
    existing Shadcn and FF7R styles globally. The auditor's SA gate checks for style
    encapsulation. This is the highest-probability audit failure in this plan.

    2. Missing Playwright coverage: the auditor's QA gate will check for test coverage of new
    UI surfaces (established pattern from prior sprints). MateriaCanvas is a net-new interactive
    surface with no spec in the plan. Without a Playwright test file specified in scope, the
    agent will not write one, and the auditor will flag it. Add spec coverage to scope before
    dispatch.
  </audit_risk_forecast>

  <post_mortem_patterns_checked>
    Read: docs/post-mortems/gander-studio-p2-p3.md (the only post-mortem present — one file
    covers both P2 and P3 sprints).

    Patterns consulted:
    - §5 recurring failure: PM wrote plans without reading source files before assigning tasks.
      Applied: verified ComposePage.tsx handleSave, compose-store interface, and HookSchema
      before flagging the name/hook assumption gaps.
    - §6 protocol gap: Auditor QA does not call live API after BE fixes. Not directly applicable
      to this all-FE sprint but noted.
    - §6 protocol gap: PM pre-flight must read source files for investigation tasks. Applied to
      assumption challenges above.
    - docs/agent-changelog.md: not present — no recent fixes to exclude from critique.
    - .claude/rules/standards.md: not present — used CLAUDE.md standards section instead.
  </post_mortem_patterns_checked>

  <summary>
    The plan has four BLOCKERs and two WARNINGs. p1-mc-FE-canvas is overscoped by 4-8x the
    50-line commit limit and must be split into three sequential sub-tasks. @xyflow/react React
    19 compatibility is unverified and a Researcher pre-flight is required before any canvas
    implementation begins. The store spec leaves hook representation on the canvas completely
    undefined — the `type: 'hook'` CanvasNode exists in the type but no spec describes how
    hook matchers map to nodes, how they display, or whether they appear on the canvas at all.
    The wire task's handleSave and ValidationWarnings integration is underspecified in a way
    that will produce a broken save (missing name field) or a component API mismatch. Finally,
    the edge-creation UX (handle-to-handle) is a reinterpretation of the human's stated
    "drag one on top of another" pattern and requires explicit human confirmation before
    implementation. Execution must not start until the PM resolves the four BLOCKERs.
  </summary>

</plan_critique>
