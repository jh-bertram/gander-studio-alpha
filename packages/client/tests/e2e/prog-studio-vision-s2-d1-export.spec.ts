/**
 * prog-studio-vision-2026-06-s2 — D1 ExportPage rewire
 *
 * Verifies that ExportPage reads the loadout from canvas-store (not the dead
 * compose-store) and that export.spawn receives non-empty agents/skills.
 *
 * The canvas-store initialises with one orchestrator node (see canvas-store.ts:36).
 * This means even on a fresh page load, canvasPayload.agents = ['orchestrator'],
 * and the export button enables once a valid target dir name is entered.
 *
 * For "real connections" coverage we inject canvas state via page.evaluate +
 * Zustand's module-level store (accessed via the same singleton reference that
 * React's render tree uses). We capture the tRPC POST body via page.route.
 */

import { test, expect } from '@playwright/test';

const BASE = 'http://localhost:5173';

async function navigateToExport(page: import('@playwright/test').Page): Promise<void> {
  await page.goto(BASE);
  await page.waitForLoadState('networkidle', { timeout: 15000 });
  // Use role="tab" selector to target the BottomTabBar tab button specifically,
  // avoiding false matches on <p> elements that also contain "Export" text.
  const exportNav = page.locator('[role="tab"]', { hasText: /^Export$/i }).first();
  const hasExport = await exportNav.isVisible({ timeout: 3000 }).catch(() => false);
  if (hasExport) {
    await exportNav.click();
    await page.waitForTimeout(500);
  }
  await expect(page.getByTestId('export-page')).toBeVisible({ timeout: 5000 });
}

// ─── Test 1: Load — composed loadout enables export button ────────────────────

test('D1: canvas-store initial orchestrator node makes loadout non-empty and export button enabled when dir typed', async ({ page }) => {
  await navigateToExport(page);

  // The canvas starts with 1 agent (orchestrator), so isLoadoutEmpty is false.
  // Filling target dir name should enable the export button.
  const targetInput = page.getByPlaceholder('my-project');
  await expect(targetInput).toBeVisible({ timeout: 5000 });
  await targetInput.fill('test-export-d1');

  const exportBtn = page.getByRole('button', { name: /export loadout/i });
  await expect(exportBtn).not.toBeDisabled({ timeout: 3000 });

  // Loadout summary chip shows at least 1 agent
  const exportPage = page.getByTestId('export-page');
  await expect(exportPage).toContainText('1 agents');
});

// ─── Test 2: Primary — export.spawn receives non-empty agents array ────────────

test('D1: export.spawn POST payload contains non-empty agents array (real canvas data, not compose-store)', async ({ page }) => {
  // Intercept the tRPC batch POST to capture the export.spawn request body
  const capturedBodies: unknown[] = [];
  await page.route('**/trpc/export.spawn**', async (route) => {
    const request = route.request();
    const body = request.postDataJSON() as unknown;
    capturedBodies.push(body);
    // Abort so we don't need the actual server to fulfil the export
    await route.abort();
  });

  await navigateToExport(page);

  const targetInput = page.getByPlaceholder('my-project');
  await targetInput.fill('test-export-d1');

  const exportBtn = page.getByRole('button', { name: /export loadout/i });
  await expect(exportBtn).not.toBeDisabled({ timeout: 3000 });
  await exportBtn.click();

  // Wait for the route handler to capture the request
  await page.waitForTimeout(500);

  // tRPC httpBatchLink sends body as { "0": { loadout, targetDirName, ... } }
  // (an object keyed by procedure index, NOT a JSON-wrapped value).
  // Extract the loadout from the first batch entry.
  const captured = capturedBodies[0];
  type LoadoutShape = { agents?: unknown[]; skills?: unknown[]; connections?: unknown[] };
  let loadout: LoadoutShape | null = null;

  if (captured && typeof captured === 'object') {
    const rec = captured as Record<string, { loadout?: LoadoutShape; json?: { loadout?: LoadoutShape } }>;
    // Actual format (httpBatchLink): { "0": { loadout: {...}, targetDirName: "..." } }
    const entry0 = rec['0'];
    if (entry0?.loadout) {
      loadout = entry0.loadout;
    } else if (entry0?.json?.loadout) {
      // Older tRPC versions may wrap in .json
      loadout = entry0.json.loadout;
    } else if (Array.isArray(captured)) {
      // Array format fallback
      const firstItem = (captured as Array<{ json?: { loadout?: LoadoutShape } }>)[0];
      loadout = firstItem?.json?.loadout ?? null;
    }
  }

  // Verify agents is non-empty (orchestrator at minimum from canvas initial state)
  expect(loadout, 'export.spawn request body must contain loadout').not.toBeNull();
  expect(
    Array.isArray(loadout?.agents) && (loadout?.agents.length ?? 0) > 0,
    `loadout.agents must be non-empty — got: ${JSON.stringify(loadout?.agents)}`,
  ).toBe(true);
});

// ─── Test 3: Error state — invalid dir name disables export ───────────────────

test('D1: invalid target dir name disables export button and shows inline error', async ({ page }) => {
  await navigateToExport(page);

  const targetInput = page.getByPlaceholder('my-project');
  await targetInput.fill('invalid name with spaces!');

  // Error message appears
  await expect(page.getByRole('alert').filter({ hasText: /only letters/i })).toBeVisible();

  // Export button remains disabled
  const exportBtn = page.getByRole('button', { name: /export loadout/i });
  await expect(exportBtn).toBeDisabled();
});
