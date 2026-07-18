# PM Task Decomposition (REV-2) — prog-studio-v2-2026-07-s4-retirement

Complete plan of record (supersedes rev1 + amend2). Produced in response to the jidoka plan-only REPARTITION (`<jidoka_synthesis>` in docs/task-registry.md:440-477; FEP#1 `...-FEP-1783713420.md`; BEP#1 `...-BEP-1783713420.md`). Six planner-disk-verified enumeration/sequencing fixes applied WITHIN the existing 7-packet structure — no split, no new packets, agent_count unchanged (7). rev1's BLOCKER-fix (rail hoist) + amend2's two tightenings are folded in here so this file is self-contained. Re-runs the Critic gate per rule W1.

Adjacent: `sc-precheck-report.json` (this dir, refreshed). PM log `docs/agent-logs/PM/prog-studio-v2-2026-07-s4-retirement.md`.

---

## Jidoka fixes applied (all planner-disk-verified; PM re-verified the load-bearing ones)

1. **canvas-store.ts FE-2→FE-3 (file_conflict):** ExportPage.tsx imports `useCanvasStore/selectLoadoutPayload` (~15 call sites) and is deleted only in FE-3 — deleting canvas-store in FE-2 makes FE-2's "lint ×3 clean" SC unsatisfiable. Moved to FE-3. **PM re-verified 2026-07-10:** `grep` of ExportPage.tsx confirms it imports canvas-store (line 5) but NOT compose-store (its compose-store references, lines 74-81, are comment-only) — so `compose-store.ts` stays safely in FE-2; only canvas-store moves. (FEP line 677 independently confirms.)
2. **constants/canvas.ts + hooks/useLinkSound.ts → FE-4 (assumption_wrong):** `constants/canvas.ts` ← `hooks/useLinkSound.ts` ← GraphPage/EditPage (+ ExportPage), all alive until FE-4. Neither was enumerated anywhere. Both added to FE-4's deletion enumeration (delete after Graph/Edit removal, on a fresh importer re-scan). Glob-confirmed both exist.
3. **prog-studio-vision-s2-d2-edit-save.spec.ts is CUT, not KEEP (assumption_wrong):** it tests the v1 EditPage's agent.save/skill.save (testid `edit-page`), a CUT surface — reassigned to FE-4's deletion list. The genuine session-save KEEP spec is `s2-d3-session-buffer.spec.ts` (uses `session.saveEdit`). FE-3's caution note corrected.
4. **8 KEEP-surface e2e specs → FE-1 (scope_drift):** they navigate via `role="tab"` at desktop viewport and break once the 9-tab bar hides >640px. All 8 added to FE-1 scope + context_files with an SC that they are green post-hoist (nav-selector migration to rail-button/text locators). Two are partial: render-loop (Progression sub-test = FE-1; Graph sub-test = FE-4) and s2-list-edit-fe (delete 4 obsolete t6b smoke sub-tests; rest KEEP).
5. **packages/shared/src/types.ts → BE-1 (assumption_wrong, HIGH):** it derives `type Loadout = z.infer<typeof LoadoutSchema>`; once schemas.ts's LoadoutSchema is removed this dangling import fails the FIRST of the 3 sequential lint passes (shared). Added to BE-1 enumeration + context_files. Plus BE-1 prunes router.ts's now-dead `ConnectivityGraphSchema`/`type ConnectivityGraph` import-site (dead after connectivityRouter removal) while RETAINING the schemas.ts definition + agent-detail.ts import. Glob-confirmed types.ts exists.
6. **Explicit RETAINs (assumption_wrong — misleading names):** `analyzeStore.ts` RETAIN (3 Sessions importers: sessions AnalyzeTab / SessionPicker / SessionListPage; zero Browse/Graph) and `constants/browse.ts` RETAIN (exports AGENT_MATERIA/DEFAULT_MATERIA consumed by the KEEP `components/sessions/AgentTimeline.tsx`) — both marked RETAIN in FE-4's out_of_scope to prevent name-pattern over-deletion.

**Jidoka positive confirmations (cited as verified — no re-litigation):** 24→18 procedure count EXACT (BEP independent count); all 4 removed-procedure trpc consumers (ComposePage/ExportPage/PlanningPage/GraphPage) deleted by strictly-preceding packets (ordering NO CONFLICT); ConnectivityGraphSchema protection holds (agent-detail.ts:16/44 importer); env.ts zero edits (LOADOUTS_DIR/EXPORT_BASE_DIR orphan neither var nor startup check); planning-parser.test.ts self-contained (self-generates tmp fixtures, no shared __tests__/fixtures). Both planner split_recommendations = NO (repartition = enumeration/sequencing only).

---

## Server-procedure decision (unchanged; Critic-gated + jidoka-confirmed)
DEPRECATE-BY-REMOVAL: REMOVE export.spawn, loadout.*, planning.list, connectivity.getGraph (24→18, BEP-confirmed exact). RETAIN agent.get/save+skill.get/save (ReviseSpecAction), agent.list/skill.list/hook.list (low-churn thin wrappers — NOT a FE-CAT consumer; FE-CAT uses getParty), roster/session/progression/program, env.ts, and ConnectivityGraphSchema (agent-detail dependency).

---

<task_decomposition task_id="prog-studio-v2-2026-07-s4-retirement" agent_count="7">
  <task_packets>

    <task_packet>
      <task_id>prog-studio-v2-2026-07-s4-retirement-FE-1</task_id>
      <assigned_to>frontend-engineer</assigned_to>
      <priority>HIGH</priority>
      <description>
NAV-SHELL RE-ARCHITECTURE (Wave 0) — HOIST the SubmenuRail into the global shell, retire the 9-tab v1 nav, and migrate the KEEP-surface e2e nav selectors. Discharges the "s4 lifts it" obligation (PartyPage.tsx:26-29). HARD ORDERING WITHIN PACKET: hoist the rail global BEFORE removing the 9-tab bar — never a window with zero global nav.
1. HOIST: render `<SubmenuRail/>` in `AppShell.tsx`. Re-template the `.app-shell` grid (`globals.css:91-97`, currently `"hd" "mn"`) to give the rail a grid area — do NOT prescribe the exact template. DOM-MOUNT ORDER (FEP-flagged, load-bearing for e2e): mount `<SubmenuRail/>` BEFORE `<BottomTabBar/>` in AppShell JSX (Header, SubmenuRail, ModeContent, BottomTabBar) so `text=`/`.first()` locators resolve to the VISIBLE nav element at each breakpoint (rail ≥640px, fold <640px). REMOVE the page-local rail mount from `PartyPage.tsx` (import line 6 + the `hidden lg:flex` wrapper ~lines 222-224 + reconcile the plan-R-3 comment 26-29).
2. RESPONSIVE MOBILE-NAV — FOLLOW THE SPEC VERBATIM (`docs/v2-vision/v2-design-spec.md` `<responsive>` lines 85-88 + Mobile lines 70-74): persistent left rail at md/lg (≥640px); at <640px the 4 rail destinations fold into a bottom-bar reusing the existing bottom-tab pattern ("no new nav mechanism"). Repurpose `BottomTabBar.tsx` to render `RAIL_ITEMS` (4 items) gated to <640px, OR give the hoisted rail a responsive bottom-bar form. Do NOT ship a zero-nav mobile state. Rail renders at fixed 240px open; collapse/expand is a human-approved DEFERRAL — do NOT implement. (The spec's "5 tabs total" phrasing is a drafting inconsistency vs its own 4-item component_hierarchy + the 4-entry RAIL_ITEMS — follow the ratified 4-destination framing; do not invent a 5th tab.)
3. a11y (amend-2 A2): change `SubmenuRail.tsx` `aria-label` from "Party screen submenus" to "Main navigation" (line 31; the semantically-correct label for global primary nav, the label the removed BottomTabBar used). `role="navigation"` unchanged.
4. RETIRE THE 9-TAB v1 NAV: remove `NAV_ITEMS` + `NavItemDef` from `constants/navigation.ts` (grep importers first; keep `RAIL_ITEMS`/`RailItemDef` byte-identical). Realizes "remove the 9-tab BottomTabBar" as retiring the 9-TAB v1 config; the <640px fold is the rail's spec-ratified mobile form (see REQVAL mapping note in routing_notes).
5. e2e NAV-SELECTOR MIGRATION (jidoka fix #4 — mechanical rule 2). The hoist + 9-tab retirement legitimately falsify every spec that reaches a KEEP surface via `role="tab"` at the desktop default viewport. Update these ELEVEN specs (3 rev1 + 8 jidoka-added), asserting green by RUNNING `npx playwright test` (not spec-reading), cross-checked against the t5 57-failure list (context_files):
   - rev1: `gander-studio-p1-fe-shell.spec.ts`, `layout-sidebar-removal.spec.ts`, `prog-studio-v2-2026-07-s2-party-shell.spec.ts` (incl. the shared `getRailNav()` accessible-name → "Main navigation", and the "9 tabs" test → 4 tabs at a <640px viewport).
   - jidoka #4 — migrate `role="tab"` nav locators to a rail-button/text locator (e.g. `getByRole('navigation',{name:'Main navigation'}).getByRole('button',{name:/…/i})`): `progression.spec.ts` (3), `prog-studio-vision-s3-program-dag.spec.ts` (3), `prog-studio-vision-s4-legibility.spec.ts` (L83), `prog-studio-vision-s4-reduced-motion.spec.ts` (L112), `prog-studio-vision-s2-d3-session-buffer.spec.ts` (navigateToSessions helper), `prog-studio-vision-s2-d4-prose-slug.spec.ts` (sessionsNav).
   - `prog-studio-vision-s4-render-loop.spec.ts`: migrate ONLY the Progression sub-test's nav locator (its Graph sub-test is FE-4's — do not touch it here).
   - `prog-studio-sessions-2026-05-s2-list-edit-fe.spec.ts`: DELETE only the 4 obsolete "t6b: Existing pages smoke regression" sub-tests (~L358-380) that click removed v1 surface labels (Browse/Compose/Edit/Export); leave every other (KEEP Sessions) test untouched.
DESIGN.md present — reuse FF7 tokens (rail surface `--sf`, spec token line 247), NO new tokens; `design_system_source: DESIGN_MD`.
      </description>
      <success_criteria>
- `<SubmenuRail/>` rendered in `AppShell.tsx` (global, mounted before BottomTabBar); `.app-shell` grid re-templated; `grep -n "SubmenuRail" packages/client/src/pages/PartyPage.tsx` returns nothing (page-local mount removed).
- SubmenuRail `aria-label` == "Main navigation"; `grep -rn "Party screen submenus" packages/client/src` returns nothing.
- `NAV_ITEMS` removed: `grep -rn "NAV_ITEMS" packages/client/src` empty; `RAIL_ITEMS` unchanged.
- Nav reachable from a NON-party surface (navigate to Sessions, assert the rail routes to Progression) at desktop AND at <640px (bottom-bar fold); NO zero-nav state at any tested width; rail fixed 240px (no collapse/expand).
- ALL 11 enumerated specs green via a real `npx playwright test` RUN: the 8 jidoka-added KEEP specs migrated off `role="tab"` and green; the 4 dead t6b sub-tests removed from s2-list-edit-fe; the render-loop Progression sub-test migrated (Graph sub-test left for FE-4); no NEW failure vs the t5 list; s3-drilldowns + s2-party specs green.
- `npm run lint` (tsc ×3) clean; `npm run build -w @gander-studio/client` passing; run summary + net-new line count attached.
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
      <dependencies>none (first wave)</dependencies>
      <out_of_scope>
- Do NOT touch the AppMode union (ui-store.ts) or PAGE_MAP (ModeContent.tsx) — surface add/remove is FE-CAT/FE-2/3/4.
- Do NOT implement rail collapse/expand (deferred); render fixed 240px. No new breakpoint value (reuse existing 640px, globals.css:120).
- Do NOT touch the render-loop Graph sub-test (FE-4) or any Compose/Export/Browse/Graph/Edit surface spec (deleted with their surfaces by later waves).
- Do NOT add the persistent View-Full-Roster CTA (FE-CAT) or re-point the empty-state CTA (FE-4); do NOT modify PartyPage's party-member grid beyond removing the rail mount.
- Do NOT touch FF7 tokens.
      </out_of_scope>
      <estimated_new_lines>~45-65 net-new production (hoist + responsive grid + mobile fold; FEP measured production footprint ~15-30 net-new / ~20-30 removed — inside estimate) PLUS the 11-spec e2e migration (spec edits, not production lines). CONTINGENCY: if production breaches ~50 net-new lines, BLOCK-to-split (FE-1a hoist w/ 9-tab bar retained as fallback → FE-1b retire+fold), hoist-first. The 8-spec enumeration correctness is a scope-correctness fix, NOT a size trigger — do not split on spec count.</estimated_new_lines>
      <output_expected>
        <tag>ui_packet</tag>
        <must_contain>
          <item>SubmenuRail hoisted global (mounted before BottomTabBar) + page-local mount removed + grid re-templated</item>
          <item>aria-label "Party screen submenus" → "Main navigation" + any assertion on the old label updated</item>
          <item>mobile fold per v2-design-spec (cite lines); nav reachable from a non-party surface at desktop AND <640px</item>
          <item>per-file result for all 11 migrated/edited specs (incl. the 4 t6b sub-test removals + render-loop Progression-only)</item>
          <item>net-new line count + split-contingency status; lint ×3 + build + Playwright RUN summary (t5 cross-check)</item>
        </must_contain>
        <must_not_contain>
          <item>any edit to ui-store.ts union / ModeContent.tsx PAGE_MAP</item>
          <item>a rail collapse/expand impl or a zero-nav mobile state</item>
          <item>edits to the render-loop Graph sub-test or any cut-surface spec</item>
          <item>e2e status asserted by reading spec files instead of running Playwright</item>
        </must_not_contain>
        <success_signal>rail global + mobile fold live, aria-label fixed, NAV_ITEMS gone, 11 specs green via RUN, KEEP nav reachable at both breakpoints, lint ×3 clean, build passing</success_signal>
      </output_expected>
    </task_packet>

    <task_packet>
      <task_id>prog-studio-v2-2026-07-s4-retirement-FE-2</task_id>
      <assigned_to>frontend-engineer</assigned_to>
      <priority>HIGH</priority>
      <description>
CUT-SURFACE DELETION (Wave 1) — COMPOSE. One logical deletion unit bounded by the Compose surface. Steps:
1. Delete `pages/ComposePage.tsx`.
2. Delete `store/compose-store.ts` (importer scan: sole importer is ComposePage.tsx — VERIFIED SAFE this planning round: ExportPage.tsx imports canvas-store only, its compose-store references are comment-only). **Do NOT delete `store/canvas-store.ts` — moved to FE-3** (ExportPage.tsx imports it ~15 call sites and is deleted only in FE-3; deleting it here would break FE-2's own lint SC).
3. Delete Compose-only canvas components + constants after per-file importer scan: `components/compose/MateriaCanvas.tsx`, `MateriaNode.tsx`, `CardNode.tsx`, `handle-style.ts`, `constants/compose.ts` (all importer-confirmed Compose-only). Enumerate every deleted file; if any has a non-Compose importer, BLOCK.
4. AppMode↔PAGE_MAP: remove `'compose'` from the AppMode union (`store/ui-store.ts`); remove the `compose:` PAGE_MAP line + the `ComposePage` React.lazy import in `components/ModeContent.tsx`.
5. e2e: delete the SEVEN Compose-surface specs WITH the surface (amend-2 enumeration; the two `src/tests/compose/*` are inside client tsconfig `include:["src"]`, so their deletion is load-bearing for tsc, not just Playwright): `gander-studio-p1-compose-fe.spec.ts`, `gander-studio-p2-canvas-link-003a.spec.ts`, `materia-canvas-proximity.spec.ts`, `card-node-title-edit.spec.ts`, `loadout-list-panel.spec.ts`, `src/tests/compose/compose-connections-persist.spec.ts`, `src/tests/compose/materia-canvas.spec.ts`. Cross-check the t5 list; RUN `npx playwright test`.
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
      <dependencies>prog-studio-v2-2026-07-s4-retirement-FE-1</dependencies>
      <out_of_scope>
- Do NOT delete `store/canvas-store.ts` (FE-3 owns it — ExportPage still imports it this wave).
- Do NOT touch browse/edit/analyze stores, constants/canvas.ts, or hooks/useLinkSound.ts — later waves.
- Do NOT touch server code (loadout removal is BE-1) or the nav shell (FE-1).
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
2. Delete `store/canvas-store.ts` (MOVED from FE-2, jidoka fix #1): after ExportPage.tsx — its last real consumer — is deleted in THIS wave, canvas-store's importer list is empty (ComposePage/MateriaCanvas/CardNode already gone in FE-2). Then delete `constants/agent-roles.ts` (canvas-store's transitive dependent — its last real importer is canvas-store; re-grep importers at execution time and delete only if confirmed orphaned).
3. Delete Export-only / Planning-only constants+components after per-file importer scan (e.g. `constants/export.ts` → ExportPage only); enumerate.
4. AppMode↔PAGE_MAP: remove `'export'` and `'planning'` from the AppMode union; remove the `export:`/`planning:` PAGE_MAP entries + imports in `components/ModeContent.tsx`.
5. e2e: delete surface specs WITH the surface: `gander-studio-p1-export-fe.spec.ts`, `prog-studio-vision-s2-d1-export.spec.ts` (confirmed targets the Export SURFACE), `prog-studio-vision-s3-planning.spec.ts`. Also scan for any other Export/Planning-surface-exclusive spec (e.g. `prog-studio-vision-s2-d5-confirm.spec.ts` — verify it exclusively tests ExportPage before deleting). Cross-check the t5 list; RUN `npx playwright test`.
CORRECTION (jidoka fix #3): rev1's caution that `prog-studio-vision-s2-d2-edit-save.spec.ts` "covers SESSION markdown save (KEEP)" is FACTUALLY WRONG — that file tests the v1 EditPage (CUT) and is deleted by FE-4. The genuine session-save KEEP spec is `prog-studio-vision-s2-d3-session-buffer.spec.ts` (uses `session.saveEdit`/session-store) — do NOT delete it (here or in FE-4).
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
- Do NOT touch server code or the nav shell.
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
NEW SURFACE — 13-ROLE CATALOG (honors s3 ratification #1). ADDITIVE; the party homescreen stays 6-agent. Two deliverables: (A) the catalog surface, (B) the persistent entry CTA on the populated party home (human-ratified 2026-07-10, ORC-witnessed).
1. DATA SOURCE (DRY, jidoka-confirmed): REUSE the existing `useParty` hook / `roster.getParty` — it returns the FULL roster; PartyPage caps display at 6 (`PARTY_GRID_DISPLAY_CAP`). The catalog renders ALL members (uncapped) = the ratified 13-role set. Do NOT use `agent.list` (under-counts roster roles with null specFile). No new BE procedure; no resurrected BrowsePage code.
2. SURFACE: add the `'catalog'` AppMode member to `store/ui-store.ts` (Critic-RATIFIED — proceed, no BLOCK); add a `catalog:` PAGE_MAP entry + a `React.lazy(() => import('../pages/RosterCatalogPage'))` import (lazy-from-birth, matching the s3 AgentDetailPage pattern) in `components/ModeContent.tsx`; create `pages/RosterCatalogPage.tsx` rendering every roster member as cards (reuse PartyMemberCard/RoleTag/StatBar patterns, DRY) with first-class loading/empty/error states (mirror PartyPage's `derivePartyGridState`). Count DATA-DRIVEN (render what getParty returns; do NOT hardcode 13).
3. PERSISTENT ENTRY CTA (human-ratified 2026-07-10, ORC-witnessed — resolves Critic SCOPE_DRIFT): add a persistent "View Full Roster" affordance to the POPULATED/default party home (the PartyScreenHeader region ~lines 86-127, or the default-state branch adjacent to the grid — implementer's choice) → `setActiveMode('catalog')`. This is a SEPARATE, ADDITIONAL button, NOT a repoint of the empty-state `handleViewRoster` (FE-4's). The rail stays at its ratified 4 items — the catalog is NOT added to RAIL_ITEMS.
4. Do NOT alter the party 6-agent display cap. Work from post-FE-1 HEAD (FE-1 removed the page-local rail mount).
5. e2e (program invariant — Tier-2 spec per new surface): add a Tier-2 spec (name it task_id-scoped, e.g. `prog-studio-v2-2026-07-s4-retirement-catalog.spec.ts`, and record it in the ui_packet's e2e_spec field) asserting: (a) from the POPULATED party home the persistent "View Full Roster" CTA is visible and routes to the catalog; (b) the catalog renders the full roster + honest empty/error states (DOM-presence card count, not a side-effect proxy); (c) keyboard-operable. RUN `npx playwright test`; cross-check the t5 list.
DESIGN.md present — reuse FF7 tokens, NO new tokens; `design_system_source: DESIGN_MD`.
      </description>
      <success_criteria>
- `'catalog'` AppMode member added with a PAGE_MAP entry + lazy import; `pages/RosterCatalogPage.tsx` renders every member from `useParty`/getParty (uncapped) with loading/empty/error states.
- Count data-driven: `grep -n "13" packages/client/src/pages/RosterCatalogPage.tsx` shows no magic-number role count.
- PERSISTENT CTA: the populated party home shows a "View Full Roster" affordance routing to `'catalog'` (human-ratified 2026-07-10, ORC-witnessed); Tier-2 assertion confirms it from the POPULATED state. Rail NOT modified (catalog not in RAIL_ITEMS). Party 6-cap unchanged.
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
- Do NOT touch the nav shell (FE-1) beyond adding the persistent CTA to the party home.
- Do NOT add new FF7/design tokens.
      </out_of_scope>
      <estimated_new_lines>~120-140 (RosterCatalogPage ~90-120 + persistent CTA ~8-15 + mode wiring + Tier-2 spec ~60-100). JUSTIFICATION: one cohesive surface + its ratified entry affordance, one data source, standard page+lazy-mode+spec pattern. If the page alone exceeds ~150 lines, BLOCK to split the role-card component from the page.</estimated_new_lines>
      <output_expected>
        <tag>ui_packet</tag>
        <must_contain>
          <item>confirmation catalog reuses getParty/useParty (not agent.list), renders uncapped; no new BE proc</item>
          <item>'catalog' AppMode + NOT in rail + party 6-cap unchanged</item>
          <item>persistent populated-home CTA → catalog + Tier-2 assertion (cite human-ratified 2026-07-10 ORC-witnessed)</item>
          <item>data-driven count (no hardcoded 13); new spec name + green; lint ×3 + build + Playwright RUN</item>
        </must_contain>
        <must_not_contain>
          <item>a new BE procedure/schema or agent.list catalog data path</item>
          <item>a RAIL_ITEMS edit or an empty-state handleViewRoster re-point</item>
          <item>new design tokens</item>
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
2. Delete `hooks/useBrowseData.ts` (Browse-only), `store/browse-store.ts`, `store/edit-store.ts` (edit-store: ReviseSpecAction.tsx + AgentDetailPage.tsx confirmed non-importers). Delete Browse/Graph/Edit-only components after per-file importer scan: `components/browse/{AgentCard,DrilldownPanel,FilterBar,HookCard,SkeletonCard,SkillCard}.tsx`, `components/graph/{FilterSidebar,GraphNode}.tsx` + `constants/graph.ts`, `components/edit/TagInput.tsx` + `constants/edit.ts`.
3. TRANSITIVE CHAIN (jidoka fix #2): after BrowsePage/GraphPage/EditPage are gone, delete `hooks/useLinkSound.ts` (its importers were ExportPage[FE-3]/MateriaCanvas[FE-2]/GraphPage/EditPage — all gone by end of this wave) and then `constants/canvas.ts` (its last real importer was useLinkSound.ts). Re-grep importers for BOTH at execution time; delete only on a confirmed-zero-importer result.
4. AppMode↔PAGE_MAP: remove `'browse'`, `'edit'`, `'graph'` from the AppMode union; remove the browse/edit/graph PAGE_MAP entries + the `GraphPage` lazy import + the `BrowsePage`/`EditPage` static imports in `components/ModeContent.tsx`.
5. RATIFIED EMPTY-STATE CTA RE-POINT: removing `'browse'` makes `PartyPage.tsx` `handleViewRoster`'s `setActiveMode('browse')` a compile error (TODO(s4-cut)). Work from CURRENT HEAD (FE-1 removed the rail mount; FE-CAT added the persistent CTA — line numbers shifted; do NOT hardcode). Re-point it to `'catalog'` (the ratified true destination) + remove the stale TODO comment. This is the empty-state button only — the persistent populated-home CTA is FE-CAT's, do NOT touch it.
6. e2e (jidoka fix #3 + mechanical rule 2):
   - Delete surface specs WITH the surface: `gander-studio-p1-browse-fe.spec.ts`, `gander-studio-p1-edit-fe.spec.ts`, `graph-page.spec.ts`, AND `prog-studio-vision-s2-d2-edit-save.spec.ts` (CUT — tests the v1 EditPage `edit-page` testid, its sibling Tier-2 spec).
   - `prog-studio-vision-s4-render-loop.spec.ts`: delete ONLY its Graph sub-test (GraphPage removed); leave the Sessions + Progression sub-tests (FE-1 migrated the Progression nav locator). Coordinate — work from post-FE-1 HEAD of this file.
   - Update `prog-studio-v2-2026-07-s2-party-shell.spec.ts` empty-state CTA test: assertion `browse-page` testid → RosterCatalogPage's root testid (FE-CAT-defined).
   Cross-check the t5 list; RUN `npx playwright test`.
7. VERIFY s3 absorption spec + s2 party specs + FE-CAT catalog spec stay GREEN.
      </description>
      <success_criteria>
- BrowsePage, GraphPage, EditPage, useBrowseData, browse-store, edit-store, all Browse/Graph/Edit-only components/constants, hooks/useLinkSound.ts, and constants/canvas.ts deleted (each on a confirmed-orphan re-scan); `grep -rn "BrowsePage\|GraphPage\|EditPage\|useBrowseData\|browse-store\|edit-store\|useLinkSound" packages/client/src` empty.
- `'browse'`/`'edit'`/`'graph'` removed from AppMode union; no browse/edit/graph PAGE_MAP entries; no `trpc.connectivity.getGraph` in client src.
- PartyPage compiles; empty-state `handleViewRoster` re-points to `'catalog'`; `grep -rn "'browse'\|\"browse\"" packages/client/src` empty.
- s3 absorption e2e cited green + STILL green; s2 party specs + FE-CAT catalog spec green; `s2-d2-edit-save.spec.ts` deleted; render-loop Graph sub-test removed (Sessions/Progression sub-tests intact).
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
- RETAIN `store/analyzeStore.ts` (jidoka fix #6 — disk-confirmed 3 Sessions importers: sessions AnalyzeTab / SessionPicker / SessionListPage; ZERO Browse/Graph). Its name is misleading — do NOT delete.
- RETAIN `constants/browse.ts` (jidoka fix #6 — despite its name, it exports AGENT_MATERIA/DEFAULT_MATERIA consumed by the KEEP `components/sessions/AgentTimeline.tsx`). Do NOT delete by name-pattern.
- Do NOT delete/refactor `components/detail/*` KEEP components (ReviseSpecAction, RelationshipPanel, AgentDetail panels).
- Do NOT build/modify the catalog surface or the persistent CTA (FE-CAT) — only re-point the empty-state CTA. Do NOT delete `s2-d3-session-buffer.spec.ts` (KEEP).
- Do NOT touch AgentDetailPage's statbox grid (6aa859c), the nav shell (FE-1), ROSTER_AGENT_NAME_BY_CODE/AgentDetailSchema (DEFERRED-V2S3-1), FF7 tokens, or server code.
      </out_of_scope>
      <estimated_new_lines>0-10 net-new (deletion wave; empty-state re-point is a one-line mode change)</estimated_new_lines>
      <output_expected>
        <tag>ui_packet</tag>
        <must_contain>
          <item>s3 absorption spec cited green</item>
          <item>explicit RETAIN confirmations for analyzeStore.ts + constants/browse.ts (with the KEEP-consumer named)</item>
          <item>useLinkSound.ts + constants/canvas.ts deletion with confirmed-orphan re-scan evidence</item>
          <item>empty-state handleViewRoster re-pointed to 'catalog'; PartyPage compiles; no 'browse' literal remains</item>
          <item>s2-d2-edit-save deleted; render-loop Graph sub-test removed; s2-party CTA testid updated; lint ×3 + build + Playwright RUN (s3/s2/catalog green)</item>
        </must_contain>
        <must_not_contain>
          <item>deletion of analyzeStore.ts, constants/browse.ts, components/detail/* KEEP components, or s2-d3-session-buffer.spec.ts</item>
          <item>modification of the catalog surface / persistent CTA; AgentDetailSchema edits</item>
          <item>CTA removal or a non-catalog destination</item>
        </must_not_contain>
        <success_signal>lint ×3 clean, build passing, browse/graph/edit + useLinkSound/canvas.ts greps empty, analyzeStore+browse.ts retained, empty-state CTA lands on catalog, s3+s2+catalog green</success_signal>
      </output_expected>
    </task_packet>

    <task_packet>
      <task_id>prog-studio-v2-2026-07-s4-retirement-BE-1</task_id>
      <assigned_to>backend-engineer</assigned_to>
      <priority>HIGH</priority>
      <description>
SERVER-PROCEDURE RETIREMENT (Critic-gated + jidoka-confirmed). Runs AFTER all FE waves (all 4 removed-procedure client consumers already deleted by strictly-preceding packets — jidoka ordering NO CONFLICT). Removal set: export.spawn, loadout.*, planning.list, connectivity.getGraph (24→18, BEP-confirmed exact).
1. PRE-REMOVAL SCAN: for each removal candidate, grep every importer of its procedure/schema/parser/helper. CRITICAL protection (jidoka-confirmed): `parsers/agent-detail.ts` imports `ConnectivityGraphSchema` (line 16, used line 44 in `readConnectivityGraphSafe`) — the SCHEMA MUST STAY. `parseAllAgents/Skills/Hooks` retained (agent.get/skill.get/roster).
2. In `router.ts`: remove `exportRouter`, `loadoutRouter`, `connectivityRouter`, `planningRouter` bodies + their `appRouter` registrations + now-dead top-level symbols whose SOLE consumer was a removed block: the `sanitizeName` helper, the `ExportResultSchema` local const, the dead `node:fs/promises` names (unlink/copyFile/stat), the dead `./env.js` names (LOADOUTS_DIR/EXPORT_BASE_DIR — but do NOT edit env.ts), the `parsePlanningBacklog` import, AND — jidoka fix #5 — the now-dead `ConnectivityGraphSchema`/`type ConnectivityGraph` IMPORT-SITE in router.ts (lines ~19/26). PRECISION: pruning router.ts's dead ConnectivityGraphSchema *import* is NOT a violation of "retain ConnectivityGraphSchema" — the retention protects the schemas.ts DEFINITION + agent-detail.ts's INDEPENDENT import, not router.ts's orphaned import-site. State this distinction in the completion_packet so the auditor doesn't misread it.
3. In `packages/shared/src/schemas.ts`: remove LoadoutSchema, ExportInputSchema, and the Planning block (PlanningItem/PlanningSprint/PlanningListInput/PlanningListOutput schemas + inferred types). Leave the entire Connectivity* block byte-identical.
4. In `packages/shared/src/types.ts` (jidoka fix #5, HIGH — was absent from the plan; index.ts re-exports both schemas.ts AND types.ts via `export *`): remove the `LoadoutSchema` import specifier and the `export type Loadout = z.infer<typeof LoadoutSchema>` line (2-line deletion in a 12-line file). Leave Agent/Skill/Hook type exports untouched. WITHOUT this, the FIRST of the 3 sequential lint passes (shared → server → client) fails on a dangling import before server/client are ever checked.
5. Delete `parsers/planning-parser.ts` + `parsers/__tests__/planning-parser.test.ts` (self-contained — self-generates tmp fixtures, no shared __tests__/fixtures; jidoka-confirmed). No `parsers/connectivity*.ts` file exists (nothing to delete/retain there beyond the procedure).
6. RETAIN: agent.*, skill.*, hook.list, session.*, progression.getLedger, program.getDag, roster.* , env.ts (zero edits — jidoka-confirmed LOADOUTS_DIR/EXPORT_BASE_DIR orphan neither var nor startup check).
7. Run server vitest (`vitest run src/parsers/__tests__`) + `npm run lint` (tsc ×3, shared→server→client) + `npm run build -w @gander-studio/client`; all green.
      </description>
      <success_criteria>
- Pre-removal scan documented (target → importers → retain-set).
- export.spawn/loadout.*/planning.list/connectivity.getGraph removed from router.ts + appRouter; router.ts's dead ConnectivityGraphSchema import-site pruned.
- `packages/shared/src/types.ts` Loadout-type derivation + its LoadoutSchema import removed; the FIRST (shared) tsc pass is clean.
- `ConnectivityGraphSchema` DEFINITION in schemas.ts + agent-detail.ts import RETAINED (roster.getAgentDetail resolves); other exclusively-used schemas/parsers/helpers removed.
- RETAINED procedures intact (agent.*/skill.*/hook.list/session.*/progression/program/roster); ReviseSpecAction's agent.get/save+skill.get/save resolve. env.ts unchanged.
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
- Do NOT touch types.ts's Agent/Skill/Hook exports (only the Loadout derivation).
- Do NOT git commit (return a completion_packet; ORC commits post-audit).
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
        <success_signal>lint ×3 clean (shared pass first-green with types.ts fixed), server vitest green, client build passing, ConnectivityGraphSchema definition intact</success_signal>
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
   - **Navigation line** (currently "BottomTabBar (role=tablist, 9 tabs…)", line 69) — replace with: global SubmenuRail (Roster→party / Sessions / Progression / Programs, aria-label "Main navigation") as the persistent desktop/tablet left rail, folding into a bottom-bar on <640px (per v2-design-spec responsive); agent-detail via party card; catalog via the persistent party-home CTA.
   - **tRPC procedures table + "22 procedures across 10 routers" heading** — rewrite to the ACTUAL post-BE-1 set (18 procedures across 8 routers). DERIVE the count + router list by grepping `t.procedure` + sub-routers in `packages/server/src/router.ts` at HEAD (do NOT hardcode). Remove the loadout.*/export.spawn/connectivity.getGraph/planning.list rows per BE-1's completion_packet; note connectivity.getGraph removed while ConnectivityGraphSchema retained.
   - **Architecture tree** — fix `pages/` (add PartyPage/AgentDetailPage/RosterCatalogPage/sessions/; remove deleted), `store/` (remove compose/canvas/browse/edit; RETAIN analyzeStore; correct the STALE "session-picker" name to the actual store files), `parsers/` (remove planning).
   - **Known Issues bundle line** ("~700KB", line 114) — re-measure from the fresh client build output; state the source.
   - **Env table** — note EXPORT_BASE_DIR now unused/deprecated; keep LOADOUTS_DIR (backs SESSIONS_EDITS_DIR default).
2. `DESIGN.md` (repo root): append a Decision Record (the next in sequence after Record D) for the v2 IA — 9→6 surface consolidation (party, agent-detail, roster-catalog, sessions, progression, programs), the 9-tab v1 nav retirement, the hoisted global SubmenuRail + its <640px bottom-bar fold, the 6-agent homescreen + persistent catalog CTA. No new visual tokens (`design_system_source: DESIGN_MD`); structural/IA record only.
3. `docs/deferred-work.md` — append the 4 human-approved deferrals under a new "## Sprint: prog-studio-v2-2026-07-s4-retirement (2026-07-10)" header (matching the file's existing per-sprint append pattern), each citing "human-ratified 2026-07-10 (ORC-witnessed)". DOCS-1 is the sole writer this sprint (append-serialized).
      </description>
      <success_criteria>
- CLAUDE.md surfaces table = exactly the 6 v2 surfaces (Party, Agent Detail, Roster Catalog, Sessions, Progression, Programs); no cut/absorbed surface rows.
- Navigation description reflects the global SubmenuRail ("Main navigation") + <640px bottom-bar fold + catalog-via-persistent-CTA (no "9 tabs" as live nav).
- tRPC procedure table matches `router.ts` at HEAD (18 procedures, derived not hardcoded); no export.spawn/loadout./connectivity.getGraph/planning.list rows; roster.* present; ConnectivityGraphSchema-retained note present.
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
      <dependencies>prog-studio-v2-2026-07-s4-retirement-FE-1, prog-studio-v2-2026-07-s4-retirement-FE-2, prog-studio-v2-2026-07-s4-retirement-FE-3, prog-studio-v2-2026-07-s4-retirement-FE-CAT, prog-studio-v2-2026-07-s4-retirement-FE-4, prog-studio-v2-2026-07-s4-retirement-BE-1</dependencies>
      <out_of_scope>
- Do NOT edit code — docs only. Do NOT add new FF7/design tokens. Do NOT hardcode a procedure count.
- Do NOT document deferred items as done — record them as human-approved deferrals.
      </out_of_scope>
      <output_expected>
        <tag>completion_packet</tag>
        <must_contain>
          <item>updated surfaces table + navigation description (incl. mobile fold) + procedure table (derived)</item>
          <item>the source of the new bundle-size number</item>
          <item>the DESIGN.md v2-IA decision record text</item>
          <item>the 4 deferred-work.md entries with the 2026-07-10 authorization citation</item>
        </must_contain>
        <must_not_contain>
          <item>any code edit; new design/FF7 tokens; a hardcoded procedure count</item>
        </must_not_contain>
        <success_signal>CLAUDE.md + DESIGN.md reflect disk reality (catalog surface + hoisted rail + mobile fold); procedure table matches router.ts; deferrals recorded with authorization</success_signal>
      </output_expected>
    </task_packet>

  </task_packets>

  <dependency_order>
    FE-1 (nav-shell re-architecture + 11-spec nav migration) → FE-2 (Compose; NOT canvas-store) → FE-3 (Export+Planning + canvas-store chain) → FE-CAT (13-role catalog + persistent CTA) → FE-4 (Browse+Graph+Edit + canvas.ts/useLinkSound chain + empty-state CTA re-point) → BE-1 (server removal + types.ts) → DOCS-1 (docs + deferred-work)
    All packets SERIAL. Shared-file mutation order (rev2): ui-store.ts[union] = [FE-2 rm'compose', FE-3 rm'export'/'planning', FE-CAT add'catalog', FE-4 rm'browse'/'edit'/'graph']; ModeContent.tsx[PAGE_MAP] mirrors 1:1; navigation.ts[NAV_ITEMS] = [FE-1]; PartyPage.tsx = [FE-1 rail-mount removal, FE-CAT persistent CTA, FE-4 empty-state re-point] (FEP-confirmed non-overlapping line ranges, each against fresh HEAD); canvas-store.ts = [FE-3] (moved from FE-2); render-loop.spec.ts = [FE-1 Progression sub-test, FE-4 Graph sub-test]; packages/shared {schemas.ts, types.ts} = [BE-1] (same package, same edit unit); docs/deferred-work.md = [DOCS-1 sole writer]. lint ×3 + client build green + Playwright RUN (not spec-reading) is a per-packet SC.
  </dependency_order>

  <routing_notes>
    ## Jidoka REPARTITION resolution (all 6 findings applied; positive confirmations cited)
    Applied within the existing 7 packets (no split — both planner split_recommendations were NO): (1) canvas-store FE-2→FE-3 [PM re-verified ExportPage imports canvas-store not compose-store]; (2) constants/canvas.ts + hooks/useLinkSound.ts → FE-4; (3) s2-d2-edit-save.spec.ts is CUT (v1 EditPage) → FE-4 delete, s2-d3-session-buffer is the KEEP session-save spec; (4) 8 KEEP specs' role="tab" nav migration → FE-1; (5) shared/src/types.ts Loadout-derivation → BE-1 + router.ts dead ConnectivityGraphSchema import prune; (6) analyzeStore.ts + constants/browse.ts explicit RETAIN → FE-4 out_of_scope. Positive confirmations (cited-as-verified, no re-litigation): 24→18 exact; all 4 removed-proc consumers deleted by preceding packets; ConnectivityGraphSchema protection holds (agent-detail.ts:16/44); env.ts zero edits; planning-parser.test.ts self-contained. rev1 BLOCKER-fix (rail hoist) + amend2 (7-spec Compose deletion, aria-label) folded in verbatim.

    ## Recurring-pattern preflight (Step 0.5 — re-affirmed)
    <recurring_pattern source="prog-studio-v2-2026-07-s3-drilldowns.md">plan-time-unverified-inherited-fact (RECURRING, 3rd form). This jidoka round is the class working as intended: the planners' live importer-grep against HEAD caught transitive-import sequencing traps invisible from packet text. rev2 folds every finding in with a same-round disk citation; the one load-bearing sequencing fact (ExportPage imports canvas-store not compose-store) was PM-re-verified by direct grep.</recurring_pattern>
    <recurring_pattern source="prog-studio-v2-2026-07-s3-drilldowns.md">cross-spec-interim-assertion-unmarked (§6 G3). ADDRESSED at scale: FE-1 now owns the full 11-spec nav-selector migration (3 rev1 + 8 jidoka), each falsified assertion updated in-packet, s3/s2/catalog specs kept green; FE-4 co-owns the render-loop Graph sub-test + the s2-d2-edit-save misidentification correction.</recurring_pattern>
    <recurring_pattern source="prog-studio-v2-2026-07-s3-drilldowns.md">primitive-behavioral-default-collision (2nd behavioral). ACCEPTED-LOW-RISK — no base-ui primitive modified; catalog uses first-class states + a plain Button.</recurring_pattern>
    <recurring_pattern source="prog-studio-v2-2026-07-s3-drilldowns.md">subagentstop-complete-miss (validator subclass, 4th). ORC-side — verify COMPLETE events, backfill inline.</recurring_pattern>
    <recurring_pattern source="prog-studio-v2-2026-07-s3-drilldowns.md">archivist-paraphrase-drift (4th sighting). AR-side — copy identifiers/defects verbatim (Glob-confirm).</recurring_pattern>
    <recurring_pattern source="pm_preflight_checklist">OVERSCOPED: deletion-wave-by-surface exemption; FE-1 remains one nav re-architecture (split contingency on code SIZE, not spec count); no packet packs 3+ independent-logic production files beyond the deletion exemption.</recurring_pattern>
    <recurring_pattern source="pm_preflight_checklist">DRY: FE-CAT reuses getParty/useParty + party card patterns; FE-1 reuses the existing bottom-tab pattern for the mobile fold + existing 640px breakpoint; no resurrected browse code, no new endpoint.</recurring_pattern>

    ## REQVAL mapping note (carried from amend-2)
    "BottomTabBar removed; v2 rail is the sole nav" maps to: the 9-tab v1 NAV_ITEMS config is retired and SubmenuRail is the sole nav mechanism; the bottom-bar PATTERN survives as the rail's ratified <640px presentation (v2-design-spec 70-74/85-88). REQVAL validates FE-1's outcome-based SC (NAV_ITEMS gone + nav reachable at desktop AND <640px + aria-label "Main navigation"), NOT the literal "BottomTabBar.tsx deleted" string.

    ## Server-procedure decision (Critic-gated) + DESIGN.md status + Critic re-gate
    Server decision unchanged (deprecate-by-removal; agent.list retained as low-churn, NOT a FE-CAT consumer; ConnectivityGraphSchema definition protected). DESIGN.md PRESENT at repo root, in FE-1/FE-CAT/FE-4 + updated by DOCS-1; no new tokens (design_system_source DESIGN_MD). Critic re-gate focus: the 6 jidoka fixes' correctness + the unchanged-from-rev1 items (mobile-fold reconciliation, catalog getParty source, absorption-before-cut, compiler-exhaustive per wave). Step 4.5 human walkthrough (ORC/human-owned) must exercise desktop rail AND <640px fold.

    ## sc-precheck
    No Bash in PM toolset — manual self-lint per Steps 7.5/7.8 in `sc-precheck-report.json` (this dir, refreshed), covering the jidoka fixes: types.ts compile-blocker (was latent, now fixed), the FE-3 canvas-store sequencing, and the FE-4 RETAIN exceptions. Verdict PASS; no locked-value SCs. Recommend ORC/Critic run the mechanical script as backstop.
  </routing_notes>

  <risk_flags>
    - **FE-1 DOM-mount order is load-bearing for the 8 migrated specs:** SubmenuRail must mount before BottomTabBar in AppShell so `text=`/`.first()` locators resolve to the visible element at each breakpoint (FEP-flagged). FE-1 must verify with a live Playwright RUN, not static reasoning.
    - **FE-1 is the highest-risk packet** (nav re-architecture + 11-spec migration); BLOCK-to-split contingency on code SIZE only. If the Critic prefers the split, FE-1a/FE-1b is pre-authorized (hoist-first).
    - **Transitive-orphan re-scan gates (FE-3 agent-roles.ts; FE-4 useLinkSound.ts + constants/canvas.ts):** delete only on a confirmed-zero-importer re-grep at execution time (disk may shift between planning and execution).
    - **RETAIN traps (misleading names):** analyzeStore.ts + constants/browse.ts must NOT be deleted by name-pattern (jidoka fix #6) — FE-4 out_of_scope enforces this.
    - **BE-1 shared-package first-pass:** types.ts must be edited in the same unit as schemas.ts or the FIRST (shared) tsc pass fails before server/client are checked.
    - **Non-blocking residuals surfaced by planners (documented so not silently dropped; NOT in scope this sprint):** ModeContent.tsx `paddingBottom:'56px'` reserves fold space at all viewports → minor desktop bottom gap post-hoist (visual-only, untested); `v2-design-spec.md:324` old aria-label + router.ts STUDIO_ROOT comment + program-dag-parser.test comment become stale prose; client-vitest (`vitest run`, 8 files) is not gated by any packet SC (grep-confirmed none reference the removed procedures, so BE-1 doesn't break them). Recommend a future-pass cleanup item; none blocks this sprint.
    - **Base-plan portability:** all packets plain file edits; no Workflow-tool dependency.
  </risk_flags>

  <human_approved_deferrals date="2026-07-10" authorization="human-ratified this session (ORC-witnessed) — REQVAL maps as deferred-with-authorization, NOT missing">
    <deferral id="rail-collapse-expand" target="docs/deferred-work.md">SubmenuRail collapse/expand (240px↔56px desktop animation) — rail polish; the rail ships fixed 240px open. DISTINCT from the <640px mobile bottom-bar fold, which IS delivered (FE-1, functional necessity, spec-ratified).</deferral>
    <deferral id="DEFERRED-V2S2-1-390px-header" target="docs/deferred-work.md">390px header overflow (DEFERRED-V2S2-1) — pre-existing responsive bug; separate pass.</deferral>
    <deferral id="DEFERRED-V2S3-1-roster-name-map" target="docs/deferred-work.md">Retire ROSTER_AGENT_NAME_BY_CODE via AgentDetailSchema extension — additive BE schema extension + FE refactor; dedicated follow-up.</deferral>
    <deferral id="DEFERRED-V2S3-2-mg-contrast" target="docs/deferred-work.md">--mg-on---sfh contrast_pairs row (DEFERRED-V2S3-2) — conditional next-design-pass item.</deferral>
  </human_approved_deferrals>
</task_decomposition>

---

## Verbatim Deliverable Audit (Step 7 — rev2)

<verbatim_deliverable_audit>
  <phrase text="kick off s4"><addressed task="all — rev2 decomposition produced"/></phrase>
  <phrase text="retire the CUT surfaces (Compose, Export, Planning)"><addressed task="FE-2 (Compose), FE-3 (Export+Planning+canvas-store chain), BE-1 (their server procedures)"/></phrase>
  <phrase text="remove the absorbed v1 surfaces (Browse, Graph, Edit)"><addressed task="FE-4 (+ transitive useLinkSound/canvas.ts chain)"/></phrase>
  <phrase text="now that s3's drill-downs carry their value"><addressed task="FE-4 (cites s3 absorption e2e green; absorption-before-cut)"/></phrase>
  <phrase text="remove the 9-tab BottomTabBar"><addressed task="FE-1 (retires 9-tab v1 NAV_ITEMS; hoists SubmenuRail global; <640px fold = spec-ratified mobile form; REQVAL mapping note)"/></phrase>
  <phrase text="in favor of the v2 rail"><addressed task="FE-1 (SubmenuRail hoisted global: left rail desktop/tablet + bottom-bar fold <640px)"/></phrase>
  <phrase text="prune dead stores/components/routes"><addressed task="FE-1/FE-2/FE-3/FE-4 (client, incl. transitive canvas-store/agent-roles/useLinkSound/canvas.ts chains), BE-1 (server + types.ts)"/></phrase>
  <phrase text="update project docs (CLAUDE.md surfaces + tRPC tables, DESIGN.md) to v2 reality"><addressed task="DOCS-1"/></phrase>
  <phrase text="s3 inheritance (a) View-Full-Roster CTA re-point"><addressed task="FE-4 (empty-state → catalog) + FE-CAT (persistent populated-home CTA → catalog) — human-ratified 2026-07-10"/></phrase>
  <phrase text="s3 inheritance (b) Roster rail collapse/expand"><deferred reason="human-approved 2026-07-10; rail polish (fixed 240px ships), distinct from the delivered mobile fold, → docs/deferred-work.md (DOCS-1)"/></phrase>
  <phrase text="s3 inheritance (c) 390px header overflow"><deferred reason="human-approved 2026-07-10; DEFERRED-V2S2-1, → docs/deferred-work.md (DOCS-1)"/></phrase>
  <phrase text="s3 inheritance (d) stale CLAUDE.md bundle baseline"><addressed task="DOCS-1"/></phrase>
  <phrase text="s3 inheritance (e) 13-role catalog entry"><addressed task="FE-CAT (catalog surface + persistent entry CTA) + FE-4 (empty-state entry)"/></phrase>
  <phrase text="DEFERRED-V2S3-1 (retire ROSTER_AGENT_NAME_BY_CODE via schema extension)"><deferred reason="human-approved 2026-07-10; additive schema extension, → docs/deferred-work.md (DOCS-1)"/></phrase>
  <phrase text="DEFERRED-V2S3-2 (--mg on --sfh contrast_pairs row)"><deferred reason="human-approved 2026-07-10; conditional design-pass item, → docs/deferred-work.md (DOCS-1)"/></phrase>
  <phrase text="export/loadout server procedures — retained vs deprecated (PM decides, Critic gate)"><addressed task="BE-1 (deprecate-by-removal; 24→18; ConnectivityGraphSchema definition retained; types.ts Loadout derivation removed)"/></phrase>
  <phrase text="mobile/sub-lg nav (functional necessity)"><addressed task="FE-1 (<640px bottom-bar fold per v2-design-spec 85-88/70-74; no zero-nav state)"/></phrase>
</verbatim_deliverable_audit>

---

## Expectation Manifest (rev2)

<expectation_manifest>
  <sprint_id>prog-studio-v2-2026-07-s4-retirement</sprint_id>
  <generated>2026-07-10 (rev2)</generated>
  <assignments>
    <assignment>
      <task_id>prog-studio-v2-2026-07-s4-retirement-FE-1</task_id>
      <agent>FE#1</agent>
      <expected_tag>ui_packet</expected_tag>
      <expected_file>.claude/tasks/outputs/prog-studio-v2-2026-07-s4-retirement-FE-1-{ts}.md</expected_file>
      <blocks>FE-2, FE-3, FE-CAT, FE-4, DOCS-1</blocks>
      <receipt_check>
        <item>SubmenuRail hoisted global (before BottomTabBar) + page-local mount removed + grid re-templated; aria-label "Main navigation"</item>
        <item>mobile fold per spec; nav reachable from a non-party surface at desktop AND <640px; no zero-nav; fixed 240px</item>
        <item>all 11 specs green via RUN (8 jidoka migrations incl. render-loop Progression-only + the 4 t6b sub-test removals); NAV_ITEMS gone</item>
        <item>net-new count + split status; lint ×3 + build + Playwright RUN</item>
      </receipt_check>
    </assignment>
    <assignment>
      <task_id>prog-studio-v2-2026-07-s4-retirement-FE-2</task_id>
      <agent>FE#2</agent>
      <expected_tag>ui_packet</expected_tag>
      <expected_file>.claude/tasks/outputs/prog-studio-v2-2026-07-s4-retirement-FE-2-{ts}.md</expected_file>
      <blocks>FE-3, FE-CAT, FE-4, BE-1, DOCS-1</blocks>
      <receipt_check>
        <item>Compose deleted incl. compose-store; canvas-store NOT deleted (explicit); 'compose' off union/PAGE_MAP; no trpc.loadout</item>
        <item>7 Compose specs deleted; lint ×3 + build + Playwright RUN; KEEP specs green</item>
      </receipt_check>
    </assignment>
    <assignment>
      <task_id>prog-studio-v2-2026-07-s4-retirement-FE-3</task_id>
      <agent>FE#3</agent>
      <expected_tag>ui_packet</expected_tag>
      <expected_file>.claude/tasks/outputs/prog-studio-v2-2026-07-s4-retirement-FE-3-{ts}.md</expected_file>
      <blocks>FE-CAT, FE-4, BE-1, DOCS-1</blocks>
      <receipt_check>
        <item>Export+Planning+canvas-store deleted; agent-roles.ts orphan decision w/ re-scan; 'export'/'planning' off union/PAGE_MAP</item>
        <item>s2-d3-session-buffer (KEEP) untouched; s2-d2-edit-save left for FE-4; no trpc.export/planning; lint ×3 + build + RUN</item>
      </receipt_check>
    </assignment>
    <assignment>
      <task_id>prog-studio-v2-2026-07-s4-retirement-FE-CAT</task_id>
      <agent>FE#4</agent>
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
      <agent>FE#5</agent>
      <expected_tag>ui_packet</expected_tag>
      <expected_file>.claude/tasks/outputs/prog-studio-v2-2026-07-s4-retirement-FE-4-{ts}.md</expected_file>
      <blocks>BE-1, DOCS-1</blocks>
      <receipt_check>
        <item>s3 absorption cited green; RETAIN confirmations for analyzeStore + constants/browse.ts (KEEP consumer named)</item>
        <item>useLinkSound + constants/canvas.ts deleted w/ re-scan; empty-state CTA → catalog; PartyPage compiles; no 'browse' literal</item>
        <item>s2-d2-edit-save deleted; render-loop Graph sub-test removed; s2-party CTA testid updated; lint ×3 + build + RUN (s3/s2/catalog green)</item>
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
      <agent>FE#6</agent>
      <expected_tag>completion_packet</expected_tag>
      <expected_file>.claude/tasks/outputs/prog-studio-v2-2026-07-s4-retirement-DOCS-1-{ts}.md</expected_file>
      <blocks>NONE (terminal; feeds Step 4.5 + skein)</blocks>
      <receipt_check>
        <item>surfaces table = 6 v2 surfaces incl. Roster Catalog; nav = global rail ("Main navigation") + <640px fold + catalog-via-CTA</item>
        <item>procedure table matches router.ts at HEAD (18, derived); ConnectivityGraphSchema-retained note; architecture tree matches disk (analyzeStore retained; session-picker corrected)</item>
        <item>bundle baseline updated w/ source; DESIGN.md IA record (no tokens); deferred-work has the 4 deferrals w/ 2026-07-10 authorization</item>
      </receipt_check>
    </assignment>
  </assignments>
</expectation_manifest>

---

## COMPLETE (rev2)
Plan of record: `.claude/tasks/outputs/prog-studio-v2-2026-07-s4-retirement-rev2-PM-1783714606.md` (supersedes rev1 + amend2; self-contained).
Adjacent: `.claude/tasks/outputs/sc-precheck-report.json` (refreshed).
7 task_packets inline (FE-1, FE-2, FE-3, FE-CAT, FE-4, BE-1, DOCS-1) — no-stub self-check PASS (7 `<task_packet>` == 7 declared, agent_count=7). All 6 jidoka findings applied within the existing structure; positive confirmations cited. rev2 reads: 5 (jidoka_synthesis, FEP full, BEP full, ExportPage grep-verify, + 4 Glob confirmations). Re-runs the Critic gate per W1.
