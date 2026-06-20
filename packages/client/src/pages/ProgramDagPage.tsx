/**
 * ProgramDagPage — Program sprint dependency DAG visualization.
 * Reuses GraphPage's dagre layout approach: ReactFlowProvider wraps the inner component;
 * nodeTypes map defined OUTSIDE component to avoid identity churn (critical for React Flow).
 *
 * LEGIBILITY SC (SC8): readable un-clipped node labels; distinct bounding boxes proved
 * by dagre layout; AA contrast via var(--) tokens only; managed density with per-program
 * selector to avoid overwhelming a single canvas with all programs.
 *
 * Zustand safety: NO Zustand consumed. All local state: primitive number (selectedProgramIdx),
 * primitive string/null (no new-object selectors). useMemo for dagre layout (stable).
 *
 * Does NOT modify GraphPage.tsx (additive new surface only).
 * aria-label uses "Program dependency graph" — NOT /graph/i — to avoid C1 selector collision.
 */
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
import type { ProgramDag, ProgramDagSeam } from '@gander-studio/shared';
import SprintNode from '../components/dag/SprintNode';

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────
const DAG_NODE_WIDTH = 200;
const DAG_NODE_HEIGHT = 80;
const DAG_RANKDIR = 'LR';
const DAG_NODESEP = 40;
const DAG_RANKSEP = 100;

/**
 * nodeTypes map — defined at MODULE LEVEL to guarantee stable reference identity.
 * A new object on every render would cause React Flow to remount all nodes.
 */
const DAG_NODE_TYPES: NodeTypes = {
  sprint: SprintNode,
};

// ─────────────────────────────────────────────────────────────────────────────
// Dagre layout helper (same pattern as GraphPage.applyDagreLayout)
// Mutates only position.{x,y}; all other node fields pass through unchanged.
// ─────────────────────────────────────────────────────────────────────────────
function applyDagreLayout(nodes: Node[], edges: Edge[]): Node[] {
  const g = new dagre.graphlib.Graph();
  g.setDefaultEdgeLabel(() => ({}));
  g.setGraph({ rankdir: DAG_RANKDIR, nodesep: DAG_NODESEP, ranksep: DAG_RANKSEP });

  for (const node of nodes) {
    g.setNode(node.id, { width: DAG_NODE_WIDTH, height: DAG_NODE_HEIGHT });
  }
  for (const edge of edges) {
    g.setEdge(edge.source, edge.target);
  }

  dagre.layout(g);

  return nodes.map((node) => {
    const dagNode = g.node(node.id);
    // Guard: if dagre didn't place a node (disconnected), keep current position
    if (!dagNode) return node;
    return { ...node, position: { x: dagNode.x, y: dagNode.y } };
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// SeamsPanel — sidebar listing integration seams for the selected program
// ─────────────────────────────────────────────────────────────────────────────
function SeamsPanel({ seams }: { seams: ProgramDagSeam[] }): React.ReactElement {
  if (seams.length === 0) {
    return (
      <div
        style={{
          width: '240px',
          flexShrink: 0,
          background: 'var(--sfm)',
          borderLeft: '1px solid var(--bd)',
          padding: '16px 12px',
          overflowY: 'auto',
        }}
      >
        <div
          style={{
            fontFamily: 'var(--fb)',
            fontSize: '11px',
            fontWeight: 600,
            color: 'var(--wm)',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            marginBottom: '8px',
          }}
        >
          SEAMS
        </div>
        <div
          style={{
            fontFamily: 'var(--fb)',
            fontSize: '12px',
            color: 'var(--wm)',
          }}
        >
          No integration seams.
        </div>
      </div>
    );
  }

  return (
    <div
      role="complementary"
      aria-label="Integration seams"
      style={{
        width: '240px',
        flexShrink: 0,
        background: 'var(--sfm)',
        borderLeft: '1px solid var(--bd)',
        padding: '16px 12px',
        overflowY: 'auto',
      }}
    >
      <div
        style={{
          fontFamily: 'var(--fb)',
          fontSize: '11px',
          fontWeight: 600,
          color: 'var(--wm)',
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          marginBottom: '12px',
        }}
      >
        SEAMS ({seams.length})
      </div>
      <div role="list">
        {seams.map((seam) => (
          <div
            key={seam.seam_id}
            role="listitem"
            style={{
              background: 'var(--sf)',
              border: '1px solid var(--bd)',
              borderLeft: '3px solid var(--mb)',
              borderRadius: 'var(--r)',
              padding: '8px 10px',
              marginBottom: '8px',
            }}
          >
            <code
              style={{
                display: 'block',
                fontFamily: 'var(--fm)',
                fontSize: '10px',
                fontWeight: 600,
                color: 'var(--mb)',
                marginBottom: '4px',
                letterSpacing: '0.04em',
              }}
            >
              {seam.seam_id}
            </code>
            <span
              style={{
                display: 'block',
                fontFamily: 'var(--fb)',
                fontSize: '10px',
                color: 'var(--wd)',
                marginBottom: '3px',
              }}
            >
              {seam.artifact}
            </span>
            <div
              style={{
                fontFamily: 'var(--fm)',
                fontSize: '9px',
                color: 'var(--wm)',
                letterSpacing: '0.04em',
              }}
            >
              {seam.from_sprint} → {seam.to_sprint}
            </div>
            {seam.format && (
              <div
                style={{
                  fontFamily: 'var(--fm)',
                  fontSize: '9px',
                  color: 'var(--wm)',
                  marginTop: '2px',
                }}
              >
                {seam.format}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ProgramSelector — tab list for choosing which program to display
// ─────────────────────────────────────────────────────────────────────────────
interface ProgramSelectorProps {
  programs: ProgramDag[];
  selectedIdx: number;
  onSelect: (idx: number) => void;
}

function ProgramSelector({ programs, selectedIdx, onSelect }: ProgramSelectorProps): React.ReactElement {
  return (
    <div
      role="tablist"
      aria-label="Select program"
      style={{
        display: 'flex',
        flexDirection: 'row',
        gap: '4px',
        padding: '8px 12px',
        background: 'var(--sfm)',
        borderBottom: '1px solid var(--bd)',
        overflowX: 'auto',
        flexShrink: 0,
      }}
    >
      {programs.map((prog, idx) => {
        const isSelected = idx === selectedIdx;
        return (
          <button
            key={prog.programId}
            role="tab"
            aria-selected={isSelected}
            onClick={() => onSelect(idx)}
            style={{
              fontFamily: 'var(--fm)',
              fontSize: '11px',
              letterSpacing: '0.06em',
              color: isSelected ? 'var(--w)' : 'var(--wm)',
              background: isSelected ? 'var(--nav-active-bg)' : 'transparent',
              border: isSelected ? '1px solid var(--mt)' : '1px solid var(--bd)',
              borderRadius: 'var(--r)',
              padding: '4px 10px',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              outline: 'none',
              transition: 'background 100ms ease, color 100ms ease',
            }}
            onFocus={(e) => { (e.currentTarget as HTMLButtonElement).style.outline = '2px solid var(--mt)'; }}
            onBlur={(e) => { (e.currentTarget as HTMLButtonElement).style.outline = 'none'; }}
          >
            {prog.programId}
          </button>
        );
      })}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ProgramDagInner — must be inside ReactFlowProvider
// ALL hooks MUST be called before any conditional early return (Rules of Hooks).
// ─────────────────────────────────────────────────────────────────────────────
function ProgramDagInner(): React.ReactElement {
  const dagQ = trpc.program.getDag.useQuery({});

  // Selected program index — primitive state (no new-object selector)
  const [selectedIdx, setSelectedIdx] = useState<number>(0);

  const handleSelectProgram = useCallback((idx: number) => {
    setSelectedIdx(idx);
  }, []);

  // Clamp selectedIdx — computed as a primitive (not a new object)
  const safeIdx = useMemo(() => {
    if (!dagQ.data || dagQ.data.length === 0) return 0;
    return Math.min(selectedIdx, dagQ.data.length - 1);
  }, [selectedIdx, dagQ.data]);

  // Stable program reference — useMemo (depends on safeIdx + dagQ.data)
  const program = useMemo(() => {
    if (!dagQ.data || dagQ.data.length === 0) return null;
    return dagQ.data[safeIdx] ?? null;
  }, [dagQ.data, safeIdx]);

  // RF node/edge arrays — useMemo, hoisted before early returns (Rules of Hooks)
  const rfNodes = useMemo<Node[]>(() => {
    if (!program) return [];
    return program.nodes as unknown as Node[];
  }, [program]);

  const rfEdges = useMemo<Edge[]>(() => {
    if (!program) return [];
    return program.edges as unknown as Edge[];
  }, [program]);

  const layoutedNodes = useMemo<Node[]>(() => {
    if (rfNodes.length === 0) return [];
    return applyDagreLayout(rfNodes, rfEdges);
  }, [rfNodes, rfEdges]);

  // Wrapper style consistent with GraphPage
  const wrapperStyle: React.CSSProperties = {
    height: 'calc(100vh - 132px)',
    margin: '-28px -28px 0 -28px',
    display: 'flex',
    flexDirection: 'column',
  };

  // ── Loading (after all hooks)
  if (dagQ.isLoading) {
    return (
      <div
        role="status"
        aria-live="polite"
        aria-label="Loading program DAG"
        style={{
          ...wrapperStyle,
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
          Loading programs…
        </span>
      </div>
    );
  }

  // ── Error
  if (dagQ.error) {
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
            PROGRAM DAG UNAVAILABLE
          </div>
          <div
            style={{
              fontFamily: 'var(--fb)',
              fontSize: '13px',
              color: 'var(--wd)',
              lineHeight: 1.55,
            }}
          >
            Program DAG could not be loaded. Verify docs/programs/ contains program.md
            files with Sprint Roster tables.
          </div>
        </div>
      </div>
    );
  }

  // ── Empty
  if (!dagQ.data || dagQ.data.length === 0) {
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
            NO PROGRAM DATA
          </div>
          <div
            style={{
              fontFamily: 'var(--fb)',
              fontSize: '13px',
              color: 'var(--wd)',
            }}
          >
            No program.md files found in docs/programs/. Create a program directory
            with a Sprint Roster markdown table to populate the DAG.
          </div>
        </div>
      </div>
    );
  }

  // At this point program is guaranteed non-null (empty/null early returns fired above)
  const programs = dagQ.data!;

  return (
    <div style={wrapperStyle}>
      {/* Program selector tabs */}
      {programs.length > 1 && (
        <ProgramSelector
          programs={programs}
          selectedIdx={safeIdx}
          onSelect={handleSelectProgram}
        />
      )}

      {/* Canvas + seams panel */}
      <div style={{ display: 'flex', flexDirection: 'row', flex: 1, overflow: 'hidden' }}>
        {/* DAG canvas */}
        <div
          style={{ flex: 1, height: '100%', minWidth: 0, position: 'relative' }}
          aria-label="Program dependency graph"
        >
          <ReactFlow
            nodes={layoutedNodes}
            edges={rfEdges}
            nodeTypes={DAG_NODE_TYPES}
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
              nodeColor={() => 'var(--mt)'}
            />
          </ReactFlow>

          {/* Empty canvas overlay */}
          {layoutedNodes.length === 0 && (
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
              No sprint nodes in this program.
            </div>
          )}
        </div>

        {/* Integration seams sidebar */}
        <SeamsPanel seams={program?.seams ?? []} />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ProgramDagPage — public export wrapped in ReactFlowProvider
// ─────────────────────────────────────────────────────────────────────────────
export default function ProgramDagPage(): React.ReactElement {
  return (
    <ReactFlowProvider>
      <ProgramDagInner />
    </ReactFlowProvider>
  );
}
