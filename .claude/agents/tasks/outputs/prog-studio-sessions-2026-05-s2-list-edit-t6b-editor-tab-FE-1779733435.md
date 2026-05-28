# ui_packet — t6b-editor-tab

**Task ID:** prog-studio-sessions-2026-05-s2-list-edit-t6b-editor-tab  
**Agent:** FE  
**Timestamp:** 2026-05-25T00:10:00Z

---

## files_created

- `packages/client/src/pages/sessions/tabs/EditorTab.tsx` (181 lines, new)

## files_modified

- `packages/client/src/pages/sessions/SessionDetailPage.tsx` (298 lines)
  - Added `import EditorTab from './tabs/EditorTab'`
  - Removed `EditorTabStub` function (~5 lines)
  - Replaced `<EditorTabStub />` with `<EditorTab session={session} />`
- `packages/client/tests/e2e/prog-studio-sessions-2026-05-s2-list-edit-fe.spec.ts` (408 lines)
  - Added 8 new t6b tests (Editor pre-fill, save success, revert, Analyze disabled x2, Browse/Compose/Edit/Export smoke regression x4)
  - All 9 prior assertions preserved

---

## npm run lint result

```
> lint
> tsc --noEmit --project packages/shared/tsconfig.json && tsc --noEmit --project packages/server/tsconfig.json && tsc --noEmit --project packages/client/tsconfig.json

EXIT: 0
```

---

## Playwright run output

```
Running 17 tests using 1 worker

  ✓  1  sessions list page is visible when sessions mode is active (5.8s)
  ✓  2  sessions list page renders table or empty/loading state (2.9s)
  ✓  3  clicking a session row shows the detail page (3.7s)
  ✓  4  overview and table tabs render real panels (3.8s)
  ✓  5  overview tab shows the session sprint slug text (4.1s)
  ✓  6  table tab shows Agent ID column header (4.4s)
  ✓  7  analyze tab has aria-disabled and coming-in-s3 title (2.7s)
  ✓  8  detail page shell persists across tab switches without remounting (3.2s)
  ✓  9  Editor tab pre-fills with original source markdown (3.1s)
  ✓ 10  Save edit flow — success: appending text enables save and shows Saved to path (3.5s)
  ✓ 11  Save edit flow — revert to original restores textarea to pre-fill value (3.4s)
  ✓ 12  Analyze tab is disabled — aria-disabled true and Coming in S3 title (2.5s)
  ✓ 13  Browse page root testid is visible when Browse mode is active (2.2s)
  ✓ 14  Compose page root testid is visible when Compose mode is active (2.8s)
  ✓ 15  Edit page root testid is visible when Edit mode is active (3.2s)
  ✓ 16  Export page root testid is visible when Export mode is active (3.2s)
  ✓ 17  sessions list empty state renders no sessions found when list is empty (2.9s)

  17 passed (1.2m)
```

---

## SC Confirmations

**SC6 — Pre-fill + onChange clears stale result + revert:**
- `useSessionRaw(session.id)` called on mount; seeds `originalContent` always, `editBuffer` only when empty (enforced in the hook itself per t6a spec).
- `handleChange` calls `setLastSaveResult(null)` to clear stale success on each keystroke.
- `handleRevert` calls `setEditBuffer(originalContent)`.

**SC7 — editBuffer NOT cleared on error:**
- `useSessionSave` hook (t6a) handles `onError` by calling `setLastSaveError` only; it explicitly does NOT call `setEditBuffer`. EditorTab does not call `setEditBuffer` in any error path.

**SC8 — Analyze tab disabled with title="Coming in S3":**
- `SESSION_TABS` in `constants/sessions.ts` has `{ id: 'analyze', label: 'Analyze', placeholder: true }`.
- `SessionDetailPage.tsx` renders `aria-disabled="true"` and `title="Coming in S3"` for all placeholder tabs.
- Confirmed by two tests (test 7 pre-existing, test 12 new).

**SC10 — Smoke regression tests present:**
- Tests 13–16 navigate Browse, Compose, Edit, Export modes and assert each page's root `data-testid` is visible.

---

## Layout Fix

A `paddingBottom: '72px'` was added to the EditorTab root div. The BottomTabBar is `position: fixed; bottom: 0; height: 56px; z-index: 100` and physically covers the bottom of the viewport. Without padding, the save/revert buttons were intercepted by the BottomTabBar on the default Playwright viewport (1280x720). The 72px clearance (56px bar + 16px breathing room) ensures buttons are visible and clickable above the bar.

---

<ui_packet>
  <components_created>
    packages/client/src/pages/sessions/tabs/EditorTab.tsx
  </components_created>
  <state_hydration_map>
    useSessionRaw(session.id) fetches raw markdown via tRPC session.getRaw; the hook's useEffect seeds originalContent (always) and editBuffer (only when empty) in useSessionStore. useSessionSave wraps session.saveEdit mutation; on success sets lastSaveResult + clears lastSaveError; on error sets lastSaveError without clearing editBuffer (SC7). EditorTab reads editBuffer, originalContent, lastSaveResult, lastSaveError from useSessionStore and renders them directly.
  </state_hydration_map>
  <a11y_verification>
    - Root div: data-testid="editor-tab"
    - Save target / success affordance: aria-live="polite" for screen-reader announcements
    - Loading skeleton: aria-busy="true" + sr-only span
    - Raw-fetch error: role="alert"
    - Textarea: aria-label="Session markdown editor"
    - Save button: data-testid="save-edit-button", aria-label="Save session edit", disabled when not dirty or loading
    - Revert button: data-testid="revert-button", aria-label="Revert to original content", disabled when not dirty
    - Inline save-error: role="alert"
    - All interactive elements are native button elements (keyboard-navigable by default, no tabIndex/onKeyDown needed)
    - No span/div/li onClick patterns found in audit
  </a11y_verification>
  <design_tokens_used>
    var(--fm), var(--fb), var(--fh) — font families
    var(--mt) — Mako Teal primary (success color, active save button background)
    var(--wd), var(--wm), var(--w), var(--sfb) — text colors
    var(--sfm), var(--sfh) — surface colors (skeleton gradient)
    var(--redb) — error red border / text
    var(--bd) — border color
    var(--rl) — border radius large
    No raw hex values used.
  </design_tokens_used>
  <style_conflict_check>NONE</style_conflict_check>
  <integration_status>SUCCESS — EditorTab wired to useSessionRaw (t6a) and useSessionSave (t6a); both hooks committed and audited PASS. SessionDetailPage imports and renders EditorTab. All 17 e2e tests pass. Lint exits 0.</integration_status>
  <e2e_spec>packages/client/tests/e2e/prog-studio-sessions-2026-05-s2-list-edit-fe.spec.ts (8 new tests added; 9 prior preserved; 17 total passing)</e2e_spec>
</ui_packet>
