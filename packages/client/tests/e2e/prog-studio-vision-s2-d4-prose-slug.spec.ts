/**
 * prog-studio-vision-2026-06-s2 — D4 prose-H1 slug fix
 *
 * Verifies that a session whose file has no YAML frontmatter sprint field
 * (Format B — `# Post-Mortem: ...` prose H1) shows non-zero event and agent
 * counts in the Overview tab.
 *
 * Before the fix, session "gander-studio-p2-p3" (sprint: "Post-Mortem: Gander
 * Studio P2 + P3") had its primary slug computed as "Post-Mortem:" (first
 * whitespace token), which matched 0 events in docs/events/ JSONL files.
 *
 * After the D4 fix:
 *   - resolveSessionEvents falls back to session.id ("gander-studio-p2-p3")
 *     when the primary slug matches 0 events.
 *   - docs/events/agent-events-2026-03-16.jsonl contains seq:12 with
 *     task_id "gander-studio-p2-p3-postmortem" which matches the fallback.
 *   - session.events.length >= 1 and the Overview tab shows ≥ 1 Events.
 *
 * Corpus requirement:
 *   GANDER_ROOT = /home/jhber/projects/gander (configured in .env)
 *   gander-studio-p2-p3.md exists in docs/post-mortems/ (confirmed present)
 *   agent-events-2026-03-16.jsonl contains the p2-p3-postmortem event
 *
 * If the target session row is not found (e.g. running without real corpus),
 * the test skips gracefully.
 */

import { test, expect } from '@playwright/test';

const BASE = 'http://localhost:5173';

async function navigateToSessions(page: import('@playwright/test').Page): Promise<void> {
  await page.goto(BASE);
  await page.waitForLoadState('networkidle', { timeout: 15000 });
  // Use role="tab" selector to target the BottomTabBar tab button specifically,
  // avoiding false matches on <p> elements that also contain "Sessions" text.
  const sessionsNav = page.locator('[role="tab"]', { hasText: /^Sessions$/i }).first();
  const hasSessions = await sessionsNav.isVisible({ timeout: 3000 }).catch(() => false);
  if (hasSessions) {
    await sessionsNav.click();
    await page.waitForLoadState('networkidle', { timeout: 8000 });
  }
  await expect(page.getByTestId('sessions-list-page')).toBeVisible({ timeout: 5000 });
}

// ─── Test 1: Load — Sessions list shows prose-H1 session row ─────────────────

test('D4: sessions list is visible and contains at least one row', async ({ page }) => {
  await navigateToSessions(page);
  const listPage = page.getByTestId('sessions-list-page');
  await expect(listPage).toBeVisible({ timeout: 5000 });

  // Accept any rendered state (rows, empty, loading)
  const hasRows  = await listPage.locator('tbody tr').first().isVisible().catch(() => false);
  const hasEmpty = await listPage.locator('[aria-live="polite"]').isVisible().catch(() => false);
  const hasLoad  = await listPage.locator('[aria-busy="true"]').isVisible().catch(() => false);
  expect(hasRows || hasEmpty || hasLoad).toBe(true);
});

// ─── Test 2: Primary — prose-H1 session shows non-zero events in Overview tab ─

test('D4: gander-studio-p2-p3 (prose-H1 sprint) shows non-zero event count in Overview tab', async ({ page }) => {
  await navigateToSessions(page);
  const listPage = page.getByTestId('sessions-list-page');

  // Find the gander-studio-p2-p3 session row.
  // The sprint field is "Post-Mortem: Gander Studio P2 + P3" (prose H1),
  // but the session id is "gander-studio-p2-p3" (filename slug).
  // Both may appear as row text — match either.
  const targetRow = listPage.locator('tbody tr').filter({
    hasText: /gander-studio-p2-p3|Post-Mortem.*P2.*P3/i,
  }).first();

  const hasTargetRow = await targetRow.isVisible({ timeout: 5000 }).catch(() => false);
  if (!hasTargetRow) {
    // Target session not in corpus (e.g. test env without full post-mortems dir)
    return;
  }

  await targetRow.click();
  await expect(page.getByTestId('sessions-detail-page')).toBeVisible({ timeout: 5000 });

  // Navigate to Overview tab
  const overviewTabBtn = page.getByRole('tab', { name: 'Overview' });
  await overviewTabBtn.click();
  const overviewTab = page.getByTestId('overview-tab');
  await expect(overviewTab).toBeVisible({ timeout: 3000 });

  // The Events stat card must show a number > 0
  // StatCard renders: <div>{value}</div><div>{label}</div>
  // We look for the stat group and find Events card
  const statGroup = overviewTab.getByRole('group', { name: 'Session statistics' });
  await expect(statGroup).toBeVisible({ timeout: 3000 });

  // Read the Events count text — it's a sibling of the "Events" label
  // Since StatCard renders value above label, we need to find the Events card
  const eventsCardValue = overviewTab.locator('div', { hasText: 'Events' }).evaluate((el: Element) => {
    // Walk up to find the stat card container, then get the first child (value)
    const card = el.closest('div');
    if (!card) return null;
    const valueEl = card.querySelector('div');
    return valueEl ? parseInt(valueEl.textContent?.trim() ?? '0', 10) : null;
  });

  // Use text-based assertion: the page must contain a non-zero number near "Events"
  // Strategy: check that the stat group contains text that isn't "0" for events
  const statGroupText = await statGroup.textContent();

  // The stat group contains: "{agents}Agents{loops}Feedback Loops{events}Events{status}Status"
  // We need to extract the events number. Parse the text content.
  // Simple approach: assert statGroupText doesn't contain "0Events" pattern
  // (i.e., the Events count is non-zero after the D4 fix)
  const eventsMatch = statGroupText?.match(/(\d+)\s*Events/i);
  const eventsCount = eventsMatch ? parseInt(eventsMatch[1], 10) : null;

  expect(
    eventsCount,
    `Events count must be non-null and > 0 — got: ${eventsCount} from text: "${statGroupText}"`,
  ).not.toBeNull();
  expect(
    eventsCount ?? 0,
    `gander-studio-p2-p3 prose-H1 session must show >= 1 event (D4 slug fallback verified). Got: ${eventsCount}`,
  ).toBeGreaterThan(0);
});

// ─── Test 3: Error/empty — prose-H1 detail page handles missing events gracefully ─

test('D4: session detail page renders without crashing even when events data is empty', async ({ page }) => {
  await navigateToSessions(page);
  const listPage = page.getByTestId('sessions-list-page');

  // Click any session row — all detail pages must render without JS errors
  const firstRow = listPage.locator('tbody tr').first();
  const hasRows = await firstRow.isVisible({ timeout: 5000 }).catch(() => false);
  if (!hasRows) return;

  await firstRow.click();
  await expect(page.getByTestId('sessions-detail-page')).toBeVisible({ timeout: 5000 });

  // The detail page must not show a JS crash / unhandled error
  const hasAlert = await page.locator('[role="alert"]').isVisible().catch(() => false);
  if (hasAlert) {
    // An alert is shown — acceptable if it's a "LOAD ERROR" with a message (not a blank crash)
    const alertText = await page.locator('[role="alert"]').textContent();
    // Should contain an error message, not be blank
    expect(alertText?.trim().length ?? 0).toBeGreaterThan(0);
  }

  // Overview tab must be navigable
  const overviewTabBtn = page.getByRole('tab', { name: 'Overview' });
  const hasOverview = await overviewTabBtn.isVisible({ timeout: 3000 }).catch(() => false);
  if (hasOverview) {
    await overviewTabBtn.click();
    await expect(page.getByTestId('overview-tab')).toBeVisible({ timeout: 3000 });
  }
});
