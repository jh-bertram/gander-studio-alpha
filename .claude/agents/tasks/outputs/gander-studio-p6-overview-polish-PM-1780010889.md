# Task Decomposition — gander-studio-p6-overview-polish
generated: 2026-05-28T08:15:00Z
agent: PM#0
sprint_prefix: p6

---

## Recurring-Pattern Preflight (Step 0.5)

Post-mortems scanned: `prog-studio-sessions-2026-05-s3-analyze.md`, `prog-studio-sessions-2026-05-s2-list-edit.md`.

| Pattern | Source | How this plan addresses it |
|---|---|---|
| G1 — plan-time fact checks verify type, not value | s3 §6 | Brief provides file:line citations; PM reads confirmed actual constants and rendering code, not just types. |
| G2 — Tier-2 specs authored but not executed | s3 §6 | Both tasks ship e2e specs. Auditor must execute against live dev server as Step-4.5 gate (per s3 §6 G2 recommendation). |
| G5 — e2e tests coupled to incidental DOM state | s2 §6 | Specs use named fixture session ids and concrete `data-testid` selectors; no "first row" assertions. |
| OVERSCOPED multi-file bundles | gander-p2-agent-cards | t1 touches exactly 1 file (AgentTimeline.tsx) + 1 new e2e spec. t2 touches 1 existing file (SessionListPage.tsx) + 2 new files (util + unit test) + 1 new e2e spec. No 4-file bundles. |

---

<task_decomposition task_id="gander-studio-p6-overview-polish" agent_count="2">
  <task_packets>

<task_packet>
  <task_id>p6-t1-timeline-buffer</task_id>
  <assigned_to>FE</assigned_to>
  <priority>HIGH</priority>
  <description>
Add a right-edge pad to `AgentTimeline` so the final tick label and the rightmost bar end render fully within the SVG boundary, with a small visible gap.

**Root cause (verified in source):**
- `contentWidth = Math.max(containerWidth, LABEL_COL_WIDTH + contentBarArea)` (line ~258)
- `contentBarAreaActual = contentWidth - LABEL_COL_WIDTH` (line ~259)
- `normX(tAxisMax)` maps to exactly `LABEL_COL_WIDTH + contentBarAreaActual = contentWidth` — the right SVG edge
- Final tick (frac=1) placed at `x = contentWidth`, rendered `textAnchor="middle"` (line ~398) → right half clips off-screen
- Orphan barEndX = `contentWidth` (line ~412-414) → orphan bars extend to the exact SVG edge

**Fix approach:**
Introduce a new layout constant `RIGHT_PAD = 48` (pixels) at the top of the file alongside the other layout constants (lines ~23-36).

Expand the SVG width by RIGHT_PAD without expanding the plotting area:
```
// BEFORE (line ~368):
width={contentWidth}

// AFTER:
width={contentWidth + RIGHT_PAD}
```

The `normX` function, tick x positions, orphan `barEndX`, and the axis baseline `x2` do NOT change — they all remain anchored to `contentWidth`. The extra RIGHT_PAD is visual breathing room to the right of `contentWidth`. The SVG simply becomes wider; the plotting area stays the same.

**Specific line-level changes:**
1. Add `const RIGHT_PAD = 48;` in the layout constants block (after line 36, before the blank line).
2. Change `width={contentWidth}` on the `<svg>` element to `width={contentWidth + RIGHT_PAD}`.
3. The x-axis baseline `x2={contentWidth}` stays unchanged — the baseline ends at the plot boundary, not at the SVG edge.
4. No change to `normX`, ticks, orphan barEndX, zoom math, or the horizontal scroller div.

**Design decision — last tick textAnchor (flag for Critic):**
Currently all tick labels use `textAnchor="middle"`. With RIGHT_PAD, the final tick (at x=contentWidth) now has RIGHT_PAD/2=24px of clear space to its right before the SVG edge, so middle-anchor will show fully at RIGHT_PAD ≥ ~label-width/2. If the widest label is "+12.3h" (~35px at font-size 10), RIGHT_PAD=48 comfortably accommodates middle-anchor. However, a more deliberate choice is to change the final tick to `textAnchor="end"` (right-anchored at contentWidth) which guarantees the label never clips regardless of label width and RIGHT_PAD value. The Critic should adjudicate: keep `textAnchor="middle"` for all ticks (simpler, works with RIGHT_PAD=48) vs. change final tick to `textAnchor="end"` (defensive). Either is valid; PM leans toward keeping all ticks `textAnchor="middle"` for visual consistency, with RIGHT_PAD sized to accommodate the widest expected label.

**What must NOT change:**
- zoomLevel logic and ZOOM_MIN/ZOOM_MAX/ZOOM_STEP constants
- `MIN_BAR_AREA`, `MAX_BAR_AREA`, `PX_PER_SECOND` constants
- Horizontal scroller overflow-x: auto behavior
- Adaptive x-axis unit (deriveUnit / formatOffset)
- `normX` function
- Any aria attributes or keyboard nav

**Estimated change:** ~2 net new lines + 1 changed line in AgentTimeline.tsx.
  </description>
  <success_criteria>
SC1: `RIGHT_PAD` constant (value 48 or similar, ≥ 40) is defined in the layout constants block of `packages/client/src/components/sessions/AgentTimeline.tsx`.
  `grep -c 'RIGHT_PAD' packages/client/src/components/sessions/AgentTimeline.tsx` returns ≥ 1.

SC2: The SVG `width` attribute equals `contentWidth + RIGHT_PAD`, not bare `contentWidth`.
  `grep 'width={contentWidth' packages/client/src/components/sessions/AgentTimeline.tsx` must return a line containing `+ RIGHT_PAD`.

SC3: The `normX` function is unchanged — it still uses `contentBarAreaActual` (derived from `contentWidth - LABEL_COL_WIDTH`) as its scaling factor.
  `grep -A2 'function normX' packages/client/src/components/sessions/AgentTimeline.tsx` must contain `contentBarAreaActual`.

SC4: Tick x positions unchanged — `x: LABEL_COL_WIDTH + frac * contentBarAreaActual` formula is present.
  `grep 'frac \* contentBarAreaActual' packages/client/src/components/sessions/AgentTimeline.tsx` returns ≥ 1.

SC5: Orphan barEndX is unchanged from `contentWidth` (not `contentWidth + RIGHT_PAD`).
  `grep 'barEndX.*contentWidth' packages/client/src/components/sessions/AgentTimeline.tsx` returns a line without `RIGHT_PAD`.

SC6: `npm run lint` exits 0 (tsc --noEmit across all three packages).

SC7: Tier-2 e2e spec exists at `packages/client/tests/e2e/p6-t1-timeline-buffer.spec.ts` with at minimum:
  - A test that navigates to the Analyze tab for a session with timeline data (same fixture as agent-timeline-zoom.spec.ts: `gander-p6-moirai-skein-skills`)
  - A DOM-presence assertion that the `agent-timeline-svg` element is visible
  - An assertion that the SVG `width` attribute is strictly greater than the measured container width (i.e., the RIGHT_PAD is reflected in the rendered SVG width). Pattern: read `svg.getAttribute('width')` and the scroller div's `offsetWidth`; assert `svgWidth > scrollerWidth`.
  `ls packages/client/tests/e2e/p6-t1-timeline-buffer.spec.ts` returns the file.

SC8: No raw hex color values introduced (all colors use `var(--...)` CSS custom property references).
  `grep -E '#[0-9a-fA-F]{3,6}' packages/client/src/components/sessions/AgentTimeline.tsx` returns 0 lines (or lines that were already present in HEAD — only new lines are checked).
  </success_criteria>
  <context_files>
    packages/client/src/components/sessions/AgentTimeline.tsx (full file)
    packages/client/tests/e2e/agent-timeline-zoom.spec.ts (reference for e2e navigation pattern and fixture session id)
  </context_files>
  <dependencies>NONE — this task is independent of p6-t2</dependencies>
  <out_of_scope>
- Do NOT touch SessionListPage.tsx, AgentStatPanel.tsx, AgentStatTable.tsx, or any other file.
- Do NOT add any new tRPC calls or schema changes.
- Do NOT change the zoom controls, zoom constants, or zoom state.
- Do NOT change the horizontal scroller wrapper.
- Do NOT modify the normX function, tick label math, or axis unit derivation.
- Do NOT add Shadcn ui/* primitives or raw hex color values.
- Do NOT git commit — return a completion_packet only.
  </out_of_scope>
  <estimated_new_lines>~15 (2 new lines in AgentTimeline.tsx + ~60 lines in the new e2e spec — total well under 100)</estimated_new_lines>
  <output_expected>
    <tag>completion_packet</tag>
    <must_contain>
      <item>confirmation that RIGHT_PAD constant was added with its value</item>
      <item>the SVG width expression change (contentWidth + RIGHT_PAD)</item>
      <item>path to the new e2e spec: packages/client/tests/e2e/p6-t1-timeline-buffer.spec.ts</item>
      <item>npm run lint exit code (must be 0)</item>
      <item>explicit statement of the textAnchor design decision made (kept middle vs. changed to end for final tick)</item>
    </must_contain>
    <must_not_contain>
      <item>raw hex color values</item>
      <item>changes to normX, tick math, or zoom logic</item>
      <item>any Shadcn ui/* imports</item>
      <item>git commit sha (agent must not commit)</item>
    </must_not_contain>
    <success_signal>lint passing + new e2e spec file present + diff shows only AgentTimeline.tsx modified (plus new spec file) + completion_packet returned (no commit)</success_signal>
  </output_expected>
</task_packet>

<task_packet>
  <task_id>p6-t2-agent-grouping</task_id>
  <assigned_to>FE</assigned_to>
  <priority>HIGH</priority>
  <description>
Group agent iterations (AR#0, AR#1, AR#2) into a single base-code card ("AR") in the Sessions overview aggregate panel. This is display-only grouping on the client side; the server `aggregate-stats.ts` and all tRPC procedures are unchanged.

**Files to create/modify:**

**NEW: `packages/client/src/utils/group-agents.ts`**
A pure utility module exporting one function:

```typescript
import type { AgentActivity } from '@gander-studio/shared';

/**
 * Group AgentActivity records by base agent code.
 * "AR#0", "AR#1", "AR#2" → "AR" with summed numeric fields.
 *
 * wall_clock_ms semantics (mirrors aggregate-stats.ts lines 65-117):
 *   - undefined if no contributor in the group has a defined wall_clock_ms
 *   - sum of all defined wall_clock_ms values if at least one contributor is defined
 *
 * Base code extraction: agent_id.split('#')[0]
 * If agent_id contains no '#', the whole string is the base code.
 *
 * The returned AgentActivity[] uses the base code as agent_id.
 * Order is alphabetical by base code (for stable rendering).
 */
export function groupAgentsByBaseCode(agents: AgentActivity[]): AgentActivity[] {
  const map = new Map<string, AgentActivity>();

  for (const agent of agents) {
    const baseCode = agent.agent_id.split('#')[0];
    const existing = map.get(baseCode);
    if (!existing) {
      // First contributor — clone with baseCode as agent_id
      map.set(baseCode, {
        agent_id: baseCode,
        spawns: agent.spawns,
        completes: agent.completes,
        feedback_loops: agent.feedback_loops,
        critique_passes: agent.critique_passes,
        critique_blocks: agent.critique_blocks,
        audit_passes: agent.audit_passes,
        audit_fails: agent.audit_fails,
        wall_clock_ms: agent.wall_clock_ms,  // undefined if source is undefined
      });
    } else {
      // Accumulate
      existing.spawns          += agent.spawns;
      existing.completes       += agent.completes;
      existing.feedback_loops  += agent.feedback_loops;
      existing.critique_passes += agent.critique_passes;
      existing.critique_blocks += agent.critique_blocks;
      existing.audit_passes    += agent.audit_passes;
      existing.audit_fails     += agent.audit_fails;
      // wall_clock_ms: undefined + defined = defined (sum only defined contributors)
      if (agent.wall_clock_ms !== undefined) {
        existing.wall_clock_ms = (existing.wall_clock_ms ?? 0) + agent.wall_clock_ms;
      }
    }
  }

  return Array.from(map.values()).sort((a, b) =>
    a.agent_id.localeCompare(b.agent_id)
  );
}
```

File: `packages/client/src/utils/group-agents.ts`

**NEW: `packages/client/src/utils/group-agents.unit.ts`**
Playwright-based unit test (Vitest is NOT installed in this project — see risk note). Because Vitest is absent, write this as a Playwright test file under `packages/client/tests/e2e/` with a `test.describe('groupAgentsByBaseCode unit', ...)` block that exercises the pure function directly (import it, call it, assert with Playwright's `expect`). File: `packages/client/tests/e2e/p6-t2-group-agents-unit.spec.ts`.

Alternatively — and preferred — add `vitest` as a devDependency in `packages/client/package.json` (latest stable, e.g. `"vitest": "^1.6.0"`) and write a `.test.ts` file at `packages/client/src/utils/group-agents.test.ts`. If FE installs vitest, add a `"test": "vitest run"` script to `packages/client/package.json`. The auditor will accept either approach; document which was chosen in the completion_packet.

Test cases the unit test MUST cover:
1. Empty array → returns []
2. Single agent with no '#' → returns [{ agent_id: "AR", spawns: N, ... }]
3. Three agents AR#0/AR#1/AR#2 → returns [{ agent_id: "AR", spawns: sum, ... }]
4. wall_clock_ms: all undefined → grouped result wall_clock_ms is undefined
5. wall_clock_ms: one undefined, two defined → grouped result = sum of the two defined values
6. Two different base codes (AR#0, PM#0) → returns two entries, sorted alphabetically
7. Mixed: AR#0 + AR#1 + PM#0 → AR has sum of AR#0+AR#1; PM has PM#0's values

**MODIFY: `packages/client/src/pages/sessions/SessionListPage.tsx`**
Import `groupAgentsByBaseCode` and apply it before the map in `AggregatePanel`.

Current render site (lines ~406-428):
```tsx
// Per-agent panels grid
{stats.agents.length > 0 && (
  <div style={{ display: 'grid', ... }}>
    {stats.agents.map((activity) => (
      <AgentStatPanel key={activity.agent_id} activity={activity} metrics={OVERVIEW_METRICS} />
    ))}
  </div>
)}
<AgentStatTable activities={stats.agents} metrics={OVERVIEW_METRICS} />
```

Change to:
```tsx
import { groupAgentsByBaseCode } from '../../utils/group-agents';

// Inside AggregatePanel, before the JSX return (or inline):
const groupedAgents = groupAgentsByBaseCode(stats.agents);

// Per-agent panels grid
{groupedAgents.length > 0 && (
  <div style={{ display: 'grid', ... }}>
    {groupedAgents.map((activity) => (
      <AgentStatPanel key={activity.agent_id} activity={activity} metrics={OVERVIEW_METRICS} />
    ))}
  </div>
)}
<AgentStatTable activities={groupedAgents} metrics={OVERVIEW_METRICS} />
```

The `groupAgentsByBaseCode` call produces a sorted `AgentActivity[]` with base-code `agent_id` values; `AgentStatPanel` and `AgentStatTable` both accept `AgentActivity` with no schema change needed.

**Optional design decision — instance count badge:**
The brief raises "AR ×3" as an optional display enhancement. Do NOT implement it in this task. The grouping itself is the deliverable. Surface it as a future enhancement note in the completion_packet. Adding the badge would require modifying AgentStatPanel's interface, which is out of scope.

**NEW: Tier-2 e2e spec — `packages/client/tests/e2e/p6-t2-agent-grouping.spec.ts`**
Must use the `gander-p6-moirai-skein-skills` fixture (known to have agents including multiple iterations of the same base code, e.g. AR#0, AR#1, AR#2 — 22 agents per overview-aggregate.spec.ts line 77).

The spec must:
1. Navigate to the Sessions list page (same pattern as overview-aggregate.spec.ts).
2. Assert the `aggregate-stats-panel` is visible.
3. Assert that a card/row labeled "AR" (the base code) IS visible in the aggregate panel.
4. Assert that a card/row labeled "AR#0" (a per-instance id) is NOT visible in the aggregate panel.
5. Assert that a card/row labeled "AR#1" is NOT visible.

Implementation note: `AgentStatPanel` renders `{agent_id}` inside a `<span>` (line 100 of AgentStatPanel.tsx). Use `page.locator('[aria-label*="AR statistics"]')` (the article has `aria-label={"{agent_id} statistics"}`) to check for the grouped card presence. For absence: `page.locator('[aria-label*="AR#0 statistics"]')` must not be visible.

`AgentStatTable` renders rows with `agent_id` text. Use `page.locator('[data-testid="aggregate-stats-panel"]').getByText('AR#0', { exact: true })` must not be visible.
  </description>
  <success_criteria>
SC1: `packages/client/src/utils/group-agents.ts` exists.
  `ls packages/client/src/utils/group-agents.ts` exits 0.

SC2: The file exports `groupAgentsByBaseCode` function accepting `AgentActivity[]` and returning `AgentActivity[]`.
  `grep 'export function groupAgentsByBaseCode' packages/client/src/utils/group-agents.ts` returns 1 line.

SC3: The function uses `agent_id.split('#')[0]` for base code extraction.
  `grep "split('#')" packages/client/src/utils/group-agents.ts` returns ≥ 1 line.

SC4: Unit tests exist (either Vitest .test.ts or Playwright .spec.ts — agent must state which in completion_packet) and cover at minimum: empty array, single agent without '#', three-way AR grouping, wall_clock_ms all-undefined case, wall_clock_ms partial-defined case, two-base-code sorting.
  `ls packages/client/src/utils/group-agents.test.ts` OR `ls packages/client/tests/e2e/p6-t2-group-agents-unit.spec.ts` exits 0.

SC5: `SessionListPage.tsx` imports `groupAgentsByBaseCode` from the new util.
  `grep 'groupAgentsByBaseCode' packages/client/src/pages/sessions/SessionListPage.tsx` returns ≥ 1 line.

SC6: Both `AgentStatPanel` map and `AgentStatTable` props use the grouped result, not `stats.agents` directly.
  `grep 'stats\.agents' packages/client/src/pages/sessions/SessionListPage.tsx` must return 0 lines within the AggregatePanel render body (the top-level stats.agents access for the `stats.agents.length > 0` guard is acceptable if the grouped variable is used in the map; otherwise that guard should also use `groupedAgents.length > 0`).

SC7: `npm run lint` exits 0.

SC8: Tier-2 e2e spec exists at `packages/client/tests/e2e/p6-t2-agent-grouping.spec.ts`.
  `ls packages/client/tests/e2e/p6-t2-agent-grouping.spec.ts` exits 0.

SC9: The e2e spec asserts that a grouped "AR" card is present AND "AR#0" is NOT present in the aggregate panel.
  `grep 'AR#0' packages/client/tests/e2e/p6-t2-agent-grouping.spec.ts` returns ≥ 1 line (the NOT-present assertion).
  `grep '"AR statistics"' packages/client/tests/e2e/p6-t2-agent-grouping.spec.ts` OR `grep "'AR statistics'" packages/client/tests/e2e/p6-t2-agent-grouping.spec.ts` returns ≥ 1 line (the present assertion).

SC10: No Shadcn ui/* imports added. No raw hex values.
  `grep "from '@/components/ui" packages/client/src/utils/group-agents.ts` returns 0.
  `grep -E '#[0-9a-fA-F]{3,6}' packages/client/src/utils/group-agents.ts` returns 0.

SC11: `AgentStatPanel.tsx` and `AgentStatTable.tsx` are NOT modified (grouping is purely in SessionListPage.tsx + the new util).
  `git diff HEAD -- packages/client/src/components/sessions/AgentStatPanel.tsx` returns empty.
  `git diff HEAD -- packages/client/src/components/sessions/AgentStatTable.tsx` returns empty.
  </success_criteria>
  <context_files>
    packages/client/src/pages/sessions/SessionListPage.tsx (lines 1-50 for imports; lines 395-430 for AggregatePanel render site)
    packages/client/src/components/sessions/AgentStatPanel.tsx (lines 35-112 — component interface and agent_id render site)
    packages/client/src/components/sessions/AgentStatTable.tsx (lines 1-55 — interface and sort logic)
    packages/shared/src/schemas.ts (lines 68-80 — AgentActivity schema)
    packages/server/src/parsers/aggregate-stats.ts (reference only for wall_clock_ms undefined-handling semantics — do not modify)
    packages/client/tests/e2e/overview-aggregate.spec.ts (reference for navigation pattern and fixture fixture session id)
    packages/client/package.json (to confirm vitest is absent and decide whether to install it)
  </context_files>
  <dependencies>NONE — this task is independent of p6-t1</dependencies>
  <out_of_scope>
- Do NOT modify AgentStatPanel.tsx, AgentStatTable.tsx, or any component file.
- Do NOT modify any server files (aggregate-stats.ts, router.ts, schemas.ts).
- Do NOT add any tRPC procedure or modify the AgentActivity Zod schema.
- Do NOT implement the "AR ×3" instance-count badge (optional future enhancement only).
- Do NOT touch the per-session Analyze tab, AgentTimeline, or analyzeStore.
- Do NOT modify session.getStats or any backend aggregation.
- Do NOT git commit.
- AgentStatPanel and AgentStatTable already accept AgentActivity[] — do not change their props interfaces.
  </out_of_scope>
  <estimated_new_lines>~80 new lines total: ~45 in group-agents.ts, ~20 in unit test, ~40 in e2e spec, ~5 lines changed in SessionListPage.tsx. Total well under 100 per file.</estimated_new_lines>
  <output_expected>
    <tag>completion_packet</tag>
    <must_contain>
      <item>path to new util: packages/client/src/utils/group-agents.ts</item>
      <item>which unit test approach was chosen (Vitest or Playwright) and the file path</item>
      <item>confirmation that SessionListPage.tsx now maps over groupedAgents (not stats.agents) for both the panel grid and AgentStatTable</item>
      <item>path to new e2e spec: packages/client/tests/e2e/p6-t2-agent-grouping.spec.ts</item>
      <item>npm run lint exit code (must be 0)</item>
      <item>note on whether vitest was added as a devDependency (yes/no and version if yes)</item>
    </must_contain>
    <must_not_contain>
      <item>modifications to AgentStatPanel.tsx or AgentStatTable.tsx</item>
      <item>any tRPC or server file modifications</item>
      <item>raw hex color values</item>
      <item>git commit sha</item>
    </must_not_contain>
    <success_signal>lint passing + new util + new unit test + new e2e spec all present + SessionListPage.tsx grouping confirmed + completion_packet returned (no commit)</success_signal>
  </output_expected>
</task_packet>

  </task_packets>

  <dependency_order>
    p6-t1-timeline-buffer and p6-t2-agent-grouping are PARALLEL — no dependency between them.
    They touch disjoint files: t1 touches AgentTimeline.tsx only; t2 touches SessionListPage.tsx + new util files.
    Both can dispatch in the same wave.
  </dependency_order>

  <routing_notes>
    - DESIGN.md absent at packages/client/ — FE agents operate on inferred tokens (CSS custom properties in globals.css). Both tasks add no new visible tokens; existing var(--...) references apply.
    - Vitest not installed: the brief calls for a "Vitest unit test" for groupAgentsByBaseCode. Vitest is absent from packages/client/package.json devDependencies. p6-t2 gives FE the option to either install vitest (preferred) or use a Playwright spec for the unit-style assertions. Orchestrator should note this as a pre-dispatch clarification if desired.
    - textAnchor design decision (p6-t1): the packet flags this for the Critic. The PM recommendation is to keep textAnchor="middle" for all ticks and size RIGHT_PAD to accommodate the widest label. Critic should either ratify or require the final tick to use textAnchor="end".
    - Both tasks must NOT git commit — implementing agents return completion_packets; the orchestrator commits post-audit.
    - e2e specs reference the fixture session `gander-p6-moirai-skein-skills` (known to have 22 agents including multiple AR iterations and SPAWN+COMPLETE events). Confirm dev server is live before dispatching e2e audits (env-preflight per s3 §6 G2 recommendation).
    - Prior approved tasks in SessionListPage.tsx from previous sprints: the AggregatePanel was added in p5 and is the current HEAD state. No prior-sprint additions in this sprint wave conflict with p6-t2's changes.
    - append_serialization: no shared append-target files in this sprint (no changelog appends).
    - proposed_rename: none — all human phrases retained verbatim ("buffer", "group", "overview").
    - recurring_pattern declarations:
      &lt;recurring_pattern source="prog-studio-sessions-2026-05-s3-analyze.md"&gt;G1 — plan-time fact checks verify type not value&lt;/recurring_pattern&gt; AVOIDED: brief cites file:line; PM verified constants directly.
      &lt;recurring_pattern source="prog-studio-sessions-2026-05-s3-analyze.md"&gt;G2 — Tier-2 specs authored but not executed&lt;/recurring_pattern&gt; MITIGATED: both tasks ship e2e specs; auditor must execute them.
      &lt;recurring_pattern source="prog-studio-sessions-2026-05-s2-list-edit.md"&gt;G5 — e2e tests coupled to incidental state&lt;/recurring_pattern&gt; MITIGATED: named fixture, concrete testids.
      &lt;recurring_pattern source="gander-studio-p2-agent-cards"&gt;OVERSCOPED — multi-file bundle in single FE task&lt;/recurring_pattern&gt; AVOIDED: t1=1 file, t2=1 file modified + 2 new files (disjoint).
  </routing_notes>

  <risk_flags>
    - VITEST_ABSENT: Vitest is not installed in packages/client/package.json. The brief asks for a "Vitest unit test." The task packet offers FE the choice of installing vitest or using Playwright for unit assertions. If the auditor requires Vitest specifically, FE must install it (adds a devDependency). Orchestrator should pre-confirm with human if adding devDependencies requires approval.
    - DESIGN.md absent at packages/client/ — FE and UI Designer will operate on inferred tokens (FF7 var(--...) custom properties). Low risk for this sprint since neither task introduces new color tokens.
    - textAnchor design decision: RIGHT_PAD=48 accommodates middle-anchor for labels up to ~96px wide at 10px font. The widest expected label ("+12.3h" ≈ 30-35px at font-size 10) is well within that. If the Critic requires a defensive textAnchor="end" for the final tick, that is a ~1-line change that doesn't affect the rest of the plan.
    - gander-p6-moirai-skein-skills fixture session: both e2e specs use this fixture. It has 22 agents including multiple AR iterations. If the session's event log is empty (the s3 bug was a slug mismatch fixed in ace3e34), the timeline spec will get "No timeline data" and fail. The fix is confirmed committed; confirm dev server serves the correct data before e2e audit.
    - wall_clock_ms undefined-handling in groupAgentsByBaseCode: the semantics mirror aggregate-stats.ts. If any contributor has a defined wall_clock_ms, the group sum should be defined. FE must not use `?? 0` on the initial assignment (would convert undefined to 0 prematurely).
  </risk_flags>
</task_decomposition>

---

## Verbatim Deliverable Audit

<verbatim_deliverable_audit>
  <phrase>on the timeline</phrase>
  <addressed task="p6-t1-timeline-buffer"/>

  <phrase>add a buffer at the right end of the plotted data</phrase>
  <addressed task="p6-t1-timeline-buffer"/>

  <phrase>the task that ends at '2hrs' has 2hrs clearly visible with space for the whole text string</phrase>
  <addressed task="p6-t1-timeline-buffer"/>

  <phrase>a small buffer for the bar before the graph area ends</phrase>
  <addressed task="p6-t1-timeline-buffer"/>

  <phrase>sessions overview</phrase>
  <addressed task="p6-t2-agent-grouping"/>

  <phrase>tons of cards for agents, and agent iterations (e.g. AR#0, AR#1, AR#2)</phrase>
  <addressed task="p6-t2-agent-grouping"/>

  <phrase>group these (e.g. 'AR')</phrase>
  <addressed task="p6-t2-agent-grouping"/>
</verbatim_deliverable_audit>

---

## Expectation Manifest

```xml
<expectation_manifest>
  <sprint_id>gander-studio-p6-overview-polish</sprint_id>
  <generated>2026-05-28T08:15:00Z</generated>
  <assignments>
    <assignment>
      <task_id>p6-t1-timeline-buffer</task_id>
      <agent>FE#1</agent>
      <expected_tag>completion_packet</expected_tag>
      <expected_file>.claude/agents/tasks/outputs/p6-t1-timeline-buffer-FE-*.md</expected_file>
      <blocks>NONE</blocks>
      <receipt_check>
        <item>RIGHT_PAD constant defined (value stated)</item>
        <item>SVG width expression is contentWidth + RIGHT_PAD (confirmed)</item>
        <item>normX function unchanged (confirmed)</item>
        <item>textAnchor design decision explicitly stated (kept middle or changed to end)</item>
        <item>e2e spec path: packages/client/tests/e2e/p6-t1-timeline-buffer.spec.ts</item>
        <item>npm run lint exit 0 confirmed</item>
        <item>no git commit sha in packet</item>
      </receipt_check>
    </assignment>
    <assignment>
      <task_id>p6-t2-agent-grouping</task_id>
      <agent>FE#2</agent>
      <expected_tag>completion_packet</expected_tag>
      <expected_file>.claude/agents/tasks/outputs/p6-t2-agent-grouping-FE-*.md</expected_file>
      <blocks>NONE</blocks>
      <receipt_check>
        <item>packages/client/src/utils/group-agents.ts exists (confirmed)</item>
        <item>unit test approach stated (Vitest or Playwright) and file path confirmed</item>
        <item>SessionListPage.tsx groupedAgents used in both panel grid and AgentStatTable</item>
        <item>AgentStatPanel.tsx and AgentStatTable.tsx NOT modified (confirmed by git diff empty)</item>
        <item>e2e spec path: packages/client/tests/e2e/p6-t2-agent-grouping.spec.ts</item>
        <item>npm run lint exit 0 confirmed</item>
        <item>no git commit sha in packet</item>
      </receipt_check>
    </assignment>
  </assignments>
</expectation_manifest>
```

---

## No-Stub Self-Check

Task_packet count declared: 2 (p6-t1-timeline-buffer, p6-t2-agent-grouping).
Task_packet count in file: 2 (both `&lt;task_packet&gt;` blocks present inline above).
Match: YES. No stubs.
