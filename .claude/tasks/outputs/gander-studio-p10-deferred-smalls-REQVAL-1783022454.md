# Requirements Coverage Report — gander-studio-p10-deferred-smalls

> **Validator:** RV#1 (requirements-validate, Mode B — independent)
> **Date:** 2026-07-02
> **Sprint:** gander-studio-p10-deferred-smalls
> **Requirement sources:**
> 1. Human request (verbatim): "do we have things to do in various places? let's do them all" — ORC-scoped to the three open unblocked deferred items in gander-studio-alpha (DEFERRED-003, DEFERRED-004, DEFERRED-006; DEFERRED-P9-1 and DEFERRED-001 explicitly out of scope).
> 2. Critic-passed decomposition (rev1): `.claude/tasks/outputs/gander-studio-p10-deferred-smalls-rev-PM-1783019756.md`
> 3. Ledger wording: `docs/deferred-work.md` lines 50-62 (003/004), 17-22 (006)
>
> **Method note:** All evidence line numbers below were independently re-verified on the live
> working tree by RV#1 (Read + grep), not merely transcribed from packets. Audit quality was
> NOT re-adjudicated (all gates already PASS); this report validates requirements coverage only.

<requirements_coverage_report>
  <sprint_id>gander-studio-p10-deferred-smalls</sprint_id>
  <overall_status>COVERED</overall_status>
  <summary>
    <total_requirements>17</total_requirements>
    <covered>17</covered>
    <partial>0</partial>
    <missing>0</missing>
  </summary>

  <!-- ================= DEFERRED-003 — rich tooltip ================= -->

  <requirement id="R-001" status="COVERED">
    <text>Tooltip shows exact spawn and complete timestamps (ledger: "exact spawn/complete timestamps"; packet 003 CHANGE-1); orphan bars render completion as "in progress"; existing relative-offset/duration rows retained.</text>
    <evidence>
      packages/client/src/components/sessions/AgentTimeline.tsx:525 (`new Date(bar.spawnTs).toLocaleTimeString()`), :528-529 (orphan → 'in progress' else `new Date(bar.completeTs).toLocaleTimeString()`).
      Runtime-proven: packages/client/tests/e2e/s3-t3-timeline.spec.ts:263 test asserts live tooltip textContent matches `/spawned:\s*\d{1,2}:\d{2}:\d{2}/` and `/completed:\s*in progress/` — green per gap2 packet run output (.claude/tasks/outputs/gander-studio-p10-deferred-smalls-003-gap2-FE-1783021048.md §3, tests 6-9 passed) and AUD#1 round-2 verdict (.claude/tasks/outputs/gander-studio-p10-deferred-smalls-003-reaudit-AUD-1783022289.md, SC#4-runtime PASS).
    </evidence>
  </requirement>

  <requirement id="R-002" status="COVERED">
    <text>Tooltip shows a feedback-loop count (ledger: "feedback-loop count"); display-local derivation with explicit not-SEAM-04 comment; TooltipState gains numeric feedbackLoops field (SC#4).</text>
    <evidence>
      AgentTimeline.tsx:116 (`feedbackLoops: number` on TooltipState), :520 (destructure), :626 (rendered `loops:` row), :701/:704 (extended showTooltip params/setter). Display-local comment confirmed by AUD#1 round 1 (003-AUD-1783020529.md, SC#4 PASS-static, L113-115 comment cited).
      Runtime render (not bare token grep, per SC#4 AUDITOR DUTY): s3-t3-timeline.spec.ts:263 asserts `/loops:\s*\d+/` on live tooltip textContent — DOM-presence assertion, green (gap2 packet §3; reaudit SC#4-runtime gate CLOSED/PASS).
    </evidence>
  </requirement>

  <requirement id="R-003" status="COVERED">
    <text>Tooltip shows audit attribution as an audit OUTCOME derived from AUDIT_PASS/AUDIT_FAIL markers, typed 'pass'|'fail'|'mixed'|'none', rendered as an `audit:` line (SC#5; ledger "audit attribution" as scoped by the decomposition).</text>
    <evidence>
      AgentTimeline.tsx:119 (`auditOutcome: 'pass' | 'fail' | 'mixed' | 'none'`), :633-642 (rendered `audit:` row with four-state token coloring), :1054 (row-local derivation `rowAuditOutcome`).
      Runtime: s3-t3-timeline.spec.ts:263 asserts `/audit:\s*(none|pass|fail|mixed)/` on live textContent; fixture agent AUD#1 has AUDIT_PASS → non-'none' outcome exercised (gap2 packet §2). Green per reaudit round-2 PASS.
    </evidence>
    <note>See interpretation note I-1 on auditor IDENTITY.</note>
  </requirement>

  <requirement id="R-004" status="COVERED">
    <text>Stale-closure hard constraint (SC#6, CR#1 W2): feedbackLoops/auditOutcome computed at the bar-group render call site from row-local agentMarkers; passed into an EXTENDED showTooltip signature; markersByAgent never referenced inside the empty-dep showTooltip useCallback (pure setter).</text>
    <evidence>
      AgentTimeline.tsx:690 (comment: "showTooltip is a PURE SETTER: feedbackLoops/auditOutcome are computed by the ..."), :701-704 (extended signature + pure setTooltipState), :1054 (call-site derivation). AUD#1 round-1 SC#6 PASS with independent grep: zero markersByAgent references inside the callback body L695-707 (003-AUD-1783020529.md).
    </evidence>
  </requirement>

  <requirement id="R-005" status="COVERED">
    <text>Accessible tooltip wiring (SC#7): panel root role="tooltip" + stable id="timeline-tooltip" (aria-hidden removed from root); active bar &lt;g&gt; carries aria-describedby="timeline-tooltip" only while active; aria-label={barAriaLabel} preserved.</text>
    <evidence>
      AgentTimeline.tsx:538-540 (role="tooltip", id="timeline-tooltip", data-testid preserved on panel root), :1106 (aria-label={barAriaLabel} preserved), :1107 (aria-describedby={isActiveTooltipBar ? 'timeline-tooltip' : undefined}). AUD#1 round-1 SC#7 PASS (grep -c role="tooltip" == 1; root aria-hidden removed).
    </evidence>
  </requirement>

  <requirement id="R-006" status="COVERED">
    <text>Runtime a11y verification (SC#8, CR#1 W3): a Playwright/e2e assertion proves that on bar focus/hover the active &lt;g&gt; gains aria-describedby="timeline-tooltip" AND retains its original accessible name; aria-describedby absent on blur/mouseleave.</text>
    <evidence>
      s3-t3-timeline.spec.ts:286 (SC-tooltip-aria-hover: absent-before → present-during with labelDuring === labelBefore → absent-after mouseout), :315 (SC-tooltip-aria-focus: same toggle via focus/blur), :332 (SC-tooltip-role: role + id attributes). All DOM-presence/attribute assertions (toHaveAttribute, hasAttribute evaluate, toHaveCount(0)) — qualifying class per Step 2.5; side-effect-only assertions not relied on. 4/4 green in the pasted `npx playwright test` output (gap2 packet §3, tests 6-9) and re-adjudicated by AUD#1 round 2: SC#8-runtime gate CLOSED, QA PASS (003-reaudit-AUD-1783022289.md).
    </evidence>
  </requirement>

  <requirement id="R-007" status="COVERED">
    <text>003 constraints: tsc --noEmit clean ×3 + client build passing (SC#1-2); no new npm dependency (SC#9); data-testid="timeline-tooltip" preserved (SC#10); no raw hex (SC#11); existing e2e selectors unregressed (SC#12); sole edit target AgentTimeline.tsx (gap round added only the test file).</text>
    <evidence>
      003-FE-1783020173.md &lt;verification&gt; (tsc ×3 clean, build "✓ built in 10.26s", package.json diff empty, raw-hex 0 matches); AgentTimeline.tsx:540 (testid preserved — verified live). AUD#1 round-1 SA PASS SC#9/10/11 + scope_note (diff touches only AgentTimeline.tsx for this packet); round-2 gap_round_note (only s3-t3-timeline.spec.ts added, no src file).
    </evidence>
  </requirement>

  <!-- ================= DEFERRED-004 — slug matcher guard ================= -->

  <requirement id="R-008" status="COVERED">
    <text>Anchored predicate (SC#1; ledger: "anchor to task_id === slug || task_id.startsWith(slug + '-')"): matchesSlug rewritten; old `.includes(slug)` substring branch removed.</text>
    <evidence>
      packages/server/src/session-slug-match.ts:14-15 — `return taskId === slug || taskId.startsWith(slug + '-');` (verified live by RV#1; no `.includes(slug)` remains — only unrelated startsWith calls in sprintRoot at :77-91, untouched). AUD#2 SA PASS SC#1 (004-AUD-1783020529.md).
    </evidence>
  </requirement>

  <requirement id="R-009" status="COVERED">
    <text>Stale assertion fixed (SC#4): line-209 over-match assertion flipped to .toBe(false) with it() description updated to describe over-match rejection.</text>
    <evidence>
      packages/server/src/parsers/__tests__/session-list.test.ts:208-210 — `it('rejects generic substring over-match', ...)` asserting `matchesSlug('some-task-with-gander-in-it', 'gander')).toBe(false)` (verified live). AUD#2 QA PASS SC#4.
    </evidence>
  </requirement>

  <requirement id="R-010" status="COVERED">
    <text>New guard assertions in the SAME `matchesSlug — unit` describe block (SC#3; ledger: "a unit test"): exact match true; boundary-prefix true; p2-vs-p20 phase over-match false; generic-substring false. No new test file.</text>
    <evidence>
      session-list.test.ts:204 (existing describe block extended), :214-215 (exact match true), :217-218 (boundary-prefix true), :220-221 (p2-vs-p20 false), :208-210 (generic-substring false). Pre-existing assertions still hold (:205-206 prefix true; :211-212 unrelated false). AUD#2 SA notes confirm no untracked standalone test file (DRY honored).
    </evidence>
  </requirement>

  <requirement id="R-011" status="COVERED">
    <text>004 gates: vitest GREEN (GATE-TEST, close-blocking — actual run, not file presence); tsc clean ×3 (SC#5); exactly two files modified for this packet (SC#6).</text>
    <evidence>
      004-BE-1783020173.md &lt;test_traceback&gt; — pasted vitest output "Test Files 12 passed (12) / Tests 141 passed (141)"; independently RE-RUN by AUD#2: 141/141 GREEN (004-AUD-1783020529.md QA SC#2 MET). Scoped diff = exactly session-slug-match.ts + session-list.test.ts; event-log-parser.ts/router.ts/sprintRoot/isDocumented byte-identical to HEAD (AUD#2 SA SC#6 MET; BE packet scope note attributes remaining working-tree changes to parallel packets 003/006).
    </evidence>
  </requirement>

  <!-- ================= DEFERRED-006 — --redb WCAG AA ================= -->

  <requirement id="R-012" status="COVERED">
    <text>Token remediation (SC#1-2; ledger: "Lighten --redb to approximately #e05555 (≥4.5:1 on --void)"): globals.css --redb set to #e05555; #cf3c3c fully gone from globals.css; line-357 annotation states 5.22:1 + resolved; no case-insensitive "below aa" remains.</text>
    <evidence>
      packages/client/src/globals.css:21 (`--redb: #e05555;`), :357 (`--destructive: var(--redb); /* #e05555 — 5.22:1 on --void (AA for normal text; DEFERRED-006 resolved) */`). RV#1 grep: `#cf3c3c` count 0; `grep -ci 'below aa'` == 0. AUD#3 SA SC#1/SC#2 PASS (006-AUD-1783020529.md).
    </evidence>
  </requirement>

  <requirement id="R-013" status="COVERED">
    <text>Contrast math re-derived in the packet (SC#3): #e05555 on #070d0c ≥ 4.5:1 (≈5.22:1) with WCAG method + intermediate luminances shown.</text>
    <evidence>
      006-FE-1783020173.md &lt;contrast_pairs&gt; — method, intermediate luminances (--void L≈0.003601; --redb L≈0.230004), ratio 5.22:1, PASS AA. Independently re-derived by AUD#3: 5.2245 ≈ 5.22:1 (006-AUD contrast_rederivation independent="true").
    </evidence>
  </requirement>

  <requirement id="R-014" status="COVERED">
    <text>DESIGN.md doc-sync (SC#4, CR#1 BLOCKER fix): three live sites updated to #e05555/5.22:1/AA; Decision Record D appended; old literals #cf3c3c/4.07:1 contained ONLY inside DR-D.</text>
    <evidence>
      DESIGN.md:33 (--color-error = #e05555), :183 (DR-A --destructive = #e05555 / 5.22:1 / AA, DEFERRED-006 resolved), :325 (DR-B Destructive row = #e05555 / 5.22:1 / AA), :405 (DR-D heading "## Decision Record D — DEFERRED-006 --redb Contrast Remediation (p10, 2026-07-02)"). RV#1 containment grep: `#cf3c3c|4\.07:1` hits ONLY at :407, :410, :417 — all after the :405 DR-D start, zero occurrences at live sites. Matches AUD#3 SA SC#4 PASS (containment, not naive count-0).
    </evidence>
  </requirement>

  <requirement id="R-015" status="COVERED">
    <text>Regression guard (SC#5, CHANGE-3): destructive surface confirmed text-destructive on bg-destructive/10 (text/tint only — no white-on-solid-red pairing that lightening would degrade); recorded in contrast_pairs.</text>
    <evidence>
      006-FE-1783020173.md &lt;regression_guard&gt; — button.tsx lines 18-19 `bg-destructive/10 text-destructive`, result NO REGRESSION (lightening raises text/tint contrast; AgentTimeline graphical markers need only 3:1, cleared). Independently confirmed by AUD#3 sc5_regression_guard PASS. No STOP-and-flag condition arose.
    </evidence>
  </requirement>

  <requirement id="R-016" status="COVERED">
    <text>006 scope guards (SC#6-7): --red (#a12d2d), --mr (#e74c3c), and the --destructive: var(--redb) mapping unchanged; no --redb-* variant introduced; tsc clean ×3 + client build passing.</text>
    <evidence>
      globals.css:357 mapping still `var(--redb)` (verified live). AUD#3 SA SC#7 PASS (--red L20, --mr L27, mapping byte-for-byte unchanged; --materia-red nonexistent → N/A; git diff = exactly the two intended line changes). Build/typecheck: 006-FE packet verification block (tsc ×3 exit 0; vite build exit 0), corroborated by AUD#3 QA test_coverage.
    </evidence>
  </requirement>

  <!-- ================= Sprint-level ================= -->

  <requirement id="R-017" status="COVERED">
    <text>Human request "let's do them all": all three in-scope deferred items (003, 004, 006) delivered and closed through the full gate stack; DEFERRED-P9-1 and DEFERRED-001 correctly excluded per ORC scoping.</text>
    <evidence>
      All three packets delivered (003-FE-1783020173.md + 003-gap2-FE-1783021048.md; 004-BE-1783020173.md; 006-FE-1783020173.md). Audit gates: 003 = SA PASS / QA PASS / SX SECURE (round-2 PASS after round-1 INDETERMINATE runtime-gate closure — 003-reaudit-AUD-1783022289.md); 004 = PASS (004-AUD-1783020529.md); 006 = PASS (006-AUD-1783020529.md). Decomposition verbatim_deliverable_audit maps every request phrase to a task (rev-PM-1783019756.md lines 263-275). No in-scope item skipped; no out-of-scope item worked.
    </evidence>
  </requirement>

  <notes>
    <interpretation id="I-1" type="intentional_exclusion — NOT counted as MISSING">
      The deferred-work ledger's DEFERRED-003 wording includes "audit attribution for that agent."
      The Critic-passed decomposition explicitly scoped this to audit OUTCOME from available
      AgentMarker data and declared auditor IDENTITY (who performed the audit) out of scope:
      verbatim_deliverable_audit row "rich tooltip — auditor IDENTITY (who audited)" →
      out_of_scope reason "auditor identity not on AgentMarker (agentId,ev,ts,seq,edgeLabel);
      data-plumbing exceeds a bounded small-sprint item — flagged for follow-up if the ledger
      requires named-auditor display" (rev-PM-1783019756.md line 273; also packet 003
      out_of_scope + description item 3). Delivered scope matches the authoritative decomposition
      exactly; recorded here as an interpretation note per validator instructions. If named-auditor
      display is still wanted, it needs a new deferred-work entry (data plumbing on AgentMarker).
    </interpretation>
    <note id="N-1" type="environmental — out of sprint scope">
      5 pre-existing tests in s3-t3-timeline.spec.ts fail against the live env due to fixture
      sessions aging out of session.list's hardcoded top-50 window — root-caused as pre-existing
      staleness, orthogonal to all three packets, and routed to deferred-work (DEFERRED-P10-1)
      per AUD#1 round-2 advisory (blocking="false"). Does not affect coverage of any requirement.
    </note>
    <note id="N-2" type="runtime-evidence class">
      Step 2.5 qualification: the 4 new e2e tests assert live tooltip textContent
      (toMatch on loops:/audit:/spawned:/completed:), attribute presence/absence
      (toHaveAttribute / hasAttribute / toHaveCount(0)), and role/id attributes — all
      DOM-presence-class assertions, not side-effect-only. Runtime criteria R-001/R-002/R-003/R-006
      therefore rest on qualifying evidence.
    </note>
  </notes>
</requirements_coverage_report>
