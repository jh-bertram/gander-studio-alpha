## [STAGE 2] PLAN
- **At:** 2026-05-27T02:20:00Z
- **Components to build:**
  1. `packages/client/src/components/sessions/AgentStatPanel.tsx` — per-agent stat card
  2. `packages/client/src/components/sessions/AgentStatTable.tsx` — sortable table
  3. `packages/client/tests/e2e/s3-t4-stat-surfaces.spec.ts` — Playwright Tier 2 spec
- **State design:** No store slices. Local sort state in AgentStatTable: `sortKey: MetricKey | 'agent' | 'audit' | null`, `sortDir: 'asc' | 'desc' | 'default'`. AgentStatPanel is stateless.
- **tRPC wiring:** None consumed directly. Props come from parent (t5a AnalyzeTab will pass activities + metrics from analyzeStore).
- **A11Y plan:**
  - AgentStatPanel: role="article" aria-label, metric value aria-label, audit group role="group"
  - AgentStatTable: native table, aria-sort on each th, buttons inside th for sort, aria-live on empty state
  - Both: keyboard-navigable (buttons native)
- **Fixture for SC-sort:** `gander-p3-team-report-v1-2` — verified via getStats: agents [REQVAL#1(1), ORC#0(0), AR#1(2), ...], 3 distinct spawns values {0,1,2}. Initial first-3 rows: [REQVAL#1, ORC#0, AR#1]. Ascending first-3: [ORC#0, AUDITOR#1, REQVAL#1]. Descending first-3: [AR#1, REQVAL#1, AR#2]. Note: ties at spawns=0 or spawns=1 mean we assert the first agent ID in those groups.
- **No Shadcn primitives** — plain divs and native table throughout (avoids FF7 token collision entirely).

### Checkpoint — 02:25:00
- Wrote `packages/client/src/components/sessions/AgentStatPanel.tsx` (176 lines). Constant audit: 0 raw hex matches. Next: write AgentStatTable.tsx.

### Checkpoint — 02:32:00
- Wrote `packages/client/src/components/sessions/AgentStatTable.tsx` (288 lines). Constant audit: 0 raw hex matches. Next: write e2e spec.

### Checkpoint — 02:45:00
- Wrote `packages/client/tests/e2e/s3-t4-stat-surfaces.spec.ts` (164 lines). 4 tests: load, SC-sort, SC-contrast, audit-attribution. Next: run lint, audits.

### Checkpoint — 02:48:00
- `npm run lint` exit 0. Constant audit: 0 raw hex in both component files. Style conflict check: NONE. No JSON.parse. No duplicate function bodies. Click-handler keyboard audit: no non-button onClick. All checks pass.

## [STAGE 3] COMPLETE
- **At:** 2026-05-27T02:50:00Z
- **Deliverables:**

| File | Lines | Notes |
|------|-------|-------|
| `packages/client/src/components/sessions/AgentStatPanel.tsx` | 178 | Per-agent stat card, FF7 tokens, audit-attribution always rendered |
| `packages/client/src/components/sessions/AgentStatTable.tsx` | 292 | Sortable table, 3-state sort cycle, data-agent-id rows |
| `packages/client/tests/e2e/s3-t4-stat-surfaces.spec.ts` | 164 | SC-sort pinned fixture, SC-contrast, audit-attribution |

- **Lint:** exit 0
- **Constant audit:** 0 raw hex in created files. 0 Shadcn ui/* imports in created files.

---

## [STAGE 1] RECEIVED
- **From:** ORC (sprint dispatch)
- **At:** 2026-05-27T00:00:00Z
- **Task ID:** s3-t4-stat-surfaces
- **Message received:**
  > Implement `s3-t4-stat-surfaces` per PM rev1: create AgentStatPanel + AgentStatTable for the Analyze tab. You are FE#3.
  > Files to create: AgentStatPanel.tsx + AgentStatTable.tsx. Packets in .claude/agents/tasks/outputs/. Hard SCs: props typed from AgentActivitySchema, FF7 tokens, SC-sort e2e with pinned fixture, SC-contrast e2e, lint exits 0. …[truncated]
