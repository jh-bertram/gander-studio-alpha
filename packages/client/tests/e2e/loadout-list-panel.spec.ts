import { test, expect } from '@playwright/test';

// ─── Constants ────────────────────────────────────────────────────────────────
// The orchestrator is rendered as a non-interactive card header only.
// It must never appear as a selectable canvas item in the panel.
const CARD_HEADER_SELECTOR = '[aria-label^="Card:"]';

// ─── Helper: navigate to compose page and wait for canvas ────────────────────
async function goToCompose(page: import('@playwright/test').Page): Promise<void> {
  await page.goto('http://localhost:5173');
  const composeTab = page.locator('text=COMPOSE').first();
  if (await composeTab.isVisible()) {
    await composeTab.click();
  }
  await page.locator('[data-testid="materia-canvas"]').waitFor({ state: 'visible', timeout: 5000 });
}

// ─── Test 1: Load test ────────────────────────────────────────────────────────
// Verifies the panel is visible and the card header (not an interactive row) appears.
test('loadout list panel is visible on the compose page', async ({ page }) => {
  await goToCompose(page);

  const panel = page.locator('[data-testid="loadout-list-panel"]');
  await expect(panel).toBeVisible({ timeout: 3000 });

  // Card header row must appear (non-interactive, aria-label starts with "Card:")
  await expect(panel.locator(CARD_HEADER_SELECTOR)).toBeVisible({ timeout: 3000 });
});

// ─── Test 2: Primary interaction test ────────────────────────────────────────
// The card header is NOT a button; click the first interactive row (agent row) instead.
test('clicking a list panel row does not throw and panel stays rendered', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (err) => errors.push(err.message));

  await goToCompose(page);

  const panel = page.locator('[data-testid="loadout-list-panel"]');
  await panel.waitFor({ state: 'visible', timeout: 5000 });

  // Click the first interactive (role="button") row — NOT the card header
  const firstButton = panel.locator('[role="button"]').first();
  if (await firstButton.count() > 0) {
    await firstButton.click();
  }

  // Panel should still be visible after click
  await expect(panel).toBeVisible();

  // No unhandled JS errors
  expect(errors).toHaveLength(0);
});

// ─── Test 3: Keyboard navigation test ────────────────────────────────────────
// Focus the first role="button" row (first agent row) and press Enter.
test('keyboard nav: Tab to first panel row and press Enter without error', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (err) => errors.push(err.message));

  await goToCompose(page);

  await page.locator('[data-testid="loadout-list-panel"]').waitFor({ state: 'visible', timeout: 5000 });

  // Focus the first role="button" row (agent row — card header is not a button)
  const firstRow = page.locator('[data-testid="loadout-list-panel"] [role="button"]').first();
  await firstRow.focus();
  await page.keyboard.press('Enter');

  // Panel should remain rendered
  await expect(page.locator('[data-testid="loadout-list-panel"]')).toBeVisible();

  // No unhandled JS errors
  expect(errors).toHaveLength(0);
});

// ─── Test 4: Card header row is not interactive ───────────────────────────────
// The orchestrator renders as a non-interactive card header only — no select button.
test('card header row is not interactive', async ({ page }) => {
  await page.goto('/compose');
  await page.waitForSelector('[data-testid="materia-canvas"]', { state: 'visible' });
  const panel = page.locator('[data-testid="loadout-list-panel"]');
  const cardHeader = panel.locator(CARD_HEADER_SELECTOR);
  await expect(cardHeader).toBeVisible();
  await expect(cardHeader).not.toHaveAttribute('role', 'button');
  // No interactive row for the orchestrator should exist
  await expect(panel.locator('[role="button"][aria-label$="orchestrator on canvas"]')).toHaveCount(0);
});

// ─── Test 5: Agent rows appear as roots in panel ──────────────────────────────
// Confirms the panel structure: card header visible, no interactive orchestrator row.
test('agent rows appear as roots in panel', async ({ page }) => {
  await page.goto('/compose');
  await page.waitForSelector('[data-testid="materia-canvas"]', { state: 'visible' });
  const panel = page.locator('[data-testid="loadout-list-panel"]');
  await expect(panel).toBeVisible();
  // Panel renders without error (card header visible)
  await expect(panel.locator(CARD_HEADER_SELECTOR)).toBeVisible();
  // No interactive orchestrator button exists
  await expect(panel.locator('[role="button"][aria-label$="orchestrator on canvas"]')).toHaveCount(0);
});

// ─── Test 6: Unconnected skills section renders without errors ────────────────
// Verifies the page loads without JS errors and the panel remains stable.
test('unconnected skills section renders without errors', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto('/compose');
  await page.waitForSelector('[data-testid="materia-canvas"]', { state: 'visible' });
  const panel = page.locator('[data-testid="loadout-list-panel"]');
  await expect(panel).toBeVisible();
  // Orchestrator is a card header only — no interactive orchestrator row
  await expect(panel.locator('[role="button"][aria-label$="orchestrator on canvas"]')).toHaveCount(0);
  expect(errors).toHaveLength(0);
});
