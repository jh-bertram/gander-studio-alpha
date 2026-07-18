import * as React from 'react';
import { Dialog as DialogPrimitive } from '@base-ui/react/dialog';
import { cn } from '@/lib/utils';
import { useDialogSafeFocus } from './use-dialog-safe-focus';

const Dialog = DialogPrimitive.Root;

const DialogTrigger = DialogPrimitive.Trigger;

const DialogPortal = DialogPrimitive.Portal;

const DialogClose = DialogPrimitive.Close;

const DialogBackdrop = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Backdrop> & { className?: string }
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Backdrop
    ref={ref}
    className={cn(
      'fixed inset-0 z-50 bg-black/60',
      'data-[starting-style]:opacity-0 data-[ending-style]:opacity-0',
      'transition-opacity duration-200',
      className,
    )}
    {...props}
  />
));
DialogBackdrop.displayName = 'DialogBackdrop';

export interface DialogContentProps
  extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Popup> {
  className?: string;
  /**
   * Safe-focus default (prog-studio-v2-2026-07-s5-integration-t1): the ultimate focus target
   * inside the dialog (e.g. a `<Textarea>` ref). When supplied without an explicit
   * `initialFocus`, the wrapper defaults `initialFocus` to `() => focusTargetRef.current ??
   * false` so base-ui's open-focus microtask lands on it for free whenever it's already mounted
   * (a cache-hit open). Pass an explicit `initialFocus` to opt out of this default.
   */
  focusTargetRef?: React.RefObject<HTMLElement | null>;
  /**
   * True once `focusTargetRef`'s element is ready to receive focus (e.g. `!isLoading &&
   * !loadError`). Combined with `open`, this drives the deterministic once-per-open
   * `useLayoutEffect` fallback for targets that mount asynchronously — see
   * `useDialogSafeFocus`. Requires `focusTargetRef` and `open` to also be supplied; a no-op
   * otherwise.
   */
  focusOnReady?: boolean;
  /**
   * The same controlled `open` value passed to the parent `<Dialog open={...}>`. Only needed to
   * drive `focusOnReady`'s once-per-open reset on close — omit if you don't use `focusOnReady`.
   */
  open?: boolean;
}

const DialogContent = React.forwardRef<HTMLDivElement, DialogContentProps>(
  ({ className, children, focusTargetRef, focusOnReady, open, initialFocus, ...props }, ref) => {
    useDialogSafeFocus(focusTargetRef, focusOnReady, open);

    const resolvedInitialFocus =
      initialFocus ?? (focusTargetRef ? () => focusTargetRef.current ?? false : undefined);

    return (
      <DialogPortal>
        <DialogBackdrop />
        <DialogPrimitive.Popup
          ref={ref}
          initialFocus={resolvedInitialFocus}
          className={cn(
            'fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-xl border border-border bg-card p-6 shadow-xl outline-none',
            'data-[starting-style]:opacity-0 data-[starting-style]:scale-95',
            'data-[ending-style]:opacity-0 data-[ending-style]:scale-95',
            'transition-[opacity,transform] duration-200',
            className,
          )}
          {...props}
        >
          {children}
        </DialogPrimitive.Popup>
      </DialogPortal>
    );
  },
);
DialogContent.displayName = 'DialogContent';

const DialogHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('flex flex-col gap-1.5 text-left mb-4', className)} {...props} />
);
DialogHeader.displayName = 'DialogHeader';

const DialogFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('flex flex-col-reverse sm:flex-row sm:justify-end sm:gap-2 mt-6', className)} {...props} />
);
DialogFooter.displayName = 'DialogFooter';

const DialogTitle = React.forwardRef<
  HTMLHeadingElement,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title> & { className?: string }
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn('text-lg font-semibold leading-none tracking-tight', className)}
    {...props}
  />
));
DialogTitle.displayName = 'DialogTitle';

const DialogDescription = React.forwardRef<
  HTMLParagraphElement,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description> & { className?: string }
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn('text-sm text-muted-foreground', className)}
    {...props}
  />
));
DialogDescription.displayName = 'DialogDescription';

export {
  Dialog,
  DialogTrigger,
  DialogPortal,
  DialogClose,
  DialogBackdrop,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
};
