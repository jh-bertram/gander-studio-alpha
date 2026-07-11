# FEP#1 — Jidoka Plan-Only Round — prog-studio-v2-2026-07-s4-retirement

Covers FE-1, FE-2, FE-3, FE-CAT, FE-4, DOCS-1 (rev1 plan of record + amend-2). Plan-only: no files
modified this turn except this output file. Every claim below is anchored to a disk read performed
this turn (2026-07-10).

## Headline finding

The serial deletion chain (FE-1→FE-2→FE-3→FE-CAT→FE-4) has **two disk-confirmed compile-integrity
breaks** and **one large, previously-unenumerated e2e-spec blast radius** that will produce NEW
Playwright red not attributable to any wave's own SC. Both compile breaks are transitive-import
sequencing errors: a file scoped for deletion in an early wave is still imported by a file not
scheduled for deletion until a later wave. Details in `conflicts_detected` and per-task
`proposed_changes` below. None of these were visible from the packet text alone — all required a
live grep-importer pass against HEAD, which is exactly this planning round's purpose.

<plan_packet>
  <task_id>prog-studio-v2-2026-07-s4-retirement</task_id>
  <agent>FEP#1</agent>
  <mode>plan</mode>
  <covers>FE-1, FE-2, FE-3, FE-CAT, FE-4, DOCS-1</covers>

  <files_read>
    <file path="packages/client/src/AppShell.tsx" note="full"/>
    <file path="packages/client/src/globals.css" note="full"/>
    <file path="packages/client/src/pages/PartyPage.tsx" note="full"/>
    <file path="packages/client/src/components/party/SubmenuRail.tsx" note="full"/>
    <file path="packages/client/src/components/BottomTabBar.tsx" note="full"/>
    <file path="packages/client/src/constants/navigation.ts" note="full"/>
    <file path="docs/v2-vision/v2-design-spec.md" note="partial: lines 1-100, 290-334 (component_hierarchy, layout/responsive, accessibility_spec)"/>
    <file path="packages/client/tests/e2e/gander-studio-p1-fe-shell.spec.ts" note="full"/>
    <file path="packages/client/tests/e2e/layout-sidebar-removal.spec.ts" note="full"/>
    <file path="packages/client/tests/e2e/prog-studio-v2-2026-07-s2-party-shell.spec.ts" note="full"/>
    <file path=".claude/tasks/outputs/prog-studio-v2-2026-07-s3-drilldowns-t5-FE-1783490746.md" note="full"/>
    <file path="DESIGN.md" note="partial: lines 380-428 (Decision Record D tail, globals.css single-writer contract)"/>
    <file path="packages/client/src/pages/ComposePage.tsx" note="partial: head/imports"/>
    <file path="packages/client/src/store/compose-store.ts" note="partial: head/types"/>
    <file path="packages/client/src/store/canvas-store.ts" note="partial: head/imports"/>
    <file path="packages/client/src/store/ui-store.ts" note="full"/>
    <file path="packages/client/src/components/ModeContent.tsx" note="full"/>
    <file path="packages/client/tests/e2e/gander-studio-p2-canvas-link-003a.spec.ts" note="grep-verified (importer/reference scan only)"/>
    <file path="packages/client/tests/e2e/materia-canvas-proximity.spec.ts" note="grep-verified"/>
    <file path="packages/client/tests/e2e/card-node-title-edit.spec.ts" note="grep-verified"/>
    <file path="packages/client/tests/e2e/loadout-list-panel.spec.ts" note="grep-verified"/>
    <file path="packages/client/src/tests/compose/compose-connections-persist.spec.ts" note="partial: head + import line"/>
    <file path="packages/client/src/tests/compose/materia-canvas.spec.ts" note="partial: head + import line"/>
    <file path="packages/client/src/pages/ExportPage.tsx" note="full"/>
    <file path="packages/client/src/pages/PlanningPage.tsx" note="partial: head/imports"/>
    <file path="packages/client/tests/e2e/gander-studio-p1-export-fe.spec.ts" note="grep-verified"/>
    <file path="packages/client/tests/e2e/prog-studio-vision-s2-d1-export.spec.ts" note="partial: docstring + nav helper"/>
    <file path="packages/client/tests/e2e/prog-studio-vision-s3-planning.spec.ts" note="grep-verified"/>
    <file path="packages/client/src/hooks/useParty.ts" note="full"/>
    <file path="packages/client/src/components/party/PartyMemberCard.tsx" note="full"/>
    <file path="packages/shared/src/schemas.ts" note="partial: grep for PartyMemberSchema/PartyStatsSchema definitions"/>
    <file path="docs/SESSION-CHECKPOINT.md" note="partial: grep for party/catalog/roster ratification lines"/>
    <file path="packages/client/src/pages/BrowsePage.tsx" note="partial: head/imports"/>
    <file path="packages/client/src/pages/GraphPage.tsx" note="partial: head/imports"/>
    <file path="packages/client/src/pages/EditPage.tsx" note="partial: head/imports"/>
    <file path="packages/client/src/hooks/useBrowseData.ts" note="grep-verified (importer scan)"/>
    <file path="packages/client/src/store/browse-store.ts" note="grep-verified (importer scan)"/>
    <file path="packages/client/src/store/edit-store.ts" note="grep-verified (importer scan)"/>
    <file path="packages/client/src/store/analyzeStore.ts" note="grep-verified (importer scan) — RESOLVED: retain, see conflicts_detected"/>
    <file path="packages/client/src/components/detail/ReviseSpecAction.tsx" note="grep-verified (edit-store non-importer confirmation)"/>
    <file path="packages/client/src/components/detail/RelationshipPanel.tsx" note="grep-verified (edit-store non-importer confirmation)"/>
    <file path="packages/client/tests/e2e/gander-studio-p1-browse-fe.spec.ts" note="grep-verified"/>
    <file path="packages/client/tests/e2e/gander-studio-p1-edit-fe.spec.ts" note="grep-verified"/>
    <file path="packages/client/tests/e2e/graph-page.spec.ts" note="grep-verified + nav-pattern grep"/>
    <file path="packages/client/tests/e2e/prog-studio-v2-2026-07-s3-drilldowns.spec.ts" note="grep-verified (existence/absorption citation)"/>
    <file path="CLAUDE.md" note="full (repo root)"/>
    <file path="docs/deferred-work.md" note="partial: head, 3 sprint entries, append-pattern confirmation"/>
    <file path="packages/server/src/router.ts" note="partial: router-const grep + loadout/export/connectivity/planning line grep"/>
    <file path=".claude/tasks/outputs/prog-studio-v2-2026-07-s4-retirement-rev1-PM-1783712130.md" note="full"/>
    <file path=".claude/tasks/outputs/prog-studio-v2-2026-07-s4-retirement-amend2-PM-1783713201.md" note="full"/>
    <file path="packages/client/src/constants/agent-roles.ts" note="full (short file) — comment-only canvas-store reference, resolved false-positive"/>
    <file path="packages/client/src/constants/browse.ts" note="full — cross-surface AGENT_MATERIA/DEFAULT_MATERIA export, required-retain finding"/>
    <file path="packages/client/src/components/sessions/AgentTimeline.tsx" note="partial: import line grep — constants/browse dependency"/>
    <file path="packages/client/src/hooks/useLinkSound.ts" note="partial: head/imports — constants/canvas.ts dependency confirmed"/>
    <file path="packages/client/src/constants/canvas.ts" note="grep-verified (importer scan)"/>
    <file path="packages/client/tests/e2e/prog-studio-sessions-2026-05-s2-list-edit-fe.spec.ts" note="partial: nav helper + lines 330-380 (t6b smoke-regression sub-tests)"/>
    <file path="packages/client/tests/e2e/prog-studio-vision-s2-d5-confirm.spec.ts" note="partial: docstring + nav helper"/>
    <file path="packages/client/tests/e2e/progression.spec.ts" note="partial: docstring + nav pattern"/>
    <file path="packages/client/tests/e2e/prog-studio-vision-s3-program-dag.spec.ts" note="partial: docstring + nav pattern"/>
    <file path="packages/client/tests/e2e/prog-studio-vision-s4-render-loop.spec.ts" note="partial: docstring + surface list"/>
    <file path="packages/client/tests/e2e/prog-studio-vision-s4-legibility.spec.ts" note="grep-verified (nav-pattern grep)"/>
    <file path="packages/client/tests/e2e/prog-studio-vision-s4-reduced-motion.spec.ts" note="grep-verified"/>
    <file path="packages/client/tests/e2e/prog-studio-vision-s2-d2-edit-save.spec.ts" note="partial: docstring + head 45 lines — MISIDENTIFICATION finding"/>
    <file path="packages/client/tests/e2e/prog-studio-vision-s2-d3-session-buffer.spec.ts" note="partial: docstring + nav helper"/>
    <file path="packages/client/tests/e2e/prog-studio-vision-s2-d4-prose-slug.spec.ts" note="partial: nav helper grep"/>
    <file path="packages/client/tests/e2e/prog-studio-vision-2026-06-s5-reconcile.spec.ts" note="grep-verified (nav-pattern grep, resolved as materia-canvas-testid based, not role=tab)"/>
    <file path="packages/client/src/components/compose/CardNode.tsx" note="grep-verified (importer scan target)"/>
    <file path="packages/client/src/components/compose/MateriaNode.tsx" note="grep-verified (importer scan target)"/>
    <file path="packages/client/src/components/compose/handle-style.ts" note="grep-verified (existence via directory listing)"/>
    <file path="packages/client/src/constants/compose.ts" note="grep-verified (importer scan)"/>
    <file path="packages/client/src/constants/export.ts" note="grep-verified (importer scan)"/>
    <file path="packages/client/src/constants/graph.ts" note="grep-verified (importer scan)"/>
    <file path="packages/client/src/constants/edit.ts" note="grep-verified (importer scan)"/>
    <file path="packages/client/src/components/browse/AgentCard.tsx" note="grep-verified (importer scan)"/>
    <file path="packages/client/src/components/browse/DrilldownPanel.tsx" note="grep-verified (importer scan)"/>
    <file path="packages/client/src/components/browse/FilterBar.tsx" note="grep-verified (importer scan)"/>
    <file path="packages/client/src/components/browse/HookCard.tsx" note="grep-verified (importer scan)"/>
    <file path="packages/client/src/components/browse/SkeletonCard.tsx" note="grep-verified (importer scan)"/>
    <file path="packages/client/src/components/browse/SkillCard.tsx" note="grep-verified (importer scan)"/>
    <file path="packages/client/src/components/graph/FilterSidebar.tsx" note="grep-verified (importer scan)"/>
    <file path="packages/client/src/components/graph/GraphNode.tsx" note="grep-verified (importer scan)"/>
    <file path="packages/client/src/components/edit/TagInput.tsx" note="grep-verified (importer scan)"/>
    <file path="packages/client/playwright.config.ts" note="full (confirms testMatch includes src/tests/compose/**, tsconfig.json include=['src'] scoping consequence)"/>
    <file path="packages/client/tsconfig.json" note="full"/>
  </files_read>

  <proposed_changes>

    <!-- ================================================================ -->
    <!-- FE-1 — nav-shell re-architecture -->
    <!-- ================================================================ -->

    <change file="packages/client/src/AppShell.tsx">
      <action>modify</action>
      <summary>Render `&lt;SubmenuRail/&gt;` globally alongside Header/ModeContent/BottomTabBar so the rail is present on every surface, not just PartyPage.</summary>
      <estimated_lines_added>3-6</estimated_lines_added>
      <estimated_lines_removed>0</estimated_lines_removed>
      <edit_plan>
        <intent>Discharge the PartyPage.tsx:26-29 "s4 lifts it" hoist obligation.</intent>
        <expected_diff_shape>Add `import SubmenuRail from './components/party/SubmenuRail'`; insert `&lt;SubmenuRail/&gt;` between Header and ModeContent (or wrapped in a rail-area div) inside the `.app-shell` div.</expected_diff_shape>
        <out_of_scope_check>Does not touch AppMode union or PAGE_MAP — compliant. Does not implement collapse/expand — compliant (fixed 240px only).</out_of_scope_check>
      </edit_plan>
    </change>

    <change file="packages/client/src/globals.css">
      <action>modify</action>
      <summary>Re-template `.app-shell` (lines 91-97) from `"hd" "mn"` single-column to a 2-column grid with a new rail area, and gate the rail column to md/lg only (rail hidden, single-column at &lt;640px).</summary>
      <estimated_lines_added>8-15</estimated_lines_added>
      <estimated_lines_removed>2</estimated_lines_removed>
      <edit_plan>
        <intent>Give the hoisted rail a grid area without breaking Header's `gridArea:'hd'` or ModeContent's `gridArea:'mn'` (both inline, confirmed at AppShell child level, both area names must persist unchanged).</intent>
        <expected_diff_shape>Base `.app-shell` grid-template-areas stays "hd" "mn" (mobile-first, &lt;640px, no rail column); an `@media (min-width: 640px)` block (matches DESIGN.md 640px breakpoint already used at line 120) adds `grid-template-columns` with a fixed rail track and `grid-template-areas: "hd hd" "rl mn"`; the rail wrapper gets `gridArea: 'rl'` only in that media context (or is CSS-hidden below 640px via a matching class, see BottomTabBar.tsx conflict below).</expected_diff_shape>
        <out_of_scope_check>No FF7 token removal/edit — compliant. No new breakpoint value — reuses existing 640px (globals.css:120) — compliant.</out_of_scope_check>
      </edit_plan>
    </change>

    <change file="packages/client/src/pages/PartyPage.tsx">
      <action>modify</action>
      <summary>Remove the page-local `SubmenuRail` import and its `hidden lg:flex` wrapper (lines 6, 222-224) and reconcile the stale plan-R-3 comment (lines 26-29) now that the rail is hoisted globally.</summary>
      <estimated_lines_added>1-2</estimated_lines_added>
      <estimated_lines_removed>6-8</estimated_lines_removed>
      <edit_plan>
        <intent>Prevent double-render of the rail (once globally in AppShell, once page-locally in PartyPage).</intent>
        <expected_diff_shape>Delete `import SubmenuRail from '../components/party/SubmenuRail'`; delete the `&lt;div className="hidden lg:flex"...&gt;&lt;SubmenuRail/&gt;&lt;/div&gt;` wrapper, letting the content column take the full flex-1 width; rewrite the comment block to state the rail is now global (AppShell.tsx), not page-local.</expected_diff_shape>
        <out_of_scope_check>Does not touch the party-member rendering grid, PARTY_GRID_DISPLAY_CAP, or add the persistent CTA (FE-CAT's job) — compliant.</out_of_scope_check>
      </edit_plan>
    </change>

    <change file="packages/client/src/components/party/SubmenuRail.tsx">
      <action>modify</action>
      <summary>Amend-2 A2: change `aria-label` from &quot;Party screen submenus&quot; to &quot;Main navigation&quot; (line 31) — the semantically-correct label now that the rail is the app's global primary nav.</summary>
      <estimated_lines_added>0</estimated_lines_added>
      <estimated_lines_removed>0</estimated_lines_removed>
      <edit_plan>
        <intent>Fix the a11y mislabel the Critic caught in rev1-CR (a global primary nav must not identify itself as a page-local submenu).</intent>
        <expected_diff_shape>Single string literal change on line 31; `role="navigation"` unchanged.</expected_diff_shape>
        <out_of_scope_check>Amend-2-authorized, in-scope.</out_of_scope_check>
      </edit_plan>
    </change>

    <change file="packages/client/src/components/BottomTabBar.tsx">
      <action>modify</action>
      <summary>Repurpose to render `RAIL_ITEMS` (not `NAV_ITEMS`) and gate visibility to &lt;640px only, so it becomes the spec-ratified mobile fold of the rail rather than the always-present 9-tab v1 bar.</summary>
      <estimated_lines_added>4-8</estimated_lines_added>
      <estimated_lines_removed>2-3</estimated_lines_removed>
      <edit_plan>
        <intent>Deliver v2-design-spec.md &lt;responsive&gt; sm breakpoint (line 88) — "reusing the app's current bottom-tab pattern — no new nav mechanism" — without inventing a second component.</intent>
        <expected_diff_shape>Swap `NAV_ITEMS` import/map for `RAIL_ITEMS`; wrap the fixed-position div in a `md:hidden` (or equivalent &lt;640px-only) class; keep `role="tablist"` / `aria-label="Main navigation"` / `role="tab"` per-item unchanged (already correctly labeled — no change needed there, confirmed at BottomTabBar.tsx:10).</expected_diff_shape>
        <out_of_scope_check>Does not add a new nav mechanism — reuses the existing component — compliant. DOM-order note: SubmenuRail must be mounted before BottomTabBar in AppShell.tsx so `text=` locators' `.first()` resolves to the visible element at each breakpoint (see conflicts_detected).</out_of_scope_check>
      </edit_plan>
    </change>

    <change file="packages/client/src/constants/navigation.ts">
      <action>modify</action>
      <summary>Remove `NAV_ITEMS` and `NavItemDef` (lines 4-20); keep `RAIL_ITEMS`/`RailItemDef` byte-identical (lines 22-37).</summary>
      <estimated_lines_added>0</estimated_lines_added>
      <estimated_lines_removed>17</estimated_lines_removed>
      <edit_plan>
        <intent>Retire the 9-tab v1 configuration per the sprint's literal directive.</intent>
        <expected_diff_shape>Delete the `NavItemDef` interface and `NAV_ITEMS` array; no change to `RailItemDef`/`RAIL_ITEMS`.</expected_diff_shape>
        <out_of_scope_check>Compliant — RAIL_ITEMS untouched as required.</out_of_scope_check>
      </edit_plan>
    </change>

    <change file="packages/client/tests/e2e/gander-studio-p1-fe-shell.spec.ts">
      <action>modify</action>
      <summary>Update role="tab"/nav-index assertions to the global-rail reality; file is pre-existing RED in the t5 baseline (default-route Browse-to-Party change) and additionally targets Compose/Edit/Export testids that FE-2/FE-3/FE-4 delete later with no owning packet — recommend the Critic authorize full deletion instead of partial update (see assumptions_requiring_verification).</summary>
      <estimated_lines_added>n/a (spec)</estimated_lines_added>
      <estimated_lines_removed>n/a (spec)</estimated_lines_removed>
      <edit_plan>
        <intent>Per PM's explicit instruction and mechanical rule 2.</intent>
        <expected_diff_shape>Either delete the file (recommended, pending Critic sign-off) or rewrite `[role="tab"]` selectors to target the rail/mobile-fold and change the default-mode assertion from Browse to Party.</expected_diff_shape>
        <out_of_scope_check>PM explicitly named this file for update, in-scope.</out_of_scope_check>
      </edit_plan>
    </change>

    <change file="packages/client/tests/e2e/layout-sidebar-removal.spec.ts">
      <action>modify</action>
      <summary>Test 2 ("app-shell is single-column and BottomTabBar present at 1200px") is legitimately falsified twice over: the grid is no longer single-column, and the tablist is no longer visible at 1200px (desktop shows the rail, not the fold) — rewrite to assert rail visibility at 1200px instead of tablist.</summary>
      <estimated_lines_added>n/a (spec)</estimated_lines_added>
      <estimated_lines_removed>n/a (spec)</estimated_lines_removed>
      <edit_plan>
        <intent>Mechanical rule 2 — FE-1 legitimately falsifies this assertion.</intent>
        <expected_diff_shape>Test 2 rewritten to check `[role="navigation"]`/rail visible at 1200px (not tablist) and grid-template-columns now DOES contain a rail track. Test 3 (390px, tablist + padding-bottom&gt;=56) likely survives unchanged since the mobile fold still renders `role="tablist"` at that width.</expected_diff_shape>
        <out_of_scope_check>PM explicitly named this file, in-scope.</out_of_scope_check>
      </edit_plan>
    </change>

    <change file="packages/client/tests/e2e/prog-studio-v2-2026-07-s2-party-shell.spec.ts">
      <action>modify</action>
      <summary>Update `getRailNav()` helper's accessible name to &quot;Main navigation&quot; (amend-2, cascades correctly to ~8 dependent tests via the shared helper); rewrite the &quot;no regression: BottomTabBar renders 9 tabs&quot; test (L436-454) to set a &lt;640px viewport and assert 4 tabs (RAIL_ITEMS length), not 9, at desktop-default viewport where it currently and incorrectly asserts visibility.</summary>
      <estimated_lines_added>n/a (spec)</estimated_lines_added>
      <estimated_lines_removed>n/a (spec)</estimated_lines_removed>
      <edit_plan>
        <intent>Amend-2 A2 SC + mechanical rule 2 (FE-1 legitimately falsifies the 9-tab-always-visible assumption).</intent>
        <expected_diff_shape>One-line change to `getRailNav`'s `name` param (cascades); the 9-tabs test gets `page.setViewportSize` added, count assertion 9→4, and its title updated to reflect the mobile-fold framing. Tests at L491-520 (desktop rail visible / mobile rail hidden + tablist visible) should already hold once the aria-label and BottomTabBar-repurpose changes land — verify, do not assume.</expected_diff_shape>
        <out_of_scope_check>PM explicitly named this file, in-scope for both the amend-2 label fix and the 9-tab-count mechanical-rule-2 update.</out_of_scope_check>
      </edit_plan>
    </change>

    <change file="packages/client/tests/e2e/progression.spec.ts">
      <action>modify</action>
      <summary>NOT in FE-1's given context_files — disk-verified gap. All 3 tests navigate exclusively via `page.getByRole('tab', {name:/progression/i})` at Playwright's default (desktop, ≥640px) viewport; once role="tab" only renders at &lt;640px, this KEEP-surface spec goes from presumed-green to a hard timeout/NEW-red, directly threatening FE-1's own "KEEP specs stay green" SC.</summary>
      <estimated_lines_added>n/a (spec)</estimated_lines_added>
      <estimated_lines_removed>n/a (spec)</estimated_lines_removed>
      <edit_plan>
        <intent>Close a real, disk-verified regression gap the PM's enumeration missed.</intent>
        <expected_diff_shape>Replace `page.getByRole('tab', {name:/progression/i})` with a rail-button locator (e.g. `page.getByRole('navigation',{name:'Main navigation'}).getByRole('button',{name:/progression/i})`) in all 3 tests.</expected_diff_shape>
        <out_of_scope_check>Recommend PM/Critic amend FE-1's context_files/deletion-and-update enumeration to add this file explicitly before execution — see conflicts_detected.</out_of_scope_check>
      </edit_plan>
    </change>

    <change file="packages/client/tests/e2e/prog-studio-vision-s3-program-dag.spec.ts">
      <action>modify</action>
      <summary>NOT in FE-1's given context_files — same defect class as progression.spec.ts: `getByRole('tab', {name:/programs/i})` at default desktop viewport, 3 tests, KEEP surface (Programs).</summary>
      <estimated_lines_added>n/a (spec)</estimated_lines_added>
      <estimated_lines_removed>n/a (spec)</estimated_lines_removed>
      <edit_plan>
        <intent>Same as progression.spec.ts.</intent>
        <expected_diff_shape>Replace `programsTab` locator with a rail-button locator, all 3 occurrences.</expected_diff_shape>
        <out_of_scope_check>Recommend PM/Critic amendment — see conflicts_detected.</out_of_scope_check>
      </edit_plan>
    </change>

    <change file="packages/client/tests/e2e/prog-studio-vision-s4-render-loop.spec.ts">
      <action>modify</action>
      <summary>NOT in FE-1 or FE-4's context_files. Mixed file: tests 3 surfaces via role=tab (Sessions text-locator, safe; Progression role=tab, breaks; Graph role=tab, breaks AND the surface itself is deleted by FE-4). Needs both a nav-selector fix (FE-1 concern) and a GraphPage-test removal (FE-4 concern) — cross-cutting.</summary>
      <estimated_lines_added>n/a (spec)</estimated_lines_added>
      <estimated_lines_removed>n/a (spec)</estimated_lines_removed>
      <edit_plan>
        <intent>Avoid stranding a render-loop regression guard for 2 of its 3 surfaces.</intent>
        <expected_diff_shape>Progression sub-test: rail-locator fix (FE-1). GraphPage sub-test: delete entirely (FE-4, GraphPage surface removed) — Sessions sub-test uses `text=` navigation, unaffected, verify not modify.</expected_diff_shape>
        <out_of_scope_check>Recommend PM/Critic assign explicit ownership (split edit across FE-1 nav-fix + FE-4 GraphPage-test-removal, or consolidate to whichever wave runs last) — see conflicts_detected.</out_of_scope_check>
      </edit_plan>
    </change>

    <change file="packages/client/tests/e2e/prog-studio-vision-s4-legibility.spec.ts">
      <action>modify</action>
      <summary>NOT in FE-1's context_files. One `progressionTab = getByRole('tab', {name:/progression/i})` occurrence (L83) at default viewport — same defect class.</summary>
      <estimated_lines_added>n/a (spec)</estimated_lines_added>
      <estimated_lines_removed>n/a (spec)</estimated_lines_removed>
      <edit_plan>
        <intent>Same as progression.spec.ts.</intent>
        <expected_diff_shape>Rail-locator fix, one occurrence.</expected_diff_shape>
        <out_of_scope_check>Recommend PM/Critic amendment.</out_of_scope_check>
      </edit_plan>
    </change>

    <change file="packages/client/tests/e2e/prog-studio-vision-s4-reduced-motion.spec.ts">
      <action>modify</action>
      <summary>NOT in FE-1's context_files. One `progressionTab` occurrence (L112) at default viewport — same defect class.</summary>
      <estimated_lines_added>n/a (spec)</estimated_lines_added>
      <estimated_lines_removed>n/a (spec)</estimated_lines_removed>
      <edit_plan>
        <intent>Same as progression.spec.ts.</intent>
        <expected_diff_shape>Rail-locator fix, one occurrence.</expected_diff_shape>
        <out_of_scope_check>Recommend PM/Critic amendment.</out_of_scope_check>
      </edit_plan>
    </change>

    <change file="packages/client/tests/e2e/prog-studio-vision-s2-d3-session-buffer.spec.ts">
      <action>modify</action>
      <summary>NOT in FE-1's context_files. `navigateToSessions()` helper uses `[role="tab"]` hasText /^Sessions$/i guarded by `isVisible().catch(()=>false)` — at default desktop viewport post-FE-1 this resolves false, the click silently no-ops, and the file's session-buffer-contamination regression guard (a genuinely important test) then runs against the Party surface instead of Sessions, producing a confusing downstream failure rather than a clean navigation error.</summary>
      <estimated_lines_added>n/a (spec)</estimated_lines_added>
      <estimated_lines_removed>n/a (spec)</estimated_lines_removed>
      <edit_plan>
        <intent>Preserve a KEEP-surface regression guard's actual reachability.</intent>
        <expected_diff_shape>Swap `navigateToSessions`'s locator for a `text=Sessions` or rail-button locator that survives both breakpoints (matching the pattern already used by s3-t2/t3/t4/agent-timeline-zoom/overview-aggregate, which use `text=SESSIONS` and are lower-risk — see conflicts_detected DOM-order caveat).</expected_diff_shape>
        <out_of_scope_check>Recommend PM/Critic amendment; do NOT delete — this is a KEEP session-editor regression test (session.saveEdit, session-store).</out_of_scope_check>
      </edit_plan>
    </change>

    <change file="packages/client/tests/e2e/prog-studio-vision-s2-d4-prose-slug.spec.ts">
      <action>modify</action>
      <summary>NOT in FE-1's context_files. Same `[role="tab"]` hasText /^Sessions$/i guarded-navigation pattern as d3-session-buffer — same fix.</summary>
      <estimated_lines_added>n/a (spec)</estimated_lines_added>
      <estimated_lines_removed>n/a (spec)</estimated_lines_removed>
      <edit_plan>
        <intent>Same as d3-session-buffer.spec.ts.</intent>
        <expected_diff_shape>Swap `sessionsNav` locator for a `text=`/rail-button locator.</expected_diff_shape>
        <out_of_scope_check>Recommend PM/Critic amendment; do NOT delete — KEEP surface (session slug/prose legibility).</out_of_scope_check>
      </edit_plan>
    </change>

    <change file="packages/client/tests/e2e/prog-studio-sessions-2026-05-s2-list-edit-fe.spec.ts">
      <action>modify</action>
      <summary>NOT in FE-1's context_files (nor FE-2/FE-3/FE-4's). This ONE file mixes valid KEEP Sessions-surface tests (its majority, `text=SESSIONS`-based, robust) with 4 obsolete "t6b: Existing pages smoke regression" sub-tests (L358-380) that click "Browse"/"Compose"/"Edit"/"Export" text labels and assert now-doomed testids — these 4 break the moment FE-1 removes NAV_ITEMS labels, independent of FE-2/FE-3/FE-4's own deletions.</summary>
      <estimated_lines_added>0</estimated_lines_added>
      <estimated_lines_removed>~24</estimated_lines_removed>
      <edit_plan>
        <intent>Remove only the 4 dead sub-tests without touching the file's genuinely-KEEP Sessions coverage (Overview/Table/Editor/Analyze sub-tabs are session-detail-page-local, unaffected by the nav retirement).</intent>
        <expected_diff_shape>Delete the 4 named tests at L358-380 ("Browse/Compose/Edit/Export page root testid is visible..."); leave every other test in the file untouched.</expected_diff_shape>
        <out_of_scope_check>Recommend PM/Critic assign explicit ownership (natural fit: FE-1, since the breakage trigger is FE-1's own NAV_ITEMS removal, not any later wave's deletion) — see conflicts_detected.</out_of_scope_check>
      </edit_plan>
    </change>

    <!-- ================================================================ -->
    <!-- FE-2 — Compose deletion -->
    <!-- ================================================================ -->

    <change file="packages/client/src/pages/ComposePage.tsx">
      <action>delete</action>
      <summary>Sole importer is ModeContent.tsx's compose PAGE_MAP entry, removed in the same wave.</summary>
      <edit_plan>
        <intent>Compose surface removal.</intent>
        <expected_diff_shape>File removed.</expected_diff_shape>
        <out_of_scope_check>In-scope.</out_of_scope_check>
      </edit_plan>
    </change>

    <change file="packages/client/src/store/compose-store.ts">
      <action>delete</action>
      <summary>Importers confirmed exclusively ExportPage.tsx (dead `removeHook`-era code path, not actually called per ExportPage's own SEAM-05 comment) and ComposePage.tsx — CAUTION: ExportPage.tsx's import line survives until FE-3; confirm it does not use compose-store at runtime (grep shows import present but the file's own comment says "compose-store addAgent/addSkill/addHook are dead... Source the loadout from canvas-store instead" — the import itself may still be a live `import { useComposeStore } from ...}` binding even if unused values).</summary>
      <edit_plan>
        <intent>Compose surface removal.</intent>
        <expected_diff_shape>File removed; if ExportPage.tsx has ANY residual `compose-store` import (even of an unused symbol), tsc will fail — verify ExportPage.tsx's import list precisely before deleting (see conflicts_detected FINDING-1-sibling).</expected_diff_shape>
        <out_of_scope_check>Flag for verification — do not assume "Expected: only Compose" from the packet text is disk-true without re-grepping at execution time.</out_of_scope_check>
      </edit_plan>
    </change>

    <change file="packages/client/src/store/canvas-store.ts">
      <action>delete</action>
      <summary>CONFLICT: FE-2's packet scopes this deletion here, but `ExportPage.tsx` (deleted only in FE-3, one wave later) imports `useCanvasStore`/`selectLoadoutPayload` from this exact file and uses it extensively (nodes/edges/canvasPayload, lines 86-176, 250-267). Deleting canvas-store.ts in FE-2 breaks `npm run lint` at FE-2's own close.</summary>
      <edit_plan>
        <intent>RECOMMENDED FIX: move this deletion to FE-3 (see FE-3's canvas-store.ts entry below), where ExportPage.tsx — its last real consumer — is deleted in the same wave.</intent>
        <expected_diff_shape>FE-2 does NOT touch this file at all.</expected_diff_shape>
        <out_of_scope_check>CONFLICT: FE-2's own step 2 instruction ("Delete stores compose-store.ts + canvas-store.ts... Expected: only Compose") is disk-FALSE — ExportPage.tsx is a real, still-live importer at FE-2's wave boundary. See conflicts_detected.</out_of_scope_check>
      </edit_plan>
    </change>

    <change file="packages/client/src/components/compose/MateriaCanvas.tsx">
      <action>delete</action>
      <summary>Sole non-test importer is ComposePage.tsx (deleted this wave); `src/tests/compose/materia-canvas.spec.ts` (also deleted this wave per amend-2) is the only other importer.</summary>
      <edit_plan><intent>Compose-only node/edge canvas component.</intent><expected_diff_shape>File removed.</expected_diff_shape><out_of_scope_check>In-scope.</out_of_scope_check></edit_plan>
    </change>

    <change file="packages/client/src/components/compose/MateriaNode.tsx">
      <action>delete</action>
      <summary>Importers confirmed: MateriaCanvas.tsx (deleted this wave) only.</summary>
      <edit_plan><intent>Compose-only.</intent><expected_diff_shape>File removed.</expected_diff_shape><out_of_scope_check>In-scope.</out_of_scope_check></edit_plan>
    </change>

    <change file="packages/client/src/components/compose/CardNode.tsx">
      <action>delete</action>
      <summary>Importers confirmed: ComposePage.tsx / MateriaCanvas.tsx subtree only (also imports canvas-store, which per the CONFLICT above must survive this wave — CardNode.tsx itself is safe to delete regardless since it has no non-Compose importer).</summary>
      <edit_plan><intent>Compose-only.</intent><expected_diff_shape>File removed.</expected_diff_shape><out_of_scope_check>In-scope.</out_of_scope_check></edit_plan>
    </change>

    <change file="packages/client/src/components/compose/handle-style.ts">
      <action>delete</action>
      <summary>Compose-canvas-only styling helper (directory-confirmed, no cross-surface grep hit).</summary>
      <edit_plan><intent>Compose-only.</intent><expected_diff_shape>File removed.</expected_diff_shape><out_of_scope_check>In-scope; not explicitly named in the packet text but clearly "materia-canvas node/edge/orb" per the packet's own description — add to the enumeration explicitly.</out_of_scope_check></edit_plan>
    </change>

    <change file="packages/client/src/constants/compose.ts">
      <action>delete</action>
      <summary>Importers confirmed exclusively MateriaNode.tsx, ComposePage.tsx, MateriaCanvas.tsx — all deleted this wave. Deleting this also orphans `constants/agent-roles.ts`'s COMPOSE-side importer (agent-roles.ts still survives via canvas-store.ts until FE-3, see below).</summary>
      <edit_plan><intent>Compose-only constants.</intent><expected_diff_shape>File removed.</expected_diff_shape><out_of_scope_check>Not explicitly named in the packet text (packet says "materia-canvas node/edge/orb, loadout panel" — a constants file is implied but not literal) — add to the enumeration explicitly.</out_of_scope_check></edit_plan>
    </change>

    <change file="packages/client/src/store/ui-store.ts">
      <action>modify</action>
      <summary>Remove `'compose'` from the AppMode union (line 4).</summary>
      <edit_plan><intent>Compiler-exhaustive PAGE_MAP invariant.</intent><expected_diff_shape>One union-member deletion.</expected_diff_shape><out_of_scope_check>In-scope, matches packet.</out_of_scope_check></edit_plan>
    </change>

    <change file="packages/client/src/components/ModeContent.tsx">
      <action>modify</action>
      <summary>Remove the `compose:` PAGE_MAP entry and the `ComposePage` React.lazy import (lines 26, 38).</summary>
      <edit_plan><intent>Compiler-exhaustive PAGE_MAP invariant.</intent><expected_diff_shape>Delete the lazy import line and the PAGE_MAP key.</expected_diff_shape><out_of_scope_check>In-scope.</out_of_scope_check></edit_plan>
    </change>

    <change file="7 Compose e2e/src-tests specs (rev1 5 + amend-2 2)">
      <action>delete</action>
      <summary>gander-studio-p1-compose-fe.spec.ts, gander-studio-p2-canvas-link-003a.spec.ts, materia-canvas-proximity.spec.ts, card-node-title-edit.spec.ts, loadout-list-panel.spec.ts, src/tests/compose/compose-connections-persist.spec.ts, src/tests/compose/materia-canvas.spec.ts — all Compose-surface-exclusive, confirmed via docstring/import-line reads.</summary>
      <edit_plan><intent>Delete specs WITH the surface (amend-2 enumeration).</intent><expected_diff_shape>7 files removed.</expected_diff_shape><out_of_scope_check>In-scope, amend-2-authorized. Note: the two `src/tests/compose/*.spec.ts` files ARE inside the client tsconfig's `"include": ["src"]` (confirmed via tsconfig.json read) — their deletion is load-bearing for `npm run lint`, not just Playwright hygiene (leaving them would dangling-import compose-store/canvas-store and break tsc).</out_of_scope_check></edit_plan>
    </change>

    <!-- ================================================================ -->
    <!-- FE-3 — Export + Planning deletion -->
    <!-- ================================================================ -->

    <change file="packages/client/src/pages/ExportPage.tsx">
      <action>delete</action>
      <summary>Sole importer is ModeContent.tsx's export PAGE_MAP entry, removed in the same wave.</summary>
      <edit_plan><intent>Export surface removal.</intent><expected_diff_shape>File removed.</expected_diff_shape><out_of_scope_check>In-scope.</out_of_scope_check></edit_plan>
    </change>

    <change file="packages/client/src/pages/PlanningPage.tsx">
      <action>delete</action>
      <summary>Sole importer is ModeContent.tsx's planning PAGE_MAP entry, removed in the same wave.</summary>
      <edit_plan><intent>Planning surface removal.</intent><expected_diff_shape>File removed.</expected_diff_shape><out_of_scope_check>In-scope.</out_of_scope_check></edit_plan>
    </change>

    <change file="packages/client/src/store/canvas-store.ts">
      <action>delete</action>
      <summary>MOVED HERE from FE-2 (see conflicts_detected). After ExportPage.tsx is deleted in this same wave, canvas-store.ts's importer list is fully empty (all other consumers — ComposePage/MateriaCanvas/CardNode/compose-connections-persist.spec.ts — were already deleted by FE-2).</summary>
      <edit_plan>
        <intent>Correct sequencing: delete canvas-store.ts only once its last real consumer (ExportPage.tsx) is gone.</intent>
        <expected_diff_shape>File removed, in the same commit/step as ExportPage.tsx.</expected_diff_shape>
        <out_of_scope_check>Not in FE-3's current packet text (packet doesn't mention canvas-store.ts at all) — RECOMMENDED ADDITION.</out_of_scope_check>
      </edit_plan>
    </change>

    <change file="packages/client/src/constants/agent-roles.ts">
      <action>delete</action>
      <summary>Once canvas-store.ts (its last real importer, after constants/compose.ts/MateriaCanvas.tsx/MateriaNode.tsx were already deleted by FE-2) is deleted in this wave, agent-roles.ts becomes fully orphaned.</summary>
      <edit_plan>
        <intent>Complete the canvas-store.ts dependency chain cleanup in the same wave that finally orphans it.</intent>
        <expected_diff_shape>File removed, same step as canvas-store.ts.</expected_diff_shape>
        <out_of_scope_check>Not in FE-3's current packet text — RECOMMENDED ADDITION. Re-grep at execution time before deleting (disk state may have shifted since this planning read).</out_of_scope_check>
      </edit_plan>
    </change>

    <change file="packages/client/src/constants/export.ts">
      <action>delete</action>
      <summary>Sole importer confirmed: ExportPage.tsx.</summary>
      <edit_plan><intent>Export-only constants.</intent><expected_diff_shape>File removed.</expected_diff_shape><out_of_scope_check>Not explicit in packet text but implied by "Export-only components/constants" — add to enumeration.</out_of_scope_check></edit_plan>
    </change>

    <change file="packages/client/src/store/ui-store.ts">
      <action>modify</action>
      <summary>Remove `'export'` and `'planning'` from the AppMode union.</summary>
      <edit_plan><intent>Compiler-exhaustive invariant.</intent><expected_diff_shape>Two union-member deletions.</expected_diff_shape><out_of_scope_check>In-scope.</out_of_scope_check></edit_plan>
    </change>

    <change file="packages/client/src/components/ModeContent.tsx">
      <action>modify</action>
      <summary>Remove `export:`/`planning:` PAGE_MAP entries and the `ExportPage`/`PlanningPage` imports.</summary>
      <edit_plan><intent>Compiler-exhaustive invariant.</intent><expected_diff_shape>Remove 2 imports + 2 PAGE_MAP keys.</expected_diff_shape><out_of_scope_check>In-scope.</out_of_scope_check></edit_plan>
    </change>

    <change file="4 Export/Planning e2e specs (rev1 3 + 1 finding)">
      <action>delete</action>
      <summary>gander-studio-p1-export-fe.spec.ts, prog-studio-vision-s2-d1-export.spec.ts (confirmed targets the Export SURFACE, not session export), prog-studio-vision-s3-planning.spec.ts — PLUS prog-studio-vision-s2-d5-confirm.spec.ts (NOT in any packet's enumeration — confirmed via docstring it exclusively tests ExportPage Input legibility via the same role=tab Export nav pattern).</summary>
      <edit_plan><intent>Delete specs WITH the surface.</intent><expected_diff_shape>4 files removed.</expected_diff_shape><out_of_scope_check>3 of 4 explicit in packet; the 4th (d5-confirm) is a RECOMMENDED ADDITION — see conflicts_detected.</out_of_scope_check></edit_plan>
    </change>

    <change file="packages/client/tests/e2e/prog-studio-vision-s2-d2-edit-save.spec.ts">
      <action>none</action>
      <summary>DO NOT delete or preserve here per the packet's literal caution ("covers SESSION markdown save (KEEP)") — that caution is factually WRONG. Disk-verified: this file exclusively tests the GLOBAL v1 EditPage's agent.save/skill.save (testid `edit-page`), a CUT surface. See FE-4's entry for the corrected deletion.</summary>
      <edit_plan>
        <intent>Correct a misidentification in the plan of record before it propagates.</intent>
        <expected_diff_shape>No FE-3 action on this file at all — recommend the caution note be struck from FE-3's packet text.</expected_diff_shape>
        <out_of_scope_check>CONFLICT with FE-3's own packet text — see conflicts_detected and FE-4's corrected entry.</out_of_scope_check>
      </edit_plan>
    </change>

    <!-- ================================================================ -->
    <!-- FE-CAT — 13-role catalog -->
    <!-- ================================================================ -->

    <change file="packages/client/src/pages/RosterCatalogPage.tsx">
      <action>create</action>
      <summary>New surface rendering every member returned by `useParty()` (uncapped, data-driven count) as cards, reusing PartyMemberCard/RoleTag/StatBar patterns, with loading/empty/error states matching PartyPage's existing derivation pattern.</summary>
      <estimated_lines_added>90-120</estimated_lines_added>
      <estimated_lines_removed>0</estimated_lines_removed>
      <edit_plan>
        <intent>Deliver the ratified 13-role catalog without a new BE procedure or resurrected Browse code.</intent>
        <expected_diff_shape>New file: `useParty()` call, a state-derivation function (loading/empty/error/default, could reuse or mirror `derivePartyGridState`), a grid of PartyMemberCard-style cards over the FULL `data.members` array (no `.slice(0, N)` cap), first-class empty/error/loading rendering.</expected_diff_shape>
        <out_of_scope_check>No new BE procedure — compliant (reuses useParty). Not agent.list-sourced — compliant. Data-driven count, no hardcoded 13 — must verify at execution time (`grep -n "13"` should be empty).</out_of_scope_check>
      </edit_plan>
    </change>

    <change file="packages/client/src/store/ui-store.ts">
      <action>modify</action>
      <summary>Add `'catalog'` to the AppMode union.</summary>
      <edit_plan><intent>Ratified new surface.</intent><expected_diff_shape>One union-member addition.</expected_diff_shape><out_of_scope_check>In-scope, human-ratified 2026-07-10.</out_of_scope_check></edit_plan>
    </change>

    <change file="packages/client/src/components/ModeContent.tsx">
      <action>modify</action>
      <summary>Add a `catalog:` PAGE_MAP entry and a `React.lazy(() => import('../pages/RosterCatalogPage'))` import (lazy-from-birth, matching the s3 AgentDetailPage pattern).</summary>
      <edit_plan><intent>Wire the new surface.</intent><expected_diff_shape>One lazy import + one PAGE_MAP key.</expected_diff_shape><out_of_scope_check>In-scope.</out_of_scope_check></edit_plan>
    </change>

    <change file="packages/client/src/pages/PartyPage.tsx">
      <action>modify</action>
      <summary>Add a persistent "View Full Roster" CTA to the POPULATED-state header region (PartyScreenHeader, confirmed at lines 86-127 as the natural insertion point) that calls `setActiveMode('catalog')` — human-ratified 2026-07-10.</summary>
      <estimated_lines_added>8-15</estimated_lines_added>
      <estimated_lines_removed>0</estimated_lines_removed>
      <edit_plan>
        <intent>Resolve Critic WARNING 3 (SCOPE_DRIFT) per the human ratification.</intent>
        <expected_diff_shape>Add a `Button` inside `PartyScreenHeader` (or immediately adjacent, rendered only for the `default`/populated state) with an `onClick={() => setActiveMode('catalog')}` handler; PartyScreenHeader currently takes only `{ members }` as props — will need a new prop (e.g. `onViewFullRoster`) threaded from the parent, or the CTA can live in the `default` state branch alongside the grid rather than inside PartyScreenHeader itself (either satisfies "populated/default state, not only empty" — implementer's choice, not prescribed here).</expected_diff_shape>
        <out_of_scope_check>Does NOT touch the empty-state CTA (FE-4's job) — must be a separate, additional button, not a repoint of `handleViewRoster`. Does NOT touch PARTY_GRID_DISPLAY_CAP. Cross-check against FE-1's PartyPage.tsx edit (rail-mount removal) and FE-4's PartyPage.tsx edit (empty-state re-point) — all three touch this file serially; this plan's dependency_order sequences FE-CAT between FE-3 and FE-4, after FE-1, so each edit is against fresh HEAD, per PM's shared-file serialization table.</out_of_scope_check>
      </edit_plan>
    </change>

    <change file="a new Tier-2 Playwright spec (exact filename not prescribed by the PM packet)">
      <action>create</action>
      <summary>Assert: (a) from the populated party home the "View Full Roster" CTA is visible and routes to `'catalog'`; (b) the catalog page renders the full roster + honest empty/error states; (c) keyboard-operable.</summary>
      <estimated_lines_added>60-100</estimated_lines_added>
      <estimated_lines_removed>0</estimated_lines_removed>
      <edit_plan>
        <intent>Program invariant — Tier-2 spec per new surface.</intent>
        <expected_diff_shape>New file, likely `packages/client/tests/e2e/prog-studio-v2-2026-07-s4-retirement-catalog.spec.ts` (task_id-scoped naming, matching house convention) — FE-CAT's own turn must choose and record the exact name since the PM packet doesn't prescribe one.</expected_diff_shape>
        <out_of_scope_check>Must assert DOM-presence (card count, rail unaffected) alongside any side-effect assertion (Side-Effect-As-Proxy anti-pattern awareness) — compliant with standing house rules.</out_of_scope_check>
      </edit_plan>
    </change>

    <!-- ================================================================ -->
    <!-- FE-4 — Browse + Graph + Edit deletion, CTA re-point -->
    <!-- ================================================================ -->

    <change file="packages/client/src/pages/BrowsePage.tsx, GraphPage.tsx, EditPage.tsx">
      <action>delete</action>
      <summary>Sole importers are ModeContent.tsx's respective PAGE_MAP entries, removed in the same wave.</summary>
      <edit_plan><intent>Absorbed-surface removal, s3 absorption proof cited green.</intent><expected_diff_shape>3 files removed.</expected_diff_shape><out_of_scope_check>In-scope.</out_of_scope_check></edit_plan>
    </change>

    <change file="packages/client/src/hooks/useBrowseData.ts, store/browse-store.ts, store/edit-store.ts">
      <action>delete</action>
      <summary>Importer scans confirmed clean: useBrowseData.ts → only itself + BrowsePage.tsx; browse-store.ts → only Browse pages/components; edit-store.ts → only EditPage.tsx (ReviseSpecAction.tsx/AgentDetailPage.tsx confirmed non-importers).</summary>
      <edit_plan><intent>Absorbed-surface store/hook removal.</intent><expected_diff_shape>3 files removed.</expected_diff_shape><out_of_scope_check>In-scope, matches packet's own SC.</out_of_scope_check></edit_plan>
    </change>

    <change file="packages/client/src/store/analyzeStore.ts">
      <action>none (RETAIN)</action>
      <summary>DEFINITIVELY RESOLVED (was "ownership unknown" in PM risk_flags): importer scan shows 3 Sessions-surface consumers — `pages/sessions/tabs/AnalyzeTab.tsx`, `components/sessions/SessionPicker.tsx`, `pages/sessions/SessionListPage.tsx` — zero Browse/Graph importers. Must be retained.</summary>
      <edit_plan><intent>Close the PM's flagged open risk with disk evidence.</intent><expected_diff_shape>No change to this file.</expected_diff_shape><out_of_scope_check>In-scope — matches the packet's own "the grep decides" instruction; the grep result is now known in advance.</out_of_scope_check></edit_plan>
    </change>

    <change file="packages/client/src/components/browse/AgentCard.tsx, DrilldownPanel.tsx, FilterBar.tsx, HookCard.tsx, SkeletonCard.tsx, SkillCard.tsx">
      <action>delete</action>
      <summary>Each importer-scanned individually: all 6 have exactly one importer, BrowsePage.tsx, confirmed clean.</summary>
      <edit_plan><intent>Browse-only component removal.</intent><expected_diff_shape>6 files removed.</expected_diff_shape><out_of_scope_check>In-scope.</out_of_scope_check></edit_plan>
    </change>

    <change file="packages/client/src/constants/browse.ts">
      <action>none (REQUIRED RETAIN — naming trap)</action>
      <summary>Despite its filename, this file exports `AGENT_MATERIA`/`DEFAULT_MATERIA` consumed by `components/sessions/AgentTimeline.tsx` (a RETAINED Sessions component, confirmed via import-line grep). Deleting it as "Browse-only" by filename pattern-matching would break a KEEP surface.</summary>
      <edit_plan>
        <intent>Prevent a plausible, disk-confirmed trap — the file's name does not match its actual scope.</intent>
        <expected_diff_shape>No deletion; if desired, a future sprint could rename it (not this sprint's scope).</expected_diff_shape>
        <out_of_scope_check>CRITICAL — add this as an explicit exception in FE-4's out_of_scope/step-5 text before execution.</out_of_scope_check>
      </edit_plan>
    </change>

    <change file="packages/client/src/components/graph/FilterSidebar.tsx, GraphNode.tsx; packages/client/src/constants/graph.ts">
      <action>delete</action>
      <summary>Importer scans confirmed: FilterSidebar.tsx/GraphNode.tsx → GraphPage.tsx only; constants/graph.ts → GraphPage.tsx, GraphNode.tsx, FilterSidebar.tsx only (all deleted this wave).</summary>
      <edit_plan><intent>Graph-only removal.</intent><expected_diff_shape>3 files removed.</expected_diff_shape><out_of_scope_check>In-scope.</out_of_scope_check></edit_plan>
    </change>

    <change file="packages/client/src/components/edit/TagInput.tsx; packages/client/src/constants/edit.ts">
      <action>delete</action>
      <summary>Importer scans confirmed: TagInput.tsx → EditPage.tsx only; constants/edit.ts → EditPage.tsx, TagInput.tsx only (both deleted this wave).</summary>
      <edit_plan><intent>Edit-only removal.</intent><expected_diff_shape>2 files removed.</expected_diff_shape><out_of_scope_check>In-scope.</out_of_scope_check></edit_plan>
    </change>

    <change file="packages/client/src/hooks/useLinkSound.ts">
      <action>delete</action>
      <summary>RECOMMENDED ADDITION (not in FE-4's packet text). Importers are exclusively ExportPage.tsx (gone, FE-3), MateriaCanvas.tsx (gone, FE-2), GraphPage.tsx (gone, this wave), EditPage.tsx (gone, this wave) — once this wave completes, zero real importers remain (the two e2e specs referencing it, prog-studio-vision-s4-mute.spec.ts and materia-canvas-proximity.spec.ts, are resolved separately: mute.spec.ts tests the unrelated global Header mute toggle and does not import this file; proximity.spec.ts is already deleted by FE-2).</summary>
      <edit_plan>
        <intent>Complete the sprint's stated "prune dead stores/components/routes" goal — this file would otherwise be silently orphaned with no wave scoped to remove it.</intent>
        <expected_diff_shape>File removed as the final step of this wave, after BrowsePage/GraphPage/EditPage deletion, with a fresh importer re-grep to confirm zero consumers remain at execution time.</expected_diff_shape>
        <out_of_scope_check>Not in FE-4's current packet text — RECOMMENDED ADDITION, flag for PM/Critic amendment.</out_of_scope_check>
      </edit_plan>
    </change>

    <change file="packages/client/src/constants/canvas.ts">
      <action>delete</action>
      <summary>RECOMMENDED ADDITION. Sole real importer after FE-2 was `hooks/useLinkSound.ts` (transitively keeping ExportPage/GraphPage/EditPage alive as consumers through FE-3); once useLinkSound.ts is deleted in this same wave (see above), constants/canvas.ts becomes fully orphaned.</summary>
      <edit_plan>
        <intent>Complete the canvas.ts→useLinkSound.ts dependency chain cleanup.</intent>
        <expected_diff_shape>File removed, same step as useLinkSound.ts, after a fresh importer re-grep.</expected_diff_shape>
        <out_of_scope_check>Not in FE-4's current packet text — RECOMMENDED ADDITION.</out_of_scope_check>
      </edit_plan>
    </change>

    <change file="packages/client/src/store/ui-store.ts">
      <action>modify</action>
      <summary>Remove `'browse'`, `'edit'`, `'graph'` from the AppMode union.</summary>
      <edit_plan><intent>Compiler-exhaustive invariant.</intent><expected_diff_shape>Three union-member deletions.</expected_diff_shape><out_of_scope_check>In-scope.</out_of_scope_check></edit_plan>
    </change>

    <change file="packages/client/src/components/ModeContent.tsx">
      <action>modify</action>
      <summary>Remove browse/edit/graph PAGE_MAP entries and the `GraphPage` lazy import (BrowsePage/EditPage are NOT currently lazy-loaded per the ModeContent.tsx read — confirm their import style before deleting; only GraphPage is explicitly React.lazy'd at line 27 alongside ComposePage/ProgramDagPage).</summary>
      <edit_plan><intent>Compiler-exhaustive invariant.</intent><expected_diff_shape>Remove 3 PAGE_MAP keys + the BrowsePage/EditPage static imports (lines 4-5) + the GraphPage lazy import (line 27).</expected_diff_shape><out_of_scope_check>In-scope.</out_of_scope_check></edit_plan>
    </change>

    <change file="packages/client/src/pages/PartyPage.tsx">
      <action>modify</action>
      <summary>Re-point `handleViewRoster`'s `setActiveMode('browse')` (line 209) to `setActiveMode('catalog')`; remove the stale `TODO(s4-cut)` comment (lines 205-207).</summary>
      <edit_plan>
        <intent>Ratified empty-state CTA re-point, per s3 inheritance (a) + human ratification.</intent>
        <expected_diff_shape>One string literal change + comment cleanup. Must work from HEAD as amended by FE-1 (rail-mount removal) and FE-CAT (persistent CTA addition) — this plan's line numbers (205-224) are pre-FE-1/FE-CAT and WILL have shifted by the time FE-4 executes; do not hardcode line numbers into the execution brief.</expected_diff_shape>
        <out_of_scope_check>Does not touch the persistent populated-home CTA (FE-CAT's, already delivered) — compliant, this is strictly the empty-state button's target.</out_of_scope_check>
      </edit_plan>
    </change>

    <change file="3 named e2e specs + 1 misidentification correction + 1 cross-cutting partial edit">
      <action>delete/modify</action>
      <summary>Delete: gander-studio-p1-browse-fe.spec.ts, gander-studio-p1-edit-fe.spec.ts, graph-page.spec.ts (as packeted) — PLUS `prog-studio-vision-s2-d2-edit-save.spec.ts` (misidentified as KEEP by FE-3's caution note; disk-verified it tests the CUT v1 EditPage, testid `edit-page`, must be deleted here, not preserved) — PLUS a partial edit to `prog-studio-vision-s4-render-loop.spec.ts` (remove only its GraphPage sub-test, leave Sessions/Progression sub-tests, coordinate with FE-1's nav-selector fix on the Progression sub-test in the same file).</summary>
      <edit_plan>
        <intent>Correct FE-3's misidentification before it produces a NEW post-FE-4 red regression, and complete the deletion enumeration.</intent>
        <expected_diff_shape>4 file deletions + 1 partial-file edit.</expected_diff_shape>
        <out_of_scope_check>The `prog-studio-vision-s2-d2-edit-save.spec.ts` addition directly CONTRADICTS FE-3's packet text ("do NOT delete it here or in FE-4") — this is a plan-of-record correction, not a scope violation; flag prominently for PM/Critic sign-off before execution. The genuinely KEEP session-save spec is `prog-studio-vision-s2-d3-session-buffer.spec.ts` (uses `session.saveEdit`), already correctly untouched.</out_of_scope_check>
      </edit_plan>
    </change>

    <change file="packages/client/tests/e2e/prog-studio-v2-2026-07-s2-party-shell.spec.ts">
      <action>modify</action>
      <summary>Update the "View Full Roster" CTA test (L364-398, empty-state path) assertion from `browse-page` testid to whatever RosterCatalogPage's root testid is (FE-CAT defines it) — matches FE-4's own SC text.</summary>
      <edit_plan><intent>Mechanical rule 2 — FE-4 legitimately falsifies this assertion via the browse→catalog re-point.</intent><expected_diff_shape>One testid string change in the empty-state CTA test.</expected_diff_shape><out_of_scope_check>In-scope, matches packet SC.</out_of_scope_check></edit_plan>
    </change>

    <!-- ================================================================ -->
    <!-- DOCS-1 -->
    <!-- ================================================================ -->

    <change file="CLAUDE.md">
      <action>modify</action>
      <summary>Rewrite Surfaces table (remove Browse/Compose/Edit/Export/Graph/Planning; add Party/Agent Detail/Roster Catalog; retain Sessions/Progression/Programs), Navigation line (global SubmenuRail + &lt;640px BottomTabBar-as-rail-fold + catalog-via-persistent-CTA), tRPC Procedures table + count/router-list (derive from post-BE-1 router.ts — confirmed at HEAD today: 10 named routers incl. loadoutRouter/exportRouter/connectivityRouter/planningRouter, all 4 of which BE-1 removes), Architecture tree (pages/store/parsers lists), Known Issues bundle-size line, Env table (EXPORT_BASE_DIR deprecated-unused note).</summary>
      <edit_plan>
        <intent>Bring the doc to v2 post-retirement reality.</intent>
        <expected_diff_shape>Confirmed at today's HEAD: current Surfaces table (9 rows) needs full replacement; current Navigation line literally reads "BottomTabBar (role=tablist, 9 tabs...)" (line 69) — must change; current tRPC table (line 84) literally reads "22 procedures across 10 routers" and lists loadout.list/save/delete, export.spawn, connectivity.getGraph, planning.list (lines 95-98, 105, 107) — all must be removed per BE-1's completion_packet; Architecture tree pages/ list (line 47) and store/ list (line 48, already stale — says "session-picker" which does not match any file found on disk this turn, confirms PM's "correct the STALE session-picker name" instruction is valid) both need correction; Known Issues bundle line (line 114, "~700KB") needs DOCS-1's own fresh build-output measurement.</expected_diff_shape>
        <out_of_scope_check>Must derive procedure count from router.ts at HEAD, not hardcode — compliant plan (this turn confirmed the 4-router removal set: loadoutRouter, exportRouter, connectivityRouter, planningRouter, all wired into appRouter at lines 822-827).</out_of_scope_check>
      </edit_plan>
    </change>

    <change file="DESIGN.md">
      <action>modify</action>
      <summary>Append Decision Record E (v2 IA: 9-to-6 surface consolidation, 9-tab v1 nav retirement, hoisted global SubmenuRail + &lt;640px fold, 6-agent homescreen + persistent catalog CTA) — DESIGN.md's most recent entry is Decision Record D (2026-07-02, --redb contrast), confirmed at the file's tail this turn.</summary>
      <edit_plan><intent>IA decision record, no new tokens.</intent><expected_diff_shape>New "## Decision Record E" section appended after Record D.</expected_diff_shape><out_of_scope_check>No new visual/FF7 tokens — compliant plan.</out_of_scope_check></edit_plan>
    </change>

    <change file="docs/deferred-work.md">
      <action>modify</action>
      <summary>Append the 4 human-approved deferrals (rail collapse/expand, DEFERRED-V2S2-1 390px header, DEFERRED-V2S3-1 roster-name-map, DEFERRED-V2S3-2 --mg contrast) under a new "## Sprint: prog-studio-v2-2026-07-s4-retirement (2026-07-10)" header, matching the file's existing append pattern (confirmed via 3 prior sprint entries read this turn).</summary>
      <edit_plan>
        <intent>Ledger the 4 authorized deferrals.</intent>
        <expected_diff_shape>One new "## Sprint: ..." section with 4 "### DEFERRED-..." sub-entries, each citing "human-ratified 2026-07-10 (ORC-witnessed)".</expected_diff_shape>
        <out_of_scope_check>DOCS-1 is the sole writer this sprint (append-serialized) — compliant. Optional 5th entry recommended (not packeted): if FE-4 does NOT absorb the useLinkSound.ts/constants/canvas.ts orphan cleanup this sprint, DOCS-1 should record it as a deferred cleanup item rather than silently drop it.</out_of_scope_check>
      </edit_plan>
    </change>

  </proposed_changes>

  <contracts_affected>
    AppMode union (store/ui-store.ts): removes 'compose' (FE-2), 'export'+'planning' (FE-3), 'browse'+'edit'+'graph' (FE-4); adds 'catalog' (FE-CAT). Net: 11 members -> 6 (party, agent-detail, sessions, progression, programs, catalog).
    PAGE_MAP (components/ModeContent.tsx): mirrors the above 6 add/remove deltas 1:1, plus removal of the now-dangling BrowsePage/EditPage static imports and ComposePage/GraphPage/ExportPage/PlanningPage lazy imports.
    Store module surface: compose-store.ts, canvas-store.ts, browse-store.ts, edit-store.ts removed entirely (canvas-store.ts's deletion should move from FE-2 to FE-3, see conflicts_detected); analyzeStore.ts RETAINED (disk-confirmed Sessions consumer).
    Shared constants module surface: constants/compose.ts, constants/canvas.ts, constants/agent-roles.ts, constants/export.ts, constants/graph.ts, constants/edit.ts removed; constants/browse.ts RETAINED despite its name (AgentTimeline.tsx dependency, see conflicts_detected).
    aria contracts: SubmenuRail.tsx aria-label "Party screen submenus" -> "Main navigation" (amend-2 A2); BottomTabBar.tsx's existing aria-label "Main navigation" is preserved but its role="tablist" surface is now gated to &lt;640px only and its item set changes from NAV_ITEMS(9) to RAIL_ITEMS(4).
    tRPC surface (BE-1, downstream of this FE plan but referenced by DOCS-1): loadout.*, export.spawn, connectivity.getGraph, planning.list removed from appRouter; ConnectivityGraphSchema retained (assembleAgentDetail dependency, confirmed by prior BE packet text, not independently re-verified this turn since router.ts's parser-level detail was outside this round's file list).
  </contracts_affected>

  <assumptions_requiring_verification>
    <item>The v2-design-spec.md &lt;responsive&gt; sm breakpoint (line 88, "5 tabs total... Party [home] + the 4 submenus") is internally inconsistent with its own component_hierarchy (lines 30-35, exactly 4 SubmenuItems) and with RAIL_ITEMS' actual 4-entry array (Roster already maps to 'party'/home). Recommend FE-1 follow the PM's ratified "4 rail destinations" framing (matches RAIL_ITEMS length, no invented 5th "Party" tab) and treat the spec's "5 tabs total" phrasing as a drafting inconsistency, not a literal requirement — flag for the Critic to explicitly bless this reading before FE-1 executes.</item>
    <item>components/ModeContent.tsx is NOT in FE-1's context_files, yet its hardcoded `paddingBottom: '56px'` inline style (line ~76) reserves bottom-bar space at ALL viewports, not just &lt;640px where the fold now lives. This creates a minor superfluous 56px gap at the bottom of desktop content post-hoist. Not tested by any current spec (visual-only), not proposed as an in-scope FE-1 change per the given context_files boundary — flagged for the Critic/PM to decide whether it's in-scope or a documented follow-up.</item>
    <item>docs/v2-vision/v2-design-spec.md line 324 ("aria-label='Party screen submenus'") will be stale documentation once FE-1's amend-2 aria-label fix ships. This file is outside DOCS-1's stated scope (CLAUDE.md/DESIGN.md/deferred-work.md only) — flagged as a loose end, non-blocking, no packet currently owns it.</item>
    <item>FE-2's compose-store.ts deletion assumes ExportPage.tsx's `import { useCanvasStore, selectLoadoutPayload } from '../store/canvas-store'` line does NOT also import anything from compose-store.ts. Confirmed via this turn's read of ExportPage.tsx (imports canvas-store only, not compose-store) — SAFE, no correction needed for compose-store.ts specifically (only canvas-store.ts moves to FE-3).</item>
    <item>FE-CAT's Tier-2 spec filename is not prescribed by the PM packet; the executing agent must choose one following house convention (task_id-scoped) and record it in the ui_packet's e2e_spec field.</item>
    <item>The exact DOM-mount order of `&lt;SubmenuRail/&gt;` vs `&lt;BottomTabBar/&gt;` inside AppShell.tsx is not prescribed by the PM packet ("do NOT prescribe the exact template"). Several e2e specs use `page.locator('text=SESSIONS').first()` (case-insensitive substring match) to reach the Sessions surface; this pattern is ONLY robust to FE-1's changes if the VISIBLE nav element (rail at &gt;=640px, fold at &lt;640px) precedes any CSS-hidden duplicate in DOM order at each breakpoint, since `.first()` resolves by DOM order, not visibility, and `.click()` on a `display:none` element times out. Recommend FE-1 mount SubmenuRail before BottomTabBar in AppShell.tsx's JSX (Header, SubmenuRail, ModeContent, BottomTabBar) to preserve this property, and verify with a live Playwright run rather than static reasoning alone.</item>
  </assumptions_requiring_verification>

  <conflicts_detected>
    <conflict with_task_id="FE-2 vs FE-3" file="packages/client/src/store/canvas-store.ts" nature="COMPILE-BREAKING: FE-2's packet text scopes canvas-store.ts deletion to itself ('Delete stores compose-store.ts + canvas-store.ts... Expected: only Compose'), but ExportPage.tsx (deleted only in FE-3, one wave later) imports useCanvasStore/selectLoadoutPayload from this exact file and uses it in ~15 call sites (nodes/edges/canvasPayload/handleExport). Deleting canvas-store.ts at FE-2's close makes 'npm run lint (tsc x3) clean' — FE-2's own stated SC — impossible to satisfy. RESOLUTION: move canvas-store.ts's deletion to FE-3 (its last real consumer, ExportPage.tsx, is deleted in FE-3's own wave, making the deletion safe there). Requires a PM/Critic amendment to FE-2's step 2 and FE-3's step (add canvas-store.ts to FE-3's deletion enumeration)."/>
    <conflict with_task_id="FE-2 vs FE-3/FE-4" file="packages/client/src/constants/canvas.ts" nature="COMPILE-BREAKING (same class as above, one hop deeper): constants/canvas.ts is imported by hooks/useLinkSound.ts (APPROACH_*/LINK_PRIMARY_* constants), and useLinkSound.ts is imported by ExportPage.tsx (FE-3), GraphPage.tsx (FE-4), EditPage.tsx (FE-4) — all three still live past FE-2's close. constants/canvas.ts must NOT be deleted until useLinkSound.ts itself is orphaned, which only happens after FE-4 deletes GraphPage.tsx/EditPage.tsx (the last two consumers). RESOLUTION: constants/canvas.ts (and useLinkSound.ts itself) should be deleted in FE-4, not FE-2 — currently neither file is named in ANY packet's enumeration; requires a PM/Critic amendment adding both to FE-4."/>
    <conflict with_task_id="FE-3 (packet text) vs FE-4 (correct owner)" file="packages/client/tests/e2e/prog-studio-vision-s2-d2-edit-save.spec.ts" nature="MISIDENTIFICATION: FE-3's packet text explicitly cautions 'covers SESSION markdown save (KEEP) — do NOT delete it here or in FE-4.' Disk-verified this turn: the file's own docstring and body test the GLOBAL v1 EditPage's agent.save/skill.save mutation (testid `edit-page`, FilePicker UI) — a CUT surface FE-4 deletes. The genuinely session-markdown-save-relevant file is prog-studio-vision-s2-d3-session-buffer.spec.ts (uses session.saveEdit/session-store), which is correctly untouched by any packet. RESOLUTION: strike the caution note from FE-3's packet text; add prog-studio-vision-s2-d2-edit-save.spec.ts to FE-4's deletion enumeration (alongside gander-studio-p1-edit-fe.spec.ts, its sibling Tier-2 spec for the same surface). Requires a PM/Critic amendment before FE-3/FE-4 execute, since FE-3's SC currently reads 'session-edit-save spec untouched and green' — a name change is not enough, the underlying claim about what the file covers is factually wrong."/>
    <conflict with_task_id="FE-1 (missing enumeration)" file="packages/client/tests/e2e/progression.spec.ts, prog-studio-vision-s3-program-dag.spec.ts, prog-studio-vision-s4-legibility.spec.ts, prog-studio-vision-s4-reduced-motion.spec.ts, prog-studio-vision-s4-render-loop.spec.ts (partial), prog-studio-vision-s2-d3-session-buffer.spec.ts, prog-studio-vision-s2-d4-prose-slug.spec.ts, prog-studio-sessions-2026-05-s2-list-edit-fe.spec.ts (partial)" nature="SC-THREATENING SPEC-ENUMERATION GAP: none of these 8 files are in FE-1's context_files, yet all rely on the 9-tab v1 BottomTabBar's role=&quot;tab&quot; pattern being present at Playwright's default (desktop, &gt;=640px) viewport to reach KEEP surfaces (Progression, Programs, Sessions) or to run a render-loop guard against the soon-deleted Graph surface. FE-1's own SC promises 'KEEP specs green' and 'no NEW failure vs the t5 list' — both are directly threatened by this gap. RESOLUTION: PM/Critic should amend FE-1's context_files + e2e-update enumeration to include all 8 files (with FE-4 co-owning the GraphPage-sub-test removal inside prog-studio-vision-s4-render-loop.spec.ts, and FE-4 or FE-1 owning the 4 dead sub-tests inside prog-studio-sessions-2026-05-s2-list-edit-fe.spec.ts)."/>
    <conflict with_task_id="FE-1 vs FE-CAT vs FE-4" file="packages/client/src/pages/PartyPage.tsx" nature="Serial multi-wave file (expected, already flagged by PM's shared-file serialization table) — confirmed non-overlapping in practice: FE-1 touches lines ~1-9 (imports) and ~220-225 (rail-mount wrapper removal); FE-CAT touches the PartyScreenHeader/populated-state region (~86-127, ~230-236); FE-4 touches handleViewRoster (~205-210). No line-range collision found this turn, but FE-4 MUST work from post-FE-1/post-FE-CAT HEAD, not the line numbers cited in this plan (all of which are pre-FE-1/pre-FE-CAT)."/>
  </conflicts_detected>

  <split_recommendation>
    <recommend>no</recommend>
    <rationale>
      FE-1's production-code footprint (AppShell.tsx hoist, globals.css re-template, PartyPage.tsx mount removal, navigation.ts NAV_ITEMS removal, BottomTabBar.tsx repurpose) measures ~15-30 net-new lines against ~20-30 net-removed — comfortably inside the packet's own ~45-65 line estimate and well under the ~50-line split-contingency trigger. The documented FE-1a (hoist)/FE-1b (retire+fold) split contingency is therefore NOT warranted on code-size grounds.
      The real risk this round surfaced is NOT line count — it is e2e-spec enumeration completeness (8 additional files beyond FE-1's given 3, none previously identified). That is a scope-CORRECTNESS gap, not a scope-SIZE gap, and is better resolved by a PM/Critic amendment widening FE-1's context_files/deletion-and-update list than by splitting FE-1 into two agents (splitting would not by itself fix the missing enumeration — both halves would still need the corrected file list).
      Recommend the PM issue a targeted amendment (amend-3) covering: (a) FE-2/FE-3 canvas-store.ts + constants/canvas.ts + constants/agent-roles.ts resequencing, (b) FE-3/FE-4 prog-studio-vision-s2-d2-edit-save.spec.ts correction, (c) FE-1's + FE-4's expanded e2e enumeration (8 files), (d) FE-4's constants/browse.ts required-retain note and hooks/useLinkSound.ts + constants/canvas.ts cleanup addition — before any of FE-1/FE-2/FE-3/FE-4 execute, since the compile-breaking findings (a) will cause a hard FAIL on the very first "npm run lint" checkpoint otherwise.
    </rationale>
  </split_recommendation>

  <effort_estimate>
    FE-1: 90-140 minutes (production hoist ~30min; expanded e2e-selector migration across ~11 files once the enumeration is corrected ~60-90min; Playwright RUN + t5 cross-check ~15min).
    FE-2: 45-60 minutes (mechanical deletion wave; slightly reduced once canvas-store.ts is moved out per the recommended resequencing).
    FE-3: 60-75 minutes (mechanical deletion wave + newly-absorbed canvas-store.ts/agent-roles.ts cleanup + d5-confirm addition + d2-edit-save correction removal).
    FE-CAT: 90-120 minutes (new surface + persistent CTA + Tier-2 spec, matches PM's own 120-140 line estimate).
    FE-4: 90-120 minutes (mechanical deletion wave + analyzeStore/constants-browse retain confirmations + newly-absorbed useLinkSound.ts/constants/canvas.ts cleanup + d2-edit-save deletion + render-loop spec partial edit + CTA re-point).
    DOCS-1: 45-60 minutes (docs-only, but requires deriving the procedure table from router.ts at HEAD and a fresh build-size measurement).
  </effort_estimate>
</plan_packet>
