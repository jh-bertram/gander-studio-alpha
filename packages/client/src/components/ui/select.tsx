import * as React from 'react';
import { Select as SelectPrimitive } from '@base-ui/react/select';
import { cn } from '@/lib/utils';

const Select = SelectPrimitive.Root;

const SelectTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger> & { className?: string }
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Trigger
    ref={ref}
    className={cn(
      'flex h-8 w-full items-center justify-between rounded-lg border border-input bg-transparent px-3 py-1 text-sm text-foreground shadow-xs outline-none transition-[color,box-shadow] disabled:pointer-events-none disabled:opacity-50',
      'focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50',
      className,
    )}
    {...props}
  >
    {children}
  </SelectPrimitive.Trigger>
));
SelectTrigger.displayName = 'SelectTrigger';

const SelectValue = SelectPrimitive.Value;
SelectValue.displayName = 'SelectValue';

const SelectIcon = SelectPrimitive.Icon;
SelectIcon.displayName = 'SelectIcon';

const SelectPortal = SelectPrimitive.Portal;
SelectPortal.displayName = 'SelectPortal';

const SelectPositioner = SelectPrimitive.Positioner;
SelectPositioner.displayName = 'SelectPositioner';

const SelectContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Popup> & { className?: string }
>(({ className, children, ...props }, ref) => (
  <SelectPortal>
    <SelectPositioner sideOffset={4}>
      <SelectPrimitive.Popup
        ref={ref}
        className={cn(
          'z-50 min-w-[8rem] overflow-hidden rounded-lg border border-border bg-popover p-1 text-popover-foreground shadow-md',
          'data-[starting-style]:opacity-0 data-[ending-style]:opacity-0',
          'transition-opacity duration-150',
          className,
        )}
        {...props}
      >
        <SelectPrimitive.ScrollUpArrow />
        <SelectPrimitive.List>
          {children}
        </SelectPrimitive.List>
        <SelectPrimitive.ScrollDownArrow />
      </SelectPrimitive.Popup>
    </SelectPositioner>
  </SelectPortal>
));
SelectContent.displayName = 'SelectContent';

const SelectItem = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item> & { className?: string }
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Item
    ref={ref}
    className={cn(
      'relative flex cursor-default select-none items-center rounded-md py-1.5 pl-8 pr-2 text-sm outline-none',
      'data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground',
      'data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
      className,
    )}
    {...props}
  >
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <SelectPrimitive.ItemIndicator>
        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
      </SelectPrimitive.ItemIndicator>
    </span>
    <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
  </SelectPrimitive.Item>
));
SelectItem.displayName = 'SelectItem';

export {
  Select,
  SelectTrigger,
  SelectValue,
  SelectIcon,
  SelectPortal,
  SelectPositioner,
  SelectContent,
  SelectItem,
};
