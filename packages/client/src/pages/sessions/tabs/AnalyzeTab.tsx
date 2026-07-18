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
import ErrorState from '../../../components/ui/error-state';
import ShimmerBox from '../../../components/ui/shimmer-box';

// ---- Types ------------------------------------------------------------------

interface AnalyzeTabProps {
  session: Session;
}

type ViewMode = 'panel' | 'table';

// ---- Constants --------------------------------------------------------------

// Inlined locally — t4 owns src/constants/sessions.ts; no cross-packet file conflict.
const ANALYZE_PANEL_METRICS_FIXED_NOTE = 'Metrics are role-fixed in card view';

// ---- Loading affordance -----------------------------------------------------

function AnalyzeLoadingState(): React.JSX.Element {
  return (
    <div
      aria-busy="true"
      data-testid="analyze-loading"
      style={{ display: 'flex', flexDirection: 'column', gap: '12px', paddingTop: '16px' }}
    >
      <span className="sr-only">Loading analysis data…</span>
      <ShimmerBox style={{ height: '18px', width: '40%', borderRadius: '3px' }} />
      <ShimmerBox style={{ height: '12px', width: '25%', borderRadius: '3px' }} />
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

      {!isLoading && error != null && (
        // MERGE SC6: AnalyzeTab uses 'Failed to load analysis data.' (cold-path copy differs from
        // the other 3 ErrorState sites' default 'An unexpected error occurred.').
        <ErrorState error={error} fallbackMessage="Failed to load analysis data." />
      )}

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
            {/* Left: SessionPicker — metric picker hidden in panel view (role-fixed) */}
            <SessionPicker stats={stats} hideMetricPicker={viewMode === 'panel'} />

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
                {/* Annotation: shown in panel view (table view shows the metric picker instead) */}
                {viewMode === 'panel' && (
                  <span
                    data-testid="analyze-panel-metrics-note"
                    style={{
                      fontFamily: 'var(--fb)',
                      fontSize:   '11px',
                      fontStyle:  'italic',
                      color:      'var(--wm)',
                    }}
                  >
                    {ANALYZE_PANEL_METRICS_FIXED_NOTE}
                  </span>
                )}
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
