## [STAGE 1] RECEIVED
- **From:** ORC (re-dispatch after interruption)
- **At:** 2026-05-25T19:00:00Z
- **Task ID:** prog-studio-sessions-2026-05-s2-list-edit-t6a-editor-hooks
- **Message received:**
  > You are the Frontend Engineer (FE) implementing task t6a-editor-hooks in the Gander Studio S2 sprint. This is a RE-DISPATCH after an interruption — a prior FE run partially completed this task. Read the partial-state note carefully before acting.
  > ## Task: t6a-editor-hooks (data layer only — NO UI component)
  > Implement the two editor hooks that back the Editor tab: `useSessionSave` (save mutation) and `useSessionRaw` (pre-fill query). No React component, no JSX in this packet.
  > ### PARTIAL STATE FROM PRIOR RUN
  > - `packages/client/src/hooks/useSessionSave.ts` ALREADY EXISTS (untracked). On inspection it already matches the spec.
  > - `packages/client/src/hooks/useSessionRaw.ts` is MISSING — you must create it.
  > …[truncated]

## [STAGE 2] PLAN
- **At:** 2026-05-25T19:00:30Z
- **Components to build:**
  - `packages/client/src/hooks/useSessionSave.ts` — VERIFIED EXISTING, matches spec. No changes needed.
  - `packages/client/src/hooks/useSessionRaw.ts` — CREATE: wraps `trpc.session.getRaw.useQuery`, uses `useEffect` keyed on `data` to call `setOriginalContent` and conditionally `setEditBuffer` when buffer is empty (SC6).
- **State design:** Hook reads `editBuffer` from store to check SC6 condition. Writes `originalContent` always, `editBuffer` only when `editBuffer === ''`. No local state. Uses `useEffect` keyed on `data` (not deprecated `onSuccess`).
- **tRPC wiring:** `trpc.session.getRaw.useQuery({ id }, { enabled: !!id })` — returns `{ content: string }` per `SessionRawOutputSchema`.
- **A11Y plan:** N/A — data hooks only, no JSX.
- **Store actions confirmed:**
  - `setOriginalContent(originalContent: string)` — session-store.ts line 16/33
  - `setEditBuffer(editBuffer: string)` — session-store.ts line 15/32
  - `editBuffer: string` state field — session-store.ts line 8

### Checkpoint — 19:00:30
- Verified `useSessionSave.ts` (34 lines). SC7 confirmed: onError does NOT clear editBuffer. SC6 N/A for this file. Next: create `useSessionRaw.ts`.

### Checkpoint — 19:05:00
- Created `packages/client/src/hooks/useSessionRaw.ts` (46 lines). Constant audit: 0 matches. Fixed TS2322 (Error|null → unknown for error return type). Lint: exit 0. Next: write output packet.

## [STAGE 3] COMPLETE
- **At:** 2026-05-25T19:08:00Z
- **Deliverables:**
  | File | Lines | Notes |
  |------|-------|-------|
  | `packages/client/src/hooks/useSessionSave.ts` | 34 | Verified existing — correct, no changes |
  | `packages/client/src/hooks/useSessionRaw.ts` | 46 | Created — useEffect pattern, SC6 guard |
- **Lint:** exit 0 (tsc --noEmit all three packages)
- **Constant audit:** 0 matches (no hex, no inline styles, no JSON.parse, no JSX onClick gaps)
