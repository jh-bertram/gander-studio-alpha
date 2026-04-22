# PM Log — gander-studio-p2-agent-cards

## [STAGE 1] RECEIVED
**task_id:** gander-studio-p2-agent-cards
**ts:** 2026-03-30T00:00:00Z
**agent_id:** PM#0

Received orchestrator_brief for Materia Canvas redesign (5 items: card concept, orbs-on-card, color coding, list panel rewrite, appearance config file).

---

## [STAGE 2] PLAN

### Pre-flight source reads completed:
- `packages/client/src/store/canvas-store.ts` — CanvasNode has {id, name, type:'agent'|'skill', position}. No role field. ORCHESTRATOR_ID fixed at center.
- `packages/client/src/constants/canvas.ts` — All orb + list panel visual constants. No card-related constants.
- `packages/client/src/constants/compose.ts` — getMateriaColor() already classifies by name sets (COMMAND_AGENTS→--my, IMPL_AGENTS→--mg, GATE_AGENTS→--mr, INTEL_AGENTS→--mb, META_AGENTS→--mp). Palette already has --mg (green), --my (yellow), --mb (blue #4a90d9).
- `packages/client/src/components/compose/MateriaCanvas.tsx` — LoadoutListPanel builds agentRoots+orphanSkills tree. Duplicate bug: skills connected to multiple agents appear as children of each agent. React Flow canvas with proximity linking, DOM-level orb animations.
- `packages/client/src/components/compose/MateriaNode.tsx` — Pure orb component; isOrchestrator flag drives size+shadow variant.
- `packages/shared/src/schemas.ts` — LoadoutSchema has {name, agents, skills, hooks, createdAt, connections}. No card metadata field yet.
- `packages/server/src/router.ts` — 12 procedures; loadout.save/list handle LoadoutSchema. No config endpoint.
- `packages/client/tests/e2e/loadout-list-panel.spec.ts` — Tests check for `[aria-label="Select orchestrator on canvas"]` and `[data-testid="loadout-list-panel"]`. These will need updating when orchestrator becomes a card.

### Decomposition approach:

Item 5 (appearance config file) is deferred as its own task — it adds server-side file I/O, a new tRPC endpoint, and a runtime config injection path that is fully orthogonal to the visual redesign. Deferring keeps the core 4-item sprint coherent and reduces risk of cross-cutting failures.

**Domain analysis:**
- DS: LoadoutSchema needs `cardTitle` optional field (backwards-compatible). CanvasNode needs `role` field. Both are schema-only changes with no migration (JSON files, not a relational DB).
- BE: No backend changes needed for core 4 items (loadout.save already accepts LoadoutSchema; schema extension is additive and Zod `.default()` handles old files gracefully).
- FE: 4 distinct surfaces to rebuild — (1) canvas-store.ts role field + card logic, (2) CardNode component (new), (3) MateriaCanvas orb-on-card layout + proximity changes, (4) LoadoutListPanel rewrite.

**Wave plan:**
- Wave 1: DS (shared schema + canvas-store types) — both are non-UI and must land first.
- Wave 2: FE-A (canvas-store.ts update + CardNode component) — depends on DS types being finalized.
- Wave 3: FE-B (MateriaCanvas layout: orbs positioned on card, card as background node, proximity within card bounds) — depends on FE-A (CardNode exists, store has role).
- Wave 4: FE-C (LoadoutListPanel rewrite — no-duplicate, role-color, card as header) — depends on FE-B (card node type exists in store, getMateriaColor updated for role).

Note: The existing e2e test `loadout-list-panel.spec.ts` checks `aria-label="Select orchestrator on canvas"`. This will break when the orchestrator becomes a card node. FE-C must update that spec.

### Config file task (deferred):
Will be written as a standalone task packet `gander-studio-p2-agent-cards-005` but flagged as deferred — not in this sprint's execution wave.

---

## Checkpoint: Task packets drafted
- DS-001 (schema extension)
- FE-001 (store + CardNode)
- FE-002 (MateriaCanvas layout)
- FE-003 (LoadoutListPanel + e2e spec update)
- DEFERRED-001 (appearance config file)

---

## [STAGE 3] COMPLETE
**ts:** 2026-03-30T00:05:00Z
**output_files:**
- /home/jhber/projects/gander-studio-alpha/docs/agent-logs/PM/gander-studio-p2-agent-cards.md
- /home/jhber/projects/gander-studio-alpha/.claude/agents/tasks/gander-studio-p2-agent-cards.md
- /home/jhber/projects/gander-studio-alpha/docs/task-registry.md (updated)
