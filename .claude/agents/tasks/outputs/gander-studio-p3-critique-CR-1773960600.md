# Plan Critique — gander-studio-p3

**Critic:** CR#2
**Date:** 2026-03-16
**Plan reviewed:** `gander-studio-p3-decompose-PM-1773960500.md`

---

```xml
<plan_critique>
  <plan_id>gander-studio-p3</plan_id>
  <status>BLOCK</status>

  <challenges>

    <challenge>
      <type>ASSUMPTION</type>
      <severity>BLOCKER</severity>
      <task_ref>gander-studio-p3-003</task_ref>
      <description>
        The PM diagnoses the `code-auditor` missing from Browse as a tier filter problem,
        citing the tier filter default or the agent's `tier` value. This diagnosis is wrong
        based on the actual code.

        `browse-store.ts` line 28: `tierFilter: 'all'` — the default is already `'all'`.
        `useBrowseData.ts` line 38: `if (tierFilter !== 'all' && a.tier !== tierFilter) return false`
        — with default `'all'`, this branch never executes. Every agent is included regardless
        of `tier` value.

        The PM's proposed fixes — (a) update the default tier filter to 'all' (it already is),
        or (b) update the agent file's `tier` to `core` — both address a problem that does not
        exist in the current code. With tierFilter defaulting to 'all', code-auditor should
        already be visible. If it is not, the root cause is elsewhere:
        possibilities include (1) the file is not in the agents directory GANDER_ROOT points to
        at runtime, (2) the parser throws and the agent is silently dropped from parseAllAgents,
        or (3) the agent name in frontmatter does not match 'code-auditor'.

        If the FE agent executes the PM's prescribed investigation steps, those steps will
        not find the actual bug. They will find that the tier filter is already correct and
        have no actionable fix.
      </description>
      <required_revision>
        Replace the P3-003 investigation path for Bug B. The investigation steps must be:
        1. With GANDER_ROOT set, run agent.list and confirm whether 'code-auditor' is present
           in the returned array. If absent, the cause is in the parser or the source file,
           not the tier filter.
        2. Check whether the agent file (`auditor.md` or equivalent) exists in
           `GANDER_ROOT/.claude/agents/` at the path the server resolves at runtime.
        3. Check whether `parseAgentFile` throws on that file (parser fallback path in
           `agent-parser.ts` lines 14–27 may silently return empty data if frontmatter
           is malformed, causing AgentSchema.parse to throw, which would make
           parseAllAgents reject the entire Promise.all).
        4. Only if agent.list returns code-auditor but Browse does not show it — then
           look at rendering/filtering.

        Remove the tier-filter fix options (a) and (b) from the task description. They are
        based on a false premise and will waste the FE agent's turn.
      </required_revision>
    </challenge>

    <challenge>
      <type>ASSUMPTION</type>
      <severity>BLOCKER</severity>
      <task_ref>gander-studio-p3-001</task_ref>
      <description>
        The task's path-traversal guard is underspecified in a way that will produce an
        insecure implementation. Success criterion 3 says: "A targetBasePath that is
        non-absolute or contains `..` throws TRPCError({ code: 'BAD_REQUEST' })."

        A string `includes('..')` check passes for `/home/user/../etc/passwd` (the PM
        correctly notes this in risk_flags), but it would also pass for the path
        `/home/user/..something/` since that string does contain `..`. More critically,
        a check that only looks for literal `..` strings fails against OS-level symlinks
        and percent-encoded paths that `path.resolve()` would normalize into an escape.

        The success criterion as written leaves the implementation method unspecified.
        An implementing agent that writes `input.targetBasePath.includes('..')` passes the
        stated criterion but produces a weaker guard than `path.resolve()` normalization.
        The PM's risk_flags section acknowledges this but does not close the gap in the
        success criteria — the implementing agent reads the success criteria, not risk_flags.

        A correct guard is:
        ```
        const resolved = path.resolve(targetBasePath);
        if (resolved !== targetBasePath) throw TRPCError BAD_REQUEST
        ```
        (path.resolve on an already-absolute path with no `..` returns the same string;
        any `..` components are collapsed, changing the string, which triggers the mismatch.)
      </description>
      <required_revision>
        Update success criterion 3 in P3-001 to specify the exact guard mechanism, not the
        observable behavior only. Replace:
          "A targetBasePath that is non-absolute or contains `..` throws TRPCError BAD_REQUEST"
        with:
          "The guard uses `path.resolve(input.targetBasePath)` and compares the result to the
          raw input. If they differ, OR if the resolved path does not start with '/', throw
          TRPCError({ code: 'BAD_REQUEST' }). A string includes('..') check alone is not
          sufficient."
        This closes the underspecification before the BE agent writes the code.
      </required_revision>
    </challenge>

    <challenge>
      <type>AUDIT_RISK</type>
      <severity>WARNING</severity>
      <task_ref>gander-studio-p3-005</task_ref>
      <description>
        The expectation manifest (line in the gander-studio-p3-decompose-PM-1773960500.md
        expectation_manifest section) assigns P3-005 (auditor task) the tag:
        `<expected_tag>plan_critique</expected_tag>`.

        `plan_critique` is the output tag for the Critic (CR), not the Auditor. The auditor
        produces an audit_report. If the Orchestrator performs a receipt check against
        `plan_critique` on the auditor's output file, the check will fail and the ORC will
        either re-route incorrectly or block P3-006 incorrectly.
      </description>
      <required_revision>
        In the expectation_manifest for P3-005, change:
          `<expected_tag>plan_critique</expected_tag>`
        to:
          `<expected_tag>audit_report</expected_tag>`
      </required_revision>
    </challenge>

    <challenge>
      <type>OVERSCOPED</type>
      <severity>WARNING</severity>
      <task_ref>gander-studio-p3-003</task_ref>
      <description>
        P3-003 combines two separate bug investigations plus two separate fixes into one task
        and one commit. The success criteria have four independent conditions (blank entry fix,
        code-auditor fix, no removal of legitimate agents, lint passing). Depending on root
        cause, the fix may touch: agent-parser.ts, ComposePage.tsx, and possibly an agent .md
        source file — three files across two packages. The PM's own description says "both bugs
        should be resolved in a single commit." This violates the 50-line commit limit if both
        fixes require non-trivial changes, and also makes the audit harder (the auditor must
        trace through two unrelated code paths in one review).

        The issues are genuinely independent: blank entry is a parser/render filter issue;
        code-auditor visibility is a different root cause entirely (see BLOCKER above). There
        is no shared root cause confirmed yet — the PM hypothesizes one but it is unverified.
      </description>
      <required_revision>
        Split P3-003 into two tasks:
        - P3-003a: blank entry in Compose (parser filter fix)
        - P3-003b: code-auditor missing from Browse (investigation-first, then fix)
        Both can still run in parallel with P3-001/P3-002 since they are independent. This
        keeps each commit under 50 lines and makes audit traces clean.
        If the PM judges that the investigation may reveal a shared root cause, P3-003b may
        depend on P3-003a completing first — but they should still be separate task packets.
      </required_revision>
    </challenge>

    <challenge>
      <type>ASSUMPTION</type>
      <severity>WARNING</severity>
      <task_ref>gander-studio-p3-004</task_ref>
      <description>
        The PM notes in risk_flags: "The `tsx watch` runner used in the dev script may
        intercept the EADDRINUSE error before `server.ts` handles it." The risk is real.
        `server.ts` line 15 uses a top-level `await server.listen(...)` — if Fastify
        rejects the listen promise, tsx may catch and print the raw error before
        the try/catch in server.ts fires, depending on how tsx handles unhandled rejections
        in watched mode.

        The success criterion only says "server prints a clear EADDRINUSE message and exits
        with code 1" but does not require the BE agent to actually test this under `tsx watch`
        (the dev script mode). It is easy to write code that works with `node server.ts`
        but whose error message is swallowed or double-printed under `tsx watch`.
      </description>
      <required_revision>
        Add to P3-004 success criteria: "Verify that under `npm run dev` (tsx watch mode),
        not just `node packages/server/src/server.ts` directly, the EADDRINUSE message
        from the try/catch in server.ts is the message that surfaces in the terminal. If
        tsx intercepts and prints the raw Fastify error instead, an additional fix to the
        dev script or tsx invocation is required."
      </required_revision>
    </challenge>

  </challenges>

  <audit_risk_forecast>
    1. P3-001 path-traversal guard: even if the BLOCKER is resolved, the auditor should
       verify the guard uses path.resolve() normalization and not a naive string check.
       The SX gate in P3-005 already calls this out, but the auditor should request a
       code snippet, not just a behavioral test result, as evidence.

    2. P3-002 hint text update: the dynamic hint under "Target Directory" will likely
       require at least one new string constant (the resolved path display logic). If
       the FE agent inlines the display logic rather than extracting a helper or constant,
       it will fail the DRY/constants SA check. The success criterion calls for
       `BASE_PATH_PATTERN` in constants/export.ts but does not explicitly require that
       the hint text assembly logic (the conditional `{targetBasePath}/{dirname}/.claude/`
       string) be a named constant or helper rather than an inline expression in JSX.
       Watch this at SA gate.
  </audit_risk_forecast>

  <post_mortem_patterns_checked>
    No post-mortem files exist at docs/post-mortems/ — the directory does not exist.
    The most recent agent output available is the P2 audit: `gander-studio-p2-003-AUD-1773960400.md`.
    That audit reported PASS on all gates with no recurring failure patterns documented.
    No agent changelog file found at docs/agent-changelog.md.

    Cross-checked against patterns in gander/.claude/rules/standards.md:
    - No `any` without justification: P3-001 schema move is clean (pure Zod)
    - Constants extraction: P3-002 explicitly requires BASE_PATH_PATTERN in export.ts
    - A11Y: P3-002 explicitly requires useId() and aria-describedby patterns
    - 50-line commit: P3-003 WARNING raised above
    - Path traversal: BLOCKER raised for P3-001 guard underspecification
  </post_mortem_patterns_checked>

</plan_critique>
```
