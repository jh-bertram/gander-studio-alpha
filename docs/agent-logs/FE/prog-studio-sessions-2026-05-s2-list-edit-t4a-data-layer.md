## [STAGE 3] COMPLETE
- **At:** 2026-05-20T00:20:00Z
- **Deliverables:**

| File | Lines | Notes |
|------|-------|-------|
| `packages/client/src/store/session-store.ts` | 38 | Replaced t3b stub; full Zustand store, 7 state fields, 6 setters |
| `packages/client/src/hooks/useSessions.ts` | 36 | useSessions (envelope unwrap) + useSessionDetail (bare) |

- **Lint:** exit 0
- **Constant audit:** 0 matches (no raw hex, rgba, conversion factors)
- **Style conflict check:** NONE
- **JSON.parse audit:** not present in files
- **Click-handler keyboard audit:** no JSX / interactive elements (data layer only)

### Checkpoint — 00:12:00
- Wrote `packages/client/src/store/session-store.ts` (38 lines). Constant audit: 0 matches. Next: useSessions.ts.

### Checkpoint — 00:15:00
- Wrote `packages/client/src/hooks/useSessions.ts` (36 lines). Constant audit: 0 matches. Next: lint.

## [STAGE 2] PLAN
- **At:** 2026-05-20T00:10:00Z
- **Components to build:**
  - `packages/client/src/store/session-store.ts` (REPLACE t3b stub — full Zustand store)
  - `packages/client/src/hooks/useSessions.ts` (NEW — data-fetch hooks)
- **State design:**
  - `session-store.ts`: Zustand store with 7 fields (sessions, selectedSessionId, activeTab, editBuffer, originalContent, lastSaveResult, lastSaveError) + 6 setters. No local state (pure store). Mirrors browse-store.ts pattern.
  - No local React state (hooks only wrap tRPC queries).
- **tRPC wiring:**
  - `useSessions()`: `trpc.session.list.useQuery({ limit: 50 })` — unwraps `.sessions` envelope
  - `useSessionDetail(id)`: `trpc.session.get.useQuery({ id })` — bare object, no unwrap
- **A11Y plan:** No JSX/UI in scope for this task — data layer only. No ARIA roles needed.

## [STAGE 1] RECEIVED
- **From:** ORC (sprint prog-studio-sessions-2026-05-s2-list-edit)
- **At:** 2026-05-20T00:00:00Z
- **Task ID:** prog-studio-sessions-2026-05-s2-list-edit-t4a-data-layer
- **Message received:**
  > You are FE#3 for sprint `prog-studio-sessions-2026-05-s2-list-edit`, task `t4a-data-layer`. Implement ONLY this task_id's scope.
  > ## Task
  > Implement the Sessions Zustand store (full, replacing the t3b stub) and the data-fetch hooks. No UI components. Authoritative packet: read the `t4a-data-layer` task_packet in `.claude/agents/tasks/outputs/prog-studio-sessions-2026-05-s2-list-edit-PM-rev1-1779304665.md` (~line 488).
  > ## Exact deliverables (2 source files)
  > 1. REPLACE `packages/client/src/store/session-store.ts` (currently a t3b stub; keep the export name `useSessionStore` so SessionsRouter's import stays valid).
  > 2. NEW `packages/client/src/hooks/useSessions.ts` …[truncated]
