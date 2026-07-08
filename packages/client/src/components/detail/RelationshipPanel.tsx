import '@xyflow/react/dist/style.css';
import React, { useMemo } from 'react';
import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  BackgroundVariant,
  Controls,
  Handle,
  Position,
  type NodeTypes,
  type Node,
  type Edge,
} from '@xyflow/react';
import { Waypoints } from 'lucide-react';
import type { RelationshipEdge } from '@gander-studio/shared';

// prog-studio-v2-2026-07-s3-drilldowns-t2 — Roster drill-down relationship panel (Graph
// absorption lane, docs/v2-vision/v2-design-spec.md §submenu_structure: "connectivity to other
// agents/skills (the former Graph surface, now a relationship panel inside this drill-down
// rather than a standalone tab)"). Renders AgentDetail.relationships[] as a compact React Flow
// subgraph: one center node for the current agent, one node per relationships[] entry, one edge
// per relationship. 100% prop-driven (page passes `code` + `relationships` down per this
// packet's explicit contract) — NO connectivity.getGraph call, no trpc query in this file.
//
// RF v12 GOTCHA (memorized, binding — bit this project once): custom nodes MUST render <Handle>
// elements even for purely programmatic edges, or edges silently fail to render. RelationshipNode
// below mirrors GraphNode.tsx's convention exactly: every node carries BOTH a target Handle
// (left) and a source Handle (right), regardless of which role it plays in this star topology,
// so the center node can emit N edges and every leaf node can receive one.
//
// target-label note: packages/server/src/parsers/agent-detail.ts `relationshipsFromGraph`
// (disk-verified) sets `target` to the RAW connectivity-graph node id (a file path, e.g.
// '.claude/agents/pm.md'), not a friendly label — formatTargetLabel derives a readable basename
// client-side (string ops only, no fetch, no connectivity.getGraph call).

const PANEL_TESTID = 'detail-relationship-panel';
const PANEL_HEADING_ID = 'detail-relationship-panel-heading';
const PANEL_ICON_SIZE = 18;

const RELATIONSHIP_NODE_WIDTH = 180;
const NODE_HORIZONTAL_GAP = 220;
const NODE_VERTICAL_GAP = 76;
const CANVAS_HEIGHT_PX = 240;

const HANDLE_STYLE: React.CSSProperties = {
  background: 'var(--mt)',
  width: '8px',
  height: '8px',
  border: '1px solid var(--bd)',
};

// ─────────────────────────────────────────────────────────────────────────────
// Pure helpers (exported for unit testing — logic lives outside JSX)
// ─────────────────────────────────────────────────────────────────────────────

/** Derives a compact display label from a connectivity node id / file path
 *  (e.g. '.claude/agents/pm.md' -> 'pm'). Falls back to the raw string when
 *  it carries no path separator or extension to strip. */
export function formatTargetLabel(target: string): string {
  const trimmed = target.trim();
  if (trimmed.length === 0) return target;
  const segments = trimmed.split('/');
  const last = segments[segments.length - 1] ?? trimmed;
  return last.replace(/\.(md|ts|tsx|json)$/i, '');
}

/** Minimal LR "star fan" layout for one center + N leaf targets. Pure and
 *  deterministic so it is unit-testable without mounting React Flow. Mirrors
 *  GraphPage's LR dagre direction convention without importing its
 *  (unexported) applyDagreLayout helper — this panel's topology is a small
 *  star, not a general DAG, so a dedicated dagre pass is unnecessary. */
export function computeStarLayout(
  targetCount: number
): { center: { x: number; y: number }; targets: { x: number; y: number }[] } {
  const totalHeight = Math.max(targetCount - 1, 0) * NODE_VERTICAL_GAP;
  const centerY = totalHeight / 2;
  const targets = Array.from({ length: targetCount }, (_, index) => ({
    x: NODE_HORIZONTAL_GAP,
    y: index * NODE_VERTICAL_GAP,
  }));
  return { center: { x: 0, y: centerY }, targets };
}

export interface RelationshipNodeData {
  label: string;
  kind: 'center' | 'target';
  confidence?: RelationshipEdge['confidence'];
  [key: string]: unknown;
}

/** Builds the RF nodes/edges for a relationships[] slice. One node per
 *  relationships[] ENTRY (not deduped by target — SC(a) is explicit: "one
 *  node per relationships[] entry"), plus the single center node. Edge count
 *  in the returned array always equals relationships.length — a 1:1 map,
 *  never a hardcoded count. */
export function buildRelationshipGraph(
  code: string,
  relationships: RelationshipEdge[]
): { nodes: Node<RelationshipNodeData>[]; edges: Edge[] } {
  const layout = computeStarLayout(relationships.length);
  const centerId = `center-${code}`;

  const centerNode: Node<RelationshipNodeData> = {
    id: centerId,
    type: 'relationship',
    position: layout.center,
    data: { label: code, kind: 'center' },
  };

  const targetNodes: Node<RelationshipNodeData>[] = relationships.map((rel, index) => ({
    id: `${centerId}-target-${index}`,
    type: 'relationship',
    position: layout.targets[index] ?? { x: NODE_HORIZONTAL_GAP, y: index * NODE_VERTICAL_GAP },
    data: { label: formatTargetLabel(rel.target), kind: 'target', confidence: rel.confidence },
  }));

  const edges: Edge[] = relationships.map((rel, index) => ({
    id: `${centerId}-edge-${index}`,
    source: centerId,
    target: `${centerId}-target-${index}`,
    label: rel.edgeType,
    style:
      rel.confidence === 'INFERRED'
        ? { stroke: 'var(--wm)', strokeDasharray: '5,5', opacity: 0.75 }
        : { stroke: 'var(--mt)', opacity: 1 },
    labelStyle: { fontFamily: 'var(--fm)', fontSize: '10px', fill: 'var(--wd)' },
    labelBgStyle: { fill: 'var(--sfm)', fillOpacity: 0.85 },
    labelBgPadding: [2, 4] as [number, number],
    labelBgBorderRadius: 4,
  }));

  return { nodes: [centerNode, ...targetNodes], edges };
}

// ─────────────────────────────────────────────────────────────────────────────
// Custom node — mirrors GraphNode.tsx's <Handle> convention (RF v12 gotcha)
// ─────────────────────────────────────────────────────────────────────────────
interface RelationshipNodeProps {
  data: RelationshipNodeData;
}

function RelationshipNode({ data }: RelationshipNodeProps): React.ReactElement {
  const isCenter = data.kind === 'center';
  const accentColor = isCenter ? 'var(--mt)' : data.confidence === 'INFERRED' ? 'var(--wm)' : 'var(--mg)';

  return (
    <>
      <Handle type="target" position={Position.Left} style={HANDLE_STYLE} />
      <div
        className="flex flex-row overflow-hidden"
        style={{
          background: isCenter ? 'var(--sfm)' : 'var(--sfh)',
          border: `1px solid ${isCenter ? 'var(--mt)' : 'var(--bd)'}`,
          borderRadius: 'var(--r)',
          width: `${RELATIONSHIP_NODE_WIDTH}px`,
        }}
      >
        <div className="w-1 flex-shrink-0 self-stretch" style={{ background: accentColor }} aria-hidden="true" />
        <div className="flex flex-1 flex-col gap-1 overflow-hidden" style={{ padding: '8px 10px' }}>
          <span
            className="overflow-hidden text-ellipsis whitespace-nowrap"
            style={{ fontFamily: 'var(--fb)', fontSize: '11px', fontWeight: 600, color: 'var(--w)' }}
            title={data.label}
          >
            {data.label}
          </span>
          {!isCenter && data.confidence !== undefined ? (
            <span
              data-testid="relationship-node-confidence"
              className="inline-block self-start uppercase"
              style={{
                fontFamily: 'var(--fm)',
                fontSize: '9px',
                letterSpacing: '0.1em',
                color: 'var(--wm)',
                background: 'var(--sfm)',
                padding: '1px 5px',
                borderRadius: 'var(--r)',
              }}
            >
              {data.confidence}
            </span>
          ) : null}
        </div>
      </div>
      <Handle type="source" position={Position.Right} style={HANDLE_STYLE} />
    </>
  );
}

/** RF nodeTypes map — module-level constant to avoid identity churn (mirrors
 *  GraphPage's NODE_TYPES_MAP pattern). */
const RELATIONSHIP_NODE_TYPES: NodeTypes = { relationship: RelationshipNode };

// ─────────────────────────────────────────────────────────────────────────────
// Canvas (must render inside ReactFlowProvider)
// ─────────────────────────────────────────────────────────────────────────────
interface RelationshipCanvasProps {
  nodes: Node<RelationshipNodeData>[];
  edges: Edge[];
}

function RelationshipCanvas({ nodes, edges }: RelationshipCanvasProps): React.ReactElement {
  return (
    <div style={{ height: `${CANVAS_HEIGHT_PX}px`, position: 'relative' }} aria-label="Agent relationship graph">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={RELATIONSHIP_NODE_TYPES}
        fitView
        style={{ background: 'var(--void)' }}
      >
        <Background color="var(--bdb)" gap={20} variant={BackgroundVariant.Dots} />
        <Controls showInteractive={false} />
      </ReactFlow>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Confidence legend — "confidence markers visible" (SC(c)); real DOM text, not
// color-only, so the DETECTED/INFERRED distinction survives color-perception
// removal (design-spec Accessibility Contract precedent, StatBar module).
// ─────────────────────────────────────────────────────────────────────────────
function ConfidenceLegend(): React.ReactElement {
  return (
    <div
      data-testid="relationship-confidence-legend"
      role="note"
      aria-label="Confidence legend"
      className="flex gap-4 uppercase"
      style={{
        padding: '8px 16px',
        borderTop: '1px solid var(--bd)',
        fontFamily: 'var(--fm)',
        fontSize: '10px',
        letterSpacing: '0.1em',
        color: 'var(--wm)',
      }}
    >
      <span className="inline-flex items-center gap-1.5">
        <span aria-hidden="true" className="inline-block w-4" style={{ borderTop: '2px solid var(--mt)' }} />
        Detected
      </span>
      <span className="inline-flex items-center gap-1.5">
        <span aria-hidden="true" className="inline-block w-4" style={{ borderTop: '2px dashed var(--wm)' }} />
        Inferred
      </span>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Public component
// ─────────────────────────────────────────────────────────────────────────────
export interface RelationshipPanelProps {
  code: string;
  relationships: RelationshipEdge[];
}

export default function RelationshipPanel({ code, relationships }: RelationshipPanelProps): React.ReactElement {
  const { nodes, edges } = useMemo(() => buildRelationshipGraph(code, relationships), [code, relationships]);
  const isEmpty = relationships.length === 0;

  return (
    <section
      data-testid={PANEL_TESTID}
      aria-labelledby={PANEL_HEADING_ID}
      className="flex flex-col gap-3"
      style={{ background: 'var(--sf)', border: '1px solid var(--bd)', borderRadius: 'var(--radius)', padding: '16px' }}
    >
      <div className="flex items-center gap-2">
        <Waypoints aria-hidden="true" size={PANEL_ICON_SIZE} style={{ color: 'var(--mt)' }} />
        <div className="flex flex-col">
          <h2 id={PANEL_HEADING_ID} style={{ fontSize: '16px', fontWeight: 600, color: 'var(--w)', margin: 0 }}>
            Relationships
          </h2>
          <span style={{ fontSize: '10px', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--wm)' }}>
            Connectivity to other agents
          </span>
        </div>
      </div>
      {isEmpty ? (
        <div role="status" aria-live="polite" className="flex flex-col gap-1" style={{ padding: '8px 0' }}>
          <p style={{ fontSize: '12px', color: 'var(--wd)', margin: 0 }}>No recorded relationships for this agent.</p>
        </div>
      ) : (
        <>
          <ReactFlowProvider>
            <RelationshipCanvas nodes={nodes} edges={edges} />
          </ReactFlowProvider>
          <ConfidenceLegend />
        </>
      )}
    </section>
  );
}
