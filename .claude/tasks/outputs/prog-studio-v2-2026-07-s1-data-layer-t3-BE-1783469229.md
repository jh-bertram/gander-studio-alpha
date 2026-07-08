# BE#3 Completion Packet — prog-studio-v2-2026-07-s1-data-layer-t3

<completion_packet>
  <task_id>prog-studio-v2-2026-07-s1-data-layer-t3</task_id>
  <files_changed>
    - packages/server/src/parsers/party-roster.ts (NEW, 189 lines) — assembleParty, TOKENS_PROJECTED_PLACEHOLDER, bar builders (naStatBar/computedStatBar/activityStatBar/staminaStatBar/accuracyStatBar), computeActivityAnchor, byActivityRecencyDesc
    - packages/server/src/parsers/__tests__/party-roster.test.ts (NEW, 174 lines) — 15 tests
    - packages/server/src/parsers/__tests__/fixtures/party-roster/agent-events-party-roster.jsonl (NEW, 14 lines) — synthetic fixture
    - packages/server/src/router.ts (MODIFIED, +18/-0) — new `rosterRouter` (getParty only) registered under `appRouter.roster`
  </files_changed>
  <zod_contract>
No new schemas added (t1 already delivered the full contract in packages/shared/src/schemas.ts — verified present, no gap). The procedure this packet adds:

```ts
// packages/server/src/router.ts
const rosterRouter = t.router({
  getParty: t.procedure
    .output(PartyStatsSchema)
    .query(async () => {
      return assembleParty(SESSIONS_SOURCE_DIRS.map((dir) => path.join(dir, 'docs', 'events')));
    }),
});
// ...
export const appRouter = t.router({
  // ...
  roster: rosterRouter,
});
```

Output schema (from t1, consumed verbatim):
```ts
PartyStatsSchema = z.object({
  members: z.array(PartyMemberSchema),        // 13 entries, sorted by lastActivityTs desc, nulls last
  diagnostics: z.object({
    totalRawLines: z.number(),
    validEntries: z.number(),
    invalidLineCount: z.number(),
    invalidLineSamples: z.array(z.string()),
    distinctEventTypes: z.number(),
    uncountedEventTypes: z.number(),
  }),
  activityAnchor: z.number(),
});
```

New exported function signature:
```ts
export async function assembleParty(eventsDirs: string[]): Promise<PartyStats>
export const TOKENS_PROJECTED_PLACEHOLDER: PartyStatBar
```
  </zod_contract>
  <test_traceback>
`GANDER_ROOT=/home/jhber/projects/gander LOADOUTS_DIR=/tmp/gander-studio-alpha-loadouts npm run lint`:
```
> lint
> tsc --noEmit --project packages/shared/tsconfig.json && tsc --noEmit --project packages/server/tsconfig.json && tsc --noEmit --project packages/client/tsconfig.json
```
(no output — exit 0, all three tsc invocations clean)

`GANDER_ROOT=/home/jhber/projects/gander LOADOUTS_DIR=/tmp/gander-studio-alpha-loadouts npm test -w @gander-studio/server`:
```
> @gander-studio/server@0.1.0 test
> vitest run src/parsers/__tests__

 RUN  v4.1.7 /home/jhber/projects/gander-studio-alpha/packages/server

 Test Files  15 passed (15)
      Tests  177 passed (177)
   Start at  18:16:25
   Duration  1.39s (transform 498ms, setup 0ms, import 1.13s, tests 876ms, environment 2ms)
```

party-roster.test.ts run in isolation (verbose), 15/15 passed, e.g.:
```
✓ assembleParty — roster shape (SC1) > returns exactly 13 PartyMembers, one per ROSTER code
✓ assembleParty — Activity normalization is anchor-relative, not a locked number (SC1/constraint 7) > the max-spawn role (FE) reads normalized=100 against the LIVE anchor
✓ assembleParty — Activity normalization is anchor-relative, not a locked number (SC1/constraint 7) > a role whose spawnCount is exactly half the anchor reads normalized ~50 — verified via the ratio, not a hardcoded anchor
✓ assembleParty — non-Impl Accuracy is explicit N/A, never a bare 0 (SC4) > HR (Meta, non-Impl) Accuracy is normalized:null with reason "not audit-gated"
✓ assembleParty — Stamina N/A for zero-spawn roles > a role with zero spawns (DI) reads Stamina normalized:null with reason "no spawns observed"
✓ assembleParty — hasCorpusActivity surfaced, never hidden (SC1) > DI ... has hasCorpusActivity:false and lastActivityTs:null
✓ assembleParty — sorted by activity recency, descending, nulls last (SC1) > members with a lastActivityTs are ordered newest-first, ahead of every null-ts member
✓ assembleParty — diagnostics threaded through, not dropped (SC5) > surfaces totalRawLines/validEntries/invalidLineCount/distinct+uncounted event types from t2
✓ tokens/cost — reserved projected placeholder, never a card bar (SC3) > no PartyMember stat ever carries the tokens-projected derivation
```
Full suite: 15 test files / 177 tests, 0 failed, both before AND after the DRY refactor (re-ran both gates a second time post-refactor — identical clean/green result).

Grep confirmations:
```
$ grep -n "DEFERRED-P9-1" packages/server/src/parsers/party-roster.ts
24:// DEFERRED-P9-1 (docs/deferred-work.md): EventLogEntrySchema carries no

$ grep -n "feasibility: 'projected'" packages/server/src/parsers/party-roster.ts
40:  feasibility: 'projected',

$ grep -n "\b46\b" packages/server/src/parsers/party-roster.ts
(no output — none found)

$ git status --short packages/client/
(no output — clean, no client-package changes)
```
  </test_traceback>
  <critical_logic_notes>
**Normalization approach per bar (what raw range maps to 0-100 and why):**

- **Activity** — `raw = spawnCount` (integer count of SPAWN events for the role, from t2). `normalized = round((spawnCount / activityAnchor) * 100)`. `activityAnchor` is computed HERE (not in t2) as the live max `spawnCount` across the 13 ROSTER codes (`computeActivityAnchor`), measured fresh on every call — never a hardcoded corpus number (e.g. the old "46" sample-appendix illustration). If `activityAnchor <= 0` (degenerate/empty corpus — no role in the roster has ever spawned), `normalized` is explicit `null` with `reason: 'no spawn activity observed in corpus'` rather than a divide-by-zero-derived value; this branch is unreachable in the live GANDER_ROOT corpus (which has many spawns) but keeps the function total.
- **Stamina** — `raw = ghostCount` (GHOST_CONFIRMED count for the role's own agent_id, from t2 — always the literal count, even at spawnCount=0). `normalized = round((1 - ghostCount/spawnCount) * 100)` when `spawnCount > 0`; explicit `null` + `reason: 'no spawns observed'` when `spawnCount === 0` (never a misleading 100% "perfect stamina" for a role that has never run).
- **Accuracy** — Impl roles only (`roleCategory === 'Impl'`, i.e. BE/FE/DS in the current 13-entry ROSTER — checked via the ROSTER field rather than a second hardcoded {BE,FE,DS} set, so a future Impl-category addition is covered automatically). `raw = firstPassAudits / attributedAudits` (a 0-1 fraction from t2's attribution-flip), `normalized = round(rate * 100)`. Non-Impl roles get explicit `null` + `reason: 'not audit-gated'`. An Impl role with `attributedAudits === 0` (nothing audited yet, e.g. DS in the test fixture) ALSO gets explicit `null`, distinguished by `reason: 'no attributed audits observed'` — this is a case the packet didn't specify exact wording for; I chose a reason string consistent with the other N/A reasons' tone (short, factual, no blame).

**activityAnchor scope:** computed over the 13 ROSTER codes only (not any stray/unknown role string that might appear in `perRole` from a malformed or future agent_id) — matches the packet's literal text "the LIVE max spawnCount across the roster."

**Sort:** `byActivityRecencyDesc` — ISO-8601 string lexical comparison (`<`/`>`), consistent with `party-stats.ts`'s own `maxTs` helper's documented assumption that all corpus `ts` values share format. Nulls sort last via explicit branches, not `??` tricks (keeps the comparator readable and correct for `Array.prototype.sort`'s stable-sort guarantee in Node).

**Zod-at-the-boundary:** `assembleParty` builds a `raw` object then calls `PartyStatsSchema.parse(raw)` before returning — same pattern as `aggregate-stats.ts`'s `aggregateSessionStats` (cited DRY base). This means a shape bug in assembly throws immediately with a Zod error rather than silently shipping malformed data to the client.

**Tokens/cost placeholder:** `TOKENS_PROJECTED_PLACEHOLDER` is a module-level exported constant, never referenced inside `assembleParty`'s `stats` array construction (verified structurally by inspection AND by a test that greps every returned member's `stats` for `derivation === 'tokens-projected'`).

**Self-correction during implementation:** I initially split the Accuracy-bar logic into two functions (`accuracyStatBar` taking a `roleCategory` param, plus a dead `roleCategoryToCode` helper and an unreachable throw) while second-guessing whether `IMPL_ROLES` should be a code-set or a roleCategory check. I caught this before finalizing and simplified to a single `accuracyStatBar(roleCategory, ...)` function checking `roleCategory === 'Impl'` directly — removed the dead code entirely. Separately, after the file was otherwise complete, I ran the DRY self-scan required by the security pre-flight and found the three bar-builder functions (`activityStatBar`/`staminaStatBar`/`accuracyStatBar`) each hand-rolled the same two `PartyStatBar` object-literal shapes (N/A-with-reason vs. populated); extracted `naStatBar`/`computedStatBar` helpers, re-ran lint+tests (still clean/green) before finalizing.

**Schema-gap check:** No gap found. t1's `packages/shared/src/schemas.ts` §Party/Agent-Detail block (lines 383-472) already contains `FeasibilitySchema`, `PartyStatBarSchema`, `PartyMemberSchema`, `PartyStatsSchema` exactly as the packet's shape contract specifies — verified field-by-field before writing any assembly code. No `<data_request>` was needed.

**Router append-readiness for t4:** `rosterRouter` is a single `t.router({ getParty: ... })` object literal with only one key. t4 re-reads `router.ts` fresh and appends `getAgentDetail: t.procedure...` as a sibling key inside the same object literal — no restructuring needed, `getParty` is untouched by design (t4 is out of scope for this task and was not touched).

**Out-of-scope compliance:** No client-package files touched (verified via `git status --short packages/client/` — empty). No `getAgentDetail` added. No `schemas.ts` or `party-stats.ts` modification (both read-only inputs this packet). No `docs/events/` writes. No git commit performed — this is a completion_packet handoff per protocol; the Orchestrator commits post-audit.
  </critical_logic_notes>
</completion_packet>
