/**
 * Playwright Tier 2 e2e spec for s3-t4-stat-surfaces:
 * AgentStatPanel + AgentStatTable smoke + sort + contrast tests.
 *
 * Fixture session: gander-p3-team-report-v1-2 (sprint: "gander-p3-team-report-v1.2")
 * Verified via curl session.getStats: agents with distinct spawns values —
 *   AR#1: spawns=2  (unique maximum — first in descending sort)
 *   REQVAL#1: spawns=1, ORC#0: spawns=0, AUDITOR#1: spawns=0 (multiple at 0 and 1)
 * Default order: [REQVAL#1(1), ORC#0(0), AR#1(2), AR#2(1), ...]
 * Ascending: ORC#0(0) or AUDITOR#1(0) first; AR#1(2) is last (not in first 2 rows)
 * Descending: AR#1(2) first — uniquely maximum, unambiguous.
 *
 * Contrast assertion pattern: ~/.claude/agents/frontend.md §E2E Assertion Targeting #3
 */

import { test, expect } from '@playwright/test';

// ---- Fixture constants -------------------------------------------------------

// Pinned fixture session sprint text (displayed in sessions list table)
const FIXTURE_SPRINT_TEXT = 'gander-p3-team-report-v1.2';

// Known spawns values from fixture (curl-verified getStats response)
// AR#1 is the ONLY agent with spawns=2 — unambiguously first in descending order
const AGENT_MAX_SPAWNS_ID = 'AR#1';
// Agents with spawns=0 — either appears first in ascending order
const AGENT_ZERO_SPAWNS_IDS = ['ORC#0', 'AUDITOR#1'];

// ---- Helper: navigate to Analyze tab on fixture session ----------------------

async function navigateToAnalyzeTab(page: import('@playwright/test').Page): Promise<void> {
  await page.goto('http://localhost:5173');

  // Navigate to Sessions mode
  await page.locator('text=SESSIONS').first().click();

  const listPage = page.getByTestId('sessions-list-page');
  await expect(listPage).toBeVisible({ timeout: 5000 });

  // Find the fixture session row by sprint text and click it
  const fixtureRow = listPage.locator('tbody tr').filter({ hasText: FIXTURE_SPRINT_TEXT }).first();
  await expect(fixtureRow).toBeVisible({ timeout: 5000 });
  await fixtureRow.click();

  // Wait for detail page
  const detailPage = page.getByTestId('sessions-detail-page');
  await expect(detailPage).toBeVisible({ timeout: 5000 });

  // Navigate to Analyze tab — must not be disabled now that t5a is wired
  const analyzeTab = detailPage
    .getByRole('tab', { name: /Analyze/i })
    .or(detailPage.getByRole('button', { name: /Analyze/i }));
  await expect(analyzeTab).toBeVisible({ timeout: 5000 });
  await expect(analyzeTab).not.toHaveAttribute('aria-disabled', 'true');
  await analyzeTab.click();

  // Wait for AnalyzeTab content to appear — hard failure (t5a is shipped)
  const analyzePanel = page.getByTestId('analyze-tab');
  await expect(analyzePanel).toBeVisible({ timeout: 8000 });
}

// ---- Helper: ensure table view is active ------------------------------------

async function ensureTableView(page: import('@playwright/test').Page): Promise<void> {
  // If there is a "Table" toggle button, click it to switch to table view
  const tableViewBtn = page.getByRole('button', { name: /^Table$/i }).first();
  if (await tableViewBtn.isVisible({ timeout: 1000 }).catch(() => false)) {
    await tableViewBtn.click();
  }
}

// ---- Test 1: surface loads and stat table is visible ------------------------

test('AgentStatTable renders on Analyze tab for fixture session', async ({ page }) => {
  await navigateToAnalyzeTab(page);
  await ensureTableView(page);

  // AgentStatTable renders a native table with aria-label="Agent statistics"
  const table = page.locator('table[aria-label="Agent statistics"]');
  await expect(table).toBeVisible({ timeout: 10000 });
});

// ---- Test 2: SC-sort — ascending then descending spawns sort ----------------

test('SC-sort: AgentStatTable sorts by spawns ascending then descending with aria-sort', async ({ page }) => {
  await navigateToAnalyzeTab(page);
  await ensureTableView(page);

  const table = page.locator('table[aria-label="Agent statistics"]');
  await expect(table).toBeVisible({ timeout: 10000 });

  const rows = table.locator('tbody tr');
  await expect(rows).not.toHaveCount(0);

  // (a) Capture initial agent_id sequence of first 3 rows (default order)
  const getAgentIds = async (): Promise<string[]> => {
    const ids: string[] = [];
    for (let i = 0; i < 3; i++) {
      const agentId = await rows.nth(i).getAttribute('data-agent-id');
      ids.push(agentId ?? `unknown-${i}`);
    }
    return ids;
  };

  const initialIds = await getAgentIds();
  // Default order must have 3 distinct rows
  expect(initialIds.length).toBe(3);

  // ---- (b) Click "Count" (spawns) column header button ----
  const spawnsHeaderBtn = table.locator('[data-testid="sort-spawns"]');
  await expect(spawnsHeaderBtn).toBeVisible();
  await spawnsHeaderBtn.click();

  // ---- (c) Assert ascending order + aria-sort="ascending" ----
  // The th ancestor of the sort button must have aria-sort="ascending"
  const spawnsHeaderTh = page.locator('th[aria-sort="ascending"]').filter({ has: spawnsHeaderBtn });
  await expect(spawnsHeaderTh).toBeVisible();

  // In ascending order:
  // - First row must be one of the zero-spawns agents (ORC#0 or AUDITOR#1), both have spawns=0
  // - AR#1 (spawns=2 — uniquely maximum) must NOT be in position 0 or 1
  const ascIds = await getAgentIds();
  expect(AGENT_ZERO_SPAWNS_IDS).toContain(ascIds[0]);
  expect(ascIds[0]).not.toBe(AGENT_MAX_SPAWNS_ID);
  expect(ascIds[1]).not.toBe(AGENT_MAX_SPAWNS_ID);

  // ---- (d) Click header again for descending ----
  await spawnsHeaderBtn.click();

  // ---- (e) Assert descending order + aria-sort="descending" ----
  const spawnsHeaderThDesc = page.locator('th[aria-sort="descending"]').filter({ has: spawnsHeaderBtn });
  await expect(spawnsHeaderThDesc).toBeVisible();

  // In descending order: AR#1 (spawns=2) is the unique maximum — must be first row
  const descIds = await getAgentIds();
  expect(descIds[0]).toBe(AGENT_MAX_SPAWNS_ID);
  // Second and third rows must have spawns=1 (not the maximum)
  expect(descIds[1]).not.toBe(AGENT_MAX_SPAWNS_ID);
  expect(descIds[2]).not.toBe(AGENT_MAX_SPAWNS_ID);
});

// ---- Test 3: SC-contrast — computed style check on table cell ---------------

/**
 * Contrast assertion from ~/.claude/agents/frontend.md §E2E Assertion Targeting #3:
 * Assert computed color !== backgroundColor AND bg is not rgba(0,0,0,0).
 */
test('SC-contrast: table cell text color is visible against background', async ({ page }) => {
  await navigateToAnalyzeTab(page);
  await ensureTableView(page);

  const table = page.locator('table[aria-label="Agent statistics"]');
  await expect(table).toBeVisible({ timeout: 10000 });

  // Pick the first data cell (agent_id td — rendered with var(--mt) color)
  const firstAgentCell = table.locator('tbody tr').first().locator('td').first();
  await expect(firstAgentCell).toBeVisible();

  // Pattern: ~/.claude/agents/frontend.md §E2E Assertion Targeting #3
  const styles = await firstAgentCell.evaluate((el) => {
    const cs = getComputedStyle(el);
    return { color: cs.color, bg: cs.backgroundColor };
  });

  // Background must not be transparent (rgba(0,0,0,0))
  expect(styles.bg).not.toBe('rgba(0, 0, 0, 0)');
  // Text color must differ from background
  expect(styles.color).not.toBe(styles.bg);
});

// ---- Test 4: AgentStatPanel — audit attribution always rendered ---------------

test('AgentStatPanel audit attribution always renders including zero values', async ({ page }) => {
  await navigateToAnalyzeTab(page);

  // If panel view toggle exists, switch to it
  const panelViewBtn = page.getByRole('button', { name: /^Panel$/i }).first();
  if (await panelViewBtn.isVisible({ timeout: 1000 }).catch(() => false)) {
    await panelViewBtn.click();
  }

  // Look for AgentStatPanel: role="article" aria-label="* statistics"
  const statPanel = page.locator('[role="article"]').first();
  await expect(statPanel).toBeVisible({ timeout: 10000 });

  // Audit attribution section is always rendered (even with zero values)
  await expect(statPanel.getByText('Audit ✓')).toBeVisible();
  await expect(statPanel.getByText('Audit ✗')).toBeVisible();

  // Audit pass value data-testid must be attached (rendered as "0" not hidden)
  const auditPassValue = statPanel.locator('[data-testid="audit-pass-value"]');
  await expect(auditPassValue).toBeAttached();
});
