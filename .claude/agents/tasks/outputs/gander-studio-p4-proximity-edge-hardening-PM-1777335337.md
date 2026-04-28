# Task Decomposition — gander-studio-p4-proximity-edge-hardening

**PM:** PM#1
**Generated:** 2026-04-27T00:25:00Z
**Sprint:** gander-studio-p4-proximity-edge-hardening

---

## Source Verification Notes (pre-flight reads)

Before writing any task packet, the PM read the following files and confirmed the following facts:

**materia-canvas.spec.ts** (packages/client/src/tests/compose/materia-canvas.spec.ts)
- Line 100-103: `if (!(await agentItem.isVisible())) { test.skip(...); return; }` — silent skip confirmed (A1 target)
- Lines 119-125, 156-159, 172-176: `if (!agentVisible) { ... return; }` — silent-skip fallback pattern confirmed (A1 target)
- Line 185: `expect(postDragEdgeCount).toBeGreaterThanOrEqual(0)` — tautology confirmed (A2 target)
- No agent↔skill proximity test exists; only orchestrator↔agent (A3 gap confirmed)
- No link-sound spy test exists (A4 gap confirmed)

**MateriaNode.tsx** (packages/client/src/components/compose/MateriaNode.tsx)
- Lines 42-55: `HANDLE_STYLE` object — 9-property invisible-handle CSS constant confirmed (A5 target)

**CardNode.tsx** (packages/client/src/components/compose/CardNode.tsx)
- Lines 17-27: `CARD_HANDLE_STYLE` object — byte-identical 9-property invisible-handle CSS constant confirmed (A5 target)

**constants/compose.ts** (packages/client/src/constants/compose.ts)
- Line 8: `META_AGENTS as COMMAND_AGENTS` import
- Line 12: `META_AGENTS` un-aliased import — **same exported set**
- Line 75: `if (COMMAND_AGENTS.has(lower)) return 'var(--my)'` — intercepts all META_AGENTS members
- Line 79: `if (META_AGENTS.has(lower)) return 'var(--mp)'` — DEAD BRANCH, unreachable (A6 target)
- File path correction: the brief references `packages/client/src/lib/loadout/compose.ts` — **this path does not exist**. The actual file is `packages/client/src/constants/compose.ts`.

**MateriaCanvas.tsx** (packages/client/src/components/compose/MateriaCanvas.tsx)
- `MateriaPalette` sub-component (not a separate file — it lives in MateriaCanvas.tsx)
- Line 593 (`buildPaletteItemStyle`): `getMateriaColor(type === 'agent' ? 'frontend-engineer' : 'skill', type)` — 2-arg call; role is optional so no TS error, but advisory A7 asks to pass the appropriate role.
- File path correction: the brief references `packages/client/src/components/compose/MateriaPalette.tsx` — **this file does not exist**. The palette sub-component lives inside MateriaCanvas.tsx.
- `addEdgeWithEffects` (line 746-759): calls `playLink()` at line 751 — `playLink` is imported from `../../hooks/useLinkSound`. A4 link-sound spy must work around the module-level function (not a React ref, not injected). Playwright cannot spy on bundled module functions at the E2E layer directly. A4 implementation note: the FE agent must use `page.exposeFunction` + `page.addInitScript` to intercept the AudioContext or document a manual-verification approach. See constraint notes in FE-001 task packet below.

**useLinkSound.ts** (packages/client/src/hooks/useLinkSound.ts)
- `playLink()` is a module-level function, not injectable at test boundary without module mock. E2E spy requires a test-harness shim at the window level.

---

```xml
<task_decomposition task_id="gander-studio-p4-proximity-edge-hardening" agent_count="2">
  <task_packets>

    <task_packet>
      <task_id>gander-studio-p4-proximity-edge-hardening-FE-001</task_id>
      <assigned_to>Frontend Engineer</assigned_to>
      <priority>HIGH</priority>
      <description>
Harden the Playwright spec file `packages/client/src/tests/compose/materia-canvas.spec.ts` to address auditor advisories A1, A2, A3, and A4. This is a test-file-only task — no production source files are modified.

**A1 — Replace silent-skip fallbacks with hard waits (3 locations)**

Current pattern (lines 100-103, 119-125, 156-159, 172-176):
```
if (!(await agentItem.isVisible())) {
  test.skip(/* ... */);
  return;
}
// or:
const agentVisible = await agentNode.isVisible().catch(() => false);
if (!agentVisible) {
  // ... return early silently
  return;
}
```

Replace ALL silent-skip/early-return patterns with:
```
await palette.locator('[data-testid^="palette-item-agent-"]').first()
  .waitFor({ state: 'visible', timeout: 5000 });
```

Rationale: silent skips mask regressions in slow CI. If the palette doesn't render an agent, the test must FAIL loudly with a timeout error, not silently pass.

Specific sites to replace (read the current file before editing — verify line numbers against the as-committed content from commit edf6621):
1. Lines 99-103: the `if (!(await agentItem.isVisible())) { test.skip(...); return; }` block inside the "orchestrator↔agent proximity drop" test
2. Lines 119-125: the `agentVisible` early-return block inside the same test
3. Lines 155-159: the `if (!(await agentItem.isVisible())) { ... return; }` block inside the "DOM edge count matches store edges" test
4. Lines 172-176: the `if (!(await agentNode.isVisible()...)) { ... return; }` block inside the same test

After replacement, in the test body, the flow is:
- `await palette.locator('[data-testid^="palette-item-agent-"]').first().waitFor({ state: 'visible', timeout: 5000 });`
- Then proceed with dragTo and subsequent assertions (no more conditional branches for "agent not visible").

**A2 — Replace tautology assertion (line ~185)**

Current:
```ts
expect(postDragEdgeCount).toBeGreaterThanOrEqual(0);
```

Replace with:
```ts
expect(postDragEdgeCount).toBe(initialEdgeCount + 1);
```

Where `initialEdgeCount` is already captured earlier in the same test (line ~147: `const initialEdgeCount = await page.locator('.react-flow__edge').count();`). The existing assertion at line 149 (`expect(initialEdgeCount).toBe(0)`) remains unchanged.

After this change, the conditional block `if (postDragEdgeCount > 0) { ... }` (lines 187-194) must be updated to unconditional — since we now assert exactly 1 edge, the `data-id` assertion can be made unconditional:
```ts
expect(postDragEdgeCount).toBe(initialEdgeCount + 1);
const firstEdge = page.locator('.react-flow__edge').first();
await expect(firstEdge).toBeAttached();
const dataId = await firstEdge.getAttribute('data-id');
expect(dataId).toBeTruthy();
```

**A3 — Add agent↔skill proximity test**

Add a new test to the `'Proximity edge DOM rendering (FE-001 regression fix)'` describe block. This test mirrors the existing "orchestrator↔agent proximity drop" test but drops a skill palette item and drags it onto an existing agent node (not the orchestrator card).

Test structure:
```ts
test('agent↔skill proximity drop renders a .react-flow__edge element', async ({ page }) => {
  await gotoCompose(page);
  await expect(page.locator('.react-flow__edges')).toBeAttached();

  const palette = page.locator('[data-testid="materia-palette"]');
  // Step 1: Drop an agent onto the canvas first
  await palette.locator('[data-testid^="palette-item-agent-"]').first()
    .waitFor({ state: 'visible', timeout: 5000 });
  const agentItem = palette.locator('[data-testid^="palette-item-agent-"]').first();
  const canvasEl = page.locator('[data-testid="materia-canvas"]');
  const canvasBox = await canvasEl.boundingBox();
  if (!canvasBox) throw new Error('canvas bounding box not found');

  await agentItem.dragTo(canvasEl, {
    targetPosition: { x: canvasBox.width / 2 - 80, y: canvasBox.height / 2 },
  });
  await page.waitForTimeout(300);

  const agentNode = page.locator('[data-testid^="materia-node-"]').first();
  await agentNode.waitFor({ state: 'visible', timeout: 5000 });

  // Step 2: Drop a skill palette item onto the canvas at a different position
  await palette.locator('[data-testid^="palette-item-skill-"]').first()
    .waitFor({ state: 'visible', timeout: 5000 });
  const skillItem = palette.locator('[data-testid^="palette-item-skill-"]').first();
  await skillItem.dragTo(canvasEl, {
    targetPosition: { x: canvasBox.width / 2 + 80, y: canvasBox.height / 2 },
  });
  await page.waitForTimeout(300);

  // Step 3: Drag the skill node onto the agent node center
  await canvasEl.click({ position: { x: 10, y: 10 } }); // unlock AudioContext
  await dragNodeOntoTarget(
    page,
    '[data-testid^="materia-node-"][data-testid$="-skill-"]', // skill selector (name will vary)
    agentNode,  // use the agent node locator
  );
  await page.waitForTimeout(400);

  // Assert: at least one .react-flow__edge in DOM
  const edgeCount = await page.locator('.react-flow__edge').count();
  expect(edgeCount).toBeGreaterThan(0);
});
```

IMPORTANT IMPLEMENTATION NOTE: Palette items for skills use `data-testid="palette-item-{skill-name}"`, not `palette-item-skill-{name}`. Skills are stored in `availableSkills` and rendered with `item.type === 'skill'` but the testid is `palette-item-${item.name}` — not type-prefixed. So `[data-testid^="palette-item-skill-"]` will NOT match. Use `palette.locator('[data-testid^="palette-item-"]').filter({ hasText: /./}).nth(N)` where N selects from the Skills section, OR use the Agents section heading as a landmark and locator from there, OR inspect the Skills section DOM structure.

The safest selector: read the actual `data-testid` pattern from `MateriaCanvas.tsx` line 622: `data-testid={\`palette-item-${item.name}\`}` — the testid is `palette-item-{name}` with no type prefix. Agents come first, then skills. After dropping the first agent item, the second group of items in the palette (under the "Skills" heading) are skills. Use:
```ts
// After agent section, select first skill item by position in DOM
const skillSection = palette.locator('h3').filter({ hasText: /^Skills$/i });
const firstSkillItem = skillSection.locator('..').locator('[data-testid^="palette-item-"]').first();
```
Or use `nth()` to select past the agent count. The FE agent must read the current palette DOM structure and choose a robust selector that doesn't hardcode agent count.

If no skill items exist in the palette (empty GANDER_ROOT), use `waitFor({ state: 'visible', timeout: 5000 })` on the skill item — this will fail loudly per A1 philosophy.

For the `dragNodeOntoTarget` call in A3: the skill node's `data-testid` will be `materia-node-{skill-name}` where skill-name is the actual skill file name. Since we don't know the name at test-write time, use `[data-testid^="materia-node-"]` and exclude the already-placed agent node by using `.nth(1)` if two nodes exist (the first materia-node is the agent, the second is the skill). Or filter by excluding the known agent testid. Read the test carefully and choose a robust strategy.

**A4 — Link sound spy + DOM edge assertion**

Add a test to the `'Proximity edge DOM rendering (FE-001 regression fix)'` describe block.

**Playwright E2E constraint:** `playLink` is a module-level function bundled into the Vite output. Playwright E2E tests cannot directly spy on bundled module functions. The recommended approach is:

Option A (preferred): Use `page.addInitScript` to replace `window.AudioContext` with a spy before page load, then assert the AudioContext was constructed and `createOscillator` was called (indirectly verifying `playLink` fired). However this is fragile and complex.

Option B (document as manual): Write the test to assert the DOM edge was created (primary effect), and add a descriptive comment that the link sound was verified manually against the browser, with a note that a unit-test spy would require a Vitest/module-mock harness not yet present.

Option C (count-based proxy): Use the existing edge DOM assertion as the primary signal, and spy on `playLink` calls by overriding it at the window level via `page.addInitScript`:
```ts
await page.addInitScript(() => {
  window.__playLinkCallCount = 0;
  // We can't intercept the bundled module, but we can check if AudioContext was used
  // via a proxy on AudioContext.prototype.createOscillator.
  const origCreateOscillator = AudioContext.prototype.createOscillator;
  AudioContext.prototype.createOscillator = function(...args) {
    window.__playLinkCallCount = (window.__playLinkCallCount || 0) + 1;
    return origCreateOscillator.apply(this, args);
  };
});
```
Then after the drag: `const oscCallCount = await page.evaluate(() => window.__playLinkCallCount ?? 0);`
Note: `playLink` creates 2 oscillators per call. So after one edge creation: `expect(oscCallCount).toBeGreaterThanOrEqual(2)`.

**MANDATORY per post-mortem G6:** The sound assertion MUST be paired with the DOM edge assertion. The test structure must be:
1. Primary assertion: `expect(edgeCount).toBe(1)` (DOM edge element exists)
2. Secondary assertion: link-sound fired (via whichever spy approach the FE agent chooses)

Do NOT write a test that ONLY asserts on sound — the DOM edge assertion is the primary success signal.

Test skeleton:
```ts
test('edge creation fires link sound and renders DOM edge element', async ({ page }) => {
  // Set up spy BEFORE navigation
  await page.addInitScript(() => {
    // Proxy AudioContext.prototype.createOscillator to count calls
    const origCreate = AudioContext.prototype.createOscillator;
    (window as any).__oscCreateCount = 0;
    AudioContext.prototype.createOscillator = function(...args: any[]) {
      (window as any).__oscCreateCount = ((window as any).__oscCreateCount || 0) + 1;
      return origCreate.apply(this, args as []);
    };
  });

  await gotoCompose(page);

  // Set up: drop an agent and drag it onto orchestrator to trigger one edge + one playLink()
  const palette = page.locator('[data-testid="materia-palette"]');
  await palette.locator('[data-testid^="palette-item-agent-"]').first()
    .waitFor({ state: 'visible', timeout: 5000 });
  const canvasEl = page.locator('[data-testid="materia-canvas"]');
  const canvasBox = await canvasEl.boundingBox();
  if (!canvasBox) throw new Error('canvas bounding box not found');

  await palette.locator('[data-testid^="palette-item-agent-"]').first().dragTo(canvasEl, {
    targetPosition: { x: canvasBox.width / 2, y: canvasBox.height / 2 },
  });
  await page.waitForTimeout(300);
  await page.locator('[data-testid^="materia-node-"]').first()
    .waitFor({ state: 'visible', timeout: 5000 });

  await canvasEl.click({ position: { x: 10, y: 10 } }); // unlock AudioContext
  await dragNodeOntoTarget(page, '[data-testid^="materia-node-"]', '[data-testid="card-node"]');
  await page.waitForTimeout(400);

  // PRIMARY ASSERTION — DOM edge element (G6: must be present, not sound-only)
  const edgeCount = await page.locator('.react-flow__edge').count();
  expect(edgeCount).toBe(1);

  // SECONDARY ASSERTION — link sound fired (playLink creates 2 oscillators per call)
  // At least 2 oscillators created means playLink was invoked at least once.
  const oscCount = await page.evaluate(() => (window as any).__oscCreateCount ?? 0);
  expect(oscCount).toBeGreaterThanOrEqual(2);
});
```

Note on TypeScript: `(window as any).__oscCreateCount` in the `evaluate` callback — this is an approved exception per the project's `any` rule (external data shape at test boundary). Add `// eslint-disable` comment is not needed (no eslint configured); just add `// approved: any — window-level spy counter from addInitScript` comment at the evaluate line.

Note on A4 testid selector: since A1 has already replaced the silent-skip with hard `waitFor`, the A4 test can reuse the same hard-wait pattern without conditional branches.
      </description>
      <success_criteria>
1. `packages/client/src/tests/compose/materia-canvas.spec.ts` contains zero `test.skip` calls and zero `if (!...isVisible()) { ... return; }` early-return patterns in the proximity describe block.
2. Line that previously read `expect(postDragEdgeCount).toBeGreaterThanOrEqual(0)` now reads `expect(postDragEdgeCount).toBe(initialEdgeCount + 1)`.
3. A new test titled "agent↔skill proximity drop renders a .react-flow__edge element" exists in the proximity describe block.
4. A new test titled "edge creation fires link sound and renders DOM edge element" (or similar) exists, containing BOTH a DOM edge assertion and an audio-spy assertion. The DOM edge assertion appears BEFORE the audio assertion (primary effect first, per G6).
5. `tsc --noEmit --project packages/client/tsconfig.json` exits 0.
6. `npx playwright test` run from `packages/client` exits 0 (all tests pass — no new failures, no regressions in the 7 existing tests).
7. No changes to any file outside `packages/client/src/tests/compose/materia-canvas.spec.ts`.
      </success_criteria>
      <context_files>
        packages/client/src/tests/compose/materia-canvas.spec.ts
        packages/client/src/components/compose/MateriaCanvas.tsx
        packages/client/src/hooks/useLinkSound.ts
      </context_files>
      <dependencies>NONE — parallel with FE-002</dependencies>
      <out_of_scope>
- Do NOT modify MateriaNode.tsx, CardNode.tsx, MateriaCanvas.tsx, or any production source file.
- Do NOT create new test files — all changes go into the existing materia-canvas.spec.ts.
- Do NOT add `test.skip` for any reason — the whole point of A1 is to remove them.
- Do NOT write a test that asserts ONLY on audio (link sound) without also asserting the DOM edge — G6 forbids sound-as-sole-proxy.
- Do NOT modify packages/server or packages/shared.
      </out_of_scope>
      <estimated_new_lines>
Estimated +80 to +120 net new lines in spec file (A3 adds ~30, A4 adds ~35, A1 replaces skip branches with shorter waitFor lines, A2 replaces 1 line). Total within 150-line threshold — no split required. Justification for keeping whole: all 4 advisories are in the same file; splitting would duplicate the file-read cost with no implementation benefit.
      </estimated_new_lines>
      <output_expected>
        <tag>completion_packet</tag>
        <must_contain>
          <item>Confirmation that tsc --noEmit passes (client package)</item>
          <item>Confirmation that npx playwright test passes with 0 failures</item>
          <item>List of all test names in the proximity describe block after changes</item>
          <item>Diff summary: lines added, lines removed from materia-canvas.spec.ts</item>
        </must_contain>
        <must_not_contain>
          <item>Any modification to MateriaCanvas.tsx, MateriaNode.tsx, or CardNode.tsx</item>
          <item>Any test.skip() call</item>
          <item>Any assertion that asserts ONLY on audio without a paired DOM edge assertion</item>
        </must_not_contain>
        <success_signal>tsc exit 0 + playwright exit 0 confirmed in packet, zero test.skip in proximity describe block</success_signal>
      </output_expected>
    </task_packet>

    <task_packet>
      <task_id>gander-studio-p4-proximity-edge-hardening-FE-002</task_id>
      <assigned_to>Frontend Engineer</assigned_to>
      <priority>HIGH</priority>
      <description>
Apply three code-hygiene fixes across production source files. No behavior change, no visual change — pure dead-branch removal, CSS deduplication, and call-site correction.

**FILE PATH CORRECTIONS (verify before editing):**
- A6 source file: `packages/client/src/constants/compose.ts` — NOT `lib/loadout/compose.ts` (that path does not exist)
- A7 source file: `packages/client/src/components/compose/MateriaCanvas.tsx` — NOT `MateriaPalette.tsx` (that file does not exist; the MateriaPalette sub-component lives inside MateriaCanvas.tsx)

---

**A5 — Extract shared INVISIBLE_HANDLE_STYLE constant**

Current state:
- `MateriaNode.tsx` lines 42-55: `const HANDLE_STYLE: React.CSSProperties = { width: 1, height: 1, opacity: 0, pointerEvents: 'none', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', border: 'none', background: 'transparent' }`
- `CardNode.tsx` lines 17-27: `const CARD_HANDLE_STYLE: React.CSSProperties = { width: 1, height: 1, opacity: 0, pointerEvents: 'none', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', border: 'none', background: 'transparent' }` — byte-identical object

Action:
1. Create `packages/client/src/components/compose/handle-style.ts` with:
```ts
// ─────────────────────────────────────────────────────────────────────────────
// Shared invisible RF Handle style — used by MateriaNode and CardNode.
// Collapses the handle to a 1×1px invisible anchor at the node's geometric center.
// Required by @xyflow/react for edge SVG endpoint resolution.
// isConnectable={false} on the Handle component prevents manual drag-to-connect.
// ─────────────────────────────────────────────────────────────────────────────
import type React from 'react';

export const INVISIBLE_HANDLE_STYLE: React.CSSProperties = {
  width: 1,
  height: 1,
  opacity: 0,
  pointerEvents: 'none',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  border: 'none',
  background: 'transparent',
};
```

2. In `MateriaNode.tsx`:
   - Remove the `HANDLE_STYLE` const block (lines 42-55)
   - Add import: `import { INVISIBLE_HANDLE_STYLE } from './handle-style';`
   - Replace all uses of `HANDLE_STYLE` with `INVISIBLE_HANDLE_STYLE` (there are 2 Handle elements, each using `style={HANDLE_STYLE}`)

3. In `CardNode.tsx`:
   - Remove the `CARD_HANDLE_STYLE` const block (lines 17-27)
   - Add import: `import { INVISIBLE_HANDLE_STYLE } from './handle-style';`
   - Replace all uses of `CARD_HANDLE_STYLE` with `INVISIBLE_HANDLE_STYLE` (there are 2 Handle elements)

STYLE IDENTITY REQUIREMENT: The extracted constant must be object-identical to the current literals. Do not reorder properties, do not add/remove properties. A visual inspection of the rendered handles before and after must show zero difference. The `pointerEvents: 'none'` value is a string; do not change it. The `border: 'none'` and `background: 'transparent'` values are strings; do not change them.

---

**A6 — Delete dead META_AGENTS branch in getMateriaColor**

File: `packages/client/src/constants/compose.ts`

Current situation (verified by PM pre-flight):
- Line 8: `META_AGENTS as COMMAND_AGENTS` — aliased import
- Line 12: `META_AGENTS` — un-aliased import (same exported Set from agent-roles.ts)
- Line 75: `if (COMMAND_AGENTS.has(lower)) return 'var(--my)';` — catches all META_AGENTS members
- Line 79: `if (META_AGENTS.has(lower)) return 'var(--mp)';` — DEAD: unreachable because COMMAND_AGENTS === META_AGENTS

Action:
1. Run `grep -rn "META_AGENTS" packages/client/src/` to verify all references before deleting. If META_AGENTS appears anywhere else outside compose.ts (e.g., in canvas-store.ts), note those but do NOT modify them — only touch the dead branch in compose.ts.
2. Delete line 79: `if (META_AGENTS.has(lower)) return 'var(--mp)';`
3. Remove the un-aliased `META_AGENTS` from the import at line 12 IF it is no longer used after the deletion. Check: after deleting line 79, grep for bare `META_AGENTS` in compose.ts — if the only reference was line 79, remove it from the import. If META_AGENTS appears on line 12 as part of `META_FRAGMENTS` import (they're separate), be careful — only remove `META_AGENTS` from the named imports, not the whole import statement.
4. Add a single-line comment above the COMMAND_AGENTS check (line 75) explaining that META_AGENTS and COMMAND_AGENTS are the same set:
   ```ts
   // COMMAND_AGENTS ≡ META_AGENTS (imported aliased); META_AGENTS un-aliased branch was removed as dead code.
   if (COMMAND_AGENTS.has(lower)) return 'var(--my)';
   ```

IMPORTANT: Do NOT change the behavior. The surviving branch returns `'var(--my)'` (meta yellow) for META_AGENTS members — correct. The dead branch returned `'var(--mp)'` (purple) which was wrong (would have been unreachable anyway).

---

**A7 — Pass role argument to getMateriaColor in buildPaletteItemStyle**

File: `packages/client/src/components/compose/MateriaCanvas.tsx`

Current call (in `buildPaletteItemStyle` function, ~line 593):
```ts
boxShadow: `inset 3px 0 0 ${getMateriaColor(type === 'agent' ? 'frontend-engineer' : 'skill', type)}`,
```

Function signature (from constants/compose.ts, verified):
```ts
export function getMateriaColor(name: string, type: 'agent' | 'skill' | 'hook', role?: AgentRole): string
```

The current call passes `name` and `type` correctly; `role` is optional and `undefined` is acceptable. The 2-arg call is not a TS error. However, the advisory asks to pass the appropriate role to bypass name-based hashing.

For the palette type accent:
- When `type === 'agent'`: the palette uses `'frontend-engineer'` as a representative name → resolves to `SPECIALIST_AGENTS` → `'var(--mg)'` (specialist green). The appropriate explicit role is `'specialist'`.
- When `type === 'skill'`: resolves to `'var(--mb)'` (skill blue). The appropriate explicit role is `'skill'`.

Updated call:
```ts
import type { AgentRole } from '../../constants/agent-roles';
// ... in buildPaletteItemStyle:
const role: AgentRole = type === 'agent' ? 'specialist' : 'skill';
boxShadow: `inset 3px 0 0 ${getMateriaColor(type === 'agent' ? 'frontend-engineer' : 'skill', type, role)}`,
```

Or more concisely (since name is now only a fallback and role bypasses it):
```ts
const paletteRole: AgentRole = type === 'agent' ? 'specialist' : 'skill';
boxShadow: `inset 3px 0 0 ${getMateriaColor('', type, paletteRole)}`,
```

IMPORTANT: Verify that `AgentRole` is already imported in MateriaCanvas.tsx before adding the import. Current imports at the top of MateriaCanvas.tsx include `import type { AgentRole } from '../../constants/agent-roles';` — verify this before adding a duplicate import. If already imported, do not add it again.

The rendered color must remain unchanged: `'var(--mg)'` for agents, `'var(--mb)'` for skills. This is a refactor, not a behavior change.
      </description>
      <success_criteria>
1. `packages/client/src/components/compose/handle-style.ts` exists and exports `INVISIBLE_HANDLE_STYLE: React.CSSProperties` with exactly 9 properties matching the current literals in both source files.
2. `MateriaNode.tsx` imports `INVISIBLE_HANDLE_STYLE` from `./handle-style` and uses it in both Handle elements; no local `HANDLE_STYLE` const remains.
3. `CardNode.tsx` imports `INVISIBLE_HANDLE_STYLE` from `./handle-style` and uses it in both Handle elements; no local `CARD_HANDLE_STYLE` const remains.
4. `grep -n "HANDLE_STYLE" packages/client/src/components/compose/MateriaNode.tsx` returns 0 matches for the local const declaration; same for CardNode.tsx.
5. `grep -c "CARD_HANDLE_STYLE\|const HANDLE_STYLE" packages/client/src/components/compose/MateriaNode.tsx packages/client/src/components/compose/CardNode.tsx` returns 0.
6. `packages/client/src/constants/compose.ts` line 79 (`if (META_AGENTS.has(lower)) return 'var(--mp)';`) is deleted. If META_AGENTS was used only in that branch, it is removed from the import on line 12 as well. A clarifying comment is added above the COMMAND_AGENTS check.
7. `buildPaletteItemStyle` in MateriaCanvas.tsx passes an explicit `role` arg (`'specialist'` or `'skill'`) to `getMateriaColor`. No duplicate `AgentRole` import is added.
8. `tsc --noEmit --project packages/shared/tsconfig.json && tsc --noEmit --project packages/server/tsconfig.json && tsc --noEmit --project packages/client/tsconfig.json` exits 0 (all 3 packages).
9. `npx playwright test` run from `packages/client` exits 0 — no regressions (the 7 existing passing tests remain passing; FE-001 additions are unaffected by this task).
10. Bundle size: `npm run build -w @gander-studio/client` completes; main JS chunk remains under 1000 kB (currently 881.81 kB; CSS extraction reduces it, not increases it).
      </success_criteria>
      <context_files>
        packages/client/src/components/compose/MateriaNode.tsx
        packages/client/src/components/compose/CardNode.tsx
        packages/client/src/constants/compose.ts
        packages/client/src/components/compose/MateriaCanvas.tsx
        packages/client/src/constants/agent-roles.ts
      </context_files>
      <dependencies>NONE — parallel with FE-001</dependencies>
      <out_of_scope>
- Do NOT modify materia-canvas.spec.ts (that is FE-001's domain).
- Do NOT change any behavior visible to the end user. The handle styles must be byte-identical to the current literals.
- Do NOT remove the React import from handle-style.ts — the `React.CSSProperties` type requires it (or use `import type React`).
- Do NOT modify packages/server or packages/shared.
- Do NOT rename or move any other component files.
- Do NOT touch the `AgentRole` type definition in agent-roles.ts.
      </out_of_scope>
      <estimated_new_lines>
A5: +20 lines (new handle-style.ts) −18 lines (removed HANDLE_STYLE and CARD_HANDLE_STYLE consts) +4 lines (import additions) = net ~+6.
A6: −1 line (dead branch) −1 line (un-aliased import if unused) +1 line (comment) = net ~−1.
A7: +2 lines (role var + updated getMateriaColor call) −1 line (old call) = net ~+1.
Total: ~+6 net new lines. Well under threshold.
      </estimated_new_lines>
      <output_expected>
        <tag>completion_packet</tag>
        <must_contain>
          <item>Confirmation that handle-style.ts was created with INVISIBLE_HANDLE_STYLE export</item>
          <item>Confirmation that MateriaNode.tsx and CardNode.tsx now import from handle-style.ts</item>
          <item>Confirmation of the dead branch deletion and which import lines were affected</item>
          <item>Confirmation of the getMateriaColor role arg addition and which role values were used</item>
          <item>tsc --noEmit exit 0 for all 3 packages confirmed</item>
          <item>npx playwright test exit 0 confirmed</item>
          <item>Bundle size ≤ 1000 kB confirmed (build output line from vite)</item>
        </must_contain>
        <must_not_contain>
          <item>Any modification to materia-canvas.spec.ts</item>
          <item>Any hex color value in handle-style.ts (use CSS var tokens or transparent)</item>
          <item>Duplicate AgentRole import in MateriaCanvas.tsx</item>
        </must_not_contain>
        <success_signal>tsc exit 0 all 3 packages + playwright exit 0 + handle-style.ts present + dead branch deleted confirmed in packet</success_signal>
      </output_expected>
    </task_packet>

  </task_packets>

  <dependency_order>
    gander-studio-p4-proximity-edge-hardening-FE-001 (parallel)
    gander-studio-p4-proximity-edge-hardening-FE-002 (parallel)
    Both must pass audit before sprint closes. No ordering between FE-001 and FE-002 — disjoint file sets, no shared writes.
  </dependency_order>

  <routing_notes>
    - Both tasks are parallel. Dispatch FE-001 and FE-002 simultaneously.
    - DESIGN.md absent at packages/client/ — no UI surface changes in this sprint; DESIGN.md check not applicable (pure test/code hygiene, no visual token changes).
    - A6 path correction: brief says `packages/client/src/lib/loadout/compose.ts` — actual file is `packages/client/src/constants/compose.ts`. This correction is embedded in FE-002 task packet. Auditor should verify against the corrected path.
    - A7 path correction: brief says `packages/client/src/components/compose/MateriaPalette.tsx` — actual file is `packages/client/src/components/compose/MateriaCanvas.tsx` (MateriaPalette sub-component is defined inside MateriaCanvas.tsx). This correction is embedded in FE-002 task packet. Auditor should verify against the corrected path.
    - A4 (link-sound spy): implemented via AudioContext.prototype.createOscillator proxy in `page.addInitScript`. Not a direct function spy on `playLink` (bundled module). The auditor should verify the primary DOM edge assertion is present AND appears before the audio assertion in the test body.
    - Critic gate: REQUIRED before dispatch. Per constraint in brief: "Audit independence: this is a meta-adjacent sprint ... Critic gate is REQUIRED."
    - Append serialization: FE-001 and FE-002 both append to agent changelog. ORC must serialize: FE-001 appends first, FE-002 re-reads and appends after (or both append at task completion in sequence determined by which finishes first — ORC serializes the commit).
  </routing_notes>

  <risk_flags>
    - A3 (agent↔skill test): Skill palette items use `data-testid="palette-item-{skill-name}"` — NOT type-prefixed. The selector `[data-testid^="palette-item-skill-"]` will return 0 matches. FE-001 must use the `h3.Skills` section landmark or `nth()` offset. Risk: FE agent ignores this and writes a selector that silently returns 0 matches, then `waitFor` times out in CI.
    - A4 (AudioContext proxy): The `page.addInitScript` proxy replaces `AudioContext.prototype.createOscillator` globally. If the AudioContext is created before the script runs (unlikely — it's lazy per `ensureAudioContext`), the count will be 0. Risk: proxy may not intercept if browser's AudioContext is instantiated before `addInitScript` executes. FE agent should add the spy before `await page.goto()` to ensure interception.
    - A5 (handle style identity): The extracted constant must be byte-identical. If the FE agent reformats or reorders the object properties, the visual output is unchanged but the comment at the top of handle-style.ts should document the property list. Risk: low (CSS properties are order-independent for inline styles).
    - A6 (META_AGENTS import cleanup): After deleting line 79, META_AGENTS may still appear in the same import block on line 12. The FE agent must check carefully whether META_AGENTS is referenced anywhere else in compose.ts. Per the read, it is not — only the dead branch used the un-aliased META_AGENTS. Risk: FE agent removes too much from the import line (e.g. removes META_FRAGMENTS accidentally).
    - DESIGN.md absent at packages/client/ — no risk for this sprint (no UI surface changes).
  </risk_flags>

</task_decomposition>
```

---

## Expectation Manifest

```xml
<expectation_manifest>
  <sprint_id>gander-studio-p4-proximity-edge-hardening</sprint_id>
  <generated>2026-04-27T00:25:00Z</generated>
  <assignments>
    <assignment>
      <task_id>gander-studio-p4-proximity-edge-hardening-FE-001</task_id>
      <agent>FE#1</agent>
      <expected_tag>completion_packet</expected_tag>
      <expected_file>.claude/agents/tasks/outputs/gander-studio-p4-proximity-edge-hardening-FE-001-FE-*.md</expected_file>
      <blocks>NONE (parallel with FE-002; both must PASS audit before sprint closes)</blocks>
      <receipt_check>
        <item>Zero test.skip() calls in proximity describe block confirmed</item>
        <item>A2 assertion: exact text "toBe(initialEdgeCount + 1)" present in file</item>
        <item>A3 test name containing "agent↔skill" or "skill proximity" present</item>
        <item>A4 test contains BOTH a DOM edge assertion AND an audio-spy assertion; DOM assertion appears first</item>
        <item>tsc --noEmit exit 0 for client package confirmed in packet</item>
        <item>npx playwright test exit 0 confirmed in packet</item>
        <item>No modifications to production source files listed in deliverables</item>
      </receipt_check>
    </assignment>
    <assignment>
      <task_id>gander-studio-p4-proximity-edge-hardening-FE-002</task_id>
      <agent>FE#2</agent>
      <expected_tag>completion_packet</expected_tag>
      <expected_file>.claude/agents/tasks/outputs/gander-studio-p4-proximity-edge-hardening-FE-002-FE-*.md</expected_file>
      <blocks>NONE (parallel with FE-001; both must PASS audit before sprint closes)</blocks>
      <receipt_check>
        <item>handle-style.ts created at packages/client/src/components/compose/handle-style.ts</item>
        <item>MateriaNode.tsx imports INVISIBLE_HANDLE_STYLE from ./handle-style (no local HANDLE_STYLE const)</item>
        <item>CardNode.tsx imports INVISIBLE_HANDLE_STYLE from ./handle-style (no local CARD_HANDLE_STYLE const)</item>
        <item>Dead branch deleted from constants/compose.ts (META_AGENTS.has line gone)</item>
        <item>getMateriaColor call in buildPaletteItemStyle passes explicit role arg</item>
        <item>tsc --noEmit exit 0 for ALL 3 packages confirmed in packet</item>
        <item>npx playwright test exit 0 confirmed in packet</item>
        <item>Bundle size ≤ 1000 kB confirmed (vite build output line present)</item>
        <item>No modifications to materia-canvas.spec.ts listed in deliverables</item>
      </receipt_check>
    </assignment>
  </assignments>
</expectation_manifest>
```