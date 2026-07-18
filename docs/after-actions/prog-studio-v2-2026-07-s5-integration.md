---
type: after-action
sprint_id: prog-studio-v2-2026-07-s5-integration
date: 2026-07-18
mode: A
recurring_tags: [deny-rail-integrity-positive, archivist-verification-drift, shared-server-e2e-interference]
---

# After-Action: prog-studio-v2-2026-07-s5-integration
**Date:** 2026-07-18
**Project:** `/home/jhber/projects/gander-studio-alpha`
**Duration:** first SPAWN 2026-07-18T03:58Z (seq 2) → close-out ~2026-07-18T14:45Z; ~1.5h active pipeline time, remainder an overnight human-away window (the rail-guarded rmdir + Step 4.5 OK arrived next morning)
**Final State:** All 4 packets shipped, audited PASS, REQVAL COVERED 10/10, 5 commits landed (`1a61795`..`4d7665c`); Step 4.5 human OK + push opt-in received; prog-studio-v2-2026-07 program residue fully drained.

---

## 1. Original Request

**Human (2026-07-18, session resume):** Asked via AskUserQuestion; chose **"Dispatch it (Recommended)"** for the skein-generated integration mop-up brief ("Run the mop-up sprint through the pipeline now. Small scope, no seam repair…"). In the same exchange the human RATIFIED the s4 SC-5 amendment (discharging program SC-1 pre-sprint) and granted push opt-in for the resume-time ceremony commits.

**Brief file:** `docs/programs/prog-studio-v2-2026-07/sprints/integration/orchestrator_brief.md` (skein-generated 2026-07-11); verbatim intake artifact at `.claude/tasks/outputs/prog-studio-v2-2026-07-s5-integration-human-request.md` (S7 convention).

**Scope at intake:**
- Existed: STITCHED v2 program (4 siblings DONE, 5/5 seams verified); 8 unowned residue items + 1 unratified SC amendment.
- To build: program SC-2 (Dialog/Popover safe-focus wrapper + consumer migration), SC-3 (RelationshipPanel half-width decision), SC-4 (hygiene sweep: 4 stale comments + dir removals + verify-absent), SC-5 (deferred-work Accuracy row + cross-repo guarded-push flag). SC-1 discharged pre-sprint.

**Skill invoked:** dispatch-task (full pipeline; every constituent skill formally invoked — see §8a).

---

## 2. Agent Activity Log

### Wave 1 + gates — (prog-studio-v2-2026-07-s5-integration)

All events in `docs/events/agent-events-2026-07-18.jsonl`; seq is authoritative ordering.

| Seq | Timestamp | Event | Agent | Notes |
|-----|-----------|-------|-------|-------|
| 1 | 03:50Z | RESUME | ORC#0 | session resume; cross-day gap sweep 0 ghosts |
| 2/3 | 03:58/04:10Z | SPAWN/COMPLETE | PM#0 | decomposition, 4 packets, 8-read budget honored (auto-logged) |
| 4/5 | 04:11/04:15Z | SPAWN/CRITIQUE_PASS | CR#1 | 0 BLOCKERs, 4 WARNINGs; all 3 ORC-cited grep tokens re-verified exact |
| 6/8 | 04:16/04:18Z | SPAWN/COMPLETE | PM#0 | amend1 warning-resolution (transcript-resume; COMPLETE manually logged per protocol) |
| 7 | 04:17Z | BACKFILL_SCAN | hook | mid-sprint autofire, clean |
| 9 | 04:19Z | NOTE | ORC#0 | env-preflight EQUIVALENT-PASS (script /health 404; real route /trpc/health=200; agent.list=12, skill.list=48) |
| 10–13 | 04:19Z | SPAWN ×4 | FE#1–4 | Wave 1 parallel, concrete pre-registered filenames |
| 14–17 | ~04:22–04:40Z | COMPLETE ×4 | FE#1–4 | 100% auto-logged (4/4) |
| 18 | 04:40Z | NOTE | ORC#0 | GATE-ORC-DELETE: rmdir DENIED by rail; routed to human, zero side-doors |
| 19/20 | 04:41/04:58Z | SPAWN/AUDIT_PASS | AUD#1 | v2.0 verdict, all 4 packets; serial suite 84g/41r, zero green→red |
| 21/22 | 04:59/05:03Z | SPAWN/COMPLETE | RV#1 | REQVAL Mode B: PARTIAL 9/10 (R-005 = dirs still on disk — honest) |
| 23 | ~05:05Z | BACKFILL_SCAN | hook | clean |
| 24/25 | 14:29Z | NOTE/REQVAL_COVERED | ORC#0 | human rmdir receipt; Mode A rev1 addendum → COVERED 10/10 |
| 26/27 | 14:32Z | SPAWN/COMPLETE | AR#1 | archive entry appended (auto-logged) |
| 28/30 | 14:35Z | SPAWN/COMPLETE | AR#1 | archive_correction (transcript-resume; manual terminal) fixing 3 drifts |
| 31 | 14:35Z | NOTE | ORC#0 | Step 4.5 human OK + push opt-in |

**Feedback loops:** 0 audit failures, 0 receipt-check gap requests. One Critic warning-resolution amendment (SC-level only; not a failure loop). One archivist drift-correction round (see §5/§6 G4).

**Root cause of failure(s):** N/A at gate level. Two in-flight false failure signals (FE#1's `s2-d3-session-buffer:151`, FE#2's `s2-party-shell:252`) were cross-run interference from four agents running full e2e suites concurrently against the one shared dev-server pair — both green in the auditor's authoritative serial run (§6 G3).

**Deviation from PM brief:** None in scope. ORCBRIEF carried one internal slip ("two empty dirs" vs the correct THREE) — PM caught it against the ls-verified ground fact and resolved toward three; ORC ratified.

---

## 3. Post-Delivery: Runtime Bugs (if any)

None discovered as of close. Step 4.5 human browser walkthrough confirmed ("ok, push!"): relationship graph legible at half width, dialog focus behavior correct, console clean.

---

## 4. QA Gap Analysis

**Current QA protocol:** Critic plan gate → per-packet receipt checks vs expectation manifest → independent AUD (SA/QA/SX, v2.0 typed verdict, live Playwright execution) → Mode B REQVAL → per-packet commit-packet gates.

**What this caught:**
- Critic: SC-label↔program-SC off-by-one collision (would have mis-traced REQVAL); the SC-3b token-only grep that would have passed residual staleness; the audit-execution gap for a lint-invisible focus refactor (amend1 W3 made the auditor's live e2e run mandatory — and it mattered).
- Auditor §2.11 discipline: downgraded FE#1's concurrently-run stash receipt to UNVERIFIED-HYPOTHESIS while confirming the conclusion with its own serial evidence — exactly the s4 G5 rule working.
- ORC read-back of the archivist entry: 3 factual drifts caught and corrected in-place (§6 G4).
- Receipt checks + pre-registered filenames: 100% COMPLETE auto-log on fresh spawns (7/7); both sanctioned manual terminals (transcript-resumes) logged per protocol — zero silent misses.

**What this missed:**
- Nothing shipped wrong. Two process-level near-misses: (a) concurrent full-suite e2e runs by parallel agents generated false regression signals and wasted a stash-receipt cycle — no rule prevented it at dispatch time; (b) env-preflight's canonical script hard-fails on this project's health route, requiring an ORC equivalent-pass workaround.

**Recommendations:** See §6 table — serialize full-suite runs (G3), fix env-preflight route fallback (G1), align packet file-list tags with commit-packet (G2).

---

## 5. Agent Performance Summary

| Agent | Tasks | First-pass rate | Notes |
|-------|-------|----------------|-------|
| PM#0 | 1 decomposition + 1 amendment | PASS w/ 4 warnings | 8-read budget honored; caught the ORCBRIEF two-vs-three slip; ~127k+137k tokens |
| CR#1 | 1 critique | — | 0 blockers; independently re-verified every load-bearing token; ~94k |
| FE#1 | t1 | 100% | wrapper+hook+migration; self-scoped stash receipt (sanctioned form) though run concurrently; ~149k |
| FE#2 | t2 | 100% | evidence-backed RETUNE, 2-line diff discipline, disclosed its own rail denial; ~180k |
| FE#3 | t3 | 100% | 4 comment fixes + enumerate-only deletion discipline (zero side-doors); ~92k |
| FE#4 | t4 | 100% | additive-only ledger edits; correctly attributed sibling edits in shared tree; ~105k |
| AUD#1 | 1 consolidated audit | — | ran mandated suite live; serial reconcile; both flake adjudications; ~152k |
| RV#1 | 1 REQVAL | — | honest PARTIAL on R-005 rather than false-positive COVERED; ~135k |
| AR#1 | entry + correction | 0% first-pass (entry had 3 drifts) | cross-entry contamination class; corrected via archive_correction on resume; ~72k+95k |

**Implementing first-pass rate: 4/4 (100%).** No remediation glob files exist — the gates worked.

**Most impactful single agent action:** AUD#1's authoritative serial full-suite run + `comm -23` reconcile — it simultaneously proved zero regressions, adjudicated both flake claims, and exposed the concurrent-run interference pattern (§6 G3).

**Recurring failure pattern:** Archivist verification-notes drift (s3 negative canon → recurred here as cross-entry figure contamination despite copy-not-recall discipline). The s4 §10 archivist eval fixture proposal now has a second canonical negative.

---

## 6. Protocol Gaps Identified

> Code-not-prompt check: G1 and G2 are script/schema fixes, not agent instructions — route to HR.

| Gap | Impact | Suggested fix |
|-----|--------|---------------|
| G1 — `env-preflight.py` asserts `{server}/health`; this project serves health as tRPC `/trpc/health` (root `/health` 404s post-s4). The canonical script hard-fails on a healthy env; ORC had to run an equivalent-pass with a NOTE (seq 9). | Blocks FE-wave dispatch on every future studio sprint; invites ad-hoc workarounds of a canonical gate | Implement as script fix — route to HR: `env-preflight.py` tries `/health` then falls back to `/trpc/health` (or accepts a health-path argument). Cross-repo (gander skill) — flagged for reflect intake |
| G2 — FE ui_packet/completion_packet file-list vocabulary (`components_created`/`components_modified`, per-`correction file=` attrs) doesn't match commit-packet's Deriving Files union (`files_modified`/`files_created`/`files_changed`). ORC had to rule the variant sanctioned + record a deviation_note. | Every FE sprint's commit step hits a malformed-packet judgment call; the Malformed Packet Fallback would halt a stricter ORC | Implement as schema alignment — route to HR: either add the FE-convention tags to commit-packet's sanctioned union, or make frontend.md's packet contract emit `files_modified`/`files_created` alongside its component fields |
| G3 — All four parallel Wave-1 agents ran the FULL e2e suite concurrently against the one shared dev-server pair; cross-run interference produced 2 false failure signals, one wasted (and evidentially void — concurrently-run) stash A/B receipt, and auditor adjudication load | False regression signals at wave scale; a less careful auditor could have dispatched phantom remediations | Brief-template rule in assign-agents/frontend.md: parallel-wave agents run ONLY their scoped specs; the full-suite regression check is a SINGLE serialized run owned by the auditor (or ORC) at the gate. The s5 baseline artifacts + auditor serial run is the working model |
| G4 — Archivist entry carried 3 factual drifts (adjacent-entry REQVAL figure contamination, wrong ratification date, mislabeled flake claims) despite copy-not-recall discipline; caught only by ORC read-back | project_log is the durable record; uncorrected drift poisons future retrospectives and REQVAL cross-checks | Standing ORC step: read back the appended entry against the brief's supplied facts before accepting AR COMPLETE (worked here; cost one resume round). Plus the §10 eval fixture (2nd negative canon). Route to HR/agent-improvement |
| G5 (positive) — Deletion-rail integrity held end-to-end: t3 enumerated, ORC's rmdir DENIED (seq 18), surfaced not side-doored, human executed, ORC verified (seq 24). The s4 §6 G2 class answered structurally. ALSO: the rail denies even ORC's sanctioned GATE-ORC-DELETE, so the PM plan's "ORC executes rmdir" step is unexecutable as written | One human round-trip per deletion wave (acceptable by design; but plans should not promise ORC-executed deletions) | Reinforces s4 §9 row 2 (sanctioned deletion helper / ORC-owned `git rm` step) — recurrence evidence, priority unchanged HIGH. Until it lands, PM plans should name the deletion executor as HUMAN-via-rail, not ORC |

---

## 7. Final Deliverable State

**Snapshot basis:** every file:line below is a snapshot at `4d7665c` (t4 durability commit; trailing ceremony/AA commits follow) — RE-VERIFY BEFORE CITING.
**App/Service:** `/home/jhber/projects/gander-studio-alpha` (npm-workspaces monorepo)
**Build:** lint ×3 (tsc shared/server/client) exit 0; client build success, max chunk 407.00 kB, no chunk-size warning
**Runtime:** confirmed working — auditor live e2e (s3-drilldowns 8/8; serial suite 84g/41r, zero green→red vs the 82g/43r baseline) + human 4.5 walkthrough OK

**Features delivered:**
- Safe-focus Dialog default: `packages/client/src/components/ui/use-dialog-safe-focus.ts` (new, 44 lines — once-per-open `useLayoutEffect` + reset-on-close) and `packages/client/src/components/ui/dialog.tsx:61-62` (`resolvedInitialFocus = initialFocus ?? (focusTargetRef ? () => focusTargetRef.current ?? false : undefined)`); sole consumer migrated (`ReviseSpecAction.tsx:156-157`, `hasFocusedOnOpenRef` grep = 0). Popover: zero-consumer ACCEPT recorded in the t1 packet (no speculative code).
- RelationshipPanel half-width retune: `packages/client/src/components/detail/RelationshipPanel.tsx:41-42` (`RELATIONSHIP_NODE_WIDTH 150`, `NODE_HORIZONTAL_GAP 150`); fitView scale ~0.98, ~10.8px effective labels; Handles at :149/:187 untouched. Known pre-existing: 26-node ORC case clamps at RF minZoom 0.5 at ALL widths (documented, unfixed, candidate future ledger row).
- Hygiene: stale comments corrected at `AppShell.tsx` header, `program-dag-parser.test.ts:197-202` (whole block reframed historical), `docs/v2-vision/v2-design-spec.md:324` (aria-label "Main navigation"), `router.ts` STUDIO_ROOT comment; 3 empty component dirs + stray `packages/client/.claude/` tree removed (human-executed under rail); `quickcheck{,2}.mjs` verify-absent.
- Ledger: `docs/deferred-work.md` DEFERRED-V2S1-3 (Accuracy sprintRoot-family cross-resolution approximation) + new `## Cross-repo reflect-pass intake flags` section (guarded-push docs-vs-rail contradiction, flag-only).

**Key contracts:**
- s5 e2e regression baseline: `.claude/tasks/outputs/prog-studio-v2-2026-07-s5-integration-e2e-baseline-{green,red}.txt` (82g/43r at `f2164bb`) — the operative control for future studio sprints; the ratified s4 files (115g/67r @ `6c58f40`) are the historical reference.
- Dialog consumers get safe focus by passing `focusTargetRef` (+ optional `focusOnReady`) to `DialogContent` — no per-consumer focus boilerplate; see `use-dialog-safe-focus.ts` for the ready-condition contract.
- Commit chain: ceremony `1a61795`; durability `9e8afc8` (t1) / `d67c789` (t2) / `e70d6ef` (t3) / `4d7665c` (t4), each with `task:` + `Audit: PASS` trailers; commit_record at `.claude/tasks/outputs/prog-studio-v2-2026-07-s5-integration-COMMIT-1784353500.md`.

---

## 7b. Progression Ledger Entry (AA-§7)

**sprint_id:** `prog-studio-v2-2026-07-s5-integration`

**xp_gained:**
- surface: Rules | delta: deletion-rail integrity positively exercised end-to-end (enumerate→deny→human→verify, zero side-doors)
- surface: Skills | delta: full dispatch-task constituent chain executed with every hard-gate artifact on disk; 2 skill-defect findings filed (env-preflight route, commit-packet tag union)
- surface: Evals | delta: archivist anti-drift fixture gains second canonical negative (cross-entry contamination)
- surface: Connectivity | delta: 4 dead references corrected in-repo (exportRouter.spawn, Planning, 9-tab, stale aria-label)

**levels_advanced:**
- Program prog-studio-v2-2026-07: STITCHED → residue-drained/CLOSED (s5 optional mop-up executed rather than declined)

**new_capabilities:**
- Shared ui/ Dialog safe-focus default (closes the s2/s3 base-ui focus defect class in code, 0-for-2 → structural)

```jsonl
{"sprint_id":"prog-studio-v2-2026-07-s5-integration","xp_gained":[{"surface":"Rules","delta":"deletion-rail integrity positively exercised end-to-end (zero side-doors)"},{"surface":"Skills","delta":"full dispatch-task constituent chain with all hard-gate artifacts; 2 skill-defect findings filed"},{"surface":"Evals","delta":"archivist anti-drift fixture gains second canonical negative"},{"surface":"Connectivity","delta":"4 dead references corrected in-repo"}],"levels_advanced":["prog-studio-v2-2026-07: STITCHED -> residue-drained/CLOSED"],"new_capabilities":["Shared ui/ Dialog safe-focus default (closes s2/s3 base-ui focus defect class in code)"]}
```

---

## 8. Skill-Use Analysis

### 8a. Skill Invocation Log

| Skill | Invocations | Outcome | Owner | Last reviewed | Notes |
|-------|-------------|---------|-------|---------------|-------|
| resume-project | 1 | VALUABLE | ORC | — | full procedure incl. cross-day ghost sweep (0 ghosts); caught the checkpoint STALE debt |
| dispatch-task | 1 | VALUABLE | ORC | — | procedure-by-reference; every constituent artifact exists on disk |
| convention-detect | 1 | VALUABLE | ORC | — | full re-scan; fields identical, stamp refreshed |
| pm-preflight | 1 | VALUABLE | ORC | — | 13 tags + G1–G6 fed the PM; G2/G6 demonstrably shaped t3's design |
| sc-locked-value-consistency | 1 | VALUABLE | ORC (not PM) | — | 0 findings; see 8c — PM lacks Bash, ORC ran it |
| assign-agents | 1 | VALUABLE | ORC | — | manifest + capability preflight ×4 + pre-registered filenames → 100% auto-log |
| env-preflight | 1 | PARTIAL_VALUE | ORC | — | intent verified live but canonical script hard-fails on /health (8c) |
| jidoka | 0 | NOT_TRIGGERED (correctly) | — | — | skip conditions held (facts double-verified, mop-up scope) |
| audit-pipeline | 1 | VALUABLE | ORC/AUD#1 | — | v2.0 verdict; amend1's mandated live run caught the concurrency interference |
| requirements-validate | 2 (Mode B + Mode A rev1) | VALUABLE | RV#1/ORC | — | honest PARTIAL prevented a false-positive dir-removal COVERED |
| commit-packet | 1 (+3 compact re-invokes) | PARTIAL_VALUE | ORC | — | gates all ran; file-list tag mismatch forced a deviation ruling (8c) |
| subagent-complete-backfill | 0 (hook autofire ×3) | VALUABLE | hook | — | BACKFILL_SCAN events seqs 7/23 satisfied the 3.7 gate; no manual branch needed |
| log-event | 0 | NOT_TRIGGERED | ORC | — | ORC used sanctioned manual flock+max-seq appends throughout; worked (0 collisions) but the skill existed for exactly this |
| after-action | 1 | VALUABLE | ORC | — | this document |
| sprint-report | 0 | NOT_TRIGGERED (correctly) | — | — | feeder scoped to sparse-trace sprints; trace complete, attribution undisputed |

### 8b. Obsolescence Candidates

None — no skill has 2+ consecutive non-value sprints.

### 8c. Content-Quality Candidates

| Skill | Deviation observed | Suspected cause | Recommended action |
|-------|--------------------|----------------|--------------------|
| env-preflight | ORC bypassed the failing canonical script with a manually-verified equivalent-pass NOTE (seq 9) because `{server}/health` 404s on this project (health is tRPC `/trpc/health`) | BROKEN_TOOL_REF | FIX_TOOL_REF — add `/trpc/health` fallback to `env-preflight.py` |
| commit-packet | ORC ruled FE-convention file-list tags (`components_*`, `correction file=`) a sanctioned variant of the Deriving Files union + recorded deviation_note | AMBIGUOUS_STEP | CLARIFY — name the FE-packet tags in the sanctioned union (or fix frontend.md's packet contract) |
| pm-preflight (Step 2.5) | SC-precheck directive assumes PM runs `check.py`, but pm.md grants no Bash; ORC ran it against the draft and attached the report | AMBIGUOUS_STEP | CLARIFY — codify the ORC-runs-it path for Bash-less PMs (this sprint's pattern) |
| aa-close-gate.sh | Invoked from the studio repo without `CLAUDE_PROJECT_DIR`, the gate resolved after-action/waiver paths against `/home/jhber/projects/gander/` instead of the active project | BROKEN_TOOL_REF | FIX_TOOL_REF — apply the resolve-project-root 6-step precedence (or document the env-var requirement in the skill/hook header) |

### 8d. New Skill Candidates

None — no repeated manual pattern rose to skill-worthiness this sprint.

### 8e. Skill Drift Candidates

| Skill | Drift observed | Suggested fix |
|-------|---------------|---------------|
| env-preflight | Canonical script's health route predates the s4 procedure retirement reality on this project | Same as 8c row 1 (route fallback) |

### Hand-off to hone

Post-mortem Section 8 complete. 15 skills logged. 0 obsolescence candidates, 4 content-quality candidates, 0 new skill candidates, 1 drift candidate. Run the `hone` skill to act on these findings (from the gander repo, per cross-folder run-location rules).

---

## 9. Rule / Ref / CLAUDE.md Delta Proposals

> Cross-reference: rule proposals targeting standards.md feed the quarterly HR review per .claude/rules/standards.md ## Rule-Improvement Loop.
> Cross-reference: CLAUDE.md proposals require human ratification before HR applies them — see projects/gander/CLAUDE.md ## CLAUDE.md Delta-Proposal Process.

| Target file | Proposed change | Priority | Rationale |
|-------------|----------------|----------|-----------|
| `.claude/skills/env-preflight/scripts/env-preflight.py` (gander; route to HR) | Health check tries `/health` then falls back to `/trpc/health` (or accepts a configurable health path) | HIGH | §6 G1: canonical gate hard-fails on a healthy studio env every sprint; ORC equivalent-pass workarounds erode the "halt loudly" contract |
| `.claude/skills/commit-packet/SKILL.md` Deriving Files + `.claude/agents/frontend.md` packet contract (gander; route to HR) | Add FE-convention file-list tags (`components_created`/`components_modified`/per-`correction file=`) to the sanctioned tag union, or require FE packets to also emit `files_modified`/`files_created` | MEDIUM | §6 G2: every FE sprint otherwise hits a malformed-packet judgment call at commit time |
| `.claude/skills/assign-agents/SKILL.md` brief template + `.claude/agents/frontend.md` (gander; route to HR) | Parallel-wave rule: agents run ONLY their scoped specs; the full-suite regression check is one serialized auditor/ORC run against the sprint baseline | MEDIUM | §6 G3: concurrent full-suite runs against a shared server produced 2 false failure signals + an evidentially-void stash receipt |
| s4 §9 row 2 (sanctioned deletion mechanism) — recurrence evidence only | No new text; add this sprint as second evidence: the rail denies even ORC's plan-sanctioned GATE-ORC-DELETE `rmdir`, so plans must name the executor HUMAN-via-rail until the helper lands | HIGH (unchanged) | §6 G5: the pattern held perfectly but cost a human round-trip the helper would have made a sanctioned one-step |

---

## 10. Eval Gap Proposals

| Agent / Skill | Gap description | Suggested eval | Priority |
|---------------|----------------|----------------|----------|
| archivist (anti-drift, recurrence) | s4 §10 proposed byte-comparing entry claims against inputs; this sprint supplies a SECOND canonical negative — cross-entry contamination (s4's "15/16" copied into the s5 entry) plus a wrong date and mislabeled flake claims, all with the inputs correct in the brief | Fixture close-out with two adjacent entries in project_log; assert the new entry's figures match ITS brief, not the neighbor's; this sprint's entry+correction pair is the canonical case | HIGH (escalated by recurrence) |
| env-preflight | No fixture exercises a project whose health endpoint is tRPC-routed | Fixture server exposing only `/trpc/health` → expect pass via fallback, not a health FAIL | MEDIUM |

---

## 11. Connectivity Findings

**Analyzer run this sprint:** No — manual observations only. (App-code + docs sprint; no `.claude/` graph nodes changed.)

Manual observations:
- Four dead references REMOVED from the repo by t3 (exportRouter.spawn citation, "Planning" role in the STUDIO_ROOT comment, the 9-tab fallback description, the retired "Party screen submenus" aria-label) — net dead-ref count decreased; no new dead identifiers introduced.
- The program graph is now fully terminal: all 4 siblings DONE + skein STITCHED + s5 residue drained; the only outward edges are the two cross-repo hand-offs deliberately parked in `docs/deferred-work.md` (guarded-push flag) and this document's §9 rows — both pointing at the gander-side reflect pass, which PULLs sibling after-actions read-only.
- `docs/project_log.md` s5 entry carries an in-place `<archive_correction>` (L2760–2793); downstream tooling reading the entry must read the correction with it (standard practice per the s3 precedent at ~L2715).
