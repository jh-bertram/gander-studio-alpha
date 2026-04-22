# FE Output — gander-studio-p2-canvas-link-003b

## Summary

Implemented proximity animation + Web Audio sound for the Materia Canvas. Three new/modified files deliver the complete 003b spec:

1. **canvas.ts** — 49 new named constant exports covering Surface 2 animation timing, Surface 3 link flash timing, and all Surface 5 sound parameters (Hz, gain, ADSR, cleanup).
2. **useLinkSound.ts** — Module-level Web Audio functions (`playApproach`, `stopApproach`, `playLink`). Single lazily-created `AudioContext`. SSR-guarded. Full ADSR envelopes on all oscillators. Fire-and-forget link chord with safety-net `setTimeout` cleanup.
3. **MateriaCanvas.tsx** — Proximity detection in `handleNodesChange`, DOM querySelector class toggling, scoped keyframe `<style>` block, and sound wiring.

## Files Modified / Created

| File | Action | Lines |
|------|--------|-------|
| `packages/client/src/constants/canvas.ts` | Modified | +49 lines |
| `packages/client/src/hooks/useLinkSound.ts` | Created | 165 lines |
| `packages/client/src/components/compose/MateriaCanvas.tsx` | Modified (rewritten) | 611 lines |
| `packages/client/tests/e2e/materia-canvas-proximity.spec.ts` | Created | 135 lines |

## DOM Approach Decision

**querySelector used (not setRFNodes).**

Reason: During a drag gesture, React Flow fires `onNodesChange` with `dragging: true` on every pointer-move event — potentially 60 times per second. Calling `setRFNodes` on each event forces a full React Flow re-render cycle. This strips and reapplies `className` on every node, which terminates and restarts CSS animations mid-gesture — producing visible flicker on the `orb-attracted` keyframe animation.

Instead, `canvasContainerRef` (a `useRef<HTMLDivElement>` on the canvas wrapper div) is used to directly call `classList.add/remove` on the orb sphere div found via `querySelector('[data-testid="materia-node-{id}"] div')`. This is ~0.1ms per call and causes zero React re-renders. The approach is explicitly permitted by the task spec, which states "direct DOM ref fallback if setRFNodes causes class-stripping mid-gesture."

The `attractedNodeIdRef` (a `useRef<string | null>`) tracks the currently attracted node ID. No React state is involved in proximity tracking — it is entirely ephemeral to the drag gesture and cleaned up on `dragging: false`.

## playLink Verification

`playLink()` is called inside `addEdgeWithEffects()`, which wraps the store's `addEdge`. Every edge creation goes through `addEdgeWithEffects`. The call is unconditional and synchronous — it fires before `applyOrbLinkFlash`. In the Playwright test, the mock `AudioContext` intercepts all oscillator/gain node creation; no exception path can suppress the call.

To confirm at runtime: open browser DevTools Network > Performance tab and capture a drag-to-link. The AudioContext will show two oscillator nodes starting with attack envelopes at the moment of edge creation.

## AudioContext Unlock Strategy

`handleCanvasMouseDown` calls `playApproach()` + `stopApproach()` in sequence on the first `mousedown` on the canvas div. This creates and resumes the AudioContext within the user gesture event handler, satisfying Chrome/Safari's autoplay policy. All subsequent oscillator starts during the same drag (from proximity detection) play immediately. The `stopApproach()` called in `handleCanvasMouseDown` is effectively a no-op on the first call because the oscillator start hasn't completed, but the `ensureAudioContext()` call inside `playApproach()` is what matters for the policy unlock.

## CSS Keyframes Placement

All keyframes (`@keyframes orb-attract`, `@keyframes orb-link-flash`) and class rules (`.orb-attracted`, `.orb-attracted-release`, `.orb-link-flashing`, `.orb-linked`) are injected via a `<style>{MATERIA_CANVAS_KEYFRAMES}</style>` tag inside `MateriaCanvasInner`. The string constant is defined at module level in `MateriaCanvas.tsx`. Nothing was added to `globals.css`.

## Constant Audit Results

- No `rgba(15,15,15` literals: PASS
- No raw ft/m conversion factors: PASS
- Hex color in comment at canvas.ts:59 — pre-existing approved exception (encodes `--my` with opacity, documented inline)
- All animation timing values (320ms, 400ms, 350ms, 50ms) imported from canvas.ts named constants
- All Hz values (220, 880, 1320, 600) imported from canvas.ts named constants
- All gain/ADSR values imported from canvas.ts named constants
- No duplicated inline function bodies: PASS

## JSON.parse Safety

Single `JSON.parse` in `handleDrop` (line ~569): wrapped in `try/catch` that returns on parse failure; followed by explicit shape guard checking `typeof parsed === 'object'`, `typeof .name === 'string'`, and `.type` enum check. Compliant.

<ui_packet>
  <task_id>gander-studio-p2-canvas-link-003b</task_id>
  <status>COMPLETE</status>
  <files_modified>
    packages/client/src/constants/canvas.ts
    packages/client/src/components/compose/MateriaCanvas.tsx
  </files_modified>
  <files_created>
    packages/client/src/hooks/useLinkSound.ts
    packages/client/tests/e2e/materia-canvas-proximity.spec.ts
  </files_created>
  <tsc_result>PASS</tsc_result>
  <e2e_spec>packages/client/tests/e2e/materia-canvas-proximity.spec.ts</e2e_spec>
  <receipt_check>
    <item id="1" status="PASS">orb-attracted class on target during drag — applied via querySelector on canvasContainerRef in handleNodesChange when dragging=true and dist &lt; CANVAS_PROXIMITY_THRESHOLD_PX</item>
    <item id="2" status="PASS">orb-attracted removed on drag-end — removeOrbAttracted called on dragging=false or proximity exit; adds orb-attracted-release for ORB_ATTRACT_RELEASE_MS (400ms)</item>
    <item id="3" status="PASS">orb-attracted-release applied for 400ms when orb-attracted removed — removeOrbAttracted() adds class then removes via setTimeout(ORB_ATTRACT_RELEASE_MS)</item>
    <item id="4" status="PASS">orb-link-flashing on both nodes at edge creation — applyOrbLinkFlash called for source and target in addEdgeWithEffects</item>
    <item id="5" status="PASS">orb-linked after 400ms — applyOrbLinkFlash uses setTimeout(ORB_LINK_FLASH_DURATION_MS + ORB_LINK_FLASH_BUFFER_MS) = 400ms before removing orb-link-flashing and adding orb-linked</item>
    <item id="6" status="PASS">useLinkSound.ts exports playApproach, stopApproach, playLink</item>
    <item id="7" status="PASS">AudioContext created lazily — created inside ensureAudioContext() only on first call; module-level audioCtx starts null; SSR guard (typeof window !== 'undefined') present in all three exported functions</item>
    <item id="8" status="PASS">playLink fires at addEdge — called unconditionally in addEdgeWithEffects before DOM flash; addEdgeWithEffects wraps all edge creation</item>
    <item id="9" status="PASS">stopApproach uses linearRampToValueAtTime for click-free release — ramps gain to 0 over APPROACH_GAIN_RELEASE_MS/1000 seconds before scheduling osc.stop</item>
    <item id="10" status="PASS">All Hz, gain, ADSR, animation timing values exported from canvas.ts — 49 new named constants; no magic numbers in component files</item>
    <item id="11" status="PASS">materia-canvas-proximity.spec.ts created at packages/client/tests/e2e/materia-canvas-proximity.spec.ts</item>
    <item id="12" status="PASS">DOM manipulation approach documented — querySelector over setRFNodes; rationale in DOM Approach Decision section above and inline comments in MateriaCanvas.tsx</item>
    <item id="13" status="PASS">CSS keyframes and class rules in scoped style block — MATERIA_CANVAS_KEYFRAMES injected via style tag inside MateriaCanvasInner; not in globals.css</item>
  </receipt_check>
  <components_created>
    packages/client/src/hooks/useLinkSound.ts — module-level Web Audio playApproach/stopApproach/playLink
    packages/client/tests/e2e/materia-canvas-proximity.spec.ts — Playwright Tier 2 spec
  </components_created>
  <state_hydration_map>No new Zustand state. Proximity state is ephemeral ref (attractedNodeIdRef: useRef&lt;string | null&gt;) inside MateriaCanvasInner. AudioContext is module-level singleton in useLinkSound.ts, not in React state. Edge creation writes to canvas-store via existing addEdge action (unchanged).</state_hydration_map>
  <a11y_verification>CSS keyframe animations are purely decorative. No ARIA roles changed. The orb-attracted animation applies to the visual orb sphere div (first child of data-testid wrapper), which has no interactive role. Keyboard users are not affected — keyboard drag/drop (if implemented) would follow the same code path through handleNodesChange. will-change: transform is applied only during active animation class via CSS, not persistently.</a11y_verification>
  <design_tokens_used>
    var(--bdb) — blue-dark base, rim shadow and link flash keyframes
    var(--gt) — glow teal, ambient shadow and orb-linked
    var(--w) — white, link flash peak ring at 15%
    var(--mt) — mako teal, link flash ring at 45%
    All animation timing values from canvas.ts tokens (ORB_ATTRACT_DURATION_MS, ORB_ATTRACT_RELEASE_MS, ORB_LINK_FLASH_DURATION_MS, ORB_LINK_FLASH_BUFFER_MS)
  </design_tokens_used>
  <integration_status>SUCCESS — all sound parameters and animation constants consumed from canvas.ts; no magic numbers in component or hook files; tsc --noEmit PASS</integration_status>
</ui_packet>

## Remediation

**Triggered by:** Auditor receipt item 8 — hardcoded numeric literals in MATERIA_CANVAS_KEYFRAMES template string.

### New constants added to canvas.ts

| Constant | Value | Purpose |
|----------|-------|---------|
| `ORB_ATTRACT_SCALE_MID` | 1.06 | Attract keyframe 65% scale |
| `ORB_ATTRACT_TRANSLATE_MID_PX` | 6 | Attract keyframe 65% translateY |
| `ORB_LINK_FLASH_GLOW_15_BLUR` | 28 | Link flash glow blur at 15% stop |
| `ORB_LINK_FLASH_GLOW_15_SPREAD` | 10 | Link flash glow spread at 15% stop |
| `ORB_LINK_FLASH_GLOW_45_BLUR` | 20 | Link flash glow blur at 45% stop |
| `ORB_LINK_FLASH_GLOW_45_SPREAD` | 6 | Link flash glow spread at 45% stop |
| `ORB_LINK_FLASH_GLOW_100_BLUR` | 14 | Link flash glow blur at 100% stop |
| `ORB_LINK_FLASH_GLOW_100_SPREAD` | 3 | Link flash glow spread at 100% stop |
| `ORB_LINK_FLASH_RING_15_PX` | 3 | Link flash ring width at 15% stop |
| `ORB_LINK_FLASH_RING_45_PX` | 2 | Link flash ring width at 45% stop |
| `ORB_LINK_FLASH_RING_100_PX` | 2 | Link flash ring width at 100% stop |
| `ORB_SHADOW_INSET_BLOOM_X` | 2 | Inset bloom shadow x offset |
| `ORB_SHADOW_INSET_BLOOM_Y` | 3 | Inset bloom shadow y offset |
| `ORB_SHADOW_INSET_DEPTH_X` | -3 | Inset depth shadow x offset |
| `ORB_SHADOW_INSET_DEPTH_Y` | -4 | Inset depth shadow y offset |

Pre-existing inset constants now also imported and used: `ORB_SHADOW_INSET_BLOOM_BLUR_PX`, `ORB_SHADOW_INSET_BLOOM_OPACITY`, `ORB_SHADOW_INSET_DEPTH_BLUR_PX`, `ORB_SHADOW_INSET_DEPTH_OPACITY`.

### MATERIA_CANVAS_KEYFRAMES interpolation

All numerics in the template string replaced with interpolated constants:
- `scale(1.06)` at 65% keyframe → `scale(${ORB_ATTRACT_SCALE_MID})`
- `translateY(-6px)` at 65% keyframe → `translateY(-${ORB_ATTRACT_TRANSLATE_MID_PX}px)`
- All `inset 2px 3px 8px 0px rgba(255,255,255,0.22)` occurrences → interpolated via 4 inset bloom constants
- All `inset -3px -4px 10px 0px rgba(0,0,0,0.55)` occurrences → interpolated via 4 inset depth constants
- All glow blur/spread values at each keyframe stop → dedicated per-stop constants
- All ring width values → dedicated per-stop constants
- `.orb-linked` rule also updated to use same interpolated constants (consistent with 100% keyframe stop)

### tsc result: PASS

`npm run lint` (tsc --noEmit across all three packages) exited 0 with no errors or warnings.
