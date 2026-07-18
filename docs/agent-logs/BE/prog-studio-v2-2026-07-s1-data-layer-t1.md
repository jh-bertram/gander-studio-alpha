## [STAGE 1] RECEIVED
- **From:** orchestrator (ORC)
- **At:** 2026-07-07T17:45:00-06:00
- **Task ID:** prog-studio-v2-2026-07-s1-data-layer-t1
- **Message received:**
  > You are BE#1 executing task packet `prog-studio-v2-2026-07-s1-data-layer-t1` — the foundation packet of the v2 data-layer sprint: the v2 Zod schemas and the canonical roster catalog. Your task packet is the single source of truth — read it and follow it verbatim: .claude/tasks/outputs/prog-studio-v2-2026-07-s1-data-layer-rev-PM-1783467209.md → <task_packet> with <task_id>prog-studio-v2-2026-07-s1-data-layer-t1</task_id> ONLY (t2/t3/t4 are later waves — do not implement them). This is the REVISED plan (CR#2-passed): t1 has 7 SCs including SC5 (every non-null ROSTER.specFile resolves to a real file — mock-dir fixture + live-glob sanity against ${GANDER_ROOT}/.claude/agents/). Key requirements (packet prevails on any divergence): packages/shared/src/schemas.ts: ADD the v2 schemas (PartyMemberSchema, PartyStatsSchema, AgentDetailSchema + sub-schemas per the packet's field specs — analogy vocabulary exact: equipment=tools, materia={skills,hooks}, abilities=workflows; stat bars carry raw + 0-100 normalized + derivation id + feasibility tag). Do NOT modify existing schemas. <Entity>Schema naming; z.infer types exported. packages/server/src/parsers/agent-role.ts (new): ROSTER catalog — 13 entries {code, roleCategory, materiaColorKey, specFile}: AU→auditor.md, CR→critic.md, FE→frontend.md, BE→backend.md, PM→pm.md, RA→researcher.md, AR→archivist.md, UI→ui-designer.md, ST→statistician.md, HR→hr.md, DS→database.md, ORC→orchestrator.md, DI→null. Canonical code→spec mapping maintenance comment ("new agents extend ROSTER"). roleOf/canonicalizeRole helpers per packet. vitest suite(s) in packages/server/src/parsers/__tests__/ per the packet SCs. GANDER_ROOT for the live-glob sanity test: export it explicitly when running and RECORD the exact command + output. Verify: npm run lint (tsc ×3) clean + server vitest green. …[truncated]

## [STAGE 2] PLAN
- **At:** 2026-07-07T17:52:00-06:00
- **Approach:**
  1. Read the full t1 task_packet (done — lines 43-197 of the rev-PM file) as single source of truth.
  2. Read `packages/shared/src/schemas.ts` in full to match section-banner / `<Entity>Schema` / `z.infer` conventions (done).
  3. Confirm GANDER_ROOT env (`/home/jhber/projects/gander`) has all 12 non-DI spec files present under `.claude/agents/` (done — confirmed via `ls`).
  4. Append the 10 new schemas + types to `schemas.ts` verbatim per packet field spec, with a section banner comment. Additive only — no edits to existing schema blocks.
  5. Create `packages/server/src/parsers/agent-role.ts`: `roleOf`, `canonicalizeRole`, `ROSTER` (13 entries incl. specFile), maintenance comment.
  6. Create `packages/server/src/parsers/__tests__/agent-role.test.ts`: SC4 (roleOf/canonicalizeRole/ROSTER shape) + SC5 (mock-dir fixture existence check + live-glob sanity against real GANDER_ROOT, `test.skip` fallback if unset).
  7. Run `npm run lint` (tsc x3) and `GANDER_ROOT=/home/jhber/projects/gander npm test -w @gander-studio/server`; capture verbatim output.
  8. Self-check all 7 SCs; write completion_packet to output path + this log Stage 3.
- **Files to create/modify:**
  - `packages/shared/src/schemas.ts` (MODIFY — additive only) → add 10 v2 schemas + z.infer types
  - `packages/server/src/parsers/agent-role.ts` (NEW) → ROSTER catalog + roleOf/canonicalizeRole
  - `packages/server/src/parsers/__tests__/agent-role.test.ts` (NEW) → SC4/SC5 tests
- **Dependencies / assumptions:**
  - GANDER_ROOT=/home/jhber/projects/gander is the live env for the SC5 live-glob sanity test; confirmed all 12 spec files present.
  - agent-role.ts itself does NOT import env.ts (no env var reads) — pure helpers + constant only, per out_of_scope. Only the TEST file reads process.env.GANDER_ROOT directly, matching the pattern that no other parser file needs env.ts at import time (avoids GANDER_ROOT/LOADOUTS_DIR throw-on-missing coupling).
  - Test runner is vitest via `npm test -w @gander-studio/server` (package.json script: `vitest run src/parsers/__tests__`).

### Checkpoint — 18:05:00
- Wrote `packages/shared/src/schemas.ts` (+90 lines: 10 schemas + 10 z.infer types, additive-only, verified via grep). `tsc --noEmit --project packages/shared/tsconfig.json` clean after each of 2 incremental edits. Next: create `packages/server/src/parsers/agent-role.ts`.

### Checkpoint — 18:10:00
- Wrote `packages/server/src/parsers/agent-role.ts` (68 lines, new): `roleOf`, `canonicalizeRole`, 13-entry `ROSTER` (incl. `specFile` col) + canonical-mapping maintenance comment. `tsc --noEmit --project packages/server/tsconfig.json` clean. Next: write `agent-role.test.ts` (SC4 + SC5).

### Checkpoint — 18:15:00
- Wrote `packages/server/src/parsers/__tests__/agent-role.test.ts` (96 lines, new): SC4 shape assertions + SC5 mock-dir fixture (a) + live-glob sanity (b) against real GANDER_ROOT. Refactored a duplicated filter+existsSync loop into a shared `assertAllSpecFilesResolveUnder` helper (DRY pre-flight). tsc clean, `GANDER_ROOT=/home/jhber/projects/gander npm test -w @gander-studio/server` → 150/150 tests, 13/13 files green (12 pre-existing + 1 new, zero regressions). SC5 live-glob test confirmed RAN (not skipped) via `--reporter=verbose`. Security pre-flight (hex-literal grep) clean. Completion packet written to `.claude/tasks/outputs/prog-studio-v2-2026-07-s1-data-layer-t1-BE-1783467894.md`. Next: none — task complete.

## [STAGE 3] COMPLETE
- **At:** 2026-07-07T17:52:00-06:00
- **Deliverables:**
  | File | Lines | Notes |
  |---|---|---|
  | packages/shared/src/schemas.ts | +90 (additive) | 10 v2 schemas + 10 z.infer types, no existing schema touched |
  | packages/server/src/parsers/agent-role.ts | 68 (new) | roleOf, canonicalizeRole, 13-entry ROSTER incl. specFile |
  | packages/server/src/parsers/__tests__/agent-role.test.ts | 96 (new) | SC4 + SC5 tests, DRY-refactored helper |
- **Lint / tests:** `npm run lint` (tsc x3) clean; `GANDER_ROOT=/home/jhber/projects/gander npm test -w @gander-studio/server` → 150/150 passed, 13/13 files, zero regressions. SC5 live-glob confirmed RAN via verbose reporter.
- **Open items:** None for t1. Commit-size note left for ORC in completion_packet (schemas.ts is a single +90-line diff; recommend optional 2-way split at the natural PartyMember/AgentDetail boundary for the 50-line gate — both halves were independently tsc-verified during implementation). No git commit issued (handoff discipline — ORC commits post-audit). No docs/events/ write (hook auto-logs COMPLETE).
