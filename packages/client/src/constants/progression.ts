/**
 * Progression page constants — surface color tokens and display order.
 * Named CSS custom properties only; no raw hex values.
 * Surface color map mirrors graph.ts NODE_TYPE_COLORS for cross-page consistency.
 */

import type { ProgressionEntry } from '@gander-studio/shared';

/** Surface enum values — the 8 valid progression surfaces. */
export type Surface = ProgressionEntry['xp_gained'][number]['surface'];

/** Maps each surface to its FF7 Mako palette CSS custom property token. */
export const SURFACE_COLORS: Record<Surface, string> = {
  'Agents':       'var(--mt)',   // mako teal — primary actor
  'Skills':       'var(--mg)',   // materia green — capability
  'Rules':        'var(--my)',   // materia yellow — constraint/guidance
  'CLAUDE.md':    'var(--cgr)',  // chip green — ambient context
  'Refs':         'var(--mb)',   // materia blue — reference/knowledge
  'Hooks':        'var(--mo)',   // materia orange — trigger/event
  'Evals':        'var(--mp)',   // materia purple — assessment/judgment
  'Connectivity': 'var(--cpr)', // chip purple — team graph layer
};

/** Display order for the SurfacePillGrid. */
export const SURFACE_ORDER: Surface[] = [
  'Agents',
  'Skills',
  'Rules',
  'CLAUDE.md',
  'Refs',
  'Hooks',
  'Evals',
  'Connectivity',
];
