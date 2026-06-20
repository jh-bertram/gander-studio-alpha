# Orchestrator Brief — prog-studio-vision-2026-06-s2-fix-broken-surfaces

- **Program:** `prog-studio-vision-2026-06` — Gander Studio Vision: Working Surfaces, Stable Tokens, Agent-OS Legibility, and Juice
- **Sprint:** `prog-studio-vision-2026-06-s2-fix-broken-surfaces` (tier 1)
- **Status:** PLANNED (not dispatched)

## Goal

Make the broken surfaces actually work — rewire ExportPage to canvas-store with real connections, replace the EditPage save stub with real agent.save/skill.save mutations, stop Sessions editor cross-session buffer contamination, fix the prose-H1 zero-events slug bug, make session.saveEdit read its own writes back, and decide the feedback_loops semantics contract against real logs.

**Why a separate sibling / what eval findings it addresses.** Kept as ONE coherent sibling (not split client/server, per all three candidates) because all six defects share the single product goal 'the seven surfaces work' and the eval ranks this highest ROI; the client (D1/D2/D3) and server (D4/D6) defects are independently developable within one Orchestrator pipeline (7 packets) and do not cross-talk with other siblings. Depends on s1 ONLY for the D5 token contract (Candidate 3's collapse): with the root fix landed, D5 reduces to confirming ExportPage inputs inherit legible token color rather than a separate instance hack. The feedback_loops semantics DECISION (invariant d) is scoped here as the authoritative ruling against real event-log JSONL, since D4 and the stats path live here; the decision is recorded for s3 to consume read-only (deferring the deeper refactor to avoid scope creep). Addresses D1, D2, D3, D4, D6, D5-confirm, and the feedback_loops contract.

## Sibling Awareness

All siblings in this program:

- `prog-studio-vision-2026-06-s1-token-root-fix` — Map the stock Shadcn base tokens onto FF7 values in globals.css :root and clear the standing WCAG-AA contrast debt, killing the invisible-text class at its root and publishing a stable token contract (plus a canonical agent role->color decision record) for every downstream ui/*-touching sprint.
- `prog-studio-vision-2026-06-s2-fix-broken-surfaces` **(this sprint)** — Make the broken surfaces actually work — rewire ExportPage to canvas-store with real connections, replace the EditPage save stub with real agent.save/skill.save mutations, stop Sessions editor cross-session buffer contamination, fix the prose-H1 zero-events slug bug, make session.saveEdit read its own writes back, and decide the feedback_loops semantics contract against real logs.
- `prog-studio-vision-2026-06-s3-agent-os-legibility` — Close the three highest-leverage, lowest-new-infra agent-OS gaps — a planning surface over deferred-work.md + task-registry.md, in-app program-DAG rendering reusing React Flow + dagre, and full event-type coverage in the Sessions timeline — each shipped with a legibility success criterion up front.
- `prog-studio-vision-2026-06-s4-juice-pass` — Propagate the delight trapped in the Compose canvas to the observability surfaces — ship a global MUTE control and prefers-reduced-motion guard FIRST, then role-colored timeline bars with FF7 tooltip and entrance animation on the expanded event substrate, a Progression character-sheet count-up/level-up moment, and mode-switch/save/export sounds — all suppressible and each gated by a legibility success criterion.
- `prog-studio-vision-2026-06-s5-cleanup-docs` — Pay down the Fable-verified cleanup and stale-docs debt as a discrete, grep-auditable lane — land the safe deletions and non-correctness-sensitive DRY merges, reclassify build tooling to devDependencies, close the DEFERRED-002 ledger entry, and refresh CLAUDE.md to the real 20 procedures and full surface set.

**DAG edges involving this sibling:**
- depends_on: `prog-studio-vision-2026-06-s1-token-root-fix`
- provides_to: `prog-studio-vision-2026-06-s3-agent-os-legibility`, `prog-studio-vision-2026-06-s5-cleanup-docs`

**Integration seams this sibling CONSUMES (inputs from upstream siblings):**

- `SEAM-01` ← from `s1-token-root-fix`: FF7-mapped Shadcn base token contract in globals.css :root
  - format: CSS custom properties on :root (--background/--foreground/--card/--popover/--primary/--primary-foreground/--secondary/--muted/--muted-foreground/--accent/--border/--input/--ring and peers) resolving to FF7 values
  - contract: ui/* primitives (ui/input.tsx etc.) inherit legible dark-surface text from these tokens; s2's D5-confirm (s2-p7) relies on ExportPage Inputs being legible WITHOUT a per-instance color hack. Consumers MUST reference var(--token) and MUST NOT reintroduce text-foreground near-black-on-dark; s2 only consumes, never modifies, the mapping.

**Integration seams this sibling OWNS (outputs downstream siblings rely on):**

- `SEAM-04` → to `s3-agent-os-legibility`: feedback_loops accumulator semantics contract
  - format: A markdown contract note (decision record) derived from real docs/events/*.jsonl + the reconciled rule implemented identically in parseAgentActivity (session-parser.ts) and computeSessionStats (session-stats.ts)
  - contract: s3's timeline/stats displays read feedback_loops as the single s2-decided value; s3 MUST NOT re-derive or re-define feedback_loops, only consume the ratified definition so no surface shows a divergent number. Read-only soft dependency bindable last — s3 can build its surfaces in parallel and wire the feedback_loops value once the contract is recorded.
- `SEAM-05` → to `s5-cleanup-docs`: List of VERIFIED-DEAD compose-store actions rendered removable once ExportPage is rewired off compose-store (D1 fix): addAgent, addSkill, addHook (grep-confirmed zero live call sites at HEAD 84b7580); removeAgent/removeSkill ONLY IF s5 jidoka confirms them dead. EXCLUDES the LIVE actions loadLoadout, resetLoadout, setLoadoutName, removeHook (still consumed by ComposePage.tsx:666-669,758,772).
  - format: Markdown list in the s2 completion packet / after-action, file path packages/client/src/store/compose-store.ts with action names and line ranges
  - contract: s5 deletes ONLY actions it has re-grepped to zero live call sites; it MUST NOT remove loadLoadout/resetLoadout/setLoadoutName/removeHook (compose-store still backs ComposePage's name+hooks+loadout path). The SEAM-05 grep-guard ('confirm no consumer references compose-store for the loadout payload') is the enforcement. [Correction applied per Critic round-1 advisory; verified independently against HEAD 84b7580.]

## Inputs

- packages/client/src/pages/ExportPage.tsx (compose-store import, handleExport connections:[] line ~149)
- packages/client/src/store/canvas-store.ts (selectLoadoutPayload:195, edges)
- packages/client/src/store/compose-store.ts
- packages/client/src/pages/EditPage.tsx (saveStub ~50, agent.save/skill.save queries)
- packages/client/src/pages/sessions/tabs/EditorTab.tsx + store/session-store.ts (editBuffer)
- packages/server/src/router.ts (slug derivation 455/499/539, saveEdit ~504, getRaw ~552)
- packages/server/src/parsers/session-parser.ts (toSlug:15) + session-stats.ts (feedback_loops)
- packages/shared/src/schemas.ts
- docs/events/*.jsonl (real event logs for the feedback_loops decision)
- globals.css FF7-mapped token contract (SEAM-01 from s1)
- Defect ledger D1/D2/D3/D4/D5/D6 from the ORC-EVAL report

## Outputs (declared — these become skein's post-execution check inputs)

- Working ExportPage (real loadout + connections) wired to canvas-store
- EditPage Save/Save-as-New wired to live agent.save/skill.save mutations
- Contamination-free Sessions EditorTab + per-session editBuffer keying
- Case-insensitive/prose-tolerant session slug matching in router.ts
- Round-tripping session.saveEdit/getRaw with populated editedFilePath
- feedback_loops contract note + reconciled markdown/JSONL accumulators (SEAM-04 to s3)
- List of now-dead compose-store actions exposed by the D1 rewire (handed to s5, SEAM-05)
- e2e coverage for D1-D6

## Proposed Task Packets (PM refines at sprint start)

- **s2-p1** [frontend-engineer] — Fix D1: rewire ExportPage.tsx to read agents/skills via selectLoadoutPayload(canvas-store) (canvas-store.ts:195) instead of the permanently-empty compose-store, and replace handleExport's hardcoded connections:[] (line ~149) with the real selectLoadoutPayload().connections so edges export; ensure isLoadoutEmpty reflects canvas contents and the export button enables for a composed loadout.
- **s2-p2** [frontend-engineer] — Fix D2: replace EditPage.tsx saveStub() (line ~50) and the console.warn stubs with real trpc.agent.save / trpc.skill.save mutations branched on selectedFile.type; wire Save-as-New to honor newName; surface real success/error states (save/export chimes deferred to s4 juice).
- **s2-p3** [frontend-engineer] — Fix D3: key/clear the global editBuffer per session in EditorTab.tsx / session-store so switching session A->B never writes A's content into B's edit file (reset on session id change, not only-when-empty); preserve SC6 (seed-when-empty) and SC7 (no-clear-on-save-error) EditorTab invariants.
- **s2-p4** [backend-engineer] — Fix D4: in router.ts slug derivation (session.get ~455, getStats ~499, aggregateStats ~539) replace sprint.split(/\s+/)[0] case-sensitive matching with toSlug() (session-parser.ts:15) or match on session.id, compared case-insensitively against task_ids, so prose-H1 sessions resolve their events; add a guard/log when zero events match a known session and a fixture proving non-zero events/stats.
- **s2-p5** [backend-engineer] — Fix D6: make session.saveEdit round-trip — getRaw (router.ts ~552-569) prefers SESSIONS_EDITS_DIR/{id}.md when present (path-guarded) and/or populate editedFilePath so saved edits survive reload; declare/extend input+output Zod schemas in schemas.ts for any shape change; add a write-then-read-back test.
- **s2-p6** [backend-engineer] — Decide the feedback_loops semantics contract (invariant d): against real docs/events/*.jsonl, document the single rule (how CRITIQUE_BLOCK attribution interacts with the same-agent check), record it as a contract note, and reconcile parseAgentActivity (session-parser.ts) and computeSessionStats (session-stats.ts) so a sprint shows ONE consistent number across tabs (no naive unify that zeroes the metric); add a parity test on a real-shaped log.
- **s2-p7** [frontend-engineer] — D5-confirm + e2e: confirm ExportPage's two Inputs render legible typed text under the s1 token contract (add a per-instance color only if a residual gap remains); add/extend e2e proving D1 export-with-connections, D2 persisted save, D3 no-contamination across a session switch, and the prose-H1 non-zero-stats case (D4).

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

1. ExportPage reads the live canvas-store loadout (selectLoadoutPayload) and exports real connections: a composed loadout enables the export button and export.spawn receives non-empty agents/skills and the actual edge list, asserted in a Playwright test (D1).
2. EditPage Save persists via trpc.agent.save/skill.save (branched on file type) and Save-as-New honors newName; saveStub is gone (grep returns zero hits) and an integration test confirms the file is observably written and re-reads with the new content (D2).
3. Opening session A, returning, opening session B, and saving writes B's own content (never A's) to B's edit file, asserted at the tRPC mutation boundary; SC6 and SC7 EditorTab behaviors still pass (D3).
4. A prose-H1 session (e.g. 'Post-Mortem: Gander Studio P1 — Materia Canvas') resolves its slug case-insensitively and renders non-zero events/stats across Overview/Table/Analyze, proven by a fixture-backed server test (D4).
5. session.saveEdit round-trips: after saveEdit, getRaw returns the edited content (or editedFilePath is populated and read) so edits survive a reload, verified by a write-then-read-back test; ExportPage typed input text is legible under the s1 token contract (D5/D6).
6. feedback_loops uses one decided rule applied identically in the markdown and JSONL paths and the same sprint reports identical feedback_loops on every tab, verified by a parity test on real-shaped event data; npm run lint passes with zero new any.
