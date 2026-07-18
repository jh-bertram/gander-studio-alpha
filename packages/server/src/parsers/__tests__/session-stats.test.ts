/**
 * session-stats.ts — files_touched unit tests
 *
 * Verifies that AgentActivity.files_touched counts distinct output_files
 * across all events for an agent (deduplicating repeated references).
 */

import { describe, it, expect } from 'vitest';
import { computeSessionStats } from '../session-stats.js';
import type { Session, EventLogEntry } from '@gander-studio/shared';

const STUB_SESSION: Session = {
  id: 'files-touched-test',
  sprint: 'files-touched-test',
  date: '2026-06-30',
  gap_classes: [],
  has_after_action: true,
  filePath: '/tmp/files-touched-test.md',
  source_root: '/tmp',
  agents: [],
  events: [],
};

function makeEvent(overrides: Partial<EventLogEntry>): EventLogEntry {
  return {
    seq: 1,
    ts: '2026-06-30T00:00:00.000Z',
    ev: 'SPAWN',
    task_id: 'files-touched-test',
    agent_id: 'BE#1',
    parent_id: 'ORC#1',
    edge_label: 'spawn',
    output_files: [],
    ...overrides,
  };
}

describe('files_touched — distinct output_files per agent', () => {
  it('counts 3 distinct files when one file is repeated across 2 events (4 total refs)', () => {
    const events: EventLogEntry[] = [
      makeEvent({ seq: 1, ev: 'SPAWN', agent_id: 'BE#1', output_files: [] }),
      makeEvent({ seq: 2, ev: 'COMPLETE', agent_id: 'BE#1', output_files: ['a.ts', 'b.ts', 'c.ts'] }),
      makeEvent({ seq: 3, ev: 'COMPLETE', agent_id: 'BE#1', output_files: ['a.ts'] }), // 'a.ts' repeated
    ];

    const stats = computeSessionStats(STUB_SESSION, events);
    const be1 = stats.agents.find(a => a.agent_id === 'BE#1');
    expect(be1).toBeDefined();
    // 4 total refs (a, b, c, a) but only 3 distinct files
    expect(be1?.files_touched).toBe(3);
  });

  it('reports files_touched === 0 when agent has no output_files', () => {
    const events: EventLogEntry[] = [
      makeEvent({ seq: 1, ev: 'SPAWN', agent_id: 'FE#1', output_files: [] }),
      makeEvent({ seq: 2, ev: 'COMPLETE', agent_id: 'FE#1', output_files: undefined }),
    ];

    const stats = computeSessionStats(STUB_SESSION, events);
    const fe1 = stats.agents.find(a => a.agent_id === 'FE#1');
    expect(fe1).toBeDefined();
    expect(fe1?.files_touched).toBe(0);
  });
});
