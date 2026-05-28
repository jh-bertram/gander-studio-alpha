---
type: orchestrator-brief
sprint_id: prog-studio-sessions-2026-05-s3-analyze
program_id: prog-studio-sessions-2026-05
status: PLANNED
---

# Orchestrator Brief — S3: Analyze (Visualization + Picker)

## Sprint ID
`prog-studio-sessions-2026-05-s3-analyze`

## Program ID
`prog-studio-sessions-2026-05`

## Goal

Build the analysis surface for a session: a "set the table" picker (which session, which agents, which metrics, which dimensions) and a "see how it played out" rendering — timeline of agent spawns/completions, per-agent stat panels, and a sortable stat table. Fills the "Analyze" tab slot reserved by S2.

## Sibling Awareness

**Sibling sprints in this program:**
- `prog-studio-sessions-2026-05-s1-backend` — Backend + Parsers + Schemas. **Must complete before this sprint starts.**
- `prog-studio-sessions-2026-05-s2-list-edit` — Frontend list + viewer + markdown editor. **Must complete before this sprint starts** (owns the Sessions nav mode and reserves the Analyze slot).
- `prog-studio-sessions-2026-05-s3-analyze` (this sprint).

**DAG edges involving this sprint:**
- Incoming: `s1-backend → s3-analyze` (consumes `SessionStatsSchema` + `session.getStats`).
- Incoming: `s2-list-edit → s3-analyze` (fills the Analyze slot S2 reserved).
- Outgoing: (none — terminus).

**Integration seams consumed by this sprint:**
- `s1-to-s3-stats-schema` — Imports `SessionStatsSchema` types via `z.infer`.
- `s1-to-s3-trpc-stats` — Calls `session.getStats` via the typed tRPC client. **Never re-aggregate in the client.** If a needed aggregation is missing, route a `<dag_update_request>` back to S1.
- `s2-to-s3-nav-slot` — Edits `packages/client/src/constants/navigation.ts` to flip the Analyze slot's `placeholder: true → false` and bind the component path.

## Inputs

- S1 contracts: `SessionStatsSchema`, `session.getStats` tRPC procedure.
- S2 contract: the Sessions nav mode + reserved Analyze tab slot.
- Existing design tokens: `packages/client/src/globals.css`.
- Reference: `~/.claude/refs/dashboard-patterns.md` for chart / timeline patterns; `${GANDER_ROOT}/docs/team-report.html` as a structural model for inline-SVG visualization.
- Existing visualization conventions, if any, in `packages/client/src/components/`.

## Outputs

Files this sprint creates or modifies:
- `packages/client/src/pages/sessions/tabs/AnalyzeTab.tsx` — top-level analysis surface; wires picker + visualization.
- `packages/client/src/components/sessions/SessionPicker.tsx` — "set the table" picker (session selector + agent multi-select + metric dimension toggles).
- `packages/client/src/components/sessions/AgentTimeline.tsx` — inline-SVG timeline of SPAWN → COMPLETE bars per agent.
- `packages/client/src/components/sessions/AgentStatPanel.tsx` — per-agent stat card (count, feedback loops, wall-clock).
- `packages/client/src/components/sessions/AgentStatTable.tsx` — sortable table with the same data, alternative view.
- `packages/client/src/store/analyzeStore.ts` — Zustand slice for picker state (selected session, selected agents, selected metrics).
- `packages/client/src/constants/navigation.ts` — flip Analyze slot from placeholder to wired component.

## Cross-Sprint Invariants

(verbatim from `program.md`)

1. Session Zod schema is the single source of truth; types via `z.infer`.
2. Save-to-new-folder — N/A for this sprint (read-only).
3. Nav slot — edit only the Analyze entry S2 reserved; do not re-declare the Sessions mode.
4. Design tokens — all chart colors, axis colors, typography choices reference `globals.css`. No ad-hoc hex.
5. TypeScript strict — all components fully typed.

## Success Criteria (Sprint-Level)

1. **Analyze tab wired.** Clicking the Analyze tab on a session detail page renders `AnalyzeTab`. The reserved placeholder is fully replaced; the disabled tooltip is gone.
2. **Picker works.** `SessionPicker` lets the user (a) confirm or swap which session is loaded, (b) select a subset of agents (multi-select with all/none toggles), (c) select which metrics to show (count, feedback loops, wall-clock — at minimum). Picker state persists in `analyzeStore` for the active session of app use; not persisted across reloads.
3. **Timeline renders.** `AgentTimeline` renders one row per selected agent showing SPAWN-to-COMPLETE bars on a shared timeline x-axis. Hover/focus surfaces seq + edge_label. Inline SVG (no chart library) — Mako Teal palette only.
4. **Stat panels render.** For each selected agent, an `AgentStatPanel` card shows count, feedback loops, total wall-clock, and audit-attribution summary if available. Panels reflow responsively (CSS grid, no fixed columns).
5. **Stat table renders.** `AgentStatTable` is the sortable-table alternative to the panels; columns: agent, count, feedback loops, wall-clock, audit pass/fail. Sort by any column.
6. **Round-trip works.** The user can change picker state and watch the visualization update without leaving the tab. The "back and forth" loop the human described (set-the-table ↔ see-how-it-played-out) is exercised in the smoke walkthrough.
7. **A11Y.** Timeline has `role="img"` + `aria-label` describing the data. Stat panels are keyboard-navigable. Color is never the sole differentiator (every bar carries a text label).
8. **Lint + type clean.** `npm run lint` clean.
9. **Manual smoke (Step 4.5).** Browser walkthrough confirms: Analyze tab loads, picker changes update the visualization, no console errors. Existing Browse / Compose / Edit / Export and S2's Sessions list/edit still load.

**Out of scope:**
- Charting library adoption (recharts, visx). Inline SVG is the convention.
- Cross-session comparison view. If the human asks, log as deferred.
- Editing analysis dimensions globally (i.e., default-picker config). Picker state is per-session this sprint.
- The proximity edge regression bug (carry-forward).

## Routing Hints

- **UI Designer first** (small spec for picker + timeline + stat panel — cite dashboard-patterns).
- **FE agent** (split into picker, timeline, stat surfaces).
- **Audit pipeline** after each FE packet.
- **Foreground dispatch.**
- **Step 4.5 human verification** REQUIRED.

## Notes for the PM

- Decompose into ≤ 6 task packets. Suggested: (a) UI design spec, (b) picker + analyze store, (c) timeline component, (d) stat panel + table, (e) Analyze tab integration + nav-slot flip, (f) smoke + a11y check.
- Cite `~/.claude/refs/dashboard-patterns.md` for any pattern (Timeline, StatCard) — do NOT excerpt token values inline (prompt-vs-contract drift rule).
- If S1 did not publish a needed aggregation (e.g., per-edge-label counts the picker exposes), route a `<dag_update_request>` back to S1 before authoring local-aggregation code.
- Run `convention-detect` at Step 0.5.
- Run `env-preflight` before any FE wave with live API dependency.
