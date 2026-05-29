# AUDIT VERDICT — gander-studio-p6-overview-polish
auditor: AUDITOR (Opus) — independent spawn, distinct from FE#1 (p6-t1) and FE#2 (p6-t2)
generated: 2026-05-28
mode: live (Playwright + vitest + curl + npm audit executed against running :3001/:5173)
verdict summary:
  p6-t1-timeline-buffer  → SA PASS | QA PASS | SX SECURE  → OVERALL PASS
  p6-t2-agent-grouping   → SA PASS | QA PASS | SX SECURE  → OVERALL PASS

================================================================================
## TASK p6-t1-timeline-buffer
================================================================================

<audit_review>
  <target_file>packages/client/src/components/sessions/AgentTimeline.tsx</target_file>
  <status>PASS</status>
  <violations/>
  <notes>
  - RIGHT_PAD=48 constant added in layout block (SC1 ✓). plotAreaWidth + plotRight derived
    in render after contentBarAreaActual (SC2 ✓). svg width={contentWidth} byte-identical —
    no `+ RIGHT_PAD` (SC3 ✓). normX scales by plotAreaWidth (SC4 ✓). tick x = frac*plotAreaWidth
    (SC5 ✓). orphan barEndX uses plotRight (SC6 ✓). axis baseline x2 uses plotRight. No raw hex
    introduced (SC9 ✓). TS strict, full annotations, no `any`. Diff is exactly the planned 23 lines.
  - INFO (out-of-brief tAxisMax change, line 243-246): FE#1 changed
    `Math.max(...allCompleteTs)` → `Math.max(maxComplete, maxSpawn)`. Verified correct and
    non-regressive: (a) claim is valid — an agent spawning after the last COMPLETE has
    spawnTs > maxComplete and would map past plotRight; including maxSpawn covers it.
    (b) No regression: when no late spawn exists, maxSpawn ≤ maxComplete so the expression
    equals maxComplete — identical to HEAD for every existing session. Adaptive-unit
    (deriveUnit(tAxisRange)), tick labels, and zoom (rangeSeconds = tAxisRange/1000) only
    change when tAxisRange grows, which only happens in the previously-buggy late-spawn case.
    (c) tAxisRange = tAxisMax - tAxisMin || 1 is still ≥ 0 and the `|| 1` guard is intact
    (tAxisMax ≥ tAxisMin = minSpawn always). This is mild scope creep but furthers the brief's
    geometry intent and is cleanly validated. Not a FAIL — logged as advisory for the record.
  </notes>
</audit_review>

<test_report>
  <task_id>p6-t1-timeline-buffer</task_id>
  <status>PASS</status>
  <test_coverage>e2e 3 passed, 0 failed</test_coverage>
  <playwright>
    <tier>2</tier>
    <tests_run>3</tests_run>
    <passed>3</passed>
    <failed>0</failed>
    <playwright_output>6 passed (9.1s) — combined run with p6-t2. p6-t1 cases: Load (SVG+bar rect attached); Primary (final tick right edge ≤ SVG right edge via boundingBox; rightmost bar right edge STRICTLY < SVG right edge — real geometry, not arithmetic proxy); Short-session guard (scroller scrollWidth ≈ svg width attr, no extra width from RIGHT_PAD).</playwright_output>
  </playwright>
  <defects/>
  <notes>
  - npm run lint exit 0 (tsc --noEmit across shared/server/client) (SC7 ✓).
  - Spec uses real boundingBox() assertions (≥2) + scrollWidth/clientWidth guard (SC8 ✓) —
    NOT width arithmetic. Geometry blocker resolved: svg width={contentWidth} unchanged;
    RIGHT_PAD folded inside plot area; no horizontal scrollbar regression observed live.
  - tAxisMax change validated end-to-end (see SA INFO) — fixture renders all bars within
    bounds; no existing-session regression in the live render.
  </notes>
</test_report>

<security_audit>
  <status>SECURE</status>
  <threat_level>LOW</threat_level>
  <findings/>
  <notes>
  - No hardcoded secrets, no eval/Function/innerHTML/dangerouslySetInnerHTML in the diff.
  - No new dependencies for t1. No new production-runtime exposure.
  </notes>
</security_audit>

================================================================================
## TASK p6-t2-agent-grouping
================================================================================

<audit_review>
  <target_file>packages/client/src/utils/group-agents.ts, packages/client/src/pages/sessions/SessionListPage.tsx</target_file>
  <status>PASS</status>
  <violations/>
  <notes>
  - groupAgentsByBaseCode is PURE (no side effects, no I/O, no mutation of input), fully typed
    (AgentActivity[] → AgentActivity[]), no `any`. Base-code extraction via agent_id.split('#')[0]
    (SC3 ✓). wall_clock_ms semantics correct: hasDefinedWallClock Set + conditional spread →
    all-undefined yields no wall_clock_ms key (undefined); ≥1 defined yields sum of defined only
    (the `?? 0` accumulator never injects spurious 0 into the output because the key is omitted
    entirely when the Set lacks the base code). Alphabetical localeCompare sort. Mirrors
    aggregate-stats.ts semantics. DRY — single source of truth, imported into SessionListPage.
  - SessionListPage.tsx: groupedAgents derived once, used for panel-grid map, length guard, AND
    AgentStatTable activities (SC8/SC9 ✓ — grep groupedAgents = 4 lines). stats.agents no longer
    rendered directly.
  - BYTE-IDENTICAL GUARD: git diff --exit-code HEAD on AgentStatPanel.tsx → empty; AgentStatTable.tsx
    → empty (SC14 ✓). No props-interface or body changes. No Shadcn ui/* import, no raw hex (SC15 ✓).
  - package.json: vitest "^4" devDep + "test":"vitest run" script (SC4 ✓). vitest.config.ts
    environment:'node', include scoped to src/**/__tests__ (SC5 ✓).
  - INFO: PM spec SC6 literal path was src/utils/group-agents.test.ts; FE#2 placed it at
    src/utils/__tests__/group-agents.test.ts. vitest.config include covers __tests__, tests run
    green, and the audit brief only requires "the 8 unit tests green." Placement choice, not a
    defect. Logged for the record.
  </notes>
</audit_review>

<test_report>
  <task_id>p6-t2-agent-grouping</task_id>
  <status>PASS</status>
  <test_coverage>unit 8 passed, 0 failed; e2e 3 passed, 0 failed</test_coverage>
  <playwright>
    <tier>2</tier>
    <tests_run>3</tests_run>
    <passed>3</passed>
    <failed>0</failed>
    <playwright_output>6 passed (9.1s) combined. p6-t2 cases: no #N suffix labels in aggregate panel; card/row count == distinct base codes from live aggregateStats; ≥1 base code folded (grouped < raw). Interception path CONFIRMED live (instrumented probe): intercepted=73 raw agents, hashed=59, renderedRows=15 distinct base codes. Spec exercises the real strict-less-than assertion (15<73), NOT the cache fallback, and is roster-agnostic.</playwright_output>
  </playwright>
  <defects/>
  <notes>
  - npm test -w @gander-studio/client → vitest 4.1.7, 8 tests passed, exit 0 (SC7 ✓).
  - Unit tests cover the required semantics, not just happy path: all-undefined wall_clock_ms
    → undefined (test b); some-defined → sum of defined only = 8000 (test c); no-`#` fallback
    (test "passes through agent_id with no #"); empty array; mixed rosters; sort order;
    AR#0+AR#1+PM#0 combined case.
  - e2e is roster-agnostic (SC12: grep "AR" = 0): expected counts derived from intercepted
    session.aggregateStats response. Loud-failure guard present (throws if fixture lacks
    #-suffixed agents) — does NOT pass vacuously. Live fixture has 59 hash-suffixed agents,
    so the guard does not trip. `/#\d+/` absence assertion present (SC13 ✓).
  - npm run lint exit 0 (SC10 ✓).
  </notes>
</test_report>

<security_audit>
  <status>SECURE</status>
  <threat_level>LOW</threat_level>
  <findings/>
  <notes>
  - group-agents.ts is pure: no eval/Function/require/child_process/fs/process.env/innerHTML/
    network. No hardcoded secrets in any t2 file. No injection surface (string ops only on
    in-memory agent_id values already validated by the AgentActivitySchema Zod boundary).
  - npm audit: 17 advisories (9 moderate, 8 high). NO NEW production-runtime exposure from the
    vitest ^4 devDependency:
      * vitest@4.1.7 is DEDUPED against the server's existing install — same version already
        present pre-sprint. package-lock diff adds only the `"vitest":"^4"` declaration line,
        no new package entries.
      * vitest is a devDependency (test runner) — never bundled into the production client.
      * serialize-javascript (high) reaches via vite-plugin-pwa→workbox-build→@rollup/plugin-terser
        (build-time, PRE-EXISTING, documented in CLAUDE.md Known Issues) — not via vitest.
      * vite (high, ≤6.4.1 dev-server path traversal) was already a direct client devDep
        pre-sprint; vitest only adds another path to the SAME already-present vite version,
        introducing no new vulnerable version. Dev-server-only, not production runtime.
      * fastify (high) is server-only, unrelated to this client sprint.
      * lodash (high) is build-time via workbox-build, pre-existing.
    Conclusion: no genuinely new production exposure. SECURE.
  </notes>
</security_audit>

================================================================================
## HYGIENE
================================================================================
- No stray debug/diag/tmp specs under packages/client/tests/e2e/ — only the two p6-* specs
  plus prior committed specs present. The debug_timeline.spec.ts referenced in the t1 packet
  was already quarantined by ORC and is absent from the tree. find for *debug*/*diag*/*tmp*
  spec/test files → none.
- Auditor's own instrumentation probe spec was created and REMOVED during the audit; no
  scratch artifacts left behind.

## REQUIRED FIXES
None. Both tasks PASS all three gates. Cleared for commit.
