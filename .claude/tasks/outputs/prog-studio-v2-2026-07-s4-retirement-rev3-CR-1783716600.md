<plan_critique>
  <plan_id>prog-studio-v2-2026-07-s4-retirement (rev3, scoped FE-1a/FE-1b confirmation)</plan_id>
  <status>PASS</status>

  <challenges>
    <challenge>
      <type>AUDIT_RISK</type>
      <severity>WARNING</severity>
      <task_ref>prog-studio-v2-2026-07-s4-retirement-FE-1b</task_ref>
      <description>
Item 3 (the reference-point adjudication): the PM's choice of the PRE-FE-1a state as FE-1b's "still-green" reference is CORRECT and is the gap-free reading — FE-1a deliberately reds a few specs (grid single-column, aria-label) it is forbidden to fix (no spec edits in FE-1a), so referencing FE-1b's completeness against FE-1a's close-state would let those hoist-caused reds read as "pre-existing at my start" and be masked. Referencing the whole FE-1a+FE-1b unit against the pre-nav-re-architecture (pre-FE-1a) green set is right, and since no s4 nav code has landed before FE-1a dispatches, that set equals the t5-classified green set — the PM's "pre-FE-1a (t5) baseline" conflation is sound. The residual gap is mechanical, not conceptual: the SC names the reference but does NOT say HOW the pre-FE-1a green set is captured. It leans implicitly on the month-old t5 57-failure artifact as a still-accurate proxy; if any KEEP spec drifted green/red between s3-t5 and FE-1a dispatch for reasons unrelated to s4, that artifact misclassifies it and FE-1b's floor-completeness check inherits the error. A fresh capture at dispatch closes this.
      </description>
      <required_revision>
Add an explicit pre-FE-1a baseline capture and reference it. Insert as an ORC/FE-1a dispatch step: "Before FE-1a makes any edit, run `npx playwright test` against HEAD once; save the pass/fail set as the sprint's pre-FE-1a baseline artifact and reconcile it against the t5 57-failure list (note any drift). This validated set — not the raw t5 artifact — is the baseline every FE packet references." Then replace FE-1b's floor-completeness SC bullet with:
"- FLOOR + FLOOR-completeness (CR#3 W2): the authoritative reference is the captured pre-FE-1a baseline run (above). Every KEEP spec in that pre-FE-1a PASS set is GREEN at FE-1b close via a real `npx playwright test` RUN; every spec still red at close is classified (migrate-in-packet | present in the pre-FE-1a baseline-red set) in the ui_packet; s3-drilldowns + s2-party + (once it lands) FE-CAT catalog specs green; no NEW failure vs the pre-FE-1a baseline."
(If a fresh capture is impractical, deriving the green set as {KEEP specs} − {t5 57-failure list} is an acceptable fallback, but state that dependence explicitly so the auditor knows the t5 artifact is being trusted as current.)
      </required_revision>
    </challenge>
  </challenges>

  <audit_risk_forecast>
    Item 1 — FE-1a/FE-1b split AS APPLIED: CONFIRMED, matches the CR#3-endorsed contingency.
    - File-disjoint on WRITES: FE-1a writes {AppShell.tsx, globals.css, PartyPage.tsx, SubmenuRail.tsx}; FE-1b writes {navigation.ts, BottomTabBar.tsx, spec files} and holds AppShell.tsx read-only ("Do NOT touch AppShell's grid/rail beyond a read-only reference"). No write overlap. SubmenuRail.tsx aria-label is FE-1a's and out-of-scope for FE-1b. Clean seam.
    - Hoist-first / never-zero-nav: FE-1a keeps NAV_ITEMS + BottomTabBar.tsx untouched as fallback (SC line 39 "nav never zero at any width"); the ≥640px transient rail+bar duplicate is noted and accepted (aria-label duplicate resolved in FE-1b). FE-1b then retires NAV_ITEMS and repurposes BottomTabBar to the <640px-only fold — at no point is nav zero.
    - Independent gates: FE-1a is lint×3 + build + rail-global-on-a-non-party-surface verified, explicitly NOT full-e2e-gated (its post-hoist RUN is recorded and the hoist-caused-red classification handed to FE-1b). FE-1b is lint×3 + build + floor-completeness RUN. FE-1b depends on FE-1a; dependency_order (FE-1a→FE-1b→FE-2→…) and agent_count 7→8 are updated; downstream packets and DOCS-1 deps reference both. The DOM-mount order (SubmenuRail before BottomTabBar) is preserved in FE-1a for FE-1b's locator resolution.

    Item 2 — W2 FLOOR framing AS APPLIED: CONFIRMED. FE-1b step 3 states the list is "a FLOOR, not a ceiling" and that FE-1b owns migrating ANY currently-green KEEP spec the nav re-architecture breaks, with a per-red classify-and-record duty (migrate | t5-baseline). The discriminator is embedded verbatim ("explicit nav helper / nav-tab click = migrate; goto+in-page `getByRole('tab',{name:/Analyze/})` = baseline-red/skip"), reinforced in out_of_scope ("Do NOT migrate in-page Analyze-tab specs") and in the ui_packet must_contain ("per-spec migrate-vs-baseline classification for EVERY red"). This is exactly the CR#3 recipe.

    Item 3 — reference point: correct; one capture-mechanism tweak above (WARNING, recipe provided per the coordinator's preference over a BLOCK).

    No other re-gating performed — the six jidoka fixes, the FE-1/FE-4 boundary, the agent-roles.ts FE-3 direction, and the transitive chains were disk-confirmed in CR#3 and carry verbatim. The one item beyond the three that I note only in passing (no action required this round): the FE-4 watch-item from CR#3 (confirm the `edit-page` testid before deleting s2-d2-edit-save.spec.ts) is folded into the rev3 header — good.
  </audit_risk_forecast>

  <post_mortem_patterns_checked>
    Scoped confirmation round — read the rev3 FE-1a and FE-1b packets in full plus the split-rationale/reference-point sections (lines 1-142). Verified against the CR#3 WARNINGs I raised: W1 (split) applied file-disjoint, hoist-first, independently gated; W2 (floor) applied with the discriminator and classification duty. Item 3 reference point adjudicated correct with a mechanical-capture tweak. One WARNING (SC capture recipe), zero BLOCKERs → PASS. CR#2 and CR#3 were PASS, so no consecutive-BLOCK concern. Structure is sound; execution may proceed once the pre-FE-1a baseline capture is wired (or the t5-derivation fallback is stated explicitly).
  </post_mortem_patterns_checked>
</plan_critique>
