---
type: program-manifest
program_id: prog-studio-v2-2026-07
created: 2026-07-07
status: STITCHED
---

# Program: prog-studio-v2-2026-07 — Gander Studio v2 (FF7 Party-Screen Rebuild)

## 1. Goal

**Verbatim human authorization (2026-07-07):** "this design looks great to me. push this sprint, and let's keep it moving" — ratifying the `gander-studio-p11-v2-vision` design package and authorizing the v2 implementation.

**Restatement.** Rebuild Gander Studio as v2 per the ratified design package under `docs/v2-vision/`: the app's purpose shifts from composing/preparing loadouts (now automated) to REVIEWING the team — stats, contributions, past performance. The home surface becomes the FF7 "party screen" (active agents with dramatic asset-free portraits + stat bars, side submenu rail: Roster / Sessions / Progression / Programs). Per-agent drill-downs absorb Browse/Graph/Edit via the ratified analogy (Materia → Skills + Hooks, Equipment → Tools, Abilities → Workflows). Compose/Export/Planning are cut. Sessions/Progression/Programs carry forward under the new IA.

## 2. Invariants (cross-sprint)

- **Design contract:** `docs/v2-vision/v2-design-spec.md` is the binding spec for all v2 UI. Its `contrast_pairs` table is CANONICAL over its states-section prose (AUD#4 advisory, ratified close-out) — all text token pairs must be AA-pass rows from that table.
- **Palette:** FF7 runtime tokens (`--void/--sf/--sfh/--mt/--w/--wm/--materia-*` in `packages/client/src/globals.css`) are canonical per DESIGN.md Decision Record A + human ratification 2026-07-07. No Studio-Clarity migration work in this program; new tokens are proposed via DESIGN.md decision records, never raw hex.
- **Analogy vocabulary (UI copy):** Materia → Skills (active/cast) and Hooks (passive/auto-trigger); Equipment → Tools; Abilities → Workflows. Use these exact mappings in labels, headings, and code identifiers (e.g. `MateriaPanel` renders skills+hooks).
- **Stats feasibility rule:** only AVAILABLE-NOW stats (per `docs/v2-vision/session-data-inventory.md`) render as real data. NEEDS-SCHEMA-EXTENSION stats (tokens/cost "MP", DEFERRED-P9-1) are either omitted or visibly labeled "projected / needs schema extension." Never render aspirational data as real.
- **Attribution semantics:** `AUDIT_FAIL`/`CRITIQUE_BLOCK` events carry the GATE agent's `agent_id`, not the implementer's. Per-implementer rates derive via the backward-attribution flip (inventory §2.1). Any per-agent quality stat must state which side of the flip it reports.
- **API boundary:** every new procedure gets a Zod schema in `packages/shared/src/schemas.ts` (`<Entity>Schema` naming, types via `z.infer`); tRPC routers in `packages/server/src/router.ts`; parsers in `packages/server/src/parsers/`. TS strict; no `any` without justification.
- **Navigation pattern:** `AppMode` union ↔ `PAGE_MAP: Record<AppMode,…>` stays compiler-exhaustive. New modes extend the union; removed modes delete their union members so the compiler forces map cleanup.
- **Testing:** vitest for parsers/aggregation (server) + component logic (client); Playwright e2e for each new surface (Tier 2 spec per new page); interaction-class runtime SCs are closed via CLI Playwright by the implementing agent (auditor MCP set has no interaction primitives).
- **Base-plan portability:** all deliverables plain files; no Workflow-tool dependencies in shipped mechanisms.
- **Carry-in obligations:** the card-hover Popover quick-peek (spec-only in the p11 mockup) MUST land in s2; keyboard navigability per spec accessibility_spec.

## 3. Sprint Roster

| sprint_id | goal | depends_on |
|---|---|---|
| prog-studio-v2-2026-07-s1-data-layer | BE: party/agent-detail data layer — Zod schemas + tRPC procedures + parsers for party-screen stats (activity/stamina/accuracy per spec semantics), attribution-flip quality rates, ghost rates, event-type coverage widening (29 ev types), per-agent equipment/materia/abilities (tools/skills/hooks/workflows) detail | — |
| prog-studio-v2-2026-07-s2-party-shell | FE: v2 shell + party-screen home — 'party' AppMode as default route, party-member cards (asset-free portraits, StatBars), side submenu rail (Roster/Sessions/Progression/Programs), card-hover Popover quick-peek, empty/error/loading states, live-wired to s1 | s1 |
| prog-studio-v2-2026-07-s3-drilldowns | FE: per-agent drill-down screens absorbing Browse/Graph/Edit — agent-detail view with Materia (skills+hooks) / Equipment (tools) / Abilities (workflows) panels, relationship layer (Graph absorption), spec-revision action (Edit absorption), navigable from party cards | s1, s2 |
| prog-studio-v2-2026-07-s4-retirement | FE+docs: retire Compose/Export/Planning surfaces, consolidate Sessions/Progression/Programs under the submenu IA, remove the 9-tab BottomTabBar in favor of the v2 nav, update CLAUDE.md surfaces/procedures tables + DESIGN.md, prune dead stores/components | s2, s3 |

## 4. Dependency DAG

```
s1-data-layer → s2-party-shell → s3-drilldowns → s4-retirement → [integration / skein]
s1-data-layer → s3-drilldowns
s2-party-shell → s4-retirement
```

Topological tiers: T0 = s1 · T1 = s2 · T2 = s3 · T3 = s4 · T4 = integration terminus.
Visualization: [program-map.html](program-map.html)

**Sequencing note.** s2 may begin MOCKED (typed mock matching s1's published Zod schemas — FE remit) once s1's schema seam lands, without waiting for s1 audit close; live wiring waits for s1 audit PASS. Absorption-before-cut is a hard order: s4 must not cut Browse/Graph/Edit's surfaces until s3's drill-downs carry their value (v1-critique ABSORB targets).

## 5. Integration Seams

| seam_id | from_sprint | to_sprint | artifact | format | contract |
|---|---|---|---|---|---|
| s1-to-s2-party-schema | s1-data-layer | s2-party-shell | packages/shared/src/schemas.ts | Zod: PartyMemberSchema, PartyStatsSchema (+ inferred types) | Card-renderable per-agent record: agent code, role/materia color key, portrait seed, named stat bars w/ 0-100 normalized values + raw values + feasibility tag; procedure `roster.getParty` returns PartyMember[] sorted by activity recency |
| s1-to-s3-agentdetail-schema | s1-data-layer | s3-drilldowns | packages/shared/src/schemas.ts | Zod: AgentDetailSchema | Per-agent equipment/materia/abilities lists (tools/skills+hooks/workflows w/ provenance paths), relationship edges (connectivity subset), quality stats w/ attribution-side declared; procedure `roster.getAgentDetail(code)` |
| s2-to-s3-nav-contract | s2-party-shell | s3-drilldowns | packages/client/src/constants/navigation.ts + AppMode union | TS union + PAGE_MAP entry | Party card click → agent-detail mode with selected-agent state (store contract named in s2's ui_packet); submenu rail exposes a stable slot for drill-down back-navigation |
| s2-to-s4-nav-shell | s2-party-shell | s4-retirement | v2 submenu rail component | React component + navigation constants | The rail is the sole v2 nav surface; s4 deletes BottomTabBar only after the rail covers Roster/Sessions/Progression/Programs routes |
| s3-to-s4-absorption-proof | s3-drilldowns | s4-retirement | s3 ui_packet + e2e specs | Playwright Tier-2 specs green | Browse/Graph/Edit value demonstrably live in drill-downs (asset browsing, relationship layer, spec-revision action) before s4 cuts those surfaces |

### Seam-interpretation notes (ORC-recorded, 2026-07-07 — s1 Critic round)

1. **s1-to-s2-party-schema:** `roster.getParty` returns the `PartyStatsSchema` ENVELOPE `{members: PartyMember[], diagnostics, activityAnchor}` — not a bare array. The envelope carries the invalid-line diagnostics the silent-empty invariant requires (mirrors the `session.list` `{sessions, skipped}` precedent). s2 consumes `members` for cards and `diagnostics` for a data-quality affordance. The seam's "PartyMember[] sorted by activity recency" describes `members`' content and order.
2. **s1-to-s3-agentdetail-schema:** `abilities` (workflows) has NO durable per-agent data source (base-plan portability makes workflow orchestration throwaway scaffolding). s1 ships `abilities: []` plus a surfaced `dataQualityNote`; s3 must render an honest "no recorded abilities" state, not hide the panel. A durable workflow-usage ledger is a candidate future schema extension (same family as DEFERRED-P9-1) — record in deferred-work at s1 close.

## 6. Success Criteria (program level)

1. Default route renders the party screen with REAL corpus-backed stats (no sample-data hardcode) for the active roster; console-clean; AA-compliant per the spec's contrast_pairs.
2. Every v1-critique verdict is realized: 3 KEEP surfaces reachable under the new IA; 3 ABSORB values live in drill-downs; 3 CUT surfaces removed (routes, tabs, dead stores/components pruned; `npm run lint` ×3 packages clean; client build passing).
3. All NEEDS-SCHEMA-EXTENSION stats either absent or visibly "projected"-labeled (DEFERRED-P9-1 honored program-wide).
4. Each sibling closes through the full pipeline (Critic gate, audit PASS, REQVAL COVERED, after-action) with per-sprint human browser verification at Step 4.5.
5. skein reconciliation post-program: all 5 seams STITCHED; program status → STITCHED.

## 7. Status

STITCHED — reconciled by skein 2026-07-11T18:10:40Z at HEAD `dcfede7`. All 4 siblings DONE with per-sprint human 4.5 verification; **all 5 integration seams STITCHED** (SC-5 satisfied; see [skein-report.md](skein-report.md) + [skein-map.html](skein-map.html)). Skein recommendation: NEEDS_INTEGRATION on the conservative residue threshold only — an optional mop-up/sign-off brief was written at `sprints/integration/orchestrator_brief.md` (no seam repair required; human decides whether to dispatch, decline, or ledger). Gander-side process residue routes to the planned reflect pass, not the integration brief.
