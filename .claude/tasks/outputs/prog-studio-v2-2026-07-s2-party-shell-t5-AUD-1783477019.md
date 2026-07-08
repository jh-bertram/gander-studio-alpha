# Audit Verdict — prog-studio-v2-2026-07-s2-party-shell-t5 (AUD#5)

Working notes: SA and SX are clean. The single blocking gate is QA's Bundle Size Gate —
the production build's main chunk is 1,035.70 kB, over the auditor's hard 1000 kB (1 MB)
threshold. Verified that t5's `import PartyPage` in ModeContent.tsx is the sole/first importer
of PartyPage (0 refs at HEAD; none elsewhere), so this wiring is precisely what pulls the party
module subtree into the shippable bundle — before t5 it was tree-shaken out, which is why the
t2/t3/t4 build gates legitimately passed at ~700 kB. The completion packet's "cumulative t1-t5,
not this packet" framing understates t5's causal role: t5 is the integration point at which the
chunk crosses the gate. The natural, in-scope remediation lives in the exact file t5 owns
(React.lazy dynamic import of PartyPage in ModeContent.tsx + a Suspense boundary), which also
improves default-route load — OR a human-ratified deferral accepting the >1 MB bundle (there is
no existing waiver: project Known-Issues documents ~700 kB, under the gate).

Scope note (non-blocking): a third source file — packages/client/src/components/party/PartyMemberCard.tsx —
is modified in the working tree. Event log seq 51 shows this is FE#7's CONCURRENT t3-rem
remediation (the HIGH card-focus/popover-oscillation defect the brief assigned to t3, not t5).
It is out of t5's scope and is NOT flagged against t5; noted only because the build ran against a
non-hermetic tree (immaterial to the bundle figure — PartyMemberCard was already in the subtree).

<audit_verdict schema_version="2.0">
  <task_id>prog-studio-v2-2026-07-s2-party-shell-t5</task_id>
  <provenance_marker>audit-pipeline@2.0.0</provenance_marker>
  <auditor_spawn>
    <agent_id>AUD#5</agent_id>
    <parent>ORC#0</parent>
    <independent_from>FE#5</independent_from>
  </auditor_spawn>
  <inputs>
    <input path="packages/client/src/store/ui-store.ts" sha256="cae18da4c9d7b6336dfa0ba48a4c4743d591883d6d953cf8b57dbf7e110704e8"/>
    <input path="packages/client/src/components/ModeContent.tsx" sha256="7449d3cdb95e2eab3d7861cb95b47c512c32f26320ab602ae86de52747ff9501"/>
    <input path=".claude/tasks/outputs/prog-studio-v2-2026-07-s2-party-shell-t5-FE-1783476587.md" sha256="17066947df64c18f9e5ff808504d5c686c1cdead5765f09cf84ce3b69bb7ae48"/>
  </inputs>

  <sa status="PASS">
    <audit_review>
      <target_file>packages/client/src/store/ui-store.ts</target_file>
      <target_file>packages/client/src/components/ModeContent.tsx</target_file>
      <status>PASS</status>
      <notes>
        - t5's own diff is EXACTLY the 2 in-scope files (verified via `git diff --name-only`).
        - AppMode union: 'party' added as first member; 10 members total. TS strict, all params/returns typed.
        - Default flip: initial activeMode 'browse'->'party'; partialize still persists ONLY {muted};
          hydrate comment updated to 'party'. selectedAgentCode/setSelectedAgentCode (t1) byte-intact.
        - REVERSE-VERIFY (exhaustiveness): PAGE_MAP is declared `Record<AppMode, React.ComponentType>`
          (ModeContent.tsx:15). A missing `party` key would NOT compile — confirmed the annotation is a
          total Record, and tsc x3 is clean with all 10 keys present. Compiler-exhaustiveness proof holds.
        - BottomTabBar.tsx byte-untouched (empty git diff). NAV_ITEMS/AppShell/navigation.ts/globals.css untouched.
        - No raw hex, no new interactive elements, no a11y surface introduced (pure type+routing-table change).
      </notes>
      <violations/>
    </audit_review>
  </sa>

  <qa status="FAIL">
    <test_report>
      <task_id>prog-studio-v2-2026-07-s2-party-shell-t5</task_id>
      <status>FAIL</status>
      <test_coverage>lint(tsc x3) exit 0; vitest 37 passed / 0 failed; t6 Tier-2 e2e 19 passed / 0 failed (cited runtime evidence)</test_coverage>
      <runtime_evidence>
        - `npm run lint` (tsc --noEmit x3: shared/server/client): exit 0, zero errors — PAGE_MAP exhaustive over widened AppMode.
        - `npm test -w @gander-studio/client`: 6 files, 37/37 passed.
        - Live runtime: t6 e2e (packages/client/tests/e2e/prog-studio-v2-2026-07-s2-party-shell.spec.ts)
          19/19 passed incl. SC1 "fresh load renders the party screen ... >=3 real roster codes and stat bars"
          — cited per brief as live runtime evidence for the default-route-renders-party assertion
          (NOT SKIPPED-with-no-cover). §2.3 assessment: flipping the initial activeMode is an INITIAL-STATE
          change, not a store SELECTOR-function rewire — no selector logic changed; t6's green run confirms
          the wired result at runtime.
      </runtime_evidence>
      <playwright>
        <tier>cited from t6 (FE owns interaction-class SCs via CLI Playwright); AUD MCP set is read-only</tier>
        <tests_run>19</tests_run><passed>19</passed><failed>0</failed>
      </playwright>
      <defects>
        <bug>
          <description>BUNDLE SIZE GATE BREACH. Production build main chunk
            `dist/assets/index-CGUldprg.js` = 1,035.70 kB, exceeding the auditor's hard 1000 kB (1 MB)
            gate. t5's `import PartyPage` (ModeContent.tsx:4) is the sole/first importer of PartyPage
            (0 refs at HEAD), so this wiring pulls the party module subtree into the shippable bundle for
            the first time (previously tree-shaken). The chunk was ~700 kB pre-sprint (project Known-Issues)
            and crosses 1 MB at t5 — this is the task where the gate trips, not a pre-existing waived state.</description>
          <steps_to_reproduce>cd packages/client &amp;&amp; npm run build  ->  observe `dist/assets/index-*.js  1,035.70 kB` and Vite's >500 kB chunk warning.</steps_to_reproduce>
          <severity>BLOCKER</severity>
          <remediation>Return to FE. Apply the gate-prescribed fix in the file t5 owns:
            `const PartyPage = React.lazy(() =&gt; import('../pages/PartyPage'))` in ModeContent.tsx with a
            Suspense fallback boundary (route-level code-split — brings main chunk under 1000 kB and defers
            the party subtree off the default synchronous path), OR apply vendor/manualChunks splitting.
            ALTERNATIVE: obtain an explicit human-ratified deferral accepting the &gt;1 MB bundle (tracked
            like DEFERRED-006); the current Known-Issues entry documents ~700 kB only and does not waive &gt;1 MB.</remediation>
        </bug>
      </defects>
    </test_report>
  </qa>

  <sx status="SECURE">
    <security_audit>
      <status>SECURE</status>
      <threat_level>LOW</threat_level>
      <notes>Trivial surface: a type-union literal, an initial-state value, an import, and a Record key.
        No secrets, no env access, no eval/dangerouslySetInnerHTML, no new I/O or auth surface (grep clean).
        Not the blocking gate — reported for completeness; the single remediation target is the QA bundle gate.</notes>
      <findings/>
    </security_audit>
  </sx>

  <overall_status>FAIL</overall_status>
  <blocking_gate>QA — Bundle Size Gate (main chunk 1,035.70 kB &gt; 1000 kB)</blocking_gate>
  <single_remediation_target>Route-level code-split PartyPage via React.lazy+Suspense in ModeContent.tsx (t5's own file) to bring the main chunk under 1 MB, or secure a human-ratified &gt;1 MB deferral. SA PASS and SX SECURE — no other changes required.</single_remediation_target>
</audit_verdict>
