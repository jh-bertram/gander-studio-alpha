## [STAGE 1] RECEIVED
- **From:** PM orchestrator (sprint prog-studio-sessions-2026-05-s2-list-edit)
- **At:** 2026-05-20T20:10:00Z
- **Task ID:** prog-studio-sessions-2026-05-s2-list-edit-t2-be-raw
- **Message received:**
  > You are BE#1 for sprint `prog-studio-sessions-2026-05-s2-list-edit`, task `t2-be-raw` (BLOCKER priority).
  > Add a single tRPC query `session.getRaw` that returns the raw markdown of a session's ORIGINAL source file,
  > so the FE editor can pre-fill and revert. The full authoritative packet is in the PM plan at:
  > `.claude/agents/tasks/outputs/prog-studio-sessions-2026-05-s2-list-edit-PM-rev1-1779304665.md`
  > — read the `t2-be-raw` task_packet (starts ~line 162) and follow it exactly.
  > …[truncated]

## [STAGE 2] PLAN
- **At:** 2026-05-20T20:10:30Z
- **Approach:**
  1. Add `SessionRawOutputSchema` (and `SessionRawInputSchema`) exports to `packages/shared/src/schemas.ts`.
  2. Add `session.getRaw` query to `sessionRouter` in `packages/server/src/router.ts`, mirroring `session.get`'s inline readdir scan exactly — no `collectSessions` call.
  3. Run `npm run lint` to confirm tsc --noEmit exits 0 across all three packages.
- **Files to create/modify:**
  - `packages/shared/src/schemas.ts` — add `SessionRawOutputSchema` + `SessionRawInputSchema` exports
  - `packages/server/src/router.ts` — add `getRaw` procedure to sessionRouter; import `SessionRawOutputSchema`
- **Dependencies / assumptions:**
  - `readFile` is already imported (fs/promises) in router.ts.
  - `SessionRawOutputSchema` is imported into router.ts from `@gander-studio/shared` for output validation.
  - File read errors: throw INTERNAL_SERVER_ERROR with `err.message` (per task spec — security pre-flight note: this exposes fs paths, but the spec explicitly requires it; filePath originates from on-disk parseSessionFile, not from client input, so the risk is bounded).
  - The `SessionRawInputSchema` can be inlined or exported — will export from shared for parity.

### Checkpoint — 20:12:00
- Wrote `packages/shared/src/schemas.ts` (+6 lines: SessionRawInputSchema + type + SessionRawOutputSchema + type). Next: add getRaw to router.ts.

### Checkpoint — 20:12:30
- Modified `packages/server/src/router.ts` (+41 lines: import SessionRawOutputSchema, getRaw procedure). Next: run lint.

## [STAGE 3] COMPLETE
- **At:** 2026-05-20T20:13:00Z
- **Deliverables:**
  | File | Lines | Notes |
  |------|-------|-------|
  | `packages/shared/src/schemas.ts` | +6 | SessionRawInputSchema + SessionRawOutputSchema + types |
  | `packages/server/src/router.ts` | +42 | SessionRawOutputSchema import + getRaw procedure |
- **Lint / tests:** `npm run lint` exit 0 (tsc --noEmit across all three packages)
- **Open items:** None
