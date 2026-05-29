import type { AgentActivity } from '@gander-studio/shared';

/**
 * Group AgentActivity records by base agent code.
 *
 * "AR#0", "AR#1", "AR#2" → one "AR" entry with summed numeric fields.
 *
 * Base code extraction: agent_id.split('#')[0]
 * If agent_id contains no '#', the whole string is used as the base code.
 *
 * wall_clock_ms semantics (mirrors aggregate-stats.ts lines 65-117):
 *   - undefined if NO contributor in the group has a defined wall_clock_ms
 *   - sum of all defined wall_clock_ms values if at least one contributor is defined
 *
 * The returned AgentActivity[] uses the base code as agent_id.
 * Order is alphabetical by base code (localeCompare) for stable, deterministic rendering.
 */
export function groupAgentsByBaseCode(agents: AgentActivity[]): AgentActivity[] {
  const map = new Map<string, AgentActivity>();
  // Track which base codes have at least one contributor with a defined wall_clock_ms.
  const hasDefinedWallClock = new Set<string>();

  for (const agent of agents) {
    const baseCode = agent.agent_id.split('#')[0];

    if (agent.wall_clock_ms !== undefined) {
      hasDefinedWallClock.add(baseCode);
    }

    const existing = map.get(baseCode);
    if (!existing) {
      map.set(baseCode, {
        agent_id:        baseCode,
        spawns:          agent.spawns,
        completes:       agent.completes,
        feedback_loops:  agent.feedback_loops,
        critique_passes: agent.critique_passes,
        critique_blocks: agent.critique_blocks,
        audit_passes:    agent.audit_passes,
        audit_fails:     agent.audit_fails,
        // Accumulate wall_clock_ms as 0 initially; we resolve undefined/defined
        // semantics at the end using hasDefinedWallClock.
        wall_clock_ms:   agent.wall_clock_ms ?? 0,
      });
    } else {
      existing.spawns          += agent.spawns;
      existing.completes       += agent.completes;
      existing.feedback_loops  += agent.feedback_loops;
      existing.critique_passes += agent.critique_passes;
      existing.critique_blocks += agent.critique_blocks;
      existing.audit_passes    += agent.audit_passes;
      existing.audit_fails     += agent.audit_fails;
      existing.wall_clock_ms    = (existing.wall_clock_ms ?? 0) + (agent.wall_clock_ms ?? 0);
    }
  }

  return Array.from(map.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([baseCode, acc]) => ({
      agent_id:        baseCode,
      spawns:          acc.spawns,
      completes:       acc.completes,
      feedback_loops:  acc.feedback_loops,
      critique_passes: acc.critique_passes,
      critique_blocks: acc.critique_blocks,
      audit_passes:    acc.audit_passes,
      audit_fails:     acc.audit_fails,
      ...(hasDefinedWallClock.has(baseCode) ? { wall_clock_ms: acc.wall_clock_ms } : {}),
    }));
}
