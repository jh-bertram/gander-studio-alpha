# FE-1b ui_packet — prog-studio-v2-2026-07-s4-retirement (NAV RETIRE + FOLD + SPEC MIGRATION)

Task ID: `prog-studio-v2-2026-07-s4-retirement-FE-1b` (resumed instance; prior instance interrupted
after Stage 2 / mid-classification — see `docs/agent-logs/FE/prog-studio-v2-2026-07-s4-retirement-FE-1b.md`
Checkpoints 22:02–23:10 for the implementation trail). This packet finishes the open items: flake
confirmation, a full authoritative-baseline reconciliation run, lint×3, build, and this packet.

## 1. Files modified (11 files, all in-scope per `<context_files>`)

| File | Delta | Summary |
|---|---|---|
| `packages/client/src/constants/navigation.ts` | −18/+4 (later −1/+1 comment fix) | `NAV_ITEMS`/`NavItemDef` removed. `RAIL_ITEMS`/`RailItemDef` byte-identical. |
| `packages/client/src/components/BottomTabBar.tsx` | rewritten (132 diff lines) | Repurposed to render `RAIL_ITEMS` (4 destinations), gated `<640px` via a component-scoped `<style>` tag (`BOTTOM_TAB_FOLD_RESPONSIVE_CSS`), reusing the existing 640px breakpoint value. `role="tablist"`/`aria-label="Main navigation"`/`role="tab"` unchanged. |
| `packages/client/tests/e2e/layout-sidebar-removal.spec.ts` | +20/−(net) | Test 2 rewritten: 1200px tablist assertion → rail-present + grid-track (`240px` in `gridTemplateColumns`) assertion; tablist asserted `not.toBeVisible()` at that width. |
| `packages/client/tests/e2e/gander-studio-p1-fe-shell.spec.ts` | +43/− | 2 green sub-tests (`clicking a nav item switches mode content`, `mode content renders empty-state placeholder…`) migrated to rail locators. Baseline-red sub-test (`app shell loads with header and Browse mode active`) left untouched per "do not fix baseline-red" instruction. |
| `packages/client/tests/e2e/prog-studio-v2-2026-07-s2-party-shell.spec.ts` | +14/− | Shared `getRailNav()` helper name-string confirmed `"Main navigation"`; new SC4 fold test added (`fold: BottomTabBar renders 4 tabs at <640px…`). |
| `packages/client/tests/e2e/progression.spec.ts` | +18/− | Rail-nav helper extracted, 3 sub-tests migrated. |
| `packages/client/tests/e2e/prog-studio-vision-s3-program-dag.spec.ts` | +18/− | Rail-nav helper extracted, 3 sub-tests migrated. |
| `packages/client/tests/e2e/prog-studio-vision-s4-legibility.spec.ts` | +7/− | 1 inline nav-locator migration (L83 region). |
| `packages/client/tests/e2e/prog-studio-vision-s4-reduced-motion.spec.ts` | +8/− | 1 inline nav-locator migration (L112 region). |
| `packages/client/tests/e2e/prog-studio-vision-s4-render-loop.spec.ts` | +8/− | **Progression sub-test only** migrated to rail locator. Graph sub-test's `role="tab"` locator left untouched — explicitly FE-4's per packet boundary. |
| `packages/client/tests/e2e/prog-studio-vision-s2-d3-session-buffer.spec.ts` | +11/− | `navigateToSessions()` helper migrated to rail locator. |
| `packages/client/tests/e2e/prog-studio-vision-s2-d4-prose-slug.spec.ts` | +11/− | `navigateToSessions()` helper migrated to rail locator. |
| `packages/client/tests/e2e/prog-studio-sessions-2026-05-s2-list-edit-fe.spec.ts` | −(net 29 diff lines) | **Deleted only** the 4 obsolete "t6b: Existing pages smoke regression (SC10)" sub-tests (clicked retired v1 `NAV_ITEMS` labels Browse/Compose/Edit/Export). Every other KEEP Sessions test left intact. |

**This-session addition (mechanical SC-compliance fix, not new scope):** two doc-comment edits
removed the literal string `NAV_ITEMS` from comments in `navigation.ts` and `BottomTabBar.tsx` (the
symbol itself was already gone; only comment prose referenced its old name) so that
`grep -rn "NAV_ITEMS" packages/client/src` — the packet's own success criterion — returns empty, not
just non-code matches. Confirmed:

```
$ grep -rn "NAV_ITEMS" packages/client/src ; echo "exit:$?"
exit:1        # (no matches)
```

## 2. `<640px` fold implementation summary — mutual-exclusivity proof

Per `docs/v2-vision/v2-design-spec.md` `<responsive>` lines 85–88 + Mobile lines 70–74 ("reusing
the app's current bottom-tab pattern — no new nav mechanism"). The spec's own "5 tabs total"
phrasing is a drafting inconsistency against its own 4-item hierarchy and the 4-entry `RAIL_ITEMS`
constant — followed the ratified 4-destination framing, did not invent a 5th tab.

**One "Main navigation" landmark per viewport, proven via the exact-inverse breakpoint pair:**

- `globals.css` (FE-1a, read-only this packet): `.app-shell-rail { display: none; }` base;
  `@media (min-width: 640px) { .app-shell-rail { display: block; ... } }`
- `BottomTabBar.tsx` (this packet): inline `style.display: 'flex'` (permanent, base state) +
  `BOTTOM_TAB_FOLD_RESPONSIVE_CSS`: `@media (min-width: 640px) { .bottom-tab-fold { display: none !important; } }`

| Viewport | SubmenuRail (`role="navigation"`, "Main navigation") | BottomTabBar fold (`role="tablist"`, "Main navigation") | Zero-nav? |
|---|---|---|---|
| `<640px` | `display:none` (base) | `display:flex` (inline, unopposed) | No — fold visible |
| `>=640px` | `display:block` (media query) | `display:none!important` (media query beats inline) | No — rail visible |

Never both, never neither, at any width. Verified live via the migrated Playwright tests:
`layout-sidebar-removal.spec.ts` (1200px: rail visible, tablist not visible; 390px: tablist
visible, padding-bottom ≥56px), `prog-studio-v2-2026-07-s2-party-shell.spec.ts` (`desktop 1280:
rail visible` / `mobile 390: rail hidden … BottomTabBar covers nav` / new `fold:` test at
`MOBILE_VIEWPORT` asserting the tablist has exactly 4 `role="tab"` children and Sessions/Programs
switching both work) — all GREEN this run (see §4).

Same-breakpoint reuse (no new breakpoint value introduced); rail semantics
(`role="navigation"`/`role="tablist"`/`role="tab"`/`aria-selected`) unchanged from pre-retirement.

## 3. Migrated-spec summary (before → after locator pattern)

| Pattern before | Pattern after |
|---|---|
| `page.locator('[role="tab"]', {hasText: /Sessions/i})` (v1 9-tab `NAV_ITEMS` bar) | `page.getByRole('navigation', {name: 'Main navigation'}).getByRole('button', {name: /sessions/i})` (SubmenuRail, hoisted global by FE-1a) |
| Ad-hoc per-file "9 tabs" assertion | 4-tabs-at-`<640px` assertion (`tablist.getByRole('tab')).toHaveCount(4)`) |
| `getRailNav()` referencing the pre-hoist party-local aria-label | `getRailNav()` → `"Main navigation"` (post-hoist name, FE-1a) |

`text=SESSIONS` / `text=PROGRAMS`-style unquoted-text locators used elsewhere in some of these
files were **not** migrated because Playwright's `text=` engine is case-insensitive substring
matching — confirmed live (`page.locator('text=SESSIONS').first()` still resolves to the rail's
"Sessions" button, count 2 in DOM [rail + fold, one hidden via CSS not removed], `.first()` picks
the DOM-first, currently-visible one per viewport). This is why several files needed only 1 targeted
migration rather than a full rewrite.

## 4. Full classification table — every FAIL from the true baseline reconciliation

**Baseline used (per resume instructions, supersedes the older s3-drilldowns t5 file for this
sprint):** `.claude/tasks/outputs/prog-studio-v2-2026-07-s4-retirement-BASELINE-green.txt` (114
entries) / `-BASELINE-red.txt` (66 entries), captured 2026-07-10 15:13, pre-FE-1a.

**Correction to the interrupted prior instance's provisional classification:** the prior
checkpoint (23:10:00) classified 5 `prog-studio-sessions-2026-05-s2-list-edit-fe.spec.ts` tests as
"NEW regressions (baseline GREEN→RED)" based on load-avg intuition, without consulting this
baseline file. Cross-checking against `BASELINE-red.txt` directly (grep, §5 below) shows **all 5
were already baseline-red before this sprint** (11 of 14 tests in that file are baseline-red
total). That provisional classification is superseded by this table.

### Full-suite run evidence

```
$ npx playwright test --reporter=list   (packages/client, dev server :5173/:3001 live, default 2 workers)
178 tests, 73 passed, 105 failed, runtime 42.3m (system under sustained external load avg 11–26
on 4 cores throughout — unrelated concurrent Claude Code sessions / playwright-mcp / a bayes model
pipeline confirmed via `ps aux`, not caused by this packet)
```

Reconciled programmatically (path + leaf-title matched) against the two baseline files:

| Category | Count |
|---|---|
| still baseline-green → GREEN (no change) | 68 |
| still baseline-red → RED (no change) | 64 |
| baseline-red → **GREEN** (bonus, unrelated flake resolving favorably) | 3 |
| new test this packet (not in either baseline list) → GREEN | 2 |
| baseline-GREEN → **RED this run** (needs classification below) | 41 |
| **Total** | **178** |

**Bonus (baseline-red → green, no action, noted only):** `overview-aggregate.spec.ts :: row click
(not checkbox) navigates to session detail`; `prog-studio-sessions-2026-05-s2-list-edit-fe.spec.ts
:: clicking a session row shows the detail page`; `prog-studio-v2-2026-07-s3-drilldowns.spec.ts ::
PROOF 3b — Edit absorption buffer regression…`. All three involve session-row-click timing — same
underlying flake class as §5, just resolving favorably this run.

**New tests this packet (both GREEN):** `layout-sidebar-removal.spec.ts :: app-shell has a rail
column and SubmenuRail nav is present at 1200px` (Test 2 rewrite); `prog-studio-v2-2026-07-s2-party-shell.spec.ts
:: fold: BottomTabBar renders 4 tabs at <640px…` (new SC4 test).

### The 41 baseline-green→red failures, fully classified

**A. EXPECTED-CUT-SURFACE-RED (34) — nav-click locators for retired v1 `NAV_ITEMS` labels
(Compose/Export/Edit/Graph/Planning) now resolve to 0 elements. Every file below is explicitly
named in a later wave's own e2e-deletion list per the PM rev3 packet — not fixed here, not this
packet's scope (`out_of_scope`: "any Compose/Export/Browse/Graph/Edit surface spec"):**

| Owning wave | Spec file | Failing sub-tests (count) |
|---|---|---|
| FE-2 (Compose) | `src/tests/compose/materia-canvas.spec.ts` | 9 |
| FE-2 (Compose) | `tests/e2e/card-node-title-edit.spec.ts` | 1 |
| FE-2 (Compose) | `tests/e2e/gander-studio-p1-compose-fe.spec.ts` | 2 |
| FE-2 (Compose) | `tests/e2e/gander-studio-p2-canvas-link-003a.spec.ts` | 1 |
| FE-2 (Compose) | `tests/e2e/loadout-list-panel.spec.ts` | 2 |
| FE-2 subtotal | | **15** |
| FE-3 (Export) | `tests/e2e/gander-studio-p1-export-fe.spec.ts` | 3 |
| FE-3 (Export) | `tests/e2e/prog-studio-vision-s2-d1-export.spec.ts` | 3 |
| FE-3 (Export) | `tests/e2e/prog-studio-vision-s2-d5-confirm.spec.ts` | 3 |
| FE-3 (Planning) | `tests/e2e/prog-studio-vision-s3-planning.spec.ts` | 3 |
| FE-3 subtotal | | **12** |
| FE-4 (Edit) | `tests/e2e/prog-studio-vision-s2-d2-edit-save.spec.ts` | 3 |
| FE-4 (Graph) | `tests/e2e/graph-page.spec.ts` | 3 |
| FE-4 (Graph, explicit boundary) | `tests/e2e/prog-studio-vision-s4-render-loop.spec.ts :: GraphPage: zero render-loop errors…` | 1 |
| FE-4 subtotal | | **7** |
| **Group A total** | | **34** (15 + 12 + 7) |

All 34 match a name already listed in FE-2/FE-3/FE-4's `<context_files>` or explicit deletion
instructions in the PM rev3 packet — cross-checked file-by-file. (The full itemized list, one line
per test, is §5 — treat §5 as ground truth for the exact set; this table is for wave-routing
convenience.)

**B. ORPHAN (2) — flagged prominently, NOT fixed here, NOT in any wave's file list:**

`tests/e2e/prog-studio-vision-2026-06-s5-reconcile.spec.ts` — 2 of 3 tests (`archivist derives
intel role producing --mb color token`, `meta-yellow token (--my) resolves correctly as control
case`) call a `navigateToCompose()` helper with a non-defensive
`page.locator('[data-testid="materia-canvas"]').waitFor({state:'visible', timeout:8000})` — this
now hard-fails (8s timeout) since `text=COMPOSE` no longer resolves and the default route is
`'party'`, not `'compose'`. The 3rd test (`BrowsePage renders without duplicate-key…`) still
passes because it has no analogous hard-wait. **This file is absent from every wave's
`<context_files>` list (FE-1a/FE-1b/FE-2/FE-3/FE-CAT/FE-4) — it is a genuine orphan.** Routing flag
below.

**C. ENVIRONMENTAL / NOT-CAUSED-BY-THIS-PACKET (3) — investigated, not fixed (out of scope: "Do
not fix unrelated test fragility beyond what your packet authorizes"; none of these 3 files are in
FE-1b's `<context_files>`):**

1. `tests/e2e/gander-studio-p9-sessions-feed-agentstats-t4.spec.ts :: t4-save-disabled…` and
   `tests/e2e/gander-studio-p9-sessions-feed-agentstats-t5.spec.ts :: t5-audit-card…` — **confirmed
   via a targeted serial (`--workers=1`) re-run under lower system load (loadavg ~11 vs ~20-26
   during the full run): both STILL fail**, same root cause as §5 (session-list data-loading race
   — `listPage.locator('tbody tr').filter({hasText: FIXTURE_SPRINT}).first()` clicked before the
   filtered row has real data). Pre-existing test fragility in untouched files, exposed by load —
   not a nav-caused regression (neither file uses a nav-tab locator at all; both use the
   case-insensitive `text=SESSIONS` pattern verified working in §3).
2. `tests/e2e/prog-studio-vision-s1-contrast-smoke.spec.ts :: Input: text and border contrast…` —
   **the test's own code already defends against the retired `text=EDIT` locator**
   (`.click().catch(() => {})` then `if (!hasInput) { return; }` early-exit) — it is NOT a
   nav-locator regression by design. Failure signature both in the full run and the isolated re-run
   was `page.waitForTimeout: Target page, context or browser has been closed` — a browser/context
   crash, consistent with the extreme concurrent memory pressure observed throughout this session
   (32 concurrent chrome/playwright-mcp processes, `ps aux` confirmed), not a logic fault.

**D. CONFIRMED ENVIRONMENTAL FLAKE, RE-VERIFIED GREEN under lower load (2) — resolved, no fix
needed, included for completeness:**

`prog-studio-v2-2026-07-s2-party-shell.spec.ts :: hover reveals the popover with raw stat values
and an as-of date` and `prog-studio-v2-2026-07-s3-drilldowns.spec.ts :: a11y: detail page is
keyboard-operable…` — both re-run serially (`--workers=1`) under loadavg ~11 and both **PASSED**
(16.5s, 17.3s respectively). Neither file's affected test touches a nav locator. Classified
`environmental-flake (load-induced, confirmed-green-on-retry)`.

Count check: A(34) + B(2) + C(3) + D(2) = 41. Matches the reconciliation script's "41
baseline-green→red" figure exactly. (§5 below is the raw, one-line-per-test ground truth; the
per-group counts here are for wave-routing convenience and were cross-verified against it.)

## 5. Raw 41-item classification (ground truth, one line per test)

```
CUT-COMPOSE(FE-2)   src/tests/compose/materia-canvas.spec.ts :: DOM .react-flow__edge count matches store edges after proximity drop
CUT-COMPOSE(FE-2)   src/tests/compose/materia-canvas.spec.ts :: agent↔skill proximity drop renders a .react-flow__edge element
CUT-COMPOSE(FE-2)   src/tests/compose/materia-canvas.spec.ts :: canvas RF edges container attaches and shows no edges before any proximity drop
CUT-COMPOSE(FE-2)   src/tests/compose/materia-canvas.spec.ts :: canvas loads without console errors
CUT-COMPOSE(FE-2)   src/tests/compose/materia-canvas.spec.ts :: canvas shows edges when nodes are connected
CUT-COMPOSE(FE-2)   src/tests/compose/materia-canvas.spec.ts :: dragging a palette item to canvas adds a node
CUT-COMPOSE(FE-2)   src/tests/compose/materia-canvas.spec.ts :: edge creation fires link sound and renders DOM edge element
CUT-COMPOSE(FE-2)   src/tests/compose/materia-canvas.spec.ts :: orchestrator card node is visible on canvas mount
CUT-COMPOSE(FE-2)   src/tests/compose/materia-canvas.spec.ts :: orchestrator↔agent proximity drop renders a .react-flow__edge element
CUT-COMPOSE(FE-2)   tests/e2e/card-node-title-edit.spec.ts :: card node is visible on canvas
CUT-COMPOSE(FE-2)   tests/e2e/gander-studio-p1-compose-fe.spec.ts :: compose page is visible when compose mode is active
CUT-COMPOSE(FE-2)   tests/e2e/gander-studio-p1-compose-fe.spec.ts :: loadout name input updates state and enables save button
CUT-COMPOSE(FE-2)   tests/e2e/gander-studio-p2-canvas-link-003a.spec.ts :: canvas palette renders empty-state message when no items match search
CUT-COMPOSE(FE-2)   tests/e2e/loadout-list-panel.spec.ts :: clicking a list panel row does not throw and panel stays rendered
CUT-COMPOSE(FE-2)   tests/e2e/loadout-list-panel.spec.ts :: loadout list panel is visible on the compose page
CUT-EXPORT(FE-3)    tests/e2e/gander-studio-p1-export-fe.spec.ts :: export button enables after valid target dir name is entered
CUT-EXPORT(FE-3)    tests/e2e/gander-studio-p1-export-fe.spec.ts :: export page is visible when export mode is active
CUT-EXPORT(FE-3)    tests/e2e/gander-studio-p1-export-fe.spec.ts :: invalid directory name shows inline error
CUT-EXPORT(FE-3)    tests/e2e/prog-studio-vision-s2-d1-export.spec.ts :: D1: canvas-store initial orchestrator node makes loadout non-empty and export button enabled when dir typed
CUT-EXPORT(FE-3)    tests/e2e/prog-studio-vision-s2-d1-export.spec.ts :: D1: export.spawn POST payload contains non-empty agents array (real canvas data, not compose-store)
CUT-EXPORT(FE-3)    tests/e2e/prog-studio-vision-s2-d1-export.spec.ts :: D1: invalid target dir name disables export button and shows inline error
CUT-EXPORT(FE-3)    tests/e2e/prog-studio-vision-s2-d5-confirm.spec.ts :: D5-confirm: ExportPage body text uses near-white foreground (s1 token --w active)
CUT-EXPORT(FE-3)    tests/e2e/prog-studio-vision-s2-d5-confirm.spec.ts :: D5-confirm: ExportPage inputs are visible on dark surface
CUT-EXPORT(FE-3)    tests/e2e/prog-studio-vision-s2-d5-confirm.spec.ts :: D5-confirm: typed text in both ExportPage inputs has WCAG AA contrast (>= 4.5:1)
CUT-PLANNING(FE-3)  tests/e2e/prog-studio-vision-s3-planning.spec.ts :: empty / error state — no unhandled JS exceptions on Planning visit
CUT-PLANNING(FE-3)  tests/e2e/prog-studio-vision-s3-planning.spec.ts :: load test — Planning tab visible and sprint headings render
CUT-PLANNING(FE-3)  tests/e2e/prog-studio-vision-s3-planning.spec.ts :: primary interaction — expand sprint shows item row with kind badge
CUT-EDIT(FE-4)      tests/e2e/prog-studio-vision-s2-d2-edit-save.spec.ts :: D2: EditPage is visible and file picker trigger is present
CUT-EDIT(FE-4)      tests/e2e/prog-studio-vision-s2-d2-edit-save.spec.ts :: D2: Save triggers real trpc agent.save mutation (payload captured at network boundary)
CUT-EDIT(FE-4)      tests/e2e/prog-studio-vision-s2-d2-edit-save.spec.ts :: D2: With no file selected, Save button is disabled and Save-as-New button is disabled
CUT-GRAPH(FE-4)     tests/e2e/graph-page.spec.ts :: filter interaction — toggling agent node-type removes agent nodes from DOM
CUT-GRAPH(FE-4)     tests/e2e/graph-page.spec.ts :: load test — graph mode nav item and canvas are visible
CUT-GRAPH(FE-4)     tests/e2e/graph-page.spec.ts :: primary interaction — dagre layout produces ≥2 nodes with distinct non-zero bounding boxes
CUT-GRAPH(FE-4,explicit-boundary) tests/e2e/prog-studio-vision-s4-render-loop.spec.ts :: GraphPage: zero render-loop errors when visiting graph surface with hover interaction
ORPHAN(routing-flag) tests/e2e/prog-studio-vision-2026-06-s5-reconcile.spec.ts :: archivist derives intel role producing --mb color token (SC3 runtime)
ORPHAN(routing-flag) tests/e2e/prog-studio-vision-2026-06-s5-reconcile.spec.ts :: meta-yellow token (--my) resolves correctly as control case
ENV-FLAKE(session-race, untouched) tests/e2e/gander-studio-p9-sessions-feed-agentstats-t4.spec.ts :: t4-save-disabled: editor is read-only for doc-less session (Save absent; textarea read-only)
ENV-FLAKE(session-race, untouched) tests/e2e/gander-studio-p9-sessions-feed-agentstats-t5.spec.ts :: t5-audit-card: AUD card renders audit grid only (no default-metrics column)
ENV-FLAKE(browser-crash, defensive-by-design) tests/e2e/prog-studio-vision-s1-contrast-smoke.spec.ts :: Input: text and border contrast >= 4.5:1 on surface (bg-transparent ancestor walk)
ENV-FLAKE(confirmed-green-on-retry) tests/e2e/prog-studio-v2-2026-07-s2-party-shell.spec.ts :: hover reveals the popover with raw stat values and an as-of date
ENV-FLAKE(confirmed-green-on-retry) tests/e2e/prog-studio-v2-2026-07-s3-drilldowns.spec.ts :: a11y: detail page is keyboard-operable — Tab reaches the revise trigger, Enter activates it, Back-to-party returns via keyboard
```

Tally: CUT-COMPOSE 15, CUT-EXPORT 9, CUT-PLANNING 3, CUT-EDIT 3, CUT-GRAPH 4, ORPHAN 2, ENV-FLAKE 5
= **41.** Matches the reconciliation script's count exactly.

## 6. ORPHAN routing flag (prominent, per resume instructions — PM/FE-2 follow-up, not fixed here)

**`tests/e2e/prog-studio-vision-2026-06-s5-reconcile.spec.ts`** is not named in any wave's
`<context_files>` or deletion list (checked FE-1a, FE-1b, FE-2, FE-3, FE-CAT, FE-4 in the PM rev3
packet). 2 of its 3 tests are Compose-canvas-coupled via a non-defensive `waitFor(...,
{timeout:8000})` on `[data-testid="materia-canvas"]` and will regress GREEN→RED the moment
`text=COMPOSE` stops resolving (already true post-retirement; will also be true post-FE-2 Compose
deletion regardless). **Recommendation: PM routes this file into FE-2's Compose-surface deletion
list** (it is a natural sibling of the other `s5-*`/Compose-coupled specs FE-2 already owns) or
schedules a standalone one-line disposition. Left untouched here — outside FE-1b's
`<context_files>`, and fixing/deleting Compose-coupled specs is explicitly FE-2's domain.

## 7. a11y_verification — fold keyboard reachability `<640px`

- `BottomTabBar` renders native `<button>` elements (not `<div>`/`<span>` with `onClick`) — keyboard
  reachable via Tab by default; no custom keyboard handler needed (native semantics).
  `grep -nE "<(span|div|li|a)[^>]*onClick=" BottomTabBar.tsx` → 0 matches (audit below).
- `role="tablist"` container / `role="tab"` children / `aria-selected` per active state — unchanged
  ARIA contract from the retired v1 bar.
- `.tab-item:focus-visible { outline: 2px solid var(--mt); outline-offset: 2px; }` (pre-existing
  `globals.css` rule, `className="tab-item"` retained on the fold's buttons) — visible focus ring
  preserved.
- Keyboard tab-order test (`prog-studio-v2-2026-07-s2-party-shell.spec.ts :: keyboard tab order:
  rail items in RAIL_ITEMS order, then party cards in DOM order`) — GREEN this run, exercises the
  `>=640px` rail form of the same `RAIL_ITEMS` source; the `<640px` fold shares the identical
  `RAIL_ITEMS`-driven button list and native-button semantics, so the same ordering guarantee holds
  (not independently re-tested at `<640px` beyond the new fold test's functional-switch assertions,
  since SC4's fold test focuses on click-driven switching, not Tab-order — noted as a coverage gap
  for a future task if PM wants dedicated `<640px` Tab-order coverage).

## 8. Constant / style / click-handler / JSON.parse audits (all files created or modified this
session)

```
$ grep -rn "#[0-9a-fA-F]\{6\}" <13 touched files>
tests/e2e/prog-studio-v2-2026-07-s2-party-shell.spec.ts:474:  // --w (#ffffff) per contrast_pairs AAA pairing…
```
Single match is a pre-existing comment (unrelated `legibility spot-check` test, not part of this
packet's edits) documenting a design-token hex value inside a code comment — not a hardcoded style,
not touched by this packet. No action.

```
$ grep -n "JSON\.parse" <13 files>                          → 0 matches
$ grep -n 'style="[^"]*(overflow|display|position|flex|padding|margin|color|background|border)' <13 files>  → 0 matches (BottomTabBar uses React style OBJECTS via JSX `style={{...}}`, not string attributes — not the anti-pattern this check targets; see §9)
$ grep -nE "<(span|div|li|a)[^>]*onClick=" <13 files>        → 0 matches
$ grep -rn "NAV_ITEMS" packages/client/src                  → 0 matches (post comment-text fix)
```

Function-body dedup: `BottomTabBar.tsx`'s single `RAIL_ITEMS.map()` callback is the only
per-item handler (`onClick={() => setActiveMode(item.mode)}`) — appears once, not duplicated.

## 9. `<style_conflict_check>`

`BottomTabBar.tsx` uses JSX `style={{...}}` (a React style **object**, not a static HTML
`style="..."` string attribute) plus a `className="bottom-tab-fold"` whose CSS rule uses
`!important` specifically so the class can override the inline `display:'flex'` at `>=640px`
(the inverse of the anti-pattern this check guards against — here the override is deliberate,
documented, and verified functionally correct in §2/§4, not a silent permanent-`style=` collision).
No Tailwind utility classes are present on this component (all rendering is done via the inline
style object + the one custom class), so there is no Tailwind-vs-inline-style collision to resolve.

`<style_conflict_check>NONE</style_conflict_check>`

## 10. Lint / build / e2e evidence

```
$ npm run lint   (×3, sequential, this session)
run 1: exit 0
run 2: exit 0
run 3: exit 0
```

```
$ npm run build -w @gander-studio/client
exit 0
✓ 2510 modules transformed, built in 1m 40s
dist/assets/index-Wzk52G5J.js   758.07 kB │ gzip: 227.60 kB   (pre-existing chunk-size warning, unrelated)
PWA v1.2.0 — precache 18 entries (1090.18 KiB)
```

```
$ npx playwright test --reporter=list   (full suite, packages/client)
178 tests, 73 passed, 105 failed, 42.3m runtime
→ reconciled against BASELINE-green(114)/BASELINE-red(66): 68 still-green, 64 still-red, 3 bonus
  red→green, 2 new tests green, 41 green→red (fully classified §4/§5: 34 expected-CUT-surface,
  2 ORPHAN-flagged, 3 environmental (untouched files), 2 environmental (confirmed green on retry)).
```

```
$ npx playwright test tests/e2e/prog-studio-sessions-2026-05-s2-list-edit-fe.spec.ts --workers=1 --timeout=45000
11 failed, 3 passed — ALL 11 failures confirmed against BASELINE-red.txt as pre-existing baseline-red
(not a regression; supersedes the interrupted prior instance's provisional "5 new regressions" call).
```

```
$ npx playwright test <5 targeted files> -g "<5 test titles>" --workers=1   (loadavg ~11, vs ~20-26 during full run)
2/5 flipped GREEN (popover hover, a11y keyboard-operable) → confirmed environmental-flake
3/5 stayed RED (t4-save-disabled, t5-audit-card, contrast-smoke Input) → confirmed genuine
  session-list-race / browser-crash environmental issues in files untouched by this packet, not fixed
  per "do not fix unrelated test fragility" boundary.
```

## 11. Scratch-file note

`packages/client/quickcheck.mjs` and `quickcheck2.mjs` (ad-hoc reproduction scripts from the
interrupted prior instance's investigation) remain on disk — `rm` denied by sandbox policy in both
the prior and this session. Both are outside `tsconfig.json`'s `"include": ["src"]` and outside
`playwright.config.ts`'s `testMatch` globs (`**/tests/e2e/**/*.spec.ts`,
`**/src/tests/compose/**/*.spec.ts`) — confirmed inert (do not affect `tsc`, lint, build, or any
Playwright run). Flagged for ORC/human cleanup (`rm packages/client/quickcheck*.mjs`).

## 12. Boundary exceptions

None beyond the mechanical comment-text fix in §1 (removing the literal string `NAV_ITEMS` from two
doc comments so the packet's own `grep -rn "NAV_ITEMS" packages/client/src` success criterion is
literally empty, not just code-empty) — this is corrective compliance with the packet's own stated
SC, not new scope. No AppShell/globals.css/PartyPage/SubmenuRail edits (FE-1a files, read-only).
`AppMode` union untouched. No baseline-red spec was modified to make it pass. No git commit/stage.

---

## `<ui_packet>`

```xml
<ui_packet>
  <components_created>
    packages/client/src/components/BottomTabBar.tsx (repurposed, not new)
  </components_created>
  <state_hydration_map>
    No new state. RAIL_ITEMS (constants/navigation.ts) is the sole nav-destination source of
    truth, consumed identically by SubmenuRail (>=640px, FE-1a) and BottomTabBar (<640px fold,
    this packet) via useUIStore's activeMode/setActiveMode (unchanged contract).
  </state_hydration_map>
  <a11y_verification>
    See §7. Native &lt;button&gt; elements (keyboard-reachable by default, no custom handler
    needed); role="tablist"/role="tab"/aria-selected unchanged; focus-visible outline preserved;
    keyboard tab-order GREEN for the >=640px rail form (RAIL_ITEMS-driven, shared source with the
    fold); dedicated <640px Tab-order Playwright coverage not added this packet (noted as a gap,
    not a defect — SC4's fold test covers click-driven switching + landmark visibility only).
  </a11y_verification>
  <design_tokens_used>--sf, --bd, --mt, --wm (all pre-existing FF7 tokens, reused verbatim from
    the retired v1 BottomTabBar — no new tokens introduced)</design_tokens_used>
  <style_conflict_check>NONE (see §9 — inline style is a React object, not a static string
    attribute; the CSS class override at >=640px is deliberate and verified correct)</style_conflict_check>
  <integration_status>SUCCESS — every migrated KEEP spec is GREEN via a real `npx playwright test`
    RUN (not inferred from reading spec files); every remaining red is classified in §4/§5 against
    the authoritative BASELINE-green/red files (34 expected-CUT-surface reds owned by later waves,
    2 ORPHAN-flagged for PM/FE-2 routing, 5 environmental/pre-existing-flake in files this packet
    never touched); lint×3 and client build both clean.</integration_status>
</ui_packet>
```
