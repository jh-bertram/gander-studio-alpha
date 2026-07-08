# Requirements Coverage Report — prog-studio-v2-2026-07-s3-drilldowns

Validator: RV#1 (spawned subagent — Mode B per requirements-validate SKILL.md v1.1.4: 6 implementing
packets ≥ 3, requirements adjudicated against multiple competing artifacts incl. 3 human-ratified
scope decisions). Executed Steps 1–4 verbatim.

Requirement sources (Step 1):
1. PRIMARY — sprint brief 5 SCs: `docs/programs/prog-studio-v2-2026-07/sprints/prog-studio-v2-2026-07-s3-drilldowns/orchestrator_brief.md` (+ its Outputs/Invariants sections) and `docs/programs/prog-studio-v2-2026-07/program.md` §5 note 2 (abilities contracted-empty).
2. REV2 plan: `.claude/tasks/outputs/prog-studio-v2-2026-07-s3-drilldowns-rev2-PM-1783488067.md` (packet constraints + the three human-ratified items: 6-of-13 reachability, retained Browse CTA, Roster aria-current — RATIFIED 2026-07-08 "ok ×3"; cited below as knowing acceptance, NOT gaps).

Evidence base (Step 2): commits `474d686..44f01d0` (6 durability commits, `task:` + `Audit: PASS`
trailers); audit verdicts `-t{1,2,3,4a,4b,5}-AUD-*` + `-t3-rem-AUD-*` (AUD#5) + `-t3-rem2-AUD-*`
(AUD#7) — all terminal PASS (t3's AUD#3 SA contrast FAIL remediated rem1→AUD#5 PASS; t5-found
initial-focus defect remediated rem2→AUD#7 PASS; AUD#8 verified the three-change s2-spec discipline
by git diff); seam artifact `packages/client/tests/e2e/prog-studio-v2-2026-07-s3-drilldowns.spec.ts`
— full suite 27/27 green headless ×3 independent runs (FE#8 ×2: t3-rem2-FE-1783492278.md L87–115;
AUD#7: t3-rem2-AUD-1783492835.md `tests_run=27 passed=27`; AUD#8 solo: t5-AUD-1783492835.md
`27 passed (31.1s)` after Vite restart).

---

<requirement_list>
  <requirement id="R-001" type="success_criterion">SC1 — From the party screen, clicking any roster agent opens its detail view with real data: skills/hooks (materia), tools (equipment), workflows (abilities), each with provenance.</requirement>
  <requirement id="R-002" type="success_criterion">SC2 — Relationship layer renders the agent's connectivity subset (RF v12 Handle requirement honored) — Graph's ABSORB value demonstrably live.</requirement>
  <requirement id="R-003" type="success_criterion">SC3 — Spec-revision action opens/edits/saves via existing save procedures (Edit's ABSORB value) with the editor-buffer contamination class regression-tested.</requirement>
  <requirement id="R-004" type="success_criterion">SC4 — e2e: all three absorption proofs green headless; a11y keyboard pass; contrast SC.</requirement>
  <requirement id="R-005" type="success_criterion">SC5 — `npm run lint` ×3 clean; build passing; human browser check at Step 4.5.</requirement>
  <requirement id="R-006" type="constraint">program.md §5 note 2 (CONTRACTED) — `abilities` is contracted-empty; s3 must render an honest "no recorded abilities" state, never hide the panel.</requirement>
  <requirement id="R-007" type="explicit">Brief Outputs — Navigation: party card → detail → back per s2's nav contract; the three interim 'browse' targets resolved per the REV2 nav-contract decision (handleSelect→agent-detail; Roster rail→party; handleViewRoster deliberately retains 'browse' + s4 TODO).</requirement>
  <requirement id="R-008" type="constraint">Program invariants — FF7 runtime tokens only (no raw hex), contrast_pairs AA, analogy vocabulary exact (panels literally named Materia/Equipment/Abilities).</requirement>
  <requirement id="R-009" type="constraint">Program invariants + REV2 plan — AppMode∪PAGE_MAP compiler-exhaustive: 'agent-detail' extends the union; page lazy-from-birth on the shared Suspense boundary; bundle gate &lt; 1000 kB measured.</requirement>
  <requirement id="R-010" type="explicit">s3-to-s4 absorption-proof seam — a Playwright Tier-2 spec exists as the seam artifact proving all three absorbed values before s4 may cut Browse/Graph/Edit.</requirement>
  <requirement id="R-011" type="constraint">REV2 t5 — EXACTLY THREE named s2-spec changes (card-Enter marker; Roster-rail marker; L313-325 aria-current invariant rewrite) and NO FOURTH; the L364-398 "View Full Roster" CTA test untouched.</requirement>
  <requirement id="R-012" type="constraint">REV2 t4a SC(c) — `getAgentDetail` resolves ANY valid ROSTER code (incl. non-party/DI) without crash: the 6-of-13 reachability limit is a UI-entry deferral only, not a capability gap.</requirement>
  <requirement id="R-013" type="constraint">REV2 t3 (s2 AA §6 G2, BINDING HIGH class) — the Revise Dialog sets focus/role EXPLICITLY (initialFocus + role + aria-modal, never base-ui defaults); Escape closes and returns focus to the trigger.</requirement>
  <requirement id="R-014" type="constraint">REV2 plan — reuse existing load/save procedures; NO new/modified server procedure or Zod schema; s3 stays packages/client-only + e2e specs.</requirement>
</requirement_list>

---

<requirements_coverage_report>
  <task_id>prog-studio-v2-2026-07-s3-drilldowns</task_id>
  <generated>2026-07-08T01:20:00Z</generated>
  <overall_status>COVERED</overall_status>
  <requires_human_visual>true</requires_human_visual>

  <coverage>
    <item id="R-001" status="COVERED">
      <requirement>SC1 — party click → detail view with real data (materia/equipment/abilities), each with provenance</requirement>
      <evidence>Click path: PartyPage.tsx:197-202 `handleSelect` → `setSelectedAgentCode(code)` + `setActiveMode('agent-detail')` (t4b, commit 8f9cc76). Real data: AgentDetailPage.tsx:210 `trpc.roster.getAgentDetail.useQuery` (procedure verified at router.ts:794 per t4a AUD). Panels: InventoryPanels.tsx:189 MateriaPanel (skills+hooks), :231 EquipmentPanel (tools), :280 AbilitiesPanel (workflows) — commit 474d686. Provenance: shared ProvenanceChip (InventoryPanels.tsx:92-93) renders `provenancePath` on materia/ability rows; Equipment rows render `tool` with no fabricated path (t1 AUD SC(c), EquipmentSchema:427). Runtime proof (Step 2.5): e2e PROOF 1, spec.ts:95-119 — DOM-presence assertions on all three panel testids + rows-or-honest-empty structural assertion; green ×3 runs. Scope adjudication: "any roster agent" = the 6 party cards + retained Browse CTA this sprint per the HUMAN-RATIFIED 6-of-13 reachability deferral (HA-1) with capability proven by R-012 — knowing acceptance, not under-delivery.</evidence>
    </item>

    <item id="R-002" status="COVERED">
      <requirement>SC2 — relationship layer renders connectivity subset, RF v12 Handle honored, Graph ABSORB live</requirement>
      <evidence>RelationshipPanel.tsx:149 `&lt;Handle type="target" ...&gt;` + :187 `&lt;Handle type="source" ...&gt;` on EVERY node (mirrors GraphNode convention — t2 AUD load-bearing check PASS: "renders BOTH handles on every node instance"); commit 54dbef8. Feeds from `relationships[]` props, no connectivity.getGraph call (t2 AUD grep-verified). Runtime proof (Step 2.5): e2e PROOF 2, spec.ts:125-152 — asserts a VISIBLE `.react-flow__edge` (not just DOM presence, the AUD#2 VISUAL_BLINDSPOT guard) with count &gt; 0 (spec.ts:137-139, no hardcoded count), plus DETECTED/INFERRED legend real-DOM text (spec.ts:144-151); green ×3 runs. Confidence triple-encoded (accent bar + edge style + text legend, t2 AUD SA).</evidence>
    </item>

    <item id="R-003" status="COVERED">
      <requirement>SC3 — spec-revision opens/edits/saves via existing save procedures; buffer-contamination class regression-tested</requirement>
      <evidence>Existing procedures reused: ReviseSpecAction.tsx:63-67 `trpc.agent.get`/`trpc.skill.get` load path; :118-119 `trpc.agent.save.useMutation()`/`trpc.skill.save.useMutation()` (commit 0a30289 — no new server procedure, R-014). Contamination guard: revise-spec-buffer.ts reducer — `TARGET_CHANGED` unconditionally wipes; `CONTENT_LOADED`/`CONTENT_EDITED` key-guarded (t3 AUD contamination facet PASS; 6/6 unit lifecycle tests, revise-spec-buffer.test.ts). Runtime regression proof (Step 2.5): e2e PROOF 3b, spec.ts:208-266 — open A, type marker, Escape, open B, assert B's editor does NOT contain A's marker (spec.ts:252) AND the network-intercepted save payload's `name` targets B not A (spec.ts:262-265 — save mocked at the network boundary, spec.ts:212-215, never a disk write); green ×3 runs.</evidence>
    </item>

    <item id="R-004" status="COVERED">
      <requirement>SC4 — e2e three absorption proofs green headless; a11y keyboard pass; contrast SC</requirement>
      <evidence>Green headless ×3 independent runs of the full 27-test suite (both spec files): FE#8 ×2 (t3-rem2-FE-1783492278.md L87 "Running 27 tests"), AUD#7 independent third run (t3-rem2-AUD: 27 passed / 0 failed), AUD#8 solo (t5-AUD: "27 passed (31.1s)"). A11y: keyboard-operability test spec.ts:362-393 (Tab reaches revise trigger, Enter activates, Escape closes, keyboard back-to-party) + heading-structure/no-level-skip test spec.ts:395-414. Contrast: delegated to auditor static SA per plan (delegation documented spec.ts:15-16) — t1 AUD: every pairing traces to a contrast_pairs AA+ row, 0 raw hex; t3 contrast defect AUD#3 SA FAIL → rem1 → AUD#5 recomputed live ratios (--w on --sfh 13.16:1 AAA; --redb demoted to border accent 3.51:1 ≥ 3.0 non-text) PASS; plus e2e token-collision computed-style guard spec.ts:186-191.</evidence>
    </item>

    <item id="R-005" status="COVERED">
      <requirement>SC5 — lint ×3 clean; build passing; human browser check at Step 4.5</requirement>
      <evidence>Lint: `npm run lint` (tsc --noEmit ×3 shared→server→client) exit 0, independently re-run at every audit gate (t1 AUD L35; t4b AUD L39; t3-rem2 AUD test_coverage "lint(tsc ×3) exit 0"; t5 AUD). Build: t4a AUD bundle_gate — `npm run build` passing, main chunk 757.76 kB (gzip 227.54) &lt; 1000 kB gate, AgentDetailPage split to a 19.79 kB lazy chunk (commit d7f669f). Third conjunct — human browser check — is by construction a Step 4.5 close-out act sequenced AFTER this gate (same adjudication as the s2 REQVAL precedent): the sprint is in the verified state that check requires, and requires_human_visual=true makes it BLOCKING before DONE (HA-4). Not a delivery gap — it is the SC's own named ORC-side verification step (PM verbatim_deliverable_audit routes it to "routing_notes:foreground-gate", not a packet).</evidence>
    </item>

    <item id="R-006" status="COVERED">
      <requirement>Abilities contracted-empty → honest "no recorded abilities" state, never a hidden panel</requirement>
      <evidence>InventoryPanels.tsx:274 renders the literal "No recorded abilities for this agent." inside a visible first-class state (t1 AUD Tier-1 Check A: "AbilitiesPanel contracted-empty is a distinct first-class state", role="status", never null/display:none). Runtime proof: e2e spec.ts:109-111 asserts the honest empty state DIRECTLY (not conditionally) because it is the contracted default render path; DI test additionally asserts all four honest-empty strings + surfaced dataQualityNote (spec.ts:340-355).</evidence>
    </item>

    <item id="R-007" status="COVERED">
      <requirement>Navigation per s2 contract: card → detail → back; three interim 'browse' targets resolved</requirement>
      <evidence>(1) handleSelect → 'agent-detail': PartyPage.tsx:202. (2) Roster rail → 'party': navigation.ts:33 `{ label: 'Roster', mode: 'party', ... }` (RAIL_ITEMS has ZERO 'browse' — t4b AUD grep). (3) handleViewRoster DELIBERATELY retains 'browse' + s4 TODO marker: PartyPage.tsx:205-209 `// TODO(s4-cut): re-point "View Full Roster" when BrowsePage is deleted...` (t4b AUD SC(c)/(d) MET — the retained CTA is the sole remaining party/rail-path 'browse' target). Back-navigation: AgentDetailPage.tsx:108-112 `detail-back` with accessible name "Back to party" → setActiveMode('party'); runtime-proven by e2e spec.ts:272-280 and the keyboard variant spec.ts:390-392. Decisions (2) retained-CTA and (3) aria-current side-effect are HUMAN-RATIFIED (HA-2, HA-3).</evidence>
    </item>

    <item id="R-008" status="COVERED">
      <requirement>FF7 tokens only, contrast_pairs AA, exact analogy vocabulary (Materia/Equipment/Abilities)</requirement>
      <evidence>Raw-hex greps 0 matches across t1/t2/t3(rem)/t4a audits (e.g. t1 AUD L8: `#[0-9a-fA-F]{6}` → 0; all colors `var(--…)`); contrast_pairs traceability verified per-audit (t1 AUD L14; t3-rem AUD live recomputation). Analogy vocabulary literal: panel headings "Materia"/"Equipment"/"Abilities" asserted as real DOM headings in e2e spec.ts:402-404; component identifiers MateriaPanel/EquipmentPanel/AbilitiesPanel (InventoryPanels.tsx:189/:231/:280) per program invariant.</evidence>
    </item>

    <item id="R-009" status="COVERED">
      <requirement>AppMode∪PAGE_MAP exhaustive; 'agent-detail' union member; lazy-from-birth; bundle gate</requirement>
      <evidence>ui-store.ts:4 — `'agent-detail'` appended to the AppMode union (ui-store tests green, t4a AUD SC(d)). ModeContent.tsx:33 `const AgentDetailPage = React.lazy(() => import('../pages/AgentDetailPage'))` + :46 `'agent-detail': AgentDetailPage` PAGE_MAP entry on the shared Suspense boundary — never in the eager bundle (t4a AUD: detail chunk 19.79 kB lazy; main 757.76 kB &lt; 1000 kB measured, s2 AA §6 G1 lazy-from-birth honored).</evidence>
    </item>

    <item id="R-010" status="COVERED">
      <requirement>s3-to-s4 absorption-proof seam artifact: Tier-2 Playwright spec proving all three absorbed values</requirement>
      <evidence>`packages/client/tests/e2e/prog-studio-v2-2026-07-s3-drilldowns.spec.ts` (414 lines, commit 44f01d0) — 8 tests: PROOF 1 Browse (:95-119), PROOF 2 Graph (:125-152), PROOF 3a/3b Edit + buffer regression (:158-266), back-to-party (:272-280), DI honest-empty capability (:286-356), a11y ×2 (:362-414). Self-documents as the seam artifact (:1-17). Green ×3 independent runs (R-004). This satisfies the brief's `provides_to: [s4-retirement]` seam contract — s4 may now cut Browse/Graph/Edit against this proof.</evidence>
    </item>

    <item id="R-011" status="COVERED">
      <requirement>EXACTLY THREE named s2-spec changes, no fourth; L364-398 CTA test untouched</requirement>
      <evidence>t5 AUD (AUD#8) `three_change_discipline verdict="EXACTLY-THREE-CONFIRMED"` — git diff vs committed HEAD: 1 file, 22 insertions/12 deletions, exactly THREE hunks: (i) card-Enter marker → `agent-detail-page` (now s2 spec L243); (ii) rail-Roster test renamed + assertion → `party-page` (L304-315); (iii) L313-325 aria-current invariant REWRITTEN `toHaveCount(0)`→`toHaveCount(1)` + `toHaveAccessibleName('Roster')` with rationale comment rewritten (now L321-332). "View Full Roster" CTA test (now L405-408) UNTOUCHED, still asserts `browse-page` — confirmed by diff-absence AND direct grep (sole browse-page reference); SubmenuRail aria-current logic unmodified. No FOURTH change.</evidence>
    </item>

    <item id="R-012" status="COVERED">
      <requirement>getAgentDetail resolves any valid ROSTER code — 6-of-13 is UI-entry deferral, not capability gap</requirement>
      <evidence>t4a AUD SC(c)/(f) "non-party capability + no-crash PASS" (DI rendered via direct selectedAgentCode). Runtime proof: e2e DI honest-empty test spec.ts:286-356 — mocks ONLY `roster.getParty` to surface DI (the s2 house route-mock technique); the subsequent `roster.getAgentDetail(DI)` call is REAL/unmocked, proving live end-to-end capability for a specFile:null role: all four honest-empty panel states + the real parser dataQualityNote ("no agent spec on disk for code DI") + honest no-spec-to-revise fallback (spec.ts:347-348), never a crash. AgentDetailPage deriveAgentDetailState four-path state guard (t4a AUD Check A).</evidence>
    </item>

    <item id="R-013" status="COVERED">
      <requirement>Explicit Dialog focus/role; Escape returns focus to trigger (s2 AA §6 G2 HIGH class)</requirement>
      <evidence>ReviseSpecAction.tsx:177-180 — `role="dialog"` + `aria-modal="true"` + `initialFocus={() => textareaRef.current ?? false}` + `finalFocus={triggerRef}`, all EXPLICIT (t3 AUD focus_role facet: aria-modal grep of @base-ui confirms this is the sole source — not a redundant default). The t5-found pre-mount initialFocus defect (async-loaded textarea not yet mounted → Cancel got focus) was remediated in rem2 (function-form initialFocus + once-per-open layout effect, t3-rem2-FE) and verified by AUD#7. Runtime proof: e2e PROOF 3a spec.ts:182 `toBeFocused()` on the editor at open (was the 26/27 failure, now passing ×3 runs); Escape-returns-focus spec.ts:232-234 `expect(triggerA).toBeFocused()`.</evidence>
    </item>

    <item id="R-014" status="COVERED">
      <requirement>No new/modified server procedure or schema; s3 client-only + e2e</requirement>
      <evidence>All 6 commits (474d686..44f01d0) touch only `packages/client/**` + `packages/client/tests/e2e/**` (git log --stat). t3 AUD: "no server/schema changes (git status: packages/server + packages/shared clean)". Load/save reuse: ReviseSpecAction.tsx:18 comment + :63-67/:118-119 existing agent.get/skill.get + agent.save/skill.save. The one near-miss — AgentDetailSchema lacking `name`/`specFile` — was resolved client-side via the AUD#4-SANCTIONED 12-entry `ROSTER_AGENT_NAME_BY_CODE` map (AgentDetailPage.tsx:40) with a BE follow-up deferred rather than an in-sprint schema change (see notes).</evidence>
    </item>
  </coverage>

  <summary>
    <covered_count>14</covered_count>
    <partial_count>0</partial_count>
    <missing_count>0</missing_count>
  </summary>

  <human_acceptance_items>
    <item id="HA-1" status="RATIFIED 2026-07-08 (ok ×3)">6-of-13 reachability: agent-detail is reachable via the 6 party cards + the retained "View Full Roster" Browse CTA; the full 13-role catalog entry point is DEFERRED (s4 inheritance). Capability for all 13 codes proven (R-012). Knowing acceptance — SC1's "any roster agent" adjudicated under this ratified scope.</item>
    <item id="HA-2" status="RATIFIED 2026-07-08 (ok ×3)">Retained Browse CTA: `handleViewRoster` deliberately keeps `'browse'` this sprint (functional until s4) + carries the s4 TODO re-point obligation (PartyPage.tsx:205-209); the s2 CTA e2e regression stays valid/untouched.</item>
    <item id="HA-3" status="RATIFIED 2026-07-08 (ok ×3)">Roster aria-current semantic change: the Roster rail item now legitimately carries `aria-current="page"` on party home (Roster.mode='party'); the human WILL SEE Roster highlighted as current in the Step-4.5 walkthrough — intended, and the s2 invariant test was rewritten to match (R-011 change iii).</item>
    <item id="HA-4" status="BLOCKING before DONE">requires_human_visual=true — FE sprint: Step 4.5 human browser walkthrough required before sprint close. Machine evidence covers DOM presence, focus, network-boundary saves, keyboard operability, and structural states across 27/27 ×3 runs; it cannot adjudicate visual aesthetics/FF7 feel, and SC5 names the browser check as its own verification method. Suggested walkthrough: party card → detail (panels + provenance + relationship edges + confidence legend) → revise dialog (focus lands in editor; N/A quality bars read acceptably) → Escape → back-to-party → Roster rail highlight on party home.</item>
  </human_acceptance_items>

  <notes>
    - Invocation: Mode B (spawned validator), Bash available; evidence gathered first-hand (git log, source greps, spec read) + audit-verdict corroboration. Report logged per SKILL.md invocation-artifact contract.
    - Step 2.5 posture: every runtime criterion is backed by a DOM-presence assertion in the Tier-2 spec (visible RF edge count&gt;0, not canvas-mount; network-boundary save intercept asserting the payload's target, not a store side-effect; panel content/testid presence; toBeFocused) — no side-effect-only proxies. requires_human_visual is nonetheless set per SC5's explicit Step-4.5 conjunct (HA-4), matching the s2 REQVAL precedent.
    - In-sprint fixed defects (both closed, cited for the after-action): (1) t3 contrast — AUD#3 SA FAIL (--redb text on --sfh) → rem1 → AUD#5 PASS; (2) t5-found initial-focus pre-mount defect (PROOF 3a 26/27) → rem2 → AUD#7 PASS, 27/27 ×3.
    - Deferred work for ORC close-out register:
      (a) BE follow-up: add `agentName`/`specFile` to AgentDetailSchema and retire the client `ROSTER_AGENT_NAME_BY_CODE` map (AUD#4 sanctioned-duplication recommendation).
      (b) contrast_pairs: add a `--mg`-on-`--sfh` row IF that pair is ever used for text (AUD#3 advisory — currently 4.85:1, used only as non-text accent).
    - s4 inheritances (carry into the s4-retirement brief): retained Browse-CTA re-point when 'browse' leaves the AppMode union; rail collapse/expand; 390px header overflow; stale CLAUDE.md surfaces/procedures baseline; 13-role catalog entry point.
    - Brief quality: 5 explicit SCs + binding invariants — well above the 3-requirement floor; no underspecification flag.
  </notes>
</requirements_coverage_report>
