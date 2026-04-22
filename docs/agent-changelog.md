# Agent Changelog

Records all agent and skill file edits made during improvement sessions.

---

## agent-improvement-2026-03-30-1
**Date:** 2026-03-30
**Post-mortems acted on:** `gander-studio-p2-canvas-link.md`

| File | Previous version | New version | Change |
|------|-----------------|-------------|--------|
| `.claude/agents/pm.md` | 1.0.0 | 1.0.1 | Added step 0 in Task Decomposition Pattern: read most recent post-mortem before decomposing to prevent recurring overscoping |
| `.claude/agents/frontend.md` | 1.1.2 | 1.1.3 | Constant audit note clarified: all CSS numeric literals (px, opacity, Hz, gain) are in-scope, not just ms duration "timing values" |
| `.claude/agents/frontend.md` | 1.1.3 | 1.1.4 | Added CSS template string numeric grep step before ui_packet: `grep -nP '\d+px|\d+\.\d+|rgba\('` to catch raw literals in keyframes and box-shadows |

---

## agent-improvement-2026-03-17-1
**Date:** 2026-03-17
**Post-mortems acted on:** `gander-studio-p2-p3.md`, `gander-studio-p1-materia-canvas.md`

| File | Previous version | New version | Change |
|------|-----------------|-------------|--------|
| `.claude/agents/orchestrator.md` | 1.0.0 | 1.0.1 | CR CRITIQUE_PASS with WARNINGs now routes to PM for explicit acknowledgement before dispatch |
| `.claude/agents/orchestrator.md` | 1.0.0 | 1.0.1 | Step 4.5 runtime bug handling now mandates agent spawn with targeted brief — Orchestrator must never fix source code directly |
| `.claude/agents/critic.md` | 1.0.0 | 1.0.1 | AUDIT_RISK challenge expanded to flag new interactive flows on existing surfaces missing Playwright coverage |
| `.claude/agents/frontend.md` | 1.1.1 | 1.1.2 | Tier 2 requirement extended to new interactive flows on existing surfaces, not just new surfaces |
| `.claude/agents/frontend.md` | 1.1.1 | 1.1.2 | Added External Data Parse Safety pre-flight: JSON.parse must have try/catch + shape validation before ui_packet |
| `.claude/agents/auditor.md` | 1.0.2 | 1.0.3 | Tier 2 QA FAIL added when task introduces interactive flows but e2e_spec is TIER_1_ONLY |
