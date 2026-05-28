<plan_critique>
  <plan_id>prog-studio-sessions-2026-05-s1-backend</plan_id>
  <status>BLOCK</status>

  <challenges>

    <challenge>
      <type>ASSUMPTION</type>
      <severity>BLOCKER</severity>
      <task_ref>prog-studio-sessions-2026-05-s1-backend-t1</task_ref>
      <description>
The `ev` field is specified as `z.enum` of "at minimum" 5 values: `SPAWN | COMPLETE | CRITIQUE_BLOCK | CRITIQUE_PASS | AGENT_IMPROVEMENT`. A grep across the live JSONL files at `/home/jhber/projects/gander/docs/events/agent-events-*.jsonl` (461 ev occurrences across 11 files) shows the production set is much larger and open-ended. Confirmed values present in the corpus today, with file:line evidence:
- `AUDIT` — `agent-events-2026-04-22.jsonl` line 9
- `AUDIT_PASS` — `agent-events-2026-04-22.jsonl` line 19
- `AUDIT_FAIL` — `agent-events-2026-04-29.jsonl` line 1
- `ENV_FIX` — referenced in post-mortem `gander-studio-p4-proximity-edge-hardening.md` §2 Phase C (will appear in newer JSONL when those events are logged)
- (Plus the 5 listed)

Two failure modes follow:

(1) `z.enum([...]).safeParse({ev: "AUDIT_PASS", ...})` returns `{success: false}`. t3's `parseEventLogFiles` validates each line and skips with `console.warn` on validation failure (graceful degradation). Result: every AUDIT_PASS / AUDIT_FAIL / AUDIT row in the corpus is silently dropped from the parsed event stream. Per t3's `computeSessionStats`, `audit_passes` and `audit_fails` will always be 0 because those events never enter the array. This propagates through to S3's analysis surface as a content bug, not a type bug, and audit/lint cannot catch it.

(2) Per program.md Invariant 1 and Invariant 5, S2 and S3 derive types via `z.infer<typeof EventLogEntrySchema>`. A closed enum on the type forces them to either redefine the type (Invariant 1 violation) or pass `unknown`-shaped data through `as` casts (Invariant 5 strict-mode violation). A new ev string added to the gander codebase next sprint silently breaks Sessions parsing across all three sibling sprints with no compile-time signal.

This is also the post-mortem `gander-studio-p2-canvas-link.md` C2 / `gander-studio-p2-agent-cards.md` §6 G6 pattern: silent-substitution-as-graceful-degradation. The events are dropped silently; tests against fixtures that only contain SPAWN/COMPLETE will pass; production JSONL parsing will under-report audit activity by ~40%. The post-mortem-into-PM feedback loop is not closing.
      </description>
      <required_revision>
In t1's `EventLogEntrySchema` description, change the `ev` field from `z.enum(...)` to `z.string()`. Drop the "at minimum" enum list. Add a one-line `out_of_scope` clarification in t1: "Do NOT use z.enum for `ev` — the live JSONL contains an open-ended set including AUDIT, AUDIT_PASS, AUDIT_FAIL, ENV_FIX, and others; an enum produces silent drop in graceful-degradation parsers." Update t3 SC to assert that a fixture line with `ev:"AUDIT_PASS"` parses successfully (the fixture already required to contain CRITIQUE_BLOCK/CRITIQUE_PASS — extend the SC enumeration to include AUDIT_PASS and AUDIT_FAIL). Update t2's per-agent counting algorithm description: "audit_passes" and "audit_fails" should count `ev === 'AUDIT_PASS'`/`'AUDIT_FAIL'` (not CRITIQUE_PASS/CRITIQUE_BLOCK) — the t2 description currently conflates audit verdicts with critique verdicts, which is wrong (a CRITIQUE is a plan-gate signal, an AUDIT is a post-implementation signal — they are different gates).
      </required_revision>
    </challenge>

    <challenge>
      <type>AUDIT_RISK</type>
      <severity>BLOCKER</severity>
      <task_ref>prog-studio-sessions-2026-05-s1-backend-t2</task_ref>
      <description>
t2's algorithm description (description bullet 4) defines:
- `audit_passes = count of CRITIQUE_PASS rows`
- `audit_fails = count of CRITIQUE_BLOCK rows`

But:
- Critic events (CRITIQUE_PASS / CRITIQUE_BLOCK) are plan-gate verdicts at the PM stage.
- Audit events (AUDIT_PASS / AUDIT_FAIL / AUDIT) are post-implementation gate verdicts at the auditor stage.

These are two distinct pipeline gates, both visible in the corpus at high volume. Conflating them means a session with 3 PM revision rounds + 0 audit failures will be reported as "3 audit fails", and a sprint that audit-failed twice will report 0 audit fails. This propagates to t3's `computeSessionStats` and to S3's visualization. It is a contract bug at the data layer, traceable to a misnamed field.

This BLOCKER chains with the `ev` enum BLOCKER above: the moment the enum is widened to include AUDIT_PASS / AUDIT_FAIL, the field-name semantics need to be coherent.
      </description>
      <required_revision>
Choose one of two fixes (PM picks):
(a) Rename the AgentActivitySchema fields to `critique_passes` and `critique_blocks`, and add separate `audit_passes` / `audit_fails` fields counting AUDIT_PASS / AUDIT_FAIL ev values. (Preferred — preserves both signals.)
(b) Keep `audit_passes` / `audit_fails` field names, but redefine them in t2's algorithm to count `ev === 'AUDIT_PASS'` and `ev === 'AUDIT_FAIL'`, and add separate `critique_*` fields if critique signal is needed. Update t3 to match.

Either way, t1's AgentActivitySchema field set must change, t2's algorithm description must change, and t3's `computeSessionStats` algorithm description must change in lockstep. All three task descriptions reference the same names — single-source-of-truth fix, not three independent edits.
      </required_revision>
    </challenge>

    <challenge>
      <type>ASSUMPTION</type>
      <severity>BLOCKER</severity>
      <task_ref>prog-studio-sessions-2026-05-s1-backend-t4</task_ref>
      <description>
t4 description (FILE 1) hardcodes the SESSIONS_EDITS_DIR default as:

```
process.env.SESSIONS_EDITS_DIR ?? path.join(path.dirname(LOADOUTS_DIR), 'sessions-edits')
```

LOADOUTS_DIR is required via `requireEnv()` in `packages/server/src/env.ts` line 19 with no enforced absolute-path validation. The studio's own `.env.example` and CLAUDE.md examples use relative paths (e.g., `./loadouts`). For a relative LOADOUTS_DIR:
- `path.dirname('./loadouts')` returns `'.'`
- `path.join('.', 'sessions-edits')` returns `'sessions-edits'`
- The path-traversal guard in t5 then resolves `'sessions-edits'` relative to `process.cwd()` at request time — which differs between dev (server runs from repo root) and any future deployment. The guard is correct in form but the safe-base it is guarding against drifts with cwd.

Worse: if a developer sets LOADOUTS_DIR to an absolute path one day and a relative path another, the SESSIONS_EDITS_DIR moves silently — and any saveEdit'd file written under the previous resolution becomes orphaned (the editsDir at session-list time differs from the editsDir at saveEdit time).

PM's own risk_flags row #6 explicitly identified this: "If LOADOUTS_DIR is a relative path, `path.dirname` may not produce an absolute path. The BE agent should apply `path.resolve` to LOADOUTS_DIR before computing the dirname." But the t4 code snippet in the description does not apply that fix — the task ships the buggy form to BE and relies on BE noticing the risk_flag.

This is the same prompt-vs-contract-drift pattern called out in the PM's own `<recurring_pattern source="gander-p7-obsidian-l2-l3.md">` declaration: prescriptive code in a description that drifts from the safe form.
      </description>
      <required_revision>
Either (a) remove the code snippet from t4's description and replace with: "Add `SESSIONS_EDITS_DIR` as a new exported const using the optional-with-default pattern. The default must be computed from a path.resolve()-normalized LOADOUTS_DIR so the result is absolute regardless of how LOADOUTS_DIR is configured. Reference `EXPORT_BASE_DIR` for the optional-with-default style. Confirm with t5 author that the guard's safeBase resolution sees the same absolute path." Or (b) fix the snippet in place to `path.join(path.dirname(path.resolve(LOADOUTS_DIR)), 'sessions-edits')` and add an SC to t4: "SC9: SESSIONS_EDITS_DIR resolves to an absolute path regardless of LOADOUTS_DIR being relative or absolute — verified by a unit test or by inspection." Either way the guard's correctness depends on it.
      </required_revision>
    </challenge>

    <challenge>
      <type>OVERSCOPED</type>
      <severity>WARNING</severity>
      <task_ref>prog-studio-sessions-2026-05-s1-backend-t2</task_ref>
      <description>
t2 packs four distinct units of work into one task:
1. Install vitest (npm install --save-dev, package.json edit).
2. Create vitest.config.ts.
3. Implement session-parser.ts (~80 LOC, gray-matter frontmatter + Section-2 table extraction + groupBy agent_id + feedback-loop algorithm).
4. Write session-parser.test.ts (~50 LOC, 4 test cases × 3 fixtures).

This crosses 4 distinct files (`package.json`, `vitest.config.ts`, `session-parser.ts`, `session-parser.test.ts`) plus 3 fixture file copies. Estimated 150 LOC. Per the Critic's deterministic 4+-file mandatory split rule (post-mortem `gander-studio-p2-agent-cards` §5 G1, agent-changelog 2026-04-27-1), this is at the boundary. The PM's own `pm_preflight_acknowledgement pattern="OVERSCOPED"` block notes: "If the auditor deems t2 too large, ORC may split vitest setup into a t2a and parser/tests into a t2b."

This is a WARNING rather than a BLOCKER because:
- 3 of the 4 files are single-purpose configuration with near-zero cognitive load (vitest.config.ts ~10 LOC, package.json one-line script add).
- The feedback-loop algorithm in (3) genuinely belongs with the test that exercises it; splitting them spreads one logical unit across two agent contexts.

But the post-mortem evidence (PM v1 of agent-cards packed 4 files, shipped a regression) suggests that "single coherent unit" rationale recurs as a self-justification. PM should pre-commit to the split.
      </description>
      <required_revision>
Split t2 into:
- t2a: vitest install + vitest.config.ts + package.json `test` script (~10 LOC, 3 files, no audit gate). Dependencies: t1.
- t2b: session-parser.ts + session-parser.test.ts + 3 fixture copies (~130 LOC, 2 + 3 files, audit gate). Dependencies: t2a.

Renumber t3/t4/t5 → t3/t4/t5/t6 in the dependency_order block, expectation_manifest, and dependency fields. Total agent count goes from 5 → 6. Rationale: vitest setup is a pure infrastructure change with no semantic ambiguity; parser+tests is a single algorithmic unit. Splitting de-risks "vitest install fails offline" (PM risk_flags row 1) without forcing the parser into a separate context. If PM rejects the split, escalate the WARNING with "split rejected; risk accepted on the basis that t2's 4 files are 3 config + 1 algorithm unit" so the human sees the trade-off explicitly.
      </required_revision>
    </challenge>

    <challenge>
      <type>DEPENDENCY</type>
      <severity>WARNING</severity>
      <task_ref>prog-studio-sessions-2026-05-s1-backend-t2</task_ref>
      <description>
t2's vitest install (`npm install --save-dev vitest` in packages/server) requires network access at sprint-execution time. PM acknowledged this in risk_flags row 1 but proceeded. Two failure modes:

(1) Offline / network-restricted environment → npm install fails → t2 first-pass FAIL → audit/remediation cycle for an environmental issue (matches post-mortem `gander-studio-p4-proximity-edge-hardening` §6 G4: "PM does not pre-flight environmental dependencies before dispatching tasks").

(2) Even with network, vitest is the largest devDep added to the workspace (~50 transitive packages). A failed install leaves package-lock.json mid-edit and requires manual cleanup. The BE agent's recovery path is undefined.

The Orchestrator option (pre-install vitest before dispatching t2) sidesteps both: ORC runs `npm install --save-dev vitest -w @gander-studio/server` once as part of dispatch-task Step 0.6 / env-preflight, and t2 description shrinks to "verify vitest is in devDependencies, add `test` script and vitest.config.ts." If install was already done, the verify is a no-op; if not, the failure surfaces at orchestrator-time, not BE-time.

This is a WARNING rather than a BLOCKER because the network-availability assumption is reasonable in the typical dev environment and `vitest` is a stable, low-risk install. But the post-mortem pattern is strong enough to surface.
      </description>
      <required_revision>
Add a pre-dispatch step to the orchestrator brief / dispatch-task: "Before t2 dispatches, ORC runs `npm install --save-dev vitest -w @gander-studio/server` and confirms a successful install via `grep '"vitest"' packages/server/package.json`." Then strip the `npm install --save-dev vitest` step from t2's SUB-A (steps 1 and 4 only — config file + script line). Add an SC: "SC0 (pre-dispatch): vitest is already in devDependencies before t2 begins." If PM keeps install inside t2, add an explicit fallback in the description: "If npm install fails, halt and surface to ORC; do not retry without ORC ack." (silent-substitution G1 backstop).
      </required_revision>
    </challenge>

    <challenge>
      <type>SCOPE_DRIFT</type>
      <severity>WARNING</severity>
      <task_ref>prog-studio-sessions-2026-05-s1-backend-t4</task_ref>
      <description>
The human said: "particularly-formatted markdowns in our folders" (plural, "our folders"). The brief and t4 scope `session.list` to glob only `${GANDER_ROOT}/docs/post-mortems/*.md` — a single folder in the gander root. The studio repo itself contains its own `docs/post-mortems/` (5 files at planning time, including `gander-studio-p4-proximity-edge-hardening.md` referenced in this very critique) which the human has been actively writing to.

If the user's intent is "browse all post-mortem markdowns the agent team produces," the studio's own post-mortems are a first-class part of that corpus and shipping S1 without them creates a gap at delivery (the user opens the Sessions list and sees only gander-root post-mortems; their studio sessions are absent). If the intent is strictly "read-only from the gander control-plane repo," the brief is correct.

This is the kind of reinterpretation flag the Critic must surface for human confirmation rather than silently honor or reject. The brief's "particularly-formatted markdowns in our folders" is plural by the human's own words; the brief narrows it to one folder.

Severity is WARNING (not BLOCKER) because the brief explicitly scopes to GANDER_ROOT, and program.md Invariant 2 places saves outside GANDER_ROOT (read-only from gander, write-only to SESSIONS_EDITS_DIR). Adding a second source root is additive and can be addressed in S1.x or moirai's L2 if the human requests it.
      </description>
      <required_revision>
Add a single line to t4's `session.list` description: "NOTE: scope is GANDER_ROOT only per program.md Invariant 2. The studio repo's own `docs/post-mortems/` is out of scope for S1 — if the human's intent includes that folder, route a `<dag_update_request>` to S1.x or surface to moirai." Then in the orchestrator brief return path to the human, surface this explicitly so the human confirms "GANDER_ROOT only" before sprint execution. Do not expand t4's glob without human confirmation.
      </required_revision>
    </challenge>

    <challenge>
      <type>AUDIT_RISK</type>
      <severity>WARNING</severity>
      <task_ref>prog-studio-sessions-2026-05-s1-backend-t4, prog-studio-sessions-2026-05-s1-backend-t5</task_ref>
      <description>
t4's `session.saveEdit` mutation description includes the path-traversal guard inline as code, AND t5's hardening description includes the same guard inline as code. Two near-duplicate prescriptive code snippets across two task descriptions. Per the prompt-vs-contract drift rule (post-mortem `gander-p7-obsidian-l2-l3.md` §6, post-mortem `gander-studio-p4-proximity-edge-hardening.md` §6 G3, agent-changelog 2026-04-28-1 critic recipe-vs-problem-naming guidance), prescriptive code recipes are exactly where Critic-introduced bugs propagate to PM and ship through to BE.

Specific risk surfaces:
- t4's snippet uses `path.join(SESSIONS_EDITS_DIR, \`\${id}.md\`)` with backtick-template — if SESSIONS_EDITS_DIR is the relative-path form (Challenge above), the join is relative; the resolve-on-target catches that, but the *base* in t4 is unresolved.
- t5's snippet has `target.startsWith(safeBase + path.sep) && target !== safeBase` — the second condition is unreachable for a target derived from `path.join(safeBase, id + '.md')` because target will always have a basename component, not equal safeBase. It's defensive and harmless, but the snippet has an asymmetry that looks like a copy-paste artifact from a different guard pattern.
- t5's snippet writes the guard inline, then says the BE agent should "extract … into a standalone exported helper function." The recipe and the architectural directive contradict each other on where the guard lives.

This is a WARNING because the snippets are close enough to correct that BE can produce working code from them, and the t5 SC requires `path.resolve` on both sides which is the actual safety property. But they violate the recipe-vs-problem-naming guidance the Critic itself was hardened with last week.
      </description>
      <required_revision>
In t4's description for FILE 2.d (session.saveEdit), replace the inline code snippet with: "Apply path-traversal protection: resolve both the base directory (SESSIONS_EDITS_DIR) and the candidate target with `path.resolve` before any `startsWith` check. The candidate path must not escape the resolved base — throw TRPCError FORBIDDEN if it does. t5 will harden this further; ship a working version that already uses path.resolve on both sides."

In t5's description, replace the inline `REQUIRED GUARD LOGIC` code block with: "The guard must satisfy these constraints: (a) resolve safeBase = path.resolve(SESSIONS_EDITS_DIR) and target = path.resolve(path.join(SESSIONS_EDITS_DIR, id + '.md')); (b) reject if `target` is not equal to safeBase and does not start with safeBase + path.sep; (c) the guard should be a pure exported helper (validateSaveEditPath) per approach (a) — recommended for testability. Read `packages/server/src/router.ts` `guardPath` function (lines 22-31) for the existing in-tree pattern and match its style." Drop the prescriptive snippet — let BE produce the code from constraints + in-tree reference.
      </required_revision>
    </challenge>

    <challenge>
      <type>AUDIT_RISK</type>
      <severity>WARNING</severity>
      <task_ref>prog-studio-sessions-2026-05-s1-backend-t2</task_ref>
      <description>
t2 specifies 3 fixtures: `gander-studio-p1.md`, `gander-p5-obsidian-l0-l1.md`, and one additional recent file. PM's risk_flags row #3 already noted: "Section 2 table format varies across the 17 post-mortems… The BE agent should scan for a third variant if the first two fixtures produce the same table structure."

I confirmed by sampling: `gander-p7-obsidian-l2-l3.md` Section 2 uses a Phase-subdivided structure with mini-tables per phase ("Phase 2 — Preflights" with `| Step | Output | Notes |` columns — *no Seq, Timestamp, Event, Agent, Notes structure at all*). If t2's parser assumes the canonical 5-column layout, it will produce 0 agent activities for this fixture. The "Handles a missing Section 2 gracefully" test does not catch this — Section 2 is present, the columns just differ.

Without an explicit fixture covering the phase-table format variant, the parser will silently under-report on real-world data. Same pattern as `ev` enum drop — graceful degradation masking the failure.
      </description>
      <required_revision>
Expand t2 SC3 from "≥ 3 fixture files" to "≥ 4 fixture files covering at least 3 distinct Section-2 layouts: (a) canonical Seq/Timestamp/Event/Agent/Notes table (e.g., `gander-studio-p1.md`), (b) phase-subdivided mini-tables (e.g., `gander-p7-obsidian-l2-l3.md`), (c) wave-grouped tables (e.g., `gander-studio-p2-agent-cards.md`)." Add an SC: "Each fixture is asserted to produce ≥ 1 AgentActivity entry OR is explicitly covered by a 'parser handles unrecognized layout' test that asserts an empty agents array without throwing." This makes the format-variation tolerance contractual rather than aspirational.
      </required_revision>
    </challenge>

  </challenges>

  <audit_risk_forecast>
The two highest-probability audit failures, even if all BLOCKERs are addressed:

1. **t3 `parseEventLogFiles` will silently drop a large fraction of real-world events** unless the `ev` field is genuinely accepted as `z.string()`. The auditor's QA gate runs on the fixture JSONL, which contains only the 4-5 enum values t1 lists, so unit tests pass — but a smoke against `${GANDER_ROOT}/docs/events/agent-events-2026-04-28.jsonl` (the proximity-edge-hardening sprint with AUDIT_PASS / AUDIT_FAIL events) will return ~30-40% under-counted events. The auditor must spot-check parseEventLogFiles output against a real JSONL before signing off, not against a curated fixture.

2. **t4's path-traversal guard will pass functional tests but fail under cwd drift.** The dev server starts from `/home/jhber/projects/gander-studio-alpha` which masks the relative-LOADOUTS_DIR resolution issue. A reviewer running t5's test suite from any other directory or via `npm test -w` (which can change effective cwd) will see different `safeBase` resolution. Audit will pass; deployment will silently misroute saveEdit writes.

Both are content-bug-not-type-bug failures — exactly the audit-blindspot pattern of `gander-studio-p2-agent-cards.md` HCG-2.
  </audit_risk_forecast>

  <post_mortem_patterns_checked>
Read in full:
- `/home/jhber/projects/gander-studio-alpha/docs/post-mortems/gander-studio-p4-proximity-edge-hardening.md` (§5 silent-substitution-as-graceful-degradation, §6 G1/G3/G4 — env preflight, recipe-vs-problem-naming, silent-fallback)
- `/home/jhber/projects/gander-studio-alpha/docs/post-mortems/gander-studio-p2-agent-cards.md` (§5 PM overscoping recurrence, §6 G1/G2/G6 — pm-preflight, verbatim-deliverable, sound-as-proxy)
- `/home/jhber/projects/gander/docs/post-mortems/gander-p7-obsidian-l2-l3.md` (Phase 2-3 — prompt-vs-contract drift, Section 2 phase-table format variant)
- `/home/jhber/projects/gander/docs/post-mortems/gander-p5-obsidian-l0-l1.md` (frontmatter format reference)

Also consulted:
- `/home/jhber/projects/gander-studio-alpha/docs/agent-changelog.md` (2026-04-27-1 four-file BLOCKER threshold; 2026-04-28-1 recipe-vs-problem-naming)
- `/home/jhber/.claude/rules/standards.md` (Zod boundary requirement, DRY, kebab-case, strict-mode)
- Live JSONL corpus at `/home/jhber/projects/gander/docs/events/agent-events-*.jsonl` (461 ev occurrences across 11 files — empirical confirmation of the open-enum challenge)
- Source-of-truth files: `packages/shared/src/schemas.ts` (53 lines, current state matches PM's append-only assumption), `packages/server/src/env.ts` (28 lines, EXPORT_BASE_DIR pattern matches t4's reference), `packages/server/src/router.ts` (407 lines, sub-router pattern confirmed — `t.router({...})` with namespace key in appRouter; PM's session.* approach will fit cleanly).
  </post_mortem_patterns_checked>
</plan_critique>
