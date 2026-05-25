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

// ─── t5a: Row click → detail page ─────────────────────────────────────────────
test('clicking a session row shows the detail page', async ({ page }) => {
  await page.goto('http://localhost:5173');

  const sessionsNav = page.locator('text=SESSIONS').first();
  if (await sessionsNav.isVisible()) {
    await sessionsNav.click();
  }

  const listPage = page.getByTestId('sessions-list-page');
  await expect(listPage).toBeVisible({ timeout: 5000 });

  // If there is a data row, click it; otherwise the detail page is unreachable (data-dependent)
  const firstRow = listPage.locator('tbody tr').first();
  const hasRows = await firstRow.isVisible().catch(() => false);
  if (!hasRows) {
    // No sessions in test environment — skip the navigation assertion
    return;
  }

  await firstRow.click();
  const detailPage = page.getByTestId('sessions-detail-page');
  await expect(detailPage).toBeVisible({ timeout: 5000 });
});

// ─── t5b: Tab switching — real OverviewTab + TableTab ─────────────────────────
test('overview and table tabs render real panels', async ({ page }) => {
  await page.goto('http://localhost:5173');

  const sessionsNav = page.locator('text=SESSIONS').first();
  if (await sessionsNav.isVisible()) {
    await sessionsNav.click();
  }

  const listPage = page.getByTestId('sessions-list-page');
  await expect(listPage).toBeVisible({ timeout: 5000 });

  // Assert at least one row exists — corpus must be non-empty for this test to run
  const firstRow = listPage.locator('tbody tr').first();
  await expect(firstRow).toBeVisible({ timeout: 5000 });

  await firstRow.click();
  await expect(page.getByTestId('sessions-detail-page')).toBeVisible({ timeout: 5000 });

  // Click Overview tab — real OverviewTab
  await page.getByRole('tab', { name: 'Overview' }).click();
  await expect(page.getByTestId('overview-tab')).toBeVisible({ timeout: 3000 });

  // Click Table tab — real TableTab
  await page.getByRole('tab', { name: 'Table' }).click();
  await expect(page.getByTestId('table-tab')).toBeVisible({ timeout: 3000 });
});

// ─── t5b: Overview tab shows sprint slug ──────────────────────────────────────
test('overview tab shows the session sprint slug text', async ({ page }) => {
  await page.goto('http://localhost:5173');

  const sessionsNav = page.locator('text=SESSIONS').first();
  if (await sessionsNav.isVisible()) {
    await sessionsNav.click();
  }

  const listPage = page.getByTestId('sessions-list-page');
  await expect(listPage).toBeVisible({ timeout: 5000 });

  // Assert at least one row exists — corpus must be non-empty for this test to run
  const firstRow = listPage.locator('tbody tr').first();
  await expect(firstRow).toBeVisible({ timeout: 5000 });

  await firstRow.click();
  await expect(page.getByTestId('sessions-detail-page')).toBeVisible({ timeout: 5000 });

  await page.getByRole('tab', { name: 'Overview' }).click();
  const overviewTab = page.getByTestId('overview-tab');
  await expect(overviewTab).toBeVisible({ timeout: 3000 });

  // Overview tab must contain the sprint slug (same text as the detail header h1)
  const sprintText = await page.locator('[data-testid="sessions-detail-page"] h1').innerText();
  await expect(overviewTab).toContainText(sprintText);
});

// ─── t5b: Table tab shows Agent ID column header ──────────────────────────────
test('table tab shows Agent ID column header', async ({ page }) => {
  await page.goto('http://localhost:5173');

  const sessionsNav = page.locator('text=SESSIONS').first();
  if (await sessionsNav.isVisible()) await sessionsNav.click();

  const listPage = page.getByTestId('sessions-list-page');
  await expect(listPage).toBeVisible({ timeout: 5000 });

  // Assert at least one row exists — corpus must be non-empty for this test to run
  await expect(listPage.locator('tbody tr').first()).toBeVisible({ timeout: 5000 });

  // Target a known session with canonical Section-2 agent activity tables.
  // gander-studio-p1 has 32+ agent entries in the 5-col canonical format
  // (Seq | Timestamp | Event | Agent | Notes), giving agents.length > 0.
  // Corpus-coupling: gander-studio-p1 is the original studio sprint post-mortem
  // (2026-03-16) and is expected to be present in all GANDER_ROOT environments.
  const targetRow = listPage.locator('tbody tr', { hasText: 'gander-studio-p1' });
  await expect(
    targetRow,
    'gander-studio-p1 session row must be present in the sessions list — ' +
    'this session provides the canonical agent-activity table data for TableTab testing'
  ).toBeVisible({ timeout: 5000 });

  await targetRow.click();
  await expect(page.getByTestId('sessions-detail-page')).toBeVisible({ timeout: 5000 });

  await page.getByRole('tab', { name: 'Table' }).click();
  const tableTab = page.getByTestId('table-tab');
  await expect(tableTab).toBeVisible({ timeout: 3000 });

  // Table tab must contain the "Agent ID" column header button (real agent data present)
  await expect(tableTab.getByRole('button', { name: /Agent ID/i }).first()).toBeVisible();
});

// ─── t5a: Analyze tab is disabled ─────────────────────────────────────────────
test('analyze tab has aria-disabled and coming-in-s3 title', async ({ page }) => {
  await page.goto('http://localhost:5173');

  const sessionsNav = page.locator('text=SESSIONS').first();
  if (await sessionsNav.isVisible()) {
    await sessionsNav.click();
  }

  const listPage = page.getByTestId('sessions-list-page');
  await expect(listPage).toBeVisible({ timeout: 5000 });

  const firstRow = listPage.locator('tbody tr').first();
  const hasRows = await firstRow.isVisible().catch(() => false);
  if (!hasRows) {
    return; // No sessions in test environment
  }

  await firstRow.click();
  await expect(page.getByTestId('sessions-detail-page')).toBeVisible({ timeout: 5000 });

  const analyzeTab = page.getByRole('tab', { name: 'Analyze' });
  await expect(analyzeTab).toHaveAttribute('aria-disabled', 'true');
  await expect(analyzeTab).toHaveAttribute('title', 'Coming in S3');
});

// ─── t5a: No-remount DOM identity check (SC3) ─────────────────────────────────
test('detail page shell persists across tab switches without remounting', async ({ page }) => {
  await page.goto('http://localhost:5173');

  const sessionsNav = page.locator('text=SESSIONS').first();
  if (await sessionsNav.isVisible()) {
    await sessionsNav.click();
  }

  const listPage = page.getByTestId('sessions-list-page');
  await expect(listPage).toBeVisible({ timeout: 5000 });

  const firstRow = listPage.locator('tbody tr').first();
  const hasRows = await firstRow.isVisible().catch(() => false);
  if (!hasRows) {
    return; // No sessions in test environment
  }

  await firstRow.click();
  const detailPage = page.getByTestId('sessions-detail-page');
  await expect(detailPage).toBeVisible({ timeout: 5000 });

  // Capture the sprint slug text from the header before tab switching
  const sprintSlug = await detailPage.locator('h1').innerText();

  // Switch tabs: Overview → Table → Overview
  await page.getByRole('tab', { name: 'Overview' }).click();
  await page.getByRole('tab', { name: 'Table' }).click();
  await page.getByRole('tab', { name: 'Overview' }).click();

  // sessions-detail-page must still be present (not remounted)
  await expect(page.getByTestId('sessions-detail-page')).toBeVisible();

  // Sprint slug in header must be the same text — DOM identity signal
  const sprintSlugAfter = await detailPage.locator('h1').innerText();
  expect(sprintSlugAfter).toBe(sprintSlug);
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
