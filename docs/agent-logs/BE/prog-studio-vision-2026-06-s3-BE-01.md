## [STAGE 3] COMPLETE
- **At:** 2026-06-20T18:05:00Z
- **Deliverables:**

| File | Lines | Notes |
|------|-------|-------|
| packages/shared/src/schemas.ts | +90 | PlanningItem/Sprint/ListInput/Output + ProgramDagNode/Edge/Seam/Schema + ProgramGetDagInput/Output schemas |
| packages/server/src/parsers/planning-parser.ts (NEW) | 146 | Parses deferred-work.md + task-registry.md; Promise.allSettled-and-skip |
| packages/server/src/parsers/program-dag-parser.ts (NEW) | 250 | Globs docs/programs/{id}/program.md; parses Sprint Roster + Tiers + Seams tables; allSettled-and-skip |
| packages/server/src/parsers/skill-parser.ts | +8 | Promise.all → Promise.allSettled-and-skip (one bad SKILL.md → skip, not 500) |
| packages/server/src/parsers/hook-parser.ts | +5 | Tolerate missing settings.json (return [] on ENOENT) |
| packages/server/src/router.ts | +50 | planningRouter + programRouter + wired into appRouter; export.spawn EXPORT_BASE_DIR containment guard (path.sep safe); aggregateStats Promise.all → allSettled; STUDIO_ROOT helper; consolidated imports |
| packages/server/src/parsers/__tests__/planning-parser.test.ts (NEW) | 118 | 11 tests: real files, allSettled-and-skip, done marker |
| packages/server/src/parsers/__tests__/program-dag-parser.test.ts (NEW) | 174 | 15 tests: both real programs, filter by programId, allSettled-and-skip |

- **Lint / tests:** TS clean (shared + server + client), 108 tests passing (10 test files)
- **Open items:** None — all SCs met; FE packets own PlanningPage/ProgramDagPage rendering

## [STAGE 2] PLAN
- **At:** 2026-06-20T17:42:00Z
- **Approach:**
  1. Add Zod schemas to packages/shared/src/schemas.ts: PlanningItemSchema, PlanningSprintSchema, PlanningBacklogSchema + PlanningListInputSchema + PlanningListOutputSchema; ProgramDagNodeSchema, ProgramDagEdgeSchema, ProgramDagSchema + ProgramGetDagInputSchema + ProgramGetDagOutputSchema
  2. Create packages/server/src/parsers/planning-parser.ts — parse deferred-work.md (DEFERRED-NNN headings, status, schedule-as) + task-registry.md (sprint headings, goal, status, rollback commit) into grouped PlanningBacklog
  3. Create packages/server/src/parsers/program-dag-parser.ts — glob docs/programs/*/program.md, parse Sprint Roster table + Topological tiers bullet + Integration Seams table; Promise.allSettled-and-skip
  4. Convert skill-parser.ts Promise.all → Promise.allSettled-and-skip
  5. Convert hook-parser.ts to tolerate missing settings.json (return [] on ENOENT)
  6. Strengthen export.spawn EXPORT_BASE_DIR containment guard (must stay inside EXPORT_BASE_DIR)
  7. Wire planning.list + program.getDag procedures in router.ts
  8. Add unit tests in packages/server/src/parsers/__tests__/planning-parser.test.ts + program-dag-parser.test.ts
- **Files to create/modify:**
  - packages/shared/src/schemas.ts → add 10 new schemas
  - packages/server/src/parsers/planning-parser.ts (NEW)
  - packages/server/src/parsers/program-dag-parser.ts (NEW)
  - packages/server/src/parsers/skill-parser.ts → Promise.allSettled-and-skip
  - packages/server/src/parsers/hook-parser.ts → tolerate missing settings.json
  - packages/server/src/router.ts → planning/program routers + export.spawn containment
  - packages/server/src/parsers/__tests__/planning-parser.test.ts (NEW)
  - packages/server/src/parsers/__tests__/program-dag-parser.test.ts (NEW)
- **Dependencies / assumptions:**
  - docs/deferred-work.md and docs/task-registry.md are in the gander-studio-alpha repo (verified)
  - docs/programs/prog-studio-sessions-2026-05/program.md and prog-studio-vision-2026-06/program.md exist (verified)
  - GANDER_ROOT points to gander-studio-alpha root (no: env is /home/jhber/projects/gander — planning files are in studio-alpha, so parser takes explicit root)
  - Actually: planning files (deferred-work.md, task-registry.md) live at GANDER_STUDIO_ROOT (the studio-alpha repo root); program.md files live at packages/server/../../../docs/programs/ relative to the studio server. Need to read from the studio app root, NOT GANDER_ROOT.
  - The planning procedure reads from the STUDIO repo root (where this server lives), not GANDER_ROOT.

### Checkpoint — 17:50:00
- Wrote `packages/server/src/parsers/planning-parser.ts` (146 lines). Next: program-dag-parser.ts.

### Checkpoint — 18:05:00
- All tests pass (108 passing across 10 test files). TypeScript clean (all 3 packages). Live e2e: planning.list and program.getDag return real data. Next: write Stage 3 + completion packet.

### Checkpoint — 17:44:00
- Wrote `packages/shared/src/schemas.ts` (added PlanningItemSchema, PlanningSprintSchema, PlanningListInput/OutputSchema, ProgramDag* schemas — ~90 lines). Next: planning-parser.ts.

## [STAGE 1] RECEIVED
- **From:** orchestrator
- **At:** 2026-06-20T17:40:08Z
- **Task ID:** prog-studio-vision-2026-06-s3-BE-01
- **Message received:**
  > Build p1 (planning.list), p2 (program.getDag), p6 (robustness). Make REAL edits.
  > Working directory: /home/jhber/projects/gander-studio-alpha
  > Program: prog-studio-vision-2026-06  Sprint: s3-agent-os-legibility (tier 2)
  > Branch: prog-studio-vision-2026-06
  > planning.list: parse docs/deferred-work.md + docs/task-registry.md into a structured PlanningBacklog
  > program.getDag: parse docs/programs/*/program.md markdown tables into ProgramDag {nodes,edges}
  > p6: skill.list/hook.list/loadout.list → Promise.allSettled-and-skip; export.spawn → enforce EXPORT_BASE_DIR containment
  > BOTH new procedures: input+output Zod schemas in schemas.ts, z.infer types. Add unit tests in packages/server/src/parsers/__tests__/
  > …[truncated]
