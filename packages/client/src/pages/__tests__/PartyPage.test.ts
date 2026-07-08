import { describe, it, expect } from 'vitest';
import type { PartyMember } from '@gander-studio/shared';
import {
  derivePartyGridState,
  computeMostRecentActivityTs,
  formatScopeSummary,
  formatPartyError,
} from '../PartyPage';

// Tests the extracted pure helpers, not a rendered component — this repo's vitest.config.ts is
// `environment: 'node'` with `include: ['src/**/__tests__/**/*.test.ts']` (no jsdom, no
// @testing-library/react, and the glob excludes `.test.tsx`). Same rationale as t2's
// StatBar.test.ts (computeStatBarViewModel).

function makeMember(overrides: Partial<PartyMember>): PartyMember {
  return {
    code: 'FE',
    roleCategory: 'Impl',
    materiaColorKey: '--mg',
    portraitSeed: 'FE',
    stats: [],
    lastActivityTs: null,
    hasCorpusActivity: true,
    ...overrides,
  };
}

describe('derivePartyGridState — PartyGrid mutually-exclusive state contract', () => {
  it('isLoading takes precedence over isError and members', () => {
    expect(derivePartyGridState({ isLoading: true, isError: true, members: [] })).toBe('loading');
  });

  it('isError (not loading) selects error regardless of members', () => {
    expect(
      derivePartyGridState({ isLoading: false, isError: true, members: [makeMember({})] }),
    ).toBe('error');
  });

  it('empty members (not loading/error) selects empty', () => {
    expect(derivePartyGridState({ isLoading: false, isError: false, members: [] })).toBe('empty');
    expect(derivePartyGridState({ isLoading: false, isError: false, members: undefined })).toBe(
      'empty',
    );
  });

  it('non-empty members (not loading/error) selects default', () => {
    expect(
      derivePartyGridState({ isLoading: false, isError: false, members: [makeMember({})] }),
    ).toBe('default');
  });
});

describe('computeMostRecentActivityTs', () => {
  it('returns the max ISO timestamp across members', () => {
    const members = [
      makeMember({ code: 'FE', lastActivityTs: '2026-07-01T00:00:00Z' }),
      makeMember({ code: 'BE', lastActivityTs: '2026-07-07T23:49:55Z' }),
      makeMember({ code: 'DS', lastActivityTs: null }),
    ];
    expect(computeMostRecentActivityTs(members)).toBe('2026-07-07T23:49:55Z');
  });

  it('returns null when no member has recorded activity', () => {
    const members = [makeMember({ lastActivityTs: null })];
    expect(computeMostRecentActivityTs(members)).toBeNull();
  });
});

describe('formatScopeSummary', () => {
  it('formats "{n}-agent roster · updated {date}" for members with activity', () => {
    const members = [
      makeMember({ code: 'FE', lastActivityTs: '2026-07-07T23:49:55Z' }),
      makeMember({ code: 'BE', lastActivityTs: '2026-07-01T00:00:00Z' }),
    ];
    const summary = formatScopeSummary(members);
    expect(summary).toContain('2-agent roster');
    expect(summary).toContain('updated');
    expect(summary).not.toContain('no recorded activity');
  });

  it('falls back to "no recorded activity" when no member has a lastActivityTs', () => {
    const members = [makeMember({ lastActivityTs: null })];
    expect(formatScopeSummary(members)).toBe('1-agent roster · updated no recorded activity');
  });
});

describe('formatPartyError', () => {
  it('uses Error.message for Error instances', () => {
    expect(formatPartyError(new Error('network timeout'))).toBe(
      "Couldn't load party data — network timeout.",
    );
  });

  it('stringifies non-Error values', () => {
    expect(formatPartyError('boom')).toBe("Couldn't load party data — boom.");
  });
});
