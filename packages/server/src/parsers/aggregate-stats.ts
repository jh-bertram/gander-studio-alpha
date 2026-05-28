import { SessionStatsSchema } from '@gander-studio/shared';
import type { SessionStats, AgentActivity } from '@gander-studio/shared';

/**
 * Aggregate an array of per-session SessionStats objects into a single
 * SessionStats whose numeric fields are the sums across all sessions.
 *
 * - session_id: synthetic join key "aggregate:{sorted sessionIds joined by ','}"
 * - total_* fields: SUM across sessions
 * - event_count: SUM across sessions
 * - wall_clock_ms: SUM of defined values; omitted if all sessions had undefined
 * - agents: merged by agent_id, summing all numeric fields (including wall_clock_ms)
 *
 * Validates output with SessionStatsSchema.parse() before returning.
 */
export function aggregateSessionStats(
  perSessionStats: SessionStats[],
  sessionIds: string[],
): SessionStats {
  // Synthetic session_id from sorted input IDs
  const session_id = 'aggregate:' + [...sessionIds].sort().join(',');

  let total_spawns = 0;
  let total_completes = 0;
  let total_feedback_loops = 0;
  let total_critique_passes = 0;
  let total_critique_blocks = 0;
  let total_audit_passes = 0;
  let total_audit_fails = 0;
  let event_count = 0;
  let wall_clock_sum = 0;
  let wall_clock_defined = false;

  // Map from agent_id → mutable accumulator (all numeric fields)
  const agentMap = new Map<
    string,
    {
      agent_id: string;
      spawns: number;
      completes: number;
      feedback_loops: number;
      critique_passes: number;
      critique_blocks: number;
      audit_passes: number;
      audit_fails: number;
      wall_clock_ms: number;
    }
  >();

  for (const stats of perSessionStats) {
    total_spawns += stats.total_spawns;
    total_completes += stats.total_completes;
    total_feedback_loops += stats.total_feedback_loops;
    total_critique_passes += stats.total_critique_passes;
    total_critique_blocks += stats.total_critique_blocks;
    total_audit_passes += stats.total_audit_passes;
    total_audit_fails += stats.total_audit_fails;
    event_count += stats.event_count;

    if (stats.wall_clock_ms !== undefined) {
      wall_clock_sum += stats.wall_clock_ms;
      wall_clock_defined = true;
    }

    for (const agent of stats.agents) {
      const existing = agentMap.get(agent.agent_id);
      if (existing) {
        existing.spawns += agent.spawns;
        existing.completes += agent.completes;
        existing.feedback_loops += agent.feedback_loops;
        existing.critique_passes += agent.critique_passes;
        existing.critique_blocks += agent.critique_blocks;
        existing.audit_passes += agent.audit_passes;
        existing.audit_fails += agent.audit_fails;
        existing.wall_clock_ms += agent.wall_clock_ms ?? 0;
      } else {
        agentMap.set(agent.agent_id, {
          agent_id: agent.agent_id,
          spawns: agent.spawns,
          completes: agent.completes,
          feedback_loops: agent.feedback_loops,
          critique_passes: agent.critique_passes,
          critique_blocks: agent.critique_blocks,
          audit_passes: agent.audit_passes,
          audit_fails: agent.audit_fails,
          wall_clock_ms: agent.wall_clock_ms ?? 0,
        });
      }
    }
  }

  // Convert agent accumulator map to AgentActivity[], converting wall_clock_ms=0
  // back to undefined when no session contributed a real value for that agent.
  // We track this by checking: if every contributing session had wall_clock_ms
  // undefined for this agent, the sum stays 0 and we should omit the field.
  // Because we initialize to (agent.wall_clock_ms ?? 0) we can't distinguish
  // "all-undefined" from "all-zero". Use a separate set to track defined agents.
  const agentWallClockDefined = new Set<string>();
  for (const stats of perSessionStats) {
    for (const agent of stats.agents) {
      if (agent.wall_clock_ms !== undefined) {
        agentWallClockDefined.add(agent.agent_id);
      }
    }
  }

  const agents: AgentActivity[] = Array.from(agentMap.values()).map((acc) => ({
    agent_id: acc.agent_id,
    spawns: acc.spawns,
    completes: acc.completes,
    feedback_loops: acc.feedback_loops,
    critique_passes: acc.critique_passes,
    critique_blocks: acc.critique_blocks,
    audit_passes: acc.audit_passes,
    audit_fails: acc.audit_fails,
    ...(agentWallClockDefined.has(acc.agent_id) ? { wall_clock_ms: acc.wall_clock_ms } : {}),
  }));

  const raw = {
    session_id,
    total_spawns,
    total_completes,
    total_feedback_loops,
    total_critique_passes,
    total_critique_blocks,
    total_audit_passes,
    total_audit_fails,
    agents,
    ...(wall_clock_defined ? { wall_clock_ms: wall_clock_sum } : {}),
    event_count,
  };

  return SessionStatsSchema.parse(raw);
}
