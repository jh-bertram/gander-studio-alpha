# Agent Improvement Session: agent-improvement-2026-04-27-1
**Date:** 2026-04-27
**Post-mortems reviewed:** [`gander-studio-p2-agent-cards.md`](../post-mortems/gander-studio-p2-agent-cards.md)
**Gaps addressed:** 4 of 6
**Files changed:** 4 (`pm.md`, `critic.md`, `frontend.md`, `auditor.md`)
**Research tasks spawned:** 0 (all fixes mechanically derivable from post-mortem evidence)

---

## Gaps Addressed

### G1 — PM overscoping recurs across sprints
**Source:** `docs/post-mortems/gander-studio-p2-agent-cards.md` — Section 6 G1, Section 5
**Root cause:** Prior agent-improvement (2026-03-30) added a prose "read most recent post-mortem" step to PM step 0; the step was repeatedly bypassed because nothing mechanically inspected for compliance. Same 4-files-into-1-task pattern from canvas-link C2 recurred in agent-cards FE-001.
**Files changed:** `.claude/agents/pm.md` + `.claude/agents/critic.md`
**Change (PM):** Added Step 0.5 — PM must read Section 6 protocol-gap tables of the most recent 3 post-mortems and emit one `<recurring_pattern>` element per row matching `OVERSCOPED|SCOPE_DRIFT|MISSED_DELIVERABLE|DEFERRED|RECURRING` in `<routing_notes>`, with explicit avoid/accept rationale.
**Change (Critic):** Hardened OVERSCOPED dimension #3 with a deterministic 4+-file BLOCKER threshold for FE tasks (no estimated-line-count escape hatch). Added recurring-pattern declaration enforcement: missing PM enumeration is `MISSING_RECURRENCE_DECLARATION` BLOCKER regardless of plan quality.
**Version:** pm.md 1.4.6 → 1.5.0; critic.md 1.3.1 → 1.4.0

### G2 — PM silently drops verbatim deliverables
**Source:** `docs/post-mortems/gander-studio-p2-agent-cards.md` — Section 6 G2
**Root cause:** PM step 7 prose required noun/verb-phrase coverage but allowed free-text affirmation. PM v1 confirmed coverage in routing notes while silently omitting "appearance config file" — Critic caught it only because it re-read the original brief.
**File changed:** `.claude/agents/pm.md`
**Change:** Strengthened step 7 to require a literal `<verbatim_deliverable_audit>` XML block in the written task_decomposition file with one `<phrase>` per noun/verb phrase, each mapping to `<addressed task=...>`, `<deferred reason=...>`, or `<out_of_scope reason=...>`. Free-text claims are no longer sufficient.
**Version:** included in pm.md 1.4.6 → 1.5.0 (combined with G1 step 0.5 — single MINOR bump)

### G3 — Click-handler keyboard-equivalent a11y violations
**Source:** `docs/post-mortems/gander-studio-p2-agent-cards.md` — Section 6 G3, Section 5 (FE-001b 0% first-pass rate)
**Root cause:** FE-001b implemented `onClick` on a `<span>` for inline title edit without `tabIndex` / `role` / `onKeyDown`. Auditor caught it on first SA pass; remediation cost ~2h for a 3-attribute fix that a deterministic grep would catch pre-submission.
**Files changed:** `.claude/agents/frontend.md` + `.claude/agents/auditor.md`
**Change (FE):** Added new Click-Handler Keyboard-Equivalent Audit section requiring `grep -nE "<(span|div|li|a)[^>]*onClick="` on every modified `.tsx` file before ui_packet. Each match on a non-`<button>`/`<a href>` element must have all three attributes; otherwise fix before submitting.
**Change (Auditor):** Added matching SA gate as defense in depth — auditor runs the same grep and FAILs if the three-attribute pattern is missing.
**Version:** frontend.md 1.5.0 → 1.6.0; auditor.md 1.5.0 → 1.6.0
**Code-not-prompt note:** Post-mortem flagged this as a hook candidate. Hook implementation deferred — current grep-in-prose lands the rule today; HR can convert to a PreToolUse:Edit hook in a follow-up sprint.

### G4 — NODE_TYPES diff has no DOM-render gate (post-delivery HCG-2)
**Source:** `docs/post-mortems/gander-studio-p2-agent-cards.md` — Section 3 (HCG-2 root cause), Section 6 G4 + G6, Section 4
**Root cause:** FE-002 changed `NODE_TYPES` and `toRFNode` to register the orchestrator card. Proximity-link Playwright spec asserted that `playLink()` fired and the canvas store gained an edge entry — both passed. No `.react-flow__edge` DOM-presence assertion existed in the spec, so the regression (no edge rendered at runtime) shipped clean despite SA + QA + SX all green and 35/36 requirements covered.
**Files changed:** `.claude/agents/critic.md` + `.claude/agents/frontend.md` + `.claude/agents/auditor.md`
**Change (Critic):** Added AUDIT_RISK bullet for any plan touching `NODE_TYPES`/`EDGE_TYPES`/`toRFNode`/`toRFEdge` — must require DOM-presence assertion in named spec; side-effect-only assertions are insufficient.
**Change (FE):** Added "Side-Effect-As-Proxy Spec Anti-Pattern" section with bad/good code example, mandating that every Playwright side-effect assertion (sound, store mutation, callback, network call) be paired with a DOM-presence assertion on the user-visible primary effect.
**Change (Auditor):** Added React Flow rendering-registration SA gate: if diff matches `NODE_TYPES|EDGE_TYPES|toRFNode|toRFEdge` and the spec has no `.react-flow__edge|.react-flow__node` matcher, SA FAIL.
**Version:** critic.md 1.4.0 (combined with G1 — single MINOR bump); frontend.md 1.6.0 (combined with G3); auditor.md 1.6.0 (combined with G3)

---

## Gaps Not Addressed

| Gap | Reason not addressed |
|-----|---------------------|
| **G5 — Audit gates don't run dev server (Tier 3 visual smoke)** | Heavy lift. Post-mortem itself defers it. Requires new tooling (Playwright config + baseline screenshots + diff library) and a new audit phase. Surface to human for sprint-scoping; out of scope for prose-only agent edits. |
| **G6 — Sound-as-proxy spec anti-pattern (root-cause framing)** | Addressed indirectly via FE "Side-Effect-As-Proxy" rule (G4 change). The post-mortem framed G6 as a separate gap, but the same rule fix covers both — duplicating it would create two contradicting authorities. |

---

## Skill Findings Routed to `hone`

The post-mortem's Section 8 has 1 content-quality candidate, 2 new skill candidates, and 2 drift candidates. agent-improvement scope is agent files; skill changes go through `hone`. Surfaced to human for the next step:

- **Content-quality:** `requirements-validate` does static traceability only; runtime feature criteria need a Playwright smoke or REQUIRES_HUMAN_VISUAL signal
- **New skill:** `pm-preflight` — encode Step 0.5 as a deterministic shell script (the agent-spec edit is defense in depth; the skill would be the primary mechanism)
- **New skill:** `react-flow-render-smoke` — domain-specific Playwright runner triggered by NODE_TYPES diffs
- **Drift:** `convention-detect` not auto-invoked at dispatch-task Step 0.5
- **Drift:** `audit-pipeline` lacks Tier 3 visual smoke (matches G5 above)

---

## Research Conducted

None. All four addressed gaps were mechanically derivable from post-mortem evidence — root cause + counterfactual + suggested fix were already in Section 6. No external best-practice lookup or third-party API verification was needed.

---

## Code-Not-Prompt Candidates Routed to HR

Three of the addressed gaps were flagged by the post-mortem as hook/script candidates. agent-spec edits land defense in depth today; HR (system-health-monitor) should consider converting each to a deterministic mechanism:

| Gap | Current artifact | Hook/script candidate |
|-----|------------------|------------------------|
| G1 | PM step 0.5 prose enumeration | Pre-PM hook: shell script greps post-mortems and emits a checklist that PM must consume |
| G2 | PM `<verbatim_deliverable_audit>` block | Pre-Critic hook: parse PM output, fail if block absent or any `<phrase>` lacks a mapping |
| G3 | FE keyboard-equivalent grep + auditor backstop | PreToolUse:Edit hook on FE Edit tool: grep diff for `<(span|div|li|a)[^>]*onClick=`, block if missing the three a11y attributes |

---

## Next Review Trigger

**Next due:** after the proximity-edge-fix sprint (the HCG-2 followup) closes, or after 2 additional sprints — whichever first.

**Unresolved patterns to watch:**
- Whether the new Step 0.5 + Critic enforcement actually closes the PM-overscoping recurrence loop. Two prose interventions failed; this third intervention is structural (XML block + mechanical Critic check). If the same OVERSCOPED pattern recurs in the next sprint, escalate to HR for a hook implementation.
- Whether FE's new keyboard-equivalent and side-effect-proxy pre-flights are actually run. Track first-pass FE audit rate over the next 3 sprints.
- G5 (Tier 3 visual smoke) remains structurally unsolved — every visual regression that's invisible to lint + headless Playwright will continue to ship clean until this is built.
