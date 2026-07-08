# AUD#3 Verdict — prog-studio-v2-2026-07-s1-data-layer-t3 (party assembly)

Post-cutover task_id (first SPAWN 2026-07-08 UTC ≥ 2026-05-28) → v2.0 typed envelope.
BE#4 (t4 getAgentDetail) is running in parallel; this verdict is scoped to t3's declared
changes only. router.ts diff read at audit time contains ONLY t3's additive rosterRouter
(getParty); no getAgentDetail present in the diff I audited.

<audit_verdict schema_version="2.0">
  <provenance_marker>audit-pipeline@2.0.0</provenance_marker>
  <task_id>prog-studio-v2-2026-07-s1-data-layer-t3</task_id>
  <auditor_spawn>
    <agent_id>AUD#3</agent_id>
    <parent>ORC#0</parent>
    <independent_from>BE#3</independent_from>
  </auditor_spawn>
  <inputs>
    <input path="packages/server/src/parsers/party-roster.ts" sha256="cd9e10e60dc22e360b9d668f8d21ef03aba5c17c75a08c2c40d4a6907cacda82"/>
    <input path="packages/server/src/router.ts" sha256="6e691b327b44088f144e58179f0be731a7156e2cacdd57ae2a148d3edf5c9282"/>
    <input path="packages/server/src/parsers/__tests__/party-roster.test.ts" sha256="14dc6131938622b4951987668eb85a8a184dfea1afe9c0ed6b6b4c091a576984"/>
    <input path="packages/server/src/parsers/__tests__/fixtures/party-roster/agent-events-party-roster.jsonl" sha256="a2f0c89f352e276f14aed08ae00db72830628d3e1c9a3457c39510d365cc320d"/>
    <input path=".claude/tasks/outputs/prog-studio-v2-2026-07-s1-data-layer-t3-BE-1783469229.md" sha256="d2f2d49c0c9c27e69da21734eb4dc149e9b758ca1a4cfd1b69b047484b6d166a"/>
  </inputs>

  <sa status="PASS">
    <audit_review>
      <target_file>packages/server/src/parsers/party-roster.ts</target_file>
      <target_file>packages/server/src/router.ts</target_file>
      <status>PASS</status>
      <violations/>
      <notes>
        - TS strict: tsc --noEmit ×3 clean (shared/server/client), exit 0.
        - DRY: consumes t1 ROSTER (agent-role.ts) + t2 computePartyDerivations (party-stats.ts)
          verbatim; no re-derivation of counts/anchor. naStatBar/computedStatBar helpers extracted
          so the three bar builders share one N/A-with-reason vs populated shape (no copy-paste).
        - Router change additive: git diff = +16/-0. Existing procedures untouched (verified by
          diff — only PartyStatsSchema import, assembleParty import, rosterRouter{getParty}, and the
          `roster:` registration were added). getParty is a single-key router literal; t4 appends
          getAgentDetail as a sibling without restructuring.
        - Zod at boundary: assembleParty returns PartyStatsSchema.parse(raw); procedure also declares
          .output(PartyStatsSchema). Double boundary validation.
        - No raw hex (materiaColorKey carries '--xx' token names from ROSTER); grep for #RRGGBB → NONE.
        - Activity anchor computed at runtime (computeActivityAnchor iterates ROSTER max spawnCount);
          grep for magic anchor 46 → NONE.
        - DEFERRED-P9-1 cited in the comment banner at the TOKENS_PROJECTED_PLACEHOLDER definition site
          (line 24). Placeholder is exported-constant-only, never referenced in assembleParty.
        - Naming: kebab-case file, camelCase fns, SCREAMING_SNAKE constant — conforms to standards.md.
        - Envelope shape {members, diagnostics, activityAnchor} matches program.md §5 Seam-interpretation
          note 1 (the declared authority) — verified against that note.
      </notes>
    </audit_review>
  </sa>

  <qa status="PASS">
    <test_report>
      <task_id>prog-studio-v2-2026-07-s1-data-layer-t3</task_id>
      <status>PASS</status>
      <test_coverage>unit 177 passed, 0 failed (15 files); party-roster.test.ts (15 tests) RAN, green</test_coverage>
      <playwright>
        <tier>SKIPPED — BE task, no ui_packet</tier>
      </playwright>
      <live_api>DEFERRED to GATE-DEVSERVER (ORC-executed, SC7) — the :3001 getParty response
        check is a separate close-blocking gate per PM dependency_order, not a t3 audit criterion
        (t3 SCs are SC1-SC6, all static/unit). Not a FAIL condition for this verdict.</live_api>
      <normalization_semantics>
        - Activity anchor = runtime max spawnCount across ROSTER (never hardcoded). Fixture: FE=4 SPAWN
          (anchor), BE=2 SPAWN → round(2/4*100)=50. 50%-assertion arithmetic verified correct.
        - Stamina N/A when spawnCount=0 (absent ≠ zero): staminaStatBar guards spawnCount<=0 →
          normalized:null, reason:'no spawns observed'. DI (zero corpus) asserted null.
        - Accuracy Impl-only with DISTINCT N/A reasons: non-Impl → 'not audit-gated' (HR); Impl w/
          0 attributed → 'no attributed audits observed' (DS). BE (fail-then-pass family) → raw 0,
          normalized 0 (attributed but not first-pass). FE (all first-pass) → raw 1, normalized 100.
        - Envelope: {members(13), diagnostics, activityAnchor}; members sorted by lastActivityTs desc,
          nulls last (byActivityRecencyDesc, stable-sort + explicit null branches). Fixture recency
          order HR>AU>BE>FE asserted and passes.
        - TOKENS_PROJECTED_PLACEHOLDER never populated into members[].stats (test asserts no member
          stat carries derivation 'tokens-projected').
      </normalization_semantics>
      <defects/>
    </test_report>
  </qa>

  <sx status="SECURE">
    <security_audit>
      <status>SECURE</status>
      <threat_level>LOW</threat_level>
      <findings/>
      <notes>
        - eventsDirs is trusted server config (SESSIONS_SOURCE_DIRS), not user input; no injection surface.
        - No hardcoded secrets/credentials (grep NONE).
        - Zero client-package changes (git status packages/client clean).
        - No new dependencies (no package.json changes).
        - Read-only fs derivation over the event log; no writes, no shell-out, no dynamic require.
      </notes>
    </security_audit>
  </sx>

  <overall_status>PASS</overall_status>
</audit_verdict>
