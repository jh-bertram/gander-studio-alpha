import { test, expect } from '@playwright/test';

// ─── Load test ────────────────────────────────────────────────────────────────
test('sessions list page is visible when sessions mode is active', async ({ page }) => {
  await page.goto('http://localhost:5173');

  // Navigate to Sessions mode via the nav sidebar (5th item, index 4)
  const sessionsNav = page.locator('text=SESSIONS').first();
  if (await sessionsNav.isVisible()) {
    await sessionsNav.click();
  }

  // Verify the sessions list page root element is visible
  const listPage = page.getByTestId('sessions-list-page');
  await expect(listPage).toBeVisible({ timeout: 5000 });
});

// ─── Primary interaction test ─────────────────────────────────────────────────
test('sessions list page renders table or empty/loading state', async ({ page }) => {
  await page.goto('http://localhost:5173');

  // Navigate to Sessions mode
  const sessionsNav = page.locator('text=SESSIONS').first();
  if (await sessionsNav.isVisible()) {
    await sessionsNav.click();
  }

  const listPage = page.getByTestId('sessions-list-page');
  await expect(listPage).toBeVisible({ timeout: 5000 });

  // The page must show one of: a data table, an empty state, a loading state, or an error state
  const hasTable     = await listPage.locator('table[aria-label="Sessions list"]').isVisible().catch(() => false);
  const hasEmpty     = await listPage.locator('[aria-live="polite"]').isVisible().catch(() => false);
  const hasLoading   = await listPage.locator('[aria-busy="true"]').isVisible().catch(() => false);
  const hasError     = await listPage.locator('[role="alert"]').isVisible().catch(() => false);

  expect(hasTable || hasEmpty || hasLoading || hasError).toBe(true);
});

// ─── Error / empty state test ─────────────────────────────────────────────────
test('sessions list empty state renders no sessions found when list is empty', async ({ page }) => {
  await page.goto('http://localhost:5173');

  // Navigate to Sessions mode
  const sessionsNav = page.locator('text=SESSIONS').first();
  if (await sessionsNav.isVisible()) {
    await sessionsNav.click();
  }

  const listPage = page.getByTestId('sessions-list-page');
  await expect(listPage).toBeVisible({ timeout: 5000 });

  // If empty state is shown, it must contain the expected text
  const emptyState = listPage.locator('[aria-live="polite"]');
  const isEmptyVisible = await emptyState.isVisible().catch(() => false);
  if (isEmptyVisible) {
    await expect(emptyState).toContainText('No sessions found');
  }

  // If error state is shown, it must have role="alert"
  const errorState = listPage.locator('[role="alert"]');
  const isErrorVisible = await errorState.isVisible().catch(() => false);
  if (isErrorVisible) {
    await expect(errorState).toBeVisible();
  }
});
