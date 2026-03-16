import * as React from 'react';
import { Popover as PopoverPrimitive } from '@base-ui/react/popover';
import { cn } from '@/lib/utils';

// ─── Root ────────────────────────────────────────────────────────────────────
const Popover = PopoverPrimitive.Root;

// ─── Trigger ─────────────────────────────────────────────────────────────────
const PopoverTrigger = PopoverPrimitive.Trigger;

// ─── Portal ──────────────────────────────────────────────────────────────────
const PopoverPortal = PopoverPrimitive.Portal;

// ─── Positioner ──────────────────────────────────────────────────────────────
const PopoverPositioner = PopoverPrimitive.Positioner;

// ─── Content (Popup) ─────────────────────────────────────────────────────────
interface PopoverContentProps extends React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Popup> {
  className?: string;
  align?: 'start' | 'center' | 'end';
  side?: 'top' | 'bottom' | 'left' | 'right';
  sideOffset?: number;
}

const PopoverContent = React.forwardRef<HTMLDivElement, PopoverContentProps>(
  ({ className, sideOffset: _sideOffset, align: _align, side: _side, ...props }, ref) => (
    <PopoverPortal>
      <PopoverPositioner>
        <PopoverPrimitive.Popup
          ref={ref}
          className={cn(
            'z-50 rounded-xl border border-border bg-popover text-popover-foreground shadow-lg outline-none',
            'data-[starting-style]:opacity-0 data-[starting-style]:scale-95',
            'data-[ending-style]:opacity-0 data-[ending-style]:scale-95',
            'transition-[opacity,transform] duration-150',
            className,
          )}
          {...props}
        />
      </PopoverPositioner>
    </PopoverPortal>
  ),
);
PopoverContent.displayName = 'PopoverContent';

// ─── Arrow ────────────────────────────────────────────────────────────────────
const PopoverArrow = PopoverPrimitive.Arrow;

// ─── Close ────────────────────────────────────────────────────────────────────
const PopoverClose = PopoverPrimitive.Close;

export {
  Popover,
  PopoverTrigger,
  PopoverPortal,
  PopoverPositioner,
  PopoverContent,
  PopoverArrow,
  PopoverClose,
};
