# Design Spec — S2 Sessions Mode
task_id: prog-studio-sessions-2026-05-s2-list-edit-t1-ui-design
agent_id: UI#1
ts: 2026-05-20T20:45:00Z

---

```xml
<design_spec>
  <task_id>prog-studio-sessions-2026-05-s2-list-edit-t1-ui-design</task_id>
  <surface>Sessions mode — SessionListPage + SessionDetailPage shell + 4 tab interiors (Overview, Table, Editor, Analyze)</surface>
  <design_system_source>INFERRED</design_system_source>

  <!-- ================================================================
       ARCHITECTURE NOTE — store-driven routing (PAGE_MAP constraint)
       ================================================================
       ModeContent.tsx uses a zero-prop component-map pattern:
         const PAGE_MAP = { browse: BrowsePage, ..., sessions: SessionsRouter } as const;
         const ActivePage = PAGE_MAP[activeMode];
         return <main ...><ActivePage /></main>;

       SessionsRouter is a ZERO-PROP component that reads selectedSessionId from
       useSessionStore (session-store.ts). It renders:
         - <SessionListPage />  when selectedSessionId is null
         - <SessionDetailPage /> when selectedSessionId is non-null

       SessionDetailPage is also ZERO-PROP — it reads its own selectedSessionId from
       useSessionStore. It does NOT receive an id prop from SessionsRouter or ModeContent.
       This is the PAGE_MAP invariant: every entry is rendered as <Component /> with no props.

       Store file: packages/client/src/store/session-store.ts (kebab-case — never sessionStore.ts).
  -->

  <!-- ================================================================
       SURFACE A — SessionListPage
       ================================================================ -->

  <surface_id>SessionListPage</surface_id>
  <surface_path>packages/client/src/pages/sessions/SessionListPage.tsx</surface_path>
  <surface_note>Nested under pages/sessions/ — deliberate structural deviation. Sessions is a
  multi-surface mode (list + detail + 4 tab interiors). A dedicated subdirectory prevents pages/
  from becoming a flat dumping ground and signals to future agents that this mode has surface depth.
  S3 will add sessions/tabs/AnalyzeTab.tsx in the same directory tree without touching the root
  pages/ flat namespace.</surface_note>

  <new_pattern_proposal>
    <name>SessionBrowseList</name>
    <rationale>No existing pattern in dashboard-patterns.md covers a scrollable list of structured
    records (one row per session/document) where each row is a clickable navigation target that
    sets a Zustand store key to drive a master-detail switch. RangeGauge, IntensityHistogram,
    RadialCompass, SunArc, SegmentedScaleBar, ProgressiveDisclosureCard, and ProgramSprintMap
    all address specific data-visualization concerns; none describe a tabular navigation list.
    This pattern formalizes the browse-list idiom already established by BrowsePage and applies
    it to row-structured data with explicit column semantics.</rationale>
    <pattern_definition>
### SessionBrowseList

**Purpose:** Display a scrollable list of structured records where each row is a keyboard-
and pointer-navigable navigation target. Clicking a row stores the record's id in a Zustand
slice (selectedSessionId) to drive a master-detail switch in a parent router component.

**Inputs:**
- `records` — array of typed objects from a tRPC list query (e.g., Session[])
- `columns` — ordered array of { key, label, render?: (v) => ReactNode } defining visible columns
- `onSelect` — callback (record.id: string) => void called on row click or Enter/Space keypress
- `isLoading` — boolean; shows skeleton rows when true
- `error` — unknown | null; shows ErrorState panel when non-null
- `emptyLabel` — string shown when records.length === 0 and not loading

**Visualization Rule:**
- Render as a semantic HTML table (thead + tbody). Column headers are non-interactive labels
  (plain th elements). Each tbody tr is role="button" (or a focusable tr with tabIndex=0) so
  the row itself is the click target.
- Column widths: sprint slug is the primary column — widest, min-width accommodates typical
  sprint-id strings (~40ch). Date, status, gap_classes are secondary — auto or fixed narrower.
- Active/hover row: left-border accent (3px solid var(--mt)) + background tint (var(--sfh)).
  No row is "selected" on the list page; selection immediately navigates to detail.
- Loading state: aria-busy="true" on the table container; tbody shows N skeleton rows (shimmer
  animation using background-size:200% linear-gradient on var(--sfm) / var(--sfh)).
- Empty state: aria-live="polite" on a centered div; pulsing dot icon (var(--mt)) + emptyLabel text.
- Error state: role="alert" on a bordered panel; left-border 3px solid var(--redb);
  background var(--sfm); error message in var(--fm) font, var(--wd) color.

**Interaction Model:**
- Row click: calls onSelect(record.id) — parent router re-renders to detail.
- Row keyboard: Tab moves focus between rows; Enter or Space triggers onSelect.
- No multi-select, no filter bar, no sort (list is sorted by date server-side).
- No drilldown panel; selection is a full-pane navigation (master-detail via store).

**Accessibility Contract:**
- table element: aria-label="Sessions list"
- Each focusable tr: role="row" tabIndex=0; aria-label="{sprint} — {date}"
  so screen reader announces the row's primary content when focused.
- Loading: aria-busy="true" on container; sr-only text "Loading sessions…"
- Empty: aria-live="polite" region with "No sessions found"
- Error: role="alert"; error message is the first text child so it is announced immediately
- Color is not the sole differentiator for any row state — border + background both change on hover
    </pattern_definition>
  </new_pattern_proposal>

  <pattern_citation>SessionBrowseList</pattern_citation>

  <component_hierarchy>
    SessionListPage (root div, data-testid="sessions-list-page")
      PageTitle ("Sessions")
        span[aria-hidden="true"] — Mako Teal accent bar (3px wide, var(--mt), var(--gt) glow)
      [loading] SkeletonRows (aria-busy="true", 5 shimmer rows)
      [error]   ErrorState (role="alert")
      [empty]   EmptyState (aria-live="polite")
      [data]    table[aria-label="Sessions list"]
        thead
          tr
            th — Sprint
            th — Date
            th — Status
            th — Gap Classes
        tbody
          tr[tabIndex=0, role="row"] × N sessions
            td — session.sprint
            td — session.date
            td — session.status ?? "—"
            td — session.gap_classes.join(", ") || "—"
  </component_hierarchy>

  <layout>
    <grid>Single-column, full-width within the main content pane. No sidebar split on this surface.
    Table: width 100%; border-collapse collapse. Column widths: Sprint ~40%, Date 15%, Status 15%,
    Gap Classes ~30%. No fixed max-width — fills the ModeContent area.</grid>
    <spacing>
      Page top padding: 0 (ModeContent handles padding).
      PageTitle margin-bottom: 18px (mirrors BrowsePage).
      Table cell padding: 10px 14px (td/th).
      Table row gap: 0 (rows are separated by a 1px border: 1px solid var(--bd)).
      Error/empty panel padding: 14px 18px.
    </spacing>
    <responsive>
      <breakpoint name="sm">Below 640px: nav sidebar hidden (existing app-shell behavior).
      Table columns: Status and Gap Classes columns become display:none; only Sprint and Date shown.
      Row tap area remains full width.</breakpoint>
      <breakpoint name="md">All four columns visible. Default layout.</breakpoint>
    </responsive>
  </layout>

  <states>
    <state name="loading">
      5 skeleton rows in tbody. Each row has two cells with shimmer blocks (background linear-gradient
      from var(--sfm) to var(--sfh) to var(--sfm), background-size:200%, animation:shimmer 1.4s
      ease-in-out infinite). Table header still renders. aria-busy="true" on the table element.
      sr-only "Loading sessions…" as first child of the table.
    </state>
    <state name="empty">
      Table is not rendered. A centered div (aria-live="polite") shows: pulsing circle in var(--mt)
      (40px, border-radius 50%) + text "No sessions found" (var(--fh), 16px, var(--wd)) +
      subtext "No post-mortems detected in the configured source directories" (var(--fm), 12px, var(--wm)).
    </state>
    <state name="error">
      Table is not rendered. A div[role="alert"] with left-border 3px solid var(--redb),
      background var(--sfm), border-radius var(--rl). Inside: label "LOAD ERROR" (var(--fm), 10px,
      var(--redb), uppercase, letterSpacing 0.12em, fontWeight 700, marginBottom 6px) +
      error message text (var(--fm), 12px, var(--wd)).
    </state>
    <state name="default">
      Table renders with session rows. Header row: background var(--sfm), color var(--wd),
      fontFamily var(--fb), fontSize 11px, textTransform uppercase, letterSpacing 0.1em.
      Data rows: background transparent, color var(--w), fontSize 13px, fontFamily var(--fb).
      Row border-bottom: 1px solid var(--bd).
    </state>
    <state name="hover">
      tr:hover and tr:focus-visible: border-left 3px solid var(--mt) (on the tr itself, using
      box-shadow inset or a pseudo-element to avoid layout shift); background var(--sfh).
      cursor: pointer. Transition: background 120ms ease.
    </state>
    <state name="focus">
      tr:focus-visible: outline 2px solid var(--mt), outline-offset 2px (inside the row).
      Mirrors nav-item focus ring pattern in globals.css.
    </state>
    <state name="active">
      tr:active: background var(--sfm) (slightly darker than hover). The row is immediately
      replaced by navigation to detail — no persistent selected state on the list page.
    </state>
  </states>

  <tokens>
    <token element="PageTitle text" token="--fh" value="Optima, 'Palatino Linotype', serif" />
    <token element="PageTitle text" token="--w" value="#ffffff" />
    <token element="PageTitle accent bar" token="--mt" value="#5499b5" />
    <token element="PageTitle accent bar glow" token="--gt" value="0 0 12px rgba(84,153,181,0.4)" />
    <token element="PageTitle border-bottom" token="--bd" value="rgba(84,153,181,0.25)" />
    <token element="Table header background" token="--sfm" value="#122420" />
    <token element="Table header text" token="--wd" value="rgba(255,255,255,0.72)" />
    <token element="Table data cell text" token="--w" value="#ffffff" />
    <token element="Table row border" token="--bd" value="rgba(84,153,181,0.25)" />
    <token element="Table row hover background" token="--sfh" value="#1a3530" />
    <token element="Table row focus outline" token="--mt" value="#5499b5" />
    <token element="Error panel background" token="--sfm" value="#122420" />
    <token element="Error panel left border" token="--redb" value="#cf3c3c" />
    <token element="Error label text" token="--redb" value="#cf3c3c" />
    <token element="Error message text" token="--wd" value="rgba(255,255,255,0.72)" />
    <token element="Empty state heading" token="--wd" value="rgba(255,255,255,0.72)" />
    <token element="Empty state subtext" token="--wm" value="rgba(255,255,255,0.38)" />
    <token element="Empty state dot" token="--mt" value="#5499b5" />
    <token element="Skeleton shimmer from/to" token="--sfm / --sfh" value="#122420 / #1a3530" />
    <token element="Body text font" token="--fb" value="'Segoe UI', system-ui, sans-serif" />
    <token element="Monospace/label font" token="--fm" value="'Courier New', monospace" />
    <token element="Border radius base" token="--r" value="4px" />
    <token element="Border radius large" token="--rl" value="8px" />
    <token element="Sessions nav dot" token="--mp" value="#9b59b6" />
  </tokens>

  <interactions>
    <interaction trigger="click on session row" response="calls setSelectedSessionId(session.id) on useSessionStore(); SessionsRouter re-renders to <SessionDetailPage />" />
    <interaction trigger="Enter or Space on focused row" response="same as click — setSelectedSessionId(session.id)" />
    <interaction trigger="Tab" response="moves focus to next row; focus ring 2px solid var(--mt) appears on focused row" />
  </interactions>

  <accessibility_spec>
    <contrast_pairs>
      <pair element="Table header text on --sfm background" foreground="--wd (rgba(255,255,255,0.72))" background="--sfm (#122420)" ratio="~8.1:1" wcag_level="AAA" />
      <pair element="Table data cell text on transparent/--void background" foreground="--w (#ffffff)" background="--void (#070d0c)" ratio="~21:1" wcag_level="AAA" />
      <pair element="Error label on --sfm background" foreground="--redb (#cf3c3c)" background="--sfm (#122420)" ratio="~4.7:1" wcag_level="AA" />
      <pair element="Error message on --sfm background" foreground="--wd (rgba 72%)" background="--sfm (#122420)" ratio="~8.1:1" wcag_level="AAA" />
      <pair element="Empty state heading on --void background" foreground="--wd (rgba 72%)" background="--void (#070d0c)" ratio="~11.2:1" wcag_level="AAA" />
      <pair element="Empty state subtext on --void background" foreground="--wm (rgba 38%)" background="--void (#070d0c)" ratio="~3.5:1 (large text only)" wcag_level="AA (large text, 14px+)" />
      <pair element="PageTitle text on --void background" foreground="--w (#ffffff)" background="--void (#070d0c)" ratio="~21:1" wcag_level="AAA" />
      <pair element="Row hover text on --sfh background" foreground="--w (#ffffff)" background="--sfh (#1a3530)" ratio="~16.8:1" wcag_level="AAA" />
    </contrast_pairs>
    <heading_structure>h1: "Sessions" (PageTitle renders as h1 or a styled div; FE must use semantic h1 for screen reader landmark). No h2 on the list page — the table is sufficient structure.</heading_structure>
    <keyboard_flow>Tab: moves between session rows (tbody trs are tabIndex=0). Enter/Space: activates selected row. No Escape behavior on this surface.</keyboard_flow>
    <aria_requirements>
      table[aria-label="Sessions list"]; aria-busy="true" during loading (on table element);
      empty state div[aria-live="polite"]; error div[role="alert"];
      sr-only loading text as first child of the table during loading state.
    </aria_requirements>
  </accessibility_spec>


  <!-- ================================================================
       SURFACE B — SessionDetailPage shell + Tab Bar
       ================================================================ -->

  <surface_id>SessionDetailPage</surface_id>
  <surface_path>packages/client/src/pages/sessions/SessionDetailPage.tsx</surface_path>

  <new_pattern_proposal>
    <name>TabbedDetailShell</name>
    <rationale>No existing pattern in dashboard-patterns.md describes a detail-view shell with
    a persistent header (record identity) and a multi-tab navigation bar built from ARIA tablist
    semantics. ProgressiveDisclosureCard covers a single-tile-to-expanded-chart transition; it
    does not describe a persistent multi-tab shell where each tab renders a distinct content panel
    without remounting the data fetch. The TabbedDetailShell pattern is needed for any surface
    where: (a) a shared data fetch lives above the tab switching logic, (b) tabs are registered
    as a typed constant array for future extensibility, and (c) one or more tab slots are
    reserved as disabled placeholders for future sprints.</rationale>
    <pattern_definition>
### TabbedDetailShell

**Purpose:** Render a persistent detail view for a selected record with a header showing record
identity, a horizontal tab bar for switching between content panels, and a content area that
conditionally renders the active tab's panel without remounting the parent component.

**Inputs:**
- `record` — the typed record object (e.g., Session) fetched by id from the store
- `tabs` — SessionTabDef[] from a constants file; each entry has { id, label, placeholder? }
- `activeTab` — string (current tab id from the Zustand store)
- `onTabChange` — (tabId: string) => void (calls setActiveTab on the store)
- `isLoading` — boolean; shows skeleton header + spinner when true
- `error` — unknown | null; shows ErrorState panel when non-null

**Visualization Rule:**
- Header area: sprint slug (var(--fh), 17px, var(--w)) + date (var(--fm), 12px, var(--wd)).
  Separated from the tab bar by a 1px border (var(--bd)). A "← Back" button (text, var(--wd))
  calls setSelectedSessionId(null) to return to the list.
- Tab bar: role="tablist" horizontal row. Each tab is a role="tab" button.
  - Active tab: color var(--mt); border-bottom 2px solid var(--mt); fontWeight 600.
  - Inactive tab: color var(--wd); border-bottom 2px solid transparent.
  - Disabled tab (placeholder:true): aria-disabled="true", disabled attribute, color var(--wm),
    cursor not-allowed, title="Coming in S3".
  - Tab bar has a bottom border (1px solid var(--bd)) spanning full width; active tab's 2px
    border-bottom sits on top of it to create the "active underline" visual.
- Content area: role="tabpanel" div. Renders the correct tab component based on activeTab.
  No animation between tabs — instant conditional render to avoid motion concerns.

**Interaction Model:**
- Tab click: calls onTabChange(tab.id); updates store activeTab; does NOT remount the parent
  component or re-fire the session.get query.
- Arrow keys (Left/Right): move focus between non-disabled tabs within the tablist.
- Enter/Space on focused tab: activates the tab (same as click).
- Tab key: moves from the active role="tab" button to the active role="tabpanel" content.
- Disabled tab: receives focus (for keyboard discoverability) but Enter/Space do nothing;
  title attribute announces "Coming in S3" via browser-native tooltip.
- "← Back" button: calls setSelectedSessionId(null); SessionsRouter re-renders to list.

**Accessibility Contract:**
- role="tablist" on the tab bar container; aria-label="Session detail tabs"
- Each role="tab" button: aria-selected="true|false"; aria-controls="{tabId}-panel"
- Disabled tab: aria-disabled="true" AND disabled attribute; title="Coming in S3"
- role="tabpanel" div: id="{activeTab}-panel"; aria-labelledby="{activeTab}-tab"
- tabIndex=-1 on inactive tabpanel divs (only the active panel is in tab flow)
- No remount: the component holding the session.get query (SessionDetailPage) persists;
  only the tabpanel children swap. Verified via stable data-testid="sessions-detail-page"
  across tab switches.
- Back button: aria-label="Back to sessions list"; keyboard reachable (tabIndex=0)
    </pattern_definition>
  </new_pattern_proposal>

  <pattern_citation>TabbedDetailShell</pattern_citation>

  <component_hierarchy>
    SessionDetailPage (root div, data-testid="sessions-detail-page")
      [loading] LoadingSpinner or SkeletonHeader
      [error]   ErrorState (role="alert")
      [data]
        DetailHeader
          button "← Back" (aria-label="Back to sessions list")
          h1: session.sprint (var(--fh), 17px)
          span: session.date (var(--fm), 12px, var(--wd))
        div[role="tablist", aria-label="Session detail tabs"]
          button[role="tab"] × 4 — one per SESSION_TABS entry
            "Overview" — interactive, aria-selected=true|false
            "Table"    — interactive, aria-selected=true|false
            "Editor"   — interactive, aria-selected=true|false
            "Analyze"  — aria-disabled="true", disabled, title="Coming in S3"
        div[role="tabpanel", id="{activeTab}-panel", aria-labelledby="{activeTab}-tab"]
          [activeTab==="overview"] → &lt;OverviewTab session={session} /&gt;
          [activeTab==="table"]    → &lt;TableTab session={session} /&gt;
          [activeTab==="editor"]   → &lt;EditorTab /&gt; (reads store — no session prop needed)
          [activeTab==="analyze"]  → null (tab is disabled; this panel never renders)
  </component_hierarchy>

  <layout>
    <grid>Single-column. DetailHeader spans full width. Tab bar is a horizontal flex row with
    gap:0 (tabs butt together, each has its own padding). tabpanel area fills remaining height
    (overflow-y: auto).</grid>
    <spacing>
      DetailHeader padding: 12px 0 14px 0 (top/bottom only — left padding comes from ModeContent).
      DetailHeader border-bottom: 1px solid var(--bd). Margin-bottom: 0.
      Tab bar height: 40px. Tab button padding: 0 18px. Tab bar border-bottom: 1px solid var(--bd).
      tabpanel padding-top: 20px.
      Back button margin-bottom: 10px (above the h1).
    </spacing>
    <responsive>
      <breakpoint name="sm">Tab labels shorten: "Overview" → "OV", "Table" → "TBL", "Editor" → "ED",
      "Analyze" → "ANA". Or: tabs wrap to two rows with smaller padding. FE discretion — either
      approach is acceptable; the tablist role and keyboard nav must be preserved regardless.</breakpoint>
      <breakpoint name="md">Full tab labels. Default layout.</breakpoint>
    </responsive>
  </layout>

  <states>
    <state name="loading">
      DetailHeader shows skeleton blocks for sprint slug and date (shimmer). Tab bar renders
      with greyed-out tab buttons (color var(--wm), pointer-events none). tabpanel area shows
      a centered spinner (40px, border-top 3px solid var(--mt), animation spin 0.8s linear infinite).
    </state>
    <state name="error">
      Tab bar is not rendered. Full-width ErrorState panel (role="alert") with left-border
      3px solid var(--redb), background var(--sfm), error message in var(--fm), var(--wd).
      Back button still rendered above the error so the user can return to the list.
    </state>
    <state name="default">
      DetailHeader: sprint slug in var(--fh) 17px var(--w); date in var(--fm) 12px var(--wd).
      Active tab button: color var(--mt), fontWeight 600, border-bottom 2px solid var(--mt).
      Inactive tab button: color var(--wd), border-bottom 2px solid transparent.
      Disabled Analyze tab: color var(--wm), cursor not-allowed, opacity 0.55.
    </state>
    <state name="tab-hover">
      Non-disabled tab buttons on hover: color var(--w), background var(--nav-active-bg)
      (rgba(84,153,181,0.14) — same token used for nav item hover). Transition 120ms.
    </state>
    <state name="tab-focus">
      Tab buttons on focus-visible: outline 2px solid var(--mt), outline-offset 2px.
      Mirrors .tab-item:focus-visible rule already in globals.css.
    </state>
    <state name="tab-active">
      Active tab: aria-selected="true". Visual: border-bottom 2px solid var(--mt), color var(--mt),
      fontWeight 600. No background change on active (underline is sufficient signal).
    </state>
    <state name="tab-disabled">
      Analyze tab: aria-disabled="true", disabled attribute, color var(--wm), opacity 0.55,
      cursor not-allowed, title="Coming in S3". Does NOT receive click events. Does receive
      focus for keyboard discoverability (disabled HTML attribute on a button still removes it
      from tab order — use aria-disabled="true" only, without the HTML disabled attribute, to
      keep it focusable; then suppress click in onClick handler via event.preventDefault() +
      return early). This preserves the WCAG expectation that users can discover disabled controls.
    </state>
  </states>

  <tokens>
    <token element="DetailHeader sprint slug" token="--fh" value="Optima, serif" />
    <token element="DetailHeader sprint slug" token="--w" value="#ffffff" />
    <token element="DetailHeader date" token="--fm" value="'Courier New', monospace" />
    <token element="DetailHeader date" token="--wd" value="rgba(255,255,255,0.72)" />
    <token element="DetailHeader + tab bar separator" token="--bd" value="rgba(84,153,181,0.25)" />
    <token element="Back button text" token="--wd" value="rgba(255,255,255,0.72)" />
    <token element="Back button hover text" token="--mt" value="#5499b5" />
    <token element="Active tab text + underline" token="--mt" value="#5499b5" />
    <token element="Inactive tab text" token="--wd" value="rgba(255,255,255,0.72)" />
    <token element="Tab hover background" token="--nav-active-bg" value="rgba(84,153,181,0.14)" />
    <token element="Tab focus outline" token="--mt" value="#5499b5" />
    <token element="Disabled Analyze tab text" token="--wm" value="rgba(255,255,255,0.38)" />
    <token element="Loading spinner" token="--mt" value="#5499b5" />
    <token element="Error panel — same tokens as SessionListPage ErrorState" token="--sfm / --redb / --wd" value="#122420 / #cf3c3c / rgba(255,255,255,0.72)" />
  </tokens>

  <interactions>
    <interaction trigger="click active (non-disabled) tab button" response="setActiveTab(tab.id) on useSessionStore; tabpanel swaps content; no page remount" />
    <interaction trigger="ArrowRight on focused tab" response="focus moves to next non-disabled tab in the tablist" />
    <interaction trigger="ArrowLeft on focused tab" response="focus moves to previous non-disabled tab in the tablist" />
    <interaction trigger="Enter or Space on focused non-disabled tab" response="activates the tab (same as click)" />
    <interaction trigger="Tab key on active tab button" response="focus moves to the active tabpanel content area" />
    <interaction trigger="click Back button" response="setSelectedSessionId(null); SessionsRouter re-renders to SessionListPage" />
    <interaction trigger="click Analyze disabled tab" response="no-op (onClick suppressed); title='Coming in S3' shown as browser tooltip on hover" />
  </interactions>

  <accessibility_spec>
    <contrast_pairs>
      <pair element="Active tab text on --void background" foreground="--mt (#5499b5)" background="--void (#070d0c)" ratio="~4.8:1" wcag_level="AA" />
      <pair element="Inactive tab text on --void background" foreground="--wd (rgba 72%)" background="--void (#070d0c)" ratio="~11.2:1" wcag_level="AAA" />
      <pair element="Disabled Analyze tab text on --void background" foreground="--wm (rgba 38%)" background="--void (#070d0c)" ratio="~3.5:1" wcag_level="AA (large text only — note: tab text is 13px, borderline; FE should verify at rendered size)" />
      <pair element="Tab hover text on --nav-active-bg overlay" foreground="--w (#ffffff)" background="effective ~#0e1e1d (--void + 14% teal)" ratio="~20:1" wcag_level="AAA" />
      <pair element="DetailHeader sprint slug on --void background" foreground="--w (#ffffff)" background="--void (#070d0c)" ratio="~21:1" wcag_level="AAA" />
      <pair element="DetailHeader date on --void background" foreground="--wd (rgba 72%)" background="--void (#070d0c)" ratio="~11.2:1" wcag_level="AAA" />
      <pair element="Back button on --void background" foreground="--wd (rgba 72%)" background="--void (#070d0c)" ratio="~11.2:1" wcag_level="AAA" />
    </contrast_pairs>
    <heading_structure>h1: session.sprint slug (DetailHeader). No h2 in the shell — tab panels own their internal heading levels (h2 for OverviewTab section heads, if any).</heading_structure>
    <keyboard_flow>
      Back button → tab buttons (Left/Right to navigate within tablist) → active tabpanel content.
      Analyze tab is reachable by keyboard (aria-disabled, not HTML disabled) but does not activate.
    </keyboard_flow>
    <aria_requirements>
      role="tablist" + aria-label="Session detail tabs" on the tab bar container.
      Each tab button: role="tab", aria-selected="true|false", id="{tabId}-tab", aria-controls="{tabId}-panel".
      Active tabpanel div: role="tabpanel", id="{activeTab}-panel", aria-labelledby="{activeTab}-tab", tabIndex=0.
      Analyze tab: aria-disabled="true" (NOT HTML disabled so it remains focusable), title="Coming in S3".
      Back button: aria-label="Back to sessions list".
    </aria_requirements>
  </accessibility_spec>


  <!-- ================================================================
       ANALYZE TAB SLOT — verbatim definition for S3 handoff
       ================================================================ -->

  <analyze_slot_definition>
    Slot specification for S3 sprint handoff. The SESSION_TABS constant in
    packages/client/src/constants/sessions.ts contains this verbatim entry:

      { id: "analyze", label: "Analyze", placeholder: true }

    S3 only needs to flip placeholder: true → false and supply the AnalyzeTab component.
    No changes to SessionDetailPage tab-bar rendering logic are required in S3.
    The tab bar iterates SESSION_TABS and derives disabled state from tab.placeholder === true.
  </analyze_slot_definition>


  <!-- ================================================================
       SURFACE C1 — OverviewTab
       ================================================================ -->

  <surface_id>OverviewTab</surface_id>
  <surface_path>packages/client/src/pages/sessions/tabs/OverviewTab.tsx</surface_path>

  <component_hierarchy>
    OverviewTab (root div, data-testid="overview-tab")
      StatRow (horizontal flex, 4 stat cards)
        StatCard: "Agents" — session.agents.length
        StatCard: "Feedback Loops" — sum(session.agents[].feedback_loops)
        StatCard: "Total Events" — session.events.length
        StatCard: "Status" — session.status ?? "—"
      SectionLabel "Frontmatter"
      FieldGrid (2-column CSS grid on md+, 1-column on sm)
        FieldRow: "Sprint" / session.sprint
        FieldRow: "Date" / session.date
        FieldRow: "Status" / session.status ?? "—"
        FieldRow: "Type" / session.type ?? "—"
        FieldRow: "Title" / session.title ?? "—"
        FieldRow: "Gap Classes" / session.gap_classes.join(", ") || "—"
        FieldRow: "Source Root" / session.source_root
        FieldRow: "Edited File Path" / session.editedFilePath ?? "None"
  </component_hierarchy>

  <layout>
    <grid>
      StatRow: flex row, gap 12px. Each StatCard: flex:1, min-width:0 (shrinks to fit).
      On sm: StatRow wraps to 2×2 grid (display:grid, gridTemplateColumns: repeat(2,1fr)).
      FieldGrid: display:grid, gridTemplateColumns: 200px 1fr, gap:0. Each FieldRow occupies
      one full grid row. On sm: gridTemplateColumns: 1fr (label above value, stacked).
    </grid>
    <spacing>
      StatRow margin-bottom: 24px.
      Each StatCard: padding 12px 16px; border-radius var(--rl); background var(--sfm);
        border: 1px solid var(--bd).
      SectionLabel margin-bottom: 10px; margin-top: 8px.
      FieldRow padding: 8px 0; border-bottom: 1px solid var(--bd).
      Last FieldRow: no border-bottom.
    </spacing>
    <responsive>
      <breakpoint name="sm">StatRow → 2-column grid. FieldGrid → single column (label stacked above value).</breakpoint>
      <breakpoint name="md">StatRow flex row. FieldGrid 2-column. Default.</breakpoint>
    </responsive>
  </layout>

  <states>
    <state name="default">
      StatCard: stat value in var(--fh) 22px var(--mt) (bold, teal — draws the eye).
      Stat label below value: var(--fm) 10px var(--wm) uppercase letterSpacing 0.1em.
      Field label (left column): var(--fm) 11px var(--wm) uppercase letterSpacing 0.08em.
      Field value (right column): var(--fb) 13px var(--wd).
      editedFilePath value (when set): var(--mg) (#4caf7d — green, signals the edited copy exists).
      editedFilePath value "None": var(--wm).
      gap_classes value (when non-empty): each class rendered as an inline chip:
        background rgba(155,89,182,0.18) (var(--mp) at low opacity — purple tint for gap signal);
        color var(--mp); border-radius var(--r); padding 2px 6px; font var(--fm) 11px.
        The chip background uses var(--mp) at 18% opacity — expressed in CSS as
        rgba(155,89,182,0.18). This is not a new token; it is a CSS rgba() composition using
        the resolved value of --mp. FE should write it as a CSS rule rather than an inline style.
    </state>
    <state name="empty-gap-classes">
      gap_classes is empty: field value shows "—" in var(--wm). No chips rendered.
    </state>
    <state name="no-edited-file">
      editedFilePath is undefined: field value shows "None" in var(--wm).
    </state>
  </states>

  <tokens>
    <token element="Stat value" token="--mt + --fh" value="#5499b5 / Optima serif" />
    <token element="Stat label" token="--wm + --fm" value="rgba(255,255,255,0.38) / Courier New" />
    <token element="StatCard background" token="--sfm" value="#122420" />
    <token element="StatCard border" token="--bd" value="rgba(84,153,181,0.25)" />
    <token element="FieldRow border" token="--bd" value="rgba(84,153,181,0.25)" />
    <token element="Field label" token="--wm + --fm" value="rgba(255,255,255,0.38) / Courier New" />
    <token element="Field value" token="--wd + --fb" value="rgba(255,255,255,0.72) / Segoe UI" />
    <token element="editedFilePath (set)" token="--mg" value="#4caf7d" />
    <token element="gap_classes chip text" token="--mp" value="#9b59b6" />
    <token element="gap_classes chip background" token="rgba(--mp, 0.18)" value="rgba(155,89,182,0.18)" />
    <token element="SectionLabel text" token="--wd + --fm" value="rgba(255,255,255,0.72) / Courier New" />
  </tokens>

  <interactions>
    <interaction trigger="none — this tab is read-only" response="no interactive elements in OverviewTab" />
  </interactions>

  <accessibility_spec>
    <contrast_pairs>
      <pair element="Stat value --mt on --sfm background" foreground="--mt (#5499b5)" background="--sfm (#122420)" ratio="~4.8:1" wcag_level="AA" />
      <pair element="Stat label --wm on --sfm background" foreground="--wm (rgba 38%)" background="--sfm (#122420)" ratio="~3.1:1" wcag_level="AA (large text — note: 10px uppercase is technically small; FE should increase to 11px minimum for AA compliance)" />
      <pair element="Field label --wm on --void background" foreground="--wm (rgba 38%)" background="--void (#070d0c)" ratio="~3.5:1" wcag_level="AA (large text — same note; use font-weight 700 to meet AA at this size)" />
      <pair element="Field value --wd on --void background" foreground="--wd (rgba 72%)" background="--void (#070d0c)" ratio="~11.2:1" wcag_level="AAA" />
      <pair element="editedFilePath --mg on --void background" foreground="--mg (#4caf7d)" background="--void (#070d0c)" ratio="~8.0:1" wcag_level="AAA" />
      <pair element="Gap classes chip --mp on rgba(155,89,182,0.18) on --void" foreground="--mp (#9b59b6)" background="effective ~#130d1a" ratio="~4.8:1" wcag_level="AA" />
    </contrast_pairs>
    <heading_structure>No heading within OverviewTab (parent DetailHeader h1 covers the session identity). SectionLabel "Frontmatter" is a styled div, not a heading — no heading hierarchy to maintain here.</heading_structure>
    <keyboard_flow>No interactive elements. Tab moves through the tabpanel to the next interactive element in the page.</keyboard_flow>
    <aria_requirements>data-testid="overview-tab" on root div. No additional ARIA requirements — content is presentational.</aria_requirements>
  </accessibility_spec>


  <!-- ================================================================
       SURFACE C2 — TableTab (Agent Activity Sortable Table)
       ================================================================ -->

  <surface_id>TableTab</surface_id>
  <surface_path>packages/client/src/pages/sessions/tabs/TableTab.tsx</surface_path>

  <sc5_note>
    SC5 in the orchestrator_brief uses wording "sort by seq, ts, agent, event" — this is a
    brief-level artifact from an earlier event-log framing. The human-confirmed authoritative
    deliverable is the AGENT-ACTIVITY table below. The auditor MUST NOT fail this packet for
    absent seq, ts, or event columns. The 9 authoritative columns are listed below and match
    AgentActivitySchema in packages/shared/src/schemas.ts exactly.
  </sc5_note>

  <component_hierarchy>
    TableTab (root div, data-testid="table-tab")
      [empty] EmptyState (aria-live="polite") "No agent activity recorded"
      [data]  div (overflow-x: auto)
        table[aria-label="Agent activity"]
          caption (sr-only) "Agent activity table, sortable by column header. {N} agents."
          thead
            tr
              SortableHeader "Agent ID" (data-col="agent_id")
              SortableHeader "Spawns" (data-col="spawns")
              SortableHeader "Completes" (data-col="completes")
              SortableHeader "Feedback Loops" (data-col="feedback_loops")
              SortableHeader "Critique Passes" (data-col="critique_passes")
              SortableHeader "Critique Blocks" (data-col="critique_blocks")
              SortableHeader "Audit Passes" (data-col="audit_passes")
              SortableHeader "Audit Fails" (data-col="audit_fails")
              SortableHeader "Wall Clock (ms)" (data-col="wall_clock_ms")
          tbody
            tr × N — one per session.agents entry (AgentActivity)
              td: agent.agent_id
              td: agent.spawns
              td: agent.completes
              td: agent.feedback_loops
              td: agent.critique_passes
              td: agent.critique_blocks
              td: agent.audit_passes
              td: agent.audit_fails
              td: agent.wall_clock_ms ?? "—"
  </component_hierarchy>

  <sortable_header_spec>
    SortableHeader is a th element containing a button (or the th itself with role="button",
    tabIndex=0, onClick). On click: toggles sort direction (asc→desc→asc) for that column;
    resets sort direction on other columns. Local useState for { col: string, dir: "asc"|"desc" }.
    Default sort: Agent ID ascending.
    Sort indicator: a small up/down arrow glyph adjacent to the column label:
      - Active sort ascending: "▲" in var(--mt)
      - Active sort descending: "▼" in var(--mt)
      - Inactive: "⇅" in var(--wm) (indicates sortable but not currently sorted)
    The button inside th has aria-sort="ascending|descending|none" (on the th, not the button,
    per WAI-ARIA table sort pattern).
  </sortable_header_spec>

  <layout>
    <grid>
      Full-width table in an overflow-x:auto wrapper (handles narrow viewports).
      Column widths: Agent ID 20%; numeric columns auto (evenly distributed across remaining 80%).
      Minimum column width: 80px for numeric cols, 140px for Agent ID.
    </grid>
    <spacing>
      th padding: 10px 12px. td padding: 9px 12px.
      Row border-bottom: 1px solid var(--bd).
      Header row background: var(--sfm). Data rows: alternating transparent / rgba(18,36,32,0.4)
      (light zebra: even rows get a slight var(--sfm) tint at 40%). The zebra tint keeps cell
      background effectively var(--void)-adjacent for contrast calculation.
    </spacing>
    <responsive>
      <breakpoint name="sm">overflow-x:auto allows horizontal scroll. Column headers remain visible
      via sticky positioning (position:sticky, top:0) within the scroll container. No columns hidden
      (all 9 are the authoritative set; hiding any loses data). FE may reduce th padding to 8px 8px
      on narrow viewports.</breakpoint>
      <breakpoint name="md">Full padding. Default layout.</breakpoint>
    </responsive>
  </layout>

  <states>
    <state name="default">
      Header row: background var(--sfm); color var(--wd); font var(--fm) 11px uppercase
      letterSpacing 0.08em; fontWeight 700.
      Data rows: color var(--w); font var(--fb) 13px.
      Even rows: background rgba(18,36,32,0.4) — slight sfm tint.
      Odd rows: background transparent.
      Numeric cells (Spawns through Wall Clock): text-align right; font var(--fm) 13px.
      Agent ID cell: text-align left; font var(--fm) 13px (monospace for id readability).
    </state>
    <state name="sort-active-col">
      Active sort column header: color var(--mt); sort indicator glyph "▲" or "▼" in var(--mt).
      Other column headers: sort indicator "⇅" in var(--wm).
    </state>
    <state name="header-hover">
      th button on hover: background rgba(84,153,181,0.08); color var(--w). Transition 100ms.
    </state>
    <state name="header-focus">
      th button on focus-visible: outline 2px solid var(--mt), outline-offset -2px (inset).
    </state>
    <state name="empty">
      table not rendered. Centered div[aria-live="polite"]: text "No agent activity recorded"
      (var(--fh) 16px var(--wd)). Same visual shape as SessionListPage EmptyState.
    </state>
    <state name="critique-block-highlight">
      Any row where agent.critique_blocks > 0: the Critique Blocks td renders the value in
      var(--mr) (#e74c3c) to draw attention to failed critique loops. Other cells in that row
      remain default color.
    </state>
    <state name="audit-fail-highlight">
      Any row where agent.audit_fails > 0: the Audit Fails td renders the value in var(--mo)
      (#e8914d, orange) as a warning signal. Audit fails are notable but not as critical as
      critique blocks.
    </state>
  </states>

  <tokens>
    <token element="Table header background" token="--sfm" value="#122420" />
    <token element="Table header text" token="--wd" value="rgba(255,255,255,0.72)" />
    <token element="Active sort header text + indicator" token="--mt" value="#5499b5" />
    <token element="Inactive sort indicator" token="--wm" value="rgba(255,255,255,0.38)" />
    <token element="Table data cell text" token="--w" value="#ffffff" />
    <token element="Agent ID cell font" token="--fm" value="'Courier New', monospace" />
    <token element="Numeric cell font" token="--fm" value="'Courier New', monospace" />
    <token element="Row border-bottom" token="--bd" value="rgba(84,153,181,0.25)" />
    <token element="Critique Blocks value (>0)" token="--mr" value="#e74c3c" />
    <token element="Audit Fails value (>0)" token="--mo" value="#e8914d" />
    <token element="Header hover background" token="--mt at 8% opacity" value="rgba(84,153,181,0.08)" />
    <token element="Header focus outline" token="--mt" value="#5499b5" />
    <token element="Empty state text" token="--wd + --fh" value="rgba(255,255,255,0.72) / Optima serif" />
  </tokens>

  <interactions>
    <interaction trigger="click column header button" response="sorts tbody rows by that column, toggles asc/desc; updates aria-sort attribute on th" />
    <interaction trigger="Enter or Space on focused header button" response="same as click" />
    <interaction trigger="Tab" response="moves focus between header sort buttons; then to first data cell group if any data rows are focusable (FE may leave tbody rows non-focusable — they are display-only in TableTab)" />
  </interactions>

  <accessibility_spec>
    <contrast_pairs>
      <pair element="Table header text --wd on --sfm" foreground="--wd (rgba 72%)" background="--sfm (#122420)" ratio="~8.1:1" wcag_level="AAA" />
      <pair element="Active sort header --mt on --sfm" foreground="--mt (#5499b5)" background="--sfm (#122420)" ratio="~4.8:1" wcag_level="AA" />
      <pair element="Data cell --w on --void (odd rows)" foreground="--w (#ffffff)" background="--void (#070d0c)" ratio="~21:1" wcag_level="AAA" />
      <pair element="Data cell --w on even row background" foreground="--w (#ffffff)" background="effective ~#0b1613 (void + sfm 40%)" ratio="~20:1" wcag_level="AAA" />
      <pair element="Critique Blocks --mr on --void" foreground="--mr (#e74c3c)" background="--void (#070d0c)" ratio="~5.2:1" wcag_level="AA" />
      <pair element="Audit Fails --mo on --void" foreground="--mo (#e8914d)" background="--void (#070d0c)" ratio="~4.9:1" wcag_level="AA" />
      <pair element="Inactive sort indicator --wm on --sfm" foreground="--wm (rgba 38%)" background="--sfm (#122420)" ratio="~3.2:1" wcag_level="AA (large text — glyph is 11px; ensure fontWeight 700 or increase to 12px)" />
    </contrast_pairs>
    <heading_structure>No heading within TableTab. sr-only caption provides context for screen readers.</heading_structure>
    <keyboard_flow>Tab through sort header buttons (Enter/Space to sort). Arrow keys on th buttons follow standard button behavior within the row. Tbody rows are display-only (no tabIndex on data rows in this surface).</keyboard_flow>
    <aria_requirements>
      table[aria-label="Agent activity"]; caption (sr-only) "Agent activity table, sortable. {N} agents.";
      th[aria-sort="ascending|descending|none"] on each sortable header;
      aria-live="polite" on empty state div;
      Critique Blocks and Audit Fails highlight cells: aria-label="{value} critique blocks" etc. (color alone must not convey meaning — pair with accessible name on the cell).
    </aria_requirements>
  </accessibility_spec>


  <!-- ================================================================
       SURFACE C3 — EditorTab
       ================================================================ -->

  <surface_id>EditorTab</surface_id>
  <surface_path>packages/client/src/pages/sessions/tabs/EditorTab.tsx</surface_path>

  <component_hierarchy>
    EditorTab (root div, data-testid="editor-tab")
      SaveTargetRow (horizontal flex, align-items baseline, gap 8px)
        span "Save target:" (var(--fm) 11px var(--wm) uppercase)
        span: session.editedFilePath ?? "(path assigned on first save)" (var(--fm) 12px var(--wd))
      Textarea (Shadcn Textarea primitive — packages/client/src/components/ui/textarea.tsx)
        value={editBuffer}
        onChange={e => setEditBuffer(e.target.value)}
        aria-label="Session markdown editor"
        rows={24}
        style: full-width, background var(--sfm), color var(--w), border 1px solid var(--bd),
               font var(--fm) 13px, border-radius var(--rl), resize vertical
      ButtonRow (horizontal flex, gap 12px, margin-top 12px)
        Button "Save edit" (Shadcn Button, variant=default/primary style applied via CSS vars)
        Button "Revert to original" (Shadcn Button, variant=outline or secondary style)
      [save-success] InlineSaveSuccess
        div: "Saved to: {lastSaveResult.filePath}" (var(--mg) #4caf7d, var(--fm) 12px)
      [save-error] InlineSaveError
        div[role="alert"]: "Save failed: {lastSaveError}" (var(--redb) #cf3c3c, var(--fm) 12px)
  </component_hierarchy>

  <layout>
    <grid>Single-column, full-width. Textarea fills 100% width. ButtonRow is flex row, left-aligned.</grid>
    <spacing>
      SaveTargetRow padding-bottom: 10px; border-bottom: 1px solid var(--bd); margin-bottom: 14px.
      Textarea width: 100%; min-height: 400px (rows=24 at 13px/1.5 line-height ≈ 468px — rows attr drives min-height).
      ButtonRow margin-top: 12px.
      InlineSaveSuccess / InlineSaveError: margin-top 10px; padding 8px 14px; border-radius var(--r).
    </spacing>
    <responsive>
      <breakpoint name="sm">ButtonRow wraps to column (flex-direction column; buttons full-width).
      SaveTargetRow: path text truncated with text-overflow ellipsis.</breakpoint>
      <breakpoint name="md">ButtonRow horizontal. Default.</breakpoint>
    </responsive>
  </layout>

  <states>
    <state name="default">
      Textarea shows editBuffer content (pre-filled from session.getRaw on tab mount via
      useSessionRaw hook; stored in originalContent and editBuffer in session-store.ts).
      "Save edit" button: active (not disabled). "Revert to original" button: active.
      No success or error message shown.
      SaveTargetRow path: session.editedFilePath if set; otherwise "(path assigned on first save)"
      in var(--wm) italic.
    </state>
    <state name="loading-raw">
      While useSessionRaw is loading: Textarea shows a placeholder "Loading source markdown…"
      in var(--wm); disabled attribute on Textarea; "Save edit" button disabled; "Revert" button
      disabled. No spinner needed — the Textarea placeholder text is sufficient.
    </state>
    <state name="dirty">
      When editBuffer !== originalContent: "Save edit" button gets box-shadow var(--dirty-pulse)
      (0 0 0 2px rgba(232,145,77,0.45) — the dirty-state pulse ring already defined in globals.css).
      Rationale: the pulse ring signals unsaved changes without being intrusive; it reuses the
      existing --dirty-pulse token from the EditPage's save button pattern.
    </state>
    <state name="saving">
      On "Save edit" click while mutation is in-flight: "Save edit" button disabled + text
      "Saving…"; "Revert to original" button disabled. Textarea remains editable (do not lock
      the textarea — SC7 requires the buffer to survive a failed save).
    </state>
    <state name="save-success">
      After successful save: InlineSaveSuccess div appears below ButtonRow with text
      "Saved to: {lastSaveResult.filePath}" in var(--mg) (#4caf7d). Success message has
      background rgba(76,175,125,0.1) (var(--mg) at 10% opacity — CSS rgba composition, not a
      new token) and border-left 3px solid var(--mg). Buttons return to enabled state.
      editBuffer is NOT cleared — the user can continue editing.
    </state>
    <state name="save-error">
      After failed save: InlineSaveError div[role="alert"] appears below ButtonRow with text
      "Save failed: {lastSaveError}" in var(--redb). Error message has background var(--sfm)
      and border-left 3px solid var(--redb). editBuffer is preserved (SC7 invariant — the
      textarea content MUST NOT be cleared on error). Buttons return to enabled state.
    </state>
    <state name="hover-save-button">
      "Save edit" button hover: background var(--mt) at slightly higher opacity, or the Shadcn
      Button's built-in hover state using CSS var(--primary) token. FE uses the Shadcn Button
      variant hover behavior; do not override with raw hex.
    </state>
    <state name="focus-buttons">
      Both buttons: focus-visible outline 2px solid var(--mt), offset 2px. Shadcn Button
      already handles focus ring; verify it resolves to var(--ring) or --mt.
    </state>
    <state name="hover-revert-button">
      "Revert to original" button hover: Shadcn outline/secondary variant hover behavior.
      No custom override needed.
    </state>
    <state name="revert-action">
      On "Revert to original" click: setEditBuffer(originalContent) on the store. This restores
      the textarea to the source markdown. No confirmation dialog — revert is instant. The user
      can re-type or save again. lastSaveResult and lastSaveError are NOT cleared by revert.
    </state>
  </states>

  <tokens>
    <token element="Save target label" token="--wm + --fm" value="rgba(255,255,255,0.38) / Courier New" />
    <token element="Save target path" token="--wd + --fm" value="rgba(255,255,255,0.72) / Courier New" />
    <token element="SaveTargetRow border-bottom" token="--bd" value="rgba(84,153,181,0.25)" />
    <token element="Textarea background" token="--sfm" value="#122420" />
    <token element="Textarea text" token="--w + --fm" value="#ffffff / Courier New" />
    <token element="Textarea border" token="--bd" value="rgba(84,153,181,0.25)" />
    <token element="Textarea border-radius" token="--rl" value="8px" />
    <token element="Dirty state button pulse" token="--dirty-pulse" value="0 0 0 2px rgba(232,145,77,0.45)" />
    <token element="Save success text" token="--mg" value="#4caf7d" />
    <token element="Save success border-left" token="--mg" value="#4caf7d" />
    <token element="Save error text" token="--redb" value="#cf3c3c" />
    <token element="Save error border-left" token="--redb" value="#cf3c3c" />
    <token element="Save error background" token="--sfm" value="#122420" />
  </tokens>

  <interactions>
    <interaction trigger="type in Textarea" response="setEditBuffer(e.target.value); dirty state activates if buffer !== originalContent" />
    <interaction trigger="click Save edit" response="calls useSessionSave.mutate({ id: selectedSessionId, content: editBuffer }); entering saving state" />
    <interaction trigger="mutation success" response="setLastSaveResult({ filePath: data.filePath }); setLastSaveError(null); InlineSaveSuccess appears" />
    <interaction trigger="mutation error" response="setLastSaveError(err.message); InlineSaveError appears; editBuffer preserved" />
    <interaction trigger="click Revert to original" response="setEditBuffer(originalContent); textarea resets to source markdown" />
    <interaction trigger="Tab" response="moves focus: SaveTargetRow → Textarea → Save edit button → Revert button → (tabpanel exit)" />
  </interactions>

  <accessibility_spec>
    <contrast_pairs>
      <pair element="Save target label on --void background" foreground="--wm (rgba 38%)" background="--void (#070d0c)" ratio="~3.5:1" wcag_level="AA (large text — use fontWeight 700 to meet AA at 11px)" />
      <pair element="Save target path on --void background" foreground="--wd (rgba 72%)" background="--void (#070d0c)" ratio="~11.2:1" wcag_level="AAA" />
      <pair element="Textarea text on --sfm background" foreground="--w (#ffffff)" background="--sfm (#122420)" ratio="~13.8:1" wcag_level="AAA" />
      <pair element="Save success text on rgba(--mg,0.1) overlay" foreground="--mg (#4caf7d)" background="effective ~#091a0f (void + mg 10%)" ratio="~8.0:1" wcag_level="AAA" />
      <pair element="Save error text on --sfm background" foreground="--redb (#cf3c3c)" background="--sfm (#122420)" ratio="~4.7:1" wcag_level="AA" />
    </contrast_pairs>
    <heading_structure>No heading within EditorTab. Parent DetailHeader h1 is sufficient.</heading_structure>
    <keyboard_flow>Tab order: Textarea → Save edit button → Revert button. SaveTargetRow is display-only (no interactive element). InlineSaveSuccess/Error are display-only.</keyboard_flow>
    <aria_requirements>
      Textarea: aria-label="Session markdown editor"; aria-describedby pointing to SaveTargetRow span (optional — gives screen reader context for what is being edited).
      InlineSaveError: role="alert" (announced immediately by screen readers on appearance).
      InlineSaveSuccess: role="status" (polite announcement).
      "Save edit" button: aria-busy="true" during saving state; text changes to "Saving…".
      "Revert to original" button: aria-label="Revert to original source markdown" for clarity.
    </aria_requirements>
  </accessibility_spec>


  <!-- ================================================================
       SURFACE C4 — Analyze Tab (disabled placeholder — rendered in the tab bar only)
       ================================================================ -->

  <surface_id>AnalyzeTab</surface_id>
  <surface_note>
    The Analyze tab slot is specified as { id: "analyze", label: "Analyze", placeholder: true }
    in packages/client/src/constants/sessions.ts. In this sprint, no tabpanel content is rendered
    for this tab. The tab button itself is rendered in the tablist (always — so S3 can discover
    the slot visually) but is disabled. S3 sets placeholder: false and supplies the AnalyzeTab
    component — no changes to SessionDetailPage's tab-bar rendering logic are required.
  </surface_note>

  <analyze_slot_verbatim>
    { id: "analyze", label: "Analyze", placeholder: true }
  </analyze_slot_verbatim>

  <analyze_tab_rendering_rule>
    In SessionDetailPage, when iterating SESSION_TABS to render the tablist:
    - If tab.placeholder === true:
        button[role="tab", aria-disabled="true", title="Coming in S3"]
        with color var(--wm), opacity 0.55, cursor not-allowed.
        The button does NOT have the HTML disabled attribute (so it remains focusable).
        onClick is a no-op (return early or event.preventDefault()).
    - tabpanel for analyze is not rendered at all in S2.
  </analyze_tab_rendering_rule>

  <tokens>
    <token element="Analyze tab button text" token="--wm" value="rgba(255,255,255,0.38)" />
  </tokens>

  <accessibility_spec>
    <aria_requirements>
      aria-disabled="true" on the Analyze tab button; title="Coming in S3" (browser tooltip);
      no aria-controls or aria-selected needed while placeholder:true (panel does not exist).
    </aria_requirements>
  </accessibility_spec>


  <!-- ================================================================
       CROSS-SURFACE NOTES
       ================================================================ -->

  <notes>
    1. DESIGN.md ABSENT — spec tokens are inferred from packages/client/src/globals.css and
       BrowsePage.tsx convention. Recommend the human invoke generate-design before S3 to
       produce a formal DESIGN.md for this project. Without it, design drift is possible across
       sprints.

    2. --ms DOES NOT EXIST — this token appears in no version of globals.css. Any agent that
       references --ms is producing a token violation. Sessions nav dot is var(--mp) (#9b59b6).
       This note must travel with the spec into every FE packet.

    3. NO Shadcn tabs, tooltip, or toast primitives — these do not exist at
       packages/client/src/components/ui/. Tab bar is role="tablist" from plain buttons.
       Save confirmation is inline text (role="status" or role="alert"). Disabled Analyze tab
       uses title attribute — not a Tooltip component.

    4. TABLE TAB SC5 NOTE — The orchestrator_brief SC5 says "sort by seq, ts, agent, event".
       This is a brief artifact from an event-log framing. The human-confirmed authoritative
       columns are the 9 Agent Activity columns: Agent ID, Spawns, Completes, Feedback Loops,
       Critique Passes, Critique Blocks, Audit Passes, Audit Fails, Wall Clock (ms).
       These map exactly to AgentActivitySchema in packages/shared/src/schemas.ts.
       The auditor MUST NOT fail t5b for absent seq/ts/event columns.

    5. PAGE LOCATION DEVIATION — Sessions pages are nested under pages/sessions/ rather than
       the flat pages/ root. This is deliberate: Sessions is a multi-surface mode with 5+
       components (list, detail, 4 tab interiors). A subdirectory prevents namespace collision
       and signals surface depth. S3 adds sessions/tabs/AnalyzeTab.tsx to the same tree.

    6. STORE FILE NAME — session-store.ts (kebab-case per cross-sprint invariant and project
       convention). The wrong casing sessionStore.ts MUST NOT appear in any FE packet or import.

    7. DISABLED ANALYZE TAB FOCUSABILITY — The spec intentionally uses aria-disabled="true"
       WITHOUT the HTML disabled attribute on the Analyze tab button. This keeps the tab in
       the keyboard tab order so users can discover it and read its title. If FE uses the HTML
       disabled attribute, the tab is removed from keyboard navigation entirely (WCAG failure
       for discoverability of coming features). Click must be suppressed in the onClick handler.

    8. DIRTY-STATE PULSE — The --dirty-pulse token (already in globals.css line 49) is used on
       the "Save edit" button when editBuffer !== originalContent. This reuses the established
       EditPage save-button pattern and avoids inventing a new visual signal for unsaved state.

    9. GAP CLASSES CHIP BACKGROUND — rgba(155,89,182,0.18) is a CSS rgba() composition using
       the resolved value of var(--mp). It is not a new design token. FE should write this as a
       CSS calc or a utility class, not as an inline style with a hardcoded hex. If a CSS variable
       is needed, propose --mp-chip-bg as a new token in a future generate-design invocation.

    10. DASHBOARD PATTERNS — Two new patterns are proposed: SessionBrowseList and TabbedDetailShell.
        Both are flagged for human approval per the STRICT-WITH-EXTENSION-PROTOCOL in
        dashboard-patterns.md. FE may implement once the human approves and the patterns are
        added to the library. However, because this is NOT a dashboard-type app (App Type is not
        declared as "dashboard" in any DESIGN.md — DESIGN.md is absent), the governance for
        mandatory pattern citation technically does not apply. The proposals are included
        proactively to formalize these idioms for future reuse in the pattern library.

    11. WIRING SUMMARY for FE agents:
        - session-store.ts: state for selectedSessionId (drives SessionsRouter), activeTab,
          editBuffer, originalContent, lastSaveResult, lastSaveError.
        - SessionsRouter: zero-prop; reads selectedSessionId; renders list or detail.
        - SessionDetailPage: zero-prop; reads selectedSessionId; calls useSessionDetail(id!).
        - EditorTab: no session prop needed — reads selectedSessionId from store to call
          useSessionRaw; reads editBuffer from store; calls useSessionSave mutation.
        - OverviewTab and TableTab: receive session prop from SessionDetailPage.
  </notes>

</design_spec>
```
