# Agent Improvement Session: agent-improvement-2026-03-30-1
**Date:** 2026-03-30
**Post-mortems reviewed:** `docs/post-mortems/gander-studio-p2-canvas-link.md`
**Gaps addressed:** 3
**Files changed:** 2
**Research tasks spawned:** 0

---

## Gaps Addressed

### PM Overscoping — Recurring Pattern (P1 + P2)
**Source:** `docs/post-mortems/gander-studio-p2-canvas-link.md` — Section 6
**Root cause:** PM#0 produced overscoped decompositions in two consecutive sprints despite the P1 post-mortem explicitly documenting the pattern; Critic blocked both times, wasting one planning cycle per sprint.
**File changed:** `.claude/agents/pm.md`
**Change:** Added step 0 in Task Decomposition Pattern: read most recent post-mortem before decomposing to prevent recurring overscoping.
**Version:** 1.0.0 → 1.0.1

---

### "Timing Values" Narrow Interpretation
**Source:** `docs/post-mortems/gander-studio-p2-canvas-link.md` — Section 6 + Section 4
**Root cause:** Receipt checklist phrased the constant rule as "animation timing values"; FE#3 read "timing" as ms durations only and excluded 20+ box-shadow px values, opacity fractions, and ring widths.
**File changed:** `.claude/agents/frontend.md`
**Change:** Constant audit note clarified: all CSS numeric literals (px, opacity, Hz, gain) are in-scope, not just ms duration "timing values".
**Version:** 1.1.2 → 1.1.3

---

### FE No Self-Grep for CSS Template String Numerics
**Source:** `docs/post-mortems/gander-studio-p2-canvas-link.md` — Section 6 + Section 4
**Root cause:** FE agents had no grep step targeting raw numerics inside CSS template strings; the 003b SA failure (20+ violations) was caught only by the auditor rather than self-caught at submission time.
**File changed:** `.claude/agents/frontend.md`
**Change:** Added CSS template string numeric grep step before ui_packet: `grep -nP '\d+px|\d+\.\d+|rgba\('` to catch raw literals in keyframes and box-shadows.
**Version:** 1.1.3 → 1.1.4

---

## Gaps Not Addressed

| Gap | Reason not addressed |
|-----|---------------------|
| Session-spanning audits (001b, 003a audited next session) | Low-risk; post-mortem rated it low; no concrete agent spec change identified — current checkpoint protocol already surfaces this state |

---

## Research Conducted

None — all fixes were direct mechanical changes derivable from the post-mortem.

---

## Next Review Trigger

Improvements are due again after: 3 sprints from now.
Unresolved gaps to watch: PM overscoping pattern — step 0 in pm.md is the first attempt to address it structurally; if PM overscopes again in the next sprint, escalate to a stronger constraint (e.g. explicit max-tasks-per-agent-turn limit in the spec).
