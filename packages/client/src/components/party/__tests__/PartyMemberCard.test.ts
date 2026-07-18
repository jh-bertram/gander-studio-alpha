import { describe, it, expect } from 'vitest';
import type { PartyMember } from '@gander-studio/shared';
import { buildCardAriaLabel } from '../PartyMemberCard';

// Tests the extracted pure aria-label builder, not a rendered component — vitest.config.ts is
// `environment: 'node'` (no jsdom, glob excludes `.test.tsx`). buildCardAriaLabel is the exact
// mechanical source of PartyMemberCard's single aria-label per accessibility_spec.aria_requirements
// ("{agent code}, {role category}. Activity {n}%, Stamina {n}%, Accuracy {n}% or not applicable.").
function makeMember(overrides: Partial<PartyMember> = {}): PartyMember {
  return {
    code: 'FE',
    roleCategory: 'Impl',
    materiaColorKey: '--mg',
    portraitSeed: 'FE-seed',
    lastActivityTs: '2026-07-01T00:00:00.000Z',
    hasCorpusActivity: true,
    stats: [
      { label: 'Activity', raw: 46, normalized: 100, derivation: 'activity-spawns-normalized', feasibility: 'available' },
      { label: 'Stamina', raw: 0.957, normalized: 96, derivation: 'stamina-ghost-rate', feasibility: 'available' },
      { label: 'Accuracy', raw: 0.63, normalized: 63, derivation: 'accuracy-first-pass', feasibility: 'available' },
    ],
    ...overrides,
  };
}

describe('buildCardAriaLabel — PartyMemberCard aria_requirements contract', () => {
  it('all stats populated → composite label with all three percentages', () => {
    const label = buildCardAriaLabel(makeMember());
    expect(label).toBe('FE, Impl. Activity 100%, Stamina 96%, Accuracy 63%.');
  });

  it('a null-normalized stat (data-driven N/A) renders "not applicable" for that bar only', () => {
    const member = makeMember({
      code: 'PM',
      roleCategory: 'Command',
      stats: [
        { label: 'Activity', raw: 25, normalized: 54, derivation: 'activity-spawns-normalized', feasibility: 'available' },
        { label: 'Stamina', raw: 1, normalized: 100, derivation: 'stamina-ghost-rate', feasibility: 'available' },
        { label: 'Accuracy', raw: null, normalized: null, derivation: 'accuracy-first-pass', feasibility: 'available', reason: 'not audit-gated' },
      ],
    });
    expect(buildCardAriaLabel(member)).toBe('PM, Command. Activity 54%, Stamina 100%, Accuracy not applicable.');
  });

  it('a missing stat entry (not just null-normalized) also degrades to "not applicable"', () => {
    const member = makeMember({ stats: [{ label: 'Activity', raw: 10, normalized: 40, derivation: 'x', feasibility: 'available' }] });
    expect(buildCardAriaLabel(member)).toBe('FE, Impl. Activity 40%, Stamina not applicable, Accuracy not applicable.');
  });
});
