import type { PartyStats } from '@gander-studio/shared';
import { trpc } from '../trpc';

export interface PartyData {
  data: PartyStats | undefined;
  isLoading: boolean;
  isError: boolean;
  error: unknown;
  refetch: () => void;
}

/**
 * Fetch the party roster envelope via `roster.getParty`.
 *
 * VERIFY-THEN-IMPLEMENT (packet R-7): `roster.getParty` is registered on the server's
 * `rosterRouter` (packages/server/src/router.ts:788-793, `.output(PartyStatsSchema)`, no
 * input) and `packages/client/src/trpc.ts` types its proxy off the SAME `AppRouter` export
 * from `@gander-studio/server` via `createTRPCReact<AppRouter>()` — so `trpc.roster.getParty`
 * is available automatically, with no server/shared edit required. Confirmed live (curl
 * against the running :3001 dev server returned a real 13-member envelope) before writing
 * this hook.
 *
 * Returns the `PartyStats` envelope `{ members, diagnostics, activityAnchor }` typed via
 * `z.infer<typeof PartyStatsSchema>` (imported from `@gander-studio/shared`, never
 * re-declared locally) — matches this repo's existing data-hook pattern
 * (see `hooks/useSessions.ts`, `hooks/useAggregateStats.ts`).
 */
export function useParty(): PartyData {
  const query = trpc.roster.getParty.useQuery();

  return {
    data: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error ?? null,
    refetch: () => {
      void query.refetch();
    },
  };
}
