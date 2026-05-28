// MUST be executed against the running dev server (`npm run dev`) — no CI on
// this project; this is a Step-4.5 gate.
//
// p5-t3-timeline-zoom — AgentTimeline zoom control Tier-2 smoke tests.
//
// Navigation mirrors s3-t3-timeline.spec.ts SC-scroll/SC-units tests (the
// reference passing tests that also use the wide fixture):
//   SESSIONS nav text → sessions-list-page → fixture row → Analyze tab →
//   agent-timeline-svg visible.
//
// Fixture: gander-p6-moirai-skein-skills (≈5.5h session, 29 events, has SPAWN
// + COMPLETE events that produce a rendered timeline SVG without any extra
// agent-picker interaction).

import { test, expect } from '@playwright/test';

// Wide session known to render the AgentTimeline SVG — same fixture as the
// passing SC-scroll and SC-units tests in s3-t3-timeline.spec.ts.
const FIXTURE_SESSION_ID = 'gander-p6-moirai-skein-skills';

/** Navigate to the AnalyzeTab for the fixture session — mirrors s3-t3-timeline.spec.ts. */
async function navigateToAnalyzeTab(page: import('@playwright/test').Page): Promise<void> {
  await page.goto('http://localhost:5173');

  const sessionsNav = page.locator('text=SESSIONS').first();
  await expect(sessionsNav).toBeVisible({ timeout: 8000 });
  await sessionsNav.click();

  const listPage = page.getByTestId('sessions-list-page');
  await expect(listPage).toBeVisible({ timeout: 5000 });

  const fixtureRow = listPage
    .locator('tbody tr')
    .filter({ hasText: FIXTURE_SESSION_ID })
    .first();
  await expect(fixtureRow).toBeVisible({ timeout: 8000 });
  await fixtureRow.click();

  const detailPage = page.getByTestId('sessions-detail-page');
  await expect(detailPage).toBeVisible({ timeout: 5000 });

  const analyzeTab = page.getByRole('tab', { name: 'Analyze' });
  await expect(analyzeTab).toBeVisible({ timeout: 5000 });
  await expect(analyzeTab).not.toHaveAttribute('aria-disabled', 'true');
  await analyzeTab.click();

  // Hard-fail if the timeline SVG is not rendered (the wide fixture always renders it)
  const timeline = page.getByTestId('agent-timeline-svg');
  await expect(timeline).toBeVisible({ timeout: 8000 });
}

test.describe('AgentTimeline zoom controls', () => {
  test('Load: zoom buttons and timeline SVG are visible on the Analyze tab', async ({ page }) => {
    await navigateToAnalyzeTab(page);

    const svg = page.getByTestId('agent-timeline-svg');
    await expect(svg).toBeVisible({ timeout: 5000 });

    const zoomIn = page.locator('[aria-label="Zoom in timeline"]');
    const zoomOut = page.locator('[aria-label="Zoom out timeline"]');
    await expect(zoomIn).toBeAttached();
    await expect(zoomOut).toBeAttached();
  });

  test('Primary interaction: zoom-in widens SVG; zoom-out narrows it', async ({ page }) => {
    await navigateToAnalyzeTab(page);

    const svg = page.getByTestId('agent-timeline-svg');
    await expect(svg).toBeAttached();

    const widthBefore = Number(await svg.getAttribute('width'));
    expect(widthBefore).toBeGreaterThan(0);

    // Zoom in once — width must increase or stay the same (floored at containerWidth)
    const zoomIn = page.locator('[aria-label="Zoom in timeline"]');
    await zoomIn.click();

    const widthAfterZoomIn = Number(await svg.getAttribute('width'));
    expect(widthAfterZoomIn).toBeGreaterThanOrEqual(widthBefore);

    // Zoom out twice — width must not exceed the zoomed-in width
    const zoomOut = page.locator('[aria-label="Zoom out timeline"]');
    await zoomOut.click();
    await zoomOut.click();

    const widthAfterZoomOut = Number(await svg.getAttribute('width'));
    expect(widthAfterZoomOut).toBeLessThanOrEqual(widthAfterZoomIn);

    // Aria-live zoom-% label must be present
    const zoomLabel = page.locator('[aria-live="polite"]').first();
    await expect(zoomLabel).toBeAttached();
  });

  test('Bounds: zoom-in disables at ZOOM_MAX (4.0); zoom-out disables at ZOOM_MIN (0.25)', async ({ page }) => {
    await navigateToAnalyzeTab(page);

    const zoomIn = page.locator('[aria-label="Zoom in timeline"]');
    const zoomOut = page.locator('[aria-label="Zoom out timeline"]');

    // SVG must be present (DOM-presence guard per side-effect-as-proxy rule)
    const svg = page.getByTestId('agent-timeline-svg');
    await expect(svg).toBeAttached();

    // Reach ZOOM_MAX: 1.0 → 1.5 → 2.25 → 3.375 → clamped to 4.0 (4 clicks max)
    for (let i = 0; i < 5; i++) {
      const isDisabled = await zoomIn.isDisabled();
      if (isDisabled) break;
      await zoomIn.click();
    }
    await expect(zoomIn).toBeDisabled();

    // Reach ZOOM_MIN: 4.0 → 2.67 → 1.78 → 1.19 → 0.79 → 0.53 → 0.35 → 0.25 (8 clicks max)
    for (let i = 0; i < 9; i++) {
      const isDisabled = await zoomOut.isDisabled();
      if (isDisabled) break;
      await zoomOut.click();
    }
    await expect(zoomOut).toBeDisabled();

    // SVG still present after all the clicking (no crash)
    await expect(svg).toBeAttached();
  });
});
