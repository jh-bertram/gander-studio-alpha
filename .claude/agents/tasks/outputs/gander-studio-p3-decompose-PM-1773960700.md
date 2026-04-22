# Gander Studio — P3 Sprint Decomposition (Revised)

**PM agent turn** | task_id prefix: `gander-studio-p3` | generated: 2026-03-16T00:00:00Z
**Revision:** v2 — applied all Critic revisions from `gander-studio-p3-critique-CR-1773960600.md`

---

## Stage 1 — RECEIVED

Brief received from human E2E session. Four issues observed post-P2 deployment. Item 5 (orchestrator filter) is a verification point only — confirmed already implemented in P2 via `router.ts` lines 233 and 363. No new task required.

## Stage 2 — PLAN

### Domain analysis

| Item | Domains | Notes |
|---|---|---|
| 1. Export base path picker | BE (schema + router) + FE (ExportPage) | Sequential: BE must land first; FE consumes new field |
| 2. Blank entry in Compose agent list | BE (parser fix in agent-parser.ts) | Server-side filter for empty-name agents |
| 3. code-auditor missing from Browse page | BE investigation (parser/API) → FE if needed | Start with API verification before any client-side changes |
| 4. Port conflict on dev restart | BE/server (server.ts) or root package.json dev script | Small ops fix, server.ts preferred for code clarity |

### Dependency graph

```
gander-studio-p3-001 (BE: ExportInputSchema + router)
    → gander-studio-p3-002 (FE: ExportPage base path UI)
        → gander-studio-p3-005 (AUDIT: items 1–4)

gander-studio-p3-003a (BE: blank entry fix — parser filter)   — parallel with P3-001/P3-002/P3-004
gander-studio-p3-003b (BE+FE: code-auditor investigation)     — parallel with P3-001/P3-002/P3-004
gander-studio-p3-004  (BE: port conflict)                     — parallel with all implementation tasks

[P3-001 + P3-002 + P3-003a + P3-003b + P3-004 all complete]
    → gander-studio-p3-005 (AUDIT)
        → gander-studio-p3-006 (human E2E verification)
```

### Consultation assessment

No planning consultation required. All file paths and existing code patterns are fully known from codebase inspection. The investigation tasks (003a, 003b) are diagnose-and-fix — no UI design sketch needed because the fix is rendering/parser logic, not new surface area.

---

```xml
<task_decomposition task_id="gander-studio-p3" agent_count="7">
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
        existing callers). Add path-traversal guard — see success criterion 3
        for the exact required implementation.

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
        3. The path-traversal guard must be implemented as follows: call
           `path.resolve(input.targetBasePath)` and compare the result to the
           raw input string. If `path.resolve(input.targetBasePath) !== input.targetBasePath`,
           OR if the resolved path does not start with `/`, throw
           `TRPCError({ code: 'BAD_REQUEST' })`. A `string.includes('..')` check
           alone is NOT sufficient and must not be used as the sole guard — it can
           be bypassed and does not normalize OS-level paths.
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
          <item>The path-traversal guard logic as a code snippet showing path.resolve() comparison</item>
          <item>Lint passing confirmation</item>
        </must_contain>
        <must_not_contain>
          <item>Any FE component changes</item>
          <item>Removal of EXPORT_BASE_DIR from env.ts</item>
          <item>A guard implemented solely with string.includes('..')</item>
        </must_not_contain>
        <success_signal>
          `npm run lint` exits 0; ExportInputSchema exported from shared package;
          router.ts uses `input.targetBasePath ?? EXPORT_BASE_DIR` for base dir;
          path.resolve() normalization guard present in code snippet.
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
    <!-- TASK P3-003a: BE — Blank entry in Compose agent selector (parser)   -->
    <!-- ═══════════════════════════════════════════════════════════════════ -->
    <task_packet>
      <task_id>gander-studio-p3-003a</task_id>
      <assigned_to>backend</assigned_to>
      <priority>HIGH</priority>
      <description>
        Fix the blank entry appearing in the Compose page agent selector.

        One agent renders as a blank entry in the Compose page agent list
        (ComposePage.tsx, the Popover-based browser panel). The agent names
        returned by the server are:
          archivist, code-auditor, backend-engineer, critic, db-specialist,
          dispatcher, frontend-engineer, system-health-monitor, orchestrator,
          project-manager, researcher, statistician, ui-designer

        Root cause: the parser in `packages/server/src/parsers/agent-parser.ts`
        sets `name: data.name ?? ''` (line 52). An agent with a missing or
        malformed `name` frontmatter field will produce `name: ''`. The Compose
        page then renders all entries including those with empty names, producing
        a blank list item.

        Investigation steps:
        1. Inspect `agent-parser.ts` — identify the line where `name` defaults
           to `''` when the frontmatter field is absent.
        2. Identify which agent file (in GANDER_ROOT/.claude/agents/) is missing
           a valid `name` field in its frontmatter. Check all `.md` files; the
           culprit will have no `name:` key or an empty value.

        Fix: add a filter in `parseAllAgents` that skips agents where
        `name === ''` or `name.trim() === ''`. Prefer filtering at the parser
        level so all consumers benefit. Log the skipped file path to stderr
        so the operator knows which file was skipped (do not silently discard).
      </description>
      <success_criteria>
        1. No blank entries appear in the Compose page agent selector.
        2. The filter is applied in `parseAllAgents` in `agent-parser.ts` (not
           only in the FE rendering layer).
        3. The path of any skipped agent file is logged to stderr.
        4. The fix does not remove any legitimate agent from any view.
        5. `npm run lint` passes with no TypeScript errors.
        6. Net new code does not exceed 15 lines.
      </success_criteria>
      <context_files>
        packages/server/src/parsers/agent-parser.ts
        packages/client/src/pages/ComposePage.tsx (agent browser panel section — search for `agentItems`)
      </context_files>
      <dependencies>none</dependencies>
      <out_of_scope>
        - Do not change ExportPage, router.ts, or schemas.ts.
        - Do not fix the code-auditor visibility issue — that is P3-003b.
        - Do not modify AgentSchema in shared/schemas.ts.
        - Do not add new agent cards or materia entries.
      </out_of_scope>
      <output_expected>
        <tag>completion_packet</tag>
        <must_contain>
          <item>Root cause identification for the blank entry (which agent file + which frontmatter field)</item>
          <item>Description of the filter added in parseAllAgents (file + line)</item>
          <item>Confirmation that stderr logging of skipped file path is present</item>
          <item>Lint passing confirmation</item>
        </must_contain>
        <must_not_contain>
          <item>Changes to ExportPage, router.ts, or schemas.ts</item>
          <item>Any code-auditor Browse visibility changes (out of scope)</item>
        </must_not_contain>
        <success_signal>
          `npm run lint` exits 0; no blank row in Compose agent popover;
          skipped file path emitted to stderr.
        </success_signal>
      </output_expected>
    </task_packet>

    <!-- ═══════════════════════════════════════════════════════════════════ -->
    <!-- TASK P3-003b: BE+FE — code-auditor missing from Browse (investigate) -->
    <!-- ═══════════════════════════════════════════════════════════════════ -->
    <task_packet>
      <task_id>gander-studio-p3-003b</task_id>
      <assigned_to>backend</assigned_to>
      <priority>HIGH</priority>
      <description>
        Investigate and fix `code-auditor` not appearing in the Browse page
        agent grid. The tier filter default is confirmed NOT the cause
        (`browse-store.ts` already defaults `tierFilter: 'all'`; this
        investigation path is a dead end and must not be pursued).

        Investigation steps — follow in order, stopping when root cause is found:

        1. **API verification (first step — mandatory):** With GANDER_ROOT set,
           call the `/trpc/agent.list` endpoint directly (e.g. via curl or
           browser DevTools network tab) and inspect the returned array. Confirm
           whether `code-auditor` is present in the response.

           - If `code-auditor` is NOT in the response: the bug is server-side.
             Proceed to step 2 (parser investigation). The fix belongs in
             `packages/server/src/parsers/agent-parser.ts`.
           - If `code-auditor` IS in the response: the bug is client-side.
             Skip to step 4 (FE display investigation).

        2. **Parser investigation (only if step 1 shows agent absent from API):**
           Check whether the agent source file (`auditor.md` or equivalent)
           exists in `GANDER_ROOT/.claude/agents/` at the path the server
           resolves at runtime.

        3. **Parser error path (only if file exists but agent is absent from API):**
           Check whether `parseAgentFile` throws on that file. The parser's
           fallback path in `agent-parser.ts` (lines 14–27) may silently return
           empty/partial data if frontmatter is malformed, causing
           `AgentSchema.parse` to throw, which would cause `parseAllAgents` to
           drop the agent from the `Promise.all` results. Inspect the frontmatter
           of the agent file carefully — verify `name: code-auditor` is present
           and correctly formatted.

        4. **FE display investigation (only if step 1 confirms agent reaches client):**
           Check `useBrowseData.ts` and the Browse page render logic. Since
           `tierFilter` defaults to `'all'` and the filter branch in `useBrowseData.ts`
           line 38 only executes when `tierFilter !== 'all'`, this is unlikely to
           be the cause — but verify that no other filter or rendering guard in
           `AgentCard` or the browse page grid is hiding the card.

        Fix: apply the minimal correct fix at the root cause location identified
        above (parser or FE display). Document findings in the completion packet
        regardless of which layer the fix is in.
      </description>
      <success_criteria>
        1. `code-auditor` is visible in the Browse page agent grid when tier
           filter is set to "all".
        2. The completion packet clearly states whether the root cause was in the
           server parser or the FE display layer, backed by the API verification
           result from step 1.
        3. The fix does not remove any other agent from any view.
        4. `npm run lint` passes with no TypeScript errors.
        5. Net new code does not exceed 20 lines.
      </success_criteria>
      <context_files>
        packages/server/src/parsers/agent-parser.ts
        packages/client/src/hooks/useBrowseData.ts
        packages/client/src/constants/browse.ts (AGENT_MATERIA, TIER_AGENTS)
        packages/client/src/store/browse-store.ts
      </context_files>
      <dependencies>none</dependencies>
      <out_of_scope>
        - Do not change ExportPage, router.ts, or schemas.ts.
        - Do not fix the blank entry bug — that is P3-003a.
        - Do not modify AgentSchema in shared/schemas.ts.
        - Do not investigate or modify the tier filter default — it is already
          `'all'` and is not the cause of this bug.
        - Do not add new agent cards or materia entries.
      </out_of_scope>
      <output_expected>
        <tag>completion_packet</tag>
        <must_contain>
          <item>Result of the direct /trpc/agent.list API call (was code-auditor present or absent?)</item>
          <item>Root cause identification for code-auditor invisibility (parser layer or FE display)</item>
          <item>Description of the fix applied (file + line)</item>
          <item>Lint passing confirmation</item>
        </must_contain>
        <must_not_contain>
          <item>Changes to ExportPage, router.ts, or schemas.ts</item>
          <item>Any tier filter default changes (it is already 'all' — do not change it)</item>
          <item>New constants for browse that duplicate existing AGENT_MATERIA entries</item>
        </must_not_contain>
        <success_signal>
          `npm run lint` exits 0; code-auditor card visible in Browse "all" view;
          API verification result documented in packet.
        </success_signal>
      </output_expected>
    </task_packet>

    <!-- ═══════════════════════════════════════════════════════════════════ -->
    <!-- TASK P3-004: BE — Port conflict fix                                 -->
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
        6. Run `npm run dev` from the project root. Trigger the port conflict by
           starting a second instance while the first is running. Confirm the
           EADDRINUSE message (from the try/catch in server.ts, not a raw Fastify
           stack trace) appears in the terminal output and is not swallowed by
           tsx watch. If tsx intercepts and prints a raw error instead of the
           formatted message, an additional fix to the dev script or tsx
           invocation is required — document the outcome in the completion packet.
      </success_criteria>
      <context_files>
        packages/server/src/server.ts
        packages/server/src/env.ts (SERVER_PORT constant)
      </context_files>
      <dependencies>none</dependencies>
      <out_of_scope>
        - Do not auto-increment the port — use a fixed error + exit.
        - Do not modify package.json scripts (unless tsx intercept issue requires it — document if so).
        - Do not change router.ts or any other server file.
      </out_of_scope>
      <output_expected>
        <tag>completion_packet</tag>
        <must_contain>
          <item>The exact error message string written to stderr</item>
          <item>Confirmation that non-EADDRINUSE errors still propagate</item>
          <item>Lint passing confirmation</item>
          <item>Result of the tsx watch validation test (success criterion 6): was the formatted message visible in terminal output under npm run dev?</item>
        </must_contain>
        <must_not_contain>
          <item>Port auto-increment logic</item>
          <item>Changes to package.json or any file other than server.ts (unless tsx issue required it)</item>
        </must_not_contain>
        <success_signal>
          `npm run lint` exits 0; server.ts exits with code 1 and descriptive
          message when EADDRINUSE under `npm run dev`; normal boot unaffected.
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
        tasks (P3-001, P3-002, P3-003a, P3-003b, P3-004). Produce a unified
        audit report covering all five tasks. Issue individual PASS/FAIL verdicts
        per task, plus an overall sprint verdict.

        SA gate checklist (per task):
        - TypeScript strict: no `any` without justification comment, all
          params/return types typed
        - Zod schema at every new API boundary (verify ExportInputSchema
          migration from router.ts inline → shared/schemas.ts)
        - No magic values inlined in components (check constants/export.ts)
        - No dead imports or unreachable branches introduced
        - A11Y: new inputs in ExportPage must have associated `htmlFor`/`id`,
          `aria-describedby`, and `aria-invalid` patterns matching existing inputs

        QA gate checklist (per task):
        - P3-001: export with `targetBasePath` set → files land in specified dir;
          export without `targetBasePath` → falls back to EXPORT_BASE_DIR;
          `targetBasePath` with path.resolve() mismatch → rejected with BAD_REQUEST
        - P3-002: blank targetBasePath → no regression on existing export flow;
          non-absolute value → canExport false; hint text updates correctly
        - P3-003a: Compose agent list — no blank entries; skipped file path logged to stderr
        - P3-003b: Browse — code-auditor visible; API verification result documented in packet
        - P3-004: EADDRINUSE → clear message + exit 1 under npm run dev (tsx watch); normal boot → unchanged

        SX gate checklist:
        - P3-001: path-traversal guard uses path.resolve() normalization — verify a code
          snippet is present showing `path.resolve(x) === x` comparison, not just a string
          includes check; no new user-controlled path written outside the `targetBasePath`
          value itself
        - P3-002: `targetBasePath` is never rendered into innerHTML or eval
        - `npm audit` — confirm no new high/critical vulns introduced
        - No secrets, credentials, or env var values embedded in source

        Verification point (from P2): confirm `orchestrator.md` is NOT present
        in export output (the orchestrator filter introduced in P2). Inspect
        router.ts lines 233 and 363 to confirm the filter is intact.
      </description>
      <success_criteria>
        Audit report produced with PASS or FAIL verdict for each of P3-001,
        P3-002, P3-003a, P3-003b, P3-004, and the P2 verification point. If any
        task fails, report must contain specific, actionable remediation with the
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
        gander-studio-p3-003a
        gander-studio-p3-003b
        gander-studio-p3-004
      </dependencies>
      <out_of_scope>
        Do not implement fixes — only audit and report. If a fix is needed,
        return the specific task's completion packet with a FAIL verdict and
        one remediation item.
      </out_of_scope>
      <output_expected>
        <tag>audit_report</tag>
        <must_contain>
          <item>Per-task verdict: PASS or FAIL for P3-001 through P3-004 (including 003a and 003b)</item>
          <item>P2 verification point verdict (orchestrator filter)</item>
          <item>SA, QA, SX section per task</item>
          <item>Overall sprint verdict</item>
          <item>For P3-001 SX gate: code snippet showing path.resolve() comparison guard (not just behavioral test)</item>
        </must_contain>
        <must_not_contain>
          <item>Code implementations — report only</item>
        </must_not_contain>
        <success_signal>
          Audit report file written; all five implementation tasks marked PASS;
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

        2. **No blank entry in Compose agent list (P3-003a)**
           - Open Compose page → click the agent browser popover → no blank
             unnamed entry appears in the list.

        3. **code-auditor visible in Browse page (P3-003b)**
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

    gander-studio-p3-003a (BE: blank entry parser fix) — parallel with P3-001/P3-002/P3-004
    gander-studio-p3-003b (BE+FE: code-auditor investigation) — parallel with P3-001/P3-002/P3-003a/P3-004
    gander-studio-p3-004 (BE: port conflict) — parallel with all implementation tasks

    [P3-001 + P3-002 + P3-003a + P3-003b + P3-004 all complete]
        → gander-studio-p3-005 (AUDIT)
            → gander-studio-p3-006 (human E2E)
  </dependency_order>

  <routing_notes>
    - P3-001 and P3-002 are assigned to different agents (BE, then FE) but are
      sequential: the Orchestrator must not dispatch P3-002 until P3-001
      returns a PASS receipt.
    - P3-003a, P3-003b, and P3-004 can be dispatched immediately and run in
      parallel with the P3-001 / P3-002 chain and with each other.
    - P3-005 (audit) is a blocking gate: no human handoff until all five
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
    - **targetBasePath path traversal (P3-001)**: The guard must use
      `path.resolve(x) === x` normalization. The auditor should request a code
      snippet as evidence — a behavioral test result alone is insufficient for
      the SX gate.
    - **Blank entry root cause (P3-003a)**: If the blank agent comes from a
      `.md` file that intentionally has no `name` (e.g. a README or template),
      the fix should filter at parse time, not silently discard it; the agent
      file path should be logged to stderr so the human knows something was
      skipped.
    - **code-auditor root cause (P3-003b)**: Start with the API call. If
      `agent.list` does not return `code-auditor`, the fix is server-side; if
      it does, trace to FE display. Do not assume tier filter is the cause —
      confirmed it is not.
    - **code-auditor tier (P3-003b)**: If the fix involves changing `tier` in
      the agent `.md` file, that change affects the GANDER_ROOT source — the
      human should be aware their source agent file was modified, not just the
      UI filter.
    - **Port conflict (P3-004)**: The `tsx watch` runner used in the dev script
      may intercept the EADDRINUSE error before `server.ts` handles it. The BE
      agent must test under `npm run dev` (tsx watch mode), not just with
      `node server.ts` directly. Success criterion 6 requires this explicitly.
    - **P3-002 hint text assembly**: The FE agent must extract the conditional
      `{targetBasePath}/{dirname}/.claude/` display logic as a named constant
      or helper rather than an inline JSX expression — watch at SA gate.
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
        <item>Path-traversal guard described with code snippet showing path.resolve(x) === x comparison</item>
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
      <task_id>gander-studio-p3-003a</task_id>
      <agent>BE#2</agent>
      <expected_tag>completion_packet</expected_tag>
      <expected_file>.claude/agents/tasks/outputs/gander-studio-p3-003a-BE-*.md</expected_file>
      <blocks>gander-studio-p3-005</blocks>
      <receipt_check>
        <item>Root cause of blank entry identified (specific agent file + frontmatter field)</item>
        <item>Filter location confirmed as parseAllAgents in agent-parser.ts (not FE only)</item>
        <item>Stderr logging of skipped file path confirmed present</item>
        <item>Lint passing confirmed</item>
      </receipt_check>
    </assignment>

    <assignment>
      <task_id>gander-studio-p3-003b</task_id>
      <agent>BE#3</agent>
      <expected_tag>completion_packet</expected_tag>
      <expected_file>.claude/agents/tasks/outputs/gander-studio-p3-003b-BE-*.md</expected_file>
      <blocks>gander-studio-p3-005</blocks>
      <receipt_check>
        <item>API verification result documented: was code-auditor present in /trpc/agent.list response?</item>
        <item>Root cause of code-auditor missing identified (parser layer or FE display)</item>
        <item>Fix location described (file + line)</item>
        <item>No tier filter default changes (it is already 'all')</item>
        <item>Lint passing confirmed</item>
      </receipt_check>
    </assignment>

    <assignment>
      <task_id>gander-studio-p3-004</task_id>
      <agent>BE#4</agent>
      <expected_tag>completion_packet</expected_tag>
      <expected_file>.claude/agents/tasks/outputs/gander-studio-p3-004-BE-*.md</expected_file>
      <blocks>gander-studio-p3-005</blocks>
      <receipt_check>
        <item>Exact stderr message string included in packet</item>
        <item>Confirmation that non-EADDRINUSE errors still propagate</item>
        <item>tsx watch validation result: EADDRINUSE message visible in npm run dev output (not swallowed)</item>
        <item>Lint passing confirmed</item>
        <item>No port auto-increment logic present</item>
      </receipt_check>
    </assignment>

    <assignment>
      <task_id>gander-studio-p3-005</task_id>
      <agent>AUD#1</agent>
      <expected_tag>audit_report</expected_tag>
      <expected_file>.claude/agents/tasks/outputs/gander-studio-p3-005-AUD-*.md</expected_file>
      <blocks>gander-studio-p3-006</blocks>
      <receipt_check>
        <item>Per-task verdict present for each of P3-001, P3-002, P3-003a, P3-003b, P3-004</item>
        <item>P2 orchestrator filter verification point verdict present</item>
        <item>SA, QA, SX sections present for each task</item>
        <item>Overall sprint verdict stated (PASS or FAIL)</item>
        <item>P3-001 SX gate: code snippet for path.resolve() guard present (not just behavioral test)</item>
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

## Revision Log

| Revision | Source | Change |
|---|---|---|
| BLOCKER 1 (P3-001 SC3) | Critic CR#2 | Replaced `includes('..')` guard spec with `path.resolve(x) === x` normalization requirement in success criterion 3; updated must_not_contain and receipt_check accordingly |
| BLOCKER 2 (P3-003 Bug B) | Critic CR#2 | Replaced tier-filter investigation path with API-first investigation in new P3-003b task; removed all tier-filter fix options |
| WARNING 1 (P3-003 split) | Critic CR#2 | Split P3-003 into P3-003a (blank entry — BE parser fix) and P3-003b (code-auditor investigation — BE+FE); updated dependency_order, routing_notes, and expectation_manifest accordingly; both run parallel to each other and to P3-001/P3-002/P3-004 |
| WARNING 2 (P3-005 tag) | Critic CR#2 | Changed `<expected_tag>plan_critique</expected_tag>` to `<expected_tag>audit_report</expected_tag>` in both the task_packet output_expected and the expectation_manifest for P3-005 |
| WARNING 3 (P3-004 tsx) | Critic CR#2 | Added explicit success criterion 6 requiring the BE agent to run `npm run dev`, trigger port conflict, and confirm EADDRINUSE message surfaces in terminal output under tsx watch; added receipt_check item for tsx validation result |

## Stage 3 — COMPLETE

Decomposition revised and written to:
`/home/jhber/projects/gander-studio-alpha/.claude/agents/tasks/outputs/gander-studio-p3-decompose-PM-1773960700.md`

**Sprint summary (revised):** 5 implementation tasks (3 BE, 1 FE, 1 BE+FE investigation), 1 audit gate, 1 human E2E step. Total agent count: 7. Maximum parallel execution: P3-001 + P3-003a + P3-003b + P3-004 can run concurrently; P3-002 must wait for P3-001; audit waits for all five; human waits for audit.
