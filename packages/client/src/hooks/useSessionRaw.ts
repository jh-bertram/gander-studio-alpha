import { useEffect } from 'react';
import { trpc } from '../trpc';
import { useSessionStore } from '../store/session-store';

/**
 * Fetches the raw markdown content of a session by id and seeds the editor store.
 *
 * On data arrival:
 *   - Always sets originalContent (used for diff / revert).
 *   - Sets editBuffer ONLY when the current buffer is empty (SC6 — never overwrite user edits).
 *
 * The store updates run in a useEffect keyed on the query data object,
 * matching the hook pattern used elsewhere in this package (avoids deprecated
 * react-query v4 onSuccess; safe under react-query v5).
 *
 * Returns { isLoading, error } for callers to render loading/error states.
 */
export function useSessionRaw(id: string | null): {
  isLoading: boolean;
  error: unknown;
} {
  const setOriginalContent = useSessionStore((s) => s.setOriginalContent);
  const setEditBuffer = useSessionStore((s) => s.setEditBuffer);
  const editBuffer = useSessionStore((s) => s.editBuffer);

  const query = trpc.session.getRaw.useQuery(
    { id: id ?? '' },
    { enabled: !!id },
  );

  useEffect(() => {
    if (!query.data) return;
    // Always update the original content reference.
    setOriginalContent(query.data.content);
    // SC6: only seed the editor buffer on first load (when buffer is still empty).
    // Never overwrite unsaved user edits that are already present.
    if (editBuffer === '') {
      setEditBuffer(query.data.content);
    }
  }, [query.data]); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    isLoading: query.isLoading,
    error:     query.error,
  };
}
