# Audit Verdict — prog-studio-v2-2026-07-s4-retirement-navshell-rem

Auditor: AUD#4 (spawned by ORC#0, SPAWN seq 16). Independent of FE#4 (implementer, SPAWN seq 14). Task_id first-SPAWN 2026-07-11 (UTC) → post-cutover → v2.0 typed envelope (mechanical, date-governed). NOT meta-agent work (edit is a client e2e spec, not `.claude/agents|skills|rules`), so the Meta-Agent Independence INDETERMINATE rule does not apply; a distinct-spawn PASS is meaningful here.

## Load-bearing adjudication: FE#4's causal trace vs AUD#3's rail attribution
I judged on evidence, not authorship, per the independence note. FE#4 CONTRADICTS AUD#3 (whose SPAWN note attributed the red to "FE-1a global rail tab stops"). The evidence supports FE#4:

1. **DOM order (AppShell.tsx L11-18):** `Header → <div.app-shell-rail><SubmenuRail/></div> → ModeContent → BottomTabBar`. The global rail sits BEFORE ModeContent, and `detail-back`/`revise-spec-trigger` live inside AgentDetailPage inside ModeContent. A forward-only Tab traversal that STARTS by focusing `detail-back` (spec L368-369) therefore never re-enters the rail before reaching the trigger — the rail contributes zero tab stops on this path. AUD#3's "rail interposes stops between back and trigger" mechanism is structurally impossible for this traversal. DISPROVEN.
2. **Live sort (party-roster.ts:172 `members.sort(byActivityRecencyDesc)`, comparator L130-135):** members are ordered by `lastActivityTs` desc over real event-log data — time-varying, not a static fixture. `openAgentDetail(page, 0)` opens whichever agent is most-recently-active at run time. This is the "first-row fixture coupling" that fully explains the intermittent green/red history across sessions.
3. **Uncapped graph (RelationshipPanel.tsx `buildRelationshipGraph` L97-134):** one center node + one node per `relationships[]` entry + one edge per entry, with NO cap/slice. A heavily-connected agent (orchestrator) legitimately produces dozens of focusable RF nodes, and the old fixed `40`-press bound undercounts (measured 55 required). Confirmed.

Conclusion: the rail is NOT implicated. FE#4's fixture-coupling + uncapped-graph root cause is correct.

## Assertion-strength analysis (the SA gate's central question)
The new bound `tabBound = Math.max(40, rfFocusableCount + 20)` is NOT assertion-weakening/vacuous:
- The terminal assertion is unchanged: `expect(reached).toBe(true)` (L399) — the trigger MUST receive focus via Tab. A focus trap or an unreachable/`tabindex=-1` trigger leaves `reached=false` and FAILS regardless of bound size.
- The bound scales ONLY with the relationship panel's own `.react-flow__node` + `.react-flow__edge` count (scoped to `detail-relationship-panel`, L386-390), plus a FIXED `+20` margin — not "whatever the DOM contains." Any regression that inserts >20 NON-RF tab stops between `detail-back` and the trigger (e.g. a genuine rail regression, or an accidental focusable interposition) still overflows the bound and FAILS. The margin is a bounded, documented slack, not an open-ended stretch.
- Actionability is still asserted beyond reachability: Enter opens the dialog (L403-404, `[role=dialog][aria-modal=true]` visible), Escape closes it (L405-406), and Enter on Back-to-party returns to `party-page` (L408-410). The test proves the trigger is operable, not merely that N presses occurred.
- The `Math.max(40, …)` floor preserves the original behavior for the empty/small-graph case (backward compatible).

## Scope
Working-tree `git diff HEAD` shows many modified/deleted files (AppShell, SubmenuRail, ComposePage deletions, etc.) — these are the already-audited FE-1a/FE-1b/FE-2 diffs of this same sprint (sequential single-file/multi-task sprint scope rule). FE#4's OWN delta is exactly `packages/client/tests/e2e/prog-studio-v2-2026-07-s3-drilldowns.spec.ts` at **+20/-2**, confined to the `:362` a11y test body. AppShell.tsx / SubmenuRail.tsx carry FE-1a self-labels, not s4-rem markers — consistent with FE#4's "read but not edited" claim. No product code touched by this task.

## Verification evidence
- `npm run lint` (tsc --noEmit shared→server→client): **EXIT 0**.
- s3-drilldowns spec, serial (`--workers=1`), against live dev server (5173 + tRPC 3001 both up): **8 passed (40.6s)**, including `:362` (this fix) and `:158` PROOF 3a (green at capture, matches re-classified baseline).
- Interaction-class SC (keyboard Tab/Enter) adjudicated via the actual HEADLESS e2e run (audit-pipeline §2.3(b) run evidence), NOT the read-only MCP Playwright set — a legitimate PASS basis.

<audit_verdict schema_version="2.0">
  <task_id>prog-studio-v2-2026-07-s4-retirement-navshell-rem</task_id>
  <provenance_marker>audit-pipeline@2.0.0</provenance_marker>
  <auditor_spawn>
    <agent_id>AUD#4</agent_id>
    <parent>ORC#0</parent>
    <independent_from>FE#4</independent_from>
  </auditor_spawn>
  <inputs>
    <input path="packages/client/tests/e2e/prog-studio-v2-2026-07-s3-drilldowns.spec.ts" sha256="a7d0c600a5612cd0f955929ec585c749c3a82184cb9574e00207c1d06d55c3d5"/>
    <input path=".claude/tasks/outputs/prog-studio-v2-2026-07-s4-retirement-navshell-rem-FE-1783736674.md" sha256="dd8e5cac436b7bd0d6d39f6968f2b8c1208facd0c2c2cc11d1f288bdb4582b6c"/>
  </inputs>
  <sa status="PASS">
    <target_file>packages/client/tests/e2e/prog-studio-v2-2026-07-s3-drilldowns.spec.ts</target_file>
    <scope_note>Delta = exactly the named spec file, +20/-2, confined to the :362 a11y test body. Other working-tree changes are already-audited FE-1a/FE-1b/FE-2 diffs (sequential multi-task sprint scope rule). No product code touched.</scope_note>
    <assertion_strength>NOT vacuous. Terminal assertion `expect(reached).toBe(true)` unchanged — a focus trap or unreachable trigger still FAILS. Bound scales only with the scoped relationship-panel node+edge count + a FIXED +20 margin; any >20 non-RF tab-stop interposition (incl. a genuine rail regression) still overflows and FAILS. Actionability still asserted (Enter opens dialog, Escape closes, Enter on back returns to party). Math.max(40,…) floor preserves small-graph behavior.</assertion_strength>
    <violations>NONE — no raw hex, no Zod-boundary need (test spec), naming conventions clean, single new numeric literal (20) documented inline with rationale, no DRY violation. Inline comment accurately documents the root cause and explicitly records the NOT-a-rail-regression finding.</violations>
  </sa>
  <qa status="PASS">
    <root_cause_adjudication>FE#4's fixture-coupling + uncapped-graph trace VERIFIED against source; AUD#3's rail attribution DISPROVEN. AppShell DOM order Header→Rail→ModeContent (rail precedes detail-back; zero stops on forward-only path). party-roster.ts:172 byActivityRecencyDesc is a live time-varying sort. RelationshipPanel buildRelationshipGraph renders N+1 nodes + N edges uncapped.</root_cause_adjudication>
    <lint>npm run lint (shared→server→client tsc --noEmit) — EXIT 0</lint>
    <playwright>
      <tier>2</tier>
      <tests_run>8</tests_run>
      <passed>8</passed>
      <failed>0</failed>
      <run_note>s3-drilldowns.spec.ts, --workers=1 serial, live dev server (5173 + tRPC 3001). :362 (this fix) PASS; :158 PROOF 3a green (matches re-classified baseline). Interaction-class SC adjudicated on headless e2e run evidence (§2.3(b)), not read-only MCP observation.</run_note>
    </playwright>
    <defects>NONE</defects>
  </qa>
  <sx status="SECURE">
    <threat_level>LOW</threat_level>
    <findings>NONE — test-only change (+20/-2) in one e2e spec. No product code, routes, inputs, secrets, auth surface, or data flow touched. No API boundary modified.</findings>
  </sx>
  <overall_status>PASS</overall_status>
</audit_verdict>
