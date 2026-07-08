---
type: post-mortem
sprint: prog-studio-v2-2026-07-s1-data-layer
date: 2026-07-08
head_sha: 73a78f4
gap_classes:
  - plan-time-corpus-fact-assertion
  - subagentstop-complete-miss
  - day-rollover-seq-arithmetic-fragility
  - cross-task-file-bundling-parallel-dispatch
  - archivist-paraphrase-drift
  - recurring
recurring_tags:
  - subagentstop-complete-miss
  - archivist-paraphrase-drift
related_sprints:
  - "[[gander-studio-p11-v2-vision]]"
  - "[[prog-studio-v2-2026-07]]"
status: written
---

# After-Action: prog-studio-v2-2026-07-s1-data-layer — v2 Data Layer (Party + Agent-Detail Backend)

**Date:** 2026-07-08
**Project:** `/home/jhber/projects/gander-studio-alpha`
**Duration:** ~1h 37m (PM_PREFLIGHT seq 37 @ 2026-07-07T23:12:47Z → AR#1 COMPLETE seq 16 @ 2026-07-08T00:50:12Z). The sprint spans **two UTC-dated event files** — `agent-events-2026-07-07.jsonl` seq 37–51 and `agent-events-2026-07-08.jsonl` seq 1–17 (standard midnight span, per the Step-2a convention). Timestamps mix ORC shell (`+00:00`) and hook Python (`Z`) clocks — `seq` per file is authoritative ordering.
**Final State:** Shipped clean. Tier-0 sibling of program `prog-studio-v2-2026-07` (moirai kickoff, first use this program). Four serial backend packets delivered the entire v2 data layer: 10 Zod contract schemas + the canonical `ROSTER` catalog with `specFile` mapping (t1), event derivations — attribution flip / ghost rate / event-type coverage / invalid-line diagnostics (t2), party assembly + `roster.getParty` (t3), agent-detail assembly + `roster.getAgentDetail` (t4). **4/4 first-pass audit PASS, 0 ghosts, 0 remediation cycles**, 1 Critic BLOCK round at plan stage, GATE-DEVSERVER runtime gate PASS, REQVAL Mode B COVERED 16/16, 2 hook COMPLETE-miss backfills. Commits `b771486`/`ab0c00e`/`bd281c3`/`73a78f4` (per-packet durability) + `b55e1f2` (ceremony) on `feat/studio-sessions-feed-agentstats`, **NOT pushed** — the guarded-push layer denied ORC's attempt as designed; human owns `git push origin feat/studio-sessions-feed-agentstats` despite the recorded per-sprint opt-in.

---

## 1. Original Request

**Human (2026-07-07):** Ratified the p11 v2-vision package — "this design looks great" — and authorized the **v2 implementation program**: kick off the multi-sprint rebuild with **tier 0 = the backend data layer**, granted the per-sprint guarded-push opt-in ("push this sprint"), and signaled program continuation ("let's keep it moving"). The four phrases are consumed 1:1 in the PM's `verbatim_deliverable_audit` (two addressed by packets, push routed to ORC's Layer-2 gate, continuation correctly marked out-of-scope for this sibling).

**Brief files:** `docs/programs/prog-studio-v2-2026-07/sprints/prog-studio-v2-2026-07-s1-data-layer/orchestrator_brief.md` (moirai-authored sibling brief: 7 sprint SCs + 2 BINDING seams `s1-to-s2-party-schema` / `s1-to-s3-agentdetail-schema`), decomposed as `.claude/tasks/outputs/prog-studio-v2-2026-07-s1-data-layer-PM-1783465967.md` (4 serial BE packets), revised post-BLOCK as `...-rev-PM-1783467209.md`.

**Scope at intake:** p11 delivered design-phase docs only (`docs/v2-vision/*`); nothing of v2 existed in `packages/*`. This sprint builds the data layer the s2 party-shell UI will consume: schemas, derivations, and two live tRPC procedures — no client code, no DESIGN.md/globals.css edits, tokens/cost only as a `projected` placeholder (DEFERRED-P9-1).

**Skill invoked:** moirai (program decomposition — program.md, 4 sibling briefs, program-map, ceremony commit `290de04`) → dispatch-task pipeline for s1 (pm-preflight → PM → Critic BLOCK → rev → Critic PASS → jidoka-skip adjudication → 4 serial BE packets with rolling audits → GATE-DEVSERVER → REQVAL Mode B → commit-packet → archivist).

---

## 2. Agent Activity Log

Seq references: `docs/events/agent-events-2026-07-07.jsonl` (seq 37–51) and `docs/events/agent-events-2026-07-08.jsonl` (seq 1–17).

### Phase 1: Plan gate — PM → Critic BLOCK → rev → Critic PASS (07-07 seq 37–46)

| Seq | Timestamp | Event | Agent | Notes |
|-----|-----------|-------|-------|-------|
| 37 | 23:12:47 | PM_PREFLIGHT | ORC#0 | Re-run via the **physical gander path** (p11 §6 G1 workaround still required — the symlink-resolution fix has not landed); checklist sourced incl. the p11 after-action |
| 38→39 | 23:12:47 | SPAWN→COMPLETE | PM#0 | 4-packet serial BE decomposition (t1 schemas+ROSTER → t2 derivations → t3 party+getParty → t4 agent-detail+getAgentDetail), `-PM-1783465967.md`; sc-precheck delegated to ORC (PM has no Bash), report clean |
| 40→41 | 23:26:37 | SPAWN→CRITIQUE_BLOCK | CR#1 | **1 BLOCKER + 2 WARNINGs**, `-CR-1783466797.md` |
| 42→43 | 23:33:29 | SPAWN→COMPLETE | PM#0 (rev) | FIX 1a/1b/1c (ROSTER.specFile + clause deletion + non-empty SC), FIX 2 (§5 note 1 authority), FIX 3 (§5 note 2 abilities-contracted), forecast-#2 fixture hardening, `-rev-PM-1783467209.md` |
| 44→45 | 23:40:44 | SPAWN→CRITIQUE_PASS | CR#2 | All fixes verified **against disk**, not change-log claims: 12/12 `ROSTER.specFile` filenames confirmed under `${GANDER_ROOT}/.claude/agents/`; program.md §5 notes 1+2 confirmed ORC-recorded; fresh sc-precheck 0 findings; same-blocker-twice rule checked — BLOCKER discharged |
| 46 | 23:44:55 | NOTE | ORC#0 | **jidoka SKIPPED** with recorded rationale (serial single-owner BE chain; Critic verified codebase facts on disk both rounds); capability preflight BE PROCEED; manifest written |

**The Critic catch (this sprint's most consequential planning event):** PM r0's t4 instructed the BE to derive the code→spec mapping from disk and explicitly forbade a hardcoded map — but CR#1 verified on disk that **no disk field links a ROSTER code to a spec**: `AgentSchema` carries `name`/`filePath` but no role code; connectivity edges are keyed by spec file path; event-log `agent_id`s use codes that appear nowhere in specs or graph; and **initials-derivation fails for 6 of 12 spec names** (`code-auditor`→CA≠AU, `critic`→C≠CR, `archivist`→A≠AR, `ui-designer`→UD≠UI, `researcher`→R≠RA, `orchestrator`→O≠ORC). Followed literally, `getAgentDetail` would ship **hollow for all 13 codes** — "the app's silent-under-delivery class dressed as graceful fallback." The required revision extended t1's already-static `ROSTER` with a `specFile` column (12 non-null + DI null) and added a t4 SC asserting NON-EMPTY equipment+materia for a real spec-backed agent against live GANDER_ROOT, so an all-empty result FAILS rather than passing as graceful. Both WARNINGs also landed as durable program artifacts: the getParty envelope-vs-bare-array seam interpretation and the abilities-contracted-empty decision were escalated to ORC and recorded as **program.md §5 Seam-interpretation notes 1–2** (ORC-owned seam authority, cited by code comments and by s2/s3 planning).

### Phase 2: Serial BE chain with rolling audits — t1→t2→t3→t4 (07-07 seq 47–51 → 07-08 seq 1–10)

| Seq | Timestamp | Event | Agent | Notes |
|-----|-----------|-------|-------|-------|
| 47→48 | 23:44:55 | SPAWN→COMPLETE | BE#1 (t1) | +90 additive lines to schemas.ts (10 `<Entity>Schema` + 10 `z.infer` pairs, analogy vocabulary literal in field names), `agent-role.ts` (roleOf/canonicalizeRole/13-entry ROSTER w/ specFile), 9 tests; suite 150 green |
| 49 | 23:52:56 | SPAWN | BE#2 (t2) | derivations packet dispatched in parallel with t1's audit |
| 50→51 | 23:52:56 | SPAWN→AUDIT_PASS | AUD#1 (t1) | Hex-grep empty, additive-only diff confirmed (+90/-0), SC5 live-glob test verified RAN not skipped (CR#2's false-skip forecast defeated), ROSTER filenames ls-verified on disk |
| 1 (07-08) | 00:07:09 | SPAWN | BE#3 (t3) | party assembly; BE#2's COMPLETE never auto-logged (see backfill, seq 13) |
| 2→3 | 00:07:09 | SPAWN→AUDIT_PASS | AUD#2 (t2) | **attributedAudits-basis adjudication ruling MATCHES** (see §4); silent-empty + fixture-quality checks; 162 tests green |
| 4 | 00:18:21 | COMPLETE | BE#3 (t3) | `party-roster.ts` (assembleParty, runtime activityAnchor, N/A-with-reason bars, TOKENS_PROJECTED_PLACEHOLDER w/ DEFERRED-P9-1) + rosterRouter.getParty; 177 tests green |
| 5 | 00:18:43 | SPAWN | BE#4 (t4) | dispatched in parallel with t3's audit — **the parallel window that produced the router.ts cross-task bundling** (§6 G4) |
| 6→7 | 00:18:43 | SPAWN→AUDIT_PASS | AUD#3 (t3) | Scoped correctly to t3's diff ("no getAgentDetail present in the diff I audited"); normalization arithmetic re-verified (anchor=100 / half→50); envelope checked against §5 note 1 directly |
| 8 | 00:34:04 | COMPLETE | BE#4 (t4) | `agent-detail.ts` + getAgentDetail appended to the same rosterRouter; **triggers_hook direction deviation flagged, not silently substituted** (see §4); 187 tests green |
| 9→10 | 00:34:37 | SPAWN→AUDIT_PASS | AUD#4 (t4) | **triggers_hook adjudication ruling DEVIATION UPHELD** with independent 102/102 edge count (see §4); SC3 live non-empty gates verified RAN with real fs timings |

### Phase 3: Close — GATE-DEVSERVER → REQVAL → backfills → commit → archive (07-08 seq 11–17)

| Seq | Timestamp | Event | Agent | Notes |
|-----|-----------|-------|-------|-------|
| 11 | 00:41:09 | NOTE | ORC#0 | **GATE-DEVSERVER PASS** (close-blocking runtime gate, ORC-executed per dependency_order): `roster.getParty` returned members[] with real corpus data (ORC Activity raw 27) and `roster.getAgentDetail(AU)` returned real equipment+materia on **:3199 (isolated port)**. `/health` 404 at root (tRPC-path health) — noted, not gate-relevant |
| 12 | 00:41:09 | SPAWN | RV#1 | requirements-validate Mode B (4 implementing packets) |
| 13 | 00:46:53 | COMPLETE (backfill) | BE#2 (t2) | **Hook miss across the UTC day rollover** — SPAWN in the 07-07 file, SubagentStop fired after midnight; ORC-backfilled with output confirmed on disk (§6 G2, new miss subclass) |
| 14 | 00:46:53 | COMPLETE (backfill) | RV#1 | **COVERED 16/16**; hook miss = the p11 G4 general-purpose **validator class recurring exactly as predicted** ("every future Mode-B REQVAL spawn will repeat it until fixed") |
| — | 00:46:29 | commit | ORC (commit-packet) | Two-Commit Pattern: 4 scoped durability commits `b771486`/`ab0c00e`/`bd281c3`/`73a78f4` (each `task:` + `Audit: PASS` trailers) + trailing ceremony `b55e1f2`; secret grep CLEAN; **router.ts cross-task bundling (t3 commit carried t4's in-flight share) documented in both commit bodies per the Cross-Task File Bundling rule**; skill re-invoked after a mid-close context compaction (ORC-reported), output complete, `-COMMIT-1783471589.md` |
| 15→16 | 00:46:53 | SPAWN→COMPLETE | AR#1 | archive_entry appended to `docs/project_log.md` (~lines 2293–2382, TASK_COMPLETE); hook auto-logged — but the entry carries factual drift (§4, §6 G5) |
| 17 | 00:50:23 | SPAWN | AA#1 | this after-action |

**Feedback loops:** 1 Critic BLOCK round (plan-stage, resolved in one bounded revision, re-gated clean) and **zero execution-stage loops**: 0 AUDIT_FAIL events, 0 ghosts, and the remediation glob `.claude/tasks/outputs/prog-studio-v2-2026-07-s1-data-layer-*remediate*.md` returns zero files — recorded per after-action Step 2e: evidence the gates worked, not a data gap. Second consecutive sprint at 4/4 first-pass (p11 was the first).

**Root cause of failure(s):** none at execution. The one plan-stage defect (code→spec mapping unimplementable as written) was an **unverified corpus-fact assertion in packet text** — the same class that resurfaced twice more downstream (§6 G1).

**Deviation from PM brief:** two, both corpus-grounded, both **flagged by the implementer instead of silently substituted, and both UPHELD by independent auditor verification**:
1. **t2 attributedAudits basis:** the packet's two inline SC2 examples only covered fail-then-pass resolution; inventory §2.1's fuller worked example (22 first-pass + 6 pass-after-fail + 7 attributed-fail-only = 35) implies orphaned fails also count as attributed. BE#2 implemented both cases and flagged the reading; AUD#2 quoted §2.1 verbatim and arithmetically reconstructed the worked example against the code — exact match, ruling MATCHES.
2. **t4 triggers_hook direction:** the packet said hooks are found via edges where the *agent is the source* with edgeType `triggers_hook`. BE#4 measured the live graph before writing code: **of 102 `triggers_hook` edges, 0 have an agent as source** — the analyzer's convention is hook→agent. A literal reading would have made `materia.hooks` structurally empty for all 13 codes forever — the exact silent-empty class the sprint exists to prevent. BE#4 implemented bidirectional endpoint matching for `triggers_hook` only (skills verified to genuinely run agent→source and kept literal); AUD#4 independently re-counted 102/102 and ruled DEVIATION UPHELD.
Plus one benign placement decision: t2 isolated its fixtures in per-fixture subdirectories so directory-scanning functions see exactly one file (declared with reasoning; prevented cross-suite fixture coupling).

---

## 3. Post-Delivery: Runtime Bugs (if any)

None as of this writing. Unlike p11 (docs-only), this sprint shipped runtime code — and the runtime gate ran before close: GATE-DEVSERVER confirmed both procedures respond with real, non-empty corpus data on a live server (isolated port :3199). The suites are green at 187 tests / 16 files with `tsc --noEmit ×3` clean, and REQVAL's Step 2.5 runtime check consumed the gate evidence directly.

Two observations recorded, neither a bug:
- `/health` returns 404 at the server root (health lives on the tRPC path) — noted at the gate as not gate-relevant; worth remembering when s2's `env-preflight` curls `/health`.
- **Known approximation on Accuracy (inherited, documented, not a defect):** AUD#2's forward-note — sprintRoot family grouping can place multiple distinct tasks in one family and the open-fail marker is per-role, so a same-role fail from task A could be cross-resolved by a pass from task B within one family. Inherent to the MANDATED DRY reuse of `sprintRoot`/`matchesSlug`; the inventory anticipated it; s2/s3 Accuracy-bar consumers inherit it knowingly (REQVAL note 2).

---

## 4. QA Gap Analysis

**Current QA protocol:** pm-preflight pattern extraction → Critic plan-gate (sc-precheck script ×2 + manual prose-class scan + on-disk fact verification) → jidoka skip/run adjudication → per-packet independent audit (SA/QA/SX, v2.0 typed verdicts) → ORC-executed runtime gate (GATE-DEVSERVER) → requirements-validate Mode B → commit-packet scope enforcement.

**What this caught:**
- **CR#1 caught the code→spec-mapping BLOCKER at plan stage by measuring instead of trusting** — it enumerated the actual `AgentSchema` fields, the actual connectivity edge keying, and ran the initials-derivation against all 12 real spec names (6 fail). The fix (ROSTER.specFile) became a t1 deliverable, a t4 non-empty SC, and the pattern the whole sprint then repeated: *verify the corpus before believing the packet*.
- **CR#2 verified the fixes against disk, not the change-log** — 12/12 specFile filenames confirmed present; §5 notes confirmed recorded; and its audit-risk forecast #1 (live-test false-skip) was explicitly defeated downstream: AUD#1 and AUD#4 both verified the GANDER_ROOT-gated tests **RAN** (✓ with real fs timings) rather than accepting a green-but-skipping suite.
- **BE#4 applied the Critic's own discipline pre-implementation** — it measured the live connectivity graph before writing the hooks matcher, caught the packet's inverted edge-direction assumption, implemented the corpus-correct reading, and flagged it for adjudication instead of silently substituting. The flag-don't-resolve norm (p10/p11) has propagated from FE to BE.
- **AUD#2 and AUD#4 adjudicated both deviations with independent evidence** — AUD#2 quoted §2.1 verbatim and reconstructed the 22/6/7=35 arithmetic against BE#2's code; AUD#4 re-counted all 102 triggers_hook edges itself (source kinds {hook:102}, target kinds {agent:102}) and cross-checked that skills edges genuinely do run agent-as-source (23/43), validating the *asymmetric* implementation. These two adjudications are the sprint's audit value stories.
- **Silent-empty discipline held at every layer:** invalid corpus lines counted+sampled (never dropped), DI's empty distinguishable from a stale-mapping failure by distinct note text (branch-tested), non-Impl Accuracy null+reason (never a fake 0), non-existent events dir returns empty diagnostics without fabrication, and the malformed-line fixture's shape was provenance-checked against the real 2026-03-28 seq-7 corpus defect by both BE#2 and AUD#2 independently.
- **GATE-DEVSERVER closed the static-audit gap** — the one SC no static audit can prove (procedures respond live) was ORC-executed as a close-blocking gate and consumed by REQVAL as runtime evidence.
- **commit-packet's scope enforcement surfaced the router.ts overlap honestly** — the t3/t4 cross-task bundling was classified and documented in both commit bodies per the Cross-Task File Bundling rule rather than silently staged.

**What this missed (process-shape misses; nothing shipped defective):**
- **Packet text asserted corpus facts nobody measured at plan time — twice** (t2 attributedAudits basis; t4 triggers_hook direction). Both were caught downstream by corpus-grounded implementers/auditors, but each cost an audit-time adjudication. Jidoka — the mechanism designed to pre-read facts before implementation — was skipped this sprint under its documented skip conditions (serial single-owner BE chain), and the Critic's on-disk verification covered the facts the *plan structure* depended on but not every corpus claim inside packet prose. A ~5-minute plan-time corpus probe (count edge directions; quote §2.1's worked example verbatim into the packet) would have been cheaper than two adjudications (§6 G1).
- **SubagentStop hook missed 2 COMPLETEs** — BE#2's across the UTC day rollover (a **new miss subclass**: SPAWN logged in day-N's file, Stop fires after midnight) and RV#1's (the p11 G4 general-purpose validator class recurring exactly as p11 predicted). Both ORC-backfilled with outputs confirmed on disk (§6 G2).
- **The ORC inline seq-continuation recipe got lucky at midnight** — the new 07-08 file correctly restarted at seq 1, but only because the empty-`LAST_SEQ` string silently coerced to 0+1 in shell arithmetic. The log-event skill documents the absent-file branch explicitly; ORC's inline compose skipped that guard (§6 G3).
- **AR#1's archive entry drifted on facts it did not verify — the p11 §4 watch item recurred, and escalated.** The durable project_log entry states the ROSTER catalog "is stored at `packages/server/src/data/roster.json`" and that hook edges come from "`packages/server/src/data/hooks.json`" — **neither file exists** (verified while authoring this document: the catalog is the `ROSTER` constant in `packages/server/src/parsers/agent-role.ts`; hook edges come from `${GANDER_ROOT}/docs/connectivity-graph.json`). It also misdescribes the t2 derivation source ("live ORC activity log" — actually the event-log corpus) and misstates AUD#2's verification ("confirmed 22/35 sample audit records are correctly reconstructed" — AUD#2 reconstructed the inventory's *worked example* arithmetically, not live sample records). Root cause visible in the AR's own Stage-2 log: it read only the 07-07 event file, found the tail "missing," and **estimated** timestamps instead of opening the 07-08 file — the same UTC-rollover blindness this skill's Step 2a warns about. p11 said this pattern was "worth watching for recurrence before it earns a gap row"; it recurred with fabricated paths in the permanent record — it now has its row (§6 G5).

**Recurring-class table (this sprint's sightings vs. known classes):**

| Class | This sprint | Prior sightings | Status |
|-------|-------------|-----------------|--------|
| subagentstop-complete-miss | 2 misses: BE#2 (**new day-rollover subclass**) + RV#1 (validator class, predicted by p11 G4) | p11: 1 (validator class named); p10: 0/9 (cross-project class, fixed) | RECURRING — the validator-class fix has not landed; a second subclass now named (§6 G2) |
| archivist-paraphrase-drift | AR entry fabricates 2 nonexistent file paths, misattributes derivation source + audit method; read only 1 of 2 UTC event files | p11 §4: 3 paraphrase inaccuracies noted as a watch item (no gap row) | RECURRING — escalated from watch item to gap row (§6 G5) |
| plan-time-corpus-fact-assertion | 3 sightings in one plan: CR#1's BLOCKER (caught pre-code) + t2 basis + t4 edge direction (caught at implement/audit time) | Related to p11's prose-rule-bypass family (unenforced requirement), but distinct: here the packet asserts a *measurable fact* wrongly | NEW class named (§6 G1) |
| pm-preflight symlink misresolution | Workaround still required (physical-path invocation, seq 37) | p11 §6 G1 (fix proposed, not yet applied) | RECURRING — open until the gander-side script fix lands |

---

## 5. Agent Performance Summary

Token accounting: no sprint report exists for this slug (`docs/sprint-reports/` has none for it) and the COMPLETE events carry no `tokens` field — per-agent token attribution is unavailable this sprint, not omitted. Run `sprint-report` retroactively if needed.

| Agent | Tasks | First-pass rate | Notes |
|-------|-------|----------------|-------|
| PM#0 | 1 decomposition + 1 revision | 0% r0 / 100% r1 | Strong structure (serial single-writer chain, sc-precheck-clean by design, two G5 canonical-section resolutions pre-declared) — but r0's t4 asserted an unimplementable code→spec derivation AND forbade the viable fix; rev applied all CR recipes verbatim in one bounded round |
| CR#1 | 1 round | 100% (the BLOCK was real and pre-code-fatal) | Highest-value action of the sprint: measured the corpus (6/12 initials failures, edge keying, schema fields) instead of trusting the plan; converted "graceful fallback" into a detectable all-empty FAIL condition |
| CR#2 | 1 re-gate | 100% | Disk-verified all fixes (12/12 specFiles, §5 notes); its false-skip forecast was executed by AUD#1/AUD#4 as must-run-not-skip checks |
| BE#1 (t1) | 1 | 100% | +90 additive schema lines, 13-entry ROSTER w/ specFile, zero hex, 10/10 schema+infer pairs; live-glob SC ran under real GANDER_ROOT |
| BE#2 (t2) | 1 | 100% | The sprint's most careful packet: corpus-provenance on the malformed fixture (real seq-7 line opened first), fixture isolation reasoning, sprintRoot merge behavior pre-verified with a standalone script, the attributedAudits basis extension flagged not hidden, narrowest-possible DRY extraction to protect byte-for-byte behavior guarantees |
| BE#3 (t3) | 1 | 100% | Runtime anchor (no magic 46), N/A-with-reason discipline across all three bars, placeholder never populated, additive +16/-0 router diff |
| BE#4 (t4) | 1 | 100% | Measured the live graph before implementing (102/102 hook→agent), implemented the asymmetric corpus-correct matching, flagged the deviation with evidence; distinct-note distinguishability (DI vs stale mapping) branch-tested |
| AUD#1–#4 | 4 packets | 4/4 first-pass PASS | Independent re-derivation throughout: hex greps, additive-diff proofs, §2.1 arithmetic reconstruction (AUD#2), full edge-direction recount (AUD#4), skip-vs-ran verification on GANDER_ROOT-gated tests (AUD#1/#4) |
| RV#1 | 1 | COVERED 16/16 | Mode B with file:line evidence per requirement; consumed GATE-DEVSERVER as runtime proof (Step 2.5); carried both deviation interpretations forward for s2/s3; flagged the then-missing deferred-work bookkeeping (since recorded as DEFERRED-V2S1-1/-2). COMPLETE hook-missed (validator class), backfilled |
| AR#1 | 1 | n/a | Entry appended with correct structure and retention keys — but with fabricated file paths and misattributed methods in the rationale (§4, §6 G5); read only 1 of the 2 UTC event files |

**First-pass rate: 100% across all four implementing tasks** — second consecutive fully-clean execution trace (after p11), and the first on runtime code: 0 AUDIT_FAIL, 0 ghosts, 0 remediation files, suites growing monotonically green 150→162→177→187.

**Most impactful single agent action:** CR#1's measured BLOCKER — it prevented `getAgentDetail` shipping hollow for all 13 agents, produced the `ROSTER.specFile` contract two downstream packets and both live-corpus SCs now depend on, and modeled the verify-the-corpus discipline BE#4 then reused to catch the packet's second wrong corpus assertion.

**Recurring failure pattern:** plan-time packet text asserting corpus facts nobody measured (3 sightings in one plan — one caught by the Critic, two by implementer/auditor). The pipeline's redundancy absorbed all three, but each downstream catch is costlier than a plan-time probe. Secondary: the SubagentStop miss family recurred (2 backfills; validator class unfixed since p11, day-rollover subclass newly named).

---

## 6. Protocol Gaps Identified

> Code-not-prompt check applied to each row below.

| Gap | Impact | Suggested fix |
|-----|--------|---------------|
| **G1 — Packet text asserted unmeasured corpus facts, wrong twice (three sightings incl. the CR#1 BLOCKER).** t2's SC2 inline examples under-specified the attributedAudits basis relative to inventory §2.1's worked example; t4's description stated the `triggers_hook` edge direction backwards (agent→hook; live graph is 102/102 hook→agent). Both were plan-time assertions about measurable corpus facts that nobody measured at plan time. Jidoka was skipped under its documented conditions (serial BE chain), and the Critic's on-disk verification covered plan-structural facts but not every corpus claim inside packet prose. | Two audit-time adjudications instead of one 5-minute plan-time probe; had the implementers been less corpus-disciplined, t4 would have shipped `materia.hooks` structurally empty for all 13 codes forever, and t2's Accuracy denominator would have silently diverged from the inventory contract. | **PM packet rule (route to HR / gander, pm.md + dispatch-task):** any packet sentence asserting a corpus/codebase fact (edge direction, derivation basis, field presence, count) must either carry a **measured citation** (the command run + the observed value, à la CR#1's evidence style) or be phrased **verify-then-implement** ("measure the edge direction in the live graph; implement what you find; record the count"). Companion: amend jidoka's skip-condition calculus — a skipped jidoka should trigger a lightweight ORC corpus-probe pass over packet fact-assertions instead (§8c row 1, §10 row 2). |
| **G2 — SubagentStop hook missed 2 COMPLETEs; the day-rollover subclass is new.** BE#2's SPAWN logged in `agent-events-2026-07-07.jsonl`; its Stop fired after UTC midnight and no COMPLETE landed in either file — a miss class distinct from p11's validator class (which also recurred: RV#1's COMPLETE missed exactly as p11 G4 predicted for Mode-B REQVAL spawns). Both backfilled (07-08 seq 13–14) with outputs confirmed on disk. | Two manual backfills; observability held but only via ORC vigilance. The validator class now has two consecutive sprint sightings with the fix still unapplied; the day-rollover class will fire for every sprint spanning UTC midnight — which Step 2a of this very skill documents as "standard, not an exception." | **Code-not-prompt: hook fix.** Extend `~/.claude/hooks/subagent-autocomplete.sh`: (a) reproduce + fix the day-rollover case (COMPLETE must target the *current* UTC date's file with correct seq continuation/restart even when the matching SPAWN lives in the prior day's file); (b) land the p11 G4 validator-class fix already proposed. Route to HR / gander hook batch as one unit; add self-test fixtures for both classes (§9 row 2, §10 row 1). |
| **G3 — ORC's inline seq-continuation arithmetic silently coerced empty→0 at the day rollover.** The new UTC file correctly began at seq 1, but only because the empty `LAST_SEQ` string happened to coerce to 0+1 in shell arithmetic. The log-event skill documents the absent-file branch explicitly; ORC's inline flock compose skipped that guard. Fragile-but-lucky: under `set -u`, a different shell, or a whitespace-contaminated read, the same recipe throws or mis-numbers. | None this sprint (correct output by coincidence). A silent wrong-seq event would corrupt the ordering invariant every downstream consumer (census, sprint-report, this skill) treats as authoritative. | **Code-not-prompt: recipe guard.** Make the absent/empty-LAST_SEQ branch explicit in the ORC inline compose (`[[ -z "$LAST_SEQ" ]] && SEQ=1 || SEQ=$((LAST_SEQ+1))`), matching the log-event skill's documented branch — or better, stop inlining and always route through the log-event helper (§9 row 3). |
| **G4 — Parallel dispatch of the next writer of a shared file with the current audit created the router.ts cross-task bundle.** BE#4 (t4, edits router.ts) was dispatched at the same seq-tick as AUD#3 (t3's audit, whose packet also owns router.ts). AUD#3 correctly scoped its verdict to t3's diff, but by commit time router.ts carried both shares, so t3's durability commit `bd281c3` bundled t4's in-flight work — handled per the documented Cross-Task File Bundling rule (declared in both commit bodies), but the overlap was created by the dispatch schedule, not by necessity. | No correctness damage (rule followed, AUD#4 verified getParty untouched against committed state) — but per-packet commit atomicity degraded: `bd281c3` is not revertable without touching t4's share. | **Sequencing rule for serial-chain sprints (dispatch-task / assign-agents note):** the rolling-audit overlap pattern is fine for disjoint files, but do **not** parallel-dispatch the next writer of a shared file with the audit of that file's current packet — either hold the next packet until the audit returns, or move the shared-file edit to the later packet's start. Cheap: this sprint it would have cost ~4 minutes of wall clock. |
| **G5 — Archivist paraphrase drift recurred and escalated: fabricated file paths in the durable record.** The project_log entry cites `packages/server/src/data/roster.json` and `packages/server/src/data/hooks.json` — neither exists (catalog = `ROSTER` in `agent-role.ts`; hook edges = gander's `docs/connectivity-graph.json`) — and misattributes the t2 derivation source and AUD#2's verification method. Contributing cause: AR#1 read only the 07-07 event file and *estimated* the close timeline rather than opening the 07-08 file. p11 §4 flagged this exact synthesis-without-verification pattern as a watch item; second sighting, now with invented paths. | `docs/project_log.md` is the project's durable memory — a future session grepping for `roster.json` finds a confident dead reference; the drift class compounds silently because nothing downstream re-verifies archive prose. This after-action is the corrected record. | Two-part fix (route to HR / gander, archivist.md): (a) **verification rule** — every file path named in an archive_entry must be existence-checked on disk before writing (the archivist has Read/Glob; a fabricated path is mechanically detectable); (b) **UTC multi-file rule** — port this skill's Step 2a wording ("grep across every UTC-dated file that overlaps the window") into the archivist's event-log procedure; never estimate timestamps that exist on disk. Candidate eval in §10 row 4. |

---

## 7. Final Deliverable State

**App/Service:** `/home/jhber/projects/gander-studio-alpha` (branch `feat/studio-sessions-feed-agentstats`; durability commits `b771486` t1 / `ab0c00e` t2 / `bd281c3` t3+router-bundle / `73a78f4` t4 + ceremony `b55e1f2`; **NOT pushed** — ORC's guarded-push attempt was denied by the Layer-1 hook as designed, so despite the human's recorded "push this sprint" opt-in the publish step is human-owned: `git push origin feat/studio-sessions-feed-agentstats`).
**Build:** `npm run lint` (tsc --noEmit ×3) clean at every packet; server vitest 16 files / 187 tests green; zero `packages/client/*` changes (verified per-commit by REQVAL's `git show --stat` sweep and by every audit SX check).
**Runtime:** GATE-DEVSERVER PASS — both procedures live with real corpus data (getParty members[] w/ ORC Activity raw 27; getAgentDetail(AU) w/ real equipment+materia) on an isolated dev server.

**Features delivered (all server/shared — the s2 party-shell UI consumes these):**
- `packages/shared/src/schemas.ts` (+90 additive): 10 v2 schemas — Feasibility, PartyStatBar, PartyMember, PartyStats (envelope), Equipment, Materia, Ability, RelationshipEdge, QualityStat, AgentDetail — each with `z.infer` type; analogy vocabulary (`equipment`/`materia:{skills,hooks}`/`abilities`) literal in field names.
- `packages/server/src/parsers/agent-role.ts`: `roleOf` (instance-suffix strip), `canonicalizeRole` (AUDITOR/AUD/AU merge), and the canonical 13-entry `ROSTER` with the CR#1-mandated `specFile` column (12 spec-backed + DI null).
- `packages/server/src/parsers/event-log-parser.ts` (+ additive): `readEventLogEntriesWithDiagnostics` — invalid corpus lines counted + sampled; pre-existing readers byte-for-byte behaviorally unchanged (regression-tested against the same malformed fixture).
- `packages/server/src/parsers/party-stats.ts`: `computePartyDerivations` — §2.1 attribution flip (backward-look, incl. orphaned-fail attribution), §2.2 ghost rate (direct agent_id), §2.3 event-type coverage, multi-root aggregation, diagnostics fold.
- `packages/server/src/parsers/party-roster.ts` + `roster.getParty`: 13 recency-sorted PartyMembers, three AVAILABLE-NOW bars (Activity off the runtime `activityAnchor`, Stamina inverse-ghost, Accuracy Impl-only) with N/A-with-reason discipline; `TOKENS_PROJECTED_PLACEHOLDER` (DEFERRED-P9-1 cited) never populated into stats.
- `packages/server/src/parsers/agent-detail.ts` + `roster.getAgentDetail(code)`: equipment from spec tools, materia from connectivity edges with provenance paths (skills agent→source literal; hooks bidirectional per the upheld corpus correction), relationships subset, attribution-declared qualityStats, dataQualityNotes (DI vs stale-mapping distinguishable); double Zod boundary (`.parse` + `.output`).
- 4 new test suites + 3 fixture dirs (attribution-flip, malformed-line w/ real seq-7 shape provenance, party-roster); GANDER_ROOT-gated live-corpus tests that skip-with-reason in CI but were verified RAN in-audit.

**Key contracts the next engineer (s2/s3 planning) needs:**
- **`roster.getParty` returns the `PartyStatsSchema` ENVELOPE** `{members, diagnostics, activityAnchor}` — program.md §5 note 1 is the seam authority; the seam's "PartyMember[] sorted by activity recency" describes `.members`. s2 must not expect a bare array, and should surface `diagnostics` as a data-quality affordance.
- **`abilities: []` + surfaced note is CONTRACTED** (§5 note 2 / DEFERRED-V2S1-1): s3 renders an honest "no recorded abilities" state — do not plan a populated Abilities drill-down until a durable workflow-usage ledger exists.
- **`triggers_hook` edges are hook→agent in the live graph (102/102)** — the s1 implementation matches bidirectionally; s3's relationship rendering should inherit this interpretation (REQVAL note 1), not the original packet text.
- **Accuracy carries a known family-grouping approximation** (AUD#2 forward-note; §3) — inherited knowingly by all consumers.
- **`QualityStatSchema` has no `reason` field** (DEFERRED-V2S1-2): N/A explanations ride `dataQualityNotes`; a small schema extension is the candidate if s3 wants inline per-stat reasons.
- **GANDER_ROOT must be set** for the live-corpus non-empty tests to run (they skip-with-reason otherwise) and for the procedures to return real materia; `/health` lives on the tRPC path (root 404 is expected — relevant to s2 env-preflight).
- CLAUDE.md's router-count table intentionally NOT updated (s4 owns doc refresh); the app now has 24 procedures.

---

## 7b. Progression Ledger Entry (AA-§7)

**sprint_id:** `prog-studio-v2-2026-07-s1-data-layer`

**xp_gained:**
- surface: Skills | delta: Critic plan-gate caught a fatal corpus-fact assumption by measuring (6/12 initials failures) — and the discipline propagated: BE#4 pre-measured the live graph and caught the packet's second wrong corpus assertion (102/102 edge direction) before writing code
- surface: Agents | delta: two corpus-grounded deviations flagged-not-substituted by implementers and UPHELD by auditors with independent quantitative verification (§2.1 arithmetic reconstruction; full edge recount) — the deviation-adjudication loop is now proven on backend work
- surface: Hooks | delta: SubagentStop day-rollover COMPLETE-miss subclass discovered and named alongside the recurring validator class — both now routable as one gander hook-batch fix with self-test fixtures
- surface: Connectivity | delta: triggers_hook edge direction measured and recorded (hook→agent, 102/102) — a durable graph fact correction all v2 consumers inherit

**levels_advanced:**
- Second consecutive fully-clean execution trace (4/4 first-pass audit PASS, 0 ghosts, 0 remediation) — and the first on runtime code with a close-blocking live-server gate
- Program-of-sprints machinery operating end-to-end: moirai kickoff → seam-interpretation notes recorded at the Critic round → REQVAL validating against the amended seams → deferred-work contracts recorded for sibling sprints

**new_capabilities:**
- Live v2 data layer: `roster.getParty` (13 corpus-derived party members with normalized stat bars + diagnostics envelope) and `roster.getAgentDetail` (equipment/materia/abilities/relationships/qualityStats with provenance), 10 Zod contract schemas, and the canonical ROSTER.specFile code→spec catalog — verified responding with real data on a live server

```jsonl
{"sprint_id":"prog-studio-v2-2026-07-s1-data-layer","xp_gained":[{"surface":"Skills","delta":"Critic plan-gate caught a fatal corpus-fact assumption by measuring (6/12 initials failures); discipline propagated — BE#4 pre-measured the live graph and caught the packet's inverted triggers_hook direction (102/102) before writing code"},{"surface":"Agents","delta":"two corpus-grounded deviations flagged-not-substituted and UPHELD via independent quantitative auditor verification (§2.1 arithmetic reconstruction; full 102-edge recount)"},{"surface":"Hooks","delta":"SubagentStop day-rollover COMPLETE-miss subclass discovered and named alongside the recurring validator class; routable as one hook-batch fix"},{"surface":"Connectivity","delta":"triggers_hook edge direction measured and recorded (hook->agent, 102/102) — durable graph fact correction inherited by all v2 consumers"}],"levels_advanced":["second consecutive fully-clean execution trace (4/4 first-pass PASS, 0 ghosts, 0 remediation), first on runtime code with a close-blocking live-server gate","program-of-sprints machinery end-to-end: moirai kickoff, ORC-recorded seam-interpretation notes, REQVAL against amended seams, deferred-work contracts for siblings"],"new_capabilities":["live v2 data layer: roster.getParty (13 corpus-derived members + diagnostics envelope) and roster.getAgentDetail (equipment/materia/abilities/relationships/qualityStats with provenance), 10 Zod schemas, canonical ROSTER.specFile catalog — verified live with real data"]}
```

---

## 8. Skill-Use Analysis

> This section is hone's primary input. Run `hone` after this post-mortem if any table below has rows.

### 8a. Skill Invocation Log

| Skill | Invocations | Outcome | Owner | Last reviewed | Notes |
|-------|-------------|---------|-------|---------------|-------|
| moirai | 1 (program kickoff) | VALUABLE | ORC | NEVER | First use this program: program.md (invariants, DAG, seams), 4 sibling briefs, program-map, ceremony commit `290de04` — artifacts complete; §5 later absorbed the ORC-recorded seam-interpretation notes cleanly, proving the manifest works as a living seam authority |
| pm-preflight | 1 | PARTIAL_VALUE | ORC | 2026-07-07 (p11) | Checklist produced and demonstrably consumed (PM acknowledged OVERSCOPED/DRY/miss/G5 tokens and avoided each) — but the physical-path invocation workaround for the p11 G1 symlink defect was required AGAIN (seq 37); the script fix proposed in p11 §9 row 1 has not landed |
| sc-locked-value-consistency | 2 (both plan rounds) | VALUABLE | ORC/Critic | NEVER | 0 findings both rounds (reports on disk: `-sc-precheck-report.json`, `-rev-sc-precheck-report.json`); the plan was authored precheck-clean by design (no locked corpus values — the "never a hardcoded 46" discipline traces to this gate's class definitions) |
| jidoka | 0 (skip adjudicated, seq 46 NOTE) | NOT_TRIGGERED | ORC | NEVER | Skip conditions as-written sanctioned the skip (serial single-owner BE chain; Critic disk-verified plan-structural facts) — but the two packet corpus-fact errors (§6 G1) are exactly the class a plan-only corpus probe would have caught. The skip conditions need a corpus-probe fallback, not the skip decision reversed (8c row 1) |
| assign-agents | 1 (serial chain, staged) | VALUABLE | ORC | NEVER | Capability preflight BE PROCEED; expectation manifest receipt_checks tracked the rev-plan's renumbered SCs correctly; all four completion packets matched expected shapes |
| audit-pipeline | 4 packets | VALUABLE | ORC | NEVER | 4× v2.0 typed first-pass verdicts. The value stories: AUD#2's §2.1 verbatim-quote + arithmetic reconstruction of the attributedAudits basis, and AUD#4's independent 102/102 edge-direction recount with the asymmetric skills-vs-hooks cross-check — deviation adjudication with quantitative evidence, both rulings carried into REQVAL and s2/s3 contracts |
| requirements-validate (Mode B) | 1 | VALUABLE | ORC | NEVER | COVERED 16/16 with file:line evidence; Step 2.5 runtime check consumed GATE-DEVSERVER; notes 1–4 became durable contracts (deviation inheritance, Accuracy approximation, schema asymmetry, deferred-work bookkeeping — the last executed at close as DEFERRED-V2S1-1/-2) |
| commit-packet (two-commit) | 1 (4 durability + ceremony) | VALUABLE | ORC | NEVER | Per-packet scoped staging with `task:`/`Audit: PASS` trailers; secret grep clean; the router.ts cross-task bundle classified + documented in both commit bodies per the Cross-Task File Bundling rule; survived a mid-close context compaction via re-invoke with complete output |
| log-event (inline composition) | ~30 events across 2 UTC files | PARTIAL_VALUE | ORC | NEVER | Monotonic seq in each file, typed events + 2 backfills composed correctly, and the day-rollover file restart landed at seq 1 — but via the unguarded empty-LAST_SEQ coercion (§6 G3): the skill documents the absent-file branch; the inline compose skipped it |
| after-action | 1 | VALUABLE | AA | NEVER | this document |

### 8b. Obsolescence Candidates

| Skill | Consecutive non-value sprints | Evidence | Recommended action |
|-------|------------------------------|----------|--------------------|
| _none_ | — | — | — |

### 8c. Content-Quality Candidates

| Skill | Deviation observed | Suspected cause | Recommended action |
|-------|--------------------|----------------|--------------------|
| jidoka | Skip conditions sanctioned skipping the only mechanism positioned to pre-read corpus facts, in a sprint whose packets contained two wrong corpus-fact assertions; the Critic's fact-verification partially overlaps jidoka's remit but has no mandate to verify every prose fact inside packet descriptions | AMBIGUOUS_STEP — the skip calculus weighs packet count/context-file volume, not the density of unmeasured corpus assertions in packet text | CLARIFY: add a skip-condition rider — when jidoka is skipped, ORC runs a lightweight corpus-probe over packet fact-assertions (count/quote each asserted measurable fact), or the PM packet rule in §9 row 1 makes the assertions self-verifying |
| pm-preflight | Physical-path invocation workaround required for the second consecutive sprint (p11 §6 G1); the proposed `pwd -P`/`readlink -f` script fix has not been applied in the gander repo | BROKEN_TOOL_REF — known defect, fix specified but unlanded | FIX_TOOL_REF: land p11 §9 row 1 in the gander hook/skill batch; two consecutive worked-around sprints is the escalation signal |
| log-event | ORC's inline seq recipe omitted the skill's documented absent-file/empty-LAST_SEQ branch and got the right answer by shell-coercion luck at the UTC rollover | AMBIGUOUS_STEP — the skill documents the branch but the inline-composition path (sanctioned for ORC-direct events) doesn't restate it where ORC actually composes | CLARIFY: put the explicit `[[ -z "$LAST_SEQ" ]]` guard into the inline-compose recipe text itself (§9 row 3), or require the helper for the first event of a new UTC file |

### 8d. New Skill Candidates

| Pattern observed | Frequency in sprint | Effort to encode as skill | Suggested skill name |
|-----------------|---------------------|--------------------------|---------------------|
| _none_ — the plan-time corpus probe is a jidoka skip-rider / PM packet rule (8c row 1, §9 row 1), and the archivist path-verification is an agent-spec edit (§6 G5), not new skills | — | — | — |

### 8e. Skill Drift Candidates

| Skill | Drift observed | Suggested fix |
|-------|---------------|---------------|
| _none_ | — | — |

### Hand-off to hone

Post-mortem Section 8 complete. 10 skills logged. 0 obsolescence candidates, 3 content-quality candidates (jidoka, pm-preflight, log-event), 0 new skill candidates, 0 drift candidates. Run the `hone` skill to act on these findings.

---

## 9. Rule / Ref / CLAUDE.md Delta Proposals

> Cross-reference: rule proposals targeting standards.md feed the quarterly HR review per .claude/rules/standards.md ## Rule-Improvement Loop.
> Cross-reference: CLAUDE.md proposals require human ratification before HR applies them — see projects/gander/CLAUDE.md ## CLAUDE.md Delta-Proposal Process.

| Target file | Proposed change | Priority | Rationale |
|-------------|----------------|----------|-----------|
| `.claude/agents/pm.md` + `.claude/skills/dispatch-task/SKILL.md` (gander repo; route to HR via full pipeline — team blast radius) | **Corpus-fact-citation rule for packet text:** any packet sentence asserting a measurable corpus/codebase fact (edge direction, derivation basis, field presence, count) must carry a measured citation (command + observed value) or be phrased verify-then-implement ("measure X in the live source; implement what you find; record the measurement"). Pair with the jidoka skip-rider (8c row 1). | HIGH | §6 G1: three unmeasured assertions in one plan — one plan-fatal (caught by CR#1), two implementation-visible (caught at implement/audit time at the cost of two adjudications). The fix converts the class from "downstream safety net" to "self-verifying at authorship." |
| `~/.claude/hooks/subagent-autocomplete.sh` (gander hook batch; route to HR) | Fix BOTH open COMPLETE-miss classes as one unit: (a) **day-rollover** — a Stop firing after UTC midnight must write COMPLETE to the current UTC date's file with correct seq restart, even when the SPAWN lives in the prior day's file; (b) the p11 G4 **validator class** (general-purpose spawns with `expected_output`), already specified, still unlanded. Add self-test fixtures for both. | HIGH | §6 G2: 2 backfills this sprint; the validator class has now recurred exactly as p11 predicted, and the day-rollover class will fire on every midnight-spanning sprint — which the after-action skill itself documents as standard. |
| `.claude/skills/log-event/SKILL.md` (inline-compose recipe section) | State the empty/absent-LAST_SEQ guard explicitly in the ORC inline-composition recipe (`[[ -z "$LAST_SEQ" ]] && SEQ=1`), or require routing the first event of a new UTC file through the helper. | MEDIUM | §6 G3: the guard exists in the skill's absent-file branch but not where ORC actually composes inline; this sprint's correct seq-1 restart was shell-coercion luck. |
| `.claude/agents/archivist.md` (gander repo; route to HR via full pipeline) | (a) **Path-verification rule:** every file path named in an archive_entry must be existence-checked (Glob/Read) before writing; (b) **UTC multi-file rule:** port the after-action Step 2a wording — read every UTC-dated event file overlapping the sprint window; never estimate timestamps that exist on disk. | MEDIUM | §6 G5: fabricated `roster.json`/`hooks.json` paths now live in the durable project_log; contributing cause was single-file event-log reading. Second consecutive sighting of the drift class (p11 §4 watch item). |

---

## 10. Eval Gap Proposals

| Agent / Skill | Gap description | Suggested eval | Priority |
|---------------|----------------|----------------|----------|
| subagent-autocomplete.sh (hook) | No self-test covers the UTC day-rollover shape: SPAWN in day-N's file, Stop fires after midnight | Fixture: seed day-N file with a SPAWN near 23:59Z, fire the hook after 00:00Z → assert COMPLETE lands in the day-N+1 file at seq 1 (or continues that file's seq), never dropped; expected to fail until §9 row 2a lands. Pair with the p11 validator-class fixture (row 2b) | HIGH |
| project-manager (packet authoring) | Nothing lints packet prose for unmeasured corpus-fact assertions (§6 G1's class) | Fixture plan whose packet asserts a measurable graph/corpus fact without a citation or verify-then-implement phrasing → expect the Critic-gate (or a pm-preflight extension) to flag it; calibrate against this sprint's t4 triggers_hook sentence as the canonical positive | MEDIUM |
| log-event (seq continuation) | The first-event-of-new-UTC-file path is untested against the inline-compose recipe | Fixture: empty events dir for "today" + populated file for "yesterday" → assert composed event has seq 1 via the explicit branch (fails if the recipe relies on empty-string arithmetic under `set -u`) | MEDIUM |
| archivist | No check catches fabricated file paths or single-file event-log reads in archive entries | Fixture close-out whose provided facts include one nonexistent path and a two-UTC-file event window → assert the entry either verifies/corrects the path and reads both files, or flags them; this sprint's entry is the canonical failure case | MEDIUM |

---

## 11. Connectivity Findings

**Analyzer run this sprint:** No — manual observations only. (The analyzer is gander-control-plane-scoped; this sprint added studio-alpha application code, no `.claude/` agent/skill/rule/ref/hook nodes.)

Manual observations:
- **A real graph fact was measured and corrected this sprint:** `triggers_hook` edges run hook→agent, 102/102, agent-as-source 0 (BE#4 measured; AUD#4 independently recounted; example `~/.claude/hooks/aa-close-gate.sh --triggers_hook--> .claude/agents/orchestrator.md`). Skill edges genuinely run agent-as-source (23 of 43 `references_skill`/`invokes_skill`). Any future consumer of the connectivity graph's hook edges should inherit this direction, not the s1 packet text's assumption.
- **Dead references introduced into the durable record (routes to §6 G5):** the AR#1 project_log entry cites `packages/server/src/data/roster.json` and `packages/server/src/data/hooks.json` — neither exists on disk. The real nodes are `packages/server/src/parsers/agent-role.ts` (ROSTER + specFile catalog) and `${GANDER_ROOT}/docs/connectivity-graph.json` (edge source). This after-action is the corrected record.
- **New cross-repo provenance chain established and verified:** `ROSTER.specFile` values were disk-verified against `${GANDER_ROOT}/.claude/agents/*` twice (CR#2 12/12; AUD#1 sampled 6); materia `provenancePath` values resolve under GANDER_ROOT; program.md §5 notes 1–2 are cited by code comments (`party-roster.ts`, `agent-detail.ts`) and by REQVAL — the seam authority chain resolves at every hop.
- All packet/audit/REQVAL/commit artifacts cross-reference each other by exact on-disk path and all paths resolve (verified while authoring this document).
