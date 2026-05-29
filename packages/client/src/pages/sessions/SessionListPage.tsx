import { useEffect, useRef } from 'react';
import type { Session } from '@gander-studio/shared';
import { useSessions } from '../../hooks/useSessions';
import { useAggregateStats } from '../../hooks/useAggregateStats';
import { useSessionStore } from '../../store/session-store';
import AgentStatPanel from '../../components/sessions/AgentStatPanel';
import AgentStatTable from '../../components/sessions/AgentStatTable';
import { groupAgentsByBaseCode } from '../../utils/group-agents';

// ---- Local constants ---------------------------------------------------------

type MetricKey = 'spawns' | 'feedback_loops' | 'wall_clock_ms';

// Default metrics shown in the overview aggregate panel (no analyzeStore import)
const OVERVIEW_METRICS: MetricKey[] = ['spawns', 'feedback_loops'];

// ---- Helpers ----------------------------------------------------------------

function formatWallClock(ms: number | undefined): string {
  if (ms === undefined) return '—';
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

// ---- PageTitle component ------------------------------------------------

function PageTitle({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        fontFamily:    'var(--fh)',
        fontSize:      '17px',
        fontWeight:    500,
        letterSpacing: '0.1em',
        marginBottom:  '18px',
        paddingBottom: '9px',
        borderBottom:  '1px solid var(--bd)',
        display:       'flex',
        alignItems:    'center',
        gap:           '10px',
      }}
    >
      <span
        aria-hidden="true"
        style={{
          width:        '3px',
          height:       '18px',
          background:   'var(--mt)',
          boxShadow:    'var(--gt)',
          borderRadius: '2px',
          display:      'inline-block',
          flexShrink:   0,
        }}
      />
      {children}
    </div>
  );
}

// ---- Loading state -------------------------------------------------------

function LoadingState() {
  const SKELETON_ROWS = 5;
  return (
    <div aria-busy="true">
      <span className="sr-only">Loading sessions…</span>
      <table
        style={{
          width:          '100%',
          borderCollapse: 'collapse',
        }}
      >
        <thead>
          <tr>
            <SessionTh style={{ width: '40%' }}>Sprint</SessionTh>
            <SessionTh style={{ width: '15%' }}>Date</SessionTh>
            <SessionTh style={{ width: '15%' }}>Status</SessionTh>
            <SessionTh style={{ width: '30%' }}>Gap Classes</SessionTh>
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: SKELETON_ROWS }).map((_, i) => (
            <tr key={i} style={{ borderBottom: '1px solid var(--bd)' }}>
              {Array.from({ length: 4 }).map((__, j) => (
                <td key={j} style={{ padding: '10px 14px' }}>
                  <div
                    style={{
                      height:         '14px',
                      borderRadius:   '3px',
                      background:     'linear-gradient(90deg, var(--sfm) 25%, var(--sfh) 50%, var(--sfm) 75%)',
                      backgroundSize: '200% 100%',
                      animation:      'shimmer 1.4s ease-in-out infinite',
                      width:          j === 0 ? '70%' : '50%',
                    }}
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ---- ErrorState ---------------------------------------------------------

function ErrorState({ error }: { error: unknown }) {
  const message =
    error instanceof Error
      ? error.message
      : typeof error === 'string'
        ? error
        : 'An unexpected error occurred.';

  return (
    <div
      role="alert"
      style={{
        borderLeft:   '3px solid var(--redb)',
        background:   'var(--sfm)',
        borderRadius: 'var(--rl)',
        padding:      '14px 18px',
      }}
    >
      <div
        style={{
          fontFamily:    'var(--fm)',
          fontSize:      '10px',
          color:         'var(--redb)',
          textTransform: 'uppercase',
          letterSpacing: '0.12em',
          fontWeight:    700,
          marginBottom:  '6px',
        }}
      >
        LOAD ERROR
      </div>
      <div
        style={{
          fontFamily: 'var(--fm)',
          fontSize:   '12px',
          color:      'var(--wd)',
        }}
      >
        {message}
      </div>
    </div>
  );
}

// ---- EmptyState ---------------------------------------------------------

function EmptyState() {
  return (
    <div
      aria-live="polite"
      style={{
        display:        'flex',
        flexDirection:  'column',
        alignItems:     'center',
        justifyContent: 'center',
        padding:        '60px 20px',
        gap:            '16px',
      }}
    >
      <div
        aria-hidden="true"
        style={{
          width:        '40px',
          height:       '40px',
          borderRadius: '50%',
          background:   'var(--mt)',
          animation:    'pulse-opacity 1.5s ease-in-out infinite',
        }}
      />
      <div
        style={{
          fontFamily:    'var(--fh)',
          fontSize:      '16px',
          letterSpacing: '0.06em',
          color:         'var(--wd)',
        }}
      >
        No sessions found
      </div>
    </div>
  );
}

// ---- SessionTh helper ---------------------------------------------------

function SessionTh({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: React.CSSProperties;
}) {
  return (
    <th
      style={{
        padding:       '10px 14px',
        textAlign:     'left',
        fontFamily:    'var(--fm)',
        fontSize:      '10px',
        fontWeight:    700,
        letterSpacing: '0.1em',
        textTransform: 'uppercase',
        color:         'var(--wm)',
        borderBottom:  '1px solid var(--bdb)',
        ...style,
      }}
    >
      {children}
    </th>
  );
}

// ---- SessionRow ---------------------------------------------------------

const TD_STYLE: React.CSSProperties = {
  padding:    '10px 14px',
  fontFamily: 'var(--fm)',
  fontSize:   '12px',
  color:      'var(--wd)',
};

const TD_PRIMARY_STYLE: React.CSSProperties = {
  ...TD_STYLE,
  color:      'var(--w)',
  fontWeight: 500,
};

function handleRowKeyDown(
  e: React.KeyboardEvent<HTMLTableRowElement>,
  onSelect: () => void,
): void {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault();
    onSelect();
  }
}

function SessionRow({
  session,
  isChecked,
  onSelect,
  onToggleCheck,
}: {
  session:       Session;
  isChecked:     boolean;
  onSelect:      () => void;
  onToggleCheck: (e: React.MouseEvent | React.KeyboardEvent) => void;
}) {
  const gapText =
    session.gap_classes.length > 0 ? session.gap_classes.join(', ') : '—';
  const statusText = session.status ?? '—';

  return (
    <tr
      tabIndex={0}
      role="row"
      aria-label={`${session.sprint} — ${session.date}`}
      onClick={onSelect}
      onKeyDown={(e) => handleRowKeyDown(e, onSelect)}
      style={{
        borderBottom: '1px solid var(--bd)',
        cursor:       'pointer',
      }}
      onMouseEnter={(e) => {
        const row = e.currentTarget;
        row.style.background  = 'var(--sfh)';
        row.style.borderLeft  = '3px solid var(--mt)';
        row.style.paddingLeft = '0';
      }}
      onMouseLeave={(e) => {
        const row = e.currentTarget;
        row.style.background  = '';
        row.style.borderLeft  = '';
        row.style.paddingLeft = '';
      }}
      onFocus={(e) => {
        const row = e.currentTarget;
        row.style.background  = 'var(--sfh)';
        row.style.borderLeft  = '3px solid var(--mt)';
        row.style.paddingLeft = '0';
      }}
      onBlur={(e) => {
        const row = e.currentTarget;
        row.style.background  = '';
        row.style.borderLeft  = '';
        row.style.paddingLeft = '';
      }}
    >
      {/* Checkbox cell — stopPropagation on BOTH click and keydown so toggling
          selection does not trigger row→detail navigation */}
      <td
        style={{ padding: '10px 14px', width: '40px' }}
        onClick={(e) => { e.stopPropagation(); }}
        onKeyDown={(e) => { e.stopPropagation(); }}
      >
        <input
          type="checkbox"
          checked={isChecked}
          aria-label={`Toggle selection for ${session.sprint}`}
          onChange={() => {/* handled by onClick below */}}
          onClick={(e) => {
            e.stopPropagation();
            onToggleCheck(e);
          }}
          onKeyDown={(e) => {
            e.stopPropagation();
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onToggleCheck(e);
            }
          }}
          data-testid={`session-checkbox-${session.id}`}
          style={{
            accentColor: 'var(--mt)',
            cursor:      'pointer',
          }}
        />
      </td>
      <td style={TD_PRIMARY_STYLE}>{session.sprint}</td>
      <td style={TD_STYLE}>{session.date}</td>
      <td style={TD_STYLE}>{statusText}</td>
      <td style={TD_STYLE}>{gapText}</td>
    </tr>
  );
}

// ---- AggregatePanel ---------------------------------------------------------

function AggregatePanel({ selectedSessionIds }: { selectedSessionIds: string[] }) {
  const { stats, isLoading, error } = useAggregateStats(selectedSessionIds);

  if (selectedSessionIds.length === 0) {
    return (
      <div
        data-testid="aggregate-no-sessions"
        style={{
          fontFamily: 'var(--fm)',
          fontSize:   '12px',
          color:      'var(--wm)',
          padding:    '20px',
          textAlign:  'center',
          border:     '1px solid var(--bd)',
          borderRadius: 'var(--rl)',
          background: 'var(--sfm)',
        }}
      >
        No sessions selected
      </div>
    );
  }

  if (isLoading) {
    return (
      <div
        aria-busy="true"
        data-testid="aggregate-loading"
        style={{
          height:         '14px',
          borderRadius:   '3px',
          background:     'linear-gradient(90deg, var(--sfm) 25%, var(--sfh) 50%, var(--sfm) 75%)',
          backgroundSize: '200% 100%',
          animation:      'shimmer 1.4s ease-in-out infinite',
          width:          '60%',
          margin:         '12px 0',
        }}
      >
        <span className="sr-only">Loading aggregate stats…</span>
      </div>
    );
  }

  if (error != null) {
    return <ErrorState error={error} />;
  }

  if (stats == null) return null;

  // Group agent iterations (e.g. AR#0, AR#1, AR#2) into single base-code entries ("AR")
  // for display in the overview panel. Server data and per-session detail views are untouched.
  const groupedAgents = groupAgentsByBaseCode(stats.agents);

  return (
    <div
      data-testid="aggregate-stats-panel"
      style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
    >
      {/* Sibling summary: session-level wall_clock_ms (NOT per-agent) */}
      <div
        role="status"
        data-testid="aggregate-wall-clock"
        style={{
          fontFamily: 'var(--fm)',
          fontSize:   '12px',
          color:      'var(--wm)',
        }}
      >
        Total wall clock (sum of sessions):{' '}
        <span style={{ color: 'var(--mt)', fontWeight: 600 }}>
          {formatWallClock(stats.wall_clock_ms)}
        </span>
      </div>

      {/* Per-agent panels grid — grouped by base code */}
      {groupedAgents.length > 0 && (
        <div
          style={{
            display:             'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
            gap:                 '12px',
          }}
        >
          {groupedAgents.map((activity) => (
            <AgentStatPanel
              key={activity.agent_id}
              activity={activity}
              metrics={OVERVIEW_METRICS}
            />
          ))}
        </div>
      )}

      {/* Agent stat table — grouped by base code */}
      <AgentStatTable
        activities={groupedAgents}
        metrics={OVERVIEW_METRICS}
      />
    </div>
  );
}

// ---- SessionListPage ----------------------------------------------------

export default function SessionListPage() {
  const { sessions, isLoading, error } = useSessions();

  // Use individual selectors to avoid object-reference churn that causes
  // infinite re-renders in Zustand when a selector returns a new object.
  const setSelectedSessionId    = useSessionStore((s) => s.setSelectedSessionId);
  const selectedSessionIds      = useSessionStore((s) => s.selectedSessionIds);
  const toggleSelectedSessionId = useSessionStore((s) => s.toggleSelectedSessionId);
  const selectAllSessions       = useSessionStore((s) => s.selectAllSessions);
  const clearAllSessions        = useSessionStore((s) => s.clearAllSessions);

  // Track whether the initial default-selection has been applied.
  // Prevents re-applying "all selected" when the user explicitly clears to [].
  const initializedRef = useRef(false);

  // Default: select all sessions on first load (once only)
  useEffect(() => {
    if (!isLoading && sessions.length > 0 && !initializedRef.current) {
      initializedRef.current = true;
      selectAllSessions(sessions.map((s) => s.id));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading, sessions.length]);

  const totalCount    = sessions.length;
  const selectedCount = selectedSessionIds.length;
  const allSelected   = selectedCount === totalCount && totalCount > 0;
  const noneSelected  = selectedCount === 0;

  return (
    <div data-testid="sessions-list-page">
      <PageTitle>Sessions</PageTitle>

      {isLoading && <LoadingState />}

      {!isLoading && error != null && <ErrorState error={error} />}

      {!isLoading && error == null && sessions.length === 0 && <EmptyState />}

      {!isLoading && error == null && sessions.length > 0 && (
        <>
          {/* ── Selection strip ─────────────────────────────────── */}
          <div
            data-testid="session-selection-strip"
            role="group"
            aria-label="Session selection"
            style={{
              display:      'flex',
              alignItems:   'center',
              gap:          '10px',
              marginBottom: '12px',
              padding:      '8px 12px',
              background:   'var(--sfm)',
              border:       '1px solid var(--bd)',
              borderRadius: 'var(--rl)',
            }}
          >
            <button
              type="button"
              aria-label="Select all sessions"
              aria-pressed={allSelected}
              data-testid="select-all-sessions"
              onClick={() => selectAllSessions(sessions.map((s) => s.id))}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  selectAllSessions(sessions.map((s) => s.id));
                }
              }}
              style={{
                padding:      '4px 10px',
                fontSize:     '11px',
                fontFamily:   'var(--fb)',
                color:        allSelected ? 'var(--mt)' : 'var(--wd)',
                background:   'var(--sfh)',
                border:       `1px solid ${allSelected ? 'var(--bdb)' : 'var(--bd)'}`,
                borderRadius: 'var(--r)',
                cursor:       'pointer',
                fontWeight:   allSelected ? 600 : 400,
                outline:      'none',
              }}
            >
              All
            </button>
            <button
              type="button"
              aria-label="Deselect all sessions"
              aria-pressed={noneSelected}
              data-testid="select-none-sessions"
              onClick={() => clearAllSessions()}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  clearAllSessions();
                }
              }}
              style={{
                padding:      '4px 10px',
                fontSize:     '11px',
                fontFamily:   'var(--fb)',
                color:        noneSelected ? 'var(--mt)' : 'var(--wd)',
                background:   'var(--sfh)',
                border:       `1px solid ${noneSelected ? 'var(--bdb)' : 'var(--bd)'}`,
                borderRadius: 'var(--r)',
                cursor:       'pointer',
                fontWeight:   noneSelected ? 600 : 400,
                outline:      'none',
              }}
            >
              None
            </button>
            <span
              aria-live="polite"
              style={{
                fontFamily: 'var(--fm)',
                fontSize:   '11px',
                color:      'var(--wm)',
              }}
            >
              {selectedCount} of {totalCount} sessions selected
            </span>
          </div>

          {/* ── Aggregate stats panel ───────────────────────────── */}
          <div
            style={{
              marginBottom: '24px',
              padding:      '14px 18px',
              background:   'var(--sfm)',
              border:       '1px solid var(--bd)',
              borderRadius: 'var(--rl)',
            }}
          >
            <div
              style={{
                fontFamily:    'var(--fm)',
                fontSize:      '10px',
                fontWeight:    700,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color:         'var(--wm)',
                marginBottom:  '12px',
              }}
            >
              Aggregate Stats
            </div>
            <AggregatePanel selectedSessionIds={selectedSessionIds} />
          </div>

          {/* ── Session table ───────────────────────────────────── */}
          <table
            aria-label="Sessions list"
            style={{
              width:          '100%',
              borderCollapse: 'collapse',
            }}
          >
            <thead>
              <tr>
                <SessionTh style={{ width: '40px' }}><span className="sr-only">Select</span></SessionTh>
                <SessionTh style={{ width: '38%' }}>Sprint</SessionTh>
                <SessionTh style={{ width: '15%' }}>Date</SessionTh>
                <SessionTh style={{ width: '15%' }}>Status</SessionTh>
                <SessionTh style={{ width: '30%' }}>Gap Classes</SessionTh>
              </tr>
            </thead>
            <tbody>
              {sessions.map((session) => (
                <SessionRow
                  key={session.id}
                  session={session}
                  isChecked={selectedSessionIds.includes(session.id)}
                  onSelect={() => setSelectedSessionId(session.id)}
                  onToggleCheck={() => toggleSelectedSessionId(session.id)}
                />
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
}
