/**
 * Shared metric utilities for session stat components.
 * Single-source for MetricKey, PanelMetricKey, formatWallClock, and
 * agentDisplayConfig — consumed by AgentStatPanel and SessionListPage.
 *
 * AgentStatTable keeps its own local copies of the 3-key MetricKey and
 * METRIC_LABEL (hard-guard: do NOT merge TableTab/AgentStatTable into this
 * file). For that reason, the exported MetricKey union remains the 3-key
 * form to preserve SessionListPage→AgentStatTable structural compatibility.
 *
 * 'files_touched' is surfaced via PanelMetricKey (= MetricKey | 'files_touched')
 * which is used by agentDisplayConfig and AgentStatPanel's internal rendering
 * only — it never reaches AgentStatTable.
 */

/** Core metric keys — shared with AgentStatTable's local copy (3-key). */
export type MetricKey = 'spawns' | 'feedback_loops' | 'wall_clock_ms';

/**
 * Extended metric keys for AgentStatPanel role-aware rendering.
 * Adds 'files_touched' to the core set; never passed to AgentStatTable.
 */
export type PanelMetricKey = MetricKey | 'files_touched';

export function formatWallClock(ms: number | undefined): string {
  if (ms === undefined) return '—';
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

/**
 * Single-source role→{grid,metrics} mapping for AgentStatPanel.
 *
 * Base-code extraction mirrors group-agents.ts: agent_id.split('#')[0].
 *
 * PINNED match sets (corpus-confirmed):
 *   base === 'CR'                        → critique grid, no metric column
 *   base === 'AUD' || base === 'AUDITOR' → audit grid, no metric column
 *   otherwise                             → no grid, role metric list
 */
export function agentDisplayConfig(agentId: string): {
  grid: 'critique' | 'audit' | 'none';
  metrics: PanelMetricKey[];
} {
  const base = agentId.split('#')[0];
  if (base === 'CR') {
    return { grid: 'critique', metrics: [] };
  }
  if (base === 'AUD' || base === 'AUDITOR') {
    return { grid: 'audit', metrics: [] };
  }
  return { grid: 'none', metrics: ['files_touched', 'feedback_loops', 'wall_clock_ms'] };
}
