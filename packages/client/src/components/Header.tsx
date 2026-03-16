import { useState, useEffect } from 'react';
import GanderLogo from './GanderLogo';

export default function Header() {
  const [timestamp, setTimestamp] = useState(() => new Date().toLocaleString());

  useEffect(() => {
    const id = setInterval(() => setTimestamp(new Date().toLocaleString()), 60_000);
    return () => clearInterval(id);
  }, []);

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
        }}
        className="header-meta"
      >
        <div style={{ color: 'var(--wm)', fontFamily: 'var(--fb)' }}>
          GANDER STUDIO v1.0.0
        </div>
        <div style={{ color: 'var(--mt)', fontFamily: 'var(--fm)' }} className="ts">
          {timestamp}
        </div>
      </div>
    </header>
  );
}
