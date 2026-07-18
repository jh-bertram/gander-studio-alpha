// agent-detail.test.ts — unit tests for assembleAgentDetail (t4, SC1-SC8).
//
// Two layers:
//   (1) Deterministic fixture layer — a synthetic ${mockGanderRoot}/.claude/agents/*.md
//       spec + a synthetic docs/connectivity-graph.json, built per-test via fs.mkdtempSync
//       (same convention as agent-role.test.ts's SC5(a) mock-dir fixture — the established
//       pattern in this codebase for "needs a whole mock GANDER_ROOT tree", not a new one).
//   (2) Live-corpus non-empty layer (FIX 1c / SC3) — against the REAL GANDER_ROOT,
//       getAgentDetail('FE') and ('AU') must return NON-EMPTY equipment AND materia.
//       Gated on process.env.GANDER_ROOT: MUST RUN (not skip) in the local dev env where
//       GANDER_ROOT points at the real gander repo; skips with an explicit reason only if
//       GANDER_ROOT is unset (CI).

import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { assembleAgentDetail } from '../agent-detail.js';

/** Minimal valid ConnectivityGraphSchema envelope — diagnostics arrays empty. */
function connectivityGraphFixture(nodes: unknown[], edges: unknown[]): unknown {
  return {
    generated: '2026-07-08T00:00:00Z',
    gander_root: '/mock',
    schema_version: '1.0',
    nodes,
    edges,
    diagnostics: { dead_references: [], orphan_nodes: [], over_coupled: [], missing_edges: [] },
  };
}

function agentNode(id: string, label: string) {
  return {
    id,
    type: 'agent',
    position: { x: 0, y: 0 },
    data: { label, filePath: `/mock${id.replace(/^\./, '')}`, nodeType: 'agent', confidence: 'DETECTED' },
  };
}
function skillNode(id: string, label: string) {
  return {
    id,
    type: 'skill',
    position: { x: 0, y: 0 },
    data: { label, filePath: `/mock${id.replace(/^\./, '')}`, nodeType: 'skill', confidence: 'DETECTED' },
  };
}
function hookNode(id: string, label: string) {
  return {
    id,
    type: 'hook',
    position: { x: 0, y: 0 },
    data: { label, filePath: `/mock/hooks/${label}`, nodeType: 'hook', confidence: 'DETECTED' },
  };
}
function edge(source: string, target: string, type: string, confidence: 'DETECTED' | 'INFERRED' = 'DETECTED') {
  return {
    id: `${source}-${type}-${target}`,
    source,
    target,
    type,
    data: { edgeType: type, confidence, dataSource: 'fixture' },
  };
}

/** Build a mock GANDER_ROOT tree: .claude/agents/backend.md (BE, has tools) +
 *  .claude/agents/orchestrator.md (ORC, no tools frontmatter needed) +
 *  docs/connectivity-graph.json wiring BE to one skill (source), one hook
 *  (REAL corpus direction: hook->agent, per agent-detail.ts's documented
 *  bidirectional triggers_hook match), and a spawns edge from ORC to BE.
 *  Note: no frontend.md is created here — used by the stale-mapping test. */
function buildMockGanderRoot(): string {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'agent-detail-fixture-'));
  const agentsDir = path.join(root, '.claude', 'agents');
  fs.mkdirSync(agentsDir, { recursive: true });
  fs.writeFileSync(
    path.join(agentsDir, 'backend.md'),
    '---\nname: backend-engineer\ndescription: stub\ntools: Read, Write, Bash\nmodel: sonnet\n---\n\nStub body.\n',
  );
  fs.writeFileSync(
    path.join(agentsDir, 'orchestrator.md'),
    '---\nname: orchestrator\ndescription: stub\ntools: Read\nmodel: sonnet\n---\n\nStub body.\n',
  );

  const docsDir = path.join(root, 'docs');
  fs.mkdirSync(docsDir, { recursive: true });
  const graph = connectivityGraphFixture(
    [
      agentNode('.claude/agents/backend.md', 'backend-engineer'),
      agentNode('.claude/agents/orchestrator.md', 'orchestrator'),
      skillNode('.claude/skills/agent-log/SKILL.md', 'agent-log'),
      hookNode('~/.claude/hooks/backfill-autofire.sh', 'backfill-autofire.sh'),
    ],
    [
      edge('.claude/agents/backend.md', '.claude/skills/agent-log/SKILL.md', 'references_skill'),
      edge('~/.claude/hooks/backfill-autofire.sh', '.claude/agents/backend.md', 'triggers_hook', 'INFERRED'),
      edge('.claude/agents/orchestrator.md', '.claude/agents/backend.md', 'spawns'),
    ],
  );
  fs.writeFileSync(path.join(docsDir, 'connectivity-graph.json'), JSON.stringify(graph));

  return root;
}

/** Shared build+teardown wrapper — DRY: every fixture-layer test needs the
 *  same mkdtempSync-build / rmSync-cleanup scaffold around its assertions;
 *  extracted so the try/finally shape appears once, not once per test. */
async function withMockGanderRoot<T>(fn: (root: string) => Promise<T>): Promise<T> {
  const root = buildMockGanderRoot();
  try {
    return await fn(root);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
}

const NONEXISTENT_EVENTS_DIR = path.join(os.tmpdir(), 'agent-detail-fixture-no-such-events-dir');

describe('assembleAgentDetail — fixture layer (SC1/SC2/SC4)', () => {
  it('BE (spec-backed): equipment maps from tools, materia.skills/hooks carry provenancePath, relationships include the spawns edge', async () => {
    await withMockGanderRoot(async (root) => {
      const detail = await assembleAgentDetail('BE', root, [NONEXISTENT_EVENTS_DIR]);

      expect(detail.code).toBe('BE');
      expect(detail.roleCategory).toBe('Impl');
      expect(detail.materiaColorKey).toBe('--mg');

      expect(detail.equipment).toEqual([{ tool: 'Read' }, { tool: 'Write' }, { tool: 'Bash' }]);

      expect(detail.materia.skills).toHaveLength(1);
      expect(detail.materia.skills[0]).toMatchObject({ kind: 'skill', name: 'agent-log' });
      expect(detail.materia.skills[0]?.provenancePath).toContain('agent-log/SKILL.md');

      expect(detail.materia.hooks).toHaveLength(1);
      expect(detail.materia.hooks[0]).toMatchObject({ kind: 'hook', name: 'backfill-autofire.sh' });

      expect(detail.relationships).toHaveLength(1);
      expect(detail.relationships[0]).toMatchObject({
        target: '.claude/agents/orchestrator.md',
        edgeType: 'spawns',
        confidence: 'DETECTED',
      });
    });
  });

  it('qualityStats declare attribution side: ghost-rate direct-agent-id, first-pass implementer-backward-look for an Impl role', async () => {
    await withMockGanderRoot(async (root) => {
      const detail = await assembleAgentDetail('BE', root, [NONEXISTENT_EVENTS_DIR]);
      const ghost = detail.qualityStats.find((s) => s.label === 'Ghost/stall rate');
      const firstPass = detail.qualityStats.find((s) => s.label === 'First-pass audit rate');
      expect(ghost?.attribution).toBe('direct-agent-id');
      expect(firstPass?.attribution).toBe('implementer-backward-look');
      // No events dir -> no spawns/audits observed -> explicit N/A, never a bare 0.
      expect(ghost?.normalized).toBeNull();
      expect(firstPass?.normalized).toBeNull();
    });
  });

  it('non-Impl role (ORC, Command) declares gate-renderer attribution for first-pass rate, with an explicit dataQualityNote', async () => {
    await withMockGanderRoot(async (root) => {
      const detail = await assembleAgentDetail('ORC', root, [NONEXISTENT_EVENTS_DIR]);
      const firstPass = detail.qualityStats.find((s) => s.label === 'First-pass audit rate');
      expect(firstPass?.attribution).toBe('gate-renderer');
      expect(firstPass?.raw).toBeNull();
      expect(detail.dataQualityNotes.some((n) => n.includes('not applicable to role category'))).toBe(true);
    });
  });

  it('abilities:[] + a surfaced dataQualityNote is the CONTRACTED behavior for every code (SC6, program.md §5 note 2)', async () => {
    await withMockGanderRoot(async (root) => {
      const detail = await assembleAgentDetail('BE', root, [NONEXISTENT_EVENTS_DIR]);
      expect(detail.abilities).toEqual([]);
      expect(
        detail.dataQualityNotes.some((n) => n.includes('abilities intentionally empty')),
      ).toBe(true);
    });
  });
});

describe('assembleAgentDetail — no-spec-code (DI) graceful path, distinguishable from a parse failure (SC3/SC5)', () => {
  it('DI (specFile: null) returns roster metadata + empty equipment/materia + a distinguishing dataQualityNote, never a throw', async () => {
    await withMockGanderRoot(async (root) => {
      const detail = await assembleAgentDetail('DI', root, [NONEXISTENT_EVENTS_DIR]);
      expect(detail.code).toBe('DI');
      expect(detail.roleCategory).toBe('Meta');
      expect(detail.equipment).toEqual([]);
      expect(detail.materia).toEqual({ skills: [], hooks: [] });
      expect(detail.relationships).toEqual([]);
      expect(
        detail.dataQualityNotes.some((n) => n.includes('no agent spec on disk for code DI')),
      ).toBe(true);
    });
  });

  it('a spec-backed code whose file is MISSING from the mock tree (stale ROSTER.specFile) yields a DIFFERENT note than DI — distinguishable from the no-spec-expected case', async () => {
    // buildMockGanderRoot() has backend.md + orchestrator.md only — no frontend.md.
    await withMockGanderRoot(async (root) => {
      const detail = await assembleAgentDetail('FE', root, [NONEXISTENT_EVENTS_DIR]);
      expect(detail.equipment).toEqual([]);
      expect(detail.materia).toEqual({ skills: [], hooks: [] });
      const diNote = 'no agent spec on disk for code';
      const staleNote = 'ROSTER.specFile may be stale';
      expect(detail.dataQualityNotes.some((n) => n.includes(staleNote))).toBe(true);
      expect(detail.dataQualityNotes.some((n) => n.includes(diNote))).toBe(false);
    });
  });
});

describe('assembleAgentDetail — unknown code', () => {
  it('throws a plain Error for a code not present in ROSTER at all', async () => {
    await withMockGanderRoot(async (root) => {
      await expect(assembleAgentDetail('ZZ', root, [NONEXISTENT_EVENTS_DIR])).rejects.toThrow(
        /Unknown role code/,
      );
    });
  });
});

// ---------------------------------------------------------------------------
// Live-corpus non-empty layer (FIX 1c, SC3) — MUST RUN (not skip) in the local
// dev env where GANDER_ROOT points at the real gander repo. An all-empty
// result for a spec-backed code (FE/AU) FAILS this suite — it is NOT
// "graceful," per the CR#1 BLOCKER this SC exists to close.
// ---------------------------------------------------------------------------
const ganderRoot = process.env.GANDER_ROOT;

describe('assembleAgentDetail — live-corpus non-empty layer (SC3, FIX 1c)', () => {
  if (ganderRoot) {
    it('FE: NON-EMPTY equipment AND NON-EMPTY materia against the live GANDER_ROOT', async () => {
      const detail = await assembleAgentDetail('FE', ganderRoot, [NONEXISTENT_EVENTS_DIR]);
      expect(detail.equipment.length).toBeGreaterThan(0);
      expect(detail.materia.skills.length + detail.materia.hooks.length).toBeGreaterThan(0);
      expect(detail.dataQualityNotes.some((n) => n.includes('no agent spec on disk'))).toBe(false);
      expect(detail.dataQualityNotes.some((n) => n.includes('ROSTER.specFile may be stale'))).toBe(false);
    });

    it('AU: NON-EMPTY equipment AND NON-EMPTY materia against the live GANDER_ROOT', async () => {
      const detail = await assembleAgentDetail('AU', ganderRoot, [NONEXISTENT_EVENTS_DIR]);
      expect(detail.equipment.length).toBeGreaterThan(0);
      expect(detail.materia.skills.length + detail.materia.hooks.length).toBeGreaterThan(0);
    });

    it('DI: still empty+note against the live GANDER_ROOT (the ONE legitimate empty case)', async () => {
      const detail = await assembleAgentDetail('DI', ganderRoot, [NONEXISTENT_EVENTS_DIR]);
      expect(detail.equipment).toEqual([]);
      expect(detail.materia).toEqual({ skills: [], hooks: [] });
      expect(
        detail.dataQualityNotes.some((n) => n.includes('no agent spec on disk for code DI')),
      ).toBe(true);
    });
  } else {
    it.skip('live-corpus non-empty layer — SKIPPED: GANDER_ROOT is unset in this environment (CI); set GANDER_ROOT to a real gander repo to run this assertion', () => {});
  }
});
