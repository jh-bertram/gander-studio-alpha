import type { Session } from '@gander-studio/shared';

interface Props {
  session: Session;
}

// ---- Stat card ---------------------------------------------------------------

interface StatCardProps {
  label: string;
  value: string | number;
}

function StatCard({ label, value }: StatCardProps) {
  return (
    <div
      style={{
        background:   'var(--sfm)',
        border:       '1px solid var(--bd)',
        borderRadius: 'var(--rl)',
        padding:      '12px 16px',
        minWidth:     '100px',
        textAlign:    'center',
      }}
    >
      <div
        style={{
          fontFamily:    'var(--fm)',
          fontSize:      '20px',
          fontWeight:    700,
          color:         'var(--mt)',
          letterSpacing: '0.04em',
          lineHeight:    1.1,
        }}
      >
        {value}
      </div>
      <div
        style={{
          fontFamily:    'var(--fm)',
          fontSize:      '9px',
          color:         'var(--wd)',
          textTransform: 'uppercase',
          letterSpacing: '0.12em',
          marginTop:     '5px',
        }}
      >
        {label}
      </div>
    </div>
  );
}

// ---- Field row ---------------------------------------------------------------

interface FieldRowProps {
  label: string;
  value: string;
}

function FieldRow({ label, value }: FieldRowProps) {
  return (
    <div
      style={{
        display:       'flex',
        gap:           '12px',
        padding:       '7px 0',
        borderBottom:  '1px solid var(--bd)',
        alignItems:    'baseline',
      }}
    >
      <dt
        style={{
          fontFamily:    'var(--fm)',
          fontSize:      '10px',
          color:         'var(--wm)',
          textTransform: 'uppercase',
          letterSpacing: '0.12em',
          minWidth:      '120px',
          flexShrink:    0,
        }}
      >
        {label}
      </dt>
      <dd
        style={{
          fontFamily: 'var(--fm)',
          fontSize:   '12px',
          color:      'var(--wd)',
          margin:     0,
          wordBreak:  'break-all',
        }}
      >
        {value}
      </dd>
    </div>
  );
}

// ---- OverviewTab -------------------------------------------------------------

export default function OverviewTab({ session }: Props) {
  const totalFeedbackLoops = session.agents.reduce(
    (sum, a) => sum + a.feedback_loops,
    0,
  );

  const gapClassesDisplay =
    session.gap_classes.length > 0 ? session.gap_classes.join(', ') : '—';

  return (
    <div data-testid="overview-tab">

      {/* Top-line stat row */}
      <div
        role="group"
        aria-label="Session statistics"
        style={{
          display:       'flex',
          gap:           '10px',
          flexWrap:      'wrap',
          marginBottom:  '24px',
        }}
      >
        <StatCard label="Agents" value={session.agents.length} />
        <StatCard label="Feedback Loops" value={totalFeedbackLoops} />
        <StatCard label="Events" value={session.events.length} />
        <StatCard label="Status" value={session.status ?? '—'} />
      </div>

      {/* Frontmatter fields */}
      <dl style={{ margin: 0 }}>
        <FieldRow label="Sprint"           value={session.sprint} />
        <FieldRow label="Date"             value={session.date} />
        <FieldRow label="Status"           value={session.status ?? '—'} />
        <FieldRow label="Type"             value={session.type ?? '—'} />
        <FieldRow label="Title"            value={session.title ?? '—'} />
        <FieldRow label="Gap Classes"      value={gapClassesDisplay} />
        <FieldRow label="Source Root"      value={session.source_root} />
        <FieldRow label="Edited File Path" value={session.editedFilePath ?? 'None'} />
      </dl>
    </div>
  );
}
