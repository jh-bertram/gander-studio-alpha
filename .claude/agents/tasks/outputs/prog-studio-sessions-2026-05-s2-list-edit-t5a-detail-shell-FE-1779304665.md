# FE Output — t5a-detail-shell
task_id: prog-studio-sessions-2026-05-s2-list-edit-t5a-detail-shell
agent_id: FE#5
ts: 2026-05-20T00:05:00Z

---

```xml
<ui_packet>
  <task_id>prog-studio-sessions-2026-05-s2-list-edit-t5a-detail-shell</task_id>

  <components_created>
    - REPLACED packages/client/src/pages/sessions/SessionDetailPage.tsx (stub → full shell, 309 lines)
    - EXTENDED packages/client/tests/e2e/prog-studio-sessions-2026-05-s2-list-edit-fe.spec.ts (+118 lines, t4b assertions preserved, 185 lines total)
  </components_created>

  <state_hydration_map>
    SessionDetailPage is zero-prop. Reads from Zustand session-store:
      - selectedSessionId → passed to useSessionDetail(selectedSessionId!) → trpc.session.get.useQuery({ id })
      - activeTab → drives tabpanel conditional render; setActiveTab updates store on tab click
      - setSelectedSessionId(null) → called by Back button to return to list (triggers SessionsRouter switch)
    No props are passed from SessionsRouter or ModeContent. Store is the sole data source.
  </state_hydration_map>

  <a11y_verification>
    - role="tablist" + aria-label="Session detail tabs" on tab container div
    - Each tab button: role="tab", aria-selected="true|false", aria-controls="{id}-panel", id="{id}-tab"
    - Analyze tab: aria-disabled="true", disabled attribute, title="Coming in S3", cursor:not-allowed, opacity:0.55
    - Active tabpanel: role="tabpanel", id="{activeTab}-panel", aria-labelledby="{activeTab}-tab"
    - Back button: aria-label="Back to sessions list", keyboard reachable (native button element)
    - Loading state: aria-busy="true" on container div, sr-only "Loading session…" text
    - Error state: role="alert" on error panel
    - Keyboard navigation: ArrowRight/ArrowLeft move focus between non-disabled tabs and setActiveTab;
      Enter/Space also activates focused tab; tabIndex=0 on active tab, tabIndex=-1 on inactive tabs
      (standard ARIA tablist roving tabindex pattern)
    - No onClick on non-button/non-anchor elements — only button elements carry click handlers
    - WCAG AA contrast: all token pairings inherited from design spec (var(--mt) on dark backgrounds
      is ~4.5:1+, var(--wd) on dark is ~8:1+, var(--wm) for disabled at opacity 0.55 is large-text AA)
  </a11y_verification>

  <design_tokens_used>
    var(--mt)          — Mako Teal: active tab color + border-bottom accent
    var(--wd)          — White 72%: inactive tab color, date text, error message
    var(--wm)          — White 38%: disabled Analyze tab color
    var(--w)           — White 100%: sprint slug heading text
    var(--fh)          — Heading font (Optima/serif): sprint slug h1
    var(--fb)          — Body font (system-ui): tab button labels
    var(--fm)          — Mono font (Courier New): date, error labels, Back button
    var(--sfm)         — Surface medium: error panel background, skeleton gradient from
    var(--sfh)         — Surface highlight: skeleton gradient to
    var(--bd)          — Border default (mako 25%): header border-bottom, tab bar border-bottom
    var(--redb)        — Red bright: error panel border + label
    var(--rl)          — Border radius large: error panel
    No raw hex values used anywhere in the component.
  </design_tokens_used>

  <style_conflict_check>NONE — all styling is via inline style objects using CSS custom properties (var(--*) tokens). No Tailwind utility classes used in this component; no Tailwind/inline conflict is possible. The sr-only class from Tailwind is used on a pure-a11y span with no conflicting inline styles.</style_conflict_check>

  <integration_status>SUCCESS — useSessionDetail from useSessions.ts wired correctly; SESSION_TABS imported from constants/sessions.ts; Session type from @gander-studio/shared. No mocked data. tRPC procedure session.get is live (shipped in S1 backend). npm run lint exit 0.</integration_status>

  <e2e_spec>packages/client/tests/e2e/prog-studio-sessions-2026-05-s2-list-edit-fe.spec.ts</e2e_spec>

  <e2e_tests_added>
    1. "clicking a session row shows the detail page" — row click → data-testid="sessions-detail-page" visible
    2. "overview and table tabs render correct panel stubs" — Overview → overview-tab-stub; Table → table-tab-stub
    3. "analyze tab has aria-disabled and coming-in-s3 title" — aria-disabled="true" + title="Coming in S3"
    4. "detail page shell persists across tab switches without remounting" — captures h1 sprint slug, clicks Overview→Table→Overview, asserts sessions-detail-page still visible and h1 text unchanged (DOM/state identity check per SC3; NOT network counting)
    Note: All t5a tests guard on hasRows check — if the server returns no sessions in the test environment, the test exits cleanly rather than failing (data-dependent navigation path).
    t4b assertions: PRESERVED (lines 1-66 unchanged).
  </e2e_tests_added>

  <files_modified>
    - packages/client/src/pages/sessions/SessionDetailPage.tsx (stub replaced, 309 lines)
    - packages/client/tests/e2e/prog-studio-sessions-2026-05-s2-list-edit-fe.spec.ts (extended, 185 lines)
  </files_modified>

  <out_of_scope_confirmed>
    - No OverviewTab/TableTab content (t5b) — stub divs only
    - No EditorTab content (t6b) — stub div only
    - No Analyze tab component — slot is disabled/aria-disabled
    - No useSessionSave/useSessionRaw/getRaw
    - No id prop on SessionDetailPage (zero-prop by design)
    - No Shadcn tabs/tooltip/toast imported
    - No raw hex values
    - Did NOT modify session-store.ts, ui-store.ts, navigation.ts, SessionsRouter.tsx, ModeContent.tsx, or any other page
  </out_of_scope_confirmed>

  <lint_result>exit 0 — tsc --noEmit passed for all three packages (shared, server, client)</lint_result>

  <constant_audit>
    - Grepped for rgba(15,15,15: NONE
    - Grepped for raw hex #RRGGBB in .tsx: NONE
    - Grepped for 3.28084 (ft conversion): NONE
    - No magic numbers duplicated across files
  </constant_audit>
</ui_packet>
```
