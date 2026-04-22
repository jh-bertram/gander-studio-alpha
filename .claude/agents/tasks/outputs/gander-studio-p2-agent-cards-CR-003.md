```xml
<plan_critique>
  <plan_id>gander-studio-p2-agent-cards</plan_id>
  <status>PASS</status>

  <!-- ═══════════════════════════════════════════════════════════════════════ -->
  <!-- CR-002 RESOLUTION STATUS                                               -->
  <!-- ═══════════════════════════════════════════════════════════════════════ -->

  <resolution_status id="CR-002-BLOCKER-compose-ts-aliasing">
    RESOLVED. DS-001 out_of_scope states explicitly: "Do NOT modify
    packages/client/src/constants/compose.ts in any way — not a single character. getMateriaColor
    changes and the compose.ts import refactor are exclusively FE-001a's responsibility."
    DS-001 success criteria include: getMateriaColor('dispatcher', 'agent') returns var(--mp)
    (unchanged), getMateriaColor('orchestrator', 'agent') returns var(--my) (unchanged), and
    "packages/client/src/constants/compose.ts is byte-for-byte identical to its state before DS-001."
    The aliasing and getMateriaColor refactor now live entirely in FE-001a. The blocker is closed.
  </resolution_status>

  <resolution_status id="CR-002-WARNING-1-archivist-reclassification">
    RESOLVED. SPECIALIST_AGENTS in agent-roles.ts includes 'archivist'. EXTERNAL_AGENTS no longer
    includes 'archivist'. SPECIALIST_FRAGMENTS includes 'archiv'. EXTERNAL_FRAGMENTS does not include
    'archiv'. DS-001 success criteria include: "archivist is in SPECIALIST_AGENTS (not
    EXTERNAL_AGENTS)" and "deriveRole('archivist', 'agent') returns 'specialist'". PM-003 documents
    the archivist judgment call with rationale (internal file writes, not external codebase access).
    Warning 1 is closed.
  </resolution_status>

  <resolution_status id="CR-002-WARNING-2-FE-003-spurious-dependency">
    RESOLVED. FE-003 dependency list is: DS-001, FE-001a, FE-002 — FE-001b is not listed.
    Confirmed in the FE-003 task packet dependencies section and in PM-003's "Changes Made" section.
    The dependency order note at the bottom of the task decomposition file states explicitly:
    "FE-003 depends on FE-002 (wave 4) and DS-001 + FE-001a, but NOT on FE-001b directly."
    Warning 2 is closed.
  </resolution_status>

  <resolution_status id="CR-002-WARNING-3-FE-001b-line-count-framing">
    RESOLVED. FE-001b description now states: "npm run lint (tsc --noEmit) constitutes the required
    verification gate pass for this commit. The agent MUST run npm run lint before emitting the
    ui_packet — this satisfies the verification gate requirement per standards.md." The incorrect
    per-file framing ("both fit within gate when treated as two distinct files") is gone. Success
    criteria state: "npm run lint (tsc --noEmit) passes — this is the required verification gate
    for this commit and MUST be run before emitting the ui_packet." must_contain states: "npm run
    lint PASS (with lint output included — this is the gate pass)." Warning 3 is closed.
  </resolution_status>

  <!-- ═══════════════════════════════════════════════════════════════════════ -->
  <!-- NEW CHALLENGES                                                          -->
  <!-- ═══════════════════════════════════════════════════════════════════════ -->

  <challenges>

    <challenge>
      <type>AUDIT_RISK</type>
      <severity>WARNING</severity>
      <task_ref>gander-studio-p2-agent-cards-FE-001a</task_ref>
      <description>
        The new getMateriaColor name-based fallback in FE-001a contains a dead-code branch. The
        new code imports META_AGENTS both aliased as COMMAND_AGENTS and un-aliased as META_AGENTS.
        The fallback Set-check sequence (task packet lines 308-312) is:

          if (COMMAND_AGENTS.has(lower)) return 'var(--my)';   // COMMAND_AGENTS = META_AGENTS = {orchestrator, project-manager, dispatcher}
          if (IMPL_AGENTS.has(lower))    return 'var(--mg)';
          if (GATE_AGENTS.has(lower))    return 'var(--mr)';
          if (INTEL_AGENTS.has(lower))   return 'var(--mb)';
          if (META_AGENTS.has(lower))    return 'var(--mp)';   // META_AGENTS = same {orchestrator, project-manager, dispatcher}

        COMMAND_AGENTS and META_AGENTS are aliases for the same Set object. Every member of
        META_AGENTS is already intercepted by the COMMAND_AGENTS check on line 308. The META_AGENTS
        check on line 312 returning var(--mp) can never be reached by any agent in META_AGENTS.
        It is dead code for every member of the set.

        The auditor's SA pass enforces DRY and will flag dead code branches. The task-as-written
        will produce a lint-clean file (tsc does not catch dead Set logic), but the auditor's code
        review will catch it. This is likely a minor SA note rather than a full FAIL, but it may
        require a remediation round.

        The fix is simple: remove the final META_AGENTS check from the Set-based fallback entirely.
        The var(--mp) return value is now only reachable via the role fast-path (role === 'external').
        If "external/purple for unrecognized META_AGENTS-named agents" is desired in the no-role
        fallback, the rationale needs to be documented and the duplicate resolved.
      </description>
      <required_revision>
        In FE-001a's getMateriaColor spec, remove the `if (META_AGENTS.has(lower)) return 'var(--mp)'`
        line from the Set-based fallback section. The role fast-path already handles all current
        META_AGENTS members correctly. If the PM intends var(--mp) as a no-role fallback for any
        future unrecognized agent in the META set, document this in a comment and use a separate
        named constant rather than importing META_AGENTS twice under different names. The current
        un-aliased META_AGENTS import exists only for this unreachable branch — removing the branch
        removes the need for the un-aliased import entirely.
      </required_revision>
    </challenge>

    <challenge>
      <type>ASSUMPTION</type>
      <severity>WARNING</severity>
      <task_ref>gander-studio-p2-agent-cards-FE-002</task_ref>
      <description>
        FE-002 makes 6 distinct changes to MateriaCanvas.tsx but provides no line-count estimate.
        The prior CR-002 audit_risk_forecast flagged this explicitly: "FE-002 modifies MateriaCanvas.tsx
        with 6 distinct changes... Count carefully — total new/changed lines may approach the 50-line
        gate. The task does not include an explicit line-count estimate. PM should add one."

        Estimating the 6 changes:
        1. NODE_TYPES update (add card entry): ~3 lines
        2. CardNodeRenderer function (new): ~8-10 lines
        3. toRFNode orchestrator branch (new conditional + card-position math): ~10-12 lines
        4. zIndex logic (card: 0, orbs: Z_CANVAS_NODE): ~4-6 lines
        5. role in MateriaNodeData type + data.role population in toRFNode: ~6-8 lines
        6. Stop passing isOrchestrator: true (remove/guard): ~3-4 lines
        7. Imports (CardNode, CARD_WIDTH_PX, CARD_HEIGHT_PX, AgentRole): ~4-6 lines

        Total: ~38-49 lines of new/changed code. This is borderline — it could land under 50 or
        slightly over depending on implementation. The task has no pre-submission lint gate note,
        meaning if the implementation runs long the agent may emit a ui_packet without a verification
        gate pass for a >50-line commit.

        Standards.md: "No commit exceeding 50 lines of new code without a verification gate first."
      </description>
      <required_revision>
        Add a line-count estimate and a conditional gate note to FE-002's description: "Estimated
        ~40-50 lines. If the implementation exceeds 50 lines, run npm run lint (tsc --noEmit) before
        emitting the ui_packet — this satisfies the verification gate per standards.md." Add to
        FE-002 success criteria: "If total new/changed lines exceed 50, npm run lint output is
        included in the packet."
      </required_revision>
    </challenge>

    <challenge>
      <type>ASSUMPTION</type>
      <severity>WARNING</severity>
      <task_ref>gander-studio-p2-agent-cards-FE-001a</task_ref>
      <description>
        After FE-001a ships, three getMateriaColor callers that do not pass role will produce
        different colors for dispatcher, ui-designer, and system-health-monitor:

        - `ComposePage.tsx` line 81: MateriaDot component calls getMateriaColor(name, type) with
          no role. After FE-001a: dispatcher → COMMAND_AGENTS (META_AGENTS alias) → var(--my)
          instead of old var(--mp). ui-designer → INTEL_AGENTS (EXTERNAL_AGENTS alias) → var(--mb)
          instead of old var(--mp). system-health-monitor → GATE_AGENTS → var(--mr) instead of
          old var(--mp). This caller is not in any task's scope and will not be updated this sprint.

        - `MateriaCanvas.tsx` line 333: LoadoutListPanel renderRow calls getMateriaColor(node.name,
          node.type) with no role. FE-003 rewrites LoadoutListPanel but switches to the 3-arg call
          getMateriaColor(node.name, node.type, node.role). The transition from line-333 to the
          FE-003 rewrite happens atomically in one task — no window where the old no-role call
          survives. CLEAR.

        - `MateriaCanvas.tsx` line 519: hardcoded 'frontend-engineer' — no behavior change. CLEAR.

        The ComposePage.tsx MateriaDot is the only persistent caller that will show changed colors
        after this sprint. The FE-001a aliasing rationale (task lines 264-283) frames this as
        intended new behavior ("the old purple behavior for dispatcher was the legacy classification;
        the new 5-role system makes dispatcher meta/yellow"). This is documented in the task but
        NOT listed in any success criterion, must_not_contain, or explicit out-of-scope statement.

        If the auditor checks ComposePage.tsx MateriaDot behavior post-FE-001a and finds dispatcher
        rendering yellow instead of purple, they may flag it as an unintentional regression (the
        old compose.ts code never showed dispatcher as yellow). The plan's intent is correct but
        the acceptance criteria don't cover this caller.
      </description>
      <required_revision>
        Add to FE-001a out_of_scope: "ComposePage.tsx MateriaDot (line 81) is not updated in this
        sprint — after FE-001a, it will show dispatcher/ui-designer/system-health-monitor in new
        role-based colors (dispatcher: yellow, system-health-monitor: red, ui-designer: blue). This
        is intentional; the legacy purple classification is retired. Do not treat this as a
        regression." This documents the accepted behavior change so the auditor does not flag it.
      </required_revision>
    </challenge>

  </challenges>

  <audit_risk_forecast>
    1. FE-001a dead-code META_AGENTS branch (flagged as WARNING above): The auditor's SA pass will
    likely note the import of META_AGENTS both as COMMAND_AGENTS and un-aliased, with the un-aliased
    reference only appearing in a branch that is structurally unreachable. This is the highest
    single audit-fail risk in the plan if not addressed before dispatch.

    2. FE-002 line count: if the MateriaCanvas.tsx changes run to 55+ lines without a lint gate
    note in the brief, the auditor will call a standards violation. The estimate puts it at the
    borderline; a brief-level note covering the contingency eliminates the risk.
  </audit_risk_forecast>

  <post_mortem_patterns_checked>
    - gander-studio-p2-canvas-link.md (2026-03-30, most recent): §5 recurring failure = PM
      overscoping; §6 protocol gaps = CSS numeric literals in template strings, FE agent self-grep
      requirement. Applied: FE-001b self-grep requirement present (confirmed). FE-002 line count
      borderline concern flagged. Playwright Tier 2 coverage present across all FE tasks.
    - gander-studio-p2-p3.md (2026-03-16, second most recent): §5 recurring failure = PM writing
      plans without reading source files; §6 protocol gaps = Bash permission in background agents.
      Applied: getMateriaColor callers grepped across all packages to verify color-change behavior
      for no-role callers (ComposePage.tsx MateriaDot identified). Bash/lint note from §6 already
      in prior critiques — no new gap here.
  </post_mortem_patterns_checked>

</plan_critique>
```
