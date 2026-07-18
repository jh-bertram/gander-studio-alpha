import { useEffect, useLayoutEffect, useRef, type RefObject } from 'react';

/**
 * Deterministic post-mount focus for base-ui Dialog (and Popover) content whose ultimate focus
 * target mounts asynchronously (e.g. behind a loading tRPC query). base-ui resolves
 * `initialFocus` synchronously on a single microtask right after open — BEFORE any
 * async-mounted child exists — so a bare `initialFocus={() => ref.current ?? false}` only wins
 * the rare cache-hit case where the target is already mounted on that first tick. This hook is
 * the deterministic fallback: it focuses `focusTargetRef.current` exactly once per open, the
 * moment `open && ready` both become true, and resets the once-per-open guard when the dialog
 * closes so the next open can focus again. It never re-focuses mid-edit once the initial focus
 * has already landed (e.g. after a save completes and `ready` is unaffected).
 *
 * Hard-defaulted into the shared `ui/dialog` wrapper (`DialogContent`'s `focusTargetRef` /
 * `focusOnReady` props) so future dialogs with an async-mounted focus target get this behavior
 * for free instead of re-deriving it inline — see `prog-studio-v2-2026-07-s5-integration-t1`.
 * Previously hand-rolled directly inside `ReviseSpecAction.tsx` (s3-drilldowns-t3-rem2).
 */
export function useDialogSafeFocus(
  focusTargetRef: RefObject<HTMLElement | null> | undefined,
  ready: boolean | undefined,
  open: boolean | undefined,
): void {
  const hasFocusedOnOpenRef = useRef(false);

  useEffect(() => {
    if (!open) {
      hasFocusedOnOpenRef.current = false;
    }
  }, [open]);

  useLayoutEffect(() => {
    if (
      open &&
      ready &&
      focusTargetRef &&
      !hasFocusedOnOpenRef.current &&
      focusTargetRef.current
    ) {
      focusTargetRef.current.focus();
      hasFocusedOnOpenRef.current = true;
    }
  }, [open, ready, focusTargetRef]);
}
