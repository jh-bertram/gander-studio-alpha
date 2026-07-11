<plan_critique>
  <plan_id>prog-studio-v2-2026-07-s4-retirement</plan_id>
  <status>BLOCK</status>

  <challenges>
    <challenge>
      <type>ASSUMPTION</type>
      <severity>BLOCKER</severity>
      <task_ref>prog-studio-v2-2026-07-s4-retirement-FE-1</task_ref>
      <description>
FE-1's precondition is built on a false premise. Step 1 says "confirm that AppShell renders SubmenuRail" — it does NOT. At HEAD, `AppShell.tsx` renders only `<Header/> <ModeContent/> <BottomTabBar/>` (lines 8-10). The `.app-shell` grid (`globals.css:91-95`) has `grid-template-areas: "hd" "mn"` — Header + ModeContent only. `BottomTabBar` is `position: fixed` (BottomTabBar.tsx:12) and is the ONLY global, always-present navigation on every surface.

`SubmenuRail` is mounted page-local INSIDE `PartyPage.tsx` (line 223), wrapped in `hidden lg:flex` (line 222 — desktop-only), and therefore only renders when `activeMode === 'party'` AND viewport ≥ lg. PartyPage's own comment (lines 26-29, "plan R-3") records the obligation FE-1 omits: "s4 lifts it when it removes BottomTabBar."

Consequence of FE-1 as written (delete BottomTabBar + remove NAV_ITEMS, no hoist): every non-party surface — Sessions, Progression, Programs, agent-detail, and FE-CAT's new catalog — loses ALL navigation (the rail is trapped inside the unmounted PartyPage). On sub-lg viewports even the party home has no nav. FE-1's SC "SubmenuRail is the only nav; all 4 KEEP routes reachable via the rail in a running dev build" cannot be met — from Sessions you cannot reach Progression via a rail that only exists on the party page. The plan's own SC is inconsistent with the page-local mount.
      </description>
      <required_revision>
Expand FE-1 scope to HOIST SubmenuRail into the global shell (the "s4 lifts it" obligation): render `<SubmenuRail/>` in `AppShell.tsx`, give it a grid area by re-templating `.app-shell` `grid-template-columns`/`grid-template-areas` in `globals.css` (add e.g. an `"rl"` column), and REMOVE the page-local mount from `PartyPage.tsx` (lines 222-224) so the rail is not double-rendered. Add `packages/client/src/globals.css`, `packages/client/src/pages/PartyPage.tsx` to FE-1 context_files. Resolve the responsive-nav story explicitly: SubmenuRail is currently `hidden lg:flex`; hoisting it as-is leaves sub-lg viewports with zero nav after BottomTabBar removal — either make the hoisted rail viewport-responsive or record a human-approved deferral for mobile nav (do not silently ship a no-nav mobile state). Update the FE-1 SC to assert the rail is reachable from a NON-party surface (e.g. navigate to Sessions, assert the rail is present and can route to Progression), not merely that BottomTabBar is gone. This is layout/CSS-grid work — point the FE agent at `globals.css:91` `.app-shell` and `AppShell.tsx`; do not prescribe the exact grid template here.
      </required_revision>
    </challenge>

    <challenge>
      <type>OVERSCOPED</type>
      <severity>WARNING</severity>
      <task_ref>prog-studio-v2-2026-07-s4-retirement-FE-1</task_ref>
      <description>
`estimated_new_lines: 0 net-new (deletion wave)` is wrong once the hoist (above) is folded in. Hoisting the rail into AppShell + re-templating the `.app-shell` grid + removing the page-local mount + updating the nav specs to the global-rail reality is net-new layout code, not a pure deletion. FE-1 is a nav re-architecture, not a "deletion wave."
      </description>
      <required_revision>
Re-frame FE-1 and re-estimate. The hoist + grid re-template + BottomTabBar removal + NAV_ITEMS removal + spec updates should still fit one commit (~30-50 lines), but confirm; if it breaches ~50 lines, split the rail-hoist from the BottomTabBar/NAV_ITEMS deletion with a sequencing dependency (hoist first, so the rail is global before the bar is removed — never a window with zero global nav).
      </required_revision>
    </challenge>

    <challenge>
      <type>AUDIT_RISK</type>
      <severity>WARNING</severity>
      <task_ref>SPRINT</task_ref>
      <description>
Every FE packet's e2e SC ("no NEW failure vs. the t5 57-failure baseline; cross-check t5's classification") depends on the t5 57-failure classification list, which lives in `.claude/tasks/outputs/prog-studio-v2-2026-07-s3-drilldowns-t5-FE-1783490746.md`. That file is NOT in any FE packet's context_files — the plan relegates handing it over to an ORC risk_flag ("ORC should hand each FE wave the t5 57-failure list"). An FE agent reading only its packet cannot mechanically satisfy an SC whose reference corpus it was never given. (Note: the SC anchors on the enumerated LIST, not the fuzzy 55-vs-57 integer the s3 AA uses at lines 208 vs the classification title — that ambiguity is harmless as long as the agent compares against the list, which it can only do if it has the file.)
      </description>
      <required_revision>
Add `.claude/tasks/outputs/prog-studio-v2-2026-07-s3-drilldowns-t5-FE-1783490746.md` (the "Classification of the 57 full-suite failures") to the context_files of FE-1, FE-2, FE-3, FE-CAT, and FE-4 — or make ORC injection of it a hard per-dispatch precondition, not a soft risk_flag.
      </required_revision>
    </challenge>

    <challenge>
      <type>SCOPE_DRIFT</type>
      <severity>WARNING</severity>
      <task_ref>prog-studio-v2-2026-07-s4-retirement-FE-4</task_ref>
      <description>
The re-pointed "View Full Roster" CTA is the plan's sole entry to the 13-role catalog, but that CTA renders ONLY in PartyPage's EMPTY state: `handleViewRoster`/`onViewRoster` is passed only to `<EmptyPartyState>` at PartyPage.tsx:229 (`{state === 'empty' && ...}`). In the populated default state (lines 230-236) only PartyMemberCards render — there is NO "View Full Roster" affordance. After FE-4 re-points it to `'catalog'`, the 13-role catalog is reachable via the UI only when the party roster is empty (or, in tests, by directly setting activeMode). Ratification #1 is "Six-agent homescreen (13-role catalog ENTRY → s4 scope)" — an entry FROM the six-agent (populated) homescreen. The plan's interpretation is grounded (s3 AA line 207 equates the "catalog entry point" with "the CTA's true destination"), so this is not a spec violation — but the delivered reachability (catalog unreachable from the normal populated homescreen) is a gap the human likely did not picture when ratifying.
      </description>
      <required_revision>
Surface this to the human/ORC before dispatch and pick one: (a) add a persistent "View Full Roster" affordance to the populated party home (e.g. in PartyScreenHeader) that navigates to `'catalog'`, folded into FE-CAT or FE-4 with a matching Tier-2 assertion; or (b) explicitly confirm empty-state-only entry is acceptable and record "catalog entry from populated homescreen" as a human-approved deferral in docs/deferred-work.md alongside the other four. Do not ship the ratified "13-role catalog entry" reachable only in the empty edge case without a decision on record.
      </required_revision>
    </challenge>
  </challenges>

  <audit_risk_forecast>
    Adjudications the PM explicitly requested (resolved, not blockers):
    1. CATALOG IA — RATIFIED. A new top-level AppMode `'catalog'` is consistent with the AppMode∪PAGE_MAP compiler-exhaustive invariant (it is a matching union-member + PAGE_MAP-key add, same shape as s3's `'agent-detail'`), with the rail contract (not added to RAIL_ITEMS), and with the s2 aria-current invariant (SubmenuRail's `isActive = activeMode === item.mode` simply marks no rail item current while on catalog — acceptable for a non-rail surface). No name collision with the rail's "Roster"→`'party'`. FE-CAT may proceed with `'catalog'` + new mode; no need to BLOCK on IA.
    2. CONNECTIVITY COUPLING — PROTECTED. Verified `parsers/agent-detail.ts` (assembleAgentDetail, backing the KEEP proc roster.getAgentDetail) imports and uses `ConnectivityGraphSchema` (line 16, used in readConnectivityGraphSafe line 44). BE-1 step 1(a) names this file explicitly and SC #3 conditions ConnectivityGraphSchema removal on "no retained importer" — the scan-gate SC does protect it. The connectivity *parser* (separate file, if any) may be deleted; the SCHEMA must stay. Correct as written.

    Top audit landmines if executed well:
    - The e2e "no NEW failure vs baseline" SCs require actually running the Playwright suite with the t5 list in hand (see WARNING 3). If the FE waves assert e2e status by reading spec files rather than running the suite, the auditor's QA gate will not have real green/red evidence.
    - FE-CAT data source: `roster.getParty` returns the full roster (PartyPage caps display at 6 via `.slice(0, PARTY_GRID_DISPLAY_CAP)`), so reusing `useParty`/getParty and rendering ALL members yields the 13-role catalog with no new BE proc — the DRY path the plan prefers. `agent.list` returns only spec-backed agents and may under-count ROSTER roles with null specFile; if FE-CAT chooses agent.list, verify it returns the full role set before building, else BLOCK. The data-driven-count SC (no hardcoded 13) correctly avoids a brittle assertion either way.
    - DOCS-1 procedure count: CLAUDE.md currently says "22 procedures across 10 routers" while the plan's server note says "24 → 18" — the discrepancy is exactly why DOCS-1's derive-from-router.ts-at-HEAD mandate is correct; ensure the auditor checks the count was derived, not copied from the brief.
  </audit_risk_forecast>

  <post_mortem_patterns_checked>
    Consulted: docs/after-actions/prog-studio-v2-2026-07-s3-drilldowns.md (§4 deviations, §5 recurring table incl. plan-time-unverified-inherited-fact G1 line 136, §6 gaps, s4-inheritance lines 207-208, e2e ~30%-red-by-design). Verified the PM's s3 AA citations (lines 207, 208) are accurate against disk and that the t5 classification exists at prog-studio-v2-2026-07-s3-drilldowns-t5-FE-1783490746.md. Independently disk-confirmed all enumerated deletion targets exist (FE-1/2/3/4 pages, stores, hooks, and named e2e specs all present via Glob) — the s3 G1 (unverified-inherited-fact) class is well-guarded in this plan. G3 (cross-spec INTERIM-assertion coupling) is handled: FE-1 and FE-4 are explicitly authorized to update the assertions they falsify in-packet. Compiler-exhaustive AppMode↔PAGE_MAP integrity verified: no stray cut-mode literals exist beyond navigation.ts (FE-1), the ui-store union (per-wave), PAGE_MAP (per-wave), and PartyPage:209 (FE-4) — each wave is self-consistent and leaves lint×3 green. SC-precheck report (F1-F3, verdict PASS, no locked-value SCs) read and consistent; no UNSATISFIABLE/SELF-DEFEATING findings. (Note: brief referenced an "F4" but the attached report contains only F1-F3 — the e2e-baseline correction is documented in the decomposition preamble, not as a report finding.)
  </post_mortem_patterns_checked>
</plan_critique>
