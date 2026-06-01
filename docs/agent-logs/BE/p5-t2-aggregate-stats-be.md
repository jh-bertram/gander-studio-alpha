## [STAGE 1] RECEIVED
- **From:** ORC (spawning agent)
- **At:** 2026-05-28T00:00:00Z
- **Task ID:** p5-t2-aggregate-stats-be
- **Message received:**
  > Implement task packet p5-t2-aggregate-stats-be for sprint gander-studio-p5-overview-ux: add a session.aggregateStats tRPC procedure that rolls up SessionStats across a list of sessions, plus its input schema and a unit test. Single source of truth is the packet at .claude/agents/tasks/outputs/gander-studio-p5-overview-ux-PM-rev1-1780000200.md…[truncated]

## [STAGE 2] PLAN
- **At:** 2026-05-28T00:01:00Z
- **Approach:**
  1. Add `AggregateStatsInputSchema` + `AggregateStatsInput` export to `packages/shared/src/schemas.ts`
  2. Add `aggregateStats` procedure to sessionRouter in `packages/server/src/router.ts`
     - Uses `collectSessions(SESSIONS_SOURCE_DIRS, AGGREGATE_LIMIT)` with `AGGREGATE_LIMIT = 500`
     - Destructures `{ sessions }` from envelope, filters by input.sessionIds
     - Derives eventsDir per session: `path.join(session.source_root, 'docs', 'events')`
     - Derives sprintSlug: `session.sprint.split(/\s+/)[0]`
     - Calls `computeSessionStats(session, events)` per session
     - Sums flat `total_*` fields, sums `event_count`, sums `wall_clock_ms` (skip undefined)
     - Merges agents by `agent_id` summing all numeric fields including `wall_clock_ms`
     - Constructs FLAT result matching `SessionStatsSchema` exactly
     - Validates with `SessionStatsSchema.parse(result)`
  3. Write unit test at `packages/server/src/parsers/__tests__/aggregate-stats.test.ts`
     - Two fixture SessionStats objects with specific numeric values
     - Extracts aggregation logic (pure function, no tRPC) for testability
     - Asserts per-field numeric sums, SessionStatsSchema.parse passes
  4. Extract aggregation helper into `packages/server/src/parsers/aggregate-stats.ts` for DRY (used by both router and test)
  5. Run `npm run lint` and `npm test` in packages/server
- **Files to create/modify:**
  - `packages/shared/src/schemas.ts` → add AggregateStatsInputSchema
  - `packages/server/src/parsers/aggregate-stats.ts` → NEW: pure aggregation helper
  - `packages/server/src/router.ts` → add aggregateStats procedure importing the helper
  - `packages/server/src/parsers/__tests__/aggregate-stats.test.ts` → NEW: unit test
### Checkpoint — 14:42:00
- Wrote `packages/shared/src/schemas.ts` (added 5 lines). Next: create aggregate-stats.ts helper.

### Checkpoint — 14:42:10
- Wrote `packages/server/src/parsers/aggregate-stats.ts` (125 lines). Next: update router.ts.

### Checkpoint — 14:42:20
- Updated `packages/server/src/router.ts` (added ~35 lines). Next: write unit test.

### Checkpoint — 14:42:30
- Wrote `packages/server/src/parsers/__tests__/aggregate-stats.test.ts` (165 lines). Next: run lint + tests.

- **Dependencies / assumptions:**
  - `SessionStatsSchema` is FLAT (verified: schemas.ts:108-121)
  - `collectSessions` signature: `(sourceDirs: string[], limit: number): Promise<{ sessions, skipped }>` (verified: session-list.ts:20-23)
  - `parseEventLogFiles` first arg is eventsDir string (verified: event-log-parser.ts:14)
  - `computeSessionStats` already validates with SessionStatsSchema.parse internally
  - Test framework is vitest (verified: packages/server/package.json)

## [STAGE 3] COMPLETE
- **At:** 2026-05-28T14:43:00Z
- **Deliverables:**

| File | Lines | Notes |
|------|-------|-------|
| `packages/shared/src/schemas.ts` | +5 | AggregateStatsInputSchema + AggregateStatsInput type |
| `packages/server/src/parsers/aggregate-stats.ts` | 125 | NEW: pure aggregation helper |
| `packages/server/src/router.ts` | +37 | aggregateStats procedure + AGGREGATE_LIMIT constant + imports |
| `packages/server/src/parsers/__tests__/aggregate-stats.test.ts` | 165 | NEW: 16 test cases asserting numeric values + schema parse |

- **Lint / tests:** `npm run lint` exit 0. `npm test --workspace packages/server`: 53/53 tests pass (5 test files).
- **Open items:** None. SC1-SC11 all verified.
