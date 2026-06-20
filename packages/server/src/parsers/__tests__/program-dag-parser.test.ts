/**
 * program-dag-parser.test.ts
 *
 * Tests for parseProgramDags against BOTH real program.md files:
 *   - docs/programs/prog-studio-sessions-2026-05/program.md
 *   - docs/programs/prog-studio-vision-2026-06/program.md
 */
import { describe, it, expect } from 'vitest';
import path from 'node:path';
import { tmpdir } from 'node:os';
import { writeFile, mkdir } from 'node:fs/promises';
import { parseProgramDags } from '../program-dag-parser.js';
import { ProgramGetDagOutputSchema } from '@gander-studio/shared';

// Studio root = 5 levels up from packages/server/src/parsers/__tests__/
// __tests__ → parsers → src → server → packages → gander-studio-alpha
const STUDIO_ROOT = path.resolve(import.meta.dirname, '..', '..', '..', '..', '..');

// ─── 1. Real files — sessions program ────────────────────────────────────────

describe('parseProgramDags — real files (both programs)', () => {
  it('returns an array that passes ProgramGetDagOutputSchema', async () => {
    const result = await parseProgramDags(STUDIO_ROOT);
    expect(() => ProgramGetDagOutputSchema.parse(result)).not.toThrow();
  });

  it('returns at least 2 programs (sessions + vision)', async () => {
    const result = await parseProgramDags(STUDIO_ROOT);
    expect(result.length).toBeGreaterThanOrEqual(2);
  });

  it('each program has >= 2 nodes', async () => {
    const result = await parseProgramDags(STUDIO_ROOT);
    for (const dag of result) {
      expect(dag.nodes.length).toBeGreaterThanOrEqual(2);
    }
  });

  it('each program has >= 1 edge (depends_on relationships)', async () => {
    const result = await parseProgramDags(STUDIO_ROOT);
    for (const dag of result) {
      expect(dag.edges.length).toBeGreaterThanOrEqual(1);
    }
  });

  it('each program has >= 1 seam', async () => {
    const result = await parseProgramDags(STUDIO_ROOT);
    for (const dag of result) {
      expect(dag.seams.length).toBeGreaterThanOrEqual(1);
    }
  });

  it('sessions program includes expected sprint IDs', async () => {
    const result = await parseProgramDags(STUDIO_ROOT);
    const sessions = result.find((d) => d.programId === 'prog-studio-sessions-2026-05');
    expect(sessions).toBeDefined();
    const nodeIds = sessions!.nodes.map((n) => n.id);
    expect(nodeIds).toContain('prog-studio-sessions-2026-05-s1-backend');
    expect(nodeIds).toContain('prog-studio-sessions-2026-05-s2-list-edit');
    expect(nodeIds).toContain('prog-studio-sessions-2026-05-s3-analyze');
  });

  it('sessions program s2 has s1 as a dependency (edge exists)', async () => {
    const result = await parseProgramDags(STUDIO_ROOT);
    const sessions = result.find((d) => d.programId === 'prog-studio-sessions-2026-05');
    expect(sessions).toBeDefined();
    const edge = sessions!.edges.find(
      (e) =>
        e.source === 'prog-studio-sessions-2026-05-s1-backend' &&
        e.target === 'prog-studio-sessions-2026-05-s2-list-edit',
    );
    expect(edge).toBeDefined();
  });

  it('nodes carry tier metadata from the Topological tiers section', async () => {
    const result = await parseProgramDags(STUDIO_ROOT);
    const sessions = result.find((d) => d.programId === 'prog-studio-sessions-2026-05');
    expect(sessions).toBeDefined();
    const s1 = sessions!.nodes.find((n) => n.id === 'prog-studio-sessions-2026-05-s1-backend');
    expect(s1).toBeDefined();
    // s1 is Tier 0 per the program.md
    expect(s1!.data.tier).toBe(0);
  });

  it('vision program includes expected sprint IDs', async () => {
    const result = await parseProgramDags(STUDIO_ROOT);
    const vision = result.find((d) => d.programId === 'prog-studio-vision-2026-06');
    expect(vision).toBeDefined();
    const nodeIds = vision!.nodes.map((n) => n.id);
    expect(nodeIds).toContain('prog-studio-vision-2026-06-s1-token-root-fix');
    expect(nodeIds).toContain('prog-studio-vision-2026-06-s3-agent-os-legibility');
  });

  it('node positions start at {x:0,y:0} (dagre layout handled on client)', async () => {
    const result = await parseProgramDags(STUDIO_ROOT);
    for (const dag of result) {
      for (const node of dag.nodes) {
        expect(node.position).toEqual({ x: 0, y: 0 });
      }
    }
  });

  it('edge type is always "dependency"', async () => {
    const result = await parseProgramDags(STUDIO_ROOT);
    for (const dag of result) {
      for (const edge of dag.edges) {
        expect(edge.type).toBe('dependency');
      }
    }
  });
});

// ─── 2. Filter by programId ───────────────────────────────────────────────────

describe('parseProgramDags — filter by programId', () => {
  it('returns only the requested program when programId is specified', async () => {
    const result = await parseProgramDags(
      STUDIO_ROOT,
      'prog-studio-sessions-2026-05',
    );
    expect(result.length).toBe(1);
    expect(result[0]!.programId).toBe('prog-studio-sessions-2026-05');
  });

  it('returns empty array for a non-existent programId', async () => {
    const result = await parseProgramDags(STUDIO_ROOT, 'does-not-exist');
    expect(result).toHaveLength(0);
  });
});

// ─── 3. allSettled-and-skip: malformed program.md is skipped ─────────────────

describe('parseProgramDags — allSettled-and-skip', () => {
  it('skips malformed program.md and returns valid ones', async () => {
    const tmpDir = path.join(tmpdir(), `dag-test-${Date.now()}`);
    const validProgramDir = path.join(tmpDir, 'docs', 'programs', 'valid-prog');
    const badProgramDir = path.join(tmpDir, 'docs', 'programs', 'bad-prog');
    await mkdir(validProgramDir, { recursive: true });
    await mkdir(badProgramDir, { recursive: true });

    // Valid minimal program.md with correct Sprint Roster table
    await writeFile(
      path.join(validProgramDir, 'program.md'),
      [
        '---',
        'program_id: valid-prog',
        '---',
        '',
        '# Valid Program',
        '',
        '## Sprint Roster',
        '',
        '| sprint_id | goal | depends_on |',
        '|-----------|------|------------|',
        '| `valid-s1` | Do thing A | (none) |',
        '| `valid-s2` | Do thing B | `valid-s1` |',
        '',
        '## Dependency DAG',
        '',
        'Topological tiers:',
        '- Tier 0: `valid-s1`',
        '- Tier 1: `valid-s2`',
        '',
        '## Integration Seams',
        '',
        '| seam_id | from_sprint | to_sprint | artifact | format | contract |',
        '|---------|-------------|-----------|----------|--------|----------|',
        '| `SEAM-1` | valid-s1 | valid-s2 | schema.ts | Zod | S2 consumes S1. |',
      ].join('\n'),
      'utf-8',
    );

    // Bad program.md (no Sprint Roster table)
    await writeFile(
      path.join(badProgramDir, 'program.md'),
      '# Bad Program\n\nNo roster table here.\n',
      'utf-8',
    );

    const result = await parseProgramDags(tmpDir);
    // valid-prog should parse; bad-prog should be skipped
    expect(result.length).toBe(1);
    expect(result[0]!.programId).toBe('valid-prog');
    expect(result[0]!.nodes.length).toBe(2);
    expect(result[0]!.edges.length).toBe(1);
    expect(result[0]!.seams.length).toBe(1);
  });

  it('returns [] when docs/programs does not exist', async () => {
    const tmpDir = path.join(tmpdir(), `dag-test-${Date.now()}`);
    await mkdir(tmpDir, { recursive: true });
    const result = await parseProgramDags(tmpDir);
    expect(result).toHaveLength(0);
  });
});

// ─── 4. export.spawn containment guard ───────────────────────────────────────

// Note: the export.spawn router guard is tested via the router, but we document
// here that the security check enforces EXPORT_BASE_DIR + path.sep prefix.
// The guard rejects paths like '/tmp/gander-exports-evil' when EXPORT_BASE_DIR
// is '/tmp/gander-exports' (missing path.sep suffix would allow sibling bypass).
// This comment is documentation; the actual guard is in router.ts exportRouter.spawn.
