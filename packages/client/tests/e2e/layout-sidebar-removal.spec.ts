// MUST be executed against the running dev server (`npm run dev`) —
// no CI on this project; this is a Step-4.5 gate.

import { test, expect } from '@playwright/test';

// Test 1: Load — sidebar element is NOT present in the DOM
test('sidebar is not mounted in the DOM', async ({ page }) => {
  await page.goto('http://localhost:5173');
  // After sidebar import removal, no element with class "sidebar" exists
  const sidebar = page.locator('.sidebar');
  await expect(sidebar).toHaveCount(0);
});

// Test 2: Primary interaction — single-column grid, BottomTabBar present at desktop width
test('app-shell is single-column and BottomTabBar is present at 1200px', async ({ page }) => {
  await page.setViewportSize({ width: 1200, height: 800 });
  await page.goto('http://localhost:5173');

  // Assert .app-shell computed grid-template-columns is "1fr" (no 250px column)
  const gridCols = await page.evaluate(() => {
    const shell = document.querySelector('.app-shell');
    return shell ? getComputedStyle(shell).gridTemplateColumns : null;
  });
  // A single-column "1fr" resolves to a pixel value (the full width), not "250px Xpx"
  expect(gridCols).not.toContain('250');

  // BottomTabBar div[role="tablist"] is present
  const tablist = page.locator('div[role="tablist"]');
  await expect(tablist).toBeVisible();
});

// Test 3: Error/empty state — BottomTabBar present at mobile width (390px) and content has padding-bottom >= 56px
test('BottomTabBar present at 390px and content has padding-bottom >= 56px', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('http://localhost:5173');

  // BottomTabBar must be visible at mobile breakpoint
  const tablist = page.locator('div[role="tablist"]');
  await expect(tablist).toBeVisible();

  // Main content area has padding-bottom of at least 56px
  const paddingBottom = await page.evaluate(() => {
    const el = document.getElementById('mode-content');
    if (!el) return 0;
    return parseFloat(getComputedStyle(el).paddingBottom);
  });
  expect(paddingBottom).toBeGreaterThanOrEqual(56);
});
