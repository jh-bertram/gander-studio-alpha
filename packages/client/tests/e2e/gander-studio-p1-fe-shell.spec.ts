import { test, expect } from '@playwright/test';

// NOTE: nav is rendered by BottomTabBar using role="tab" on each button.
// The old .nav-item CSS class was removed in prog-studio-vision-2026-06-s5-DELETE
// (Sidebar.tsx was already removed in gander-studio-p7-1-sidebar-removal).
// All selectors below use role="tab" (the live ARIA role on BottomTabBar buttons).

test('app shell loads with header and Browse mode active', async ({ page }) => {
  await page.goto('http://localhost:5173');
  await expect(page.locator('h1')).toHaveText('GANDER STUDIO');
  await expect(page.getByTestId('browse-page')).toBeVisible();
  // Active nav item for Browse — BottomTabBar sets aria-selected on role="tab"
  const browseTab = page.locator('[role="tab"]', { hasText: /^Browse$/i }).first();
  await expect(browseTab).toHaveAttribute('aria-selected', 'true');
});

test('clicking a nav item switches mode content', async ({ page }) => {
  await page.goto('http://localhost:5173');
  // Click Compose (second tab)
  await page.locator('[role="tab"]').nth(1).click();
  await expect(page.getByTestId('compose-page')).toBeVisible();
  await expect(page.getByTestId('browse-page')).not.toBeVisible();
  // Click Edit (third tab)
  await page.locator('[role="tab"]').nth(2).click();
  await expect(page.getByTestId('edit-page')).toBeVisible();
});

test('mode content renders empty-state placeholder when no data is present', async ({ page }) => {
  await page.goto('http://localhost:5173');
  // Browse page shows placeholder text (server may be offline — page still renders)
  await expect(page.locator('#mode-content')).toBeVisible();
  // Navigating to Export shows placeholder
  await page.locator('[role="tab"]').nth(3).click();
  await expect(page.getByTestId('export-page')).toBeVisible();
});
