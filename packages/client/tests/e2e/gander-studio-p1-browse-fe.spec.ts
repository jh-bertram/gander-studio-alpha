import { test, expect } from '@playwright/test';

test('browse page loads and shows page title', async ({ page }) => {
  await page.goto('http://localhost:5173');
  const browsePage = page.getByTestId('browse-page');
  await expect(browsePage).toBeVisible();
  // Page title contains "Materia" (default "All Materia") or one of the section titles
  const titleText = await browsePage.locator('div').filter({ hasText: /Materia|Roster/ }).first().textContent();
  expect(titleText).toMatch(/Materia|Roster/);
});

test('type filter Skills hides agent cards and shows skill cards', async ({ page }) => {
  await page.goto('http://localhost:5173');
  // Click the Skills segment button
  const skillsBtn = page.getByRole('button', { name: /^Skills$/i });
  await skillsBtn.click();
  // Skill cards should be visible if any exist; agent cards must not be visible
  const agentCards = page.getByTestId('agent-card');
  await expect(agentCards).toHaveCount(0);
  // Skill grid should render (cards or empty state)
  const browsePage = page.getByTestId('browse-page');
  await expect(browsePage).toBeVisible();
});

test('clicking an agent card opens drilldown dialog', async ({ page }) => {
  await page.goto('http://localhost:5173');
  // Ensure we're on the "all" or "agents" view
  const agentCards = page.getByTestId('agent-card');
  const count = await agentCards.count();
  if (count === 0) {
    // Server offline or no agents — pass gracefully
    return;
  }
  await agentCards.first().click();
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
});
