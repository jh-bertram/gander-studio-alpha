# PM Output — gander-studio-p2-agent-cards
**task_id:** gander-studio-p2-agent-cards
**agent_id:** PM#0
**ts:** 2026-03-30T00:05:00Z

---

## Source files read

- `packages/client/src/store/canvas-store.ts` — CanvasNode interface confirmed (id, name, type, position). No role field exists. cardTitle not in store. ORCHESTRATOR_ID is hardcoded `'orchestrator'`. Ring radii: agent=220, skill=380.
- `packages/client/src/constants/canvas.ts` — Full visual constants file. No card constants. LIST_* constants confirmed present.
- `packages/client/src/constants/compose.ts` — getMateriaColor confirmed: type-based and name-set-based. Already uses --mg (green), --my (yellow), --mb (blue #4a90d9), etc. No role parameter.
- `packages/client/src/components/compose/MateriaCanvas.tsx` — LoadoutListPanel confirmed inline. Duplicate logic confirmed: skills appear as children of each agent they connect to (correct per new design). Orphan skills shown separately. The "duplicate" is that a skill connected to 2 agents shows under both agents — new design keeps this intentional.
- `packages/client/src/components/compose/MateriaNode.tsx` — Pure orb component. isOrchestrator flag confirmed.
- `packages/shared/src/schemas.ts` — LoadoutSchema confirmed. No cardTitle field.
- `packages/server/src/router.ts` — 12 procedures confirmed. loadout.save accepts LoadoutSchema.
- `packages/client/tests/e2e/loadout-list-panel.spec.ts` — Tests check `aria-label="Select orchestrator on canvas"`. Will break and must be updated in FE-003.
- `packages/client/src/globals.css` — Color tokens confirmed: --mg #4caf7d, --my #e8c840, --mb #4a90d9, --sfm, --sf, --bdb, --void.

## Key findings that shaped decomposition

1. getMateriaColor already has the right colors for the role mapping (--mg=green specialist, --my=yellow meta, --mb=blue skill). The function just needs a `role` param added so callers can bypass name-hashing.

2. The "duplicate bug" description in the brief is actually: a skill connected to multiple agents appears under each agent (correct behavior per new spec). The real issue was orphan entries. The new design explicitly shows skills under each connected agent — so no change in tree logic for that case, but orphan handling is cleaned up.

3. The orchestrator node in canvas-store.ts is `type: 'agent'` with `id: 'orchestrator'`. Converting it to a card means: same node id and store entry, but React Flow renders it as `type: 'card'` instead of `type: 'materia'`. The store needs `role: 'meta'` on this node.

4. Ring positions (agent 220px, skill 380px) will place orbs inside the card at default (card is 900×700, center is 0,0, so bounds are ±450x, ±350y). Skills at radius 380 will be near the Y edges of the card but acceptable for sprint scope.

5. No backend changes needed — LoadoutSchema extension is additive (cardTitle optional, Zod handles missing field with undefined). router.ts does not need modification.

6. The appearance config file (item 5) is deferred. Rationale: adds a new server endpoint, file I/O, client fetch hook, and runtime constant injection — all orthogonal to the visual work. Keeping it out of scope reduces sprint risk and keeps the audit surface clean.

---

See `/home/jhber/projects/gander-studio-alpha/.claude/agents/tasks/gander-studio-p2-agent-cards.md` for full task packet definitions.

## Task summary

| task_id | agent | wave | priority | depends_on |
|---|---|---|---|---|
| gander-studio-p2-agent-cards-DS-001 | DS | 1 | BLOCKER | none |
| gander-studio-p2-agent-cards-FE-001 | FE | 2 | HIGH | DS-001 |
| gander-studio-p2-agent-cards-FE-002 | FE | 3 | HIGH | DS-001, FE-001 |
| gander-studio-p2-agent-cards-FE-003 | FE | 4 | HIGH | DS-001, FE-001, FE-002 |
| gander-studio-p2-agent-cards-DEFERRED-001 | — | deferred | NORMAL | — |

## COMPLETE event
{"seq":29,"ts":"2026-03-30T00:05:00Z","ev":"COMPLETE","task_id":"gander-studio-p2-agent-cards","agent_id":"PM#0","parent_id":"ORC#0","edge_label":"task_decomposition","output_files":[".claude/agents/tasks/outputs/gander-studio-p2-agent-cards-PM-001.md",".claude/agents/tasks/gander-studio-p2-agent-cards.md","docs/agent-logs/PM/gander-studio-p2-agent-cards.md"]}
