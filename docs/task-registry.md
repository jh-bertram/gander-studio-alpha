# Task Registry — Gander Studio

Last updated: 2026-06-01T18:25:08Z

---

## Sprint: gander-studio-p5b-progression-viz

**Goal:** Phase 5 Sprint B of the Gander progression rollout — Studio `/progression` route + `progression.getLedger` tRPC. BE builds a Zod `ProgressionEntrySchema` + `progression.getLedger` procedure that reads `${GANDER_ROOT}/docs/progression-ledger.md`, parses the JSONL-in-markdown entries per the consumer contract `~/.claude/refs/progression-ledger-schema.md` v1.0.0, validates, and returns. FE builds a `/progression` React route rendering per-surface XP history. Architectural precedent: Phase 2 graph viz (`connectivity.getGraph` + `GraphPage.tsx`).

**Status:** DONE — human-VERIFIED at Step 4.5 (OK, 2026-06-01); pending human push. Assigned from gander (Phase 5 was SPLIT 2026-06-01; Sprint A = ledger in gander repo DONE, Sprint B = this Studio viz, DONE). Success gate met: AUD#2 ran a live Playwright walkthrough — `/progression` renders 6 real per-surface XP entries, target sprint_ids visible, **zero console errors** (screenshot `packages/client/test-results/audit-progression-snap.png`). Pipeline: PM#0 (3 tasks/2 waves) → CR#1 PASS (0 blockers, 3 warnings) → PM#2 plan_amendment → Wave 1 [UI#1 ∥ BE#1] → AUD#1 PASS → commit 49badc1 → Wave 2 [FE#1] → **AUD#2 PASS** (one non-blocking MINOR advisory: e2e Test 2 `getByText('SURFACE COVERAGE')` collided with a ledger delta substring under Playwright strict mode) → FE#2 selector remediation (4 heading locators → `getByRole('heading',…)`, test-file-only, verified 3/3 Playwright green live; no AUD#3 — proportionate accept of the auditor's own prescribed fix) → commit cdfed98. REQVAL COVERED 5/5. Commits 49badc1 (BE) + cdfed98 (FE) on main, NOT yet pushed (human push pending per repo policy).

### Rollback Point
commit: 09c632df88fbb84796c11cc5d4961e15feb75783
recorded: 2026-06-01T18:25:08Z
task_id: gander-studio-p5b-progression-viz
To recover: git -C /home/jhber/projects/gander-studio-alpha reset --hard 09c632df88fbb84796c11cc5d4961e15feb75783

---

## Sprint: gander-studio-p7-graph-viz

**Goal:** Phase 2 of the Gander progression rollout — Studio `/graph` mode + `connectivity.getGraph` tRPC. Build the `ConnectivityGraphSchema` (Zod, mirroring analyzer-spec §4) + `connectivityRouter.getGraph` (reads `${GANDER_ROOT}/docs/connectivity-graph.json`, validates, returns), a new `'graph'` AppMode + nav wiring, and a React Flow renderer (dagre layout, node/edge-type filter sidebar, DETECTED/INFERRED distinction) that consumes the procedure. Phase 1's Studio tRPC stub was never delivered, so this sprint builds both the schema and the procedure.

**Status:** DONE — human-VERIFIED at Step 4.5 (OK, 2026-05-30). Both tasks audited PASS (p7-t1-be AUD#1; p7-t3-fe AUD#3 after 1 remediation); REQVAL COVERED 10/10; archived. Commits `ed94ba4` (BE) + `ccad6df` (FE) on `main`, **NOT yet pushed** (human pushes per repo policy — push `a8212f7..ccad6df`). Plan: PM rev0 → CR#1 BLOCK (tier:null) → rev1 → CR#2 PASS+1 WARNING → amend1 (FE SC3 grep). Jidoka skipped. Phase 2 of the Gander progression rollout is DONE. Follow-up: DEFERRED-P7-1 (remove dead-code Sidebar.tsx).

### Rollback Point
commit: a8212f75dff0e561f4bc0606bdf203ee5d21684d
recorded: 2026-05-30T22:45:00Z
task_id: gander-studio-p7-graph-viz
To recover: git -C /home/jhber/projects/gander-studio-alpha reset --hard a8212f75dff0e561f4bc0606bdf203ee5d21684d

### Plan artifacts
- PM rev1 (effective): `.claude/agents/tasks/outputs/gander-studio-p7-graph-viz-PM-rev1-1780180585.md`
- PM amend1 (FE SC3 → `grep -c "var(--m"` == 6): `.claude/agents/tasks/outputs/gander-studio-p7-graph-viz-PM-amend1-1780181082.md`
- Critic PASS: `.claude/agents/tasks/outputs/gander-studio-p7-graph-viz-CR-rev1-1780180951.md`

### Key facts (orchestrator + Critic reconnaissance)
- BE: schema nullability authority is the REAL on-disk graph, not just spec §4 — `tier: null` (13 agents) AND `version: null` (database agent) must be `.nullable().optional()`; diff every field. guardPath called on the resolved READ path (direction-agnostic GANDER_ROOT containment — Critic verified correct).
- FE: navigation is mode-based (`AppMode` union ↔ `PAGE_MAP: Record<AppMode,…>` is compiler-exhaustive); adding `'graph'` forces the map entry. `@xyflow/react` v12.10.1 installed; `dagre`/`@dagrejs/dagre` NOT installed (FE adds). Real graph N=77 (NOT the plan's N≤30 gate) — no node cap permitted. §5d: pass nodes/edges directly; only display `style` injection + dagre position mutation allowed. tRPC `AppRouter` type propagates automatically (Critic verified the re-export chain).

---

## Sprint: gander-studio-p6-overview-polish

**Goal:** Two Sessions-mode visualization tweaks — (1) AgentTimeline right-edge buffer so the final tick label (e.g. "+2h") and orphan-bar right edges have room to render fully with a small gap before the SVG plot boundary, instead of clipping; (2) in the Sessions overview aggregate, group agent iterations (AR#0, AR#1, AR#2 → "AR") so the panel shows one card/row per base agent code instead of per-instance.

**Status:** DONE — both tasks audited PASS (SA/QA/SX); REQVAL COVERED 4/4; archived. Commits `86d0303..643a66a` (1b2439a t1, 643a66a t2) on `main`, NOT yet pushed (human pushes per repo policy). Critic BLOCKED rev0 (t1 RIGHT_PAD-outside-SVG short-session scrollbar regression); rev1 PASS. INCIDENT this sprint: CR#1 truncated the event log via an errant Write (seqs 5-108 lost, unrecoverable from git); ORC reconciled the log to a clean monotonic sequence — HR/meta follow-up recommended (constrain read-only agents from writing docs/events/). Human-VERIFIED at Step 4.5 (OK, 2026-05-29). Awaiting human push of `1b2439a..8f7903f`.

### Rollback Point
commit: 86d0303
recorded: 2026-05-28T21:00:00Z
task_id: gander-studio-p6-overview-polish
To recover: git -C /home/jhber/projects/gander-studio-alpha reset --hard 86d0303

### Scope notes (orchestrator reconnaissance)
- Both tasks are FRONTEND-ONLY. No schema change, no server change. session.aggregateStats contract is untouched.
- t1 file: packages/client/src/components/sessions/AgentTimeline.tsx (normX maps tAxisMax→contentWidth exactly; last tick is textAnchor=middle → clips; orphan bars extend to contentWidth).
- t2 files: packages/client/src/pages/sessions/SessionListPage.tsx (AggregatePanel) + a new pure grouping util + unit test. Grouping is DISPLAY-ONLY in the overview; per-session Analyze/timeline detail (session.getStats) keeps per-instance agent_ids.
- t2 grouping key = agent_id.split('#')[0]; defensively use whole string if no '#'. Sum all numeric fields; wall_clock_ms undefined-vs-zero handling mirrors aggregate-stats.ts.

### Task Manifest

| Task | Agent | Wave | Priority | Status | Blocks |
|---|---|---|---|---|---|
| p6-t1-timeline-buffer | FE#1 | A (parallel) | HIGH | DONE (commit 1b2439a) | NONE |
| p6-t2-agent-grouping | FE#2 | A (parallel) | HIGH | DONE (commit 643a66a) | NONE |

### Wave order
- Wave A (parallel): p6-t1-timeline-buffer + p6-t2-agent-grouping — disjoint files, no dependency between them.

### Key design decisions (rev1 — corrected from rev0)
- t1: Add `RIGHT_PAD = 48` constant. GEOMETRY FIX: svg width = contentWidth (UNCHANGED — preserves short-session no-scroll floor). Introduce `plotAreaWidth = Math.max(MIN_BAR_AREA, contentBarAreaActual - RIGHT_PAD)` and `plotRight = LABEL_COL_WIDTH + plotAreaWidth` in render. normX scales by plotAreaWidth. Tick x positions use plotAreaWidth. Orphan barEndX = plotRight. Axis baseline x2 = plotRight. Result: all data/bars end RIGHT_PAD before the SVG right edge; SVG width is unchanged; no spurious horizontal scrollbar on short sessions.
- t1 e2e: Playwright boundingBox() assertions (final tick label right edge ≤ SVG right edge; rightmost bar right edge < SVG right edge). Plus scrollWidth ≤ clientWidth assertion on short-session fixture (guards against scrollbar regression).
- t2: Pure `groupAgentsByBaseCode(agents)` util in packages/client/src/utils/group-agents.ts. base code = agent_id.split('#')[0]. wall_clock_ms: undefined if no contributor defined; sum of defined contributors if any defined. AggregatePanel maps over grouped result for both panel grid and AgentStatTable. AgentStatPanel and AgentStatTable interfaces unchanged.
- t2 vitest: Install vitest@^4 (NOT ^1.x — must match server's ^4.1.7 to avoid workspace peer collisions). Add vitest.config.ts with environment: node. Add "test": "vitest run" script. Run `npm test -w @gander-studio/client` for 7 unit test cases.
- t2 e2e: Roster-agnostic — derive expected state from live tRPC response (intercept session.getStats), NOT hardcoded base code strings. Assert no /#\d+$/ labels visible; assert folded count < source count; assert at least one base code was folded from ≥2 instances.
- No git commit by implementing agents; orchestrator commits post-audit.

### Risk Flags
- t1 geometry: plotAreaWidth approach preserves zoom math. Auditor should verify zoom-in path still works end-to-end.
- t2 vitest@^4 workspace hoisting: npm should hoist to shared v4 binary. Auditor confirms no peer-dep warnings after install.
- t2 e2e roster-agnostic spec: must use tRPC response interception to derive expected counts. Follow pattern in overview-aggregate.spec.ts.
- gander-p6-moirai-skein-skills fixture session: both e2e specs use this fixture. Confirm dev server is live and event log non-empty before e2e audit dispatch.

### Expectation Manifest
See `.claude/agents/tasks/outputs/gander-studio-p6-overview-polish-PM-rev1-1780011957.md` (full rev1 manifest with per-task receipt checks).

---

## Sprint: gander-studio-p5-overview-ux

**Goal:** Four Sessions-mode UX features — (1) AgentTimeline x-axis zoom (+/- control; realizes DEFERRED-002); (2) remove the left nav sidebar and make the bottom tab bar the always-on primary nav, reclaiming horizontal space; (3) the Sessions landing page becomes a combined all-sessions overview with an aggregate stats roll-up; (4) a session multi-select on that overview that includes/excludes sessions from the aggregate counts.

**Status:** DONE — all 4 tasks audited PASS; REQVAL COVERED 8/8; archived. Commits `824c23e..86d0303` (5: bff9cf8 t2, 3de2202 t3, 23c0e96 t1, 3a8cf8f t4, 86d0303 R-004 gap-fill) on `main`, NOT yet pushed (human pushes per repo policy). Critic BLOCKED rev0 (t2/t4 invented API shapes — G1 recurrence); rev1 PASS. Audit caught + remediated 2 runtime defects (t1 padding occlusion, t3 width-cap regression). Pending: human Step-4.5 browser verification.

### Rollback Point
commit: 824c23eda63f7b4f12624a55980803ac696cc777
recorded: 2026-05-28T20:05:24Z
task_id: gander-studio-p5-overview-ux
To recover: git -C /home/jhber/projects/gander-studio-alpha reset --hard 824c23eda63f7b4f12624a55980803ac696cc777

### Task Manifest

| Task | Agent | Wave | Priority | Status | Blocks |
|---|---|---|---|---|---|
| p5-t1-sidebar-removal | FE#1 | A | HIGH | PENDING | NONE |
| p5-t2-aggregate-stats-be | BE#1 | A | HIGH | PENDING | p5-t4-overview-aggregate |
| p5-t3-timeline-zoom | FE#2 | A | NORMAL | PENDING | NONE |
