import { describe, it, expect } from 'vitest';
import path from 'node:path';
import { tmpdir } from 'node:os';
import { writeFile, mkdir } from 'node:fs/promises';
import { parseEventLogFiles } from '../event-log-parser.js';
import { computeSessionStats } from '../session-stats.js';
import { SessionStatsSchema } from '@gander-studio/shared';
import type { Session, EventLogEntry } from '@gander-studio/shared';

const FIXTURES_DIR = path.join(import.meta.dirname, 'fixtures');

// Minimal Session stub for computeSessionStats tests
const STUB_SESSION: Session = {
  id: 'test-session',
  sprint: 'prog-studio-sessions-2026-05-s1-backend',
  date: '2026-05-20',
  gap_classes: [],
  filePath: '/tmp/test-session.md',
  source_root: '/tmp',
  agents: [],
  events: [],
};

// ─── 1. parseEventLogFiles: slug filter ──────────────────────────────────────

describe('parseEventLogFiles — slug filter', () => {
  it('returns only entries matching the sprint slug', async () => {
    const results = await parseEventLogFiles(
      FIXTURES_DIR,
      'prog-studio-sessions-2026-05-s1-backend',
    );
    // seq 10 has task_id "OTHER-task-unrelated" — must be excluded
    const seqs = results.map(e => e.seq);
    expect(seqs).not.toContain(10);
    // At least the 9 sprint-matching lines should be present
    expect(results.length).toBeGreaterThanOrEqual(9);
    // All returned entries match the slug
    for (const entry of results) {
      expect(
        entry.task_id.startsWith('prog-studio-sessions-2026-05-s1-backend') ||
        entry.task_id.includes('prog-studio-sessions-2026-05-s1-backend'),
      ).toBe(true);
    }
  });

  it('returns results sorted by seq ascending', async () => {
    const results = await parseEventLogFiles(
      FIXTURES_DIR,
      'prog-studio-sessions-2026-05-s1-backend',
    );
    for (let i = 1; i < results.length; i++) {
      expect(results[i]!.seq).toBeGreaterThanOrEqual(results[i - 1]!.seq);
    }
  });
});

// ─── 2. parseEventLogFiles: malformed JSON skipped ───────────────────────────

describe('parseEventLogFiles — malformed JSON tolerance', () => {
  it('skips malformed lines without throwing', async () => {
    const tmpDir = path.join(tmpdir(), `event-log-test-${Date.now()}`);
    await mkdir(tmpDir, { recursive: true });
    const content = [
      '{"seq":1,"ts":"2026-05-20T09:00:00Z","ev":"SPAWN","task_id":"myscope-t1","agent_id":"PM#1"}',
      'THIS IS NOT JSON',
      '{broken json',
      '{"seq":2,"ts":"2026-05-20T09:01:00Z","ev":"COMPLETE","task_id":"myscope-t1","agent_id":"BE#1"}',
    ].join('\n');
    await writeFile(path.join(tmpDir, 'agent-events-test.jsonl'), content, 'utf-8');

    let results: EventLogEntry[];
    await expect(async () => {
      results = await parseEventLogFiles(tmpDir, 'myscope');
    }).not.toThrow();

    results = await parseEventLogFiles(tmpDir, 'myscope');
    expect(results.length).toBe(2);
    expect(results.map(e => e.seq)).toEqual([1, 2]);
  });
});

// ─── 3. AUDIT_PASS ev value parses (regression guard against z.enum) ─────────

describe('parseEventLogFiles — ev=AUDIT_PASS is accepted', () => {
  it('includes the AUDIT_PASS fixture line in results', async () => {
    const results = await parseEventLogFiles(
      FIXTURES_DIR,
      'prog-studio-sessions-2026-05-s1-backend',
    );
    const auditPassEntry = results.find(e => e.ev === 'AUDIT_PASS');
    expect(auditPassEntry).toBeDefined();
    expect(auditPassEntry?.seq).toBe(8);
  });
});

// ─── 4. AUDIT_FAIL ev value parses (regression guard against z.enum) ─────────

describe('parseEventLogFiles — ev=AUDIT_FAIL is accepted', () => {
  it('includes the AUDIT_FAIL fixture line in results', async () => {
    const results = await parseEventLogFiles(
      FIXTURES_DIR,
      'prog-studio-sessions-2026-05-s1-backend',
    );
    const auditFailEntry = results.find(e => e.ev === 'AUDIT_FAIL');
    expect(auditFailEntry).toBeDefined();
    expect(auditFailEntry?.seq).toBe(9);
  });
});

// ─── 5. computeSessionStats: valid SessionStats ───────────────────────────────

describe('computeSessionStats — output validates SessionStatsSchema', () => {
  it('returns a SessionStats that passes SessionStatsSchema.parse()', async () => {
    const events = await parseEventLogFiles(
      FIXTURES_DIR,
      'prog-studio-sessions-2026-05-s1-backend',
    );
    const stats = computeSessionStats(STUB_SESSION, events);
    // SessionStatsSchema.parse() is also called inside computeSessionStats;
    // this call is an additional external assertion.
    expect(() => SessionStatsSchema.parse(stats)).not.toThrow();
    expect(stats.session_id).toBe('test-session');
    expect(stats.event_count).toBe(events.length);
  });
});

// ─── 6. feedback_loop: CRITIQUE_BLOCK → same-agent SPAWN ─────────────────────

describe('computeSessionStats — feedback_loop detection', () => {
  it('counts CRITIQUE_BLOCK → same-agent SPAWN as a feedback loop', async () => {
    const events = await parseEventLogFiles(
      FIXTURES_DIR,
      'prog-studio-sessions-2026-05-s1-backend',
    );
    const stats = computeSessionStats(STUB_SESSION, events);
    // Fixture: seq 4 = BE#1 CRITIQUE_BLOCK, seq 5 = BE#1 SPAWN → 1 feedback loop
    expect(stats.total_feedback_loops).toBe(1);
  });

  it('attributes the feedback loop to the correct agent', async () => {
    const events = await parseEventLogFiles(
      FIXTURES_DIR,
      'prog-studio-sessions-2026-05-s1-backend',
    );
    const stats = computeSessionStats(STUB_SESSION, events);
    const be1 = stats.agents.find(a => a.agent_id === 'BE#1');
    expect(be1).toBeDefined();
    expect(be1?.feedback_loops).toBe(1);
  });
});

// ─── 7. Per-agent roll-up field names ────────────────────────────────────────

describe('computeSessionStats — per-agent field names', () => {
  it('uses critique_passes, critique_blocks, audit_passes, audit_fails field names', async () => {
    const events = await parseEventLogFiles(
      FIXTURES_DIR,
      'prog-studio-sessions-2026-05-s1-backend',
    );
    const stats = computeSessionStats(STUB_SESSION, events);

    // CR#1 did one CRITIQUE_PASS
    const cr1 = stats.agents.find(a => a.agent_id === 'CR#1');
    expect(cr1).toBeDefined();
    expect(cr1?.critique_passes).toBe(1);
    expect(cr1?.critique_blocks).toBe(0);

    // BE#1 got one CRITIQUE_BLOCK (attributed to BE#1 in fixture)
    const be1 = stats.agents.find(a => a.agent_id === 'BE#1');
    expect(be1).toBeDefined();
    expect(be1?.critique_blocks).toBe(1);

    // SA#1 did one AUDIT_PASS and one AUDIT_FAIL
    const sa1 = stats.agents.find(a => a.agent_id === 'SA#1');
    expect(sa1).toBeDefined();
    expect(sa1?.audit_passes).toBe(1);
    expect(sa1?.audit_fails).toBe(1);
  });
});
