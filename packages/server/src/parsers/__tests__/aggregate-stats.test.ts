import { describe, it, expect } from 'vitest';
import { aggregateSessionStats } from '../aggregate-stats.js';
import { SessionStatsSchema } from '@gander-studio/shared';
import type { SessionStats } from '@gander-studio/shared';

// ---------------------------------------------------------------------------
// Fixtures: two minimal SessionStats objects with known numeric values.
// All flat total_* field names used — no nested 'totals' object.
// ---------------------------------------------------------------------------

const FIXTURE_A: SessionStats = {
  session_id: 'session-alpha',
  total_spawns: 7,
  total_completes: 5,
  total_feedback_loops: 2,
  total_critique_passes: 3,
  total_critique_blocks: 1,
  total_audit_passes: 4,
  total_audit_fails: 1,
  agents: [
    {
      agent_id: 'BE#1',
      spawns: 4,
      completes: 3,
      feedback_loops: 1,
      critique_passes: 0,
      critique_blocks: 1,
      audit_passes: 2,
      audit_fails: 0,
      wall_clock_ms: 3000,
    },
    {
      agent_id: 'PM#1',
      spawns: 3,
      completes: 2,
      feedback_loops: 1,
      critique_passes: 3,
      critique_blocks: 0,
      audit_passes: 2,
      audit_fails: 1,
      wall_clock_ms: 1500,
    },
  ],
  wall_clock_ms: 5000,
  event_count: 12,
};

const FIXTURE_B: SessionStats = {
  session_id: 'session-beta',
  total_spawns: 8,
  total_completes: 6,
  total_feedback_loops: 1,
  total_critique_passes: 2,
  total_critique_blocks: 2,
  total_audit_passes: 3,
  total_audit_fails: 2,
  agents: [
    {
      agent_id: 'BE#1',
      spawns: 5,
      completes: 4,
      feedback_loops: 1,
      critique_passes: 0,
      critique_blocks: 2,
      audit_passes: 1,
      audit_fails: 1,
      wall_clock_ms: 2000,
    },
    {
      agent_id: 'FE#1',
      spawns: 3,
      completes: 2,
      feedback_loops: 0,
      critique_passes: 2,
      critique_blocks: 0,
      audit_passes: 2,
      audit_fails: 1,
    },
  ],
  wall_clock_ms: 4000,
  event_count: 10,
};

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('aggregateSessionStats — flat total_* sums', () => {
  it('sums total_spawns across both fixtures (7 + 8 = 15)', () => {
    const result = aggregateSessionStats([FIXTURE_A, FIXTURE_B], ['session-alpha', 'session-beta']);
    expect(result.total_spawns).toBe(15);
  });

  it('sums total_completes (5 + 6 = 11)', () => {
    const result = aggregateSessionStats([FIXTURE_A, FIXTURE_B], ['session-alpha', 'session-beta']);
    expect(result.total_completes).toBe(11);
  });

  it('sums total_feedback_loops (2 + 1 = 3)', () => {
    const result = aggregateSessionStats([FIXTURE_A, FIXTURE_B], ['session-alpha', 'session-beta']);
    expect(result.total_feedback_loops).toBe(3);
  });

  it('sums total_critique_passes (3 + 2 = 5)', () => {
    const result = aggregateSessionStats([FIXTURE_A, FIXTURE_B], ['session-alpha', 'session-beta']);
    expect(result.total_critique_passes).toBe(5);
  });

  it('sums total_critique_blocks (1 + 2 = 3)', () => {
    const result = aggregateSessionStats([FIXTURE_A, FIXTURE_B], ['session-alpha', 'session-beta']);
    expect(result.total_critique_blocks).toBe(3);
  });

  it('sums total_audit_passes (4 + 3 = 7)', () => {
    const result = aggregateSessionStats([FIXTURE_A, FIXTURE_B], ['session-alpha', 'session-beta']);
    expect(result.total_audit_passes).toBe(7);
  });

  it('sums total_audit_fails (1 + 2 = 3)', () => {
    const result = aggregateSessionStats([FIXTURE_A, FIXTURE_B], ['session-alpha', 'session-beta']);
    expect(result.total_audit_fails).toBe(3);
  });
});

describe('aggregateSessionStats — event_count sum', () => {
  it('sums event_count across sessions (12 + 10 = 22)', () => {
    const result = aggregateSessionStats([FIXTURE_A, FIXTURE_B], ['session-alpha', 'session-beta']);
    expect(result.event_count).toBe(22);
  });
});

describe('aggregateSessionStats — wall_clock_ms sum', () => {
  it('sums wall_clock_ms across sessions (5000 + 4000 = 9000)', () => {
    const result = aggregateSessionStats([FIXTURE_A, FIXTURE_B], ['session-alpha', 'session-beta']);
    expect(result.wall_clock_ms).toBe(9000);
  });

  it('omits wall_clock_ms when all sessions have it undefined', () => {
    const a: SessionStats = { ...FIXTURE_A, wall_clock_ms: undefined };
    const b: SessionStats = { ...FIXTURE_B, wall_clock_ms: undefined };
    const result = aggregateSessionStats([a, b], ['session-alpha', 'session-beta']);
    expect(result.wall_clock_ms).toBeUndefined();
  });

  it('sums only defined wall_clock_ms values (skips undefined)', () => {
    const a: SessionStats = { ...FIXTURE_A, wall_clock_ms: 3000 };
    const b: SessionStats = { ...FIXTURE_B, wall_clock_ms: undefined };
    const result = aggregateSessionStats([a, b], ['session-alpha', 'session-beta']);
    expect(result.wall_clock_ms).toBe(3000);
  });
});

describe('aggregateSessionStats — agent merging by agent_id', () => {
  it('merges BE#1 across both fixtures (spawns: 4 + 5 = 9)', () => {
    const result = aggregateSessionStats([FIXTURE_A, FIXTURE_B], ['session-alpha', 'session-beta']);
    const be1 = result.agents.find((a) => a.agent_id === 'BE#1');
    expect(be1).toBeDefined();
    expect(be1!.spawns).toBe(9);
  });

  it('merges BE#1 wall_clock_ms (3000 + 2000 = 5000)', () => {
    const result = aggregateSessionStats([FIXTURE_A, FIXTURE_B], ['session-alpha', 'session-beta']);
    const be1 = result.agents.find((a) => a.agent_id === 'BE#1');
    expect(be1!.wall_clock_ms).toBe(5000);
  });

  it('keeps PM#1 from FIXTURE_A only (present in one session)', () => {
    const result = aggregateSessionStats([FIXTURE_A, FIXTURE_B], ['session-alpha', 'session-beta']);
    const pm1 = result.agents.find((a) => a.agent_id === 'PM#1');
    expect(pm1).toBeDefined();
    expect(pm1!.spawns).toBe(3);
    expect(pm1!.wall_clock_ms).toBe(1500);
  });

  it('includes FE#1 from FIXTURE_B only; wall_clock_ms absent when undefined in source', () => {
    const result = aggregateSessionStats([FIXTURE_A, FIXTURE_B], ['session-alpha', 'session-beta']);
    const fe1 = result.agents.find((a) => a.agent_id === 'FE#1');
    expect(fe1).toBeDefined();
    expect(fe1!.spawns).toBe(3);
    expect(fe1!.wall_clock_ms).toBeUndefined();
  });
});

describe('aggregateSessionStats — session_id synthetic key', () => {
  it('sets session_id to aggregate:{sorted ids}', () => {
    const result = aggregateSessionStats([FIXTURE_A, FIXTURE_B], ['session-beta', 'session-alpha']);
    // IDs sorted alphabetically
    expect(result.session_id).toBe('aggregate:session-alpha,session-beta');
  });
});

describe('aggregateSessionStats — SessionStatsSchema.parse', () => {
  it('passes SessionStatsSchema.parse without throwing', () => {
    const result = aggregateSessionStats([FIXTURE_A, FIXTURE_B], ['session-alpha', 'session-beta']);
    expect(() => SessionStatsSchema.parse(result)).not.toThrow();
  });

  it('produces a result with no nested totals object (flat schema only)', () => {
    const result = aggregateSessionStats([FIXTURE_A, FIXTURE_B], ['session-alpha', 'session-beta']);
    // Verify there is no 'totals' key — schema is FLAT
    expect(result).not.toHaveProperty('totals');
  });
});
