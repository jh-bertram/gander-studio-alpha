## [STAGE 1] RECEIVED
- **From:** ORC#0
- **At:** 2026-04-27T00:15:37Z
- **Task ID:** gander-studio-p4-proximity-edge-hardening
- **Message received:**
  > Bundle 5 auditor advisories from the just-shipped proximity-edge-fix sprint (audit PASS at commit edf6621) plus 2 carried-forward advisories from prior sprints into a single hardening sprint. All findings are non-blocking-grade test/refactor polish. No new features, no behavior changes — just tightening tests and removing dead/duplicated code. … [truncated]

## [STAGE 2] PLAN
- **At:** 2026-04-27T00:20:00Z
- **Approach:**
  1. Read materia-canvas.spec.ts, MateriaNode.tsx, CardNode.tsx, MateriaCanvas.tsx, constants/compose.ts to verify all advisory claims before writing task packets.
  2. Determine cluster vs. split decision for A1-A4 (spec file) vs. A5 (CSS refactor) vs. A6+A7 (dead code / call-site fixes).
  3. Write PM log Stage 2, draft task decomposition, write to output file.
  4. Log Stage 3 COMPLETE.

- **Files to create/modify:**
  - `docs/agent-logs/PM/gander-studio-p4-proximity-edge-hardening.md` — this log
  - `docs/agent-logs/PM/latest.md` — overwrite with this log
  - `.claude/agents/tasks/outputs/gander-studio-p4-proximity-edge-hardening-PM-1777335337.md` — task decomposition output
  - `docs/task-registry.md` — append sprint state + expectation manifest

- **Dependencies / assumptions:**
  - A6: Located in `constants/compose.ts` (not `lib/loadout/compose.ts` as stated in brief — that file does not exist). The dead branch is line 79 of `getMateriaColor`: `if (META_AGENTS.has(lower)) return 'var(--mp)'` — unreachable because `COMMAND_AGENTS` (same set, imported as `META_AGENTS`) is checked first at line 75.
  - A7: Located in MateriaCanvas.tsx `buildPaletteItemStyle` function (~line 593), not in a separate MateriaPalette.tsx file. The call `getMateriaColor(type === 'agent' ? 'frontend-engineer' : 'skill', type)` is 2-arg; role is optional so no TS error, but the advisory asks to pass the appropriate role. Since this is a palette accent using type-representative names, not specific agent instances, the FE agent must determine the appropriate role value.
  - A4 (link-sound spy): `playLink` is imported from `../../hooks/useLinkSound` and called directly in `addEdgeWithEffects` at MateriaCanvas.tsx line 751. Playwright E2E tests cannot spy on module-level functions natively — this advisory requires a Playwright `page.addInitScript` AudioContext proxy approach.

- **Cluster decision:** Split into two tasks.
  - FE-001: A1+A2+A3+A4 — all touch/extend materia-canvas.spec.ts. ~100-150 new LoC in spec file.
  - FE-002: A5+A6+A7 — code hygiene: new shared file, dead branch deletion, call-site fix. ~20-30 LoC net change across 3 files.
  - Rationale: spec file changes (FE-001) and production source changes (FE-002) are cleanly disjoint file sets. Audit is simpler on two focused tasks than one 7-advisory monolith. Neither task blocks the other (no shared file writes).

## [STAGE 3] COMPLETE
- **At:** 2026-04-27T00:30:00Z
- **Deliverables:**
  | File | Lines added/changed | Notes |
  |------|---------------------|-------|
  | `.claude/agents/tasks/outputs/gander-studio-p4-proximity-edge-hardening-PM-1777335337.md` | +350 | Primary output: full task decomposition with 2 task packets |
  | `docs/task-registry.md` | +80 | Sprint p4 section prepended with task map + expectation manifest |
  | `docs/agent-logs/PM/gander-studio-p4-proximity-edge-hardening.md` | +60 | This log |
  | `docs/agent-logs/PM/latest.md` | overwrite | Copy of this log |
- **Lint / tests:** N/A (PM produces plans, not code)
- **Open items:**
  - Critic must review decomposition before dispatch
  - A3 skill-selector risk flagged in risk_flags — FE-001 agent must read MateriaCanvas.tsx line 622 to use correct testid pattern
  - A4 AudioContext proxy approach must be verified in actual Playwright run — timing of addInitScript vs. lazy AudioContext creation is the key risk
  - Two path corrections embedded in FE-002 packet: A6 file is constants/compose.ts (not lib/loadout/compose.ts); A7 file is MateriaCanvas.tsx (not MateriaPalette.tsx)
