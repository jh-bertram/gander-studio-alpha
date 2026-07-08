# Task Registry — Gander Studio

Last updated: 2026-07-07T23:05:00Z

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

## Rollback Point
commit: 97d294252ea1012cdb017eca778391da4787c33e
recorded: 2026-07-02T18:58:24Z
task_id: gander-studio-p10-deferred-smalls

To recover: git reset --hard 97d294252ea1012cdb017eca778391da4787c33e

## Agent Remits (gander-studio-p10-deferred-smalls)
Mirrored from extract-agent-remits.sh run 2026-07-02T18:58:24Z (gander .claude/agents): pm 2.2.1 (core responsibilities, 8-read budget, no-code remit), frontend-engineer 2.1.2 (task-boundary compliance, FE consumes contracts), backend-engineer 1.5.2 (Zod at boundaries, no migrations), ui-designer 3.0.1 (token-first, WCAG verify, all-states), critic 2.1.0 + code-auditor 3.3.0 (no explicit remit heading — standing extract-script finding). Full text embedded in the PM orchestrator_brief for this sprint.
<expectation_manifest>
  <sprint_id>gander-studio-p10-deferred-smalls</sprint_id>
  <generated>2026-07-02T19:20:00Z</generated>
  <revision>rev1 — CR#1 amendments folded</revision>
  <assignments>
    <assignment>
      <task_id>gander-studio-p10-deferred-smalls-003</task_id>
      <agent>FE#1</agent>
      <expected_tag>ui_packet</expected_tag>
      <expected_file>.claude/tasks/outputs/gander-studio-p10-deferred-smalls-003-FE-*.md</expected_file>
      <blocks>NONE (RUNTIME-A11Y auditor duty per SC#8)</blocks>
      <receipt_check>
        <item>FF7TooltipPanel EXTENDED (not replaced) — DRY reuse</item>
        <item>TooltipState has feedbackLoops (numeric) + auditOutcome ('pass'|'fail'|'mixed'|'none'); both computed at bar-group call site from agentMarkers, passed into extended showTooltip; markersByAgent NOT referenced inside the empty-dep useCallback</item>
        <item>exact spawn/complete timestamps rendered; QA runtime-confirms the feedbackLoops + auditOutcome rows render (not bare token grep)</item>
        <item>role="tooltip" + aria-describedby active-only; aria-label/name preserved; a11y auditor runtime check done</item>
        <item>tsc clean x3 + client build passing; no new dependency; timeline-tooltip testid preserved; no edits to globals.css/session-stats.ts</item>
      </receipt_check>
    </assignment>
    <assignment>
      <task_id>gander-studio-p10-deferred-smalls-004</task_id>
      <agent>BE#1</agent>
      <expected_tag>completion_packet</expected_tag>
      <expected_file>.claude/tasks/outputs/gander-studio-p10-deferred-smalls-004-BE-*.md</expected_file>
      <blocks>NONE (GATE-TEST close-blocking: vitest must run green)</blocks>
      <receipt_check>
        <item>matchesSlug anchored (=== slug || startsWith(slug + '-')); .includes removed; canonical path packages/server/src/session-slug-match.ts</item>
        <item>stale line-209 assertion flipped to false + description updated</item>
        <item>new guard assertions incl. p2-vs-p20 case</item>
        <item>npm test -w @gander-studio/server GREEN (actual run)</item>
        <item>git diff --name-only == exactly session-slug-match.ts + session-list.test.ts</item>
      </receipt_check>
    </assignment>
    <assignment>
      <task_id>gander-studio-p10-deferred-smalls-006</task_id>
      <agent>FE#2</agent>
      <expected_tag>ui_packet</expected_tag>
      <expected_file>.claude/tasks/outputs/gander-studio-p10-deferred-smalls-006-FE-*.md</expected_file>
      <blocks>NONE</blocks>
      <receipt_check>
        <item>--redb: #e05555 in globals.css; #cf3c3c count == 0 in globals.css; line-357 annotation shows 5.22:1 + resolved (not "below AA")</item>
        <item>contrast_pairs proves #e05555 on #070d0c ≥ 4.5:1 (≈5.22:1) with method</item>
        <item>DESIGN.md three live sites (33/183/325) → #e05555/5.22:1/AA; Decision Record D present; #cf3c3c/4.07:1 appear ONLY inside DR-D (containment check), not at live sites</item>
        <item>destructive-surface regression guard recorded (text-destructive on bg-destructive/10 — no regression)</item>
        <item>--red/--mr/--materia-red + --destructive mapping untouched; tsc clean x3 + client build passing</item>
      </receipt_check>
    </assignment>
  </assignments>
</expectation_manifest>

## Sprint Close — gander-studio-p10-deferred-smalls (2026-07-02)
**Status:** CLOSED (audit PASS ×3, REQVAL COVERED 17/17, AA close gate PASS)
**Commits:** ceremony 74213ac → 8495ecc (004) → 4b8fb5c (006) → 88cbebf (003)
**Current rollback point:** 88cbebf (supersedes 97d2942 recorded at sprint open — prior point demoted)
To recover pre-sprint state: git reset --hard 97d294252ea1012cdb017eca778391da4787c33e
**Open at close:** human browser check (Step 4.5, FE sprint) — surfaced in delivery report; DEFERRED-P10-1 queued.

## Agent Remits (gander-studio-p11-v2-vision)
<agent_remits source="auto-extracted from gander .claude/agents/*.md via extract-agent-remits.sh at 2026-07-07T21:08:01Z">
  <agent name="project-manager" version="2.4.0">Core Responsibilities: atomic decomposition (one owner, unambiguous verification, non-cascading failure); context guarding (each agent gets only what it needs); static-content embedding rule (verbatim in packet or dedicated context file); gate enforcement (no task complete without auditor PASS); failure handling (single specific remediation request; 3 consecutive fails → escalate). Tool-Call Budget: soft 8-read budget per decomposition; halt-and-surface with budget_exceeded block; post-timeout retry requires strictly leaner brief (≤4 named reads). Does NOT: write code, design components, route packets, or escalate directly to human.</agent>
  <agent name="critic" version="2.1.0">NO REMIT SECTION FOUND (spec lacks explicit remit/constraint heading — recorded as finding).</agent>
  <agent name="ui-designer" version="3.0.1">Constraints: token-first (no raw hex/px/font-size outside scales; propose new tokens rather than hardcode); Shadcn primitives by default; describe-don't-prescribe implementation; all states specified (empty/error included); WCAG contrast verified per pair, recorded in accessibility_spec→contrast_pairs; dashboard sprints include ~/.claude/refs/dashboard-patterns.md and verify pattern citations against the live library.</agent>
  <agent name="statistician" version="2.1.0">Boundaries: analyzes data, produces findings; does NOT implement features/API routes/UI. Requirements discovered via analysis → design_implication routed by PM. Data-quality issues needing re-acquisition → reacquisition_request to PM, never silent use of bad data.</agent>
  <agent name="frontend-engineer" version="2.1.2">Task Boundary Compliance: implement only the authorized task_id; consolidation requires explicit ORC approval, else BLOCKED event. Domain Boundaries: consumes data contracts (BE-owned Zod schemas), builds against typed mock if schema absent (mark MOCKED); implements design_spec faithfully — flag spec gaps, don't improvise redesigns.</agent>
  <agent name="code-auditor" version="3.4.0">NO REMIT SECTION FOUND (spec lacks explicit remit/constraint heading — recorded as finding).</agent>
</agent_remits>

## Rollback Point
commit: f2e7df0a033667081056ef0fc1eacfdb387ef237
recorded: 2026-07-07T21:39:52+00:00
task_id: gander-studio-p11-v2-vision

To recover: git reset --hard f2e7df0a033667081056ef0fc1eacfdb387ef237

<expectation_manifest>
  <sprint_id>gander-studio-p11-v2-vision</sprint_id>
  <generated>2026-07-07T21:55:00Z</generated>
  <plan_source>.claude/tasks/outputs/gander-studio-p11-v2-vision-rev-PM-1783459761.md (CR#2 CRITIQUE_PASS)</plan_source>
  <assignments>
    <assignment>
      <task_id>gander-studio-p11-v2-vision-t1</task_id>
      <agent>ST#1</agent><wave>0</wave>
      <expected_tag>statistical_report</expected_tag>
      <expected_file>.claude/tasks/outputs/gander-studio-p11-v2-vision-t1-ST-*.md + docs/v2-vision/session-data-inventory.md</expected_file>
      <blocks>gander-studio-p11-v2-vision-t3</blocks>
      <receipt_check>
        <item>deliverable exists; v1-baseline section (DRY); candidates carry name/source/derivation/AVAILABLE-NOW|NEEDS-SCHEMA-EXTENSION</item>
        <item>tokens/cost NEEDS-SCHEMA-EXTENSION citing DEFERRED-P9-1; design_implications + sample-data appendix w/ real roster codes; provenance paths cited</item>
      </receipt_check>
      <receipt_status>PASS 2026-07-07T21:55Z (ORC grep-verified on disk)</receipt_status>
    </assignment>
    <assignment>
      <task_id>gander-studio-p11-v2-vision-t2</task_id>
      <agent>UI#1</agent><wave>0</wave>
      <expected_tag>design_spec</expected_tag>
      <expected_file>.claude/tasks/outputs/gander-studio-p11-v2-vision-t2-UI-*.md + docs/v2-vision/v1-critique.md</expected_file>
      <blocks>gander-studio-p11-v2-vision-t3</blocks>
      <receipt_check>
        <item>verdict for all 9 surfaces each KEEP|ABSORB|CUT + rationale; ABSORB names target; review-purpose lens up front; ORC-EVAL structural citations (no code re-audit)</item>
      </receipt_check>
      <receipt_status>PASS 2026-07-07T21:55Z (ORC grep-verified: 3 KEEP / 3 ABSORB / 3 CUT, lens section, summary table)</receipt_status>
    </assignment>
    <assignment>
      <task_id>gander-studio-p11-v2-vision-t3</task_id>
      <agent>UI#2</agent><wave>1</wave>
      <expected_tag>design_spec</expected_tag>
      <expected_file>.claude/tasks/outputs/gander-studio-p11-v2-vision-t3-UI-*.md + docs/v2-vision/v2-vision.md + docs/v2-vision/v2-design-spec.md</expected_file>
      <blocks>gander-studio-p11-v2-vision-t4</blocks>
      <receipt_check>
        <item>v2-vision.md prose, no XML ceremony; all 7 analogy terms (equipment, materia, abilities / skills, hooks, workflows, tools); new-purpose + FF7 IA (party+submenus) + stats catalog w/ source+feasibility + t2 verdict summary</item>
        <item>SC11: explicitly-headed open-ratification-question section naming FF7-vs-Studio-Clarity direction reversal (DESIGN.md v1.1.0 migration; v2 reverses/scope-carves; submitted to human)</item>
        <item>v2-design-spec.md: design_system_source DESIGN_MD; party layout + asset-free portrait + submenus + empty & error states; accessibility_spec contrast_pairs per-pair AA verdicts; sample-data appendix</item>
      </receipt_check>
    </assignment>
    <assignment>
      <task_id>gander-studio-p11-v2-vision-t4</task_id>
      <agent>FE#1</agent><wave>2 (after t3 audit PASS)</wave>
      <expected_tag>completion_packet</expected_tag>
      <expected_file>.claude/tasks/outputs/gander-studio-p11-v2-vision-t4-FE-*.md + docs/v2-vision/mockup/party-screen.html</expected_file>
      <blocks>NONE (terminal before ORC ratification report)</blocks>
      <receipt_check>
        <item>single self-contained file; SC2 broadened external-load patterns absent (src="http, href="http, @import, cdn., url(http, url(//, @font-face remote src, src="//, href="//); inline-SVG xmlns exempt</item>
        <item>console-clean via file:// (MCP navigate+console); snapshot: party cards w/ portraits + stat bars + side submenu; >=3 real roster codes from t3/t1 appendix</item>
        <item>SC7 legibility: text pairs bound to t3 contrast_pairs AA-pass entries (grep + screenshot adjudication); SC8: any cost/MP bar carries visible projected/needs-schema-extension label (vacuous if absent)</item>
      </receipt_check>
    </assignment>
  </assignments>
</expectation_manifest>

## Sprint Close — gander-studio-p11-v2-vision (2026-07-07)
**Status:** DELIVERED (audit PASS ×4 first-pass, REQVAL COVERED 18/18, AA close gate PASS) — **HUMAN RATIFICATION GATE OPEN** (v2 direction + FF7-vs-Clarity palette question; design-sprint Step 4.5-analog)
**Commits:** ceremony 0b4fc3a → b2ad277 (t1) → 1ea8b48 (t2) → c710958 (t3) → f4ce04e (t4); close bookkeeping trails
**Current rollback point:** f4ce04e (supersedes 88cbebf recorded at sprint open — prior point demoted)
To recover pre-sprint state: git reset --hard f2e7df0a033667081056ef0fc1eacfdb387ef237
**Deliverables:** docs/v2-vision/{session-data-inventory,v1-critique,v2-vision,v2-design-spec}.md + mockup/party-screen.html
**Open at close:** human ratification (v2 direction + palette); t3 states-vs-contrast_pairs advisory; card-hover Popover spec-only (eventual React build); DEFERRED-P9-1 tokens gap blocks real cost/MP stat; §6 G1-G5 routed via after-action (pm-preflight symlink-anchor fix is HIGH).

## Agent Remits (prog-studio-v2-2026-07-s1-data-layer — delta over p11 extraction)
<agent_remits source="extract-agent-remits.sh at 2026-07-07T23:20Z; pm/critic/statistician/frontend/code-auditor remits unchanged from p11 section above">
  <agent name="backend-engineer" version="(live)">Domain Boundaries: BE/FE split — typed Zod schema is the stable boundary; never prescribe UI structure. BE/DS split — never write migrations; describe entities via data_request (N/A this sprint: file parsers only, no DB). TypeScript for all server logic, Zod at every API boundary.</agent>
</agent_remits>

## Rollback Point
commit: 290de04dcc7f9fffd2b893cd25fc8d5ec4c6287a
recorded: 2026-07-07T23:44:54+00:00
task_id: prog-studio-v2-2026-07-s1-data-layer

To recover: git reset --hard 290de04dcc7f9fffd2b893cd25fc8d5ec4c6287a

<expectation_manifest>
  <sprint_id>prog-studio-v2-2026-07-s1-data-layer</sprint_id>
  <generated>2026-07-07T23:44:54+00:00</generated>
  <plan_source>.claude/tasks/outputs/prog-studio-v2-2026-07-s1-data-layer-rev-PM-1783467209.md (CR#2 CRITIQUE_PASS)</plan_source>
  <assignments>
    <assignment><task_id>prog-studio-v2-2026-07-s1-data-layer-t1</task_id><agent>BE#1</agent><wave>0</wave><expected_tag>completion_packet</expected_tag><expected_file>.claude/tasks/outputs/prog-studio-v2-2026-07-s1-data-layer-t1-BE-*.md</expected_file><blocks>t2,t3,t4</blocks>
      <receipt_check><item>schemas.ts: PartyMember/PartyStats/AgentDetail (+subs) exported, z.infer types, no existing schema modified</item><item>agent-role.ts: ROSTER {code,roleCategory,materiaColorKey,specFile} — 12 verbatim spec filenames + DI null + canonical-mapping maintenance note</item><item>vitest green incl. new SC5 spec-file resolution (mock fixture + live-glob, RAN not skipped); lint x3 clean</item></receipt_check></assignment>
    <assignment><task_id>prog-studio-v2-2026-07-s1-data-layer-t2</task_id><agent>BE#2</agent><wave>1</wave><expected_tag>completion_packet</expected_tag><expected_file>.claude/tasks/outputs/prog-studio-v2-2026-07-s1-data-layer-t2-BE-*.md</expected_file><blocks>t3,t4</blocks>
      <receipt_check><item>event-log-parser additive extension + party-stats.ts: attribution flip (gate-id vs implementer fixtures BOTH directions + FE#1+FE#2→FE grouping), ghost rate, event-type coverage, invalid-line diagnostics (counted+surfaced, absent≠zero)</item><item>vitest green; lint x3 clean; no client changes</item></receipt_check></assignment>
    <assignment><task_id>prog-studio-v2-2026-07-s1-data-layer-t3</task_id><agent>BE#3</agent><wave>2</wave><expected_tag>completion_packet</expected_tag><expected_file>.claude/tasks/outputs/prog-studio-v2-2026-07-s1-data-layer-t3-BE-*.md</expected_file><blocks>t4</blocks>
      <receipt_check><item>party-roster.ts + roster.getParty returning PartyStatsSchema envelope {members sorted by activity recency, diagnostics, activityAnchor} per program.md §5 note 1</item><item>tokens/cost = projected placeholder w/ DEFERRED-P9-1 citation at definition site; vitest green; lint x3</item></receipt_check></assignment>
    <assignment><task_id>prog-studio-v2-2026-07-s1-data-layer-t4</task_id><agent>BE#4</agent><wave>3</wave><expected_tag>completion_packet</expected_tag><expected_file>.claude/tasks/outputs/prog-studio-v2-2026-07-s1-data-layer-t4-BE-*.md</expected_file><blocks>GATE-DEVSERVER</blocks>
      <receipt_check><item>agent-detail.ts + roster.getAgentDetail: resolve via ROSTER.specFile; SC3 non-empty equipment+materia for real agent (AU/FE) vs DI empty+dataQualityNote distinguishable from parse failure; abilities:[] contracted per program.md §5 note 2</item><item>router.ts serialized append after t3; attribution side declared per quality stat; vitest green (SC tests RAN not skipped); lint x3</item></receipt_check></assignment>
  </assignments>
</expectation_manifest>

## Sprint Close — prog-studio-v2-2026-07-s1-data-layer (2026-07-08)
**Status:** DONE (audit PASS ×4 first-pass, GATE-DEVSERVER PASS, REQVAL COVERED 16/16, AA close gate PASS)
**Commits:** t1→t4 feat(v2-data) + ceremony + close bookkeeping on feat/studio-sessions-feed-agentstats; **Current rollback point:** 73a78f4 (t4)
**Delivered:** v2 data layer — 10 Zod schemas, ROSTER canonical code→spec catalog, attribution-flip/ghost/coverage derivations, roster.getParty (PartyStatsSchema envelope) + roster.getAgentDetail. Two corpus-grounded deviations upheld (t2 §2.1 basis; t4 triggers_hook 102/102 hook→agent).
**Open at close:** s2-party-shell next (tier 1); branch push HUMAN-OWNED (guard denied ORC push): git push origin feat/studio-sessions-feed-agentstats; §6 G1-G5 routed via after-action (archivist fabrication class G5 corrected in-log; PM corpus-fact-citation rule is the HIGH delta).
