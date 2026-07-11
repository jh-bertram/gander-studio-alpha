/**
 * prog-studio-vision-s4-render-loop.spec.ts
 *
 * s4-p7 live a11y e2e — Render-loop probe.
 *
 * S2 RUNTIME LESSON: never `useStore(selectorReturningNewObject)` — Zustand v5
 * infinite-loop. All selectors must return primitives or stable slices.
 *
 * Visits two surfaces and asserts zero:
 *   - "Maximum update depth exceeded" (React render loop)
 *   - "getSnapshot should be cached" (Zustand v5 infinite-loop signal)
 *   - "Too many re-renders" (React render bailout)
 *
 * Surfaces:
 *   - Sessions page → AgentTimeline Analyze tab (AgentTimeline, s4-p4)
 *   - Progression page (ProgressionPage, s4-p5)
 *
 * s4-retirement (FE-4): the GraphPage sub-test is REMOVED — GraphPage is retired this sprint
 * (absorbed into the s3 drill-downs). Sessions + Progression sub-tests are unaffected.
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

test.describe('Render-loop probe — Sessions + Progression (s4)', () => {
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

    // MIGRATED (s4 FE-1b, Progression sub-test): nav via the SubmenuRail (role="navigation",
    // aria-label "Main navigation", hoisted global by FE-1a) — the 9-tab v1 BottomTabBar
    // (role="tab") is retired.
    const progressionTab = page
      .getByRole('navigation', { name: 'Main navigation' })
      .getByRole('button', { name: /progression/i });
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
});
