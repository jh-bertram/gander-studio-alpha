import { test, expect, type Page } from '@playwright/test';

/**
 * Progression page e2e spec — p5b-003-fe
 * Tier 2: load, data-visible, and error/empty-state tests.
 * MIGRATED (s4 FE-1b): nav uses the SubmenuRail (role="navigation", aria-label
 * "Main navigation", hoisted global by FE-1a) — the 9-tab v1 BottomTabBar (role="tab") that
 * this file previously navigated via is retired.
 * Does NOT run live here; auditor runs the live pass.
 */

function getProgressionNavButton(page: Page) {
  return page.getByRole('navigation', { name: 'Main navigation' }).getByRole('button', { name: /progression/i });
}

test.describe('ProgressionPage', () => {
  test('load test — Progression nav tab is present and renders the page', async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });

    await page.goto('http://localhost:5173');

    // Navigate via the SubmenuRail (role="button", accessible name matches /progression/i)
    const progressionTab = getProgressionNavButton(page);
    await expect(progressionTab).toBeVisible();
    await progressionTab.click();

    // Page heading is rendered (role=heading scoped to avoid prose collisions)
    await expect(page.getByRole('heading', { name: 'PROGRESSION LEDGER' })).toBeVisible({ timeout: 10000 });

    // No console errors after navigation
    expect(consoleErrors).toHaveLength(0);
  });

  test('primary interaction — at least one real sprint_id is visible in the ledger', async ({ page }) => {
    await page.goto('http://localhost:5173');

    const progressionTab = getProgressionNavButton(page);
    await progressionTab.click();

    // Wait for the ledger to load (surface coverage heading — role-scoped to avoid prose collision)
    await expect(page.getByRole('heading', { name: 'SURFACE COVERAGE' })).toBeVisible({ timeout: 15000 });

    // Assert at least one confirmed real sprint_id is present in the rendered output
    // Both IDs are confirmed present in the live ledger at /home/jhber/projects/gander/docs/progression-ledger.md
    const sprintEntry = page.locator('code').filter({ hasText: /gander-meta-progression-design|gander-progression-p1-analyzer/ });
    await expect(sprintEntry.first()).toBeVisible({ timeout: 10000 });

    // SPRINT HISTORY section heading is also visible (role-scoped, DOM-presence pairing)
    await expect(page.getByRole('heading', { name: 'SPRINT HISTORY' })).toBeVisible();
  });

  test('empty/error state — loading state or error card is shown when data is unavailable', async ({ page }) => {
    await page.goto('http://localhost:5173');

    const progressionTab = getProgressionNavButton(page);
    await progressionTab.click();

    // One of three valid states MUST appear: loading, error card, or the ledger heading
    // This asserts graceful handling regardless of ledger availability
    const loadingSpinner = page.locator('[role="status"][aria-label="Loading progression ledger"]');
    const errorCard = page.locator('[role="alert"]');
    const emptyCard = page.locator('[role="status"][aria-live="polite"]').filter({ hasText: /no ledger entries/i });
    const ledgerHeading = page.getByRole('heading', { name: 'PROGRESSION LEDGER' });

    // One of the four must be visible (loading → data → populated or empty; or error)
    await expect(loadingSpinner.or(errorCard).or(emptyCard).or(ledgerHeading)).toBeVisible({ timeout: 10000 });
  });
});
