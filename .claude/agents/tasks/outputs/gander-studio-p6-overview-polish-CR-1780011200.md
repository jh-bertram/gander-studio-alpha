<plan_critique>
  <plan_id>gander-studio-p6-overview-polish</plan_id>
  <status>BLOCK</status>

  <challenges>

    <challenge>
      <type>AUDIT_RISK</type>
      <severity>BLOCKER</severity>
      <task_ref>p6-t1-timeline-buffer</task_ref>
      <description>
The fix `svg width = contentWidth + RIGHT_PAD` (plan line 47) regresses the short-session
path. In AgentTimeline.tsx line 258, `contentWidth = Math.max(containerWidth, LABEL_COL_WIDTH + contentBarArea)`.
For a short session the max resolves to `containerWidth` exactly — that floor is the explicit
mechanism (lines 256-257 comment) guaranteeing "no regression for short sessions: SVG fits the
container, no horizontal scroll." Adding RIGHT_PAD unconditionally makes
`svg width = containerWidth + 48`, which is 48px wider than the scroller div (width:100% of
container, line 363-366 `overflowX:auto`). Result: EVERY session — including tiny 2-agent ones
that previously fit perfectly — now shows a permanent horizontal scrollbar. This is the exact
short-session regression the review brief flagged and contradicts the design intent of the
contentWidth floor. SC2 ("width must be contentWidth + RIGHT_PAD") and SC7 ("svgWidth > scrollerWidth")
both actively ENFORCE the buggy behavior, so audit will pass while the regression ships.
This is the s3 §3 Refinement #2 / §4 visual-blindspot class: headless audit cannot see an
unwanted scrollbar.
      </description>
      <required_revision>
Reserve the right-edge buffer INSIDE the existing geometry instead of bolting it outside the SVG.
The implementer must satisfy: (a) final tick label fully visible, (b) rightmost/orphan bar has a
visible gap before the SVG edge, AND (c) a short session that fit without scrolling on HEAD still
fits without scrolling. Naming the constraint, not prescribing the arithmetic (audio/layout-geometry
recipe caution): the natural seam is to fold RIGHT_PAD into `contentBarAreaActual` /
`contentWidth` such that the plot area shrinks by RIGHT_PAD rather than the SVG growing by it —
e.g. keep `svg width = contentWidth` and set `contentBarAreaActual = contentWidth - LABEL_COL_WIDTH - RIGHT_PAD`
so normX(tAxisMax) lands at `contentWidth - RIGHT_PAD`, leaving the pad inside the SVG.
The implementer should read lines 249-267 with full context and choose the formulation that
preserves the zoom math (lines 253-255) and the short-session floor. Rewrite SC2 and SC7
accordingly: SC7 must NOT assert `svgWidth > scrollerWidth` (that codifies the bug) — instead
assert the rightmost tick's `x` + label half-width is ≤ the SVG right edge, and that for a
short-session fixture the scroller's `scrollWidth` does not exceed its `clientWidth`
(i.e. no horizontal overflow introduced).
      </required_revision>
    </challenge>

    <challenge>
      <type>AUDIT_RISK</type>
      <severity>WARNING</severity>
      <task_ref>p6-t1-timeline-buffer</task_ref>
      <description>
SC7's e2e assertion (`svg.getAttribute('width') > scroller.offsetWidth`) is a width-arithmetic
proxy, not a DOM-presence proof that the LABEL renders fully or that a BAR-to-edge GAP exists.
It cannot detect clipping — the precise failure mode s3 §6 G2 says headless audit is blind to
("headless audit can't see that compressed bars are unreadable"). The human caught the original
clip at Step 4.5 by eye; this spec would have passed it too.
      </description>
      <required_revision>
Add to SC7 a DOM-geometry assertion that proves the buffer: locate the final tick `<text>`
and the rightmost `timeline-bar-rect-*`, read their bounding boxes via `boundingBox()`, and
assert each `box.x + box.width <= svgBox.x + svgBox.width` with a non-zero margin. Keep the
flag for human Step-4.5 visual confirmation per s3 §6 G2 (executed, not just authored).
      </required_revision>
    </challenge>

    <challenge>
      <type>ASSUMPTION</type>
      <severity>WARNING</severity>
      <task_ref>p6-t2-agent-grouping</task_ref>
      <description>
The plan hardcodes "AR" as the base code the e2e asserts is grouped (plan lines 263-267, SC9),
on the unverified assumption that the `gander-p6-moirai-skein-skills` fixture's 22-agent roster
contains an `AR` base code with multiple `#`-suffixed iterations. Confirmed: `#`-suffixed
agent_ids including `AR#` exist broadly in the gander event logs
(docs/events/agent-events-*.jsonl). NOT confirmed: that THIS specific session's roster contains
`AR#0`/`AR#1` specifically. If the chosen fixture session's AR appears only once (or AR is absent),
the presence assertion fails or — worse — the absence-of-"AR#0" assertion passes trivially while
testing nothing. This is exactly the s2 §5/§6 G5 "e2e coupled to incidental fixture state" pattern
the PM's own routing_notes claim to have mitigated.
      </description>
      <required_revision>
Either (a) verify the actual agent roster of the resolved `gander-p6-moirai-skein-skills` session
and pin a base code that demonstrably has ≥2 iterations in it (cite the source event entries),
or (b) make the assertion roster-agnostic: assert that NO card/row in `aggregate-stats-panel`
has an `agent_id` matching `/#\d+$/`, AND that at least one card whose id appears with multiple
iterations in the source is collapsed to its bare base code. The spec must fail loudly if the
fixture lacks any multi-iteration base code, not pass vacuously.
      </required_revision>
    </challenge>

  </challenges>

  <audit_risk_forecast>
    1. The single highest risk is the short-session scrollbar regression (BLOCKER above): it will
       pass every headless gate because the SCs codify it, then surface at human Step 4.5 — the
       same path that produced s3 Refinement #2. Fix the geometry before dispatch.
    2. wall_clock_ms semantics in groupAgentsByBaseCode (plan lines 161-199) are CORRECT and do
       mirror aggregate-stats.ts: first-contributor preserves `undefined`; accumulation only writes
       when a contributor is defined (`existing.wall_clock_ms = (existing.wall_clock_ms ?? 0) + ...`),
       so an all-undefined group stays undefined and any-defined group sums only defined values.
       This is the server's Set-tracked behavior reproduced without a Set. Not a blocker; ensure the
       unit test case 5 (one undefined + two defined) asserts the sum equals only the two defined values.
    3. Adding vitest to packages/client is sound — server already pins vitest@4.1.7 with its own
       vitest.config.ts; workspace hoisting reuses the resolved v4. NOTE: the PM packet line 207
       suggests `"vitest": "^1.6.0"` — that is a version COLLISION risk against the server's v4.
       The client devDep must be `^4` to match the monorepo, not 1.6. Flagging as forecast, not a
       separate blocker; orchestrator already authorized the v4 path.
    4. AgentStatPanel/AgentStatTable interface untouched (SC11 git-diff-empty guards) is correctly
       enforced; both already accept AgentActivity[] (verified) so no schema/prop change needed.
  </audit_risk_forecast>

  <post_mortem_patterns_checked>
    - prog-studio-sessions-2026-05-s3-analyze.md: §3 Refinement #2 (timeline clip — the exact class
      this sprint addresses), §4 visual-blindspot, §5 type-honest-but-value-empty, §6 G1 (verify
      value not type), G2 (execute Tier-2 specs, not just author). All consulted.
    - prog-studio-sessions-2026-05-s2-list-edit.md: §5/§6 G5 (e2e coupled to incidental fixture
      state — applied to the t2 hardcoded-"AR" finding). Consulted.
    - agent-changelog.md: confirmed critic 4+-file BLOCKER and recurring-pattern enforcement are
      current; PM declared four recurring_pattern elements (routing_notes lines 365-369) so the
      MISSING_RECURRENCE_DECLARATION gate does not fire. OVERSCOPED 4-file rule not triggered
      (t1=1 file, t2=1 modified + 2 new disjoint).
  </post_mortem_patterns_checked>
</plan_critique>
