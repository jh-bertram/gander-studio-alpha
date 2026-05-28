/**
 * AgentTimeline — inline SVG Gantt-style timeline for agent SPAWN→COMPLETE bars.
 *
 * Pattern: AgentSpawnTimeline (approved by human at sprint dispatch; see
 * s3-t1-ui-spec-UI-1779932400.md §new_pattern_proposal).
 *
 * All colors via CSS custom properties from packages/client/src/globals.css.
 * No chart library (recharts / visx / d3) — native SVG only.
 * No Shadcn ui/* primitives.
 *
 * Requirement A: horizontal-scroll model — SVG contentWidth is decoupled from
 *   the measured container width.  A separate overflow-x:auto scroller div
 *   wraps the SVG so wide sessions scroll instead of compressing.
 *
 * Requirement B: adaptive x-axis unit — unit is derived once from tAxisRange
 *   (ms < 90 s → s; 90 s ≤ range < 90 min → m; 90 min ≤ range < 48 h → h;
 *   range ≥ 48 h → d) and applied consistently to every tick label and the
 *   per-bar spawn-offset aria-label.
 */
import { useRef, useEffect, useState } from 'react';
import type { EventLogEntry } from '@gander-studio/shared';

// ─── Layout constants ─────────────────────────────────────────────────────────
const LABEL_COL_WIDTH = 120;
const ROW_HEIGHT = 32;
const BAR_HEIGHT = 16;
const AXIS_HEIGHT = 24;
const TOP_PAD = 8;
const TICK_COUNT = 5;
const MIN_BAR_WIDTH = 2;
const LABEL_MAX_CHARS = 14;

// Scroll / scale constants (Requirement A)
const MIN_BAR_AREA = TICK_COUNT * 120;  // 600px — readable floor
const MAX_BAR_AREA = 4000;              // cap so multi-day sessions aren't 50 000px
const PX_PER_SECOND = 0.3;             // modest growth per second of range

// ─── Unit type ────────────────────────────────────────────────────────────────
type AxisUnit = 'ms' | 's' | 'm' | 'h' | 'd';

// ─── Types ────────────────────────────────────────────────────────────────────
interface AgentBar {
  agentId: string;
  spawnSeq: number;
  edgeLabel: string;
  spawnTs: number;
  completeTs: number | undefined;
  isOrphan: boolean;
}

interface AgentTimelineProps {
  events: EventLogEntry[];
  selectedAgentIds: string[];
  className?: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function truncate(s: string, maxLen: number): string {
  return s.length > maxLen ? s.slice(0, maxLen - 1) + '…' : s;
}

/**
 * Format a bar's own duration — independent scale so a 2h bar doesn't say "7200s".
 */
function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  const s = ms / 1000;
  if (s < 90) return `${s.toFixed(1)}s`;
  const m = s / 60;
  if (m < 90) return `${m.toFixed(1)}m`;
  const h = m / 60;
  if (h < 48) return `${h.toFixed(1)}h`;
  return `${(h / 24).toFixed(1)}d`;
}

/**
 * Derive the axis unit once from the total axis range (ms).
 * All ticks and bar spawn-offset labels use the same unit.
 */
function deriveUnit(rangeMs: number): AxisUnit {
  const rangeS = rangeMs / 1000;
  if (rangeS < 1) return 'ms';
  if (rangeS < 90) return 's';
  if (rangeS < 90 * 60) return 'm';
  if (rangeS < 48 * 3600) return 'h';
  return 'd';
}

/**
 * Format an offset (ms) using the pre-derived axis unit.
 * Returns strings like: `0s`, `+12m`, `+3.2h`, `+2.1d`.
 */
function formatOffset(offsetMs: number, unit: AxisUnit): string {
  if (offsetMs === 0) return `0${unit}`;

  let value: number;
  switch (unit) {
    case 'ms': value = offsetMs; break;
    case 's':  value = Math.round(offsetMs / 1000); break;
    case 'm':  value = offsetMs / 60000; break;
    case 'h':  value = offsetMs / 3600000; break;
    case 'd':  value = offsetMs / 86400000; break;
  }

  // Round integers cleanly; keep one decimal for fractional values
  const formatted = Number.isInteger(value) || unit === 's' || unit === 'ms'
    ? String(Math.round(value))
    : value.toFixed(1);

  return `+${formatted}${unit}`;
}

function buildBars(
  events: EventLogEntry[],
  selectedAgentIds: string[],
): AgentBar[] {
  // Group SPAWN and COMPLETE events by agent_id
  const spawnMap = new Map<string, EventLogEntry>();
  const completeMap = new Map<string, EventLogEntry>();

  for (const e of events) {
    if (e.ev === 'SPAWN') {
      const existing = spawnMap.get(e.agent_id);
      if (!existing || new Date(e.ts).getTime() < new Date(existing.ts).getTime()) {
        spawnMap.set(e.agent_id, e);
      }
    } else if (e.ev === 'COMPLETE') {
      const existing = completeMap.get(e.agent_id);
      if (!existing || new Date(e.ts).getTime() > new Date(existing.ts).getTime()) {
        completeMap.set(e.agent_id, e);
      }
    }
  }

  const bars: AgentBar[] = [];
  for (const agentId of selectedAgentIds) {
    const spawnEvent = spawnMap.get(agentId);
    if (!spawnEvent) continue; // no SPAWN event for this agent — skip

    const completeEvent = completeMap.get(agentId);
    bars.push({
      agentId,
      spawnSeq: spawnEvent.seq,
      edgeLabel: spawnEvent.edge_label ?? 'unknown',
      spawnTs: new Date(spawnEvent.ts).getTime(),
      completeTs: completeEvent ? new Date(completeEvent.ts).getTime() : undefined,
      isOrphan: !completeEvent,
    });
  }

  return bars;
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function AgentTimeline({
  events,
  selectedAgentIds,
  className,
}: AgentTimelineProps): React.JSX.Element {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState<number>(600);

  // Measure container width; update on resize
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    function measure(): void {
      const w = el!.getBoundingClientRect().width;
      if (w > 0) setContainerWidth(w);
    }

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // ── Data preparation ──────────────────────────────────────────────────────
  const bars = buildBars(events, selectedAgentIds);

  // Empty states
  if (selectedAgentIds.length === 0) {
    return (
      <div
        ref={containerRef}
        className={className}
        aria-live="polite"
        style={{
          fontFamily: 'var(--fm)',
          fontSize: '12px',
          color: 'var(--wd)',
          padding: '24px',
          textAlign: 'center',
          background: 'var(--sfm)',
          border: '1px solid var(--bd)',
          borderRadius: 'var(--rl)',
        }}
      >
        No agents selected
      </div>
    );
  }

  if (bars.length === 0) {
    return (
      <div
        ref={containerRef}
        className={className}
        aria-live="polite"
        style={{
          fontFamily: 'var(--fm)',
          fontSize: '12px',
          color: 'var(--wd)',
          padding: '24px',
          textAlign: 'center',
          background: 'var(--sfm)',
          border: '1px solid var(--bd)',
          borderRadius: 'var(--rl)',
        }}
      >
        No timeline data
      </div>
    );
  }

  // ── Axis computation ──────────────────────────────────────────────────────
  const allSpawnTs = bars.map((b) => b.spawnTs);
  const allCompleteTs = bars
    .filter((b) => b.completeTs !== undefined)
    .map((b) => b.completeTs as number);

  const tAxisMin = Math.min(...allSpawnTs);
  const tAxisMax =
    allCompleteTs.length > 0
      ? Math.max(...allCompleteTs)
      : Math.max(...allSpawnTs) + 1;
  const tAxisRange = tAxisMax - tAxisMin || 1;

  // ── Adaptive unit (Requirement B) — derived once from total range ─────────
  const axisUnit = deriveUnit(tAxisRange);

  // ── Content width computation (Requirement A) ─────────────────────────────
  // barArea grows modestly with time range so dense sessions get more room.
  const rangeSeconds = tAxisRange / 1000;
  const contentBarArea = Math.max(
    MIN_BAR_AREA,
    Math.min(rangeSeconds * PX_PER_SECOND * 100, MAX_BAR_AREA),
  );
  // contentWidth is never less than the measured container (no regression for
  // short sessions) but may exceed it for wide sessions → SVG scrolls.
  const contentWidth = Math.max(containerWidth, LABEL_COL_WIDTH + contentBarArea);
  const contentBarAreaActual = contentWidth - LABEL_COL_WIDTH;

  const nRows = bars.length;
  const svgHeight = TOP_PAD + nRows * ROW_HEIGHT + AXIS_HEIGHT;

  // Normalise x position / width to content bar area (not container width)
  function normX(ts: number): number {
    return LABEL_COL_WIDTH + ((ts - tAxisMin) / tAxisRange) * contentBarAreaActual;
  }

  // ── Tick labels ───────────────────────────────────────────────────────────
  const ticks: { x: number; label: string }[] = [];
  for (let i = 0; i <= TICK_COUNT; i++) {
    const frac = i / TICK_COUNT;
    ticks.push({
      x: LABEL_COL_WIDTH + frac * contentBarAreaActual,
      label: formatOffset(frac * tAxisRange, axisUnit),
    });
  }

  // ── Aria label for SVG root ───────────────────────────────────────────────
  const startLabel = new Date(tAxisMin).toISOString().slice(0, 10);
  const endLabel = new Date(tAxisMax).toISOString().slice(0, 10);
  const rangeLabel = formatOffset(tAxisRange, axisUnit);
  const svgAriaLabel = `Agent spawn timeline: ${bars.length} agent${bars.length !== 1 ? 's' : ''}, from ${startLabel} to ${endLabel} (${rangeLabel} range).`;

  // ── Axis baseline y ───────────────────────────────────────────────────────
  const axisBaselineY = TOP_PAD + nRows * ROW_HEIGHT;

  return (
    <div
      ref={containerRef}
      className={className}
      style={{
        background: 'var(--sfm)',
        border: '1px solid var(--bd)',
        borderRadius: 'var(--rl)',
        overflow: 'hidden',
      }}
    >
      {/* Horizontal scroller — SVG may exceed containerWidth for wide sessions */}
      <div
        data-testid="agent-timeline-scroller"
        style={{ overflowX: 'auto' }}
      >
        <svg
          width={contentWidth}
          height={svgHeight}
          role="img"
          aria-label={svgAriaLabel}
          tabIndex={0}
          style={{ display: 'block' }}
          data-testid="agent-timeline-svg"
        >
          {/* ── X-axis baseline ── */}
          <line
            x1={LABEL_COL_WIDTH}
            y1={axisBaselineY}
            x2={contentWidth}
            y2={axisBaselineY}
            stroke="var(--bdb)"
            strokeWidth={1}
            aria-hidden="true"
          />

          {/* ── X-axis tick labels ── */}
          <g aria-hidden="true">
            {ticks.map(({ x, label }) => (
              <text
                key={label}
                x={x}
                y={axisBaselineY + 14}
                fill="var(--wd)"
                fontSize={10}
                fontFamily="var(--fm)"
                textAnchor="middle"
              >
                {label}
              </text>
            ))}
          </g>

          {/* ── Per-agent rows ── */}
          {bars.map((bar, rowIndex) => {
            const rowTop = TOP_PAD + rowIndex * ROW_HEIGHT;
            const rowCenterY = rowTop + ROW_HEIGHT / 2;
            const barY = rowCenterY - BAR_HEIGHT / 2;

            // Bar x / width — use contentWidth for orphan right-edge
            const barX = normX(bar.spawnTs);
            const barEndX = bar.isOrphan
              ? contentWidth
              : normX(bar.completeTs as number);
            const rawWidth = barEndX - barX;
            const barWidth = Math.max(rawWidth, MIN_BAR_WIDTH);

            // Duration label for title / aria
            const durationLabel = bar.isOrphan
              ? 'in progress'
              : formatDuration((bar.completeTs as number) - bar.spawnTs);

            // Spawn offset uses the axis unit for consistency (Requirement B)
            const spawnOffsetLabel = formatOffset(bar.spawnTs - tAxisMin, axisUnit);

            const barAriaLabel = `${bar.agentId}: ${bar.edgeLabel}, spawned ${spawnOffsetLabel}, ${durationLabel}.`;

            const titleText = `${bar.agentId} | edge: ${bar.edgeLabel} | seq: ${bar.spawnSeq} | ${durationLabel}`;

            return (
              <g key={bar.agentId} aria-hidden="false">
                {/* Y-axis label — aria-hidden, covered by bar g aria-label */}
                <text
                  x={LABEL_COL_WIDTH - 8}
                  y={rowCenterY + 4}
                  fill="var(--wd)"
                  fontSize={11}
                  fontFamily="var(--fm)"
                  textAnchor="end"
                  aria-hidden="true"
                  data-testid={`timeline-label-${bar.agentId}`}
                >
                  {truncate(bar.agentId, LABEL_MAX_CHARS)}
                </text>

                {/* Row separator */}
                {rowIndex < nRows - 1 && (
                  <line
                    x1={0}
                    y1={rowTop + ROW_HEIGHT}
                    x2={contentWidth}
                    y2={rowTop + ROW_HEIGHT}
                    stroke="var(--bd)"
                    strokeWidth={0.5}
                    aria-hidden="true"
                  />
                )}

                {/* Bar group — keyboard-focusable */}
                <g
                  role="img"
                  tabIndex={0}
                  aria-label={barAriaLabel}
                  data-testid={`timeline-bar-${bar.agentId}`}
                  data-orphan={bar.isOrphan ? 'true' : 'false'}
                >
                  <title>{titleText}</title>
                  {bar.isOrphan ? (
                    <rect
                      x={barX}
                      y={barY}
                      width={barWidth}
                      height={BAR_HEIGHT}
                      rx={2}
                      fill="none"
                      stroke="var(--mt)"
                      strokeWidth={1.5}
                      strokeDasharray="4 3"
                      data-testid={`timeline-bar-rect-${bar.agentId}`}
                    />
                  ) : (
                    <rect
                      x={barX}
                      y={barY}
                      width={barWidth}
                      height={BAR_HEIGHT}
                      rx={2}
                      fill="var(--mt)"
                      data-testid={`timeline-bar-rect-${bar.agentId}`}
                    />
                  )}
                </g>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
