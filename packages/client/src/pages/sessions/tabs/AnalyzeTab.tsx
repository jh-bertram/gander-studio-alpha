/**
 * AnalyzeTab — top-level analysis surface for a session.
 *
 * Wires: SessionPicker, AgentTimeline, AgentStatPanel (panel view), AgentStatTable (table view).
 * Data: trpc.session.getStats.useQuery({ id: session.id }) for stats.
 *       session.events passed directly to AgentTimeline (from parent prop).
 * Store: analyzeStore — reads selectedAgentIds, selectedMetrics; calls resetToSession on mount.
 *
 * FF7 tokens only — no Shadcn ui/* primitives.
 * Loading/error state mirrors SessionDetailPage.tsx lines 51-102 pattern.
 */
import { useEffect, useState } from 'react';
import type { Session } from '@gander-studio/shared';
import { trpc } from '../../../trpc';
import { useAnalyzeStore } from '../../../store/analyzeStore';
import SessionPicker from '../../../components/sessions/SessionPicker';
import AgentTimeline from '../../../components/sessions/AgentTimeline';
import AgentStatPanel from '../../../components/sessions/AgentStatPanel';
import AgentStatTable from '../../../components/sessions/AgentStatTable';

// ---- Types ------------------------------------------------------------------

interface AnalyzeTabProps {
  session: Session;
}

type ViewMode = 'panel' | 'table';

// ---- Loading affordance (mirrors SessionDetailPage.tsx lines 51-102) ---------

function AnalyzeLoadingState(): React.JSX.Element {
  return (
    <div
      aria-busy="true"
      data-testid="analyze-loading"
      style={{ display: 'flex', flexDirection: 'column', gap: '12px', paddingTop: '16px' }}
    >
      <span className="sr-only">Loading analysis data…</span>
      <div
        style={{
          height:         '18px',
          width:          '40%',
          borderRadius:   '3px',
          background:     'linear-gradient(90deg, var(--sfm) 25%, var(--sfh) 50%, var(--sfm) 75%)',
          backgroundSize: '200% 100%',
          animation:      'shimmer 1.4s ease-in-out infinite',
        }}
      />
      <div
        style={{
          height:         '12px',
          width:          '25%',
          borderRadius:   '3px',
          background:     'linear-gradient(90deg, var(--sfm) 25%, var(--sfh) 50%, var(--sfm) 75%)',
          backgroundSize: '200% 100%',
          animation:      'shimmer 1.4s ease-in-out infinite',
        }}
      />
    </div>
  );
}

// ---- Error affordance (mirrors SessionDetailPage.tsx lines 9-47) -------------

function AnalyzeErrorState({ error }: { error: unknown }): React.JSX.Element {
  const message =
    error instanceof Error
      ? error.message
      : typeof error === 'string'
        ? error
        : 'Failed to load analysis data.';

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

// ---- AnalyzeTab -------------------------------------------------------------

export default function AnalyzeTab({ session }: AnalyzeTabProps): React.JSX.Element {
  const [viewMode, setViewMode] = useState<ViewMode>('panel');

  // Initialize / reset picker state whenever session changes
  const resetToSession = useAnalyzeStore((s) => s.resetToSession);
  const selectedAgentIds = useAnalyzeStore((s) => s.selectedAgentIds);
  const selectedMetrics = useAnalyzeStore((s) => s.selectedMetrics);

  useEffect(() => {
    resetToSession(session);
  }, [session, resetToSession]);

  // Fetch aggregated stats (needed by SessionPicker and AgentStatPanel/Table)
  const { data: stats, isLoading, error } = trpc.session.getStats.useQuery(
    { id: session.id },
  );

  // Derive filtered activities for the stat surfaces (only selected agents)
  const filteredActivities = (stats?.agents ?? []).filter((a) =>
    selectedAgentIds.includes(a.agent_id),
  );

  return (
    <div
      data-testid="analyze-tab"
      aria-busy={isLoading ? 'true' : undefined}
      style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
    >
      {isLoading && <AnalyzeLoadingState />}

      {!isLoading && error != null && <AnalyzeErrorState error={error} />}

      {!isLoading && error == null && stats != null && (
        <>
          {/* Two-column layout at md+, stacked at sm */}
          <div
            style={{
              display:             'grid',
              gridTemplateColumns: 'minmax(200px, 260px) 1fr',
              gap:                 '16px',
              alignItems:          'start',
            }}
          >
            {/* Left: SessionPicker */}
            <SessionPicker stats={stats} />

            {/* Right: Timeline + stat surface */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', minWidth: 0 }}>
              {/* View toggle */}
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <span
                  style={{
                    fontFamily:    'var(--fb)',
                    fontSize:      '10px',
                    color:         'var(--wm)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.12em',
                  }}
                >
                  View:
                </span>
                {(['panel', 'table'] as ViewMode[]).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    aria-pressed={viewMode === mode}
                    onClick={() => setViewMode(mode)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setViewMode(mode);
                      }
                    }}
                    style={{
                      padding:    '3px 10px',
                      fontFamily: 'var(--fb)',
                      fontSize:   '11px',
                      color:      viewMode === mode ? 'var(--mt)' : 'var(--wd)',
                      background: 'var(--sfh)',
                      border:     `1px solid ${viewMode === mode ? 'var(--bdb)' : 'var(--bd)'}`,
                      borderRadius: 'var(--r)',
                      cursor:     'pointer',
                      fontWeight: viewMode === mode ? 600 : 400,
                    }}
                  >
                    {mode === 'panel' ? 'Panel' : 'Table'}
                  </button>
                ))}
              </div>

              {/* AgentTimeline */}
              <AgentTimeline
                events={session.events}
                selectedAgentIds={selectedAgentIds}
              />

              {/* Stat surface — panel or table */}
              {viewMode === 'panel' ? (
                <div
                  data-testid="analyze-stat-grid"
                  style={{
                    display:             'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
                    gap:                 '12px',
                  }}
                >
                  {filteredActivities.map((activity) => (
                    <AgentStatPanel
                      key={activity.agent_id}
                      activity={activity}
                      metrics={selectedMetrics}
                    />
                  ))}
                  {filteredActivities.length === 0 && (
                    <div
                      style={{
                        fontFamily: 'var(--fm)',
                        fontSize:   '12px',
                        color:      'var(--wd)',
                        padding:    '24px',
                        textAlign:  'center',
                      }}
                    >
                      No agents selected
                    </div>
                  )}
                </div>
              ) : (
                <AgentStatTable
                  activities={filteredActivities}
                  metrics={selectedMetrics}
                />
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
