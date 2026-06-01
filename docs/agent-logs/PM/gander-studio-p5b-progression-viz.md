# PM Log — gander-studio-p5b-progression-viz

## Stage 1: RECEIVED
**ts:** 2026-06-01T00:00:00Z
**task_id:** gander-studio-p5b-progression-viz
**brief:** Build Studio-side visualization for Gander progression ledger. Deliver: (1) `progression.getLedger` tRPC route + Zod schema; (2) `/progression` React route showing per-agent/per-skill XP history.

## Stage 2: PLAN

**Reads performed (budget: 8 soft):**
1. `~/.claude/refs/progression-ledger-schema.md` — schema contract (v1.0.0), Zod schema, parsing algorithm, sprint_id footgun warning
2. `docs/post-mortems/gander-studio-p7-graph-viz.md` — most recent same-architecture post-mortem (GAP-1 grep-c, GAP-2 dead-code selector, GAP-3 event-log hazard)
3. `packages/server/src/router.ts` (head + connectivity section + appRouter) — confirmed `connectivityRouter` pattern, guardPath helper, appRouter shape, all imports
4. `packages/client/src/pages/GraphPage.tsx` — confirmed GraphPage wiring, trpc.connectivity.getGraph.useQuery pattern
5. `packages/client/src/constants/navigation.ts` — confirmed NAV_ITEMS shape (mode/label/dotColor), current 6 entries ending with 'graph'
6. `packages/client/src/store/ui-store.ts` — confirmed AppMode union: 'browse'|'compose'|'edit'|'export'|'sessions'|'graph'
7. `packages/client/src/components/ModeContent.tsx` — confirmed PAGE_MAP pattern, where to add 'progression' entry
8. `/home/jhber/projects/gander/docs/progression-ledger.md` — confirmed live file, 5+ real entries, ```jsonl fence format, Phase 2 sprint_id annotation confirmed

**Recurring pattern preflight (3 most recent post-mortems):**
- gander-studio-p7-graph-viz §6 GAP-1: grep-c on bare field token off-by-one
- gander-studio-p6-overview-polish §6 GAP-1: PM plan doesn't validate against existing invariants; GAP-2: e2e never executed in-pipeline
- prog-studio-sessions-2026-05-s3-analyze §6 G1: plan-time fact checks verify type not implementation

**Decomposition approach:** 3 waves
- Wave 1 (parallel): UI#1 (design spec) + BE#1 (shared schema + tRPC route + server tests)
- Wave 2 (sequential after both wave 1 tasks pass audit): FE#1 (ProgressionPage + nav wiring + e2e spec)

## Checkpoint: All 3 task packets drafted.

## Stage 3: COMPLETE
**output_files:** [".claude/agents/tasks/outputs/gander-studio-p5b-progression-viz-PM-1780338308.md"]
