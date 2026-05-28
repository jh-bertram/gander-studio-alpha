## [STAGE 3] COMPLETE
- **At:** 2026-05-20T00:06:00Z
- **Deliverables:**

| File | Lines | Notes |
|------|-------|-------|
| `packages/client/src/pages/sessions/SessionListPage.tsx` | 260 | Full implementation replacing stub |
| `packages/client/src/globals.css` | +5 | Added @keyframes pulse-opacity |
| `packages/client/tests/e2e/prog-studio-sessions-2026-05-s2-list-edit-fe.spec.ts` | 62 | 3 e2e tests covering load/interaction/empty-error |

- **Lint:** exit 0 (tsc --noEmit passed for all 3 packages)
- **Constant audit:** 0 matches for raw hex, rgba literals, or conversion constants

### Checkpoint — 00:02:00
- Wrote `packages/client/src/pages/sessions/SessionListPage.tsx` (260 lines). Constant audit: 0 matches. Next: e2e spec.

### Checkpoint — 00:04:00
- Wrote `packages/client/tests/e2e/prog-studio-sessions-2026-05-s2-list-edit-fe.spec.ts` (62 lines). Constant audit: 0 matches. Next: lint + output packet.

## [STAGE 2] PLAN
- **At:** 2026-05-20T00:01:00Z
- **Components to build:**
  - `packages/client/src/pages/sessions/SessionListPage.tsx` — full implementation replacing stub
  - `packages/client/tests/e2e/prog-studio-sessions-2026-05-s2-list-edit-fe.spec.ts` — first e2e spec
- **State design:**
  - Reads `sessions`, `isLoading`, `error` from `useSessions()` hook
  - Calls `useSessionStore().setSelectedSessionId(session.id)` on row click
  - No local state needed
- **tRPC wiring:** `session.list` via `useSessions()` hook (already implemented in t4a)
- **A11Y plan:**
  - `aria-busy="true"` on loading container + sr-only "Loading sessions…"
  - `role="alert"` on error panel
  - `aria-live="polite"` on empty state
  - `table[aria-label="Sessions list"]` for semantic table
  - Each `tr` in tbody: `role="row"`, `tabIndex={0}`, `aria-label="{sprint} — {date}"`, `onKeyDown` handler for Enter/Space

## [STAGE 1] RECEIVED
- **From:** ORC
- **At:** 2026-05-20T00:00:00Z
- **Task ID:** prog-studio-sessions-2026-05-s2-list-edit-t4b-list-page
- **Message received:**
  > You are FE#4 for sprint `prog-studio-sessions-2026-05-s2-list-edit`, task `t4b-list-page`. Implement ONLY this task_id's scope.
  > ## Task
  > Replace the t3b SessionListPage stub with a full implementation, and create the first e2e spec. Authoritative packet: read the `t4b-list-page` task_packet in `.claude/agents/tasks/outputs/prog-studio-sessions-2026-05-s2-list-edit-PM-rev1-1779304665.md` (~line 577).
  > ## Deliverables
  > 1. REPLACE `packages/client/src/pages/sessions/SessionListPage.tsx` (stub → full): Calls `useSessions()` from `packages/client/src/hooks/useSessions.ts`. Renders one row per session: sprint slug (`session.sprint`), date (`session.date`), status (`session.status ?? '—'`), gap_classes (`session.gap_classes.join(', ')` or '—' if empty). Row click → `useSessionStore().setSelectedSessionId(session.id)`. Loading state: `aria-busy="true"` + "Loading sessions…". Error state: `role="alert"`. Empty state: `aria-live="polite"` "No sessions found". `data-testid="sessions-list-page"` on root div. Use Mako Teal tokens. No raw hex.
  > 2. CREATE `packages/client/tests/e2e/prog-studio-sessions-2026-05-s2-list-edit-fe.spec.ts` (co-located test): Placeholder test: navigate to the Sessions mode, assert `data-testid="sessions-list-page"` is visible. Follow existing e2e spec patterns.
  > …[truncated]
