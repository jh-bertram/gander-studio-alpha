import type { Skill } from '@gander-studio/shared';
import { SKILL_HOVER_BD, SKILL_HOVER_SH } from '../../constants/browse';
import { useBrowseStore } from '../../store/browse-store';

interface Props {
  skill: Skill;
}

export default function SkillCard({ skill }: Props) {
  const { setSelectedItem } = useBrowseStore();

  function openDrilldown() {
    setSelectedItem({ type: 'skill', name: skill.name });
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
      aria-label={`${skill.name} skill`}
      data-testid="skill-card"
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
        el.style.borderColor = SKILL_HOVER_BD;
        el.style.boxShadow   = SKILL_HOVER_SH;
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
      {/* Left accent bar — 3px teal strip */}
      <div
        aria-hidden="true"
        style={{
          width:      '3px',
          position:   'absolute',
          top:        0,
          left:       0,
          height:     '100%',
          background: 'var(--dg)',
        }}
      />

      {/* Content — padding-left clears the accent bar */}
      <div style={{ padding: '14px 18px 14px 24px' }}>
        <div
          style={{
            fontFamily:    'var(--fm)',
            fontSize:      '9px',
            color:         'var(--mg)',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            marginBottom:  '4px',
          }}
        >
          SKILL
        </div>

        <div
          style={{
            fontFamily:    'var(--fh)',
            fontSize:      '13px',
            fontWeight:    500,
            color:         'var(--w)',
            marginBottom:  '5px',
          }}
        >
          {skill.name}
        </div>

        <p
          style={{
            color:           'var(--wm)',
            fontSize:        '11.5px',
            margin:          0,
            display:         '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            overflow:        'hidden',
          }}
        >
          {skill.description}
        </p>
      </div>
    </div>
  );
}
