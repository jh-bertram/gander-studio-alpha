---
type: post-mortem
sprint: gander-p5-obsidian-l0-l1
date: 2026-04-29
head_sha: 61a4ac6
gap_classes:
  - double-logged-complete
  - missing-hr-complete
  - scan-completeness-symmetry
  - prompt-schema-drift
  - skill-transcribed-not-invoked
  - two-commit-emergence
  - stale-checkpoint-recurrence
  - pm-defaults-recurrence
related_sprints:
  - "[[gander-p4-dashboard-language]]"
  - "[[gander-p3-team-report-v1.2]]"
  - "[[gander-p2-skills-ra-cleanup]]"
status: written
---

# Post-Mortem: gander-p5-obsidian-l0-l1
**Date:** 2026-04-29
**Project:** `~/projects/gander/`
**Duration:** 2h 47min wall-clock (RA SPAWN 2026-04-28T22:55Z → Archivist COMPLETE 2026-04-29T01:42Z; sprint crossed UTC midnight during T3 audit)
**Final State:** L0+L1 of the Obsidian "second brain" integration shipped; vault is openable at `docs/`, schema contract committed at `.claude/refs/post-mortem-frontmatter-schema.md` v1.0.0, all 10 post-mortems carry conformant YAML frontmatter (insert-only diff, 150 added / 0 removed). REQVAL: 5/6 COVERED, 1 PARTIAL (Dataview path verification deferred to first vault open per W3 amendment, accepted non-blocking).

---

## 1. Original Request

**Human (2026-04-28):** "let's look at integrating-obsidian-claude-code.md and strategize a way to integrate obsidian.md as a 'second brain' or memory mangement system" → after strategy alignment, "I like this plan so far. Let's do l0 and l1 and keep in mind l2, and long term l3 and l4."

**Brief file:** `.claude/agents/tasks/outputs/gander-p5-obsidian-l0-l1-PM-1777417380.md` (PM round 1) + `.claude/agents/tasks/outputs/gander-p5-obsidian-l0-l1-PM-amendment-1777418195.md` (warning resolution)

**Scope at intake:**
- `docs/` already a richly-structured "second brain" of the agent team (post-mortems, project_log, agent-changelog, sprint artifacts) that agents write into mechanically.
- The strategy doc (`docs/integrating-obsidian-claude-code.md`) the human supplied was untracked and contained multiple claims later contradicted by the RA scry brief.
- Bottleneck: navigation and synthesis (graph view, backlinks, Dataview queries), NOT capture.
- Forward-compatibility was a hard constraint: the schema defined here would be adopted by a future L2 sprint where the post-mortem skill emits frontmatter natively.

**Skill invoked:** orchestrator.md inline (not `/dispatch-task` formally — see §6 Gap 5).

---

## 2. Agent Activity Log

### Phase 1 — Prior-sprint closeout (mandatory cleanup before kickoff)

Session opened with an interrupted `gander-meta-p1-hone-skill-rollout-HR-002-AUDIT` from earlier the same UTC day — AUD#2 substantively completed all 7 SA/QA/SX gates per its agent log Stage 3 plan, but the session ended before it wrote its deliverable file. The `agent-stop-checkpoint` hook caught it; the SESSION-CHECKPOINT.md (dated 2026-04-27) had falsely declared "No open tasks." Same staleness pattern as p3-team-report-v1.2 §6 G2.

| Action | Result | Commit |
|---|---|---|
| Resume AUD#2 to write deliverable + Stage 3 reconciliation | PASS | `5d60f1a` |
| Spawn AR#1 for prior sprint | project_log + AR packet written | `9065d33` |

**Feedback loops:** 0 (resume + archive both first-attempt).

### Phase 2 — Scry preflight

| Seq | Timestamp | Event | Agent | Notes |
|---|---|---|---|---|
| 21 | 22:55:00Z | SPAWN | RA#1 | scry preflight; 6 research questions (vault config, frontmatter schema, kepano skills, MCP, MOC, obsidian eval) |
| 22 | 22:58:02Z | COMPLETE (hook) | RA#1 | evidence_brief written |
| 22 | 23:02:00Z | COMPLETE (manual) | RA#1 | **DUPLICATE** — ORC double-logged; same seq, different ts. See §6 Gap 1. |

**Outcome:** RA brief verified 6 questions, surfaced 4 contradictions in the article (kepano not Anthropic-official, wrong MCP package name, `obsidian eval` is GA not aspirational, `app.json` should NOT be gitignored), and locked in binding facts that the PM and HR consumed verbatim.

### Phase 3 — Plan + Critic + Amendment

| Seq | Timestamp | Event | Agent | Notes |
|---|---|---|---|---|
| 23 | 23:03:00Z | SPAWN | PM#1 | round 1 decomposition |
| 24 | 23:20:00Z | COMPLETE | PM#1 | 3 task packets (T1, T2, T3) all assigned to HR |
| 25 | 23:10:45Z | SPAWN | CR#1 | plan critique gate |
| 26 | 23:35:00Z | CRITIQUE_PASS | CR#1 | PASS w/ 5 WARNINGs (head_sha sections, gap_classes enum fabrication, Dataview path unverified, wikilink regex too strict, status enum heuristic) |
| 27 | 23:16:35Z | SPAWN | PM#2 | warning resolution amendment (compact `<plan_amendment>`, no re-decomposition) |
| —  | (no log)  | (no COMPLETE event) | PM#2 | Hook didn't auto-log; amendment file written successfully nonetheless |

**Feedback loops:** 1 (Critic warnings → PM amendment, focused SC tightening).

**Root cause of warnings:** PM emitted plausible-but-wrong defaults — `head_sha` cited wrong sections (PM said §7, but for several files SHA is in §1 closing-state prose), `gap_classes` had a fabricated "canonical enum" list, `status: acted-on` heuristic was unsubstantiated. Same pattern as p4 §6 Gap 2 ("PM defaults from imagination, not source content"). **Recurrence-class.** See §6 Gap 8.

### Phase 4 — T1 (Vault Config, L0a)

| Seq | Timestamp | Event | Agent | Notes |
|---|---|---|---|---|
| 28 | 23:20:11Z | SPAWN | HR#1 | 7 deliverables (6 .obsidian/ JSON + .gitignore) |
| —  | (no log)  | (no COMPLETE) | HR#1 | **HOOK MISSED** for HR agent type — see §6 Gap 2 |
| 30 | 23:26:38Z | SPAWN | AUD#1 | T1 audit |
| 31 | 23:29:45Z | AUDIT_PASS | AUD#1 | PASS/PASS/SECURE; SC1–SC9 mechanically verified |

Durability: orchestration commit `7abd617` (T0 ceremony) → durability commit `7a29f53` (T1 deliverables). The two-commit pattern emerged here because commit-packet Step 4 halted on M-status orchestration files (event log, agent logs, task-registry) outside the T1 packet's scope. See §6 Gap 6.

**Feedback loops:** 0. PASS first attempt.

### Phase 5 — T2 (Schema Doc + README Homepage, L0b + L1a)

| Seq | Timestamp | Event | Agent | Notes |
|---|---|---|---|---|
| 32 | 23:32:08Z | SPAWN | HR#2 | schema contract + README MOC |
| —  | (no log)  | (no COMPLETE) | HR#2 | HOOK MISSED for HR (recurrence) |
| 34 | 23:38:08Z | SPAWN | AUD#2 | T2 audit |
| 35 | 23:41:54Z | AUDIT_PASS | AUD#2 | All W2/W3/W5 amendments verified compliant |

Durability: orchestration commit `50614a9` → durability commit `7b1146d`.

**Feedback loops:** 0. PASS first attempt.

### Phase 6 — T3 (Frontmatter Sweep, L1b) — the only failure phase

| Seq | Timestamp | Event | Agent | Notes |
|---|---|---|---|---|
| 36 | 23:42:50Z | SPAWN | HR#3 | 10 post-mortems frontmatter sweep |
| —  | (no log)  | (no COMPLETE) | HR#3 | HOOK MISSED for HR (third recurrence in sprint) |
| 38 | 23:49:23Z | SPAWN | AUD#3 | T3 audit |
| 1  | 2026-04-29T01:35:06Z | **AUDIT_FAIL** | AUDITOR#3 | 4 files emit `related_sprints: []` instead of omitting per schema |
| 2  | 01:36:00Z | SPAWN | HR#4 | remediation request — delete 4 empty-list lines |
| 3  | 01:37:05Z | COMPLETE (hook) | HR#4 | hook fired this time — successful auto-log |
| 4  | 01:39:30Z | SPAWN | AUD#4 | re-audit (focused on remediation delta) |
| 5  | 01:40:30Z | AUDIT_PASS | AUD#4 | all 5 verification checks PASS |

**Feedback loops:** 1 (T3 ralph-loop: FAIL → 1-line fix per file × 4 → PASS). Approximate cycle time: ~3 minutes from FAIL to re-PASS.

**Root cause of T3 FAIL:** HR#3 correctly applied the schema's "omit-when-empty optional list" rule for `head_sha` (3 files where SHA was unknown) but missed it for `related_sprints` (4 files with no in-folder cross-references). Symmetric rule, asymmetric application. Scan-completeness pattern — agent fixed the salient case but missed the parallel case. See §6 Gap 3.

**Deviation from PM brief:** None of substance. T3 dispatch prompt contained an instruction that contradicted the schema contract (the prompt told HR to "set head_sha: null + add head_sha-unknown to gap_classes" while the schema said "OMIT the field"). HR resolved correctly by deferring to the schema (declared as the single source of truth in the same prompt) and surfaced the contradiction. This is ORC-side prompt drift — see §6 Gap 4.

### Phase 7 — Closeout (REQVAL + Archivist)

| Seq | Timestamp | Event | Agent | Notes |
|---|---|---|---|---|
| 6  | 01:40:12Z | REQVAL_START | ORC#0-direct | 6 requirements derived from sprint seed |
| 7  | 01:42:00Z | REQVAL_PASS | ORC#0-direct | 5/6 COVERED, 1 PARTIAL (R5 Dataview path, deferred per W3) |
| 8  | 01:42:30Z | SPAWN | AR#1 | archivist |
| 9  | 01:42:30Z | COMPLETE | AR#1 | project_log + agent-changelog + SESSION-CHECKPOINT all updated |

Final commit: `61a4ac6` (archive closeout).

---

## 3. Post-Delivery: Runtime Bugs (if any)

**None observed.** The only deferred item is R5 Dataview path resolution (`FROM "post-mortems"` vs `FROM "docs/post-mortems"`), which is a documented expected-verification step on first vault open, NOT a bug. The README.md contains an HTML comment block instructing the human on the swap. W3 amendment explicitly accepted this as deferred verification.

If the path resolves wrong on first open, the fix is a one-line edit to README.md — no agent involvement needed.

---

## 4. QA Gap Analysis

**Current QA protocol:** AUD subagent runs SA (standards/schema conformance) + QA (functional/contract) + SX (security/secrets) gates per task. For T3 specifically, AUD verified YAML validity, schema field presence, sprint-slug equality with filename, head_sha verbatim presence in body, wikilink quoting regex, related_sprints target existence, and body byte-for-byte equality vs HEAD.

**What this caught:**
- T3 first audit: 4 files emitting `related_sprints: []` instead of omitting (audit checked the schema rule directly; nothing slipped past).
- All other gates: correct first-attempt PASS on T1 and T2.
- Insert-only diff verified mechanically across all 10 post-mortems (`git diff --numstat` showed 0 removed lines — strong invariant).

**What this missed:**
- *(nothing post-delivery)* — the QA gates worked. The pipeline integrity is intact.

**Recommendations:**
- For T3-class sweep tasks where multiple optional list fields share an "omit-when-empty" rule, the auditor's pre-flight should run a generic regex covering ALL `*: \[\]` and `*: null` patterns on optional fields, not field-by-field. (See §6 Gap 3.) This is a Tier-1 sub-check candidate.

---

## 5. Agent Performance Summary

| Agent | Tasks | First-pass rate | Notes |
|---|---|---|---|
| RA#1 | 1 | 100% (1/1) | Evidence brief was the most-leveraged single artifact in the sprint |
| PM#1 | 1 | 0% strict (5 warnings → amendment); 100% if "warning resolution counts as 1 round" | Plausible-but-wrong defaults — same as p4 §6 G2 |
| PM#2 | 1 | 100% (1/1) | Compact amendment, no re-decomposition |
| CR#1 | 1 | 100% (1/1) | Caught all 5 warnings; sound prioritization (BLOCKER vs WARNING) |
| HR#1 (T1) | 1 | 100% (1/1) | All 7 JSON files validated, gitignore scoped correctly |
| HR#2 (T2) | 1 | 100% (1/1) | W2/W3/W5 amendments correctly applied |
| HR#3 (T3) | 1 | 0% (FAIL on related_sprints rule) | Symmetric rule missed; remediation in 1 turn |
| HR#4 (T3 remediation) | 1 | 100% (1/1) | 4 line deletions, 30-second fix |
| AUD#1–#4 | 4 | 100% PASS verdicts (3 PASS, 1 FAIL — auditor doing its job) | Independence preserved across all 4 spawns |
| AR#1 | 1 | 100% (1/1) | project_log + agent-changelog + checkpoint all consistent |

**Most impactful single agent action:** RA#1's evidence brief contradicting four article claims and locking in six binding facts (whitelist gitignore recipe, bare YAML date format, manual wikilink quoting per Jan 2025 bug, reserved-key list, `obsidian eval` GA confirmation, kepano-not-Anthropic). The PM and HR consumed these verbatim; without scry the schema would have been wrong on at least 2 of the 6.

**Recurring failure pattern:** "Symmetric rule, asymmetric application" — HR applied the schema's omit-when-empty rule consistently for `head_sha` but inconsistently for `related_sprints`. Same scan-completeness shape as broadn-p3 inline-rgba/CONTROL_BG cases. See §6 Gap 3.

---

## 6. Protocol Gaps Identified

> **Code-not-prompt check applied:** Reviewed every ritual in this sprint. Three are mechanizable as hooks/scripts/settings entries — see Gaps 1, 2, and 3. Two (Gap 4 and Gap 7) are agent/orchestrator judgment that hardening prose can address. One (Gap 5) is a structural skill-design question. Gap 6 may be inherent to the commit-packet contract.

| # | Gap | Impact | Suggested fix |
|---|---|---|---|
| 1 | **ORC double-logged RA#1 COMPLETE event (seq 22 collision).** Hook auto-logged at 22:58:02Z; ORC manually appended a duplicate at 23:02:00Z with the same seq number. Same family as `gander-p2-skills-ra-cleanup` and `gander-p3-team-report-v1.2` seq-collision patterns. User-level CLAUDE.md explicitly warns "don't double-log" but the rule is still being violated under load. | Cosmetic in this case (no downstream consumer breaks on duplicate seq), but the recurrence is the signal — the rule is hard to remember mid-sprint. | **Code-not-prompt: yes.** Make `log-event` skill (or a new hook helper) refuse to write a COMPLETE event for a `(task_id, agent_id, ev=COMPLETE)` tuple that already exists in the log. The check is one grep; the false-negative is zero. Route to HR. **§8c content-quality candidate.** |
| 2 | **SubagentStop hook did NOT auto-log COMPLETE for system-health-monitor (HR) agent type.** Three recurrences in this sprint (seq 29 missing for HR#1, seq 33 missing for HR#2, seq 37 missing for HR#3). The hook fired correctly for RA, AR, AUD, and the second HR (HR#4) — but missed the first three HR spawns. PM#2 also has no COMPLETE in the log. | Reconstruction works via task_id+agent_id+output_files match, but wall-clock duration calculations for HR tasks are unreliable, and "is this agent done?" cannot be answered from the event log alone. | **Code-not-prompt: yes.** Inspect `~/.claude/hooks/subagent-autocomplete.sh` for agent-type matching logic. Verify `system-health-monitor` is recognized; if matching is by tool list or some heuristic, the HR agent's tool list (Read/Write/Edit/Glob/Grep — no Bash) may be the discriminator. Route to HR for hook diagnosis. **§8e drift candidate.** |
| 3 | **HR scan-completeness asymmetry on schema's omit-when-empty rule.** HR correctly applied "omit when empty" for `head_sha` (3 files) but emitted `related_sprints: []` in 4 files. The schema rule was symmetric across all optional list-typed fields; HR fixed the more salient case (head_sha) and missed the parallel case (related_sprints). | Single-class audit FAIL caught it; remediation was 30 seconds. But the next sprint that exercises a different optional field (e.g., `gap_classes: []`) may slip through if no audit explicitly checks that field. | **Code-not-prompt: yes.** Add a Tier-1 SA-gate sub-check: `grep -nE "^[a-z_]+:[[:space:]]*(\[\]|null)\s*$" <files>` — must return zero matches across any post-mortem with frontmatter. Generic across all current and future optional fields. Route to HR for `silent-substitution-detect`-style new sub-check, or extend the audit-pipeline skill. **§8d new skill candidate.** |
| 4 | **Orchestrator's T3 dispatch prompt contradicted the schema contract.** I told HR to "set head_sha: null + add head_sha-unknown to gap_classes" in the dispatch prompt body while the schema (declared as single source of truth in the same prompt) said to OMIT the field. HR resolved correctly by deferring to the schema and surfaced the contradiction in its packet. | HR judgment recovered, but the prompt-vs-contract drift is a real protocol risk: future agents may not catch it, or may resolve the wrong way. | **Code-not-prompt: partial.** Prose hardening: when the orchestrator briefs an implementing agent on a task that has an authoritative reference document (a schema, an API spec, a contract), the prompt should NOT restate the rule — only point to the doc and require the agent to follow it verbatim. Add this rule to `orchestrator.md` Step 2 ("Assign and Execute"). Route to HR for prompt-pattern doc edit. |
| 5 | **dispatch-task, audit-pipeline, assign-agents, log-event NOT formally invoked — orchestrator.md procedure transcribed inline.** Same pattern as p4 §6 Gap 3 (commit-packet) and §8c (log-event over-specified). I followed orchestrator.md inline because (a) the protocol is itself canonical and (b) the wrapping skills duplicate parts of orchestrator.md. The SA/QA/SX independence was preserved — every audit was a real distinct subagent — but the formal artifact gates (assign-agents `<expectation_manifest>`, audit-pipeline procedure invocation, log-event seq-continuation) were not produced. | Two failure modes: (a) the formal artifacts (manifest, audit invocation traces) are absent from the sprint record, making post-mortem reconstruction harder; (b) the more skills get "just transcribed," the less their content is treated as canonical. Compounding drift. | **Structural skill-design question.** Either (a) consolidate orchestrator.md and the wrapping skills so there is ONE canonical source, or (b) make the wrapping skills strictly procedural (one-step actions ORC must invoke, not knowledge documents to read). Surface to HR for design discussion before next sprint. **§8c content-quality candidate.** |
| 6 | **Two-commit-per-task pattern emerged from commit-packet Step 4 pre-stage scope check.** Each task wave required: orchestration commit (event log, agent logs, audit/HR packets, task-registry) → durability commit (just the deliverable). This worked correctly per the skill but doubles the commit count (3 deliverable + 3 orchestration + 1 archive = 7 commits). | Inherent to scope-discipline-as-invariant: sprint-coordination state and sprint deliverables are different concerns, and bundling them risks the broadn-p8 task-registry-overwrite pattern that the Step 4 check was designed to catch. | **Document and accept.** Add a "Two-commit pattern" subsection to `commit-packet/SKILL.md` clarifying that orchestration ceremony commits precede durability commits when M-status files exist outside the packet's scope. This is the protocol working as designed; making it explicit reduces the cognitive load. Route to HR for skill prose addition. |
| 7 | **Stale SESSION-CHECKPOINT didn't catch interrupted prior sprint.** Session opened with checkpoint saying "No open tasks" while event log seq 16 from the same UTC day showed AUD#2 SPAWNed without matching COMPLETE. Same recurrence as p3-team-report-v1.2 §6 G2. The `resume-project` 1.1.0 session-close gate (added per p3 §6 G2) should have caught this — but evidently didn't fire when the prior session ended. | Recovery worked (the `agent-stop-checkpoint` hook stamped INTERRUPTED into the agent log Stage 3, which made resume deterministic). But the SESSION-CHECKPOINT remained false until I refreshed it manually at sprint open. | **Code-not-prompt: yes.** Investigate why the resume-project 1.1.0 session-close gate didn't fire on the prior session end. Likely candidates: (a) the gate is documented but not executable, (b) the gate fires only when `resume-project` is invoked (chicken-and-egg), (c) the SESSION-CHECKPOINT update is unrelated to gate firing. Add a hook on session end that updates SESSION-CHECKPOINT.md from agent-log Stage 3 markers + event log tails. Route to HR. |
| 8 | **PM emitted plausible-but-wrong defaults again — recurrence of p4 §6 Gap 2.** Critic warnings W1 (head_sha sections cited wrong), W2 (gap_classes "canonical enum" fabricated), W5 (status heuristic unsubstantiated) are all instances of the same pattern: PM reasoning from imagination instead of from the source content. The `pm-preflight` skill (introduced earlier today in `gander-meta-p1-hone-skill-rollout` HR-001) was specifically designed to catch this — but it wasn't triggered because I ran orchestrator.md inline (Gap 5). | Critic caught all 5 warnings cleanly, so net pipeline impact is 1 amendment round (~15 min). But the cumulative time tax across sprints is real, and pm-preflight's ROI is exactly the case where it was designed to fire. | **Code-not-prompt: partial.** Apply the pm-preflight pattern (extract "What X Can Modify" / "Constraints" sections from agent specs into the orchestrator_brief verbatim) even when ORC runs orchestrator.md inline. Update orchestrator.md Step 1 to require the extraction explicitly. Route to HR for orchestrator.md edit. |

---

## 7. Final Deliverable State

**App/Service:** `~/projects/gander/docs/` is now an Obsidian vault.
**Build:** N/A (control-plane repo, no build).
**Runtime:** Confirmed working at the file-system level (all JSON validates, all YAML parses). One deferred item: Dataview query path resolution must be confirmed on first vault open in Obsidian (W3 amendment, expected and accepted).

**Features delivered:**
- L0a: 7 vault config files (`docs/.obsidian/{app,appearance,core-plugins,community-plugins,hotkeys}.json`, `docs/.obsidian/plugins/homepage/data.json`, `docs/.gitignore` with whitelist-style ignore).
- L0b: `docs/README.md` (69 lines) — vault homepage / hybrid Map of Content with Dataview TABLE for post-mortems + W3 path-verification HTML comment + manual section links.
- L1a: `.claude/refs/post-mortem-frontmatter-schema.md` v1.0.0 (151 lines) — schema contract for L2 adoption with all 7 fields documented (type, sprint, date, head_sha, gap_classes, related_sprints, status), worked example, reserved-keys section, L2 adoption constraints.
- L1b: 10 post-mortems carry conformant YAML frontmatter (insert-only diff: 150 added / 0 removed; bodies byte-for-byte unchanged).

**Key contracts (for the next engineer):**

- **Frontmatter schema v1.0.0** (`.claude/refs/post-mortem-frontmatter-schema.md`): the canonical reference. Future post-mortem skill (L2 sprint) must emit YAML matching this schema. Optional list-typed fields (`gap_classes`, `related_sprints`, `head_sha`) MUST be omitted when empty/unknown — never `[]`, never `null`.
- **Wikilink format**: quoted manually as `"[[Sprint Name]]"`. Required because of Obsidian's source-mode auto-quoting bug (Jan 2025 — RA finding #5).
- **Date format**: bare `YYYY-MM-DD` string. NO `T` separator with space, NO YAML native timestamp.
- **Whitelist gitignore approach** (RA finding #1, #2): commit `app.json`, `appearance.json`, `community-plugins.json`, `core-plugins.json`, `hotkeys.json`, `plugins/*/data.json`. Ignore `workspace.json`, `workspace-mobile.json`, `cache/`, `updates.json`.
- **Two-commit pattern** for any sprint touching orchestration ceremony (event log, agent logs, task-registry) + deliverables: chore(orchestration) → feat(...) durability. Required per commit-packet skill Step 4.

**Commits (7, all local — per "Claude commits; the human pushes" rule):** `7abd617`, `7a29f53`, `50614a9`, `7b1146d`, `2ad91f9`, `24fa863`, `61a4ac6`.

**Working tree at close:** Clean except for the user's untracked strategy doc `docs/integrating-obsidian-claude-code.md` (intentionally not committed per orchestrator brief — it's source material the user provided, not a sprint deliverable).

---

## 8. Skill-Use Analysis

### 8a. Skill Invocation Log

| Skill | Invocations | Outcome | Owner | Last reviewed | Notes |
|---|---|---|---|---|---|
| `scry` | 1 | VALUABLE | ORC#0 | 2026-04-23 (v1.0.0) | RA brief was the most-leveraged single artifact in the sprint. Surfaced 4 article contradictions and 6 binding facts that PM and HR consumed verbatim. |
| `convention-detect` | 0 | NOT_TRIGGERED | n/a | 2026-04-22 (v1.0.0) | Correctly skipped — Gander has no package.json, no build, conventions noted inline in brief. |
| `pm-preflight` | 0 | NOT_TRIGGERED | ORC#0 | 2026-04-28 (newly introduced today) | Should have triggered — would have likely caught Critic W1/W2/W5 (PM defaults) before Critic gate. **§8e drift candidate.** See §6 Gap 8. |
| `jidoka` | 0 | NOT_TRIGGERED | ORC#0 | 2026-04-23 (v1.2.0) | Correctly skipped — single-owner sequential pipeline (3 tasks, all to HR), small `<context_files>` count. |
| `assign-agents` | 0 | NOT_TRIGGERED | ORC#0 | 2026-04-28 (v1.3.0) | Should have triggered — produces the `<expectation_manifest>` for receipt-checking. ORC dispatched HR directly each time. **§8c content-quality candidate.** See §6 Gap 5. |
| `dispatch-task` | 0 | NOT_TRIGGERED | ORC#0 | 2026-04-28 (v1.7.0) | Should have triggered — drives the full pipeline. ORC ran orchestrator.md inline. **§8c content-quality candidate.** See §6 Gap 5. |
| `audit-pipeline` | 0 | NOT_TRIGGERED | ORC#0 | 2026-04-28 (v1.3.1) | Should have triggered for each of 4 audits. ORC dispatched auditor directly via Agent tool. SA/QA/SX independence preserved (4 distinct AUD subagents); skill's wrapper procedure was not executed. **§8c content-quality candidate.** See §6 Gap 5. |
| `commit-packet` | 1 | VALUABLE | ORC#0 | 2026-04-28 (v1.2.0) | Formally invoked once for T1 deliverable. The Step 4 pre-stage scope check fired correctly and forced the orchestration/durability split — exactly the protection the skill was designed to provide. T2 and T3 durability commits followed the same pattern but without re-invoking the skill (transcribed). |
| `requirements-validate` | 1 | PARTIAL_VALUE | ORC#0 | 2026-04-23 (v1.0.2) | Procedure was followed (6 requirements derived, evidence + status assessed, COVERED_WITH_DEFERRED_VERIFICATION verdict). But ORC wrote the report manually rather than formally invoking the skill. **§8c content-quality candidate.** |
| `log-event` | 0 | NOT_TRIGGERED | ORC#0 | 2026-04-28 (v1.1.0) | ORC composed JSONL appends inline via bash. Same pattern as p4 §8c. No seq-continuation duplication detection (would have caught Gap 1 — RA double-log). |
| `agent-log` | 13 (one per spawn) | VALUABLE | implementing agents | 2026-04-23 (v1.0.0) | Every agent wrote Stage 1/2/3. The `agent-stop-checkpoint` hook caught the prior-sprint AUD#2 interruption via Stage 3 INTERRUPTED marker. |
| `resume-project` | 1 (implicit, via prior-sprint cleanup) | VALUABLE | ORC#0 | 2026-04-28 (v1.1.0) | Detected the SESSION-CHECKPOINT staleness at session open (Phase 1 above). Allowed deterministic prior-sprint closeout. But the session-close gate (1.1.0 feature) failed to fire when the PRIOR session ended — that's why the staleness existed in the first place. See §6 Gap 7. |
| `env-preflight` | 0 | NOT_TRIGGERED | n/a | 2026-04-28 (v1.0.0) | Correctly skipped — no FE wave, no live API. |
| `silent-substitution-detect` | 0 | NOT_TRIGGERED | n/a | 2026-04-28 (v1.0.0) | Correctly skipped — no .ts/.tsx files in scope. |
| `react-flow-render-smoke` | 0 | NOT_TRIGGERED | n/a | 2026-04-28 (v1.0.0) | Correctly skipped — no React Flow code. |
| `ralph-loop` | 0 (formally) | NOT_TRIGGERED | ORC#0 | n/a | T3 audit FAIL → remediation cycle was effectively a 1-turn ralph-loop but ORC didn't formally invoke the skill. Single-class fix; skill overhead may not have been warranted. Borderline. |

### 8b. Obsolescence Candidates

None this sprint. The NOT_TRIGGERED entries above are split: some are correct skips (convention-detect, jidoka, env-preflight, silent-substitution-detect, react-flow-render-smoke, ralph-loop), some are skill-not-invoked-when-it-should-be (pm-preflight, assign-agents, dispatch-task, audit-pipeline, log-event) — those are §8c content-quality issues, not obsolescence.

### 8c. Content-Quality Candidates

| Skill | Deviation observed | Suspected cause | Recommended action |
|---|---|---|---|
| `dispatch-task` | ORC ran orchestrator.md inline rather than invoking the skill | OVER_SPECIFIED — skill content largely duplicates orchestrator.md, creating two canonical sources | CONSOLIDATE — pick one canonical procedure (orchestrator.md is the natural fit) and reduce dispatch-task to a thin invocation wrapper. Or eliminate dispatch-task. See §6 Gap 5. |
| `audit-pipeline` | ORC dispatched auditor directly via Agent tool, did not invoke skill | OVER_SPECIFIED — skill describes the procedure but ORC's per-spawn Agent dispatch already handles it; skill invocation adds ceremony without changing behavior | COMPRESS — make the skill a thin "spawn auditor with this brief template" invocation, not a procedure description. |
| `assign-agents` | ORC dispatched HR directly each time, no formal expectation_manifest produced | OVER_SPECIFIED — same as audit-pipeline, the skill duplicates ORC's natural Agent-tool dispatch | COMPRESS — distinguish what ONLY assign-agents does (expectation_manifest, receipt-check) from what's already in orchestrator.md. Make the skill produce the unique artifact, not re-describe dispatch. |
| `log-event` | ORC composed JSONL appends inline; did not invoke skill | OVER_SPECIFIED for the high-frequency ORC pattern (15+ appends per sprint) | COMPRESS — accept that ORC composes inline and update log-event SKILL.md to document this pattern explicitly. Add a duplicate-detection hook (the actual unique value). |
| `requirements-validate` | ORC wrote the coverage report manually, did not invoke skill | OVER_SPECIFIED — same family | COMPRESS — make the skill produce the report from a checklist input, not describe how to assess coverage. |
| `commit-packet` | T1 invoked formally; T2 and T3 transcribed (durability commits made directly without re-invoking) | AMBIGUOUS_STEP — the skill was invoked once and ORC retained the procedure in working memory for subsequent calls | CLARIFY — add an explicit "invoke once per packet, not once per sprint" line to the "How This Skill Is Invoked" preamble. |

### 8d. New Skill Candidates

| Pattern observed | Frequency in sprint | Effort to encode as skill | Suggested skill name |
|---|---|---|---|
| Generic optional-field-empty-list grep before audit ("no `field: []` or `field: null` in any frontmatter") | 1 (would have caught the T3 FAIL pre-audit) | LOW | `optional-field-empty-detect` (Tier-1 SA sub-check, modeled on silent-substitution-detect) |
| Two-commit-per-task pattern (orchestration ceremony commit followed by deliverable durability commit when M-status files outside scope) | 3 (one per task wave) | LOW (prose addition to commit-packet) | Not a new skill — extend commit-packet SKILL.md (see §6 Gap 6) |
| Duplicate-COMPLETE-event detection before manual log-event append | 1 (would have caught Gap 1) | LOW | Not a new skill — extend log-event SKILL.md (see §6 Gap 1) |

### 8e. Skill Drift Candidates

| Skill | Drift observed | Suggested fix |
|---|---|---|
| `pm-preflight` | Skill exists (added today in `gander-meta-p1-hone-skill-rollout` HR-001) but only triggers via `dispatch-task` Step 0.7. ORC running orchestrator.md inline doesn't trigger it. | Make pm-preflight invocation conditional on PM dispatch, regardless of which procedure (dispatch-task or orchestrator.md inline) is driving. Or move the pm-preflight extraction into orchestrator.md Step 1. |
| `resume-project` 1.1.0 session-close gate | The 1.1.0 feature should have updated SESSION-CHECKPOINT.md when the prior session ended; it didn't. Either gate doesn't actually fire, or it fires but doesn't update the checkpoint. | Investigate the actual mechanism. Add a hook on session end that reads agent-log Stage 3 markers + event log tails and writes a fresh checkpoint. See §6 Gap 7. |
| `SubagentStop` hook (`~/.claude/hooks/subagent-autocomplete.sh`) | Did not auto-log COMPLETE for system-health-monitor (HR) agent type — three recurrences in this sprint | Inspect the hook's agent-type matching logic. Verify HR is recognized. See §6 Gap 2. |

### Hand-off to hone

> Post-mortem Section 8 complete. 16 skills logged. 0 obsolescence candidates, 6 content-quality candidates (dispatch-task, audit-pipeline, assign-agents, log-event, requirements-validate, commit-packet), 2 new sub-check candidates (optional-field-empty-detect; commit-packet two-commit-pattern doc), 3 drift candidates (pm-preflight, resume-project session-close gate, SubagentStop hook agent-type matching). Run the `hone` skill to act on these findings.
