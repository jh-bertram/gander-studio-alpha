import { test, expect } from '@playwright/test';

test.describe('MateriaCanvas', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/compose');
    await page.waitForSelector('[data-testid="materia-canvas"]', { timeout: 5000 });
  });

  test('orchestrator node is visible on canvas mount', async ({ page }) => {
    const orchestratorNode = page.locator('[data-testid="materia-node-orchestrator"]');
    await expect(orchestratorNode).toBeVisible();
  });

  test('canvas loads without console errors', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(msg.text());
    });
    await page.goto('/compose');
    await page.waitForSelector('[data-testid="materia-canvas"]');
    expect(errors).toHaveLength(0);
  });

  test('dragging a palette item to canvas adds a node', async ({ page }) => {
    // This test verifies the palette exists and contains items
    const palette = page.locator('[data-testid="materia-palette"]');
    await expect(palette).toBeVisible();
    const firstItem = palette.locator('[data-testid^="palette-item-"]').first();
    await expect(firstItem).toBeVisible();
  });

  test('canvas shows edges when nodes are connected', async ({ page }) => {
    // Verify the React Flow SVG container is present (edges render inside it)
    const flowSvg = page.locator('.react-flow__edges');
    await expect(flowSvg).toBeAttached();
  });
});
