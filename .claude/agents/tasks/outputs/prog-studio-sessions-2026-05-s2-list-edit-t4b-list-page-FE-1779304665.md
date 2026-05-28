# FE Output Packet — t4b-list-page
task_id: prog-studio-sessions-2026-05-s2-list-edit-t4b-list-page
agent_id: FE#4
ts: 2026-05-20T00:05:00Z

---

```xml
<ui_packet>
  <task_id>prog-studio-sessions-2026-05-s2-list-edit-t4b-list-page</task_id>

  <files_modified>
    packages/client/src/pages/sessions/SessionListPage.tsx
    packages/client/src/globals.css
  </files_modified>

  <files_created>
    packages/client/tests/e2e/prog-studio-sessions-2026-05-s2-list-edit-fe.spec.ts
  </files_created>

  <components_created>
    SessionListPage (full implementation replacing stub)
    — Internal sub-components: PageTitle, LoadingState, ErrorState, EmptyState, SessionTh, SessionRow
    — All extracted as module-level named functions (no inline-JSX logic)
  </components_created>

  <state_hydration_map>
    useSessions() → trpc.session.list.useQuery({ limit: 50 }) → { sessions, isLoading, error }
    sessions[] hydrates the tbody tr rows (one row per Session)
    useSessionStore().setSelectedSessionId(session.id) fires on row click or Enter/Space
    No local state — all data flows from the hook
  </state_hydration_map>

  <a11y_verification>
    - table[aria-label="Sessions list"] — semantic table with thead/tbody
    - Each tbody tr: role="row", tabIndex={0}, aria-label="{sprint} — {date}"
    - Row keyboard: onKeyDown fires onSelect on Enter or Space (handleRowKeyDown extracted as named function)
    - Loading state: aria-busy="true" on container + sr-only "Loading sessions…"
    - Error state: role="alert" on bordered panel; error message is first text child
    - Empty state: aria-live="polite" on centered div; "No sessions found"
    - No raw hex in JSX; all colors via CSS custom properties (design tokens)
    - Focus + hover both apply visual highlight (background + border-left) — color is not sole differentiator
  </a11y_verification>

  <design_tokens_used>
    var(--mt)   — Mako Teal (accent bar, hover/focus border, empty dot)
    var(--gt)   — Glow teal (PageTitle accent bar box-shadow)
    var(--bd)   — Border (row separator, table width guard)
    var(--bdb)  — Border bold (thead bottom border)
    var(--sfm)  — Surface medium (error bg, shimmer base)
    var(--sfh)  — Surface hover (shimmer highlight, row hover/focus bg)
    var(--redb) — Red bold (error accent bar + label)
    var(--rl)   — Radius large (error panel border-radius)
    var(--fh)   — Font heading (PageTitle, empty state text)
    var(--fm)   — Font mono (th labels, td cells, error message)
    var(--w)    — White (sprint primary column)
    var(--wd)   — White dim (secondary cells, error message)
    var(--wm)   — White muted (th column labels)
  </design_tokens_used>

  <style_conflict_check>NONE — no inline style= attributes on elements that also carry overlapping Tailwind utilities. All styling is via inline style objects using CSS custom properties (consistent with BrowsePage pattern). No Tailwind class on any styled element in this component.</style_conflict_check>

  <integration_status>SUCCESS — useSessions() from t4a is the data source; session-store.ts setSelectedSessionId is the navigation mechanism; SessionsRouter.tsx already wires SessionListPage and SessionDetailPage and was not modified.</integration_status>

  <e2e_spec>packages/client/tests/e2e/prog-studio-sessions-2026-05-s2-list-edit-fe.spec.ts</e2e_spec>

  <lint_result>exit 0 — tsc --noEmit passed for shared, server, and client packages</lint_result>

  <constant_audit>
    0 matches for rgba(15,15,15 in SessionListPage.tsx
    0 matches for 3.28084 or 3.28 in SessionListPage.tsx
    0 raw hex values (#rrggbb) in SessionListPage.tsx
    No inline style= attributes overlapping Tailwind utilities
  </constant_audit>

  <function_deduplication>
    handleRowKeyDown extracted as named module-level function (used once inline but extracted per protocol)
    onMouseEnter/onMouseLeave/onFocus/onBlur handlers are distinct in purpose and body — not duplicated
  </function_deduplication>

  <focus_trap_note>N/A — no role="dialog" surface in this task</focus_trap_note>

  <data_contract_verified>
    session.sprint: z.string() — confirmed in SessionSchema (schemas.ts:85)
    session.date: z.string() — confirmed in SessionSchema (schemas.ts:86)
    session.status: z.string().optional() — confirmed in SessionSchema (schemas.ts:89)
    session.gap_classes: z.array(z.string()).default([]) — confirmed in SessionSchema (schemas.ts:87)
    session.id: z.string() — confirmed in SessionSchema (schemas.ts:84)
  </data_contract_verified>

  <globals_css_addition>
    Added @keyframes pulse-opacity to globals.css (BrowsePage.tsx already referenced this animation;
    it was missing from the CSS file — this fixes a pre-existing omission, not a new requirement).
  </globals_css_addition>

  <scope_compliance>
    - Did NOT modify ModeContent.tsx
    - Did NOT modify SessionsRouter.tsx
    - Did NOT redefine Session or any schema
    - Did NOT add Shadcn tabs/tooltip/toast
    - Did NOT touch Browse/Compose/Edit/Export pages
    - Did NOT implement tab content (t5/t6 scope)
    - Did NOT implement useSessionSave or useSessionRaw
  </scope_compliance>
</ui_packet>
```
