<plan_critique>
  <plan_id>prog-studio-v2-2026-07-s4-retirement (rev2, post-jidoka)</plan_id>
  <status>PASS</status>

  <challenges>
    <challenge>
      <type>OVERSCOPED</type>
      <severity>WARNING</severity>
      <task_ref>prog-studio-v2-2026-07-s4-retirement-FE-1</task_ref>
      <description>
FE-1 now touches 6 production files (AppShell.tsx, globals.css, SubmenuRail.tsx, BottomTabBar.tsx, navigation.ts, PartyPage.tsx) PLUS 11 e2e spec files, and it is the critical-path root that blocks all six downstream packets. It has grown across two revisions (rev1 hoist → rev2 hoist + aria-label + 11-spec migration). By the ≥4-distinct-files signal this is over the single-packet threshold. Countervailing: the production footprint is genuinely small and atomic — FEP measured ~15-30 net-new production lines, and the nav-shell change is inherently multi-file (you cannot hoist the rail below 4 files without leaving a broken/zero-nav intermediate), so this is a context-breadth concern, not a line-limit breach or packed-independent-work. The PM defers the split decision to in-flight judgment triggered on "code SIZE only (~50 lines)" and explicitly says "do not split on spec count" — but line-count is the wrong trigger here (the footprint is 15-30 lines and will not trip it), while the actual risk is executing a novel CSS-grid re-architecture AND an 11-file mechanical spec migration reliably in one agent turn on the sprint's blocking root.
      </description>
      <required_revision>
Pre-commit the documented FE-1a/FE-1b split at plan time rather than leaving it to a line-count contingency the small footprint will never trip: FE-1a = hoist rail into AppShell + grid re-template + SubmenuRail aria-label + remove PartyPage page-local mount, with the 9-tab bar RETAINED as fallback (nav provably never zero, rail reachable globally — verifiable in isolation); FE-1b = retire NAV_ITEMS + wire the <640px bottom-bar fold + the 11-spec nav-selector migration. This de-risks the blocking root and gives each half an independently-verifiable green gate. If the PM keeps FE-1 whole, at minimum change the split trigger from "code size only" to "code size OR the spec migration running long," since the spec migration — not the production lines — is the execution-risk driver.
      </required_revision>
    </challenge>
    <challenge>
      <type>ASSUMPTION</type>
      <severity>WARNING</severity>
      <task_ref>prog-studio-v2-2026-07-s4-retirement-FE-1</task_ref>
      <description>
The jidoka fix-#4 enumeration ("8 KEEP specs that navigate via role=tab") is presented as a disk-verified closed set, but `getByRole('tab')`/`role="tab"` matches ~25 spec files, of which ~14 are KEEP specs not in FE-1's list. I verified this is mostly over-match, NOT a defect: the four unenumerated KEEP specs I spot-checked (s3-t3-timeline, agent-timeline-zoom, s3-t4-stat-surfaces, gander-studio-p9-...-t5) all use `getByRole('tab',{name:/Analyze/})` — an IN-PAGE Analyze tab, not the BottomTabBar nav — and `goto` the default party route with no Sessions nav-click, so they are pre-existing-baseline-red candidates, not currently-green nav-navigating specs. The PM's discriminator (specs with an explicit nav helper / nav-tab click = enumerate; goto-and-find-in-page-tab = baseline-red/skip) is sound. The residual risk: the enumeration is framed as a ceiling ("these ELEVEN specs"), so if any currently-green KEEP spec navigates via the nav bar and was missed, FE-1 may treat it as out-of-list and hit a mystery red it isn't scoped to fix.
      </description>
      <required_revision>
Reframe FE-1's remit so the 11-spec list is a FLOOR, not a ceiling: state that FE-1 owns migrating ANY currently-green KEEP spec the nav change breaks, and that for each spec that goes red under the post-hoist `npx playwright test` run FE-1 must classify it as (migrate-in-this-packet | already-in-the-t5-57-failure-baseline) using the t5 list already in context_files. This closes the gap empirically without expanding the enumeration guesswork, and matches the RUN-based "no NEW failure vs t5" SC already present.
      </description>
    </challenge>
  </challenges>

  <audit_risk_forecast>
    SIX JIDOKA FIXES — all disk-verified sound (per the coordinator's request to confirm each in packet text, not just summary):
    - #1 (canvas-store FE-2→FE-3): CONFIRMED. ExportPage.tsx:5 imports `useCanvasStore` (real); its compose-store mentions at lines 74/76/78 are comment-only. So compose-store deletes safely in FE-2, canvas-store must wait for FE-3 (ExportPage deleted there). FE-2 out_of_scope + SC "canvas-store NOT touched" enforce it correctly.
    - #2 (useLinkSound.ts + constants/canvas.ts → FE-4): CONFIRMED chain. useLinkSound importers = ExportPage[FE-3]/GraphPage,EditPage[FE-4]/MateriaCanvas,CardNode,MateriaNode[FE-2]; constants/canvas.ts ← useLinkSound. All orphaned by end of FE-4; the execution-time re-grep gate is the right safety. The FE-3 agent-roles.ts deletion direction is also correct: agent-roles.ts line 3-4 is a COMMENT ("Imported by deriveRole(canvas-store.ts)"); the real edge is canvas-store.ts:8 imports agent-roles, and agent-roles has ZERO KEEP-surface importer (only compose.ts/MateriaNode/MateriaCanvas[FE-2] + canvas-store[FE-3]) — cleanly deletable in FE-3.
    - #3 (s2-d2-edit-save is CUT, s2-d3-session-buffer is KEEP): both files exist; reassignment is internally consistent. ONE watch-item: this REVERSES rev1's KEEP classification of s2-d2-edit-save — FE-4 must open it and confirm the `edit-page` testid before deleting (deleting a mis-classified KEEP spec loses coverage). The packet says "tests the v1 EditPage edit-page testid," so the confirmation is implied; make it an explicit FE-4 pre-delete check.
    - #4 (8 KEEP-spec nav migration → FE-1): see WARNING above — sound discriminator, reframe as floor.
    - #5 (shared/src/types.ts): CONFIRMED real compile-blocker. types.ts:6 imports LoadoutSchema, :12 `export type Loadout = z.infer<typeof LoadoutSchema>`; index.ts `export *` re-exports it, so removing LoadoutSchema from schemas.ts without this 2-line types.ts edit fails the FIRST (shared) tsc pass. BE-1 step 4 handles it precisely, and the router.ts import-site-prune-vs-definition-retain distinction for ConnectivityGraphSchema is correctly stated.
    - #6 (analyzeStore.ts + constants/browse.ts RETAIN): correctly enforced in FE-4 out_of_scope; consistent with agent-roles.ts:4 naming browse.ts AGENT_MATERIA as the canonical color map consumed by the KEEP AgentTimeline.

    FE-1/FE-4 partial-ownership boundary (coordinator's finding-4 question): UNAMBIGUOUS. render-loop.spec.ts — FE-1 migrates ONLY the Progression sub-test's nav locator, FE-4 deletes ONLY the Graph sub-test, both packets cross-reference and FE-4 works from post-FE-1 HEAD; the three sub-tests (Sessions/Progression/Graph) are disjoint. s2-list-edit-fe.spec.ts is fully FE-1's (delete 4 t6b sub-tests, keep the rest) — "partial" means partial-within-file, not shared with FE-4. Neither agent will touch the other's assertions.

    Standing landmines (executed well, non-blocking): (a) DOCS-1's description states the expected "18 procedures across 8 routers" AND "derive, do not hardcode" — treat 18/8 as the value to CONFIRM against the router.ts-derived count, not to transcribe. (b) FE-1 DOM-mount order (SubmenuRail before BottomTabBar) is asserted as load-bearing for `.first()`/`text=` locators — must be proven by the live RUN, not static reasoning; the risk_flags already say this. (c) the residuals the planners flagged (ModeContent paddingBottom:'56px' desktop gap; stale v2-design-spec:324 aria-label / router.ts STUDIO_ROOT comment; ungated client-vitest) are correctly parked as future-pass items and none blocks this sprint.

    Escalation note: CR#2 was PASS, so no two-consecutive-BLOCK applies; this round is also PASS. Both WARNINGs are new-information (FE-1's growth) / enumeration-framing, not a recurrence of a prior blocker.
  </audit_risk_forecast>

  <post_mortem_patterns_checked>
    Re-consulted prog-studio-v2-2026-07-s3-drilldowns.md (§5 recurring table G1 plan-time-unverified-inherited-fact, §6 G3 cross-spec-interim-assertion). Independently disk-verified the load-bearing jidoka claims: ExportPage.tsx imports (canvas-store real / compose-store comment-only), types.ts:6/12 Loadout derivation, agent-roles.ts dependency direction (comment vs canvas-store.ts:8 import) and its zero KEEP-importer status, useLinkSound/constants/canvas transitive chain, and the role="tab" spec population (25 matches, ~14 KEEP, spot-checked 4 as in-page Analyze tabs / baseline-red). The jidoka round is the plan-time-unverified-fact class working as designed — live importer-greps caught transitive-sequencing traps invisible from packet text. sc-precheck-report.json (F1-F3, PASS, no locked-value SCs) consistent with the deletion/retirement sprint class; ORC's mechanical run reported 0 findings / 14 commands. Two WARNINGs, zero BLOCKERs → PASS; execution may proceed with the FE-1 split pre-commitment and the floor-not-ceiling reframing applied.
  </post_mortem_patterns_checked>
</plan_critique>
