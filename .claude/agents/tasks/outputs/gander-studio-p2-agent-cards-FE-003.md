# ui_packet — gander-studio-p2-agent-cards-FE-003

## Task Confirmation
Task ID confirmed: `gander-studio-p2-agent-cards-FE-003`

## Files Modified

| File | Change |
|------|--------|
| `packages/client/src/components/compose/MateriaCanvas.tsx` | Rewrote `LoadoutListPanel` function in-place |
| `packages/client/tests/e2e/loadout-list-panel.spec.ts` | Updated 3 tests, added 3 new tests (114 lines total) |

---

## Checklist

- [x] LoadoutListPanel rewritten in MateriaCanvas.tsx (in-place, same file)
- [x] Card header row: `aria-label="Card: {cardTitle}"`, NO `role="button"`, NO `tabIndex`, NO `onKeyDown`
- [x] Agent rows: `role="button"`, `tabIndex={0}`, `aria-label="Select {name} on canvas"`, `onKeyDown` Enter/Space
- [x] Child skill rows indented by `LIST_CHILD_INDENT_PX` (24px constant from canvas.ts)
- [x] Dot colors use `getMateriaColor(node.name, node.type, node.role)` — 3-param call throughout
- [x] Unconnected skills shown at bottom; connected skills excluded from unconnected section (no duplication)
- [x] Panel heading changed to "Loadout" (was "Canvas Nodes")
- [x] `data-testid="loadout-list-panel"` still present on the `<aside>` wrapper
- [x] No raw hex values in modified code
- [x] `cardTitle` read from `useCanvasStore` directly inside LoadoutListPanel
- [x] Tree logic: orchestrator → card header; non-orchestrator agents → roots; skills connected to agent → children; skills with zero edge connections → unconnected section

---

## Spec Verification

### grep result — no "Select orchestrator on canvas" references
```
PASS: no references
```
(grep returned exit code 1 — no matches found)

### wc -l result
```
114 packages/client/tests/e2e/loadout-list-panel.spec.ts
```
114 >= 73 — PASS

### Spec summary
- Test 1: Panel visible, card header present
- Test 2: Click first `[role="button"]` row (not card header) — no errors
- Test 3: Keyboard nav — focus first agent row, press Enter — no errors
- Test 4 (new): Card header has no `role="button"`, no interactive orchestrator row
- Test 5 (new): Agent rows as roots — card header visible, no orchestrator button
- Test 6 (new): Unconnected skills section — no JS errors, no interactive orchestrator row

---

## npm run lint

```
(exit code 0 — zero errors)
tsc --noEmit --project packages/shared/tsconfig.json && 
tsc --noEmit --project packages/server/tsconfig.json && 
tsc --noEmit --project packages/client/tsconfig.json
```
All packages type-check cleanly.

---

## Constant Audit

```bash
# Raw hex in modified files: 0 matches
grep -n "#[0-9a-fA-F]{6}" packages/client/src/components/compose/MateriaCanvas.tsx
# Output: (none)

# rgba(15,15,15 — 0 matches
grep -n "rgba(15,15,15" packages/client/src/components/compose/MateriaCanvas.tsx
# Output: (none)
```

All numeric values in `LoadoutListPanel` reference named constants from `canvas.ts`:
- `LIST_PANEL_WIDTH_PX`, `LIST_ROW_MIN_HEIGHT_PX`, `LIST_ROW_PADDING_BLOCK_PX`
- `LIST_ROW_PADDING_INLINE_PX`, `LIST_ROW_GAP_PX`, `LIST_ROW_BORDER_RADIUS_PX`
- `LIST_ROW_MARGIN_BOTTOM_PX`, `LIST_DOT_SIZE_PX`, `LIST_HEADING_FONT_SIZE_PX`
- `LIST_HEADING_MARGIN_BOTTOM_PX`, `LIST_NAME_FONT_SIZE_PX`, `LIST_CHILD_INDENT_PX`
- `LIST_EMPTY_FONT_SIZE_PX`, `LIST_EMPTY_PADDING_PX`, `LIST_TRANSITION_DURATION_MS`

No constant violations found.

---

<ui_packet>
  <components_created>
    - packages/client/src/components/compose/MateriaCanvas.tsx (LoadoutListPanel rewritten in-place)
    - packages/client/tests/e2e/loadout-list-panel.spec.ts (updated — 6 tests, 114 lines)
  </components_created>
  <state_hydration_map>
    LoadoutListPanel reads cardTitle from useCanvasStore((s) => s.cardTitle) directly.
    nodes and edges props flow from MateriaCanvasInner via storeNodes/storeEdges (Zustand selectors).
    No tRPC procedures involved — panel is pure canvas-store consumer.
  </state_hydration_map>
  <a11y_verification>
    - Card header: aria-label="Card: {cardTitle}", no role, no tabIndex, no keyboard handler — non-interactive
    - Agent rows: role="button", tabIndex={0}, aria-label="Select {name} on canvas", onKeyDown handles Enter and Space
    - Child skill rows: same interactive pattern, indented by LIST_CHILD_INDENT_PX
    - Unconnected skill rows: same interactive pattern, no indent
    - Panel heading "Loadout" uses uppercase via CSS textTransform
    - focus-visible outline: 2px solid var(--mt), offset -2px (via .loadout-list-row:focus-visible CSS)
    - Empty state: rendered as plain text when no content nodes present
  </a11y_verification>
  <design_tokens_used>
    - var(--sfm): panel background
    - var(--sfh): row hover background
    - var(--bd): border, dot box-shadow
    - var(--wm): muted text color (heading, empty state)
    - var(--wd): primary text color (node names)
    - var(--mt): focus outline color
    - getMateriaColor(name, type, role): dot colors — resolves to var(--my), var(--mg), var(--mr), var(--mp), var(--mb)
    - No raw hex values used
  </design_tokens_used>
  <integration_status>
    SUCCESS — all canvas-store fields (nodes, edges, cardTitle) consumed correctly.
    getMateriaColor 3-param signature confirmed in compose.ts (role: AgentRole optional param added in prior task).
    CanvasNode.role field confirmed in canvas-store.ts.
    LIST_CHILD_INDENT_PX = 24 confirmed in canvas.ts.
  </integration_status>
</ui_packet>

---

## e2e_spec

`packages/client/tests/e2e/loadout-list-panel.spec.ts` — updated in-place (Tier 2 spec extension)
