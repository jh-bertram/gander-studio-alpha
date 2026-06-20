import React from 'react';
import { Handle, Position } from '@xyflow/react';
import type { ProgramDagNode } from '@gander-studio/shared';

type ProgramDagNodeData = ProgramDagNode['data'];

/**
 * Custom React Flow node for the Program DAG page.
 * Renders a sprint card with goal text, tier indicator, and status badge.
 * FF7 Mako tokens only — no raw hex values.
 *
 * LEGIBILITY SC: 200px wide min; label text always visible via ellipsis + title tooltip;
 * tier colored left accent bar; status badge AA contrast (var(--wd) on var(--sfm)).
 */

// Tier → FF7 token map (defined at module level — no identity churn)
const TIER_COLORS: Record<number, string> = {
  0: 'var(--mt)',  // mako teal — tier 0 (root)
  1: 'var(--mg)',  // materia green — tier 1
  2: 'var(--mb)',  // materia blue — tier 2
  3: 'var(--mp)',  // materia purple — tier 3
  4: 'var(--mo)',  // materia orange — tier 4+
};

function tierColor(tier: number): string {
  return TIER_COLORS[tier] ?? 'var(--mo)';
}

// Status → badge color token
function statusColor(status: string | undefined): string {
  if (!status) return 'var(--wm)';
  const lower = status.toLowerCase();
  if (lower.includes('done') || lower.includes('complete')) return 'var(--mg)';
  if (lower.includes('in-progress') || lower.includes('active')) return 'var(--mt)';
  if (lower.includes('blocked') || lower.includes('fail')) return 'var(--mr)';
  if (lower.includes('deferred')) return 'var(--my)';
  return 'var(--wm)';
}

const handleStyle: React.CSSProperties = {
  background: 'var(--mt)',
  width: '8px',
  height: '8px',
  border: '1px solid var(--bd)',
};

interface SprintNodeProps {
  data: ProgramDagNodeData;
}

export default function SprintNode({ data }: SprintNodeProps): React.ReactElement {
  const accent = tierColor(data.tier);
  const badge = statusColor(data.status);

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
          width: '200px',
          minHeight: '64px',
        }}
      >
        {/* Left accent bar — tier color */}
        <div
          style={{
            width: '4px',
            flexShrink: 0,
            background: accent,
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
          {/* Sprint id label */}
          <span
            style={{
              fontFamily: 'var(--fm)',
              fontSize: '10px',
              fontWeight: 600,
              color: 'var(--w)',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              letterSpacing: '0.02em',
            }}
            title={data.label}
          >
            {data.label}
          </span>
          {/* Goal text — up to 2 lines */}
          {data.goal && (
            <span
              style={{
                fontFamily: 'var(--fb)',
                fontSize: '10px',
                color: 'var(--wd)',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                lineHeight: 1.4,
              }}
              title={data.goal}
            >
              {data.goal}
            </span>
          )}
          {/* Bottom row: tier pill + status badge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
            <span
              style={{
                fontFamily: 'var(--fm)',
                fontSize: '9px',
                letterSpacing: '0.08em',
                color: accent,
                background: 'var(--sfm)',
                border: `1px solid ${accent}`,
                borderRadius: 'var(--r)',
                padding: '1px 4px',
                flexShrink: 0,
              }}
            >
              T{data.tier}
            </span>
            {data.status && (
              <span
                style={{
                  fontFamily: 'var(--fb)',
                  fontSize: '9px',
                  letterSpacing: '0.06em',
                  color: badge,
                  background: 'var(--sfm)',
                  borderRadius: 'var(--r)',
                  padding: '1px 5px',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  maxWidth: '110px',
                }}
              >
                {data.status}
              </span>
            )}
          </div>
        </div>
      </div>
      <Handle type="source" position={Position.Right} style={handleStyle} />
    </>
  );
}
