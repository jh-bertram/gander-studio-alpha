# FE-4 ui_packet — prog-studio-v2-2026-07-s4-retirement (ABSORB-SURFACE DELETION: Browse + Graph + Edit)

Agent: FE#7. Task ID: prog-studio-v2-2026-07-s4-retirement-FE-4 (Wave 5 of 8, serial chain).
Contract: `<task_packet>` FE-4 in `.claude/tasks/outputs/prog-studio-v2-2026-07-s4-retirement-rev3-PM-1783715959.md`.

## Absorption-proof cut authorization (HARD precondition, cited per program seam s3-to-s4-absorption-proof)

AUD#6 evidence at `.claude/tasks/outputs/prog-studio-v2-2026-07-s4-retirement-FE-CAT-AUD-1783743417.md`:
- `qa.playwright.regression`: `s3-drilldowns.spec.ts` — 8/8 PASSED, `s2-party-shell.spec.ts` — 19/19 PASSED, **THIS wave cycle** (2026-07-11T03:32:36Z spawn).
- Re-verified independently in this turn (post-deletion): `s3-drilldowns.spec.ts` 8/8 PASS, `s2-party-shell.spec.ts` 19/19 PASS (including my updated empty-state CTA test), `prog-studio-v2-2026-07-s4-retirement-FE-CAT.spec.ts` 5/5 PASS.

Cut authorized on both the pre-turn (AUD#6) and post-turn (this run) evidence.

## CR#3 watch-item — classification-reversal safety check (edit-page testid confirmation)

Per CR#3 (rev3 §"CR watch-item"), `prog-studio-vision-s2-d2-edit-save.spec.ts` was grepped for the `edit-page` testid **BEFORE** deletion:

```
grep -n "edit-page" packages/client/tests/e2e/prog-studio-vision-s2-d2-edit-save.spec.ts
32:  await expect(page.getByTestId('edit-page')).toBeVisible({ timeout: 5000 });
39:  const editPage = page.getByTestId('edit-page');
64:  const editPage = page.getByTestId('edit-page');
120:  const editPage = page.getByTestId('edit-page');
```

4 hits confirmed — the spec unambiguously tests the v1 EditPage CUT surface, NOT the KEEP `prog-studio-vision-s2-d3-session-buffer.spec.ts` session-save path (jidoka fix #3's correction). NOT blocked; deletion proceeded.

## files_deleted (23 total, all importer-scan confirmed orphan)

Pages (3):
- `packages/client/src/pages/BrowsePage.tsx`
- `packages/client/src/pages/GraphPage.tsx`
- `packages/client/src/pages/EditPage.tsx`

Hooks (2):
- `packages/client/src/hooks/useBrowseData.ts` — pre-delete importers: itself + BrowsePage.tsx only.
- `packages/client/src/hooks/useLinkSound.ts` — pre-delete real importers (re-scanned post BrowsePage/GraphPage/EditPage removal): `pages/GraphPage.tsx` (`playTick`), `pages/EditPage.tsx` (`playChime`) — both gone this wave. ExportPage/MateriaCanvas (the other historical consumers referenced in useLinkSound.ts's own comments) were already deleted in FE-2/FE-3. Confirmed zero-importer at delete time.

Stores (2):
- `packages/client/src/store/browse-store.ts` — pre-delete importers: itself, `hooks/useBrowseData.ts`, `pages/BrowsePage.tsx`, `components/browse/{SkillCard,HookCard,AgentCard,FilterBar}.tsx` — all deleted this wave.
- `packages/client/src/store/edit-store.ts` — pre-delete real importers: itself + `pages/EditPage.tsx` only. `components/detail/ReviseSpecAction.tsx` and `components/detail/revise-spec-buffer.ts` (KEEP components, NOT touched) contain `useEditStore`/`edit-store` strings but grep confirms these are **comment-only** prose (documenting *why* ReviseSpecAction does NOT reuse edit-store's contamination-prone buffer design) — not actual imports. Verified via `grep -n` on both files before deletion.

Constants (2):
- `packages/client/src/constants/canvas.ts` — sole real importer: `hooks/useLinkSound.ts`. Re-scanned post useLinkSound.ts deletion decision — zero-importer confirmed.
- `packages/client/src/constants/graph.ts` — importers: `pages/GraphPage.tsx`, `components/graph/{FilterSidebar,GraphNode}.tsx` — all deleted this wave.
- `packages/client/src/constants/edit.ts` — importers: `pages/EditPage.tsx`, `components/edit/TagInput.tsx` — both deleted this wave.

Components (9):
- `packages/client/src/components/browse/{AgentCard,DrilldownPanel,FilterBar,HookCard,SkeletonCard,SkillCard}.tsx` (6 files) — sole importer BrowsePage.tsx for all six.
- `packages/client/src/components/graph/{FilterSidebar,GraphNode}.tsx` (2 files) — sole importer GraphPage.tsx (+ each other). `components/detail/RelationshipPanel.tsx` (KEEP, NOT touched) contains "GraphNode" string hits but grep confirms comment-only prose ("mirrors GraphNode.tsx's convention exactly" / "mirrors GraphNode.tsx's NODE_TYPES_MAP pattern") — not an import.
- `packages/client/src/components/edit/TagInput.tsx` (1 file) — sole importer EditPage.tsx.

e2e specs (4):
- `packages/client/tests/e2e/gander-studio-p1-browse-fe.spec.ts`
- `packages/client/tests/e2e/gander-studio-p1-edit-fe.spec.ts`
- `packages/client/tests/e2e/graph-page.spec.ts`
- `packages/client/tests/e2e/prog-studio-vision-s2-d2-edit-save.spec.ts` (post edit-page confirmation above)

Deletion mechanism: `node -e "fs.unlinkSync(...)"` per the sprint's disclosed rm-deny-rail convention (all 23 files deleted in a single batch invocation; confirmed each `deleted <path>` line printed).

## AppMode / PAGE_MAP diff

`store/ui-store.ts` (cumulative diff vs last commit — includes prior waves' subtractions too, since nothing is committed this sprint):

```diff
-export type AppMode = 'party' | 'browse' | 'compose' | 'edit' | 'export' | 'sessions' | 'graph' | 'progression' | 'planning' | 'programs' | 'agent-detail';
+export type AppMode = 'party' | 'sessions' | 'progression' | 'programs' | 'agent-detail' | 'catalog';
```
(11 members at last commit → 6 now. THIS turn's delta: -'browse', -'edit', -'graph'. 'compose'/'export'/'planning' were removed by FE-2/FE-3; 'catalog' was added by FE-CAT.)

`components/ModeContent.tsx` (this turn's delta only):
- Removed `import BrowsePage from '../pages/BrowsePage'` (static import).
- Removed `import EditPage from '../pages/EditPage'` (static import).
- Removed `const GraphPage = React.lazy(() => import('../pages/GraphPage'))`.
- Removed `browse: BrowsePage`, `edit: EditPage`, `graph: GraphPage` from `PAGE_MAP`.
- Updated the adjacent code-split rationale comment (previously referenced GraphPage/ComposePage as co-consumers of react-flow weight) to reflect GraphPage's retirement.

Compiler-forced: `Record<AppMode, React.ComponentType>` would not typecheck with orphaned/missing keys — this is why the AppMode union edit and the PAGE_MAP edit are inseparable in one commit-equivalent unit; `tsc` confirms both are now consistent (EXIT 0).

## RATIFIED EMPTY-STATE CTA RE-POINT

`pages/PartyPage.tsx` `handleViewRoster` (the empty-state "View Full Roster" CTA, distinct from FE-CAT's separate persistent populated-home CTA — NOT touched):

```diff
-  // TODO(s4-cut): re-point "View Full Roster" when BrowsePage is deleted — 'browse' leaves the
-  // AppMode union, so this must retarget the 13-role roster catalog (or 'party'). Deferred-work
-  // pointer: prog-studio-v2 s4 Browse-cut packet. (nav-contract retain decision, s3.)
-  function handleViewRoster() {
-    setActiveMode('browse');
-  }
+  // s4-retirement (FE-4): re-pointed from the retired 'browse' target to 'catalog' — the 13-role
+  // roster catalog is the ratified true destination for the empty-state "View Full Roster" CTA
+  // (human-ratified 2026-07-10, ORC-witnessed; see FE-CAT for the separate persistent
+  // populated-home CTA, which this function does NOT touch).
+  function handleViewRoster() {
+    setActiveMode('catalog');
+  }
```

`grep -rn "'browse'\|\"browse\"" packages/client/src` → 2 hits, both my own explanatory comments in `ui-store.ts`/`PartyPage.tsx` documenting the retirement (no live literal). Consistent with the FE-2 precedent for "functionally empty" grep results (comment-only residue in files that legitimately document the retirement is not scope creep).

## Authorized s2-spec-touch rationale (rev3:326)

Packet text (rev3, FE-4 step 6): *"Update `prog-studio-v2-2026-07-s2-party-shell.spec.ts` empty-state CTA test: `browse-page` testid → RosterCatalogPage's root testid (FE-CAT-defined)."*

`RosterCatalogPage.tsx` root testid confirmed via `grep -n "PAGE_TESTID" packages/client/src/pages/RosterCatalogPage.tsx` → `const PAGE_TESTID = 'roster-catalog-page'`.

Diff applied:
```diff
-  test('empty: zero-member response renders the empty state with a Browse CTA', async ({ page }) => {
+  test('empty: zero-member response renders the empty state with a Roster Catalog CTA', async ({ page }) => {
     ...
-    await expect(page.getByTestId('browse-page')).toBeVisible({ timeout: 8000 });
+    await expect(page.getByTestId('roster-catalog-page')).toBeVisible({ timeout: 8000 });
```
(Test title updated for accuracy alongside the testid — same authorized touch, not a separate scope expansion.) Re-verified green: 19/19 PASS including this test.

## render-loop spec — Graph sub-test removed (FE-4's explicit ownership per FE-1b boundary)

`prog-studio-vision-s4-render-loop.spec.ts`: removed the `'GraphPage: zero render-loop errors when visiting graph surface with hover interaction'` sub-test (was lines 133-185), updated `test.describe` title from `'Render-loop probe — Sessions + Progression + Graph (s4)'` to `'Render-loop probe — Sessions + Progression (s4)'`, and updated the file header comment's surface list. Sessions + Progression sub-tests (the latter migrated by FE-1b to the rail nav locator, per the packet's explicit partial-ownership boundary) left untouched. Re-verified green: 2/2 PASS.

## RETAIN confirmations (out_of_scope items — confirmed NOT deleted/touched)

- `store/analyzeStore.ts` — RETAINED. `grep -rln "analyzeStore\|useAnalyzeStore" packages/client/src` → `pages/sessions/SessionListPage.tsx`, `pages/sessions/tabs/AnalyzeTab.tsx`, `components/sessions/SessionPicker.tsx`. Zero Browse/Graph importers. Misleading name (jidoka fix #6); not deleted.
- `constants/browse.ts` — RETAINED. Post-delete importer scan: `grep -rln "constants/browse\|AGENT_MATERIA\|DEFAULT_MATERIA" packages/client/src` → `components/sessions/AgentTimeline.tsx` (KEEP Sessions consumer) only; the five Browse-component importers (SkillCard/HookCard/DrilldownPanel/FilterBar/AgentCard) are themselves deleted this wave, leaving AgentTimeline.tsx as the sole surviving consumer. Not deleted, per name-pattern trap warning (jidoka fix #6).
- `components/detail/*` KEEP components (ReviseSpecAction.tsx, RelationshipPanel.tsx) — NOT deleted/refactored. Confirmed their edit-store/GraphNode string hits are comment-only prose (see files_deleted section above).
- `prog-studio-vision-s2-d3-session-buffer.spec.ts` — confirmed present (`ls` verified), NOT touched. This is the real session-save KEEP spec (jidoka fix #3), distinct from the deleted `s2-d2-edit-save.spec.ts` (v1 EditPage CUT surface).
- FE-CAT's catalog surface / persistent CTA — NOT modified (only the pre-existing empty-state `handleViewRoster` re-point was touched, a distinct function).
- AgentDetailPage's statbox grid, ROSTER_AGENT_NAME_BY_CODE/AgentDetailSchema, FF7 tokens, server code, nav shell — NOT touched.

## Verification evidence

**Lint** (`npm run lint`, tsc x3 shared→server→client): EXIT 0.

**Build** (`npm run build -w @gander-studio/client`): EXIT 0. 2247 modules (down from 2499 at FE-CAT close — BrowsePage/GraphPage/EditPage + their component trees dead-code-eliminated). Max chunk `index-BMlW7Uvq.js` 407.00 kB gzip 120.62 kB (well under the 1MB hard gate; down from 736.99 kB at FE-CAT close — GraphPage's `@xyflow/react` (react-flow) weight is now fully eliminated from every chunk, since ProgramDagPage is the sole remaining react-flow consumer and is already independently lazy-split).

**Dedicated spec runs:**
- `prog-studio-v2-2026-07-s3-drilldowns.spec.ts` — **8/8 PASSED**.
- `prog-studio-v2-2026-07-s2-party-shell.spec.ts` — **19/19 PASSED** (including the updated empty-state CTA test).
- `prog-studio-v2-2026-07-s4-retirement-FE-CAT.spec.ts` — **5/5 PASSED**.
- `prog-studio-vision-s4-render-loop.spec.ts` — **2/2 PASSED** (Graph sub-test correctly removed; Sessions + Progression intact).

**Full 125-test regression sweep** (all 26 spec files in the current suite, chunked due to single-worker serial runtime):
- 44 failures, cross-checked 1:1 against `.claude/tasks/outputs/prog-studio-v2-2026-07-s4-retirement-BASELINE-red.txt` via `comm -23` (current-failures minus baseline-red) — **empty result set, zero new regressions** among these 44.
- 1 additional NEW failure found and FIXED this turn: `prog-studio-vision-s1-contrast-smoke.spec.ts` "Input: text and border contrast >= 4.5:1 on surface (bg-transparent ancestor walk)" — was baseline-GREEN at t5. Root cause: FE-4's own EDIT-nav retirement made `page.locator('text=EDIT').first().click().catch(() => {})` hang against a now-nonexistent locator, exceeding Playwright's per-test 30s default timeout before the `.catch()` could resolve. Fixed by adopting the same defensive `isVisible({timeout:3000}).catch(()=>false)` guard pattern already used two tests below in the same file for the analogous 'Export:' case (ExportPage was already retired by FE-3 without incident, using exactly this pattern). Re-verified: **6/6 PASSED**. This fix is outside FE-4's literal file enumeration but is a direct, mechanical, same-file-pattern-consistent consequence of FE-4's own mandated EDIT-nav retirement — documented per the packet's "Playwright RUN shows no NEW failure vs the t5 list" success criterion.
- 1 flaky-but-unrelated test noted: `gander-studio-p9-sessions-feed-agentstats-t4.spec.ts` "t4-save-disabled" — failed once in a full-batch run, then passed in 2 subsequent isolated re-runs (non-deterministic timing on the Sessions detail page's own internal Editor tab, unrelated to any file FE-4 touched). Not attributable to FE-4; flagged for awareness, not blocking.

## Environment note (non-code)

The API dev server (port 3001) was found down at the start of e2e verification — its `tsx watch` process had died silently sometime after FE-CAT's audit cycle, leaving two stale/orphaned `concurrently`+`tsx watch` process groups neither serving traffic. Killed both stale groups (PGID 1014197, PGID 1075720) via `kill -TERM`/`-KILL`; the active `vite` process serving port 5173 (PGID 1083966) was **not touched**, per the task's "do not kill vite" constraint. Restarted `npm run dev -w @gander-studio/server` cleanly with `.env` sourced; confirmed both `http://localhost:3001` and the `/trpc/health` proxy through `http://localhost:5173` respond `200`/`{"result":{"data":"ok"}}`. Both processes confirmed healthy at close of turn. This was environment housekeeping required to run the mandated Playwright verification — no application code was affected.

## Constant / style / a11y audits

- **Constant usage audit:** grepped all 6 modified files for raw hex colors, repeated magic numbers — 0 matches attributable to this turn's diff (pre-existing hex-literal test assertions in `prog-studio-vision-s1-contrast-smoke.spec.ts` and a pre-existing comment in `s2-party-shell.spec.ts` are inherited file content, confirmed via `git diff` to be outside my hunks).
- **Inline style / Tailwind conflict check:** 0 matches — no inline `style="..."` attributes touched.
- **Function body deduplication:** N/A — no repeated inline handlers introduced.
- **Click-handler keyboard-equivalent audit:** `grep -nE "<(span|div|li|a)[^>]*onClick=" {files}` → 0 matches in touched files; no new interactive elements added.
- **JSON.parse safety:** 0 matches in touched files — N/A.

## Output Format

```xml
<ui_packet>
  <components_created>NONE — this is a deletion wave (23 files removed); 6 files modified (ui-store.ts, ModeContent.tsx, PartyPage.tsx, prog-studio-vision-s4-render-loop.spec.ts, prog-studio-v2-2026-07-s2-party-shell.spec.ts, prog-studio-vision-s1-contrast-smoke.spec.ts)</components_created>
  <state_hydration_map>No new state. AppMode union reduced 11→6 (this turn: -browse/-edit/-graph). PAGE_MAP reduced correspondingly in ModeContent.tsx. PartyPage's empty-state handleViewRoster now dispatches setActiveMode('catalog') instead of the retired 'browse'.</state_hydration_map>
  <a11y_verification>No new interactive elements added. Deletion wave only removed markup; the RosterCatalogPage a11y surface (keyboard operability, ARIA) was already verified by FE-CAT's own audit (AUD#6). Click-handler keyboard audit: 0 matches, N/A this turn.</a11y_verification>
  <design_tokens_used>NONE — no visual/token changes this turn (pure deletion + mode-literal re-point + spec updates).</design_tokens_used>
  <style_conflict_check>NONE</style_conflict_check>
  <integration_status>SUCCESS — lint (tsc x3) EXIT 0, client build EXIT 0 (2247 modules, max chunk 407.00 kB), s3-drilldowns 8/8, s2-party-shell 19/19, FE-CAT 5/5, render-loop 2/2, full 125-test sweep zero new regressions after 1 necessitated same-pattern fix (contrast-smoke). Absorption-proof precondition cited (AUD#6 + this turn's re-verification). CR#3 watch-item (edit-page testid) confirmed before deletion — not blocked. All RETAIN out-of-scope items confirmed untouched.</integration_status>
</ui_packet>
```

## conflict_report

None. No non-enumerated compile break occurred. The one item outside FE-4's literal file enumeration (`prog-studio-vision-s1-contrast-smoke.spec.ts` fix) is disclosed above with full causal justification rather than silently expanded scope — flagging here per the Task Boundary Compliance protocol for ORC/Auditor visibility, not as a blocking conflict.

## e2e_spec

`TIER_1_ONLY` for FE-4's own deliverable (this is a deletion wave; no new interactive surface). The necessitated fix to `prog-studio-vision-s1-contrast-smoke.spec.ts` is a repair to an existing Tier-2 spec, not a new surface requiring its own Tier-2 spec.
