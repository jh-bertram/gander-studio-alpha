---
type: orchestrator-brief
sprint_id: prog-studio-v2-2026-07-s2-party-shell
program_id: prog-studio-v2-2026-07
status: PLANNED
---

# Sprint Brief: prog-studio-v2-2026-07-s2-party-shell

## Sprint ID and Program ID
- **Sprint:** `prog-studio-v2-2026-07-s2-party-shell`
- **Program:** `prog-studio-v2-2026-07` (manifest: `docs/programs/prog-studio-v2-2026-07/program.md`)

## Goal
Build the v2 shell and party-screen home: a new default `'party'` AppMode rendering the FF7 party screen — party-member cards (asset-free portraits, StatBars, card-hover Popover quick-peek) and the side submenu rail (Roster / Sessions / Progression / Programs) — live-wired to s1's `roster.getParty`.

## Sibling Awareness
- **s1-data-layer (tier 0, upstream):** publishes `PartyMemberSchema`/`PartyStatsSchema` + `roster.getParty`. `depends_on: [s1]` — MOCKED start permitted once schemas land (FE remit: typed mock matching the published schema, integration_status MOCKED); live wiring requires s1 audit PASS + env-preflight.
- **s2-party-shell (THIS SPRINT, tier 1).** `provides_to: [s3-drilldowns (nav contract), s4-retirement (nav shell)]`.
- **s3-drilldowns (tier 2):** consumes this sprint's nav contract — party card click → agent-detail mode with selected-agent state; rail exposes stable back-navigation slot.
- **s4-retirement (tier 3):** deletes BottomTabBar only after this sprint's rail covers Roster/Sessions/Progression/Programs.

**Seams:** consumes `s1-to-s2-party-schema`; owns `s2-to-s3-nav-contract` (AppMode union + PAGE_MAP entry + selected-agent store contract, named explicitly in the ui_packet) and `s2-to-s4-nav-shell` (the rail component + navigation constants).

## Inputs
- `docs/v2-vision/v2-design-spec.md` — THE design contract: party layout, portrait treatment, StatBar pattern, submenu rail, states (default/loading/empty/error/hover/focus/active), contrast_pairs (CANONICAL over states prose — AUD#4 advisory), Shadcn primitive names, legibility line.
- `docs/v2-vision/mockup/party-screen.html` — the ratified visual reference (approximation; the spec prevails on conflict, and the spec's contrast_pairs prevail over both).
- s1 outputs: `packages/shared/src/schemas.ts` (PartyMemberSchema), `roster.getParty`.
- `packages/client/src/` — pages/store/constants/hooks conventions; `globals.css` FF7 tokens; known gotcha: Shadcn `ui/*` primitives default to tokens that collide with FF7 Mako (set FF7 tokens explicitly — memorized S2-class bug).
- program.md §2 Invariants.

## Outputs (declared)
- `packages/client/src/pages/PartyPage.tsx` (or spec-named equivalent) + party-card / StatBar / portrait / submenu-rail components under `packages/client/src/components/party/`.
- `'party'` AppMode as DEFAULT route; PAGE_MAP entry; navigation constants for the rail (BottomTabBar remains until s4 — both nav surfaces coexist this sprint).
- Selected-agent store contract (Zustand) for s3 click-through.
- Card-hover Popover quick-peek (carry-in obligation from p11 AUD#4 gap).
- Playwright Tier-2 e2e: party screen renders live data, rail navigates to Sessions/Progression/Programs, popover on hover (interaction SCs closed via CLI Playwright by FE — runtime-gate owner named at packet time), a11y keyboard pass.

## Cross-Sprint Invariants (from program.md §2 — binding)
FF7 tokens canonical (no raw hex; contrast_pairs AA); analogy vocabulary exact; feasibility rule (projected label for any cost slot); AppMode∪PAGE_MAP compiler-exhaustive; Zod-inferred types only; vitest + Playwright Tier 2; base-plan portability.

## Success Criteria (sprint level)
1. Dev-server default route renders the party screen with s1 live data (integration_status LIVE by sprint close; MOCKED intermediate states documented).
2. Every rendered text pair is an AA-pass row of the spec's contrast_pairs; no clipped/overlapping text (legibility SC, screenshot-adjudicated + CLI Playwright).
3. All spec states implemented: loading, empty, error (with Retry), default, hover/focus/active; popover quick-peek works.
4. Rail navigates to the three KEEP surfaces; BottomTabBar untouched (s4 owns removal).
5. `npm run lint` ×3 clean; client build passing; e2e green headless; human browser check at Step 4.5.
