import { useState, useCallback } from 'react';
import type { Session, AgentActivity } from '@gander-studio/shared';

interface Props {
  session: Session;
}

// ---- Column definition -------------------------------------------------------

type ColKey =
  | 'agent_id'
  | 'spawns'
  | 'completes'
  | 'feedback_loops'
  | 'critique_passes'
  | 'critique_blocks'
  | 'audit_passes'
  | 'audit_fails'
  | 'wall_clock_ms';

interface ColDef {
  key:   ColKey;
  label: string;
}

const COLUMNS: ColDef[] = [
  { key: 'agent_id',        label: 'Agent ID'        },
  { key: 'spawns',          label: 'Spawns'          },
  { key: 'completes',       label: 'Completes'       },
  { key: 'feedback_loops',  label: 'Feedback Loops'  },
  { key: 'critique_passes', label: 'Critique Passes' },
  { key: 'critique_blocks', label: 'Critique Blocks' },
  { key: 'audit_passes',    label: 'Audit Passes'    },
  { key: 'audit_fails',     label: 'Audit Fails'     },
  { key: 'wall_clock_ms',   label: 'Wall Clock (ms)' },
];

type SortDir = 'asc' | 'desc';

// ---- Sort helpers ------------------------------------------------------------

function getCellValue(row: AgentActivity, key: ColKey): string | number {
  const raw = row[key];
  return raw == null ? '' : raw;
}

function compareRows(a: AgentActivity, b: AgentActivity, key: ColKey, dir: SortDir): number {
  const av = getCellValue(a, key);
  const bv = getCellValue(b, key);

  let cmp = 0;
  if (typeof av === 'number' && typeof bv === 'number') {
    cmp = av - bv;
  } else {
    cmp = String(av).localeCompare(String(bv));
  }
  return dir === 'asc' ? cmp : -cmp;
}

function displayCell(row: AgentActivity, key: ColKey): string {
  const raw = row[key];
  if (raw == null) return '—';
  return String(raw);
}

// ---- TableTab ----------------------------------------------------------------

export default function TableTab({ session }: Props) {
  const [sortKey, setSortKey] = useState<ColKey>('agent_id');
  const [sortDir, setSortDir] = useState<SortDir>('asc');

  const handleSort = useCallback((key: ColKey) => {
    setSortKey((prev) => {
      if (prev === key) {
        setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
        return prev;
      }
      setSortDir('asc');
      return key;
    });
  }, []);

  const handleSortKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLButtonElement>, key: ColKey) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleSort(key);
      }
    },
    [handleSort],
  );

  const sorted = [...session.agents].sort((a, b) =>
    compareRows(a, b, sortKey, sortDir),
  );

  return (
    <div data-testid="table-tab">
      {session.agents.length === 0 ? (
        <div
          aria-live="polite"
          style={{
            fontFamily:  'var(--fm)',
            fontSize:    '12px',
            color:       'var(--wm)',
            padding:     '24px 0',
            textAlign:   'center',
          }}
        >
          No agent activity recorded
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table
            aria-label="Agent activity"
            style={{
              width:           '100%',
              borderCollapse:  'collapse',
              fontFamily:      'var(--fm)',
              fontSize:        '12px',
            }}
          >
            <thead>
              <tr>
                {COLUMNS.map((col) => {
                  const isActive = sortKey === col.key;
                  const ariaSortValue: 'ascending' | 'descending' | 'none' = isActive
                    ? sortDir === 'asc'
                      ? 'ascending'
                      : 'descending'
                    : 'none';

                  return (
                    <th
                      key={col.key}
                      scope="col"
                      aria-sort={ariaSortValue}
                      style={{
                        padding:       '0',
                        borderBottom:  '1px solid var(--bdb)',
                        whiteSpace:    'nowrap',
                        textAlign:     'left',
                      }}
                    >
                      <button
                        onClick={() => handleSort(col.key)}
                        onKeyDown={(e) => handleSortKeyDown(e, col.key)}
                        aria-label={`Sort by ${col.label}${isActive ? (sortDir === 'asc' ? ', ascending' : ', descending') : ''}`}
                        style={{
                          background:    'none',
                          border:        'none',
                          cursor:        'pointer',
                          fontFamily:    'var(--fm)',
                          fontSize:      '10px',
                          fontWeight:    700,
                          color:         isActive ? 'var(--mt)' : 'var(--wm)',
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
                        {col.label}
                        {isActive && (
                          <span aria-hidden="true" style={{ fontSize: '9px' }}>
                            {sortDir === 'asc' ? '▲' : '▼'}
                          </span>
                        )}
                      </button>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {sorted.map((row) => (
                <tr
                  key={row.agent_id}
                  style={{ borderBottom: '1px solid var(--bd)' }}
                >
                  {COLUMNS.map((col) => (
                    <td
                      key={col.key}
                      style={{
                        padding:    '8px 10px',
                        color:      col.key === 'agent_id' ? 'var(--mt)' : 'var(--wd)',
                        fontWeight: col.key === 'agent_id' ? 600 : 400,
                        whiteSpace: col.key === 'agent_id' ? 'nowrap' : 'normal',
                      }}
                    >
                      {displayCell(row, col.key)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
