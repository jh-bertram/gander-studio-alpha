## [STAGE 1] RECEIVED
- **From:** ORC (prog-studio-vision-2026-06)
- **At:** 2026-06-20T00:00:00Z
- **Task ID:** prog-studio-vision-2026-06-s5-MERGE
- **Message received:**
  > Execute the s5 MERGE stage. The DELETE stage is DONE. DRY merges, NO behavior change: Extract the triplicated findSessionById in router.ts into ONE shared helper; Merge formatWallClock/MetricKey/METRIC_LABEL; Extract ErrorState (4x) and shimmer style (8x). Do NOT merge TableTab/AgentStatTable. Do NOT touch feedback_loops. …[truncated]

## [STAGE 2] PLAN
- **At:** 2026-06-20T00:00:00Z
- **Approach:**
  1. Extract `findSessionById` helper in `packages/server/src/router.ts` — returns `{ session: Session, dir: string }`, called by `session.get`, `session.getStats`, `session.getRaw`. Each caller keeps its own post-processing. `getRaw` keeps its `validateSaveEditPath` round-trip.
  2. Create `packages/client/src/utils/session-metrics.ts` — exports `MetricKey`, `formatWallClock`. Remove duplicates from `AgentStatPanel.tsx` and `SessionListPage.tsx`.
  3. Create `packages/client/src/components/ui/error-state.tsx` — exports `ErrorState` with `fallbackMessage?: string` prop. The default is `'An unexpected error occurred.'`. `AnalyzeTab.tsx` passes `'Failed to load analysis data.'`.
  4. Create `packages/client/src/components/ui/shimmer-box.tsx` — exports `ShimmerBox` component with height/width/etc. props.
  5. Update all callers to use the shared components.
  6. Run lint + server tests.

- **Files to create/modify:**
  - `packages/server/src/router.ts` → extract `findSessionById` helper
  - `packages/client/src/utils/session-metrics.ts` → new: MetricKey + formatWallClock
  - `packages/client/src/components/ui/error-state.tsx` → new: ErrorState
  - `packages/client/src/components/ui/shimmer-box.tsx` → new: ShimmerBox
  - `packages/client/src/components/sessions/AgentStatPanel.tsx` → import from session-metrics
  - `packages/client/src/pages/sessions/SessionListPage.tsx` → import from session-metrics + error-state + shimmer-box
  - `packages/client/src/pages/BrowsePage.tsx` → import ErrorState from shared
  - `packages/client/src/pages/sessions/SessionDetailPage.tsx` → import ErrorState + ShimmerBox from shared
  - `packages/client/src/pages/sessions/SessionListPage.tsx` → import ShimmerBox
  - `packages/client/src/pages/sessions/tabs/AnalyzeTab.tsx` → import ErrorState (custom fallbackMessage) + ShimmerBox
  - `packages/client/src/pages/sessions/tabs/EditorTab.tsx` → import ShimmerBox
  - `packages/client/src/pages/EditPage.tsx` → import ShimmerBox

- **Dependencies / assumptions:**
  - Hard guard: do NOT merge TableTab/AgentStatTable — AgentStatTable's `METRIC_LABEL` (spawns='Count') and `formatWallClock` stay local; `MetricKey` type stays local in that file.
  - `AgentStatPanel.tsx` and `SessionListPage.tsx` are the only 2 files where `formatWallClock` is duplicated that are in scope for DRY merge.
  - `METRIC_LABEL` in `AgentStatPanel.tsx` (spawns='Spawns') differs from `AgentStatTable.tsx` (spawns='Count') — keep AgentStatTable local; only AgentStatPanel's METRIC_LABEL is in scope.
  - `METRIC_LABEL` is NOT used in `SessionListPage.tsx` — no need to export from shared.
  - The shimmer CSS properties differ slightly by context (height, width, borderRadius) but the `background` + `backgroundSize` + `animation` pattern is shared. Use a ShimmerBox that accepts style overrides.
  - NOT merging AgentStatTable (hard guard), NOT touching feedback_loops (hard guard).

### Checkpoint — 00:05:00
- Created `packages/client/src/utils/session-metrics.ts` (14 lines). Next: create error-state.tsx.

### Checkpoint — 00:06:00
- Created `packages/client/src/components/ui/error-state.tsx` (65 lines). Next: create shimmer-box.tsx.

### Checkpoint — 00:07:00
- Created `packages/client/src/components/ui/shimmer-box.tsx` (52 lines). Next: update callers.

### Checkpoint — 00:08:00
- Updated `packages/server/src/router.ts`: extracted `findSessionById` helper, updated get/getStats/getRaw. Next: update client files.

### Checkpoint — 00:10:00
- Updated `AgentStatPanel.tsx`, `SessionListPage.tsx`, `BrowsePage.tsx`, `SessionDetailPage.tsx`, `AnalyzeTab.tsx`, `EditorTab.tsx`, `EditPage.tsx`. Next: run lint + tests.

## [STAGE 3] COMPLETE
- **At:** 2026-06-20T00:15:00Z
- **Deliverables:**
  | File | Lines | Notes |
  |------|-------|-------|
  | packages/server/src/router.ts | +35/-95 | findSessionById helper extracted; 3 callers simplified |
  | packages/client/src/utils/session-metrics.ts | 14 | NEW: MetricKey + formatWallClock |
  | packages/client/src/components/ui/error-state.tsx | 65 | NEW: shared ErrorState |
  | packages/client/src/components/ui/shimmer-box.tsx | 52 | NEW: shared ShimmerBox |
  | packages/client/src/components/sessions/AgentStatPanel.tsx | -8 | imports from session-metrics |
  | packages/client/src/pages/BrowsePage.tsx | -44 | imports ErrorState from shared |
  | packages/client/src/pages/sessions/SessionDetailPage.tsx | -50 | imports ErrorState + ShimmerBox |
  | packages/client/src/pages/sessions/SessionListPage.tsx | -55 | imports all shared; removed local duplicates |
  | packages/client/src/pages/sessions/tabs/AnalyzeTab.tsx | -65 | imports ErrorState + ShimmerBox; SC6 fallbackMessage |
  | packages/client/src/pages/sessions/tabs/EditorTab.tsx | -10 | imports ShimmerBox |
  | packages/client/src/pages/EditPage.tsx | -9 | imports ShimmerBox |
- **Lint / tests:** lint EXIT 0; 108/108 server tests pass
- **Open items:** none — all hard guards preserved, SC1-SC6 verified
