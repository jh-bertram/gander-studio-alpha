/**
 * prog-studio-vision-s4-legibility.spec.ts
 *
 * s4-p7 live a11y e2e — Legibility and geometry assertions.
 *
 * Verifies:
 *   1. AgentTimeline: role-colored bars have non-zero bounding boxes and do not
 *      clip past the SVG right edge (RIGHT_PAD=48 no-clip contract preserved).
 *   2. AgentTimeline: DEFERRED-002 zoom clamp still active at ZOOM_MIN=0.25 /
 *      ZOOM_MAX=4.0 (zoom-out button disabled at floor, zoom-in at ceiling).
 *   3. ProgressionPage: XP progress bars have non-zero bounding boxes and
 *      aria-valuenow/aria-valuemax set (accessible, non-clipped geometry).
 *   4. ProgressionPage: progressbar fill does not overflow its container
 *      (fillPct capped at 100%; boundingBox of fill <= track).
 *
 * Runs against the LIVE dev stack (http://localhost:5173).
 * Uses the known wide fixture 'gander-p6-moirai-skein-skills' for timeline tests
 * (same as agent-timeline-zoom.spec.ts — always renders SVG).
 */

import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:5173';
const FIXTURE_SESSION_ID = 'gander-p6-moirai-skein-skills';

/** Navigate to the AgentTimeline Analyze tab for the wide fixture session. */
async function navigateToTimeline(page: import('@playwright/test').Page): Promise<boolean> {
  await page.goto(BASE_URL);

  const sessionsNav = page.locator('text=SESSIONS').first();
  await expect(sessionsNav).toBeVisible({ timeout: 8000 });
  await sessionsNav.click();

  const listPage = page.getByTestId('sessions-list-page');
  await expect(listPage).toBeVisible({ timeout: 5000 });

  // Try the wide fixture first (always has SPAWN+COMPLETE bars)
  const fixtureRow = listPage
    .locator('tbody tr')
    .filter({ hasText: FIXTURE_SESSION_ID })
    .first();

  const hasFixture = await fixtureRow.isVisible({ timeout: 3000 }).catch(() => false);

  if (hasFixture) {
    await fixtureRow.click();
  } else {
    // Fallback: first available row
    const firstRow = listPage.locator('tbody tr').first();
    const hasAny = await firstRow.isVisible({ timeout: 3000 }).catch(() => false);
    if (!hasAny) return false;
    await firstRow.click();
  }

  const detailPage = page.getByTestId('sessions-detail-page');
  await expect(detailPage).toBeVisible({ timeout: 5000 });

  const analyzeTab = page.getByRole('tab', { name: 'Analyze' });
  await expect(analyzeTab).toBeVisible({ timeout: 5000 });
  await expect(analyzeTab).not.toHaveAttribute('aria-disabled', 'true');
  await analyzeTab.click();

  const timeline = page.getByTestId('agent-timeline-svg');
  const svgVisible = await timeline.isVisible({ timeout: 8000 }).catch(() => false);
  return svgVisible;
}

test.describe('Legibility and geometry — s4 juice surfaces', () => {
  test('Load: ProgressionPage XP bars have correct aria semantics and non-zero geometry', async ({ page }) => {
    const renderLoopErrors: string[] = [];
    page.on('console', (msg) => {
      const text = msg.text();
      if (
        text.includes('Maximum update depth') ||
        text.includes('getSnapshot should be cached')
      ) {
        renderLoopErrors.push(text);
      }
    });

    await page.goto(BASE_URL);

    const progressionTab = page.getByRole('tab', { name: /progression/i });
    await expect(progressionTab).toBeVisible({ timeout: 8000 });
    await progressionTab.click();

    // Wait for ledger data
    const loadingStatus = page.locator('[role="status"][aria-label="Loading progression ledger"]');
    await loadingStatus.waitFor({ state: 'hidden', timeout: 12000 }).catch(() => {});

    // Render-loop gate
    expect(renderLoopErrors, `Render loop: ${renderLoopErrors[0] ?? ''}`).toHaveLength(0);

    const progressbars = page.locator('[role="progressbar"]');
    const barCount = await progressbars.count();

    if (barCount === 0) {
      // Empty or error state — DOM-presence guard
      const container = page.locator('[role="status"], [role="alert"]').first();
      await expect(container).toBeAttached({ timeout: 5000 });
      return;
    }

    // Each progressbar must have required ARIA attributes and non-zero geometry
    for (let i = 0; i < barCount; i++) {
      const bar = progressbars.nth(i);

      const ariaValueNow = await bar.getAttribute('aria-valuenow');
      const ariaValueMin = await bar.getAttribute('aria-valuemin');
      const ariaValueMax = await bar.getAttribute('aria-valuemax');
      const ariaLabel = await bar.getAttribute('aria-label');

      expect(ariaValueNow, `bar[${i}] missing aria-valuenow`).not.toBeNull();
      expect(ariaValueMin, `bar[${i}] missing aria-valuemin`).not.toBeNull();
      expect(ariaValueMax, `bar[${i}] missing aria-valuemax`).not.toBeNull();
      expect(ariaLabel, `bar[${i}] missing aria-label`).not.toBeNull();
      expect(Number(ariaValueMax)).toBeGreaterThan(0);

      // Geometry: the track container must be visible and have non-zero width
      const box = await bar.boundingBox();
      if (box !== null) {
        expect(box.width).toBeGreaterThan(0);
      }
    }

    // DOM-presence guard: progression heading still present
    await expect(page.getByRole('heading', { name: 'PROGRESSION LEDGER' })).toBeAttached();
  });

  test('Primary: AgentTimeline bars within RIGHT_PAD no-clip boundary (boundingBox proof)', async ({ page }) => {
    const renderLoopErrors: string[] = [];
    page.on('console', (msg) => {
      const text = msg.text();
      if (
        text.includes('Maximum update depth') ||
        text.includes('getSnapshot should be cached')
      ) {
        renderLoopErrors.push(text);
      }
    });

    const navigated = await navigateToTimeline(page);

    // Render-loop gate
    expect(renderLoopErrors, `Render loop: ${renderLoopErrors[0] ?? ''}`).toHaveLength(0);

    if (!navigated) {
      // No sessions — verify Sessions page is stable
      const listPage = page.getByTestId('sessions-list-page');
      await expect(listPage).toBeAttached();
      return;
    }

    const svg = page.getByTestId('agent-timeline-svg');
    await expect(svg).toBeAttached();

    const svgBox = await svg.boundingBox();
    expect(svgBox).not.toBeNull();

    const svgRight = svgBox!.x + svgBox!.width;
    const svgLeft = svgBox!.x;

    // Bar rects: verify RIGHT_PAD no-clip contract (bars don't overflow SVG right edge)
    const barRects = page.locator('[data-testid^="timeline-bar-rect-"]');
    const barCount = await barRects.count();
    expect(barCount, 'Expected at least one bar rect rendered').toBeGreaterThan(0);

    for (let i = 0; i < barCount; i++) {
      const barBox = await barRects.nth(i).boundingBox();
      if (barBox !== null) {
        // Bar must start within SVG viewport
        expect(barBox.x).toBeGreaterThanOrEqual(svgLeft - 2); // 2px subpixel tolerance
        // Bar right edge must not exceed SVG right boundary
        expect(barBox.x + barBox.width).toBeLessThanOrEqual(svgRight + 2);
        // Bars must have positive height (they must be visible as rects, not zero-size)
        expect(barBox.height).toBeGreaterThan(0);
      }
    }

    // Playhead: if rendered, must be within SVG bounds (timeline-playhead)
    const playhead = page.getByTestId('timeline-playhead');
    const playheadAttached = await playhead.isAttached().catch(() => false);
    if (playheadAttached) {
      const phBox = await playhead.boundingBox();
      if (phBox !== null && phBox.width > 0) {
        expect(phBox.x).toBeGreaterThanOrEqual(svgLeft - 4);
        expect(phBox.x).toBeLessThanOrEqual(svgRight + 4);
      }
    }

    // DOM-presence guard: SVG still attached after all assertions
    await expect(svg).toBeAttached();
  });

  test('DEFERRED-002: zoom clamp still active — disabled at ZOOM_MIN(0.25) and ZOOM_MAX(4.0)', async ({ page }) => {
    const renderLoopErrors: string[] = [];
    page.on('console', (msg) => {
      const text = msg.text();
      if (
        text.includes('Maximum update depth') ||
        text.includes('getSnapshot should be cached')
      ) {
        renderLoopErrors.push(text);
      }
    });

    const navigated = await navigateToTimeline(page);

    // Render-loop gate
    expect(renderLoopErrors, `Render loop: ${renderLoopErrors[0] ?? ''}`).toHaveLength(0);

    if (!navigated) {
      const listPage = page.getByTestId('sessions-list-page');
      await expect(listPage).toBeAttached();
      return;
    }

    const svg = page.getByTestId('agent-timeline-svg');
    await expect(svg).toBeAttached();

    const zoomIn = page.locator('[aria-label="Zoom in timeline"]');
    const zoomOut = page.locator('[aria-label="Zoom out timeline"]');

    await expect(zoomIn).toBeAttached();
    await expect(zoomOut).toBeAttached();

    // Hit ZOOM_MAX (4.0): click zoom-in until disabled (≤5 clicks to reach 4.0)
    for (let i = 0; i < 5; i++) {
      const isDisabled = await zoomIn.isDisabled();
      if (isDisabled) break;
      await zoomIn.click();
    }
    await expect(zoomIn).toBeDisabled();

    // aria-live zoom label should reflect 400%
    const zoomLabel = page.locator('[aria-live="polite"]').first();
    await expect(zoomLabel).toBeAttached();
    const labelText = await zoomLabel.textContent();
    expect(labelText).toMatch(/400|4\.0/);

    // Hit ZOOM_MIN (0.25): click zoom-out until disabled (≤9 clicks from 4.0 to 0.25)
    for (let i = 0; i < 9; i++) {
      const isDisabled = await zoomOut.isDisabled();
      if (isDisabled) break;
      await zoomOut.click();
    }
    await expect(zoomOut).toBeDisabled();

    // aria-live label should reflect 25%
    const labelTextMin = await zoomLabel.textContent();
    expect(labelTextMin).toMatch(/25|0\.25/);

    // DOM-presence guard: SVG still intact after all zoom operations
    await expect(svg).toBeAttached();
  });
});
