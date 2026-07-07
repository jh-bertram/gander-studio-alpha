---
type: orchestrator-brief
sprint_id: prog-studio-v2-2026-07-s1-data-layer
program_id: prog-studio-v2-2026-07
status: PLANNED
---

# Sprint Brief: prog-studio-v2-2026-07-s1-data-layer

## Sprint ID and Program ID
- **Sprint:** `prog-studio-v2-2026-07-s1-data-layer`
- **Program:** `prog-studio-v2-2026-07` (manifest: `docs/programs/prog-studio-v2-2026-07/program.md`)

## Goal
Build the v2 data layer: Zod schemas, tRPC procedures, and parsers that power the FF7 party screen and per-agent drill-downs with REAL corpus-derived stats — replacing the p11 mockup's static sample data with live aggregation over the on-disk event/after-action/agent-log corpus.

## Sibling Awareness
- **s1-data-layer (THIS SPRINT, tier 0):** the party/agent-detail data layer. `provides_to: [s2-party-shell, s3-drilldowns]`. No incoming deps.
- **s2-party-shell (tier 1):** FE shell + party-screen home consuming `roster.getParty`. Consumes seam `s1-to-s2-party-schema`.
- **s3-drilldowns (tier 2):** FE agent-detail screens consuming `roster.getAgentDetail`. Consumes seam `s1-to-s3-agentdetail-schema`.
- **s4-retirement (tier 3):** surface cuts + nav consolidation. No direct seam with s1.

**Seams this sprint OWNS (produce exactly these contracts):**
1. `s1-to-s2-party-schema` — `PartyMemberSchema`, `PartyStatsSchema` in `packages/shared/src/schemas.ts`; procedure `roster.getParty` → `PartyMember[]` sorted by activity recency. Card-renderable record: agent code, role/materia color key, portrait seed, named stat bars (0-100 normalized + raw + feasibility tag).
2. `s1-to-s3-agentdetail-schema` — `AgentDetailSchema`; procedure `roster.getAgentDetail(code)`: equipment/materia/abilities lists (tools / skills+hooks / workflows with provenance paths), relationship edges (connectivity subset), quality stats with attribution-side declared.

## Inputs
- `docs/v2-vision/session-data-inventory.md` — the stat catalog. Implement the AVAILABLE-NOW candidates needed by the spec's party bars + drill-downs; §2.1 attribution flip is the derivation contract; §3 blocks tokens/cost.
- `docs/v2-vision/v2-design-spec.md` — stat-bar semantics (Activity/Stamina/Accuracy per its sample-data appendix definitions) + agent-detail panel content.
- `packages/server/src/parsers/` — existing parsers (events, stats, sessions, progression, connectivity). EXTEND, don't duplicate (DRY): the event-log parser + aggregate-stats are the base; connectivity parser feeds the relationship subset.
- `packages/shared/src/schemas.ts`, `packages/server/src/router.ts` — existing schema/router conventions.
- `docs/programs/prog-studio-v2-2026-07/program.md` §2 Invariants (copied below).

## Outputs (declared — skein checks these)
- `packages/shared/src/schemas.ts` — PartyMemberSchema, PartyStatsSchema, AgentDetailSchema exports (+ z.infer types).
- `packages/server/src/parsers/` — new/extended parsers: party-stats aggregation (attribution flip, ghost rate, activity/stamina/accuracy), agent-detail assembly (tools/skills/hooks/workflows per agent from GANDER_ROOT specs + connectivity).
- `packages/server/src/router.ts` — `roster.getParty`, `roster.getAgentDetail` procedures (router count + CLAUDE.md table updated by s4, not here).
- vitest suites in `packages/server/src/parsers/__tests__/` covering: attribution-flip correctness against fixture events (gate-id vs implementer-id), normalization bounds, missing/malformed-corpus behavior (silent-empty class forbidden — absent data must be distinguishable from zero), feasibility tagging.

## Cross-Sprint Invariants (from program.md §2 — binding)
- contrast_pairs table canonical (UI sprints; noted for schema copy fields).
- FF7 runtime tokens canonical; no Clarity work.
- Analogy vocabulary exact: Materia→Skills+Hooks, Equipment→Tools, Abilities→Workflows (use in schema field names: `materia: {skills, hooks}`, `equipment: tools`, `abilities: workflows`).
- Feasibility rule: NEEDS-SCHEMA-EXTENSION stats (tokens/cost) are NOT implemented as real fields; if a stat slot is reserved, it carries `feasibility: 'projected'`.
- Attribution semantics declared per stat (which side of the gate/implementer flip).
- Zod at every boundary; TS strict; `<Entity>Schema` naming; z.infer types.
- Navigation pattern untouched this sprint (FE sprints own it).
- vitest for parsers; base-plan portability.

## Success Criteria (sprint level — PM decomposes against these)
1. `roster.getParty` returns live PartyMember[] for the real 13-agent roster with per-agent stat bars derived from the actual corpus (no hardcoded sample values); each stat carries raw value, 0-100 normalized value, derivation id, and feasibility tag.
2. Per-implementer first-pass audit rate implements the §2.1 attribution flip and is fixture-tested against synthetic events where gate-id ≠ implementer-id.
3. Ghost/stall rate and event-type coverage stats implemented per inventory §2.2/§2.3 (AVAILABLE-NOW set); schema-invalid corpus lines (e.g. the known missing-agent_id line) are counted and surfaced, never silently dropped.
4. `roster.getAgentDetail(code)` returns equipment (tools), materia (skills+hooks), abilities (workflows) with provenance paths readable from GANDER_ROOT, plus the connectivity relationship subset.
5. Tokens/cost appears ONLY as a `projected` placeholder (DEFERRED-P9-1 cited in code comment at the definition site).
6. `npm run lint` (tsc ×3) clean; server vitest suite green; no client-package changes.
7. Env preflight applies at FE consumption time, not here; but procedures must respond on the dev server (`:3001`) for the s2 wave's env-preflight to pass.
