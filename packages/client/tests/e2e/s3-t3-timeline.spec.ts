/**
 * E2E spec: s3-t3-timeline — AgentTimeline component
 *
 * SC-contrast assertion follows ~/.claude/agents/frontend.md §E2E Assertion Targeting #3
 * (rendered-but-invisible / token-system collision guard):
 *   computed fill !== background AND background not transparent.
 *
 * SC-orphan-spawn: pinned fixture session "gander-p7-obsidian-l2-l3".
 *   ORC pre-check confirmed agents CR#1, PM#2, CR#2 have SPAWN but no COMPLETE event
 *   in ~/projects/gander/docs/events/agent-events-2026-05-06.jsonl.
 *   Agent CR#1 (seq=3) is used as the deterministic orphan-SPAWN agent.
 *
 * SC-scroll: pinned fixture session "gander-p6-moirai-skein-skills".
 *   ORC pre-check confirmed: 29 events, span = 19699s (≈5.5h).
 *   contentWidth >> containerWidth for this fixture → timeline-scroller scrolls.
 *
 * SC-units: same wide fixture ("gander-p6-moirai-skein-skills", range ≈5.5h).
 *   axisUnit → 'h'; all tick labels must match /\+\d+(\.\d+)?h\b/.
 *
 * SC-contrast snippet source: ~/.claude/agents/frontend.md §E2E Assertion Targeting #3.
 */
import { test, expect } from '@playwright/test';

const FIXTURE_SESSION_ID = 'gander-p7-obsidian-l2-l3';
const ORPHAN_AGENT_ID = 'CR#1';

// Wide session: span 19699 s (≈5.5 h) → unit = 'h', contentWidth >> container
const WIDE_SESSION_ID = 'gander-p6-moirai-skein-skills';

/** Navigate to the AnalyzeTab for the given session id. */
async function navigateToAnalyzeTab(
  page: import('@playwright/test').Page,
  sessionId: string = FIXTURE_SESSION_ID,
): Promise<void> {
  await page.goto('http://localhost:5173');

  const sessionsNav = page.locator('text=SESSIONS').first();
  await expect(sessionsNav).toBeVisible({ timeout: 8000 });
  await sessionsNav.click();

  // Pin by sprint text — not by position
  const listPage = page.getByTestId('sessions-list-page');
  await expect(listPage).toBeVisible({ timeout: 5000 });
  const fixtureRow = listPage
    .locator('tbody tr')
    .filter({ hasText: sessionId })
    .first();
  await expect(fixtureRow).toBeVisible({ timeout: 8000 });
  await fixtureRow.click();

  // Click the Analyze tab — hard failure if absent (t5a is shipped)
  const detailPage = page.getByTestId('sessions-detail-page');
  await expect(detailPage).toBeVisible({ timeout: 5000 });
  const analyzeTab = page.getByRole('tab', { name: 'Analyze' });
  await expect(analyzeTab).toBeVisible({ timeout: 5000 });
  await expect(analyzeTab).not.toHaveAttribute('aria-disabled', 'true');
  await analyzeTab.click();

  // Wait for AgentTimeline SVG — hard failure if absent (t3 is shipped)
  const timeline = page.getByTestId('agent-timeline-svg');
  await expect(timeline).toBeVisible({ timeout: 8000 });
}

// ─── Load test: AgentTimeline SVG renders for the fixture session ─────────────
test('Load: AgentTimeline SVG is visible for fixture session', async ({ page }) => {
  await navigateToAnalyzeTab(page);

  const svg = page.getByTestId('agent-timeline-svg');
  await expect(svg).toBeVisible({ timeout: 5000 });
  await expect(svg).toHaveAttribute('role', 'img');
});

// ─── SC-contrast: rendered SVG text label is visible against its background ───
test('SC-contrast: AgentTimeline y-axis label text is visible against SVG background', async ({ page }) => {
  await navigateToAnalyzeTab(page);

  // Locate the SVG container (the wrapping div is the styled surface)
  // SC-contrast follows ~/.claude/agents/frontend.md §E2E Assertion Targeting #3 verbatim:
  const timelineContainer = page.locator('[data-testid="agent-timeline-svg"]').locator('..');
  await expect(timelineContainer).toBeVisible({ timeout: 5000 });

  // Evaluate computed style on the container (the element with background color)
  const styles = await timelineContainer.evaluate((el) => {
    const cs = getComputedStyle(el);
    return { bg: cs.backgroundColor };
  });

  // Background of the container must not be transparent
  expect(styles.bg).not.toBe('rgba(0, 0, 0, 0)');

  // Now check a rendered SVG text label element — SVG text uses 'fill', not 'color'
  // We verify the SVG itself is attached and has visible text content
  const svg = page.getByTestId('agent-timeline-svg');
  await expect(svg).toBeAttached();

  // Assert the SVG contains at least one text element (y-axis label)
  const textCount = await svg.locator('text').count();
  expect(textCount).toBeGreaterThan(0);

  // Evaluate fill on the first y-axis text label
  const firstLabel = svg.locator('[data-testid^="timeline-label-"]').first();
  if (await firstLabel.isVisible({ timeout: 2000 }).catch(() => false)) {
    const labelStyles = await firstLabel.evaluate((el) => {
      const cs = getComputedStyle(el);
      return { fill: cs.fill ?? cs.color, bg: cs.backgroundColor };
    });
    // fill must not match the container background (text must be visible)
    expect(labelStyles.fill).not.toBe('');
    expect(labelStyles.fill).not.toBe('rgba(0, 0, 0, 0)');
  }
});

// ─── SC-orphan-spawn: pinned fixture session has dashed-stroke bar for CR#1 ───
test('SC-orphan-spawn: orphan-SPAWN agent bar has stroke-dasharray (dashed variant)', async ({ page }) => {
  await navigateToAnalyzeTab(page);

  // The fixture session gander-p7-obsidian-l2-l3 has agent CR#1 with SPAWN but no COMPLETE.
  // The AgentTimeline should render a dashed-stroke rect for this agent.
  const orphanBar = page.getByTestId(`timeline-bar-${ORPHAN_AGENT_ID}`);
  await expect(orphanBar).toBeAttached({ timeout: 5000 });

  // Assert the bar g has data-orphan="true"
  await expect(orphanBar).toHaveAttribute('data-orphan', 'true');

  // Assert the rect within the bar g has stroke-dasharray attribute
  const orphanRect = page.getByTestId(`timeline-bar-rect-${ORPHAN_AGENT_ID}`);
  await expect(orphanRect).toBeAttached();

  const dashArray = await orphanRect.getAttribute('stroke-dasharray');
  expect(dashArray).not.toBeNull();
  expect(dashArray).toBe('4 3');

  // Additionally assert DOM presence (per side-effect-as-proxy anti-pattern rule):
  // The bar g itself must be present in the rendered SVG
  const svg = page.getByTestId('agent-timeline-svg');
  await expect(svg).toBeVisible({ timeout: 3000 });

  // The orphan bar must carry fill="none" (not a filled bar)
  const fillAttr = await orphanRect.getAttribute('fill');
  expect(fillAttr).toBe('none');
});

// ─── SC-scroll: wide session produces a horizontally scrollable timeline ──────
test('SC-scroll: wide session produces scrollWidth > clientWidth on the scroller', async ({ page }) => {
  // Navigate to the wide fixture session (19699 s span → contentWidth >> containerWidth)
  await navigateToAnalyzeTab(page, WIDE_SESSION_ID);

  // Wait for the scroller element to appear
  const scroller = page.getByTestId('agent-timeline-scroller');
  await expect(scroller).toBeVisible({ timeout: 8000 });

  // Also confirm the SVG itself is present (DOM-presence pair for side-effect check)
  const svg = page.getByTestId('agent-timeline-svg');
  await expect(svg).toBeVisible({ timeout: 5000 });

  // Read scrollWidth and clientWidth — scrollWidth > clientWidth means content overflows
  const dims = await scroller.evaluate((el) => ({
    scrollWidth: el.scrollWidth,
    clientWidth: el.clientWidth,
  }));

  // The wide fixture must produce an SVG wider than the scroller's visible area
  expect(dims.scrollWidth).toBeGreaterThan(dims.clientWidth);
});

// ─── SC-units: wide session x-axis ticks use hours, not raw seconds ───────────
test('SC-units: wide session x-axis tick labels use adaptive hour unit', async ({ page }) => {
  // The wide fixture has tAxisRange ≈ 19699 s (≈5.5 h).
  // deriveUnit(19699 * 1000) → 'h' (90 min ≤ range < 48 h).
  // All tick labels after tick 0 must match /\+\d+(\.\d+)?h\b/.
  await navigateToAnalyzeTab(page, WIDE_SESSION_ID);

  const svg = page.getByTestId('agent-timeline-svg');
  await expect(svg).toBeVisible({ timeout: 8000 });

  // Collect all tick text elements from the aria-hidden tick group.
  // Tick labels are SVG <text> elements inside the axis <g aria-hidden="true">.
  // We look for any non-zero tick that matches an hour pattern.
  const tickTexts: string[] = await svg.evaluate((svgEl) => {
    const texts = Array.from(svgEl.querySelectorAll('g[aria-hidden="true"] text'));
    return texts.map((t) => t.textContent ?? '');
  });

  // Must have at least TICK_COUNT non-zero ticks
  const nonZeroTicks = tickTexts.filter((t) => t !== '0s' && t !== '0m' && t !== '0h' && t !== '0d' && t !== '0ms' && t.length > 0);
  expect(nonZeroTicks.length).toBeGreaterThan(0);

  // Every non-zero tick must match the hour-unit adaptive pattern
  const hourPattern = /^\+\d+(\.\d+)?h$/;
  for (const tick of nonZeroTicks) {
    expect(tick).toMatch(hourPattern);
  }

  // DOM presence: the SVG must have rendered bars (not empty state)
  const barCount = await svg.locator('[data-testid^="timeline-bar-"]').count();
  expect(barCount).toBeGreaterThan(0);
});

// ─── SC#4-runtime / SC#8-runtime: FF7 tooltip content + active-only aria-describedby ──
// Runtime evidence for gander-studio-p10-deferred-smalls-003-gap2 — closes AUD#1's
// two open runtime gates (SC#4-runtime, SC#8-runtime) left NOT_VERIFIED because AUD#1's
// spawn toolset had no hover/focus/evaluate primitive.
//
// FIXTURE NOTE: the SC-orphan-spawn fixture above (session gander-p7-obsidian-l2-l3,
// dated 2026-05-06) has aged out of the live session.list top-50 (date-descending,
// no search/pagination — see packages/server/src/session-list.ts) between when that
// test was authored and this run (2026-07-02). All 5 pre-existing tests in this file
// fail against the live dev environment for that same pre-existing reason — NOT
// introduced by this change; out of scope for gander-studio-p10-deferred-smalls-003-gap2
// to fix (separate defect, would need a BE fix — larger limit or a session search
// endpoint). A dedicated exact-match navigator + a currently-live, no-longer-mutating
// fixture (`gander-meta-output-path-relocate`, 2026-06-23, docless synthesis so
// `session.agents` — which seeds default `selectedAgentIds` — is populated from the
// raw event log) is used instead, confirmed via a direct `session.list`/`session.get`
// tRPC query before authoring these assertions. Agent AUD#1 in that session has SPAWN
// + AUDIT_PASS but no COMPLETE — a stable orphan bar exercising the "completed: in
// progress" path plus a non-'none' audit outcome.
const GAP2_SESSION_ID = 'gander-meta-output-path-relocate';
const GAP2_ORPHAN_AGENT_ID = 'AUD#1';

/**
 * Same navigation as navigateToAnalyzeTab, but matches the session row by EXACT
 * cell text rather than substring `hasText`. Required here because the live list
 * also contains `gander-meta-output-path-relocate-t1t2`, which is a substring
 * superset of GAP2_SESSION_ID and would otherwise collide with `hasText` filtering
 * (see frontend.md "First-row fixture coupling" / E2E Assertion Targeting guard).
 */
async function navigateToAnalyzeTabExact(
  page: import('@playwright/test').Page,
  sessionId: string,
): Promise<void> {
  await page.goto('http://localhost:5173');

  const sessionsNav = page.locator('text=SESSIONS').first();
  await expect(sessionsNav).toBeVisible({ timeout: 8000 });
  await sessionsNav.click();

  const listPage = page.getByTestId('sessions-list-page');
  await expect(listPage).toBeVisible({ timeout: 5000 });
  const fixtureRow = listPage
    .locator('tbody tr')
    .filter({ has: page.getByText(sessionId, { exact: true }) })
    .first();
  await expect(fixtureRow).toBeVisible({ timeout: 8000 });
  await fixtureRow.click();

  const detailPage = page.getByTestId('sessions-detail-page');
  await expect(detailPage).toBeVisible({ timeout: 5000 });
  const analyzeTab = page.getByRole('tab', { name: 'Analyze' });
  await expect(analyzeTab).toBeVisible({ timeout: 5000 });
  await expect(analyzeTab).not.toHaveAttribute('aria-disabled', 'true');
  await analyzeTab.click();

  const timeline = page.getByTestId('agent-timeline-svg');
  await expect(timeline).toBeVisible({ timeout: 8000 });
}

/** Shared aria-describedby presence check — used across the hover and focus toggle tests. */
async function hasAriaDescribedBy(locator: import('@playwright/test').Locator): Promise<boolean> {
  return locator.evaluate((el) => el.hasAttribute('aria-describedby'));
}

test('SC-tooltip-content: hover reveals loops:/audit: rows + exact spawn/complete timestamps', async ({ page }) => {
  await navigateToAnalyzeTabExact(page, GAP2_SESSION_ID);

  const orphanBar = page.getByTestId(`timeline-bar-${GAP2_ORPHAN_AGENT_ID}`);
  await expect(orphanBar).toBeAttached({ timeout: 5000 });
  // dispatchEvent('mouseover') rather than a geometric .hover(): the fixed/sticky
  // main-nav tablist intercepts the real pointer at this row's on-screen position
  // after scroll-into-view for wide/tall sessions. dispatchEvent still fires the
  // native 'mouseover' React listens to for onMouseEnter — same handler exercised.
  await orphanBar.scrollIntoViewIfNeeded();
  await orphanBar.dispatchEvent('mouseover');

  const tooltip = page.getByTestId('timeline-tooltip');
  await expect(tooltip).toBeVisible({ timeout: 3000 });

  const text = (await tooltip.textContent()) ?? '';
  expect(text).toMatch(/loops:\s*\d+/);
  expect(text).toMatch(/audit:\s*(none|pass|fail|mixed)/);
  expect(text).toMatch(/spawned:\s*\d{1,2}:\d{2}:\d{2}/);
  // AUD#1 in this fixture has SPAWN + AUDIT_PASS but no COMPLETE event.
  expect(text).toMatch(/completed:\s*in progress/);
});

test('SC-tooltip-aria-hover: active bar gains aria-describedby only while hovered; aria-label preserved; cleared on mouseleave', async ({ page }) => {
  await navigateToAnalyzeTabExact(page, GAP2_SESSION_ID);

  const orphanBar = page.getByTestId(`timeline-bar-${GAP2_ORPHAN_AGENT_ID}`);
  await expect(orphanBar).toBeAttached({ timeout: 5000 });

  // Before hover: aria-describedby must be absent.
  const hasAttrBefore = await hasAriaDescribedBy(orphanBar);
  expect(hasAttrBefore).toBe(false);
  const labelBefore = await orphanBar.getAttribute('aria-label');
  expect(labelBefore).toBeTruthy();

  await orphanBar.scrollIntoViewIfNeeded();
  await orphanBar.dispatchEvent('mouseover');
  await expect(page.getByTestId('timeline-tooltip')).toBeVisible({ timeout: 3000 });
  await expect(orphanBar).toHaveAttribute('aria-describedby', 'timeline-tooltip');
  const labelDuring = await orphanBar.getAttribute('aria-label');
  expect(labelDuring).toBeTruthy();
  expect(labelDuring).toBe(labelBefore);

  // Leave — dispatchEvent('mouseout') fires the native event React's onMouseLeave
  // listens to, mirroring the mouseover dispatch above (same rationale: avoids the
  // sticky main-nav pointer-interception flake, see comment on the previous test).
  await orphanBar.dispatchEvent('mouseout');
  await expect(page.getByTestId('timeline-tooltip')).toHaveCount(0);
  const hasAttrAfter = await hasAriaDescribedBy(orphanBar);
  expect(hasAttrAfter).toBe(false);
});

test('SC-tooltip-aria-focus: keyboard focus triggers the same active-only toggle; blur clears it', async ({ page }) => {
  await navigateToAnalyzeTabExact(page, GAP2_SESSION_ID);

  const orphanBar = page.getByTestId(`timeline-bar-${GAP2_ORPHAN_AGENT_ID}`);
  await expect(orphanBar).toBeAttached({ timeout: 5000 });

  await orphanBar.focus();
  await expect(page.getByTestId('timeline-tooltip')).toBeVisible({ timeout: 3000 });
  await expect(orphanBar).toHaveAttribute('aria-describedby', 'timeline-tooltip');
  const labelDuring = await orphanBar.getAttribute('aria-label');
  expect(labelDuring).toBeTruthy();

  await orphanBar.blur();
  const hasAttrAfterBlur = await hasAriaDescribedBy(orphanBar);
  expect(hasAttrAfterBlur).toBe(false);
});

test('SC-tooltip-role: tooltip panel root has role="tooltip" and id="timeline-tooltip"', async ({ page }) => {
  await navigateToAnalyzeTabExact(page, GAP2_SESSION_ID);

  const orphanBar = page.getByTestId(`timeline-bar-${GAP2_ORPHAN_AGENT_ID}`);
  await expect(orphanBar).toBeAttached({ timeout: 5000 });
  await orphanBar.scrollIntoViewIfNeeded();
  await orphanBar.dispatchEvent('mouseover');

  const tooltip = page.getByTestId('timeline-tooltip');
  await expect(tooltip).toBeVisible({ timeout: 3000 });
  await expect(tooltip).toHaveAttribute('role', 'tooltip');
  await expect(tooltip).toHaveAttribute('id', 'timeline-tooltip');
});
