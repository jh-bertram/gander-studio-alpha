## [STAGE 1] RECEIVED
- **From:** ORC
- **At:** 2026-04-04T00:00:00Z
- **Task ID:** gander-studio-p2-agent-cards-FE-002
- **Message received:**
  > You are implementing task **gander-studio-p2-agent-cards-FE-002** for Gander Studio.
  > Working directory: `/home/jhber/projects/gander-studio-alpha`
  > ## Context — read these files first
  > 1. `packages/client/src/components/compose/MateriaCanvas.tsx` — the file you're modifying
  > 2. `packages/client/src/components/compose/CardNode.tsx` — the component you'll register (created in FE-001b)
  > 3. `packages/client/src/store/canvas-store.ts` — CanvasNode now has `role: AgentRole`
  > 4. `packages/client/src/constants/canvas.ts` — has CARD_WIDTH_PX=900, CARD_HEIGHT_PX=700, Z_CANVAS_NODE
  > 5. `packages/client/src/constants/agent-roles.ts` — AgentRole type
  > ## Your job — modify MateriaCanvas.tsx only
  > Make exactly these changes: [register CardNodeRenderer, add card to NODE_TYPES, add role to MateriaNodeData, update MateriaNodeRenderer, update toRFNode]…[truncated]

## [STAGE 2] PLAN
- **At:** 2026-04-04T00:01:00Z
- **Components to build:** Modifying `/home/jhber/projects/gander-studio-alpha/packages/client/src/components/compose/MateriaCanvas.tsx` only
- **State design:** No new state — CardNode reads from canvas-store directly; toRFNode branched on ORCHESTRATOR_ID
- **tRPC wiring:** No changes
- **A11Y plan:** card node is draggable: false, selectable: false — no additional ARIA needed; MateriaNode role prop is passed through for existing a11y

### Changes planned:
1. Add imports: `CardNode`, `CARD_WIDTH_PX`, `CARD_HEIGHT_PX`, `AgentRole` — check existing imports first
2. Add `CardNodeRenderer` function after `MateriaNodeRenderer`
3. Add `card` entry to `NODE_TYPES`
4. Add `role?: AgentRole` to `MateriaNodeData` type
5. Pass `data.role` to `MateriaNode` in `MateriaNodeRenderer`
6. Update `toRFNode` to branch on orchestrator ID: emit `type: 'card'` with centered position, `draggable: false`, `selectable: false`, `zIndex: 0`; emit `type: 'materia'` with `zIndex: Z_CANVAS_NODE` and `data.role` for other nodes — remove `isOrchestrator: true` path

### Notes from reading the file:
- `CARD_WIDTH_PX` and `CARD_HEIGHT_PX` are NOT currently imported in MateriaCanvas.tsx — must add
- `Z_CANVAS_NODE` IS in canvas.ts but NOT in the current import block in MateriaCanvas.tsx — must add
- `AgentRole` is NOT currently imported — must add as type import
- `MateriaNodeData` is at line 136: `{ name: string; nodeType: 'agent' | 'skill'; onRemove?: () => void }`
- `MateriaNodeRenderer` at line 139 passes `isOrchestrator={data.name === 'orchestrator'}` — must change to `role={data.role}`
- `NODE_TYPES` at line 150 — add card entry
- `toRFNode` at line 156 — orchestrator is checked via `cn.id !== 'orchestrator'` inline string — use `ORCHESTRATOR_ID` constant from canvas-store (already imported via destructuring)
- The store exports `ORCHESTRATOR_ID`? Let me check — canvas-store.ts has `const ORCHESTRATOR_ID = 'orchestrator'` but it's NOT exported. The MateriaCanvas.tsx currently uses the string literal `'orchestrator'` inline. I'll define a local constant or use the string literal for the branch.

### Checkpoint — 23:18:00
- Wrote `packages/client/src/components/compose/MateriaCanvas.tsx` (922 lines). Constant audit: 0 matches. Next: write output file.

## [STAGE 3] COMPLETE
- **At:** 2026-04-04T23:19:01Z
- **Deliverables:**

| File | Lines | Notes |
|------|-------|-------|
| `packages/client/src/components/compose/MateriaCanvas.tsx` | 922 | Modified — 6 targeted changes |
| `.claude/agents/tasks/outputs/gander-studio-p2-agent-cards-FE-002.md` | ~80 | ui_packet output |

- **Lint:** exit code 0 (zero errors)
- **Constant audit:** 0 raw hex values, 0 rgba inline matches, 0 ft/m literals. JSON.parse pre-existing with try/catch + shape validation.
