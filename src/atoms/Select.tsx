import React from 'react';
import { cn } from '../lib/utils';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, leftIcon, rightIcon, children, ...props }, ref) => {
    return (
      <div className="relative">
        {leftIcon && (
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-muted-foreground">
            {leftIcon}
          </div>
        )}
        <select
          className={cn(
            "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2",
            "text-sm ring-offset-background",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            "disabled:cursor-not-allowed disabled:opacity-50",
            { "pl-10": leftIcon },
            { "pr-10": rightIcon },
            className
          )}
          ref={ref}
          {...props}
        >
          {children}
        </select>
        {rightIcon && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-3">
            {rightIcon}
          </div>
        )}
      </div>
    );
  }
); 