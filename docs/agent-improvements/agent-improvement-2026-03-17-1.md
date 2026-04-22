# Agent Improvement Session: agent-improvement-2026-03-17-1
**Date:** 2026-03-17
**Post-mortems reviewed:** `docs/post-mortems/gander-studio-p2-p3.md`, `docs/post-mortems/gander-studio-p1-materia-canvas.md`
**Gaps addressed:** 4
**Files changed:** 4 (orchestrator, critic, frontend, auditor)
**Research tasks spawned:** 0

---

## Gaps Addressed

### CR WARNINGs have no enforcement path
**Source:** `docs/post-mortems/gander-studio-p1-materia-canvas.md` — Section 6
**Root cause:** `CRITIQUE_PASS` with WARNINGs was treated as a green light; Orchestrator only "surfaced warnings to human as a brief note" with no PM follow-through required.
**File changed:** `.claude/agents/orchestrator.md`
**Change:** CR CRITIQUE_PASS with WARNINGs now routes to PM for explicit acknowledgement before dispatch
**Version:** 1.0.0 → 1.0.1

---

### Orchestrator fixes runtime bugs directly instead of routing to agents
**Source:** `docs/post-mortems/gander-studio-p1-materia-canvas.md` — Section 3 & Section 6
**Root cause:** Step 4.5 said "open a remediation task" but did not prohibit the Orchestrator from making the fix inline in the main session.
**File changed:** `.claude/agents/orchestrator.md`
**Change:** Step 4.5 runtime bug handling now mandates agent spawn with targeted brief — Orchestrator must never fix source code directly
**Version:** 1.0.0 → 1.0.1

---

### Interactive flows on existing surfaces lack Playwright coverage (Critic dimension)
**Source:** `docs/post-mortems/gander-studio-p1-materia-canvas.md` — Section 6
**Root cause:** Critic's AUDIT_RISK challenge checked for "new UI surface without Playwright" but not for "new interactions added to an existing surface."
**File changed:** `.claude/agents/critic.md`
**Change:** AUDIT_RISK challenge expanded to flag new interactive flows on existing surfaces missing Playwright coverage
**Version:** 1.0.0 → 1.0.1

---

### Interactive flows on existing surfaces lack Playwright coverage (FE Tier 2 trigger)
**Source:** `docs/post-mortems/gander-studio-p1-materia-canvas.md` — Section 4 & Section 6
**Root cause:** FE's Tier 2 rule said "creates a new component, page, or interactive surface" — canvas-c modified an existing surface so Tier 2 didn't trigger.
**File changed:** `.claude/agents/frontend.md`
**Change:** Tier 2 requirement extended to new interactive flows on existing surfaces, not just new surfaces
**Version:** 1.1.1 → 1.1.2

---

### Interactive flows without Playwright slip past Auditor QA gate
**Source:** `docs/post-mortems/gander-studio-p1-materia-canvas.md` — Section 4 & Section 6
**Root cause:** Auditor Tier 2 only ran "when a spec file exists" — if FE reported TIER_1_ONLY for a task with interactive flows, the auditor passed without challenging it.
**File changed:** `.claude/agents/auditor.md`
**Change:** Tier 2 QA FAIL added when task introduces interactive flows but e2e_spec is TIER_1_ONLY
**Version:** 1.0.2 → 1.0.3

---

### JSON.parse on external data without try/catch or shape validation
**Source:** `docs/post-mortems/gander-studio-p1-materia-canvas.md` — Section 6
**Root cause:** No FE pre-flight step existed for detecting bare JSON.parse calls; the agent relied on the auditor's SX gate to catch it rather than preventing it.
**File changed:** `.claude/agents/frontend.md`
**Change:** Added External Data Parse Safety pre-flight: JSON.parse must have try/catch + shape validation before ui_packet
**Version:** 1.1.1 → 1.1.2

---

## Gaps Not Addressed

| Gap | Reason not addressed |
|-----|---------------------|
| P2+P3: PM pre-flight source read | Already present in `pm.md` (Task Decomposition step 2, verbatim) |
| P2+P3: Auditor live API curl after BE fixes | Already present in `auditor.md` (Live API Verification section) |
| P2+P3: tsx watch PID check at browser verify | Already present in `orchestrator.md` (Step 4.5 PID warning) |
| P2+P3: Bash sandbox denial in background agents | Already present in `orchestrator.md` (Step 2 routing note) |

---

## Research Conducted

None. All changes were direct mechanical applications of post-mortem findings with unambiguous solutions.

---

## Next Review Trigger

Improvements due again after: 3 sprints from now (after `gander-studio-p2` equivalent or `p1-mc-follow-up-interactions`).
Unresolved gaps to watch: Canvas-c interaction tests still don't exist in the live codebase — the Playwright spec covers mount only. If `p1-mc-follow-up-interactions` sprint ships without extending the spec, that is a direct regression of this session's fix.
