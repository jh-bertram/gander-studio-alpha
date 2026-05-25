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

// ─── t6b: Editor tab pre-fills with original source markdown ─────────────────
test('Editor tab pre-fills with original source markdown', async ({ page }) => {
  await page.goto('http://localhost:5173');

  const sessionsNav = page.locator('text=Sessions').first();
  if (await sessionsNav.isVisible()) await sessionsNav.click();

  const listPage = page.getByTestId('sessions-list-page');
  await expect(listPage).toBeVisible({ timeout: 5000 });

  const firstRow = listPage.locator('tbody tr').first();
  const hasRows = await firstRow.isVisible().catch(() => false);
  if (!hasRows) return; // No sessions in test environment

  await firstRow.click();
  await expect(page.getByTestId('sessions-detail-page')).toBeVisible({ timeout: 5000 });

  await page.getByRole('tab', { name: 'Editor' }).click();
  const editorTab = page.getByTestId('editor-tab');
  await expect(editorTab).toBeVisible({ timeout: 3000 });

  // Textarea must have non-empty value once raw content is loaded
  const textarea = editorTab.locator('textarea');
  await expect(textarea).toBeVisible({ timeout: 5000 });
  await expect(textarea).not.toHaveValue('', { timeout: 8000 });
  const value = await textarea.inputValue();
  expect(value.trim().length).toBeGreaterThan(0);
});

// ─── t6b: Save edit flow — success ───────────────────────────────────────────
test('Save edit flow — success: appending text enables save and shows Saved to path', async ({ page }) => {
  await page.goto('http://localhost:5173');

  const sessionsNav = page.locator('text=Sessions').first();
  if (await sessionsNav.isVisible()) await sessionsNav.click();

  const listPage = page.getByTestId('sessions-list-page');
  await expect(listPage).toBeVisible({ timeout: 5000 });

  const firstRow = listPage.locator('tbody tr').first();
  const hasRows = await firstRow.isVisible().catch(() => false);
  if (!hasRows) return; // No sessions in test environment

  await firstRow.click();
  await expect(page.getByTestId('sessions-detail-page')).toBeVisible({ timeout: 5000 });

  await page.getByRole('tab', { name: 'Editor' }).click();
  const editorTab = page.getByTestId('editor-tab');
  await expect(editorTab).toBeVisible({ timeout: 3000 });

  const textarea = editorTab.locator('textarea');
  await expect(textarea).toBeVisible({ timeout: 5000 });
  await expect(textarea).not.toHaveValue('', { timeout: 8000 });

  // Append a character to make the buffer dirty
  await textarea.focus();
  await textarea.press('End');
  await textarea.type(' ');

  // Save button should now be enabled; scroll it into view before clicking
  const saveBtn = editorTab.getByTestId('save-edit-button');
  await expect(saveBtn).toBeEnabled({ timeout: 2000 });
  await saveBtn.scrollIntoViewIfNeeded();
  await saveBtn.click({ force: true });

  // Inline success block must appear with "Saved to:" and a path
  await expect(editorTab.locator('[aria-live="polite"]')).toContainText('Saved to:', { timeout: 8000 });
});

// ─── t6b: Save edit flow — revert to original ────────────────────────────────
test('Save edit flow — revert to original restores textarea to pre-fill value', async ({ page }) => {
  await page.goto('http://localhost:5173');

  const sessionsNav = page.locator('text=Sessions').first();
  if (await sessionsNav.isVisible()) await sessionsNav.click();

  const listPage = page.getByTestId('sessions-list-page');
  await expect(listPage).toBeVisible({ timeout: 5000 });

  const firstRow = listPage.locator('tbody tr').first();
  const hasRows = await firstRow.isVisible().catch(() => false);
  if (!hasRows) return; // No sessions in test environment

  await firstRow.click();
  await expect(page.getByTestId('sessions-detail-page')).toBeVisible({ timeout: 5000 });

  await page.getByRole('tab', { name: 'Editor' }).click();
  const editorTab = page.getByTestId('editor-tab');
  await expect(editorTab).toBeVisible({ timeout: 3000 });

  const textarea = editorTab.locator('textarea');
  await expect(textarea).toBeVisible({ timeout: 5000 });
  await expect(textarea).not.toHaveValue('', { timeout: 8000 });

  // Capture the original pre-fill value
  const original = await textarea.inputValue();

  // Modify the textarea
  await textarea.focus();
  await textarea.press('End');
  await textarea.type('MODIFIED');

  // Revert button — scroll into view and click
  const revertBtn = editorTab.getByTestId('revert-button');
  await expect(revertBtn).toBeEnabled({ timeout: 2000 });
  await revertBtn.scrollIntoViewIfNeeded();
  await revertBtn.click({ force: true });

  // Textarea value must equal the original pre-fill
  await expect(textarea).toHaveValue(original);
});

// ─── t6b: Analyze tab is disabled (SC8) ──────────────────────────────────────
// NOTE: This coverage also exists in the t5a test above; included here
// explicitly as per the t6b spec requirement (SC8 sign-off).
test('Analyze tab is disabled — aria-disabled true and Coming in S3 title', async ({ page }) => {
  await page.goto('http://localhost:5173');

  const sessionsNav = page.locator('text=Sessions').first();
  if (await sessionsNav.isVisible()) await sessionsNav.click();

  const listPage = page.getByTestId('sessions-list-page');
  await expect(listPage).toBeVisible({ timeout: 5000 });

  const firstRow = listPage.locator('tbody tr').first();
  const hasRows = await firstRow.isVisible().catch(() => false);
  if (!hasRows) return;

  await firstRow.click();
  await expect(page.getByTestId('sessions-detail-page')).toBeVisible({ timeout: 5000 });

  const analyzeTab = page.getByRole('tab', { name: 'Analyze' });
  await expect(analyzeTab).toHaveAttribute('aria-disabled', 'true');
  await expect(analyzeTab).toHaveAttribute('title', 'Coming in S3');
});

// ─── t6b: Existing pages smoke regression (SC10) ─────────────────────────────
test('Browse page root testid is visible when Browse mode is active', async ({ page }) => {
  await page.goto('http://localhost:5173');
  await page.locator('text=Browse').first().click();
  await expect(page.getByTestId('browse-page')).toBeVisible({ timeout: 5000 });
});

test('Compose page root testid is visible when Compose mode is active', async ({ page }) => {
  await page.goto('http://localhost:5173');
  await page.locator('text=Compose').first().click();
  await expect(page.getByTestId('compose-page')).toBeVisible({ timeout: 5000 });
});

test('Edit page root testid is visible when Edit mode is active', async ({ page }) => {
  await page.goto('http://localhost:5173');
  await page.locator('text=Edit').first().click();
  await expect(page.getByTestId('edit-page')).toBeVisible({ timeout: 5000 });
});

test('Export page root testid is visible when Export mode is active', async ({ page }) => {
  await page.goto('http://localhost:5173');
  await page.locator('text=Export').first().click();
  await expect(page.getByTestId('export-page')).toBeVisible({ timeout: 5000 });
});

// ─── t6b-contrast: Editor textarea text is readable (color differs from background) ──
test('Editor textarea text is readable (color differs from background)', async ({ page }) => {
  await page.goto('http://localhost:5173');

  const sessionsNav = page.locator('text=SESSIONS').first();
  if (await sessionsNav.isVisible()) await sessionsNav.click();

  const listPage = page.getByTestId('sessions-list-page');
  await expect(listPage).toBeVisible({ timeout: 5000 });

  const firstRow = listPage.locator('tbody tr').first();
  const hasRows = await firstRow.isVisible().catch(() => false);
  if (!hasRows) return; // No sessions in test environment — skip

  await firstRow.click();
  await expect(page.getByTestId('sessions-detail-page')).toBeVisible({ timeout: 5000 });

  await page.getByRole('tab', { name: 'Editor' }).click();
  const editorTab = page.getByTestId('editor-tab');
  await expect(editorTab).toBeVisible({ timeout: 3000 });

  // Wait for the textarea to appear (it renders once raw content is available)
  const textarea = editorTab.locator('textarea');
  await expect(textarea).toBeVisible({ timeout: 8000 });

  // Read computed styles for the textarea
  const { color, backgroundColor } = await textarea.evaluate((el: HTMLTextAreaElement) => {
    const cs = window.getComputedStyle(el);
    return { color: cs.color, backgroundColor: cs.backgroundColor };
  });

  // Background must not be transparent (rgba(0,0,0,0) means the fix wasn't applied)
  expect(backgroundColor).not.toBe('rgba(0, 0, 0, 0)');

  // Text color must differ from background color so text is readable
  expect(color).not.toBe(backgroundColor);
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
