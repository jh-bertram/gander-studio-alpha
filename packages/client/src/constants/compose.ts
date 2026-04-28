// ─────────────────────────────────────────────────────────────────────────────
// Compose mode constants — all magic values live here, never inline in components
// ─────────────────────────────────────────────────────────────────────────────

import type { AgentRole } from '../constants/agent-roles';
import {
  META_AGENTS as COMMAND_AGENTS,
  SPECIALIST_AGENTS as IMPL_AGENTS,
  GATE_AGENTS,
  EXTERNAL_AGENTS as INTEL_AGENTS,
  META_FRAGMENTS,
  SPECIALIST_FRAGMENTS,
  GATE_FRAGMENTS,
  EXTERNAL_FRAGMENTS,
} from '../constants/agent-roles';

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

export function getMateriaColor(
  name: string,
  type: 'agent' | 'skill' | 'hook',
  role?: AgentRole,
): string {
  // Role-based fast path — when role is provided, skip name-hashing entirely
  if (role !== undefined) {
    switch (role) {
      case 'meta':       return 'var(--my)';
      case 'specialist': return 'var(--mg)';
      case 'gate':       return 'var(--mr)';
      case 'external':   return 'var(--mp)';
      case 'skill':      return 'var(--mb)';
    }
  }
  // Fallback: existing name-based logic (backwards-compatible — all callers without role still work)
  if (type === 'skill') return 'var(--mb)';
  if (type === 'hook')  return 'var(--mo)';

  const lower = name.toLowerCase();
  // COMMAND_AGENTS ≡ META_AGENTS (imported aliased); META_AGENTS un-aliased branch was removed as dead code.
  if (COMMAND_AGENTS.has(lower)) return 'var(--my)';
  if (IMPL_AGENTS.has(lower))    return 'var(--mg)';
  if (GATE_AGENTS.has(lower))    return 'var(--mr)';
  if (INTEL_AGENTS.has(lower))   return 'var(--mb)';

  // Fallback: match by partial name fragments
  if (META_FRAGMENTS.some((f) => lower.includes(f)))        return 'var(--my)';
  if (SPECIALIST_FRAGMENTS.some((f) => lower.includes(f)))  return 'var(--mg)';
  if (GATE_FRAGMENTS.some((f) => lower.includes(f)))        return 'var(--mr)';
  if (EXTERNAL_FRAGMENTS.some((f) => lower.includes(f)))    return 'var(--mb)';

  return 'var(--wm)';
}
