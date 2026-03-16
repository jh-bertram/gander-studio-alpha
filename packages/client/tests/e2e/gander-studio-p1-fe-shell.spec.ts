import { test, expect } from '@playwright/test';

test('app shell loads with header and Browse mode active', async ({ page }) => {
  await page.goto('http://localhost:5173');
  await expect(page.locator('h1')).toHaveText('GANDER STUDIO');
  await expect(page.getByTestId('browse-page')).toBeVisible();
  // Active nav item for Browse
  const browseLink = page.locator('.nav-item').first();
  await expect(browseLink).toHaveAttribute('aria-current', 'page');
});

test('clicking a nav item switches mode content', async ({ page }) => {
  await page.goto('http://localhost:5173');
  // Click Compose
  await page.locator('.nav-item').nth(1).click();
  await expect(page.getByTestId('compose-page')).toBeVisible();
  await expect(page.getByTestId('browse-page')).not.toBeVisible();
  // Click Edit
  await page.locator('.nav-item').nth(2).click();
  await expect(page.getByTestId('edit-page')).toBeVisible();
});

test('mode content renders empty-state placeholder when no data is present', async ({ page }) => {
  await page.goto('http://localhost:5173');
  // Browse page shows placeholder text (server may be offline — page still renders)
  await expect(page.locator('#mode-content')).toBeVisible();
  // Navigating to Export shows placeholder
  await page.locator('.nav-item').nth(3).click();
  await expect(page.getByTestId('export-page')).toBeVisible();
});
