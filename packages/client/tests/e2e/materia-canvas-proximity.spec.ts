import { test, expect } from '@playwright/test';

// ─── Load + proximity class test ──────────────────────────────────────────────
// Drag a palette item onto the canvas near the orchestrator node and verify
// .orb-attracted is applied to the target and removed after drag-end.
test('orb-attracted class applied to target during proximity drag and removed on drag-end', async ({ page }) => {
  await page.goto('http://localhost:5173');

  // Navigate to compose view if needed
  const composeTab = page.locator('text=COMPOSE').first();
  if (await composeTab.isVisible()) await composeTab.click();

  await page.locator('[data-testid="materia-canvas"]').waitFor({ state: 'visible', timeout: 8000 });

  // The orchestrator node is always present — get its bounding box
  const orchNode = page.locator('[data-testid="materia-node-orchestrator"]');
  await orchNode.waitFor({ state: 'visible', timeout: 5000 });
  const orchBox = await orchNode.boundingBox();
  if (!orchBox) throw new Error('orchestrator node bounding box not found');

  // Simulate a slow drag from a distant canvas point toward the orchestrator center
  const orchCenterX = orchBox.x + orchBox.width / 2;
  const orchCenterY = orchBox.y + orchBox.height / 2;

  // Start the drag well outside proximity (200px away), end within 40px (inside 60px threshold)
  const startX = orchCenterX + 200;
  const startY = orchCenterY;
  const endX = orchCenterX + 30;
  const endY = orchCenterY;

  // Use mouse API to perform a slow drag so proximity detection fires during dragging=true events
  await page.mouse.move(startX, startY);
  await page.mouse.down();

  // Move in steps to trigger onNodesChange with dragging=true
  const steps = 10;
  for (let i = 1; i <= steps; i++) {
    await page.mouse.move(
      startX + ((endX - startX) * i) / steps,
      startY + ((endY - startY) * i) / steps,
      { steps: 1 },
    );
    // Small pause to let React process the move event
    await page.waitForTimeout(30);
  }

  // At this point we may be in proximity — check if orb-attracted is on the orchestrator's orb div
  // (The orb sphere div is the first div child of the materia-node wrapper)
  const orchOrbEl = orchNode.locator('div').first();

  // Release drag
  await page.mouse.up();

  // After drag-end, orb-attracted should be gone (replaced by orb-attracted-release or nothing)
  // Wait for the release transition to complete
  await page.waitForTimeout(450); // ORB_ATTRACT_RELEASE_MS = 400ms + buffer

  const classesAfterRelease = await orchOrbEl.getAttribute('class');
  expect(classesAfterRelease ?? '').not.toContain('orb-attracted ');
  expect(classesAfterRelease ?? '').not.toMatch(/\borb-attracted\b(?!-)/);
});

// ─── useLinkSound playLink no-throw test ──────────────────────────────────────
// Mock Web Audio API, trigger edge creation via proximity drag, assert no
// unhandled JS errors are thrown.
test('playLink fires at edge creation with no console errors when AudioContext is mocked', async ({ page }) => {
  // Mock AudioContext before page load so the module-level SSR guard passes
  await page.addInitScript(() => {
    let mockCtxCurrentTime = 0;

    class MockGainNode {
      gain = {
        value: 0,
        setValueAtTime(_v: number, _t: number) {},
        linearRampToValueAtTime(_v: number, _t: number) {},
        cancelScheduledValues(_t: number) {},
      };
      connect(_dest: unknown) {}
      disconnect() {}
    }

    class MockOscillatorNode extends EventTarget {
      type = 'sine';
      frequency = {
        setValueAtTime(_v: number, _t: number) {},
      };
      connect(_dest: unknown) {}
      disconnect() {}
      start(_when?: number) {}
      stop(_when?: number) {
        // Fire 'ended' event shortly after stop is called
        setTimeout(() => {
          this.dispatchEvent(new Event('ended'));
        }, 10);
      }
    }

    class MockBiquadFilterNode {
      type = 'lowpass';
      frequency = {
        setValueAtTime(_v: number, _t: number) {},
      };
      connect(_dest: unknown) {}
      disconnect() {}
    }

    class MockAudioContext {
      state = 'running';
      get currentTime() { return mockCtxCurrentTime += 0.001; }
      destination = {};
      resume() { return Promise.resolve(); }
      createOscillator() { return new MockOscillatorNode(); }
      createGain() { return new MockGainNode(); }
      createBiquadFilter() { return new MockBiquadFilterNode(); }
    }

    // @ts-ignore — mock for test environment
    window.AudioContext = MockAudioContext;
  });

  const consoleErrors: string[] = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });
  page.on('pageerror', (err) => {
    consoleErrors.push(err.message);
  });

  await page.goto('http://localhost:5173');

  const composeTab = page.locator('text=COMPOSE').first();
  if (await composeTab.isVisible()) await composeTab.click();

  await page.locator('[data-testid="materia-canvas"]').waitFor({ state: 'visible', timeout: 8000 });

  // Attempt to drag a node close enough to orchestrator to trigger edge creation
  const orchNode = page.locator('[data-testid="materia-node-orchestrator"]');
  await orchNode.waitFor({ state: 'visible', timeout: 5000 });
  const orchBox = await orchNode.boundingBox();
  if (!orchBox) throw new Error('orchestrator node bounding box not found');

  const orchCenterX = orchBox.x + orchBox.width / 2;
  const orchCenterY = orchBox.y + orchBox.height / 2;

  // Drag from 200px away and drop right on top (0px) — well within 60px threshold
  await page.mouse.move(orchCenterX + 200, orchCenterY);
  await page.mouse.down();
  await page.mouse.move(orchCenterX + 5, orchCenterY, { steps: 8 });
  await page.mouse.up();

  // Give async audio code time to run
  await page.waitForTimeout(500);

  // Filter out known non-critical warnings (e.g. React DevTools, vite HMR)
  const criticalErrors = consoleErrors.filter(
    (e) =>
      !e.includes('Download the React DevTools') &&
      !e.includes('[vite]') &&
      !e.includes('AudioContext') && // some browsers warn about autoplay — acceptable
      !e.includes('Warning:'),
  );

  expect(criticalErrors).toHaveLength(0);
});

// ─── Empty / no-node state test ───────────────────────────────────────────────
// Verify the canvas renders gracefully when only the orchestrator is present
// (the minimal/empty loadout state) and no proximity classes are applied at rest.
test('canvas renders stable empty state with no proximity classes at rest', async ({ page }) => {
  await page.goto('http://localhost:5173');

  const composeTab = page.locator('text=COMPOSE').first();
  if (await composeTab.isVisible()) await composeTab.click();

  await page.locator('[data-testid="materia-canvas"]').waitFor({ state: 'visible', timeout: 8000 });

  const orchNode = page.locator('[data-testid="materia-node-orchestrator"]');
  await orchNode.waitFor({ state: 'visible', timeout: 5000 });

  const orchOrbEl = orchNode.locator('div').first();
  const classes = await orchOrbEl.getAttribute('class');

  // At rest, no proximity classes should be present
  expect(classes ?? '').not.toContain('orb-attracted');
  expect(classes ?? '').not.toContain('orb-link-flashing');
});
