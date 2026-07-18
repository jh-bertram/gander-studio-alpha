# Audit Verdict — prog-studio-v2-2026-07-s2-party-shell-t5-reaudit (AUD#7)

FULL re-audit of the complete t5 family (t5 + rem1 + rem2) after AUD#5's QA FAIL on the Bundle
Size Gate. Combined working-tree diff scope: `packages/client/src/store/ui-store.ts` (party union
member + default flip) and `packages/client/src/components/ModeContent.tsx` (PAGE_MAP entry;
React.lazy PartyPage + Suspense/ShimmerBox fallback; React.lazy GraphPage/ProgramDagPage/ComposePage
on the shared boundary). PartyMemberCard.tsx (+30 lines) is the SEPARATELY-AUDITED t3-rem work
(AUD#6 PASS) and is excluded from this scope per the brief.

All three gates re-run first-hand this spawn. Result: PASS. The AUD#5 blocking gate is cleared —
the production entry chunk is now 756.80 kB (was 1,035.70 kB at AUD#5, 1,025.44 kB after rem1),
243.2 kB under the hard 1000 kB threshold, achieved by deferring the react-flow-bearing pages
(GraphPage/ProgramDagPage/ComposePage) plus PartyPage to their own dynamic-import chunks on a
single shared Suspense boundary.

Narrative note (flag, do not edit): CLAUDE.md Known-Issues still cites a stale "~700 kB" main-bundle
baseline. The real entry chunk was ~1,025 kB pre-split and is 756.80 kB post-split. Route this doc
correction to s4 docs scope or deferred-work; it is out of this audit's edit scope.

<audit_verdict schema_version="2.0">
  <task_id>prog-studio-v2-2026-07-s2-party-shell-t5-reaudit</task_id>
  <provenance_marker>audit-pipeline@2.0.0</provenance_marker>
  <auditor_spawn>
    <agent_id>AUD#7</agent_id>
    <parent>ORC#0</parent>
    <independent_from>FE#5,FE#8,FE#9</independent_from>
  </auditor_spawn>
  <inputs>
    <input path="packages/client/src/store/ui-store.ts" sha256="cae18da4c9d7b6336dfa0ba48a4c4743d591883d6d953cf8b57dbf7e110704e8"/>
    <input path="packages/client/src/components/ModeContent.tsx" sha256="91bc4628b96e0b1591e4a47ec5287d30ceed90450ab2829c1db3abb9b9dd70e8"/>
    <input path=".claude/tasks/outputs/prog-studio-v2-2026-07-s2-party-shell-t5-FE-1783476587.md" sha256="17066947df64c18f9e5ff808504d5c686c1cdead5765f09cf84ce3b69bb7ae48"/>
    <input path=".claude/tasks/outputs/prog-studio-v2-2026-07-s2-party-shell-t5-rem-FE-1783481523.md" sha256="a9450e09531af0b0d980e22f9652e6f3afc1718226988c5866e01240bb9fd8f5"/>
    <input path=".claude/tasks/outputs/prog-studio-v2-2026-07-s2-party-shell-t5-rem2-FE-1783482055.md" sha256="42e4ca4f65cc3025df7b2708ed6d60d8deef08b1b14352b9583bb4a76795edab"/>
    <input path=".claude/tasks/outputs/prog-studio-v2-2026-07-s2-party-shell-t5-AUD-1783477019.md" sha256="5a1921f822539049191ae94e2f987514ad5c7833cb7305740917bc1a970426d3"/>
  </inputs>

  <sa status="PASS">
    <audit_review>
      <target_file>packages/client/src/store/ui-store.ts</target_file>
      <target_file>packages/client/src/components/ModeContent.tsx</target_file>
      <status>PASS</status>
      <notes>
        - Combined family diff is EXACTLY the 2 in-scope files (git diff --stat: ui-store.ts 6 lines,
          ModeContent.tsx 42 lines). No stray edits. PartyMemberCard.tsx (+30) confirmed out-of-scope
          t3-rem (AUD#6 PASS) and excluded.
        - ui-store.ts: AppMode union has 'party' as first of 10 members; initial activeMode 'party';
          partialize persists ONLY {muted} (activeMode intentionally resets on hydrate); selectedAgentCode
          seam intact. TS strict, all params/returns typed.
        - ModeContent.tsx: idiomatic lazy consts — `const X = React.lazy(() => import('...'))` for
          PartyPage/ComposePage/GraphPage/ProgramDagPage. Single shared Suspense boundary wraps
          `<ActivePage/>`. PAGE_MAP is `Record<AppMode, React.ComponentType>` (total record — a missing
          'party' key would not compile; tsc x3 clean confirms exhaustiveness over the widened union).
        - Fallback (ModeContentFallback) uses ShimmerBox per the W2 Skeleton→shimmer-box design-spec
          mapping — spec's loading treatment, not a blank. Carries aria-busy="true" + sr-only "Loading…"
          label. Uses var(--radius) design token; no raw hex.
        - No new interactive elements → keyboard-equivalent / focus-trap FE-pitfall gates N/A.
      </notes>
      <violations/>
    </audit_review>
  </sa>

  <qa status="PASS">
    <test_report>
      <task_id>prog-studio-v2-2026-07-s2-party-shell-t5-reaudit</task_id>
      <status>PASS</status>
      <test_coverage>lint(tsc x3) exit 0; vitest 37 passed/0 failed; party e2e 19 passed/0 failed; graph+program-dag e2e 6 passed/0 failed</test_coverage>
      <runtime_evidence>
        - BUNDLE SIZE GATE (the AUD#5 blocker) — CLEARED. `npm run build -w @gander-studio/client`
          run first-hand this spawn. Entry chunk (verified as the `assets/index-*.js` referenced by
          dist/index.html's script src) = index-D2aM8dj9.js = 756.80 kB (gzip 227.18 kB) — 243.2 kB
          UNDER the hard 1000 kB gate. Split chunk table:
            index-D2aM8dj9.js (ENTRY)  756.80 kB  gzip 227.18
            index-CIsrnczD.js          178.66 kB  gzip  58.03  (shared, on-demand)
            index-B46A8xSG.js           42.63 kB  gzip  15.54  (shared, on-demand)
            ComposePage-*.js            28.88 kB  gzip   8.96  (lazy)
            PartyPage-*.js              12.06 kB  gzip   4.18  (lazy)
            GraphPage-*.js              11.53 kB  gzip   3.44  (lazy)
            ProgramDagPage-*.js          8.94 kB  gzip   2.74  (lazy)
          Reproduces the rem2 packet's claimed 756.80 kB exactly. No chunk exceeds 1000 kB.
        - `npm run lint` (tsc --noEmit x3 shared/server/client): exit 0, zero errors.
        - `npm test -w @gander-studio/client`: 6 files, 37/37 passed.
        - Party e2e (packages/client/tests/e2e/prog-studio-v2-2026-07-s2-party-shell.spec.ts), API :3001
          up: 19/19 passed (41.1s) incl. SC1 default-route-renders-party, keyboard-operable card, popover.
        - Lazy-timing regression check on the CONVERTED react-flow surfaces: graph-page.spec.ts (3/3) +
          prog-studio-vision-s3-program-dag.spec.ts (3/3) = 6/6 passed. The lazy split + Suspense boundary
          does not regress GraphPage/ProgramDagPage rendering.
        - Compose pre-existing-failure claim independently spot-checked: ran gander-studio-p1-compose-fe.spec.ts
          first-hand — 2 passed / 1 failed. The failure signature is a fixture-data content assertion
          (toContainText / alert toBeVisible 5000ms timeout), NOT a ChunkLoad/Suspense/dynamic-import error;
          ComposePage renders and lazy-loads fine (2 tests pass). This matches FE#9's documented controlled
          revert-diff evidence (rem2 packet §5: identical 8-failure set with the lazy conversion fully
          reverted → pre-existing fixture-data class, unchanged in kind, NOT newly caused by the split).
          FE#9's method (Edit/Write round-trip against a local backup, not git stash on the shared uncommitted
          tree) is recorded in its packet and accepted as evidence, corroborated by the first-hand signature check.
      </runtime_evidence>
      <playwright>
        <tier>2 (party spec 19/19) + lazy-timing spot check (graph/program-dag 6/6, one compose spec signature check)</tier>
        <tests_run>26</tests_run><passed>25</passed><failed>1</failed>
        <playwright_output>1 compose failure is pre-existing fixture-data class (toContainText timeout on alert), not a lazy-split regression — corroborates FE#9 revert-diff. Party 19/19, graph+program-dag 6/6.</playwright_output>
      </playwright>
      <defects/>
    </test_report>
  </qa>

  <sx status="SECURE">
    <security_audit>
      <status>SECURE</status>
      <threat_level>LOW</threat_level>
      <notes>Trivial surface: a type-union literal, an initial-state value, four React.lazy dynamic
        imports, a Suspense boundary, and a ShimmerBox fallback. No package.json/lockfile change (no new
        deps). grep clean on both files: no secrets/api-keys/tokens, no eval, no dangerouslySetInnerHTML,
        no process.env access, no new I/O or auth surface.</notes>
      <findings/>
    </security_audit>
  </sx>

  <overall_status>PASS</overall_status>
</audit_verdict>
