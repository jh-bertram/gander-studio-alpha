import { useEffect, useRef, useCallback } from 'react';
import type { Agent, Skill, Hook } from '@gander-studio/shared';
import {
  AGENT_MATERIA,
  DEFAULT_MATERIA,
  TOOL_CHIP_BG,
  TOOL_CHIP_BD,
  OVERLAY_BG,
  HOOK_BADGE_BG,
  HOOK_BADGE_BD,
} from '../../constants/browse';

// ---- Section label helper -----------------------------------------------

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        fontFamily:    'var(--fm)',
        fontSize:      '10px',
        color:         'var(--mt)',
        textTransform: 'uppercase',
        letterSpacing: '0.2em',
        marginBottom:  '6px',
      }}
    >
      {children}
    </div>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: '18px' }}>
      <SectionLabel>{label}</SectionLabel>
      {children}
    </div>
  );
}

// ---- Agent detail -------------------------------------------------------

function AgentDetail({ agent }: { agent: Agent }) {
  const materia = AGENT_MATERIA[agent.name] ?? DEFAULT_MATERIA;
  return (
    <>
      <Section label="Description">
        <p style={{ color: 'var(--wd)', fontSize: '13px', margin: 0 }}>{agent.description}</p>
      </Section>

      <div
        style={{
          display:             'grid',
          gridTemplateColumns: '1fr 1fr',
          gap:                 '14px',
          marginBottom:        '18px',
        }}
      >
        <Section label="Model">
          <span
            style={{
              fontFamily: 'var(--fm)',
              fontSize:   '13px',
              color:      'var(--wd)',
            }}
          >
            {agent.model}
          </span>
        </Section>
        <Section label="Version">
          <span
            style={{
              fontFamily: 'var(--fm)',
              fontSize:   '13px',
              color:      'var(--wd)',
            }}
          >
            {agent.version ?? '—'}
          </span>
        </Section>
      </div>

      {agent.tools.length > 0 && (
        <Section label="Tools">
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {agent.tools.map((tool) => (
              <span
                key={tool}
                style={{
                  fontFamily:   'var(--fm)',
                  fontSize:     '11px',
                  padding:      '3px 8px',
                  borderRadius: '3px',
                  background:   TOOL_CHIP_BG,
                  color:        'var(--mt)',
                  border:       `1px solid ${TOOL_CHIP_BD}`,
                }}
              >
                {tool}
              </span>
            ))}
          </div>
        </Section>
      )}

      {/* MateriaDot preview */}
      <Section label="Materia">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div
            aria-hidden="true"
            style={{
              width:          '28px',
              height:         '28px',
              borderRadius:   '50%',
              background:     materia.color,
              display:        'flex',
              alignItems:     'center',
              justifyContent: 'center',
              fontFamily:     'var(--fm)',
              fontSize:       '10px',
              fontWeight:     700,
              color:          'var(--void)',
            }}
          >
            {materia.code}
          </div>
          <span style={{ fontFamily: 'var(--fm)', fontSize: '11px', color: 'var(--wm)' }}>
            {agent.tier} tier
          </span>
        </div>
      </Section>
    </>
  );
}

// ---- Skill detail -------------------------------------------------------

function SkillDetail({ skill }: { skill: Skill }) {
  return (
    <>
      <Section label="Description">
        <p style={{ color: 'var(--wd)', fontSize: '13px', margin: 0 }}>{skill.description}</p>
      </Section>
      <Section label="Body">
        <pre
          style={{
            fontFamily:  'var(--fm)',
            fontSize:    '11px',
            color:       'var(--wd)',
            maxHeight:   '300px',
            overflowY:   'auto',
            whiteSpace:  'pre-wrap',
            background:  'var(--sfm)',
            padding:     '12px',
            borderRadius: 'var(--r)',
            margin:      0,
          }}
        >
          {skill.body}
        </pre>
      </Section>
    </>
  );
}

// ---- Hook detail --------------------------------------------------------

function HookDetail({ hook }: { hook: Hook }) {
  return (
    <>
      <Section label="Event Type">
        <span
          style={{
            fontFamily:    'var(--fm)',
            fontSize:      '11px',
            fontWeight:    700,
            textTransform: 'uppercase',
            padding:       '3px 8px',
            borderRadius:  '3px',
            background:    HOOK_BADGE_BG,
            color:         'var(--mo)',
            border:        `1px solid ${HOOK_BADGE_BD}`,
          }}
        >
          {hook.event}
        </span>
      </Section>
      <Section label="Matcher">
        <span style={{ fontFamily: 'var(--fm)', fontSize: '12px', color: 'var(--wd)' }}>
          {hook.matcher}
        </span>
      </Section>
      <Section label="File Path">
        <span style={{ fontFamily: 'var(--fm)', fontSize: '11px', color: 'var(--wm)' }}>
          {hook.filePath}
        </span>
      </Section>
      <Section label="Command">
        <span style={{ fontFamily: 'var(--fm)', fontSize: '12px', color: 'var(--wd)' }}>
          {hook.command}
        </span>
      </Section>
    </>
  );
}

// ---- DrilldownPanel -----------------------------------------------------

export type DrilldownItem =
  | { type: 'agent'; data: Agent }
  | { type: 'skill'; data: Skill }
  | { type: 'hook';  data: Hook  };

interface Props {
  item:          DrilldownItem;
  onClose:       () => void;
  triggerRef?:   React.RefObject<HTMLElement | null>;
}

export default function DrilldownPanel({ item, onClose, triggerRef }: Props) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const panelRef       = useRef<HTMLDivElement>(null);

  // Focus close button on open
  useEffect(() => {
    closeButtonRef.current?.focus();
  }, []);

  // Restore focus on unmount
  useEffect(() => {
    return () => {
      triggerRef?.current?.focus();
    };
  }, [triggerRef]);

  // Escape key closes
  const handleOverlayKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose();
      }
    },
    [onClose],
  );

  // Focus trap within panel
  const handlePanelKeyDown = useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== 'Tab') return;
    const panel = panelRef.current;
    if (!panel) return;
    const focusable = Array.from(
      panel.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      ),
    ).filter((el) => !el.hasAttribute('disabled'));
    if (focusable.length === 0) return;
    const first = focusable[0];
    const last  = focusable[focusable.length - 1];
    if (e.shiftKey) {
      if (document.activeElement === first) {
        e.preventDefault();
        last.focus();
      }
    } else {
      if (document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  }, []);

  // Compute header content
  let dotColor: string;
  let dotCode:  string;
  let title:    string;
  let subtitle: string;

  if (item.type === 'agent') {
    const materia = AGENT_MATERIA[item.data.name] ?? DEFAULT_MATERIA;
    dotColor = materia.color;
    dotCode  = materia.code;
    title    = item.data.name;
    subtitle = `${item.data.tier} · ${item.data.model}`;
  } else if (item.type === 'skill') {
    dotColor = 'var(--dg)';
    dotCode  = 'SK';
    title    = item.data.name;
    subtitle = 'SKILL';
  } else {
    dotColor = 'var(--mo)';
    dotCode  = 'HK';
    title    = item.data.matcher;
    subtitle = item.data.event;
  }

  return (
    /* Overlay */
    <div
      role="presentation"
      style={{
        position:        'fixed',
        inset:           0,
        background:      OVERLAY_BG,
        backdropFilter:  'blur(4px)',
        zIndex:          1000,
        display:         'flex',
        alignItems:      'center',
        justifyContent:  'center',
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      onKeyDown={handleOverlayKeyDown}
    >
      {/* Panel */}
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="drilldown-name"
        className="panel-in"
        onKeyDown={handlePanelKeyDown}
        style={{
          background:   'linear-gradient(145deg, var(--sfh), var(--sf))',
          border:       '1px solid var(--bdb)',
          borderRadius: 'var(--rl)',
          width:        'min(600px, 92vw)',
          maxHeight:    '85vh',
          overflowY:    'auto',
          display:      'flex',
          flexDirection: 'column',
        }}
      >
        {/* Sticky header */}
        <div
          style={{
            position:     'sticky',
            top:           0,
            background:   'var(--sfh)',
            zIndex:        1,
            display:      'flex',
            alignItems:   'center',
            gap:          '12px',
            padding:      '16px 20px',
            borderBottom: '1px solid var(--bd)',
          }}
        >
          {/* MateriaDot */}
          <div
            aria-hidden="true"
            style={{
              width:          '32px',
              height:         '32px',
              borderRadius:   '50%',
              background:     dotColor,
              display:        'flex',
              alignItems:     'center',
              justifyContent: 'center',
              fontFamily:     'var(--fm)',
              fontSize:       '10px',
              fontWeight:     700,
              color:          item.type === 'skill' ? 'var(--w)' : 'var(--void)',
              flexShrink:     0,
            }}
          >
            {dotCode}
          </div>

          {/* Name + subtitle */}
          <div style={{ flex: 1, overflow: 'hidden' }}>
            <div
              id="drilldown-name"
              style={{
                fontFamily:    'var(--fh)',
                fontSize:      '17px',
                letterSpacing: '0.08em',
                color:         'var(--w)',
                overflow:      'hidden',
                textOverflow:  'ellipsis',
                whiteSpace:    'nowrap',
              }}
            >
              {title}
            </div>
            <div
              style={{
                fontFamily: 'var(--fm)',
                fontSize:   '11px',
                color:      'var(--wm)',
                marginTop:  '2px',
              }}
            >
              {subtitle}
            </div>
          </div>

          {/* Close button */}
          <button
            ref={closeButtonRef}
            type="button"
            aria-label="Close panel"
            onClick={onClose}
            style={{
              fontFamily:   'var(--fm)',
              fontSize:     '11px',
              color:        'var(--wm)',
              background:   'transparent',
              border:       '1px solid var(--bd)',
              borderRadius: 'var(--r)',
              padding:      '4px 10px',
              cursor:       'pointer',
              letterSpacing: '0.08em',
              transition:   'border-color 0.12s, color 0.12s',
              flexShrink:   0,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--redb)';
              e.currentTarget.style.color       = 'var(--redb)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--bd)';
              e.currentTarget.style.color       = 'var(--wm)';
            }}
          >
            [ CLOSE ]
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '22px' }}>
          {item.type === 'agent' && <AgentDetail agent={item.data} />}
          {item.type === 'skill' && <SkillDetail skill={item.data} />}
          {item.type === 'hook'  && <HookDetail  hook={item.data}  />}
        </div>
      </div>
    </div>
  );
}
