/**
 * Graph page constants — node-type color tokens and type lists.
 * Named CSS custom properties only; no raw hex values.
 * Shared between GraphNode.tsx and FilterSidebar.tsx (anti-DRY).
 */

/** Maps each node type to its FF7 Mako palette CSS custom property token. */
export const NODE_TYPE_COLORS: Record<string, string> = {
  agent:    'var(--mt)',   // mako teal — primary actor
  skill:    'var(--mg)',   // materia green — capability
  rule:     'var(--my)',   // materia yellow — constraint/guidance
  ref:      'var(--mb)',   // materia blue — reference/knowledge
  hook:     'var(--mo)',   // materia orange — trigger/event
  eval:     'var(--mp)',   // materia purple — assessment/judgment
  claudemd: 'var(--cgr)', // chip green — ambient context
};

/** All 7 node types, in display order. */
export const NODE_TYPES_LIST: string[] = [
  'agent',
  'skill',
  'rule',
  'ref',
  'hook',
  'eval',
  'claudemd',
];

/** All 9 edge types, in spec §3 display order. */
export const EDGE_TYPES_LIST: string[] = [
  'spawns',
  'references_skill',
  'invokes_skill',
  'triggers_hook',
  'imports_ref',
  'improves_agent',
  'improves_skill',
  'evaluated_by',
  'communicates_with',
];
