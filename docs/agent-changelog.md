# Agent Changelog

Records all agent and skill file edits made during improvement sessions.

---

## agent-improvement-2026-04-28-1
**Date:** 2026-04-28
**Post-mortems acted on:** `gander-studio-p4-proximity-edge-hardening.md`

| File | Previous version | New version | Change |
|------|-----------------|-------------|--------|
| `.claude/agents/pm.md` | 1.5.0 | 1.5.1 | Added Step 5.5 same-file fix propagation: grep cited pattern across whole file and enumerate all instances |
| `.claude/agents/critic.md` | 1.4.0 | 1.4.1 | Added recipe-vs-problem-naming guidance: prefer naming problem in complex domains over prescriptive recipes |

---

## hone-2026-04-27-1
**Date:** 2026-04-27
**Post-mortems acted on:** `gander-studio-p2-agent-cards.md`

| File | Previous version | New version | Change |
|------|-----------------|-------------|--------|
| `.claude/skills/requirements-validate/SKILL.md` | 1.0.2 | 1.1.0 | Added Step 2.5 Runtime Behavior Verification — runtime criteria require DOM-presence Playwright assertion or REQUIRES_HUMAN_VISUAL flag |
| `.claude/skills/dispatch-task/SKILL.md` | 1.5.0 | 1.6.0 | Added Step 0.5 mandating convention-detect invocation before PM Context Preflight |
| `.claude/skills/audit-pipeline/SKILL.md` | 1.3.0 | 1.3.1 | Documented Tier 3 visual-rendering blindspot; emit pipeline_integrity VISUAL_BLINDSPOT_KNOWN on NODE_TYPES/portal/z-index diffs |

---

## agent-improvement-2026-04-27-1
**Date:** 2026-04-27
**Post-mortems acted on:** `gander-studio-p2-agent-cards.md`

| File | Previous version | New version | Change |
|------|-----------------|-------------|--------|
| `.claude/agents/pm.md` | 1.4.6 | 1.5.0 | Added Step 0.5 mandating XML-block enumeration of recurring patterns from prior post-mortems before decomposition |
| `.claude/agents/pm.md` | 1.5.0 | 1.5.0 | Strengthened Step 7 to require `<verbatim_deliverable_audit>` block in written output, not free-text claim |
| `.claude/agents/critic.md` | 1.3.1 | 1.4.0 | Hardened OVERSCOPED with deterministic 4+-file BLOCKER threshold for FE tasks |
| `.claude/agents/critic.md` | 1.4.0 | 1.4.0 | Added recurring-pattern declaration enforcement; missing PM enumeration now BLOCKs |
| `.claude/agents/critic.md` | 1.4.0 | 1.4.0 | Added React Flow NODE_TYPES/toRFNode/toRFEdge rule requiring DOM-presence assertion in spec |
| `.claude/agents/frontend.md` | 1.5.0 | 1.6.0 | Added Click-Handler Keyboard-Equivalent Audit greping onClick on non-button elements before ui_packet |
| `.claude/agents/frontend.md` | 1.6.0 | 1.6.0 | Added Side-Effect-As-Proxy spec anti-pattern: side-effect assertions must pair with DOM-presence assertion |
| `.claude/agents/auditor.md` | 1.5.0 | 1.6.0 | Added React Flow rendering-registration SA gate: NODE_TYPES/toRFNode diffs require DOM-presence assertion |
| `.claude/agents/auditor.md` | 1.6.0 | 1.6.0 | Added Click-Handler Keyboard-Equivalent SA gate as defense-in-depth backstop to FE pre-flight |

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
