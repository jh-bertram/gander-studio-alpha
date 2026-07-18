/**
 * prog-studio-v2-2026-07-s4-retirement-FE-CAT.spec.ts
 * Tier-2 e2e — the 13-role Roster Catalog surface (PM packet
 * `prog-studio-v2-2026-07-s4-retirement-rev3-PM-1783715959.md`, task FE-CAT).
 *
 * Live server required: port 5173 (Vite dev, proxying /trpc to :3001) against a real 13-member
 * ROSTER corpus for the live-data tests. All card-count assertions use DOM-presence (a real
 * `button[aria-label]` count under the catalog root), never a side-effect proxy.
 *
 * Reachability note: the catalog's empty/error branches are not reachable via a live-data user
 * flow this sprint — the persistent CTA only renders on the POPULATED party home, and the
 * empty-state CTA that will reach catalog with a genuinely-empty roster is FE-4's future
 * re-point. Those two tests pre-seed the zustand-persisted `activeMode` via `localStorage`
 * (zustand persist's default `merge` spreads ANY key present in storage over the initial state,
 * regardless of what `partialize` excludes on save — verified against node_modules/zustand's
 * middleware.mjs) so the app boots directly onto the catalog page under a mocked query result.
 */
import { test, expect, type Page } from '@playwright/test';

const BASE_URL = 'http://localhost:5173';
const DESKTOP_VIEWPORT = { width: 1280, height: 800 };
const PARTY_CAP = 6; // PartyPage.tsx PARTY_GRID_DISPLAY_CAP — the cap the catalog must exceed.

/** Goes to the default route and waits for the populated party home to mount. */
async function gotoParty(page: Page): Promise<void> {
  await page.setViewportSize(DESKTOP_VIEWPORT);
  await page.goto(BASE_URL);
  await expect(page.getByTestId('party-page')).toBeVisible({ timeout: 10000 });
}

/** Boots the app directly onto the catalog page with a mocked `roster.getParty` response. */
async function gotoCatalogWithMockedParty(page: Page, body: string): Promise<void> {
  await page.route('**/trpc/roster.getParty**', async (route) => {
    await route.fulfill({ status: 200, contentType: 'application/json', body });
  });
  await page.addInitScript(() => {
    localStorage.setItem('gander-ui-store', JSON.stringify({ state: { activeMode: 'catalog', muted: false }, version: 0 }));
  });
  await page.setViewportSize(DESKTOP_VIEWPORT);
  await page.goto(BASE_URL);
}

const EMPTY_PARTY_BODY = JSON.stringify([
  {
    result: {
      data: {
        members: [],
        diagnostics: { totalRawLines: 0, validEntries: 0, invalidLineCount: 0, invalidLineSamples: [], distinctEventTypes: 0, uncountedEventTypes: 0 },
        activityAnchor: 0,
      },
    },
  },
]);

// ================================================================================
// (a) persistent CTA on the populated party home routes to the catalog
// ================================================================================

test('persistent CTA: populated party home shows "View Full Roster" and routes to the catalog', async ({ page }) => {
  await gotoParty(page);
  await expect(page.getByTestId('party-page').locator('button[aria-label]').first()).toBeVisible({ timeout: 10000 });

  const cta = page.getByRole('button', { name: 'View Full Roster' });
  await expect(cta).toBeVisible();
  await cta.click();

  await expect(page.getByTestId('roster-catalog-page')).toBeVisible({ timeout: 10000 });
});

// ================================================================================
// (b) catalog renders the FULL roster, uncapped — DOM-presence card count
// ================================================================================

test('catalog default: renders every roster member uncapped, beyond the party 6-card cap', async ({ page }) => {
  await gotoParty(page);
  await page.getByRole('button', { name: 'View Full Roster' }).click();

  const catalog = page.getByTestId('roster-catalog-page');
  await expect(catalog).toBeVisible({ timeout: 10000 });

  const cards = catalog.locator('button[aria-label]');
  await expect(cards.first()).toBeVisible({ timeout: 10000 });
  expect(await cards.count()).toBeGreaterThan(PARTY_CAP);
});

// ================================================================================
// (b) honest empty / error states — mocked, DOM-presence, no hardcoded role count
// ================================================================================

test('catalog empty: honest empty state renders when the roster query yields zero members', async ({ page }) => {
  await gotoCatalogWithMockedParty(page, EMPTY_PARTY_BODY);

  const catalog = page.getByTestId('roster-catalog-page');
  await expect(catalog).toBeVisible({ timeout: 10000 });
  await expect(catalog.locator('[role="status"]')).toBeVisible({ timeout: 10000 });
  await expect(page.getByRole('heading', { name: 'No Roster Data Available' })).toBeVisible();
  expect(await catalog.locator('button[aria-label]').count()).toBe(0);
});

test('catalog error: honest error alert with Retry renders when the roster query fails', async ({ page }) => {
  await page.route('**/trpc/roster.getParty**', (route) => route.abort('failed'));
  await page.addInitScript(() => {
    localStorage.setItem('gander-ui-store', JSON.stringify({ state: { activeMode: 'catalog', muted: false }, version: 0 }));
  });
  await page.setViewportSize(DESKTOP_VIEWPORT);
  await page.goto(BASE_URL);

  const catalog = page.getByTestId('roster-catalog-page');
  await expect(catalog).toBeVisible({ timeout: 10000 });
  const alert = catalog.locator('[role="alert"]');
  await expect(alert).toBeVisible({ timeout: 10000 });
  await expect(alert).toContainText("Couldn't load party data");
  await expect(page.getByRole('button', { name: 'Retry' })).toBeVisible();
});

// ================================================================================
// (c) keyboard operability — CTA activation and catalog card selection
// ================================================================================

test('a11y: CTA is keyboard-activatable, and a catalog card is keyboard-selectable to agent-detail', async ({ page }) => {
  await gotoParty(page);
  const cta = page.getByRole('button', { name: 'View Full Roster' });
  await cta.focus();
  await expect(cta).toBeFocused();
  await page.keyboard.press('Enter');

  const catalog = page.getByTestId('roster-catalog-page');
  await expect(catalog).toBeVisible({ timeout: 10000 });

  const firstCard = catalog.locator('button[aria-label]').first();
  await expect(firstCard).toBeVisible({ timeout: 10000 });
  await firstCard.focus();
  await expect(firstCard).toBeFocused();
  await page.keyboard.press('Enter');

  await expect(page.getByTestId('agent-detail-page')).toBeVisible({ timeout: 8000 });
});
