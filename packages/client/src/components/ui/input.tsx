import * as React from 'react';
import { Input as InputPrimitive } from '@base-ui/react/input';
import { cn } from '@/lib/utils';

type InputProps = React.ComponentPropsWithoutRef<typeof InputPrimitive> & {
  className?: string;
};

const Input = React.forwardRef<HTMLElement, InputProps>(
  ({ className, ...props }, ref) => {
    return (
      <InputPrimitive
        ref={ref}
        className={cn(
          'flex h-8 w-full rounded-lg border border-input bg-transparent px-3 py-1 text-sm text-foreground shadow-xs outline-none transition-[color,box-shadow] placeholder:text-muted-foreground disabled:pointer-events-none disabled:opacity-50 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50',
          className,
        )}
        {...props}
      />
    );
  },
);
Input.displayName = 'Input';

export { Input };
export type { InputProps };
