/**
 * prog-studio-vision-s3-program-dag.spec.ts
 * Tier 2 e2e spec for ProgramDagPage (prog-studio-vision-2026-06-s3-FE-02).
 *
 * Covers:
 * 1. Load test — Programs tab visible, DAG canvas renders
 * 2. Primary interaction — >=2 dagre nodes with distinct bounding boxes (geometry)
 * 3. Error/empty guard + render-loop gate
 *
 * CRITICAL: Uses /programs/i for tab selection — NOT /graph/i — to avoid C1 selector collision.
 * aria-label "Program dependency graph" does NOT match /graph/i (graph-page.spec.ts uses /graph/i tab).
 * All geometry via boundingBox() — no width arithmetic.
 */
import { test, expect } from '@playwright/test';

test.describe('ProgramDagPage', () => {
  test('load test — Programs tab visible and DAG canvas renders', async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });

    await page.goto('http://localhost:5173');

    // Navigate via Programs tab (NOT /graph/i — C1 collision prevention)
    const programsTab = page.getByRole('tab', { name: /programs/i });
    await expect(programsTab).toBeVisible();
    await programsTab.click();

    // React Flow pane visible (shared class with GraphPage — scoped to this surface via tab click)
    const rfPane = page.locator('.react-flow__pane');
    await expect(rfPane).toBeVisible({ timeout: 15000 });

    // render-loop guard
    const loopErrors = consoleErrors.filter(
      (e) => e.includes('Maximum update depth') || e.includes('getSnapshot should be cached')
    );
    expect(loopErrors).toHaveLength(0);
  });

  test('primary interaction — dagre layout produces ≥2 nodes with distinct bounding boxes', async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });

    await page.goto('http://localhost:5173');

    const programsTab = page.getByRole('tab', { name: /programs/i });
    await programsTab.click();

    // Wait for React Flow nodes to appear
    const nodeLocator = page.locator('.react-flow__node');
    await expect(nodeLocator.first()).toBeVisible({ timeout: 15000 });

    // Collect bounding boxes — geometry assertion (not width arithmetic)
    const allNodes = await nodeLocator.all();
    expect(allNodes.length).toBeGreaterThanOrEqual(2);

    const sample = allNodes.slice(0, Math.min(5, allNodes.length));
    const boxes = await Promise.all(sample.map((n) => n.boundingBox()));

    // At least 2 non-null bounding boxes
    const nonNull = boxes.filter((b) => b !== null);
    expect(nonNull.length).toBeGreaterThanOrEqual(2);

    // At least 2 nodes with distinct positions (proves dagre ran)
    const distinct = nonNull.filter(
      (b, i) =>
        b !== null &&
        nonNull.some(
          (other, j) =>
            j !== i &&
            other !== null &&
            (Math.abs(other.x - b.x) > 1 || Math.abs(other.y - b.y) > 1)
        )
    );
    expect(distinct.length).toBeGreaterThanOrEqual(2);

    // Integration seams sidebar present (complementary role)
    const seamsSidebar = page.getByRole('complementary', { name: /integration seams/i });
    await expect(seamsSidebar).toBeVisible();

    // render-loop guard
    const loopErrors = consoleErrors.filter(
      (e) => e.includes('Maximum update depth') || e.includes('getSnapshot should be cached')
    );
    expect(loopErrors).toHaveLength(0);
  });

  test('empty/error state — no unhandled JS exceptions on Programs visit', async ({ page }) => {
    const unhandledErrors: string[] = [];
    page.on('pageerror', (err) => unhandledErrors.push(err.message));

    const consoleErrors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });

    await page.goto('http://localhost:5173');

    const programsTab = page.getByRole('tab', { name: /programs/i });
    await programsTab.click();

    // Wait for content: DAG, error alert, or status
    await page.waitForSelector(
      '.react-flow__pane, [role="alert"], [role="status"]',
      { timeout: 10000 }
    );

    // No unhandled exceptions
    expect(unhandledErrors).toHaveLength(0);

    // No render-loop errors
    const loopErrors = consoleErrors.filter(
      (e) => e.includes('Maximum update depth') || e.includes('getSnapshot should be cached')
    );
    expect(loopErrors).toHaveLength(0);
  });
});
