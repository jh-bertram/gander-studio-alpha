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

// Test 2: Primary interaction — desktop width has a rail column and the SubmenuRail nav
// (MIGRATED s4 FE-1b: the legacy 9-tab BottomTabBar tablist is retired and hidden at >=640px —
// SubmenuRail, hoisted globally by FE-1a, is now the desktop nav landmark. See
// docs/v2-vision/v2-design-spec.md <responsive> lines 85-88.)
test('app-shell has a rail column and SubmenuRail nav is present at 1200px', async ({ page }) => {
  await page.setViewportSize({ width: 1200, height: 800 });
  await page.goto('http://localhost:5173');

  // Assert .app-shell computed grid-template-columns reserves the rail's 240px track
  // (globals.css:111, FE-1a) — no longer the legacy single "1fr" no-sidebar column, nor the old
  // 250px sidebar value.
  const gridCols = await page.evaluate(() => {
    const shell = document.querySelector('.app-shell');
    return shell ? getComputedStyle(shell).gridTemplateColumns : null;
  });
  expect(gridCols).toContain('240px');
  expect(gridCols).not.toContain('250');

  // SubmenuRail (role="navigation", aria-label "Main navigation") is the desktop nav landmark;
  // the retired BottomTabBar tablist is hidden at this width.
  const rail = page.getByRole('navigation', { name: 'Main navigation' });
  await expect(rail).toBeVisible();
  const tablist = page.locator('div[role="tablist"]');
  await expect(tablist).not.toBeVisible();
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
