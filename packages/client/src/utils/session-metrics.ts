/**
 * Shared metric utilities for session stat components.
 * Single-source for MetricKey and formatWallClock — consumed by AgentStatPanel
 * and SessionListPage. AgentStatTable keeps its own local copies (hard-guard:
 * do NOT merge TableTab/AgentStatTable).
 */

export type MetricKey = 'spawns' | 'feedback_loops' | 'wall_clock_ms';

export function formatWallClock(ms: number | undefined): string {
  if (ms === undefined) return '—';
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}
