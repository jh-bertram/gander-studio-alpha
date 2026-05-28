## [STAGE 2] PLAN
- **At:** 2026-05-20T00:01:00Z
- **Components to build:**
  - `packages/client/src/pages/sessions/SessionDetailPage.tsx` (replace stub with full shell)
  - `packages/client/tests/e2e/prog-studio-sessions-2026-05-s2-list-edit-fe.spec.ts` (extend, keep t4b assertions)
- **State design:**
  - Reads `selectedSessionId` and `activeTab` from `useSessionStore()`
  - Calls `useSessionDetail(selectedSessionId!)` for session data
  - `setActiveTab` from store for tab switching
  - `setSelectedSessionId(null)` for Back button
- **tRPC wiring:** `useSessionDetail` → `trpc.session.get.useQuery` (already in hook)
- **A11Y plan:**
  - `role="tablist"` + `aria-label="Session detail tabs"` on tab container
  - Each tab: `role="tab"`, `aria-selected`, `aria-controls="{id}-panel"`, `id="{id}-tab"`
  - Analyze: `aria-disabled="true"`, `disabled`, `title="Coming in S3"`
  - Panel: `role="tabpanel"`, `id="{activeTab}-panel"`, `aria-labelledby="{activeTab}-tab"`
  - Loading: spinner visible state. Error: `role="alert"`
  - Keyboard: ArrowLeft/ArrowRight navigate tabs; Enter/Space activates
  - Back button: `aria-label="Back to sessions list"`

### Checkpoint — 00:03:00
- Wrote `packages/client/src/pages/sessions/SessionDetailPage.tsx` (309 lines). Constant audit: 0 matches. Next: extend e2e spec.

### Checkpoint — 00:04:00
- Extended `packages/client/tests/e2e/prog-studio-sessions-2026-05-s2-list-edit-fe.spec.ts` (+118 lines, 185 total). t4b assertions preserved. Constant audit: N/A (test file, no tokens). Next: lint + audits.

## [STAGE 3] COMPLETE
- **At:** 2026-05-20T00:05:00Z
- **Deliverables:**
  | File | Lines | Notes |
  |------|-------|-------|
  | `packages/client/src/pages/sessions/SessionDetailPage.tsx` | 309 | stub → full shell, zero-prop |
  | `packages/client/tests/e2e/prog-studio-sessions-2026-05-s2-list-edit-fe.spec.ts` | 185 | +118 lines, t4b preserved |
  | `.claude/agents/tasks/outputs/prog-studio-sessions-2026-05-s2-list-edit-t5a-detail-shell-FE-1779304665.md` | output packet | written |
- **Lint:** exit 0 (tsc --noEmit all packages)
- **Constant audit:** 0 raw hex, 0 rgba literals, 0 magic numbers duplicated

## [STAGE 1] RECEIVED
- **From:** ORC
- **At:** 2026-05-20T00:00:00Z
- **Task ID:** prog-studio-sessions-2026-05-s2-list-edit-t5a-detail-shell
- **Message received:**
  > You are FE#5 for sprint `prog-studio-sessions-2026-05-s2-list-edit`, task `t5a-detail-shell`. Implement ONLY this task_id's scope.
  > ## Task
  > Replace the t3b SessionDetailPage stub with the full tab-bar shell (tab panels are STUBS in this packet — t5b/t6b fill them). Authoritative packet: read the `t5a-detail-shell` task_packet in `.claude/agents/tasks/outputs/prog-studio-sessions-2026-05-s2-list-edit-PM-rev1-1779304665.md` (~line 673).
  > ## Architecture constraint
  > SessionDetailPage is ZERO-PROP (rendered by SessionsRouter with no props). It reads `const { selectedSessionId, activeTab } = useSessionStore();` and calls `useSessionDetail(selectedSessionId!)` from `useSessions.ts`.
  > ## Deliverables (1 source file + e2e extension)
  > 1. REPLACE `packages/client/src/pages/sessions/SessionDetailPage.tsx` (stub → full shell), zero-prop:
  >    - Header: sprint slug + date.
  >    - Tab bar: `role="tablist"` with one `role="tab"` button per `SESSION_TABS` (from `constants/sessions.ts`). Active tab `aria-selected="true"` (Mako Teal accent token); inactive `aria-selected="false"`. The analyze tab (placeholder:true) → `aria-disabled="true"` + `disabled` + `title="Coming in S3"` + muted token; click is a no-op. Keyboard: Arrow keys move between tabs, Enter/Space activates; each tab button calls `setActiveTab(tab.id)`.
  >    - Below: `role="tabpanel"` switched by activeTab → 'overview' renders a stub div `data-testid="overview-tab-stub"`, 'table' → `data-testid="table-tab-stub"`, 'editor' → `data-testid="editor-tab-stub"`. (t5b/t6b replace these.)
  >    - Loading state (session not yet loaded): skeleton/spinner. Error state: `role="alert"`.
  >    - `data-testid="sessions-detail-page"` on root div.
  > 2. EXTEND the e2e spec `packages/client/tests/e2e/prog-studio-sessions-2026-05-s2-list-edit-fe.spec.ts` (do NOT remove t4b assertions):…[truncated]
