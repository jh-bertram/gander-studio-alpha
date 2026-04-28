# Task Decomposition — gander-studio-p4-proximity-edge-hardening (rev2)

**PM:** PM#3 (targeted revision of PM#2 plan after CR#2 BLOCK on A4 oscillator-counting strategy)
**Generated:** 2026-04-27T01:15:00Z
**Sprint:** gander-studio-p4-proximity-edge-hardening

---

## Revision Summary

**A4 oscillator-counting strategy replaced (A4 — BLOCKER resolved):**

PM#2's A4 reset `__oscCreateCount = 0` after the unlock click and asserted `=== 2` after the drop. CR#2 traced the actual audio path and found the drag itself fires `playApproach()` (+1 osc) before `addEdgeWithEffects` fires `playLink()` (+2 oscs), giving a final count of 3, not 2. The exact-2 assertion would fail every CI run.

Fix: switch from raw oscillator-count discrimination to **frequency-discriminated** discrimination. The proxy intercepts `AudioParam.prototype.setValueAtTime` and increments `window.__linkOscCount` only when `value === LINK_PRIMARY_FREQ_HZ (880)` or `value === LINK_SECONDARY_FREQ_HZ (1320)`. The approach tone at `APPROACH_FREQ_HZ (220)` is filtered out. After one `playLink` call, `__linkOscCount === 2` exactly. The counter-reset step is eliminated — it is no longer needed.

Constants confirmed in `packages/client/src/constants/canvas.ts`:
- `APPROACH_FREQ_HZ = 220`
- `LINK_PRIMARY_FREQ_HZ = 880`
- `LINK_SECONDARY_FREQ_HZ = 1320`

Frequency set sites confirmed in `packages/client/src/hooks/useLinkSound.ts`:
- playApproach line 79: `osc.frequency.setValueAtTime(APPROACH_FREQ_HZ, ctx.currentTime)` → 220 Hz
- playLink primary line 156: `primaryOsc.frequency.setValueAtTime(LINK_PRIMARY_FREQ_HZ, now)` → 880 Hz
- playLink secondary line 182: `secondaryOsc.frequency.setValueAtTime(LINK_SECONDARY_FREQ_HZ, now)` → 1320 Hz

All other tasks (A1, A2, A3, A5, A6, A7, FE-002) are **verbatim from PM#2's plan**. No other task packet was modified.

---

## Source Verification Notes (carried forward from PM#1 + PM#2 + PM#3 additions)

- `materia-canvas.spec.ts` line 99: `palette.locator('[data-testid^="palette-item-agent-"]').first()` — zero-match selector confirmed.
- `materia-canvas.spec.ts` line 154: `palette.locator('[data-testid^="palette-item-agent-"]').first()` — same zero-match selector confirmed.
- `MateriaCanvas.tsx` line 621: `data-testid={\`palette-item-${item.name}\`}` — no type prefix in testid, confirmed.
- `constants/compose.ts` line 11: `META_AGENTS,` (un-aliased import — to remove). Line 12: `META_FRAGMENTS,` (to preserve).
- `constants/canvas.ts`: APPROACH_FREQ_HZ=220, LINK_PRIMARY_FREQ_HZ=880, LINK_SECONDARY_FREQ_HZ=1320 — all confirmed.
- `useLinkSound.ts`: playApproach sets 220 Hz; playLink sets 880 Hz (primary) + 1320 Hz (secondary). Frequency-discriminated spy at `AudioParam.prototype.setValueAtTime` correctly isolates playLink.

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

**A4 — Link sound spy + DOM edge assertion (REVISED — frequency-discriminated spy)**

Add a test to the `'Proximity edge DOM rendering (FE-001 regression fix)'` describe block.

**Why raw oscillator count fails:** During the drag that commits an edge, `MateriaCanvas.tsx` line 804 fires `playApproach()` (+1 oscillator) when the dragged node enters proximity threshold. Then on commit, `addEdgeWithEffects` fires `playLink()` (+2 oscillators). A reset-and-count-all approach yields 3, not 2. The `=== 2` exact assertion on a raw count fails every CI run.

**Correct approach — frequency-discriminated spy:**

The `playApproach` oscillator calls `osc.frequency.setValueAtTime(220, ...)` (APPROACH_FREQ_HZ).
The `playLink` oscillators call:
  - `primaryOsc.frequency.setValueAtTime(880, ...)` (LINK_PRIMARY_FREQ_HZ)
  - `secondaryOsc.frequency.setValueAtTime(1320, ...)` (LINK_SECONDARY_FREQ_HZ)

`osc.frequency` is an `AudioParam`. Patch `AudioParam.prototype.setValueAtTime` globally; inspect the first argument (the frequency value). Increment `window.__linkOscCount` only when `value === 880 || value === 1320`. The 220 Hz approach oscillator is filtered out automatically. After one `playLink` call, `__linkOscCount === 2` exactly — regardless of how many `playApproach` calls preceded.

**Constant injection strategy (no magic numbers in test source):**

At the top of the spec file, import the frequency constants from canvas.ts:
```ts
import {
  LINK_PRIMARY_FREQ_HZ,
  LINK_SECONDARY_FREQ_HZ,
} from '../../constants/canvas';
```

Because `addInitScript` receives a serialized function that runs in browser context (not Node/module context), the constants cannot be referenced directly inside the function body. Inject them via a stringified template approach — resolve the values in Node context and pass them into the browser script as literals:

```ts
await page.addInitScript(
  ({ primaryHz, secondaryHz }: { primaryHz: number; secondaryHz: number }) => {
    (window as unknown as { __linkOscCount: number }).__linkOscCount = 0;
    const origSetValue = AudioParam.prototype.setValueAtTime;
    AudioParam.prototype.setValueAtTime = function(
      value: number,
      startTime: number,
    ): AudioParam {
      if (value === primaryHz || value === secondaryHz) {
        (window as unknown as { __linkOscCount: number }).__linkOscCount += 1;
      }
      return origSetValue.call(this, value, startTime);
    };
  },
  { primaryHz: LINK_PRIMARY_FREQ_HZ, secondaryHz: LINK_SECONDARY_FREQ_HZ },
);
```

This passes the Node-resolved constant values as a serializable argument to the browser-side function. The test source reads from canvas.ts; no 880/1320 magic numbers appear in test source.

**addInitScript timing:** Must appear BEFORE `await gotoCompose(page)` (before `page.goto()`). `addInitScript` injects the patch into the page's main world before any user JS runs, ensuring the `AudioParam.prototype.setValueAtTime` override is in place before the first `ensureAudioContext()` call.

**Full test:**

```ts
test('edge creation fires link sound and renders DOM edge element', async ({ page }) => {
  // Install frequency-discriminated AudioParam spy BEFORE navigation.
  // AudioParam.prototype.setValueAtTime is patched globally; only 880 Hz (primary)
  // and 1320 Hz (secondary) — the playLink frequencies from canvas.ts constants —
  // increment __linkOscCount. The 220 Hz approach tone (APPROACH_FREQ_HZ) is filtered out,
  // so playApproach calls during the drag do not affect the count.
  await page.addInitScript(
    ({ primaryHz, secondaryHz }: { primaryHz: number; secondaryHz: number }) => {
      (window as unknown as { __linkOscCount: number }).__linkOscCount = 0;
      const origSetValue = AudioParam.prototype.setValueAtTime;
      AudioParam.prototype.setValueAtTime = function(
        value: number,
        startTime: number,
      ): AudioParam {
        if (value === primaryHz || value === secondaryHz) {
          (window as unknown as { __linkOscCount: number }).__linkOscCount += 1;
        }
        return origSetValue.call(this, value, startTime);
      };
    },
    { primaryHz: LINK_PRIMARY_FREQ_HZ, secondaryHz: LINK_SECONDARY_FREQ_HZ },
  );

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

  // Unlock AudioContext (may fire playApproach/stopApproach — those are 220 Hz and excluded by spy).
  await canvasEl.click({ position: { x: 10, y: 10 } });

  // Drag the placed agent node onto the card node to commit a proximity edge.
  // During the drag, playApproach fires at 220 Hz (filtered out by spy).
  // On commit, playLink fires at 880 Hz + 1320 Hz → __linkOscCount increments to 2.
  await dragNodeOntoTarget(page, '[data-testid^="materia-node-"]', '[data-testid="card-node"]');
  await page.waitForTimeout(400);

  // PRIMARY ASSERTION — DOM edge element (G6: DOM is the authoritative signal; audio is secondary)
  const edgeCount = await page.locator('.react-flow__edge').count();
  expect(edgeCount).toBe(1);

  // SECONDARY ASSERTION — link sound fired (exactly 2 frequency-matched oscillator setValueAtTime calls:
  // 880 Hz primary + 1320 Hz secondary from playLink; approach tone at 220 Hz filtered out by spy).
  const linkOscCount = await page.evaluate(
    () => (window as unknown as { __linkOscCount: number }).__linkOscCount,
  );
  expect(linkOscCount).toBe(2);
});
```
      </description>
      <success_criteria>
1. `packages/client/src/tests/compose/materia-canvas.spec.ts` contains zero `test.skip` calls and zero `if (!...isVisible()) { ... return; }` early-return patterns in the proximity describe block.
2. Line that previously read `expect(postDragEdgeCount).toBeGreaterThanOrEqual(0)` now reads `expect(postDragEdgeCount).toBe(initialEdgeCount + 1)`.
3. A new test titled "agent↔skill proximity drop renders a .react-flow__edge element" exists in the proximity describe block, using the Skills-section heading landmark selector (not `[data-testid^="palette-item-skill-"]`).
4. A new test titled "edge creation fires link sound and renders DOM edge element" (or similar) exists, containing BOTH a DOM edge assertion AND an audio-spy assertion. The DOM edge assertion appears BEFORE the audio assertion (primary effect first, per G6). The audio assertion uses `__linkOscCount === 2` (exact, frequency-discriminated) — NOT `__oscCreateCount === 2` (raw count) and NOT `>= 2`. The spec imports `LINK_PRIMARY_FREQ_HZ` and `LINK_SECONDARY_FREQ_HZ` from `../../constants/canvas` and passes them into `page.addInitScript` as serialized args; no magic numbers 880 or 1320 appear as bare literals in test source. The spy patches `AudioParam.prototype.setValueAtTime`, not `AudioContext.prototype.createOscillator`.
5. `tsc --noEmit --project packages/client/tsconfig.json` exits 0.
6. `npx playwright test` run from `packages/client` exits 0 (all tests pass — no new failures, no regressions in the 7 existing tests).
7. No changes to any file outside `packages/client/src/tests/compose/materia-canvas.spec.ts`.
8. `grep -c 'palette-item-agent-' packages/client/src/tests/compose/materia-canvas.spec.ts` returns 0 — the broken type-prefixed agent selector is fully eliminated from the spec file.
9. The `page.addInitScript` call in the A4 test appears BEFORE `await gotoCompose(page)` (before page navigation), not after.
10. `grep -c '__oscCreateCount' packages/client/src/tests/compose/materia-canvas.spec.ts` returns 0 — the old raw-count counter is fully removed; only `__linkOscCount` appears.
11. `grep -c 'AudioParam.prototype.setValueAtTime' packages/client/src/tests/compose/materia-canvas.spec.ts` returns at least 1 — confirms the frequency-discriminated spy is present.
      </success_criteria>
      <context_files>
        packages/client/src/tests/compose/materia-canvas.spec.ts
        packages/client/src/components/compose/MateriaCanvas.tsx
        packages/client/src/hooks/useLinkSound.ts
        packages/client/src/constants/canvas.ts
      </context_files>
      <dependencies>NONE — parallel with FE-002</dependencies>
      <out_of_scope>
- Do NOT modify MateriaNode.tsx, CardNode.tsx, MateriaCanvas.tsx, or any production source file.
- Do NOT create new test files — all changes go into the existing materia-canvas.spec.ts.
- Do NOT add `test.skip` for any reason — the whole point of A1 is to remove them.
- Do NOT write a test that asserts ONLY on audio (link sound) without also asserting the DOM edge — G6 forbids sound-as-sole-proxy.
- Do NOT use `[data-testid^="palette-item-agent-"]` anywhere in the spec — this selector matches zero elements. Use section-heading landmarks.
- Do NOT use `[data-testid^="palette-item-skill-"]` — same zero-match problem. Use the Skills h3 landmark.
- Do NOT patch `AudioContext.prototype.createOscillator` for A4 — the old raw-count approach is replaced. Use `AudioParam.prototype.setValueAtTime` with frequency discrimination.
- Do NOT hardcode 880 or 1320 as bare numeric literals in the test source — import `LINK_PRIMARY_FREQ_HZ` and `LINK_SECONDARY_FREQ_HZ` from canvas.ts and pass them into addInitScript as serialized args.
- Do NOT use `__oscCreateCount` anywhere in the spec — it is replaced by `__linkOscCount`.
- Do NOT reset any counter between steps — frequency discrimination eliminates the need for a reset.
- Do NOT modify packages/server or packages/shared.
      </out_of_scope>
      <estimated_new_lines>
Estimated +80 to +120 net new lines in spec file (A3 adds ~30, A4 adds ~40, A1 replaces skip branches with shorter waitFor lines, A2 replaces 1 line). Total within 150-line threshold — no split required. Justification for keeping whole: all 4 advisories are in the same file; splitting would duplicate the file-read cost with no implementation benefit.
      </estimated_new_lines>
      <output_expected>
        <tag>completion_packet</tag>
        <must_contain>
          <item>Confirmation that tsc --noEmit passes (client package)</item>
          <item>Confirmation that npx playwright test passes with 0 failures</item>
          <item>List of all test names in the proximity describe block after changes</item>
          <item>Diff summary: lines added, lines removed from materia-canvas.spec.ts</item>
          <item>Confirmation that grep -c 'palette-item-agent-' returns 0 (broken selector fully removed)</item>
          <item>Confirmation that A4 audio assertion uses __linkOscCount === 2 (frequency-discriminated, not raw count)</item>
          <item>Confirmation that grep -c '__oscCreateCount' returns 0 (old counter fully removed)</item>
          <item>Confirmation that grep -c 'AudioParam.prototype.setValueAtTime' returns at least 1 (frequency spy present)</item>
          <item>Confirmation that LINK_PRIMARY_FREQ_HZ and LINK_SECONDARY_FREQ_HZ are imported from constants/canvas at the top of the spec file</item>
        </must_contain>
        <must_not_contain>
          <item>Any modification to MateriaCanvas.tsx, MateriaNode.tsx, or CardNode.tsx</item>
          <item>Any test.skip() call</item>
          <item>Any assertion that asserts ONLY on audio without a paired DOM edge assertion</item>
          <item>The string 'palette-item-agent-' appearing in the spec file</item>
          <item>The string 'palette-item-skill-' appearing in the spec file</item>
          <item>The string '__oscCreateCount' appearing in the spec file</item>
          <item>Bare numeric literals 880 or 1320 as frequency values in test source (must come from imported constants)</item>
          <item>Any patch of AudioContext.prototype.createOscillator for A4 (replaced by AudioParam.prototype.setValueAtTime)</item>
        </must_not_contain>
        <success_signal>tsc exit 0 + playwright exit 0 confirmed in packet, zero test.skip in proximity describe block, grep 'palette-item-agent-' returns 0, grep '__oscCreateCount' returns 0, grep 'AudioParam.prototype.setValueAtTime' returns at least 1, __linkOscCount === 2 assertion confirmed</success_signal>
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
    - A4 FREQUENCY-DISCRIMINATED SPY (BLOCKER 3 resolved): FE-001 A4 test now patches `AudioParam.prototype.setValueAtTime` and increments `__linkOscCount` only for values 880 Hz (LINK_PRIMARY_FREQ_HZ) or 1320 Hz (LINK_SECONDARY_FREQ_HZ). The 220 Hz approach tone is filtered out. Counter reset is eliminated. Assertion: `__linkOscCount === 2`. The old `__oscCreateCount` / `AudioContext.prototype.createOscillator` approach is fully replaced. A4 was revised twice (PM#2 → PM#3).
    - A4 CONSTANT INJECTION: LINK_PRIMARY_FREQ_HZ and LINK_SECONDARY_FREQ_HZ are imported from canvas.ts at the top of the spec; passed into addInitScript as serialized args. No magic numbers 880/1320 in test source.
    - A4 TIMING RATIONALE (WARNING 2 resolved): FE-001 task packet includes the explicit rationale for why `addInitScript` before navigation is sufficient.
    - WARNING 3 (A5 inline literals): Deferred. The auditor explicitly suggested colocation in handle-style.ts. If a future SA pass flags `1`, `'50%'`, `'translate(-50%, -50%)'` as inline numeric literals against agent-changelog 2026-03-30-1, names can be extracted to `canvas.ts` at that time.
    - A6 path correction: brief says `packages/client/src/lib/loadout/compose.ts` — actual file is `packages/client/src/constants/compose.ts`. This correction is embedded in FE-002 task packet.
    - A7 path correction: brief says `packages/client/src/components/compose/MateriaPalette.tsx` — actual file is `packages/client/src/components/compose/MateriaCanvas.tsx`. This correction is embedded in FE-002 task packet.
    - Append serialization: FE-001 and FE-002 both append to agent changelog. ORC must serialize: FE-001 appends first, FE-002 re-reads and appends after.
  </routing_notes>

  <risk_flags>
    - [RESOLVED] A1 selector regression: `[data-testid^="palette-item-agent-"]` matched zero elements at both existing test sites. Now fixed to use Agents-section h3 landmark in FE-001 task packet. SC#8 enforces grep count = 0 for the broken selector string.
    - [RESOLVED] A6 line off-by-one: line 11 = `META_AGENTS,` (remove); line 12 = `META_FRAGMENTS,` (preserve). FE-002 task packet now carries the exact line map. SC#6 enforces grep verification of both.
    - [RESOLVED] A4 oscillator-arithmetic: raw `__oscCreateCount` reset-and-assert was wrong (playApproach fires during drag, making final count 3 not 2). Replaced with frequency-discriminated spy on `AudioParam.prototype.setValueAtTime`. SC#4 and SC#10-11 now enforce `__linkOscCount === 2`, grep `__oscCreateCount` = 0, grep `AudioParam.prototype.setValueAtTime` >= 1.
    - A4 (constant injection): LINK_PRIMARY_FREQ_HZ and LINK_SECONDARY_FREQ_HZ must be imported from canvas.ts and passed as serialized args — not hardcoded as bare 880/1320 in test source. Risk: FE agent ignores this and writes magic numbers. SC#4 and must_not_contain enforce this.
    - A3 (agent↔skill test): Skill palette items use `data-testid="palette-item-{skill-name}"` — NOT type-prefixed. FE-001 must use the Skills h3 landmark, not `[data-testid^="palette-item-skill-"]`. Risk: FE agent ignores this and writes a zero-match selector; `waitFor` times out in CI.
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
  <generated>2026-04-27T01:15:00Z</generated>
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
        <item>A4 test contains BOTH a DOM edge assertion AND an audio-spy assertion; DOM assertion appears first; audio assertion uses __linkOscCount === 2 (frequency-discriminated, exact); AudioParam.prototype.setValueAtTime patched (not AudioContext.prototype.createOscillator)</item>
        <item>grep -c '__oscCreateCount' materia-canvas.spec.ts returns 0 (old counter fully replaced)</item>
        <item>grep -c 'AudioParam.prototype.setValueAtTime' materia-canvas.spec.ts returns at least 1</item>
        <item>LINK_PRIMARY_FREQ_HZ and LINK_SECONDARY_FREQ_HZ imported from ../../constants/canvas at top of spec file</item>
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
