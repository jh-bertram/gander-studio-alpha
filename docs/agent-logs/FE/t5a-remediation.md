## [STAGE 2] PLAN
- **At:** 2026-05-20T00:01:00Z
- **Components to build:** None — spec-only edit
- **State design:** N/A
- **tRPC wiring:** N/A
- **A11Y plan:** N/A — no component changes
- **Fix:** Change `.toBeVisible()` to `.toBeAttached()` on lines 88 and 92 of the e2e spec

### Checkpoint — 00:01:30
- Edited `packages/client/tests/e2e/prog-studio-sessions-2026-05-s2-list-edit-fe.spec.ts` (2 lines changed). Constant audit: 0 matches (no new code). Next: run lint + playwright.

## [STAGE 3] COMPLETE
- **At:** 2026-05-20T00:02:00Z
- **Deliverables:**
  | File | Lines changed | Notes |
  |------|--------------|-------|
  | `packages/client/tests/e2e/prog-studio-sessions-2026-05-s2-list-edit-fe.spec.ts` | 2 | `.toBeVisible()` → `.toBeAttached()` on lines 88 and 92 |
- **Lint:** exit code 0
- **Constant audit:** 0 matches (spec file only, no new source code)
- **Playwright:** Target test (line 66) PASS. Pre-existing failure on test 2 (line 19) is out of scope of AU#6.

## [STAGE 1] RECEIVED
- **From:** ORC (AU#6 QA FAIL remediation dispatch)
- **At:** 2026-05-20T00:00:00Z
- **Task ID:** t5a-remediation (prog-studio-sessions-2026-05-s2-list-edit)
- **Message received:**
  > You are FE#5b, a targeted remediation for task `t5a-detail-shell` (sprint prog-studio-sessions-2026-05-s2-list-edit) after a QA audit FAIL. Apply EXACTLY ONE fix — nothing else.
  > 
  > ## The audit finding (AU#6, QA FAIL)
  > In `packages/client/tests/e2e/prog-studio-sessions-2026-05-s2-list-edit-fe.spec.ts`, the test "overview and table tabs render correct panel stubs" fails: it asserts `toBeVisible()` on `data-testid="overview-tab-stub"` (and `table-tab-stub`), but those stub divs are intentionally EMPTY in t5a (they get real, visible content in t5b). An empty div has a zero-size box, so `toBeVisible()` reports hidden.
  > 
  > ## The fix (spec-side, the auditor's preferred option)
  > In that spec file, for the two stub assertions on `overview-tab-stub` and `table-tab-stub` (around lines 88 and 92), change `.toBeVisible()` to `.toBeAttached()`. This correctly asserts the panel stub is rendered/attached without requiring a visible box. Do NOT change any other assertion…[truncated]
