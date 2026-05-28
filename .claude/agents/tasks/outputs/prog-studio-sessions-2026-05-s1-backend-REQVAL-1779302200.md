<requirements_coverage_report>
  <task_id>prog-studio-sessions-2026-05-s1-backend</task_id>
  <generated>2026-05-20T18:36:40Z</generated>
  <overall_status>COVERED</overall_status>

  <requirement_list>
    <requirement id="R-001" type="success_criterion">Schemas published: SessionSchema, AgentActivitySchema, EventLogEntrySchema, SessionStatsSchema exist + exported in packages/shared/src/schemas.ts; npm run lint clean across all three packages.</requirement>
    <requirement id="R-002" type="success_criterion">Parsers correct: post-mortem parser extracts frontmatter (type, sprint, date, gap_classes, status) + per-wave Section-2 agent activity tables; unit test with ≥3 representative post-mortems.</requirement>
    <requirement id="R-003" type="success_criterion">Event log join correct: given a sprint slug + date, finds matching JSONL events by task_id prefix + date range, groups by agent_id, counts SPAWN/COMPLETE, identifies feedback loops (same-agent SPAWN after CRITIQUE_BLOCK/AUDIT_FAIL). Unit-tested.</requirement>
    <requirement id="R-004" type="success_criterion">tRPC procedures wired: list, get, getStats, saveEdit registered in router.ts with input + output Zod schemas.</requirement>
    <requirement id="R-005" type="success_criterion">saveEdit safety: rejects paths escaping SESSIONS_EDITS_DIR (traversal blocked); writes only inside; creates folder if missing. Unit-tested with malicious input.</requirement>
    <requirement id="R-006" type="success_criterion">Env config: SESSIONS_EDITS_DIR Zod-parsed in env.ts with default; documented in .env.example + CLAUDE.md.</requirement>
    <requirement id="R-007" type="success_criterion">No regressions: agent.*/skill.*/hook.*/loadout.*/export.*/health untouched; existing tests still pass.</requirement>
    <requirement id="R-008" type="constraint">Invariant 1: Session Zod schema in packages/shared; cross-sprint types derive via z.infer.</requirement>
    <requirement id="R-009" type="constraint">Invariant 2: save-to-new-folder via SESSIONS_EDITS_DIR (default ${LOADOUTS_DIR}/../sessions-edits); path traversal blocked at boundary.</requirement>
    <requirement id="R-010" type="constraint">Invariant 5: TypeScript strict + Zod boundaries on every new procedure.</requirement>
    <requirement id="R-011" type="explicit">Configurable source scope: SESSIONS_SOURCE_DIRS (human decision, baked into rev2) — comma-delimited roots, path.resolve per entry, default GANDER_ROOT (preserves Invariant 2).</requirement>
    <requirement id="R-012" type="explicit">Dual-format tolerance (human decision, rev2): parseSessionFile reads BOTH YAML-frontmatter (gander) AND frontmatter-less (studio: # Post-Mortem H1 + **Date:** bold) post-mortems as first-class.</requirement>
    <requirement id="R-013" type="constraint">Out of scope honored: no UI work; no nav registration (S2 owns); proximity-edge regression not touched.</requirement>
  </requirement_list>

  <coverage>
    <item id="R-001" status="COVERED">
      <requirement>Schemas published + lint clean</requirement>
      <evidence>packages/shared/src/schemas.ts (commit d1c3408): 4 new export const *Schema + 4 z.infer type exports (grep export const *Schema = 9). `npm run lint` exit 0 across shared/server/client.</evidence>
    </item>
    <item id="R-002" status="COVERED">
      <requirement>Post-mortem parser correct, ≥3 fixtures</requirement>
      <evidence>packages/server/src/parsers/session-parser.ts + session-parser.test.ts (commit ef196bb): 18 tests, 6 fixtures (4 Format-A across canonical/phase-subdivided/wave-grouped layouts + 2 Format-B). Auditor real-corpus spot-check parsed gander-studio-p1.md (wave-grouped) → agents extracted; frontmatter fields asserted.</evidence>
    </item>
    <item id="R-003" status="COVERED">
      <requirement>Event log join correct, unit-tested</requirement>
      <evidence>packages/server/src/parsers/event-log-parser.ts + session-stats.ts + event-log-parser.test.ts (commit e39fd3f): 9 tests; slug + date-range filter, agent_id grouping, SPAWN/COMPLETE counts, feedback_loop (CRITIQUE_BLOCK→same-agent SPAWN) asserted. Auditor real-corpus smoke against agent-events-2026-04-28/29.jsonl confirmed AUDIT_PASS/AUDIT_FAIL + unknown ev (REQVAL_START/PASS) survive.</evidence>
    </item>
    <item id="R-004" status="COVERED">
      <requirement>4 tRPC procedures wired with Zod I/O</requirement>
      <evidence>packages/server/src/router.ts (commit ae16993): session.list (input limit; output {sessions,skipped} envelope), session.get, session.getStats, session.saveEdit; registered as `session: sessionRouter` in appRouter; all with Zod input/output.</evidence>
    </item>
    <item id="R-005" status="COVERED">
      <requirement>saveEdit traversal safety, malicious-input test</requirement>
      <evidence>packages/server/src/parsers/saveedit-guard.ts (validateSaveEditPath) + saveedit-security.test.ts (commit f81ce01): 5 malicious-input cases. Sprint-final auditor empirically rejected ../../../etc/passwd, ../../etc/hosts, ../sibling AND the sibling-prefix collision (/tmp/edits-evil) via +path.sep. router.saveEdit creates SESSIONS_EDITS_DIR recursive + writes only inside.</evidence>
    </item>
    <item id="R-006" status="COVERED">
      <requirement>Env config + docs</requirement>
      <evidence>packages/server/src/env.ts + .env.example + CLAUDE.md (commit d85f3b5): SESSIONS_EDITS_DIR (default absolute-normalized adjacent to LOADOUTS_DIR via double path.resolve) + SESSIONS_SOURCE_DIRS (zod-validated string[]). ORC cwd-drift test confirmed both resolve absolute under relative env.</evidence>
    </item>
    <item id="R-007" status="COVERED">
      <requirement>No regressions</requirement>
      <evidence>All 6 existing procedure namespaces (health/agent/skill/hook/loadout/export) present in router.ts; git diff showed only the import line modified (no procedure-body removals). Full suite 35 tests pass (30 carried + 5 new t5); npm run lint exit 0.</evidence>
    </item>
    <item id="R-008" status="COVERED">
      <requirement>Invariant 1 — schema in shared, z.infer</requirement>
      <evidence>schemas.ts exports both the Zod const and z.infer type for all 4 schemas; parsers + router import via @gander-studio/shared.</evidence>
    </item>
    <item id="R-009" status="COVERED">
      <requirement>Invariant 2 — SESSIONS_EDITS_DIR default + traversal block</requirement>
      <evidence>env.ts default path.resolve(path.resolve(LOADOUTS_DIR),'../sessions-edits'); validateSaveEditPath enforces containment. SESSIONS_SOURCE_DIRS default [GANDER_ROOT] preserves GANDER_ROOT-only behavior when unset.</evidence>
    </item>
    <item id="R-010" status="COVERED">
      <requirement>Invariant 5 — strict TS + Zod boundaries</requirement>
      <evidence>tsc strict clean all 3 packages; every session.* procedure has Zod input + output schema; env list zod-validated.</evidence>
    </item>
    <item id="R-011" status="COVERED">
      <requirement>SESSIONS_SOURCE_DIRS configurable, default GANDER_ROOT</requirement>
      <evidence>env.ts SESSIONS_SOURCE_DIRS (comma-split, path.resolve per entry, default [path.resolve(GANDER_ROOT)]); session.list/collectSessions globs across all entries; multi-root test (session-list.test.ts) proves 2 roots → 2 distinct sessions.</evidence>
    </item>
    <item id="R-012" status="COVERED">
      <requirement>Dual-format parser (both first-class)</requirement>
      <evidence>session-parser.ts format-detection (frontmatter key present → Format A; empty data → Format B). Tests assert both clean-slug (gander-studio-p4) and prose-H1 (gander-studio-p2-p3) Format-B fixtures parse to valid Session; gap_classes=[]/status=undefined asserted. WARNING-1: id from filename-stem slug, title from H1 prose.</evidence>
    </item>
    <item id="R-013" status="COVERED">
      <requirement>Out of scope honored</requirement>
      <evidence>No client/ files touched in any commit; no nav registration; proximity-edge regression untouched. All 7 commits are server/shared/docs only.</evidence>
    </item>
  </coverage>

  <summary>
    <covered_count>13</covered_count>
    <partial_count>0</partial_count>
    <missing_count>0</missing_count>
  </summary>

  <notes>
    All 7 sprint-level success criteria + 3 cross-sprint invariants + 2 human-decision scope additions (configurable sources, dual-format) COVERED. No runtime/visual criteria — BE-only sprint; every behavioral criterion is verified by passing unit tests (35) plus the auditors' real-corpus smoke (event-log parser) and empirical traversal validation (saveEdit guard), so no REQUIRES_HUMAN_VISUAL flags apply. Process deviation noted (not a coverage gap): the t5 BE agent committed inline (9e69360) before the audit gate; ORC audited HEAD content, which PASSED, then amended to f81ce01 with proper trailers — flagged for post-mortem §8 / agent-improvement (backend-engineer must return completion_packet only, not run git commit). Integration seams for S2/S3 published: SessionSchema/AgentActivitySchema/EventLogEntrySchema/SessionStatsSchema + session.list/get/getStats/saveEdit + SESSIONS_EDITS_DIR. Note for S2: session.list returns the {sessions, skipped} envelope while get/getStats return bare objects (WARNING-2).
  </notes>
</requirements_coverage_report>
