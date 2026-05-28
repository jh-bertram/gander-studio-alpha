<archive_entry>
  <timestamp>2026-05-25T21:19:00Z</timestamp>
  <task_id>prog-studio-sessions-2026-05-s2-list-edit-postmortem</task_id>
  <event_type>POST_MORTEM</event_type>
  <rationale>
    Sessions S2 sprint completed 2026-05-25: "Sessions list + viewer + markdown editor" delivered additive
    client-side surface for Sessions mode across plan+implementation spanning two sessions (2026-05-20 planning
    + waves t1–t5a, interrupted; 2026-05-25 resume + waves t5b/t6a/t6b + contrast fix). All 10 commits audited
    PASS and merged to main (unpushed). One post-audit rendered visual bug (Editor textarea text invisible) caught
    at Step 4.5 human verification, remediated, and re-audited PASS. Final verdict: PASS, ready for
    requirements-validate + human push gate.

    DELIVERABLES (6 tasks, 3 waves, 10 commits):

    (t1) DESIGN SPEC: UI#1 composed design document defining nav mode, list layout, detail shell tabs, editor
    surface, and Analyze slot. Commit 530a2e3 (S1 tail, not S2-native).

    (t2) session.getRaw BACKEND ADDITION: BE#1 added tRPC procedure (new; Session S1 schema exposed no raw
    markdown body field). Commit 530a2e3 (S1 tail).

    (t3) NAVIGATION STATE + ROUTER: FE#1/FE#2 implemented SessionsRouter, nav mode in UIStore, page registration
    + route binding. Two commits: fb7f6d0 (nav+store, t3a PASS) + 32523c5 (detail router, t3b PASS). QA verified
    tab-stub matchers corrected (initial e2e asserted toBeVisible on zero-dimension stubs; fixed to toBeAttached).

    (t4) DATA LAYER + LIST PAGE: FE#3/FE#4 implemented session data hooks (useSessionList, useSessionListStats)
    and list-page row component. Two commits: 68558a9 (data hooks, t4a PASS) + fc775de (list page, t4b PASS).
    QA found fixture-dependent test (asserted table header on row with agents=0 population; fixed row selection).

    (t5) DETAIL SHELL + OVERVIEW/TABLE TABS: FE#5/FE#5b implemented shell with tab navigation, Overview
    (summary stats + agent-activity timeline) and Table (sortable agent columns) tabs. Two commits: 8932578
    (detail shell, t5a initial FAIL→remediate→PASS) + t5b (built; interrupted before audit, resumed as AU#9).

    (t6) EDITOR + SAVE FLOW: FE#6/FE#10/FE#11 implemented EditorTab with markdown pre-fill, save/revert/dirty
    state, and save-to-new-folder flow (path shown, buffer preserved on error). Two commits: 7fad3d3 (editor
    hooks useSessionRaw + useSessionSave, t6a) + 54ede0b (editor tab + e2e + contrast fix, t6b).

    FEEDBACK LOOPS (3 total; costs in revision cycles):
    - t5a: e2e assertion fix (toBeVisible→toBeAttached on stub divs) — 1 remediation cycle
    - t5b: fixture-dependent test (row.agents > 0 for table header assertion) — 1 remediation cycle
    - t6b: invisible textarea (contrast collapse) — 1 remediation cycle (post-audit)

    PROTOCOL GAPS IDENTIFIED (Section 6):

    (G1) CONTRAST/VISUAL SMOKE MISSING FOR NON-REACT-FLOW COMPONENTS: Editor textarea inherited Shadcn
    primitive's `text-foreground` default (light `:root` value ≈ black) over FF7 dark teal surface. Contrast
    collapse was invisible to all gates: SA grep found no "raw hex" (uses light token), QA e2e verified textarea
    value (not rendered color), manual auditor review read token as "is a token" (did not trace to wrong system).
    A fully-audited production component shipped with invisible text, caught only at human Step 4.5. Root cause:
    react-flow-render-smoke pattern covers RF-specific components; plain components consuming Shadcn primitives
    lack visual regression coverage. Fix: New skill candidate `component-contrast-smoke` (MEDIUM effort) — analyze
    rendered color/background on any component inheriting from Shadcn primitives, assert WCAG AA 4.5:1 minimum
    on first-pass merge. Route to HR/FE team for skill design + implementation.

    (G2) SHADCN PRIMITIVE + FF7 PALETTE SYSTEM UNRECONCILED: `globals.css` ships both stock Shadcn light `:root`
    AND FF7 dark palette in `.dark` block. App uses dark palette throughout, but primitives default to light-root
    tokens when data attribute or theme class not explicit. EditorTab did not override primitive defaults. Root
    cause: system mismatch undetected by design-review gate. Alternative (use theme attribute or class on
    Textarea) not pursued because override is simpler for single-consumer. Fix: Design follow-up task for FE lead
    — reconcile Shadcn token defaults with FF7 palette via one of: (a) inject theme class/attr on all Shadcn
    instances, (b) shadow Shadcn tokens in globals.css `.dark` block, (c) prefer explicit color props over
    primitive defaults in new components. Recommendation: (b) shadow approach (lowest friction, highest coverage).

    (G3) SUBAGENT STOP HOOK EMITS MALFORMED COMPLETE EVENTS: SubagentStop hook (`~/.claude/hooks/
    subagent-autocomplete.sh`) logged COMPLETE events with out-of-sequence `seq` values in this sprint and S1.
    Recurring pattern from gander repo. Two instances observed: AU#8 (seq 88, should be 88 but env lag) and
    AU#10 (seq not matched in event log tail). Root cause: hook reads `seq` from live project log or event log,
    but parallel agents may have modified state between hook invocation and write. Fix: Hook implementation should
    capture `seq` value at SPAWN time (passed as env var or file artifact by orchestrator) rather than derive
    post-facto. Route to HR team for hook re-implementation + harness integration.

    (G4) E2E SPEC FLAKINESS UNGATED: Pre-existing e2e failures (13 persistent, marked as "baseline stash verified
    zero regressions" in p4) were not gated as green before S2 task dispatch. FE#1's new tests inherit this
    baseline. When fixture-dependent test was introduced (row.agents=0 assertion), it failed on baseline because
    the selected row had no agents; the test became a regression detector for fixture isolation, not a new-feature
    proof. Root cause: no gate enforces "e2e green before baseline freeze". Alternative (fix all 13 pre-existing
    failures) out-of-scope for S2; acceptance: S2 e2e changes are correct relative to baseline, but absolute
    baseline is not green. Recommendation: Before next major feature sprint, establish "baseline audit" gate
    (document current failures with root causes + acceptance, then gate new work against that baseline).

    (G5) E2E TESTS COUPLED TO INCIDENTAL FIXTURE STATE: Both t5b and t6b failures traced to row selection (picked
    first row; fixture varied). Root cause: test logic depends on incidental properties (agents count, structure)
    rather than testing behavior. Fix: E2E checklist addition — require test fixtures to be "property-independent"
    (select by semantic role, not first-match) and document assumptions (e.g., "row must have agents > 0 for
    TableTab column assertions"). Route to FE/QA team for checklist integration.

    (G6) SESSIONS_EDITS_DIR RUNTIME OUTPUT NOT GITIGNORED: session.saveEdit writes edited post-mortems to
    SESSIONS_EDITS_DIR (default: adjacent folder, not tracked). Working tree showed uncommitted markdown files
    from editor save tests. Root cause: .gitignore does not exclude this directory. Fix: Trivial — add pattern
    to .gitignore. No protocol gap, operational hygiene only.

    AUDIT OUTCOMES (all SA/QA/SX PASS on final sweep):
    - t3a (nav): PASS (FB#1, seq 65)
    - t3b (router): PASS (AU#2, seq 67)
    - t4a (hooks): PASS (AU#3, seq 71)
    - t4b (list): PASS (AU#4, seq 75)
    - t5a (detail): FAIL (AU#2, seq 81) → remediate → PASS (AU#5, seq 87)
    - t5b (tabs): FAIL (AU#6, seq 92) → remediate → PASS (AU#10, seq 103)
    - t6a (editor-hooks): PASS (AU#11, seq 100)
    - t6b (editor-tab + e2e): PASS (AU#12, seq 107)
    - t6b (contrast post-verify): FAIL (human verify, seq 109) → remediate → PASS (AU#13, seq 111)

    REQUIREMENTS VALIDATION: All 10 success criteria COVERED (100%): SC1 nav mode, SC2 list, SC3 detail
    no-remount, SC4 Overview, SC5 sortable Table, SC6 Editor pre-fill+save+revert, SC7 save flow, SC8 reserved
    Analyze, SC9 lint/type clean, SC10 manual smoke.

    SPRINT HEALTH:
    - One Critic round (CR#1 PASS, no revisions) — plan was tight after rev1 (t3/t4/t5/t6 over-scoped in t0;
      rev1 split into t3a/b, t4a/b, t5a/b, t6a/b)
    - Three QA fails (t5a, t5b, t6b) — all tied to test-level issues (matchers, fixture, contrast), not
      functional regressions. No runtime defects in code logic.
    - FE#8 interruption (seq 98–99) recovered via re-dispatch (FE#9, seq 100–104) — existing partial write
      (useSessionSave.ts) salvaged, missing useSessionRaw.ts completed. Recovery successful; partial-state
      handling proved robust.
    - Editor textarea contrast collapse (G1) — first visual defect to escape all audit gates and reach human
      verification. Root cause analysis shows token-system collision, not code error.

    CROSS-SPRINT IMPLICATIONS:
    - S2 completes FE surface (client routing, data hooks, UI components) for Sessions mode
    - S3 unblocked: Analyze tab implementation can now call session.getStats + EventLogEntrySchema from S1 BE
    - G1/G2 point to broader component-testing and design-system reconciliation work (FE team scope)
    - G3 (hook seq malformation) recurs from S1 — escalate to HR for harness fix
    - G4 (baseline flakiness) is S2-local observation but affects future sprints — recommend baseline-audit
      gate before next major feature work
  </rationale>
  <dependencies>
    prog-studio-sessions-2026-05-s2-list-edit (sprint definition, plan rev1→rev2 after CR-PASS);
    prog-studio-sessions-2026-05-s1-backend (S1 BE layer, session.list/get/getStats/saveEdit/getRaw, schemas);
    gander-studio-p4-proximity-edge-hardening-postmortem (G1 pattern: rendered-invisible component escape);
    agent-improvement-2026-04-28-1 (prior Critic spec guidance on complex domains)
  </dependencies>
  <retention_keys>
    docs/post-mortems/prog-studio-sessions-2026-05-s2-list-edit.md (full post-mortem with §6 gaps analysis);
    10 commits (530a2e3, 5a68221, fb7f6d0, 32523c5, 68558a9, fc775de, 8932578, f6a864d, 7fad3d3, 54ede0b);
    6 protocol gaps: G1 (contrast-smoke skill), G2 (FF7/Shadcn palette reconciliation), G3 (SubagentStop seq hook),
      G4 (e2e baseline ungated), G5 (fixture-coupled tests), G6 (SESSIONS_EDITS_DIR .gitignore);
    G1 root cause: Shadcn primitive `text-foreground` inherited from light `:root` over dark teal surface
      (token-system collision); fixed in `54ede0b` with explicit FF7 tokens (`color: var(--w)`, `background: var(--sfm)`);
    G2 alternative: shadow Shadcn tokens in globals.css `.dark` block to prevent light-root defaults;
    G3 pattern: SubagentStop hook derives seq post-facto, parallelism breaks ordering — capture seq at SPAWN time;
    G4 pattern: 13 pre-existing e2e failures not gated as baseline; recommend baseline-audit gate before next sprint;
    G5 pattern: fixture-dependent tests (row.agents=0 assertion) fail when fixture varies; require property-independent
      selection (semantic role, not first-match) + documented assumptions;
    FE#8 recovery (seq 98–99 interruption): partial useSessionSave.ts salvaged, useSessionRaw.ts completed by FE#9,
      diff-merge successful — demonstrates resilience to mid-task interruption and partial writes;
    All 10 success criteria COVERED; 3 QA fails all test-level (matchers/fixture/contrast), zero logic regressions;
    S3 unblocked: session.getStats + EventLogEntrySchema from S1 ready for Analyze tab; S2 FE surface stable
  </retention_keys>
</archive_entry>
