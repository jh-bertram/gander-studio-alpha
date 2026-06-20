/**
 * PlanningPage — Sprint backlog browser.
 * Consumes trpc.planning.list which parses docs/deferred-work.md + docs/task-registry.md.
 *
 * LEGIBILITY SC (SC7): readable status/role labels, AA contrast (var(--) tokens),
 * managed density via collapsible sprint groups with drill-down.
 * A11Y: role="list"/role="listitem" hierarchy; aria-expanded on sprint headers;
 * keyboard toggle (Enter/Space) on collapsible groups.
 *
 * Zustand safety: no Zustand consumed here — no render-loop risk.
 * All local state is primitive (Set<string> for expanded, stable updaters via useCallback).
 */
import React, { useState, useCallback, useMemo } from 'react';
import { trpc } from '../trpc';
import type { PlanningSprint, PlanningItem } from '@gander-studio/shared';

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

/** Maps item kind to badge color token */
const KIND_COLOR: Record<PlanningItem['kind'], string> = {
  deferred:      'var(--my)',   // materia yellow — deferred/pending
  done:          'var(--mg)',   // materia green — resolved
  'sprint-goal': 'var(--mt)',  // mako teal — current sprint goal
  'sprint-task': 'var(--mb)',  // materia blue — sprint task
};

/** Maps item kind to display label */
const KIND_LABEL: Record<PlanningItem['kind'], string> = {
  deferred:      'DEFERRED',
  done:          'DONE',
  'sprint-goal': 'GOAL',
  'sprint-task': 'TASK',
};

/** Status string → accent color */
function statusAccent(status: string | undefined): string {
  if (!status) return 'var(--bd)';
  const lower = status.toLowerCase();
  if (lower.includes('done') || lower.includes('complete') || lower.includes('closed')) return 'var(--mg)';
  if (lower.includes('in-progress') || lower.includes('active')) return 'var(--mt)';
  if (lower.includes('blocked') || lower.includes('fail')) return 'var(--mr)';
  if (lower.includes('deferred')) return 'var(--my)';
  return 'var(--bd)';
}

// ─────────────────────────────────────────────────────────────────────────────
// PlanningItemRow — single backlog item
// ─────────────────────────────────────────────────────────────────────────────
function PlanningItemRow({ item }: { item: PlanningItem }): React.ReactElement {
  const badgeColor = KIND_COLOR[item.kind];
  const badgeLabel = KIND_LABEL[item.kind];

  return (
    <div
      role="listitem"
      style={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: '10px',
        padding: '8px 12px',
        background: 'var(--sf)',
        borderBottom: '1px solid var(--bd)',
        minHeight: '36px',
      }}
    >
      {/* Kind badge */}
      <span
        aria-label={`Item kind: ${badgeLabel}`}
        style={{
          fontFamily: 'var(--fm)',
          fontSize: '9px',
          letterSpacing: '0.1em',
          color: badgeColor,
          background: 'var(--sfm)',
          border: `1px solid ${badgeColor}`,
          borderRadius: 'var(--r)',
          padding: '2px 5px',
          flexShrink: 0,
          marginTop: '1px',
          minWidth: '60px',
          textAlign: 'center',
          whiteSpace: 'nowrap',
        }}
      >
        {badgeLabel}
      </span>

      {/* ID + title */}
      <div style={{ flex: 1, overflow: 'hidden' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'baseline',
            gap: '8px',
            flexWrap: 'wrap',
          }}
        >
          <code
            style={{
              fontFamily: 'var(--fm)',
              fontSize: '12px',
              fontWeight: 600,
              color: 'var(--w)',
              flexShrink: 0,
            }}
          >
            {item.id}
          </code>
          <span
            style={{
              fontFamily: 'var(--fb)',
              fontSize: '12px',
              color: 'var(--wd)',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              flex: 1,
              minWidth: 0,
            }}
            title={item.title}
          >
            {item.title}
          </span>
        </div>

        {/* scheduleAs for deferred items */}
        {item.scheduleAs && (
          <div
            style={{
              fontFamily: 'var(--fb)',
              fontSize: '11px',
              color: 'var(--wm)',
              marginTop: '3px',
            }}
          >
            Schedule as: <em style={{ color: 'var(--my)' }}>{item.scheduleAs}</em>
          </div>
        )}

        {/* Rollback commit for sprint tasks */}
        {item.rollbackCommit && (
          <div
            style={{
              fontFamily: 'var(--fm)',
              fontSize: '10px',
              color: 'var(--wm)',
              marginTop: '3px',
            }}
          >
            rollback: {item.rollbackCommit.slice(0, 8)}
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SprintSection — collapsible group of items for one sprint
// ─────────────────────────────────────────────────────────────────────────────
interface SprintSectionProps {
  sprint: PlanningSprint;
  expanded: boolean;
  onToggle: (sprintId: string) => void;
}

function SprintSection({ sprint, expanded, onToggle }: SprintSectionProps): React.ReactElement {
  const accentColor = statusAccent(sprint.status);
  const doneCount = sprint.items.filter((i) => i.kind === 'done').length;
  const totalCount = sprint.items.length;

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onToggle(sprint.sprint);
      }
    },
    [onToggle, sprint.sprint]
  );

  const handleClick = useCallback(() => {
    onToggle(sprint.sprint);
  }, [onToggle, sprint.sprint]);

  return (
    <div
      role="listitem"
      style={{ marginBottom: '8px' }}
    >
      {/* Sprint header — collapsible trigger */}
      <div
        role="heading"
        aria-level={2}
        style={{ display: 'contents' }}
      >
        <div
          role="button"
          tabIndex={0}
          aria-expanded={expanded}
          aria-controls={`sprint-items-${sprint.sprint}`}
          onClick={handleClick}
          onKeyDown={handleKeyDown}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '10px 12px',
            background: 'var(--sfm)',
            border: '1px solid var(--bd)',
            borderLeft: `3px solid ${accentColor}`,
            borderRadius: 'var(--rl)',
            cursor: 'pointer',
            userSelect: 'none',
            outline: 'none',
            transition: 'background 100ms ease',
          }}
          onFocus={(e) => { (e.currentTarget as HTMLDivElement).style.outline = '2px solid var(--mt)'; }}
          onBlur={(e) => { (e.currentTarget as HTMLDivElement).style.outline = 'none'; }}
        >
          {/* Chevron */}
          <span
            aria-hidden="true"
            style={{
              fontFamily: 'var(--fm)',
              fontSize: '10px',
              color: 'var(--wm)',
              transform: expanded ? 'rotate(90deg)' : 'none',
              transition: 'transform 150ms ease',
              display: 'inline-block',
              flexShrink: 0,
              width: '12px',
            }}
          >
            ▶
          </span>

          {/* Sprint id */}
          <code
            style={{
              fontFamily: 'var(--fm)',
              fontSize: '12px',
              fontWeight: 600,
              color: 'var(--w)',
              flex: 1,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {sprint.sprint}
          </code>

          {/* Status badge */}
          {sprint.status && (
            <span
              style={{
                fontFamily: 'var(--fb)',
                fontSize: '10px',
                color: accentColor,
                background: 'var(--sf)',
                border: `1px solid ${accentColor}`,
                borderRadius: 'var(--r)',
                padding: '2px 6px',
                flexShrink: 0,
                whiteSpace: 'nowrap',
              }}
            >
              {sprint.status}
            </span>
          )}

          {/* Item count */}
          <span
            style={{
              fontFamily: 'var(--fm)',
              fontSize: '10px',
              color: 'var(--wm)',
              flexShrink: 0,
            }}
          >
            {doneCount}/{totalCount}
          </span>
        </div>
      </div>

      {/* Sprint goal text (always visible for context) */}
      {sprint.goal && (
        <div
          style={{
            fontFamily: 'var(--fb)',
            fontSize: '12px',
            color: 'var(--wd)',
            padding: '6px 12px 6px 25px',
            borderLeft: '1px solid var(--bd)',
            marginLeft: '12px',
            lineHeight: 1.5,
          }}
        >
          {sprint.goal}
        </div>
      )}

      {/* Items — shown/hidden based on expanded state */}
      <div
        id={`sprint-items-${sprint.sprint}`}
        role="list"
        aria-label={`Items for sprint ${sprint.sprint}`}
        style={{
          display: expanded ? 'block' : 'none',
          border: '1px solid var(--bd)',
          borderRadius: '0 0 var(--rl) var(--rl)',
          overflow: 'hidden',
          marginTop: '2px',
        }}
      >
        {sprint.items.map((item) => (
          <PlanningItemRow key={item.id} item={item} />
        ))}
        {sprint.items.length === 0 && (
          <div
            style={{
              padding: '12px 16px',
              fontFamily: 'var(--fb)',
              fontSize: '12px',
              color: 'var(--wm)',
              background: 'var(--sf)',
            }}
          >
            No items in this sprint.
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PlanningPage
// ─────────────────────────────────────────────────────────────────────────────
export default function PlanningPage(): React.ReactElement {
  const planQ = trpc.planning.list.useQuery({});

  // Expanded sprint set — primitive Set<string> local state (no Zustand, no new-object selector)
  const [expandedSprints, setExpandedSprints] = useState<Set<string>>(() => new Set<string>());

  const handleToggleSprint = useCallback((sprintId: string) => {
    setExpandedSprints((prev) => {
      const next = new Set(prev);
      if (next.has(sprintId)) {
        next.delete(sprintId);
      } else {
        next.add(sprintId);
      }
      return next;
    });
  }, []);

  // Derived counts — stable via useMemo (depends only on planQ.data, a stable reference)
  const totalItems = useMemo(() => {
    if (!planQ.data) return 0;
    return planQ.data.sprints.reduce((sum, s) => sum + s.items.length, 0);
  }, [planQ.data]);

  const doneItems = useMemo(() => {
    if (!planQ.data) return 0;
    return planQ.data.sprints.reduce(
      (sum, s) => sum + s.items.filter((i) => i.kind === 'done').length,
      0
    );
  }, [planQ.data]);

  // ── Loading
  if (planQ.isLoading) {
    return (
      <div
        role="status"
        aria-live="polite"
        aria-label="Loading planning backlog"
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
        <span
          style={{
            fontFamily: 'var(--fm)',
            fontSize: '13px',
            color: 'var(--wm)',
            letterSpacing: '0.12em',
          }}
        >
          Loading planning backlog…
        </span>
      </div>
    );
  }

  // ── Error
  if (planQ.error) {
    return (
      <div
        role="alert"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '200px',
        }}
      >
        <div
          style={{
            background: 'var(--sfm)',
            border: '1px solid var(--red)',
            borderRadius: 'var(--rl)',
            padding: '24px 28px',
            maxWidth: '420px',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              fontFamily: 'var(--fh)',
              fontSize: '16px',
              fontWeight: 500,
              color: 'var(--redb)',
              letterSpacing: '0.1em',
              marginBottom: '8px',
            }}
          >
            PLANNING UNAVAILABLE
          </div>
          <div
            style={{
              fontFamily: 'var(--fb)',
              fontSize: '13px',
              color: 'var(--wd)',
              lineHeight: 1.55,
            }}
          >
            Planning backlog could not be loaded. Verify docs/deferred-work.md and
            docs/task-registry.md exist in the project root.
          </div>
        </div>
      </div>
    );
  }

  // ── Empty
  if (planQ.data && planQ.data.sprints.length === 0) {
    return (
      <div
        role="status"
        aria-live="polite"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '200px',
        }}
      >
        <div
          style={{
            background: 'var(--sfm)',
            border: '1px solid var(--bd)',
            borderRadius: 'var(--rl)',
            padding: '24px 28px',
            maxWidth: '360px',
            textAlign: 'center',
          }}
        >
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
          <div
            style={{
              fontFamily: 'var(--fh)',
              fontSize: '16px',
              color: 'var(--mt)',
              letterSpacing: '0.1em',
              marginBottom: '8px',
            }}
          >
            NO BACKLOG DATA
          </div>
          <div
            style={{
              fontFamily: 'var(--fb)',
              fontSize: '13px',
              color: 'var(--wd)',
            }}
          >
            No planning items found. Add DEFERRED-NNN entries in docs/deferred-work.md
            or sprint records in docs/task-registry.md.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      {/* Page header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '20px',
          paddingBottom: '16px',
          borderBottom: '1px solid var(--bd)',
          gap: '12px',
          flexWrap: 'wrap',
        }}
      >
        <h1
          style={{
            fontFamily: 'var(--fh)',
            fontSize: '20px',
            fontWeight: 500,
            color: 'var(--w)',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            textShadow: 'var(--title-glow)',
            margin: 0,
          }}
        >
          PLANNING BACKLOG
        </h1>

        {/* Summary stats */}
        {planQ.data && (
          <div
            aria-label="Planning backlog summary"
            style={{ display: 'flex', gap: '16px', alignItems: 'center' }}
          >
            <span
              style={{
                fontFamily: 'var(--fm)',
                fontSize: '11px',
                color: 'var(--mg)',
                letterSpacing: '0.06em',
              }}
            >
              {doneItems} done
            </span>
            <span
              style={{
                fontFamily: 'var(--fm)',
                fontSize: '11px',
                color: 'var(--wm)',
                letterSpacing: '0.06em',
              }}
            >
              {totalItems} total
            </span>
            <span
              style={{
                fontFamily: 'var(--fm)',
                fontSize: '11px',
                color: 'var(--wm)',
                letterSpacing: '0.06em',
              }}
            >
              {planQ.data.sprints.length} sprints
            </span>
            {planQ.data.skipped > 0 && (
              <span
                style={{
                  fontFamily: 'var(--fm)',
                  fontSize: '11px',
                  color: 'var(--mr)',
                  letterSpacing: '0.06em',
                }}
              >
                {planQ.data.skipped} skipped
              </span>
            )}
          </div>
        )}
      </div>

      {/* Sprint list */}
      <div role="list" aria-label="Sprint groups">
        {planQ.data?.sprints.map((sprint) => (
          <SprintSection
            key={sprint.sprint}
            sprint={sprint}
            expanded={expandedSprints.has(sprint.sprint)}
            onToggle={handleToggleSprint}
          />
        ))}
      </div>
    </div>
  );
}
