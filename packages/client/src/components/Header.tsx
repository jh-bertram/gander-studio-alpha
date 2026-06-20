import { useState, useEffect, useCallback } from 'react';
import GanderLogo from './GanderLogo';
import { useUIStore } from '../store/ui-store';

// Visually hidden helper (SR-only text)
function SrOnly({ children }: { children: string }) {
  return (
    <span
      style={{
        position: 'absolute',
        width: '1px',
        height: '1px',
        padding: 0,
        margin: '-1px',
        overflow: 'hidden',
        clip: 'rect(0,0,0,0)',
        whiteSpace: 'nowrap',
        border: 0,
      }}
    >
      {children}
    </span>
  );
}

// SVG icons for mute/unmute (speaker-wave / speaker-x)
function IconSpeakerOn() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true" focusable="false">
      <path
        d="M3 7.5h3l4-4v13l-4-4H3v-5z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
        fill="none"
      />
      <path
        d="M13.5 7a3.5 3.5 0 0 1 0 6"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconSpeakerOff() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true" focusable="false">
      <path
        d="M3 7.5h3l4-4v13l-4-4H3v-5z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
        fill="none"
      />
      <path
        d="M14 8l-3 3m0-3l3 3"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function Header() {
  const [timestamp, setTimestamp] = useState(() => new Date().toLocaleString());

  // Primitive selectors — no object literal returned (S2 render-loop guard)
  const muted = useUIStore((s) => s.muted);
  const toggleMuted = useUIStore((s) => s.toggleMuted);

  useEffect(() => {
    const id = setInterval(() => setTimestamp(new Date().toLocaleString()), 60_000);
    return () => clearInterval(id);
  }, []);

  const handleMuteKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLButtonElement>) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggleMuted();
      }
    },
    [toggleMuted],
  );

  return (
    <header
      style={{
        gridArea: 'hd',
        display: 'flex',
        alignItems: 'center',
        gap: '20px',
        padding: '16px 28px',
        background: 'linear-gradient(90deg, var(--dg) 0%, var(--sf) 60%, var(--void) 100%)',
        borderBottom: '1px solid var(--bdb)',
        boxShadow: 'var(--gg)',
      }}
    >
      {/* Logo emblem */}
      <div
        style={{
          width: '44px',
          height: '44px',
          border: '2px solid var(--mt)',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: 'var(--gt)',
          flexShrink: 0,
        }}
        className="logo-emblem"
      >
        <GanderLogo />
      </div>

      {/* Title block */}
      <div className="htxt">
        <h1
          style={{
            fontFamily: 'var(--fh)',
            fontSize: '20px',
            fontWeight: 500,
            letterSpacing: '0.12em',
            textShadow: 'var(--title-glow)',
            color: 'var(--w)',
            margin: 0,
            lineHeight: 1.2,
          }}
        >
          GANDER STUDIO
        </h1>
        <p
          style={{
            fontSize: '10px',
            letterSpacing: '0.2em',
            color: 'var(--mt)',
            textTransform: 'uppercase',
            marginTop: '2px',
            marginBottom: 0,
          }}
          className="header-subtitle"
        >
          Agent Configuration Tool
        </p>
      </div>

      {/* Meta section */}
      <div
        style={{
          marginLeft: 'auto',
          textAlign: 'right',
          fontSize: '11px',
          letterSpacing: '0.06em',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
        }}
        className="header-meta"
      >
        <div style={{ textAlign: 'right' }}>
          <div style={{ color: 'var(--wm)', fontFamily: 'var(--fb)' }}>
            GANDER STUDIO v1.0.0
          </div>
          <div style={{ color: 'var(--mt)', fontFamily: 'var(--fm)' }} className="ts">
            {timestamp}
          </div>
        </div>

        {/* Mute toggle — s4-p1 SUPPRESSION FOUNDATION */}
        {/* Native <button>: keyboard-navigable by default (Enter + Space), focusable */}
        <button
          type="button"
          aria-pressed={muted}
          aria-label={muted ? 'Unmute audio' : 'Mute audio'}
          onClick={toggleMuted}
          onKeyDown={handleMuteKeyDown}
          data-testid="mute-toggle"
          style={{
            width: '44px',
            height: '44px',
            minWidth: '44px',
            minHeight: '44px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: muted
              ? 'rgba(231, 76, 60, 0.18)'
              : 'rgba(109, 176, 200, 0.12)',
            border: muted
              ? '1px solid var(--mr)'
              : '1px solid var(--bdb)',
            borderRadius: 'var(--r)',
            color: muted ? 'var(--mr)' : 'var(--mt)',
            cursor: 'pointer',
            flexShrink: 0,
            transition: 'background 0.15s, border-color 0.15s, color 0.15s',
          }}
        >
          {muted ? <IconSpeakerOff /> : <IconSpeakerOn />}
          <SrOnly>{muted ? 'Unmute audio' : 'Mute audio'}</SrOnly>
        </button>
      </div>
    </header>
  );
}
