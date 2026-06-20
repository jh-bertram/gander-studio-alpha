/**
 * prog-studio-vision-s4-render-loop.spec.ts
 *
 * s4-p7 live a11y e2e — Render-loop probe.
 *
 * S2 RUNTIME LESSON: never `useStore(selectorReturningNewObject)` — Zustand v5
 * infinite-loop. All selectors must return primitives or stable slices.
 *
 * Visits three surfaces and asserts zero:
 *   - "Maximum update depth exceeded" (React render loop)
 *   - "getSnapshot should be cached" (Zustand v5 infinite-loop signal)
 *   - "Too many re-renders" (React render bailout)
 *
 * Surfaces:
 *   - Sessions page → AgentTimeline Analyze tab (AgentTimeline, s4-p4)
 *   - Progression page (ProgressionPage, s4-p5)
 *   - Graph page (GraphPage, s4-p6)
 *
 * Runs against the LIVE dev stack (http://localhost:5173).
 */

import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:5173';
const FIXTURE_SESSION_ID = 'gander-p6-moirai-skein-skills';

/**
 * Collect render-loop console errors from a given page action.
 * Returns all detected error strings.
 */
function attachRenderLoopListener(page: import('@playwright/test').Page): () => string[] {
  const errors: string[] = [];
  page.on('console', (msg) => {
    const text = msg.text();
    if (
      text.includes('Maximum update depth') ||
      text.includes('getSnapshot should be cached') ||
      text.includes('Too many re-renders')
    ) {
      errors.push(text);
    }
  });
  return () => errors;
}

test.describe('Render-loop probe — Sessions + Progression + Graph (s4)', () => {
  test('Sessions/AgentTimeline: zero render-loop errors when visiting timeline surface', async ({ page }) => {
    const getErrors = attachRenderLoopListener(page);

    await page.goto(BASE_URL);

    const sessionsNav = page.locator('text=SESSIONS').first();
    await expect(sessionsNav).toBeVisible({ timeout: 8000 });
    await sessionsNav.click();

    const listPage = page.getByTestId('sessions-list-page');
    await expect(listPage).toBeVisible({ timeout: 5000 });

    // Try the wide fixture row
    const fixtureRow = listPage
      .locator('tbody tr')
      .filter({ hasText: FIXTURE_SESSION_ID })
      .first();

    const hasFixture = await fixtureRow.isVisible({ timeout: 3000 }).catch(() => false);

    if (hasFixture) {
      await fixtureRow.click();

      const detailPage = page.getByTestId('sessions-detail-page');
      await expect(detailPage).toBeVisible({ timeout: 5000 });

      const analyzeTab = page.getByRole('tab', { name: 'Analyze' });
      await expect(analyzeTab).toBeVisible({ timeout: 5000 });
      await analyzeTab.click();

      const timeline = page.getByTestId('agent-timeline-svg');
      await expect(timeline).toBeVisible({ timeout: 8000 });

      // Let the component settle (playhead interval fires at 5s — wait 1.5s
      // to catch any initial render bursts from nowTs setState)
      await page.waitForTimeout(1500);
    } else {
      // No sessions — just navigate to Sessions page and let it settle
      await page.waitForTimeout(500);
    }

    // Render-loop gate
    const errors = getErrors();
    expect(errors, `Render loop on Sessions/AgentTimeline: ${errors[0] ?? ''}`).toHaveLength(0);

    // DOM-presence guard: the list page (or detail page) is in DOM
    const sessionsContainer = page.locator(
      '[data-testid="sessions-list-page"], [data-testid="sessions-detail-page"]'
    ).first();
    await expect(sessionsContainer).toBeAttached();
  });

  test('ProgressionPage: zero render-loop errors when visiting progression surface', async ({ page }) => {
    const getErrors = attachRenderLoopListener(page);

    await page.goto(BASE_URL);

    const progressionTab = page.getByRole('tab', { name: /progression/i });
    await expect(progressionTab).toBeVisible({ timeout: 8000 });
    await progressionTab.click();

    // Wait for loading state to resolve
    const loadingStatus = page.locator('[role="status"][aria-label="Loading progression ledger"]');
    await loadingStatus.waitFor({ state: 'hidden', timeout: 12000 }).catch(() => {});

    // Let any count-up rAF loops finish
    await page.waitForTimeout(1000);

    // Render-loop gate
    const errors = getErrors();
    expect(errors, `Render loop on ProgressionPage: ${errors[0] ?? ''}`).toHaveLength(0);

    // DOM-presence guard: page has rendered something meaningful
    const meaningful = page
      .getByRole('heading', { name: /progression ledger/i })
      .or(page.locator('[role="status"]').first())
      .or(page.locator('[role="alert"]').first());
    await expect(meaningful.first()).toBeAttached({ timeout: 5000 });
  });

  test('GraphPage: zero render-loop errors when visiting graph surface with hover interaction', async ({ page }) => {
    const getErrors = attachRenderLoopListener(page);

    await page.goto(BASE_URL);

    const graphTab = page.getByRole('tab', { name: /graph/i });
    await expect(graphTab).toBeVisible({ timeout: 8000 });
    await graphTab.click();

    // Wait for the graph page to settle: either the RF pane appears,
    // or an error/loading state renders. Give 25s for data fetch + layout.
    const rfPane = page.locator('.react-flow__pane');
    const loadingState = page.locator('[aria-label="Loading graph"]');
    const errorState = page.locator('[role="alert"]');

    // Wait up to 25s for any of the three states to appear
    await Promise.race([
      rfPane.waitFor({ state: 'visible', timeout: 25000 }).catch(() => {}),
      loadingState.waitFor({ state: 'visible', timeout: 25000 }).catch(() => {}),
      errorState.waitFor({ state: 'visible', timeout: 25000 }).catch(() => {}),
    ]);

    // Allow React Flow layout to complete if loading resolved to RF pane
    const rfPaneVisible = await rfPane.isVisible().catch(() => false);

    if (rfPaneVisible) {
      // Hover over first node to trigger hoveredNodeId state change (s4-p6 juice)
      const firstNode = page.locator('.react-flow__node').first();
      const hasNode = await firstNode.isVisible({ timeout: 5000 }).catch(() => false);

      if (hasNode) {
        await firstNode.hover();
        // Wait for any re-renders triggered by hover state update
        await page.waitForTimeout(500);
        // Move mouse away to trigger hover-exit
        await page.mouse.move(0, 0);
        await page.waitForTimeout(300);
      }
    } else {
      // Loading or error state — just let it settle
      await page.waitForTimeout(500);
    }

    // Render-loop gate — must pass regardless of whether RF pane rendered
    const errors = getErrors();
    expect(errors, `Render loop on GraphPage: ${errors[0] ?? ''}`).toHaveLength(0);

    // DOM-presence guard: graph page rendered something (RF pane, loading, or error)
    const graphSurface = rfPane
      .or(loadingState)
      .or(errorState);
    await expect(graphSurface.first()).toBeAttached({ timeout: 5000 });
  });
});
