// ─────────────────────────────────────────────────────────────────────────────
// MateriaNode — presentational materia orb component for the React Flow canvas.
// Handles are invisible anchors required by RF for edge endpoint resolution.
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState } from 'react';
import { Handle, Position } from '@xyflow/react';
import { getMateriaColor } from '../../constants/compose';
import type { AgentRole } from '../../constants/agent-roles';
import { INVISIBLE_HANDLE_STYLE } from './handle-style';
import {
  ORB_SIZE_PX,
  ORB_SIZE_ORCHESTRATOR_PX,
  ORB_LABEL_OFFSET_PX,
  ORB_GRADIENT_LIGHT_STOP,
  ORB_GRADIENT_MID_STOP,
  ORB_GRADIENT_DARK_STOP,
  ORB_GRADIENT_DEEPEST_STOP,
  ORB_HIGHLIGHT_TOP_PX,
  ORB_HIGHLIGHT_LEFT_PX,
  ORB_HIGHLIGHT_GRADIENT,
  ORB_SHADOW_RIM_BLUR_PX,
  ORB_SHADOW_RIM_SPREAD_PX,
  ORB_SHADOW_AMBIENT_BLUR_PX,
  ORB_SHADOW_AMBIENT_SPREAD_PX,
  ORB_SHADOW_INSET_BLOOM_BLUR_PX,
  ORB_SHADOW_INSET_BLOOM_OPACITY,
  ORB_SHADOW_INSET_DEPTH_BLUR_PX,
  ORB_SHADOW_INSET_DEPTH_OPACITY,
  ORB_SHADOW_ORC_RIM_1,
  ORB_SHADOW_ORC_RIM_2,
  ORB_HOVER_TRANSITION_MS,
  ORB_HOVER_RIM_SPREAD_PX,
  ORB_HOVER_AMBIENT_SPREAD_PX,
} from '../../constants/canvas';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface MateriaNodeProps {
  name: string;
  type: 'agent' | 'skill';
  role?: AgentRole;
  isOrchestrator?: boolean;
  onRemove?: () => void;
  className?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers — extracted to avoid duplicated inline bodies
// ─────────────────────────────────────────────────────────────────────────────

// Shared inset shadow layers — the same for both default and orchestrator variants.
// rgba white/black values are approved exceptions: encoding opacity on pure white/black
// for the inset depth illusion; var(--w) and var(--void) cannot carry per-stop opacity
// inside a box-shadow list.
function buildInsetShadows(): string {
  return [
    `inset 2px 3px ${ORB_SHADOW_INSET_BLOOM_BLUR_PX}px 0px rgba(255,255,255,${ORB_SHADOW_INSET_BLOOM_OPACITY})`,
    `inset -3px -4px ${ORB_SHADOW_INSET_DEPTH_BLUR_PX}px 0px rgba(0,0,0,${ORB_SHADOW_INSET_DEPTH_OPACITY})`,
  ].join(', ');
}

function buildOrbShadow(isOrchestrator: boolean, hovered: boolean): string {
  const inset = buildInsetShadows();
  if (isOrchestrator) {
    return [ORB_SHADOW_ORC_RIM_1, ORB_SHADOW_ORC_RIM_2, inset].join(', ');
  }
  const rimSpread = hovered ? ORB_HOVER_RIM_SPREAD_PX : ORB_SHADOW_RIM_SPREAD_PX;
  const ambientSpread = hovered ? ORB_HOVER_AMBIENT_SPREAD_PX : ORB_SHADOW_AMBIENT_SPREAD_PX;
  return [
    `0 0 ${ORB_SHADOW_RIM_BLUR_PX}px ${rimSpread}px var(--bdb)`,
    `0 0 ${ORB_SHADOW_AMBIENT_BLUR_PX}px ${ambientSpread}px var(--gt)`,
    inset,
  ].join(', ');
}

function buildOrbGradient(): string {
  return (
    `radial-gradient(ellipse at 30% 28%, ` +
    `color-mix(in srgb, var(--orb-color) 60%, white 40%) ${ORB_GRADIENT_LIGHT_STOP}, ` +
    `var(--orb-color) ${ORB_GRADIENT_MID_STOP}, ` +
    `color-mix(in srgb, var(--orb-color) 60%, black 40%) ${ORB_GRADIENT_DARK_STOP}, ` +
    `color-mix(in srgb, var(--orb-color) 30%, black 70%) ${ORB_GRADIENT_DEEPEST_STOP})`
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export function MateriaNode({
  name,
  type,
  role,
  isOrchestrator = false,
  onRemove,
  className = '',
}: MateriaNodeProps) {
  const [hovered, setHovered] = useState(false);
  const orbSize = isOrchestrator ? ORB_SIZE_ORCHESTRATOR_PX : ORB_SIZE_PX;
  const labelMaxWidth = ORB_SIZE_ORCHESTRATOR_PX + 20;
  const showRemove = !isOrchestrator && onRemove !== undefined;

  const orbStyle: React.CSSProperties = {
    width: orbSize,
    height: orbSize,
    borderRadius: '50%',
    background: buildOrbGradient(),
    boxShadow: buildOrbShadow(isOrchestrator, hovered),
    transition: `box-shadow ${ORB_HOVER_TRANSITION_MS}ms ease-out`,
    flexShrink: 0,
    position: 'relative',
  };

  const highlightStyle: React.CSSProperties = {
    position: 'absolute',
    top: ORB_HIGHLIGHT_TOP_PX,
    left: ORB_HIGHLIGHT_LEFT_PX,
    width: '38%',
    height: '26%',
    borderRadius: '50%',
    background: ORB_HIGHLIGHT_GRADIENT,
    pointerEvents: 'none',
    zIndex: 2,
  };

  const labelStyle: React.CSSProperties = {
    marginTop: ORB_LABEL_OFFSET_PX,
    fontSize: 11,
    color: 'var(--wd)',
    textAlign: 'center',
    maxWidth: labelMaxWidth,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    lineHeight: 1.3,
    wordBreak: 'break-word',
  };

  const removeButtonStyle: React.CSSProperties = {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 18,
    height: 18,
    borderRadius: '50%',
    backgroundColor: 'var(--sfh)',
    border: '1px solid var(--bd)',
    color: 'var(--wd)',
    fontSize: 11,
    lineHeight: 1,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 0,
    zIndex: 3,
  };

  function handleMouseEnter() {
    setHovered(true);
  }

  function handleMouseLeave() {
    setHovered(false);
  }

  return (
    <div
      className={`flex flex-col items-center select-none ${className}`}
      data-testid={`materia-node-${name}`}
    >
      <div
        style={{
          '--orb-color': getMateriaColor(name, type, role),
          ...orbStyle,
        } as React.CSSProperties}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {/* Specular highlight — decorative, screen-reader hidden */}
        <div style={highlightStyle} aria-hidden="true" />
        {/*
          Invisible RF edge anchors — required by @xyflow/react to resolve edge
          endpoint SVG coordinates. Without these, RF silently renders no SVG line
          even when an edge exists in state. Style collapses them to 1×1px at the
          orb center. tabIndex=-1 and aria-hidden keep them invisible to users.
          isConnectable={false} prevents manual drag-to-connect.
        */}
        <Handle
          type="source"
          position={Position.Right}
          style={INVISIBLE_HANDLE_STYLE}
          isConnectable={false}
          tabIndex={-1}
          aria-hidden="true"
        />
        <Handle
          type="target"
          position={Position.Left}
          style={INVISIBLE_HANDLE_STYLE}
          isConnectable={false}
          tabIndex={-1}
          aria-hidden="true"
        />
        {showRemove && (
          <button
            type="button"
            aria-label={`Remove ${name}`}
            style={removeButtonStyle}
            onClick={onRemove}
          >
            ×
          </button>
        )}
      </div>
      <span style={labelStyle}>{name}</span>
    </div>
  );
}
