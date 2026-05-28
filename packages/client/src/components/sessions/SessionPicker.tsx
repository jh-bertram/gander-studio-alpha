import type { CSSProperties } from 'react';
import type { SessionStats } from '@gander-studio/shared';
import { useAnalyzeStore, type MetricKey } from '../../store/analyzeStore';

// Human-readable labels for metric keys
const METRIC_LABELS: Record<MetricKey, string> = {
  spawns: 'Spawns',
  feedback_loops: 'Feedback Loops',
  wall_clock_ms: 'Wall Clock',
};

const ALL_METRICS: MetricKey[] = ['spawns', 'feedback_loops', 'wall_clock_ms'];

interface SessionPickerProps {
  stats: SessionStats;
}

// Shared styles (plain objects — no Shadcn primitives; FF7 tokens via CSS custom properties)
const sectionLabelStyle: CSSProperties = {
  color: 'var(--wm)',
  fontFamily: 'var(--fb)',
  fontSize: '10px',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.18em',
  marginBottom: '8px',
};

const toggleButtonStyle = (isActive: boolean): CSSProperties => ({
  padding: '4px 10px',
  fontSize: '11px',
  fontFamily: 'var(--fb)',
  color: isActive ? 'var(--mt)' : 'var(--wd)',
  background: 'var(--sfh)',
  border: `1px solid ${isActive ? 'var(--bdb)' : 'var(--bd)'}`,
  borderRadius: 'var(--r)',
  cursor: 'pointer',
  fontWeight: isActive ? 600 : 400,
  outline: 'none',
});

function handleToggleKeyDown(
  e: React.KeyboardEvent<HTMLButtonElement>,
  handler: () => void,
): void {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault();
    handler();
  }
}

export default function SessionPicker({ stats }: SessionPickerProps) {
  const {
    selectedSessionId,
    selectedAgentIds,
    selectedMetrics,
    setSelectedAgentIds,
    toggleAgentId,
    toggleMetric,
  } = useAnalyzeStore();

  const allAgentIds = stats.agents.map((a) => a.agent_id);
  const allSelected = allAgentIds.length > 0 && allAgentIds.every((id) => selectedAgentIds.includes(id));
  const noneSelected = selectedAgentIds.length === 0;

  function handleSelectAll(): void {
    setSelectedAgentIds(allAgentIds);
  }

  function handleSelectNone(): void {
    setSelectedAgentIds([]);
  }

  return (
    <div
      role="region"
      aria-label="Analysis configuration"
      data-testid="session-picker"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        background: 'var(--sfm)',
        border: '1px solid var(--bd)',
        borderRadius: 'var(--rl)',
        padding: '16px 18px',
        minWidth: '200px',
        maxWidth: '260px',
      }}
    >
      {/* Session confirm row — read-only label (cross-session swap is OOS) */}
      <div>
        <div style={sectionLabelStyle}>Session</div>
        <div
          data-testid="session-picker-session-label"
          style={{
            color: 'var(--mt)',
            fontFamily: 'var(--fm)',
            fontSize: '12px',
            wordBreak: 'break-all',
          }}
        >
          {selectedSessionId ?? stats.session_id}
        </div>
      </div>

      {/* Agent multi-select */}
      <div role="group" aria-label="Agent selection">
        <div style={sectionLabelStyle}>Agents</div>

        {/* All / None toggles */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
          <button
            type="button"
            aria-label="Select all agents"
            aria-pressed={allSelected}
            style={toggleButtonStyle(allSelected)}
            onClick={handleSelectAll}
            onKeyDown={(e) => handleToggleKeyDown(e, handleSelectAll)}
            data-testid="session-picker-all-toggle"
          >
            All
          </button>
          <button
            type="button"
            aria-label="Deselect all agents"
            aria-pressed={noneSelected}
            style={toggleButtonStyle(noneSelected)}
            onClick={handleSelectNone}
            onKeyDown={(e) => handleToggleKeyDown(e, handleSelectNone)}
            data-testid="session-picker-none-toggle"
          >
            None
          </button>
        </div>

        {/* Per-agent checkboxes */}
        <div
          style={{
            maxHeight: '160px',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '2px',
          }}
        >
          {stats.agents.map((agent) => {
            const checked = selectedAgentIds.includes(agent.agent_id);
            const checkboxId = `agent-checkbox-${agent.agent_id}`;
            return (
              <div
                key={agent.agent_id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  height: '28px',
                  padding: '0 4px',
                  borderRadius: 'var(--r)',
                  background: 'transparent',
                }}
              >
                <input
                  id={checkboxId}
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggleAgentId(agent.agent_id)}
                  aria-checked={checked}
                  data-agent-id={agent.agent_id}
                  data-testid={`agent-checkbox-${agent.agent_id}`}
                  style={{
                    accentColor: 'var(--mt)',
                    cursor: 'pointer',
                    flexShrink: 0,
                  }}
                />
                <label
                  htmlFor={checkboxId}
                  style={{
                    color: 'var(--wd)',
                    fontSize: '12px',
                    fontFamily: 'var(--fm)',
                    cursor: 'pointer',
                    flex: 1,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {agent.agent_id}
                </label>
                <span
                  aria-hidden="true"
                  style={{
                    color: 'var(--wm)',
                    fontSize: '11px',
                    fontFamily: 'var(--fm)',
                    flexShrink: 0,
                  }}
                >
                  ×{agent.spawns}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Metric toggles */}
      <div role="group" aria-label="Metric dimensions">
        <div style={sectionLabelStyle}>Metrics</div>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '2px',
          }}
        >
          {ALL_METRICS.map((metric) => {
            const checked = selectedMetrics.includes(metric);
            const checkboxId = `metric-checkbox-${metric}`;
            return (
              <div
                key={metric}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  height: '28px',
                  padding: '0 4px',
                  borderRadius: 'var(--r)',
                }}
              >
                <input
                  id={checkboxId}
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggleMetric(metric)}
                  aria-checked={checked}
                  data-metric-key={metric}
                  data-testid={`metric-checkbox-${metric}`}
                  style={{
                    accentColor: 'var(--mt)',
                    cursor: 'pointer',
                    flexShrink: 0,
                  }}
                />
                <label
                  htmlFor={checkboxId}
                  style={{
                    color: 'var(--wd)',
                    fontSize: '12px',
                    fontFamily: 'var(--fm)',
                    cursor: 'pointer',
                  }}
                >
                  {METRIC_LABELS[metric]}
                </label>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
