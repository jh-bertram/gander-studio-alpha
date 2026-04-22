# PM Log — gander-studio-p1-materia-canvas

## Stage 1 — RECEIVED (initial)
**ts:** 2026-03-16T09:00:00Z
**task_id:** gander-studio-p1-materia-canvas
**agent:** PM#0
**brief_source:** ORC#0

Goal: Overhaul ComposePage right-panel with an interactive drag-and-drop materia canvas using React Flow (@xyflow/react). Orchestrator node always centered on mount; palette sidebar for drag-to-canvas; nodes linkable by drag; SVG beam edges; canvas state syncs to compose-store for existing loadout.save flow.

---

## Stage 2 — PLAN (initial)
**ts:** 2026-03-16T09:00:30Z

### Consultation sub-agents
None spawned. Codebase is fully readable; @xyflow/react v12 API is well-documented and the brief already recommends it. No external API unknowns that require RA. No schema change requires DS consultation — decision is taken below.

### canvasState in LoadoutSchema: EPHEMERAL (no shared schema change)
Analysis: `LoadoutSchema` in `packages/shared/src/schemas.ts` is consumed by both the server (`router.ts`, `loadout.save` mutation, `loadout.list`) and client. Adding an optional `canvasState` field would require coordinated changes to the server JSON file format, the save/load tRPC path, and the shared package — all for data (node x/y positions) that has zero value outside of an active browser session.

Decision: node positions are **purely ephemeral client state** held in the canvas Zustand store slice. They are NOT persisted to disk or transmitted over tRPC. When a loadout is loaded, positions are auto-laid-out. The existing `LoadoutSchema`, `loadout.save` mutation, and `packages/shared` are untouched.

### Domains touched
- FE (2 tasks): canvas store slice + canvas component + ComposePage wiring
- No BE, no DS, no shared schema changes

### Dependency order
1. p1-mc-FE-store (canvas Zustand store) — no deps, pure state definition
2. p1-mc-FE-canvas (MateriaCanvas component + constants) — depends on store shape
3. p1-mc-FE-wire (ComposePage integration) — depends on canvas component existing, replaces slot panel

### Decomposition approach
Three FE task packets, sequenced. Could be collapsed to two (store+canvas together) but separating keeps each agent's context and changeset focused. The store is a clean unit of work with a clear interface contract the canvas component depends on.

---

### Checkpoint after task 1 drafted: p1-mc-FE-store — OK
### Checkpoint after task 2 drafted: p1-mc-FE-canvas — OK
### Checkpoint after task 3 drafted: p1-mc-FE-wire — OK

---

## Stage 3 — COMPLETE (initial)
**ts:** 2026-03-16T09:05:00Z

output_files:
- /home/jhber/projects/gander-studio-alpha/docs/agent-logs/PM/gander-studio-p1-materia-canvas.md
- /home/jhber/projects/gander-studio-alpha/.claude/agents/tasks/outputs/gander-studio-p1-materia-canvas-PM-1742083200.md
- /home/jhber/projects/gander-studio-alpha/docs/task-registry.md

---

---

## Stage 1 — RECEIVED (revision)
**ts:** 2026-03-16T10:20:00Z
**task_id:** gander-studio-p1-materia-canvas (revision request)
**agent:** PM#0
**brief_source:** ORC#0 → REVISION from CR#1 CRITIQUE_BLOCK

CRITIQUE_BLOCK received. Four blockers plus human authoritative answers to open questions Q1 (linking mechanic = drag-on-top proximity detection) and Q2 (hooks off canvas entirely for now). Revision required.

---

## Stage 2 — PLAN (revision)
**ts:** 2026-03-16T10:20:30Z

### Blocker resolution analysis

**BLOCKER 1 — React 19 compat:** Add RA pre-flight task p1-mc-RA-compat before all canvas work. If RA returns incompatibility, pivot to plain SVG approach.

**BLOCKER 2 — 50-line limit violation:** Split p1-mc-FE-canvas into three sub-tasks:
- p1-mc-FE-canvas-a: MateriaNode.tsx + canvas.ts constants only
- p1-mc-FE-canvas-b: MateriaCanvas.tsx skeleton, static rendering, Playwright smoke test
- p1-mc-FE-canvas-c: Palette sidebar + drag-to-canvas + drop-on-top edge creation + zoom controls

**BLOCKER 3 — Hook node type:** Remove 'hook' from CanvasNode.type union. Update p1-mc-FE-store spec. selectLoadoutPayload returns hooks: [] always. Compose-store hook state preserved unchanged on save.

**BLOCKER 4 — handleSave underspecified:** Spell out exact data sources in p1-mc-FE-wire:
- name from useComposeStore().currentLoadout.name
- agents + skills from selectLoadoutPayload(useCanvasStore.getState())
- hooks from useComposeStore().currentLoadout.hooks
- handleLoad: composeStore.loadLoadout({name, agents:[], skills:[], hooks: lo.hooks}) then canvasStore.loadFromLoadout(lo)

### agent.save interactions field — schema analysis
Reading router.ts: agent.save takes AgentSchema directly. AgentSchema has no interactions field.
Writing interactions frontmatter requires:
1. Adding InteractionSchema + interactions field to AgentSchema in packages/shared/src/schemas.ts
2. Updating agent.save frontmatter template in router.ts to emit interactions YAML block
3. A new BE task calling agent.save per participating agent after loadout save

This IS a meaningful cross-domain change (shared schema + server). Decision: OUT OF SCOPE for this sprint. Flag as p1-mc-follow-up-interactions in risk_flags. No BE task in this plan — canvas save writes name/agents/skills/hooks only (unchanged). Three-unit chain detection is a follow-up sprint.

### Revised dependency order
1. p1-mc-RA-compat (Research pre-flight — BLOCKER gate)
2. p1-mc-FE-store (canvas store, no hook type) [waits for RA PASS]
3. p1-mc-FE-canvas-a (MateriaNode + constants) [waits for store]
4. p1-mc-FE-canvas-b (MateriaCanvas skeleton + Playwright smoke) [waits for canvas-a]
5. p1-mc-FE-canvas-c (palette + drag + drop-on-top edges) [waits for canvas-b]
6. p1-mc-FE-wire (ComposePage wiring) [waits for canvas-c]

### Checkpoint: RA task drafted — OK
### Checkpoint: p1-mc-FE-store revised — OK
### Checkpoint: p1-mc-FE-canvas-a drafted — OK
### Checkpoint: p1-mc-FE-canvas-b drafted — OK
### Checkpoint: p1-mc-FE-canvas-c drafted — OK
### Checkpoint: p1-mc-FE-wire revised — OK

---

## Stage 3 — COMPLETE (revision)
**ts:** 2026-03-16T10:30:00Z

output_files:
- /home/jhber/projects/gander-studio-alpha/docs/agent-logs/PM/gander-studio-p1-materia-canvas.md
- /home/jhber/projects/gander-studio-alpha/.claude/agents/tasks/outputs/gander-studio-p1-materia-canvas-PM-rev1-1742083800.md
- /home/jhber/projects/gander-studio-alpha/docs/task-registry.md
