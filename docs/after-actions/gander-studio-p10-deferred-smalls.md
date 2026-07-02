---
type: post-mortem
sprint: gander-studio-p10-deferred-smalls
date: 2026-07-02
head_sha: 88cbebf
gap_classes:
  - stale-ground-fact
  - sc-self-defeating
  - auditor-toolset-gap
  - background-bash-denied
  - subagentstop-miss
  - recurring
recurring_tags:
  - subagentstop-complete-miss
  - background-subagent-bash-denied
related_sprints:
  - "[[gander-studio-p9-sessions-feed-agentstats]]"
  - "[[gander-meta-evolution-p1]]"
status: written
---

# After-Action: gander-studio-p10-deferred-smalls — Deferred-Work Drain (Tooltip Enrichment, Slug-Matcher Anchor, --redb AA Fix)

**Date:** 2026-07-02
**Project:** `/home/jhber/projects/gander-studio-alpha`
**Duration:** ~1h 20m (first SPAWN seq 4 @ 18:58:24Z → REQVAL COMPLETE seq 35, `docs/events/agent-events-2026-07-02.jsonl`). **Caveat:** all 9 subagent COMPLETEs were ORC backfills stamped at backfill time (20:18:35Z), so per-agent ts-deltas are meaningless this sprint; `seq` is the authoritative ordering.
**Final State:** Shipped clean. All three in-scope deferred items (DEFERRED-003/004/006) delivered; audits 3/3 PASS (003 via a round-2 runtime-gate closure); REQVAL COVERED 17/17. Commits `88cbebf` (003), `8495ecc` (004), `4b8fb5c` (006) + ceremony `74213ac` on `feat/studio-sessions-feed-agentstats`, NOT pushed (no per-sprint human opt-in — `.claude/tasks/outputs/gander-studio-p10-deferred-smalls-COMMIT-1783022900.md`).

---

## 1. Original Request

**Human (2026-07-02):** *"do we have things to do in various places? let's do them all"* — ORC-scoped to the three open, unblocked deferred-work items in gander-studio-alpha: DEFERRED-003 (rich hover/focus tooltip on AgentTimeline bars), DEFERRED-004 (event-log slug matcher over-match guard + unit test), DEFERRED-006 (`--redb` token below WCAG AA — remediate). DEFERRED-P9-1 and DEFERRED-001 explicitly excluded per ORC scoping. (Verbatim per REQVAL requirement-sources header, `.claude/tasks/outputs/gander-studio-p10-deferred-smalls-REQVAL-1783022454.md`, and the PM's `verbatim_deliverable_audit`.)

**Brief files:** `.claude/tasks/outputs/gander-studio-p10-deferred-smalls-PM-1783018704.md` (3-packet decomposition + expectation manifest) revised as `...-rev-PM-1783019756.md` (rev1, post-CRITIQUE_BLOCK). Ledger wording: `docs/deferred-work.md` lines 50–62 (003/004), 17–22 (006).

**Scope at intake:**
- 003: the ledger read as "build a rich tooltip," but the native SVG `<title>` was ALREADY replaced by `FF7TooltipPanel` in s4 — the real scope was *enrichment* of the existing panel (exact timestamps, display-local feedback-loop count, audit outcome, `role="tooltip"` a11y wiring). Auditor IDENTITY display declared out of scope (data not on `AgentMarker`).
- 004: the over-match predicate was NOT at "event-log-parser.ts lines 65-66" (stale ORC ground fact) — it had been refactored into `packages/server/src/session-slug-match.ts` `matchesSlug`, and an existing test asserted the over-match as *desired* behavior and had to be flipped.
- 006: ledger-pre-ratified lighten-in-place (`#cf3c3c` 4.07:1 → `#e05555` 5.22:1 on `--void`), plus DESIGN.md doc-sync and a destructive-background regression guard.

**Skill invoked:** dispatch-task pipeline (PM → Critic → parallel FE/BE/FE wave → 3 parallel audits → runtime-gate gap round → REQVAL Mode B → commit-packet → archivist).

---

## 2. Agent Activity Log

All seq references: `docs/events/agent-events-2026-07-02.jsonl` (seq 1–37, single UTC file — no midnight span).

### Phase 0: Ceremony (seq 1–2)

| Seq | Timestamp | Event | Agent | Notes |
|-----|-----------|-------|-------|-------|
| 1–2 | 18:56:52Z | SPAWN/COMPLETE | ORC#0-direct | studio ceremony debt commit (agent-log latest files + program.md + checkpoint) |

### Phase 1: Plan gate — PM → Critic BLOCK → rev1 → Critic PASS (seq 3–7, 27–30)

| Seq | Timestamp | Event | Agent | Notes |
|-----|-----------|-------|-------|-------|
| 3 | 18:58:24Z | PM_PREFLIGHT | ORC#0 | 6 agent remits extracted |
| 4→27 | 18:58:24Z | SPAWN→COMPLETE | PM#0 | 3-packet decomposition, `-PM-1783018704.md`; COMPLETE backfilled |
| 5→28 | 19:09:12Z | SPAWN→COMPLETE | CR#1 | **CRITIQUE_BLOCK** — 1 BLOCKER (006 SC#4 self-defeating) + 4 WARNINGs, `-CR-1783019352.md`; backfilled |
| 6→29 | 19:15:56Z | SPAWN→COMPLETE | PM#0 | rev1 — SC-level amendments only, no re-partition, `-rev-PM-1783019756.md`; backfilled |
| 7→30 | 19:19:56Z | SPAWN→COMPLETE | CR#1 | **CRITIQUE_PASS** — all 5 items confirmed resolved, no new defects, `-cr2-CR-1783019996.md`; backfilled |

**The Critic catch (the sprint's most consequential planning event):** packet 006 was internally self-defeating — CHANGE 2 instructed the FE to append a Decision Record D *recording* the old literals `#cf3c3c`/`4.07:1`, while SC#4 mandated whole-file `grep -c == 0` for those exact tokens. A faithful deliverable could not satisfy its own SC. The `sc-locked-value-consistency` precheck ran clean both rounds (16 cmds, 0 findings) because prose CHANGE-instructions are outside its locked-frontmatter extraction class — the mandated *manual* Critic fallback scan caught it (`-CR-1783019352.md`, BLOCKER description; pattern class from gander-meta-onboard-skill §6 Gaps 1–2). rev1 adopted the Critic's option (a): live-site update + historical-record containment exception, which AUD#3 later enforced as a containment check, not a naive count-0.

### Phase 2: Implementation wave — 3 parallel packets (seq 8–10, 31–33)

| Seq | Timestamp | Event | Agent | Notes |
|-----|-----------|-------|-------|-------|
| 8→31 | 19:22:53Z | SPAWN→COMPLETE | FE#1 | 003 tooltip enrichment — `AgentTimeline.tsx` only; tsc ×3 clean + build pass, `-003-FE-1783020173.md`; backfilled |
| 9→32 | 19:22:53Z | SPAWN→COMPLETE | BE#1 | 004 matchesSlug anchor + tests — vitest 141/141 green, `-004-BE-1783020173.md`; backfilled |
| 10→33 | 19:22:53Z | SPAWN→COMPLETE | FE#2 | 006 --redb #e05555 + DESIGN.md 3 live sites + DR-D, `-006-FE-1783020173.md`; backfilled |

### Phase 3: Audit wave — 3 parallel auditors (seq 11–19)

| Seq | Timestamp | Event | Agent | Notes |
|-----|-----------|-------|-------|-------|
| 11–13 | 19:28:49Z | SPAWN ×3 | AUD#1/#2/#3 | inline verdicts expected; ORC persists (code-auditor has no Write) |
| 14–15 | 19:35:46Z | AUDIT_PASS + COMPLETE | AUD#2 | 004 SA/QA/SX PASS — vitest 141/141 independently re-run, `-004-AUD-1783020529.md` |
| 16–17 | 19:35:46Z | AUDIT_PASS + COMPLETE | AUD#3 | 006 SA/QA/SX PASS — 5.22:1 independently re-derived; DR-D containment check applied correctly, `-006-AUD-1783020529.md` |
| 18–19 | 19:35:46Z | NOTE + COMPLETE | AUD#1 | 003 **INDETERMINATE** — SA PASS / SX SECURE / QA-static PASS, but runtime a11y gates (SC#4 live render + SC#8 aria-describedby toggle) unverifiable: AUD#1's MCP Playwright toolset has NO interaction primitive; handed back per audit-pipeline §2.3(b), `-003-AUD-1783020529.md` |

### Phase 4: Runtime-gate closure — ghost round, gap2, re-audit (seq 20–25)

| Seq | Timestamp | Event | Agent | Notes |
|-----|-----------|-------|-------|-------|
| 20 | 19:36:01Z | SPAWN | FE#1 (-gap) | runtime-gate closure via SendMessage background resume |
| 21 | 19:37:28Z | NOTE | ORC#0 | **-gap round aborted:** background resume got Bash auto-denied (known constraint) — no output; genuine ghost, NOT backfilled |
| 22→34 | 19:37:28Z | SPAWN→COMPLETE | FE#3 (-gap2) | fresh **foreground** re-dispatch: extended `s3-t3-timeline.spec.ts` with 4 runtime assertions, ran headless — 4/4 green; also root-caused 5 pre-existing test failures (fixture staleness → DEFERRED-P10-1), `-003-gap2-FE-1783021048.md`; backfilled |
| 23→25 | 19:58:09Z | SPAWN→AUDIT_PASS→COMPLETE | AUD#1 | round-2 **PASS** — both runtime gates closed on the 4/4 green evidence, verified against the actual working-tree spec, `-003-reaudit-AUD-1783022289.md` |

### Phase 5: Close — REQVAL → backfill → commit → archive (seq 26–37)

| Seq | Timestamp | Event | Agent | Notes |
|-----|-----------|-------|-------|-------|
| 26→35 | 20:00:54Z | SPAWN→COMPLETE | RV#1 | requirements-validate Mode B: **COVERED 17/17** (0 PARTIAL, 0 MISSING), evidence independently re-verified on the live tree, `-REQVAL-1783022454.md`; backfilled |
| 27–35 | 20:18:35Z | COMPLETE ×9 | (backfill) | ORC backfilled ALL 9 foreground subagent COMPLETEs — SubagentStop hook auto-logged none this sprint (see §6 G5); 1 genuine ghost (seq 20) correctly excluded |
| — | 19:48Z | commit | ORC (commit-packet) | `74213ac` ceremony + `8495ecc`/`4b8fb5c`/`88cbebf` feature commits, `-COMMIT-1783022900.md` |
| 36 | 20:19:01Z | SPAWN | AR#1 | archive entry appended to `docs/project_log.md` (SPRINT_COMPLETE, 2026-07-02T19:50:00Z) |
| 37 | 20:40:07Z | SPAWN | AA#1 | this after-action |

**Feedback loops:** 1 Critic block (plan-stage, correct — resolved in one revision) + 1 audit round-2 on 003 (runtime-gate closure, **not** a code defect: AUD#1 round 1 explicitly found "no code remediation indicated"; the gap round added only a test file) + 1 aborted ghost round (-gap, substrate constraint, zero rework cost beyond a fresh spawn). **Zero AUDIT_FAIL events in the trace** — the remediation-output glob `.claude/tasks/outputs/gander-studio-p10-deferred-smalls-*-remediate*.md` returns zero files; no code remediation cycle occurred (recorded per after-action Step 2e).

**Root cause of failure(s):** none at execution. The three near-misses were caught upstream or absorbed: the self-defeating SC (Critic, pre-code), the two stale ORC ground facts (PM read-evidence, pre-decomposition), and the unreachable runtime gate (auditor refused a static wave-through and the §2.3(b) hand-back closed it properly).

**Deviation from PM brief:** none in delivered scope. The gap round (FE#3 extending `s3-t3-timeline.spec.ts`) was AUD#1's mandated closure path, not scope drift; 003's `estimated_new_lines` was honored; auditor-identity display stayed excluded per the decomposition's `out_of_scope` ruling (REQVAL interpretation note I-1).

---

## 3. Post-Delivery: Runtime Bugs (if any)

None as of this writing. Every packet was runtime- or independently-verified before commit: 003 via 4/4 green headless Playwright against the live dev server (gap2 packet §3) plus human visual check on the live branch (AR entry "NO POST-DELIVERY BUGS," `-AR-1783023541.md`); 004 via AUD#2's independent 141/141 vitest re-run; 006 via AUD#3's independent contrast re-derivation (5.2245 ≈ 5.22:1).

One pre-existing (not post-delivery, not caused by this sprint) defect was *discovered* mid-sprint by FE#3: the 5 pre-existing tests in `s3-t3-timeline.spec.ts` fail against a live env because their pinned fixture sessions (2026-05-06 / late-May) have aged out of `session.list`'s hardcoded top-50 date-descending window. Root-caused to `packages/client/src/hooks/useSessions.ts` + `packages/server/src/session-list.ts`, adjudicated non-blocking by AUD#1 (advisory, `blocking="false"`), and routed to the ledger as **DEFERRED-P10-1** (`docs/deferred-work.md` §Sprint gander-studio-p10-deferred-smalls) rather than fixed unilaterally out of scope. This is a slow-burn test time-bomb class worth naming: date-descending-window fixture pinning silently expires.

---

## 4. QA Gap Analysis

**Current QA protocol:** Critic plan-gate (with sc-precheck script + mandated manual locked-value fallback) → per-packet independent audit (SA/QA/SX) by code-auditor spawns under audit-pipeline 2.7.0's Bash/Write-denied split (ORC runs shell evidence, auditors adjudicate inline, ORC persists verdicts) → requirements-validate Mode B → commit-packet scope enforcement.

**What this caught:**
- **Critic caught a self-defeating SC at plan stage** (006 SC#4: DR-D must record the old literals the whole-file count-0 grep forbids) — the highest-probability audit failure, killed before any code (`-CR-1783019352.md` BLOCKER; `audit_risk_forecast` item 1).
- **Critic caught a stale-closure trap pre-code** (computing marker derivations inside the empty-dep `showTooltip` useCallback would capture a first-render map) — converted into a hard constraint + SC#6, which FE#1 satisfied and AUD#1 independently verified (round-1 SC#6 PASS, zero `markersByAgent` references in the callback body).
- **Critic caught two vacuous greps** (003 SC#4's tokens pre-exist in the marker switches; 006 SC#2's case-sensitive `below AA` returns 0 pre-edit) — both re-anchored on discriminating checks in rev1.
- **AUD#1 refused a static wave-through of a mandated runtime gate** — INDETERMINATE, not PASS, when its toolset could not prove the aria-describedby active-only toggle; the §2.3(b) hand-back produced real runtime evidence (4/4 green) before the PASS. The gate held its shape under tooling pressure.
- **AUD#2 independently re-ran the vitest suite** (141/141) rather than trusting the packet's pasted output; **AUD#3 independently re-derived the contrast math** (5.2245:1) and applied SC#4 as a containment check, not the naive count-0 the Critic warned against.
- **PM read-evidence caught two stale ORC ground facts** before decomposition (tooltip already built in s4; matcher relocated to `session-slug-match.ts` + a test asserting the bug as desired) — without which packets 003/004 would have shipped broken investigation paths.
- **FE#3 root-caused the 5 pre-existing e2e failures** (fixture-window staleness) instead of hacking around them or absorbing them into scope — confirmed via direct tRPC queries, flagged to ORC, routed to DEFERRED-P10-1.

**What this missed (process-shape misses; nothing shipped defective):**
- **sc-precheck is structurally blind to prose-instruction contradictions.** It ran clean twice (16 cmds, 0 unsat/0 self-defeating) while the DR-D BLOCKER sat in plain sight — the contradiction lives between a prose CHANGE-instruction and an SC, outside the script's locked-frontmatter extraction class. The manual Critic fallback is currently the only defense for this class.
- **AUD#1's MCP Playwright toolset cannot interact.** navigate/snapshot/console/wait/screenshot only — no click/hover/focus/press/evaluate — and the Sessions view is client-state routed (not URL-addressable), so the auditor could not reach the timeline at all. The mandated runtime a11y gate was unverifiable *by the auditor directly* by construction, not by circumstance.
- **The SubagentStop hook auto-logged zero of 9 foreground COMPLETEs** (cross-project session: main-session cwd = gander, agents working in studio-alpha). Under-log only — the backfill backstop reconstructed all 9 with outputs confirmed on disk — but observability regressed to manual for the entire sprint.

**Recurring-class table (this sprint's sightings vs. known classes):**

| Class | This sprint | Prior sightings | Status |
|-------|-------------|-----------------|--------|
| subagentstop-complete-miss | 9/9 foreground COMPLETEs missed (suspected cross-project attribution — NEW sub-class) | decorated/meta-agent class (DEFERRED-012); firstmatch-miskey; inline-verdict class (gander-meta-evolution-p1 §6 G4) | RECURRING — route to gander hook batch (§6 G5, §9 row 2) |
| background-subagent-bash-denied | -gap ghost round (seq 20–21, SendMessage resume); AUD#1 round-2 resume ran Bash/Write-denied (verdict still landed inline) | gander-meta-evolution-p1 (auditor ghosts seq 68–70, 92); memory `reference_background_subagent_bash_denied` | RECURRING — known constraint; this sprint's -gap routing violated it (§6 G4) |
| sc-self-defeating (authored-deliverable-vs-SC) | 006 SC#4 DR-D contradiction (caught pre-code) | gander-meta-onboard-skill §6 Gaps 1–2 | RECURRING pattern class — sc-precheck still cannot see it (§6 G2) |
| stale-ground-fact in ORC brief | 2 of 3 ground facts stale (003 tooltip, 004 matcher location) | — (first named sighting in this project) | NEW — §6 G1 |

**Recommendations:** see §6 suggested fixes and §9 rows — codify CLI-Playwright (not MCP-Playwright) for runtime-interaction audit duties; extend or explicitly bound sc-precheck's class; take the cross-project hook miss to HR; ban Bash-requiring work on background resumes.

---

## 5. Agent Performance Summary

Token accounting: no sprint report exists for this slug (`docs/sprint-reports/` has no p10 entry) and all 9 COMPLETE events are ORC backfills without `tokens` fields — per-agent token attribution is genuinely unavailable this sprint, not omitted. Run `sprint-report` retroactively if needed; it will inherit the same gap.

| Agent | Tasks | First-pass rate | Notes |
|-------|-------|----------------|-------|
| PM#0 | 1 decomposition + 1 revision | n/a | Caught both stale ORC ground facts via read-evidence (cost: 12 reads vs soft-8, declared + justified in routing_notes); authored the one BLOCKER (self-defeating SC); rev1 resolved all 5 Critic items in one pass |
| CR#1 | 2 rounds | 100% (the block was a real, pre-code-fatal defect) | Highest-value agent this sprint — BLOCKER + 4 substantive warnings incl. the stale-closure trap; cr2 re-gate confirmed all resolutions with zero new defects |
| FE#1 (003) | 1 | 100% code-correct (round-2 audit added test evidence only — "no code remediation indicated," round-1 verdict) | Honored the stale-closure hard constraint and a11y architecture change exactly; honest about what its toolset could not verify (SC#8 left to auditor) |
| BE#1 (004) | 1 | 100% | Clean anchored predicate + flipped stale assertion + 3 new guards; scoped-diff discipline under a dirty parallel working tree (documented rather than absorbed) |
| FE#2 (006) | 1 | 100% | Ledger-ratified value applied; DR-D containment executed exactly as the amended SC required; regression guard recorded |
| FE#3 (003-gap2) | 1 | 100% | Exemplary gap-closure: test-file-only scope, 4/4 green, plus root-caused and routed the pre-existing fixture staleness instead of ignoring or over-fixing it |
| AUD#1 | 2 rounds (003) | n/a | Correct INDETERMINATE posture — refused static PASS on an unverifiable runtime gate; round-2 verified assertions against the working tree, not just the packet |
| AUD#2 (004) | 1 | first-pass PASS | Independent vitest re-run (141/141) |
| AUD#3 (006) | 1 | first-pass PASS | Independent contrast re-derivation; containment check applied per the amended SC |
| RV#1 | 1 | COVERED 17/17 | Mode B — evidence independently re-verified on the live tree; I-1 interpretation note cleanly separates intentional exclusion from MISSING |

**First-pass rate: 100% across all implementing tasks** — zero AUDIT_FAIL events, zero remediation files. The 003 second audit round was an evidence-gathering round, not a fix cycle.

**Most impactful single agent action:** CR#1's round-1 BLOCKER — identifying that packet 006's own success criterion made its own deliverable impossible (DR-D historical record vs whole-file count-0 grep), a defect the mechanical precheck is structurally unable to see, before any agent wrote a line.

**Recurring failure pattern:** the SubagentStop COMPLETE-miss family grew a suspected new sub-class this sprint — **cross-project attribution miss** (main session cwd = gander, subagents working in studio-alpha; all 9 foreground COMPLETEs missed, backfilled seq 27–35). This is distinct from the known decorated/meta-agent, firstmatch-miskey, and inline-verdict classes. Also recurring: Bash-denial on background resumes (the -gap ghost). Both named in frontmatter `recurring_tags`.

---

## 6. Protocol Gaps Identified

> Code-not-prompt check applied to each row below.

| Gap | Impact | Suggested fix |
|-----|--------|---------------|
| **G1 — ORC ground facts in the PM brief were stale twice.** The brief asserted the 003 tooltip needed building (already implemented in s4 as `FF7TooltipPanel`) and located the 004 over-match at "event-log-parser.ts lines 65-66" (refactored into `session-slug-match.ts`, with an existing test asserting the bug as desired behavior). PM's read-evidence protocol caught both (`-PM-1783018704.md` routing_notes "Stale-ground-fact surfaces"; CR#1 confirmed both corrections correct on disk). | Cost 4 extra PM reads (12 vs soft-8, over-cap declared); without the catch, two of three packets would have dispatched with broken investigation paths. | ORC briefs should tag each ground fact with provenance (`verified-on-disk YYYY-MM-DD` vs `recalled/paraphrased`), so the PM knows which facts to re-verify first. Keep the PM read-evidence mandate as the backstop — it worked. Route to orchestrator.md brief-construction step. |
| **G2 — PM authored a self-defeating SC; the mechanical precheck cannot see the class.** 006 SC#4 (whole-file `#cf3c3c`/`4.07:1` count-0) contradicted CHANGE 2 (DR-D must record those literals). `sc-locked-value-consistency` ran clean both rounds — prose CHANGE-instruction contradictions are outside its locked-frontmatter extraction class. The manual Critic fallback caught it (2nd sighting of the class after gander-meta-onboard-skill §6 Gaps 1–2). | Highest-probability audit failure had it dispatched: 006 would have failed SA/QA on its own SC regardless of execution quality. | Two-part: (a) document the **historical-record exception** pattern in the PM spec / sc-locked-value-consistency SKILL.md — changelog-class deliverables must never be gated by whole-file count-0 greps on superseded values; (b) either extend the sc-precheck extraction class to flag "SC forbids token that a CHANGE-instruction requires emitting," or explicitly document the class as manual-fallback-only so no one mistakes a clean script run for full coverage. Route to HR (skill edit) — partially a script (code-not-prompt) fix. |
| **G3 — Auditor's MCP Playwright toolset has no interaction primitives, making mandated runtime gates auditor-unverifiable by construction.** AUD#1's set is navigate/snapshot/console/wait/screenshot/close — no click/hover/focus/press/evaluate — and the Sessions view is client-state routed (not URL-addressable), so the runtime a11y gate (SC#4 render + SC#8 toggle) could not be exercised at all from the audit spawn (`-003-AUD-1783020529.md` runtime_gate reason). Resolved correctly via audit-pipeline §2.3(b) hand-back: FE#3 encoded the gates as e2e assertions and ran them headless via CLI (`npx playwright test`), AUD#1 re-adjudicated on the evidence. | One extra audit round + one gap packet per runtime-gated FE task, every time — deterministic, not incidental, until routed by default. | Codify in auditor.md / audit-pipeline SKILL.md: **runtime interaction/a11y duties are closed via CLI Playwright (headless e2e run by a Bash-capable implementing agent), not MCP-Playwright** — the MCP set is for read-only load/console/screenshot checks. Make §2.3(b) hand-back the *default* routing for interaction-class runtime SCs rather than a discovered fallback (this sprint is the load-bearing precedent — AR entry "DECISION OF NOTE"). See §9 row 1. |
| **G4 — Bash-requiring gap work was routed through a background resume and ghosted.** The -gap round (SendMessage background resume of FE#1) got Bash auto-denied — a *known* constraint (memory `reference_background_subagent_bash_denied`) — producing a genuine ghost (seq 20–21, NOTE-documented, correctly not backfilled). Recovered in ~90s by a fresh foreground spawn (-gap2, FE#3). | One ghost round; minimal wall-clock cost this time, but the routing error class will recur wherever gap work needs a shell. | Add a hard routing rule to dispatch-task / orchestrator.md gap-round guidance: **never route Bash-requiring gap/remediation work through background resumes; fresh foreground spawn is the sanctioned path.** The constraint is already in memory — promote it from memory to spec so it binds at dispatch time. See §9 row 3. |
| **G5 — SubagentStop hook auto-logged ZERO of 9 foreground subagent COMPLETEs this sprint.** Cross-project session shape: main session cwd = gander (`docs/SESSION-CHECKPOINT.md` modified in gander per git status) while all agents worked in studio-alpha; every foreground COMPLETE (PM ×2, CR ×2, FE ×3, BE ×1, RV ×1) was missed and ORC-backfilled at seq 27–35 (backfill scan report, `-COMMIT-1783022900.md`: 9 unmatched SPAWNs, outputs confirmed on disk, 1 genuine ghost excluded). Suspected project-attribution miss class — distinct from the known decorated/firstmatch/inline-verdict classes. | Observability regressed to fully-manual for an entire sprint; the backfill backstop held, but a sprint without a diligent Step-3.7 pass would have 9 orphan SPAWNs. | **Code-not-prompt: this is a hook defect, not an instruction gap.** Route to HR / the gander hook batch: reproduce the cross-project shape (hook `--self-test` extension or fixture), check `resolve-project-root.sh` precedence behavior when main-session cwd ≠ agent working dir, and fix `~/.claude/hooks/subagent-autocomplete.sh`. See §9 row 2 and §10. |

---

## 7. Final Deliverable State

**App/Service:** `/home/jhber/projects/gander-studio-alpha` (branch `feat/studio-sessions-feed-agentstats`; commits `74213ac` ceremony + `8495ecc` 004 + `4b8fb5c` 006 + `88cbebf` 003; NOT pushed — human runs `git push origin feat/studio-sessions-feed-agentstats`)
**Build:** `tsc --noEmit` clean ×3 (shared/server/client); `npm run build -w @gander-studio/client` passing (vite, "✓ built in 10.26s").
**Runtime:** confirmed working — server tests 141/141 green (independently re-run by AUD#2); 4 new tooltip e2e tests green headless against the live dev server; human visual check on the live branch confirmed tooltip rendering, color change, and a11y markers (AR entry). Known non-blocking issue: 5 pre-existing e2e tests fail on stale fixtures → DEFERRED-P10-1.

**Features delivered:**
- 003: `FF7TooltipPanel` enriched — exact spawn/complete timestamps (orphan bars render "in progress"), display-local `feedbackLoops` count, `auditOutcome` (`'pass'|'fail'|'mixed'|'none'`) with token coloring, panel root `role="tooltip"` + `id="timeline-tooltip"`, active-bar-only `aria-describedby` with `aria-label` preserved. Plus 4 new e2e a11y/content tests in `s3-t3-timeline.spec.ts`.
- 004: `matchesSlug` anchored to `taskId === slug || taskId.startsWith(slug + '-')`; stale over-match assertion flipped; 3 new guard assertions (exact, boundary-prefix, p2-vs-p20).
- 006: `--redb` `#cf3c3c` → `#e05555` (4.07:1 → 5.22:1 on `--void`, AA PASS); DESIGN.md 3 live sites synced + Decision Record D appended (old literals contained to DR-D only).

**Key contracts the next engineer needs:**
- `matchesSlug` (`packages/server/src/session-slug-match.ts`) is now **boundary-anchored**: a slug matches only itself or `slug + '-'`-prefixed task_ids. Substring matching is intentionally rejected — do not "loosen it back" to fix a discovery gap.
- `--redb` is multi-use (destructive text token AND SEAM-06 graphical marker color); the `--destructive: var(--redb)` mapping is unchanged. Any future change must re-run the text-vs-graphical dual-threshold check (4.5:1 / 3:1) and the destructive-background regression guard.
- Tooltip `feedbackLoops` is a **display-local** derivation — explicitly NOT the authoritative SEAM-04/session-stats counter; divergence in edge cases is expected, not a bug. Auditor IDENTITY is not on `AgentMarker`; surfacing it needs new data plumbing (new deferred entry if wanted).
- Stale-closure invariant in `AgentTimeline.tsx`: `showTooltip` is a pure setter with empty deps — marker-derived values must be computed at the bar-group call site from row-local `agentMarkers` and passed in. Never reference `markersByAgent` inside the callback.
- E2e fixture pinning: `session.list` is a hardcoded top-50 date-descending window — pinned fixture sessions **expire**. New tests should use the exact-match navigator pattern (`navigateToAnalyzeTabExact`) and currently-live, no-longer-mutating fixtures (see gap2 packet §2 / DEFERRED-P10-1).

---

## 7b. Progression Ledger Entry (AA-§7)

**sprint_id:** `gander-studio-p10-deferred-smalls`

**xp_gained:**
- surface: Skills | delta: audit-pipeline §2.3(b) runtime-gate hand-back exercised end-to-end for the first time (INDETERMINATE → e2e spec extension → headless CLI run → round-2 PASS) — load-bearing precedent for a11y-heavy work
- surface: Skills | delta: Critic manual fallback caught a self-defeating SC the sc-precheck script is structurally blind to (2nd sighting of the authored-deliverable-vs-SC class)
- surface: Hooks | delta: new suspected SubagentStop miss class named (cross-project attribution — 9/9 foreground COMPLETEs missed, backfill backstop held)

**levels_advanced:**
- Plan-gate rigor: a dispatch-fatal SC contradiction killed pre-code, resolved in one revision, re-gated clean
- Audit integrity under tooling constraints: auditor refused static PASS on an unverifiable runtime gate instead of waving it through

**new_capabilities:**
- AgentTimeline tooltip now surfaces per-agent runtime facts (exact timestamps, loop count, audit outcome) with proper `role="tooltip"`/`aria-describedby` semantics, runtime-proven by 4 new e2e assertions

```jsonl
{"sprint_id":"gander-studio-p10-deferred-smalls","xp_gained":[{"surface":"Skills","delta":"audit-pipeline 2.3(b) runtime-gate hand-back exercised end-to-end (INDETERMINATE -> e2e extension -> headless run -> round-2 PASS)"},{"surface":"Skills","delta":"Critic manual fallback caught a self-defeating SC outside sc-precheck's extraction class (2nd sighting)"},{"surface":"Hooks","delta":"new suspected SubagentStop cross-project attribution miss class named (9/9 foreground COMPLETEs backfilled)"}],"levels_advanced":["plan-gate killed a dispatch-fatal SC contradiction pre-code","auditor held INDETERMINATE posture on an unverifiable runtime gate instead of static wave-through"],"new_capabilities":["timeline tooltip surfaces exact timestamps, loop count, audit outcome with role=tooltip/aria-describedby semantics, runtime-proven by 4 e2e assertions"]}
```

---

## 8. Skill-Use Analysis

> This section is hone's primary input. Run `hone` after this post-mortem if any table below has rows.

### 8a. Skill Invocation Log

| Skill | Invocations | Outcome | Owner | Last reviewed | Notes |
|-------|-------------|---------|-------|---------------|-------|
| convention-detect | 1 (reused) | VALUABLE | ORC | NEVER | <24h-rule variant — reused the prior scan instead of re-running; downstream agents worked from consistent grounding at zero rescan cost |
| pm-preflight | 1 | VALUABLE | ORC | NEVER | PM_PREFLIGHT seq 3; PM acknowledged all 4 recurring-pattern tokens (OVERSCOPED, DRY, aas-3-legacy-envelope, subagentstop-complete-miss) in routing_notes and demonstrably avoided each |
| sc-locked-value-consistency | 2 (both plan rounds) | PARTIAL_VALUE | ORC/Critic | NEVER | Clean both rounds (16 cmds, 0 findings) but structurally missed the DR-D self-defeating class — prose CHANGE-instruction contradictions are outside its extraction class; manual Critic fallback carried the catch. Log in 8c |
| assign-agents | 1 | VALUABLE | ORC | NEVER | Expectation manifest (rev1) with per-packet receipt_check items; all three return packets matched their expected shapes |
| capability-preflight | 3 | VALUABLE | ORC | NEVER | 3× PROCEED for the implementation wave — all three implementing agents completed with their granted toolsets. Note: it does not (and did not claim to) cover the *auditor's* runtime toolset, which is where the G3 gap materialized |
| audit-pipeline (2.7.0) | 3 packets + 1 re-audit | VALUABLE | ORC | NEVER | The Bash/Write-denied-auditor split (ORC evidence → inline adjudication → ORC persist) was exercised as designed and worked for all 4 audit rounds; §2.3(b) runtime-gate hand-back proved out end-to-end on 003 |
| requirements-validate (Mode B) | 1 | VALUABLE | ORC | NEVER | COVERED 17/17 with live-tree re-verification; the I-1 interpretation note is the right mechanism for intentional exclusions vs MISSING |
| commit-packet (two-commit) | 1 (ceremony + 3 feature commits) | VALUABLE | ORC | NEVER | Scoped staging under a 3-packet dirty tree; secret grep clean; task/Audit trailers on all three feature commits |
| subagent-complete-backfill (manual branch) | 1 | VALUABLE | ORC | NEVER | 9 missed COMPLETEs backfilled with on-disk output confirmation; 1 genuine ghost correctly distinguished and excluded — the backstop that kept observability whole this sprint |
| log-event (flock helper) | ~37 events | VALUABLE | ORC | NEVER | Monotonic seq, no duplicates, no collisions across parallel auditor verdicts + 9-event backfill batch |
| after-action | 1 | VALUABLE | AA | NEVER | this document |

### 8b. Obsolescence Candidates

| Skill | Consecutive non-value sprints | Evidence | Recommended action |
|-------|------------------------------|----------|--------------------|
| _none_ | — | — | — |

### 8c. Content-Quality Candidates

| Skill | Deviation observed | Suspected cause | Recommended action |
|-------|--------------------|----------------|--------------------|
| sc-locked-value-consistency | Script reported clean while a dispatch-fatal self-defeating SC existed; the Critic's manual fallback scan (mandated in the SKILL) had to carry the entire class — 2nd sighting (gander-meta-onboard-skill §6 Gaps 1–2, now p10 006 SC#4) | OVER_SPECIFIED extraction class relative to its implied coverage — prose CHANGE-instruction vs SC contradictions are invisible to it, but a clean run *reads* like full coverage | CLARIFY + extend: (a) state the class boundary explicitly in SKILL.md output ("clean = locked-frontmatter class only"); (b) evaluate adding an authored-deliverable-vs-SC contradiction check (SC forbids a token a CHANGE-instruction requires emitting) |
| audit-pipeline | §2.3(b) hand-back worked but was *discovered* routing: the sprint spent a full audit round learning that MCP-Playwright cannot close interaction-class runtime gates | AMBIGUOUS_STEP — the SKILL does not name which runtime-SC classes are auditor-closable (read-only MCP checks) vs implementing-agent-closable (CLI Playwright) | CLARIFY — add the toolset-class routing table so interaction/a11y runtime SCs route to §2.3(b) at packet-authoring time, not after an INDETERMINATE (see §6 G3, §9 row 1) |

### 8d. New Skill Candidates

| Pattern observed | Frequency in sprint | Effort to encode as skill | Suggested skill name |
|-----------------|---------------------|--------------------------|---------------------|
| _none_ — the runtime-gate closure pattern is best encoded as audit-pipeline routing guidance (8c row 2), not a separate skill | — | — | — |

### 8e. Skill Drift Candidates

| Skill | Drift observed | Suggested fix |
|-------|---------------|---------------|
| _none_ | — | — |

### Hand-off to hone

Post-mortem Section 8 complete. 11 skills logged. 0 obsolescence candidates, 2 content-quality candidates (sc-locked-value-consistency, audit-pipeline), 0 new skill candidates, 0 drift candidates. Run the `hone` skill to act on these findings.

---

## 9. Rule / Ref / CLAUDE.md Delta Proposals

> Cross-reference: rule proposals targeting standards.md feed the quarterly HR review per .claude/rules/standards.md ## Rule-Improvement Loop.
> Cross-reference: CLAUDE.md proposals require human ratification before HR applies them — see projects/gander/CLAUDE.md ## CLAUDE.md Delta-Proposal Process.

| Target file | Proposed change | Priority | Rationale |
|-------------|----------------|----------|-----------|
| `.claude/agents/code-auditor.md` + `.claude/skills/audit-pipeline/SKILL.md` | Name the auditor-Playwright toolset boundary explicitly: the MCP-Playwright set (navigate/snapshot/console/wait/screenshot) is read-only and CANNOT close interaction-class runtime SCs (hover/focus/click/attribute-toggle assertions). Route those SCs to §2.3(b) hand-back → implementing agent extends/authors an e2e spec and runs it headless via CLI (`npx playwright test`) → auditor re-adjudicates on the run evidence. Make this the default routing declared at packet-authoring time (PM/Critic name the runtime-gate owner), not a discovered fallback. | HIGH | §6 G3: this sprint proved the pattern end-to-end (003 INDETERMINATE → gap2 → round-2 PASS) and the AR entry marks it a load-bearing precedent — encode it so the next a11y-gated sprint doesn't spend a round rediscovering it. |
| `~/.claude/hooks/subagent-autocomplete.sh` (gander hook batch; route to HR) | Investigate + fix the suspected cross-project attribution miss: with main-session cwd = gander and subagents working in a sibling project, the hook auto-logged 0 of 9 foreground COMPLETEs this sprint (all backfilled, seq 27–35). Reproduce via a `--self-test`-style cross-project fixture; check `resolve-project-root.sh` precedence when payload cwd ≠ session cwd. | HIGH (human-ratify — hook edit is team blast-radius) | §6 G5: full-sprint observability regression; the backfill backstop held but is manual. New sub-class of the known COMPLETE-miss family — fits the standing "gander hook batch" candidate list. |
| `.claude/skills/dispatch-task/SKILL.md` (or orchestrator.md gap-round guidance) | Hard routing rule: never dispatch Bash-requiring gap/remediation work via SendMessage background resume (Bash is auto-denied for background subagents); fresh foreground spawn is the sanctioned path. | MEDIUM | §6 G4: known constraint (memory `reference_background_subagent_bash_denied`) was violated in routing this sprint, producing a ghost round (seq 20–21). Promote from memory note to binding spec text. |
| `.claude/skills/sc-locked-value-consistency/SKILL.md` (+ PM spec SC-authoring guidance) | (a) State the extraction-class boundary in the script's clean-run output ("0 findings = locked-frontmatter class only; prose-instruction contradictions require the manual Critic fallback"); (b) document the **historical-record exception** SC pattern: changelog/decision-record deliverables must be gated by containment checks, never whole-file count-0 greps on superseded values. | MEDIUM | §6 G2: 2nd sighting of the self-defeating-SC class the script cannot see; a clean script run must not read as full coverage. |
| `~/.claude/agents/orchestrator.md` (brief construction) | Tag every ground fact in an orchestrator_brief with provenance: `verified-on-disk YYYY-MM-DD` vs `recalled/paraphrased — PM must re-verify`. | LOW | §6 G1: 2 of 3 ground facts were stale; PM read-evidence caught both but spent 4 over-cap reads doing so. Provenance tags let the PM triage verification instead of re-checking everything. |

---

## 10. Eval Gap Proposals

| Agent / Skill | Gap description | Suggested eval | Priority |
|---------------|----------------|----------------|----------|
| critic | No eval asserts the Critic catches an authored-deliverable-vs-SC contradiction (this sprint's highest-value catch; the mechanical precheck is blind to the class by design) | Fixture decomposition where a CHANGE-instruction requires emitting a token an SC's whole-file count-0 grep forbids → expect BLOCK naming the contradiction | MEDIUM |
| sc-locked-value-consistency | Script's test fixtures do not cover the prose CHANGE-instruction vs SC contradiction class (2 real sightings now) — either as a detected case (if class extended per §9 row 4) or as an explicitly-documented out-of-class case | Add the p10-006 SC#4 shape as a fixture; assert either a self-defeating finding (extended class) or a documented "out-of-class — manual fallback required" marker in output | MEDIUM |
| subagent-autocomplete.sh (hook) | No self-test covers the cross-project session shape (main cwd ≠ agent working dir) that missed 9/9 COMPLETEs this sprint | Extend the hook `--self-test` (shipped in gander-meta-evolution-p1) with a cross-project fixture: SPAWN logged in sibling-project event log, hook fires with session cwd = gander → assert COMPLETE lands in the sibling's log | HIGH |
| code-auditor | No eval asserts the INDETERMINATE posture: a mandated runtime gate + a toolset that cannot exercise it must yield INDETERMINATE with a §2.3(b) hand-back, not a static PASS | Fixture packet with a runtime-interaction SC + read-only toolset declaration → expect INDETERMINATE + required_action naming the CLI-Playwright closure path | MEDIUM |

---

## 11. Connectivity Findings

**Analyzer run this sprint:** No — manual observations only. (The connectivity-analyzer is gander-control-plane-scoped; this sprint touched studio-alpha application code only — no agent/skill/rule/ref/hook nodes were added or rewired, so no graph delta is expected.)

Manual observations: no dead refs or orphan nodes introduced. All six packet/audit/REQVAL artifacts cross-reference each other by exact on-disk path and all paths resolve (verified while authoring this document). One *data-level* (not spec-level) staleness finding is already ledgered: the pinned e2e fixture sessions that aged out of the `session.list` window (DEFERRED-P10-1) — a fixture-to-data dead reference inside the test suite, not a `.claude/` connectivity issue.
