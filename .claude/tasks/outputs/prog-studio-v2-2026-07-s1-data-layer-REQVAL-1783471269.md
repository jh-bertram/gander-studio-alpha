# Requirements Coverage Report — prog-studio-v2-2026-07-s1-data-layer

**Validator:** RV#1 (Mode B — spawned subagent execution, per requirements-validate SKILL.md; ≥3 implementing packets)
**Date:** 2026-07-08
**Requirement sources:**
1. PRIMARY — sibling brief `docs/programs/prog-studio-v2-2026-07/sprints/prog-studio-v2-2026-07-s1-data-layer/orchestrator_brief.md` (7 sprint-level Success Criteria + 2 BINDING seam contracts, as amended by `docs/programs/prog-studio-v2-2026-07/program.md` §5 Seam-interpretation notes 1–2)
2. Revised plan `.claude/tasks/outputs/prog-studio-v2-2026-07-s1-data-layer-rev-PM-1783467209.md` (verbatim_deliverable_audit + packet SCs)

**Evidence base:** delivered source (schemas.ts, agent-role.ts, event-log-parser.ts, party-stats.ts, party-roster.ts, agent-detail.ts, router.ts), test suites + fixtures, 4 audit verdicts (t1 AUD-1783468376 / t2 AUD-1783469229 / t3 AUD-1783469923 / t4 AUD-1783470877 — all SA PASS + QA PASS + SX SECURE), 4 completion packets (t1–t4 BE-*), git log (4 commits b771486 / ab0c00e / bd281c3 / 73a78f4, each with `task:` trailer + `Audit: PASS`), and ORC's GATE-DEVSERVER event (docs/events/agent-events-2026-07-08.jsonl seq 11 NOTE).

---

## Step 1 — Requirement List

<requirement_list>
  <requirement id="R-001" type="success_criterion">SC1 — `roster.getParty` returns live PartyMember[] for the real 13-agent roster with per-agent stat bars derived from the actual corpus (no hardcoded sample values); each stat carries raw value, 0-100 normalized value, derivation id, and feasibility tag.</requirement>
  <requirement id="R-002" type="success_criterion">SC2 — Per-implementer first-pass audit rate implements the §2.1 attribution flip and is fixture-tested against synthetic events where gate-id ≠ implementer-id.</requirement>
  <requirement id="R-003" type="success_criterion">SC3 — Ghost/stall rate and event-type coverage stats implemented per inventory §2.2/§2.3 (AVAILABLE-NOW set); schema-invalid corpus lines (e.g. the known missing-agent_id line) are counted and surfaced, never silently dropped.</requirement>
  <requirement id="R-004" type="success_criterion">SC4 — `roster.getAgentDetail(code)` returns equipment (tools), materia (skills+hooks), abilities (workflows) with provenance paths readable from GANDER_ROOT, plus the connectivity relationship subset.</requirement>
  <requirement id="R-005" type="success_criterion">SC5 — Tokens/cost appears ONLY as a `projected` placeholder (DEFERRED-P9-1 cited in code comment at the definition site).</requirement>
  <requirement id="R-006" type="success_criterion">SC6 — `npm run lint` (tsc ×3) clean; server vitest suite green; no client-package changes.</requirement>
  <requirement id="R-007" type="success_criterion">SC7 — Procedures must respond on the dev server (:3001-class runtime) for the s2 wave's env-preflight to pass.</requirement>
  <requirement id="R-008" type="explicit">Seam `s1-to-s2-party-schema` (amended by program.md §5 note 1) — `PartyMemberSchema`, `PartyStatsSchema` in packages/shared/src/schemas.ts; `roster.getParty` returns the PartyStats ENVELOPE `{members, diagnostics, activityAnchor}` with `members` = PartyMember[] sorted by activity recency; card-renderable record: agent code, role/materia color key, portrait seed, named stat bars (0-100 normalized + raw + feasibility tag).</requirement>
  <requirement id="R-009" type="explicit">Seam `s1-to-s3-agentdetail-schema` (amended by program.md §5 note 2) — `AgentDetailSchema`; `roster.getAgentDetail(code)`: equipment/materia/abilities lists with provenance paths, relationship edges (connectivity subset), quality stats with attribution-side declared; `abilities: []` + surfaced dataQualityNote is the CONTRACTED behavior.</requirement>
  <requirement id="R-010" type="constraint">Analogy vocabulary exact in schema field names: `materia: {skills, hooks}`, `equipment` = tools, `abilities` = workflows (program.md §2 invariant).</requirement>
  <requirement id="R-011" type="constraint">Feasibility rule — NEEDS-SCHEMA-EXTENSION stats (tokens/cost) NOT implemented as real fields; reserved slot carries `feasibility: 'projected'`.</requirement>
  <requirement id="R-012" type="constraint">Attribution semantics declared per quality stat (which side of the gate/implementer flip).</requirement>
  <requirement id="R-013" type="constraint">Zod at every boundary; TS strict; `<Entity>Schema` naming; z.infer types.</requirement>
  <requirement id="R-014" type="constraint">DRY — EXTEND existing parsers (event-log-parser, aggregate-stats precedent, connectivity), don't duplicate.</requirement>
  <requirement id="R-015" type="constraint">vitest suites in `packages/server/src/parsers/__tests__/` covering attribution-flip correctness, normalization bounds, missing/malformed-corpus behavior (silent-empty forbidden — absent distinguishable from zero), feasibility tagging; base-plan portability.</requirement>
  <requirement id="R-016" type="explicit">Verbatim deliverable (rev-PM, CR#1 FIX 1) — canonical code→spec mapping (`ROSTER.specFile`) so getAgentDetail is non-hollow; non-empty equipment+materia for a real spec-backed agent; DI's empty-with-note path distinguishable from parse failure.</requirement>
</requirement_list>

(≥3 requirements extracted — brief was well-specified; no underspecification note needed.)

---

## Step 2 / 2.5 — Coverage Map

<requirements_coverage_report>
  <task_id>prog-studio-v2-2026-07-s1-data-layer</task_id>
  <generated>2026-07-08T01:05:00Z</generated>
  <overall_status>COVERED</overall_status>

  <coverage>
    <item id="R-001" status="COVERED">
      <requirement>SC1 — getParty live 13-member roster, stats raw+normalized+derivation+feasibility, no hardcoded samples</requirement>
      <evidence>packages/server/src/parsers/party-roster.ts:144 (`assembleParty`), :146 (runtime `computeActivityAnchor` — AUD#3 grep for magic 46 → NONE), :156 (activity bar off live anchor), :165 (`portraitSeed: entry.code`); PartyStatBarSchema at packages/shared/src/schemas.ts:392 carries raw/normalized/derivation/feasibility; router.ts:788-793 (`rosterRouter.getParty`, `.output(PartyStatsSchema)`). AUD#3 QA: members(13), fixture arithmetic verified (FE anchor=100, BE 2/4→50). RUNTIME (Step 2.5): GATE-DEVSERVER NOTE seq 11 (2026-07-08) — ORC observed getParty return members[] with real corpus data ("ORC Activity raw 27") on isolated port :3199. Live-corpus derivation confirmed non-hardcoded.</evidence>
    </item>
    <item id="R-002" status="COVERED">
      <requirement>SC2 — §2.1 attribution flip, fixture-tested with gate-id ≠ implementer-id</requirement>
      <evidence>packages/server/src/parsers/party-stats.ts:133 (`computePartyDerivations`, backward-look flip); fixture __tests__/fixtures/attribution-flip/agent-events-attribution-flip.jsonl verified directly: gate ids AUDITOR#1/#2 ≠ implementer ids FE#1/BE#1 throughout; clean-first-pass family (seq 1-2), fail-then-pass family (seq 3-6, BE 0/1), same-role multi-instance family FE#1+FE#2→FE (seq 7+, CR#1 forecast #2 closed). AUD#2 adjudication ruling MATCHES: attributedAudits basis reconstructs the inventory §2.1 worked example exactly (22/35 = 63%). party-stats.test.ts green in 162-test run.</evidence>
    </item>
    <item id="R-003" status="COVERED">
      <requirement>SC3 — ghost/stall + event-type coverage; schema-invalid lines counted and surfaced, never dropped</requirement>
      <evidence>packages/server/src/parsers/event-log-parser.ts:124 (`readEventLogEntriesWithDiagnostics` — invalidLineCount + samples, additive; pre-existing readers unchanged, regression suites green per AUD#2); party-stats.ts:167 (GHOST_CONFIRMED own agent_id, §2.2), :230-231 (distinct/uncounted event types, §2.3), :228 (invalidLineCount threaded). Malformed fixture matches the REAL corpus defect: agent-events-malformed-line.jsonl line 2 = HCG_RESOLVED with `resolved_by`, NO `agent_id` — AUD#2 independently confirmed against docs/events/agent-events-2026-03-28.jsonl seq 7. Diagnostics surface on the getParty envelope (schemas.ts:413-424; party-roster.ts:184).</evidence>
    </item>
    <item id="R-004" status="COVERED">
      <requirement>SC4 — getAgentDetail: equipment/materia/abilities with provenance + connectivity relationship subset</requirement>
      <evidence>packages/server/src/parsers/agent-detail.ts:174 (`assembleAgentDetail`), :64 (provenancePath from connectivity node filePath), :86-99 (materiaFromGraph skills+hooks), :112 (relationshipsFromGraph — spawns/communicates_with subset); router.ts:794 (`getAgentDetail` appended to same rosterRouter, getParty untouched per AUD#4 SC7 gate). AUD#4 SC3 gate: live GANDER_ROOT — FE(16ms)/AU(13ms) NON-EMPTY equipment AND materia RAN (not skipped). Abilities: `abilities:[]` + surfaced note per program.md §5 note 2 — CONTRACTED, see R-009. RUNTIME (Step 2.5): GATE-DEVSERVER NOTE seq 11 — getAgentDetail(AU) returned real equipment+materia on the live server.</evidence>
    </item>
    <item id="R-005" status="COVERED">
      <requirement>SC5 — tokens/cost ONLY as projected placeholder, DEFERRED-P9-1 cited at definition site</requirement>
      <evidence>packages/server/src/parsers/party-roster.ts:24 (DEFERRED-P9-1 comment banner at definition site), :35-40 (`TOKENS_PROJECTED_PLACEHOLDER`, `feasibility: 'projected'`, null values). AUD#3: placeholder is exported-constant-only, never referenced in assembleParty; test asserts no member stat carries derivation 'tokens-projected'.</evidence>
    </item>
    <item id="R-006" status="COVERED">
      <requirement>SC6 — lint (tsc ×3) clean; server vitest green; no client-package changes</requirement>
      <evidence>All four audit verdicts ran `npm run lint` (tsc --noEmit ×3) → exit 0, clean; server suite grew monotonically green: 150 (t1) → 162 (t2) → 177 (t3) → 187 tests / 16 files, 0 failed (t4, AUD-1783470877 test_coverage). No-client-change independently verified: `git show --stat` across all 4 commits (b771486, ab0c00e, bd281c3, 73a78f4) shows zero packages/client/* paths; AUD#4 SX confirms client working tree clean.</evidence>
    </item>
    <item id="R-007" status="COVERED">
      <requirement>SC7 — procedures respond on the dev server for s2 env-preflight (RUNTIME criterion)</requirement>
      <evidence>Step 2.5 runtime verification via ORC-executed GATE-DEVSERVER (close-blocking gate per PM dependency_order): docs/events/agent-events-2026-07-08.jsonl seq 11 NOTE (edge_label gate_devserver) — "GATE-DEVSERVER PASS — roster.getParty returned members[] (ORC Activity raw 27) and roster.getAgentDetail(AU) returned real equipment+materia on :3199 (isolated port)." Both procedures responded with real, non-empty data. No REQUIRES_HUMAN_VISUAL — headless data layer; human visual verification is contracted to s2 (FE consumer sprint).</evidence>
    </item>
    <item id="R-008" status="COVERED">
      <requirement>Seam s1-to-s2-party-schema (envelope per program.md §5 note 1)</requirement>
      <evidence>schemas.ts:402-425 — PartyMemberSchema {code, roleCategory, materiaColorKey (token NAME), portraitSeed (:406), stats, lastActivityTs (:408), hasCorpusActivity (:409)}; PartyStatsSchema envelope {members, diagnostics, activityAnchor} (:413-424) exactly per §5 note 1. Recency sort: party-roster.ts:127-134 (`byActivityRecencyDesc`, nulls last), :172 (`members.sort`); AUD#3 asserted fixture recency order HR>AU>BE>FE. Double Zod boundary: assembleParty returns `PartyStatsSchema.parse(raw)` + procedure `.output(PartyStatsSchema)` (AUD#3 SA).</evidence>
    </item>
    <item id="R-009" status="COVERED">
      <requirement>Seam s1-to-s3-agentdetail-schema (abilities-empty contracted per program.md §5 note 2)</requirement>
      <evidence>schemas.ts:460-471 — AgentDetailSchema {code, roleCategory, materiaColorKey, equipment, materia:{skills,hooks}, abilities, relationships, qualityStats, dataQualityNotes}; agent-detail.ts:183-189 — DI (specFile null) → roster metadata + empty lists + note "no agent spec on disk for code DI", DISTINCT text from the stale-mapping note (AUD#4 SC5 gate: distinguishable from parse failure). abilities:[] unconditional + "abilities intentionally empty (program.md §5 note 2)" note pushed for every code (AUD#4 SC6 gate) — CONTRACTED behavior, not under-delivery.</evidence>
    </item>
    <item id="R-010" status="COVERED">
      <requirement>Analogy vocabulary exact in schema field names</requirement>
      <evidence>schemas.ts:460-471 — literal object keys `equipment`, `materia` (with `skills`/`hooks` sub-keys), `abilities` in AgentDetailSchema; AUD#1 SA confirmed analogy vocabulary literal in field names; AgentDetailSchema.parse enforcement makes field names schema-literal at runtime (AUD#4 SC2 gate).</evidence>
    </item>
    <item id="R-011" status="COVERED">
      <requirement>Feasibility rule — no NEEDS-SCHEMA-EXTENSION stat as real field</requirement>
      <evidence>FeasibilitySchema z.enum(['available','projected']) at schemas.ts:389; every PartyStatBar carries a feasibility tag; the only 'projected' item is TOKENS_PROJECTED_PLACEHOLDER (party-roster.ts:35-40) with null raw/normalized, never populated into members[].stats (AUD#3 test assertion). All three rendered bars are AVAILABLE-NOW derivations (activity-spawns-normalized, stamina-inverse-ghost, accuracy-firstpass).</evidence>
    </item>
    <item id="R-012" status="COVERED">
      <requirement>Attribution semantics declared per quality stat</requirement>
      <evidence>QualityStatSchema `attribution: z.enum(['implementer-backward-look','direct-agent-id','gate-renderer'])` (schemas.ts:450-458); agent-detail.ts:139-159 — ghost rate → 'direct-agent-id', first-pass → 'implementer-backward-look' (Impl), non-Impl/Gate → 'gate-renderer' with null value + dataQualityNote (AUD#4 SC4 gate PASS).</evidence>
    </item>
    <item id="R-013" status="COVERED">
      <requirement>Zod at every boundary; TS strict; naming; z.infer</requirement>
      <evidence>10 `<Entity>Schema` exports each with matching z.infer type export (schemas.ts:389-471, verified by grep — 10/10 pairs); both procedures declare .input/.output schemas plus parser-side .parse() (AUD#3/AUD#4 SA "double boundary validation"); tsc strict ×3 clean all four packets; no `any` (JSON.parse → `unknown` then Zod-narrowed, AUD#2/AUD#4 SA).</evidence>
    </item>
    <item id="R-014" status="COVERED">
      <requirement>DRY — extend existing parsers, don't duplicate</requirement>
      <evidence>event-log-parser.ts extended additively (readEventLogEntries/parseEventLogFiles behaviorally unchanged — dedicated regression test re-runs old reader on the malformed fixture, AUD#2 SA); family grouping reuses sprintRoot/matchesSlug from session-slug-match.ts (no re-invented rule); role canonicalization reused from t1 agent-role.ts across t2/t3/t4; t3/t4 consume t1 ROSTER + t2 computePartyDerivations verbatim (AUD#3/AUD#4 SA DRY notes). The one ~6-line helper mirror in agent-detail.ts was adjudicated justified (t3 fns unexported + shape differs) by AUD#4.</evidence>
    </item>
    <item id="R-015" status="COVERED">
      <requirement>vitest coverage: flip correctness, normalization bounds, malformed-corpus surfacing, feasibility tagging; base-plan portability</requirement>
      <evidence>Four new suites in packages/server/src/parsers/__tests__/: agent-role.test.ts (9), party-stats.test.ts (9), party-roster.test.ts (15), agent-detail.test.ts (10) + additive event-log-parser.test.ts diagnostics/regression sections; three new fixture dirs (attribution-flip/, malformed-line/, party-roster/). Normalization bounds asserted as anchor-RELATIONSHIP (max→100, half→~50), not locked corpus numbers (AUD#3); absent≠zero: Stamina spawnCount=0 → null+reason, DI hasCorpusActivity:false, non-existent dir → empty diagnostics with no throw and no fabricated data (AUD#2 silent_empty_check PASS). All deliverables plain files, no Workflow-tool dependency (base-plan portable).</evidence>
    </item>
    <item id="R-016" status="COVERED">
      <requirement>Canonical code→spec mapping (ROSTER.specFile) — getAgentDetail non-hollow</requirement>
      <evidence>agent-role.ts:54-67 — 13-entry ROSTER with specFile column (12 non-null .md + DI null at :64) + canonical-mapping maintenance comment (:46-48); agent-detail.ts:3 comment "NEVER re-derived from disk, no second hardcoded map", :52-53 basename matching against specFile. t1 SC5 live-glob test RAN (✓ not skipped) under real GANDER_ROOT (AUD#1); t4 SC3 live-corpus NON-EMPTY equipment+materia for FE and AU RAN with real fs timings (AUD#4). GATE-DEVSERVER corroborates at runtime (AU returned real equipment+materia).</evidence>
    </item>
  </coverage>

  <summary>
    <covered_count>16</covered_count>
    <partial_count>0</partial_count>
    <missing_count>0</missing_count>
  </summary>

  <notes>
    1. **triggers_hook direction deviation — UPHELD, s3 should inherit the interpretation.** The packet text assumed agent→hook (source-only) hook edges; the real corpus runs hook→agent (AUD#4 independent count: 102/102 triggers_hook edges have agent as TARGET, 0 as source). BE#4's bidirectional endpoint matching is the corpus-correct reading; a literal source-only match would have made materia.hooks structurally empty for all 13 codes forever (the exact silent-empty class SC3 forbids). Surfaced explicitly, adjudicated UPHELD with quoted counts — not a requirements gap.
    2. **Known approximation on Accuracy (inherited, not a defect):** AUD#2's forward-note — sprintRoot family grouping can place multiple distinct tasks in one family and the open-fail marker is per-role, so a same-role fail from task A could be resolved by a pass from task B within one family. This is inherent to the MANDATED DRY reuse of sprintRoot/matchesSlug; the inventory itself anticipated it. s2/s3 consumers of the Accuracy bar inherit it knowingly.
    3. **Minor schema asymmetry flagged (not blocking):** QualityStatSchema lacks the `reason` field PartyStatBarSchema has; t4 routes N/A explanations through `dataQualityNotes` instead. Correctly flagged-not-fixed by AUD#4 (schemas.ts out of t4 scope). Candidate small extension if s3 wants per-stat N/A reasons inline.
    4. **ORC close-out bookkeeping still owed (post-REQVAL, per PM risk_flags):** the durable workflow-usage ledger (abilities future schema extension, program.md §5 note 2) is NOT yet recorded in docs/deferred-work.md (grep confirms no workflow-ledger entry). Record it at sprint close so s3 does not plan a populated Abilities drill-down against a contracted-empty field.
    5. **Push opt-in now unblocked:** the human's "push this sprint" is the per-sprint guarded-auto-push opt-in; its gate sequence (full audit PASS + REQVAL COVERED) is satisfied by this report. Feature branch only, never main (standards.md Git Workflow).
    6. **Requirement-source consolidation:** brief SC6's "no client-package changes" and program invariant "navigation untouched" were validated together under R-006 (zero packages/client paths across all 4 commits). Human visual verification is deliberately deferred to s2 per the program's Step 4.5 per-sprint browser-verification model — appropriate for a headless data layer.
  </notes>

  <requires_human_visual>false</requires_human_visual>
</requirements_coverage_report>

---

## Step 4 — Routing

**overall_status = COVERED.** No gap_fill_requests. All 16 requirements (7 sprint SCs + 2 binding seams as amended + 6 program constraints + 1 CR#1 verbatim deliverable) trace to specific delivered artifacts with file:line evidence, audit confirmation, and runtime GATE-DEVSERVER proof for the two runtime criteria. Sprint may proceed to archive/close, with the deferred-work bookkeeping in note 4 executed at close.
