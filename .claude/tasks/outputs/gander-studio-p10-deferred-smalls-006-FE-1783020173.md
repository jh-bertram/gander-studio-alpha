# gander-studio-p10-deferred-smalls-006 — FE Output Packet

Task: Remediate the below-AA `--redb` token per ledger-ratified spec (#cf3c3c → #e05555, 5.22:1 on --void). Implementation of a pre-ratified spec + mechanical doc-sync; no design decisions authored.

## Files changed

- `packages/client/src/globals.css` — line 21 `--redb` value; line 357 `--destructive` annotation comment.
- `DESIGN.md` — three live-site doc-sync (Color Tokens `--color-error` row ~line 33; Decision Record A `--destructive` Contrast Note ~line 183; Decision Record B Destructive Contrast Pair row ~line 325) + appended `## Decision Record D — DEFERRED-006 --redb Contrast Remediation (p10, 2026-07-02)`.
- `packages/client/src/components/ui/button.tsx` — READ ONLY (regression guard confirmation, no edit).

## Verification run

```
grep -c '#cf3c3c' packages/client/src/globals.css        → 0
grep -n '5.22:1' packages/client/src/globals.css          → line 357 present
grep -ci 'below aa' packages/client/src/globals.css       → 0
grep -n '#cf3c3c\|4\.07:1' DESIGN.md                       → lines 407, 410, 417 (all inside DR-D, which starts line 405) — containment OK
npm run lint  (tsc --noEmit x3: shared, server, client)    → exit 0, clean
npm run build -w @gander-studio/client                     → exit 0, vite build succeeded
```

`git diff packages/client/src/globals.css` shows exactly the two intended line changes (--redb value + its annotation); `--red` (#a12d2d), `--mr` (#e74c3c), and the `--destructive: var(--redb)` mapping are byte-for-byte unchanged. No `--redb-*` variant introduced.

## ui_packet

```xml
<ui_packet>
  <components_created>NONE — token value + documentation remediation only, no new components</components_created>
  <state_hydration_map>N/A — pure CSS custom-property value change; no client state, no tRPC data flow affected</state_hydration_map>
  <a11y_verification>
    This task IS the a11y fix: --redb (source of --destructive) raised from 4.07:1 to 5.22:1 on --void, clearing WCAG AA 4.5:1 for normal text. Regression guard (read-only grep of button.tsx lines 18-19) confirms destructive button variant renders `bg-destructive/10 text-destructive` — red text on a 10%-alpha tint of the same red, not white-on-solid-red. Lightening the source hex can only raise this text/tint contrast further; no regression path exists. AgentTimeline.tsx graphical marker usage (owned by parallel packet 003, not touched here) requires only the WCAG non-text 3:1 threshold, comfortably cleared by the new value.
  </a11y_verification>
  <design_tokens_used>--redb (CSS custom property, value updated per ledger-ratified spec); --destructive (unchanged mapping, var(--redb)); --void (unchanged, used only in contrast math and annotation comments, not edited as a token)</design_tokens_used>
  <style_conflict_check>NONE — no .tsx files touched, no inline styles introduced</style_conflict_check>
  <integration_status>SUCCESS — tsc clean x3, client build passing, all grep verification checks pass, git diff scope confirmed exact</integration_status>

  <contrast_pairs>
    <pair>
      <foreground>--redb #e05555 (R=224, G=85, B=85)</foreground>
      <background>--void #070d0c</background>
      <method>WCAG 2.x relative luminance. Per channel c: cs=c/255; cl=cs/12.92 if cs≤0.03928 else ((cs+0.055)/1.055)^2.4. L=0.2126·Rl+0.7152·Gl+0.0722·Bl. Contrast=(Llight+0.05)/(Ldark+0.05).</method>
      <intermediate_luminances>--void L ≈ 0.003601. --redb: Rl≈0.74540, Gl=Bl≈0.090846 → L ≈ 0.230004.</intermediate_luminances>
      <ratio>5.22:1</ratio>
      <status>PASS AA (≥4.5:1 for normal text)</status>
    </pair>
    <pair_historical_reference>
      <foreground>OLD --redb #cf3c3c</foreground>
      <background>--void #070d0c</background>
      <ratio>4.07:1 (re-derived, confirms recorded pre-fix value — method valid)</ratio>
      <status>BELOW AA (superseded — recorded only inside DESIGN.md Decision Record D, not live anywhere else)</status>
    </pair_historical_reference>
    <regression_guard>
      <surface>Shadcn destructive button variant — packages/client/src/components/ui/button.tsx lines 18-19</surface>
      <finding>bg-destructive/10 text-destructive — text/tint pairing only, no white-on-solid-red anywhere in the codebase for this token</finding>
      <result>NO REGRESSION — lightening --redb raises this text/tint contrast; AgentTimeline.tsx graphical-marker usage (owned by packet 003, not edited here) only needs the 3:1 non-text threshold, comfortably cleared</result>
    </regression_guard>
  </contrast_pairs>

  <globals_css_update>
    <line_21>--redb: #cf3c3c;  →  --redb: #e05555;</line_21>
    <line_357_annotation>/* #cf3c3c — 4.07:1 on --void (BELOW AA for normal text; see DEFERRED-006) */  →  /* #e05555 — 5.22:1 on --void (AA for normal text; DEFERRED-006 resolved) */</line_357_annotation>
  </globals_css_update>

  <design_md_update>
    <live_site line="33">Color Tokens --color-error row: #cf3c3c → #e05555</live_site>
    <live_site line="183">Decision Record A --destructive Contrast Note: #cf3c3c/4.07:1/below AA → #e05555/5.22:1/AA (DEFERRED-006 resolved)</live_site>
    <live_site line="325">Decision Record B Destructive Contrast Pair row: #cf3c3c/4.07:1/below AA → #e05555/5.22:1/AA (DEFERRED-006 resolved)</live_site>
    <decision_record_d appended="true" heading="## Decision Record D — DEFERRED-006 --redb Contrast Remediation (p10, 2026-07-02)">
      Records: problem statement, superseded value #cf3c3c @ 4.07:1 (historical, preserved per changelog convention), resolution #e05555 @ 5.22:1, full WCAG method + intermediate luminances re-derivation, post-fix contrast_pairs table, regression guard writeup, and ledger ratification note. Old literals #cf3c3c/4.07:1 appear ONLY within this block (lines 405-428); grep containment check confirms no occurrence at the three live sites.
    </decision_record_d>
  </design_md_update>

  <out_of_scope_confirmation>
    --red (#a12d2d) unchanged. --mr (#e74c3c) unchanged. --materia-red token does not exist in globals.css (not applicable). --destructive: var(--redb) mapping byte-for-byte unchanged. No --redb-* variant introduced. AgentTimeline.tsx not touched (owned by packet 003). No git commit performed. No untracked scratch e2e specs touched.
  </out_of_scope_confirmation>
</ui_packet>
```
