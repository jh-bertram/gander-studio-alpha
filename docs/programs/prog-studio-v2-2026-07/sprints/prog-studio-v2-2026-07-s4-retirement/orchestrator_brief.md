---
type: orchestrator-brief
sprint_id: prog-studio-v2-2026-07-s4-retirement
program_id: prog-studio-v2-2026-07
status: PLANNED
---

# Sprint Brief: prog-studio-v2-2026-07-s4-retirement

## Sprint ID and Program ID
- **Sprint:** `prog-studio-v2-2026-07-s4-retirement`
- **Program:** `prog-studio-v2-2026-07` (manifest: `docs/programs/prog-studio-v2-2026-07/program.md`)

## Goal
Complete the v2 cutover: retire the CUT surfaces (Compose, Export, Planning), consolidate the KEEP surfaces (Sessions, Progression, Programs) under the v2 submenu IA, remove the 9-tab BottomTabBar in favor of the v2 rail, prune dead stores/components/routes, and update the project docs (CLAUDE.md surfaces + tRPC tables, DESIGN.md) to the v2 reality.

## Sibling Awareness
- **s1-data-layer / s2-party-shell / s3-drilldowns (tiers 0-2, all upstream):** `depends_on: [s2, s3]`. HARD GATE: do not cut Browse/Graph/Edit surfaces until s3's absorption-proof seam is green; do not remove BottomTabBar until s2's rail covers Roster/Sessions/Progression/Programs.
- **s4-retirement (THIS SPRINT, tier 3, terminal before integration).**

**Seams:** consumes `s2-to-s4-nav-shell` and `s3-to-s4-absorption-proof`. Owns none (terminal).

## Inputs
- `docs/v2-vision/v1-critique.md` — the CUT/KEEP/ABSORB contract this sprint executes.
- s2 rail + s3 absorption e2e evidence.
- v1 surface inventory: ComposePage/ExportPage/PlanningPage + BrowsePage/GraphPage/EditPage (post-absorption), their stores (compose, canvas, edit, session-picker as applicable), BottomTabBar, navigation constants, AppMode union.
- CLAUDE.md (surfaces + 22-procedure tables), DESIGN.md.
- program.md §2 Invariants.

## Outputs (declared)
- Deleted: CUT pages + absorbed v1 pages superseded by s3, their orphaned stores/components/routes/tabs; AppMode union members removed (compiler forces PAGE_MAP cleanup).
- BottomTabBar removed; v2 rail is the sole nav.
- Decision on export/loadout server procedures (compose-era tRPC): retained server-side or deprecated — PM decides with Critic gate; client surface is removed either way.
- Updated CLAUDE.md (surfaces table, procedure table, architecture tree) + DESIGN.md decision record for the v2 IA.
- Full regression e2e sweep: KEEP surfaces reachable via rail; no dead-route 404s; bundle-size note.

## Cross-Sprint Invariants (from program.md §2 — binding)
FF7 tokens canonical; AppMode∪PAGE_MAP compiler-exhaustive (deletions drive cleanup); lint ×3 + build green after every removal wave; vitest/Playwright suites updated not deleted-around; base-plan portability; docs updated in the same sprint as the code they describe.

## Success Criteria (sprint level)
1. Compose/Export/Planning unreachable and deleted; no orphaned imports/stores (verified by lint + a dead-export scan).
2. Browse/Graph/Edit surfaces removed WITH their absorption proofs cited (s3 e2e green at cut time).
3. Sessions/Progression/Programs fully reachable via the v2 rail; BottomTabBar gone.
4. CLAUDE.md + DESIGN.md reflect v2 (surfaces, procedures, architecture); stale references pruned.
5. Full e2e suite green; lint ×3 clean; build passing; human browser walkthrough at Step 4.5 (this is the program's final pre-skein gate).
