<plan_critique>
  <plan_id>prog-studio-v2-2026-07-s2-party-shell</plan_id>
  <status>PASS</status>

  <challenges>
    <challenge>
      <type>AUDIT_RISK</type>
      <severity>WARNING</severity>
      <task_ref>prog-studio-v2-2026-07-s2-t2 / t3</task_ref>
      <description>The materia-keyed alpha tint (`color-mix(in srgb, var(--{materia}) 12%, transparent)`
      and the 0.25 variant) is used in PortraitFrame's gradient (t2) AND in RoleTag's bg/border (t3) —
      spec token table lines 261-263 pre-bake only the FIXED accent tints (--bd, --bdb, --nav-active-bg),
      NOT the per-materia tint, so the materia tint MUST be computed inline. Second use of the same
      idiom across two files → standards.md DRY ("Extract shared logic to utils before the second use").
      An auditor DRY grep for repeated `color-mix(... 12% ...)` expressions can flag this.</description>
      <required_revision>Direct t2 to establish the alpha-tint as a single shared helper (a tiny
      util returning the color-mix string, or a documented className) and have t3 import it rather than
      re-inline. If PM judges color-mix a pure CSS idiom (not "logic") and declines, add a one-line note
      in both packets stating the idiom is intentionally repeated as a CSS expression, so the auditor
      adjudicates rather than FAILs.</required_revision>
    </challenge>
    <challenge>
      <type>SCOPE_DRIFT</type>
      <severity>WARNING</severity>
      <task_ref>SPRINT (R-2)</task_ref>
      <description>R-2 RATIFIED: substitution is the correct call — verified on disk that
      `components/ui/` contains only {button, popover, dialog, select, input, textarea, shimmer-box,
      error-state}; none of the spec-named Card/Badge/Progress/Skeleton/Alert exist, and installing raw
      Shadcn primitives triggers the memorized FF7-token collision (invisible text). BUT the design spec
      names those five primitives verbatim; an auditor/REQVAL checking spec fidelity ("spec says Card —
      is Card used?") can raise a fidelity concern the packets don't pre-adjudicate.</description>
      <required_revision>Have each affected packet (and its completion packet) record an explicit
      spec-deviation MAPPING so audit/REQVAL adjudicate ACCEPTABLE rather than FAIL:
      Card→PartyMemberCard (custom, FF7-tokened), Badge→RoleTag, Progress→StatBar, Skeleton→shimmer-box,
      Alert→error-state. Reference the FF7-collision rationale once, centrally.</required_revision>
    </challenge>
    <challenge>
      <type>AUDIT_RISK</type>
      <severity>WARNING</severity>
      <task_ref>prog-studio-v2-2026-07-s2-t6</task_ref>
      <description>Two e2e-authoring hazards. (a) Assertion 2 (rail nav, SC4) is phrased "switches
      activeMode / renders the corresponding surface" — the store-mutation half is a side-effect proxy
      that decouples from rendering. (b) SubmenuRail mounts `hidden lg:flex`; the default playwright
      viewport is 1280 (verified: playwright.config.ts declares no `projects`/device emulation, so the
      rail IS visible by default), but assertion 6 requires a MOBILE-width legibility check where the
      rail is correctly hidden and the grid is 1-col.</description>
      <required_revision>t6 must assert a DOM marker of each destination surface (e.g. the Sessions
      page heading present) after a rail click, not only `activeMode`. And it must drive the mobile
      legibility check via `page.setViewportSize` to a mobile width while running the rail-interaction
      assertions at the default desktop viewport (do NOT rely on a mobile project existing).</required_revision>
    </challenge>
    <challenge>
      <type>OVERSCOPED</type>
      <severity>WARNING</severity>
      <task_ref>prog-studio-v2-2026-07-s2-t3</task_ref>
      <description>t3 bundles two INDEPENDENT interactive components — PartyMemberCard (~110) and
      SubmenuRail (~70), ~180 net lines. Neither depends on the other; both depend only on t1/t2. The
      mandatory 4-file BLOCKER rule is NOT tripped (2 source files), so this is not a required split,
      but the two components cross distinct cognitive contexts (card aria/popover contract vs store-nav
      rail) in one agent turn.</description>
      <required_revision>OPTIONAL: split SubmenuRail into its own packet (deps t1 only) so it can
      parallelize with the PartyMemberCard packet (deps t1+t2) and halve each turn's one-pass surface.
      Acceptable to leave coupled if PM prefers the 6-packet ceiling; flagged for the record.</required_revision>
    </challenge>
    <challenge>
      <type>SCOPE_DRIFT</type>
      <severity>WARNING</severity>
      <task_ref>SPRINT (R-5)</task_ref>
      <description>Two spec elements are deferred with no covering brief SC: (a) the SubmenuRail
      collapse/expand interaction (spec interactions line 283, 240px↔56px); (b) the return-to-party
      dead-end (R-5): with BottomTabBar untouched (no party tab) and the rail page-local, once a desktop
      user clicks any rail item the rail unmounts with PartyPage and the ONLY way back to the party home
      is a full page reload. Both are declared interim deferrals to s4 and no sprint SC requires them —
      but the reload-only dead-end is a genuine UX limitation the human should confirm knowingly.</description>
      <required_revision>Surface both at REQVAL/Step 4.5 as known, human-confirmed interim limitations
      (not discovered defects). No code change required this sprint; the fix is s4's rail-hoist + home
      affordance. Confirm the human accepts the reload-only return path for the s2 window.</required_revision>
    </challenge>
  </challenges>

  <audit_risk_forecast>
    Top two audit landmines even if executed cleanly: (1) DRY on the repeated materia alpha-tint idiom
    across PortraitFrame + RoleTag (W1) — the highest-probability SA finding. (2) Spec-fidelity check
    against the five named-but-substituted Shadcn primitives (W2) — mitigated only if the deviation
    mapping is recorded in the packets. Both are pre-emptable with the two notes above; neither is
    pre-code-fatal. No-raw-hex greps and the aria/keyboard SCs are well specified and should pass.

    RATIFICATIONS (disk-verified): R-1 — brief constraint 2 (BottomTabBar untouched) prevails; no brief
    SC depends on the spec's mobile 5th tab (spec line 88 is prose, deferred to s4). R-3 — page-local
    rail satisfies SC4 at the default 1280 viewport. R-7 — client `trpc = createTRPCReact<AppRouter>()`
    (trpc.ts:4) and AppRouter includes `roster` (router.ts:829), so `trpc.roster.getParty.useQuery` is
    available; NO BE precursor needed (t4's verify-then-implement is belt-and-suspenders). Compiler-
    exhaustiveness CONFIRMED: `PAGE_MAP: Record<AppMode,...>` (ModeContent.tsx:14) forces a `party` entry
    once `party` joins the AppMode union (ui-store.ts:4). Spec token line 255 explicitly reserves `--mg`
    as "Stamina bar fill" — t3's fixed Stamina=--mg mapping is spec-FAITHFUL, not a deviation.
    Dependency order {t1∥t2}→t3→t4→t5→t6 is correct; ui-store.ts shared-writer serialized t1→t5 per s1 G4.
  </audit_risk_forecast>

  <post_mortem_patterns_checked>
    Read prog-studio-v2-2026-07-s1-data-layer.md (§5 recurring: unmeasured corpus-fact assertions;
    §6 G1 verify-then-implement rule, G4 shared-writer serialization) and gander-studio-p11-v2-vision.md
    (§4/§5 prose-rule-bypass, subagentstop-complete-miss classes). s1 G1 applied: all PM codebase-fact
    assertions disk-verified TRUE (PAGE_MAP exhaustiveness, ui-store partialize, components/ui/ contents,
    roster client exposure, reused-component APIs). s1 G4 honored (t1→t5 serialized). p11 prose-rule-
    bypass: every requirement carries an enforcing SC. PM declared 6 <recurring_pattern> elements —
    MISSING_RECURRENCE_DECLARATION does not apply. sc-precheck-report.json attached, 0 findings —
    MISSING_SC_PRECHECK_REPORT does not apply.
  </post_mortem_patterns_checked>
</plan_critique>
