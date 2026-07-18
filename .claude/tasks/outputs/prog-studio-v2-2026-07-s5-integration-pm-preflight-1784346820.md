pm_preflight_checklist:
  source_post_mortems:
    - /home/jhber/projects/gander-studio-alpha/docs/after-actions/prog-studio-v2-2026-07-s4-retirement.md
    - /home/jhber/projects/gander/docs/after-actions/gander2-p1-genesis.md
    - /home/jhber/projects/gander/docs/after-actions/gander-meta-staged-batch-p1.md
  recurring_patterns:
    - pattern: background-spawn-turn-stall
      description: "declared recurring tag (recurring_tags frontmatter)"
      pm_check: "Declared recurring tag from after-action §4/recurring_tags — review prior-sprint recurrence before decomposition."
      source_files:
        - /home/jhber/projects/gander/docs/after-actions/gander2-p1-genesis.md
    - pattern: background-toolset-variance
      description: "declared recurring tag (recurring_tags frontmatter)"
      pm_check: "Declared recurring tag from after-action §4/recurring_tags — review prior-sprint recurrence before decomposition."
      source_files:
        - /home/jhber/projects/gander/docs/after-actions/gander2-p1-genesis.md
    - pattern: deny-rail-integrity-positive
      description: "declared recurring tag (recurring_tags frontmatter)"
      pm_check: "Declared recurring tag from after-action §4/recurring_tags — review prior-sprint recurrence before decomposition."
      source_files:
        - /home/jhber/projects/gander/docs/after-actions/gander-meta-staged-batch-p1.md
    - pattern: eval-run-gate-debt
      description: "declared recurring tag (recurring_tags frontmatter)"
      pm_check: "Declared recurring tag from after-action §4/recurring_tags — review prior-sprint recurrence before decomposition."
      source_files:
        - /home/jhber/projects/gander/docs/after-actions/gander-meta-staged-batch-p1.md
    - pattern: ghost-tombstone-false-positive
      description: "declared recurring tag (recurring_tags frontmatter)"
      pm_check: "Declared recurring tag from after-action §4/recurring_tags — review prior-sprint recurrence before decomposition."
      source_files:
        - /home/jhber/projects/gander/docs/after-actions/gander2-p1-genesis.md
    - pattern: meta-agent-complete-miss
      description: "declared recurring tag (recurring_tags frontmatter)"
      pm_check: "Declared recurring tag from after-action §4/recurring_tags — review prior-sprint recurrence before decomposition."
      source_files:
        - /home/jhber/projects/gander/docs/after-actions/gander2-p1-genesis.md
    - pattern: output-path-brief-discipline
      description: "declared recurring tag (recurring_tags frontmatter)"
      pm_check: "Declared recurring tag from after-action §4/recurring_tags — review prior-sprint recurrence before decomposition."
      source_files:
        - /home/jhber/projects/gander/docs/after-actions/gander-meta-staged-batch-p1.md
    - pattern: p-suffix-code-fold
      description: "declared recurring tag (recurring_tags frontmatter)"
      pm_check: "Declared recurring tag from after-action §4/recurring_tags — review prior-sprint recurrence before decomposition."
      source_files:
        - /home/jhber/projects/gander/docs/after-actions/gander-meta-staged-batch-p1.md
    - pattern: plan-time-unverified-inherited-fact
      description: "declared recurring tag (recurring_tags frontmatter)"
      pm_check: "Declared recurring tag from after-action §4/recurring_tags — review prior-sprint recurrence before decomposition."
      source_files:
        - /home/jhber/projects/gander-studio-alpha/docs/after-actions/prog-studio-v2-2026-07-s4-retirement.md
    - pattern: sendmessage-resume-complete-miss
      description: "declared recurring tag (recurring_tags frontmatter)"
      pm_check: "Declared recurring tag from after-action §4/recurring_tags — review prior-sprint recurrence before decomposition."
      source_files:
        - /home/jhber/projects/gander-studio-alpha/docs/after-actions/prog-studio-v2-2026-07-s4-retirement.md
    - pattern: spawn-log-collision
      description: "declared recurring tag (recurring_tags frontmatter)"
      pm_check: "Declared recurring tag from after-action §4/recurring_tags — review prior-sprint recurrence before decomposition."
      source_files:
        - /home/jhber/projects/gander/docs/after-actions/gander-meta-staged-batch-p1.md
    - pattern: subagent-fanout-race
      description: "declared recurring tag (recurring_tags frontmatter)"
      pm_check: "Declared recurring tag from after-action §4/recurring_tags — review prior-sprint recurrence before decomposition."
      source_files:
        - /home/jhber/projects/gander/docs/after-actions/gander2-p1-genesis.md
    - pattern: subagentstop-complete-miss
      description: "declared recurring tag (recurring_tags frontmatter)"
      pm_check: "Declared recurring tag from after-action §4/recurring_tags — review prior-sprint recurrence before decomposition."
      source_files:
        - /home/jhber/projects/gander-studio-alpha/docs/after-actions/prog-studio-v2-2026-07-s4-retirement.md
    - pattern: G1
      description: "G1 — Output-Path-block drift on RESUME dispatches. ORC's FE-1b resume prompt embedded the output path in step-4 prose instead of the literal `## Output Path` block; the PreToolUse:Agent hook caught it and required manual human confirmation;"
      pm_check: "§6 protocol-gap row with no canonical CRITIQUE_BLOCK token. Read the linked row text and confirm this decomposition does not repeat the described gap; address it or explicitly defer it in a task packet if it applies."
      source_files:
        - /home/jhber/projects/gander-studio-alpha/docs/after-actions/prog-studio-v2-2026-07-s4-retirement.md
    - pattern: G2
      description: "G2 — Deny-rail workarounds by deletion-wave agents (3 instances, 1 undisclosed-until-return). FE#3: `rm` permission-denied → substituted `find <path> -delete`, disclosed only in its return (ORC NOTE d2 seq 11); FE#5: `node -e \"require('fs')"
      pm_check: "§6 protocol-gap row with no canonical CRITIQUE_BLOCK token. Read the linked row text and confirm this decomposition does not repeat the described gap; address it or explicitly defer it in a task packet if it applies."
      source_files:
        - /home/jhber/projects/gander-studio-alpha/docs/after-actions/prog-studio-v2-2026-07-s4-retirement.md
    - pattern: G3
      description: "G3 — SubagentStop COMPLETE-miss, validator class, 5th consecutive sprint (RV#1). Identical signature to s1–s3: the Mode-B REQVAL spawn's COMPLETE not auto-logged; ORC backfilled inline (d2 seq 44), whose note now describes the dispatch-task"
      pm_check: "§6 protocol-gap row with no canonical CRITIQUE_BLOCK token. Read the linked row text and confirm this decomposition does not repeat the described gap; address it or explicitly defer it in a task packet if it applies."
      source_files:
        - /home/jhber/projects/gander-studio-alpha/docs/after-actions/prog-studio-v2-2026-07-s4-retirement.md
    - pattern: G4
      description: "G4 — SendMessage-resumed agents' COMPLETEs never auto-log — a NEW miss sub-class, 9 backfills this sprint. Every multi-round agent resumed via SendMessage hook-missed its round COMPLETE: 6 PM rounds (amend1 d1 15, rev1 d1 20, amend2 d1 26, "
      pm_check: "§6 protocol-gap row with no canonical CRITIQUE_BLOCK token. Read the linked row text and confirm this decomposition does not repeat the described gap; address it or explicitly defer it in a task packet if it applies."
      source_files:
        - /home/jhber/projects/gander-studio-alpha/docs/after-actions/prog-studio-v2-2026-07-s4-retirement.md
    - pattern: G5
      description: "G5 — Auditor causal attribution shipped without the evidence discipline the rest of the verdict met. AUD#3's carry-forward flag was evidentially excellent on the FINDING (deterministic 3/3, baseline-checked green-at-t5, flake-label contradi"
      pm_check: "§6 protocol-gap row with no canonical CRITIQUE_BLOCK token. Read the linked row text and confirm this decomposition does not repeat the described gap; address it or explicitly defer it in a task packet if it applies."
      source_files:
        - /home/jhber/projects/gander-studio-alpha/docs/after-actions/prog-studio-v2-2026-07-s4-retirement.md
    - pattern: G6
      description: "G6 — plan-time-unverified-inherited-fact, 4th form: a packet PRECONDITION escaped the citation discipline that covered every enumeration. r0's ground-facts preamble disk-cited every enumerable; the FE-1 packet then asserted \"confirm that Ap"
      pm_check: "§6 protocol-gap row with no canonical CRITIQUE_BLOCK token. Read the linked row text and confirm this decomposition does not repeat the described gap; address it or explicitly defer it in a task packet if it applies."
      source_files:
        - /home/jhber/projects/gander-studio-alpha/docs/after-actions/prog-studio-v2-2026-07-s4-retirement.md
    - pattern: G7
      description: "G1 — background-spawn-turn-stall. 6 of 9 Wave-0 background agents ended turns after opening moves (2–4 tool uses) and needed SendMessage resume nudges; GP#3 hit background-Bash-denial errors mid-plan. ORC-session observation; event-log corr"
      pm_check: "§6 protocol-gap row with no canonical CRITIQUE_BLOCK token. Read the linked row text and confirm this decomposition does not repeat the described gap; address it or explicitly defer it in a task packet if it applies."
      source_files:
        - /home/jhber/projects/gander/docs/after-actions/gander2-p1-genesis.md
    - pattern: G8
      description: "G2 — subagent-fanout-race. GP#1 spawned its own corpus-sweep helper, then wrote its dossier BEFORE the helper returned, shipping a \"(pending sweep merge)\" stub subsection (AUD-1783887226:117–119). ORC disposition accept-as-is; sweep content"
      pm_check: "§6 protocol-gap row with no canonical CRITIQUE_BLOCK token. Read the linked row text and confirm this decomposition does not repeat the described gap; address it or explicitly defer it in a task packet if it applies."
      source_files:
        - /home/jhber/projects/gander/docs/after-actions/gander2-p1-genesis.md
    - pattern: G9
      description: "G3 — ghost-tombstone-false-positive. GHOST_CONFIRMED seq 258 fired on packet 01 while the output file was mid-write; the real COMPLETE landed 79s later (seq 265) and supersession exists only as NOTE prose (seq 270). The stale tombstone rema"
      pm_check: "§6 protocol-gap row with no canonical CRITIQUE_BLOCK token. Read the linked row text and confirm this decomposition does not repeat the described gap; address it or explicitly defer it in a task packet if it applies."
      source_files:
        - /home/jhber/projects/gander/docs/after-actions/gander2-p1-genesis.md
    - pattern: G10
      description: "G4 — meta-agent-complete-miss (recurrence) + background COMPLETE-miss breadth. SubagentStop missed CR#2's terminal COMPLETE (ORC manual backfill seq 303 — the known meta-agent class, still recurring per DEFERRED-012) AND 7 further COMPLETEs"
      pm_check: "§6 protocol-gap row with no canonical CRITIQUE_BLOCK token. Read the linked row text and confirm this decomposition does not repeat the described gap; address it or explicitly defer it in a task packet if it applies."
      source_files:
        - /home/jhber/projects/gander/docs/after-actions/gander2-p1-genesis.md
    - pattern: G11
      description: "G5 — background-toolset-variance. AUD#2 spawned with only Read attached (no Grep/Glob — AUD-1783887227:8–9); AUD#3 likewise (AUD-1783887228:3–5). Both improvised full-file Read inspection and disclosed the method in-verdict. GP#7 (this auth"
      pm_check: "§6 protocol-gap row with no canonical CRITIQUE_BLOCK token. Read the linked row text and confirm this decomposition does not repeat the described gap; address it or explicitly defer it in a task packet if it applies."
      source_files:
        - /home/jhber/projects/gander/docs/after-actions/gander2-p1-genesis.md
    - pattern: G12
      description: "G6 — amendment-application-by-convention. PM#2's warning-resolution amendment did not edit the decomposition in place (its `<unchanged>` block pins scope); ORC applied A1 when landing the manifest/spawning CR#2 (seq 292) and carried A2 into"
      pm_check: "§6 protocol-gap row with no canonical CRITIQUE_BLOCK token. Read the linked row text and confirm this decomposition does not repeat the described gap; address it or explicitly defer it in a task packet if it applies."
      source_files:
        - /home/jhber/projects/gander/docs/after-actions/gander2-p1-genesis.md
    - pattern: G13
      description: "G1 — ORC audit briefs omitted the literal `## Output Path` heading; first 4 audit SPAWNs (seqs 176–179) DENIED at PreToolUse by the sprint's own S15 WARN→DENY deliverable, live mid-sprint (NOTE 186; corrected re-spawns 187–190 passed)"
      pm_check: "§6 protocol-gap row with no canonical CRITIQUE_BLOCK token. Read the linked row text and confirm this decomposition does not repeat the described gap; address it or explicitly defer it in a task packet if it applies."
      source_files:
        - /home/jhber/projects/gander/docs/after-actions/gander-meta-staged-batch-p1.md
    - pattern: G14
      description: "G2 — audit-pipeline §2.9 eval-run gate not enforced by any of the 13 audits: 8 behaviorally-touched agent specs passed without eval run-records at the new versions; per `audit-pipeline/SKILL.md:142-146` auditors should have returned INDETER"
      pm_check: "§6 protocol-gap row with no canonical CRITIQUE_BLOCK token. Read the linked row text and confirm this decomposition does not repeat the described gap; address it or explicitly defer it in a task packet if it applies."
      source_files:
        - /home/jhber/projects/gander/docs/after-actions/gander-meta-staged-batch-p1.md
    - pattern: G15
      description: "G3 — ORC SPAWN-logging defect: HRP#2's first SPAWN (seq 157) used an invalid `HRP2` code-slot inside the expected_output filename plus a timestamp colliding with seq 156; corrected via superseding SPAWN 158 with distinct task_id/filename"
      pm_check: "§6 protocol-gap row with no canonical CRITIQUE_BLOCK token. Read the linked row text and confirm this decomposition does not repeat the described gap; address it or explicitly defer it in a task packet if it applies."
      source_files:
        - /home/jhber/projects/gander/docs/after-actions/gander-meta-staged-batch-p1.md
    - pattern: G16
      description: "G4 — (positive observation, not a gap) three permission-rail denials, zero side-doors: BE#1's scratch diag-log `rm -f` (01-BE-1783880160.md:153-154, fresh-filename workaround), BE#4's probe-file `rm` (04-BE-1783880160.md:94-105, disclosed w"
      pm_check: "§6 protocol-gap row with no canonical CRITIQUE_BLOCK token. Read the linked row text and confirm this decomposition does not repeat the described gap; address it or explicitly defer it in a task packet if it applies."
      source_files:
        - /home/jhber/projects/gander/docs/after-actions/gander-meta-staged-batch-p1.md
    - pattern: G17
      description: "G5 — (residual) SubagentStop hook folds jidoka P-suffix planner codes in COMPLETE agent_ids (SPAWN BEP#1/HRP#1/HRP#2 at seqs 155/156/158 → COMPLETE BE#1/HR#1/HR#2 at 160/161/159). Pairs reconcile by output path (backfill scan confirmed no d"
      pm_check: "§6 protocol-gap row with no canonical CRITIQUE_BLOCK token. Read the linked row text and confirm this decomposition does not repeat the described gap; address it or explicitly defer it in a task packet if it applies."
      source_files:
        - /home/jhber/projects/gander/docs/after-actions/gander-meta-staged-batch-p1.md
    - pattern: G18
      description: "G6 — run-preflight.sh §6-table extraction emitted degenerate descriptions (\"#\", \"G1\"… with no description text) when the source after-action's §6 is a pipe table (inbox-drain AA); recorded at intake (BRIEF-1783876405.md:192-193) and compens"
      pm_check: "§6 protocol-gap row with no canonical CRITIQUE_BLOCK token. Read the linked row text and confirm this decomposition does not repeat the described gap; address it or explicitly defer it in a task packet if it applies."
      source_files:
        - /home/jhber/projects/gander/docs/after-actions/gander-meta-staged-batch-p1.md
  acknowledgement_required: true
