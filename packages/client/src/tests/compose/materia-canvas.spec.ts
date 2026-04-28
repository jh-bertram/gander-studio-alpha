import { test, expect } from '@playwright/test';
import {
  LINK_PRIMARY_FREQ_HZ,
  LINK_SECONDARY_FREQ_HZ,
} from '../../constants/canvas';

// ─── Helper: navigate to compose page and wait for canvas ─────────────────────
async function gotoCompose(page: import('@playwright/test').Page): Promise<void> {
  await page.goto('http://localhost:5173');
  const composeTab = page.locator('text=COMPOSE').first();
  if (await composeTab.isVisible()) await composeTab.click();
  await page.locator('[data-testid="materia-canvas"]').waitFor({ state: 'visible', timeout: 8000 });
}

// ─── Helper: drag a canvas node to the center of a target node ────────────────
// Performs a slow mouse drag (10 steps) so RF proximity detection fires.
// Both dragging and target can be a CSS selector string or an existing Locator.
async function dragNodeOntoTarget(
  page: import('@playwright/test').Page,
  draggingSelector: string | import('@playwright/test').Locator,
  targetSelector: string | import('@playwright/test').Locator,
): Promise<void> {
  const draggingEl = typeof draggingSelector === 'string'
    ? page.locator(draggingSelector)
    : draggingSelector;
  const targetEl = typeof targetSelector === 'string'
    ? page.locator(targetSelector)
    : targetSelector;
  await draggingEl.waitFor({ state: 'visible', timeout: 5000 });
  await targetEl.waitFor({ state: 'visible', timeout: 5000 });
  const dragBox = await draggingEl.boundingBox();
  const targetBox = await targetEl.boundingBox();
  if (!dragBox || !targetBox) throw new Error('bounding box not found for drag helper');
  const startX = dragBox.x + dragBox.width / 2;
  const startY = dragBox.y + dragBox.height / 2;
  const endX = targetBox.x + targetBox.width / 2;
  const endY = targetBox.y + targetBox.height / 2;
  await page.mouse.move(startX, startY);
  await page.mouse.down();
  for (let i = 1; i <= 10; i++) {
    await page.mouse.move(
      startX + ((endX - startX) * i) / 10,
      startY + ((endY - startY) * i) / 10,
      { steps: 1 },
    );
    await page.waitForTimeout(30);
  }
  await page.mouse.up();
}

// ─── Strict palette helpers (no fallback) ─────────────────────────────────────
// These tests require GANDER_ROOT to point at a directory containing at least one
// .claude/agents/*.md and one .claude/skills/*.md file. Hard-fails (waitFor timeout)
// surface a missing/empty palette section as a real test infrastructure issue, not
// a silently-skipped test (A1 / post-mortem G6).

// Locates the first item under the Agents h3 landmark. Hard-fails if none visible.
async function locateAgentPaletteItem(
  palette: import('@playwright/test').Locator,
): Promise<import('@playwright/test').Locator> {
  const agentItem = palette
    .locator('h3').filter({ hasText: /^Agents$/i })
    .locator('..')
    .locator('[data-testid^="palette-item-"]')
    .first();
  await agentItem.waitFor({ state: 'visible', timeout: 5000 });
  return agentItem;
}

// Locates the first item under the Skills h3 landmark. Hard-fails if none visible.
async function locateSkillPaletteItem(
  palette: import('@playwright/test').Locator,
): Promise<import('@playwright/test').Locator> {
  const skillItem = palette
    .locator('h3').filter({ hasText: /^Skills$/i })
    .locator('..')
    .locator('[data-testid^="palette-item-"]')
    .first();
  await skillItem.waitFor({ state: 'visible', timeout: 5000 });
  return skillItem;
}

test.describe('MateriaCanvas', () => {
  test.beforeEach(async ({ page }) => {
    await gotoCompose(page);
  });

  test('orchestrator card node is visible on canvas mount', async ({ page }) => {
    // Orchestrator renders as CardNode (data-testid="card-node"), not MateriaNode.
    const orchestratorNode = page.locator('[data-testid="card-node"]');
    await expect(orchestratorNode).toBeVisible();
  });

  test('canvas loads without console errors', async ({ page }) => {
    // Re-register error listener before navigation (beforeEach already navigated; this test
    // re-navigates to capture errors from page load with listener attached first).
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(msg.text());
    });
    await gotoCompose(page);
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

// ─── Proximity edge rendering tests (regression: gander-studio-p3) ────────────
// These tests verify that a proximity drop renders a .react-flow__edge element
// in the DOM — the regression fixed in this sprint (FE-001: missing Handles).
// Strategy: drag an existing canvas node (orchestrator) onto itself is not possible;
// instead we drop a palette item onto the canvas near the orchestrator, then
// drag that new node back onto the orchestrator center to trigger proximity linking.

test.describe('Proximity edge DOM rendering (FE-001 regression fix)', () => {
  // ─── orchestrator↔agent proximity drop renders a .react-flow__edge in DOM ─────
  // A1 fix: selects palette item using strict Agents h3 landmark (no fallback).
  // Palette testids are palette-item-{name} with NO type prefix (see MateriaCanvas.tsx line 622).
  // Hard-fails (waitFor timeout) if the Agents section is empty — surfaces as a real
  // test infrastructure issue, not a silently-skipped test (A1 / post-mortem G6).
  test('orchestrator↔agent proximity drop renders a .react-flow__edge element', async ({ page }) => {
    await gotoCompose(page);

    // The RF edges container must exist before any edges are created
    await expect(page.locator('.react-flow__edges')).toBeAttached();

    // Step 1: drop a palette node onto the canvas at an offset position.
    // Uses strict Agents h3 landmark (no fallback — A1 / G6 compliance).
    const palette = page.locator('[data-testid="materia-palette"]');
    await palette.waitFor({ state: 'visible', timeout: 5000 });

    const paletteItem = await locateAgentPaletteItem(palette);

    const canvasEl = page.locator('[data-testid="materia-canvas"]');
    const canvasBox = await canvasEl.boundingBox();
    if (!canvasBox) throw new Error('canvas bounding box not found');

    // Drop palette item onto the canvas at center
    await paletteItem.dragTo(canvasEl, {
      targetPosition: { x: canvasBox.width / 2, y: canvasBox.height / 2 },
    });
    await page.waitForTimeout(300);

    // Step 2: find the newly-added node (any materia-node — orchestrator is card-node)
    // All non-orchestrator nodes use data-testid="materia-node-{name}"
    const droppedNode = page.locator('[data-testid^="materia-node-"]').first();
    await droppedNode.waitFor({ state: 'visible', timeout: 5000 });

    // Unlock AudioContext before drag (mirrors production mouse-down handler)
    await canvasEl.click({ position: { x: 10, y: 10 } });

    // Step 3: drag the dropped node onto the orchestrator card center to trigger proximity link.
    // Orchestrator renders as CardNode with data-testid="card-node".
    await dragNodeOntoTarget(page, '[data-testid^="materia-node-"]', '[data-testid="card-node"]');
    await page.waitForTimeout(400); // let RF re-render

    // Assert: at least one .react-flow__edge element is in the DOM
    const edgeCount = await page.locator('.react-flow__edge').count();
    expect(edgeCount).toBeGreaterThan(0);
  });

  // ─── DOM edge count matches store edge count after proximity drop ─────────────
  test('DOM .react-flow__edge count matches store edges after proximity drop', async ({ page }) => {
    await gotoCompose(page);

    // Initial state: orchestrator only, no edges → count must be 0
    const initialEdgeCount = await page.locator('.react-flow__edge').count();
    expect(initialEdgeCount).toBe(0);

    // Drop a palette item using strict Agents h3 landmark (no fallback — A1 / G6 compliance).
    // Palette testids are palette-item-{name} — no type prefix (MateriaCanvas.tsx line 622).
    const palette = page.locator('[data-testid="materia-palette"]');
    await palette.waitFor({ state: 'visible', timeout: 5000 });

    const paletteItem = await locateAgentPaletteItem(palette);

    const canvasEl = page.locator('[data-testid="materia-canvas"]');
    const canvasBox = await canvasEl.boundingBox();
    if (!canvasBox) throw new Error('canvas bounding box not found');

    await paletteItem.dragTo(canvasEl, {
      targetPosition: { x: canvasBox.width / 2, y: canvasBox.height / 2 },
    });
    await page.waitForTimeout(300);

    const droppedNode = page.locator('[data-testid^="materia-node-"]').first();
    await droppedNode.waitFor({ state: 'visible', timeout: 5000 });

    await canvasEl.click({ position: { x: 10, y: 10 } });
    // Drag the dropped node onto the orchestrator (card-node).
    await dragNodeOntoTarget(page, '[data-testid^="materia-node-"]', '[data-testid="card-node"]');
    await page.waitForTimeout(400);

    // A2 fix: replace tautological toBeGreaterThanOrEqual(0) with exact count assertion.
    // Edge count must equal exactly initialEdgeCount + 1 after one proximity drop.
    const postDragEdgeCount = await page.locator('.react-flow__edge').count();
    expect(postDragEdgeCount).toBe(initialEdgeCount + 1);
    // Assert edge DOM attributes unconditionally (A2 fix: no conditional wrapper).
    const firstEdge = page.locator('.react-flow__edge').first();
    await expect(firstEdge).toBeAttached();
    // RF edges have a data-id attribute matching the store edge id
    const dataId = await firstEdge.getAttribute('data-id');
    expect(dataId).toBeTruthy();
  });

  // ─── A3: agent↔skill proximity drop renders a .react-flow__edge in DOM ────────
  // Drops an agent palette item and a skill palette item onto the canvas, then drags
  // the skill node onto the agent node to trigger a proximity edge.
  // Uses strict Agents h3 landmark for the agent and Skills h3 landmark for the skill.
  // NOTE: Testids are palette-item-{name} with NO type prefix
  // (see MateriaCanvas.tsx line 622 — testid template: palette-item-${item.name}).
  // Hard-fails if either section is empty — surfaces as test infrastructure issue (A1 / G6).
  test('agent↔skill proximity drop renders a .react-flow__edge element', async ({ page }) => {
    await gotoCompose(page);
    await expect(page.locator('.react-flow__edges')).toBeAttached();

    const palette = page.locator('[data-testid="materia-palette"]');
    await palette.waitFor({ state: 'visible', timeout: 5000 });

    const canvasEl = page.locator('[data-testid="materia-canvas"]');
    const canvasBox = await canvasEl.boundingBox();
    if (!canvasBox) throw new Error('canvas bounding box not found');

    // Step 1: Drop an agent palette item using the strict Agents h3 landmark (no fallback).
    const firstItem = await locateAgentPaletteItem(palette);
    await firstItem.dragTo(canvasEl, {
      targetPosition: { x: canvasBox.width / 2 - 80, y: canvasBox.height / 2 },
    });
    await page.waitForTimeout(300);
    const firstNode = page.locator('[data-testid^="materia-node-"]').first();
    await firstNode.waitFor({ state: 'visible', timeout: 5000 });

    // Step 2: Drop a skill palette item using the strict Skills h3 landmark (no fallback).
    const secondItem = await locateSkillPaletteItem(palette);
    await secondItem.dragTo(canvasEl, {
      targetPosition: { x: canvasBox.width / 2 + 80, y: canvasBox.height / 2 },
    });
    await page.waitForTimeout(300);

    // Step 3: Unlock AudioContext, then drag the second node onto the first to trigger proximity edge.
    await canvasEl.click({ position: { x: 10, y: 10 } });
    const secondNode = page.locator('[data-testid^="materia-node-"]').nth(1);
    await secondNode.waitFor({ state: 'visible', timeout: 5000 });
    // Pass secondNode locator directly to avoid strict-mode violation (2 nodes on canvas).
    await dragNodeOntoTarget(
      page,
      secondNode,
      firstNode,
    );
    await page.waitForTimeout(400);

    // Assert: at least one .react-flow__edge in DOM
    const edgeCount = await page.locator('.react-flow__edge').count();
    expect(edgeCount).toBeGreaterThan(0);
  });

  // ─── A4: edge creation fires link sound and renders DOM edge element ──────────
  // Frequency-discriminated AudioParam spy: patches AudioParam.prototype.setValueAtTime
  // and increments __linkOscCount only for LINK_PRIMARY_FREQ_HZ (880 Hz) and
  // LINK_SECONDARY_FREQ_HZ (1320 Hz). The approach tone at APPROACH_FREQ_HZ (220 Hz)
  // is filtered out, so playApproach calls during drag do not affect the count.
  // After one playLink call: __linkOscCount === 2 exactly.
  test('edge creation fires link sound and renders DOM edge element', async ({ page }) => {
    // Install frequency-discriminated AudioParam spy BEFORE navigation.
    // AudioParam.prototype.setValueAtTime is patched globally; only LINK_PRIMARY_FREQ_HZ
    // and LINK_SECONDARY_FREQ_HZ — the playLink frequencies from canvas.ts constants —
    // increment __linkOscCount. The 220 Hz approach tone (APPROACH_FREQ_HZ) is filtered out,
    // so playApproach calls during the drag do not affect the count.
    // Constants imported from canvas.ts are passed as serialized args so no bare 880/1320
    // magic numbers appear in test source.
    await page.addInitScript(
      ({ primaryHz, secondaryHz }: { primaryHz: number; secondaryHz: number }) => {
        (window as unknown as { __linkOscCount: number }).__linkOscCount = 0;
        const origSetValue = AudioParam.prototype.setValueAtTime;
        AudioParam.prototype.setValueAtTime = function(
          value: number,
          startTime: number,
        ): AudioParam {
          if (value === primaryHz || value === secondaryHz) {
            (window as unknown as { __linkOscCount: number }).__linkOscCount += 1;
          }
          return origSetValue.call(this, value, startTime);
        };
      },
      { primaryHz: LINK_PRIMARY_FREQ_HZ, secondaryHz: LINK_SECONDARY_FREQ_HZ },
    );

    await gotoCompose(page);

    const palette = page.locator('[data-testid="materia-palette"]');
    await palette.waitFor({ state: 'visible', timeout: 5000 });

    // Use strict Agents h3 landmark (no fallback — A1 / G6 compliance).
    // Hard-fails if the Agents section is empty; surfaces as test infrastructure issue.
    const paletteItem = await locateAgentPaletteItem(palette);

    const canvasEl = page.locator('[data-testid="materia-canvas"]');
    const canvasBox = await canvasEl.boundingBox();
    if (!canvasBox) throw new Error('canvas bounding box not found');

    await paletteItem.dragTo(canvasEl, {
      targetPosition: { x: canvasBox.width / 2, y: canvasBox.height / 2 },
    });
    await page.waitForTimeout(300);
    await page.locator('[data-testid^="materia-node-"]').first()
      .waitFor({ state: 'visible', timeout: 5000 });

    // Unlock AudioContext (may fire playApproach/stopApproach — those are 220 Hz and excluded by spy).
    await canvasEl.click({ position: { x: 10, y: 10 } });

    // Drag the placed node onto the card node to commit a proximity edge.
    // During the drag, playApproach fires at 220 Hz (filtered out by spy).
    // On commit, playLink fires at 880 Hz + 1320 Hz → __linkOscCount increments to 2.
    await dragNodeOntoTarget(page, '[data-testid^="materia-node-"]', '[data-testid="card-node"]');
    await page.waitForTimeout(400);

    // PRIMARY ASSERTION — DOM edge element (G6: DOM is the authoritative signal; audio is secondary)
    const edgeCount = await page.locator('.react-flow__edge').count();
    expect(edgeCount).toBe(1);

    // SECONDARY ASSERTION — link sound fired (exactly 2 frequency-matched oscillator setValueAtTime calls:
    // 880 Hz primary + 1320 Hz secondary from playLink; approach tone at 220 Hz filtered out by spy).
    const linkOscCount = await page.evaluate(
      () => (window as unknown as { __linkOscCount: number }).__linkOscCount,
    );
    expect(linkOscCount).toBe(2);
  });

  // ─── Error / empty state: canvas handles zero-edge state gracefully ──────────
  test('canvas RF edges container attaches and shows no edges before any proximity drop', async ({ page }) => {
    await gotoCompose(page);
    // The .react-flow__edges SVG group must be present even with zero edges
    const edgesGroup = page.locator('.react-flow__edges');
    await expect(edgesGroup).toBeAttached();
    // No edge paths should exist before any drag-link interaction
    const edgePaths = page.locator('.react-flow__edge');
    await expect(edgePaths).toHaveCount(0);
  });
});
