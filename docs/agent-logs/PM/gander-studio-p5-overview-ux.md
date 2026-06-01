# PM Agent Log — gander-studio-p5-overview-ux

## Stage 1 — RECEIVED
ts: 2026-05-28T00:00:00Z
task_id: gander-studio-p5-overview-ux
brief_source: orchestrator_brief

Brief received. Four features:
1. AgentTimeline x-axis zoom (+/-)
2. Remove left sidebar, bottom tab bar becomes always-on primary nav
3. SessionListPage becomes overview with aggregate stats roll-up
4. Session multi-select drives aggregate counts

Will read source files before drafting tasks.

---

## Stage 2 — PLAN
ts: 2026-05-28T00:01:00Z

### Files read
1. docs/post-mortems/prog-studio-sessions-2026-05-s3-analyze.md — §6 recurring patterns G1–G5
2. docs/post-mortems/gander-studio-p4-proximity-edge-hardening.md — §6 recurring patterns
3. packages/client/src/pages/sessions/SessionListPage.tsx — confirmed shape, row-click behavior
4. packages/client/src/App.tsx — App entry; mounts AppShell
5. packages/client/src/AppShell.tsx — mounts Header, Sidebar, ModeContent, BottomTabBar
6. packages/client/src/globals.css — grid: "hd hd" / "nv mn", @media (max-width: 640px) collapses already
7. packages/client/src/components/Sidebar.tsx — gridArea: 'nv', class "sidebar", 250px
8. packages/client/src/components/BottomTabBar.tsx — position: fixed; bottom: 0; always in DOM; currently mobile-contextual only because sidebar hides at 640px
9. packages/client/src/components/sessions/AgentTimeline.tsx — contentWidth constants, PX_PER_SECOND scale model
10. packages/client/src/components/sessions/SessionPicker.tsx — multi-select pattern with toggle buttons
11. packages/server/src/parsers/session-stats.ts — computeSessionStats, EventCounts; wall_clock_ms is NOT additive
12. packages/server/src/router.ts — confirmed no aggregate procedure exists; session sub-router has list/get/getStats
13. docs/deferred-work.md — DEFERRED-002 zoom sketch confirmed

### Consultation sub-agents
None needed — all domain facts resolved from source reads.

### Design decisions made
1. **Sidebar removal**: Remove `<Sidebar />` from AppShell.tsx. Change `.app-shell` CSS to single-column: `grid-template-columns: 1fr; grid-template-areas: "hd" "mn"` (always, not just at 640px breakpoint). Remove @media (max-width: 640px) sidebar hide rules (will be dead). Add `padding-bottom: 56px` to `#mode-content` so content is not occluded by the fixed 56px BottomTabBar.
2. **BottomTabBar**: Already `position: fixed; bottom: 0; left: 0; right: 0` — no change needed; it is already always-on. The sidebar removal is the only structural change needed.
3. **Timeline zoom**: Scale factor (`zoomLevel`, default 1.0) stored in component state. +/- buttons multiply/divide by 1.5, clamped to [0.25, 4.0]. The effective `contentWidth` = `rawContentWidth * zoomLevel`. Scroll already handles overflow.
4. **Aggregate backend procedure**: New `session.aggregateStats` tRPC procedure — takes `{ sessionIds: string[] }`, fetches all sessions + events, runs `computeSessionStats` per session, sums additive fields (spawns, completes, critique_passes, critique_blocks, audit_passes, audit_fails, feedback_loops, per-agent counts), computes `wall_clock_ms` as SUM of per-session deltas (with a field label clarification note in the UI). Returns `SessionStatsSchema`-shaped object. Single Zod boundary; DRY with existing `computeSessionStats`.
5. **Overview page**: `SessionListPage.tsx` gains a selection strip (all/none toggle + per-row checkboxes) and an aggregate stats panel above the table. Row-click behavior unchanged.
6. **Multi-select store**: Add `selectedSessionIds: Set<string>` + toggle/setAll/clearAll actions to `session-store.ts`. Default = all session ids (set on data load).

### Task breakdown
- t1-FE: Sidebar removal + grid layout cleanup (AppShell.tsx + globals.css + ModeContent #mode-content bottom padding)
- t2-BE: New `session.aggregateStats` tRPC procedure + Zod boundary in shared schemas
- t3-FE: AgentTimeline zoom control
- t4-FE: SessionListPage overview (multi-select + aggregate stats display)

### Dependency order
t1-FE (independent) → can run in parallel with t2-BE
t2-BE → t4-FE (overview needs the aggregate procedure)
t3-FE (independent of t2 and t4 — touches only AgentTimeline.tsx)

So: wave A = t1-FE + t2-BE + t3-FE (parallel); wave B = t4-FE (after t2-BE)

---

## Stage 3 — COMPLETE
ts: 2026-05-28T00:10:00Z
output_files:
- /home/jhber/projects/gander-studio-alpha/.claude/agents/tasks/outputs/gander-studio-p5-overview-ux-PM-1779998724.md
- /home/jhber/projects/gander-studio-alpha/docs/task-registry.md
