/**
 * router-docless.test.ts — router-level tests for doc-less (synthetic) session guards.
 *
 * (a) saveEdit rejects a synthetic (doc-less) session with BAD_REQUEST
 * (b) saveEdit rejects an unknown id with NOT_FOUND
 * (c) getRaw for a synthetic session returns placeholder content; editedFilePath undefined
 * (d) session.get resolves a synthetic session by id (synthesis fallthrough in findSessionById)
 */
import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import { mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';

// ---------------------------------------------------------------------------
// Dynamic env mock — getters resolve at procedure-call time (not module-load time),
// so beforeAll can set them before any procedure runs.
// ---------------------------------------------------------------------------
let mockSourceDirs: string[] = [];
let mockEditsDir = '';

vi.mock('../../env.js', () => ({
  get SESSIONS_SOURCE_DIRS() { return mockSourceDirs; },
  get SESSIONS_EDITS_DIR() { return mockEditsDir; },
  GANDER_ROOT: '/nonexistent-gander',
  LOADOUTS_DIR: '/nonexistent-loadouts',
  EXPORT_BASE_DIR: '/tmp/nonexistent-exports',
  SERVER_PORT: 3001,
}));

// Import appRouter AFTER vi.mock is hoisted so it receives the mocked env.
import { appRouter } from '../../router.js';

// ---------------------------------------------------------------------------
// Fixture helpers
// ---------------------------------------------------------------------------

function makeEvent(seq: number, ts: string, taskId: string, agentId: string, ev = 'SPAWN'): string {
  return JSON.stringify({ seq, ts, ev, task_id: taskId, agent_id: agentId });
}

async function writeEventFile(dir: string, filename: string, lines: string[]): Promise<void> {
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, filename), lines.join('\n') + '\n', 'utf-8');
}

// ---------------------------------------------------------------------------
// Shared temp dirs
// ---------------------------------------------------------------------------

const tempDirs: string[] = [];
let tmpRoot: string;
let tmpEdits: string;

// Sprint id that passes the positive shape gate (contains -p\d+) and has no doc.
const SYNTHETIC_SPRINT = 'gander-studio-p9-docless-test';

beforeAll(async () => {
  tmpRoot = await mkdtemp(path.join(os.tmpdir(), 'router-docless-'));
  tmpEdits = await mkdtemp(path.join(os.tmpdir(), 'router-edits-'));
  tempDirs.push(tmpRoot, tmpEdits);

  // Write event log entries for SYNTHETIC_SPRINT (no after-action doc in this dir).
  const eventsDir = path.join(tmpRoot, 'docs', 'events');
  await writeEventFile(eventsDir, 'agent-events-2026-06-30.jsonl', [
    makeEvent(1, '2026-06-30T10:00:00Z', `${SYNTHETIC_SPRINT}-BE-001`, 'BE#1', 'SPAWN'),
    makeEvent(2, '2026-06-30T10:30:00Z', `${SYNTHETIC_SPRINT}-BE-001`, 'BE#1', 'COMPLETE'),
  ]);

  // Point mock env at temp dirs
  mockSourceDirs = [tmpRoot];
  mockEditsDir = tmpEdits;
});

afterAll(async () => {
  for (const dir of tempDirs) {
    await rm(dir, { recursive: true, force: true });
  }
});

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('router — doc-less session guards', () => {
  it('(b) saveEdit unknown id → NOT_FOUND', async () => {
    const caller = appRouter.createCaller({});
    await expect(caller.session.saveEdit({ id: 'nonexistent-id', content: 'x' }))
      .rejects.toMatchObject({ code: 'NOT_FOUND' });
  });

  it('(d) session.get resolves a synthetic session by id (synthesis fallthrough)', async () => {
    const caller = appRouter.createCaller({});
    const session = await caller.session.get({ id: SYNTHETIC_SPRINT });
    expect(session.id).toBe(SYNTHETIC_SPRINT);
    expect(session.has_after_action).toBe(false);
  });

  it('(a) saveEdit doc-less (synthetic) → BAD_REQUEST', async () => {
    const caller = appRouter.createCaller({});
    await expect(caller.session.saveEdit({ id: SYNTHETIC_SPRINT, content: 'x' }))
      .rejects.toMatchObject({ code: 'BAD_REQUEST' });
  });

  it('(c) getRaw synthetic session → placeholder content; editedFilePath undefined', async () => {
    const caller = appRouter.createCaller({});
    const result = await caller.session.getRaw({ id: SYNTHETIC_SPRINT });
    expect(result.content).toContain('No after-action document yet');
    expect(result.content).toContain(SYNTHETIC_SPRINT);
    expect(result.editedFilePath).toBeUndefined();
  });
});
