import type { SessionStats } from '@gander-studio/shared';
import { trpc } from '../trpc';

export interface AggregateStatsData {
  stats:     SessionStats | undefined;
  isLoading: boolean;
  error:     unknown;
}

/**
 * Fetch aggregate stats across multiple sessions.
 * Only fires when selectedSessionIds is non-empty.
 */
export function useAggregateStats(selectedSessionIds: string[]): AggregateStatsData {
  const query = trpc.session.aggregateStats.useQuery(
    { sessionIds: selectedSessionIds },
    { enabled: selectedSessionIds.length > 0 },
  );

  return {
    stats:     query.data,
    isLoading: query.isLoading,
    error:     query.error ?? null,
  };
}
