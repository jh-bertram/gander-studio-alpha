# BE#4 Completion — prog-studio-v2-2026-07-s1-data-layer-t4

Agent-detail assembly + `roster.getAgentDetail(code)` — final packet of the v2 data-layer sprint.

<completion_packet>
  <task_id>prog-studio-v2-2026-07-s1-data-layer-t4</task_id>

  <files_changed>
    <file status="NEW">packages/server/src/parsers/agent-detail.ts (248 lines) — assembleAgentDetail(code, ganderRoot, eventsDirs)</file>
    <file status="NEW">packages/server/src/parsers/__tests__/agent-detail.test.ts (254 lines) — fixture layer (7 tests) + live-corpus non-empty layer (SC3, 3 tests)</file>
    <file status="MODIFIED">packages/server/src/router.ts — append-only: +2 imports (AgentDetailSchema, assembleAgentDetail) + getAgentDetail procedure appended to the EXISTING rosterRouter (getParty untouched, re-read fresh before editing)</file>
  </files_changed>

  <procedure_signature>
```ts
// packages/server/src/parsers/agent-detail.ts
export async function assembleAgentDetail(
  code: string,
  ganderRoot: string,
  eventsDirs: string[],
): Promise<AgentDetail>

// packages/server/src/router.ts — rosterRouter (appended to t3's router)
getAgentDetail: t.procedure
  .input(z.object({ code: z.string() }))
  .output(AgentDetailSchema)
  .query(async ({ input }) =>
    assembleAgentDetail(input.code, GANDER_ROOT, SESSIONS_SOURCE_DIRS.map(d => path.join(d, 'docs', 'events')))
  )
```
  </procedure_signature>

  <zod_contract>
No schemas.ts edits this packet — AgentDetailSchema + subs were delivered by t1 and consumed verbatim:

```ts
// packages/shared/src/schemas.ts (t1, unmodified — cited for reference only)
export const AgentDetailSchema = z.object({                     // roster.getAgentDetail OUTPUT
  code: z.string(),
  roleCategory: z.enum(['Impl', 'Command', 'Intel', 'Meta', 'Gate']),
  materiaColorKey: z.string(),
  equipment: z.array(EquipmentSchema),                          // { tool: string }[]
  materia: z.object({ skills: z.array(MateriaSchema), hooks: z.array(MateriaSchema) }),
  abilities: z.array(AbilitySchema),                            // ALWAYS [] this sprint (contracted)
  relationships: z.array(RelationshipEdgeSchema),                // connectivity subset
  qualityStats: z.array(QualityStatSchema),                      // 2 entries: Ghost/stall rate, First-pass audit rate
  dataQualityNotes: z.array(z.string()),
});
export type AgentDetail = z.infer<typeof AgentDetailSchema>;
```

**Schema gap flagged (not fixed — out of scope):** `QualityStatSchema` carries no `reason` field
(unlike `PartyStatBarSchema`, which has `reason: z.string().optional()`). N/A explanations for
non-Impl-role first-pass-rate stats therefore route through the record-level `dataQualityNotes`
array instead of a per-stat reason string. Flag for s4/schema-review, not addressed here per
"no schemas.ts edits (flag gaps instead)."
  </zod_contract>

  <code_to_spec_resolution_notes>
Resolution is entirely via t1's canonical `ROSTER.specFile` — no disk-inference, no second
hardcoded map (per CR#1 FIX 1 / FIX 1b, and per this packet's out_of_scope):

1. `ROSTER.find(r => r.code === code)` — unmatched code (not one of the 13) throws a plain
   `Error('Unknown role code: {code}')`. router.ts's `getAgentDetail` catches this and maps it to
   `TRPCError({ code: 'NOT_FOUND', message: 'Unknown role code' })` — the same
   "parser throws plain Error, router boundary translates to opaque TRPCError" pattern already
   established by `saveedit-guard.ts` in this codebase (no raw internals forwarded to the client;
   Security Pre-Flight "Error messages from fs operations" note observed).
2. `entry.specFile === null` (DI only) → skip spec resolution entirely; push
   `"no agent spec on disk for code DI (ROSTER.specFile is null)"` to `dataQualityNotes`.
3. Otherwise: `parseAllAgents(ganderRoot)` → find the `Agent` whose `path.basename(a.filePath) === entry.specFile`.
   - If found: equipment/materia/relationships are derived from it + the connectivity graph.
   - If NOT found (ROSTER says a spec should exist but parseAllAgents didn't return one — a stale
     mapping, per the risk_flags residual-risk note): push a DIFFERENT note —
     `"agent spec file '{specFile}' not found via parseAllAgents (ROSTER.specFile may be stale)"`.
     **This is the SC3/SC5 distinguishability requirement**: DI's note text is distinct from the
     stale-mapping note text, so a consumer can tell "no spec was ever expected" apart from
     "a spec was expected but the ROSTER mapping is stale" — proven in
     `agent-detail.test.ts`'s "a spec-backed code whose file is MISSING... yields a DIFFERENT note
     than DI" test.
4. Connectivity-graph matching uses **basename comparison** on edge `source`/`target` strings
   against `entry.specFile` (not exact node-id string equality) — per the packet's explicit
   instruction ("matching... connectivity edge source path basenames"). This sidesteps the
   relative-vs-absolute path-format mismatch between `Agent.filePath` (absolute, from
   `parseAllAgents`) and connectivity node `id`s (relative, e.g. `.claude/agents/frontend.md`) —
   no path manipulation of user input occurs anywhere in this resolution chain (the `code` input
   only ever indexes into the static ROSTER array; it is never string-built into a filesystem path).
  </code_to_spec_resolution_notes>

  <sc_by_sc_self_check>

**SC1 — lint clean.**
```
$ npm run lint
> tsc --noEmit --project packages/shared/tsconfig.json && tsc --noEmit --project packages/server/tsconfig.json && tsc --noEmit --project packages/client/tsconfig.json
(no output — exit 0, all 3 tsc runs clean)
```
PASS.

**SC2 — getAgentDetail returns AgentDetail with equipment/materia{skills,hooks}/abilities(contracted-empty)/relationships; analogy field names exact; code→spec via ROSTER.specFile (not disk-inferred).**
Verified by `agent-detail.test.ts`'s "BE (spec-backed)" fixture test: `equipment` maps 1:1 from
`Agent.tools`; `materia.skills`/`materia.hooks` each carry `{kind, name, provenancePath}`;
`relationships` carries the `spawns` edge. Field names in the returned object are the schema's
literal `equipment`/`materia`/`skills`/`hooks`/`abilities` keys (enforced by `AgentDetailSchema.parse`
at the end of `assembleAgentDetail` — any missing/misnamed key would fail Zod validation and throw).
PASS.

**SC3 — NON-EMPTY equipment+materia for FE/AU against live GANDER_ROOT (an all-empty result FAILS); DI empty+note distinguishable from parse failure. MUST RUN, not skip.**
Ran verbatim (verbose reporter, `GANDER_ROOT=/home/jhber/projects/gander` set):
```
✓ assembleAgentDetail — live-corpus non-empty layer (SC3, FIX 1c) > FE: NON-EMPTY equipment AND NON-EMPTY materia against the live GANDER_ROOT 22ms
✓ assembleAgentDetail — live-corpus non-empty layer (SC3, FIX 1c) > AU: NON-EMPTY equipment AND NON-EMPTY materia against the live GANDER_ROOT 16ms
✓ assembleAgentDetail — live-corpus non-empty layer (SC3, FIX 1c) > DI: still empty+note against the live GANDER_ROOT (the ONE legitimate empty case) 1ms
```
Confirmed RAN (not `.skip`; sub-second real fs+parse timings, not synchronous skip markers).
Also confirmed the skip-branch fires correctly when `GANDER_ROOT` is unset (`↓ ... SKIPPED: GANDER_ROOT
is unset...`, 7/8 passed + 1 skipped in that run) — the gate degrades gracefully in CI without ever
silently passing. PASS.

**SC4 — quality stats declare attribution side: first-pass → implementer-backward-look (Impl roles); ghost → direct-agent-id; non-Impl/gate → gate-renderer with null value + note.**
`agent-detail.test.ts`: "qualityStats declare attribution side" (BE, Impl) asserts
`ghost.attribution === 'direct-agent-id'`, `firstPass.attribution === 'implementer-backward-look'`,
both `normalized: null` (no events dir supplied, so explicit N/A — never a bare 0). "non-Impl role
(ORC, Command) declares gate-renderer attribution" asserts `firstPass.attribution === 'gate-renderer'`,
`raw: null`, PLUS an explicit `dataQualityNotes` entry containing "not applicable to role category".
PASS.

**SC5 — no-on-disk-spec code (DI) returns roster metadata + dataQualityNote, never a throw, never a silent empty — the ONE legitimate empty case.**
`agent-detail.test.ts`: "DI (specFile: null) returns roster metadata + empty equipment/materia +
a distinguishing dataQualityNote, never a throw" — asserts `code:'DI'`, `roleCategory:'Meta'`,
`equipment: []`, `materia: {skills:[],hooks:[]}`, `relationships: []`, and the DI-specific note text
present. Confirmed against BOTH the fixture layer and the live-corpus layer (SC3's third test). PASS.

**SC6 — abilities:[] + surfaced dataQualityNote is CONTRACTED behavior (program.md §5 note 2), not under-delivery.**
`agent-detail.test.ts`: "abilities:[] + a surfaced dataQualityNote is the CONTRACTED behavior for
every code" — asserts `abilities: []` AND a `dataQualityNotes` entry containing "abilities
intentionally empty". This note is pushed unconditionally for every code (verified present in
every fixture + live-corpus test's implicit envelope). PASS.

**SC7 — router.ts re-read fresh; getAgentDetail appended to the SAME rosterRouter as t3's getParty; getParty untouched, no clobber.**
`git diff -- packages/server/src/router.ts` (recorded verbatim below) shows the `getParty` block
present character-for-character as t3 left it (no diff marks on those lines — only new lines added
after it), with `getAgentDetail` appended inside the same `rosterRouter = t.router({...})` object
literal. Confirmed also via `git diff --stat` on `agent-role.ts`, `party-stats.ts`, `party-roster.ts`,
`schemas.ts`, and `packages/client/*` — all show ZERO diff (untouched). PASS.

**SC8 — npm test -w @gander-studio/server green (new suite + all prior).**
```
$ GANDER_ROOT=/home/jhber/projects/gander npm test -w @gander-studio/server
> @gander-studio/server@0.1.0 test
> vitest run src/parsers/__tests__

 Test Files  16 passed (16)
      Tests  187 passed (187)
   Duration  1.61s
```
PASS (no client-package change — confirmed via git diff --stat above).

**ALL 8 SCs: PASS.**
  </sc_by_sc_self_check>

  <test_traceback>
### `npm run lint` (tsc ×3)
```
$ npm run lint
> lint
> tsc --noEmit --project packages/shared/tsconfig.json && tsc --noEmit --project packages/server/tsconfig.json && tsc --noEmit --project packages/client/tsconfig.json
(no output — clean, exit 0)
```

### `GANDER_ROOT=/home/jhber/projects/gander npm test -w @gander-studio/server` (full suite)
```
> @gander-studio/server@0.1.0 test
> vitest run src/parsers/__tests__

 RUN  v4.1.7 /home/jhber/projects/gander-studio-alpha/packages/server

 Test Files  16 passed (16)
      Tests  187 passed (187)
   Start at  18:32:10
   Duration  1.61s (transform 559ms, setup 0ms, import 1.33s, tests 1.03s, environment 2ms)
```

### `agent-detail.test.ts` verbose (SC3 evidence — GANDER_ROOT set)
```
✓ assembleAgentDetail — fixture layer (SC1/SC2/SC4) > BE (spec-backed): equipment maps from tools, materia.skills/hooks carry provenancePath, relationships include the spawns edge 19ms
✓ assembleAgentDetail — fixture layer (SC1/SC2/SC4) > qualityStats declare attribution side: ghost-rate direct-agent-id, first-pass implementer-backward-look for an Impl role 5ms
✓ assembleAgentDetail — fixture layer (SC1/SC2/SC4) > non-Impl role (ORC, Command) declares gate-renderer attribution for first-pass rate, with an explicit dataQualityNote 5ms
✓ assembleAgentDetail — fixture layer (SC1/SC2/SC4) > abilities:[] + a surfaced dataQualityNote is the CONTRACTED behavior for every code (SC6, program.md §5 note 2) 4ms
✓ assembleAgentDetail — no-spec-code (DI) graceful path, distinguishable from a parse failure (SC3/SC5) > DI (specFile: null) returns roster metadata + empty equipment/materia + a distinguishing dataQualityNote, never a throw 2ms
✓ assembleAgentDetail — no-spec-code (DI) graceful path, distinguishable from a parse failure (SC3/SC5) > a spec-backed code whose file is MISSING from the mock tree (stale ROSTER.specFile) yields a DIFFERENT note than DI — distinguishable from the no-spec-expected case 4ms
✓ assembleAgentDetail — unknown code > throws a plain Error for a code not present in ROSTER at all 3ms
✓ assembleAgentDetail — live-corpus non-empty layer (SC3, FIX 1c) > FE: NON-EMPTY equipment AND NON-EMPTY materia against the live GANDER_ROOT 22ms
✓ assembleAgentDetail — live-corpus non-empty layer (SC3, FIX 1c) > AU: NON-EMPTY equipment AND NON-EMPTY materia against the live GANDER_ROOT 16ms
✓ assembleAgentDetail — live-corpus non-empty layer (SC3, FIX 1c) > DI: still empty+note against the live GANDER_ROOT (the ONE legitimate empty case) 1ms

 Test Files  1 passed (1)
      Tests  10 passed (10)
```

### `agent-detail.test.ts` verbose (GANDER_ROOT UNSET — confirms graceful skip, not silent pass)
```
✓ ...7 fixture-layer tests unchanged...
↓ assembleAgentDetail — live-corpus non-empty layer (SC3, FIX 1c) > live-corpus non-empty layer — SKIPPED: GANDER_ROOT is unset in this environment (CI); set GANDER_ROOT to a real gander repo to run this assertion

 Test Files  1 passed (1)
      Tests  7 passed | 1 skipped (8)
```

### Scope-boundary verification (`git diff --stat` — confirms out-of-scope files untouched)
```
$ git diff --stat -- packages/shared/src/schemas.ts packages/server/src/parsers/agent-role.ts \
    packages/server/src/parsers/party-stats.ts packages/server/src/parsers/party-roster.ts packages/client/
(empty — zero diff on all 5 paths)

$ git diff --stat
 docs/SESSION-CHECKPOINT.md                      |  54 +++++++-----
 docs/agent-logs/AUD/latest.md                   |  34 ++++----
 docs/agent-logs/BE/latest.md                    | 111 ++++++++++++++--------
 docs/agent-logs/CR/latest.md                    |  26 +++---
 docs/agent-logs/PM/latest.md                    |  15 ++--
 docs/events/agent-events-2026-07-07.jsonl       |  17 ++++
 docs/programs/prog-studio-v2-2026-07/program.md |   5 ++
 docs/task-registry.md                           |  28 ++++++
 packages/server/src/router.ts                   |  35 ++++++++
 9 files changed, 231 insertions(+), 94 deletions(-)
```
(The `docs/*` deltas above pre-date this task — not authored by BE#4; router.ts is the only
source file this packet modified, agent-detail.ts + agent-detail.test.ts are new/untracked.)
  </test_traceback>

  <critical_logic_notes>
**1. `triggers_hook` edge-direction deviation from the packet's literal text — flagged for CR/PM/auditor review.**
The packet's description says: "find edges where this agent's spec path is the source with
edgeType references_skill/invokes_skill (skills) and triggers_hook (hooks)." I verified this
against the LIVE `${GANDER_ROOT}/docs/connectivity-graph.json` before writing code (the same
discipline CR#1 applied when it caught the code→spec mapping assumption): of 102 `triggers_hook`
edges in the real graph, **0 have an agent node as the SOURCE** — the analyzer's real convention is
always hook-as-source / agent-as-target (e.g. `~/.claude/hooks/backfill-autofire.sh
--triggers_hook--> .claude/agents/frontend.md`, confidence INFERRED, matched on a role-code string
in the hook script). A literal "agent-as-source-only" implementation would make
`materia.hooks` **structurally empty for all 13 codes, permanently** — not a legitimate DI-style
empty, but exactly the silent-empty-forever class this entire sprint exists to prevent (constraint 5 /
SC3's "an all-empty result FAILS rather than passing as graceful"). I implemented bidirectional
endpoint matching for `triggers_hook` specifically (agent as EITHER source or target), documented
inline in `agent-detail.ts` with the corpus evidence, and am surfacing it here explicitly rather
than silently substituting my own reading. `references_skill`/`invokes_skill` (skills) DID match the
packet's literal source-only convention against the live data, so that part is implemented exactly
as specified. Recommend CR/PM confirm this is the intended semantics (or, alternatively, ratify the
packet text as descriptive-but-imprecise, matching the ROSTER.specFile precedent from CR#1).

**2. `QualityStatSchema` has no `reason` field.** Unlike `PartyStatBarSchema` (which has
`reason: z.string().optional()`), `QualityStatSchema` only carries `label/raw/normalized/
derivation/feasibility/attribution` — no space for an inline N/A explanation string. I routed the
"not applicable to non-Impl roles" explanation through the AgentDetail-level `dataQualityNotes`
array instead (one entry per response when `roleCategory !== 'Impl'`). Flagged as a schema gap per
this packet's out-of-scope ("no schemas.ts edits — flag gaps instead"); not fixed here.

**3. qualityStats math intentionally NOT imported from party-roster.ts.** t2's
`computePartyDerivations` raw counts are shared, but the normalization/N/A-branching logic
(`ghostRateQualityStat`/`firstPassQualityStat` in `agent-detail.ts`) mirrors — but does not literally
reuse — party-roster.ts's private (unexported) `staminaStatBar`/`accuracyStatBar` functions, because
(a) they aren't exported, and (b) modifying t3's `party-roster.ts` to export them is out of this
packet's scope ("Do NOT modify... t3 files beyond router.ts"). The `QualityStat` shape also
genuinely differs from `PartyStatBar` (carries `attribution`, lacks `reason`), so this is not a pure
copy-paste duplication — the two functions in `agent-detail.ts` are each ~6 lines, deliberately kept
minimal to bound the unavoidable overlap.

**4. Security Pre-Flight — no path-manipulation risk in this file.** `code` (the only user-controlled
input to `assembleAgentDetail`/`getAgentDetail`) is used EXCLUSIVELY as a lookup key into the static
`ROSTER` array (`ROSTER.find(r => r.code === code)`) — it is never interpolated into a `path.join`/
`path.resolve` call or used to construct a filesystem path. `ganderRoot` and `eventsDirs` are
server-config values (GANDER_ROOT/SESSIONS_SOURCE_DIRS env), not user input. No `guardPath`-style
containment check was needed or added — consistent with the packet's own SX framing ("GANDER_ROOT
path-guard reuse on connectivity/spec reads" refers to guarding against *escaping* GANDER_ROOT via
user input, which cannot happen here since no user input reaches a path-construction call).
`readConnectivityGraphSafe` never forwards raw fs/JSON-parse error messages to the client — it
returns `null` on any failure and the caller surfaces a generic `dataQualityNote` instead. The
`getAgentDetail` router boundary itself only ever throws opaque `TRPCError` messages
('Unknown role code' / 'Operation failed'), never a raw `err.message`.

**5. DRY note.** The initial draft of `agent-detail.test.ts` repeated an identical
`const root = buildMockGanderRoot(); try {...} finally { fs.rmSync(...) }` scaffold across 6 tests;
caught in self-review before handoff and extracted to a `withMockGanderRoot()` wrapper (see the
Stage-2/checkpoint log at `docs/agent-logs/BE/prog-studio-v2-2026-07-s1-data-layer-t4.md`).

**6. GATE-DEVSERVER (SC7 of the sprint-level manifest, distinct from this packet's internal SC7) is
explicitly ORC-executed per dependency_order** — starting the dev server and confirming both
`roster.getParty` and `roster.getAgentDetail` respond on :3001 is out of this packet's scope
(PM has no Bash; the packet's own out_of_scope doesn't mention it, and the sprint-level
`verbatim_deliverable_audit` assigns it to "GATE-DEVSERVER (ORC-executed close-blocking gate)").
  </critical_logic_notes>
</completion_packet>
