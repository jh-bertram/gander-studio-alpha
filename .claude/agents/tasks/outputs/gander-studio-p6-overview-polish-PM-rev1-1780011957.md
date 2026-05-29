# Task Decomposition — gander-studio-p6-overview-polish (rev1)
generated: 2026-05-28T08:46:00Z
agent: PM#0
sprint_prefix: p6
revision: rev1 (CRITIQUE_BLOCK resolution)

---

## Stage 1 — RECEIVED
ts: 2026-05-28T08:40:00Z
input: CR CRITIQUE_BLOCK — 1 BLOCKER (t1 geometry), 3 WARNINGs (t1 e2e arithmetic proxy; t2 hardcoded roster; t2 vitest version)
action: read prior PM packet, CR packet, AgentTimeline.tsx lines 33-36 + 245-420

## Stage 2 — PLAN
Changes from rev0:
- t1: fold RIGHT_PAD INSIDE the plot area (shrink plotAreaWidth, keep svg width = contentWidth). All normX/tick/barEndX anchors move to plotRight = LABEL_COL_WIDTH + plotAreaWidth. SC2, SC5, SC7 rewritten.
- t1 e2e: replace arithmetic proxy with Playwright boundingBox() assertions + short-session scrollWidth guard.
- t2 e2e: replace hardcoded "AR" assertions with roster-agnostic assertions (no /#\d+$/ labels, folded count = distinct base codes, ≥1 base code folded from ≥2 instances).
- t2 vitest: change devDep from ^1.6.0 to ^4 to match server's vitest@^4.1.7. Add minimal vitest.config.ts (node environment).
- All other rev0 content (groupAgentsByBaseCode logic, AgentStatPanel/Table byte-identical guard, parallel wave, deferred instance-count badge) kept unchanged.

## Recurring-Pattern Preflight (Step 0.5)

Post-mortems scanned: `prog-studio-sessions-2026-05-s3-analyze.md`, `prog-studio-sessions-2026-05-s2-list-edit.md`.

| Pattern | Source | How this plan addresses it |
|---|---|---|
| G1 — plan-time fact checks verify type, not value | s3 §6 | PM read AgentTimeline.tsx lines 33-36, 245-277, 362-420 directly before writing geometry spec. Exact variable names and line references confirmed. |
| G2 — Tier-2 specs authored but not executed | s3 §6 | Both tasks ship e2e specs. Auditor must execute against live dev server (env-preflight) before marking PASS. |
| G5 — e2e tests coupled to incidental DOM state | s2 §6 | t2 spec rewritten to be roster-agnostic (derive expected from live aggregateStats response, not hardcoded strings). |
| OVERSCOPED multi-file bundles | gander-p2-agent-cards | t1 = 1 file modified + 1 new e2e spec. t2 = 1 existing file modified + 2 new files + 1 new e2e spec + 1 new config file. All disjoint. |

---

<task_decomposition task_id="gander-studio-p6-overview-polish" agent_count="2">
  <task_packets>

<task_packet>
  <task_id>p6-t1-timeline-buffer</task_id>
  <assigned_to>FE</assigned_to>
  <priority>HIGH</priority>
  <description>
Add a right-edge buffer to `AgentTimeline` so the final tick label and the rightmost bar render
fully within the SVG boundary, with a visible gap between the rightmost bar and the SVG right edge.

**Root cause (verified in source — AgentTimeline.tsx):**
- Line 258: `contentWidth = Math.max(containerWidth, LABEL_COL_WIDTH + contentBarArea)` — the floor at containerWidth is the short-session no-scroll guarantee.
- Line 259: `contentBarAreaActual = contentWidth - LABEL_COL_WIDTH`
- Line 265-267: `normX(ts) = LABEL_COL_WIDTH + ((ts - tAxisMin) / tAxisRange) * contentBarAreaActual` — so `normX(tAxisMax) = contentWidth`, the SVG right edge.
- Line 274: tick x for final tick (frac=1) = `LABEL_COL_WIDTH + contentBarAreaActual = contentWidth` — middle-anchored label clips off right edge.
- Line 412-414: orphan `barEndX = contentWidth` — orphan bars extend to the exact SVG right edge.

**Correct geometry fix — fold RIGHT_PAD INSIDE the plot area:**

DO NOT change `svg width` or `contentWidth`. The floor `Math.max(containerWidth, ...)` must remain intact to preserve the short-session no-scroll path.

Instead, subtract RIGHT_PAD from the plotting sub-area so all data ends RIGHT_PAD before the SVG right edge:

```
const RIGHT_PAD = 48;  // pixels reserved at right of plot area for label breathing room
const plotAreaWidth = Math.max(MIN_BAR_AREA, contentBarAreaActual - RIGHT_PAD);
const plotRight = LABEL_COL_WIDTH + plotAreaWidth;
// plotRight === contentWidth - RIGHT_PAD (in the normal wide-session case)
// svg width = contentWidth (UNCHANGED)
```

**Specific line-level changes (all in AgentTimeline.tsx):**

1. Add two constants in the layout constants block (after the `PX_PER_SECOND` line, ~line 36):
   ```
   const RIGHT_PAD = 48;
   ```
   NOTE: `plotAreaWidth` and `plotRight` are derived variables computed inside the component render, NOT top-level constants. They depend on `contentBarAreaActual` which changes per render.

2. After line 259 (`const contentBarAreaActual = ...`), add:
   ```typescript
   const plotAreaWidth = Math.max(MIN_BAR_AREA, contentBarAreaActual - RIGHT_PAD);
   const plotRight = LABEL_COL_WIDTH + plotAreaWidth;
   ```

3. Update `normX` (lines 265-267) to map `tAxisMax` → `plotRight` instead of `contentWidth`:
   ```typescript
   // BEFORE:
   function normX(ts: number): number {
     return LABEL_COL_WIDTH + ((ts - tAxisMin) / tAxisRange) * contentBarAreaActual;
   }
   // AFTER:
   function normX(ts: number): number {
     return LABEL_COL_WIDTH + ((ts - tAxisMin) / tAxisRange) * plotAreaWidth;
   }
   ```

4. Update tick x positions (lines 270-277) to use `plotAreaWidth` instead of `contentBarAreaActual`:
   ```typescript
   // BEFORE:
   x: LABEL_COL_WIDTH + frac * contentBarAreaActual,
   // AFTER:
   x: LABEL_COL_WIDTH + frac * plotAreaWidth,
   ```
   (Last tick now lands at `plotRight`, which is RIGHT_PAD before the SVG right edge.)

5. Update orphan `barEndX` (lines 412-414) to use `plotRight` instead of `contentWidth`:
   ```typescript
   // BEFORE:
   const barEndX = bar.isOrphan ? contentWidth : normX(bar.completeTs as number);
   // AFTER:
   const barEndX = bar.isOrphan ? plotRight : normX(bar.completeTs as number);
   ```

6. Update axis baseline `x2` (line 380) to stop at `plotRight`:
   ```typescript
   // BEFORE:
   x2={contentWidth}
   // AFTER:
   x2={plotRight}
   ```
   Rationale: baseline ending at the plot extent is visually cleaner and matches the data extent. The RIGHT_PAD region to the right of plotRight is intentionally blank.

7. SVG `width={contentWidth}` (line 368) stays UNCHANGED. The scroller div width equals contentWidth; the SVG width equals contentWidth; no scrollbar is introduced on short sessions.

**What must NOT change:**
- `svg width={contentWidth}` — leave byte-identical
- `contentWidth = Math.max(containerWidth, LABEL_COL_WIDTH + contentBarArea)` — leave byte-identical
- `contentBarAreaActual = contentWidth - LABEL_COL_WIDTH` — leave byte-identical (it is still needed for the plotAreaWidth derivation)
- zoomLevel logic and ZOOM_MIN/ZOOM_MAX/ZOOM_STEP constants
- MIN_BAR_AREA, MAX_BAR_AREA, PX_PER_SECOND constants
- Horizontal scroller overflow-x: auto behavior
- Adaptive x-axis unit (deriveUnit / formatOffset)
- All tick textAnchor="middle" — no change needed; final tick now has RIGHT_PAD=48px of clear space to its right
- Any aria attributes or keyboard nav

**Estimated change:** 1 new top-level constant (RIGHT_PAD) + 2 new derived variables in render + 4 changed lines (normX body, tick x formula, orphan barEndX, axis x2).
  </description>
  <success_criteria>
SC1: `RIGHT_PAD` constant (value 48 or similar, ≥ 40) is defined in the layout constants block.
  `grep -c 'RIGHT_PAD' packages/client/src/components/sessions/AgentTimeline.tsx` returns ≥ 1.

SC2: `plotAreaWidth` and `plotRight` derived variables exist inside the component render function.
  `grep -c 'plotAreaWidth' packages/client/src/components/sessions/AgentTimeline.tsx` returns ≥ 2 (definition + use).
  `grep -c 'plotRight' packages/client/src/components/sessions/AgentTimeline.tsx` returns ≥ 2 (definition + use).

SC3: SVG `width` attribute is still `contentWidth` (NOT `contentWidth + RIGHT_PAD` — that was the wrong approach).
  `grep 'width={contentWidth' packages/client/src/components/sessions/AgentTimeline.tsx` returns a line
  that does NOT contain `+ RIGHT_PAD`.

SC4: `normX` uses `plotAreaWidth` as its scaling factor (not `contentBarAreaActual`).
  `grep -A3 'function normX' packages/client/src/components/sessions/AgentTimeline.tsx` must contain `plotAreaWidth`.

SC5: Tick x positions use `frac * plotAreaWidth` formula.
  `grep 'frac \* plotAreaWidth' packages/client/src/components/sessions/AgentTimeline.tsx` returns ≥ 1.

SC6: Orphan `barEndX` uses `plotRight` (not `contentWidth`).
  `grep 'isOrphan.*plotRight\|plotRight.*isOrphan' packages/client/src/components/sessions/AgentTimeline.tsx` returns ≥ 1 line.
  OR: `grep 'barEndX.*plotRight\|plotRight.*barEndX' packages/client/src/components/sessions/AgentTimeline.tsx` returns ≥ 1 line.

SC7: `npm run lint` exits 0 (tsc --noEmit across all three packages).

SC8: Tier-2 e2e spec exists at `packages/client/tests/e2e/p6-t1-timeline-buffer.spec.ts` with:
  (a) Navigation to the Analyze tab for the `gander-p6-moirai-skein-skills` session fixture.
  (b) DOM-geometry assertion using Playwright `boundingBox()`: the final x-axis tick `<text>` element's
      right edge (box.x + box.width) is ≤ the SVG element's right edge (svgBox.x + svgBox.width).
  (c) DOM-geometry assertion using Playwright `boundingBox()`: the rightmost timeline bar rect's right
      edge (box.x + box.width) is < the SVG element's right edge (a strict less-than, verifying a gap).
  (d) Short-session scroll assertion: for a session with few agents / short duration, the
      `agent-timeline-scroller` div's `scrollWidth` does NOT exceed its `clientWidth` (i.e., no
      horizontal scrollbar introduced by the RIGHT_PAD change). This can use a second fixture or
      can verify the property on the existing fixture if it fits without scrolling; document which.
  `ls packages/client/tests/e2e/p6-t1-timeline-buffer.spec.ts` returns the file.
  `grep 'boundingBox' packages/client/tests/e2e/p6-t1-timeline-buffer.spec.ts` returns ≥ 2 lines.
  `grep 'scrollWidth\|clientWidth' packages/client/tests/e2e/p6-t1-timeline-buffer.spec.ts` returns ≥ 1 line.

SC9: No raw hex color values introduced (all colors use `var(--...)` CSS custom property references).
  New lines in `packages/client/src/components/sessions/AgentTimeline.tsx` contain no `#[0-9a-fA-F]{3,6}` patterns.
  </success_criteria>
  <context_files>
    packages/client/src/components/sessions/AgentTimeline.tsx (full file — all geometry is self-contained)
    packages/client/tests/e2e/agent-timeline-zoom.spec.ts (reference for e2e navigation pattern and fixture session id)
  </context_files>
  <dependencies>NONE — this task is independent of p6-t2</dependencies>
  <out_of_scope>
- Do NOT change `svg width={contentWidth}` — the SVG must remain `contentWidth` wide, not `contentWidth + RIGHT_PAD`.
- Do NOT change `contentWidth = Math.max(containerWidth, ...)` — the short-session floor must be preserved byte-identical.
- Do NOT touch SessionListPage.tsx, AgentStatPanel.tsx, AgentStatTable.tsx, or any other file.
- Do NOT add any new tRPC calls or schema changes.
- Do NOT change the zoom controls, zoom constants, or zoom state.
- Do NOT change the horizontal scroller wrapper.
- Do NOT modify the adaptive x-axis unit derivation (deriveUnit / formatOffset).
- Do NOT add Shadcn ui/* primitives or raw hex color values.
- Do NOT git commit — return a completion_packet only.
- Do NOT change tick textAnchor="middle" — the RIGHT_PAD provides sufficient clearance for middle-anchored labels.
  </out_of_scope>
  <estimated_new_lines>~25 net new lines: 1 constant + 2 derived variables in render + 4 changed existing lines in AgentTimeline.tsx + ~70 lines in the new e2e spec</estimated_new_lines>
  <output_expected>
    <tag>completion_packet</tag>
    <must_contain>
      <item>confirmation that RIGHT_PAD constant was added with its value</item>
      <item>confirmation that plotAreaWidth and plotRight derived variables were added in the render</item>
      <item>confirmation that SVG width={contentWidth} is UNCHANGED (not contentWidth + RIGHT_PAD)</item>
      <item>confirmation that normX now scales by plotAreaWidth</item>
      <item>confirmation that orphan barEndX now uses plotRight</item>
      <item>confirmation that axis baseline x2 now uses plotRight</item>
      <item>path to the new e2e spec: packages/client/tests/e2e/p6-t1-timeline-buffer.spec.ts</item>
      <item>confirmation that boundingBox() assertions are present in the e2e spec</item>
      <item>confirmation that short-session scrollWidth guard is present in the e2e spec</item>
      <item>npm run lint exit code (must be 0)</item>
    </must_contain>
    <must_not_contain>
      <item>SVG width = contentWidth + RIGHT_PAD (this is the wrong geometry — do not use)</item>
      <item>raw hex color values</item>
      <item>changes to normX scaling to use contentBarAreaActual (must use plotAreaWidth)</item>
      <item>any Shadcn ui/* imports</item>
      <item>git commit sha (agent must not commit)</item>
    </must_not_contain>
    <success_signal>lint passing + new e2e spec present with boundingBox() and scrollWidth assertions + diff shows AgentTimeline.tsx uses plotAreaWidth/plotRight + SVG width line unchanged + completion_packet returned (no commit)</success_signal>
  </output_expected>
</task_packet>

<task_packet>
  <task_id>p6-t2-agent-grouping</task_id>
  <assigned_to>FE</assigned_to>
  <priority>HIGH</priority>
  <description>
Group agent iterations (AR#0, AR#1, AR#2) into a single base-code card ("AR") in the Sessions
overview aggregate panel. Display-only grouping on the client side; server aggregate-stats.ts and
all tRPC procedures are unchanged.

**Files to create/modify:**

**NEW: `packages/client/src/utils/group-agents.ts`**
A pure utility module exporting one function:

```typescript
import type { AgentActivity } from '@gander-studio/shared';

/**
 * Group AgentActivity records by base agent code.
 * "AR#0", "AR#1", "AR#2" => "AR" with summed numeric fields.
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
      map.set(baseCode, {
        agent_id: baseCode,
        spawns: agent.spawns,
        completes: agent.completes,
        feedback_loops: agent.feedback_loops,
        critique_passes: agent.critique_passes,
        critique_blocks: agent.critique_blocks,
        audit_passes: agent.audit_passes,
        audit_fails: agent.audit_fails,
        wall_clock_ms: agent.wall_clock_ms,
      });
    } else {
      existing.spawns          += agent.spawns;
      existing.completes       += agent.completes;
      existing.feedback_loops  += agent.feedback_loops;
      existing.critique_passes += agent.critique_passes;
      existing.critique_blocks += agent.critique_blocks;
      existing.audit_passes    += agent.audit_passes;
      existing.audit_fails     += agent.audit_fails;
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

**NEW: `packages/client/src/utils/group-agents.test.ts`** (Vitest — see devDep setup below)

Test cases MUST cover:
1. Empty array returns []
2. Single agent with no '#' returns [{ agent_id: "AR", spawns: N, ... }]
3. Three agents AR#0/AR#1/AR#2 returns [{ agent_id: "AR", spawns: sum, ... }]
4. wall_clock_ms: all undefined → grouped result wall_clock_ms is undefined
5. wall_clock_ms: one undefined + two defined → grouped result equals sum of the two defined values only (not the undefined contributor)
6. Two different base codes (AR#0, PM#0) → returns two entries, sorted alphabetically (AR before PM)
7. Mixed: AR#0 + AR#1 + PM#0 → AR has sum of AR#0+AR#1; PM has PM#0's values

**Vitest devDependency setup (packages/client):**
- Add to `packages/client/package.json` devDependencies: `"vitest": "^4"` (NOT "^1.6.0" — must match the monorepo server's vitest@^4.1.7 to avoid workspace peer collisions).
- Create `packages/client/vitest.config.ts`:
  ```typescript
  import { defineConfig } from 'vitest/config';
  export default defineConfig({
    test: {
      environment: 'node',
    },
  });
  ```
- Add to `packages/client/package.json` scripts: `"test": "vitest run"`
- Run `npm install` to hoist vitest@4 into the workspace.
- After setup, `npm test -w @gander-studio/client` must exit 0 with all 7 test cases passing.

**MODIFY: `packages/client/src/pages/sessions/SessionListPage.tsx`**
Import `groupAgentsByBaseCode` and apply it before the map in `AggregatePanel`.

Add import (near top of file):
```typescript
import { groupAgentsByBaseCode } from '../../utils/group-agents';
```

Inside `AggregatePanel`, before the JSX return (or inline), derive:
```typescript
const groupedAgents = groupAgentsByBaseCode(stats.agents);
```

Replace both uses of `stats.agents` in the AggregatePanel render:
- The panel grid map: `{groupedAgents.map((activity) => <AgentStatPanel ... />)}`
- The table: `<AgentStatTable activities={groupedAgents} ...  />`
- The length guard: `{groupedAgents.length > 0 && ...}`

**NEW: Tier-2 e2e spec — `packages/client/tests/e2e/p6-t2-agent-grouping.spec.ts`**

The spec MUST be roster-agnostic (no hardcoded base codes like "AR"). It must:

1. Navigate to the Sessions list page and select all sessions (default state).
2. Wait for the `aggregate-stats-panel` to be visible.
3. Fetch the live aggregateStats data via the tRPC response (or read the rendered DOM) to derive
   which base codes exist and which appear ≥2 times in the source agent list. Do NOT hardcode "AR".
4. Assert: NO rendered agent label in the aggregate panel matches the pattern `/#\d+$/`
   (no per-instance suffixes like "#0", "#1" visible to the user).
   Implementation: `page.locator('[data-testid="aggregate-stats-panel"]').getByText(/#\d+/)` must have count 0.
5. Assert: the count of visible agent card/row entries in the aggregate panel equals the count of
   DISTINCT base codes in the source data (i.e. one entry per base code, not per agent_id).
   The "source data" can be derived from the page itself — e.g., by counting unique values of
   text content in agent-id label elements vs. total entries before grouping (exposed in the
   aggregateStats tRPC response if accessible) — or simply by verifying that the rendered count
   is strictly less than what the raw stats would show (if at least one fold occurred).
6. Assert: at least one base code in the rendered panel was folded from ≥2 original instances.
   The spec must FAIL loudly (not pass vacuously) if no folding occurred. Approach: intercept the
   `session.getStats` tRPC response, count how many agent_ids in `agents[]` have a `#` suffix, and
   assert that count > rendered panel entry count (proving at least one fold). If no `#`-suffixed
   agents exist in the fixture, skip with `test.fail()` and a message "fixture lacks multi-iteration agents".

**Optional design decision — instance count badge:**
Do NOT implement "AR ×3" badge. Deferred to future sprint. Surface as a future enhancement note
in the completion_packet. Adding the badge would require modifying AgentStatPanel's interface,
which is out of scope.
  </description>
  <success_criteria>
SC1: `packages/client/src/utils/group-agents.ts` exists.
  `ls packages/client/src/utils/group-agents.ts` exits 0.

SC2: The file exports `groupAgentsByBaseCode` function.
  `grep 'export function groupAgentsByBaseCode' packages/client/src/utils/group-agents.ts` returns 1 line.

SC3: The function uses `agent_id.split('#')[0]` for base code extraction.
  `grep "split('#')" packages/client/src/utils/group-agents.ts` returns ≥ 1 line.

SC4: `packages/client/package.json` devDependencies includes vitest at `^4` (NOT ^1.x).
  `grep '"vitest"' packages/client/package.json` returns a line containing `^4`.

SC5: `packages/client/vitest.config.ts` exists with `environment: 'node'`.
  `grep 'node' packages/client/vitest.config.ts` returns ≥ 1 line.

SC6: Vitest unit test file exists at `packages/client/src/utils/group-agents.test.ts`.
  `ls packages/client/src/utils/group-agents.test.ts` exits 0.

SC7: All 7 unit test cases pass: `npm test -w @gander-studio/client` exits 0.
  (Auditor must run this command and confirm all 7 tests pass.)

SC8: `SessionListPage.tsx` imports `groupAgentsByBaseCode` from the new util.
  `grep 'groupAgentsByBaseCode' packages/client/src/pages/sessions/SessionListPage.tsx` returns ≥ 1 line.

SC9: Both `AgentStatPanel` map and `AgentStatTable` use `groupedAgents` (not `stats.agents`).
  `grep 'groupedAgents' packages/client/src/pages/sessions/SessionListPage.tsx` returns ≥ 2 lines.

SC10: `npm run lint` exits 0.

SC11: Tier-2 e2e spec exists at `packages/client/tests/e2e/p6-t2-agent-grouping.spec.ts`.
  `ls packages/client/tests/e2e/p6-t2-agent-grouping.spec.ts` exits 0.

SC12: The e2e spec is roster-agnostic — no hardcoded base code strings used in presence/absence assertions.
  `grep -c '"AR"' packages/client/tests/e2e/p6-t2-agent-grouping.spec.ts` returns 0.
  `grep -c "'AR'" packages/client/tests/e2e/p6-t2-agent-grouping.spec.ts` returns 0.
  (The spec must derive expected codes from the live response, not from literal string constants.)

SC13: The e2e spec asserts that NO rendered label in the aggregate panel matches `/#\d+$/`.
  `grep '#\\\\d' packages/client/tests/e2e/p6-t2-agent-grouping.spec.ts` returns ≥ 1 line.
  OR `grep '/#' packages/client/tests/e2e/p6-t2-agent-grouping.spec.ts` returns ≥ 1 line.

SC14: AgentStatPanel.tsx and AgentStatTable.tsx are NOT modified.
  `git diff HEAD -- packages/client/src/components/sessions/AgentStatPanel.tsx` returns empty.
  `git diff HEAD -- packages/client/src/components/sessions/AgentStatTable.tsx` returns empty.

SC15: No Shadcn ui/* imports added, no raw hex values.
  `grep "from '@/components/ui" packages/client/src/utils/group-agents.ts` returns 0.
  `grep -E '#[0-9a-fA-F]{3,6}' packages/client/src/utils/group-agents.ts` returns 0.
  </success_criteria>
  <context_files>
    packages/client/src/pages/sessions/SessionListPage.tsx (lines 1-50 for imports; lines 395-430 for AggregatePanel render site)
    packages/client/src/components/sessions/AgentStatPanel.tsx (lines 35-112 — component interface and agent_id render site)
    packages/client/src/components/sessions/AgentStatTable.tsx (lines 1-55 — interface)
    packages/shared/src/schemas.ts (lines 68-80 — AgentActivity schema)
    packages/server/src/parsers/aggregate-stats.ts (reference only for wall_clock_ms semantics — do not modify)
    packages/client/tests/e2e/overview-aggregate.spec.ts (reference for navigation pattern and tRPC interception pattern)
    packages/client/package.json (to confirm current devDependencies before adding vitest)
    packages/server/package.json (reference for vitest@^4.1.7 — confirms correct version range)
  </context_files>
  <dependencies>NONE — this task is independent of p6-t1</dependencies>
  <out_of_scope>
- Do NOT modify AgentStatPanel.tsx, AgentStatTable.tsx, or any component file.
- Do NOT modify any server files (aggregate-stats.ts, router.ts, schemas.ts).
- Do NOT add any tRPC procedure or modify the AgentActivity Zod schema.
- Do NOT implement the "AR x3" instance-count badge — deferred to future sprint.
- Do NOT touch the per-session Analyze tab, AgentTimeline, or analyzeStore.
- Do NOT modify session.getStats or any backend aggregation.
- Do NOT git commit.
- Do NOT use vitest@^1.x — must be ^4 to match monorepo server version.
- AgentStatPanel and AgentStatTable already accept AgentActivity[] — do not change their props interfaces.
  </out_of_scope>
  <estimated_new_lines>~90 net new lines: ~45 in group-agents.ts, ~55 in group-agents.test.ts, ~12 in vitest.config.ts + package.json changes, ~45 in e2e spec, ~5 changed in SessionListPage.tsx</estimated_new_lines>
  <output_expected>
    <tag>completion_packet</tag>
    <must_contain>
      <item>path to new util: packages/client/src/utils/group-agents.ts</item>
      <item>path to new unit test: packages/client/src/utils/group-agents.test.ts</item>
      <item>confirmation vitest@^4 added to packages/client/package.json devDependencies</item>
      <item>confirmation npm test -w @gander-studio/client exits 0 with 7 tests passing</item>
      <item>confirmation SessionListPage.tsx maps over groupedAgents for both panel grid and AgentStatTable</item>
      <item>path to new e2e spec: packages/client/tests/e2e/p6-t2-agent-grouping.spec.ts</item>
      <item>confirmation e2e spec is roster-agnostic (no hardcoded "AR" string in assertions)</item>
      <item>npm run lint exit code (must be 0)</item>
      <item>note on instance-count badge: deferred, not implemented</item>
    </must_contain>
    <must_not_contain>
      <item>modifications to AgentStatPanel.tsx or AgentStatTable.tsx</item>
      <item>any tRPC or server file modifications</item>
      <item>vitest version ^1.x in package.json</item>
      <item>hardcoded base code strings ("AR", "PM", etc.) in the e2e assertion logic</item>
      <item>raw hex color values</item>
      <item>git commit sha</item>
    </must_not_contain>
    <success_signal>lint passing + npm test -w @gander-studio/client passing (7 tests) + new util + new unit test + new e2e spec all present + SessionListPage.tsx grouping confirmed + vitest@^4 in package.json + completion_packet returned (no commit)</success_signal>
  </output_expected>
</task_packet>

  </task_packets>

  <dependency_order>
    p6-t1-timeline-buffer and p6-t2-agent-grouping are PARALLEL — no dependency between them.
    They touch disjoint files:
      t1 touches: AgentTimeline.tsx (modified), packages/client/tests/e2e/p6-t1-timeline-buffer.spec.ts (new)
      t2 touches: SessionListPage.tsx (modified), group-agents.ts (new), group-agents.test.ts (new), vitest.config.ts (new), package.json (devDep + script), packages/client/tests/e2e/p6-t2-agent-grouping.spec.ts (new)
    No shared files. Both dispatch in the same wave.
  </dependency_order>

  <routing_notes>
    - DESIGN.md absent at packages/client/ — FE agents operate on inferred tokens (CSS custom properties in globals.css). Neither task introduces new color tokens; existing var(--...) references apply.
    - GEOMETRY_FIX_SUMMARY (t1): The correct approach is svg width = contentWidth (UNCHANGED), with plotAreaWidth = contentBarAreaActual - RIGHT_PAD folded inside. This preserves the short-session floor. The rev0 approach of svg width = contentWidth + RIGHT_PAD was the BLOCKER — do not reintroduce it.
    - t1 e2e: must use Playwright boundingBox() for DOM-geometry assertions (label right edge ≤ SVG right edge, bar right edge < SVG right edge). Must also include scrollWidth ≤ clientWidth assertion for a short session. No arithmetic proxy (svgWidth > scrollerWidth) as that codified the wrong behavior.
    - t2 e2e: must be roster-agnostic. Spec must derive expected grouping from the live tRPC response (intercept session.getStats), NOT from hardcoded base code strings. The "AR" string must not appear in any assertion in the spec.
    - t2 vitest version: MUST be ^4 (not ^1.6.0 from rev0 — that was a version-collision risk). The server's package.json pins vitest@^4.1.7; using ^4 in the client resolves to the same hoisted v4 binary.
    - vitest environment: node (pure function, no DOM, no jsdom needed).
    - Both tasks must NOT git commit — implementing agents return completion_packets; orchestrator commits post-audit.
    - e2e specs: confirm dev server is live before dispatching e2e audits (env-preflight per s3 §6 G2).
    - append_serialization: no shared append-target files in this sprint (no changelog appends).
    - proposed_rename: none — all human phrases retained verbatim.
    - recurring_pattern declarations:
      &lt;recurring_pattern source="prog-studio-sessions-2026-05-s3-analyze.md"&gt;G1 — plan-time fact checks verify type not value&lt;/recurring_pattern&gt; AVOIDED: PM read AgentTimeline.tsx source lines directly before writing geometry spec.
      &lt;recurring_pattern source="prog-studio-sessions-2026-05-s3-analyze.md"&gt;G2 — Tier-2 specs authored but not executed&lt;/recurring_pattern&gt; MITIGATED: both tasks ship e2e specs with explicit execution gate.
      &lt;recurring_pattern source="prog-studio-sessions-2026-05-s2-list-edit.md"&gt;G5 — e2e tests coupled to incidental DOM state&lt;/recurring_pattern&gt; MITIGATED: t2 spec is roster-agnostic, derives expected state from live tRPC response.
      &lt;recurring_pattern source="gander-studio-p2-agent-cards"&gt;OVERSCOPED — multi-file bundle in single FE task&lt;/recurring_pattern&gt; AVOIDED: t1 = 1 modified + 1 new. t2 = 1 modified + 4 new. All disjoint.
  </routing_notes>

  <risk_flags>
    - DESIGN.md absent at packages/client/ — both tasks introduce no new color tokens; risk is low.
    - t1 geometry correctness: the plotAreaWidth approach preserves zoom math because normX now uses plotAreaWidth as the scaling factor. The contentBarAreaActual variable is still needed for the plotAreaWidth derivation. Auditor should verify the zoom-in path (zoomLevel > 1) still works correctly end-to-end.
    - t2 vitest@^4 workspace hoisting: if the server devDependency is hoisted and the client pins ^4, npm should resolve to one v4 binary. If the workspace root does not hoist vitest (because it's only in server/), the client's own install will bring in v4 directly. Either path is correct. Auditor should confirm npm install completes without peer-dep warnings after t2 is applied.
    - t2 e2e roster-agnostic spec: the spec must use tRPC response interception (page.route or page.on('response')) to read the raw agents array and derive expected counts. This is the established pattern from overview-aggregate.spec.ts. If that pattern uses a different interception mechanism, FE should follow the existing convention.
    - gander-p6-moirai-skein-skills fixture: both e2e specs use this fixture. The slug-mismatch bug is confirmed fixed (ace3e34). Confirm dev server serves correct data before e2e audit.
    - instance-count badge ("AR x3"): explicitly deferred. Not in scope for this sprint. Future sprint may revisit once grouping is stable.
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

## Locked-Value SC Satisfiability Self-Lint (Step 7.5)

Checked all SCs with locked values:
- t1 SC3: asserts SVG width is `contentWidth` without `+ RIGHT_PAD`. The locked geometry keeps svg width = contentWidth. SC3 is satisfiable: `grep 'width={contentWidth' ...` must NOT contain `+ RIGHT_PAD` — this is satisfied when the agent writes `width={contentWidth}` unchanged.
- t2 SC4: asserts `"vitest": "^4"` in package.json. The locked value is the string `^4`. SC4 greps for `^4` — satisfiable.
- t2 SC12: asserts `"AR"` does NOT appear in the e2e spec (count 0). The locked behavior is roster-agnostic assertions. SC12 is satisfiable when the agent writes no hardcoded "AR" strings.
- No SCs contain angle-brace characters in locked values. No SCs verify a field count that would be wrong against a verbatim schema. No unsatisfiable SCs found.

---

## Expectation Manifest

```xml
<expectation_manifest>
  <sprint_id>gander-studio-p6-overview-polish</sprint_id>
  <generated>2026-05-28T08:46:00Z</generated>
  <revision>rev1</revision>
  <assignments>
    <assignment>
      <task_id>p6-t1-timeline-buffer</task_id>
      <agent>FE#1</agent>
      <expected_tag>completion_packet</expected_tag>
      <expected_file>.claude/agents/tasks/outputs/p6-t1-timeline-buffer-FE-*.md</expected_file>
      <blocks>NONE</blocks>
      <receipt_check>
        <item>RIGHT_PAD constant defined (value stated, must be >= 40)</item>
        <item>plotAreaWidth and plotRight derived variables added in render (confirmed)</item>
        <item>SVG width={contentWidth} is UNCHANGED — not contentWidth + RIGHT_PAD (confirmed)</item>
        <item>normX uses plotAreaWidth as scaling factor (not contentBarAreaActual)</item>
        <item>orphan barEndX uses plotRight (not contentWidth)</item>
        <item>axis baseline x2 uses plotRight</item>
        <item>e2e spec path confirmed: packages/client/tests/e2e/p6-t1-timeline-buffer.spec.ts</item>
        <item>e2e spec contains boundingBox() assertions (>= 2 uses)</item>
        <item>e2e spec contains scrollWidth / clientWidth assertion for short-session guard</item>
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
        <item>packages/client/src/utils/group-agents.test.ts exists (confirmed)</item>
        <item>vitest@^4 present in packages/client/package.json devDependencies (NOT ^1.x)</item>
        <item>packages/client/vitest.config.ts exists with environment: node</item>
        <item>npm test -w @gander-studio/client exits 0, all 7 unit test cases pass (confirmed)</item>
        <item>SessionListPage.tsx uses groupedAgents in both panel grid and AgentStatTable (confirmed)</item>
        <item>AgentStatPanel.tsx and AgentStatTable.tsx NOT modified (git diff empty confirmed)</item>
        <item>e2e spec path confirmed: packages/client/tests/e2e/p6-t2-agent-grouping.spec.ts</item>
        <item>e2e spec has no hardcoded "AR" string in assertions (roster-agnostic confirmed)</item>
        <item>e2e spec asserts no /#\d+$/ labels in aggregate panel (confirmed)</item>
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
Task_packet count in file: 2 (both `<task_packet>` blocks present inline above).
Match: YES. No stubs.

## Stage 3 — COMPLETE
ts: 2026-05-28T08:46:00Z
output_files:
  - .claude/agents/tasks/outputs/gander-studio-p6-overview-polish-PM-rev1-1780011957.md
