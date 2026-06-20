# Orchestrator Brief — prog-studio-vision-2026-06-s3-agent-os-legibility

- **Program:** `prog-studio-vision-2026-06` — Gander Studio Vision: Working Surfaces, Stable Tokens, Agent-OS Legibility, and Juice
- **Sprint:** `prog-studio-vision-2026-06-s3-agent-os-legibility` (tier 2)
- **Status:** PLANNED (not dispatched)

## Goal

Close the three highest-leverage, lowest-new-infra agent-OS gaps — a planning surface over deferred-work.md + task-registry.md, in-app program-DAG rendering reusing React Flow + dagre, and full event-type coverage in the Sessions timeline — each shipped with a legibility success criterion up front.

**Why a separate sibling / what eval findings it addresses.** The program's center of gravity under the vision lens, addressing the top three eval leverage gaps (#1 planning, #2 program DAGs, #3 timeline event types). It is purely additive (new procedures + new/extended read-only surfaces) and shares no mutating files with the bug-fix sprint. Depends on s1 for the token contract (new surfaces use ui/* primitives and must inherit legible tokens and budget a legibility SC) and on s2 for the feedback_loops contract (SEAM-04, read-only) and the canvas-store loadout-read convention (SEAM-05); since both s2 couplings are read-only/late-bindable, the s2->s3 edge enforces clean topo ordering of the feedback_loops contract without mid-sprint cross-talk. The timeline event-type expansion is the highest-leverage evaluation win with zero new data source (EventLogEntrySchema already accepts all ev; session.get already returns them). New procedures get paired Zod schemas; parsers use Promise.allSettled-and-skip robustness (eval: skill.list/hook.list currently 500 on one bad file).

## Sibling Awareness

All siblings in this program:

- `prog-studio-vision-2026-06-s1-token-root-fix` — Map the stock Shadcn base tokens onto FF7 values in globals.css :root and clear the standing WCAG-AA contrast debt, killing the invisible-text class at its root and publishing a stable token contract (plus a canonical agent role->color decision record) for every downstream ui/*-touching sprint.
- `prog-studio-vision-2026-06-s2-fix-broken-surfaces` — Make the broken surfaces actually work — rewire ExportPage to canvas-store with real connections, replace the EditPage save stub with real agent.save/skill.save mutations, stop Sessions editor cross-session buffer contamination, fix the prose-H1 zero-events slug bug, make session.saveEdit read its own writes back, and decide the feedback_loops semantics contract against real logs.
- `prog-studio-vision-2026-06-s3-agent-os-legibility` **(this sprint)** — Close the three highest-leverage, lowest-new-infra agent-OS gaps — a planning surface over deferred-work.md + task-registry.md, in-app program-DAG rendering reusing React Flow + dagre, and full event-type coverage in the Sessions timeline — each shipped with a legibility success criterion up front.
- `prog-studio-vision-2026-06-s4-juice-pass` — Propagate the delight trapped in the Compose canvas to the observability surfaces — ship a global MUTE control and prefers-reduced-motion guard FIRST, then role-colored timeline bars with FF7 tooltip and entrance animation on the expanded event substrate, a Progression character-sheet count-up/level-up moment, and mode-switch/save/export sounds — all suppressible and each gated by a legibility success criterion.
- `prog-studio-vision-2026-06-s5-cleanup-docs` — Pay down the Fable-verified cleanup and stale-docs debt as a discrete, grep-auditable lane — land the safe deletions and non-correctness-sensitive DRY merges, reclassify build tooling to devDependencies, close the DEFERRED-002 ledger entry, and refresh CLAUDE.md to the real 20 procedures and full surface set.

**DAG edges involving this sibling:**
- depends_on: `prog-studio-vision-2026-06-s1-token-root-fix`, `prog-studio-vision-2026-06-s2-fix-broken-surfaces`
- provides_to: `prog-studio-vision-2026-06-s4-juice-pass`

**Integration seams this sibling CONSUMES (inputs from upstream siblings):**

- `SEAM-02` ← from `s1-token-root-fix`: FF7 token contract + DESIGN.md token-mapping decision record + the wired component-contrast-smoke gate
  - format: globals.css :root custom properties + DESIGN.md markdown stanza + the contrast-smoke e2e spec
  - contract: s3's new surfaces (PlanningPage, in-app program-DAG, expanded timeline) consume the token contract exclusively (no raw hex), inherit AA-legible text-on-dark, and MUST keep the component-contrast-smoke gate green; s3 does not modify the mapping, only consumes it.
- `SEAM-04` ← from `s2-fix-broken-surfaces`: feedback_loops accumulator semantics contract
  - format: A markdown contract note (decision record) derived from real docs/events/*.jsonl + the reconciled rule implemented identically in parseAgentActivity (session-parser.ts) and computeSessionStats (session-stats.ts)
  - contract: s3's timeline/stats displays read feedback_loops as the single s2-decided value; s3 MUST NOT re-derive or re-define feedback_loops, only consume the ratified definition so no surface shows a divergent number. Read-only soft dependency bindable last — s3 can build its surfaces in parallel and wire the feedback_loops value once the contract is recorded.

**Integration seams this sibling OWNS (outputs downstream siblings rely on):**

- `SEAM-06` → to `s4-juice-pass`: AgentTimeline full-ev-type event substrate + the event-type-to-visual-role data model
  - format: AgentTimeline.tsx rendering all EventLogEntry ev types (SPAWN/COMPLETE/AUDIT_FAIL/CRITIQUE_BLOCK/RESUME/...) as distinct markers within the plot-area/RIGHT_PAD no-clip contract, with documented per-event-type encoding and boundingBox()-based e2e geometry assertions
  - contract: s4's timeline juice (role-colored bars, marching-ants orphans, entrance, FF7 tooltip, playhead) decorates the s3 substrate ON TOP, without removing/hiding any event type or regressing legibility; s4 MUST preserve the no-clip contract, the DEFERRED-002 zoom clamp, and the s3 legibility SC and boundingBox() geometry assertions, adding only suppressible presentation.

## Inputs

- docs/deferred-work.md, docs/task-registry.md (planning data sources)
- docs/programs/*/program.md, docs/programs/prog-studio-sessions-2026-05/program.md (program DAG source)
- packages/client/src/pages/GraphPage.tsx (React Flow + dagre layoutGraph/nodeTypes, connectivity-graph)
- packages/client/src/components/sessions/AgentTimeline.tsx (SPAWN/COMPLETE only; plot-area/RIGHT_PAD contract, DEFERRED-002 clamp)
- packages/shared/src/schemas.ts (EventLogEntrySchema accepts all ev; SessionSchema; ConnectivityGraph shape)
- packages/server/src/router.ts (getGraph pattern, session.get events array, skill.list/hook.list Promise.all)
- globals.css FF7-mapped token contract (SEAM-02 from s1)
- feedback_loops contract note (SEAM-04 from s2, read-only)
- Eval section 2 leverage gaps #1/#2/#3

## Outputs (declared — these become skein's post-execution check inputs)

- planning.list + program.getDag tRPC procedures with Zod input/output schemas
- PlanningPage surface + in-app program-DAG render (additive route + nav)
- AgentTimeline rendering all real ev types (the juice-ready event substrate, SEAM-06 to s4)
- Hardened skill.list/hook.list + export.spawn containment
- e2e specs (react-flow-render-smoke, boundingBox geometry) for the new surfaces

## Proposed Task Packets (PM refines at sprint start)

- **s3-p1** [backend-engineer] — Add a planning.list tRPC procedure (input+output Zod schemas in schemas.ts; types via z.infer) parsing docs/deferred-work.md ('Schedule as:' lines, DONE markers, status) and docs/task-registry.md (per-sprint goal/status/rollback) into a structured PlanningBacklog; use Promise.allSettled-and-skip so one malformed file does not 500.
- **s3-p2** [backend-engineer] — Add a program.getDag tRPC procedure (input+output Zod schemas) parsing docs/programs/*/program.md roster/depends_on/tiers/integration-seams into a ProgramDag node/edge shape compatible with the existing GraphPage dagre layout pipeline (reuse the ConnectivityGraph-style shape); tolerate missing/partial program files.
- **s3-p3** [frontend-engineer] — Build a PlanningPage surface (additive bottom-tab-bar entry) rendering PlanningBacklog grouped by sprint/status with drill-down to item detail per the human's declutter preference; budget the legibility SC (readable status badges/labels, no clipping, AA contrast, managed density) and inherit the s1 FF7 token contract.
- **s3-p4** [frontend-engineer] — Render program DAGs in-app: feed program.getDag into the shipped React Flow + dagre stack (reuse GraphPage's layoutGraph/nodeTypes) as an additive mode/sibling route (NOT replacing GraphPage's connectivity-graph behavior) showing tiers/depends_on/seams with legible labels and hover/select; assert SVG node/edge geometry via boundingBox() (no width arithmetic).
- **s3-p5** [frontend-engineer] — Expand AgentTimeline.tsx to render ALL EventLogEntry ev types present in real logs (AUDIT_FAIL, CRITIQUE_BLOCK, RESUME, etc. — up from 2) as distinct legible markers/lanes; preserve the documented plot-area/RIGHT_PAD no-clip contract and DEFERRED-002 zoom clamp; respect the s2 feedback_loops contract for any per-agent attribution; legibility SC: every ev type has a legible label and no marker clips.
- **s3-p6** [backend-engineer] — Robustness pass for new + adjacent read paths: apply Promise.allSettled-and-skip to skill.list/hook.list (currently 500 on one bad file) and the new parsers; enforce EXPORT_BASE_DIR containment in export.spawn when targetBasePath is supplied; add path-guard tests.
- **s3-p7** [frontend-engineer] — e2e + legibility gates for the three new/changed surfaces: react-flow-render-smoke + boundingBox geometry + tier ordering for the program DAG, boundingBox-geometry for the new timeline event markers, presence+contrast for PlanningPage; grep the e2e suite for GraphPage selectors before the additive DAG mode lands (p7 GAP-2); verify existing surfaces unaffected.

## Cross-Sprint Invariants (verbatim from program.md — do not re-derive)

1. packages/shared/src/schemas.ts is the single Zod source of truth; every new or modified tRPC procedure declares BOTH an input AND an output schema there, and all TypeScript types are derived via z.infer<typeof Schema> rather than hand-written interfaces duplicating a schema.
2. FF7 token discipline is mandatory: no raw hex in components or CSS; once the Shadcn-base-to-FF7 root mapping lands in globals.css :root (s1), every sprint that touches a ui/* primitive or adds a styled surface MUST preserve it and MUST NOT reintroduce a text-foreground (or text-muted-foreground) near-black-on-near-black collision, guarded by the component-contrast-smoke gate.
3. Every new or substantially-changed visualization surface budgets a LEGIBILITY success criterion up front (readable units with labels, no clipping of bars/ticks/text, WCAG AA >= 4.5:1 contrast, managed density via grouping with drill-down) and asserts SVG/canvas geometry in e2e via element boundingBox() rather than width arithmetic (pm_preflight p6 GAP-4).
4. The feedback_loops accumulator semantics is a shared cross-surface contract that MUST be decided against real event-log JSONL data (where CRITIQUE_BLOCK attributes to the critic, not the blocked agent) BEFORE any Sessions-stats refactor or any merge of parseAgentActivity (markdown) and computeSessionStats (JSONL); the same decided rule is used by both paths so a single sprint never shows two different feedback_loops numbers across tabs, and no naive unification silently zeroes the metric.
5. TypeScript strict mode is preserved with zero new any (any unavoidable use carries an inline justification comment); grep-count success criteria target value-patterns that appear only at usage sites (e.g. var(--mt-on-sfh) instances) never bare design-token field names (pm_preflight p7 GAP-1), and any sprint that removes or renames a surface first greps the e2e suite for selectors targeting the removed surface (pm_preflight p7 GAP-2).
6. All work is strictly additive and backward-compatible: every existing surface (Browse, Compose, Edit, Export, Graph, Progression, Sessions and its tabs) and the bottom tab-bar sole-nav model keep working; any change to an existing component cites and preserves that component's documented invariants (the Critic+REQVAL-ratified TableTab/AgentStatTable stacked layout, the AgentTimeline plot-area/RIGHT_PAD no-clip contract and DEFERRED-002 zoom clamp, and the EditorTab SC6 seed-when-empty / SC7 no-clear-on-error rules).
7. Sound and non-trivial motion are guarded: no audio or animation ships without a global mute control and a prefers-reduced-motion guard (none exists today); these are established as the first packet of the juice sprint and every later juice item routes through them rather than re-implementing guard logic.
8. Base-plan portability holds: every sprint is deliverable through the Agent-tool dispatch-task pipeline with no dependency on the Workflow tool or ultracode, and each sprint passes its full audit gate (SA standards + QA functionality + SX security) plus REQVAL coverage before close.

## Success Criteria (Sprint-level)

1. A PlanningPage ships as an additive route rendering deferred-work.md + task-registry.md items grouped by sprint/status with drill-down; planning.list has paired input/output Zod schemas with z.infer types and survives one malformed source file without a 500 (Promise.allSettled-and-skip), passing its legibility SC.
2. Program DAGs from program.md render in-app via the existing React Flow + dagre pipeline with tiers/depends_on/seams visible and node/edge geometry asserted via boundingBox(); react-flow-render-smoke passes and GraphPage's pre-existing connectivity-graph behavior is preserved additively (mode/sibling route, not replacement).
3. The Sessions timeline renders all EventLogEntry ev types present in real logs (AUDIT_FAIL, CRITIQUE_BLOCK, RESUME, etc.) with distinct legible markers; the plot-area/RIGHT_PAD no-clip contract and DEFERRED-002 zoom clamp are preserved and a real-session e2e shows the previously-invisible ev types.
4. Each new surface meets its budgeted legibility SC (readable units, no clipping, WCAG AA contrast, managed density) and inherits the s1 FF7 token contract with no near-black-on-dark regression (component-contrast-smoke passes); where the timeline shows feedback_loops it reads the s2 contract value consistently.
5. Both new tRPC procedures have BOTH input and output Zod schemas in packages/shared/src/schemas.ts; skill.list/hook.list no longer 500 on a single bad file and export.spawn enforces EXPORT_BASE_DIR containment.
6. All existing surfaces (Browse/Compose/Edit/Export/Graph/Progression/Sessions) still work; npm run lint passes with zero new any and the e2e suite (with new planning/DAG/timeline specs) is green.
