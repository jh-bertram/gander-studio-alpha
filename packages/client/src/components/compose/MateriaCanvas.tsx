// ─────────────────────────────────────────────────────────────────────────────
// MateriaCanvas — React Flow canvas for composing agent loadouts.
// CSS import is SCOPED to this file only — do NOT move to globals.css or main.tsx.
// ─────────────────────────────────────────────────────────────────────────────
import '@xyflow/react/dist/style.css';
import React, { useEffect, useCallback, useRef, useState } from 'react';
import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  BackgroundVariant,
  Controls,
  useNodesState,
  useEdgesState,
  useReactFlow,
  type Node,
  type Edge,
  type NodeTypes,
  type NodeProps,
  type OnNodesChange,
} from '@xyflow/react';
import { useCanvasStore, deriveRole, type CanvasNode, type CanvasEdge } from '../../store/canvas-store';
import { MateriaNode } from './MateriaNode';
import { CardNode } from './CardNode';
import type { AgentRole } from '../../constants/agent-roles';
import {
  EDGE_STROKE_COLOR,
  EDGE_STROKE_WIDTH,
  EDGE_FILTER,
  CANVAS_PROXIMITY_THRESHOLD_PX,
  PALETTE_WIDTH_PX,
  Z_CANVAS_NODE,
  CARD_WIDTH_PX,
  CARD_HEIGHT_PX,
  ORB_ATTRACT_RELEASE_MS,
  ORB_LINK_FLASH_DURATION_MS,
  ORB_LINK_FLASH_BUFFER_MS,
  ORB_ATTRACT_SHADOW_BLUR_1,
  ORB_ATTRACT_SHADOW_SPREAD_1,
  ORB_ATTRACT_SHADOW_BLUR_2,
  ORB_ATTRACT_SHADOW_SPREAD_2,
  ORB_ATTRACT_SCALE_PEAK,
  ORB_ATTRACT_TRANSLATE_PX,
  ORB_ATTRACT_DURATION_MS,
  ORB_ATTRACT_SCALE_MID,
  ORB_ATTRACT_TRANSLATE_MID_PX,
  ORB_LINK_FLASH_GLOW_15_BLUR,
  ORB_LINK_FLASH_GLOW_15_SPREAD,
  ORB_LINK_FLASH_GLOW_45_BLUR,
  ORB_LINK_FLASH_GLOW_45_SPREAD,
  ORB_LINK_FLASH_GLOW_100_BLUR,
  ORB_LINK_FLASH_GLOW_100_SPREAD,
  ORB_LINK_FLASH_RING_15_PX,
  ORB_LINK_FLASH_RING_45_PX,
  ORB_LINK_FLASH_RING_100_PX,
  ORB_SHADOW_INSET_BLOOM_X,
  ORB_SHADOW_INSET_BLOOM_Y,
  ORB_SHADOW_INSET_BLOOM_BLUR_PX,
  ORB_SHADOW_INSET_BLOOM_OPACITY,
  ORB_SHADOW_INSET_DEPTH_X,
  ORB_SHADOW_INSET_DEPTH_Y,
  ORB_SHADOW_INSET_DEPTH_BLUR_PX,
  ORB_SHADOW_INSET_DEPTH_OPACITY,
  LIST_PANEL_WIDTH_PX,
  LIST_ROW_MIN_HEIGHT_PX,
  LIST_ROW_PADDING_BLOCK_PX,
  LIST_ROW_PADDING_INLINE_PX,
  LIST_ROW_GAP_PX,
  LIST_ROW_BORDER_RADIUS_PX,
  LIST_ROW_MARGIN_BOTTOM_PX,
  LIST_DOT_SIZE_PX,
  LIST_HEADING_FONT_SIZE_PX,
  LIST_HEADING_MARGIN_BOTTOM_PX,
  LIST_NAME_FONT_SIZE_PX,
  LIST_CONNECTION_FONT_SIZE_PX,
  LIST_CONNECTION_PADDING_LEFT_PX,
  LIST_CONNECTION_MARGIN_TOP_PX,
  LIST_CHILD_INDENT_PX,
  LIST_EMPTY_FONT_SIZE_PX,
  LIST_EMPTY_PADDING_PX,
  LIST_TRANSITION_DURATION_MS,
} from '../../constants/canvas';
import { getMateriaColor } from '../../constants/compose';
import { playApproach, stopApproach, playLink } from '../../hooks/useLinkSound';

// ─────────────────────────────────────────────────────────────────────────────
// CSS keyframes — scoped inline style block, NOT globals.css
// ─────────────────────────────────────────────────────────────────────────────

const MATERIA_CANVAS_KEYFRAMES = `
@keyframes orb-attract {
  0%   { transform: scale(1.00) translateY(0px); }
  35%  { transform: scale(${ORB_ATTRACT_SCALE_PEAK}) translateY(-${ORB_ATTRACT_TRANSLATE_PX}px); }
  65%  { transform: scale(${ORB_ATTRACT_SCALE_MID}) translateY(-${ORB_ATTRACT_TRANSLATE_MID_PX}px); }
  100% { transform: scale(1.00) translateY(0px); }
}

@keyframes orb-link-flash {
  0%   { box-shadow: 0 0 ${ORB_ATTRACT_SHADOW_BLUR_1}px ${ORB_ATTRACT_SHADOW_SPREAD_1}px var(--bdb), 0 0 ${ORB_ATTRACT_SHADOW_BLUR_2}px ${ORB_ATTRACT_SHADOW_SPREAD_2}px var(--gt), inset ${ORB_SHADOW_INSET_BLOOM_X}px ${ORB_SHADOW_INSET_BLOOM_Y}px ${ORB_SHADOW_INSET_BLOOM_BLUR_PX}px 0px rgba(255,255,255,${ORB_SHADOW_INSET_BLOOM_OPACITY}), inset ${ORB_SHADOW_INSET_DEPTH_X}px ${ORB_SHADOW_INSET_DEPTH_Y}px ${ORB_SHADOW_INSET_DEPTH_BLUR_PX}px 0px rgba(0,0,0,${ORB_SHADOW_INSET_DEPTH_OPACITY}); }
  15%  { box-shadow: 0 0 0 ${ORB_LINK_FLASH_RING_15_PX}px var(--w), 0 0 ${ORB_LINK_FLASH_GLOW_15_BLUR}px ${ORB_LINK_FLASH_GLOW_15_SPREAD}px var(--bdb), inset ${ORB_SHADOW_INSET_BLOOM_X}px ${ORB_SHADOW_INSET_BLOOM_Y}px ${ORB_SHADOW_INSET_BLOOM_BLUR_PX}px 0px rgba(255,255,255,${ORB_SHADOW_INSET_BLOOM_OPACITY}), inset ${ORB_SHADOW_INSET_DEPTH_X}px ${ORB_SHADOW_INSET_DEPTH_Y}px ${ORB_SHADOW_INSET_DEPTH_BLUR_PX}px 0px rgba(0,0,0,${ORB_SHADOW_INSET_DEPTH_OPACITY}); }
  45%  { box-shadow: 0 0 0 ${ORB_LINK_FLASH_RING_45_PX}px var(--mt), 0 0 ${ORB_LINK_FLASH_GLOW_45_BLUR}px ${ORB_LINK_FLASH_GLOW_45_SPREAD}px var(--bdb), inset ${ORB_SHADOW_INSET_BLOOM_X}px ${ORB_SHADOW_INSET_BLOOM_Y}px ${ORB_SHADOW_INSET_BLOOM_BLUR_PX}px 0px rgba(255,255,255,${ORB_SHADOW_INSET_BLOOM_OPACITY}), inset ${ORB_SHADOW_INSET_DEPTH_X}px ${ORB_SHADOW_INSET_DEPTH_Y}px ${ORB_SHADOW_INSET_DEPTH_BLUR_PX}px 0px rgba(0,0,0,${ORB_SHADOW_INSET_DEPTH_OPACITY}); }
  100% { box-shadow: 0 0 0 ${ORB_LINK_FLASH_RING_100_PX}px var(--bdb), 0 0 ${ORB_LINK_FLASH_GLOW_100_BLUR}px ${ORB_LINK_FLASH_GLOW_100_SPREAD}px var(--gt), inset ${ORB_SHADOW_INSET_BLOOM_X}px ${ORB_SHADOW_INSET_BLOOM_Y}px ${ORB_SHADOW_INSET_BLOOM_BLUR_PX}px 0px rgba(255,255,255,${ORB_SHADOW_INSET_BLOOM_OPACITY}), inset ${ORB_SHADOW_INSET_DEPTH_X}px ${ORB_SHADOW_INSET_DEPTH_Y}px ${ORB_SHADOW_INSET_DEPTH_BLUR_PX}px 0px rgba(0,0,0,${ORB_SHADOW_INSET_DEPTH_OPACITY}); }
}

.orb-attracted {
  animation: orb-attract ${ORB_ATTRACT_DURATION_MS}ms cubic-bezier(0.34, 1.56, 0.64, 1) infinite;
  box-shadow: 0 0 ${ORB_ATTRACT_SHADOW_BLUR_1}px ${ORB_ATTRACT_SHADOW_SPREAD_1}px var(--bdb), 0 0 ${ORB_ATTRACT_SHADOW_BLUR_2}px ${ORB_ATTRACT_SHADOW_SPREAD_2}px var(--gt), inset ${ORB_SHADOW_INSET_BLOOM_X}px ${ORB_SHADOW_INSET_BLOOM_Y}px ${ORB_SHADOW_INSET_BLOOM_BLUR_PX}px 0px rgba(255,255,255,${ORB_SHADOW_INSET_BLOOM_OPACITY}), inset ${ORB_SHADOW_INSET_DEPTH_X}px ${ORB_SHADOW_INSET_DEPTH_Y}px ${ORB_SHADOW_INSET_DEPTH_BLUR_PX}px 0px rgba(0,0,0,${ORB_SHADOW_INSET_DEPTH_OPACITY});
  will-change: transform;
}

.orb-attracted-release {
  animation: none;
  transform: scale(1.0);
  transition: transform ${ORB_ATTRACT_RELEASE_MS}ms cubic-bezier(0.22, 1, 0.36, 1), box-shadow ${ORB_ATTRACT_RELEASE_MS}ms ease-out;
}

.orb-link-flashing {
  animation: orb-link-flash ${ORB_LINK_FLASH_DURATION_MS}ms ease-out 1 forwards;
}

.orb-linked {
  box-shadow: 0 0 0 ${ORB_LINK_FLASH_RING_100_PX}px var(--bdb), 0 0 ${ORB_LINK_FLASH_GLOW_100_BLUR}px ${ORB_LINK_FLASH_GLOW_100_SPREAD}px var(--gt), inset ${ORB_SHADOW_INSET_BLOOM_X}px ${ORB_SHADOW_INSET_BLOOM_Y}px ${ORB_SHADOW_INSET_BLOOM_BLUR_PX}px 0px rgba(255,255,255,${ORB_SHADOW_INSET_BLOOM_OPACITY}), inset ${ORB_SHADOW_INSET_DEPTH_X}px ${ORB_SHADOW_INSET_DEPTH_Y}px ${ORB_SHADOW_INSET_DEPTH_BLUR_PX}px 0px rgba(0,0,0,${ORB_SHADOW_INSET_DEPTH_OPACITY});
}
`;

// ─────────────────────────────────────────────────────────────────────────────
// Props
// ─────────────────────────────────────────────────────────────────────────────

interface MateriaCanvasProps {
  availableAgents: Array<{ name: string; filePath: string }>;
  availableSkills: Array<{ name: string; filePath: string }>;
  isSaving: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// Custom node renderer — registered as 'materia' node type
// ─────────────────────────────────────────────────────────────────────────────

// v12: NodeProps requires a generic; use a local type that matches our data shape
type MateriaNodeData = { name: string; nodeType: 'agent' | 'skill'; role?: AgentRole; onRemove?: () => void };
type MateriaRFNode = Node<MateriaNodeData, 'materia'>;

function MateriaNodeRenderer({ data }: NodeProps<MateriaRFNode>) {
  return (
    <MateriaNode
      name={data.name}
      type={data.nodeType}
      role={data.role}
      onRemove={data.onRemove}
    />
  );
}

function CardNodeRenderer(): React.ReactElement {
  return <CardNode />;
}

const NODE_TYPES: NodeTypes = {
  materia: MateriaNodeRenderer as React.ComponentType<NodeProps<Node>>,
  card: CardNodeRenderer as React.ComponentType<NodeProps<Node>>,
};

// ─────────────────────────────────────────────────────────────────────────────
// Converters
// ─────────────────────────────────────────────────────────────────────────────

// ORCHESTRATOR_ID is not exported from canvas-store — use the canonical string literal here.
const ORCHESTRATOR_ID = 'orchestrator';

function toRFNode(cn: CanvasNode): Node {
  if (cn.id === ORCHESTRATOR_ID) {
    return {
      id: cn.id,
      type: 'card',
      position: {
        x: cn.position.x - CARD_WIDTH_PX / 2,
        y: cn.position.y - CARD_HEIGHT_PX / 2,
      },
      data: {},
      draggable: false,
      selectable: false,
      zIndex: 0,
    };
  }
  return {
    id: cn.id,
    type: 'materia',
    position: cn.position,
    data: {
      name: cn.name,
      nodeType: cn.type,
      role: cn.role,
      onRemove: () => useCanvasStore.getState().removeNode(cn.id),
    },
    zIndex: Z_CANVAS_NODE,
  };
}

function toRFEdge(ce: CanvasEdge): Edge {
  return {
    id: ce.id,
    source: ce.source,
    target: ce.target,
    style: {
      stroke: EDGE_STROKE_COLOR,
      strokeWidth: EDGE_STROKE_WIDTH,
      filter: EDGE_FILTER,
    },
    animated: true,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// DOM helpers — querySelector-based class management
//
// Design decision: We use direct DOM manipulation via querySelector on the RF
// container ref rather than setRFNodes. Reasoning:
//   1. setRFNodes on every mousemove during drag causes a full RF re-render
//      cycle that strips and reapplies className, breaking CSS animations
//      mid-gesture with visible flicker.
//   2. The proximity state is ephemeral (lives only during a drag gesture) and
//      carries no semantic meaning that needs to live in React state.
//   3. querySelector is ~0.1ms per call; mousemove fires at ~60fps → negligible.
//
// The orb root div is found via: data-testid="materia-node-{id}" (outermost div
// of MateriaNode), then the first child div with the orb's border-radius style.
// We target the outer wrapper div since MateriaNode accepts `className` which is
// applied to that outermost div — but class toggling here targets the inner
// orb sphere div to keep animation scope tight. The orb div is the first child
// of the data-testid wrapper.
// ─────────────────────────────────────────────────────────────────────────────

function findOrbEl(container: HTMLElement, nodeId: string): HTMLElement | null {
  const nodeWrapper = container.querySelector<HTMLElement>(
    `[data-testid="materia-node-${nodeId}"]`,
  );
  if (!nodeWrapper) return null;
  // First child div of the MateriaNode outer wrapper is the orb sphere div
  return nodeWrapper.querySelector<HTMLElement>('div') ?? null;
}

function applyOrbAttracted(container: HTMLElement, nodeId: string): void {
  const el = findOrbEl(container, nodeId);
  if (!el) return;
  el.classList.remove('orb-attracted-release', 'orb-linked');
  el.classList.add('orb-attracted');
}

function removeOrbAttracted(container: HTMLElement, nodeId: string): void {
  const el = findOrbEl(container, nodeId);
  if (!el) return;
  el.classList.remove('orb-attracted');
  el.classList.add('orb-attracted-release');
  window.setTimeout(() => {
    el.classList.remove('orb-attracted-release');
  }, ORB_ATTRACT_RELEASE_MS);
}

function applyOrbLinkFlash(container: HTMLElement, nodeId: string): void {
  const el = findOrbEl(container, nodeId);
  if (!el) return;
  el.classList.remove('orb-attracted', 'orb-attracted-release', 'orb-link-flashing', 'orb-linked');
  // Force reflow so re-adding the class restarts animation if it was just on
  void el.offsetWidth;
  el.classList.add('orb-link-flashing');
  window.setTimeout(() => {
    el.classList.remove('orb-link-flashing');
    el.classList.add('orb-linked');
  }, ORB_LINK_FLASH_DURATION_MS + ORB_LINK_FLASH_BUFFER_MS);
}

// ─────────────────────────────────────────────────────────────────────────────
// LoadoutListPanel — Surface 4: tree view of canvas nodes
//
// Structure:
//   [Card Header row — non-clickable, shows cardTitle, dot: var(--my)]
//     [Agent rows — one per non-orchestrator agent, flat]
//       [Child skill rows — indented LIST_CHILD_INDENT_PX, skills connected to agent]
//     [Unconnected skills — skills with zero edge connections, flat at bottom]
// ─────────────────────────────────────────────────────────────────────────────

interface LoadoutListPanelProps {
  nodes: CanvasNode[];
  edges: CanvasEdge[];
  onSelectNode?: (id: string) => void;
}

const LOADOUT_LIST_PANEL_RESPONSIVE_CSS = `
  @media (max-width: 640px) {
    .loadout-list-panel { display: none !important; }
  }
  .loadout-list-row:focus-visible {
    outline: 2px solid var(--mt);
    outline-offset: -2px;
  }
`;

function LoadoutListPanel({ nodes, edges, onSelectNode }: LoadoutListPanelProps) {
  const [hoveredId, setHoveredId] = React.useState<string | null>(null);
  const cardTitle = useCanvasStore((s) => s.cardTitle);

  // Build tree: orchestrator → card header; non-orchestrator agents → roots;
  // skills connected to an agent → children under that agent;
  // skills with zero edge connections → unconnected section at bottom.
  const { orchestratorNode, agentRoots, unconnectedSkills } = React.useMemo(() => {
    const orcNode = nodes.find((n) => n.id === ORCHESTRATOR_ID) ?? null;
    const agentNodes = nodes.filter((n) => n.type === 'agent' && n.id !== ORCHESTRATOR_ID);
    const skillNodes = nodes.filter((n) => n.type === 'skill');

    // For each non-orchestrator agent, find connected skill nodes via edges
    const agentRootsResult = agentNodes.map((agent) => {
      const connectedSkillIds = edges
        .filter((e) => e.source === agent.id || e.target === agent.id)
        .map((e) => (e.source === agent.id ? e.target : e.source))
        .filter((id) => {
          const peer = nodes.find((n) => n.id === id);
          return peer !== undefined && peer.type === 'skill';
        });
      const connectedSkills = connectedSkillIds
        .map((id) => nodes.find((n) => n.id === id))
        .filter((n): n is CanvasNode => n !== undefined);
      return { agent, skills: connectedSkills };
    });

    // Skills connected to at least one agent are NOT shown in unconnected section
    const connectedSkillIds = new Set<string>();
    for (const { skills } of agentRootsResult) {
      for (const skill of skills) {
        connectedSkillIds.add(skill.id);
      }
    }

    const unconnectedSkillsResult = skillNodes.filter(
      (s) => !connectedSkillIds.has(s.id),
    );

    return {
      orchestratorNode: orcNode,
      agentRoots: agentRootsResult,
      unconnectedSkills: unconnectedSkillsResult,
    };
  }, [nodes, edges]);

  const handleKeyDown = React.useCallback(
    (e: React.KeyboardEvent, id: string) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onSelectNode?.(id);
      }
    },
    [onSelectNode],
  );

  const handleHoverIn = React.useCallback((id: string) => {
    setHoveredId(id);
  }, []);

  const handleHoverOut = React.useCallback(() => {
    setHoveredId(null);
  }, []);

  // Renders an interactive row for a non-orchestrator agent or skill node
  const renderInteractiveRow = (node: CanvasNode, isChild: boolean) => {
    const isHovered = hoveredId === node.id;
    const dotColor = getMateriaColor(node.name, node.type, node.role);
    const paddingLeft = isChild ? LIST_CHILD_INDENT_PX : LIST_ROW_PADDING_INLINE_PX;

    return (
      <div
        key={`${node.id}-${isChild ? 'child' : 'root'}`}
        role="button"
        tabIndex={0}
        aria-label={`Select ${node.name} on canvas`}
        className="loadout-list-row"
        onClick={() => onSelectNode?.(node.id)}
        onKeyDown={(e) => handleKeyDown(e, node.id)}
        onMouseEnter={() => handleHoverIn(node.id)}
        onMouseLeave={handleHoverOut}
        style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          minHeight: LIST_ROW_MIN_HEIGHT_PX,
          padding: `${LIST_ROW_PADDING_BLOCK_PX}px ${LIST_ROW_PADDING_INLINE_PX}px ${LIST_ROW_PADDING_BLOCK_PX}px ${paddingLeft}px`,
          gap: LIST_ROW_GAP_PX,
          borderRadius: LIST_ROW_BORDER_RADIUS_PX,
          marginBottom: LIST_ROW_MARGIN_BOTTOM_PX,
          background: isHovered ? 'var(--sfh)' : 'transparent',
          transition: `background ${LIST_TRANSITION_DURATION_MS}ms ease-out`,
          cursor: 'pointer',
        }}
      >
        <div
          style={{
            width: LIST_DOT_SIZE_PX,
            height: LIST_DOT_SIZE_PX,
            borderRadius: '50%',
            background: dotColor,
            flexShrink: 0,
            boxShadow: '0 0 4px 1px var(--bd)',
          }}
        />
        <span
          style={{
            fontSize: LIST_NAME_FONT_SIZE_PX,
            color: 'var(--wd)',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {node.name}
        </span>
      </div>
    );
  };

  // Non-interactive canvas card header row (orchestrator)
  const renderCardHeader = (node: CanvasNode) => {
    const dotColor = getMateriaColor(node.name, node.type, node.role);
    return (
      <div
        key={node.id}
        aria-label={`Card: ${cardTitle}`}
        style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          minHeight: LIST_ROW_MIN_HEIGHT_PX,
          padding: `${LIST_ROW_PADDING_BLOCK_PX}px ${LIST_ROW_PADDING_INLINE_PX}px`,
          gap: LIST_ROW_GAP_PX,
          borderRadius: LIST_ROW_BORDER_RADIUS_PX,
          marginBottom: LIST_ROW_MARGIN_BOTTOM_PX,
          borderBottom: '1px solid var(--bd)',
        }}
      >
        <div
          style={{
            width: LIST_DOT_SIZE_PX,
            height: LIST_DOT_SIZE_PX,
            borderRadius: '50%',
            background: dotColor,
            flexShrink: 0,
            boxShadow: '0 0 4px 1px var(--bd)',
          }}
        />
        <span
          style={{
            fontSize: LIST_NAME_FONT_SIZE_PX,
            color: 'var(--wd)',
            fontWeight: 600,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {cardTitle}
        </span>
      </div>
    );
  };

  // Only show empty state when no non-card nodes exist
  const hasContentNodes = nodes.some((n) => n.id !== ORCHESTRATOR_ID);

  return (
    <aside
      className="loadout-list-panel"
      data-testid="loadout-list-panel"
      style={{
        width: LIST_PANEL_WIDTH_PX,
        minWidth: LIST_PANEL_WIDTH_PX,
        maxWidth: LIST_PANEL_WIDTH_PX,
        overflowY: 'auto',
        background: 'var(--sfm)',
        borderLeft: '1px solid var(--bd)',
        flexShrink: 0,
        zIndex: 15,
        padding: `${LIST_ROW_PADDING_INLINE_PX}px`,
      }}
    >
      <style>{LOADOUT_LIST_PANEL_RESPONSIVE_CSS}</style>
      <div
        style={{
          fontSize: LIST_HEADING_FONT_SIZE_PX,
          fontWeight: 600,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color: 'var(--wm)',
          marginBottom: LIST_HEADING_MARGIN_BOTTOM_PX,
        }}
      >
        Loadout
      </div>

      {/* Card header — non-interactive, always rendered when orchestrator is present */}
      {orchestratorNode !== null && renderCardHeader(orchestratorNode)}

      {/* Empty state — shown only when no agents or skills on canvas */}
      {!hasContentNodes && (
        <div
          style={{
            fontSize: LIST_EMPTY_FONT_SIZE_PX,
            color: 'var(--wm)',
            padding: LIST_EMPTY_PADDING_PX,
          }}
        >
          No nodes on canvas
        </div>
      )}

      {/* Agent roots with connected skill children */}
      {agentRoots.map(({ agent, skills }) => (
        <React.Fragment key={agent.id}>
          {renderInteractiveRow(agent, false)}
          {skills.map((skill) => renderInteractiveRow(skill, true))}
        </React.Fragment>
      ))}

      {/* Unconnected skills — skills with zero edge connections */}
      {unconnectedSkills.map((skill) => renderInteractiveRow(skill, false))}
    </aside>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Palette sidebar
// ─────────────────────────────────────────────────────────────────────────────

interface PaletteItem {
  name: string;
  type: 'agent' | 'skill';
}

interface MateriaPaletteProps {
  availableAgents: Array<{ name: string; filePath: string }>;
  availableSkills: Array<{ name: string; filePath: string }>;
  canvasNodeIds: Set<string>;
}

const PALETTE_CONTAINER_STYLE: React.CSSProperties = {
  width: PALETTE_WIDTH_PX,
  minWidth: PALETTE_WIDTH_PX,
  maxWidth: PALETTE_WIDTH_PX,
  overflowY: 'auto',
  background: 'var(--sfm)',
  borderRight: '1px solid var(--bd)',
  display: 'flex',
  flexDirection: 'column',
  flexShrink: 0,
  zIndex: 20,
};

const PALETTE_SEARCH_STYLE: React.CSSProperties = {
  width: '100%',
  background: 'var(--sf)',
  border: '1px solid var(--bd)',
  borderRadius: 4,
  color: 'var(--wd)',
  fontSize: 12,
  padding: '4px 8px',
  outline: 'none',
  boxSizing: 'border-box',
};

const PALETTE_SECTION_HEADING_STYLE: React.CSSProperties = {
  fontSize: 10,
  fontWeight: 600,
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  color: 'var(--wm)',
  marginBottom: 4,
};

function buildPaletteItemStyle(isOnCanvas: boolean, type: 'agent' | 'skill'): React.CSSProperties {
  const paletteRole: AgentRole = type === 'agent' ? 'specialist' : 'skill';
  return {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    padding: '5px 8px',
    borderRadius: 4,
    cursor: 'grab',
    border: '1px solid var(--bd)',
    marginBottom: 4,
    background: 'var(--sf)',
    opacity: isOnCanvas ? 0.5 : 1,
    fontSize: 12,
    color: 'var(--wd)',
    userSelect: 'none',
    // type-specific left accent via inline boxShadow (inset left border)
    boxShadow: `inset 3px 0 0 ${getMateriaColor(type === 'agent' ? 'frontend-engineer' : 'skill', type, paletteRole)}`,
  };
}

function PaletteItem({
  item,
  isOnCanvas,
}: {
  item: PaletteItem;
  isOnCanvas: boolean;
}) {
  const handleDragStart = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.dataTransfer.setData(
        'application/materia-node',
        JSON.stringify({ name: item.name, type: item.type }),
      );
      e.dataTransfer.effectAllowed = 'move';
    },
    [item.name, item.type],
  );

  const style = buildPaletteItemStyle(isOnCanvas, item.type);

  return (
    <div
      draggable
      role="button"
      tabIndex={0}
      data-testid={`palette-item-${item.name}`}
      aria-label={`Add ${item.name} to canvas${isOnCanvas ? ' (already on canvas)' : ''}`}
      aria-pressed={isOnCanvas}
      style={style}
      onDragStart={handleDragStart}
    >
      <span style={{ flexGrow: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {item.name}
      </span>
      {isOnCanvas && (
        <span aria-hidden="true" style={{ fontSize: 10, color: 'var(--mt)' }}>
          ✓
        </span>
      )}
    </div>
  );
}

function MateriaPalette({ availableAgents, availableSkills, canvasNodeIds }: MateriaPaletteProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const lowerQuery = searchQuery.toLowerCase();

  const filteredAgents = availableAgents.filter(
    (a) => !searchQuery || a.name.toLowerCase().includes(lowerQuery),
  );
  const filteredSkills = availableSkills.filter(
    (s) => !searchQuery || s.name.toLowerCase().includes(lowerQuery),
  );

  return (
    <aside
      data-testid="materia-palette"
      style={PALETTE_CONTAINER_STYLE}
      aria-label="Palette — drag items to canvas"
    >
      <div style={{ padding: '10px 8px 8px' }}>
        <input
          type="search"
          placeholder="Search..."
          aria-label="Search palette"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={PALETTE_SEARCH_STYLE}
        />
      </div>

      <div style={{ padding: '0 8px 8px', flex: 1 }}>
        {/* Agents section */}
        <div style={{ marginBottom: 12 }}>
          <h3 style={PALETTE_SECTION_HEADING_STYLE}>Agents</h3>
          {filteredAgents.length === 0 ? (
            <p style={{ fontSize: 11, color: 'var(--wm)', margin: 0 }}>No agents match.</p>
          ) : (
            filteredAgents.map((a) => (
              <PaletteItem
                key={a.name}
                item={{ name: a.name, type: 'agent' }}
                isOnCanvas={canvasNodeIds.has(a.name)}
              />
            ))
          )}
        </div>

        {/* Skills section */}
        <div>
          <h3 style={PALETTE_SECTION_HEADING_STYLE}>Skills</h3>
          {filteredSkills.length === 0 ? (
            <p style={{ fontSize: 11, color: 'var(--wm)', margin: 0 }}>No skills match.</p>
          ) : (
            filteredSkills.map((s) => (
              <PaletteItem
                key={s.name}
                item={{ name: s.name, type: 'skill' }}
                isOnCanvas={canvasNodeIds.has(s.name)}
              />
            ))
          )}
        </div>
      </div>
    </aside>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Inner canvas — must be a child of ReactFlowProvider to use useReactFlow()
// ─────────────────────────────────────────────────────────────────────────────

function MateriaCanvasInner({ availableAgents, availableSkills }: MateriaCanvasProps) {
  const storeNodes = useCanvasStore((s) => s.nodes);
  const storeEdges = useCanvasStore((s) => s.edges);
  const updateNodePosition = useCanvasStore((s) => s.updateNodePosition);
  const addNode = useCanvasStore((s) => s.addNode);
  const storeAddEdge = useCanvasStore((s) => s.addEdge);

  const rfInstance = useReactFlow();
  const rfInstanceRef = useRef(rfInstance);
  useEffect(() => {
    rfInstanceRef.current = rfInstance;
  }, [rfInstance]);

  const [rfNodes, setRFNodes, onNodesChange] = useNodesState<Node>(
    storeNodes.map(toRFNode),
  );
  const [rfEdges, setRFEdges, onEdgesChange] = useEdgesState<Edge>(
    storeEdges.map(toRFEdge),
  );

  // Ref to the canvas container div — used for querySelector-based class toggling
  const canvasContainerRef = useRef<HTMLDivElement | null>(null);

  // Track which node is currently attracted (ref to avoid re-render on change)
  const attractedNodeIdRef = useRef<string | null>(null);

  // Sync canvas-store → RF nodes
  useEffect(() => {
    setRFNodes(storeNodes.map(toRFNode));
  }, [storeNodes, setRFNodes]);

  // Sync canvas-store → RF edges
  useEffect(() => {
    setRFEdges(storeEdges.map(toRFEdge));
  }, [storeEdges, setRFEdges]);

  // ── addEdge wrapper that also fires link flash + sound ────────────────────
  const addEdgeWithEffects = useCallback(
    (source: string, target: string) => {
      storeAddEdge(source, target);

      // playLink fires immediately at edge creation
      playLink();

      const container = canvasContainerRef.current;
      if (container) {
        applyOrbLinkFlash(container, source);
        applyOrbLinkFlash(container, target);
      }
    },
    [storeAddEdge],
  );

  // ── Proximity detection during drag ──────────────────────────────────────
  const handleNodesChange: OnNodesChange<Node> = useCallback(
    (changes) => {
      onNodesChange(changes);

      for (const change of changes) {
        if (change.type !== 'position') continue;

        const container = canvasContainerRef.current;
        const currentNodes = useCanvasStore.getState().nodes;

        if (change.dragging === true && change.position !== undefined) {
          // Find the nearest non-dragging node
          const draggingPos = change.position;
          let nearestId: string | null = null;
          let nearestDist = Infinity;

          for (const other of currentNodes) {
            if (other.id === change.id) continue;
            const dx = draggingPos.x - other.position.x;
            const dy = draggingPos.y - other.position.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < nearestDist) {
              nearestDist = dist;
              nearestId = other.id;
            }
          }

          const prevAttracted = attractedNodeIdRef.current;

          if (nearestId !== null && nearestDist < CANVAS_PROXIMITY_THRESHOLD_PX) {
            if (prevAttracted !== nearestId) {
              // Release the old attracted node if it changed
              if (prevAttracted !== null && container) {
                removeOrbAttracted(container, prevAttracted);
              }
              // Attract the new nearest node
              if (container) {
                applyOrbAttracted(container, nearestId);
              }
              attractedNodeIdRef.current = nearestId;
              // Trigger approach sound on first entry into proximity
              playApproach();
            }
            // else: same node is still closest — animation continues, no change
          } else {
            // Exited proximity
            if (prevAttracted !== null) {
              if (container) {
                removeOrbAttracted(container, prevAttracted);
              }
              attractedNodeIdRef.current = null;
              stopApproach();
            }
          }
        }

        if (change.dragging === false && change.position !== undefined) {
          updateNodePosition(change.id, change.position);

          const prevAttracted = attractedNodeIdRef.current;
          attractedNodeIdRef.current = null;
          stopApproach();

          // Proximity-based edge creation: check distance to all other nodes.
          let edgeCreated = false;
          for (const other of currentNodes) {
            if (other.id === change.id) continue;
            const dx = change.position.x - other.position.x;
            const dy = change.position.y - other.position.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < CANVAS_PROXIMITY_THRESHOLD_PX) {
              addEdgeWithEffects(change.id, other.id);
              edgeCreated = true;
              break; // only one edge per drag-stop
            }
          }

          // If no edge was created and there was an attracted node, release it
          if (!edgeCreated && prevAttracted !== null && container) {
            removeOrbAttracted(container, prevAttracted);
          }
        }
      }
    },
    [onNodesChange, updateNodePosition, addEdgeWithEffects],
  );

  // ── AudioContext unlock: resume on first mousedown on canvas ─────────────
  const handleCanvasMouseDown = useCallback(() => {
    // Calling playApproach then immediately stopApproach in this mousedown
    // handler pre-unlocks the AudioContext per the researcher dossier (003-RA).
    // The AudioContext is created lazily inside playApproach (SSR-guarded).
    // Subsequent approach/link sounds fired during the same drag gesture will
    // play immediately because the context is already running.
    playApproach();
    stopApproach();
  }, []);

  // Drop from palette → add node at flow coordinates
  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      const raw = e.dataTransfer.getData('application/materia-node');
      if (!raw) return;
      let parsed: unknown;
      try {
        parsed = JSON.parse(raw);
      } catch {
        return;
      }
      if (
        typeof parsed !== 'object' ||
        parsed === null ||
        typeof (parsed as Record<string, unknown>).name !== 'string' ||
        ((parsed as Record<string, unknown>).type !== 'agent' &&
          (parsed as Record<string, unknown>).type !== 'skill')
      ) {
        return;
      }
      const { name, type } = parsed as { name: string; type: 'agent' | 'skill' };
      const position = rfInstanceRef.current.screenToFlowPosition({
        x: e.clientX,
        y: e.clientY,
      });
      addNode({ id: name, name, type, role: deriveRole(name, type), position });
    },
    [addNode],
  );

  // Build a set of node IDs currently on canvas for palette highlighting
  const canvasNodeIds = new Set(storeNodes.map((n) => n.id));

  // Handle panel row click — pan/zoom to the selected node
  const handleSelectNode = useCallback(
    (id: string) => {
      rfInstance.fitView({ nodes: [{ id }], duration: 400, padding: 0.5 });
    },
    [rfInstance],
  );

  return (
    <div
      data-testid="materia-canvas"
      style={{ display: 'flex', flexDirection: 'row', width: '100%', height: '100%', minHeight: 520 }}
    >
      {/* Scoped keyframes and proximity CSS classes — NOT in globals.css */}
      <style>{MATERIA_CANVAS_KEYFRAMES}</style>

      <MateriaPalette
        availableAgents={availableAgents}
        availableSkills={availableSkills}
        canvasNodeIds={canvasNodeIds}
      />

      <div
        ref={canvasContainerRef}
        style={{ flex: 1, minHeight: 520, background: 'var(--void)' }}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onMouseDown={handleCanvasMouseDown}
      >
        <ReactFlow
          nodes={rfNodes}
          edges={rfEdges}
          onNodesChange={handleNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={NODE_TYPES}
          fitView
        >
          <Background
            color="var(--mt)"
            variant={BackgroundVariant.Dots}
            gap={24}
            size={1}
            style={{ opacity: 0.15 }}
          />
          <Controls />
        </ReactFlow>
      </div>

      <LoadoutListPanel
        nodes={storeNodes}
        edges={storeEdges}
        onSelectNode={handleSelectNode}
      />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Public export — wraps inner component in ReactFlowProvider
// ─────────────────────────────────────────────────────────────────────────────

export function MateriaCanvas(props: MateriaCanvasProps) {
  return (
    <ReactFlowProvider>
      <MateriaCanvasInner {...props} />
    </ReactFlowProvider>
  );
}

export default MateriaCanvas;
