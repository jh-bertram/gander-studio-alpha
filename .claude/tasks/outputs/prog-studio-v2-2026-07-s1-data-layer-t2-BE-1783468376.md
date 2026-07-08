<completion_packet>
  <task_id>prog-studio-v2-2026-07-s1-data-layer-t2</task_id>

  <files_changed>
    <file status="modified">packages/server/src/parsers/event-log-parser.ts — additive: extracted private `listEventLogFiles` helper (behavior-preserving internal refactor of `readEventLogEntries`'s file-listing regex); added new export `readEventLogEntriesWithDiagnostics`. `readEventLogEntries` and `parseEventLogFiles` signatures and observable behavior UNCHANGED (proven by a new regression test, see below).</file>
    <file status="new">packages/server/src/parsers/party-stats.ts — `computePartyDerivations(eventsDirs)`: attribution flip (§2.1), ghost/stall rate (§2.2), event-type coverage (§2.3), diagnostics fold. 234 lines.</file>
    <file status="new">packages/server/src/parsers/__tests__/fixtures/attribution-flip/agent-events-attribution-flip.jsonl — 16-line synthetic fixture (isolated subdirectory — see critical_logic_notes).</file>
    <file status="new">packages/server/src/parsers/__tests__/fixtures/malformed-line/agent-events-malformed-line.jsonl — 3-line synthetic fixture, real seq-7 HCG_RESOLVED shape (isolated subdirectory).</file>
    <file status="new">packages/server/src/parsers/__tests__/party-stats.test.ts — 9 tests.</file>
    <file status="modified">packages/server/src/parsers/__tests__/event-log-parser.test.ts — additive: 3 new tests (§8/§9), import line extended, all 7 pre-existing describe blocks byte-for-byte untouched.</file>
  </files_changed>

  <zod_contract>
No new Zod schemas — this packet is out-of-scope for schemas.ts (t1 owns it). This packet's
exported TypeScript interfaces are the SEAM t3 (party-roster.ts / assembleParty) consumes; they
are structurally compatible with t1's `PartyStatsSchema.diagnostics` shape but are plain TS
interfaces at this layer (Zod validation happens once, at the t3 envelope boundary, per the
packet's own architecture: t2 is pure compute, t3 assembles + validates the final envelope).

```typescript
// packages/server/src/parsers/event-log-parser.ts (new export, additive)
export async function readEventLogEntriesWithDiagnostics(eventsDir: string): Promise<{
  entries: EventLogEntry[];
  totalRawLines: number;
  validEntries: number;
  invalidLineCount: number;
  invalidLineSamples: string[];
}>;

// packages/server/src/parsers/party-stats.ts (new file)
export interface RoleDerivation {
  spawnCount: number;
  lastActivityTs: string | null;
  ghostCount: number;
  firstPassAudits: number;
  attributedAudits: number;
}

export interface PartyDerivationsDiagnostics {
  totalRawLines: number;
  validEntries: number;
  invalidLineCount: number;
  invalidLineSamples: string[];
  distinctEventTypes: number;
  uncountedEventTypes: number;
}

export interface PartyDerivationsResult {
  perRole: Map<string, RoleDerivation>;
  diagnostics: PartyDerivationsDiagnostics;
}

export async function computePartyDerivations(eventsDirs: string[]): Promise<PartyDerivationsResult>;
```

`PartyDerivationsDiagnostics`'s 6 fields are named IDENTICALLY to t1's `PartyStatsSchema.diagnostics`
inline object (totalRawLines, validEntries, invalidLineCount, invalidLineSamples, distinctEventTypes,
uncountedEventTypes) so t3 can spread this object directly into the envelope without renaming.
  </zod_contract>

  <test_traceback>
### `npm run lint` (tsc --noEmit ×3: shared, server, client)

```
$ npm run lint

> lint
> tsc --noEmit --project packages/shared/tsconfig.json && tsc --noEmit --project packages/server/tsconfig.json && tsc --noEmit --project packages/client/tsconfig.json

EXIT_CODE=0
```
(No output = clean across all three projects.)

### `GANDER_ROOT=/home/jhber/projects/gander npm test -w @gander-studio/server`

```
$ GANDER_ROOT=/home/jhber/projects/gander npm test -w @gander-studio/server

> @gander-studio/server@0.1.0 test
> vitest run src/parsers/__tests__


 RUN  v4.1.7 /home/jhber/projects/gander-studio-alpha/packages/server


 Test Files  14 passed (14)
      Tests  162 passed (162)
   Start at  18:04:46
   Duration  1.52s (transform 480ms, setup 0ms, import 1.15s, tests 918ms, environment 2ms)

EXIT_CODE=0
```

14 test files (13 pre-existing + `party-stats.test.ts`), 162 tests total, zero failures, zero skips
in the local env (GANDER_ROOT set — t1's SC5 live-glob test confirmed running, not skipped, via a
separate `--reporter=verbose` pass; see below).

### Verbose confirmation the NEW tests actually ran (not silently absent)

```
$ GANDER_ROOT=/home/jhber/projects/gander npm test -w @gander-studio/server -- --reporter=verbose

 ✓ src/parsers/__tests__/party-stats.test.ts > computePartyDerivations — attribution flip (§2.1, SC2) > FE: clean first-pass family + same-role multi-instance family (FE#1+FE#2->FE) combine to 3/3 first-pass 6ms
 ✓ src/parsers/__tests__/party-stats.test.ts > computePartyDerivations — attribution flip (§2.1, SC2) > BE: AUDIT_FAIL then AUDIT_PASS in the same family -> 0/1 first-pass (attributed, not first-pass) 1ms
 ✓ src/parsers/__tests__/party-stats.test.ts > computePartyDerivations — attribution flip (§2.1, SC2) > same-role multi-instance family: FE#1 + FE#2 (cross-task_id, sprintRoot-merged) both roll to FE — instance-suffix stripping proven through the flip (CR#1 audit-risk-forecast #2) 1ms
 ✓ src/parsers/__tests__/party-stats.test.ts > computePartyDerivations — attribution flip (§2.1, SC2) > AUDIT_PASS/AUDIT_FAIL events attributed to the implementer role, never to the AUDITOR gate role 1ms
 ✓ src/parsers/__tests__/party-stats.test.ts > computePartyDerivations — ghost/stall rate (§2.2) > DS: 1 GHOST_CONFIRMED / 2 SPAWN — own agent_id is the stalled agent directly, no attribution heuristic 1ms
 ✓ src/parsers/__tests__/party-stats.test.ts > computePartyDerivations — event-type coverage (§2.3) > counts distinct ev types and flags the ones session-stats.ts does not count 1ms
 ✓ src/parsers/__tests__/party-stats.test.ts > computePartyDerivations — invalid-line surfacing (silent-empty forbidden, SC3) > counts the HCG_RESOLVED-shaped invalid line (missing agent_id, has resolved_by) — never dropped 2ms
 ✓ src/parsers/__tests__/party-stats.test.ts > computePartyDerivations — multi-root aggregation (SESSIONS_SOURCE_DIRS) > aggregates diagnostics across multiple eventsDirs 1ms
 ✓ src/parsers/__tests__/party-stats.test.ts > computePartyDerivations — multi-root aggregation (SESSIONS_SOURCE_DIRS) > returns empty diagnostics/perRole for a directory that does not exist (no throw, no fabricated data) 0ms
 ✓ src/parsers/__tests__/event-log-parser.test.ts > readEventLogEntriesWithDiagnostics — schema-invalid lines counted, never dropped (SC3) > counts the HCG_RESOLVED-shaped invalid line as invalid and retains a truncated sample 2ms
 ✓ src/parsers/__tests__/event-log-parser.test.ts > readEventLogEntriesWithDiagnostics — schema-invalid lines counted, never dropped (SC3) > validEntries always equals entries.length (no double-count / no drop mismatch) 1ms
 ✓ src/parsers/__tests__/event-log-parser.test.ts > readEventLogEntries — unchanged behavior on the same malformed fixture (t2 out_of_scope guard) > still silently drops the invalid line via console.warn (same 2-entry result as before this packet) 1ms
 ✓ src/parsers/__tests__/agent-role.test.ts > ROSTER.specFile — canonical code->spec mapping resolves to real files (SC5) > (b) live-glob sanity: all 12 non-null specFile values resolve under ${GANDER_ROOT}/.claude/agents/ 1ms
```

Regression evidence for `readEventLogEntries`/`parseEventLogFiles` unchanged: all 7 pre-existing
`event-log-parser.test.ts` describe blocks pass unmodified, PLUS the new §9 test explicitly re-runs
`readEventLogEntries` against the SAME malformed-line fixture used by the new diagnostics test and
asserts the identical 2-entry, console.warn-drop outcome. `session-stats.test.ts`,
`seam-04-feedback-loops.test.ts`, and `aggregate-stats.test.ts` all pass in the full run above
(part of the 162 total).
  </test_traceback>

  <critical_logic_notes>
**1. Corpus-provenance for the malformed-line fixture (packet SC4, auditor-executed path 2).**
Opened `docs/events/agent-events-2026-03-28.jsonl` directly (`grep -n '"seq":7,'`) BEFORE writing
the fixture and confirmed the real line:
`{"seq":7,"ts":"2026-03-28T00:35:00Z","ev":"HCG_RESOLVED","task_id":"gander-studio-p2-canvas-link","gate":"HCG-1","answer":"tree","resolved_by":"human","unblocks":"gander-studio-p2-canvas-link-003c"}`
— confirmed: `resolved_by` present, `agent_id` absent (fails `EventLogEntrySchema` which requires
`agent_id`). `packages/server/src/parsers/__tests__/fixtures/malformed-line/agent-events-malformed-line.jsonl`'s
invalid line matches this shape (`ev: HCG_RESOLVED`, has `gate`/`answer`/`resolved_by`/`unblocks`,
no `agent_id`). Auditor should independently confirm this shape match against the real seq-7 line.

**2. Fixture placement — isolated per-fixture subdirectories, not the shared `fixtures/` dir.**
`computePartyDerivations`/`readEventLogEntriesWithDiagnostics` scan an ENTIRE directory's
`agent-events-*.jsonl` files (multi-file-per-dir is the real production shape — e.g. one file per
day). If the new fixtures lived directly in the pre-existing shared `__tests__/fixtures/` directory
(which already holds `agent-events-fixture.jsonl`, `agent-events-gander-studio-p2-p3.jsonl`,
`agent-events-seam04-parity.jsonl` — all consumed by OTHER suites), calling
`computePartyDerivations([FIXTURES_DIR])` would silently fold those files' BE/FE/CR/SA event
counts into my exact-value assertions, making them non-deterministic and coupling this suite to
unrelated fixtures' future edits. Placed each new fixture in its OWN subdirectory
(`fixtures/attribution-flip/`, `fixtures/malformed-line/`) so `computePartyDerivations([theDir])`
sees exactly one file. This is a placement decision, not a deviation from the packet's literal
filenames — both files are still named exactly `agent-events-attribution-flip.jsonl` and
`agent-events-malformed-line.jsonl` as specified.

**3. Attribution-flip algorithm — `attributedAudits` semantics (flag for auditor + t3).**
The packet's inline SC2 examples (`[SPAWN FE#1, AUDIT_PASS AUDITOR#1] → FE 1/1` and
`[SPAWN BE#1, AUDIT_FAIL, SPAWN BE#1, AUDIT_PASS] → BE 0/1`) only exercise the case where a fail is
eventually resolved by a pass. `session-data-inventory.md` §2.1's WORKED corpus example
("22 first-pass + 6 pass-after-fail + 7 attributed-fail-only = 35" denominator) additionally implies
that an `AUDIT_FAIL` that is NEVER followed by a resolving `AUDIT_PASS` within its family still counts
as one `attributedAudits` unit (an implementer that was audited and currently stands failed, with no
`firstPassAudits` credit). I implemented BOTH cases: within `computePartyDerivations`, an
`AUDIT_PASS` always increments `attributedAudits`+`firstPassAudits` (if no prior unresolved fail);
an `AUDIT_FAIL` with no subsequent resolving `AUDIT_PASS` by the end of its family increments
`attributedAudits` only (once, regardless of how many consecutive fails occurred — multiple
consecutive fails before an eventual pass collapse into a single open-fail marker, matching the "no
FAIL preceded its EVENTUAL PASS" framing literally). Both examples given in SC2 verify correctly
against my implementation (see test file); the "orphaned fail" branch is additionally covered by an
assertion that the `AU` role itself never accumulates `attributedAudits` (proving the flip is real,
not a no-op) but is NOT separately exercised with an orphaned-fail-only family in the fixture — I
judged this a reasonable line to hold to stay within the packet's literal SC2 examples plus the
one explicit multi-instance addition, but flag the design choice explicitly here since t3 consumes
`attributedAudits`/`firstPassAudits` directly for the Accuracy stat bar and PM/auditor should
confirm this reading matches intent.

**4. Grouping mechanism — proven non-trivially, not just same-string equality.** The multi-instance
family uses task_ids `attribution-flip-fe-multiinstance-p1` and
`attribution-flip-fe-multiinstance-p1-002` — two DIFFERENT literal task_ids that `sprintRoot()`
reduces to the SAME root (the `-002` sub-id segment is stripped by `SUB_ID_RE`). I verified this
merge behavior with a standalone node script (inline copy of the `sprintRoot` algorithm) BEFORE
locking in the fixture/test, confirming the family-grouping reuse of `session-slug-match.ts` is
doing real work in this test, not merely comparing two identical strings.

**5. Gate-role exclusion set is intentionally narrower than `ROSTER.roleCategory==='Gate'`.**
`agent-role.ts`'s `ROSTER` marks only CR and AU as `roleCategory: 'Gate'` (ORC is `'Command'`).
The §2.1 derivation contract's literal text excludes `AU`/`CR`/`ORC` from implementer-SPAWN
tracking. I defined a SEPARATE `ATTRIBUTION_EXCLUDED_ROLES = new Set(['AU','CR','ORC'])` constant
in `party-stats.ts` rather than reusing `ROSTER.roleCategory`, with a code comment explaining the
deliberate divergence — reusing `ROSTER.roleCategory` here would have silently excluded ORC's SPAWNs
incorrectly-for-the-wrong-reason (or required a second lookup pattern); this is the more literal,
auditable reading of the contract text.

**6. `readEventLogEntries`/`parseEventLogFiles` behavioral-invariance approach.** Rather than leaving
`readEventLogEntries` with a fully duplicated file-listing block (violates DRY) OR refactoring its
per-line loop to delegate to the new diagnostics function (risks silently dropping its
`console.warn` side-effects, which the packet's out_of_scope explicitly protects), I extracted ONLY
the file-listing regex into a private `listEventLogFiles` helper shared by both readers, and left
each reader's per-line loop body separate (their divergent behavior — warn-and-drop vs.
count-and-sample — is the reason they can't fully merge). This is the narrowest DRY extraction that
doesn't risk the explicit "byte-for-byte unchanged" requirement; documented in a code comment at the
helper's definition site.

**7. No hardcoded corpus values locked in any assertion (SC8).** Grepped `party-stats.ts` and
`party-stats.test.ts` for corpus-report numbers (35, 71, 29, 18, 9/9, 22/35) — the single hit is a
documentary code COMMENT in `party-stats.ts` describing the derivation's methodology by citing the
doc's own worked example (not a live assertion). Every numeric assertion in `party-stats.test.ts`
and the new `event-log-parser.test.ts` tests is derived purely from the synthetic fixtures this
packet authored (16-line and 3-line files, both committed alongside the tests that assert against
them).

**8. Security pre-flight.** No new user-supplied path reaches `path.join`/`path.resolve`/`fs.*` —
`eventsDir`/`eventsDirs` are trusted server-side config values (same trust tier as the pre-existing
`eventsDir` parameter on `readEventLogEntries`), not request input. No `Error.message` from any fs
operation is forwarded anywhere (no router.ts touch this packet — no TRPCError boundary exists in
these two files). No `any` used; `unknown` used for the raw `JSON.parse` result exactly as the
pre-existing code already did.

**9. Out-of-scope compliance.** No schema in `schemas.ts` touched (t1's file, not read-write here
beyond the type import `EventLogEntry`). No `router.ts` touch (t3/t4's job). No 0–100 normalization,
no `PartyMember` assembly, no sort — `computePartyDerivations` returns raw counts/timestamps only,
exactly as scoped. No client-package file touched. No `docs/events/` write. No git commands run.

**SC-by-SC self-check (against the t2 task_packet in
`.claude/tasks/outputs/prog-studio-v2-2026-07-s1-data-layer-rev-PM-1783467209.md`):**
- SC1 (lint clean): PASS — verbatim above.
- SC2 (attribution-flip fixture-tested, exact per-role first-pass, incl. same-role multi-instance
  family FE#1+FE#2→FE): PASS — 4 tests in `party-stats.test.ts`'s first describe block; multi-
  instance case additionally verified via cross-task_id sprintRoot merge (note 4 above).
- SC3 (silent-empty forbidden — invalidLineCount/invalidLineSamples, malformed line COUNTED not
  dropped): PASS — both `event-log-parser.test.ts` §8 and `party-stats.test.ts`'s invalid-line
  describe block assert `invalidLineCount === 1` on the malformed fixture.
- SC4 (corpus-provenance for the malformed fixture, seq-7 sampled and recorded): PASS — note 1 above.
- SC5 (ghost/event-type coverage implemented + unit-tested, deterministic): PASS — dedicated
  describe blocks in `party-stats.test.ts`.
- SC6 (`readEventLogEntries`/`parseEventLogFiles` unchanged — pre-existing suites still pass):
  PASS — all 4 named suites (`event-log-parser.test.ts`, `session-stats.test.ts`,
  `seam-04-feedback-loops.test.ts`, `aggregate-stats.test.ts`) green in the 162-test run, plus a new
  explicit regression test (§9).
- SC7 (`npm test -w @gander-studio/server` fully green): PASS — 14/14 files, 162/162 tests.
- SC8 (no corpus-derived value hardcoded in any assertion): PASS — note 7 above.
  </critical_logic_notes>
</completion_packet>
