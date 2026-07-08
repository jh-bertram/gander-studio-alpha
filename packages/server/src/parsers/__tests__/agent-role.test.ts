// agent-role.test.ts — unit tests for roleOf/canonicalizeRole/ROSTER (SC4)
// + the code->spec mapping-resolves-to-file assertions (SC5: mock-dir fixture
// + live-glob sanity against ${GANDER_ROOT}/.claude/agents/).

import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { roleOf, canonicalizeRole, ROSTER } from '../agent-role.js';

describe('canonicalizeRole', () => {
  it('merges the three auditor eras to AU', () => {
    expect(canonicalizeRole('AUDITOR')).toBe('AU');
    expect(canonicalizeRole('AUD')).toBe('AU');
    expect(canonicalizeRole('AU')).toBe('AU');
  });

  it('passes through unrecognized roles unchanged', () => {
    expect(canonicalizeRole('BE')).toBe('BE');
    expect(canonicalizeRole('FE')).toBe('FE');
  });
});

describe('roleOf', () => {
  it('strips instance suffix then canonicalizes', () => {
    expect(roleOf('AUDITOR#1')).toBe('AU');
    expect(roleOf('FE#rem1')).toBe('FE');
  });

  it('handles ids with no instance suffix', () => {
    expect(roleOf('BE')).toBe('BE');
  });
});

describe('ROSTER — shape (SC4)', () => {
  const EXPECTED_CODES = ['BE', 'FE', 'DS', 'PM', 'ORC', 'RA', 'ST', 'AR', 'UI', 'DI', 'HR', 'CR', 'AU'];

  it('has exactly 13 entries whose codes are the expected 13-role set', () => {
    expect(ROSTER).toHaveLength(13);
    expect(new Set(ROSTER.map((r) => r.code))).toEqual(new Set(EXPECTED_CODES));
  });

  it('every materiaColorKey starts with --', () => {
    for (const entry of ROSTER) {
      expect(entry.materiaColorKey.startsWith('--')).toBe(true);
    }
  });

  it('each of the 12 non-DI entries carries a non-null specFile ending in .md; DI carries null', () => {
    const nonDi = ROSTER.filter((r) => r.code !== 'DI');
    expect(nonDi).toHaveLength(12);
    for (const entry of nonDi) {
      expect(typeof entry.specFile).toBe('string');
      expect(entry.specFile).toMatch(/\.md$/);
    }
    const di = ROSTER.find((r) => r.code === 'DI');
    expect(di?.specFile).toBeNull();
  });
});

/** Shared loop: assert every ROSTER entry with a non-null specFile exists under baseDir. */
function assertAllSpecFilesResolveUnder(baseDir: string): void {
  const nonNullEntries = ROSTER.filter((r) => r.specFile !== null);
  expect(nonNullEntries).toHaveLength(12);
  for (const entry of nonNullEntries) {
    const resolved = path.join(baseDir, entry.specFile as string);
    expect(fs.existsSync(resolved), `expected ${resolved} to exist for ROSTER code ${entry.code}`).toBe(
      true
    );
  }
}

describe('ROSTER.specFile — canonical code->spec mapping resolves to real files (SC5)', () => {
  it('(a) fixture path: every non-null specFile resolves under a mock agents dir', () => {
    const mockDir = fs.mkdtempSync(path.join(os.tmpdir(), 'agent-role-roster-'));
    try {
      for (const entry of ROSTER) {
        if (entry.specFile !== null) {
          fs.writeFileSync(path.join(mockDir, entry.specFile), '# stub agent spec\n');
        }
      }
      assertAllSpecFilesResolveUnder(mockDir);
    } finally {
      fs.rmSync(mockDir, { recursive: true, force: true });
    }
  });

  const ganderRoot = process.env.GANDER_ROOT;
  if (ganderRoot) {
    it('(b) live-glob sanity: all 12 non-null specFile values resolve under ${GANDER_ROOT}/.claude/agents/', () => {
      assertAllSpecFilesResolveUnder(path.join(ganderRoot, '.claude', 'agents'));
    });
  } else {
    it.skip('(b) live-glob sanity — SKIPPED: GANDER_ROOT is unset in this environment (CI); set GANDER_ROOT to run this assertion against a real gander repo', () => {});
  }
});
