export const AGENT_MATERIA: Record<string, { color: string; code: string }> = {
  'orchestrator':          { color: 'var(--my)', code: 'OR' },
  'project-manager':       { color: 'var(--my)', code: 'PM' },
  'critic':                { color: 'var(--mr)', code: 'CR' },
  'code-auditor':          { color: 'var(--mr)', code: 'AU' },
  'archivist':             { color: 'var(--mb)', code: 'AR' },
  'backend-engineer':      { color: 'var(--mg)', code: 'BE' },
  'frontend-engineer':     { color: 'var(--mg)', code: 'FE' },
  'db-specialist':         { color: 'var(--mg)', code: 'DS' },
  'ui-designer':           { color: 'var(--mp)', code: 'UI' },
  'researcher':            { color: 'var(--mb)', code: 'RA' },
  'statistician':          { color: 'var(--mb)', code: 'ST' },
  'dispatcher':            { color: 'var(--mp)', code: 'DI' },
  'system-health-monitor': { color: 'var(--mp)', code: 'HR' },
};

export const DEFAULT_MATERIA = { color: 'var(--wm)', code: '??' };

export const TIER_AGENTS = {
  core: ['orchestrator', 'project-manager', 'critic', 'code-auditor', 'archivist'],
  impl: ['backend-engineer', 'frontend-engineer', 'db-specialist'],
};

// Repeated rgba color constants — never inline these in .ts/.tsx files
export const MODEL_BADGE_BG  = 'rgba(0,0,0,0.3)';
export const MODEL_TAG_BG    = 'rgba(84,153,181,0.15)';
export const MODEL_TAG_BD    = 'rgba(84,153,181,0.3)';
export const OPTIONAL_TAG_BG = 'rgba(155,89,182,0.15)';
export const OPTIONAL_TAG_BD = 'rgba(155,89,182,0.3)';
export const HOOK_BADGE_BG   = 'rgba(232,145,77,0.15)';
export const HOOK_BADGE_BD   = 'rgba(232,145,77,0.3)';
export const SKILL_HOVER_BD  = 'rgba(22,82,65,0.8)';
export const SKILL_HOVER_SH  = '0 0 18px rgba(22,82,65,0.3)';
export const HOOK_HOVER_BD   = 'rgba(232,145,77,0.6)';
export const HOOK_HOVER_SH   = '0 0 16px rgba(232,145,77,0.2)';
export const CARD_HOVER_SH   = '0 8px 22px rgba(0,0,0,0.5), var(--gt)';
export const OVERLAY_BG      = 'rgba(7,13,12,0.85)';
export const TOOL_CHIP_BG    = 'rgba(84,153,181,0.1)';
export const TOOL_CHIP_BD    = 'rgba(84,153,181,0.3)';

// Segment hover background — teal tint
export const SEGMENT_HOVER_BG = 'rgba(84,153,181,0.08)';
