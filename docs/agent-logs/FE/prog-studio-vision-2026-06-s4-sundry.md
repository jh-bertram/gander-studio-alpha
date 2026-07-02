## [STAGE 3] COMPLETE
- **At:** 2026-06-20T00:10:00Z
- **Deliverables:**

| File | Lines | Notes |
|------|-------|-------|
| SkeletonCard.tsx | 20 | Removed inline background blocking shimmer class |
| DrilldownPanel.tsx | 438 | Focus trap visibility filter added |
| ModeContent.tsx | 57 | Primitive selector + mode-enter crossfade |
| useLinkSound.ts | 373 | playChime + playTick added |
| canvas.ts | 192 | CHIME_* + TICK_* constants |
| EditPage.tsx | 1372 | playChime in onSaveSuccess |
| ExportPage.tsx | 562 | playChime in export onSuccess |
| GraphPage.tsx | 460 | Hover highlight + playTick |

- **Lint:** tsc exits 0 (both client and server)
- **Constant audit:** 0 @keyframes in component files; 0 raw hex in new code

## [STAGE 2] PLAN
- **At:** 2026-06-20T00:01:00Z
- **Components to build:**
  1. `packages/client/src/components/browse/SkeletonCard.tsx` — add `.skeleton-shimmer` class (p1 defined); the div already has `className="skeleton-shimmer"` so the fix is removing the conflicting inline `background` style which overrides the class
  2. `packages/client/src/components/browse/DrilldownPanel.tsx` — already has `className="panel-in"` on the panel div; verify focus trap filters by `offsetParent !== null`; enhance focus trap with visibility filter
  3. `packages/client/src/components/ModeContent.tsx` — add `.mode-enter` class keyed on `activeMode` via React key prop; read `activeMode` as primitive selector; add `key={activeMode}` on content to re-trigger animation on switch
  4. `packages/client/src/hooks/useLinkSound.ts` — add `playChime()` (save/export success sound) and `playTick()` (UI feedback tick); all gated by mute
  5. `packages/client/src/pages/EditPage.tsx` — wire `playChime()` in `onSaveSuccess` callback
  6. `packages/client/src/pages/ExportPage.tsx` — wire `playChime()` in export `onSuccess` callback
  7. `packages/client/src/pages/GraphPage.tsx` — add hover neighborhood highlight (CSS class on hover state via useState) + NODE_TYPE_COLORS role colors already used; add `.mode-enter` entrance class; no new @keyframes

- **State design:** `ModeContent` reads `activeMode` via primitive selector `useUIStore((s) => s.activeMode)` (not destructuring object); `GraphPage` uses local `hoveredNodeId` state for neighborhood highlight; no new store slices

- **tRPC wiring:** None new. EditPage/ExportPage already have mutation callbacks; we intercept `onSaveSuccess`/`onSuccess` to add sound.

- **A11Y plan:** DrilldownPanel focus trap already exists; enhance with `offsetParent !== null` filter. SkeletonCard has `aria-hidden="true"`. ModeContent mode-enter animation is CSS-only, no ARIA change needed. All sounds are supplementary (muted by default gate). GraphPage hover highlight adds `aria-label` describing the highlighted state.

- **Key decisions:**
  - SkeletonCard: the `background: 'var(--sfm)'` inline style overrides the `.skeleton-shimmer` CSS class background. Must remove/replace the inline background so the shimmer gradient can render. Keep border/borderRadius/height as inline since those don't conflict with the class.
  - DrilldownPanel: already has `className="panel-in"` — just need to fix focus trap visibility filter.
  - ModeContent: `key={activeMode}` on the `<ActivePage>` wrapper div triggers React to unmount+remount, which re-applies the CSS animation. Use primitive selector.
  - useLinkSound: add `playChime()` (high-pitched success ping) and `playTick()` (soft tick for UI events) using same pattern as existing functions.
  - GraphPage: `hoveredNodeId` state → pass to ReactFlow nodes as `selected`-like prop or use CSS data attributes. Will add `onNodeMouseEnter`/`onNodeMouseLeave` handlers to ReactFlow to set hovered node; dim non-neighbors via node style. This is a non-trivial interaction — will implement via node className on the `data` prop passed to `GraphNode`.

### Checkpoint — 00:07:00
- Wrote `GraphPage.tsx` (hover neighborhood highlight + playTick + scoped styles, +78 lines). Constant audit: 0 @keyframes, 0 hex. Verified NodeMouseHandler typed inline. Next: typecheck + output packet.

### Checkpoint — 00:06:00
- Wrote `EditPage.tsx` (import + playChime in onSaveSuccess, +3 lines). Wrote `ExportPage.tsx` (import + playChime in onSuccess, +3 lines). Constant audit: 0 new hex. Next: GraphPage.tsx hover highlight.

### Checkpoint — 00:05:00
- Wrote `packages/client/src/hooks/useLinkSound.ts` (+playChime/playTick, ~105 new lines). Constant audit: 0 hex literals in new functions. Next: wire playChime in EditPage.tsx.

### Checkpoint — 00:04:00
- Wrote `packages/client/src/components/ModeContent.tsx` (52 lines). Constant audit: 0 new hex matches. Primitive selector verified. Next: useLinkSound chime+tick functions.

### Checkpoint — 00:03:00
- Wrote `packages/client/src/components/browse/DrilldownPanel.tsx` (focus trap fix, +2 lines effective). Constant audit: 0 new hex matches. Next: ModeContent.tsx mode-enter class.

### Checkpoint — 00:02:00
- Wrote `packages/client/src/components/browse/SkeletonCard.tsx` (20 lines). Constant audit: 0 matches. Next: DrilldownPanel focus trap fix.

## [STAGE 1] RECEIVED
- **From:** ORC
- **At:** 2026-06-20T00:00:00Z
- **Task ID:** s4-p2+p6 (D7 + sounds + mode-switch + GraphPage interactivity)
- **Message received:**
  > You are the frontend-engineer. s4-p2+p6: D7 + sounds + mode-switch + GraphPage interactivity. Make REAL edits.
  > Files: packages/client/src/components/browse/SkeletonCard.tsx + DrilldownPanel.tsx (D7: apply p1's skeleton-shimmer + panel-in classes; reduced-motion-gated entrance), packages/client/src/components/ModeContent.tsx (mode-switch transition referencing p1's keyframe), packages/client/src/hooks/useLinkSound.ts (ADD save/export/UI-tick sound functions — all gated by p1's mute), the Edit/Export save/export call sites (wire chimes), packages/client/src/pages/GraphPage.tsx (hover/select neighborhood highlight + click-through to Browse where cheap). Do NOT edit AgentTimeline.tsx or ProgressionPage.tsx (other agents own them). Do NOT add keyframes to globals.css (reference p1's). Stable Zustand selectors only. All audio behind mute; all motion behind reduced-motion. Do NOT run full npm run lint while sibling agents edit concurrently; the auditor lints after. Do NOT edit globals.css (p1 owns all keyframes — reference them by name by class).
  > …[truncated]
