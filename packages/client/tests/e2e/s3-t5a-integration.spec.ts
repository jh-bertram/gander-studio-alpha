/**
 * E2E spec: s3-t5a-integration — AnalyzeTab wiring
 *
 * SC-contrast assertion follows ~/.claude/agents/frontend.md §E2E Assertion Targeting #3
 * (rendered-but-invisible / token-system collision guard):
 *   computed color !== backgroundColor AND background not rgba(0,0,0,0).
 *
 * Fixture session: "gander-meta-onboard-skill"
 *   Agents confirmed (spawns ≥2): PM#0 (spawns=2), CR#1 (spawns=1).
 *   Pinned by session id — not "first row in list".
 *
 * SC-loading-intercept: deterministic page.route() intercept — NOT waitForTimeout race.
 */
import { test, expect } from '@playwright/test';

// ---- Fixture constants -------------------------------------------------------

/** Fixture session id — pinned, not "first row". */
const FIXTURE_SESSION_ID = 'gander-meta-onboard-skill';
/** A known agent in the fixture session (for SC-round-trip deselect). */
const DESELECT_AGENT_ID  = 'PM#0';

// ---- Helper: navigate to Analyze tab ----------------------------------------

async function navigateToAnalyzeTab(page: import('@playwright/test').Page): Promise<void> {
  await page.goto('http://localhost:5173');

  // Navigate to Sessions mode
  const sessionsNav = page.locator('text=SESSIONS').first();
  await expect(sessionsNav).toBeVisible({ timeout: 8000 });
  await sessionsNav.click();

  // Click the fixture session row (identified by sprint text, not by position)
  const listPage = page.getByTestId('sessions-list-page');
  await expect(listPage).toBeVisible({ timeout: 5000 });

  const fixtureRow = listPage
    .locator('tbody tr')
    .filter({ hasText: FIXTURE_SESSION_ID })
    .first();
  await expect(fixtureRow).toBeVisible({ timeout: 8000 });
  await fixtureRow.click();

  // Verify detail page loaded
  const detailPage = page.getByTestId('sessions-detail-page');
  await expect(detailPage).toBeVisible({ timeout: 5000 });

  // Click the Analyze tab — it must not be disabled after t5a wires it
  const analyzeTab = page.getByRole('tab', { name: 'Analyze' });
  await expect(analyzeTab).toBeVisible({ timeout: 5000 });
  await expect(analyzeTab).not.toHaveAttribute('aria-disabled', 'true');
  await analyzeTab.click();

  // Wait for AnalyzeTab root element to be visible
  const analyzePanel = page.getByTestId('analyze-tab');
  await expect(analyzePanel).toBeVisible({ timeout: 8000 });
}

// ---- SC-tab-wired: clicking Analyze tab renders AnalyzeTab content ----------

test('SC-tab-wired: Analyze tab is enabled and renders analyze-tab content', async ({ page }) => {
  await navigateToAnalyzeTab(page);

  // Analyze tab content must be visible (data-testid="analyze-tab")
  const analyzePanel = page.getByTestId('analyze-tab');
  await expect(analyzePanel).toBeVisible({ timeout: 5000 });

  // Tab must not be aria-disabled
  const analyzeTab = page.getByRole('tab', { name: 'Analyze' });
  await expect(analyzeTab).not.toHaveAttribute('aria-disabled', 'true');

  // SessionPicker must appear (confirms content is wired, not a stub)
  const picker = page.getByTestId('session-picker');
  await expect(picker).toBeVisible({ timeout: 8000 });
});

// ---- SC-contrast: rendered AnalyzeTab text is visible against background ----

/**
 * Pattern: ~/.claude/agents/frontend.md §E2E Assertion Targeting #3
 * Asserts computed color !== backgroundColor AND background is not rgba(0,0,0,0).
 */
test('SC-contrast: AnalyzeTab session picker label text is visible against background', async ({ page }) => {
  await navigateToAnalyzeTab(page);

  const label = page.getByTestId('session-picker-session-label');
  await expect(label).toBeVisible({ timeout: 8000 });

  // Pattern: ~/.claude/agents/frontend.md §E2E Assertion Targeting #3
  const styles = await label.evaluate((el) => {
    const cs = getComputedStyle(el);
    return { color: cs.color, bg: cs.backgroundColor };
  });

  expect(styles.bg).not.toBe('rgba(0, 0, 0, 0)');   // not transparent
  expect(styles.color).not.toBe(styles.bg);           // text readable against surface
});

// ---- SC-round-trip: deselect agent → timeline and stat surface update -------

test('SC-round-trip: deselecting one agent updates timeline and stat panels', async ({ page }) => {
  await navigateToAnalyzeTab(page);

  // Ensure all agents are selected first (click "All" toggle)
  const allToggle = page.getByTestId('session-picker-all-toggle');
  await expect(allToggle).toBeVisible({ timeout: 5000 });
  await allToggle.click();

  // Count agent items in stat grid (panel view is default)
  const statGrid = page.getByTestId('analyze-stat-grid');
  const initialPanels = statGrid.locator('[role="article"]');
  const initialCount = await initialPanels.count();

  // Assert we have at least 2 agents (fixture must have ≥2)
  expect(initialCount).toBeGreaterThanOrEqual(2);

  // Deselect one specific agent by its checkbox
  const agentCheckbox = page.getByTestId(`agent-checkbox-${DESELECT_AGENT_ID}`);
  await expect(agentCheckbox).toBeVisible({ timeout: 5000 });
  await agentCheckbox.click();
  await expect(agentCheckbox).not.toBeChecked();

  // After deselect: panel count must decrease by 1
  await expect(initialPanels).toHaveCount(initialCount - 1);

  // Also assert timeline no longer shows the deselected agent's bar
  const deselectedBar = page.getByTestId(`timeline-bar-${DESELECT_AGENT_ID}`);
  // Bar may be absent from DOM or detached after deselect
  await expect(deselectedBar).not.toBeAttached().catch(async () => {
    // Alternatively — if bar stays in DOM but timeline is empty for that agent,
    // the bar group for that agent_id should not be present in svg
    const barCount = await page.locator(`[data-testid="timeline-bar-${DESELECT_AGENT_ID}"]`).count();
    expect(barCount).toBe(0);
  });
});

// ---- SC-loading-intercept: loading affordance is shown during getStats ------

test('SC-loading-intercept: aria-busy element visible while getStats is delayed', async ({ page }) => {
  // Intercept tRPC session.getStats with a deterministic delay
  // The URL pattern for tRPC batch calls with session.getStats
  let intercepted = false;
  await page.route('**/trpc/session.getStats**', async (route) => {
    intercepted = true;
    // Hold for 300ms before responding — deterministic, not a race
    await new Promise<void>((resolve) => setTimeout(resolve, 300));
    await route.continue();
  });

  await page.goto('http://localhost:5173');

  // Navigate to Sessions mode
  const sessionsNav = page.locator('text=SESSIONS').first();
  await expect(sessionsNav).toBeVisible({ timeout: 8000 });
  await sessionsNav.click();

  // Click the fixture session
  const listPage = page.getByTestId('sessions-list-page');
  await expect(listPage).toBeVisible({ timeout: 5000 });
  const fixtureRow = listPage
    .locator('tbody tr')
    .filter({ hasText: FIXTURE_SESSION_ID })
    .first();
  await expect(fixtureRow).toBeVisible({ timeout: 8000 });
  await fixtureRow.click();

  // Click the Analyze tab
  const detailPage = page.getByTestId('sessions-detail-page');
  await expect(detailPage).toBeVisible({ timeout: 5000 });
  const analyzeTab = page.getByRole('tab', { name: 'Analyze' });
  await expect(analyzeTab).toBeVisible({ timeout: 5000 });
  await analyzeTab.click();

  // Immediately assert the loading affordance is present (aria-busy="true" or loading text)
  // The intercept holds the response for 300ms, so loading state persists long enough to assert
  const loadingEl = page.locator('[aria-busy="true"][data-testid="analyze-loading"]')
    .or(page.locator('[data-testid="analyze-tab"][aria-busy="true"]'));

  // Wait for loading state to appear (must be visible during the 300ms delay)
  await expect(loadingEl.first()).toBeVisible({ timeout: 2000 });

  // After the intercept resolves, the data content must appear
  const picker = page.getByTestId('session-picker');
  await expect(picker).toBeVisible({ timeout: 5000 });

  // Confirm intercept actually fired
  expect(intercepted).toBe(true);
});
