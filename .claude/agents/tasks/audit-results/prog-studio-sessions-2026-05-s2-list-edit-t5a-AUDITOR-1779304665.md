# Audit Result — t5a-detail-shell (AUDITOR#6)

task_id: prog-studio-sessions-2026-05-s2-list-edit-t5a
verdict: **FAIL (QA)** — stop at first failure per ordered sequence (SA→QA→SX).

## audit_review (SA)
```xml
<audit_review>
  <target_file>packages/client/src/pages/sessions/SessionDetailPage.tsx</target_file>
  <status>PASS</status>
  <violations/>
</audit_review>
<audit_review>
  <target_file>packages/client/tests/e2e/prog-studio-sessions-2026-05-s2-list-edit-fe.spec.ts</target_file>
  <status>PASS</status>
  <violations/>
</audit_review>
```
SA notes (all confirmed):
- ZERO-PROP: `export default function SessionDetailPage()` takes no props; consumer `SessionsRouter.tsx:11` renders `<SessionDetailPage />`. Reads `selectedSessionId`/`activeTab` from `useSessionStore()`, calls `useSessionDetail(selectedSessionId!)`. CONFIRMED.
- No Shadcn tabs/tooltip/toast imports. Only React, SESSION_TABS, useSessionDetail, useSessionStore.
- No raw hex anywhere — all colors `var(--*)`. No `any`. TS strict; lint exit 0.
- Session type via `z.infer<typeof SessionSchema>` (shared); `sprint`/`date` fields exist in schema; no local redefinition.
- a11y: `role="tablist"` (aria-label) → `role="tab"` (id, aria-selected, aria-controls, roving tabIndex 0/-1) → `role="tabpanel"` (id, aria-labelledby). Analyze tab: `aria-disabled="true"` + `disabled` + `title="Coming in S3"`. Arrow-key nav + Enter/Space handled; back button has aria-label + onKeyDown. Loading `aria-busy`, error `role="alert"`.
- Scope clean: git diff HEAD touches ONLY the two named files (+426/-1). No collateral edits.

## test_report (QA)
```xml
<test_report>
  <task_id>prog-studio-sessions-2026-05-s2-list-edit-t5a</task_id>
  <status>FAIL</status>
  <test_coverage>e2e [6 passed, 1 failed]; lint exit 0</test_coverage>
  <playwright>
    <tier>2</tier>
    <tests_run>7</tests_run>
    <passed>6</passed>
    <failed>1</failed>
    <playwright_output>
[4/7] overview and table tabs render correct panel stubs
  1) ...:66:1 › overview and table tabs render correct panel stubs
    Error: expect(locator).toBeVisible() failed
    Locator:  getByTestId('overview-tab-stub')
    Expected: visible   Received: hidden   Timeout: 3000ms
    7 × locator resolved to <div data-testid="overview-tab-stub"></div> - unexpected value "hidden"
      > 88 | await expect(page.getByTestId('overview-tab-stub')).toBeVisible({ timeout: 3000 });
  1 failed / 6 passed (14.4s)
    </playwright_output>
  </playwright>
  <defects>
    <bug>
      <description>Test 4 asserts toBeVisible() on the Overview/Table stub divs, but the stubs are intentionally-empty placeholders (`<div data-testid="overview-tab-stub" />`). An empty div has a zero-size box, so Playwright correctly reports it "hidden" — the element IS attached (page snapshot shows tabpanel "Overview" rendered) but has no visible box. The component and the assertion were authored in the same task and are mutually incompatible as written. Tab switching, the no-remount DOM-identity check, the Analyze-disabled assertions, and row-click→detail all PASS — only the visibility assertion on the empty stub fails.</description>
      <steps_to_reproduce>cd packages/client && npx playwright test prog-studio-sessions-2026-05-s2-list-edit-fe.spec.ts (reuses running server). Test at line 66 fails at line 88.</steps_to_reproduce>
      <severity>BLOCKER</severity>
    </bug>
  </defects>
</test_report>
```
lint: `npm run lint` → `tsc --noEmit` for shared/server/client → **LINT_EXIT=0** (quoted).

## security_audit (SX)
```xml
<security_audit>
  <status>NOT_REACHED</status>
  <threat_level>LOW</threat_level>
  <findings/>
</security_audit>
```
SX not formally run — stop at first FAIL. On read: no new dependency, no secrets, no dynamic code, no dangerouslySetInnerHTML; server data (`session.sprint`, `session.date`, error message) rendered as escaped JSX text. No concerns observed.

## remediation_request
Single fix — choose ONE:
- **Preferred (spec-side, placeholders are empty by design per task → t5b/t6b fill them):**
  `packages/client/tests/e2e/prog-studio-sessions-2026-05-s2-list-edit-fe.spec.ts:88` change
  `await expect(page.getByTestId('overview-tab-stub')).toBeVisible({ timeout: 3000 });`
  → `await expect(page.getByTestId('overview-tab-stub')).toBeAttached({ timeout: 3000 });`
  and line 92 `table-tab-stub` `toBeVisible` → `toBeAttached`.
- **Alt (component-side):** give the stub divs a non-zero box, e.g. in `SessionDetailPage.tsx:104/108/112` add `style={{ minHeight: 1 }}` to each stub. (Less clean — pollutes placeholders that t5b/t6b replace.)

Re-run the spec after the fix; on green, re-audit resumes SX then PASS.
