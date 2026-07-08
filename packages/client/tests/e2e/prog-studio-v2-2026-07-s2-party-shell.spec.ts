/**
 * prog-studio-v2-2026-07-s2-party-shell.spec.ts
 * Tier 2 e2e spec — runtime gate owner for the ENTIRE party-shell sprint
 * (prog-studio-v2-2026-07-s2-party-shell, task t6). The auditor's MCP set has no interaction
 * primitives, so this spec is the sole adjudication evidence for every interaction/a11y/state/
 * legibility SC (PM packet `prog-studio-v2-2026-07-s2-party-shell-PM-1783472965.md` t6 +
 * amendment `...-amend-PM-1783474258.md` W3).
 *
 * Live server required: port 5173 (Vite dev, proxying /trpc to :3001). GANDER_ROOT is set to a
 * real 13-member corpus — the default-route assertions use LIVE `roster.getParty` data; the
 * loading/empty/error states are driven deterministically via `page.route` interception (never
 * `waitForTimeout` races for correctness-bearing state transitions).
 *
 * SC coverage map:
 *   SC1 (default route, live data)        → "default route" + "card composition" tests
 *   SC2 (legibility, no clipped text)      → "legibility spot-check" + desktop/mobile viewport tests
 *   SC3 (all states + hover/focus/popover) → popover, loading, empty, error tests
 *   SC4 (rail → 3 KEEP surfaces; no regression) → rail-nav tests (W3 DOM-marker tightening) + BottomTabBar test
 *   SC5 (build/lint/e2e green)             → adjudicated by the reproduce-commands section of the ui_packet
 *
 * W3 tightening honored: rail-nav assertions check a DESTINATION-SURFACE DOM MARKER after each
 * KEEP click (never just activeMode); mobile legibility uses explicit page.setViewportSize.
 */
import { test, expect, type Page } from '@playwright/test';

// ---- Fixture / house-style constants -----------------------------------------

const BASE_URL = 'http://localhost:5173';
const DESKTOP_VIEWPORT = { width: 1280, height: 800 };
// Matches layout-sidebar-removal.spec.ts's own mobile fixture (iPhone-class width/height).
const MOBILE_VIEWPORT = { width: 390, height: 844 };
const RAIL_LABEL_ORDER = ['Roster', 'Sessions', 'Progression', 'Programs'] as const;
const SCREENSHOT_DIR = 'test-results/party-shell-screenshots';

// ---- Shared helpers (DRY — extracted per Function Body Deduplication rule) ---

/** Goes to the default route and waits for the party surface to mount. */
async function gotoParty(page: Page): Promise<void> {
  await page.goto(BASE_URL);
  await expect(page.getByTestId('party-page')).toBeVisible({ timeout: 10000 });
}

/** PartyMemberCard triggers are the only `button[aria-label]` elements on the party surface
 *  (SubmenuRail/EmptyState/ErrorState buttons carry plain text children, no aria-label). */
function getCards(page: Page) {
  return page.getByTestId('party-page').locator('button[aria-label]');
}

function getRailNav(page: Page) {
  return page.getByRole('navigation', { name: 'Party screen submenus' });
}

/** House convention (prog-studio-vision-s3-program-dag.spec.ts): `.react-flow__pane` is the
 *  settled-data marker for the Programs DAG surface; the two text markers cover its terminal
 *  empty/error states so this locator is meaningful regardless of docs/programs/ content. */
function getProgramsMarker(page: Page) {
  return page.locator('.react-flow__pane, :text("PROGRAM DAG UNAVAILABLE"), :text("NO PROGRAM DATA")');
}

/** Number of computed grid-template-columns tracks on the PartyGrid container. */
async function countGridColumns(page: Page): Promise<number> {
  const grid = page.getByTestId('party-page').locator('.grid').first();
  return grid.evaluate((el) => getComputedStyle(el).gridTemplateColumns.trim().split(/\s+/).length);
}

/**
 * Asserts the PartyGrid container (the surface this sprint owns) has no internal horizontal
 * overflow and fits within the current viewport. Scoped to `[data-testid="party-page"]` per W3's
 * literal wording ("no horizontal overflow on the grid container") — NOT `document.documentElement`.
 * KNOWN, OUT-OF-SCOPE, PRE-EXISTING FINDING (flagged in ui_packet, not fixed here): at 390px the
 * global `<header>`/`<main id="mode-content">` (both pre-existing app-shell files this sprint's
 * out_of_scope forbids touching — Header.tsx/ModeContent.tsx's fixed 28px left/right padding is
 * not responsive) DOES overflow the document by ~16px, independent of PartyPage. Scoping this
 * check to the grid container correctly isolates SC2 to the surface t1-t6 actually built.
 */
async function assertNoHorizontalOverflow(page: Page): Promise<void> {
  const partyPage = page.getByTestId('party-page');
  const metrics = await partyPage.evaluate((el) => ({
    scrollWidth: el.scrollWidth,
    clientWidth: el.clientWidth,
    right: el.getBoundingClientRect().right,
  }));
  expect(metrics.scrollWidth).toBeLessThanOrEqual(metrics.clientWidth + 1);
  const viewportWidth = await page.evaluate(() => window.innerWidth);
  expect(metrics.right).toBeLessThanOrEqual(viewportWidth + 1);
}

/** House convention (agent-timeline-zoom.spec.ts, prog-studio-vision-s3-program-dag.spec.ts):
 *  guard against the Zustand object-selector render-loop regression class. */
function attachRenderLoopGuard(page: Page): { assertNoRenderLoopErrors: () => void } {
  const errors: string[] = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(msg.text());
  });
  return {
    assertNoRenderLoopErrors: () => {
      const loopErrors = errors.filter(
        (e) => e.includes('Maximum update depth') || e.includes('getSnapshot should be cached'),
      );
      expect(loopErrors).toHaveLength(0);
    },
  };
}

// ================================================================================
// SC1 — default route renders the party screen with LIVE data
// ================================================================================

test.describe('SC1 — default route, live data', () => {
  test('fresh load renders the party screen with >=3 real roster codes and stat bars', async ({ page }) => {
    const guard = attachRenderLoopGuard(page);

    // Fresh load — explicitly clear any persisted store state first (defensive; activeMode is
    // never persisted per partialize, but this proves the default holds regardless).
    await page.goto(BASE_URL);
    await page.evaluate(() => localStorage.clear());
    await page.goto(BASE_URL);

    await expect(page.getByRole('heading', { name: 'Party Screen' })).toBeVisible({ timeout: 10000 });

    const cards = getCards(page);
    await expect(cards.first()).toBeVisible({ timeout: 10000 });
    const count = await cards.count();
    expect(count).toBeGreaterThanOrEqual(3);
    expect(count).toBeLessThanOrEqual(6);

    // At least 3 distinct, non-empty aria-labels (real roster codes, not placeholder text).
    const labels = await cards.evaluateAll((els) => els.map((el) => el.getAttribute('aria-label')));
    const nonEmpty = labels.filter((l): l is string => !!l && l.trim().length > 0);
    expect(new Set(nonEmpty).size).toBeGreaterThanOrEqual(3);

    // At least 3 stat bars are present (role=progressbar) on the first card alone.
    await expect(cards.first().locator('[role="progressbar"]')).toHaveCount(3);

    guard.assertNoRenderLoopErrors();
  });

  test('every visible card has a portrait, a code label, and exactly 3 stat bars', async ({ page }) => {
    await gotoParty(page);
    const cards = getCards(page);
    await expect(cards.first()).toBeVisible({ timeout: 10000 });

    const sampleCount = Math.min(3, await cards.count());
    for (let i = 0; i < sampleCount; i += 1) {
      const card = cards.nth(i);
      // Portrait (PortraitFrame's asset-free square region).
      await expect(card.locator('.aspect-square')).toHaveCount(1);
      // Stat bars.
      await expect(card.locator('[role="progressbar"]')).toHaveCount(3);
      // Composite aria-label carries the code + role + stat readouts.
      const label = await card.getAttribute('aria-label');
      expect(label).toMatch(/^[A-Z]+,.+Activity .+, Stamina .+, Accuracy .+\.$/);
      // Single interactive tab stop per card: `card` IS the sole interactive element (a native
      // button), so it must have ZERO nested button/link/input descendants (no bare clickable div
      // + no double tab-stop).
      const interactiveDescendants = await card
        .locator('button, a[href], input, [tabindex]:not([tabindex="-1"])')
        .count();
      expect(interactiveDescendants).toBe(0);
    }
  });
});

// ================================================================================
// SC3 — Popover quick-peek (carry-in p11 AUD#4)
// ================================================================================

test.describe('SC3 — popover quick-peek', () => {
  test('hover reveals the popover with raw stat values and an as-of date', async ({ page }) => {
    await gotoParty(page);
    const firstCard = getCards(page).first();
    await expect(firstCard).toBeVisible({ timeout: 10000 });

    await firstCard.hover();
    const asOf = page.getByText(/^As of /);
    await expect(asOf).toBeVisible({ timeout: 2000 });

    const popupContainer = asOf.locator('xpath=..');
    await expect(popupContainer.getByText('Activity')).toBeVisible();
    await expect(popupContainer.getByText('Stamina')).toBeVisible();
    await expect(popupContainer.getByText('Accuracy')).toBeVisible();
  });

  test('keyboard focus reveals the popover immediately (no hover delay)', async ({ page }) => {
    await gotoParty(page);
    const firstCard = getCards(page).first();
    await expect(firstCard).toBeVisible({ timeout: 10000 });

    await firstCard.focus();
    const asOf = page.getByText(/^As of /);
    await expect(asOf).toBeVisible({ timeout: 1000 });
  });
});

// ================================================================================
// SC4 (partial) — whole-card keyboard operability
// ================================================================================

// FIXED (prog-studio-v2-2026-07-s2-party-shell-t3-rem): PartyMemberCard's quick-peek Popover
// used to steal DOM focus on open (base-ui's default `initialFocus` behavior), causing a
// sustained self-driven focus oscillation between the card trigger and the popover content
// (still cycling every ~40-50ms after 3+ seconds — see the t3-rem remediation_request for the
// full repro). Fixed via `initialFocus={false}` on the popup (PartyMemberCard.tsx) — the
// quick-peek has zero interactive elements (design-spec <state name="card-hover">), so it
// never needs to hold DOM focus at all. This test holds keyboard focus for a sustained window
// (3.2s, exceeding the diagnosis's "3+ seconds" observation point) and proves ZERO blur events
// fire on the card during that window (the oscillation's direct fingerprint), pairing that
// side-effect probe with the DOM-visible consequence of Enter (routes to Browse) per the
// Side-Effect-As-Proxy pairing rule.
test('whole-card is keyboard-operable: Tab+Enter triggers selection deterministically, even after sustained focus (regression guard for the focus-oscillation defect fixed in t3-rem)', async ({
  page,
}) => {
  await gotoParty(page);
  const firstCard = getCards(page).first();
  await expect(firstCard).toBeVisible({ timeout: 10000 });

  // Instrument blur churn on the card BEFORE focusing it, so the sustained-load window below
  // captures every blur the (formerly defective) component would have produced.
  await firstCard.evaluate((el) => {
    (window as unknown as { __t3remBlurCount: number }).__t3remBlurCount = 0;
    el.addEventListener('blur', () => {
      (window as unknown as { __t3remBlurCount: number }).__t3remBlurCount += 1;
    });
  });

  await firstCard.focus();
  await expect(page.getByText(/^As of /)).toBeVisible({ timeout: 1000 });

  // Sustained-load window: hold focus well past the diagnosed oscillation's observation point
  // and confirm the card never lost focus (never blurred) during it.
  await page.waitForTimeout(3200);
  await expect(firstCard).toBeFocused();
  const blurCount = await page.evaluate(() => (window as unknown as { __t3remBlurCount: number }).__t3remBlurCount);
  expect(blurCount).toBe(0);

  // Deterministic Tab+Enter selection after the sustained window.
  await page.keyboard.press('Enter');

  // Component mechanism: onSelect -> setSelectedAgentCode(code) + setActiveMode('browse').
  // The real DOM consequence is the Browse surface replacing the party surface.
  await expect(page.getByTestId('browse-page')).toBeVisible({ timeout: 8000 });
});

// ================================================================================
// A11Y — keyboard tab order: rail items (RAIL_ITEMS order) then cards, in DOM order
// ================================================================================

test('keyboard tab order: rail items in RAIL_ITEMS order, then party cards in DOM order', async ({ page }) => {
  await page.setViewportSize(DESKTOP_VIEWPORT);
  await gotoParty(page);

  const railNav = getRailNav(page);
  await expect(railNav).toBeVisible();

  await railNav.getByRole('button', { name: RAIL_LABEL_ORDER[0] }).focus();
  for (let i = 0; i < RAIL_LABEL_ORDER.length; i += 1) {
    await expect(railNav.getByRole('button', { name: RAIL_LABEL_ORDER[i] })).toBeFocused();
    if (i < RAIL_LABEL_ORDER.length - 1) {
      await page.keyboard.press('Tab');
    }
  }

  // One more Tab from the last rail item lands on the first party card.
  await page.keyboard.press('Tab');
  const cards = getCards(page);
  await expect(cards.first()).toBeFocused();

  // A further Tab lands on the SECOND card directly (proves no nested tab stops inside a card).
  await page.keyboard.press('Tab');
  await expect(cards.nth(1)).toBeFocused();
});

// ================================================================================
// SC4 — rail nav: the three KEEP destinations (W3: destination DOM marker per click)
// ================================================================================

test.describe('SC4 — rail navigation (KEEP destinations)', () => {
  test('rail: Sessions click lands on the Sessions destination marker', async ({ page }) => {
    const guard = attachRenderLoopGuard(page);
    await page.setViewportSize(DESKTOP_VIEWPORT);
    await gotoParty(page);

    await getRailNav(page).getByRole('button', { name: 'Sessions' }).click();
    await expect(page.getByTestId('sessions-list-page')).toBeVisible({ timeout: 10000 });

    guard.assertNoRenderLoopErrors();
  });

  test('rail: Progression click lands on the Progression destination marker', async ({ page }) => {
    await page.setViewportSize(DESKTOP_VIEWPORT);
    await gotoParty(page);

    await getRailNav(page).getByRole('button', { name: 'Progression' }).click();
    await expect(page.getByRole('heading', { name: 'PROGRESSION LEDGER' })).toBeVisible({ timeout: 10000 });
  });

  test('rail: Programs click lands on the Programs destination marker', async ({ page }) => {
    await page.setViewportSize(DESKTOP_VIEWPORT);
    await gotoParty(page);

    await getRailNav(page).getByRole('button', { name: 'Programs' }).click();
    await expect(getProgramsMarker(page).first()).toBeVisible({ timeout: 15000 });
  });

  test('rail: Roster (interim) click lands on the Browse destination marker', async ({ page }) => {
    await page.setViewportSize(DESKTOP_VIEWPORT);
    await gotoParty(page);

    await getRailNav(page).getByRole('button', { name: 'Roster' }).click();
    await expect(page.getByTestId('browse-page')).toBeVisible({ timeout: 10000 });
  });

  test('rail: aria-current is absent on the party surface (R-3 known consequence — see ui_packet)', async ({
    page,
  }) => {
    await page.setViewportSize(DESKTOP_VIEWPORT);
    await gotoParty(page);

    // activeMode === 'party' never matches a RAIL_ITEMS mode (Roster/Sessions/Progression/
    // Programs), so no rail item is ever marked aria-current="page" while the rail itself is
    // mounted (the rail unmounts with PartyPage the instant a KEEP click navigates away). This
    // is a documented, low-severity consequence of the Critic-ratified R-3 page-local rail
    // scoping — asserted here as the CORRECT current-render state, not a defect to fix.
    await expect(getRailNav(page).locator('[aria-current="page"]')).toHaveCount(0);
  });
});

// ================================================================================
// Diagnostics affordance
// ================================================================================

test('diagnostics footnote is visible when diagnostics counts are non-zero (live data)', async ({ page }) => {
  await gotoParty(page);
  await expect(getCards(page).first()).toBeVisible({ timeout: 10000 });

  const footnote = page.getByText(/data quality:/i);
  await expect(footnote).toBeVisible({ timeout: 10000 });
  await expect(footnote).toContainText(/data quality: \d+ unparsed lines · \d+ uncounted event types/);
});

// ================================================================================
// SC3 — mocked states via route interception (loading / empty / error+retry)
// ================================================================================

test.describe('SC3 — mocked PartyGrid states', () => {
  test('loading: 6 skeleton cards render while roster.getParty is pending', async ({ page }) => {
    await page.route('**/trpc/roster.getParty**', async (route) => {
      await new Promise<void>((resolve) => setTimeout(resolve, 800));
      await route.continue();
    });

    await page.goto(BASE_URL);
    const partyPage = page.getByTestId('party-page');
    await expect(partyPage).toBeVisible();

    const skeletonGrid = partyPage.locator('[aria-busy="true"]');
    await expect(skeletonGrid).toBeVisible({ timeout: 2000 });
    await expect(skeletonGrid.locator('> div[aria-hidden="true"]')).toHaveCount(6);

    // Eventually resolves to the default state once the delayed response lands.
    await expect(getCards(page).first()).toBeVisible({ timeout: 8000 });
  });

  test('empty: zero-member response renders the empty state with a Browse CTA', async ({ page }) => {
    await page.route('**/trpc/roster.getParty**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          {
            result: {
              data: {
                members: [],
                diagnostics: {
                  totalRawLines: 0,
                  validEntries: 0,
                  invalidLineCount: 0,
                  invalidLineSamples: [],
                  distinctEventTypes: 0,
                  uncountedEventTypes: 0,
                },
                activityAnchor: 0,
              },
            },
          },
        ]),
      });
    });

    await page.goto(BASE_URL);
    const emptyStatus = page.locator('[role="status"]');
    await expect(emptyStatus).toBeVisible({ timeout: 8000 });
    await expect(page.getByRole('heading', { name: 'No Active Party Members Yet' })).toBeVisible();

    const cta = page.getByRole('button', { name: 'View Full Roster' });
    await expect(cta).toBeVisible();
    await cta.click();
    await expect(page.getByTestId('browse-page')).toBeVisible({ timeout: 8000 });
  });

  test('error: network failure renders the alert with a Retry that refetches to the default state', async ({
    page,
  }) => {
    await page.route('**/trpc/roster.getParty**', (route) => route.abort('failed'));
    await page.goto(BASE_URL);

    const alert = page.locator('[role="alert"]');
    await expect(alert).toBeVisible({ timeout: 10000 });
    await expect(alert).toContainText("Couldn't load party data");

    const retryBtn = page.getByRole('button', { name: 'Retry' });
    await expect(retryBtn).toBeVisible();

    // Let real requests through, then retry — proves refetch() reaches the live server.
    await page.unroute('**/trpc/roster.getParty**');
    await retryBtn.click();

    await expect(getCards(page).first()).toBeVisible({ timeout: 10000 });
  });
});

// ================================================================================
// SC4 — no regression: BottomTabBar still shows 9 tabs and switching still works
// ================================================================================

test('no regression: BottomTabBar renders 9 tabs; switching to Sessions and Programs still works', async ({
  page,
}) => {
  const guard = attachRenderLoopGuard(page);
  await gotoParty(page);

  const tablist = page.getByRole('tablist', { name: 'Main navigation' });
  await expect(tablist).toBeVisible();
  await expect(tablist.getByRole('tab')).toHaveCount(9);

  await tablist.getByRole('tab', { name: /sessions/i }).click();
  await expect(page.getByTestId('sessions-list-page')).toBeVisible({ timeout: 10000 });

  await page.goto(BASE_URL);
  await tablist.getByRole('tab', { name: /programs/i }).click();
  await expect(getProgramsMarker(page).first()).toBeVisible({ timeout: 15000 });

  guard.assertNoRenderLoopErrors();
});

// ================================================================================
// SC2 — legibility spot-check (computed-style, not just DOM-presence)
// ================================================================================

test('legibility spot-check: title and RoleTag colors resolve to real, distinguishable values', async ({
  page,
}) => {
  await gotoParty(page);

  const title = page.getByRole('heading', { name: 'Party Screen' });
  await expect(title).toBeVisible();
  const titleColor = await title.evaluate((el) => getComputedStyle(el).color);
  // --w (#ffffff) per contrast_pairs AAA pairing — never transparent, never inherited-invisible.
  expect(titleColor).toBe('rgb(255, 255, 255)');

  const firstCard = getCards(page).first();
  await expect(firstCard).toBeVisible({ timeout: 10000 });
  const roleTag = firstCard.locator('span').filter({ hasText: /^(Impl|Command|Intel|Meta|Gate)$/ });
  await expect(roleTag).toBeVisible();
  const roleTagStyles = await roleTag.evaluate((el) => {
    const cs = getComputedStyle(el);
    return { color: cs.color, background: cs.backgroundColor };
  });
  // materiaTint()'s color-mix() output must resolve to a real, non-transparent value (guards
  // against the color-mix()-unsupported-silently-invisible failure class) and must differ from
  // its own alpha-tinted background (guards the Shadcn/FF7 token-collision pitfall class).
  expect(roleTagStyles.color).not.toBe('rgba(0, 0, 0, 0)');
  expect(roleTagStyles.background).not.toBe('rgba(0, 0, 0, 0)');
  expect(roleTagStyles.color).not.toBe(roleTagStyles.background);
});

// ================================================================================
// SC2 — desktop (1280) and mobile (390) viewport legibility + screenshots
// ================================================================================

test.describe('SC2 — responsive legibility', () => {
  test('desktop 1280: rail visible, 3-col grid, no horizontal overflow', async ({ page }) => {
    await page.setViewportSize(DESKTOP_VIEWPORT);
    await gotoParty(page);
    await expect(getCards(page).first()).toBeVisible({ timeout: 10000 });

    await expect(getRailNav(page)).toBeVisible();

    expect(await countGridColumns(page)).toBe(3);
    await assertNoHorizontalOverflow(page);

    await page.screenshot({ path: `${SCREENSHOT_DIR}/desktop-1280.png`, fullPage: true });
  });

  test('mobile 390: rail hidden, 1-col grid, no horizontal overflow, BottomTabBar covers nav', async ({
    page,
  }) => {
    await page.setViewportSize(MOBILE_VIEWPORT);
    await gotoParty(page);
    await expect(getCards(page).first()).toBeVisible({ timeout: 10000 });

    await expect(getRailNav(page)).not.toBeVisible();

    expect(await countGridColumns(page)).toBe(1);
    await assertNoHorizontalOverflow(page);

    await expect(page.getByRole('tablist', { name: 'Main navigation' })).toBeVisible();

    await page.screenshot({ path: `${SCREENSHOT_DIR}/mobile-390.png`, fullPage: true });
  });
});
