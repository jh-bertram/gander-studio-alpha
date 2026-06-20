import { useEffect } from 'react';
import { trpc } from '../trpc';
import { useSessionStore } from '../store/session-store';

/**
 * Fetches the raw markdown content of a session by id and seeds the editor store.
 *
 * D3 fix: editBuffer is reset whenever the active session id changes.
 * This prevents the cross-session contamination bug where A->Back->B carried
 * session A's content into B's editor.
 *
 * On id change (before data arrives):
 *   - Calls resetEditBufferForSession() to clear editBuffer, originalContent,
 *     and seededForId. This happens synchronously when `id` changes.
 *
 * On data arrival:
 *   - Always sets originalContent (used for diff / revert).
 *   - SC6: Sets editBuffer ONLY when seededForId !== id (i.e., this is the first
 *     load for this session, or after a session switch). Never overwrites unsaved
 *     user edits already in the store for the SAME session.
 *   - Sets seededForId to the current id after seeding.
 *
 * SC7 (EditorTab.tsx:171-172): editBuffer is NOT cleared on save error.
 * This invariant is preserved because resetEditBufferForSession is only called
 * on session-id CHANGE, never on save error (save error is handled in useSessionSave,
 * which only touches lastSaveError — it never calls resetEditBufferForSession).
 *
 * Returns { isLoading, error } for callers to render loading/error states.
 */
export function useSessionRaw(id: string | null): {
  isLoading: boolean;
  error: unknown;
} {
  const setOriginalContent       = useSessionStore((s) => s.setOriginalContent);
  const setEditBuffer            = useSessionStore((s) => s.setEditBuffer);
  const seededForId              = useSessionStore((s) => s.seededForId);
  const resetEditBufferForSession = useSessionStore((s) => s.resetEditBufferForSession);
  const setSeededForId           = useSessionStore((s) => s.setSeededForId);

  const query = trpc.session.getRaw.useQuery(
    { id: id ?? '' },
    { enabled: !!id },
  );

  // D3: When the session id changes, immediately reset the editor buffers.
  // This clears stale content before the new session's data arrives from the server.
  useEffect(() => {
    if (id !== seededForId) {
      resetEditBufferForSession();
    }
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!query.data || !id) return;
    // Always update the original content reference (used for diff / revert).
    setOriginalContent(query.data.content);
    // SC6 (adapted for D3): Seed the editor buffer only when this session has not
    // yet been seeded (seededForId !== id). After a session switch,
    // resetEditBufferForSession() clears seededForId to null, so this condition
    // is true and the new session's content is correctly seeded.
    // If the user has made edits within the same session, seededForId === id, so
    // we do NOT overwrite their unsaved work (SC6 preserved).
    if (seededForId !== id) {
      setEditBuffer(query.data.content);
      setSeededForId(id);
    }
  }, [query.data]); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    isLoading: query.isLoading,
    error:     query.error,
  };
}
