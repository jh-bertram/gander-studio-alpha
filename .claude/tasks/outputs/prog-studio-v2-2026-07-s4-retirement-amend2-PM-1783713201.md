# PM Plan Amendment (AMEND-2) — prog-studio-v2-2026-07-s4-retirement

Warning-resolution amendment per dispatch-task Step 1.5, responding to CR#2 CRITIQUE_PASS-with-WARNINGs (`...-rev1-CR-1783712885.md`). SC-level tightenings ONLY — no re-decomposition, no structural task_packet changes, no dependency changes, agent_count unchanged (7). **This file + the rev1 plan of record (`...-rev1-PM-1783712130.md`) together are the plan of record for assign-agents.** No Critic re-run expected.

Both tightenings were disk-verified 2026-07-10 before locking (s3 G1 discipline, coordinator-invoked).

<plan_amendment task_id="prog-studio-v2-2026-07-s4-retirement" base_plan="prog-studio-v2-2026-07-s4-retirement-rev1-PM-1783712130.md" scope="SC-level-only">

  <amendment id="A1" target_packet="prog-studio-v2-2026-07-s4-retirement-FE-2" type="DEPENDENCY / deletion-enumeration">
    <disk_verification>Glob 2026-07-10 CONFIRMED both paths exist and are the Compose surface's Playwright specs: `packages/client/src/tests/compose/compose-connections-persist.spec.ts` and `packages/client/src/tests/compose/materia-canvas.spec.ts` (Critic-verified: both in playwright.config `testMatch`, both target the Compose surface).</disk_verification>
    <change>
Add both files to FE-2's Compose deletion list AND to FE-2's `<context_files>`. They are deleted WITH the Compose surface, per the suites-updated-never-deleted-around invariant — otherwise they become orphaned red specs referencing a deleted surface, and BE-1's loadout/compose-tied removals would strand them.
    </change>
    <description_addendum>
FE-2 step 5 (e2e deletion) now enumerates SEVEN Compose specs to delete WITH the surface (was five):
  1. packages/client/tests/e2e/gander-studio-p1-compose-fe.spec.ts
  2. packages/client/tests/e2e/gander-studio-p2-canvas-link-003a.spec.ts
  3. packages/client/tests/e2e/materia-canvas-proximity.spec.ts
  4. packages/client/tests/e2e/card-node-title-edit.spec.ts
  5. packages/client/tests/e2e/loadout-list-panel.spec.ts
  6. packages/client/src/tests/compose/compose-connections-persist.spec.ts   ← ADDED (amend-2)
  7. packages/client/src/tests/compose/materia-canvas.spec.ts                ← ADDED (amend-2)
Confirm each targets the Compose/materia-canvas surface (grep describe/title) before deleting; cross-check the t5 57-failure list.
    </description_addendum>
    <context_files_addendum>
packages/client/src/tests/compose/compose-connections-persist.spec.ts
packages/client/src/tests/compose/materia-canvas.spec.ts
    </context_files_addendum>
    <success_criteria_addendum>
- All SEVEN named Compose specs deleted (the two `src/tests/compose/*.spec.ts` included); `grep -rln "compose\|materia-canvas\|loadout" packages/client/src/tests packages/client/tests/e2e` returns no spec still referencing the deleted Compose surface.
- Playwright RUN after deletion shows no orphaned spec pointing at a removed surface (no new red vs the t5 list attributable to a stranded Compose spec).
    </success_criteria_addendum>
  </amendment>

  <amendment id="A2" target_packet="prog-studio-v2-2026-07-s4-retirement-FE-1" type="AUDIT_RISK / a11y">
    <disk_verification>Grep 2026-07-10 CONFIRMED: `SubmenuRail.tsx:31` = `<nav role="navigation" aria-label="Party screen submenus" ...>`; the removed `BottomTabBar.tsx:10` correctly used `aria-label="Main navigation"` (with `role="tablist"`). When the rail is hoisted from a page-local submenu to the GLOBAL primary nav, "Party screen submenus" is now a mislabel for the app's primary navigation.</disk_verification>
    <change>
Add to FE-1 scope: when hoisting SubmenuRail to global primary nav, update its `aria-label` in `SubmenuRail.tsx` from "Party screen submenus" to "Main navigation" (the semantically-correct label the removed BottomTabBar used). SubmenuRail.tsx is already in FE-1's context_files (the hoist touches it) — no new file. The `role="navigation"` stays.
    </change>
    <success_criteria_addendum>
- `SubmenuRail.tsx` `aria-label` is "Main navigation" (not "Party screen submenus"): `grep -rn "Party screen submenus" packages/client/src` returns nothing.
- Any inherited e2e/a11y assertion querying the nav by the OLD label ("Party screen submenus") — check the s2 party-shell spec + any a11y assertion — is updated to "Main navigation" in-packet (mechanical rule 2: this label change legitimately falsifies the old assertion; FE-1 is already authorized to update the nav assertions it falsifies). Playwright RUN green on the updated assertion.
    </success_criteria_addendum>
    <must_contain_addendum>
      <item>confirmation SubmenuRail aria-label changed "Party screen submenus" → "Main navigation" + any e2e/a11y assertion on the old label updated</item>
    </must_contain_addendum>
    <note>The Step 4.5 tab-order/a11y walkthrough should confirm the global nav announces as "Main navigation" (spec accessibility_spec line 324 named the old page-local label; the hoist supersedes it — this is a correctness fix, not a spec deviation).</note>
  </amendment>

  <reqval_mapping_note>
    RECORD (no packet change): the sprint brief's literal declared output "BottomTabBar removed; v2 rail is the sole nav" maps, for REQVAL/audit purposes, to: **the 9-tab v1 `NAV_ITEMS` configuration is retired and SubmenuRail is the sole nav mechanism; the bottom-bar PATTERN may survive as the rail's ratified <640px presentation** (v2-design-spec.md lines 70-74 + 85-88 — "SubmenuRail folds into the existing global BottomTabBar … reusing the app's current bottom-tab pattern — no new nav mechanism"). REQVAL should therefore validate FE-1's OUTCOME-based SC (NAV_ITEMS/9-tab config gone + nav reachable from every surface at desktop AND <640px + aria-label "Main navigation") and NOT false-flag the literal "BottomTabBar removed" string if BottomTabBar.tsx survives repurposed as the mobile fold. This is the same reconciliation flagged in rev1 routing_notes + risk_flags, now recorded explicitly for the close-out gate.
  </reqval_mapping_note>

  <unchanged>
    All rev1 task_packets, dependency_order (FE-1 → FE-2 → FE-3 → FE-CAT → FE-4 → BE-1 → DOCS-1, serial), the human-approved deferrals block, the server-procedure decision, BE-1 ConnectivityGraphSchema protection, the FE-CAT getParty data source + persistent CTA, and every other SC stand as written in rev1. agent_count = 7. No-stub status unchanged (7 task_packets, all inline in rev1).
  </unchanged>

</plan_amendment>

---

## Scope self-check
Both changes are strictly SC/enumeration/scope-addendum level within existing packets (FE-2 deletion list + context_files; FE-1 aria-label scope + SC). No task_packet added/removed, no owner reassigned, no dependency edge changed, no data-contract change. Within the Step 1.5 warning-resolution envelope — did NOT exceed SC-level changes.

## COMPLETE (amend-2)
Amendment: `.claude/tasks/outputs/prog-studio-v2-2026-07-s4-retirement-amend2-PM-1783713201.md`.
Plan of record = rev1 (`...-rev1-PM-1783712130.md`) + this amend-2. Both tightenings disk-verified (2 compose specs exist via Glob; aria-label values confirmed via grep). No Critic re-run expected.
