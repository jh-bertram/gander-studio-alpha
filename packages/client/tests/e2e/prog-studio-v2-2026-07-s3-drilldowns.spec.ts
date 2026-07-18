/**
 * prog-studio-v2-2026-07-s3-drilldowns.spec.ts
 * Tier-2 e2e — the s3->s4 absorption-proof seam artifact (PM packet
 * `prog-studio-v2-2026-07-s3-drilldowns-rev2-PM-1783488067.md`, task t5). Proves the three
 * absorption lanes (Browse -> inventory panels, Graph -> relationship panel, Edit -> revise-spec
 * action) render real, live data on the new agent-detail drill-down, plus the buffer-contamination
 * regression (SC3) and an a11y pass.
 *
 * Live server required: port 5173 (Vite dev, proxying /trpc to :3001) against a real 13-member
 * ROSTER corpus. All assertions use destination-DOM markers / structural presence (W3 doctrine,
 * constraint 6) — NO measured/data-derived locked counts (e.g. no "expect exactly N skills").
 * Where live data shape is asserted (e.g. DI's dataQualityNotes text), the value is a STATIC
 * message string emitted by the parser, not a numeric/measured count.
 *
 * Contrast delegation: WCAG contrast ratios are NOT computed here (Playwright cannot reliably
 * assert them) — that adjudication is the auditor's static SA contrast_pairs check, per PM plan.
 */
import { test, expect, type Page } from '@playwright/test';

const BASE_URL = 'http://localhost:5173';
const DESKTOP_VIEWPORT = { width: 1280, height: 800 };

// ---- Shared helpers (DRY — Function Body Deduplication rule) -----------------

async function gotoParty(page: Page): Promise<void> {
  await page.setViewportSize(DESKTOP_VIEWPORT);
  await page.goto(BASE_URL);
  await expect(page.getByTestId('party-page')).toBeVisible({ timeout: 10000 });
}

/** Same house convention as the s2 spec: PartyMemberCard triggers are the only
 *  `button[aria-label]` elements on the party surface. */
function getCards(page: Page) {
  return page.getByTestId('party-page').locator('button[aria-label]');
}

/** Clicks the Nth party card and waits for the agent-detail drill-down to mount. */
async function openAgentDetail(page: Page, cardIndex: number): Promise<void> {
  const card = getCards(page).nth(cardIndex);
  await expect(card).toBeVisible({ timeout: 10000 });
  await card.click();
  await expect(page.getByTestId('agent-detail-page')).toBeVisible({ timeout: 10000 });
}

/** House convention (agent-timeline-zoom.spec.ts, s2 party-shell spec): guard against the
 *  Zustand object-selector render-loop regression class. */
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

/** ProvenanceChip/equipment rows render as `role="listitem"`; both empty-slice and populated-slice
 *  are legitimate live states depending on which real agent the party grid surfaces first — assert
 *  ONE of the two honest structural states, never a hardcoded row count. */
async function assertPanelHasRowsOrEmptyState(
  panel: ReturnType<Page['getByTestId']>,
  emptyMessagePattern: RegExp,
): Promise<void> {
  const rowCount = await panel.locator('[role="listitem"]').count();
  if (rowCount > 0) {
    await expect(panel.locator('[role="listitem"]').first()).toBeVisible();
  } else {
    await expect(panel.getByText(emptyMessagePattern).first()).toBeVisible();
  }
}

/** tRPC httpBatchLink sends the mutation body as `{ "0": <input> }` (verified precedent:
 *  prog-studio-vision-s2-d1-export.spec.ts) — older/alternate shapes wrap the input in `.json`.
 *  Extracts the `name` field from an intercepted agent.save POST body robustly across both. */
function extractAgentSaveName(body: unknown): string | undefined {
  if (!body || typeof body !== 'object') return undefined;
  const rec = body as Record<string, { name?: string; json?: { name?: string } }>;
  const entry0 = rec['0'];
  return entry0?.name ?? entry0?.json?.name;
}

const SAVE_SUCCESS_BODY = JSON.stringify([
  { result: { data: { json: { success: true, filePath: '/test/e2e-mocked-save.md' } } } },
]);

// ================================================================================
// PROOF 1 — Browse absorption: Materia/Equipment/Abilities panels render live data
// ================================================================================

test('PROOF 1 — Browse absorption: agent-detail renders Materia/Equipment/Abilities panels with live data', async ({
  page,
}) => {
  const guard = attachRenderLoopGuard(page);
  await gotoParty(page);
  await openAgentDetail(page, 0);

  const materiaPanel = page.getByTestId('detail-materia-panel');
  const equipmentPanel = page.getByTestId('detail-equipment-panel');
  const abilitiesPanel = page.getByTestId('detail-abilities-panel');
  await expect(materiaPanel).toBeVisible();
  await expect(equipmentPanel).toBeVisible();
  await expect(abilitiesPanel).toBeVisible();

  // Abilities is CONTRACTED empty for every agent this sprint (program.md §5 note 2) — its honest
  // empty state is the default render path, asserted directly (not conditionally).
  await expect(abilitiesPanel.getByText('No recorded abilities for this agent.')).toBeVisible();

  // Materia (skills+hooks) and Equipment (tools) rows show a provenance/tool value OR their honest
  // empty state — structural, not a locked count (live data varies per agent).
  await assertPanelHasRowsOrEmptyState(materiaPanel, /No recorded (skills|hooks) for this agent\./);
  await assertPanelHasRowsOrEmptyState(equipmentPanel, /No recorded tools for this agent\./);

  guard.assertNoRenderLoopErrors();
});

// ================================================================================
// PROOF 2 — Graph absorption: relationship panel renders a VISIBLE edge (not just a mounted canvas)
// ================================================================================

test('PROOF 2 — Graph absorption: relationship panel renders a visible edge + DETECTED/INFERRED legend', async ({
  page,
}) => {
  await gotoParty(page);
  await openAgentDetail(page, 0);

  const relationshipPanel = page.getByTestId('detail-relationship-panel');
  await expect(relationshipPanel).toBeVisible();
  await expect(relationshipPanel.locator('.react-flow')).toBeVisible({ timeout: 8000 });

  // AUD#2 VISUAL_BLINDSPOT guard: a mounted canvas is NOT proof — assert a VISIBLE edge, not just
  // its DOM presence, and assert count > 0 (never hardcode the number of edges).
  const edges = relationshipPanel.locator('.react-flow__edge');
  await expect(edges.first()).toBeVisible({ timeout: 8000 });
  expect(await edges.count()).toBeGreaterThan(0);

  // Confidence surfaced as real DOM text (not color-only) — the legend is static UI, not measured
  // data, so its two labels are asserted directly; the per-node marker's VALUE is asserted
  // structurally (one of the two enum members), never a hardcoded confidence.
  const legend = page.getByTestId('relationship-confidence-legend');
  await expect(legend).toBeVisible();
  await expect(legend).toContainText('Detected');
  await expect(legend).toContainText('Inferred');

  const confidenceMarker = page.getByTestId('relationship-node-confidence').first();
  await expect(confidenceMarker).toBeVisible();
  await expect(confidenceMarker).toHaveText(/^(DETECTED|INFERRED)$/);
});

// ================================================================================
// PROOF 3a — Edit absorption: explicit role/aria-modal, explicit focus, type, mocked save success
// ================================================================================

test('PROOF 3a — Edit absorption: revise dialog opens with explicit role/aria-modal + focus, edits save via the real mutation (mocked at the network boundary)', async ({
  page,
}) => {
  // Intercept BEFORE any navigation — the mutation must never reach the server/disk in this spec.
  const capturedSaves: unknown[] = [];
  await page.route('**/trpc/agent.save**', async (route) => {
    capturedSaves.push(route.request().postDataJSON());
    await route.fulfill({ status: 200, contentType: 'application/json', body: SAVE_SUCCESS_BODY });
  });

  await gotoParty(page);
  await openAgentDetail(page, 0);

  const trigger = page.getByTestId('revise-spec-trigger');
  await expect(trigger).toBeVisible();
  await trigger.click();

  // Explicit role/aria-modal (s2 AA §6 G2 binding — never rely on base-ui defaults).
  const dialog = page.locator('[role="dialog"][aria-modal="true"]');
  await expect(dialog).toBeVisible();

  const textarea = dialog.locator('textarea[aria-label^="Markdown editor for "]');
  await expect(textarea).toBeVisible({ timeout: 8000 });
  // Explicit-focus proof: the editable content is focused on open, never the dialog shell/body.
  await expect(textarea).toBeFocused({ timeout: 3000 });

  // Token-collision guard (Shadcn/FF7 pitfall class): the editor text must resolve to a real,
  // non-transparent, readable color against its own background — not just be present in the DOM.
  const editorStyles = await textarea.evaluate((el) => {
    const cs = getComputedStyle(el);
    return { color: cs.color, background: cs.backgroundColor };
  });
  expect(editorStyles.color).not.toBe('rgba(0, 0, 0, 0)');
  expect(editorStyles.color).not.toBe(editorStyles.background);

  await textarea.type('\n<!-- PROOF-3a-EDIT-MARKER -->');
  await expect(textarea).toContainText('PROOF-3a-EDIT-MARKER');

  const saveBtn = dialog.getByRole('button', { name: 'Save' });
  await expect(saveBtn).toBeEnabled();
  await saveBtn.click();

  await expect(dialog.getByText('Saved')).toBeVisible({ timeout: 8000 });
  expect(capturedSaves.length).toBeGreaterThan(0);
});

// ================================================================================
// PROOF 3b — Edit absorption buffer regression (SC3): A -> B never carries A's content forward
// ================================================================================

test('PROOF 3b — Edit absorption buffer regression: switching agents never carries stale content forward, and the save payload targets the currently-open agent', async ({
  page,
}) => {
  const capturedSaves: unknown[] = [];
  await page.route('**/trpc/agent.save**', async (route) => {
    capturedSaves.push(route.request().postDataJSON());
    await route.fulfill({ status: 200, contentType: 'application/json', body: SAVE_SUCCESS_BODY });
  });

  await gotoParty(page);

  // --- Agent A: open, type a distinguishable marker, close without saving. ---
  await openAgentDetail(page, 0);
  const triggerA = page.getByTestId('revise-spec-trigger');
  await triggerA.click();
  const dialogA = page.locator('[role="dialog"][aria-modal="true"]');
  await expect(dialogA).toBeVisible();
  const textareaA = dialogA.locator('textarea[aria-label^="Markdown editor for "]');
  await expect(textareaA).toBeVisible({ timeout: 8000 });
  const targetNameA = (await textareaA.getAttribute('aria-label'))?.replace('Markdown editor for ', '');
  await textareaA.type('\n<!-- BUFFER-REGRESSION-MARKER-A -->');
  await expect(textareaA).toContainText('BUFFER-REGRESSION-MARKER-A');

  // Escape closes and returns focus to the trigger (explicit-focus round-trip proof).
  await page.keyboard.press('Escape');
  await expect(dialogA).not.toBeVisible();
  await expect(triggerA).toBeFocused();

  // --- Back to party, open a DIFFERENT agent's detail (agent B). ---
  await page.getByTestId('detail-back').click();
  await expect(page.getByTestId('party-page')).toBeVisible({ timeout: 8000 });
  await openAgentDetail(page, 1);

  const triggerB = page.getByTestId('revise-spec-trigger');
  await triggerB.click();
  const dialogB = page.locator('[role="dialog"][aria-modal="true"]');
  await expect(dialogB).toBeVisible();
  const textareaB = dialogB.locator('textarea[aria-label^="Markdown editor for "]');
  await expect(textareaB).toBeVisible({ timeout: 8000 });
  const targetNameB = (await textareaB.getAttribute('aria-label'))?.replace('Markdown editor for ', '');

  expect(targetNameB).toBeTruthy();
  expect(targetNameB).not.toBe(targetNameA);
  // The contamination regression guard: B's freshly-loaded buffer never contains A's typed marker.
  await expect(textareaB).not.toContainText('BUFFER-REGRESSION-MARKER-A');

  await textareaB.type('\n<!-- BUFFER-REGRESSION-MARKER-B -->');
  const saveBtnB = dialogB.getByRole('button', { name: 'Save' });
  await expect(saveBtnB).toBeEnabled();
  await saveBtnB.click();
  await expect(dialogB.getByText('Saved')).toBeVisible({ timeout: 8000 });

  // Route-intercepted at the network boundary BEFORE the save reached the server — never a
  // cross-target (or any) disk write. Assert the captured payload's `name` targets B, not A.
  expect(capturedSaves.length).toBeGreaterThan(0);
  const savedName = extractAgentSaveName(capturedSaves[capturedSaves.length - 1]);
  expect(savedName).toBe(targetNameB);
  expect(savedName).not.toBe(targetNameA);
});

// ================================================================================
// Back-to-party affordance
// ================================================================================

test('back-to-party: detail-back click returns to the party surface', async ({ page }) => {
  await gotoParty(page);
  await openAgentDetail(page, 0);

  const backBtn = page.getByTestId('detail-back');
  await expect(backBtn).toHaveAccessibleName('Back to party');
  await backBtn.click();
  await expect(page.getByTestId('party-page')).toBeVisible({ timeout: 8000 });
});

// ================================================================================
// DI honest-empty detail — capability proof for a role with no spec on disk
// ================================================================================

test('DI honest-empty detail: a role with no spec on disk renders honest empty panels, never a crash', async ({
  page,
}) => {
  // DI (ROSTER.specFile: null) ranks outside PARTY_GRID_DISPLAY_CAP=6 in the live activity-sorted
  // roster (verified live, 2026-07-08: 12th of 13 by lastActivityTs), so it is not reachable via a
  // real card today (PM risk_flag "6-of-13 reachability" — a UI-entry deferral, not a capability
  // gap). Force it into view via the SAME page.route technique the s2 suite already uses for its
  // own empty/loading/error PartyGrid states — only roster.getParty is mocked; the SUBSEQUENT
  // roster.getAgentDetail(DI) call below is REAL/unmocked, proving live end-to-end capability.
  await page.route('**/trpc/roster.getParty**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([
        {
          result: {
            data: {
              members: [
                {
                  code: 'DI',
                  roleCategory: 'Meta',
                  materiaColorKey: '--mp',
                  portraitSeed: 'DI',
                  stats: [
                    { label: 'Activity', raw: 1, normalized: 50, derivation: 'activity-spawns-normalized', feasibility: 'available' },
                    { label: 'Stamina', raw: 1, normalized: 99, derivation: 'stamina-inverse-ghost', feasibility: 'available' },
                    { label: 'Accuracy', raw: null, normalized: null, derivation: 'accuracy-firstpass', feasibility: 'available', reason: 'not audit-gated' },
                  ],
                  lastActivityTs: new Date().toISOString(),
                  hasCorpusActivity: true,
                },
              ],
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

  await gotoParty(page);
  await openAgentDetail(page, 0);

  await expect(page.getByTestId('detail-materia-panel')).toBeVisible();
  await expect(page.getByTestId('detail-equipment-panel')).toBeVisible();
  await expect(page.getByTestId('detail-abilities-panel')).toBeVisible();
  await expect(page.getByText('No recorded skills for this agent.')).toBeVisible();
  await expect(page.getByText('No recorded hooks for this agent.')).toBeVisible();
  await expect(page.getByText('No recorded tools for this agent.')).toBeVisible();
  await expect(page.getByText('No recorded abilities for this agent.')).toBeVisible();

  // DI has no ROSTER_AGENT_NAME_BY_CODE entry (no spec exists to revise) — the honest fallback
  // status text renders instead of a trigger; never a crash / blank panel.
  await expect(page.getByTestId('revise-spec-trigger')).toHaveCount(0);
  await expect(page.getByText('No spec on disk to revise for this role.')).toBeVisible();

  // dataQualityNotes surfaces the real gap note (silent-empty forbidden) — a static parser
  // message, not a measured/data-derived count. The note legitimately renders more than once
  // (Materia + Equipment panels each surface their matching note, AND the page-level
  // DataQualityNotes section surfaces every note) — `.first()` proves visibility without
  // over-constraining to a single render site.
  await expect(page.getByText(/no agent spec on disk for code DI/).first()).toBeVisible();
});

// ================================================================================
// A11Y — keyboard operability + heading structure
// ================================================================================

test('a11y: detail page is keyboard-operable — Tab reaches the revise trigger, Enter activates it, Back-to-party returns via keyboard', async ({
  page,
}) => {
  await gotoParty(page);
  await openAgentDetail(page, 0);

  const backBtn = page.getByTestId('detail-back');
  await backBtn.focus();
  await expect(backBtn).toBeFocused();

  // Tab forward from Back-to-party until the revise trigger receives focus. Bounded loop (not an
  // exact-stop-count assertion) — React Flow's Controls buttons add a data-independent-but-
  // count-variable number of tab stops between the back button and the trigger, AND (harden,
  // prog-studio-v2-2026-07-s4-retirement-navshell-rem investigation) the relationship panel's
  // node/edge count is itself genuinely data-driven: `openAgentDetail(page, 0)` opens whichever
  // agent is currently most-recently-active (party-roster.ts `byActivityRecencyDesc` — a LIVE
  // sort, not a static fixture), and `RelationshipPanel` renders one focusable RF node + edge per
  // `relationships[]` entry with no cap (`buildRelationshipGraph`). For a heavily-connected agent
  // (e.g. the orchestrator, which is systemically the most-connected role) this can legitimately
  // run into the dozens — a fixed 40-press bound was empirically proven to undercount (orchestrator
  // measured at 26 nodes + 25 edges = 55 required presses). NOTE: this is NOT a nav-shell/rail
  // regression — traced and confirmed the global SubmenuRail sits before `detail-back` in DOM
  // order and contributes zero tab stops on this forward-only path. The bound below scales with
  // the panel's actual current size instead of assuming it is always small.
  const relationshipPanel = page.getByTestId('detail-relationship-panel');
  await expect(relationshipPanel).toBeVisible();
  const rfFocusableCount =
    (await relationshipPanel.locator('.react-flow__node').count()) +
    (await relationshipPanel.locator('.react-flow__edge').count());
  const tabBound = Math.max(40, rfFocusableCount + 20);

  const reviseTrigger = page.getByTestId('revise-spec-trigger');
  let reached = false;
  for (let i = 0; i < tabBound && !reached; i += 1) {
    await page.keyboard.press('Tab');
    reached = await reviseTrigger.evaluate((el) => el === document.activeElement).catch(() => false);
  }
  expect(reached).toBe(true);

  // Keyboard-activate the trigger (native <button> Enter behavior) proves keyboard operability of
  // the Edit-absorption entry point, not just click.
  await page.keyboard.press('Enter');
  await expect(page.locator('[role="dialog"][aria-modal="true"]')).toBeVisible({ timeout: 3000 });
  await page.keyboard.press('Escape');
  await expect(page.locator('[role="dialog"][aria-modal="true"]')).not.toBeVisible();

  await backBtn.focus();
  await page.keyboard.press('Enter');
  await expect(page.getByTestId('party-page')).toBeVisible({ timeout: 8000 });
});

test('a11y: detail page heading structure has no level skips and all panel headings are present', async ({
  page,
}) => {
  await gotoParty(page);
  await openAgentDetail(page, 0);

  const detailPage = page.getByTestId('agent-detail-page');
  await expect(detailPage.getByRole('heading', { name: 'Materia' })).toBeVisible();
  await expect(detailPage.getByRole('heading', { name: 'Equipment' })).toBeVisible();
  await expect(detailPage.getByRole('heading', { name: 'Abilities' })).toBeVisible();
  await expect(detailPage.getByRole('heading', { name: 'Relationships' })).toBeVisible();

  const levels = await detailPage.evaluate((el) =>
    Array.from(el.querySelectorAll('h1, h2, h3, h4, h5, h6')).map((h) => Number(h.tagName[1])),
  );
  expect(levels.length).toBeGreaterThan(0);
  for (let i = 1; i < levels.length; i += 1) {
    expect(levels[i] - levels[i - 1]).toBeLessThanOrEqual(1);
  }
});
