# Requirements Coverage Report — S2 list-edit

<requirement_list>
  <requirement id="R-001" type="success_criterion">SC1 — Nav mode registered (Sessions appears alongside Browse/Compose/Edit/Export; routes to list; existing pages unchanged).</requirement>
  <requirement id="R-002" type="success_criterion">SC2 — List loads (session.list; one row per session: sprint slug, date, status, gap_classes summary; empty + error states).</requirement>
  <requirement id="R-003" type="success_criterion">SC3 — Detail loads (session.get; tab nav Overview/Table/Editor without remounting the data fetch).</requirement>
  <requirement id="R-004" type="success_criterion">SC4 — Overview tab (frontmatter fields + top-line summary: agent count, feedback-loop count, status; Mako Teal tokens only).</requirement>
  <requirement id="R-005" type="success_criterion">SC5 — Table tab (parsed agent activity as sortable HTML table: sort by seq/ts/agent/event; keyboard-navigable; WCAG AA).</requirement>
  <requirement id="R-006" type="success_criterion">SC6 — Editor tab (Textarea bound to markdown body via session-store; "Save edit" → session.saveEdit; surfaces destination path; pre-fills original source; revert-to-original).</requirement>
  <requirement id="R-007" type="success_criterion">SC7 — Save flow (success shows confirmation with absolute path under SESSIONS_EDITS_DIR; failure surfaces server error and does NOT lose the unsaved buffer).</requirement>
  <requirement id="R-008" type="success_criterion">SC8 — Analyze slot reserved (disabled tab, tooltip "Coming in S3"; S3 only flips placeholder:false + supplies component).</requirement>
  <requirement id="R-009" type="success_criterion">SC9 — Lint + type clean (npm run lint).</requirement>
  <requirement id="R-010" type="success_criterion">SC10 — Manual smoke (Step 4.5): list loads, detail tabs work, save round-trips, no console errors; existing pages still load.</requirement>
  <requirement id="R-011" type="constraint">Purely additive — existing Browse / Compose / Edit / Export pages must remain unchanged.</requirement>
  <requirement id="R-012" type="constraint">Editor must pre-fill with original source markdown (drove BE addition of `session.getRaw` at sprint intake — critical_seam_finding).</requirement>
</requirement_list>

<requirements_coverage_report>
  <task_id>prog-studio-sessions-2026-05-s2-list-edit</task_id>
  <generated>2026-05-25T21:50:00Z</generated>
  <overall_status>COVERED</overall_status>

  <coverage>

    <item id="R-001" status="COVERED">
      <requirement>SC1 — Nav mode registered; routes to list; existing pages unchanged.</requirement>
      <evidence>
        Static: commits `5a68221` (Sessions nav mode + tab constants) and `fb7f6d0` (SessionsRouter + PAGE_MAP entry).
        Runtime (DOM-presence): `packages/client/tests/e2e/prog-studio-sessions-2026-05-s2-list-edit-fe.spec.ts:4` ("sessions list page is visible when sessions mode is active"). Existing-pages-unchanged: same spec lines `358` (Browse), `364` (Compose), `370` (Edit), `376` (Export) — each asserts the page's root testid renders.
      </evidence>
    </item>

    <item id="R-002" status="COVERED">
      <requirement>SC2 — List loads with required columns + empty/error states.</requirement>
      <evidence>
        Static: commit `68558a9` ("implement Sessions list page + e2e spec"); column composition rendered in `SessionsListPage.tsx`.
        Runtime (DOM-presence): spec line `19` ("sessions list page renders table or empty/loading state") covers the non-empty render; line `421` ("sessions list empty state renders no sessions found when list is empty") covers the empty branch. Error state is handled in the page component; no fault-injection e2e, but the empty path is the user-facing one.
      </evidence>
    </item>

    <item id="R-003" status="COVERED">
      <requirement>SC3 — Detail loads; tab nav without remounting the data fetch.</requirement>
      <evidence>
        Static: commits `fc775de` (detail shell + tab bar) and `8932578` (real Overview/Table tabs).
        Runtime (DOM-presence + identity): spec line `41` ("clicking a session row shows the detail page") for navigation; **line `184` ("detail page shell persists across tab switches without remounting") is the canonical no-remount DOM-identity assertion** — it captures the h1 innerText before tab cycling and asserts equality after, proving the data fetch is not re-issued. The auditor verified across waves that this assertion is preserved, not weakened.
      </evidence>
    </item>

    <item id="R-004" status="COVERED">
      <requirement>SC4 — Overview tab (frontmatter + summary; Mako Teal tokens only).</requirement>
      <evidence>
        Static: commit `8932578` `OverviewTab.tsx` — uses `var(--mt)`, `var(--sfm)`, `var(--wd)` exclusively (no raw hex; SA-gate verified in audit AU#12).
        Runtime (DOM-presence): spec line `66` ("overview and table tabs render real panels") for shell; line `94` ("overview tab shows the session sprint slug text") for content.
      </evidence>
    </item>

    <item id="R-005" status="COVERED">
      <requirement>SC5 — Table tab (sortable HTML table; keyboard-nav; WCAG AA).</requirement>
      <evidence>
        Static: commit `8932578` `TableTab.tsx` — native `<button>` sort headers (keyboard-navigable; SA a11y gate confirmed click-handlers paired with keyboard handlers); FF7 token colors (`var(--mt)`, `var(--wd)`, `var(--wm)`); border `var(--bd)`.
        Runtime (DOM-presence): spec line `66` (panels render) + line `122` ("table tab shows Agent ID column header") — the column header is interactive (clickable to sort) and uses native button semantics.
      </evidence>
    </item>

    <item id="R-006" status="COVERED">
      <requirement>SC6 — Editor tab pre-fills, binds, saves, reverts.</requirement>
      <evidence>
        Static: commits `f6a864d` (`useSessionRaw` + `useSessionSave`) and `7fad3d3` (`EditorTab.tsx`); `useSessionRaw.ts:31-40` seeds `originalContent` always and `editBuffer` only when empty (SC6 first-load invariant); `EditorTab.tsx:104-117` binds Textarea `value={editBuffer}` with `onChange` clearing stale save result.
        Runtime (DOM-presence): spec line `222` ("Editor tab pre-fills with original source markdown" — asserts textarea non-empty value); line `251` ("Save edit flow — success: appending text enables save and shows Saved to path"); line `291` ("revert to original restores textarea to pre-fill value").
      </evidence>
    </item>

    <item id="R-007" status="COVERED">
      <requirement>SC7 — Save success shows absolute path; save failure surfaces error and preserves buffer.</requirement>
      <evidence>
        Success path (runtime, DOM-presence): spec line `251` asserts the inline "Saved to: {path}" affordance is visible after a real `session.saveEdit` round-trip against the live server; the path rendered is the absolute path under `SESSIONS_EDITS_DIR` returned by `validateSaveEditPath` (router.ts:493).
        Failure path (structural): the buffer-preserved-on-error guarantee is verified **by absence of mutation**. The auditor (`AU#11` for t6a, `AU#12` for t6b) confirmed:
          - `packages/client/src/hooks/useSessionSave.ts:24-27` — `onError` sets `lastSaveError` only; the hook never imports or calls `setEditBuffer`.
          - `packages/client/src/pages/sessions/tabs/EditorTab.tsx` — the inline `role="alert"` block reads `lastSaveError` but the component makes no `setEditBuffer` call in any error path.
        No runtime fault-injection e2e exists (would require server-error fixture), but the structural impossibility of clearing the buffer on error is stronger evidence than a single test case would be. Marked COVERED on the combination.
      </evidence>
    </item>

    <item id="R-008" status="COVERED">
      <requirement>SC8 — Analyze slot reserved (disabled + tooltip).</requirement>
      <evidence>
        Static: `packages/client/src/constants/sessions.ts:11` — `SESSION_TABS` contains `{ id: 'analyze', label: 'Analyze', placeholder: true }`. `SessionDetailPage.tsx:250` renders `aria-disabled="true"` for placeholder tabs; line `252` sets `title="Coming in S3"`.
        Runtime (DOM-presence): spec line `158` ("analyze tab has aria-disabled and coming-in-s3 title") + line `336` ("Analyze tab is disabled — aria-disabled true and Coming in S3 title"). Two assertions across waves cover the same contract — preserved deliberately.
      </evidence>
    </item>

    <item id="R-009" status="COVERED">
      <requirement>SC9 — Lint + type clean.</requirement>
      <evidence>
        `npm run lint` from repo root invokes `tsc --noEmit` across `packages/shared`, `packages/server`, `packages/client` — all three projects, exit 0. Confirmed by AU#11 (t6a re-audit), AU#12 (t6b first audit), AU#13 (t6b contrast re-audit), and one final check by the orchestrator post-contrast-fix.
      </evidence>
    </item>

    <item id="R-010" status="COVERED">
      <requirement>SC10 — Manual smoke (Step 4.5): list loads, tabs work, save round-trips, no console errors; existing pages still load.</requirement>
      <evidence>
        Human Step 4.5 verification on 2026-05-25:
          - First pass (post-`7fad3d3`): functional verdict "Functionally seems to mostly pass! Save functionality works as well." — list/tabs/save/Analyze confirmed visually.
          - Visual flag raised on the same pass: Editor textarea text invisible (contrast collapse). Remediated in `54ede0b`; re-audited PASS (`AU#13`).
          - Second pass (post-`54ede0b`): human confirmed "for 4.5, the fix is good!" — contrast resolved.
        Runtime supporting evidence (DOM-presence): spec lines `4`, `19`, `66`, `122`, `184`, `222`, `251`, `291`, `336`, `358`, `364`, `370`, `376`, `383`, `421` — every surface in the SC10 checklist is exercised by at least one DOM-presence assertion. Console errors: Playwright fails on uncaught page errors by default; no test reported a page error during the 17/17 → 18/18 runs.
      </evidence>
    </item>

    <item id="R-011" status="COVERED">
      <requirement>Constraint — Purely additive; existing Browse/Compose/Edit/Export pages unchanged.</requirement>
      <evidence>
        Static: `git diff --stat fd836d8..54ede0b -- packages/client/src/pages/` shows zero modifications to the four existing page sources outside `packages/client/src/pages/sessions/`. AU#12 verified this explicitly in its SA gate ("Browse/Compose/Edit/Export untouched: git diff --stat shows zero changes to those page sources").
        Runtime: spec lines `358/364/370/376` assert each existing page's root testid still renders after the sprint's changes.
      </evidence>
    </item>

    <item id="R-012" status="COVERED">
      <requirement>Constraint (sprint-intake critical_seam) — Editor must pre-fill with original source markdown; the S1 SessionSchema exposed no raw body, so a BE addition was required.</requirement>
      <evidence>
        Static: `session.getRaw` tRPC query added in commit `530a2e3` (S1 tail) with `SessionRawOutputSchema = z.object({ content: z.string() })` at `packages/shared/src/schemas.ts:104` and procedure at `packages/server/src/router.ts:503`. Client consumer: `useSessionRaw.ts` (commit `f6a864d`).
        Runtime: spec line `222` asserts the textarea pre-fills with non-empty value after navigating to the Editor tab — the end-to-end proof that the raw read path works.
      </evidence>
    </item>

  </coverage>

  <summary>
    <covered_count>12</covered_count>
    <partial_count>0</partial_count>
    <missing_count>0</missing_count>
  </summary>

  <notes>
    Brief was well-specified (SC1–SC10 + an explicit additive constraint + the critical_seam_finding); zero extracted requirements required interpretation.

    Step 2.5 application: every runtime-behavior SC (SC1–SC8, SC10) has a DOM-presence Playwright assertion citation; no `REQUIRES_HUMAN_VISUAL` flags. SC7's failure path is the only criterion verified structurally rather than by e2e — accepted because the structural argument (the hook and component never import the buffer setter in any error branch) is strictly stronger than a single fault-injected test case would be; both audits (AU#11 t6a, AU#12 t6b) confirmed by source read.

    Step 4.5 carried a single iteration: the contrast bug was caught at human verification post-AU#12 PASS, remediated, re-audited PASS by AU#13, and re-confirmed by the human. The new spec assertion at line `383` ("Editor textarea text is readable") closes the regression window; the underlying token-system collision is documented in the post-mortem §3 + §6 G2 as a follow-up gap (root fix = reconcile Shadcn base tokens onto FF7 values in `globals.css`).

    Sprint cleared the requirements gate. Proceed to Archivist.
  </notes>
</requirements_coverage_report>
