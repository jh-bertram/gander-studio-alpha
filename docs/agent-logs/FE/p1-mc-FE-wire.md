## [STAGE 3] COMPLETE
- **At:** 2026-03-16T00:05:00Z
- **Deliverables:**

| File | Lines | Notes |
|------|-------|-------|
| `packages/client/src/pages/ComposePage.tsx` | ~900 | Modified — browser panels removed, MateriaCanvas wired, both stores connected |

- **Lint:** exit 0
- **Constant audit:** 0 matches — no raw hex, no raw ft/m factor, no inline rgba violations

### Checkpoint — 00:05:00
- Wrote `packages/client/src/pages/ComposePage.tsx`. Constant audit: 0 matches. All tsc checks: 0 errors.

---

## [STAGE 2] PLAN
- **At:** 2026-03-16T00:01:00Z
- **Components to build:** Modifying `packages/client/src/pages/ComposePage.tsx` only
- **State design:**
  - canvas-store: `useCanvasStore(selectLoadoutPayload)` for agents/skills in save; `loadFromLoadout` and `resetCanvas` for load/new handlers
  - compose-store: keeps name, hooks; agents/skills fields now only used for compose-store.loadLoadout (passed as empty arrays)
- **tRPC wiring:** No changes — existing `agentsQuery`, `skillsQuery`, `hooksQuery`, `saveMutation`, `deleteMutation`, `loadoutsQuery` all preserved
- **A11Y plan:** MateriaCanvas has its own ARIA from the component file. No new ARIA concerns added in this wiring pass.
- **Changes summary:**
  1. Add imports: `MateriaCanvas`, `useCanvasStore`, `selectLoadoutPayload`
  2. Add canvas store bindings at top of component
  3. Change `handleSave` to use `canvasPayload` for agents/skills
  4. Change `handleLoad` to call both stores (compose gets empty agents/skills, canvas gets full loadout)
  5. Change `handleNew` to also call `canvasReset()`
  6. Change `useValidationWarnings` call to pass `canvasPayload.agents` / `canvasPayload.skills`
  7. Remove `SlotGroup` for AGENTS and SKILLS (keep HOOKS SlotGroup)
  8. Remove left browser panel (desktop div.item-browser) and mobile accordion
  9. Wire `MateriaCanvas` into loadout-builder between name input and ValidationWarnings
  10. Remove now-unused imports: `ItemBrowserBody`, `SlotGroup` (if unused), Accordion imports, search state, browser-related constants/props, `handleAdd`
  11. Fix `useValidationWarnings` — currently takes positional args, need to match existing signature or update call site

---

## [STAGE 1] RECEIVED
- **From:** PM (spawning agent)
- **At:** 2026-03-16T00:00:00Z
- **Task ID:** p1-mc-FE-wire
- **Message received:**
  > Modify `packages/client/src/pages/ComposePage.tsx` to replace the old slot-list right panel with `MateriaCanvas`. This is primarily a surgical edit — remove what no longer belongs, wire the new component in. Files to read first: ComposePage.tsx, canvas-store.ts, compose-store.ts, MateriaCanvas.tsx, schemas.ts. Exact changes: new imports, canvas store wiring, handleSave data source change, handleLoad both stores, handleNew both stores, ValidationWarnings data source, remove slot-list right panel, remove ItemBrowserBody panel, wire MateriaCanvas, preserve testids/controls, cleanup unused imports…[truncated]
