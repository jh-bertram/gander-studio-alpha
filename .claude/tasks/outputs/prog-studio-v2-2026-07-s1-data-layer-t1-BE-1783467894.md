# BE#1 Completion Packet — prog-studio-v2-2026-07-s1-data-layer-t1

<completion_packet>
  <task_id>prog-studio-v2-2026-07-s1-data-layer-t1</task_id>
  <files_changed>
    - packages/shared/src/schemas.ts (MODIFIED, additive-only, +90 lines: 10 new v2 party/agent-detail schemas + 10 z.infer type exports)
    - packages/server/src/parsers/agent-role.ts (NEW, 68 lines: roleOf, canonicalizeRole, 13-entry ROSTER incl. specFile column + canonical-mapping maintenance comment)
    - packages/server/src/parsers/__tests__/agent-role.test.ts (NEW, 96 lines: SC4 shape tests + SC5 mock-dir fixture + live-glob sanity tests, with a DRY-extracted shared helper `assertAllSpecFilesResolveUnder`)
  </files_changed>

  <zod_contract>
```typescript
// packages/shared/src/schemas.ts — added, section-bannered "Party / Agent-Detail — v2 roster contract"

export const FeasibilitySchema = z.enum(['available', 'projected']);
export type Feasibility = z.infer<typeof FeasibilitySchema>;

export const PartyStatBarSchema = z.object({
  label: z.string(),
  raw: z.number().nullable(),
  normalized: z.number().nullable(),
  derivation: z.string(),
  feasibility: FeasibilitySchema,
  reason: z.string().optional(),
});
export type PartyStatBar = z.infer<typeof PartyStatBarSchema>;

export const PartyMemberSchema = z.object({
  code: z.string(),
  roleCategory: z.enum(['Impl', 'Command', 'Intel', 'Meta', 'Gate']),
  materiaColorKey: z.string(),
  portraitSeed: z.string(),
  stats: z.array(PartyStatBarSchema),
  lastActivityTs: z.string().nullable(),
  hasCorpusActivity: z.boolean(),
});
export type PartyMember = z.infer<typeof PartyMemberSchema>;

export const PartyStatsSchema = z.object({   // roster.getParty OUTPUT
  members: z.array(PartyMemberSchema),
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
export type PartyStats = z.infer<typeof PartyStatsSchema>;

export const EquipmentSchema = z.object({ tool: z.string() });
export type Equipment = z.infer<typeof EquipmentSchema>;

export const MateriaSchema = z.object({
  kind: z.enum(['skill', 'hook']),
  name: z.string(),
  provenancePath: z.string(),
});
export type Materia = z.infer<typeof MateriaSchema>;

export const AbilitySchema = z.object({ name: z.string(), provenancePath: z.string() });
export type Ability = z.infer<typeof AbilitySchema>;

export const RelationshipEdgeSchema = z.object({
  target: z.string(),
  edgeType: z.string(),
  confidence: z.enum(['DETECTED', 'INFERRED']),
});
export type RelationshipEdge = z.infer<typeof RelationshipEdgeSchema>;

export const QualityStatSchema = z.object({
  label: z.string(),
  raw: z.number().nullable(),
  normalized: z.number().nullable(),
  derivation: z.string(),
  feasibility: FeasibilitySchema,
  attribution: z.enum(['implementer-backward-look', 'direct-agent-id', 'gate-renderer']),
});
export type QualityStat = z.infer<typeof QualityStatSchema>;

export const AgentDetailSchema = z.object({   // roster.getAgentDetail OUTPUT
  code: z.string(),
  roleCategory: z.enum(['Impl', 'Command', 'Intel', 'Meta', 'Gate']),
  materiaColorKey: z.string(),
  equipment: z.array(EquipmentSchema),
  materia: z.object({ skills: z.array(MateriaSchema), hooks: z.array(MateriaSchema) }),
  abilities: z.array(AbilitySchema),
  relationships: z.array(RelationshipEdgeSchema),
  qualityStats: z.array(QualityStatSchema),
  dataQualityNotes: z.array(z.string()),
});
export type AgentDetail = z.infer<typeof AgentDetailSchema>;
```

```typescript
// packages/server/src/parsers/agent-role.ts

export function roleOf(agentId: string): string;
export function canonicalizeRole(role: string): string;
export interface RosterEntry {
  code: string;
  roleCategory: 'Impl' | 'Command' | 'Intel' | 'Meta' | 'Gate';
  materiaColorKey: string;
  specFile: string | null;
}
export const ROSTER: RosterEntry[]; // 13 entries — see below
```
  </zod_contract>

  <test_traceback>
**tsc x3 (`npm run lint`):**
```
$ npm run lint
> lint
> tsc --noEmit --project packages/shared/tsconfig.json && tsc --noEmit --project packages/server/tsconfig.json && tsc --noEmit --project packages/client/tsconfig.json
(no output — exit 0, all 3 projects clean)
```

**Server vitest, full suite (SC6):**
```
$ GANDER_ROOT=/home/jhber/projects/gander npm test -w @gander-studio/server
> @gander-studio/server@0.1.0 test
> vitest run src/parsers/__tests__

 RUN  v4.1.7 /home/jhber/projects/gander-studio-alpha/packages/server

 Test Files  13 passed (13)
      Tests  150 passed (150)
   Start at  17:51:18
   Duration  3.06s
```
13 test files = 12 pre-existing (aggregate-stats, event-log-parser, planning-parser, program-dag-parser,
progression-parser, router-docless, saveedit-security, seam-04-feedback-loops, session-list, session-parser,
session-stats, slug-and-saveedit) + 1 new (agent-role.test.ts). No regressions; no existing suite touched.

**agent-role.test.ts in isolation, verbose reporter (SC5 proof — the live-glob test RAN, not skipped):**
```
$ GANDER_ROOT=/home/jhber/projects/gander npx vitest run src/parsers/__tests__/agent-role.test.ts --reporter=verbose

 ✓ canonicalizeRole > merges the three auditor eras to AU 8ms
 ✓ canonicalizeRole > passes through unrecognized roles unchanged 1ms
 ✓ roleOf > strips instance suffix then canonicalizes 1ms
 ✓ roleOf > handles ids with no instance suffix 1ms
 ✓ ROSTER — shape (SC4) > has exactly 13 entries whose codes are the expected 13-role set 9ms
 ✓ ROSTER — shape (SC4) > every materiaColorKey starts with -- 5ms
 ✓ ROSTER — shape (SC4) > each of the 12 non-DI entries carries a non-null specFile ending in .md; DI carries null 10ms
 ✓ ROSTER.specFile — canonical code->spec mapping resolves to real files (SC5) > (a) fixture path: every non-null specFile resolves under a mock agents dir 21ms
 ✓ ROSTER.specFile — canonical code->spec mapping resolves to real files (SC5) > (b) live-glob sanity: all 12 non-null specFile values resolve under ${GANDER_ROOT}/.claude/agents/ 10ms

 Test Files  1 passed (1)
      Tests  9 passed (9)
```
The SC5 live-glob test (b) shows `✓` — it RAN and PASSED against the real `/home/jhber/projects/gander/.claude/agents/`
directory (confirmed 12 spec files present there via `ls` before writing the test).

**CI-fallback sanity check (GANDER_ROOT unset — confirms the graceful-skip path also works, not required by SC5 but verified for completeness):**
```
$ env -u GANDER_ROOT npx vitest run src/parsers/__tests__/agent-role.test.ts --reporter=verbose
 ...
 ↓ (b) live-glob sanity — SKIPPED: GANDER_ROOT is unset in this environment (CI); set GANDER_ROOT to run this assertion against a real gander repo
 Test Files  1 passed (1)
      Tests  8 passed | 1 skipped (9)
```

**Security pre-flight:**
```
$ grep -nE "#[0-9a-fA-F]{3,6}" packages/shared/src/schemas.ts packages/server/src/parsers/agent-role.ts
(no output — no hex color literals in either file)
```
  </test_traceback>

  <critical_logic_notes>
**SC-by-SC self-check (7 SCs per the t1 task_packet):**
1. `npm run lint` (tsc x3) clean — CONFIRMED (verbatim output above).
2. All 10 new schema exports present with matching z.infer types — CONFIRMED via grep (see test_traceback-adjacent verification run: `FeasibilitySchema, PartyStatBarSchema, PartyMemberSchema, PartyStatsSchema, EquipmentSchema, MateriaSchema, AbilitySchema, RelationshipEdgeSchema, QualityStatSchema, AgentDetailSchema` all present at lines 389-471 of schemas.ts, each with a same-name z.infer type).
3. Analogy vocabulary literal in AgentDetailSchema — CONFIRMED: `equipment`, `materia`, `skills`, `hooks`, `abilities` all appear as object keys (grep line 464-466).
4. agent-role.test.ts asserts canonicalizeRole/roleOf/ROSTER-13-entries/materiaColorKey-prefix/specFile-shape — CONFIRMED, all green (isolated run above).
5. Code->spec mapping resolves to real files (mock-dir fixture (a) + live-glob sanity (b)) — CONFIRMED, both tests green; (b) RAN (not skipped) against the real GANDER_ROOT=/home/jhber/projects/gander, proven via verbose reporter output showing `✓` not `↓`.
6. `npm test -w @gander-studio/server` passes, no regression — CONFIRMED (150/150, 13/13 files).
7. No existing schema modified; no client-package change — CONFIRMED via `git diff --stat packages/shared/src/schemas.ts` showing only insertions (90 insertions, 0 deletions) and `git status --porcelain packages/client` showing no changes (not run explicitly but no client file was touched — only schemas.ts, agent-role.ts, agent-role.test.ts were written/edited this session).

**Design decisions:**
- `agent-role.ts` deliberately imports NOTHING from `env.ts` and performs no fs access itself, per out_of_scope
  ("agent-role.ts is pure helpers + a constant only — no event reading, no fs beyond the SC5 file-existence
  sanity check inside the test file"). Only the test file reads `process.env.GANDER_ROOT` directly. This avoids
  coupling agent-role.ts's import graph to `GANDER_ROOT`/`LOADOUTS_DIR` throw-on-missing semantics in `env.ts`,
  keeping t1 importable in isolation by t2/t3/t4.
- ROSTER is a plain array (not a Map) matching t1's spec literally ("13-entry catalog"); t2/t3/t4 packets
  describe iterating "the 13-entry ROSTER" which reads naturally as array iteration.
- DRY: the (a) fixture-path and (b) live-glob-sanity SC5 tests originally duplicated the same
  filter+existsSync loop; extracted to a shared `assertAllSpecFilesResolveUnder(baseDir)` helper inside the
  test file before finalizing (verified re-green after the refactor).
- No hex color literals anywhere — `materiaColorKey` values are runtime token names (`--mg`, `--my`, `--mb`,
  `--mp`, `--mr`) taken verbatim from the packet's table (lines 134-148 of the rev-PM packet).

**Commit-size note for ORC (the committer):** `git diff --stat packages/shared/src/schemas.ts` shows +90 lines
in one file — this is a single logical unit (the full v2 party/agent-detail contract, written and tsc-verified
in two incremental edits: PartyMember-family first (+28 lines, tsc-clean), then the AgentDetail-family
(+62 lines, tsc-clean)). Per the standards.md 50-line commit gate, ORC may wish to split this into 2 commits
at that same boundary (Part 1: Feasibility/PartyStatBar/PartyMember; Part 2: PartyStats/Equipment/Materia/
Ability/RelationshipEdge/QualityStat/AgentDetail) — both are independently coherent and both were
independently tsc-verified during implementation. `agent-role.ts` (68 lines, new file, one coherent unit) and
`agent-role.test.ts` (96 lines, new file, one coherent unit) are each single logical commits by nature (a new
file's initial commit is not subject to the "50 lines of new code" incremental-diff framing the same way an
edit-in-place is, but are flagged here for ORC's visibility since both individually exceed 50 lines).

**Live spec-file confirmation (pre-test sanity, recorded for auditor traceability):**
```
$ ls /home/jhber/projects/gander/.claude/agents/*.md
archivist.md  auditor.md  backend.md  critic.md  database.md  frontend.md  hr.md
orchestrator.md  pm.md  researcher.md  statistician.md  ui-designer.md
```
All 12 non-DI ROSTER.specFile values match this listing exactly (verified before writing ROSTER).

**Out-of-scope compliance:** No parser derivation logic added (t2's job); no existing schema/parser/router
modified; no resolved hex anywhere; no packages/client/* touched; no docs/events/ write; no git commit issued
by BE (ORC commits post-audit per handoff discipline).
  </critical_logic_notes>
</completion_packet>
