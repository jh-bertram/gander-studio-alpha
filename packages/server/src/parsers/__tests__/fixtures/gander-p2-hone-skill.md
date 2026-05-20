---
type: post-mortem
sprint: gander-p2-hone-skill
date: 2026-04-22
head_sha: 8f480ef
gap_classes:
  - sc-recipe-bug
  - skill-bypass
  - timestamp-drift
  - pm-rounds-cap
related_sprints:
  - "[[gander-p2-skills-ra-cleanup]]"
status: written
---

# Post-Mortem: gander-p2-hone-skill
**Date:** 2026-04-22
**Project:** `projects/gander/` (meta-agent control plane)
**Duration:** ~75 minutes (01:58 UTC 2026-04-23 first SPAWN → 03:12 UTC archivist SPAWN; session TZ was 2026-04-22 PDT)
**Final State:** Shipped. New `hone` skill (v1.0.0, 350 lines) at `.claude/skills/hone/SKILL.md` + post-mortem skill bumped to v1.1.0 with Section 8 "Skill-Use Analysis". Both commits pushed to `origin/main` (3a1567e, 8f480ef).

---

## 1. Original Request

**Human (2026-04-22):**
> Do we have a skill-improvement skill? If not, let's make one. Let's modify our post-mortem to be able to analyze skill use, identify patterns we would like to be more deterministic and are good candidates for new skills, and present the findings in a way that the skill-improvement skill can utilize. The skill-improvement skill must also do research because skills and tools and configurations are always changing, so we need to stay on top of what is out there and best practice. Let's name this skill "hone".

**Brief files:**
- Task stub: `.claude/tasks/gander-p2-hone-skill.md`
- PM round 1: `.claude/agents/tasks/outputs/gander-p2-hone-skill-PM-1776909911.md`
- PM round 2 (revised post-Critic-BLOCK): `.claude/agents/tasks/outputs/gander-p2-hone-skill-PM-1776910920.md`
- PM warning-resolution amendment: `.claude/agents/tasks/outputs/gander-p2-hone-skill-PM-1776911600.md`

**Scope at intake:**
- No `hone` or `skill-improvement` skill existed under `.claude/skills/`.
- `post-mortem` skill lacked any structured section for skill-use observations — skill-catalog governance was un-triggerable.
- `agent-improvement` skill (the agent analog) was well-established (v1.3.0) and usable as a structural template.
- `~/.claude/skills` is symlinked to `gander/.claude/skills` — single-path operation, no multi-copy risk.

**Skill invoked:** `/zoey` → full `dispatch-task` pipeline (meta-agent work required the full gate path).

---

## 2. Agent Activity Log

### Preflight & Planning — (gander-p2-hone-skill)

| Seq | Timestamp (UTC) | Event | Agent | Notes |
|-----|-----------------|-------|-------|-------|
| 2 | 01:58:00 | SPAWN | RA#1 (scry) | 10-finding evidence_brief; Anthropic skill spec + 2 arxiv preprints + SRE analog |
| 40 | 02:05:00 | COMPLETE | RA#1 | brief delivered — 8 pm_action_items, 2 conflict blocks |
| 3/41 | 02:05:15 | SPAWN | PM#1 | decomposition round 1 with brief embedded |
| 42 | 02:10:00 | COMPLETE | PM#1 | 2-task serialized plan (B before A) |
| 4/43 | 02:15:00 | SPAWN | CR#1 | plan gate round 1 |
| 44 | 02:25:00 | CRITIQUE_BLOCK | CR#1 | 2 BLOCKERs + 4 WARNINGs |
| 5/45 | 02:22:00 | SPAWN | PM#2 | revision request |
| 46 | 02:45:00 | COMPLETE | PM#2 | revised plan (round 2) |
| 6/47 | 02:30:00 | SPAWN | CR#2 | plan gate round 2 |
| 47 | 02:50:00 | CRITIQUE_PASS | CR#2 | 6 findings RESOLVED; 3 new WARN-level grep-scope tightenings |
| 48 | 03:00:00 | COMPLETE | PM#3 | warning-resolution amendment (3 SC tightenings) |

**Feedback loops (planning):** 1 — Critic round-1 BLOCK → PM revision → Critic round-2 PASS. 1 minor — Critic round-2 WARNs → PM amendment (no further Critic round).

**Root cause of BLOCK round 1:**
1. **SC#3 + SC#5 bundled mechanical and judgment checks** — "description is under 1024 chars, written in third person, front-loads the primary use case, contains no XML tags, enumerates at least 5 specific trigger phrases" as ONE criterion. Auditors on meta-agent work have no model-judgment budget; they need atomic grep/wc assertions.
2. **Changelog append mechanics under-specified** — Task B's "don't close the session block" + Task A's "append to existing block" was semantically correct but missing the file-tail discipline (`|\n` terminator) and the explicit locator procedure (grep-based `HEADER_LINE` + `NEXT_HEADER`). A naïve tail-append would have landed under the prior `agent-improvement-2026-04-22-2` block.

### Implementation — Task B (post-mortem Section 8)

| Seq | Timestamp | Event | Agent | Notes |
|-----|-----------|-------|-------|-------|
| 7 | 02:40:00 | SPAWN | HR#1 | Task B dispatched |
| 9 | 02:46:52 | COMPLETE | HR#1 | Section 8 inserted; version bumped 1.0.0→1.1.0; archive written |
| 8 | 02:50:00 | SPAWN | AUDIT#1 | audit gate (distinct from HR spawn per meta-independence rule) |
| 49 | 02:46:35 | AUDIT_PASS | AUDIT#1 | 14/14 SCs verified mechanically |

**Feedback loops:** 0.
**Commit:** `3a1567e` — "feat(post-mortem): add Section 8 Skill-Use Analysis (v1.1.0)"

### Implementation — Task A (hone skill creation)

| Seq | Timestamp | Event | Agent | Notes |
|-----|-----------|-------|-------|-------|
| 9 | 02:55:00 | SPAWN | HR#2 | Task A dispatched (after Task B AUDIT_PASS) |
| 11 | 02:58:04 | COMPLETE | HR#2 | 350-line hone SKILL.md created; changelog row appended |
| 10 | 03:05:00 | SPAWN | AUDIT#2 | audit gate (distinct from HR#1/HR#2/AUDIT#1) |
| 50 | 02:57:36 | AUDIT_PASS | AUDIT#2 | 20/20 SCs PASS; awk recipe bug caught & corrected |

**Feedback loops:** 0.
**Commit:** `8f480ef` — "feat(skills): add hone skill for iterative skill-catalog governance"

### Close

| Seq | Timestamp | Event | Agent | Notes |
|-----|-----------|-------|-------|-------|
| — | 03:10:00 | requirements_validate | ORC#0 (inline) | 6/6 COVERED — run inline, not via formal skill invocation |
| 11 | 03:12:00 | SPAWN | AR#1 | archivist |
| 51 | 03:00:00 | COMPLETE | AR#1 | archive_entry logged to docs/project_log.md |

**Deviation from PM brief:** None at implementation level. The WARNING-resolution amendment was an acknowledged 3rd planning round beyond the 2-round Critic limit; it was a mechanical SC tightening, not a re-plan. Orchestrator routed it as a warning_resolution_request per Step 1.5 protocol rather than invoking the Critic a third time.

---

## 3. Post-Delivery: Runtime Bugs

### Bug 1 — PM-generated awk range-operator recipe returns false negative

**Reporter:** AUDIT#2 (Task A auditor)
**Error:** Running the PM-specified SC recipe `awk '/^## Why This Exists$/,/^## /' .claude/skills/hone/SKILL.md | grep -c 'progressive disclosure'` returns 0, but the token is present in the Why-This-Exists paragraph body.
**Detected:** During AUDIT#2 mechanical verification of SC#5n. The auditor noticed the grep returned 0 for content it could see in the file and recognized the awk pattern bug.

**Root cause:** Awk's range operator `/A/,/B/` evaluates pattern B starting from the **same line** that matched A. Because `^## ` matches the `## Why This Exists` header line itself, the range closes immediately and captures only the header — no body content.

**Fix applied:** AUDIT#2 substituted a state-machine awk pattern: `awk '/^## Why This Exists$/{p=1; next} /^## /{p=0} p'`. This starts capturing on the line AFTER the header and stops AT the next H2. Verified all three tokens (`progressive disclosure`, `governance`, `skill-creator`) present as expected. No remediation needed — the **content** was correct; only the **test recipe** was flawed.

**Why agents did not catch this earlier:** The Critic reviewed the plan's logical structure and mechanical-verifiability posture, not the executable correctness of every grep/awk snippet in the success criteria. HR#2 (implementing agent) followed the content spec and produced valid output; it had no reason to run the auditor's test recipe against its own output. The bug only surfaced at the auditor step — which is the correct pipeline stage to catch it, but it was a lucky catch (a less-attentive auditor could have reported FAIL).

---

## 4. QA Gap Analysis

**Current QA protocol:** Meta-agent audits run `grep`, `wc`, `awk`, `diff`, `tail -c`, `test -f`. No Playwright, no test runner, no npm audit (meta-project has no build). Auditors compare file state against mechanically verifiable success criteria written in the PM packet.

**What this caught:**
- Bundled judgment-vs-mechanical SCs (Critic BLOCK #1 round-1).
- Under-specified changelog append mechanics (Critic BLOCK #2 round-1).
- 3 grep-scope tightenings needed (Critic WARN round-2: SC#5n, SC#3a, SC#6 file-wide when section-scope would be more precise).
- 14/14 SCs PASS for Task B, 20/20 for Task A — the mechanical-only posture worked.
- The PM's broken awk recipe (AUDIT#2 caught it empirically).

**What this missed:**
- **Nothing structural.** The gates behaved as designed. The primary gap is a protocol observation (see §6), not a pipeline escape.

**Recommendations:**
- Add a rule to the Critic's checklist for future sprints: any `awk /A/,/B/` range where both patterns could match the same line is suspect. Prefer stateful awk `{p=1; next} /B/{p=0} p`.
- Consider adding a pre-audit "recipe smoke test" step where the PM validates its own SC recipes against the expected on-disk output before publishing the plan — catch this class of bug before it reaches the auditor.

---

## 5. Agent Performance Summary

| Agent | Tasks | First-pass rate | Notes |
|-------|-------|----------------|-------|
| RA (scry) | 1 | 100% | 10 findings, 2 conflict blocks, 8 pm_action_items, verbatim provenance preserved |
| PM | 3 rounds | 33% (1 PASS of 3) | Round 1 blocked on bundled SCs + append mechanics; round 2 PASS; round 3 was a mechanical amendment, not a failure |
| Critic | 2 rounds | n/a (gate runs, not tasks) | Round 1 correctly blocked on 2 load-bearing issues; round 2 confirmed resolution + surfaced 3 non-blockers |
| HR | 2 | 100% | Both Task B and Task A landed content on first attempt; no remediation loops |
| Auditor | 2 | 100% | Both AUDIT_PASS; AUDIT#2 independently corrected a PM-specified awk bug |
| Archivist | 1 | 100% | Archive entry logged to docs/project_log.md |

**Most impactful single agent action:** AUDIT#2's catch of the PM awk range-operator bug. A less-attentive auditor running the recipe verbatim would have reported FAIL on content that was actually correct, triggering a false-positive remediation loop. The fact that the auditor recognized the pattern, bypassed it, and proceeded to verify the *intent* of the SC rather than the *letter* of the recipe is exactly the kind of independent reasoning the independent-audit gate exists to provide.

**Most consequential single design decision:** Scry finding #9 (description quality is the dominant driver of skill selection; 49% of curated skills in context fail to load even when forced). This made "description rewrite" a first-class output category in hone (DESCRIPTION_REWRITE in Step 3 + verbatim description artifact in Step 7 report), not a bundled sub-step. Per scry action item #5.

**Recurring failure pattern:** None. Critic round-1 BLOCK was a normal planning-iteration, not a failure cluster.

---

## 6. Protocol Gaps Identified

| Gap | Impact | Suggested fix |
|-----|--------|---------------|
| PM generates awk range-operator test recipes with the A,B-on-same-line bug. Produces false negatives when executed verbatim. | Potential false-FAIL audits (AUDIT#2 caught it this time, but the mechanism is reproducible). | Add to `pm.md` SC-authoring guidance: when writing an `awk '/A/,/B/'` range, verify A and B cannot match the same line. For paragraph-body extraction within a markdown H2-bounded section, always use stateful awk (`/A/{p=1; next} /B/{p=0} p`). Cross-reference in Critic checklist so planning also catches it. |
| Orchestrator ran `requirements-validate` inline in the main session rather than invoking the formal skill. | Low for this sprint (6 simple requirements, trivial mapping) but the same bypass pattern that `gander-p2-skills-ra-cleanup` §6 gap #6 flagged. Slippery-slope precedent. | `dispatch-task` Step 3.5 already says "invoke the skill". Tighten to: even for 2-task sprints, the skill must be invoked as a skill (not an inline procedure). Consider making the `requirements-validate` skill accept a structured input and return a structured output, so it can be invoked programmatically. |
| Orchestrator bypassed the `assign-agents` skill for novel-name registration + expectation manifest writing — did it manually. | Low here (single-path write, 2 HR tasks, no renames). But `assign-agents` exists precisely to standardize this path; bypassing it means its protections (name-concept stability, receipt-check schema) depend on ORC discipline rather than skill enforcement. | Same fix class as above: dispatch-task Step 2 should treat "invoke assign-agents" as mandatory, not advisory. The enforcement mechanism is Orchestrator self-discipline. Consider: audit-pipeline at sprint close could verify an expectation_manifest block exists in docs/task-registry.md for every sprint. |
| Dual event-log file split when UTC midnight crosses mid-session. | seq 2-11 written to `agent-events-2026-04-23.jsonl`; the SubagentStop hook continued writing seq 40-51 to `agent-events-2026-04-22.jsonl` (started earlier the same session). Seq collisions between files (e.g., both have seq 9). Cosmetic — sprint reconstruction still works, but tooling that assumes single-file seq-uniqueness breaks. | Decide one rule in Gander CLAUDE.md: event log is keyed to UTC date of the first SPAWN in the session OR keyed to the human's local-TZ date — pick one. The current "today's file" is ambiguous when a session spans midnight. Configure the SubagentStop hook to match the Orchestrator's file choice. |
| Third PM round (warning_resolution) exists but is not in the protocol's explicit round cap. | Minor. Protocol says "two jidoka rounds per sprint" and "two scry rounds per sprint" but does not explicitly cap PM planning rounds. Round 3 here was a mechanical amendment, not a re-plan — a reasonable accommodation — but the protocol is silent on it. | Clarify in orchestrator.md Step 1.5: "warning_resolution" rounds are not counted toward the Critic round cap and must be a compact `plan_amendment` (list of specific SC changes), not a full re-decomposition. The current sprint followed this convention de facto; make it de jure. |

---

## 7. Final Deliverable State

**Files committed:**
- `.claude/skills/hone/SKILL.md` (new, 350 lines, v1.0.0)
- `.claude/skills/post-mortem/SKILL.md` (modified, v1.0.0 → v1.1.0)
- `docs/agent-versions/skills/post-mortem/v1.0.0-2026-04-22.md` (archive)
- `docs/agent-changelog.md` (new `## gander-p2-hone-skill` block, 2 rows)

**Commits pushed to origin/main:**
- `3a1567e` — feat(post-mortem): add Section 8 Skill-Use Analysis (v1.1.0)
- `8f480ef` — feat(skills): add hone skill for iterative skill-catalog governance

**Build:** n/a (markdown only).
**Runtime:** Both skills registered and visible in the skill list (verified via system-reminder post-Task-A).

**Features delivered:**
- `hone` skill: 13 required H2 sections (Why This Exists, When To Use, Steps 0–8, Periodic Review Protocol, What Good Hone Output Looks Like); mandatory RA research step in Step 2 with invoke/skip conditions mirroring scry; human confirmation gate for retirements in Step 6; versioning rules embedded verbatim (not imported); 4-outcome vocabulary (VALUABLE / PARTIAL_VALUE / LOW_VALUE / NOT_TRIGGERED) consumed from Section 8a.
- Post-mortem Section 8: five subsections (8a Invocation Log, 8b Obsolescence Candidates, 8c Content-Quality Candidates, 8d New Skill Candidates, 8e Skill Drift Candidates) + Hand-off block; integrates into existing Step 6 with conditional hone suggestion.

**Key contracts the next engineer must know:**
- `hone` never auto-retires. Retirement candidates always route to human confirmation (Step 3 + Step 6, four locations total where the principle is restated).
- Section 8a uses 4-outcome vocabulary — PARTIAL_VALUE was the round-2 addition to close a gap the original 3-category enumeration had (triggered-but-required-remediation skills).
- Description quality is a first-class artifact in hone's output: any DESCRIPTION_REWRITE change includes a standalone revised-description text in the hone report, not just an inline edit — because scry finding #9 showed description quality is empirically the dominant driver of skill selection.
- Changelog session blocks must be terminated with `|\n` (no trailing blank line) so subsequent same-sprint appends can find and extend the block via grep locator.

---

## 8. Skill-Use Analysis

> **Dogfood run.** This is the first post-mortem ever written with Section 8. The analysis below is the live input `hone` will consume if invoked after this document.

### 8a. Skill Invocation Log

| Skill | Invocations | Outcome | Owner | Last reviewed | Notes |
|-------|-------------|---------|-------|---------------|-------|
| `scry` | 1 | VALUABLE | ORC#0 | 2026-04-22 | 10-finding evidence_brief with 8 pm_action_items; brief's design constraints were fully reflected in Task A's mechanical SCs |
| `dispatch-task` | 1 | VALUABLE | ORC#0 | 2026-04-22 | Full pipeline ran per spec — preflight → PM → Critic → HR → Auditor → Archivist |
| `assign-agents` | 0 | NOT_TRIGGERED | ORC#0 | 2026-04-22 | ORC wrote Names Registry + Expectation Manifest manually to `docs/task-registry.md` instead of formally invoking the skill |
| `jidoka` | 0 | NOT_TRIGGERED | ORC#0 | 2026-04-22 | Correctly skipped — >150-line invoke trigger overridden by PM per Critic W5 routing_notes rewrite (~90% of Task A lines were pre-specified) |
| `audit-pipeline` | 0 | NOT_TRIGGERED | ORC#0 | 2026-04-22 | ORC dispatched `code-auditor` agent directly twice rather than invoking the audit-pipeline skill |
| `requirements-validate` | 0 | PARTIAL_VALUE | ORC#0 | 2026-04-22 | ORC executed the procedure inline in the main session; output file written to the correct path but the formal skill invocation was bypassed |
| `post-mortem` | 1 | VALUABLE (in progress) | ORC#0 | 2026-04-22 | This document — Section 8 populated with live data |

### 8b. Obsolescence Candidates

No obsolescence candidates yet. The threshold is 2+ consecutive sprints with non-value outcomes. This is the first post-mortem with Section 8; `hone` needs sequential data before it can populate this table.

### 8c. Content-Quality Candidates

| Skill | Deviation observed | Suspected cause | Recommended action |
|-------|--------------------|----------------|--------------------|
| `assign-agents` | Its Step 0.5 (Names Registry) and Step 4 (Expectation Manifest) were executed directly by ORC rather than invoked through the skill. The skill was in context, visible in the skill list, and triggered by dispatch-task Step 2 — yet ORC wrote the outputs inline. | AMBIGUOUS_STEP — the skill's procedure reads like a mechanical recipe the ORC can follow directly, so the "invoke the skill" vs "follow its steps inline" distinction is lost. | CLARIFY — amend the skill's frontmatter description or a prominent top-of-file note to state that the skill is a procedure that the Orchestrator *calls*, not a recipe it *transcribes*. Or: accept that the ORC is the runner and rewrite the skill as a documented procedure rather than an invoked one. |
| `requirements-validate` | Same pattern — Orchestrator read the skill, extracted requirements, produced the coverage report, wrote it to the correct output path. But the skill was not "invoked" in the protocol sense. | AMBIGUOUS_STEP — same root cause. | Same fix class. |
| `audit-pipeline` | Dispatched the `code-auditor` agent directly (twice) with a verbose custom prompt rather than invoking `audit-pipeline` as a skill. The `code-auditor` agent itself produced the SA+QA+SX output correctly, so the audit outcome was not affected. | AMBIGUOUS_STEP — the skill packages the auditor invocation; bypassing it loses the packaging benefit (consistent prompt, standard scope boundaries). | Same fix class — the "skill as invocable unit" vs "skill as procedural reference" tension is the common thread across these three. |

### 8d. New Skill Candidates

| Pattern observed | Frequency in sprint | Effort to encode as skill | Suggested skill name |
|-----------------|---------------------|--------------------------|---------------------|
| Rollback-point + names-registry + expectation-manifest write to `docs/task-registry.md` with standardized format | 1 × per sprint (would be 1 × per sprint going forward) | LOW — already specified in assign-agents Step 0.5 and 4 | Subsume into `assign-agents` via Clarify fix above; no new skill needed |
| Event log append with seq continuation (`grep -c '^## ' | tail`, increment seq, JSON append) | 10+ times this sprint (every SPAWN) | LOW — ~10 lines of bash | `log-event` — a trivial helper that abstracts the seq-increment + JSON append. Could also consolidate multi-file writes if the UTC-date split gap (§6 row 4) is solved here. |
| Durability commit scoped to a task packet (git add specific files, commit message with `task: {id}` and `Audit: PASS`) | 2 × per sprint (one per task) | LOW — commit-message template + git add scoping | `commit-packet` — automated git commit after audit pass, deriving files from the packet's `<files_modified>` / `<files_created>` fields |

### 8e. Skill Drift Candidates

| Skill | Drift observed | Suggested fix |
|-------|---------------|---------------|
| `dispatch-task` | Step 2 says "Do not spawn implementing agents manually — use the [assign-agents] skill" but this sprint spawned HR directly in two places. The rule exists; enforcement is ORC discipline. | Add to dispatch-task Step 2 a hard-gate language or mechanical check ("before spawning any agent, verify the Expectation Manifest contains an entry for this task_id"). |
| `post-mortem` | Step 2e "Remediation Output Files" assumes the glob pattern `*-remediate*.md` — but this sprint had zero remediation files (no audit failures), so the pattern would silently return empty. Not a drift per se, but the step reads as if remediation files are expected. | Minor clarification: Step 2e could explicitly note "if the sprint had no audit failures, this step returns no files and that itself is a signal — record it in Section 5 first-pass rate." |
| `event log` conventions in gander CLAUDE.md | "today's file" is ambiguous at UTC midnight; sessions starting pre-midnight locally but logging post-midnight-UTC split across two files, causing seq collisions. | Decide UTC-date-keyed (protocol) vs local-TZ-keyed (practical) and make the SubagentStop hook match. |

### Hand-off to hone

> Post-mortem Section 8 complete. 7 skills logged. 0 obsolescence candidates, 3 content-quality candidates, 3 new skill candidates, 3 drift candidates. Run the `hone` skill to act on these findings.
