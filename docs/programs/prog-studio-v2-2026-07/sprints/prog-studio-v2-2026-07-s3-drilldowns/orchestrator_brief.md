---
type: orchestrator-brief
sprint_id: prog-studio-v2-2026-07-s3-drilldowns
program_id: prog-studio-v2-2026-07
status: PLANNED
---

# Sprint Brief: prog-studio-v2-2026-07-s3-drilldowns

## Sprint ID and Program ID
- **Sprint:** `prog-studio-v2-2026-07-s3-drilldowns`
- **Program:** `prog-studio-v2-2026-07` (manifest: `docs/programs/prog-studio-v2-2026-07/program.md`)

## Goal
Build the per-agent drill-down screens that absorb Browse, Graph, and Edit: an agent-detail view with Materia (skills + hooks), Equipment (tools), and Abilities (workflows) panels, a relationship layer (Graph absorption), and the spec-revision action (Edit absorption), navigable from party cards.

## Sibling Awareness
- **s1-data-layer (tier 0, upstream):** publishes `AgentDetailSchema` + `roster.getAgentDetail(code)`. `depends_on: [s1, s2]`.
- **s2-party-shell (tier 1, upstream):** publishes the nav contract (party card click → agent-detail mode, selected-agent store, rail back-navigation slot).
- **s3-drilldowns (THIS SPRINT, tier 2).** `provides_to: [s4-retirement]` — absorption-proof seam.
- **s4-retirement (tier 3):** may cut Browse/Graph/Edit ONLY after this sprint's e2e specs prove their value lives here.

**Seams:** consumes `s1-to-s3-agentdetail-schema` and `s2-to-s3-nav-contract`; owns `s3-to-s4-absorption-proof` (ui_packet + green Tier-2 e2e demonstrating asset browsing, relationship layer, and spec-revision action in the drill-down).

## Inputs
- `docs/v2-vision/v2-design-spec.md` (drill-down/submenu IA; contrast_pairs canonical) + `docs/v2-vision/v2-vision.md` (analogy narrative + at-a-glance→drill-down flow) + `docs/v2-vision/v1-critique.md` (ABSORB verdicts: Browse → roster/equipment/materia drill-down; Graph → relationship layer; Edit → spec-revision action).
- s1: `AgentDetailSchema`, `roster.getAgentDetail`. s2: nav contract + selected-agent store.
- Existing v1 code to absorb from (read-only reference): BrowsePage (card grid), GraphPage (React Flow connectivity, RF v12 `<Handle>` gotcha), EditPage (markdown editor + agent.save/skill.save procedures).
- program.md §2 Invariants.

## Outputs (declared)
- Agent-detail page + Materia/Equipment/Abilities panel components; relationship-layer view (React Flow subset or spec-directed alternative); spec-revision action wired to existing `agent.save`/`skill.save`.
- Navigation: party card → detail → back, per s2's contract.
- Playwright Tier-2 e2e proving all three absorbed values (the absorption-proof seam artifact).

## Cross-Sprint Invariants (from program.md §2 — binding)
FF7 tokens canonical + contrast_pairs AA; analogy vocabulary exact (panels literally named Materia/Equipment/Abilities with agent-side terms in support copy); feasibility rule; AppMode∪PAGE_MAP; Zod-inferred types; vitest + Playwright Tier 2 (interaction SCs → CLI Playwright, FE-owned); base-plan portability.

## Success Criteria (sprint level)
1. From the party screen, clicking any roster agent opens its detail view with real data: skills/hooks (materia), tools (equipment), workflows (abilities), each with provenance.
2. Relationship layer renders the agent's connectivity subset (RF v12 Handle requirement honored) — Graph's ABSORB value demonstrably live.
3. Spec-revision action opens/edits/saves via existing save procedures (Edit's ABSORB value) with the editor-buffer contamination class regression-tested (session-switch buffer bug precedent).
4. e2e: all three absorption proofs green headless; a11y keyboard pass; contrast SC.
5. `npm run lint` ×3 clean; build passing; human browser check at Step 4.5.
