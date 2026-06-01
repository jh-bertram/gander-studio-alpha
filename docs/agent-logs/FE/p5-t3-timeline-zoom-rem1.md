## [STAGE 1] RECEIVED
- **From:** ORC
- **At:** 2026-05-28T22:00:00Z
- **Task ID:** p5-t3-timeline-zoom (remediation rem1)
- **Message received:**
  > Remediation request — task p5-t3-timeline-zoom (AUDIT FAILED, must fix and re-audit). Three fixes: (1) CRITICAL — restore MAX_BAR_AREA cap; make zoom scale RELATIVE to capped base. (2) QA — fix e2e spec navigation selectors. (3) SA/a11y — raise +/- glyph contrast to ≥4.5:1. Do not touch t1, t2, or t4. Only AgentTimeline.tsx and tests/e2e/agent-timeline-zoom.spec.ts…[truncated]

## [STAGE 2] PLAN
- **At:** 2026-05-28T22:01:00Z
- **Components to build:**
  - `packages/client/src/components/sessions/AgentTimeline.tsx` — fix MAX_BAR_AREA cap + contrast
  - `packages/client/tests/e2e/agent-timeline-zoom.spec.ts` — fix navigation selectors

- **State design:** No state design change; zoomLevel useState unchanged.

- **tRPC wiring:** N/A — pure client component.

- **A11Y plan:**
  - Fix #3: raise +/- glyph color from `var(--mt)` (#5499b5, 4.14:1) to `var(--w)` (near-white) for ≥4.5:1 contrast on `var(--sfh)` (#1a3530). Auditor remediation suggests `var(--w)` as lowest-risk option.

- **Fix strategy:**
  1. AgentTimeline.tsx line 254-255: restore `Math.min(rangeSeconds * PX_PER_SECOND * 100, MAX_BAR_AREA)` for base, then multiply by zoomLevel
  2. AgentTimeline.tsx lines 320, 347: change `color: 'var(--mt)'` to `color: 'var(--w)'` on both zoom buttons
  3. agent-timeline-zoom.spec.ts: replace all navigation logic with `navigateToAnalyzeTab` pattern from s3-t3-timeline.spec.ts — using SESSIONS nav text, sessions-list-page testid, fixture session row, Analyze tab role

### Checkpoint — 22:02:00
- Edited `packages/client/src/components/sessions/AgentTimeline.tsx` (500 lines). Fix 1: Math.min cap restored. Fix 3: var(--w) contrast. Constant audit: MAX_BAR_AREA live at line 254. Next: fix e2e spec.

### Checkpoint — 22:04:00
- Rewrote `packages/client/tests/e2e/agent-timeline-zoom.spec.ts` (123 lines). Navigation mirrors s3-t3-timeline.spec.ts. First pass failed on gander-p7 (agents deselected by default → no SVG). Switched to gander-p6-moirai-skein-skills (always renders SVG). Tests: 3 passed in 7.9s. Next: write output packet.

## [STAGE 3] COMPLETE
- **At:** 2026-05-28T22:05:00Z
- **Deliverables:**

| File | Lines | Notes |
|------|-------|-------|
| `packages/client/src/components/sessions/AgentTimeline.tsx` | 500 | Fix 1 (MAX_BAR_AREA cap), Fix 3 (var(--w) contrast) |
| `packages/client/tests/e2e/agent-timeline-zoom.spec.ts` | 123 | Fix 2 (navigation selectors, fixture switched to gander-p6) |
| `.claude/agents/tasks/outputs/p5-t3-timeline-zoom-FE-rem1-1780001118.md` | — | ui_packet |

- **Lint:** EXIT_CODE 0
- **Constant audit:** MAX_BAR_AREA live at line 254; no raw hex; no inline style conflicts
- **E2E:** 3 passed (7.9s) against dev server
