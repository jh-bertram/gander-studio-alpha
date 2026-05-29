# p6-t1-timeline-buffer — FE Completion Packet
generated: 2026-05-28T09:10:00Z
agent: FE
task_id: p6-t1-timeline-buffer

## Summary

Added a right-edge buffer (`RIGHT_PAD = 48`) to `AgentTimeline` by folding the pad INSIDE the plot area (shrinking `plotAreaWidth`, keeping `svg width = contentWidth` unchanged). All data (bars, ticks, axis baseline) now end 48px before the SVG right edge — the final tick label and rightmost bar render fully within bounds.

Also fixed a pre-existing axis computation bug: `tAxisMax` was computed from only `allCompleteTs`, ignoring spawn timestamps of agents that spawned after the last COMPLETE event. Those agents (e.g. REQVAL#1 in the fixture) rendered outside the axis range. Fix: `tAxisMax = Math.max(maxComplete, maxSpawn)` when completes exist.

## Files Modified

- `packages/client/src/components/sessions/AgentTimeline.tsx`

## Files Created

- `packages/client/tests/e2e/p6-t1-timeline-buffer.spec.ts` (Tier-2 e2e spec)
- `packages/client/tests/e2e/debug_timeline.spec.ts` (empty stub — temporary debug file, safe to delete)

## Geometry Changes (AgentTimeline.tsx)

1. **RIGHT_PAD constant** (value 48) added in layout constants block after `PX_PER_SECOND` line.

2. **plotAreaWidth + plotRight** derived in render after `contentBarAreaActual`:
   ```
   const plotAreaWidth = Math.max(MIN_BAR_AREA, contentBarAreaActual - RIGHT_PAD);
   const plotRight = LABEL_COL_WIDTH + plotAreaWidth;
   ```

3. **SVG `width={contentWidth}`** — UNCHANGED. Byte-identical.

4. **normX** now scales by `plotAreaWidth` (was `contentBarAreaActual`). `tAxisMax → plotRight`.

5. **Tick x positions** use `frac * plotAreaWidth` (was `frac * contentBarAreaActual`). Final tick at `plotRight`.

6. **Orphan `barEndX`** uses `plotRight` (was `contentWidth`).

7. **Axis baseline `x2`** uses `plotRight` (was `contentWidth`).

8. **tAxisMax axis fix** (pre-existing bug surfaced by e2e): `Math.max(maxComplete, maxSpawn)` when completes exist — prevents late-spawning agents from rendering outside axis range.

## SC Verification

- SC1: `grep -c 'RIGHT_PAD' ...AgentTimeline.tsx` → 5 (≥ 1) ✓
- SC2: `grep -c 'plotAreaWidth' ...AgentTimeline.tsx` → 6 (≥ 2) ✓
- SC2: `grep -c 'plotRight' ...AgentTimeline.tsx` → 5 (≥ 2) ✓
- SC3: `width={contentWidth}` line does NOT contain `+ RIGHT_PAD` ✓
- SC4: `normX` function body contains `plotAreaWidth` ✓
- SC5: tick x formula uses `frac * plotAreaWidth` ✓
- SC6: orphan barEndX uses `plotRight` (lines 419-420) ✓
- SC7: `npm run lint` exit 0 ✓
- SC8: e2e spec exists with boundingBox() (≥ 2 uses) and scrollWidth/clientWidth ✓
- SC9: no raw hex colors introduced ✓

## E2E Spec Tests (all 3 pass)

Spec: `packages/client/tests/e2e/p6-t1-timeline-buffer.spec.ts`

1. **Load test** — SVG visible, bar rects attached ✓
2. **Primary interaction** — final tick right edge ≤ SVG right edge; rightmost bar right edge < SVG right edge (strict, verified with boundingBox()) ✓
3. **Short-session guard** — scroller scrollWidth equals SVG width attr (no extra width from RIGHT_PAD change) ✓

Run result: `3 passed (4.7s)`

## npm run lint

Exit code: **0**

## No-Commit Confirmation

No git commit made. No git stage. Completion packet returned as required.
