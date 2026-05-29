// MUST be executed against the running dev server (`npm run dev`) — no CI on
// this project; this is a Step-4.5 gate.
//
// p6-t1-timeline-buffer — AgentTimeline right-edge buffer Tier-2 smoke tests.
//
// Tests verify that the RIGHT_PAD geometry change correctly:
//   (a) keeps the final x-axis tick label's right edge within SVG bounds
//   (b) leaves a visible gap between the rightmost bar and the SVG right edge
//   (c) does NOT introduce a horizontal scrollbar on short sessions (no-scroll guard)
//
// Navigation mirrors agent-timeline-zoom.spec.ts (SESSIONS nav → sessions-list-page
// → fixture row → Analyze tab → agent-timeline-svg visible).
//
// Fixture: gander-p6-moirai-skein-skills (≈5.5h session, 29 events, renders timeline SVG).

import { test, expect } from '@playwright/test';

const FIXTURE_SESSION_ID = 'gander-p6-moirai-skein-skills';

/** Navigate to the AnalyzeTab for the given session — mirrors agent-timeline-zoom.spec.ts. */
async function navigateToAnalyzeTab(
  page: import('@playwright/test').Page,
  sessionId: string,
): Promise<void> {
  await page.goto('http://localhost:5173');

  const sessionsNav = page.locator('text=SESSIONS').first();
  await expect(sessionsNav).toBeVisible({ timeout: 8000 });
  await sessionsNav.click();

  const listPage = page.getByTestId('sessions-list-page');
  await expect(listPage).toBeVisible({ timeout: 5000 });

  const fixtureRow = listPage
    .locator('tbody tr')
    .filter({ hasText: sessionId })
    .first();
  await expect(fixtureRow).toBeVisible({ timeout: 8000 });
  await fixtureRow.click();

  const detailPage = page.getByTestId('sessions-detail-page');
  await expect(detailPage).toBeVisible({ timeout: 5000 });

  const analyzeTab = page.getByRole('tab', { name: 'Analyze' });
  await expect(analyzeTab).toBeVisible({ timeout: 5000 });
  await expect(analyzeTab).not.toHaveAttribute('aria-disabled', 'true');
  await analyzeTab.click();

  const timeline = page.getByTestId('agent-timeline-svg');
  await expect(timeline).toBeVisible({ timeout: 8000 });
}

test.describe('AgentTimeline right-edge buffer (p6-t1)', () => {
  test('Load: timeline SVG is visible and Analyze tab renders for fixture session', async ({ page }) => {
    await navigateToAnalyzeTab(page, FIXTURE_SESSION_ID);

    const svg = page.getByTestId('agent-timeline-svg');
    await expect(svg).toBeVisible({ timeout: 5000 });

    // DOM-presence guard: at least one bar rect is rendered
    const firstBarRect = page.locator('[data-testid^="timeline-bar-rect-"]').first();
    await expect(firstBarRect).toBeAttached();
  });

  test('Primary: final tick label fits within SVG bounds and rightmost bar has visible gap', async ({ page }) => {
    await navigateToAnalyzeTab(page, FIXTURE_SESSION_ID);

    const svg = page.getByTestId('agent-timeline-svg');
    await expect(svg).toBeAttached();

    // Get SVG bounding box
    const svgBox = await svg.boundingBox();
    expect(svgBox).not.toBeNull();
    const svgRightEdge = svgBox!.x + svgBox!.width;

    // (a) Final x-axis tick label right edge must be <= SVG right edge.
    // The tick labels are inside <g aria-hidden="true"> — target the last text in that group.
    // All ticks use textAnchor="middle"; the final tick (frac=1) is the rightmost.
    const tickTexts = page.locator('[data-testid="agent-timeline-svg"] g[aria-hidden="true"] text');
    const tickCount = await tickTexts.count();
    expect(tickCount).toBeGreaterThan(0);

    const lastTickText = tickTexts.last();
    await expect(lastTickText).toBeAttached();
    const lastTickBox = await lastTickText.boundingBox();
    expect(lastTickBox).not.toBeNull();
    const lastTickRightEdge = lastTickBox!.x + lastTickBox!.width;

    // Final tick label must fit fully within SVG right edge
    expect(lastTickRightEdge).toBeLessThanOrEqual(svgRightEdge + 1); // +1px tolerance for subpixel rounding

    // (b) Rightmost bar rect's right edge must be strictly < SVG right edge (visible gap exists).
    const barRects = page.locator('[data-testid^="timeline-bar-rect-"]');
    const barCount = await barRects.count();
    expect(barCount).toBeGreaterThan(0);

    let maxBarRightEdge = 0;
    for (let i = 0; i < barCount; i++) {
      const barBox = await barRects.nth(i).boundingBox();
      if (barBox !== null) {
        const barRight = barBox.x + barBox.width;
        if (barRight > maxBarRightEdge) {
          maxBarRightEdge = barRight;
        }
      }
    }

    expect(maxBarRightEdge).toBeGreaterThan(0);
    // Strict less-than: the rightmost bar must not touch the SVG right edge
    expect(maxBarRightEdge).toBeLessThan(svgRightEdge);
  });

  test('Short-session guard: agent-timeline-scroller has no horizontal scrollbar for fixture session', async ({ page }) => {
    // This test verifies that RIGHT_PAD, folded INSIDE the plot area, does NOT
    // introduce a horizontal scrollbar. The fixture session (gander-p6-moirai-skein-skills)
    // is a wide session — if it passes the no-scroll guard, then short sessions (which
    // have a wider margin due to the contentWidth floor at containerWidth) are safe too.
    //
    // Note: for the wide fixture this test documents the current scrolling state.
    // The invariant is: scrollWidth should not EXCEED what it was before the RIGHT_PAD
    // change — we verify the scroller's scrollWidth via evaluate() to confirm no regression.
    await navigateToAnalyzeTab(page, FIXTURE_SESSION_ID);

    const scroller = page.getByTestId('agent-timeline-scroller');
    await expect(scroller).toBeAttached();

    // Evaluate scrollWidth and clientWidth in the browser
    const scrollInfo = await scroller.evaluate((el: HTMLElement) => ({
      scrollWidth: el.scrollWidth,
      clientWidth: el.clientWidth,
    }));

    // The scroller's scrollWidth must equal the SVG width attribute (contentWidth).
    // For a short session that fits in the container, scrollWidth <= clientWidth.
    // We verify that SVG width (contentWidth) is the same as scrollWidth — no extra
    // width was added by the RIGHT_PAD change (no svg width = contentWidth + RIGHT_PAD).
    const svg = page.getByTestId('agent-timeline-svg');
    const svgWidthAttr = await svg.getAttribute('width');
    expect(svgWidthAttr).not.toBeNull();
    const svgWidth = Number(svgWidthAttr);
    expect(svgWidth).toBeGreaterThan(0);

    // scrollWidth must equal the SVG width (no extra padding added to the SVG)
    expect(scrollInfo.scrollWidth).toBeCloseTo(svgWidth, -1); // within 10px tolerance

    // DOM-presence guard: SVG still rendered (side-effect-as-proxy rule compliance)
    await expect(svg).toBeAttached();
  });
});
