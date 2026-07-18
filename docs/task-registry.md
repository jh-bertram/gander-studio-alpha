# Task Registry — Gander Studio

Last updated: 2026-07-18T14:50:00Z

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

## Rollback Point
commit: 814a0dd82a239d0b8e7eafd1a11cb09adf68011a
recorded: 2026-07-08T01:33:42+00:00
task_id: prog-studio-v2-2026-07-s2-party-shell

To recover: git reset --hard 814a0dd82a239d0b8e7eafd1a11cb09adf68011a

<expectation_manifest>
  <sprint_id>prog-studio-v2-2026-07-s2-party-shell</sprint_id>
  <generated>2026-07-08T01:33:42+00:00</generated>
  <plan_source>.claude/tasks/outputs/prog-studio-v2-2026-07-s2-party-shell-PM-1783472965.md + amend-PM-1783474258.md (CR#1 PASS + 5 WARNINGs resolved)</plan_source>
  <assignments>
    <assignment><task_id>prog-studio-v2-2026-07-s2-party-shell-t1</task_id><agent>FE#1</agent><wave>0</wave><expected_tag>ui_packet</expected_tag><expected_file>.claude/tasks/outputs/prog-studio-v2-2026-07-s2-party-shell-t1-FE-*.md</expected_file><blocks>t3,t5</blocks>
      <receipt_check><item>ui-store selectedAgentCode contract + RAIL_ITEMS constants per packet; no AppMode union change (t5 owns it); lint x3 clean</item></receipt_check></assignment>
    <assignment><task_id>prog-studio-v2-2026-07-s2-party-shell-t2</task_id><agent>FE#2</agent><wave>0</wave><expected_tag>ui_packet</expected_tag><expected_file>.claude/tasks/outputs/prog-studio-v2-2026-07-s2-party-shell-t2-FE-*.md</expected_file><blocks>t3</blocks>
      <receipt_check><item>PortraitFrame + StatBar + materiaTint helper (W1) + StatBar vitest; FF7 tokens explicit; no raw hex; W2 mapping recorded; lint x3 + client vitest green</item></receipt_check></assignment>
    <assignment><task_id>prog-studio-v2-2026-07-s2-party-shell-t3</task_id><agent>FE#3</agent><wave>1</wave><expected_tag>ui_packet</expected_tag><expected_file>.claude/tasks/outputs/prog-studio-v2-2026-07-s2-party-shell-t3-FE-*.md</expected_file><blocks>t4</blocks>
      <receipt_check><item>PartyMemberCard (whole-card link, Popover quick-peek, aria) + SubmenuRail; imports materiaTint (grep color-mix in t3 files == 0, W1); W2 mapping recorded; lint x3</item></receipt_check></assignment>
    <assignment><task_id>prog-studio-v2-2026-07-s2-party-shell-t4</task_id><agent>FE#4</agent><wave>2</wave><expected_tag>ui_packet</expected_tag><expected_file>.claude/tasks/outputs/prog-studio-v2-2026-07-s2-party-shell-t4-FE-*.md</expected_file><blocks>t5</blocks>
      <receipt_check><item>PartyPage + useParty (live roster.getParty envelope: members + diagnostics affordance); all 4 states; rail mounted page-local; W2 mapping; verify-then-implement note on trpc.roster exposure; lint x3</item></receipt_check></assignment>
    <assignment><task_id>prog-studio-v2-2026-07-s2-party-shell-t5</task_id><agent>FE#5</agent><wave>3</wave><expected_tag>ui_packet</expected_tag><expected_file>.claude/tasks/outputs/prog-studio-v2-2026-07-s2-party-shell-t5-FE-*.md</expected_file><blocks>t6</blocks>
      <receipt_check><item>ATOMIC: 'party' in AppMode union + PAGE_MAP + default-route flip; ui-store serialized after t1 (G4); BottomTabBar untouched; lint x3 (compiler-exhaustive proof)</item></receipt_check></assignment>
    <assignment><task_id>prog-studio-v2-2026-07-s2-party-shell-t6</task_id><agent>FE#6</agent><wave>4</wave><expected_tag>ui_packet</expected_tag><expected_file>.claude/tasks/outputs/prog-studio-v2-2026-07-s2-party-shell-t6-FE-*.md</expected_file><blocks>NONE</blocks>
      <receipt_check><item>Tier-2 e2e: default route renders live party; rail-nav asserts destination DOM markers (W3); popover; keyboard a11y; setViewportSize mobile legibility + screenshots both widths (W3); BottomTabBar no-regression; headless run evidence (npx playwright test) green</item></receipt_check></assignment>
  </assignments>
</expectation_manifest>

## Sprint Close — prog-studio-v2-2026-07-s2-party-shell (2026-07-08)
**Status:** DONE-PENDING-4.5 (8 audit verdicts: 7 PASS, 1 FAIL remediated ×2 rounds + family re-audit PASS; REQVAL COVERED 15/15 + requires_human_visual) — **HUMAN BROWSER CHECK OPEN (Step 4.5)**
**Commits:** 7 durability (7359da5 t1 → dbc4b87 t6) + ceremony 0a0536e; **Current rollback point:** dbc4b87 (t6)
**Delivered:** v2 party screen LIVE as the default route — party cards (asset-free portraits, StatBars, popover quick-peek, keyboard-stable after t3-rem), SubmenuRail, 4 states, diagnostics footnote, route-level code-splitting (main chunk 1035.70→756.80 kB), 19-assertion Tier-2 e2e gate.
**Open at close:** human browser check; HA-1 rail collapse/expand + HA-2 return-to-party affordance (both s4); DEFERRED-V2S2-1/2; branch push human-owned; 3rd consecutive archivist-drift correction appended (systemic — gander fix queued).

**s2 4.5 UPDATE (2026-07-08):** human browser check CONFIRMED ("ok" ×3) — s2 fully DONE. Ratified: 6-agent homescreen; retained Browse CTA; Roster-as-party-home aria-current semantic.

## Rollback Point
commit: 86d2fd0395e666e1382171fff8572d50c48458d8
recorded: 2026-07-08T05:34:09+00:00
task_id: prog-studio-v2-2026-07-s3-drilldowns

To recover: git reset --hard 86d2fd0395e666e1382171fff8572d50c48458d8

<expectation_manifest>
  <sprint_id>prog-studio-v2-2026-07-s3-drilldowns</sprint_id>
  <generated>2026-07-08T05:34:09+00:00</generated>
  <plan_source>.claude/tasks/outputs/prog-studio-v2-2026-07-s3-drilldowns-rev2-PM-1783488067.md (CR#3 CRITIQUE_PASS; human ratified 6-of-13 + retained CTA + aria-current 2026-07-08)</plan_source>
  <assignments>
    <assignment><task_id>prog-studio-v2-2026-07-s3-drilldowns-t1</task_id><agent>FE#1</agent><wave>0</wave><expected_tag>ui_packet</expected_tag><expected_file>.claude/tasks/outputs/prog-studio-v2-2026-07-s3-drilldowns-t1-FE-*.md</expected_file><blocks>t4a</blocks>
      <receipt_check><item>Materia/Equipment/Abilities inventory panels w/ honest empty states (abilities contracted-empty per program.md §5n2); reuses s2 primitives; no qualityStats/StatBar rendering (t4a boundary); lint x3 + vitest green</item></receipt_check></assignment>
    <assignment><task_id>prog-studio-v2-2026-07-s3-drilldowns-t2</task_id><agent>FE#2</agent><wave>0</wave><expected_tag>ui_packet</expected_tag><expected_file>.claude/tasks/outputs/prog-studio-v2-2026-07-s3-drilldowns-t2-FE-*.md</expected_file><blocks>t4a</blocks>
      <receipt_check><item>Relationship panel: RF subgraph from relationships[], custom nodes carry Handle elements (RF v12 gotcha); reuses GraphPage RF+dagre patterns; lint x3</item></receipt_check></assignment>
    <assignment><task_id>prog-studio-v2-2026-07-s3-drilldowns-t3</task_id><agent>FE#3</agent><wave>0</wave><expected_tag>ui_packet</expected_tag><expected_file>.claude/tasks/outputs/prog-studio-v2-2026-07-s3-drilldowns-t3-FE-*.md</expected_file><blocks>t4a</blocks>
      <receipt_check><item>Revise-spec Dialog + TARGET-KEYED editor buffer (contamination class structurally prevented); reuses agent.save/skill.save; explicit focus/role on Dialog (s2-G2); lint x3 + buffer-lifecycle vitest</item></receipt_check></assignment>
    <assignment><task_id>prog-studio-v2-2026-07-s3-drilldowns-t4a</task_id><agent>FE#4</agent><wave>1</wave><expected_tag>ui_packet</expected_tag><expected_file>.claude/tasks/outputs/prog-studio-v2-2026-07-s3-drilldowns-t4a-FE-*.md</expected_file><blocks>t4b</blocks>
      <receipt_check><item>AgentDetailPage assembly (SC a-h): lazy-from-birth PAGE_MAP entry + 'agent-detail' AppMode; qualityStats w/ missing-reason handling at call site (StatBar :29/:51 facts); any-valid-ROSTER-code works (DI render); back-to-party affordance; bundle gate measured &lt;1000kB; lint x3 + build</item></receipt_check></assignment>
    <assignment><task_id>prog-studio-v2-2026-07-s3-drilldowns-t4b</task_id><agent>FE#5</agent><wave>2</wave><expected_tag>ui_packet</expected_tag><expected_file>.claude/tasks/outputs/prog-studio-v2-2026-07-s3-drilldowns-t4b-FE-*.md</expected_file><blocks>t5</blocks>
      <receipt_check><item>Nav re-points (SC a-e): handleSelect→'agent-detail'; RAIL_ITEMS Roster→'party'; handleViewRoster DELIBERATELY retains 'browse' + s4 TODO marker; only-remaining-browse check; lint x3</item></receipt_check></assignment>
    <assignment><task_id>prog-studio-v2-2026-07-s3-drilldowns-t5</task_id><agent>FE#6</agent><wave>3</wave><expected_tag>ui_packet</expected_tag><expected_file>.claude/tasks/outputs/prog-studio-v2-2026-07-s3-drilldowns-t5-FE-*.md</expected_file><blocks>NONE</blocks>
      <receipt_check><item>Tier-2 e2e: 3 absorption proofs (asset browsing; relationship layer; spec-revision w/ A→B→save buffer regression); keyboard a11y; EXACTLY THREE authorized s2-spec changes (card-Enter marker, rail-Roster marker, L313-325 aria-current rewrite) — L364-398 + all else unchanged; headless green evidence</item></receipt_check></assignment>
  </assignments>
</expectation_manifest>

## Sprint Close — prog-studio-v2-2026-07-s3-drilldowns (2026-07-08)
**Status:** DONE-PENDING-4.5 (8 terminal audit PASS incl. 2 remediation chains; REQVAL COVERED 14/14 + requires_human_visual) — **HUMAN BROWSER CHECK OPEN**
**Commits:** 6 durability (474d686..44f01d0) + planning ceremony 86d2fd0 + close ceremony 68ec6e1; **Current rollback point:** 44f01d0 (t5)
**Delivered:** agent-detail drill-downs absorbing Browse/Graph/Edit — Materia/Equipment/Abilities panels, RF relationship layer (visible-edge-proven), target-keyed revise-spec editor (contamination class structurally prevented + regression-proven), nav re-points (card→detail; Roster→party; CTA deliberately retained w/ s4 TODO), 8-test absorption-proof e2e suite (27/27 ×4 runs).
**Gates earned their keep:** AUD#3 caught the historical legibility class BEFORE the human (first time); t5's e2e caught a second base-ui behavioral-default defect; Critic ×3 rounds caught 2 disk-verified plan defects. Archivist drift 4th sighting (synthesis layer) — correction addendum #4 appended; gander spec fix escalated.
**Open at close:** human browser check; s4-retirement is the FINAL sibling (inheritances: CTA re-point, rail collapse/expand, 390px overflow, stale baseline, 13-role catalog entry, DEFERRED-V2S3-1/2); branch push human-owned.

## Agent Remits (prog-studio-v2-2026-07-s4-retirement, extracted 2026-07-10)

<agent_remits source="auto-extracted from /home/jhber/.claude/agents/*.md at 2026-07-10T18:43:08Z">
  <agent name="project-manager" version="2.4.0" source_file="/home/jhber/.claude/agents/pm.md">
    ## Core Responsibilities
    
    **Decomposition:** When given a goal, break it into the smallest possible independent units of work, each ownable by a single agent with a clear success condition. A task is atomic when: (a) it has one owner, (b) its completion can be verified without ambiguity, and (c) failure doesn't block multiple other tasks simultaneously.
    
    **Context guarding:** Each agent receives only what it needs. Don't include the entire codebase in a spawned agent's context — provide the specific files relevant to its task. This keeps agent outputs focused and prevents context overflow.
    
    **Static content embedding rule:** Any static content the implementing agent cannot derive from the codebase — lookup tables, enumeration values, copy strings, schema definitions, complete data structures — must be embedded **verbatim** in the task packet, not referenced by description ("see the human's message") or summarized. If the content is too large to inline safely, write it to a dedicated context file and list that path in `<context_files>`. Do not include large tables directly in the dispatch prompt — agents read the task packet file; ORC references that file path, not the inline content.
    
    **Gate enforcement:** No task is complete until the auditor has reviewed it and returned PASS. This is non-negotiable. A "done" task without audit is a liability, not an asset.
    
    **Failure handling:** If an agent fails the audit, return the auditor's report to the implementing agent with a single, specific remediation request — not a list. If the same agent fails three consecutive times on the same issue, stop and escalate to the human with a summary of what was tried.
    
    ## Tool-Call Budget Discipline
    
    Every PM dispatch operates against a **soft tool-call budget of 8 reads per decomposition**. The budget is the load-bearing operational discipline — when PM reads beyond ~10 reference files in one turn, stream-idle timeouts become the dominant failure mode (post-mortem root cause: `gander-p6-moirai-skein-skills` §6 Gap A — two of three PM dispatches timed out at 40–60 min with zero output written; PM#1 attempted ~18 reads before timing out, PM#3 attempted ~10 reads on a revision task; PM#2 succeeded with exactly 4 reads on a leaner brief).
    
    **Hard rules:**
    
    - The PM's `<orchestrator_brief>` always names a fixed set of reference files to read. Read those files and **stop**. Do not opportunistically explore the codebase, browse adjacent skills, or re-read files already excerpted in the brief.
    - If the brief does not name reference files explicitly, default to ≤ 8 reads total: the brief itself, plus at most 7 reference reads. Surface a `<budget_exceeded>` warning to ORC if you find yourself at read 8 with the decomposition incomplete.
    - The brief's `<context>` and `<agent_remits>` blocks contain content that has been pre-extracted **for the explicit purpose of avoiding additional reads**. Treat them as the canonical excerpt — do not re-fetch the source file unless a specific ambiguity in the excerpt requires resolution.
    - **Halt-and-surface clause:** if you reach the budget cap and decomposition is still incomplete, write what you have to the output file, append a `<budget_exceeded>` block listing the unresolved questions, and return. Do not continue silently — the half-finished output with an explicit budget-exceeded marker is more useful than a stream-idle timeout that produces nothing.
    
    **Why a soft budget rather than a hard cap:** some sprints legitimately need more reads (multi-domain decompositions, sprints touching unfamiliar tooling). The rule is "halt and surface", not "halt at 8 unconditionally" — a PM that needs a 9th read should write its progress, surface the budget-exceeded marker, and let ORC decide whether to authorize a continuation, dispatch a leaner re-brief, or fall back to mediation. The point is to convert silent timeouts into observable budget overruns.
    
    **Retry pattern after timeout:** if a prior PM attempt for this sprint timed out, the next dispatch must come with a strictly leaner brief (≤ 4 named reference reads, with all critical content excerpted inline in the brief). Do not re-attempt with the same brief — the same brief produced the same timeout in the prior attempt.
    
    ## What the PM Does Not Do
    
    The PM does not write code, design components, or route completed packets between agents. Routing is the Orchestrator's responsibility. The PM's job is decomposition and planning — not execution or coordination.
    
    The PM does not escalate to the human directly. All escalations flow through the Orchestrator.
    
    If a planning consultation (RA, UI Designer, or DS) raises more questions than it resolves, incorporate what you have, flag remaining unknowns in `<risk_flags>`, and return the decomposition. The Orchestrator will determine whether to pause for human input.
    
    The PM's deliverable is a complete, accurate `<task_decomposition>` that the Orchestrator can execute without ambiguity.
  </agent>
  <agent name="frontend-engineer" version="2.1.2" source_file="/home/jhber/.claude/agents/frontend.md">
    ## Task Boundary Compliance
    
    **You must only implement what your task_id authorizes.** If your task_id is `005b-callbacks`, you are not authorized to implement `005b-infra` — even if the work appears small or obviously related. Each task_id represents a Critic-approved scope boundary. Consolidating tasks the Critic has explicitly split bypasses the 50-line ceiling gate and is a protocol violation.
    
    **Rule:** If your brief contains a single task_id, deliver exactly that task. If you believe consolidation is warranted (e.g., the split creates an awkward dependency), emit a `BLOCKED` event to ORC explaining why — do not proceed with consolidated work. Consolidation requires explicit ORC approval in the task prompt before you start, not a unilateral decision.
    
    **Enforcement signal:** Before issuing your `ui_packet`, confirm your task_id matches the task_id in your prompt. If you have implemented work described under a different task_id, this is a scope violation — omit that work and flag it in `<integration_status>`.
    
    ---
    
    ## Domain Boundaries (and Why They Exist)
    
    The FE/BE split means you consume data contracts, you don't define them. When you need data from the server, ask the PM to have BE produce a Zod schema first. Then build against that schema. If the schema doesn't exist yet, build against a typed mock that matches the expected shape — mark integration status as MOCKED in your output packet.
    
    This boundary exists because API shape decisions involve backend concerns (database queries, auth, caching) that FE shouldn't need to know about. Conversely, rendering decisions (layout, animation, empty states) are FE concerns that BE shouldn't prescribe. The Zod schema is the stable contract between them.
    
    The FE/UI Designer split: when a `<design_spec>` exists from the UI Designer, implement it faithfully. Don't redesign components during implementation — if the spec is wrong or incomplete, flag it in your output packet rather than improvising.
  </agent>
  <agent name="backend-engineer" version="1.5.2" source_file="/home/jhber/.claude/agents/backend.md">
    ## Domain Boundaries (and Why They Exist)
    
    The BE/FE split exists to prevent tight coupling between API shape and rendering logic. If you write JSX or CSS, the FE agent can't safely refactor the component tree without risking breakage of your assumptions. Conversely, if FE engineers write API contracts, the contract becomes implicit and untested. Keeping these domains separate means each side can evolve independently with a typed Zod schema as the stable boundary.
    
    The BE/DS split exists because database migrations carry risk that pure server logic doesn't. A bad API route is a runtime error; a bad migration can corrupt data. The DB Specialist owns that risk surface. Your job is to define what data you need (via entity types and Zod schemas) and let DS figure out how to persist it safely.
    
    **In practice:**
    - Write TypeScript for all server-side logic, validated at every API boundary with Zod
    - When you need a new table or column, describe the entity to the DB Specialist via a `<data_request>` — never write migrations yourself
    - When you need the FE to render something, expose a typed Zod response schema — never prescribe UI structure
  </agent>
  <agent name="code-auditor" version="3.4.0" source_file="/home/jhber/.claude/agents/auditor.md">
    <!-- WARNING: no remit section found — spec lacks an explicit remit/constraint heading. This is itself a finding. -->
  </agent>
  <agent name="critic" version="2.1.0" source_file="/home/jhber/.claude/agents/critic.md">
    <!-- WARNING: no remit section found — spec lacks an explicit remit/constraint heading. This is itself a finding. -->
  </agent>
</agent_remits>

<jidoka_synthesis sprint_id="prog-studio-v2-2026-07-s4-retirement" timestamp="2026-07-10T20:20:00Z">
  <planners_returned>2/2 (FEP#1 consolidated ×6 packets; BEP#1 ×1)</planners_returned>
  <overall_recommendation>repartition</overall_recommendation>
  <findings>
    <finding type="file_conflict">
      <affected_tasks>FE-2, FE-3</affected_tasks>
      <description>canvas-store.ts enumerated for deletion in FE-2 but ExportPage.tsx (deleted in FE-3) imports it at ~15 call sites — FE-2's lint SC unachievable as written</description>
      <recommended_action>Move canvas-store.ts deletion to FE-3</recommended_action>
    </finding>
    <finding type="assumption_wrong">
      <affected_tasks>FE-2, FE-4</affected_tasks>
      <description>constants/canvas.ts transitively required by hooks/useLinkSound.ts (alive via GraphPage/EditPage until FE-4); neither file enumerated for deletion anywhere</description>
      <recommended_action>Enumerate both; delete with FE-4</recommended_action>
    </finding>
    <finding type="assumption_wrong">
      <affected_tasks>FE-3, FE-4</affected_tasks>
      <description>prog-studio-vision-s2-d2-edit-save.spec.ts marked KEEP but tests CUT v1 EditPage (agent.save/skill.save, testid edit-page); real session-save spec is s2-d3-session-buffer.spec.ts</description>
      <recommended_action>Reassign to FE-4 deletion list</recommended_action>
    </finding>
    <finding type="scope_drift">
      <affected_tasks>FE-1</affected_tasks>
      <description>8 KEEP-surface e2e specs navigate via role="tab" at desktop viewport and break when 9-tab bar hidden >640px; none in FE-1 context_files (progression, program-dag, s4-legibility, s4-reduced-motion, s4-render-loop, s2-d3-session-buffer, s2-d4-prose-slug, s2-list-edit-fe)</description>
      <recommended_action>Add authorized nav-selector migration of these 8 specs to FE-1 scope + context_files</recommended_action>
    </finding>
    <finding type="assumption_wrong">
      <affected_tasks>BE-1</affected_tasks>
      <description>packages/shared/src/types.ts imports LoadoutSchema (derives type Loadout); dangling import fails the FIRST lint pass (shared) — file absent from BE-1 context_files/enumeration. HIGH.</description>
      <recommended_action>Add types.ts to BE-1 enumeration (remove Loadout type derivation) + prune router.ts dead ConnectivityGraphSchema import</recommended_action>
    </finding>
    <finding type="assumption_wrong">
      <affected_tasks>FE-4, FE-2</affected_tasks>
      <description>Retention corrections (planner-verified): analyzeStore.ts RETAIN (3 Sessions importers, zero Browse/Graph); constants/browse.ts RETAIN despite name (AgentTimeline.tsx consumer)</description>
      <recommended_action>Mark both RETAIN explicitly in packet out_of_scope to prevent overzealous deletion</recommended_action>
    </finding>
  </findings>
  <partitions_proposed>none — both split_recommendations were NO; repartition = enumeration/sequencing fixes within the existing 7-packet structure</partitions_proposed>
  <notes>Consolidated per-type dispatch (FEP#1 ×6 + BEP#1 ×1) — mixed-type variant of the codified consolidated mode. BEP#1 tooling note: BE spec session lacked Glob/Grep registration; used read-only Bash grep/ls/find honoring plan-only intent (working tree verified unmodified). Positive confirmations: 24→18 procedure count exact; all removed-procedure consumers deleted by strictly-preceding packets; ConnectivityGraphSchema protection holds; env.ts zero edits; planning-parser.test.ts self-contained.</notes>
</jidoka_synthesis>

## Rollback Point
commit: 6c58f4007e6a8d602468bc5cea81710544c37fa0
recorded: 2026-07-10T20:53:50Z
task_id: prog-studio-v2-2026-07-s4-retirement

To recover: git reset --hard 6c58f4007e6a8d602468bc5cea81710544c37fa0

## Names Registry
| Concept (stable) | Authoritative name (as of 2026-07-10T20:55Z) | Introduced by | Notes |
|---|---|---|---|
| 13-role catalog AppMode | `catalog` | prog-studio-v2-2026-07-s4-retirement rev1 (PM) | Critic-ratified CR#2; human-scoped 2026-07-10 |
| catalog page component | `RosterCatalogPage` | prog-studio-v2-2026-07-s4-retirement FE-CAT packet | PascalCase per conventions; corrected 2026-07-11 — ORC's initial `CatalogPage` entry was transcription drift vs rev3:265 (authoritative); delivered file is pages/RosterCatalogPage.tsx |

## Expectation Manifest — prog-studio-v2-2026-07-s4-retirement (from rev3, PM-authored, ORC-adopted 2026-07-10)

## Expectation Manifest (rev3)

<expectation_manifest>
  <sprint_id>prog-studio-v2-2026-07-s4-retirement</sprint_id>
  <generated>2026-07-10 (rev3)</generated>
  <assignments>
    <assignment>
      <task_id>prog-studio-v2-2026-07-s4-retirement-FE-1a</task_id>
      <agent>FE#1</agent>
      <expected_tag>ui_packet</expected_tag>
      <expected_file>.claude/tasks/outputs/prog-studio-v2-2026-07-s4-retirement-FE-1a-{ts}.md</expected_file>
      <blocks>FE-1b (+ all downstream)</blocks>
      <receipt_check>
        <item>SubmenuRail global (before BottomTabBar) + grid re-templated (≥640px rail area) + page-local mount removed; aria-label "Main navigation"</item>
        <item>NAV_ITEMS + BottomTabBar.tsx UNTOUCHED (9-tab fallback intact); nav never zero; rail verified global on a non-party surface</item>
        <item>NO e2e spec edited; hoist-caused-red classification recorded for FE-1b; lint ×3 + build green</item>
      </receipt_check>
    </assignment>
    <assignment>
      <task_id>prog-studio-v2-2026-07-s4-retirement-FE-1b</task_id>
      <agent>FE#2</agent>
      <expected_tag>ui_packet</expected_tag>
      <expected_file>.claude/tasks/outputs/prog-studio-v2-2026-07-s4-retirement-FE-1b-{ts}.md</expected_file>
      <blocks>FE-2 (+ all downstream)</blocks>
      <receipt_check>
        <item>NAV_ITEMS retired; <640px fold live (BottomTabBar→RAIL_ITEMS gated); nav reachable at desktop AND <640px; no zero-nav</item>
        <item>FLOOR + beyond: every pre-FE-1a-green KEEP spec green via RUN; each red classified migrate-vs-t5-baseline</item>
        <item>render-loop Progression-only; 4 t6b sub-tests removed; in-page Analyze-tab specs NOT migrated; lint ×3 + build + RUN</item>
      </receipt_check>
    </assignment>
    <assignment>
      <task_id>prog-studio-v2-2026-07-s4-retirement-FE-2</task_id>
      <agent>FE#3</agent>
      <expected_tag>ui_packet</expected_tag>
      <expected_file>.claude/tasks/outputs/prog-studio-v2-2026-07-s4-retirement-FE-2-{ts}.md</expected_file>
      <blocks>FE-3 (+ downstream), BE-1</blocks>
      <receipt_check>
        <item>Compose deleted incl. compose-store; canvas-store NOT deleted (explicit); 'compose' off union/PAGE_MAP; no trpc.loadout</item>
        <item>7 Compose specs deleted; lint ×3 + build + Playwright RUN; KEEP specs green</item>
      </receipt_check>
    </assignment>
    <assignment>
      <task_id>prog-studio-v2-2026-07-s4-retirement-FE-3</task_id>
      <agent>FE#4</agent>
      <expected_tag>ui_packet</expected_tag>
      <expected_file>.claude/tasks/outputs/prog-studio-v2-2026-07-s4-retirement-FE-3-{ts}.md</expected_file>
      <blocks>FE-CAT (+ downstream), BE-1</blocks>
      <receipt_check>
        <item>Export+Planning+canvas-store deleted; agent-roles.ts orphan decision w/ re-scan; 'export'/'planning' off union/PAGE_MAP</item>
        <item>s2-d3-session-buffer (KEEP) untouched; s2-d2-edit-save left for FE-4; no trpc.export/planning; lint ×3 + build + RUN</item>
      </receipt_check>
    </assignment>
    <assignment>
      <task_id>prog-studio-v2-2026-07-s4-retirement-FE-CAT</task_id>
      <agent>FE#5</agent>
      <expected_tag>ui_packet</expected_tag>
      <expected_file>.claude/tasks/outputs/prog-studio-v2-2026-07-s4-retirement-FE-CAT-{ts}.md</expected_file>
      <blocks>FE-4, DOCS-1</blocks>
      <receipt_check>
        <item>catalog reuses getParty (not agent.list), uncapped; 'catalog' mode not in rail; party 6-cap unchanged</item>
        <item>persistent populated-home CTA → catalog + Tier-2 assertion (cite ratification); data-driven count; new spec name + green; lint ×3 + build + RUN</item>
      </receipt_check>
    </assignment>
    <assignment>
      <task_id>prog-studio-v2-2026-07-s4-retirement-FE-4</task_id>
      <agent>FE#6</agent>
      <expected_tag>ui_packet</expected_tag>
      <expected_file>.claude/tasks/outputs/prog-studio-v2-2026-07-s4-retirement-FE-4-{ts}.md</expected_file>
      <blocks>BE-1, DOCS-1</blocks>
      <receipt_check>
        <item>s3 absorption cited green; RETAIN confirmations for analyzeStore + constants/browse.ts (KEEP consumer named)</item>
        <item>s2-d2-edit-save edit-page testid CONFIRMED before deletion (or BLOCKED); useLinkSound + constants/canvas.ts deleted w/ re-scan</item>
        <item>empty-state CTA → catalog; PartyPage compiles; no 'browse' literal; render-loop Graph sub-test removed; s2-party CTA testid updated; lint ×3 + build + RUN (s3/s2/catalog green)</item>
      </receipt_check>
    </assignment>
    <assignment>
      <task_id>prog-studio-v2-2026-07-s4-retirement-BE-1</task_id>
      <agent>BE#1</agent>
      <expected_tag>completion_packet</expected_tag>
      <expected_file>.claude/tasks/outputs/prog-studio-v2-2026-07-s4-retirement-BE-1-{ts}.md</expected_file>
      <blocks>DOCS-1</blocks>
      <receipt_check>
        <item>pre-removal scan; ConnectivityGraphSchema distinction (router.ts import pruned; definition + agent-detail import retained)</item>
        <item>types.ts Loadout-derivation removed + shared (first) tsc pass clean; final 18-procedure list for DOCS-1</item>
        <item>agent.list/skill.list/hook.list retained; env.ts unchanged; lint ×3 + server vitest + client build green; no inline commit</item>
      </receipt_check>
    </assignment>
    <assignment>
      <task_id>prog-studio-v2-2026-07-s4-retirement-DOCS-1</task_id>
      <agent>FE#7</agent>
      <expected_tag>completion_packet</expected_tag>
      <expected_file>.claude/tasks/outputs/prog-studio-v2-2026-07-s4-retirement-DOCS-1-{ts}.md</expected_file>
      <blocks>NONE (terminal; feeds Step 4.5 + skein)</blocks>
      <receipt_check>
        <item>surfaces table = 6 v2 surfaces incl. Roster Catalog; nav = global rail ("Main navigation") + <640px fold + catalog-via-CTA</item>
        <item>procedure table matches router.ts at HEAD (18, derived/confirmed); ConnectivityGraphSchema-retained note; architecture tree matches disk (analyzeStore retained; session-picker corrected)</item>
        <item>bundle baseline updated w/ source; DESIGN.md IA record (no tokens); deferred-work has the 4 deferrals w/ 2026-07-10 authorization</item>
      </receipt_check>
    </assignment>
  </assignments>
</expectation_manifest>


### ORC baseline-capture addendum (CR#4 W1 recipe)
- Pre-FE-1a full-suite Playwright baseline captured by ORC at HEAD 6c58f40 BEFORE FE-1a dispatch: pass/fail set at `/tmp/claude-1000/-home-jhber-projects-gander-studio-alpha/1a4d552d-df87-4fb7-a862-857e674976ff/scratchpad/pre-fe1a-baseline.json` (reconciled copy to be committed as ceremony at close). FE-1b floor-completeness SC references this captured set, reconciled against the t5 57-failure list.

## Sprint: prog-studio-v2-2026-07-s4-retirement — CLOSE-OUT (Step 4.9 refresh)

**Status:** CLOSED — human-VERIFIED at Step 4.5 ("okay looks good", 2026-07-11); REQVAL 16/16 (15 + R-005 closed by 4.5); AA close gate PASS (docs/after-actions/prog-studio-v2-2026-07-s4-retirement.md); archived (docs/project_log.md ~L2742). Pipeline: PM r0→amend1→rev1→amend2→rev2→rev3 | CR#1 BLOCK → CR#2/3 PASS+W → CR#4 PASS | jidoka REPARTITION (6 findings) | 8 packets + 2 rems, 10 audit PASS | 10 commits.

### Rollback Point (CURRENT — post-close)
commit: a7e4b96 (DOCS-1 durability commit; full close-state incl. ceremony 3acdfab)
recorded: 2026-07-11T06:30:00Z
task_id: prog-studio-v2-2026-07-s4-retirement
To recover: git -C /home/jhber/projects/gander-studio-alpha reset --hard a7e4b96
(Prior current point superseded: 6c58f40, recorded at s4 OPEN 2026-07-10.)

## Closed Tasks (Archive) — v2 program

| Task ID | Sprint | Status | Commits | Closed | Notes |
|---|---|---|---|---|---|
| prog-studio-v2-2026-07-s4-retirement | s4 (final sibling) | CLOSED | 3acdfab..a7e4b96 (10) | 2026-07-11 | v1 CUT/ABSORB surfaces retired client+server; catalog added; docs v2; program awaits skein |

---

## Sprint: prog-studio-v2-2026-07-s5-integration

**Goal:** Program integration mop-up (skein residue, SC-2..SC-5): ui Dialog safe-focus wrapper + ReviseSpecAction migration (t1), RelationshipPanel half-width decision-with-evidence (t2), stale-comment hygiene sweep + ORC-routed dir deletions (t3), deferred-work Accuracy row + cross-repo guarded-push reflect flag (t4). SC-1 (s4 SC-5 amendment) discharged pre-sprint — human RATIFIED 2026-07-18.

**Status:** CLOSED — human-VERIFIED at Step 4.5 ("ok, push!", 2026-07-18); 4/4 packets AUDIT_PASS (AUD#1 v2.0, seq 20); REQVAL COVERED 10/10 (RV#1 Mode B 9/10 -> ORC Mode A rev1 post human rmdir); AA close gate PASS (docs/after-actions/prog-studio-v2-2026-07-s5-integration.md); archived (project_log s5 entry + archive_correction L2760-2793 + POST_MORTEM L2795-2808). Commits: 1a61795 ceremony + 9e8afc8/d67c789/e70d6ef/4d7665c durability. E2E baseline 82g/43r @ f2164bb (operative control); auditor serial 84g/41r zero green->red.

### Rollback Point
commit: f2164bbcc14a09443579fb11114f2378c30a95c6
recorded: 2026-07-18T04:18:30Z
task_id: prog-studio-v2-2026-07-s5-integration
To recover: git -C /home/jhber/projects/gander-studio-alpha reset --hard f2164bbcc14a09443579fb11114f2378c30a95c6

### Plan artifacts
- ORC brief: `.claude/tasks/outputs/prog-studio-v2-2026-07-s5-integration-ORCBRIEF-1784347058.md`
- PM decomposition: `.claude/tasks/outputs/prog-studio-v2-2026-07-s5-integration-PM-1784347058.md`
- Critic PASS: `.claude/tasks/outputs/prog-studio-v2-2026-07-s5-integration-CR-1784347867.md`
- SC-precheck: `.claude/tasks/outputs/prog-studio-v2-2026-07-s5-integration-sc-precheck-report.json` (0 findings)
- Human request: `.claude/tasks/outputs/prog-studio-v2-2026-07-s5-integration-human-request.md`

### Expectation Manifest (assign-agents dispatch-time, s5-integration)

<expectation_manifest>
  <sprint_id>prog-studio-v2-2026-07-s5-integration</sprint_id>
  <generated>2026-07-18T04:19:48Z</generated>
  <assignments>
    <assignment>
      <task_id>prog-studio-v2-2026-07-s5-integration-t1</task_id>
      <agent>FE#1</agent>
      <expected_tag>ui_packet</expected_tag>
      <expected_file>.claude/tasks/outputs/prog-studio-v2-2026-07-s5-integration-t1-FE-1784348388.md</expected_file>
      <wave>1</wave>
      <blocks>NONE (feeds GATE-AUDIT)</blocks>
      <receipt_check>
        <item>dialog.tsx carries function-form initialFocus default ('?? false' present; baseline 0)</item>
        <item>ReviseSpecAction no longer references hasFocusedOnOpenRef (baseline 3); consumes wrapper API</item>
        <item>Popover clause discharged: symmetric support OR zero-consumer ACCEPT with grep citation</item>
        <item>e2e result BASELINE-RELATIVE vs s5 artifacts; s3-drilldowns observed count reported (target 8/8); no absolute "full suite green" claim; no "pre-existing" label without stash-A/B receipt</item>
        <item>lint x3 + client build PASS noted; no new Vite chunk-size warning</item>
      </receipt_check>
    </assignment>
    <assignment>
      <task_id>prog-studio-v2-2026-07-s5-integration-t2</task_id>
      <agent>FE#2</agent>
      <expected_tag>ui_packet</expected_tag>
      <expected_file>.claude/tasks/outputs/prog-studio-v2-2026-07-s5-integration-t2-FE-1784348388.md</expected_file>
      <wave>1</wave>
      <blocks>NONE</blocks>
      <receipt_check>
        <item>DECISION = RETUNE | ACCEPT, unambiguous</item>
        <item>Evidence artifact cited: screenshot path under .claude/tasks/outputs/ or measured half-width dimensions</item>
        <item>If RETUNE: diff confined to the four layout constants (RelationshipPanel.tsx:41-44); Handles intact; lint/build/e2e-baseline green. If ACCEPT: zero diff on the file</item>
      </receipt_check>
    </assignment>
    <assignment>
      <task_id>prog-studio-v2-2026-07-s5-integration-t3</task_id>
      <agent>FE#3</agent>
      <expected_tag>completion_packet</expected_tag>
      <expected_file>.claude/tasks/outputs/prog-studio-v2-2026-07-s5-integration-t3-FE-1784348388.md</expected_file>
      <wave>1</wave>
      <blocks>GATE-ORC-DELETE (ORC rmdir needs t3 enumeration)</blocks>
      <receipt_check>
        <item>Four stale comments corrected; each removed phrase stated; SC-3b REVISED two-part check: exportRouter.spawn grep==0 AND corrected 197-203 block text quoted verbatim (amend1 W4)</item>
        <item>THREE empty dirs (browse/edit/graph) enumerated as rmdir targets for ORC + any extra debris tagged tracked-vs-empty-dir</item>
        <item>quickcheck{,2}.mjs verify-absent evidence recorded; NO authored deletion for them</item>
        <item>NO agent-performed deletion command output (rm/find -delete/fs-API/rmdir)</item>
        <item>lint x3 + client build PASS noted; e2e note baseline-relative</item>
      </receipt_check>
    </assignment>
    <assignment>
      <task_id>prog-studio-v2-2026-07-s5-integration-t4</task_id>
      <agent>FE#4</agent>
      <expected_tag>completion_packet</expected_tag>
      <expected_file>.claude/tasks/outputs/prog-studio-v2-2026-07-s5-integration-t4-FE-1784348388.md</expected_file>
      <wave>1</wave>
      <blocks>NONE</blocks>
      <receipt_check>
        <item>New Accuracy family-grouping DEFERRED entry quoted (non-colliding tag; Source/What/Why/Schedule block)</item>
        <item>Cross-repo guarded-push reflect-pass flag quoted (contains cross-repo + do-not-fix-here language)</item>
        <item>git diff --name-only lists ONLY docs/deferred-work.md; zero edits under /home/jhber/projects/gander/</item>
        <item>Optional residue-1 cross-ref NOT added</item>
      </receipt_check>
    </assignment>
  </assignments>
</expectation_manifest>

## Sprint: prog-studio-v2-2026-07-s5-integration — CLOSE-OUT (Step 4.9 refresh)

**Status:** CLOSED (see updated Status line in the sprint section above). Program prog-studio-v2-2026-07: all 4 siblings DONE, skein STITCHED, s5 residue drained — program fully closed.

### Rollback Point (CURRENT — post-close)
commit: 4d7665c (t4 durability; full s5 chain 1a61795..4d7665c)
recorded: 2026-07-18T14:50:00Z
task_id: prog-studio-v2-2026-07-s5-integration
To recover: git -C /home/jhber/projects/gander-studio-alpha reset --hard 4d7665c
(Prior current point superseded: a7e4b96, recorded at s4 close 2026-07-11; f2164bb was the s5 OPEN-time point.)

## Closed Tasks (Archive) — v2 program (s5 addendum)

| Task ID | Sprint | Status | Commits | Closed | Notes |
|---|---|---|---|---|---|
| prog-studio-v2-2026-07-s5-integration | s5 (integration mop-up) | CLOSED | 1a61795..4d7665c (5) | 2026-07-18 | Skein residue drained: safe-focus wrapper, RelationshipPanel retune, hygiene sweep (rail-routed deletions), deferred-work ledger; program closed |
