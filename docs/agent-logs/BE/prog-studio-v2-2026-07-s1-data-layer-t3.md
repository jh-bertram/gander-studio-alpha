## [STAGE 1] RECEIVED
- **From:** orchestrator (ORC)
- **At:** 2026-07-08T00:07:39Z
- **Task ID:** prog-studio-v2-2026-07-s1-data-layer-t3
- **Message received:**
  > **Working directory:** /home/jhber/projects/gander-studio-alpha
  >
  > ## Output Path
  > Write your primary output to:
  >   .claude/tasks/outputs/prog-studio-v2-2026-07-s1-data-layer-t3-BE-1783469229.md
  > Record this path in output_files of your COMPLETE event.
  >
  > ## Task
  > You are BE#3 executing task packet `prog-studio-v2-2026-07-s1-data-layer-t3` — party assembly + the `roster.getParty` procedure.
  >
  > Your task packet is the single source of truth — read and follow verbatim:
  >   .claude/tasks/outputs/prog-studio-v2-2026-07-s1-data-layer-rev-PM-1783467209.md
  >   → <task_packet> with <task_id>prog-studio-v2-2026-07-s1-data-layer-t3</task_id> ONLY.
  >
  > Binding envelope authority: docs/programs/prog-studio-v2-2026-07/program.md §5 "Seam-interpretation notes" note 1 — `roster.getParty` returns the PartyStatsSchema ENVELOPE `{members: PartyMember[] (sorted by activity recency), diagnostics, activityAnchor}`.
  >
  > Upstream on disk (consume, do not modify): t1 — packages/shared/src/schemas.ts (PartyMemberSchema/PartyStatsSchema), packages/server/src/parsers/agent-role.ts (ROSTER/roleOf/canonicalizeRole); t2 — packages/server/src/parsers/party-stats.ts (computePartyDerivations), event-log-parser.ts readEventLogEntriesWithDiagnostics. t2's diagnostics + derivations feed your envelope; do not re-derive.
  > Key packet requirements: new packages/server/src/parsers/party-roster.ts (assembly: derivations → PartyMember records w/ named stat bars carrying raw + 0-100 normalized + derivation id + feasibility tag; portrait seed; materiaColorKey from ROSTER); router.ts gains the `roster` router with getParty (first roster procedure — you create the namespace); tokens/cost is a reserved projected CONSTANT (never a card bar) with DEFERRED-P9-1 cited at the definition site; Zod-validate at the boundary.
  >
  > Verification: GANDER_ROOT=/home/jhber/projects/gander npm test -w @gander-studio/server + npm run lint (tsc ×3); record outputs verbatim. If a schema gap blocks assembly, FLAG it (do not edit schemas.ts).
  >
  > ## Out of Scope
  > No client changes; no getAgentDetail (t4 — but structure the roster router so t4 appends cleanly); no schemas.ts/party-stats.ts modification; no docs/events writes; NO git commit.
  >
  > ## Expected Output
  > completion_packet XML: files_created/modified, procedure signature, normalization approach per bar (what raw range maps to 0-100 and why), test+lint outputs verbatim, SC-by-SC self-check. Success signal: vitest green (new suite RAN), lint ×3 clean, all packet SCs satisfied. …[truncated]

## [STAGE 3] INTERRUPTED
- **At:** 2026-07-08T00:11:55.991955+00:00
- **Detected by:** agent-stop-checkpoint hook (session ended without Stage 3)
- **Action required:** Re-dispatch BE#3 (canonical: BE#3) for task `prog-studio-v2-2026-07-s1-data-layer-t3`.
  Read `docs/agent-logs/BE/latest.md` before starting — skip completed checkpoints.

## [RE-DISPATCH] Resumed
- **At:** 2026-07-08T00:16:00Z
- No file-write checkpoints had been recorded before the interruption marker above (Stage 2 plan
  had not yet been written; no source files existed). Proceeding from a clean start — nothing to skip.

## [STAGE 2] PLAN
- **At:** 2026-07-08T00:16:00Z
- **Approach:**
  1. Read t1 (`agent-role.ts` — ROSTER, roleOf, canonicalizeRole) and t2 (`party-stats.ts` — computePartyDerivations, `event-log-parser.ts` — readEventLogEntriesWithDiagnostics) — confirmed both on disk and match the packet's described shapes.
  2. Read `packages/shared/src/schemas.ts` §Party/Agent-Detail block — confirmed FeasibilitySchema/PartyStatBarSchema/PartyMemberSchema/PartyStatsSchema already present verbatim (t1 delivered). No schema gap found.
  3. Read `router.ts` (imports, `sessionRouter.list` envelope precedent, `progressionRouter`→`appRouter` tail) and `aggregate-stats.ts` (raw-object + `Schema.parse()` boundary-validation pattern) to match conventions.
  4. Read `docs/deferred-work.md` (DEFERRED-P9-1 text) and `program.md §5` (seam note 1 — envelope authority) and `v2-design-spec.md` sample_data_appendix (Activity=spawns/max, Stamina=1-ghost/spawn, Accuracy=first-pass, Impl-only, no cost bar) to ground normalization formulas.
  5. Write `packages/server/src/parsers/party-roster.ts`: `assembleParty(eventsDirs)` — calls computePartyDerivations, iterates ROSTER, builds 3 stat bars per member (Activity/Stamina/Accuracy) with raw+normalized+derivation+feasibility, computes activityAnchor as live max spawnCount across ROSTER, sorts by lastActivityTs desc (nulls last), Zod-validates via `PartyStatsSchema.parse(raw)`. Also exports `TOKENS_PROJECTED_PLACEHOLDER` (reserved constant, DEFERRED-P9-1 comment, never populated into any member's stats).
  6. Add a dedicated synthetic fixture `__tests__/fixtures/party-roster/agent-events-party-roster.jsonl` (FE spawnCount=4 = anchor/max; BE spawnCount=2 = exactly half-max -> normalized=50; HR spawnCount=1, no audits, non-Impl -> Accuracy N/A; DS present in ROSTER but absent from fixture -> attributedAudits=0 path; 9 ROSTER codes absent entirely -> hasCorpusActivity:false, DI among them).
  7. Write `__tests__/party-roster.test.ts` asserting: members.length===13, FE Activity normalized===100 (max role), BE Activity normalized derived via ratio-to-max relationship (not a locked anchor value), non-Impl (HR) Accuracy null+reason 'not audit-gated', DI hasCorpusActivity:false + lastActivityTs:null, sort order (recency desc, nulls last), diagnostics threaded through, TOKENS_PROJECTED_PLACEHOLDER never appears in any member's stats.
  8. Add `rosterRouter` to `router.ts` with `getParty` only (output `PartyStatsSchema`), register `roster: rosterRouter` in `appRouter`. Do NOT touch `getAgentDetail` (t4) or CLAUDE.md/router-count table.
  9. Run `npm run lint` (tsc x3) and `GANDER_ROOT=/home/jhber/projects/gander npm test -w @gander-studio/server`; record verbatim.
- **Files to create/modify:**
  - `packages/server/src/parsers/party-roster.ts` (NEW) — assembly + TOKENS_PROJECTED_PLACEHOLDER
  - `packages/server/src/parsers/__tests__/fixtures/party-roster/agent-events-party-roster.jsonl` (NEW) — synthetic fixture
  - `packages/server/src/parsers/__tests__/party-roster.test.ts` (NEW) — tests
  - `packages/server/src/router.ts` (MODIFY) — add rosterRouter.getParty + register under appRouter
- **Dependencies / assumptions:** t1/t2 deliverables verified present and matching packet shapes exactly (no schema gap found — no `<data_request>` needed). GANDER_ROOT points at `~/projects/gander` in this env per CLAUDE.md env table.

### Checkpoint — 00:18:30
- Wrote `packages/server/src/parsers/__tests__/fixtures/party-roster/agent-events-party-roster.jsonl` (14 lines). Next: party-roster.ts.
- Wrote `packages/server/src/parsers/party-roster.ts` (~210 lines; single logical unit — assembly + placeholder constant, not splittable across the 50-line micro-commit gate without breaking compile, see commit-plan note in Stage 3). Self-corrected a dead-code introduction (`accuracyStatBar`/`roleCategoryToCode` split) mid-write by simplifying to a single `roleCategory === 'Impl'` check before moving on — no dead code remains. Next: party-roster.test.ts.

### Checkpoint — 00:24:00
- Wrote `packages/server/src/parsers/__tests__/party-roster.test.ts` (~150 lines). Next: wire rosterRouter into router.ts.

### Checkpoint — 00:26:00
- Edited `packages/server/src/router.ts` — added `PartyStatsSchema` import, `assembleParty` import, `rosterRouter` block (getParty only), and `roster: rosterRouter` registration in `appRouter`. Diff is ~18 lines. Next: run lint + tests.

### Checkpoint — 00:29:00
- `npm run lint` (tsc x3): clean, exit 0. `npm test -w @gander-studio/server`: 15 test files / 177 tests, all green (new party-roster.test.ts contributes 15 of those). Ran DRY self-check: found repeated N/A/computed-bar object-literal shape across activityStatBar/staminaStatBar/accuracyStatBar; extracted `naStatBar`/`computedStatBar` helpers before finalizing. Re-ran lint+tests after refactor — still clean/green. Security pre-flight: no fs/path usage in party-roster.ts, no raw Error.message forwarding, no `any`. No schema gap found (t1's schemas.ts covers PartyStats/PartyMember/PartyStatBar exactly) — no `<data_request>` needed.

## [STAGE 3] COMPLETE
- **At:** 2026-07-08T00:30:00Z
- **Deliverables:**
  | File | Lines | Notes |
  |---|---|---|
  | `packages/server/src/parsers/party-roster.ts` | 189 | NEW — `assembleParty`, `TOKENS_PROJECTED_PLACEHOLDER`, bar builders |
  | `packages/server/src/parsers/__tests__/party-roster.test.ts` | 174 | NEW — 15 tests (shape, anchor-relationship, N/A, sort, diagnostics, placeholder) |
  | `packages/server/src/parsers/__tests__/fixtures/party-roster/agent-events-party-roster.jsonl` | 14 | NEW — synthetic fixture (FE=4 spawns/anchor, BE=2=half-anchor, HR=1 non-Impl) |
  | `packages/server/src/router.ts` | +18/-0 (diff) | MODIFIED — `rosterRouter` (getParty only) registered under `appRouter.roster` |
- **Lint / tests:** `npm run lint` (tsc x3) — clean, exit 0. `npm test -w @gander-studio/server` — 15 files / 177 tests passed, 0 failed.
- **Open items:** None blocking. t4 (getAgentDetail) will re-read router.ts and append to the same `rosterRouter` — confirmed the router structure supports a clean append (single `t.router({...})` object literal, only `getParty` key present). No schema gap encountered; no `<data_request>` issued.
