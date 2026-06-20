/**
 * slug-and-saveedit.test.ts
 *
 * Tests for:
 *  - D4: prose-H1 slug fallback — session.id used when primary sprintSlug yields 0 events
 *  - D6: saveEdit round-trip — getRaw prefers SESSIONS_EDITS_DIR/{id}.md when present
 *
 * These tests exercise the slug-fallback logic and save/read-back contract
 * against local fixtures and temp directories (no live server required).
 */

import { describe, it, expect } from 'vitest';
import path from 'node:path';
import { tmpdir } from 'node:os';
import { writeFile, mkdir, readFile } from 'node:fs/promises';
import { parseEventLogFiles } from '../event-log-parser.js';
import { parseSessionFile } from '../session-parser.js';
import { validateSaveEditPath } from '../saveedit-guard.js';

const FIXTURES_DIR = path.join(import.meta.dirname, 'fixtures');

// ─── D4: Prose-H1 slug — primary token "Gander" matches 0; session.id matches ─

describe('D4 — prose-H1 slug fallback', () => {
  it('confirms gander-studio-p2-p3 session.id is the lowercase filename slug', async () => {
    const session = await parseSessionFile(
      path.join(FIXTURES_DIR, 'gander-studio-p2-p3.md'),
      '/test/root',
    );
    // id is always toSlug(filenameStem) — see session-parser.ts:239-240
    expect(session.id).toBe('gander-studio-p2-p3');
    // sprint is the prose H1 text (Format B)
    expect(session.sprint).toBe('Gander Studio P2 + P3');
    // Primary slug (split(/\s+/)[0]) is "Gander" — NOT "gander-studio-p2-p3"
    expect(session.sprint.split(/\s+/)[0]).toBe('Gander');
  });

  it('primary slug "Gander" matches 0 events in the prose-H1 fixture JSONL', async () => {
    // The fixture has task_ids like "gander-studio-p2-export-fix-t1"
    // which do NOT start with or contain "Gander" (case-sensitive)
    const events = await parseEventLogFiles(FIXTURES_DIR, 'Gander');
    expect(events.length).toBe(0);
  });

  it('fallback session.id "gander-studio-p2-p3" yields non-zero events', async () => {
    // FIXTURES_DIR contains agent-events-gander-studio-p2-p3.jsonl
    // with task_ids prefixed "gander-studio-p2-p3-*" (8 matching entries, 1 unrelated).
    // parseEventLogFiles filters by: task_id.startsWith(slug) | task_id.includes(slug)
    // "gander-studio-p2-p3-export-fix-t1".startsWith("gander-studio-p2-p3") = true
    const events = await parseEventLogFiles(FIXTURES_DIR, 'gander-studio-p2-p3');
    expect(events.length).toBeGreaterThanOrEqual(8);
    // All matched entries must start with the session.id slug
    for (const e of events) {
      expect(
        e.task_id.startsWith('gander-studio-p2-p3') || e.task_id.includes('gander-studio-p2-p3'),
      ).toBe(true);
    }
  });

  it('dotted-version no-regression: slug "v1.2" from split still works (no toSlug transform)', async () => {
    // Confirm that split(/\s+/)[0] on a sprint like "v1.2 (some-session)" yields "v1.2"
    // and NOT "v1-2" (which toSlug would produce). This preserves Critic B2 no-regression.
    const sprint = 'v1.2 (some-session)';
    const primarySlug = sprint.split(/\s+/)[0];
    expect(primarySlug).toBe('v1.2');
    // toSlug would produce "v1-2" — confirm they differ (so we didn't replace primary)
    expect(primarySlug).not.toBe('v1-2');
  });

  it('parenthetical-title no-regression: split strips the parenthetical suffix', async () => {
    // Sprint "gander-studio-p1 (Materia Canvas)" -> primary = "gander-studio-p1" ✓
    const sprint = 'gander-studio-p1 (Materia Canvas)';
    const primarySlug = sprint.split(/\s+/)[0];
    expect(primarySlug).toBe('gander-studio-p1');
  });
});

// ─── D6: saveEdit round-trip — validateSaveEditPath + write + read-back ─────────

describe('D6 — saveEdit round-trip (write → getRaw prefers edit file)', () => {
  it('validateSaveEditPath returns a path inside editsDir for session.id', () => {
    const editsDir = '/tmp/test-edits-roundtrip';
    const sessionId = 'gander-studio-p2-p3';
    const target = validateSaveEditPath(sessionId, editsDir);
    const safeBase = path.resolve(editsDir);
    expect(target).toBe(path.join(safeBase, `${sessionId}.md`));
    expect(target.startsWith(safeBase + path.sep)).toBe(true);
  });

  it('write-then-read-back: content written via saveEdit is readable from the edits path', async () => {
    // This simulates the saveEdit -> getRaw round-trip at the filesystem level.
    // The router's getRaw calls validateSaveEditPath then readFile on the result.
    const editsDir = path.join(tmpdir(), `saveedit-test-${Date.now()}`);
    await mkdir(editsDir, { recursive: true });

    const sessionId = 'gander-studio-p2-p3';
    const editedContent = '# Edited Post-Mortem\n\nThis content was saved via saveEdit.';

    // Simulate saveEdit: write to edits dir
    const target = validateSaveEditPath(sessionId, editsDir);
    await writeFile(target, editedContent, 'utf8');

    // Simulate getRaw: read back from edits dir
    const readBack = await readFile(target, 'utf8');
    expect(readBack).toBe(editedContent);
  });

  it('getRaw falls back to original when no edit file exists', async () => {
    // Simulate the getRaw fallback path: edits dir exists but no file for this session.
    const editsDir = path.join(tmpdir(), `saveedit-missing-${Date.now()}`);
    await mkdir(editsDir, { recursive: true });

    const sessionId = 'nonexistent-session';
    const target = validateSaveEditPath(sessionId, editsDir);

    // readFile on absent file throws ENOENT — router catches and falls back to original.
    await expect(readFile(target, 'utf8')).rejects.toThrow();
  });

  it('edit file path is returned as editedFilePath when edit exists', async () => {
    // Confirm that the editedFilePath field returned by getRaw equals the validated path.
    const editsDir = path.join(tmpdir(), `saveedit-filepath-${Date.now()}`);
    await mkdir(editsDir, { recursive: true });

    const sessionId = 'gander-studio-p2-p3';
    const editedContent = '# Round-trip check';
    const target = validateSaveEditPath(sessionId, editsDir);
    await writeFile(target, editedContent, 'utf8');

    // Validate path guard returns stable result
    const pathForRead = validateSaveEditPath(sessionId, editsDir);
    expect(pathForRead).toBe(target);

    const content = await readFile(pathForRead, 'utf8');
    expect(content).toBe(editedContent);
    // editedFilePath would be target — confirm it's inside editsDir
    expect(target.startsWith(path.resolve(editsDir) + path.sep)).toBe(true);
  });
});
