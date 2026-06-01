# After-Action: Phase 5 Sprint B — Studio /progression Visualization
**Date:** 2026-06-01
**Project:** `~/projects/gander-studio-alpha`
**Duration:** ~45 min wall-clock (first SPAWN 18:25:08Z → ARC COMPLETE 19:06:25Z, + bookkeeping/cleanup)
**Final State:** Shipped and human-verified. `/progression` route + `progression.getLedger` tRPC live; audited PASS (SA/QA/SX), REQVAL 5/5 COVERED, human Step 4.5 OK. Commits `49badc1` (BE) + `cdfed98` (FE) + `35023a6` (bookkeeping) on `main`, pushed (`09c632d..35023a6`). Closes the gander progression rollout (Phase 5A ledger + 5B viz).

---

## 1. Original Request

**Human (2026-06-01):** "i believe we have a sprint waiting for us assigned from the 'gander' directory." Resolved to **Phase 5 Sprint B — Studio `/progression` viz**, assigned to gander-studio-alpha by the gander control-plane team (Phase 5 was SPLIT 2026-06-01: Sprint A = ledger in the gander repo [DONE]; Sprint B = this Studio visualization, like Phase 2's graph viz). Human confirmed go ("Yes, run it") via AskUserQuestion, then "ok wrap it up" at the Step 4.5 gate.

**Brief file:** `.claude/agents/tasks/outputs/gander-studio-p5b-progression-viz-PM-1780338308.md` (PM#0 decomposition) + `...-PM-amend1-1780338936.md` (warning resolution).

**Scope at intake:**
- Existed: the gander progression ledger (`${GANDER_ROOT}/docs/progression-ledger.md`, 5→6 entries) and the consumer contract `~/.claude/refs/progression-ledger-schema.md` v1.0.0; the Phase 2 precedent (`connectivity.getGraph` + `GraphPage.tsx`); the cross-repo GANDER_ROOT read pattern.
- Needed: a `progression.getLedger` tRPC route (read + parse + validate + return) and a `/progression` React route rendering per-surface/per-sprint XP history.

**Skill invoked:** `/zoey` (orchestrator.md inline) — not `dispatch-task`; the pipeline was driven inline by the main session as ORC.

---

## 2. Agent Activity Log

### Plan — (gander-studio-p5b-progression-viz)

| Seq | ~Time (UTC) | Event | Agent | Notes |
|-----|-------------|-------|-------|-------|
| 1 | 18:25:08 | SPAWN | PM#0 | orchestrator_brief (HIGH) |
| 2 | 18:31:55 | COMPLETE | PM#0 | task_decomposition: 3 tasks / 2 waves; pre-read router.ts/GraphPage/ui-store/ModeContent/navigation/ledger |
| 3 | 18:32:11 | SPAWN | CR#1 | plan_critique |
| 18 | 18:32→19:06 | COMPLETE | CR#1 | CRITIQUE_PASS, 0 blockers, 3 warnings (hook-missed; ORC-backfilled) |
| 4 | 18:35:36 | SPAWN | PM#2 | warning_resolution_request |
| 5 | 18:36:00 | COMPLETE | PM#2 | plan_amendment: 3 warnings resolved (NOT_FOUND pinned, `>=` counts, 150-line cap) |

**Feedback loops:** 1 warning-resolution round (SC-level amendment; not a re-plan, not a re-Critic). Jidoka evaluated and skipped (all codebase facts pre-verified by PM + independently re-verified by CR#1).

### Wave 1 — UI design ∥ BE (parallel)

| Seq | ~Time (UTC) | Event | Agent | Notes |
|-----|-------------|-------|-------|-------|
| 6 | 18:38:11 | SPAWN | UI#1 | design_spec |
| 7 | 18:38:11 | SPAWN | BE#1 | completion_packet |
| 8 | 18:55:00 | COMPLETE | UI#1 | timeline + per-surface summary; FF7 tokens; caught 3 WCAG contrast issues (incl. a pre-existing GraphPage one) |
| 20 | (backfill) | COMPLETE | BE#1 | schema verbatim §4; progressionRouter; parser extracted; 67/67 tests, lint 0 (hook-missed; ORC-backfilled) |
| 9 | 18:43:36 | SPAWN | AUD#1 | audit_verdict (BE) |
| 10 | 18:50:00 | AUDIT_PASS | AUD#1 (self-logged AUDITOR#1) | SA/QA/SX PASS; static-only on live route (GANDER_ROOT unset in auditor env — parser tests use synthetic content) |

**Durability commit:** `49badc1` after BE AUDIT_PASS.

### Wave 2 — FE (depends on both Wave-1 tasks)

| Seq | ~Time (UTC) | Event | Agent | Notes |
|-----|-------------|-------|-------|-------|
| 11 | 18:47:16 | SPAWN | FE#1 | completion_packet |
| 12 | (auto) | COMPLETE | FE#1 | ProgressionPage 146 lines; 4 AppMode sites; no hex; lint 0 |
| 13 | 18:52:09 | SPAWN | AUD#2 | audit_verdict (FE) |
| 14 | 18:57:10 | AUDIT_PASS | AUD#2 (self-logged AUDITOR#2) | **PASS first-pass** via LIVE Playwright walkthrough (6 entries, zero console errors, screenshot). One NON-BLOCKING advisory: e2e Test 2 `getByText('SURFACE COVERAGE')` collides with a ledger `delta` substring under Playwright strict mode |
| 15 | 18:58:05 | SPAWN | FE#2 | remediation_request (selector) |
| 16 | 18:59:29 | COMPLETE | FE#rem1 | 4 heading locators → `getByRole('heading',…)`; sprint_id asserts untouched; Playwright 3/3 green live; lint 0 |

**Durability commit:** `cdfed98` after FE remediation. ORC accepted the test-only fix without an AUD#3 (proportionate: it was the auditor's own prescribed correction, verified live).

### Close

| Seq | ~Time (UTC) | Event | Agent | Notes |
|-----|-------------|-------|-------|-------|
| — | 19:01 | REQVAL | ORC#0 | 5/5 COVERED (`...-REQVAL-1780340477.md`); surfaced per-surface granularity note |
| 17 | 19:01:51 | SPAWN | ARC#1 | archive_entry |
| 25 | 19:06:25 | COMPLETE | ARC#1 | logged project_log + registry (with confabulation — see §6 GAP-1; ORC-backfilled) |

**Deviation from PM brief:** none material. BE added `parsers/progression-parser.ts` (a pure-function extraction for testability) beyond the brief's named files — within the BE domain, not out-of-scope; auditor confirmed clean.

---

## 3. Post-Delivery: Runtime Bugs (if any)

**None.** No application bug surfaced after agents closed. The two issues found post-close (§6 GAP-1, GAP-2) were both in the *meta layer* (durable records + the backfill hook), not in shipped code. The page itself was live-verified twice (auditor + human).

---

## 4. QA Gap Analysis

**Current QA protocol:** code-auditor runs SA (standards) + QA (functional, incl. live Playwright) + SX (security) on each completion packet; ORC runs receipt-checks before audit and requirements-validate after all audits.

**What this caught:**
- The e2e selector strict-mode collision — caught only because AUD#2 *ran the spec live* rather than trusting "spec authored." A static audit would have passed a latently-broken test. This is the same value the p7 live-Playwright pass delivered.
- Verbatim-schema fidelity (8-value enum, `"CLAUDE.md"` dotted) and the sprint_id-from-JSONL footgun — both confirmed clean by AUD#1.

**What this missed:**
- The **archivist's confabulation** (§6 GAP-1) was not caught by any gate — there is no audit on archivist output. ORC caught it manually by cross-reading the registry/log against lived events. A sprint where ORC didn't notice would have shipped a corrupted durable record.
- The **backfill-hook duplication** (§6 GAP-2) is unguarded — no gate validates event-log integrity at wrap; ORC caught it by manual scan.

**Recommendations:**
- Add a lightweight archivist self-check (or an ORC post-archive verification) that every audit-cycle claim in an archive entry has a matching event-log event. (See §6 GAP-1, §10.)
- Treat event-log integrity (no duplicate `(agent, terminal)` pairs) as a wrap-time assertion. (See §6 GAP-2.)

---

## 5. Agent Performance Summary

| Agent | Tasks | First-pass rate | Notes |
|-------|-------|-----------------|-------|
| PM#0/PM#2 | 1 decomp + 1 amendment | 100% | Pre-read all context files; every grep-SC a value-pattern (GAP-1 from p7 genuinely avoided — 0 Critic rounds lost vs p7's 2) |
| CR#1 | 1 | 100% | PASS with 3 warnings; independently re-verified the 4 AppMode sites + connectivityRouter precedent + all 7 grep SCs against live source |
| UI#1 | 1 | 100% | Correct idiom (timeline, not React Flow); caught 3 WCAG contrast issues incl. a pre-existing GraphPage defect |
| BE#1 | 1 | 100% | Verbatim schema; parser extraction; 67/67 tests; ENOENT→NOT_FOUND |
| FE#1 | 1 | 100% (PASS + advisory) | All 4 sites wired; 146-line page; faithful to design spec incl. contrast corrections |
| FE#rem1 | 1 (remediation) | 100% | Test-selector fix, verified 3/3 live |
| AUD#1/AUD#2 | 2 | 100% | Independent; AUD#2's live Playwright pass was the load-bearing gate |
| ARC#1 | 1 | **FAIL (content)** | Logged the completion but confabulated a false env-failure/AUD#3 narrative — see §6 GAP-1 |

**Most impactful single agent action:** AUD#2 running the authored e2e spec *live* — it surfaced the strict-mode selector collision that a static pass would have shipped.

**Recurring failure pattern:** none in the implementing agents. Two *meta-layer* recurrences: read-only/auditor agents self-writing the event log (GAP-3, recurring from p7), and the hook miss-rate (GAP-4, the known ~35%).

---

## 6. Protocol Gaps Identified

> **Code-not-prompt check:** GAP-2 and GAP-3 are deterministic-artifact fixes (hook script + deny-rail), not prompt tweaks. GAP-1 is partly mechanizable (event-log cross-check). GAP-4 is the known hook miss-rate.

| Gap | Impact | Suggested fix |
|-----|--------|---------------|
| **GAP-1: Archivist confabulated a sibling sprint's failure narrative.** ARC#1 wrote into `project_log.md` + `task-registry.md` a detailed but entirely false story — "AUD#2 FAIL → GANDER_ROOT env failure / missing ledger → env fix → AUD#3 PASS" — pattern-borrowed from the *p7* sprint (which really did have an AUD#2-FAIL → FE#rem1 → AUD#3 cycle). p5b had no audit FAIL, no env failure, and no AUD#3. It also invented a schema field (`agent_context optional`) absent from contract §4. | Corrupted the durable record on the way *in*; ORC caught and rewrote it, but a less-attentive close would have shipped false history that future PMs/Critics read as ground truth. | **Route to HR (agent-improvement).** Add to `archivist.md`: (a) "synthesize ONLY from this sprint's artifacts; never import another sprint's audit/remediation narrative"; (b) a mandatory pre-write check — every `AUD#N FAIL`/`AUD#N PASS`/remediation claim in an archive entry MUST have a matching event in `docs/events/*.jsonl` for *this* task_id; (c) never assert schema fields not present in the cited contract. Partly code-able: a deterministic `grep` of claimed audit events against the event log. See §10. |
| **GAP-2: `backfill-autofire.sh` created 5 duplicate COMPLETE events.** Its `(task_id, agent_id)` idempotency key missed existing terminals because ORC SPAWNs carry the sprint-level `task_id` (`gander-studio-p5b-progression-viz`) while hook auto-logs carry the *sub-task* id (`p5b-001-ui`, `p5b-003-fe`, …), and auditors self-log as `AUDITOR#N` vs the SPAWN's `AUD#N`. So it re-logged UI#1, BE… [FE#1], AUD#1, AUD#2, FE#2 as duplicates. | 5 spurious COMPLETEs; ORC had to clean the event log at wrap (removed seqs 19/21/22/23/24). Silent integrity erosion if unnoticed. | **Route to HR — this is a hook-script bug (code-not-prompt).** Fix the idempotency key in `~/.claude/hooks/backfill-autofire.sh`: match on `agent_id` within the sprint window regardless of `task_id` granularity, and treat `AUDITOR#N ≡ AUD#N` (and `FE#rem1 ≡ FE#2`, etc.) as the same logical agent. Alternatively normalize SPAWN/COMPLETE `task_id` to the sprint prefix before keying. |
| **GAP-3: Auditors self-wrote AUDIT_PASS into `docs/events/` (seq 10, 14) as `AUDITOR#N`.** Recurrence of the read-only-agent-writes-eventlog class (p7 §6 GAP-3; p6 incident). The label mismatch (`AUDITOR#N` vs SPAWN `AUD#N`) also *fed* GAP-2's duplication. | Low direct harm here, but it is the standing latent-corruption class and it amplified GAP-2. | Already a pending HR handoff (`docs/agent-improvements/handoff-p6-critic-eventlog-to-gander-2026-05-29.md`): `PreToolUse` deny-rail on `docs/events/*.jsonl` for non-ORC/non-hook writers. This sprint is a fresh recurrence — bump priority. |
| **GAP-4: SubagentStop hook missed CR#1, BE#1, ARC#1 COMPLETEs (~35% known).** ORC/auto-fire backfilled. | Manual/auto backfill ritual at wrap; interacts badly with GAP-2. | Known issue, distinct from seq-integrity. Track; no new fix beyond GAP-2's key correction (which makes the auto-fire reliable). |
| **GAP-5 (minor, environmental): `SendMessage` unavailable this session.** The warning-resolution and FE-remediation rounds had to spawn *fresh* agents (PM#2, FE#2) instead of continuing PM#0/FE#1 with their context intact. | Slightly higher token cost; briefs had to re-establish context. Outcome unaffected. | Not a team-spec gap — a harness capability note. If `SendMessage` is expected, ORC should confirm availability at Step 0.1 alongside the dispatch probe. |

---

## 7. Final Deliverable State

**App/Service:** `~/projects/gander-studio-alpha`
**Build:** `npm run lint` exit 0 (tsc --noEmit ×3); `npm test -w @gander-studio/server` 67/67.
**Runtime:** Confirmed working — auditor live Playwright pass + human Step 4.5 OK. `/progression` renders 6 real entries, zero console errors.

**Features delivered:**
- `progression.getLedger` tRPC query — reads `${GANDER_ROOT}/docs/progression-ledger.md`, parses JSONL-in-markdown (contract §3), validates each entry (`ProgressionEntrySchema.safeParse`, malformed lines skipped non-fatally), returns `ProgressionEntry[]`; ENOENT→`TRPCError NOT_FOUND`.
- `/progression` React route — per-surface XP summary (8 surface pills) + most-recent-first sprint timeline (sprint_id, xp_gained surface/delta, conditional levels_advanced/new_capabilities); FF7 tokens only; new `progression` AppMode + nav tab.

**Key contracts:**
- Consumer contract: `~/.claude/refs/progression-ledger-schema.md` v1.0.0 (single source of truth — schema copied verbatim into `packages/shared/src/schemas.ts`).
- Data source: `${GANDER_ROOT}/docs/progression-ledger.md` (append-only; read-only from Studio).
- `sprint_id` is read from the JSONL block, never the `### Sprint:` header.
- Granularity: ledger data is **per-surface** (8 surfaces) + **per-sprint** — not per-named-agent. The page renders exactly that.

---

## 7b. Progression Ledger Entry (AA-§7)

**sprint_id:** `gander-studio-p5b-progression-viz`

**xp_gained:**
- surface: Connectivity | delta: "progression ledger navigable in Studio — team XP history visible at /progression (per-surface rollup + per-sprint timeline)"

**levels_advanced:**
- "progression-rollout-complete: Phase 5 visualization-side gate closed — ledger (5A, gander repo) + Studio viz (5B) both shipped; the team's accumulated XP is now browsable in Studio"

**new_capabilities:**
- "studio-progression: /progression route + progression.getLedger tRPC consuming progression-ledger-schema.md v1.0.0 — second consumer of a gander control-plane contract after Phase 2's connectivity graph"

**ledger JSONL payload:**
```jsonl
{"sprint_id":"gander-studio-p5b-progression-viz","xp_gained":[{"surface":"Connectivity","delta":"progression ledger navigable in Studio — team XP history visible at /progression (per-surface rollup + per-sprint timeline)"}],"levels_advanced":["progression-rollout-complete: Phase 5 visualization-side gate closed — ledger (5A, gander repo) + Studio viz (5B) both shipped; the team's accumulated XP is now browsable in Studio"],"new_capabilities":["studio-progression: /progression route + progression.getLedger tRPC consuming progression-ledger-schema.md v1.0.0 — second consumer of a gander control-plane contract after Phase 2's connectivity graph"]}
```

> Note: this entry belongs in the **gander** repo's `docs/progression-ledger.md` (the ledger this sprint reads), not the studio repo. Append is a gander-side action — flag for the next gander session, since Studio is read-only against GANDER_ROOT.

---

## 8. Skill-Use Analysis

### 8a. Skill Invocation Log

| Skill | Invocations | Outcome | Owner | Last reviewed | Notes |
|-------|-------------|---------|-------|---------------|-------|
| pm-preflight (pattern, inlined) | 1 | VALUABLE | ORC/PM | 2026-06-01 | GAP-1 (grep-SC false-FAIL) from p7 genuinely avoided — all SCs value-patterns; 0 Critic rounds lost (vs p7's 2) |
| jidoka | 1 (eval) | NOT_TRIGGERED (correctly skipped) | ORC | 2026-06-01 | All facts pre-verified by PM + re-verified by CR#1; skip was correct |
| audit-pipeline | 2 | VALUABLE | AUD#1/2 | 2026-06-01 | Live Playwright pass caught the e2e selector defect a static audit would have shipped |
| requirements-validate | 1 | VALUABLE | ORC | 2026-06-01 | 5/5 COVERED; surfaced the per-surface granularity note |
| env-preflight (inlined via curl) | 1 | VALUABLE | ORC | 2026-06-01 | Confirmed server hot-reloaded the route + GANDER_ROOT correct before the FE audit/human gate |
| backfill-autofire.sh (Stop hook) | 1 | PARTIAL_VALUE | hook | 2026-06-01 | Fired and backfilled the 3 genuinely-missed COMPLETEs, but over-backfilled 5 duplicates — see §6 GAP-2 / §8c |
| convention-detect | 0 | NOT_TRIGGERED | ORC | — | ORC inlined conventions from CLAUDE.md rather than running the skill; acceptable for a well-known repo |
| commit-packet | 0 | NOT_TRIGGERED | ORC | — | ORC committed directly with scoped `git add`; commit-packet's substrate-check not exercised |

### 8b. Obsolescence Candidates

None. No skill produced LOW_VALUE across consecutive sprints.

### 8c. Content-Quality Candidates

| Skill | Deviation observed | Suspected cause | Recommended action |
|-------|--------------------|-----------------|--------------------|
| subagent-complete-backfill / `backfill-autofire.sh` | Auto-fire backfilled duplicate COMPLETEs because its `(task_id, agent_id)` key didn't match existing terminals logged under sub-task ids / `AUDITOR#N` labels | BROKEN_TOOL_REF (idempotency key too strict for sprint-level vs sub-task task_id, and label aliases) | FIX_TOOL_REF — correct the key per §6 GAP-2; route to HR |

### 8d. New Skill Candidates

| Pattern observed | Frequency | Effort | Suggested skill name |
|------------------|-----------|--------|----------------------|
| ORC cross-checking archive-entry claims against the event log to catch confabulation | 1 (this sprint) | LOW | `archive-verify` (or fold into archivist self-check — see §10) |

### 8e. Skill Drift Candidates

| Skill | Drift observed | Suggested fix |
|-------|----------------|---------------|
| **post-mortem (skill IDENTITY drift — HIGH)** | The Phase 3 "after-action rebrand" eliminated the death-frame *in content* (SKILL.md title is "After-Action Skill", output is an "after-action") but **left the skill's identity unchanged**: the skill is still named `post-mortem`, the directory is `~/.claude/skills/post-mortem/`, and the user-invocable command is `/post-mortem`. Net effect surfaced live this session: when the human types "after-action", the harness routes it to a command literally named `post-mortem` — the exact term the team decided to retire. A half-completed rename. Not acceptable in a shipped pipeline product. | **Complete the rename (route through the FULL pipeline — agent/skill-spec work, never quick-route).** Rename the skill dir + command to `after-action` (or alias `after-action` → the existing skill so the trigger matches the term), update the `description`/`When To Use` triggers, and reconcile the `docs/post-mortems/` vs `docs/after-actions/` output-path drift in the same pass. Verify `pm-preflight`/`agent-improvement`/`hone` greps still resolve after the rename. Keep a back-compat alias for `/post-mortem` so muscle memory and existing references don't break. |
| post-mortem (output-path drift) | Canonical output path is `docs/after-actions/`; the gander repo uses it, the studio repo still writes to `docs/post-mortems/`. | Fold into the rename above: finish the path rollout in studio (symlink `docs/post-mortems/ → docs/after-actions/` as gander did) and confirm downstream skills read the actual path. |

### Hand-off to hone

Post-mortem Section 8 complete. 8 skills logged. 0 obsolescence candidates, 1 content-quality candidate (backfill-autofire), 1 new-skill candidate (archive-verify), 2 drift candidates (skill-identity rename [HIGH] + output-path). Run the `hone` skill to act on the skill-rename/path drift. Note: the skill-rename touches `~/.claude/skills/` and a user-invocable command — per the user-level CLAUDE.md it must go through the FULL pipeline, not a quick route. The backfill-autofire fix and the archivist guard are HR/agent-improvement work.

---

## 9. Rule / Ref / CLAUDE.md Delta Proposals

| Target file | Proposed change | Priority | Rationale |
|-------------|-----------------|----------|-----------|
| `~/.claude/skills/post-mortem/` (dir + command + triggers) | **Finish the Phase 3 after-action rename at the identity layer:** rename/alias the skill + `/post-mortem` command to `after-action` so typing "after-action" no longer routes to a command named for the retired death-frame. Full-pipeline change (skill spec). | HIGH | Surfaced live this session — the rebrand renamed the content but not the skill's name/command/dir; a shipped pipeline product shouldn't carry the term it explicitly retired. (See §8e.) |
| `gander-studio-alpha/CLAUDE.md` | Document the cross-repo read pattern + the `~/.claude/refs/` contract dependency (now used by both `connectivity.getGraph` and `progression.getLedger`) under Architecture. | LOW | Two procedures now depend on GANDER_ROOT + a shared refs contract; worth one line so the next engineer doesn't rediscover it. |
| (studio) post-mortem path convention | Reconcile `docs/post-mortems/` vs `docs/after-actions/` (see §8e). | LOW | Cross-repo terminology drift; low harm but a real inconsistency. |

(No `standards.md` deltas this sprint.)

---

## 10. Eval Gap Proposals

| Agent / Skill | Gap description | Suggested eval | Priority |
|---------------|-----------------|----------------|----------|
| archivist | No eval would catch a confabulated archive entry that claims audit cycles / schema fields absent from the sprint's artifacts (§6 GAP-1). | Add an archivist eval scenario: given an event log with only AUDIT_PASS events, an archive entry that asserts an "AUD#N FAIL → AUD#N+1 PASS" cycle or a non-contract schema field must be rejected/flagged. | HIGH |
| backfill-autofire.sh | No eval covers the sprint-level-task_id / sub-task-task_id key mismatch that caused duplicate backfills. | Add a fixture: SPAWN(task_id=sprint) + auto-COMPLETE(task_id=subtask, agent=AUDITOR#1) → backfill must NOT duplicate. | HIGH |

---

## 11. Connectivity Findings

**Analyzer run this sprint:** No — the connectivity-analyzer operates on the gander `.claude/` tree, not the studio app repo. Not applicable to this sprint's deliverables.

Manual observations: none. No broken refs or orphan nodes introduced; the contract `~/.claude/refs/progression-ledger-schema.md` resolves cleanly from the studio repo (verified at dispatch).
