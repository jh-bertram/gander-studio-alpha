import { create } from 'zustand';
import type { Session } from '@gander-studio/shared';

export type MetricKey = 'spawns' | 'feedback_loops' | 'wall_clock_ms';

const ALL_METRICS: MetricKey[] = ['spawns', 'feedback_loops', 'wall_clock_ms'];

export interface AnalyzeState {
  selectedSessionId: string | null;
  selectedAgentIds: string[];
  selectedMetrics: MetricKey[];

  setSelectedSessionId: (id: string | null) => void;
  setSelectedAgentIds: (ids: string[]) => void;
  toggleAgentId: (agentId: string) => void;
  setSelectedMetrics: (metrics: MetricKey[]) => void;
  toggleMetric: (metric: MetricKey) => void;
  resetToSession: (session: Session) => void;
}

export const useAnalyzeStore = create<AnalyzeState>()((set) => ({
  selectedSessionId: null,
  selectedAgentIds: [],
  selectedMetrics: [...ALL_METRICS],

  setSelectedSessionId: (selectedSessionId) => set({ selectedSessionId }),

  setSelectedAgentIds: (selectedAgentIds) => set({ selectedAgentIds }),

  toggleAgentId: (agentId) =>
    set((state) => ({
      selectedAgentIds: state.selectedAgentIds.includes(agentId)
        ? state.selectedAgentIds.filter((id) => id !== agentId)
        : [...state.selectedAgentIds, agentId],
    })),

  setSelectedMetrics: (selectedMetrics) => set({ selectedMetrics }),

  toggleMetric: (metric) =>
    set((state) => ({
      selectedMetrics: state.selectedMetrics.includes(metric)
        ? state.selectedMetrics.filter((m) => m !== metric)
        : [...state.selectedMetrics, metric],
    })),

  resetToSession: (session) =>
    set({
      selectedSessionId: session.id,
      selectedAgentIds: session.agents.map((a) => a.agent_id),
      selectedMetrics: [...ALL_METRICS],
    }),
}));
