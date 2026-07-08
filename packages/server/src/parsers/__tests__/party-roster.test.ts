// party-roster.test.ts — unit tests for assembleParty (t3, SC1-SC6).
//
// Fixture lives in an ISOLATED per-file subdirectory under `fixtures/` (same
// reason as party-stats.test.ts — assembleParty scans a whole directory's
// agent-events-*.jsonl files; sharing a dir would contaminate exact-value
// assertions). Roles/counts are deliberately chosen so BE's spawnCount is
// EXACTLY half of FE's (the max/anchor role): FE=4 spawns, BE=2 spawns.
//
// Per constraint 7: no corpus-wide (live GANDER_ROOT / SESSIONS_SOURCE_DIRS)
// value is locked anywhere in this file — the anchor assertions below check
// the RELATIONSHIP between a role's normalized value and the measured
// anchor, not a hardcoded anchor number.

import { describe, it, expect } from 'vitest';
import path from 'node:path';
import { assembleParty, TOKENS_PROJECTED_PLACEHOLDER } from '../party-roster.js';

const PARTY_ROSTER_DIR = path.join(import.meta.dirname, 'fixtures', 'party-roster');

describe('assembleParty — roster shape (SC1)', () => {
  it('returns exactly 13 PartyMembers, one per ROSTER code', async () => {
    const { members } = await assembleParty([PARTY_ROSTER_DIR]);
    expect(members).toHaveLength(13);
    const codes = new Set(members.map((m) => m.code));
    expect(codes).toEqual(
      new Set(['BE', 'FE', 'DS', 'PM', 'ORC', 'RA', 'ST', 'AR', 'UI', 'DI', 'HR', 'CR', 'AU']),
    );
  });

  it('every member carries three stat bars (Activity, Stamina, Accuracy), each with raw/normalized/derivation/feasibility', async () => {
    const { members } = await assembleParty([PARTY_ROSTER_DIR]);
    for (const member of members) {
      expect(member.stats.map((s) => s.label)).toEqual(['Activity', 'Stamina', 'Accuracy']);
      for (const bar of member.stats) {
        expect(bar).toHaveProperty('raw');
        expect(bar).toHaveProperty('normalized');
        expect(typeof bar.derivation).toBe('string');
        expect(bar.feasibility).toBe('available');
      }
    }
  });
});

describe('assembleParty — Activity normalization is anchor-relative, not a locked number (SC1/constraint 7)', () => {
  it('the max-spawn role (FE) reads normalized=100 against the LIVE anchor', async () => {
    const { members, activityAnchor } = await assembleParty([PARTY_ROSTER_DIR]);
    const fe = members.find((m) => m.code === 'FE')!;
    const activity = fe.stats.find((s) => s.label === 'Activity')!;
    // FE IS the anchor role in this fixture — relationship, not a locked value.
    expect(activity.raw).toBe(activityAnchor);
    expect(activity.normalized).toBe(100);
  });

  it('a role whose spawnCount is exactly half the anchor reads normalized ~50 — verified via the ratio, not a hardcoded anchor', async () => {
    const { members } = await assembleParty([PARTY_ROSTER_DIR]);
    const fe = members.find((m) => m.code === 'FE')!;
    const be = members.find((m) => m.code === 'BE')!;
    const feActivity = fe.stats.find((s) => s.label === 'Activity')!;
    const beActivity = be.stats.find((s) => s.label === 'Activity')!;
    expect(beActivity.raw).toBe((feActivity.raw as number) / 2);
    expect(beActivity.normalized).toBe(
      Math.round(((beActivity.raw as number) / (feActivity.raw as number)) * 100),
    );
    expect(beActivity.normalized).toBe(50);
  });
});

describe('assembleParty — non-Impl Accuracy is explicit N/A, never a bare 0 (SC4)', () => {
  it('HR (Meta, non-Impl) Accuracy is normalized:null with reason "not audit-gated"', async () => {
    const { members } = await assembleParty([PARTY_ROSTER_DIR]);
    const hr = members.find((m) => m.code === 'HR')!;
    const accuracy = hr.stats.find((s) => s.label === 'Accuracy')!;
    expect(accuracy.raw).toBeNull();
    expect(accuracy.normalized).toBeNull();
    expect(accuracy.reason).toBe('not audit-gated');
  });

  it('DS (Impl, but zero attributed audits in this fixture) Accuracy is normalized:null with a distinct reason', async () => {
    const { members } = await assembleParty([PARTY_ROSTER_DIR]);
    const ds = members.find((m) => m.code === 'DS')!;
    const accuracy = ds.stats.find((s) => s.label === 'Accuracy')!;
    expect(accuracy.raw).toBeNull();
    expect(accuracy.normalized).toBeNull();
    expect(accuracy.reason).toBe('no attributed audits observed');
  });

  it('FE (Impl, all first-pass) Accuracy reads raw=1, normalized=100', async () => {
    const { members } = await assembleParty([PARTY_ROSTER_DIR]);
    const fe = members.find((m) => m.code === 'FE')!;
    const accuracy = fe.stats.find((s) => s.label === 'Accuracy')!;
    expect(accuracy.raw).toBe(1);
    expect(accuracy.normalized).toBe(100);
  });

  it('BE (Impl, one fail-then-pass family) Accuracy reads raw=0, normalized=0 — attributed but not first-pass', async () => {
    const { members } = await assembleParty([PARTY_ROSTER_DIR]);
    const be = members.find((m) => m.code === 'BE')!;
    const accuracy = be.stats.find((s) => s.label === 'Accuracy')!;
    expect(accuracy.raw).toBe(0);
    expect(accuracy.normalized).toBe(0);
  });
});

describe('assembleParty — Stamina N/A for zero-spawn roles', () => {
  it('a role with zero spawns (DI) reads Stamina normalized:null with reason "no spawns observed"', async () => {
    const { members } = await assembleParty([PARTY_ROSTER_DIR]);
    const di = members.find((m) => m.code === 'DI')!;
    const stamina = di.stats.find((s) => s.label === 'Stamina')!;
    expect(stamina.normalized).toBeNull();
    expect(stamina.reason).toBe('no spawns observed');
  });
});

describe('assembleParty — hasCorpusActivity surfaced, never hidden (SC1)', () => {
  it('DI (zero corpus data — no ROSTER.specFile, per inventory §4) has hasCorpusActivity:false and lastActivityTs:null', async () => {
    const { members } = await assembleParty([PARTY_ROSTER_DIR]);
    const di = members.find((m) => m.code === 'DI')!;
    expect(di.hasCorpusActivity).toBe(false);
    expect(di.lastActivityTs).toBeNull();
  });

  it('a role with observed events (FE) has hasCorpusActivity:true', async () => {
    const { members } = await assembleParty([PARTY_ROSTER_DIR]);
    const fe = members.find((m) => m.code === 'FE')!;
    expect(fe.hasCorpusActivity).toBe(true);
  });
});

describe('assembleParty — sorted by activity recency, descending, nulls last (SC1)', () => {
  it('members with a lastActivityTs are ordered newest-first, ahead of every null-ts member', async () => {
    const { members } = await assembleParty([PARTY_ROSTER_DIR]);
    const withTs = members.filter((m) => m.lastActivityTs !== null);
    const withoutTs = members.filter((m) => m.lastActivityTs === null);

    // withTs is a strictly-descending prefix of `members`.
    for (let i = 1; i < withTs.length; i++) {
      expect(withTs[i - 1]!.lastActivityTs! >= withTs[i]!.lastActivityTs!).toBe(true);
    }
    // Every timestamped member precedes every null-ts member in the full array.
    const lastTsIndex = members.findIndex((m) => m.lastActivityTs === null);
    if (withoutTs.length > 0) {
      expect(lastTsIndex).toBe(withTs.length);
    }

    // This fixture's four timestamped roles, in expected recency order:
    // HR (02:05) > AU (01:15) > BE (01:10) > FE (00:30).
    expect(withTs.map((m) => m.code)).toEqual(['HR', 'AU', 'BE', 'FE']);
  });
});

describe('assembleParty — diagnostics threaded through, not dropped (SC5)', () => {
  it('surfaces totalRawLines/validEntries/invalidLineCount/distinct+uncounted event types from t2', async () => {
    const result = await assembleParty([PARTY_ROSTER_DIR]);
    expect(result.diagnostics.totalRawLines).toBe(14);
    expect(result.diagnostics.validEntries).toBe(14);
    expect(result.diagnostics.invalidLineCount).toBe(0);
    expect(result.diagnostics.distinctEventTypes).toBeGreaterThan(0);
  });
});

describe('tokens/cost — reserved projected placeholder, never a card bar (SC3)', () => {
  it('TOKENS_PROJECTED_PLACEHOLDER is feasibility:"projected" with a null value', () => {
    expect(TOKENS_PROJECTED_PLACEHOLDER.feasibility).toBe('projected');
    expect(TOKENS_PROJECTED_PLACEHOLDER.raw).toBeNull();
    expect(TOKENS_PROJECTED_PLACEHOLDER.normalized).toBeNull();
  });

  it('no PartyMember stat ever carries the tokens-projected derivation (placeholder is never populated into members[].stats)', async () => {
    const { members } = await assembleParty([PARTY_ROSTER_DIR]);
    for (const member of members) {
      expect(member.stats.some((s) => s.derivation === 'tokens-projected')).toBe(false);
    }
  });
});
