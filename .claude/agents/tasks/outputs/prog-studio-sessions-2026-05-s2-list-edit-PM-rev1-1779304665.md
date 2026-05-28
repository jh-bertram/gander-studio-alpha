# Task Decomposition — prog-studio-sessions-2026-05-s2-list-edit (rev1)

Generated: 2026-05-20T20:00:00Z
PM: PM#2 (revision after CRITIQUE_BLOCK round 1)
Sprint: S2 of prog-studio-sessions-2026-05 — Sessions List + Viewer + Markdown Editor
Prior plan: .claude/agents/tasks/outputs/prog-studio-sessions-2026-05-s2-list-edit-PM-1779304665.md
Critique: .claude/agents/tasks/outputs/prog-studio-sessions-2026-05-s2-list-edit-CR-1779304665.md

## Changes from rev0

- BLOCKER 1 resolved: replaced switch/case assumption + ModeContent prop-passing with Option B
  (SessionsRouter.tsx — zero-prop store-driven wrapper; PAGE_MAP gets `sessions: SessionsRouter`).
  SessionDetailPage reads selectedSessionId from store, NO id prop.
- BLOCKER 2 resolved: t4→t4a+t4b, t5→t5a+t5b, t6→t6a+t6b. t3 also exceeds 3 source files
  (ui-store + navigation + constants/sessions + SessionsRouter + 2 stubs + ModeContent = 7) so split
  into t3a (pure-state-machine edits: ui-store + navigation + constants/sessions) and t3b (new
  components: SessionsRouter.tsx + 2 stub pages + ModeContent PAGE_MAP entry). All FE packets now ≤3
  source files. E2e spec is a co-located test deliverable (not counted as a source file) per the lens
  stated explicitly in the Critic's required_revision.
- WARNING 1 resolved: dotColor changed from `var(--ms)` (nonexistent) to `var(--mp)` (#9b59b6,
  magenta/purple — confirmed present in globals.css:29; distinct from the four existing nav dots).
- WARNING 2 resolved: t2 now mirrors session.get's INLINE readdir scan (not collectSessions).
- WARNING 3 resolved: Table tab = AGENT-ACTIVITY table (human decided). SC5 wording artifact
  "seq/ts/event" documented as brief artifact; auditor must NOT fail t5b for absent seq/ts/event cols.
- WARNING 4 resolved: no-remount SC asserted via DOM/state identity (stable
  data-testid="sessions-detail-page" persists across tab clicks), not network counting.
- WARNING 5 resolved: e2e spec renamed to
  `packages/client/tests/e2e/prog-studio-sessions-2026-05-s2-list-edit-fe.spec.ts`.

---

<task_decomposition task_id="prog-studio-sessions-2026-05-s2-list-edit" agent_count="10">

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
        Analyze is a disabled tab with title attribute "Coming in S3". The detail page header shows the
        session sprint slug and date. Tab switching must not remount the data fetch.

        ARCHITECTURE NOTE — store-driven routing (PAGE_MAP constraint):
        ModeContent.tsx uses a zero-prop component-map:
          const PAGE_MAP = { browse: BrowsePage, ... } as const;
          const ActivePage = PAGE_MAP[activeMode];
          return <ActivePage />;
        All page components in PAGE_MAP are rendered with ZERO props. The Sessions mode uses a wrapper
        component `SessionsRouter` (also zero-prop) that reads selectedSessionId from useSessionStore
        and internally renders <SessionListPage /> or <SessionDetailPage />. SessionDetailPage reads
        its session id from the store — it does NOT receive an id prop from ModeContent or SessionsRouter.

        Surface C — Tab interiors:
          - Overview tab: frontmatter fields (sprint, date, status, type, title, gap_classes, source_root,
            editedFilePath) + top-line stat row (agent count, feedback-loop count, total events, status).
          - Table tab: AGENT-ACTIVITY sortable table (human confirmed). Columns:
            [Agent ID, Spawns, Completes, Feedback Loops, Critique Passes, Critique Blocks,
            Audit Passes, Audit Fails, Wall Clock (ms)]. Column headers are clickable sort triggers.
            Default sort: Agent ID ascending. Keyboard-navigable (tab through rows; Enter/Space on headers
            to sort). WCAG AA contrast required on all cells.
            NOTE: SC5 in the sprint brief uses wording "sort by seq/ts/agent/event" — this is a
            brief-level artifact from an event-log framing. The authoritative deliverable is the
            AgentActivity sortable table above. Do NOT specify seq/ts/event columns.
          - Editor tab: full-width Textarea (Shadcn Textarea primitive — this primitive DOES exist at
            packages/client/src/components/ui/textarea.tsx) bound to session markdown body.
            Above: a read-only "Save target:" label showing the destination path affordance.
            Below the textarea: a button row — "Save edit" (primary) + "Revert to original" (secondary).
            Inline success state: shows absolute destination path returned by server. Inline error state:
            shows server error message without clearing the textarea content.
          - Analyze tab: disabled button, title attribute = "Coming in S3", greyed token palette.

        Constraints:
        - Token-first. All colors reference globals.css CSS custom properties. Confirmed token list
          (from globals.css): --mt (#5499b5), --mg (#4caf7d), --my (#e8c840), --mb (#4a90d9),
          --mp (#9b59b6), --mr (#e74c3c), --mo (#e8914d), --bd, --sfm, --redb, --wd, --wm, --wl,
          --fh, --fm, --rl, --gt, etc.
          TOKEN DOES NOT EXIST: --ms. Do NOT reference --ms anywhere.
          Sessions nav dot color: var(--mp) (magenta/purple — distinct from existing four nav dots).
        - NO Shadcn tabs/tooltip/toast primitives (they do not exist in the codebase). Tab switching
          must be built from role="tablist" + role="tab" buttons with conditional render of
          role="tabpanel". Save confirmation is inline — not a toast overlay. Disabled Analyze tab uses
          title attribute — not a tooltip primitive.
        - NO new ad-hoc hex values per cross-sprint invariant 4.
        - All interactive states specified: hover, focus, active, disabled, loading, empty, error.
        - WCAG AA: verify every fg/bg token pair and record in contrast_pairs.
        - Pages nested under pages/sessions/ (deliberate structural deviation for a multi-surface mode;
          document this call in the spec).
        - Stores: session-store.ts (kebab-case per convention, not sessionStore.ts).
        - The Analyze slot must be specified as { id: "analyze", label: "Analyze", placeholder: true }
          so S3 only flips placeholder false.
        - design_system_source: INFERRED (no DESIGN.md present; flag absence in notes).
        - Cite ~/.claude/refs/dashboard-patterns.md by name for browse-list and detail-tabbed patterns.
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
        - --ms NOT referenced anywhere in spec. Sessions nav dot specified as var(--mp).
        - SC5 note present: Table tab = agent-activity table; seq/ts/event columns NOT specified.
        - Architecture note present: SessionsRouter is zero-prop; SessionDetailPage reads id from store.
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
        - Do NOT reference --ms (it does not exist in globals.css).
      </out_of_scope>
      <output_expected>
        <tag>design_spec</tag>
        <must_contain>
          <item>SessionListPage spec with row layout, empty state, error state, loading skeleton</item>
          <item>SessionDetailPage shell spec with tab bar (Overview / Table / Editor / Analyze disabled)</item>
          <item>OverviewTab spec with frontmatter fields + stat row</item>
          <item>TableTab spec: agent-activity table with 9 columns (Agent ID, Spawns, Completes, Feedback Loops, Critique Passes, Critique Blocks, Audit Passes, Audit Fails, Wall Clock (ms)); sortable; keyboard nav; WCAG AA</item>
          <item>EditorTab spec with Textarea, Save target label, Save + Revert buttons, inline success/error</item>
          <item>contrast_pairs block</item>
          <item>Analyze slot declaration: { id: "analyze", label: "Analyze", placeholder: true }</item>
          <item>dashboard-patterns.md citation</item>
          <item>Architecture note: PAGE_MAP zero-prop constraint; SessionsRouter owns list/detail switch</item>
        </must_contain>
        <must_not_contain>
          <item>Raw hex color values</item>
          <item>References to Shadcn tabs, tooltip, or toast primitives</item>
          <item>Markdown preview or diff view spec</item>
          <item>sessionStore.ts (wrong casing — must be session-store.ts)</item>
          <item>--ms token reference</item>
          <item>seq/ts/event columns in the Table tab spec</item>
        </must_not_contain>
        <success_signal>design_spec returned with all surfaces, contrast_pairs, Analyze placeholder verbatim, --mp nav dot, no --ms</success_signal>
      </output_expected>
    </task_packet>

    <task_packet>
      <task_id>prog-studio-sessions-2026-05-s2-list-edit-t2-be-raw</task_id>
      <assigned_to>backend-engineer</assigned_to>
      <priority>BLOCKER</priority>
      <description>
        RATIONALE: SC6 requires the Editor tab to pre-fill with the original source markdown and support
        revert-to-original. The S1 SessionSchema has no raw body field; session.get returns a parsed object
        only. A browser cannot read the filesystem. Adding the read path is a backend concern. This packet
        adds a single tRPC query procedure.

        ADD to packages/server/src/router.ts (sessionRouter):
          session.getRaw
            input:  { id: string }        validated by z.object({ id: z.string() })
            output: { content: string }   validated by z.object({ content: z.string() })
            type:   QUERY

        IMPLEMENTATION — mirror session.get's inline readdir scan VERBATIM (NOT collectSessions):
        session.get (router.ts, inside sessionRouter) does NOT call collectSessions from session-list.ts.
        It runs its own inline readdir loop over SESSIONS_SOURCE_DIRS, parsing each file and returning
        on the FIRST file whose parsed session matches:
          parsed.id === input.id  OR  parsed.sprint === input.id
        This composite-key match (id-OR-sprint) is what allows the client's `id` string to work
        identically for both session.get and session.getRaw.

        session.getRaw must use the SAME inline readdir approach:
          - Iterate SESSIONS_SOURCE_DIRS (same as session.get).
          - For each dir: readdir, filter .md files, parse each with parseSessionFile (or equivalent).
          - On first match (parsed.id === input.id || parsed.sprint === input.id):
              read the file at session.filePath using fs.promises.readFile(filePath, 'utf8').
              Return { content: rawString }.
          - If the match has editedFilePath set, STILL read session.filePath (the ORIGINAL source),
            NOT the edited copy — the client needs the original for pre-fill and revert.
          - After exhausting all dirs with no match:
              throw TRPCError({ code: 'NOT_FOUND' }) matching the session.get pattern.
          - On file read error (ENOENT, EACCES, etc.):
              throw TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: err.message }).
          - Path traversal: filePath comes from the on-disk parseSessionFile result (already validated
            at parse time). Do NOT accept raw filePath from the client input. Only the session id
            is accepted as client input.

        Do NOT call collectSessions or any list-path function. The list path has composite-key dedup +
        date sort that are unnecessary for a single-match lookup and would require re-finding the target
        afterward by id.

        ADD to packages/shared/src/schemas.ts:
          export const SessionRawOutputSchema = z.object({ content: z.string() });
          export type SessionRawOutput = z.infer<typeof SessionRawOutputSchema>;
          (Also add SessionRawInputSchema = z.object({ id: z.string() }) for parity, whether inlined
          in the router or exported from shared — your call, as long as SessionRawOutputSchema is exported
          from shared for the client to import.)

        DO NOT modify SessionSchema, existing procedures, or any other schema.
        DO NOT modify any client files.
        DO NOT run git add/commit — return a completion_packet only.
      </description>
      <success_criteria>
        - session.getRaw query added to sessionRouter in packages/server/src/router.ts.
        - Input validated by z.object({ id: z.string() }).
        - Output validated by z.object({ content: z.string() }); SessionRawOutputSchema exported from
          packages/shared/src/schemas.ts.
        - Implementation uses inline readdir scan (same as session.get), NOT collectSessions.
        - Uses id-OR-sprint matching: parsed.id === input.id || parsed.sprint === input.id.
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
        - Do NOT call collectSessions (use the same inline readdir scan as session.get).
        - Do NOT accept filePath from the client (path-traversal prevention).
        - Do NOT read editedFilePath — always read the original source filePath.
        - Do NOT modify any client files.
        - Do NOT run git commit.
      </out_of_scope>
      <output_expected>
        <tag>completion_packet</tag>
        <must_contain>
          <item>session.getRaw procedure declaration in router.ts using inline readdir scan</item>
          <item>id-OR-sprint matching logic (same as session.get)</item>
          <item>SessionRawOutputSchema exported from packages/shared/src/schemas.ts</item>
          <item>NOT_FOUND error branch</item>
          <item>npm run lint exit 0 confirmation</item>
        </must_contain>
        <must_not_contain>
          <item>Git commit or push commands</item>
          <item>Modification of SessionSchema or existing session.* procedures</item>
          <item>Client input accepting filePath directly</item>
          <item>Call to collectSessions in the getRaw implementation</item>
        </must_not_contain>
        <success_signal>completion_packet returned; npm run lint clean; auditor real-corpus smoke passes</success_signal>
      </output_expected>
    </task_packet>

    <!-- ================================================================
         WAVE 1 — t3a + t3b — Nav + Routing Scaffold — depends t1 + t2
         t3a: state-machine edits (≤3 source files)
         t3b: new components + ModeContent wiring (≤3 source files)
         t3a and t3b are sequential (t3b depends on t3a)
         ================================================================ -->

    <task_packet>
      <task_id>prog-studio-sessions-2026-05-s2-list-edit-t3a-nav-state</task_id>
      <assigned_to>frontend-engineer</assigned_to>
      <priority>HIGH</priority>
      <description>
        Implement the state-machine edits for the Sessions nav registration. This packet is the
        infrastructure half of the scaffold — pure additions to existing files with no new component
        files. All edits are 1-line or small-block additions.

        SOURCE FILES TOUCHED (≤3 source files; e2e spec not yet created in this packet):

        1. packages/client/src/store/ui-store.ts
           - Add 'sessions' to the AppMode union:
             export type AppMode = 'browse' | 'compose' | 'edit' | 'export' | 'sessions';
           - No other changes to ui-store.ts.

        2. packages/client/src/constants/navigation.ts
           - Add the Sessions NAV_ITEM at the end of NAV_ITEMS (after the Export entry):
             { mode: 'sessions', label: 'Sessions', dotColor: 'var(--mp)' }
           - var(--mp) = #9b59b6 (magenta/purple) — confirmed present in globals.css:29.
             This is DISTINCT from the four existing nav dot tokens and is the correct token.
             Do NOT use --ms (it does not exist). Do NOT hardcode a hex value.

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
           - This file is the SINGLE SOURCE OF TRUTH for tab labels and the "Coming in S3" association.
             S3 only needs to flip placeholder: true → false and supply a component. Do NOT scatter
             tab definitions elsewhere. The string "Coming in S3" lives only here (via the analyze
             entry's placeholder flag; the rendered title attribute is hardcoded from this flag in the
             component).

        Conventions:
        - No shadcn primitives. No raw hex values. No data fetching code. All TypeScript strict.
      </description>
      <success_criteria>
        - AppMode in ui-store.ts includes 'sessions' (SC1).
        - NAV_ITEMS in navigation.ts includes { mode: 'sessions', label: 'Sessions', dotColor: 'var(--mp)' } (SC1).
        - var(--mp) used (not --ms, not --mt, not a hex value).
        - constants/sessions.ts exists; exports SESSION_TABS with exactly 4 entries; analyze entry has placeholder: true (SC8 setup).
        - npm run lint clean (SC9).
        - No raw hex values in any modified or created file.
      </success_criteria>
      <context_files>
        packages/client/src/store/ui-store.ts
        packages/client/src/constants/navigation.ts
        packages/client/src/globals.css
        .claude/agents/tasks/outputs/prog-studio-sessions-2026-05-s2-list-edit-t1-ui-design-*.md
      </context_files>
      <dependencies>t1-ui-design (for token choices and nav placement), t2-be-raw (tRPC contract finalized before FE starts)</dependencies>
      <out_of_scope>
        - Do NOT create any .tsx component files (that is t3b).
        - Do NOT modify ModeContent.tsx (that is t3b).
        - Do NOT implement any data fetching.
        - Do NOT add Playwright tests (first e2e spec file created in t4b).
        - Do NOT touch Browse/Compose/Edit/Export page files.
        - Do NOT add Shadcn tabs/tooltip/toast primitives.
      </out_of_scope>
      <estimated_new_lines>~25 (ui-store.ts: 1 line; navigation.ts: 1 line; sessions.ts: ~23 lines)</estimated_new_lines>
      <output_expected>
        <tag>ui_packet</tag>
        <must_contain>
          <item>AppMode union with 'sessions' added (ui-store.ts diff)</item>
          <item>NAV_ITEMS with sessions entry using var(--mp) dotColor (navigation.ts diff)</item>
          <item>constants/sessions.ts with SESSION_TABS including analyze placeholder:true</item>
          <item>npm run lint exit 0</item>
        </must_contain>
        <must_not_contain>
          <item>Raw hex values</item>
          <item>--ms token reference</item>
          <item>Any .tsx component files</item>
          <item>Data fetching hooks or trpc calls</item>
        </must_not_contain>
        <success_signal>npm run lint clean; ui-store.ts, navigation.ts, constants/sessions.ts all updated correctly</success_signal>
      </output_expected>
    </task_packet>

    <task_packet>
      <task_id>prog-studio-sessions-2026-05-s2-list-edit-t3b-router-scaffold</task_id>
      <assigned_to>frontend-engineer</assigned_to>
      <priority>HIGH</priority>
      <description>
        Implement the Sessions routing components and wire the PAGE_MAP entry. This packet is the
        component half of the scaffold — creates new files and makes one addition to ModeContent.tsx.

        ARCHITECTURE CONSTRAINT — PAGE_MAP zero-prop shape (READ THIS FIRST):
        ModeContent.tsx uses a component-map pattern:
          const PAGE_MAP = { browse: BrowsePage, compose: ComposePage, edit: EditPage, export: ExportPage } as const;
          const ActivePage = PAGE_MAP[activeMode];
          return <main ...><ActivePage /></main>;
        ALL entries in PAGE_MAP are rendered as <ActivePage /> with ZERO props. This is the shape
        that must be preserved. Do NOT add conditional escape hatches inside ModeContent.

        The Sessions mode list/detail switch is handled by a DEDICATED WRAPPER COMPONENT:

        SOURCE FILES TOUCHED (≤3 source files; e2e spec is a co-located test deliverable, not a
        4th source file per the auditor lens stated in this plan):

        1. NEW file: packages/client/src/pages/sessions/SessionsRouter.tsx
           - Zero-prop component (no props — it must be compatible with PAGE_MAP).
           - Reads selectedSessionId from useSessionStore():
               const { selectedSessionId } = useSessionStore();
           - Renders:
               if selectedSessionId is null → <SessionListPage />
               if selectedSessionId is set  → <SessionDetailPage />
           - Imports: useSessionStore from '../../store/session-store'; SessionListPage and
             SessionDetailPage from their stub files (created below in this packet).
           - Note: SessionDetailPage is ALSO zero-prop — it reads its own id from the store.

        2. NEW stubs: packages/client/src/pages/sessions/
           Create the following stub placeholder files (to unblock t4a/t4b/t5a/t5b/t6a/t6b):
             SessionListPage.tsx
               exports default: function SessionListPage() {
                 return <div data-testid="sessions-list-page">Sessions List (stub)</div>;
               }
             SessionDetailPage.tsx
               exports default: function SessionDetailPage() {
                 return <div data-testid="sessions-detail-page">Session Detail (stub)</div>;
               }
           These stubs will be fully replaced by t4b and t5a respectively.

        3. MODIFY packages/client/src/components/ModeContent.tsx
           - Add ONE import: SessionsRouter from '../pages/sessions/SessionsRouter'
           - Add ONE entry to PAGE_MAP: sessions: SessionsRouter
           - Result after edit:
               const PAGE_MAP = {
                 browse: BrowsePage,
                 compose: ComposePage,
                 edit: EditPage,
                 export: ExportPage,
                 sessions: SessionsRouter,
               } as const;
           - Leave the ActivePage rendering line and ALL existing entries byte-identical.
           - Do NOT add any conditional logic inside ModeContent.

        Note: session-store.ts does not yet exist when this packet runs. SessionsRouter.tsx references
        it; the TypeScript build will pass only after t4a creates session-store.ts. For lint in this
        packet: create a minimal stub session-store.ts if needed to allow tsc to pass, OR confirm with
        the auditor that t3b + t4a are audited together. PREFERRED APPROACH: create a minimal stub
        session-store.ts with the interface only (no Zustand implementation) so tsc passes for this
        packet, then t4a replaces the stub with the full implementation. Stub content:
          // stub — replaced by t4a
          export interface SessionStore { selectedSessionId: string | null; }
          export const useSessionStore = () => ({ selectedSessionId: null as string | null });
        If the stub approach is used, include it in the packet output and note it is replaced by t4a.

        Conventions:
        - No Shadcn tabs/tooltip/toast. Token-only colors. All files fully typed.
      </description>
      <success_criteria>
        - SessionsRouter.tsx exists; is zero-prop; reads selectedSessionId from useSessionStore; renders
          SessionListPage when null, SessionDetailPage when set (SC3 routing foundation).
        - pages/sessions/SessionListPage.tsx stub exists with data-testid="sessions-list-page".
        - pages/sessions/SessionDetailPage.tsx stub exists with data-testid="sessions-detail-page".
        - ModeContent.tsx PAGE_MAP has sessions: SessionsRouter entry; all other entries byte-identical.
        - No conditional escape hatch added inside ModeContent (PAGE_MAP zero-prop shape preserved).
        - SessionDetailPage stub is zero-prop (no id prop).
        - npm run lint clean (SC9).
        - No raw hex values in new files.
      </success_criteria>
      <context_files>
        packages/client/src/components/ModeContent.tsx
        packages/client/src/store/ui-store.ts  (from t3a — AppMode now includes 'sessions')
        .claude/agents/tasks/outputs/prog-studio-sessions-2026-05-s2-list-edit-t1-ui-design-*.md
      </context_files>
      <dependencies>t3a-nav-state (AppMode must include 'sessions' before ModeContent PAGE_MAP entry compiles)</dependencies>
      <out_of_scope>
        - Do NOT implement list content or data fetching (t4a/t4b).
        - Do NOT implement detail tabs (t5a/t5b).
        - Do NOT implement the editor or save flow (t6a/t6b).
        - Do NOT add Playwright tests (first e2e spec created in t4b).
        - Do NOT touch Browse/Compose/Edit/Export page files.
        - Do NOT add Shadcn tabs/tooltip/toast primitives.
        - Do NOT add conditional escape hatches inside ModeContent — the PAGE_MAP zero-prop shape is
          an invariant.
      </out_of_scope>
      <estimated_new_lines>~45 (SessionsRouter.tsx ~15; two stubs ~10; ModeContent diff ~2; session-store stub ~5)</estimated_new_lines>
      <output_expected>
        <tag>ui_packet</tag>
        <must_contain>
          <item>SessionsRouter.tsx (zero-prop; reads selectedSessionId from store)</item>
          <item>pages/sessions/SessionListPage.tsx stub with data-testid</item>
          <item>pages/sessions/SessionDetailPage.tsx stub with data-testid; zero-prop</item>
          <item>ModeContent.tsx diff showing sessions: SessionsRouter in PAGE_MAP</item>
          <item>npm run lint exit 0</item>
        </must_contain>
        <must_not_contain>
          <item>Conditional escape hatch inside ModeContent (e.g., if/else before or after PAGE_MAP lookup)</item>
          <item>id prop on SessionDetailPage stub or SessionsRouter rendering it with prop</item>
          <item>Data fetching hooks or trpc calls</item>
          <item>Raw hex values</item>
          <item>Shadcn tabs/tooltip/toast imports</item>
        </must_not_contain>
        <success_signal>npm run lint clean; Sessions mode appears in nav; clicking Sessions routes to stub list page; PAGE_MAP shape intact</success_signal>
      </output_expected>
    </task_packet>

    <!-- ================================================================
         WAVE 2 — t4a + t4b — List Page + Data Layer — depends t3b
         t4a: state/data layer (session-store.ts + useSessions.ts)
         t4b: SessionListPage full impl + e2e list stub
         Sequential: t4b depends on t4a
         ================================================================ -->

    <task_packet>
      <task_id>prog-studio-sessions-2026-05-s2-list-edit-t4a-data-layer</task_id>
      <assigned_to>frontend-engineer</assigned_to>
      <priority>HIGH</priority>
      <description>
        Implement the Sessions Zustand store and data-fetch hook. This is the state/data layer that
        all subsequent FE packets depend on. It does NOT implement any UI components.

        SOURCE FILES TOUCHED (≤3 source files; 2 are new files that replace the t3b stub):

        1. NEW file (REPLACES t3b stub): packages/client/src/store/session-store.ts  (kebab-case)
           Full Zustand store for the Sessions mode. Export useSessionStore. State shape:
             sessions: Session[]               — list from session.list
             selectedSessionId: string | null  — id of selected session (drives SessionsRouter)
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
           This file REPLACES the stub created in t3b. The stub used the same export name
           (useSessionStore), so t3b's SessionsRouter.tsx import remains valid after replacement.

        2. NEW file: packages/client/src/hooks/useSessions.ts
           Data-fetch hook wrapping session.list. Pattern mirrors useBrowseData.ts:
             - Calls trpc.session.list.useQuery({ limit: 50 })
             - Unwraps the list envelope: response.sessions
               IMPORTANT: session.list returns { sessions, skipped } (envelope).
               session.get returns a BARE object (no envelope).
               useSessions.ts must unwrap .sessions on the list query ONLY.
             - Returns { sessions: Session[], isLoading: boolean, error: unknown }
           Also export: useSessionDetail(id: string) wrapping trpc.session.get.useQuery({ id })
             - session.get returns bare object — do NOT unwrap .sessions on get.
           Import: import { trpc } from '../trpc'
           Import types: import type { Session } from '@gander-studio/shared'

        Conventions:
        - session-store.ts (kebab-case — NOT sessionStore.ts). Auditor receipt check enforces this.
        - No shadcn imports. No raw hex values. All functions typed.
      </description>
      <success_criteria>
        - packages/client/src/store/session-store.ts exists (kebab-case); exports useSessionStore (SC2, SC6 buffer fields).
        - Store has all state fields: sessions, selectedSessionId, activeTab, editBuffer, originalContent, lastSaveResult, lastSaveError plus all setters.
        - Session type imported from @gander-studio/shared (not redefined client-side).
        - packages/client/src/hooks/useSessions.ts exists; list query correctly unwraps .sessions envelope; useSessionDetail wraps bare session.get (no .sessions unwrap) (SC2).
        - npm run lint clean (SC9).
        - No sessionStore.ts (wrong casing).
        - No client-side schema redefinitions.
      </success_criteria>
      <context_files>
        packages/client/src/hooks/useBrowseData.ts
        packages/client/src/store/browse-store.ts
        packages/client/src/trpc.ts
        packages/shared/src/schemas.ts
        .claude/agents/tasks/outputs/prog-studio-sessions-2026-05-s2-list-edit-t1-ui-design-*.md
      </context_files>
      <dependencies>t3b-router-scaffold (session-store stub must exist so that its replacement is valid; useSessions.ts import chain compiles)</dependencies>
      <out_of_scope>
        - Do NOT implement any React component UI (that is t4b).
        - Do NOT implement the save mutation hook useSessionSave (t6a).
        - Do NOT implement session.getRaw data fetching (t6a).
        - Do NOT modify ModeContent.tsx or SessionsRouter.tsx.
        - Do NOT touch Browse/Compose/Edit/Export pages or their stores.
      </out_of_scope>
      <estimated_new_lines>~75 (session-store.ts ~40; useSessions.ts ~35)</estimated_new_lines>
      <output_expected>
        <tag>ui_packet</tag>
        <must_contain>
          <item>session-store.ts with editBuffer, originalContent, lastSaveResult, lastSaveError fields and all setters</item>
          <item>useSessions.ts with list-envelope unwrap (.sessions) and useSessionDetail (bare get, no unwrap)</item>
          <item>npm run lint exit 0</item>
        </must_contain>
        <must_not_contain>
          <item>sessionStore.ts (wrong casing)</item>
          <item>Client-side redefinition of Session, SessionSchema, or any schema from @gander-studio/shared</item>
          <item>Any React component JSX</item>
          <item>Raw hex values</item>
        </must_not_contain>
        <success_signal>npm run lint clean; session-store.ts and useSessions.ts exist with correct interfaces</success_signal>
      </output_expected>
    </task_packet>

    <task_packet>
      <task_id>prog-studio-sessions-2026-05-s2-list-edit-t4b-list-page</task_id>
      <assigned_to>frontend-engineer</assigned_to>
      <priority>HIGH</priority>
      <description>
        Implement the Sessions list page (full replacement of t3b stub) and create the e2e spec stub.

        SOURCE FILES TOUCHED (≤3 source files; e2e spec is a co-located test deliverable, not a 4th
        source file per the lens stated in this plan for the auditor):

        1. REPLACE packages/client/src/pages/sessions/SessionListPage.tsx  (stub → full)
           Full implementation:
             - Calls useSessions() from packages/client/src/hooks/useSessions.ts to get sessions list.
             - Renders a table or list with one row per session showing:
                 sprint slug (session.sprint), date (session.date), status (session.status ?? '—'),
                 gap_classes summary (session.gap_classes.join(', ') or '—' if empty).
             - Clicking a row: calls useSessionStore().setSelectedSessionId(session.id).
               SessionsRouter (already wired in t3b) will then render SessionDetailPage
               because selectedSessionId is now non-null — no additional ModeContent changes needed.
             - Loading state: skeleton or "Loading sessions…" indicator with aria-busy="true".
             - Error state: role="alert" with error message.
             - Empty state: aria-live="polite" "No sessions found".
             - data-testid="sessions-list-page" on root div.
           Design: use Mako Teal token palette; mirror BrowsePage sub-component style (PageTitle,
           error/empty state pattern). No raw hex values.

        2. No additional source files (SessionsRouter.tsx wiring already done in t3b;
           ModeContent wiring already done in t3b; session-store already done in t4a).

        E2e spec (co-located test deliverable — NOT counted as a 4th source file):
          CREATE packages/client/tests/e2e/prog-studio-sessions-2026-05-s2-list-edit-fe.spec.ts
          Add a placeholder test:
            - Navigate to sessions mode.
            - Assert data-testid="sessions-list-page" is visible.
          Full assertions added by t5a and t6b. Do NOT remove this assertion when those packets extend.

        Conventions:
        - Import Session type from @gander-studio/shared; never redefine.
        - import { trpc } from '../../trpc' (or the correct relative path).
        - session-store.ts (kebab-case). No shadcn tabs/tooltip/toast.
      </description>
      <success_criteria>
        - SessionListPage.tsx is the full implementation (not stub); renders one row per session with
          sprint, date, status, gap_classes (SC2).
        - Loading (aria-busy="true"), empty (aria-live="polite"), and error (role="alert") states present (SC2).
        - Row click calls setSelectedSessionId(session.id); SessionsRouter routes to detail via store (SC3).
        - packages/client/tests/e2e/prog-studio-sessions-2026-05-s2-list-edit-fe.spec.ts exists
          with at least one assertion on data-testid="sessions-list-page" (AUDIT_RISK pattern).
        - npm run lint clean (SC9).
        - No raw hex values; Session type imported from @gander-studio/shared, not redefined.
      </success_criteria>
      <context_files>
        packages/client/src/pages/BrowsePage.tsx
        packages/client/src/pages/sessions/SessionListPage.tsx  (current stub from t3b)
        packages/client/src/store/session-store.ts  (from t4a)
        packages/client/src/hooks/useSessions.ts  (from t4a)
        packages/shared/src/schemas.ts
        .claude/agents/tasks/outputs/prog-studio-sessions-2026-05-s2-list-edit-t1-ui-design-*.md
      </context_files>
      <dependencies>t4a-data-layer</dependencies>
      <out_of_scope>
        - Do NOT implement tab content (Overview/Table/Editor/Analyze) — that is t5a/t5b/t6a/t6b.
        - Do NOT implement the save mutation hook (useSessionSave) — that is t6a.
        - Do NOT implement session.getRaw data fetching in this packet — that is t6a.
        - Do NOT add Shadcn tabs/tooltip/toast.
        - Do NOT redefine Session or any schema client-side.
        - Do NOT touch Browse/Compose/Edit/Export pages.
        - Do NOT modify ModeContent.tsx or SessionsRouter.tsx (already done in t3b).
      </out_of_scope>
      <estimated_new_lines>~60 (SessionListPage.tsx ~50; e2e spec stub ~10)</estimated_new_lines>
      <output_expected>
        <tag>ui_packet</tag>
        <must_contain>
          <item>SessionListPage.tsx full implementation (not stub) with sprint, date, status, gap_classes columns</item>
          <item>Loading/empty/error states with aria roles</item>
          <item>Row click handler calling setSelectedSessionId</item>
          <item>e2e spec file at packages/client/tests/e2e/prog-studio-sessions-2026-05-s2-list-edit-fe.spec.ts</item>
          <item>npm run lint exit 0</item>
        </must_contain>
        <must_not_contain>
          <item>Client-side redefinition of Session, SessionSchema, or any schema from @gander-studio/shared</item>
          <item>Tab implementation code (Overview/Table/Editor/Analyze)</item>
          <item>Raw hex values</item>
          <item>ModeContent changes (already done in t3b)</item>
        </must_not_contain>
        <success_signal>npm run lint clean; session list visible in browser; row click routes to detail stub (via SessionsRouter store-read); e2e spec file exists</success_signal>
      </output_expected>
    </task_packet>

    <!-- ================================================================
         WAVE 3 — t5a + t5b — Detail Shell + Tabs — depends t4b
         t5a: SessionDetailPage shell + tab bar
         t5b: OverviewTab + TableTab
         Sequential: t5b depends on t5a
         ================================================================ -->

    <task_packet>
      <task_id>prog-studio-sessions-2026-05-s2-list-edit-t5a-detail-shell</task_id>
      <assigned_to>frontend-engineer</assigned_to>
      <priority>HIGH</priority>
      <description>
        Implement the SessionDetailPage shell (replace t3b stub with full tab-bar shell). The tab
        content components are t5b (Overview + Table) and t6b (Editor).

        ARCHITECTURE CONSTRAINT (repeat for this agent's context):
        SessionDetailPage is rendered by SessionsRouter when selectedSessionId is non-null.
        SessionsRouter does NOT pass an id prop. Therefore:
          - SessionDetailPage is a ZERO-PROP component.
          - It reads selectedSessionId from useSessionStore():
              const { selectedSessionId, activeTab } = useSessionStore();
          - It passes session id to useSessionDetail(selectedSessionId!) from useSessions.ts.

        SOURCE FILES TOUCHED (≤3 source files; e2e spec is a co-located test deliverable):

        1. REPLACE packages/client/src/pages/sessions/SessionDetailPage.tsx  (stub → full shell)
           ZERO PROPS (no id prop — reads from store):
           - Reads selectedSessionId and activeTab from useSessionStore().
           - Calls useSessionDetail(selectedSessionId!) to get the Session object.
           - Renders a tab bar built from role="tablist" with one role="tab" button per SESSION_TABS
             entry (imported from constants/sessions.ts, t3a). Tab bar rules:
               * Each button calls useSessionStore().setActiveTab(tab.id) on click.
               * Active tab: aria-selected="true", styled with Mako Teal accent token.
               * Inactive tab: aria-selected="false".
               * analyze tab (placeholder: true): aria-disabled="true", disabled attribute,
                 title="Coming in S3", styled with muted token. Clicking does nothing.
               * Keyboard: Arrow keys navigate between tab buttons; Enter/Space activates. Tab key
                 moves to the active tabpanel.
           - Below the tab bar: renders the correct role="tabpanel" based on activeTab:
               'overview' → <OverviewTab session={session} />  (stub — placeholder div with data-testid="overview-tab-stub")
               'table'    → <TableTab session={session} />    (stub — placeholder div with data-testid="table-tab-stub")
               'editor'   → placeholder div with data-testid="editor-tab-stub"
             The OverviewTab and TableTab stubs will be replaced by t5b. The editor stub by t6b.
           - Header: sprint slug + date above the tab bar.
           - Loading state (session data not yet loaded): skeleton or spinner.
           - Error state: role="alert" with NOT_FOUND or server error message.
           - data-testid="sessions-detail-page" on root div.

        E2e spec extensions (co-located test deliverable — extend the spec created in t4b;
        do NOT remove t4b's assertions):
          File: packages/client/tests/e2e/prog-studio-sessions-2026-05-s2-list-edit-fe.spec.ts
          ADD:
            - Navigate to sessions mode; click a session row; assert data-testid="sessions-detail-page" visible.
            - Click "Overview" tab; assert data-testid="overview-tab-stub" (or full "overview-tab" when t5b ships) visible.
            - Click "Table" tab; assert data-testid="table-tab-stub" visible.
            - Assert "Analyze" tab button has aria-disabled="true" AND title="Coming in S3" (SC8).
            - NO-REMOUNT CHECK (SC3): after clicking Overview → Table → Overview, assert that
              data-testid="sessions-detail-page" element is present and its rendered content (e.g.,
              the session sprint slug text in the header) is unchanged between clicks. This verifies
              the shell was not remounted (DOM/state identity signal — do NOT use network request
              counting, which is brittle under react-query/batch link).

        Conventions:
        - Session type from @gander-studio/shared. No raw hex values. No Shadcn tabs.
        - Tab bar from role="tablist"/"tab"/"tabpanel".
      </description>
      <success_criteria>
        - SessionDetailPage.tsx is zero-prop; reads selectedSessionId from useSessionStore (NOT an id prop) (SC3).
        - Tab bar renders Overview / Table / Editor (stub) / Analyze (disabled) using role="tablist"/"tab"/"tabpanel" (SC3, SC8).
        - Analyze tab has aria-disabled="true" AND title="Coming in S3" (SC8).
        - Tab switching renders correct panel stub without remounting page (verified via DOM/state identity e2e assertion) (SC3).
        - Loading and error states present on SessionDetailPage.
        - e2e spec updated: row-click → detail page visible; Overview/Table tab clicks; Analyze slot assertions; no-remount DOM identity check (SC3, SC8).
        - npm run lint clean (SC9).
        - No raw hex values; types imported from @gander-studio/shared.
        - No Shadcn tabs primitive imported.
      </success_criteria>
      <context_files>
        packages/client/src/pages/sessions/SessionDetailPage.tsx  (stub from t3b)
        packages/client/src/constants/sessions.ts  (SESSION_TABS from t3a)
        packages/client/src/store/session-store.ts  (from t4a)
        packages/client/src/hooks/useSessions.ts  (useSessionDetail from t4a)
        packages/shared/src/schemas.ts
        packages/client/src/globals.css
        packages/client/tests/e2e/prog-studio-sessions-2026-05-s2-list-edit-fe.spec.ts  (stub from t4b)
        .claude/agents/tasks/outputs/prog-studio-sessions-2026-05-s2-list-edit-t1-ui-design-*.md
      </context_files>
      <dependencies>t4b-list-page</dependencies>
      <out_of_scope>
        - Do NOT implement OverviewTab content (t5b). Render a stub div with data-testid="overview-tab-stub".
        - Do NOT implement TableTab content (t5b). Render a stub div with data-testid="table-tab-stub".
        - Do NOT implement EditorTab content (t6b). Render a stub div with data-testid="editor-tab-stub".
        - Do NOT implement the save mutation or useSessionSave hook (t6a).
        - Do NOT implement session.getRaw fetching (t6a).
        - Do NOT implement the Analyze tab component (S3).
        - Do NOT add Shadcn tabs/tooltip/toast.
        - Do NOT add an id prop to SessionDetailPage — it is zero-prop by design (PAGE_MAP constraint).
        - Do NOT touch Browse/Compose/Edit/Export pages.
        - Do NOT modify ui-store.ts, navigation.ts, session-store.ts store shape.
      </out_of_scope>
      <estimated_new_lines>~70 (SessionDetailPage shell ~55; e2e additions ~15)</estimated_new_lines>
      <output_expected>
        <tag>ui_packet</tag>
        <must_contain>
          <item>SessionDetailPage.tsx with zero-prop signature; reads id from store</item>
          <item>Tab bar using role="tablist"/"tab"/"tabpanel" with 4 tabs from SESSION_TABS</item>
          <item>Analyze tab aria-disabled="true" + title="Coming in S3"</item>
          <item>Stub placeholders for OverviewTab, TableTab, EditorTab panels</item>
          <item>e2e assertions: row-click→detail, tab-clicks, Analyze slot, no-remount DOM check</item>
          <item>npm run lint exit 0</item>
        </must_contain>
        <must_not_contain>
          <item>id prop on SessionDetailPage</item>
          <item>OverviewTab or TableTab implementation (only stubs)</item>
          <item>session.getRaw usage</item>
          <item>Shadcn tabs primitive import</item>
          <item>Raw hex values</item>
          <item>Network-count assertion for the no-remount check</item>
        </must_not_contain>
        <success_signal>npm run lint clean; detail page with tab bar navigable in browser; Analyze tab disabled; no-remount e2e assertion passes</success_signal>
      </output_expected>
    </task_packet>

    <task_packet>
      <task_id>prog-studio-sessions-2026-05-s2-list-edit-t5b-tabs-overview-table</task_id>
      <assigned_to>frontend-engineer</assigned_to>
      <priority>HIGH</priority>
      <description>
        Implement OverviewTab and TableTab components. Replace the t5a stubs in the sessions/tabs/
        directory. The EditorTab is t6b.

        SOURCE FILES TOUCHED (≤3 source files; e2e spec is a co-located test deliverable):

        1. NEW file: packages/client/src/pages/sessions/tabs/OverviewTab.tsx
           Props: { session: Session }
           - Displays frontmatter fields:
               sprint, date, status (or '—'), type (or '—'), title (or '—'),
               gap_classes (join(', ') or '—'), source_root, editedFilePath (or 'None').
           - Top-line stat row: agent count (session.agents.length), feedback-loop count
             (sum of session.agents[].feedback_loops), total event count (session.events.length), status.
           - Mako Teal token palette (see globals.css, t1 design spec). No raw hex values.
           - data-testid="overview-tab" on root div.

        2. NEW file: packages/client/src/pages/sessions/tabs/TableTab.tsx
           Props: { session: Session }

           TABLE SPEC (HUMAN-CONFIRMED — WARNING 3 RESOLUTION):
           The SC5 sprint brief wording "sort by seq, ts, agent, event" is a BRIEF-LEVEL ARTIFACT from
           an event-log framing. The authoritative deliverable (human decision) is the AGENT-ACTIVITY
           table with these 9 columns:
             Agent ID | Spawns | Completes | Feedback Loops | Critique Passes | Critique Blocks |
             Audit Passes | Audit Fails | Wall Clock (ms)
           Source: session.agents (AgentActivity[]) from @gander-studio/shared.
           Do NOT add seq, ts, or event columns. The auditor must NOT fail this packet for absent
           seq/ts/event columns (see REQVAL flag in routing_notes).

           Implementation:
           - Renders an HTML table (not a Shadcn component) of session.agents (AgentActivity[]).
           - Each of the 9 columns above: display '—' if the value is undefined/null.
           - Column headers are clickable: <th> or <button> within <th> with onClick that toggles
             sort direction (asc/desc) on that column. Local sort state (useState).
           - Default sort: Agent ID ascending.
           - Keyboard-navigable: table header sort buttons reachable by keyboard (Enter/Space to sort).
           - WCAG AA contrast on all cell/header token pairs (verified against design spec t1).
           - Empty state: "No agent activity recorded" when session.agents.length === 0.
           - data-testid="table-tab" on root div.

        E2e spec extensions (co-located test deliverable; extend the spec from t5a):
          File: packages/client/tests/e2e/prog-studio-sessions-2026-05-s2-list-edit-fe.spec.ts
          UPDATE:
            - The t5a spec asserts data-testid="overview-tab-stub" and data-testid="table-tab-stub".
            - Once t5b ships, update these assertions to data-testid="overview-tab" and
              data-testid="table-tab" (the real components) OR add additional tests for the real testids.
            - ADD: assert Overview tab shows session sprint slug text.
            - ADD: assert Table tab shows at least one column header matching expected label
              (e.g., "Agent ID").

        Note on stub replacement: t5a rendered stub divs in the tab panels. This packet supplies the
        actual components, which SessionDetailPage.tsx switches by activeTab. The FE agent may update
        SessionDetailPage.tsx imports to point to the real tab components (replacing the stub import/render).
        If SessionDetailPage.tsx is modified, count it as a modification (not a 4th new file — it is
        already a written file; the modification is ≤5 import lines).

        Conventions:
        - Import Session, AgentActivity types from @gander-studio/shared. No raw hex values.
        - No Shadcn tabs/tooltip/toast.
      </description>
      <success_criteria>
        - OverviewTab.tsx renders all 8 frontmatter fields and top-line stat row (SC4).
        - OverviewTab has data-testid="overview-tab" on root div (SC4).
        - TableTab.tsx renders sortable agent-activity table with all 9 columns (SC5 — agent-activity
          interpretation, NOT seq/ts/event). Auditor must NOT fail for absent seq/ts/event columns.
        - TableTab sort toggles on column header click; default Agent ID asc; keyboard-accessible (SC5).
        - TableTab empty state present (SC5).
        - WCAG AA confirmed for all TableTab cell/header token pairs per design spec (SC5).
        - TableTab has data-testid="table-tab" on root div.
        - e2e spec updated to assert real component testids (overview-tab, table-tab) (AUDIT_RISK).
        - npm run lint clean (SC9).
        - No raw hex values; types from @gander-studio/shared.
      </success_criteria>
      <context_files>
        packages/client/src/pages/sessions/SessionDetailPage.tsx  (from t5a — to see how stubs are wired)
        packages/client/src/store/session-store.ts  (from t4a)
        packages/shared/src/schemas.ts
        packages/client/src/globals.css
        packages/client/tests/e2e/prog-studio-sessions-2026-05-s2-list-edit-fe.spec.ts  (from t5a)
        .claude/agents/tasks/outputs/prog-studio-sessions-2026-05-s2-list-edit-t1-ui-design-*.md
      </context_files>
      <dependencies>t5a-detail-shell</dependencies>
      <out_of_scope>
        - Do NOT implement EditorTab content (t6b).
        - Do NOT implement the save mutation or useSessionSave hook (t6a).
        - Do NOT implement session.getRaw fetching (t6a).
        - Do NOT implement the Analyze tab component (S3).
        - Do NOT add seq/ts/event columns — the human-confirmed deliverable is agent-activity table.
        - Do NOT add Shadcn tabs/tooltip/toast.
        - Do NOT touch Browse/Compose/Edit/Export pages.
      </out_of_scope>
      <estimated_new_lines>~90 (OverviewTab.tsx ~35; TableTab.tsx ~50; e2e updates ~5)</estimated_new_lines>
      <output_expected>
        <tag>ui_packet</tag>
        <must_contain>
          <item>OverviewTab.tsx with all 8 frontmatter fields and stat row; data-testid="overview-tab"</item>
          <item>TableTab.tsx with 9 agent-activity columns; sortable; keyboard-nav; empty state; data-testid="table-tab"</item>
          <item>e2e spec updated to assert real overview-tab and table-tab testids</item>
          <item>npm run lint exit 0</item>
        </must_contain>
        <must_not_contain>
          <item>seq, ts, or event columns in TableTab (brief artifact — auditor must not fail for absence)</item>
          <item>EditorTab implementation (only stub allowed)</item>
          <item>Shadcn tabs primitive import</item>
          <item>Raw hex values</item>
        </must_not_contain>
        <success_signal>npm run lint clean; Overview and Table tabs render correct data in browser; sort works; WCAG AA confirmed</success_signal>
      </output_expected>
    </task_packet>

    <!-- ================================================================
         WAVE 4 — t6a + t6b — Editor + Save Flow — depends t5b
         t6a: hook layer (useSessionSave.ts + useSessionRaw.ts)
         t6b: EditorTab + e2e complete smoke
         Sequential: t6b depends on t6a
         ================================================================ -->

    <task_packet>
      <task_id>prog-studio-sessions-2026-05-s2-list-edit-t6a-editor-hooks</task_id>
      <assigned_to>frontend-engineer</assigned_to>
      <priority>HIGH</priority>
      <description>
        Implement the two editor hooks: useSessionSave (save mutation) and useSessionRaw (pre-fill hook).
        These are the data layer for the Editor tab. No UI component is implemented in this packet.

        SOURCE FILES TOUCHED (≤3 source files; both are new files):

        1. NEW file: packages/client/src/hooks/useSessionSave.ts
           Wraps trpc.session.saveEdit.useMutation().
             - On success (data): call
                 useSessionStore().setLastSaveResult({ filePath: data.filePath })
                 useSessionStore().setLastSaveError(null)
             - On error (err): call
                 useSessionStore().setLastSaveError(err.message or String(err))
                 DO NOT clear editBuffer — SC7 requirement.
           Returns the mutation object (at minimum: { mutate, isLoading }) per tRPC 11 useMutation shape.
           Import: import { trpc } from '../trpc'
           Import: import { useSessionStore } from '../store/session-store'

        2. NEW file: packages/client/src/hooks/useSessionRaw.ts
           Wraps trpc.session.getRaw.useQuery({ id }, { enabled: !!id }).
             - On data: call
                 useSessionStore().setOriginalContent(data.content)
                 if (store.editBuffer === '') useSessionStore().setEditBuffer(data.content)
               (Only sets editBuffer on first load when buffer is empty — does not overwrite user edits.)
           Returns { isLoading, error }.
           Import: import { trpc } from '../trpc'
           Import: import { useSessionStore } from '../store/session-store'

        Conventions:
        - No React JSX. No shadcn. No raw hex values. All functions typed.
        - session.saveEdit returns { success, filePath } (S1 contract); access result.filePath.
        - session.getRaw returns { content: string } (t2 contract); access data.content.
      </description>
      <success_criteria>
        - useSessionSave.ts exists; wraps session.saveEdit; on success sets lastSaveResult; on error sets lastSaveError WITHOUT clearing editBuffer (SC6, SC7).
        - useSessionRaw.ts exists; wraps session.getRaw with enabled: !!id; on data sets originalContent and (if buffer empty) editBuffer (SC6).
        - Both hooks import from '../trpc' and '../store/session-store' (no duplicate store creation).
        - npm run lint clean (SC9).
        - No React component JSX in either file.
        - No raw hex values.
      </success_criteria>
      <context_files>
        packages/client/src/trpc.ts
        packages/client/src/store/session-store.ts  (from t4a)
        packages/shared/src/schemas.ts
        packages/client/src/hooks/useSessions.ts  (pattern reference)
      </context_files>
      <dependencies>t5b-tabs-overview-table (ensures full stack is in place before adding editor hooks; also ensures session.getRaw is confirmed in t2 before hooks reference it)</dependencies>
      <out_of_scope>
        - Do NOT implement EditorTab component (t6b).
        - Do NOT modify SessionDetailPage.tsx or any existing component.
        - Do NOT implement useSessionDetail or useSessions modifications.
        - Do NOT run git commit.
      </out_of_scope>
      <estimated_new_lines>~45 (useSessionSave.ts ~20; useSessionRaw.ts ~25)</estimated_new_lines>
      <output_expected>
        <tag>ui_packet</tag>
        <must_contain>
          <item>useSessionSave.ts with success → setLastSaveResult, error → setLastSaveError (no buffer clear)</item>
          <item>useSessionRaw.ts with enabled: !!id; data → setOriginalContent + conditional setEditBuffer</item>
          <item>npm run lint exit 0</item>
        </must_contain>
        <must_not_contain>
          <item>React component JSX</item>
          <item>editBuffer cleared in the error handler</item>
          <item>Raw hex values</item>
          <item>Git commit commands</item>
        </must_not_contain>
        <success_signal>npm run lint clean; hook files exist with correct tRPC wiring</success_signal>
      </output_expected>
    </task_packet>

    <task_packet>
      <task_id>prog-studio-sessions-2026-05-s2-list-edit-t6b-editor-tab</task_id>
      <assigned_to>frontend-engineer</assigned_to>
      <priority>HIGH</priority>
      <description>
        Implement the EditorTab component (replace t5a editor stub) and complete the Playwright e2e
        smoke. This is the final FE packet.

        SOURCE FILES TOUCHED (≤3 source files; e2e spec is a co-located test deliverable):

        1. NEW/REPLACE file: packages/client/src/pages/sessions/tabs/EditorTab.tsx
           Props: { session: Session }
           - Calls useSessionRaw({ id: session.id }) on mount (from t6a) to pre-fill.
           - Reads editBuffer, originalContent, lastSaveResult, lastSaveError from useSessionStore().
           - Renders:
               * Read-only "Save target:" label:
                 Before any save: show "Save target: {session.id}.md" as a static affordance.
                 After a successful save: show "Saved to: {lastSaveResult.filePath}".
               * Shadcn Textarea primitive (packages/client/src/components/ui/textarea.tsx — this
                 primitive DOES exist) bound to editBuffer:
                   value={editBuffer}
                   onChange={(e) => { setEditBuffer(e.target.value); setLastSaveResult(null); }}
                 (setLastSaveResult(null) in onChange clears stale success state on next edit.)
               * "Save edit" button (primary):
                   data-testid="save-edit-button"
                   Disabled when editBuffer === originalContent (no changes) OR mutation in-flight.
                   onClick: useSessionSave().mutate({ id: session.id, content: editBuffer })
               * "Revert to original" button (secondary):
                   data-testid="revert-button"
                   Disabled when editBuffer === originalContent.
                   onClick: setEditBuffer(originalContent)
               * Inline success state: when lastSaveResult is set AND lastSaveError is null,
                 show a styled confirmation div: "Saved to: {lastSaveResult.filePath}"
                 (NOT a toast primitive — inline block only).
               * Inline error state: when lastSaveError is set, role="alert" showing error message.
                 editBuffer is NOT cleared on error (SC7 requirement — useSessionSave enforces this
                 in t6a; EditorTab must also NOT call setEditBuffer on error).
           - data-testid="editor-tab" on root div.

        Also verify the Analyze slot in SessionDetailPage (t5a deliverable):
        Confirm SESSION_TABS has { id: 'analyze', label: 'Analyze', placeholder: true } (already
        in constants/sessions.ts from t3a) and that SessionDetailPage renders the analyze tab as
        aria-disabled="true" with title="Coming in S3". If t5a left a gap, fix it here and note it.

        E2e spec completion (co-located test deliverable — extend the spec from t5b; preserve all
        prior assertions):
          File: packages/client/tests/e2e/prog-studio-sessions-2026-05-s2-list-edit-fe.spec.ts
          ADD:
            Test: "Editor tab pre-fills with original source markdown"
              - Navigate to sessions → detail → Editor tab.
              - Assert Textarea (or [data-testid="editor-tab"] textarea) has non-empty value.
            Test: "Save edit flow — success"
              - Navigate to sessions → detail → Editor tab.
              - Append a character to textarea content.
              - Click data-testid="save-edit-button".
              - Assert confirmation text containing "Saved to:" is visible with a path string.
            Test: "Save edit flow — revert to original"
              - Navigate to sessions → detail → Editor tab.
              - Modify textarea.
              - Click data-testid="revert-button".
              - Assert textarea value equals original content (pre-fill value before modification).
            Test: "Analyze tab is disabled"
              - Assert button with label "Analyze" has aria-disabled="true" AND title="Coming in S3".
            Test: "Existing pages smoke regression"
              - Navigate to Browse mode; assert data-testid="browse-page" (or equivalent) visible.
              - Navigate to Compose mode; assert compose page visible.
              - Navigate to Edit mode; assert edit page visible.
              - Navigate to Export mode; assert export page visible.
          (Precise selectors follow the established pattern in existing e2e specs.)

        Final lint: npm run lint must exit 0 across all three packages (SC9).
        Return completion_packet. DO NOT run git commit.

        Conventions:
        - Inline success/error only (no toast primitive).
        - Textarea: Shadcn Textarea from '../../../components/ui/textarea' (adjust path as needed).
        - No raw hex values. No Shadcn tabs/tooltip. Import Session from @gander-studio/shared.
      </description>
      <success_criteria>
        - useSessionRaw pre-fills editBuffer with original source markdown from session.getRaw (SC6).
        - EditorTab Textarea bound to editBuffer; onChange clears stale save result (SC6).
        - "Save edit" calls session.saveEdit; success shows inline "Saved to: {absolutePath}" (SC6, SC7).
        - Failed save: role="alert" with error message; editBuffer NOT cleared (SC7).
        - "Revert to original" restores originalContent into editBuffer (SC6).
        - Analyze tab slot: SESSION_TABS has { id: 'analyze', placeholder: true }; rendered as
          aria-disabled="true" with title="Coming in S3" in SessionDetailPage (SC8).
        - Playwright e2e spec covers: list loads, tab switching, no-remount DOM check, Editor pre-fill,
          save success, revert, Analyze disabled, smoke regression of existing pages (SC10, AUDIT_RISK).
        - npm run lint clean across all three packages (SC9).
        - Manual smoke step 4.5: list loads, tabs switch, save round-trips, no console errors (SC10).
        - No raw hex values; no client-side schema redefinitions; no Shadcn tabs/tooltip/toast.
        - No git commit performed.
      </success_criteria>
      <context_files>
        packages/client/src/pages/sessions/SessionDetailPage.tsx  (from t5a — for Analyze slot verify)
        packages/client/src/store/session-store.ts  (from t4a)
        packages/client/src/hooks/useSessionSave.ts  (from t6a)
        packages/client/src/hooks/useSessionRaw.ts  (from t6a)
        packages/client/src/components/ui/textarea.tsx
        packages/client/src/trpc.ts
        packages/shared/src/schemas.ts
        packages/client/tests/e2e/prog-studio-sessions-2026-05-s2-list-edit-fe.spec.ts  (from t5b)
        packages/client/src/constants/sessions.ts  (t3a SESSION_TABS)
        .claude/agents/tasks/outputs/prog-studio-sessions-2026-05-s2-list-edit-t1-ui-design-*.md
      </context_files>
      <dependencies>t6a-editor-hooks</dependencies>
      <out_of_scope>
        - Do NOT implement markdown preview (out of scope for S2).
        - Do NOT implement diff view.
        - Do NOT implement analysis visualization (S3).
        - Do NOT add Shadcn tabs/tooltip/toast primitives.
        - Do NOT redefine Session or any shared schema.
        - Do NOT modify Browse/Compose/Edit/Export pages.
        - Do NOT run git commit.
      </out_of_scope>
      <estimated_new_lines>~90 (EditorTab.tsx ~55; e2e additions ~35)</estimated_new_lines>
      <output_expected>
        <tag>ui_packet</tag>
        <must_contain>
          <item>EditorTab.tsx full implementation with Shadcn Textarea, Save, Revert, inline confirmation/error</item>
          <item>useSessionRaw pre-fill wiring (calls hook from t6a)</item>
          <item>data-testid="editor-tab", "save-edit-button", "revert-button" present</item>
          <item>Analyze slot confirmed disabled with title="Coming in S3"</item>
          <item>e2e spec with Editor pre-fill, save success, revert, Analyze disabled, smoke regression assertions</item>
          <item>npm run lint exit 0 across all three packages</item>
        </must_contain>
        <must_not_contain>
          <item>Shadcn toast or tooltip primitive import</item>
          <item>Markdown preview implementation</item>
          <item>Raw hex values</item>
          <item>Client-side schema redefinitions</item>
          <item>git commit/push commands</item>
          <item>editBuffer cleared in the error path</item>
        </must_not_contain>
        <success_signal>npm run lint clean; Editor pre-fills on open; save round-trips with absolute path shown; revert restores original; Analyze tab disabled; all existing pages load; Playwright e2e spec passes</success_signal>
      </output_expected>
    </task_packet>

  </task_packets>

  <dependency_order>
    Wave 0 (parallel):
      t1-ui-design   — no dependencies
      t2-be-raw      — no dependencies

    Wave 1 (sequential within wave):
      t3a-nav-state         — DEPENDS ON t1-ui-design, t2-be-raw
      t3b-router-scaffold   — DEPENDS ON t3a-nav-state

    Wave 2 (sequential within wave):
      t4a-data-layer  — DEPENDS ON t3b-router-scaffold
      t4b-list-page   — DEPENDS ON t4a-data-layer

    Wave 3 (sequential within wave):
      t5a-detail-shell          — DEPENDS ON t4b-list-page
      t5b-tabs-overview-table   — DEPENDS ON t5a-detail-shell

    Wave 4 (sequential within wave):
      t6a-editor-hooks — DEPENDS ON t5b-tabs-overview-table
      t6b-editor-tab   — DEPENDS ON t6a-editor-hooks

    Audit pipeline (foreground) after each implementing packet:
      audit(t2-be-raw) → commit →
      audit(t3a) → commit →
      audit(t3b) → commit →
      audit(t4a) → commit →
      audit(t4b) → commit →
      audit(t5a) → commit →
      audit(t5b) → commit →
      audit(t6a) → commit →
      audit(t6b) → commit

    Step 4.5 human verification: REQUIRED after t6b audit passes (SC10 cannot be satisfied
    without a human walking through the UI in a browser).

    Shared-file serialization (e2e spec):
      packages/client/tests/e2e/prog-studio-sessions-2026-05-s2-list-edit-fe.spec.ts
      Created by t4b (stub), extended by t5a (tab assertions), updated by t5b (real testids),
      completed by t6b (editor + smoke assertions). Serialization enforced by dependency chain.
      Each packet reads the current spec from disk before appending. No parallel writes.

    Source-file count lens (for auditor):
      The FE file-count rule counts SOURCE files only (≤3 per packet).
      The shared e2e spec (prog-studio-sessions-2026-05-s2-list-edit-fe.spec.ts) is a co-located
      test deliverable owned by the feature packet and is NOT counted as a 4th source file.
      Every FE packet in this plan touches ≤3 source files. This lens is stated explicitly for
      the auditor.
  </dependency_order>

  <routing_notes>

    <pm_preflight_acknowledgement pattern="OVERSCOPED">
      Rev1 resolves the BLOCKER. t4 (5 files) → t4a (2 files) + t4b (1 file); t5 (4 files) →
      t5a (1 file) + t5b (2 files); t6 (4 files) → t6a (2 files) + t6b (1 file). t3 (6 files)
      → t3a (3 files: ui-store, navigation, sessions.ts) + t3b (3 files: SessionsRouter, 2 stubs +
      ModeContent). Every FE packet is now ≤3 source files. Total packets: 10 (2 wave-0 + 2 wave-1
      + 2 wave-2 + 2 wave-3 + 2 wave-4). The ≤6-packet guideline was superseded per Critic
      authorization. Source-file lens stated explicitly in dependency_order for the auditor.
    </pm_preflight_acknowledgement>

    <pm_preflight_acknowledgement pattern="ASSUMPTION">
      BLOCKER 1 resolved: ModeContent uses PAGE_MAP zero-prop component-map (verified by reading
      the file). Adopted Option B: SessionsRouter.tsx (zero-prop, store-driven) owns the
      list/detail switch; PAGE_MAP gets `sessions: SessionsRouter`; SessionDetailPage reads
      selectedSessionId from store (zero-prop). No switch/case, no conditional escape hatch in
      ModeContent. WARNING 1 resolved: --ms confirmed nonexistent in globals.css; nav dot set to
      var(--mp) (#9b59b6, confirmed present at globals.css:29). WARNING 2 resolved: t2 mirrors
      session.get's inline readdir scan, NOT collectSessions; id-OR-sprint matching stated explicitly.
    </pm_preflight_acknowledgement>

    <pm_preflight_acknowledgement pattern="SCOPE_DRIFT">
      Every SC (SC1–SC10) is mapped to at least one packet as addressed or explicitly out-of-scope.
      SC8 (Analyze reserved slot): addressed in t3a (SESSION_TABS), t5a (tab bar disabled render +
      e2e), t6b (verification + e2e). SC7 (buffer preserved on failure): addressed in t6a (hook does
      not clear editBuffer) and t6b (EditorTab does not call setEditBuffer on error). SC5 (Table tab):
      human-confirmed as agent-activity table; seq/ts/event columns explicitly excluded with auditor
      note. No SC silently dropped.
    </pm_preflight_acknowledgement>

    <pm_preflight_acknowledgement pattern="VERBATIM_DELIVERABLE">
      Named deliverables explicitly encoded:
      (1) { id: "analyze", label: "Analyze", placeholder: true } — appears verbatim in t3a
          constants/sessions.ts spec and in t1/t5a/t6b success criteria by name.
      (2) "Save target" destination-path UI affordance — described verbatim in t6b EditorTab spec
          (read-only "Save target:" label surfacing destination).
    </pm_preflight_acknowledgement>

    <pm_preflight_acknowledgement pattern="AUDIT_RISK">
      Every interactive surface has named Playwright assertions in the spec:
        packages/client/tests/e2e/prog-studio-sessions-2026-05-s2-list-edit-fe.spec.ts
      t4b creates the spec stub (list page visible); t5a adds tab-switching + Analyze + no-remount
      DOM identity check; t5b updates testids to real components; t6b adds Editor pre-fill, save
      flow, revert, and smoke regression of existing pages. WARNING 4 resolved: no-remount check
      uses DOM/state identity (stable data-testid="sessions-detail-page" element persists across
      tab clicks + header text unchanged), NOT network-request counting.
    </pm_preflight_acknowledgement>

    <pm_preflight_acknowledgement pattern="DRY">
      Session types imported via z.infer from @gander-studio/shared in all FE packets — never
      redefined client-side (cross-sprint invariant 1). Hook pattern mirrors useBrowseData.ts.
      Store pattern mirrors browse-store.ts. Existing trpc client imported from '../trpc' — no new
      client instantiation. Tab labels + "Coming in S3" association live ONLY in
      constants/sessions.ts (single source of truth per t3a).
    </pm_preflight_acknowledgement>

    REQVAL flag — SC5 Table tab column wording:
      The sprint brief SC5 verbatim ("sort by seq, ts, agent, event") is a brief-level wording
      artifact from an event-log framing. The HUMAN-CONFIRMED authoritative deliverable is the
      agent-activity table with columns: Agent ID, Spawns, Completes, Feedback Loops, Critique
      Passes, Critique Blocks, Audit Passes, Audit Fails, Wall Clock (ms). The auditor MUST NOT
      fail t5b for absent seq/ts/event columns. Event-log table is explicitly NOT built this sprint.
      This flag must be surfaced in the REQVAL packet for the auditor's pre-audit briefing.

    DESIGN.md status: ABSENT at packages/client/ — FE and UI Designer operate on inferred tokens
    (globals.css CSS custom properties). UI Designer must set design_system_source: INFERRED.

    Store file naming: session-store.ts (kebab-case). Any agent output returning "sessionStore.ts"
    is a naming violation — return to agent for correction before routing to auditor.

    Pages structure: deliberate deviation — pages/sessions/ nested subdir (not flat). Justified by
    multi-surface mode. Documented in t1 and t3b.

    List envelope asymmetry: session.list → .sessions unwrap required; session.get/getStats → bare.
    Auditor must verify useSessions.ts unwraps only the list result.

    AppMode state machine: t3a edits ui-store.ts (AppMode union) + navigation.ts (NAV_ITEMS) +
    creates constants/sessions.ts. t3b adds SessionsRouter to PAGE_MAP in ModeContent. All call
    sites that read/write AppMode are enumerated across t3a + t3b.

    Prior sprint prior_approved_tasks: t5a adds to the e2e spec created by t4b; t5b updates testids;
    t6b completes it. Auditors for t5a/t5b/t6b must not flag prior-wave e2e assertions as
    out-of-scope modifications.

    e2e spec naming: prog-studio-sessions-2026-05-s2-list-edit-fe.spec.ts (WARNING 5 resolved —
    uses the established -fe.spec.ts suffix). All packet references use this path.

    Foreground dispatch required (FE work — human step 4.5 verification mandatory after t6b audit).

    Recurring patterns from post-mortems:
    - gander-studio-p2-agent-cards §6 G1 (4+-file FE OVERSCOPED): explicitly resolved via packet
      splits. All FE packets ≤3 source files.
    - S1 post-mortem §6 "BE ran git commit inline": t2 packet explicitly prohibits git commit.
    - S1 post-mortem §6 "Plan named codebase-facts without on-disk verification" (ModeContent,
      --ms token): both resolved by reading the actual files before writing rev1.

    <recurring_pattern source="prog-studio-sessions-2026-05-s1-backend.md">
      BE inline commit: addressed — t2-be-raw packet explicitly directs BE to return completion_packet
      only and not run git add/commit.
    </recurring_pattern>
    <recurring_pattern source="prog-studio-sessions-2026-05-s1-backend.md">
      Plan named codebase facts without on-disk verification: addressed — ModeContent.tsx read before
      writing rev1; PAGE_MAP pattern confirmed. globals.css read; --ms confirmed absent; --mp confirmed
      present at line 29.
    </recurring_pattern>
    <recurring_pattern source="gander-studio-p4-proximity-edge-hardening.md">
      PM same-file fix propagation (§6 G2): addressed — the ModeContent fix applies to the single
      PAGE_MAP declaration (confirmed only one call site in the file). The e2e spec append
      serialization is enforced by the full dependency chain.
    </recurring_pattern>

  </routing_notes>

  <risk_flags>
    <critical_seam_finding>
      The S1 SessionSchema has no raw body field and session.get returns a parsed object only. SC6
      requires Editor pre-fill and revert-to-original. Resolution chosen: ADD session.getRaw tRPC
      procedure (t2-be-raw, Wave 0, BLOCKER priority) that accepts { id: string } and returns
      { content: string } by reading session.filePath (always the original source, NEVER editedFilePath).
      Implementation: mirror session.get's inline readdir scan with id-OR-sprint matching. The BE
      packet is Wave 0 (parallel with UI design) so it does not delay the FE waves.
    </critical_seam_finding>

    <risk id="MODECONTENT_ZERO_PROP_INVARIANT">
      ModeContent.tsx PAGE_MAP must remain a pure zero-prop component-map. SessionsRouter is the
      approved mechanism. If any FE agent adds a conditional escape hatch inside ModeContent or
      adds an id prop to SessionDetailPage, it is an architecture violation. Auditor must verify:
      (1) ModeContent has no new conditional logic after t3b;
      (2) SessionDetailPage.tsx has no id prop in t5a or subsequent packets.
    </risk>

    <risk id="DESIGN_MD_ABSENT">
      No DESIGN.md found at packages/client/. FE and UI Designer operate on inferred tokens from
      globals.css. Recommend generating DESIGN.md before the next sprint. For this sprint, UI
      Designer must set design_system_source: INFERRED and flag the absence in notes.
    </risk>

    <risk id="SESSIONS_EDITS_DIR_CLIENT_UNKNOWN">
      The client has no way to know the absolute SESSIONS_EDITS_DIR path before a save completes.
      The t6b EditorTab spec surfaces a static "Save target: {session.id}.md" affordance before
      save, then shows the actual returned filePath after a successful save. The auditor should
      verify the post-save path display uses the server-returned path, not a client-constructed one.
    </risk>

    <risk id="NO_TABS_PRIMITIVE">
      No Shadcn tabs/tooltip/toast primitives exist. All FE packets directed to build from
      role="tablist"/"tab"/"tabpanel" + conditional render. Auditor must verify no @radix-ui/react-tabs
      or sonner import is added to package.json.
    </risk>

    <risk id="LIST_ENVELOPE_ASYMMETRY">
      session.list returns { sessions, skipped } (envelope); session.get/getStats return bare objects.
      This asymmetry is a common source of runtime bugs. Auditor must verify that useSessions.ts
      unwraps .sessions on the list query and does NOT attempt .sessions on get/getStats.
    </risk>

    <risk id="APPMODE_STATE_MACHINE">
      Adding 'sessions' to AppMode requires synchronized edits to ui-store.ts AND navigation.ts
      (t3a) AND PAGE_MAP in ModeContent (t3b). Auditor must verify all three are updated — a partial
      update (e.g., AppMode updated but ModeContent not wired) would cause a TypeScript error caught
      by lint.
    </risk>

    <risk id="SESSION_STORE_STUB_REPLACEMENT">
      t3b may create a minimal session-store.ts stub to allow tsc to pass. t4a replaces this stub
      with the full implementation. Auditor for t4a must verify the stub is fully replaced (not
      partially updated). If the stub was not created in t3b (because t3b and t4a are audited in
      sequence before commit), this risk is moot.
    </risk>

    <risk id="SC5_COLUMN_WORDING_ARTIFACT">
      SC5 sprint brief wording ("sort by seq, ts, agent, event") conflicts with the human-confirmed
      deliverable (agent-activity table). REQVAL must brief the auditor before t5b audit: auditor
      must NOT fail for absent seq/ts/event columns. The 9 agent-activity columns are the
      authoritative deliverable.
    </risk>
  </risk_flags>

</task_decomposition>

---

## Verbatim Deliverable Audit

<verbatim_deliverable_audit>

  <phrase text="top-level 'Sessions' mode">
    <addressed task="t3a-nav-state"/>
    <addressed task="t3b-router-scaffold"/>
  </phrase>

  <phrase text="list page">
    <addressed task="t4b-list-page"/>
  </phrase>

  <phrase text="detail page with tabs">
    <addressed task="t5a-detail-shell"/>
  </phrase>

  <phrase text="Overview tab">
    <addressed task="t5b-tabs-overview-table"/>
  </phrase>

  <phrase text="Table tab (AGENT-ACTIVITY, human confirmed)">
    <addressed task="t5b-tabs-overview-table"/>
  </phrase>

  <phrase text="Editor tab">
    <addressed task="t6b-editor-tab"/>
  </phrase>

  <phrase text="reserved disabled 'Analyze' slot for S3">
    <addressed task="t3a-nav-state"/>
    <addressed task="t5a-detail-shell"/>
    <addressed task="t6b-editor-tab"/>
  </phrase>

  <phrase text="save-to-new-folder markdown editor">
    <addressed task="t6a-editor-hooks"/>
    <addressed task="t6b-editor-tab"/>
  </phrase>

  <phrase text="purely additive — existing Browse/Compose/Edit/Export pages unchanged">
    <addressed task="t3a-nav-state"/>
    <addressed task="t3b-router-scaffold"/>
    <addressed task="t4a-data-layer"/>
    <addressed task="t4b-list-page"/>
    <addressed task="t5a-detail-shell"/>
    <addressed task="t5b-tabs-overview-table"/>
    <addressed task="t6a-editor-hooks"/>
    <addressed task="t6b-editor-tab"/>
  </phrase>

  <phrase text="SC1 Nav mode registered">
    <addressed task="t3a-nav-state"/>
  </phrase>

  <phrase text="SC2 List loads (session.list; sprint slug, date, status, gap_classes; empty + error)">
    <addressed task="t4a-data-layer"/>
    <addressed task="t4b-list-page"/>
  </phrase>

  <phrase text="SC3 Detail loads (session.get; tab nav without remounting)">
    <addressed task="t5a-detail-shell"/>
  </phrase>

  <phrase text="SC4 Overview tab (frontmatter + top-line summary; Mako Teal tokens)">
    <addressed task="t5b-tabs-overview-table"/>
  </phrase>

  <phrase text="SC5 Table tab (agent-activity sortable HTML table; keyboard-navigable; WCAG AA)">
    <addressed task="t5b-tabs-overview-table"/>
  </phrase>

  <phrase text="SC6 Editor tab (Textarea; save; pre-fill; revert-to-original)">
    <addressed task="t6a-editor-hooks"/>
    <addressed task="t6b-editor-tab"/>
  </phrase>

  <phrase text="SC7 Save flow (inline confirmation with path; failure surfaces error; buffer not lost)">
    <addressed task="t6a-editor-hooks"/>
    <addressed task="t6b-editor-tab"/>
  </phrase>

  <phrase text="SC8 Analyze slot reserved (disabled; title 'Coming in S3'; S3 flips placeholder)">
    <addressed task="t3a-nav-state"/>
    <addressed task="t5a-detail-shell"/>
    <addressed task="t6b-editor-tab"/>
  </phrase>

  <phrase text="SC9 Lint + type clean">
    <addressed task="t3a-nav-state"/>
    <addressed task="t3b-router-scaffold"/>
    <addressed task="t4a-data-layer"/>
    <addressed task="t4b-list-page"/>
    <addressed task="t5a-detail-shell"/>
    <addressed task="t5b-tabs-overview-table"/>
    <addressed task="t6a-editor-hooks"/>
    <addressed task="t6b-editor-tab"/>
  </phrase>

  <phrase text="SC10 Manual smoke (Step 4.5)">
    <addressed task="t6b-editor-tab"/>
  </phrase>

  <phrase text="session.getRaw precursor BE procedure (critical seam finding)">
    <addressed task="t2-be-raw"/>
  </phrase>

  <phrase text="UI design spec first">
    <addressed task="t1-ui-design"/>
  </phrase>

  <phrase text="session-store.ts (kebab-case; not sessionStore.ts)">
    <addressed task="t4a-data-layer"/>
  </phrase>

  <phrase text="constants/sessions.ts (new home for tab definitions)">
    <addressed task="t3a-nav-state"/>
  </phrase>

  <phrase text="SessionsRouter.tsx (zero-prop PAGE_MAP wrapper — Option B)">
    <addressed task="t3b-router-scaffold"/>
  </phrase>

  <phrase text="useSessions.ts data hook">
    <addressed task="t4a-data-layer"/>
  </phrase>

  <phrase text="useSessionSave.ts mutation hook">
    <addressed task="t6a-editor-hooks"/>
  </phrase>

  <phrase text="useSessionRaw.ts pre-fill hook">
    <addressed task="t6a-editor-hooks"/>
  </phrase>

  <phrase text="pages/sessions/ nested subdir (deliberate convention deviation)">
    <addressed task="t3b-router-scaffold"/>
  </phrase>

  <phrase text="Playwright e2e spec at tests/e2e/prog-studio-sessions-2026-05-s2-list-edit-fe.spec.ts">
    <addressed task="t4b-list-page"/>
    <addressed task="t5a-detail-shell"/>
    <addressed task="t5b-tabs-overview-table"/>
    <addressed task="t6b-editor-tab"/>
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

  <phrase text="OUT OF SCOPE: event-log table (seq/ts/event columns)">
    <out_of_scope reason="Human confirmed: Table tab = agent-activity table. Event-log table is not built this sprint. SC5 wording artifact flagged via REQVAL."/>
  </phrase>

</verbatim_deliverable_audit>

---

## Expectation Manifest

<expectation_manifest>
  <sprint_id>prog-studio-sessions-2026-05-s2-list-edit</sprint_id>
  <generated>2026-05-20T20:00:00Z</generated>
  <assignments>

    <assignment>
      <task_id>prog-studio-sessions-2026-05-s2-list-edit-t1-ui-design</task_id>
      <agent>UI#1</agent>
      <expected_tag>design_spec</expected_tag>
      <expected_file>.claude/agents/tasks/outputs/prog-studio-sessions-2026-05-s2-list-edit-t1-ui-design-UI-*.md</expected_file>
      <blocks>t3a-nav-state</blocks>
      <receipt_check>
        <item>All three surfaces (List, Detail shell, 4 tab interiors) present</item>
        <item>contrast_pairs block with WCAG AA verification</item>
        <item>No raw hex values</item>
        <item>Analyze slot declaration { id: "analyze", label: "Analyze", placeholder: true } verbatim</item>
        <item>design_system_source: INFERRED declared</item>
        <item>No Shadcn tabs/tooltip/toast cited</item>
        <item>dashboard-patterns.md cited by name</item>
        <item>Session store file named session-store.ts (not sessionStore.ts)</item>
        <item>--ms NOT referenced; Sessions nav dot = var(--mp)</item>
        <item>Table tab = agent-activity table (9 columns); no seq/ts/event columns specified</item>
        <item>Architecture note: SessionsRouter zero-prop; SessionDetailPage reads id from store</item>
      </receipt_check>
    </assignment>

    <assignment>
      <task_id>prog-studio-sessions-2026-05-s2-list-edit-t2-be-raw</task_id>
      <agent>BE#1</agent>
      <expected_tag>completion_packet</expected_tag>
      <expected_file>.claude/agents/tasks/outputs/prog-studio-sessions-2026-05-s2-list-edit-t2-be-raw-BE-*.md</expected_file>
      <blocks>t3a-nav-state</blocks>
      <receipt_check>
        <item>session.getRaw procedure present in router.ts using inline readdir scan (NOT collectSessions)</item>
        <item>id-OR-sprint matching logic present</item>
        <item>SessionRawOutputSchema exported from packages/shared/src/schemas.ts</item>
        <item>Reads filePath (original source), not editedFilePath</item>
        <item>Client input is id only (no filePath)</item>
        <item>npm run lint exit 0 confirmed</item>
        <item>No git commit performed</item>
      </receipt_check>
    </assignment>

    <assignment>
      <task_id>prog-studio-sessions-2026-05-s2-list-edit-t3a-nav-state</task_id>
      <agent>FE#1</agent>
      <expected_tag>ui_packet</expected_tag>
      <expected_file>.claude/agents/tasks/outputs/prog-studio-sessions-2026-05-s2-list-edit-t3a-nav-state-FE-*.md</expected_file>
      <blocks>t3b-router-scaffold</blocks>
      <receipt_check>
        <item>AppMode union in ui-store.ts includes 'sessions'</item>
        <item>NAV_ITEMS in navigation.ts includes sessions entry with dotColor: 'var(--mp)' (NOT --ms)</item>
        <item>constants/sessions.ts exists with SESSION_TABS (analyze has placeholder: true)</item>
        <item>npm run lint exit 0</item>
        <item>No raw hex values</item>
        <item>No .tsx component files created (those are t3b)</item>
      </receipt_check>
    </assignment>

    <assignment>
      <task_id>prog-studio-sessions-2026-05-s2-list-edit-t3b-router-scaffold</task_id>
      <agent>FE#2</agent>
      <expected_tag>ui_packet</expected_tag>
      <expected_file>.claude/agents/tasks/outputs/prog-studio-sessions-2026-05-s2-list-edit-t3b-router-scaffold-FE-*.md</expected_file>
      <blocks>t4a-data-layer</blocks>
      <receipt_check>
        <item>SessionsRouter.tsx exists; is zero-prop; reads selectedSessionId from store</item>
        <item>pages/sessions/SessionListPage.tsx stub with data-testid="sessions-list-page"</item>
        <item>pages/sessions/SessionDetailPage.tsx stub with data-testid="sessions-detail-page"; zero-prop (NO id prop)</item>
        <item>ModeContent.tsx PAGE_MAP has sessions: SessionsRouter; all other entries byte-identical</item>
        <item>No conditional escape hatch inside ModeContent</item>
        <item>npm run lint exit 0</item>
        <item>No raw hex values</item>
      </receipt_check>
    </assignment>

    <assignment>
      <task_id>prog-studio-sessions-2026-05-s2-list-edit-t4a-data-layer</task_id>
      <agent>FE#3</agent>
      <expected_tag>ui_packet</expected_tag>
      <expected_file>.claude/agents/tasks/outputs/prog-studio-sessions-2026-05-s2-list-edit-t4a-data-layer-FE-*.md</expected_file>
      <blocks>t4b-list-page</blocks>
      <receipt_check>
        <item>session-store.ts (kebab-case) present with editBuffer, originalContent, lastSaveResult, lastSaveError and all setters</item>
        <item>useSessions.ts present; list query unwraps .sessions; useSessionDetail wraps bare get (no .sessions unwrap)</item>
        <item>Session type from @gander-studio/shared (not redefined)</item>
        <item>npm run lint exit 0</item>
        <item>No sessionStore.ts (wrong casing)</item>
        <item>No React component JSX</item>
      </receipt_check>
    </assignment>

    <assignment>
      <task_id>prog-studio-sessions-2026-05-s2-list-edit-t4b-list-page</task_id>
      <agent>FE#4</agent>
      <expected_tag>ui_packet</expected_tag>
      <expected_file>.claude/agents/tasks/outputs/prog-studio-sessions-2026-05-s2-list-edit-t4b-list-page-FE-*.md</expected_file>
      <blocks>t5a-detail-shell</blocks>
      <receipt_check>
        <item>SessionListPage.tsx full impl (not stub); renders sprint, date, status, gap_classes per row</item>
        <item>Loading/empty/error states with correct aria roles</item>
        <item>Row click calls setSelectedSessionId; SessionsRouter routes to detail via store (not ModeContent prop)</item>
        <item>e2e spec created at packages/client/tests/e2e/prog-studio-sessions-2026-05-s2-list-edit-fe.spec.ts</item>
        <item>npm run lint exit 0</item>
        <item>No sessionStore.ts; no client-side schema redefinition</item>
      </receipt_check>
    </assignment>

    <assignment>
      <task_id>prog-studio-sessions-2026-05-s2-list-edit-t5a-detail-shell</task_id>
      <agent>FE#5</agent>
      <expected_tag>ui_packet</expected_tag>
      <expected_file>.claude/agents/tasks/outputs/prog-studio-sessions-2026-05-s2-list-edit-t5a-detail-shell-FE-*.md</expected_file>
      <blocks>t5b-tabs-overview-table</blocks>
      <receipt_check>
        <item>SessionDetailPage.tsx is zero-prop (NO id prop); reads selectedSessionId from store</item>
        <item>Tab bar uses role="tablist"/"tab"/"tabpanel" (no Shadcn tabs)</item>
        <item>Analyze tab has aria-disabled="true" AND title="Coming in S3"</item>
        <item>e2e: row-click→detail; tab clicks; Analyze slot; no-remount DOM identity check (NOT network counting)</item>
        <item>npm run lint exit 0</item>
        <item>No OverviewTab/TableTab implementation (only stubs)</item>
      </receipt_check>
    </assignment>

    <assignment>
      <task_id>prog-studio-sessions-2026-05-s2-list-edit-t5b-tabs-overview-table</task_id>
      <agent>FE#6</agent>
      <expected_tag>ui_packet</expected_tag>
      <expected_file>.claude/agents/tasks/outputs/prog-studio-sessions-2026-05-s2-list-edit-t5b-tabs-overview-table-FE-*.md</expected_file>
      <blocks>t6a-editor-hooks</blocks>
      <receipt_check>
        <item>OverviewTab.tsx with all 8 frontmatter fields and stat row; data-testid="overview-tab"</item>
        <item>TableTab.tsx with 9 agent-activity columns (NOT seq/ts/event); sortable; keyboard nav; empty state; data-testid="table-tab"</item>
        <item>WCAG AA confirmed per design spec</item>
        <item>e2e spec updated to assert real overview-tab and table-tab testids</item>
        <item>npm run lint exit 0</item>
        <item>No seq/ts/event columns in TableTab</item>
      </receipt_check>
    </assignment>

    <assignment>
      <task_id>prog-studio-sessions-2026-05-s2-list-edit-t6a-editor-hooks</task_id>
      <agent>FE#7</agent>
      <expected_tag>ui_packet</expected_tag>
      <expected_file>.claude/agents/tasks/outputs/prog-studio-sessions-2026-05-s2-list-edit-t6a-editor-hooks-FE-*.md</expected_file>
      <blocks>t6b-editor-tab</blocks>
      <receipt_check>
        <item>useSessionSave.ts: success→setLastSaveResult; error→setLastSaveError WITHOUT clearing editBuffer</item>
        <item>useSessionRaw.ts: enabled: !!id; data→setOriginalContent + conditional setEditBuffer</item>
        <item>npm run lint exit 0</item>
        <item>No React component JSX in either hook file</item>
        <item>No git commit</item>
      </receipt_check>
    </assignment>

    <assignment>
      <task_id>prog-studio-sessions-2026-05-s2-list-edit-t6b-editor-tab</task_id>
      <agent>FE#8</agent>
      <expected_tag>ui_packet</expected_tag>
      <expected_file>.claude/agents/tasks/outputs/prog-studio-sessions-2026-05-s2-list-edit-t6b-editor-tab-FE-*.md</expected_file>
      <blocks>NONE (final packet; unblocks human step 4.5)</blocks>
      <receipt_check>
        <item>EditorTab.tsx: Shadcn Textarea bound to editBuffer; Save + Revert buttons with correct testids</item>
        <item>useSessionRaw pre-fill wiring present</item>
        <item>Failed save: editBuffer NOT cleared; role="alert" error shown</item>
        <item>Inline success (no toast): "Saved to: {path}" shown after save</item>
        <item>Analyze slot confirmed disabled with title="Coming in S3"</item>
        <item>e2e spec complete: Editor pre-fill, save success, revert, Analyze disabled, smoke regression</item>
        <item>npm run lint clean across all three packages</item>
        <item>No toast primitive import; no raw hex values; no schema redefinitions; no git commit</item>
      </receipt_check>
    </assignment>

  </assignments>
</expectation_manifest>
