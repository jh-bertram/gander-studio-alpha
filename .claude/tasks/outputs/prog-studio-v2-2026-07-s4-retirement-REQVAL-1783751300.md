# Requirements Coverage Report — prog-studio-v2-2026-07-s4-retirement (Mode B, RV#1)

Validator: RV#1 (independent). Procedure: requirements-validate Steps 1-4.
Question answered: did the sprint build what was actually asked for?
Method: requirements extracted from the sprint brief (5 SCs + 5 declared outputs), the 2026-07-10 human scope decisions (ORC-witnessed, recorded in rev3 `<human_approved_deferrals>` + the amend2 `<reqval_mapping_note>`), and program.md §6 SC2 — then mapped to the 10 audit verdicts, implementation packets, and INDEPENDENT disk re-verification (greps/reads run by RV#1 this pass, 2026-07-11). No source modified.

Plan of record validated against: rev3 (`...-rev3-PM-1783715959.md`) + amend2 (`...-amend2-PM-1783713201.md`) + amend3 (`...-amend3-PM-1783734397.md`).

<requirements_coverage_report task_id="prog-studio-v2-2026-07-s4-retirement" validator="RV#1" mode="B">
  <overall_status>PARTIAL</overall_status>
  <summary>
    <total>16</total>
    <covered>15</covered> <!-- includes 4 COVERED-as-deferred (authorized) -->
    <partial>1</partial>  <!-- R-005: sole gap = REQUIRES_HUMAN_VISUAL (Step 4.5, the program's planned final gate) -->
    <missing>0</missing>
  </summary>
  <requires_human_visual>true</requires_human_visual>

  <requirement id="R-001" source="brief SC1" status="COVERED">
    <text>Compose/Export/Planning unreachable and deleted; no orphaned imports/stores (verified by lint + a dead-export scan).</text>
    <evidence>
      - Disk (RV#1 independent): `packages/client/src/pages/` contains only AgentDetailPage, PartyPage, ProgramDagPage, ProgressionPage, RosterCatalogPage, sessions/ — ComposePage/ExportPage/PlanningPage gone. `packages/client/src/store/` = analyzeStore, session-store, ui-store only — compose/canvas/browse/edit stores gone. Grep for ComposePage|ExportPage|PlanningPage|compose-store|canvas-store live references in client src: comment-only hits (pattern-attribution notes in ProgramDagPage.tsx:3, ReviseSpecAction.tsx:19, error-state.tsx:14, RelationshipPanel.tsx:70 — no imports). `grep -rn "trpc.loadout|trpc.export|trpc.planning|trpc.connectivity" packages/client/src` → empty.
      - Unreachable: `packages/client/src/store/ui-store.ts:10` AppMode = 'party'|'sessions'|'progression'|'programs'|'agent-detail'|'catalog' (no compose/export/planning); `packages/client/src/components/ModeContent.tsx:36` PAGE_MAP Record&lt;AppMode&gt; has no cut entries.
      - Audits: `.claude/tasks/outputs/prog-studio-v2-2026-07-s4-retirement-FE-2-AUD-1783735518.md:15` (SA PASS deletion-exactness), `...-FE-3-AUD-1783739941.md:25-48` (SA/QA PASS, both e2e reds matched BASELINE-red.txt), `...-BE-1-AUD-1783748841.md:6-8` (removed six procedures 404 live; orphaned-validator grep across ALL packages for 6 removed schema names → zero live references).
      - Lint: `...-BE-1-AUD-1783748841.md:66` + `...-DOCS-1-reaudit-AUD-1783750872.md:57` — `npm run lint` (tsc ×3 shared→server→client) EXIT 0.
    </evidence>
    <note>The literal phrase "dead-export scan" names no specific tool; the plan of record operationalized it as per-file importer scans before every deletion (FE-2/FE-3/FE-4 packets: 5/13/13 documented importer scans) + BE-1's cross-package orphaned-validator grep + tsc-strict lint ×3, and RV#1's independent greps above corroborate zero orphans. Judged COVERED on function, not tool name.</note>
  </requirement>

  <requirement id="R-002" source="brief SC2" status="COVERED">
    <text>Browse/Graph/Edit surfaces removed WITH their absorption proofs cited (s3 e2e green at cut time).</text>
    <evidence>
      - Absorption-before-cut: `.claude/tasks/outputs/prog-studio-v2-2026-07-s4-retirement-FE-4-AUD-1783747734.md:63` — s3-drilldowns.spec.ts 8/8 re-verified live in the FE-4 audit turn, "satisfying the absorption-before-cut precondition"; FE-4 ui_packet cited it green before deleting.
      - Disk (RV#1): BrowsePage/GraphPage/EditPage absent from pages/; browse-store/edit-store/useBrowseData/useLinkSound greps empty (comments only); `components/browse|edit|graph` dirs are EMPTY (0 files, 0 importers — git does not track empty dirs; cosmetic local leftover only, see notes).
      - `'browse'|'edit'|'graph'` removed from AppMode (ui-store.ts:10); `grep -rn "'browse'|\"browse\"" packages/client/src` → 2 comment-only hits (ui-store.ts:7, PartyPage.tsx:217).
      - Guarded deletion: FE-4-AUD SA PASS incl. the s2-d2-edit-save `edit-page`-testid pre-delete confirmation and RETAIN confirmations for analyzeStore.ts + constants/browse.ts.
    </evidence>
  </requirement>

  <requirement id="R-003" source="brief SC3" status="COVERED">
    <text>Sessions/Progression/Programs fully reachable via the v2 rail; BottomTabBar gone — per the authorized REQVAL mapping (amend2 reqval_mapping_note + rev3 routing_notes): 9-tab NAV_ITEMS retired, SubmenuRail sole nav mechanism, bottom-bar PATTERN survives as the ratified &lt;640px fold. Not false-flagged on the literal string.</text>
    <evidence>
      - Disk (RV#1): `constants/navigation.ts` — NAV_ITEMS gone (`grep -rn NAV_ITEMS packages/client/src` → empty; retirement comment :4); RAIL_ITEMS = exactly 4 (Roster→party/Sessions/Progression/Programs, :16-23). `AppShell.tsx:15,18` — SubmenuRail global, mounted before BottomTabBar. `SubmenuRail.tsx:31` — role="navigation" aria-label="Main navigation"; "Party screen submenus" grep → empty (amend2 A2 satisfied). `BottomTabBar.tsx:1,18,32-33,49` — renders RAIL_ITEMS, component-scoped @media(min-width:640px){display:none} fold, role="tablist" aria-label="Main navigation".
      - Runtime: `...-FE-1b-AUD-1783733473.md` QA PASS — serial re-run 28 passed/0 failed incl. progression.spec.ts, program-dag, party-shell; &lt;640px fold test (4 tabs render, Sessions/Programs switching works); rail visible @1280 / BottomTabBar covers nav @390 — no zero-nav at either breakpoint. `...-FE-4-AUD-1783747734.md:63` — s2-party-shell 19/19 at close.
      - Docs cross-check: `...-DOCS-1-AUD-1783750241.md:53` — nav paragraph disk-verified (landmark exclusivity, 240px, 640px, RAIL_ITEMS source).
    </evidence>
  </requirement>

  <requirement id="R-004" source="brief SC4" status="COVERED">
    <text>CLAUDE.md + DESIGN.md reflect v2 (surfaces, procedures, architecture); stale references pruned.</text>
    <evidence>
      - `CLAUDE.md:59-64` — surfaces table = exactly the 6 v2 surfaces (Party/Agent Detail/Roster Catalog/Sessions/Progression/Programs); no cut/absorbed rows. `:66` nav paragraph (rail + fold + catalog-via-CTA; 9-tab retired). `:81` "18 procedures across 8 routers — derived by counting t.procedure … at HEAD" (RV#1 re-derived: `grep -c "t.procedure" packages/server/src/router.ts` = 18). `:109` bundle line 407.00 kB with stated measurement source (supersedes stale ~700KB). `:30` EXPORT_BASE_DIR marked Deprecated/unused.
      - `DESIGN.md:430-452` — Decision Record E "v2 IA: 9→6 Surface Consolidation & Nav-Shell Retirement (s4-retirement, 2026-07-10)": ratification chain (2026-07-07 spec / 2026-07-08 s3 sign-offs / 2026-07-10 human ratification), 9→6 consolidation, nav-shell retirement w/ hoist-first sequencing, homescreen+catalog, no new tokens, non-goals → the 4 ledger deferrals.
      - Audit: `...-DOCS-1-AUD-1783750241.md:50-56` — surfaces/procedures/nav/architecture-tree/bundle/Record-E all disk-verified PASS; the single QA FAIL (false "no current consumer" claim on ConnectivityGraphSchema) remediated and re-audited PASS: `...-DOCS-1-reaudit-AUD-1783750872.md:55-57`.
    </evidence>
  </requirement>

  <requirement id="R-005" source="brief SC5" status="PARTIAL">
    <text>Full e2e suite green; lint ×3 clean; build passing; human browser walkthrough at Step 4.5 (the program's final pre-skein gate).</text>
    <evidence>
      - Full-suite regression evidence (machine-verifiable portion COVERED): `...-FE-4-FE-1783744272.md:144-146` — terminal full `npx playwright test` run: 44 failures cross-checked 1:1 against `...-BASELINE-red.txt` via `comm -23` → empty set, ZERO new regressions vs the ratified pre-FE-1a baseline (both baseline artifacts on disk: `...-BASELINE-green.txt`, `...-BASELINE-red.txt`, per the rev3-CR PASS recipe); the one genuinely-new red (contrast-smoke EDIT-locator hang) fixed in-turn, re-verified 6/6. Post-FE-4 waves re-confirmed: `...-BE-1-AUD-1783748841.md:7` s3-drilldowns 8/8 + lint ×3 + server vitest 172 passed/2 skipped + client build green; `...-FE-4-AUD-1783747734.md:63` 32/32 (s3 8/8 + s2 19/19 + FE-CAT 5/5). The escalated keyboard-operability regression was remediated + independently audited PASS (`...-navshell-rem-AUD-1783738308.md:26` — 8/8 serial, :362 green).
      - "Green" is per the CR#3/rev3-CR-ratified baseline discipline: every pre-FE-1a-green KEEP spec green at close; remaining reds all pre-existing BASELINE-red entries (pre-sprint failures, out of s4 scope by plan of record).
      - lint ×3 clean + build passing at terminal state: `...-DOCS-1-reaudit-AUD-1783750872.md:57` (EXIT 0 ×3); build 407 kB `...-BE-1-AUD-1783748841.md:66`.
    </evidence>
    <gap>REQUIRES_HUMAN_VISUAL — the Step 4.5 human browser walkthrough (final visual acceptance of the whole v2 IA: desktop rail AND &lt;640px fold, per rev3 routing_notes) has not yet occurred. It is the program's planned final pre-skein gate, human/ORC-owned; flagging it here is the correct routing, not a delivery failure. No gap_fill_request emitted.</gap>
  </requirement>

  <requirement id="R-006" source="brief Outputs #1" status="COVERED">
    <text>Deleted: CUT pages + absorbed v1 pages, orphaned stores/components/routes/tabs; AppMode union members removed (compiler forces PAGE_MAP cleanup).</text>
    <evidence>See R-001/R-002 disk evidence. `ui-store.ts:10` — union is exactly the 6 v2 modes; `ModeContent.tsx:36` — PAGE_MAP typed `Record&lt;AppMode, React.ComponentType&gt;` (compiler-exhaustive; lint ×3 green proves cleanup). Transitive chains delivered with re-scan evidence: canvas-store + agent-roles (FE-3 packet + AUD PASS), useLinkSound + constants/canvas.ts (FE-4 packet + AUD PASS). Orphan spec swept in via amend3 (reconcile spec whole-file deleted in FE-2, provenance FE-1b §4B + AUD#2).</evidence>
  </requirement>

  <requirement id="R-007" source="brief Outputs #2" status="COVERED">
    <text>"BottomTabBar removed; v2 rail is the sole nav" — validated per the authorized outcome-based mapping (amend2 reqval_mapping_note): 9-tab NAV_ITEMS config retired; SubmenuRail is the sole nav MECHANISM; BottomTabBar.tsx survives repurposed as the rail's spec-ratified &lt;640px presentation (v2-design-spec.md 70-74/85-88).</text>
    <evidence>Same disk + runtime evidence as R-003. Exactly one "Main navigation" landmark visible at any width (DOCS-1-AUD:53 landmark-exclusivity check; FE-1b-AUD responsive assertions @1280/@390).</evidence>
  </requirement>

  <requirement id="R-008" source="brief Outputs #3" status="COVERED">
    <text>Decision on export/loadout server procedures: retained vs deprecated — PM decides with Critic gate; client surface removed either way.</text>
    <evidence>Decision made and gated: deprecate-by-removal, 24→18 (`...-rev3-PM-1783715959.md` routing_notes "Server decision unchanged (deprecate-by-removal; 24→18 …)"; Critic chain CR#1→CR#3 PASS + scoped rev3-CR PASS `...-rev3-CR-1783716600.md:3`). Executed: `...-BE-1-AUD-1783748841.md:6-7` — router.ts = 18 procedures; removed six (loadout.list/save/delete, export.spawn, planning.list, connectivity.getGraph) live-curl 404 "No procedure found"; ConnectivityGraphSchema definition byte-identical + agent-detail.ts consumer intact (RV#1 disk-confirmed: schemas.ts:212,225 + agent-detail.ts:16,44); env.ts zero-diff. Client surface removed (R-001).</evidence>
  </requirement>

  <requirement id="R-009" source="brief Outputs #4" status="COVERED">
    <text>Updated CLAUDE.md (surfaces table, procedure table, architecture tree) + DESIGN.md decision record for the v2 IA.</text>
    <evidence>Same as R-004: CLAUDE.md:59-64/66/81/109; DESIGN.md:430-452 (Record E); DOCS-1-AUD:50-56 PASS + reaudit PASS.</evidence>
  </requirement>

  <requirement id="R-010" source="brief Outputs #5" status="COVERED">
    <text>Full regression e2e sweep; KEEP surfaces reachable via rail; no dead-route 404s; bundle-size note.</text>
    <evidence>Sweep: R-005 machine evidence (comm -23 vs baseline → zero new regressions). Reachability: R-003 runtime evidence. "No dead-route 404s": the v2 app is mode-based, not URL-routed — dead-route class is structurally closed by the compiler-exhaustive `PAGE_MAP: Record&lt;AppMode,…&gt;` (ModeContent.tsx:36) over the pruned 6-mode union + lint ×3 green; corroborated live by FE-1a-AUD (app 200/console-clean smoke) and the 32/32 nav-path e2e set (FE-4-AUD:63). Bundle note: CLAUDE.md:109 (407.00 kB, measured source stated; DEFERRED-V2S2-2 marked DONE at docs/deferred-work.md:130-132).</evidence>
  </requirement>

  <requirement id="R-011" source="human scope decision 2026-07-10 (INCLUDED)" status="COVERED">
    <text>13-role catalog INCLUDED: persistent populated-home "View Full Roster" CTA → catalog surface; rail stays 4 items; party 6-cap unchanged.</text>
    <evidence>
      - Disk (RV#1): `pages/RosterCatalogPage.tsx` exists, data source `useParty` (:2,:63 — not agent.list; "13" appears only in prose comments, no magic-number count). `PartyPage.tsx:221-231` — TWO distinct CTAs, both → `setActiveMode('catalog')`: empty-state handleViewRoster (FE-4 re-point) + persistent populated-home CTA (:256 "View Full Roster", FE-CAT). RAIL_ITEMS = 4 (navigation.ts:16-23 — catalog NOT a rail item). `'catalog'` in AppMode (ui-store.ts:10) + lazy PAGE_MAP entry (ModeContent.tsx:34,36).
      - Tier-2 runtime (run evidence in audit, not re-run per Mode B): `...-FE-CAT-AUD-1783743417.md:53-56` — `prog-studio-v2-2026-07-s4-retirement-FE-CAT.spec.ts` 5/5 PASSED (spec on disk, RV#1-confirmed) incl. populated-home CTA visibility, CTA→catalog routing, uncapped roster render, keyboard CTA→catalog→card→agent-detail; s2-party-shell 19/19 (6-cap + tab-order invariants intact). Ratification cited in packet + Record E.
    </evidence>
  </requirement>

  <requirement id="R-012" source="human-approved deferral 2026-07-10" status="COVERED">
    <text>Rail collapse/expand deferred WITH authorization — requirement is to RECORD, not deliver.</text>
    <evidence>docs/deferred-work.md:148-155 — "## Sprint: prog-studio-v2-2026-07-s4-retirement (2026-07-10)" → DEFERRED-V2S4-1, citing "human-ratified 2026-07-10 (ORC-witnessed)", explicitly distinguishing the DELIVERED &lt;640px fold from the deferred desktop collapse/expand. COVERED-as-deferred.</evidence>
  </requirement>

  <requirement id="R-013" source="human-approved deferral 2026-07-10" status="COVERED">
    <text>390px header overflow (DEFERRED-V2S2-1) deferred with authorization.</text>
    <evidence>docs/deferred-work.md:157-161 — carried forward under the s4 header, "human-ratified 2026-07-10 (ORC-witnessed)", with the verifiable claim that no s4 packet touched Header/ModeContent padding. COVERED-as-deferred.</evidence>
  </requirement>

  <requirement id="R-014" source="human-approved deferral 2026-07-10" status="COVERED">
    <text>DEFERRED-V2S3-1 (retire ROSTER_AGENT_NAME_BY_CODE via AgentDetailSchema extension) deferred with authorization.</text>
    <evidence>docs/deferred-work.md:164-169 — carried forward, "human-ratified 2026-07-10 (ORC-witnessed)". FE-4 out_of_scope honored (no AgentDetailSchema/ReviseSpecAction edits in any packet; BE-1-AUD confirms agent-detail.ts intact). COVERED-as-deferred.</evidence>
  </requirement>

  <requirement id="R-015" source="human-approved deferral 2026-07-10" status="COVERED">
    <text>DEFERRED-V2S3-2 (--mg on --sfh contrast_pairs row) deferred with authorization.</text>
    <evidence>docs/deferred-work.md:171-176 — carried forward, "human-ratified 2026-07-10 (ORC-witnessed)"; DOCS-1 confirms no new tokens/contrast pairs introduced this sprint. COVERED-as-deferred.</evidence>
  </requirement>

  <requirement id="R-016" source="program.md §6 SC2 (program level)" status="COVERED">
    <text>Every v1-critique verdict realized: 3 KEEP reachable under new IA; 3 ABSORB live in drill-downs; 3 CUT removed; lint ×3 + build passing.</text>
    <evidence>
      - 3 KEEP (Sessions/Progression/Programs) reachable under the new IA: R-003 (RAIL_ITEMS entries; FE-1b-AUD 28/28 incl. progression + program-dag + party-shell; FE-4-AUD 32/32; DOCS-1-AUD nav verification).
      - 3 ABSORB (Browse/Graph/Edit) live in drill-downs: s3 absorption proof 8/8 green AT CUT TIME (FE-4-AUD:63) and re-confirmed post-BE-1 (BE-1-AUD:7, incl. PROOF 2 Graph-absorption relationship panel + live roster.getAgentDetail relationships non-empty); Browse's full-list value additionally live in the catalog (R-011, FE-CAT 5/5); Edit's value in ReviseSpecAction with agent.get/save + skill.get/save retained (BE-1-AUD SX).
      - 3 CUT (Compose/Export/Planning) removed: R-001 (client) + R-008 (server, live 404s).
      - lint ×3 + build passing at terminal state: DOCS-1-reaudit-AUD:57 (EXIT 0 ×3); client build green 407 kB (BE-1-AUD:66).
    </evidence>
  </requirement>

  <notes>
    - Overall PARTIAL is driven SOLELY by R-005's REQUIRES_HUMAN_VISUAL sub-item (Step 4.5 human walkthrough — the program's planned final pre-skein gate, human/ORC-owned). Zero MISSING items; no gap_fill_request emitted.
    - Authorized-mapping compliance: R-003/R-007 validated against the outcome-based mapping recorded in amend2 `<reqval_mapping_note>` and rev3 routing_notes ("9-tab NAV_ITEMS retired; bottom-bar pattern survives as the ratified &lt;640px fold") — the surviving repurposed BottomTabBar.tsx is NOT flagged against the literal brief string, per the close-out instruction.
    - Cosmetic observation (not a requirement gap): `packages/client/src/components/{browse,edit,graph}/` remain as EMPTY directories in the working tree (0 files, 0 importers). Git does not track empty directories, so they cannot ship in a commit; safe to rmdir at commit/cleanup time.
    - Remediation trail is clean: both mid-sprint FAILs (navshell keyboard-operability regression; DOCS-1 ConnectivityGraphSchema consumer note) were remediated and independently re-audited PASS (`navshell-rem-AUD`, `DOCS-1-reaudit-AUD`).
    - Baseline discipline: SC5's "full e2e suite green" was ratified (rev3-CR PASS) as "every pre-FE-1a-green KEEP spec green + zero new reds vs the captured BASELINE artifacts"; the 44 remaining reds at close are all pre-existing pre-sprint failures present in BASELINE-red.txt (comm -23 empty), outside s4 scope by plan of record.
  </notes>
</requirements_coverage_report>
