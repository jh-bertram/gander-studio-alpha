# Post-Mortem Summary: gander-studio-p4-proximity-edge-hardening

**Archivist:** AR  
**Task ID:** gander-studio-p4-proximity-edge-hardening-postmortem  
**Date:** 2026-04-28T04:00:00Z  
**Output Destination:** `docs/project_log.md` (archive_entry appended)

---

## Executive Summary

Gander Studio p4 proximity-edge-hardening sprint completed successfully on 2026-04-28. All 7 auditor advisories shipped across 2 commits with full audit coverage. Post-mortem identified 6 protocol gaps and 4 skill findings requiring follow-up.

- **Outcome:** Clean close after human browser verification
- **Deliverables:** 2 commits (c380956, f970935); 9/9 spec tests PASS; 12/12 requirements COVERED
- **Protocol Gaps:** 6 identified (G1–G6); 3 require hook implementation, 1 requires skill design, 1 requires Critic spec change, 1 documented limitation
- **Skill Findings:** 1 content-quality candidate, 2 new-skill candidates, 1 drift candidate

---

## Protocol Gaps (Section 6)

### G1: Silent-Substitution-as-Graceful-Degradation Pattern Recurs

**Impact:** FE#1 reintroduced fallback (Agents→Skills) violating G6 hard-fail principle A1 was designed to eliminate. AUDITOR#1 caught it → 1 remediation cycle cost.

**Root Cause:** Fallback-as-graceful-degradation instinct overrides explicit principles in brief.

**Fix:** Add **Stop hook on FE agent** to grep newly-added test code for fallback patterns:
- `\|\| <fallback>`
- `if (!.*) return <fallback>`
- `try {} catch { return <fallback> }`

**Routing:** HR (hook implementation required)

---

### G2: PM Does Not Propagate Spec-Level Fixes to All Sites Within Same File

**Impact:** PM#1 applied A1's selector fix only to new A3 test, missed pre-existing tests at lines 99/154 in same file. CR#1 caught it → 1 plan revision cycle cost.

**Root Cause:** PM decomposition did not enumerate all instances of the pattern.

**Fix:** Add **same-file-propagation-check to PM's decomposition checklist:**
- When an advisory cites a file fix, enumerate every existing instance
- Decide for each whether the fix applies
- Document decisions in task description

**Routing:** Agent-prompt change for PM (checklist line enforcement)

---

### G3: Critic Gives Prescriptive Code Recipes With Arithmetic Bugs

**Impact:** CR#1's option-(b) recipe for A4 ("reset counter to 0, assert === 2") had arithmetic flaw (playApproach also fires during drag, count=3 not 2). PM#2 implemented faithfully; CR#2 caught it → 1 PM round + 1 CR round + human authorization.

**Root Cause:** Critic attempted to write the fix rather than analyze problem end-to-end.

**Fix:** **Critic spec change** — When identifying code-level fix in complex domains (audio synthesis, test spies, React Flow internals, scheduler logic), prefer:
- Problem statement + file pointer + constraints
- Over prescriptive code recipes

Shift verification burden from Critic code-correctness to implementing agent problem-solving.

**Routing:** HR (Critic spec revision required)

---

### G4: PM Does Not Pre-Flight Environmental Dependencies

**Impact:** GANDER_ROOT misconfigured (studio repo, not agents repo) before sprint. Original silent-skip absorbed broken env. When tests went strict, env failure surfaced inside audit gate (~10 min diagnosis + 1 re-audit round) instead of planning gate.

**Root Cause:** PM task decomposition did not validate dev environment before dispatch.

**Fix:** **Code-not-prompt: new `env-preflight` script** invoked by `assign-agents` before FE wave dispatch:
- Enumerate required env vars (GANDER_ROOT, LOADOUTS_DIR)
- Run minimal liveness check: `curl http://localhost:3001/health`
- Run `curl http://localhost:3001/trpc/agent.list | jq length > 0`
- Fail-fast if env broken

**Routing:** HR (script implementation required; can be escalated to skill design if scope grows)

---

### G5: FE Agents Leave Untracked Scratch Files in Working Tree

**Impact:** FE#1 left `debug-selector.spec.ts` and `debug-selector2.spec.ts` from investigation phase. Auditor caught cleanup item; should have been caught at COMPLETE time.

**Root Cause:** No working-tree hygiene check in FE pre-COMPLETE.

**Fix:** **Stop hook on FE agent** — Add `working-tree-untracked-spec-check` to FE pre-COMPLETE:
```bash
git status --short | grep '\.spec\.ts' | grep -v '<files_modified>' | grep -v '<components_created>'
```
Should return empty. Fail if untracked .spec.ts files found.

**Routing:** HR (hook implementation required)

---

### G6: ORC Has No SendMessage Primitive on This Harness

**Impact:** Revision rounds spawn fresh PM/CR agents instead of continuing originals. Token cost ~30% higher across 3 PM/CR rounds due to re-reading context.

**Workaround:** Revision briefs include explicit `<prior_decomposition_path>` and `<critique_path>` so context bridged via files. Already in protocol.

**Fix:** Documented limitation — acceptable as-is. Mention in next system-health review if SendMessage-like primitive becomes available.

**Routing:** None (documented limitation)

---

## Skill Findings (Section 8)

### Content-Quality Candidate: commit-packet

**Deviation:** ORC ran `git add <paths>` + `git commit -m <msg>` directly, bypassing formal skill invocation. Skill spec provides template; ORC read it and executed inline.

**Suspected Cause:** Skill description does not gate with hard artifact like `assign-agents`/`requirements-validate` do.

**Recommendation:** Either
- (a) Tighten spec to require formal invocation (matching `assign-agents` pattern: "ORC executing inline does not satisfy contract"), OR
- (b) Accept inline execution and demote skill to documentation pattern

**Routing:** `hone` skill (decide via design review)

---

### New-Skill Candidate 1: env-preflight

**Pattern Observed:** Pre-flight environment validation before FE-against-live-API task dispatch.

**Frequency:** 1× this sprint; would have applied to multiple prior FE sprints.

**Effort:** LOW (wrapper around 3 curl commands, invoked by `assign-agents` Step 1.5)

**Addresses:** G4

**Suggested Spec:**
- Input: FE task packet with `requires_live_api: true` flag
- Execution: Run health check + agent.list + skill.list length check
- Output: PASS (env ready) or FAIL (env broken, specific error)
- Integration point: `assign-agents` Step 1.5, before FE wave dispatch

**Routing:** Human design (or skill-creator agent if scope grows)

---

### New-Skill Candidate 2: silent-substitution-detect

**Pattern Observed:** Detect "silent-substitution-as-graceful-degradation" patterns in newly-added test code.

**Frequency:** 1× this sprint; recurring pattern in this codebase (p3, p4, env issues).

**Effort:** MEDIUM (spec definition + shellcheck-style analyzer for fallback patterns)

**Addresses:** G1

**Suggested Spec:**
- Input: FE task packet with list of modified/created test files
- Grep patterns:
  - `\|\| <fallback>` (OR fallback)
  - `if (!.*) return <fallback>` (conditional short-circuit)
  - `try {} catch.*return <fallback>` (swallowed error)
  - `return.*\|\| <default>` (implicit defaults)
- Output: List of line numbers + pattern type for each match; FAIL if matches found
- Integration point: FE post-COMPLETE gate before submission to auditor

**Routing:** Human design (or skill-creator agent if scope grows)

---

### Drift Candidate: dispatch-task

**Drift Observed:** ORC drove pipeline turn-by-turn rather than invoking the meta-skill. This means `dispatch-task`'s composition value is unrealized in practice; ORC reads it and executes constituent skills directly.

**Issue:** Same gating ambiguity as `commit-packet`. Unclear whether meta-skill invocation is mandatory or documentary.

**Recommendation:** Either
- (a) Gate meta-skill like `assign-agents` and `requirements-validate` (hard artifact enforcement), OR
- (b) Demote to documentation pattern

**Routing:** `hone` skill (decide via design review, same decision as commit-packet)

---

## Summary Table

| Item | Type | Count | Status |
|------|------|-------|--------|
| Protocol Gaps | G1–G6 | 6 | 4 route to HR, 1 to hone, 1 documented limitation |
| Content-Quality Candidates | 8c | 1 | `commit-packet` gating → hone |
| New-Skill Candidates | 8d | 2 | `env-preflight` (LOW), `silent-substitution-detect` (MEDIUM) |
| Drift Candidates | 8e | 1 | `dispatch-task` meta-skill bypass → hone |
| **Total Findings** | — | **10** | Routed to orchestrator for agent-improvement / hone |

---

## Retention Keys

**Post-mortem source:** `docs/post-mortems/gander-studio-p4-proximity-edge-hardening.md`

**Archive entry:** Appended to `docs/project_log.md` at task_id `gander-studio-p4-proximity-edge-hardening-postmortem`

**Key Technical Patterns:**
- **Frequency-discriminated audio spy:** LINK_PRIMARY_FREQ_HZ (880 Hz), LINK_SECONDARY_FREQ_HZ (1320 Hz); filter out APPROACH_FREQ_HZ (220 Hz)
- **Section-landmark selector:** `h3.filter({ hasText: /^SectionName$/i }).locator('..').locator('[data-testid^="item-"]')`
- **GANDER_ROOT requirement:** Must point to agents repo root (`~/projects/gander`), not studio repo

**Commits:**
- `c380956`: FE-002 source hygiene (handle-style.ts DRY, dead META_AGENTS, explicit role arg)
- `f970935`: FE-001 spec hardening (landmarks, strict waitFor, A3 agent↔skill, A4 frequency-spy)

**Quality Metrics:**
- 9/9 spec tests PASS
- 12/12 requirements COVERED
- 0 regressions detected
- 13 pre-existing e2e failures unchanged

---

## Recommendations to Orchestrator

Surface to human for next steps:

1. **Immediate (High Priority):**
   - Route G1 + G5 to HR: Implement 2 FE Stop hooks (silent-substitution-check, working-tree-untracked-spec-check)
   - Route G2 to PM: Add same-file-propagation-check to decomposition checklist
   - Route G3 to HR: Update Critic spec (problem-name + file-pointer approach for complex domains)
   - Route G4 to HR: Implement env-preflight script + integrate with assign-agents

2. **Design Review (Medium Priority):**
   - Run `hone` to decide on commit-packet gating and dispatch-task meta-skill enforcement

3. **Backlog (Lower Priority):**
   - Consider skill design for `env-preflight` (LOW effort, high applicability)
   - Consider skill design for `silent-substitution-detect` (MEDIUM effort, recurring pattern)

