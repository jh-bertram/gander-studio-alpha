## [STAGE 1] RECEIVED
- **From:** ORC
- **At:** 2026-05-28T09:00:00Z
- **Task ID:** p6-t1-timeline-buffer
- **Message received:**
  > Implement **p6-t1-timeline-buffer**: add a right-edge buffer to `AgentTimeline` so the rightmost bar and the final x-axis tick label render fully with a visible gap before the SVG right edge, instead of clipping. Critic-approved geometry (CR#2 CRITIQUE_PASS).
  > Your authoritative spec is the rev1 task packet — read it and follow the p6-t1 packet exactly:
  >   `.claude/agents/tasks/outputs/gander-studio-p6-overview-polish-PM-rev1-1780011957.md`
  > …[truncated]

## [STAGE 2] PLAN
- **At:** 2026-05-28T09:01:00Z
- **Components to build:**
  - `packages/client/src/components/sessions/AgentTimeline.tsx` — modify geometry (RIGHT_PAD constant, plotAreaWidth + plotRight in render, 4 changed lines)
  - `packages/client/tests/e2e/p6-t1-timeline-buffer.spec.ts` — new Tier-2 Playwright spec

- **State design:** No new state. Pure geometry changes to derived values inside the render.

- **tRPC wiring:** None — no new data fetching.

- **A11Y plan:** No a11y regressions. Tick text remains aria-hidden. Bar aria-labels unchanged. SVG role="img" aria-label unchanged. No new interactive elements.

- **Geometry plan:**
  1. Add `const RIGHT_PAD = 48;` in the layout constants block (after PX_PER_SECOND line ~36)
  2. After `const contentBarAreaActual = contentWidth - LABEL_COL_WIDTH;` (~line 259), add:
     `const plotAreaWidth = Math.max(MIN_BAR_AREA, contentBarAreaActual - RIGHT_PAD);`
     `const plotRight = LABEL_COL_WIDTH + plotAreaWidth;`
  3. Update `normX` to use `plotAreaWidth` instead of `contentBarAreaActual`
  4. Update tick x positions to use `frac * plotAreaWidth`
  5. Update orphan `barEndX` from `contentWidth` to `plotRight`
  6. Update axis baseline `x2` from `contentWidth` to `plotRight`
  7. SVG `width={contentWidth}` stays UNCHANGED

- **E2E plan:** 3 tests using boundingBox() assertions:
  (a) Final tick label right edge ≤ SVG right edge
  (b) Rightmost bar rect right edge < SVG right edge (strict)
  (c) Short-session scrollWidth ≤ clientWidth guard

### Checkpoint — 09:04:00
- Wrote `packages/client/src/components/sessions/AgentTimeline.tsx` (modified, ~15 new lines). Constant audit: 0 hex matches. Next: write e2e spec.

### Checkpoint — 09:06:00
- Wrote `packages/client/tests/e2e/p6-t1-timeline-buffer.spec.ts` (121 lines). Constant audit: 0 hex matches. Next: run e2e tests.

### Checkpoint — 09:08:00
- e2e test 2 failed: REQVAL#1 bar rendered outside SVG bounds due to pre-existing axis bug (tAxisMax ignored late spawns). Fixed tAxisMax to include allSpawnTs. Re-ran: 3/3 pass.

## [STAGE 3] COMPLETE
- **At:** 2026-05-28T09:10:00Z
- **Deliverables:**
  | File | Lines | Notes |
  |------|-------|-------|
  | `packages/client/src/components/sessions/AgentTimeline.tsx` | modified | +RIGHT_PAD, +plotAreaWidth/plotRight, 4 changed lines + tAxisMax fix |
  | `packages/client/tests/e2e/p6-t1-timeline-buffer.spec.ts` | 121 | 3 passing Tier-2 tests |
  | `.claude/agents/tasks/outputs/p6-t1-timeline-buffer-FE-1780012300.md` | — | completion packet |

- **Lint:** exit code 0
- **Constant audit:** 0 raw hex matches; 0 inline style conflicts; 0 click-handler a11y issues; 0 JSON.parse usages
