<plan_critique>
  <plan_id>gander-studio-p10-deferred-smalls (rev1)</plan_id>
  <status>PASS</status>

  <challenges>
    <!-- All CR#1 blockers and warnings resolved by rev1. No new defects. Empty challenge list. -->
  </challenges>

  <resolution_confirmation>
    Re-gate of rev1 against CR#1 (CRITIQUE_BLOCK, CR-1783019352). Each item confirmed:

    1. BLOCKER RESOLVED (006 SC#4 self-defeating). rev1 adopts CR option (a). SC#4 (line 183) now
       asserts the three LIVE sites (33/183/325) are updated to #e05555/5.22:1/AA and DR-D exists, and
       adds an explicit HISTORICAL-RECORD EXCEPTION: `#cf3c3c`/`4.07:1` MAY appear ONLY inside the
       Decision Record D block, enforced by a containment check (`grep -n '#cf3c3c\|4\.07:1' DESIGN.md`
       returns only DR-D line numbers; any occurrence outside DR-D FAILs). CHANGE 2 (line 175) now
       explicitly states DR-D SHOULD preserve the superseded value verbatim and that those literals
       inside DR-D are expected/permitted. must_not_contain (line 212) re-scoped to "at the three live
       sites (outside DR-D)". The self-defeating pair is gone — the deliverable (DR-D with old literals)
       and the SC (count-0 at live sites, permitted in DR-D) are now mutually satisfiable.

    2. WARNING 1 RESOLVED (003 SC#4 non-discriminating grep). SC#4 (line 31) replaces the pre-existing
       token grep with a discriminating check: TooltipState declares numeric `feedbackLoops` +
       `auditOutcome`, grep shows `feedbackLoops` across interface/derivation/render (>=3 hits), a
       display-local comment is present, PLUS an explicit QA runtime auditor duty to confirm the panel
       renders the rows — with an explicit instruction NOT to accept the bare `'AUDIT_FAIL'`/
       `'CRITIQUE_BLOCK'` token presence (pre-existing in the switches) as proof.

    3. WARNING 2 RESOLVED (stale-closure). Now a HARD CONSTRAINT: CHANGE-4 (line 21) mandates computing
       `feedbackLoops`/`auditOutcome` at the bar-group call site from row-local `agentMarkers`, extending
       the `showTooltip` signature, and forbids referencing `markersByAgent` inside the empty-dep
       `showTooltip` useCallback. Enforced by SC#6 (line 33), out_of_scope (line 51), and must_not_contain
       (line 67). VERIFIED FACTUAL ACCURACY: `const agentMarkers = markersByAgent.get(bar.agentId) ?? []`
       is at AgentTimeline.tsx line 986 — in scope at the onMouseEnter/onFocus call site (line 1030-1031)
       and before the bar `<g>` (1024). CHANGE-4's line reference (~986) is exact; the constraint is
       implementable as written.

    4. WARNING 3 RESOLVED (runtime a11y). New SC#8 (line 35) names a Tier-2/a11y runtime assertion
       (Playwright acceptable) as an explicit a11y-auditor duty: on focus the active `<g>` gains
       `aria-describedby="timeline-tooltip"` and retains its accessible name (aria-label); on blur the
       attribute is absent; no double-announce. Reinforced by the RUNTIME-A11Y note in dependency_order
       (line 225). Correctly scoped as an auditor duty, not a mandatory-Playwright BLOCKER (the tooltip
       interaction pre-exists).

    5. WARNING 4 RESOLVED (006 SC#2 case-sensitivity). SC#2 (line 181) re-anchored on the new annotation
       text: `grep -n '5.22:1'` present on the --destructive line AND `grep -in 'resolved'` present, with a
       secondary case-insensitive `grep -ci 'below aa' == 0`. VERIFIED: "below AA" (case-insensitive)
       occurs ONLY at globals.css line 357 — the exact line the FE rewrites — so the case-insensitive
       count-0 is achievable; the new annotation example (line 163) contains both "5.22:1" and "resolved".

    6. NO NEW DEFECTS. Scanned all amended SCs:
       - 006 SC#1 (globals.css `#cf3c3c` == 0): globals.css contains no Decision Record, so the old value
         is fully removed from both edited lines (21, 357). Satisfiable, no tension with SC#4's DR-D
         exception (that exception is DESIGN.md-only).
       - 006 SC#4 containment check is an auditor line-range judgment, not a mechanical count that would
         re-contradict DR-D content. The "#e05555 and 5.22:1 present at/near 33/183/325" positive check is
         consistent (line 33 is a hex-only Color Tokens row; 5.22:1 lives at 183/325 — "at/near" phrasing
         accommodates this).
       - 003 SC#3 ("new Date(bar.completeTs" present) remains satisfiable via the
         `bar.isOrphan ? 'in progress' : new Date(bar.completeTs)...` branch.
       - 003 SC#6 (`markersByAgent` absent inside the useCallback body) is a scoped-block check;
         markersByAgent legitimately remains at line 776 (build) and line 986 (call-site derivation).
         No contradiction.
       No amended SC forbids a character its locked deliverable value contains.

    Carried forward from CR#1 (unchanged by rev1, still stand): FF7TooltipPanel enrichment scope; matchesSlug
    location + canonical path (packet 004 now records the no-`parsers/` path explicitly); #e05555 = 5.22:1
    contrast; destructive-surface regression guard (text-destructive on bg-destructive/10, no white-on-solid-red);
    GATE-TEST 004 satisfiability; recurrence declaration present; OVERSCOPED file-counts (1/2/2).
  </resolution_confirmation>

  <audit_risk_forecast>
    Highest residual audit-time attention (not blockers, executed-well plan still needs these verified live):
    1. Packet 006: the auditor must apply SC#4 as a CONTAINMENT check (old literals only inside DR-D), not a
       naive whole-file `grep -c == 0` — a mechanical auditor running the old-style count would false-FAIL the
       legitimate DR-D historical record. The SC text now states this; ensure the auditor honors it.
    2. Packet 003: the aria-hidden -> role="tooltip" a11y-tree change (SC#8) is only provable at runtime —
       confirm active-only aria-describedby toggling and no accessible-name loss/double-announce; grep (SC#7)
       cannot prove the toggle.
  </audit_risk_forecast>

  <post_mortem_patterns_checked>
    Re-review scoped to CR#1 delta per ORC instruction. Locked-line SC consistency (gander-meta-onboard-skill
    §6) re-scanned across all amended 006 SCs — the DR-D self-defeating pair is resolved and no adjacent SC
    reintroduces it. sc-precheck was clean in round 1; the DR-D defect was outside its extraction class and is
    now fixed at the SC level. Recommend ORC re-run the mechanical sc-precheck on rev1 pre-dispatch (PM has no
    Bash; noted in routing_notes line 260) as the standing Critic-gate belt-and-suspenders — not a blocker.
  </post_mortem_patterns_checked>
</plan_critique>
