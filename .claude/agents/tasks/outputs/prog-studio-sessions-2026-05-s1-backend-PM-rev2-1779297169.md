# Task Decomposition — prog-studio-sessions-2026-05-s1-backend (rev2)
**PM:** PM#3
**ts:** 2026-05-20T00:15:00Z
**sprint:** prog-studio-sessions-2026-05-s1-backend
**program:** prog-studio-sessions-2026-05
**agent_count:** 7 (BE agent, sequential)
**revision_of:** prog-studio-sessions-2026-05-s1-backend-PM-rev1-1779296389.md
**revision_reason:** CRITIQUE_BLOCK — 2 new BLOCKERs (NEW-1 format-heterogeneity, NEW-2 dedup identity) + 1 WARNING (t4 overscoped); human decision: ADD FORMAT-TOLERANCE NOW

---

<task_decomposition task_id="prog-studio-sessions-2026-05-s1-backend" agent_count="7">

  <task_packets>

    <!-- ═══════════════════════════════════════════════════════════════ -->
    <!-- t1: Zod schemas (REVISED — SessionSchema fields made optional   -->
    <!--     with defaults for frontmatter-less format compatibility)    -->
    <!-- ═══════════════════════════════════════════════════════════════ -->
    <task_packet>
      <task_id>prog-studio-sessions-2026-05-s1-backend-t1</task_id>
      <assigned_to>BE</assigned_to>
      <priority>BLOCKER</priority>
      <description>
Append four new Zod schemas to `packages/shared/src/schemas.ts` using the existing export pattern in that file (read the file first — ~53 lines at planning time — to match z.object + named export + z.infer style).

The four schemas to add (names are exact; they are the stable cross-sprint contract t2b and t3 will import via z.infer):

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

   CRITICAL (NEW-1 fix): The studio's own post-mortems have NO YAML frontmatter. They use
   `# Post-Mortem: <slug>` H1 + `**Date:** YYYY-MM-DD` bold lines. The gander post-mortems HAVE
   YAML frontmatter. Both formats are first-class.

   To support both, several fields that are ONLY present in YAML frontmatter must have defaults in
   the schema so that frontmatter-less files do not throw on SessionSchema.parse():

   Fields:
   - `id` (z.string()) — required; derived from sprint frontmatter slug OR filename fallback
   - `sprint` (z.string()) — required; derived from frontmatter OR H1 title OR filename
   - `date` (z.string()) — required; derived from frontmatter OR `**Date:**` bold line OR filename date component
   - `gap_classes` (z.array(z.string()).default([]) — OPTIONAL WITH DEFAULT; absent in frontmatter-less files)
   - `status` (z.string().optional() — OPTIONAL; absent in frontmatter-less files)
   - `type` (z.string().optional() — OPTIONAL; absent in frontmatter-less files; add this field — it was implicit before)
   - `title` (z.string().optional())
   - `filePath` (z.string()) — required; always the on-disk path
   - `editedFilePath` (z.string().optional())
   - `source_root` (z.string() — the configured source root this session was parsed from) — required
   - `agents` (z.array(AgentActivitySchema))
   - `events` (z.array(EventLogEntrySchema))

   The key change: `gap_classes` uses `.default([])` (not required); `status` and `type` are `.optional()`.
   This means frontmatter-less files can parse via SessionSchema.parse() without those fields present.

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
SC6: `gap_classes` uses `.default([])` in SessionSchema — `grep "gap_classes" packages/shared/src/schemas.ts` shows `default(\[\])` or equivalent.
SC7: `status` and `type` are optional in SessionSchema (not required z.string()) — `grep "status\|type" packages/shared/src/schemas.ts` shows `.optional()` for those fields in SessionSchema.
SC8: Typecheck clean: `tsc --noEmit --project packages/shared/tsconfig.json` exits 0.
SC9: Server typecheck still clean: `tsc --noEmit --project packages/server/tsconfig.json` exits 0.
SC10: Client typecheck still clean: `tsc --noEmit --project packages/client/tsconfig.json` exits 0.
SC11: No existing schema declarations modified — `git diff HEAD -- packages/shared/src/schemas.ts | grep '^-[^-]' | grep -v '^---'` returns 0 removed lines (insert-only diff).
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
- Do NOT make `sprint`, `date`, `id`, `filePath`, or `source_root` optional — only gap_classes/status/type are relaxed.
      </out_of_scope>
      <estimated_new_lines>~65 lines (4 schemas + 4 type exports + source_root field + 4 critique/audit fields + gap_classes default + status/type optional). Slightly above 50-LOC gate — audit gate runs.</estimated_new_lines>
      <output_expected>
        <tag>completion_packet</tag>
        <must_contain>
          <item>Confirmation that all 4 schema consts are exported from packages/shared/src/schemas.ts</item>
          <item>Confirmation that all 4 TypeScript types are exported (z.infer)</item>
          <item>Confirmation that ev field uses z.string() (grep evidence)</item>
          <item>Confirmation that AgentActivitySchema has critique_passes, critique_blocks, audit_passes, audit_fails fields</item>
          <item>Confirmation that SessionSchema has source_root field</item>
          <item>Confirmation that gap_classes has .default([]) in SessionSchema</item>
          <item>Confirmation that status and type are .optional() in SessionSchema</item>
          <item>Result of tsc --noEmit across all 3 packages (exit codes)</item>
          <item>git diff line count showing insert-only (0 removed lines in schemas.ts)</item>
        </must_contain>
        <must_not_contain>
          <item>Any changes to router.ts, env.ts, or client files</item>
          <item>z.enum usage for the ev field</item>
          <item>sprint, date, id, filePath, or source_root marked as optional</item>
        </must_not_contain>
        <success_signal>All 11 SCs pass; tsc exits 0 across all 3 packages; ev field confirmed z.string(); gap_classes defaulted; status/type optional.</success_signal>
      </output_expected>
    </task_packet>

    <!-- ═══════════════════════════════════════════════════════════════ -->
    <!-- t2a: vitest setup (config-only) — UNCHANGED FROM rev1          -->
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
    <!-- t2b: session-parser + tests + fixtures (REVISED — format-      -->
    <!--      tolerant parser, frontmatter-less fixture + negative test) -->
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

**CRITICAL: FORMAT-TOLERANT PARSER (NEW-1 fix)**

Two first-class formats exist. The parser MUST handle BOTH:

Format A — YAML frontmatter (gander-style):
  File begins with `---` YAML front matter containing fields: `type`, `sprint`, `date`, `gap_classes`, `status`.
  Example: `/home/jhber/projects/gander/docs/post-mortems/gander-p5-obsidian-l0-l1.md`

Format B — Frontmatter-less (studio-style):
  File begins with `# Post-Mortem: <slug>` H1, followed by `**Date:** YYYY-MM-DD` bold line.
  NO YAML frontmatter. Fields `gap_classes`, `status`, `type` are absent.
  Example: `/home/jhber/projects/gander-studio-alpha/docs/post-mortems/gander-studio-p4-proximity-edge-hardening.md`
  (confirmed: lines 1-6 are `# Post-Mortem: ...` H1 + `**Date:** 2026-04-28` bold lines; no frontmatter at all)

Field derivation rules:

For Format A (gray-matter returns non-empty data object):
  - `sprint` ← frontmatter `sprint` field
  - `date` ← frontmatter `date` field (string)
  - `gap_classes` ← frontmatter `gap_classes` array (or [] if absent)
  - `status` ← frontmatter `status` (optional)
  - `type` ← frontmatter `type` (optional)
  - `id` ← derived from `sprint` slug (the frontmatter sprint value)

For Format B (gray-matter returns empty or absent data object — no frontmatter keys):
  - `sprint` ← extract from the `# Post-Mortem: <value>` H1 line in the body
               (regex: `/^# Post-Mortem:\s*(.+)$/m`, capture group 1, trimmed)
               If no H1 match, fall back to the filename stem (path.basename(filePath, '.md'))
  - `date` ← extract from the `**Date:** YYYY-MM-DD` bold line
              (regex: `/\*\*Date:\*\*\s*(\d{4}-\d{2}-\d{2})/`, capture group 1)
              If no date match, fall back to the filename's date component if present;
              else use empty string (SessionSchema accepts z.string())
  - `gap_classes` ← [] (default; SessionSchema uses .default([]) so this is fine)
  - `status` ← undefined (optional field)
  - `type` ← undefined (optional field)
  - `id` ← same as `sprint` value derived above

Detection logic: after running gray-matter on the file, check if `data` has any recognized
frontmatter key (`sprint`, `date`, `gap_classes`, `status`, `type`). If yes → Format A path.
If the data object is empty (no recognized keys) → Format B path.

Implementation requirements:
1. Read the file and use `gray-matter` (verify it is in packages/server/package.json before importing) to extract frontmatter fields.
2. Apply the format-detection logic above to derive all fields.
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

Copy (do not symlink) representative post-mortem files covering:

Layout (a) — canonical Seq/Timestamp/Event/Agent/Notes table (Format A — YAML frontmatter):
  Use `gander-studio-p1.md` from `${GANDER_ROOT}/docs/post-mortems/`

Layout (b) — phase-subdivided mini-tables (Format A — YAML frontmatter):
  Use `gander-p7-obsidian-l2-l3.md` from `${GANDER_ROOT}/docs/post-mortems/`

Layout (c) — wave-grouped tables (Format A — YAML frontmatter):
  Use `gander-studio-p2-agent-cards.md` from `${GANDER_ROOT}/docs/post-mortems/`

Fourth fixture (Format A, additional):
  Use `gander-p5-obsidian-l0-l1.md` from `${GANDER_ROOT}/docs/post-mortems/`

FIFTH FIXTURE — MANDATORY NEW (Format B — frontmatter-less):
  Copy a studio-style post-mortem with NO YAML frontmatter.
  Use `gander-studio-p4-proximity-edge-hardening.md` from
  `/home/jhber/projects/gander-studio-alpha/docs/post-mortems/`
  This file has `# Post-Mortem: gander-studio-p4-proximity-edge-hardening` H1 and `**Date:** 2026-04-28`
  bold line, and NO frontmatter. It IS the Format B representative.

Tests must be self-contained — they must NOT rely on GANDER_ROOT being set at test time.
The fixture files copied into __tests__/fixtures/ are the test inputs.

**FILE: `packages/server/src/parsers/__tests__/session-parser.test.ts`**

Write unit tests covering:
1. For each of the 5 fixtures: result validates against `SessionSchema.parse()` without throwing.
2. For the Format A fixtures: parse frontmatter fields correctly (type, sprint, date, gap_classes, status).
3. For the Format B fixture (gander-studio-p4-proximity-edge-hardening.md):
   - `sprint` is extracted from H1 (assert equals 'gander-studio-p4-proximity-edge-hardening' or similar)
   - `date` is extracted from bold Date line (assert equals '2026-04-28')
   - `gap_classes` is [] (default applied)
   - `status` is undefined
   - Full SessionSchema.parse() succeeds without throwing — explicit assertion
4. For layout (a) fixture (gander-studio-p1.md): extracts at least 1 AgentActivity entry.
5. For layout (b) fixture (gander-p7-obsidian-l2-l3.md): either produces ≥ 1 AgentActivity entry OR is covered by an explicit "unrecognized layout returns empty agents array without throw" test.
6. For layout (c) fixture: extracts at least 1 AgentActivity entry OR explicit empty-array test.
7. All AgentActivity entries use the correct field names: `critique_passes`, `critique_blocks`, `audit_passes`, `audit_fails`.
8. A synthetic test with no Section 2 at all: empty agents array, no throw.
9. `source_root` field is set to the value passed to `parseSessionFile`.
10. NEGATIVE TEST: a file matching neither format (e.g. a synthetic markdown with no H1 and no frontmatter) returns a valid Session (using filename fallback) — no throw.

NOTE on negative test: "matches neither format → skipped, no throw" means the parser applies fallbacks
(filename as id/sprint, empty gap_classes, undefined status) and returns a valid Session via SessionSchema.parse().
It does NOT mean "throw and swallow" — the per-file robustness (try/catch) is in the router (t4b), not here.
The parser itself returns a valid Session or throws for truly unrecoverable cases (file unreadable).
      </description>
      <success_criteria>
SC1: `packages/server/src/parsers/session-parser.ts` exists and exports `parseSessionFile(filePath: string, source_root: string): Promise&lt;Session&gt;`.
SC2: `packages/server/src/parsers/__tests__/session-parser.test.ts` exists.
SC3: At least 5 fixture files exist under `packages/server/src/parsers/__tests__/fixtures/`, including:
  - 4 Format A fixtures (YAML frontmatter) covering layouts (a), (b), (c) plus one additional
  - 1 Format B fixture (frontmatter-less studio style)
SC4: Layout coverage: one fixture covers canonical 5-column table, one covers phase-subdivided format, one covers wave-grouped format.
SC5: Format B fixture coverage: `grep "gander-studio-p4" packages/server/src/parsers/__tests__/session-parser.test.ts` returns a match — the frontmatter-less fixture is explicitly tested.
SC6: Format B test asserts SessionSchema.parse() succeeds without throwing on the frontmatter-less fixture.
SC7: Format B test asserts `gap_classes` is `[]` and `status` is undefined on the frontmatter-less fixture.
SC8: `npm test -w @gander-studio/server` exits 0 and all session-parser tests pass.
SC9: Each fixture test validates the result with `SessionSchema.parse()` (no manual field checks that bypass Zod).
SC10: AgentActivity field-name correctness: `grep "critique_passes\|critique_blocks\|audit_passes\|audit_fails" packages/server/src/parsers/session-parser.ts` returns ≥ 4 distinct matches (all four fields counted).
SC11: Layout (b) fixture is explicitly covered by either a "produces ≥ 1 agent" assertion or a "produces empty agents array without throw" assertion.
SC12: Negative test present: a synthetic markdown with no H1 and no frontmatter is parsed without throwing — explicit test assertion.
SC13: Typecheck clean: `tsc --noEmit --project packages/server/tsconfig.json` exits 0.
SC14: Shared typecheck still clean: `tsc --noEmit --project packages/shared/tsconfig.json` exits 0.
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
- Do NOT touch router.ts or env.ts (t4a/t4b owns those).
- Do NOT implement event-log parsing or stats join (t3 owns those).
- Do NOT implement saveEdit (t5 owns that).
- Do NOT modify packages/client or packages/shared (t1 owns schemas.ts).
- Do NOT use z.enum for ev — read the AgentActivitySchema fields from the t1 output in schemas.ts.
- Do NOT implement per-file robustness (try/catch per file in the list) — that belongs in the router (t4b).
      </out_of_scope>
      <estimated_new_lines>~140 lines (parser ~90L + test file ~50L). Exceeds 50-LOC gate — audit pipeline runs after this task before t3 starts.</estimated_new_lines>
      <output_expected>
        <tag>completion_packet</tag>
        <must_contain>
          <item>Result of `npm test -w @gander-studio/server` (exit code + test pass count)</item>
          <item>Result of `tsc --noEmit` across server and shared packages</item>
          <item>List of 5 fixture files placed in __tests__/fixtures/ with their format type (A/B) and Section-2 layout identified</item>
          <item>Confirmation that Format B fixture (gander-studio-p4-proximity-edge-hardening.md) parses to valid Session (test assertion confirmed)</item>
          <item>Confirmation that gap_classes defaults to [] and status is undefined on Format B fixture (test assertion confirmed)</item>
          <item>Confirmation that SessionSchema.parse() is called inside each fixture test</item>
          <item>Confirmation that AgentActivity uses critique_passes/critique_blocks/audit_passes/audit_fails field names</item>
          <item>Confirmation that layout (b) fixture is covered by an explicit test (either ≥1 agent or empty-array-no-throw)</item>
          <item>Confirmation that negative test (no H1, no frontmatter → valid Session fallback, no throw) is present</item>
        </must_contain>
        <must_not_contain>
          <item>Modifications to existing parser files</item>
          <item>Any router.ts or env.ts changes</item>
          <item>AgentActivity fields named "audit_passes" that count CRITIQUE_PASS events (wrong semantics)</item>
          <item>Per-file try/catch wrapping in the parser itself (belongs in router)</item>
        </must_not_contain>
        <success_signal>All 14 SCs pass; `npm test -w @gander-studio/server` exits 0; tsc exits 0 on server + shared.</success_signal>
      </output_expected>
    </task_packet>

    <!-- ═══════════════════════════════════════════════════════════════ -->
    <!-- t3: Event-log parser + stats join + tests — UNCHANGED FROM rev1 -->
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
- Do NOT touch router.ts or env.ts (t4a/t4b owns those).
- Do NOT implement saveEdit or path-traversal checks (t5 owns those).
- Do NOT modify any client files.
      </out_of_scope>
      <estimated_new_lines>~190 lines (event-log-parser ~70L + session-stats ~70L + test file ~50L). Exceeds 50-LOC gate — audit pipeline runs after this task before t4a starts.</estimated_new_lines>
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
    <!-- t4a: env wiring + docs (NEW — split from t4)                   -->
    <!--      env.ts SESSIONS_EDITS_DIR + SESSIONS_SOURCE_DIRS          -->
    <!--      + .env.example + CLAUDE.md docs                           -->
    <!-- ═══════════════════════════════════════════════════════════════ -->
    <task_packet>
      <task_id>prog-studio-sessions-2026-05-s1-backend-t4a</task_id>
      <assigned_to>BE</assigned_to>
      <priority>HIGH</priority>
      <description>
Wire env config and update documentation. Two source files + two doc files. APPEND ONLY to all four.

**FILE 1 — `packages/server/src/env.ts` (APPEND ONLY — do not touch existing declarations):**

Add two new exported consts using the optional-with-default pattern (same as `EXPORT_BASE_DIR` already in the file):

1. `SESSIONS_EDITS_DIR` — where session markdown edits are saved.
   Constraint: the default value MUST resolve to an absolute path regardless of whether `LOADOUTS_DIR`
   is configured as a relative or absolute path. Apply `path.resolve()` normalization to `LOADOUTS_DIR`
   before computing the default. Reference the `EXPORT_BASE_DIR` style for the optional-with-default
   pattern. Do NOT use `requireEnv()` for this variable (it has a safe default).

2. `SESSIONS_SOURCE_DIRS` — list of root directories whose `docs/post-mortems/*.md` are scanned by
   `session.list`. Type: `string[]`. Parse from env var as a comma-delimited string → string[], applying
   `path.resolve()` to each entry to normalize relative paths to absolute.
   Default: `[path.resolve(GANDER_ROOT)]` — when unset, behavior is identical to GANDER_ROOT-only
   (preserves program.md Invariant 2).
   Add a Zod validation for the parsed list at the boundary (e.g., `z.array(z.string().min(1))`).
   Wire into env.ts using the same conventions as other variables in that file.
   Import `path` from `'node:path'` at the top if not already imported.

**FILE 2 — `.env.example` (APPEND ONLY):**

Add documentation rows for both new env vars:
```
# SESSIONS_EDITS_DIR — directory where session markdown edits are saved
# Default: computed from LOADOUTS_DIR (absolute-normalized), adjacent sessions-edits folder
# SESSIONS_EDITS_DIR=/path/to/sessions-edits

# SESSIONS_SOURCE_DIRS — comma-delimited list of root directories to scan for post-mortems
# Default: GANDER_ROOT (when unset, only GANDER_ROOT/docs/post-mortems/ is scanned)
# SESSIONS_SOURCE_DIRS=/path/to/gander,/path/to/other-project
```

**FILE 3 — `/home/jhber/projects/gander-studio-alpha/CLAUDE.md` (APPEND TO ENV TABLE):**

Read CLAUDE.md first to locate the environment variables table. Add two rows after the existing rows:
| `SESSIONS_EDITS_DIR` | No | Directory where session markdown edits are saved (default: absolute-normalized path adjacent to `LOADOUTS_DIR`) |
| `SESSIONS_SOURCE_DIRS` | No | Comma-delimited list of root directories to scan for post-mortems (default: `GANDER_ROOT`) |

Section-level file ownership summary:
- env.ts: append SESSIONS_EDITS_DIR + SESSIONS_SOURCE_DIRS only. All existing vars untouched.
- .env.example: append documentation rows only.
- CLAUDE.md: append two table rows only.
      </description>
      <success_criteria>
SC1: `packages/server/src/env.ts` exports `SESSIONS_EDITS_DIR` — `grep "SESSIONS_EDITS_DIR" packages/server/src/env.ts` returns a match.
SC2: `packages/server/src/env.ts` exports `SESSIONS_SOURCE_DIRS` as string[] — `grep "SESSIONS_SOURCE_DIRS" packages/server/src/env.ts` returns a match.
SC3: SESSIONS_EDITS_DIR resolves to an absolute path regardless of LOADOUTS_DIR being relative or absolute — verified by auditor reading env.ts and confirming path.resolve() is called on LOADOUTS_DIR before computing the default.
SC4: SESSIONS_SOURCE_DIRS entries are each normalized via path.resolve() — verified by auditor reading env.ts and confirming path.resolve() applied per entry.
SC5: `.env.example` contains both SESSIONS_EDITS_DIR and SESSIONS_SOURCE_DIRS — `grep -c "SESSIONS_EDITS_DIR\|SESSIONS_SOURCE_DIRS" .env.example` returns ≥ 2.
SC6: CLAUDE.md env table contains both new rows — `grep -c "SESSIONS_EDITS_DIR\|SESSIONS_SOURCE_DIRS" /home/jhber/projects/gander-studio-alpha/CLAUDE.md` returns ≥ 2.
SC7: All existing env vars untouched — `git diff HEAD -- packages/server/src/env.ts | grep '^-[^-]' | grep -v '^---'` returns 0 removed lines (insert-only diff).
SC8: Typecheck clean: `tsc --noEmit --project packages/server/tsconfig.json` exits 0.
SC9: All three `tsc --noEmit` commands exit 0 (server, shared, client).
      </success_criteria>
      <context_files>
        packages/server/src/env.ts
        .env.example
        /home/jhber/projects/gander-studio-alpha/CLAUDE.md
        docs/programs/prog-studio-sessions-2026-05/sprints/prog-studio-sessions-2026-05-s1-backend/orchestrator_brief.md
      </context_files>
      <dependencies>prog-studio-sessions-2026-05-s1-backend-t3</dependencies>
      <out_of_scope>
- Do NOT touch router.ts (t4b owns that).
- Do NOT modify packages/client or packages/shared.
- Do NOT write unit tests for env parsing (constraint-only).
- Do NOT add nav registration (S2 owns that).
- No audit gate for this config+docs-only task (~35 LOC).
      </out_of_scope>
      <estimated_new_lines>~35 lines (env.ts +12L, .env.example +8L, CLAUDE.md +2L). Config+docs only; no audit gate.</estimated_new_lines>
      <output_expected>
        <tag>completion_packet</tag>
        <must_contain>
          <item>grep confirmation SESSIONS_EDITS_DIR and SESSIONS_SOURCE_DIRS appear in env.ts</item>
          <item>grep confirmation both vars in .env.example and CLAUDE.md</item>
          <item>Confirmation that SESSIONS_EDITS_DIR default uses path.resolve on LOADOUTS_DIR (env.ts inspection — auditor reads)</item>
          <item>Confirmation that SESSIONS_SOURCE_DIRS entries apply path.resolve per entry (env.ts inspection)</item>
          <item>git diff removed-lines count for env.ts (should be 0)</item>
          <item>tsc --noEmit exit codes (all 3 packages)</item>
        </must_contain>
        <must_not_contain>
          <item>Any router.ts changes</item>
          <item>Any client or shared/src/schemas.ts modifications</item>
          <item>SESSIONS_EDITS_DIR default that does not apply path.resolve to LOADOUTS_DIR</item>
        </must_not_contain>
        <success_signal>All 9 SCs pass; tsc exits 0 across all 3 packages.</success_signal>
      </output_expected>
    </task_packet>

    <!-- ═══════════════════════════════════════════════════════════════ -->
    <!-- t4b: tRPC session procedures (NEW — split from t4)             -->
    <!--      router.ts session.* namespace with per-file robustness,   -->
    <!--      (source_root,id) dedup, skip count, multi-root test        -->
    <!-- ═══════════════════════════════════════════════════════════════ -->
    <task_packet>
      <task_id>prog-studio-sessions-2026-05-s1-backend-t4b</task_id>
      <assigned_to>BE</assigned_to>
      <priority>HIGH</priority>
      <description>
Append the `session` tRPC sub-router namespace to `packages/server/src/router.ts`.
APPEND ONLY — do not modify any existing procedures (agent.*, skill.*, hook.*, loadout.*, export.*, health).

Read `packages/server/src/router.ts` top-to-bottom before writing to understand the existing sub-router
pattern and the `guardPath` helper (lines ~22-31). The existing `loadout.list` per-file try/catch pattern
(lines ~148-170) is the direct precedent for `session.list` per-file robustness.

**Four new procedures under a `session` namespace:**

**a. `session.list` (query):**
   - Input: `z.object({ limit: z.number().int().min(1).max(100).default(50) })`
   - Output: `z.array(SessionSchema)` with an added `skipped` count field. Define a wrapper type:
     `z.object({ sessions: z.array(SessionSchema), skipped: z.number() })`
     or surface `skipped` as a top-level field in the response object. Either is acceptable; be explicit
     in the schema.

   Implementation constraints (state as constraints — do NOT copy prescriptive code):
   1. For each directory in `SESSIONS_SOURCE_DIRS`, glob `${dir}/docs/post-mortems/*.md`.
   2. For each globbed file path, call `parseSessionFile(filePath, dir)` inside a per-file try/catch
      matching the `loadout.list` precedent. If the parse fails (any error), increment a `skipped`
      counter and continue — do NOT abort the entire list. The `skipped` count MUST be surfaced in the
      response (not silently dropped).
   3. Deduplicate on the composite key `(source_root, id)`, NOT on `id` alone. Two roots containing a
      same-named post-mortem must BOTH appear in the result, disambiguated by `source_root`. If the
      same resolved filePath appears twice within one root's glob (which can happen with symlinks), dedup
      on the absolute filePath for within-root dedup only.
   4. Sort by `date` descending, apply `limit`.

**b. `session.get` (query):**
   - Input: `z.object({ id: z.string() })`
   - Output: `SessionSchema`
   - Implementation: search across all SESSIONS_SOURCE_DIRS for the post-mortem file whose parsed `sprint`
     or `id` matches; parse and return. Throw TRPCError NOT_FOUND if not found.

**c. `session.getStats` (query):**
   - Input: `z.object({ id: z.string() })`
   - Output: `SessionStatsSchema`
   - Implementation: find and parse the session (as in session.get), call `parseEventLogFiles` with the
     session's source_root `docs/events` directory and the session's sprint slug, call `computeSessionStats`,
     return result.

**d. `session.saveEdit` (mutation) — security stub:**
   - Input: `z.object({ id: z.string(), content: z.string() })`
   - Output: `z.object({ success: z.boolean(), filePath: z.string() })`
   - Implementation: apply path-traversal protection before writing. Constraint: resolve both the base
     directory (SESSIONS_EDITS_DIR) and the candidate target with `path.resolve` before any comparison
     check. Reference the existing `guardPath` helper in this file for the `path.resolve` guard pattern
     and match its style. Create `SESSIONS_EDITS_DIR` if missing (fs.mkdirSync recursive). Write content
     to file. Return `{ success: true, filePath }`.
     t5 will extract the guard into `validateSaveEditPath`; the stub here must already use path.resolve
     on both sides so t5's refactor is a pure extraction with no behavior change.
      </description>
      <success_criteria>
SC1: `packages/server/src/router.ts` contains all four procedures: session.list, session.get, session.getStats, session.saveEdit — `grep "session\." packages/server/src/router.ts | wc -l` returns ≥ 4 distinct matches.
SC2: session.list globs across SESSIONS_SOURCE_DIRS (plural) — `grep "SESSIONS_SOURCE_DIRS" packages/server/src/router.ts` returns a match.
SC3: parseSessionFile is called with source_root (dir) as second argument — `grep "parseSessionFile" packages/server/src/router.ts` shows two-arg call.
SC4: Per-file try/catch in session.list — auditor reads router.ts session.list implementation and confirms per-file error isolation matching the loadout.list pattern.
SC5: `skipped` count is surfaced in the session.list response — `grep "skipped" packages/server/src/router.ts` returns a match.
SC6: Dedup uses composite key (source_root, id) — auditor reads session.list implementation and confirms neither id-only dedup nor a dedup that could collapse sessions from different roots.
SC7: Multi-root test: write an integration test (or add to session-parser.test.ts — whichever location makes sense) that configures two fixture roots each containing a same-named `foo.md` post-mortem and asserts that `session.list` returns TWO distinct Session entries. The test must be in the `__tests__` directory and run via `npm test`.
SC8: session.saveEdit uses path.resolve on both SESSIONS_EDITS_DIR (to get safeBase) and the joined candidate path (to get target) — auditor reads implementation.
SC9: All existing procedures untouched — `git diff HEAD -- packages/server/src/router.ts | grep '^-[^-]' | grep -v '^---'` shows 0 removed lines from pre-existing procedure blocks.
SC10: Typecheck clean: all three `tsc --noEmit` commands exit 0.
SC11: `npm test -w @gander-studio/server` exits 0 (no regressions + new multi-root test passes).
      </success_criteria>
      <context_files>
        packages/server/src/router.ts
        packages/server/src/env.ts
        packages/server/src/parsers/session-parser.ts
        packages/server/src/parsers/event-log-parser.ts
        packages/server/src/parsers/session-stats.ts
        packages/shared/src/schemas.ts
        docs/programs/prog-studio-sessions-2026-05/sprints/prog-studio-sessions-2026-05-s1-backend/orchestrator_brief.md
      </context_files>
      <dependencies>prog-studio-sessions-2026-05-s1-backend-t4a</dependencies>
      <out_of_scope>
- Do NOT modify env.ts, .env.example, or CLAUDE.md (t4a owns those).
- Do NOT modify packages/client or packages/shared.
- Do NOT implement additional aggregation dimensions beyond what SessionStatsSchema specifies (S3 will request via dag_update_request if needed).
- Do NOT add nav registration (S2 owns that).
- Do NOT write path-traversal unit tests (t5 owns those).
- Do NOT hardcode prescriptive guard code snippets — use constraint descriptions and reference the existing guardPath helper.
      </out_of_scope>
      <estimated_new_lines>~130 lines (router.ts ~120L for 4 procedures + multi-root test ~20L). Exceeds 50-LOC gate — audit pipeline runs after this task before t5 starts.</estimated_new_lines>
      <output_expected>
        <tag>completion_packet</tag>
        <must_contain>
          <item>Result of all three `tsc --noEmit` commands (exit codes)</item>
          <item>Result of `npm test -w @gander-studio/server` (exit code + pass count including multi-root test)</item>
          <item>grep confirmation that all 4 session.* procedures exist in router.ts</item>
          <item>Confirmation that session.list has per-file try/catch (auditor reads implementation)</item>
          <item>Confirmation that skipped count is surfaced in session.list response (grep or code evidence)</item>
          <item>Confirmation that dedup uses (source_root, id) composite key (code evidence)</item>
          <item>Confirmation that multi-root test: two roots + same-named file → 2 distinct Session entries (test confirmed passing)</item>
          <item>Confirmation that session.saveEdit uses path.resolve on both sides (code evidence)</item>
          <item>git diff removed-lines count for router.ts (should be 0 for pre-existing procedures)</item>
        </must_contain>
        <must_not_contain>
          <item>Any env.ts, .env.example, or CLAUDE.md changes (t4a owns those)</item>
          <item>Any client file modifications</item>
          <item>Any shared/src/schemas.ts modifications (t1 owns that)</item>
          <item>id-only dedup that collapses sessions from two different roots</item>
          <item>session.list that aborts entirely when one file fails to parse</item>
        </must_not_contain>
        <success_signal>All 11 SCs pass; tsc exits 0 across all 3 packages; npm test exits 0 including multi-root test.</success_signal>
      </output_expected>
    </task_packet>

    <!-- ═══════════════════════════════════════════════════════════════ -->
    <!-- t5: saveEdit path-traversal hardening + security tests         -->
    <!--     UNCHANGED FROM rev1 (except dependency is now t4b)         -->
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
      <dependencies>prog-studio-sessions-2026-05-s1-backend-t4b</dependencies>
      <out_of_scope>
- Do NOT modify packages/client or packages/shared.
- Do NOT modify any parser files from t2b or t3 (session-parser.ts, event-log-parser.ts, session-stats.ts).
- Do NOT modify env.ts or .env.example (t4a owns those).
- Do NOT add new tRPC procedures beyond refactoring the saveEdit guard into a helper.
      </out_of_scope>
      <estimated_new_lines>~80 lines (guard helper ~20L + test file ~60L). Exceeds 50-LOC gate — audit pipeline runs after this task (sprint-final audit gate SA+QA+SX).</estimated_new_lines>
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
            → prog-studio-sessions-2026-05-s1-backend-t4a
              → prog-studio-sessions-2026-05-s1-backend-t4b
                → prog-studio-sessions-2026-05-s1-backend-t5

    All seven packets are sequential. No parallelism within this sprint.
    Rationale: t2b writes __tests__/; t3 appends to __tests__/; t4a writes env.ts (t4b imports from it);
    t4b imports from parsers created in t2b+t3 and env vars from t4a; t5 hardens router code created in t4b.
    Sequential chain is mandatory.

    Audit gates:
    - t1: ~65 LOC — run audit gate
    - t2a: ~15 LOC config-only — no audit gate
    - t2b: ~140 LOC — audit gate required before t3 dispatches
    - t3: ~190 LOC — audit gate required before t4a dispatches
    - t4a: ~35 LOC config+docs — no audit gate
    - t4b: ~130 LOC — audit gate required before t5 dispatches
    - t5: ~80 LOC — sprint-final audit gate SA+QA+SX
  </dependency_order>

  <routing_notes>

    <!-- ═══════════════════════════════════════════════════════════════ -->
    <!-- CR#2 BLOCKER RESOLUTION ACKNOWLEDGEMENTS                        -->
    <!-- ═══════════════════════════════════════════════════════════════ -->

    <cr2_blocker_resolution blocker="NEW-1" severity="BLOCKER">
      NEW-1 (format-heterogeneity — two parts):
      PART A resolved in t2b: `parseSessionFile` is now a format-tolerant parser. Field mapping is
      explicitly defined for both formats: Format A (gray-matter YAML frontmatter path) and Format B
      (frontmatter-less studio style — H1 + bold Date line). t2b description enumerates every field's
      derivation rule for both paths. A mandatory 5th fixture (gander-studio-p4-proximity-edge-hardening.md,
      confirmed frontmatter-less) is added. SC5-SC7 assert Format B parses to valid Session. SC12 adds
      a negative test (no H1, no frontmatter → filename fallback, no throw).
      PART A also resolved in t1: SessionSchema has `gap_classes: z.array(z.string()).default([])`,
      `status: z.string().optional()`, `type: z.string().optional()` — fields absent in Format B no longer
      cause SessionSchema.parse() to throw. SC6 and SC7 in t1 verify these relaxations.
      PART B resolved in t4b: session.list wraps each file parse in per-file try/catch matching the
      loadout.list precedent (router.ts lines 148-170). Files matching neither format return via fallback
      (not throw in the parser), but genuinely unreadable files are caught per-file. Skipped count is
      surfaced in response (not silently dropped). t4b SC4 and SC5 enforce this. t4b SC7 adds a multi-root
      test asserting one malformed file does not fail the list and is reported in skip count.
    </cr2_blocker_resolution>

    <cr2_blocker_resolution blocker="NEW-2" severity="BLOCKER">
      NEW-2 (dedup identity): RESOLVED in t4b. Dedup key changed from `id` alone to composite
      `(source_root, id)`. Two roots containing same-named post-mortems both appear in results,
      disambiguated by source_root. t4b SC6 requires auditor to verify composite-key dedup by reading
      implementation. t4b SC7 adds an explicit multi-root test: two configured fixture roots, each
      containing `foo.md`, must yield TWO distinct Session entries from session.list.
      Within-root dedup (same file globbed twice via symlinks) keys on resolved absolute filePath,
      not on id — source_root still participates in identity.
    </cr2_blocker_resolution>

    <cr2_format_tolerance_decision>
      HUMAN DECISION (this round): ADD FORMAT-TOLERANCE NOW. Both formats are first-class. Resolved as:
      (1) t1 schema: gap_classes defaulted, status/type optional — parser can call SessionSchema.parse()
          on frontmatter-less objects without throwing.
      (2) t2b parser: format detection logic (Format A vs. Format B), field derivation rules for both,
          5th fixture (studio-style), tests asserting Format B parses, negative test (fallback to filename).
      (3) t4b router: per-file try/catch per loadout.list precedent; skipped count surfaced.
    </cr2_format_tolerance_decision>

    <cr2_warning_resolution warning="OVERSCOPED-t4">
      t4 OVERSCOPED WARNING: RESOLVED. t4 is split into:
      - t4a: env.ts SESSIONS_EDITS_DIR + SESSIONS_SOURCE_DIRS + .env.example + CLAUDE.md docs (~35 LOC,
        no audit gate). Isolates the env-parsing audit surface. Config+docs only.
      - t4b: router.ts session.* namespace (~130 LOC, audit gate). Isolates the procedure-wiring audit
        surface. Contains the two BLOCKER fixes (per-file robustness, composite-key dedup).
      Total tasks: 7 (was 6 in rev1). Dependency chain updated: t1→t2a→t2b→t3→t4a→t4b→t5.
    </cr2_warning_resolution>

    <!-- ═══════════════════════════════════════════════════════════════ -->
    <!-- PRIOR CRITIC CHALLENGE RESOLUTION (all 8 CR#1 challenges —      -->
    <!-- verified resolved in CR#2, not re-litigated here)               -->
    <!-- ═══════════════════════════════════════════════════════════════ -->

    <prior_challenges_preserved>
      All 8 CR#1 resolutions preserved verbatim from rev1:
      B1 (ev z.string), B2 (4 critique/audit fields), B3 (SESSIONS_EDITS_DIR absolute),
      W1 (t2a/t2b split), W2 (vitest pre-install halt-and-surface),
      W3 (SESSIONS_SOURCE_DIRS comma-delimited + path.resolve per root + default=GANDER_ROOT),
      W4 (constraint-only guards referencing guardPath),
      W5 (≥4 fixtures / ≥3 Section-2 layouts — now ≥5 fixtures / ≥3 layouts + 1 frontmatter format).
    </prior_challenges_preserved>

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
      This revision: t4 is further split into t4a (env+docs, ~35 LOC, no gate) and t4b (router procedures,
      ~130 LOC, audit gate). This split also isolates the two NEW-1/NEW-2 BLOCKER fixes in t4b, making the
      procedure-wiring audit surface standalone and the env audit surface standalone.
    </recurring_pattern>

    <recurring_pattern source="gander-studio-p4-proximity-edge-hardening.md">
      SCOPE_DRIFT / RECIPE_VS_CONSTRAINT: PM v1 shipped prescriptive code snippets for guard logic.
      This revision maintains constraint-only descriptions for all guard logic in t4b and t5, referencing
      the existing guardPath helper at router.ts lines ~22-31.
    </recurring_pattern>

    <recurring_pattern source="gander-studio-p4-proximity-edge-hardening.md">
      SILENT-SUBSTITUTION-AS-GRACEFUL-DEGRADATION (recurring anti-pattern, §5 + §6 G1):
      NEW-1 (session.list aborting on one bad file) and NEW-2 (id-only dedup silently dropping sessions)
      are both instances of this pattern. Both are resolved: per-file try/catch with surfaced skip count
      (NEW-1), and composite-key dedup (NEW-2). The skip count requirement ensures "graceful skip" is
      observable, not invisible.
    </recurring_pattern>

    <!-- ═══════════════════════════════════════════════════════════════ -->
    <!-- WAVE ORDERING                                                    -->
    <!-- ═══════════════════════════════════════════════════════════════ -->
    <wave_ordering>
      Single agent (BE), seven sequential tasks.
      Wave 1: t1 (audit gate). Wave 2: t2a (no audit gate). Wave 3: t2b (audit gate).
      Wave 4: t3 (audit gate). Wave 5: t4a (no audit gate). Wave 6: t4b (audit gate).
      Wave 7: t5 (sprint-final audit gate SA+QA+SX).
    </wave_ordering>

    <!-- ═══════════════════════════════════════════════════════════════ -->
    <!-- SHARED-FILE APPEND SERIALIZATION                                 -->
    <!-- ═══════════════════════════════════════════════════════════════ -->
    <append_serialization>
      packages/server/src/parsers/__tests__/ — t2b creates it + session-parser.test.ts + 5 fixtures;
      t3 appends event-log-parser.test.ts + fixture JSONL;
      t4b appends multi-root test (or extends session-parser.test.ts);
      t5 appends saveedit-security.test.ts.
      Serialization enforced by dependency chain (t3 depends on t2b, t4b depends on t3 via t4a, t5 depends on t4b).
      No concurrent writes possible.
    </append_serialization>

    <!-- ═══════════════════════════════════════════════════════════════ -->
    <!-- DESIGN.MD STATUS                                                 -->
    <!-- ═══════════════════════════════════════════════════════════════ -->
    <design_md_status>N/A — this sprint is BE-only. No UI surfaces touched.</design_md_status>

    <!-- ═══════════════════════════════════════════════════════════════ -->
    <!-- PM BUDGET ACKNOWLEDGEMENT                                        -->
    <!-- ═══════════════════════════════════════════════════════════════ -->
    <pm_budget_acknowledgement>5 reads used of 8-read cap. Under budget.
      Reads: (1) rev1 plan PM-rev1-1779296389.md (2 reads — truncated at 737L + offset 738), (2) CR#2
      block CR-rev1-1779296835.md, (3) studio post-mortem format gander-studio-p4 lines 1-30,
      (4) loadout.list precedent router.ts lines 140-170, (5) PM latest.md.</pm_budget_acknowledgement>

  </routing_notes>

  <risk_flags>
    <risk>gray-matter is listed as "already installed" in the sprint brief. The BE agent should verify it is present in packages/server/package.json before importing it in session-parser.ts. If absent, add it and note the addition in the completion packet.</risk>
    <risk>Post-mortem Section 2 table format varies across the 17+ files. The t2b parser must be tolerant of format variation. The fixture selection covers three distinct Section-2 layouts + the frontmatter-less format. The BE agent should note if any fixture produces unexpected structure and add a targeted parser test for it.</risk>
    <risk>router.ts structure: confirmed from prior reads that it uses sub-router pattern (t.router({...}) with namespace key in appRouter). The BE agent must read the full file before appending to confirm the session namespace wiring approach in t4b.</risk>
    <risk>Multi-root test in t4b requires creating two fixture directories (or using two distinct paths) during the test. The BE agent must make these test roots self-contained (not pointing to live GANDER_ROOT). A fixtures/root-a/ and fixtures/root-b/ approach with copies of the same filename is recommended. The test must clean up or use temp dirs.</risk>
    <risk>Format B (frontmatter-less) date extraction assumes `**Date:** YYYY-MM-DD` format. If a studio post-mortem uses a different date format (e.g. `**Date:** April 28, 2026`), the regex fallback returns empty string. This is acceptable per schema (z.string() accepts any string) but the BE agent should add a comment noting the limitation.</risk>
    <risk>DESIGN.md absent at app root — this is BE-only, so no UI impact. Noted per protocol.</risk>
    <risk>audit_risk_forecast from CR#2: single-root fixture blindness is addressed by the t4b multi-root test SC7. The auditor should spot-check parseSessionFile against a real frontmatter-less studio post-mortem on disk (the studio's own docs/post-mortems/ is the live regression corpus) before signing off.</risk>
  </risk_flags>

  <verbatim_deliverable_audit>
    <!-- Every noun/verb phrase from the human request and orchestrator brief (rev2) -->
    <!-- Rev2 additions: format-tolerance, frontmatter-less, per-file robustness, dedup identity, t4 split -->
    <phrase text="parse post-mortem markdowns"><addressed task="prog-studio-sessions-2026-05-s1-backend-t2b"/></phrase>
    <phrase text="JSONL event logs"><addressed task="prog-studio-sessions-2026-05-s1-backend-t3"/></phrase>
    <phrase text="typed Session objects"><addressed task="prog-studio-sessions-2026-05-s1-backend-t1"/></phrase>
    <phrase text="expose 4 tRPC procedures"><addressed task="prog-studio-sessions-2026-05-s1-backend-t4b"/></phrase>
    <phrase text="session.list"><addressed task="prog-studio-sessions-2026-05-s1-backend-t4b"/></phrase>
    <phrase text="session.get"><addressed task="prog-studio-sessions-2026-05-s1-backend-t4b"/></phrase>
    <phrase text="session.getStats"><addressed task="prog-studio-sessions-2026-05-s1-backend-t4b"/></phrase>
    <phrase text="session.saveEdit"><addressed task="prog-studio-sessions-2026-05-s1-backend-t4b"/></phrase>
    <phrase text="publish Zod contracts to packages/shared/src/schemas.ts"><addressed task="prog-studio-sessions-2026-05-s1-backend-t1"/></phrase>
    <phrase text="SessionSchema"><addressed task="prog-studio-sessions-2026-05-s1-backend-t1"/></phrase>
    <phrase text="AgentActivitySchema"><addressed task="prog-studio-sessions-2026-05-s1-backend-t1"/></phrase>
    <phrase text="EventLogEntrySchema"><addressed task="prog-studio-sessions-2026-05-s1-backend-t1"/></phrase>
    <phrase text="SessionStatsSchema"><addressed task="prog-studio-sessions-2026-05-s1-backend-t1"/></phrase>
    <phrase text="SESSIONS_EDITS_DIR"><addressed task="prog-studio-sessions-2026-05-s1-backend-t4a"/></phrase>
    <phrase text="save-to-new-folder convention"><addressed task="prog-studio-sessions-2026-05-s1-backend-t4a"/></phrase>
    <phrase text="path traversal blocked"><addressed task="prog-studio-sessions-2026-05-s1-backend-t5"/></phrase>
    <phrase text="session-parser.ts"><addressed task="prog-studio-sessions-2026-05-s1-backend-t2b"/></phrase>
    <phrase text="event-log-parser.ts"><addressed task="prog-studio-sessions-2026-05-s1-backend-t3"/></phrase>
    <phrase text="session-stats.ts"><addressed task="prog-studio-sessions-2026-05-s1-backend-t3"/></phrase>
    <phrase text="packages/server/src/parsers/__tests__/"><addressed task="prog-studio-sessions-2026-05-s1-backend-t2b"/></phrase>
    <phrase text="session-parser.test.ts"><addressed task="prog-studio-sessions-2026-05-s1-backend-t2b"/></phrase>
    <phrase text="event-log-parser test"><addressed task="prog-studio-sessions-2026-05-s1-backend-t3"/></phrase>
    <phrase text="saveedit security test"><addressed task="prog-studio-sessions-2026-05-s1-backend-t5"/></phrase>
    <phrase text=".env.example update"><addressed task="prog-studio-sessions-2026-05-s1-backend-t4a"/></phrase>
    <phrase text="CLAUDE.md update"><addressed task="prog-studio-sessions-2026-05-s1-backend-t4a"/></phrase>
    <phrase text="test fixtures"><addressed task="prog-studio-sessions-2026-05-s1-backend-t2b"/></phrase>
    <phrase text="unit tests under packages/server/src/parsers/__tests__/"><addressed task="prog-studio-sessions-2026-05-s1-backend-t2b"/></phrase>
    <phrase text="configure vitest"><addressed task="prog-studio-sessions-2026-05-s1-backend-t2a"/></phrase>
    <phrase text="ev field must be z.string() not z.enum"><addressed task="prog-studio-sessions-2026-05-s1-backend-t1"/></phrase>
    <phrase text="critique_passes / critique_blocks vs audit_passes / audit_fails distinct semantics"><addressed task="prog-studio-sessions-2026-05-s1-backend-t1"/></phrase>
    <phrase text="SESSIONS_SOURCE_DIRS configurable source scope (human decision: CONFIGURABLE)"><addressed task="prog-studio-sessions-2026-05-s1-backend-t4a"/></phrase>
    <phrase text="SESSIONS_SOURCE_DIRS default=GANDER_ROOT"><addressed task="prog-studio-sessions-2026-05-s1-backend-t4a"/></phrase>
    <phrase text="session.source_root field"><addressed task="prog-studio-sessions-2026-05-s1-backend-t1"/></phrase>
    <phrase text="validateSaveEditPath exported helper"><addressed task="prog-studio-sessions-2026-05-s1-backend-t5"/></phrase>
    <!-- NEW-1 rev2 additions -->
    <phrase text="format-tolerant parser (both formats first-class)"><addressed task="prog-studio-sessions-2026-05-s1-backend-t2b"/></phrase>
    <phrase text="YAML path read frontmatter via gray-matter"><addressed task="prog-studio-sessions-2026-05-s1-backend-t2b"/></phrase>
    <phrase text="frontmatter-less path derive fields from markdown body (H1, bold Date line)"><addressed task="prog-studio-sessions-2026-05-s1-backend-t2b"/></phrase>
    <phrase text="gap_classes optional with default (z.array(z.string()).default([]))"><addressed task="prog-studio-sessions-2026-05-s1-backend-t1"/></phrase>
    <phrase text="status optional (not required) in SessionSchema"><addressed task="prog-studio-sessions-2026-05-s1-backend-t1"/></phrase>
    <phrase text="frontmatter-less fixture that parses to valid Session (asserted)"><addressed task="prog-studio-sessions-2026-05-s1-backend-t2b"/></phrase>
    <phrase text="matches neither format skipped no throw (negative test)"><addressed task="prog-studio-sessions-2026-05-s1-backend-t2b"/></phrase>
    <!-- NEW-1b rev2 additions -->
    <phrase text="per-file robustness in session.list (try/catch per file)"><addressed task="prog-studio-sessions-2026-05-s1-backend-t4b"/></phrase>
    <phrase text="skipped field surfaced in session.list response"><addressed task="prog-studio-sessions-2026-05-s1-backend-t4b"/></phrase>
    <phrase text="one malformed file does not fail the list"><addressed task="prog-studio-sessions-2026-05-s1-backend-t4b"/></phrase>
    <!-- NEW-2 rev2 additions -->
    <phrase text="dedup on composite key (source_root, id) not id alone"><addressed task="prog-studio-sessions-2026-05-s1-backend-t4b"/></phrase>
    <phrase text="two roots containing same-named post-mortem yield two distinct Session entries"><addressed task="prog-studio-sessions-2026-05-s1-backend-t4b"/></phrase>
    <!-- t4 split -->
    <phrase text="t4 split into t4a (env+docs) and t4b (router procedures)"><addressed task="prog-studio-sessions-2026-05-s1-backend-t4a"/></phrase>
    <!-- Out of scope -->
    <phrase text="No UI work this sprint"><out_of_scope reason="All seven packets are BE-only; no client files touched; explicitly listed in out_of_scope for each packet"/></phrase>
    <phrase text="nav registration S2 owns"><deferred reason="Invariant 3 in program.md: S2 owns nav registration. Out of scope for S1."/></phrase>
    <phrase text="proximity edge regression"><out_of_scope reason="Explicitly excluded in both program.md known issues and sprint brief out-of-scope clause."/></phrase>
    <phrase text="S3 dimensional pivots beyond per-agent/per-wave"><deferred reason="Sprint brief out-of-scope clause: S3 will route a dag_update_request if additional aggregation is needed."/></phrase>
  </verbatim_deliverable_audit>

</task_decomposition>

---

## Expectation Manifest

<expectation_manifest>
  <sprint_id>prog-studio-sessions-2026-05-s1-backend</sprint_id>
  <generated>2026-05-20T00:15:00Z</generated>
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
        <item>grep confirms gap_classes has .default([]) in SessionSchema</item>
        <item>grep confirms status and type are .optional() in SessionSchema</item>
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
        <item>5 fixture files listed: 4 Format A (YAML frontmatter, 3 layouts + 1 additional) + 1 Format B (frontmatter-less)</item>
        <item>Format B fixture (gander-studio-p4-proximity-edge-hardening.md) explicitly tested — sprint confirmed in H1, date confirmed from bold line</item>
        <item>gap_classes = [] and status = undefined confirmed on Format B fixture (test assertion)</item>
        <item>SessionSchema.parse() succeeds on Format B fixture (explicit assertion)</item>
        <item>AgentActivity uses critique_passes/critique_blocks/audit_passes/audit_fails (grep evidence)</item>
        <item>Layout (b) fixture explicitly covered in tests</item>
        <item>Negative test present (no H1, no frontmatter → filename fallback, no throw)</item>
        <item>npm test exit code = 0</item>
      </receipt_check>
    </assignment>
    <assignment>
      <task_id>prog-studio-sessions-2026-05-s1-backend-t3</task_id>
      <agent>BE#1</agent>
      <expected_tag>completion_packet</expected_tag>
      <expected_file>.claude/agents/tasks/outputs/prog-studio-sessions-2026-05-s1-backend-t3-BE-*.md</expected_file>
      <blocks>prog-studio-sessions-2026-05-s1-backend-t4a</blocks>
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
      <task_id>prog-studio-sessions-2026-05-s1-backend-t4a</task_id>
      <agent>BE#1</agent>
      <expected_tag>completion_packet</expected_tag>
      <expected_file>.claude/agents/tasks/outputs/prog-studio-sessions-2026-05-s1-backend-t4a-BE-*.md</expected_file>
      <blocks>prog-studio-sessions-2026-05-s1-backend-t4b</blocks>
      <receipt_check>
        <item>grep confirms SESSIONS_EDITS_DIR and SESSIONS_SOURCE_DIRS in env.ts</item>
        <item>SESSIONS_EDITS_DIR default applies path.resolve to LOADOUTS_DIR (env.ts inspection — auditor reads)</item>
        <item>SESSIONS_SOURCE_DIRS entries apply path.resolve per entry (env.ts inspection)</item>
        <item>grep confirms both vars in .env.example (≥ 2 matches)</item>
        <item>grep confirms both vars in CLAUDE.md (≥ 2 matches)</item>
        <item>git diff removed-lines count for env.ts = 0 (insert-only)</item>
        <item>tsc --noEmit exits 0 across all 3 packages</item>
      </receipt_check>
    </assignment>
    <assignment>
      <task_id>prog-studio-sessions-2026-05-s1-backend-t4b</task_id>
      <agent>BE#1</agent>
      <expected_tag>completion_packet</expected_tag>
      <expected_file>.claude/agents/tasks/outputs/prog-studio-sessions-2026-05-s1-backend-t4b-BE-*.md</expected_file>
      <blocks>prog-studio-sessions-2026-05-s1-backend-t5</blocks>
      <receipt_check>
        <item>grep confirms all 4 session.* procedures in router.ts</item>
        <item>session.list has per-file try/catch (auditor reads — matches loadout.list pattern)</item>
        <item>skipped count surfaced in session.list response (grep evidence)</item>
        <item>dedup uses (source_root, id) composite key (auditor reads implementation)</item>
        <item>multi-root test: two fixture roots + same-named foo.md → 2 distinct Session entries (test confirmed passing)</item>
        <item>session.saveEdit uses path.resolve on both sides (auditor reads implementation)</item>
        <item>git diff removed-lines for pre-existing procedures in router.ts = 0</item>
        <item>tsc --noEmit exits 0 across all 3 packages</item>
        <item>npm test still exits 0 (no regressions + new multi-root test passes)</item>
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
