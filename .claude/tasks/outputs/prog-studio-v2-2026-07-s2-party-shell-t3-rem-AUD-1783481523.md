# AUDIT VERDICT — prog-studio-v2-2026-07-s2-party-shell-t3-rem

Auditor: AUD#6 (independent from FE#7). Reviewing FE#7's remediation of the HIGH
keyboard-focus/popover oscillation defect flagged by t6's e2e gate in t3's PartyMemberCard.

<audit_verdict schema_version="2.0">
  <provenance_marker>audit-pipeline@2.0.0</provenance_marker>
  <task_id>prog-studio-v2-2026-07-s2-party-shell-t3-rem</task_id>
  <auditor_spawn>
    <agent_id>AUD#6</agent_id>
    <parent>ORC#0</parent>
    <independent_from>FE#7</independent_from>
  </auditor_spawn>
  <inputs>
    <input path="packages/client/src/components/party/PartyMemberCard.tsx"
           sha256="85e7454283297a93f5b8934dc312f9d39cbda88f201bfbbff18db2e14d015272" />
    <input path="packages/client/tests/e2e/prog-studio-v2-2026-07-s2-party-shell.spec.ts"
           sha256="658e8a7d85b25fcdb13d3bcbb9363af8cb54064bbcf8e8554a5730020e78eb7b" />
    <input path=".claude/tasks/outputs/prog-studio-v2-2026-07-s2-party-shell-t3-rem-FE-1783478966.md"
           sha256="99d13a6ab4ad5ebea1c7aeb50daa4a708485cab34664cce99a0c47fd46f051cd" />
  </inputs>

  <sa status="PASS">
    <audit_review>
      <target_file>packages/client/src/components/party/PartyMemberCard.tsx</target_file>
      <status>PASS</status>
      <notes>git diff vs HEAD (2c23c7e, the committed t3 state) = +30/-0, purely additive:
        two PopoverContent props (initialFocus={false}, role="presentation") plus one inline
        rationale comment block. No design-token change, no hex, no style-object mutation, no
        structural rewrite, no visual delta. Additive-props-only constraint satisfied.</notes>
    </audit_review>
    <audit_review>
      <target_file>packages/client/tests/e2e/prog-studio-v2-2026-07-s2-party-shell.spec.ts</target_file>
      <status>PASS</status>
      <notes>Assertion STRENGTHENING confirmed, not weakening. The formerly test.fail()-annotated
        "whole-card is keyboard-operable" test (t6 line 220) had its expected-failure annotation
        removed and was strengthened: it now (1) instruments a blur counter on the card trigger
        BEFORE focusing, (2) holds keyboard focus for a 3.2s sustained window (exceeds the
        diagnosis's "still cycling after 3+ seconds" point), (3) asserts firstCard.toBeFocused()
        AND blurCount===0 (the oscillation's direct fingerprint), then (4) presses Enter and
        asserts the DOM-visible consequence (browse-page testid visible) per the
        Side-Effect-As-Proxy pairing rule. This asserts strictly MORE than the original. Test
        count unchanged at 19 (== t6). No other assertion was loosened to achieve green: the
        "keyboard tab order" test still asserts Tab from the last rail item lands on card 1 and a
        further Tab lands on card 2 (proving no nested/intermediate tab stop) — this is the
        assertion the role="presentation" half of the fix protects, and it was tightened-adjacent
        (guards the new-regression risk), not relaxed.</notes>
    </audit_review>
    <violations />
  </sa>

  <qa status="PASS">
    <test_report>
      <task_id>prog-studio-v2-2026-07-s2-party-shell-t3-rem</task_id>
      <status>PASS</status>
      <test_coverage>e2e — 19 passed, 0 failed (run twice for determinism); lint 3x exit 0</test_coverage>
      <playwright>
        <tier>2</tier>
        <tests_run>19</tests_run>
        <passed>19</passed>
        <failed>0</failed>
        <determinism>Run 1: 19 passed (49.8s). Run 2: 19 passed (42.8s). Identical pass set both
          runs — the timing-dependent oscillation is deterministically resolved, not timing-luck.
          Auditor ran the runtime evidence directly (runtime-class fix); API :3001 live, Vite
          :5173 auto-started by playwright webServer (reuseExistingServer). Headless, 1 worker.</determinism>
      </playwright>
      <lint>npm run lint x3 — exit 0 all three (tsc --noEmit across shared/server/client, clean).</lint>
      <defects />
    </test_report>

    <a11y_adjudication verdict="FAITHFUL / APPROVED">
      role="presentation" on the quick-peek popup is WCAG-sound here and faithful to the design
      spec's "a peek, not a dialog" intent (v2-design-spec.md <state name="card-hover">: a passive,
      non-interactive quick-peek restating exact stat values + as-of date; zero interactive
      elements). Rationale:
      (1) base-ui's forced default role="dialog" was a semantic MISMATCH — it implies a modal,
          focus-managed context (requiring a label, Esc-to-close, focus trap) that this passive
          peek is not, and it was the direct trigger of the focus-management oscillation. Removing
          the false dialog semantics is a correctness win, not a downgrade.
      (2) No information is lost to AT users: the peek's stat values are ALREADY fully exposed via
          the card's own comprehensive aria-label (buildCardAriaLabel — code + role + all three
          stat readouts). The visual peek is redundant decorative chrome for sighted mouse/keyboard
          users, so it needs no independent accessibility-tree presence.
      (3) The textbook alternative (role="tooltip" + aria-describedby on the trigger) would be
          WORSE here: because the card aria-label already carries every stat value, aria-describedby
          pointing at the peek would cause a screen reader to announce the same stat readout TWICE
          (double-verbosity regression). role="presentation" avoids that while still exposing the
          text as generic content, losing nothing.
      Advisory (INFO, non-blocking): role="presentation" strips only the container's own role, not
      descendant text from the a11y tree. That is harmless today (redundant-but-not-misleading). If
      a future iteration makes the peek carry UNIQUE info not in the card aria-label, this choice
      must be revisited (that info would then need a tooltip/describedby, or the aria-label trimmed).
      Not applicable to the current decorative-restatement peek.
    </a11y_adjudication>
  </qa>

  <sx status="SECURE">
    <security_audit>
      <status>SECURE</status>
      <threat_level>LOW</threat_level>
      <notes>Trivial surface. The remediation diff is confined to two files: PartyMemberCard.tsx
        (+30/-0, two client-side ARIA/focus props + comment) and the untracked e2e spec. No
        secrets, no auth/route logic, no input-handling or injection surface, no dependency change.
        role="presentation" and initialFocus={false} are inert client presentation attributes with
        no security implication. Scope isolation verified: the concurrently-modified ModeContent.tsx
        (+28/-2) and ui-store.ts (+3/-3) are FE#8's t5-rem bundle code-split work, explicitly out of
        this audit's scope and correctly NOT attributed to t3-rem. No scope creep.</notes>
      <findings />
    </security_audit>
  </sx>

  <overall_status>PASS</overall_status>
</audit_verdict>
