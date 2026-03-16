import { useRef } from 'react';
import type { Agent } from '@gander-studio/shared';
import { AGENT_MATERIA, DEFAULT_MATERIA, MODEL_BADGE_BG, MODEL_TAG_BG, MODEL_TAG_BD, OPTIONAL_TAG_BG, OPTIONAL_TAG_BD, CARD_HOVER_SH } from '../../constants/browse';
import { useBrowseStore } from '../../store/browse-store';

interface Props {
  agent: Agent;
}

export default function AgentCard({ agent }: Props) {
  const { setSelectedItem } = useBrowseStore();
  const ref = useRef<HTMLDivElement>(null);

  const materia = AGENT_MATERIA[agent.name] ?? DEFAULT_MATERIA;
  const borderStyle = agent.tier === 'optional' ? 'dashed' : 'solid';

  function openDrilldown() {
    setSelectedItem({ type: 'agent', name: agent.name });
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      openDrilldown();
    }
  }

  function handleMouseEnter(e: React.MouseEvent<HTMLDivElement>) {
    const el = e.currentTarget;
    el.style.borderColor = 'var(--bdb)';
    el.style.transform   = 'translateY(-2px)';
    el.style.boxShadow   = CARD_HOVER_SH;
  }

  function handleMouseLeave(e: React.MouseEvent<HTMLDivElement>) {
    const el = e.currentTarget;
    el.style.borderColor = 'var(--bd)';
    el.style.transform   = '';
    el.style.boxShadow   = '';
  }

  return (
    <div
      ref={ref}
      role="button"
      tabIndex={0}
      aria-label={`${agent.name} — ${agent.tier} agent`}
      data-testid="agent-card"
      onClick={openDrilldown}
      onKeyDown={handleKeyDown}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        background:   'linear-gradient(145deg, var(--sfm), var(--sf))',
        border:       `1px ${borderStyle} var(--bd)`,
        borderRadius: 'var(--rl)',
        cursor:       'pointer',
        transition:   'border-color 0.15s, transform 0.15s, box-shadow 0.15s',
      }}
      onFocus={(e) => { e.currentTarget.style.outline = '2px solid var(--mt)'; }}
      onBlur={(e)  => { e.currentTarget.style.outline = ''; }}
    >
      {/* Card header */}
      <div
        style={{
          display:      'flex',
          alignItems:   'center',
          gap:          '10px',
          padding:      '12px 16px',
          borderBottom: '1px solid var(--bd)',
        }}
      >
        {/* MateriaDot */}
        <div
          aria-hidden="true"
          style={{
            width:        '28px',
            height:       '28px',
            borderRadius: '50%',
            background:   materia.color,
            display:      'flex',
            alignItems:   'center',
            justifyContent: 'center',
            fontFamily:   'var(--fm)',
            fontSize:     '10px',
            fontWeight:   700,
            color:        'var(--void)',
            flexShrink:   0,
          }}
        >
          {materia.code}
        </div>

        {/* Agent name */}
        <span
          style={{
            fontFamily:    'var(--fh)',
            fontSize:      '14px',
            fontWeight:    500,
            letterSpacing: '0.06em',
            color:         'var(--w)',
            flex:          1,
            overflow:      'hidden',
            textOverflow:  'ellipsis',
            whiteSpace:    'nowrap',
          }}
        >
          {agent.name}
        </span>

        {/* ModelBadge */}
        <span
          style={{
            fontFamily:   'var(--fm)',
            fontSize:     '10px',
            color:        'var(--wm)',
            background:   MODEL_BADGE_BG,
            padding:      '2px 6px',
            borderRadius: '3px',
            flexShrink:   0,
          }}
        >
          {agent.model}
        </span>
      </div>

      {/* Card body */}
      <div style={{ padding: '12px 16px' }}>
        {/* Description — 3-line clamp */}
        <p
          style={{
            color:             'var(--wd)',
            fontSize:          '12px',
            margin:            '0 0 8px 0',
            display:           '-webkit-box',
            WebkitLineClamp:   3,
            WebkitBoxOrient:   'vertical',
            overflow:          'hidden',
          }}
        >
          {agent.description}
        </p>

        {/* Tag row */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {/* Model tag */}
          <span
            style={{
              fontSize:     '10px',
              letterSpacing: '0.08em',
              padding:      '2px 7px',
              borderRadius: '3px',
              textTransform: 'uppercase',
              fontWeight:   600,
              background:   MODEL_TAG_BG,
              color:        'var(--mt)',
              border:       `1px solid ${MODEL_TAG_BD}`,
              fontFamily:   'var(--fm)',
            }}
          >
            {agent.model}
          </span>

          {/* OPTIONAL badge */}
          {agent.tier === 'optional' && (
            <span
              style={{
                fontSize:     '10px',
                letterSpacing: '0.08em',
                padding:      '2px 7px',
                borderRadius: '3px',
                textTransform: 'uppercase',
                fontWeight:   600,
                background:   OPTIONAL_TAG_BG,
                color:        'var(--cpr)',
                border:       `1px solid ${OPTIONAL_TAG_BD}`,
                fontFamily:   'var(--fm)',
              }}
            >
              OPTIONAL
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
