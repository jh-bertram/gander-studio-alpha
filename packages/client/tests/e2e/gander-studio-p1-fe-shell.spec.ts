import { test, expect, type Page } from '@playwright/test';

// MIGRATED (s4 FE-1b): nav is now rendered globally by SubmenuRail (role="navigation",
// aria-label "Main navigation", hoisted by FE-1a) — the 9-tab v1 BottomTabBar (role="tab",
// NAV_ITEMS: Browse/Compose/Edit/Export/...) is retired. Selectors below target the rail's
// role="button" items (RAIL_ITEMS: Roster/Sessions/Progression/Programs). The first test below
// ("Browse mode active") asserts a default-mode premise that was already false pre-FE-1a
// (default activeMode is 'party', not 'browse') — left untouched per the packet's "do NOT fix
// baseline-red specs" instruction.

function getRail(page: Page) {
  return page.getByRole('navigation', { name: 'Main navigation' });
}

test('app shell loads with header and Browse mode active', async ({ page }) => {
  await page.goto('http://localhost:5173');
  await expect(page.locator('h1')).toHaveText('GANDER STUDIO');
  await expect(page.getByTestId('browse-page')).toBeVisible();
  // Active nav item for Browse — BottomTabBar sets aria-selected on role="tab"
  const browseTab = page.locator('[role="tab"]', { hasText: /^Browse$/i }).first();
  await expect(browseTab).toHaveAttribute('aria-selected', 'true');
});

test('clicking a nav item switches mode content', async ({ page }) => {
  await page.goto('http://localhost:5173');
  // Click Sessions via the rail (a KEEP destination — Compose/Edit are cut surfaces, removed
  // from RAIL_ITEMS by this packet's retirement; their own migration is FE-2/FE-4's).
  await getRail(page).getByRole('button', { name: 'Sessions' }).click();
  await expect(page.getByTestId('sessions-list-page')).toBeVisible();
  await expect(page.getByTestId('party-page')).not.toBeVisible();
  // Click Progression via the rail (second KEEP destination)
  await getRail(page).getByRole('button', { name: 'Progression' }).click();
  await expect(page.getByRole('heading', { name: 'PROGRESSION LEDGER' })).toBeVisible({ timeout: 10000 });
});

test('mode content renders empty-state placeholder when no data is present', async ({ page }) => {
  await page.goto('http://localhost:5173');
  // Party (default) page shows placeholder text (server may be offline — page still renders)
  await expect(page.locator('#mode-content')).toBeVisible();
  // Navigating to Programs via the rail shows its own empty/loading/settled marker
  await getRail(page).getByRole('button', { name: 'Programs' }).click();
  const programsMarker = page.locator(
    '.react-flow__pane, :text("PROGRAM DAG UNAVAILABLE"), :text("NO PROGRAM DATA")',
  );
  await expect(programsMarker.first()).toBeVisible({ timeout: 15000 });
});
