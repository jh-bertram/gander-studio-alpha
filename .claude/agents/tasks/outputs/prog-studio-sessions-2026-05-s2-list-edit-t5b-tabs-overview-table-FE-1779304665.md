# FE Output — prog-studio-sessions-2026-05-s2-list-edit-t5b-tabs-overview-table

## ui_packet

```xml
<ui_packet>
  <task_id>prog-studio-sessions-2026-05-s2-list-edit-t5b-tabs-overview-table</task_id>

  <files_created>
    packages/client/src/pages/sessions/tabs/OverviewTab.tsx
    packages/client/src/pages/sessions/tabs/TableTab.tsx
  </files_created>

  <files_modified>
    packages/client/src/pages/sessions/SessionDetailPage.tsx
    packages/client/tests/e2e/prog-studio-sessions-2026-05-s2-list-edit-fe.spec.ts
  </files_modified>

  <components_created>
    packages/client/src/pages/sessions/tabs/OverviewTab.tsx — Props: { session: Session }
      - Top-line stat row (role="group"): agent count, feedback loops sum, event count, status
      - Frontmatter dl: sprint, date, status, type, title, gap_classes (joined or '—'), source_root, editedFilePath (or 'None')
      - StatCard sub-component renders each stat with label
      - FieldRow sub-component renders each dt/dd pair
      - data-testid="overview-tab" on root div

    packages/client/src/pages/sessions/tabs/TableTab.tsx — Props: { session: Session }
      - 9-column agent-activity table: Agent ID | Spawns | Completes | Feedback Loops | Critique Passes | Critique Blocks | Audit Passes | Audit Fails | Wall Clock (ms)
      - Sortable via useState(sortKey, sortDir); default: Agent ID ascending
      - Column header buttons with aria-sort="ascending|descending|none", aria-label describing sort state
      - onKeyDown Enter/Space triggers handleSort — keyboard accessible
      - Displays '—' for undefined/null values via displayCell()
      - Empty state: aria-live="polite" "No agent activity recorded" when session.agents.length === 0
      - data-testid="table-tab" on root div
      - No seq/ts/event columns
  </components_created>

  <state_hydration_map>
    Both tabs receive `session: Session` as a prop passed directly from SessionDetailPage.
    SessionDetailPage fetches via useSessionDetail(selectedSessionId) which calls the tRPC
    session.get procedure. No new stores or effects added. TableTab owns local sort state
    only (sortKey, sortDir — not persisted, not in Zustand).
  </state_hydration_map>

  <a11y_verification>
    OverviewTab:
    - Stat row has role="group" aria-label="Session statistics"
    - Frontmatter uses semantic dl/dt/dd structure
    - All text uses design token colors meeting WCAG AA contrast ratios:
      --mt (#5499b5) on --void (#070d0c) ≈ 5.6:1; --wd on --void ≈ 5.1:1

    TableTab:
    - table[aria-label="Agent activity"] with thead/tbody, th[scope="col"]
    - Each th has aria-sort="ascending|descending|none"
    - Sort buttons have aria-label describing column + current sort state
    - onKeyDown handles Enter and Space to trigger sort — fully keyboard navigable
    - Empty state uses aria-live="polite"
    - No non-button interactive elements (no span/div onClick)
  </a11y_verification>

  <design_tokens_used>
    --mt (Mako Teal primary), --mtd, --wd (white dim), --wm (white muted),
    --w (white), --bd (border), --bdb (border bright), --sfm (surface mid),
    --void (background), --fm (mono font), --fh (heading font), --rl (border-radius large),
    --r (border-radius small). No raw hex values in new files.
  </design_tokens_used>

  <style_conflict_check>NONE</style_conflict_check>

  <integration_status>
    SUCCESS — consuming Session type from @gander-studio/shared (already published in workspace).
    tRPC wiring unchanged — SessionDetailPage fetches session and passes as prop.
  </integration_status>

  <e2e_spec>packages/client/tests/e2e/prog-studio-sessions-2026-05-s2-list-edit-fe.spec.ts</e2e_spec>

  <lint_result>exit 0 — tsc --noEmit passed for shared, server, and client packages</lint_result>

  <focus_trap_visibility_filter_confirmed>N/A — no role="dialog" components in this task</focus_trap_visibility_filter_confirmed>

  <data_contract_verified>
    Session.sprint, Session.date, Session.status, Session.type, Session.title,
    Session.gap_classes, Session.source_root, Session.editedFilePath confirmed present
    in SessionSchema (packages/shared/src/schemas.ts lines 84-98).
    AgentActivity fields (agent_id, spawns, completes, feedback_loops, critique_passes,
    critique_blocks, audit_passes, audit_fails, wall_clock_ms) confirmed in
    AgentActivitySchema (lines 69-79).
  </data_contract_verified>

  <position_fixed_confirmed>N/A — no Chart.js tooltip callbacks</position_fixed_confirmed>
</ui_packet>
```

## Implementation Notes

### OverviewTab.tsx
- `StatCard` renders each top-line stat (agent count, total feedback loops, total event count, status)
- `FieldRow` renders each frontmatter field as a dt/dd pair inside a `<dl>`
- `totalFeedbackLoops` computed via `session.agents.reduce()`
- `gap_classes` joined with `', '` or displays `'—'` when empty array

### TableTab.tsx
- `COLUMNS` constant defines all 9 columns and their keys; single source of truth for both header rendering and cell rendering
- `compareRows` handles both numeric and string comparisons
- `displayCell` returns `'—'` for `null` or `undefined` values
- Sort handler uses functional `setSortKey` to avoid stale closure issues when toggling direction on the same column
- `aria-sort` on `<th>` — spec-compliant attribute, not on the button
- Agent ID column text is styled `--mt` (teal) to distinguish identity column; all others `--wd`

### SessionDetailPage.tsx changes
- Added 2 import lines for OverviewTab and TableTab
- Removed `OverviewTabStub` and `TableTabStub` function declarations (10 lines removed)
- Replaced stub JSX references with `<OverviewTab session={session} />` and `<TableTab session={session} />`
- EditorTabStub preserved for t6b

### e2e spec changes
- Replaced `'overview and table tabs render correct panel stubs'` test with `'overview and table tabs render real panels'` — uses `overview-tab` / `table-tab` testids and `toBeVisible`
- Added `'overview tab shows the session sprint slug text'` — asserts sprint text from h1 appears in OverviewTab
- Added `'table tab shows Agent ID column header'` — asserts the sort button for "Agent ID" is visible in TableTab
- All prior tests preserved (detail page row click, analyze tab disabled, no-remount, empty/error state)
