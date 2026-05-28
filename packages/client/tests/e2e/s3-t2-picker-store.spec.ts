/**
 * E2E spec: s3-t2-picker-store — SessionPicker component
 *
 * SC-contrast assertion follows ~/.claude/agents/frontend.md §E2E Assertion Targeting #3
 * (rendered-but-invisible / token-system collision guard):
 *   computed color !== backgroundColor AND background not rgba(0,0,0,0).
 *
 * Fixture session: "gander-meta-onboard-skill"
 *   Agents confirmed present: PM#0 (spawns=2), CR#1 (spawns=1), ORC#1 (spawns=0)
 *   Pinned by session id — not "first row in list".
 */
import { test, expect } from '@playwright/test';

const FIXTURE_SESSION_ID = 'gander-meta-onboard-skill';
const FIXTURE_AGENT_1 = 'PM#0';
const FIXTURE_AGENT_2 = 'CR#1';

/** Navigate to the AnalyzeTab for the fixture session. */
async function navigateToAnalyzeTab(page: import('@playwright/test').Page): Promise<void> {
  await page.goto('http://localhost:5173');

  // Navigate to Sessions mode
  const sessionsNav = page.locator('text=SESSIONS').first();
  await expect(sessionsNav).toBeVisible({ timeout: 8000 });
  await sessionsNav.click();

  // Click the fixture session row (pin by sprint text — not by position)
  const listPage = page.getByTestId('sessions-list-page');
  await expect(listPage).toBeVisible({ timeout: 5000 });
  const fixtureRow = listPage
    .locator('tbody tr')
    .filter({ hasText: FIXTURE_SESSION_ID })
    .first();
  await expect(fixtureRow).toBeVisible({ timeout: 8000 });
  await fixtureRow.click();

  // Click the Analyze tab — must not be disabled now that t5a is wired
  const detailPage = page.getByTestId('sessions-detail-page');
  await expect(detailPage).toBeVisible({ timeout: 5000 });
  const analyzeTab = page.getByRole('tab', { name: 'Analyze' });
  await expect(analyzeTab).toBeVisible({ timeout: 5000 });
  await expect(analyzeTab).not.toHaveAttribute('aria-disabled', 'true');
  await analyzeTab.click();

  // Wait for SessionPicker to render — hard failure if absent (t5a is shipped)
  const picker = page.getByTestId('session-picker');
  await expect(picker).toBeVisible({ timeout: 8000 });
}

// ─── Load test: SessionPicker is visible with session label ──────────────────
test('SC-contrast: SessionPicker primary label text is visible against its background', async ({ page }) => {
  await navigateToAnalyzeTab(page);

  // SC-contrast: follows ~/.claude/agents/frontend.md §E2E Assertion Targeting #3 verbatim
  const label = page.getByTestId('session-picker-session-label');
  await expect(label).toBeVisible({ timeout: 5000 });

  const styles = await label.evaluate((el) => {
    const cs = getComputedStyle(el);
    return { color: cs.color, bg: cs.backgroundColor };
  });

  expect(styles.bg).not.toBe('rgba(0, 0, 0, 0)');   // not transparent
  expect(styles.color).not.toBe(styles.bg);           // text readable against surface
});

// ─── SC-interactions (a): all-toggle selects all agents ──────────────────────
test('SC-interactions (a): all-toggle selects all agents', async ({ page }) => {
  await navigateToAnalyzeTab(page);

  const picker = page.getByTestId('session-picker');
  await expect(picker).toBeVisible({ timeout: 5000 });

  // First deselect all so we have a known starting state
  const noneToggle = page.getByTestId('session-picker-none-toggle');
  await expect(noneToggle).toBeVisible();
  await noneToggle.click();

  // Verify none are checked — first agent checkbox should be unchecked
  const agentCb1 = page.getByTestId(`agent-checkbox-${FIXTURE_AGENT_1}`);
  await expect(agentCb1).not.toBeChecked();

  // Now click all-toggle
  const allToggle = page.getByTestId('session-picker-all-toggle');
  await expect(allToggle).toBeVisible();
  await allToggle.click();

  // All agent checkboxes must now be checked
  const agentCheckboxes = picker.locator('input[type="checkbox"][data-agent-id]');
  const count = await agentCheckboxes.count();
  expect(count).toBeGreaterThan(0); // fixture has agents

  for (let i = 0; i < count; i++) {
    await expect(agentCheckboxes.nth(i)).toBeChecked();
  }
});

// ─── SC-interactions (b): none-toggle deselects all agents ───────────────────
test('SC-interactions (b): none-toggle deselects all agents', async ({ page }) => {
  await navigateToAnalyzeTab(page);

  const picker = page.getByTestId('session-picker');
  await expect(picker).toBeVisible({ timeout: 5000 });

  // Click all first to ensure known starting state
  const allToggle = page.getByTestId('session-picker-all-toggle');
  await expect(allToggle).toBeVisible();
  await allToggle.click();

  // Click none
  const noneToggle = page.getByTestId('session-picker-none-toggle');
  await noneToggle.click();

  // All agent checkboxes must now be unchecked
  const agentCheckboxes = picker.locator('input[type="checkbox"][data-agent-id]');
  const count = await agentCheckboxes.count();
  expect(count).toBeGreaterThan(0);

  for (let i = 0; i < count; i++) {
    await expect(agentCheckboxes.nth(i)).not.toBeChecked();
  }
});

// ─── SC-interactions (c) + (d): per-agent checkbox and per-metric toggle ─────
test('SC-interactions (c+d): per-agent checkbox toggles agent; per-metric toggle removes metric', async ({ page }) => {
  await navigateToAnalyzeTab(page);

  const picker = page.getByTestId('session-picker');
  await expect(picker).toBeVisible({ timeout: 5000 });

  // --- (c) per-agent checkbox ---
  // Start: click all-toggle to select all
  const allToggle = page.getByTestId('session-picker-all-toggle');
  await allToggle.click();

  // FIXTURE_AGENT_1 should now be checked
  const agentCb = page.getByTestId(`agent-checkbox-${FIXTURE_AGENT_1}`);
  await expect(agentCb).toBeChecked();

  // Uncheck FIXTURE_AGENT_1
  await agentCb.click();
  await expect(agentCb).not.toBeChecked();

  // Re-check FIXTURE_AGENT_1 — checkbox should flip back to checked
  await agentCb.click();
  await expect(agentCb).toBeChecked();

  // --- (d) per-metric toggle ---
  // 'spawns' should start checked (default: all metrics selected)
  const spawnsCb = page.getByTestId('metric-checkbox-spawns');
  await expect(spawnsCb).toBeVisible();
  await expect(spawnsCb).toBeChecked();

  // Uncheck spawns
  await spawnsCb.click();
  await expect(spawnsCb).not.toBeChecked();

  // Re-check spawns
  await spawnsCb.click();
  await expect(spawnsCb).toBeChecked();

  // Confirm wall_clock_ms and feedback_loops are still checked (deterministic)
  const feedbackCb = page.getByTestId('metric-checkbox-feedback_loops');
  const wallCb = page.getByTestId('metric-checkbox-wall_clock_ms');
  await expect(feedbackCb).toBeChecked();
  await expect(wallCb).toBeChecked();
});
