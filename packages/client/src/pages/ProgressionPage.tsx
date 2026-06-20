import React, { useEffect, useRef, useState, useMemo } from 'react';
import { trpc } from '../trpc';
import type { ProgressionEntry } from '@gander-studio/shared';
import { SURFACE_COLORS, SURFACE_ORDER, type Surface } from '../constants/progression';

// ─────────────────────────────────────────────────────────────────────────────
// Reduced-motion helper — checked once at module init, then stable per session.
// Component-local: no Zustand required (no audio; motion-only guard).
// ─────────────────────────────────────────────────────────────────────────────
function prefersReducedMotion(): boolean {
  return (
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Count-up hook — animates from 0 to `target` over `duration`ms using rAF.
// Under reduced-motion: returns `target` immediately (no rAF).
// No Zustand dependency; no object-returning selector; no render loop.
// ─────────────────────────────────────────────────────────────────────────────
function useCountUp(target: number, duration: number = 900): number {
  const [displayed, setDisplayed] = useState<number>(
    prefersReducedMotion() ? target : 0,
  );
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (prefersReducedMotion()) {
      setDisplayed(target);
      return;
    }
    if (target === 0) {
      setDisplayed(0);
      return;
    }
    const start = performance.now();
    const startVal = 0;

    function tick(now: number): void {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(startVal + eased * (target - startVal));
      setDisplayed(current);
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick);
      }
    }

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target]);

  return displayed;
}

// ─────────────────────────────────────────────────────────────────────────────
// XpBar — proportional fill bar with accessible semantics and count-up.
// ─────────────────────────────────────────────────────────────────────────────
interface XpBarProps {
  surface: Surface;
  count: number;
  maxCount: number;
}

function XpBar({ surface, count, maxCount }: XpBarProps): React.ReactElement {
  const animatedCount = useCountUp(count, 900);
  // Fill width is proportion of the max; minimum 2px visual rail for 0.
  const fillPct = maxCount > 0 ? (count / maxCount) * 100 : 0;
  const color = SURFACE_COLORS[surface];

  return (
    <div
      key={surface}
      aria-label={`${surface}: ${count} XP gain${count !== 1 ? 's' : ''}`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
        padding: '8px 12px',
        background: 'var(--sf)',
        border: '1px solid var(--bd)',
        borderRadius: 'var(--r)',
      }}
    >
      {/* Label row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span
            aria-hidden="true"
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: color,
              flexShrink: 0,
              opacity: count === 0 ? 0.4 : 1,
            }}
          />
          <span style={{ fontFamily: 'var(--fb)', fontSize: '12px', color: 'var(--wd)' }}>
            {surface}
          </span>
        </div>
        {/* Count-up numeric value — aria-hidden because the progressbar carries the value */}
        <span
          aria-hidden="true"
          style={{
            fontFamily: 'var(--fm)',
            fontSize: '12px',
            color: count === 0 ? 'var(--wm)' : 'var(--w)',
            fontWeight: 600,
            minWidth: '20px',
            textAlign: 'right',
          }}
        >
          {animatedCount}
        </span>
      </div>
      {/* XP bar track */}
      <div
        role="progressbar"
        aria-valuenow={count}
        aria-valuemin={0}
        aria-valuemax={maxCount}
        aria-label={`${surface} XP: ${count} of ${maxCount} maximum`}
        style={{
          width: '100%',
          height: '4px',
          background: 'var(--sfh)',
          borderRadius: '2px',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            height: '100%',
            width: `${fillPct}%`,
            background: color,
            borderRadius: '2px',
            opacity: count === 0 ? 0.25 : 1,
            transition: prefersReducedMotion() ? 'none' : 'width 900ms cubic-bezier(0.22,1,0.36,1)',
          }}
        />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SprintEntry — single ledger row; applies level-up-flash class when
// entry.levels_advanced has items. Flash is gated by globals.css reduced-motion
// suppression (animation:none; background:transparent under prefers-reduced-motion).
// ─────────────────────────────────────────────────────────────────────────────
function onEntryFocus(e: React.FocusEvent<HTMLDivElement>): void {
  e.currentTarget.style.outline = '2px solid var(--mt)';
}

function onEntryBlur(e: React.FocusEvent<HTMLDivElement>): void {
  e.currentTarget.style.outline = 'none';
}

function SprintEntry({ entry }: { entry: ProgressionEntry }): React.ReactElement {
  const borderColor = SURFACE_COLORS[entry.xp_gained[0]?.surface as Surface] ?? 'var(--mt)';
  const hasLevelUp = entry.levels_advanced.length > 0;
  const hasFollowSection = hasLevelUp || entry.new_capabilities.length > 0;

  return (
    <div
      role="listitem"
      tabIndex={0}
      // level-up-flash is a p1-defined globals.css class:
      // animation: level-up-flash 900ms ease-out both (when hasLevelUp)
      // suppressed to animation:none + background:transparent under reduced-motion
      className={hasLevelUp ? 'level-up-flash' : undefined}
      style={{
        background: 'var(--sfm)',
        border: '1px solid var(--bd)',
        borderLeft: `3px solid ${borderColor}`,
        borderRadius: 'var(--rl)',
        padding: '16px 20px',
        marginBottom: '12px',
        transition: 'background 120ms ease',
        outline: 'none',
      }}
      onFocus={onEntryFocus}
      onBlur={onEntryBlur}
    >
      {/* Sprint ID + XP gain count */}
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: '12px', marginBottom: '12px' }}>
        <code style={{ fontFamily: 'var(--fm)', fontSize: '14px', fontWeight: 600, color: 'var(--w)', letterSpacing: '0.04em' }}>
          {entry.sprint_id}
        </code>
        <span style={{ fontFamily: 'var(--fb)', fontSize: '11px', color: 'var(--wm)', whiteSpace: 'nowrap' }}>
          {entry.xp_gained.length} XP gain{entry.xp_gained.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* XP gain rows */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
        paddingBottom: hasFollowSection ? '12px' : 0,
        borderBottom: hasFollowSection ? '1px solid var(--bd)' : 'none',
      }}>
        {entry.xp_gained.map((xp, i) => (
          <div key={i} style={{ display: 'flex', flexDirection: 'row', alignItems: 'flex-start', gap: '8px' }}>
            <span
              aria-hidden="true"
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: SURFACE_COLORS[xp.surface as Surface] ?? 'var(--mt)',
                flexShrink: 0,
                marginTop: '5px',
              }}
            />
            <span style={{
              fontFamily: 'var(--fb)',
              fontSize: '11px',
              fontWeight: 600,
              color: 'var(--wd)',
              background: 'var(--sfh)',
              borderRadius: 'var(--r)',
              padding: '2px 6px',
              minWidth: '90px',
              flexShrink: 0,
              textAlign: 'center',
              borderLeft: `2px solid ${SURFACE_COLORS[xp.surface as Surface] ?? 'var(--mt)'}`,
            }}>
              {xp.surface}
            </span>
            <span style={{ fontFamily: 'var(--fb)', fontSize: '13px', color: 'var(--wd)', lineHeight: 1.5, flex: 1 }}>
              {xp.delta}
            </span>
          </div>
        ))}
      </div>

      {/* LEVELS ADVANCED — label in var(--my) is the static fallback when flash is suppressed */}
      {hasLevelUp && (
        <div style={{ marginTop: '12px' }}>
          <span style={{
            display: 'block',
            fontFamily: 'var(--fb)',
            fontSize: '11px',
            fontWeight: 600,
            color: 'var(--my)',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            marginBottom: '6px',
          }}>
            LEVELS ADVANCED
          </span>
          {entry.levels_advanced.map((lv, i) => (
            <div key={i} style={{
              fontFamily: 'var(--fb)',
              fontSize: '12px',
              color: 'var(--wd)',
              paddingLeft: '12px',
              borderLeft: '2px solid var(--my)',
              lineHeight: 1.55,
              marginBottom: '4px',
            }}>
              {lv}
            </div>
          ))}
        </div>
      )}

      {/* NEW CAPABILITIES */}
      {entry.new_capabilities.length > 0 && (
        <div style={{ marginTop: '10px' }}>
          <span style={{
            display: 'block',
            fontFamily: 'var(--fb)',
            fontSize: '11px',
            fontWeight: 600,
            color: 'var(--cgr)',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            marginBottom: '6px',
          }}>
            NEW CAPABILITIES
          </span>
          {entry.new_capabilities.map((cap, i) => (
            <div key={i} style={{
              fontFamily: 'var(--fb)',
              fontSize: '12px',
              color: 'var(--wd)',
              paddingLeft: '12px',
              borderLeft: '2px solid var(--mg)',
              lineHeight: 1.55,
              marginBottom: '4px',
            }}>
              {cap}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ProgressionPage — character sheet layout
// ─────────────────────────────────────────────────────────────────────────────
export default function ProgressionPage(): React.ReactElement {
  const ledgerQ = trpc.progression.getLedger.useQuery();

  // Primitive-value selectors only (S2 lesson: no object-returning selector).
  // No muted read needed — this page has no audio.

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

  // Max count across surfaces — used to proportion XP bars.
  const maxSurfaceCount = useMemo<number>(() => {
    return Math.max(...SURFACE_ORDER.map((s) => surfaceCounts[s]), 1);
  }, [surfaceCounts]);

  const reversedEntries = useMemo<ProgressionEntry[]>(() => {
    if (!ledgerQ.data) return [];
    return [...ledgerQ.data].reverse();
  }, [ledgerQ.data]);

  // ── Loading state ──────────────────────────────────────────────────────────
  if (ledgerQ.isLoading) {
    return (
      <div
        role="status"
        aria-live="polite"
        aria-label="Loading progression ledger"
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '12px',
          background: 'var(--sf)',
          minHeight: '200px',
        }}
      >
        <div
          aria-hidden="true"
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            border: '3px solid var(--bd)',
            borderTopColor: 'var(--mt)',
            animation: 'spin 0.8s linear infinite',
          }}
        />
        <span style={{ fontFamily: 'var(--fm)', fontSize: '13px', color: 'var(--wm)', letterSpacing: '0.12em' }}>
          Loading ledger…
        </span>
      </div>
    );
  }

  // ── Error state ────────────────────────────────────────────────────────────
  if (ledgerQ.error) {
    return (
      <div role="alert" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '200px' }}>
        <div style={{
          background: 'var(--sfm)',
          border: '1px solid var(--red)',
          borderRadius: 'var(--rl)',
          padding: '24px 28px',
          maxWidth: '420px',
          textAlign: 'center',
        }}>
          <div style={{ fontFamily: 'var(--fh)', fontSize: '16px', fontWeight: 500, color: 'var(--w)', letterSpacing: '0.1em', marginBottom: '8px' }}>
            LEDGER UNAVAILABLE
          </div>
          <div style={{ fontFamily: 'var(--fb)', fontSize: '13px', color: 'var(--wd)', lineHeight: 1.55 }}>
            Progression ledger could not be loaded. Verify GANDER_ROOT is set and the ledger file exists.
          </div>
        </div>
      </div>
    );
  }

  // ── Empty state ────────────────────────────────────────────────────────────
  if (ledgerQ.data && ledgerQ.data.length === 0) {
    return (
      <div role="status" aria-live="polite" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '200px' }}>
        <div style={{
          background: 'var(--sfm)',
          border: '1px solid var(--bd)',
          borderRadius: 'var(--rl)',
          padding: '24px 28px',
          maxWidth: '360px',
          textAlign: 'center',
        }}>
          <div
            aria-hidden="true"
            style={{
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              background: 'var(--mt)',
              margin: '0 auto 12px',
              animation: 'pulse-opacity 2s ease-in-out infinite',
            }}
          />
          <div style={{ fontFamily: 'var(--fh)', fontSize: '16px', color: 'var(--mt)', letterSpacing: '0.1em', marginBottom: '8px' }}>
            NO LEDGER ENTRIES
          </div>
          <div style={{ fontFamily: 'var(--fb)', fontSize: '13px', color: 'var(--wd)' }}>
            No progression entries found. Run a sprint after-action to populate the ledger.
          </div>
        </div>
      </div>
    );
  }

  // ── Character sheet ────────────────────────────────────────────────────────
  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      {/* Page header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '24px',
        paddingBottom: '16px',
        borderBottom: '1px solid var(--bd)',
      }}>
        <h1 style={{
          fontFamily: 'var(--fh)',
          fontSize: '20px',
          fontWeight: 500,
          color: 'var(--w)',
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          textShadow: 'var(--title-glow)',
          margin: 0,
        }}>
          PROGRESSION LEDGER
        </h1>
      </div>

      {/* XP bars — surface coverage with proportional fill + count-up */}
      <section
        aria-label="XP summary by surface"
        style={{
          background: 'var(--sfm)',
          border: '1px solid var(--bd)',
          borderRadius: 'var(--rl)',
          padding: '16px',
          marginBottom: '24px',
        }}
      >
        <h2 style={{
          fontFamily: 'var(--fb)',
          fontSize: '11px',
          fontWeight: 600,
          color: 'var(--wm)',
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
          marginBottom: '12px',
          margin: '0 0 12px 0',
        }}>
          SURFACE COVERAGE
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '8px' }}>
          {SURFACE_ORDER.map((surface) => (
            <XpBar
              key={surface}
              surface={surface}
              count={surfaceCounts[surface]}
              maxCount={maxSurfaceCount}
            />
          ))}
        </div>
      </section>

      {/* Sprint history */}
      <h2 style={{
        fontFamily: 'var(--fb)',
        fontSize: '11px',
        fontWeight: 600,
        color: 'var(--wm)',
        letterSpacing: '0.14em',
        textTransform: 'uppercase',
        marginBottom: '12px',
        margin: '0 0 12px 0',
      }}>
        SPRINT HISTORY
      </h2>
      <div role="list">
        {reversedEntries.map((entry) => (
          <SprintEntry key={entry.sprint_id} entry={entry} />
        ))}
      </div>
    </div>
  );
}
