## [STAGE 2] PLAN
- **At:** 2026-05-27T00:10:00Z
- **Components to build:**
  - Modify `packages/client/src/components/sessions/AgentTimeline.tsx`
  - Extend `packages/client/tests/e2e/s3-t3-timeline.spec.ts`
- **State design:**
  - Add `MIN_BAR_AREA`, `MAX_BAR_AREA`, `PX_PER_SECOND` layout constants
  - `contentWidth = Math.max(measuredContainerWidth, LABEL_COL_WIDTH + contentBarArea)` where `contentBarArea = Math.max(MIN_BAR_AREA, Math.min(rangeSeconds * PX_PER_SECOND, MAX_BAR_AREA))`
  - Wrap SVG in `<div data-testid="agent-timeline-scroller" style={{ overflowX: 'auto' }}>`
  - Container div keeps `overflow: hidden` on vertical axis
  - Replace `formatRelative` with `deriveUnit(tAxisRange)` → unit string `'s'|'m'|'h'|'d'`
  - New `formatOffset(offsetMs, unit)` for consistent tick + bar-label formatting
  - `formatDuration` gets its own adaptive scale (keep independent of axis unit)
- **tRPC wiring:** none (reads from props, same as before)
- **A11Y plan:** Update SVG aria-label to use adaptive unit for range display; keep all `role="img"`, `tabIndex`, `data-testid`, `data-orphan` attributes unchanged

### Wide fixture confirmed:
- `gander-p6-moirai-skein-skills`: 29 events, span = 19699s (≈5.5h) → unit will be `h`
- `gander-p5-obsidian-l0-l1`: 27 events, span = 10800s (3h) → also `h`
- Using `gander-p6-moirai-skein-skills` as the scroll/units pinned fixture

### Checkpoint — 00:15:00
- Wrote `packages/client/src/components/sessions/AgentTimeline.tsx` (298 lines). Constant audit: 0 matches. Next: extend e2e spec.

### Checkpoint — 00:18:00
- Wrote `packages/client/tests/e2e/s3-t3-timeline.spec.ts` (163 lines). Constant audit: 0 matches. Next: lint + audits.

## [STAGE 3] COMPLETE
- **At:** 2026-05-27T00:20:00Z
- **Deliverables:**
  | File | Lines | Notes |
  |------|-------|-------|
  | `packages/client/src/components/sessions/AgentTimeline.tsx` | 298 | Req A + B; scroll model + adaptive units |
  | `packages/client/tests/e2e/s3-t3-timeline.spec.ts` | 163 | +SC-scroll, +SC-units; existing SC-contrast/SC-orphan-spawn preserved |
- **Lint:** exit 0
- **Constant audit:** 0 matches in modified files; no ad-hoc hex; all FF7 `var(--)` tokens
- **AnalyzeTab.tsx:** NOT touched — grid `minWidth: 0` on the right column already provides correct scroll containment; inner `overflow-x: auto` on the scroller div is sufficient

## [STAGE 1] RECEIVED
- **From:** ORC
- **At:** 2026-05-27T00:00:00Z
- **Task ID:** s3-t8-timeline-scroll-units
- **Message received:**
  > ## Task — s3-t8-timeline-scroll-units
  > Two refinements to the AgentTimeline component, surfaced by human verification at S3 Step 4.5. You are FE#6. The dev server is running under `tsx watch` / Vite at http://localhost:5173 (PID 351264) — Vite HMR picks up your edits.
  > **Primary file:** `packages/client/src/components/sessions/AgentTimeline.tsx` (existing, audited, committed `70bd848`).
  > **Spec to update:** `packages/client/tests/e2e/s3-t3-timeline.spec.ts`.
  > Requirement A — Horizontal scroll + readable minimum scale
  > Requirement B — Adaptive x-axis units (s / m / h / d)
  > …[truncated]
