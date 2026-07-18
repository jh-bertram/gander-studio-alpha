# Audit Verdict — prog-studio-v2-2026-07-s2-party-shell-t6 (AUD#8)

Independent audit of FE#6's Tier-2 e2e spec as the sprint's standing regression gate.
Target is the QUALITY of the committed spec (its runtime results were already re-verified by
AUD#6 ×2 + AUD#7 ×1). Envelope: v2.0 typed (task_id first-SPAWN 2026-07-08 UTC, post-cutover).

## Working notes / evidence

- **Check A (test-file silent-substitution — the audit target itself):** clean. No `test.skip`,
  `test.only`, `test.fixme`, `test.fail`, `describe.skip/only`, `expect.soft`, or `try/catch`
  anywhere in the spec. Every `return` is a helper-function return (lines 46/50/57/63/95/467),
  never an assertion-skipping early return inside a test body. The two `if`s are a console-error
  filter (L93) and a Tab-loop bound (L258). The single `waitForTimeout(3200)` (L231) is a
  deliberate HOLD-and-verify window proving focus is retained (blurCount===0) after the diagnosed
  oscillation observation point — not a race against a correctness-bearing state transition (the
  file header L11-12 explicitly disavows that anti-pattern; state transitions use `page.route`).
- **Note on FE packet vs committed spec:** the FE#6 packet (pre-t3-rem) describes test #5 as a
  `test.fail()`-annotated KNOWN DEFECT. The committed spec is the POST-t3-rem strengthening
  (spec L199-209): the focus-oscillation was FIXED via `initialFocus={false}`, and test #5 is now
  a HARD assertion (blurCount===0 + Enter→browse-page). No masking annotation remains — this is
  the stronger, correct state and the reason the gate is trustworthy.
- **W3 destination-marker compliance:** every rail-nav assertion targets a DESTINATION DOM marker,
  not `activeMode`: Sessions→`sessions-list-page` testid (L284); Progression→`PROGRESSION LEDGER`
  heading (L294); Programs→`.react-flow__pane`/terminal-state text (L302); Roster→`browse-page`
  testid (L310). aria-current absence (L324) asserted as the CORRECT R-3 state.
- **Mobile viewport:** explicit `page.setViewportSize(MOBILE_VIEWPORT)` (L498); desktop L483/L249.
- **Side-Effect-As-Proxy pairing:** the whole-card keyboard test pairs the `blurCount` side-effect
  probe with DOM consequences (`toBeFocused` L232 + `browse-page` visible L241). Compliant.
- **assertNoHorizontalOverflow is not a no-op:** checks both `scrollWidth<=clientWidth+1` AND the
  party-page right edge `<= viewport+1` (L83-85) — a real in-scope regression would fail it.
- **Independent headless run (this audit):** `npx playwright test <spec>` → **19 passed (41.6s),
  exit 0**. Matches FE#6's reported run and AUD#6/AUD#7.
- **Coverage vs manifest receipt items:** live default ≥3 codes (t1), portrait+code+3 bars/card
  (t2), popover hover+keyboard (t3/t4), whole-card Tab+Enter→browse (t5), rail aria-current +
  4 destination markers (t7-11), diagnostics footnote via drift-safe regex (t12), loading skeleton
  (t13), empty+error via route interception (t14/t15), BottomTabBar 9-tab no-regression (t16),
  legibility computed-style (t17), dual-width screenshots (t18/t19). Complete.
- **SX:** commit dbc4b87 is spec-only (1 file, 511 insertions); no prod-code touch; no secrets.

## Overflow-scoping adjudication (requested)

**LEGITIMATE scoping — NOT a masked defect.** W3's literal wording is "no horizontal overflow on
the grid container"; scoping `assertNoHorizontalOverflow` to `[data-testid="party-page"]` correctly
isolates SC2 to the surface t1–t6 built. The ~16px 390px overflow originates from
`Header.tsx`/`ModeContent.tsx` (fixed 28px non-responsive padding) — pre-existing files this
sprint's `out_of_scope` forbids touching, and independent of PartyPage (party-page/.grid measure
350px, flush within 390px). Critically, the pre-existing overflow is **ROUTED, not silently
accepted**: FE#6 packet "Flagged defects §2" documents it with reproduction, root cause, and an
explicit s4 routing pointer (per risk-flag R-1, which owns the mobile-nav fold). This satisfies the
auditor requirement that a pre-existing overflow be deferred-with-routing rather than swallowed.

<audit_verdict schema_version="2.0">
  <task_id>prog-studio-v2-2026-07-s2-party-shell-t6</task_id>
  <provenance_marker>audit-pipeline@2.0.0</provenance_marker>
  <auditor_spawn>
    <agent_id>AUD#8</agent_id>
    <parent>ORC#0</parent>
    <independent_from>FE#6</independent_from>
  </auditor_spawn>
  <inputs>
    <input sha256="658e8a7d85b25fcdb13d3bcbb9363af8cb54064bbcf8e8554a5730020e78eb7b">packages/client/tests/e2e/prog-studio-v2-2026-07-s2-party-shell.spec.ts</input>
    <input sha256="16675f0383fe47382238c862b92fe0367f301174a8c7be716c1a5197ddde94dd">.claude/tasks/outputs/prog-studio-v2-2026-07-s2-party-shell-t6-FE-1783477019.md</input>
    <input sha256="57a93525f4b57c5154bc2aca9a1790c57ef61009c851fe610d894961dfc8ddc5">.claude/tasks/outputs/prog-studio-v2-2026-07-s2-party-shell-PM-1783472965.md</input>
  </inputs>

  <sa status="PASS">
    <target_file>packages/client/tests/e2e/prog-studio-v2-2026-07-s2-party-shell.spec.ts</target_file>
    <violations/>
    <notes>Check A clean (no skip/only/fail/soft/try-catch/assertion-skipping-return). W3
    destination-marker compliance verified per KEEP surface (sessions-list-page, PROGRESSION LEDGER
    heading, react-flow__pane, browse-page). Mobile uses explicit setViewportSize. Side-Effect-As-Proxy
    pairing satisfied (blurCount paired with toBeFocused + browse-page DOM consequence).
    Overflow scoping to [data-testid="party-page"] adjudicated LEGITIMATE: matches W3 literal wording,
    isolates the out-of-scope pre-existing Header/ModeContent overflow, and that overflow is ROUTED
    (FE packet Flagged §2 → s4). No raw hex outside a provenance comment.</notes>
  </sa>

  <qa status="PASS">
    <test_coverage>e2e 19 passed, 0 failed (independent headless re-run by AUD#8)</test_coverage>
    <playwright>
      <tier>2</tier>
      <tests_run>19</tests_run>
      <passed>19</passed>
      <failed>0</failed>
      <playwright_output>19 passed (41.6s); exit 0</playwright_output>
    </playwright>
    <coverage_vs_manifest>COMPLETE — live default ≥3 codes, portrait+code+3 bars/card, popover
    hover AND keyboard, whole-card Tab+Enter with DOM consequence (routes to browse-page), rail
    aria-current + 4 destination markers, diagnostics footnote (drift-safe regex, live
    invalidLineCount=1), loading/empty/error via route interception, BottomTabBar 9-tab
    no-regression, dual-width screenshots. No TIER_1_ONLY / skipped interaction assertions.</coverage_vs_manifest>
    <defects/>
  </qa>

  <sx status="SECURE">
    <threat_level>LOW</threat_level>
    <findings/>
    <notes>Spec-only deliverable (commit dbc4b87: 1 file, 511 insertions, no prod-code touch).
    No secrets/credentials. No new dependencies. No server/shared edits.</notes>
  </sx>

  <overall_status>PASS</overall_status>
</audit_verdict>
