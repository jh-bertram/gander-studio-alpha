import { describe, it, expect, afterAll } from 'vitest';
import { mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { collectSessions } from '../../session-list.js';
import { sprintRoot, isDocumented, matchesSlug } from '../../session-slug-match.js';

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

// Minimal Format B post-mortem fixture — frontmatter-less, distinct bodies per root
const FORMAT_B_ROOT_A = `# Post-Mortem: Sprint Alpha Session

**Date:** 2026-01-15

## Overview
Root A session content — distinguishable from root B.
`;

const FORMAT_B_ROOT_B = `# Post-Mortem: Sprint Beta Session

**Date:** 2026-02-20

## Overview
Root B session content — distinguishable from root A.
`;

// After-action doc fixture (Format B, no frontmatter)
function makeAfterAction(title: string, date: string): string {
  return `# After-Action: ${title}\n\n**Date:** ${date}\n\n## Overview\nContent.\n`;
}

// Minimal valid JSONL event line
function makeEvent(seq: number, ts: string, taskId: string, agentId: string, ev = 'SPAWN'): string {
  return JSON.stringify({ seq, ts, ev, task_id: taskId, agent_id: agentId });
}

// Write a JSONL event file with given lines
async function writeEventFile(dir: string, filename: string, lines: string[]): Promise<void> {
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, filename), lines.join('\n') + '\n', 'utf-8');
}

// ---------------------------------------------------------------------------
// Shared cleanup
// ---------------------------------------------------------------------------

const tempDirs: string[] = [];

afterAll(async () => {
  for (const dir of tempDirs) {
    await rm(dir, { recursive: true, force: true });
  }
});

// ---------------------------------------------------------------------------
// Existing tests (SC7): multi-root dedup
// ---------------------------------------------------------------------------

describe('collectSessions — multi-root dedup (SC7)', () => {
  it('returns two distinct Session entries when two roots each contain foo.md', async () => {
    const rootA = await mkdtemp(path.join(os.tmpdir(), 'session-list-test-a-'));
    const rootB = await mkdtemp(path.join(os.tmpdir(), 'session-list-test-b-'));
    tempDirs.push(rootA, rootB);

    const pmDirA = path.join(rootA, 'docs', 'post-mortems');
    const pmDirB = path.join(rootB, 'docs', 'post-mortems');
    await mkdir(pmDirA, { recursive: true });
    await mkdir(pmDirB, { recursive: true });

    await writeFile(path.join(pmDirA, 'foo.md'), FORMAT_B_ROOT_A, 'utf-8');
    await writeFile(path.join(pmDirB, 'foo.md'), FORMAT_B_ROOT_B, 'utf-8');

    const result = await collectSessions([rootA, rootB], 50);

    // Both sessions must be present — composite key (source_root, id) prevents collapse
    expect(result.sessions).toHaveLength(2);
    expect(result.skipped).toBe(0);

    const roots = result.sessions.map((s) => s.source_root);
    expect(roots).toContain(rootA);
    expect(roots).toContain(rootB);

    // Both have the same id (slug of 'foo') but different source_roots
    const ids = result.sessions.map((s) => s.id);
    expect(ids[0]).toBe('foo');
    expect(ids[1]).toBe('foo');

    // source_roots must differ — this is the discriminating field
    const sessionA = result.sessions.find((s) => s.source_root === rootA);
    const sessionB = result.sessions.find((s) => s.source_root === rootB);
    expect(sessionA).toBeDefined();
    expect(sessionB).toBeDefined();
    expect(sessionA?.source_root).not.toBe(sessionB?.source_root);
  });

  it('counts skipped when a file is unparseable', async () => {
    const rootC = await mkdtemp(path.join(os.tmpdir(), 'session-list-test-c-'));
    tempDirs.push(rootC);

    const pmDirC = path.join(rootC, 'docs', 'post-mortems');
    await mkdir(pmDirC, { recursive: true });

    await writeFile(path.join(pmDirC, 'bad.md'), Buffer.from([0xff, 0xfe, 0x00]), 'binary');
    await writeFile(path.join(pmDirC, 'good.md'), FORMAT_B_ROOT_A, 'utf-8');

    const result = await collectSessions([rootC], 50);

    expect(Array.isArray(result.sessions)).toBe(true);
    expect(typeof result.skipped).toBe('number');
  });

  it('handles missing post-mortems directory gracefully (returns empty, skipped=0)', async () => {
    const rootD = await mkdtemp(path.join(os.tmpdir(), 'session-list-test-d-'));
    tempDirs.push(rootD);

    const result = await collectSessions([rootD], 50);
    expect(result.sessions).toHaveLength(0);
    expect(result.skipped).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// sprintRoot / isDocumented unit tests
// ---------------------------------------------------------------------------

describe('sprintRoot — unit', () => {
  it('returns null for denylist entries', () => {
    expect(sprintRoot('system')).toBeNull();
    expect(sprintRoot('session-resume')).toBeNull();
    expect(sprintRoot('hone-2026-05-27-2')).toBeNull();
    expect(sprintRoot('agent-improvement-2026-05-20-1')).toBeNull();
    expect(sprintRoot('gander-p8-seq-integrity-hook-fix-PROPOSED')).toBeNull();
  });

  it('strips trailing noise and returns shaped root', () => {
    // agent code + numeric sub-id suffix
    expect(sprintRoot('gander-studio-p2-agent-cards-FE-001a')).toBe('gander-studio-p2-agent-cards');
    expect(sprintRoot('gander-studio-p2-agent-cards-DS-001')).toBe('gander-studio-p2-agent-cards');
    // ceremony
    expect(sprintRoot('prog-studio-vision-2026-06-postmortem')).toBe('prog-studio-vision');
    // unix timestamp
    expect(sprintRoot('gander-studio-p9-BE-1782020002')).toBe('gander-studio-p9');
  });

  it('never strips a p\\d+ phase token', () => {
    expect(sprintRoot('gander-studio-p3')).toBe('gander-studio-p3');
    expect(sprintRoot('gander-studio-p4-foo')).toBe('gander-studio-p4-foo');
  });

  it('returns null for ids failing the shape gate', () => {
    expect(sprintRoot('gander-debt-drain')).toBeNull();
    expect(sprintRoot('some-random-task')).toBeNull();
  });

  it('passes gander-meta-* ids with descriptive segment', () => {
    expect(sprintRoot('gander-meta-guarded-push')).toBe('gander-meta-guarded-push');
  });

  it('passes prog-* ids', () => {
    expect(sprintRoot('prog-studio-vision-2026-06')).toBe('prog-studio-vision');
    expect(sprintRoot('prog-foo-s5-bar-FE-001')).toBe('prog-foo-s5-bar');
    expect(sprintRoot('prog-foo-s4-baz')).toBe('prog-foo-s4-baz');
  });
});

describe('isDocumented — unit', () => {
  it('matches exact doc id', () => {
    expect(isDocumented('prog-studio-vision-2026-06', ['prog-studio-vision-2026-06'], [])).toBe(true);
  });

  it('matches via boundary prefix (suffix-agnostic)', () => {
    const docIds = ['prog-studio-vision-2026-06'];
    const docRoots: string[] = [];
    expect(isDocumented('prog-studio-vision-2026-06-postmortem', docIds, docRoots)).toBe(true);
    expect(isDocumented('prog-studio-vision-2026-06-s5-delete', docIds, docRoots)).toBe(true);
    expect(isDocumented('prog-studio-vision-2026-06-s1-token-root-fix', docIds, docRoots)).toBe(true);
  });

  it('does NOT suppress a different sprint (p3 vs p4)', () => {
    const docIds = ['gander-studio-p3'];
    const docRoots = ['gander-studio-p3'];
    // p4 task: sprintRoot = 'gander-studio-p4-foo', not equal to 'gander-studio-p3'
    expect(isDocumented('gander-studio-p4-foo-FE-001', docIds, docRoots)).toBe(false);
  });

  it('does NOT suppress via sprintRoot when roots differ', () => {
    // 'gander-studio-p3-foo' doc root ≠ 'gander-studio-p3-food-bar' event root
    const docIds = ['gander-studio-p3-foo'];
    const docRoots = ['gander-studio-p3-foo'];
    expect(isDocumented('gander-studio-p3-food-bar-BE-001', docIds, docRoots)).toBe(false);
  });

  it('matches via sprintRoot equality (date-suffixed doc vs bare sub-task)', () => {
    // Doc: gander-studio-p5-debt-drain-2026-06-23 → sprintRoot = 'gander-studio-p5-debt-drain'
    // Event: gander-studio-p5-debt-drain-BE-001 → sprintRoot = 'gander-studio-p5-debt-drain'
    const docIds = ['gander-studio-p5-debt-drain-2026-06-23'];
    const docRoots = [sprintRoot('gander-studio-p5-debt-drain-2026-06-23')!];
    expect(isDocumented('gander-studio-p5-debt-drain-BE-001', docIds, docRoots)).toBe(true);
  });
});

describe('matchesSlug — unit', () => {
  it('matches by prefix', () => {
    expect(matchesSlug('gander-studio-p2-foo-FE-001', 'gander-studio-p2-foo')).toBe(true);
  });
  it('matches by substring', () => {
    expect(matchesSlug('some-task-with-gander-in-it', 'gander')).toBe(true);
  });
  it('does not match unrelated id', () => {
    expect(matchesSlug('system', 'gander-studio-p2-foo')).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// (a) DOC-SHADOW: documented sprint appears once; no synthetic shadow
// ---------------------------------------------------------------------------

describe('(a) doc-shadow — prog-studio-vision-2026-06', () => {
  it('appears exactly once (doc-backed, has_after_action=true); no synthetic', async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), 'sl-test-a-'));
    tempDirs.push(root);

    // Doc-backed after-action
    const aaDir = path.join(root, 'docs', 'after-actions');
    await mkdir(aaDir, { recursive: true });
    await writeFile(
      path.join(aaDir, 'prog-studio-vision-2026-06.md'),
      makeAfterAction('prog-studio-vision-2026-06', '2026-06-20'),
      'utf-8',
    );

    // Event log entries: the program id, postmortem, and a sub-sprint
    const eventsDir = path.join(root, 'docs', 'events');
    await writeEventFile(eventsDir, 'agent-events-2026-06-20.jsonl', [
      makeEvent(1, '2026-06-20T06:43:43Z', 'prog-studio-vision-2026-06', 'ORC#0', 'SPAWN'),
      makeEvent(2, '2026-06-20T07:00:00Z', 'prog-studio-vision-2026-06-postmortem', 'AR#1', 'SPAWN'),
      makeEvent(3, '2026-06-20T07:01:00Z', 'prog-studio-vision-2026-06-s5-delete', 'WF#1', 'SPAWN'),
    ]);

    const result = await collectSessions([root], 50);

    // Exactly ONE session for this sprint family
    const matching = result.sessions.filter((s) =>
      s.id.startsWith('prog-studio-vision'),
    );
    expect(matching).toHaveLength(1);
    expect(matching[0]!.has_after_action).toBe(true);
    expect(matching[0]!.filePath).not.toBe('');
    // No -postmortem or -s5 shadow
    const shadowIds = result.sessions.map((s) => s.id).filter((id) =>
      id.includes('postmortem') || id.includes('s5-delete'),
    );
    expect(shadowIds).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// (b) SUB-TASK COLLAPSE: two sub-tasks → one synthetic
// ---------------------------------------------------------------------------

describe('(b) sub-task collapse — gander-studio-p2-agent-cards', () => {
  it('two agent-suffixed sub-tasks collapse into one synthetic session', async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), 'sl-test-b-'));
    tempDirs.push(root);

    const eventsDir = path.join(root, 'docs', 'events');
    await writeEventFile(eventsDir, 'agent-events-2026-05-01.jsonl', [
      makeEvent(1, '2026-05-01T10:00:00Z', 'gander-studio-p2-agent-cards-FE-001a', 'FE#1', 'SPAWN'),
      makeEvent(2, '2026-05-01T10:30:00Z', 'gander-studio-p2-agent-cards-FE-001a', 'FE#1', 'COMPLETE'),
      makeEvent(3, '2026-05-01T11:00:00Z', 'gander-studio-p2-agent-cards-DS-001', 'DS#1', 'SPAWN'),
      makeEvent(4, '2026-05-01T11:30:00Z', 'gander-studio-p2-agent-cards-DS-001', 'DS#1', 'COMPLETE'),
    ]);

    const result = await collectSessions([root], 50);

    const synthetics = result.sessions.filter((s) => !s.has_after_action);
    expect(synthetics).toHaveLength(1);

    const s = synthetics[0]!;
    expect(s.id).toBe('gander-studio-p2-agent-cards');
    expect(s.has_after_action).toBe(false);
    expect(s.filePath).toBe('');
    expect(s.agents.length).toBeGreaterThan(0);
  });
});

// ---------------------------------------------------------------------------
// (c) NOISE REJECTED: denylist ids produce no synthetic
// ---------------------------------------------------------------------------

describe('(c) noise rejected — denylist ids', () => {
  it('system, session-resume, agent-improvement-*, hone-*, *-PROPOSED → no synthetic', async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), 'sl-test-c-'));
    tempDirs.push(root);

    const eventsDir = path.join(root, 'docs', 'events');
    await writeEventFile(eventsDir, 'agent-events-2026-05-01.jsonl', [
      makeEvent(1, '2026-05-01T10:00:00Z', 'system', 'ORC#0', 'BACKFILL_SCAN'),
      makeEvent(2, '2026-05-01T10:01:00Z', 'session-resume', 'ORC#0', 'SPAWN'),
      makeEvent(3, '2026-05-01T10:02:00Z', 'agent-improvement-2026-05-20-1', 'HR#1', 'SPAWN'),
      makeEvent(4, '2026-05-01T10:03:00Z', 'hone-2026-05-27-2', 'HR#1', 'SPAWN'),
      makeEvent(5, '2026-05-01T10:04:00Z', 'gander-p8-seq-integrity-hook-fix-PROPOSED', 'PM#1', 'SPAWN'),
    ]);

    const result = await collectSessions([root], 50);

    // No synthetic session should be produced for any of these noisy ids
    expect(result.sessions.filter((s) => !s.has_after_action)).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// (d) NO OVER-SUPPRESSION: distinct sprints stay distinct
// ---------------------------------------------------------------------------

describe('(d) no over-suppression — p3 vs p4; foo vs food', () => {
  it('doc for gander-studio-p3 does not suppress gander-studio-p4-foo synthetic', async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), 'sl-test-d1-'));
    tempDirs.push(root);

    // Doc for p3
    const aaDir = path.join(root, 'docs', 'after-actions');
    await mkdir(aaDir, { recursive: true });
    await writeFile(
      path.join(aaDir, 'gander-studio-p3.md'),
      makeAfterAction('gander-studio-p3', '2026-04-01'),
      'utf-8',
    );

    // Event for p4-foo (different sprint)
    const eventsDir = path.join(root, 'docs', 'events');
    await writeEventFile(eventsDir, 'agent-events-2026-04-10.jsonl', [
      makeEvent(1, '2026-04-10T10:00:00Z', 'gander-studio-p4-foo-FE-001', 'FE#1', 'SPAWN'),
    ]);

    const result = await collectSessions([root], 50);

    // p3 doc-backed present
    expect(result.sessions.some((s) => s.id === 'gander-studio-p3')).toBe(true);
    // p4-foo synthesized separately
    expect(result.sessions.some((s) => s.id === 'gander-studio-p4-foo' && !s.has_after_action)).toBe(true);
  });

  it('doc for gander-studio-p3-foo does not suppress gander-studio-p3-food synthetic', async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), 'sl-test-d2-'));
    tempDirs.push(root);

    // Doc for p3-foo
    const aaDir = path.join(root, 'docs', 'after-actions');
    await mkdir(aaDir, { recursive: true });
    await writeFile(
      path.join(aaDir, 'gander-studio-p3-foo.md'),
      makeAfterAction('gander-studio-p3-foo', '2026-04-01'),
      'utf-8',
    );

    // Event for p3-food-bar (distinct — 'foo' is not a prefix of 'food-bar' at the boundary)
    const eventsDir = path.join(root, 'docs', 'events');
    await writeEventFile(eventsDir, 'agent-events-2026-04-15.jsonl', [
      makeEvent(1, '2026-04-15T10:00:00Z', 'gander-studio-p3-food-bar-BE-001', 'BE#1', 'SPAWN'),
    ]);

    const result = await collectSessions([root], 50);

    // foo doc present
    expect(result.sessions.some((s) => s.id === 'gander-studio-p3-foo')).toBe(true);
    // food-bar synthesized (NOT suppressed by foo doc)
    expect(result.sessions.some((s) => s.id === 'gander-studio-p3-food-bar' && !s.has_after_action)).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// (e) PROGRAM/PHASE: different phase roots produce separate synthetics
// ---------------------------------------------------------------------------

describe('(e) program/phase — distinct sprintRoot per phase', () => {
  it('prog-foo-s5-bar and prog-foo-s4-baz produce two separate synthetics', async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), 'sl-test-e-'));
    tempDirs.push(root);

    const eventsDir = path.join(root, 'docs', 'events');
    await writeEventFile(eventsDir, 'agent-events-2026-06-01.jsonl', [
      makeEvent(1, '2026-06-01T10:00:00Z', 'prog-foo-s5-bar-FE-001', 'FE#1', 'SPAWN'),
      makeEvent(2, '2026-06-01T11:00:00Z', 'prog-foo-s4-baz', 'BE#1', 'SPAWN'),
    ]);

    const result = await collectSessions([root], 50);

    const synthetics = result.sessions.filter((s) => !s.has_after_action);
    const syntheticIds = synthetics.map((s) => s.id).sort();

    // Two distinct roots: prog-foo-s5-bar and prog-foo-s4-baz
    expect(syntheticIds).toContain('prog-foo-s5-bar');
    expect(syntheticIds).toContain('prog-foo-s4-baz');
  });
});

// ---------------------------------------------------------------------------
// (f) DATE-SUFFIX DOC: date-suffixed doc + bare sub-task events → ONE row
// ---------------------------------------------------------------------------

describe('(f) date-suffix doc — gander-debt-drain-2026-06-23', () => {
  it('doc row is present (has_after_action=true); bare sub-task events produce no extra synthetic', async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), 'sl-test-f-'));
    tempDirs.push(root);

    // Doc with date suffix (no phase token — sprintRoot will be null, shape gate fails)
    const aaDir = path.join(root, 'docs', 'after-actions');
    await mkdir(aaDir, { recursive: true });
    await writeFile(
      path.join(aaDir, 'gander-debt-drain-2026-06-23.md'),
      makeAfterAction('gander-debt-drain-2026-06-23', '2026-06-23'),
      'utf-8',
    );

    // Events with bare sub-task ids (also no shape-gate-passing form → null sprintRoot)
    const eventsDir = path.join(root, 'docs', 'events');
    await writeEventFile(eventsDir, 'agent-events-2026-06-23.jsonl', [
      makeEvent(1, '2026-06-23T10:00:00Z', 'gander-debt-drain-t2', 'BE#1', 'SPAWN'),
      makeEvent(2, '2026-06-23T11:00:00Z', 'gander-debt-drain-t3', 'FE#1', 'SPAWN'),
    ]);

    const result = await collectSessions([root], 50);

    // Exactly ONE row for this sprint (the doc)
    expect(result.sessions).toHaveLength(1);
    expect(result.sessions[0]!.has_after_action).toBe(true);
    // No additional synthetic
    expect(result.sessions.filter((s) => !s.has_after_action)).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// (g) LIVE-CORPUS: real two-root config — no dup ids, no noise, shape gate
// ---------------------------------------------------------------------------

describe('(g) live-corpus — real SESSIONS_SOURCE_DIRS', () => {
  const REAL_DIRS = [
    '/home/jhber/projects/gander',
    '/home/jhber/projects/gander-studio-alpha',
  ];

  it('no duplicate id across full returned list', async () => {
    const result = await collectSessions(REAL_DIRS, 200);
    const allIds = result.sessions.map((s) => s.id);
    const uniqueIds = new Set(allIds);
    // Each id should appear at most once across the composite-key-deduped result
    // (in practice these two roots have non-overlapping sprint namespaces)
    expect(uniqueIds.size).toBe(allIds.length);
  });

  it('no synthetic session has a denylisted id form', async () => {
    const result = await collectSessions(REAL_DIRS, 200);
    const synthetics = result.sessions.filter((s) => !s.has_after_action);
    for (const s of synthetics) {
      expect(s.id).not.toBe('system');
      expect(s.id).not.toBe('session-resume');
      expect(s.id).not.toMatch(/^hone-/);
      expect(s.id).not.toMatch(/^agent-improvement-/);
      expect(s.id).not.toMatch(/-proposed$/i);
    }
  });

  it('every synthetic id passes the positive shape gate', async () => {
    const result = await collectSessions(REAL_DIRS, 200);
    const synthetics = result.sessions.filter((s) => !s.has_after_action);
    for (const s of synthetics) {
      const passesGate =
        /-p\d+/.test(s.id) ||
        s.id.startsWith('prog-') ||
        s.id.startsWith('gander-meta-');
      expect(passesGate).toBe(true);
    }
  });
});
