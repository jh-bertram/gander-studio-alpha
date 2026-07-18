import { describe, it, expect } from 'vitest';
import { formatWallClock, agentDisplayConfig } from '../session-metrics';

const SECOND = 1000;
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;
const MONTH = 30 * DAY;

describe('formatWallClock — adaptive whole-number units', () => {
  it('returns the em-dash for undefined', () => {
    expect(formatWallClock(undefined)).toBe('—');
  });

  it('shows ms below one second', () => {
    expect(formatWallClock(0)).toBe('0ms');
    expect(formatWallClock(999)).toBe('999ms');
  });

  it('shows whole seconds below one minute', () => {
    expect(formatWallClock(1000)).toBe('1s');
    expect(formatWallClock(45 * SECOND)).toBe('45s');
    // rounds to whole seconds
    expect(formatWallClock(45 * SECOND + 600)).toBe('46s');
  });

  it('shows pluralized minutes below one hour', () => {
    expect(formatWallClock(MINUTE)).toBe('1 minute');
    expect(formatWallClock(5 * MINUTE)).toBe('5 minutes');
  });

  it('shows pluralized hours below one day', () => {
    expect(formatWallClock(HOUR)).toBe('1 hour');
    expect(formatWallClock(3 * HOUR)).toBe('3 hours');
  });

  it('shows pluralized days below one month', () => {
    expect(formatWallClock(DAY)).toBe('1 day');
    expect(formatWallClock(2 * DAY)).toBe('2 days');
  });

  it('shows pluralized months and rounds away excess precision', () => {
    expect(formatWallClock(MONTH)).toBe('1 month');
    // 3.0123 months → "3 months"
    expect(formatWallClock(Math.round(3.0123 * MONTH))).toBe('3 months');
    // the old bug: a multi-month span no longer reads as millions of seconds
    expect(formatWallClock(90 * DAY)).toBe('3 months');
  });
});

describe('agentDisplayConfig — pinned role sets (regression guard)', () => {
  it('CR → critique grid, no metrics', () => {
    expect(agentDisplayConfig('CR#1')).toEqual({ grid: 'critique', metrics: [] });
  });
  it('AUD and AUDITOR → audit grid, no metrics', () => {
    expect(agentDisplayConfig('AUD#3')).toEqual({ grid: 'audit', metrics: [] });
    expect(agentDisplayConfig('AUDITOR#6')).toEqual({ grid: 'audit', metrics: [] });
  });
  it('other roles → no grid, three metrics', () => {
    expect(agentDisplayConfig('BE#1')).toEqual({
      grid: 'none',
      metrics: ['files_touched', 'feedback_loops', 'wall_clock_ms'],
    });
  });
});
