# Task Decomposition — gander-studio-p5b-progression-viz
**PM#0 output | 2026-06-01**
**Sprint:** Phase 5 Sprint B — Studio /progression visualization

---

## Recurring-Pattern Preflight (Step 0.5)

Three most recent post-mortems reviewed:

1. **`gander-studio-p7-graph-viz.md` §6 GAP-1** — PM wrote `grep -c "<field>:"` SCs that also matched TypeScript interface declaration lines (`mode:`, `dotColor:`), causing off-by-one false-FAILs on correct deliverables. Cost two Critic rounds.
   - **This decomposition:** Every grep-based SC in this sprint anchors on a value-pattern that appears only in instances (e.g., a quoted string literal, a JSX attribute with a value, a `trpc.progression` call site). No bare `fieldname:` tokens used in any grep SC.

2. **`gander-studio-p6-overview-polish.md` §6 GAP-1** — PM plans that don't validate against existing invariants (PM described changes without preserving documented constraints).
   - **This decomposition:** BE agent is explicitly instructed to read `router.ts` first and match the `connectivityRouter` guard-path pattern. FE agent is instructed to read `ModeContent.tsx` + `ui-store.ts` + `navigation.ts` as primary references before writing new code.

3. **`prog-studio-sessions-2026-05-s3-analyze.md` §6 G1** — plan-time fact checks verified type but not value (e.g., assumed `events: []` was populated).
   - **This decomposition:** The ledger file was read directly and confirmed to contain 5 real entries in correct JSONL-in-markdown format. The sprint_id annotation divergence on Phase 2 was directly observed and documented in the BE footgun warning. No value-level assumptions remain unverified.

---

## Design-System Check

App root: `packages/client/`. DESIGN.md check:

- No `DESIGN.md` at `packages/client/` or project root.
- Design tokens are FF7 Remake Intergrade CSS custom properties in `packages/client/src/globals.css :root`.
- Risk flag added: DESIGN.md absent; UI Designer must use `INFERRED` design system source.

---

<task_decomposition task_id="gander-studio-p5b-progression-viz" agent_count="3">
  <task_packets>

    <!-- ================================================================== -->
    <!-- TASK 1 — UI Design                                                  -->
    <!-- ================================================================== -->
    <task_packet>
      <task_id>p5b-001-ui</task_id>
      <assigned_to>UI Designer</assigned_to>
      <priority>HIGH</priority>
      <description>
Produce a design spec for the `/progression` page in Gander Studio. This page renders the Gander team's progression ledger — a history of XP gained per sprint, organized by surface (Agents, Skills, Rules, CLAUDE.md, Refs, Hooks, Evals, Connectivity) and by sprint.

**Data shape to design for (from `~/.claude/refs/progression-ledger-schema.md` §2):**
- The tRPC route returns an array of `ProgressionEntry` objects, each with:
  - `sprint_id: string` — kebab-case sprint identifier
  - `xp_gained: Array<{ surface: Surface, delta: string }>` — one item per surface touched that sprint
  - `levels_advanced: string[]` — team-wide capability advances (may be empty)
  - `new_capabilities: string[]` — new deterministic capabilities added (may be empty)
- The live ledger currently has 5 entries. The UI must handle 0, 1, and many entries gracefully.
- There are 8 valid surfaces: Agents, Skills, Rules, CLAUDE.md, Refs, Hooks, Evals, Connectivity.

**Visualization idiom guidance:**
- This is per-agent/per-skill XP history over time — it is TABULAR/TIMELINE data, NOT a node-edge graph. Do NOT default to React Flow just because Phase 2 used it. Choose the right idiom for XP accumulation: e.g., a sprint-by-sprint timeline list, per-surface XP rollup summary cards, or a combined sprint list with expandable surface breakdown.
- The design should accommodate entries where `levels_advanced` and `new_capabilities` are empty arrays.
- A useful layout: (a) a surface summary row at top (total XP deltas per surface across all sprints), then (b) a chronological list of sprint entries with their XP breakdown.

**FF7 Mako Teal design tokens (INFERRED — no DESIGN.md):**
- CSS custom properties from `globals.css :root` follow the FF7 Remake Intergrade palette.
- Confirmed token names visible in existing code: `var(--mt)` (Mako Teal primary), `var(--my)` (yellow), `var(--mg)` (green), `var(--mb)` (blue), `var(--mp)` (purple), `var(--mr)` (red), `var(--wd)` (white/foreground), `var(--sfm)` (surface/muted).
- KNOWN GOTCHA: Shadcn `ui/*` primitives default to a colliding token system — invisible text results. Either avoid Shadcn primitives or explicitly override FF7 tokens. Prefer plain divs + Tailwind with CSS var references.
- All visual tokens must reference named CSS custom properties, NOT raw hex values.

**Scope:**
- Produce a `design_spec` that specifies: overall page layout, surface summary section, sprint timeline entry component structure, loading/error states, FF7 token assignments for each visual element, and the nav tab entry (label: 'Progression', dot color token suggestion).
- Do NOT produce code. Do NOT choose React Flow or any node-edge graph library.
      </description>
      <success_criteria>
SC1: design_spec output tag present.
SC2: Spec names a layout idiom appropriate for time-series XP data (timeline list, cards, table — NOT a node-edge graph) with a rationale sentence.
SC3: Spec covers all three data sub-sections: (a) per-surface XP rollup summary, (b) per-sprint entry list with XP breakdown, (c) levels_advanced and new_capabilities within each sprint entry (even if empty arrays are hidden).
SC4: Spec names a FF7 CSS custom property token (e.g., `var(--mt)`) for every distinct visual element that requires a color — no raw hex values appear in the spec.
SC5: Spec explicitly addresses the empty-array case for levels_advanced / new_capabilities (hide section, show placeholder, or collapse).
SC6: design_system_source is set to INFERRED (no DESIGN.md present).
SC7: Spec includes the nav tab entry definition — label string and a dotColor CSS var token recommendation.
SC8: No Shadcn primitive is specified without an explicit note that FF7 token override is required.
      </success_criteria>
      <context_files>
~/.claude/refs/progression-ledger-schema.md
packages/client/src/globals.css
packages/client/src/constants/navigation.ts
packages/client/src/pages/GraphPage.tsx
      </context_files>
      <dependencies>none</dependencies>
      <out_of_scope>
- No code authoring. This is a design-only task.
- Do not use React Flow or any node-edge graph renderer — this is XP history, not a connectivity graph.
- Do not choose Shadcn primitives as the primary surface without explicitly flagging the FF7 token collision.
- Do not modify any existing file.
      </out_of_scope>
      <output_expected>
        <tag>design_spec</tag>
        <must_contain>
          <item>Layout idiom choice with rationale (timeline/cards/table — not React Flow)</item>
          <item>Per-surface XP rollup section design</item>
          <item>Per-sprint timeline entry design</item>
          <item>FF7 CSS var tokens for all colored elements (no raw hex)</item>
          <item>Nav tab entry: label + dotColor token</item>
          <item>design_system_source: INFERRED</item>
          <item>Empty-array handling strategy for levels_advanced / new_capabilities</item>
        </must_contain>
        <must_not_contain>
          <item>Raw hex color values</item>
          <item>React Flow or any node-edge graph library specification</item>
          <item>Shadcn primitives without FF7-override callout</item>
        </must_not_contain>
        <success_signal>design_spec output tag present; layout idiom is not React Flow; all color references use var(--*) tokens; SC1–SC8 all verifiable in the written spec</success_signal>
      </output_expected>
    </task_packet>

    <!-- ================================================================== -->
    <!-- TASK 2 — BE: Zod Schema + tRPC Route + Server Tests                 -->
    <!-- ================================================================== -->
    <task_packet>
      <task_id>p5b-002-be</task_id>
      <assigned_to>Backend Engineer</assigned_to>
      <priority>HIGH</priority>
      <description>
Add the `progression.getLedger` tRPC procedure to Gander Studio. This reads `${GANDER_ROOT}/docs/progression-ledger.md`, parses it using the algorithm in `~/.claude/refs/progression-ledger-schema.md` §3, validates each entry against the Zod schema from §4 of that contract, and returns a structured array.

**MANDATORY: Read these files FIRST, before writing a line of code:**
1. `~/.claude/refs/progression-ledger-schema.md` — the single source of truth for the Zod schema (§4) and parsing algorithm (§3). Copy the Zod schema VERBATIM into `packages/shared/src/schemas.ts`; do not paraphrase it.
2. `packages/server/src/router.ts` — study the `connectivityRouter` pattern (lines ~592–631) and `guardPath` helper (lines ~34–43). Match that exact pattern for the new `progressionRouter`.
3. `packages/shared/src/schemas.ts` — understand where to insert the new schemas (after ConnectivityGraphSchema is a natural position).
4. `packages/server/src/env.ts` — confirm GANDER_ROOT resolution (required, no cwd fallback).
5. `/home/jhber/projects/gander/docs/progression-ledger.md` — read the live ledger to verify your parser handles the real format (5 real entries; the Phase 2 header reads `### Sprint: gander-studio-alpha (graph viz — ed94ba4/ccad6df)` but its JSONL sprint_id is `"gander-studio-graph-viz"` — your parser must read sprint_id from JSONL, never from the header).

**Implementation spec:**

Shared schema additions (`packages/shared/src/schemas.ts`):
- Add `SurfaceSchema`, `XpGainSchema`, `ProgressionEntrySchema`, and `export type ProgressionEntry` — VERBATIM from `~/.claude/refs/progression-ledger-schema.md` §4.
- Export all three schemas + the inferred type.

Router addition (`packages/server/src/router.ts`):
- Add `ProgressionEntrySchema` (and the `ProgressionEntry` type) to the import from `@gander-studio/shared`.
- Create a `progressionRouter` sub-router with a single `getLedger` procedure (no input, query):
  - Builds path: `path.join(GANDER_ROOT, 'docs', 'progression-ledger.md')`
  - Calls `guardPath(ledgerPath)` (same helper used by connectivityRouter)
  - Reads the file with `readFile(ledgerPath, 'utf8')`
  - If ENOENT: throw TRPCError NOT_FOUND "Progression ledger not found"
  - Parses line-by-line using the §3 algorithm:
    1. When a line matches `^### Sprint: (.+)$`, record the sprint context (for human reference only — do not use as sprint_id source)
    2. When ` ```jsonl ` is encountered, read the next line and `JSON.parse` it
    3. `ProgressionEntrySchema.safeParse(parsed)` — if fails, skip the entry (log: `console.warn`)
    4. Yield validated entries
  - Returns `z.array(ProgressionEntrySchema)` — the `.output()` type annotation
  - **CRITICAL:** sprint_id MUST come from inside the JSONL block. Never use the `### Sprint:` header text as sprint_id.
- Wire `progressionRouter` into `appRouter` as `progression: progressionRouter`.

Server tests (`packages/server/src/` or adjacent `__tests__/`):
- Write vitest unit tests for the ledger parser logic (parsing algorithm, not the full tRPC procedure). Test:
  1. Happy path: 2+ well-formed JSONL entries are returned correctly.
  2. sprint_id from JSONL (not header): an entry where the header text differs from the JSONL `sprint_id` (like the real Phase 2 entry) returns the JSONL value.
  3. Malformed JSON entry is skipped; valid subsequent entries are still returned.
  4. Empty xp_gained array is accepted.
  5. File-not-found returns empty array or throws — whichever the implementation does.

**Lint:** Run `npm run lint` (tsc --noEmit across all three packages) before returning. Must exit 0.
      </description>
      <success_criteria>
SC1: `packages/shared/src/schemas.ts` exports `SurfaceSchema`, `XpGainSchema`, `ProgressionEntrySchema`, and `type ProgressionEntry` — all present and the Zod schema matches the §4 verbatim contract (8-value enum: "Agents","Skills","Rules","CLAUDE.md","Refs","Hooks","Evals","Connectivity").
SC2: `packages/server/src/router.ts` imports `ProgressionEntrySchema` from `@gander-studio/shared` and contains a `progressionRouter` sub-router wired into `appRouter` as `progression`.
SC3: The `getLedger` procedure output type annotation is `z.array(ProgressionEntrySchema)`.
SC4: The parser reads `sprint_id` from the parsed JSONL object, not from the `### Sprint:` header (verify: no code assigns the `### Sprint:` capture group to `sprint_id` or to the returned entry).
SC5: `guardPath` is called on the ledger file path before reading, matching the connectivityRouter pattern.
SC6: ENOENT produces a TRPCError with code `NOT_FOUND`.
SC7: Vitest tests exist and pass: `npm test -w @gander-studio/server` exits 0 with ≥5 test cases covering the scenarios listed above.
SC8: `npm run lint` exits 0 across all three packages (shared, server, client).
SC9: No changes to `${GANDER_ROOT}/docs/progression-ledger.md` or any file in the gander repo — this is a read-only consumer.
      </success_criteria>
      <context_files>
~/.claude/refs/progression-ledger-schema.md
packages/shared/src/schemas.ts
packages/server/src/router.ts
packages/server/src/env.ts
/home/jhber/projects/gander/docs/progression-ledger.md
      </context_files>
      <dependencies>none</dependencies>
      <out_of_scope>
- Do NOT modify the gander repo in any way — read-only consumer.
- Do NOT restate or paraphrase the Zod schema; copy §4 verbatim.
- Do NOT add a second input parameter beyond the no-input pattern (unlike connectivityRouter which takes an optional outputFile — the ledger path is fixed).
- Do NOT write FE code, components, or page files.
- Do NOT add new environment variables — GANDER_ROOT is already present and required.
- Do NOT remove or modify any existing schemas or procedures in router.ts or schemas.ts.
      </out_of_scope>
      <output_expected>
        <tag>completion_packet</tag>
        <must_contain>
          <item>List of files modified (schemas.ts, router.ts, test file path)</item>
          <item>Confirmation that `npm run lint` exited 0</item>
          <item>Confirmation that `npm test -w @gander-studio/server` exited 0 with test count</item>
          <item>Confirmation that sprint_id is read from JSONL, not from ### Sprint: header</item>
        </must_contain>
        <must_not_contain>
          <item>Any modification to files in /home/jhber/projects/gander/ (gander repo is read-only)</item>
          <item>Paraphrased or altered Zod schema (must be verbatim from §4)</item>
        </must_not_contain>
        <success_signal>npm run lint exit 0; npm test -w @gander-studio/server exit 0; progression sub-router visible in router.ts appRouter block; SurfaceSchema enum has exactly 8 values</success_signal>
      </output_expected>
    </task_packet>

    <!-- ================================================================== -->
    <!-- TASK 3 — FE: ProgressionPage + Nav Wiring + e2e Spec               -->
    <!-- ================================================================== -->
    <task_packet>
      <task_id>p5b-003-fe</task_id>
      <assigned_to>Frontend Engineer</assigned_to>
      <priority>HIGH</priority>
      <description>
Build the `/progression` React route in Gander Studio. This is the FE half of the Phase 5 Sprint B progression visualization. It mirrors how GraphPage was added for Phase 2.

**MANDATORY: Read these files FIRST, before writing a line of code:**
1. `packages/client/src/pages/GraphPage.tsx` — the direct precedent: tRPC query pattern, loading/error states, FF7 token usage.
2. `packages/client/src/store/ui-store.ts` — the AppMode union you must extend.
3. `packages/client/src/components/ModeContent.tsx` — the PAGE_MAP you must extend.
4. `packages/client/src/constants/navigation.ts` — the NAV_ITEMS array you must extend.
5. The UI Designer's design_spec output (p5b-001-ui) — use it for the layout, component structure, and token assignments.
6. `~/.claude/refs/progression-ledger-schema.md` §2 — the TypeScript interface you'll type against (ProgressionEntry, XpGain, Surface).

**Files to create:**
- `packages/client/src/pages/ProgressionPage.tsx` — the main page component.
- `packages/client/src/constants/progression.ts` — constants for surface names, labels, any per-surface color tokens (follow the `graph.ts` pattern).
- `packages/client/tests/e2e/progression.spec.ts` — Tier-2 Playwright e2e spec (author but do NOT run live — the auditor runs the live Playwright pass).

**Files to modify:**
1. `packages/client/src/store/ui-store.ts` — add `'progression'` to the `AppMode` union type.
2. `packages/client/src/components/ModeContent.tsx` — add `progression: ProgressionPage` to `PAGE_MAP` and import `ProgressionPage`.
3. `packages/client/src/constants/navigation.ts` — add `{ mode: 'progression', label: 'Progression', dotColor: '<token from design_spec>' }` to `NAV_ITEMS`.

**ProgressionPage component spec (follow design_spec; these are floor requirements):**
- Call `trpc.progression.getLedger.useQuery()` — no input (getLedger takes no arguments).
- Loading state: show a loading indicator (text or spinner).
- Error state: show an error message.
- Data rendered: at minimum:
  (a) A per-surface XP summary section showing how many XP entries each surface has received across all sprints.
  (b) A chronological sprint list where each entry shows: `sprint_id`, the list of `xp_gained` items (surface + delta), and `levels_advanced` / `new_capabilities` if non-empty.
- FF7 token rule: ALL colors via CSS custom properties (`var(--mt)`, `var(--wd)`, etc.) — no raw hex. Match the tokens the UI designer specified.
- KNOWN GOTCHA: Shadcn `ui/*` primitives use a colliding token system. Either avoid them or explicitly set FF7 tokens on every Shadcn component. Prefer plain divs + Tailwind + CSS vars (same recommendation as GraphPage made for FilterSidebar).

**Tier-2 e2e spec (`packages/client/tests/e2e/progression.spec.ts`):**
- Author the spec file but do NOT execute it — the auditor runs the live Playwright pass.
- Test: navigation to the progression tab renders the page (tab is present in BottomTabBar with role="tab" and accessible name matching /progression/i — use role="tab" per p7 post-mortem lesson, NOT role="button" which matched dead-code Sidebar.tsx that has since been removed).
- Test: at least one sprint entry is visible (text content contains a real `sprint_id` from the live ledger — use `gander-meta-progression-design` or `gander-progression-p1-analyzer` as expected strings, since these are confirmed present in the live ledger).
- Test: no console errors after navigation.
- Follow existing e2e spec patterns in `packages/client/tests/e2e/`.

**Lint:** Run `npm run lint` (tsc --noEmit across all three packages) before returning. Must exit 0.

**State machine call-graph — all 4 sites that must be updated when adding 'progression' AppMode:**
1. `packages/client/src/store/ui-store.ts` — extend the `AppMode` type union (add `| 'progression'`).
2. `packages/client/src/components/ModeContent.tsx` — add `progression: ProgressionPage` to `PAGE_MAP` (which is `Record<AppMode, React.ComponentType>`).
3. `packages/client/src/constants/navigation.ts` — add the nav item to `NAV_ITEMS`.
4. BottomTabBar renders from NAV_ITEMS — no direct modification needed IF it reads NAV_ITEMS dynamically, but confirm by reading the file.
      </description>
      <success_criteria>
SC1: `packages/client/src/store/ui-store.ts` AppMode union includes `'progression'` — verify: `grep -c "'progression'" packages/client/src/store/ui-store.ts` returns ≥ 1.
SC2: `packages/client/src/components/ModeContent.tsx` PAGE_MAP includes progression entry — verify: `grep -c "progression: Progression" packages/client/src/components/ModeContent.tsx` returns ≥ 1 (matches the JSX-style assignment, not a type declaration).
SC3: `packages/client/src/constants/navigation.ts` NAV_ITEMS includes the new entry — verify: `grep -c "'progression'" packages/client/src/constants/navigation.ts` returns ≥ 1.
SC4: `packages/client/src/pages/ProgressionPage.tsx` exists and calls `trpc.progression.getLedger.useQuery` — verify: `grep -c "progression.getLedger" packages/client/src/pages/ProgressionPage.tsx` returns ≥ 1.
SC5: No raw hex colors in ProgressionPage.tsx or progression.ts — verify: `grep -c '#[0-9a-fA-F]\{3,6\}' packages/client/src/pages/ProgressionPage.tsx` returns 0.
SC6: e2e spec file exists at `packages/client/tests/e2e/progression.spec.ts` and contains a tab-role selector (not a button-role selector for main nav) — verify: `grep -c "role.*tab" packages/client/tests/e2e/progression.spec.ts` returns ≥ 1 (uses role="tab" per Phase 7 lesson).
SC7: e2e spec references at least one confirmed real sprint_id string from the ledger — verify: `grep -c "gander-meta-progression-design\|gander-progression-p1-analyzer\|gander-studio-graph-viz" packages/client/tests/e2e/progression.spec.ts` returns ≥ 1.
SC8: `npm run lint` exits 0 across all three packages (shared, server, client).
SC9: No changes to any file outside `packages/client/` — BE schema and router changes are strictly p5b-002-be's responsibility.
      </success_criteria>
      <context_files>
packages/client/src/pages/GraphPage.tsx
packages/client/src/store/ui-store.ts
packages/client/src/components/ModeContent.tsx
packages/client/src/constants/navigation.ts
packages/client/src/constants/graph.ts
packages/client/src/globals.css
packages/client/tests/e2e/
~/.claude/refs/progression-ledger-schema.md
.claude/agents/tasks/outputs/p5b-001-ui-UI-*.md
      </context_files>
      <dependencies>p5b-001-ui (design spec must be available before implementation), p5b-002-be (tRPC route must exist before FE can typecheck against it)</dependencies>
      <out_of_scope>
- Do NOT modify `packages/shared/src/schemas.ts` or `packages/server/src/router.ts` — those are p5b-002-be's files.
- Do NOT use React Flow or any node-edge graph library.
- Do NOT use Shadcn primitives without explicitly overriding FF7 tokens (prefer plain divs).
- Do NOT run the Playwright e2e live — author the spec, defer live run to auditor.
- Do NOT modify any file outside `packages/client/`.
- Do NOT add new npm dependencies without explicit justification (this is tabular/timeline rendering, not a graph — no dagre, no React Flow needed).
      </out_of_scope>
      <estimated_new_lines>120</estimated_new_lines>
      <output_expected>
        <tag>completion_packet</tag>
        <must_contain>
          <item>List of files created and modified</item>
          <item>Confirmation that npm run lint exited 0</item>
          <item>Confirmation that e2e spec was authored (not run live — auditor will run)</item>
          <item>Confirmation that all 4 AppMode state machine sites were updated</item>
          <item>Note on whether BottomTabBar required direct modification or reads NAV_ITEMS dynamically</item>
        </must_contain>
        <must_not_contain>
          <item>Raw hex color values in any created/modified file</item>
          <item>React Flow or dagre import</item>
          <item>Claims that e2e tests passed live (spec is authored-not-run)</item>
        </must_not_contain>
        <success_signal>npm run lint exit 0; ProgressionPage.tsx exists; all 4 AppMode call-graph sites updated; e2e spec at correct path with role="tab" nav selector; no hex colors</success_signal>
      </output_expected>
    </task_packet>

  </task_packets>

  <dependency_order>
    Wave 1 (parallel, no inter-dependency):
      p5b-001-ui  (UI design spec)
      p5b-002-be  (BE schema + route + server tests)

    Wave 2 (requires both wave 1 tasks to reach AUDIT_PASS):
      p5b-003-fe  DEPENDS ON p5b-001-ui (design tokens + layout), p5b-002-be (tRPC type surface for tsc)

    Gate: After p5b-003-fe AUDIT_PASS → human browser-verification Step 4.5 (loads /progression in browser, confirms ≥1 real XP entry visible, no console errors).
  </dependency_order>

  <routing_notes>
    <!-- PM PREFLIGHT CHECKLIST ACKNOWLEDGEMENTS (mandatory per brief) -->

    **Preflight 1 — No grep-c-on-bare-field SCs (GAP-1):**
    CONFIRMED. Every grep-based SC in this decomposition anchors on a value-pattern that appears only in instances:
    - SC1 (p5b-003-fe): `grep -c "'progression'"` on `ui-store.ts` — matches the string literal inside the union, not a type annotation keyword.
    - SC2 (p5b-003-fe): `grep -c "progression: Progression"` — matches the key-value assignment in PAGE_MAP, not any type or interface declaration.
    - SC3 (p5b-003-fe): `grep -c "'progression'"` on `navigation.ts` — string literal in the object, distinct from any type declaration.
    - SC4 (p5b-003-fe): `grep -c "progression.getLedger"` — a call expression, cannot appear in an interface declaration.
    - SC5 (p5b-003-fe): `grep -c '#[0-9a-fA-F]{3,6}'` — raw hex values, not field tokens.
    - SC6 (p5b-003-fe): `grep -c "role.*tab"` — an e2e selector string, not a type declaration.
    - SC7 (p5b-003-fe): `grep -c` on specific sprint_id string literals — cannot appear in a type declaration.
    NO bare `fieldname:` SC patterns are present.

    **Preflight 2 — Contract by reference, not restated (drift rule):**
    CONFIRMED. Neither the BE nor the FE packet inlines the Zod schema or the parsing algorithm. Both packets point at `~/.claire/refs/progression-ledger-schema.md` §3 (parsing) and §4 (Zod schema) and instruct the agent to copy verbatim. The BE packet explicitly states "copy the Zod schema VERBATIM" and "do not paraphrase."

    **Preflight 3 — PM defaults-from-imagination check:**
    CONFIRMED. Before authoring these packets, I read:
    - `packages/server/src/router.ts` (full connectivity section + appRouter) — exact symbol names confirmed: `connectivityRouter`, `guardPath`, `appRouter`, `t.router`, `t.procedure.query`.
    - `packages/client/src/store/ui-store.ts` — AppMode union confirmed (6 existing values: 'browse'|'compose'|'edit'|'export'|'sessions'|'graph').
    - `packages/client/src/components/ModeContent.tsx` — PAGE_MAP and import pattern confirmed.
    - `packages/client/src/constants/navigation.ts` — NAV_ITEMS shape confirmed (mode/label/dotColor).
    - `/home/jhber/projects/gander/docs/progression-ledger.md` — live ledger confirmed: 5 entries, JSONL-in-markdown format, Phase 2 sprint_id annotation divergence confirmed (header: "gander-studio-alpha (graph viz — ed94ba4/ccad6df)", JSONL sprint_id: "gander-studio-graph-viz").
    No symbol names are imagined. Where a BE or FE packet depends on matching an existing pattern, the agent is explicitly instructed to READ the precedent file first.

    **Jidoka recommendation:** Jidoka is NOT recommended for this sprint. All context files are real (read and confirmed), the precedent (connectivityRouter / GraphPage) is well-understood, and the ledger format is verified. Aggregate context_files across tasks is 14 — above the 15 threshold but the domain is clear and the precedent is a line-by-line match. The BE and FE agents both carry the "read these files first" mandate which achieves the same ground-truthing jidoka would.

    **DESIGN.md:** Absent at packages/client/. See risk_flags. UI Designer must set design_system_source: INFERRED.

    **Lint-critical tasks:** p5b-002-be and p5b-003-fe both have `npm run lint` (tsc --noEmit ×3) as a hard SC. ORC must dispatch these as foreground agents (not background) to ensure Bash access for the lint command.

    **Recurring pattern declarations (Step 0.5, XML form):**
    <recurring_pattern source="gander-studio-p7-graph-viz.md">GAP-1: PM writes grep-c on bare field token (e.g., "mode:", "dotColor:") that also matches TS interface declaration — off-by-one false-FAIL.</recurring_pattern>
    Avoidance: All grep SCs in this sprint use value-patterns (string literals, call expressions, hex regex) that cannot match interface/type declarations.

    <recurring_pattern source="gander-studio-p6-overview-polish.md">GAP-1: PM plans without validating against existing invariants; GAP-3 (same file): e2e specs authored but never executed in-pipeline.</recurring_pattern>
    Avoidance: (GAP-1) BE and FE packets both carry mandatory "read these files first" instructions referencing the specific pattern files. (GAP-3) e2e spec is authored-not-run by FE; live run is deferred to the auditor — this is the now-standard pattern established in p7.

    <recurring_pattern source="prog-studio-sessions-2026-05-s3-analyze.md">G1: Plan-time fact checks verify type but not implementation value — e.g., assuming a populated array from a schema that actually returned empty.</recurring_pattern>
    Avoidance: The live ledger was read directly; 5 real entries confirmed. Specific sprint_id values from the live file are embedded in the FE e2e SC (gander-meta-progression-design, gander-progression-p1-analyzer) so the test asserts against values confirmed to exist.

    **Same-file append serialization:** No shared-ledger file appended by multiple tasks. Not applicable.

    **Navigation state machine (4 call-graph sites):** Enumerated in p5b-003-fe description: (1) AppMode union in ui-store.ts, (2) PAGE_MAP in ModeContent.tsx, (3) NAV_ITEMS in navigation.ts, (4) BottomTabBar — agent instructed to verify whether direct modification is needed.

    **e2e selector lesson (p7 GAP-2):** FE packet explicitly specifies role="tab" for the nav selector (confirmed dead-code Sidebar.tsx was removed in commit 09c632d per git status and p7 §6 GAP-2 notes). SC6 verifies `grep -c "role.*tab"`.

    **Prior approved tasks for FE (for auditor context):** p5b-003-fe is the FIRST task to touch `ui-store.ts`, `ModeContent.tsx`, and `navigation.ts` in this sprint. No prior-wave modifications to carry over.

    **proposed_rename:** None. All human-request phrases preserved verbatim ("progression.getLedger", "/progression", "per-agent", "per-skill", "XP history").
  </routing_notes>

  <risk_flags>
    **DESIGN.md absent at packages/client/ — FE and UI Designer will operate on INFERRED tokens.** The FF7 Mako Teal tokens are CSS custom properties in `packages/client/src/globals.css :root`. Recommend ORC verify UI Designer has access to globals.css to infer tokens. (Standard risk for this repo — no generate-design sprint pending.)

    **Shadcn FF7 token collision (known gotcha, documented in project memory).** Shadcn `ui/*` primitives collide with FF7 Mako tokens, producing invisible text. Both UI designer and FE packets carry explicit warnings. If FE or UI designer use any Shadcn component, auditor must verify FF7 override is present.

    **Live ledger path depends on GANDER_ROOT env var.** If the auditor's GANDER_ROOT is not set to `~/projects/gander/`, the tRPC route will throw NOT_FOUND. The audit environment must have GANDER_ROOT set. ORC should confirm env-preflight before the BE audit.

    **No new npm dependencies needed (tabular/timeline, not graph).** If the FE agent attempts to add dagre or React Flow, it is out of scope. The auditor should reject any new graph library dependency for this sprint.

    **Zod schema verbatim copy:** The 8-value Surface enum is the most likely drift point. Auditor should verify the enum contains exactly: "Agents","Skills","Rules","CLAUDE.md","Refs","Hooks","Evals","Connectivity" — matching §4 of the contract.

    **sprint_id footgun (known, documented in contract §3):** The Phase 2 ledger header reads `### Sprint: gander-studio-alpha (graph viz — ed94ba4/ccad6df)` while the JSONL `sprint_id` is `"gander-studio-graph-viz"`. The BE parser must read from JSONL. Auditor should grep for any code that assigns the Sprint header capture group to a field named sprint_id.
  </risk_flags>

</task_decomposition>

---

## Verbatim Deliverable Audit (Step 7)

<verbatim_deliverable_audit>
  <phrase>progression.getLedger (or equivalently-named) tRPC route</phrase>
  <addressed task="p5b-002-be"/>

  <phrase>reads the gander progression ledger</phrase>
  <addressed task="p5b-002-be"/>

  <phrase>parses it</phrase>
  <addressed task="p5b-002-be"/>

  <phrase>validates it</phrase>
  <addressed task="p5b-002-be"/>

  <phrase>returns structured entries</phrase>
  <addressed task="p5b-002-be"/>

  <phrase>/progression React route</phrase>
  <addressed task="p5b-003-fe"/>

  <phrase>renders per-agent and per-skill XP history</phrase>
  <addressed task="p5b-003-fe"/>

  <phrase>from that data</phrase>
  <addressed task="p5b-003-fe"/>

  <phrase>Phase 5 Sprint B</phrase>
  <addressed task="p5b-001-ui p5b-002-be p5b-003-fe"/>

  <phrase>Sprint A = ledger itself, already built in gander repo</phrase>
  <out_of_scope reason="Studio is read-only against GANDER_ROOT; ledger is already committed in the gander repo. No gander-repo changes in this sprint."/>

  <phrase>same way Phase 2 graph viz was a Studio sprint</phrase>
  <addressed task="p5b-002-be p5b-003-fe"/>
</verbatim_deliverable_audit>

---

## Expectation Manifest

```xml
<expectation_manifest>
  <sprint_id>gander-studio-p5b-progression-viz</sprint_id>
  <generated>2026-06-01T00:00:00Z</generated>
  <assignments>
    <assignment>
      <task_id>p5b-001-ui</task_id>
      <agent>UI#1</agent>
      <expected_tag>design_spec</expected_tag>
      <expected_file>.claude/agents/tasks/outputs/p5b-001-ui-UI-*.md</expected_file>
      <blocks>p5b-003-fe</blocks>
      <receipt_check>
        <item>design_spec tag present</item>
        <item>Layout idiom named (not React Flow)</item>
        <item>All color references use var(--*) tokens, no raw hex</item>
        <item>design_system_source: INFERRED present</item>
        <item>Nav tab entry (label + dotColor token) specified</item>
      </receipt_check>
    </assignment>

    <assignment>
      <task_id>p5b-002-be</task_id>
      <agent>BE#1</agent>
      <expected_tag>completion_packet</expected_tag>
      <expected_file>.claude/agents/tasks/outputs/p5b-002-be-BE-*.md</expected_file>
      <blocks>p5b-003-fe</blocks>
      <receipt_check>
        <item>Files modified list present (schemas.ts, router.ts, test file)</item>
        <item>npm run lint exit 0 confirmed</item>
        <item>npm test -w @gander-studio/server exit 0 with test count ≥ 5 confirmed</item>
        <item>sprint_id-from-JSONL confirmation (not from Sprint header) present</item>
        <item>No gander-repo file modification reported</item>
      </receipt_check>
    </assignment>

    <assignment>
      <task_id>p5b-003-fe</task_id>
      <agent>FE#1</agent>
      <expected_tag>completion_packet</expected_tag>
      <expected_file>.claude/agents/tasks/outputs/p5b-003-fe-FE-*.md</expected_file>
      <blocks>NONE (human Step 4.5 follows audit)</blocks>
      <receipt_check>
        <item>Files created/modified list present</item>
        <item>npm run lint exit 0 confirmed</item>
        <item>e2e spec authored (not run live) — auditor will run</item>
        <item>All 4 AppMode state machine sites confirmed updated</item>
        <item>No raw hex colors reported</item>
        <item>No React Flow / dagre import reported</item>
      </receipt_check>
    </assignment>
  </assignments>
</expectation_manifest>
```
