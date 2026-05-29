<plan_critique>
  <plan_id>gander-studio-p6-overview-polish</plan_id>
  <status>PASS</status>

  <challenges>

    <challenge>
      <type>ASSUMPTION</type>
      <severity>WARNING</severity>
      <task_ref>p6-t2-agent-grouping</task_ref>
      <description>
The t2 e2e spec instruction (packet line 351) directs the implementer to "intercept the
`session.getStats` tRPC response" to count `#`-suffixed agent_ids and prove a fold occurred.
This targets the WRONG procedure. The Sessions overview AggregatePanel is served by
`session.aggregateStats` via the `useAggregateStats` hook — confirmed at
SessionListPage.tsx:336 (`const { stats } = useAggregateStats(selectedSessionIds)`) and
useAggregateStats.ts:15 (`trpc.session.aggregateStats.useQuery(...)`). The overview never
calls `session.getStats` (that procedure feeds the per-session Analyze tab). An interception
keyed on `getStats` captures no response on this page, so the derive-expected-from-source
logic (step 5) has no data and the fold-occurred assertion (step 6) would either error or
pass vacuously — the exact s2 §6 G5 incidental-coupling failure the PM's routing_notes claim
to mitigate. The t2 SCs do not catch this: SC11-13 only check file existence, the `/#\d+$/`
pattern, and absence of "AR" — none verifies the interception targets a procedure that
actually fires.
      </description>
      <required_revision>
Change packet line 351 (and any matching SC/receipt-check) so the e2e either (a) intercepts
`session.aggregateStats` instead of `session.getStats`, or (b) asserts purely on the rendered
DOM (count distinct base-code cards, assert zero `/#\d+$/` labels, assert rendered count <
some pre-fold signal) which is endpoint-agnostic and acceptable. Note: option (b) still needs
a non-vacuous fold proof — if asserting on DOM only, derive the "≥1 fold occurred" signal from
the rendered set itself, not from a never-fired getStats response.
      </required_revision>
    </challenge>

    <challenge>
      <type>AUDIT_RISK</type>
      <severity>WARNING</severity>
      <task_ref>p6-t1-timeline-buffer</task_ref>
      <description>
Degenerate-band cosmetic edge in the rev1 geometry (does NOT re-introduce the BLOCKER
scrollbar regression — confirmed safe below). With `plotAreaWidth = Math.max(MIN_BAR_AREA,
contentBarAreaActual - RIGHT_PAD)` where MIN_BAR_AREA=600 and RIGHT_PAD=48: the floor bites
only when `contentBarAreaActual < 648`. In that band `plotAreaWidth = 600` and
`plotRight = LABEL_COL_WIDTH + 600 = 720`. Since `contentWidth = max(containerWidth,
LABEL_COL_WIDTH + contentBarArea)` and `contentBarArea` itself floors at MIN_BAR_AREA=600,
`contentWidth >= 720` always — so `plotRight <= contentWidth` in every case. At the exact
`contentBarAreaActual == 600` boundary (narrowest session), `plotAreaWidth == 600 ==
contentBarAreaActual`, so `plotRight == contentWidth`: the buffer collapses to 0px and the
final `textAnchor="middle"` tick label's right half slightly overhangs the SVG edge. This is
bounded, cannot produce a horizontal scrollbar (plotRight never exceeds svg width), and only
affects the single narrowest-session case. WARNING, not a blocker — the SC8(b) `<=` assertion
would still pass (middle-anchored label center is at the edge, not its right edge — though
the right half overhangs by ~half label width; SC8(b) reads the text box right edge, so a
600-px-exact fixture could fail SC8(b)).
      </description>
      <required_revision>
Optional hardening, not required for dispatch: the implementer may clamp the floor so the pad
never fully collapses (e.g. floor plotAreaWidth at `contentBarAreaActual - RIGHT_PAD` only when
that exceeds MIN_BAR_AREA, otherwise accept a smaller pad but keep it > 0). Alternatively, ensure
the t1 short-session SC8 fixture is NOT a pathologically narrow (~600px bar-area) session so the
boundingBox `<=` assertion has real margin. If neither is done, accept the cosmetic half-label
overhang in the single narrowest case as known-bounded.
      </required_revision>
    </challenge>

  </challenges>

  <audit_risk_forecast>
    1. The original BLOCKER (RIGHT_PAD added OUTSIDE svg width → short-session scrollbar) is
       RESOLVED. Rev1 keeps `svg width={contentWidth}` byte-identical (packet line 119), the
       `Math.max(containerWidth, ...)` floor byte-identical (lines 123-124), and folds RIGHT_PAD
       INSIDE via `plotAreaWidth = max(MIN_BAR_AREA, contentBarAreaActual - RIGHT_PAD)` /
       `plotRight = LABEL_COL_WIDTH + plotAreaWidth`. normX (line 89), tick x (line 98), orphan
       barEndX (line 107), baseline x2 (line 115) re-anchor to plotAreaWidth/plotRight. Traced:
       plotRight <= contentWidth in all cases, so svg width never exceeds the scroller — no
       scrollbar on short sessions. Zoom math (source lines 253-259) untouched: zoomLevel still
       scales contentBarArea, and plotAreaWidth is derived from contentBarAreaActual which still
       reflects zoom. Empty-state paths (source lines 189-231) untouched.
    2. The remaining live audit risk is the t2 e2e endpoint mismatch (WARNING above): a headless
       audit running the spec against getStats interception would go green while testing nothing.
       Fix the interception target before the t2 e2e audit, or the fold-proof is hollow.
    3. wall_clock_ms semantics (packet lines 265, 275-277) correctly mirror aggregate-stats.ts:
       first-contributor preserves undefined; accumulation writes only for defined contributors
       via `(existing.wall_clock_ms ?? 0) + agent.wall_clock_ms`. Ensure unit test case 5 asserts
       the sum equals only the two defined values. Not a blocker.
    4. AgentStatPanel/AgentStatTable interfaces: SC14 git-diff-empty guards enforced; both already
       accept AgentActivity[] so grouping is display-only. Instance-count badge correctly deferred
       (packet lines 354-357) — no gold-plating. Clean.
  </audit_risk_forecast>

  <post_mortem_patterns_checked>
    - prog-studio-sessions-2026-05-s3-analyze.md (§3 Refinement #2 timeline-clip, §4 visual
      blindspot, §6 G1 verify-value-not-type, G2 execute-Tier-2): the BLOCKER class is the same;
      rev1's boundingBox + scrollWidth e2e (SC8) directly addresses G2. PM read source lines
      before writing geometry (G1).
    - prog-studio-sessions-2026-05-s2-list-edit.md (§6 G5 e2e coupled to incidental fixture
      state): applied to the t2 endpoint-mismatch WARNING — intercepting getStats is the same
      coupling failure in a new guise.
    Both consulted. MISSING_RECURRENCE_DECLARATION gate does not fire: PM declared four
    recurring_pattern elements (routing_notes lines 479-482). OVERSCOPED 4-file rule not
    triggered: t1 = 1 modified + 1 new spec; t2 = 1 modified + 4 new (group-agents.ts,
    .test.ts, vitest.config.ts, e2e spec) + package.json — all disjoint, no single existing
    surface crosses 4 files of new logic.
  </post_mortem_patterns_checked>
</plan_critique>
