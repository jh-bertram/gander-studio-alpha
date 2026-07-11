# PM Task Decomposition (REV-3) — prog-studio-v2-2026-07-s4-retirement

Complete plan of record (supersedes rev2). Revised per CR#3 CRITIQUE_PASS-with-WARNINGs (`...-rev2-CR-1783715430.md`). Two changes: **(1) structural** — pre-commit the FE-1a/FE-1b split (CR#3 W1: the line-count split trigger cannot detect re-architecture+migration turn-scope risk on the sprint's blocking root); **(2) SC-level** — reframe FE-1b's spec-migration list as a FLOOR (CR#3 W2). Plus the CR watch-item: FE-4 confirms the `edit-page` testid before deleting s2-d2-edit-save.spec.ts. Everything else in rev2 carries verbatim — the Critic disk-confirmed all six jidoka fixes, the FE-1/FE-4 boundary, and the agent-roles.ts FE-3 deletion direction. agent_count 7→8. Gets a scoped Critic confirmation per the BLOCK-class re-entry rule.

Adjacent: `sc-precheck-report.json` (this dir). PM log `docs/agent-logs/PM/prog-studio-v2-2026-07-s4-retirement.md` (+ rev2/rev3 append).

---

## FE-1a/FE-1b split (rationale + division, no overlap)
rev2's FE-1 was one packet (hoist + retire + fold + 11-spec migration) on the critical-path root that blocks all six downstream packets. CR#3 W1: split trigger was "code SIZE only (~50 lines)" but the production footprint is ~15-30 lines (never trips it) while the real risk is a novel CSS-grid re-architecture AND an 11-file spec migration in one turn. Pre-committing the split gives each half an independently-verifiable green gate; hoist-first means nav is provably never zero.

- **FE-1a (hoist — additive, 9-tab bar RETAINED as fallback):** SubmenuRail → AppShell (global), `.app-shell` grid re-template, remove PartyPage page-local rail mount, SubmenuRail aria-label → "Main navigation". The 9-tab BottomTabBar stays untouched (fallback nav) so nav is never zero and the hoist is verifiable in isolation. Gate: lint×3 + build green + rail rendered globally (verified on a non-party surface via the still-present 9-tab bar). Edits NO e2e spec (avoids overlap with FE-1b). Records its post-hoist Playwright RUN to hand FE-1b the "new-red-from-hoist" classification.
- **FE-1b (retire + fold + migrate):** retire NAV_ITEMS (9-tab v1 config), wire the <640px bottom-bar fold (repurpose BottomTabBar to RAIL_ITEMS gated <640px), and own ALL KEEP-spec nav-selector migration. Gate: lint×3 + build green + every KEEP spec green in the pre-FE-1a (t5) baseline is green at close.

Reference-point note (CR#3 W2): FE-1b's "still-green" reference is the **pre-FE-1a t5 baseline** (not FE-1a's close state) — because FE-1a's hoist legitimately reds a few specs (grid single-column assertion, aria-label name) that FE-1a does NOT fix (lint/build-gated only). FE-1b restores ALL nav-re-architecture-caused reds (hoist-caused AND retirement-caused) to green. This is the gap-free reading of "any currently-green KEEP spec the nav change breaks"; flagged for the scoped Critic confirmation.

---

<task_decomposition task_id="prog-studio-v2-2026-07-s4-retirement" agent_count="8">
  <task_packets>

    <task_packet>
      <task_id>prog-studio-v2-2026-07-s4-retirement-FE-1a</task_id>
      <assigned_to>frontend-engineer</assigned_to>
      <priority>HIGH</priority>
      <description>
NAV-SHELL HOIST (Wave 0a) — additive, hoist-first. Render the SubmenuRail into the GLOBAL shell so it is present on every surface; the 9-tab BottomTabBar STAYS untouched as fallback nav during this packet (nav provably never zero). Discharges the "s4 lifts it" obligation (PartyPage.tsx:26-29).
1. HOIST: render `<SubmenuRail/>` in `AppShell.tsx`. DOM-MOUNT ORDER (load-bearing for FE-1b's `text=`/`.first()` locators): mount `<SubmenuRail/>` BEFORE `<BottomTabBar/>` in AppShell JSX (Header, SubmenuRail, ModeContent, BottomTabBar).
2. GRID: re-template the `.app-shell` grid (`globals.css:91-97`, currently `"hd" "mn"`) to give the rail a grid area — do NOT prescribe the exact template; base grid stays `"hd" "mn"` (mobile-first, no rail column) with an `@media (min-width:640px)` block adding the rail track/areas (reuse the existing 640px breakpoint, globals.css:120 — no new breakpoint value). Preserve Header's `gridArea:'hd'` and ModeContent's `gridArea:'mn'` unchanged. BottomTabBar is `position:fixed` (outside grid flow) — the grid change does not disturb it.
3. Remove the page-local rail mount from `PartyPage.tsx` (import line 6 + the `hidden lg:flex` wrapper ~lines 222-224 + reconcile the plan-R-3 comment 26-29) so the rail is not double-rendered.
4. a11y: change `SubmenuRail.tsx` `aria-label` from "Party screen submenus" to "Main navigation" (line 31); `role="navigation"` unchanged. (Interim note: during THIS packet both the hoisted rail and the still-present BottomTabBar carry "Main navigation" at ≥640px — an accepted transient duplicate resolved by FE-1b when the 9-tab bar becomes the <640px-only fold; FE-1a is lint/build-gated, not full-e2e-gated.)
5. DO NOT retire NAV_ITEMS, DO NOT touch BottomTabBar.tsx, DO NOT implement the <640px fold, DO NOT edit any e2e spec, DO NOT implement collapse/expand (deferred) — all of that is FE-1b or later. Rail renders at fixed 240px.
6. VERIFY + HAND-OFF: run `npx playwright test`; confirm the rail renders globally on a NON-party surface (navigate to Sessions via the still-present 9-tab bar, assert the SubmenuRail is present) and record it in the ui_packet. Classify any spec that goes red purely from the hoist (grid-shape/aria-label assertions) against the t5 57-failure list and hand that classification to FE-1b (do NOT fix them here).
DESIGN.md present — reuse FF7 tokens (rail surface `--sf`, spec token line 247), NO new tokens; `design_system_source: DESIGN_MD`.
      </description>
      <success_criteria>
- `<SubmenuRail/>` rendered in `AppShell.tsx` (global, mounted BEFORE BottomTabBar); `.app-shell` grid re-templated with a rail area at ≥640px; `grep -n "SubmenuRail" packages/client/src/pages/PartyPage.tsx` returns nothing (page-local mount removed).
- SubmenuRail `aria-label` == "Main navigation"; `grep -rn "Party screen submenus" packages/client/src` returns nothing.
- `NAV_ITEMS` still present (untouched); BottomTabBar.tsx untouched (9-tab fallback intact) — nav never zero at any width.
- Rail verified rendered globally on a non-party surface (recorded); rail fixed 240px (no collapse/expand).
- `npm run lint` (tsc ×3) clean; `npm run build -w @gander-studio/client` passing. (Playwright RUN recorded with the hoist-caused-red classification handed to FE-1b; full e2e green is NOT this packet's gate.)
      </success_criteria>
      <context_files>
packages/client/src/AppShell.tsx
packages/client/src/globals.css
packages/client/src/pages/PartyPage.tsx
packages/client/src/components/party/SubmenuRail.tsx
docs/v2-vision/v2-design-spec.md
.claude/tasks/outputs/prog-studio-v2-2026-07-s3-drilldowns-t5-FE-1783490746.md
DESIGN.md
      </context_files>
      <dependencies>none (first wave)</dependencies>
      <out_of_scope>
- Do NOT touch `constants/navigation.ts` NAV_ITEMS or `components/BottomTabBar.tsx` (FE-1b retires/repurposes them).
- Do NOT edit any e2e spec (FE-1b owns all migration).
- Do NOT touch the AppMode union (ui-store.ts) or PAGE_MAP (ModeContent.tsx).
- Do NOT implement rail collapse/expand or the <640px fold (FE-1b); render fixed 240px; no new breakpoint value.
- Do NOT add the persistent CTA (FE-CAT) or re-point the empty-state CTA (FE-4); do NOT modify PartyPage's party-member grid beyond removing the rail mount. Do NOT touch FF7 tokens.
      </out_of_scope>
      <estimated_new_lines>~30-45 net-new (AppShell rail render + responsive grid re-template + aria-label; PartyPage mount removal is subtractive). Well under 50; single atomic hoist.</estimated_new_lines>
      <output_expected>
        <tag>ui_packet</tag>
        <must_contain>
          <item>SubmenuRail rendered global (before BottomTabBar) + page-local mount removed + grid re-templated (≥640px rail area)</item>
          <item>aria-label "Party screen submenus" → "Main navigation"</item>
          <item>recorded rail-global verification on a non-party surface + the hoist-caused-red classification for FE-1b</item>
          <item>lint ×3 + build result; confirmation NAV_ITEMS + BottomTabBar untouched</item>
        </must_contain>
        <must_not_contain>
          <item>any NAV_ITEMS/BottomTabBar.tsx edit or e2e-spec edit</item>
          <item>a <640px fold, collapse/expand, or ui-store/ModeContent edit</item>
          <item>a zero-nav state at any width</item>
        </must_not_contain>
        <success_signal>rail global (rail + 9-tab both present, never zero-nav), aria-label fixed, page-local mount gone, lint ×3 clean, build passing</success_signal>
      </output_expected>
    </task_packet>

    <task_packet>
      <task_id>prog-studio-v2-2026-07-s4-retirement-FE-1b</task_id>
      <assigned_to>frontend-engineer</assigned_to>
      <priority>HIGH</priority>
      <description>
NAV RETIRE + FOLD + SPEC MIGRATION (Wave 0b). Retire the 9-tab v1 nav, deliver the spec-ratified <640px bottom-bar fold, and migrate every KEEP e2e spec the nav re-architecture breaks. Works from post-FE-1a HEAD (rail already global).
1. RETIRE THE 9-TAB v1 NAV: remove `NAV_ITEMS` + `NavItemDef` from `constants/navigation.ts` (grep importers first; keep `RAIL_ITEMS`/`RailItemDef` byte-identical). Realizes "remove the 9-tab BottomTabBar" as retiring the 9-TAB v1 config.
2. <640px FOLD — FOLLOW THE SPEC VERBATIM (`docs/v2-vision/v2-design-spec.md` `<responsive>` lines 85-88 + Mobile lines 70-74): repurpose `BottomTabBar.tsx` to render `RAIL_ITEMS` (4 destinations) gated to <640px only ("reusing the app's current bottom-tab pattern — no new nav mechanism"); its `aria-label="Main navigation"`/`role="tablist"` stay (now the mobile form of the rail, mutually exclusive with the ≥640px rail — no duplicate at any single viewport). Do NOT ship a zero-nav mobile state. (The spec's "5 tabs total" phrasing is a drafting inconsistency vs its own 4-item hierarchy + the 4-entry RAIL_ITEMS — follow the ratified 4-destination framing; do not invent a 5th tab.)
3. e2e MIGRATION — the list below is a FLOOR, not a ceiling (CR#3 W2). FE-1b OWNS migrating ANY currently-green KEEP spec the nav re-architecture (FE-1a hoist + this retirement) breaks. Run `npx playwright test`; for EACH spec that goes red, classify it as (migrate-in-this-packet | already-in-the-t5-57-failure-baseline) using the t5 list in context_files, and record the classification in the ui_packet. Migrate role="tab" nav-navigators to a rail-button/text locator (e.g. `getByRole('navigation',{name:'Main navigation'}).getByRole('button',{name:/…/i})`). VERIFIED FLOOR (must migrate at minimum):
   - Hoist-caused (from FE-1a): `layout-sidebar-removal.spec.ts` (grid single-column + tablist-at-1200px assertions → rail present, grid has a rail track at ≥640px), `gander-studio-p1-fe-shell.spec.ts`, `prog-studio-v2-2026-07-s2-party-shell.spec.ts` (shared `getRailNav()` name → "Main navigation"; the "9 tabs" test → 4 at a <640px viewport).
   - Retirement-caused (role="tab" nav-navigators): `progression.spec.ts`, `prog-studio-vision-s3-program-dag.spec.ts`, `prog-studio-vision-s4-legibility.spec.ts` (L83), `prog-studio-vision-s4-reduced-motion.spec.ts` (L112), `prog-studio-vision-s2-d3-session-buffer.spec.ts`, `prog-studio-vision-s2-d4-prose-slug.spec.ts`.
   - Partial: `prog-studio-vision-s4-render-loop.spec.ts` — migrate ONLY the Progression sub-test's nav locator (its Graph sub-test is FE-4's — do not touch it). `prog-studio-sessions-2026-05-s2-list-edit-fe.spec.ts` — DELETE only the 4 obsolete "t6b: Existing pages smoke regression" sub-tests (~L358-380, click removed v1 labels); leave every KEEP Sessions test.
   Discriminator for out-of-floor specs (CR#3-endorsed): a spec with an explicit nav helper / nav-tab click = migrate; a spec that `goto`s the default route and finds an IN-PAGE tab (e.g. `getByRole('tab',{name:/Analyze/})`) is baseline-red/skip, NOT a nav-navigator (~14 KEEP specs match role="tab" but are in-page Analyze tabs — do not migrate those).
DESIGN.md present — reuse FF7 tokens, NO new tokens.
      </description>
      <success_criteria>
- `NAV_ITEMS` removed: `grep -rn "NAV_ITEMS" packages/client/src` empty; `RAIL_ITEMS` unchanged.
- <640px fold live: at <640px the 4 rail destinations are reachable via the repurposed BottomTabBar (RAIL_ITEMS, gated <640px); at ≥640px the rail is the nav and the fold is hidden — NO zero-nav state; nav reachable from a NON-party surface at BOTH breakpoints.
- FLOOR + FLOOR-completeness (CR#3 W2): every KEEP spec that was green in the pre-FE-1a (t5) baseline is GREEN at close via a real `npx playwright test` RUN; every remaining red is classified (migrate-in-packet | t5-baseline) in the ui_packet; s3-drilldowns + s2-party + (once it lands) FE-CAT catalog specs green; no NEW failure vs the t5 list.
- render-loop Progression sub-test migrated (Graph sub-test left for FE-4); the 4 t6b sub-tests removed from s2-list-edit-fe (rest intact).
- `npm run lint` (tsc ×3) clean; `npm run build -w @gander-studio/client` passing; run summary attached.
      </success_criteria>
      <context_files>
packages/client/src/constants/navigation.ts
packages/client/src/components/BottomTabBar.tsx
packages/client/src/AppShell.tsx
docs/v2-vision/v2-design-spec.md
packages/client/tests/e2e/layout-sidebar-removal.spec.ts
packages/client/tests/e2e/gander-studio-p1-fe-shell.spec.ts
packages/client/tests/e2e/prog-studio-v2-2026-07-s2-party-shell.spec.ts
packages/client/tests/e2e/progression.spec.ts
packages/client/tests/e2e/prog-studio-vision-s3-program-dag.spec.ts
packages/client/tests/e2e/prog-studio-vision-s4-legibility.spec.ts
packages/client/tests/e2e/prog-studio-vision-s4-reduced-motion.spec.ts
packages/client/tests/e2e/prog-studio-vision-s4-render-loop.spec.ts
packages/client/tests/e2e/prog-studio-vision-s2-d3-session-buffer.spec.ts
packages/client/tests/e2e/prog-studio-vision-s2-d4-prose-slug.spec.ts
packages/client/tests/e2e/prog-studio-sessions-2026-05-s2-list-edit-fe.spec.ts
.claude/tasks/outputs/prog-studio-v2-2026-07-s3-drilldowns-t5-FE-1783490746.md
DESIGN.md
      </context_files>
      <dependencies>prog-studio-v2-2026-07-s4-retirement-FE-1a</dependencies>
      <out_of_scope>
- Do NOT touch AppShell's grid/rail (FE-1a) beyond a read-only reference; do NOT re-hoist the rail; do NOT touch SubmenuRail.tsx (FE-1a did the aria-label).
- Do NOT touch the AppMode union / PAGE_MAP (later waves); do NOT touch the render-loop Graph sub-test (FE-4) or any Compose/Export/Browse/Graph/Edit surface spec (deleted with their surfaces later).
- Do NOT migrate in-page `getByRole('tab',{name:/Analyze/})` specs (baseline-red in-page tabs, not nav-navigators).
- Do NOT implement collapse/expand (deferred); do NOT add new breakpoints/tokens.
      </out_of_scope>
      <estimated_new_lines>~15-30 net-new (NAV_ITEMS removal is subtractive ~-17; BottomTabBar fold repurpose ~10-15) + the e2e migration (spec edits). Under 50.</estimated_new_lines>
      <output_expected>
        <tag>ui_packet</tag>
        <must_contain>
          <item>NAV_ITEMS retired; BottomTabBar repurposed to the <640px RAIL_ITEMS fold (cite v2-design-spec lines)</item>
          <item>nav reachable from a non-party surface at desktop AND <640px; no zero-nav</item>
          <item>per-spec migrate-vs-baseline classification for EVERY red in the post-run (floor + any beyond it)</item>
          <item>render-loop Progression-only + the 4 t6b sub-test removals; lint ×3 + build + Playwright RUN summary</item>
        </must_contain>
        <must_not_contain>
          <item>AppShell grid/SubmenuRail edits; edits to the render-loop Graph sub-test or any cut-surface spec</item>
          <item>migration of in-page Analyze-tab specs; a zero-nav mobile state</item>
          <item>e2e status asserted by reading spec files instead of running Playwright</item>
        </must_not_contain>
        <success_signal>NAV_ITEMS gone, <640px fold live, every pre-FE-1a-green KEEP spec green via RUN, lint ×3 clean, build passing</success_signal>
      </output_expected>
    </task_packet>

    <task_packet>
      <task_id>prog-studio-v2-2026-07-s4-retirement-FE-2</task_id>
      <assigned_to>frontend-engineer</assigned_to>
      <priority>HIGH</priority>
      <description>
CUT-SURFACE DELETION (Wave 1) — COMPOSE. One logical deletion unit bounded by the Compose surface. Steps:
1. Delete `pages/ComposePage.tsx`.
2. Delete `store/compose-store.ts` (importer scan: sole importer is ComposePage.tsx — VERIFIED SAFE: ExportPage.tsx imports canvas-store only, its compose-store references are comment-only). **Do NOT delete `store/canvas-store.ts` — moved to FE-3** (ExportPage.tsx imports it ~15 call sites and is deleted only in FE-3; deleting it here would break FE-2's own lint SC).
3. Delete Compose-only canvas components + constants after per-file importer scan: `components/compose/MateriaCanvas.tsx`, `MateriaNode.tsx`, `CardNode.tsx`, `handle-style.ts`, `constants/compose.ts` (all importer-confirmed Compose-only). Enumerate every deleted file; if any has a non-Compose importer, BLOCK.
4. AppMode↔PAGE_MAP: remove `'compose'` from the AppMode union (`store/ui-store.ts`); remove the `compose:` PAGE_MAP line + the `ComposePage` React.lazy import in `components/ModeContent.tsx`.
5. e2e: delete the SEVEN Compose-surface specs WITH the surface (the two `src/tests/compose/*` are inside client tsconfig `include:["src"]`, so their deletion is load-bearing for tsc): `gander-studio-p1-compose-fe.spec.ts`, `gander-studio-p2-canvas-link-003a.spec.ts`, `materia-canvas-proximity.spec.ts`, `card-node-title-edit.spec.ts`, `loadout-list-panel.spec.ts`, `src/tests/compose/compose-connections-persist.spec.ts`, `src/tests/compose/materia-canvas.spec.ts`. Cross-check the t5 list; RUN `npx playwright test`.
Client refs to `trpc.loadout.*` vanish with ComposePage — un-blocking BE-1.
      </description>
      <success_criteria>
- ComposePage, compose-store, and the 5 Compose-only components/constants deleted; `grep -rn "ComposePage\|compose-store\|useComposeStore\|MateriaCanvas\|CardNode" packages/client/src` empty.
- `canvas-store.ts` NOT touched (still present, deleted by FE-3).
- `'compose'` removed from AppMode union; no `compose` PAGE_MAP entry; no `trpc.loadout.` reference in client src.
- All SEVEN named Compose specs deleted; `npm run lint` (tsc ×3) clean; client build passing; Playwright RUN shows no NEW failure vs the t5 list; KEEP specs green.
      </success_criteria>
      <context_files>
packages/client/src/pages/ComposePage.tsx
packages/client/src/store/compose-store.ts
packages/client/src/store/ui-store.ts
packages/client/src/components/ModeContent.tsx
packages/client/src/components/compose/MateriaCanvas.tsx
packages/client/src/components/compose/CardNode.tsx
packages/client/src/constants/compose.ts
packages/client/tests/e2e/gander-studio-p1-compose-fe.spec.ts
packages/client/tests/e2e/gander-studio-p2-canvas-link-003a.spec.ts
packages/client/tests/e2e/materia-canvas-proximity.spec.ts
packages/client/tests/e2e/card-node-title-edit.spec.ts
packages/client/tests/e2e/loadout-list-panel.spec.ts
packages/client/src/tests/compose/compose-connections-persist.spec.ts
packages/client/src/tests/compose/materia-canvas.spec.ts
.claude/tasks/outputs/prog-studio-v2-2026-07-s3-drilldowns-t5-FE-1783490746.md
      </context_files>
      <dependencies>prog-studio-v2-2026-07-s4-retirement-FE-1b</dependencies>
      <out_of_scope>
- Do NOT delete `store/canvas-store.ts` (FE-3 owns it — ExportPage still imports it this wave).
- Do NOT touch browse/edit/analyze stores, constants/canvas.ts, or hooks/useLinkSound.ts — later waves.
- Do NOT touch server code (loadout removal is BE-1) or the nav shell (FE-1a/FE-1b).
- Do NOT remove other union members — only 'compose'.
      </out_of_scope>
      <estimated_new_lines>0 net-new (deletion wave)</estimated_new_lines>
      <output_expected>
        <tag>ui_packet</tag>
        <must_contain>
          <item>every deleted file with importer-scan justification; explicit confirmation canvas-store.ts was NOT deleted</item>
          <item>lint ×3 + build + Playwright RUN summary (t5 cross-check)</item>
        </must_contain>
        <must_not_contain>
          <item>canvas-store.ts deletion; edits to browse/edit/analyze stores or non-Compose surfaces</item>
          <item>server-side edits</item>
        </must_not_contain>
        <success_signal>lint ×3 clean, build passing, compose greps empty, canvas-store still present, KEEP specs green</success_signal>
      </output_expected>
    </task_packet>

    <task_packet>
      <task_id>prog-studio-v2-2026-07-s4-retirement-FE-3</task_id>
      <assigned_to>frontend-engineer</assigned_to>
      <priority>HIGH</priority>
      <description>
CUT-SURFACE DELETION (Wave 2) — EXPORT + PLANNING (+ the canvas-store chain moved here from FE-2). Steps:
1. Delete `pages/ExportPage.tsx` and `pages/PlanningPage.tsx`.
2. Delete `store/canvas-store.ts` (MOVED from FE-2): after ExportPage.tsx — its last real consumer — is deleted THIS wave, canvas-store's importer list is empty. Then delete `constants/agent-roles.ts` (canvas-store's transitive dependent — real edge is canvas-store.ts imports agent-roles; agent-roles has ZERO KEEP-surface importer; re-grep importers at execution time, delete only if confirmed orphaned).
3. Delete Export-only / Planning-only constants+components after per-file importer scan (e.g. `constants/export.ts` → ExportPage only); enumerate.
4. AppMode↔PAGE_MAP: remove `'export'` and `'planning'` from the AppMode union; remove the `export:`/`planning:` PAGE_MAP entries + imports in `components/ModeContent.tsx`.
5. e2e: delete surface specs WITH the surface: `gander-studio-p1-export-fe.spec.ts`, `prog-studio-vision-s2-d1-export.spec.ts` (confirmed Export SURFACE), `prog-studio-vision-s3-planning.spec.ts`. Also scan for any other Export/Planning-surface-exclusive spec (e.g. `prog-studio-vision-s2-d5-confirm.spec.ts` — verify it exclusively tests ExportPage before deleting). Cross-check the t5 list; RUN `npx playwright test`.
CORRECTION (jidoka fix #3): rev1's caution that `prog-studio-vision-s2-d2-edit-save.spec.ts` "covers SESSION markdown save (KEEP)" is WRONG — that file tests the v1 EditPage (CUT) and is deleted by FE-4. The genuine session-save KEEP spec is `prog-studio-vision-s2-d3-session-buffer.spec.ts` (uses `session.saveEdit`) — do NOT delete it (here or in FE-4).
Client refs to `trpc.export.spawn` + `trpc.planning.list` vanish — un-blocking BE-1.
      </description>
      <success_criteria>
- ExportPage + PlanningPage + canvas-store.ts + Export/Planning-only constants deleted; constants/agent-roles.ts deleted-or-retained per its execution-time importer re-scan (state which); `grep -rn "ExportPage\|PlanningPage\|canvas-store\|useCanvasStore" packages/client/src` empty.
- `'export'`/`'planning'` removed from AppMode union; no export/planning PAGE_MAP entries; no `trpc.export.spawn`/`trpc.planning.list` in client src.
- `prog-studio-vision-s2-d3-session-buffer.spec.ts` (the real session-save KEEP spec) untouched and green.
- `npm run lint` (tsc ×3) clean; client build passing; Playwright RUN shows no NEW failure vs the t5 list.
      </success_criteria>
      <context_files>
packages/client/src/pages/ExportPage.tsx
packages/client/src/pages/PlanningPage.tsx
packages/client/src/store/canvas-store.ts
packages/client/src/constants/agent-roles.ts
packages/client/src/constants/export.ts
packages/client/src/store/ui-store.ts
packages/client/src/components/ModeContent.tsx
packages/client/tests/e2e/gander-studio-p1-export-fe.spec.ts
packages/client/tests/e2e/prog-studio-vision-s2-d1-export.spec.ts
packages/client/tests/e2e/prog-studio-vision-s3-planning.spec.ts
packages/client/tests/e2e/prog-studio-vision-s2-d5-confirm.spec.ts
.claude/tasks/outputs/prog-studio-v2-2026-07-s3-drilldowns-t5-FE-1783490746.md
      </context_files>
      <dependencies>prog-studio-v2-2026-07-s4-retirement-FE-2</dependencies>
      <out_of_scope>
- Do NOT delete or preserve `prog-studio-vision-s2-d2-edit-save.spec.ts` (it is FE-4's — a CUT EditPage spec). Do NOT delete `prog-studio-vision-s2-d3-session-buffer.spec.ts` (KEEP session-save).
- Do NOT touch browse/edit/graph surfaces or their stores, constants/canvas.ts, or hooks/useLinkSound.ts — FE-4.
- Do NOT touch server code or the nav shell (FE-1a/FE-1b).
      </out_of_scope>
      <estimated_new_lines>0 net-new (deletion wave)</estimated_new_lines>
      <output_expected>
        <tag>ui_packet</tag>
        <must_contain>
          <item>files deleted incl. canvas-store.ts + the agent-roles.ts orphan decision (with re-scan evidence)</item>
          <item>confirmation s2-d3-session-buffer (KEEP) NOT touched; s2-d2-edit-save left for FE-4</item>
          <item>lint ×3 + build + Playwright RUN summary (t5 cross-check)</item>
        </must_contain>
        <must_not_contain>
          <item>edits to browse/edit/graph surfaces; deletion of s2-d3-session-buffer</item>
          <item>server-side edits</item>
        </must_not_contain>
        <success_signal>lint ×3 clean, build passing, export/planning/canvas-store greps empty, session-buffer spec green</success_signal>
      </output_expected>
    </task_packet>

    <task_packet>
      <task_id>prog-studio-v2-2026-07-s4-retirement-FE-CAT</task_id>
      <assigned_to>frontend-engineer</assigned_to>
      <priority>HIGH</priority>
      <description>
NEW SURFACE — 13-ROLE CATALOG (honors s3 ratification #1). ADDITIVE; party homescreen stays 6-agent. Two deliverables: (A) the catalog surface, (B) the persistent entry CTA on the populated party home (human-ratified 2026-07-10, ORC-witnessed).
1. DATA SOURCE (DRY, jidoka-confirmed): REUSE `useParty`/`roster.getParty` — returns the FULL roster; PartyPage caps display at 6 (`PARTY_GRID_DISPLAY_CAP`). The catalog renders ALL members (uncapped) = the ratified 13-role set. Do NOT use `agent.list` (under-counts). No new BE procedure; no resurrected Browse code.
2. SURFACE: add `'catalog'` to the AppMode union (`store/ui-store.ts` — Critic-RATIFIED, proceed); add a `catalog:` PAGE_MAP entry + `React.lazy(() => import('../pages/RosterCatalogPage'))` (lazy-from-birth, s3 pattern) in `components/ModeContent.tsx`; create `pages/RosterCatalogPage.tsx` rendering every roster member as cards (reuse PartyMemberCard/RoleTag/StatBar, DRY) with first-class loading/empty/error states (mirror PartyPage `derivePartyGridState`). Count DATA-DRIVEN (no hardcoded 13).
3. PERSISTENT ENTRY CTA (human-ratified 2026-07-10, ORC-witnessed): add a persistent "View Full Roster" affordance to the POPULATED/default party home (PartyScreenHeader region ~86-127 or the default-state branch — implementer's choice) → `setActiveMode('catalog')`. SEPARATE, ADDITIONAL button, NOT a repoint of the empty-state `handleViewRoster` (FE-4's). Rail stays 4 items — catalog NOT in RAIL_ITEMS.
4. Do NOT alter the party 6-agent display cap. Work from post-FE-1a HEAD (FE-1a removed the page-local rail mount).
5. e2e (Tier-2 per new surface): add a Tier-2 spec (task_id-scoped name, record it in the e2e_spec field) asserting: (a) from the POPULATED party home the persistent "View Full Roster" CTA is visible and routes to the catalog; (b) the catalog renders the full roster + honest empty/error states (DOM-presence card count, not a side-effect proxy); (c) keyboard-operable. RUN `npx playwright test`; cross-check the t5 list.
DESIGN.md present — reuse FF7 tokens, NO new tokens.
      </description>
      <success_criteria>
- `'catalog'` AppMode member added with a PAGE_MAP entry + lazy import; `pages/RosterCatalogPage.tsx` renders every member from `useParty`/getParty (uncapped) with loading/empty/error states.
- Count data-driven: `grep -n "13" packages/client/src/pages/RosterCatalogPage.tsx` shows no magic-number role count.
- PERSISTENT CTA: the populated party home shows a "View Full Roster" affordance routing to `'catalog'` (human-ratified 2026-07-10, ORC-witnessed); Tier-2 assertion confirms it from the POPULATED state. Rail NOT modified. Party 6-cap unchanged.
- New catalog Tier-2 spec present + green (name recorded); no new tokens; `npm run lint` (tsc ×3) clean; client build passing; Playwright RUN shows no NEW failure vs the t5 list.
      </success_criteria>
      <context_files>
packages/client/src/store/ui-store.ts
packages/client/src/components/ModeContent.tsx
packages/client/src/pages/PartyPage.tsx
packages/client/src/hooks/useParty.ts
packages/client/src/components/party/PartyMemberCard.tsx
packages/shared/src/schemas.ts
docs/SESSION-CHECKPOINT.md
.claude/tasks/outputs/prog-studio-v2-2026-07-s3-drilldowns-t5-FE-1783490746.md
DESIGN.md
      </context_files>
      <dependencies>prog-studio-v2-2026-07-s4-retirement-FE-3</dependencies>
      <out_of_scope>
- Do NOT add a new BE tRPC procedure or Zod schema; do NOT use agent.list; do NOT resurrect deleted Browse code.
- Do NOT add the catalog to RAIL_ITEMS; do NOT re-point the empty-state handleViewRoster (FE-4); do NOT change the party 6-cap.
- Do NOT touch the nav shell (FE-1a/FE-1b) beyond adding the persistent CTA to the party home. Do NOT add new tokens.
      </out_of_scope>
      <estimated_new_lines>~120-140 (RosterCatalogPage ~90-120 + persistent CTA ~8-15 + mode wiring + Tier-2 spec ~60-100). JUSTIFICATION: one cohesive surface + its ratified entry affordance, one data source, standard page+lazy-mode+spec pattern. If the page alone exceeds ~150 lines, BLOCK to split the role-card from the page.</estimated_new_lines>
      <output_expected>
        <tag>ui_packet</tag>
        <must_contain>
          <item>catalog reuses getParty/useParty (not agent.list), uncapped; no new BE proc</item>
          <item>'catalog' AppMode + NOT in rail + party 6-cap unchanged</item>
          <item>persistent populated-home CTA → catalog + Tier-2 assertion (cite human-ratified 2026-07-10 ORC-witnessed)</item>
          <item>data-driven count (no hardcoded 13); new spec name + green; lint ×3 + build + Playwright RUN</item>
        </must_contain>
        <must_not_contain>
          <item>a new BE procedure/schema or agent.list catalog data path</item>
          <item>a RAIL_ITEMS edit or an empty-state handleViewRoster re-point; new design tokens</item>
        </must_not_contain>
        <success_signal>catalog mode+page live from getParty, persistent CTA routes from populated home, Tier-2 spec green, party 6-cap unchanged, lint ×3 clean, build passing</success_signal>
      </output_expected>
    </task_packet>

    <task_packet>
      <task_id>prog-studio-v2-2026-07-s4-retirement-FE-4</task_id>
      <assigned_to>frontend-engineer</assigned_to>
      <priority>HIGH</priority>
      <description>
ABSORB-SURFACE DELETION (Wave 3) — BROWSE + GRAPH + EDIT, the ratified empty-state CTA re-point, and the transitive canvas.ts/useLinkSound chain. HARD ORDER (absorption-before-cut): CITE `prog-studio-v2-2026-07-s3-drilldowns.spec.ts` (green 8/8 today) before deleting. Steps:
1. Delete `pages/BrowsePage.tsx`, `pages/GraphPage.tsx`, `pages/EditPage.tsx`.
2. Delete `hooks/useBrowseData.ts`, `store/browse-store.ts`, `store/edit-store.ts` (edit-store: ReviseSpecAction.tsx + AgentDetailPage.tsx confirmed non-importers). Delete Browse/Graph/Edit-only components after per-file importer scan: `components/browse/{AgentCard,DrilldownPanel,FilterBar,HookCard,SkeletonCard,SkillCard}.tsx`, `components/graph/{FilterSidebar,GraphNode}.tsx` + `constants/graph.ts`, `components/edit/TagInput.tsx` + `constants/edit.ts`.
3. TRANSITIVE CHAIN (jidoka fix #2): after BrowsePage/GraphPage/EditPage are gone, delete `hooks/useLinkSound.ts` (importers were ExportPage[FE-3]/MateriaCanvas[FE-2]/GraphPage/EditPage — all gone by end of this wave), then `constants/canvas.ts` (its last real importer was useLinkSound.ts). Re-grep importers for BOTH at execution time; delete only on a confirmed-zero-importer result.
4. AppMode↔PAGE_MAP: remove `'browse'`, `'edit'`, `'graph'` from the AppMode union; remove the browse/edit/graph PAGE_MAP entries + the `GraphPage` lazy import + the `BrowsePage`/`EditPage` static imports in `components/ModeContent.tsx`.
5. RATIFIED EMPTY-STATE CTA RE-POINT: removing `'browse'` makes `PartyPage.tsx` `handleViewRoster`'s `setActiveMode('browse')` a compile error (TODO(s4-cut)). Work from CURRENT HEAD (FE-1a removed the rail mount; FE-CAT added the persistent CTA — line numbers shifted; do NOT hardcode). Re-point it to `'catalog'` (the ratified true destination) + remove the stale TODO. Empty-state button only — the persistent populated-home CTA is FE-CAT's, do NOT touch it.
6. e2e (jidoka fix #3 + CR#3 watch-item + mechanical rule 2):
   - PRE-DELETE CLASSIFICATION-REVERSAL SAFETY CHECK (CR#3): open `prog-studio-vision-s2-d2-edit-save.spec.ts` and CONFIRM it references the `edit-page` testid (proving it tests the v1 EditPage CUT surface) BEFORE deleting it. If it does NOT contain `edit-page` (classification reversal), do NOT delete — emit BLOCKED and surface for re-adjudication.
   - Delete surface specs WITH the surface: `gander-studio-p1-browse-fe.spec.ts`, `gander-studio-p1-edit-fe.spec.ts`, `graph-page.spec.ts`, AND (post the edit-page confirmation) `prog-studio-vision-s2-d2-edit-save.spec.ts`.
   - `prog-studio-vision-s4-render-loop.spec.ts`: delete ONLY its Graph sub-test (GraphPage removed); leave Sessions + Progression sub-tests (FE-1b migrated the Progression nav locator). Work from post-FE-1b HEAD of this file.
   - Update `prog-studio-v2-2026-07-s2-party-shell.spec.ts` empty-state CTA test: `browse-page` testid → RosterCatalogPage's root testid (FE-CAT-defined).
   Cross-check the t5 list; RUN `npx playwright test`.
7. VERIFY s3 absorption spec + s2 party specs + FE-CAT catalog spec stay GREEN.
      </description>
      <success_criteria>
- BrowsePage, GraphPage, EditPage, useBrowseData, browse-store, edit-store, all Browse/Graph/Edit-only components/constants, hooks/useLinkSound.ts, and constants/canvas.ts deleted (each on a confirmed-orphan re-scan); `grep -rn "BrowsePage\|GraphPage\|EditPage\|useBrowseData\|browse-store\|edit-store\|useLinkSound" packages/client/src` empty.
- `'browse'`/`'edit'`/`'graph'` removed from AppMode union; no browse/edit/graph PAGE_MAP entries; no `trpc.connectivity.getGraph` in client src.
- PartyPage compiles; empty-state `handleViewRoster` re-points to `'catalog'`; `grep -rn "'browse'\|\"browse\"" packages/client/src` empty.
- `s2-d2-edit-save.spec.ts` confirmed to contain the `edit-page` testid, THEN deleted (or BLOCKED if the testid is absent); s3 absorption e2e cited green + STILL green; s2 party + FE-CAT catalog specs green; render-loop Graph sub-test removed (Sessions/Progression intact).
- `npm run lint` (tsc ×3) clean; client build passing; Playwright RUN shows no NEW failure vs the t5 list.
      </success_criteria>
      <context_files>
packages/client/src/pages/BrowsePage.tsx
packages/client/src/pages/GraphPage.tsx
packages/client/src/pages/EditPage.tsx
packages/client/src/hooks/useBrowseData.ts
packages/client/src/hooks/useLinkSound.ts
packages/client/src/constants/canvas.ts
packages/client/src/store/browse-store.ts
packages/client/src/store/edit-store.ts
packages/client/src/store/analyzeStore.ts
packages/client/src/constants/browse.ts
packages/client/src/store/ui-store.ts
packages/client/src/components/ModeContent.tsx
packages/client/src/pages/PartyPage.tsx
packages/client/src/components/detail/ReviseSpecAction.tsx
packages/client/src/components/detail/RelationshipPanel.tsx
packages/client/tests/e2e/gander-studio-p1-browse-fe.spec.ts
packages/client/tests/e2e/gander-studio-p1-edit-fe.spec.ts
packages/client/tests/e2e/graph-page.spec.ts
packages/client/tests/e2e/prog-studio-vision-s2-d2-edit-save.spec.ts
packages/client/tests/e2e/prog-studio-vision-s4-render-loop.spec.ts
packages/client/tests/e2e/prog-studio-v2-2026-07-s3-drilldowns.spec.ts
packages/client/tests/e2e/prog-studio-v2-2026-07-s2-party-shell.spec.ts
.claude/tasks/outputs/prog-studio-v2-2026-07-s3-drilldowns-t5-FE-1783490746.md
DESIGN.md
      </context_files>
      <dependencies>prog-studio-v2-2026-07-s4-retirement-FE-CAT</dependencies>
      <out_of_scope>
- RETAIN `store/analyzeStore.ts` (jidoka fix #6 — disk-confirmed 3 Sessions importers: sessions AnalyzeTab / SessionPicker / SessionListPage; ZERO Browse/Graph). Misleading name — do NOT delete.
- RETAIN `constants/browse.ts` (jidoka fix #6 — despite its name, exports AGENT_MATERIA/DEFAULT_MATERIA consumed by the KEEP `components/sessions/AgentTimeline.tsx`). Do NOT delete by name-pattern.
- Do NOT delete/refactor `components/detail/*` KEEP components (ReviseSpecAction, RelationshipPanel, AgentDetail panels).
- Do NOT build/modify the catalog surface or the persistent CTA (FE-CAT) — only re-point the empty-state CTA. Do NOT delete `s2-d3-session-buffer.spec.ts` (KEEP).
- Do NOT touch AgentDetailPage's statbox grid (6aa859c), the nav shell (FE-1a/FE-1b), ROSTER_AGENT_NAME_BY_CODE/AgentDetailSchema (DEFERRED-V2S3-1), FF7 tokens, or server code.
      </out_of_scope>
      <estimated_new_lines>0-10 net-new (deletion wave; empty-state re-point is a one-line mode change)</estimated_new_lines>
      <output_expected>
        <tag>ui_packet</tag>
        <must_contain>
          <item>s3 absorption spec cited green; RETAIN confirmations for analyzeStore.ts + constants/browse.ts (KEEP consumer named)</item>
          <item>the s2-d2-edit-save `edit-page` testid confirmation BEFORE deletion (or a BLOCKED if absent)</item>
          <item>useLinkSound.ts + constants/canvas.ts deletion with confirmed-orphan re-scan evidence</item>
          <item>empty-state handleViewRoster re-pointed to 'catalog'; PartyPage compiles; no 'browse' literal remains</item>
          <item>render-loop Graph sub-test removed; s2-party CTA testid updated; lint ×3 + build + Playwright RUN (s3/s2/catalog green)</item>
        </must_contain>
        <must_not_contain>
          <item>deletion of analyzeStore.ts, constants/browse.ts, components/detail/* KEEP components, or s2-d3-session-buffer.spec.ts</item>
          <item>deletion of s2-d2-edit-save.spec.ts WITHOUT the edit-page testid confirmation</item>
          <item>modification of the catalog surface / persistent CTA; AgentDetailSchema edits; CTA removal or a non-catalog destination</item>
        </must_not_contain>
        <success_signal>lint ×3 clean, build passing, browse/graph/edit + useLinkSound/canvas.ts greps empty, analyzeStore+browse.ts retained, edit-page-confirmed d2 deleted, empty-state CTA lands on catalog, s3+s2+catalog green</success_signal>
      </output_expected>
    </task_packet>

    <task_packet>
      <task_id>prog-studio-v2-2026-07-s4-retirement-BE-1</task_id>
      <assigned_to>backend-engineer</assigned_to>
      <priority>HIGH</priority>
      <description>
SERVER-PROCEDURE RETIREMENT (Critic-gated + jidoka-confirmed). Runs AFTER all FE waves (all 4 removed-procedure client consumers already deleted by strictly-preceding packets — jidoka ordering NO CONFLICT). Removal set: export.spawn, loadout.*, planning.list, connectivity.getGraph (24→18, BEP-confirmed exact).
1. PRE-REMOVAL SCAN: for each removal candidate, grep every importer of its procedure/schema/parser/helper. CRITICAL protection: `parsers/agent-detail.ts` imports `ConnectivityGraphSchema` (line 16, used line 44) — the SCHEMA MUST STAY. `parseAllAgents/Skills/Hooks` retained.
2. In `router.ts`: remove `exportRouter`, `loadoutRouter`, `connectivityRouter`, `planningRouter` bodies + `appRouter` registrations + now-dead top-level symbols whose SOLE consumer was a removed block: `sanitizeName`, `ExportResultSchema` local const, dead `node:fs/promises` names (unlink/copyFile/stat), dead `./env.js` names (LOADOUTS_DIR/EXPORT_BASE_DIR — do NOT edit env.ts), the `parsePlanningBacklog` import, AND (jidoka fix #5) the now-dead `ConnectivityGraphSchema`/`type ConnectivityGraph` IMPORT-SITE in router.ts (lines ~19/26). PRECISION: pruning router.ts's dead ConnectivityGraphSchema import is NOT a violation of "retain ConnectivityGraphSchema" — retention protects the schemas.ts DEFINITION + agent-detail.ts's INDEPENDENT import, not router.ts's orphaned import-site. State this in the completion_packet.
3. In `packages/shared/src/schemas.ts`: remove LoadoutSchema, ExportInputSchema, and the Planning block (schemas + inferred types). Leave the entire Connectivity* block byte-identical.
4. In `packages/shared/src/types.ts` (jidoka fix #5, HIGH — index.ts re-exports via `export *`): remove the `LoadoutSchema` import specifier and `export type Loadout = z.infer<typeof LoadoutSchema>` (2-line deletion in a 12-line file; types.ts:6/12 per Critic). Leave Agent/Skill/Hook exports untouched. WITHOUT this the FIRST (shared) tsc pass fails on a dangling import.
5. Delete `parsers/planning-parser.ts` + `parsers/__tests__/planning-parser.test.ts` (self-contained). No `parsers/connectivity*.ts` file exists.
6. RETAIN: agent.*, skill.*, hook.list, session.*, progression.getLedger, program.getDag, roster.* , env.ts (zero edits).
7. Run server vitest (`vitest run src/parsers/__tests__`) + `npm run lint` (tsc ×3, shared→server→client) + `npm run build -w @gander-studio/client`; all green.
      </description>
      <success_criteria>
- Pre-removal scan documented (target → importers → retain-set).
- export.spawn/loadout.*/planning.list/connectivity.getGraph removed from router.ts + appRouter; router.ts's dead ConnectivityGraphSchema import-site pruned.
- `packages/shared/src/types.ts` Loadout-type derivation + its LoadoutSchema import removed; the FIRST (shared) tsc pass is clean.
- `ConnectivityGraphSchema` DEFINITION in schemas.ts + agent-detail.ts import RETAINED (roster.getAgentDetail resolves); other exclusively-used schemas/parsers/helpers removed.
- RETAINED procedures intact; ReviseSpecAction's agent.get/save+skill.get/save resolve. env.ts unchanged.
- `npm run lint` (tsc ×3) clean; server vitest green; client build passing. (Final procedure count = 18, derived, for DOCS-1.)
      </success_criteria>
      <context_files>
packages/server/src/router.ts
packages/shared/src/schemas.ts
packages/shared/src/types.ts
packages/server/src/parsers/planning-parser.ts
packages/server/src/parsers/agent-detail.ts
packages/server/src/env.ts
      </context_files>
      <dependencies>prog-studio-v2-2026-07-s4-retirement-FE-2, prog-studio-v2-2026-07-s4-retirement-FE-3, prog-studio-v2-2026-07-s4-retirement-FE-CAT, prog-studio-v2-2026-07-s4-retirement-FE-4</dependencies>
      <out_of_scope>
- Do NOT remove the `ConnectivityGraphSchema` DEFINITION (schemas.ts) or agent-detail.ts's import — only router.ts's dead import-site is pruned.
- Do NOT remove agent.list/skill.list/hook.list; do NOT edit env vars (env.ts unchanged); do NOT touch parseAllAgents/Skills/Hooks or roster/session/progression/program routers/parsers.
- Do NOT touch types.ts's Agent/Skill/Hook exports (only the Loadout derivation). Do NOT git commit.
      </out_of_scope>
      <output_expected>
        <tag>completion_packet</tag>
        <must_contain>
          <item>pre-removal scan table (target → importers → retain-set)</item>
          <item>the ConnectivityGraphSchema distinction: router.ts import-site pruned; schemas.ts definition + agent-detail.ts import retained</item>
          <item>types.ts Loadout-derivation removal + confirmation the shared (first) tsc pass is clean</item>
          <item>final retained-procedure list (18) for DOCS-1; lint ×3 + server vitest + client build results</item>
        </must_contain>
        <must_not_contain>
          <item>removal of the ConnectivityGraphSchema definition or agent-detail.ts import</item>
          <item>removal of agent.list/skill.list/hook.list; env-var edits; an inline git commit</item>
        </must_not_contain>
        <success_signal>lint ×3 clean (shared first-green with types.ts fixed), server vitest green, client build passing, ConnectivityGraphSchema definition intact</success_signal>
      </output_expected>
    </task_packet>

    <task_packet>
      <task_id>prog-studio-v2-2026-07-s4-retirement-DOCS-1</task_id>
      <assigned_to>frontend-engineer</assigned_to>
      <priority>NORMAL</priority>
      <description>
DOCS TO v2 REALITY. Runs LAST. Single owner of both docs + the deferred-work ledger.
1. `CLAUDE.md` (repo root):
   - **Surfaces table** — remove Browse/Compose/Edit/Export/Graph/Planning rows; retain Sessions/Progression/Programs; ADD Party (`party`, default, PartyPage), Agent Detail (`agent-detail`, AgentDetailPage), Roster Catalog (`catalog`, RosterCatalogPage — reached via the persistent party-home "View Full Roster" CTA). Verify against PAGE_MAP at HEAD.
   - **Navigation line** ("BottomTabBar (role=tablist, 9 tabs…)", line 69) — replace with: global SubmenuRail (Roster→party / Sessions / Progression / Programs, aria-label "Main navigation") as the persistent desktop/tablet left rail, folding into a bottom-bar on <640px (per v2-design-spec responsive); agent-detail via party card; catalog via the persistent party-home CTA.
   - **tRPC procedures table + "22 procedures across 10 routers" heading** — rewrite to the ACTUAL post-BE-1 set (expected 18 across 8 routers — CONFIRM against the router.ts-derived count, do NOT transcribe). DERIVE by grepping `t.procedure` + sub-routers in `packages/server/src/router.ts` at HEAD. Remove loadout.*/export.spawn/connectivity.getGraph/planning.list rows per BE-1's completion_packet; note connectivity.getGraph removed while ConnectivityGraphSchema retained.
   - **Architecture tree** — fix `pages/` (add PartyPage/AgentDetailPage/RosterCatalogPage/sessions/; remove deleted), `store/` (remove compose/canvas/browse/edit; RETAIN analyzeStore; correct the STALE "session-picker" name to the actual store files), `parsers/` (remove planning).
   - **Known Issues bundle line** ("~700KB", line 114) — re-measure from the fresh client build output; state the source.
   - **Env table** — note EXPORT_BASE_DIR now unused/deprecated; keep LOADOUTS_DIR.
2. `DESIGN.md` (repo root): append a Decision Record (the next in sequence after Record D) for the v2 IA — 9→6 surface consolidation, the 9-tab v1 nav retirement, the hoisted global SubmenuRail + its <640px bottom-bar fold, the 6-agent homescreen + persistent catalog CTA. No new visual tokens (`design_system_source: DESIGN_MD`); structural/IA record only.
3. `docs/deferred-work.md` — append the 4 human-approved deferrals under a new "## Sprint: prog-studio-v2-2026-07-s4-retirement (2026-07-10)" header (matching the existing per-sprint append pattern), each citing "human-ratified 2026-07-10 (ORC-witnessed)". DOCS-1 is the sole writer this sprint.
      </description>
      <success_criteria>
- CLAUDE.md surfaces table = exactly the 6 v2 surfaces; no cut/absorbed surface rows.
- Navigation description reflects the global SubmenuRail ("Main navigation") + <640px bottom-bar fold + catalog-via-persistent-CTA (no "9 tabs" as live nav).
- tRPC procedure table matches `router.ts` at HEAD (18, derived not transcribed); no export.spawn/loadout./connectivity.getGraph/planning.list rows; roster.* present; ConnectivityGraphSchema-retained note present.
- Architecture tree store/page/parser lists match disk (RosterCatalogPage added; analyzeStore retained; "session-picker" corrected).
- Bundle baseline updated with a stated source; EXPORT_BASE_DIR noted deprecated-unused.
- DESIGN.md carries a v2-IA decision record (no new tokens); `docs/deferred-work.md` has the 4 human-approved deferrals with the 2026-07-10 authorization line.
      </success_criteria>
      <context_files>
/home/jhber/projects/gander-studio-alpha/CLAUDE.md
/home/jhber/projects/gander-studio-alpha/DESIGN.md
/home/jhber/projects/gander-studio-alpha/docs/deferred-work.md
packages/server/src/router.ts
packages/client/src/components/ModeContent.tsx
packages/client/src/constants/navigation.ts
packages/client/src/AppShell.tsx
(BE-1 completion_packet — final retained-procedure list, provided by ORC)
      </context_files>
      <dependencies>prog-studio-v2-2026-07-s4-retirement-FE-1a, prog-studio-v2-2026-07-s4-retirement-FE-1b, prog-studio-v2-2026-07-s4-retirement-FE-2, prog-studio-v2-2026-07-s4-retirement-FE-3, prog-studio-v2-2026-07-s4-retirement-FE-CAT, prog-studio-v2-2026-07-s4-retirement-FE-4, prog-studio-v2-2026-07-s4-retirement-BE-1</dependencies>
      <out_of_scope>
- Do NOT edit code — docs only. Do NOT add new FF7/design tokens. Do NOT hardcode a procedure count (confirm against router.ts).
- Do NOT document deferred items as done — record them as human-approved deferrals.
      </out_of_scope>
      <output_expected>
        <tag>completion_packet</tag>
        <must_contain>
          <item>updated surfaces table + navigation description (incl. mobile fold) + procedure table (derived, confirmed)</item>
          <item>the source of the new bundle-size number</item>
          <item>the DESIGN.md v2-IA decision record text</item>
          <item>the 4 deferred-work.md entries with the 2026-07-10 authorization citation</item>
        </must_contain>
        <must_not_contain>
          <item>any code edit; new design/FF7 tokens; a transcribed (not derived) procedure count</item>
        </must_not_contain>
        <success_signal>CLAUDE.md + DESIGN.md reflect disk reality (catalog + hoisted rail + mobile fold); procedure table matches router.ts; deferrals recorded with authorization</success_signal>
      </output_expected>
    </task_packet>

  </task_packets>

  <dependency_order>
    FE-1a (rail hoist — additive, 9-tab retained) → FE-1b (retire NAV_ITEMS + <640px fold + all KEEP-spec migration) → FE-2 (Compose; NOT canvas-store) → FE-3 (Export+Planning + canvas-store chain) → FE-CAT (13-role catalog + persistent CTA) → FE-4 (Browse+Graph+Edit + canvas.ts/useLinkSound chain + empty-state CTA re-point) → BE-1 (server removal + types.ts) → DOCS-1 (docs + deferred-work)
    All packets SERIAL. FE-1a→FE-1b is hoist-first (nav never zero: FE-1a keeps the 9-tab bar as fallback while adding the global rail; FE-1b retires the 9-tab config only after the rail is global). Shared-file mutation order (rev3): AppShell.tsx/globals.css/SubmenuRail.tsx = [FE-1a]; navigation.ts[NAV_ITEMS]/BottomTabBar.tsx = [FE-1b]; the 11-spec-floor e2e migration = [FE-1b]; ui-store.ts[union] = [FE-2 rm'compose', FE-3 rm'export'/'planning', FE-CAT add'catalog', FE-4 rm'browse'/'edit'/'graph']; ModeContent.tsx[PAGE_MAP] mirrors 1:1; PartyPage.tsx = [FE-1a rail-mount removal, FE-CAT persistent CTA, FE-4 empty-state re-point] (each against fresh HEAD); canvas-store.ts = [FE-3]; render-loop.spec.ts = [FE-1b Progression sub-test, FE-4 Graph sub-test]; packages/shared {schemas.ts, types.ts} = [BE-1]; docs/deferred-work.md = [DOCS-1 sole writer]. lint ×3 + client build green per packet; Playwright RUN (not spec-reading) gates FE-1b + the deletion waves.
  </dependency_order>

  <routing_notes>
    ## CR#3 resolution (PASS-with-WARNINGs → rev3)
    - **W1 (structural) FIXED — FE-1a/FE-1b split pre-committed** (agent_count 7→8). FE-1a = hoist (AppShell rail render + grid re-template + PartyPage mount removal + SubmenuRail aria-label), 9-tab bar RETAINED as fallback, lint+build+rail-global gate, NO spec edits. FE-1b = NAV_ITEMS retirement + <640px fold + ALL KEEP-spec migration, lint+build+every-pre-FE-1a-green-KEEP-spec-green gate. Rationale (CR#3 W1): the line-count split trigger (~50 lines) can't detect the re-architecture+migration turn-scope risk on the blocking root; the split gives each half an independently-verifiable green gate; hoist-first ⇒ nav provably never zero.
    - **W2 (SC-level) FIXED — spec list is a FLOOR.** FE-1b owns migrating ANY currently-green KEEP spec the nav re-architecture breaks; each post-run red is classified (migrate-in-packet | t5-baseline) in the ui_packet. The 11 named specs are the verified floor; the CR-endorsed discriminator (explicit nav helper/nav-tab click = migrate; goto + in-page Analyze tab = baseline-red/skip, ~14 such KEEP matches) is embedded in FE-1b's out_of_scope. Reference point = the pre-FE-1a t5 baseline (gap-free reading; flagged for the scoped Critic confirmation).
    - **CR watch-item added to FE-4:** pre-delete `edit-page` testid confirmation on s2-d2-edit-save.spec.ts (classification-reversal safety) — BLOCK if the testid is absent.
    - **Carried verbatim (CR#3 disk-confirmed sound):** all six jidoka fixes; the FE-1/FE-4 partial-ownership boundary (render-loop Progression=FE-1b / Graph=FE-4; s2-list-edit-fe fully FE-1b); the agent-roles.ts FE-3 deletion direction.

    ## Recurring-pattern preflight (Step 0.5 — re-affirmed)
    <recurring_pattern source="prog-studio-v2-2026-07-s3-drilldowns.md">plan-time-unverified-inherited-fact (RECURRING, 3rd form). CR#3 independently disk-verified the load-bearing facts (ExportPage canvas-store/compose-store, types.ts:6/12, agent-roles direction, useLinkSound chain, role="tab" population); rev3 carries them with citations. No new unverified enumeration introduced by the split.</recurring_pattern>
    <recurring_pattern source="prog-studio-v2-2026-07-s3-drilldowns.md">cross-spec-interim-assertion-unmarked (§6 G3). ADDRESSED: FE-1b owns the full FLOOR-not-ceiling KEEP-spec migration with an empirical per-red classification; s3/s2/catalog specs kept green.</recurring_pattern>
    <recurring_pattern source="prog-studio-v2-2026-07-s3-drilldowns.md">primitive-behavioral-default-collision (2nd behavioral). ACCEPTED-LOW-RISK — no base-ui primitive modified.</recurring_pattern>
    <recurring_pattern source="prog-studio-v2-2026-07-s3-drilldowns.md">subagentstop-complete-miss (4th). ORC-side — verify COMPLETE events (now 8 code packets), backfill inline.</recurring_pattern>
    <recurring_pattern source="prog-studio-v2-2026-07-s3-drilldowns.md">archivist-paraphrase-drift (4th sighting). AR-side — copy identifiers/defects verbatim.</recurring_pattern>
    <recurring_pattern source="pm_preflight_checklist">OVERSCOPED: the FE-1a/FE-1b split directly discharges this pattern on the sprint's blocking root (CR#3 W1) — the split trigger is now pre-committed, not deferred to a size-only contingency.</recurring_pattern>
    <recurring_pattern source="pm_preflight_checklist">DRY: FE-CAT reuses getParty/useParty + party card patterns; FE-1b reuses the existing bottom-tab pattern + 640px breakpoint; no resurrected browse code, no new endpoint.</recurring_pattern>

    ## REQVAL mapping note (carried)
    "BottomTabBar removed; v2 rail is the sole nav" = the 9-tab v1 NAV_ITEMS config is retired (FE-1b) and SubmenuRail is the sole nav mechanism; the bottom-bar PATTERN survives as the rail's ratified <640px presentation (v2-design-spec 70-74/85-88). REQVAL validates FE-1b's outcome-based SC (NAV_ITEMS gone + nav reachable at desktop AND <640px + aria-label "Main navigation"), NOT the literal "BottomTabBar.tsx deleted" string.

    ## Server decision / DESIGN.md / scoped Critic confirmation
    Server decision unchanged (deprecate-by-removal; 24→18; agent.list retained low-churn; ConnectivityGraphSchema definition protected). DESIGN.md PRESENT at repo root, in FE-1a/FE-CAT/FE-4 + updated by DOCS-1; no new tokens. Scoped Critic confirmation (BLOCK-class re-entry) focus: the FE-1a/FE-1b division has no overlap + each half's gate is independently verifiable; the FLOOR reframing's reference point (pre-FE-1a baseline); the FE-4 edit-page pre-delete check. Step 4.5 human walkthrough (ORC/human-owned) must exercise desktop rail AND <640px fold. Non-blocking residuals (ModeContent paddingBottom:56px desktop gap; stale v2-design-spec:324 aria doc / router.ts STUDIO_ROOT comment; ungated client-vitest) parked as future-pass items (CR#3-endorsed).

    ## sc-precheck
    No Bash in PM toolset — manual self-lint in `sc-precheck-report.json` (this dir, refreshed for the split): FE-1a lint/build-only gate (no false-premise on full-e2e-green mid-hoist); FE-1b FLOOR SC (satisfiable — empirical per-red classification against the t5 list in context_files). Verdict PASS; no locked-value SCs. Recommend ORC/Critic run the mechanical script as backstop.
  </routing_notes>

  <risk_flags>
    - **FE-1a→FE-1b hoist-first ordering is the zero-nav guard:** FE-1a MUST keep the 9-tab BottomTabBar as fallback while adding the global rail; FE-1b retires the 9-tab config only after the rail is global. Any reordering re-introduces a zero-nav window.
    - **FE-1a interim a11y duplicate (accepted):** during FE-1a both the hoisted rail and the still-present BottomTabBar carry "Main navigation" at ≥640px — a transient resolved by FE-1b (BottomTabBar becomes <640px-only). FE-1a is lint/build-gated, not full-e2e/a11y-gated.
    - **FE-1b DOM-mount order (set by FE-1a):** SubmenuRail before BottomTabBar so `text=`/`.first()` locators resolve to the visible element per breakpoint — prove via the live RUN, not static reasoning.
    - **FLOOR reference point:** FE-1b's "still-green" baseline is pre-FE-1a (t5); the split means FE-1a leaves a few hoist-caused reds that FE-1b (not FE-1a) restores — flagged for the scoped Critic confirmation.
    - **Transitive-orphan re-scan gates (FE-3 agent-roles.ts; FE-4 useLinkSound.ts + constants/canvas.ts):** delete only on a confirmed-zero-importer re-grep at execution time.
    - **RETAIN traps:** analyzeStore.ts + constants/browse.ts must NOT be deleted by name-pattern (FE-4 out_of_scope).
    - **FE-4 classification-reversal guard:** confirm the `edit-page` testid in s2-d2-edit-save.spec.ts before deleting; BLOCK if absent.
    - **BE-1 shared-package first-pass:** types.ts edited in the same unit as schemas.ts or the FIRST (shared) tsc pass fails.
    - **Base-plan portability:** all packets plain file edits; no Workflow-tool dependency.
  </risk_flags>

  <human_approved_deferrals date="2026-07-10" authorization="human-ratified this session (ORC-witnessed) — REQVAL maps as deferred-with-authorization, NOT missing">
    <deferral id="rail-collapse-expand" target="docs/deferred-work.md">SubmenuRail collapse/expand (240px↔56px desktop animation) — rail polish; ships fixed 240px. DISTINCT from the <640px mobile bottom-bar fold, which IS delivered (FE-1b, functional necessity, spec-ratified).</deferral>
    <deferral id="DEFERRED-V2S2-1-390px-header" target="docs/deferred-work.md">390px header overflow (DEFERRED-V2S2-1) — pre-existing responsive bug; separate pass.</deferral>
    <deferral id="DEFERRED-V2S3-1-roster-name-map" target="docs/deferred-work.md">Retire ROSTER_AGENT_NAME_BY_CODE via AgentDetailSchema extension — additive BE schema extension + FE refactor; dedicated follow-up.</deferral>
    <deferral id="DEFERRED-V2S3-2-mg-contrast" target="docs/deferred-work.md">--mg-on---sfh contrast_pairs row (DEFERRED-V2S3-2) — conditional next-design-pass item.</deferral>
  </human_approved_deferrals>
</task_decomposition>

---

## Verbatim Deliverable Audit (Step 7 — rev3)

<verbatim_deliverable_audit>
  <phrase text="kick off s4"><addressed task="all — rev3 decomposition produced"/></phrase>
  <phrase text="retire the CUT surfaces (Compose, Export, Planning)"><addressed task="FE-2 (Compose), FE-3 (Export+Planning+canvas-store chain), BE-1 (their server procedures)"/></phrase>
  <phrase text="remove the absorbed v1 surfaces (Browse, Graph, Edit)"><addressed task="FE-4 (+ transitive useLinkSound/canvas.ts chain)"/></phrase>
  <phrase text="now that s3's drill-downs carry their value"><addressed task="FE-4 (cites s3 absorption e2e green; absorption-before-cut)"/></phrase>
  <phrase text="remove the 9-tab BottomTabBar"><addressed task="FE-1b (retires 9-tab v1 NAV_ITEMS; <640px fold = spec-ratified mobile form; REQVAL mapping note) — enabled by FE-1a's hoist"/></phrase>
  <phrase text="in favor of the v2 rail"><addressed task="FE-1a (hoist SubmenuRail global) + FE-1b (retire + <640px fold)"/></phrase>
  <phrase text="prune dead stores/components/routes"><addressed task="FE-1b/FE-2/FE-3/FE-4 (client, incl. transitive canvas-store/agent-roles/useLinkSound/canvas.ts chains), BE-1 (server + types.ts)"/></phrase>
  <phrase text="update project docs (CLAUDE.md surfaces + tRPC tables, DESIGN.md) to v2 reality"><addressed task="DOCS-1"/></phrase>
  <phrase text="s3 inheritance (a) View-Full-Roster CTA re-point"><addressed task="FE-4 (empty-state → catalog) + FE-CAT (persistent populated-home CTA → catalog) — human-ratified 2026-07-10"/></phrase>
  <phrase text="s3 inheritance (b) Roster rail collapse/expand"><deferred reason="human-approved 2026-07-10; rail polish (fixed 240px ships), distinct from the delivered mobile fold, → docs/deferred-work.md (DOCS-1)"/></phrase>
  <phrase text="s3 inheritance (c) 390px header overflow"><deferred reason="human-approved 2026-07-10; DEFERRED-V2S2-1, → docs/deferred-work.md (DOCS-1)"/></phrase>
  <phrase text="s3 inheritance (d) stale CLAUDE.md bundle baseline"><addressed task="DOCS-1"/></phrase>
  <phrase text="s3 inheritance (e) 13-role catalog entry"><addressed task="FE-CAT (catalog surface + persistent entry CTA) + FE-4 (empty-state entry)"/></phrase>
  <phrase text="DEFERRED-V2S3-1 (retire ROSTER_AGENT_NAME_BY_CODE via schema extension)"><deferred reason="human-approved 2026-07-10; additive schema extension, → docs/deferred-work.md (DOCS-1)"/></phrase>
  <phrase text="DEFERRED-V2S3-2 (--mg on --sfh contrast_pairs row)"><deferred reason="human-approved 2026-07-10; conditional design-pass item, → docs/deferred-work.md (DOCS-1)"/></phrase>
  <phrase text="export/loadout server procedures — retained vs deprecated (PM decides, Critic gate)"><addressed task="BE-1 (deprecate-by-removal; 24→18; ConnectivityGraphSchema definition retained; types.ts Loadout derivation removed)"/></phrase>
  <phrase text="mobile/sub-lg nav (functional necessity)"><addressed task="FE-1b (<640px bottom-bar fold per v2-design-spec 85-88/70-74; no zero-nav state)"/></phrase>
</verbatim_deliverable_audit>

---

## Expectation Manifest (rev3)

<expectation_manifest>
  <sprint_id>prog-studio-v2-2026-07-s4-retirement</sprint_id>
  <generated>2026-07-10 (rev3)</generated>
  <assignments>
    <assignment>
      <task_id>prog-studio-v2-2026-07-s4-retirement-FE-1a</task_id>
      <agent>FE#1</agent>
      <expected_tag>ui_packet</expected_tag>
      <expected_file>.claude/tasks/outputs/prog-studio-v2-2026-07-s4-retirement-FE-1a-{ts}.md</expected_file>
      <blocks>FE-1b (+ all downstream)</blocks>
      <receipt_check>
        <item>SubmenuRail global (before BottomTabBar) + grid re-templated (≥640px rail area) + page-local mount removed; aria-label "Main navigation"</item>
        <item>NAV_ITEMS + BottomTabBar.tsx UNTOUCHED (9-tab fallback intact); nav never zero; rail verified global on a non-party surface</item>
        <item>NO e2e spec edited; hoist-caused-red classification recorded for FE-1b; lint ×3 + build green</item>
      </receipt_check>
    </assignment>
    <assignment>
      <task_id>prog-studio-v2-2026-07-s4-retirement-FE-1b</task_id>
      <agent>FE#2</agent>
      <expected_tag>ui_packet</expected_tag>
      <expected_file>.claude/tasks/outputs/prog-studio-v2-2026-07-s4-retirement-FE-1b-{ts}.md</expected_file>
      <blocks>FE-2 (+ all downstream)</blocks>
      <receipt_check>
        <item>NAV_ITEMS retired; <640px fold live (BottomTabBar→RAIL_ITEMS gated); nav reachable at desktop AND <640px; no zero-nav</item>
        <item>FLOOR + beyond: every pre-FE-1a-green KEEP spec green via RUN; each red classified migrate-vs-t5-baseline</item>
        <item>render-loop Progression-only; 4 t6b sub-tests removed; in-page Analyze-tab specs NOT migrated; lint ×3 + build + RUN</item>
      </receipt_check>
    </assignment>
    <assignment>
      <task_id>prog-studio-v2-2026-07-s4-retirement-FE-2</task_id>
      <agent>FE#3</agent>
      <expected_tag>ui_packet</expected_tag>
      <expected_file>.claude/tasks/outputs/prog-studio-v2-2026-07-s4-retirement-FE-2-{ts}.md</expected_file>
      <blocks>FE-3 (+ downstream), BE-1</blocks>
      <receipt_check>
        <item>Compose deleted incl. compose-store; canvas-store NOT deleted (explicit); 'compose' off union/PAGE_MAP; no trpc.loadout</item>
        <item>7 Compose specs deleted; lint ×3 + build + Playwright RUN; KEEP specs green</item>
      </receipt_check>
    </assignment>
    <assignment>
      <task_id>prog-studio-v2-2026-07-s4-retirement-FE-3</task_id>
      <agent>FE#4</agent>
      <expected_tag>ui_packet</expected_tag>
      <expected_file>.claude/tasks/outputs/prog-studio-v2-2026-07-s4-retirement-FE-3-{ts}.md</expected_file>
      <blocks>FE-CAT (+ downstream), BE-1</blocks>
      <receipt_check>
        <item>Export+Planning+canvas-store deleted; agent-roles.ts orphan decision w/ re-scan; 'export'/'planning' off union/PAGE_MAP</item>
        <item>s2-d3-session-buffer (KEEP) untouched; s2-d2-edit-save left for FE-4; no trpc.export/planning; lint ×3 + build + RUN</item>
      </receipt_check>
    </assignment>
    <assignment>
      <task_id>prog-studio-v2-2026-07-s4-retirement-FE-CAT</task_id>
      <agent>FE#5</agent>
      <expected_tag>ui_packet</expected_tag>
      <expected_file>.claude/tasks/outputs/prog-studio-v2-2026-07-s4-retirement-FE-CAT-{ts}.md</expected_file>
      <blocks>FE-4, DOCS-1</blocks>
      <receipt_check>
        <item>catalog reuses getParty (not agent.list), uncapped; 'catalog' mode not in rail; party 6-cap unchanged</item>
        <item>persistent populated-home CTA → catalog + Tier-2 assertion (cite ratification); data-driven count; new spec name + green; lint ×3 + build + RUN</item>
      </receipt_check>
    </assignment>
    <assignment>
      <task_id>prog-studio-v2-2026-07-s4-retirement-FE-4</task_id>
      <agent>FE#6</agent>
      <expected_tag>ui_packet</expected_tag>
      <expected_file>.claude/tasks/outputs/prog-studio-v2-2026-07-s4-retirement-FE-4-{ts}.md</expected_file>
      <blocks>BE-1, DOCS-1</blocks>
      <receipt_check>
        <item>s3 absorption cited green; RETAIN confirmations for analyzeStore + constants/browse.ts (KEEP consumer named)</item>
        <item>s2-d2-edit-save edit-page testid CONFIRMED before deletion (or BLOCKED); useLinkSound + constants/canvas.ts deleted w/ re-scan</item>
        <item>empty-state CTA → catalog; PartyPage compiles; no 'browse' literal; render-loop Graph sub-test removed; s2-party CTA testid updated; lint ×3 + build + RUN (s3/s2/catalog green)</item>
      </receipt_check>
    </assignment>
    <assignment>
      <task_id>prog-studio-v2-2026-07-s4-retirement-BE-1</task_id>
      <agent>BE#1</agent>
      <expected_tag>completion_packet</expected_tag>
      <expected_file>.claude/tasks/outputs/prog-studio-v2-2026-07-s4-retirement-BE-1-{ts}.md</expected_file>
      <blocks>DOCS-1</blocks>
      <receipt_check>
        <item>pre-removal scan; ConnectivityGraphSchema distinction (router.ts import pruned; definition + agent-detail import retained)</item>
        <item>types.ts Loadout-derivation removed + shared (first) tsc pass clean; final 18-procedure list for DOCS-1</item>
        <item>agent.list/skill.list/hook.list retained; env.ts unchanged; lint ×3 + server vitest + client build green; no inline commit</item>
      </receipt_check>
    </assignment>
    <assignment>
      <task_id>prog-studio-v2-2026-07-s4-retirement-DOCS-1</task_id>
      <agent>FE#7</agent>
      <expected_tag>completion_packet</expected_tag>
      <expected_file>.claude/tasks/outputs/prog-studio-v2-2026-07-s4-retirement-DOCS-1-{ts}.md</expected_file>
      <blocks>NONE (terminal; feeds Step 4.5 + skein)</blocks>
      <receipt_check>
        <item>surfaces table = 6 v2 surfaces incl. Roster Catalog; nav = global rail ("Main navigation") + <640px fold + catalog-via-CTA</item>
        <item>procedure table matches router.ts at HEAD (18, derived/confirmed); ConnectivityGraphSchema-retained note; architecture tree matches disk (analyzeStore retained; session-picker corrected)</item>
        <item>bundle baseline updated w/ source; DESIGN.md IA record (no tokens); deferred-work has the 4 deferrals w/ 2026-07-10 authorization</item>
      </receipt_check>
    </assignment>
  </assignments>
</expectation_manifest>

---

## COMPLETE (rev3)
Plan of record: `.claude/tasks/outputs/prog-studio-v2-2026-07-s4-retirement-rev3-PM-1783715959.md` (self-contained; supersedes rev2).
Adjacent: `.claude/tasks/outputs/sc-precheck-report.json` (refreshed).
8 task_packets inline (FE-1a, FE-1b, FE-2, FE-3, FE-CAT, FE-4, BE-1, DOCS-1) — no-stub self-check PASS (8 `<task_packet>` == 8 declared, agent_count=8). CR#3 W1 (structural split) + W2 (FLOOR reframe) + the FE-4 edit-page watch-item applied; everything else carried verbatim (CR-disk-confirmed). rev3 reads: 1 (the CR#3 critique). Gets a scoped Critic confirmation per the BLOCK-class re-entry rule.
