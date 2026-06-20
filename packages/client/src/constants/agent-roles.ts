// ─────────────────────────────────────────────────────────────────────────────
// Agent role classification — single source of truth.
// Imported by deriveRole (canvas-store.ts) and getMateriaColor (compose.ts).
// Canonical color map: browse.ts AGENT_MATERIA (DESIGN.md Decision Record B / SEAM-07).
// ─────────────────────────────────────────────────────────────────────────────

export type AgentRole = 'meta' | 'specialist' | 'gate' | 'external' | 'intel' | 'skill';

// Agents that coordinate and direct; renders in meta yellow (--my)
export const META_AGENTS = new Set([
  'orchestrator',
  'project-manager',
]);

// Agents that implement / build; renders in specialist green (--mg)
export const SPECIALIST_AGENTS = new Set([
  'backend-engineer',
  'frontend-engineer',
  'db-specialist',
]);

// Agents that enforce quality gates; renders in gate red (--mr)
export const GATE_AGENTS = new Set([
  'auditor',
  'critic',
  'code-auditor',
]);

// Agents that reach outside the codebase; renders in external purple (--mp)
export const EXTERNAL_AGENTS = new Set([
  'ui-designer',
  'dispatcher',
  'system-health-monitor',
]);

// Agents that gather/archive intelligence; renders in intel blue (--mb)
// Canonical: browse.ts AGENT_MATERIA (DR-B/SEAM-07)
export const INTEL_AGENTS = new Set([
  'archivist',
  'researcher',
  'statistician',
]);

// Partial-name fragments for fallback classification (same order as above)
export const META_FRAGMENTS        = ['orchestrat', 'project-manag'];
export const SPECIALIST_FRAGMENTS  = ['backend', 'frontend', 'db-spec'];
export const GATE_FRAGMENTS        = ['audit', 'critic'];
export const EXTERNAL_FRAGMENTS    = ['ui-design', 'dispatch', 'health'];
export const INTEL_FRAGMENTS       = ['archiv', 'research', 'statist'];
