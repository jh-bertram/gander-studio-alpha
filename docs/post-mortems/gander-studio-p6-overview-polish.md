# Post-Mortem: gander-studio-p6-overview-polish
**Date:** 2026-05-29
**Project:** `~/projects/gander-studio-alpha`
**Duration:** ~43 min (first SPAWN 2026-05-28T23:28:09Z → last COMPLETE 2026-05-29T00:11:40Z; human-verified 00:1x Z)
**Final State:** Two Sessions-mode visualization tweaks shipped (timeline right-edge buffer; overview agent-iteration grouping), both audited PASS, REQVAL COVERED 4/4, human-verified OK in browser. Commits `1b2439a..cf37023` on `main` (pushed). One mid-sprint tooling incident (event-log corruption by the Critic) was contained and reconciled.

---

## 1. Original Request

**Human (2026-05-28):** "on the timeline, let's add a buffer at the right end of the plotted data, so the task that ends at '2hrs' has 2hrs clearly visible with space for the whole text string and a small buffer for the bar before the graph area ends. And maybe more involved, but in our sessions overview, we have tons of cards for agents, and agent iterations (e.g. AR#0, AR#1, AR#2) and i think we should try and group these (e.g. 'AR')."

**Brief file:** `.claude/agents/tasks/outputs/gander-studio-p6-overview-polish-PM-1780010889.md` (rev0); `…-PM-rev1-1780011957.md` (rev1, authoritative).

**Scope at intake:**
- Existed: `AgentTimeline.tsx` (zoom + adaptive units shipped in p5/s3); `SessionListPage.tsx` overview aggregate (shipped in p5) rendering `stats.agents` per-instance; `session.aggregateStats` procedure; per-session detail/Analyze path.
- To build: (1) a right-edge plot buffer in the timeline; (2) display-only grouping of overview aggregate agents by base code.

**Skill invoked:** Zoey/orchestrator pipeline (run inline by the main session). Procedural skills exercised: assign-agents, env-preflight, audit-pipeline, requirements-validate, post-mortem (this). See §8.

---

## 2. Agent Activity Log

Both tasks were frontend-only and disjoint; a single implementing wave. The one feedback loop was at the **plan gate**, not the audit gate.

### Plan + revision — (gander-studio-p6-overview-polish)

| Seq | Timestamp (Z) | Event | Agent | Notes |
|-----|-----------|-------|-------|-------|
| 110 | 23:28 | SPAWN | PM#1 | decompose 2 FE tweaks |
| 111 | 23:30 | COMPLETE | PM#1 | rev0: 2 packets, single wave |
| 112 | 23:39 | SPAWN | CR#1 | plan critique |
| 113 | 23:42 | **CRITIQUE_BLOCK** | CR#1 | t1 RIGHT_PAD placed *outside* SVG width → short-session scrollbar regression; SCs codified the bug |
| 114 | 23:45 | SPAWN | PM#2 | rev1 (targeted revision) |
| 115 | 23:50 | COMPLETE | PM#2 | rev1: pad folded inside plot area; e2e→boundingBox; vitest^4; roster-agnostic t2 |
| 116 | 23:52 | SPAWN | CR#2 | re-check (explicit "do not touch docs/events/" guard) |
| 117 | 23:54 | **CRITIQUE_PASS** | CR#2 | blocker resolved; 2 non-blocking warnings (t2 endpoint=aggregateStats; bounded degenerate pad-collapse) |

### Implement → audit → archive

| Seq | Timestamp (Z) | Event | Agent | Notes |
|-----|-----------|-------|-------|-------|
| 118 | 23:55 | SPAWN | FE#1 | p6-t1-timeline-buffer |
| 119 | 23:55 | SPAWN | FE#2 | p6-t2-agent-grouping |
| 120 | 00:01 | COMPLETE | FE#1 | lint 0; e2e 3/3 live; flagged out-of-brief tAxisMax fix + left a debug scratch spec |
| 121 | 00:03 | COMPLETE | FE#2 | lint 0; 8/8 unit; e2e 3/3 live; AgentStatPanel/Table byte-identical |
| 122 | 00:04 | SPAWN | AUD#1 | audit both tasks live |
| 123 | 00:10 | **AUDIT_PASS** | AUD#1 | t1 SA/QA/SX; tAxisMax change verified non-regressive |
| 124 | 00:10 | **AUDIT_PASS** | AUD#1 | t2 SA/QA/SX; live fold path 73 raw→15 base codes |
| 125 | 00:11 | REQVAL_COVERED | ORC#1 | Mode A inline, 4/4, no REQUIRES_HUMAN_VISUAL |
| 126 | 00:11 | SPAWN | AR#2 | archive |
| 127 | 00:11 | COMPLETE | AR#2 | project_log + incident recorded |
| 128 | 00:1x | SPRINT_VERIFIED | ORC#1 | human OK in browser |

**Feedback loops:** 1 — at the plan gate (CR#1 BLOCK → PM rev1 → CR#2 PASS). **Zero** at the audit gate: both implementing tasks passed SA/QA/SX on first submission.

**Root cause of the plan-gate failure:** PM rev0 specified the buffer as `svg width = contentWidth + RIGHT_PAD` — adding the pad *outside* the SVG geometry. That breaks the documented short-session invariant (`contentWidth = Math.max(containerWidth, …)` floors the SVG at the scroller width so short sessions don't scroll); the wider SVG would force a permanent horizontal scrollbar on every session. The PM did not validate the approach against that existing invariant. The Critic caught it at plan time; rev1 folded the pad *inside* the plot area (`plotAreaWidth = max(MIN_BAR_AREA, contentBarAreaActual − RIGHT_PAD)`), leaving `svg width = contentWidth` byte-identical.

**Deviation from PM brief:** FE#1 made an unbriefed change to `tAxisMax` (`Math.max(maxComplete, maxSpawn)` instead of `maxComplete`), fixing a latent bug where an agent spawning after the last COMPLETE rendered past the plot edge. The auditor verified it identical to HEAD except in the previously-buggy case — correct, in-domain, non-regressive. Accepted. FE#1 also left a `debug_timeline.spec.ts` scratch file in `tests/e2e/`; ORC quarantined it to `/tmp` before audit.

---

## 3. Post-Delivery: Runtime Bugs (if any)

**None in the deliverable.** No runtime bug surfaced after agents closed; the human verified all three acceptance points (grouped cards, timeline buffer, no console errors) in the browser.

One **mid-sprint tooling incident** (not an app runtime bug) is the sprint's most important finding — the Critic corrupting the event log. It is analyzed in §6 (GAP-1/GAP-2) because its root cause is a pipeline/tooling gap, not a defect in the shipped software.

---

## 4. QA Gap Analysis

**Current QA protocol:** auditor runs SA (standards), QA (functionality — lint + unit + live Playwright), SX (security) per task; requirements-validate (Step 3.5) checks coverage against the brief's success criteria with a runtime-behavior sub-check.

**What this caught:**
- **At the plan gate (Critic):** the short-session scrollbar regression *before any code was written* — the highest-leverage catch of the sprint. Also forecast two warnings that shaped implementation: the t2 e2e was targeting the wrong tRPC procedure (`getStats` instead of `aggregateStats`), and a `vitest@^1.6.0` devDep would collide with the server's `vitest@4`.
- **At the audit gate:** verified the out-of-brief `tAxisMax` change was non-regressive; confirmed `AgentStatPanel`/`AgentStatTable` byte-identical via `git diff --exit-code`; instrumented the live t2 fold path (73 raw agents → 15 base codes) to prove the e2e wasn't passing vacuously.

**What this missed (and the mechanism):**
- **The latent `tAxisMax` overflow bug shipped in prior sprints (s3/p5) and lived undetected** until the buffer work surfaced it. Mechanism: the prior timeline e2e used *width-arithmetic proxies* (`svgWidth > scrollerWidth`) rather than geometry `boundingBox()` assertions, so it could not detect a bar rendering past the plot edge (the old `overflow:hidden` clipped it visually). This sprint's Critic explicitly required boundingBox assertions, which is what made the latent bug observable.
- **The event-log corruption was not prevented by any gate** — the Critic (a read-only review agent) had `Write` access and used it on shared telemetry. No structural guard existed.

**Recommendations:** (1) visualization e2e must use geometry boundingBox assertions, not width arithmetic — codify in `frontend.md`; (2) structurally bar read-only agents from writing `docs/events/` (see §6).

---

## 5. Agent Performance Summary

| Agent | Tasks | First-pass rate | Notes |
|-------|-------|----------------|-------|
| PM | 1 (2 revisions) | 0/1 at plan gate | rev0 blocked (pad-outside-SVG); rev1 clean. Decomposition otherwise sound (correct disjoint-wave call, accurate file/line citations). |
| CR (Critic) | 2 passes | n/a (gate) | Caught the blocker + 3 actionable warnings. Also caused the event-log incident (§6 GAP-1). |
| FE#1 | 1 | 1/1 audit | Correct geometry; bonus tAxisMax fix; minor hygiene miss (scratch spec). |
| FE#2 | 1 | 1/1 audit | Pure util + 8 unit tests + roster-agnostic e2e; byte-identical component guard held. |
| AUD | 1 (2 tasks) | n/a | Ran everything live; instrumented the t2 fold path rather than trusting the assertion. |
| AR | 1 | 1/1 | Logged completion + the incident. |

**Most impactful single agent action:** CR#1's plan-gate BLOCK. It converted a browser-only regression (scrollbar on every session — the exact failure class that escaped to human verification in s3 Refinement #2) into a zero-cost plan revision.

**Recurring failure pattern:** PM plans that don't validate against an existing invariant/contract. p5 G1 was "PM described an API shape the source contradicted"; p6 was "PM described a geometry approach that violated the documented short-session no-scroll invariant." Same root: the PM reasons about the *change* without reasoning about the *constraint it must preserve*. The Critic is currently the only thing catching this.

---

## 6. Protocol Gaps Identified

> **Code-not-prompt check:** GAP-1 and GAP-2 are both "should be a hook/deny-rail, not a prompt instruction" — they are marked for HR. A handoff brief is already authored (`docs/agent-improvements/handoff-p6-critic-eventlog-to-gander-2026-05-29.md`).

| Gap | Impact | Suggested fix |
|-----|--------|---------------|
| **GAP-1: Read-only review agents can write the event log.** CR#1 truncated `agent-events-2026-05-28.jsonl` via a read-then-overwrite Write, destroying seqs 5–108 (uncommitted, unrecoverable from git). | Permanent loss of a day's telemetry; required two ORC reconciliation passes. | Implement a `PreToolUse` hook / `settings.json` deny-rail blocking Write/overwrite to `docs/events/*.jsonl` from any agent except ORC + the autocomplete hook. Add a spec prohibition in `critic.md` (and audit archivist/dispatcher/researcher). **Route to HR.** (code-not-prompt) |
| **GAP-2: Event-log append is race-prone.** The `SubagentStop` hook auto-logs COMPLETE at `last_seq+1` and collided with ORC's manually-logged SPAWN/gate events (seqs 115, 119, 120 each appeared twice). | Broken seq monotonicity; manual renumber at wrap. | ORC should stop manually logging COMPLETE (let the hook own it); make appends re-read `max(seq)+1` atomically. **Route to HR.** (code-not-prompt) |
| **GAP-3: PM does not validate the plan against existing invariants.** rev0 violated the short-session no-scroll invariant; recurrence of p5 G1 (invented API shape). | One plan-gate feedback loop per sprint; relies entirely on the Critic. | PM task packets that modify an existing component must cite the invariants/contracts the file documents and state how the change preserves each. Add to the PM decomposition checklist / `assign-agents` receipt-check. |
| **GAP-4: Visualization e2e used arithmetic proxies, not geometry.** Let the `tAxisMax` overflow bug live undetected across s3/p5. | Latent rendering bug shipped twice. | Mandate `boundingBox()`-based assertions for any SVG/canvas visualization spec (no `width >`/`scrollWidth` arithmetic as the sole clipping check). Codify in `frontend.md`. |
| GAP-5 (minor): implementing agent left a scratch spec in `tests/e2e/`. | Would pollute the Playwright suite the auditor runs; ORC quarantined it (rm is deny-railed). | FE spec-hygiene reminder: scratch/debug specs must be written outside `tests/e2e/` or removed before COMPLETE. |

---

## 7. Final Deliverable State

**App/Service:** `~/projects/gander-studio-alpha` (client :5173, server :3001)
**Build:** `npm run lint` exit 0 (tsc --noEmit across shared/server/client). `npm test -w @gander-studio/client` 8/8.
**Runtime:** confirmed working — both e2e suites green live; human-verified in browser.

**Features delivered:**
- AgentTimeline right-edge buffer: `RIGHT_PAD=48` folded inside the plot area (`plotAreaWidth`/`plotRight`); rightmost bar + final tick label render fully with a gap; `svg width=contentWidth` unchanged (no short-session scrollbar). Latent `tAxisMax` overflow fixed.
- Overview agent grouping: `groupAgentsByBaseCode` collapses `{CODE}#{n}` iterations into one card/row per base code, summed; display-only.

**Key contracts (for the next engineer):**
- `packages/client/src/utils/group-agents.ts` — `groupAgentsByBaseCode(agents: AgentActivity[]): AgentActivity[]`; base code = `agent_id.split('#')[0]` (whole string if no `#`); mirrors `aggregate-stats.ts` wall_clock_ms undefined-vs-zero semantics. Display-only — `session.aggregateStats`/`getStats` and `AgentStatPanel`/`AgentStatTable` interfaces unchanged.
- Timeline geometry: `svg width = contentWidth` is the no-scroll invariant; never widen it for padding — reserve space *inside* via `plotAreaWidth`. Vitest is now a client devDep (`^4`, node env, `vitest.config.ts`, `test` script).
- Commits: `1b2439a` (t1), `643a66a` (t2), `8f7903f` (bookkeeping + event-log recovery), `cf37023` (closure), `bc1d2e6` (gander handoff brief). All pushed.

---

## 8. Skill-Use Analysis

### 8a. Skill Invocation Log

| Skill | Invocations | Outcome | Owner | Last reviewed | Notes |
|-------|-------------|---------|-------|---------------|-------|
| assign-agents | 1 | VALUABLE | ORC | NEVER (studio) | Wave/receipt structure correct; ran inline (see 8c). |
| env-preflight | 1 | VALUABLE | ORC | NEVER | Confirmed session.list non-empty + aggregateStats live before FE wave. |
| audit-pipeline | 1 | VALUABLE | ORC | 2.0.1 (gander) | SA/QA/SX live; caught nothing failing but verified the tAxisMax change + byte-identical guard. Ran inline (8c). |
| requirements-validate | 1 | VALUABLE | ORC | NEVER | Mode A inline; 4/4 COVERED; artifact on disk; correctly classified runtime criteria as covered via boundingBox/DOM assertions. |
| post-mortem | 1 | VALUABLE | ORC | — | This document. |

### 8b. Obsolescence Candidates

None.

### 8c. Content-Quality Candidates

| Skill | Deviation observed | Suspected cause | Recommended action |
|-------|--------------------|----------------|--------------------|
| assign-agents / audit-pipeline | ORC executed the procedures **inline in the main session** rather than via a formal Skill-tool invocation (skill bodies were resident from a prior context). Outputs/artifacts were still produced correctly. | AMBIGUOUS_STEP — same inline-vs-formal-invocation ambiguity flagged in `requirements-validate.md` (Mode A/B) but not yet generalized to assign-agents/audit-pipeline. | CLARIFY: add an explicit "ORC-direct inline vs spawned" mode note to assign-agents + audit-pipeline, mirroring requirements-validate's Mode A/B gate. |

### 8d. New Skill Candidates

| Pattern observed | Frequency in sprint | Effort to encode as skill | Suggested skill name |
|-----------------|---------------------|--------------------------|---------------------|
| Event-log integrity repair (detect duplicate/non-monotonic seqs, renumber preserving order, validate JSONL, replace bad sentinels) — ORC did this by hand twice. | 2× | LOW | `event-log-reconcile` (or fold into the GAP-2 hardening — a deterministic script is the better home). |

### 8e. Skill Drift Candidates

None observed.

### Hand-off to hone

Post-mortem Section 8 complete. 5 skills logged. 0 obsolescence candidates, 1 content-quality candidate (assign-agents/audit-pipeline inline-invocation ambiguity), 1 new skill candidate (`event-log-reconcile` — better as the GAP-2 script), 0 drift candidates. These target the **gander** repo (studio sessions don't own the skill specs) — fold into the existing handoff alongside GAP-1/GAP-2 rather than running `hone` from this studio session.
