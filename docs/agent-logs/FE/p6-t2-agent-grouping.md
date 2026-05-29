## [STAGE 2] PLAN
- **At:** 2026-05-28T00:05:00Z
- **Components to build:**
  - `packages/client/src/utils/group-agents.ts` (new pure util, ~45 lines)
  - `packages/client/src/utils/__tests__/group-agents.test.ts` (new vitest unit tests, ~80 lines)
  - `packages/client/vitest.config.ts` (new minimal config, ~7 lines)
  - `packages/client/package.json` (add vitest ^4 devDep + test script)
  - `packages/client/src/pages/sessions/SessionListPage.tsx` (import + use groupedAgents)
  - `packages/client/tests/e2e/p6-t2-agent-grouping.spec.ts` (new Tier-2 e2e spec, ~60 lines)
- **State design:** No new state. Pure client-side mapping before render. `groupedAgents` is a const derived inline in `AggregatePanel`.
- **tRPC wiring:** No change. Consume `useAggregateStats` result (unchanged), just transform before render.
- **A11Y plan:** No new interactive elements introduced. The grouped `AgentStatPanel`/`AgentStatTable` retain all existing ARIA attributes. `key={activity.agent_id}` becomes the base code string (still unique and stable).
- **wall_clock_ms semantics:** Mirror aggregate-stats.ts Set-based approach. Track `hasDefinedWallClock` per base code group using a `Set<string>` of base codes that saw ≥1 defined wall_clock_ms. The group's wall_clock_ms is undefined if the Set doesn't contain the base code; otherwise it's the sum of all defined contributors.
- **Order:** Alphabetical by base code (localeCompare), deterministic for stable rendering.

### Checkpoint — 00:07:00
- Wrote `packages/client/src/utils/group-agents.ts` (65 lines). Constant audit: 0 raw hex matches. Next: write unit tests.

### Checkpoint — 00:10:00
- Wrote `packages/client/src/utils/__tests__/group-agents.test.ts` (110 lines, 8 test cases). Next: vitest config + package.json.

### Checkpoint — 00:12:00
- Wrote `packages/client/vitest.config.ts` (8 lines, environment: node, include scoped to `src/**/__tests__`).
- Modified `packages/client/package.json` (vitest ^4 devDep + test script).
- `npm test -w @gander-studio/client`: 8 tests passed, exit 0. Next: SessionListPage.tsx wiring.

### Checkpoint — 00:14:00
- Modified `packages/client/src/pages/sessions/SessionListPage.tsx` (+1 import line, +groupedAgents derivation, +2 comment lines, panels/table now use groupedAgents). Next: e2e spec.

### Checkpoint — 00:18:00
- Wrote `packages/client/tests/e2e/p6-t2-agent-grouping.spec.ts` (175 lines, 3 tests).
- Fixed SC12: removed "AR" from JSDoc comment.
- `npx playwright test tests/e2e/p6-t2-agent-grouping.spec.ts`: 3 passed (6.2s). Next: final lint + output file.

## [STAGE 3] COMPLETE
- **At:** 2026-05-28T00:20:00Z
- **Deliverables:**
  | File | Lines | Notes |
  |------|-------|-------|
  | `packages/client/src/utils/group-agents.ts` | 65 | new, pure util |
  | `packages/client/src/utils/__tests__/group-agents.test.ts` | 110 | new, 8 vitest unit tests |
  | `packages/client/vitest.config.ts` | 8 | new, environment: node |
  | `packages/client/package.json` | +2 | vitest ^4 devDep + test script |
  | `packages/client/src/pages/sessions/SessionListPage.tsx` | +7 | import + groupedAgents wiring |
  | `packages/client/tests/e2e/p6-t2-agent-grouping.spec.ts` | 175 | new, 3 Tier-2 e2e tests |
  | `.claude/agents/tasks/outputs/p6-t2-agent-grouping-FE-1780012300.md` | primary output |
- **Lint:** exit 0
- **Unit tests:** 8/8 passed
- **E2E:** 3/3 passed (live dev server)
- **Constant audit:** 0 matches in all new/modified files
- **Style conflict check:** NONE
- **AgentStatPanel/AgentStatTable:** byte-identical (git diff empty)

---

## [STAGE 1] RECEIVED
- **From:** ORC
- **At:** 2026-05-28T00:00:00Z
- **Task ID:** p6-t2-agent-grouping
- **Message received:**
  > Implement **p6-t2-agent-grouping**: in the Sessions overview aggregate panel, collapse agent iterations of the same base code (AR#0, AR#1, AR#2 → one "AR" card and one "AR" table row), summing the numeric stat fields. This is DISPLAY-ONLY in the overview — the per-session detail/Analyze/timeline view must keep per-instance agent_ids (do not touch it). Critic-approved (CR#2 CRITIQUE_PASS).
  >
  > Your authoritative spec is the rev1 task packet — read it and follow the p6-t2 packet exactly:
  >   `.claude/agents/tasks/outputs/gander-studio-p6-overview-polish-PM-rev1-1780011957.md`
  > …[truncated]
