<plan_critique>
  <plan_id>prog-studio-v2-2026-07-s3-drilldowns</plan_id>
  <status>BLOCK</status>

  <challenges>
    <challenge>
      <type>AUDIT_RISK</type>
      <severity>BLOCKER</severity>
      <task_ref>prog-studio-v2-2026-07-s3-drilldowns-t4b / t5</task_ref>
      <description>
        FIX 1's chosen resolution — re-pointing the Roster rail item from mode:'browse' to mode:'party'
        (t4b step 3, navigation.ts:32) — breaks a THIRD s2 e2e assertion that the plan does not
        authorize t5 to touch. Disk-verified mechanism:
          - SubmenuRail.tsx:33 computes `isActive = activeMode === item.mode` and sets
            `aria-current={isActive ? 'page' : undefined}` (L40).
          - SubmenuRail renders ONLY inside PartyPage (PartyPage.tsx:219-221), i.e. only while
            activeMode === 'party'.
          - Today RAIL_ITEMS Roster.mode === 'browse', so on the party surface NO rail item matches
            activeMode ('party') → aria-current count is 0.
          - The s2 spec test at prog-studio-v2-2026-07-s2-party-shell.spec.ts:313-325
            ("rail: aria-current is absent on the party surface") asserts
            `getRailNav(page).locator('[aria-current="page"]').toHaveCount(0)` and its rationale
            comment (L319-320) states verbatim: "activeMode === 'party' never matches a RAIL_ITEMS
            mode (Roster/Sessions/Progression/Programs)".
          - After t4b re-points Roster.mode → 'party', that invariant is false: on the party surface
            the Roster item now matches activeMode → aria-current="page" is set → the count becomes 1
            → the s2 test FAILS.
        t5 SC(d) requires the full e2e suite to pass headless, but t5 out_of_scope + must_not_contain
        forbid altering any s2 assertion beyond the two named destination markers (card Enter L241,
        Roster rail L305-311). Test L313-325 is NOT in the authorized list. Result: the plan as written
        cannot produce a green suite without an edit t5 is explicitly barred from making — a hard
        cross-task contradiction. This is a DISTINCT defect from the CR#1 blocker (which is resolved);
        it is a new consequence of the rail-to-'party' resolution that neither CR#1 nor rev1 checked.
      </description>
      <required_revision>
        Add the s2 aria-current test (L313-325) to t5's AUTHORIZED cross-sprint re-point list and
        update t4b/t5 accordingly:
        (1) t5: the "exactly two s2 markers" discipline becomes THREE authorized s2 touches — the two
            destination markers PLUS the L313-325 aria-current invariant. Since the Roster item now
            LEGITIMATELY carries aria-current on the party surface (semantically correct: you are on the
            roster/party home), rewrite the test to assert the Roster rail item specifically carries
            `aria-current="page"` on the party surface (count 1 on that item), and rewrite the stale
            L319-320 rationale comment that claims no RAIL_ITEMS mode ever matches 'party'.
        (2) Update t5 SC(c), must_contain/must_not_contain, and the expectation_manifest receipt_check
            ("EXACTLY two s2 markers") to reflect the three authorized s2 edits so the count discipline
            is internally consistent.
        (3) Note this in the nav-contract preamble: re-pointing Roster→'party' has the intended UX
            side-effect of activating the Roster rail item on the party home.
        (Alternative if the human does NOT want Roster highlighted on party home: retain Roster.mode at
        a non-'party' value — but 'party' is the correct destination, so authorizing the test update is
        preferred.)
      </required_revision>
    </challenge>

    <challenge>
      <type>ASSUMPTION</type>
      <severity>WARNING</severity>
      <task_ref>prog-studio-v2-2026-07-s3-drilldowns-t4a</task_ref>
      <description>
        t4a context_files (L354) cites
        `packages/client/src/components/party/party-roster.ts (verify naStatBar / StatBar N/A prop
        contract)`. That path does not exist — party-roster.ts is a SERVER parser at
        `packages/server/src/parsers/party-roster.ts` and does not hold the StatBar prop contract.
        The FE agent will waste a read on a dead path. The authoritative StatBar N/A contract is in
        `packages/client/src/components/party/StatBar.tsx`: `reason?: string` is OPTIONAL (L29) and the
        N/A branch defaults to `'reason not provided'` when omitted (L51). FIX 3 is therefore fully
        satisfiable — t4a renders QualityStat N/A bars with no `reason` and no StatBar edit — but the
        packet points the agent at the wrong file to confirm it.
      </description>
      <required_revision>
        In t4a context_files, replace the `components/party/party-roster.ts` reference with
        `packages/client/src/components/party/StatBar.tsx` (the real N/A prop contract: reason optional,
        defaults to 'reason not provided'). Drop or correct the "naStatBar" pointer.
      </required_revision>
    </challenge>
  </challenges>

  <audit_risk_forecast>
    1. QualityStat N/A readout copy: because StatBar defaults omitted reasons to the literal
       "N/A — reason not provided" (StatBar.tsx:51), every QualityStat N/A bar in the detail header
       will render that generic string. The plan intends N/A rationale to come from dataQualityNotes,
       so this is acceptable, but SA/QA may flag the duplicated generic readout as noise. If it reads
       poorly in the Step-4.5 browser check, a neutral valueLabel/reason at the call site (still no
       StatBar edit) is the minimal fix — not a blocker.
    2. 6-of-13 reachability (ratification item, PM-flagged): SC1 "any roster agent" vs the 6-card cap +
       retained Browse CTA. REQVAL must adjudicate against the human; t4a SC(c) proves getAgentDetail
       resolves any ROSTER code (capability), so this is a navigation deferral, not a capability gap.
    3. RF v12 registration (satisfied): t2 registers a relationship node type and t5 PROOF 2 asserts
       `.react-flow__edge` DOM presence — meets the react-flow-rendering-registration rule.
  </audit_risk_forecast>

  <post_mortem_patterns_checked>
    Re-consulted prog-studio-v2-2026-07-s2-party-shell.md (§6 G1 bundle/lazy-from-birth, G2 primitive
    focus defaults, G3 git-stash) and s1-data-layer §6 G1 (corpus-fact citations). Disk-verified this
    round: PartyPage.tsx L190-231 (three browse targets: handleSelect L202, handleViewRoster L206;
    6-card cap L229); navigation.ts RAIL_ITEMS L29-36 (Roster.mode='browse' L32); ui-store.ts AppMode
    union (L4 — 'party' present, rail re-point valid); SubmenuRail.tsx L33/L40 (isActive→aria-current
    mechanism — source of the new blocker); s2 e2e spec L241 (card Enter→browse-page), L305-311 (Roster
    rail→browse-page), L313-325 (aria-current-count-0 invariant), L364-398 (View-Full-Roster CTA→
    browse-page, correctly protected); StatBar.tsx L24-67 (reason optional, N/A default); router.ts:794
    (getAgentDetail exists). sc-precheck report: 0 findings, consistent with a plan authoring no
    locked-value/diff-gated SCs. Recurring-pattern declaration present (6 elements) →
    MISSING_RECURRENCE_DECLARATION does not fire. Same-blocker-twice check: the CR#1 nav-enumeration
    BLOCKER is RESOLVED (three targets enumerated; t4b SC(d) permits exactly one retained 'browse' →
    satisfiable; L364-398 protected). It does NOT survive in any form. The new BLOCKER is a different,
    adjacent consequence of the rail-to-'party' resolution.
  </post_mortem_patterns_checked>
</plan_critique>
