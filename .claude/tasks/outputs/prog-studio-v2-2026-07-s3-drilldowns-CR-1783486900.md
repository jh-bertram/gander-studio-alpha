<plan_critique>
  <plan_id>prog-studio-v2-2026-07-s3-drilldowns</plan_id>
  <status>BLOCK</status>

  <challenges>
    <challenge>
      <type>ASSUMPTION</type>
      <severity>BLOCKER</severity>
      <task_ref>prog-studio-v2-2026-07-s3-drilldowns-t4b</task_ref>
      <description>
        The nav-contract decision (plan preamble line 12) asserts "Both interim 'browse' targets
        shipped by s2 are re-pointed this sprint so s4 can delete Browse without leaving dead ends."
        There are THREE browse targets in the party surface, not two. Disk-verified:
          - packages/client/src/pages/PartyPage.tsx:202 — handleSelect → setActiveMode('browse')  [addressed by t4b]
          - packages/client/src/pages/PartyPage.tsx:206 — handleViewRoster → setActiveMode('browse') [NOT addressed]
          - packages/client/src/constants/navigation.ts:32 — RAIL_ITEMS Roster mode:'browse'         [addressed by t4b]
        handleViewRoster backs the EmptyPartyState "View Full Roster" CTA (PartyPage.tsx:172,205-207)
        and is regression-tested by the s2 e2e spec at
        packages/client/tests/e2e/prog-studio-v2-2026-07-s2-party-shell.spec.ts:364-398 (clicks
        "View Full Roster", asserts browse-page). The s2 post-mortem's own "Key contracts" handoff
        (§7 line 213) under-counted to "both" — the plan inherited that miscount instead of verifying
        on disk (this is exactly the s1-G1 corpus-fact-citation class the PM claims to honor in
        routing_notes).

        This produces a hard internal contradiction in t4b: its body instructs changing ONLY
        handleSelect, but SC(c) requires "No remaining 'browse' target in the party/rail nav path
        (search the two files)" and must_not_contain forbids "any remaining 'browse' target in the
        party card / Roster rail path." PartyPage.tsx (a t4b-edited file) will still contain
        handleViewRoster → 'browse' at line 206, so SC(c) is UNSATISFIABLE as written. The
        implementing agent either fails the SC or makes an undirected change to a line the packet
        never authorized. Semantically the "View Full Roster" CTA IS the deferred 13-role catalog's
        entry point, so its destination is not incidental — it is the same decision the human is being
        asked to ratify, and it leaves an s4 dead-end (setActiveMode('browse') becomes a compile break
        once s4 removes 'browse' from the AppMode union).
      </description>
      <required_revision>
        Make an explicit decision on PartyPage.tsx:206 handleViewRoster and reconcile the plan:
        (1) If re-pointing it (e.g. → 'party', or a future catalog mode): add it to t4b's body + SCs,
            AND add the s2 spec line 364-398 empty-state assertion to t5's AUTHORIZED cross-sprint
            re-point list (t5 currently forbids touching any s2 assertion beyond the two named markers,
            which would make t5 and t4b mutually inconsistent).
        (2) If deliberately retaining 'browse' this sprint (browse still exists until s4): reword t4b
            SC(c)/must_not_contain so "no remaining browse target" scopes to the two re-pointed targets
            explicitly, state the retained handleViewRoster→'browse' as a declared s4 hand-off item,
            and correct the preamble's "Both" enumeration to three.
        Either way, correct the nav-contract preamble to enumerate all three browse targets so the
        human ratifies the real picture, not a two-of-three subset.
      </required_revision>
    </challenge>
  </challenges>

  <audit_risk_forecast>
    1. SC1 interpretation (WARNING, ratification item — PM already flagged): the sprint SC says
       "clicking ANY roster agent opens its detail view," but PartyPage renders only 6 of 13 members
       (PartyPage.tsx:36,229 — PARTY_GRID_DISPLAY_CAP=6, "six front-row cards, not all thirteen";
       assembleParty returns all 13). Agent-detail is reachable via 6 cards only; 7 roles (incl. DI)
       have no entry. The PM correctly declares and flags this for ratification. REQVAL must adjudicate
       "any roster agent" = "any of the 6 shown cards" against the human; do not let it read as a
       silent under-delivery of SC1. Directly coupled to the BLOCKER above (the "View Full Roster" CTA
       is the deferred catalog's front door).
    2. StatBar reuse-fit (WARNING): t4a reuses s2's StatBar for qualityStats. s2's StatBar was built
       for PartyStatBar, which carries a `reason` field (party-roster.ts naStatBar); QualityStatSchema
       (schemas.ts:450-457) has NO `reason` — N/A rationale must come from dataQualityNotes only.
       Verify StatBar's N/A variant does not require a `reason` prop the QualityStat cannot supply.
    3. RF v12 registration DOM assertion (LOW — already satisfied): t2 registers a new React Flow node
       type; t5 PROOF 2 asserts `.react-flow__edge` DOM presence (not just a side effect), satisfying
       the react-flow-rendering-registration audit rule. GraphNode.tsx (lines 34,102) confirms the
       <Handle> convention t2 reuses is correct.
  </audit_risk_forecast>

  <post_mortem_patterns_checked>
    Read: prog-studio-v2-2026-07-s2-party-shell.md (§5/§6 full — G1 bundle-gate latent-weight, G2
    primitive behavioral defaults, G3 git-stash; §7 "Key contracts" line 213 nav-contract handoff).
    Cross-referenced s1-G1 (corpus-fact citations) via the PM's routing_notes declarations. The plan
    honors s2-G1 (t4a measures bundle at wiring, not doc-cited), s2-G2 (t3 explicit initialFocus+role
    on the Revise Dialog; t5 asserts focus), s2-G3 (no git stash; agents do not commit). Verified on
    disk: schemas.ts AgentDetailSchema fields (all consumed names correct), party-roster.ts (13
    members returned), PartyPage.tsx (6-card cap + 2 browse targets), navigation.ts RAIL_ITEMS,
    ui-store AppMode union, ModeContent PAGE_MAP lazy pattern, GraphNode <Handle>, ui-store.test.ts
    (no AppMode switch → t4a stays at 3 files, below the 4-file mandatory-split threshold), s2 e2e
    spec browse-page assertions (L241, L305-311, L364-398). sc-precheck report: 0 findings, consistent
    with the plan authoring no locked-value/diff-gated SCs. Recurring-pattern declaration present (6
    elements) → MISSING_RECURRENCE_DECLARATION does not fire. Dependency order
    {t1∥t2∥t3}→t4a→t4b→t5 is correct (t4b needs t4a's union member; t5 needs both). No
    MISSING_RESEARCH (no external APIs). No OVERSCOPED block (t4a=3 files justified-atomic; all others
    ≤2).
  </post_mortem_patterns_checked>
</plan_critique>
