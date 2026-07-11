<plan_critique>
  <plan_id>prog-studio-v2-2026-07-s4-retirement (rev1)</plan_id>
  <status>PASS</status>

  <challenges>
    <challenge>
      <type>DEPENDENCY</type>
      <severity>WARNING</severity>
      <task_ref>prog-studio-v2-2026-07-s4-retirement-FE-2</task_ref>
      <description>
FE-2's Compose-spec enumeration is incomplete — the s3 G1 "enumeration over repo state" class the re-gate brief flagged. FE-2 names 5 e2e specs (tests/e2e/*) but `playwright.config.ts` testMatch is `['**/tests/e2e/**/*.spec.ts', '**/src/tests/compose/**/*.spec.ts']` — and TWO Compose specs live under the second glob, unnamed by the packet: `packages/client/src/tests/compose/compose-connections-persist.spec.ts` and `packages/client/src/tests/compose/materia-canvas.spec.ts`. Both target the Compose surface / canvas-store and are RUN by `npx playwright test`. When FE-2 deletes ComposePage + compose-store + canvas-store, these two specs break at runtime — NEW failures not in the t5 57-failure baseline — unless deleted WITH the surface. FE-2's own SCs are self-protecting (the `grep ... packages/client/src` empty check spans src/tests, and the mandatory Playwright RUN surfaces new reds), so a faithful agent will discover them — but as a mystery red mid-run rather than a deliberate delete. The enumeration should name them so the delete is intentional.
      </description>
      <required_revision>
Add `packages/client/src/tests/compose/compose-connections-persist.spec.ts` and `packages/client/src/tests/compose/materia-canvas.spec.ts` to FE-2's step-5 deletion list AND its context_files (confirm each describe/title targets Compose before deleting). Note in the packet that playwright testMatch covers `src/tests/compose/**` so no Compose spec is left dangling.
      </required_revision>
    </challenge>
    <challenge>
      <type>AUDIT_RISK</type>
      <severity>WARNING</severity>
      <task_ref>prog-studio-v2-2026-07-s4-retirement-FE-1</task_ref>
      <description>
The hoist introduces an a11y accuracy defect. `SubmenuRail.tsx:31` labels its nav `aria-label="Party screen submenus"` — accurate while the rail was page-local to PartyPage, but once FE-1 hoists it into AppShell as the app's global/primary navigation on every surface, "Party screen submenus" mislabels it to assistive tech. (The bar it replaces, BottomTabBar.tsx:10, was correctly labeled `aria-label="Main navigation"`.) standards.md A11Y requires semantic, accurate labeling; an a11y auditor will flag a primary nav labeled as a page-local submenu — and if FE-1 repurposes BottomTabBar for the <640px fold, two navs with inconsistent labels will coexist.
      </description>
      <required_revision>
Fold into FE-1: update `SubmenuRail.tsx:31` `aria-label` from "Party screen submenus" to a global-nav label (e.g. "Main navigation"), and ensure the desktop rail and the <640px bottom-bar fold present a single coherent nav label. Add an FE-1 must_contain item confirming the reconciled nav aria-label.
      </required_revision>
    </challenge>
  </challenges>

  <audit_risk_forecast>
    RE-GATE ADJUDICATIONS (the items the coordinator asked me to rule on):
    1. ROUND-1 BLOCKER — RESOLVED (verified in packet text, not just summary). FE-1 rev1 hoists SubmenuRail into AppShell (step 1), re-templates `.app-shell` grid, removes the PartyPage page-local mount, and its SC asserts rail reachability from a NON-party surface at desktop AND <640px (steps 1-2, SC lines 46-49). Hoist-first ordering ("never a zero-nav window") is explicit. context_files now include AppShell.tsx, globals.css, PartyPage.tsx, v2-design-spec.md. This is NOT a recurrence of the round-1 blocker — no two-consecutive-BLOCK escalation applies.
    2. MOBILE-FOLD FRAMING — FAITHFUL, no new human flag needed. The PM's spec citations are accurate: v2-design-spec.md Mobile paragraph (lines 70-74) and `<responsive>` (lines 85-88) EXPLICITLY mandate that at <640px "SubmenuRail folds into the existing global BottomTabBar ... reusing the app's current bottom-tab pattern — no new nav mechanism." The human ratified this design spec ("this design looks great to me"). So retiring the 9-tab v1 NAV_ITEMS config while the rail's spec-mandated mobile form is a bottom-bar is faithful to the ratified design, not a unilateral reinterpretation. ONE carry-forward for ORC/REQVAL: the sprint brief's literal "BottomTabBar removed" will read as a partial-delete IF BottomTabBar.tsx survives as the repurposed mobile fold — REQVAL/the Step-4.5 walkthrough should map "remove the 9-tab BottomTabBar" to "9-tab v1 NAV_ITEMS retired; the bottom-bar may survive as the rail's mobile presentation," so the outcome-based SC isn't false-flagged as under-delivery. The plan's verbatim-audit (line 514) already documents this; surface it at the walkthrough.
    3. <640px SC SATISFIABILITY — OK. `playwright.config.ts` sets no fixed viewport (defaults 1280×720) and defines no device projects; a spec can override per-test via `page.setViewportSize` / `test.use({ viewport })`, so the FE-1 <640px reachability assertion is mechanically achievable. Note there is exactly ONE narrow-viewport spec being authored (FE-1) — verify the run actually exercises it rather than relying on the 1280 default.
    4. FE-CAT data source / WARNING-3 / t5 wiring — all RESOLVED: getParty/useParty uncapped (verified against PartyPage's PARTY_GRID_DISPLAY_CAP=6 cap), persistent populated-home CTA folded into FE-CAT with a Tier-2 assertion (human-ratified 2026-07-10), and the t5 classification artifact is in all five FE context_files with a mandatory `npx playwright test` RUN per FE SC.

    Standing audit landmines (executed well): (a) the 4-vs-5 mobile-tab count is internally inconsistent in the spec itself (line 72 says "5 destinations = Party[home] + the 4 submenus," but RAIL_ITEMS is 4 items where "Roster" already IS party-home) — FE-1's SC correctly checks reachability of all KEEP routes + party rather than a tab integer, so this is not a defect, but the auditor should not hold FE-1 to a literal "5 tabs." (b) DOCS-1's procedure table will list agent.list/skill.list/hook.list even though they now have no v2 UI consumer (retained as low-churn wrappers) — fine as long as the table is derived from router.ts at HEAD, which the SC mandates.
  </audit_risk_forecast>

  <post_mortem_patterns_checked>
    Re-consulted docs/after-actions/prog-studio-v2-2026-07-s3-drilldowns.md (§5 recurring table, §6 G1/G3). Verified rev1 against disk: v2-design-spec.md responsive/mobile citations (lines 70-74, 85-88) confirmed accurate; playwright.config.ts viewport behavior confirmed; the FE-2 src/tests/compose enumeration gap surfaced via Glob (the s3 G1 incomplete-enumeration class recurred in one packet — non-blocking, packet SCs self-protect). Round-1 BLOCKER confirmed genuinely discharged in FE-1 packet text. sc-precheck-report.json (refreshed; F1-F3, PASS, no locked-value SCs) read and consistent with the deletion/retirement sprint class. No UNSATISFIABLE/SELF-DEFEATING findings. Two WARNINGs only → PASS; execution may proceed with the two tightenings applied.
  </post_mortem_patterns_checked>
</plan_critique>
