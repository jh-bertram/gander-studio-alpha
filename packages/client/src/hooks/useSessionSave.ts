import { trpc } from '../trpc';
import { useSessionStore } from '../store/session-store';

/**
 * Wraps trpc.session.saveEdit.useMutation().
 *
 * On success: sets lastSaveResult + clears lastSaveError.
 * On error: sets lastSaveError. Does NOT clear editBuffer (SC7 — buffer survives failed save).
 *
 * Returns the mutation object so callers can invoke mutate({ id, content }).
 */
export function useSessionSave(): {
  mutate: (input: { id: string; content: string }) => void;
  isLoading: boolean;
} {
  const setLastSaveResult = useSessionStore((s) => s.setLastSaveResult);
  const setLastSaveError = useSessionStore((s) => s.setLastSaveError);

  const mutation = trpc.session.saveEdit.useMutation({
    onSuccess: (data) => {
      setLastSaveResult({ filePath: data.filePath });
      setLastSaveError(null);
    },
    onError: (err) => {
      setLastSaveError(err.message ?? String(err));
      // editBuffer intentionally NOT cleared — SC7 requirement.
    },
  });

  return {
    mutate: mutation.mutate,
    isLoading: mutation.isPending,
  };
}
