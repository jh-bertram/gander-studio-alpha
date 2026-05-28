<plan_critique>
  <plan_id>prog-studio-sessions-2026-05-s2-list-edit</plan_id>
  <status>BLOCK</status>

  <challenges>

    <challenge>
      <type>ASSUMPTION</type>
      <severity>BLOCKER</severity>
      <task_ref>t3-nav-scaffold (and t4-list-page)</task_ref>
      <description>
        The plan asserts a codebase-fact about ModeContent's dispatch mechanism that is FALSE on disk.
        `packages/client/src/components/ModeContent.tsx:7-12` does NOT use a switch/case. It uses a
        component-map object lookup:
            const PAGE_MAP = { browse: BrowsePage, compose: ComposePage, edit: EditPage, export: ExportPage } as const;
            const ActivePage = PAGE_MAP[activeMode];
            return (<main ...><ActivePage /></main>);
        The active page is rendered as `<ActivePage />` with NO props.

        Two packets are written against the non-existent switch:
        - t3 (line 256): "Add case 'sessions': render <SessionListPage /> (import from pages/sessions/SessionListPage)."
          There is no case to add. The correct edit is to add `sessions: SessionListPage` to PAGE_MAP — but see next point, that alone cannot satisfy t4.
        - t4 (lines 363-376): requires ModeContent to branch on selectedSessionId and render
          `<SessionDetailPage id={selectedSessionId} />` (a PROPPED component). The current PAGE_MAP
          mechanism renders zero-prop components keyed by mode string. A static `Record<AppMode, ComponentType>`
          map physically cannot (a) read `selectedSessionId` from a store, nor (b) pass an `id` prop.
          As written, t4's instruction to "add that logic to ModeContent" is incompatible with the live structure.

        This is exactly the S1 post-mortem §6 failure mode "Plan named [a fact] by assumption without
        on-disk verification" — the PM's own routing_notes declare this pattern N/A, yet the plan asserts
        an unverified dispatch mechanism for the central routing component the whole sprint hinges on.
        An FE agent following t3/t4 verbatim will either be blocked or improvise an incompatible refactor.
      </description>
      <required_revision>
        Pick ONE resolution and encode it explicitly so t3 and t4 agree on the same mechanism:
        Option A (recommended — smallest blast radius): t3 adds `sessions: SessionListPage` to PAGE_MAP
        for the list-only path; t4 then refactors ModeContent's `sessions` branch out of the pure PAGE_MAP
        lookup into a conditional (e.g. `if (activeMode === 'sessions') return selectedSessionId ? <SessionDetailPage id={selectedSessionId}/> : <SessionListPage/>` before the PAGE_MAP fallback), reading
        selectedSessionId from useSessionStore. Name the actual mechanism (PAGE_MAP + conditional escape hatch),
        not "add a case".
        Option B: introduce a dedicated SessionsRouter component that owns the list/detail switch internally,
        and PAGE_MAP maps `sessions: SessionsRouter` (zero-prop, store-driven). This keeps ModeContent's
        PAGE_MAP shape intact and confines the selectedSessionId branch to one new file.
        Either way: correct the t3 instruction (line 256) away from "add case 'sessions'" and make t4's
        ModeContent edit consistent with whichever mechanism is chosen. State that PAGE_MAP renders zero-prop
        components so the FE agent knows the constraint up front.
      </required_revision>
    </challenge>

    <challenge>
      <type>OVERSCOPED</type>
      <severity>BLOCKER</severity>
      <task_ref>t4-list-page, t5-detail-shell, t6-editor-save (and t3-nav-scaffold)</task_ref>
      <description>
        The mandatory FE file-count split rule (BLOCKER, no exception): any single FE task touching 4+
        distinct files is OVERSCOPED regardless of per-file line count. The PM's justifications for t4/t5/t6
        are precisely the "changes are small per file / cohesive unit" argument the rule explicitly rejects.
        File counts on disk:
        - t4: session-store.ts (new) + useSessions.ts (new) + SessionListPage.tsx (replace) +
          ModeContent.tsx (modify) + e2e spec (new) = 5 distinct files.
        - t5: SessionDetailPage.tsx (replace) + OverviewTab.tsx (new) + TableTab.tsx (new) + e2e spec (modify) = 4 files.
        - t6: useSessionSave.ts (new) + useSessionRaw.ts (new) + EditorTab.tsx (replace) + e2e spec (modify) = 4 files.
        - t3: ui-store.ts + navigation.ts + constants/sessions.ts + 2 stubs + ModeContent.tsx = 6 files
          (mitigated: all edits are 1-line or trivial stubs; raised here for completeness, but the strongest
          cases are t4/t5/t6 which combine 4+ files with substantive logic in each).
        This is the recurring pattern documented in `gander-studio-p2-agent-cards` §5+§6 G1 (PM packed
        4 files into one FE task; recurred from canvas-link C2). The deterministic threshold exists because
        file-count is the signal that the turn crosses too many cognitive contexts.
      </description>
      <required_revision>
        Split along the natural file-boundary seams the PM already identified, so no FE packet exceeds 3
        substantive files (the shared e2e spec, being a single appended test artifact serialized by the
        dependency chain, may be treated as a co-located test deliverable of whichever packet owns the
        feature under test rather than a 4th cognitive context — but every packet must still stay <=3
        SOURCE files plus its own spec slice):
        - t4 -> split into t4a (session-store.ts + useSessions.ts: the state-machine/data layer) and
          t4b (SessionListPage.tsx + ModeContent.tsx wiring + e2e list assertion). t4b depends on t4a.
        - t5 -> split into t5a (SessionDetailPage.tsx shell + tab bar + e2e tab-switch/Analyze assertions)
          and t5b (OverviewTab.tsx + TableTab.tsx). t5b depends on t5a (panels need the shell to mount).
        - t6 -> split into t6a (useSessionSave.ts + useSessionRaw.ts) and t6b (EditorTab.tsx + e2e
          editor/save/revert/smoke assertions). t6b depends on t6a.
        If the orchestrator's >=6-packet cap forbids the resulting packet count, escalate the cap to the
        human rather than packing 4+ files per FE turn — do not silently keep the merged form.
        (If the team's deterministic rule is intended to count source files only and exempt the shared
        spec, state that exemption explicitly in the revised plan so the auditor applies the same lens;
        absent that statement, each of t4/t5/t6 trips the 4-file BLOCKER as written.)
      </required_revision>
    </challenge>

    <challenge>
      <type>ASSUMPTION</type>
      <severity>WARNING</severity>
      <task_ref>t1-ui-design, t3-nav-scaffold</task_ref>
      <description>
        The `--ms` token does not exist in globals.css. The available Mako accent tokens are
        --mt (#5499b5), --mg, --my, --mb, --mp, --mr, --mo (globals.css:9, 25-30). t3 (line 224-228)
        gives the PRIMARY instruction `dotColor: 'var(--ms)'` with --mt only as a "fallback". t1
        (line 48) also lists `--ms` among tokens the designer may reference. Because --ms is undefined,
        `var(--ms)` resolves to the CSS initial value (transparent) for the nav dot — a silent visual
        defect. The "fallback to --mt" wording saves the plan from a hard failure but the primary
        instruction is an invented token.
      </description>
      <required_revision>
        Change the t3 primary instruction to a real token (recommend `var(--mt)` to match Browse, or
        `var(--mp)`/`var(--mo)` for a distinct Sessions dot color). Remove `--ms` from the t1 token list.
        Do not phrase it as "use --ms if it exists" — it does not; name the chosen real token.
      </required_revision>
    </challenge>

    <challenge>
      <type>ASSUMPTION</type>
      <severity>WARNING</severity>
      <task_ref>t2-be-raw</task_ref>
      <description>
        t2 (lines 132-135) instructs BE to "reuse the same source-dir scan + composite-key lookup as
        session.get (reuse collectSessions from session-list.ts; match by id OR sprint, same as session.get)."
        This conflates two distinct code paths. On disk: session.get (router.ts:422-447) does NOT call
        collectSessions and does NOT use composite-key dedup — it runs its own inline readdir loop and
        returns on the FIRST file whose parsed session matches `id === input.id || sprint === input.id`.
        collectSessions (session-list.ts:20-77) is the LIST path with composite-key + filePath dedup and
        date-sort. They are not "the same". An agent told to "reuse collectSessions ... same as session.get"
        gets contradictory guidance: collectSessions returns a sorted/deduped array, not a single match,
        and would require re-finding the target by id afterward.
      </description>
      <required_revision>
        Pick one and state it cleanly: (A) mirror session.get's inline scan loop verbatim (returns on first
        id/sprint match, throws NOT_FOUND otherwise) then read its filePath — this is the closest analog and
        the lowest-risk; or (B) call collectSessions then `.find(s => s.id === id || s.sprint === id)` and
        read that match's filePath. Do not describe these as the same path. Note that getRaw must apply the
        SAME id-OR-sprint matching semantics as session.get so the client's `id` works identically across
        get and getRaw.
      </required_revision>
    </challenge>

    <challenge>
      <type>AUDIT_RISK</type>
      <severity>WARNING</severity>
      <task_ref>t5-detail-shell</task_ref>
      <description>
        SC5 verbatim (sprint brief line 76; ORC brief line 109) reads: "Renders parsed agent activity as a
        sortable HTML table (sort by seq, ts, agent, event)." The columns "seq", "ts", and "event" are
        EventLogEntry fields (EventLogEntrySchema), NOT AgentActivity fields. The plan's TableTab (t5,
        lines 486-497) correctly renders `session.agents` (AgentActivity[]) with columns Agent ID / Spawns /
        Completes / Feedback Loops / etc. — there are no seq/ts/event columns because AgentActivitySchema
        has none. The plan follows the dominant intent ("agent activity table", which matches the sprint
        Goal line 18 and SC4), but a literal-minded auditor reading SC5's "sort by seq/ts/event" could FAIL
        the packet for missing those columns.
      </description>
      <required_revision>
        Add a note to the t5 packet (and flag for the auditor via REQVAL) that SC5's "seq/ts/agent/event"
        phrasing is a brief-level wording artifact carried from an event-log framing; the authoritative
        deliverable is the AgentActivity sortable table (Agent ID / Spawns / Completes / Feedback Loops /
        Critique Passes / Critique Blocks / Audit Passes / Audit Fails / Wall Clock). Confirm with the human
        whether per-event seq/ts sorting is also wanted; if not, record SC5 as satisfied by the agent-activity
        table so the auditor does not FAIL on absent seq/ts/event columns.
      </required_revision>
    </challenge>

    <challenge>
      <type>AUDIT_RISK</type>
      <severity>WARNING</severity>
      <task_ref>t5-detail-shell</task_ref>
      <description>
        t5 (lines 505-507) verifies SC3's "tab switching does not remount the data fetch" by asserting
        "session.get called only once" via Playwright network-request counting. Network-count assertions
        against a tRPC/react-query client are brittle: react-query may refetch on window focus, the batch
        link may coalesce requests, and the assertion couples the test to transport behavior rather than the
        actual requirement (component not remounting). This risks a flaky or false-negative gate.
      </description>
      <required_revision>
        Assert the no-remount requirement via a DOM/state signal rather than network count: e.g. set a
        value in a mounted-only ref/testid (a stable element identity that would change on remount), or
        assert that switching Overview -> Table -> Overview preserves a piece of in-panel state, or assert
        a single stable `data-testid="sessions-detail-page"` element identity persists across tab clicks.
        If a network assertion is kept, disable react-query refetchOnWindowFocus in the test context so the
        count is deterministic.
      </required_revision>
    </challenge>

    <challenge>
      <type>AUDIT_RISK</type>
      <severity>WARNING</severity>
      <task_ref>t4-list-page</task_ref>
      <description>
        The e2e spec is named `tests/e2e/prog-studio-sessions-2026-05-s2.spec.ts`. The live convention
        (project-conventions.md, e2e_naming) is `gander-studio-pN-{slug}-fe.spec.ts`. The deviation is
        cosmetic and self-consistent, but the auditor's e2e discovery / convention check may flag it.
      </description>
      <required_revision>
        Either keep the chosen name and add a one-line note to the t4 packet justifying the program-slug
        naming for the sessions program (so the auditor does not flag it), or rename to the established
        `-fe.spec.ts` suffix form, e.g. `prog-studio-sessions-2026-05-s2-list-edit-fe.spec.ts`. Non-blocking;
        just make the call explicit.
      </required_revision>
    </challenge>

  </challenges>

  <audit_risk_forecast>
    Most likely to fail audit even if executed well:
    1. The ModeContent prop-passing seam. Even after the BLOCKER is resolved in the plan, the auditor must
       confirm SessionDetailPage actually receives `id` at runtime (not undefined) and that the list->detail
       transition renders the detail DOM. Per `gander-studio-p2-agent-cards` §3 (side-effect-as-proxy), the
       e2e must assert the detail-page DOM (data-testid="sessions-detail-page") is visible AFTER a real row
       click, not merely that selectedSessionId was set in the store. The plan's t5 e2e does assert the DOM
       testid — good — but verify the row-click path itself is exercised end to end.
    2. SC5 column-wording mismatch (seq/ts/event vs agent-activity columns) — a literal auditor read could
       produce a false FAIL. Pre-empt at REQVAL.
    3. Constants discipline: title="Coming in S3" and the SESSION_TABS array are the only new string/struct
       constants; they live in constants/sessions.ts (correct). Watch that no FE packet inlines the
       "Coming in S3" string or tab labels outside constants/sessions.ts (DRY / standards.md).
  </audit_risk_forecast>

  <post_mortem_patterns_checked>
    Read and consulted (two most recent):
    - docs/post-mortems/prog-studio-sessions-2026-05-s1-backend.md (§5 recurring patterns: none at impl;
      §6 gaps: BE inline commit [t2 packet correctly prohibits], seq-log anomalies [ORC concern], "plan
      named fixtures without on-disk verification" — directly applicable: the plan named a non-existent
      ModeContent switch and a non-existent --ms token, both unverified codebase-facts).
    - docs/post-mortems/gander-studio-p4-proximity-edge-hardening.md (§5 silent-substitution recurring
      pattern; §6 G2 PM same-file fix propagation, G3 Critic recipe-vs-problem-naming — applied: I named
      the ModeContent and getRaw problems and pointed at file:line rather than prescribing full code).
    Also cross-referenced gander-studio-p2-agent-cards §5+§6 G1 (4+-file FE OVERSCOPED rule) per the
    standing Critic mandate. Verified docs/agent-changelog.md to avoid flagging already-fixed issues
    (BE-no-inline-commit and DOM-presence-assertion rules are already in the specs and the plan honors them).
  </post_mortem_patterns_checked>
</plan_critique>
