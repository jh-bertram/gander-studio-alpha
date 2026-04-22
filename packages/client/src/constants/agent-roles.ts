// ─────────────────────────────────────────────────────────────────────────────
// Agent role classification — single source of truth.
// Imported by deriveRole (canvas-store.ts) and getMateriaColor (compose.ts).
// ─────────────────────────────────────────────────────────────────────────────

export type AgentRole = 'meta' | 'specialist' | 'gate' | 'external' | 'skill';

// Agents that coordinate and direct; renders in meta yellow (--my)
export const META_AGENTS = new Set([
  'orchestrator',
  'project-manager',
  'dispatcher',
]);

// Agents that implement / build; renders in specialist green (--mg)
export const SPECIALIST_AGENTS = new Set([
  'backend-engineer',
  'frontend-engineer',
  'db-specialist',
  'archivist',
]);

// Agents that enforce quality gates; renders in gate red (--mr)
export const GATE_AGENTS = new Set([
  'auditor',
  'critic',
  'code-auditor',
  'system-health-monitor',
]);

// Agents that reach outside the codebase; renders in external purple (--mp)
export const EXTERNAL_AGENTS = new Set([
  'researcher',
  'statistician',
  'ui-designer',
]);

// Partial-name fragments for fallback classification (same order as above)
export const META_FRAGMENTS        = ['orchestrat', 'project-manag', 'dispatch'];
export const SPECIALIST_FRAGMENTS  = ['backend', 'frontend', 'db-spec', 'archiv'];
export const GATE_FRAGMENTS        = ['audit', 'critic', 'health'];
export const EXTERNAL_FRAGMENTS    = ['research', 'statist', 'ui-design'];
