# Plan Amendment — prog-studio-v2-2026-07-s2-party-shell

**PM#0** | task_id: `prog-studio-v2-2026-07-s2-party-shell` | generated: 2026-07-07
Resolves the 5 WARNINGs from CR#1 (`prog-studio-v2-2026-07-s2-party-shell-CR-1783473856.md`,
CRITIQUE_PASS). **This amendment is read TOGETHER with the original plan**
(`prog-studio-v2-2026-07-s2-party-shell-PM-1783472965.md`). Each packet brief must cite BOTH.
Compact: SC tightenings, must_contain additions, and risk-note additions ONLY. No re-decomposition,
no packet/dependency/file changes.

---

<plan_amendment task_id="prog-studio-v2-2026-07-s2-party-shell" resolves="W1,W2,W3,W4,W5">

<!-- ============================ W1 — DRY: single materia alpha-tint helper ============================ -->
<amendment id="W1" targets="t2,t3" type="dry_dedup">
  <resolution>
  The materia-keyed alpha tint (`color-mix(in srgb, var(--{token}) {pct}%, transparent)`) is used in
  PortraitFrame's gradient (t2), StatBar has no tint but RoleTag's bg/border (t3) reuses the same idiom
  at 12% and 25%. Extract it to a SINGLE shared helper in t2; t3 imports it — no re-inlined idiom.
  </resolution>

  <t2_deliverable_addition>
  Add a shared helper `materiaTint(token: string, pct: number): string` returning the
  `color-mix(in srgb, var(${token}) ${pct}%, transparent)` string (token is a runtime token NAME like
  `'--mg'`, NEVER a hex). PLACEMENT: colocate as a tiny `packages/client/src/components/party/materia-tint.ts`
  (PREFERRED — a coupled primitive util, counted with the primitives, not a third independent component
  against the file-count guard) OR export it as a named export from `PortraitFrame.tsx` if FE prefers to
  hold t2 to two source files. Either way it is the ONE source of the tint idiom. PortraitFrame's 12%
  gradient stop and RoleTag (t3) both consume `materiaTint('--{materiaColorKey}', 12)` /
  `materiaTint(..., 25)` — the raw `color-mix` string literal appears in exactly ONE file.
  </t2_deliverable_addition>

  <t2_success_criteria_add>
  - `materiaTint` helper exists and is exported; PortraitFrame's alpha-tint gradient stop is produced by
    calling it (no re-inlined `color-mix(... %, transparent)` string literal anywhere in t2 other than
    inside `materiaTint` itself).
  </t2_success_criteria_add>
  <t2_must_contain_add>
    <item>exported materiaTint(token, pct) helper — the single source of the color-mix alpha-tint idiom; PortraitFrame consumes it</item>
  </t2_must_contain_add>

  <t3_success_criteria_add>
  - RoleTag's bg (12%) and border (25%) tints are produced by IMPORTING `materiaTint` from t2 — a raw
    `color-mix(in srgb, ...)` string literal MUST NOT appear anywhere in t3's files (ORC greps
    `color-mix` in the two t3 files, expects 0 matches).
  </t3_success_criteria_add>
  <t3_must_contain_add>
    <item>RoleTag tints via imported materiaTint(token, pct) from t2 (no re-inlined color-mix idiom)</item>
  </t3_must_contain_add>
  <t3_must_not_contain_add>
    <item>a re-inlined `color-mix(in srgb, ...)` idiom — must import materiaTint from t2 instead</item>
  </t3_must_not_contain_add>
</amendment>

<!-- ============ W2 — spec-primitive → substitute mapping (Critic-RATIFIED, not a fidelity deviation) ============ -->
<amendment id="W2" targets="t2,t3,t4" type="spec_substitution_mapping">
  <resolution>
  Record the spec-primitive→substitute mapping VERBATIM in the t3 and t4 packet context AND in each
  affected completion packet, so audit/REQVAL adjudicate ACCEPTABLE rather than raise a spec-fidelity
  FAIL. CR#1 disk-verified this substitution and RATIFIED it (`components/ui/` contains only
  {button, popover, dialog, select, input, textarea, shimmer-box, error-state}; none of the five
  spec-named primitives exist, and installing raw Shadcn primitives triggers the memorized FF7-token
  collision → invisible text). This is NOT a fidelity deviation — it is the correct, ratified call.
  </resolution>

  <mapping_verbatim>
  Card     → PartyMemberCard  (custom, FF7-tokened)
  Badge    → RoleTag          (custom, FF7-tokened)
  Progress → StatBar          (custom new_pattern_proposal)
  Skeleton → shimmer-box      (existing components/ui/shimmer-box.tsx)
  Alert    → error-state      (existing components/ui/error-state.tsx)
  Rationale (state ONCE, centrally): components/ui/ lacks all five named primitives; raw Shadcn
  primitives collide with FF7 Mako tokens → invisible text (memorized S2 gotcha). Critic-RATIFIED
  (CR#1 disk-verified). DRY + collision-avoidance, not a fidelity shortfall.
  </mapping_verbatim>

  <must_contain_add targets="t2,t3,t4">
    <item>spec-primitive→substitute mapping recorded VERBATIM (Card→PartyMemberCard, Badge→RoleTag, Progress→StatBar, Skeleton→shimmer-box, Alert→error-state) + the one central FF7-collision rationale, marked Critic-RATIFIED (not a fidelity deviation)</item>
  </must_contain_add>
  <note>The completion packet for t2/t3/t4 must carry this mapping so REQVAL "spec says Card — is Card
  used?" is pre-adjudicated ACCEPTABLE. t2 owns StatBar (Progress) + the primitives; t3 owns RoleTag
  (Badge) + PartyMemberCard (Card); t4 consumes shimmer-box (Skeleton) + error-state (Alert).</note>
</amendment>

<!-- ============ W3 — t6 rail-nav SC tightening + explicit mobile viewport ============ -->
<amendment id="W3" targets="t6" type="sc_tighten">
  <resolution>
  (a) The rail-nav SC's store-mutation half is a side-effect proxy that decouples from rendering —
  tighten it to assert a DESTINATION-SURFACE DOM MARKER after each rail click, not only `activeMode`.
  (b) The mobile legibility check must be driven explicitly via `page.setViewportSize` to a mobile
  width — do NOT rely on a mobile playwright project existing (config declares none; default is 1280,
  where the rail is correctly visible).
  </resolution>

  <t6_success_criteria_replace target="assertion 2 / rail-nav SC4">
  - RAIL NAV (SC4): clicking each SubmenuRail KEEP item switches to that surface — assert a DOM MARKER
    unique to the destination surface is present AFTER the click (e.g. the Sessions page heading /
    a data-testid or role landmark that only the Sessions surface renders; likewise Progression,
    Programs), NOT merely that `activeMode` mutated. The three KEEP destinations (Sessions, Progression,
    Programs) are the binding assertions; Roster→browse interim may also be asserted.
  </t6_success_criteria_replace>

  <t6_success_criteria_replace target="assertion 6 / legibility SC2">
  - LEGIBILITY (SC2): run the rail-interaction assertions at the DEFAULT desktop viewport (1280, rail
    visible), THEN call `page.setViewportSize({ width: 390, height: 844 })` (or an equivalent mobile
    width) and assert the mobile-fold legibility: no horizontal overflow on the grid container, grid is
    1-col, the rail is correctly HIDDEN (`hidden lg:flex`), BottomTabBar covers nav. Capture a screenshot
    at BOTH widths for the Step 4.5 human adjudication. Do NOT depend on a mobile playwright project.
  </t6_success_criteria_replace>

  <t6_must_contain_add>
    <item>rail-nav asserts a destination-surface DOM marker per KEEP click (not just activeMode)</item>
    <item>explicit page.setViewportSize(mobile) drives the mobile legibility check; rail asserted hidden at mobile width; screenshots at desktop + mobile</item>
  </t6_must_contain_add>
</amendment>

<!-- ============ W4 — t3 coupling (SubmenuRail): ACCEPT-WITH-RATIONALE ============ -->
<amendment id="W4" targets="t3" type="accept_with_rationale">
  <decision>ACCEPT (do not split). CR#1 marked the split OPTIONAL and the mandatory 4-file BLOCKER rule
  is NOT tripped (t3 has 2 source files).</decision>
  <rationale>PartyMemberCard and SubmenuRail stay coupled in t3 to hold the 6-packet ceiling; splitting
  SubmenuRail into a 7th packet would exceed the sprint's packet budget for a marginal one-pass-surface
  reduction, and both components share the same t1/t2 dependency edge with no inter-component coupling
  risk. The two contexts (card aria/popover vs store-nav rail) are distinct but each is a small,
  self-contained unit; the file-count guard (≤2 source files) is satisfied.</rationale>
</amendment>

<!-- ============ W5 — sprint risk_flags: two known-interim limitations ORC surfaces at REQVAL/close ============ -->
<amendment id="W5" targets="SPRINT" type="risk_flag_add">
  <risk_flags_add>
    <flag id="R-9" severity="LOW" surface_at="REQVAL / Step 4.5">SUBMENURAIL COLLAPSE/EXPAND DEFERRED.
    The spec's SubmenuRail collapse/expand interaction (spec interactions line 283, 240px↔56px) is NOT
    built this sprint — the rail renders at a single fixed width. Declared interim deferral to s4 (the
    rail-hoist consumer); no s2 SC requires it. ORC must surface this at REQVAL/Step 4.5 as a KNOWN,
    human-confirmed interim limitation, not a discovered defect.</flag>
    <flag id="R-5b" severity="LOW" surface_at="REQVAL / Step 4.5">RETURN-TO-PARTY HAS NO NAV AFFORDANCE
    (extends R-5). Party IS the default route; a full page reload returns to it. But because BottomTabBar
    is untouched (gains NO party tab until s4) and the rail is page-local (unmounts with PartyPage on any
    rail click), there is NO in-app control to return to the party home this sprint. ORC must explicitly
    surface the reload-only return path at REQVAL/Step 4.5 for the human to knowingly accept for the s2
    window. The fix (rail-hoist + home affordance / party tab) is s4's job.</flag>
  </risk_flags_add>
</amendment>

</plan_amendment>

---

## Amendment self-check

- W1 → t2 gains the single `materiaTint` helper deliverable + SC; t3 must_not_contain a re-inlined
  color-mix idiom (imports the helper). No new packet, no dependency change (t3 already deps t2).
- W2 → t2/t3/t4 must_contain the verbatim spec-primitive→substitute mapping + one central FF7-collision
  rationale, marked Critic-RATIFIED. Recorded in the completion packets for REQVAL pre-adjudication.
- W3 → t6 SC2/SC4 tightened: destination-surface DOM marker per rail click; explicit
  `page.setViewportSize` mobile check with rail-hidden assertion + dual-width screenshots.
- W4 → ACCEPT-WITH-RATIONALE (SubmenuRail stays in t3; holds 6-packet ceiling; file-count guard met).
- W5 → two REQVAL/close risk_flags added (R-9 collapse/expand deferred; R-5b reload-only return path).

No packets, dependencies, files, or `dependency_order` changed. Original plan remains authoritative for
everything not amended above.
