# Orchestrator Brief — prog-studio-vision-2026-06-s1-token-root-fix

- **Program:** `prog-studio-vision-2026-06` — Gander Studio Vision: Working Surfaces, Stable Tokens, Agent-OS Legibility, and Juice
- **Sprint:** `prog-studio-vision-2026-06-s1-token-root-fix` (tier 0)
- **Status:** PLANNED (not dispatched)

## Goal

Map the stock Shadcn base tokens onto FF7 values in globals.css :root and clear the standing WCAG-AA contrast debt, killing the invisible-text class at its root and publishing a stable token contract (plus a canonical agent role->color decision record) for every downstream ui/*-touching sprint.

**Why a separate sibling / what eval findings it addresses.** Leads as the sole tier-0 prerequisite (Candidate 3's seam-first insight, adopted over the eval's starting shape which made bug-fixes Sprint A): the eval's skein-R3 root cause is that globals.css ships stock Shadcn LIGHT :root tokens under an FF7 DARK app where .dark is never applied (verified: zero .dark className sites), so --foreground is near-black and any ui/* primitive baking text-foreground on a dark bg is invisible (D5 is the live proof). Fixing this once collapses D5 in s2 from a duplicated instance hack into a contract-confirm and lets every ui/*-touching sibling build on a guaranteed token contract. Single-domain (CSS + token mapping + contrast). Co-locates the role->color DESIGN decision here (Candidate 3) so juice (s4) and the cleanup role-color merge (s5) consume one authoritative record. Addresses D5 (root), DEFERRED-005, the FF7-token cross-sprint invariant, and the role-color DESIGN-record requirement.

## Sibling Awareness

All siblings in this program:

- `prog-studio-vision-2026-06-s1-token-root-fix` **(this sprint)** — Map the stock Shadcn base tokens onto FF7 values in globals.css :root and clear the standing WCAG-AA contrast debt, killing the invisible-text class at its root and publishing a stable token contract (plus a canonical agent role->color decision record) for every downstream ui/*-touching sprint.
- `prog-studio-vision-2026-06-s2-fix-broken-surfaces` — Make the broken surfaces actually work — rewire ExportPage to canvas-store with real connections, replace the EditPage save stub with real agent.save/skill.save mutations, stop Sessions editor cross-session buffer contamination, fix the prose-H1 zero-events slug bug, make session.saveEdit read its own writes back, and decide the feedback_loops semantics contract against real logs.
- `prog-studio-vision-2026-06-s3-agent-os-legibility` — Close the three highest-leverage, lowest-new-infra agent-OS gaps — a planning surface over deferred-work.md + task-registry.md, in-app program-DAG rendering reusing React Flow + dagre, and full event-type coverage in the Sessions timeline — each shipped with a legibility success criterion up front.
- `prog-studio-vision-2026-06-s4-juice-pass` — Propagate the delight trapped in the Compose canvas to the observability surfaces — ship a global MUTE control and prefers-reduced-motion guard FIRST, then role-colored timeline bars with FF7 tooltip and entrance animation on the expanded event substrate, a Progression character-sheet count-up/level-up moment, and mode-switch/save/export sounds — all suppressible and each gated by a legibility success criterion.
- `prog-studio-vision-2026-06-s5-cleanup-docs` — Pay down the Fable-verified cleanup and stale-docs debt as a discrete, grep-auditable lane — land the safe deletions and non-correctness-sensitive DRY merges, reclassify build tooling to devDependencies, close the DEFERRED-002 ledger entry, and refresh CLAUDE.md to the real 20 procedures and full surface set.

**DAG edges involving this sibling:**
- depends_on: (none — tier 0)
- provides_to: `prog-studio-vision-2026-06-s2-fix-broken-surfaces`, `prog-studio-vision-2026-06-s3-agent-os-legibility`, `prog-studio-vision-2026-06-s4-juice-pass`, `prog-studio-vision-2026-06-s5-cleanup-docs`

**Integration seams this sibling OWNS (outputs downstream siblings rely on):**

- `SEAM-01` → to `s2-fix-broken-surfaces`: FF7-mapped Shadcn base token contract in globals.css :root
  - format: CSS custom properties on :root (--background/--foreground/--card/--popover/--primary/--primary-foreground/--secondary/--muted/--muted-foreground/--accent/--border/--input/--ring and peers) resolving to FF7 values
  - contract: ui/* primitives (ui/input.tsx etc.) inherit legible dark-surface text from these tokens; s2's D5-confirm (s2-p7) relies on ExportPage Inputs being legible WITHOUT a per-instance color hack. Consumers MUST reference var(--token) and MUST NOT reintroduce text-foreground near-black-on-dark; s2 only consumes, never modifies, the mapping.
- `SEAM-02` → to `s3-agent-os-legibility`: FF7 token contract + DESIGN.md token-mapping decision record + the wired component-contrast-smoke gate
  - format: globals.css :root custom properties + DESIGN.md markdown stanza + the contrast-smoke e2e spec
  - contract: s3's new surfaces (PlanningPage, in-app program-DAG, expanded timeline) consume the token contract exclusively (no raw hex), inherit AA-legible text-on-dark, and MUST keep the component-contrast-smoke gate green; s3 does not modify the mapping, only consumes it.
- `SEAM-03` → to `s4-juice-pass`: FF7 token contract + canonical agent role->color DESIGN.md decision record + the contrast-smoke gate
  - format: globals.css :root custom properties + DESIGN.md role->color stanza (FF7 materia colors per role) + contrast-smoke e2e spec
  - contract: s4's role-colored timeline bars, level-up gold flash, FF7 tooltip and any colored animation derive their palette from the recorded role->color mapping (resolving the live role-color drift) and inherit FF7 tokens — no new color decisions are made ad hoc in s4; the contrast-smoke gate must remain green and s4 introduces no new text-foreground-on-dark collision.
- `SEAM-07` → to `s5-cleanup-docs`: Canonical agent role->color DESIGN.md decision record
  - format: DESIGN.md decision-record section defining the single role->color map
  - contract: s5's mechanical merge of the three divergent role-color classifications (eval section 4) MUST adopt the canonical map the s1 DESIGN record defines; s5 does not invent a map and does not silently merge — it reconciles every call path to the recorded source so the same agent renders one color everywhere.

## Inputs

- packages/client/src/globals.css (current stock-light :root tokens, lines ~189-241, .dark block)
- packages/client/src/components/ui/input.tsx (bakes text-foreground)
- packages/client/src/components/ui/textarea.tsx
- packages/client/src/components/ui/dialog.tsx
- packages/client/src/components/ui/button.tsx
- packages/client/tailwind.config.ts
- docs/deferred-work.md (DEFERRED-005 entry at line 64)
- DESIGN.md (role->color forbid-change-without-record clause)
- Defect D5, skein R3, DEFERRED-005 from the ORC-EVAL report

## Outputs (declared — these become skein's post-execution check inputs)

- packages/client/src/globals.css :root with FF7-mapped Shadcn base tokens (the shared token contract for s2/s3/s4/s5)
- DESIGN.md decision record: Shadcn->FF7 token mapping + canonical agent role->color mapping
- --wm/--mt-on-sfh contrast raised to WCAG AA
- component-contrast-smoke e2e gate wired for all surfaces
- deferred-work.md with DEFERRED-005 closed

## Proposed Task Packets (PM refines at sprint start)

- **s1-p1** [ui-designer] — Author the Shadcn-base-token -> FF7 value mapping: decide FF7 equivalents for --background/--foreground/--card/--popover/--primary/--primary-foreground/--secondary/--muted/--muted-foreground/--accent/--border/--input/--ring (and peers in globals.css :root) so ui/* primitives inherit FF7 dark surfaces and legible text; ALSO resolve the agent role->color drift (three divergent classifications contradicting DESIGN.md) into one canonical map. Record both as DESIGN.md decision-record stanzas (design call, not silent merge).
- **s1-p2** [frontend-engineer] — Apply the mapping in packages/client/src/globals.css :root (replace the stock light tokens; reconcile/remove the unused .dark block per the mapping decision) using existing FF7 custom properties / var() references; verify ui/input.tsx, ui/textarea.tsx, ui/dialog.tsx, ui/button.tsx now render legible text on FF7 dark backgrounds with no near-black-on-dark.
- **s1-p3** [frontend-engineer] — Clear DEFERRED-005 contrast debt: raise --wm (~3.49:1, 94 usages) and the --mt-on-sfh pairing (~4.14:1) to >=4.5:1 WCAG AA with FF7-consistent values, keeping changes token-level so all consumers inherit; enumerate every affected pairing and verify no other token regresses below AA.
- **s1-p4** [frontend-engineer] — Add/wire a component-contrast-smoke e2e gate asserting typed text and primitive text contrast on Browse, Compose, Edit, Export, Sessions; add a grep-count SC over var(--wm)/var(--mt-on-sfh) instance usages (not bare field names) confirming the fix landed; mark DEFERRED-005 DONE in deferred-work.md in the established done-marker format.

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

1. globals.css :root maps all load-bearing Shadcn base tokens onto FF7 values such that no ui/* primitive can render near-black text on a dark background; verified by mounting ui/input.tsx on a dark surface with typed text legible and by the new contrast-smoke gate.
2. --wm and the --mt-on-sfh pairing meet WCAG AA >= 4.5:1; the component-contrast-smoke run passes on Browse, Compose, Edit, Export and Sessions with zero failing pairs and no remaining token regresses below AA.
3. A DESIGN.md decision record documents the Shadcn->FF7 base-token mapping AND the canonical agent role->color mapping so downstream sprints (s4 juice, s5 role-color merge) have an authoritative source; no raw hex introduced anywhere (grep clean).
4. DEFERRED-005 is marked DONE in deferred-work.md; the contrast-smoke gate is wired into the e2e suite so later sprints inherit it; npm run lint passes across all three packages with zero new any.
