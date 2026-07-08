# PM Task Decomposition — prog-studio-v2-2026-07-s1-data-layer (REV1)

**Author:** PM#0 · **Date:** 2026-07-07 · **Program:** prog-studio-v2-2026-07 (tier 0)
**Revision:** round 1 — applying CR#1 CRITIQUE_BLOCK recipes verbatim. Structure/agents/dependency-order UNCHANGED (4 backend-engineer packets, serial t1→t2→t3→t4, GATE-DEVSERVER close-blocking).
**Primary intake:** `docs/programs/prog-studio-v2-2026-07/sprints/prog-studio-v2-2026-07-s1-data-layer/orchestrator_brief.md`
**Reads used (rev1):** 2/4 (original PM decomposition `…-PM-1783465967.md` + CR#1 critique `…-CR-1783466797.md`) — recipes are self-contained; no fresh source reads needed.

**Change-log (rev1):**
- (FIX 1a) t1 ROSTER extended with a per-code `specFile` field — the canonical code→spec mapping — for the 12 spec-backed codes; DI carries `specFile: null`. +1 new t1 SC asserting every non-null `specFile` resolves to a real file (mock-dir fixture + live-glob sanity). SC5→SC6, SC6→SC7 renumbered.
- (FIX 1b) t4 "do NOT assume a hardcoded name map" clause DELETED; code→spec resolution now CONSUMES t1's `ROSTER.specFile`.
- (FIX 1c) +1 new t4 SC asserting `getAgentDetail` returns NON-EMPTY `equipment` AND NON-EMPTY `materia` for at least one real spec-backed agent (FE/AU) against live GANDER_ROOT, with DI's empty-lists+note path distinguishable from a parse failure. t4 SCs renumbered (7→8).
- (FIX 2) routing_notes G5 resolution #1 now cites `program.md §5 "Seam-interpretation notes" note 1` as the PRIMARY authority for the getParty envelope shape (session.list precedent demoted to corroboration).
- (FIX 3) t4 abilities description/SC now cite `program.md §5 note 2`: `abilities:[]` + dataQualityNote is CONTRACTED behavior, not under-delivery. risk_flags records that a durable workflow-usage ledger is a future schema extension to be logged in deferred-work at sprint close.
- (audit-risk-forecast #2 hardening) t2 attribution-flip fixture strengthened to include a same-role multi-instance family (FE#1 + FE#2 → FE) proving instance-suffix stripping end-to-end through the flip.

---

## Recurring-Pattern Preflight (Step 0.5)

Sourced from the brief's `pm_preflight_checklist` pre-extraction (budget mechanism — two of the three named
post-mortems, `gander-ios-pipeline-p1.md` / `gander-meta-ratified-apply-p1.md`, are NOT in this project's
`docs/after-actions/`; they live in the gander repo. `gander-studio-p11-v2-vision.md` §6 confirmed on disk).

<recurring_pattern source="gander-studio-p11-v2-vision.md §6 + pm_preflight">OVERSCOPED — cap ≤2 independent source files per domain per packet; split otherwise.</recurring_pattern>
  → Avoided: each of the 4 BE packets edits ≤2 source files (schemas.ts+agent-role.ts; event-log-parser.ts+party-stats.ts; party-roster.ts+router.ts; agent-detail.ts+router.ts). Test files are additive, not counted against the source cap.
<recurring_pattern source="pm_preflight">DRY — name the existing parser/schema each new derivation extends BEFORE proposing new files.</recurring_pattern>
  → Avoided: every packet names its base — event-log-parser.ts (additive diagnostic reader), session-slug-match.ts (sprintRoot/matchesSlug grouping reuse), session-stats.ts (feedback_loops forward-look precedent for the backward-look flip), aggregate-stats.ts (roll-up precedent), connectivity graph + agent/skill/hook parsers (agent-detail sources), session.list envelope (diagnostics-envelope precedent).
<recurring_pattern source="pm_preflight">subagentstop-complete-miss — every packet names its exact Output Path; ORC backfills at Step 3.7.</recurring_pattern>
  → Avoided: each packet carries an explicit `## Output Path` block pattern; ORC backfills any residual COMPLETE.
<recurring_pattern source="gander-studio-p11-v2-vision.md §6 G5">spec-internal inconsistency — a packet whose SCs reference two sections of one contract doc must declare which section is canonical on conflict.</recurring_pattern>
  → Addressed: two G5 conflicts identified and resolved in routing_notes (party envelope shape; tokens/cost placeholder vs. "no cost bar"). Canonical section declared for each; rev1 upgrades the envelope authority to the ORC-recorded program.md §5 note.
<recurring_pattern source="CR#1 BLOCKER (this sprint)">silent-under-delivery dressed as graceful-fallback — a "code has no spec → empty lists + note" path that fires for ALL codes because no disk field links a role code to a spec.</recurring_pattern>
  → Resolved (FIX 1): the code→spec mapping is now the t1 `ROSTER.specFile` canonical static catalog (not disk-inferred). t4 SC3 (rev1) asserts NON-EMPTY materia+equipment for a real agent, so an all-empty result FAILS rather than passing as "graceful." DI's null-specFile path remains the ONE legitimate empty-with-note case.

**Acknowledgements (acknowledgement_required: true):** OVERSCOPED, DRY, subagentstop-complete-miss, G5 spec-internal-inconsistency, and the CR#1 silent-under-delivery class all acknowledged and each addressed above. sc-precheck **delegated to ORC** (constraint 8 — PM has no Bash); ORC re-runs it on THIS revised file before CR#2.

---

<task_decomposition task_id="prog-studio-v2-2026-07-s1-data-layer" agent_count="4">

<task_packets>

<task_packet>
  <task_id>prog-studio-v2-2026-07-s1-data-layer-t1</task_id>
  <assigned_to>backend-engineer</assigned_to>
  <priority>BLOCKER</priority>
  <description>
FOUNDATION — Zod contract schemas + role utilities that every downstream packet imports. Two source files.

**File 1 — `packages/shared/src/schemas.ts` (ADD schemas; do not modify any existing schema):**
Add the v2 party/agent-detail contract schemas. Follow the file's existing conventions exactly (`<Entity>Schema`
naming, `export const`, `z.infer` type exports, section comment banner). The analogy vocabulary is BINDING and
must appear in the FIELD NAMES exactly: `equipment` = tools, `materia: { skills, hooks }`, `abilities` = workflows.

Required schemas (shapes are the seam contract — field names are binding):
```
export const FeasibilitySchema = z.enum(['available', 'projected']);

export const PartyStatBarSchema = z.object({
  label: z.string(),               // "Activity" | "Stamina" | "Accuracy"
  raw: z.number().nullable(),      // underlying value (spawn count, rate fraction) or null when N/A
  normalized: z.number().nullable(),// 0–100, or null when N/A
  derivation: z.string(),          // derivation id, e.g. 'activity-spawns-normalized'
  feasibility: FeasibilitySchema,
  reason: z.string().optional(),   // populated when normalized is null (the N/A reason)
});

export const PartyMemberSchema = z.object({
  code: z.string(),                                             // canonical role code, e.g. 'FE'
  roleCategory: z.enum(['Impl','Command','Intel','Meta','Gate']),
  materiaColorKey: z.string(),                                  // RUNTIME token NAME, e.g. '--mg' (never a hex)
  portraitSeed: z.string(),                                     // deterministic, asset-free seed
  stats: z.array(PartyStatBarSchema),
  lastActivityTs: z.string().nullable(),                        // ISO ts of most-recent event; null if none
  hasCorpusActivity: z.boolean(),                               // false for DI etc. — surfaced, never hidden
});

export const PartyStatsSchema = z.object({                      // roster.getParty OUTPUT (envelope)
  members: z.array(PartyMemberSchema),                          // sorted by activity recency (desc)
  diagnostics: z.object({
    totalRawLines: z.number(),
    validEntries: z.number(),
    invalidLineCount: z.number(),                               // schema-invalid lines COUNTED, not dropped
    invalidLineSamples: z.array(z.string()),                    // truncated samples for observability
    distinctEventTypes: z.number(),                             // §2.3 coverage
    uncountedEventTypes: z.number(),                            // ev types no parser counts
  }),
  activityAnchor: z.number(),                                   // live max-spawns anchor (MEASURED at runtime)
});

export const EquipmentSchema = z.object({ tool: z.string() }); // tools have no file provenance
export const MateriaSchema = z.object({
  kind: z.enum(['skill','hook']),
  name: z.string(),
  provenancePath: z.string(),                                   // filePath under GANDER_ROOT
});
export const AbilitySchema = z.object({
  name: z.string(),
  provenancePath: z.string(),
});
export const RelationshipEdgeSchema = z.object({
  target: z.string(),
  edgeType: z.string(),
  confidence: z.enum(['DETECTED','INFERRED']),
});
export const QualityStatSchema = z.object({
  label: z.string(),
  raw: z.number().nullable(),
  normalized: z.number().nullable(),
  derivation: z.string(),
  feasibility: FeasibilitySchema,
  attribution: z.enum(['implementer-backward-look','direct-agent-id','gate-renderer']),
});
export const AgentDetailSchema = z.object({                     // roster.getAgentDetail OUTPUT
  code: z.string(),
  roleCategory: z.enum(['Impl','Command','Intel','Meta','Gate']),
  materiaColorKey: z.string(),
  equipment: z.array(EquipmentSchema),                          // tools
  materia: z.object({ skills: z.array(MateriaSchema), hooks: z.array(MateriaSchema) }),
  abilities: z.array(AbilitySchema),                            // workflows
  relationships: z.array(RelationshipEdgeSchema),               // connectivity subset
  qualityStats: z.array(QualityStatSchema),
  dataQualityNotes: z.array(z.string()),                        // surfaced gaps (silent-empty forbidden)
});
```
Add `export type X = z.infer<typeof XSchema>` for each new schema, matching the file's existing pattern.

**File 2 — `packages/server/src/parsers/agent-role.ts` (NEW):**
Three foundational, pure exports used by t2/t3/t4:
- `export function roleOf(agentId: string): string` — strip the `#…` suffix (`'FE#rem1'`→`'FE'`, `'AUDITOR#1'`→`'AUDITOR'`), then canonicalize.
- `export function canonicalizeRole(role: string): string` — merge the three auditor eras: `AUDITOR`→`AU`, `AUD`→`AU`, `AU`→`AU` (data-quality flag, inventory §4). All other roles pass through unchanged.
- `export const ROSTER` — the canonical 13-role catalog AND the **canonical code→spec mapping** (static; DI has zero corpus so it CANNOT be derived from data — embedded verbatim below). Each entry: `{ code, roleCategory, materiaColorKey, specFile }` where `specFile: string | null` is the agent-spec filename under `${GANDER_ROOT}/.claude/agents/` (null for DI):
```
code  roleCategory  materiaColorKey  specFile
BE    Impl          --mg             backend.md
FE    Impl          --mg             frontend.md
DS    Impl          --mg             database.md
PM    Command       --my             pm.md
ORC   Command       --my             orchestrator.md
RA    Intel         --mb             researcher.md
ST    Intel         --mb             statistician.md
AR    Intel         --mb             archivist.md
UI    Meta          --mp             ui-designer.md
DI    Meta          --mp             null
HR    Meta          --mp             hr.md
CR    Gate          --mr             critic.md
AU    Gate          --mr             auditor.md
```
**MAINTENANCE NOTE (embed as a code comment above ROSTER):** "ROSTER is the single canonical code→spec mapping.
The event log uses 2-letter codes (`FE#1`) that appear NOWHERE in the agent specs or the connectivity graph (which
key by spec FILE PATH), and initials-derivation is unreliable (`code-auditor`→AU, `critic`→CR, `researcher`→RA,
`ui-designer`→UI, `orchestrator`→ORC all fail). Therefore the mapping is maintained HERE, verbatim. When a new agent
is added to the team, extend ROSTER with its `{code, roleCategory, materiaColorKey, specFile}` row." `specFile` is the
filename that matches `parseAllAgents(...).filePath` basenames AND connectivity edge `source` path basenames.
(Materia-color mapping authority: v2-design-spec.md `<tokens>` + `<sample_data_appendix>` + DESIGN.md Role/Materia
Colors. `materiaColorKey` is the RUNTIME token NAME string — never a resolved hex.)

**File 3 — `packages/server/src/parsers/__tests__/agent-role.test.ts` (NEW, test):** unit tests for `roleOf`, `canonicalizeRole`, `ROSTER` completeness, AND the code→spec mapping resolution (see SC4/SC5).
  </description>
  <success_criteria>
1. `npm run lint` (tsc --noEmit ×3) is clean with all new schemas + agent-role.ts present.
2. All 10 new schema exports present in schemas.ts (grep confirms each `export const` name: FeasibilitySchema, PartyStatBarSchema, PartyMemberSchema, PartyStatsSchema, EquipmentSchema, MateriaSchema, AbilitySchema, RelationshipEdgeSchema, QualityStatSchema, AgentDetailSchema) each with a matching `z.infer` type export.
3. Analogy vocabulary present in AgentDetailSchema field names — grep confirms literal `equipment`, `materia`, `skills`, `hooks`, `abilities` as object keys.
4. `packages/server/src/parsers/__tests__/agent-role.test.ts` asserts (deterministic, not corpus-derived): `canonicalizeRole('AUDITOR')==='AU'`, `canonicalizeRole('AUD')==='AU'`, `roleOf('AUDITOR#1')==='AU'`, `roleOf('FE#rem1')==='FE'`; `ROSTER` has exactly 13 entries whose codes are the set {BE,FE,DS,PM,ORC,RA,ST,AR,UI,DI,HR,CR,AU}; every ROSTER `materiaColorKey` starts with `--`; **each of the 12 non-DI ROSTER entries carries a non-null `specFile` string ending in `.md`, and DI's `specFile` is `null`.**
5. **Code→spec mapping resolves to real files (FIX 1a):** `agent-role.test.ts` asserts, for every ROSTER entry with a non-null `specFile`, that `specFile` resolves to an existing agent-spec file — **(a) fixture path:** verified against a mock agents dir the test creates/points at containing the 12 spec filenames (`${mockDir}/${specFile}` exists for each of the 12); **(b) live-glob sanity path:** a test asserting all 12 non-null `specFile` values resolve to real files under `${GANDER_ROOT}/.claude/agents/` (skips gracefully with an explicit `test.skip` reason if GANDER_ROOT is unset in CI, but must PASS in the local env where GANDER_ROOT points at the real gander repo). DI's `null` `specFile` triggers NO lookup. This ROSTER table is the canonical code→spec mapping that t4 consumes — no disk-inference.
6. `npm test -w @gander-studio/server` passes (new suite green; no existing suite regressed).
7. No existing schema in schemas.ts modified (additive only); no client-package change.
  </success_criteria>
  <context_files>
packages/shared/src/schemas.ts (existing conventions — read the whole file for naming/section style)
docs/v2-vision/v2-design-spec.md (<tokens> + <sample_data_appendix> — materia mapping + roster)
docs/v2-vision/session-data-inventory.md §4 (auditor 3-prefix flag; DI zero-corpus flag)
docs/programs/prog-studio-v2-2026-07/sprints/prog-studio-v2-2026-07-s1-data-layer/orchestrator_brief.md (Seams; Invariants)
${GANDER_ROOT}/.claude/agents/ (live-glob sanity target for SC5 — the 12 real spec filenames the ROSTER.specFile column must match)
  </context_files>
  <dependencies>NONE</dependencies>
  <out_of_scope>
- Do NOT write any parser derivation logic here (t2 owns event derivations; t3/t4 own assembly). agent-role.ts is pure helpers + a constant only — no event reading, no fs beyond the SC5 file-existence sanity check inside the test file (not in agent-role.ts itself).
- Do NOT modify any existing schema, parser, or router file other than adding to schemas.ts.
- Do NOT put a resolved hex value anywhere; materiaColorKey carries token NAMES.
- Do NOT touch packages/client/*.
  </out_of_scope>
  <output_expected>
    <tag>completion_packet</tag>
    <must_contain>
      <item>All 10 Zod schemas + z.infer types added to schemas.ts</item>
      <item>agent-role.ts with roleOf, canonicalizeRole, ROSTER (13 entries; each entry carries specFile — 12 non-null + DI null) + the canonical-mapping maintenance comment</item>
      <item>agent-role.test.ts green, including the code→spec mapping-resolves-to-file assertions (mock-dir fixture + live-glob sanity)</item>
    </must_contain>
    <must_not_contain>
      <item>Any resolved hex color literal (e.g. #4caf7d) in schemas.ts or agent-role.ts</item>
      <item>Any modification to an existing schema or existing parser</item>
      <item>Any packages/client/* change</item>
    </must_not_contain>
    <success_signal>tsc ×3 clean; agent-role.test.ts green; 10 schema exports + 13-entry ROSTER (with specFile column) present; all 12 non-null specFile values resolve to real spec files.</success_signal>
  </output_expected>
</task_packet>

<task_packet>
  <task_id>prog-studio-v2-2026-07-s1-data-layer-t2</task_id>
  <assigned_to>backend-engineer</assigned_to>
  <priority>BLOCKER</priority>
  <description>
EVENT-DERIVED CORPUS STATS + DIAGNOSTIC READER — the compute layer for the party bars. Two source files.
DRY bases: `event-log-parser.ts` (extend additively), `session-slug-match.ts` (reuse `sprintRoot`/`matchesSlug`),
`session-stats.ts` (the `feedback_loops` FORWARD-look is the precedent; this packet builds its BACKWARD-look mirror),
`agent-role.ts` (t1 — `roleOf`/`canonicalizeRole`).

**File 1 — `packages/server/src/parsers/event-log-parser.ts` (ADD ONE new export; change nothing existing):**
Add `export async function readEventLogEntriesWithDiagnostics(eventsDir: string): Promise<{ entries: EventLogEntry[]; totalRawLines: number; validEntries: number; invalidLineCount: number; invalidLineSamples: string[] }>`.
It must count schema-invalid / malformed-JSON lines (the class `readEventLogEntries` currently drops via `console.warn`)
and RETURN that count + truncated samples — NEVER silently drop. `readEventLogEntries` and `parseEventLogFiles` MUST
remain byte-for-byte behaviorally unchanged (other callers depend on them).

**File 2 — `packages/server/src/parsers/party-stats.ts` (NEW):**
`export async function computePartyDerivations(eventsDirs: string[]): Promise<{ perRole: Map<string, RoleDerivation>; diagnostics: {...} }>` aggregating across ALL provided event dirs (multi-root: SESSIONS_SOURCE_DIRS). Derivations:
- **Attribution flip (§2.1) — first-pass audit rate, backward-look:** group events by task_id family using the SAME boundary-anchored `sprintRoot`/`matchesSlug` grouping already in `session-slug-match.ts` (DRY — do not invent a grouping rule). Within a group sorted by `ts`, track the most-recent SPAWN whose role (via `roleOf`) is NOT a gate role (`AU`/`CR`/`ORC` after canonicalization); attribute the next `AUDIT_PASS`/`AUDIT_FAIL` to that implementer role. A task's audit is "first-pass" if no `AUDIT_FAIL` preceded its eventual `AUDIT_PASS` in the same family. Per-role: `{ firstPassAudits, attributedAudits }`. This is the mirror of `session-stats.ts` feedback_loops (which looks FORWARD to the spawned agent); this looks BACKWARD to the audited implementer.
- **Ghost/stall rate (§2.2):** `count(GHOST_CONFIRMED)/count(SPAWN)` per role, using `GHOST_CONFIRMED`'s OWN `agent_id` (it is the stalled agent directly — no attribution heuristic). Per-role: `{ ghostCount, spawnCount }`.
- **Activity + recency inputs:** per role, `spawnCount` and `lastActivityTs` (max `ts`). Role rollups keyed by `canonicalizeRole(roleOf(agent_id))` (merges AUDITOR/AUD/AU — inventory §4).
- **Event-type coverage (§2.3):** `distinctEventTypes = |set(ev)|`; `uncountedEventTypes = distinct minus the 6 counted by session-stats.ts {SPAWN,COMPLETE,CRITIQUE_PASS,CRITIQUE_BLOCK,AUDIT_PASS,AUDIT_FAIL}`.
- **Diagnostics:** fold in `readEventLogEntriesWithDiagnostics` counts (totalRawLines, validEntries, invalidLineCount, invalidLineSamples) + distinct/uncounted event types.

**Fixtures + tests (`__tests__/`):**
- NEW `__tests__/fixtures/agent-events-attribution-flip.jsonl` — SYNTHETIC, controlled (gate-id ≠ implementer-id). This fixture is a controlled unit-test input, NOT a corpus-representative sample (so it fixes exact expected outputs). **It MUST include a same-role multi-instance family** (e.g. `SPAWN FE#1` and `SPAWN FE#2` inside one task family, both canonicalizing to `FE`) so instance-suffix stripping (`roleOf`) is proven end-to-end THROUGH the flip, not only in isolation — this directly closes CR#1 audit-risk-forecast #2.
- NEW `__tests__/fixtures/agent-events-malformed-line.jsonl` — includes one invalid line whose SHAPE matches the real HCG_RESOLVED defect (has `resolved_by`, LACKS `agent_id`). **You MUST first open `docs/events/agent-events-2026-03-28.jsonl` (seq 7, verified present on disk 2026-07-07) and confirm that line lacks `agent_id` and carries `resolved_by`; record in your completion packet which real line you sampled and that the fixture's invalid shape matches it.**
- NEW `__tests__/party-stats.test.ts` + additions to `__tests__/event-log-parser.test.ts` (additive) covering: attribution-flip correctness (exact first-pass attribution on the synthetic fixture where a fail precedes a pass, vs a clean first-pass; PLUS the same-role multi-instance family rolling to one role), ghost-rate per role, event-type coverage counts on the fixture, and invalid-line surfacing (assert `invalidLineCount === 1` on the malformed fixture; assert it is COUNTED not dropped).
  </description>
  <success_criteria>
1. `npm run lint` (tsc ×3) clean.
2. Attribution flip fixture-tested (constraint 4, SC2): on `agent-events-attribution-flip.jsonl` (gate-id ≠ implementer-id), the test asserts EXACT per-role first-pass attribution — e.g. `[SPAWN FE#1, AUDIT_PASS AUDITOR#1]` → FE 1/1 first-pass; `[SPAWN BE#1, AUDIT_FAIL AUDITOR#1, SPAWN BE#1, AUDIT_PASS AUDITOR#1]` → BE 0/1 first-pass. **Additionally asserts a same-role multi-instance family (`FE#1` + `FE#2` in one family) both roll to `FE` (instance-suffix stripping proven through the flip — CR#1 forecast #2).** Values are fixture-derived (deterministic), NOT corpus-locked.
3. Silent-empty class forbidden (constraint 5, SC3): `readEventLogEntriesWithDiagnostics` returns `invalidLineCount` and `invalidLineSamples`; test asserts a malformed missing-`agent_id` line is COUNTED (===1 on the malformed fixture), never dropped.
4. **Corpus-provenance (AUDITOR-executed, path 2):** the completion packet records that `docs/events/agent-events-2026-03-28.jsonl` seq 7 was opened and that `agent-events-malformed-line.jsonl`'s invalid shape (resolved_by present, agent_id absent) matches it; the auditor confirms the fixture shape against the sampled real line.
5. Ghost/stall + event-type coverage (§2.2/§2.3) implemented and unit-tested on fixtures (deterministic assertions).
6. `readEventLogEntries` and `parseEventLogFiles` behavior UNCHANGED — the pre-existing `event-log-parser.test.ts`, `session-stats.test.ts`, `seam-04-feedback-loops.test.ts`, `aggregate-stats.test.ts` suites all still pass.
7. `npm test -w @gander-studio/server` fully green.
8. NO corpus-derived value is hardcoded/locked in any assertion (constraint 7) — live-corpus behavior is asserted structurally only; exact numbers appear only against synthetic fixtures.
  </success_criteria>
  <context_files>
packages/server/src/parsers/event-log-parser.ts (base — extend additively)
packages/server/src/parsers/session-stats.ts (feedback_loops backward/forward precedent; the 6 counted ev)
packages/server/src/session-slug-match.ts (sprintRoot/matchesSlug grouping — reuse; open to confirm signatures)
packages/server/src/parsers/agent-role.ts (t1 — roleOf, canonicalizeRole)
packages/shared/src/schemas.ts (EventLogEntry type; t1 diagnostics shape)
docs/v2-vision/session-data-inventory.md §2.1, §2.2, §2.3, §4 (derivation contracts + auditor-prefix + malformed-line flags)
docs/events/agent-events-2026-03-28.jsonl (open seq 7 ONLY — malformed-line shape provenance)
  </context_files>
  <dependencies>prog-studio-v2-2026-07-s1-data-layer-t1</dependencies>
  <out_of_scope>
- Do NOT change `readEventLogEntries` / `parseEventLogFiles` signatures or behavior — additive new export only.
- Do NOT normalize to 0–100, assemble PartyMember records, sort, or add a router procedure (t3 owns assembly + roster.getParty).
- Do NOT lock corpus-wide counts (e.g. "29 distinct ev", "9/9 BE first-pass", "18 unattributed") in any assertion — those drift; use only synthetic-fixture-derived exacts + structural live checks.
- Do NOT touch packages/client/*; do NOT modify DESIGN.md/docs surfaces beyond the two new test fixtures.
  </out_of_scope>
  <output_expected>
    <tag>completion_packet</tag>
    <must_contain>
      <item>readEventLogEntriesWithDiagnostics (new export) returning invalidLineCount + samples</item>
      <item>computePartyDerivations with attribution-flip (backward-look), ghost-rate, event-type-coverage, role canonicalization</item>
      <item>Synthetic attribution-flip fixture (incl. same-role multi-instance family) + malformed-line fixture (real-line-shape provenance recorded)</item>
      <item>Green party-stats.test.ts + regression-green pre-existing suites</item>
    </must_contain>
    <must_not_contain>
      <item>Any hardcoded corpus-wide count in a test assertion</item>
      <item>Any signature/behavior change to readEventLogEntries or parseEventLogFiles</item>
      <item>Any 0–100 normalization or router procedure (t3's job)</item>
    </must_not_contain>
    <success_signal>tsc ×3 clean; new + regression suites green; attribution-flip (incl. multi-instance same-role) and invalid-line surfacing proven on fixtures.</success_signal>
  </output_expected>
</task_packet>

<task_packet>
  <task_id>prog-studio-v2-2026-07-s1-data-layer-t3</task_id>
  <assigned_to>backend-engineer</assigned_to>
  <priority>HIGH</priority>
  <description>
PARTY ROSTER ASSEMBLY + `roster.getParty` PROCEDURE + tokens/cost PROJECTED placeholder. Two source files.
DRY bases: t1 `ROSTER`/schemas, t2 `computePartyDerivations`, `aggregate-stats.ts` roll-up precedent, `session.list`
envelope precedent (`{ sessions, skipped }`) for the diagnostics envelope. Envelope shape is authorized by
`program.md §5 "Seam-interpretation notes" note 1` (ORC-recorded) — see routing_notes.

**File 1 — `packages/server/src/parsers/party-roster.ts` (NEW):**
`export async function assembleParty(eventsDirs: string[]): Promise<PartyStats>`:
- Call `computePartyDerivations(eventsDirs)` (t2).
- Iterate the 13-entry `ROSTER` (t1). For each role build a `PartyMember`:
  - `code`, `roleCategory`, `materiaColorKey` from ROSTER; `portraitSeed = code` (deterministic, asset-free).
  - `hasCorpusActivity` = whether the role has any observed events (false for DI etc. — surfaced, NOT hidden).
  - `lastActivityTs` = role's max event ts, or null.
  - `stats` = three PartyStatBars, all `feasibility: 'available'`:
    - **Activity**: `raw = spawnCount`; `normalized = round(spawnCount / activityAnchor * 100)`; `derivation:'activity-spawns-normalized'`. `activityAnchor` = the LIVE max spawnCount across the roster (MEASURED at runtime — never a hardcoded 46).
    - **Stamina**: `raw = ghostCount`; `normalized = round((1 − ghostCount/spawnCount) * 100)` when `spawnCount>0`, else `normalized=null, reason:'no spawns observed'`; `derivation:'stamina-inverse-ghost'`.
    - **Accuracy**: Impl roles (BE/FE/DS) only → `raw = firstPassAudits/attributedAudits` fraction (or null if attributedAudits==0), `normalized = round(rate*100)`, `derivation:'accuracy-firstpass'`. All non-Impl roles → `raw:null, normalized:null, reason:'not audit-gated'` (explicit N/A — never a misleading 0).
- Sort `members` by `lastActivityTs` DESCENDING (activity recency; null last). Return `PartyStats { members, diagnostics, activityAnchor }`.
- **Tokens/cost projected placeholder (constraint 3, SC5):** define, at this definition site, an exported constant
  `TOKENS_PROJECTED_PLACEHOLDER` of shape PartyStatBar with `feasibility:'projected'`, `raw:null`, `normalized:null`,
  `derivation:'tokens-projected'`, `reason:'needs schema extension'`, preceded by a code comment citing
  `DEFERRED-P9-1`. This placeholder is NOT populated into any PartyMember's `stats` array (the party card ships no
  MP/cost bar — see G5 resolution in routing_notes). It exists ONLY as the single projected placeholder.

**File 2 — `packages/server/src/router.ts` (ADD a new `rosterRouter` with `getParty` and register it):**
Add `const rosterRouter = t.router({ getParty: t.procedure.output(PartyStatsSchema).query(async () => assembleParty(SESSIONS_SOURCE_DIRS.map(d => path.join(d,'docs','events')))) })` and register `roster: rosterRouter` in `appRouter`. (t4 will re-read this file and ADD `getAgentDetail` to the SAME rosterRouter — serialized after this packet.)

**Tests (`__tests__/party-roster.test.ts`, NEW):** using a synthetic derivations input (or a small fixture eventsDir): assert normalization is computed from the LIVE max (the max-spawn role reads normalized=100; a half-max role reads ~50) — assert the RELATIONSHIP to the measured anchor, not a locked number; assert non-Impl Accuracy is null with reason 'not audit-gated'; assert `members.length===13`; assert members are sorted by lastActivityTs desc; assert DI has `hasCorpusActivity:false`.
  </description>
  <success_criteria>
1. `npm run lint` (tsc ×3) clean.
2. `roster.getParty` returns `PartyStats` whose `.members` is a 13-element `PartyMember[]` sorted by activity recency; each stat bar carries raw, normalized, derivation id, and feasibility (SC1). No hardcoded sample values — Activity normalization is derived from the live `activityAnchor` (test asserts the anchor RELATIONSHIP, not a locked number; constraint 7).
3. Tokens/cost projected placeholder (SC5): grep of `party-roster.ts` finds literal `DEFERRED-P9-1` (≥1) AND `feasibility: 'projected'` (≥1); a test asserts NO PartyMember stat carries a numeric tokens/cost value (the placeholder is never populated into `members[].stats`).
4. Non-Impl Accuracy renders explicit N/A (`normalized:null`, `reason:'not audit-gated'`) — never a bare 0 (silent-empty discipline); Stamina with 0 spawns → null+reason.
5. `diagnostics` (invalidLineCount, distinct/uncounted event types) is present on the envelope, threaded from t2 — surfaced, not dropped (SC3). Envelope shape authorized by program.md §5 note 1.
6. `npm test -w @gander-studio/server` green (new suite + all prior suites); no client-package change.
  </success_criteria>
  <context_files>
packages/server/src/parsers/party-stats.ts (t2 — computePartyDerivations)
packages/server/src/parsers/agent-role.ts (t1 — ROSTER)
packages/shared/src/schemas.ts (t1 — PartyStats/PartyMember/PartyStatBar)
packages/server/src/router.ts (add rosterRouter; env import of SESSIONS_SOURCE_DIRS already present)
packages/server/src/parsers/aggregate-stats.ts (roll-up precedent)
docs/v2-vision/v2-design-spec.md <sample_data_appendix> (Activity=spawns/max, Stamina=1−ghost/spawn, Accuracy=first-pass; Impl-only) — CANONICAL for the "no cost bar" decision (see G5)
docs/programs/prog-studio-v2-2026-07/program.md §5 (Seam-interpretation note 1 — getParty envelope authority)
docs/deferred-work.md (DEFERRED-P9-1 text)
  </context_files>
  <dependencies>prog-studio-v2-2026-07-s1-data-layer-t1, prog-studio-v2-2026-07-s1-data-layer-t2</dependencies>
  <out_of_scope>
- Do NOT add `getAgentDetail` (t4 owns it). Add ONLY `getParty` to the new rosterRouter.
- Do NOT populate the tokens placeholder into any PartyMember.stats; it is a reserved constant only (G5).
- Do NOT lock the activity anchor (46) or any corpus number in an assertion.
- Do NOT change the router count in CLAUDE.md or the router-count table (s4 owns doc updates).
- Do NOT touch packages/client/*.
  </out_of_scope>
  <output_expected>
    <tag>completion_packet</tag>
    <must_contain>
      <item>assembleParty producing 13 PartyMembers, recency-sorted, each stat raw+normalized+derivation+feasibility</item>
      <item>rosterRouter.getParty registered in appRouter, output PartyStatsSchema</item>
      <item>TOKENS_PROJECTED_PLACEHOLDER (feasibility 'projected', null value) with DEFERRED-P9-1 comment, NOT in members[].stats</item>
      <item>party-roster.test.ts green (anchor-relationship + N/A + sort assertions)</item>
    </must_contain>
    <must_not_contain>
      <item>Hardcoded 46 / any locked corpus number in code or assertions</item>
      <item>A tokens/cost bar populated into any PartyMember</item>
      <item>getAgentDetail (t4's job) or any CLAUDE.md/router-table edit</item>
    </must_not_contain>
    <success_signal>tsc ×3 clean; getParty returns 13 recency-sorted members with full stat metadata; DEFERRED-P9-1 projected placeholder present; suite green.</success_signal>
  </output_expected>
</task_packet>

<task_packet>
  <task_id>prog-studio-v2-2026-07-s1-data-layer-t4</task_id>
  <assigned_to>backend-engineer</assigned_to>
  <priority>HIGH</priority>
  <description>
AGENT-DETAIL ASSEMBLY + `roster.getAgentDetail(code)` PROCEDURE. Two edited source files.
DRY bases: t1 `ROSTER` (**canonical code→spec mapping via `ROSTER.specFile`**), agent-parser.ts (`parseAllAgents` → tools),
skill-parser.ts + hook-parser.ts (materia provenance), the static connectivity graph
(`${GANDER_ROOT}/docs/connectivity-graph.json` + `ConnectivityGraphSchema`) for the relationship subset AND for
resolving which skills/hooks an agent equips, and t2 `computePartyDerivations` for quality stats.
**Serialize after t3 on router.ts** (both add to the SAME rosterRouter — t4 re-reads router.ts fresh and appends).

**File 1 — `packages/server/src/parsers/agent-detail.ts` (NEW):**
`export async function assembleAgentDetail(code: string, ganderRoot: string, eventsDirs: string[]): Promise<AgentDetail>`:
- **Resolve code → agent spec via t1's `ROSTER.specFile` (the canonical code→spec mapping):** input `code` is a
  canonical ROSTER role code (per seam `getAgentDetail(code)`). Look up the ROSTER entry for `code`; its `specFile`
  field (e.g. `FE`→`frontend.md`, `AU`→`auditor.md`) is the canonical spec identifier. Resolve the spec by matching
  `specFile` against the `filePath` basename returned by `parseAllAgents(ganderRoot)` AND against connectivity edge
  `source` path basenames (`.claude/agents/{specFile}`). A ROSTER entry with `specFile: null` (DI — inventory §4:
  12 specs for 13 codes) returns the ROSTER metadata with empty equipment/materia and a `dataQualityNote`
  ("no agent spec on disk for code {code}") — surfaced, **distinguishable from a parse failure** (empty-because-no-spec,
  not empty-because-error), never a silent empty. (The prior "derive from disk / do NOT assume a hardcoded name map"
  instruction is REMOVED per CR#1 FIX 1b — the mapping now lives in ROSTER.)
- **equipment** = the agent spec's `tools` (AgentSchema.tools) → `{ tool }[]`.
- **materia** = `{ skills, hooks }`: read the connectivity graph; find edges where this agent's spec path is the source with
  edgeType `references_skill`/`invokes_skill` (skills) and `triggers_hook` (hooks); each `MateriaSchema` carries the
  target skill/hook node's `filePath` as `provenancePath`. (DRY: the connectivity graph is the wiring source; read it
  via `readFile` + `ConnectivityGraphSchema.safeParse` inline — a ~10-line read; do NOT refactor router.ts's inline reader this sprint.)
- **abilities** = workflows with provenance paths. Per base-plan portability, `.claude/agents/tasks/workflows/*` is
  throwaway scaffolding, not a durable per-agent source; the connectivity graph carries no `workflow` node type.
  **Per `program.md §5 "Seam-interpretation notes" note 2 (ORC-recorded), `abilities: []` + a surfaced
  `dataQualityNote` ("no durable per-agent workflow source on disk; abilities intentionally empty") is the CONTRACTED
  behavior for this sprint — not an under-delivery.** Return `abilities: []` with the note (a durable workflow-usage
  ledger is a future schema extension — see risk_flags / deferred-work at sprint close).
- **relationships** = connectivity edges where the agent's spec path is source or target with edgeType in {`spawns`,`communicates_with`} → `RelationshipEdge { target, edgeType, confidence }`.
- **qualityStats** (attribution-side declared) = reuse t2 `computePartyDerivations` for this role: first-pass rate
  → `QualityStat{ label:'First-pass audit rate', attribution:'implementer-backward-look', ... }`; ghost/stall rate
  → `attribution:'direct-agent-id'`. Non-Impl / gate roles declare `attribution:'gate-renderer'` where the flip does
  not apply, with null value + explicit note rather than a borrowed number.

**File 2 — `packages/server/src/router.ts` (re-read fresh; ADD `getAgentDetail` to the EXISTING rosterRouter t3 created):**
`getAgentDetail: t.procedure.input(z.object({ code: z.string() })).output(AgentDetailSchema).query(async ({ input }) => assembleAgentDetail(input.code, GANDER_ROOT, SESSIONS_SOURCE_DIRS.map(d => path.join(d,'docs','events'))))`.

**Tests (`__tests__/agent-detail.test.ts`, NEW):** two layers —
  (1) **Deterministic fixture layer:** a small synthetic connectivity-graph fixture + a synthetic agent spec (or a
      controlled temp dir) whose ROSTER-matched `specFile` yields NON-EMPTY equipment + materia — assert equipment maps
      from tools; materia.skills/hooks carry provenancePath; relationships include only spawns/communicates_with edges;
      qualityStats declare `attribution`; and a `specFile: null` code (DI) yields empty equipment/materia + a
      dataQualityNote (not a throw), distinguishable from an error.
  (2) **Live-corpus non-empty layer (FIX 1c):** against the live GANDER_ROOT, `assembleAgentDetail('FE'…)` (or `'AU'`)
      returns NON-EMPTY equipment AND NON-EMPTY materia (skills+hooks) — an all-empty result for a spec-backed code
      FAILS. (Skips with an explicit reason only if GANDER_ROOT is unset in CI; must PASS in the local env.)
  </description>
  <success_criteria>
1. `npm run lint` (tsc ×3) clean.
2. `roster.getAgentDetail(code)` returns `AgentDetail` with `equipment` (tools), `materia:{skills,hooks}` (each with a `provenancePath` readable under GANDER_ROOT), `abilities` (empty + surfaced note, contracted per program.md §5 note 2), and a `relationships` connectivity subset (SC4). Analogy field names exact. **Code→spec resolved via t1's `ROSTER.specFile` (NOT disk-inferred).**
3. **NON-EMPTY-for-a-real-agent + DI distinguishable (FIX 1c):** against the live GANDER_ROOT, `getAgentDetail('FE')` (or `'AU'`) returns NON-EMPTY `equipment` (tools) AND NON-EMPTY `materia` (skills+hooks) — an all-empty-for-a-spec-backed-code result FAILS (it is NOT "graceful"). AND `getAgentDetail('DI')` (specFile null) returns roster metadata + empty equipment/materia + a `dataQualityNote`, **distinguishable from a parse failure** (empty-because-no-spec, not empty-because-error).
4. Quality stats declare their attribution side: first-pass rate → `implementer-backward-look`; ghost rate → `direct-agent-id`; non-Impl/gate → `gate-renderer` with null value + note (constraint 2 / seam).
5. A code with no on-disk spec (DI) returns roster metadata + a `dataQualityNote`, never a throw and never a silent empty (silent-empty discipline) — the ONE legitimate empty case, per SC3's distinguishability.
6. Abilities: `abilities:[]` + a surfaced `dataQualityNote` is the CONTRACTED behavior per program.md §5 note 2 (not an under-delivery); never silently omitted, never fabricated.
7. router.ts re-read fresh and `getAgentDetail` appended to the SAME rosterRouter as t3's `getParty` — both procedures present under `roster`, t3's `getParty` untouched (no clobber).
8. `npm test -w @gander-studio/server` green (new suite + all prior); no client-package change.
  </success_criteria>
  <context_files>
packages/server/src/parsers/agent-parser.ts (parseAllAgents → tools + filePath basenames matched against ROSTER.specFile)
packages/server/src/parsers/skill-parser.ts, packages/server/src/parsers/hook-parser.ts (provenance filePaths)
packages/shared/src/schemas.ts (t1 AgentDetail/Equipment/Materia/Ability/RelationshipEdge/QualityStat; ConnectivityGraphSchema)
packages/server/src/parsers/agent-role.ts (t1 — ROSTER incl. specFile canonical code→spec mapping, roleOf)
packages/server/src/router.ts (re-read fresh; add getAgentDetail to rosterRouter; connectivity inline-read pattern lines ~685-723)
packages/server/src/parsers/party-stats.ts (t2 — quality-stat derivations)
docs/programs/prog-studio-v2-2026-07/program.md §5 (Seam-interpretation note 2 — abilities-empty is contracted)
docs/v2-vision/session-data-inventory.md §1 (connectivity edge types), §4 (DI no-spec flag)
  </context_files>
  <dependencies>prog-studio-v2-2026-07-s1-data-layer-t1, prog-studio-v2-2026-07-s1-data-layer-t2, prog-studio-v2-2026-07-s1-data-layer-t3</dependencies>
  <out_of_scope>
- Do NOT modify or remove t3's `getParty`; append `getAgentDetail` to the existing rosterRouter only (serialized append — re-read the file first).
- Do NOT refactor the router.ts inline connectivity reader into a shared helper this sprint (would be a 3rd file / OVERSCOPED); read the graph inline in agent-detail.ts.
- Do NOT re-derive the code→spec mapping from disk or add a second hardcoded map; consume t1's `ROSTER.specFile` only.
- Do NOT fabricate workflow ("ability") data — `abilities:[]` + surfaced note is the contracted behavior (program.md §5 note 2).
- Do NOT change the router-count table / CLAUDE.md (s4 owns docs); do NOT touch packages/client/*.
  </out_of_scope>
  <output_expected>
    <tag>completion_packet</tag>
    <must_contain>
      <item>assembleAgentDetail resolving code→spec via ROSTER.specFile; equipment/materia{skills,hooks}/abilities/relationships/qualityStats + dataQualityNotes</item>
      <item>Live-corpus test proving NON-EMPTY equipment+materia for a real agent (FE/AU); DI empty+note distinguishable from parse failure</item>
      <item>getAgentDetail appended to the existing rosterRouter (getParty preserved)</item>
      <item>attribution side declared per quality stat; abilities:[] + note per program.md §5 note 2</item>
      <item>agent-detail.test.ts green (fixture layer + live-corpus non-empty layer + no-spec-code graceful path)</item>
    </must_contain>
    <must_not_contain>
      <item>Removal/edit of getParty</item>
      <item>An all-empty equipment/materia result for a spec-backed code passing as "graceful"</item>
      <item>Re-derivation of the code→spec mapping from disk, or a second hardcoded name map</item>
      <item>Fabricated workflow/ability entries</item>
      <item>A new shared connectivity-reader file (keep to 2 edited source files)</item>
    </must_not_contain>
    <success_signal>tsc ×3 clean; roster has getParty + getAgentDetail; real agent (FE/AU) returns populated equipment+materia; DI empty+note distinguishable; suite green.</success_signal>
  </output_expected>
</task_packet>

</task_packets>

<dependency_order>
t1 (foundation: schemas + agent-role incl. ROSTER.specFile code→spec mapping)  →  t2 (event derivations + diagnostic reader)  →  t3 (party assembly + roster.getParty)  →  t4 (agent-detail + roster.getAgentDetail)
  - t2 depends on t1 (schemas + role util).
  - t3 depends on t1, t2 (derivations).
  - t4 depends on t1 (ROSTER.specFile mapping), t2 (quality-stat derivations), t3 (router.ts serialization — t4 re-reads + appends getAgentDetail).
  - Chain is serial by design (single BE owner; router.ts + schemas.ts single-writer discipline). Only t4↔t3 share router.ts; serialized.
GATE-RUN (ORC-executed, Bash — SC7):
  - GATE-DEVSERVER depends on t4 audit PASS. ORC starts the dev server (:3001) and confirms BOTH `roster.getParty` and `roster.getAgentDetail` respond (non-error). This is an execution-dependent deliverable (SC7 "procedures must respond on :3001") that a static audit cannot prove — close-blocking. PM has no Bash; ORC runs it.
</dependency_order>

<verbatim_deliverable_audit>
  <!-- Sibling brief's 7 sprint Success Criteria -->
  <phrase text="SC1 — roster.getParty live PartyMember[] for real 13-agent roster; each stat raw+0-100 normalized+derivation id+feasibility"><addressed task="prog-studio-v2-2026-07-s1-data-layer-t1"/><addressed task="prog-studio-v2-2026-07-s1-data-layer-t2"/><addressed task="prog-studio-v2-2026-07-s1-data-layer-t3"/></phrase>
  <phrase text="SC2 — per-implementer first-pass audit rate implements §2.1 attribution flip; fixture-tested where gate-id ≠ implementer-id"><addressed task="prog-studio-v2-2026-07-s1-data-layer-t2"/></phrase>
  <phrase text="SC3 — ghost/stall + event-type coverage (§2.2/§2.3 AVAILABLE-NOW); schema-invalid lines counted + surfaced, never dropped"><addressed task="prog-studio-v2-2026-07-s1-data-layer-t2"/><addressed task="prog-studio-v2-2026-07-s1-data-layer-t3"/></phrase>
  <phrase text="SC4 — roster.getAgentDetail(code): equipment(tools)/materia(skills+hooks)/abilities(workflows) w/ provenance + connectivity relationship subset"><addressed task="prog-studio-v2-2026-07-s1-data-layer-t1"/><addressed task="prog-studio-v2-2026-07-s1-data-layer-t4"/></phrase>
  <phrase text="SC5 — tokens/cost ONLY as projected placeholder, DEFERRED-P9-1 cited in code comment at definition site"><addressed task="prog-studio-v2-2026-07-s1-data-layer-t3"/></phrase>
  <phrase text="SC6 — npm run lint (tsc ×3) clean; server vitest green; no client-package changes"><addressed task="prog-studio-v2-2026-07-s1-data-layer-t1"/><addressed task="prog-studio-v2-2026-07-s1-data-layer-t2"/><addressed task="prog-studio-v2-2026-07-s1-data-layer-t3"/><addressed task="prog-studio-v2-2026-07-s1-data-layer-t4"/></phrase>
  <phrase text="SC7 — procedures must respond on dev server (:3001) for s2 env-preflight"><addressed task="GATE-DEVSERVER (ORC-executed close-blocking gate; see dependency_order)"/></phrase>
  <!-- code→spec mapping (CR#1 BLOCKER FIX 1) — now an explicit deliverable -->
  <phrase text="canonical code→spec mapping (ROSTER.specFile) so getAgentDetail is non-hollow"><addressed task="prog-studio-v2-2026-07-s1-data-layer-t1"/><addressed task="prog-studio-v2-2026-07-s1-data-layer-t4"/></phrase>
  <!-- human_request noun/verb phrases -->
  <phrase text="'this design looks great' / ratifying the p11 v2-vision design package"><addressed task="prog-studio-v2-2026-07-s1-data-layer-t1"/><addressed task="prog-studio-v2-2026-07-s1-data-layer-t3"/><addressed task="prog-studio-v2-2026-07-s1-data-layer-t4"/></phrase>
  <phrase text="'v2 implementation program … tier 0 … backend data layer'"><addressed task="prog-studio-v2-2026-07-s1-data-layer-t1"/></phrase>
  <phrase text="'push this sprint'"><deferred reason="Push is an ORC-level guarded auto-push action, permitted only post full-audit PASS + REQVAL COVERED + explicit per-sprint opt-in (standards.md Git Workflow). The human's 'push this sprint' IS that opt-in — recorded for ORC in routing_notes. Not a decomposable BE task; feature-branch only, never main."/></phrase>
  <phrase text="'let's keep it moving' (program continuation)"><out_of_scope reason="Program-continuation intent spanning s2–s4; not part of this tier-0 data-layer sprint. ORC advances the program after this sprint closes."/></phrase>
</verbatim_deliverable_audit>

<routing_notes>
- **REVISION round 1 — applying CR#1 CRITIQUE_BLOCK recipes verbatim.** No change to the 4-packet structure, agent assignments, or dependency order. Changes are confined to t1 ROSTER + SCs, t4 description + SCs, and bookkeeping (routing_notes/risk_flags). See the change-log at the top of this file.
- **ORC re-runs sc-precheck on THIS revised file before CR#2 (constraint 8; PM has no Bash).** The revision introduces NO diff-gated SCs and NO locked corpus values. New greps are structural on the sprint's OWN new files only: schema export names + analogy keys (t1 SC2/3), `specFile`/`.md` presence in ROSTER (t1 SC4 — asserted on the object, not a forbidden-pattern-in-value grep), `DEFERRED-P9-1` + `feasibility: 'projected'` (t3 SC3). The new t1 SC5 and t4 SC3 are runtime file-existence / non-empty assertions, not locked-value greps — no field-token-on-bare-key count, no forbidden pattern a locked value contains. PM asserts no locked-value defect classes are present; ORC attaches `sc-precheck-report.json`.
- **FIX 1 (CR#1 BLOCKER) — code→spec mapping is now the t1 `ROSTER.specFile` canonical static catalog.** CR#1 verified the mapping is NOT disk-derivable (AgentSchema has no role-code field; connectivity edges key by spec file path; initials-derivation fails for code-auditor→AU, critic→CR, archivist→AR, researcher→RA, ui-designer→UI, orchestrator→ORC). t1 ROSTER now carries `specFile` per code (12 non-null + DI null); t4's "do NOT assume a hardcoded name map" clause is DELETED and t4 consumes ROSTER.specFile. t1 SC5 asserts every non-null specFile resolves to a real file (mock-dir fixture + live-glob); t4 SC3 asserts NON-EMPTY equipment+materia for a real spec-backed agent so an all-empty result FAILS rather than passing as "graceful."
- **FIX 2 (CR#1 WARNING 1) — getParty envelope authority.** ORC has recorded the getParty ENVELOPE seam interpretation in the program manifest: `program.md §5 "Seam-interpretation notes" note 1`. That manifest note is now the PRIMARY authority for `roster.getParty` returning `PartyStatsSchema = { members: PartyMember[] (sorted by activity recency), diagnostics, activityAnchor }` — the seam's "PartyMember[] sorted by activity recency" refers to the `.members` field/ordering. The in-codebase `session.list {sessions, skipped}` envelope is now cited only as corroborating precedent, not the primary justification. **Canonical on conflict: program.md §5 note 1 (envelope), over a literal bare-array reading.** t3 context_files updated to cite program.md §5.
- **FIX 3 (CR#1 WARNING 2) — abilities-empty is contracted, not under-delivery.** ORC has recorded the abilities-empty interpretation in `program.md §5 note 2`. t4's description/SC6 now cite it: `abilities:[]` + a surfaced `dataQualityNote` is the CONTRACTED behavior for this sprint (`.claude/agents/tasks/workflows/*` is throwaway scaffolding per base-plan portability; the connectivity graph carries no `workflow` node type). A durable workflow-usage ledger is a future schema extension — see risk_flags (to be logged in deferred-work at sprint close).
- **audit-risk-forecast #2 hardening (CR#1):** t2's attribution-flip fixture now includes a same-role multi-instance family (FE#1 + FE#2 → FE) so instance-suffix stripping is proven end-to-end through the flip. Bounded packet-content addition, no structural change.
- **All 4 packets are backend-engineer, run SERIAL** (single BE owner; schemas.ts and router.ts are single-writer). Router.ts is touched by t3 (adds rosterRouter+getParty) then t4 (re-reads fresh, appends getAgentDetail). `append_serialization: { "packages/server/src/router.ts": [t3, t4] }` — encoded as t4-depends-on-t3.
- **G5 canonical-section resolution #2 (tokens/cost):** constraint 3 + SC5 require a projected tokens placeholder with DEFERRED-P9-1 cited, while v2-design-spec `<sample_data_appendix>` + `<notes>` ship the party card with NO MP/cost bar. Resolved: the projected placeholder is a single reserved exported constant in party-roster.ts (feasibility 'projected', null value, DEFERRED-P9-1 comment), NEVER populated into any PartyMember.stats. **Canonical on conflict: v2-design-spec `<sample_data_appendix>` (no cost bar rendered), with SC5 satisfied by the reserved-constant definition site.**
- **DESIGN.md check: N/A this sprint.** No UI surface, no CSS/component/token-render work — server+shared only. `materiaColorKey` carries a token NAME string (data), not a rendered token. No UI Designer / FE task; no DESIGN.md context needed for BE packets.
- **Foreground / Bash-needing:** GATE-DEVSERVER (SC7 :3001 smoke test) requires the running dev server — ORC-executed in the FOREGROUND after t4 audit PASS. No BE packet needs Bash beyond the standard `npm run lint` / `npm test` the auditor runs (t1 SC5 / t4 SC3 live-glob and live-GANDER_ROOT tests run inside vitest).
- **Human push opt-in:** "push this sprint" is the human's per-sprint guarded-auto-push opt-in. ORC may `git push origin <feature-branch>` ONLY after full audit PASS + REQVAL COVERED (standards.md Git Workflow Layer-2 gate); never main, never force. Surface the sha if any gate is unmet.
- **Relevant critics:** code-auditor (SA standards: Zod-at-boundary, strict TS, analogy-vocab field names, no-hex; QA functionality: attribution-flip correctness incl. multi-instance same-role, NON-EMPTY materia+equipment for a real agent, silent-empty surfacing distinguishable from parse failure; SX: GANDER_ROOT path-guard reuse on connectivity/spec reads). Critic should probe the ROSTER.specFile live-glob resolution and the t4 non-empty live-corpus assertion.
- **Multi-root corpus:** derivations aggregate across ALL `SESSIONS_SOURCE_DIRS` (gander + gander-studio-alpha, per inventory §1). Procedures pass `SESSIONS_SOURCE_DIRS.map(d => join(d,'docs','events'))`.
</routing_notes>

<risk_flags>
- **code → agent-spec mapping is now a maintained static catalog (ROSTER.specFile), NOT disk-inferred.** CR#1 confirmed no disk field links a 2-letter role code to a spec; the mapping is embedded verbatim in t1's ROSTER with a maintenance note ("new agents extend ROSTER"). Residual risk: if an agent spec is renamed on disk, the ROSTER.specFile row goes stale — t1 SC5's live-glob sanity test catches this at test time (fails if a non-null specFile no longer resolves). DI intentionally has `specFile: null` (12 specs for 13 codes — inventory §4) and is the ONE legitimate empty-with-note case; t4 SC3 ensures every OTHER code returns populated data.
- **abilities = workflows has no durable per-agent source — contracted empty this sprint.** Base-plan portability treats `.claude/agents/tasks/workflows/*` as throwaway scaffolding (standards.md), and the connectivity graph node types include no `workflow`. Per program.md §5 note 2 (ORC-recorded), t4 returns `abilities:[]` + a surfaced `dataQualityNote` — the CONTRACTED behavior, not an under-delivery. **A durable workflow-usage ledger is a FUTURE SCHEMA EXTENSION — ORC should record it in `docs/deferred-work.md` at this sprint's close** (so s3 does not plan a populated Abilities drilldown against an always-empty field). ORC/human may separately decide whether "abilities" should later map to an alternative durable source (e.g. workflow-type skills).
- **Known malformed corpus line is "recalled — implementer must verify."** t2 must open `docs/events/agent-events-2026-03-28.jsonl` seq 7 and confirm the missing-`agent_id`/`resolved_by` shape before fixing the fixture's shape to match (corpus-provenance SC, auditor-confirmed). Glob-confirmed the file exists on disk 2026-07-07; CR#1 independently confirmed seq 7 shape (resolved_by present, agent_id absent).
- **Serial chain = throughput risk, not correctness risk.** All 4 packets are one BE owner in sequence; a stall on an early packet blocks the rest. Mitigated by tight per-packet scope (≤2 files). No parallelism available given schemas.ts/router.ts single-writer discipline.
- **Activity-recency vs. spawn-count sort.** Seam says "sorted by activity recency" (latest event ts), while the design appendix orders its 6 sample cards by spawns+completes. t3 sorts by `lastActivityTs` (recency, per the binding seam); the design appendix's descending-spawns ordering is a sample-data illustration, not the runtime sort contract. Flagged so the Critic/auditor doesn't read the appendix ordering as the required sort.
- **Live-GANDER_ROOT test dependency (t1 SC5 / t4 SC3).** Both new SCs run assertions against the real gander repo via GANDER_ROOT. They must PASS in the local dev env (where GANDER_ROOT points at `~/projects/gander`) and skip-with-reason only if GANDER_ROOT is unset. The auditor runs these inside vitest — no separate Bash needed. If GANDER_ROOT is misconfigured at audit time, these tests skip rather than false-pass; ORC confirms GANDER_ROOT is set before audit.
- **Two of three named preflight post-mortems are not in this project.** `gander-ios-pipeline-p1.md` / `gander-meta-ratified-apply-p1.md` live in the gander repo, not `gander-studio-alpha/docs/after-actions/`. Recurring patterns were taken from the brief's pre-extracted `pm_preflight_checklist` (budget mechanism), not fresh reads — declared for honesty.
</risk_flags>

</task_decomposition>

---

<expectation_manifest>
  <sprint_id>prog-studio-v2-2026-07-s1-data-layer</sprint_id>
  <generated>2026-07-07T00:00:00Z (rev1)</generated>
  <assignments>
    <assignment>
      <task_id>prog-studio-v2-2026-07-s1-data-layer-t1</task_id>
      <agent>BE#1</agent>
      <expected_tag>completion_packet</expected_tag>
      <expected_file>.claude/tasks/outputs/prog-studio-v2-2026-07-s1-data-layer-t1-BE-*.md</expected_file>
      <blocks>t2, t3, t4</blocks>
      <receipt_check>
        <item>10 schema exports + z.infer types present in schemas.ts (grep)</item>
        <item>agent-role.ts exports roleOf, canonicalizeRole, ROSTER (13 entries); each entry carries specFile (12 non-null .md + DI null) + canonical-mapping maintenance comment</item>
        <item>analogy field names equipment/materia/skills/hooks/abilities present in AgentDetailSchema</item>
        <item>SC5: every non-null ROSTER.specFile resolves to a real file (mock-dir fixture + live-glob sanity) — test green</item>
        <item>no resolved hex in either file; no existing schema modified</item>
        <item>tsc ×3 clean; agent-role.test.ts green</item>
      </receipt_check>
    </assignment>
    <assignment>
      <task_id>prog-studio-v2-2026-07-s1-data-layer-t2</task_id>
      <agent>BE#1</agent>
      <expected_tag>completion_packet</expected_tag>
      <expected_file>.claude/tasks/outputs/prog-studio-v2-2026-07-s1-data-layer-t2-BE-*.md</expected_file>
      <blocks>t3, t4</blocks>
      <receipt_check>
        <item>readEventLogEntriesWithDiagnostics added; readEventLogEntries/parseEventLogFiles UNCHANGED (regression suites green)</item>
        <item>attribution-flip fixture-tested with gate-id ≠ implementer-id AND same-role multi-instance family (FE#1+FE#2→FE); exact fixture-derived assertions only</item>
        <item>invalidLineCount surfaced; ===1 on malformed fixture; real-line provenance (2026-03-28 seq 7) recorded</item>
        <item>ghost-rate + event-type coverage implemented; no corpus-locked numbers in assertions</item>
        <item>tsc ×3 clean; all suites green</item>
      </receipt_check>
    </assignment>
    <assignment>
      <task_id>prog-studio-v2-2026-07-s1-data-layer-t3</task_id>
      <agent>BE#1</agent>
      <expected_tag>completion_packet</expected_tag>
      <expected_file>.claude/tasks/outputs/prog-studio-v2-2026-07-s1-data-layer-t3-BE-*.md</expected_file>
      <blocks>t4 (router.ts serialization)</blocks>
      <receipt_check>
        <item>roster.getParty returns PartyStats; members.length===13; recency-sorted; envelope per program.md §5 note 1</item>
        <item>each stat has raw+normalized+derivation+feasibility; Activity normalized off live anchor (not 46)</item>
        <item>DEFERRED-P9-1 + feasibility 'projected' present in party-roster.ts; placeholder NOT in members[].stats</item>
        <item>non-Impl Accuracy null+reason; diagnostics on envelope</item>
        <item>tsc ×3 clean; suite green; no CLAUDE.md/router-table edit</item>
      </receipt_check>
    </assignment>
    <assignment>
      <task_id>prog-studio-v2-2026-07-s1-data-layer-t4</task_id>
      <agent>BE#1</agent>
      <expected_tag>completion_packet</expected_tag>
      <expected_file>.claude/tasks/outputs/prog-studio-v2-2026-07-s1-data-layer-t4-BE-*.md</expected_file>
      <blocks>GATE-DEVSERVER</blocks>
      <receipt_check>
        <item>code→spec resolved via t1 ROSTER.specFile (no disk-inference, no 2nd hardcoded map); "do NOT assume hardcoded name map" clause absent</item>
        <item>getAgentDetail appended to rosterRouter; getParty preserved (both under roster)</item>
        <item>SC3: live GANDER_ROOT — getAgentDetail('FE'/'AU') returns NON-EMPTY equipment AND materia; DI empty+note distinguishable from parse failure</item>
        <item>equipment/materia{skills,hooks}/abilities/relationships/qualityStats present; provenance paths on materia; abilities:[]+note per program.md §5 note 2</item>
        <item>quality stats declare attribution side; no-spec code (DI) returns note, not throw; connectivity read inline (no 3rd file)</item>
        <item>tsc ×3 clean; suite green</item>
      </receipt_check>
    </assignment>
  </assignments>
</expectation_manifest>
