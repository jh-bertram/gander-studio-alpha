# PM Output (Revision 1) — gander-studio-p2-agent-cards
**task_id:** gander-studio-p2-agent-cards
**agent_id:** PM#0
**ts:** 2026-04-01T00:10:00Z
**revision:** 2 (addresses CR#1 CRITIQUE_BLOCK — 4 BLOCKERs, 3 WARNINGs)

---

## HCG Resolutions Applied

### HCG-1 — Appearance config file
Human confirmed: DEFERRED. DEFERRED-001 entry is unchanged and correct. This was an explicit
human deferral decision, not a silent PM omission. BLOCKER 1 (SCOPE_DRIFT) is resolved.

### HCG-2 — Color scheme
Human confirmed: 5-role system (not 3-role):

| Role | Color | CSS Token | Applies to |
|------|-------|-----------|------------|
| meta | Yellow | var(--my) | orchestrator, project-manager, dispatcher, household/coordination |
| specialist | Green | var(--mg) | implementing agents: FE, BE, DS, SX, and any primarily building/coding |
| gate | Red | var(--mr) | auditor, critic, code-auditor — quality gate agents |
| external | Purple | var(--mp) | researcher, statistician, ui-designer — agents that reach outside codebase |
| skill | Blue | var(--mb) | all skill nodes (type === 'skill') |

This maps cleanly to the existing 5 name sets in compose.ts:
- COMMAND_AGENTS (orchestrator, project-manager) → 'meta' → var(--my) [unchanged]
- IMPL_AGENTS (backend-engineer, frontend-engineer, db-specialist) → 'specialist' → var(--mg) [unchanged]
- GATE_AGENTS (auditor, critic, code-auditor) → 'gate' → var(--mr) [unchanged]
- INTEL_AGENTS (researcher, statistician, archivist) → 'external' → var(--mp) [color unchanged; role renamed]
- META_AGENTS (dispatcher, ui-designer, system-health-monitor) → 'external' → var(--mp) [same color]
- skills → 'skill' → var(--mb) [unchanged]

Note: INTEL_AGENTS and META_AGENTS both map to 'external' (var(--mp)) — this consolidates them
under one role concept. No agent loses its color; the type system gains a meaningful role name.

## Source files read before revision

- `packages/client/src/constants/compose.ts` — 5 existing agent sets confirmed (COMMAND, IMPL, GATE,
  INTEL, META). getMateriaColor signature: (name: string, type: 'agent'|'skill'|'hook') → string.
  No role param currently.

- `packages/client/src/store/canvas-store.ts` — CanvasNode: {id, name, type:'agent'|'skill', position}.
  No role field. INITIAL_ORCHESTRATOR confirmed at position {x:0,y:0}. loadFromLoadout destructures
  {agents, skills, connections}. No cardTitle in store state.

- `packages/client/src/constants/canvas.ts` — No CARD_* constants. LIST_CHILD_INDENT_PX=24.
  AGENT_RING_RADIUS_PX=220, SKILL_RING_RADIUS_PX=380 (matching canvas-store.ts values).

- `packages/client/src/components/compose/MateriaNode.tsx` — MateriaNodeProps confirmed:
  {name, type, isOrchestrator?, onRemove?, className?}. Calls getMateriaColor(name, type) at line 174.

- `packages/client/tests/e2e/loadout-list-panel.spec.ts` — 73 lines total, 3 tests.
  Tests reference aria-label="Select orchestrator on canvas" (lines 20, 39, 64).
  FE-003 spec after must be >= 73 lines.

---

## Task summary (revised)

| task_id | agent | wave | priority | depends_on |
|---|---|---|---|---|
| gander-studio-p2-agent-cards-DS-001 | DS | 1 | BLOCKER | none |
| gander-studio-p2-agent-cards-FE-001a | FE | 2 | HIGH | DS-001 |
| gander-studio-p2-agent-cards-FE-001b | FE | 3 | HIGH | FE-001a |
| gander-studio-p2-agent-cards-FE-002 | FE | 4 | HIGH | DS-001, FE-001a, FE-001b |
| gander-studio-p2-agent-cards-FE-003 | FE | 5 | HIGH | DS-001, FE-001a, FE-001b, FE-002 |
| gander-studio-p2-agent-cards-DEFERRED-001 | — | deferred | NORMAL | — |

See `/home/jhber/projects/gander-studio-alpha/.claude/agents/tasks/gander-studio-p2-agent-cards.md`
for full task packet definitions.

## COMPLETE event
{"seq":35,"ts":"2026-04-01T00:10:00Z","ev":"COMPLETE","task_id":"gander-studio-p2-agent-cards","agent_id":"PM#0","parent_id":"ORC#0","edge_label":"task_decomposition_rev1","output_files":[".claude/agents/tasks/outputs/gander-studio-p2-agent-cards-PM-002.md",".claude/agents/tasks/gander-studio-p2-agent-cards.md","docs/agent-logs/PM/gander-studio-p2-agent-cards-rev1.md"]}
