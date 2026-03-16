import type { Hook } from '@gander-studio/shared';
import { HOOK_BADGE_BG, HOOK_BADGE_BD, HOOK_HOVER_BD, HOOK_HOVER_SH } from '../../constants/browse';
import { useBrowseStore } from '../../store/browse-store';

interface Props {
  hook: Hook;
}

export default function HookCard({ hook }: Props) {
  const { setSelectedItem } = useBrowseStore();

  function openDrilldown() {
    setSelectedItem({ type: 'hook', name: hook.matcher });
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      openDrilldown();
    }
  }

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={`${hook.event} hook for ${hook.matcher}`}
      data-testid="hook-card"
      onClick={openDrilldown}
      onKeyDown={handleKeyDown}
      style={{
        background:   'linear-gradient(145deg, var(--sfm), var(--sf))',
        border:       '1px solid var(--bd)',
        borderRadius: 'var(--rl)',
        position:     'relative',
        overflow:     'hidden',
        cursor:       'pointer',
        transition:   'border-color 0.15s, box-shadow 0.15s, transform 0.15s',
      }}
      onMouseEnter={(e) => {
        const el = e.currentTarget;
        el.style.borderColor = HOOK_HOVER_BD;
        el.style.boxShadow   = HOOK_HOVER_SH;
        el.style.transform   = 'translateY(-1px)';
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget;
        el.style.borderColor = 'var(--bd)';
        el.style.boxShadow   = '';
        el.style.transform   = '';
      }}
      onFocus={(e) => { e.currentTarget.style.outline = '2px solid var(--mt)'; }}
      onBlur={(e)  => { e.currentTarget.style.outline = ''; }}
    >
      {/* Left accent bar — orange */}
      <div
        aria-hidden="true"
        style={{
          width:      '3px',
          position:   'absolute',
          top:        0,
          left:       0,
          height:     '100%',
          background: 'var(--mo)',
        }}
      />

      {/* Content */}
      <div style={{ padding: '12px 16px 12px 22px' }}>
        {/* Header row: event badge + matcher */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
          <span
            style={{
              fontFamily:    'var(--fm)',
              fontSize:      '9px',
              fontWeight:    700,
              textTransform: 'uppercase',
              padding:       '2px 7px',
              borderRadius:  '3px',
              background:    HOOK_BADGE_BG,
              color:         'var(--mo)',
              border:        `1px solid ${HOOK_BADGE_BD}`,
              letterSpacing: '0.08em',
              flexShrink:    0,
            }}
          >
            {hook.event}
          </span>
          <span
            style={{
              fontFamily:   'var(--fm)',
              fontSize:     '11px',
              color:        'var(--wd)',
              flex:         1,
              overflow:     'hidden',
              textOverflow: 'ellipsis',
              whiteSpace:   'nowrap',
            }}
          >
            {hook.matcher}
          </span>
        </div>

        {/* File path */}
        <div
          style={{
            fontFamily:   'var(--fm)',
            fontSize:     '10px',
            color:        'var(--wm)',
            overflow:     'hidden',
            textOverflow: 'ellipsis',
            whiteSpace:   'nowrap',
            marginBottom: '6px',
          }}
        >
          {hook.filePath}
        </div>

        {/* Body preview — 2-line clamp */}
        <p
          style={{
            color:           'var(--wd)',
            fontSize:        '12px',
            fontFamily:      'var(--fm)',
            margin:          0,
            display:         '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow:        'hidden',
          }}
        >
          {hook.body}
        </p>
      </div>
    </div>
  );
}
