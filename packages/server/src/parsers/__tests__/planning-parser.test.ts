/**
 * planning-parser.test.ts
 *
 * Tests for parsePlanningBacklog against the real docs/deferred-work.md
 * and docs/task-registry.md files in the gander-studio-alpha repo.
 */
import { describe, it, expect } from 'vitest';
import path from 'node:path';
import { tmpdir } from 'node:os';
import { writeFile, mkdir } from 'node:fs/promises';
import { parsePlanningBacklog } from '../planning-parser.js';
import { PlanningListOutputSchema } from '@gander-studio/shared';

// Studio root = 5 levels up from packages/server/src/parsers/__tests__/
// __tests__ → parsers → src → server → packages → gander-studio-alpha
const STUDIO_ROOT = path.resolve(import.meta.dirname, '..', '..', '..', '..', '..');

// ─── 1. Real files parse without error ───────────────────────────────────────

describe('parsePlanningBacklog — real files', () => {
  it('returns a PlanningListOutput that passes schema validation', async () => {
    const result = await parsePlanningBacklog(STUDIO_ROOT);
    expect(() => PlanningListOutputSchema.parse(result)).not.toThrow();
  });

  it('returns at least one sprint entry', async () => {
    const result = await parsePlanningBacklog(STUDIO_ROOT);
    expect(result.sprints.length).toBeGreaterThan(0);
  });

  it('skipped is 0 when both source files are present', async () => {
    const result = await parsePlanningBacklog(STUDIO_ROOT);
    expect(result.skipped).toBe(0);
  });

  it('includes a DEFERRED-NNN item', async () => {
    const result = await parsePlanningBacklog(STUDIO_ROOT);
    const allItems = result.sprints.flatMap((s) => s.items);
    const deferred = allItems.filter((i) => i.id.startsWith('DEFERRED-'));
    expect(deferred.length).toBeGreaterThan(0);
  });

  it('includes a done DEFERRED item (DEFERRED-005)', async () => {
    const result = await parsePlanningBacklog(STUDIO_ROOT);
    const allItems = result.sprints.flatMap((s) => s.items);
    const done = allItems.find((i) => i.id === 'DEFERRED-005' && i.kind === 'done');
    expect(done).toBeDefined();
  });

  it('includes a sprint-goal item from task-registry.md', async () => {
    const result = await parsePlanningBacklog(STUDIO_ROOT);
    const allItems = result.sprints.flatMap((s) => s.items);
    const sprintGoals = allItems.filter((i) => i.kind === 'sprint-goal');
    expect(sprintGoals.length).toBeGreaterThan(0);
  });

  it('sprint-goal items include a rollbackCommit from task-registry.md', async () => {
    const result = await parsePlanningBacklog(STUDIO_ROOT);
    const allItems = result.sprints.flatMap((s) => s.items);
    const withCommit = allItems.filter(
      (i) => i.kind === 'sprint-goal' && i.rollbackCommit !== undefined,
    );
    expect(withCommit.length).toBeGreaterThan(0);
  });

  it('deferred items with scheduleAs have non-empty scheduleAs', async () => {
    const result = await parsePlanningBacklog(STUDIO_ROOT);
    const allItems = result.sprints.flatMap((s) => s.items);
    const withSchedule = allItems.filter(
      (i) => i.kind === 'deferred' && i.scheduleAs !== undefined,
    );
    // At least one deferred item should have a Schedule as field
    expect(withSchedule.length).toBeGreaterThan(0);
    for (const item of withSchedule) {
      expect(item.scheduleAs!.length).toBeGreaterThan(0);
    }
  });
});

// ─── 2. allSettled-and-skip: missing file increments skipped ─────────────────

describe('parsePlanningBacklog — allSettled-and-skip', () => {
  it('returns skipped=2 and empty sprints when studioRoot has no docs/ folder', async () => {
    const tmpDir = path.join(tmpdir(), `planning-test-${Date.now()}`);
    await mkdir(tmpDir, { recursive: true });
    const result = await parsePlanningBacklog(tmpDir);
    expect(result.skipped).toBe(2);
    expect(result.sprints).toHaveLength(0);
  });

  it('returns skipped=1 and parses deferred-work.md when only that file exists', async () => {
    const tmpDir = path.join(tmpdir(), `planning-test-${Date.now()}`);
    await mkdir(path.join(tmpDir, 'docs'), { recursive: true });
    await writeFile(
      path.join(tmpDir, 'docs', 'deferred-work.md'),
      [
        '## Sprint: test-sprint',
        '',
        '### DEFERRED-T01 — Test item',
        '',
        '**Schedule as:** Small FE cleanup.',
      ].join('\n'),
      'utf-8',
    );
    const result = await parsePlanningBacklog(tmpDir);
    // task-registry.md is missing → skipped=1
    expect(result.skipped).toBe(1);
    // deferred-work.md parsed OK
    const allItems = result.sprints.flatMap((s) => s.items);
    const item = allItems.find((i) => i.id === 'DEFERRED-T01');
    expect(item).toBeDefined();
    expect(item?.kind).toBe('deferred');
    expect(item?.scheduleAs).toBe('Small FE cleanup.');
  });
});

// ─── 3. deferred-work parser — done marker ───────────────────────────────────

describe('parsePlanningBacklog — done items', () => {
  it('marks items with ✅ DONE as kind=done', async () => {
    const tmpDir = path.join(tmpdir(), `planning-test-${Date.now()}`);
    await mkdir(path.join(tmpDir, 'docs'), { recursive: true });
    await writeFile(
      path.join(tmpDir, 'docs', 'deferred-work.md'),
      [
        '## Sprint: done-sprint',
        '',
        '### DEFERRED-DONE1 — Completed item — ✅ DONE (2026-01-01)',
        '',
        'This is done.',
      ].join('\n'),
      'utf-8',
    );
    const result = await parsePlanningBacklog(tmpDir);
    const allItems = result.sprints.flatMap((s) => s.items);
    const done = allItems.find((i) => i.id === 'DEFERRED-DONE1');
    expect(done).toBeDefined();
    expect(done?.kind).toBe('done');
    expect(done?.resolvedAt).toBe('2026-01-01');
  });
});
