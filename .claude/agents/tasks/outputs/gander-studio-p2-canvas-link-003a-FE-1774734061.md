# FE Output — gander-studio-p2-canvas-link-003a

## Summary

Replaced the flat CSS circle in MateriaNode with a glassy 3D sphere. Updated `toRFEdge` in MateriaCanvas to apply animated edge glow. Extracted all new numeric CSS values as named constants in `canvas.ts`.

## Files Modified

### `packages/client/src/constants/canvas.ts`
Added 18 new named exports:
- `EDGE_FILTER` — `drop-shadow(0px 0px 4px var(--bdb))`
- Gradient stops: `ORB_GRADIENT_LIGHT_STOP`, `ORB_GRADIENT_MID_STOP`, `ORB_GRADIENT_DARK_STOP`, `ORB_GRADIENT_DEEPEST_STOP`
- Highlight child div: `ORB_HIGHLIGHT_TOP_PX` (8), `ORB_HIGHLIGHT_LEFT_PX` (8), `ORB_HIGHLIGHT_GRADIENT`
- Shadow numerics: `ORB_SHADOW_RIM_BLUR_PX` (10), `ORB_SHADOW_RIM_SPREAD_PX` (2), `ORB_SHADOW_AMBIENT_BLUR_PX` (20), `ORB_SHADOW_AMBIENT_SPREAD_PX` (4), `ORB_SHADOW_INSET_BLOOM_BLUR_PX` (8), `ORB_SHADOW_INSET_BLOOM_OPACITY` (0.22), `ORB_SHADOW_INSET_DEPTH_BLUR_PX` (10), `ORB_SHADOW_INSET_DEPTH_OPACITY` (0.55)
- Orchestrator rim: `ORB_SHADOW_ORC_RIM_1`, `ORB_SHADOW_ORC_RIM_2`
- Hover: `ORB_HOVER_TRANSITION_MS` (150), `ORB_HOVER_RIM_SPREAD_PX` (4), `ORB_HOVER_AMBIENT_SPREAD_PX` (6)

### `packages/client/src/components/compose/MateriaNode.tsx`
- Removed `backgroundColor` from `orbStyle`
- Added `background: buildOrbGradient()` — radial-gradient with `color-mix()` stops anchored to `--orb-color`
- Set `--orb-color` via inline style on the orb div: `{ '--orb-color': getMateriaColor(name, type), ...orbStyle }`
- Added `div.orb-highlight` absolutely positioned child div (top 8px, left 8px, 38% width, 26% height) with `aria-hidden="true"` and `pointerEvents: 'none'`
- Added `useState(false)` for hover state; `handleMouseEnter` / `handleMouseLeave` named module-level functions set it
- `buildOrbShadow()` now takes `hovered: boolean` — spreads expand from 2→4px (rim) and 4→6px (ambient) on hover
- `transition: box-shadow 150ms ease-out` added to orbStyle
- Orchestrator variant: outer rim layers replaced with `ORB_SHADOW_ORC_RIM_1` / `ORB_SHADOW_ORC_RIM_2` (yellow toned)
- All existing `data-testid`, `aria-label`, remove button behavior, `className` prop, `ORB_SIZE_PX` / `ORB_SIZE_ORCHESTRATOR_PX` preserved

### `packages/client/src/components/compose/MateriaCanvas.tsx`
- `toRFEdge` only: added `EDGE_FILTER` to imports from `canvas.ts`
- Added `filter: EDGE_FILTER` to edge style object
- Changed `animated: false` to `animated: true`

## Files Created

### `packages/client/src/tests/e2e/gander-studio-p2-canvas-link-003a.spec.ts`
Three-test Playwright spec:
1. Load test — compose page visible, materia canvas and orchestrator node render
2. Primary interaction — orchestrator orb has `radial-gradient` background (not plain color) and specular highlight child is attached
3. Empty/error state — palette search with no-match query shows empty state messages for both agents and skills sections

## Constant Audit Results

- `rgba(15,15,15` — 0 matches in modified files
- `3.28084|3.28` — 0 matches in modified files
- Raw hex `#[0-9a-fA-F]{6}` — 0 code matches in modified files (1 comment in canvas.ts: `--my (#e8c840 = rgb(232,200,64))` — comment only, not a code value)
- `rgba(255,255,255,X)` in MateriaNode — used exclusively via `ORB_SHADOW_INSET_BLOOM_OPACITY` and `ORB_SHADOW_INSET_DEPTH_OPACITY` constants; approved exception per spec (white opacity stops inside box-shadow list)
- `JSON.parse` — 0 matches in files I created or modified

## Function Deduplication Audit

- `handleMouseEnter` and `handleMouseLeave` are named module-level functions, not duplicated inline arrows
- `buildOrbShadow`, `buildOrbGradient`, `buildInsetShadows` each appear exactly once as module-level named functions
- No identical inline function bodies duplicated across elements

## Build / Lint

Bash was denied by user permission mode. Lint result: UNABLE TO VERIFY. The task prompt instructs the spawning agent to note this in routing_notes for lint-critical paths when Bash is denied. All TypeScript is strict-compliant by inspection: all constants exported as typed values, all imports resolved, no `any`, all function signatures annotated.

## Out of Scope Confirmed

- No proximity animation (no `.orb-attracted` class, no drag handlers)
- No sound (no `useLinkSound`, no `AudioContext`)
- No `LoadoutListPanel`
- No `canvas-store.ts` or `ComposePage.tsx` changes
- No server files
- No `globals.css` keyframes
