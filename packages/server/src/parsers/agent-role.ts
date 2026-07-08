// agent-role.ts — role-code utilities + the canonical ROSTER catalog.
//
// Pure helpers + a static constant only. No fs / event reading here (see
// prog-studio-v2-2026-07-s1-data-layer-t1 out_of_scope) — t2/t3/t4 build the
// derivation layers that consume roleOf/canonicalizeRole/ROSTER.

/**
 * Strip the `#<instance>` suffix from an agent_id, e.g. 'FE#rem1' -> 'FE',
 * 'AUDITOR#1' -> 'AUDITOR', then canonicalize the resulting role string.
 */
export function roleOf(agentId: string): string {
  const hashIndex = agentId.indexOf('#');
  const rawRole = hashIndex === -1 ? agentId : agentId.slice(0, hashIndex);
  return canonicalizeRole(rawRole);
}

/**
 * Merge the three auditor eras seen in the live event-log corpus
 * (session-data-inventory.md §4 data-quality flag): AUDITOR / AUD / AU all
 * canonicalize to 'AU'. All other role strings pass through unchanged.
 */
export function canonicalizeRole(role: string): string {
  if (role === 'AUDITOR' || role === 'AUD' || role === 'AU') {
    return 'AU';
  }
  return role;
}

export type RoleCategory = 'Impl' | 'Command' | 'Intel' | 'Meta' | 'Gate';

export interface RosterEntry {
  code: string;
  roleCategory: RoleCategory;
  materiaColorKey: string; // RUNTIME token NAME (e.g. '--mg') — never a resolved hex
  specFile: string | null; // filename under ${GANDER_ROOT}/.claude/agents/ — null for DI (no spec)
}

// ROSTER is the single canonical code->spec mapping.
//
// The event log uses 2-letter codes (e.g. `FE#1`) that appear NOWHERE in the
// agent specs or the connectivity graph (which key by spec FILE PATH), and
// initials-derivation is unreliable ('code-auditor'->AU, 'critic'->CR,
// 'researcher'->RA, 'ui-designer'->UI, 'orchestrator'->ORC all fail).
// Therefore the mapping is maintained HERE, verbatim. When a new agent is
// added to the team, extend ROSTER with its
// `{ code, roleCategory, materiaColorKey, specFile }` row.
//
// `specFile` is the filename that matches `parseAllAgents(...).filePath`
// basenames AND connectivity edge `source` path basenames.
//
// Materia-color mapping authority: v2-design-spec.md <tokens> +
// <sample_data_appendix> + DESIGN.md Role/Materia Colors. `materiaColorKey`
// is the RUNTIME token NAME string — never a resolved hex.
export const ROSTER: RosterEntry[] = [
  { code: 'BE', roleCategory: 'Impl', materiaColorKey: '--mg', specFile: 'backend.md' },
  { code: 'FE', roleCategory: 'Impl', materiaColorKey: '--mg', specFile: 'frontend.md' },
  { code: 'DS', roleCategory: 'Impl', materiaColorKey: '--mg', specFile: 'database.md' },
  { code: 'PM', roleCategory: 'Command', materiaColorKey: '--my', specFile: 'pm.md' },
  { code: 'ORC', roleCategory: 'Command', materiaColorKey: '--my', specFile: 'orchestrator.md' },
  { code: 'RA', roleCategory: 'Intel', materiaColorKey: '--mb', specFile: 'researcher.md' },
  { code: 'ST', roleCategory: 'Intel', materiaColorKey: '--mb', specFile: 'statistician.md' },
  { code: 'AR', roleCategory: 'Intel', materiaColorKey: '--mb', specFile: 'archivist.md' },
  { code: 'UI', roleCategory: 'Meta', materiaColorKey: '--mp', specFile: 'ui-designer.md' },
  { code: 'DI', roleCategory: 'Meta', materiaColorKey: '--mp', specFile: null },
  { code: 'HR', roleCategory: 'Meta', materiaColorKey: '--mp', specFile: 'hr.md' },
  { code: 'CR', roleCategory: 'Gate', materiaColorKey: '--mr', specFile: 'critic.md' },
  { code: 'AU', roleCategory: 'Gate', materiaColorKey: '--mr', specFile: 'auditor.md' },
];
