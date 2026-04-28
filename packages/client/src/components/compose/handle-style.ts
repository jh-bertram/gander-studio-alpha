// ─────────────────────────────────────────────────────────────────────────────
// Shared invisible RF Handle style — used by MateriaNode and CardNode.
// Collapses the handle to a 1×1px invisible anchor at the node's geometric center.
// Required by @xyflow/react for edge SVG endpoint resolution.
// isConnectable={false} on the Handle component prevents manual drag-to-connect.
// ─────────────────────────────────────────────────────────────────────────────
import type React from 'react';

export const INVISIBLE_HANDLE_STYLE: React.CSSProperties = {
  width: 1,
  height: 1,
  opacity: 0,
  pointerEvents: 'none',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  border: 'none',
  background: 'transparent',
};
