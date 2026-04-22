import { test, expect } from '@playwright/test';

// ─── Load test ────────────────────────────────────────────────────────────────
test('compose page loads and materia canvas surface is visible', async ({ page }) => {
  await page.goto('http://localhost:5173');

  // Navigate to compose mode
  const composeTab = page.locator('text=COMPOSE').first();
  if (await composeTab.isVisible()) {
    await composeTab.click();
  }

  // The canvas surface must be present
  const canvas = page.locator('[data-testid="materia-canvas"]');
  await expect(canvas).toBeVisible({ timeout: 5000 });

  // The orchestrator node is always present on the canvas
  const orchestratorNode = page.locator('[data-testid="materia-node-orchestrator"]');
  await expect(orchestratorNode).toBeVisible({ timeout: 5000 });
});

// ─── Primary interaction test ─────────────────────────────────────────────────
test('orchestrator orb has glassy gradient and no plain background-color', async ({ page }) => {
  await page.goto('http://localhost:5173');

  const composeTab = page.locator('text=COMPOSE').first();
  if (await composeTab.isVisible()) {
    await composeTab.click();
  }

  await page.locator('[data-testid="materia-canvas"]').waitFor({ state: 'visible', timeout: 5000 });

  // The orb child div inside the materia-node wrapper is the first div child
  const orbNode = page.locator('[data-testid="materia-node-orchestrator"] > div').first();
  await expect(orbNode).toBeVisible();

  // Verify the background is a radial-gradient (glassy orb), not a plain color
  const bg = await orbNode.evaluate((el) => window.getComputedStyle(el).background);
  expect(bg).toMatch(/radial-gradient/i);

  // Specular highlight child div must be present (aria-hidden, so query by attribute)
  const highlight = orbNode.locator('[aria-hidden="true"]').first();
  await expect(highlight).toBeAttached();
});

// ─── Error / empty state test ─────────────────────────────────────────────────
test('canvas palette renders empty-state message when no items match search', async ({ page }) => {
  await page.goto('http://localhost:5173');

  const composeTab = page.locator('text=COMPOSE').first();
  if (await composeTab.isVisible()) {
    await composeTab.click();
  }

  await page.locator('[data-testid="materia-palette"]').waitFor({ state: 'visible', timeout: 5000 });

  // Type a search query that matches nothing
  const searchInput = page.locator('[aria-label="Search palette"]');
  await searchInput.fill('zzz_no_match_xyz');

  // Both sections should show empty-state messages
  await expect(page.locator('text=No agents match.')).toBeVisible({ timeout: 2000 });
  await expect(page.locator('text=No skills match.')).toBeVisible({ timeout: 2000 });
});
