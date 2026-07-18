# Orchestrator Brief — prog-studio-v2-2026-07-s5-integration

<orchestrator_brief task_id="prog-studio-v2-2026-07-s5-integration" priority="NORMAL">

<human_request>
Execute the prog-studio-v2-2026-07 integration mop-up sprint. The PRIMARY REQUIREMENT SOURCE is
`docs/programs/prog-studio-v2-2026-07/sprints/integration/orchestrator_brief.md` — read it and treat
its "Residue Items" + "Success Criteria for Integration Sprint" sections as the requirement set,
with this scope adjustment: **SC-1 (SC-5 amendment ratify/reject) is ALREADY DISCHARGED** — human
RATIFIED 2026-07-18, recorded in `docs/after-actions/prog-studio-v2-2026-07-s4-retirement.md`
§Addendum. Remaining scope is exactly SC-2..SC-5 (residue items 1–4). Verbatim human decision
record: `.claude/tasks/outputs/prog-studio-v2-2026-07-s5-integration-human-request.md`.
</human_request>

<context>
**Program state:** prog-studio-v2-2026-07 is STITCHED (all 4 siblings DONE, 5/5 seams verified at
`dcfede7`). This is a mop-up/sign-off sprint — no seam repair. Current HEAD: `f2164bb` on branch
`feat/studio-sessions-feed-agentstats`.

**ORC-verified ground facts (all verified this session, 2026-07-18, at HEAD f2164bb):**

1. `packages/client/src/components/ui/dialog.tsx` is 98 lines and contains NO `initialFocus` or
   `focusOnReady` handling (grep exit 1, ORC-verified). `packages/client/src/components/ui/popover.tsx`
   also exists. Full `ui/` inventory: button, dialog, error-state, input, popover, select,
   shimmer-box, textarea.
2. Reference implementation for the safe-focus pattern:
   `packages/client/src/components/detail/ReviseSpecAction.tsx` lines 85–90 + 179 —
   `initialFocus={() => textareaRef.current ?? false}` with explanatory comment citing
   prog-studio-v2-2026-07-s3-drilldowns-t3-rem2 (base-ui `initialFocus` ref resolution timing).
3. `packages/client/src/components/detail/RelationshipPanel.tsx` exists (untouched since `54dbef8`
   per the skein brief); it renders inside a half-width `md:grid-cols-2` cell on AgentDetailPage.
4. Empty dirs CONFIRMED empty: `packages/client/src/components/{browse,edit,graph}/` (ls verified).
5. `quickcheck.mjs` / `quickcheck2.mjs` DO NOT EXIST anywhere in the repo (repo-wide find,
   ORC-verified). The hygiene packet must VERIFY-ABSENT and record this — do NOT invent a deletion.
6. Stale comments confirmed at:
   a. `packages/client/src/AppShell.tsx` lines ~6–9 — says "The 9-tab BottomTabBar stays mounted as
      fallback nav this packet (FE-1b retires it…)" — stale post-FE-1b (BottomTabBar is now the
      <640px rail form; the 9-tab fallback is retired).
   b. `packages/server/src/parsers/__tests__/program-dag-parser.test.ts` line 203 — "the actual
      guard is in router.ts exportRouter.spawn" — stale (exportRouter.spawn removed in s4 BE-1).
   c. `docs/v2-vision/v2-design-spec.md` line 324 — SubmenuRail `aria-label="Party screen submenus"`
      — stale (shipped aria-label is "Main navigation", per CLAUDE.md §Surfaces).
   d. `packages/server/src/router.ts` lines 45–47 — STUDIO_ROOT comment says "Planning and
      program.md files live here" — the "Planning" reference is stale (planning.list retired in s4;
      program.md files remain live via program.getDag).
7. Dialog-exercising e2e specs: `packages/client/tests/e2e/prog-studio-v2-2026-07-s3-drilldowns.spec.ts`
   (the s3 absorption suite — SC-2's "8/8") and `prog-studio-vision-s1-contrast-smoke.spec.ts`
   (grep-verified). e2e corpus: 26 spec files under `packages/client/tests/e2e/`.

**E2E baseline (Step 1.7):** ORC is capturing a fresh full-suite baseline at HEAD `f2164bb` RIGHT
NOW (in progress; artifacts will land at
`.claude/tasks/outputs/prog-studio-v2-2026-07-s5-integration-e2e-baseline-{green,red}.txt`).
Every packet SC that asserts suite green MUST be phrased baseline-relative: "zero NEW regressions
vs the s5 baseline artifacts" — never "full suite green" (the corpus carries a classified
pre-existing red floor; s4's SC-5 amendment ratification made baseline-relative SCs the standing
convention). Dev servers are RUNNING (API :3001, Vite :5173) and will stay up for the sprint.

**Deletion-rail routing (MANDATORY for the hygiene packet):** implementing agents must NOT run
`rm`/`find -delete`/fs-API deletions — the `rm` deny-rail plus standards.md §Security Baseline
(deletion-rail integrity, s4 §6 G2 provenance) forbids side-doors. The hygiene packet's agent
ENUMERATES deletion targets (the two empty dirs; anything else discovered in-scope) in its packet
output; ORC executes the removals post-enumeration (`git rm` for tracked files, `rmdir` for empty
dirs) and surfaces any denial to the human. Author the packet's steps and SCs accordingly
(SCs check enumeration + post-ORC-removal state, not agent-performed deletion).

**SC-1 discharge detail:** baseline files `.claude/tasks/outputs/prog-studio-v2-2026-07-s4-retirement-BASELINE-{green,red}.txt`
(115g/67r @ `6c58f40`) are the ratified historical reference; the fresh s5 baseline above is the
operative control for THIS sprint's regressions.

<agent_remits source="auto-extracted from /home/jhber/.claude/agents/*.md at 2026-07-18T03:55:17Z">
The <agent_remits> block below is auto-extracted verbatim from the live agent specs at the
timestamp shown. Treat its content as authoritative. Do NOT infer an agent's remit, write
authority, or constraint set from prior sprints, training-data assumptions, or this sprint's
narrative — quote the <agent_remits> block directly. If a task packet's routing requires an agent
to act outside its quoted remit, surface that as a precursor task_packet rather than asserting the
remit covers it implicitly.

  <agent name="project-manager" version="2.5.0">
    Core Responsibilities: Decomposition (smallest independent units, one owner, unambiguous
    verification); Context guarding (each agent receives only what it needs); Static content
    embedding rule (static content the implementer cannot derive from the codebase is embedded
    verbatim in the task packet or a dedicated context file — never referenced by description);
    Gate enforcement (no task complete without auditor PASS); Failure handling (single specific
    remediation request; 3 consecutive fails → escalate).
    Tool-Call Budget Discipline: soft budget 8 reads per decomposition; read the named reference
    files and STOP; halt-and-surface with <budget_exceeded> if incomplete at cap.
    What the PM Does Not Do: no code, no design, no routing of completed packets, no direct human
    escalation; deliverable is a complete, unambiguous <task_decomposition>.
  </agent>
  <agent name="critic" version="2.2.0">
    Owns: challenging the plan across the Six Challenges (DEPENDENCY, MISSING_RESEARCH, OVERSCOPED,
    ASSUMPTION, AUDIT_RISK, SCOPE_DRIFT) pre-execution; BLOCK verdict halts execution. Read-only:
    finds plan defects, never fixes; file-level claims must be backed by a Read/Grep performed this
    turn. Out of remit: decomposition, implementation, post-implementation verification, dispute
    mediation; never writes to docs/events/.
  </agent>
  <agent name="frontend-engineer" version="2.3.0">
    Task Boundary Compliance: implement ONLY what your task_id authorizes; consolidation requires
    explicit ORC approval; confirm task_id match before issuing ui_packet.
    Domain Boundaries: FE consumes data contracts (Zod schemas from BE), never defines them; when a
    design_spec exists, implement faithfully; flag spec gaps rather than improvising.
  </agent>
  <agent name="code-auditor" version="3.5.0">
    Owns: SA (standards) + QA (functionality) + SX (security) verification over completed work;
    veto (FAIL/INDETERMINATE) returns task to owner. Read-only: identifies defects, never fixes;
    sole sanctioned write is its own verdict file + terminal event. Independence: meta-agent audits
    need a distinct spawn. Out of remit: planning, plan critique, remediation, mediation.
  </agent>
</agent_remits>
</context>

<constraints>
- **Out of scope (verbatim from the skein brief):** the 7 human-ratified deferrals
  (DEFERRED-V2S1-1/2, -P9-1, -V2S2-1, -V2S3-1/2, -V2S4-1 — already ledgered) and the 14 gander-side
  process items (owned by the gander-repo reflect pass). The guarded-push docs-vs-rail contradiction
  is FLAG-ONLY (residue 4b): note it for the reflect-pass intake; do not edit gander files from here.
- Small sprint: 4 residue items → keep decomposition lean (one packet per residue item, or merge the
  two doc/comment-only items if that stays within OVERSCOPED limits — at most 2 independent files
  per domain per packet EXCEPT mechanical same-class comment fixes, which may enumerate all 4 cited
  locations in one packet as a single fix class).
- FE packets must carry `DESIGN.md` (repo root, refreshed 2026-07-11) in <context_files>.
- Suite-green SCs must be baseline-relative (see context). Lint SC: the canonical 3-package tsc
  command from <project_conventions>. Client build SC: `npm run build -w @gander-studio/client`.
- The RelationshipPanel item (residue 2) legitimately ends in EITHER a constant re-tune OR a
  recorded explicit accept — author its SC as a decision-with-evidence (screenshot/measurement
  citation), not a forced code change.
- No new tRPC procedures, no schema changes, no new routes. This sprint touches client components,
  comments, and docs only.
</constraints>

<project_conventions>
<!-- Re-verified 2026-07-18 (s5-integration): full re-scan, all fields IDENTICAL to the 2026-07-07
     block. Canonical persisted copy: docs/project-conventions.md -->
  <package_manager>npm</package_manager>
  <language>TypeScript</language>
  <typescript_strict>true</typescript_strict>
  <test_runner>vitest (unit — client + server) + playwright (e2e — packages/client/tests/e2e)</test_runner>
  <test_command>npm test -w @gander-studio/server (vitest run src/parsers/__tests__); npm test -w @gander-studio/client (vitest run); npx playwright test (e2e, from packages/client)</test_command>
  <lint_command>tsc --noEmit --project packages/shared/tsconfig.json && tsc --noEmit --project packages/server/tsconfig.json && tsc --noEmit --project packages/client/tsconfig.json</lint_command>
  <typecheck_command>same as lint_command (lint IS typecheck — no separate eslint config found)</typecheck_command>
  <build_command>npm run build -w @gander-studio/client (runs tsc && vite build)</build_command>
  <dev_command>node --env-file=.env ./node_modules/.bin/concurrently "npm run dev -w @gander-studio/server" "npm run dev -w @gander-studio/client"</dev_command>
  <build_system>vite</build_system>
  <monorepo>true</monorepo>
  <monorepo_tool>npm workspaces</monorepo_tool>
  <workspaces>
    <workspace name="@gander-studio/shared" path="packages/shared" />
    <workspace name="@gander-studio/server" path="packages/server" />
    <workspace name="@gander-studio/client" path="packages/client" />
  </workspaces>
</project_conventions>

<prior_sprint_gaps>
The most recent post-mortem is `docs/after-actions/prog-studio-v2-2026-07-s4-retirement.md`. Its §6
rows (G1–G6) are carried in the PM Preflight Checklist below (patterns G1–G6 with row text).
Decomposition-relevant highlights: G2 (deny-rail workarounds by deletion-wave agents — the context's
deletion-rail routing paragraph is this sprint's structural answer; bake it into the hygiene
packet), G6 (plan-time-unverified-inherited-fact: every structural precondition in a packet needs a
same-sprint citation or an explicit UNVERIFIED marker — the ORC-verified ground facts above are your
citations; reference them per-packet).
</prior_sprint_gaps>

## PM Preflight Checklist

Full checklist artifact (162 lines, verbatim output of run-preflight.sh, 2026-07-18):
`.claude/tasks/outputs/prog-studio-v2-2026-07-s5-integration-pm-preflight-1784346820.md` — read it
(counts as 1 of your 8 reads) and acknowledge each pattern in `routing_notes` per the
acknowledgement format (pattern / acknowledged / application). Sprint-salient patterns: G1
(Output-Path-block drift on resumes — ORC-side, acknowledge as noted), G2 (deny-rail workarounds —
address via the deletion-rail routing constraint), G3/G4 (COMPLETE-miss classes — ORC-side
observability, acknowledge as noted), G5 (auditor attribution discipline — flag in audit packet
briefs), G6 (inherited-fact citations — cite the ORC-verified ground facts per packet),
plan-time-unverified-inherited-fact, subagentstop-complete-miss, sendmessage-resume-complete-miss,
output-path-brief-discipline (declared recurring tags).

**SC-precheck directive:** PM has no Bash tool; ORC will run `sc-locked-value-consistency` against
your draft decomposition on return and attach `sc-precheck-report.json` before the Critic gate.
Author every locked-value SC (grep'd strings, line numbers, counts) so it is mechanically checkable,
and flag any SC whose locked value you could not verify with the reads available.

<pm_budget>
  <reads_cap>8</reads_cap>
  <named_reference_files>
    1. docs/programs/prog-studio-v2-2026-07/sprints/integration/orchestrator_brief.md  (PRIMARY requirement source)
    2. .claude/tasks/outputs/prog-studio-v2-2026-07-s5-integration-pm-preflight-1784346820.md  (checklist)
    3. packages/client/src/components/ui/dialog.tsx  (98 lines — wrapper target)
    4. packages/client/src/components/detail/ReviseSpecAction.tsx  (reference impl for safe-focus)
    5. docs/deferred-work.md  (ledger row format for residue 4)
    Optional if budget allows: packages/client/src/components/ui/popover.tsx,
    packages/client/src/components/detail/RelationshipPanel.tsx
  </named_reference_files>
  <halt_clause>If decomposition incomplete at read cap, write progress + emit <budget_exceeded> block + return. Do not continue silently.</halt_clause>
  <retry_rule>No prior PM dispatch for this sprint — default cap applies.</retry_rule>
</pm_budget>

## Required Return

A `<task_decomposition>` block in your output file containing: per-task `<task_packet>`s (task_id
suffixed `t1`, `t2`, … under `prog-studio-v2-2026-07-s5-integration`), each with owner agent,
`<context_files>`, verbatim-embedded static content where needed, explicit `EXPLICITLY OUT OF
SCOPE` sections, mechanically-checkable success criteria, `<dependency_order>` (wave structure),
`<routing_notes>` with the pm_preflight_acknowledgement block, and `<risk_flags>`.
</orchestrator_brief>
