# Task Output: p1-mc-FE-canvas-a

## Summary

Created `packages/client/src/constants/canvas.ts` and `packages/client/src/components/compose/MateriaNode.tsx` per the sprint spec.

## Files Written

| File | Lines | Notes |
|------|-------|-------|
| `packages/client/src/constants/canvas.ts` | 28 | All canvas magic values; no functions |
| `packages/client/src/components/compose/MateriaNode.tsx` | 113 | Presentational orb component; no React Flow |

## getMateriaColor

Imported from `../../constants/compose` — not re-implemented.

## Raw Hex Audit

Two rgba inline values used, both explicitly approved by task spec:
1. `EDGE_GLOW = '0 0 6px rgba(84,153,181,0.5)'` in `canvas.ts` — CSS shadow value mirroring `--gt` token; inline shadow strings cannot reference CSS vars.
2. `inset 0 0 12px rgba(232,200,64,0.25)` in `MateriaNode.tsx` `buildOrbShadow()` — orchestrator inner glow; mirrors `--my` palette role. Also explicitly approved by task spec.

No raw hex `#RRGGBB` values found in either file (confirmed by grep audit).

## TypeScript

Exit code 0 — `npx tsc --noEmit -p packages/client/tsconfig.json` produced no output.

## Constant Audit

- No `rgba(15,15,15` matches
- No `3.28084` / `3.28` conversion factor matches
- No `#RRGGBB` hex literals in `.ts`/`.tsx` files
- No duplicated inline function bodies (single `buildOrbShadow` helper, called once)

## e2e_spec

TIER_1_ONLY — MateriaNode is a standalone presentational component with no page route. It will be covered by a Tier 2 spec when the canvas page surface is wired up in a subsequent task.
