# ui_packet — p6-t2-agent-grouping
agent: FE
task_id: p6-t2-agent-grouping
ts: 2026-05-28T00:20:00Z

## Summary

Implemented client-side agent iteration grouping for the Sessions overview aggregate panel.
AR#0, AR#1, AR#2 now collapse to a single "AR" entry with summed numeric fields.
The per-session detail/Analyze/timeline view is untouched.

## Files Created

- `packages/client/src/utils/group-agents.ts` — pure util exporting `groupAgentsByBaseCode`
- `packages/client/src/utils/__tests__/group-agents.test.ts` — 8 Vitest unit tests
- `packages/client/vitest.config.ts` — minimal vitest config (environment: node, scoped to `src/**/__tests__/**/*.test.ts`)
- `packages/client/tests/e2e/p6-t2-agent-grouping.spec.ts` — Tier-2 e2e spec (3 tests)

## Files Modified

- `packages/client/src/pages/sessions/SessionListPage.tsx` — import + apply `groupAgentsByBaseCode`
- `packages/client/package.json` — added `"vitest": "^4"` devDep + `"test": "vitest run"` script

## SC Verification

- SC1: `ls packages/client/src/utils/group-agents.ts` — PASS
- SC2: `export function groupAgentsByBaseCode` present — PASS
- SC3: `agent_id.split('#')[0]` used — PASS
- SC4: `"vitest": "^4"` in package.json devDependencies — PASS (NOT ^1.x)
- SC5: `environment: 'node'` in vitest.config.ts — PASS
- SC6: `ls packages/client/src/utils/__tests__/group-agents.test.ts` — PASS
- SC7: `npm test -w @gander-studio/client` — 8 tests passed, exit 0 — PASS
- SC8: `grep 'groupAgentsByBaseCode' SessionListPage.tsx` returns 2 lines — PASS
- SC9: `grep 'groupedAgents' SessionListPage.tsx` returns 4 lines — PASS
- SC10: `npm run lint` exits 0 — PASS
- SC11: `ls packages/client/tests/e2e/p6-t2-agent-grouping.spec.ts` — PASS
- SC12: `grep -c '"AR"' e2e spec` = 0, `grep -c "'AR'"` = 0 — PASS
- SC13: `/#\d+/` pattern present in e2e spec — PASS (multiple occurrences)
- SC14: `git diff HEAD -- AgentStatPanel.tsx` empty, `AgentStatTable.tsx` empty — PASS (byte-identical)
- SC15: No Shadcn ui/* imports, no raw hex values — PASS

## Test Results

### Unit Tests
```
npm test -w @gander-studio/client
 RUN  v4.1.7
 Test Files  1 passed (1)
      Tests  8 passed (8)
   Duration  375ms
```

### E2E Tests
```
npx playwright test tests/e2e/p6-t2-agent-grouping.spec.ts
  ✓  aggregate panel shows no per-instance agent_id labels (no #N suffix) (1.2s)
  ✓  aggregate panel card/row count equals distinct base codes from live aggregateStats (1.6s)
  ✓  at least one base code was folded from 2+ instances (grouped count < raw count) (1.6s)
  3 passed (6.2s)
```

### Lint
```
npm run lint — exit 0 (tsc --noEmit across all three packages)
```

## Implementation Notes

### wall_clock_ms Semantics
Mirrors aggregate-stats.ts lines 92-116. Uses `hasDefinedWallClock: Set<string>` to track
base codes that had at least one contributor with a defined wall_clock_ms. The accumulator
uses `?? 0` during summing to avoid NaN, but the final output omits wall_clock_ms entirely
if the Set doesn't contain the base code. This correctly handles all-undefined → undefined
and mixed-defined → sum of defined values only.

### Sort Order
Alphabetical by base code (`localeCompare`) for stable, deterministic rendering.

### Deferred
Instance count badge ("AR ×3") explicitly deferred to a future sprint. Implementing it
would require modifying `AgentStatPanel`'s props interface, which is out of scope.

```xml
<ui_packet>
  <components_created>
    packages/client/src/utils/group-agents.ts (groupAgentsByBaseCode function, 65 lines)
    packages/client/vitest.config.ts (minimal vitest node config, 8 lines)
  </components_created>
  <files_modified>
    packages/client/src/pages/sessions/SessionListPage.tsx (import + groupedAgents derivation, +7 lines)
    packages/client/package.json (vitest ^4 devDep + test script)
    packages/client/src/utils/__tests__/group-agents.test.ts (NEW — 8 unit tests, 110 lines)
    packages/client/tests/e2e/p6-t2-agent-grouping.spec.ts (NEW — 3 e2e tests, 175 lines)
  </files_modified>
  <state_hydration_map>
    No new state. groupAgentsByBaseCode is a pure synchronous transform applied inline
    inside AggregatePanel after useAggregateStats returns stats.agents. The tRPC fetch
    pipeline and Zustand session store are unchanged. groupedAgents is a local const,
    not stored in any Zustand slice.
  </state_hydration_map>
  <a11y_verification>
    No new interactive elements introduced. AgentStatPanel and AgentStatTable retain all
    existing ARIA attributes unchanged (byte-identical guard confirmed). The key prop for
    AgentStatPanel changes from agent_id (e.g. "AR#0") to base code (e.g. "AR") — still
    a unique, stable string. No new ARIA roles, keyboard handlers, or color contrast
    changes required.
  </a11y_verification>
  <design_tokens_used>
    No new styled markup added. The groupedAgents objects are passed to existing components
    (AgentStatPanel, AgentStatTable) which consume existing design tokens (var(--mt),
    var(--fm), var(--sfm), etc.). No raw hex values introduced.
  </design_tokens_used>
  <style_conflict_check>NONE</style_conflict_check>
  <e2e_spec>packages/client/tests/e2e/p6-t2-agent-grouping.spec.ts</e2e_spec>
  <unit_test>
    packages/client/src/utils/__tests__/group-agents.test.ts
    npm test -w @gander-studio/client: 8 tests passed, exit 0
  </unit_test>
  <build>npm run lint: exit 0 (tsc --noEmit across shared/server/client)</build>
  <integration_status>SUCCESS — grouping is pure client-side; server unchanged; no tRPC schema changes; AgentStatPanel/AgentStatTable props unchanged (byte-identical guard confirmed)</integration_status>
</ui_packet>
```
