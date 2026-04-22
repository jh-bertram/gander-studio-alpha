# Task Output — p1-mc-FE-store

## ui_packet

```xml
<ui_packet task_id="p1-mc-FE-store">
  <status>COMPLETE</status>
  <files_written>
    <file>packages/client/src/store/canvas-store.ts</file>
  </files_written>
  <type_signatures>
export interface CanvasNode {
  id: string;          // unique id — use name for agents/skills (e.g. "orchestrator", "dispatch-task")
  name: string;        // display name
  type: 'agent' | 'skill';
  position: { x: number; y: number };
}

export interface CanvasEdge {
  id: string;          // `${source}--${target}`
  source: string;      // node id
  target: string;      // node id
}
  </type_signatures>
  <selectLoadoutPayload_description>
selectLoadoutPayload(state: CanvasState) is a standalone (non-store) selector function.
It reads `state.nodes` and partitions by `type`:
  - agents: all nodes where type === 'agent', mapped to their `name` field
  - skills: all nodes where type === 'skill', mapped to their `name` field
  - hooks: always returns []

The function accepts the full CanvasState interface so it can be passed directly to
useCanvasStore(selectLoadoutPayload) as a Zustand selector.
  </selectLoadoutPayload_description>
  <loadFromLoadout_description>
loadFromLoadout({ agents, skills, hooks }) implements a two-ring layout:

1. Always places the orchestrator node at { x: 0, y: 0 } as the first node.
2. Agent nodes (agents list minus 'orchestrator') are placed on an inner circle of
   radius 220. For agent at index i of count n:
     angle = (2 * Math.PI * i) / n
     x = round(220 * cos(angle))
     y = round(220 * sin(angle))
3. Skill nodes are placed on an outer ring of radius 380, with an angular offset of
   Math.PI / agentCount to stagger them between agent positions:
     angle = (2 * Math.PI * i) / skillCount + Math.PI / agentCount
     x = round(380 * cos(angle))
     y = round(380 * sin(angle))
4. edges is reset to [] — edge state is ephemeral and not persisted in loadouts.
5. hooks parameter is accepted but ignored (no hook nodes on canvas).
  </loadFromLoadout_description>
  <tsc_output>0 errors (no output produced by tsc --noEmit)</tsc_output>
  <e2e_spec>TIER_1_ONLY — no new UI surface; pure store implementation</e2e_spec>
  <integration_status>SUCCESS — pure Zustand store, no tRPC, no @xyflow/react imports. Constant audit: 0 raw hex values, 0 duplicate inline function bodies, 0 magic numbers outside named constants (AGENT_RING_RADIUS=220, SKILL_RING_RADIUS=380, ORCHESTRATOR_ID='orchestrator' all named).</integration_status>
</ui_packet>
```
