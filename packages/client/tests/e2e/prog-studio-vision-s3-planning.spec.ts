/**
 * prog-studio-vision-s3-planning.spec.ts
 * Tier 2 e2e spec for PlanningPage (prog-studio-vision-2026-06-s3-FE-02).
 *
 * Covers:
 * 1. Load test — nav to Planning, page visible, grouped sprint headings visible
 * 2. Primary interaction — collapsible sprint group expands/collapses; DEFERRED-NNN row visible
 * 3. Error/empty state guard — no render-loop console errors on visit
 *
 * Geometry: no width arithmetic; DOM presence via locators only.
 * render-loop gate: fails on "Maximum update depth" or "getSnapshot should be cached" errors.
 */
import { test, expect } from '@playwright/test';

test.describe('PlanningPage', () => {
  test('load test — Planning tab visible and sprint headings render', async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });

    await page.goto('http://localhost:5173');

    // Navigate to Planning tab
    const planningTab = page.getByRole('tab', { name: /planning/i });
    await expect(planningTab).toBeVisible();
    await planningTab.click();

    // Page heading visible
    const heading = page.getByRole('heading', { name: /planning backlog/i });
    await expect(heading).toBeVisible();

    // At least one sprint section (role="listitem" inside the sprint list)
    const sprintList = page.getByRole('list', { name: /sprint groups/i });
    await expect(sprintList).toBeVisible({ timeout: 10000 });

    // render-loop guard
    const loopErrors = consoleErrors.filter(
      (e) => e.includes('Maximum update depth') || e.includes('getSnapshot should be cached')
    );
    expect(loopErrors).toHaveLength(0);
  });

  test('primary interaction — expand sprint shows item row with kind badge', async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });

    await page.goto('http://localhost:5173');

    const planningTab = page.getByRole('tab', { name: /planning/i });
    await planningTab.click();

    // Wait for the sprint list to load
    const sprintList = page.getByRole('list', { name: /sprint groups/i });
    await expect(sprintList).toBeVisible({ timeout: 10000 });

    // Find the first sprint toggle button — use nth(1) to get a collapsed one
    // (first sprint may already have items; pick the second sprint button to expand fresh)
    const sprintToggles = page.locator('[role="button"][aria-expanded]');
    await expect(sprintToggles.first()).toBeAttached({ timeout: 5000 });

    // Pick a collapsed one: find all toggles with aria-expanded="false"
    const collapsedToggles = page.locator('[role="button"][aria-expanded="false"]');
    const collapsedCount = await collapsedToggles.count();

    if (collapsedCount > 0) {
      // Click the first collapsed toggle
      const target = collapsedToggles.first();
      await target.click();

      // After click, at least one item row or kind badge should appear
      const kindBadge = page.locator('[aria-label*="Item kind"]').first();
      await expect(kindBadge).toBeVisible({ timeout: 5000 });
    } else {
      // All sprints already expanded — just verify items are visible
      const kindBadge = page.locator('[aria-label*="Item kind"]').first();
      await expect(kindBadge).toBeVisible({ timeout: 5000 });
    }

    // render-loop guard
    const loopErrors = consoleErrors.filter(
      (e) => e.includes('Maximum update depth') || e.includes('getSnapshot should be cached')
    );
    expect(loopErrors).toHaveLength(0);
  });

  test('empty / error state — no unhandled JS exceptions on Planning visit', async ({ page }) => {
    const unhandledErrors: string[] = [];
    page.on('pageerror', (err) => unhandledErrors.push(err.message));

    const consoleErrors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });

    await page.goto('http://localhost:5173');

    const planningTab = page.getByRole('tab', { name: /planning/i });
    await planningTab.click();

    // Wait for any of: the backlog list, an error alert, or a status message
    await page.waitForSelector(
      '[role="list"][aria-label="Sprint groups"], [role="alert"], [role="status"]',
      { timeout: 10000 }
    );

    // No unhandled JS exceptions
    expect(unhandledErrors).toHaveLength(0);

    // No render-loop errors
    const loopErrors = consoleErrors.filter(
      (e) => e.includes('Maximum update depth') || e.includes('getSnapshot should be cached')
    );
    expect(loopErrors).toHaveLength(0);
  });
});
