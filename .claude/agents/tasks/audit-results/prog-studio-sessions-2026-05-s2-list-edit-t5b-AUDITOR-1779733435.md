# Audit Review — prog-studio-sessions-2026-05-s2-list-edit-t5b-tabs-overview-table

**Auditor:** AUDITOR (re-audit of interrupted AU#8 spawn)
**Date:** 2026-05-25T18:25:39Z
**HEAD (clean t5a):** fc775de
**Scope:** 4 files (OverviewTab.tsx new, TableTab.tsx new, SessionDetailPage.tsx modified, s2 e2e spec modified)
**Gate sequence:** SA -> QA -> SX (stop at first FAIL)

## FINAL VERDICT

| Gate | Result |
|------|--------|
| SA (standards)   | **PASS** |
| QA (functional)  | **FAIL** |
| SX (security)    | NOT REACHED (stop-at-first-FAIL) |
| **OVERALL**      | **FAIL** |

The QA gate fails on a deterministic, non-vacuous Playwright failure in a **t5b-NEW** test.
SX was not run because the sequence stops at the first FAIL.

---

<audit_review>
  <target_file>packages/client/src/pages/sessions/tabs/OverviewTab.tsx</target_file>
  <status>PASS</status>
  <violations/>
</audit_review>

<audit_review>
  <target_file>packages/client/src/pages/sessions/tabs/TableTab.tsx</target_file>
  <status>PASS</status>
  <violations/>
</audit_review>

<audit_review>
  <target_file>packages/client/src/pages/sessions/SessionDetailPage.tsx</target_file>
  <status>PASS</status>
  <violations/>
</audit_review>

### SA notes (all four files PASS)
- TypeScript strict: no `any` anywhere; all props/returns annotated; `ColKey` is a discriminated string-union; `getCellValue`/`compareRows`/`displayCell` fully typed. `aria-sort` value narrowed to the literal union `'ascending' | 'descending' | 'none'`.
- Naming: files PascalCase (`OverviewTab.tsx`, `TableTab.tsx`); `COLUMNS` SCREAMING_SNAKE; components/functions PascalCase/camelCase. Compliant.
- Design tokens: every color/spacing/radius/font is a `var(--*)` token (`--mt`, `--wd`, `--wm`, `--sfm`, `--bd`, `--bdb`, `--rl`, `--fm`...). No raw hex in either new tsx file. Packet "tokens only" claim verified.
- Semantic HTML / a11y:
  - OverviewTab: stat row `role="group"` + `aria-label="Session statistics"`; frontmatter is a real `dl` with `dt`/`dd` pairs. Matches the packet a11y claims.
  - TableTab: `table[aria-label]`, `thead`/`tbody`, `th[scope="col"]`, `aria-sort` ON THE `<th>` (correct element, not the button), sort `<button>`s with descriptive `aria-label`, `onKeyDown` Enter/Space -> `handleSort` (native `<button>` already handles these, but explicit handler is harmless and present), empty state `aria-live="polite"`. Sort glyph `span` is `aria-hidden="true"`. No non-button interactive elements (no span/div onClick). Click-handler keyboard-equivalent gate: N/A — all interactive elements are real `<button>`s.
  - WCAG-AA: `--mt` on `--sfm`/`--void` and `--wd`/`--wm` on dark surfaces are the established FF7 token pairings used app-wide; contrast claims plausible. Not independently re-measured (no new token introduced).
- DRY: `COLUMNS` is the single source of truth for both header and cell rendering; `getCellValue`/`displayCell` separated (sort uses '' for null to sort blanks first; display uses '—'). No duplication.
- Data contract: all consumed fields (`sprint`,`date`,`status`,`type`,`title`,`gap_classes`,`source_root`,`editedFilePath`,`agents[]`,`events[]`) confirmed present in `SessionSchema` / `AgentActivitySchema` (packages/shared/src/schemas.ts:69-98). No key rename. `status` is `.optional()` and used twice in OverviewTab; both sites guard with `?? '—'`. `wall_clock_ms` is `.optional()` and TableTab guards via `getCellValue`/`displayCell` null checks. Correct.
- SessionDetailPage diff: clean — adds two imports, deletes `OverviewTabStub`/`TableTabStub`, swaps stub JSX for `<OverviewTab session={session}/>` / `<TableTab session={session}/>`, **EditorTabStub preserved for t6** (verified in diff). No other behavior touched.

---

<test_report>
  <task_id>prog-studio-sessions-2026-05-s2-list-edit-t5b-tabs-overview-table</task_id>
  <status>FAIL</status>
  <test_coverage>lint: PASS (tsc --noEmit shared+server+client, exit 0). e2e: 7 passed, 2 failed (9 total).</test_coverage>
  <playwright>
    <tier>2</tier>
    <tests_run>9</tests_run>
    <passed>7</passed>
    <failed>2</failed>
    <playwright_output>
2 failed:
  L126 'table tab shows Agent ID column header'  -> getByTestId('table-tab').getByRole('button', {name:/Agent ID/i}) NOT FOUND. Deterministic: FAILED 2/2 on --repeat-each=2.
  L19  'sessions list page renders table or empty/loading state' -> expect(hasTable||hasEmpty||hasLoading||hasError).toBe(true) was false ONCE; PASSED 2/2 on re-run. Pre-existing flaky (async data-load race), untouched by t5b.
Env: server got GANDER_ROOT=/home/jhber/projects/gander; session.list returned 16 real post-mortems. List populated; rows render; tests were NON-vacuous.
    </playwright_output>
  </playwright>
  <defects>
    <bug>
      <description>BLOCKER (t5b-NEW): test 'table tab shows Agent ID column header' clicks the FIRST list row, navigates to gander-p7-obsidian-l2-l3 which has agents.length === 0, so TableTab.tsx renders its empty-state branch ("No agent activity recorded", TableTab.tsx:99-111) instead of the column-header table. The `Agent ID` sort <button> therefore does not exist and the assertion at spec line 151 fails. This is a real, deterministic failure (2/2 repeats), NOT a vacuous pass — the `if (!hasRows) return` guard at lines 137-141 was correctly bypassed because rows DID render. The component is correct; the SPEC picks a zero-agent session.</description>
      <steps_to_reproduce>1) Set GANDER_ROOT + LOADOUTS_DIR, npm run dev (root). 2) cd packages/client. 3) npx playwright test tests/e2e/prog-studio-sessions-2026-05-s2-list-edit-fe.spec.ts -g "Agent ID column header" --repeat-each=2. Both runs fail; error-context snapshot shows tabpanel "Table" -> "No agent activity recorded" for session gander-p7-obsidian-l2-l3.</steps_to_reproduce>
      <severity>BLOCKER</severity>
    </bug>
    <bug>
      <description>MINOR / PRE-EXISTING (not t5b): line 19 'renders table or empty/loading state' read isVisible() on the inner data table before the async tRPC fetch hydrated it, so all four probes were false on a cold first paint. Passed 2/2 on re-run. This test is OUTSIDE the t5b diff (diff hunks only touch lines 62-152) and is a flaky-timing issue carried over from earlier sprint work. Flag for the sprint owner; it is not introduced by t5b and is not the gating failure, but it should be hardened (await the table or an explicit state before probing).</description>
      <steps_to_reproduce>Run the full spec cold; line 19 fails intermittently. Re-run with --repeat-each=2 -g "renders table or empty/loading state" -> 2 passed.</steps_to_reproduce>
      <severity>MINOR</severity>
    </bug>
  </defects>
</test_report>

### Vacuous-assertion scrutiny (orchestrator pre-flagged WARNING) — RESOLVED
The orchestrator flagged the `const hasRows = await firstRow.isVisible().catch(() => false); if (hasRows) {...}` / `if (!hasRows) return;` pattern as a possible vacuous-pass vector. Verdict on the THREE t5b-NEW tests:
- The dev server was launched WITH `GANDER_ROOT` (via `node --env-file=.env`), and `session.list` returned **16 real post-mortems**. So `firstRow.isVisible()` is **true on a real run** — the skip-if-absent guards are NOT silently false here. The tests are non-vacuous in this environment.
- 'overview and table tabs render real panels' (L66): PASS, non-vacuous — `toBeVisible` on `[data-testid="overview-tab"]` and `[data-testid="table-tab"]` (not behind a skip guard for the assertion itself).
- 'overview tab shows the session sprint slug text' (L96): PASS, non-vacuous — asserts `overviewTab` contains the detail h1 sprint text.
- 'table tab shows Agent ID column header' (L126): **FAIL, non-vacuous** — assertion reached and genuinely failed because the chosen first row has zero agents. This is the inverse of vacuous: the test is too WEAK in row selection, not too weak in assertion.

NOTE on residual fragility (advisory, not the gate): all three t5b tests still use `if (!hasRows) return;`. In a CI environment with an empty/misconfigured GANDER_ROOT these would pass vacuously. The remediation below should also be considered for hardening, but the gating defect is the zero-agent row selection.

---

<security_audit>
  <status>NOT REACHED</status>
  <threat_level>N/A — sequence stopped at QA FAIL</threat_level>
  <findings/>
</security_audit>

### SX note
Security scan deferred per stop-at-first-FAIL. (Informal pre-glance during reads, NON-binding: no `dangerouslySetInnerHTML`, no `innerHTML`, no new fetch/network calls, no new tRPC procedures — both tabs are pure presentational consumers of the existing `session` prop with local sort state only. A formal SX pass is owed on re-audit after the QA fix.)

---

## REQUIRED FIX (quote verbatim for remediation brief)

**File:** `packages/client/tests/e2e/prog-studio-sessions-2026-05-s2-list-edit-fe.spec.ts`
**Test:** `'table tab shows Agent ID column header'` (lines 126-152)

The test clicks `listPage.locator('tbody tr').first()` (line 137), which navigates to `gander-p7-obsidian-l2-l3` — a session with `agents.length === 0`. `TableTab.tsx` therefore renders its empty state ("No agent activity recorded", TableTab.tsx:99-111) and the `Agent ID` sort button never exists, so the assertion at line 151 fails deterministically.

The TableTab COMPONENT is correct (empty state is intended behavior). The fix belongs in the SPEC: select a session row whose underlying session has `agents.length > 0` before asserting the column header. Options:
  (a) Navigate to a known session with agents (e.g. click the row whose visible cell text is `gander-studio-p1` (agents=32) or `gander-p6-moirai-skein-skills` (agents=22)) instead of `.first()`; OR
  (b) After opening the Table tab, branch: if the empty state `[aria-live="polite"]` with text "No agent activity recorded" is shown, assert THAT instead — and add a separate, dedicated test that explicitly opens a known-non-empty session to assert the Agent ID button. (a) is preferred so the assertion remains a hard one.

Recommend FE also harden the residual `if (!hasRows) return;` guards across the three t5b tests so they cannot pass vacuously under an empty GANDER_ROOT (e.g. assert the list has >= 1 row, or run with a fixture), but that is advisory; (a) above is the blocking fix.

After the spec is corrected, re-audit must run QA again AND complete the SX gate (which was not reached this pass).
