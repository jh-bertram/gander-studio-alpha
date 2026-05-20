import type { Session } from '@gander-studio/shared';
import { trpc } from '../trpc';

export interface SessionsData {
  sessions:  Session[];
  isLoading: boolean;
  error:     unknown;
}

/** Fetch the session list. Unwraps the { sessions, skipped } envelope from session.list. */
export function useSessions(): SessionsData {
  const query = trpc.session.list.useQuery({ limit: 50 });

  const sessions = query.data?.sessions ?? [];

  return {
    sessions,
    isLoading: query.isLoading,
    error:     query.error ?? null,
  };
}

/** Fetch a single session by id. session.get returns a bare object — no envelope unwrap. */
export function useSessionDetail(id: string): {
  session:   Session | undefined;
  isLoading: boolean;
  error:     unknown;
} {
  const query = trpc.session.get.useQuery({ id });

  return {
    session:   query.data,
    isLoading: query.isLoading,
    error:     query.error ?? null,
  };
}
