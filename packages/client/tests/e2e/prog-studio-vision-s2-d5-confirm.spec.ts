/**
 * prog-studio-vision-2026-06-s2 — D5 confirm
 *
 * Verifies that ExportPage's two Input fields (Base Directory + Target Directory)
 * render legible typed text under the s1 token contract:
 *   --foreground = var(--w) = #ffffff
 *
 * The Input component uses text-foreground (Tailwind → --foreground → #ffffff).
 * ExportPage applies style={{ background: 'var(--sfm)' }} (#122420) to both
 * inputs, so the effective background is dark and the foreground white.
 * No per-instance color override is needed — this test confirms that invariant.
 *
 * WCAG target: text-foreground (#ffffff) on --sfm (#122420) → ~17:1 AAA.
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

/** Parse an rgb/rgba color string to [r, g, b, a] in 0–255 range. */
function parseRgb(css: string): [number, number, number, number] {
  const m = css.match(/rgba?\((\d+(?:\.\d+)?),\s*(\d+(?:\.\d+)?),\s*(\d+(?:\.\d+)?)(?:,\s*(\d+(?:\.\d+)?))?\)/);
  if (!m) return [0, 0, 0, 1];
  return [
    parseFloat(m[1]),
    parseFloat(m[2]),
    parseFloat(m[3]),
    m[4] !== undefined ? parseFloat(m[4]) : 1,
  ];
}

/** WCAG sRGB linearisation */
function linearise(c: number): number {
  const v = c / 255;
  return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
}

/** Relative luminance */
function luminance(r: number, g: number, b: number): number {
  return 0.2126 * linearise(r) + 0.7152 * linearise(g) + 0.0722 * linearise(b);
}

/** WCAG contrast ratio */
function contrastRatio(l1: number, l2: number): number {
  const lighter = Math.max(l1, l2);
  const darker  = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

// ─── Test 1: Load — ExportPage input fields are visible ───────────────────────

test('D5-confirm: ExportPage inputs are visible on dark surface', async ({ page }) => {
  await navigateToExport(page);

  const baseInput   = page.getByPlaceholder('/home/user/projects');
  const targetInput = page.getByPlaceholder('my-project');

  await expect(baseInput).toBeVisible({ timeout: 5000 });
  await expect(targetInput).toBeVisible({ timeout: 5000 });
});

// ─── Test 2: Primary — typed text is legible (WCAG AA) in both inputs ────────

test('D5-confirm: typed text in both ExportPage inputs has WCAG AA contrast (>= 4.5:1)', async ({ page }) => {
  await navigateToExport(page);

  const baseInput   = page.getByPlaceholder('/home/user/projects');
  const targetInput = page.getByPlaceholder('my-project');

  // Type into each input so computed color applies to rendered text
  await baseInput.fill('/home/test/projects');
  await targetInput.fill('test-export');

  // Read computed styles for both inputs via evaluate
  const baseStyles = await baseInput.evaluate((el: HTMLInputElement) => {
    const cs = window.getComputedStyle(el);
    // Ancestor walk for background (Input has bg-transparent)
    let ancestor: Element | null = el;
    let bg = 'rgba(0, 0, 0, 0)';
    while (ancestor && ancestor !== document.documentElement) {
      const acs = window.getComputedStyle(ancestor);
      if (acs.backgroundColor !== 'rgba(0, 0, 0, 0)' && acs.backgroundColor !== 'transparent') {
        bg = acs.backgroundColor;
        break;
      }
      ancestor = ancestor.parentElement;
    }
    if (bg === 'rgba(0, 0, 0, 0)') {
      bg = window.getComputedStyle(document.body).backgroundColor;
    }
    return { color: cs.color, bg };
  });

  const targetStyles = await targetInput.evaluate((el: HTMLInputElement) => {
    const cs = window.getComputedStyle(el);
    let ancestor: Element | null = el;
    let bg = 'rgba(0, 0, 0, 0)';
    while (ancestor && ancestor !== document.documentElement) {
      const acs = window.getComputedStyle(ancestor);
      if (acs.backgroundColor !== 'rgba(0, 0, 0, 0)' && acs.backgroundColor !== 'transparent') {
        bg = acs.backgroundColor;
        break;
      }
      ancestor = ancestor.parentElement;
    }
    if (bg === 'rgba(0, 0, 0, 0)') {
      bg = window.getComputedStyle(document.body).backgroundColor;
    }
    return { color: cs.color, bg };
  });

  // Assert Base Directory input
  expect(baseStyles.bg, 'Base Directory input background must not be transparent').not.toBe('rgba(0, 0, 0, 0)');
  expect(baseStyles.color, 'Base Directory input text must differ from background').not.toBe(baseStyles.bg);

  const [br, bg, bb] = parseRgb(baseStyles.bg);
  const [fcr, fcg, fcb, fca] = parseRgb(baseStyles.color);
  // Composite alpha for semi-transparent foreground colors
  const sr = fcr * fca + br * (1 - fca);
  const sg = fcg * fca + bg * (1 - fca);
  const sb = fcb * fca + bb * (1 - fca);
  const fgL = luminance(sr, sg, sb);
  const bgL = luminance(br, bg, bb);
  const baseContrast = contrastRatio(fgL, bgL);

  expect(
    baseContrast,
    `Base Directory input contrast ${baseContrast.toFixed(2)}:1 must be >= 4.5:1 (WCAG AA)`,
  ).toBeGreaterThanOrEqual(4.5);

  // Assert Target Directory input
  expect(targetStyles.bg, 'Target Directory input background must not be transparent').not.toBe('rgba(0, 0, 0, 0)');
  expect(targetStyles.color, 'Target Directory input text must differ from background').not.toBe(targetStyles.bg);

  const [tr, tg, tb] = parseRgb(targetStyles.bg);
  const [tfr, tfg, tfb, tfa] = parseRgb(targetStyles.color);
  const tsr = tfr * tfa + tr * (1 - tfa);
  const tsg = tfg * tfa + tg * (1 - tfa);
  const tsb = tfb * tfa + tb * (1 - tfa);
  const tfgL = luminance(tsr, tsg, tsb);
  const tbgL = luminance(tr, tg, tb);
  const targetContrast = contrastRatio(tfgL, tbgL);

  expect(
    targetContrast,
    `Target Directory input contrast ${targetContrast.toFixed(2)}:1 must be >= 4.5:1 (WCAG AA)`,
  ).toBeGreaterThanOrEqual(4.5);
});

// ─── Test 3: Body token check — page foreground is near-white (s1 token active) ─
//
// NOTE: canvas-store initialises with one orchestrator node, so the "No loadout
// composed" empty state never shows on fresh load. The original empty-state
// assumption was incorrect. This test verifies the s1 token contract instead:
// body foreground is white (#ffffff) on the FF7 Mako dark surface.

test('D5-confirm: ExportPage body text uses near-white foreground (s1 token --w active)', async ({ page }) => {
  await navigateToExport(page);

  const exportPage = page.getByTestId('export-page');
  await expect(exportPage).toBeVisible({ timeout: 5000 });

  // The canvas starts with 1 orchestrator node — loadout is non-empty,
  // the Summary panel (not the empty-state) should render.
  // We assert the summary panel is present and the page is not crashing.
  await expect(exportPage).toContainText('1 agents');

  // Verify the page body text is white (s1 token confirmed active)
  const bodyColor = await page.evaluate(() => window.getComputedStyle(document.body).color);
  const [r, g, b] = parseRgb(bodyColor);
  // white = all channels > 200 (out of 255)
  expect(r, 'Body foreground R channel should be near-white after s1 fix').toBeGreaterThan(200);
  expect(g, 'Body foreground G channel should be near-white after s1 fix').toBeGreaterThan(200);
  expect(b, 'Body foreground B channel should be near-white after s1 fix').toBeGreaterThan(200);
});
