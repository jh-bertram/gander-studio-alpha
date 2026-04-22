# Plan Critique — gander-studio-p2-canvas-link
# Revision 2 (CR re-review of PM rev1 plan)
# Critic: CR#1 | task_id: gander-studio-p2-canvas-link | timestamp: 1743120900

```xml
<plan_critique task_id="gander-studio-p2-canvas-link" revision="2">
  <result>CRITIQUE_PASS</result>

  <blocker_resolution_verification>

    <check id="C1" resolved="true">
      003a (wave 2): MateriaNode CSS rewrite + toRFEdge update + canvas.ts constants.
      003b (wave 3): MateriaCanvas.tsx drag extension + useLinkSound.ts new hook.
      003c (wave 4): LoadoutListPanel.tsx creation + MateriaCanvasInner layout wiring.
      Each task touches at most 2-3 files with bounded, non-overlapping changes. Wave
      numbers and dependencies are correct (003b blocked on 003a + 003-RA; 003c blocked
      on 003b + 001b + HCG-1). RESOLVED.
    </check>

    <check id="C2" resolved="true">
      001a out_of_scope explicitly excludes all packages/client/ files. 001b out_of_scope
      explicitly excludes all server files. File overlap audit: 001b touches canvas-store.ts
      + ComposePage.tsx; 003a touches MateriaNode.tsx + MateriaCanvas.tsx + canvas.ts — no
      intersection. 001a touches schemas.ts + agent-parser.ts + router.ts — no intersection
      with any FE task. RESOLVED.
    </check>

    <check id="C3" resolved="true">
      003-RA added as wave 1 task with explicit Q1/Q2/Q3 questions about AudioContext
      autoplay policy. 003b dependency list includes gander-studio-p2-canvas-link-003-RA.
      routing_notes item 6: "If 003-RA returns uncertainty on Q1/Q2, escalate to human before
      dispatching 003b." 003b success_criteria line: "Audio activation pattern matches RA
      dossier recommendation verbatim." RESOLVED.
    </check>

    <check id="C4" resolved="true">
      001b: compose-connections-persist.spec.ts named in description and success_criteria.
      003a: materia-node-glass.spec.ts named in success_criteria.
      003b: materia-canvas-proximity.spec.ts named in success_criteria — covers orb-attracted
      class during drag and removal on drag-end.
      003c: loadout-list-panel.spec.ts named in success_criteria — covers (a) add node →
      list row appears; (b) click row → node focused; (c) keyboard nav Tab + Enter.
      All four FE tasks have named Playwright Tier 2 specs. RESOLVED.
    </check>

    <check id="C5" resolved="true">
      001a success_criteria explicitly requires:
      - Comma-delimited serialization: "communicates_with: backend, frontend" (NOT YAML array).
      - Comma-split normalization in description: "same comma-split normalization as the tools
        field (lines 44-49): split on ', ' or ',' and trim each value."
      - Works through BOTH gray-matter AND parseFrontmatterFallback paths.
      - Round-trip test: agent.save with ["backend","frontend"] → parseAgentFile → returns
        ["backend","frontend"] via both parser paths.
      All three elements of the original C5 blocker are addressed in success criteria.
      RESOLVED.
    </check>

  </blocker_resolution_verification>

  <challenges>

    <challenge>
      <type>ASSUMPTION</type>
      <severity>WARNING</severity>
      <task_ref>gander-studio-p2-canvas-link-003b</task_ref>
      <description>
        003b adds className 'orb-attracted' to rfNodes via setRFNodes inside handleNodesChange.
        The existing MateriaCanvasInner has a useEffect at line 298-300 of MateriaCanvas.tsx
        that runs setRFNodes(storeNodes.map(toRFNode)) whenever storeNodes changes. This sync
        effect will strip any className applied via setRFNodes if the store updates during a
        drag gesture. During drag, storeNodes does NOT change (position updates go to RF-local
        state only, not to canvas-store until drag-end), so the sync effect will NOT fire.
        However, if any other store subscriber causes a re-render during the drag (e.g., a
        panel update), the orb-attracted class will be silently cleared. The plan notes "or
        direct DOM ref if re-render churn is observed" but does not specify this as a fallback
        criterion the auditor can verify. The FE agent may ship the setRFNodes path without
        testing the edge case, and the auditor has no criterion to enforce the fallback.

        Required revision (WARNING — PM should address in 003b success_criteria):
        Add: "If setRFNodes approach causes visible class-stripping during drag, FE agent must
        switch to direct DOM ref (document.querySelector('[data-id="..."]').classList) and
        document the choice in the completion packet."
      </description>
      <required_revision>
        Add to 003b success_criteria: "orb-attracted class must persist for the full duration
        of a drag gesture without flickering. If setRFNodes approach is used, agent must verify
        no storeNodes update triggers during drag. If flicker is observed, agent must use direct
        DOM ref approach and document this in the completion packet."
      </required_revision>
    </challenge>

    <challenge>
      <type>AUDIT_RISK</type>
      <severity>WARNING</severity>
      <task_ref>gander-studio-p2-canvas-link-003a</task_ref>
      <description>
        003a description says "Add all new numeric values (gradient stops are implicit in
        --orb-color; animation timing from spec) as named exports in canvas.ts." The parenthetical
        "gradient stops are implicit in --orb-color" suggests the FE agent may treat radial
        gradient percentage positions, specular highlight offsets, and box-shadow layer sizes
        as exempt from the constants rule because they are "part of the orb color expression."
        They are not exempt — they are magic numbers in CSS strings.

        Post-mortem P1 §6 explicitly documents: "any task that introduces numeric or string
        constants without a note to add them to src/constants/" is an audit risk. The auditor
        from P1 already caught inline magic numbers. A glassy orb will have at minimum:
        specular highlight position (e.g., "30% 20%"), radial gradient size ratios, and
        box-shadow blur/spread radii — all numeric, all appearing in component files, all
        subject to audit failure if not in canvas.ts.

        The current language "gradient stops are implicit in --orb-color" is ambiguous enough
        to let the FE agent skip extracting these values. PM should make the criterion
        unambiguous: all numeric values in CSS strings, including gradient % stops, shadow
        radii, and child-div positional offsets, must be in canvas.ts.
      </description>
      <required_revision>
        In 003a description and success_criteria, replace "gradient stops are implicit in
        --orb-color" with: "ALL numeric values in CSS strings — including radial gradient
        percentage stops, specular highlight position/size offsets, box-shadow blur/spread
        radii, and child-div positional offsets — must be exported as named constants from
        canvas.ts. Only the color token itself (--orb-color) is exempt because it is a CSS
        variable reference, not a literal."
      </required_revision>
    </challenge>

  </challenges>

  <summary>
    All 5 previous BLOCKERs are resolved. The revised plan is structurally sound: task split
    is correct, file boundaries are clean, the RA gate is in place before 003b, Playwright
    Tier 2 specs are named in all four FE tasks, and the communicates_with round-trip
    success criteria are explicit and complete.

    Two WARNINGs are raised. Neither is a blocker, but both are known audit failure patterns
    for this team (P1 §6: constants discipline; P1 §4: interactive surface behavior during
    drag). PM should address both in the relevant task success_criteria before dispatch.

    The plan correctly handles the LoadoutSchema backward-compat question (connections
    defaults to []) and the tRPC round-trip (loadout.save accepts the extended schema, JSON
    serialization includes connections automatically). No sequencing errors, no external API
    unknowns, no scope drift.
  </summary>

  <audit_risk_forecast>
    1. 003a: Auditor will grep for inline numeric CSS values in MateriaNode.tsx. If specular
       highlight offsets, gradient percentage stops, or shadow radii appear as literals rather
       than imported constants, this will fail SA. The "implicit in --orb-color" language in
       the spec invites this gap.

    2. 003b: playApproach/stopApproach are new interactive flows on the existing MateriaCanvas
       surface. The Playwright spec materia-canvas-proximity.spec.ts covers the orb-attracted
       class but does NOT cover that sound fires (or at least does not error) during drag.
       The auditor post-P1 is required to reject interactive tasks without coverage of every
       new flow. Confirm the spec covers the sound trigger path (even if only as a no-throw
       assertion with Web Audio API mocked) or the auditor will flag it.
  </audit_risk_forecast>

  <post_mortem_patterns_checked>
    - docs/post-mortems/gander-studio-p1-materia-canvas.md: consulted.
      §5 recurring pattern: CR WARNINGs not enforced → ship gaps into audit.
      §6 protocol gap: new interactive flows without Playwright coverage fail audit.
      §6 protocol gap: inline numeric constants in component files fail SA.
      §4 what missed: interactive surface coverage for drag interactions.
    - docs/post-mortems/gander-studio-p2-p3.md: consulted.
      §5 recurring pattern: PM writing task specs without reading source files.
      §6 protocol gap: Bash denial in background agents (noted in routing_notes item 3 —
      already addressed in this plan for 003b).
  </post_mortem_patterns_checked>

</plan_critique>
```
