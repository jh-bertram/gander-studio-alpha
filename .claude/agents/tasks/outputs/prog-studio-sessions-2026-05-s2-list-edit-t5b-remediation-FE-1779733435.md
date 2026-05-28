# FE Remediation Output — prog-studio-sessions-2026-05-s2-list-edit-t5b-tabs-overview-table

**Attempt:** 2 (remediation of QA FAIL)
**Agent:** FE (remediation dispatch)
**Completed:** 2026-05-25T18:43:06Z

## Summary

Spec-only fix for QA FAIL: `'table tab shows Agent ID column header'` was clicking `tbody tr:first()` which opened `gander-p7-obsidian-l2-l3` (agents.length === 0). TableTab correctly rendered its empty-state branch, so the Agent ID sort button never existed.

## Changes Made

**File modified:** `packages/client/tests/e2e/prog-studio-sessions-2026-05-s2-list-edit-fe.spec.ts`

### Primary fix (blocking QA gate)

Replaced `.first()` row click with a targeted row click on the stable session `gander-studio-p1`. This session has 32+ agents in canonical Section-2 `| Seq | Timestamp | Event | Agent | Notes |` format, giving `agents.length > 0` and triggering the column-header table branch in TableTab.

The test now:
1. Navigates to sessions list
2. Asserts at least one row is visible (explicit precondition — fails loudly if corpus empty)
3. Locates the row with text 'gander-studio-p1' with a descriptive error message explaining the corpus coupling
4. Clicks that row, navigates to detail, clicks Table tab
5. Asserts `Agent ID` sort button is visible (real `toBeVisible`, not vacuous)

Corpus-coupling note in code: gander-studio-p1 is the original studio sprint post-mortem (2026-03-16), stable across all GANDER_ROOT environments.

### Secondary fix (vacuous-pass guard hardening)

Three t5b tests had `if (!hasRows) return;` silent-skip guards. Converted to explicit `await expect(firstRow).toBeVisible({ timeout: 5000 })` assertions. These now fail loudly if the corpus is empty instead of silently passing.

Tests affected:
- `'overview and table tabs render real panels'` (line 78-79)
- `'overview tab shows the session sprint slug text'` (line 105-107)
- `'table tab shows Agent ID column header'` (line 133-135)

**No components modified** — OverviewTab.tsx, TableTab.tsx, SessionDetailPage.tsx untouched.

## Test Run Results

### Target test — 'table tab shows Agent ID column header' with --repeat-each=2

```
Running 2 tests using 2 workers
  ✓  1 table tab shows Agent ID column header (4.7s)
  ✓  2 table tab shows Agent ID column header (4.9s)
2 passed (13.4s)
```

**Deterministic: 2/2 PASS.**

### All t5b tests with --repeat-each=2 (5 tests x 2 repeats = 10 total)

```
Running 10 tests using 2 workers
  ✓  overview and table tabs render real panels (5.6s)
  ✓  overview and table tabs render real panels (6.7s)
  ✓  overview tab shows the session sprint slug text (5.4s)
  ✓  overview tab shows the session sprint slug text (4.7s)
  ✓  table tab shows Agent ID column header (2.7s)
  ✓  table tab shows Agent ID column header (2.9s)
  ✓  analyze tab has aria-disabled and coming-in-s3 title (2.3s)
  ✓  analyze tab has aria-disabled and coming-in-s3 title (2.2s)
  ✓  detail page shell persists across tab switches without remounting (2.7s)
  ✓  detail page shell persists across tab switches without remounting (2.5s)
10 passed (23.1s)
```

### Full spec (9 tests)

8 passed / 1 failed (the pre-existing flaky line-19 test — confirmed pre-existing per audit report; flaky due to async tRPC data-load race on cold first paint; not introduced by t5b; tracked separately for sprint owner).

The line-19 failure reproduces intermittently across re-runs (fails ~50% of the time). On re-run it passes 9/9. This is identical to the behavior the auditor described: "PASSED 2/2 on re-run".

## Lint

```
tsc --noEmit (shared + server + client): exit 0
```

## Constant Audit

- Raw hex in modified file: 0 matches
- Inline `style="..."` conflicts: 0 matches
- `JSON.parse` in modified file: 0 matches

## ui_packet

```xml
<ui_packet>
  <components_created>none — spec-only change</components_created>
  <state_hydration_map>N/A — no component changes</state_hydration_map>
  <a11y_verification>N/A — no component changes; spec does not affect ARIA structure</a11y_verification>
  <design_tokens_used>N/A — spec file only</design_tokens_used>
  <style_conflict_check>NONE</style_conflict_check>
  <integration_status>SUCCESS — 'table tab shows Agent ID column header' passes 2/2 on --repeat-each=2. All t5b tests pass 10/10. Line-19 pre-existing flaky test unchanged and excluded from t5b scope per audit report.</integration_status>
  <e2e_spec>packages/client/tests/e2e/prog-studio-sessions-2026-05-s2-list-edit-fe.spec.ts (modified — no new file created)</e2e_spec>
</ui_packet>
```
