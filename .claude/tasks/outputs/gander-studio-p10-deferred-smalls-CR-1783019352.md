<plan_critique>
  <plan_id>gander-studio-p10-deferred-smalls</plan_id>
  <status>BLOCK</status>

  <challenges>

    <challenge>
      <type>AUDIT_RISK</type>
      <severity>BLOCKER</severity>
      <task_ref>gander-studio-p10-deferred-smalls-006</task_ref>
      <description>
Packet 006 is internally self-defeating on DESIGN.md. CHANGE 2 (final bullet) instructs the FE to
"Append a short `## Decision Record D ...` recording: old #cf3c3c/4.07:1, new #e05555/5.22:1 on --void".
That instruction writes the literal tokens `#cf3c3c` and `4.07:1` back into DESIGN.md. But SC #4 mandates
`grep -c '#cf3c3c' DESIGN.md` == 0 AND `grep -c '4.07:1' DESIGN.md` == 0. A faithful DR-D historical note
therefore FAILS SC #4, and a DR-D that satisfies SC #4 must omit the very values CHANGE 2 tells it to record.
The FE cannot satisfy both. Verified occurrence map: `#cf3c3c` lives at DESIGN.md lines 33/183/325 only,
`4.07:1` at 183/325 only (grep confirmed) — so the three-site edit clears them, and the ONLY reintroduction
source is DR-D itself. The sc-precheck missed this because DR-D content is a prose CHANGE-instruction, not a
pinned locked-frontmatter value in the script's extraction class; this is the manual-fallback scan doing its
job (gate input 6; pattern class from gander-meta-onboard-skill §6 Gaps 1-2 — SC an authored deliverable
cannot satisfy).
      </description>
      <required_revision>
Reconcile CHANGE 2 and SC #4. Pick one:
(a) Reword SC #4 so the grep-count-0 assertion applies to the three live-reference sites only (assert the
    updated `#e05555`/`5.22:1` are present at lines 33/183/325 and that DR-D exists), and explicitly PERMIT
    the stale values inside DR-D's historical record; OR
(b) Reword CHANGE 2 so DR-D records the remediation WITHOUT emitting the literal `#cf3c3c` or `4.07:1`
    tokens (e.g. "prior value was below AA; superseded by #e05555 at 5.22:1"), keeping SC #4's whole-file
    count-0 intact.
Option (a) is preferable — a changelog Decision Record legitimately should preserve the old value verbatim;
the whole-file count-0 SC is the wrong assertion for a doc that intentionally records history.
      </required_revision>
    </challenge>

    <challenge>
      <type>AUDIT_RISK</type>
      <severity>WARNING</severity>
      <task_ref>gander-studio-p10-deferred-smalls-003</task_ref>
      <description>
SC #4's grep portion is non-discriminating. `grep -c "'AUDIT_FAIL'"` and `grep -c "'CRITIQUE_BLOCK'"`
already return >=1 on the UNMODIFIED file — those single-quoted strings pre-exist in the evColor/evLabel/
MarkerShape switches (AgentTimeline.tsx lines 271-322, 376-416) and doc comments (30, 45-46). The grep would
pass even if the FE added no feedback-loop derivation. Only the second half of SC #4 (TooltipState numeric
field + panel render + "display-local" comment) actually verifies the deliverable.
      </description>
      <required_revision>
Direct the auditor (or tighten SC #4) to verify the new `TooltipState` feedback-loops field, its render in
the panel body, and the "display-local (not SEAM-04)" comment — do NOT accept the bare grep count as proof.
      </required_revision>
    </challenge>

    <challenge>
      <type>AUDIT_RISK</type>
      <severity>WARNING</severity>
      <task_ref>gander-studio-p10-deferred-smalls-003</task_ref>
      <description>
Stale-closure trap. The existing `showTooltip` is a `useCallback(..., [])` at line 645-650, defined BEFORE
`markersByAgent` (line 776, rebuilt every render). Computing `feedbackLoops`/`auditOutcome` INSIDE that
empty-dependency callback by referencing `markersByAgent` would capture the first-render map (stale). The
correct source is the per-row `agentMarkers` available at the bar-group call site (line 1030-1031, used at
1070), passed as new args into an extended `showTooltip` signature.
      </description>
      <required_revision>
Add a one-line note to packet 003: compute feedback-loop count and audit outcome at the bar-group render
call site (from `agentMarkers`) and extend the `showTooltip` signature to accept them — do NOT reference
`markersByAgent` inside the existing empty-dep `showTooltip` useCallback.
      </required_revision>
    </challenge>

    <challenge>
      <type>AUDIT_RISK</type>
      <severity>WARNING</severity>
      <task_ref>gander-studio-p10-deferred-smalls-003</task_ref>
      <description>
The a11y architecture change (FF7TooltipPanel `aria-hidden="true"` -> `role="tooltip"`, and toggling
`aria-describedby` on the active bar `<g>`) is verified only by static grep (SC #6/#7). Grep cannot prove
the runtime behavior the risk flag asks for: that `aria-describedby` is present ONLY while the bar is
active, that the bar's accessible NAME (aria-label, line 1027) is unchanged, and that there is no
double-announce. The tooltip interaction pre-exists (existing `data-testid` e2e, SC #9), so this is not a
mandatory-Playwright BLOCKER under the new-interactive-flow rule — but the a11y attribute toggle is new.
      </description>
      <required_revision>
Recommend (not required) a Tier-2/a11y assertion in the existing timeline spec: on bar focus, the active
`<g>` gains `aria-describedby="timeline-tooltip"` and still exposes its original accessible name; on blur,
`aria-describedby` is gone. At minimum, name this as an explicit a11y-auditor check in the packet's
relevant-critics note (the PM already flags it — make it a runtime check, not a grep).
      </required_revision>
    </challenge>

    <challenge>
      <type>AUDIT_RISK</type>
      <severity>WARNING</severity>
      <task_ref>gander-studio-p10-deferred-smalls-006</task_ref>
      <description>
SC #2 (`grep -c 'below AA' globals.css` == 0) is case-sensitive and the existing line-357 annotation reads
"BELOW AA" (uppercase). The grep therefore returns 0 BEFORE any edit, so it cannot catch a failure to update
the AA-status wording. The discriminating check is the "~5.22:1 present" clause, not the below-AA count.
      </description>
      <required_revision>
Make SC #2 case-insensitive (`grep -ci 'below aa'`) or anchor it on the required new text
(`5.22:1` and `resolved` present in the line-357 comment). Low priority; the substantive value/ratio SCs
carry the check.
      </required_revision>
    </challenge>

  </challenges>

  <audit_risk_forecast>
    1. DESIGN.md DR-D vs SC #4 (the BLOCKER above) is the highest-probability audit failure — resolve the
       count-0-vs-historical-record contradiction before dispatch or 006 fails SA/QA on its own SC.
    2. Packet 003 a11y: the aria-hidden -> role="tooltip" change is a genuine accessible-tree change. Even
       with aria-label preserved, an a11y auditor should confirm the tooltip announces as DESCRIPTION only
       and the bar name is not lost or doubled — grep won't surface a double-announce.

    Verifications that PASSED (no challenge, recorded for ORC confidence):
    - Both ORC ground-fact corrections are CORRECT on disk: FF7TooltipPanel already replaced native <title>
      (AgentTimeline.tsx line 496-603, comment line 499); over-match logic is matchesSlug in
      session-slug-match.ts line 14-15 (startsWith||includes), and session-list.test.ts line 209 asserts the
      over-match as `true` and must flip to `false`. Neither correction is wrong -> no BLOCKER there.
    - #e05555 contrast re-derived independently = 5.22:1 on #070d0c (PASS AA >=4.5:1). Target value is
      ledger-pre-ratified in deferred-work.md line 22 ("Lighten --redb to approximately #e05555"), so FE
      implementing it + mechanical doc-sync is NOT a remit violation — no UI packet required (risk flag a
      RESOLVED).
    - Regression guard (risk flag c) is present and satisfiable: the only destructive surface (button.tsx
      destructive variant) uses `text-destructive` on `bg-destructive/10` — red TEXT on a 10%-alpha tint, no
      white-on-solid-red pairing. Lightening --redb raises that text contrast; the guard resolves to
      "text/graphical only, no regression," which SC #5 explicitly accepts.
    - matchesSlug anchoring (=== slug || startsWith(slug+'-')) verified against all four new guard assertions
      and both retained existing assertions (lines 206/212 hold; 209 flips) — GATE-TEST 004 is satisfiable.
    - AgentMarker.ev carries the exact 'AUDIT_FAIL'/'CRITIQUE_BLOCK'/'AUDIT_PASS' strings (switch cases
      271-322) — the display-local derivation in 003 is valid.
  </audit_risk_forecast>

  <post_mortem_patterns_checked>
    Consulted: deferred-work.md (authoritative ledger wording, all three items + DEFERRED-005 prior
    contrast-token history). Recurrence declaration (OVERSCOPED, DRY, aas-3-legacy-envelope,
    subagentstop-complete-miss) present in PM <routing_notes> lines 226-229 — MISSING_RECURRENCE_DECLARATION
    does not apply. SC-precheck report attached and clean (16 cmds, 0 unsat/0 self-defeating) — the DR-D
    contradiction is outside the script's locked-frontmatter extraction class and was caught by the mandated
    manual fallback scan (locked-line SC consistency, gander-meta-onboard-skill §6 Gaps 1-2). OVERSCOPED
    file-count rule (>=4 files) checked: 003=1, 004=2, 006=2 — no mandatory split.
  </post_mortem_patterns_checked>
</plan_critique>
