# Task Decomposition — prog-studio-sessions-2026-05-s1-backend (rev1)
**PM:** PM#2
**ts:** 2026-05-20T00:00:00Z
**sprint:** prog-studio-sessions-2026-05-s1-backend
**program:** prog-studio-sessions-2026-05
**agent_count:** 6 (BE agent, sequential)
**revision_of:** prog-studio-sessions-2026-05-s1-backend-PM-1778050377.md
**revision_reason:** CRITIQUE_BLOCK — 2 BLOCKERs, 5 WARNINGs resolved

---

<task_decomposition task_id="prog-studio-sessions-2026-05-s1-backend" agent_count="6">

  <task_packets>

    <!-- ═══════════════════════════════════════════════════════════════ -->
    <!-- t1: Zod schemas                                                 -->
    <!-- ═══════════════════════════════════════════════════════════════ -->
    <task_packet>
      <task_id>prog-studio-sessions-2026-05-s1-backend-t1</task_id>
      <assigned_to>BE</assigned_to>
      <priority>BLOCKER</priority>
      <description>
Append four new Zod schemas to `packages/shared/src/schemas.ts` using the existing export pattern in that file (read the file first — ~53 lines at planning time — to match z.object + named export + z.infer style).

The four schemas to add (names are exact; they are the stable cross-sprint contract S2 and S3 will import via z.infer):

1. **`EventLogEntrySchema`** — one parsed line from a JSONL event log file.
   Fields: `seq` (z.number()), `ts` (z.string() — ISO-8601), `ev` (z.string() — MUST be z.string(), NOT z.enum()),
   `task_id` (z.string()), `agent_id` (z.string()), `parent_id` (z.string().optional()),
   `edge_label` (z.string().optional()), `output_files` (z.array(z.string()).optional()).

   CRITICAL: `ev` MUST be `z.string()`, not `z.enum(...)`. The live JSONL corpus contains an open-ended
   set of ev values beyond the commonly listed 5 (confirmed production values include AUDIT, AUDIT_PASS,
   AUDIT_FAIL, ENV_FIX, SPAWN, COMPLETE, CRITIQUE_BLOCK, CRITIQUE_PASS, AGENT_IMPROVEMENT, and others).
   A closed enum causes graceful-degradation parsers to silently drop every unrecognized ev row — producing
   zero AUDIT_PASS / AUDIT_FAIL counts in downstream stats. Use z.string().

2. **`AgentActivitySchema`** — per-agent roll-up for one session.
   Fields: `agent_id` (z.string()), `spawns` (z.number()), `completes` (z.number()),
   `feedback_loops` (z.number()),
   `critique_passes` (z.number() — count of ev==='CRITIQUE_PASS' events for this agent),
   `critique_blocks` (z.number() — count of ev==='CRITIQUE_BLOCK' events for this agent),
   `audit_passes` (z.number() — count of ev==='AUDIT_PASS' events for this agent),
   `audit_fails` (z.number() — count of ev==='AUDIT_FAIL' events for this agent),
   `wall_clock_ms` (z.number().optional()).

   NOTE on field semantics (cross-task coupling — t2b and t3 must use the same field names):
   - `critique_passes` / `critique_blocks` = plan-gate verdicts (CRITIQUE_PASS / CRITIQUE_BLOCK).
   - `audit_passes` / `audit_fails` = post-implementation gate verdicts (AUDIT_PASS / AUDIT_FAIL).
   These are distinct pipeline stages; do NOT conflate them.

3. **`SessionSchema`** — top-level parsed session object.
   Fields: `id` (z.string()), `sprint` (z.string()), `date` (z.string() — ISO-8601 date),
   `gap_classes` (z.array(z.string())), `status` (z.string()), `title` (z.string().optional()),
   `filePath` (z.string()), `editedFilePath` (z.string().optional()),
   `source_root` (z.string() — the configured source root this session was parsed from),
   `agents` (z.array(AgentActivitySchema)), `events` (z.array(EventLogEntrySchema)).

4. **`SessionStatsSchema`** — aggregated stats for a session.
   Fields: `session_id` (z.string()), `total_spawns` (z.number()), `total_completes` (z.number()),
   `total_feedback_loops` (z.number()), `total_critique_passes` (z.number()),
   `total_critique_blocks` (z.number()), `total_audit_passes` (z.number()),
   `total_audit_fails` (z.number()),
   `agents` (z.array(AgentActivitySchema)), `wall_clock_ms` (z.number().optional()),
   `event_count` (z.number()).

For each schema, export the Zod schema const AND export the inferred TypeScript type:
  `export type EventLogEntry = z.infer&lt;typeof EventLogEntrySchema&gt;`
  `export type AgentActivity = z.infer&lt;typeof AgentActivitySchema&gt;`
  `export type Session = z.infer&lt;typeof SessionSchema&gt;`
  `export type SessionStats = z.infer&lt;typeof SessionStatsSchema&gt;`

Section-level ownership: append only. Do not modify existing schema declarations.
All four additions go at the end of `packages/shared/src/schemas.ts`.

Style reference: the existing file at `packages/shared/src/schemas.ts`.
Authoritative field-shape source: `docs/programs/prog-studio-sessions-2026-05/program.md` Invariant 1 and
`docs/programs/prog-studio-sessions-2026-05/sprints/prog-studio-sessions-2026-05-s1-backend/orchestrator_brief.md` Outputs section.
      </description>
      <success_criteria>
SC1: `packages/shared/src/schemas.ts` exports `EventLogEntrySchema`, `AgentActivitySchema`, `SessionSchema`, `SessionStatsSchema` — verified with `grep -c "export const.*Schema" packages/shared/src/schemas.ts` returning ≥ 9 (5 existing + 4 new).
SC2: `packages/shared/src/schemas.ts` exports inferred types `EventLogEntry`, `AgentActivity`, `Session`, `SessionStats` — verified with `grep "export type" packages/shared/src/schemas.ts | wc -l` returning ≥ 4.
SC3: `ev` field is z.string() — verified with `grep "ev:" packages/shared/src/schemas.ts` showing `z.string()`, NOT `z.enum`.
SC4: `AgentActivitySchema` contains all four critique/audit fields — `grep -c "critique_passes\|critique_blocks\|audit_passes\|audit_fails" packages/shared/src/schemas.ts` returns 4.
SC5: `SessionSchema` contains `source_root` field — `grep "source_root" packages/shared/src/schemas.ts` returns a match.
SC6: Typecheck clean: `tsc --noEmit --project packages/shared/tsconfig.json` exits 0.
SC7: Server typecheck still clean: `tsc --noEmit --project packages/server/tsconfig.json` exits 0.
SC8: Client typecheck still clean: `tsc --noEmit --project packages/client/tsconfig.json` exits 0.
SC9: No existing schema declarations modified — `git diff HEAD -- packages/shared/src/schemas.ts | grep '^-[^-]' | grep -v '^---'` returns 0 removed lines (insert-only diff).
      </success_criteria>
      <context_files>
        packages/shared/src/schemas.ts
        docs/programs/prog-studio-sessions-2026-05/program.md
        docs/programs/prog-studio-sessions-2026-05/sprints/prog-studio-sessions-2026-05-s1-backend/orchestrator_brief.md
      </context_files>
      <dependencies>none</dependencies>
      <out_of_scope>
- Do NOT create any new files. This task is append-only to one file.
- Do NOT modify router.ts, env.ts, any parser files, or any client files.
- Do NOT use z.enum for the `ev` field in EventLogEntrySchema.
- Do NOT invent schema fields beyond what the program manifest and sprint brief specify.
- Do NOT write unit tests (t2b owns that).
- Do NOT register nav routes (S2 owns that).
      </out_of_scope>
      <estimated_new_lines>~60 lines (4 schemas + 4 type exports + source_root field + 4 critique/audit fields). Within the 50-LOC gate on first read, slightly over on precise count — audit gate runs to be safe.</estimated_new_lines>
      <output_expected>
        <tag>completion_packet</tag>
        <must_contain>
          <item>Confirmation that all 4 schema consts are exported from packages/shared/src/schemas.ts</item>
          <item>Confirmation that all 4 TypeScript types are exported (z.infer)</item>
          <item>Confirmation that ev field uses z.string() (grep evidence)</item>
          <item>Confirmation that AgentActivitySchema has critique_passes, critique_blocks, audit_passes, audit_fails fields</item>
          <item>Confirmation that SessionSchema has source_root field</item>
          <item>Result of tsc --noEmit across all 3 packages (exit codes)</item>
          <item>git diff line count showing insert-only (0 removed lines in schemas.ts)</item>
        </must_contain>
        <must_not_contain>
          <item>Any changes to router.ts, env.ts, or client files</item>
          <item>z.enum usage for the ev field</item>
        </must_not_contain>
        <success_signal>All 9 SCs pass; tsc exits 0 across all 3 packages; ev field confirmed z.string().</success_signal>
      </output_expected>
    </task_packet>

    <!-- ═══════════════════════════════════════════════════════════════ -->
    <!-- t2a: vitest setup (config-only)                                  -->
    <!-- ═══════════════════════════════════════════════════════════════ -->
    <task_packet>
      <task_id>prog-studio-sessions-2026-05-s1-backend-t2a</task_id>
      <assigned_to>BE</assigned_to>
      <priority>HIGH</priority>
      <description>
Configure vitest for the server package. Three changes only:

1. Verify vitest is already in devDependencies of `packages/server/package.json`.
   The Orchestrator pre-installs vitest before dispatching this task (via
   `npm install --save-dev vitest -w @gander-studio/server`), so this is a verification step only.
   If vitest is NOT found in devDependencies, halt immediately and surface to ORC — do NOT retry
   install silently and do NOT proceed to steps 2 or 3.

2. Add a `"test"` script to `packages/server/package.json`:
   `"test": "vitest run src/parsers/__tests__"`

3. Create `packages/server/vitest.config.ts` (minimal configuration — read the existing
   `packages/server/package.json` and any existing tsconfig to ensure the config is compatible).

No other changes. Do not touch env.ts, router.ts, schema files, or any parser file.
      </description>
      <success_criteria>
SC1: `packages/server/package.json` has `"vitest"` in devDependencies — `grep '"vitest"' packages/server/package.json` returns a match.
SC2: `packages/server/package.json` has `"test": "vitest run src/parsers/__tests__"` script — `grep '"test"' packages/server/package.json` returns a match.
SC3: `packages/server/vitest.config.ts` exists.
SC4: `tsc --noEmit --project packages/server/tsconfig.json` exits 0 (vitest config doesn't break TS).
      </success_criteria>
      <context_files>
        packages/server/package.json
        packages/server/tsconfig.json
      </context_files>
      <dependencies>prog-studio-sessions-2026-05-s1-backend-t1</dependencies>
      <out_of_scope>
- Do NOT run npm install (vitest is pre-installed by ORC before this task dispatches).
- Do NOT modify any parser files, schemas, router.ts, or env.ts.
- Do NOT write any test files or fixtures (t2b owns those).
- No audit gate for this config-only task.
      </out_of_scope>
      <estimated_new_lines>~15 lines (vitest.config.ts ~10L + package.json one-line edit). Config-only; no audit gate.</estimated_new_lines>
      <output_expected>
        <tag>completion_packet</tag>
        <must_contain>
          <item>Confirmation that vitest is present in devDependencies (grep evidence)</item>
          <item>Confirmation that "test" script is present in package.json</item>
          <item>Confirmation that vitest.config.ts exists</item>
          <item>tsc --noEmit exit code for server package</item>
        </must_contain>
        <must_not_contain>
          <item>Any npm install commands executed</item>
          <item>Any parser, schema, router, or env modifications</item>
        </must_not_contain>
        <success_signal>All 4 SCs pass; tsc exits 0 on server package.</success_signal>
      </output_expected>
    </task_packet>

    <!-- ═══════════════════════════════════════════════════════════════ -->
    <!-- t2b: session-parser + tests + fixtures                           -->
    <!-- ═══════════════════════════════════════════════════════════════ -->
    <task_packet>
      <task_id>prog-studio-sessions-2026-05-s1-backend-t2b</task_id>
      <assigned_to>BE</assigned_to>
      <priority>HIGH</priority>
      <description>
Create `packages/server/src/parsers/session-parser.ts` and its test suite.

**FILE: `packages/server/src/parsers/session-parser.ts`**

This parser reads a post-mortem markdown file on disk and returns a `Session` object
(validated against `SessionSchema` from `packages/shared/src/schemas.ts`).

Implementation requirements:
1. Read the file and use `gray-matter` (verify it is in packages/server/package.json devDependencies before importing) to extract frontmatter fields: `type`, `sprint`, `date`, `gap_classes`, `status`.
2. Derive the session `id` from the `sprint` frontmatter field (slug form).
3. Accept a `source_root` string parameter — the configured source root directory this file was found in. Set `session.source_root` to this value.
4. Scan the markdown body for Section 2 agent-activity tables (identified by a `## 2.` heading prefix). The parser MUST handle at least three distinct Section-2 table layouts gracefully:
   - Canonical 5-column: `| Seq | Timestamp | Event | Agent | Notes |`
   - Phase-subdivided: mini-tables per phase with different column sets (e.g. `| Step | Output | Notes |` with no Seq/Agent columns)
   - Wave-grouped: tables grouped by wave with agent rows
   For unrecognized layouts, return an empty `agents` array without throwing.
5. Group recognized table rows by `agent_id` and produce `AgentActivity` objects with the correct field names from `AgentActivitySchema`:
   - `spawns`: count of rows where ev column === 'SPAWN'
   - `completes`: count of rows where ev column === 'COMPLETE'
   - `critique_passes`: count of rows where ev column === 'CRITIQUE_PASS'
   - `critique_blocks`: count of rows where ev column === 'CRITIQUE_BLOCK'
   - `audit_passes`: count of rows where ev column === 'AUDIT_PASS'
   - `audit_fails`: count of rows where ev column === 'AUDIT_FAIL'
   - `feedback_loops`: count of consecutive same-agent SPAWN rows immediately following a CRITIQUE_BLOCK or AUDIT_FAIL row in the table
   - `wall_clock_ms`: duration from agent's first timestamp to last if timestamps parse; else undefined
6. Return `{ ...parsedFields, events: [] }` — the `events` array is populated by the event-log join in t3's session-stats.ts, not here.
7. Validate the returned object with `SessionSchema.parse()` before returning.
8. Export as `parseSessionFile(filePath: string, source_root: string): Promise&lt;Session&gt;`.

Style reference: read `packages/server/src/parsers/agent-parser.ts` for file-read + gray-matter usage pattern.

**FIXTURES: `packages/server/src/parsers/__tests__/fixtures/`**

Copy (do not symlink) at least 4 representative post-mortem files from `${GANDER_ROOT}/docs/post-mortems/` into this directory, covering at least 3 distinct Section-2 layouts:

Layout (a) — canonical Seq/Timestamp/Event/Agent/Notes table:
  Use `gander-studio-p1.md`

Layout (b) — phase-subdivided mini-tables (Phase headings with Step/Output/Notes columns):
  Use `gander-p7-obsidian-l2-l3.md`

Layout (c) — wave-grouped tables:
  Use `gander-studio-p2-agent-cards.md`

Fourth fixture (any additional post-mortem not already covered):
  Use `gander-p5-obsidian-l0-l1.md` or another recent file.

Tests must be self-contained — they must NOT rely on GANDER_ROOT being set at test time.
The fixture files copied into __tests__/fixtures/ are the test inputs.

**FILE: `packages/server/src/parsers/__tests__/session-parser.test.ts`**

Write unit tests covering:
1. For each of the 4+ fixtures: parse frontmatter fields correctly (type, sprint, date, gap_classes, status).
2. For each fixture: result validates against `SessionSchema.parse()` without throwing.
3. For layout (a) fixture (gander-studio-p1.md): extracts at least 1 AgentActivity entry.
4. For layout (b) fixture (gander-p7-obsidian-l2-l3.md): either produces ≥ 1 AgentActivity entry OR is covered by an explicit "unrecognized layout returns empty agents array without throw" test.
5. For layout (c) fixture: extracts at least 1 AgentActivity entry OR explicit empty-array test.
6. All AgentActivity entries use the correct field names: `critique_passes`, `critique_blocks`, `audit_passes`, `audit_fails` (NOT `audit_passes_old` or any conflated name).
7. A synthetic test with no Section 2 at all: empty agents array, no throw.
8. `source_root` field is set to the value passed to `parseSessionFile`.
      </description>
      <success_criteria>
SC1: `packages/server/src/parsers/session-parser.ts` exists and exports `parseSessionFile(filePath: string, source_root: string): Promise&lt;Session&gt;`.
SC2: `packages/server/src/parsers/__tests__/session-parser.test.ts` exists.
SC3: At least 4 fixture files exist under `packages/server/src/parsers/__tests__/fixtures/`, covering layouts (a), (b), (c) plus one additional.
SC4: Layout coverage: one fixture covers canonical 5-column table, one covers phase-subdivided format, one covers wave-grouped format.
SC5: `npm test -w @gander-studio/server` exits 0 and all session-parser tests pass.
SC6: Each fixture test validates the result with `SessionSchema.parse()` (no manual field checks that bypass Zod).
SC7: AgentActivity field-name correctness: `grep "critique_passes\|critique_blocks\|audit_passes\|audit_fails" packages/server/src/parsers/session-parser.ts` returns ≥ 4 distinct matches (all four fields counted).
SC8: Layout (b) fixture is explicitly covered by either a "produces ≥ 1 agent" assertion or a "produces empty agents array without throw" assertion.
SC9: Typecheck clean: `tsc --noEmit --project packages/server/tsconfig.json` exits 0.
SC10: Shared typecheck still clean: `tsc --noEmit --project packages/shared/tsconfig.json` exits 0.
      </success_criteria>
      <context_files>
        packages/shared/src/schemas.ts
        packages/server/src/parsers/agent-parser.ts
        packages/server/src/env.ts
        packages/server/package.json
        docs/programs/prog-studio-sessions-2026-05/sprints/prog-studio-sessions-2026-05-s1-backend/orchestrator_brief.md
      </context_files>
      <dependencies>prog-studio-sessions-2026-05-s1-backend-t2a</dependencies>
      <out_of_scope>
- Do NOT modify any existing parser files (agent-parser.ts, skill-parser.ts, hook-parser.ts).
- Do NOT touch router.ts or env.ts (t4 owns those).
- Do NOT implement event-log parsing or stats join (t3 owns those).
- Do NOT implement saveEdit (t5 owns that).
- Do NOT modify packages/client or packages/shared (t1 owns schemas.ts).
- Do NOT use z.enum for ev — read the AgentActivitySchema fields from the t1 output in schemas.ts.
      </out_of_scope>
      <estimated_new_lines>~130 lines (parser ~80L + test file ~50L). Exceeds 50-LOC gate — audit pipeline runs after this task before t3 starts.</estimated_new_lines>
      <output_expected>
        <tag>completion_packet</tag>
        <must_contain>
          <item>Result of `npm test -w @gander-studio/server` (exit code + test pass count)</item>
          <item>Result of `tsc --noEmit` across server and shared packages</item>
          <item>List of 4+ fixture files placed in __tests__/fixtures/ with their Section-2 layout type identified</item>
          <item>Confirmation that SessionSchema.parse() is called inside each fixture test</item>
          <item>Confirmation that AgentActivity uses critique_passes/critique_blocks/audit_passes/audit_fails field names</item>
          <item>Confirmation that layout (b) fixture is covered by an explicit test (either ≥1 agent or empty-array-no-throw)</item>
        </must_contain>
        <must_not_contain>
          <item>Modifications to existing parser files</item>
          <item>Any router.ts or env.ts changes</item>
          <item>AgentActivity fields named "audit_passes" that count CRITIQUE_PASS events (wrong semantics)</item>
        </must_not_contain>
        <success_signal>All 10 SCs pass; `npm test -w @gander-studio/server` exits 0; tsc exits 0 on server + shared.</success_signal>
      </output_expected>
    </task_packet>

    <!-- ═══════════════════════════════════════════════════════════════ -->
    <!-- t3: Event-log parser + stats join + tests                       -->
    <!-- ═══════════════════════════════════════════════════════════════ -->
    <task_packet>
      <task_id>prog-studio-sessions-2026-05-s1-backend-t3</task_id>
      <assigned_to>BE</assigned_to>
      <priority>HIGH</priority>
      <description>
Create two new files:

**FILE 1: `packages/server/src/parsers/event-log-parser.ts`**

Exports `parseEventLogFiles(eventsDir: string, sprintSlug: string, dateRange?: { from: string; to: string }): Promise&lt;EventLogEntry[]&gt;`

Implementation:
- Reads all `${eventsDir}/agent-events-*.jsonl` files.
- For each file, reads line-by-line, parses each line as JSON.
- Validates each parsed line against `EventLogEntrySchema` (from `packages/shared/src/schemas.ts`) using `.safeParse()`. Lines that fail validation are skipped with a `console.warn` message — do NOT throw. Because `ev` is z.string(), every well-formed line with any ev value will parse successfully (no silent drops for unknown ev values).
- Filters by `task_id` prefix matching `sprintSlug` (substring match: `entry.task_id.startsWith(sprintSlug)` or `entry.task_id.includes(sprintSlug)`).
- If `dateRange` is provided, also filters by the `ts` field (ISO-8601 string comparison).
- Returns the filtered, validated array of `EventLogEntry` objects sorted by `seq` ascending.

**FILE 2: `packages/server/src/parsers/session-stats.ts`**

Exports `computeSessionStats(session: Session, events: EventLogEntry[]): SessionStats`

Uses the exact field names from `AgentActivitySchema` and `SessionStatsSchema` (read from t1's output in `packages/shared/src/schemas.ts`):
- `session_id`: session.id
- `total_spawns`: count of events where ev === 'SPAWN'
- `total_completes`: count of events where ev === 'COMPLETE'
- `total_critique_passes`: count of events where ev === 'CRITIQUE_PASS'
- `total_critique_blocks`: count of events where ev === 'CRITIQUE_BLOCK'
- `total_audit_passes`: count of events where ev === 'AUDIT_PASS'
- `total_audit_fails`: count of events where ev === 'AUDIT_FAIL'
- `total_feedback_loops`: count of consecutive same-agent SPAWN events immediately following a CRITIQUE_BLOCK or AUDIT_FAIL event in the event stream
- `agents`: per-agent roll-up — group events by agent_id, count each ev type per agent using the AgentActivitySchema field names (critique_passes, critique_blocks, audit_passes, audit_fails, spawns, completes); compute per-agent wall_clock_ms from first to last event timestamp if parseable
- `wall_clock_ms`: if events.length >= 2, compute Date.parse(events[last].ts) - Date.parse(events[0].ts); else undefined
- `event_count`: events.length
- Validates output with `SessionStatsSchema.parse()` before returning.

**FIXTURE: `packages/server/src/parsers/__tests__/fixtures/agent-events-fixture.jsonl`**

Create a JSONL fixture file with at least 8 representative event lines. Must include all of:
SPAWN, COMPLETE, CRITIQUE_BLOCK, CRITIQUE_PASS, AUDIT_PASS, AUDIT_FAIL
(at least 6 distinct ev values to prove the z.string() schema accepts them all).
Must include at least one CRITIQUE_BLOCK → same-agent SPAWN sequence for feedback_loop testing.

**TESTS: `packages/server/src/parsers/__tests__/event-log-parser.test.ts`**

Write unit tests covering:
1. `parseEventLogFiles` returns only events matching the slug filter.
2. Malformed JSON lines are skipped without throwing.
3. A line with `ev: "AUDIT_PASS"` parses successfully — this test must explicitly assert the AUDIT_PASS event is in the returned array (regression guard against z.enum reintroduction).
4. A line with `ev: "AUDIT_FAIL"` parses successfully — explicit assertion.
5. `computeSessionStats` returns a valid SessionStats object validated with `SessionStatsSchema.parse()`.
6. The feedback_loop count correctly identifies the CRITIQUE_BLOCK → same-agent SPAWN case in the fixture.
7. Per-agent roll-up uses correct field names: `critique_passes`, `critique_blocks`, `audit_passes`, `audit_fails`.
      </description>
      <success_criteria>
SC1: `packages/server/src/parsers/event-log-parser.ts` exists and exports `parseEventLogFiles`.
SC2: `packages/server/src/parsers/session-stats.ts` exists and exports `computeSessionStats`.
SC3: `packages/server/src/parsers/__tests__/event-log-parser.test.ts` exists.
SC4: `packages/server/src/parsers/__tests__/fixtures/agent-events-fixture.jsonl` exists with ≥ 8 event lines covering ≥ 6 distinct ev values (SPAWN, COMPLETE, CRITIQUE_BLOCK, CRITIQUE_PASS, AUDIT_PASS, AUDIT_FAIL).
SC5: `npm test -w @gander-studio/server` exits 0 and all event-log-parser tests pass.
SC6: Test explicitly asserts that a fixture line with `ev:"AUDIT_PASS"` is in the returned parse result — `grep "AUDIT_PASS" packages/server/src/parsers/__tests__/event-log-parser.test.ts` returns a match in an assertion context.
SC7: Test explicitly asserts that a fixture line with `ev:"AUDIT_FAIL"` is in the returned parse result.
SC8: The feedback_loop test covers the CRITIQUE_BLOCK → same-agent SPAWN case explicitly.
SC9: `SessionStatsSchema.parse()` is called inside `computeSessionStats` (not just in tests) — `grep "SessionStatsSchema.parse" packages/server/src/parsers/session-stats.ts` returns a match.
SC10: Field names in session-stats.ts match AgentActivitySchema exactly — `grep -c "critique_passes\|critique_blocks\|audit_passes\|audit_fails" packages/server/src/parsers/session-stats.ts` returns ≥ 4.
SC11: Typecheck clean: `tsc --noEmit --project packages/server/tsconfig.json` exits 0.
      </success_criteria>
      <context_files>
        packages/shared/src/schemas.ts
        packages/server/src/parsers/session-parser.ts
        docs/programs/prog-studio-sessions-2026-05/sprints/prog-studio-sessions-2026-05-s1-backend/orchestrator_brief.md
      </context_files>
      <dependencies>prog-studio-sessions-2026-05-s1-backend-t2b</dependencies>
      <out_of_scope>
- Do NOT modify session-parser.ts (t2b owns it).
- Do NOT touch router.ts or env.ts (t4 owns those).
- Do NOT implement saveEdit or path-traversal checks (t5 owns those).
- Do NOT modify any client files.
      </out_of_scope>
      <estimated_new_lines>~190 lines (event-log-parser ~70L + session-stats ~70L + test file ~50L). Exceeds 50-LOC gate — audit pipeline runs after this task before t4 starts.</estimated_new_lines>
      <output_expected>
        <tag>completion_packet</tag>
        <must_contain>
          <item>Result of `npm test -w @gander-studio/server` (exit code + pass count)</item>
          <item>Result of `tsc --noEmit --project packages/server/tsconfig.json`</item>
          <item>Confirmation that SessionStatsSchema.parse() is called inside computeSessionStats (grep evidence)</item>
          <item>Confirmation that the AUDIT_PASS and AUDIT_FAIL fixture lines parse successfully (test assertion confirmed)</item>
          <item>Confirmation that the feedback_loop test covers CRITIQUE_BLOCK → same-agent SPAWN</item>
          <item>Confirmation that session-stats.ts uses critique_passes/critique_blocks/audit_passes/audit_fails field names</item>
        </must_contain>
        <must_not_contain>
          <item>Any changes to router.ts, env.ts, or client files</item>
          <item>Any z.enum usage for the ev field</item>
        </must_not_contain>
        <success_signal>All 11 SCs pass; `npm test -w @gander-studio/server` exits 0; tsc exits 0 on server package.</success_signal>
      </output_expected>
    </task_packet>

    <!-- ═══════════════════════════════════════════════════════════════ -->
    <!-- t4: tRPC procedures + env wiring + docs                         -->
    <!-- ═══════════════════════════════════════════════════════════════ -->
    <task_packet>
      <task_id>prog-studio-sessions-2026-05-s1-backend-t4</task_id>
      <assigned_to>BE</assigned_to>
      <priority>HIGH</priority>
      <description>
Wire env config, tRPC procedures, and documentation. Four files touched; section-level ownership is explicit below.

**FILE 1 — `packages/server/src/env.ts` (APPEND ONLY — do not touch existing declarations):**

Add two new exported consts using the optional-with-default pattern (same as `EXPORT_BASE_DIR` already in the file):

1. `SESSIONS_EDITS_DIR` — where session markdown edits are saved.
   Constraint: the default value MUST resolve to an absolute path regardless of whether `LOADOUTS_DIR`
   is configured as a relative or absolute path. Apply `path.resolve()` normalization to `LOADOUTS_DIR`
   before computing the default. Reference the `EXPORT_BASE_DIR` style for the optional-with-default
   pattern. Do NOT use `requireEnv()` for this variable (it has a safe default).
   Add a SC: SESSIONS_EDITS_DIR resolves to an absolute path regardless of LOADOUTS_DIR being relative
   or absolute (verified by inspection or unit test — see SC10).

2. `SESSIONS_SOURCE_DIRS` — list of root directories whose `docs/post-mortems/*.md` are scanned by
   `session.list`. Type: `string[]`. Parse from env var as a comma-delimited string → string[], applying
   `path.resolve()` to each entry to normalize relative paths to absolute.
   Default: `[path.resolve(GANDER_ROOT)]` — when unset, behavior is identical to GANDER_ROOT-only.
   Add a Zod validation for the parsed list at the boundary (e.g., `z.array(z.string().min(1))`).
   Wire into env.ts using the same conventions as other variables in that file.
   Import `path` from `'node:path'` at the top if not already imported.

**FILE 2 — `packages/server/src/router.ts` (APPEND session router namespace — do not modify existing procedures):**

Read `packages/server/src/router.ts` top-to-bottom to understand the existing sub-router pattern
before writing. The existing `guardPath` helper (lines 22-31) demonstrates the `path.resolve` guard
pattern — reference it when writing the session.saveEdit stub.

Register four new procedures under a `session` namespace matching the existing sub-router style:

a. `session.list` (query):
   - Input: `z.object({ limit: z.number().int().min(1).max(100).default(50) })`
   - Output: `z.array(SessionSchema)`
   - Implementation: for each directory in `SESSIONS_SOURCE_DIRS`, glob `${dir}/docs/post-mortems/*.md`,
     parse each with `parseSessionFile(filePath, dir)` (passing the source root as the second arg),
     merge results across all source roots, deduplicate by session id, sort by date desc, apply limit.

b. `session.get` (query):
   - Input: `z.object({ id: z.string() })`
   - Output: `SessionSchema`
   - Implementation: search across all SESSIONS_SOURCE_DIRS for the post-mortem file whose `sprint`
     frontmatter matches id; parse and return.

c. `session.getStats` (query):
   - Input: `z.object({ id: z.string() })`
   - Output: `SessionStatsSchema`
   - Implementation: find and parse the session, call `parseEventLogFiles` with the session's source_root
     docs/events directory and the session's sprint slug, call `computeSessionStats`, return result.

d. `session.saveEdit` (mutation) — security stub:
   - Input: `z.object({ id: z.string(), content: z.string() })`
   - Output: `z.object({ success: z.boolean(), filePath: z.string() })`
   - Implementation: apply path-traversal protection before writing. Constraint: resolve both the base
     directory (SESSIONS_EDITS_DIR) and the candidate target with `path.resolve` before any comparison
     check. The candidate path must not escape the resolved base — throw TRPCError FORBIDDEN if it does.
     Reference the existing `guardPath` helper in this file for the `path.resolve` guard pattern and
     match its style. Create `SESSIONS_EDITS_DIR` if missing (fs.mkdirSync recursive). Write content
     to file. Return `{ success: true, filePath }`.
     t5 will harden this further via the extracted `validateSaveEditPath` helper; ship a working
     version that already uses path.resolve on both sides.

**FILE 3 — `.env.example` (APPEND ONLY):**

Add documentation rows for both new env vars:
```
# SESSIONS_EDITS_DIR — directory where session markdown edits are saved
# Default: computed from LOADOUTS_DIR (absolute-normalized), adjacent sessions-edits folder
# SESSIONS_EDITS_DIR=/path/to/sessions-edits

# SESSIONS_SOURCE_DIRS — comma-delimited list of root directories to scan for post-mortems
# Default: GANDER_ROOT (when unset, only GANDER_ROOT/docs/post-mortems/ is scanned)
# SESSIONS_SOURCE_DIRS=/path/to/gander,/path/to/other-project
```

**FILE 4 — `/home/jhber/projects/gander-studio-alpha/CLAUDE.md` (APPEND TO ENV TABLE):**

Read CLAUDE.md first to locate the environment variables table. Add two rows after the existing rows:
| `SESSIONS_EDITS_DIR` | No | Directory where session markdown edits are saved (default: absolute-normalized path adjacent to `LOADOUTS_DIR`) |
| `SESSIONS_SOURCE_DIRS` | No | Comma-delimited list of root directories to scan for post-mortems (default: `GANDER_ROOT`) |

Section-level file ownership summary:
- env.ts: append SESSIONS_EDITS_DIR + SESSIONS_SOURCE_DIRS only. All existing vars untouched.
- router.ts: append session.* namespace only. All existing procedures untouched.
- .env.example: append documentation rows only.
- CLAUDE.md: append two table rows only.
      </description>
      <success_criteria>
SC1: `packages/server/src/env.ts` exports `SESSIONS_EDITS_DIR` — `grep "SESSIONS_EDITS_DIR" packages/server/src/env.ts` returns a match.
SC2: `packages/server/src/env.ts` exports `SESSIONS_SOURCE_DIRS` as string[] — `grep "SESSIONS_SOURCE_DIRS" packages/server/src/env.ts` returns a match.
SC3: `packages/server/src/router.ts` contains all four procedures: session.list, session.get, session.getStats, session.saveEdit — `grep "session\." packages/server/src/router.ts | wc -l` returns ≥ 4 distinct matches.
SC4: session.list globs across SESSIONS_SOURCE_DIRS (plural) — `grep "SESSIONS_SOURCE_DIRS" packages/server/src/router.ts` returns a match.
SC5: parseSessionFile is called with source_root as second argument — `grep "parseSessionFile" packages/server/src/router.ts` shows two-arg call.
SC6: session.saveEdit uses path.resolve on both safeBase and target before comparison — `grep "path.resolve" packages/server/src/router.ts` returns ≥ 2 matches in the saveEdit handler.
SC7: `.env.example` contains both SESSIONS_EDITS_DIR and SESSIONS_SOURCE_DIRS — `grep -c "SESSIONS_EDITS_DIR\|SESSIONS_SOURCE_DIRS" .env.example` returns ≥ 2.
SC8: CLAUDE.md env table contains both new rows — `grep -c "SESSIONS_EDITS_DIR\|SESSIONS_SOURCE_DIRS" /home/jhber/projects/gander-studio-alpha/CLAUDE.md` returns ≥ 2.
SC9: All existing procedures untouched — `git diff HEAD -- packages/server/src/router.ts | grep '^-[^-]'` shows no removed lines from existing procedure blocks.
SC10: SESSIONS_EDITS_DIR resolves to an absolute path regardless of LOADOUTS_DIR being relative or absolute — verified by inspection: the default expression in env.ts must call path.resolve() on LOADOUTS_DIR before computing the directory. Auditor reads env.ts and confirms.
SC11: Typecheck clean: all three `tsc --noEmit` commands exit 0.
SC12: `npm test -w @gander-studio/server` still exits 0 (no regressions from wiring).
      </success_criteria>
      <context_files>
        packages/server/src/router.ts
        packages/server/src/env.ts
        packages/server/src/parsers/session-parser.ts
        packages/server/src/parsers/event-log-parser.ts
        packages/server/src/parsers/session-stats.ts
        packages/shared/src/schemas.ts
        .env.example
        /home/jhber/projects/gander-studio-alpha/CLAUDE.md
        docs/programs/prog-studio-sessions-2026-05/sprints/prog-studio-sessions-2026-05-s1-backend/orchestrator_brief.md
      </context_files>
      <dependencies>prog-studio-sessions-2026-05-s1-backend-t3</dependencies>
      <out_of_scope>
- Do NOT modify packages/client or packages/shared.
- Do NOT implement additional aggregation dimensions beyond what SessionStatsSchema specifies (S3 will request via dag_update_request if needed).
- Do NOT add nav registration (S2 owns that).
- Do NOT write unit tests for path-traversal (t5 owns those).
- Do NOT hardcode prescriptive guard code snippets — use constraint descriptions and reference the existing guardPath helper.
      </out_of_scope>
      <estimated_new_lines>~140 lines (env.ts +10L, router.ts ~120L, .env.example +8L, CLAUDE.md +3L). Exceeds 50-LOC gate — audit pipeline runs after this task before t5 starts.</estimated_new_lines>
      <output_expected>
        <tag>completion_packet</tag>
        <must_contain>
          <item>Result of all three `tsc --noEmit` commands (exit codes)</item>
          <item>Result of `npm test -w @gander-studio/server` (exit code)</item>
          <item>grep confirmation that all 4 session.* procedures exist in router.ts</item>
          <item>grep confirmation SESSIONS_EDITS_DIR and SESSIONS_SOURCE_DIRS appear in env.ts, .env.example, and CLAUDE.md</item>
          <item>Confirmation that SESSIONS_EDITS_DIR default uses path.resolve on LOADOUTS_DIR (env.ts inspection)</item>
          <item>Confirmation that session.list globs across SESSIONS_SOURCE_DIRS (code evidence)</item>
          <item>Confirmation that parseSessionFile is called with source_root as second argument</item>
          <item>git diff removed-lines count for router.ts (should be 0)</item>
        </must_contain>
        <must_not_contain>
          <item>Any client file modifications</item>
          <item>Any shared/src/schemas.ts modifications (t1 owns that)</item>
          <item>SESSIONS_EDITS_DIR default that does not apply path.resolve to LOADOUTS_DIR</item>
        </must_not_contain>
        <success_signal>All 12 SCs pass; tsc exits 0 across all 3 packages; npm test exits 0.</success_signal>
      </output_expected>
    </task_packet>

    <!-- ═══════════════════════════════════════════════════════════════ -->
    <!-- t5: saveEdit path-traversal hardening + security tests          -->
    <!-- ═══════════════════════════════════════════════════════════════ -->
    <task_packet>
      <task_id>prog-studio-sessions-2026-05-s1-backend-t5</task_id>
      <assigned_to>BE</assigned_to>
      <priority>HIGH</priority>
      <description>
Extract the `session.saveEdit` path-traversal guard into a testable pure function and write security-focused unit tests.

**STEP 1 — Extract the guard as a pure exported helper.**

Create (or verify placement in) `packages/server/src/parsers/saveedit-guard.ts` exporting:
  `validateSaveEditPath(id: string, editsDir: string): string`

This function takes the session id and the absolute edits base directory, and either returns the
resolved absolute target path (on success) or throws.

Guard constraints (do NOT copy prescriptive code — implement from these constraints):
- Compute `safeBase` by applying `path.resolve()` to `editsDir`.
- Compute `target` by applying `path.resolve()` to the joined path of `editsDir` and `id + '.md'`.
- Reject (throw `Error` or a detectable error subclass) if `target` does not equal `safeBase` AND
  does not start with `safeBase + path.sep`.
- The guard is a pure function: no filesystem reads or writes.

Reference: read the existing `guardPath` helper in `packages/server/src/router.ts` and match its style.
The `session.saveEdit` mutation in router.ts should call `validateSaveEditPath(id, SESSIONS_EDITS_DIR)`
and throw `TRPCError({ code: 'FORBIDDEN' })` if it throws (or re-throw).

**STEP 2 — Write security unit tests.**

Create `packages/server/src/parsers/__tests__/saveedit-security.test.ts` with these mandatory test cases:

1. `id = "../../../etc/passwd"` → throws (path traversal blocked).
2. `id = "session-ok"` → returns a path that is inside editsDir (positive case; assert startsWith safeBase).
3. `id = "../../etc/hosts"` → throws.
4. `id = "subdir/session-ok"` — document the policy choice in a comment: either accepted (subdir allowed) or rejected (only flat ids allowed); test that the chosen behavior is consistent.
5. `id = ""` → throws or returns editsDir itself — document behavior in a comment.

Do NOT write to the filesystem in these tests — test the guard logic only (pure function).
      </description>
      <success_criteria>
SC1: `packages/server/src/parsers/saveedit-guard.ts` exists and exports `validateSaveEditPath(id: string, editsDir: string): string`.
SC2: `packages/server/src/parsers/__tests__/saveedit-security.test.ts` exists.
SC3: `npm test -w @gander-studio/server` exits 0 and includes saveedit-security tests.
SC4: All 5 mandatory test cases are present (auditor reads the test file to verify coverage).
SC5: The guard in `saveedit-guard.ts` uses `path.resolve()` on BOTH `editsDir` (to get safeBase) and the joined candidate path (to get target) — auditor reads the implementation.
SC6: No filesystem writes occur in the security tests — `grep "writeFile\|mkdirSync\|mkdir\|writeFileSync" packages/server/src/parsers/__tests__/saveedit-security.test.ts` returns 0 matches.
SC7: `session.saveEdit` in router.ts calls `validateSaveEditPath` — `grep "validateSaveEditPath" packages/server/src/router.ts` returns a match.
SC8: Typecheck clean: `tsc --noEmit --project packages/server/tsconfig.json` exits 0.
SC9: Sprint-level regression: `tsc --noEmit` across all 3 packages exits 0; existing procedures (agent.*, skill.*, hook.*, loadout.*, export.*, health) untouched.
SC10: `npm test -w @gander-studio/server` shows no regressions from prior tasks.
      </success_criteria>
      <context_files>
        packages/server/src/router.ts
        packages/server/src/env.ts
        packages/server/src/parsers/__tests__/
        docs/programs/prog-studio-sessions-2026-05/sprints/prog-studio-sessions-2026-05-s1-backend/orchestrator_brief.md
      </context_files>
      <dependencies>prog-studio-sessions-2026-05-s1-backend-t4</dependencies>
      <out_of_scope>
- Do NOT modify packages/client or packages/shared.
- Do NOT modify any parser files from t2b or t3 (session-parser.ts, event-log-parser.ts, session-stats.ts).
- Do NOT modify env.ts or .env.example (t4 owns those).
- Do NOT add new tRPC procedures beyond refactoring the saveEdit guard into a helper.
      </out_of_scope>
      <estimated_new_lines>~80 lines (guard helper ~20L + test file ~60L). Exceeds 50-LOC gate — audit pipeline runs after this task (sprint-final audit gate).</estimated_new_lines>
      <output_expected>
        <tag>completion_packet</tag>
        <must_contain>
          <item>Result of `npm test -w @gander-studio/server` (exit code + full test list)</item>
          <item>Result of all three `tsc --noEmit` commands (exit codes)</item>
          <item>Confirmation that all 5 malicious-input test cases are present and pass</item>
          <item>Confirmation that saveedit-guard.ts uses path.resolve on both editsDir and the joined candidate (auditor reads implementation)</item>
          <item>Confirmation that session.saveEdit in router.ts calls validateSaveEditPath (grep evidence)</item>
          <item>Confirmation no filesystem writes in security tests (grep evidence)</item>
        </must_contain>
        <must_not_contain>
          <item>Any client, shared, or existing-parser file modifications</item>
          <item>A guard that uses startsWith without path.resolve on both sides</item>
          <item>Inline prescriptive code snippets in place of constraint descriptions</item>
        </must_not_contain>
        <success_signal>All 10 SCs pass; final sprint audit gate: SA + QA + SX all PASS on this task's output.</success_signal>
      </output_expected>
    </task_packet>

  </task_packets>

  <dependency_order>
    prog-studio-sessions-2026-05-s1-backend-t1
      → prog-studio-sessions-2026-05-s1-backend-t2a
        → prog-studio-sessions-2026-05-s1-backend-t2b
          → prog-studio-sessions-2026-05-s1-backend-t3
            → prog-studio-sessions-2026-05-s1-backend-t4
              → prog-studio-sessions-2026-05-s1-backend-t5

    All six packets are sequential. No parallelism within this sprint.
    Rationale: t2b writes to __tests__/; t3 appends to __tests__/ (shared-file append serialization rule);
    t4 imports from parsers created in t2b+t3; t5 hardens router code created in t4.
    Sequential chain is mandatory.

    Audit gates: t1 (borderline LOC — run audit), t2b (≥130 LOC — audit required), t3 (≥190 LOC — audit required),
    t4 (≥140 LOC — audit required), t5 (≥80 LOC — sprint-final audit gate SA+QA+SX).
    t2a: config-only (~15 LOC), no audit gate.
  </dependency_order>

  <routing_notes>

    <!-- ═══════════════════════════════════════════════════════════════ -->
    <!-- CRITIC CHALLENGE RESOLUTION (all 8 challenges)                  -->
    <!-- ═══════════════════════════════════════════════════════════════ -->

    <critic_challenge_resolution challenge="B1" severity="BLOCKER">
      B1 (ev enum → z.string()): RESOLVED. t1 description now explicitly states ev MUST be z.string(),
      not z.enum. The out_of_scope for t1 includes "Do NOT use z.enum for the ev field". t1 SC3 verifies
      via grep that the field is z.string(). t3 SC6 and SC7 explicitly assert that AUDIT_PASS and AUDIT_FAIL
      events parse successfully (regression guard against z.enum reintroduction). The risk_flag about ev enum
      has been removed (it was a risk; it is now a contract).
    </critic_challenge_resolution>

    <critic_challenge_resolution challenge="B2" severity="BLOCKER">
      B2 (AgentActivitySchema field semantics): RESOLVED via option (a). AgentActivitySchema now has:
      critique_passes (ev==='CRITIQUE_PASS'), critique_blocks (ev==='CRITIQUE_BLOCK'),
      audit_passes (ev==='AUDIT_PASS'), audit_fails (ev==='AUDIT_FAIL').
      All four tasks that touch these fields are in lockstep: t1 (schema definition), t2b (session-parser.ts
      counting algorithm + SC7 field-name grep), t3 (event-log-parser.ts + session-stats.ts counting algorithm +
      SC10 field-name grep), t4 (router references schemas). SessionStatsSchema also adds total_critique_passes,
      total_critique_blocks, total_audit_passes, total_audit_fails for session-level aggregation.
    </critic_challenge_resolution>

    <critic_challenge_resolution challenge="B3" severity="BLOCKER">
      B3 (SESSIONS_EDITS_DIR must be absolute): RESOLVED. t4 description now states the constraint:
      "the default value MUST resolve to an absolute path regardless of whether LOADOUTS_DIR is configured
      as a relative or absolute path. Apply path.resolve() normalization to LOADOUTS_DIR before computing
      the default." No prescriptive code snippet (per W4 guidance). t4 SC10 requires the auditor to verify
      path.resolve is applied by reading the env.ts implementation. Same path.resolve normalization applied to
      SESSIONS_SOURCE_DIRS entries.
    </critic_challenge_resolution>

    <critic_challenge_resolution challenge="W1" severity="WARNING">
      W1 (t2 overscoped): RESOLVED. t2 is split into t2a (vitest config only, ~15 LOC, no audit gate)
      and t2b (session-parser.ts + tests + fixtures, ~130 LOC, audit gate). Total agent count: 6 (was 5).
      Dependency chain updated: t1 → t2a → t2b → t3 → t4 → t5.
    </critic_challenge_resolution>

    <critic_challenge_resolution challenge="W2" severity="WARNING">
      W2 (vitest install dependency): RESOLVED. t2a description states: "The Orchestrator pre-installs
      vitest before dispatching this task. If vitest is NOT found in devDependencies, halt immediately and
      surface to ORC — do NOT retry install silently." Pre-dispatch note recorded below.
    </critic_challenge_resolution>

    <critic_challenge_resolution challenge="W3" severity="WARNING">
      W3 (source scope configurable — HUMAN DECISION: CONFIGURABLE): RESOLVED. New env var
      SESSIONS_SOURCE_DIRS added to t4. Default = [path.resolve(GANDER_ROOT)] preserving program.md
      Invariant 2 as the default. Comma-delimited parse convention matches tools/communicates_with
      pattern. path.resolve normalization applied to each entry. session.list globs across all configured
      roots; parseSessionFile receives source_root as second argument; Session.source_root field added
      to t1's SessionSchema. Wired into env.ts, .env.example, and CLAUDE.md env table. Zod validation
      for the parsed list at the boundary. This is folded into t4 (not a separate packet) — LOC estimate
      updated to ~140L to account for the additional env var and multi-root glob logic.
    </critic_challenge_resolution>

    <critic_challenge_resolution challenge="W4" severity="WARNING">
      W4 (duplicated guard snippets): RESOLVED. Both t4 and t5 now use constraint-only descriptions
      for the path-traversal guard — no inline code snippets. t4 says "apply path.resolve on both sides,
      reference the existing guardPath helper for style." t5 says "guard must satisfy these constraints:
      (a) resolve both safeBase and target; (b) reject if target does not start with safeBase + path.sep;
      (c) match guardPath style." Both packets reference the existing guardPath helper at router.ts lines
      22-31 as the in-tree style reference.
    </critic_challenge_resolution>

    <critic_challenge_resolution challenge="W5" severity="WARNING">
      W5 (fixture coverage): RESOLVED. t2b SC3 now requires ≥ 4 fixture files. SC4 explicitly names the
      three distinct layouts: (a) canonical 5-column Seq/Timestamp/Event/Agent/Notes, (b) phase-subdivided
      mini-tables, (c) wave-grouped tables. SC8 requires that layout (b) fixture is explicitly covered by
      either a "produces ≥ 1 agent" assertion or a "produces empty agents array without throw" assertion,
      making format-variation tolerance contractual rather than aspirational.
    </critic_challenge_resolution>

    <!-- ═══════════════════════════════════════════════════════════════ -->
    <!-- PRE-DISPATCH NOTE (ORC executes before t2a)                     -->
    <!-- ═══════════════════════════════════════════════════════════════ -->
    <pre_dispatch_note task="t2a">
      Before dispatching t2a, ORC runs:
        npm install --save-dev vitest -w @gander-studio/server
      and confirms success via:
        grep '"vitest"' packages/server/package.json
      If the grep fails, halt and surface to the human before t2a dispatches.
      t2a treats vitest as present-by-precondition and does NOT run npm install.
    </pre_dispatch_note>

    <!-- ═══════════════════════════════════════════════════════════════ -->
    <!-- RECURRING PATTERNS FROM RECENT POST-MORTEMS                     -->
    <!-- ═══════════════════════════════════════════════════════════════ -->

    <recurring_pattern source="gander-studio-p2-agent-cards.md">
      OVERSCOPED: PM v1 of agent-cards packed 4 files into one FE task despite the canvas-link C2 pattern.
      This revision: t2 is split into t2a (3 files, config-only) + t2b (2 files + fixtures). The split was
      mandated by the Critic (W1) and is implemented here. Risk accepted that t2b is still 130 LOC (2 core
      files + 4 fixtures + test file) — this is the minimum coherent unit for parser + tests.
    </recurring_pattern>

    <recurring_pattern source="gander-studio-p4-proximity-edge-hardening.md">
      SCOPE_DRIFT / RECIPE_VS_CONSTRAINT: PM v1 shipped prescriptive code snippets in t4 and t5 that
      drifted from the safe guard form. This revision removes all prescriptive guard snippets and replaces
      with constraint descriptions + in-tree reference (guardPath helper at router.ts lines 22-31).
    </recurring_pattern>

    <recurring_pattern source="gander-studio-p4-proximity-edge-hardening.md">
      ENV_PREFLIGHT_SKIPPED: PM v1 noted the relative-LOADOUTS_DIR risk in risk_flags but shipped a buggy
      code snippet in t4 that didn't apply path.resolve. This revision: the snippet is removed, the constraint
      is stated (path.resolve required), and SC10 requires auditor verification.
    </recurring_pattern>

    <!-- ═══════════════════════════════════════════════════════════════ -->
    <!-- WAVE ORDERING                                                    -->
    <!-- ═══════════════════════════════════════════════════════════════ -->
    <wave_ordering>
      Single agent (BE), six sequential tasks.
      Wave 1: t1. Wave 2: t2a (no audit gate). Wave 3: t2b (audit gate). Wave 4: t3 (audit gate).
      Wave 5: t4 (audit gate). Wave 6: t5 (sprint-final audit gate SA+QA+SX).
    </wave_ordering>

    <!-- ═══════════════════════════════════════════════════════════════ -->
    <!-- SHARED-FILE APPEND SERIALIZATION                                 -->
    <!-- ═══════════════════════════════════════════════════════════════ -->
    <append_serialization>
      packages/server/src/parsers/__tests__/ — t2b creates it + session-parser.test.ts + fixtures;
      t3 appends event-log-parser.test.ts + fixture JSONL; t5 appends saveedit-security.test.ts.
      Serialization enforced by dependency chain (t3 depends on t2b, t5 depends on t4 which depends on t3).
      No concurrent writes possible.
    </append_serialization>

    <!-- ═══════════════════════════════════════════════════════════════ -->
    <!-- DESIGN.MD STATUS                                                 -->
    <!-- ═══════════════════════════════════════════════════════════════ -->
    <design_md_status>N/A — this sprint is BE-only. No UI surfaces touched.</design_md_status>

    <!-- ═══════════════════════════════════════════════════════════════ -->
    <!-- PM BUDGET ACKNOWLEDGEMENT                                        -->
    <!-- ═══════════════════════════════════════════════════════════════ -->
    <pm_budget_acknowledgement>6 reads used of 8-read cap. Within budget.
      Reads: (1) prior plan PM-1778050377.md, (2) critic block CR-1778050802.md,
      (3) orchestrator_brief.md, (4) schemas.ts, (5) env.ts, (6) router.ts [first 60L].</pm_budget_acknowledgement>

  </routing_notes>

  <risk_flags>
    <risk>gray-matter is listed as "already installed" in the sprint brief. The BE agent should verify it is present in packages/server/package.json before importing it in session-parser.ts. If absent, add it and note the addition in the completion packet.</risk>
    <risk>Post-mortem Section 2 table format varies across the 17 files. The t2b parser must be tolerant of format variation. The fixture selection (gander-studio-p1.md, gander-p7-obsidian-l2-l3.md, gander-studio-p2-agent-cards.md, gander-p5-obsidian-l0-l1.md) covers three distinct format variants; the BE agent should note if any fixture produces unexpected structure and add a targeted parser test for it.</risk>
    <risk>router.ts structure: confirmed from a 60-line read that it uses sub-router pattern (t.router({...}) with namespace key in appRouter). The BE agent must read the full file before appending to confirm the session namespace wiring approach.</risk>
    <risk>SESSIONS_SOURCE_DIRS adds scope to t4. LOC estimate is ~140L (was ~120L in prior plan). If the BE agent finds this too large for one atomic task, ORC may authorize splitting SESSIONS_SOURCE_DIRS wiring into a t4b — but the dependency on the same env.ts file makes serialization preferable.</risk>
    <risk>DESIGN.md absent at app root — this is BE-only, so no UI impact. Noted per protocol.</risk>
  </risk_flags>

  <verbatim_deliverable_audit>
    <!-- Every noun/verb phrase from the human request and orchestrator brief -->
    <phrase text="parse post-mortem markdowns"><addressed task="prog-studio-sessions-2026-05-s1-backend-t2b"/></phrase>
    <phrase text="JSONL event logs"><addressed task="prog-studio-sessions-2026-05-s1-backend-t3"/></phrase>
    <phrase text="typed Session objects"><addressed task="prog-studio-sessions-2026-05-s1-backend-t1"/></phrase>
    <phrase text="expose 4 tRPC procedures"><addressed task="prog-studio-sessions-2026-05-s1-backend-t4"/></phrase>
    <phrase text="session.list"><addressed task="prog-studio-sessions-2026-05-s1-backend-t4"/></phrase>
    <phrase text="session.get"><addressed task="prog-studio-sessions-2026-05-s1-backend-t4"/></phrase>
    <phrase text="session.getStats"><addressed task="prog-studio-sessions-2026-05-s1-backend-t4"/></phrase>
    <phrase text="session.saveEdit"><addressed task="prog-studio-sessions-2026-05-s1-backend-t4"/></phrase>
    <phrase text="publish Zod contracts to packages/shared/src/schemas.ts"><addressed task="prog-studio-sessions-2026-05-s1-backend-t1"/></phrase>
    <phrase text="SessionSchema"><addressed task="prog-studio-sessions-2026-05-s1-backend-t1"/></phrase>
    <phrase text="AgentActivitySchema"><addressed task="prog-studio-sessions-2026-05-s1-backend-t1"/></phrase>
    <phrase text="EventLogEntrySchema"><addressed task="prog-studio-sessions-2026-05-s1-backend-t1"/></phrase>
    <phrase text="SessionStatsSchema"><addressed task="prog-studio-sessions-2026-05-s1-backend-t1"/></phrase>
    <phrase text="SESSIONS_EDITS_DIR"><addressed task="prog-studio-sessions-2026-05-s1-backend-t4"/></phrase>
    <phrase text="save-to-new-folder convention"><addressed task="prog-studio-sessions-2026-05-s1-backend-t4"/></phrase>
    <phrase text="path traversal blocked"><addressed task="prog-studio-sessions-2026-05-s1-backend-t5"/></phrase>
    <phrase text="session-parser.ts"><addressed task="prog-studio-sessions-2026-05-s1-backend-t2b"/></phrase>
    <phrase text="event-log-parser.ts"><addressed task="prog-studio-sessions-2026-05-s1-backend-t3"/></phrase>
    <phrase text="session-stats.ts"><addressed task="prog-studio-sessions-2026-05-s1-backend-t3"/></phrase>
    <phrase text="packages/server/src/parsers/__tests__/"><addressed task="prog-studio-sessions-2026-05-s1-backend-t2b"/></phrase>
    <phrase text="session-parser.test.ts"><addressed task="prog-studio-sessions-2026-05-s1-backend-t2b"/></phrase>
    <phrase text="event-log-parser test"><addressed task="prog-studio-sessions-2026-05-s1-backend-t3"/></phrase>
    <phrase text="saveedit security test"><addressed task="prog-studio-sessions-2026-05-s1-backend-t5"/></phrase>
    <phrase text=".env.example update"><addressed task="prog-studio-sessions-2026-05-s1-backend-t4"/></phrase>
    <phrase text="CLAUDE.md update"><addressed task="prog-studio-sessions-2026-05-s1-backend-t4"/></phrase>
    <phrase text="test fixtures"><addressed task="prog-studio-sessions-2026-05-s1-backend-t2b"/></phrase>
    <phrase text="unit tests under packages/server/src/parsers/__tests__/"><addressed task="prog-studio-sessions-2026-05-s1-backend-t2b"/></phrase>
    <phrase text="configure vitest"><addressed task="prog-studio-sessions-2026-05-s1-backend-t2a"/></phrase>
    <phrase text="ev field must be z.string() not z.enum"><addressed task="prog-studio-sessions-2026-05-s1-backend-t1"/></phrase>
    <phrase text="critique_passes / critique_blocks vs audit_passes / audit_fails distinct semantics"><addressed task="prog-studio-sessions-2026-05-s1-backend-t1"/></phrase>
    <phrase text="SESSIONS_SOURCE_DIRS configurable source scope (human decision: CONFIGURABLE)"><addressed task="prog-studio-sessions-2026-05-s1-backend-t4"/></phrase>
    <phrase text="SESSIONS_SOURCE_DIRS default=GANDER_ROOT"><addressed task="prog-studio-sessions-2026-05-s1-backend-t4"/></phrase>
    <phrase text="session.source_root field"><addressed task="prog-studio-sessions-2026-05-s1-backend-t1"/></phrase>
    <phrase text="validateSaveEditPath exported helper"><addressed task="prog-studio-sessions-2026-05-s1-backend-t5"/></phrase>
    <phrase text="No UI work this sprint"><out_of_scope reason="All six packets are BE-only; no client files touched; explicitly listed in out_of_scope for each packet"/></phrase>
    <phrase text="nav registration S2 owns"><deferred reason="Invariant 3 in program.md: S2 owns nav registration. Out of scope for S1."/></phrase>
    <phrase text="proximity edge regression"><out_of_scope reason="Explicitly excluded in both program.md known issues and sprint brief out-of-scope clause."/></phrase>
    <phrase text="S3 dimensional pivots beyond per-agent/per-wave"><deferred reason="Sprint brief out-of-scope clause: S3 will route a dag_update_request if additional aggregation is needed."/></phrase>
  </verbatim_deliverable_audit>

</task_decomposition>

---

## Expectation Manifest

<expectation_manifest>
  <sprint_id>prog-studio-sessions-2026-05-s1-backend</sprint_id>
  <generated>2026-05-20T00:00:00Z</generated>
  <assignments>
    <assignment>
      <task_id>prog-studio-sessions-2026-05-s1-backend-t1</task_id>
      <agent>BE#1</agent>
      <expected_tag>completion_packet</expected_tag>
      <expected_file>.claude/agents/tasks/outputs/prog-studio-sessions-2026-05-s1-backend-t1-BE-*.md</expected_file>
      <blocks>prog-studio-sessions-2026-05-s1-backend-t2a</blocks>
      <receipt_check>
        <item>grep confirms ev field is z.string() not z.enum in schemas.ts</item>
        <item>grep confirms all 4 new critique/audit fields present in AgentActivitySchema</item>
        <item>grep confirms SessionSchema has source_root field</item>
        <item>tsc --noEmit exits 0 on all 3 packages (confirmed in packet)</item>
        <item>git diff removed-lines count for schemas.ts = 0 (insert-only)</item>
      </receipt_check>
    </assignment>
    <assignment>
      <task_id>prog-studio-sessions-2026-05-s1-backend-t2a</task_id>
      <agent>BE#1</agent>
      <expected_tag>completion_packet</expected_tag>
      <expected_file>.claude/agents/tasks/outputs/prog-studio-sessions-2026-05-s1-backend-t2a-BE-*.md</expected_file>
      <blocks>prog-studio-sessions-2026-05-s1-backend-t2b</blocks>
      <receipt_check>
        <item>vitest confirmed in devDependencies (grep evidence)</item>
        <item>"test" script confirmed in package.json</item>
        <item>vitest.config.ts exists (confirmed in packet)</item>
        <item>tsc exits 0 on server package</item>
        <item>No npm install commands executed (pre-installed by ORC)</item>
      </receipt_check>
    </assignment>
    <assignment>
      <task_id>prog-studio-sessions-2026-05-s1-backend-t2b</task_id>
      <agent>BE#1</agent>
      <expected_tag>completion_packet</expected_tag>
      <expected_file>.claude/agents/tasks/outputs/prog-studio-sessions-2026-05-s1-backend-t2b-BE-*.md</expected_file>
      <blocks>prog-studio-sessions-2026-05-s1-backend-t3</blocks>
      <receipt_check>
        <item>session-parser.ts exports parseSessionFile with two args (filePath, source_root)</item>
        <item>session-parser.test.ts exists</item>
        <item>≥ 4 fixture files listed, covering 3 distinct Section-2 layouts</item>
        <item>AgentActivity uses critique_passes/critique_blocks/audit_passes/audit_fails (grep evidence)</item>
        <item>Layout (b) fixture explicitly covered in tests</item>
        <item>npm test exit code = 0</item>
        <item>SessionSchema.parse() called in each fixture test</item>
      </receipt_check>
    </assignment>
    <assignment>
      <task_id>prog-studio-sessions-2026-05-s1-backend-t3</task_id>
      <agent>BE#1</agent>
      <expected_tag>completion_packet</expected_tag>
      <expected_file>.claude/agents/tasks/outputs/prog-studio-sessions-2026-05-s1-backend-t3-BE-*.md</expected_file>
      <blocks>prog-studio-sessions-2026-05-s1-backend-t4</blocks>
      <receipt_check>
        <item>event-log-parser.ts and session-stats.ts both confirmed present</item>
        <item>agent-events-fixture.jsonl confirmed present with ≥ 8 lines and ≥ 6 distinct ev values</item>
        <item>AUDIT_PASS event parses successfully — test assertion confirmed</item>
        <item>AUDIT_FAIL event parses successfully — test assertion confirmed</item>
        <item>npm test exit code = 0</item>
        <item>SessionStatsSchema.parse() called inside computeSessionStats (grep evidence)</item>
        <item>CRITIQUE_BLOCK → same-agent SPAWN feedback_loop test confirmed</item>
        <item>session-stats.ts uses correct field names (grep evidence)</item>
      </receipt_check>
    </assignment>
    <assignment>
      <task_id>prog-studio-sessions-2026-05-s1-backend-t4</task_id>
      <agent>BE#1</agent>
      <expected_tag>completion_packet</expected_tag>
      <expected_file>.claude/agents/tasks/outputs/prog-studio-sessions-2026-05-s1-backend-t4-BE-*.md</expected_file>
      <blocks>prog-studio-sessions-2026-05-s1-backend-t5</blocks>
      <receipt_check>
        <item>grep confirms all 4 session.* procedures in router.ts</item>
        <item>grep confirms SESSIONS_EDITS_DIR and SESSIONS_SOURCE_DIRS in env.ts</item>
        <item>grep confirms both vars in .env.example and CLAUDE.md</item>
        <item>SESSIONS_EDITS_DIR default applies path.resolve to LOADOUTS_DIR (env.ts inspection)</item>
        <item>session.list globs across SESSIONS_SOURCE_DIRS (code evidence)</item>
        <item>parseSessionFile called with source_root second arg (grep evidence)</item>
        <item>git diff removed-lines for router.ts = 0</item>
        <item>tsc --noEmit exits 0 across all 3 packages</item>
        <item>npm test still exits 0</item>
      </receipt_check>
    </assignment>
    <assignment>
      <task_id>prog-studio-sessions-2026-05-s1-backend-t5</task_id>
      <agent>BE#1</agent>
      <expected_tag>completion_packet</expected_tag>
      <expected_file>.claude/agents/tasks/outputs/prog-studio-sessions-2026-05-s1-backend-t5-BE-*.md</expected_file>
      <blocks>NONE — this is the sprint-final task; unblocks S2 and S3</blocks>
      <receipt_check>
        <item>saveedit-guard.ts exports validateSaveEditPath (confirmed present)</item>
        <item>saveedit-security.test.ts confirmed present</item>
        <item>npm test exit code = 0; test list includes saveedit-security</item>
        <item>All 5 malicious input cases confirmed in packet</item>
        <item>Guard uses path.resolve on both editsDir and joined candidate (auditor reads implementation)</item>
        <item>session.saveEdit in router.ts calls validateSaveEditPath (grep evidence)</item>
        <item>No filesystem writes in security tests (grep evidence)</item>
        <item>tsc --noEmit exits 0 across all 3 packages</item>
      </receipt_check>
    </assignment>
  </assignments>
</expectation_manifest>
