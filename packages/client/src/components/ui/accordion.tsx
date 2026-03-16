import * as React from 'react';
import { Accordion as AccordionPrimitive } from '@base-ui/react/accordion';
import { ChevronDownIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

// ─── Root ────────────────────────────────────────────────────────────────────
const Accordion = AccordionPrimitive.Root;

// ─── Item ─────────────────────────────────────────────────────────────────────
const AccordionItem = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Item>
>(({ className, ...props }, ref) => (
  <AccordionPrimitive.Item
    ref={ref}
    className={cn('border-b border-border last:border-0', className)}
    {...props}
  />
));
AccordionItem.displayName = 'AccordionItem';

// ─── Trigger ─────────────────────────────────────────────────────────────────
interface AccordionTriggerProps
  extends React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Trigger> {
  className?: string;
  children?: React.ReactNode;
}

const AccordionTrigger = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Trigger>,
  AccordionTriggerProps
>(({ className, children, ...props }, ref) => (
  <AccordionPrimitive.Header className="flex">
    <AccordionPrimitive.Trigger
      ref={ref}
      className={cn(
        'flex flex-1 items-center justify-between py-3 text-sm font-medium transition-all outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1',
        '[&[data-panel-open]>svg]:rotate-180',
        className,
      )}
      {...props}
    >
      {children}
      <ChevronDownIcon
        className="h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200"
        aria-hidden="true"
      />
    </AccordionPrimitive.Trigger>
  </AccordionPrimitive.Header>
));
AccordionTrigger.displayName = 'AccordionTrigger';

// ─── Content ─────────────────────────────────────────────────────────────────
const AccordionContent = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Panel>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Panel>
>(({ className, children, ...props }, ref) => (
  <AccordionPrimitive.Panel
    ref={ref}
    className={cn(
      'overflow-hidden text-sm',
      'data-[starting-style]:animate-accordion-up data-[ending-style]:animate-accordion-up',
      className,
    )}
    {...props}
  >
    <div className="pb-4">{children}</div>
  </AccordionPrimitive.Panel>
));
AccordionContent.displayName = 'AccordionContent';

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent };
