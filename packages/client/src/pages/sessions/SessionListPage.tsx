import type { Session } from '@gander-studio/shared';
import { useSessions } from '../../hooks/useSessions';
import { useSessionStore } from '../../store/session-store';

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
                      height:     '14px',
                      borderRadius: '3px',
                      background:  'linear-gradient(90deg, var(--sfm) 25%, var(--sfh) 50%, var(--sfm) 75%)',
                      backgroundSize: '200% 100%',
                      animation:   'shimmer 1.4s ease-in-out infinite',
                      width:       j === 0 ? '70%' : '50%',
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
  onSelect,
}: {
  session: Session;
  onSelect: () => void;
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
        row.style.background   = 'var(--sfh)';
        row.style.borderLeft   = '3px solid var(--mt)';
        row.style.paddingLeft  = '0';
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
      <td style={TD_PRIMARY_STYLE}>{session.sprint}</td>
      <td style={TD_STYLE}>{session.date}</td>
      <td style={TD_STYLE}>{statusText}</td>
      <td style={TD_STYLE}>{gapText}</td>
    </tr>
  );
}

// ---- SessionListPage ----------------------------------------------------

export default function SessionListPage() {
  const { sessions, isLoading, error } = useSessions();
  const setSelectedSessionId = useSessionStore(
    (s) => s.setSelectedSessionId,
  );

  return (
    <div data-testid="sessions-list-page">
      <PageTitle>Sessions</PageTitle>

      {isLoading && <LoadingState />}

      {!isLoading && error != null && <ErrorState error={error} />}

      {!isLoading && error == null && sessions.length === 0 && <EmptyState />}

      {!isLoading && error == null && sessions.length > 0 && (
        <table
          aria-label="Sessions list"
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
            {sessions.map((session) => (
              <SessionRow
                key={session.id}
                session={session}
                onSelect={() => setSelectedSessionId(session.id)}
              />
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
