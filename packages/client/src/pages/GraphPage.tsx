// GraphPage — React Flow connectivity graph with dagre layout.
// CSS import scoped to this file (same pattern as MateriaCanvas.tsx).
import '@xyflow/react/dist/style.css';
import React, { useState, useMemo, useCallback } from 'react';
import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  type NodeTypes,
  type Node,
  type Edge,
} from '@xyflow/react';
import dagre from '@dagrejs/dagre';
import { trpc } from '../trpc';
import { NODE_TYPES_LIST, EDGE_TYPES_LIST, NODE_TYPE_COLORS } from '../constants/graph';
import GraphNode from '../components/graph/GraphNode';
import FilterSidebar from '../components/graph/FilterSidebar';

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────
const NODE_WIDTH = 180;
const NODE_HEIGHT = 60;
const DAGRE_RANKDIR = 'LR';

/** ReactFlow nodeTypes map — defined outside component to avoid identity churn. */
const NODE_TYPES_MAP: NodeTypes = {
  agent:    GraphNode,
  skill:    GraphNode,
  rule:     GraphNode,
  ref:      GraphNode,
  hook:     GraphNode,
  eval:     GraphNode,
  claudemd: GraphNode,
};

// ─────────────────────────────────────────────────────────────────────────────
// Dagre layout helper
// Mutates only position.{x,y}; all other node fields pass through unchanged (§5d).
// ─────────────────────────────────────────────────────────────────────────────
function applyDagreLayout(
  nodes: Node[],
  edges: Edge[]
): Node[] {
  const g = new dagre.graphlib.Graph();
  g.setDefaultEdgeLabel(() => ({}));
  g.setGraph({ rankdir: DAGRE_RANKDIR, nodesep: 40, ranksep: 80 });

  for (const node of nodes) {
    g.setNode(node.id, { width: NODE_WIDTH, height: NODE_HEIGHT });
  }
  for (const edge of edges) {
    g.setEdge(edge.source, edge.target);
  }

  dagre.layout(g);

  return nodes.map((node) => {
    const { x, y } = g.node(node.id);
    return { ...node, position: { x, y } };
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Inner component (must be inside ReactFlowProvider)
// ─────────────────────────────────────────────────────────────────────────────
function GraphPageInner(): React.ReactElement {
  const graphQ = trpc.connectivity.getGraph.useQuery({});

  // Filter state — all types enabled by default
  const [nodeFilters, setNodeFilters] = useState<Set<string>>(
    () => new Set(NODE_TYPES_LIST)
  );
  const [edgeFilters, setEdgeFilters] = useState<Set<string>>(
    () => new Set(EDGE_TYPES_LIST)
  );

  // Toggle handlers (stable references via useCallback)
  const handleToggleNode = useCallback((nodeType: string) => {
    setNodeFilters((prev) => {
      const next = new Set(prev);
      if (next.has(nodeType)) {
        next.delete(nodeType);
      } else {
        next.add(nodeType);
      }
      return next;
    });
  }, []);

  const handleToggleEdge = useCallback((edgeType: string) => {
    setEdgeFilters((prev) => {
      const next = new Set(prev);
      if (next.has(edgeType)) {
        next.delete(edgeType);
      } else {
        next.add(edgeType);
      }
      return next;
    });
  }, []);

  const handleReset = useCallback(() => {
    setNodeFilters(new Set(NODE_TYPES_LIST));
    setEdgeFilters(new Set(EDGE_TYPES_LIST));
  }, []);

  // ── Dagre layout pass (runs once per graph data load)
  // §5d: mutates ONLY position.{x,y}; all other fields pass through unchanged.
  const layoutedNodes = useMemo<Node[]>(() => {
    if (!graphQ.data) return [];
    const rawNodes = graphQ.data.nodes as unknown as Node[];
    const rawEdges = graphQ.data.edges as unknown as Edge[];
    return applyDagreLayout(rawNodes, rawEdges);
  }, [graphQ.data]);

  // ── Edge style injection (only permitted post-§5d transformation: adds style prop)
  // Maps source edges by index — same array, no field mutations (§5d compliance).
  const layoutedEdges = useMemo<Edge[]>(() => {
    if (!graphQ.data) return [];
    return graphQ.data.edges.map((rawEdge) => {
      const confidence = rawEdge.data.confidence;
      return {
        ...(rawEdge as unknown as Edge),
        style:
          confidence === 'INFERRED'
            ? { opacity: 0.5, strokeDasharray: '5,5' }
            : { opacity: 1 },
        labelStyle: { fontFamily: 'var(--fm)', fontSize: '10px', fill: 'var(--wd)' },
        labelBgStyle: { fill: 'var(--sfm)', fillOpacity: 0.85 },
        labelBgPadding: [2, 4] as [number, number],
        labelBgBorderRadius: 4,
      };
    });
  }, [graphQ.data]);

  // ── Apply filters
  const filteredNodes = useMemo<Node[]>(() => {
    return layoutedNodes.filter((n) => nodeFilters.has(n.type ?? ''));
  }, [layoutedNodes, nodeFilters]);

  const filteredNodeIds = useMemo<Set<string>>(
    () => new Set(filteredNodes.map((n) => n.id)),
    [filteredNodes]
  );

  const filteredEdges = useMemo<Edge[]>(() => {
    return layoutedEdges.filter(
      (e) =>
        edgeFilters.has(e.type ?? '') &&
        filteredNodeIds.has(e.source) &&
        filteredNodeIds.has(e.target)
    );
  }, [layoutedEdges, edgeFilters, filteredNodeIds]);

  // ── Shared wrapper styles
  const wrapperStyle: React.CSSProperties = {
    height: 'calc(100vh - 132px)',
    margin: '-28px -28px 0 -28px',
    display: 'flex',
    flexDirection: 'row',
  };

  // ── Loading state
  if (graphQ.isLoading) {
    return (
      <div
        role="status"
        aria-live="polite"
        aria-label="Loading graph"
        style={{
          ...wrapperStyle,
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '12px',
          background: 'var(--sf)',
        }}
      >
        <div
          aria-hidden="true"
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            border: '3px solid var(--bd)',
            borderTopColor: 'var(--mt)',
            animation: 'spin 0.8s linear infinite',
          }}
        />
        <span
          style={{
            fontFamily: 'var(--fm)',
            fontSize: '13px',
            color: 'var(--wm)',
            letterSpacing: '0.12em',
          }}
        >
          Loading graph…
        </span>
      </div>
    );
  }

  // ── Error state
  if (graphQ.error) {
    return (
      <div
        role="alert"
        style={{
          ...wrapperStyle,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div
          style={{
            background: 'var(--sfm)',
            border: '1px solid var(--red)',
            borderRadius: 'var(--rl)',
            padding: '24px 28px',
            maxWidth: '420px',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              fontFamily: 'var(--fh)',
              fontSize: '16px',
              fontWeight: 500,
              color: 'var(--redb)',
              letterSpacing: '0.1em',
              marginBottom: '8px',
            }}
          >
            GRAPH UNAVAILABLE
          </div>
          <div
            style={{
              fontFamily: 'var(--fb)',
              fontSize: '13px',
              color: 'var(--wd)',
              lineHeight: 1.55,
            }}
          >
            Run the connectivity analyzer to generate graph data, then reload.
          </div>
        </div>
      </div>
    );
  }

  // ── Empty state (graph loaded but no nodes)
  if (graphQ.data && graphQ.data.nodes.length === 0) {
    return (
      <div
        role="status"
        aria-live="polite"
        style={{
          ...wrapperStyle,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div
          style={{
            background: 'var(--sfm)',
            border: '1px solid var(--bd)',
            borderRadius: 'var(--rl)',
            padding: '24px 28px',
            maxWidth: '360px',
            textAlign: 'center',
          }}
        >
          <div
            aria-hidden="true"
            style={{
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              background: 'var(--mt)',
              margin: '0 auto 12px',
              animation: 'pulse-opacity 2s ease-in-out infinite',
            }}
          />
          <div
            style={{
              fontFamily: 'var(--fh)',
              fontSize: '16px',
              color: 'var(--mt)',
              letterSpacing: '0.1em',
              marginBottom: '8px',
            }}
          >
            NO GRAPH DATA
          </div>
          <div
            style={{
              fontFamily: 'var(--fb)',
              fontSize: '13px',
              color: 'var(--wd)',
            }}
          >
            The connectivity graph contains no nodes. Run the analyzer to populate.
          </div>
        </div>
      </div>
    );
  }

  // ── Default state: two-zone layout
  const hasGraph = graphQ.data && graphQ.data.nodes.length > 0;
  const allFiltered = hasGraph && filteredNodes.length === 0;

  return (
    <div style={wrapperStyle}>
      {/* Canvas zone */}
      <div
        style={{ flex: 1, height: '100%', minWidth: 0, position: 'relative' }}
        aria-label="Agent connectivity graph"
      >
        <ReactFlow
          nodes={filteredNodes}
          edges={filteredEdges}
          nodeTypes={NODE_TYPES_MAP}
          fitView
          style={{ background: 'var(--void)' }}
        >
          <Background
            color="var(--bdb)"
            gap={20}
            variant={BackgroundVariant.Dots}
          />
          <Controls />
          <MiniMap
            style={{
              background: 'var(--sfm)',
              border: '1px solid var(--bd)',
            }}
            nodeColor={(node: Node) =>
              NODE_TYPE_COLORS[(node.data as { nodeType?: string }).nodeType ?? ''] ??
              'var(--mt)'
            }
          />
        </ReactFlow>
        {/* All-filtered overlay tip */}
        {allFiltered && (
          <div
            role="status"
            aria-live="polite"
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              background: 'var(--sfm)',
              border: '1px solid var(--bd)',
              borderRadius: 'var(--r)',
              padding: '12px 16px',
              fontFamily: 'var(--fb)',
              fontSize: '12px',
              color: 'var(--wd)',
              pointerEvents: 'none',
              zIndex: 10,
            }}
          >
            All nodes hidden — use the filter panel to restore visibility.
          </div>
        )}
      </div>
      {/* Filter sidebar */}
      <FilterSidebar
        nodeFilters={nodeFilters}
        edgeFilters={edgeFilters}
        onToggleNode={handleToggleNode}
        onToggleEdge={handleToggleEdge}
        onReset={handleReset}
      />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Public export — wrapped in ReactFlowProvider
// ─────────────────────────────────────────────────────────────────────────────
export default function GraphPage(): React.ReactElement {
  return (
    <ReactFlowProvider>
      <GraphPageInner />
    </ReactFlowProvider>
  );
}
