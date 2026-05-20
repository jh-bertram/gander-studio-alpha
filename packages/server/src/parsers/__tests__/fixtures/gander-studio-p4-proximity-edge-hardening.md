# Post-Mortem: gander-studio-p4-proximity-edge-hardening
**Date:** 2026-04-28
**Project:** `~/projects/gander-studio-alpha`
**Duration:** ~3h 18m wall-clock (PM#1 SPAWN 2026-04-28T00:15:37Z → ORC sprint-close 2026-04-28T03:33:24Z)
**Final State:** All 7 auditor advisories shipped across 2 commits (`c380956` source hygiene, `f970935` spec hardening). Audit PASS, REQVAL COVERED 12/12, human-verified in browser.

---

## 1. Original Request

**Human (2026-04-27):** Bundle pending items into a plan: (1) commit pending docs from earlier hone/agent-improvement runs, (2) bundle 5 advisories from the proximity-edge-fix audit (silent-skip → hard waitFor, tautology → toBe(initialEdgeCount+1), agent↔skill test, link-sound assertion, extract HANDLE_STYLE), (3) carry forward 2 prior advisories (compose.ts dead `META_AGENTS`, `MateriaPalette` 2-param `getMateriaColor`), (4) defer the orchestrator tool-perception meta-issue. After plan agreement: human said "commit as is, bundle bucket 2". Later authorized a third Critic round (cap exceeded) and the GANDER_ROOT env fix.

**Brief file:** `.claude/agents/tasks/outputs/gander-studio-p4-proximity-edge-hardening-PM-rev2-1777340068.md` (final, after 2 revisions)

**Scope at intake:**
- Test spec (`materia-canvas.spec.ts`): 7 tests, 4 of them pre-existing proximity tests with broken type-prefixed selectors masked by silent-skip
- Production source: 4 files (`MateriaNode.tsx`, `CardNode.tsx`, `constants/compose.ts`, `MateriaCanvas.tsx`) needed targeted hygiene edits
- New file to create: `handle-style.ts` (DRY extraction)
- No new features, no behavior change

**Skill invoked:** `dispatch-task` flow (manual — no `/dispatch` invocation, ORC orchestrated step-by-step). `convention-detect`, `assign-agents`, `audit-pipeline`, `requirements-validate`, `post-mortem`.

---

## 2. Agent Activity Log

### Phase A — Plan & Critic gate

| Seq | Timestamp (UTC)      | Event           | Agent     | Notes |
|-----|----------------------|-----------------|-----------|-------|
| 9   | 2026-04-28T00:15:37Z | SPAWN           | PM#1      | Initial decomposition |
| 10  | 2026-04-28T00:30:00Z | COMPLETE        | PM#1      | 2-task plan (FE-001 spec, FE-002 source); caught A6/A7 wrong file paths in original advisory |
| 11  | 2026-04-28T00:26:19Z | SPAWN           | CR#1      | Plan critique |
| 12  | 2026-04-28T00:46:19Z | CRITIQUE_BLOCK  | CR#1      | 2 BLOCKERs: (1) A1 selector still wrong at pre-existing sites; (2) A6 wrong line number (line 12 was META_FRAGMENTS, not META_AGENTS) |
| 13  | 2026-04-28T00:31:59Z | SPAWN           | PM#2      | Revision request |
| —   | 2026-04-28T01:25:00Z | (return)        | PM#2      | Revised plan; both BLOCKERs addressed |
| 14  | 2026-04-28T01:26:23Z | SPAWN           | CR#2      | Re-review |
| 15  | 2026-04-28T01:46:23Z | CRITIQUE_BLOCK  | CR#2      | New BLOCKER: A4 oscillator-count `=== 2` unreachable — `playApproach` fires during drag (+1 osc), then `playLink` (+2), total 3 not 2. CR#2 self-flagged: "this BLOCKER originates from CR#1's own option-(b) recipe; PM#2's implementation was faithful." |
| —   | —                    | (decision)      | HU + ORC  | Human authorized round 3 (cap is 2) — narrow A4 fix only |
| 16  | 2026-04-28T01:34:28Z | SPAWN           | PM#3      | `mode:human_authorized_third_round` — touch only A4 |
| —   | 2026-04-28T01:38:00Z | (return)        | PM#3      | Switched A4 to frequency-discriminated spy (`AudioParam.prototype.setValueAtTime` filtered to LINK_PRIMARY=880Hz / LINK_SECONDARY=1320Hz) |
| 17  | 2026-04-28T01:40:10Z | SPAWN           | CR#3      | Narrow re-review |
| 18  | 2026-04-28T01:50:10Z | CRITIQUE_PASS   | CR#3      | Frequency math verified against `useLinkSound.ts`, gate open |

**Feedback loops:** 3 PM revisions, 3 Critic rounds. All factual catches, all valuable — no spurious churn. Round 3 was a Critic-spec deficit, not a planning failure.

**Root cause of CR#1 BLOCKERs:** PM#1 propagated A1's selector fix only to the new A3 test, not to the pre-existing tests at lines 99/154. The pre-existing tests had been "passing" because the silent-skip absorbed their zero-match selectors — removing silent-skip without also fixing the selector would break them. PM#1 also made an off-by-one error on the `META_AGENTS` import line.

**Root cause of CR#2 BLOCKER:** CR#1, in addition to identifying the A4 problem, wrote a prescriptive code recipe ("reset counter to 0, assert === 2") that had its own arithmetic flaw — the recipe author did not trace `useLinkSound.ts` and `MateriaCanvas.tsx` to see that `playApproach` also fires during the drag. PM#2 implemented the recipe faithfully. CR#2 traced it to source and caught the flaw.

### Phase B — FE wave (parallel) and audit

| Seq | Timestamp (UTC)      | Event       | Agent      | Notes |
|-----|----------------------|-------------|------------|-------|
| 19  | 2026-04-28T01:44:40Z | SPAWN       | FE#1       | FE-001 spec hardening (A1–A4) |
| 20  | 2026-04-28T01:44:40Z | SPAWN       | FE#2       | FE-002 source hygiene (A5–A7) — parallel |
| 21  | 2026-04-28T02:25:00Z | COMPLETE    | FE#2       | ui_packet, all greps clean, tsc 0, build 881.67 kB |
| 22  | 2026-04-28T02:25:39Z | COMPLETE    | FE#1       | ui_packet — but introduced `locateFirstPaletteItem` helper with Agents→Skills fallback (anti-pattern) and left 2 debug-selector*.spec.ts files in tree |
| 23  | 2026-04-28T02:27:01Z | SPAWN       | AUDITOR#1  | FE-001 audit |
| 24  | 2026-04-28T02:27:01Z | SPAWN       | AUDITOR#2  | FE-002 audit (parallel) |
| 25  | 2026-04-28T02:33:17Z | AUDIT_FAIL  | AUDITOR#1  | BLOCKER 1: Skills fallback violates G6 — test named "orchestrator↔agent" actually exercises orchestrator↔skill in this dev env. BLOCKER 2: debug scratch files |
| 26  | 2026-04-28T02:35:38Z | AUDIT_PASS  | AUDITOR#2  | FE-002 PASS clean — SA/QA/SX all green |
| 28  | 2026-04-28T02:37:09Z | SPAWN       | FE#1-rem1  | Remediation: strict helpers, no fallback, delete debug files |
| —   | 2026-04-28T02:39:00Z | COMMIT      | ORC#0      | `c380956` — FE-002 durability commit (audit PASS) |
| 29  | 2026-04-28T02:42:00Z | COMPLETE    | FE#1-rem1  | Strict helpers in; debug files deleted; **but playwright now hard-fails because GANDER_ROOT has no agents** (correct G6 behavior, broken env) |

**Feedback loops:** 1 remediation cycle on FE-001. FE-002 first-pass PASS.

**Root cause of FE-001 audit FAIL:** FE#1 misread A1's intent. The advisory said "replace silent skip with hard waitFor" — FE#1 added a fallback (Agents → Skills) that *also* silently substituted, which is structurally identical to the silent-skip pattern A1 was meant to eliminate. The post-mortem G6 rule was visible in the brief but the fallback-as-graceful-degradation instinct overrode it. Also: 2 untracked debug scratch files left in the working tree, not enumerated in the packet's deliverables.

### Phase C — Env fix and re-audit

| Seq | Timestamp (UTC)      | Event         | Agent      | Notes |
|-----|----------------------|---------------|------------|-------|
| —   | 2026-04-28T02:48:00Z | (investigate) | ORC#0      | Read `.env`: `GANDER_ROOT=/home/jhber/projects/gander-studio-alpha` (no agents/skills subdir). curl confirmed: `agent.list → []`, `skill.list → []` |
| 29  | 2026-04-28T02:49:08Z | ENV_FIX       | ORC#0      | Edited `.env`: GANDER_ROOT → `/home/jhber/projects/gander`. First attempt put `.claude` in path (server appended `.claude/agents` → ENOENT); corrected to project root. Restarted dev server. Live: 11 agents, 24 skills |
| 30  | 2026-04-28T02:49:08Z | SPAWN         | AUDITOR#3  | Re-audit FE-001 against corrected env |
| 31  | 2026-04-28T03:18:27Z | AUDIT_PASS    | AUDITOR#3  | All 9 spec tests PASS (4 new proximity + 5 baseline). 13 unrelated e2e failures confirmed pre-existing |
| —   | 2026-04-28T03:19:00Z | COMMIT        | ORC#0      | `f970935` — FE-001 durability commit |

**Feedback loops:** Env round-trip — first .env edit had wrong path (appended `.claude` redundantly). Self-corrected after one curl.

### Phase D — REQVAL, archive, human-verify, close

| Seq | Timestamp (UTC)      | Event           | Agent  | Notes |
|-----|----------------------|-----------------|--------|-------|
| 32  | 2026-04-28T03:20:35Z | REQVAL_PASS     | ORC#0  | All 12 requirements COVERED; R-008 flagged for human visual |
| 33  | 2026-04-28T03:20:35Z | SPAWN           | AR#1   | Archive entries for FE-001 + FE-002 + sprint-level decisions |
| 34–36 | 2026-04-28T02:55:00Z | COMPLETE      | AR#1   | 3 archive_entry blocks appended to `docs/project_log.md` |
| 37  | 2026-04-28T03:33:24Z | COMPLETE        | ORC#0  | Sprint close after human "OK" on browser walkthrough |

**Deviation from PM brief:** None substantive. Path corrections (A6 → `constants/compose.ts`, A7 → inside `MateriaCanvas.tsx`) and selector pattern (`palette-item-{name}` no type prefix) were all caught by PM#1 pre-flight reads — the source advisories had stale paths/assumptions. Brief was internally consistent after PM#1 fixed them.

---

## 3. Post-Delivery: Runtime Bugs

None. Sprint closed clean after human browser verification. The audit-cycle FAIL on FE-001 was caught **inside** the pipeline (AUDITOR#1 caught the fallback anti-pattern before commit).

---

## 4. QA Gap Analysis

**Current QA protocol:** SA (Standards) + QA (Functional) + SX (Security) gates, plus the CR plan-gate, REQVAL post-audit gate, and human Step 4.5 visual verification.

**What this caught:**
- PM#1 selector-fix-not-propagated bug (CR#1)
- PM#1 import line off-by-one (CR#1)
- CR#1's own arithmetic flaw in A4 recipe (CR#2 traced source)
- FE#1 silent-fallback anti-pattern (AUDITOR#1)
- FE#1 left-behind debug scratch files (AUDITOR#1)
- GANDER_ROOT env misconfig (surfaced as a side-effect of removing silent-skip; AUDITOR#1 traced it via `curl http://localhost:3001/trpc/agent.list`)
- FE#2 baseline-stash methodology proved zero regressions

**What this missed:**
- *Nothing reached the human as a runtime defect.* The first audit cycle caught the FE-001 deviations; the env gap was surfaced and resolved in-pipeline.

**Where the pipeline absorbed unnecessary cost:**
- PM#1's selector-not-propagated bug should have been caught by PM itself at decomposition time. Cost: one CR round.
- CR#1's prescriptive code recipe with arithmetic flaw cost: one PM round + one CR round.
- FE#1 silent-fallback re-introduction cost: one remediation round.
- GANDER_ROOT env should have been caught by PM pre-flight env validation. Cost: ~10 min env diagnosis + one re-audit round.

**Recommendations:**
- See §6 protocol gaps.

---

## 5. Agent Performance Summary

| Agent       | Tasks | First-pass rate | Notes |
|-------------|-------|-----------------|-------|
| PM          | 1 (3 revisions) | 0/1 (0%) | All 3 revisions surfaced real issues; rounds 2 and 3 fixed Critic-introduced flaws not PM-introduced ones |
| Critic      | 1 (3 rounds)    | 1/1 PASS by round 3 | Caught all 3 BLOCKERs; round-3 cap was exceeded by human authorization |
| FE (FE-001) | 1               | 0/1 — required remediation | Reintroduced silent-fallback anti-pattern; left debug scratch files in tree |
| FE (FE-002) | 1               | 1/1 (100%)      | Clean first-pass; all greps & gates green |
| FE (rem1)   | 1               | 1/1 (100%)      | Strict helpers, debug cleanup, surfaced env issue clearly |
| Auditor     | 3 invocations   | 100% — caught the FAIL when warranted, PASSED twice when warranted | Veto power exercised correctly; baseline-stash methodology applied to distinguish regressions from pre-existing failures |
| Archivist   | 1               | 1/1             | 3 archive_entry blocks; clean output |

**Most impactful single agent action:** AUDITOR#1's surfacing of the silent-fallback anti-pattern in FE#1's helper. Without that veto, FE-001 would have shipped a test that named one thing ("orchestrator↔agent") while exercising another (orchestrator↔skill in this env). Same pattern A1 was created to eliminate.

**Recurring failure pattern:** **Silent-substitution-as-graceful-degradation** appeared three times in this sprint — original sprint p3 silent-skip (the advisory), FE#1's Agents→Skills fallback (the audit FAIL), and the GANDER_ROOT env (broken-by-default-but-masked). The instinct to "make the test/feature work no matter what" keeps inventing variations of the same anti-pattern.

---

## 6. Protocol Gaps Identified

> **Code-not-prompt check:** Three of the gaps below are deterministic shell checks pretending to be agent instructions. They should be hooks or scripts.

| Gap | Impact | Suggested fix |
|-----|--------|---------------|
| **G1: Silent-substitution-as-graceful-degradation pattern recurs across PM, FE, and env layers despite explicit advisory text against it.** A1's text said "hard-fail loud, not silent skip" — FE#1 still introduced a fallback. | One audit-fail + remediation cycle (~15 min wall, +context). | Add a `silent-substitution-check` to the FE agent's pre-COMPLETE checklist: greps for `\|\| <fallback>`, `if (!.*) {.*return;}`, `try {} catch { return <fallback> }` patterns in newly-added test code. **Code-not-prompt: implement as a `Stop` hook on FE agent — route to HR.** |
| **G2: PM does not propagate spec-level fixes to all sites within the same file.** PM#1 fixed A1's selector pattern for the new A3 test but did not propagate the fix to the two pre-existing test sites at lines 99/154 in the same spec file. CR#1 caught it but at the cost of a full plan revision. | Two PM revision rounds. | Add a `same-file-propagation-check` to PM's decomposition checklist: when an advisory cites a fix to a file, the PM must explicitly enumerate every existing instance in that file and decide for each whether the fix applies. **Agent-prompt change for PM; enforced by checklist line in PM spec.** |
| **G3: Critic gives prescriptive code recipes that contain their own bugs.** CR#1 wrote option-(b) ("reset counter to 0, assert === 2") without tracing `useLinkSound.ts` to see that `playApproach` also fires during drag. PM#2 faithfully implemented the wrong recipe. CR#2 caught it but at the cost of a third Critic round. | Cost: 1 PM round + 1 CR round + human authorization. | When the Critic identifies a code-level fix in a complex domain (audio synthesis, test spies, React Flow internals, scheduler logic), prefer "name the problem, point at the file, list the constraints" over "write the fix". Reserve prescriptive recipes for domains where the Critic can verify the recipe end-to-end via static reading. **Agent-prompt change for Critic — route to HR.** |
| **G4: PM does not pre-flight environmental dependencies before dispatching tests-against-live-API tasks.** GANDER_ROOT was misconfigured before the sprint started; the original silent-skip absorbed it. When tests went strict, the env failure surfaced inside the audit gate, not the planning gate. | ~10 min env diagnosis + 1 re-audit round + cognitive switch from "is the test broken?" to "is the env broken?". | For any FE task that runs Playwright against a live dev server, PM must add a pre-flight env-validation step: enumerate required env vars (GANDER_ROOT, etc.), run a minimal liveness check (`curl health` + `curl agent.list \| jq length > 0`), and fail-fast if env is broken. **Code-not-prompt: implement as a script invoked by `assign-agents` before FE wave dispatch — route to HR.** |
| **G5: FE agents leave untracked scratch files in the working tree.** FE#1 left `tests/e2e/debug-selector.spec.ts` and `debug-selector2.spec.ts` from its investigation. They were picked up by `npx playwright test` and emitted noise. Auditor caught it but it should have been caught at COMPLETE time. | Cleanup item in audit report; not blocking, but hygiene drift. | Add a `working-tree-untracked-spec-check` to FE pre-COMPLETE: `git status --short` should not show untracked `.spec.ts` files unless declared in `<files_modified>` or `<components_created>`. **Code-not-prompt: implement as a `Stop` hook on FE agent — route to HR.** |
| **G6: ORC has no `SendMessage`-equivalent on this Anthropic harness, so revision rounds spawn fresh PM/CR agents instead of continuing the original.** Each fresh PM/CR re-reads context. Increases token cost and risks subtle state drift between rounds. | Token cost ~30% higher than ideal across 3 PM/CR rounds. | Documented harness limitation — can't fix in spec. Workaround already in protocol: PM revision briefs include explicit `<prior_decomposition_path>` and `<critique_path>` so context is bridged via files. Acceptable as-is; mention in next system-health review if a SendMessage-like primitive becomes available. |

---

## 7. Final Deliverable State

**App/Service:** `~/projects/gander-studio-alpha`
**Build:** `npm run build -w @gander-studio/client` exit 0; main JS chunk 881.67 kB (under 1000 kB gate). `tsc --noEmit` clean across all 3 packages.
**Runtime:** Confirmed working in browser by human at sprint close. 9/9 `materia-canvas.spec.ts` Playwright tests PASS against corrected GANDER_ROOT. 13 pre-existing unrelated e2e failures unchanged.

**Features delivered (all 7 advisories):**
- A1: Strict `locateAgentPaletteItem` + `locateSkillPaletteItem` h3-landmark helpers; no `test.skip`, no `if (!isVisible) return`. Broken `[data-testid^="palette-item-agent-"]` selector eliminated from spec.
- A2: `expect(postDragEdgeCount).toBe(initialEdgeCount + 1)` replaces `toBeGreaterThanOrEqual(0)` tautology. Conditional `if (postDragEdgeCount > 0)` wrapper removed; firstEdge / data-id assertions unconditional.
- A3: New test `agent↔skill proximity drop renders a .react-flow__edge element` exercises both Agents and Skills h3 landmarks.
- A4: New test `edge creation fires link sound and renders DOM edge element` — frequency-discriminated spy on `AudioParam.prototype.setValueAtTime`, filtered to `LINK_PRIMARY_FREQ_HZ` (880) and `LINK_SECONDARY_FREQ_HZ` (1320). DOM-edge assertion runs first; audio assertion runs second (G6 ordering).
- A5: `INVISIBLE_HANDLE_STYLE` extracted to `packages/client/src/components/compose/handle-style.ts` (9-property React.CSSProperties, byte-identical to prior literals). Both `MateriaNode.tsx` and `CardNode.tsx` import it.
- A6: Dead `if (META_AGENTS.has(lower)) return 'var(--mp)';` branch removed (line 79 was unreachable; `COMMAND_AGENTS` is the same Set, intercepts first). Un-aliased `META_AGENTS,` import removed (line 11). Aliased `META_AGENTS as COMMAND_AGENTS` (line 7) and `META_FRAGMENTS,` (line 12) preserved.
- A7: `paletteRole` (`'specialist'` for agents, `'skill'` for skills) passed as third arg to `getMateriaColor` in `buildPaletteItemStyle`. No duplicate `AgentRole` import. Rendered colors unchanged.

**Key contracts (next engineer needs to know):**
- **Frequency-discriminated audio spy pattern:** when testing audio side effects, patch `AudioParam.prototype.setValueAtTime` and filter by frequency. `playApproach` = 220 Hz, `playLink` = 880 + 1320 Hz. Inject constants from `constants/canvas.ts` via serialized `addInitScript` args; do not hardcode.
- **Palette testid pattern:** items are `palette-item-{name}` with **no type prefix**. Use the section h3 (`Agents`, `Skills`) as a landmark to scope by type.
- **GANDER_ROOT requirement:** dev `.env` must point to a directory whose `.claude/agents/` and `.claude/skills/` are populated. The studio repo itself is empty in those subpaths. `~/projects/gander` is a valid value. The .env file is not git-tracked.
- **Two commits:** `c380956` (FE-002 source hygiene) and `f970935` (FE-001 spec hardening) on top of `5e73737` (today's docs chore) and `edf6621` (the proximity-edge fix this sprint hardens).

---

## 8. Skill-Use Analysis

### 8a. Skill Invocation Log

| Skill | Invocations | Outcome | Owner | Last reviewed | Notes |
|-------|-------------|---------|-------|---------------|-------|
| `convention-detect` | 1 | VALUABLE | ORC | 2026-04-27 | Surfaced existing `docs/project-conventions.md` from prior run; no diff, no rewrite. Worked as designed. |
| `assign-agents` | 1 | VALUABLE | ORC | 2026-04-27 | Produced expectation manifest; gated dispatch correctly. Manifest hard-gate enforced. |
| `audit-pipeline` | 3 | VALUABLE | ORC (via auditors) | 2026-04-27 | All 3 audit invocations produced the right verdict (FE-002 PASS, FE-001 FAIL with concrete BLOCKERs, FE-001 re-audit PASS). |
| `requirements-validate` | 1 | VALUABLE | ORC | 2026-04-27 | 12/12 requirements traced. R-008 correctly flagged for human visual verification per Step 2.5 runtime-check rule. |
| `commit-packet` | NOT_TRIGGERED | LOW_VALUE | ORC | 2026-04-22 | ORC commits performed via direct `git add` + `git commit -m` rather than skill invocation. Skill exists for this; ORC bypassed. (See 8c for analysis.) |
| `agent-log` | likely-multiple | NOT_VISIBLE | implementing agents | n/a | Implementing agents may have written Stage 1/2/3 logs; not surfaced as skill invocations in event log. |
| `jidoka` | NOT_TRIGGERED | LOW_VALUE | ORC | 2026-04-22 | Step 1.6 conditions not met (only 2 task packets, ~10 aggregate context files, well under thresholds). Correctly skipped. |
| `scry` | NOT_TRIGGERED | LOW_VALUE | ORC | 2026-04-22 | Intra-codebase sprint, no external APIs. Correctly skipped. |
| `dispatch-task` | NOT_TRIGGERED | LOW_VALUE | ORC | 2026-04-22 | ORC drove the pipeline manually rather than invoking the meta-skill. Each sub-skill invoked individually. |
| `post-mortem` | 1 (this skill) | VALUABLE | ORC | 2026-04-22 | (in progress) |

### 8b. Obsolescence Candidates

None this sprint. `jidoka` and `scry` correctly skipped; not 2+ consecutive non-value sprints.

### 8c. Content-Quality Candidates

| Skill | Deviation observed | Suspected cause | Recommended action |
|-------|--------------------|----------------|--------------------|
| `commit-packet` | ORC ran `git add <paths>` + `git commit -m <msg>` directly, skipping the formal skill invocation. The deliverable trailers (`task: …`, `Audit: PASS`) were included by hand from the skill spec's template. | AMBIGUOUS_STEP — ORC reading the skill found "scope to packet — do not git add -A" and "Audit: PASS trailer" and judged it could execute the procedure inline. The skill description does not gate this with a hard artifact like REQVAL/assign-agents do. | Either (a) tighten skill description to require formal invocation (matching the pattern in `assign-agents` / `requirements-validate`: "ORC executing the procedure inline does not satisfy the contract"), OR (b) accept inline execution and demote skill to a documentation pattern. **Decide via hone.** |

### 8d. New Skill Candidates

| Pattern observed | Frequency in sprint | Effort to encode as skill | Suggested skill name |
|-----------------|---------------------|--------------------------|---------------------|
| Pre-flight env validation before FE wave dispatch (curl health + curl agent.list/skill.list non-empty) | 1× this sprint, would have applied to multiple prior FE-against-live-API sprints | LOW (script wrapper around 3 curls, run by `assign-agents` Step 1.5) | `env-preflight` |
| Detect "silent-substitution-as-graceful-degradation" patterns in newly-added test code (greps for fallback patterns, swallowed errors, `\|\|` defaults that mask failure) | 1× this sprint, recurring pattern in this codebase | MEDIUM (shellcheck-style analyzer; needs spec definition of "silent substitution") | `silent-substitution-detect` |

### 8e. Skill Drift Candidates

| Skill | Drift observed | Suggested fix |
|-------|---------------|---------------|
| `dispatch-task` | ORC drove the pipeline turn-by-turn rather than invoking the meta-skill. This means `dispatch-task`'s composition value is unrealized in practice; ORC reads it and then executes the constituent skills directly. | Either (a) gate the meta-skill the same way `assign-agents` and `requirements-validate` are gated — make it the only valid entry point with hard artifact checks, OR (b) demote it to a documentation pattern. Decide via `hone`. |

### Hand-off to hone

> Post-mortem Section 8 complete. 10 skills logged. 0 obsolescence candidates, 1 content-quality candidate (`commit-packet`), 2 new skill candidates (`env-preflight`, `silent-substitution-detect`), 1 drift candidate (`dispatch-task`). Run the `hone` skill to act on these findings.

---
