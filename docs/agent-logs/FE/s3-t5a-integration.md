## [STAGE 3] COMPLETE
- **At:** 2026-05-28T02:29:37Z
- **Deliverables:**

| File | Lines | Notes |
|------|-------|-------|
| `packages/client/src/pages/sessions/tabs/AnalyzeTab.tsx` | 216 | CREATED |
| `packages/client/src/constants/sessions.ts` | 12 | MODIFIED — 1 field removed |
| `packages/client/src/pages/sessions/SessionDetailPage.tsx` | 300 | MODIFIED — +2 lines, 0 removed |
| `packages/client/tests/e2e/s3-t5a-integration.spec.ts` | 135 | CREATED — 4 tests |
| `packages/client/tests/e2e/s3-t2-picker-store.spec.ts` | 168 | MODIFIED — 4 guards hardened |
| `packages/client/tests/e2e/s3-t3-timeline.spec.ts` | 129 | MODIFIED — 3 guards hardened |
| `packages/client/tests/e2e/s3-t4-stat-surfaces.spec.ts` | 195 | MODIFIED — not-disabled + analyze-tab assertions added |

- **Lint:** exit 0
- **Constant audit:** 0 raw hex values in AnalyzeTab.tsx; 0 rgba() literals; 0 raw conversion factors
- **Style conflict check:** NONE
- **Output file:** `.claude/agents/tasks/outputs/s3-t5a-integration-FE-1779934740.md`

### Checkpoint — 02:15:00
- Wrote `packages/client/src/pages/sessions/tabs/AnalyzeTab.tsx` (216 lines). Constant audit: 0 matches. Next: modify sessions.ts.

### Checkpoint — 02:17:00
- Modified `packages/client/src/constants/sessions.ts` (1 field removed). Verified git diff. Next: modify SessionDetailPage.tsx.

### Checkpoint — 02:19:00
- Modified `packages/client/src/pages/sessions/SessionDetailPage.tsx` (+2 lines, 0 removed). Verified git diff. Next: write e2e spec.

### Checkpoint — 02:23:00
- Wrote `packages/client/tests/e2e/s3-t5a-integration.spec.ts` (135 lines). 4 tests: SC-tab-wired, SC-contrast, SC-round-trip, SC-loading-intercept. Next: harden t2/t3/t4 guards.

### Checkpoint — 02:27:00
- Modified t2/t3/t4 e2e specs to harden early-return guards. All guards converted to hard `expect()` failures. Lint: exit 0.

## [STAGE 2] PLAN
- **At:** 2026-05-27T00:05:00Z
- **Components to build:**
  1. CREATE `packages/client/src/pages/sessions/tabs/AnalyzeTab.tsx` (~100 lines)
  2. MODIFY `packages/client/src/constants/sessions.ts` (remove `placeholder: true` from analyze entry)
  3. MODIFY `packages/client/src/pages/sessions/SessionDetailPage.tsx` (+1 import +1 render branch)
  4. CREATE `packages/client/tests/e2e/s3-t5a-integration.spec.ts` (SC-tab-wired, SC-round-trip, SC-loading-intercept, SC-contrast)
  5. MODIFY `packages/client/tests/e2e/s3-t2-picker-store.spec.ts` (harden early-return guards)
  6. MODIFY `packages/client/tests/e2e/s3-t3-timeline.spec.ts` (harden early-return guards)
  7. MODIFY `packages/client/tests/e2e/s3-t4-stat-surfaces.spec.ts` (sweep and remove early-return guards)
- **State design:** AnalyzeTab reads analyzeStore (selectedAgentIds, selectedMetrics), calls resetToSession on mount. Calls trpc.session.getStats.useQuery({ id: session.id }). Local state: viewMode ('panel' | 'table') via useState.
- **tRPC wiring:** trpc.session.getStats.useQuery({ id: session.id }) — returns SessionStats. session.events passed as prop from parent (already fetched by SessionDetailPage via useSessionDetail).
- **A11Y plan:** Root div has aria-busy="true" during loading. Error: role="alert". Tab panel: data-testid="analyze-tab". ViewToggle buttons: role="button", keyboard handlers. No Shadcn primitives — plain divs + FF7 tokens.

## [STAGE 1] RECEIVED
- **From:** ORC
- **At:** 2026-05-27T00:00:00Z
- **Task ID:** s3-t5a-integration
- **Message received:**
  > Implement `s3-t5a-integration` per PM rev1: wire the Analyze tab — create `AnalyzeTab.tsx`, flip the placeholder in `sessions.ts`, register the analyze branch in `SessionDetailPage.tsx`. You are FE#4. This is the LAST implementation packet of S3.
  >
  > **Files (3 total, exactly):**
  > 1. **CREATE** `packages/client/src/pages/sessions/tabs/AnalyzeTab.tsx` (~100 lines)
  > 2. **MODIFY** `packages/client/src/constants/sessions.ts` (remove `placeholder: true` from analyze entry)
  > 3. **MODIFY** `packages/client/src/pages/sessions/SessionDetailPage.tsx` (+1 import line +1 render branch line)
  >
  > Hard SCs: 11 criteria including loading state, FF7 tokens, e2e SC-tab-wired, SC-round-trip, SC-loading-intercept, SC-contrast, lint clean. t2/t3/t4 e2e guard hardening also required. Output path: `.claude/agents/tasks/outputs/s3-t5a-integration-FE-1779934740.md`…[truncated]
