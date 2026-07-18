# Requirements Coverage Report — gander-studio-p11-v2-vision

Validator: RV#1 (Mode B spawned subagent, independent context), executing
`~/.claude/skills/requirements-validate/SKILL.md` Steps 1–4.
Requirement source: the 14-phrase `<verbatim_deliverable_audit>` (identical in
`gander-studio-p11-v2-vision-PM-1783458668.md` and the CR-passed revision
`gander-studio-p11-v2-vision-rev-PM-1783459761.md`) + the verbatim human-request fragments quoted
in the t3 packet description + the ORC-locked constraints named in the validator brief
(self-contained mockup, human-readable vision doc, 7-term analogy, DESIGN-PHASE-only scope).
Note: no standalone `<human_request>` block exists on disk in either PM file (see Notes).

## Step 1 — Extracted Requirements

<requirement_list>
  <requirement id="R-001" type="explicit">"rebuild of gander studio / we rebuild v2 now" — ORC-locked to DESIGN-PHASE: this sprint delivers the v2 design package + tangible mockup; the actual rebuild is a ratification-gated follow-up program (documented deferral, PM verbatim_deliverable_audit + risk R2).</requirement>
  <requirement id="R-002" type="explicit">v1 has grown "larger than originally envisioned"; its "presentation and organization has become a bit complicated" — the new design must answer this.</requirement>
  <requirement id="R-003" type="explicit">"make a completely new design that is more user focused."</requirement>
  <requirement id="R-004" type="explicit">"the FF7 video game menu layout" as the design direction.</requirement>
  <requirement id="R-005" type="explicit">"Immediately you are greeted by your top or active 'players'."</requirement>
  <requirement id="R-006" type="explicit">"the essential stats indicated with bars."</requirement>
  <requirement id="R-007" type="explicit">"a nice little dramatic portrait."</requirement>
  <requirement id="R-008" type="explicit">"a few submenus listed on the side with more details about various components."</requirement>
  <requirement id="R-009" type="explicit">Develop the analogy: "how the equipment, materia, abilities influences the character which compare to how skills and hooks and workflows and tools influence the agent."</requirement>
  <requirement id="R-010" type="explicit">"consider what's working with our current idea, with a critical eye."</requirement>
  <requirement id="R-011" type="explicit">"something that shows important information at a glance, allowing the user to dig deeper into more assets."</requirement>
  <requirement id="R-012" type="explicit">"new information that we can gather from our sessions that we haven't considered before."</requirement>
  <requirement id="R-013" type="explicit">"focus is less on preparing to work on a project with gander, which is more automated now."</requirement>
  <requirement id="R-014" type="explicit">"focus on reviewing the stats and contributions of the team as is and how they have performed prior."</requirement>
  <requirement id="R-015" type="constraint">ORC: the mockup must be ONE self-contained static HTML file — no external/CDN resource loads, opens via file:// with no build step, no framework.</requirement>
  <requirement id="R-016" type="constraint">ORC: the vision document must be human-readable prose (no XML ceremony tags).</requirement>
  <requirement id="R-017" type="constraint">ORC: the analogy must use ALL SEVEN of the human's verbatim terms — equipment, materia, abilities / skills, hooks, workflows, tools — with the 3-to-4 correspondence reasoned, not forced 1:1.</requirement>
  <requirement id="R-018" type="constraint">ORC: DESIGN-PHASE-only scope — no changes to packages/*, DESIGN.md, or globals.css; no implementation program planned; exit gate is human ratification.</requirement>
</requirement_list>

All 14 phrases of the PM's verbatim_deliverable_audit map into R-001..R-014 (completeness
checklist satisfied); R-015..R-018 carry the ORC constraints.

## Steps 2 / 2.5 / 3 — Coverage Report

<requirements_coverage_report>
  <task_id>gander-studio-p11-v2-vision</task_id>
  <generated>2026-07-07T22:40:03Z</generated>
  <overall_status>COVERED</overall_status>
  <requires_human_visual>true</requires_human_visual>

  <coverage>
    <item id="R-001" status="COVERED">
      <requirement>"rebuild of gander studio / rebuild v2 now" — classified against the DESIGN-PACKAGE deliverables per the ORC-locked scope</requirement>
      <evidence>All five design-package deliverables exist and passed audit: docs/v2-vision/session-data-inventory.md (AUD#1 PASS), docs/v2-vision/v1-critique.md (AUD#2 PASS), docs/v2-vision/v2-vision.md + docs/v2-vision/v2-design-spec.md (AUD#3 PASS), docs/v2-vision/mockup/party-screen.html (AUD#4 PASS). The deferral of the actual rebuild is a documented ORC decision (rev-PM lines 466-468 verbatim_deliverable_audit "deferred"; risk R2 lines 684-690) — a ratification-gated follow-up program, not a coverage gap. The rebuild itself remains OUTSTANDING BY DESIGN and must be surfaced at the human ratification gate.</evidence>
    </item>

    <item id="R-002" status="COVERED">
      <requirement>Answer "larger than originally envisioned / presentation and organization has become a bit complicated"</requirement>
      <evidence>docs/v2-vision/v1-critique.md:175-180 — 9-surface triage yields a structural halving ("9 → at most 3, with 2 absorption targets"), explicitly tied to the human's verbatim complaint; echoed in docs/v2-vision/v2-vision.md:37-43 ("nine tabs down to, at most, one home plus four submenus"). AUD#2 QA confirmed the 9-surface set matches the app's real surfaces.</evidence>
    </item>

    <item id="R-003" status="COVERED">
      <requirement>"make a completely new design that is more user focused"</requirement>
      <evidence>docs/v2-vision/v2-vision.md (whole document — new purpose, new IA, party screen + 4 submenus) and docs/v2-vision/v2-design-spec.md (full structured spec: component_hierarchy lines 21-60, layout, states lines 137-188, accessibility_spec lines 286-327). This is a ground-up re-architecture around the review purpose, not a v1 restyle.</evidence>
    </item>

    <item id="R-004" status="COVERED">
      <requirement>"the FF7 video game menu layout"</requirement>
      <evidence>docs/v2-vision/v2-vision.md:45-94 ("The FF7 Menu: Party Screen + Side Submenus" — quotes the human's direction verbatim at lines 47-50); docs/v2-vision/v2-design-spec.md:21-60 (PartyScreenPage hierarchy realizing it); mockup renders it (AUD#4 SC4). FF7 Mako-Teal palette carried through (AUD#4 SA palette-token-fidelity: 15/15 exact token matches against globals.css).</evidence>
    </item>

    <item id="R-005" status="COVERED">
      <requirement>"Immediately you are greeted by your top or active 'players'"</requirement>
      <evidence>Design: docs/v2-vision/v2-vision.md:54-63 (home = party roster "front row", the six most active roles by corpus spawn/complete volume — FE/PM/AU/AR/BE/CR, corpus-grounded via t1 §5.2). Runtime (MCP, AUD#4): t4-AUD-1783463357.md SC4 — snapshot + screenshot show 6 party-member cards immediately on load; mockup party-screen.html:297-440 (six cards, h3 agent codes at lines 310/335/360/385/410/435). Runtime criterion — see requires_human_visual note.</evidence>
    </item>

    <item id="R-006" status="COVERED">
      <requirement>"the essential stats indicated with bars"</requirement>
      <evidence>Stats grounded: docs/v2-vision/session-data-inventory.md §2.1/§2.2 (first-pass audit rate, ghost/stall rate — AVAILABLE-NOW, corpus-verified by AUD#1 QA spot-checks). Bars specified: v2-design-spec.md:190-243 (StatBar pattern, role="progressbar" contract). Runtime (MCP, AUD#4): SC4/SC6 PASS — each card renders 3 stat bars; mockup lines 313-323 et seq. (role="progressbar" + width-driven .stat-fill). Honest N/A state instead of misleading zeros (mockup line 348 etc.). Runtime criterion — see requires_human_visual note.</evidence>
    </item>

    <item id="R-007" status="COVERED">
      <requirement>"a nice little dramatic portrait"</requirement>
      <evidence>Spec: v2-design-spec.md:92-119 (asset-free portrait treatment — materia-tinted gradient frame, 2px full-saturation materia border, centered monogram, no glow, no external image). Runtime (MCP, AUD#4): SC4 PASS — "each with a portrait element (monogram + role-colored frame + flourish SVG)"; mockup lines 304-306 (portrait-frame/portrait-monogram/portrait-flourish). "Nice little dramatic" is an aesthetic judgment only the human can render — flagged for the ratification gate (requires_human_visual).</evidence>
    </item>

    <item id="R-008" status="COVERED">
      <requirement>"a few submenus listed on the side with more details about various components"</requirement>
      <evidence>Design: v2-vision.md:74-91 (four side submenus — Roster/Sessions/Progression/Programs — each with named drill-down content); v2-design-spec.md:121-135 (submenu_structure mapped 1:1 from t2 verdicts). Runtime (MCP, AUD#4): SC4 PASS — "Side submenu list present (nav 'Party screen submenus': Roster[active]/Sessions/Progression/Programs)"; mockup lines 255-290. Mockup submenu items are deliberately inert (packet out_of_scope: do NOT wire into the app router; AUD#4 gap #5 adjudicated ACCEPTABLE) — the "more details" live in the design docs, correctly for a design-phase artifact.</evidence>
    </item>

    <item id="R-009" status="COVERED">
      <requirement>Develop the equipment/materia/abilities → skills/hooks/workflows/tools analogy</requirement>
      <evidence>docs/v2-vision/v2-vision.md:96-110 — full reasoned mapping table: Materia → Skills (active) + Hooks (passive), Equipment → Tools, Abilities → Workflows, with per-row rationale (incl. the independent DESIGN.md corroboration that Skills/Hooks already carry materia colors). AUD#3 SC4 PASS verified all seven verbatim terms present and the 3-to-4 mapping reasoned, not forced.</evidence>
    </item>

    <item id="R-010" status="COVERED">
      <requirement>"consider what's working with our current idea, with a critical eye"</requirement>
      <evidence>docs/v2-vision/v1-critique.md — per-surface KEEP/ABSORB/CUT verdict for all 9 v1 surfaces with rationale (lines 70-148; summary table lines 152-166: 3 KEEP / 3 ABSORB / 3 CUT), judged against an explicitly stated v2 review-purpose lens (lines 11-27). AUD#2 verified all 9 verdicts, absorption targets named, and ORC-EVAL citations structural-only.</evidence>
    </item>

    <item id="R-011" status="COVERED">
      <requirement>"shows important information at a glance, allowing the user to dig deeper into more assets"</requirement>
      <evidence>v2-vision.md:92-94 states the flow verbatim-adjacent ("the party screen answers 'who's active and how are they doing' in one screen; the four submenus answer 'tell me everything'"); v2-design-spec.md:277-284 (interactions: card click → Roster drill-down; submenu navigation) and the density decisions backing "at a glance" (6 cards / 3 bars per card, v2-vision.md:59-72). Mockup demonstrates the at-a-glance half live (AUD#4 SC4); the dig-deeper half is specified (design-phase — drill-down navigation is follow-up-program scope).</evidence>
    </item>

    <item id="R-012" status="COVERED">
      <requirement>"new information that we can gather from our sessions that we haven't considered before"</requirement>
      <evidence>docs/v2-vision/session-data-inventory.md §2 (lines 47-201) — TEN corpus-verified candidate new stats (§2.1-§2.10), each with name/source/derivation/feasibility, explicitly diffed against the §1 DRY baseline of what v1 already surfaces (lines 11-44) so nothing is re-proposed. AUD#1 QA reproduced the headline claims against the live corpus (29 distinct ev types vs 6 parsed; 7 ghosts exact-match; 60% critique block rate). Tokens/cost honestly gated NEEDS-SCHEMA-EXTENSION citing DEFERRED-P9-1 (§3, lines 204-231).</evidence>
    </item>

    <item id="R-013" status="COVERED">
      <requirement>"focus is less on preparing to work on a project with gander, which is more automated now"</requirement>
      <evidence>v1-critique.md:11-27 (the review-purpose lens is built on exactly this premise; all 3 CUT surfaces — Compose, Export, Planning — are cut BECAUSE they serve the now-automated prepare-for-work half, lines 168-169); v2-vision.md:13-24 ("The New Purpose": "That moment has passed. Loadout preparation is now largely automated").</evidence>
    </item>

    <item id="R-014" status="COVERED">
      <requirement>"focus on reviewing the stats and contributions of the team as is and how they have performed prior"</requirement>
      <evidence>v2-vision.md:21-24 ("Studio v2's purpose is a review surface... 'how did my team do?'"); session-data-inventory.md §2/§5.2 (performance-history stats + real per-agent corpus values); the party screen's three bars are all past-performance measures (Activity/Stamina/Accuracy — v2-design-spec.md:364-397 sample_data_appendix, values traced to t1 §5.2 per AUD#3 SC10).</evidence>
    </item>

    <item id="R-015" status="COVERED">
      <requirement>Constraint: ONE self-contained static HTML mockup, zero external loads, file://-openable, no build/framework</requirement>
      <evidence>docs/v2-vision/mockup/party-screen.html (single 558-line file). AUD#4 SC2 PASS: all external-load greps zero (src="http, href="http, @import, cdn., url(http, url(//, @font-face, protocol-relative) — independently re-run by this validator (0 matches). AUD#4 SA single-file-discipline PASS (no imports, one inline style + one inline script). Runtime: console-clean via MCP navigate (SC3 — sole console line is the serving-harness favicon 404, adjudicated a harness artifact; the artifact makes zero network requests). Note: MCP blocks file:// so AUD#4 verified over the sanctioned localhost http.server fallback; FE#1's packet attests direct file:// open — trivially re-checkable by the human at the ratification gate.</evidence>
    </item>

    <item id="R-016" status="COVERED">
      <requirement>Constraint: human-readable vision doc, no XML ceremony</requirement>
      <evidence>docs/v2-vision/v2-vision.md — end-to-end prose. AUD#3 SC1 PASS: grep for &lt;task_packet|&lt;design_spec|&lt;success_criteria|&lt;statistical_report → zero matches.</evidence>
    </item>

    <item id="R-017" status="COVERED">
      <requirement>Constraint: all SEVEN verbatim analogy terms, 3-to-4 correspondence reasoned</requirement>
      <evidence>v2-vision.md:96-110 — equipment, materia, abilities, skills, hooks, workflows, tools all present verbatim; explicit reasoning for the asymmetry ("Three game concepts, four agent concepts, one clean reasoned mapping — no term dropped", line 109). AUD#3 SC4 PASS.</evidence>
    </item>

    <item id="R-018" status="COVERED">
      <requirement>Constraint: DESIGN-PHASE-only — no packages/*, DESIGN.md, or globals.css edits; no implementation program planned</requirement>
      <evidence>All four audit verdicts ran git-scope checks: AUD#1 sx ("zero packages/ entries"), AUD#2 sx, AUD#3 sx ("ZERO edits to packages/*, DESIGN.md, or globals.css"), AUD#4 sx git-scope PASS. All deliverables live under docs/v2-vision/ + .claude/tasks/outputs/. Both design docs end with explicit no-implementation-authorized statements (v2-vision.md:210-213; v2-design-spec.md preamble). The FF7-vs-Clarity palette direction is correctly left OPEN for human ratification (v2-vision.md:142-206, AUD#3 SC11 PASS), not pre-decided.</evidence>
    </item>
  </coverage>

  <summary>
    <covered_count>18</covered_count>
    <partial_count>0</partial_count>
    <missing_count>0</missing_count>
  </summary>

  <notes>
    1. REQUIREMENT-SOURCE PROVENANCE. No standalone verbatim &lt;human_request&gt; block exists on
       disk: the validator brief said it was embedded at the top of the PM round-0 file, but both PM
       files contain only (a) the 14-phrase verbatim_deliverable_audit and (b) verbatim human-request
       fragments quoted inside the t3 packet description. Requirements were reconstructed from those
       two sources plus the ORC constraints in the spawn brief. The 14-phrase checklist is fully
       consumed (R-001..R-014, 1:1). Recommend future orchestrator_briefs persist the raw
       human_request text into the PM output file so REQVAL can validate against unmediated source.
    2. RUNTIME CRITERIA / STEP 2.5. R-005..R-008 and R-015's render half are runtime criteria. They
       are marked COVERED on the strength of AUD#4's actual MCP render evidence (navigate + console
       + snapshot + screenshot on the served artifact — DOM-presence adjudication, not a
       side-effect proxy), which exceeds the spec-file standard of Step 2.5. Nevertheless
       requires_human_visual is set TRUE deliberately: this design sprint's exit gate is human
       ratification (the Step-4.5 analog), and qualities like "nice little dramatic" and overall
       glanceability are aesthetic judgments static evidence cannot close. ORC must surface the
       mockup (double-click docs/v2-vision/mockup/party-screen.html) and the Open Ratification
       Question (v2-vision.md:142-206) to the human before sprint close.
    3. DEFERRAL LEDGER FOR THE RATIFICATION PACKAGE. (a) The v2 REBUILD itself is deferred to a
       ratification-gated follow-up program (R-001 — documented, not a gap). (b) The
       FF7-vs-Studio-Clarity palette direction is deliberately unresolved and submitted to the human
       (t3 SC11) — including the designer's finding that DESIGN.md's Decision Record A already
       superseded the Clarity migration, making DESIGN.md internally inconsistent (AUD#3 verified;
       DESIGN.md-hygiene cleanup recommended via generate-design after the human decides).
       (c) t3-internal inconsistency: states prose says --nav-active-bg for the active submenu
       background while contrast_pairs verifies --mt on --sfh; FE implemented the AA-verified pair
       (AUD#4 deviation #2, advisory against t3) — reconcile in any future spec revision.
       (d) Card-hover Popover quick-peek not in the static mockup (AUD#4 gap #4) — required in the
       eventual v2 React build.
    4. Brief quality: 18 requirements extracted (≥3) — no underspecification flag.
  </notes>
</requirements_coverage_report>

## Step 4 — Routing

overall_status = COVERED. No PARTIAL or MISSING items → no gap_fill_request blocks. The sprint may
proceed to the ORC ratification-package report and Archivist logging, with the requires_human_visual
flag and the Note-3 deferral ledger surfaced to the human at the ratification gate.
