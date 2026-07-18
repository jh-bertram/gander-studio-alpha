# completion_packet — prog-studio-v2-2026-07-s4-retirement-DOCS-1

**Agent:** FE#8 | **Task ID:** prog-studio-v2-2026-07-s4-retirement-DOCS-1 (Wave 7 of 8, FINAL implementation packet)
**Contract:** `.claude/tasks/outputs/prog-studio-v2-2026-07-s4-retirement-rev3-PM-1783715959.md` lines 443-494

## files_modified

| File | Change |
|------|--------|
| `/home/jhber/projects/gander-studio-alpha/CLAUDE.md` | Surfaces table, navigation description, tRPC procedures table+heading, architecture tree, Known Issues bundle line, Env table, intro line |
| `/home/jhber/projects/gander-studio-alpha/DESIGN.md` | Appended Decision Record E — v2 IA structural record (no new tokens) |
| `/home/jhber/projects/gander-studio-alpha/docs/deferred-work.md` | New `## Sprint: prog-studio-v2-2026-07-s4-retirement (2026-07-10)` header with 4 human-ratified deferrals; marked DEFERRED-V2S2-2 resolved |

No source-code files touched. No git commands run. Dev servers (vite + server) left running throughout, confirmed still up at close.

## Procedure-count evidence (18 == 18)

```
$ grep -c "t\.procedure" packages/server/src/router.ts
18
```

Sub-router structure confirmed by reading `router.ts` at HEAD: `agentRouter` (list/get/save=3), `skillRouter` (list/get/save=3), `hookRouter` (list=1), `sessionRouter` (list/get/getStats/saveEdit/aggregateStats/getRaw=6), `progressionRouter` (getLedger=1), `programRouter` (getDag=1), `rosterRouter` (getParty/getAgentDetail=2), plus top-level `health` (1). Sum = 3+3+1+6+1+1+2+1 = **18**. Routers = 7 named sub-routers + `health`'s implicit top-level grouping = **8**, matching the packet's "expected 18 across 8 routers" framing (confirmed by count, not trusted from the packet text).

CLAUDE.md's tRPC procedures code block was rewritten to list exactly these 18 procedures with their actual output shapes (cross-checked against `router.ts` `.output(...)` calls and `packages/shared/src/schemas.ts`), removing `loadout.*`, `export.spawn`, `connectivity.getGraph`, `planning.list` and adding `roster.getParty` / `roster.getAgentDetail`. A note documents that `ConnectivityGraphSchema` is retained in `schemas.ts` even though `connectivity.getGraph` was removed (confirmed via `grep -n "^export const ConnectivityGraphSchema" packages/shared/src/schemas.ts` → line 212 present).

## Per-table verification notes

**Surfaces table (CLAUDE.md).** Verified against `packages/client/src/components/ModeContent.tsx` `PAGE_MAP` at HEAD (the authoritative AppMode→component map): `party: PartyPage, sessions: SessionsRouter, progression: ProgressionPage, programs: ProgramDagPage, 'agent-detail': AgentDetailPage, catalog: RosterCatalogPage`. Six AppMode union members confirmed directly from `ui-store.ts` line 10: `'party' | 'sessions' | 'progression' | 'programs' | 'agent-detail' | 'catalog'`. Rewrote the table to exactly these 6 rows, removed Browse/Compose/Edit/Export/Graph/Planning rows.

**Navigation line (CLAUDE.md).** Verified against `AppShell.tsx` (SubmenuRail mounted globally before BottomTabBar), `globals.css` lines 90-122 (`.app-shell-rail` `display:none` below 640px / `display:block` + `grid-area: rl` at `≥640px`, reusing the existing 640px breakpoint), `SubmenuRail.tsx` (`role="navigation"` `aria-label="Main navigation"`, consumes `RAIL_ITEMS`), `BottomTabBar.tsx` (repurposed to `RAIL_ITEMS`, `role="tablist"`/`role="tab"`, same `aria-label="Main navigation"`, folds via a component-scoped `@media (min-width:640px){ display:none }` rule — the exact inverse of the rail's breakpoint, confirming mutual exclusivity / never-zero-nav). `navigation.ts` confirms `RAIL_ITEMS` = 4 entries (Roster→`party`, Sessions, Progression, Programs) and that the v1 9-tab `NAV_ITEMS` config is retired (comment at top of file states this explicitly).

**Architecture tree (CLAUDE.md).**
- `pages/` — `ls packages/client/src/pages/` → `AgentDetailPage.tsx, PartyPage.tsx, ProgramDagPage.tsx, ProgressionPage.tsx, RosterCatalogPage.tsx, sessions/` (containing `SessionsRouter.tsx`, `SessionListPage.tsx`, `SessionDetailPage.tsx`, `tabs/`). Tree rewritten to match.
- `store/` — `ls packages/client/src/store/` → `analyzeStore.ts, session-store.ts, ui-store.ts` (+ `__tests__`). The stale "session-picker" name in the old doc corrected to the actual file `session-store.ts`; `analyzeStore` retained per instruction; `browse`/`compose`/`edit`/`canvas` stores removed (confirmed absent on disk).
- `parsers/` — `ls packages/server/src/parsers/` → confirmed no `connectivity-*` or `planning-*` parser file present (both already removed); description rewritten to list the actual parser set (agents, agent roles, skills, hooks, sessions, events, stats, party/roster, program, progression).
- `shared/src/schemas.ts` entity list — rewrote from `grep -n "^export const .*Schema\s*=" packages/shared/src/schemas.ts` output: no `Loadout`/`Export`/`Planning` schemas remain; `Party`/`AgentDetail` schemas added (confirmed at lines 345/392).

**Bundle baseline (CLAUDE.md Known Issues).** Ran a fresh production build: `npm run build -w @gander-studio/client` → max chunk `dist/assets/index-BMlW7Uvq.js` **407.00 kB** (gzip 120.62 kB), no Vite chunk-size warning emitted. Source stated inline in CLAUDE.md ("re-measured via a fresh `npm run build -w @gander-studio/client`, 2026-07-10"). This also resolves `DEFERRED-V2S2-2` (marked done in `docs/deferred-work.md`).

**Env table (CLAUDE.md).** `EXPORT_BASE_DIR` marked deprecated/unused — confirmed via `grep -rn "EXPORT_BASE_DIR"` returning only `env.ts` (definition) and two test files (no live router consumer, since `export.spawn` is removed). `LOADOUTS_DIR` kept required (`env.ts` `requireEnv`) with its description corrected — it no longer backs a loadout feature (removed); it now only anchors `SESSIONS_EDITS_DIR`'s default path, confirmed at `env.ts` line 33.

## DESIGN.md v2-IA decision record text

Appended "Decision Record E — v2 IA: 9→6 Surface Consolidation & Nav-Shell Retirement (s4-retirement, 2026-07-10)" directly after Record D, matching the existing Decision Record format (Type/Problem/Resolution/Non-goals prose). States `design_system_source: DESIGN_MD`, explicitly notes no new visual tokens (reuses `--sf`/`--sfh`/`--mt`/`--wm`/`--bd`, all pre-existing). Cites the ratification chain: 2026-07-07 (`v2-design-spec.md`, UI#2), 2026-07-08 (s3-drilldowns sign-offs, s3-drilldowns.spec.ts 8/8 + s2-party-shell.spec.ts 19/19 cited green), 2026-07-10 (human-ratified, ORC-witnessed: Roster Catalog + persistent CTA + the 4 deferrals). Covers: 9→6 surface consolidation, 9-tab v1 `BottomTabBar`/`NAV_ITEMS` retirement, hoisted global `SubmenuRail` + its `<640px` `BottomTabBar` fold (mutual exclusivity via the shared 640px breakpoint), the 6-agent homescreen cap (`PARTY_GRID_DISPLAY_CAP = 6`) + persistent "View Full Roster" CTA → `catalog`. Full text is in `DESIGN.md` (see file; not re-pasted here to avoid drift between this packet and the live doc).

## deferred-work.md — the 4 entries with 2026-07-10 authorization citation

New header: `## Sprint: prog-studio-v2-2026-07-s4-retirement (2026-07-10)`, appended after the existing `## Sprint: prog-studio-v2-2026-07-s3-drilldowns (2026-07-08)` section (file's chronological-append convention preserved). All 4 entries cite `human-ratified 2026-07-10 (ORC-witnessed)`:

1. **DEFERRED-V2S4-1** — Roster rail collapse/expand not implemented (new entry; rail ships fixed 240px, distinct from the delivered mobile fold).
2. **DEFERRED-V2S2-1** — 390px header/main overflow, carried forward (originally logged under s2-party-shell, routed to s4 there; confirmed s4 did not touch `Header.tsx`/`ModeContent.tsx` padding, so it's re-deferred rather than resolved).
3. **DEFERRED-V2S3-1** — Retire `ROSTER_AGENT_NAME_BY_CODE` via schema extension, carried forward (originally logged under s3-drilldowns; no s4 packet touched `AgentDetailSchema`/`ReviseSpecAction.tsx`).
4. **DEFERRED-V2S3-2** — `contrast_pairs` row for `--mg` on `--sfh`, carried forward (originally logged under s3-drilldowns; DOCS-1 confirms no new contrast pairs introduced this sprint).

Also resolved (not one of the 4 new deferrals, but directly closed by this task): **DEFERRED-V2S2-2** (CLAUDE.md bundle baseline) marked ✅ DONE with a resolution note citing the 407.00 kB re-measurement — this matches the packet's own indexing of "(d) stale CLAUDE.md bundle baseline" as `<addressed task="DOCS-1"/>` (not one of the 4 `<deferred>` phrases), so closing it (rather than re-deferring it) is the correct action per the plan of record.

Out-of-scope constraint honored: `Do NOT document deferred items as done` was read as applying to the newly-recorded deferrals (all 4 are recorded as open/deferred, none marked done) — it does not bar accurately closing an item this same task genuinely resolved (V2S2-2), which is disk-verified true (the CLAUDE.md bundle line was in fact updated in this same task).

## Lint evidence

```
$ npm run lint
> tsc --noEmit --project packages/shared/tsconfig.json && tsc --noEmit --project packages/server/tsconfig.json && tsc --noEmit --project packages/client/tsconfig.json
(exit 0)
```

Run twice: once before any doc edits (baseline confirmation) and once after all three files were written (exit 0 both times) — confirms zero source-code impact from this docs-only task.

## SC grep-checks (self-run)

- **No stale surface names outside historical/Known-Issues context:** `grep -n "BrowsePage\|ComposePage\|EditPage\|ExportPage\|GraphPage\|PlanningPage\|ProgramsPage\|BottomTabBar (role\|9 tabs\|loadout\.\|export\.spawn\|connectivity\.getGraph\|planning\.list\|session-picker\|canvas-store" CLAUDE.md` → only 2 remaining matches, both inside the explicit "removed in `prog-studio-v2-2026-07-s4-retirement` (BE-1)" historical-removal note and the `EXPORT_BASE_DIR` deprecation note — both are the SC-sanctioned "historical/Known-Issues context," not live surface claims.
- **Procedure table count == router.ts count == 18:** confirmed above.
- **Architecture tree matches disk:** confirmed above via `ls`/`grep` against `pages/`, `store/`, `parsers/`, `schemas.ts`.

## out_of_scope compliance

- No code edits (only `.md` files touched — `CLAUDE.md`, `DESIGN.md`, `docs/deferred-work.md`).
- No new FF7/design tokens (Decision Record E explicitly states `design_system_source: DESIGN_MD`, reuses existing tokens only).
- No hardcoded procedure count — the 18 figure is derived (`grep -c "t\.procedure"`) and cross-checked against the sub-router breakdown, not transcribed from the packet's "expected 18" hint.
- Deferred items recorded as deferred (not done); the one item marked done (DEFERRED-V2S2-2) is genuinely resolved by this same task, per the packet's own `<addressed task="DOCS-1"/>` indexing for that specific item.

## Minor additional accuracy fix (flagged, not packet-mandated)

The CLAUDE.md intro line ("Local-first web app for browsing, composing, editing, and exporting Claude Code agent team loadouts") named four retired features (composing/editing/exporting/loadouts). Not explicitly listed in the packet's 6 CLAUDE.md bullet items, but directly false post-retirement, so it was corrected as an in-file accuracy fix within the same document I was already authorized to edit. Flagging per "docs are measurements, not recollections" discipline in case ORC wants this called out separately.

## Known pre-existing staleness NOT addressed (out of this packet's explicit scope)

CLAUDE.md's `--redb` contrast Known Issues line ("`#cf3c3c` at 4.07:1 ... tracked as DEFERRED-006") is itself stale — `DEFERRED-006` was resolved by `DESIGN.md` Decision Record D (`--redb` lightened to `#e05555`, 5.22:1 AA) prior to this sprint. This staleness predates `prog-studio-v2-2026-07-s4-retirement` and is unrelated to the v2 IA retirement; left untouched to avoid scope creep beyond the packet's explicit "Known Issues bundle line" instruction. Surfacing here for a future small docs packet.

## integration_status

SUCCESS — all three files updated per the packet's success_criteria, all claims disk-verified at HEAD+working-tree state, lint ×3 clean before and after, zero source-code edits, no git commands run, dev servers left running.
