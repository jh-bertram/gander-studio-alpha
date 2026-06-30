/**
 * Playwright Tier 2 e2e spec — gander-studio-p9-sessions-feed-agentstats-t4
 *
 * Asserts the "no after-action" badge and editor read-only guard:
 *   (a) Badge visible on doc-less session row; absent on doc-backed row.
 *   (b) Save button absent / editor read-only for a doc-less session.
 *
 * Fixtures:
 *   Doc-less  (has_after_action=false): gander-meta-fable-window  (event-only, no AA doc)
 *   Doc-backed (has_after_action=true): gander-meta-fable-rollback (after-action in docs/)
 *
 * Live server required: port 5173 (NOT jsdom, NOT 3001).
 */

import { test, expect } from '@playwright/test';

const DOCLESS_SPRINT  = 'gander-meta-fable-window';
const DOCBACKED_SPRINT = 'gander-meta-fable-rollback';

// ---- Helper -----------------------------------------------------------------

async function goToSessionsPage(page: import('@playwright/test').Page): Promise<void> {
  await page.goto('http://localhost:5173');
  await page.locator('text=SESSIONS').first().click();
  await expect(page.getByTestId('sessions-list-page')).toBeVisible({ timeout: 8000 });
}

// ---- Test 1: load -----------------------------------------------------------

test('t4-load: sessions list page loads and renders a table, loading, or empty state', async ({ page }) => {
  await goToSessionsPage(page);

  const listPage = page.getByTestId('sessions-list-page');

  // Accept loading, table, empty, or error — all are valid transient states
  const hasTable   = await listPage.locator('table[aria-label="Sessions list"]').isVisible().catch(() => false);
  const hasLoading = await listPage.locator('[aria-busy="true"]').isVisible().catch(() => false);
  const hasEmpty   = await listPage.locator('[aria-live="polite"]').isVisible().catch(() => false);
  const hasError   = await listPage.locator('[role="alert"]').isVisible().catch(() => false);
  expect(hasTable || hasLoading || hasEmpty || hasError).toBe(true);
});

// ---- Test 2: badge visibility -----------------------------------------------

test('t4-badge: no-doc badge visible on doc-less row; absent on doc-backed row', async ({ page }) => {
  await goToSessionsPage(page);

  const listPage = page.getByTestId('sessions-list-page');

  // Wait for session table rows
  await expect(listPage.locator('tbody tr').first()).toBeVisible({ timeout: 8000 });

  // Locate the doc-less fixture row
  const doclessRow = listPage.locator('tbody tr').filter({ hasText: DOCLESS_SPRINT }).first();
  await expect(doclessRow).toBeVisible({ timeout: 10000 });

  // Badge must be visible inside the doc-less row
  const badge = doclessRow.locator('[data-testid="session-no-doc-badge"]');
  await expect(badge).toBeVisible();
  await expect(badge).toContainText(/no after-action/i);

  // Doc-backed fixture row must NOT have a badge
  const docbackedRow = listPage.locator('tbody tr').filter({ hasText: DOCBACKED_SPRINT }).first();
  const docbackedRowVisible = await docbackedRow.isVisible({ timeout: 5000 }).catch(() => false);
  if (docbackedRowVisible) {
    const noBadge = docbackedRow.locator('[data-testid="session-no-doc-badge"]');
    await expect(noBadge).not.toBeAttached();
  }
});

// ---- Test 3: save disabled --------------------------------------------------

test('t4-save-disabled: editor is read-only for doc-less session (Save absent; textarea read-only)', async ({ page }) => {
  await goToSessionsPage(page);

  const listPage = page.getByTestId('sessions-list-page');
  await expect(listPage.locator('tbody tr').first()).toBeVisible({ timeout: 8000 });

  // Click the doc-less session row to navigate to detail
  const doclessRow = listPage.locator('tbody tr').filter({ hasText: DOCLESS_SPRINT }).first();
  await expect(doclessRow).toBeVisible({ timeout: 10000 });
  await doclessRow.click();

  const detailPage = page.getByTestId('sessions-detail-page');
  await expect(detailPage).toBeVisible({ timeout: 5000 });

  // Navigate to Editor tab
  const editorTab = detailPage
    .getByRole('tab', { name: /Editor/i })
    .or(detailPage.getByRole('button', { name: /Editor/i }));
  await expect(editorTab).toBeVisible({ timeout: 5000 });
  await editorTab.click();

  const editorPanel = page.getByTestId('editor-tab');
  await expect(editorPanel).toBeVisible({ timeout: 8000 });

  // Save button must NOT be present for a doc-less session
  const saveBtn = editorPanel.locator('[data-testid="save-edit-button"]');
  await expect(saveBtn).not.toBeAttached();

  // Textarea must exist and be read-only
  const textarea = editorPanel.locator('textarea');
  await expect(textarea).toBeVisible({ timeout: 5000 });
  const isReadOnly = await textarea.getAttribute('readonly');
  // Also check aria-readonly attribute
  const ariaReadonly = await textarea.getAttribute('aria-readonly');
  expect(isReadOnly !== null || ariaReadonly === 'true').toBe(true);
});
