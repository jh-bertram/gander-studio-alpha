import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { NODE_TYPE_COLORS } from '../../constants/graph';

interface GraphNodeData {
  label: string;
  nodeType: string;
  filePath?: string;
  confidence?: string;
  [key: string]: unknown;
}

interface GraphNodeProps {
  data: GraphNodeData;
}

/**
 * Custom React Flow node card for the Graph page.
 * Spec: 180px wide, colored left accent bar per node type, label + type badge.
 * No Shadcn primitives — all tokens are explicit FF7 Mako CSS vars.
 */
export default function GraphNode({ data }: GraphNodeProps): React.ReactElement {
  const accentColor = NODE_TYPE_COLORS[data.nodeType] ?? 'var(--mt)';

  const handleStyle: React.CSSProperties = {
    background: 'var(--mt)',
    width: '8px',
    height: '8px',
    border: '1px solid var(--bd)',
  };

  return (
    <>
      <Handle type="target" position={Position.Left} style={handleStyle} />
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          background: 'var(--sfh)',
          border: '1px solid var(--bd)',
          borderRadius: 'var(--r)',
          overflow: 'hidden',
          boxShadow: 'var(--gt)',
          width: '180px',
        }}
      >
        {/* Left accent bar */}
        <div
          style={{
            width: '4px',
            flexShrink: 0,
            background: accentColor,
            alignSelf: 'stretch',
          }}
          aria-hidden="true"
        />
        {/* Content area */}
        <div
          style={{
            flex: 1,
            padding: '8px 10px',
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
            overflow: 'hidden',
          }}
        >
          {/* Primary label */}
          <span
            style={{
              fontFamily: 'var(--fb)',
              fontSize: '11px',
              fontWeight: 600,
              color: 'var(--w)',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
            title={data.label}
          >
            {data.label}
          </span>
          {/* Node type badge */}
          <span
            style={{
              display: 'inline-block',
              fontFamily: 'var(--fm)',
              fontSize: '9px',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: 'var(--wm)',
              background: 'var(--sfm)',
              padding: '1px 5px',
              borderRadius: 'var(--r)',
              alignSelf: 'flex-start',
            }}
          >
            {data.nodeType}
          </span>
        </div>
      </div>
      <Handle type="source" position={Position.Right} style={handleStyle} />
    </>
  );
}
