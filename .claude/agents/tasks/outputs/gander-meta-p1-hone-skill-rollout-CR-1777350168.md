<plan_critique>
  <plan_id>gander-meta-p1-hone-skill-rollout</plan_id>
  <status>BLOCK</status>

  <challenges>

    <challenge>
      <type>ASSUMPTION</type>
      <severity>BLOCKER</severity>
      <task_ref>gander-meta-p1-hone-skill-rollout-HR-002</task_ref>
      <description>
HR-002 Edit 3a renames `## Step 0.7: Scry (Optional)` to `## Step 0.8: Scry (Optional)`. But `## Step 0.8: Name Confirmation (Naming-Novel Sprints)` ALREADY EXISTS in dispatch-task SKILL.md at line 194 (added in agent-improvement-2026-04-22-2 changelog row, then a Step 0.8 in dispatch-task 1.1.0). The PM's rename produces TWO `## Step 0.8` headings in the same file — Scry and Name Confirmation — making the procedure ambiguous and breaking any internal cross-reference to "Step 0.8".

Evidence: /home/jhber/projects/gander/.claude/skills/dispatch-task/SKILL.md line 194 — `## Step 0.8: Name Confirmation (Naming-Novel Sprints)`. Routing note 5 acknowledges the Scry rename "0.7 → 0.8" without noting the pre-existing 0.8 collision.
      </description>
      <required_revision>
PM must add a third edit (Edit 3a-pre) that first renames the existing `## Step 0.8: Name Confirmation` → `## Step 0.9: Name Confirmation`. Then Edit 3a renames Scry 0.7 → 0.8. Then Edit 3b inserts new pm-preflight as 0.7. Final ordering: 0.6 PM Context Preflight → 0.7 PM Preflight (new) → 0.8 Scry (renumbered from 0.7) → 0.9 Name Confirmation (renumbered from 0.8). The PM must also grep for any internal references to "Step 0.7" or "Step 0.8" in the rest of dispatch-task and across other skill/agent files (the orchestrator.md `Step 0.7 Scry` references at minimum) and update them in this same packet — or explicitly defer them with rationale. SC9 must be updated accordingly.
      </required_revision>
    </challenge>

    <challenge>
      <type>AUDIT_RISK</type>
      <severity>BLOCKER</severity>
      <task_ref>gander-meta-p1-hone-skill-rollout-HR-002</task_ref>
      <description>
HR-002 SC9 specifies `grep -c "Step 0.8" /home/jhber/projects/gander/.claude/skills/dispatch-task/SKILL.md returns ≥1`. That grep returns ≥1 in the file's CURRENT pre-edit state because `## Step 0.8: Name Confirmation` already exists at line 194. The SC therefore does not verify the Scry rename actually executed — it would PASS even if Edit 3a was silently skipped. Standards.md auditor would catch this as a tautological SC.

Evidence: /home/jhber/projects/gander/.claude/skills/dispatch-task/SKILL.md line 194; the SC's grep is satisfied by pre-existing content unrelated to the edit being verified.
      </description>
      <required_revision>
Replace SC9's "Step 0.8" check with `grep -c '^## Step 0.8: Scry' ... returns 1` (anchors on the heading body, not a substring match) and add a complementary SC that asserts `grep -c '^## Step 0.7: Scry' ... returns 0` (the old heading is gone). Same precision required for the new pm-preflight step: `grep -c '^## Step 0.7: PM Preflight' returns 1`. After the renumber chain fix in BLOCKER-001 above, also add `grep -c '^## Step 0.9: Name Confirmation' returns 1` and `grep -c '^## Step 0.8: Name Confirmation' returns 0`.
      </required_revision>
    </challenge>

    <challenge>
      <type>AUDIT_RISK</type>
      <severity>BLOCKER</severity>
      <task_ref>gander-meta-p1-hone-skill-rollout-HR-001</task_ref>
      <description>
HR-001 SC5 verification recipe is broken regex. The recipe is:

  `awk '/^description:/{print; exit}' .../SKILL.md | grep -c '[&lt;&gt;]'`

`[&lt;&gt;]` is the literal character class containing the bytes `&`, `l`, `t`, `;`, `g`. It does NOT match `<` or `>`. The SC therefore cannot detect angle-bracket characters in the description field — the very thing it claims to verify. A description containing `<foo>` would PASS this SC because the regex never matches the actual angle-bracket bytes. The PM appears to have accidentally HTML-encoded the regex (likely from a rendering pipeline) — but the SC is what HR will literally execute.

Additionally, SC8 ("No angle-bracket characters in any of the 4 description: frontmatter fields") has no verification recipe at all — purely narrative.

Evidence: PM packet HR-001 success_criteria SC5 and SC8.
      </description>
      <required_revision>
Rewrite SC5's recipe to use the literal character class: `awk '/^description:/{print; exit}' .../SKILL.md | grep -c '[<>]'` (each must return 0). For SC8, add an explicit recipe — either fold it into SC5 (extending the same grep) or add: `for f in env-preflight silent-substitution-detect pm-preflight react-flow-render-smoke; do awk '/^description:/{print; exit}' /home/jhber/projects/gander/.claude/skills/$f/SKILL.md | grep -c '[<>]'; done` — each must output 0.
      </required_revision>
    </challenge>

    <challenge>
      <type>ASSUMPTION</type>
      <severity>WARNING</severity>
      <task_ref>gander-meta-p1-hone-skill-rollout-HR-002</task_ref>
      <description>
HR-002 Edit 3b says "Insert after the last paragraph of Step 0.6 (the post-mortem root cause note that ends with 'Removing the judgment moment removes the failure mode.')". But Step 0.6 in dispatch-task has TWO trailing paragraphs: line 160 ends with "Removing the judgment moment removes the failure mode." and line 162 is the `(Post-mortem root cause: ...)` citation paragraph that closes Step 0.6. The PM's instruction is ambiguous — does the new Step 0.7 land between line 160 and line 162 (orphaning the post-mortem citation under the new step) or after line 162?

Evidence: /home/jhber/projects/gander/.claude/skills/dispatch-task/SKILL.md lines 160-162.
      </description>
      <required_revision>
PM should specify: "Insert after the `(Post-mortem root cause: ...)` paragraph that ends Step 0.6 at line 162, before the existing `## Step 0.7: Scry (Optional)` heading at line 164." This places the new Step 0.7 between the (now closed) Step 0.6 and the (renumbered to 0.8) Scry section.
      </required_revision>
    </challenge>

    <challenge>
      <type>AUDIT_RISK</type>
      <severity>WARNING</severity>
      <task_ref>gander-meta-p1-hone-skill-rollout-HR-001</task_ref>
      <description>
silent-substitution-detect is positioned by the PM as a Tier-1 SA-gate sub-check inside audit-pipeline (Step 2.1). The source post-mortem §6 G1 (gander-studio-p4-proximity-edge-hardening.md line 153) says "Code-not-prompt: implement as a Stop hook on FE agent — route to HR." The hone-2026-04-27-5 §8d note says "Could alternatively be a Tier-3 sub-rule under audit-pipeline rather than a standalone skill." The PM's choice (Tier-1, SA gate, FE-diff scope) is a third architectural option that satisfies neither source recommendation literally.

Tier-1 placement is defensible — runs early, blocks before standards check — but the PM does not justify the deviation. If HR encodes Tier-1 semantics into the skill body and a later post-mortem reverts to the Stop-hook design, the skill will need a description rewrite plus relocation in the audit-pipeline integration.

Evidence: /home/jhber/projects/gander-studio-alpha/docs/post-mortems/gander-studio-p4-proximity-edge-hardening.md §6 G1; /home/jhber/projects/gander/docs/agent-improvements/hone-2026-04-27-5.md §New Skill Candidates row 2.
      </description>
      <required_revision>
PM should add a one-paragraph rationale to HR-001's silent-substitution-detect spec explaining why Tier-1 SA-gate placement was selected over (a) Stop hook on FE and (b) Tier-3 sub-rule. Or, if no strong preference, defer the placement decision to the skill body itself (mark integration TBD and resolve at audit-pipeline edit time in HR-002). This is not a blocker — it's a design-justification gap that will resurface in the next post-mortem if not closed.
      </required_revision>
    </challenge>

  </challenges>

  <audit_risk_forecast>
The auditor will most likely catch two things in this plan even after the BLOCKERs are fixed:

1. **Description-quality compliance for the 4 new skills.** The PM does not provide draft descriptions; HR composes them independently against the criteria (≤1024 chars, third-person, no angle-brackets, single-line scalar, primary use case in first 80 chars, 3-6 trigger phrases). The probability that all 4 land clean on first pass is low. Expect a description rewrite cycle on at least one. PM should add an SC requiring HR to record the drafted descriptions verbatim in the completion_packet so the auditor can review them inline rather than re-reading 4 files.

2. **Cross-file step-number references after the dispatch-task renumber.** Beyond the dispatch-task internal references, orchestrator.md and possibly other skill specs reference "Step 0.7 Scry" by number (e.g., agent-improvement-2026-04-23-1 changelog row mentions "Step 0.7 Scry (Optional)" being added to dispatch-task). The auditor will likely flag at least one stale cross-reference unless HR-002 explicitly enumerates and updates them, or the PM marks them out-of-scope with a follow-up task.
  </audit_risk_forecast>

  <post_mortem_patterns_checked>
- gander-studio-p4-proximity-edge-hardening.md §5, §6, §8d (read in full at post-mortem source plus §6 G1 silent-substitution-check origin)
- gander-studio-p2-agent-cards.md §6 G1, §8d (pm-preflight + react-flow-render-smoke origin)
- agent-changelog.md (recent rows: hone-2026-04-27-5 line 387-393, agent-improvement-2026-04-23-1 line 147-154 confirming dispatch-task Step 0.7 history, agent-improvement-2026-04-22-2 line 99-103 confirming Step 0.8 added in 1.1.0)
- hone-2026-04-27-5.md §New Skill Candidates table for scope authorization
  </post_mortem_patterns_checked>
</plan_critique>
