# PM Log — prog-studio-vision-2026-06-s5-cleanup-docs

## Stage 1 — RECEIVED
- Refine the s5 cleanup plan into 4 SEQUENTIAL stages (DELETE → MERGE → RECONCILE → DOCS).
- Heavy file overlap (globals.css, package.json, schemas, components) makes parallel unsafe → serial.
- #1 risk: REGRESSION (deletion breaks build / merge changes behavior). Every deletion grep-guarded to zero live call sites; every merge behavior-preserving.

## Stage 2 — PLAN
- No planning consultations needed (RA/UI/DS): cleanup sprint, all facts derivable from source already read.
- Recurring-pattern preflight: read gander after-actions §6 (most recent). Cited in routing_notes.
- Read-evidence pre-flight performed BEFORE drafting investigation steps:
  - router.ts read in full → 22 procedures confirmed (brief correct; orchestrator_brief's "20" is stale).
  - findSessionById triplication = session.get/getStats/getRaw — NOT identical bodies; helper must return {session,dir}, callers keep own post-processing. getRaw keeps its validateSaveEditPath re-run (saveedit-guard containment).
  - **REGRESSION TRAP CAUGHT:** SessionRawInputSchema + AggregateStatsInputSchema are LIVE (router.ts:580,613). Brief listed them as dead — only the TYPE aliases SessionRawInput/AggregateStatsInput are candidate-dead. DELETE stage must delete types only, never schemas.
  - SEAM-05 confirmed: addAgent/addSkill/addHook dead; loadLoadout/resetLoadout/setLoadoutName/removeHook LIVE.
  - RECONCILE: canonical map = DESIGN.md Decision Record B (SEAM-07). browse.ts AGENT_MATERIA already matches DR-B. Real divergence = agent-roles.ts EXTERNAL set conflates Intel(RA/ST→blue) + Meta(UI→purple); compose.ts getMateriaColor role fast-path maps external→--mp (purple) which is WRONG for RA/ST per DR-B (blue). SprintNode.tsx uses tier/status→color NOT role→color (not a call-path). → 2 real divergent paths, NOT a no-op.
  - DEFERRED-002 at line 22; DONE-marker format taken verbatim from DEFERRED-P7-1 (line 9 + Resolution line).
  - --redb: globals.css:215 + DESIGN.md DR-A:183 + DR-B:325 all claim "~4.8:1 on --void AA". Brief says true value 4.07:1 (below AA as text). Correction targets all three sites + new DEFERRED entry.
- 4 stage packets (all FE except MERGE which is BE; DOCS split FE/BE work but single packet per stage for serial safety). Decomposition: one packet per stage, sequential dependency chain.

## Stage 3 — COMPLETE
- Output: .claude/agents/tasks/outputs/prog-studio-vision-2026-06-s5-PM-{ts}.md
- 4 task packets (s5-DELETE, s5-MERGE, s5-RECONCILE, s5-DOCS), strict serial chain.
- sc-precheck note: script lives in gander control-plane repo; ORC runs it against decomposition with --repo-root studio-alpha. See routing_notes.
