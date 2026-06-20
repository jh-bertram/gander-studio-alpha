/**
 * AgentTimeline — inline SVG Gantt-style timeline for agent SPAWN→COMPLETE bars
 * plus per-ev-type event markers (SEAM-06 substrate).
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
 *
 * ─── SEAM-06: Per-ev-type visual encoding contract ──────────────────────────
 * This encoding table is the substrate s4 decorates with role-colors.
 * s3 defines SHAPE + ACCESSIBLE LABEL; s4 adds role-color bars + tooltip.
 *
 * | ev type         | Shape    | SVG primitive       | Token        | Lane |
 * |-----------------|----------|---------------------|--------------|------|
 * | SPAWN           | Bar      | <rect> (bar)        | role color   | bar  |
 * | COMPLETE        | Bar end  | <rect> (bar)        | role color   | bar  |
 * | AUDIT_PASS      | Circle   | <circle>            | --mg (green) | top  |
 * | AUDIT_FAIL      | Diamond  | <polygon> 4-pt      | --redb (red) | top  |
 * | CRITIQUE_PASS   | Triangle | <polygon> up-tri    | --mg (green) | top  |
 * | CRITIQUE_BLOCK  | Inv-tri  | <polygon> dn-tri    | --my (yellow)| top  |
 * | RESUME          | Arrow    | <polygon> right-arr | --mb (blue)  | top  |
 * | FAIL            | X        | two <line> diagonals| --mr (red)   | top  |
 * | COMMIT          | Square   | <rect> small        | --mb (blue)  | top  |
 * | RATIFICATION    | Circle   | <circle> dashed     | --mp (purple)| top  |
 * | REQVAL_COVERED  | Check    | <polyline> tick     | --mg (green) | top  |
 * | REQVAL_RESOLVED | Check    | <polyline> tick     | --cgr (cyan) | top  |
 * | NOTE            | Dot      | <circle> small      | --mo (orange)| top  |
 * | * (all others)  | Dot      | <circle> tiny       | --wm (muted) | top  |
 *
 * "top" lane: marker center placed at barY - MARKER_LANE_OFFSET (above the bar rect).
 * "bar" lane: the existing SPAWN→COMPLETE rect.
 *
 * feedback_loops: NOT counted here. SEAM-04 (s2) owns counting. CRITIQUE_BLOCK +
 * AUDIT_FAIL are rendered as point markers only — no accumulator logic.
 * ────────────────────────────────────────────────────────────────────────────
 *
 * s4-p4 additions (decorative only — all behind p1 suppression guards):
 *   - Role-colored bars from AGENT_MATERIA canonical map (browse.ts, read-only)
 *   - Staggered bar entrance via .timeline-bar-enter + --bar-index CSS var
 *   - Marching-ants orphan stroke via .timeline-orphan-march class
 *   - Live 'now' playhead via .timeline-playhead class + 5s setInterval
 *   - FF7 tooltip panel replacing native <title> (accessible name preserved via
 *     aria-label on every g[role=img] — no a11y regression)
 *   - All animation keyframes live in globals.css (p1 sole owner — zero defined here)
 */
import { useRef, useEffect, useState, useCallback } from 'react';
import type { EventLogEntry } from '@gander-studio/shared';
import { AGENT_MATERIA, DEFAULT_MATERIA } from '../../constants/browse';

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
const RIGHT_PAD = 48;                  // px reserved at right of plot area for label breathing room

// ─── Marker geometry constants (SEAM-06) ─────────────────────────────────────
const MARKER_SIZE = 5;                 // half-size in px for marker shapes
const MARKER_LANE_OFFSET = 10;        // px above bar center for marker center-Y

// ─── s4 constants ─────────────────────────────────────────────────────────────
const NOW_INTERVAL_MS = 5000;          // how often the live 'now' playhead updates

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

/** A point-in-time event marker on an agent's row (non-SPAWN/COMPLETE ev types). */
interface AgentMarker {
  agentId: string;
  ev: string;
  ts: number;
  seq: number;
  edgeLabel: string;
}

/** State for the FF7 tooltip panel. SVG-relative coordinates. */
interface TooltipState {
  bar: AgentBar;
  svgX: number;        // center x of the hovered bar in SVG coords
  svgY: number;        // top y of the hovered bar row in SVG coords
  roleColor: string;   // materia color token for the MateriaDot
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

/**
 * Resolve role color from AGENT_MATERIA for a given agentId.
 * Matches by prefix (the part before the first '#' or digit suffix).
 * Unknown prefixes fall back to DEFAULT_MATERIA.color = var(--wm).
 */
function roleColor(agentId: string): string {
  // agent_id format: "frontend-engineer#2" or "orchestrator" or "ORC#1"
  // Strip trailing #N suffix and normalise to lower-kebab
  const base = agentId.replace(/#\d+$/, '').toLowerCase();
  const entry = AGENT_MATERIA[base];
  return entry ? entry.color : DEFAULT_MATERIA.color;
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

/**
 * Build point-in-time markers for all non-SPAWN/COMPLETE events that are
 * attributed to one of the selectedAgentIds.
 *
 * feedback_loops: CRITIQUE_BLOCK and AUDIT_FAIL are rendered here as point
 * markers only. Counting is done by SEAM-04 (session-stats.ts) — NOT here.
 */
function buildMarkers(
  events: EventLogEntry[],
  selectedAgentIds: string[],
): AgentMarker[] {
  const agentIdSet = new Set(selectedAgentIds);
  const markers: AgentMarker[] = [];

  for (const e of events) {
    // Skip the two ev types that map to the bar rect — they are already rendered
    if (e.ev === 'SPAWN' || e.ev === 'COMPLETE') continue;
    if (!agentIdSet.has(e.agent_id)) continue;

    markers.push({
      agentId: e.agent_id,
      ev: e.ev,
      ts: new Date(e.ts).getTime(),
      seq: e.seq,
      edgeLabel: e.edge_label ?? '',
    });
  }

  return markers;
}

// ─── SEAM-06 marker encoding helpers ─────────────────────────────────────────

/**
 * Map ev type to FF7 CSS token string (fill/stroke color).
 * Role-to-color mapping is deferred to s4/SEAM-03.
 * This maps ev SEMANTIC CATEGORY → token only.
 */
function evColor(ev: string): string {
  switch (ev) {
    case 'AUDIT_PASS':
    case 'CRITIQUE_PASS':
    case 'REQVAL_COVERED':
    case 'REQVAL_RESOLVED':
      return 'var(--mg)';     // green — pass/covered
    case 'AUDIT_FAIL':
    case 'FAIL':
    case '_GAP_UNRECOVERABLE':
      return 'var(--redb)';   // red — failure
    case 'CRITIQUE_BLOCK':
    case 'DISPATCH_BLOCKED':
      return 'var(--my)';     // yellow — blocked/warn
    case 'RESUME':
    case 'COMMIT':
    case 'PUSH':
    case 'BACKFILL_SCAN':
      return 'var(--mb)';     // blue — progress/action
    case 'RATIFICATION':
    case 'POLICY_RATIFIED':
    case 'GATE':
    case 'GATE_EXIT':
    case 'GATE_RATIFY':
    case 'GATE_RUN_PASS':
    case 'GATE_RUN_COVERED':
      return 'var(--mp)';     // purple — governance
    case 'NOTE':
    case 'PM_PREFLIGHT':
    case 'GAP_REQUEST':
    case 'HONE_SESSION':
    case 'POST_MORTEM':
    case 'JIDOKA_PASS':
    case 'JIDOKA_REPLAN':
    case 'JIDOKA_REPARTITION':
    case 'GHOST_CONFIRMED':
    case 'REQVAL':
    case 'DECISION_BRIEF_REVIEW_PASS_WITH_WARNINGS':
      return 'var(--mo)';     // orange — informational
    default:
      return 'var(--wm)';     // muted — unknown ev type
  }
}

/**
 * Accessible short label for an ev type.
 * Used in aria-label.
 */
function evLabel(ev: string): string {
  const map: Record<string, string> = {
    AUDIT_PASS:       'Audit pass',
    AUDIT_FAIL:       'Audit fail',
    CRITIQUE_PASS:    'Critique pass',
    CRITIQUE_BLOCK:   'Critique block',
    RESUME:           'Resumed',
    FAIL:             'Failed',
    COMMIT:           'Commit',
    PUSH:             'Push',
    RATIFICATION:     'Ratification',
    POLICY_RATIFIED:  'Policy ratified',
    REQVAL_COVERED:   'Reqval covered',
    REQVAL_RESOLVED:  'Reqval resolved',
    REQVAL:           'Reqval',
    NOTE:             'Note',
    PM_PREFLIGHT:     'PM preflight',
    GAP_REQUEST:      'Gap request',
    GATE:             'Gate',
    GATE_EXIT:        'Gate exit',
    GATE_RATIFY:      'Gate ratify',
    GATE_RUN_PASS:    'Gate run pass',
    GATE_RUN_COVERED: 'Gate run covered',
    GHOST_CONFIRMED:  'Ghost confirmed',
    BACKFILL_SCAN:    'Backfill scan',
    HONE_SESSION:     'Hone session',
    POST_MORTEM:      'Post-mortem',
    DISPATCH_BLOCKED: 'Dispatch blocked',
    JIDOKA_PASS:      'Jidoka pass',
    JIDOKA_REPLAN:    'Jidoka replan',
    JIDOKA_REPARTITION: 'Jidoka repartition',
    DECISION_BRIEF_REVIEW_PASS_WITH_WARNINGS: 'Decision brief pass (w/ warnings)',
    _GAP_UNRECOVERABLE: 'Gap unrecoverable',
  };
  return map[ev] ?? ev;
}

/**
 * Render a single marker SVG element at (cx, cy).
 * Shape encodes ev type per the SEAM-06 contract table.
 * All shapes use the same MARKER_SIZE constant.
 * No inline style= on elements with overlapping Tailwind (SVG attrs only).
 */
function MarkerShape({
  ev,
  cx,
  cy,
  color,
  testId,
}: {
  ev: string;
  cx: number;
  cy: number;
  color: string;
  testId: string;
}): React.JSX.Element {
  const s = MARKER_SIZE;

  switch (ev) {
    // Diamond — AUDIT_FAIL, FAIL, _GAP_UNRECOVERABLE
    case 'AUDIT_FAIL':
    case 'FAIL':
    case '_GAP_UNRECOVERABLE':
      return (
        <polygon
          points={`${cx},${cy - s} ${cx + s},${cy} ${cx},${cy + s} ${cx - s},${cy}`}
          fill={color}
          data-testid={testId}
          aria-hidden="true"
        />
      );

    // Circle — AUDIT_PASS
    case 'AUDIT_PASS':
      return (
        <circle
          cx={cx}
          cy={cy}
          r={s}
          fill={color}
          data-testid={testId}
          aria-hidden="true"
        />
      );

    // Up-triangle — CRITIQUE_PASS, REQVAL_COVERED, REQVAL_RESOLVED
    case 'CRITIQUE_PASS':
    case 'REQVAL_COVERED':
    case 'REQVAL_RESOLVED':
      return (
        <polygon
          points={`${cx},${cy - s} ${cx + s},${cy + s} ${cx - s},${cy + s}`}
          fill={color}
          data-testid={testId}
          aria-hidden="true"
        />
      );

    // Down-triangle — CRITIQUE_BLOCK, DISPATCH_BLOCKED
    case 'CRITIQUE_BLOCK':
    case 'DISPATCH_BLOCKED':
      return (
        <polygon
          points={`${cx},${cy + s} ${cx + s},${cy - s} ${cx - s},${cy - s}`}
          fill={color}
          data-testid={testId}
          aria-hidden="true"
        />
      );

    // Right-arrow — RESUME, BACKFILL_SCAN
    case 'RESUME':
    case 'BACKFILL_SCAN':
      return (
        <polygon
          points={`${cx - s},${cy - s} ${cx + s},${cy} ${cx - s},${cy + s}`}
          fill={color}
          data-testid={testId}
          aria-hidden="true"
        />
      );

    // Small square — COMMIT, PUSH
    case 'COMMIT':
    case 'PUSH':
      return (
        <rect
          x={cx - s + 1}
          y={cy - s + 1}
          width={(s - 1) * 2}
          height={(s - 1) * 2}
          fill={color}
          data-testid={testId}
          aria-hidden="true"
        />
      );

    // Dashed circle — RATIFICATION, POLICY_RATIFIED, GATE, GATE_EXIT, GATE_RATIFY, GATE_RUN_*
    case 'RATIFICATION':
    case 'POLICY_RATIFIED':
    case 'GATE':
    case 'GATE_EXIT':
    case 'GATE_RATIFY':
    case 'GATE_RUN_PASS':
    case 'GATE_RUN_COVERED':
      return (
        <circle
          cx={cx}
          cy={cy}
          r={s}
          fill="none"
          stroke={color}
          strokeWidth={1.5}
          strokeDasharray="3 2"
          data-testid={testId}
          aria-hidden="true"
        />
      );

    // Default — small dot for NOTE, PM_PREFLIGHT, GAP_REQUEST, etc.
    default:
      return (
        <circle
          cx={cx}
          cy={cy}
          r={Math.max(2, s - 2)}
          fill={color}
          data-testid={testId}
          aria-hidden="true"
        />
      );
  }
}

// ─── Zoom constants ───────────────────────────────────────────────────────────
const ZOOM_STEP = 1.5;
const ZOOM_MIN = 0.25;
const ZOOM_MAX = 4.0;

// ─── FF7 Tooltip Panel ───────────────────────────────────────────────────────
/**
 * FF7-styled tooltip panel. Positioned absolutely over the SVG scroller.
 * Replaces native SVG <title> as the rich tooltip surface.
 * Accessible name is preserved via aria-label on the parent g[role=img].
 * This panel itself is aria-hidden — it is decorative supplemental info.
 */
function FF7TooltipPanel({
  tooltip,
  axisUnit,
  tAxisMin,
}: {
  tooltip: TooltipState;
  axisUnit: AxisUnit;
  tAxisMin: number;
}): React.JSX.Element {
  const { bar, svgX, svgY, roleColor: color } = tooltip;
  const durationLabel = bar.isOrphan
    ? 'in progress'
    : formatDuration((bar.completeTs as number) - bar.spawnTs);
  const spawnOffsetLabel = formatOffset(bar.spawnTs - tAxisMin, axisUnit);

  // Position tooltip above the bar — offset from SVG coords.
  // Tooltip anchors at bar center-x, above the row.
  const tooltipLeft = Math.max(4, svgX - 100);
  const tooltipTop = Math.max(0, svgY - 72);

  return (
    <div
      aria-hidden="true"
      data-testid="timeline-tooltip"
      style={{
        position: 'absolute',
        left: tooltipLeft,
        top: tooltipTop,
        width: 200,
        background: 'var(--sfh)',
        border: '1px solid var(--bdb)',
        borderRadius: 'var(--rl)',
        padding: '6px 8px',
        fontFamily: 'var(--fm)',
        fontSize: '11px',
        color: 'var(--wd)',
        pointerEvents: 'none',
        zIndex: 10,
        boxShadow: 'var(--gt)',
      }}
    >
      {/* Header with MateriaDot + agent ID */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          marginBottom: '4px',
          paddingBottom: '4px',
          borderBottom: '1px solid var(--bd)',
        }}
      >
        {/* MateriaDot — 16×16 role-colored circle */}
        <span
          aria-hidden="true"
          style={{
            display: 'inline-block',
            width: 10,
            height: 10,
            borderRadius: '50%',
            background: color,
            flexShrink: 0,
          }}
        />
        <span
          style={{
            color: 'var(--w)',
            fontWeight: 600,
            fontSize: '11px',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {bar.agentId}
        </span>
      </div>
      {/* Body — edge label, seq, offset, duration */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
        <div>
          <span style={{ color: 'var(--wm)' }}>edge: </span>
          <span style={{ color: 'var(--mt)' }}>{bar.edgeLabel}</span>
        </div>
        <div>
          <span style={{ color: 'var(--wm)' }}>seq: </span>
          <span>{bar.spawnSeq}</span>
        </div>
        <div>
          <span style={{ color: 'var(--wm)' }}>start: </span>
          <span>{spawnOffsetLabel}</span>
        </div>
        <div>
          <span style={{ color: 'var(--wm)' }}>dur: </span>
          <span style={{ color: bar.isOrphan ? 'var(--my)' : 'var(--mg)' }}>
            {durationLabel}
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function AgentTimeline({
  events,
  selectedAgentIds,
  className,
}: AgentTimelineProps): React.JSX.Element {
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState<number>(600);
  const [zoomLevel, setZoomLevel] = useState<number>(1.0);

  // Live 'now' playhead — updates every NOW_INTERVAL_MS
  const [nowTs, setNowTs] = useState<number>(() => Date.now());

  // FF7 tooltip state — null means hidden
  const [tooltipState, setTooltipState] = useState<TooltipState | null>(null);

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

  // Live playhead ticker
  useEffect(() => {
    const id = setInterval(() => setNowTs(Date.now()), NOW_INTERVAL_MS);
    return () => clearInterval(id);
  }, []);

  // ── Stable tooltip handlers (extract to named functions — no deduplication issue) ──
  const showTooltip = useCallback(
    (bar: AgentBar, svgX: number, svgY: number, color: string) => {
      setTooltipState({ bar, svgX, svgY, roleColor: color });
    },
    [],
  );

  const hideTooltip = useCallback(() => {
    setTooltipState(null);
  }, []);

  // ── Data preparation ──────────────────────────────────────────────────────
  const bars = buildBars(events, selectedAgentIds);
  const markers = buildMarkers(events, selectedAgentIds);

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
  // tAxisMax must cover all data points — include spawn timestamps so that
  // agents spawning after the last COMPLETE event still render within the axis range.
  const tAxisMax =
    allCompleteTs.length > 0
      ? Math.max(Math.max(...allCompleteTs), Math.max(...allSpawnTs))
      : Math.max(...allSpawnTs) + 1;
  const tAxisRange = tAxisMax - tAxisMin || 1;

  // ── Adaptive unit (Requirement B) — derived once from total range ─────────
  const axisUnit = deriveUnit(tAxisRange);

  // ── Content width computation (Requirement A + zoom) ─────────────────────
  // Cap the BASE area first (MAX_BAR_AREA) so multi-day sessions don't produce
  // a 50 000px SVG at zoom 1.0.  zoomLevel then scales RELATIVE to that capped
  // base, keeping zoom=1.0 identical to the pre-zoom HEAD behavior.
  const rangeSeconds = tAxisRange / 1000;
  const baseBarArea = Math.min(rangeSeconds * PX_PER_SECOND * 100, MAX_BAR_AREA);
  const contentBarArea = Math.max(MIN_BAR_AREA, baseBarArea * zoomLevel);
  // contentWidth is never less than the measured container (no regression for
  // short sessions) but may exceed it for wide sessions → SVG scrolls.
  const contentWidth = Math.max(containerWidth, LABEL_COL_WIDTH + contentBarArea);
  const contentBarAreaActual = contentWidth - LABEL_COL_WIDTH;
  // Fold RIGHT_PAD inside the plot area so data ends RIGHT_PAD before the SVG right edge.
  // svg width = contentWidth is UNCHANGED — no scrollbar introduced for short sessions.
  const plotAreaWidth = Math.max(MIN_BAR_AREA, contentBarAreaActual - RIGHT_PAD);
  const plotRight = LABEL_COL_WIDTH + plotAreaWidth;

  const nRows = bars.length;
  const svgHeight = TOP_PAD + nRows * ROW_HEIGHT + AXIS_HEIGHT;

  // Normalise x position / width to plot area (plotAreaWidth, not contentBarAreaActual).
  // tAxisMax maps to plotRight (= LABEL_COL_WIDTH + plotAreaWidth), which is RIGHT_PAD
  // before the SVG right edge (contentWidth). This prevents bar and tick clipping.
  function normX(ts: number): number {
    return LABEL_COL_WIDTH + ((ts - tAxisMin) / tAxisRange) * plotAreaWidth;
  }

  // ── Live playhead position ─────────────────────────────────────────────────
  // Show playhead only if 'now' falls within the visible axis range
  const showPlayhead = nowTs >= tAxisMin && nowTs <= tAxisMax + tAxisRange * 0.1;
  const playheadX = showPlayhead
    ? Math.min(normX(nowTs), plotRight)
    : null;

  // ── Tick labels ───────────────────────────────────────────────────────────
  const ticks: { x: number; label: string }[] = [];
  for (let i = 0; i <= TICK_COUNT; i++) {
    const frac = i / TICK_COUNT;
    ticks.push({
      x: LABEL_COL_WIDTH + frac * plotAreaWidth,
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

  // ── Group markers by agentId for O(1) lookup during render ───────────────
  const markersByAgent = new Map<string, AgentMarker[]>();
  for (const m of markers) {
    const list = markersByAgent.get(m.agentId) ?? [];
    list.push(m);
    markersByAgent.set(m.agentId, list);
  }

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
      {/* Zoom controls — plain div, FF7 tokens, no Shadcn */}
      <div
        aria-label="Zoom in/out timeline"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '6px 10px',
          borderBottom: '1px solid var(--bd)',
          fontFamily: 'var(--fm)',
          fontSize: '12px',
          color: 'var(--wd)',
        }}
      >
        <button
          type="button"
          aria-label="Zoom out timeline"
          disabled={zoomLevel <= ZOOM_MIN}
          onClick={() => setZoomLevel((prev) => Math.max(ZOOM_MIN, prev / ZOOM_STEP))}
          style={{
            background: 'var(--sfh)',
            color: 'var(--w)',
            border: '1px solid var(--bd)',
            fontFamily: 'var(--fm)',
            fontSize: '14px',
            lineHeight: 1,
            padding: '2px 8px',
            cursor: zoomLevel <= ZOOM_MIN ? 'not-allowed' : 'pointer',
            opacity: zoomLevel <= ZOOM_MIN ? 0.4 : 1,
            borderRadius: '3px',
          }}
        >
          −
        </button>
        <span
          aria-live="polite"
          aria-atomic="true"
          style={{ minWidth: '42px', textAlign: 'center' }}
        >
          {Math.round(zoomLevel * 100)}%
        </span>
        <button
          type="button"
          aria-label="Zoom in timeline"
          disabled={zoomLevel >= ZOOM_MAX}
          onClick={() => setZoomLevel((prev) => Math.min(ZOOM_MAX, prev * ZOOM_STEP))}
          style={{
            background: 'var(--sfh)',
            color: 'var(--w)',
            border: '1px solid var(--bd)',
            fontFamily: 'var(--fm)',
            fontSize: '14px',
            lineHeight: 1,
            padding: '2px 8px',
            cursor: zoomLevel >= ZOOM_MAX ? 'not-allowed' : 'pointer',
            opacity: zoomLevel >= ZOOM_MAX ? 0.4 : 1,
            borderRadius: '3px',
          }}
        >
          +
        </button>
        {/* SEAM-06 legend — compact inline */}
        <span
          aria-hidden="true"
          style={{
            marginLeft: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontSize: '10px',
            color: 'var(--wm)',
          }}
        >
          <svg width={10} height={10} aria-hidden="true" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
            <circle cx={5} cy={5} r={4} fill="var(--mg)" />
          </svg>pass
          <svg width={10} height={10} aria-hidden="true" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
            <polygon points="5,1 9,9 1,9" fill="var(--my)" />
          </svg>block
          <svg width={10} height={10} aria-hidden="true" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
            <polygon points="5,1 9,9 1,9" fill="var(--redb)" />
          </svg>fail
          <svg width={10} height={10} aria-hidden="true" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
            <polygon points="1,5 5,1 9,5 5,9" fill="var(--redb)" />
          </svg>audit-fail
          <svg width={10} height={10} aria-hidden="true" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
            <polygon points="1,5 9,1 9,9" fill="var(--mb)" />
          </svg>resume
        </span>
      </div>

      {/* Horizontal scroller — SVG may exceed containerWidth for wide sessions.
          position:relative enables absolute-position FF7 tooltip overlay. */}
      <div
        ref={scrollerRef}
        data-testid="agent-timeline-scroller"
        style={{ overflowX: 'auto', position: 'relative' }}
      >
        {/* FF7 tooltip panel — rendered outside SVG, over scroller */}
        {tooltipState !== null && (
          <FF7TooltipPanel
            tooltip={tooltipState}
            axisUnit={axisUnit}
            tAxisMin={tAxisMin}
          />
        )}

        <svg
          width={contentWidth}
          height={svgHeight}
          role="img"
          aria-label={svgAriaLabel}
          tabIndex={0}
          style={{ display: 'block' }}
          data-testid="agent-timeline-svg"
          onMouseLeave={hideTooltip}
        >
          {/* ── X-axis baseline ── */}
          <line
            x1={LABEL_COL_WIDTH}
            y1={axisBaselineY}
            x2={plotRight}
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

          {/* ── Live 'now' playhead — decorative, aria-hidden ── */}
          {playheadX !== null && (
            <line
              x1={playheadX}
              y1={TOP_PAD}
              x2={playheadX}
              y2={axisBaselineY}
              stroke="var(--mt)"
              strokeWidth={1.5}
              strokeDasharray="3 3"
              aria-hidden="true"
              data-testid="timeline-playhead"
              className="timeline-playhead"
            />
          )}

          {/* ── Per-agent rows ── */}
          {bars.map((bar, rowIndex) => {
            const rowTop = TOP_PAD + rowIndex * ROW_HEIGHT;
            const rowCenterY = rowTop + ROW_HEIGHT / 2;
            const barY = rowCenterY - BAR_HEIGHT / 2;

            // Bar x / width — use plotRight for orphan right-edge (RIGHT_PAD before SVG edge)
            const barX = normX(bar.spawnTs);
            const barEndX = bar.isOrphan
              ? plotRight
              : normX(bar.completeTs as number);
            const rawWidth = barEndX - barX;
            const barWidth = Math.max(rawWidth, MIN_BAR_WIDTH);

            // Duration label for aria
            const durationLabel = bar.isOrphan
              ? 'in progress'
              : formatDuration((bar.completeTs as number) - bar.spawnTs);

            // Spawn offset uses the axis unit for consistency (Requirement B)
            const spawnOffsetLabel = formatOffset(bar.spawnTs - tAxisMin, axisUnit);

            const barAriaLabel = `${bar.agentId}: ${bar.edgeLabel}, spawned ${spawnOffsetLabel}, ${durationLabel}.`;

            // Role color from AGENT_MATERIA canonical map
            const barRoleColor = roleColor(bar.agentId);

            // Bar center x for tooltip positioning
            const barCenterX = barX + barWidth / 2;

            // Markers for this agent
            const agentMarkers = markersByAgent.get(bar.agentId) ?? [];

            // Marker lane center-Y: above the bar rect
            const markerCY = barY - MARKER_LANE_OFFSET;

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

                {/* Bar group — keyboard-focusable; aria-label preserves accessible name.
                    Native <title> removed in s4; FF7TooltipPanel replaces as rich hover/focus
                    tooltip. Accessible name is on g[role=img] aria-label — no regression.
                    aria-describedby wires to the tooltip when visible. */}
                <g
                  role="img"
                  tabIndex={0}
                  aria-label={barAriaLabel}
                  data-testid={`timeline-bar-${bar.agentId}`}
                  data-orphan={bar.isOrphan ? 'true' : 'false'}
                  onMouseEnter={() => showTooltip(bar, barCenterX, barY, barRoleColor)}
                  onFocus={() => showTooltip(bar, barCenterX, barY, barRoleColor)}
                  onMouseLeave={hideTooltip}
                  onBlur={hideTooltip}
                >
                  {bar.isOrphan ? (
                    /* Orphan bar: marching-ants dash animation via .timeline-orphan-march class.
                       Role color used as stroke. strokeDasharray preserved as static fallback
                       (reduced-motion: animation:none keeps dasharray visible). */
                    <rect
                      x={barX}
                      y={barY}
                      width={barWidth}
                      height={BAR_HEIGHT}
                      rx={2}
                      fill="none"
                      stroke={barRoleColor}
                      strokeWidth={1.5}
                      strokeDasharray="4 3"
                      data-testid={`timeline-bar-rect-${bar.agentId}`}
                      className="timeline-orphan-march"
                    />
                  ) : (
                    /* Completed bar: role-colored fill; staggered entrance via
                       .timeline-bar-enter + --bar-index CSS custom property. */
                    <rect
                      x={barX}
                      y={barY}
                      width={barWidth}
                      height={BAR_HEIGHT}
                      rx={2}
                      fill={barRoleColor}
                      data-testid={`timeline-bar-rect-${bar.agentId}`}
                      className="timeline-bar-enter"
                      style={{ '--bar-index': rowIndex } as React.CSSProperties}
                    />
                  )}
                </g>

                {/* ── Event markers (SEAM-06) ── */}
                {agentMarkers.map((marker) => {
                  // Clamp marker to plot area — never beyond plotRight (RIGHT_PAD preserved)
                  const mx = Math.min(normX(marker.ts), plotRight);
                  const color = evColor(marker.ev);
                  const label = evLabel(marker.ev);
                  const offsetLabel = formatOffset(marker.ts - tAxisMin, axisUnit);
                  const markerAriaLabel = `${label} — ${bar.agentId} at ${offsetLabel} (seq ${marker.seq})`;
                  const markerTestId = `timeline-marker-${bar.agentId}-${marker.ev}-${marker.seq}`;

                  return (
                    <g
                      key={`${marker.ev}-${marker.seq}`}
                      role="img"
                      tabIndex={0}
                      aria-label={markerAriaLabel}
                      data-testid={`timeline-marker-group-${bar.agentId}-${marker.ev}-${marker.seq}`}
                      data-ev={marker.ev}
                    >
                      <MarkerShape
                        ev={marker.ev}
                        cx={mx}
                        cy={markerCY}
                        color={color}
                        testId={markerTestId}
                      />
                    </g>
                  );
                })}
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
