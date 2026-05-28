# t4b Completion Packet — BE

## Summary
Appended `sessionRouter` (4 procedures) and supporting infrastructure to `packages/server/src/router.ts`. Created the `collectSessions` exported helper in `session-list.ts` (SC7 multi-root testability). Created multi-root test in `session-list.test.ts`. All existing procedures untouched.

## Files Modified
- `packages/server/src/router.ts` — extended import line (env + shared schemas + 4 parser imports); appended sessionRouter and `session: sessionRouter` in appRouter. 0 existing procedure lines removed.

## Files Created
- `packages/server/src/session-list.ts` — exported `collectSessions(sourceDirs, limit)` helper
- `packages/server/src/parsers/__tests__/session-list.test.ts` — 3 tests including SC7 multi-root test

## Test Results
- `tsc --noEmit` (all 3 packages): 0 errors
- `npm test -w @gander-studio/server`: 30/30 passed (27 pre-existing + 3 new)

## WARNING-2 Acknowledgement
session.list → `{ sessions: Session[], skipped: number }` (envelope)
session.get → bare `Session` object
session.getStats → bare `SessionStats` object

This asymmetry is intentional and documented in a code comment above `sessionRouter`. The FE must not expect an envelope from get/getStats.
