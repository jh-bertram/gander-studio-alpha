# ui_packet — gander-studio-p2-agent-cards-FE-001b

## Summary

Task: Create `CardNode.tsx` component and `card-node-title-edit.spec.ts` Playwright tests.

---

## CardNode.tsx

**File path:** `packages/client/src/components/compose/CardNode.tsx`

**data-testid confirmations:**
- `data-testid="card-node"` — outer wrapper div (line 135)
- `data-testid="card-title-display"` — display span (line 99)
- `data-testid="card-title-input"` — edit input (line 85)

**Dimensions (all from named constants):**
- `width: CARD_WIDTH_PX` (900) — from `canvas.ts`
- `height: CARD_HEIGHT_PX` (700) — from `canvas.ts`
- Header `height: CARD_HEADER_HEIGHT_PX` (36) — from `canvas.ts`
- `borderRadius: CARD_BORDER_RADIUS_PX` (8) — from `canvas.ts`
- `HEADER_PADDING_INLINE_PX = 12` — local constant, single use
- `CARD_BORDER_WIDTH_PX = 1` — local constant for audit compliance
- `TITLE_FONT_SIZE_PX = 13` — local constant

**Colors (CSS vars only, no hex):**
- `var(--sfm)` — outer background
- `var(--bdb)` — border color
- `var(--sf)` — header background
- `var(--my)` — title text (yellow)

---

## Self-Grep Result (CLEAN)

```
grep -nP '\d+px|\d+\.\d+|rgba\(' packages/client/src/components/compose/CardNode.tsx
```

Output:
```
17:// Card border width (px) — standard 1px border, named for audit compliance.
```

Only match is a code comment. No raw px literals in style values. CLEAN.

Hex check:
```
grep -n "#[0-9a-fA-F]{6}" packages/client/src/components/compose/CardNode.tsx
```
Output: CLEAN — no hex values.

---

## card-node-title-edit.spec.ts

**File path:** `packages/client/tests/e2e/card-node-title-edit.spec.ts`

**Three tests:**
1. `'card node is visible on canvas'` — navigates to compose page, waits for materia-canvas, asserts card-node visible
2. `'inline title edit: click → type → blur → title persisted'` — clicks display span, types new title, blurs, asserts display span shows new title and input is hidden
3. `'no JS errors during title edit — Escape cancels'` — captures JS errors, clicks span, types, presses Escape, asserts original title restored and no errors

---

## npm run lint Output

```
> lint
> tsc --noEmit --project packages/shared/tsconfig.json && tsc --noEmit --project packages/server/tsconfig.json && tsc --noEmit --project packages/client/tsconfig.json
```

Exit code: 0 — PASS. Zero errors across all three packages.

---

## MateriaCanvas.tsx Changes

No changes made to `MateriaCanvas.tsx`. Confirmed.

---

## Checklist Verification

- [x] `CardNode.tsx` exists with `data-testid="card-node"` on outer div
- [x] Dimensions use CARD_WIDTH_PX and CARD_HEIGHT_PX constants (not raw numbers)
- [x] Header height uses CARD_HEADER_HEIGHT_PX constant
- [x] Border-radius uses CARD_BORDER_RADIUS_PX constant
- [x] `data-testid="card-title-display"` on the span
- [x] `data-testid="card-title-input"` on the input
- [x] `aria-label="Edit card title"` on the input
- [x] Escape cancels edit without saving
- [x] Self-grep returns no raw px/rgba literals in style values
- [x] No hex values in CardNode.tsx
- [x] No MateriaCanvas.tsx changes
- [x] `card-node-title-edit.spec.ts` exists with 3 tests
- [x] npm run lint PASS (output included above)

---

<ui_packet>
  <components_created>
    packages/client/src/components/compose/CardNode.tsx
    packages/client/tests/e2e/card-node-title-edit.spec.ts
  </components_created>
  <state_hydration_map>
    cardTitle and setCardTitle consumed directly from useCanvasStore (Zustand).
    Default value 'The Orchestrator' is set in the store initializer in canvas-store.ts.
    No server data involved — purely client-side state.
    Local editing/draft state is component-local (useState), not persisted to the store.
  </state_hydration_map>
  <a11y_verification>
    - aria-label="Edit card title" on the input element
    - autoFocus on input ensures keyboard users don't need extra interaction after clicking
    - Escape key cancels without side effects; Enter key commits
    - onBlur commits so focus-transfer via Tab also saves
    - span has cursor: pointer so pointer users get a visual affordance
    - Semantic elements: span for display, input for editing
  </a11y_verification>
  <design_tokens_used>
    --sfm (outer card background)
    --bdb (card border color)
    --sf (header background)
    --my (title text — yellow, matches crown/orchestrator semantic)
    All four from globals.css :root — no raw hex or rgba values in component styles.
  </design_tokens_used>
  <integration_status>SUCCESS — component is fully self-contained. No tRPC calls.
    No MateriaCanvas.tsx changes. Lint passes zero errors.
    NOTE: CardNode is not yet registered in React Flow (that is FE-002). The Playwright
    tests for card-node visibility depend on CardNode being rendered on the compose page,
    which requires FE-002 to place it. Tests are written correctly against the spec but
    will only pass after FE-002 wires the component into the canvas.
  </integration_status>
  <e2e_spec>packages/client/tests/e2e/card-node-title-edit.spec.ts</e2e_spec>
  <position_fixed_confirmed>N/A — no Chart.js external tooltip callbacks in this task.</position_fixed_confirmed>
  <data_contract_verified>N/A — no named data fields from appData or external JSON accessed.</data_contract_verified>
</ui_packet>
