# PM Task Decomposition (AMEND-1) — prog-studio-v2-2026-07-s4-retirement

Single plan of record (supersedes r0 `...-PM-1783709144.md`). Amendment per coordinator scope decision 2026-07-10: (1) ADD the 13-role catalog FE packet (honors s3 ratification #1); (2) record human-approved deferrals; (3) slot the new packet in the nav-file serial chain; (4) update agent_count / dependency_order / routing_notes.

Adjacent: `sc-precheck-report.json` (this dir), PM log `docs/agent-logs/PM/prog-studio-v2-2026-07-s4-retirement.md`. r0 disk-verified ground facts carry forward unchanged (union members, pages, stores, trpc consumer map, PartyPage compile-break marker, s3 absorption spec green 8/8).

---

## Ratified-wording verification (re-verified 2026-07-10, coordinator-mandated)

**`docs/SESSION-CHECKPOINT.md` §Human Ratifications (2026-07-08), verbatim:**
> Three design-intent sign-offs:
> 1. Six-agent homescreen (13-role catalog entry → s4 scope)
> 2. View-Full-Roster CTA retains browse affordance (re-point → s4 scope)
> 3. Roster rail party link (party-home affordance; preserves s2 aria-current, no invariant violation)

**`docs/after-actions/prog-studio-v2-2026-07-s3-drilldowns.md`, verbatim-relevant:**
- (line 56/202) `handleViewRoster` **deliberately retains `'browse'`** with an s4 TODO — "semantic target is the deferred 13-role catalog."
- (line 207) s4 inheritance: "13-role catalog entry point (**the CTA's true destination**)."
- (line 161) RV#1 adjudicated "any roster agent" against "**the ratified 6-of-13 scope**" via a capability/entry-point distinction (R-012) — the homescreen shows 6 of the 13-role team.

**Interpretation used to write the FE-CAT SCs (landing target = UNAMBIGUOUS; mechanism/name = flagged):**
- The party homescreen STAYS 6-agent (ratification #1; do not alter party's active-6 logic).
- The "View Full Roster" CTA's ratified true destination is the **13-role catalog** — FE-4 re-points `handleViewRoster` from `'browse'` to the catalog surface FE-CAT builds. Not an invented IA; this is the ratified destination.
- The rail's "Roster" item STAYS → `'party'` (ratification #3); the catalog is NOT added to the rail. It is reached via the CTA.
- **Data source:** the catalog lists the full role set from an EXISTING procedure — `agent.list` (retained by BE-1 for exactly this future consumer) returns the full team from GANDER_ROOT; if `roster.getParty` already returns all roles, reuse it (DRY). No new BE procedure (coordinator specified one FE packet).
- **FLAGGED FOR CRITIC (ratified wording does not fix these — I did not invent a decision):** (a) IA mechanism — new top-level AppMode surface (recommended, matches the AppMode/PAGE_MAP IA) vs. a party sub-view; (b) mode-id name — recommend `'catalog'` to avoid collision with the rail's "Roster" (→ `'party'`); the ratification uses both "Roster" and "catalog" for adjacent concepts. SCs are written to the ratified OUTCOME (a surface listing all 13 roles, reachable via the re-pointed CTA, homescreen stays 6), not to a specific mechanism/name.

## GROUND-FACT CORRECTION surfaced by the mandated re-verification (r0 SC defect)
`s3 AA line 208`: "The legacy e2e corpus is **~30% red BY DESIGN** — 55 pre-existing failures in untouched files, largely rooted in s2's Browse→Party default-route change (older specs assume BASE_URL lands on Browse). **t5's classification (its packet, 'Classification of the 57 full-suite failures') is the reference list** — s4's retirement scope should delete or re-point these specs alongside their surfaces; until then, do NOT read full-suite red as regression."

**Consequence:** r0's "full Playwright suite green" SCs were unsatisfiable-on-faithful-execution (Step 7.5) — the corpus is already ~30% red. All e2e SCs below are corrected to the precise, satisfiable form: **(i)** KEEP-surface specs stay green (s3 drilldowns, s2 party-card/quick-peek, sessions, progression, programs, and FE-CAT's new catalog spec); **(ii)** each wave DELETES its cut-surface specs (shrinking the red set); **(iii)** no NEW failure is introduced beyond the documented pre-existing baseline in **t5's 57-failure classification** (the reference list every FE wave must consult before asserting red-vs-regression).

---

## Server-procedure decision (unchanged from r0; Critic-gated — brief output #3)
DEPRECATE-BY-REMOVAL: REMOVE `export.spawn`, `loadout.*`, `planning.list`, `connectivity.getGraph` (disk-verified zero v2 consumer). RETAIN `agent.get/save` + `skill.get/save` (ReviseSpecAction), `agent.list/skill.list/hook.list` (catalog list procs — **now with a confirmed live consumer: FE-CAT consumes `agent.list`**), all session/progression/program/roster procs, env.ts. Retain-set + connectivity-parser coupling are the Critic-critical review items. Net procedure set 24 → 18; DOCS-1 derives the count from post-BE-1 router.ts.

---

<task_decomposition task_id="prog-studio-v2-2026-07-s4-retirement" agent_count="7">
  <task_packets>

    <task_packet>
      <task_id>prog-studio-v2-2026-07-s4-retirement-FE-1</task_id>
      <assigned_to>frontend-engineer</assigned_to>
      <priority>HIGH</priority>
      <description>
NAV-SHELL CUTOVER (Wave 0). Remove the 9-tab BottomTabBar so the v2 SubmenuRail is the SOLE nav surface. Steps:
1. PRECONDITION (seam s2-to-s4-nav-shell): open `components/party/SubmenuRail.tsx` and confirm RAIL_ITEMS covers Roster(→party)/Sessions/Progression/Programs and that AppShell renders SubmenuRail. If the rail does NOT already cover all four KEEP routes, emit BLOCKED — do not delete BottomTabBar.
2. Delete `components/BottomTabBar.tsx`.
3. In `constants/navigation.ts`: grep every importer of `NAV_ITEMS` first (confirm BottomTabBar is the sole importer); then remove the `NAV_ITEMS` array + `NavItemDef` interface + now-unused lucide imports. RETAIN `RAIL_ITEMS` + `RailItemDef` byte-identical to HEAD.
4. In `AppShell.tsx`: remove the BottomTabBar import + render site; verify SubmenuRail remains the nav and the grid/layout still composes (build the client; note any layout regression in packet notes).
5. e2e (mechanical rule 2): BottomTabBar removal legitimately falsifies any assertion the 9-tab bar / its tabs exist. Grep `tests/e2e` for `BottomTabBar`, `role="tablist"`, `role="tab"`, tab labels, 9-tab counts. In `gander-studio-p1-fe-shell.spec.ts`, `layout-sidebar-removal.spec.ts`, and `prog-studio-v2-2026-07-s2-party-shell.spec.ts` UPDATE (do not delete) those assertions to the SubmenuRail reality. A spec whose ENTIRE purpose is the 9-tab bar is deleted; a spec also covering KEEP nav is updated. Cross-check t5's 57-failure classification so you distinguish a spec you falsified from a pre-existing-red spec.
DESIGN.md present at repo root — no new visual tokens (removal only); `design_system_source: DESIGN_MD`.
      </description>
      <success_criteria>
- `components/BottomTabBar.tsx` deleted; `grep -rn "BottomTabBar" packages/client/src` returns nothing.
- `NAV_ITEMS` removed; `grep -rn "NAV_ITEMS" packages/client/src` returns nothing; `RAIL_ITEMS` unchanged.
- SubmenuRail is the only nav; all 4 KEEP routes reachable via the rail in a running dev build (state in notes).
- `npm run lint` (tsc ×3) clean; `npm run build -w @gander-studio/client` passing.
- e2e: 9-tab surface-only specs removed, KEEP-nav specs updated; NO NEW failure vs. the t5 57-failure baseline; s3 drilldowns + s2 party specs still green; no red spec left for a later packet.
      </success_criteria>
      <context_files>
packages/client/src/components/BottomTabBar.tsx
packages/client/src/constants/navigation.ts
packages/client/src/AppShell.tsx
packages/client/src/components/party/SubmenuRail.tsx
packages/client/tests/e2e/gander-studio-p1-fe-shell.spec.ts
packages/client/tests/e2e/layout-sidebar-removal.spec.ts
packages/client/tests/e2e/prog-studio-v2-2026-07-s2-party-shell.spec.ts
DESIGN.md
      </context_files>
      <dependencies>none (first wave)</dependencies>
      <out_of_scope>
- Do NOT touch the AppMode union (ui-store.ts) or PAGE_MAP (ModeContent.tsx) — surface add/remove is FE-CAT/FE-2/3/4. The 6 cut surfaces remain compilable-but-nav-unreachable after this wave (intended interim state).
- Do NOT remove/edit FF7 tokens in globals.css (invariant: tokens canonical).
- Do NOT delete `prog-studio-v2-2026-07-s3-drilldowns.spec.ts` or s2 party-card/quick-peek assertions.
- Do NOT add rail collapse/expand (DEFERRED — human-approved 2026-07-10).
      </out_of_scope>
      <estimated_new_lines>0 net-new (deletion wave; a few spec-assertion edits)</estimated_new_lines>
      <output_expected>
        <tag>ui_packet</tag>
        <must_contain>
          <item>SubmenuRail 4-KEEP-route coverage confirmation (seam precondition)</item>
          <item>e2e specs deleted vs updated + the falsified assertion each update addresses + t5-baseline cross-check</item>
          <item>lint ×3 + client build result</item>
        </must_contain>
        <must_not_contain>
          <item>any edit to ui-store.ts AppMode union or ModeContent.tsx PAGE_MAP</item>
          <item>removed globals.css tokens</item>
        </must_not_contain>
        <success_signal>lint ×3 clean, build passing, grep BottomTabBar + grep NAV_ITEMS empty, KEEP specs green, no new red vs t5 baseline</success_signal>
      </output_expected>
    </task_packet>

    <task_packet>
      <task_id>prog-studio-v2-2026-07-s4-retirement-FE-2</task_id>
      <assigned_to>frontend-engineer</assigned_to>
      <priority>HIGH</priority>
      <description>
CUT-SURFACE DELETION (Wave 1) — COMPOSE (heaviest single surface: page + materia-canvas subtree + 2 stores + 5 e2e specs). One logical deletion unit bounded by the Compose surface. Steps:
1. Delete `pages/ComposePage.tsx`.
2. Delete stores `store/compose-store.ts` and `store/canvas-store.ts` — FIRST grep every importer of each; if any retained surface (party/agent-detail/catalog/sessions/progression/programs) imports them, emit BLOCKED. (Expected: only Compose.)
3. Delete Compose-only components (materia-canvas node/edge/orb, loadout panel). Grep each candidate's importers; delete only those with zero retained-surface importer. Enumerate every deleted file.
4. AppMode↔PAGE_MAP (compiler-exhaustive invariant): remove `'compose'` from the AppMode union in `store/ui-store.ts`; remove the `compose:` PAGE_MAP line + the `ComposePage` React.lazy import in `components/ModeContent.tsx`.
5. e2e: delete Compose-surface specs WITH the surface: `gander-studio-p1-compose-fe.spec.ts`, `gander-studio-p2-canvas-link-003a.spec.ts`, `materia-canvas-proximity.spec.ts`, `card-node-title-edit.spec.ts`, `loadout-list-panel.spec.ts`. Confirm each describe/title targets Compose/loadout-canvas before deleting; cross-check t5's 57-failure list.
Client refs to `trpc.loadout.*` vanish with ComposePage — un-blocking BE-1.
      </description>
      <success_criteria>
- ComposePage, compose-store, canvas-store, all Compose-only components deleted; `grep -rn "ComposePage\|compose-store\|canvas-store\|useComposeStore\|useCanvasStore" packages/client/src` empty.
- `'compose'` removed from AppMode union; no `compose` PAGE_MAP entry; no `trpc.loadout.` reference in client src.
- 5 named Compose specs deleted; no other spec references Compose.
- `npm run lint` (tsc ×3) clean; client build passing; no NEW e2e failure vs t5 baseline; KEEP specs green.
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
      </context_files>
      <dependencies>prog-studio-v2-2026-07-s4-retirement-FE-1</dependencies>
      <out_of_scope>
- Do NOT touch browse/edit/analyze stores — FE-5.
- Do NOT touch server code (loadout removal is BE-1).
- Do NOT remove other union members — only 'compose'.
- Do NOT touch FF7 tokens.
      </out_of_scope>
      <estimated_new_lines>0 net-new (deletion wave)</estimated_new_lines>
      <output_expected>
        <tag>ui_packet</tag>
        <must_contain>
          <item>every deleted file (page/stores/components/specs) with importer-scan justification</item>
          <item>lint ×3 + build + e2e results (t5-baseline cross-check)</item>
        </must_contain>
        <must_not_contain>
          <item>edits to browse/edit/analyze stores or non-Compose surfaces</item>
          <item>server-side edits</item>
        </must_not_contain>
        <success_signal>lint ×3 clean, build passing, compose greps empty, KEEP specs green</success_signal>
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
4. e2e: delete surface specs WITH the surface: `gander-studio-p1-export-fe.spec.ts`, `prog-studio-vision-s2-d1-export.spec.ts` (verify it targets the Export SURFACE, not a session export), `prog-studio-vision-s3-planning.spec.ts`. Confirm each describe/title; cross-check t5's 57-failure list.
Client refs to `trpc.export.spawn` + `trpc.planning.list` vanish — un-blocking BE-1.
CAUTION: `prog-studio-vision-s2-d2-edit-save.spec.ts` covers SESSION markdown save (KEEP) — do NOT delete it here or in FE-5.
      </description>
      <success_criteria>
- ExportPage + PlanningPage + exclusive components deleted; `grep -rn "ExportPage\|PlanningPage" packages/client/src` empty.
- `'export'`/`'planning'` removed from AppMode union; no export/planning PAGE_MAP entries; no `trpc.export.spawn`/`trpc.planning.list` in client src.
- The 3 named specs deleted; session-edit-save spec untouched and green.
- `npm run lint` (tsc ×3) clean; client build passing; no NEW e2e failure vs t5 baseline.
      </success_criteria>
      <context_files>
packages/client/src/pages/ExportPage.tsx
packages/client/src/pages/PlanningPage.tsx
packages/client/src/store/ui-store.ts
packages/client/src/components/ModeContent.tsx
packages/client/tests/e2e/gander-studio-p1-export-fe.spec.ts
packages/client/tests/e2e/prog-studio-vision-s2-d1-export.spec.ts
packages/client/tests/e2e/prog-studio-vision-s3-planning.spec.ts
      </context_files>
      <dependencies>prog-studio-v2-2026-07-s4-retirement-FE-2</dependencies>
      <out_of_scope>
- Do NOT touch browse/edit/graph surfaces or their stores — FE-5.
- Do NOT delete session-related specs (edit-save, session-buffer, timeline).
- Do NOT touch server code (export/planning removal is BE-1).
- Do NOT touch FF7 tokens.
      </out_of_scope>
      <estimated_new_lines>0 net-new (deletion wave)</estimated_new_lines>
      <output_expected>
        <tag>ui_packet</tag>
        <must_contain>
          <item>files deleted + importer-scan justification</item>
          <item>confirmation session-edit-save spec NOT touched</item>
          <item>lint ×3 + build + e2e results (t5-baseline cross-check)</item>
        </must_contain>
        <must_not_contain>
          <item>edits to browse/edit/graph surfaces</item>
          <item>server-side edits</item>
        </must_not_contain>
        <success_signal>lint ×3 clean, build passing, export/planning greps empty, session specs green</success_signal>
      </output_expected>
    </task_packet>

    <task_packet>
      <task_id>prog-studio-v2-2026-07-s4-retirement-FE-CAT</task_id>
      <assigned_to>frontend-engineer</assigned_to>
      <priority>HIGH</priority>
      <description>
NEW SURFACE — 13-ROLE CATALOG (honors s3 ratification #1: "Six-agent homescreen (13-role catalog entry → s4 scope)"; delivers "the CTA's true destination" per s3 AA line 207). This is ADDITIVE; the party homescreen stays 6-agent. Build the full-roster catalog surface that lists ALL roles, reached (in FE-5) via the re-pointed View-Full-Roster CTA.
1. DATA SOURCE (DRY, no new BE procedure — coordinator specified one FE packet): consume the EXISTING procedure that enumerates the full role set. `trpc.agent.list` (retained by BE-1) returns the full team parsed from GANDER_ROOT (ratified as the 13-role roster). If `roster.getParty` already returns ALL roles (not just the active 6), reuse it instead to avoid a second data path. Choose based on which existing procedure returns the full set; state the choice + why in the packet. Do NOT add a BE procedure; do NOT resurrect deleted BrowsePage components.
2. SURFACE: add a new AppMode member (RECOMMENDED id `'catalog'` — flag the name/mechanism for the Critic, see routing_notes) to `store/ui-store.ts`; add a matching PAGE_MAP entry + a React.lazy import (lazy-from-birth, matching the s3 pattern in ModeContent.tsx) in `components/ModeContent.tsx`; create `pages/RosterCatalogPage.tsx` (or the ratified-name equivalent) rendering every role from the data source as a card/list with first-class loading / empty / error states. Reuse party card / role-card patterns where the data shapes match (DRY); the catalog "retains the browse affordance" (ratification #2) — a browsable full-roster listing — but is a fresh lightweight surface, not the deleted BrowsePage.
3. COUNT IS DATA-DRIVEN: render every role the data source returns (ratified as 13). Do NOT hardcode the integer 13 in code or SC; if the source returns a different count, render what it returns and note the discrepancy.
4. Do NOT add the catalog to the rail (RAIL_ITEMS stays Roster→party per ratification #3). Do NOT re-point the CTA here (FE-5 owns that, after this surface exists). Do NOT alter the party 6-agent homescreen logic.
5. e2e (program invariant — Tier-2 spec per new surface): add a Tier-2 Playwright spec that navigates to the catalog mode directly (set activeMode, since the CTA isn't wired until FE-5) and asserts the full role set renders + the honest empty/error states. Keyboard-operable per accessibility_spec.
DESIGN.md present at repo root — reuse FF7 tokens, NO new tokens; `design_system_source: DESIGN_MD`.
      </description>
      <success_criteria>
- New AppMode member added (recommended `'catalog'`) with a PAGE_MAP entry + lazy import; `pages/RosterCatalogPage.tsx` exists and renders every role returned by the chosen existing data source (agent.list or getParty) with loading/empty/error states.
- The full role set (ratified 13) renders; the count is derived from data, not hardcoded (`grep -n "13" pages/RosterCatalogPage.tsx` shows no magic-number role count).
- Party homescreen unchanged (still 6-agent; `git diff` on party-home active-count logic is empty).
- Catalog NOT in RAIL_ITEMS; CTA NOT re-pointed here.
- A Tier-2 Playwright spec for the catalog surface exists and passes (navigates by mode directly); keyboard-operable.
- No new visual tokens (FF7 reuse); `npm run lint` (tsc ×3) clean; client build passing; no NEW failure vs t5 baseline; KEEP specs green.
      </success_criteria>
      <context_files>
packages/client/src/store/ui-store.ts
packages/client/src/components/ModeContent.tsx
packages/client/src/pages/PartyPage.tsx
packages/client/src/components/party/SubmenuRail.tsx
packages/client/src/hooks/ (existing data hooks — inspect for a reusable agent.list/getParty hook before writing a new one, DRY)
packages/shared/src/schemas.ts (Agent / PartyMember shapes for the role-card)
DESIGN.md
docs/SESSION-CHECKPOINT.md (§Human Ratifications — the ratified wording is the SC contract)
      </context_files>
      <dependencies>prog-studio-v2-2026-07-s4-retirement-FE-3</dependencies>
      <out_of_scope>
- Do NOT add a new BE tRPC procedure or Zod schema — consume an existing one (agent.list retained precisely for this).
- Do NOT resurrect or import deleted BrowsePage/useBrowseData/browse-store code (those are deleted in FE-5; the catalog is a fresh surface).
- Do NOT add the catalog to RAIL_ITEMS; do NOT re-point handleViewRoster (FE-5); do NOT change the party 6-agent homescreen.
- Do NOT invent an IA decision beyond the ratified outcome — if you believe a party-sub-view is better than a new mode, emit BLOCKED with rationale for the Critic rather than deciding unilaterally.
- Do NOT add new FF7/design tokens.
      </out_of_scope>
      <estimated_new_lines>~120 (one new page + card + mode wiring + Tier-2 spec). JUSTIFICATION for keeping whole: a single cohesive surface with one data source and the standard page+lazy-mode+spec pattern; splitting would fragment one surface across packets against the surface-bounding rule. If the page alone exceeds ~150 lines, the FE agent may BLOCK to split the role-card component from the page.</estimated_new_lines>
      <output_expected>
        <tag>ui_packet</tag>
        <must_contain>
          <item>the chosen data source (agent.list vs getParty) + why (DRY rationale)</item>
          <item>the AppMode id used + confirmation it is NOT added to the rail + party-home left 6-agent</item>
          <item>the new Tier-2 catalog spec path + pass result</item>
          <item>confirmation the role count is data-driven (no hardcoded 13)</item>
          <item>lint ×3 + build result</item>
        </must_contain>
        <must_not_contain>
          <item>a new BE procedure/schema</item>
          <item>imports of deleted browse code</item>
          <item>a RAIL_ITEMS edit or a handleViewRoster re-point</item>
          <item>new design tokens</item>
        </must_not_contain>
        <success_signal>catalog mode+page live, renders full role set from an existing procedure, Tier-2 spec green, party home unchanged, lint ×3 clean, build passing</success_signal>
      </output_expected>
    </task_packet>

    <task_packet>
      <task_id>prog-studio-v2-2026-07-s4-retirement-FE-4</task_id>
      <assigned_to>frontend-engineer</assigned_to>
      <priority>HIGH</priority>
      <description>
ABSORB-SURFACE DELETION (Wave 3) — BROWSE + GRAPH + EDIT, plus the ratified CTA re-point. This is the "CTA re-point target" packet (coordinator). HARD ORDER (absorption-before-cut): proceed ONLY because s3's absorption proof is green — CITE `prog-studio-v2-2026-07-s3-drilldowns.spec.ts` (green 8/8 today) before deleting. Steps:
1. Delete `pages/BrowsePage.tsx`, `pages/GraphPage.tsx`, `pages/EditPage.tsx`.
2. Delete `hooks/useBrowseData.ts` (Browse-only). Delete stores `store/browse-store.ts` + `store/edit-store.ts` after grepping importers — CONFIRM `components/detail/ReviseSpecAction.tsx` and `AgentDetailPage.tsx` do NOT import edit-store (ReviseSpecAction uses trpc directly). Investigate `store/analyzeStore.ts`: grep importers; delete only if its sole importers are Browse/Graph (being deleted); if any retained surface (incl. the new catalog) imports it, RETAIN + note. The grep decides — no assumption.
3. AppMode↔PAGE_MAP: remove `'browse'`, `'edit'`, `'graph'` from the AppMode union (`store/ui-store.ts`); remove the browse/edit/graph PAGE_MAP entries + the `GraphPage` lazy import in `components/ModeContent.tsx`.
4. RATIFIED CTA RE-POINT (s3 inheritance a + ratification #2 — "View-Full-Roster CTA retains browse affordance, re-point → s4 scope"). Removing `'browse'` from the union makes `PartyPage.tsx` ~L209 `setActiveMode('browse')` a hard compile error (TODO(s4-cut) marker). Work from CURRENT HEAD (AgentDetailPage/PartyPage amended 2026-07-10, commit 6aa859c — line numbers shifted). Re-point `handleViewRoster` to the catalog mode built in FE-CAT (the ratified "true destination"). Do NOT remove the CTA and do NOT invent a different destination — the ratification fixes it as the 13-role catalog. State the resolution in the packet.
5. Delete Browse/Graph/Edit-only components after importer-scan (RelationshipPanel + components/detail/* are KEEP — retained).
6. e2e: delete surface specs WITH the surface: `gander-studio-p1-browse-fe.spec.ts`, `gander-studio-p1-edit-fe.spec.ts`, `graph-page.spec.ts`. UPDATE (do not delete) any inherited assertion that the party "View Full Roster" CTA navigates to `'browse'` — this wave legitimately falsifies it (mechanical rule 2; the retained-CTA browse test is INTERIM(s4-cut) by definition). Grep the s2 party-shell spec + any CTA test and update the assertion to the catalog destination. Cross-check t5's 57-failure list.
7. VERIFY the s3 absorption spec + s2 party-card/quick-peek specs + FE-CAT's catalog spec stay GREEN.
      </description>
      <success_criteria>
- BrowsePage, GraphPage, EditPage, useBrowseData, browse-store, edit-store deleted; analyzeStore deleted-or-retained per its importer scan (state which); `grep -rn "BrowsePage\|GraphPage\|EditPage\|useBrowseData\|browse-store\|edit-store" packages/client/src` empty.
- `'browse'`/`'edit'`/`'graph'` removed from AppMode union; no browse/edit/graph PAGE_MAP entries; no `trpc.connectivity.getGraph` in client src.
- PartyPage compiles; `handleViewRoster` re-points to the FE-CAT catalog mode (the ratified true destination); `grep -rn "'browse'\|\"browse\"" packages/client/src` empty.
- s3 absorption e2e cited green + STILL green; s2 party specs + FE-CAT catalog spec green.
- Browse/Graph/Edit surface specs deleted; the CTA-navigation assertion updated to the catalog destination.
- `npm run lint` (tsc ×3) clean; client build passing; no NEW e2e failure vs t5 baseline.
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
DESIGN.md
      </context_files>
      <dependencies>prog-studio-v2-2026-07-s4-retirement-FE-CAT</dependencies>
      <out_of_scope>
- Do NOT delete/refactor `components/detail/*` KEEP components (ReviseSpecAction, RelationshipPanel, AgentDetail panels).
- Do NOT build/modify the catalog surface (FE-CAT owns it) — only re-point the CTA to its mode.
- Do NOT touch AgentDetailPage's statbox grid (commit 6aa859c) beyond what the compile-break fix requires (it should require none).
- Do NOT retire ROSTER_AGENT_NAME_BY_CODE / touch AgentDetailSchema (DEFERRED-V2S3-1 — human-approved deferral 2026-07-10).
- Do NOT touch FF7 tokens; do NOT touch server code.
      </out_of_scope>
      <estimated_new_lines>0-10 net-new (deletion wave; the CTA re-point is a one-line mode change)</estimated_new_lines>
      <output_expected>
        <tag>ui_packet</tag>
        <must_contain>
          <item>citation of s3 absorption spec green (absorption-before-cut)</item>
          <item>analyzeStore delete-or-retain decision with importer-scan evidence</item>
          <item>the handleViewRoster re-point to the catalog mode + PartyPage compiles</item>
          <item>the CTA-navigation e2e assertion update (browse → catalog)</item>
          <item>lint ×3 + build + e2e (s3/s2/catalog specs green, t5-baseline cross-check)</item>
        </must_contain>
        <must_not_contain>
          <item>deletion of any components/detail/* KEEP component</item>
          <item>modification of the catalog surface</item>
          <item>AgentDetailSchema / ROSTER_AGENT_NAME_BY_CODE edits</item>
          <item>CTA removal or a non-catalog destination</item>
        </must_not_contain>
        <success_signal>lint ×3 clean, build passing, browse/graph/edit greps empty, CTA lands on catalog, s3+s2+catalog specs green</success_signal>
      </output_expected>
    </task_packet>

    <task_packet>
      <task_id>prog-studio-v2-2026-07-s4-retirement-BE-1</task_id>
      <assigned_to>backend-engineer</assigned_to>
      <priority>HIGH</priority>
      <description>
SERVER-PROCEDURE RETIREMENT (per the PM decision above; Critic-gated). Remove the tRPC procedures whose CUT/absorbed client surfaces are deleted, plus their EXCLUSIVELY-used schemas/parsers/helpers. Runs AFTER all FE waves so no client `trpc.*` reference to a removed procedure survives to break the AppRouter type.
1. PRE-REMOVAL SCAN (SC-gating). For each removal candidate — `export.spawn`, `loadout.list/save/delete`, `planning.list`, `connectivity.getGraph` — grep every importer of its procedure, input/output Zod schema, parser, and helper (`sanitizeName`, `parsePlanningBacklog`, `ExportInputSchema`, `LoadoutSchema`, `ConnectivityGraphSchema`). Build a retain-set: anything still imported by a RETAINED procedure stays. CRITICAL couplings: (a) does `parsers/agent-detail.ts` (assembleAgentDetail) import the connectivity parser / `ConnectivityGraphSchema` for its relationship edges? If yes, RETAIN that parser/schema, remove only the `connectivity.getGraph` procedure. (b) `parseAllAgents/Skills/Hooks` are imported by `agent.get`/`skill.get`/roster AND by `agent.list` (retained — now a live FE-CAT consumer) — RETAIN.
2. In `router.ts`: remove `export.spawn` + `exportRouter`; `loadoutRouter` (list/save/delete); `planning.list` + `planningRouter`; `connectivity.getGraph` + `connectivityRouter` (only if scan confirms no retained importer of the procedure). Remove each from `appRouter` + drop now-unused top-level imports.
3. In `packages/shared/src/schemas.ts`: remove schemas EXCLUSIVELY used by removed procedures (LoadoutSchema, PlanningListInput/OutputSchema, ExportInputSchema; ConnectivityGraphSchema ONLY IF no retained importer). Keep any schema still imported elsewhere.
4. Delete `parsers/planning-parser.ts` + its `__tests__`. For `parsers/connectivity*`: retain if agent-detail imports it, else delete with tests.
5. RETAIN: `agent.list/get/save`, `skill.list/get/save`, `hook.list`, all `session.*`, `progression.getLedger`, `program.getDag`, `roster.getParty/getAgentDetail`, env.ts unchanged.
6. Run server vitest (`vitest run src/parsers/__tests__`) + tsc ×3 lint; both green.
Server decision flagged for the Critic gate — the retain-set + connectivity coupling are the review-critical items. NOTE: retaining `agent.list` is now load-bearing (FE-CAT consumes it) — do NOT remove it.
      </description>
      <success_criteria>
- Pre-removal scan documented per removal target (importers → retain-set).
- `export.spawn`, `loadout.*`, `planning.list`, `connectivity.getGraph` removed from `router.ts` + `appRouter`.
- Exclusively-used schemas/parsers/helpers removed; NO schema/parser still imported by a retained procedure removed (lint catches dangling imports).
- RETAINED intact: `agent.*` (incl. `agent.list` for FE-CAT), `skill.*`, `hook.list`, `session.*`, `progression.getLedger`, `program.getDag`, `roster.*`; ReviseSpecAction's `agent.get/save`+`skill.get/save` still resolve.
- `npm run lint` (tsc ×3) clean; server vitest green; client build passing (FE waves already removed client refs; FE-CAT's `agent.list` consumer resolves).
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
- Do NOT remove `agent.list/skill.list/hook.list` (retained; agent.list is a live FE-CAT consumer).
- Do NOT remove/edit env vars (LOADOUTS_DIR backs SESSIONS_EDITS_DIR default).
- Do NOT touch `parseAllAgents/Skills/Hooks`, roster/session/progression/program routers/parsers.
- Do NOT git commit (return a completion_packet; ORC commits post-audit).
      </out_of_scope>
      <output_expected>
        <tag>completion_packet</tag>
        <must_contain>
          <item>pre-removal scan table (target → importers → retain-set)</item>
          <item>connectivity-parser coupling finding (retained vs deleted + evidence)</item>
          <item>final retained-procedure list (for DOCS-1) — confirming agent.list retained</item>
          <item>lint ×3 + server vitest + client build results</item>
        </must_contain>
        <must_not_contain>
          <item>removal of any schema/parser imported by a retained procedure</item>
          <item>removal of agent.list/skill.list/hook.list</item>
          <item>env-var edits or an inline git commit</item>
        </must_not_contain>
        <success_signal>lint ×3 clean, server vitest green, client build passing, removed-procedure greps consistent with decision</success_signal>
      </output_expected>
    </task_packet>

    <task_packet>
      <task_id>prog-studio-v2-2026-07-s4-retirement-DOCS-1</task_id>
      <assigned_to>frontend-engineer</assigned_to>
      <priority>NORMAL</priority>
      <description>
DOCS TO v2 REALITY. Update the two project docs to reflect the post-retirement state. Runs LAST (after all code waves + BE-1). Single owner of both files.
1. `CLAUDE.md` (repo root):
   - **Surfaces table** — remove Browse/Compose/Edit/Export/Graph/Planning rows; retain Sessions/Progression/Programs; ADD Party (`party`, default, PartyPage), Agent Detail (`agent-detail`, AgentDetailPage), and Roster Catalog (the FE-CAT mode id, RosterCatalogPage — the 13-role catalog reached via the View-Full-Roster CTA). Verify each row against the actual PAGE_MAP in `components/ModeContent.tsx` at HEAD.
   - **Navigation line** — replace "BottomTabBar (role=tablist, 9 tabs…)" with the SubmenuRail reality (Roster→party / Sessions / Progression / Programs; agent-detail via party card; the 13-role catalog via the party View-Full-Roster CTA). Confirm against `constants/navigation.ts` RAIL_ITEMS + PartyPage handleViewRoster.
   - **tRPC procedures table + "22 procedures across 10 routers" heading** — rewrite to the ACTUAL post-BE-1 set. DERIVE the count + router list by grepping `t.procedure` and sub-routers in `packages/server/src/router.ts` at HEAD (do NOT hardcode from this brief). Remove deprecated rows (loadout.*, export.spawn, connectivity.getGraph, planning.list) consistent with BE-1's completion_packet.
   - **Architecture tree** — fix `pages/` (remove deleted; add PartyPage/AgentDetailPage/RosterCatalogPage/sessions/), `store/` (remove compose/canvas/browse/edit[/analyze if deleted]; correct the STALE "session-picker" name to the actual store files), `parsers/` (remove planning[/connectivity if deleted]).
   - **Known Issues bundle line** — the "~700KB" baseline is STALE (DEFERRED-V2S2-2). Re-measure from the FE-4/FE-CAT client build output and update, OR replace with the current gate status; state the source in the packet.
   - **Env table** — note EXPORT_BASE_DIR now unused/deprecated; keep LOADOUTS_DIR (backs SESSIONS_EDITS_DIR default).
2. `DESIGN.md` (repo root): append a Decision Record for the v2 IA — the 9→6 surface consolidation (party, agent-detail, roster-catalog, sessions, progression, programs), BottomTabBar retirement, SubmenuRail as sole nav, the 6-agent homescreen + 13-role catalog-via-CTA affordance. No new visual tokens (`design_system_source: DESIGN_MD`); structural/IA decision record only.
3. **Deferred-work ledger** — append the human-approved deferrals (see the Deferrals block below) to `docs/deferred-work.md` with the 2026-07-10 authorization citation, so REQVAL maps them as deferred-with-authorization. (Append-serialized: DOCS-1 is the sole writer of docs/deferred-work.md this sprint.)
      </description>
      <success_criteria>
- CLAUDE.md surfaces table lists exactly the v2 surfaces (Party, Agent Detail, Roster Catalog, Sessions, Progression, Programs) — no Compose/Export/Browse/Graph/Edit/Planning surface rows.
- Navigation description reflects SubmenuRail + catalog-via-CTA (no "9 tabs"/"BottomTabBar" as live nav).
- tRPC procedure table matches `router.ts` at HEAD; no export.spawn/loadout./connectivity.getGraph/planning.list rows; roster.getParty/getAgentDetail + agent.list present; counts derived from the file.
- Architecture tree store/page/parser lists match disk (RosterCatalogPage added; deleted entries gone; "session-picker" corrected).
- Bundle baseline updated with a stated source; EXPORT_BASE_DIR noted deprecated-unused.
- DESIGN.md carries a v2-IA decision record; no new token entries.
- `docs/deferred-work.md` has the 4 human-approved deferrals appended with the 2026-07-10 authorization line.
      </success_criteria>
      <context_files>
/home/jhber/projects/gander-studio-alpha/CLAUDE.md
/home/jhber/projects/gander-studio-alpha/DESIGN.md
/home/jhber/projects/gander-studio-alpha/docs/deferred-work.md
packages/server/src/router.ts
packages/client/src/components/ModeContent.tsx
packages/client/src/constants/navigation.ts
(BE-1 completion_packet — final retained-procedure list, provided by ORC)
      </context_files>
      <dependencies>prog-studio-v2-2026-07-s4-retirement-FE-1, prog-studio-v2-2026-07-s4-retirement-FE-2, prog-studio-v2-2026-07-s4-retirement-FE-3, prog-studio-v2-2026-07-s4-retirement-FE-CAT, prog-studio-v2-2026-07-s4-retirement-FE-4, prog-studio-v2-2026-07-s4-retirement-BE-1</dependencies>
      <out_of_scope>
- Do NOT edit code — docs only.
- Do NOT add new FF7/design tokens to DESIGN.md.
- Do NOT hardcode a procedure count — derive from router.ts at HEAD.
- Do NOT document the deferred items (rail collapse, 390px overflow, ROSTER_AGENT_NAME_BY_CODE, --mg row) as done — record them as human-approved deferrals in docs/deferred-work.md.
      </out_of_scope>
      <output_expected>
        <tag>completion_packet</tag>
        <must_contain>
          <item>updated surfaces table + navigation description + procedure table (as diffs or full sections)</item>
          <item>the source of the new bundle-size number</item>
          <item>the DESIGN.md v2-IA decision record text</item>
          <item>the 4 deferred-work.md entries with the 2026-07-10 authorization citation</item>
        </must_contain>
        <must_not_contain>
          <item>any code edit</item>
          <item>new design/FF7 tokens</item>
          <item>a hardcoded procedure count not derived from router.ts</item>
        </must_not_contain>
        <success_signal>CLAUDE.md + DESIGN.md reflect disk reality (incl. catalog surface); procedure table matches router.ts; deferrals recorded with authorization</success_signal>
      </output_expected>
    </task_packet>

  </task_packets>

  <dependency_order>
    FE-1 (nav shell) → FE-2 (Compose) → FE-3 (Export+Planning) → FE-CAT (13-role catalog surface — ADDITIVE, adds `'catalog'` mode) → FE-4 (Browse+Graph+Edit deletion + ratified CTA re-point to the catalog) → BE-1 (server procedure removal) → DOCS-1 (docs + deferred-work)
    All packets SERIAL — no parallelism. Rationale: FE-2/FE-3/FE-CAT/FE-4 all mutate the shared nav files ui-store.ts (AppMode union) + ModeContent.tsx (PAGE_MAP) — FE-CAT ADDS `'catalog'`, FE-4 REMOVES browse/edit/graph and re-points the CTA. FE-CAT MUST precede FE-4 so the catalog mode exists before FE-4 re-points handleViewRoster to it (else `setActiveMode('catalog')` is a compile error). FE-1 removes NAV_ITEMS first so FE-2/3/CAT/4 need not touch navigation.ts. BE-1 follows all FE waves (client trpc refs gone; agent.list now has the live FE-CAT consumer). DOCS-1 last. lint ×3 + client build green is a per-packet SC (invariant: green after EVERY wave).
  </dependency_order>

  <routing_notes>
    ## Amendment acknowledgements (coordinator scope decision 2026-07-10)
    - **13-role catalog ADDED** as FE-CAT, honoring s3 ratification #1 (verbatim re-verified in SESSION-CHECKPOINT §Human Ratifications + s3 AA lines 56/207). Party homescreen stays 6-agent; catalog lists all roles; reached via the View-Full-Roster CTA (re-pointed in FE-4). SCs written to the ratified OUTCOME.
    - **CATALOG IA AMBIGUITY — FLAGGED FOR CRITIC (not invented by PM):** the ratified wording fixes the landing target (the CTA → the 13-role catalog) but NOT (a) the IA mechanism [new top-level AppMode surface — RECOMMENDED, matches the AppMode/PAGE_MAP IA — vs. a party sub-view], nor (b) the mode-id name [RECOMMEND `'catalog'` to avoid collision with the rail's "Roster" → `'party'`; the ratification uses both "Roster" and "catalog" for adjacent concepts]. FE-CAT is instructed to BLOCK (not decide unilaterally) if it believes a sub-view is better. Critic: ratify the mechanism/name or send back.
    - **NEW GROUND FACT surfaced by the mandated re-verification (s3 AA line 208):** the legacy e2e corpus is ~30% red BY DESIGN (~55-57 pre-existing failures; t5's "57 full-suite failures" classification is the reference list). r0's "full suite green" SCs were UNSATISFIABLE (Step 7.5) and are CORRECTED across all FE packets to: KEEP-surface specs green + deleted-surface specs removed + no NEW failure vs. the t5 baseline. This is a fact-driven SC correction, not scope drift — every FE wave must consult the t5 classification before reading red as regression.

    ## Recurring-pattern preflight (Step 0.5 — carried from r0, re-affirmed)
    <recurring_pattern source="prog-studio-v2-2026-07-s3-drilldowns.md">plan-time-unverified-inherited-fact (RECURRING, 3rd form): PM quoted the s2 AA "both" under-count → CR#1 BLOCK. AVOIDED: every enumeration carries a same-sprint 2026-07-10 disk citation; the ratified catalog wording + the ~30%-red e2e fact were re-verified against SESSION-CHECKPOINT + the s3 AA on disk, not quoted from memory. Notably, this exact class (the CR#1 "THREE browse targets not two" miscount, seq 76) is why FE-4's CTA re-point works from CURRENT HEAD and the ~30%-red baseline is now an explicit SC input.</recurring_pattern>
    <recurring_pattern source="prog-studio-v2-2026-07-s3-drilldowns.md">primitive-behavioral-default-collision (RECURRING, 2nd behavioral): initialFocus resolution-timing. ACCEPTED-LOW-RISK: retirement + one additive catalog surface. FE-CAT's new page uses first-class loading/empty/error states (no async-initialFocus dialog); the only surviving primitives (ReviseSpecAction dialog, s2 Popover) are untouched. Reference pattern if FE-CAT adds any focus-managed control: FE#8 rem2 function-form initialFocus + post-mount effect.</recurring_pattern>
    <recurring_pattern source="prog-studio-v2-2026-07-s3-drilldowns.md">cross-spec-interim-assertion-unmarked / cross-spec invariant coupling (NEW class §6 G3): s2 spec encoded an interim nav state as timeless; s3 legitimately broke it. AVOIDED: FE-1 (9-tab assertions) and FE-4 (CTA→browse assertion) are EXPLICITLY authorized to update the inherited assertions they falsify, in the same packet; the s3 absorption spec + FE-CAT catalog spec must stay green.</recurring_pattern>
    <recurring_pattern source="prog-studio-v2-2026-07-s3-drilldowns.md">subagentstop-complete-miss (validator subclass, RECURRING 4th consecutive): ORC-side. ACKNOWLEDGED — ORC verify each COMPLETE event is logged; backfill inline (esp. REQVAL close-out).</recurring_pattern>
    <recurring_pattern source="prog-studio-v2-2026-07-s3-drilldowns.md">archivist-paraphrase-drift (RECURRING 4th sighting, 3rd mutation): AR-side. ACKNOWLEDGED — copy identifiers/defects/commit inventory VERBATIM (Glob-confirm). This plan's disk-cited enumerations give the AR verbatim source.</recurring_pattern>
    <recurring_pattern source="pm_preflight_checklist">OVERSCOPED: APPLIED with the deletion-wave-by-surface exemption. FE-1=nav-shell, FE-2=Compose (own packet — heaviest), FE-3=Export+Planning, FE-CAT=one new surface, FE-4=Browse+Graph+Edit+CTA, BE-1=server-retirement unit. Each FE agent licensed to BLOCK-for-split.</recurring_pattern>
    <recurring_pattern source="pm_preflight_checklist">DRY: FE-CAT reuses an EXISTING data procedure (agent.list/getParty) + existing card patterns rather than a new BE endpoint or resurrected browse code; FE-CAT context_files direct it to inspect existing hooks before writing a new one.</recurring_pattern>

    ## Shared-file serialization
    shared-mutation order: {ui-store.ts[AppMode union]: [FE-2, FE-3, FE-CAT(add), FE-4(remove+repoint)], ModeContent.tsx[PAGE_MAP]: [FE-2, FE-3, FE-CAT(add), FE-4(remove)], navigation.ts[NAV_ITEMS]: [FE-1], PartyPage.tsx[handleViewRoster]: [FE-4], docs/deferred-work.md: [DOCS-1 sole writer]}. Enforced by the strictly-serial dependency_order; each wave re-reads the shared file fresh from disk (post-prior-wave HEAD).

    ## prior_approved_tasks (sequential single-file context for the auditor)
    ui-store.ts, ModeContent.tsx, navigation.ts are each touched by multiple s4 waves and were last authored by s2/s3 (party AppMode, agent-detail mode, lazy PAGE_MAP imports, RAIL_ITEMS Roster→party, aria-current-at-home). The auditor should treat prior-wave/prior-sprint committed additions (incl. AgentDetailPage statbox grid commit 6aa859c, FE-CAT's newly-added `'catalog'` mode when auditing FE-4) as ALREADY-APPROVED, not out-of-scope modifications.

    ## Server-procedure decision (FLAGGED FOR CRITIC GATE — brief output #3)
    Deprecate-by-removal: REMOVE export.spawn/loadout.*/planning.list/connectivity.getGraph; RETAIN agent.get/save+skill.get/save (ReviseSpecAction), agent.list/skill.list/hook.list (agent.list now a live FE-CAT consumer — retention is load-bearing, not speculative), roster/session/progression/program, env.ts. Critic-critical: (1) connectivity-parser coupling in assembleAgentDetail (BE-1 scan-gated), (2) the retain-vs-remove list-procs call — now resolved toward RETAIN by FE-CAT's concrete consumption of agent.list.

    ## DESIGN.md status
    PRESENT at repo root. In every UI-touching packet (FE-1, FE-CAT, FE-4) + updated by DOCS-1. No new visual tokens (retirement + one additive surface reusing FF7 tokens) — design_system_source: DESIGN_MD. DOCS-1 appends an IA decision record only.

    ## Critic relevance / final gate
    Critic probes: (1) catalog IA mechanism/name ambiguity (ratify or send back); (2) server-procedure decision + connectivity coupling; (3) absorption-before-cut (FE-4 cites s3 green); (4) compiler-exhaustive AppMode↔PAGE_MAP per wave incl. FE-CAT add before FE-4 remove; (5) the ~30%-red e2e baseline correction (confirm the corrected SC form is satisfiable). Step 4.5 human browser walkthrough is the program's final pre-skein gate (ORC/human-owned). Push human-owned (guarded model).

    ## sc-precheck
    No Bash in the PM toolset — manual self-lint per Steps 7.5/7.8 written to `sc-precheck-report.json` (this dir), now covering FE-CAT (outcome-based + data-driven count, no hardcoded 13) and the e2e-red-baseline SC correction. Verdict PASS; no locked-value SCs. Recommend ORC/Critic run the mechanical script as backstop.
  </routing_notes>

  <risk_flags>
    - **Catalog IA ambiguity (mechanism + name):** the ratified wording fixes the CTA→catalog destination but not new-mode-vs-sub-view or the mode-id. FE-CAT recommended `'catalog'` + new AppMode, instructed to BLOCK rather than decide; Critic ratifies. If the Critic prefers a party sub-view, FE-CAT and FE-4's re-point both change — a re-plan, not a code tweak.
    - **~30% pre-existing e2e red (t5's 57-failure classification):** every FE wave must consult the t5 reference before asserting red-vs-regression; "full suite green" is NOT a valid SC this sprint (corrected). ORC should hand each FE wave the t5 57-failure list.
    - **analyzeStore.ts ownership unknown:** FE-4 grep-gated to delete-or-retain on evidence (now must also check the new catalog surface as a possible importer).
    - **connectivity-parser coupling:** whether assembleAgentDetail reuses the connectivity parser/schema for edges — BE-1's scan is the gate; removing a schema/parser a KEEP surface imports would break it.
    - **FE-CAT ↔ FE-4 ordering is load-bearing:** FE-CAT must land `'catalog'` before FE-4 re-points to it. If FE-CAT is BLOCKED on the IA ambiguity, FE-4 cannot proceed (its CTA has no valid destination) — ORC must resolve the Critic ratification before dispatching FE-4.
    - **AgentDetailPage HEAD drift (commit 6aa859c):** FE-4's compile-break fix + any detail-adjacent grep work from CURRENT HEAD, not s3-era lines.
    - **KEEP specs outlive their sprints:** s3 absorption + s2 party + FE-CAT catalog specs stay green; FE-1/FE-4 update (never weaken) the assertions they legitimately falsify.
    - **Base-plan portability:** all packets plain file edits; no Workflow-tool dependency.
  </risk_flags>

  <human_approved_deferrals date="2026-07-10" authorization="coordinator scope decision, this session — REQVAL maps as deferred-with-authorization, NOT missing">
    <deferral id="rail-collapse-expand" target="docs/deferred-work.md">Roster rail collapse/expand (HA-1, s2 inheritance) — rail ENHANCEMENT, not a retirement deliverable; s2 shipped the rail, collapse/expand is additive UX out of the retirement thesis.</deferral>
    <deferral id="DEFERRED-V2S2-1-390px-header" target="docs/deferred-work.md">390px header overflow (DEFERRED-V2S2-1) — pre-existing responsive bug; not a surface retirement. BottomTabBar removal (FE-1) may incidentally reduce header pressure, but the fix is a separate responsive pass.</deferral>
    <deferral id="DEFERRED-V2S3-1-roster-name-map" target="docs/deferred-work.md">Retire ROSTER_AGENT_NAME_BY_CODE via AgentDetailSchema extension (add agentName/specFile; unmapped codes degrade to honest no-revise fallback) — an ADDITIVE BE schema extension + FE refactor; folding a schema change into the terminal retirement sprint expands blast radius past the FE+docs framing. Recommend a dedicated follow-up sprint.</deferral>
    <deferral id="DEFERRED-V2S3-2-mg-contrast" target="docs/deferred-work.md">--mg-on---sfh contrast_pairs row (DEFERRED-V2S3-2) — conditional ("if ever used as text"); a next-design-pass item, no current text usage.</deferral>
  </human_approved_deferrals>
</task_decomposition>

---

## Verbatim Deliverable Audit (Step 7 — updated for amendment)

<verbatim_deliverable_audit>
  <phrase text="kick off s4"><addressed task="all — amended decomposition produced"/></phrase>
  <phrase text="retire the CUT surfaces (Compose, Export, Planning)"><addressed task="FE-2 (Compose), FE-3 (Export+Planning), BE-1 (their server procedures)"/></phrase>
  <phrase text="remove the absorbed v1 surfaces (Browse, Graph, Edit)"><addressed task="FE-4"/></phrase>
  <phrase text="now that s3's drill-downs carry their value"><addressed task="FE-4 (cites s3 absorption e2e green; absorption-before-cut hard order)"/></phrase>
  <phrase text="remove the 9-tab BottomTabBar"><addressed task="FE-1"/></phrase>
  <phrase text="in favor of the v2 rail"><addressed task="FE-1 (SubmenuRail sole nav)"/></phrase>
  <phrase text="prune dead stores/components/routes"><addressed task="FE-1, FE-2, FE-3, FE-4 (client), BE-1 (server)"/></phrase>
  <phrase text="update project docs (CLAUDE.md surfaces + tRPC tables, DESIGN.md) to v2 reality"><addressed task="DOCS-1"/></phrase>
  <phrase text="s3 inheritance (a) View-Full-Roster CTA re-point"><addressed task="FE-4 (re-points to the FE-CAT catalog — the ratified true destination)"/></phrase>
  <phrase text="s3 inheritance (b) Roster rail collapse/expand"><deferred reason="human-approved 2026-07-10; rail enhancement, → docs/deferred-work.md (DOCS-1)"/></phrase>
  <phrase text="s3 inheritance (c) 390px header overflow"><deferred reason="human-approved 2026-07-10; DEFERRED-V2S2-1 pre-existing responsive bug, → docs/deferred-work.md (DOCS-1)"/></phrase>
  <phrase text="s3 inheritance (d) stale CLAUDE.md bundle baseline"><addressed task="DOCS-1"/></phrase>
  <phrase text="s3 inheritance (e) 13-role catalog entry"><addressed task="FE-CAT (delivers the full-roster catalog surface) + FE-4 (CTA lands there); ratification #1 honored"/></phrase>
  <phrase text="DEFERRED-V2S3-1 (retire ROSTER_AGENT_NAME_BY_CODE via schema extension)"><deferred reason="human-approved 2026-07-10; additive schema extension, → docs/deferred-work.md (DOCS-1)"/></phrase>
  <phrase text="DEFERRED-V2S3-2 (--mg on --sfh contrast_pairs row)"><deferred reason="human-approved 2026-07-10; conditional design-pass item, → docs/deferred-work.md (DOCS-1)"/></phrase>
  <phrase text="export/loadout server procedures — retained vs deprecated (PM decides, Critic gate)"><addressed task="BE-1 (deprecate-by-removal; retain-set incl. agent.list for FE-CAT; connectivity coupling flagged for Critic)"/></phrase>
</verbatim_deliverable_audit>

---

## Expectation Manifest (updated)

<expectation_manifest>
  <sprint_id>prog-studio-v2-2026-07-s4-retirement</sprint_id>
  <generated>2026-07-10 (amend-1)</generated>
  <assignments>
    <assignment>
      <task_id>prog-studio-v2-2026-07-s4-retirement-FE-1</task_id>
      <agent>FE#1</agent>
      <expected_tag>ui_packet</expected_tag>
      <expected_file>.claude/tasks/outputs/prog-studio-v2-2026-07-s4-retirement-FE-1-{ts}.md</expected_file>
      <blocks>FE-2, FE-3, FE-CAT, FE-4, DOCS-1</blocks>
      <receipt_check>
        <item>SubmenuRail sole-nav coverage confirmed (seam precondition)</item>
        <item>grep BottomTabBar + grep NAV_ITEMS empty</item>
        <item>lint ×3 + build passing; KEEP specs green; no new red vs t5 baseline</item>
        <item>no ui-store/ModeContent edits this wave</item>
      </receipt_check>
    </assignment>
    <assignment>
      <task_id>prog-studio-v2-2026-07-s4-retirement-FE-2</task_id>
      <agent>FE#2</agent>
      <expected_tag>ui_packet</expected_tag>
      <expected_file>.claude/tasks/outputs/prog-studio-v2-2026-07-s4-retirement-FE-2-{ts}.md</expected_file>
      <blocks>FE-3, FE-CAT, FE-4, BE-1, DOCS-1</blocks>
      <receipt_check>
        <item>deletion list + importer-scan justification</item>
        <item>'compose' removed from union; PAGE_MAP compose gone; no trpc.loadout ref</item>
        <item>lint ×3 + build; KEEP specs green</item>
      </receipt_check>
    </assignment>
    <assignment>
      <task_id>prog-studio-v2-2026-07-s4-retirement-FE-3</task_id>
      <agent>FE#3</agent>
      <expected_tag>ui_packet</expected_tag>
      <expected_file>.claude/tasks/outputs/prog-studio-v2-2026-07-s4-retirement-FE-3-{ts}.md</expected_file>
      <blocks>FE-CAT, FE-4, BE-1, DOCS-1</blocks>
      <receipt_check>
        <item>ExportPage+PlanningPage deleted; 'export'/'planning' removed from union/PAGE_MAP</item>
        <item>session-edit-save spec NOT touched</item>
        <item>no trpc.export.spawn/planning.list; lint ×3 + build; KEEP specs green</item>
      </receipt_check>
    </assignment>
    <assignment>
      <task_id>prog-studio-v2-2026-07-s4-retirement-FE-CAT</task_id>
      <agent>FE#4</agent>
      <expected_tag>ui_packet</expected_tag>
      <expected_file>.claude/tasks/outputs/prog-studio-v2-2026-07-s4-retirement-FE-CAT-{ts}.md</expected_file>
      <blocks>FE-4 (CTA re-point target), DOCS-1</blocks>
      <receipt_check>
        <item>chosen data source (agent.list/getParty) + DRY rationale; no new BE procedure</item>
        <item>new AppMode id + NOT in rail + party home left 6-agent</item>
        <item>catalog renders full role set; count data-driven (no hardcoded 13)</item>
        <item>new Tier-2 catalog spec present + green; keyboard-operable</item>
        <item>no new tokens; lint ×3 + build passing</item>
        <item>OR a BLOCKED on the IA mechanism/name ambiguity (→ Critic ratifies before FE-4)</item>
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
        <item>analyzeStore delete-or-retain decision (incl. catalog as possible importer)</item>
        <item>handleViewRoster re-pointed to the catalog mode; PartyPage compiles; no 'browse' literal remains</item>
        <item>components/detail/* + catalog untouched; no AgentDetailSchema edit</item>
        <item>CTA e2e assertion updated browse→catalog; lint ×3 + build; s3/s2/catalog specs green</item>
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
        <item>connectivity-parser coupling finding + evidence</item>
        <item>final retained-procedure list; agent.list CONFIRMED retained (FE-CAT consumer)</item>
        <item>ReviseSpecAction's agent.get/save + skill.get/save resolve</item>
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
        <item>surfaces table = 6 v2 surfaces incl. Roster Catalog; nav = SubmenuRail + catalog-via-CTA</item>
        <item>procedure table matches router.ts at HEAD (derived); agent.list present, deprecated procs gone</item>
        <item>architecture tree matches disk (RosterCatalogPage added; session-picker corrected); bundle baseline updated w/ source</item>
        <item>DESIGN.md v2-IA decision record; no new tokens; no code edits</item>
        <item>docs/deferred-work.md has the 4 human-approved deferrals with 2026-07-10 authorization</item>
      </receipt_check>
    </assignment>
  </assignments>
</expectation_manifest>

---

## COMPLETE (amend-1)
Primary output: `.claude/tasks/outputs/prog-studio-v2-2026-07-s4-retirement-amend1-PM-1783710354.md` (single plan of record; supersedes r0).
Adjacent: `.claude/tasks/outputs/sc-precheck-report.json`.
7 task_packets inline (FE-1, FE-2, FE-3, FE-CAT, FE-4, BE-1, DOCS-1) — no-stub self-check PASS (7 `<task_packet>` == 7 declared, agent_count=7). Amendment reads: 2 (SESSION-CHECKPOINT §Human Ratifications + s3 AA — coordinator-mandated ratified-wording re-verification). No consultation needed.
