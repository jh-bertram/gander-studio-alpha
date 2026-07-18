# Archive Entry — prog-studio-v2-2026-07-s4-retirement (SPRINT CLOSE)

**Status:** TASK_COMPLETE — DONE-PENDING-4.5 (REQVAL Step 4.5 human visual walkthrough pending; all 8 packets + 2 remediations audit-PASS; REQVAL 15/16 COVERED).

**Timestamp (from SPAWN event):** 2026-07-11T06:38:32Z

---

## Archive Entry

```xml
<archive_entry>
  <timestamp>2026-07-11T06:38:32Z</timestamp>
  <task_id>prog-studio-v2-2026-07-s4-retirement</task_id>
  <event_type>TASK_COMPLETE</event_type>
  
  <sprint_context>
    <program_id>prog-studio-v2-2026-07</program_id>
    <sprint_roster_siblings source="docs/programs/prog-studio-v2-2026-07/program.md §3">prog-studio-v2-2026-07-s1-data-layer, prog-studio-v2-2026-07-s2-party-shell, prog-studio-v2-2026-07-s3-drilldowns, prog-studio-v2-2026-07-s4-retirement</sprint_roster_siblings>
    <sprint_role>v2 retirement: CUT Compose/Export/Planning surfaces; ABSORB Browse/Graph/Edit into drill-downs; consolidate Sessions/Progression/Programs under submenu IA; delete 9-tab BottomTabBar config; add 13-role Roster Catalog; update CLAUDE.md/DESIGN.md to v2 reality; record human-approved deferrals</sprint_role>
  </sprint_context>

  <contract_source>docs/v2-vision/v1-critique.md</contract_source>
  <contract_summary>The sprint completed the v1-critique verdict triage (Verdict Summary table, L154-164): 3 KEEP (Sessions/Progression/Programs) reachable under new IA; 3 ABSORB (Browse/Graph/Edit) live in drill-downs with absorption proof cited; 3 CUT (Compose/Export/Planning) deleted from client + server.</contract_summary>

  <packets_delivered count="8" source=".claude/tasks/outputs/prog-studio-v2-2026-07-s4-retirement-rev3-PM-1783715959.md">
    FE-1a (nav hoist), FE-1b (nav fold), FE-2 (Compose deletion), FE-3 (Export+Planning deletion), FE-CAT (13-role catalog), FE-4 (Browse/Graph/Edit deletion + absorption), BE-1 (server procedure deprecate-by-removal), DOCS-1 (v2 docs refresh)
  </packets_delivered>

  <remediation_rounds count="2">
    <remediation task_id="prog-studio-v2-2026-07-s4-retirement-navshell-rem" auditor="AUD#4">
      Defect: FE-2 audit (AUD#3) carry-forward — s3-drilldowns.spec.ts:362 a11y keyboard-operability deterministically RED (3/3 runs); AUD#3 attributed to FE-1a global rail tab stops. Root cause adjudication (AUD#4, source: .claude/tasks/outputs/prog-studio-v2-2026-07-s4-retirement-navshell-rem-AUD-1783738308.md): FE#4's fixture-coupling + uncapped-graph trace VERIFIED; AUD#3's rail attribution DISPROVEN. AppShell DOM order Header→Rail→ModeContent (rail precedes detail-back; zero stops on forward-only path). party-roster.ts:172 byActivityRecencyDesc live time-varying sort. RelationshipPanel buildRelationshipGraph N+1 nodes + N edges uncapped. Remediation: test bound scaled `Math.max(40, rfFocusableCount + 20)` to absorb the uncapped graph. Result: AUDIT PASS.
    </remediation>
    <remediation task_id="prog-studio-v2-2026-07-s4-retirement-DOCS-1-rem" auditor="AUD#10">
      Defect: DOCS-1 audit (AUD#9) QA FAIL — CLAUDE.md tRPC section false claim: "ConnectivityGraphSchema has no current consumer." Source: .claude/tasks/outputs/prog-studio-v2-2026-07-s4-retirement-DOCS-1-AUD-1783750241.md, reason field. Remediation (FE#9): replaced false sentence with corrective text from AUD#9 verdict: "it still has an active consumer: `packages/server/src/parsers/agent-detail.ts` imports it (line 16) and `safeParse`s the on-disk connectivity graph with it (line 44)…" Disk-verified agent-detail.ts:16 import, :44 safeParse. Result: AUDIT PASS (AUD#10, .claude/tasks/outputs/prog-studio-v2-2026-07-s4-retirement-DOCS-1-reaudit-AUD-1783750872.md).
    </remediation>
  </remediation_rounds>

  <audit_verdicts count="10" all_pass="true">
    FE-1a-AUD-1783719189 (PASS), FE-1b-AUD-1783733473 (PASS), FE-2-AUD-1783735518 (PASS), navshell-rem-AUD-1783738308 (PASS), FE-3-AUD-1783739941 (PASS), FE-CAT-AUD-1783743417 (PASS), FE-4-AUD-1783747734 (PASS), BE-1-AUD-1783748841 (PASS), DOCS-1-AUD-1783750241 (FAIL, remediated), DOCS-1-reaudit-AUD-1783750872 (PASS)
  </audit_verdicts>

  <reqval_status source=".claude/tasks/outputs/prog-studio-v2-2026-07-s4-retirement-REQVAL-1783751300.md">
    <overall>PARTIAL (15/16 COVERED; 1 REQUIRES_HUMAN_VISUAL)</overall>
    <gap>R-005: Full e2e suite green + human browser walkthrough at Step 4.5 (program's final pre-skein gate). Machine-verifiable portion COVERED (zero new regressions vs baseline; baseline discipline enforced via rev3-CR PASS recipe; carry-forward navshell keyboard regression remediated + re-audited PASS; lint ×3 + build green). REQUIRES_HUMAN_VISUAL = Step 4.5 human browser walkthrough (final visual acceptance of whole v2 IA: desktop rail AND &lt;640px fold, per rev3 routing_notes) — human/ORC-owned; flagged here as correct routing, not a delivery failure.</gap>
  </reqval_status>

  <commits source=".claude/tasks/outputs/prog-studio-v2-2026-07-s4-retirement-COMMIT-1783751900.md">
    <commit sha="3acdfab" subject="chore(orchestration): prog-studio-v2-2026-07-s4-retirement ceremony" task="prog-studio-v2-2026-07-s4-retirement" />
    <commit sha="41eddd9" subject="feat(v2-nav): hoist SubmenuRail into AppShell as global primary nav" task="prog-studio-v2-2026-07-s4-retirement-FE-1a" audit="PASS" />
    <commit sha="272859b" subject="feat(v2-nav): retire 9-tab NAV_ITEMS, fold rail into bottom bar &lt;640px" task="prog-studio-v2-2026-07-s4-retirement-FE-1b" audit="PASS" />
    <commit sha="c7121b9" subject="test(v2-detail): scale a11y tab bound to measured RF focusable count" task="prog-studio-v2-2026-07-s4-retirement-navshell-rem" audit="PASS" />
    <commit sha="b9896bf" subject="feat(v2-retire): delete Compose surface (pages, store, components, 8 specs)" task="prog-studio-v2-2026-07-s4-retirement-FE-2" audit="PASS" />
    <commit sha="1755e42" subject="feat(v2-retire): delete Export and Planning surfaces" task="prog-studio-v2-2026-07-s4-retirement-FE-3" audit="PASS" />
    <commit sha="280173f" subject="feat(v2-catalog): add 13-role RosterCatalogPage + Tier-2 spec" task="prog-studio-v2-2026-07-s4-retirement-FE-CAT" audit="PASS" />
    <commit sha="9cd19da" subject="feat(v2-retire): delete absorbed Browse/Graph/Edit; AppMode to 6 v2 members" task="prog-studio-v2-2026-07-s4-retirement-FE-4" audit="PASS" />
    <commit sha="abbe8c7" subject="feat(v2-retire): remove 6 compose-era tRPC procedures (24 to 18)" task="prog-studio-v2-2026-07-s4-retirement-BE-1" audit="PASS" />
    <commit sha="a7e4b96" subject="docs(v2): refresh CLAUDE.md + DESIGN.md to v2 reality; record deferrals" task="prog-studio-v2-2026-07-s4-retirement-DOCS-1" audit="PASS (via reaudit)" />
  </commits>

  <human_approved_deferrals source="docs/deferred-work.md §Sprint: prog-studio-v2-2026-07-s4-retirement (2026-07-10)" count="4">
    <deferral id="DEFERRED-V2S4-1">Roster rail collapse/expand not implemented (ratification: "human-ratified 2026-07-10 (ORC-witnessed)")</deferral>
    <deferral id="DEFERRED-V2S2-1">390px global header/main horizontal overflow (carried forward, re-confirmed open and deferred, ratification: "human-ratified 2026-07-10 (ORC-witnessed)")</deferral>
    <deferral id="DEFERRED-V2S3-1">Retire ROSTER_AGENT_NAME_BY_CODE via schema extension (carried forward, re-confirmed open and deferred, ratification: "human-ratified 2026-07-10 (ORC-witnessed)")</deferral>
    <deferral id="DEFERRED-V2S3-2">contrast_pairs row for --mg on --sfh (carried forward, re-confirmed open and deferred, ratification: "human-ratified 2026-07-10 (ORC-witnessed)")</deferral>
  </human_approved_deferrals>

  <rationale>
The sprint delivered the v1-critique contract (docs/v2-vision/v1-critique.md): Compose/Export/Planning (3 CUT) removed from client+server; Browse/Graph/Edit (3 ABSORB) deleted with absorption proof cited (s3-drilldowns.spec.ts 8/8 green at cut time); Sessions/Progression/Programs (3 KEEP) fully reachable under the v2 submenu IA (SubmenuRail hoisted to global nav, 9-tab BottomTabBar config retired, &lt;640px fold ratified). The 13-role Roster Catalog surface added with persistent "View Full Roster" CTA (human-ratified 2026-07-10). CLAUDE.md/DESIGN.md refreshed to v2 reality (surfaces table 9→6, procedures 24→18, DESIGN.md Decision Record E ratification chain, stale references pruned). All 8 packets audit-PASS; 2 mid-sprint audit failures (FE-2 carry-forward a11y regression; DOCS-1 false ConnectivityGraphSchema claim) remediated and independently re-audited PASS. REQVAL 15/16 COVERED; R-005 REQUIRES_HUMAN_VISUAL = Step 4.5 human browser walkthrough (final pre-skein gate, human/ORC-owned). Four human-approved deferrals (rail collapse, header overflow, AgentDetailSchema extension, contrast_pairs row) recorded with ratification citations in docs/deferred-work.md.
  </rationale>

  <dependencies>
    prog-studio-v2-2026-07-s1-data-layer (backend schema/procedures/parsers seeded the integration seams), prog-studio-v2-2026-07-s2-party-shell (party-screen IA + submenu rail hoist originated here), prog-studio-v2-2026-07-s3-drilldowns (absorption targets Browse/Graph/Edit drill-downs; absorption proof cited at CUT time), docs/v2-vision/v1-critique.md (contract source for CUT/KEEP/ABSORB verdicts)
  </dependencies>

  <retention_keys>
    - Sibling sprints under program prog-studio-v2-2026-07: s1-data-layer, s2-party-shell, s3-drilldowns, s4-retirement (source: docs/programs/prog-studio-v2-2026-07/program.md §3)
    - Navigation consolidation outcome: 9 v1 surfaces → 6 v2 surfaces (Party/Agent Detail/Roster Catalog/Sessions/Progression/Programs); v1-critique verdicts (3 KEEP/3 ABSORB/3 CUT) realized (source: v1-critique.md Verdict Summary)
    - Server procedure reduction: 24→18 (removed: loadout.list/save/delete, export.spawn, planning.list, connectivity.getGraph) (source: commit-record BE-1 entry)
    - Defect resolutions: navshell keyboard-operability (first-row fixture coupling + uncapped RelationshipPanel graph; AUD#4 adjudication DISPROVEN rail attribution); DOCS-1 false ConnectivityGraphSchema consumer claim remediated (source: navshell-rem-AUD-1783738308.md + DOCS-1-reaudit-AUD-1783750872.md)
    - REQVAL status: PARTIAL (15/16 COVERED); R-005 gap = Step 4.5 human browser walkthrough pending (source: REQVAL-1783751300.md overall_status + gap fields)
    - Four human-ratified deferrals recorded in docs/deferred-work.md with 2026-07-10 witness citations
    - Commits: 10 durability commits from 3acdfab (ceremony) through a7e4b96 (docs refresh) (source: commit-record commits section)
  </retention_keys>

  <commit_status>VERIFIED</commit_status>
  <commit_precondition_source>.claude/tasks/outputs/prog-studio-v2-2026-07-s4-retirement-COMMIT-1783751900.md</commit_precondition_source>

</archive_entry>
```

---

## Verification Notes (ANTI-DRIFT discipline applied)

✓ **Commits block:** Copied verbatim sha+subject from commit-record §commits; all 10 entries carry task: trailers for durability verification  
✓ **Sibling/program identifiers:** Copied from docs/programs/prog-studio-v2-2026-07/program.md §3 roster verbatim  
✓ **Contract source:** Cited docs/v2-vision/v1-critique.md (contract's canonical location)  
✓ **Defect characterizations (2 rounds):** Copied from audit verdicts — navshell-rem (AUD#4) root-cause adjudication; DOCS-1-rem false claim + correction (AUD#10 re-audit PASS)  
✓ **Finder attributions:** Navshell keyboard a11y red initially FOUND by AUD#3 as carry-forward flag, attributed rail; DISPROVEN by AUD#4 via fixture-coupling + uncapped-graph trace. DOCS-1 false claim found by AUD#9, corrected by FE#9, confirmed by AUD#10 — all instance numbers exact  
✓ **Counts verified:** 8 packets (named list), 2 rem tasks, 10 audit verdicts (7 original + navshell-rem + 2 DOCS-1 rounds), REQVAL 15/16 COVERED (source: REQVAL-1783751300.md summary fields)  
✓ **Human deferrals:** 4 items copied verbatim from docs/deferred-work.md §Sprint: prog-studio-v2-2026-07-s4-retirement (2026-07-10), all citing "human-ratified 2026-07-10 (ORC-witnessed)" witness clause  
✓ **Timestamp:** Copied from SPAWN event seq 45 (docs/events/agent-events-2026-07-11.jsonl line 45)
