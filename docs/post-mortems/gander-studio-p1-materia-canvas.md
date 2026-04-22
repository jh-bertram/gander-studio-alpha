# Post-Mortem: Gander Studio P1 — Materia Canvas
**Date:** 2026-03-17
**Project:** `~/projects/gander-studio-alpha/`
**Duration:** ~2 hours (2026-03-16T09:05:00Z → 2026-03-17T00:55:00Z; RA output timestamped next day)
**Final State:** Materia canvas feature shipped — `MateriaCanvas.tsx`, `MateriaNode.tsx`, `canvas-store.ts`, `canvas.ts`, `ComposePage.tsx` wiring. One audit FAIL (JSON.parse) resolved in one remediation cycle. All SA/QA/SX gates PASS at close.

---

## 1. Original Request

**Human (2026-03-16):** Build a visual canvas for the Compose page where agents and skills appear as glowing FF7-style materia orbs and can be linked by dragging one on top of another.

**Brief file:** `.claude/agents/tasks/outputs/gander-studio-p1-materia-canvas-PM-1742083200.md` (v1), `.../gander-studio-p1-materia-canvas-PM-rev1-1742083800.md` (rev1)

**Scope at intake:**
- `ComposePage.tsx` existed with a slot-list + item-browser panel layout
- No canvas library installed (`@xyflow/react` absent from `packages/client/package.json`)
- No canvas Zustand store — compose-store existed for loadout name/hooks only
- Six new files to create; one existing file (`ComposePage.tsx`) to significantly rework
- Three-unit chain interaction frontmatter writing explicitly deferred to a follow-up sprint

**Skill invoked:** `dispatch-task`

---

## 2. Agent Activity Log

### Phase 0 — Planning + Critique Cycle 1 (BLOCK)

| Seq | Timestamp | Event | Agent | Notes |
|-----|-----------|-------|-------|-------|
| 7 | 2026-03-16T09:05:00Z | SPAWN | PM#0 | Decompose P1 into 3 FE tasks |
| 11 | 2026-03-16T09:05:30Z | COMPLETE | PM#0 | Task decomposition v1 |
| 13 | 2026-03-16T10:00:05Z | SPAWN | CR#1 | Critique v1 plan |
| 14 | 2026-03-16T10:10:00Z | CRITIQUE_BLOCK | CR#1 | 4 blockers identified |
| 15 | 2026-03-16T10:15:00Z | REVISION | PM#0 | PM dispatched to revise |

**Feedback loops:** 1 planning revision — the first PM plan was blocked before any implementation started.

**Root causes of 4 blockers:**
1. **React 19 compat unverified** — PM assumed `@xyflow/react` v12 supports React 19 without evidence. No RA task was included. Critic required a gate before implementation.
2. **FE-canvas overscoped 4-8x** — Single task covered MateriaCanvas, MateriaNode, canvas.ts, drag-from-palette, edge creation, CSS isolation, zoom controls — 7 distinct units in one agent turn. Critic required three sequential sub-tasks.
3. **Hook type undefined** — PM spec included `'hook'` in `CanvasNode.type` union but provided no spec for how hook matchers map to node labels, positions, or visual rendering. Human clarification resolved it: hooks off canvas.
4. **handleSave/ValidationWarnings underspecified** — `selectLoadoutPayload` lacks the `name` field, so the save payload source for `name` was not explicit. An implementing agent would have dropped it or guessed wrong.

### Phase 1 — Planning Revision + Critique Cycle 2 (PASS)

| Seq | Timestamp | Event | Agent | Notes |
|-----|-----------|-------|-------|-------|
| 16 | 2026-03-16T10:30:00Z | SPAWN | RA#1 | compat pre-flight before all canvas work |
| 17 | 2026-03-16T10:30:00Z | COMPLETE | PM#0 | Rev1 decomposition: 6 tasks, strict chain |
| 18 | 2026-03-16T10:42:00Z | CRITIQUE_PASS | CR#2 | 2 warnings (not blockers) |

**Feedback loops:** 0 — revision passed on first attempt.

**CR#2 warnings not acted on before dispatch:**
1. `getMateriaColor` DRY violation — PM added a second `getMateriaColor` to `canvas.ts` when `compose.ts` already exported one with identical logic. CR#2 flagged it as a WARNING with Option A (import from compose.ts) and Option B (import from compose.ts in MateriaNode.tsx directly). The PM did not update the spec. The FE agents resolved it themselves — the auditor confirmed `getMateriaColor` was imported from `constants/compose.ts` and only referenced as a comment in `canvas.ts`. DRY violation avoided in practice, but not because the spec required it.
2. **Canvas-c Playwright coverage gap** — `p1-mc-FE-canvas-c` had no test coverage for the drag-to-canvas and drop-on-top-linking interactions it introduced. CR#2 flagged this as WARNING. Not added to success criteria. The Playwright spec from canvas-b covers mount only; canvas-c interactions remain untested.

### Phase 2 — Implementation (Sequential FE chain)

| Seq | Timestamp | Event | Agent | Notes |
|-----|-----------|-------|-------|-------|
| 5 | 2026-03-16T00:20:00Z | SPAWN | RA#1 | xyflow/React 19 compat research |
| 21 | 2026-03-17T00:00:05Z | COMPLETE | RA#1 | research_dossier: compat confirmed |
| 6 | 2026-03-16T00:25:00Z | SPAWN | FE#1 | p1-mc-FE-store |
| 22 | 2026-03-16T00:03:00Z | COMPLETE | FE#1 | canvas-store.ts — first pass, clean |
| 7 | 2026-03-16T00:30:00Z | SPAWN | FE#2 | p1-mc-FE-canvas-a |
| 23 | 2026-03-16T00:35:00Z | COMPLETE | FE#2 | MateriaNode.tsx + canvas.ts — first pass, clean |
| 8 | 2026-03-16T00:35:00Z | SPAWN | FE#3 | p1-mc-FE-canvas-b |
| 9 | 2026-03-16T00:05:00Z | COMPLETE | FE#3 | MateriaCanvas.tsx skeleton + Playwright spec |
| 9 | 2026-03-16T00:40:00Z | SPAWN | FE#4 | p1-mc-FE-canvas-c |
| 10 | 2026-03-16T00:45:00Z | COMPLETE | FE#4 | Palette + drop-on-top edges added |
| 10 | 2026-03-16T00:45:00Z | SPAWN | FE#5 | p1-mc-FE-wire |
| 1 | 2026-03-16T00:05:00Z | COMPLETE | FE#5 | ComposePage.tsx wired, all 3 tsc clean |

**Feedback loops:** 0 — all six implementation tasks completed on first attempt.

### Phase 3 — Audit + Remediation

| Seq | Timestamp | Event | Agent | Notes |
|-----|-----------|-------|-------|-------|
| 11 | 2026-03-16T00:50:00Z | SPAWN | AUD#1 | Full changeset audit |
| 32 | 2026-03-17T00:48:59Z | AUDIT_FAIL | AUD#1 | JSON.parse at MateriaCanvas.tsx:350 — no try/catch, no schema validation |
| — | — | REMEDIATE | FE | Wrap in try/catch, add shape-validation guard |
| 33 | 2026-03-17T00:50:47Z | AUDIT_PASS | AUD#1 | Remediation confirmed |
| 12 | 2026-03-16T00:55:00Z | AUDIT_PASS | AUD#1 | Sprint closed |

**Feedback loops:** 1 — one audit fail, one remediation, one re-audit. Clean on re-check.

**Root cause of audit FAIL:** FE-canvas-c implemented the drag-to-canvas drop handler calling `JSON.parse(e.dataTransfer.getData(...))` at line 350. No try/catch, no input validation — the result was cast directly with `as` and used to create a canvas node. This crashes the React tree on malformed input and bypasses Zod validation at an external data boundary. Neither the task spec nor the WARNINGs from CR#2 flagged this specific pattern. The `as` cast was accepted in the agent's static review as "typed" when it was in fact unvalidated.

---

## 3. Post-Delivery: Runtime Bugs

### Orchestrator Directly Fixing Bugs Instead of Assigning

**Reporter:** Human (post-sprint feedback)
**Symptom:** When runtime bugs surface during browser verification after sprint close, the Orchestrator is personally remediating them inline rather than delegating to an implementing agent.
**Detected:** Human observation of session behavior

**Root cause:** No protocol exists specifying that post-audit runtime bugs route through the Orchestrator *as a dispatcher*, not as a fixer. The Orchestrator sees the bug with full context and has been reaching into the code to fix it directly. But the Orchestrator's role is coordination and routing — not code changes. With a full context window, the Orchestrator is best positioned to write a sharp, targeted brief for a subagent — not to be the one doing the edit.

**Why agents did not catch this:** This is a workflow protocol gap, not a code bug. The audit pipeline ends at AUDIT_PASS. There is no documented step describing who routes browser-discovered bugs and how. The implicit default became "whoever discovers it fixes it."

**Correct protocol:** When the Orchestrator discovers a runtime bug during or after browser verification:
1. Name the bug precisely (file, symptom, suspected cause)
2. Spawn the appropriate implementing agent (BE or FE) with a targeted brief that contains just enough context for a fresh agent to reproduce and fix the bug
3. Route through audit as normal
4. Log the fix before sprint close

The Orchestrator should never modify application source code.

---

## 4. QA Gap Analysis

**Current QA protocol:** Auditor runs static SA (code patterns, Zod, A11Y), static QA (functional correctness by code read), SX (security scan), and Playwright spec review. Browser verification is performed by the Orchestrator post-audit.

**What this caught:**
- JSON.parse without try/catch — caught at SA + SX gates (same root, both flagged it)
- No raw hex color values — confirmed by grep
- React Flow CSS not imported globally — confirmed by grep
- Hooks not on canvas — confirmed by type-check of `selectLoadoutPayload` return
- All data-testid attributes present — confirmed by targeted grep
- `handleSave` data sources correct — confirmed by code read

**What this missed:**
- **Interactive surface test coverage for canvas-c** — drag-to-canvas and drop-on-top-link are untested in the Playwright spec. The spec only covers mount (orchestrator node visible) and no-console-errors. CR#2 flagged this as a WARNING but it was not enforced as a success criterion. The auditor passed QA without requiring coverage of the two key interactions the canvas-c task introduced.
- **Orchestrator-as-fixer pipeline gap** — no QA step checks whether the Orchestrator is doing agent work.

**Recommendations:**
1. CR and PM specs for interactive tasks must include Playwright test coverage for every *new interactive flow*, not just mount. A new interactive flow without a test case is an incomplete deliverable.
2. Add to audit pipeline close-out: if browser verification is pending, the audit PASS is conditional — the sprint is not closed until Orchestrator confirms no runtime bugs AND any bugs found are routed to an agent (not fixed inline).

---

## 5. Agent Performance Summary

| Agent | Tasks | First-pass rate | Notes |
|-------|-------|----------------|-------|
| PM#0 | 2 (v1 + rev1) | 50% | v1 blocked on 4 structural issues; rev1 passed |
| CR#1 | 1 | 100% | All 4 blockers correctly identified; BLOCK was the right call |
| CR#2 | 1 | 100% | 2 warnings correctly identified; neither was enforced before dispatch |
| RA#1 | 1 | 100% | React 19 compat confirmed cleanly |
| FE#1–5 | 6 | 100% | All implementation tasks passed on first attempt |
| AUD#1 | 2 (initial + re-audit) | 50% (initial FAIL) | Correct finding; single-issue; clean on re-check |

**Most impactful single agent action:** CR#1's CRITIQUE_BLOCK on v1 — catching 4 structural issues before any code was written prevented what would have been 4+ audit failures mid-implementation (overscope, wrong hook typing, missing name source in save payload, unverified library compat).

**Recurring failure pattern:** CR warnings that are not BLOCKERs are not being enforced. Both CR#2 warnings (getMateriaColor DRY, canvas-c test coverage) were correct and actionable. Neither made it into success criteria. The DRY issue was coincidentally avoided by the FE agent's independent judgment; the test coverage gap shipped as-is.

---

## 6. Protocol Gaps Identified

| Gap | Impact | Suggested fix |
|-----|--------|---------------|
| CR WARNINGs are advisory only — no enforcement path | Gaps identified by Critic before dispatch ship as-is when not BLOCKERs | PM must address all WARNINGs (not just BLOCKERs) before dispatching. In the rev1 plan, CR#2 found two WARNING-level gaps; neither was added to success criteria. Treat WARNINGs as deferred BLOCKERs: if the PM cannot resolve them before dispatch, escalate to human for decision. |
| Orchestrator fixes runtime bugs directly instead of routing to agents | Orchestrator context window consumed on code edits; audit trail incomplete; no agent output packet for the fix | Add explicit step to post-audit browser verification protocol: discovered bugs → Orchestrator writes targeted brief → spawns FE/BE agent → routes through audit → archivist logs. Orchestrator must not touch application source code under any circumstances. |
| Canvas-c interactive flows (drag-to-canvas, drop-on-top-link) have no Playwright test coverage | Two primary interactions of the feature are untested; regressions will be invisible | Add to PM decomposition standard: any task that introduces a new user-facing interaction (drag, drop, click action, edge creation) must include Playwright test coverage as a success criterion. The auditor's QA gate must reject any interactive task whose spec lacks test coverage for its primary interactions. |
| `JSON.parse` on external data (drag DataTransfer) without try/catch or schema validation | Crash on malformed input; arbitrary strings propagate to save payload | Add to FE agent pre-flight checklist: any call to `JSON.parse` on data from `dataTransfer`, `localStorage`, URL params, or other external sources requires (a) try/catch and (b) schema validation before use. Auditor SX gate should grep for `JSON.parse` without adjacent `try` in all submitted files. |

---

## 7. Final Deliverable State

**App/Service:** `~/projects/gander-studio-alpha/`
**Build:** tsc --noEmit passes all three packages (shared, server, client); 0 errors
**Runtime:** Confirmed working — materia canvas renders; orchestrator node present on mount; palette drag, proximity linking, and zoom controls functional

**Features delivered:**
- `canvas-store.ts` — Zustand store with node/edge state, two-ring auto-layout, orchestrator guard
- `MateriaNode.tsx` — Circular orb node with FF7R color theming, hover remove button, no React Flow Handles
- `constants/canvas.ts` — All canvas magic values extracted (orb sizes, proximity threshold, layout radii, etc.)
- `MateriaCanvas.tsx` — React Flow canvas with: static node rendering, palette sidebar (drag-to-canvas), drop-on-top proximity edge creation, zoom controls, `@xyflow/react` CSS scoped to component
- `materia-canvas.spec.ts` — Playwright smoke test (orchestrator node visible, no console errors)
- `ComposePage.tsx` — Reworked: item-browser panel removed; MateriaCanvas wired; handleSave/Load/New updated to use canvas-store payload; ValidationWarnings uses canvas node counts

**Key contracts:**
- `selectLoadoutPayload(state)` → `{ agents: string[], skills: string[], hooks: string[] }` — hooks always `[]`; hooks sourced from compose-store on save
- `loadFromLoadout({ agents, skills, hooks })` — `hooks` param accepted, ignored; places orchestrator at center + agents on inner ring (r=220) + skills on outer ring (r=380)
- `ORCHESTRATOR_ID = 'orchestrator'` — guarded against removal in store; rendered 20% larger in MateriaNode
- `getMateriaColor` imported from `constants/compose.ts`, not re-implemented in `canvas.ts`
- `@xyflow/react` CSS imported only in `MateriaCanvas.tsx:5` — not global
- Three-unit chain interaction frontmatter writing deferred to `p1-mc-follow-up-interactions` (next sprint)
