# After-Action: prog-studio-vision-2026-06 (Gander Studio Vision program — 5 sprints)
**Date:** 2026-06-20
**Project:** `~/projects/gander-studio-alpha`
**Duration:** ~6 hours wall-clock, one autonomous `/zoey` session (exec SPAWN seq 10 → program-close seq 35; planning/moirai at seq 5–8 was a prior session)
**Final State:** All 5 siblings delivered, audited PASS, ORC-live-re-verified, committed on a feature branch, and **merged to `main` via PR #1** (`745f5d7`). Zero defects shipped to the human; build/lint clean, server tests 108/108, per-sprint e2e all green.

---

## 1. Original Request

**Human (2026-06-10, re-triggered 2026-06-20):** Use Fable to evaluate Gander Studio start-to-finish as a tool / basic OS for evaluating/studying/planning multi-agent coding projects — what works, what's redundant, what makes it fun — then create a multi-sprint plan to clean up and smooth out the vision of a fun, playful, interactive Gander Studio. On 2026-06-20 the human ratified **"Run all 5 autonomously"** (AskUserQuestion) — execute the planned program end-to-end.

**Brief files:** `docs/programs/prog-studio-vision-2026-06/program.md` + 5 sibling `orchestrator_brief.md`. Source evaluation: `.claude/agents/tasks/outputs/gander-studio-meta-fable-eval-ORC-EVAL-1781056770.md`.

**Scope at intake:** Seven shipped surfaces (Browse/Compose/Edit/Export/Graph/Progression/Sessions), of which Export and Edit-save were silently non-functional, the Sessions editor could corrupt data, and the whole app rendered Shadcn primitives invisibly (near-black-on-dark). The program scoped: token root-fix (s1), the 6 HIGH defects (s2), three agent-OS surfaces (s3), cleanup/docs (s5), juice (s4).

**Skill invoked:** `moirai` (decomposition, prior session) → 5× per-sprint Workflow pipeline (PM→Critic→implement→audit) → `skein` reconcile (this session) → `after-action`.

---

## 2. Agent Activity Log

Execution mechanic: each sprint ran as a **Workflow accelerant** dispatching REAL subagents (project-manager → critic → FE/BE/ui-designer → code-auditor), with base-plan parity preserved additively (`.claude/tasks/{sprint}.md` stubs + SPAWN/COMPLETE via `log-event.sh`). The event log carries sprint-level `WF#N` events + auditor `AUDIT_PASS` + ORC's `AUDIT_FAIL`; internal Critic BLOCK→revise rounds are recorded in the `CR-*` packets.

### s1 — token-root-fix (`61c6906`, + contrast-spec fixup `8890eb1`)

| Seq | Event | Agent | Notes |
|-----|-------|-------|-------|
| 10 | SPAWN | WF#3-s1 | PM→Critic→UI→FE→audit. **Critic BLOCKed** (process-gate: absent sc-precheck report + DESIGN.md migration-supersession framing + p4 port-mismatch risk) → PM revised → PASS. |
| 13 | AUDIT_PASS | AUD#1 | SA/QA/SX PASS on static diff. |
| 14 | COMPLETE | WF#3-s1 | Shadcn `@layer base` → FF7 `var()`; `.dark` removed; `--mt`→#6db0c8, `--wm`→0.55; DEFERRED-005 closed. |
| 34 | SPAWN | FE#rem2 | **Integration remediation:** contrast-smoke spec 4/6 RED — `BASE` pinned to `:3001` (JSON API) not `:5173`. Test-only fix → `8890eb1`. Contrast itself was correct AA all along. |

**Feedback loops:** 2 — Critic BLOCK→revise; contrast-spec remediation at integration.

### s2 — fix-broken-surfaces (`ebaa0f8`)

| Seq | Event | Agent | Notes |
|-----|-------|-------|-------|
| 15 | SPAWN | WF#4-s2 | PM→Critic→parallel[FE-client, BE-router, BE-stats]→FE-e2e→audit. **Critic BLOCKed** (t1 OVERSCOPED 4-file→split; D4 slug wholesale-replace would regress s3's dotted-version fix→make additive; D3 named wrong file) → PM-rev1 → PASS. |
| 17 | AUDIT_PASS | AUD#1 | SA/QA/SX PASS on static diff — **auditor did NOT re-run the 5 authored Playwright specs** (`<playwright tier="SKIPPED">`, still PASS). |
| 18 | **AUDIT_FAIL** | **ORC#0** | **ORC live-e2e caught a D1 regression the static audit missed:** `ExportPage.tsx:79 useCanvasStore(selectLoadoutPayload)` → unstable object ref → "Maximum update depth exceeded" infinite render loop — strictly worse than the dead button it replaced. |
| 19 | SPAWN | FE#rem1 | remediation_export_loop: stable nodes/edges slices + useMemo; ran 5 e2e LIVE (15/15). Spawned, not fixed inline (honors no-inline-fix memory). |
| 20 | COMPLETE | WF#4-s2 | D1–D6 + feedback_loops contract (SEAM-04). lint 0, server 82/82, e2e 15/15 live. |

**Feedback loops:** 3 — Critic BLOCK→revise; ORC live-e2e AUDIT_FAIL→remediation; authored-not-executed e2e (the remediation's live run is what surfaced the loop).

### s3 — agent-os-legibility (`fc8e18d`, + missed-file fixup `981b20a`)

| Seq | Event | Agent | Notes |
|-----|-------|-------|-------|
| 21 | SPAWN | WF#5-s3 | BE→parallel[FE-surfaces, FE-timeline]→FE-e2e→audit (live e2e mandatory). **Critic PASS round 1** (2 warnings only — the only first-pass-clean plan). |
| 24 | AUDIT_PASS | AUD#1 | SA/QA/SX PASS; live e2e mandated + run (9/9). |
| 25 | COMPLETE | WF#5-s3 | planning.list + program.getDag + PlanningPage + ProgramDagPage (RF/dagre) + AgentTimeline all-ev-types + robustness. server 108/108, e2e 9/9, render-loop CLEAR. **Packaging slip:** ProgramDagPage imports `components/dag/SprintNode.tsx`; ORC's scoped `git add` missed it (untracked, present locally). |

**Feedback loops:** 0 within-sprint. The missed-file defect was caught downstream at s5 staging (fixup `981b20a`).

### s5 — cleanup-docs (`ccf13a6`, sequential after s3; carried the s3 fixup)

| Seq | Event | Agent | Notes |
|-----|-------|-------|-------|
| 26 | SPAWN | WF#6-s5 | Sequential pipeline: deletions→DRY→role-color→docs→audit(lint+full-e2e+build). **Critic BLOCKed** (SESSION_TABS is LIVE not placeholder→over-deletion; ErrorState 4→1 collapse drops AnalyzeTab's distinct fallback→add `fallbackMessage` prop; role-color divergence is 5 agents not 2) → PM-rev1 → PASS. |
| 28 | AUDIT_PASS | AUD#1 | SA/QA/SX PASS; build clean; e2e +6/−0 (stash-differential). |
| 29 | COMPLETE | WF#6-s5 | Deletions/DRY/role-color/devDeps/DEFERRED-002/CLAUDE.md→22 procedures. Staged the missed `SprintNode.tsx` as fixup `981b20a`. Flagged 56 pre-existing Sidebar-spec e2e failures. |

**Feedback loops:** 1 — Critic BLOCK→revise (the program's highest-value gate, see §5).

### s4 — juice-pass (`e226e96`, final)

| Seq | Event | Agent | Notes |
|-----|-------|-------|-------|
| 30 | SPAWN | WF#7-s4 | UI-spec→foundation(mute+reduced-motion+keyframes)→parallel[timeline, progression, D7+sounds+graph]→e2e→audit. **Critic BLOCKed** (p6 OVERSCOPED 6-file→split p2/p6/p8; wave file-disjointness; spec dir not collected) → PM-rev1 → PASS. |
| 32 | AUDIT_PASS | AUD#2 | Fresh auditor. **Instrumented `OscillatorNode.start`** to live-prove INV-7: mute=0 starts incl. Compose tones; 7 animations → `animation-name:none` under reduced-motion. |
| 33 | COMPLETE | WF#7-s4 | Mute+reduced-motion foundation, timeline/progression juice, D7, sounds, GraphPage interactivity. lint 0, e2e 12/12. |

**Feedback loops:** 1 — Critic BLOCK→revise.

**Cross-sprint deviations (correct calls):** (1) ORC overrode the moirai-planned **s3∥s5 parallelism to sequential s3→s5** — they share `router.ts`/`schemas.ts`/`AgentTimeline.tsx` and s5-p6 documents s3's new surfaces. (2) The s3 missed-file fixup was absorbed at s5 staging rather than amending a clean commit. (3) GHOST_CONFIRMED tombstones (seq 11/22/36) for Agent-tool returns the Stop hook couldn't auto-log — handled monitor-only, no double-log.

---

## 3. Post-Delivery: Runtime Bugs

**Framing note:** *Nothing escaped to the human* — every defect below was caught by ORC's own live verification *before* its commit (or before merge). They are documented here because the **per-sprint audit gate passed all of them**; ORC's extra live-verification net, not the gate, was what stopped them. That net is a personal habit, not a system rule — see §6/§9.

**Bug 1 — s2 ExportPage infinite render loop (crash).**
- **Error:** `Maximum update depth exceeded` / `getSnapshot should be cached` — page blank on mount.
- **Root cause:** `useCanvasStore(selectLoadoutPayload)` where `selectLoadoutPayload` returns a fresh `{agents,skills,hooks,connections}` object each call; Zustand v5's `useSyncExternalStore` reschedules a render on every non-`Object.is` snapshot. Object-identity-over-time is invisible to `tsc` (return *type* is stable) and to a diff read (the call is idiomatic).
- **Caught:** ORC live-e2e, pre-commit (seq 18).
- **Why agents didn't catch it:** the s2 auditor returned SA/QA/SX PASS on a static diff and *self-documented* skipping the 5 authored Playwright specs that would have thrown on first paint. **Fix:** FE#rem1 — stable `nodes`/`edges` slices + `useMemo` (useShallow was itself unstable here).

**Bug 2 — s1 contrast-smoke spec 4/6 RED (false failure).**
- **Symptom:** 4 contrast tests failed despite tokens being correct AA.
- **Root cause:** `BASE='http://localhost:3001'` (the tRPC JSON API) instead of `:5173` (the Vite client) — tests read `rgb(0,0,0)` browser defaults off a JSON page.
- **Caught:** at integration, full-suite sweep (FE#rem2, seq 34). **Why missed:** authored as an s1 gate but never executed in-sprint (no dev server during s1). **Fix:** BASE→5173, parseColor handles hex. Contrast verified correct three ways (Python, live probe, 6/6 after fix).

**Bug 3 — s3 SprintNode.tsx missing from commit.**
- **Symptom:** `ProgramDagPage.tsx` (committed `fc8e18d`) imports `components/dag/SprintNode.tsx` (168 lines) that was never staged; local build passed (untracked file present), a fresh checkout would fail import resolution.
- **Root cause:** ORC's scoped `git add` honored the packet's enumerated files but the packet omitted the new dependency; commit-packet Step 4 treats untracked as benign.
- **Caught:** s5 staging → fixup `981b20a`. **Why missed:** no gate distinguishes working-tree state from staged-commit contents.

**Bug 4 — 56 pre-existing e2e failures (surfaced, not caused).**
- Stale specs targeting the Sidebar nav removed in p7-1 (before this program); no CI. Per-sprint audits scope e2e to their own new specs, so the debt was invisible. s5 fixed 6, introduced 0 (stash-differential proven). Out of program scope; flagged for a suite-hardening sprint.

---

## 4. QA Gap Analysis

**Current QA protocol:** per-sprint code-auditor runs SA (standards/tsc/no-`any`), QA (functional, *advisory* Playwright), SX (security/path-guards) on the diff.

**What this caught (the gate worked):** every standards/type/security issue; s4's AUD#2 went *beyond* the deliverable to instrument `OscillatorNode.start` and live-prove INV-7; s5's audit ran a full-suite stash-differential to prove 0 new failures; the Critic plan-gate BLOCKed 4/5 plans with substantive findings.

**What this missed (every instance is the same shape):**
- **Runtime render state** — a static diff cannot observe a React render loop; only a live mount throws. The s2 auditor downgraded Tier-1 Playwright to advisory and used `tsc` as a runtime proxy. *Counterfactual: had it run the authored specs against a dev server, PAGEERROR on first paint catches it immediately.*
- **Authored-but-not-executed specs** — twice (s2 SKIPPED-but-PASS; s1 wrong-base-URL). A spec in the diff that is never run is a green light with no bulb behind it.
- **Commit/tree consistency** — `audit PASS` reads the working tree, never "does the *staged set* build on a clean checkout."

**Recommendations:** make live Playwright **gating, not advisory**, for any FE/store-selector diff (a `SKIPPED` Playwright field must force QA `INDETERMINATE`, never PASS); add an import-closure check to commit-packet; teach env-preflight the client port. (Full deltas in §9.)

---

## 5. Agent Performance Summary

| Agent | Tasks | First-pass rate | Notes |
|-------|-------|-----------------|-------|
| project-manager | 5 decompositions | **1/5 clean** (s3) | s1/s2/s4/s5 BLOCKED→revised. Recurring miss = OVERSCOPED (s2 t1 = 4 files/3 defects; s4 p6 = 6 files/4 surfaces) + a wrong-file assumption (D3 named EditorTab.tsx; seam was in useSessionRaw.ts). Strong counter-positive: caught the D4 slug→s3 regression and reframed it additive. |
| critic | 5 plan gates | **BLOCKED 4/5, all substantive** | The program's highest-leverage gate. s5 BLOCK is the single most impactful action (below). Limitation: reads statically — *forecast* the s2 selector class but couldn't execute, so the loop fell to ORC. |
| ui-designer | 2 specs (s1, s4) | 2/2 | s4 motion/role-color spec drove the mute+reduced-motion+keyframe foundation the auditor live-proved. DESIGN.md write-ownership was a Critic AUDIT_RISK, resolved by waiver. |
| frontend-engineer | ~10 packets + 2 remediations | locus of all 3 runtime/integration misses | Every escaped defect is FE-shaped and static-clean: the Zustand loop, the wrong-base-URL spec, the missed import. Surfaces themselves (Planning/Program-DAG/timeline/juice) landed well. |
| backend-engineer | 4 packets | **4/4 PASS, 0 regressions** | Cleanest implementer record. schemas.ts single-source + tRPC discipline held (108/108). |
| code-auditor | 5 audits (AUD#1×4, AUD#2) | 5/5 PASS — but 2 PASSes were static-only over live defects | Split verdict: s4 AUD#2 exemplary (oscillator proof); s2 AUD#1 returned PASS while skipping the specs that would have caught the crash. |

**Most impactful single agent action:** the **s5 Critic BLOCK catching the SESSION_TABS over-deletion** — the DELETE packet listed "SESSION_TABS placeholder machinery" for removal; the Critic verified on disk that it's the *live* 4-tab bar wired at 6 call sites (incl. keyboard-nav) and pulled it from scope. It *also* caught the ErrorState fallback-message divergence (a cold-path silent collapse no e2e covers) and corrected the role-color enumeration from 2 to 5 classifiers. One BLOCK, three prevented regressions.

**Recurring failure pattern:** **static-audit-passes-but-runtime/spec-broken** — 4 instances. Type-clean + diff-idiomatic + security-clean repeatedly coexisted with a crashing page, a false-failing spec, and a structurally-incomplete commit. ORC's live verification was the only thing between green gates and shipped breakage.

---

## 6. Protocol Gaps Identified

> **Code-not-prompt check applied** — three of five gaps below resolve to a hook/script/settings artifact, not an agent-prompt tweak.

| Gap | Impact | Suggested fix |
|-----|--------|---------------|
| (a) Auditor marks e2e "authored" but never executes — and a `SKIPPED` Playwright verdict can still return PASS (s2 + s1, twice). | Crash-class & false-failure defects pass the gate; ORC is the unguarded safety net. | **HARD GATE (hook):** a `SubagentStop`/verdict-validator hook that fails an `audit_review` whose `<playwright tier="SKIPPED">` coexists with `<overall_status>PASS</overall_status>` when the diff touches `.spec.ts`/store selectors → forces `INDETERMINATE`. **+ skill:** `audit-pipeline` rule making live Playwright gating for FE/selector diffs. **Route to HR.** |
| (b) Scoped `git add` missed a new imported file (s3 SprintNode.tsx); untracked treated as benign. | A commit that builds locally fails a fresh checkout. | **Script + skill-step:** add to `commit-packet` Step 4 a helper that greps each staged file's local imports and HALTs if any resolve to an untracked (`??`) module. **Route to HR.** |
| (c) Wrong base-URL in an FE spec (3001 vs 5173) silently green/red. | Specs assert on a JSON page; gate is theater. | **Script/sub-check:** add a `spec-base-url` check to `sa-subchecks` (or `env-preflight`) — a spec asserting computed styles whose BASE is the API port is a FAIL. |
| (d) Zustand unstable-selector class — `useStore(fn returning new object)` → render loop, statically invisible. | Crash-class regression, repeatable. | **Settings/toolchain (project-local):** add ESLint to gander-studio-alpha with a rule flagging non-memoized object/array-returning store selectors; **+** a `sa-subchecks` grep as the meta-team backstop. |
| (e) Workflow-accelerant emitted base-plan events only at SPRINT granularity (`WF#N`), not per-internal-agent — internal PM/Critic/FE/auditor activity is reconstructable only from packets, not the event log. | Observability is coarser than a base-plan run; GHOST_CONFIRMED churn on Agent returns. | **Script:** extend the accelerant wrapper / `subagent-complete-backfill` to emit per-internal-agent SPAWN/COMPLETE (or an output-file-vs-event reconciler), so accelerant runs match base-plan observability granularity. **Route to HR.** |

---

## 7. Final Deliverable State

**App:** `~/projects/gander-studio-alpha` — on `main` at `745f5d7` (PR #1).
**Build:** `npm run build` EXIT 0 (2496 modules; ~1.0 MB main chunk — pre-existing, flagged). **Lint:** EXIT 0 (tsc strict ×3, zero new `any`). **Runtime:** confirmed working live (5173/3001).

**Features delivered:** working Export (canvas-store + real connections) & Edit-save (real `agent.save`/`skill.save`); per-session edit buffer (no cross-session corruption); case-insensitive prose-H1 slug; `saveEdit` round-trip; Shadcn→FF7 `:root` remap (invisible-text class dead at root) + WCAG-AA tokens; **new Planning + Program-DAG surfaces** + `planning.list`/`program.getDag` (router now 22 procedures); AgentTimeline renders all event types; global **mute + prefers-reduced-motion** guard; role-colored timeline juice, Progression character sheet, D7, sounds, GraphPage interactivity; feedback_loops semantics unified (same-agent gate dropped — non-zero on real logs).

**Key contracts (next engineer):** 7 integration seams all STITCHED (`skein-report.md`); feedback_loops rule at `seam-04-feedback-loops-contract.md`; canonical agent role→color = `browse.ts AGENT_MATERIA` (DESIGN.md Record B); `globals.css :root` is the single token source (`.dark` removed). 22 tRPC procedures (CLAUDE.md refreshed).

**Server tests:** 108/108. **Per-sprint e2e (live):** s1 6/6, s2 15/15, s3 9/9, s4 12/12. **Known issues:** 56 pre-existing Sidebar-spec e2e failures + no CI; DEFERRED-006 (`--redb`-as-text below AA); ~1 MB bundle; a few untracked inert debug specs needing manual `rm` (sandbox-blocked).

---

## 7b. Progression Ledger Entry (AA-§7)

**sprint_id:** `prog-studio-vision-2026-06`

**xp_gained:**
- surface: Connectivity | delta: 7 cross-sprint seams authored + all reconciled STITCHED; the Studio is now a coherent agent-OS, not 7 disjoint viewers
- surface: CLAUDE.md | delta: refreshed to the real 22 tRPC procedures + full surface set (was a stale 12)
- surface: Skills | delta: surfaced 3 codifiable skill candidates (sprint-verify-close, orc-live-runtime-gate, sibling-file-overlap-serialize) + 4 audit/commit/env-preflight deltas
- surface: Refs | delta: DESIGN.md gained the canonical Shadcn→FF7 token Records A/B + s4 motion record

**levels_advanced:**
- Proved the accelerant-with-live-verification model: 5 sprints through real-subagent pipelines while ORC live-e2e remained the runtime gate that caught what static audits missed
- Demonstrated ORC-as-runtime-safety-net catching a crash-class regression (Zustand loop) the SA/QA/SX gate passed

**new_capabilities:** None this sprint (no new deterministic hook/script shipped — but §6/§9 propose five; see agent-improvement hand-off).

```jsonl
{"sprint_id":"prog-studio-vision-2026-06","xp_gained":[{"surface":"Connectivity","delta":"7 cross-sprint seams authored + all reconciled STITCHED"},{"surface":"CLAUDE.md","delta":"refreshed to real 22 tRPC procedures + full surface set"},{"surface":"Skills","delta":"3 new-skill candidates + 4 audit/commit/env-preflight deltas surfaced"},{"surface":"Refs","delta":"DESIGN.md gained canonical Shadcn->FF7 Records A/B + s4 motion record"}],"levels_advanced":["accelerant-with-live-verification model proven across 5 sprints","ORC-as-runtime-safety-net caught a crash-class regression static audit passed"],"new_capabilities":[]}
```

---

## 8. Skill-Use Analysis

### 8a. Skill Invocation Log

| Skill | Invocations | Outcome | Owner | Last reviewed | Notes |
|-------|-------------|---------|-------|---------------|-------|
| moirai | 1 (prior session) | VALUABLE | ORC | 2026-06-20 | 5-sibling DAG + 7 seams; all STITCHED at skein with no integration sprint. SEAM-05 over-deletion hazard was pre-flagged in the manifest. |
| workflow-orchestration (accelerant) | 5 (WF#3–7) | VALUABLE | ORC | 2026-06-20 | Full real-subagent pipeline per sprint at throughput; base-plan parity preserved additively; did NOT substitute for verification. Observability coarser than base-plan (see §6e). |
| log-event | ~20 events | VALUABLE | ORC | 2026-06-20 | The queryable trail this analysis is grounded in; seq continuity held across 42 events, no corruption (the critic event-log write-hazard did not recur). |
| commit-packet / scoped-staging | 5 commits | **PARTIAL_VALUE** | ORC | 2026-06-20 | Scope discipline right and held for enumerated paths, BUT the scoped-add is only as complete as the packet's `files_created` — s3 omitted SprintNode.tsx → missed-file. Needs import-closure check (§8c). |
| skein | 1 | VALUABLE | ORC | 2026-06-20 | Reconciled all 7 seams STITCHED; no integration work needed. |
| after-action | 1 (this) | VALUABLE | ORC | 2026-06-20 | Reconstructed per-role first-pass rates + isolated the static-vs-runtime pattern from packets+event log without re-running. Value realized only if §9 deltas land. |

### 8b. Obsolescence Candidates
None this sprint.

### 8c. Content-Quality Candidates

| Skill | Deviation observed | Suspected cause | Recommended action |
|-------|--------------------|-----------------|--------------------|
| audit-pipeline | Returned `<overall_status>PASS</overall_status>` with `<playwright tier="SKIPPED">` on an FE diff; used tsc as a runtime proxy. | AMBIGUOUS_STEP (advisory vs gating live-e2e) | CLARIFY — make live Playwright gating for FE/selector diffs; SKIPPED→INDETERMINATE. |
| commit-packet | Committed a staged file importing an untracked new module (Step 4 treats `??` as benign). | OVER_SPECIFIED (untracked-is-benign rule too broad) | CLARIFY — add new-import closure HALT. |
| env-preflight | Only probes the API server (3001); blind to client-port (5173) confusion in specs. | STALE (predates client-asserting e2e) | UPDATE — add client liveness + spec-base-URL check. |

### 8d. New Skill Candidates

| Pattern observed | Frequency | Effort | Suggested name |
|------------------|-----------|--------|----------------|
| ORC ran PM→Critic→implement→audit then its OWN deterministic live-verify+commit close (lint/server-tests/live-e2e/render-loop probe + scoped commit + parity stubs) identically each sprint. | 5× | MEDIUM | `sprint-verify-close` |
| ORC treated a static-audit PASS as provisional and ran the spec suite live, re-opening AUDIT_FAIL on a render-loop / SKIPPED-playwright / wrong-base-URL finding → FE remediation spawn. | 5× (2 as explicit remediations) | MEDIUM | `orc-live-runtime-gate` |
| Detect file-overlap between sibling sprints planned as parallel, serialize the overlapping pair. | 1× (s3→s5) | LOW | `sibling-file-overlap-serialize` |

### 8e. Skill Drift Candidates
None beyond the §8c content-quality items.

### Hand-off to hone
Post-mortem Section 8 complete. 6 skills logged. 0 obsolescence, 3 content-quality, 3 new-skill, 0 drift candidates. **Run the `hone` skill** to act on these findings.

---

## 9. Rule / Ref / CLAUDE.md Delta Proposals

| Target file | Proposed change | Priority | Rationale |
|-------------|----------------|----------|-----------|
| `~/.claude/skills/audit-pipeline/SKILL.md` | Make live Playwright **gating, not advisory** for any diff that ships/edits `.spec.ts` OR rewires store selectors: a `<playwright tier="SKIPPED">` forces `<qa status="INDETERMINATE">` and blocks PASS (mirror the eval-gate INDETERMINATE pattern); auditor must run live or hand the runtime gate back to ORC explicitly. | HIGH | s2 Zustand loop passed SA/QA/SX on a static read; the AUD packet self-documents skipping the specs that would have caught it. A skipped-but-PASS playwright field is the load-bearing failure. |
| `~/.claude/skills/commit-packet/SKILL.md` | Step 4: for every staged path, grep its local imports; any imported module that is NEW+untracked (`??`) and not in the staging set HALTs (not warns). Replaces the "untracked do not halt, proceed" line. | HIGH | s3 shipped ProgramDagPage importing untracked SprintNode.tsx; clean checkout fails. |
| `~/.claude/skills/env-preflight/SKILL.md` | Add client-liveness (Vite 5173 returns HTML + exposes CSS custom props) + flag any FE spec whose BASE points at the API port while asserting rendered styles. | MEDIUM | s1 contrast-smoke used BASE=:3001 → 4/6 false-fails on a JSON page; preflight only knows 3001. |
| `~/.claude/rules/standards.md` (## Git Workflow) | Add a "Scoped-commit completeness" clause: a scoped `git add` must also stage any NEW local module its files import; an untracked imported dependency is a defective commit. | MEDIUM | Standards-level codification of the commit-packet change; same SprintNode evidence. |
| `~/.claude/rules/standards.md` (## Verification) | For any sprint changing FE rendering/store-selector code, "audit PASS" is STATIC-PASS only until a live e2e/dev-server run; the runtime gate stays open until live execution. | HIGH | Both s2 and s1 specs were static-passed but never executed; ORC's manual live runs were the only net. The discipline lives in ORC habit, not the system. |

---

## 10. Eval Gap Proposals

| Agent / Skill | Gap description | Suggested eval | Priority |
|---------------|-----------------|----------------|----------|
| code-auditor / audit-pipeline | No eval for the render-loop-survives-static-audit class (unstable Zustand selector: tsc-clean, crashes at runtime). | Diff with an unstable selector + paired spec → assert auditor runs the spec live (catches loop) OR returns QA INDETERMINATE; flat PASS = FAIL. | HIGH |
| code-auditor / audit-pipeline | No eval for authored-not-executed / wrong-base-URL specs. | Fixture with (a) a spec the auditor must execute before PASS and (b) a spec whose baseURL is the API port → assert URL-mismatch flagged / run against client. | HIGH |
| env-preflight | No eval proving it distinguishes client (5173) from API (3001) for style-asserting specs. | Project whose FE specs assert computed styles must FAIL preflight when only 3001 is up or a spec's BASE is the API port. | MEDIUM |
| commit-packet | No eval for new-file import-closure. | Staging set {ProgramDagPage.tsx} importing untracked SprintNode.tsx → assert HALT with import-closure violation. | MEDIUM |

---

## 11. Connectivity Findings

**Analyzer run this sprint:** No — `connectivity-analyzer` was not run for gander-studio-alpha this program (no `docs/connectivity-graph.json` here; the 2026-06-20 event log has zero analyzer SPAWN/COMPLETE). Manual observations: no dead refs introduced (lint + build clean; all 7 seams reconciled, all imports resolve post-fixup). One orphan-class note — the missed `SprintNode.tsx` was a transient tree/commit-graph inconsistency (now resolved by `981b20a`), exactly the kind of edge an analyzer over the *staged* tree would flag. Recommend running `connectivity-analyzer` over the merged `main` to confirm no dangling refs from the s5 deletions.
