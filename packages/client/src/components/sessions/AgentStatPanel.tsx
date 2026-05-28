import type { ReactElement } from 'react';
import type { AgentActivity } from '@gander-studio/shared';

// ---- Types -------------------------------------------------------------------

type MetricKey = 'spawns' | 'feedback_loops' | 'wall_clock_ms';

interface Props {
  activity: AgentActivity;
  metrics: MetricKey[];
  className?: string;
}

// ---- Helpers -----------------------------------------------------------------

const METRIC_LABEL: Record<MetricKey, string> = {
  spawns:         'Spawns',
  feedback_loops: 'Feedback Loops',
  wall_clock_ms:  'Wall Clock',
};

function formatWallClock(ms: number | undefined): string {
  if (ms === undefined) return '—'; // em dash
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

function getMetricValue(activity: AgentActivity, key: MetricKey): string {
  if (key === 'wall_clock_ms') return formatWallClock(activity.wall_clock_ms);
  return String(activity[key]);
}

// ---- Component ---------------------------------------------------------------

export default function AgentStatPanel({ activity, metrics, className }: Props): ReactElement {
  const { agent_id, completes, spawns, critique_passes, critique_blocks, audit_passes, audit_fails } = activity;

  return (
    <article
      role="article"
      aria-label={`${agent_id} statistics`}
      className={className}
      style={{
        position:       'relative',
        background:     'linear-gradient(145deg, var(--sfm), var(--sf))',
        border:         '1px solid var(--bd)',
        borderRadius:   'var(--rl)',
        overflow:       'hidden',
        padding:        '14px 18px',
        display:        'flex',
        flexDirection:  'column',
        gap:            '0',
        transition:     'border-color 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease',
      }}
      onMouseEnter={(e) => {
        const el = e.currentTarget as HTMLElement;
        el.style.borderColor = 'var(--bdb)';
        el.style.boxShadow = 'var(--gt)';
        el.style.transform = 'translateY(-2px)';
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget as HTMLElement;
        el.style.borderColor = 'var(--bd)';
        el.style.boxShadow = 'none';
        el.style.transform = 'translateY(0)';
      }}
    >
      {/* Top accent bar */}
      <div
        aria-hidden="true"
        style={{
          position:   'absolute',
          top:        0,
          left:       0,
          right:      0,
          height:     '2px',
          background: 'linear-gradient(90deg, var(--mt), transparent)',
        }}
      />

      {/* Card header */}
      <div
        style={{
          display:        'flex',
          justifyContent: 'space-between',
          alignItems:     'baseline',
          paddingBottom:  '10px',
          borderBottom:   '1px solid var(--bd)',
          marginBottom:   '12px',
        }}
      >
        <span
          style={{
            fontFamily: 'var(--fm)',
            fontSize:   '13px',
            fontWeight: 600,
            color:      'var(--mt)',
          }}
        >
          {agent_id}
        </span>
        <span
          aria-label={`Completes: ${completes}, Spawns: ${spawns}`}
          style={{
            fontFamily: 'var(--fm)',
            fontSize:   '10px',
            color:      'var(--wm)',
          }}
        >
          C:{completes} / S:{spawns}
        </span>
      </div>

      {/* Primary metrics */}
      {metrics.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '12px' }}>
          {metrics.map((key) => (
            <div key={key} style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <span
                style={{
                  fontFamily:    'var(--fm)',
                  fontSize:      '10px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.14em',
                  color:         'var(--wm)',
                }}
              >
                {METRIC_LABEL[key]}
              </span>
              <span
                aria-label={`${METRIC_LABEL[key]}: ${getMetricValue(activity, key)}`}
                style={{
                  fontFamily: 'var(--fh)',
                  fontSize:   '24px',
                  fontWeight: 500,
                  color:      'var(--mt)',
                  lineHeight: '1',
                }}
              >
                {getMetricValue(activity, key)}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Audit attribution */}
      <div
        role="group"
        aria-label={`Audit attribution for ${agent_id}`}
        style={{
          borderTop:  '1px solid var(--bd)',
          paddingTop: '8px',
          display:    'grid',
          gridTemplateColumns: '1fr 1fr',
          gap:        '8px 16px',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          <span style={{ fontFamily: 'var(--fm)', fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--wm)' }}>
            Critique ✓
          </span>
          <span style={{ fontFamily: 'var(--fm)', fontSize: '14px', fontWeight: 700, color: 'var(--mg)' }}>
            {critique_passes}
          </span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          <span style={{ fontFamily: 'var(--fm)', fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--wm)' }}>
            Critique ✗
          </span>
          <span style={{ fontFamily: 'var(--fm)', fontSize: '14px', fontWeight: 700, color: 'var(--redb)' }}>
            {critique_blocks}
          </span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          <span style={{ fontFamily: 'var(--fm)', fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--wm)' }}>
            Audit ✓
          </span>
          <span
            data-testid="audit-pass-value"
            style={{ fontFamily: 'var(--fm)', fontSize: '14px', fontWeight: 700, color: 'var(--mg)' }}
          >
            {audit_passes}
          </span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          <span style={{ fontFamily: 'var(--fm)', fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--wm)' }}>
            Audit ✗
          </span>
          <span style={{ fontFamily: 'var(--fm)', fontSize: '14px', fontWeight: 700, color: 'var(--redb)' }}>
            {audit_fails}
          </span>
        </div>
      </div>
    </article>
  );
}
