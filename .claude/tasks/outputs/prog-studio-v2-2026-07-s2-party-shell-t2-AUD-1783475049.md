# Audit Verdict — prog-studio-v2-2026-07-s2-party-shell-t2

Auditor: AUD#2 (spawned by ORC#0). Independent of FE#2 (distinct spawn — see auditor_spawn).
Envelope: v2.0 typed (task_id first SPAWN 2026-07-08 UTC ≥ 2026-05-28 cutover → v2.0 mandatory).

<audit_verdict schema_version="2.0">
  <provenance_marker>audit-pipeline@2.0.0</provenance_marker>
  <task_id>prog-studio-v2-2026-07-s2-party-shell-t2</task_id>
  <auditor_spawn>
    <agent_id>AUD#2</agent_id>
    <parent>ORC#0</parent>
    <independent_from>FE#2</independent_from>
  </auditor_spawn>
  <inputs>
    <input path="packages/client/src/components/party/materia-tint.ts" sha256="e21f373c99a78350cb977dcfd970fc1a52257172a80ca510e3542985fed8e744"/>
    <input path="packages/client/src/components/party/PortraitFrame.tsx" sha256="827e18b49ccd0f6ab768f864bafed30038571073f55441cff062b794a40f4923"/>
    <input path="packages/client/src/components/party/StatBar.tsx" sha256="10b8c20ab3dd0bd5577d11a5dff5af8ab725b0771a2da4e1a5e9dce1abdc35f0"/>
    <input path="packages/client/src/components/party/__tests__/StatBar.test.ts" sha256="30b2de9af5e6ac40069af58ed892a990230835e691e79e5cab27ca08075aa0ed"/>
  </inputs>

  <sa status="PASS">
    <target_file>packages/client/src/components/party/materia-tint.ts</target_file>
    <target_file>packages/client/src/components/party/PortraitFrame.tsx</target_file>
    <target_file>packages/client/src/components/party/StatBar.tsx</target_file>
    <target_file>packages/client/src/components/party/__tests__/StatBar.test.ts</target_file>
    <violations/>
    <notes>
      - FF7 tokens explicit on every paint/color position (Shadcn-collision gotcha honored): PortraitFrame uses
        var(--radius), materiaTint(...)+var(--sfh) gradient, var(${materiaColorKey}) border, var(--w) monogram/icon;
        StatBar uses var(--wd) label, var(--w)/var(--wm) readout, var(--sfh) track, var(${fillToken}) fill. No raw hex
        anywhere (grep `#[0-9a-fA-F]{6}` on all four files → 0 matches).
      - W1 SINGLE-SOURCE HELD: `color-mix` string literal appears in exactly one party-scope file (materia-tint.ts).
        The only other repo hit is the pre-existing compose/MateriaNode.tsx precedent FE#2 cited — out of t2 scope.
        PortraitFrame imports and calls materiaTint; no re-inlined idiom.
      - W2 mapping RECORDED verbatim + central FF7-collision rationale, marked Critic-RATIFIED, in both StatBar.tsx and
        PortraitFrame.tsx header comments (Card→PartyMemberCard, Badge→RoleTag, Progress→StatBar, Skeleton→shimmer-box,
        Alert→error-state). Progress→StatBar substitution is NOT failed on fidelity per the ratified substitution.
      - No box-shadow/glow (grep → only the explanatory comment at PortraitFrame.tsx:62). Constitution glow ban honored.
      - Naming: kebab-case util (materia-tint.ts), PascalCase components, SCREAMING_SNAKE_CASE constants
        (STAT_BAR_TRACK_HEIGHT_PX etc.), camelCase functions — all conform to standards.md.
      - TS strict: all params/returns annotated; zero `any`; StatBarViewModel/StatBarProps typed explicitly.
      - Radius handling correct: --radius-md→var(--radius) via DESIGN.md Decision Record A (verified present, spec L94/246);
        --radius-sm has no runtime CSS var, so the 6px DESIGN.md Border-Radius-table value is used as a named constant
        (STAT_BAR_TRACK_RADIUS_PX) — a documented verbatim literal, not an invented number. Not a violation.
      - Data-viz pattern-citation SA gate does NOT bind: this app is App Type `standard` (DESIGN.md default; spec L200
        states the Dashboard-App-Addendum SA governance "does not formally bind"). StatBar's new_pattern_proposal is a
        voluntary offering; absence of a dashboard-patterns.md citation is not an SA FAIL here.
      - VISUAL_BLINDSPOT_PRIMITIVE not applicable: neither component imports from ui/* (grep → 0 ui/* imports); leaves
        set explicit color/background on every element regardless.
    </notes>
  </sa>

  <qa status="PASS">
    <task_id>prog-studio-v2-2026-07-s2-party-shell-t2</task_id>
    <test_coverage>unit 3 passed / 0 failed (StatBar) ; workspace suite 24 passed / 0 failed</test_coverage>
    <lint>tsc --noEmit ×3 (shared/server/client) — RAN, exit 0, clean.</lint>
    <vitest>
      `npm test -w @gander-studio/client` RAN → Test Files 4 passed (4), Tests 24 passed (24), exit 0.
      Verbose re-run of src/components/party/__tests__/StatBar.test.ts RAN → 3/3 green, confirming the three
      computeStatBarViewModel cases actually executed (normalized=63 branch; normalized=null+reason N/A branch with
      no aria-valuenow; valueLabel-override-but-aria%-preserved).
    </vitest>
    <tier1_check_A verdict="PASS">
      N/A-vs-zero silent-empty class DEFENDED. computeStatBarViewModel guards on strict `normalized === null` — NOT a
      falsy `!normalized` or `|| 0` / `?? 0` coercion. Therefore normalized=0 renders "0%" (widthPct 0, ariaValueNow 0,
      isNotApplicable false) while null renders a distinct "N/A — {reason}" caption in --wm with aria-valuenow OMITTED
      and aria-label "{label}: not applicable, {reason}". A real zero is never masked as N/A and N/A is never coerced to
      0%. The only `??` uses are benign fallbacks (missing reason text; optional valueLabel) — not N/A/zero masking.
    </tier1_check_A>
    <schema_contract verdict="PASS">
      computeStatBarViewModel maps the PartyStatBarSchema contract ({label, normalized, reason?} + StatBar's optional
      valueLabel) to {widthPct, ariaValueNow, ariaLabel, readout, isNotApplicable}. normalized→width/aria; null→N/A.
      Schema's doc-only `derivation`/`feasibility` fields are correctly NOT rendered (feasibility is doc-only per spec;
      no feasibility/projected/cost chrome present — feasibility-label rule satisfied vacuously).
    </schema_contract>
    <playwright>
      <tier>SKIPPED — legitimate per audit-pipeline §2.3</tier>
      <reasoning>These are new, pure, prop-driven presentational leaves with zero interactive elements (grep for
        onClick/keyboard handlers → 0 matches), no store/tRPC access, no .spec.ts shipped in this packet, and no store
        selector rewired. They are not yet imported by any reachable page (t4/t5 wire them). All interaction-class and
        live-render runtime SCs are owned by t6's CLI Playwright Tier-2 spec (runtime_gate_owner). No read-only MCP
        smoke check is meaningful against an unmounted leaf. Bundle-size gate also N/A — no reachable page/build-output
        surface is introduced by these leaves.</reasoning>
    </playwright>
    <defects/>
  </qa>

  <sx status="SECURE">
    <threat_level>LOW</threat_level>
    <findings/>
    <notes>
      - No hardcoded secrets/credentials. No environment reads.
      - Pure presentational leaves: no client-network calls, no fetch, no tRPC, no JSON.parse, no dangerouslySetInnerHTML,
        no store access. Nothing to inject into.
      - materiaColorKey/fillToken are interpolated into React inline-style object VALUES (var(${token}), color-mix) — these
        originate from the trusted server roster parser (local gander file scan), not external user input, and React assigns
        them via CSSOM style-property set (a malformed value is dropped by the browser, not an injection sink). No IDOR /
        XSS / auth surface exists in a prop-driven leaf. Threat level LOW, no actionable finding.
    </notes>
  </sx>

  <adjudications>
    <decision id="1" flagged_by="FE#2" verdict="FAITHFUL">
      Role-flourish icon derived from materiaColorKey via DESIGN.md Decision Record B bijection. VERIFIED: Decision
      Record B EXISTS (DESIGN.md §"Decision Record B — Canonical Runtime Role-Color Map", lines 231-247) and STATES the
      1:1 map --mg=Impl, --my=Command, --mb=Intel, --mp=Meta, --mr=Gate. FE#2's ROLE_ICON_BY_MATERIA_TOKEN
      (--mg→Sword, --my→Crown, --mb→Compass, --mp→Sparkles, --mr→ShieldCheck) matches the spec portrait_treatment
      flourish assignments (L112-114: Sword/Impl, ShieldCheck/Gate, Compass/Intel, Sparkles/Meta, Crown/Command)
      composed through the bijection. Deriving from materiaColorKey rather than adding a roleCategory prop keeps the leaf
      at its declared {code, materiaColorKey, portraitSeed} signature. Unknown token → no icon (flourish is optional per
      spec). FAITHFUL — not a deviation.
    </decision>
    <decision id="2" flagged_by="FE#2" verdict="FAITHFUL / ACCEPTABLE">
      portraitSeed → gradient-direction variation. The spec (L96) prescribes a two-stop linear gradient "from
      {role-materia tint} at one corner to --sfh at the opposite corner" but does NOT prescribe a mechanical use for the
      schema's portraitSeed field beyond "deterministic, asset-free seed." FE#2 hashes portraitSeed to pick one of four
      corner-to-opposite-corner diagonals, keeping same-materia cards visually distinct with no image asset. Every
      selected direction remains a corner-to-opposite-corner two-stop gradient — strictly within the spec's description,
      only varying which corner pair. A reasonable, spec-consistent interpretation of an otherwise-unspecified field.
      ACCEPTABLE — not a fidelity deviation.
    </decision>
  </adjudications>

  <overall_status>PASS</overall_status>
</audit_verdict>

## Legacy sub-blocks (v2.0 wrapper sub-elements, for reader convenience)

<audit_review><status>PASS</status><violations/></audit_review>
<test_report><status>PASS</status><test_coverage>unit 3 passed, 0 failed; workspace 24 passed, 0 failed</test_coverage><playwright><tier>SKIPPED — BE/leaf, no interactive surface; runtime gates owned by t6</tier></playwright><defects/></test_report>
<security_audit><status>SECURE</status><threat_level>LOW</threat_level><findings/></security_audit>
