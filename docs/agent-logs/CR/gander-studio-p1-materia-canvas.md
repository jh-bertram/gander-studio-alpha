# CR Agent Log — gander-studio-p1-materia-canvas

## Stage 1 — RECEIVED
**Task:** Critique PM plan for sprint `gander-studio-p1-materia-canvas`
**Time:** 2026-03-16T10:05:00Z
**Agent:** CR#1

---

## Stage 2 — PLAN

Six challenge dimensions to evaluate:
1. DEPENDENCY — sequencing errors between tasks
2. MISSING_RESEARCH — external unknowns (@xyflow/react compatibility, React 19)
3. OVERSCOPED — tasks exceeding ~50-line commit limit
4. ASSUMPTION — unstated beliefs that may be wrong
5. AUDIT_RISK — patterns that will fail the auditor based on post-mortems
6. SCOPE_DRIFT — plan vs human request divergence

Files to read:
- `packages/client/src/pages/ComposePage.tsx` — understand existing structure being replaced
- `packages/client/src/store/compose-store.ts` — understand existing store interface
- `packages/shared/src/schemas.ts` — understand LoadoutSchema for selectLoadoutPayload
- `packages/client/src/constants/compose.ts` — understand getMateriaColor() contract
- `packages/client/package.json` — confirm @xyflow/react is absent, check React version
- `packages/client/vite.config.ts` — CSS isolation concerns
- `docs/post-mortems/gander-studio-p2-p3.md` — recurring failure patterns
- `docs/agent-changelog.md` — recent fixes (not present)
- `.claude/rules/standards.md` — audit rules (not present, using CLAUDE.md standards)

---

## Dimension 1 — DEPENDENCY
Checkpoint: EVALUATED. Sequential order (store → canvas → wire) is correct. No sequencing errors found.

## Dimension 2 — MISSING_RESEARCH
Checkpoint: BLOCKER FOUND.
- @xyflow/react is not in package.json. React 19 compatibility with @xyflow/react not verified.
- @xyflow/react requires its own CSS import (`@xyflow/react/dist/style.css`). The plan acknowledges this but does not specify *how* CSS isolation is achieved. Lazy import in the component file is the only viable pattern; plan doesn't mandate it.

## Dimension 3 — OVERSCOPED
Checkpoint: BLOCKER FOUND.
- p1-mc-FE-canvas creates 3 files (MateriaCanvas.tsx, MateriaNode.tsx, canvas.ts) AND installs a new library AND implements drag-from-palette, edge-drawing, zoom controls, and node coloring. This is 5-7 distinct implementation units in a single task. Will breach 50-line limit.

## Dimension 4 — ASSUMPTION
Checkpoint: BLOCKERS FOUND.
- Plan assumes `selectLoadoutPayload` returns `{ agents, skills, hooks }` as string arrays matching LoadoutSchema. But LoadoutSchema uses `agents: z.array(z.string())` (names). The existing `handleSave` in ComposePage passes `currentLoadout.agents` (strings). The canvas store's CanvasNode holds `name` and `type`. The selector must derive string arrays from nodes — this logic is non-trivial and unspecified.
- Plan says p1-mc-FE-wire uses `canvasStore.loadFromLoadout` to handle a `Loadout` object. But `LoadoutSchema` has `createdAt: z.string()` — `loadFromLoadout` receives a full Loadout but the canvas store scope section only mentions `{ agents, skills, hooks }` node types. How hooks are represented as CanvasNodes is completely unspecified (HookSchema uses `matcher` not `name`). This mismatch will cause a type error.
- Plan assumes `orchestrator` will be in the agent list at mount time (from tRPC). The store task seeds an orchestrator node in initial state at {x:0,y:0} with no data from the server. There is no mechanism specified to hydrate this initial node with real agent data (description, type, tier) before tRPC resolves.

## Dimension 5 — AUDIT_RISK
Checkpoint: Patterns noted from post-mortem.
- Post-mortem §5 recurring pattern: PM wrote plans without reading referenced source files. Applies here — the `ValidationWarnings` component in ComposePage currently receives computed `string[]` from `useValidationWarnings(agents, skills, hooks, name, nameDirty)`. The p1-mc-FE-wire task says "ValidationWarnings counts from canvas store" — this is ambiguous; the existing hook signature takes arrays, not counts. Task doesn't say whether the hook is rewritten or the component API changes.
- No Playwright spec coverage specified for any task. Standards require Tier 2 spec for new UI surfaces.

## Dimension 6 — SCOPE_DRIFT
Checkpoint: WARNING FOUND.
- Human asked for agents/skills linked "by dragging one on top of another." The plan implements Handle-to-Handle edge creation (React Flow source/target handles). This is a reinterpretation. The human's "drop one on top of another" pattern is not handle-to-handle — it's proximity/collision detection. This is a different UX model. Needs PM confirmation.

---

## Stage 3 — COMPLETE
All six dimensions evaluated. Two BLOCKERs confirmed.
