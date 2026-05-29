import { describe, it, expect } from 'vitest';
import { groupAgentsByBaseCode } from '../group-agents';
import type { AgentActivity } from '@gander-studio/shared';

// Helper to create a minimal AgentActivity
function makeAgent(
  agent_id: string,
  overrides: Partial<Omit<AgentActivity, 'agent_id'>> = {},
): AgentActivity {
  return {
    agent_id,
    spawns:          1,
    completes:       1,
    feedback_loops:  0,
    critique_passes: 0,
    critique_blocks: 0,
    audit_passes:    1,
    audit_fails:     0,
    ...overrides,
  };
}

describe('groupAgentsByBaseCode', () => {
  // (a) Empty array returns []
  it('returns an empty array for empty input', () => {
    expect(groupAgentsByBaseCode([])).toEqual([]);
  });

  // (d) An id with no '#' passes through as its own group
  it('passes through an agent_id with no # as its own group', () => {
    const input = [makeAgent('AR', { spawns: 3, completes: 2 })];
    const result = groupAgentsByBaseCode(input);
    expect(result).toHaveLength(1);
    expect(result[0].agent_id).toBe('AR');
    expect(result[0].spawns).toBe(3);
    expect(result[0].completes).toBe(2);
  });

  // (a) AR#0/AR#1/AR#2 → one "AR" with summed fields
  it('collapses AR#0, AR#1, AR#2 into a single AR entry with summed numeric fields', () => {
    const input: AgentActivity[] = [
      makeAgent('AR#0', { spawns: 2, completes: 2, feedback_loops: 1, critique_passes: 1, critique_blocks: 0, audit_passes: 2, audit_fails: 0 }),
      makeAgent('AR#1', { spawns: 3, completes: 3, feedback_loops: 0, critique_passes: 2, critique_blocks: 1, audit_passes: 2, audit_fails: 1 }),
      makeAgent('AR#2', { spawns: 1, completes: 1, feedback_loops: 2, critique_passes: 0, critique_blocks: 0, audit_passes: 1, audit_fails: 0 }),
    ];
    const result = groupAgentsByBaseCode(input);
    expect(result).toHaveLength(1);

    const ar = result[0];
    expect(ar.agent_id).toBe('AR');
    expect(ar.spawns).toBe(6);
    expect(ar.completes).toBe(6);
    expect(ar.feedback_loops).toBe(3);
    expect(ar.critique_passes).toBe(3);
    expect(ar.critique_blocks).toBe(1);
    expect(ar.audit_passes).toBe(5);
    expect(ar.audit_fails).toBe(1);
  });

  // (b) wall_clock_ms all-undefined → stays undefined in result
  it('keeps wall_clock_ms undefined when all contributors have undefined wall_clock_ms', () => {
    const input: AgentActivity[] = [
      makeAgent('AR#0', { wall_clock_ms: undefined }),
      makeAgent('AR#1', { wall_clock_ms: undefined }),
      makeAgent('AR#2', { wall_clock_ms: undefined }),
    ];
    const result = groupAgentsByBaseCode(input);
    expect(result).toHaveLength(1);
    expect(result[0].wall_clock_ms).toBeUndefined();
  });

  // (c) Some defined → sum of only defined values
  it('sums only defined wall_clock_ms values when at least one is defined', () => {
    const input: AgentActivity[] = [
      makeAgent('AR#0', { wall_clock_ms: undefined }),
      makeAgent('AR#1', { wall_clock_ms: 5000 }),
      makeAgent('AR#2', { wall_clock_ms: 3000 }),
    ];
    const result = groupAgentsByBaseCode(input);
    expect(result).toHaveLength(1);
    // Only the two defined values should be summed; the undefined one contributes 0
    expect(result[0].wall_clock_ms).toBe(8000);
  });

  // (e) Mixed roster with multiple base codes preserves all
  it('preserves all base codes for a mixed roster', () => {
    const input: AgentActivity[] = [
      makeAgent('AR#0', { spawns: 2 }),
      makeAgent('PM#0', { spawns: 4 }),
      makeAgent('AR#1', { spawns: 3 }),
    ];
    const result = groupAgentsByBaseCode(input);
    expect(result).toHaveLength(2);

    // Alphabetical order: AR before PM
    expect(result[0].agent_id).toBe('AR');
    expect(result[0].spawns).toBe(5); // AR#0(2) + AR#1(3)
    expect(result[1].agent_id).toBe('PM');
    expect(result[1].spawns).toBe(4);
  });

  // Alphabetical sort: AR before PM
  it('returns results sorted alphabetically by base code', () => {
    const input: AgentActivity[] = [
      makeAgent('PM#0'),
      makeAgent('AR#0'),
    ];
    const result = groupAgentsByBaseCode(input);
    expect(result[0].agent_id).toBe('AR');
    expect(result[1].agent_id).toBe('PM');
  });

  // Mixed: AR#0 + AR#1 + PM#0 → AR has sum of AR#0+AR#1; PM has PM#0's values
  it('correctly groups AR#0 + AR#1 + PM#0: AR sums, PM unchanged', () => {
    const input: AgentActivity[] = [
      makeAgent('AR#0', { spawns: 2, completes: 2, wall_clock_ms: 1000 }),
      makeAgent('AR#1', { spawns: 4, completes: 3, wall_clock_ms: 2000 }),
      makeAgent('PM#0', { spawns: 1, completes: 1, wall_clock_ms: 500 }),
    ];
    const result = groupAgentsByBaseCode(input);
    expect(result).toHaveLength(2);

    const ar = result.find((r) => r.agent_id === 'AR');
    const pm = result.find((r) => r.agent_id === 'PM');

    expect(ar).toBeDefined();
    expect(ar!.spawns).toBe(6);
    expect(ar!.completes).toBe(5);
    expect(ar!.wall_clock_ms).toBe(3000);

    expect(pm).toBeDefined();
    expect(pm!.spawns).toBe(1);
    expect(pm!.completes).toBe(1);
    expect(pm!.wall_clock_ms).toBe(500);
  });
});
