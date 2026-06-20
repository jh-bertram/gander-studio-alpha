/**
 * prog-studio-vision-s4-mute.spec.ts
 *
 * s4-p7 live a11y e2e — Mute control verification.
 *
 * Verifies:
 *   1. Mute toggle is visible, keyboard-navigable, and aria-pressed reflects state.
 *   2. After toggling mute the aria-pressed attribute changes (state persisted).
 *   3. When muted, the audio gate is active — verified by asserting aria-pressed=true
 *      (the runtime gate inside useLinkSound is synchronous on getState().muted;
 *      we cannot attach a real AudioContext spy cross-origin, so we confirm the
 *      control surface that gates audio is correctly armed).
 *
 * Runs against the LIVE dev stack (http://localhost:5173).
 */

import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:5173';

test.describe('Mute control — s4-p1 suppression foundation', () => {
  test('Load: mute toggle is visible in the header and keyboard-accessible', async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });

    await page.goto(BASE_URL);

    // Mute toggle must be in DOM and visible (data-testid set by s4-p1)
    const muteBtn = page.getByTestId('mute-toggle');
    await expect(muteBtn).toBeVisible({ timeout: 8000 });

    // Must be a native button — keyboard-navigable by default
    const tagName = await muteBtn.evaluate((el) => el.tagName.toLowerCase());
    expect(tagName).toBe('button');

    // aria-pressed is required (ARIA toggle pattern)
    const ariaPressed = await muteBtn.getAttribute('aria-pressed');
    expect(ariaPressed).not.toBeNull();
    // Initial state: not muted (localStorage may be set from prior runs — accept either)
    expect(['true', 'false']).toContain(ariaPressed);

    // aria-label must describe action
    const ariaLabel = await muteBtn.getAttribute('aria-label');
    expect(ariaLabel).toMatch(/mute|unmute/i);

    // Minimum touch-target size (44×44 per s4-p1 spec)
    const box = await muteBtn.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.width).toBeGreaterThanOrEqual(44);
    expect(box!.height).toBeGreaterThanOrEqual(44);

    // No JS errors on load
    expect(consoleErrors).toHaveLength(0);
  });

  test('Primary interaction: clicking mute toggle flips aria-pressed and persists', async ({ page }) => {
    await page.goto(BASE_URL);

    const muteBtn = page.getByTestId('mute-toggle');
    await expect(muteBtn).toBeVisible({ timeout: 8000 });

    // Read initial state
    const initialPressed = await muteBtn.getAttribute('aria-pressed');

    // Click to toggle
    await muteBtn.click();

    // aria-pressed must flip
    const afterFirstClick = await muteBtn.getAttribute('aria-pressed');
    const expectedAfterFirst = initialPressed === 'true' ? 'false' : 'true';
    expect(afterFirstClick).toBe(expectedAfterFirst);

    // Click again to toggle back
    await muteBtn.click();
    const afterSecondClick = await muteBtn.getAttribute('aria-pressed');
    expect(afterSecondClick).toBe(initialPressed);

    // DOM-presence guard: button still in DOM after toggling
    await expect(muteBtn).toBeAttached();
  });

  test('Mute gate: when muted, aria-pressed=true confirms audio gate is armed', async ({ page }) => {
    await page.goto(BASE_URL);

    const muteBtn = page.getByTestId('mute-toggle');
    await expect(muteBtn).toBeVisible({ timeout: 8000 });

    // Ensure we are in the muted state (toggle until aria-pressed=true)
    const currentPressed = await muteBtn.getAttribute('aria-pressed');
    if (currentPressed !== 'true') {
      await muteBtn.click();
    }

    // Confirm muted state
    await expect(muteBtn).toHaveAttribute('aria-pressed', 'true');

    // The useLinkSound gate is: if (useUIStore.getState().muted) return;
    // Verify the store value via localStorage (persist middleware writes it)
    const storedValue = await page.evaluate(() => {
      const raw = localStorage.getItem('gander-ui-store');
      if (!raw) return null;
      try {
        const parsed = JSON.parse(raw) as { state?: { muted?: boolean } };
        return parsed?.state?.muted ?? null;
      } catch {
        return null;
      }
    });
    // When muted=true is persisted, the gate will fire on next playApproach/playLink call
    expect(storedValue).toBe(true);

    // DOM-presence guard: mute button present with correct visual state
    await expect(muteBtn).toBeAttached();

    // Keyboard navigation: Space key also toggles (onKeyDown handler)
    await muteBtn.focus();
    await page.keyboard.press('Space');
    const afterSpace = await muteBtn.getAttribute('aria-pressed');
    expect(afterSpace).toBe('false');

    // Reset to unmuted for other tests
    const finalPressed = await muteBtn.getAttribute('aria-pressed');
    if (finalPressed === 'true') {
      await muteBtn.click();
    }
  });
});
