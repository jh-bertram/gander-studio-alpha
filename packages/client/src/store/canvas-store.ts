import { create } from 'zustand';
import type { z } from 'zod';
import type { LoadoutSchema } from '@gander-studio/shared';
import {
  AgentRole,
  META_AGENTS, SPECIALIST_AGENTS, GATE_AGENTS, EXTERNAL_AGENTS,
  META_FRAGMENTS, SPECIALIST_FRAGMENTS, GATE_FRAGMENTS, EXTERNAL_FRAGMENTS,
} from '../constants/agent-roles';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface CanvasNode {
  id: string;          // unique id — use name for agents/skills (e.g. "orchestrator", "dispatch-task")
  name: string;        // display name
  type: 'agent' | 'skill';
  role: AgentRole;
  position: { x: number; y: number };
}

export interface CanvasEdge {
  id: string;          // `${source}--${target}`
  source: string;      // node id
  target: string;      // node id
}

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

const ORCHESTRATOR_ID = 'orchestrator';
const AGENT_RING_RADIUS = 220;
const SKILL_RING_RADIUS = 380;

const INITIAL_ORCHESTRATOR: CanvasNode = {
  id: ORCHESTRATOR_ID,
  name: ORCHESTRATOR_ID,
  type: 'agent',
  role: 'meta',
  position: { x: 0, y: 0 },
};

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function circlePosition(index: number, count: number, radius: number, angleOffset = 0): { x: number; y: number } {
  const angle = (2 * Math.PI * index) / count + angleOffset;
  return {
    x: Math.round(radius * Math.cos(angle)),
    y: Math.round(radius * Math.sin(angle)),
  };
}

function edgeId(source: string, target: string): string {
  return `${source}--${target}`;
}

export function deriveRole(name: string, type: 'agent' | 'skill'): AgentRole {
  if (type === 'skill') return 'skill';
  const lower = name.toLowerCase();
  if (META_AGENTS.has(lower))       return 'meta';
  if (SPECIALIST_AGENTS.has(lower)) return 'specialist';
  if (GATE_AGENTS.has(lower))       return 'gate';
  if (EXTERNAL_AGENTS.has(lower))   return 'external';
  // Fallback: partial-name fragments
  if (META_FRAGMENTS.some((f) => lower.includes(f)))        return 'meta';
  if (SPECIALIST_FRAGMENTS.some((f) => lower.includes(f)))  return 'specialist';
  if (GATE_FRAGMENTS.some((f) => lower.includes(f)))        return 'gate';
  if (EXTERNAL_FRAGMENTS.some((f) => lower.includes(f)))    return 'external';
  return 'specialist'; // default fallback for unrecognised agent names
}

// ─────────────────────────────────────────────────────────────────────────────
// State interface
// ─────────────────────────────────────────────────────────────────────────────

type LoadoutInput = z.infer<typeof LoadoutSchema>;

interface CanvasState {
  nodes: CanvasNode[];
  edges: CanvasEdge[];
  cardTitle: string;
  addNode: (node: CanvasNode) => void;
  removeNode: (id: string) => void;
  updateNodePosition: (id: string, position: { x: number; y: number }) => void;
  addEdge: (source: string, target: string) => void;
  removeEdge: (id: string) => void;
  loadFromLoadout: (loadout: LoadoutInput) => void;
  resetCanvas: () => void;
  setCardTitle: (title: string) => void;
}

// ─────────────────────────────────────────────────────────────────────────────
// Store
// ─────────────────────────────────────────────────────────────────────────────

export const useCanvasStore = create<CanvasState>()((set) => ({
  nodes: [{ ...INITIAL_ORCHESTRATOR }],
  edges: [],
  cardTitle: 'The Orchestrator',

  addNode: (node) =>
    set((state) => {
      if (state.nodes.some((n) => n.id === node.id)) return state;
      return { nodes: [...state.nodes, node] };
    }),

  removeNode: (id) => {
    if (id === ORCHESTRATOR_ID) return; // orchestrator cannot be removed
    set((state) => ({
      nodes: state.nodes.filter((n) => n.id !== id),
      edges: state.edges.filter((e) => e.source !== id && e.target !== id),
    }));
  },

  updateNodePosition: (id, position) =>
    set((state) => ({
      nodes: state.nodes.map((n) =>
        n.id === id ? { ...n, position } : n,
      ),
    })),

  addEdge: (source, target) =>
    set((state) => {
      const eid = edgeId(source, target);
      if (state.edges.some((e) => e.id === eid)) return state;
      return {
        edges: [...state.edges, { id: eid, source, target }],
      };
    }),

  removeEdge: (id) =>
    set((state) => ({
      edges: state.edges.filter((e) => e.id !== id),
    })),

  loadFromLoadout: ({ agents, skills, connections, cardTitle }) => {
    const otherAgents = agents.filter((a) => a !== ORCHESTRATOR_ID);
    const agentCount = otherAgents.length;
    const skillCount = skills.length;

    const agentNodes: CanvasNode[] = otherAgents.map((name, i) => ({
      id: name,
      name,
      type: 'agent',
      role: deriveRole(name, 'agent'),
      position:
        agentCount > 0
          ? circlePosition(i, agentCount, AGENT_RING_RADIUS)
          : { x: AGENT_RING_RADIUS, y: 0 },
    }));

    const skillAngleOffset = agentCount > 0 ? Math.PI / agentCount : 0;
    const skillNodes: CanvasNode[] = skills.map((name, i) => ({
      id: name,
      name,
      type: 'skill',
      role: deriveRole(name, 'skill'),
      position:
        skillCount > 0
          ? circlePosition(i, skillCount, SKILL_RING_RADIUS, skillAngleOffset)
          : { x: SKILL_RING_RADIUS, y: 0 },
    }));

    const allNodes: CanvasNode[] = [{ ...INITIAL_ORCHESTRATOR }, ...agentNodes, ...skillNodes];
    const nodeIds = new Set(allNodes.map((n) => n.id));

    const restoredEdges: CanvasEdge[] = (connections ?? [])
      .filter((c) => nodeIds.has(c.source) && nodeIds.has(c.target))
      .map((c) => ({ id: edgeId(c.source, c.target), source: c.source, target: c.target }));

    set({
      nodes: allNodes,
      edges: restoredEdges,
      cardTitle: cardTitle ?? 'The Orchestrator',
    });
  },

  resetCanvas: () =>
    set({
      nodes: [{ ...INITIAL_ORCHESTRATOR }],
      edges: [],
      cardTitle: 'The Orchestrator',
    }),

  setCardTitle: (title) => set({ cardTitle: title }),
}));

// ─────────────────────────────────────────────────────────────────────────────
// Selectors
// ─────────────────────────────────────────────────────────────────────────────

export function selectLoadoutPayload(state: CanvasState): {
  agents: string[];
  skills: string[];
  hooks: string[];
  connections: Array<{ source: string; target: string }>;
} {
  return {
    agents: state.nodes.filter((n) => n.type === 'agent').map((n) => n.name),
    skills: state.nodes.filter((n) => n.type === 'skill').map((n) => n.name),
    hooks: [],
    connections: state.edges.map((e) => ({ source: e.source, target: e.target })),
  };
}
