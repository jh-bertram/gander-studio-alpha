import { describe, it, expect } from 'vitest';
import { computeStatBarViewModel } from '../StatBar';

// Tests the extracted pure view-model, not a rendered component — this repo's vitest.config.ts is
// `environment: 'node'` with `include: ['src/**/__tests__/**/*.test.ts']` (no jsdom, no
// @testing-library/react, and the glob excludes `.test.tsx`). computeStatBarViewModel is the exact
// mechanical source of every prop StatBar's JSX passes through (aria-valuenow, aria-label, readout
// text, fill width%) — verifying it here is equivalent to verifying the rendered output.
describe('computeStatBarViewModel — StatBar pattern spec + statbar-not-applicable state', () => {
  it('normalized=63 → correct fill width, aria-valuenow, and visible readout', () => {
    const vm = computeStatBarViewModel({ label: 'Activity', normalized: 63 });
    expect(vm.widthPct).toBe(63);
    expect(vm.ariaValueNow).toBe(63);
    expect(vm.ariaLabel).toBe('Activity: 63%');
    expect(vm.readout).toBe('63%');
    expect(vm.isNotApplicable).toBe(false);
  });

  it('normalized=null + reason → N/A caption, no aria-valuenow, aria-label carries the reason', () => {
    const vm = computeStatBarViewModel({
      label: 'Accuracy',
      normalized: null,
      reason: 'not audit-gated',
    });
    expect(vm.widthPct).toBe(0);
    expect(vm.ariaValueNow).toBeUndefined();
    expect(vm.readout).toBe('N/A — not audit-gated');
    expect(vm.ariaLabel).toContain('not applicable');
    expect(vm.ariaLabel).toContain('not audit-gated');
    expect(vm.isNotApplicable).toBe(true);
  });

  it('valueLabel overrides the visible readout but not the aria-label percentage', () => {
    const vm = computeStatBarViewModel({ label: 'Activity', normalized: 63, valueLabel: '22/35' });
    expect(vm.readout).toBe('22/35');
    expect(vm.ariaLabel).toBe('Activity: 63%');
  });
});
