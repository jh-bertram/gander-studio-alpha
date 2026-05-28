# Task Decomposition — prog-studio-sessions-2026-05-s1-backend
**PM:** PM#0
**ts:** 2026-05-06T00:10:00Z
**sprint:** prog-studio-sessions-2026-05-s1-backend
**program:** prog-studio-sessions-2026-05
**agent_count:** 5 (BE agent, sequential)

---

<task_decomposition task_id="prog-studio-sessions-2026-05-s1-backend" agent_count="5">

  <task_packets>

    <!-- ═══════════════════════════════════════════════════════════════ -->
    <!-- t1: Zod schemas                                                 -->
    <!-- ═══════════════════════════════════════════════════════════════ -->
    <task_packet>
      <task_id>prog-studio-sessions-2026-05-s1-backend-t1</task_id>
      <assigned_to>BE</assigned_to>
      <priority>BLOCKER</priority>
      <description>
Append four new Zod schemas to `packages/shared/src/schemas.ts` using the existing export pattern in that file.

The four schemas to add (names are exact; field shapes are the cross-sprint contract):

1. `EventLogEntrySchema` — one parsed line from a JSONL event log file. Fields: seq (number), ts (ISO-8601 string), ev (z.enum of at minimum SPAWN | COMPLETE | CRITIQUE_BLOCK | CRITIQUE_PASS | AGENT_IMPROVEMENT), task_id (string), agent_id (string), parent_id (string.optional()), edge_label (string.optional()), output_files (z.array(z.string()).optional()).

2. `AgentActivitySchema` — per-agent roll-up for one session. Fields: agent_id (string), spawns (number), completes (number), feedback_loops (number), audit_passes (number), audit_fails (number), wall_clock_ms (number.optional()).

3. `SessionSchema` — top-level parsed session object. Fields: id (string — slug derived from sprint frontmatter field), sprint (string), date (string — ISO-8601 date), gap_classes (z.array(z.string())), status (string), title (string.optional()), filePath (string), editedFilePath (string.optional()), agents (z.array(AgentActivitySchema)), events (z.array(EventLogEntrySchema)).

4. `SessionStatsSchema` — aggregated stats for a session. Fields: session_id (string), total_spawns (number), total_completes (number), total_feedback_loops (number), agents (z.array(AgentActivitySchema)), wall_clock_ms (number.optional()), event_count (number).

For each schema, export the Zod schema const AND export the inferred TypeScript type (`export type Session = z.infer&lt;typeof SessionSchema&gt;` etc.).

IMPORTANT — cross-sprint contract rule: the four names above (`EventLogEntrySchema`, `AgentActivitySchema`, `SessionSchema`, `SessionStatsSchema`) are the stable program-level contracts S2 and S3 will import. Do NOT rename them. Do NOT move them to a separate file.

Section-level ownership: append only. Do not modify existing schema declarations. All four additions go at the end of `packages/shared/src/schemas.ts`.

Style reference: read `packages/shared/src/schemas.ts` top-to-bottom to match the z.object + named export + z.infer pattern already in use. The full schema source-of-truth is the program manifest at:
  /home/jhber/projects/gander-studio-alpha/docs/programs/prog-studio-sessions-2026-05/program.md
and the sprint brief at:
  /home/jhber/projects/gander-studio-alpha/docs/programs/prog-studio-sessions-2026-05/sprints/prog-studio-sessions-2026-05-s1-backend/orchestrator_brief.md

Do not redefine fields beyond what those documents specify.
      </description>
      <success_criteria>
SC1: `packages/shared/src/schemas.ts` exports `EventLogEntrySchema`, `AgentActivitySchema`, `SessionSchema`, `SessionStatsSchema` — each verified with `grep -c "export const.*Schema" packages/shared/src/schemas.ts` returning ≥ 8 (4 existing + 4 new).
SC2: `packages/shared/src/schemas.ts` exports inferred types `EventLogEntry`, `AgentActivity`, `Session`, `SessionStats` — verified with `grep "export type" packages/shared/src/schemas.ts | wc -l` returning ≥ 4.
SC3: Typecheck clean: `tsc --noEmit --project packages/shared/tsconfig.json` exits 0.
SC4: Server typecheck still clean: `tsc --noEmit --project packages/server/tsconfig.json` exits 0.
SC5: Client typecheck still clean: `tsc --noEmit --project packages/client/tsconfig.json` exits 0.
SC6: No existing schema declarations modified — `git diff HEAD -- packages/shared/src/schemas.ts | grep '^-[^-]' | grep -v '^---'` returns 0 removed lines (insert-only diff).
      </success_criteria>
      <context_files>
        packages/shared/src/schemas.ts
        /home/jhber/projects/gander-studio-alpha/docs/programs/prog-studio-sessions-2026-05/program.md
        /home/jhber/projects/gander-studio-alpha/docs/programs/prog-studio-sessions-2026-05/sprints/prog-studio-sessions-2026-05-s1-backend/orchestrator_brief.md
      </context_files>
      <dependencies>none</dependencies>
      <out_of_scope>
- Do NOT create any new files. This task is append-only to one file.
- Do NOT modify router.ts, env.ts, any parser files, or any client files.
- Do NOT invent schema fields beyond what the program manifest and sprint brief specify.
- Do NOT write unit tests (t2 owns that).
- Do NOT register nav routes (S2 owns that).
      </out_of_scope>
      <estimated_new_lines>~50 lines (4 schemas + 4 type exports). Within the 50-LOC gate. No audit gate required before commit.</estimated_new_lines>
      <output_expected>
        <tag>completion_packet</tag>
        <must_contain>
          <item>Confirmation that all 4 schema consts are exported from packages/shared/src/schemas.ts</item>
          <item>Confirmation that all 4 TypeScript types are exported (z.infer)</item>
          <item>Result of `tsc --noEmit` across all 3 packages (exit codes)</item>
          <item>git diff line count showing insert-only (no removed lines in schemas.ts)</item>
        </must_contain>
        <must_not_contain>
          <item>Any changes to router.ts, env.ts, or client files</item>
          <item>Inline hex color values or design tokens</item>
        </must_not_contain>
        <success_signal>All 6 SCs pass; tsc exits 0 across all 3 packages.</success_signal>
      </output_expected>
    </task_packet>

    <!-- ═══════════════════════════════════════════════════════════════ -->
    <!-- t2: Post-mortem parser + vitest setup + tests                   -->
    <!-- ═══════════════════════════════════════════════════════════════ -->
    <task_packet>
      <task_id>prog-studio-sessions-2026-05-s1-backend-t2</task_id>
      <assigned_to>BE</assigned_to>
      <priority>HIGH</priority>
      <description>
Two sub-goals in this packet:

SUB-A — Configure vitest for the server package.
The server package currently has no unit-test runner. Install and configure vitest as a devDependency of `packages/server`:
  1. `cd packages/server && npm install --save-dev vitest`
  2. Add a `"test"` script to `packages/server/package.json`: `"test": "vitest run src/parsers/__tests__"`
  3. Create `packages/server/vitest.config.ts` (minimal: `import { defineConfig } from 'vitest/config'; export default defineConfig({});`).
  4. Verify `npm test -w @gander-studio/server` finds and runs tests.

SUB-B — Implement the post-mortem parser and its tests.
Create `packages/server/src/parsers/session-parser.ts`. This parser:
  1. Reads a markdown file path on disk.
  2. Uses `gray-matter` (already installed) to extract frontmatter with fields: `type`, `sprint`, `date`, `gap_classes`, `status`.
  3. Scans the markdown body for Section 2 agent-activity tables (identified by `## 2.` heading prefix). For each table row, extracts: Seq, Timestamp, Event (ev), Agent (agent_id), Notes.
  4. Groups table rows by agent_id and produces an array of `AgentActivity` objects (spawns = count of SPAWN rows for that agent; completes = count of COMPLETE rows; feedback_loops = consecutive same-agent SPAWN sequences after a CRITIQUE_BLOCK or audit FAIL row immediately preceding; audit_passes = count of CRITIQUE_PASS rows; audit_fails = count of CRITIQUE_BLOCK rows; wall_clock_ms = duration from first SPAWN to last COMPLETE if timestamps parse, else undefined).
  5. Returns a `Session` object (using the `SessionSchema` from `packages/shared/src/schemas.ts`) with `events: []` (event log join is handled in t3's session-stats.ts).

Style reference: read `packages/server/src/parsers/agent-parser.ts` for file-read + gray-matter usage patterns before writing.

Create test fixtures directory: `packages/server/src/parsers/__tests__/fixtures/`. Copy (or symlink) at minimum THREE representative post-mortem files from `${GANDER_ROOT}/docs/post-mortems/` into the fixtures directory. Use:
  - `gander-studio-p1.md` (complex, multi-wave, many agents)
  - `gander-p5-obsidian-l0-l1.md` (different format variant)
  - One additional recent file (e.g., `gander-p7-obsidian-l2-l3.md`)

The `${GANDER_ROOT}` path at runtime is set by the `GANDER_ROOT` env var (see `packages/server/src/env.ts`). For tests, copy the fixture files directly into the `__tests__/fixtures/` directory so tests are self-contained and do not depend on `GANDER_ROOT` being set.

Write unit tests in `packages/server/src/parsers/__tests__/session-parser.test.ts` covering:
  - Parses frontmatter fields correctly (type, sprint, date, gap_classes, status) for each fixture.
  - Extracts at least one AgentActivity entry per fixture.
  - Returns a valid Session object (validated with `SessionSchema.parse()`).
  - Handles a missing Section 2 gracefully (empty agents array, no throw).

Section-level file ownership: session-parser.ts is a NEW file. __tests__/ directory is NEW. Do not modify any existing parser files.
      </description>
      <success_criteria>
SC1: `packages/server/src/parsers/session-parser.ts` exists and exports a `parseSessionFile(filePath: string): Promise&lt;Session&gt;` function (or sync equivalent).
SC2: `packages/server/src/parsers/__tests__/session-parser.test.ts` exists.
SC3: At least 3 fixture files exist under `packages/server/src/parsers/__tests__/fixtures/`.
SC4: `npm test -w @gander-studio/server` exits 0 and all session-parser tests pass.
SC5: Each fixture test validates the result with `SessionSchema.parse()` — no manual field checks that bypass Zod.
SC6: Typecheck clean: `tsc --noEmit --project packages/server/tsconfig.json` exits 0.
SC7: Shared typecheck still clean: `tsc --noEmit --project packages/shared/tsconfig.json` exits 0.
SC8: `packages/server/package.json` has a `"test"` script and vitest in devDependencies.
SC9: `packages/server/vitest.config.ts` exists.
      </success_criteria>
      <context_files>
        packages/server/src/parsers/agent-parser.ts
        packages/server/src/env.ts
        packages/shared/src/schemas.ts
        packages/server/package.json
        /home/jhber/projects/gander-studio-alpha/docs/programs/prog-studio-sessions-2026-05/sprints/prog-studio-sessions-2026-05-s1-backend/orchestrator_brief.md
      </context_files>
      <dependencies>prog-studio-sessions-2026-05-s1-backend-t1</dependencies>
      <out_of_scope>
- Do NOT modify any existing parser files (agent-parser.ts, skill-parser.ts, hook-parser.ts).
- Do NOT touch router.ts or env.ts (t4 owns those).
- Do NOT implement event-log parsing or stats join (t3 owns those).
- Do NOT implement saveEdit (t5 owns that).
- Do NOT modify packages/client or packages/shared (t1 owns schemas.ts).
      </out_of_scope>
      <estimated_new_lines>~150 lines (parser ~80L + test file ~50L + vitest config ~10L + fixture copies). Exceeds 50-LOC gate — audit pipeline runs after this task before t3 starts.</estimated_new_lines>
      <output_expected>
        <tag>completion_packet</tag>
        <must_contain>
          <item>Result of `npm test -w @gander-studio/server` (exit code + pass count)</item>
          <item>Result of `tsc --noEmit` across server and shared packages</item>
          <item>List of fixture files placed in __tests__/fixtures/</item>
          <item>Confirmation that SessionSchema.parse() is called inside each fixture test</item>
        </must_contain>
        <must_not_contain>
          <item>Modifications to existing parser files</item>
          <item>Any router.ts or env.ts changes</item>
        </must_not_contain>
        <success_signal>All 9 SCs pass; `npm test -w @gander-studio/server` exits 0; tsc exits 0 on server + shared.</success_signal>
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

FILE 1: `packages/server/src/parsers/event-log-parser.ts`
  - Exports `parseEventLogFiles(gander_root: string, sprintSlug: string, dateRange?: { from: string; to: string }): Promise&lt;EventLogEntry[]&gt;`
  - Reads all `${gander_root}/docs/events/agent-events-*.jsonl` files.
  - For each file, reads line-by-line, parses each line as JSON, validates against `EventLogEntrySchema` (from `packages/shared/src/schemas.ts`). Lines that fail validation are skipped with a console.warn (graceful degradation — do not throw).
  - Filters by `task_id` prefix matching `sprintSlug` (substring match is acceptable: `entry.task_id.startsWith(sprintSlug)` or `entry.task_id.includes(sprintSlug)`).
  - If `dateRange` is provided, also filters by the `ts` field (ISO-8601 string comparison).
  - Returns the filtered, validated array of `EventLogEntry` objects sorted by `seq` ascending.

FILE 2: `packages/server/src/parsers/session-stats.ts`
  - Exports `computeSessionStats(session: Session, events: EventLogEntry[]): SessionStats`
  - Takes a Session (already parsed by session-parser.ts) and its matching EventLogEntry array.
  - Computes the `SessionStatsSchema`-shaped output:
    - `session_id`: session.id
    - `total_spawns`: count of events where ev === 'SPAWN'
    - `total_completes`: count of events where ev === 'COMPLETE'
    - `total_feedback_loops`: count of consecutive same-agent SPAWN events immediately following a CRITIQUE_BLOCK or audit FAIL event (same algorithm as session-parser.ts AgentActivity.feedback_loops, applied here to the event stream for cross-validation)
    - `agents`: per-agent roll-up using the same AgentActivity grouping logic — group events by agent_id, count SPAWN/COMPLETE/CRITIQUE_BLOCK/CRITIQUE_PASS per agent; if wall_clock available from timestamps, compute per-agent wall_clock_ms
    - `wall_clock_ms`: if events.length >= 2, compute Date.parse(events[last].ts) - Date.parse(events[0].ts); else undefined
    - `event_count`: events.length
  - Validates the output with `SessionStatsSchema.parse()` before returning.

Write unit tests in `packages/server/src/parsers/__tests__/event-log-parser.test.ts`:
  - Create a fixture JSONL file at `packages/server/src/parsers/__tests__/fixtures/agent-events-fixture.jsonl` containing at minimum 6 representative event lines (covering SPAWN, COMPLETE, CRITIQUE_BLOCK, CRITIQUE_PASS — all enums in EventLogEntrySchema).
  - Test that parseEventLogFiles returns only events matching the slug filter.
  - Test that malformed JSON lines are skipped without throwing.
  - Test that computeSessionStats returns a valid SessionStats object (validated with SessionStatsSchema.parse()).
  - Test the feedback_loop count on a fixture with at least one CRITIQUE_BLOCK → same-agent SPAWN sequence.

The `${GANDER_ROOT}` env var in the server runtime points to the live gander project. For unit tests, use the fixture JSONL file directly (pass its parent directory as the `gander_root` parameter in the test call, or mock the filesystem read).
      </description>
      <success_criteria>
SC1: `packages/server/src/parsers/event-log-parser.ts` exists and exports `parseEventLogFiles`.
SC2: `packages/server/src/parsers/session-stats.ts` exists and exports `computeSessionStats`.
SC3: `packages/server/src/parsers/__tests__/event-log-parser.test.ts` exists.
SC4: `packages/server/src/parsers/__tests__/fixtures/agent-events-fixture.jsonl` exists with ≥ 6 event lines.
SC5: `npm test -w @gander-studio/server` exits 0 and all event-log-parser tests pass.
SC6: The feedback_loop test covers the CRITIQUE_BLOCK → same-agent SPAWN case explicitly.
SC7: `SessionStatsSchema.parse()` is called inside computeSessionStats (not just in tests).
SC8: Typecheck clean: `tsc --noEmit --project packages/server/tsconfig.json` exits 0.
      </success_criteria>
      <context_files>
        packages/shared/src/schemas.ts
        packages/server/src/parsers/session-parser.ts
        packages/server/src/parsers/__tests__/fixtures/
        /home/jhber/projects/gander-studio-alpha/docs/programs/prog-studio-sessions-2026-05/sprints/prog-studio-sessions-2026-05-s1-backend/orchestrator_brief.md
      </context_files>
      <dependencies>prog-studio-sessions-2026-05-s1-backend-t2</dependencies>
      <out_of_scope>
- Do NOT modify session-parser.ts (t2 owns it).
- Do NOT touch router.ts or env.ts (t4 owns those).
- Do NOT implement saveEdit or path-traversal checks (t5 owns those).
- Do NOT modify any client files.
      </out_of_scope>
      <estimated_new_lines>~180 lines (event-log-parser ~70L + session-stats ~60L + test file ~50L). Exceeds 50-LOC gate — audit pipeline runs after this task before t4 starts.</estimated_new_lines>
      <output_expected>
        <tag>completion_packet</tag>
        <must_contain>
          <item>Result of `npm test -w @gander-studio/server` (exit code + pass count)</item>
          <item>Result of `tsc --noEmit --project packages/server/tsconfig.json`</item>
          <item>Confirmation that SessionStatsSchema.parse() is called inside computeSessionStats</item>
          <item>Confirmation that the feedback_loop test case covers CRITIQUE_BLOCK → same-agent SPAWN</item>
        </must_contain>
        <must_not_contain>
          <item>Any changes to router.ts, env.ts, or client files</item>
        </must_not_contain>
        <success_signal>All 8 SCs pass; `npm test -w @gander-studio/server` exits 0; tsc exits 0 on server package.</success_signal>
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
Wire the four tRPC procedures and env config. Three files are touched in this packet; section-level ownership is explicit below.

FILE 1 — `packages/server/src/env.ts` (APPEND ONLY — do not touch existing declarations):
Add `SESSIONS_EDITS_DIR` as a new exported const using the optional-with-default pattern (same as `EXPORT_BASE_DIR`):
```
export const SESSIONS_EDITS_DIR: string =
  process.env.SESSIONS_EDITS_DIR ?? path.join(path.dirname(LOADOUTS_DIR), 'sessions-edits');
```
Import `path` from `'node:path'` at the top if not already imported. The LOADOUTS_DIR variable is already exported in env.ts — use it for the default calculation. Do NOT use `requireEnv()` for this variable (it has a default).

FILE 2 — `packages/server/src/router.ts` (APPEND to session router namespace — do not modify existing procedures):
Register four new procedures under a `session` namespace (using `router.ts`'s existing style for how it organizes sub-routers or procedure groups — read the file first to match the pattern). The four procedures:

  a. `session.list` (query):
     - Input: `z.object({ limit: z.number().int().min(1).max(100).default(50) })`
     - Output: `z.array(SessionSchema)`
     - Implementation: glob `${GANDER_ROOT}/docs/post-mortems/*.md`, parse each with `parseSessionFile`, return array sorted by date desc, up to limit.

  b. `session.get` (query):
     - Input: `z.object({ id: z.string() })`
     - Output: `SessionSchema`
     - Implementation: find the post-mortem file whose `sprint` frontmatter matches id, parse it, return.

  c. `session.getStats` (query):
     - Input: `z.object({ id: z.string() })`
     - Output: `SessionStatsSchema`
     - Implementation: parse the session, call `parseEventLogFiles` with the session slug, call `computeSessionStats`, return result.

  d. `session.saveEdit` (mutation) — security stub only in this task:
     - Input: `z.object({ id: z.string(), content: z.string() })`
     - Output: `z.object({ success: z.boolean(), filePath: z.string() })`
     - Implementation: construct the target path as `path.join(SESSIONS_EDITS_DIR, \`\${id}.md\`)`. Apply path-traversal check (resolve and verify it starts with SESSIONS_EDITS_DIR — exact same guard t5 will harden). Create `SESSIONS_EDITS_DIR` if missing (fs.mkdirSync recursive). Write `content` to file. Return `{ success: true, filePath }`.
     - NOTE: t5 will ADD the hardened path-traversal security tests and tighten the guard. This task ships a working implementation; t5 audits and hardens it. Do not skip the path resolution check here — implement it with `path.resolve`.

FILE 3 — `.env.example` (APPEND ONLY):
Add a documentation row for `SESSIONS_EDITS_DIR`:
```
# SESSIONS_EDITS_DIR — where markdown edits are saved (default: adjacent to LOADOUTS_DIR)
# SESSIONS_EDITS_DIR=/path/to/sessions-edits
```

FILE 4 — `/home/jhber/projects/gander-studio-alpha/CLAUDE.md` (APPEND TO ENV TABLE):
Add a row to the environment variables table:
| `SESSIONS_EDITS_DIR` | No | Directory where session markdown edits are saved (default: `${LOADOUTS_DIR}/../sessions-edits`) |

Read `CLAUDE.md` first to find the table and append after the existing rows.

Section-level file ownership summary:
- env.ts: append SESSIONS_EDITS_DIR only. All existing vars untouched.
- router.ts: append session.* procedures only. All existing procedures untouched.
- .env.example: append documentation rows only.
- CLAUDE.md: append one table row only.
      </description>
      <success_criteria>
SC1: `packages/server/src/env.ts` exports `SESSIONS_EDITS_DIR` — verified with `grep "SESSIONS_EDITS_DIR" packages/server/src/env.ts`.
SC2: `packages/server/src/router.ts` contains all four procedures: `session.list`, `session.get`, `session.getStats`, `session.saveEdit` — verified with `grep "session\." packages/server/src/router.ts | wc -l` returning ≥ 4 distinct matches.
SC3: Each procedure has both `input` and `output` Zod schemas — verified by reviewing the code (auditor spot-checks).
SC4: `.env.example` contains `SESSIONS_EDITS_DIR` — verified with `grep "SESSIONS_EDITS_DIR" .env.example`.
SC5: `CLAUDE.md` env table contains `SESSIONS_EDITS_DIR` row — verified with `grep "SESSIONS_EDITS_DIR" /home/jhber/projects/gander-studio-alpha/CLAUDE.md`.
SC6: All existing procedures untouched — `git diff HEAD -- packages/server/src/router.ts | grep '^-[^-]'` shows no removed lines from existing procedure blocks.
SC7: Typecheck clean: all three `tsc --noEmit` commands exit 0.
SC8: `npm test -w @gander-studio/server` still exits 0 (no regressions from wiring).
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
        /home/jhber/projects/gander-studio-alpha/docs/programs/prog-studio-sessions-2026-05/sprints/prog-studio-sessions-2026-05-s1-backend/orchestrator_brief.md
      </context_files>
      <dependencies>prog-studio-sessions-2026-05-s1-backend-t3</dependencies>
      <out_of_scope>
- Do NOT modify packages/client or packages/shared.
- Do NOT implement additional aggregation dimensions beyond what SessionStatsSchema specifies (S3 will request via dag_update_request if needed).
- Do NOT add nav registration (S2 owns that).
- Do NOT write unit tests for path-traversal (t5 owns those).
      </out_of_scope>
      <estimated_new_lines>~120 lines (env.ts +3L, router.ts ~110L, .env.example +3L, CLAUDE.md +2L). Exceeds 50-LOC gate — audit pipeline runs after this task before t5 starts.</estimated_new_lines>
      <output_expected>
        <tag>completion_packet</tag>
        <must_contain>
          <item>Result of all three `tsc --noEmit` commands (exit codes)</item>
          <item>Result of `npm test -w @gander-studio/server` (exit code)</item>
          <item>grep confirmation that all 4 session.* procedures exist in router.ts</item>
          <item>grep confirmation SESSIONS_EDITS_DIR appears in env.ts, .env.example, and CLAUDE.md</item>
          <item>git diff removed-lines count for router.ts (should be 0)</item>
        </must_contain>
        <must_not_contain>
          <item>Any client file modifications</item>
          <item>Any shared/src/schemas.ts modifications (t1 owns that)</item>
        </must_not_contain>
        <success_signal>All 8 SCs pass; tsc exits 0 across all 3 packages; npm test exits 0.</success_signal>
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
Harden the `session.saveEdit` path-traversal guard and write security-focused unit tests.

The `session.saveEdit` mutation was implemented in t4 with a `path.resolve` guard. This task audits that implementation and tightens it to the following standard:

REQUIRED GUARD LOGIC (update `session.saveEdit` in `packages/server/src/router.ts` if the t4 implementation is weaker):
```
const safeBase = path.resolve(SESSIONS_EDITS_DIR);
const target = path.resolve(path.join(SESSIONS_EDITS_DIR, `${id}.md`));
if (!target.startsWith(safeBase + path.sep) && target !== safeBase) {
  throw new TRPCError({ code: 'FORBIDDEN', message: 'Path traversal detected' });
}
```
The guard must use `path.resolve` on BOTH the base directory and the candidate path. A simple `startsWith` without resolving both sides is insufficient (symlink or `..` traversal can bypass it).

Write security unit tests in `packages/server/src/parsers/__tests__/saveedit-security.test.ts`:
  NOTE: saveEdit is a tRPC mutation, not a standalone function. Two acceptable approaches:
  a. Extract the path-traversal guard into a standalone exported helper function (`validateSaveEditPath(id: string, editsDir: string): string`) in a new file `packages/server/src/parsers/saveedit-guard.ts`, and test that helper directly.
  b. Test the tRPC caller directly using a test tRPC context (more complex; only use this if approach (a) is architecturally incompatible with the router structure).

Recommended: approach (a). Extract the guard as a pure function — takes `id` (the session id string) and `editsDir` (absolute base directory string), returns the resolved absolute target path or throws. The tRPC mutation calls this helper. Tests call the helper directly.

Malicious input test cases that MUST be covered:
  1. `id = "../../../etc/passwd"` → throws FORBIDDEN (or throws — any Error is acceptable as long as it does NOT produce a path outside editsDir)
  2. `id = "session-ok"` → returns a path inside editsDir (positive case)
  3. `id = "../../etc/hosts"` → throws
  4. `id = "subdir/session-ok"` — depending on policy: either accepted (if subdir policy is permitted) or rejected; document the choice in a comment in the test.
  5. `id = ""` → throws or returns editsDir itself — document behavior in a comment.

Do NOT write to the filesystem in these tests — test the guard logic only (pure function approach makes this easy).

Write the test in `packages/server/src/parsers/__tests__/saveedit-security.test.ts`.
      </description>
      <success_criteria>
SC1: `packages/server/src/parsers/__tests__/saveedit-security.test.ts` exists.
SC2: `npm test -w @gander-studio/server` exits 0 and includes saveedit-security tests in the run.
SC3: Test file covers all 5 malicious input cases listed above (verified by auditor reading the test file).
SC4: The path-traversal guard in `router.ts` (or extracted helper) uses `path.resolve` on BOTH the base and the candidate path before the `startsWith` check — verified by auditor reading the implementation.
SC5: No filesystem writes occur in the security tests (pure function test of the guard helper).
SC6: Typecheck clean: `tsc --noEmit --project packages/server/tsconfig.json` exits 0.
SC7: Existing test suite still passes: `npm test -w @gander-studio/server` shows no regressions.
SC8: Sprint-level SC7 (no regressions on existing loadout procedures) — `tsc --noEmit` across all 3 packages exits 0; existing router procedures (agent.*, skill.*, hook.*, loadout.*, export.*, health) compile without error.
      </success_criteria>
      <context_files>
        packages/server/src/router.ts
        packages/server/src/parsers/__tests__/
        packages/server/src/env.ts
        /home/jhber/projects/gander-studio-alpha/docs/programs/prog-studio-sessions-2026-05/sprints/prog-studio-sessions-2026-05-s1-backend/orchestrator_brief.md
      </context_files>
      <dependencies>prog-studio-sessions-2026-05-s1-backend-t4</dependencies>
      <out_of_scope>
- Do NOT modify packages/client or packages/shared.
- Do NOT modify any parser files (t2 and t3 own those).
- Do NOT modify env.ts or .env.example (t4 owns those).
- Do NOT add new tRPC procedures beyond the saveEdit guard hardening.
      </out_of_scope>
      <estimated_new_lines>~80 lines (guard helper ~20L + test file ~60L). Exceeds 50-LOC gate — audit pipeline runs after this task (sprint-final audit gate).</estimated_new_lines>
      <output_expected>
        <tag>completion_packet</tag>
        <must_contain>
          <item>Result of `npm test -w @gander-studio/server` (exit code + full test list)</item>
          <item>Result of all three `tsc --noEmit` commands (exit codes)</item>
          <item>Confirmation that all 5 malicious input test cases are present and pass</item>
          <item>Code snippet showing the guard uses path.resolve on both sides</item>
          <item>Confirmation no filesystem writes occur in security tests</item>
        </must_contain>
        <must_not_contain>
          <item>Any client, shared, or other parser file modifications</item>
          <item>A security guard that only uses startsWith without path.resolve on the candidate path</item>
        </must_not_contain>
        <success_signal>All 8 SCs pass; final sprint audit gate: SA + QA + SX all PASS on this task's output.</success_signal>
      </output_expected>
    </task_packet>

  </task_packets>

  <dependency_order>
    prog-studio-sessions-2026-05-s1-backend-t1
      → prog-studio-sessions-2026-05-s1-backend-t2
        → prog-studio-sessions-2026-05-s1-backend-t3
          → prog-studio-sessions-2026-05-s1-backend-t4
            → prog-studio-sessions-2026-05-s1-backend-t5

    All five packets are sequential. No parallelism within this sprint. Rationale: t2 and t3 both write to __tests__/ (shared-file append serialization rule); t4 imports from parsers created in t2+t3; t5 hardens router code created in t4. Sequential chain is mandatory.
  </dependency_order>

  <routing_notes>

    <!-- pm_preflight_acknowledgement blocks -->
    <pm_preflight_acknowledgement pattern="VERBATIM_DELIVERABLE">
      All 8 output paths from the moirai brief are addressed: schemas.ts (t1), session-parser.ts (t2), __tests__/ fixtures + session-parser.test.ts (t2), event-log-parser.ts (t3), session-stats.ts (t3), event-log-parser.test.ts (t3), router.ts (t4), env.ts (t4), .env.example (t4), CLAUDE.md (t4), saveedit-security.test.ts (t5). No task packet excerpts schema field lists inline — all packets point to program.md and the sprint brief as sources of truth.
    </pm_preflight_acknowledgement>

    <pm_preflight_acknowledgement pattern="OVERSCOPED">
      Five packets, each with a single logical owner and ≤2 new files. t2 is the heaviest (~150 LOC including fixtures); it is kept whole because vitest setup + one parser + its tests form one coherent unit of work. If the auditor deems t2 too large, ORC may split vitest setup into a t2a and parser/tests into a t2b — but at 150 LOC it is defensible under the gate (audit PASS after the task; no pre-split required).
    </pm_preflight_acknowledgement>

    <pm_preflight_acknowledgement pattern="SCOPE_DRIFT">
      Verbatim deliverable audit block below enumerates every noun/verb phrase from the human request and moirai brief outputs. Nav registration explicitly deferred to S2 (matches moirai brief out-of-scope clause). S3 dimensional pivots explicitly deferred (matches moirai brief out-of-scope clause). Proximity edge regression explicitly excluded (matches program.md known issues).
    </pm_preflight_acknowledgement>

    <pm_preflight_acknowledgement pattern="ASSUMPTION">
      UNIT-TEST RUNNER DECISION: vitest is NOT currently configured for the server package. Decision: include vitest installation and configuration as a mandatory sub-step of t2 (first parser task). This is the correct approach because: (a) the sprint brief SC#2 explicitly requires `packages/server/src/parsers/__tests__/session-parser.test.ts` to run as a unit test; (b) proceeding without a runner guarantees audit FAIL on SC#2; (c) adding vitest is a ~10 LOC change and does not bloat t2 materially. The Critic should verify this decision is sound before dispatching t2. Risk flag: vitest devDependency install requires `npm install` write access in the packages/server workspace — this is a foreground-dispatch task, so the Bash restriction does not apply.
    </pm_preflight_acknowledgement>

    <pm_preflight_acknowledgement pattern="AUDIT_RISK">
      Each parser/security task cites the test file path explicitly in success_criteria: session-parser.test.ts (t2 SC2), event-log-parser.test.ts (t3 SC3), saveedit-security.test.ts (t5 SC1). All test SCs require `npm test -w @gander-studio/server` to exit 0.
    </pm_preflight_acknowledgement>

    <pm_preflight_acknowledgement pattern="DRY">
      t1 reads packages/shared/src/schemas.ts before appending to match existing style. t4 reads packages/server/src/env.ts before adding SESSIONS_EDITS_DIR to match the EXPORT_BASE_DIR optional-with-default pattern. No schema is redefined in router.ts — all types imported from shared.
    </pm_preflight_acknowledgement>

    <!-- Recurring patterns from recent post-mortems -->
    <recurring_pattern source="gander-p7-obsidian-l2-l3.md">
      Prompt-vs-contract drift: two tokens drifted when PM excerpted canonical content into task packets. Mitigation: all four task packets that touch cross-sprint artifacts point at program.md and the sprint brief as sources of truth rather than excerpting field lists. The only inline field descriptions in this decomposition are the four schema shapes in t1 — these are necessary to make t1 executable and are traced to program.md Invariant 1 and the sprint brief Outputs section. If these field names drift, the Critic should BLOCK t1 and force a re-read of program.md.
    </recurring_pattern>

    <recurring_pattern source="gander-p6-moirai-skein-skills.md">
      PM stream-idle timeouts: 2 of 3 PM dispatches timed out at 40–60 min. Mitigation: this decomposition used exactly 6 reads (budget cap 8); halted before reaching the cap; no opportunistic codebase browsing.
    </recurring_pattern>

    <recurring_pattern source="smoke-fixture-skein-s2-beta.md">
      Cross-task file bundling: when 2 tasks modify the same file, scope at section level. Mitigation: section-level ownership is explicitly documented for every shared-file touch in t4 (router.ts: append session.* only; env.ts: append SESSIONS_EDITS_DIR only; .env.example: append doc row only; CLAUDE.md: append table row only). t5 is allowed to read and modify router.ts only for the saveEdit guard — all other procedures are out_of_scope.
    </recurring_pattern>

    <!-- Wave ordering -->
    <wave_ordering>
      Single agent (BE), five sequential tasks. Wave 1: t1. Wave 2: t2 (depends on t1). Wave 3: t3 (depends on t2). Wave 4: t4 (depends on t3). Wave 5: t5 (depends on t4). Audit pipeline runs after each wave that exceeds the 50-LOC gate (t2, t3, t4, t5 all trigger it). t1 is under 50 LOC and may be committed directly.
    </wave_ordering>

    <!-- Shared-file append serialization -->
    <append_serialization>
      fileA: packages/server/src/parsers/__tests__/ — t2 creates it + populates with session-parser.test.ts + fixtures; t3 appends event-log-parser.test.ts + fixture JSONL; t5 appends saveedit-security.test.ts. Serialization enforced by dependency chain (t3 depends on t2, t5 depends on t4 which depends on t3).
    </append_serialization>

    <!-- DESIGN.md check -->
    <design_md_status>N/A — this sprint is BE-only. No UI surfaces touched.</design_md_status>

    <!-- pm_budget acknowledgement -->
    <pm_budget_acknowledgement>6 reads used of 8-read cap. Within budget. Reads: (1) program.md, (2) orchestrator_brief.md, (3) schemas.ts [60L], (4) env.ts, (5) parsers glob, (6) gander-studio-p1.md [80L].</pm_budget_acknowledgement>

  </routing_notes>

  <risk_flags>
    <risk>vitest installation via `npm install --save-dev vitest` in packages/server workspace requires network access. If the environment is offline, the BE agent must use a local vitest version or the Orchestrator must pre-install it before dispatching t2.</risk>
    <risk>gray-matter is listed as "already installed" in the project_conventions server_deps_available. The BE agent should verify it is present in packages/server/package.json before importing it in session-parser.ts. If absent, add it.</risk>
    <risk>Post-mortem Section 2 table format varies across the 17 files (confirmed by reading gander-studio-p1.md). The parser must be tolerant of format variation. The t2 fixture selection (gander-studio-p1.md, gander-p5-obsidian-l0-l1.md, gander-p7-obsidian-l2-l3.md) covers two format variants — the BE agent should scan for a third variant if the first two fixtures produce the same table structure.</risk>
    <risk>The `ev` enum in EventLogEntrySchema must cover all event types present in the live JSONL files. The brief specifies at minimum SPAWN | COMPLETE | CRITIQUE_BLOCK | CRITIQUE_PASS | AGENT_IMPROVEMENT. The BE agent should scan one live JSONL file for additional ev values before finalizing the enum — or use z.string() with a refinement rather than a closed enum if the set is open.</risk>
    <risk>router.ts has an unknown structure (not read within PM budget). The BE agent must read it fully before appending the session procedures to match the existing sub-router namespace pattern. If router.ts uses a flat procedure list rather than namespaced sub-routers, the "session.*" dot notation may require a different wiring approach.</risk>
    <risk>SESSIONS_EDITS_DIR default calculation uses `path.dirname(LOADOUTS_DIR)`. If LOADOUTS_DIR is a relative path (e.g., `./loadouts`), `path.dirname` may not produce an absolute path. The BE agent should apply `path.resolve` to LOADOUTS_DIR before computing the dirname, or use `path.join(path.resolve(LOADOUTS_DIR), '..', 'sessions-edits')`.</risk>
  </risk_flags>

  <verbatim_deliverable_audit>
    <!-- Every noun/verb phrase from the human request and moirai brief outputs -->
    <phrase text="parse post-mortem markdowns"><addressed task="prog-studio-sessions-2026-05-s1-backend-t2"/></phrase>
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
    <phrase text="session-parser.ts"><addressed task="prog-studio-sessions-2026-05-s1-backend-t2"/></phrase>
    <phrase text="event-log-parser.ts"><addressed task="prog-studio-sessions-2026-05-s1-backend-t3"/></phrase>
    <phrase text="session-stats.ts"><addressed task="prog-studio-sessions-2026-05-s1-backend-t3"/></phrase>
    <phrase text="packages/server/src/parsers/__tests__/"><addressed task="prog-studio-sessions-2026-05-s1-backend-t2"/></phrase>
    <phrase text="session-parser.test.ts"><addressed task="prog-studio-sessions-2026-05-s1-backend-t2"/></phrase>
    <phrase text="event-log-parser test"><addressed task="prog-studio-sessions-2026-05-s1-backend-t3"/></phrase>
    <phrase text="saveedit security test"><addressed task="prog-studio-sessions-2026-05-s1-backend-t5"/></phrase>
    <phrase text=".env.example update"><addressed task="prog-studio-sessions-2026-05-s1-backend-t4"/></phrase>
    <phrase text="CLAUDE.md update"><addressed task="prog-studio-sessions-2026-05-s1-backend-t4"/></phrase>
    <phrase text="test fixtures"><addressed task="prog-studio-sessions-2026-05-s1-backend-t2"/></phrase>
    <phrase text="unit tests under packages/server/src/parsers/__tests__/"><addressed task="prog-studio-sessions-2026-05-s1-backend-t2"/></phrase>
    <phrase text="configure vitest (no unit-test runner currently)"><addressed task="prog-studio-sessions-2026-05-s1-backend-t2"/></phrase>
    <phrase text="No UI work this sprint"><out_of_scope reason="All five packets are BE-only; no client files touched; explicitly listed in out_of_scope for each packet"/></phrase>
    <phrase text="nav registration S2 owns"><deferred reason="Invariant 3 in program.md: S2 owns nav registration. Out of scope for S1."/></phrase>
    <phrase text="proximity edge regression"><out_of_scope reason="Explicitly excluded in both program.md known issues and sprint brief out-of-scope clause."/></phrase>
    <phrase text="S3 dimensional pivots beyond per-agent/per-wave"><deferred reason="Sprint brief out-of-scope clause: S3 will route a dag_update_request if additional aggregation is needed."/></phrase>
  </verbatim_deliverable_audit>

</task_decomposition>

---

## Expectation Manifest

<expectation_manifest>
  <sprint_id>prog-studio-sessions-2026-05-s1-backend</sprint_id>
  <generated>2026-05-06T00:10:00Z</generated>
  <assignments>
    <assignment>
      <task_id>prog-studio-sessions-2026-05-s1-backend-t1</task_id>
      <agent>BE#1</agent>
      <expected_tag>completion_packet</expected_tag>
      <expected_file>.claude/agents/tasks/outputs/prog-studio-sessions-2026-05-s1-backend-t1-BE-*.md</expected_file>
      <blocks>prog-studio-sessions-2026-05-s1-backend-t2</blocks>
      <receipt_check>
        <item>grep count of "export const.*Schema" in schemas.ts returns ≥ 8</item>
        <item>grep count of "export type" in schemas.ts returns ≥ 4</item>
        <item>tsc --noEmit exits 0 on all 3 packages (confirmed in packet)</item>
        <item>git diff removed-lines count for schemas.ts = 0</item>
      </receipt_check>
    </assignment>
    <assignment>
      <task_id>prog-studio-sessions-2026-05-s1-backend-t2</task_id>
      <agent>BE#1</agent>
      <expected_tag>completion_packet</expected_tag>
      <expected_file>.claude/agents/tasks/outputs/prog-studio-sessions-2026-05-s1-backend-t2-BE-*.md</expected_file>
      <blocks>prog-studio-sessions-2026-05-s1-backend-t3</blocks>
      <receipt_check>
        <item>packages/server/package.json has "test" script and vitest in devDependencies</item>
        <item>packages/server/vitest.config.ts exists (confirmed in packet)</item>
        <item>session-parser.test.ts exists (confirmed in packet)</item>
        <item>At least 3 fixture files listed</item>
        <item>npm test exit code = 0</item>
        <item>SessionSchema.parse() called in each fixture test (confirmed in packet)</item>
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
        <item>agent-events-fixture.jsonl confirmed present with ≥ 6 lines</item>
        <item>npm test exit code = 0</item>
        <item>SessionStatsSchema.parse() called inside computeSessionStats (confirmed in packet)</item>
        <item>CRITIQUE_BLOCK → same-agent SPAWN feedback_loop test case confirmed</item>
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
        <item>SESSIONS_EDITS_DIR in env.ts, .env.example, and CLAUDE.md</item>
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
        <item>saveedit-security.test.ts confirmed present</item>
        <item>npm test exit code = 0; test list includes saveedit-security</item>
        <item>All 5 malicious input cases confirmed in packet</item>
        <item>Guard uses path.resolve on both sides (code snippet in packet)</item>
        <item>No filesystem writes in security tests confirmed</item>
        <item>tsc --noEmit exits 0 across all 3 packages</item>
      </receipt_check>
    </assignment>
  </assignments>
</expectation_manifest>
