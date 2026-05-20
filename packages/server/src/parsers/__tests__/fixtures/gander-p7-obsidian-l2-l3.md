---
type: post-mortem
sprint: gander-p7-obsidian-l2-l3
date: 2026-05-06
head_sha: ffd7dc3
gap_classes:
  - prompt-vs-contract-drift
  - reserved-key-overcorrection
  - cross-task-file-bundling
  - pre-existing-corruption-deferral
related_sprints:
  - "[[gander-p5-obsidian-l0-l1]]"
  - "[[gander-p1-jidoka-skill]]"
  - "[[gander-p6-moirai-skein-skills]]"
status: written
---

# Post-Mortem: gander-p7-obsidian-l2-l3
**Date:** 2026-05-06
**Project:** `~/projects/gander/`
**Duration:** ~2h wall-clock (PM#1 SPAWN 2026-05-06T03:47:33Z → AR#1 COMPLETE 2026-05-06T05:08:35Z)
**Final State:** Vault-wide YAML frontmatter sweep across ~150 files complete. New `vault-frontmatter-schema.md` v1.0.0 + L1 amendment v1.0.0→v1.1.0. CLAUDE.md Personal vault bridge protocol documented. `frontmatter-type-required` Tier-1 SA gate added at audit-pipeline Step 2.1d. L4 future-sprint brief written. REQVAL: 14 COVERED + 2 COVERED-WITH-RATIFIED-DEFERRAL + 0 PARTIAL + 0 MISSING. 9 commits landed.

---

## 1. Original Request

**Human (2026-05-05):** "i thought we had this written somewhere. i'm pretty sure we just had to make sure we added frontmatter to our agents and skills and logs and hooks and all our documents to make them markdown compatible. the idea is to use obsidian as a second brain, to be able to use the obsidian app on my phone or macbook to add meeting notes or reference documents, and then pick them up over here to incorporate into a project. let's scope out what we would need for that. heck we can install obsidian over here if that is better than github, though remember this is wsl on windows 11. plans?"

After ORC's plan with 4 architectural questions: **"B, but let's use icloud, which is free. i'll use itsparingly and prioritize git and such, and mainly work from macbook. 2. gitbased plus icloud. 3. all. 4. write it as a sprint to be tackled next time."**

Then: **`approve!`**. Mid-sprint: **`commit-first`** (working-tree cleanup) and **`defer repairs`** (pre-existing corruption deferral).

**Brief file:** `.claude/agents/tasks/outputs/gander-p7-obsidian-l2-l3-PM-1778039235.md` (PM round 1) + `.claude/agents/tasks/outputs/gander-p7-obsidian-l2-l3-PM-revision-1778041000.md` (post CRITIQUE_BLOCK revision).

**Skill invoked:** `/dispatch` Skill tool → dispatch-task procedure (procedure-by-reference; ORC drove inline through the constituent skills).

---

## 2. Agent Activity Log

### Phase 1 — Pre-sprint working-tree cleanup

Session opened with extensive uncommitted state from prior gander-p6 (moirai/skein) sprint and 2026-05-03 agent-improvement/hone work. Per dispatch-task Step 0.4, ORC halted and surfaced; human authorized `commit-first`. Single ceremony commit (`39e9279`) closed out 54 files of gander-p6 ceremony trail. `.gitignore` added for runtime flock artifacts.

### Phase 2 — Preflights

| Step | Output | Notes |
|---|---|---|
| 0.5 convention-detect | `docs/project-conventions.md` | gander has no build system; control-plane only |
| 0.6 PM context preflight | HR + PM remits extracted via awk into orchestrator_brief | PM's `What the PM Does Not Do` heading didn't match the canonical awk regex; extracted manually with alternate heading |
| 0.7 pm-preflight | `gander-p7-obsidian-l2-l3-PMPREFLIGHT-1777824800.md` | Zero canonical token matches across 3 most recent post-mortems; mapped descriptive prose to ASSUMPTION/VERBATIM_DELIVERABLE/OVERSCOPED/SCOPE_DRIFT/DRY/AUDIT_RISK patterns |

### Phase 3 — PM + Critic loop

| Seq | Agent | Verdict | Notes |
|---|---|---|---|
| 1 | PM#1 | Decomposition | 7 task packets, self-flagged 2.1c→2.1d step number correction |
| 4 | CR#1 | **CRITIQUE_BLOCK** | 6 blockers + 4 warnings |
| 5 | PM#2 | Revision | After human ratification of B1 (L1 amendment) and W4 (agent-logs inclusion) |
| 7 | CR#2 | **CRITIQUE_PASS-with-advisories** | All 6 blockers + 4 warnings resolved; 2 advisory observations non-blocking |

CR#1's 6 BLOCKERs were instructive:
- **B1** — T1 used `tags` + `aliases` as shared optional fields, but L1's "Reserved Keys" list explicitly forbade them. Human-ratified scope expansion: amend L1 v1.0.0 → v1.1.0 to remove `tags`/`aliases` from reserved-keys (the original "reserved by Obsidian core" rationale was over-conservative; these are the canonical Obsidian user-tagging fields, not collision risks).
- **B2** — Symmetric-rule SC failure (recurrence of p5 §6 G3): T2/T3/T4 enumerated field-specific regex `tags: []`. Resolution: delegate to existing `optional-field-empty-detect` skill at audit-pipeline Step 2.1b (generic across all fields).
- **B3** — T3 self-contradictory on `.claude/refs/post-mortem-frontmatter-schema.md`. Resolution: clean boundary — T1 owns body amendments, T3 owns frontmatter addition.
- **B4** — Git pathspec false-PASS (`docs/**/*.md` is literal under default git config). Resolution: directory pathspecs + minimum-files-matched sanity floor.
- **B5** — T6 SC4 weak grep match (`grep -q '2\.1d'`). Resolution: anchored heading regex.
- **B6** — T6 missing `audit-pipeline` v1.6.0 → v1.7.0 bump. Resolution: explicit version bump + changelog entry.

### Phase 4 — Wave 1 (T1)

| Seq | Agent | Outcome |
|---|---|---|
| 8 | HR#1 | Wrote vault-frontmatter-schema.md v1.0.0 (231 lines) + amended L1 v1.1.0 |
| 11 | AUD#1 | PASS — all SA/QA/SX gates green, zero findings |

### Phase 5 — Wave 2 (T2–T7 parallel, 6 implementers)

| Task | Agent | Outcome |
|---|---|---|
| T2 agents sweep | HR#2 | PARTIAL: 12 of 13 files; database.md ESCALATED for pre-existing `\---` delimiter corruption (gander-p1 regression) |
| T3 skills/rules/refs | HR#3 | SUCCESS+caveat: 39 files; agent-improvement/SKILL.md flagged for similar pre-existing corruption; rules sanity floor 1<3 (PM SC overestimate — only 1 rule file exists) |
| T4 docs sweep | HR#4 | SUCCESS: ~115 files |
| T5 CLAUDE.md bridge | HR#5 | SUCCESS: 26 lines added at line 45 between Human-owned and Observability sections |
| T6 frontmatter-type-required | HR#6 | SUCCESS: 3 deliverables (new skill + audit-pipeline 1.7.0 + changelog entry) |
| T7 L4 sprint brief | PM#3 | SUCCESS: 431-line brief with 4 inline draft task_packets |

Mid-Wave 2, ORC paused and surfaced the database.md + agent-improvement/SKILL.md corruption findings to the human. Human ratified `defer repairs` — both files queued for follow-on `gander-meta-database-repair` sprint.

### Phase 6 — Wave 2 audits (6 parallel)

| Task | Audit | Notes |
|---|---|---|
| T2 | PASS-with-note | 12-of-13 sanity floor acknowledged as ratified-deferral |
| T3 | PASS | INFO findings: 5 skills with HTML-comment versions (pre-existing); agent-improvement corruption (acknowledged) |
| T4 | PASS | 133 files including W4 agent-logs inclusion |
| T5 | PASS | All 4 required anchors present |
| T6 | PASS | SC4b backtick-mismatch acknowledged (semantic match — same convention as Steps 2.1, 2.1b, 2.1c) |
| T7 | **AUDIT_FAIL** | Line 2 `type: sprint-log` against vault-frontmatter-schema's `docs/sprints/*.md → project-doc` mapping |

### Phase 7 — Gap fix + re-audit

T7 FAIL was a single-character fix. Per dispatch-task Step 2.5 light path (single mechanically-defined SC, 1-line substitution, no semantic change), ORC applied the fix directly and logged GAP_REQUEST event (seq 36). Re-audit T7 (seq 38) PASS.

### Phase 8 — Closeout

| Step | Outcome |
|---|---|
| REQVAL | 14 COVERED + 2 COVERED-WITH-RATIFIED-DEFERRAL → overall_status COVERED |
| commit-packet × 7 | 7 durability commits (ba20ab8, d71e163, 9d3e39f, 4e50dd6, c3e1bb2, f179bae, 704ae18) + 1 ceremony commit (44dee43) |
| Archivist | Sprint + 7 task archive_entry blocks appended to project_log.md, commit ffd7dc3 |
| Post-mortem | This file |

---

## 3. Runtime Bugs

None discovered. The sprint touched documentation and configuration files only; no runtime behavior to break.

---

## 4. QA Gap Analysis

The audit pipeline did its job. T7's audit FAIL was caught immediately on the first audit, remediated via the dispatch-task Step 2.5 light path (the lightest correction protocol in the playbook), and re-audited cleanly. The 1-of-7 audit-fail rate is on the low side of typical for sweep sprints of this size.

The `optional-field-empty-detect` Tier-1 sub-check (added by p5 §6 G3) returned zero findings on ~150 swept files — meaningful signal that the symmetric-rule asymmetry pattern from p5 has been structurally closed. The new `frontmatter-type-required` sub-check from this sprint will close the *next* recurrence class (missing type field).

---

## 5. Agent Performance Summary

| Agent | Spawns | Failures | Notes |
|---|---|---|---|
| ORC#0 | 1 | 0 | Drove dispatch-task inline; one ORC-direct gap_request (light-path) |
| PM | 3 | 0 | PM#1 round 1, PM#2 revision, PM#3 T7 brief |
| CR | 2 | 1 BLOCK + 1 PASS-with-WARN | Did exactly the job — caught 6 substantive blockers in round 1 |
| HR | 6 | 0 (2 ratified-deferral escalations) | HR#2 + HR#3 correctly escalated pre-existing corruption rather than expanding scope |
| AUD | 8 (incl. T7 re-audit) | 1 SA-FAIL on T7 (orchestrator's prompt drift) | All other 7 first-pass PASS |
| AR | 1 | 0 | Sprint + 7 task archive entries appended cleanly |

---

## 6. Protocol Gaps Identified

> **Code-not-prompt check applied:** Three gaps below could be addressed mechanically; one is structural; two are pattern observations.

| # | Gap | Impact | Suggested fix |
|---|---|---|---|
| 1 | **Orchestrator's audit-brief contradicted vault-frontmatter-schema for T7.** I wrote `type: sprint-log` in the audit gate spec but the vault schema (the same document I cited as authoritative) maps `docs/sprints/*.md → project-doc`. Same prompt-vs-contract drift pattern as p5 §6 Gap 4 + p6 §6 GB. The auditor caught it cleanly; resolution was a 1-line gap_request. | One audit-fail cycle (~3 min). The recurrence is the signal — the rule is hard to apply when ORC writes briefs under time pressure. | **Code-not-prompt: yes.** Add a Tier-1 SA-gate sub-check (or extend `frontmatter-type-required` itself) that validates `type:` against the vault-schema's per-path mapping. The check is mechanizable: read schema's path mappings, grep new file's path, compare to its emitted type field. Route to HR. |
| 2 | **PM remit extraction missed PM's actual headings.** Step 0.6's awk pattern matches "What .+ Can Modify\|What .+ Does Not Modify\|Constraints\|Boundaries\|Write Authority\|Remit\|Scope". PM's spec uses "Core Responsibilities", "Tool-Call Budget Discipline", "What the PM Does Not Do" — none match. ORC fell back to manual extraction. | Cosmetic: extraction succeeded via fallback. Risk: a future agent's spec might have its constraint section invisible to the awk regex, and ORC might not notice. | **Code-not-prompt: yes.** Either (a) extend the awk pattern to include "Does Not Do", "Core Responsibilities", and other stable section names that the team has standardized on, or (b) require all agent specs to use one of the canonical heading names from Step 0.6. Option (b) is structural; route to HR for a sweep. |
| 3 | **Two pre-existing files with `\---` delimiter corruption.** `.claude/agents/database.md` and `.claude/skills/agent-improvement/SKILL.md` both have escaped frontmatter delimiters from gander-p1-jidoka-skill regression 2026-04-22. Both surfaced during p7 sweeps; both human-ratified deferred. The fact that this regression has been quietly sitting in the team for ~2 weeks across multiple subsequent sprints suggests it's hard to detect. | Database agent has been operating without its declared Jidoka section for 2 weeks. Repair scope per HR's escalation: restore newlines, unescape, restore delimiters, reapply Jidoka content per changelog. | **Code-not-prompt: partial.** Add a hook or sub-check that grep-rejects `^\\---` (literal escaped delimiter) at SA gate time on agent/skill specs. The gander-p1 regression slipped past every audit since 2026-04-22 because no audit looked for this specific anti-pattern. Route to HR. **§8d new sub-check candidate.** |
| 4 | **Cross-task file bundling required commit-attribution judgment.** `.claude/refs/post-mortem-frontmatter-schema.md` was modified by both T1 (body amendments) and T3 (frontmatter addition). `.claude/skills/audit-pipeline/SKILL.md` was modified by both T3 and T6. Per-file commit-packet scoping forced bundle-with-dominant-task decisions. | Cosmetic — commit messages document the bundling — but the per-task SC verification became less crisp because the diff includes another task's changes too. | **Document and accept.** Add a "Cross-task file bundling" subsection to commit-packet/SKILL.md noting that when two tasks modify the same file, the PM should split scope at the section level rather than the file level when feasible. When file-level overlap is unavoidable (e.g., the file IS the cross-task hand-off contract), document the bundling explicitly in both task packets. Route to HR. |
| 5 | **Linter activity during sprint added frontmatter to files mid-implementation.** Standards.md, project-conventions.md, task-registry.md, and post-T5 CLAUDE.md were auto-frontmatter'd by a linter while implementers ran. System-confirmed as intentional, but the in-flight modifications could have caused implementer/audit confusion if they had landed at unfortunate moments. | None this sprint (linter changes were compatible). Risk: a future linter rule could land mid-implementation and cause an audit FAIL on a phantom diff. | **Investigate.** Identify which linter is running (likely a hook or watcher process), document its scope, and decide whether to gate it behind sprint-active state. Route to HR for diagnosis, then to system-health-monitor for any hook changes. |
| 6 | **PM round 1 + CR round 1 found 6 blockers — but the resolutions were all formula-grade.** Five of six blockers were mechanical (regex tightening, version bump, pathspec correction, scope-clarification one-liners). The sixth (B1) was the substantive one — the tags/aliases reserved-keys conflict. This is exactly the spread the Critic gate is designed to catch: separate formula-fixable nits from substantive scope questions. The system worked. | Net pipeline impact: 1 PM revision round (~9 min) and 1 Critic re-review (~7 min). | **No fix needed; document as the system working as intended.** The Critic gate's value is precisely this kind of catch — the alternative (skipping CR and learning about the tags conflict at audit time, with 6 partial deliverables already shipped) is much worse. |

---

## 7. Deliverable State

**HEAD commit:** `ffd7dc3` (chore(archive): log gander-p7-obsidian-l2-l3 SPRINT_COMPLETE)
**Working tree:** Clean.

**Files created (new):**
- `.claude/refs/vault-frontmatter-schema.md` v1.0.0 (231 lines)
- `.claude/skills/frontmatter-type-required/SKILL.md` v1.0.0 (208 lines)
- `docs/sprints/gander-p8-obsidian-l4-active-integration.md` (431 lines, future-sprint brief)
- `docs/project-conventions.md` (project conventions snapshot)

**Files amended (substantive changes):**
- `.claude/refs/post-mortem-frontmatter-schema.md` v1.0.0 → v1.1.0 (removed tags+aliases from reserved-keys; added subsumption pointer + changelog)
- `.claude/skills/audit-pipeline/SKILL.md` v1.6.0 → v1.7.0 (added Step 2.1d wire-in for frontmatter-type-required)
- `~/projects/gander/CLAUDE.md` (added Personal vault section, 26 lines)
- `docs/agent-changelog.md` (gander-p7 entry)

**Files swept (insert-only frontmatter additions):**
- 12 of 13 `.claude/agents/*.md` (T2)
- 36 `.claude/skills/*/SKILL.md` + `.claude/rules/*.md` + `.claude/refs/*.md` (T3)
- ~115 `docs/**/*.md` excluding notes/archive/post-mortems (T4)

**Key contracts (for the next engineer):**
- **Vault frontmatter schema v1.0.0** at `.claude/refs/vault-frontmatter-schema.md`. The 13-value `type:` enum and per-type required fields are the SSoT for all future markdown additions.
- **frontmatter-type-required Tier-1 SA gate** at audit-pipeline Step 2.1d. Any new `.md` outside docs/notes/+docs/archive/ without a `type:` field will block at audit.
- **Personal vault bridge protocol** in CLAUDE.md. Mac iCloud Drive vault is the human's capture endpoint; agents access only via manual handoff to docs/notes/.
- **L4 sprint brief** at `docs/sprints/gander-p8-obsidian-l4-active-integration.md` — ready for /dispatch when the human triggers L4.
- **Two ratified deferrals**: database.md + agent-improvement/SKILL.md repair, queued as `gander-meta-database-repair` (or similar). Both files have pre-existing `\---` delimiter corruption from gander-p1 regression 2026-04-22.

---

## 8. Skill-Use Analysis

| Skill | Invocations | Outcome | Notes |
|---|---|---|---|
| convention-detect | 1 | VALUABLE | Produced grounding for all downstream agents. Worth keeping at Step 0.5 |
| pm-preflight | 1 | VALUABLE | Forced ASSUMPTION/VERBATIM_DELIVERABLE/SCOPE_DRIFT acknowledgements in PM revision; PM cited them in routing_notes |
| log-event | ~9 inline appends | VALUABLE | Sequence numbers and timestamps clean; SubagentStop hook auto-logged COMPLETEs reliably for all subagents this sprint |
| dispatch-task | 1 (via /dispatch) | DRIVEN_INLINE | Procedure-by-reference; ORC drove constituent skills inline per the skill's own design |
| assign-agents | 0 | NOT_TRIGGERED | ORC wrote the expectation_manifest into docs/task-registry.md inline. p5 §6 G5 + p4 §6 G3 recurrence — the formal skill was not invoked. **§8c content-quality candidate (recurrence count: 3+ sprints).** |
| audit-pipeline | 0 (formal) | DRIVEN_INLINE | ORC dispatched 8 individual auditor spawns directly. Same pattern as assign-agents. **§8c content-quality candidate.** |
| commit-packet | 0 (formal) | DRIVEN_INLINE | ORC composed 7 task durability commits + 1 ceremony commit inline. Same pattern. **§8c content-quality candidate.** |
| requirements-validate | 1 (artifact-only) | DRIVEN_INLINE-with-artifact | The skill's hard gate (artifact at canonical path with parseable overall_status) was satisfied via inline synthesis + Write. The artifact landed; the formal Skill-tool invocation was bypassed. Same pattern. **§8c content-quality candidate.** |
| optional-field-empty-detect | 1 (audit-time, automatic) | VALUABLE | Zero findings across ~150 swept files — confirmed the p5 §6 G3 mitigation works at scale |
| frontmatter-type-required | 0 (created this sprint, not yet exercised) | NEW | Will fire automatically on the next markdown diff. p7 was its own audit's clean run-through |

### §8a Outcomes
All skills above either fired and added value (convention-detect, pm-preflight, log-event, optional-field-empty-detect) or were deliberately driven inline per their procedure-by-reference design (dispatch-task) — except for assign-agents, audit-pipeline, commit-packet, and requirements-validate, which together form the §8c content-quality cluster.

### §8b Obsolescence
None this sprint.

### §8c Content-quality candidates
**Critical recurrence:** the cluster of {assign-agents, audit-pipeline, commit-packet, requirements-validate} being driven inline rather than via formal Skill-tool invocation. This is the THIRD consecutive sprint-pair (p4, p5, p6, p7) where this cluster shows the same drift signal. Per p5 §6 G5: "Either (a) consolidate orchestrator.md and the wrapping skills so there is ONE canonical source, or (b) make the wrapping skills strictly procedural." The structural design discussion has now been deferred across three sprints. **Recommendation:** at next agent-improvement run, treat this as the priority-1 finding and force a decision.

### §8d New skill candidates
- **path-vs-type validator** (gap 1) — validates `type:` field against vault-frontmatter-schema's per-path mapping. Could extend frontmatter-type-required.
- **escaped-delimiter-detector** (gap 3) — grep for `^\\---` in agent/skill specs; routes any match as BLOCKER. Would have caught database.md's corruption 2 weeks ago.

### §8e Drift candidates
- **PM remit awk regex** (gap 2) — current pattern misses PM's actual heading names. Either widen or normalize.
- **Linter scoping** (gap 5) — needs investigation to identify which linter and whether it should pause during sprint-active state.

---

## 9. Next Review Trigger

- **Watch in next sprint:** whether the dispatch-task constituent-skill cluster (assign-agents/audit-pipeline/commit-packet/requirements-validate) is invoked formally or driven inline again. If inline-pattern recurs, escalate the structural design discussion to human as the priority-1 finding.
- **Watch in next sprint:** whether `frontmatter-type-required` Tier-1 gate fires correctly on the first markdown diff (validate the gate is wired in, not just specced).
- **Follow-on sprint queued:** `gander-meta-database-repair` for database.md + agent-improvement/SKILL.md `\---` delimiter corruption recovery.
- **Future sprint queued:** `gander-p8-obsidian-l4-active-integration` per the brief at `docs/sprints/gander-p8-obsidian-l4-active-integration.md`. Trigger condition: human says "dispatch p8" after Mac Obsidian setup and a baked-in period on L2/L3.

---

**Sign-off:** All 7 task packets DONE, REQVAL COVERED, 9 commits landed, working tree clean. HEAD = `ffd7dc3`. Human can review the diff and push to main when ready (per standards.md, push is human-only).
