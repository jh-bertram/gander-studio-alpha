# Task Decomposition — prog-studio-sessions-2026-05-s2-list-edit

Generated: 2026-05-20T19:15:00Z
PM: PM#1
Sprint: S2 of prog-studio-sessions-2026-05 — Sessions List + Viewer + Markdown Editor
Reads used: 8 of 8 budget cap (brief + 6 reference files + S1 post-mortem)

---

<task_decomposition task_id="prog-studio-sessions-2026-05-s2-list-edit" agent_count="6">

  <task_packets>

    <!-- ================================================================
         WAVE 0 — t1 (UI Design) + t2 (BE raw precursor) — parallel
         ================================================================ -->

    <task_packet>
      <task_id>prog-studio-sessions-2026-05-s2-list-edit-t1-ui-design</task_id>
      <assigned_to>ui-designer</assigned_to>
      <priority>HIGH</priority>
      <description>
        Produce a UI design spec for the S2 Sessions mode. The spec covers three surfaces:

        Surface A — SessionListPage: a list of session rows (sprint slug, date, status, gap_classes summary).
        Empty state, error state, and loading skeleton.

        Surface B — SessionDetailPage shell: a tab bar for four tabs (Overview, Table, Editor, Analyze).
        Analyze is a disabled tab with hover label "Coming in S3". The detail page header shows the session
        sprint slug and date. Tab switching must not remount the data fetch.

        Surface C — Tab interiors:
          - Overview tab: frontmatter fields (sprint, date, status, type, title, gap_classes, source_root,
            editedFilePath) + top-line stat row (agent count, feedback-loop count, total events, status).
          - Table tab: agent activity sortable table with columns [Agent ID, Spawns, Completes,
            Feedback Loops, Critique Passes, Critique Blocks, Audit Passes, Audit Fails, Wall Clock (ms)].
            Column headers are clickable sort triggers. Keyboard-navigable (tab through rows; Enter/Space
            on headers to sort). WCAG AA contrast required on all cells.
          - Editor tab: full-width Textarea (Shadcn Textarea primitive) bound to session markdown body.
            Above: a read-only "Save target:" label showing the SESSIONS_EDITS_DIR-relative path.
            Below the textarea: a button row — "Save edit" (primary) + "Revert to original" (secondary).
            Inline success state: shows absolute destination path. Inline error state: shows server error
            message without clearing the textarea content.
          - Analyze tab: disabled button, title attribute = "Coming in S3", greyed token palette.

        Constraints:
        - Token-first. All colors reference globals.css CSS custom properties (--mt, --my, --mg, --mb,
          --bd, --sfm, --redb, --wd, --wm, --wl, --fh, --fm, --rl, --gt, etc.).
          Do NOT emit raw hex values. Cite ~/.claude/refs/dashboard-patterns.md by name for
          browse-list and detail-tabbed patterns.
        - NO Shadcn tabs/tooltip/toast primitives (they do not exist in the codebase). Tab switching
          must be built from role="tablist" + role="tab" buttons with conditional render of role="tabpanel".
          Save confirmation is inline — not a toast overlay. Disabled Analyze tab uses title attribute
          (or popover if needed) — not a tooltip primitive.
        - NO new ad-hoc hex values per cross-sprint invariant 4.
        - All interactive states specified: hover, focus, active, disabled, loading, empty, error.
        - WCAG AA: verify every fg/bg token pair and record in contrast_pairs.
        - Pages nested under pages/sessions/ (deliberate structural deviation for a multi-surface mode;
          document this call in the spec).
        - Stores: session-store.ts (kebab-case per convention, not sessionStore.ts).
        - The Analyze slot must be specified as { id: "analyze", label: "Analyze", placeholder: true }
          so S3 only flips placeholder false.
        - design_system_source: INFERRED (no DESIGN.md present; flag absence in notes).
      </description>
      <success_criteria>
        - design_spec tag returned.
        - All three surfaces (List, Detail shell, 4 tab interiors) fully specified with all states
          (happy, empty, error, loading, disabled).
        - Tab bar implemented via role="tablist"/"tab"/"tabpanel" — no Shadcn tabs primitive cited.
        - Analyze tab slot specified as { id: "analyze", label: "Analyze", placeholder: true } verbatim.
        - contrast_pairs block present with WCAG AA verification for every fg/bg pair.
        - No raw hex values anywhere in the spec.
        - dashboard-patterns.md cited by name for list + detail-tabbed patterns.
        - design_system_source: INFERRED with a note about DESIGN.md absence.
        - Session store file named session-store.ts (not sessionStore.ts).
      </success_criteria>
      <context_files>
        packages/client/src/globals.css
        packages/client/src/pages/BrowsePage.tsx
        packages/client/src/components/ui/
        ~/.claude/refs/dashboard-patterns.md
        docs/programs/prog-studio-sessions-2026-05/sprints/prog-studio-sessions-2026-05-s2-list-edit/orchestrator_brief.md
      </context_files>
      <dependencies>NONE</dependencies>
      <out_of_scope>
        - Do NOT produce code. This is a spec only.
        - Do NOT cite Shadcn tabs, tooltip, or toast primitives — they do not exist in the codebase.
        - Do NOT specify markdown preview rendering (out of scope for S2).
        - Do NOT specify diff view between original and edited copy.
        - Do NOT specify any analysis visualization (S3).
        - Do NOT add new hex values — token names only.
      </out_of_scope>
      <output_expected>
        <tag>design_spec</tag>
        <must_contain>
          <item>SessionListPage spec with row layout, empty state, error state, loading skeleton</item>
          <item>SessionDetailPage shell spec with tab bar (Overview / Table / Editor / Analyze disabled)</item>
          <item>OverviewTab spec with frontmatter fields + stat row</item>
          <item>TableTab spec with sortable columns, keyboard nav, WCAG AA confirmation</item>
          <item>EditorTab spec with Textarea, Save target label, Save + Revert buttons, inline success/error</item>
          <item>contrast_pairs block</item>
          <item>Analyze slot declaration: { id: "analyze", label: "Analyze", placeholder: true }</item>
          <item>dashboard-patterns.md citation</item>
        </must_contain>
        <must_not_contain>
          <item>Raw hex color values</item>
          <item>References to Shadcn tabs, tooltip, or toast primitives</item>
          <item>Markdown preview or diff view spec</item>
          <item>sessionStore.ts (wrong casing — must be session-store.ts)</item>
        </must_not_contain>
        <success_signal>design_spec returned with all surfaces, contrast_pairs, and the Analyze placeholder verbatim</success_signal>
      </output_expected>
    </task_packet>

    <task_packet>
      <task_id>prog-studio-sessions-2026-05-s2-list-edit-t2-be-raw</task_id>
      <assigned_to>backend-engineer</assigned_to>
      <priority>BLOCKER</priority>
      <description>
        RATIONALE: SC6 requires the Editor tab to pre-fill with the original source markdown and support
        revert-to-original. The S1 SessionSchema has no raw body field; session.get returns a parsed object
        only. A browser cannot read the filesystem. Adding the read path is a backend concern (see critical
        seam finding in the ORC brief). This packet adds a single tRPC query procedure.

        ADD to packages/server/src/router.ts (sessionRouter):
          session.getRaw
            input:  { id: string }        validated by z.object({ id: z.string() })
            output: { content: string }   validated by z.object({ content: z.string() })
            type:   QUERY
            semantics:
              - Use the same source-dir scan + composite-key lookup as session.get (reuse collectSessions
                from session-list.ts; match by id OR sprint, same as session.get).
              - On match: read the file at session.filePath using fs.promises.readFile(path, 'utf8').
                If session.editedFilePath is set, still read session.filePath (the ORIGINAL source),
                NOT the edited copy — the client needs the original for pre-fill and revert.
              - On NOT_FOUND (no matching session): throw TRPCError({ code: 'NOT_FOUND' }) matching the
                session.get pattern.
              - On file read error (ENOENT, EACCES, etc.): throw TRPCError({ code: 'INTERNAL_SERVER_ERROR',
                message: err.message }).
              - Path traversal: the filePath comes from collectSessions (already validated at parse time);
                do NOT accept raw filePath from the client input. Only the session id is accepted as input.

        ADD to packages/shared/src/schemas.ts:
          export const SessionRawOutputSchema = z.object({ content: z.string() });
          export type SessionRawOutput = z.infer<typeof SessionRawOutputSchema>;
          (Also add the input schema as SessionRawInputSchema = z.object({ id: z.string() }) for parity,
          though it can be inlined in the router if preferred — your call, as long as the output schema
          is exported from shared for the client to import.)

        DO NOT modify SessionSchema, existing procedures, or any other schema.
        DO NOT modify any client files.
        DO NOT add vitest tests for this procedure (the existing session-list + collectSessions are
        already tested; a lightweight integration test is acceptable if you want it, but is not required
        by this packet's SC — the auditor will do a real-corpus smoke).

        Commit: return a completion_packet. The orchestrator commits post-audit. DO NOT run git add/commit.
      </description>
      <success_criteria>
        - session.getRaw query added to sessionRouter in packages/server/src/router.ts.
        - Input validated by z.object({ id: z.string() }).
        - Output validated by z.object({ content: z.string() }); SessionRawOutputSchema exported from
          packages/shared/src/schemas.ts.
        - Reads session.filePath (original source), not editedFilePath.
        - NOT_FOUND thrown when id does not match any session (same semantics as session.get).
        - INTERNAL_SERVER_ERROR thrown on file read failure.
        - Client input is id only (no filePath accepted from client — path-traversal prevention).
        - npm run lint (tsc --noEmit across all three packages) exits 0.
        - Auditor can run a real-corpus smoke: call session.getRaw with the id of a known session
          and verify content is the raw markdown string.
      </success_criteria>
      <context_files>
        packages/server/src/router.ts
        packages/server/src/session-list.ts
        packages/shared/src/schemas.ts
        packages/server/src/env.ts
      </context_files>
      <dependencies>NONE (parallel with t1)</dependencies>
      <out_of_scope>
        - Do NOT add a content/body/raw field to SessionSchema.
        - Do NOT modify session.list, session.get, session.getStats, or session.saveEdit.
        - Do NOT accept filePath from the client (path-traversal prevention).
        - Do NOT read editedFilePath — always read the original source filePath.
        - Do NOT modify any client files.
        - Do NOT run git commit.
      </out_of_scope>
      <output_expected>
        <tag>completion_packet</tag>
        <must_contain>
          <item>session.getRaw procedure declaration in router.ts</item>
          <item>SessionRawOutputSchema exported from packages/shared/src/schemas.ts</item>
          <item>NOT_FOUND error branch</item>
          <item>npm run lint exit 0 confirmation</item>
        </must_contain>
        <must_not_contain>
          <item>Git commit or push commands</item>
          <item>Modification of SessionSchema or existing session.* procedures</item>
          <item>Client input accepting filePath directly</item>
        </must_not_contain>
        <success_signal>completion_packet returned; npm run lint clean; auditor real-corpus smoke passes</success_signal>
      </output_expected>
    </task_packet>

    <!-- ================================================================
         WAVE 1 — t3 Nav + Routing Scaffold — depends t1 + t2
         ================================================================ -->

    <task_packet>
      <task_id>prog-studio-sessions-2026-05-s2-list-edit-t3-nav-scaffold</task_id>
      <assigned_to>frontend-engineer</assigned_to>
      <priority>HIGH</priority>
      <description>
        Implement the Sessions nav registration and routing scaffold. This packet creates the
        infrastructure that all subsequent FE packets build on. It does NOT implement list content
        or detail tabs — those are t4 and t5/t6.

        CHANGES REQUIRED (state-machine modification — all call sites must be updated together):

        1. packages/client/src/store/ui-store.ts
           - Add 'sessions' to the AppMode union:
             export type AppMode = 'browse' | 'compose' | 'edit' | 'export' | 'sessions';
           - No other changes to ui-store.ts.

        2. packages/client/src/constants/navigation.ts
           - Add the Sessions NAV_ITEM:
             { mode: 'sessions', label: 'Sessions', dotColor: 'var(--ms)' }
             (Use --ms if it exists in globals.css; if not, use --mt as the fallback Mako Teal token.
             Check globals.css for available tokens — do NOT hardcode a hex value.)
           - Append to NAV_ITEMS array after the Export entry.

        3. NEW file: packages/client/src/constants/sessions.ts
           - Export the tab definition array for the Sessions mode:
             export interface SessionTabDef {
               id: string;
               label: string;
               placeholder?: boolean;
             }
             export const SESSION_TABS: SessionTabDef[] = [
               { id: 'overview', label: 'Overview' },
               { id: 'table',    label: 'Table' },
               { id: 'editor',   label: 'Editor' },
               { id: 'analyze',  label: 'Analyze', placeholder: true },
             ];
           - This file is the single source of truth for the tab list. S3 only needs to flip
             placeholder: true → false on the analyze entry and supply a component. Do NOT scatter
             tab definitions elsewhere.

        4. packages/client/src/pages/sessions/ (new directory)
           - Create stub placeholder files for each page (to unblock t4 / t5 / t6):
               SessionListPage.tsx   — exports default function SessionListPage() { return <div data-testid="sessions-list-page">Sessions List (stub)</div>; }
               SessionDetailPage.tsx — exports default function SessionDetailPage() { return <div data-testid="sessions-detail-page">Session Detail (stub)</div>; }
           - These stubs will be fully replaced by t4 and t5.

        5. Wire the Sessions mode into the ModeContent routing component
           (packages/client/src/components/ModeContent.tsx or equivalent root routing switch):
           - Add case 'sessions': render <SessionListPage /> (import from pages/sessions/SessionListPage).
           - Leave all existing cases (browse, compose, edit, export) byte-identical.
           - The detail-page routing (list → detail on row click) will be added by t4; do not implement it here.

        NOTE: The Playwright e2e spec for this packet is NOT yet authored here — the auditor will verify
        via the t6 spec (tests/e2e/prog-studio-sessions-2026-05-s2.spec.ts) which covers the full
        smoke including nav registration. If the auditor requires a nav-only assertion during this
        packet's audit, they may add one to that spec file.

        Conventions to enforce:
        - Store file: ui-store.ts (already exists; only add 'sessions' to AppMode).
        - No shadcn tabs/tooltip/toast primitives.
        - Token references only via CSS custom properties.
        - All new .tsx files fully typed; no `any`.
      </description>
      <success_criteria>
        - AppMode in ui-store.ts includes 'sessions' (SC1).
        - NAV_ITEMS in navigation.ts includes { mode: 'sessions', label: 'Sessions', dotColor: 'var(--mt)' or valid --ms token } (SC1).
        - constants/sessions.ts exists and exports SESSION_TABS with exactly 4 entries; analyze entry has placeholder: true (SC8).
        - pages/sessions/SessionListPage.tsx stub exists with data-testid="sessions-list-page".
        - pages/sessions/SessionDetailPage.tsx stub exists with data-testid="sessions-detail-page".
        - ModeContent (or equivalent root switch) renders SessionListPage when mode === 'sessions'.
        - Existing modes (browse, compose, edit, export) render identically — smoke verified by tsc + human step 4.5.
        - npm run lint clean (SC9).
        - No raw hex values in new files (cross-sprint invariant 4).
      </success_criteria>
      <context_files>
        packages/client/src/store/ui-store.ts
        packages/client/src/constants/navigation.ts
        packages/client/src/globals.css
        .claude/agents/tasks/outputs/prog-studio-sessions-2026-05-s2-list-edit-t1-ui-design-*.md  (design spec from t1)
      </context_files>
      <dependencies>t1-ui-design (for token choices and nav placement), t2-be-raw (tRPC contract finalized before FE starts)</dependencies>
      <out_of_scope>
        - Do NOT implement list content or data fetching (t4).
        - Do NOT implement detail tabs (t5).
        - Do NOT implement the editor or save flow (t6).
        - Do NOT add vitest or Playwright tests in this packet.
        - Do NOT touch Browse/Compose/Edit/Export page files.
        - Do NOT add Shadcn tabs/tooltip/toast primitives.
      </out_of_scope>
      <estimated_new_lines>~60 (ui-store.ts: 1 line; navigation.ts: 1 line; sessions.ts: ~20 lines; two stubs: ~10 lines each; ModeContent wiring: ~5 lines)</estimated_new_lines>
      <output_expected>
        <tag>ui_packet</tag>
        <must_contain>
          <item>AppMode union with 'sessions' added (ui-store.ts diff)</item>
          <item>NAV_ITEMS with sessions entry (navigation.ts diff)</item>
          <item>constants/sessions.ts with SESSION_TABS including analyze placeholder:true</item>
          <item>pages/sessions/ directory with two stub files</item>
          <item>ModeContent wiring diff</item>
          <item>npm run lint exit 0</item>
        </must_contain>
        <must_not_contain>
          <item>Raw hex values</item>
          <item>Data fetching hooks or trpc calls</item>
          <item>Shadcn tabs/tooltip/toast imports</item>
        </must_not_contain>
        <success_signal>npm run lint clean; sessions mode appears in nav; clicking Sessions routes to stub page (verified visually in step 4.5)</success_signal>
      </output_expected>
    </task_packet>

    <!-- ================================================================
         WAVE 2 — t4 List Page + Data Hook — depends t3
         ================================================================ -->

    <task_packet>
      <task_id>prog-studio-sessions-2026-05-s2-list-edit-t4-list-page</task_id>
      <assigned_to>frontend-engineer</assigned_to>
      <priority>HIGH</priority>
      <description>
        Implement the Sessions list page, data hooks, and session Zustand store. Replace the t3 stub
        SessionListPage.tsx with the full implementation. This packet owns:

        1. NEW file: packages/client/src/store/session-store.ts  (kebab-case per convention)
           Zustand store for the Sessions mode. Export useSessionStore. State shape:
             sessions: Session[]               — list from session.list
             selectedSessionId: string | null  — id of selected session (drives detail page)
             activeTab: string                 — current tab id ('overview' | 'table' | 'editor')
             editBuffer: string                — textarea content for the Editor tab
             originalContent: string           — original source markdown (from session.getRaw); used for revert
             lastSaveResult: { filePath: string } | null   — populated on successful save
             lastSaveError: string | null      — populated on failed save
             setSelectedSessionId: (id: string | null) => void
             setActiveTab: (tab: string) => void
             setEditBuffer: (content: string) => void
             setOriginalContent: (content: string) => void
             setLastSaveResult: (result: { filePath: string } | null) => void
             setLastSaveError: (error: string | null) => void
           Import Session type via: import type { Session } from '@gander-studio/shared';
           Do NOT redefine Session or any schema client-side (cross-sprint invariant 1).

        2. NEW file: packages/client/src/hooks/useSessions.ts
           Data-fetch hook wrapping session.list. Pattern mirrors useBrowseData.ts:
             - Calls trpc.session.list.useQuery({ limit: 50 })
             - Unwraps the list envelope: response.sessions (list has { sessions, skipped } envelope;
               get/getStats do NOT — asymmetry per S1 WARNING-2)
             - Returns { sessions: Session[], isLoading: boolean, error: unknown }
           Also export: useSessionDetail(id: string) wrapping trpc.session.get.useQuery({ id })
           (get returns bare object — no .sessions unwrap needed).

        3. REPLACE packages/client/src/pages/sessions/SessionListPage.tsx  (stub → full)
           Full implementation:
             - Calls useSessions() to get sessions list.
             - Renders a table or list with one row per session showing:
                 sprint slug (session.sprint), date (session.date), status (session.status ?? '—'),
                 gap_classes summary (session.gap_classes.join(', ') or '—' if empty).
             - Clicking a row: calls useSessionStore().setSelectedSessionId(session.id) and switches
               ModeContent to show SessionDetailPage. (The routing switch in ModeContent must check
               selectedSessionId; t4 adds that logic to ModeContent: when mode === 'sessions' &&
               selectedSessionId !== null → render <SessionDetailPage id={selectedSessionId} />;
               otherwise → render <SessionListPage />.)
             - Loading state: skeleton or "Loading sessions…" indicator with aria-busy="true".
             - Error state: role="alert" with error message.
             - Empty state: aria-live="polite" "No sessions found".
             - data-testid="sessions-list-page" on root div.
           Design: use Mako Teal token palette; mirror BrowsePage sub-component style (PageTitle,
           error/empty state pattern). No raw hex values.

        4. MODIFY packages/client/src/components/ModeContent.tsx (or equivalent):
           - When mode === 'sessions' and selectedSessionId !== null: render <SessionDetailPage id={selectedSessionId} />.
           - When mode === 'sessions' and selectedSessionId === null: render <SessionListPage />.
           - Import useSessionStore from '../store/session-store'.
           - Leave existing mode cases byte-identical.

        Playwright e2e spec path (stub — actual assertions go in t6):
          packages/client/tests/e2e/prog-studio-sessions-2026-05-s2.spec.ts
          Create this file now with a placeholder test that navigates to sessions mode and asserts
          data-testid="sessions-list-page" is visible. Full assertions added by t6.

        Conventions:
        - Imports: import type { Session } from '@gander-studio/shared' — no client schema redefinition.
        - import { trpc } from '../trpc'
        - Envelope asymmetry: session.list → .sessions; session.get → bare (do NOT unwrap .sessions on get).
        - session-store.ts (kebab-case, not sessionStore.ts).
      </description>
      <success_criteria>
        - packages/client/src/store/session-store.ts exists; exports useSessionStore (SC2, SC6 buffer fields).
        - packages/client/src/hooks/useSessions.ts exists; list query correctly unwraps .sessions envelope;
          useSessionDetail wraps session.get (bare, no unwrap) (SC2, SC3).
        - SessionListPage renders one row per session with sprint, date, status, gap_classes (SC2).
        - Loading, empty, and error states present with correct aria roles (SC2).
        - Row click sets selectedSessionId and routes to detail page (SC3).
        - ModeContent routes sessions+selectedSessionId → SessionDetailPage correctly (SC3).
        - packages/client/tests/e2e/prog-studio-sessions-2026-05-s2.spec.ts exists with at least one
          assertion on data-testid="sessions-list-page" (AUDIT_RISK pattern).
        - npm run lint clean (SC9).
        - No raw hex values; Session type imported from @gander-studio/shared, not redefined.
      </success_criteria>
      <context_files>
        packages/client/src/hooks/useBrowseData.ts
        packages/client/src/store/browse-store.ts
        packages/client/src/pages/BrowsePage.tsx
        packages/client/src/pages/sessions/SessionListPage.tsx  (current stub from t3)
        packages/client/src/components/ModeContent.tsx
        packages/client/src/trpc.ts
        packages/shared/src/schemas.ts
        .claude/agents/tasks/outputs/prog-studio-sessions-2026-05-s2-list-edit-t1-ui-design-*.md
      </context_files>
      <dependencies>t3-nav-scaffold</dependencies>
      <out_of_scope>
        - Do NOT implement tab content (Overview/Table/Editor/Analyze) — that is t5 and t6.
        - Do NOT implement the save mutation hook (useSessionSave) — that is t6.
        - Do NOT implement session.getRaw data fetching in this packet — that is t6's EditorTab.
        - Do NOT add Shadcn tabs/tooltip/toast.
        - Do NOT redefine Session or any schema client-side.
        - Do NOT touch Browse/Compose/Edit/Export pages.
      </out_of_scope>
      <estimated_new_lines>~140 (session-store.ts ~40; useSessions.ts ~35; SessionListPage.tsx ~50; ModeContent diff ~10; e2e spec stub ~10). This is above 100 lines — justification: session-store, hooks, and list page are tightly coupled state-machine pieces that share the selectedSessionId routing handshake; splitting the store from the page would require the page packet to duplicate the store interface. The three logical files (store, hook, page) are kept together as one cohesive state-machine unit with a single routing concern.</estimated_new_lines>
      <output_expected>
        <tag>ui_packet</tag>
        <must_contain>
          <item>session-store.ts with editBuffer, originalContent, lastSaveResult, lastSaveError fields</item>
          <item>useSessions.ts with list-envelope unwrap and useSessionDetail</item>
          <item>SessionListPage.tsx full implementation (not stub)</item>
          <item>ModeContent routing diff for sessions+selectedSessionId</item>
          <item>e2e spec file stub at tests/e2e/prog-studio-sessions-2026-05-s2.spec.ts</item>
          <item>npm run lint exit 0</item>
        </must_contain>
        <must_not_contain>
          <item>Client-side redefinition of Session, SessionSchema, or any schema from @gander-studio/shared</item>
          <item>sessionStore.ts (wrong casing)</item>
          <item>Tab implementation code (Overview/Table/Editor/Analyze)</item>
          <item>Raw hex values</item>
        </must_not_contain>
        <success_signal>npm run lint clean; session list visible in browser; row click routes to detail stub; e2e spec file exists</success_signal>
      </output_expected>
    </task_packet>

    <!-- ================================================================
         WAVE 3 — t5 Detail Shell + Overview + Table Tabs — depends t4
         ================================================================ -->

    <task_packet>
      <task_id>prog-studio-sessions-2026-05-s2-list-edit-t5-detail-shell</task_id>
      <assigned_to>frontend-engineer</assigned_to>
      <priority>HIGH</priority>
      <description>
        Implement the SessionDetailPage shell + OverviewTab + TableTab. Replace the t3 stub
        SessionDetailPage.tsx with the full detail shell. The EditorTab and Analyze slot are t6.

        1. REPLACE packages/client/src/pages/sessions/SessionDetailPage.tsx  (stub → full shell)
           Props: { id: string }
           - Calls useSessionDetail(id) (from useSessions.ts, t4) to get the Session object.
           - Reads activeTab from useSessionStore().
           - Renders a tab bar built from role="tablist" with one role="tab" button per SESSION_TABS
             entry (imported from constants/sessions.ts). Tab bar rules:
               * Each button calls useSessionStore().setActiveTab(tab.id) on click.
               * Active tab: aria-selected="true", styled with Mako Teal accent token.
               * Inactive tab: aria-selected="false".
               * analyze tab (placeholder: true): aria-disabled="true", disabled attribute, title="Coming in S3",
                 styled with muted token. Clicking does nothing (pointer-events disabled or handler is no-op).
               * Keyboard: Tab/Arrow keys navigate between tab buttons; Enter/Space activates.
           - Below the tab bar: renders the correct role="tabpanel" based on activeTab:
               'overview' → <OverviewTab session={session} />
               'table'    → <TableTab session={session} />
               'editor'   → <EditorTab session={session} />  (stub for t6 — render a placeholder div with data-testid="editor-tab-stub")
           - Header: sprint slug + date above the tab bar (design from t1 spec).
           - Loading state (session data not yet loaded): skeleton or spinner.
           - Error state: role="alert" with NOT_FOUND or server error message.
           - data-testid="sessions-detail-page" on root div.

        2. NEW file: packages/client/src/pages/sessions/tabs/OverviewTab.tsx
           Props: { session: Session }
           - Displays frontmatter fields:
               sprint, date, status (or '—'), type (or '—'), title (or '—'),
               gap_classes (join(', ') or '—'), source_root, editedFilePath (or 'None').
           - Top-line stat row: agent count (session.agents.length), feedback-loop count
             (sum of session.agents[].feedback_loops), total event count (session.events.length), status.
           - Mako Teal token palette (see globals.css, t1 design spec).
           - data-testid="overview-tab" on root div.

        3. NEW file: packages/client/src/pages/sessions/tabs/TableTab.tsx
           Props: { session: Session }
           - Renders an HTML table (not a Shadcn component) of session.agents (AgentActivity[]).
           - Columns: Agent ID, Spawns, Completes, Feedback Loops, Critique Passes, Critique Blocks,
             Audit Passes, Audit Fails, Wall Clock (ms) (display '—' if undefined).
           - Sortable: each column header is a <button> or <th> with onClick that toggles
             sort direction (asc/desc) on that column. Local sort state (useState).
           - Default sort: Agent ID ascending.
           - Keyboard-navigable: table cells reachable by Tab; sort buttons reachable by keyboard.
           - WCAG AA contrast on all cell/header token pairs.
           - Empty state: "No agent activity recorded" when session.agents.length === 0.
           - data-testid="table-tab" on root div.

        Playwright e2e additions to packages/client/tests/e2e/prog-studio-sessions-2026-05-s2.spec.ts:
        ADD assertions (do not remove the t4 stub):
          - Navigate to sessions mode; click a session row; assert data-testid="sessions-detail-page" visible.
          - Click "Overview" tab; assert data-testid="overview-tab" visible.
          - Click "Table" tab; assert data-testid="table-tab" visible.
          - Assert "Analyze" tab button exists with aria-disabled="true" and title="Coming in S3" (SC8).
          - Tab switching does NOT remount the page (verify session.get called only once — check by
            clicking Overview → Table → Overview and confirming no additional network request for session.get).

        Conventions:
        - Import Session, AgentActivity types from @gander-studio/shared.
        - No raw hex values.
        - No Shadcn tabs/tooltip/toast.
        - All components fully typed.
        - Tab bar built from role="tablist"/"tab"/"tabpanel".
      </description>
      <success_criteria>
        - SessionDetailPage renders tab bar with Overview / Table / Editor (stub) / Analyze (disabled) (SC3, SC8).
        - Tab switching renders correct panel without remounting data fetch (SC3).
        - Analyze tab has aria-disabled="true" and title="Coming in S3" (SC8).
        - OverviewTab renders all frontmatter fields and top-line stat row (SC4).
        - TableTab renders sortable table of agent activity; all 9 columns present; sort toggles on header click;
          keyboard-navigable; WCAG AA confirmed per design spec (SC5).
        - Loading and error states present on SessionDetailPage.
        - e2e spec updated with tab-navigation and Analyze-slot assertions (AUDIT_RISK pattern).
        - npm run lint clean (SC9).
        - No raw hex values; types imported from @gander-studio/shared.
      </success_criteria>
      <context_files>
        packages/client/src/pages/sessions/SessionDetailPage.tsx  (stub from t3)
        packages/client/src/constants/sessions.ts  (SESSION_TABS from t3)
        packages/client/src/store/session-store.ts  (from t4)
        packages/client/src/hooks/useSessions.ts  (useSessionDetail from t4)
        packages/shared/src/schemas.ts
        packages/client/src/globals.css
        packages/client/tests/e2e/prog-studio-sessions-2026-05-s2.spec.ts  (stub from t4)
        .claude/agents/tasks/outputs/prog-studio-sessions-2026-05-s2-list-edit-t1-ui-design-*.md
      </context_files>
      <dependencies>t4-list-page</dependencies>
      <out_of_scope>
        - Do NOT implement EditorTab content (t6). Render a placeholder div with data-testid="editor-tab-stub".
        - Do NOT implement the save mutation or useSessionSave hook (t6).
        - Do NOT implement session.getRaw fetching (t6).
        - Do NOT implement the Analyze tab component (S3).
        - Do NOT add Shadcn tabs/tooltip/toast.
        - Do NOT touch Browse/Compose/Edit/Export pages.
        - Do NOT modify ui-store.ts, navigation.ts, session-store.ts store shape.
      </out_of_scope>
      <estimated_new_lines>~120 (SessionDetailPage ~50; OverviewTab ~35; TableTab ~45; e2e additions ~10). Above 100 — justification: detail shell + overview + table are tightly coupled through the same Session prop and SESSION_TABS constant; splitting detail-shell from its two non-editor tab implementations would produce a broken shell that cannot render any real tab, requiring a second FE round before the auditor could verify SC3/SC4/SC5. Kept together as one cohesive rendering unit for audit viability.</estimated_new_lines>
      <output_expected>
        <tag>ui_packet</tag>
        <must_contain>
          <item>SessionDetailPage.tsx with tab bar and routing to panels</item>
          <item>OverviewTab.tsx with all frontmatter fields and stat row</item>
          <item>TableTab.tsx with sortable columns and keyboard nav</item>
          <item>e2e assertions for tab switching and Analyze slot</item>
          <item>npm run lint exit 0</item>
        </must_contain>
        <must_not_contain>
          <item>EditorTab implementation (only stub allowed)</item>
          <item>session.getRaw usage (t6)</item>
          <item>Shadcn tabs primitive import</item>
          <item>Raw hex values</item>
        </must_not_contain>
        <success_signal>npm run lint clean; detail page with Overview + Table tabs navigable in browser; Analyze tab disabled; e2e assertions pass</success_signal>
      </output_expected>
    </task_packet>

    <!-- ================================================================
         WAVE 4 — t6 Editor + Save Flow + Analyze Slot + Smoke — depends t5
         ================================================================ -->

    <task_packet>
      <task_id>prog-studio-sessions-2026-05-s2-list-edit-t6-editor-save</task_id>
      <assigned_to>frontend-engineer</assigned_to>
      <priority>HIGH</priority>
      <description>
        Implement the EditorTab with save flow, the reserved Analyze tab slot component, the
        useSessionSave mutation hook, the useSessionRaw hook for pre-fill, and the full Playwright
        e2e smoke. Replace the t5 editor stub.

        1. NEW file: packages/client/src/hooks/useSessionSave.ts
           Wraps trpc.session.saveEdit.useMutation(). On success: call
           useSessionStore().setLastSaveResult({ filePath: result.filePath }) and
           useSessionStore().setLastSaveError(null). On error: call
           useSessionStore().setLastSaveError(errorMessage) and do NOT clear editBuffer.
           Return { mutate, isLoading } (or useMutation return shape per tRPC 11).

        2. NEW file or inline export: packages/client/src/hooks/useSessionRaw.ts
           Wraps trpc.session.getRaw.useQuery({ id }, { enabled: !!id }).
           On data: calls useSessionStore().setOriginalContent(data.content) and
           (if editBuffer is empty) useSessionStore().setEditBuffer(data.content).
           Return { isLoading, error }.

        3. REPLACE packages/client/src/pages/sessions/tabs/EditorTab.tsx
           (replace the t5 stub with full implementation)
           Props: { session: Session }
           - Calls useSessionRaw({ id: session.id }) on mount (via the hook above) to pre-fill.
           - Reads editBuffer, originalContent, lastSaveResult, lastSaveError from useSessionStore().
           - Renders:
               * Read-only "Save target:" label: the SESSIONS_EDITS_DIR-relative path is NOT known
                 to the client at static time; surface it from the save result on success. Before any
                 save, show "Save target: {session-edits-dir}/{session.id}.md" as a static affordance
                 using session.id (no FS access). After a successful save, show the actual filePath
                 returned by session.saveEdit.
               * Shadcn Textarea (packages/client/src/components/ui/textarea.tsx — this primitive
                 DOES exist) bound to editBuffer; onChange → setEditBuffer.
               * "Save edit" button (primary): disabled when editBuffer === originalContent (no changes)
                 OR when mutation is in-flight. Calls useSessionSave().mutate({ id: session.id,
                 content: editBuffer }).
               * "Revert to original" button (secondary): calls setEditBuffer(originalContent).
                 Disabled when editBuffer === originalContent.
               * Inline success state: when lastSaveResult is set, show "Saved to: {lastSaveResult.filePath}"
                 in a styled confirmation div (no toast primitive). Clears on next edit (setLastSaveResult(null)
                 in onChange handler).
               * Inline error state: when lastSaveError is set, role="alert" showing error message.
                 Buffer NOT cleared on error (SC7 requirement).
           - data-testid="editor-tab" on root div.
           - data-testid="save-edit-button" on the Save edit button.
           - data-testid="revert-button" on the Revert to original button.

        4. Verify the Analyze slot in SessionDetailPage (already implemented in t5):
           Confirm SESSION_TABS has { id: 'analyze', label: 'Analyze', placeholder: true } and the
           tab bar renders it disabled with title="Coming in S3". If t5 left a gap, fix it here.
           (This is the named VERBATIM_DELIVERABLE check — the slot must be verifiable in this packet.)

        5. COMPLETE the Playwright e2e spec:
           File: packages/client/tests/e2e/prog-studio-sessions-2026-05-s2.spec.ts
           ADD (do not remove t4/t5 assertions):
             Test: "Editor tab pre-fills with original source markdown"
               - Navigate to sessions → detail → Editor tab.
               - Assert Textarea has non-empty value (the original markdown).
             Test: "Save edit flow — success"
               - Navigate to sessions → detail → Editor tab.
               - Modify textarea content (append a character).
               - Click data-testid="save-edit-button".
               - Assert "Saved to:" confirmation visible with a path string.
             Test: "Save edit flow — revert to original"
               - Navigate to sessions → detail → Editor tab.
               - Modify textarea.
               - Click data-testid="revert-button".
               - Assert textarea value equals the original content (pre-fill).
             Test: "Analyze tab is disabled"
               - Assert button with label "Analyze" has aria-disabled="true" and title="Coming in S3".
             Test: "Existing pages load (smoke regression)"
               - Navigate to Browse mode; assert data-testid="browse-page" visible.
               - Navigate to Compose mode; assert compose page visible.
               - Navigate to Edit mode; assert edit page visible.
               - Navigate to Export mode; assert export page visible.
           (Precise selectors should follow the established pattern in existing e2e specs.)

        6. Final lint check: npm run lint must exit 0 across all three packages (SC9).

        Conventions:
        - Inline success/error confirmation (no toast primitive).
        - Textarea: use Shadcn Textarea (it exists) — import from '../../../components/ui/textarea'.
        - Import Session type from @gander-studio/shared; never redefine.
        - No raw hex values.
        - No Shadcn tabs/tooltip/toast.
      </description>
      <success_criteria>
        - useSessionRaw hook pre-fills editBuffer with original source markdown from session.getRaw (SC6).
        - EditorTab Textarea bound to editBuffer from session-store (SC6).
        - "Save edit" calls session.saveEdit; success shows inline "Saved to: {absolutePath}" (SC6, SC7).
        - Failed save: role="alert" with error message; editBuffer NOT cleared (SC7).
        - "Revert to original" restores originalContent into editBuffer (SC6).
        - Analyze tab slot: SESSION_TABS has { id: 'analyze', placeholder: true }; rendered as disabled
          tab with title="Coming in S3" in SessionDetailPage (SC8).
        - Playwright e2e spec has assertions covering: list loads, tab switching, Editor pre-fill, save
          success, revert, Analyze disabled, smoke regression of existing pages (SC10, AUDIT_RISK).
        - npm run lint clean across all three packages (SC9).
        - Manual smoke step 4.5: list loads, tabs switch, save round-trips, no console errors (SC10).
        - No raw hex values; no client-side schema redefinitions; no Shadcn tabs/tooltip/toast.
      </success_criteria>
      <context_files>
        packages/client/src/pages/sessions/tabs/EditorTab.tsx  (t5 stub to replace)
        packages/client/src/store/session-store.ts  (t4)
        packages/client/src/hooks/useSessions.ts  (t4)
        packages/client/src/components/ui/textarea.tsx
        packages/client/src/trpc.ts
        packages/shared/src/schemas.ts
        packages/client/tests/e2e/prog-studio-sessions-2026-05-s2.spec.ts  (t4/t5 assertions to preserve)
        packages/client/src/constants/sessions.ts  (t3 SESSION_TABS)
        .claude/agents/tasks/outputs/prog-studio-sessions-2026-05-s2-list-edit-t1-ui-design-*.md
      </context_files>
      <dependencies>t5-detail-shell</dependencies>
      <out_of_scope>
        - Do NOT implement markdown preview (out of scope for S2).
        - Do NOT implement diff view.
        - Do NOT implement analysis visualization (S3).
        - Do NOT add Shadcn tabs/tooltip/toast primitives.
        - Do NOT redefine Session or any shared schema.
        - Do NOT modify Browse/Compose/Edit/Export pages.
        - Do NOT run git commit.
      </out_of_scope>
      <estimated_new_lines>~110 (useSessionSave.ts ~20; useSessionRaw.ts ~20; EditorTab.tsx ~50; e2e additions ~30). Above 100 — justification: the three files (save hook, raw hook, editor component) implement a single user-visible flow (pre-fill → edit → save/revert) that cannot be split without leaving an unauditable partial state: a save hook without the editor is untestable by the auditor, and an editor without the save hook cannot satisfy SC6/SC7. The e2e additions are small incremental assertions on the same spec file. All are co-owned by this single atomic concern.</estimated_new_lines>
      <output_expected>
        <tag>ui_packet</tag>
        <must_contain>
          <item>useSessionRaw hook fetching session.getRaw and wiring originalContent + editBuffer</item>
          <item>useSessionSave hook wrapping session.saveEdit mutation</item>
          <item>EditorTab.tsx full implementation with Textarea, Save, Revert, inline confirmation/error</item>
          <item>Analyze slot confirmed disabled with title="Coming in S3"</item>
          <item>e2e spec with Editor pre-fill, save flow, revert, Analyze disabled, smoke regression assertions</item>
          <item>npm run lint exit 0 across all three packages</item>
        </must_contain>
        <must_not_contain>
          <item>Shadcn toast or tooltip primitive import</item>
          <item>Markdown preview implementation</item>
          <item>Raw hex values</item>
          <item>Client-side schema redefinitions</item>
          <item>git commit/push commands</item>
        </must_not_contain>
        <success_signal>npm run lint clean; Editor pre-fills on open; save round-trips with absolute path shown; revert restores original; Analyze tab disabled; all existing pages load; Playwright e2e spec passes</success_signal>
      </output_expected>
    </task_packet>

  </task_packets>

  <dependency_order>
    Wave 0 (parallel):
      t1-ui-design   — no dependencies
      t2-be-raw      — no dependencies

    Wave 1:
      t3-nav-scaffold — DEPENDS ON t1-ui-design, t2-be-raw

    Wave 2:
      t4-list-page    — DEPENDS ON t3-nav-scaffold

    Wave 3:
      t5-detail-shell — DEPENDS ON t4-list-page

    Wave 4:
      t6-editor-save  — DEPENDS ON t5-detail-shell

    Audit pipeline (foreground) after each implementing packet:
      audit(t2-be-raw) → commit → audit(t3) → commit → audit(t4) → commit →
      audit(t5) → commit → audit(t6) → commit

    Step 4.5 human verification: REQUIRED after t6 audit passes (SC10 cannot be satisfied
    without a human walking through the UI in a browser).
  </dependency_order>

  <routing_notes>
    <pm_preflight_acknowledgement pattern="OVERSCOPED">
      Each task packet is bounded to ≤ 3 tightly-coupled files of logic per domain. Where packets
      exceed 100 estimated lines (t4, t5, t6), explicit justification is documented inline — the
      files are co-owned parts of a single atomic concern and cannot produce an auditable artifact
      when split. t5 is the worst case (~120 lines); a further split into detail-shell-only vs.
      overview+table would produce a shell with no real tab, which the auditor cannot verify against
      SC3/SC4/SC5.
    </pm_preflight_acknowledgement>

    <pm_preflight_acknowledgement pattern="SCOPE_DRIFT">
      Every SC (SC1–SC10) is mapped to at least one packet as addressed or explicitly out-of-scope.
      SC8 (Analyze reserved slot) is addressed in t3 (constants/sessions.ts SESSION_TABS), t5
      (tab bar renders it disabled), and verified in t6 (e2e assertion + SC8 success criterion).
      SC7 (buffer preserved on failure) is addressed in t6 (explicit success criterion: editBuffer
      NOT cleared on error). No SC is silently dropped.
    </pm_preflight_acknowledgement>

    <pm_preflight_acknowledgement pattern="VERBATIM_DELIVERABLE">
      The two named deliverables are explicitly encoded:
      (1) { id: "analyze", label: "Analyze", placeholder: true } — appears verbatim in t3
          constants/sessions.ts spec and in t1/t5/t6 success criteria by name.
      (2) "Save target" destination-path UI affordance — described verbatim in t6 EditorTab spec
          (read-only "Save target:" label surfacing SESSIONS_EDITS_DIR destination).
    </pm_preflight_acknowledgement>

    <pm_preflight_acknowledgement pattern="AUDIT_RISK">
      Every interactive surface has a named Playwright spec:
      tests/e2e/prog-studio-sessions-2026-05-s2.spec.ts
      t4 creates the spec stub; t5 adds tab-switching + Analyze slot assertions; t6 adds Editor
      pre-fill, save flow, revert, and smoke regression of existing pages. The auditor has DOM
      assertions for every user-visible surface, not sound/proxy signals.
    </pm_preflight_acknowledgement>

    <pm_preflight_acknowledgement pattern="ASSUMPTION">
      No token hex values are excerpted inline in any packet. All token references cite CSS custom
      property names (--mt, --ms, --bd, etc.) and direct agents to check globals.css. The S1
      contract is cited from the ORC brief's s1_published_contract block, not re-derived. The
      dashboard-patterns.md reference is cited by path in the t1 packet, not excerpted inline.
    </pm_preflight_acknowledgement>

    <pm_preflight_acknowledgement pattern="DRY">
      Session types imported via z.infer from @gander-studio/shared in all FE packets — never
      redefined client-side (cross-sprint invariant 1). Hook pattern mirrors useBrowseData.ts
      exactly (trpc query → return typed data). Store pattern mirrors browse-store.ts. Existing
      trpc client imported from '../trpc' — no new client instantiation.
    </pm_preflight_acknowledgement>

    DESIGN.md status: ABSENT at packages/client/ — FE and UI Designer operate on inferred tokens
    (globals.css CSS custom properties). UI Designer must set design_system_source: INFERRED.

    Store file naming: session-store.ts (kebab-case per convention). Any agent output returning
    "sessionStore.ts" is a naming violation — return to agent for correction before routing to auditor.

    Pages structure: deliberate deviation — pages/sessions/ nested subdir (not flat). Justified by
    multi-surface mode (1 list + 1 detail + 4 tab components). This is documented in t1 and t3.

    List envelope asymmetry: session.list → .sessions unwrap required; session.get/getStats → bare.
    Auditor must verify useSessions.ts unwraps only the list result.

    AppMode state machine: t3 edits BOTH ui-store.ts (AppMode union) AND navigation.ts (NAV_ITEMS).
    Both are named in t3's description and success criteria. The ModeContent routing switch is also
    named. All three call sites that read/write AppMode are enumerated.

    Prior sprint prior_approved_tasks: t5 modifies the e2e spec created by t4; t6 modifies the same
    spec. The auditor for t5 and t6 should not flag the t4/t5 assertions as out-of-scope — they are
    prior-wave additions to the same file.

    Shared-file append: The e2e spec is written by t4 (stub), extended by t5 (tab assertions),
    extended by t6 (editor + smoke assertions). Serialization is enforced by the dependency chain
    (t4 → t5 → t6). Each packet reads the current spec before appending.

    Foreground dispatch required (FE work — human step 4.5 verification mandatory after t6 audit).

    Recurring patterns from S1 post-mortem §6:
    - "Plan named fixtures without on-disk verification": no fixtures named in S2 packets. N/A.
    - "BE ran git commit inline": t2 packet explicitly prohibits git commit and directs BE to return
      completion_packet only.
  </routing_notes>

  <risk_flags>
    <critical_seam_finding>
      The S1 SessionSchema has no raw body field and session.get returns a parsed object only. SC6
      requires Editor pre-fill and revert-to-original. Resolution chosen: ADD session.getRaw tRPC
      procedure (t2-be-raw, Wave 0, BLOCKER priority) that accepts { id: string } and returns
      { content: string } by reading session.filePath (always the original source). The client
      consumes this via useSessionRaw hook (t6). Alternative considered (defer pre-fill to S3) was
      rejected because SC6 as written explicitly requires pre-fill. The BE packet is Wave 0 (parallel
      with UI design) so it does not delay the FE waves.
    </critical_seam_finding>

    <risk id="DESIGN_MD_ABSENT">
      No DESIGN.md found at packages/client/. FE and UI Designer operate on inferred tokens from
      globals.css. Recommend generating DESIGN.md before the next sprint. For this sprint, UI
      Designer must set design_system_source: INFERRED and flag the absence in notes.
    </risk>

    <risk id="SESSIONS_EDITS_DIR_CLIENT_UNKNOWN">
      The client has no way to know the absolute SESSIONS_EDITS_DIR path before a save completes.
      The t6 EditorTab spec surfaces a static "Save target: {session.id}.md" affordance before
      save, then shows the actual returned filePath after a successful save. The auditor should
      verify the post-save path display uses the server-returned path, not a client-constructed one.
    </risk>

    <risk id="NO_TABS_PRIMITIVE">
      No Shadcn tabs/tooltip/toast primitives exist. All three FE packets are directed to build
      from role="tablist"/"tab"/"tabpanel" + conditional render. The auditor must verify no
      @radix-ui/react-tabs or sonner import is added to package.json.
    </risk>

    <risk id="LIST_ENVELOPE_ASYMMETRY">
      session.list returns { sessions, skipped } (envelope); session.get/getStats return bare objects.
      This asymmetry (S1 WARNING-2) is a common source of runtime bugs. Auditor must verify that
      useSessions.ts unwraps .sessions on the list query and does NOT attempt .sessions on get/getStats.
    </risk>

    <risk id="APPMODE_STATE_MACHINE">
      Adding 'sessions' to AppMode requires synchronized edits to ui-store.ts AND navigation.ts AND
      ModeContent. t3 enumerates all three call sites. Auditor must verify all three are updated in
      the t3 packet — a partial update (e.g., AppMode updated but ModeContent not wired) would cause
      a TypeScript error caught by lint.
    </risk>
  </risk_flags>

</task_decomposition>

---

## Verbatim Deliverable Audit

<verbatim_deliverable_audit>
  <!-- Human request noun/verb phrases mapped to task packets -->

  <phrase text="top-level 'Sessions' mode">
    <addressed task="t3-nav-scaffold"/>
  </phrase>

  <phrase text="list page">
    <addressed task="t4-list-page"/>
  </phrase>

  <phrase text="detail page with tabs">
    <addressed task="t5-detail-shell"/>
  </phrase>

  <phrase text="Overview tab">
    <addressed task="t5-detail-shell"/>
  </phrase>

  <phrase text="Table tab">
    <addressed task="t5-detail-shell"/>
  </phrase>

  <phrase text="Editor tab">
    <addressed task="t6-editor-save"/>
  </phrase>

  <phrase text="reserved disabled 'Analyze' slot for S3">
    <addressed task="t3-nav-scaffold"/>
    <addressed task="t5-detail-shell"/>
    <addressed task="t6-editor-save"/>
  </phrase>

  <phrase text="save-to-new-folder markdown editor">
    <addressed task="t6-editor-save"/>
  </phrase>

  <phrase text="purely additive — existing Browse/Compose/Edit/Export pages unchanged">
    <addressed task="t3-nav-scaffold"/>
    <addressed task="t4-list-page"/>
    <addressed task="t5-detail-shell"/>
    <addressed task="t6-editor-save"/>
  </phrase>

  <phrase text="SC1 Nav mode registered">
    <addressed task="t3-nav-scaffold"/>
  </phrase>

  <phrase text="SC2 List loads (session.list; sprint slug, date, status, gap_classes; empty + error)">
    <addressed task="t4-list-page"/>
  </phrase>

  <phrase text="SC3 Detail loads (session.get; tab nav without remounting)">
    <addressed task="t5-detail-shell"/>
  </phrase>

  <phrase text="SC4 Overview tab (frontmatter + top-line summary; Mako Teal tokens)">
    <addressed task="t5-detail-shell"/>
  </phrase>

  <phrase text="SC5 Table tab (sortable HTML table; keyboard-navigable; WCAG AA)">
    <addressed task="t5-detail-shell"/>
  </phrase>

  <phrase text="SC6 Editor tab (Textarea; save; pre-fill; revert-to-original)">
    <addressed task="t6-editor-save"/>
  </phrase>

  <phrase text="SC7 Save flow (success toast/confirmation with path; failure surfaces error; buffer not lost)">
    <addressed task="t6-editor-save"/>
  </phrase>

  <phrase text="SC8 Analyze slot reserved (disabled; tooltip 'Coming in S3'; S3 flips placeholder)">
    <addressed task="t3-nav-scaffold"/>
    <addressed task="t5-detail-shell"/>
    <addressed task="t6-editor-save"/>
  </phrase>

  <phrase text="SC9 Lint + type clean">
    <addressed task="t3-nav-scaffold"/>
    <addressed task="t4-list-page"/>
    <addressed task="t5-detail-shell"/>
    <addressed task="t6-editor-save"/>
  </phrase>

  <phrase text="SC10 Manual smoke (Step 4.5)">
    <addressed task="t6-editor-save"/>
  </phrase>

  <phrase text="session.getRaw precursor BE procedure (critical seam finding)">
    <addressed task="t2-be-raw"/>
  </phrase>

  <phrase text="UI design spec first">
    <addressed task="t1-ui-design"/>
  </phrase>

  <phrase text="session-store.ts (kebab-case; not sessionStore.ts)">
    <addressed task="t4-list-page"/>
  </phrase>

  <phrase text="constants/sessions.ts (new home for tab definitions)">
    <addressed task="t3-nav-scaffold"/>
  </phrase>

  <phrase text="useSessions.ts data hook">
    <addressed task="t4-list-page"/>
  </phrase>

  <phrase text="useSessionSave.ts mutation hook">
    <addressed task="t6-editor-save"/>
  </phrase>

  <phrase text="pages/sessions/ nested subdir (deliberate convention deviation)">
    <addressed task="t3-nav-scaffold"/>
  </phrase>

  <phrase text="Playwright e2e spec at tests/e2e/prog-studio-sessions-2026-05-s2.spec.ts">
    <addressed task="t4-list-page"/>
    <addressed task="t5-detail-shell"/>
    <addressed task="t6-editor-save"/>
  </phrase>

  <phrase text="OUT OF SCOPE: analysis viz/timeline/charts/picker (S3)">
    <out_of_scope reason="Explicitly listed in sprint out-of-scope; flagged in each FE packet's out_of_scope block"/>
  </phrase>

  <phrase text="OUT OF SCOPE: markdown preview rendering">
    <out_of_scope reason="Explicitly listed in sprint out-of-scope"/>
  </phrase>

  <phrase text="OUT OF SCOPE: diff view">
    <out_of_scope reason="Explicitly listed in sprint out-of-scope"/>
  </phrase>

  <phrase text="OUT OF SCOPE: proximity-edge regression (carry-forward)">
    <out_of_scope reason="Carry-forward from prior sprints; not addressed in S2"/>
  </phrase>
</verbatim_deliverable_audit>

---

## Expectation Manifest

<expectation_manifest>
  <sprint_id>prog-studio-sessions-2026-05-s2-list-edit</sprint_id>
  <generated>2026-05-20T19:15:00Z</generated>
  <assignments>

    <assignment>
      <task_id>prog-studio-sessions-2026-05-s2-list-edit-t1-ui-design</task_id>
      <agent>UI#1</agent>
      <expected_tag>design_spec</expected_tag>
      <expected_file>.claude/agents/tasks/outputs/prog-studio-sessions-2026-05-s2-list-edit-t1-ui-design-UI-*.md</expected_file>
      <blocks>t3-nav-scaffold</blocks>
      <receipt_check>
        <item>All three surfaces (List, Detail shell, 4 tab interiors) present</item>
        <item>contrast_pairs block present with WCAG AA verification</item>
        <item>No raw hex values</item>
        <item>Analyze slot declaration { id: "analyze", label: "Analyze", placeholder: true } verbatim</item>
        <item>design_system_source: INFERRED declared</item>
        <item>No Shadcn tabs/tooltip/toast cited</item>
        <item>dashboard-patterns.md cited by name</item>
        <item>Session store file named session-store.ts (not sessionStore.ts)</item>
      </receipt_check>
    </assignment>

    <assignment>
      <task_id>prog-studio-sessions-2026-05-s2-list-edit-t2-be-raw</task_id>
      <agent>BE#1</agent>
      <expected_tag>completion_packet</expected_tag>
      <expected_file>.claude/agents/tasks/outputs/prog-studio-sessions-2026-05-s2-list-edit-t2-be-raw-BE-*.md</expected_file>
      <blocks>t3-nav-scaffold</blocks>
      <receipt_check>
        <item>session.getRaw procedure present in router.ts</item>
        <item>SessionRawOutputSchema exported from packages/shared/src/schemas.ts</item>
        <item>Reads filePath (original source), not editedFilePath</item>
        <item>Client input is id only (no filePath)</item>
        <item>npm run lint exit 0 confirmed</item>
        <item>No git commit performed</item>
      </receipt_check>
    </assignment>

    <assignment>
      <task_id>prog-studio-sessions-2026-05-s2-list-edit-t3-nav-scaffold</task_id>
      <agent>FE#1</agent>
      <expected_tag>ui_packet</expected_tag>
      <expected_file>.claude/agents/tasks/outputs/prog-studio-sessions-2026-05-s2-list-edit-t3-nav-scaffold-FE-*.md</expected_file>
      <blocks>t4-list-page</blocks>
      <receipt_check>
        <item>AppMode union in ui-store.ts includes 'sessions'</item>
        <item>NAV_ITEMS in navigation.ts includes sessions entry with CSS custom property dotColor</item>
        <item>constants/sessions.ts exists with SESSION_TABS (analyze has placeholder: true)</item>
        <item>pages/sessions/ directory with two stubs (data-testid present)</item>
        <item>ModeContent wires sessions mode to SessionListPage</item>
        <item>npm run lint exit 0</item>
        <item>No raw hex values</item>
      </receipt_check>
    </assignment>

    <assignment>
      <task_id>prog-studio-sessions-2026-05-s2-list-edit-t4-list-page</task_id>
      <agent>FE#2</agent>
      <expected_tag>ui_packet</expected_tag>
      <expected_file>.claude/agents/tasks/outputs/prog-studio-sessions-2026-05-s2-list-edit-t4-list-page-FE-*.md</expected_file>
      <blocks>t5-detail-shell</blocks>
      <receipt_check>
        <item>session-store.ts (kebab-case) present with editBuffer, originalContent, lastSaveResult, lastSaveError</item>
        <item>useSessions.ts present; list query unwraps .sessions; useSessionDetail wraps bare get</item>
        <item>SessionListPage renders sprint, date, status, gap_classes per row</item>
        <item>Loading/empty/error states with correct aria roles</item>
        <item>Row click sets selectedSessionId and routes to detail</item>
        <item>ModeContent routes sessions+selectedSessionId to SessionDetailPage</item>
        <item>e2e spec stub exists at tests/e2e/prog-studio-sessions-2026-05-s2.spec.ts</item>
        <item>npm run lint exit 0</item>
        <item>No sessionStore.ts (wrong casing)</item>
        <item>No client-side schema redefinition</item>
      </receipt_check>
    </assignment>

    <assignment>
      <task_id>prog-studio-sessions-2026-05-s2-list-edit-t5-detail-shell</task_id>
      <agent>FE#3</agent>
      <expected_tag>ui_packet</expected_tag>
      <expected_file>.claude/agents/tasks/outputs/prog-studio-sessions-2026-05-s2-list-edit-t5-detail-shell-FE-*.md</expected_file>
      <blocks>t6-editor-save</blocks>
      <receipt_check>
        <item>SessionDetailPage.tsx full implementation (not stub) with tab bar</item>
        <item>Tab bar uses role="tablist"/"tab"/"tabpanel" (no Shadcn tabs)</item>
        <item>Analyze tab has aria-disabled="true" and title="Coming in S3"</item>
        <item>OverviewTab.tsx with all frontmatter fields and stat row</item>
        <item>TableTab.tsx with sortable columns; 9 columns; keyboard nav</item>
        <item>e2e spec updated with tab-switching and Analyze slot assertions</item>
        <item>npm run lint exit 0</item>
        <item>No EditorTab implementation (only stub)</item>
      </receipt_check>
    </assignment>

    <assignment>
      <task_id>prog-studio-sessions-2026-05-s2-list-edit-t6-editor-save</task_id>
      <agent>FE#4</agent>
      <expected_tag>ui_packet</expected_tag>
      <expected_file>.claude/agents/tasks/outputs/prog-studio-sessions-2026-05-s2-list-edit-t6-editor-save-FE-*.md</expected_file>
      <blocks>NONE (final packet; unblocks human step 4.5)</blocks>
      <receipt_check>
        <item>useSessionRaw.ts pre-fills originalContent + editBuffer from session.getRaw</item>
        <item>useSessionSave.ts wraps session.saveEdit mutation</item>
        <item>EditorTab.tsx full implementation (Textarea, Save, Revert, inline success/error)</item>
        <item>Failed save: buffer NOT cleared; role="alert" error shown</item>
        <item>Analyze slot confirmed disabled with title="Coming in S3" (may be carry-confirm from t5)</item>
        <item>e2e spec complete with Editor pre-fill, save success, revert, Analyze disabled, smoke regression</item>
        <item>npm run lint clean across all three packages</item>
        <item>No toast primitive import; no raw hex values; no schema redefinitions</item>
        <item>No git commit performed</item>
      </receipt_check>
    </assignment>

  </assignments>
</expectation_manifest>
