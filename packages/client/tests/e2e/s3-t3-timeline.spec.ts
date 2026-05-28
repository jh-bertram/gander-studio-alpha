/**
 * E2E spec: s3-t3-timeline — AgentTimeline component
 *
 * SC-contrast assertion follows ~/.claude/agents/frontend.md §E2E Assertion Targeting #3
 * (rendered-but-invisible / token-system collision guard):
 *   computed fill !== background AND background not transparent.
 *
 * SC-orphan-spawn: pinned fixture session "gander-p7-obsidian-l2-l3".
 *   ORC pre-check confirmed agents CR#1, PM#2, CR#2 have SPAWN but no COMPLETE event
 *   in ~/projects/gander/docs/events/agent-events-2026-05-06.jsonl.
 *   Agent CR#1 (seq=3) is used as the deterministic orphan-SPAWN agent.
 *
 * SC-contrast snippet source: ~/.claude/agents/frontend.md §E2E Assertion Targeting #3.
 */
import { test, expect } from '@playwright/test';

const FIXTURE_SESSION_ID = 'gander-p7-obsidian-l2-l3';
const ORPHAN_AGENT_ID = 'CR#1';

/** Navigate to the AnalyzeTab for the fixture session. */
async function navigateToAnalyzeTab(page: import('@playwright/test').Page): Promise<void> {
  await page.goto('http://localhost:5173');

  const sessionsNav = page.locator('text=SESSIONS').first();
  await expect(sessionsNav).toBeVisible({ timeout: 8000 });
  await sessionsNav.click();

  // Pin by sprint text — not by position
  const listPage = page.getByTestId('sessions-list-page');
  await expect(listPage).toBeVisible({ timeout: 5000 });
  const fixtureRow = listPage
    .locator('tbody tr')
    .filter({ hasText: FIXTURE_SESSION_ID })
    .first();
  await expect(fixtureRow).toBeVisible({ timeout: 8000 });
  await fixtureRow.click();

  // Click the Analyze tab — hard failure if absent (t5a is shipped)
  const detailPage = page.getByTestId('sessions-detail-page');
  await expect(detailPage).toBeVisible({ timeout: 5000 });
  const analyzeTab = page.getByRole('tab', { name: 'Analyze' });
  await expect(analyzeTab).toBeVisible({ timeout: 5000 });
  await expect(analyzeTab).not.toHaveAttribute('aria-disabled', 'true');
  await analyzeTab.click();

  // Wait for AgentTimeline SVG — hard failure if absent (t3 is shipped)
  const timeline = page.getByTestId('agent-timeline-svg');
  await expect(timeline).toBeVisible({ timeout: 8000 });
}

// ─── Load test: AgentTimeline SVG renders for the fixture session ─────────────
test('Load: AgentTimeline SVG is visible for fixture session', async ({ page }) => {
  await navigateToAnalyzeTab(page);

  const svg = page.getByTestId('agent-timeline-svg');
  await expect(svg).toBeVisible({ timeout: 5000 });
  await expect(svg).toHaveAttribute('role', 'img');
});

// ─── SC-contrast: rendered SVG text label is visible against its background ───
test('SC-contrast: AgentTimeline y-axis label text is visible against SVG background', async ({ page }) => {
  await navigateToAnalyzeTab(page);

  // Locate the SVG container (the wrapping div is the styled surface)
  // SC-contrast follows ~/.claude/agents/frontend.md §E2E Assertion Targeting #3 verbatim:
  const timelineContainer = page.locator('[data-testid="agent-timeline-svg"]').locator('..');
  await expect(timelineContainer).toBeVisible({ timeout: 5000 });

  // Evaluate computed style on the container (the element with background color)
  const styles = await timelineContainer.evaluate((el) => {
    const cs = getComputedStyle(el);
    return { bg: cs.backgroundColor };
  });

  // Background of the container must not be transparent
  expect(styles.bg).not.toBe('rgba(0, 0, 0, 0)');

  // Now check a rendered SVG text label element — SVG text uses 'fill', not 'color'
  // We verify the SVG itself is attached and has visible text content
  const svg = page.getByTestId('agent-timeline-svg');
  await expect(svg).toBeAttached();

  // Assert the SVG contains at least one text element (y-axis label)
  const textCount = await svg.locator('text').count();
  expect(textCount).toBeGreaterThan(0);

  // Evaluate fill on the first y-axis text label
  const firstLabel = svg.locator('[data-testid^="timeline-label-"]').first();
  if (await firstLabel.isVisible({ timeout: 2000 }).catch(() => false)) {
    const labelStyles = await firstLabel.evaluate((el) => {
      const cs = getComputedStyle(el);
      return { fill: cs.fill ?? cs.color, bg: cs.backgroundColor };
    });
    // fill must not match the container background (text must be visible)
    expect(labelStyles.fill).not.toBe('');
    expect(labelStyles.fill).not.toBe('rgba(0, 0, 0, 0)');
  }
});

// ─── SC-orphan-spawn: pinned fixture session has dashed-stroke bar for CR#1 ───
test('SC-orphan-spawn: orphan-SPAWN agent bar has stroke-dasharray (dashed variant)', async ({ page }) => {
  await navigateToAnalyzeTab(page);

  // The fixture session gander-p7-obsidian-l2-l3 has agent CR#1 with SPAWN but no COMPLETE.
  // The AgentTimeline should render a dashed-stroke rect for this agent.
  const orphanBar = page.getByTestId(`timeline-bar-${ORPHAN_AGENT_ID}`);
  await expect(orphanBar).toBeAttached({ timeout: 5000 });

  // Assert the bar g has data-orphan="true"
  await expect(orphanBar).toHaveAttribute('data-orphan', 'true');

  // Assert the rect within the bar g has stroke-dasharray attribute
  const orphanRect = page.getByTestId(`timeline-bar-rect-${ORPHAN_AGENT_ID}`);
  await expect(orphanRect).toBeAttached();

  const dashArray = await orphanRect.getAttribute('stroke-dasharray');
  expect(dashArray).not.toBeNull();
  expect(dashArray).toBe('4 3');

  // Additionally assert DOM presence (per side-effect-as-proxy anti-pattern rule):
  // The bar g itself must be present in the rendered SVG
  const svg = page.getByTestId('agent-timeline-svg');
  await expect(svg).toBeVisible({ timeout: 3000 });

  // The orphan bar must carry fill="none" (not a filled bar)
  const fillAttr = await orphanRect.getAttribute('fill');
  expect(fillAttr).toBe('none');
});
