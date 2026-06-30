/**
 * Playwright Tier 2 e2e spec — gander-studio-p9-sessions-feed-agentstats-t5
 *
 * Asserts role-aware AgentStatPanel rendering:
 *   - AUD / AUDITOR cards: audit grid (Audit ✓ / Audit ✗), no default-metrics column
 *   - Non-CR / Non-AUD cards: default-metrics column (Files Touched / Feedback Loops / Wall Clock),
 *     no ✓/✗ grid
 *   - AnalyzeTab: panel-view shows metrics-fixed annotation; metric picker hidden
 *
 * Fixture session: gander-meta-fable-rollback
 * Corpus-verified agents: PM#1, CR#1, HR#1, AUD#1, AUDITOR#1, AR#1
 * Live server required: port 5173 (NOT jsdom, NOT 3001).
 */

import { test, expect } from '@playwright/test';

// Sprint text as it appears in the sessions list table
const FIXTURE_SPRINT_TEXT = 'gander-meta-fable-rollback';

// ---- Helper -----------------------------------------------------------------

async function navigateToAnalyzeTabPanelView(
  page: import('@playwright/test').Page,
): Promise<void> {
  await page.goto('http://localhost:5173');

  await page.locator('text=SESSIONS').first().click();
  const listPage = page.getByTestId('sessions-list-page');
  await expect(listPage).toBeVisible({ timeout: 5000 });

  const fixtureRow = listPage.locator('tbody tr').filter({ hasText: FIXTURE_SPRINT_TEXT }).first();
  await expect(fixtureRow).toBeVisible({ timeout: 8000 });
  await fixtureRow.click();

  const detailPage = page.getByTestId('sessions-detail-page');
  await expect(detailPage).toBeVisible({ timeout: 5000 });

  const analyzeTab = detailPage
    .getByRole('tab', { name: /Analyze/i })
    .or(detailPage.getByRole('button', { name: /Analyze/i }));
  await expect(analyzeTab).toBeVisible({ timeout: 5000 });
  await analyzeTab.click();

  await expect(page.getByTestId('analyze-tab')).toBeVisible({ timeout: 8000 });

  // Ensure panel view is active (default is panel, but click if needed)
  const panelViewBtn = page.getByRole('button', { name: /^Panel$/i }).first();
  if (await panelViewBtn.isVisible({ timeout: 1000 }).catch(() => false)) {
    await panelViewBtn.click();
  }

  // Wait for the stat grid to be visible with at least one card
  await expect(page.getByTestId('analyze-stat-grid')).toBeVisible({ timeout: 8000 });
}

// ---- Test 1: page loads and stat grid is visible ----------------------------

test('t5-load: Analyze tab panel view renders stat grid with agent cards', async ({ page }) => {
  await navigateToAnalyzeTabPanelView(page);

  const statGrid = page.getByTestId('analyze-stat-grid');
  await expect(statGrid).toBeVisible();

  // At least one article card is rendered
  const cards = statGrid.locator('[role="article"]');
  await expect(cards).not.toHaveCount(0);

  // Panel-view metrics-fixed annotation is visible (metric picker is hidden)
  const annotation = page.getByTestId('analyze-panel-metrics-note');
  await expect(annotation).toBeVisible();
  await expect(annotation).toContainText('role-fixed');
});

// ---- Test 2: AUD/AUDITOR card shows audit grid, no default-metrics column ---

test('t5-audit-card: AUD card renders audit grid only (no default-metrics column)', async ({ page }) => {
  await navigateToAnalyzeTabPanelView(page);

  // Fixture has AUD#1 — find a card whose aria-label contains "AUD"
  const audCard = page
    .locator('[role="article"][aria-label*="AUD"]')
    .first();
  await expect(audCard).toBeVisible({ timeout: 10000 });

  // Must have stat-panel-audit-grid
  const auditGrid = audCard.locator('[data-testid="stat-panel-audit-grid"]');
  await expect(auditGrid).toBeAttached();

  // Audit ✓ and Audit ✗ labels must be present inside the audit grid
  await expect(auditGrid.getByText('Audit ✓')).toBeVisible();
  await expect(auditGrid.getByText('Audit ✗')).toBeVisible();

  // Must NOT have default-metrics column (no Files Touched headline)
  await expect(audCard.locator('[data-testid="stat-panel-default-metrics"]')).not.toBeAttached();
  // Must NOT have a critique grid
  await expect(audCard.locator('[data-testid="stat-panel-critique-grid"]')).not.toBeAttached();
});

// ---- Test 3: non-CR/AUD card shows 3 default metrics, no ✓/✗ grid ----------

test('t5-default-card: non-CR/AUD card renders 3 metrics, no ✓/✗ grid', async ({ page }) => {
  await navigateToAnalyzeTabPanelView(page);

  // Fixture has PM#1, HR#1, AR#1 — find any card NOT matching CR or AUD/AUDITOR prefix
  // Using aria-label to avoid CR / AUD / AUDITOR cards
  const defaultCard = page
    .locator('[role="article"]')
    .filter({ hasNotText: /^(CR|AUD|AUDITOR)/ })
    .first();
  await expect(defaultCard).toBeVisible({ timeout: 10000 });

  // Must have the default-metrics column
  const defaultMetrics = defaultCard.locator('[data-testid="stat-panel-default-metrics"]');
  await expect(defaultMetrics).toBeAttached();

  // Must show Files Touched, Feedback Loops, Wall Clock labels (uppercase in CSS)
  await expect(defaultMetrics.getByText(/Files Touched/i)).toBeVisible();
  await expect(defaultMetrics.getByText(/Feedback Loops/i)).toBeVisible();
  await expect(defaultMetrics.getByText(/Wall Clock/i)).toBeVisible();

  // Must NOT have any audit or critique grid
  await expect(defaultCard.locator('[data-testid="stat-panel-audit-grid"]')).not.toBeAttached();
  await expect(defaultCard.locator('[data-testid="stat-panel-critique-grid"]')).not.toBeAttached();
});
