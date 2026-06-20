# Orchestrator Brief — prog-studio-vision-2026-06-s4-juice-pass

- **Program:** `prog-studio-vision-2026-06` — Gander Studio Vision: Working Surfaces, Stable Tokens, Agent-OS Legibility, and Juice
- **Sprint:** `prog-studio-vision-2026-06-s4-juice-pass` (tier 3)
- **Status:** PLANNED (not dispatched)

## Goal

Propagate the delight trapped in the Compose canvas to the observability surfaces — ship a global MUTE control and prefers-reduced-motion guard FIRST, then role-colored timeline bars with FF7 tooltip and entrance animation on the expanded event substrate, a Progression character-sheet count-up/level-up moment, and mode-switch/save/export sounds — all suppressible and each gated by a legibility success criterion.

**Why a separate sibling / what eval findings it addresses.** Final tier sibling because juice is presentation layered on working (s2), legible (s1-token), and content-complete (s3) surfaces. Depends on s1 (FF7 token contract for any ui/* color work plus the canonical role->color decision record) and on s3 for the full-ev-type AgentTimeline substrate (SEAM-06) that the role-colored-bars/marching-ants juice decorates. Per the eval and the human-intent history lane it MUST ship the global mute + prefers-reduced-motion guard FIRST (none exists today — verified: only Shadcn --muted color tokens, no audio mute) so all subsequent audio/animation is suppressible, and every animated surface budgets a legibility SC because the human only catches legibility defects at verification. D7 (skeleton-shimmer/panel-in CSS + drilldown entrance motion) is folded here as the same animation infrastructure. Single coherent FE+UI presentation domain, <=7 packets. Addresses fun/juice #1-#6 and the mute/reduced-motion accessibility gap.

## Sibling Awareness

All siblings in this program:

- `prog-studio-vision-2026-06-s1-token-root-fix` — Map the stock Shadcn base tokens onto FF7 values in globals.css :root and clear the standing WCAG-AA contrast debt, killing the invisible-text class at its root and publishing a stable token contract (plus a canonical agent role->color decision record) for every downstream ui/*-touching sprint.
- `prog-studio-vision-2026-06-s2-fix-broken-surfaces` — Make the broken surfaces actually work — rewire ExportPage to canvas-store with real connections, replace the EditPage save stub with real agent.save/skill.save mutations, stop Sessions editor cross-session buffer contamination, fix the prose-H1 zero-events slug bug, make session.saveEdit read its own writes back, and decide the feedback_loops semantics contract against real logs.
- `prog-studio-vision-2026-06-s3-agent-os-legibility` — Close the three highest-leverage, lowest-new-infra agent-OS gaps — a planning surface over deferred-work.md + task-registry.md, in-app program-DAG rendering reusing React Flow + dagre, and full event-type coverage in the Sessions timeline — each shipped with a legibility success criterion up front.
- `prog-studio-vision-2026-06-s4-juice-pass` **(this sprint)** — Propagate the delight trapped in the Compose canvas to the observability surfaces — ship a global MUTE control and prefers-reduced-motion guard FIRST, then role-colored timeline bars with FF7 tooltip and entrance animation on the expanded event substrate, a Progression character-sheet count-up/level-up moment, and mode-switch/save/export sounds — all suppressible and each gated by a legibility success criterion.
- `prog-studio-vision-2026-06-s5-cleanup-docs` — Pay down the Fable-verified cleanup and stale-docs debt as a discrete, grep-auditable lane — land the safe deletions and non-correctness-sensitive DRY merges, reclassify build tooling to devDependencies, close the DEFERRED-002 ledger entry, and refresh CLAUDE.md to the real 20 procedures and full surface set.

**DAG edges involving this sibling:**
- depends_on: `prog-studio-vision-2026-06-s1-token-root-fix`, `prog-studio-vision-2026-06-s3-agent-os-legibility`
- provides_to: (none — leaf; feeds Integration terminus)

**Integration seams this sibling CONSUMES (inputs from upstream siblings):**

- `SEAM-03` ← from `s1-token-root-fix`: FF7 token contract + canonical agent role->color DESIGN.md decision record + the contrast-smoke gate
  - format: globals.css :root custom properties + DESIGN.md role->color stanza (FF7 materia colors per role) + contrast-smoke e2e spec
  - contract: s4's role-colored timeline bars, level-up gold flash, FF7 tooltip and any colored animation derive their palette from the recorded role->color mapping (resolving the live role-color drift) and inherit FF7 tokens — no new color decisions are made ad hoc in s4; the contrast-smoke gate must remain green and s4 introduces no new text-foreground-on-dark collision.
- `SEAM-06` ← from `s3-agent-os-legibility`: AgentTimeline full-ev-type event substrate + the event-type-to-visual-role data model
  - format: AgentTimeline.tsx rendering all EventLogEntry ev types (SPAWN/COMPLETE/AUDIT_FAIL/CRITIQUE_BLOCK/RESUME/...) as distinct markers within the plot-area/RIGHT_PAD no-clip contract, with documented per-event-type encoding and boundingBox()-based e2e geometry assertions
  - contract: s4's timeline juice (role-colored bars, marching-ants orphans, entrance, FF7 tooltip, playhead) decorates the s3 substrate ON TOP, without removing/hiding any event type or regressing legibility; s4 MUST preserve the no-clip contract, the DEFERRED-002 zoom clamp, and the s3 legibility SC and boundingBox() geometry assertions, adding only suppressible presentation.

## Inputs

- packages/client/src/hooks/useLinkSound.ts (Web Audio synth infra; no mute today)
- packages/client/src/store/ui-store.ts (for persisted mute state)
- packages/client/src/components/sessions/AgentTimeline.tsx (full-ev-type substrate, SEAM-06 from s3)
- packages/client/src/pages/ProgressionPage.tsx + progression.getLedger (XpGain/levels_advanced)
- packages/client/src/pages/GraphPage.tsx
- packages/client/src/components/browse/SkeletonCard.tsx + DrilldownPanel.tsx (D7 undefined skeleton-shimmer/panel-in)
- packages/client/src/globals.css + DESIGN.md role->color record (SEAM-03 from s1)
- Working Edit/Export surfaces for save/export chimes (additive on s2)
- Eval section 3 fun opportunities #1-#6 and D7

## Outputs (declared — these become skein's post-execution check inputs)

- Global MUTE control + prefers-reduced-motion guard honored app-wide (the suppression foundation)
- Juiced AgentTimeline (role colors, marching-ants, entrance, FF7 tooltip, playhead)
- Progression character sheet (XP bars, count-up, LEVEL UP flash)
- D7 CSS defined + drilldown entrance motion; mode-switch transition + UI/save/export sounds
- GraphPage hover/select + click-through to Browse
- e2e specs for mute/reduced-motion/legibility

## Proposed Task Packets (PM refines at sprint start)

- **s4-p1** [frontend-engineer] — Ship the suppression foundation FIRST: a global MUTE control (persisted in ui-store, surfaced in the chrome, keyboard-navigable) gating ALL Web Audio (useLinkSound) and a prefers-reduced-motion guard utility honored by ALL animation; verify with reduced-motion on that nothing animates and mute silences all tones, including the existing Compose canvas audio.
- **s4-p2** [frontend-engineer] — Tie off D7: define the missing skeleton-shimmer + panel-in CSS (adopt the working Sessions inline-shimmer pattern) and give DrilldownPanel/dialog a reduced-motion-gated entrance motion; confirm graceful fallback when motion is disabled.
- **s4-p3** [ui-designer] — Translate the s1 canonical role->color DESIGN record into the timeline palette (FF7 materia colors per agent role) and spec the entrance/marching-ants/playhead motion with explicit reduced-motion fallbacks; no new color decisions are made ad hoc (consumes the s1 record), hand specs to FE.
- **s4-p4** [frontend-engineer] — Apply AgentTimeline juice on the s3 full-ev-type substrate: role-colored bars (party roster), marching-ants orphan bars, staggered entrance, an FF7 tooltip panel replacing native <title>, and a live 'now' playhead — all behind the s4-p1 mute/reduced-motion guards; preserve the plot-area/RIGHT_PAD no-clip contract and the s3 event-type legibility SC.
- **s4-p5** [frontend-engineer] — Turn ProgressionPage.tsx into a character sheet: XP bars, count-up animation, a 'LEVEL UP' gold flash on levels_advanced — data already flows via progression.getLedger; motion behind the reduced-motion guard, chimes behind mute, with a legibility SC (readable XP units/values, no clipping, AA contrast).
- **s4-p6** [frontend-engineer] — Add a mode-switch transition + UI tick sound on navigation and save/export chimes wired into the now-working Edit/Export surfaces (reuse useLinkSound synth infra) — all routed through the s4-p1 global mute + reduced-motion guard; add GraphPage hover/select neighborhood highlight + click-through to Browse where cheap.
- **s4-p7** [frontend-engineer] — e2e + accessibility gates: assert mute silences all audio and reduced-motion suppresses all animation (both modes); boundingBox-geometry that role-colored bars and count-up XP bars do not clip and remain AA-contrast; grep-count SC that no juice surface introduced raw hex or regressed the s1 token contract.

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

1. A global MUTE control (persisted, keyboard-navigable) and a prefers-reduced-motion guard exist and are honored by every audio and animation path; with reduced-motion enabled no surface animates and with mute enabled no tone plays, verified by e2e in both modes.
2. AgentTimeline shows role-colored bars (from the s1 canonical DESIGN record), marching-ants orphans, staggered entrance, an FF7 tooltip panel, and a live playhead on the s3 full-ev-type substrate; the plot-area/RIGHT_PAD no-clip contract holds and bar geometry/contrast is asserted via boundingBox().
3. ProgressionPage renders as a character sheet (XP bars, count-up, LEVEL UP gold flash on levels_advanced) using existing progression.getLedger data with no new persistence; XP units are readable with no clipping (legibility SC) and all motion is reduced-motion-gated.
4. D7 is tied off (skeleton-shimmer and panel-in defined; DrilldownPanel/dialog entrance motion with reduced-motion fallback); a mode-switch transition + UI tick/save/export chimes are wired behind mute + reduced-motion.
5. No juice surface introduces raw hex or regresses the s1 token contract (grep-count + component-contrast-smoke pass); every animated surface meets its legibility SC; npm run lint passes with zero new any and the full e2e suite (including mute/reduced-motion/legibility specs) is green.
