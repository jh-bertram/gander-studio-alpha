# After-Action: Studio Sessions/Graph Fix → Sessions Feed + Role-Aware Cards → Wall-Clock Format

**Date:** 2026-06-30
**Project:** `/home/jhber/projects/gander-studio-alpha`
**Duration:** ~1 continuous session (first SPAWN seq 1 → last COMPLETE seq 55), three sprint phases
**Final State:** All three shipped & committed on `feat/studio-sessions-feed-agentstats` (`ef42661`, `23f71a1`, `2d68e9c`); two AUDIT_PASS gates; NOT pushed (human checkpoint). Sessions and Graph tabs load; the Sessions tab now surfaces event-log-synthesized sprints; agent cards are role-aware; wall clock auto-scales to whole-number units.

---

## 1. Original Request

**Human (2026-06-30), in three turns:**
1. *"in the studio, sessions and graph tabs aren't loading anything for me but 'no sessions' and 'graph unavailable'"* → **p8**.
2. *"the latest session i see is from 6-23 though i've done sessions more recently"* + *"why is half the card taken up by critique/audit when this isn't relevant to most agents… there has to be more interesting stats"* → **p9**.
3. *"the wall clock is in seconds but sometimes is in the millions… auto simplify to minutes/hours/days/months and lessen the precision"* → **p9-wallclock**.

**Brief files:** `.claude/tasks/gander-studio-p8-sessions-graph-fix.md`, `.claude/tasks/gander-studio-p9-sessions-feed-agentstats.md` (+ approved decomposition `.claude/tasks/outputs/…-PM-1782010000.md`), and the ORC#0-direct stub for wallclock.

**Scope at intake:**
- p8: two dead surfaces. Sessions discovery hardcoded to `docs/post-mortems/` (emptied by the post-mortem→after-action rename); connectivity schema rejected legitimate `null` hook fields.
- p9: build event-log session synthesis + multi-root scan + role-aware `AgentStatPanel`. New data contract (`has_after_action`, `files_touched`).
- p9-wallclock: one pure formatter, displaying multi-day spans as millions of seconds.

**Skill invoked:** `/zoey` → orchestrator pipeline (dispatch-task family) for p8/p9; ORC#0-direct for wallclock. `Workflow` accelerant used for p9 implementation (human opt-in).

---

## 2. Agent Activity Log

### Phase p8 — Sessions/Graph fix (`gander-studio-p8-sessions-graph-fix`)

| Seq | Event | Agent | Notes |
|----|-------|-------|-------|
| 1 | SPAWN | BE#1 | first attempt — stalled after 1 tool call, no edits |
| 2 | GHOST_CONFIRMED | BE#1 | tombstoned (no output) |
| 2 | SPAWN | BE#2 | fresh edits-first spawn |
| 6 | COMPLETE | BE#2 | both fixes applied (19 tools); stopped before lint — ORC ran lint+curl |
| 7→11 | SPAWN/AUDIT_PASS/COMPLETE | AUD#1 | SA/QA/SX PASS; auditor Bash failed → ORC-supplied evidence (foreground-with-Bash) |
| 12 | COMMIT | ORC#0 | `ef42661` |

**Feedback loops:** 1 (BE#1 ghost → BE#2 fresh). **Root cause:** background-agent stall (see §6 G1).

### Phase p9 — Feed + role-aware cards (`gander-studio-p9-sessions-feed-agentstats`)

| Seq | Event | Agent | Notes |
|----|-------|-------|-------|
| 14→16 | PM#1 | PM | 6-packet decomposition (t1 split to t1a/t1b) |
| 17→20 | CR#1 | Critic | **BLOCK** — missing sc-precheck (ORC-cleared, 0 findings) + dedup key divergence |
| 21→25 | PM#1 rev → CR#2 | Critic | **BLOCK** — sprintKey missed `-postmortem`; no non-sprint filter |
| 26→30 | PM#1 amend → CR#3 | Critic | **CRITIQUE_PASS** — dedup verified corpus-correct |
| 31,32,35 | BE#3, UI#1, BE#4 | impl | all STALLED (4–7 tools, no edits) |
| 37 | PAUSE | ORC#0 | human chose clean pause over ORC-inline |
| 38–40 | GHOST_CONFIRMED | BE#3/UI#1/BE#4 | tombstoned |
| 42 | COMPLETE | UI#1 | design spec actually landed (long turn; spec-only agent, no edits) |
| 45→48 | WF#1 (Workflow) | 5 agents | **t2/t1a/t1b/t5/t4 all `done`** — the harness that worked |
| 49→51 | AUD#2 (Workflow) | Auditor | SA/QA/SX PASS; re-ran 138 tests + lint independently |
| 52 | COMMIT | ORC#0 | `23f71a1` |

**Feedback loops:** 2 Critic blocks (both correct, plan converged) + 1 full execution-substrate pivot (3 stalled agents → PAUSE → Workflow). **Root cause of stalls:** §6 G1. **Deviation from brief:** none in scope; t5 introduced `PanelMetricKey` and edited `SessionPicker.tsx` (where the picker actually lives) — both correct, audit-noted.

### Phase p9-wallclock — Adaptive units (`gander-studio-p9-wallclock-format`)

| Seq | Event | Agent | Notes |
|----|-------|-------|-------|
| 54,55 | SPAWN/COMPLETE | ORC#0-direct | pure formatter + single-source refactor + 10 tests; lint/build/test pass |
| — | COMMIT | ORC#0 | `2d68e9c` |

**Feedback loops:** 0. ORC#0-direct chosen deliberately (2-file pure-format change; Workflow disproportionate; bg agents stall).

---

## 3. Post-Delivery: Runtime Bugs (if any)

None discovered post-delivery. Every phase was live-verified before commit (p8: live curl + 40 sessions/112 graph nodes; p9: live feed 19 doc + 31 synthetic + FE Playwright on :5173; wallclock: 10 unit tests + build). One known **non-bug accepted tradeoff** carried forward: synthetic under-collapse for descriptive sub-suffixes (`gander-meta-xfolder-improve` shows 3 cards) — Critic-ratified, documented in `docs/deferred-work.md`.

---

## 4. QA Gap Analysis

**Current QA protocol:** Critic plan-gate (pre-execution) + Auditor SA/QA/SX (post-execution, veto) + ORC foreground verification (lint/tests/build/live).

**What this caught:**
- Critic caught a **correctness bug at plan stage**: doc-id (`gander-debt-drain-2026-06-23`) ≠ task-id-slug (`gander-debt-drain`) → would have double-shown every documented sprint. Caught before any code (CR#1).
- Critic caught the `-postmortem` corpus reality the unit fixture missed (CR#2) — the "passes the hand-written test, breaks on real data" class.
- Auditor independently re-ran 138 tests + lint inside the reliable Workflow harness.

**What this missed:** nothing shipped-broken. The dedup correctness needed **three** Critic passes — a cost, but the gate converged rather than rubber-stamped.

**Recommendations:** keep real-corpus assertions (test g) as a standing requirement for any discovery/heuristic feature; they are what made CR#3's PASS trustworthy.

---

## 5. Agent Performance Summary

| Agent | Tasks | First-pass rate | Notes |
|-------|-------|-----------------|-------|
| PM | 1 (3 revisions) | n/a | Correct 6-packet decomposition; revisions were Critic-driven refinement, not errors |
| Critic | 3 passes | 100% (every block was a real, distinct defect) | Highest-value agent this session — caught the dedup bug pre-code |
| BE (normal spawn) | 4 attempts | ~25% | BE#2 succeeded; BE#1/#3/#4 stalled (substrate, not capability) |
| UI (normal spawn) | 1 | 100% (eventually) | Spec-only agent completed on a long turn — did NOT stall (no edits) |
| Workflow agents (t2/t1a/t1b/t5/t4) | 5 | **100%** | Every packet `done` first pass; the harness that worked |
| Auditor (Workflow) | 1 | 100% | PASS + independent re-verification; Bash worked in-workflow (failed in normal spawn for AUD#1) |

**Most impactful single agent action:** Critic CR#1 tracing doc-id vs task-id-slug divergence to a duplicate-row bug — before a line of code.

**Recurring failure pattern:** normal background **edit-heavy** subagents stalled after 4–7 tool calls with no edits, across BOTH sprints (BE#1, BE#3, BE#4). Spec/planning agents (PM, Critic, UI-designer, and the in-Workflow auditor) ran fine. The discriminator is *edit-heavy execution under the background-async-Agent path*, not task size (t2 — a 3-line edit — stalled).

---

## 6. Protocol Gaps Identified

> Code-not-prompt check applied to each row below.

| Gap | Impact | Suggested fix |
|-----|--------|---------------|
| **G1 — Background-async Agent execution stall.** Edit-heavy subagents reliably suspended after 4–7 tool calls with no edits (BE#1/#3/#4); only the `Workflow` harness ran them to completion. | Blocked p9 implementation entirely on the base Agent path; forced a PAUSE and a pivot to Workflow. Base-plan portability concern: if the base Agent path can't execute edit-heavy agents, the control plane's Layer-1 execution is degraded. | Investigate the background-async-Agent tool-budget/suspension behavior (environment-level). Until root-caused, add a **sanctioned ORC fallback ladder** to dispatch-task: edits-first brief → on stall, fresh spawn → on repeat stall, Workflow accelerant (if available) or human-chosen ORC#0-direct-with-audit. Route to HR as a dispatch-task §addition. |
| **G2 — agent-log Stage-1 ceremony consumes constrained turn budget.** Stalled agents spent their first calls writing RECEIVED logs instead of editing ("Writing Stage 1 log first…"). | Made G1 worse — ceremony burned the budget before any code landed. | Make the agent-log Stage-1 step **deferrable/skippable for edit-heavy agents** — move RECEIVED logging to AFTER the first edit, or gate it behind a "you have a healthy turn budget" condition. Route to HR (agent-log SKILL edit). |
| **G3 — Malformed `## Output Path` block tripped the PreToolUse:Agent hook.** ORC's auditor spawn (p8) used `## Output` + `<unix_ts>` placeholder; hook required manual confirmation and auto-COMPLETE would have failed. | One manual confirmation; observability regressed to manual COMPLETE backfill for that agent. | Already captured as memory `feedback_spawn_prompt_output_path_block`. Candidate: ORC tooling/template should emit the canonical block so it cannot drift; OR widen the hook regex to accept a placeholder form. Route to HR. |
| **G4 — Auditor Bash fails under normal background spawn but works in Workflow.** AUD#1 (normal) could not run any Bash → ORC supplied QA evidence; AUD#2 (Workflow) ran 138 tests itself. | Normal-spawn audits can't self-verify shell SCs here; relies on the foreground-with-Bash fallback. | Same root as G1 (background-async substrate). Until fixed, prefer running the Auditor via the Workflow harness for shell-dependent audits, or pre-supply ORC evidence (already protocolized in orchestrator.md §Meta-Agent Shell-Dependent SCs). |

---

## 7. Final Deliverable State

**App/Service:** `/home/jhber/projects/gander-studio-alpha` (branch `feat/studio-sessions-feed-agentstats`, 3 commits, unpushed)
**Build:** `npm run lint` clean (3 packages); `npm run build` clean; server tests 138/138; client unit tests pass; FE live Playwright 3/3 on :5173.
**Runtime:** confirmed working (human reloaded — "looks good").

**Features delivered:**
- p8: Sessions discovery dual-globs `post-mortems` + `after-actions`; connectivity schema accepts `null` hook fields.
- p9: event-log session synthesis (suffix-agnostic dedup, denylist + positive shape gate), multi-root scan, `has_after_action`, doc-less read-only guards (saveEdit NOT_FOUND/BAD_REQUEST, getRaw placeholder), role-aware `AgentStatPanel` (single-source `agentDisplayConfig`), `files_touched` metric.
- p9-wallclock: adaptive whole-number units (ms→s→min→hours→days→months), single-sourced.

**Key contracts the next engineer needs:**
- `SESSIONS_SOURCE_DIRS` (comma list) drives multi-root; **dev server must restart to load `.env` changes**.
- Dedup single-source: `packages/server/src/session-slug-match.ts` (`matchesSlug`, `sprintRoot`, `isDocumented`). Do NOT switch dedup to suffix enumeration.
- `sprintRoot` shape gate admits `-p{N}` / `prog-` / `gander-meta-`; everything else is non-sprint noise.
- Synthetic sessions: `has_after_action:false`, `filePath:''`, read-only.
- Role map single-source: `agentDisplayConfig` (CR→critique, AUD/AUDITOR→audit, else→3 metrics).

---

## 7b. Progression Ledger Entry (AA-§7)

**sprint_id:** `gander-studio-p9-sessions-feed-agentstats`

**xp_gained:**
- surface: Skills | delta: first successful `Workflow`-accelerant implementation run (5 packets, 100% first-pass) after base Agent path stalled
- surface: Connectivity | delta: connectivity schema hardened to accept null hook fields (graph surface restored)
- surface: Skills | delta: 3-pass Critic convergence on a suffix-agnostic dedup design verified against the live corpus

**levels_advanced:**
- Orchestrator gained a proven execution-substrate fallback (Agent → Workflow) for edit-heavy waves
- Plan-gate rigor demonstrated value: a correctness bug killed at plan stage, pre-code

**new_capabilities:**
- Sessions surface now reads the event log directly (doc-independent session feed) — a new deterministic data path in the studio app

```jsonl
{"sprint_id":"gander-studio-p9-sessions-feed-agentstats","xp_gained":[{"surface":"Skills","delta":"first successful Workflow-accelerant 5-packet implementation after base Agent path stalled"},{"surface":"Connectivity","delta":"connectivity schema accepts null hook fields; graph surface restored"},{"surface":"Skills","delta":"3-pass Critic convergence on corpus-verified suffix-agnostic dedup"}],"levels_advanced":["orchestrator gained Agent→Workflow execution fallback for edit-heavy waves","plan-gate caught a correctness bug pre-code"],"new_capabilities":["studio Sessions surface reads the event log directly (doc-independent feed)"]}
```

---

## 8. Skill-Use Analysis

### 8a. Skill Invocation Log

| Skill | Invocations | Outcome | Owner | Last reviewed | Notes |
|-------|-------------|---------|-------|---------------|-------|
| dispatch-task (orchestrator pipeline) | 2 (p8, p9) | VALUABLE | ORC | NEVER | drove PM→Critic→impl→audit→commit both sprints |
| Critic plan-gate | 3 passes | VALUABLE | ORC | NEVER | caught the dedup correctness bug pre-code; highest value |
| sc-locked-value-consistency (check.py) | 1 | VALUABLE | ORC | NEVER | cleared CR#1 BLOCKER 1 mechanically (0 findings) |
| Workflow (accelerant) | 2 (impl, audit) | VALUABLE | ORC | NEVER | the only execution path that completed edit-heavy agents |
| audit-pipeline (Auditor) | 2 | VALUABLE | ORC | NEVER | AUD#1 needed ORC evidence (Bash fail); AUD#2 self-verified in-Workflow |
| commit-packet (manual) | 3 | VALUABLE | ORC | NEVER | scoped staging excluded pre-existing debug-spec debt every time |
| assign-agents | 0 | NOT_TRIGGERED | ORC | NEVER | ORC dispatched implementing agents directly (single-domain p8; Workflow p9) instead of the formal skill |
| after-action | 1 | VALUABLE | ORC | NEVER | this document |

### 8b. Obsolescence Candidates

| Skill | Consecutive non-value sprints | Evidence | Recommended action |
|-------|------------------------------|----------|--------------------|
| _none_ | — | — | — |

### 8c. Content-Quality Candidates

| Skill | Deviation observed | Suspected cause | Recommended action |
|-------|--------------------|----------------|--------------------|
| agent-log | edit-heavy agents wrote Stage-1 RECEIVED logs and stalled before editing | OVER_SPECIFIED (mandatory ceremony ahead of work) | CLARIFY — make Stage-1 deferrable/post-first-edit for edit-heavy agents (see §6 G2) |
| dispatch-task | no sanctioned path when the execution substrate fails mid-wave; ORC improvised (pause → Workflow) | AMBIGUOUS_STEP (no substrate-failure fallback) | CLARIFY — add the Agent→fresh-spawn→Workflow/ORC-direct fallback ladder (see §6 G1) |

### 8d. New Skill Candidates

| Pattern observed | Frequency in sprint | Effort to encode as skill | Suggested skill name |
|-----------------|---------------------|--------------------------|---------------------|
| Authoring a dependency-ordered, file-disjoint implementation Workflow from an approved decomposition | 1 (could recur for any multi-packet sprint when bg agents stall) | MEDIUM | `decomp-to-workflow` |

### 8e. Skill Drift Candidates

| Skill | Drift observed | Suggested fix |
|-------|---------------|---------------|
| _none_ | — | — |

### Hand-off to hone

Post-mortem Section 8 complete. 8 skills logged. 0 obsolescence candidates, 2 content-quality candidates (agent-log, dispatch-task), 1 new skill candidate (`decomp-to-workflow`), 0 drift candidates. Run the `hone` skill to act on these findings.

---

## 9. Rule / Ref / CLAUDE.md Delta Proposals

| Target file | Proposed change | Priority | Rationale |
|-------------|----------------|----------|-----------|
| `~/.claude/CLAUDE.md` (or dispatch-task) | Condition the "orchestrator never fixes inline" rule on **agent executability**: when the execution substrate fails (repeated stalls) and gates are otherwise preserved (PM/Critic upstream, Auditor downstream), ORC#0-direct execution is a sanctioned fallback the human may choose. | HIGH (human-ratify) | This session: bg agents could not execute; the rule as written left ORC helpless. The rule's intent (preserve the audit gate) is satisfied by ORC-direct + downstream audit. |
| `.claude/skills/dispatch-task/SKILL.md` | Add a **substrate-failure fallback ladder**: edits-first brief → fresh spawn → Workflow accelerant (if available) or human-chosen ORC#0-direct, audit gate always runs. | HIGH | §6 G1; ORC improvised this — encode it. |
| `.claude/skills/agent-log/SKILL.md` | Make Stage-1 RECEIVED logging deferrable to after the first edit for edit-heavy agents. | MEDIUM | §6 G2; ceremony consumed constrained turn budgets. |
| `.claude/rules/standards.md` (Base-Plan Portability) | Note that Workflow may be used as an **execution accelerant for app-code builds** without violating portability, provided gates/outputs remain base-plan-reproducible; distinguish from making a Layer-1 *mechanism* depend on Workflow. | LOW | Clarifies the line this session walked (used Workflow for app code, kept audit in the main session). |

---

## 10. Eval Gap Proposals

| Agent / Skill | Gap description | Suggested eval | Priority |
|---------------|----------------|----------------|----------|
| Critic | No eval asserts the Critic catches a discovery-feature dedup/identity divergence (the highest-value catch this session) | Eval: a decomposition with a doc-id ≠ task-id-slug dedup assumption → expect BLOCK | MEDIUM |
| (substrate) | No mechanism detects/asserts that an edit-heavy agent actually edited (vs stalled) | A post-spawn "did this agent modify any file?" check before treating COMPLETE as real | MEDIUM |

---

## 11. Connectivity Findings

**Analyzer run this sprint:** No — manual observations only.

Manual: p8 restored the Graph (connectivity) surface by accepting `null` hook fields — the connectivity-graph.json had hook nodes (`aa-close-gate.sh`) with null `event_type`/`matcher` that the schema rejected. No dead refs or orphan nodes observed in app source. The studio's own connectivity graph was not re-analyzed.
