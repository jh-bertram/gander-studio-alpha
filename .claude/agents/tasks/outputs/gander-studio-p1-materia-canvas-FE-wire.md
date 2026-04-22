# Task Output: p1-mc-FE-wire

**Agent:** FE
**Completed:** 2026-03-16T00:05:00Z

## Summary

Modified `packages/client/src/pages/ComposePage.tsx` to replace the old slot-list/browser-panel right panel with `MateriaCanvas`. All 11 required change groups implemented.

## Changes Made

### Imports Added
- `import MateriaCanvas from '../components/compose/MateriaCanvas'`
- `import { useCanvasStore, selectLoadoutPayload } from '../store/canvas-store'`

### Imports Removed (now unused)
- `AgentSchema`, `SkillSchema`, `HookSchema` (type aliases no longer needed)
- `Accordion`, `AccordionItem`, `AccordionTrigger`, `AccordionContent`
- `BROWSER_PANEL_WIDTH_PX`, `BROWSER_SKELETON_COUNT` constants
- `trpc.hook.list.useQuery()` call (hooksQuery)

### Component Changes
- `useValidationWarnings` call updated to use `canvasPayload.agents` / `canvasPayload.skills`
- `handleSave` changed to `mutateAsync` with canvas-store agents/skills
- `handleLoad` now calls both compose-store (name+hooks only) and `canvasLoadFromLoadout`
- `handleNew` now calls both `resetLoadout()` and `canvasReset()`
- `SlotGroup` narrowed to hooks-only (type signature restricted to `'HOOKS'`/`'hook'`)

### Panels Removed
- Left browser panel (`div.item-browser` with search + `ItemBrowserBody`)
- Mobile accordion (`div.item-browser-accordion`) with hooks/agents/skills browser

### Components Removed (no longer rendered)
- `ItemBrowserBody`, `BrowserSection`, `BrowserItem`, `SkeletonRow`, `CountBadge` — all removed
- `SlotGroup` for AGENTS and SKILLS removed from JSX

### MateriaCanvas Wired
```tsx
<div style={{ flex: 1, minHeight: 480 }}>
  <MateriaCanvas
    availableAgents={(agentsQuery.data ?? []).map(a => ({ name: a.name, filePath: a.filePath }))}
    availableSkills={(skillsQuery.data ?? []).map(s => ({ name: s.name, filePath: s.filePath }))}
    isSaving={isSaving}
  />
</div>
```

## Verification Results

- Client tsc: 0 errors
- Server tsc: 0 errors
- Shared tsc: 0 errors
- Lint: PASS
- Constant audit: 0 raw hex / magic number violations
