# Orchestrator Brief — prog-studio-vision-2026-06-s5-cleanup-docs

- **Program:** `prog-studio-vision-2026-06` — Gander Studio Vision: Working Surfaces, Stable Tokens, Agent-OS Legibility, and Juice
- **Sprint:** `prog-studio-vision-2026-06-s5-cleanup-docs` (tier 2)
- **Status:** PLANNED (not dispatched)

## Goal

Pay down the Fable-verified cleanup and stale-docs debt as a discrete, grep-auditable lane — land the safe deletions and non-correctness-sensitive DRY merges, reclassify build tooling to devDependencies, close the DEFERRED-002 ledger entry, and refresh CLAUDE.md to the real 20 procedures and full surface set.

**Why a separate sibling / what eval findings it addresses.** Made a discrete sibling rather than 'continuous' (Candidates 1 and 2 over the eval's footnote) because it carries concrete, grep-verifiable success criteria and a real risk gate (grep the e2e suite for selectors targeting removed surfaces, invariant e / pm_preflight p7 GAP-2) — verifiable work, not a footnote — and isolating it makes the deletions/merges auditable in one pass without merge-noise across feature sprints. Depends on s2 because the D1 Export rewire is what makes compose-store's dead actions (addAgent/addSkill/addHook + the 5 dead actions, SEAM-05) safely removable; deleting them before s2 lands would break the still-compose-store-coupled Export. Also depends on s1 for the canonical role->color DESIGN record so the mechanical role-color merge adopts one authoritative map (not a silent merge). Independent of s3/s4 (pure deletion/merge + docs, no overlapping live files). Addresses eval section 4 (17/18 verified deletions/merges), section 6 (npm audit dep reclassification), D8 (DEFERRED-002 ledger), and section 5/6 stale-docs (CLAUDE.md says 12, router has 20).

## Sibling Awareness

All siblings in this program:

- `prog-studio-vision-2026-06-s1-token-root-fix` — Map the stock Shadcn base tokens onto FF7 values in globals.css :root and clear the standing WCAG-AA contrast debt, killing the invisible-text class at its root and publishing a stable token contract (plus a canonical agent role->color decision record) for every downstream ui/*-touching sprint.
- `prog-studio-vision-2026-06-s2-fix-broken-surfaces` — Make the broken surfaces actually work — rewire ExportPage to canvas-store with real connections, replace the EditPage save stub with real agent.save/skill.save mutations, stop Sessions editor cross-session buffer contamination, fix the prose-H1 zero-events slug bug, make session.saveEdit read its own writes back, and decide the feedback_loops semantics contract against real logs.
- `prog-studio-vision-2026-06-s3-agent-os-legibility` — Close the three highest-leverage, lowest-new-infra agent-OS gaps — a planning surface over deferred-work.md + task-registry.md, in-app program-DAG rendering reusing React Flow + dagre, and full event-type coverage in the Sessions timeline — each shipped with a legibility success criterion up front.
- `prog-studio-vision-2026-06-s4-juice-pass` — Propagate the delight trapped in the Compose canvas to the observability surfaces — ship a global MUTE control and prefers-reduced-motion guard FIRST, then role-colored timeline bars with FF7 tooltip and entrance animation on the expanded event substrate, a Progression character-sheet count-up/level-up moment, and mode-switch/save/export sounds — all suppressible and each gated by a legibility success criterion.
- `prog-studio-vision-2026-06-s5-cleanup-docs` **(this sprint)** — Pay down the Fable-verified cleanup and stale-docs debt as a discrete, grep-auditable lane — land the safe deletions and non-correctness-sensitive DRY merges, reclassify build tooling to devDependencies, close the DEFERRED-002 ledger entry, and refresh CLAUDE.md to the real 20 procedures and full surface set.

**DAG edges involving this sibling:**
- depends_on: `prog-studio-vision-2026-06-s1-token-root-fix`, `prog-studio-vision-2026-06-s2-fix-broken-surfaces`
- provides_to: (none — leaf; feeds Integration terminus)

**Integration seams this sibling CONSUMES (inputs from upstream siblings):**

- `SEAM-05` ← from `s2-fix-broken-surfaces`: List of VERIFIED-DEAD compose-store actions rendered removable once ExportPage is rewired off compose-store (D1 fix): addAgent, addSkill, addHook (grep-confirmed zero live call sites at HEAD 84b7580); removeAgent/removeSkill ONLY IF s5 jidoka confirms them dead. EXCLUDES the LIVE actions loadLoadout, resetLoadout, setLoadoutName, removeHook (still consumed by ComposePage.tsx:666-669,758,772).
  - format: Markdown list in the s2 completion packet / after-action, file path packages/client/src/store/compose-store.ts with action names and line ranges
  - contract: s5 deletes ONLY actions it has re-grepped to zero live call sites; it MUST NOT remove loadLoadout/resetLoadout/setLoadoutName/removeHook (compose-store still backs ComposePage's name+hooks+loadout path). The SEAM-05 grep-guard ('confirm no consumer references compose-store for the loadout payload') is the enforcement. [Correction applied per Critic round-1 advisory; verified independently against HEAD 84b7580.]
- `SEAM-07` ← from `s1-token-root-fix`: Canonical agent role->color DESIGN.md decision record
  - format: DESIGN.md decision-record section defining the single role->color map
  - contract: s5's mechanical merge of the three divergent role-color classifications (eval section 4) MUST adopt the canonical map the s1 DESIGN record defines; s5 does not invent a map and does not silently merge — it reconciles every call path to the recorded source so the same agent renders one color everywhere.

## Inputs

- packages/client/src/store/compose-store.ts (dead actions from SEAM-05)
- packages/client/src/store/ui-store.ts, session-store.ts, analyzeStore.ts (dead state/setters)
- packages/client/src/components/ui/accordion.tsx; ErrorState x4 + shimmer x8 across 6 files
- packages/server/src/router.ts (findSessionById x3, procedure count)
- packages/shared/src/schemas.ts (dead exports)
- packages/client/package.json (mis-declared build-tooling deps)
- packages/client/tests/e2e/ (selector grep for removed surfaces)
- docs/deferred-work.md (DEFERRED-002 entry at line 22), CLAUDE.md (procedure count, architecture)
- DESIGN.md canonical role->color record (SEAM-03 from s1)
- Dead compose-store action list (SEAM-05 from s2)
- Eval section 4 (deletion/merge ledger), section 6, D8

## Outputs (declared — these become skein's post-execution check inputs)

- Fable-verified safe deletions landed with grep-count proof
- Non-correctness DRY merges (findSessionById, formatWallClock/ErrorState/shimmer) extracted
- Agent role->color reconciled to the canonical DESIGN map
- Build tooling reclassified to devDependencies; shrunk prod npm-audit report
- DEFERRED-002 marked DONE; CLAUDE.md refreshed to 20 procedures + full surface set
- e2e suite cleaned of selectors for removed surfaces

## Proposed Task Packets (PM refines at sprint start)

- **s5-p1** [frontend-engineer] — Land the Fable-verified safe deletions: 10 dead exported constants, accordion.tsx (sole ChevronDownIcon consumer), dead schema/type exports (SessionRawInputSchema/SessionRawInput/AggregateStatsInput), the now-dead compose-store actions exposed by s2's D1 rewire (SEAM-05), dead ui-store/session-store/analyzeStore state+setters, SESSION_TABS placeholder machinery, .nav-item CSS, Geist font, tw-animate-css; each preceded by a grep confirming zero live call sites (instance value-patterns, not bare field tokens).
- **s5-p2** [frontend-engineer] — Grep the entire e2e suite for selectors targeting any removed surface/component before finalizing deletions (p7 GAP-2); update or remove orphaned specs (not left dangling); remove stale tracked artifacts (temp_update.md, task-registry-s3-rollback.md, root test-results/) and fix the gitignore miss.
- **s5-p3** [backend-engineer] — DRY merges that are NOT correctness-sensitive: extract the triplicated findSessionById in router.ts (~80 lines, 3x) into one shared helper (preserve the saveedit-guard path containment); merge formatWallClock/MetricKey/METRIC_LABEL (drop the dead 'Count' map) and ErrorState (4x) + shimmer style (8x) into shared modules with no behavior change; do NOT touch the feedback_loops aggregation (follows the s2 contract) and do NOT merge TableTab/AgentStatTable (REFUTED-redundant; only <th> styling is extractable).
- **s5-p4** [frontend-engineer] — Mechanically reconcile the agent role->color drift across the 3 divergent call-path classifications to the single canonical map recorded in the s1 DESIGN decision record (consumes SEAM-03; does not invent a map); verify the same agent renders one color by every call path.
- **s5-p5** [backend-engineer] — Reclassify mis-declared build tooling (shadcn, vite-plugin-pwa, postcss, autoprefixer, tailwindcss) from client dependencies to devDependencies so npm audit --omit=dev shrinks toward the fastify cluster; run npm audit and record the new prod count; remove the shadcn CLI runtime-dep mislisting.
- **s5-p6** [backend-engineer] — Close D8 and refresh docs: mark DEFERRED-002 (timeline x-axis zoom, landed in 3de2202) DONE in deferred-work.md (matching the DEFERRED-P7-1 done-marker format); refresh CLAUDE.md to the real 20 tRPC procedures (currently says 12) and add the Sessions/Graph/Progression/Planning/Program-DAG surfaces + post-reclassification npm-audit count to Known Issues, verified against router.ts.

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

1. All Fable-verified safe deletions land with a per-deletion zero-call-site grep recorded (targeting instance value-patterns, not bare field tokens) and npm run lint stays green; the dead compose-store actions from SEAM-05 are removed only after confirming no consumer still reads compose-store for the loadout payload.
2. The e2e suite was grepped for selectors targeting removed surfaces; no spec references a deleted surface/component (orphans updated/removed, not left dangling) and the suite is green; stale tracked artifacts (temp_update.md, task-registry-s3-rollback.md, root test-results/) are removed and gitignored.
3. findSessionById is a single shared server helper (saveedit-guard path containment preserved); formatWallClock/MetricKey/METRIC_LABEL and ErrorState/shimmer are extracted into shared modules with no behavior change; feedback_loops aggregation is left untouched and TableTab/AgentStatTable are NOT merged (only <th> styling extracted).
4. The agent role->color drift is reconciled to the single s1 canonical DESIGN-record map and the same agent renders one color by every call path.
5. Build tooling is moved to devDependencies and npm audit --omit=dev is re-run with the reduced prod count recorded in CLAUDE.md Known Issues; DEFERRED-002 is marked DONE in deferred-work.md.
6. CLAUDE.md reports the correct 20 tRPC procedures and documents the Sessions/Graph/Progression/Planning/Program-DAG surfaces (verified against router.ts); no live surface regresses and the full e2e suite passes with all existing surfaces functional.
