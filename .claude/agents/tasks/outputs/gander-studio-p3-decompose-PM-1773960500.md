# Gander Studio — P3 Sprint Decomposition

**PM agent turn** | task_id prefix: `gander-studio-p3` | generated: 2026-03-16T00:00:00Z

---

## Stage 1 — RECEIVED

Brief received from human E2E session. Four issues observed post-P2 deployment. Item 5 (orchestrator filter) is a verification point only — confirmed already implemented in P2 via `router.ts` lines 233 and 363. No new task required.

## Stage 2 — PLAN

### Domain analysis

| Item | Domains | Notes |
|---|---|---|
| 1. Export base path picker | BE (schema + router) + FE (ExportPage) | Sequential: BE must land first; FE consumes new field |
| 2. Blank entry in Compose agent list | FE investigation + fix | May share root cause with item 3 |
| 3. Auditor missing from Browse page | FE investigation + fix | Assign together with item 2 |
| 4. Port conflict on dev restart | BE/server (server.ts) or root package.json dev script | Small ops fix, server.ts preferred for code clarity |

### Dependency graph

```
gander-studio-p3-001 (BE: ExportInputSchema + router)
    → gander-studio-p3-002 (FE: ExportPage base path UI)
        → gander-studio-p3-004 (AUDIT: items 1–4)
gander-studio-p3-003 (FE: blank entry + auditor missing)
    → gander-studio-p3-004
gander-studio-p3-005 (BE: port conflict)
    → gander-studio-p3-004
        → gander-studio-p3-006 (human E2E verification)
```

### Consultation assessment

No planning consultation required. All file paths and existing code patterns are fully known from codebase inspection. The FE task for items 2+3 is investigate-and-fix — no UI design sketch needed because the fix is rendering logic, not new surface area.

---

```xml
<task_decomposition task_id="gander-studio-p3" agent_count="6">
  <task_packets>

    <!-- ═══════════════════════════════════════════════════════════════════ -->
    <!-- TASK P3-001: BE — Add targetBasePath to ExportInputSchema + router  -->
    <!-- ═══════════════════════════════════════════════════════════════════ -->
    <task_packet>
      <task_id>gander-studio-p3-001</task_id>
      <assigned_to>backend</assigned_to>
      <priority>HIGH</priority>
      <description>
        Add an optional `targetBasePath` field to `ExportInputSchema` in
        `packages/server/src/router.ts`. When provided, use it as the base
        directory for the export instead of the `EXPORT_BASE_DIR` env var.
        When absent, fall back to `EXPORT_BASE_DIR` (no behaviour change for
        existing callers). Add path-traversal guard: `targetBasePath` must be
        an absolute path and must not contain `..` segments; throw
        `TRPCError({ code: 'BAD_REQUEST' })` if the check fails.

        The `ExportInputSchema` is currently defined inline in router.ts
        (lines 44–50). Move it to `packages/shared/src/schemas.ts` as
        `ExportInputSchema` (exported) so the FE agent can import the inferred
        type from `@gander-studio/shared`. Update the import in router.ts
        accordingly.

        Do NOT modify `EXPORT_BASE_DIR` in env.ts — it remains the default
        fallback; it is not being removed.
      </description>
      <success_criteria>
        1. `ExportInputSchema` is exported from `packages/shared/src/schemas.ts`
           and includes `targetBasePath: z.string().optional()`.
        2. `router.ts` imports `ExportInputSchema` from `@gander-studio/shared`
           and computes `targetPath` as:
           `path.join(input.targetBasePath ?? EXPORT_BASE_DIR, input.targetDirName)`
        3. A `targetBasePath` that is non-absolute or contains `..` throws
           `TRPCError({ code: 'BAD_REQUEST' })`.
        4. `npm run lint` passes with no TypeScript errors across all three packages.
        5. Net new code does not exceed 40 lines (this is a schema + one-line logic change).
      </success_criteria>
      <context_files>
        packages/shared/src/schemas.ts
        packages/server/src/router.ts (lines 44–56 — ExportInputSchema definition)
        packages/server/src/env.ts
      </context_files>
      <dependencies>none</dependencies>
      <out_of_scope>
        - Do not change ExportResultSchema.
        - Do not modify the FE (ExportPage.tsx) — that is gander-studio-p3-002.
        - Do not change EXPORT_BASE_DIR default or make it required.
        - Do not add a new tRPC procedure — modify the existing export.spawn mutation only.
      </out_of_scope>
      <output_expected>
        <tag>completion_packet</tag>
        <must_contain>
          <item>Confirmation that ExportInputSchema is now in shared/schemas.ts</item>
          <item>The exact Zod field added: `targetBasePath: z.string().optional()`</item>
          <item>The path-traversal guard logic (code snippet)</item>
          <item>Lint passing confirmation</item>
        </must_contain>
        <must_not_contain>
          <item>Any FE component changes</item>
          <item>Removal of EXPORT_BASE_DIR from env.ts</item>
        </must_not_contain>
        <success_signal>
          `npm run lint` exits 0; ExportInputSchema exported from shared package;
          router.ts uses `input.targetBasePath ?? EXPORT_BASE_DIR` for base dir.
        </success_signal>
      </output_expected>
    </task_packet>

    <!-- ═══════════════════════════════════════════════════════════════════ -->
    <!-- TASK P3-002: FE — Export page base path input field                 -->
    <!-- ═══════════════════════════════════════════════════════════════════ -->
    <task_packet>
      <task_id>gander-studio-p3-002</task_id>
      <assigned_to>frontend</assigned_to>
      <priority>HIGH</priority>
      <description>
        Add a "Base Directory" text input field to `ExportPage.tsx`, above the
        existing "Target Directory" field. This input maps to the new
        `targetBasePath` field in `ExportInputSchema` (added by P3-001).

        Behaviour:
        - The field is optional. When left blank, no `targetBasePath` is sent in
          the mutation call — the server falls back to its env-var default.
        - When populated, the value is passed as `targetBasePath` in the
          `exportMutation.mutate(...)` call.
        - Validation: if non-empty, the value must start with `/` (absolute path).
          Show an inline error message if validation fails. The `canExport` gate
          must also be false when `targetBasePath` is non-empty and invalid.
        - The hint text below "Target Directory" currently reads:
          "Files will be written to EXPORT_BASE_DIR/[dirname]/.claude/"
          Update it to reflect the actual base: if `targetBasePath` is non-empty
          and valid, show `{targetBasePath}/{dirname}/.claude/`; otherwise keep
          the existing EXPORT_BASE_DIR text.
        - Use `useId()` for the new input's label/error/hint IDs (same pattern
          as the existing targetDirId pair).
        - Add any new magic values (e.g. the absolute-path regex) to
          `packages/client/src/constants/export.ts`, not inline.

        Style: match the existing "Target Directory" field exactly — same label
        style, same Input component, same error/hint paragraph pattern.
      </description>
      <success_criteria>
        1. A "Base Directory" label + Input renders above "Target Directory" on ExportPage.
        2. When left blank: `exportMutation.mutate` is called without `targetBasePath`
           (or with `targetBasePath: undefined`).
        3. When filled with a valid absolute path: `targetBasePath` is passed through.
        4. When filled with a non-absolute value: inline error shown, `canExport` is false.
        5. The hint text under "Target Directory" reflects the actual resolved base path.
        6. All new magic values extracted to `constants/export.ts`.
        7. `npm run lint` passes with no TypeScript errors.
        8. Net new code in ExportPage.tsx does not exceed 50 lines.
      </success_criteria>
      <context_files>
        packages/client/src/pages/ExportPage.tsx
        packages/client/src/constants/export.ts
        packages/shared/src/schemas.ts (after P3-001 lands — check ExportInputSchema)
      </context_files>
      <dependencies>gander-studio-p3-001</dependencies>
      <out_of_scope>
        - Do not modify router.ts or schemas.ts — schema work is done in P3-001.
        - Do not change any other page or component.
        - Do not add a file browser / OS picker dialog — text input only.
        - Do not change the "Target Directory" field's validation logic.
      </out_of_scope>
      <output_expected>
        <tag>ui_packet</tag>
        <must_contain>
          <item>Description of the new Base Directory input and its placement</item>
          <item>The BASE_PATH_PATTERN constant added to constants/export.ts</item>
          <item>Confirmation that canExport correctly gates on targetBasePath validity</item>
          <item>Lint passing confirmation</item>
        </must_contain>
        <must_not_contain>
          <item>Inline regex literals in ExportPage.tsx (must be in constants/export.ts)</item>
          <item>Any changes to BrowsePage, ComposePage, or router files</item>
        </must_not_contain>
        <success_signal>
          `npm run lint` exits 0; Base Directory field renders in browser; hint text
          updates dynamically; empty field does not break existing export flow.
        </success_signal>
      </output_expected>
    </task_packet>

    <!-- ═══════════════════════════════════════════════════════════════════ -->
    <!-- TASK P3-003: FE — Blank entry in Compose + auditor missing in Browse -->
    <!-- ═══════════════════════════════════════════════════════════════════ -->
    <task_packet>
      <task_id>gander-studio-p3-003</task_id>
      <assigned_to>frontend</assigned_to>
      <priority>HIGH</priority>
      <description>
        Investigate and fix two related agent display bugs:

        **Bug A — Blank entry in Compose agent selector**
        One agent renders as a blank entry in the Compose page agent list
        (ComposePage.tsx, the Popover-based browser panel). The agent names
        returned by the server are:
          archivist, code-auditor, backend-engineer, critic, db-specialist,
          dispatcher, frontend-engineer, system-health-monitor, orchestrator,
          project-manager, researcher, statistician, ui-designer

        Likely cause: one agent has an empty or whitespace-only `name` field
        after parsing, OR the Compose selector renders all entries including
        agents with empty names without filtering them out.

        Investigation steps:
        1. Check `packages/server/src/parsers/agent-parser.ts` — the parser
           sets `name: data.name ?? ''` at line 52. An agent with a missing
           or malformed `name` frontmatter field will produce `name: ''`.
           Identify which agent file causes this.
        2. The Compose page maps `agents.map(a => ({ name: a.name, type: 'agent' }))` —
           a blank name renders as an empty list item with no label.

        Fix: add a filter in `parseAllAgents` (or in the Compose page agent
        list rendering) that skips agents with `name === ''` or
        `name.trim() === ''`. Prefer the parser-level fix (filter in
        `parseAllAgents`) so all consumers benefit.

        **Bug B — code-auditor missing from Browse page**
        `code-auditor` is present in `AGENT_MATERIA` in
        `packages/client/src/constants/browse.ts` but the human reported it
        is not visible in the Browse agent grid.

        Investigation steps:
        1. Confirm whether `code-auditor` is actually returned by `agent.list`
           when the server is running. The agent file is `auditor.md` with
           `name: code-auditor` in frontmatter.
        2. Check `useBrowseData.ts` — the `tierFilter` filter: if `code-auditor`
           has `tier: optional` (the default) and the Browse page tier filter
           is set to `core` or `impl`, it would be filtered out.
        3. Check `AgentCard` for any rendering guard that might hide the card.

        Fix: if the agent is returned by the server but hidden by the tier
        filter default, confirm whether `tier` is being applied correctly. If
        the agent has `tier` unset (falling to `optional`) and the Browse
        filter is set to hide `optional` by default, either: (a) update the
        default tier filter to `'all'` (if it isn't already), or (b) confirm
        the agent file sets `tier: core` if that is its intended tier. Do not
        change both — pick the minimal correct fix.

        Both bugs should be resolved in a single commit. Document findings
        in the completion packet.
      </description>
      <success_criteria>
        1. No blank entries appear in the Compose page agent selector.
        2. `code-auditor` is visible in the Browse page agent grid when tier
           filter is set to "all" (and, if it is a core agent, also when
           filter is set to "core").
        3. The fix does not remove any legitimate agent from either view.
        4. `npm run lint` passes with no TypeScript errors.
      </success_criteria>
      <context_files>
        packages/server/src/parsers/agent-parser.ts
        packages/client/src/pages/ComposePage.tsx (agent browser panel section — search for `agentItems`)
        packages/client/src/hooks/useBrowseData.ts
        packages/client/src/constants/browse.ts (AGENT_MATERIA, TIER_AGENTS)
        packages/client/src/store/browse-store.ts (check tierFilter default)
      </context_files>
      <dependencies>none</dependencies>
      <out_of_scope>
        - Do not change ExportPage or router.ts.
        - Do not add new agent cards or materia entries — only fix the filtering/rendering bugs.
        - Do not modify AgentSchema in shared/schemas.ts.
      </out_of_scope>
      <output_expected>
        <tag>completion_packet</tag>
        <must_contain>
          <item>Root cause identification for the blank entry (which agent file, which field)</item>
          <item>Root cause identification for code-auditor invisibility</item>
          <item>Description of each fix applied (file + line)</item>
          <item>Lint passing confirmation</item>
        </must_contain>
        <must_not_contain>
          <item>Changes to ExportPage, router.ts, or schemas.ts</item>
          <item>New constants for browse that duplicate existing AGENT_MATERIA entries</item>
        </must_not_contain>
        <success_signal>
          `npm run lint` exits 0; no blank row in Compose agent popover;
          code-auditor card visible in Browse "all" view.
        </success_signal>
      </output_expected>
    </task_packet>

    <!-- ═══════════════════════════════════════════════════════════════════ -->
    <!-- TASK P3-004 (formerly P3-005 in numbering): BE — Port conflict fix  -->
    <!-- ═══════════════════════════════════════════════════════════════════ -->
    <task_packet>
      <task_id>gander-studio-p3-004</task_id>
      <assigned_to>backend</assigned_to>
      <priority>NORMAL</priority>
      <description>
        When a previous server process is still holding port 3001,
        `npm run dev` fails immediately with `EADDRINUSE`. The dev experience
        requires manual `kill` intervention.

        Fix: in `packages/server/src/server.ts`, catch the EADDRINUSE error
        thrown by `server.listen()` and print a clear, actionable message
        (include the port number and a suggested `lsof -ti :3001 | xargs kill`
        command), then exit with code 1. This is preferable to silently
        retrying on the next port — the human should know a stale process is
        running and have the information to kill it, rather than silently
        spinning up on a random port that the client Vite proxy won't know about.

        Specifically:
        - Wrap `await server.listen(...)` in a try/catch.
        - On error where `(err as NodeJS.ErrnoException).code === 'EADDRINUSE'`:
          print a descriptive message to stderr and call `process.exit(1)`.
        - On other errors: re-throw (do not swallow unrelated startup errors).

        Do not modify the root `package.json` dev script — keep the fix
        server-side for maintainability.
      </description>
      <success_criteria>
        1. When port 3001 is occupied, the server prints a clear EADDRINUSE
           message (including port number and kill hint) and exits with code 1.
        2. Other server startup errors are still thrown/propagated.
        3. Normal startup behaviour is unchanged.
        4. `npm run lint` passes.
        5. Net new code ≤ 15 lines.
      </success_criteria>
      <context_files>
        packages/server/src/server.ts
        packages/server/src/env.ts (SERVER_PORT constant)
      </context_files>
      <dependencies>none</dependencies>
      <out_of_scope>
        - Do not auto-increment the port — use a fixed error + exit.
        - Do not modify package.json scripts.
        - Do not change router.ts or any other server file.
      </out_of_scope>
      <output_expected>
        <tag>completion_packet</tag>
        <must_contain>
          <item>The exact error message string written to stderr</item>
          <item>Confirmation that non-EADDRINUSE errors still propagate</item>
          <item>Lint passing confirmation</item>
        </must_contain>
        <must_not_contain>
          <item>Port auto-increment logic</item>
          <item>Changes to package.json or any file other than server.ts</item>
        </must_not_contain>
        <success_signal>
          `npm run lint` exits 0; server.ts exits with code 1 and descriptive
          message when EADDRINUSE; normal boot unaffected.
        </success_signal>
      </output_expected>
    </task_packet>

    <!-- ═══════════════════════════════════════════════════════════════════ -->
    <!-- TASK P3-005: AUDIT — All P3 implementation tasks                    -->
    <!-- ═══════════════════════════════════════════════════════════════════ -->
    <task_packet>
      <task_id>gander-studio-p3-005</task_id>
      <assigned_to>auditor</assigned_to>
      <priority>HIGH</priority>
      <description>
        Run the full SA → QA → SX audit pipeline across all P3 implementation
        tasks (P3-001 through P3-004). Produce a unified audit report covering
        all four tasks. Issue individual PASS/FAIL verdicts per task, plus an
        overall sprint verdict.

        SA gate checklist (per task):
        - TypeScript strict: no `any` without justification comment, all
          params/returns typed
        - Zod schema at every new API boundary (verify ExportInputSchema
          migration from router.ts inline → shared/schemas.ts)
        - No magic values inlined in components (check constants/export.ts)
        - No dead imports or unreachable branches introduced
        - A11Y: new inputs in ExportPage must have associated `htmlFor`/`id`,
          `aria-describedby`, and `aria-invalid` patterns matching existing inputs

        QA gate checklist (per task):
        - P3-001: export with `targetBasePath` set → files land in specified dir;
          export without `targetBasePath` → falls back to EXPORT_BASE_DIR;
          `targetBasePath` with `..` → rejected with BAD_REQUEST
        - P3-002: blank targetBasePath → no regression on existing export flow;
          non-absolute value → canExport false; hint text updates correctly
        - P3-003: Compose agent list — no blank entries; Browse — code-auditor visible
        - P3-004: EADDRINUSE → clear message + exit 1; normal boot → unchanged

        SX gate checklist:
        - P3-001: path-traversal guard present on `targetBasePath`; no new
          user-controlled path written outside the `targetBasePath` value itself
        - P3-002: `targetBasePath` is never rendered into innerHTML or eval
        - `npm audit` — confirm no new high/critical vulns introduced
        - No secrets, credentials, or env var values embedded in source

        Verification point (from P2): confirm `orchestrator.md` is NOT present
        in export output (the orchestrator filter introduced in P2). Inspect
        router.ts lines 233 and 363 to confirm the filter is intact.
      </description>
      <success_criteria>
        Audit report produced with PASS or FAIL verdict for each of P3-001,
        P3-002, P3-003, P3-004, and the P2 verification point. If any task
        fails, report must contain specific, actionable remediation with the
        single change required.
      </success_criteria>
      <context_files>
        packages/shared/src/schemas.ts
        packages/server/src/router.ts
        packages/server/src/server.ts
        packages/server/src/env.ts
        packages/client/src/pages/ExportPage.tsx
        packages/client/src/constants/export.ts
        packages/client/src/pages/ComposePage.tsx
        packages/client/src/hooks/useBrowseData.ts
        packages/client/src/constants/browse.ts
        packages/server/src/parsers/agent-parser.ts
      </context_files>
      <dependencies>
        gander-studio-p3-001
        gander-studio-p3-002
        gander-studio-p3-003
        gander-studio-p3-004
      </dependencies>
      <out_of_scope>
        Do not implement fixes — only audit and report. If a fix is needed,
        return the specific task's completion packet with a FAIL verdict and
        one remediation item.
      </out_of_scope>
      <output_expected>
        <tag>plan_critique</tag>
        <must_contain>
          <item>Per-task verdict: PASS or FAIL for P3-001 through P3-004</item>
          <item>P2 verification point verdict (orchestrator filter)</item>
          <item>SA, QA, SX section per task</item>
          <item>Overall sprint verdict</item>
        </must_contain>
        <must_not_contain>
          <item>Code implementations — report only</item>
        </must_not_contain>
        <success_signal>
          Audit report file written; all four implementation tasks marked PASS;
          P2 verification point confirmed; overall verdict PASS.
        </success_signal>
      </output_expected>
    </task_packet>

    <!-- ═══════════════════════════════════════════════════════════════════ -->
    <!-- TASK P3-006: HUMAN — E2E verification                               -->
    <!-- ═══════════════════════════════════════════════════════════════════ -->
    <task_packet>
      <task_id>gander-studio-p3-006</task_id>
      <assigned_to>human</assigned_to>
      <priority>NORMAL</priority>
      <description>
        Human E2E browser session to verify all P3 items are working in the
        running application. Audit must have returned an overall PASS before
        this step is handed to the human.
      </description>
      <success_criteria>
        Human confirms all of the following in a live browser session:

        1. **Export base path (P3-001 + P3-002)**
           - Export page shows a "Base Directory" input above "Target Directory".
           - Leaving Base Directory blank and exporting: files land in
             `EXPORT_BASE_DIR/{dirname}/`.
           - Filling Base Directory with an absolute path (e.g. a local GitHub
             project folder) and exporting: files land in `{base}/{dirname}/`.
           - Filling Base Directory with a relative path: inline error shown,
             Export button disabled.
           - After export, the result panel shows the correct resolved path.

        2. **No blank entry in Compose agent list (P3-003 Bug A)**
           - Open Compose page → click the agent browser popover → no blank
             unnamed entry appears in the list.

        3. **code-auditor visible in Browse page (P3-003 Bug B)**
           - Open Browse page → set filter to "All" or "Agents" →
             `code-auditor` card is visible in the grid.

        4. **Port conflict message (P3-004)**
           - With the dev server already running, run `npm run dev` again in a
             second terminal → server process exits within 2 seconds with a
             clear error message referencing port 3001.

        5. **P2 regression check**
           - Run an export with a loadout that includes the orchestrator agent →
             confirm `orchestrator.md` does NOT appear in the exported
             `.claude/agents/` directory; confirm `CLAUDE.md` IS present at the
             export root.
      </success_criteria>
      <context_files>none — human session</context_files>
      <dependencies>gander-studio-p3-005</dependencies>
      <out_of_scope>N/A</out_of_scope>
      <output_expected>
        <tag>completion_packet</tag>
        <must_contain>
          <item>Human confirmation of each of the 5 verification points above</item>
          <item>Any observed regressions not covered by the audit</item>
        </must_contain>
        <must_not_contain>
          <item>N/A</item>
        </must_not_contain>
        <success_signal>
          Human reports all 5 points confirmed. Sprint is closed.
        </success_signal>
      </output_expected>
    </task_packet>

  </task_packets>

  <dependency_order>
    gander-studio-p3-001 (BE: schema migration + targetBasePath)
        → gander-studio-p3-002 (FE: Export page base path UI)

    gander-studio-p3-003 (FE: blank entry + auditor missing) — parallel with P3-001/P3-002
    gander-studio-p3-004 (BE: port conflict) — parallel with all implementation tasks

    [P3-001 + P3-002 + P3-003 + P3-004 all complete]
        → gander-studio-p3-005 (AUDIT)
            → gander-studio-p3-006 (human E2E)
  </dependency_order>

  <routing_notes>
    - P3-001 and P3-002 are assigned to different agents (BE, then FE) but are
      sequential: the Orchestrator must not dispatch P3-002 until P3-001
      returns a PASS receipt.
    - P3-003 and P3-004 can be dispatched immediately and run in parallel with
      the P3-001 / P3-002 chain.
    - P3-005 (audit) is a blocking gate: no human handoff until all four
      implementation tasks have returned and the audit clears.
    - If the audit returns FAIL on any task, the Orchestrator routes the
      specific FAIL verdict back to the implementing agent (BE or FE as
      appropriate) with a single remediation request. Do not re-run the full
      audit until the specific task returns a remediated packet.
    - P3-006 requires a human in the loop — Orchestrator should surface the
      verification checklist clearly, not bury it in a long report.
  </routing_notes>

  <risk_flags>
    - **ExportInputSchema move (P3-001)**: Moving the schema from router.ts
      inline to shared/schemas.ts is a refactor with two consumers (router.ts
      and FE via tRPC type inference). The Critic should verify no stale inline
      copy remains in router.ts after the move.
    - **targetBasePath path traversal**: The guard added in P3-001 must block
      `..` in *any position*, not just at the start. The audit should verify
      the guard handles edge cases like `/home/user/../etc/passwd`.
    - **Blank entry root cause (P3-003)**: If the blank agent comes from a
      `.md` file that intentionally has no `name` (e.g. a README or template),
      the fix should filter at parse time, not silently discard it; the agent
      file path should be logged to stderr so the human knows something was
      skipped.
    - **code-auditor tier (P3-003)**: If the fix involves changing `tier` in
      the agent `.md` file, that change affects the GANDER_ROOT source — the
      human should be aware their source agent file was modified, not just the
      UI filter.
    - **Port conflict (P3-004)**: The `tsx watch` runner used in the dev script
      may intercept the EADDRINUSE error before `server.ts` handles it. The BE
      agent should test that the message actually surfaces to the terminal, not
      just that the code is present.
  </risk_flags>

</task_decomposition>
```

---

## Expectation Manifest

```xml
<expectation_manifest>
  <sprint_id>gander-studio-p3</sprint_id>
  <generated>2026-03-16T00:00:00Z</generated>
  <assignments>

    <assignment>
      <task_id>gander-studio-p3-001</task_id>
      <agent>BE#1</agent>
      <expected_tag>completion_packet</expected_tag>
      <expected_file>.claude/agents/tasks/outputs/gander-studio-p3-001-BE-*.md</expected_file>
      <blocks>gander-studio-p3-002, gander-studio-p3-005</blocks>
      <receipt_check>
        <item>ExportInputSchema confirmed exported from packages/shared/src/schemas.ts</item>
        <item>targetBasePath field present with z.string().optional() type</item>
        <item>Path-traversal guard described with code snippet</item>
        <item>Lint passing confirmed (npm run lint exits 0)</item>
        <item>No inline ExportInputSchema remaining in router.ts</item>
      </receipt_check>
    </assignment>

    <assignment>
      <task_id>gander-studio-p3-002</task_id>
      <agent>FE#1</agent>
      <expected_tag>ui_packet</expected_tag>
      <expected_file>.claude/agents/tasks/outputs/gander-studio-p3-002-FE-*.md</expected_file>
      <blocks>gander-studio-p3-005</blocks>
      <receipt_check>
        <item>BASE_PATH_PATTERN constant confirmed in constants/export.ts, not inline</item>
        <item>canExport gate description includes targetBasePath validity check</item>
        <item>Hint text update described (reflects actual base path)</item>
        <item>Lint passing confirmed</item>
        <item>No changes to router.ts or schemas.ts reported</item>
      </receipt_check>
    </assignment>

    <assignment>
      <task_id>gander-studio-p3-003</task_id>
      <agent>FE#2</agent>
      <expected_tag>completion_packet</expected_tag>
      <expected_file>.claude/agents/tasks/outputs/gander-studio-p3-003-FE-*.md</expected_file>
      <blocks>gander-studio-p3-005</blocks>
      <receipt_check>
        <item>Root cause of blank entry identified (specific agent file + field)</item>
        <item>Root cause of code-auditor missing identified</item>
        <item>Fix location described (parser-level preferred for blank entry)</item>
        <item>Lint passing confirmed</item>
      </receipt_check>
    </assignment>

    <assignment>
      <task_id>gander-studio-p3-004</task_id>
      <agent>BE#2</agent>
      <expected_tag>completion_packet</expected_tag>
      <expected_file>.claude/agents/tasks/outputs/gander-studio-p3-004-BE-*.md</expected_file>
      <blocks>gander-studio-p3-005</blocks>
      <receipt_check>
        <item>Exact stderr message string included in packet</item>
        <item>Confirmation that non-EADDRINUSE errors still propagate</item>
        <item>Lint passing confirmed</item>
        <item>No port auto-increment logic present</item>
      </receipt_check>
    </assignment>

    <assignment>
      <task_id>gander-studio-p3-005</task_id>
      <agent>AUD#1</agent>
      <expected_tag>plan_critique</expected_tag>
      <expected_file>.claude/agents/tasks/outputs/gander-studio-p3-005-AUD-*.md</expected_file>
      <blocks>gander-studio-p3-006</blocks>
      <receipt_check>
        <item>Per-task verdict present for each of P3-001 through P3-004</item>
        <item>P2 orchestrator filter verification point verdict present</item>
        <item>SA, QA, SX sections present for each task</item>
        <item>Overall sprint verdict stated (PASS or FAIL)</item>
        <item>If any FAIL: single remediation item per failing task, no implementation code</item>
      </receipt_check>
    </assignment>

    <assignment>
      <task_id>gander-studio-p3-006</task_id>
      <agent>HUMAN</agent>
      <expected_tag>completion_packet</expected_tag>
      <expected_file>N/A — human verbal/written confirmation</expected_file>
      <blocks>NONE — sprint close</blocks>
      <receipt_check>
        <item>All 5 verification points addressed (export base path, no blank entry, auditor visible, port message, P2 regression)</item>
        <item>Any new regressions not in the audit reported</item>
      </receipt_check>
    </assignment>

  </assignments>
</expectation_manifest>
```

---

## Stage 3 — COMPLETE

Decomposition written to:
`/home/jhber/projects/gander-studio-alpha/.claude/agents/tasks/outputs/gander-studio-p3-decompose-PM-1773960500.md`

**Sprint summary:** 4 implementation tasks (2 BE, 2 FE), 1 audit gate, 1 human E2E step. Total agent count: 6. Maximum parallel execution: P3-001 + P3-003 + P3-004 can run concurrently; P3-002 must wait for P3-001; audit waits for all four; human waits for audit.
