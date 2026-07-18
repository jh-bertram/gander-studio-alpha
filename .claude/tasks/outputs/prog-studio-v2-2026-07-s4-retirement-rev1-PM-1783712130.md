# PM Task Decomposition (REV-1) — prog-studio-v2-2026-07-s4-retirement

Single plan of record (supersedes amend-1 `...-amend1-PM-1783710354.md`). Revised per CRITIQUE_BLOCK `...-CR-1783711002.md`: BLOCKER (FE-1 false SubmenuRail-mount premise → hoist + responsive mobile-nav), WARNING 1 (FE-1 re-estimate), WARNING 2 (t5 artifact into every FE packet's context_files), WARNING 3 (SCOPE_DRIFT — resolved by human ratification of the persistent CTA).

Adjacent: `sc-precheck-report.json` (this dir), PM log `docs/agent-logs/PM/prog-studio-v2-2026-07-s4-retirement.md`.

---

## BLOCKER resolution — disk-verified 2026-07-10 (rev1 re-verification)
- `AppShell.tsx` renders only `<Header/> <ModeContent/> <BottomTabBar/>` (lines 8-10). CONFIRMED.
- `.app-shell` grid (`globals.css:91-97`): `grid-template-columns: 1fr; grid-template-areas: "hd" "mn"` — Header + Main only, NO rail area. CONFIRMED.
- `SubmenuRail` is mounted PAGE-LOCAL inside `PartyPage.tsx` (import line 6, mount ~223, wrapped `hidden lg:flex`); PartyPage.tsx:26-29 records verbatim: "SubmenuRail is mounted page-local here (desktop-only, hidden below `lg`), NOT hoisted into the global AppShell this sprint — **s4 lifts it when it removes BottomTabBar**." CONFIRMED — FE-1 must discharge this obligation.
- **Mobile-nav story is SPEC-DEFINED (not silent) — follow verbatim.** `docs/v2-vision/v2-design-spec.md` `<responsive>` (lines 85-88) + Mobile paragraph (lines 70-74): `lg` → 3-col grid + persistent 240px left rail; `md` (640-1023px) → rail unchanged; `sm` (<640px) → PartyGrid 1-col and **"SubmenuRail folds into the existing global BottomTabBar (5 tabs total, reusing the app's current bottom-tab pattern — no new nav mechanism)"** / "its 4 items fold into the existing global BottomTabBar … navigation mechanism for small viewports." So the mobile fallback is a bottom-bar carrying the RAIL's 4 destinations — a functional necessity, spec-ratified, NOT the deferred collapse/expand polish.

## FE-CAT data source — disk-verified (Critic forecast adopted)
`PartyPage` consumes `useParty` (line 3); `roster.getParty` returns the FULL roster and PartyPage caps display at 6 (`PARTY_GRID_DISPLAY_CAP = 6`, line 36). FE-CAT REUSES `useParty`/getParty and renders ALL members (uncapped) → the 13-role catalog with NO new BE procedure (DRY). `agent.list` is NOT used by FE-CAT (Critic: it "returns only spec-backed agents and may under-count ROSTER roles with null specFile").

## Ratified adjudications carried from the critique (unchanged, no re-litigation)
- CATALOG IA — RATIFIED: `'catalog'` new AppMode (union-member + PAGE_MAP-key add, same shape as s3's `'agent-detail'`; not added to RAIL_ITEMS). FE-CAT proceeds; no BLOCK.
- CONNECTIVITY COUPLING — PROTECTED: `parsers/agent-detail.ts` imports `ConnectivityGraphSchema` (line 16, used at line 44). BE-1 must RETAIN the schema; only the `connectivity.getGraph` procedure (+ the separate connectivity *parser*, if any) is removed — scan-gated.

## Human ratification (this session, 2026-07-10, ORC-witnessed) — resolves WARNING 3
Persistent "View Full Roster" CTA on the party homescreen (visible in the POPULATED/default state, not only the empty state) → navigates to `'catalog'`. The rail stays at its ratified 4 items — the catalog does NOT join the rail. FE-CAT / FE-4 SCs written to this; packets cite "human-ratified 2026-07-10 (ORC-witnessed)."

## Server-procedure decision (unchanged; Critic-gated — brief output #3)
DEPRECATE-BY-REMOVAL: REMOVE `export.spawn`, `loadout.*`, `planning.list`, `connectivity.getGraph` (disk-verified zero v2 consumer). RETAIN `agent.get/save`+`skill.get/save` (ReviseSpecAction), roster/session/progression/program, env.ts, and `ConnectivityGraphSchema` (agent-detail dependency). `agent.list/skill.list/hook.list`: RETAIN as low-churn thin wrappers over parsers that stay anyway (parseAllAgents/Skills/Hooks back agent.get/skill.get/roster) — CORRECTION vs amend-1: they are NOT a FE-CAT consumer (FE-CAT uses getParty); retention is a low-risk declutter-vs-churn call, flagged for the Critic, not load-bearing. Net procedure set 24 → 18; DOCS-1 derives the count from post-BE-1 router.ts.

---

<task_decomposition task_id="prog-studio-v2-2026-07-s4-retirement" agent_count="7">
  <task_packets>

    <task_packet>
      <task_id>prog-studio-v2-2026-07-s4-retirement-FE-1</task_id>
      <assigned_to>frontend-engineer</assigned_to>
      <priority>HIGH</priority>
      <description>
NAV-SHELL RE-ARCHITECTURE (Wave 0) — HOIST the SubmenuRail into the global shell and retire the 9-tab v1 nav. This is net-new layout work (discharges the "s4 lifts it" obligation at PartyPage.tsx:26-29), NOT a pure deletion. HARD ORDERING WITHIN THE PACKET: hoist the rail global BEFORE removing the 9-tab bar — never leave a window with zero global navigation.
1. HOIST: render `<SubmenuRail/>` in `AppShell.tsx` (global, present on every surface). Re-template the `.app-shell` grid in `globals.css:91-97` to give the rail a grid area/column (e.g. add a rail column + `grid-template-areas` entry) — do NOT prescribe the exact template; implement per the spec's layout. REMOVE the page-local rail mount from `PartyPage.tsx` (import line 6 + the `hidden lg:flex` mount ~lines 222-224 + reconcile the stale plan-R-3 comment lines 26-29) so the rail is not double-rendered.
2. RESPONSIVE MOBILE-NAV — FOLLOW THE SPEC VERBATIM (`docs/v2-vision/v2-design-spec.md` `<responsive>` lines 85-88 + Mobile paragraph lines 70-74): persistent left rail at md/lg (≥640px); at sm (<640px) the 4 rail destinations (Roster→party / Sessions / Progression / Programs) MUST remain reachable via a bottom-bar FOLD that reuses the existing bottom-tab pattern ("no new nav mechanism"). You MAY repurpose `BottomTabBar.tsx` to render `RAIL_ITEMS` shown only <640px (DRY, matches the spec's "reusing the current bottom-tab pattern"), OR give the hoisted rail a responsive bottom-bar form. Do NOT ship a zero-nav mobile state. The rail renders at the fixed 240px open width (PartyPage.tsx:34); collapse/expand 240↔56 is a human-approved DEFERRAL — do NOT implement it.
3. RETIRE THE 9-TAB v1 NAV: remove `NAV_ITEMS` (the 9 v1-mode tabs) + `NavItemDef` from `constants/navigation.ts` (grep importers first; keep `RAIL_ITEMS` + `RailItemDef` byte-identical). The 9-tab v1 configuration is what "remove the 9-tab BottomTabBar" retires; if you repurpose BottomTabBar.tsx to the 4-item mobile fold, that is the spec-ratified mobile form of the rail, not a violation (flagged for the Critic re-gate in routing_notes).
4. e2e (mechanical rule 2): the 9-tab retirement + rail hoist legitimately falsify any assertion about the 9-tab bar / its v1 tab labels / its always-present global position. Grep `tests/e2e` for `BottomTabBar`, `role="tablist"`, `role="tab"`, v1 tab labels, 9-tab counts. UPDATE (don't delete) those assertions in `gander-studio-p1-fe-shell.spec.ts`, `layout-sidebar-removal.spec.ts`, `prog-studio-v2-2026-07-s2-party-shell.spec.ts` to the global-rail + mobile-fold reality. Cross-check the t5 57-failure classification (in context_files) to distinguish a spec you falsified from a pre-existing-red spec. ASSERT e2e status by RUNNING `npx playwright test` (not by reading spec files) and attach the run summary.
DESIGN.md present at repo root — reuse FF7 tokens, NO new tokens; `design_system_source: DESIGN_MD`. The rail surface token is `--sf` (spec token line 247).
      </description>
      <success_criteria>
- `<SubmenuRail/>` rendered in `AppShell.tsx` (global); `.app-shell` grid re-templated with a rail area; `grep -n "SubmenuRail" packages/client/src/pages/PartyPage.tsx` returns nothing (page-local mount removed; no double-render).
- `NAV_ITEMS` (9 v1-mode tabs) removed: `grep -rn "NAV_ITEMS" packages/client/src` empty; `RAIL_ITEMS` unchanged.
- NAV REACHABILITY FROM A NON-PARTY SURFACE (Critic-mandated): a Playwright assertion navigating to Sessions confirms the rail is present and routes to Progression (the rail is global, not trapped on party). At a <640px viewport, the 4 rail destinations are reachable from a non-party surface via the bottom-bar fold. NO zero-nav state at any tested width.
- All 4 KEEP routes + party reachable via the global rail (desktop/tablet) and the mobile fold (<640px) from any surface.
- Rail renders at fixed 240px open (collapse/expand NOT implemented — deferred).
- `npm run lint` (tsc ×3) clean; `npm run build -w @gander-studio/client` passing.
- e2e RUN via `npx playwright test`: 9-tab/global-nav assertions updated, KEEP + s3-drilldowns + s2-party specs green, NO NEW failure vs the t5 57-failure list; run summary attached.
      </success_criteria>
      <context_files>
packages/client/src/AppShell.tsx
packages/client/src/globals.css
packages/client/src/pages/PartyPage.tsx
packages/client/src/components/party/SubmenuRail.tsx
packages/client/src/components/BottomTabBar.tsx
packages/client/src/constants/navigation.ts
docs/v2-vision/v2-design-spec.md
packages/client/tests/e2e/gander-studio-p1-fe-shell.spec.ts
packages/client/tests/e2e/layout-sidebar-removal.spec.ts
packages/client/tests/e2e/prog-studio-v2-2026-07-s2-party-shell.spec.ts
.claude/tasks/outputs/prog-studio-v2-2026-07-s3-drilldowns-t5-FE-1783490746.md
DESIGN.md
      </context_files>
      <dependencies>none (first wave)</dependencies>
      <out_of_scope>
- Do NOT touch the AppMode union (ui-store.ts) or PAGE_MAP (ModeContent.tsx) — surface add/remove is FE-CAT/FE-2/3/4. The 6 cut surfaces remain compilable after this wave.
- Do NOT implement rail collapse/expand (240↔56) — human-approved deferral; render fixed 240px.
- Do NOT remove/edit FF7 tokens; do NOT introduce a new breakpoint value (spec: reuse the existing content-container width, DRY).
- Do NOT delete `prog-studio-v2-2026-07-s3-drilldowns.spec.ts` or s2 party-card/quick-peek assertions.
- Do NOT add the persistent View-Full-Roster CTA (that is FE-CAT); do NOT modify PartyPage's party-member rendering beyond removing the rail mount.
      </out_of_scope>
      <estimated_new_lines>~45-65 net-new (nav re-architecture: rail hoist + responsive `.app-shell` grid + mobile bottom-bar fold + spec updates; the page-local mount removal is subtractive). JUSTIFICATION: one logical nav-shell re-architecture; hoist MUST precede 9-tab retirement (never a zero-nav window), so it is not cleanly separable without a sequencing dependency. CONTINGENCY (Critic WARNING 1): if implementation breaches ~50 net-new lines, BLOCK-to-split — FE-1a (hoist rail global + responsive grid; the 9-tab bar STAYS as fallback so nav is never zero) → FE-1b (retire the 9-tab NAV_ITEMS + wire the mobile bottom-bar fold). Report the split as a BLOCKED event with the line estimate; do not silently consolidate.</estimated_new_lines>
      <output_expected>
        <tag>ui_packet</tag>
        <must_contain>
          <item>confirmation SubmenuRail is global (AppShell) + page-local mount removed + grid re-templated</item>
          <item>the mobile-nav implementation choice (repurposed BottomTabBar vs responsive rail) with the v2-design-spec line citations it follows</item>
          <item>the non-party-surface nav-reachability assertion (desktop + <640px) result</item>
          <item>net-new line count + whether the split contingency fired</item>
          <item>lint ×3 + build + Playwright RUN summary (t5-baseline cross-check)</item>
        </must_contain>
        <must_not_contain>
          <item>any edit to ui-store.ts AppMode union or ModeContent.tsx PAGE_MAP</item>
          <item>a rail collapse/expand implementation</item>
          <item>a zero-nav mobile state</item>
          <item>e2e status asserted by reading spec files instead of running Playwright</item>
        </must_not_contain>
        <success_signal>rail global + mobile fold live, KEEP surfaces reachable from any surface at desktop AND mobile, grep NAV_ITEMS empty, lint ×3 clean, build passing, Playwright run attached, no new red vs t5</success_signal>
      </output_expected>
    </task_packet>

    <task_packet>
      <task_id>prog-studio-v2-2026-07-s4-retirement-FE-2</task_id>
      <assigned_to>frontend-engineer</assigned_to>
      <priority>HIGH</priority>
      <description>
CUT-SURFACE DELETION (Wave 1) — COMPOSE (heaviest single surface: page + materia-canvas subtree + 2 stores + 5 e2e specs). One logical deletion unit bounded by the Compose surface. Steps:
1. Delete `pages/ComposePage.tsx`.
2. Delete stores `store/compose-store.ts` + `store/canvas-store.ts` — FIRST grep every importer; if any retained surface (party/agent-detail/catalog/sessions/progression/programs) imports them, emit BLOCKED. (Expected: only Compose.)
3. Delete Compose-only components (materia-canvas node/edge/orb, loadout panel) after per-file importer scan; enumerate every deleted file.
4. AppMode↔PAGE_MAP (compiler-exhaustive invariant): remove `'compose'` from the AppMode union in `store/ui-store.ts`; remove the `compose:` PAGE_MAP line + the `ComposePage` React.lazy import in `components/ModeContent.tsx`.
5. e2e: delete Compose-surface specs WITH the surface: `gander-studio-p1-compose-fe.spec.ts`, `gander-studio-p2-canvas-link-003a.spec.ts`, `materia-canvas-proximity.spec.ts`, `card-node-title-edit.spec.ts`, `loadout-list-panel.spec.ts`. Confirm each describe/title targets Compose/loadout-canvas before deleting; cross-check the t5 57-failure list (in context_files). RUN `npx playwright test`; attach summary.
Client refs to `trpc.loadout.*` vanish with ComposePage — un-blocking BE-1.
      </description>
      <success_criteria>
- ComposePage, compose-store, canvas-store, all Compose-only components deleted; `grep -rn "ComposePage\|compose-store\|canvas-store\|useComposeStore\|useCanvasStore" packages/client/src` empty.
- `'compose'` removed from AppMode union; no `compose` PAGE_MAP entry; no `trpc.loadout.` reference in client src.
- 5 named Compose specs deleted; no other spec references Compose.
- `npm run lint` (tsc ×3) clean; client build passing; Playwright RUN shows no NEW failure vs the t5 list; KEEP specs green.
      </success_criteria>
      <context_files>
packages/client/src/pages/ComposePage.tsx
packages/client/src/store/compose-store.ts
packages/client/src/store/canvas-store.ts
packages/client/src/store/ui-store.ts
packages/client/src/components/ModeContent.tsx
packages/client/tests/e2e/gander-studio-p1-compose-fe.spec.ts
packages/client/tests/e2e/gander-studio-p2-canvas-link-003a.spec.ts
packages/client/tests/e2e/materia-canvas-proximity.spec.ts
packages/client/tests/e2e/card-node-title-edit.spec.ts
packages/client/tests/e2e/loadout-list-panel.spec.ts
.claude/tasks/outputs/prog-studio-v2-2026-07-s3-drilldowns-t5-FE-1783490746.md
      </context_files>
      <dependencies>prog-studio-v2-2026-07-s4-retirement-FE-1</dependencies>
      <out_of_scope>
- Do NOT touch browse/edit/analyze stores — FE-4.
- Do NOT touch server code (loadout removal is BE-1).
- Do NOT remove other union members — only 'compose'.
- Do NOT touch FF7 tokens or the nav shell (FE-1 owns it).
      </out_of_scope>
      <estimated_new_lines>0 net-new (deletion wave)</estimated_new_lines>
      <output_expected>
        <tag>ui_packet</tag>
        <must_contain>
          <item>every deleted file with importer-scan justification</item>
          <item>lint ×3 + build + Playwright RUN summary (t5-baseline cross-check)</item>
        </must_contain>
        <must_not_contain>
          <item>edits to browse/edit/analyze stores or non-Compose surfaces or the nav shell</item>
          <item>server-side edits</item>
        </must_not_contain>
        <success_signal>lint ×3 clean, build passing, compose greps empty, KEEP specs green, no new red vs t5</success_signal>
      </output_expected>
    </task_packet>

    <task_packet>
      <task_id>prog-studio-v2-2026-07-s4-retirement-FE-3</task_id>
      <assigned_to>frontend-engineer</assigned_to>
      <priority>HIGH</priority>
      <description>
CUT-SURFACE DELETION (Wave 2) — EXPORT + PLANNING (two light CUT surfaces; one unit bounded by the remaining CUT verdict). Steps:
1. Delete `pages/ExportPage.tsx` and `pages/PlanningPage.tsx`.
2. Grep + delete Export-only / Planning-only components with zero retained-surface importer; enumerate.
3. AppMode↔PAGE_MAP: remove `'export'` and `'planning'` from the AppMode union (`store/ui-store.ts`); remove the `export:`/`planning:` PAGE_MAP entries + imports in `components/ModeContent.tsx`.
4. e2e: delete surface specs WITH the surface: `gander-studio-p1-export-fe.spec.ts`, `prog-studio-vision-s2-d1-export.spec.ts` (verify it targets the Export SURFACE, not a session export), `prog-studio-vision-s3-planning.spec.ts`. Confirm each describe/title; cross-check the t5 list. RUN `npx playwright test`; attach summary.
Client refs to `trpc.export.spawn` + `trpc.planning.list` vanish — un-blocking BE-1.
CAUTION: `prog-studio-vision-s2-d2-edit-save.spec.ts` covers SESSION markdown save (KEEP) — do NOT delete it here or in FE-4.
      </description>
      <success_criteria>
- ExportPage + PlanningPage + exclusive components deleted; `grep -rn "ExportPage\|PlanningPage" packages/client/src` empty.
- `'export'`/`'planning'` removed from AppMode union; no export/planning PAGE_MAP entries; no `trpc.export.spawn`/`trpc.planning.list` in client src.
- The 3 named specs deleted; session-edit-save spec untouched and green.
- `npm run lint` (tsc ×3) clean; client build passing; Playwright RUN shows no NEW failure vs the t5 list.
      </success_criteria>
      <context_files>
packages/client/src/pages/ExportPage.tsx
packages/client/src/pages/PlanningPage.tsx
packages/client/src/store/ui-store.ts
packages/client/src/components/ModeContent.tsx
packages/client/tests/e2e/gander-studio-p1-export-fe.spec.ts
packages/client/tests/e2e/prog-studio-vision-s2-d1-export.spec.ts
packages/client/tests/e2e/prog-studio-vision-s3-planning.spec.ts
.claude/tasks/outputs/prog-studio-v2-2026-07-s3-drilldowns-t5-FE-1783490746.md
      </context_files>
      <dependencies>prog-studio-v2-2026-07-s4-retirement-FE-2</dependencies>
      <out_of_scope>
- Do NOT touch browse/edit/graph surfaces or their stores — FE-4.
- Do NOT delete session-related specs (edit-save, session-buffer, timeline).
- Do NOT touch server code (export/planning removal is BE-1) or the nav shell.
- Do NOT touch FF7 tokens.
      </out_of_scope>
      <estimated_new_lines>0 net-new (deletion wave)</estimated_new_lines>
      <output_expected>
        <tag>ui_packet</tag>
        <must_contain>
          <item>files deleted + importer-scan justification</item>
          <item>confirmation session-edit-save spec NOT touched</item>
          <item>lint ×3 + build + Playwright RUN summary (t5-baseline cross-check)</item>
        </must_contain>
        <must_not_contain>
          <item>edits to browse/edit/graph surfaces</item>
          <item>server-side edits</item>
        </must_not_contain>
        <success_signal>lint ×3 clean, build passing, export/planning greps empty, session specs green, no new red vs t5</success_signal>
      </output_expected>
    </task_packet>

    <task_packet>
      <task_id>prog-studio-v2-2026-07-s4-retirement-FE-CAT</task_id>
      <assigned_to>frontend-engineer</assigned_to>
      <priority>HIGH</priority>
      <description>
NEW SURFACE — 13-ROLE CATALOG (honors s3 ratification #1: "Six-agent homescreen (13-role catalog entry → s4 scope)"; delivers "the CTA's true destination"). ADDITIVE; the party homescreen stays 6-agent. Two deliverables: (A) the catalog surface, (B) the persistent entry CTA on the populated party home (human-ratified 2026-07-10, ORC-witnessed).
1. DATA SOURCE (DRY, Critic-endorsed, no new BE proc): REUSE the existing `useParty` hook / `roster.getParty` — it returns the FULL roster; PartyPage caps display at 6 (`PARTY_GRID_DISPLAY_CAP`). The catalog renders ALL members (uncapped) = the ratified 13-role set. Do NOT use `agent.list` (under-counts roster roles with null specFile). Do NOT add a BE procedure; do NOT resurrect deleted BrowsePage code.
2. SURFACE: add the `'catalog'` AppMode member to `store/ui-store.ts` (Critic-RATIFIED name/mechanism — proceed, do not BLOCK); add a matching PAGE_MAP entry + a React.lazy import (lazy-from-birth, matching the s3 pattern) in `components/ModeContent.tsx`; create `pages/RosterCatalogPage.tsx` rendering every roster member as a card/list with first-class loading / empty / error states. Reuse the party card / role-card patterns where data shapes match (DRY); the catalog "retains the browse affordance" (ratification #2) — a browsable full-roster listing, a fresh lightweight surface, not the deleted BrowsePage. Count is DATA-DRIVEN (render what getParty returns; do NOT hardcode 13).
3. PERSISTENT ENTRY CTA (human-ratified 2026-07-10, ORC-witnessed — resolves Critic SCOPE_DRIFT): add a persistent "View Full Roster" affordance to the POPULATED/default party home (e.g. in the party header/PartyScreenHeader region, NOT only the empty state) → `setActiveMode('catalog')`. The rail stays at its ratified 4 items — the catalog is NOT added to RAIL_ITEMS.
4. Do NOT re-point the EMPTY-state CTA here (FE-4 owns handleViewRoster's `'browse'`→`'catalog'` re-point, after this surface exists). Do NOT alter the party 6-agent display cap.
5. e2e (program invariant — Tier-2 spec per new surface): add a Tier-2 Playwright spec that (a) from the POPULATED party home, the persistent "View Full Roster" affordance is visible and routes to the catalog; (b) the catalog renders the full roster + honest empty/error states; keyboard-operable. RUN `npx playwright test`; attach summary; cross-check the t5 list.
DESIGN.md present — reuse FF7 tokens, NO new tokens; `design_system_source: DESIGN_MD`.
      </description>
      <success_criteria>
- `'catalog'` AppMode member added with a PAGE_MAP entry + lazy import; `pages/RosterCatalogPage.tsx` exists and renders every member returned by `useParty`/getParty (uncapped) with loading/empty/error states.
- The full roster (ratified 13) renders; the count is data-driven — `grep -n "13" packages/client/src/pages/RosterCatalogPage.tsx` shows no magic-number role count.
- PERSISTENT CTA: the populated party home shows a "View Full Roster" affordance that routes to `'catalog'` (human-ratified 2026-07-10, ORC-witnessed); a Tier-2 assertion confirms it from the POPULATED state (not merely empty/direct-mode). Rail NOT modified (catalog not in RAIL_ITEMS).
- Party homescreen 6-agent display cap unchanged (`PARTY_GRID_DISPLAY_CAP` untouched).
- No new visual tokens (FF7 reuse); `npm run lint` (tsc ×3) clean; client build passing; Playwright RUN shows the new catalog spec green + no NEW failure vs the t5 list.
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
- Do NOT add a new BE tRPC procedure or Zod schema — reuse getParty via useParty.
- Do NOT use agent.list for the catalog (under-count risk); do NOT resurrect deleted BrowsePage/useBrowseData/browse-store code.
- Do NOT add the catalog to RAIL_ITEMS; do NOT re-point handleViewRoster (FE-4); do NOT change the party 6-agent display cap.
- Do NOT touch the nav shell (FE-1) beyond adding the persistent CTA to the party home.
- Do NOT add new FF7/design tokens.
      </out_of_scope>
      <estimated_new_lines>~120-140 (RosterCatalogPage + role-card reuse + mode wiring + persistent CTA + Tier-2 spec). JUSTIFICATION: one cohesive surface + its ratified entry affordance, one data source (getParty), standard page+lazy-mode+spec pattern; splitting would fragment one surface. If the page alone exceeds ~150 lines, BLOCK to split the role-card component from the page.</estimated_new_lines>
      <output_expected>
        <tag>ui_packet</tag>
        <must_contain>
          <item>confirmation the catalog reuses getParty/useParty (not agent.list) + renders uncapped</item>
          <item>the `'catalog'` AppMode id + confirmation NOT added to the rail + party 6-cap unchanged</item>
          <item>the persistent populated-home CTA + its Tier-2 assertion (cite human-ratified 2026-07-10 ORC-witnessed)</item>
          <item>data-driven count confirmation (no hardcoded 13)</item>
          <item>lint ×3 + build + Playwright RUN summary</item>
        </must_contain>
        <must_not_contain>
          <item>a new BE procedure/schema or agent.list catalog data path</item>
          <item>imports of deleted browse code</item>
          <item>a RAIL_ITEMS edit or a handleViewRoster re-point</item>
          <item>new design tokens</item>
        </must_not_contain>
        <success_signal>catalog mode+page live rendering the full roster from getParty, persistent CTA routes from populated home, Tier-2 spec green, party home 6-cap unchanged, lint ×3 clean, build passing</success_signal>
      </output_expected>
    </task_packet>

    <task_packet>
      <task_id>prog-studio-v2-2026-07-s4-retirement-FE-4</task_id>
      <assigned_to>frontend-engineer</assigned_to>
      <priority>HIGH</priority>
      <description>
ABSORB-SURFACE DELETION (Wave 3) — BROWSE + GRAPH + EDIT, plus the ratified EMPTY-state CTA re-point. HARD ORDER (absorption-before-cut): proceed ONLY because s3's absorption proof is green — CITE `prog-studio-v2-2026-07-s3-drilldowns.spec.ts` (green 8/8 today) before deleting. Steps:
1. Delete `pages/BrowsePage.tsx`, `pages/GraphPage.tsx`, `pages/EditPage.tsx`.
2. Delete `hooks/useBrowseData.ts` (Browse-only). Delete stores `store/browse-store.ts` + `store/edit-store.ts` after grepping importers — CONFIRM `components/detail/ReviseSpecAction.tsx` + `AgentDetailPage.tsx` do NOT import edit-store. Investigate `store/analyzeStore.ts`: grep importers (INCLUDING the new catalog page + party home); delete only if its sole importers are Browse/Graph (being deleted); if any retained surface imports it, RETAIN + note. The grep decides.
3. AppMode↔PAGE_MAP: remove `'browse'`, `'edit'`, `'graph'` from the AppMode union (`store/ui-store.ts`); remove the browse/edit/graph PAGE_MAP entries + the `GraphPage` lazy import in `components/ModeContent.tsx`.
4. RATIFIED EMPTY-STATE CTA RE-POINT (s3 inheritance a + ratification #2). Removing `'browse'` makes `PartyPage.tsx` ~L209 `setActiveMode('browse')` a compile error (TODO(s4-cut) marker). Work from CURRENT HEAD (PartyPage/AgentDetailPage amended 2026-07-10, commit 6aa859c — line numbers shifted; FE-1 also edited PartyPage to remove the rail mount, and FE-CAT added the persistent CTA — read HEAD). Re-point the empty-state `handleViewRoster` to `'catalog'` (the ratified true destination, surface built by FE-CAT). Do NOT remove it; do NOT invent a different destination. The persistent populated-home CTA is already delivered by FE-CAT — do NOT duplicate it.
5. Delete Browse/Graph/Edit-only components after importer scan (RelationshipPanel + `components/detail/*` are KEEP — retained).
6. e2e: delete surface specs WITH the surface: `gander-studio-p1-browse-fe.spec.ts`, `gander-studio-p1-edit-fe.spec.ts`, `graph-page.spec.ts`. UPDATE (don't delete) any inherited assertion that the party "View Full Roster" CTA navigates to `'browse'` — this wave legitimately falsifies it (INTERIM(s4-cut) by definition). Update it to the `'catalog'` destination. Cross-check the t5 list. RUN `npx playwright test`; attach summary.
7. VERIFY s3 absorption spec + s2 party specs + FE-CAT catalog spec stay GREEN.
      </description>
      <success_criteria>
- BrowsePage, GraphPage, EditPage, useBrowseData, browse-store, edit-store deleted; analyzeStore deleted-or-retained per its importer scan (state which); `grep -rn "BrowsePage\|GraphPage\|EditPage\|useBrowseData\|browse-store\|edit-store" packages/client/src` empty.
- `'browse'`/`'edit'`/`'graph'` removed from AppMode union; no browse/edit/graph PAGE_MAP entries; no `trpc.connectivity.getGraph` in client src.
- PartyPage compiles; empty-state `handleViewRoster` re-points to `'catalog'`; `grep -rn "'browse'\|\"browse\"" packages/client/src` empty.
- s3 absorption e2e cited green + STILL green; s2 party specs + FE-CAT catalog spec green.
- Browse/Graph/Edit surface specs deleted; the CTA-navigation assertion updated to `'catalog'`.
- `npm run lint` (tsc ×3) clean; client build passing; Playwright RUN shows no NEW failure vs the t5 list.
      </success_criteria>
      <context_files>
packages/client/src/pages/BrowsePage.tsx
packages/client/src/pages/GraphPage.tsx
packages/client/src/pages/EditPage.tsx
packages/client/src/hooks/useBrowseData.ts
packages/client/src/store/browse-store.ts
packages/client/src/store/edit-store.ts
packages/client/src/store/analyzeStore.ts
packages/client/src/store/ui-store.ts
packages/client/src/components/ModeContent.tsx
packages/client/src/pages/PartyPage.tsx
packages/client/src/components/detail/ReviseSpecAction.tsx
packages/client/src/components/detail/RelationshipPanel.tsx
packages/client/tests/e2e/gander-studio-p1-browse-fe.spec.ts
packages/client/tests/e2e/gander-studio-p1-edit-fe.spec.ts
packages/client/tests/e2e/graph-page.spec.ts
packages/client/tests/e2e/prog-studio-v2-2026-07-s3-drilldowns.spec.ts
packages/client/tests/e2e/prog-studio-v2-2026-07-s2-party-shell.spec.ts
.claude/tasks/outputs/prog-studio-v2-2026-07-s3-drilldowns-t5-FE-1783490746.md
DESIGN.md
      </context_files>
      <dependencies>prog-studio-v2-2026-07-s4-retirement-FE-CAT</dependencies>
      <out_of_scope>
- Do NOT delete/refactor `components/detail/*` KEEP components (ReviseSpecAction, RelationshipPanel, AgentDetail panels).
- Do NOT build/modify the catalog surface or the persistent CTA (FE-CAT owns them) — only re-point the EMPTY-state CTA to `'catalog'`.
- Do NOT touch AgentDetailPage's statbox grid (commit 6aa859c) or the nav shell (FE-1).
- Do NOT retire ROSTER_AGENT_NAME_BY_CODE / touch AgentDetailSchema (DEFERRED-V2S3-1 — human-approved deferral 2026-07-10).
- Do NOT touch FF7 tokens or server code.
      </out_of_scope>
      <estimated_new_lines>0-8 net-new (deletion wave; the empty-state re-point is a one-line mode change)</estimated_new_lines>
      <output_expected>
        <tag>ui_packet</tag>
        <must_contain>
          <item>citation of s3 absorption spec green (absorption-before-cut)</item>
          <item>analyzeStore delete-or-retain decision with importer-scan evidence (incl. catalog/party checked)</item>
          <item>the empty-state handleViewRoster re-point to `'catalog'` + PartyPage compiles</item>
          <item>the CTA-navigation e2e assertion update (browse → catalog)</item>
          <item>lint ×3 + build + Playwright RUN (s3/s2/catalog specs green, t5-baseline cross-check)</item>
        </must_contain>
        <must_not_contain>
          <item>deletion of any components/detail/* KEEP component</item>
          <item>modification of the catalog surface or the persistent CTA</item>
          <item>AgentDetailSchema / ROSTER_AGENT_NAME_BY_CODE edits</item>
          <item>CTA removal or a non-catalog destination</item>
        </must_not_contain>
        <success_signal>lint ×3 clean, build passing, browse/graph/edit greps empty, empty-state CTA lands on catalog, s3+s2+catalog specs green</success_signal>
      </output_expected>
    </task_packet>

    <task_packet>
      <task_id>prog-studio-v2-2026-07-s4-retirement-BE-1</task_id>
      <assigned_to>backend-engineer</assigned_to>
      <priority>HIGH</priority>
      <description>
SERVER-PROCEDURE RETIREMENT (per the PM decision above; Critic-gated). Remove the tRPC procedures whose CUT/absorbed client surfaces are deleted, plus their EXCLUSIVELY-used schemas/parsers/helpers. Runs AFTER all FE waves so no client `trpc.*` reference to a removed procedure survives to break the AppRouter type.
1. PRE-REMOVAL SCAN (SC-gating). For each removal candidate — `export.spawn`, `loadout.list/save/delete`, `planning.list`, `connectivity.getGraph` — grep every importer of its procedure, input/output Zod schema, parser, helper (`sanitizeName`, `parsePlanningBacklog`, `ExportInputSchema`, `LoadoutSchema`, `ConnectivityGraphSchema`). Build a retain-set: anything imported by a RETAINED procedure stays. CRITICAL (Critic-verified): `parsers/agent-detail.ts` (assembleAgentDetail, backing `roster.getAgentDetail`) imports `ConnectivityGraphSchema` at line 16 (used line 44) — the SCHEMA MUST STAY. Remove only the `connectivity.getGraph` procedure (+ the separate connectivity *parser* file, if any, and only if unused by agent-detail). `parseAllAgents/Skills/Hooks` are imported by `agent.get`/`skill.get`/roster — RETAIN.
2. In `router.ts`: remove `export.spawn` + `exportRouter`; `loadoutRouter`; `planning.list` + `planningRouter`; `connectivity.getGraph` + `connectivityRouter` (only if scan confirms no retained importer of the PROCEDURE). Remove from `appRouter` + drop now-unused top-level imports. RETAIN `ConnectivityGraphSchema` in schemas.ts (agent-detail dependency).
3. In `packages/shared/src/schemas.ts`: remove schemas EXCLUSIVELY used by removed procedures (LoadoutSchema, PlanningListInput/OutputSchema, ExportInputSchema). DO NOT remove `ConnectivityGraphSchema` (retained importer = assembleAgentDetail).
4. Delete `parsers/planning-parser.ts` + its `__tests__`. For `parsers/connectivity*`: retain if agent-detail imports it, else delete with tests.
5. RETAIN: `agent.list/get/save`, `skill.list/get/save`, `hook.list`, all `session.*`, `progression.getLedger`, `program.getDag`, `roster.getParty/getAgentDetail`, env.ts. NOTE: `agent.list/skill.list/hook.list` are RETAINED as low-churn thin wrappers over retained parsers — they are NOT consumed by FE-CAT (which uses getParty); this is a declutter-vs-churn call flagged for the Critic, resolved toward RETAIN. Do not remove them.
6. Run server vitest (`vitest run src/parsers/__tests__`) + tsc ×3 lint; both green.
      </description>
      <success_criteria>
- Pre-removal scan documented per removal target (importers → retain-set).
- `export.spawn`, `loadout.*`, `planning.list`, `connectivity.getGraph` removed from `router.ts` + `appRouter`.
- `ConnectivityGraphSchema` RETAINED (assembleAgentDetail importer verified); exclusively-used schemas/parsers/helpers removed; NO schema/parser imported by a retained procedure removed (lint catches dangling imports).
- RETAINED intact: `agent.*`, `skill.*`, `hook.list`, `session.*`, `progression.getLedger`, `program.getDag`, `roster.*`; ReviseSpecAction's `agent.get/save`+`skill.get/save` resolve; roster.getAgentDetail (uses ConnectivityGraphSchema) resolves.
- `npm run lint` (tsc ×3) clean; server vitest green; client build passing.
- env.ts unchanged.
      </success_criteria>
      <context_files>
packages/server/src/router.ts
packages/shared/src/schemas.ts
packages/server/src/parsers/planning-parser.ts
packages/server/src/parsers/agent-detail.ts
packages/server/src/env.ts
      </context_files>
      <dependencies>prog-studio-v2-2026-07-s4-retirement-FE-2, prog-studio-v2-2026-07-s4-retirement-FE-3, prog-studio-v2-2026-07-s4-retirement-FE-CAT, prog-studio-v2-2026-07-s4-retirement-FE-4</dependencies>
      <out_of_scope>
- Do NOT remove `ConnectivityGraphSchema` (assembleAgentDetail dependency — Critic-verified).
- Do NOT remove `agent.list/skill.list/hook.list` (retained; flag disagreement to Critic, do not remove unilaterally).
- Do NOT remove/edit env vars (LOADOUTS_DIR backs SESSIONS_EDITS_DIR default).
- Do NOT touch `parseAllAgents/Skills/Hooks`, roster/session/progression/program routers/parsers.
- Do NOT git commit (return a completion_packet; ORC commits post-audit).
      </out_of_scope>
      <output_expected>
        <tag>completion_packet</tag>
        <must_contain>
          <item>pre-removal scan table (target → importers → retain-set)</item>
          <item>explicit confirmation ConnectivityGraphSchema retained (agent-detail importer) while connectivity.getGraph procedure removed</item>
          <item>final retained-procedure list (for DOCS-1)</item>
          <item>lint ×3 + server vitest + client build results</item>
        </must_contain>
        <must_not_contain>
          <item>removal of ConnectivityGraphSchema or any schema/parser imported by a retained procedure</item>
          <item>removal of agent.list/skill.list/hook.list</item>
          <item>env-var edits or an inline git commit</item>
        </must_not_contain>
        <success_signal>lint ×3 clean, server vitest green, client build passing, ConnectivityGraphSchema retained, removed-procedure greps consistent with decision</success_signal>
      </output_expected>
    </task_packet>

    <task_packet>
      <task_id>prog-studio-v2-2026-07-s4-retirement-DOCS-1</task_id>
      <assigned_to>frontend-engineer</assigned_to>
      <priority>NORMAL</priority>
      <description>
DOCS TO v2 REALITY. Update the two project docs to the post-retirement state. Runs LAST. Single owner of both files + the deferred-work ledger.
1. `CLAUDE.md` (repo root):
   - **Surfaces table** — remove Browse/Compose/Edit/Export/Graph/Planning rows; retain Sessions/Progression/Programs; ADD Party (`party`, default, PartyPage), Agent Detail (`agent-detail`, AgentDetailPage), Roster Catalog (`catalog`, RosterCatalogPage — the 13-role catalog reached via the persistent party-home "View Full Roster" CTA). Verify each against PAGE_MAP in `components/ModeContent.tsx` at HEAD.
   - **Navigation line** — replace "BottomTabBar (role=tablist, 9 tabs…)" with the v2 reality: global SubmenuRail (Roster→party / Sessions / Progression / Programs) as the persistent desktop/tablet left rail, folding into a bottom-bar on <640px (per v2-design-spec responsive); agent-detail via party card; the catalog via the persistent party-home CTA. Confirm against `AppShell.tsx` + `constants/navigation.ts` RAIL_ITEMS + PartyPage at HEAD.
   - **tRPC procedures table + "22 procedures across 10 routers" heading** — rewrite to the ACTUAL post-BE-1 set. DERIVE the count + router list by grepping `t.procedure` + sub-routers in `packages/server/src/router.ts` at HEAD (do NOT hardcode from this brief). Remove deprecated rows (loadout.*, export.spawn, connectivity.getGraph, planning.list) consistent with BE-1's completion_packet; note connectivity.getGraph removed while ConnectivityGraphSchema retained.
   - **Architecture tree** — fix `pages/` (remove deleted; add PartyPage/AgentDetailPage/RosterCatalogPage/sessions/), `store/` (remove compose/canvas/browse/edit[/analyze if deleted]; correct the STALE "session-picker" name to the actual store files), `parsers/` (remove planning[/connectivity if deleted]).
   - **Known Issues bundle line** — the "~700KB" baseline is STALE (DEFERRED-V2S2-2). Re-measure from the FE-4/FE-CAT client build output; state the source.
   - **Env table** — note EXPORT_BASE_DIR now unused/deprecated; keep LOADOUTS_DIR (backs SESSIONS_EDITS_DIR default).
2. `DESIGN.md` (repo root): append a Decision Record for the v2 IA — 9→6 surface consolidation (party, agent-detail, roster-catalog, sessions, progression, programs), the 9-tab v1 nav retirement, the hoisted global SubmenuRail + its <640px bottom-bar fold, the 6-agent homescreen + persistent "View Full Roster" catalog CTA. No new visual tokens (`design_system_source: DESIGN_MD`); structural/IA record only.
3. `docs/deferred-work.md` — append the 4 human-approved deferrals (Deferrals block below) with the 2026-07-10 authorization citation. DOCS-1 is the sole writer of this file this sprint (append-serialized).
      </description>
      <success_criteria>
- CLAUDE.md surfaces table lists exactly the v2 surfaces (Party, Agent Detail, Roster Catalog, Sessions, Progression, Programs) — no cut/absorbed surface rows.
- Navigation description reflects the global SubmenuRail + <640px bottom-bar fold + catalog-via-persistent-CTA (no "9 tabs" as live nav).
- tRPC procedure table matches `router.ts` at HEAD; no export.spawn/loadout./connectivity.getGraph/planning.list rows; roster.* present; ConnectivityGraphSchema-retained note present; counts derived from the file.
- Architecture tree store/page/parser lists match disk (RosterCatalogPage added; "session-picker" corrected).
- Bundle baseline updated with a stated source; EXPORT_BASE_DIR noted deprecated-unused.
- DESIGN.md carries a v2-IA decision record; no new token entries.
- `docs/deferred-work.md` has the 4 human-approved deferrals with the 2026-07-10 authorization line.
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
      <dependencies>prog-studio-v2-2026-07-s4-retirement-FE-1, prog-studio-v2-2026-07-s4-retirement-FE-2, prog-studio-v2-2026-07-s4-retirement-FE-3, prog-studio-v2-2026-07-s4-retirement-FE-CAT, prog-studio-v2-2026-07-s4-retirement-FE-4, prog-studio-v2-2026-07-s4-retirement-BE-1</dependencies>
      <out_of_scope>
- Do NOT edit code — docs only.
- Do NOT add new FF7/design tokens to DESIGN.md.
- Do NOT hardcode a procedure count — derive from router.ts at HEAD.
- Do NOT document deferred items (rail collapse, 390px overflow, ROSTER_AGENT_NAME_BY_CODE, --mg row) as done — record them as human-approved deferrals.
      </out_of_scope>
      <output_expected>
        <tag>completion_packet</tag>
        <must_contain>
          <item>updated surfaces table + navigation description (incl. mobile fold) + procedure table</item>
          <item>the source of the new bundle-size number</item>
          <item>the DESIGN.md v2-IA decision record text</item>
          <item>the 4 deferred-work.md entries with the 2026-07-10 authorization citation</item>
        </must_contain>
        <must_not_contain>
          <item>any code edit</item>
          <item>new design/FF7 tokens</item>
          <item>a hardcoded procedure count not derived from router.ts</item>
        </must_not_contain>
        <success_signal>CLAUDE.md + DESIGN.md reflect disk reality (incl. catalog surface + hoisted rail + mobile fold); procedure table matches router.ts; deferrals recorded with authorization</success_signal>
      </output_expected>
    </task_packet>

  </task_packets>

  <dependency_order>
    FE-1 (nav-shell re-architecture: hoist rail global + responsive mobile fold + retire 9-tab v1 nav) → FE-2 (Compose) → FE-3 (Export+Planning) → FE-CAT (13-role catalog surface + persistent party-home CTA — ADDITIVE, adds `'catalog'` mode) → FE-4 (Browse+Graph+Edit deletion + empty-state CTA re-point to catalog) → BE-1 (server procedure removal) → DOCS-1 (docs + deferred-work)
    All packets SERIAL. Rationale: FE-2/FE-3/FE-CAT/FE-4 all mutate shared ui-store.ts (AppMode union) + ModeContent.tsx (PAGE_MAP) — FE-CAT ADDS `'catalog'`, FE-4 REMOVES browse/edit/graph + re-points the empty-state CTA. FE-CAT MUST precede FE-4 so `'catalog'` exists before the re-point (else compile error). PartyPage.tsx is touched serially by FE-1 (remove page-local rail mount), FE-CAT (add persistent CTA), FE-4 (empty-state re-point) — the serial chain preserves this. FE-1 is FIRST and re-architects the shell (hoist rail global BEFORE retiring the 9-tab bar — never a zero-nav window). BE-1 follows all FE waves. DOCS-1 last. lint ×3 + client build green (and Playwright RUN, not spec-reading) is a per-packet SC.
  </dependency_order>

  <routing_notes>
    ## Critique-block resolution acknowledgements (CR `...-CR-1783711002.md`)
    - **BLOCKER (FE-1 false SubmenuRail-mount premise) — FIXED.** Disk-re-verified: AppShell renders no rail; `.app-shell` grid is `"hd" "mn"`; SubmenuRail is page-local in PartyPage (`hidden lg:flex`), and PartyPage:26-29 records the "s4 lifts it" hoist obligation. FE-1 rewritten to HOIST the rail into AppShell + re-template the grid + remove the page-local mount + resolve mobile nav, THEN retire the 9-tab v1 nav (hoist-first ordering, never zero-nav). FE-1 context_files now include globals.css, PartyPage.tsx, v2-design-spec.md. FE-1 SC now asserts rail reachability from a NON-party surface (Critic's exact requirement) at desktop AND <640px.
    - **Mobile-nav story — SPEC-GROUNDED (not invented).** v2-design-spec.md `<responsive>` (lines 85-88) + Mobile paragraph (70-74) DEFINE it: rail persistent at md/lg; at <640px the 4 rail destinations fold into a bottom-bar reusing the existing bottom-tab pattern ("no new nav mechanism"). FE-1 follows this VERBATIM. FLAG FOR CRITIC RE-GATE: "remove the 9-tab BottomTabBar" is realized as retiring the 9-TAB v1 configuration (NAV_ITEMS); the spec-ratified mobile fold is a 4-item bottom-bar (the rail's mobile form) — the 9-tab clutter is gone and mobile users retain nav (a functional necessity, distinct from the deferred collapse/expand polish). FE-1 has latitude to repurpose BottomTabBar.tsx for the fold or give the rail a responsive bottom-bar form; the SC checks the OUTCOME (9-tab config gone + nav reachable at all widths), not the file's existence.
    - **WARNING 1 (FE-1 estimate) — RE-ESTIMATED** to ~45-65 net-new (nav re-architecture) with a BLOCK-to-split contingency (FE-1a hoist → FE-1b 9-tab retire + fold) if it breaches ~50 lines, hoist-first so nav is never zero.
    - **WARNING 2 (t5 baseline wiring) — FIXED.** `.claude/tasks/outputs/prog-studio-v2-2026-07-s3-drilldowns-t5-FE-1783490746.md` (Glob-confirmed on disk) is now in the context_files of FE-1, FE-2, FE-3, FE-CAT, FE-4 — not relegated to an ORC risk_flag. Every FE e2e SC also now requires asserting status by RUNNING `npx playwright test` (not reading spec files) with the run summary attached (closes the Critic's "no real green/red evidence" landmine).
    - **WARNING 3 (SCOPE_DRIFT — catalog reachable only from empty state) — RESOLVED by human ratification 2026-07-10 (ORC-witnessed):** a PERSISTENT "View Full Roster" CTA on the POPULATED party home → `'catalog'` (folded into FE-CAT with a Tier-2 assertion); rail stays 4 items, catalog not in the rail. FE-4 handles the empty-state re-point.
    - **FE-CAT data source CORRECTED to getParty (Critic forecast):** reuse `useParty`/getParty (returns full roster; homescreen caps at 6) rendered uncapped = the 13-role catalog, no new BE proc; agent.list dropped (under-count risk). Consequence: `agent.list` is no longer a FE-CAT consumer — BE-1's retain rationale corrected to "low-churn thin wrapper," flagged for the Critic.
    - **Ratified & unchanged:** `'catalog'` AppMode (proceed, no BLOCK); BE-1 ConnectivityGraphSchema protection (assembleAgentDetail imports it, line 16/44 — retained; only the procedure removed).

    ## Recurring-pattern preflight (Step 0.5 — carried, re-affirmed)
    <recurring_pattern source="prog-studio-v2-2026-07-s3-drilldowns.md">plan-time-unverified-inherited-fact (RECURRING, 3rd form). This BLOCK is itself an instance the rev1 corrects: amend-1's FE-1 asserted "AppShell renders SubmenuRail" WITHOUT disk-verifying — the exact class. rev1 re-verified AppShell/globals.css/PartyPage/v2-design-spec on disk before rewriting FE-1; every FE-1 claim now carries a 2026-07-10 disk citation.</recurring_pattern>
    <recurring_pattern source="prog-studio-v2-2026-07-s3-drilldowns.md">primitive-behavioral-default-collision (RECURRING, 2nd behavioral). ACCEPTED-LOW-RISK: the additive catalog + persistent CTA use first-class states + a plain Button; no async-initialFocus dialog. Reference if any focus-managed control appears: FE#8 rem2 function-form initialFocus.</recurring_pattern>
    <recurring_pattern source="prog-studio-v2-2026-07-s3-drilldowns.md">cross-spec-interim-assertion-unmarked (§6 G3). AVOIDED: FE-1 (9-tab/global-nav assertions) + FE-4 (CTA→browse assertion) are authorized to update the assertions they falsify in-packet; s3 absorption + FE-CAT catalog specs stay green.</recurring_pattern>
    <recurring_pattern source="prog-studio-v2-2026-07-s3-drilldowns.md">subagentstop-complete-miss (validator subclass, RECURRING 4th). ORC-side — acknowledge; verify COMPLETE events, backfill inline.</recurring_pattern>
    <recurring_pattern source="prog-studio-v2-2026-07-s3-drilldowns.md">archivist-paraphrase-drift (RECURRING 4th sighting). AR-side — copy identifiers/defects VERBATIM (Glob-confirm).</recurring_pattern>
    <recurring_pattern source="pm_preflight_checklist">OVERSCOPED: deletion-wave-by-surface exemption applied; FE-1 is now a nav re-architecture (net-new) with a documented split contingency; FE-CAT one surface + its ratified CTA.</recurring_pattern>
    <recurring_pattern source="pm_preflight_checklist">DRY: FE-CAT reuses useParty/getParty + party card patterns (not a new endpoint or resurrected browse code); FE-1 reuses the existing bottom-tab pattern for the mobile fold ("no new nav mechanism", spec-mandated) and the existing content-container width (no new breakpoint).</recurring_pattern>

    ## Shared-file serialization
    shared-mutation order: {ui-store.ts[union]: [FE-2, FE-3, FE-CAT(add), FE-4(remove)], ModeContent.tsx[PAGE_MAP]: [FE-2, FE-3, FE-CAT(add), FE-4(remove)], navigation.ts[NAV_ITEMS]: [FE-1], PartyPage.tsx: [FE-1(remove rail mount), FE-CAT(add persistent CTA), FE-4(empty-state re-point)], globals.css[.app-shell grid]: [FE-1], AppShell.tsx: [FE-1], docs/deferred-work.md: [DOCS-1 sole writer]}. Enforced by the strictly-serial dependency_order; each wave re-reads shared files fresh from HEAD.

    ## prior_approved_tasks (sequential single-file context for the auditor)
    ui-store.ts, ModeContent.tsx, navigation.ts, PartyPage.tsx are touched by multiple s4 waves and were last authored by s2/s3 (party AppMode, agent-detail mode, lazy PAGE_MAP imports, RAIL_ITEMS Roster→party, aria-current-at-home, statbox grid commit 6aa859c, the page-local rail mount + plan-R-3 comment). Treat prior-wave/prior-sprint committed additions (incl. FE-1's hoist, FE-CAT's `'catalog'` mode + persistent CTA when auditing FE-4) as ALREADY-APPROVED, not out-of-scope modifications.

    ## DESIGN.md status
    PRESENT at repo root. In FE-1 (rail hoist/grid), FE-CAT (catalog + CTA), FE-4 + updated by DOCS-1. No new visual tokens (rail surface reuses `--sf`; catalog reuses FF7 tokens) — design_system_source: DESIGN_MD.

    ## Critic re-gate focus / final gate
    Re-gate probes: (1) FE-1 hoist + spec-verbatim mobile fold + the "9-tab retired vs mobile-bottom-bar-ratified" reconciliation; (2) FE-1 nav-reachability-from-non-party SC + Playwright-RUN evidence; (3) FE-CAT persistent-CTA + getParty data source; (4) BE-1 ConnectivityGraphSchema retention; (5) compiler-exhaustive AppMode↔PAGE_MAP per wave (FE-CAT add before FE-4 remove). Step 4.5 human browser walkthrough is the program's final pre-skein gate (ORC/human-owned; must exercise BOTH desktop rail AND <640px fold). Push human-owned (guarded model).

    ## sc-precheck
    No Bash in the PM toolset — manual self-lint per Steps 7.5/7.8 written to `sc-precheck-report.json` (this dir), now covering the FE-1 hoist SC (outcome-based nav-reachability, not "grep BottomTabBar empty"), FE-CAT getParty/persistent-CTA SCs, and the Playwright-RUN requirement. Verdict PASS; no locked-value SCs. Recommend ORC/Critic run the mechanical script as backstop.
  </routing_notes>

  <risk_flags>
    - **"Remove the 9-tab BottomTabBar" vs the spec's mobile bottom-bar fold — RECONCILE AT RE-GATE:** the human wants the 9-tab v1 bar gone; v2-design-spec ratifies a <640px bottom-bar carrying the 4 rail destinations. rev1 realizes both (9-tab config removed; mobile fold is the rail's spec-ratified mobile form). Flagged for the Critic to confirm this is faithful, not a partial deletion.
    - **FE-1 is the highest-risk packet (nav re-architecture, ~45-65 net-new, CSS-grid + responsive):** BLOCK-to-split contingency documented; hoist-first ordering is mandatory (never a zero-nav window). If the Critic prefers the split up front, FE-1a/FE-1b is pre-authorized.
    - **analyzeStore.ts ownership unknown:** FE-4 grep-gated to delete-or-retain, now also checking the new catalog + party home as possible importers.
    - **FE-CAT ↔ FE-4 ordering load-bearing:** `'catalog'` must exist (FE-CAT) before FE-4 re-points to it.
    - **AgentDetailPage/PartyPage HEAD drift:** commit 6aa859c + FE-1's rail-mount removal + FE-CAT's persistent CTA all mutate PartyPage before FE-4 — FE-4 works from CURRENT HEAD, not any prior line numbers.
    - **e2e evidence must be a real Playwright RUN**, not spec-file reading (Critic landmine) — enforced in every FE SC; ORC hands each wave the t5 57-failure list (now in context_files).
    - **KEEP specs outlive their sprints:** s3 absorption + s2 party + FE-CAT catalog specs stay green; FE-1/FE-4 update (never weaken) the assertions they legitimately falsify.
    - **Base-plan portability:** all packets plain file edits; no Workflow-tool dependency.
  </risk_flags>

  <human_approved_deferrals date="2026-07-10" authorization="human-ratified this session (ORC-witnessed) — REQVAL maps as deferred-with-authorization, NOT missing">
    <deferral id="rail-collapse-expand" target="docs/deferred-work.md">SubmenuRail collapse/expand (240px↔56px desktop animation, DESIGN.md Component Rule / spec interaction line 283) — a rail polish interaction; the rail ships at fixed 240px open. DISTINCT from the <640px mobile bottom-bar fold, which IS delivered (FE-1, functional necessity, spec-ratified).</deferral>
    <deferral id="DEFERRED-V2S2-1-390px-header" target="docs/deferred-work.md">390px header overflow (DEFERRED-V2S2-1) — pre-existing responsive bug; not a surface retirement. Separate responsive pass.</deferral>
    <deferral id="DEFERRED-V2S3-1-roster-name-map" target="docs/deferred-work.md">Retire ROSTER_AGENT_NAME_BY_CODE via AgentDetailSchema extension (add agentName/specFile; unmapped codes degrade to honest no-revise fallback) — additive BE schema extension + FE refactor; recommend a dedicated follow-up sprint.</deferral>
    <deferral id="DEFERRED-V2S3-2-mg-contrast" target="docs/deferred-work.md">--mg-on---sfh contrast_pairs row (DEFERRED-V2S3-2) — conditional ("if ever used as text"); next-design-pass item.</deferral>
  </human_approved_deferrals>
</task_decomposition>

---

## Verbatim Deliverable Audit (Step 7 — updated for rev1)

<verbatim_deliverable_audit>
  <phrase text="kick off s4"><addressed task="all — rev1 decomposition produced"/></phrase>
  <phrase text="retire the CUT surfaces (Compose, Export, Planning)"><addressed task="FE-2 (Compose), FE-3 (Export+Planning), BE-1 (their server procedures)"/></phrase>
  <phrase text="remove the absorbed v1 surfaces (Browse, Graph, Edit)"><addressed task="FE-4"/></phrase>
  <phrase text="now that s3's drill-downs carry their value"><addressed task="FE-4 (cites s3 absorption e2e green; absorption-before-cut hard order)"/></phrase>
  <phrase text="remove the 9-tab BottomTabBar"><addressed task="FE-1 (retires the 9-tab v1 NAV_ITEMS config; hoists SubmenuRail as global nav; <640px fold is the rail's spec-ratified mobile form — flagged for Critic reconciliation)"/></phrase>
  <phrase text="in favor of the v2 rail"><addressed task="FE-1 (SubmenuRail hoisted global: persistent left rail desktop/tablet + bottom-bar fold <640px)"/></phrase>
  <phrase text="prune dead stores/components/routes"><addressed task="FE-1, FE-2, FE-3, FE-4 (client), BE-1 (server)"/></phrase>
  <phrase text="update project docs (CLAUDE.md surfaces + tRPC tables, DESIGN.md) to v2 reality"><addressed task="DOCS-1"/></phrase>
  <phrase text="s3 inheritance (a) View-Full-Roster CTA re-point"><addressed task="FE-4 (empty-state re-point to catalog) + FE-CAT (persistent populated-home CTA to catalog) — human-ratified 2026-07-10"/></phrase>
  <phrase text="s3 inheritance (b) Roster rail collapse/expand"><deferred reason="human-approved 2026-07-10; rail polish (fixed 240px ships), distinct from the delivered mobile fold, → docs/deferred-work.md (DOCS-1)"/></phrase>
  <phrase text="s3 inheritance (c) 390px header overflow"><deferred reason="human-approved 2026-07-10; DEFERRED-V2S2-1 pre-existing responsive bug, → docs/deferred-work.md (DOCS-1)"/></phrase>
  <phrase text="s3 inheritance (d) stale CLAUDE.md bundle baseline"><addressed task="DOCS-1"/></phrase>
  <phrase text="s3 inheritance (e) 13-role catalog entry"><addressed task="FE-CAT (catalog surface + persistent populated-home entry CTA) + FE-4 (empty-state entry); ratification #1 honored"/></phrase>
  <phrase text="DEFERRED-V2S3-1 (retire ROSTER_AGENT_NAME_BY_CODE via schema extension)"><deferred reason="human-approved 2026-07-10; additive schema extension, → docs/deferred-work.md (DOCS-1)"/></phrase>
  <phrase text="DEFERRED-V2S3-2 (--mg on --sfh contrast_pairs row)"><deferred reason="human-approved 2026-07-10; conditional design-pass item, → docs/deferred-work.md (DOCS-1)"/></phrase>
  <phrase text="export/loadout server procedures — retained vs deprecated (PM decides, Critic gate)"><addressed task="BE-1 (deprecate-by-removal; ConnectivityGraphSchema retained per agent-detail; agent.list retained as low-churn)"/></phrase>
  <phrase text="mobile/sub-lg nav (functional necessity surfaced at re-gate)"><addressed task="FE-1 (<640px bottom-bar fold per v2-design-spec responsive lines 85-88/70-74; no zero-nav state)"/></phrase>
</verbatim_deliverable_audit>

---

## Expectation Manifest (updated)

<expectation_manifest>
  <sprint_id>prog-studio-v2-2026-07-s4-retirement</sprint_id>
  <generated>2026-07-10 (rev1)</generated>
  <assignments>
    <assignment>
      <task_id>prog-studio-v2-2026-07-s4-retirement-FE-1</task_id>
      <agent>FE#1</agent>
      <expected_tag>ui_packet</expected_tag>
      <expected_file>.claude/tasks/outputs/prog-studio-v2-2026-07-s4-retirement-FE-1-{ts}.md</expected_file>
      <blocks>FE-2, FE-3, FE-CAT, FE-4, DOCS-1</blocks>
      <receipt_check>
        <item>SubmenuRail hoisted global (AppShell) + page-local mount removed + grid re-templated</item>
        <item>mobile fold implemented per v2-design-spec (cite lines); no zero-nav state; rail reachable from a NON-party surface at desktop AND <640px</item>
        <item>NAV_ITEMS removed; rail fixed 240px (collapse deferred)</item>
        <item>net-new line count + split-contingency status; lint ×3 + build + Playwright RUN summary</item>
      </receipt_check>
    </assignment>
    <assignment>
      <task_id>prog-studio-v2-2026-07-s4-retirement-FE-2</task_id>
      <agent>FE#2</agent>
      <expected_tag>ui_packet</expected_tag>
      <expected_file>.claude/tasks/outputs/prog-studio-v2-2026-07-s4-retirement-FE-2-{ts}.md</expected_file>
      <blocks>FE-3, FE-CAT, FE-4, BE-1, DOCS-1</blocks>
      <receipt_check>
        <item>deletion list + importer-scan; 'compose' removed from union/PAGE_MAP; no trpc.loadout ref</item>
        <item>lint ×3 + build + Playwright RUN; KEEP specs green</item>
      </receipt_check>
    </assignment>
    <assignment>
      <task_id>prog-studio-v2-2026-07-s4-retirement-FE-3</task_id>
      <agent>FE#3</agent>
      <expected_tag>ui_packet</expected_tag>
      <expected_file>.claude/tasks/outputs/prog-studio-v2-2026-07-s4-retirement-FE-3-{ts}.md</expected_file>
      <blocks>FE-CAT, FE-4, BE-1, DOCS-1</blocks>
      <receipt_check>
        <item>ExportPage+PlanningPage deleted; 'export'/'planning' removed; session-edit-save spec NOT touched</item>
        <item>no trpc.export.spawn/planning.list; lint ×3 + build + Playwright RUN; KEEP specs green</item>
      </receipt_check>
    </assignment>
    <assignment>
      <task_id>prog-studio-v2-2026-07-s4-retirement-FE-CAT</task_id>
      <agent>FE#4</agent>
      <expected_tag>ui_packet</expected_tag>
      <expected_file>.claude/tasks/outputs/prog-studio-v2-2026-07-s4-retirement-FE-CAT-{ts}.md</expected_file>
      <blocks>FE-4 (empty-state re-point target), DOCS-1</blocks>
      <receipt_check>
        <item>catalog reuses getParty/useParty (not agent.list), renders uncapped; no new BE proc</item>
        <item>'catalog' AppMode + NOT in rail + party 6-cap unchanged</item>
        <item>persistent populated-home "View Full Roster" CTA → catalog + Tier-2 assertion (cite human-ratified 2026-07-10 ORC-witnessed)</item>
        <item>data-driven count (no hardcoded 13); catalog Tier-2 spec green; lint ×3 + build + Playwright RUN</item>
      </receipt_check>
    </assignment>
    <assignment>
      <task_id>prog-studio-v2-2026-07-s4-retirement-FE-4</task_id>
      <agent>FE#5</agent>
      <expected_tag>ui_packet</expected_tag>
      <expected_file>.claude/tasks/outputs/prog-studio-v2-2026-07-s4-retirement-FE-4-{ts}.md</expected_file>
      <blocks>BE-1, DOCS-1</blocks>
      <receipt_check>
        <item>s3 absorption spec cited green + still green</item>
        <item>analyzeStore delete-or-retain decision (catalog/party checked)</item>
        <item>empty-state handleViewRoster re-pointed to 'catalog'; PartyPage compiles; no 'browse' literal remains</item>
        <item>components/detail/* + catalog + persistent CTA untouched; no AgentDetailSchema edit</item>
        <item>CTA e2e assertion updated browse→catalog; lint ×3 + build + Playwright RUN (s3/s2/catalog green)</item>
      </receipt_check>
    </assignment>
    <assignment>
      <task_id>prog-studio-v2-2026-07-s4-retirement-BE-1</task_id>
      <agent>BE#1</agent>
      <expected_tag>completion_packet</expected_tag>
      <expected_file>.claude/tasks/outputs/prog-studio-v2-2026-07-s4-retirement-BE-1-{ts}.md</expected_file>
      <blocks>DOCS-1</blocks>
      <receipt_check>
        <item>pre-removal scan table (target → importers → retain-set)</item>
        <item>ConnectivityGraphSchema RETAINED (agent-detail importer) while connectivity.getGraph procedure removed</item>
        <item>final retained-procedure list; agent.list/skill.list/hook.list retained</item>
        <item>ReviseSpecAction agent.get/save + skill.get/save + roster.getAgentDetail resolve</item>
        <item>env.ts unchanged; lint ×3 + server vitest + client build green; no inline commit</item>
      </receipt_check>
    </assignment>
    <assignment>
      <task_id>prog-studio-v2-2026-07-s4-retirement-DOCS-1</task_id>
      <agent>FE#6</agent>
      <expected_tag>completion_packet</expected_tag>
      <expected_file>.claude/tasks/outputs/prog-studio-v2-2026-07-s4-retirement-DOCS-1-{ts}.md</expected_file>
      <blocks>NONE (terminal; feeds Step 4.5 walkthrough + skein)</blocks>
      <receipt_check>
        <item>surfaces table = 6 v2 surfaces incl. Roster Catalog; nav description = global rail + <640px fold + catalog-via-CTA</item>
        <item>procedure table matches router.ts at HEAD (derived); ConnectivityGraphSchema-retained note; deprecated procs gone</item>
        <item>architecture tree matches disk (RosterCatalogPage added; session-picker corrected); bundle baseline updated w/ source</item>
        <item>DESIGN.md v2-IA decision record; no new tokens; no code edits</item>
        <item>docs/deferred-work.md has the 4 human-approved deferrals with 2026-07-10 authorization</item>
      </receipt_check>
    </assignment>
  </assignments>
</expectation_manifest>

---

## COMPLETE (rev1)
Plan of record: `.claude/tasks/outputs/prog-studio-v2-2026-07-s4-retirement-rev1-PM-1783712130.md` (supersedes amend-1).
Adjacent: `.claude/tasks/outputs/sc-precheck-report.json` (refreshed).
7 task_packets inline (FE-1, FE-2, FE-3, FE-CAT, FE-4, BE-1, DOCS-1) — no-stub self-check PASS (7 `<task_packet>` == 7 declared, agent_count=7). rev1 reads: 5 (critique + AppShell + PartyPage + v2-design-spec responsive + globals.css grid; t5 artifact Glob-confirmed). Every BLOCKER/WARNING addressed.
