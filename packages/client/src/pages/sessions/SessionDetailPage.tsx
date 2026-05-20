import { useCallback, useRef } from 'react';
import { SESSION_TABS } from '../../constants/sessions';
import { useSessionDetail } from '../../hooks/useSessions';
import { useSessionStore } from '../../store/session-store';

// ---- ErrorState -------------------------------------------------------------

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
      <div style={{ fontFamily: 'var(--fm)', fontSize: '12px', color: 'var(--wd)' }}>
        {message}
      </div>
    </div>
  );
}

// ---- LoadingState -----------------------------------------------------------

function LoadingState() {
  return (
    <div
      aria-busy="true"
      style={{ display: 'flex', flexDirection: 'column', gap: '12px', paddingTop: '16px' }}
    >
      <span className="sr-only">Loading session…</span>
      {/* Skeleton header */}
      <div
        style={{
          height:         '18px',
          width:          '45%',
          borderRadius:   '3px',
          background:     'linear-gradient(90deg, var(--sfm) 25%, var(--sfh) 50%, var(--sfm) 75%)',
          backgroundSize: '200% 100%',
          animation:      'shimmer 1.4s ease-in-out infinite',
        }}
      />
      <div
        style={{
          height:         '12px',
          width:          '20%',
          borderRadius:   '3px',
          background:     'linear-gradient(90deg, var(--sfm) 25%, var(--sfh) 50%, var(--sfm) 75%)',
          backgroundSize: '200% 100%',
          animation:      'shimmer 1.4s ease-in-out infinite',
        }}
      />
      {/* Spinner */}
      <div
        style={{
          display:        'flex',
          justifyContent: 'center',
          alignItems:     'center',
          paddingTop:     '40px',
        }}
      >
        <div
          aria-hidden="true"
          style={{
            width:        '40px',
            height:       '40px',
            borderRadius: '50%',
            border:       '3px solid var(--sfh)',
            borderTop:    '3px solid var(--mt)',
            animation:    'spin 0.8s linear infinite',
          }}
        />
      </div>
    </div>
  );
}

// ---- TabPanel stubs (t5b/t6b will replace these) ----------------------------

function OverviewTabStub() {
  return <div data-testid="overview-tab-stub" />;
}

function TableTabStub() {
  return <div data-testid="table-tab-stub" />;
}

function EditorTabStub() {
  return <div data-testid="editor-tab-stub" />;
}

// ---- SessionDetailPage ------------------------------------------------------

export default function SessionDetailPage() {
  const { selectedSessionId, activeTab, setActiveTab, setSelectedSessionId } =
    useSessionStore();

  const { session, isLoading, error } = useSessionDetail(selectedSessionId!);

  // Ref for the tablist container — used for arrow-key navigation
  const tablistRef = useRef<HTMLDivElement>(null);

  const handleTabKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLButtonElement>, currentIndex: number) => {
      const enabledTabs = SESSION_TABS.filter((t) => !t.placeholder);
      const enabledIndices = SESSION_TABS.map((t, i) =>
        t.placeholder ? -1 : i,
      ).filter((i) => i >= 0);

      if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
        e.preventDefault();
        const pos = enabledIndices.indexOf(currentIndex);
        if (pos === -1) return;
        const nextPos =
          e.key === 'ArrowRight'
            ? (pos + 1) % enabledTabs.length
            : (pos - 1 + enabledTabs.length) % enabledTabs.length;
        const nextTabIndex = enabledIndices[nextPos];
        const tabButtons = tablistRef.current?.querySelectorAll<HTMLButtonElement>(
          'button[role="tab"]:not([disabled])',
        );
        if (tabButtons) {
          tabButtons[nextPos]?.focus();
          setActiveTab(SESSION_TABS[nextTabIndex].id);
        }
      } else if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        const tab = SESSION_TABS[currentIndex];
        if (!tab.placeholder) {
          setActiveTab(tab.id);
        }
      }
    },
    [setActiveTab],
  );

  const handleBackClick = useCallback(() => {
    setSelectedSessionId(null);
  }, [setSelectedSessionId]);

  const handleBackKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLButtonElement>) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        setSelectedSessionId(null);
      }
    },
    [setSelectedSessionId],
  );

  return (
    <div data-testid="sessions-detail-page">

      {/* Back button — always visible so user can return from error states */}
      <button
        aria-label="Back to sessions list"
        onClick={handleBackClick}
        onKeyDown={handleBackKeyDown}
        style={{
          background:    'none',
          border:        'none',
          color:         'var(--wd)',
          fontFamily:    'var(--fm)',
          fontSize:      '12px',
          cursor:        'pointer',
          padding:       '0',
          marginBottom:  '10px',
          letterSpacing: '0.04em',
        }}
      >
        ← Back
      </button>

      {isLoading && <LoadingState />}

      {!isLoading && error != null && <ErrorState error={error} />}

      {!isLoading && error == null && session != null && (
        <>
          {/* Detail header */}
          <div
            style={{
              paddingBottom: '14px',
              borderBottom:  '1px solid var(--bd)',
              marginBottom:  '0',
            }}
          >
            <h1
              style={{
                fontFamily:    'var(--fh)',
                fontSize:      '17px',
                fontWeight:    500,
                color:         'var(--w)',
                margin:        '0 0 4px 0',
                letterSpacing: '0.06em',
              }}
            >
              {session.sprint}
            </h1>
            <span
              style={{
                fontFamily: 'var(--fm)',
                fontSize:   '12px',
                color:      'var(--wd)',
              }}
            >
              {session.date}
            </span>
          </div>

          {/* Tab bar */}
          <div
            ref={tablistRef}
            role="tablist"
            aria-label="Session detail tabs"
            style={{
              display:      'flex',
              borderBottom: '1px solid var(--bd)',
              height:       '40px',
            }}
          >
            {SESSION_TABS.map((tab, index) => {
              const isActive   = activeTab === tab.id;
              const isDisabled = tab.placeholder === true;

              return (
                <button
                  key={tab.id}
                  id={`${tab.id}-tab`}
                  role="tab"
                  aria-selected={isActive && !isDisabled ? true : false}
                  aria-controls={isDisabled ? undefined : `${tab.id}-panel`}
                  aria-disabled={isDisabled ? 'true' : undefined}
                  disabled={isDisabled || undefined}
                  title={isDisabled ? 'Coming in S3' : undefined}
                  tabIndex={isActive && !isDisabled ? 0 : -1}
                  onClick={
                    isDisabled
                      ? undefined
                      : () => setActiveTab(tab.id)
                  }
                  onKeyDown={(e) => handleTabKeyDown(e, index)}
                  style={{
                    background:    'none',
                    border:        'none',
                    borderBottom:  isActive && !isDisabled
                      ? '2px solid var(--mt)'
                      : '2px solid transparent',
                    padding:       '0 18px',
                    height:        '100%',
                    cursor:        isDisabled ? 'not-allowed' : 'pointer',
                    fontFamily:    'var(--fb)',
                    fontSize:      '13px',
                    fontWeight:    isActive && !isDisabled ? 600 : 400,
                    color:         isDisabled
                      ? 'var(--wm)'
                      : isActive
                        ? 'var(--mt)'
                        : 'var(--wd)',
                    opacity:       isDisabled ? 0.55 : 1,
                    letterSpacing: '0.03em',
                    transition:    'color 120ms, background 120ms',
                  }}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Tab panel */}
          <div
            role="tabpanel"
            id={`${activeTab}-panel`}
            aria-labelledby={`${activeTab}-tab`}
            style={{ paddingTop: '20px' }}
          >
            {activeTab === 'overview' && <OverviewTabStub />}
            {activeTab === 'table'    && <TableTabStub />}
            {activeTab === 'editor'   && <EditorTabStub />}
          </div>
        </>
      )}
    </div>
  );
}
