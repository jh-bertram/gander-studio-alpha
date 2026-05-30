import { test, expect } from '@playwright/test';

/**
 * Graph page e2e spec — p7-t3-fe
 * Anti-GAP-4: uses boundingBox() geometry assertions only (no arithmetic proxies).
 * Anti-GAP-5: no scratch/debug spec files in tests/e2e/.
 * Anti-side-effect-as-proxy: all assertions check DOM-presence / bounding boxes.
 */

test.describe('GraphPage', () => {
  test('load test — graph mode nav item and canvas are visible', async ({ page }) => {
    await page.goto('http://localhost:5173');

    // Click the "Graph" nav item (BottomTabBar — role="tab")
    const graphNavItem = page.getByRole('tab', { name: /graph/i });
    await expect(graphNavItem).toBeVisible();
    await graphNavItem.click();

    // Wait for React Flow canvas wrapper to appear
    const rfPane = page.locator('.react-flow__pane');
    await expect(rfPane).toBeVisible({ timeout: 15000 });

    // Filter sidebar is visible
    const sidebar = page.locator('[aria-label="Graph filters"]');
    await expect(sidebar).toBeVisible();
  });

  test('primary interaction — dagre layout produces ≥2 nodes with distinct non-zero bounding boxes', async ({ page }) => {
    await page.goto('http://localhost:5173');

    const graphNavItem = page.getByRole('tab', { name: /graph/i });
    await graphNavItem.click();

    // Wait for nodes to appear in the DOM
    const nodeLocator = page.locator('.react-flow__node');
    await expect(nodeLocator.first()).toBeVisible({ timeout: 15000 });

    // Collect bounding boxes for up to 5 nodes — geometry assertions only
    const allNodes = await nodeLocator.all();
    const sample = allNodes.slice(0, 5);
    const boxes = await Promise.all(sample.map((n) => n.boundingBox()));

    // At least 2 nodes must have non-zero, distinct positions (proves dagre ran)
    const nonZero = boxes.filter((b) => b !== null && (b.x > 0 || b.y > 0));
    expect(nonZero.length).toBeGreaterThanOrEqual(2);

    // Verify at least 2 boxes differ (dagre spread nodes out)
    const distinct = boxes.filter(
      (b, i) =>
        b !== null &&
        boxes.some(
          (other, j) =>
            j !== i && other !== null && (Math.abs(other.x - b.x) > 1 || Math.abs(other.y - b.y) > 1)
        )
    );
    expect(distinct.length).toBeGreaterThanOrEqual(2);
  });

  test('filter interaction — toggling agent node-type removes agent nodes from DOM', async ({ page }) => {
    await page.goto('http://localhost:5173');

    const graphNavItem = page.getByRole('tab', { name: /graph/i });
    await graphNavItem.click();

    // Wait for graph to load
    const nodeLocator = page.locator('.react-flow__node');
    await expect(nodeLocator.first()).toBeVisible({ timeout: 15000 });

    const initialCount = await nodeLocator.count();
    expect(initialCount).toBeGreaterThan(0);

    // Uncheck the "agent" node-type toggle in the filter sidebar
    const agentCheckbox = page.locator('[aria-label="Toggle agent nodes"]');
    await expect(agentCheckbox).toBeVisible();
    await agentCheckbox.uncheck();

    // After filtering, node count should be strictly less than the initial count
    // (the real graph has 13 agent nodes — removing them reduces the count)
    await page.waitForTimeout(300); // allow React re-render
    const filteredCount = await nodeLocator.count();
    expect(filteredCount).toBeLessThan(initialCount);

    // Verify sidebar is still present after filter action (sidebar DOM-presence)
    const sidebar = page.locator('[aria-label="Graph filters"]');
    await expect(sidebar).toBeVisible();

    // Re-enable agent nodes via reset
    const resetBtn = page.locator('[aria-label="Reset all filters to default"]');
    await resetBtn.click();

    await page.waitForTimeout(300);
    const restoredCount = await nodeLocator.count();
    expect(restoredCount).toBe(initialCount);
  });
});
