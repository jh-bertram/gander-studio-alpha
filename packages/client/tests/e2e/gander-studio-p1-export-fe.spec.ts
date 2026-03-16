import { test, expect } from '@playwright/test';

// ─── Load test ────────────────────────────────────────────────────────────────
test('export page is visible when export mode is active', async ({ page }) => {
  await page.goto('http://localhost:5173');

  // Navigate to Export mode
  const exportNav = page.locator('text=EXPORT').first();
  if (await exportNav.isVisible()) {
    await exportNav.click();
  }

  const exportPage = page.locator('[data-testid="export-page"]');
  await expect(exportPage).toBeVisible({ timeout: 5000 });

  // Header is rendered
  await expect(page.locator('h2').filter({ hasText: /export/i })).toBeVisible();
});

// ─── Primary interaction test ─────────────────────────────────────────────────
test('export button is disabled until target dir name is entered', async ({ page }) => {
  await page.goto('http://localhost:5173');

  const exportNav = page.locator('text=EXPORT').first();
  if (await exportNav.isVisible()) {
    await exportNav.click();
  }

  const exportPage = page.locator('[data-testid="export-page"]');
  await expect(exportPage).toBeVisible({ timeout: 5000 });

  // Export button disabled when no target dir name
  const exportBtn = page.getByRole('button', { name: /export loadout/i });
  await expect(exportBtn).toBeDisabled();

  // Type a valid dir name — button still disabled because loadout is empty
  const input = page.getByPlaceholder('my-project');
  await expect(input).toBeVisible();
  await input.fill('my-project');
  await expect(input).toHaveValue('my-project');

  // Button remains disabled with empty loadout
  await expect(exportBtn).toBeDisabled();
});

// ─── Error / empty state test ─────────────────────────────────────────────────
test('invalid directory name shows inline error', async ({ page }) => {
  await page.goto('http://localhost:5173');

  const exportNav = page.locator('text=EXPORT').first();
  if (await exportNav.isVisible()) {
    await exportNav.click();
  }

  const exportPage = page.locator('[data-testid="export-page"]');
  await expect(exportPage).toBeVisible({ timeout: 5000 });

  // Type an invalid dir name (contains spaces/special chars)
  const input = page.getByPlaceholder('my-project');
  await input.fill('invalid name!');

  // Inline error appears
  await expect(page.getByRole('alert').filter({ hasText: /only letters/i })).toBeVisible();

  // aria-invalid is set on the input
  await expect(input).toHaveAttribute('aria-invalid', 'true');

  // Export button is still disabled
  const exportBtn = page.getByRole('button', { name: /export loadout/i });
  await expect(exportBtn).toBeDisabled();
});
