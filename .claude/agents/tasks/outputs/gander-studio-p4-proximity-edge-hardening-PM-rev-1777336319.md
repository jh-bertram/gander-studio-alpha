# Task Decomposition — gander-studio-p4-proximity-edge-hardening (rev1)

**PM:** PM#2 (revision of PM#1 plan after Critic BLOCK)
**Generated:** 2026-04-27T00:38:00Z
**Sprint:** gander-studio-p4-proximity-edge-hardening

---

## Revision Summary

Two BLOCKERs corrected from PM#1:

**BLOCKER 1 (FE-001, A1):** PM#1 instructed the implementer to upgrade silent-skips to hard `waitFor` but kept the selector `[data-testid^="palette-item-agent-"]`, which matches zero elements (testids are `palette-item-{name}`, not type-prefixed). This would cause both pre-existing tests to timeout. Revised A1 now requires correcting BOTH existing sites (lines ~99 and ~154) to use the Agents-section landmark pattern. SC#9 added.

**BLOCKER 2 (FE-002, A6):** PM#1 wrote "remove META_AGENTS from the named import on line 12." Line 12 in `packages/client/src/constants/compose.ts` is `META_FRAGMENTS,` — the import to PRESERVE. Line 11 is `META_AGENTS,` — the import to REMOVE. The line reference is corrected to "line 11." A grep-based SC added.

Two WARNINGs incorporated:

**WARNING 1 (A4 audio assertion):** Changed from `__oscCreateCount >= 2` to: reset counter to 0 after the unlock click, before the drag; assert `=== 2` exactly. One-line comment added to task spec explaining why reset + exact-2 isolates `playLink`.

**WARNING 2 (A4 addInitScript timing):** Added one-sentence rationale about why `addInitScript` before navigation is sufficient.

**WARNING 3 (A5 inline literals):** Deferred. Auditor explicitly blessed colocation in `handle-style.ts`; accepted the forecast risk.

---

## Source Verification Notes (carried forward from PM#1 + PM#2 additions)

- `materia-canvas.spec.ts` line 99: `palette.locator('[data-testid^="palette-item-agent-"]').first()` — zero-match selector confirmed.
- `materia-canvas.spec.ts` line 154: `palette.locator('[data-testid^="palette-item-agent-"]').first()` — same zero-match selector confirmed.
- `MateriaCanvas.tsx` line 621: `data-testid={\`palette-item-${item.name}\`}` — no type prefix in testid, confirmed.
- `constants/compose.ts` line 11: `META_AGENTS,` (un-aliased import — to remove). Line 12: `META_FRAGMENTS,` (to preserve).
- `useLinkSound.ts`: `playApproach` creates 1 oscillator per cycle; `playLink` creates exactly 2 oscillators (primaryOsc + secondaryOsc). Resetting count after unlock click and asserting exactly 2 isolates the link call.

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

**A1 — Fix broken selector AND replace silent-skip fallbacks with hard waits (4 locations)**

CRITICAL SELECTOR BUG (propagated from PM#1 — do not repeat):
The existing tests at lines ~99 and ~154 use:
  `palette.locator('[data-testid^="palette-item-agent-"]').first()`
This selector matches ZERO elements. Palette testids are `palette-item-{name}` with no type prefix
(see MateriaCanvas.tsx line 621: `data-testid={\`palette-item-${item.name}\`}`).
The tests pass today ONLY because the silent-skip fallback absorbs the zero-match miss.
Upgrading the silent-skip to a hard `waitFor` WITHOUT also fixing the selector will make
BOTH tests TIMEOUT and FAIL.

Required fix for BOTH existing sites AND the new A4 test:
Use the Agents-section heading as a landmark to scope palette item selection:

```ts
const agentItem = palette
  .locator('h3').filter({ hasText: /^Agents$/i })
  .locator('..')
  .locator('[data-testid^="palette-item-"]')
  .first();
await agentItem.waitFor({ state: 'visible', timeout: 5000 });
```

Apply this fix at ALL four A1 sites:
1. Lines ~99-103: the `if (!(await agentItem.isVisible())) { test.skip(...); return; }` block inside the "orchestrator↔agent proximity drop" test — replace the agentItem declaration AND the silent-skip with the landmark pattern + waitFor.
2. Lines ~119-125: the `agentVisible` early-return block inside the same test — after the waitFor above succeeds, this block is removed entirely (the agent node will be present after the drag).
3. Lines ~155-159: the `if (!(await agentItem.isVisible())) { ... return; }` block inside the "DOM edge count matches store edges" test — same fix: landmark selector + waitFor, remove conditional.
4. Lines ~172-176: the `if (!(await agentNode.isVisible()...)) { ... return; }` block inside the same test — remove; after a successful agentItem.dragTo, the node appears deterministically.

After replacement: no conditional branches for "agent not visible" remain in the proximity describe block. The flow is: landmark waitFor → dragTo → waitFor node → proceed with assertions.

**A2 — Replace tautology assertion (line ~185)**

Current:
```ts
expect(postDragEdgeCount).toBeGreaterThanOrEqual(0);
```

Replace with:
```ts
expect(postDragEdgeCount).toBe(initialEdgeCount + 1);
```

Where `initialEdgeCount` is already captured earlier in the same test (line ~147).
The existing assertion at line ~149 (`expect(initialEdgeCount).toBe(0)`) remains unchanged.

After this change, the `if (postDragEdgeCount > 0) { ... }` conditional block (lines ~187-194) becomes unconditional:
```ts
expect(postDragEdgeCount).toBe(initialEdgeCount + 1);
const firstEdge = page.locator('.react-flow__edge').first();
await expect(firstEdge).toBeAttached();
const dataId = await firstEdge.getAttribute('data-id');
expect(dataId).toBeTruthy();
```

**A3 — Add agent↔skill proximity test**

Add a new test to the `'Proximity edge DOM rendering (FE-001 regression fix)'` describe block:

```ts
test('agent↔skill proximity drop renders a .react-flow__edge element', async ({ page }) => {
  await gotoCompose(page);
  await expect(page.locator('.react-flow__edges')).toBeAttached();

  const palette = page.locator('[data-testid="materia-palette"]');
  await palette.waitFor({ state: 'visible', timeout: 5000 });

  // Step 1: Drop an agent onto the canvas first (use Agents-section landmark, no type prefix in testid)
  const agentItem = palette
    .locator('h3').filter({ hasText: /^Agents$/i })
    .locator('..')
    .locator('[data-testid^="palette-item-"]')
    .first();
  await agentItem.waitFor({ state: 'visible', timeout: 5000 });

  const canvasEl = page.locator('[data-testid="materia-canvas"]');
  const canvasBox = await canvasEl.boundingBox();
  if (!canvasBox) throw new Error('canvas bounding box not found');

  await agentItem.dragTo(canvasEl, {
    targetPosition: { x: canvasBox.width / 2 - 80, y: canvasBox.height / 2 },
  });
  await page.waitForTimeout(300);
  const agentNode = page.locator('[data-testid^="materia-node-"]').first();
  await agentNode.waitFor({ state: 'visible', timeout: 5000 });

  // Step 2: Drop a skill palette item (use Skills-section landmark — testid is palette-item-{name}, not palette-item-skill-{name})
  const skillSection = palette.locator('h3').filter({ hasText: /^Skills$/i });
  const firstSkillItem = skillSection.locator('..').locator('[data-testid^="palette-item-"]').first();
  await firstSkillItem.waitFor({ state: 'visible', timeout: 5000 });
  await firstSkillItem.dragTo(canvasEl, {
    targetPosition: { x: canvasBox.width / 2 + 80, y: canvasBox.height / 2 },
  });
  await page.waitForTimeout(300);

  // Step 3: Drag the skill node (second materia-node) onto the agent node to trigger proximity edge
  await canvasEl.click({ position: { x: 10, y: 10 } }); // unlock AudioContext
  const skillNode = page.locator('[data-testid^="materia-node-"]').nth(1);
  await skillNode.waitFor({ state: 'visible', timeout: 5000 });
  await dragNodeOntoTarget(
    page,
    '[data-testid^="materia-node-"]',
    agentNode,
  );
  await page.waitForTimeout(400);

  // Assert: at least one .react-flow__edge in DOM
  const edgeCount = await page.locator('.react-flow__edge').count();
  expect(edgeCount).toBeGreaterThan(0);
});
```

NOTE: Skills-section landmark mirrors the Agents-section landmark for parity. Do NOT use `[data-testid^="palette-item-skill-"]` — skill testids are not type-prefixed.

If no skill items exist in the palette (empty GANDER_ROOT), `firstSkillItem.waitFor` will fail loudly after 5000ms per A1 philosophy (hard fail, not silent skip).

**A4 — Link sound spy + DOM edge assertion**

Add a test to the `'Proximity edge DOM rendering (FE-001 regression fix)'` describe block.

**addInitScript timing rationale:** `addInitScript` injects the proxy into the page's main world before any user JS runs, including before the first `ensureAudioContext()` call inside `handleCanvasMouseDown` — this is why the proxy on `AudioContext.prototype.createOscillator` catches all link oscillator creations. The `addInitScript` call must appear BEFORE `await gotoCompose(page)` (i.e., before `page.goto()`).

**Counter isolation strategy (WARNING 1 fix — Option b):**
`playApproach` creates 1 oscillator per proximity-enter cycle; `playLink` creates exactly 2 oscillators (primaryOsc + secondaryOsc). A naive `>= 2` assertion can be satisfied by approach sounds alone during a drag that enters proximity but doesn't commit an edge. To isolate `playLink`:

- Install the `__oscCreateCount` proxy before navigation (catches all oscillator creation from page start).
- After the unlock canvas click and BEFORE the drag that commits the edge, reset: `await page.evaluate(() => { (window as any).__oscCreateCount = 0; });`
- After the drag + settle, assert `oscCount === 2` EXACTLY — the 2 oscillators created by `playLink`'s primaryOsc + secondaryOsc.
- Add a one-line comment: `// Reset before drag so count reflects only the edge-commit playLink call (2 osc), not prior approach oscillators.`

```ts
test('edge creation fires link sound and renders DOM edge element', async ({ page }) => {
  // Install AudioContext proxy BEFORE navigation so prototype mutation precedes new AudioContext()
  await page.addInitScript(() => {
    // addInitScript injects before any user JS runs, including before ensureAudioContext() fires.
    const origCreate = AudioContext.prototype.createOscillator;
    (window as any).__oscCreateCount = 0;
    AudioContext.prototype.createOscillator = function(...args: any[]) {
      (window as any).__oscCreateCount = ((window as any).__oscCreateCount || 0) + 1;
      return origCreate.apply(this, args as []);
    };
  });

  await gotoCompose(page);

  const palette = page.locator('[data-testid="materia-palette"]');
  await palette.waitFor({ state: 'visible', timeout: 5000 });

  // Use Agents-section landmark (testid is palette-item-{name}, no type prefix)
  const agentItem = palette
    .locator('h3').filter({ hasText: /^Agents$/i })
    .locator('..')
    .locator('[data-testid^="palette-item-"]')
    .first();
  await agentItem.waitFor({ state: 'visible', timeout: 5000 });

  const canvasEl = page.locator('[data-testid="materia-canvas"]');
  const canvasBox = await canvasEl.boundingBox();
  if (!canvasBox) throw new Error('canvas bounding box not found');

  await agentItem.dragTo(canvasEl, {
    targetPosition: { x: canvasBox.width / 2, y: canvasBox.height / 2 },
  });
  await page.waitForTimeout(300);
  await page.locator('[data-testid^="materia-node-"]').first()
    .waitFor({ state: 'visible', timeout: 5000 });

  // Unlock AudioContext; this calls playApproach + stopApproach (creates ≥ 1 oscillator).
  await canvasEl.click({ position: { x: 10, y: 10 } });

  // Reset counter BEFORE the drag so the assertion captures only the edge-commit playLink call.
  // playLink creates exactly 2 oscillators (primaryOsc + secondaryOsc); approach sounds are excluded.
  // Reset before drag so count reflects only the edge-commit playLink call (2 osc), not prior approach oscillators.
  await page.evaluate(() => { (window as any).__oscCreateCount = 0; });

  await dragNodeOntoTarget(page, '[data-testid^="materia-node-"]', '[data-testid="card-node"]');
  await page.waitForTimeout(400);

  // PRIMARY ASSERTION — DOM edge element (G6: must be present; DOM is the authoritative signal)
  const edgeCount = await page.locator('.react-flow__edge').count();
  expect(edgeCount).toBe(1);

  // SECONDARY ASSERTION — link sound fired (exactly 2 oscillators: primaryOsc + secondaryOsc from playLink)
  // approved: any — window-level spy counter from addInitScript
  const oscCount = await page.evaluate(() => (window as any).__oscCreateCount ?? 0);
  expect(oscCount).toBe(2);
});
```
      </description>
      <success_criteria>
1. `packages/client/src/tests/compose/materia-canvas.spec.ts` contains zero `test.skip` calls and zero `if (!...isVisible()) { ... return; }` early-return patterns in the proximity describe block.
2. Line that previously read `expect(postDragEdgeCount).toBeGreaterThanOrEqual(0)` now reads `expect(postDragEdgeCount).toBe(initialEdgeCount + 1)`.
3. A new test titled "agent↔skill proximity drop renders a .react-flow__edge element" exists in the proximity describe block, using the Skills-section heading landmark selector (not `[data-testid^="palette-item-skill-"]`).
4. A new test titled "edge creation fires link sound and renders DOM edge element" (or similar) exists, containing BOTH a DOM edge assertion AND an audio-spy assertion. The DOM edge assertion appears BEFORE the audio assertion (primary effect first, per G6). The audio assertion uses `===  2` (exact), not `>= 2`. A comment in the test explains the counter-reset isolation strategy.
5. `tsc --noEmit --project packages/client/tsconfig.json` exits 0.
6. `npx playwright test` run from `packages/client` exits 0 (all tests pass — no new failures, no regressions in the 7 existing tests).
7. No changes to any file outside `packages/client/src/tests/compose/materia-canvas.spec.ts`.
8. `grep -c 'palette-item-agent-' packages/client/src/tests/compose/materia-canvas.spec.ts` returns 0 — the broken type-prefixed agent selector is fully eliminated from the spec file.
9. The `page.addInitScript` call in the A4 test appears BEFORE `await gotoCompose(page)` (before page navigation), not after.
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
- Do NOT use `[data-testid^="palette-item-agent-"]` anywhere in the spec — this selector matches zero elements. Use section-heading landmarks.
- Do NOT use `[data-testid^="palette-item-skill-"]` — same zero-match problem. Use the Skills h3 landmark.
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
          <item>Confirmation that grep -c 'palette-item-agent-' returns 0 (broken selector fully removed)</item>
          <item>Confirmation that A4 audio assertion uses === 2 (exact), not >= 2</item>
        </must_contain>
        <must_not_contain>
          <item>Any modification to MateriaCanvas.tsx, MateriaNode.tsx, or CardNode.tsx</item>
          <item>Any test.skip() call</item>
          <item>Any assertion that asserts ONLY on audio without a paired DOM edge assertion</item>
          <item>The string 'palette-item-agent-' appearing in the spec file</item>
          <item>The string 'palette-item-skill-' appearing in the spec file</item>
        </must_not_contain>
        <success_signal>tsc exit 0 + playwright exit 0 confirmed in packet, zero test.skip in proximity describe block, grep 'palette-item-agent-' returns 0</success_signal>
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

STYLE IDENTITY REQUIREMENT: The extracted constant must be object-identical to the current literals. Do not reorder properties, do not add/remove properties. The `pointerEvents: 'none'`, `border: 'none'`, and `background: 'transparent'` string values must not be changed.

---

**A6 — Delete dead META_AGENTS branch in getMateriaColor**

File: `packages/client/src/constants/compose.ts`

Current situation (verified by PM pre-flight — line numbers confirmed against as-committed source):
- Line 7:  `META_AGENTS as COMMAND_AGENTS,` — aliased import, KEEP
- Line 8:  `SPECIALIST_AGENTS as IMPL_AGENTS,`
- Line 9:  `GATE_AGENTS,`
- Line 10: `EXTERNAL_AGENTS as INTEL_AGENTS,`
- Line 11: `META_AGENTS,` — un-aliased import, REMOVE THIS LINE
- Line 12: `META_FRAGMENTS,` — PRESERVE, DO NOT TOUCH
- Line 75: `if (COMMAND_AGENTS.has(lower)) return 'var(--my)';` — catches all META_AGENTS members
- Line 79: `if (META_AGENTS.has(lower)) return 'var(--mp)';` — DEAD: unreachable because COMMAND_AGENTS === META_AGENTS

Action:
1. Run `grep -rn "META_AGENTS" packages/client/src/` to verify all references before deleting. If META_AGENTS appears anywhere else outside compose.ts, note those but do NOT modify them — only touch the dead branch in compose.ts.
2. Delete line 79: `if (META_AGENTS.has(lower)) return 'var(--mp)';`
3. Remove `META_AGENTS,` from line 11 ONLY — this is the bare un-aliased entry. Do NOT touch line 7 (`META_AGENTS as COMMAND_AGENTS` — this alias is still used at line 75) and do NOT touch line 12 (`META_FRAGMENTS,` — still used at line 82).
4. Add a single-line comment above the COMMAND_AGENTS check (line 75) explaining that META_AGENTS and COMMAND_AGENTS are the same set:
   ```ts
   // COMMAND_AGENTS ≡ META_AGENTS (imported aliased); META_AGENTS un-aliased branch was removed as dead code.
   if (COMMAND_AGENTS.has(lower)) return 'var(--my)';
   ```

IMPORTANT: Do NOT change the behavior. The surviving branch returns `'var(--my)'` (meta yellow) for META_AGENTS members — correct.

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

The current call passes `name` and `type` correctly; `role` is optional. The 2-arg call is not a TS error. Advisory asks to pass the appropriate role to bypass name-based hashing explicitly.

For the palette type accent:
- When `type === 'agent'`: appropriate explicit role is `'specialist'`
- When `type === 'skill'`: appropriate explicit role is `'skill'`

Updated call:
```ts
const paletteRole: AgentRole = type === 'agent' ? 'specialist' : 'skill';
boxShadow: `inset 3px 0 0 ${getMateriaColor(type === 'agent' ? 'frontend-engineer' : 'skill', type, paletteRole)}`,
```

IMPORTANT: Verify that `AgentRole` is already imported in MateriaCanvas.tsx before adding the import. If already imported, do not add it again. The rendered color must remain unchanged: `'var(--mg)'` for agents, `'var(--mb)'` for skills.
      </description>
      <success_criteria>
1. `packages/client/src/components/compose/handle-style.ts` exists and exports `INVISIBLE_HANDLE_STYLE: React.CSSProperties` with exactly 9 properties matching the current literals in both source files.
2. `MateriaNode.tsx` imports `INVISIBLE_HANDLE_STYLE` from `./handle-style` and uses it in both Handle elements; no local `HANDLE_STYLE` const remains.
3. `CardNode.tsx` imports `INVISIBLE_HANDLE_STYLE` from `./handle-style` and uses it in both Handle elements; no local `CARD_HANDLE_STYLE` const remains.
4. `grep -n "HANDLE_STYLE" packages/client/src/components/compose/MateriaNode.tsx` returns 0 matches for the local const declaration; same for CardNode.tsx.
5. `grep -c "CARD_HANDLE_STYLE\|const HANDLE_STYLE" packages/client/src/components/compose/MateriaNode.tsx packages/client/src/components/compose/CardNode.tsx` returns 0.
6. `grep -c '^  META_AGENTS,$' packages/client/src/constants/compose.ts` returns 0 (line 11 removed). AND `grep -c '^  META_FRAGMENTS,$' packages/client/src/constants/compose.ts` returns 1 (line 12 preserved). AND the dead branch `if (META_AGENTS.has(lower)) return 'var(--mp)';` is absent. AND the aliased import `META_AGENTS as COMMAND_AGENTS` remains present (line 7).
7. `buildPaletteItemStyle` in MateriaCanvas.tsx passes an explicit `role` arg (`'specialist'` or `'skill'`) to `getMateriaColor`. No duplicate `AgentRole` import is added.
8. `tsc --noEmit --project packages/shared/tsconfig.json && tsc --noEmit --project packages/server/tsconfig.json && tsc --noEmit --project packages/client/tsconfig.json` exits 0 (all 3 packages).
9. `npx playwright test` run from `packages/client` exits 0 — no regressions.
10. Bundle size: `npm run build -w @gander-studio/client` completes; main JS chunk remains under 1000 kB.
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
- Do NOT remove the React import from handle-style.ts — the `React.CSSProperties` type requires it (use `import type React`).
- Do NOT modify packages/server or packages/shared.
- Do NOT rename or move any other component files.
- Do NOT touch the `AgentRole` type definition in agent-roles.ts.
- Do NOT remove line 7 (`META_AGENTS as COMMAND_AGENTS`) or line 12 (`META_FRAGMENTS`) from the imports in compose.ts — only line 11 (`META_AGENTS,`) is removed.
      </out_of_scope>
      <estimated_new_lines>
A5: +20 lines (new handle-style.ts) −18 lines (removed HANDLE_STYLE and CARD_HANDLE_STYLE consts) +4 lines (import additions) = net ~+6.
A6: −1 line (dead branch) −1 line (un-aliased import at line 11) +1 line (comment) = net ~−1.
A7: +2 lines (role var + updated getMateriaColor call) −1 line (old call) = net ~+1.
Total: ~+6 net new lines. Well under threshold.
      </estimated_new_lines>
      <output_expected>
        <tag>completion_packet</tag>
        <must_contain>
          <item>Confirmation that handle-style.ts was created with INVISIBLE_HANDLE_STYLE export</item>
          <item>Confirmation that MateriaNode.tsx and CardNode.tsx now import from handle-style.ts</item>
          <item>Confirmation of the dead branch deletion and which import lines were affected (line 11 removed; line 7 and 12 preserved)</item>
          <item>Grep verification: grep -c '^  META_AGENTS,$' compose.ts returns 0; grep -c '^  META_FRAGMENTS,$' returns 1</item>
          <item>Confirmation of the getMateriaColor role arg addition and which role values were used</item>
          <item>tsc --noEmit exit 0 for all 3 packages confirmed</item>
          <item>npx playwright test exit 0 confirmed</item>
          <item>Bundle size ≤ 1000 kB confirmed (build output line from vite)</item>
        </must_contain>
        <must_not_contain>
          <item>Any modification to materia-canvas.spec.ts</item>
          <item>Any hex color value in handle-style.ts (use CSS var tokens or transparent)</item>
          <item>Duplicate AgentRole import in MateriaCanvas.tsx</item>
          <item>Removal of META_AGENTS as COMMAND_AGENTS from compose.ts imports (line 7 must be preserved)</item>
          <item>Removal of META_FRAGMENTS from compose.ts imports (line 12 must be preserved)</item>
        </must_not_contain>
        <success_signal>tsc exit 0 all 3 packages + playwright exit 0 + handle-style.ts present + dead branch deleted + grep META_AGENTS line-11 = 0 + grep META_FRAGMENTS = 1 confirmed in packet</success_signal>
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
    - A1 SELECTOR REGRESSION CORRECTED (BLOCKER 1 resolved): The pre-existing tests at lines ~99 and ~154 in materia-canvas.spec.ts both use `[data-testid^="palette-item-agent-"]` which matches zero elements. FE-001 is instructed to fix BOTH sites to use the Agents-section h3 landmark pattern. Auditor should verify `grep -c 'palette-item-agent-' materia-canvas.spec.ts` returns 0.
    - A6 LINE NUMBER CORRECTED (BLOCKER 2 resolved): The un-aliased META_AGENTS import to remove is on LINE 11, not line 12. Line 12 is `META_FRAGMENTS,` which must be preserved. FE-002 task packet now carries the exact line-by-line mapping (7=aliased keep, 11=un-aliased remove, 12=META_FRAGMENTS keep).
    - A4 COUNTER ISOLATION ADDED (WARNING 1 resolved): FE-001 A4 test now resets `__oscCreateCount = 0` after the unlock click and before the drag, then asserts exactly `=== 2`. This isolates the `playLink` call (2 oscillators) from prior `playApproach` oscillators.
    - A4 TIMING RATIONALE ADDED (WARNING 2 resolved): FE-001 task packet includes the explicit rationale for why `addInitScript` before navigation is sufficient.
    - WARNING 3 (A5 inline literals): Deferred. The auditor explicitly suggested colocation in handle-style.ts. If a future SA pass flags `1`, `'50%'`, `'translate(-50%, -50%)'` as inline numeric literals against agent-changelog 2026-03-30-1, names can be extracted to `canvas.ts` at that time.
    - A6 path correction: brief says `packages/client/src/lib/loadout/compose.ts` — actual file is `packages/client/src/constants/compose.ts`. This correction is embedded in FE-002 task packet.
    - A7 path correction: brief says `packages/client/src/components/compose/MateriaPalette.tsx` — actual file is `packages/client/src/components/compose/MateriaCanvas.tsx`. This correction is embedded in FE-002 task packet.
    - Append serialization: FE-001 and FE-002 both append to agent changelog. ORC must serialize: FE-001 appends first, FE-002 re-reads and appends after.
  </routing_notes>

  <risk_flags>
    - [RESOLVED] A1 selector regression: `[data-testid^="palette-item-agent-"]` matched zero elements at both existing test sites. Now fixed to use Agents-section h3 landmark in FE-001 task packet. SC#8 enforces grep count = 0 for the broken selector string.
    - [RESOLVED] A6 line off-by-one: line 11 = `META_AGENTS,` (remove); line 12 = `META_FRAGMENTS,` (preserve). FE-002 task packet now carries the exact line map. SC#6 enforces grep verification of both.
    - A3 (agent↔skill test): Skill palette items use `data-testid="palette-item-{skill-name}"` — NOT type-prefixed. FE-001 must use the Skills h3 landmark, not `[data-testid^="palette-item-skill-"]`. Risk: FE agent ignores this and writes a zero-match selector; `waitFor` times out in CI.
    - A4 (AudioContext proxy isolation): Counter is now reset between the unlock click and the drag. Risk is low: if `playApproach` fires during the drag BEFORE the edge commit, its 1 oscillator would make the count 3 (not 2). If this occurs in CI, the exact-2 assertion will fail — which is the correct behavior (something unexpected fired before `playLink`). Recommend the FE agent verify the drag-to-commit sequence fires `playLink` without a prior `playApproach` call in between.
    - A5 (handle style identity): Extracted constant must be object-identical. Risk: low. CSS properties are order-independent for inline styles; functional identity guaranteed if values match.
    - A5 (inline literal forecast): `width: 1`, `height: 1`, `top: '50%'` etc. inline in handle-style.ts. Auditor-blessed per original advisory. Future SA pass may flag per agent-changelog 2026-03-30-1. Deferred.
    - DESIGN.md absent at packages/client/ — no risk for this sprint (no UI surface changes).
  </risk_flags>

</task_decomposition>
```

---

## Expectation Manifest

```xml
<expectation_manifest>
  <sprint_id>gander-studio-p4-proximity-edge-hardening</sprint_id>
  <generated>2026-04-27T00:38:00Z</generated>
  <assignments>
    <assignment>
      <task_id>gander-studio-p4-proximity-edge-hardening-FE-001</task_id>
      <agent>FE#1</agent>
      <expected_tag>completion_packet</expected_tag>
      <expected_file>.claude/agents/tasks/outputs/gander-studio-p4-proximity-edge-hardening-FE-001-FE-*.md</expected_file>
      <blocks>NONE (parallel with FE-002; both must PASS audit before sprint closes)</blocks>
      <receipt_check>
        <item>Zero test.skip() calls in proximity describe block confirmed</item>
        <item>grep -c 'palette-item-agent-' materia-canvas.spec.ts returns 0 (broken selector fully removed)</item>
        <item>A2 assertion: exact text "toBe(initialEdgeCount + 1)" present in file</item>
        <item>A3 test name containing "agent↔skill" or "skill proximity" present; Skills-section h3 landmark used (no 'palette-item-skill-' string)</item>
        <item>A4 test contains BOTH a DOM edge assertion AND an audio-spy assertion; DOM assertion appears first; audio assertion uses === 2 (exact), not >= 2; counter reset comment present</item>
        <item>page.addInitScript call appears before gotoCompose in A4 test</item>
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
        <item>grep -c '^  META_AGENTS,$' compose.ts returns 0 (line 11 removed)</item>
        <item>grep -c '^  META_FRAGMENTS,$' compose.ts returns 1 (line 12 preserved)</item>
        <item>META_AGENTS as COMMAND_AGENTS alias (line 7) still present in compose.ts</item>
        <item>getMateriaColor call in buildPaletteItemStyle passes explicit role arg ('specialist' or 'skill')</item>
        <item>tsc --noEmit exit 0 for ALL 3 packages confirmed in packet</item>
        <item>npx playwright test exit 0 confirmed in packet</item>
        <item>Bundle size ≤ 1000 kB confirmed (vite build output line present)</item>
        <item>No modifications to materia-canvas.spec.ts listed in deliverables</item>
      </receipt_check>
    </assignment>
  </assignments>
</expectation_manifest>
```