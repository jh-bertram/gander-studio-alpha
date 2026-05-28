# Agent Improvement Session: agent-improvement-2026-05-25-1
**Date:** 2026-05-25
**Post-mortems reviewed:** [`prog-studio-sessions-2026-05-s2-list-edit.md`](../post-mortems/prog-studio-sessions-2026-05-s2-list-edit.md)
**Gaps addressed:** 1 (covers 2 post-mortem rows)
**Files changed:** 1
**Research tasks spawned:** 0

---

## Gaps Addressed

### G2+G5: e2e tests coupled to incidental DOM/fixture state + primitive token-system collision shipping invisible text

**Source:** `docs/post-mortems/prog-studio-sessions-2026-05-s2-list-edit.md` — Section 6, rows 2 and 5; Section 3 (the contrast bug).

**Root cause:** Three distinct e2e-authoring pitfalls passed full SA/QA/SX audit gates in one sprint — (a) `toBeVisible` on zero-dimension stubs (t5a), (b) "first row" selection on a data-dependent assertion (t5b), and (c) reliance on a Shadcn primitive's default token system colliding with the FF7 Mako palette to render invisible-but-DOM-present text (t6b). All three share a common pattern: the e2e asserts incidental rendered/data state rather than the contract under test, so it either fails noisily on irrelevant data (a, b) or passes silently while the user sees nothing (c).

**File changed:** `.claude/agents/frontend.md` (gander shared team repo).

**Change:** Inserted a new section `## E2E Assertion Targeting (Tier 2 spec authoring)` immediately after the existing Side-Effect-As-Proxy anti-pattern (the structurally adjacent kin). Three numbered pitfalls, each with a one-line rule and a concrete post-mortem citation; the third includes a verbatim Playwright `getComputedStyle` snippet for the readability check.

**Version:** 1.6.0 → **1.7.0** (MINOR — new section/gate, not a wording fix).

**Research basis:** None — diagnoses were complete in the post-mortem; Playwright matcher semantics (`toBeVisible` vs `toBeAttached`) and `getComputedStyle` are well-documented, no RA spawn warranted.

---

## Gaps Not Addressed

| Gap (post-mortem row) | Reason not addressed |
|-----------------------|----------------------|
| G1 — No contrast/visual smoke for non-React-Flow components (new skill `component-contrast-smoke`) | Skill-creation work is `/hone`'s domain, not `agent-improvement`'s. The FE-side mitigation (computed-style assertion snippet) is now in `frontend.md` §E2E Assertion Targeting; the deterministic skill-level enforcement is a separate hone item. Surfaced to human for the next `/hone` run. |
| **G3 — SubagentStop seq-integrity hook emits malformed COMPLETE events (RECURRING from S1 §6)** | The hook is `~/.claude/hooks/subagent-autocomplete.sh`, a deterministic shell script, not an agent/skill spec. S1's improvement session added a defensive *warning* but did not fix the root cause of `seq:999`, generic `agent_id`, and out-of-order `ts`. Now appearing in two consecutive post-mortems without a real fix — **HIGH priority for HR (system-health-monitor)**. Requires spawning HR with a focused brief to rewrite the hook so it (a) reads the last numeric seq from the log and increments, (b) stamps real UTC `ts`, (c) carries the SPAWN's `agent_id` rather than emitting a generic `FE#1`/`ORC`. |
| G4 — Pre-existing e2e flakiness on unmodified HEAD | Test-code hardening (replace fixed timeouts with `await expect(rows).toHaveCount(>0)` waits, pin data-dependent assertions to deterministic fixtures). Not an agent-spec change. Requires a small FE test-hardening task in a follow-up sprint. |
| G6 — `SESSIONS_EDITS_DIR` runtime output not gitignored | Trivial repo fix (`echo "packages/server/sessions-edits/" >> .gitignore`), not an agent-spec change. |

---

## Research Conducted

None.

---

## Next Review Trigger

Improvements are due again after the next S3 (analyze) sprint of `prog-studio-sessions-2026-05`, OR 3 sprints from now, whichever is first.

**Unresolved gaps to watch:**
- **The SubagentStop hook bug is now recurring in two consecutive post-mortems (S1 §6 G2/G3, S2 §6 G3) without a real fix** — if it surfaces a third time, escalate to a forced HR rewrite session, do not let it remain in a "defensive warning only" state.
- The e2e flakiness on unmodified HEAD will degrade trust in the QA gate's e2e signal across S3 if not hardened.
- The contrast/visual blindspot will recur in S3 unless `/hone` lands `component-contrast-smoke` (or the FE checklist alone proves sufficient) — the `frontend.md` change is necessary but not sufficient defense in depth.
