<plan_critique>
  <plan_id>gander-studio-p11-v2-vision</plan_id>
  <status>BLOCK</status>

  <challenges>
    <challenge>
      <type>AUDIT_RISK</type>
      <severity>BLOCKER</severity>
      <task_ref>gander-studio-p11-v2-vision-t3</task_ref>
      <description>
The sprint's single HIGH risk (R1: FF7 Mako-Teal vs. the RATIFIED "Studio Clarity" migration
direction) has NO success criterion enforcing that the vision doc surfaces it. Verified on disk:
DESIGN.md line 123 states the FF7 tokens (--void/--sf/--mt/...) are "the legacy system. Studio
Clarity replaces them with semantic --color-* tokens... legacy tokens should be removed
file-by-file." The human and constraint 3 want v2 to lean INTO FF7 — i.e. reverse that ratified
migration. That reversal is THE direction decision the ratification gate exists to obtain human
sign-off on. t3's SC1-SC10 can ALL be satisfied by a vision doc that never mentions the conflict:
SC7 only requires `design_system_source: DESIGN_MD`, and the FF7-IA/token-tracing instructions
force engagement with the palette but not disclosure of the Clarity-reversal tension. R1 lives
only in `risk_flags` and `design_md_status` (routing prose), which the implementing UI agent may
never see and which no auditor gates on. ORC's ratification-package report ASSEMBLES the five
deliverables — it does not author new analysis — so if t3 omits the decision, it never reaches the
human. This is the exact prose-rule-bypass class the team keeps failing on (p10 §6 G2, agent-changelog
2026-04-27 "prose-only PM rules were repeatedly bypassed; mechanical enforcement is the fix").
      </description>
      <required_revision>
Add a t3 SC (on v2-vision.md) requiring the vision doc to explicitly surface the FF7-vs-Studio-Clarity
palette-direction decision as an OPEN RATIFICATION QUESTION: name that DESIGN.md's ratified direction
migrates AWAY from the FF7 runtime tokens toward semantic --color-* tokens, state that v2 proposes
re-embracing/retaining the FF7 identity, and mark the palette direction as requiring human sign-off
(not silently pre-decided by the designer). This is the enforceable form of R1.
      </required_revision>
    </challenge>
    <challenge>
      <type>AUDIT_RISK</type>
      <severity>WARNING</severity>
      <task_ref>gander-studio-p11-v2-vision-t4</task_ref>
      <description>
t4 SC2's external-load pattern set (`src="http`, `href="http`, `@import`, `cdn.`) does not catch the
most common ways an external resource sneaks into a self-contained HTML file: CSS `url(http...)` /
`url(//...)` (backgrounds, list-style, mask), `@font-face { src: url('https://...') }` (a web font —
NOT matched: it is `src:` with a url(), not `src="`, and the host need not contain "cdn."), and
protocol-relative `//host/...` refs. The PM's own out_of_scope explicitly forbids "web fonts over the
network," yet the SC that verifies self-containment cannot detect the canonical web-font load. SC3
(console-clean) is a weak backstop: on a networked audit host an external load succeeds silently with
no console error, and failed image/font loads frequently do not emit console errors. This is the load-
bearing self-containment guarantee of the ratification artifact.
      </required_revision>
      <required_revision>
Broaden t4 SC2 to also assert ZERO occurrences of: `url(http`, `url(//`, `url('http`, `url("http`
(external CSS urls, incl. protocol-relative), and any `@font-face`/`src:` referencing `http`/`//`.
Keep the existing inline-SVG `xmlns="http://www.w3.org/2000/svg"` exemption (it matches none of these).
      </required_revision>
    </challenge>
    <challenge>
      <type>AUDIT_RISK</type>
      <severity>WARNING</severity>
      <task_ref>gander-studio-p11-v2-vision-t4</task_ref>
      <description>
t4 is the sprint's ONLY rendered visualization surface, yet its SCs (SC1-SC6) are file-existence,
console-clean, render-adjudication, roster-code-count, and palette/bar-markup presence — none gates
LEGIBILITY. ORC-EVAL §5 (cited by the PM's own R6 and recurring_pattern) is unambiguous: every human-
caught escaped defect at the review gate was legibility (invisible/compressed/clipped text), never a
logic bug, and "every new visualization surface must budget a legibility SC up front." t3 SC9 verifies
contrast_pairs at the SPEC level, but t4 declares its OWN inline `:root` palette (SC6) and nothing ties
the mockup's rendered text pairs back to t3's AA-verified pairs. A mockup that renders low-contrast FF7
text (e.g. the DEFERRED-006 red-on-void class) passes every t4 SC and becomes exactly the defect the
human catches at the ratification gate.
      </description>
      <required_revision>
Add a t4 SC binding the mockup's rendered text/background token pairs to the AA-verified contrast_pairs
in t3's v2-design-spec (no normal text below 4.5:1; no red-on-void body text), verifiable by the auditor
via screenshot/snapshot adjudication of the rendered surface (no interaction primitive required).
      </required_revision>
    </challenge>
  </challenges>

  <audit_risk_forecast>
1. MP/cost-bar aspirational-labeling chain (R3): t1 forces tokens/cost to NEEDS-SCHEMA-EXTENSION
   (SC4, DEFERRED-P9-1 verified on disk) and t3 SC5 flags the gap, but NO t4 SC prevents the mockup
   from rendering an MP-style/"cost" stat bar that visually implies token data exists. If the spec's
   sample-data appendix carries an unlabeled MP bar, the mockup will render team economics as real.
   Ensure the t3 spec labels any cost/MP bar aspirational and the appendix carries that label into t4.
2. Legibility at the ratification gate (the recurring escaped-defect class) — mitigated only if the
   t4 legibility SC above is added; otherwise the highest-probability human-caught defect ships.
  </audit_risk_forecast>

  <post_mortem_patterns_checked>
Read in full: docs/after-actions/gander-studio-p10-deferred-smalls.md (§4/§5/§6: self-defeating-SC
class, auditor MCP-no-interaction toolset G3, background-bash-denied G4, subagentstop-miss G5,
recurring-pattern enforcement) and docs/after-actions/gander-studio-p9-sessions-feed-agentstats.md
(§5/§6: edit-heavy background-agent stall G1, spec/UI agents complete fine on long turns). Also
consulted docs/agent-changelog.md (Critic 4+-file BLOCKER threshold, recurring-pattern declaration
enforcement, mechanical-over-prose enforcement). Verified: dependency order (t1||t2)→t3→t4 is correct
and file-consuming (no FE-before-schema / no missing dep); no external API → no MISSING_RESEARCH; t3's
two coupled docs are not an OVERSCOPED violation (design authoring, no 50-line code limit, sound
coupling rationale, p9 confirms spec-only UI agents do not stall); t4's single ~350-600-line HTML
artifact is constraint-mandated-indivisible and correctly flagged foreground-only per p9 G1; all
context_files resolve on disk; sc-precheck report attached (0 findings); PM declared 6 recurring_pattern
elements (recurrence-declaration gate satisfied); auditor-capability fit confirmed for all t4 SCs
(navigate/snapshot/console/screenshot + grep only, no interaction primitive — p10 G3 honored);
R2 verbatim-vs-locked scope handled via verbatim_deliverable_audit deferral (accepted per ORC framing).
  </post_mortem_patterns_checked>
</plan_critique>
