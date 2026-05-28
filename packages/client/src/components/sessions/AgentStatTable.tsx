import { useState, useCallback, type ReactElement } from 'react';
import type { AgentActivity } from '@gander-studio/shared';

// ---- Types -------------------------------------------------------------------

type MetricKey = 'spawns' | 'feedback_loops' | 'wall_clock_ms';
type SortKey   = 'agent' | 'spawns' | 'feedback_loops' | 'wall_clock_ms' | 'audit';
type SortDir   = 'asc' | 'desc' | 'default';

interface Props {
  activities: AgentActivity[];
  metrics: MetricKey[];
  className?: string;
}

// ---- Helpers -----------------------------------------------------------------

const METRIC_LABEL: Record<MetricKey, string> = {
  spawns:         'Count',
  feedback_loops: 'Feedback Loops',
  wall_clock_ms:  'Wall Clock',
};

function auditRatio(a: AgentActivity): number {
  return a.audit_passes - a.audit_fails;
}

function compareActivities(
  a: AgentActivity,
  b: AgentActivity,
  key: SortKey,
  dir: 'asc' | 'desc',
): number {
  let cmp = 0;
  switch (key) {
    case 'agent':
      cmp = a.agent_id.localeCompare(b.agent_id);
      break;
    case 'spawns':
      cmp = a.spawns - b.spawns;
      break;
    case 'feedback_loops':
      cmp = a.feedback_loops - b.feedback_loops;
      break;
    case 'wall_clock_ms':
      cmp = (a.wall_clock_ms ?? -1) - (b.wall_clock_ms ?? -1);
      break;
    case 'audit':
      cmp = auditRatio(a) - auditRatio(b);
      break;
  }
  return dir === 'asc' ? cmp : -cmp;
}

function formatWallClock(ms: number | undefined): string {
  if (ms === undefined) return '—';
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

function formatAudit(a: AgentActivity): string {
  return `${a.audit_passes}✓ / ${a.audit_fails}✗`;
}

// ---- Component ---------------------------------------------------------------

export default function AgentStatTable({ activities, metrics, className }: Props): ReactElement {
  const [sortKey, setSortKey] = useState<SortKey | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>('default');

  const handleSort = useCallback((key: SortKey) => {
    setSortKey((prevKey) => {
      if (prevKey !== key) {
        setSortDir('asc');
        return key;
      }
      // Same key — cycle asc → desc → default
      setSortDir((prevDir) => {
        if (prevDir === 'asc') return 'desc';
        if (prevDir === 'desc') return 'default';
        return 'asc';
      });
      return key;
    });
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLButtonElement>, key: SortKey) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleSort(key);
      }
    },
    [handleSort],
  );

  // Derive sorted rows
  const sorted: AgentActivity[] = (() => {
    if (sortKey === null || sortDir === 'default') return [...activities];
    return [...activities].sort((a, b) =>
      compareActivities(a, b, sortKey, sortDir as 'asc' | 'desc'),
    );
  })();

  function ariaSortValue(key: SortKey): 'ascending' | 'descending' | 'none' {
    if (sortKey !== key || sortDir === 'default') return 'none';
    return sortDir === 'asc' ? 'ascending' : 'descending';
  }

  function headerButtonLabel(key: SortKey, label: string): string {
    const dir = ariaSortValue(key);
    if (dir === 'none') return `Sort by ${label}`;
    return `Sort by ${label}, ${dir}`;
  }

  if (activities.length === 0) {
    return (
      <div
        aria-live="polite"
        className={className}
        style={{
          fontFamily: 'var(--fm)',
          fontSize:   '12px',
          color:      'var(--wm)',
          padding:    '24px',
          textAlign:  'center',
        }}
      >
        No agent data
      </div>
    );
  }

  // Columns: agent (always), metric columns (conditional), audit (always)
  return (
    <div className={className} style={{ overflowX: 'auto' }}>
      <table
        aria-label="Agent statistics"
        style={{
          width:          '100%',
          borderCollapse: 'collapse',
          fontFamily:     'var(--fm)',
          fontSize:       '12px',
        }}
      >
        <thead>
          <tr>
            {/* Agent column — always present */}
            <th
              scope="col"
              aria-sort={ariaSortValue('agent')}
              style={{ padding: '0', borderBottom: '1px solid var(--bdb)', textAlign: 'left', whiteSpace: 'nowrap' }}
            >
              <button
                onClick={() => handleSort('agent')}
                onKeyDown={(e) => handleKeyDown(e, 'agent')}
                aria-label={headerButtonLabel('agent', 'Agent')}
                style={{
                  background:    'none',
                  border:        'none',
                  cursor:        'pointer',
                  fontFamily:    'var(--fm)',
                  fontSize:      '10px',
                  fontWeight:    700,
                  color:         sortKey === 'agent' && sortDir !== 'default' ? 'var(--mt)' : 'var(--wm)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.12em',
                  padding:       '8px 10px',
                  display:       'flex',
                  alignItems:    'center',
                  gap:           '4px',
                  width:         '100%',
                  textAlign:     'left',
                }}
              >
                Agent
                {sortKey === 'agent' && sortDir !== 'default' && (
                  <span aria-hidden="true" style={{ fontSize: '9px' }}>
                    {sortDir === 'asc' ? '▲' : '▼'}
                  </span>
                )}
              </button>
            </th>

            {/* Metric columns — conditional */}
            {metrics.includes('spawns') && (
              <th
                scope="col"
                aria-sort={ariaSortValue('spawns')}
                style={{ padding: '0', borderBottom: '1px solid var(--bdb)', textAlign: 'left', whiteSpace: 'nowrap' }}
              >
                <button
                  onClick={() => handleSort('spawns')}
                  onKeyDown={(e) => handleKeyDown(e, 'spawns')}
                  aria-label={headerButtonLabel('spawns', 'Count')}
                  data-testid="sort-spawns"
                  style={{
                    background:    'none',
                    border:        'none',
                    cursor:        'pointer',
                    fontFamily:    'var(--fm)',
                    fontSize:      '10px',
                    fontWeight:    700,
                    color:         sortKey === 'spawns' && sortDir !== 'default' ? 'var(--mt)' : 'var(--wm)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.12em',
                    padding:       '8px 10px',
                    display:       'flex',
                    alignItems:    'center',
                    gap:           '4px',
                    width:         '100%',
                    textAlign:     'left',
                  }}
                >
                  Count
                  {sortKey === 'spawns' && sortDir !== 'default' && (
                    <span aria-hidden="true" style={{ fontSize: '9px' }}>
                      {sortDir === 'asc' ? '▲' : '▼'}
                    </span>
                  )}
                </button>
              </th>
            )}

            {metrics.includes('feedback_loops') && (
              <th
                scope="col"
                aria-sort={ariaSortValue('feedback_loops')}
                style={{ padding: '0', borderBottom: '1px solid var(--bdb)', textAlign: 'left', whiteSpace: 'nowrap' }}
              >
                <button
                  onClick={() => handleSort('feedback_loops')}
                  onKeyDown={(e) => handleKeyDown(e, 'feedback_loops')}
                  aria-label={headerButtonLabel('feedback_loops', 'Feedback Loops')}
                  style={{
                    background:    'none',
                    border:        'none',
                    cursor:        'pointer',
                    fontFamily:    'var(--fm)',
                    fontSize:      '10px',
                    fontWeight:    700,
                    color:         sortKey === 'feedback_loops' && sortDir !== 'default' ? 'var(--mt)' : 'var(--wm)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.12em',
                    padding:       '8px 10px',
                    display:       'flex',
                    alignItems:    'center',
                    gap:           '4px',
                    width:         '100%',
                    textAlign:     'left',
                  }}
                >
                  Feedback Loops
                  {sortKey === 'feedback_loops' && sortDir !== 'default' && (
                    <span aria-hidden="true" style={{ fontSize: '9px' }}>
                      {sortDir === 'asc' ? '▲' : '▼'}
                    </span>
                  )}
                </button>
              </th>
            )}

            {metrics.includes('wall_clock_ms') && (
              <th
                scope="col"
                aria-sort={ariaSortValue('wall_clock_ms')}
                style={{ padding: '0', borderBottom: '1px solid var(--bdb)', textAlign: 'left', whiteSpace: 'nowrap' }}
              >
                <button
                  onClick={() => handleSort('wall_clock_ms')}
                  onKeyDown={(e) => handleKeyDown(e, 'wall_clock_ms')}
                  aria-label={headerButtonLabel('wall_clock_ms', 'Wall Clock')}
                  style={{
                    background:    'none',
                    border:        'none',
                    cursor:        'pointer',
                    fontFamily:    'var(--fm)',
                    fontSize:      '10px',
                    fontWeight:    700,
                    color:         sortKey === 'wall_clock_ms' && sortDir !== 'default' ? 'var(--mt)' : 'var(--wm)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.12em',
                    padding:       '8px 10px',
                    display:       'flex',
                    alignItems:    'center',
                    gap:           '4px',
                    width:         '100%',
                    textAlign:     'left',
                  }}
                >
                  Wall Clock
                  {sortKey === 'wall_clock_ms' && sortDir !== 'default' && (
                    <span aria-hidden="true" style={{ fontSize: '9px' }}>
                      {sortDir === 'asc' ? '▲' : '▼'}
                    </span>
                  )}
                </button>
              </th>
            )}

            {/* Audit column — always present */}
            <th
              scope="col"
              aria-sort={ariaSortValue('audit')}
              style={{ padding: '0', borderBottom: '1px solid var(--bdb)', textAlign: 'left', whiteSpace: 'nowrap' }}
            >
              <button
                onClick={() => handleSort('audit')}
                onKeyDown={(e) => handleKeyDown(e, 'audit')}
                aria-label={headerButtonLabel('audit', 'Audit')}
                style={{
                  background:    'none',
                  border:        'none',
                  cursor:        'pointer',
                  fontFamily:    'var(--fm)',
                  fontSize:      '10px',
                  fontWeight:    700,
                  color:         sortKey === 'audit' && sortDir !== 'default' ? 'var(--mt)' : 'var(--wm)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.12em',
                  padding:       '8px 10px',
                  display:       'flex',
                  alignItems:    'center',
                  gap:           '4px',
                  width:         '100%',
                  textAlign:     'left',
                }}
              >
                Audit
                {sortKey === 'audit' && sortDir !== 'default' && (
                  <span aria-hidden="true" style={{ fontSize: '9px' }}>
                    {sortDir === 'asc' ? '▲' : '▼'}
                  </span>
                )}
              </button>
            </th>
          </tr>
        </thead>

        <tbody>
          {sorted.map((row) => (
            <tr
              key={row.agent_id}
              data-agent-id={row.agent_id}
              style={{ borderBottom: '1px solid var(--bd)' }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLTableRowElement).style.background = 'var(--sfh)'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLTableRowElement).style.background = ''; }}
            >
              <td
                style={{
                  padding:    '8px 10px',
                  color:      'var(--mt)',
                  fontWeight: 600,
                  whiteSpace: 'nowrap',
                }}
              >
                {row.agent_id}
              </td>
              {metrics.includes('spawns') && (
                <td style={{ padding: '8px 10px', color: 'var(--wd)' }}>
                  {row.spawns}
                </td>
              )}
              {metrics.includes('feedback_loops') && (
                <td style={{ padding: '8px 10px', color: 'var(--wd)' }}>
                  {row.feedback_loops}
                </td>
              )}
              {metrics.includes('wall_clock_ms') && (
                <td
                  data-testid="wall-clock-cell"
                  style={{ padding: '8px 10px', color: 'var(--wd)' }}
                >
                  {formatWallClock(row.wall_clock_ms)}
                </td>
              )}
              <td style={{ padding: '8px 10px', color: 'var(--wd)' }}>
                {formatAudit(row)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
