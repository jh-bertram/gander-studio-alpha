// ─────────────────────────────────────────────────────────────────────────────
// Compose mode constants — all magic values live here, never inline in components
// ─────────────────────────────────────────────────────────────────────────────

export const BROWSER_PANEL_WIDTH_PX = 320;
export const SAVE_SUCCESS_DURATION_MS = 1200;
export const POPOVER_MAX_HEIGHT_PX = 200;

// Skeleton pulse counts per section during loading state
export const BROWSER_SKELETON_COUNT = 4;

// Warning chip color tokens (expressed as CSS var references, not raw values)
export const WARNING_CHIP_BG = 'rgba(232,200,64,0.10)';
export const WARNING_CHIP_BD = 'rgba(232,200,64,0.30)';

// Remove button hover / error colors
export const REMOVE_HOVER_BG = 'rgba(207,60,60,0.10)';

// Slot item divider — very subtle teal tint
export const SLOT_ITEM_DIVIDER = 'rgba(84,153,181,0.12)';

// Browser item hover background
export const BROWSER_ITEM_HOVER_BG = 'rgba(84,153,181,0.06)';

// Saved loadout item hover
export const SAVED_LOADOUT_HOVER_BG = 'rgba(84,153,181,0.08)';

// Popover box shadow
export const POPOVER_BOX_SHADOW = '0 4px 20px rgba(0,0,0,0.5)';

// Name input focus glow (lighter than --gt)
export const NAME_INPUT_FOCUS_GLOW = '0 0 6px rgba(84,153,181,0.25)';

// Invalid name input border tint
export const INVALID_INPUT_BORDER = 'rgba(207,60,60,0.50)';

// ─────────────────────────────────────────────────────────────────────────────
// Materia color helper
// Returns a CSS custom property string based on agent name or item type.
// ─────────────────────────────────────────────────────────────────────────────

const COMMAND_AGENTS = new Set(['orchestrator', 'project-manager']);
const IMPL_AGENTS    = new Set(['backend-engineer', 'frontend-engineer', 'db-specialist']);
const GATE_AGENTS    = new Set(['auditor', 'critic', 'code-auditor']);
const INTEL_AGENTS   = new Set(['researcher', 'statistician', 'archivist']);
const META_AGENTS    = new Set(['dispatcher', 'ui-designer', 'system-health-monitor']);

export function getMateriaColor(name: string, type: 'agent' | 'skill' | 'hook'): string {
  if (type === 'skill') return 'var(--mb)';
  if (type === 'hook')  return 'var(--mo)';

  const lower = name.toLowerCase();
  if (COMMAND_AGENTS.has(lower)) return 'var(--my)';
  if (IMPL_AGENTS.has(lower))    return 'var(--mg)';
  if (GATE_AGENTS.has(lower))    return 'var(--mr)';
  if (INTEL_AGENTS.has(lower))   return 'var(--mb)';
  if (META_AGENTS.has(lower))    return 'var(--mp)';

  // Fallback: match by partial name fragments
  if (lower.includes('orchestrat') || lower.includes('project-manag')) return 'var(--my)';
  if (lower.includes('backend') || lower.includes('frontend') || lower.includes('db-spec')) return 'var(--mg)';
  if (lower.includes('audit') || lower.includes('critic')) return 'var(--mr)';
  if (lower.includes('research') || lower.includes('statist') || lower.includes('archiv')) return 'var(--mb)';
  if (lower.includes('dispatch') || lower.includes('ui-design') || lower.includes('health')) return 'var(--mp)';

  return 'var(--wm)';
}
