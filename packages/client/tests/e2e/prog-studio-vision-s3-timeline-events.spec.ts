/**
 * prog-studio-vision-s3-timeline-events.spec.ts
 *
 * Tier-2 smoke tests for SEAM-06: AgentTimeline ev-type marker expansion.
 * Runs LIVE against the dev stack (http://localhost:5173).
 *
 * These tests verify the SEAM-06 surface via the Sessions page. When no
 * post-mortem files exist in the configured GANDER_ROOT, the sessions list
 * is empty — tests gracefully handle both the empty state AND the populated
 * state (if a session row exists).
 *
 * Render-loop gate: each test asserts zero "Maximum update depth" /
 * "getSnapshot should be cached" console errors while visiting Sessions.
 */

import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:5173';

/** Navigate to the Sessions list page; return the session count found. */
async function navigateToSessionsList(page: import('@playwright/test').Page): Promise<number> {
  await page.goto(BASE_URL);

  const sessionsNav = page.locator('text=SESSIONS').first();
  await expect(sessionsNav).toBeVisible({ timeout: 8000 });
  await sessionsNav.click();

  const listPage = page.getByTestId('sessions-list-page');
  await expect(listPage).toBeVisible({ timeout: 5000 });

  // Count session rows — may be 0 if no post-mortems exist
  const rows = listPage.locator('tbody tr');
  const rowCount = await rows.count();
  return rowCount;
}

/**
 * Navigate to AgentTimeline Analyze tab for the FIRST available session.
 * Returns false if no sessions are available (empty state — test should handle gracefully).
 */
async function tryNavigateToAnalyzeTab(page: import('@playwright/test').Page): Promise<boolean> {
  await page.goto(BASE_URL);

  const sessionsNav = page.locator('text=SESSIONS').first();
  await expect(sessionsNav).toBeVisible({ timeout: 8000 });
  await sessionsNav.click();

  const listPage = page.getByTestId('sessions-list-page');
  await expect(listPage).toBeVisible({ timeout: 5000 });

  // Use the first available session row, regardless of its ID
  const firstRow = listPage.locator('tbody tr').first();
  const hasRows = await firstRow.isVisible().catch(() => false);
  if (!hasRows) {
    return false; // No sessions available — empty state
  }

  await firstRow.click();

  const detailPage = page.getByTestId('sessions-detail-page');
  await expect(detailPage).toBeVisible({ timeout: 5000 });

  const analyzeTab = page.getByRole('tab', { name: 'Analyze' });
  await expect(analyzeTab).toBeVisible({ timeout: 5000 });
  await expect(analyzeTab).not.toHaveAttribute('aria-disabled', 'true');
  await analyzeTab.click();

  const timeline = page.getByTestId('agent-timeline-svg');
  await expect(timeline).toBeVisible({ timeout: 8000 });
  return true;
}

test.describe('AgentTimeline SEAM-06 ev-type markers (s3)', () => {
  test('Load: Sessions page renders cleanly; timeline SVG renders when sessions exist', async ({ page }) => {
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

    const sessionCount = await navigateToSessionsList(page);

    // Render-loop gate — must pass regardless of session count
    expect(renderLoopErrors, `Render loop detected: ${renderLoopErrors[0] ?? ''}`).toHaveLength(0);

    if (sessionCount === 0) {
      // Empty-sessions state: verify the empty state is shown (not a crash)
      const listPage = page.getByTestId('sessions-list-page');
      await expect(listPage).toBeAttached();
      // DOM-presence guard: sessions-list-page container is in DOM
      await expect(listPage).toBeVisible();
      return;
    }

    // Sessions exist — navigate into the Analyze tab
    const navigated = await tryNavigateToAnalyzeTab(page);
    if (!navigated) return;

    const svg = page.getByTestId('agent-timeline-svg');
    await expect(svg).toBeVisible({ timeout: 5000 });

    // At least one bar rect must be rendered (DOM-presence guard)
    const firstBarRect = page.locator('[data-testid^="timeline-bar-rect-"]').first();
    await expect(firstBarRect).toBeAttached();
  });

  test('Primary: markers positioned within SVG bounds when timeline renders (boundingBox proof)', async ({ page }) => {
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

    const navigated = await tryNavigateToAnalyzeTab(page);

    // Render-loop gate
    expect(renderLoopErrors, `Render loop detected: ${renderLoopErrors[0] ?? ''}`).toHaveLength(0);

    if (!navigated) {
      // No sessions available — verify Sessions page itself is stable (no crash)
      const listPage = page.getByTestId('sessions-list-page');
      await expect(listPage).toBeAttached();
      return;
    }

    const svg = page.getByTestId('agent-timeline-svg');
    await expect(svg).toBeAttached();

    // Get SVG bounding box (boundingBox-proved geometry)
    const svgBox = await svg.boundingBox();
    expect(svgBox).not.toBeNull();
    const svgRight = svgBox!.x + svgBox!.width;
    const svgLeft = svgBox!.x;

    // Bar rects within bounds (base geometry contract, invariant from RIGHT_PAD no-clip)
    const barRects = page.locator('[data-testid^="timeline-bar-rect-"]');
    const barCount = await barRects.count();
    expect(barCount).toBeGreaterThan(0);

    for (let i = 0; i < barCount; i++) {
      const barBox = await barRects.nth(i).boundingBox();
      if (barBox !== null) {
        expect(barBox.x).toBeGreaterThanOrEqual(svgLeft);
        // Bar right edge must not exceed SVG right (RIGHT_PAD no-clip contract preserved)
        expect(barBox.x + barBox.width).toBeLessThanOrEqual(svgRight + 2); // 2px subpixel tolerance
      }
    }

    // Marker shapes within SVG bounds (SEAM-06 no-clip contract)
    const markerGroups = page.locator('[data-testid^="timeline-marker-group-"]');
    const markerCount = await markerGroups.count();

    for (let i = 0; i < markerCount; i++) {
      const markerBox = await markerGroups.nth(i).boundingBox();
      if (markerBox !== null && markerBox.width > 0) {
        expect(markerBox.x + markerBox.width).toBeLessThanOrEqual(svgRight + 4);
        expect(markerBox.x).toBeGreaterThanOrEqual(svgLeft - 2);
      }
    }

    // Marker aria-labels — all present and non-empty
    for (let i = 0; i < markerCount; i++) {
      const group = markerGroups.nth(i);
      const ariaLabel = await group.getAttribute('aria-label');
      expect(ariaLabel).not.toBeNull();
      expect((ariaLabel ?? '').length).toBeGreaterThan(0);
    }

    // DOM-presence guard: SVG still rendered after assertions
    await expect(svg).toBeAttached();
  });

  test('Error/empty state: AgentTimeline empty-state renders cleanly when no sessions exist', async ({ page }) => {
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

    // Navigate to Sessions — this is the primary surface for AgentTimeline
    const sessionsNav = page.locator('text=SESSIONS').first();
    await expect(sessionsNav).toBeVisible({ timeout: 8000 });
    await sessionsNav.click();

    const listPage = page.getByTestId('sessions-list-page');
    await expect(listPage).toBeVisible({ timeout: 5000 });

    // The Sessions page must render without JS errors (empty OR populated)
    // Render-loop gate: critical even with empty sessions list
    expect(renderLoopErrors, `Render loop detected: ${renderLoopErrors[0] ?? ''}`).toHaveLength(0);

    const rowCount = await listPage.locator('tbody tr').count();

    if (rowCount === 0) {
      // Empty state: sessions-list-page container is rendered, not a blank crash
      await expect(listPage).toBeVisible();
      // DOM-presence guard (side-effect-as-proxy rule): container is in DOM
      await expect(listPage).toBeAttached();
    } else {
      // Sessions exist: navigate into first session and verify Analyze tab loads cleanly
      await listPage.locator('tbody tr').first().click();

      const detailPage = page.getByTestId('sessions-detail-page');
      await expect(detailPage).toBeVisible({ timeout: 5000 });

      const analyzeTab = page.getByRole('tab', { name: 'Analyze' });
      await expect(analyzeTab).toBeVisible({ timeout: 5000 });
      await analyzeTab.click();

      // Timeline must render — the component shows "No agents selected" or SVG
      const timeline = page.getByTestId('agent-timeline-svg').or(
        page.getByText('No timeline data').or(page.getByText('No agents selected'))
      );
      await expect(timeline.first()).toBeAttached({ timeout: 8000 });
    }
  });
});
