# Agent Improvement Session: agent-improvement-2026-04-28-1
**Date:** 2026-04-28
**Post-mortems reviewed:** [gander-studio-p4-proximity-edge-hardening.md](../post-mortems/gander-studio-p4-proximity-edge-hardening.md)
**Gaps addressed:** 2 of 6 (agent-prompt-only)
**Files changed:** 2
**Research tasks spawned:** 0 (both fixes derivable directly from post-mortem evidence; no external research needed)

---

## Gaps Addressed

### G2 — PM same-file fix propagation
**Source:** `docs/post-mortems/gander-studio-p4-proximity-edge-hardening.md` — Section 6 G2
**Root cause:** PM#1 propagated A1's selector fix to the new A3 test but did not enumerate the pre-existing test sites at lines 99 and 154 in the same spec file. CR#1 round 1 caught it; cost was a full plan revision (PM#1 → PM#2).
**File changed:** `.claude/agents/pm.md` (canonical at `~/projects/gander/.claude/agents/pm.md`)
**Change:** Added Step 5.5 "Same-file fix propagation" between priority assignment (step 5) and packet drafting (step 6). When an advisory cites a fix at a specific line, the PM must grep the entire file for the pattern and enumerate every existing instance in the task packet description.
**Version:** 1.5.0 → 1.5.1 (PATCH)

### G3 — Critic prescriptive code recipes in complex domains
**Source:** `docs/post-mortems/gander-studio-p4-proximity-edge-hardening.md` — Section 6 G3
**Root cause:** CR#1 wrote an option-(b) recipe for A4 ("reset counter, assert === 2") without tracing `useLinkSound.ts` to see that `playApproach` also fires during drag. PM#2 implemented the recipe faithfully. CR#2 caught it after a wasted PM round + Critic round; cost was a third Critic round (cap is 2 — required human authorization).
**File changed:** `.claude/agents/critic.md` (canonical at `~/projects/gander/.claude/agents/critic.md`)
**Change:** Added "Recipe vs. problem-naming" guidance at the close of §AUDIT_RISK. In complex domains (audio synthesis, test spies, scheduler/event-loop logic, React Flow internals, build-tool internals) the Critic should prefer to name the problem and point at the file rather than write a prescriptive recipe. Reserve recipes for domains the Critic has fully traced.
**Version:** 1.4.0 → 1.4.1 (PATCH)

---

## Gaps Not Addressed

| Gap | Reason not addressed |
|-----|---------------------|
| G1 — Silent-substitution-as-graceful-degradation pattern (FE) | Code-not-prompt: should be a `Stop` hook on FE agent. Hook design (regex correctness, false-positive rate, exit-code semantics) requires its own scoped HR sprint — not an inline checklist tweak. |
| G4 — PM env pre-flight before FE-against-live-API tasks | Code-not-prompt: should be a script invoked by `assign-agents` before FE wave dispatch (e.g., `~/.claude/scripts/env-preflight.sh` running curl health + agent.list non-empty). Script design + `assign-agents` integration requires its own HR sprint. |
| G5 — FE leaves untracked `.spec.ts` debug scratch files | Code-not-prompt: should be a `Stop` hook checking `git status --short` for undeclared spec files. Same hook-infrastructure work as G1. |
| G6 — ORC has no SendMessage primitive on this harness | Documented harness limitation. Existing protocol (revision briefs include `<prior_decomposition_path>` + `<critique_path>`) bridges context via files. Acceptable as-is; flag if a SendMessage-like primitive becomes available. |

**Recommended follow-up sprint scope:** Bundle G1, G4, G5 into a single HR-led "team-hygiene-hooks" sprint. Three new artifacts: `~/.claude/hooks/fe-silent-substitution-check.sh` (Stop), `~/.claude/hooks/fe-untracked-spec-check.sh` (Stop), `~/.claude/scripts/env-preflight.sh` invoked by `assign-agents`. Plus settings.json wiring.

---

## Research Conducted

None. Both fixes were direct mechanical edits derivable from the post-mortem evidence (specific line citations, source-traceable root causes). No external knowledge or third-party tool research required.

---

## Next Review Trigger

Improvements are due again after the next sprint that produces a post-mortem with non-empty Section 6, OR after the team-hygiene-hooks HR sprint completes (whichever first).

**Unresolved gaps to watch:**
- Silent-substitution pattern (G1) recurred at three layers in p4. If it appears again before the hook is implemented, escalate to BLOCKER status — the agent-prompt approach has been tried and failed.
- Critic prescriptive recipe pattern (G3) — watch the next 2 sprints to see if the new "Recipe vs. problem-naming" guidance changes Critic behavior. If not, the rule needs to become a hard gate ("BLOCK on prescriptive recipe in domain matching X") rather than guidance.
- `commit-packet` and `dispatch-task` skill-bypass pattern from §8c/8e — `hone` should decide whether to tighten gating or demote to documentation.
