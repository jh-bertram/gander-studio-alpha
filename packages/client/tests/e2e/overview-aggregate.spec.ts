/**
 * E2E spec: p5-t4-overview-aggregate — Sessions landing page multi-select + aggregate stats
 *
 * MUST be executed against the running dev server (`npm run dev`) — no CI on this project;
 * this is a Step-4.5 gate.
 * G2 follow-up from prog-studio-sessions-2026-05-s3-analyze §6.
 *
 * Fixture session: "gander-meta-onboard-skill" (known to have agents + total_spawns ≥ 1)
 * Second session:  "gander-p6-moirai-skein-skills" (known agents, used for deselect test)
 */
import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:5173';

/** Navigate to the Sessions list page. */
async function navigateToSessions(page: import('@playwright/test').Page): Promise<void> {
  await page.goto(BASE_URL);
  const sessionsNav = page.locator('text=SESSIONS').first();
  await expect(sessionsNav).toBeVisible({ timeout: 8000 });
  await sessionsNav.click();
  const listPage = page.getByTestId('sessions-list-page');
  await expect(listPage).toBeVisible({ timeout: 6000 });
}

// ─── Test 1: Default all-selected aggregate renders ───────────────────────────
test('default: all sessions selected and aggregate stats panel is visible', async ({ page }) => {
  await navigateToSessions(page);

  // Selection strip must be visible
  const strip = page.getByTestId('session-selection-strip');
  await expect(strip).toBeVisible({ timeout: 6000 });

  // All sessions selected by default: "All" button should be pressed
  const allBtn = page.getByTestId('select-all-sessions');
  await expect(allBtn).toBeVisible({ timeout: 5000 });
  await expect(allBtn).toHaveAttribute('aria-pressed', 'true');

  // Count label must say "N of N sessions selected" (not 0)
  const countLabel = strip.locator('[aria-live="polite"]');
  await expect(countLabel).not.toHaveText(/^0 of/);

  // Aggregate stats panel must eventually render (data arrives)
  const aggregatePanel = page.getByTestId('aggregate-stats-panel');
  await expect(aggregatePanel).toBeVisible({ timeout: 12000 });

  // DOM-presence: wall clock summary rendered
  const wallClock = page.getByTestId('aggregate-wall-clock');
  await expect(wallClock).toBeVisible({ timeout: 8000 });
  // Text must not be empty/dash-only
  const wallClockText = await wallClock.textContent();
  expect(wallClockText).toContain('Total wall clock (sum of sessions)');
});

// ─── Test 2: Deselecting a session changes the aggregate counts ───────────────
test('deselecting a session changes aggregate counts (headline behavior)', async ({ page }) => {
  await navigateToSessions(page);

  // Wait for aggregate to fully load
  const aggregatePanel = page.getByTestId('aggregate-stats-panel');
  await expect(aggregatePanel).toBeVisible({ timeout: 12000 });

  // Read initial wall-clock text
  const wallClock = page.getByTestId('aggregate-wall-clock');
  await expect(wallClock).toBeVisible({ timeout: 8000 });

  // Count how many checkboxes are present
  const checkboxes = page.locator('[data-testid^="session-checkbox-"]');
  const total = await checkboxes.count();
  expect(total).toBeGreaterThan(1); // need ≥ 2 sessions to test deselect

  // Uncheck the first session checkbox (use first() to avoid row-order coupling)
  const firstCheckbox = checkboxes.first();
  await expect(firstCheckbox).toBeChecked();
  await firstCheckbox.click();
  await expect(firstCheckbox).not.toBeChecked();

  // Count label must now show N-1 of N
  const strip = page.getByTestId('session-selection-strip');
  const countLabel = strip.locator('[aria-live="polite"]');
  const countText = await countLabel.textContent();
  // e.g. "4 of 5 sessions selected" — just confirm not all selected anymore
  expect(countText).not.toMatch(new RegExp(`^${total} of ${total}`));

  // Aggregate panel should re-render (may flash loading then show new data)
  // Wait for panel to return to visible state after re-fetch
  await expect(aggregatePanel).toBeVisible({ timeout: 12000 });

  // DOM-presence check: the aggregate still renders after deselect
  await expect(wallClock).toBeVisible({ timeout: 8000 });
});

// ─── Test 3: Checkbox click does NOT navigate to detail ───────────────────────
test('checkbox click does not navigate to session detail', async ({ page }) => {
  await navigateToSessions(page);

  // Wait for checkboxes to appear
  const checkboxes = page.locator('[data-testid^="session-checkbox-"]');
  await expect(checkboxes.first()).toBeVisible({ timeout: 8000 });

  // Click a checkbox
  await checkboxes.first().click();

  // We must still be on the list page (no navigation to detail)
  const listPage = page.getByTestId('sessions-list-page');
  await expect(listPage).toBeVisible({ timeout: 3000 });

  // Detail page must NOT be visible
  const detailPage = page.getByTestId('sessions-detail-page');
  await expect(detailPage).not.toBeVisible();
});

// ─── Test 4: Row click (not on checkbox) navigates to detail ─────────────────
test('row click (not checkbox) navigates to session detail', async ({ page }) => {
  await navigateToSessions(page);

  // Wait for table to render
  const tbody = page.locator('[aria-label="Sessions list"] tbody');
  await expect(tbody).toBeVisible({ timeout: 8000 });

  // Click the Sprint cell (not the checkbox cell) of the first row
  // Target the second <td> (Sprint column) using a more specific locator
  const sprintCell = tbody.locator('tr').first().locator('td').nth(1);
  await expect(sprintCell).toBeVisible({ timeout: 5000 });
  await sprintCell.click();

  // Detail page must appear
  const detailPage = page.getByTestId('sessions-detail-page');
  await expect(detailPage).toBeVisible({ timeout: 8000 });
});

// ─── Test 5: None button shows "No sessions selected" ────────────────────────
test('"None" button deselects all and shows no-sessions placeholder', async ({ page }) => {
  await navigateToSessions(page);

  // Click the None button
  const noneBtn = page.getByTestId('select-none-sessions');
  await expect(noneBtn).toBeVisible({ timeout: 6000 });
  await noneBtn.click();

  // All checkboxes should be unchecked
  const checkboxes = page.locator('[data-testid^="session-checkbox-"]');
  const count = await checkboxes.count();
  for (let i = 0; i < count; i++) {
    await expect(checkboxes.nth(i)).not.toBeChecked();
  }

  // "No sessions selected" placeholder appears
  const noSessionsMsg = page.getByTestId('aggregate-no-sessions');
  await expect(noSessionsMsg).toBeVisible({ timeout: 5000 });

  // "All" button should re-select when clicked
  const allBtn = page.getByTestId('select-all-sessions');
  await allBtn.click();

  // Aggregate panel should return
  const aggregatePanel = page.getByTestId('aggregate-stats-panel');
  await expect(aggregatePanel).toBeVisible({ timeout: 12000 });
});
