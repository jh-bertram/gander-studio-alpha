# FE-CAT — prog-studio-v2-2026-07-s4-retirement — 13-Role Roster Catalog

Task ID confirmed: `prog-studio-v2-2026-07-s4-retirement-FE-CAT` (matches this dispatch's task_id — no scope consolidation, no work from other packets in this sprint's chain).

Contract: `<task_packet>` FE-CAT in `.claude/tasks/outputs/prog-studio-v2-2026-07-s4-retirement-rev3-PM-1783715959.md` (lines 258-309), followed verbatim.

## Summary

Built the 13-role roster catalog surface (`'catalog'` AppMode + lazy `RosterCatalogPage`), reached via a new, persistent "View Full Roster" CTA on the populated party home (human-ratified 2026-07-10, ORC-witnessed). Data source is `useParty`/`roster.getParty` — the same envelope PartyPage consumes — rendered fully uncapped. No new BE procedure, no `agent.list`, no RAIL_ITEMS edit, party 6-cap untouched.

## Files created

- `packages/client/src/pages/RosterCatalogPage.tsx` (87 lines) — the catalog page. Root `data-testid="roster-catalog-page"`.
- `packages/client/tests/e2e/prog-studio-v2-2026-07-s4-retirement-FE-CAT.spec.ts` (141 lines) — Tier-2 spec, 5 tests.

## Files modified

- `packages/client/src/store/ui-store.ts` — added `'catalog'` to the `AppMode` union (+3 lines, comment included).
- `packages/client/src/components/ModeContent.tsx` — added `React.lazy(() => import('../pages/RosterCatalogPage'))` (lazy-from-birth, s3 pattern) + `catalog: RosterCatalogPage` PAGE_MAP entry (+7 lines).
- `packages/client/src/pages/PartyPage.tsx` — net +24 lines:
  - Exported `PARTY_GRID_CLASS`, `PartyScreenHeader` (now takes an optional `title` prop, default `'Party Screen'` — zero behavior change for the existing call site), `PartyGridSkeleton`, `ErrorPartyState` for RosterCatalogPage's DRY reuse.
  - Added `handleViewFullRoster` (`setActiveMode('catalog')`) and rendered the persistent CTA (`<Button variant="outline">View Full Roster</Button>`) **after** the party grid, inside the same `state === 'default'` branch, wrapped in a `<>...</>` fragment.
  - `handleViewRoster` (the empty-state CTA, still targeting `'browse'`) and its `TODO(s4-cut)` comment are **untouched** — that re-point is FE-4's, per the packet's out-of-scope.

## Design decision: CTA placement (DOM order)

The packet allowed either the header region (~86-127) or the default-state branch for the CTA. I placed it **after** the grid (inside the default-state branch), not in the header, specifically because `prog-studio-v2-2026-07-s2-party-shell.spec.ts`'s `keyboard tab order: rail items in RAIL_ITEMS order, then party cards in DOM order` test asserts that the Tab stop immediately after the rail's last item is the first party card, and the next Tab lands on the second card — with zero intervening stops. Placing the CTA in the header (before the grid) would have inserted a new Tab stop between the rail and the first card, breaking that assertion. Placing it after the grid preserves the invariant exactly, which the isolated 19/19 s2-party-shell run confirms.

## DRY reuse notes (packet directive: "search before authoring new components")

RosterCatalogPage imports and reuses, verbatim, from `PartyPage.tsx`:
- `PARTY_GRID_CLASS` (Tailwind grid string)
- `PartyScreenHeader` (via the new `title` prop — "Full Roster" vs. PartyPage's default "Party Screen")
- `PartyGridSkeleton` (loading state, same shimmer treatment)
- `ErrorPartyState` (error state, same `formatPartyError` + Retry contract — accurate wording since it's the identical `roster.getParty` query)
- `derivePartyGridState` (already exported pre-FE-CAT)

Also reuses `PartyMemberCard` (imported directly, `onSelect` wired to the same `setSelectedAgentCode` + `setActiveMode('agent-detail')` nav-contract PartyPage's card click uses) and the `useParty()` hook unchanged. Only `EmptyRosterState` is catalog-specific — PartyPage's own empty-state CTA ("View Full Roster" → navigate to the roster) is meaningless from within the roster itself, so a distinct DESIGN.md-compliant empty state (icon + heading + body + Retry CTA) was written instead of reused.

No new Shadcn primitives, no new design tokens, no new BE procedure/schema.

## State hydration map

`RosterCatalogPage` → `useParty()` → `trpc.roster.getParty.useQuery()` (react-query, `staleTime: 30_000`, shared `QueryClient` instance with PartyPage — same query key, so a mode switch from the populated party home to catalog reads the already-fresh cached envelope with zero extra network round-trip) → `PartyStats.members: PartyMember[]` → `derivePartyGridState` selects `loading | error | empty | default` → `default` renders `data.members.map(...)` **uncapped** (no `.slice`, unlike PartyPage's `PARTY_GRID_DISPLAY_CAP`) into `PartyMemberCard` instances. Card click → `useUIStore.setSelectedAgentCode(code)` + `setActiveMode('agent-detail')` (unchanged nav-contract). No local component state beyond what `PartyMemberCard` itself owns (hover/popover).

## A11Y verification

- Root testid `roster-catalog-page`; loading `aria-busy="true"` (via reused `PartyGridSkeleton`); empty `role="status"` (via `EmptyRosterState`); error `role="alert"` (via reused `ErrorPartyState`/`ErrorState`).
- Cards: reused `PartyMemberCard` — native `<button>`, composite `aria-label` ("{code}, {role category}. Activity …, Stamina …, Accuracy … or not applicable."), focus-visible ring, zero nested interactive descendants (proven by the s2 suite's own per-card assertion, unchanged since PartyMemberCard itself is untouched).
- Persistent CTA: native `<button>` (Shadcn `Button`) with visible text content "View Full Roster" — no `aria-label` needed, and deliberately has none, to avoid collision with the `button[aria-label]` card-locator convention the s2/s3/FE-CAT specs all rely on to count cards.
- Keyboard operability proven end-to-end in the new spec's test 5: `Tab`/`focus()` to the CTA → `Enter` → catalog visible → `focus()` first card → `Enter` → agent-detail visible.
- Rail `aria-current` invariant: `'catalog'` is deliberately absent from `RAIL_ITEMS` (unmodified), and `SubmenuRail`'s `isActive = activeMode === item.mode` check means no rail item receives `aria-current="page"` while `activeMode === 'catalog'` — verified by inspection (no touch to SubmenuRail.tsx or navigation.ts was needed or made).

## Design tokens used (no raw hex)

`--w`, `--wd`, `--wm`, `--mt`, `--sf`, `--bd`, `--radius` — all inherited via the reused `PartyScreenHeader`/`PartyGridSkeleton`/`ErrorPartyState`/`PartyMemberCard` components; `EmptyRosterState` (the one new presentational block) uses the same token set as PartyPage's `EmptyPartyState` (`--wm` icon, `--w` heading, `--wd` body). Grep confirms zero raw hex literals across all touched/created files.

## style_conflict_check

NONE — no `style="..."` string attributes were written (all styling is either Tailwind `className` or React inline-style objects on non-conflicting properties); grep for `style="[^"]*(overflow|display|position|flex|padding|margin|color|background|border)` returned zero matches across all 5 touched/created files.

## Constant / dedup / JSON.parse / click-handler audits (all files touched/created)

```
$ grep -rn "#[0-9a-fA-F]\{6\}" <5 files>          → 0 matches
$ grep -n 'style="..."'  <5 files>                → 0 matches
$ grep -n "JSON\.parse"  <5 files>                → 0 matches
$ grep -nE "<(span|div|li|a)[^>]*onClick=" <5 files> → 0 matches
$ grep -n "style\." RosterCatalogPage.tsx | sort | uniq -d → 0 matches
$ grep -n "style\." PartyPage.tsx | sort | uniq -d        → 0 matches
```

No new magic numbers introduced beyond reused, already-named constants (`PARTY_GRID_CLASS`, `SKELETON_CARD_COUNT` — consumed only inside the now-exported `PartyGridSkeleton`, no duplicate literal).

## Lint / build evidence

```
$ npm run lint
> tsc --noEmit --project packages/shared/tsconfig.json
  && tsc --noEmit --project packages/server/tsconfig.json
  && tsc --noEmit --project packages/client/tsconfig.json
(clean, no output, exit 0)

$ npm run build -w @gander-studio/client
✓ 2499 modules transformed.
...
dist/assets/RosterCatalogPage-DlPLTv7T.js    1.44 kB │ gzip:   0.76 kB
dist/assets/StatBar-CYrNh6HM.js              4.28 kB │ gzip:   1.74 kB
dist/assets/PartyPage-BuvESLl5.js            7.47 kB │ gzip:   2.77 kB
...
✓ built in 27.12s
(RosterCatalogPage confirmed in its OWN lazy chunk — lazy-from-birth honored)
```

## e2e spec + run evidence

`e2e_spec: packages/client/tests/e2e/prog-studio-v2-2026-07-s4-retirement-FE-CAT.spec.ts`

```
$ npx playwright test tests/e2e/prog-studio-v2-2026-07-s4-retirement-FE-CAT.spec.ts --reporter=list
Running 5 tests using 1 worker
  ✓ persistent CTA: populated party home shows "View Full Roster" and routes to the catalog (4.4s)
  ✓ catalog default: renders every roster member uncapped, beyond the party 6-card cap (4.7s)
  ✓ catalog empty: honest empty state renders when the roster query yields zero members (2.9s)
  ✓ catalog error: honest error alert with Retry renders when the roster query fails (3.9s)
  ✓ a11y: CTA is keyboard-activatable, and a catalog card is keyboard-selectable to agent-detail (5.7s)
5 passed (28.0s)
```

Test design note (empty/error reachability): the catalog's empty/error branches are not reachable via a live-data user flow this sprint — `assembleParty` (server) always returns one `PartyMember` per canonical `ROSTER` entry, so `members.length === 0` never occurs with real data, and the persistent CTA only renders in the populated/default branch (the empty-state CTA that will reach catalog with a genuinely-empty roster is FE-4's future re-point of `handleViewRoster`). Those two tests pre-seed the zustand-persisted `activeMode` via `page.addInitScript` writing `localStorage['gander-ui-store']` before boot (zustand persist's default `merge` — verified against `node_modules/zustand/esm/middleware.mjs` L333 — spreads any key present in storage over the initial state, regardless of what `partialize` excludes on save), combined with `page.route` mocks. Test-only technique; no production code was added to support it.

### Required regression gates (per dispatch's "Verification you must run")

```
$ npx playwright test tests/e2e/prog-studio-v2-2026-07-s3-drilldowns.spec.ts --reporter=list
8 passed   (run #1, before full-suite)
8 passed   (run #2, after full-suite, re-confirming no residual contamination)

$ npx playwright test tests/e2e/prog-studio-v2-2026-07-s2-party-shell.spec.ts --reporter=list
19 passed  (includes the DOM-order-sensitive "keyboard tab order" test — proves the CTA's
            after-the-grid placement does not insert a Tab stop between the rail and the cards)
```

### Full-suite documentation-only run (t5-list cross-check)

```
$ npx playwright test --reporter=list
138 total, 77 passed, 61 failed  (14.5m)
```

Classified against the t5 baseline's own framework (`.claude/tasks/outputs/prog-studio-v2-2026-07-s3-drilldowns-t5-FE-1783490746.md`, which itself documents the full-suite run as "documentation-only" and flags cross-file resource-contention flakes at 2-worker parallelism):

1. **Cut-surface specs FE-4 has not yet deleted this wave** — Browse/Edit/Graph specs (`gander-studio-p1-browse-fe`, `gander-studio-p1-edit-fe`, `gander-studio-p1-fe-shell`, `graph-page.spec.ts`, `prog-studio-vision-s2-d2-edit-save`) are expected-red at this point in the serial chain (FE-CAT precedes FE-4). Not this packet's territory.
2. **Sessions/Analyze-tab fixture-row full-suite-contention flakes** — a large cluster of failures (`s3-t2/t3/t4/t5a-*`, `prog-studio-vision-s3-timeline-events`, `prog-studio-vision-s4-legibility`, `agent-timeline-zoom`, `overview-aggregate`, `p6-t1-timeline-buffer`, most of `prog-studio-sessions-2026-05-s2-list-edit-fe`) share the identical failure signature `locator('tbody tr').filter({hasText: <fixture>}).first() — element(s) not found`, matching t5's own documented 2-worker resource-contention class. None reference party/catalog/CTA files.
3. **One full-suite-only flake, re-confirmed via 3 separate isolated runs**: `prog-studio-v2-2026-07-s3-drilldowns.spec.ts` PROOF 3a appeared in the full-suite failure list but passed cleanly in 3 independent isolated runs (before the full-suite run, and twice after) — matches the exact pattern t5 documented for a different test (`s2-party-shell.spec.ts:250`, also environmental).
4. **ONE newly-observed pre-existing red, flagged for ORC routing, NOT fixed here (out of FE-CAT's scope):** `prog-studio-vision-s2-d3-session-buffer.spec.ts` — 2 of 3 tests fail even in complete isolation (`sessions-detail-page` testid not appearing after a session-row click). Investigated read-only: this spec's nav locator was already correctly migrated by FE-1b (confirmed via its `// MIGRATED (s4 FE-1b)` comment and rail-scoped selector), so the failure is unrelated to nav retirement or to any file this packet touched — it is a pure Sessions-surface row-click/detail-page regression. Not in FE-CAT's `context_files`; not fixed per Task Boundary Compliance (no consolidation of out-of-scope fixes). Recommend ORC route to a dedicated Sessions-surface fix packet or flag for FE-4/BE-1 awareness since the packet's own text names this file as the KEEP session-save spec that must stay green.

No failure in the full-suite run is attributable to any file this packet created or modified.

## data_contract_verified

N/A — no Chart.js tooltip or named-field data access was written this packet.

## focus_trap_visibility_filter_confirmed

N/A — no `role="dialog"`/`aria-modal="true"` primitive was authored or modified this packet.

## position_fixed_confirmed

N/A — no Chart.js external tooltip callback was written this packet.

<ui_packet>
  <components_created>
    packages/client/src/pages/RosterCatalogPage.tsx
  </components_created>
  <components_modified>
    packages/client/src/store/ui-store.ts
    packages/client/src/components/ModeContent.tsx
    packages/client/src/pages/PartyPage.tsx
  </components_modified>
  <state_hydration_map>useParty() -> trpc.roster.getParty.useQuery() (shared QueryClient/query-key with PartyPage, staleTime 30s) -> PartyStats.members -> derivePartyGridState (loading|error|empty|default) -> default renders data.members.map (UNCAPPED, no .slice) into PartyMemberCard -> onSelect -> setSelectedAgentCode + setActiveMode('agent-detail'). No new hook, no new BE procedure, no agent.list.</state_hydration_map>
  <a11y_verification>roster-catalog-page root testid; aria-busy loading (reused PartyGridSkeleton), role="status" empty (EmptyRosterState), role="alert" error (reused ErrorPartyState/ErrorState); cards reuse PartyMemberCard verbatim (native button, composite aria-label, focus-visible ring, zero nested interactive descendants); persistent CTA is a plain-text native button (no aria-label, avoids card-locator collision); keyboard path Tab/focus->Enter proven end-to-end in spec test 5; no rail item gets aria-current while activeMode==='catalog' (catalog absent from RAIL_ITEMS, verified by inspection).</a11y_verification>
  <design_tokens_used>--w, --wd, --wm, --mt, --sf, --bd, --radius (all via reused PartyPage components); zero raw hex; zero new tokens.</design_tokens_used>
  <style_conflict_check>NONE</style_conflict_check>
  <e2e_spec>packages/client/tests/e2e/prog-studio-v2-2026-07-s4-retirement-FE-CAT.spec.ts (5/5 passed)</e2e_spec>
  <regression_gates>s3-drilldowns.spec.ts 8/8 (x2 confirmed); s2-party-shell.spec.ts 19/19; lint x3 clean; client build passing (RosterCatalogPage in its own lazy chunk)</regression_gates>
  <full_suite_crosscheck>138 total / 77 passed / 61 failed (documentation-only); no failure attributable to this packet's files; 1 pre-existing unrelated red (prog-studio-vision-s2-d3-session-buffer.spec.ts) flagged for ORC routing, not fixed (out of scope)</full_suite_crosscheck>
  <integration_status>SUCCESS</integration_status>
</ui_packet>
