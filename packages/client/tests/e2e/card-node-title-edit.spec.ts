import { test, expect } from '@playwright/test';

// ─── Helper: navigate to compose page and wait for canvas ─────────────────────
async function gotoCompose(page: import('@playwright/test').Page): Promise<void> {
  await page.goto('http://localhost:5173');

  const composeTab = page.locator('text=COMPOSE').first();
  if (await composeTab.isVisible()) {
    await composeTab.click();
  }

  await page.locator('[data-testid="materia-canvas"]').waitFor({ state: 'visible', timeout: 5000 });
}

// ─── Test 1: card node is visible on canvas ───────────────────────────────────
test('card node is visible on canvas', async ({ page }) => {
  await gotoCompose(page);

  await expect(page.locator('[data-testid="card-node"]')).toBeVisible({ timeout: 3000 });
});

// ─── Test 2: inline title edit — click → type → blur → title persisted ────────
test('inline title edit: click → type → blur → title persisted', async ({ page }) => {
  await gotoCompose(page);

  // Click the display span to enter edit mode
  await page.locator('[data-testid="card-title-display"]').click();

  // Input should be visible
  await expect(page.locator('[data-testid="card-title-input"]')).toBeVisible({ timeout: 2000 });

  // Clear and type new title
  await page.locator('[data-testid="card-title-input"]').fill('My Test Team');

  // Click canvas to trigger blur
  await page.locator('[data-testid="materia-canvas"]').click({ position: { x: 10, y: 10 } });

  // Display span should show new title
  await expect(page.locator('[data-testid="card-title-display"]')).toBeVisible({ timeout: 2000 });
  await expect(page.locator('[data-testid="card-title-display"]')).toContainText('My Test Team');

  // Input should no longer be visible
  await expect(page.locator('[data-testid="card-title-input"]')).toBeHidden();
});

// ─── Test 3: Escape cancels edit without saving and no JS errors ──────────────
test('no JS errors during title edit — Escape cancels', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (err) => errors.push(err.message));

  await gotoCompose(page);

  // Capture original title
  const originalTitle = await page.locator('[data-testid="card-title-display"]').textContent();

  // Enter edit mode
  await page.locator('[data-testid="card-title-display"]').click();
  await expect(page.locator('[data-testid="card-title-input"]')).toBeVisible({ timeout: 2000 });

  // Type a new value
  await page.locator('[data-testid="card-title-input"]').fill('Error Test');

  // Press Escape to cancel
  await page.keyboard.press('Escape');

  // Display span should restore to original title
  await expect(page.locator('[data-testid="card-title-display"]')).toBeVisible({ timeout: 2000 });
  const restoredTitle = await page.locator('[data-testid="card-title-display"]').textContent();
  expect(restoredTitle).toBe(originalTitle);

  // No unhandled JS errors
  expect(errors).toHaveLength(0);
});
