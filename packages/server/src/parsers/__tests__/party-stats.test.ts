// party-stats.test.ts — unit tests for computePartyDerivations (t2, SC2/SC3/SC5).
//
// Fixtures live in ISOLATED per-file subdirectories under `fixtures/` (not the
// shared fixtures dir) because computePartyDerivations scans a whole directory's
// agent-events-*.jsonl files — sharing a dir with the other suites' pre-existing
// fixtures would contaminate these exact-value assertions. See
// docs/agent-logs/BE/prog-studio-v2-2026-07-s1-data-layer-t2.md for the fixture
// design rationale and the sprintRoot merge verification performed before writing
// these assertions.
//
// Per constraint 7/SC8: all exact numeric assertions below are derived from these
// SYNTHETIC fixtures only — no corpus-wide (live GANDER_ROOT / SESSIONS_SOURCE_DIRS)
// value is locked anywhere in this file.

import { describe, it, expect } from 'vitest';
import path from 'node:path';
import { computePartyDerivations } from '../party-stats.js';

const ATTRIBUTION_FLIP_DIR = path.join(import.meta.dirname, 'fixtures', 'attribution-flip');
const MALFORMED_LINE_DIR = path.join(import.meta.dirname, 'fixtures', 'malformed-line');

describe('computePartyDerivations — attribution flip (§2.1, SC2)', () => {
  it('FE: clean first-pass family + same-role multi-instance family (FE#1+FE#2->FE) combine to 3/3 first-pass', async () => {
    const { perRole } = await computePartyDerivations([ATTRIBUTION_FLIP_DIR]);
    const fe = perRole.get('FE');
    expect(fe).toBeDefined();
    // family "attribution-flip-fe-clean-p1" (FE#1, no fail): +1 attributed, +1 first-pass.
    // family "attribution-flip-fe-multiinstance-p1"(+"-002", sprintRoot-merged, FE#1 then
    // FE#2, both clean): +2 attributed, +2 first-pass.
    // Combined global FE rollup: 3 attributed, 3 first-pass.
    expect(fe?.attributedAudits).toBe(3);
    expect(fe?.firstPassAudits).toBe(3);
  });

  it('BE: AUDIT_FAIL then AUDIT_PASS in the same family -> 0/1 first-pass (attributed, not first-pass)', async () => {
    const { perRole } = await computePartyDerivations([ATTRIBUTION_FLIP_DIR]);
    const be = perRole.get('BE');
    expect(be).toBeDefined();
    expect(be?.attributedAudits).toBe(1);
    expect(be?.firstPassAudits).toBe(0);
  });

  it('same-role multi-instance family: FE#1 + FE#2 (cross-task_id, sprintRoot-merged) both roll to FE — instance-suffix stripping proven through the flip (CR#1 audit-risk-forecast #2)', async () => {
    const { perRole } = await computePartyDerivations([ATTRIBUTION_FLIP_DIR]);
    const fe = perRole.get('FE');
    // FE#1 (clean family) + FE#1 (multiinstance family) + FE#2 (multiinstance family)
    // = 3 SPAWN events total, all rolled under the single canonicalized 'FE' bucket —
    // neither instance was dropped or double-counted under a separate 'FE#2' key.
    expect(fe?.spawnCount).toBe(3);
    expect(perRole.has('FE#1')).toBe(false);
    expect(perRole.has('FE#2')).toBe(false);
  });

  it('AUDIT_PASS/AUDIT_FAIL events attributed to the implementer role, never to the AUDITOR gate role', async () => {
    const { perRole } = await computePartyDerivations([ATTRIBUTION_FLIP_DIR]);
    // AUDITOR#1/AUDITOR#2 issue every AUDIT_PASS/AUDIT_FAIL in this fixture but never
    // SPAWN, so the AU bucket (if present at all) must carry zero attributed audits —
    // the flip means audits land on FE/BE, not on AU.
    const au = perRole.get('AU');
    if (au) {
      expect(au.attributedAudits).toBe(0);
      expect(au.firstPassAudits).toBe(0);
    }
  });
});

describe('computePartyDerivations — ghost/stall rate (§2.2)', () => {
  it('DS: 1 GHOST_CONFIRMED / 2 SPAWN — own agent_id is the stalled agent directly, no attribution heuristic', async () => {
    const { perRole } = await computePartyDerivations([ATTRIBUTION_FLIP_DIR]);
    const ds = perRole.get('DS');
    expect(ds).toBeDefined();
    expect(ds?.spawnCount).toBe(2);
    expect(ds?.ghostCount).toBe(1);
  });
});

describe('computePartyDerivations — event-type coverage (§2.3)', () => {
  it('counts distinct ev types and flags the ones session-stats.ts does not count', async () => {
    const { diagnostics } = await computePartyDerivations([ATTRIBUTION_FLIP_DIR]);
    // Fixture ev set: SPAWN, AUDIT_PASS, AUDIT_FAIL, GHOST_CONFIRMED, COMPLETE, CHECKPOINT = 6 distinct.
    expect(diagnostics.distinctEventTypes).toBe(6);
    // Uncounted (not among the 6 session-stats.ts accumulateEv values {SPAWN,COMPLETE,
    // CRITIQUE_PASS,CRITIQUE_BLOCK,AUDIT_PASS,AUDIT_FAIL}): GHOST_CONFIRMED, CHECKPOINT = 2.
    expect(diagnostics.uncountedEventTypes).toBe(2);
  });
});

describe('computePartyDerivations — invalid-line surfacing (silent-empty forbidden, SC3)', () => {
  it('counts the HCG_RESOLVED-shaped invalid line (missing agent_id, has resolved_by) — never dropped', async () => {
    const { diagnostics } = await computePartyDerivations([MALFORMED_LINE_DIR]);
    expect(diagnostics.totalRawLines).toBe(3);
    expect(diagnostics.validEntries).toBe(2);
    expect(diagnostics.invalidLineCount).toBe(1);
    expect(diagnostics.invalidLineSamples).toHaveLength(1);
    expect(diagnostics.invalidLineSamples[0]).toContain('HCG_RESOLVED');
  });
});

describe('computePartyDerivations — multi-root aggregation (SESSIONS_SOURCE_DIRS)', () => {
  it('aggregates diagnostics across multiple eventsDirs', async () => {
    const { diagnostics } = await computePartyDerivations([ATTRIBUTION_FLIP_DIR, MALFORMED_LINE_DIR]);
    expect(diagnostics.totalRawLines).toBe(16 + 3);
    expect(diagnostics.validEntries).toBe(16 + 2);
    expect(diagnostics.invalidLineCount).toBe(1);
  });

  it('returns empty diagnostics/perRole for a directory that does not exist (no throw, no fabricated data)', async () => {
    const result = await computePartyDerivations([path.join(ATTRIBUTION_FLIP_DIR, 'does-not-exist')]);
    expect(result.diagnostics.totalRawLines).toBe(0);
    expect(result.diagnostics.distinctEventTypes).toBe(0);
    expect(result.perRole.size).toBe(0);
  });
});
