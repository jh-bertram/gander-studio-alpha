## [STAGE 1] RECEIVED
- **From:** orchestrator (via PM task_decomposition rev3)
- **At:** 2026-07-11T05:39:11Z
- **Task ID:** prog-studio-v2-2026-07-s4-retirement-BE-1
- **Message received:**
  > You are BE#2 executing packet **BE-1** (Wave 6 of 8, serial chain) of sprint prog-studio-v2-2026-07-s4-retirement: server-procedure deprecate-by-removal. Your contract: `<task_packet>` BE-1 in `.claude/tasks/outputs/prog-studio-v2-2026-07-s4-retirement-rev3-PM-1783715959.md` — read it FIRST, follow it verbatim. Your own planning round's packet is also on disk (`.claude/tasks/outputs/prog-studio-v2-2026-07-s4-retirement-BEP-1783713420.md`) — its blast-radius scans were CR-verified; reuse its findings rather than re-deriving. Sprint state you inherit (all uncommitted, all audit-PASSed): every client consumer of the procedures you remove is already deleted (Compose/Export/Planning/Browse/Graph/Edit surfaces gone; AppMode = 6 v2 members; verified by AUD#3/5/7 deletion-exactness gates). Key packet facts: REMOVE from router.ts: export.spawn, loadout.list/save/delete, planning.list, connectivity.getGraph (24→18). DELETE orphaned parsers+schemas per enumeration. jidoka fix #5: types.ts LoadoutSchema import + Loadout derivation removal. ConnectivityGraphSchema PROTECTION: definition stays, agent-detail.ts import stays, only router.ts's own dead import pruned. env.ts zero edits. …[truncated]

## [STAGE 2] PLAN
- **At:** 2026-07-11T05:41:00Z
- **Approach:**
  1. Re-verify importer scans at current HEAD (line numbers shifted vs. the BEP snapshot but findings identical — confirmed via grep: zero client `trpc.loadout/export/planning/connectivity` refs; AppMode = 6-member v2 union; pages/ dir has no Compose/Export/Planning/Browse/Graph/Edit).
  2. Edit `packages/server/src/router.ts`: delete `loadoutRouter`, `exportRouter`, `connectivityRouter`, `planningRouter` blocks + their `appRouter` registrations; trim dead imports (`LoadoutSchema`, `ExportInputSchema`, `ConnectivityGraphSchema`, `type ConnectivityGraph`, `PlanningListInputSchema`, `PlanningListOutputSchema`, `parsePlanningBacklog`, `unlink`/`copyFile`/`stat` from node:fs/promises, `LOADOUTS_DIR`/`EXPORT_BASE_DIR` from env.js); delete dead `sanitizeName` helper + `ExportResultSchema` const + its header comment.
  3. Edit `packages/shared/src/schemas.ts`: delete `LoadoutSchema`, `ExportInputSchema`, and the Planning block (4 schemas + inferred types); leave Connectivity* byte-identical.
  4. Edit `packages/shared/src/types.ts` (jidoka fix #5): drop `LoadoutSchema` import specifier + `export type Loadout` line.
  5. Delete `packages/server/src/parsers/planning-parser.ts` + `packages/server/src/parsers/__tests__/planning-parser.test.ts` via `node -e "fs.unlinkSync(...)"`.
  6. Verify: `npm run lint` (shared→server→client tsc), `npm test -w @gander-studio/server`, `npm run build -w @gander-studio/client`, restart :3001, curl matrix (retained-200/removed-404), confirm ConnectivityGraphSchema definition + agent-detail.ts import untouched.
- **Files to create/modify:**
  - `packages/server/src/router.ts` → remove 4 dead sub-routers + registrations + dead top-level symbols
  - `packages/shared/src/schemas.ts` → remove Loadout/Export/Planning schema blocks
  - `packages/shared/src/types.ts` → remove Loadout type derivation (compile-blocking fix)
  - `packages/server/src/parsers/planning-parser.ts` → delete
  - `packages/server/src/parsers/__tests__/planning-parser.test.ts` → delete
- **Dependencies / assumptions:** env.ts untouched (LOADOUTS_DIR backs SESSIONS_EDITS_DIR default); ConnectivityGraphSchema definition (schemas.ts) + agent-detail.ts import (line 16/44) + agent-detail.test.ts import all retained untouched; no client edits (already done by preceding FE waves).

### Checkpoint — 05:48:00
- Wrote `packages/server/src/router.ts` (net -351 lines: removed loadoutRouter/exportRouter/connectivityRouter/planningRouter blocks, appRouter registrations, dead imports, sanitizeName helper, ExportResultSchema const). guardPath retained (used by agent.save/skill.save/progression.getLedger). Next: schemas.ts.
### Checkpoint — 05:48:30
- Wrote `packages/shared/src/schemas.ts` (net -78 lines: LoadoutSchema, ExportInputSchema, Planning block removed; Connectivity* block byte-identical, confirmed by diff-adjacent read). Next: types.ts.
### Checkpoint — 05:48:45
- Wrote `packages/shared/src/types.ts` (net -2 lines: LoadoutSchema import specifier + `export type Loadout` removed; Agent/Skill/Hook untouched). Next: delete planning-parser.ts + test.
### Checkpoint — 05:49:00
- Deleted `packages/server/src/parsers/planning-parser.ts` and `packages/server/src/parsers/__tests__/planning-parser.test.ts` via `node -e fs.unlinkSync`. Next: run lint x3, server vitest, client build, restart :3001, curl matrix.
### Checkpoint — 05:52:00
- `npm run lint` (tsc x3, shared→server→client) — clean, zero output, exit 0. Confirms jidoka fix #5 (types.ts) resolved the first-pass compile blocker.
### Checkpoint — 05:53:00
- `npm test -w @gander-studio/server` — 15 test files (was 16; planning-parser.test.ts cleanly removed), 172 passed, 2 skipped, 0 failed.
### Checkpoint — 05:54:00
- `npm run build -w @gander-studio/client` — tsc + vite build green, 2247 modules, no error. Confirms client's router-type inference is unaffected by the removal.
### Checkpoint — 05:56:00
- tsx watch (:3001) hot-reloaded automatically on the router.ts edits (no manual restart needed — confirmed live). Curl matrix: retained procs 200/400-validation (health, agent.list, roster.getParty, session.list, progression.getLedger, program.getDag all FOUND); removed procs 404 `"No procedure found on path"` (loadout.list, planning.list, connectivity.getGraph, export.spawn).
### Checkpoint — 05:58:00
- `roster.getAgentDetail(BE)` returns 200 with `relationships: [{target:'.claude/agents/orchestrator.md', edgeType:'spawns', confidence:'DETECTED'}]` — proves `readConnectivityGraphSafe` (agent-detail.ts, ConnectivityGraphSchema.safeParse) resolves end-to-end post-removal.
### Checkpoint — 06:00:00
- `npx playwright test tests/e2e/prog-studio-v2-2026-07-s3-drilldowns.spec.ts` — 8/8 passed, including PROOF 2 (Graph absorption relationship panel) — the load-bearing e2e proof the ConnectivityGraphSchema protection held through the reduced router. Task complete; writing completion_packet.

## [STAGE 3] COMPLETE
- **At:** 2026-07-11T06:02:00Z
- **Deliverables:**
  | File | Lines | Notes |
  |---|---|---|
  | packages/server/src/router.ts | -351 net | 4 sub-routers removed (loadout/export/connectivity/planning) + registrations + dead imports/helpers |
  | packages/shared/src/schemas.ts | -78 net | LoadoutSchema, ExportInputSchema, Planning block removed; Connectivity* byte-identical |
  | packages/shared/src/types.ts | -2 net | jidoka fix #5: LoadoutSchema import + Loadout type derivation removed |
  | packages/server/src/parsers/planning-parser.ts | deleted (265) | sole importer (planningRouter) removed same packet |
  | packages/server/src/parsers/__tests__/planning-parser.test.ts | deleted (141) | self-contained suite for the deleted parser |
- **Lint / tests:** lint x3 clean; server vitest 172/172 (2 skipped) green; client build green; curl matrix retained-FOUND/removed-404; s3-drilldowns e2e 8/8 green.
- **Open items:** none for this packet. STUDIO_ROOT header comment ("Planning and program.md files live here") is now half-stale prose — flagged in BEP as cosmetic-only, no packet owns it; left untouched per scope.
