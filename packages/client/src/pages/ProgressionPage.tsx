import React, { useMemo } from 'react';
import { trpc } from '../trpc';
import type { ProgressionEntry } from '@gander-studio/shared';
import { SURFACE_COLORS, SURFACE_ORDER, type Surface } from '../constants/progression';

// ─────────────────────────────────────────────────────────────────────────────
// SprintEntry sub-component
// ─────────────────────────────────────────────────────────────────────────────
function SprintEntry({ entry }: { entry: ProgressionEntry }): React.ReactElement {
  const borderColor = SURFACE_COLORS[entry.xp_gained[0]?.surface as Surface] ?? 'var(--mt)';
  const hasFollowSection = entry.levels_advanced.length > 0 || entry.new_capabilities.length > 0;
  return (
    <div
      role="listitem"
      tabIndex={0}
      style={{
        background: 'var(--sfm)', border: '1px solid var(--bd)',
        borderLeft: `3px solid ${borderColor}`, borderRadius: 'var(--rl)',
        padding: '16px 20px', marginBottom: '12px', transition: 'background 120ms ease',
        outline: 'none',
      }}
      onFocus={(e) => { (e.currentTarget as HTMLDivElement).style.outline = '2px solid var(--mt)'; }}
      onBlur={(e) => { (e.currentTarget as HTMLDivElement).style.outline = 'none'; }}
    >
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: '12px', marginBottom: '12px' }}>
        <code style={{ fontFamily: 'var(--fm)', fontSize: '14px', fontWeight: 600, color: 'var(--w)', letterSpacing: '0.04em' }}>
          {entry.sprint_id}
        </code>
        <span style={{ fontFamily: 'var(--fb)', fontSize: '11px', color: 'var(--wm)', whiteSpace: 'nowrap' }}>
          {entry.xp_gained.length} XP gains
        </span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', paddingBottom: hasFollowSection ? '12px' : 0, borderBottom: hasFollowSection ? '1px solid var(--bd)' : 'none' }}>
        {entry.xp_gained.map((xp, i) => (
          <div key={i} style={{ display: 'flex', flexDirection: 'row', alignItems: 'flex-start', gap: '8px' }}>
            <span aria-hidden="true" style={{ width: '8px', height: '8px', borderRadius: '50%', background: SURFACE_COLORS[xp.surface as Surface] ?? 'var(--mt)', flexShrink: 0, marginTop: '5px' }} />
            <span style={{ fontFamily: 'var(--fb)', fontSize: '11px', fontWeight: 600, color: 'var(--wd)', background: 'var(--sfh)', borderRadius: 'var(--r)', padding: '2px 6px', minWidth: '90px', flexShrink: 0, textAlign: 'center', borderLeft: `2px solid ${SURFACE_COLORS[xp.surface as Surface] ?? 'var(--mt)'}` }}>
              {xp.surface}
            </span>
            <span style={{ fontFamily: 'var(--fb)', fontSize: '13px', color: 'var(--wd)', lineHeight: 1.5, flex: 1 }}>{xp.delta}</span>
          </div>
        ))}
      </div>
      {entry.levels_advanced.length > 0 && (
        <div style={{ marginTop: '12px' }}>
          <span style={{ display: 'block', fontFamily: 'var(--fb)', fontSize: '11px', fontWeight: 600, color: 'var(--my)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '6px' }}>LEVELS ADVANCED</span>
          {entry.levels_advanced.map((lv, i) => (
            <div key={i} style={{ fontFamily: 'var(--fb)', fontSize: '12px', color: 'var(--wd)', paddingLeft: '12px', borderLeft: '2px solid var(--my)', lineHeight: 1.55, marginBottom: '4px' }}>{lv}</div>
          ))}
        </div>
      )}
      {entry.new_capabilities.length > 0 && (
        <div style={{ marginTop: '10px' }}>
          <span style={{ display: 'block', fontFamily: 'var(--fb)', fontSize: '11px', fontWeight: 600, color: 'var(--cgr)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '6px' }}>NEW CAPABILITIES</span>
          {entry.new_capabilities.map((cap, i) => (
            <div key={i} style={{ fontFamily: 'var(--fb)', fontSize: '12px', color: 'var(--wd)', paddingLeft: '12px', borderLeft: '2px solid var(--mg)', lineHeight: 1.55, marginBottom: '4px' }}>{cap}</div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ProgressionPage
// ─────────────────────────────────────────────────────────────────────────────
export default function ProgressionPage(): React.ReactElement {
  const ledgerQ = trpc.progression.getLedger.useQuery();

  const surfaceCounts = useMemo<Record<Surface, number>>(() => {
    const counts = Object.fromEntries(SURFACE_ORDER.map((s) => [s, 0])) as Record<Surface, number>;
    if (!ledgerQ.data) return counts;
    for (const entry of ledgerQ.data) {
      for (const xp of entry.xp_gained) {
        counts[xp.surface as Surface] = (counts[xp.surface as Surface] ?? 0) + 1;
      }
    }
    return counts;
  }, [ledgerQ.data]);

  const reversedEntries = useMemo<ProgressionEntry[]>(() => {
    if (!ledgerQ.data) return [];
    return [...ledgerQ.data].reverse();
  }, [ledgerQ.data]);

  if (ledgerQ.isLoading) {
    return (
      <div role="status" aria-live="polite" aria-label="Loading progression ledger" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '12px', background: 'var(--sf)', minHeight: '200px' }}>
        <div aria-hidden="true" style={{ width: '32px', height: '32px', borderRadius: '50%', border: '3px solid var(--bd)', borderTopColor: 'var(--mt)', animation: 'spin 0.8s linear infinite' }} />
        <span style={{ fontFamily: 'var(--fm)', fontSize: '13px', color: 'var(--wm)', letterSpacing: '0.12em' }}>Loading ledger…</span>
      </div>
    );
  }

  if (ledgerQ.error) {
    return (
      <div role="alert" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '200px' }}>
        <div style={{ background: 'var(--sfm)', border: '1px solid var(--red)', borderRadius: 'var(--rl)', padding: '24px 28px', maxWidth: '420px', textAlign: 'center' }}>
          <div style={{ fontFamily: 'var(--fh)', fontSize: '16px', fontWeight: 500, color: 'var(--w)', letterSpacing: '0.1em', marginBottom: '8px' }}>LEDGER UNAVAILABLE</div>
          <div style={{ fontFamily: 'var(--fb)', fontSize: '13px', color: 'var(--wd)', lineHeight: 1.55 }}>Progression ledger could not be loaded. Verify GANDER_ROOT is set and the ledger file exists.</div>
        </div>
      </div>
    );
  }

  if (ledgerQ.data && ledgerQ.data.length === 0) {
    return (
      <div role="status" aria-live="polite" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '200px' }}>
        <div style={{ background: 'var(--sfm)', border: '1px solid var(--bd)', borderRadius: 'var(--rl)', padding: '24px 28px', maxWidth: '360px', textAlign: 'center' }}>
          <div aria-hidden="true" style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--mt)', margin: '0 auto 12px', animation: 'pulse-opacity 2s ease-in-out infinite' }} />
          <div style={{ fontFamily: 'var(--fh)', fontSize: '16px', color: 'var(--mt)', letterSpacing: '0.1em', marginBottom: '8px' }}>NO LEDGER ENTRIES</div>
          <div style={{ fontFamily: 'var(--fb)', fontSize: '13px', color: 'var(--wd)' }}>No progression entries found. Run a sprint after-action to populate the ledger.</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid var(--bd)' }}>
        <h1 style={{ fontFamily: 'var(--fh)', fontSize: '20px', fontWeight: 500, color: 'var(--w)', letterSpacing: '0.12em', textTransform: 'uppercase', textShadow: 'var(--title-glow)', margin: 0 }}>PROGRESSION LEDGER</h1>
      </div>
      <div aria-label="XP summary by surface" style={{ background: 'var(--sfm)', border: '1px solid var(--bd)', borderRadius: 'var(--rl)', padding: '16px', marginBottom: '24px' }}>
        <span role="heading" aria-level={2} style={{ display: 'block', fontFamily: 'var(--fb)', fontSize: '11px', fontWeight: 600, color: 'var(--wm)', letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: '12px' }}>SURFACE COVERAGE</span>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
          {SURFACE_ORDER.map((surface) => {
            const count = surfaceCounts[surface];
            return (
              <div key={surface} aria-label={`${surface}: ${count} XP gains`} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', background: 'var(--sf)', border: '1px solid var(--bd)', borderRadius: 'var(--r)', cursor: 'default' }}>
                <span aria-hidden="true" style={{ width: '8px', height: '8px', borderRadius: '50%', background: SURFACE_COLORS[surface], flexShrink: 0, opacity: count === 0 ? 0.4 : 1 }} />
                <span style={{ fontFamily: 'var(--fb)', fontSize: '12px', color: 'var(--wd)', flex: 1 }}>{surface}</span>
                <span style={{ fontFamily: 'var(--fm)', fontSize: '12px', color: count === 0 ? 'var(--wm)' : 'var(--w)', fontWeight: 600 }}>{count}</span>
              </div>
            );
          })}
        </div>
      </div>
      <span role="heading" aria-level={2} style={{ display: 'block', fontFamily: 'var(--fb)', fontSize: '11px', fontWeight: 600, color: 'var(--wm)', letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: '12px' }}>SPRINT HISTORY</span>
      <div role="list">
        {reversedEntries.map((entry) => (
          <SprintEntry key={entry.sprint_id} entry={entry} />
        ))}
      </div>
    </div>
  );
}
