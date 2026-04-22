# Critique: gander-studio-p2-canvas-link
**Critic:** CR#1
**At:** 2026-03-28T00:05:00Z

```xml
<plan_critique task_id="gander-studio-p2-canvas-link">
  <result>CRITIQUE_BLOCK</result>

  <challenges>

    <challenge id="C1" severity="BLOCKER">
      <dimension>scope</dimension>
      <description>
        Task 003 (FE) contains six independently shippable units in a single agent turn:
        (A) MateriaNode glassy restyle, (B) MateriaCanvas proximity animation + class injection,
        (C) useLinkSound Web Audio hook (new file), (D) toRFEdge animated/glow update,
        (E) LoadoutListPanel new component (new file), (F) three-column layout wiring in ComposePage.
        This is the identical overscope pattern that CR#1 blocked in P1 (post-mortem
        gander-studio-p1-materia-canvas.md §2: "FE-canvas overscoped 4-8x — single task covered
        MateriaCanvas, MateriaNode, canvas.ts, drag-from-palette, edge creation, CSS isolation,
        zoom controls — 7 distinct units in one agent turn"). Six units across four files in one
        pass will exceed the 50-line commit limit and produce an unauditable changeset.
      </description>
      <suggested_fix>
        Split task 003 into three sequential tasks:
        - 003a (wave 2): MateriaNode glassy CSS restyle (A) + toRFEdge update (D) — visual-only,
          no interaction changes. One file each. Depends on 002.
        - 003b (wave 3): MateriaCanvas proximity animation + CSS class injection (B) +
          useLinkSound hook (C) — all interaction and sound. Depends on 003a.
        - 003c (wave 4): LoadoutListPanel component (E) + ComposePage wiring (F) — depends on 001
          (for connections data) and 003b (for stable canvas surface).
        Each sub-task must include Playwright Tier 2 success criteria for its new interactive flows
        (see C4 below).
      </suggested_fix>
    </challenge>

    <challenge id="C2" severity="BLOCKER">
      <dimension>scope</dimension>
      <description>
        Task 001 (BE) spans five files across three packages in a single agent turn:
        (1) packages/shared/src/schemas.ts — LoadoutSchema + AgentSchema changes,
        (2) packages/server/src/parsers/agent-parser.ts — frontmatter read,
        (3) packages/server/src/router.ts — agent.save write logic,
        (4) packages/client/src/store/canvas-store.ts — loadFromLoadout + selectLoadoutPayload,
        (5) packages/client/src/pages/ComposePage.tsx — save payload + canvas load wiring.
        This crosses the server/client boundary in a single task. "No commit exceeding 50 lines
        of new code without a verification gate first" (CLAUDE.md). Five files across shared +
        server + client packages will blow this limit. Additionally, assigning client files
        (canvas-store.ts, ComposePage.tsx) to the BE agent creates an undeclared file conflict:
        task 003's sub-task F (ComposePage three-column layout) will touch the same
        ComposePage.tsx that BE-001 just modified, with no merge coordination.
      </description>
      <suggested_fix>
        Split task 001 into two tasks:
        - 001a (wave 1, BE): Schema changes only — LoadoutSchema.connections in schemas.ts,
          AgentSchema.communicates_with in schemas.ts, agent-parser.ts frontmatter read,
          router.ts agent.save write. Four changes, all server-side or shared.
        - 001b (wave 1, FE): canvas-store.ts loadFromLoadout + selectLoadoutPayload updates,
          ComposePage.tsx connections wiring. Two client files. Can run in parallel with 001a
          after schemas.ts is written (or sequentially after 001a passes audit).
        Wave 1 then becomes: 001a (BE) + 002 (UI) in parallel → 001b (FE) + → 003a/b/c chain.
      </suggested_fix>
    </challenge>

    <challenge id="C3" severity="BLOCKER">
      <dimension>technical</dimension>
      <description>
        The Web Audio API magnetic-snap "approach tone" is described as playing during drag
        proximity. The routing_notes acknowledge "AudioContext.resume() needed if suspended"
        but no RA pre-flight is specified. The concrete risk: Chromium's autoplay policy
        requires AudioContext.resume() to be called inside a user activation event (click,
        keydown, touchstart). A drag mousemove handler is NOT a user activation event. Calling
        resume() from mousemove returns a promise but the AudioContext may remain in 'suspended'
        state and produce no audio — silently. Whether the initial drag-start (mousedown) counts
        as the activation event that permits subsequent resume() calls during mousemove is
        unverified behavior that differs between browsers and Chromium versions. No research
        dossier exists for this. If the FE agent implements useLinkSound without verifying this
        pattern, the approach sound will silently fail in 100% of cases in production Chromium,
        and the Playwright test environment will not catch it (jsdom has no AudioContext).
      </description>
      <suggested_fix>
        Add a RA task (wave 1, parallel with 001 and 002) with the query:
        "In Chromium (latest stable), does calling AudioContext.resume() inside a
        React dragstart or mousedown handler (as the initiating user activation event)
        permit AudioContext.state to transition to 'running' and allow oscillator audio
        during subsequent mousemove events in the same drag gesture? Confirm with MDN
        Web Audio API autoplay policy docs and any browser-specific notes. Also confirm
        whether a suspended AudioContext created before any user gesture can be resumed
        at all in a drag handler vs. requiring a click/keydown event."
        Block task 003b on this RA dossier. If the answer is "mousemove is not an
        activation event," the plan's approach-sound mechanic must be revised to
        trigger on mousedown/dragstart instead.
      </suggested_fix>
    </challenge>

    <challenge id="C4" severity="BLOCKER">
      <dimension>testability</dimension>
      <description>
        Task 003 introduces at minimum four new interactive flows on existing surfaces:
        (1) CSS orb-attract animation triggered during drag proximity (new drag handler behavior
            on MateriaCanvas — existing surface),
        (2) ker-chink link flash on edge creation (new interaction on existing edge-creation
            mechanic),
        (3) LoadoutListPanel onSelectNode click → rfInstance.fitView/setCenter,
        (4) Two-way canvas↔list sync (add to canvas → appears in list; add to list → appears
            on canvas).
        No success criteria in task 003 mention Playwright Tier 2 coverage for any of these.
        Post-mortem gander-studio-p1-materia-canvas.md §6 explicitly identifies this as a
        recurring failure pattern: "Canvas-c interactive flows (drag-to-canvas, drop-on-top-link)
        have no Playwright test coverage." agent-changelog.md confirms auditor.md was updated:
        "Tier 2 QA FAIL added when task introduces interactive flows but e2e_spec is
        TIER_1_ONLY." The auditor will block this changeset. Addressing this before dispatch
        costs nothing; discovering it after implementation costs a remediation cycle.
      </description>
      <suggested_fix>
        Each FE sub-task (after C1 split) must include an explicit Playwright Tier 2 success
        criterion naming each new interactive flow it introduces. Minimum required:
        - 003b: spec coverage for proximity animation CSS class toggle (can be verified by
          checking class presence after simulated drag), and edge-creation link-flash
          (verify animated:true on the created edge + linked ring class on orb).
        - 003c: spec coverage for onSelectNode click in LoadoutListPanel (verify fitView
          or setCenter called), and bidirectional sync (add node → list row appears;
          list row click → canvas node selected).
      </suggested_fix>
    </challenge>

    <challenge id="C5" severity="BLOCKER">
      <dimension>data_contract</dimension>
      <description>
        Task 001 adds communicates_with: z.array(z.string()).optional() to AgentSchema and
        instructs the parser to read it from frontmatter. The existing fallback parser
        parseFrontmatterFallback (agent-parser.ts lines 14-27) reads each frontmatter line as
        a flat "key: rest-of-line" string. If an agent file writes communicates_with as a
        YAML list:
            communicates_with:
              - backend
              - frontend
        the fallback parser will either read an empty value (colon at end of line with no
        space-separated value) or skip it entirely. If written as an inline YAML array:
            communicates_with: [backend, frontend]
        the fallback parser reads the raw string "[backend, frontend]", not an array. Zod
        will reject this because z.array(z.string()) expects an actual array. The gray-matter
        primary path handles YAML arrays correctly, but agent files with colon-containing
        description fields already trigger the fallback path. Task 001 does not specify how
        BE should handle this serialization ambiguity. The result: any agent file that hits the
        fallback parser AND has communicates_with will silently lose its connections after a
        round-trip through agent.save + parseAgentFile.
      </description>
      <suggested_fix>
        Task 001 must explicitly specify:
        (a) The frontmatter serialization format for communicates_with — must use a YAML inline
            list that gray-matter primary parses correctly (e.g., "communicates_with: [a, b]"),
            not block sequence syntax.
        (b) The fallback parser must be updated to handle comma-delimited list values for
            communicates_with, similar to how tools is handled (agent-parser.ts line 45-48:
            "if (typeof data.tools === 'string') tools = data.tools.split(',').map(t.trim())").
            The same pattern must be applied to communicates_with.
        (c) router.ts agent.save must serialize communicates_with using the same inline format
            that the parser can round-trip correctly.
        Add to task 001 success criteria: "round-trip test — agent with communicates_with
        written via agent.save must be re-parseable by parseAgentFile with the same array
        values, including when the fallback parser is invoked."
      </suggested_fix>
    </challenge>

    <challenge id="C6" severity="WARNING">
      <dimension>scope</dimension>
      <description>
        The human used the words "hierarchical list" and "grouped" explicitly: "becomes part
        of a hierarchical list of how the agents should be grouped, connected, what should go
        into the project." The plan delivers a flat three-section panel (AGENTS / SKILLS /
        CONNECTIONS) with no grouping or hierarchy. This is a scope reinterpretation, not a
        reduction. A flat list may be the correct MVP interpretation, but the human's language
        implies something like a tree view where connections show parent-child or peer
        relationships between named agents. If LoadoutListPanel ships as a flat list and the
        human expected a hierarchical grouping, this will be surfaced as a gap at browser
        verification.
      </description>
      <suggested_fix>
        Before dispatching task 003c, confirm with the human: "The list panel will show three
        flat sections — AGENTS, SKILLS, CONNECTIONS — where each CONNECTIONS row shows
        'agent-a → agent-b'. Is that the hierarchy you had in mind, or did you want a tree
        structure where agents show their linked peers as children?" Do not assume the flat
        interpretation is correct.
      </suggested_fix>
    </challenge>

    <challenge id="C7" severity="WARNING">
      <dimension>testability</dimension>
      <description>
        Task 003 includes injecting @keyframes via "scoped style block" (inline &lt;style&gt; tag
        inside MateriaCanvasInner). This pattern already exists in ComposePage.tsx (line 783-789:
        the gs-pulse keyframe is injected inline). There is no success criterion requiring that
        animation constants (duration ms, easing, scale values) for orb-attract and orb-link-flash
        be placed in constants/canvas.ts. Post-mortem P1 pattern: "any plan that introduces new
        numeric or string constants without a note to add them to src/constants/" is an audit
        landmine. The animation parameters from the UI spec (scale factor, transition-duration,
        flash duration) will almost certainly be inlined as magic numbers in the scoped style
        block unless the task spec explicitly forbids it.
      </description>
      <suggested_fix>
        Add to task 003's success criteria (or to the FE sub-task that implements animations):
        "All animation timing values, scale factors, and sound parameters used in the
        @keyframes blocks or useLinkSound hook must be named constants in
        packages/client/src/constants/canvas.ts. No magic numbers inline in JSX style
        tags or the Web Audio hook."
      </suggested_fix>
    </challenge>

  </challenges>

  <summary>
    Five BLOCKERs, two WARNINGs. Do not dispatch any implementing agent.

    The two structural blockers (C1, C2) are the same overscope pattern that caused
    CRITIQUE_BLOCK in P1. Task 003 is 6 units in one turn; task 001 crosses three packages
    in one turn. Both must be split before re-review.

    C3 is a concrete browser API gap: the approach-sound's activation-event requirement is
    unverified and will silently fail in Chromium if the wrong event type is used. A RA
    pre-flight is required before the useLinkSound task is dispatched.

    C4 is the same Playwright coverage gap from P1 §6 — now enforced at audit (auditor.md
    updated per agent-changelog). The auditor will FAIL the FE task without Tier 2 coverage
    specs named in success criteria. Adding them now costs nothing.

    C5 is a data contract hole in the parser fallback path for communicates_with array
    serialization. Without explicit round-trip specification, BE will produce frontmatter
    that the fallback parser silently drops.

    Resolve C1–C5 in the revised plan. Address C6 (hierarchical list intent) with a single
    human question before dispatching 003c. Address C7 by adding a constants rule to FE
    sub-tasks.
  </summary>

</plan_critique>
```
